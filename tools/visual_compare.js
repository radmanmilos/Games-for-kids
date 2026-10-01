/* Compare decoded screenshot pixels with reviewed visual baselines.
 * Usage: node tools/visual_compare.js [--pages hub,animals] [--sizes desktop] [--approve-baseline] */
const { execFileSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { all: registryAll } = require('./registry.js');

const ROOT = path.resolve(__dirname, '..');
const CURRENT = path.join(__dirname, 'screenshots', 'current');
const DIFFS = path.join(__dirname, 'screenshots', 'diff');
const BASELINES = path.join(ROOT, 'resources', 'visual-baselines');
const SCREENSHOT_TOOL = path.join(__dirname, 'screenshot.js');
const PAGES = ['hub', ...registryAll().filter(app => app.screenshot).map(app => app.id)];
const SIZES = [
  'phone-portrait',
  'phone-landscape',
  'tablet-portrait',
  'tablet-landscape',
  'desktop',
];
const DEFAULT_PIXEL_DELTA = 16;
const THRESHOLD_PERCENT = 0.1;

const CRC_TABLE = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  CRC_TABLE[n] = c >>> 0;
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
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

function decodePng(file) {
  const png = Buffer.isBuffer(file) ? file : fs.readFileSync(file);
  if (png.length < 33 || !png.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
    throw new Error(`${file} is not a valid PNG`);
  }
  let width, height, bitDepth, colorType, interlace;
  const compressed = [];
  for (let offset = 8; offset + 12 <= png.length;) {
    const length = png.readUInt32BE(offset);
    const type = png.toString('ascii', offset + 4, offset + 8);
    const end = offset + 12 + length;
    if (end > png.length) throw new Error(`${file} has a truncated ${type} chunk`);
    const expectedCrc = png.readUInt32BE(offset + 8 + length);
    const actualCrc = crc32(png.subarray(offset + 4, offset + 8 + length));
    if (expectedCrc !== actualCrc) throw new Error(`${file} has a bad ${type} chunk checksum`);
    const data = png.subarray(offset + 8, offset + 8 + length);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
      interlace = data[12];
    } else if (type === 'IDAT') {
      compressed.push(data);
    } else if (type === 'IEND') {
      break;
    }
    offset = end;
  }
  if (!width || !height) throw new Error(`${file} is missing PNG dimensions`);
  if (bitDepth !== 8 || ![2, 6].includes(colorType) || interlace !== 0) {
    throw new Error(`${file} uses unsupported PNG format (bitDepth=${bitDepth}, colorType=${colorType}, interlace=${interlace})`);
  }
  const channels = colorType === 6 ? 4 : 3;
  const stride = width * channels;
  const raw = zlib.inflateSync(Buffer.concat(compressed));
  if (raw.length !== (stride + 1) * height) throw new Error(`${file} has unexpected decoded PNG size`);
  const pixels = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const input = y * (stride + 1) + 1;
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
        throw new Error(`${file} uses invalid PNG filter ${filter}`);
      }
      pixels[row + x] = (raw[input + x] + predictor) & 0xff;
    }
  }
  return { width, height, channels, pixels };
}

function encodePng(width, height, rgb) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 2;
  const stride = width * 3;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0;
    rgb.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk('IHDR', header),
    pngChunk('IDAT', zlib.deflateSync(raw)),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

function sideBySideDiff(baseline, current) {
  const width = baseline.width + current.width;
  const height = Math.max(baseline.height, current.height);
  const rgb = Buffer.alloc(width * height * 3, 32);
  for (const [image, left] of [[baseline, 0], [current, baseline.width]]) {
    for (let y = 0; y < image.height; y++) {
      for (let x = 0; x < image.width; x++) {
        const from = (y * image.width + x) * image.channels;
        const to = (y * width + left + x) * 3;
        rgb[to] = image.pixels[from];
        rgb[to + 1] = image.pixels[from + 1];
        rgb[to + 2] = image.pixels[from + 2];
      }
    }
  }
  for (let y = 0; y < height; y++) {
    const offset = (y * width + baseline.width) * 3;
    rgb[offset] = 255;
    rgb[offset + 1] = 210;
    rgb[offset + 2] = 0;
  }
  return encodePng(width, height, rgb);
}

function comparePixels(baseline, current, pixelDelta) {
  if (baseline.width !== current.width || baseline.height !== current.height) {
    return {
      error: `dimensions differ (${baseline.width}x${baseline.height} vs ${current.width}x${current.height})`,
      diffPng: sideBySideDiff(baseline, current),
    };
  }
  const pixelCount = baseline.width * baseline.height;
  const diff = Buffer.alloc(pixelCount * 3);
  let changed = 0, totalDelta = 0;
  for (let i = 0; i < pixelCount; i++) {
    const oldOffset = i * baseline.channels;
    const newOffset = i * current.channels;
    const d = [0, 1, 2].map(channel =>
      Math.abs(baseline.pixels[oldOffset + channel] - current.pixels[newOffset + channel]));
    const maxDelta = Math.max(...d);
    if (maxDelta > pixelDelta) changed++;
    totalDelta += d[0] + d[1] + d[2];
    const diffOffset = i * 3;
    if (maxDelta > pixelDelta) {
      diff[diffOffset] = 255;
      diff[diffOffset + 1] = Math.max(0, 64 - maxDelta);
    } else {
      const gray = Math.round((current.pixels[newOffset] + current.pixels[newOffset + 1] + current.pixels[newOffset + 2]) / 12);
      diff[diffOffset] = gray;
      diff[diffOffset + 1] = gray;
      diff[diffOffset + 2] = gray;
    }
  }
  return {
    changedPercent: changed * 100 / pixelCount,
    averageChannelDelta: totalDelta / (pixelCount * 3),
    diffPng: encodePng(baseline.width, baseline.height, diff),
  };
}

function parseArgs() {
  const args = process.argv.slice(2);
  const approveBaseline = args.includes('--approve-baseline');
  const pagesArg = args.find(arg => arg.startsWith('--pages='));
  const sizesArg = args.find(arg => arg.startsWith('--sizes='));
  const unknown = args.filter(arg =>
    arg !== '--approve-baseline' && !arg.startsWith('--pages=') && !arg.startsWith('--sizes='));
  if (unknown.length) throw new Error(`Unknown argument(s): ${unknown.join(', ')}`);
  return {
    approveBaseline,
    pages: pagesArg ? pagesArg.slice(8).split(',') : PAGES,
    sizes: sizesArg ? sizesArg.slice(8).split(',') : SIZES,
  };
}

function runCapture(pages, sizes) {
  const capture = spawnSync(process.execPath, [
    SCREENSHOT_TOOL,
    `--pages=${pages.join(',')}`,
    `--sizes=${sizes.join(',')}`,
  ], { cwd: ROOT, stdio: 'inherit' });
  if (capture.error) throw capture.error;
  if (capture.status !== 0) throw new Error(`Screenshot capture failed with exit code ${capture.status}`);
}

function readCurrentManifest() {
  const file = path.join(CURRENT, 'capture-manifest.json');
  if (!fs.existsSync(file)) throw new Error(`Missing capture metadata: ${file}`);
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (data.schemaVersion !== 1 || !Array.isArray(data.screenshots)
      || !Array.isArray(data.pageSet) || !data.viewports || !data.browser) {
    throw new Error(`Unsupported capture metadata in ${file}`);
  }
  const expected = new Set(data.pageSet.flatMap(page =>
    Object.keys(data.viewports).map(size => `${page}_${size}.png`)));
  const actual = data.screenshots.map(item => item.file);
  if (expected.size !== actual.length || new Set(actual).size !== actual.length
      || actual.some(name => !expected.has(name))) {
    throw new Error(`Capture metadata image list does not match its page/viewports`);
  }
  return data;
}

function saveBaseline(manifest) {
  const approvedPages = PAGES.slice().sort();
  const approvedSizes = SIZES.slice().sort();
  if (manifest.pageSet.slice().sort().join(',') !== approvedPages.join(',')) {
    throw new Error('Baseline approval requires the complete registered page set');
  }
  if (Object.keys(manifest.viewports).sort().join(',') !== approvedSizes.join(',')) {
    throw new Error('Baseline approval requires all five standard viewports');
  }
  const expectedFiles = new Set(PAGES.flatMap(page => SIZES.map(size => `${page}_${size}.png`)));
  if (manifest.screenshots.length !== expectedFiles.size
      || new Set(manifest.screenshots.map(item => item.file)).size !== expectedFiles.size
      || manifest.screenshots.some(item => !expectedFiles.has(item.file))) {
    throw new Error('Baseline approval requires all 85 page/viewport screenshots');
  }
  if (!manifest.commitSha || !manifest.browser.product || !manifest.browser.userAgent) {
    throw new Error('Baseline approval requires commit and browser identity metadata');
  }
  fs.mkdirSync(BASELINES, { recursive: true });
  for (const item of manifest.screenshots) {
    fs.copyFileSync(path.join(CURRENT, item.file), path.join(BASELINES, item.file));
  }
  const metadata = {
    ...manifest,
    approvedAt: new Date().toISOString(),
    approvedBy: 'explicit --approve-baseline invocation',
  };
  fs.writeFileSync(path.join(BASELINES, 'manifest.json'), JSON.stringify(metadata, null, 2) + '\n');
  console.log(`Approved ${manifest.screenshots.length} baseline images at ${BASELINES}`);
}

function compare(manifest) {
  const baselineFile = path.join(BASELINES, 'manifest.json');
  if (!fs.existsSync(baselineFile)) {
    throw new Error(`No visual baseline found. Review the captures, then explicitly run: node tools/visual_compare.js --approve-baseline`);
  }
  const baselineManifest = JSON.parse(fs.readFileSync(baselineFile, 'utf8'));
  if (baselineManifest.schemaVersion !== 1 || !Array.isArray(baselineManifest.screenshots)
      || !baselineManifest.viewports) {
    throw new Error(`Unsupported baseline metadata in ${baselineFile}`);
  }
  const expected = new Set(manifest.screenshots.map(item => item.file));
  const stored = new Set(baselineManifest.screenshots.map(item => item.file));
  const missing = [...expected].filter(file => !stored.has(file));
  if (missing.length) throw new Error(`Baseline is missing images: ${missing.join(', ')}`);
  for (const [size, viewport] of Object.entries(manifest.viewports)) {
    if (JSON.stringify(viewport) !== JSON.stringify(baselineManifest.viewports[size])) {
      throw new Error(`Capture viewport metadata differs from the approved baseline for ${size}`);
    }
  }
  fs.rmSync(DIFFS, { recursive: true, force: true });
  fs.mkdirSync(DIFFS, { recursive: true });
  const failures = [];
  for (const item of manifest.screenshots) {
    const baseline = decodePng(path.join(BASELINES, item.file));
    const current = decodePng(path.join(CURRENT, item.file));
    const diffFile = path.join(DIFFS, item.file);
    const result = comparePixels(baseline, current, DEFAULT_PIXEL_DELTA);
    if (result.error) {
      fs.writeFileSync(diffFile, result.diffPng);
      failures.push(`${item.file}: ${result.error}`);
      console.error(`FAIL ${item.file}: ${result.error}`);
    } else {
      const pass = result.changedPercent <= THRESHOLD_PERCENT;
      console.log(`${pass ? 'PASS' : 'FAIL'} ${item.file}: ${result.changedPercent.toFixed(4)}% changed, average channel delta ${result.averageChannelDelta.toFixed(4)}${pass ? '' : ` (limit ${THRESHOLD_PERCENT}%)`}`);
      if (!pass) {
        fs.writeFileSync(diffFile, result.diffPng);
        failures.push(`${item.file}: ${result.changedPercent.toFixed(4)}% changed; diff: ${diffFile}`);
      }
    }
  }
  console.log(`\nCompared ${manifest.screenshots.length} images; ${failures.length} failed. Baseline commit ${baselineManifest.commitSha}, current commit ${manifest.commitSha}.`);
  if (failures.length) throw new Error(`Visual comparison failed. Inspect diff images in ${DIFFS}`);
}

if (require.main === module) {
  (async () => {
    const options = parseArgs();
    const knownPages = new Set(PAGES), knownSizes = new Set(SIZES);
    const invalidPages = options.pages.filter(page => !knownPages.has(page));
    const invalidSizes = options.sizes.filter(size => !knownSizes.has(size));
    if (invalidPages.length || invalidSizes.length || !options.pages.length || !options.sizes.length) {
      throw new Error(`Invalid selection. Pages: ${invalidPages.join(', ') || 'ok'}; viewports: ${invalidSizes.join(', ') || 'ok'}`);
    }
    runCapture(options.pages, options.sizes);
    const manifest = readCurrentManifest();
    if (options.approveBaseline) saveBaseline(manifest);
    else compare(manifest);
  })().catch(error => {
    console.error(`visual_compare ERROR: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = { decodePng, encodePng, comparePixels };
