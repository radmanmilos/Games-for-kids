/* asset_inspect.js — read a picture without eyes: size, paper tone, subject mean,
 * coverage, legibility proxy, connected components and an ASCII silhouette.
 *
 * Adopted from a one-off working script (task 295): a text-only model cannot
 * open a PNG, and asset_qa.js reports metrics but not layout. This tool answers
 * "what shape is on the page, and how is it arranged?" — it never judges art.
 *
 * Usage: node tools/asset_inspect.js <file.png|jpg> [cols] [rows]
 *   cols/rows default to 44 x 26 (terminal-friendly silhouette grid).
 * Read-only: prints, writes nothing, exits 0.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { decodePng, toRgba, smallSizeContrast, alphaStats, round } = require('./lib/png.js');
const { detectFormat, convertToPng } = require('./lib/imagefile.js');

const file = path.resolve(process.argv[2] || '');
if (!process.argv[2] || !fs.existsSync(file)) {
  console.error('usage: node tools/asset_inspect.js <file.png|jpg> [cols] [rows]');
  process.exit(1);
}
const COLS = Number(process.argv[3] || 44);
const ROWS = Number(process.argv[4] || 26);

const bytes = fs.readFileSync(file);
const detected = detectFormat(bytes);
let png = bytes;
if (detected.format !== 'png') {
  const result = convertToPng(bytes);
  if (!result.png) {
    console.error(`${path.basename(file)}: ${detected.format} cannot be decoded here (${result.reason})`);
    process.exit(1);
  }
  png = result.png;
}

const image = toRgba(decodePng(png));
const W = image.width, H = image.height, px = image.pixels;
const at = (x, y) => {
  const i = (y * W + x) * 4;
  return [px[i], px[i + 1], px[i + 2]];
};
const corners = [at(0, 0), at(W - 1, 0), at(0, H - 1), at(W - 1, H - 1)];
const bg = [0, 1, 2].map((c) => corners.reduce((s, p) => s + p[c], 0) / corners.length);

console.log(`=== ${path.basename(file)} ===  format ${detected.format}  ${W}x${H}  ${bytes.length} bytes`);
console.log(`  paper (corners): ${bg.map((v) => round(v, 1)).join('/')}`);

/* A pixel counts as subject when it is far enough from the paper tone. */
const TH = 45;
let r = 0, g = 0, b = 0, count = 0;
const mask = new Uint8Array(W * H);
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const [pr, pg, pb] = at(x, y);
    const d = Math.abs(pr - bg[0]) + Math.abs(pg - bg[1]) + Math.abs(pb - bg[2]);
    mask[y * W + x] = d >= TH ? 1 : 0;
    if (d >= TH) { r += pr; g += pg; b += pb; count++; }
  }
}
const mean = count ? [round(r / count, 1), round(g / count, 1), round(b / count, 1)] : [0, 0, 0];
console.log(`  subject mean RGB: ${mean.join('/')}  |  covers ${round((count / (W * H)) * 100, 1)}% of the frame`);
console.log(`  small-size contrast: ${smallSizeContrast(image)}`);
const alpha = alphaStats(image);
console.log(`  alpha opaque/transparent/partial: ${alpha.opaquePct}/${alpha.transparentPct}/${alpha.partialPct}%`);

/* Tint tells "warm beige" from "cool blue" without naming the picture. */
let rs = 0, gs = 0, bs = 0;
for (let i = 0; i < W * H; i++) {
  if (!mask[i]) continue;
  rs += px[i * 4]; gs += px[i * 4 + 1]; bs += px[i * 4 + 2];
}
const m = [rs / count, gs / count, bs / count];
console.log(`  subject tint: R-G ${round(m[0] - m[1], 1)} | R-B ${round(m[0] - m[2], 1)} | G-B ${round(m[1] - m[2], 1)}`);

/* Connected components: how many separate things does the picture show? */
const seen = new Uint8Array(W * H);
const parts = [];
const stack = [];
for (let s = 0; s < W * H; s++) {
  if (!mask[s] || seen[s]) continue;
  stack.length = 0; stack.push(s); seen[s] = 1;
  let minX = W, maxX = 0, minY = H, maxY = 0, n = 0;
  while (stack.length) {
    const i = stack.pop();
    const x = i % W, y = (i / W) | 0;
    n++;
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      const j = ny * W + nx;
      if (!mask[j] || seen[j]) continue;
      seen[j] = 1; stack.push(j);
    }
  }
  parts.push({ n, minX, maxX, minY, maxY });
}
parts.sort((a, b) => b.n - a.n);
console.log(`  parts: ${parts.length}`);
for (const p of parts.slice(0, 5)) {
  console.log(`    ${String(p.n).padStart(7)} px (${round((p.n / count) * 100, 1)}% of subject)  ${p.maxX - p.minX + 1}x${p.maxY - p.minY + 1} at ${p.minX},${p.minY}`);
}

/* Silhouette: '#' solid, '+' present, ',' faint, '.' trace, ' ' paper. */
console.log('');
for (let rr = 0; rr < ROWS; rr++) {
  let line = '';
  for (let c = 0; c < COLS; c++) {
    let strong = 0, weak = 0, total = 0;
    const x0 = Math.floor((c * W) / COLS), x1 = Math.floor(((c + 1) * W) / COLS);
    const y0 = Math.floor((rr * H) / ROWS), y1 = Math.floor(((rr + 1) * H) / ROWS);
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        const i = (y * W + x) * 4;
        const d = Math.abs(px[i] - bg[0]) + Math.abs(px[i + 1] - bg[1]) + Math.abs(px[i + 2] - bg[2]);
        if (d >= TH) strong++;
        else if (d >= 20) weak++;
        total++;
      }
    }
    const s = strong / total, w = weak / total;
    line += s > 0.35 ? '#' : s > 0.05 ? '+' : w > 0.5 ? ',' : w > 0.15 ? '.' : ' ';
  }
  console.log(line);
}
