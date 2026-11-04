/* asset_cutout.js — turn an opaque painted PNG into a game-ready glyph WebP.
 *
 * Why this exists: the Workers AI endpoint always returns an opaque rgb PNG with
 * a painted paper background, and renaming it to .webp does not make it a
 * cut-out. Tasks 350/351 did exactly that and shipped six cream squares into the
 * game (task 358). There is no background remover in tools/, so this is it: an
 * edge flood-fill matte, framed and downscaled, encoded as a real alpha WebP.
 *
 * It is deliberately dumb and deterministic: it removes the *connected paper
 * region* that touches the frame border, so colour inside the subject is never
 * punched out, then only fits and resizes. It never repaints.
 *
 * Usage:
 *   node tools/asset_cutout.js <in.png> --out <file.webp> [options]
 *   node tools/asset_cutout.js a.png b.png --out <dir> [options]
 *
 * Options:
 *   --size <n>      output canvas, default 512 (glyph art is 512x512)
 *   --tol <n>       per-channel colour tolerance for "this is paper", default 18
 *   --margin <pct>  padding around the subject inside the canvas, default 6
 *   --paper r,g,b   force the background colour instead of detecting it
 *   --no-fit        keep the original framing instead of cropping to the subject
 *   --no-islands    keep enclosed paper specks instead of removing them
 *   --keep          keep the intermediate PNG (tools/.cache/cutout/)
 *
 * Requires ffmpeg with libwebp on PATH (the repo already relies on it for
 * decoding WebPs in audits). Writes only the requested outputs plus the
 * git-ignored temp PNG.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { decodePng, toRgba, resizeRgba, alphaStats, encodePng } = require('./lib/png.js');
const { detectFormat } = require('./lib/imagefile.js');

const ROOT = path.resolve(__dirname, '..');
const TEMP = path.join(__dirname, '.cache', 'cutout');

function usage(message) {
  if (message) console.error('asset_cutout: ' + message);
  console.error('usage: node tools/asset_cutout.js <in.png> [more.png ...] --out <file.webp|dir> [--size 512] [--tol 18] [--margin 6] [--paper r,g,b] [--no-fit] [--keep]');
  process.exit(1);
}

const args = process.argv.slice(2);
const inputs = [];
let out = null;
let size = 512;
let tol = 18;
let margin = 6;
let paper = null;
let fit = true;
let islands = true;
let keep = false;
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === '--out') out = args[++i];
  else if (a === '--size') size = Number(args[++i]);
  else if (a === '--tol') tol = Number(args[++i]);
  else if (a === '--margin') margin = Number(args[++i]);
  else if (a === '--paper') paper = args[++i].split(',').map(Number);
  else if (a === '--no-fit') fit = false;
  else if (a === '--no-islands') islands = false;
  else if (a === '--keep') keep = true;
  else if (a.startsWith('--')) usage('unknown option ' + a);
  else inputs.push(a);
}
if (!inputs.length) usage('no input file');
if (!out) usage('--out is required');
if (!Number.isFinite(size) || size < 16) usage('--size must be a number >= 16');
if (paper && (paper.length !== 3 || paper.some((v) => !Number.isFinite(v)))) usage('--paper needs r,g,b');

/** Most common quantised colour on a 2px border ring, then its mean. */
function detectPaper(img) {
  const { width: w, height: h, pixels } = img;
  const buckets = new Map();
  const ring = [];
  const add = (x, y) => {
    const i = (y * w + x) * 4;
    ring.push(i);
    const key = ((pixels[i] >> 3) << 10) | ((pixels[i + 1] >> 3) << 5) | (pixels[i + 2] >> 3);
    buckets.set(key, (buckets.get(key) || 0) + 1);
  };
  for (let x = 0; x < w; x++) { add(x, 0); add(x, 1); add(x, h - 1); add(x, h - 2); }
  for (let y = 0; y < h; y++) { add(0, y); add(1, y); add(w - 1, y); add(w - 2, y); }
  let best = -1, bestCount = -1;
  for (const [key, count] of buckets) {
    if (count > bestCount) { best = key; bestCount = count; }
  }
  let r = 0, g = 0, b = 0, n = 0;
  const key = (i) => ((pixels[i] >> 3) << 10) | ((pixels[i + 1] >> 3) << 5) | (pixels[i + 2] >> 3);
  for (const i of ring) {
    if (key(i) !== best) continue;
    r += pixels[i]; g += pixels[i + 1]; b += pixels[i + 2]; n++;
  }
  return [Math.round(r / n), Math.round(g / n), Math.round(b / n)];
}

function nearPaper(pixels, i, paper, tol) {
  return Math.abs(pixels[i] - paper[0]) + Math.abs(pixels[i + 1] - paper[1]) + Math.abs(pixels[i + 2] - paper[2]) <= tol * 3;
}

/** Flood-fill the paper region from the frame border, then set its alpha to 0. */
function cutout(img, paper, tol) {
  const { width: w, height: h, pixels } = img;
  const removed = new Uint8Array(w * h);
  const queue = new Int32Array(w * h);
  let head = 0, tail = 0;
  const push = (x, y) => {
    const p = y * w + x;
    if (removed[p]) return;
    if (!nearPaper(pixels, p * 4, paper, tol)) return;
    removed[p] = 1;
    queue[tail++] = p;
  };
  for (let x = 0; x < w; x++) { push(x, 0); push(x, h - 1); }
  for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y); }
  while (head < tail) {
    const p = queue[head++];
    const x = p % w, y = (p - x) / w;
    if (x > 0) push(x - 1, y);
    if (x < w - 1) push(x + 1, y);
    if (y > 0) push(x, y - 1);
    if (y < h - 1) push(x, y + 1);
  }
  const out = Buffer.from(pixels);
  for (let p = 0; p < w * h; p++) if (removed[p]) out[p * 4 + 3] = 0;
  let minX = w, minY = h, maxX = -1, maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (removed[y * w + x]) continue;
      if (x < minX) minX = x; if (y < minY) minY = y;
      if (x > maxX) maxX = x; if (y > maxY) maxY = y;
    }
  }
  const removedPct = +(100 * (tail / (w * h))).toFixed(1);
  if (maxX < 0) return { image: null, removedPct, bbox: null };
  return { image: { width: w, height: h, channels: 4, pixels: out }, removedPct, bbox: { minX, minY, maxX, maxY } };
}

/** Crop to the subject box, scale it to fit the canvas with a margin, centre it. */
function frame(img, bbox, size, margin) {
  const bw = bbox.maxX - bbox.minX + 1;
  const bh = bbox.maxY - bbox.minY + 1;
  const inner = size * (1 - (2 * margin) / 100);
  const scale = Math.min(inner / bw, inner / bh);
  const dw = Math.max(1, Math.round(bw * scale));
  const dh = Math.max(1, Math.round(bh * scale));
  const cropped = { width: bw, height: bh, channels: 4, pixels: Buffer.alloc(bw * bh * 4) };
  for (let y = 0; y < bh; y++) {
    const src = ((bbox.minY + y) * img.width + bbox.minX) * 4;
    img.pixels.copy(cropped.pixels, y * bw * 4, src, src + bw * 4);
  }
  const small = resizeRgba(cropped, dw, dh);
  const canvas = { width: size, height: size, channels: 4, pixels: Buffer.alloc(size * size * 4) };
  const ox = Math.round((size - dw) / 2);
  const oy = Math.round((size - dh) / 2);
  for (let y = 0; y < dh; y++) {
    small.pixels.copy(canvas.pixels, ((oy + y) * size + ox) * 4, y * dw * 4, (y + 1) * dw * 4);
  }
  return { canvas, dw, dh };
}

/** Enclosed paper specks cannot be reached from the border: drop only the ones whose colour is paper. */
function dropPaperIslands(image, paper, tol) {
  const { width: w, height: h, pixels } = image;
  const seen = new Uint8Array(w * h);
  const queue = new Int32Array(w * h);
  const removed = [];
  let kept = 0;
  for (let p = 0; p < w * h; p++) if (pixels[p * 4 + 3] > 0) kept++;
  for (let start = 0; start < w * h; start++) {
    if (seen[start] || pixels[start * 4 + 3] === 0) continue;
    let head = 0, tail = 0;
    queue[tail++] = start;
    seen[start] = 1;
    const members = [];
    while (head < tail) {
      const p = queue[head++];
      members.push(p);
      const x = p % w, y = (p - x) / w;
      const visit = (nx, ny) => {
        const q = ny * w + nx;
        if (seen[q] || pixels[q * 4 + 3] === 0) return;
        seen[q] = 1; queue[tail++] = q;
      };
      if (x > 0) visit(x - 1, y);
      if (x < w - 1) visit(x + 1, y);
      if (y > 0) visit(x, y - 1);
      if (y < h - 1) visit(x, y + 1);
    }
    if (members.length > kept * 0.02) continue; // the subject itself, never touch
    let r = 0, g = 0, b = 0;
    for (const p of members) { r += pixels[p * 4]; g += pixels[p * 4 + 1]; b += pixels[p * 4 + 2]; }
    const mean = [Math.round(r / members.length), Math.round(g / members.length), Math.round(b / members.length)];
    if (Math.abs(mean[0] - paper[0]) + Math.abs(mean[1] - paper[1]) + Math.abs(mean[2] - paper[2]) > tol * 3) continue;
    for (const p of members) pixels[p * 4 + 3] = 0;
    removed.push({ px: members.length, mean: mean.join('/') });
  }
  return removed;
}

function toWebp(pngBuffer, outFile) {
  fs.mkdirSync(TEMP, { recursive: true });
  const tempPng = path.join(TEMP, path.basename(outFile).replace(/\.webp$/i, '') + '.png');
  fs.writeFileSync(tempPng, pngBuffer);
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  const ff = spawnSync('ffmpeg', ['-y', '-v', 'error', '-i', tempPng, '-c:v', 'libwebp',
    '-lossless', '0', '-q:v', '82', '-compression_level', '6', '-pix_fmt', 'yuva420p', outFile],
    { encoding: 'utf8' });
  if (ff.status !== 0) {
    console.error('ffmpeg failed: ' + (ff.stderr || ff.error || 'unknown error'));
    process.exit(1);
  }
  if (!keep) fs.rmSync(tempPng, { force: true });
  return tempPng;
}

const multi = inputs.length > 1;
if (multi) fs.mkdirSync(out, { recursive: true });
const rows = [];
for (const input of inputs) {
  const file = path.resolve(input);
  if (!fs.existsSync(file)) usage('missing input ' + input);
  const bytes = fs.readFileSync(file);
  const format = detectFormat(bytes).format;
  if (format !== 'png') usage(`${input} is ${format}, not png — decode it first`);
  const img = toRgba(decodePng(bytes));
  const paperColour = paper || detectPaper(img);
  const cut = cutout(img, paperColour, tol);
  if (!cut.image) { console.error(`${input}: everything matched the paper colour — check --paper/--tol`); process.exit(1); }
  const specks = islands ? dropPaperIslands(cut.image, paperColour, tol) : [];
  for (const s of specks) console.log(`  ${path.basename(input)}: dropped enclosed paper speck ${s.px}px (mean ${s.mean})`);
  let canvas, dw, dh;
  if (fit) ({ canvas, dw, dh } = frame(cut.image, cut.bbox, size, margin));
  else { canvas = resizeRgba(cut.image, size, size); dw = dh = size; }
  const target = multi
    ? path.join(out, path.basename(input).replace(/\.png$/i, '.webp'))
    : path.resolve(out);
  const png = encodePng(canvas.width, canvas.height, canvas.pixels, 4);
  toWebp(png, target);
  const check = fs.readFileSync(target);
  const realFormat = detectFormat(check).format;
  const alpha = alphaStats({ width: size, height: size, channels: 4, pixels: canvas.pixels });
  const corners = [[0, 0], [size - 1, 0], [0, size - 1], [size - 1, size - 1]].map(([x, y]) => canvas.pixels[(y * size + x) * 4 + 3]);
  rows.push({
    input: path.basename(input), out: path.relative(ROOT, target).replace(/\\/g, '/'),
    paper: paperColour.join('/'), removed: cut.removedPct, subject: `${dw}x${dh}`,
    format: realFormat, size: `${size}x${size}`,
    transparent: alpha.transparentPct, partial: alpha.partialPct, opaque: alpha.opaquePct,
    corners: corners.join(','), bytes: check.length,
    ok: realFormat === 'webp' && corners.every((a) => a < 8) && alpha.transparentPct > 5,
  });
}

console.log('file'.padEnd(24), 'paper'.padEnd(13), 'cut%'.padEnd(6), 'subject'.padEnd(9), 'alpha op/tr/part'.padEnd(17), 'cornerA'.padEnd(14), 'KB');
for (const r of rows) {
  console.log(
    r.out.replace('game/assets/art/', '').padEnd(24),
    r.paper.padEnd(13),
    String(r.removed).padEnd(6),
    r.subject.padEnd(9),
    `${r.opaque}/${r.transparent}/${r.partial}`.padEnd(17),
    r.corners.padEnd(14),
    Math.round(r.bytes / 1024),
  );
}
const bad = rows.filter((r) => !r.ok);
if (bad.length) {
  console.error('\nFAILED verification: ' + bad.map((r) => r.out).join(', ') + ' (need real webp, transparent corners, >5% transparent)');
  process.exit(1);
}
console.log(`\n${rows.length} file(s) cut out and encoded. Verify framing with: node tools/asset_inspect.js <file>`);
