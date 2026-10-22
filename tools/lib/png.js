/* lib/png.js — dependency-free PNG decode / encode / resize / stats for the asset pipeline.
 *
 * Why this exists: the asset generation workflow needs three things the repo had no
 * helper for — (1) read real pixel data (alpha coverage, edge haze, palette) so the
 * technical QA in ASSET_INVENTORY.md stops being guesswork, (2) downscale the approved
 * reference images below the 512x512 input limit of the image API without introducing
 * dark halos, and (3) write a PNG back out. Node's zlib does the compression; nothing
 * else is needed and no dependency is added to the repo.
 *
 * The decoder mirrors the proven semantics of tools/visual_compare.js (CRC-checked
 * chunks, PNG filter types 0-4, 8-bit depth, non-interlaced). This file stays separate
 * so the screenshot gate tool keeps its own self-contained implementation.
 *
 * Usage: node tools/lib/png.js --selftest
 */
'use strict';
const fs = require('fs');
const zlib = require('zlib');

const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

const CRC_TABLE = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  CRC_TABLE[n] = c >>> 0;
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = (CRC_TABLE[(crc ^ byte) & 0xff]) ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const name = Buffer.from(type, 'ascii');
  const body = Buffer.concat([name, data]);
  const chunk = Buffer.alloc(data.length + 12);
  chunk.writeUInt32BE(data.length, 0);
  body.copy(chunk, 4);
  chunk.writeUInt32BE(crc32(body), data.length + 8);
  return chunk;
}

const CHANNELS = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 };

/** Decode a PNG buffer or file path into {width, height, channels, pixels}. */
function decodePng(input) {
  const png = Buffer.isBuffer(input) ? input : fs.readFileSync(input);
  // Errors must name the file, never the raw bytes.
  const label = Buffer.isBuffer(input) ? 'the PNG buffer' : input;
  if (png.length < 33 || !png.subarray(0, 8).equals(PNG_SIGNATURE)) {
    throw new Error(`${label} is not a valid PNG`);
  }
  let width, height, bitDepth, colorType, interlace, palette;
  const compressed = [];
  for (let offset = 8; offset + 12 <= png.length;) {
    const length = png.readUInt32BE(offset);
    const type = png.toString('ascii', offset + 4, offset + 8);
    const end = offset + 12 + length;
    if (end > png.length) throw new Error(`${label} has a truncated ${type} chunk`);
    const expectedCrc = png.readUInt32BE(offset + 8 + length);
    const actualCrc = crc32(png.subarray(offset + 4, offset + 8 + length));
    if (expectedCrc !== actualCrc) throw new Error(`${label} has a bad ${type} chunk checksum`);
    const data = png.subarray(offset + 8, offset + 8 + length);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
      interlace = data[12];
    } else if (type === 'PLTE') {
      palette = data;
    } else if (type === 'IDAT') {
      compressed.push(data);
    } else if (type === 'IEND') {
      break;
    }
    offset = end;
  }
  if (!width || !height) throw new Error(`${label} is missing PNG dimensions`);
  if (bitDepth !== 8 || interlace !== 0) {
    throw new Error(`${label} uses unsupported PNG format (bitDepth=${bitDepth}, interlace=${interlace})`);
  }
  if (!CHANNELS[colorType]) throw new Error(`${label} uses unsupported PNG color type ${colorType}`);
  const channels = CHANNELS[colorType];
  const stride = width * channels;
  let raw;
  try {
    raw = zlib.inflateSync(Buffer.concat(compressed));
  } catch (error) {
    // The zlib message embeds the damaged bytes; keep the report readable.
    throw new Error(`${label} has damaged compressed image data (${error.code || 'inflate failed'})`);
  }
  if (raw.length !== (stride + 1) * height) throw new Error(`${label} has unexpected decoded PNG size`);
  const pixels = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const input2 = y * (stride + 1) + 1;
    const row = y * stride;
    for (let x = 0; x < stride; x++) {
      const left = x >= channels ? pixels[row + x - channels] : 0;
      const above = y > 0 ? pixels[row - stride + x] : 0;
      const upperLeft = y > 0 && x >= channels ? pixels[row - stride + x - channels] : 0;
      let predictor = 0;
      if (filter === 1) predictor = left;
      else if (filter === 2) predictor = above;
      else if (filter === 3) predictor = Math.floor((left + above) / 2);
      else if (filter === 4) {
        const p = left + above - upperLeft;
        const pa = Math.abs(p - left), pb = Math.abs(p - above), pc = Math.abs(p - upperLeft);
        predictor = pa <= pb && pa <= pc ? left : (pb <= pc ? above : upperLeft);
      } else if (filter !== 0) {
        throw new Error(`${label} uses invalid PNG filter ${filter}`);
      }
      pixels[row + x] = (raw[input2 + x] + predictor) & 0xff;
    }
  }
  if (colorType === 3) {
    // Expand a palette image to RGB.
    const out = Buffer.alloc(width * height * 3);
    for (let i = 0; i < width * height; i++) {
      const idx = pixels[i] * 3;
      out[i * 3] = palette[idx];
      out[i * 3 + 1] = palette[idx + 1];
      out[i * 3 + 2] = palette[idx + 2];
    }
    return { width, height, channels: 3, pixels: out };
  }
  return { width, height, channels, pixels };
}

/** Encode raw pixels (3 or 4 channels per pixel) as a PNG buffer. */
function encodePng(width, height, pixels, channels) {
  if (channels !== 3 && channels !== 4) throw new Error(`encodePng needs 3 or 4 channels, got ${channels}`);
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = channels === 4 ? 6 : 2;
  const stride = width * channels;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0;
    pixels.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  return Buffer.concat([
    PNG_SIGNATURE,
    pngChunk('IHDR', header),
    pngChunk('IDAT', zlib.deflateSync(raw)),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

/** Normalise any decoded image to 4-channel RGBA. */
function toRgba(image) {
  if (image.channels === 4) return image;
  const out = Buffer.alloc(image.width * image.height * 4);
  for (let i = 0; i < image.width * image.height; i++) {
    const src = i * image.channels;
    out[i * 4] = image.pixels[src];
    out[i * 4 + 1] = image.channels === 1 ? image.pixels[src] : image.pixels[src + 1];
    out[i * 4 + 2] = image.channels === 1 ? image.pixels[src] : image.pixels[src + 2];
    out[i * 4 + 3] = 255;
  }
  return { width: image.width, height: image.height, channels: 4, pixels: out };
}

/** Box-filter resize with premultiplied alpha, so transparent edges do not bleed dark. */
function resizeRgba(image, targetWidth, targetHeight) {
  const src = toRgba(image);
  const out = Buffer.alloc(targetWidth * targetHeight * 4);
  const scaleX = src.width / targetWidth;
  const scaleY = src.height / targetHeight;
  for (let y = 0; y < targetHeight; y++) {
    const y0 = Math.floor(y * scaleY);
    const y1 = Math.max(y0 + 1, Math.min(src.height, Math.ceil((y + 1) * scaleY)));
    for (let x = 0; x < targetWidth; x++) {
      const x0 = Math.floor(x * scaleX);
      const x1 = Math.max(x0 + 1, Math.min(src.width, Math.ceil((x + 1) * scaleX)));
      let r = 0, g = 0, b = 0, a = 0, count = 0;
      for (let sy = y0; sy < y1; sy++) {
        for (let sx = x0; sx < x1; sx++) {
          const i = (sy * src.width + sx) * 4;
          const alpha = src.pixels[i + 3] / 255;
          r += src.pixels[i] * alpha;
          g += src.pixels[i + 1] * alpha;
          b += src.pixels[i + 2] * alpha;
          a += alpha;
          count++;
        }
      }
      const o = (y * targetWidth + x) * 4;
      if (a > 0) {
        out[o] = Math.round(r / a);
        out[o + 1] = Math.round(g / a);
        out[o + 2] = Math.round(b / a);
      }
      out[o + 3] = Math.round((a / count) * 255);
    }
  }
  return { width: targetWidth, height: targetHeight, channels: 4, pixels: out };
}

/** Alpha coverage: how much of the canvas is opaque, transparent, or a translucent haze. */
function alphaStats(image) {
  const rgba = toRgba(image);
  const total = rgba.width * rgba.height;
  let opaque = 0, transparent = 0, partial = 0;
  for (let i = 0; i < total; i++) {
    const a = rgba.pixels[i * 4 + 3];
    if (a === 255) opaque++;
    else if (a === 0) transparent++;
    else partial++;
  }
  return {
    total,
    opaque,
    transparent,
    partial,
    opaquePct: round((opaque / total) * 100),
    transparentPct: round((transparent / total) * 100),
    partialPct: round((partial / total) * 100),
  };
}

/** Corner and border pixels: a quick read on whether the background is clean. */
function borderStats(image, frame = 3) {
  const rgba = toRgba(image);
  const cornerAlpha = [
    rgba.pixels[3],
    rgba.pixels[(rgba.width - 1) * 4 + 3],
    rgba.pixels[((rgba.height - 1) * rgba.width) * 4 + 3],
    rgba.pixels[((rgba.height - 1) * rgba.width + rgba.width - 1) * 4 + 3],
  ];
  let sum = 0, count = 0, min = 255, max = 0;
  const visit = (x, y) => {
    const a = rgba.pixels[(y * rgba.width + x) * 4 + 3];
    sum += a; count++;
    if (a < min) min = a;
    if (a > max) max = a;
  };
  for (let y = 0; y < frame; y++) {
    for (let x = 0; x < rgba.width; x++) { visit(x, y); visit(x, rgba.height - 1 - y); }
  }
  for (let x = 0; x < frame; x++) {
    for (let y = 0; y < rgba.height; y++) { visit(x, y); visit(rgba.width - 1 - x, y); }
  }
  return { cornerAlpha, borderMeanAlpha: round(sum / count), borderMinAlpha: min, borderMaxAlpha: max };
}

/**
 * 4-bit-per-channel colour histogram plus mean colour, used to compare art direction.
 * The whole frame is measured on purpose: in this bundle the shared cream paper
 * background and the warm muted palette are part of what makes the family look
 * alike, so excluding the background would hide the very signal we compare on.
 */
function paletteStats(image) {
  const rgba = toRgba(image);
  const bins = new Array(4096).fill(0);
  let r = 0, g = 0, b = 0, count = 0;
  for (let i = 0; i < rgba.width * rgba.height; i++) {
    const alpha = rgba.pixels[i * 4 + 3];
    if (alpha < 32) continue;
    const rr = rgba.pixels[i * 4], gg = rgba.pixels[i * 4 + 1], bb = rgba.pixels[i * 4 + 2];
    r += rr; g += gg; b += bb; count++;
    bins[(rr >> 4) * 256 + (gg >> 4) * 16 + (bb >> 4)]++;
  }
  const mean = count ? [round(r / count), round(g / count), round(b / count)] : [0, 0, 0];
  // L1 normalisation: the histogram sums to 1, so the intersection of a palette with
  // itself is exactly 1.
  const norm = count || 1;
  return { mean, histogram: bins.map((v) => v / norm) };
}

/**
 * Similarity of two palettes: histogram intersection (sum of the per-bin minima of the
 * normalised histograms). Chosen over cosine because a picture with a large flat
 * background would otherwise score near zero against everything else.
 */
function paletteSimilarity(a, b) {
  let shared = 0;
  for (let i = 0; i < a.histogram.length; i++) {
    shared += Math.min(a.histogram[i], b.histogram[i]);
  }
  return round(shared, 4);
}

/**
 * Legibility proxy at card size: downscale to a small canvas and measure how much of
 * the frame differs from the border colour. A subject that collapses at small size
 * produces a low contrast ratio.
 */
function smallSizeContrast(image, size = 64) {
  const small = resizeRgba(image, size, size);
  let r = 0, g = 0, b = 0;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      r += small.pixels[i]; g += small.pixels[i + 1]; b += small.pixels[i + 2];
    }
  }
  const total = size * size;
  const bg = [r / total, g / total, b / total];
  let contrast = 0, counted = 0;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const d = Math.abs(small.pixels[i] - bg[0]) + Math.abs(small.pixels[i + 1] - bg[1]) + Math.abs(small.pixels[i + 2] - bg[2]);
      contrast += d;
      counted++;
    }
  }
  return round(contrast / counted, 2);
}

function round(value, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

module.exports = {
  decodePng,
  encodePng,
  toRgba,
  resizeRgba,
  alphaStats,
  borderStats,
  paletteStats,
  paletteSimilarity,
  smallSizeContrast,
  round,
};

if (require.main === module) {
  // Self-test: encode -> decode must round-trip, resize must keep the frame and alpha.
  const failures = [];
  const src = { width: 4, height: 3, channels: 4 };
  src.pixels = Buffer.alloc(4 * 3 * 4);
  for (let i = 0; i < 12; i++) {
    src.pixels[i * 4] = i * 7;
    src.pixels[i * 4 + 1] = 255 - i * 5;
    src.pixels[i * 4 + 2] = 30;
    src.pixels[i * 4 + 3] = i % 2 ? 0 : 255;
  }
  const encoded = encodePng(src.width, src.height, src.pixels, 4);
  const decoded = decodePng(encoded);
  if (decoded.width !== src.width || decoded.height !== src.height) failures.push('round-trip dimensions differ');
  if (!decoded.pixels.equals(src.pixels)) failures.push('round-trip pixels differ');
  const resized = resizeRgba(decoded, 2, 2);
  if (resized.width !== 2 || resized.height !== 2) failures.push('resize dimensions wrong');
  const stats = alphaStats(decoded);
  if (stats.opaque + stats.transparent + stats.partial !== 12) failures.push('alpha stats do not add up');
  if (paletteSimilarity(paletteStats(decoded), paletteStats(decoded)) !== 1) failures.push('palette similarity is not 1 for itself');
  if (failures.length) {
    for (const f of failures) console.error('PNG SELFTEST FAIL: ' + f);
    process.exit(1);
  }
  console.log('PNG lib selftest OK (round-trip, resize, alpha, palette).');
}
