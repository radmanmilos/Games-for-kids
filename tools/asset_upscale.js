/* asset_upscale.js — bring a picture to the family canvas without redrawing it.
 *
 * Some approved bundle files are small (165-305 px emoji rasters, an 800 px bear).
 * The family standard is a 1024x1024 picture on the warm paper tone. This tool
 * resamples the SAME pixels with a Lanczos-3 kernel, keeps the aspect ratio and
 * centres the result on a square canvas that is padded with the picture's own
 * background colour. It never repaints, recolours, crops or sharpens: if the
 * source is small, the result is a smooth enlargement of that source, not new art.
 *
 * Usage:
 *   node tools/asset_upscale.js <file.png ...> [--size 1024] [--suffix _1] [--out-dir <dir>]
 *
 * Writes <name><suffix>.png next to each input unless --out-dir is given; the
 * originals are never modified.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { decodePng, encodePng, toRgba } = require('./lib/png.js');

const LANCZOS_A = 3;

function lanczos(x) {
  if (x === 0) return 1;
  if (x <= -LANCZOS_A || x >= LANCZOS_A) return 0;
  const px = Math.PI * x;
  return (LANCZOS_A * Math.sin(px) * Math.sin(px / LANCZOS_A)) / (px * px);
}

/** Precomputed source indices + normalised weights for one axis. */
function contributions(srcLength, dstLength) {
  const scale = srcLength / dstLength;
  const filterScale = Math.max(1, scale);
  const rows = [];
  for (let i = 0; i < dstLength; i++) {
    const center = (i + 0.5) * scale - 0.5;
    const support = LANCZOS_A * filterScale;
    const start = Math.max(0, Math.floor(center - support));
    const end = Math.min(srcLength - 1, Math.ceil(center + support));
    const weights = [];
    let total = 0;
    for (let j = start; j <= end; j++) {
      const w = lanczos((j - center) / filterScale);
      weights.push(w);
      total += w;
    }
    // A flat run of huge upscaling can land between two whole-pixel weights; fall back
    // to the nearest source pixel rather than dividing by (almost) zero.
    if (Math.abs(total) < 1e-6) {
      const nearest = Math.min(srcLength - 1, Math.max(0, Math.round(center)));
      rows.push({ start: nearest, weights: [1] });
    } else {
      rows.push({ start, weights: weights.map((w) => w / total) });
    }
  }
  return rows;
}

/** Lanczos-3 resample in premultiplied alpha, so edges do not bleed dark. */
function resample(src, dstWidth, dstHeight) {
  const pixels = toRgba(src).pixels;
  const rgba = new Float32Array(src.width * src.height * 4);
  for (let i = 0; i < src.width * src.height; i++) {
    const a = pixels[i * 4 + 3] / 255;
    rgba[i * 4] = pixels[i * 4] * a;
    rgba[i * 4 + 1] = pixels[i * 4 + 1] * a;
    rgba[i * 4 + 2] = pixels[i * 4 + 2] * a;
    rgba[i * 4 + 3] = a;
  }

  const cols = contributions(src.width, dstWidth);
  const rows = contributions(src.height, dstHeight);
  const horizontal = new Float32Array(dstWidth * src.height * 4);
  for (let y = 0; y < src.height; y++) {
    for (let x = 0; x < dstWidth; x++) {
      const { start, weights } = cols[x];
      let r = 0, g = 0, b = 0, a = 0;
      for (let k = 0; k < weights.length; k++) {
        const si = (y * src.width + start + k) * 4;
        const w = weights[k];
        r += rgba[si] * w;
        g += rgba[si + 1] * w;
        b += rgba[si + 2] * w;
        a += rgba[si + 3] * w;
      }
      const di = (y * dstWidth + x) * 4;
      horizontal[di] = r;
      horizontal[di + 1] = g;
      horizontal[di + 2] = b;
      horizontal[di + 3] = a;
    }
  }

  const out = Buffer.alloc(dstWidth * dstHeight * 4);
  for (let y = 0; y < dstHeight; y++) {
    const { start, weights } = rows[y];
    for (let x = 0; x < dstWidth; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let k = 0; k < weights.length; k++) {
        const si = ((start + k) * dstWidth + x) * 4;
        const w = weights[k];
        r += horizontal[si] * w;
        g += horizontal[si + 1] * w;
        b += horizontal[si + 2] * w;
        a += horizontal[si + 3] * w;
      }
      const di = (y * dstWidth + x) * 4;
      const alpha = Math.max(0, Math.min(1, a));
      if (alpha > 0) {
        out[di] = Math.max(0, Math.min(255, Math.round(r / alpha)));
        out[di + 1] = Math.max(0, Math.min(255, Math.round(g / alpha)));
        out[di + 2] = Math.max(0, Math.min(255, Math.round(b / alpha)));
      }
      out[di + 3] = Math.round(alpha * 255);
    }
  }
  return { width: dstWidth, height: dstHeight, channels: 4, pixels: out };
}

/** Fit the resampled picture inside a square canvas padded with its own background. */
function fitSquare(image, source, size) {
  const scale = Math.min(size / image.width, size / image.height);
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const scaled = (width === image.width && height === image.height) ? image : resample(image, width, height);

  const cornerAlpha = source.channels === 4 ? source.pixels[3] : 255;
  const opaque = cornerAlpha === 255;
  const bg = opaque ? [source.pixels[0], source.pixels[1], source.pixels[2]] : [0, 0, 0];
  const canvas = Buffer.alloc(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    canvas[i * 4] = bg[0];
    canvas[i * 4 + 1] = bg[1];
    canvas[i * 4 + 2] = bg[2];
    canvas[i * 4 + 3] = opaque ? 255 : 0;
  }

  const left = Math.floor((size - width) / 2);
  const top = Math.floor((size - height) / 2);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const si = (y * width + x) * 4;
      const di = ((top + y) * size + left + x) * 4;
      const a = scaled.pixels[si + 3] / 255;
      if (a === 0) continue;
      if (a === 1) {
        canvas[di] = scaled.pixels[si];
        canvas[di + 1] = scaled.pixels[si + 1];
        canvas[di + 2] = scaled.pixels[si + 2];
        canvas[di + 3] = 255;
      } else {
        canvas[di] = Math.round(scaled.pixels[si] * a + canvas[di] * (1 - a));
        canvas[di + 1] = Math.round(scaled.pixels[si + 1] * a + canvas[di + 1] * (1 - a));
        canvas[di + 2] = Math.round(scaled.pixels[si + 2] * a + canvas[di + 2] * (1 - a));
        canvas[di + 3] = Math.round(255 * (a + (canvas[di + 3] / 255) * (1 - a)));
      }
    }
  }
  return { width: size, height: size, channels: opaque ? 3 : 4, pixels: opaque ? stripAlpha(canvas) : canvas };
}

function stripAlpha(rgba) {
  const rgb = Buffer.alloc((rgba.length / 4) * 3);
  for (let i = 0; i < rgba.length / 4; i++) {
    rgb[i * 3] = rgba[i * 4];
    rgb[i * 3 + 1] = rgba[i * 4 + 1];
    rgb[i * 3 + 2] = rgba[i * 4 + 2];
  }
  return rgb;
}

function parseArgs(argv) {
  const options = { files: [], size: 1024, suffix: '_1', outDir: null };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--size') options.size = Number(argv[++i]);
    else if (arg === '--suffix') options.suffix = argv[++i];
    else if (arg === '--out-dir') options.outDir = argv[++i];
    else if (arg.startsWith('--')) throw new Error(`Unknown argument ${arg}`);
    else options.files.push(arg);
  }
  if (!options.files.length) throw new Error('Give at least one .png file');
  if (!Number.isInteger(options.size) || options.size < 64) throw new Error('--size must be an integer >= 64');
  return options;
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  for (const file of options.files) {
    const source = decodePng(fs.readFileSync(file));
    const fitted = fitSquare(resample(source, source.width, source.height), source, options.size);
    const dir = options.outDir || path.dirname(file);
    const base = path.basename(file, path.extname(file));
    const out = path.join(dir, `${base}${options.suffix}.png`);
    fs.writeFileSync(out, encodePng(fitted.width, fitted.height, fitted.pixels, fitted.channels));
    console.log(`${path.basename(file)} ${source.width}x${source.height} -> ${path.basename(out)} ${fitted.width}x${fitted.height}`);
  }
}

main();
