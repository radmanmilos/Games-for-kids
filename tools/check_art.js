'use strict';
/* check_art.js — integrity gate for game/assets/art/ (task 360).
   Enforces, over every glyph WebP in game/assets/art/:
     1. magic bytes == WebP (a .webp name is not evidence)
     2. 512x512 canvas
     3. real alpha (corner pixels transparent, >5% transparent)
     4. a registry consumer (every mapped stem has a file)
   Full-bleed scene art lives in game/assets/scenes/ and is deliberately exempt.
   Exit code 1 on any hard failure, with an explicit fix message. Orphan files
   (a WebP no glyph points at) are reported as warnings; task 362 closes them. */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { detectFormat } = require('./lib/imagefile.js');
const { decodePng, alphaStats } = require('./lib/png.js');

const ROOT = path.resolve(__dirname, '..');
const GAME = path.join(ROOT, 'game');
const ART_DIR = path.join(GAME, 'assets', 'art');
const REGISTRY = path.join(GAME, 'data', 'art-registry.js');
const TEMP = path.join(__dirname, '.cache', 'check_art');

function fail(msg) { failures.push(msg); }
const failures = [];
const warnings = [];

// Load registry (browser global).
const win = {};
try { new Function('window', fs.readFileSync(REGISTRY, 'utf8'))(win); }
catch (e) { console.error('check_art: cannot evaluate art-registry.js: ' + e.message); process.exit(2); }
const registry = win.ART_REGISTRY || {};
const stems = new Set(Object.values(registry));
const decoded = new Map(); // stem -> {width, height, pixels} for chips/fragments checks

// Normalise keys the same way Art does, so the gate matches runtime behaviour.
const regKeys = Object.keys(registry).map((k) => k.replace(/\uFE0F/g, ''));

// FE0F check (hard): a key carrying the variation selector can never resolve.
const fe0fKeys = Object.keys(registry).filter((k) => k !== k.replace(/\uFE0F/g, ''));
if (fe0fKeys.length) fail(`art registry: ${fe0fKeys.length} key(s) contain U+FE0F and can never resolve (${fe0fKeys.join(' ')}); write them without the variation selector`);

// Every mapped stem must have a file.
for (const stem of stems) {
  if (!fs.existsSync(path.join(ART_DIR, stem + '.webp'))) {
    fail(`art registry: stem "${stem}" has no game/assets/art/${stem}.webp (a registered glyph would render as a broken image)`);
  }
}

const files = fs.readdirSync(ART_DIR).filter((f) => f.endsWith('.webp'));
const fileStems = new Set(files.map((f) => f.replace(/\.webp$/, '')));

// Orphans: warning only (task 362 closes the remaining three).
for (const f of files) {
  const stem = f.replace(/\.webp$/, '');
  if (!stems.has(stem)) warnings.push(`art registry: game/assets/art/${f} has no consumer (orphan, dead weight in the offline cache)`);
}

// Per-file format / size / alpha.
fs.mkdirSync(TEMP, { recursive: true });

// Probe ffmpeg up front so a missing decoder fails with an actionable message
// instead of 154 identical "could not decode ()" lines (task 363).
const ffProbe = spawnSync('ffmpeg', ['-version'], { encoding: 'utf8' });
if (ffProbe.error || ffProbe.status !== 0) {
  console.error('check_art: ffmpeg is not available on PATH (needed to decode WebP).');
  if (ffProbe.error) console.error('  ' + (ffProbe.error.code || ffProbe.error.message) + ': ' + ffProbe.error.message);
  else console.error('  exit ' + ffProbe.status + (ffProbe.signal ? ' signal ' + ffProbe.signal : '') + (ffProbe.stderr ? ': ' + ffProbe.stderr.trim().slice(-200) : ''));
  console.error('Fix: install ffmpeg (with libwebp) locally, or provision it in CI (.github/workflows/ci.yml fast job).');
  process.exit(2);
}
for (const f of files) {
  const stem = f.replace(/\.webp$/, '');
  const full = path.join(ART_DIR, f);
  const bytes = fs.readFileSync(full);
  const det = detectFormat(bytes);
  if (det.format !== 'webp') {
    fail(`game/assets/art/${f}: magic bytes say ${det.format}, not webp (rename or re-encode)`);
    continue;
  }
  // Decode via ffmpeg -> png.
  const tmpPng = path.join(TEMP, f.replace(/\.webp$/, '.png'));
  const ff = spawnSync('ffmpeg', ['-y', '-v', 'error', '-i', full, '-frames:v', '1', tmpPng], { encoding: 'utf8' });
  if (ff.error || ff.status !== 0 || !fs.existsSync(tmpPng)) {
    let detail;
    if (ff.error) detail = 'spawn error ' + (ff.error.code || ff.error.message) + ': ' + ff.error.message;
    else detail = 'exit ' + ff.status + (ff.signal ? ' signal ' + ff.signal : '') + ((ff.stderr || '').trim() ? ' stderr: ' + (ff.stderr || '').trim().slice(-200) : '');
    fail(`game/assets/art/${f}: could not decode (${detail})`);
    continue;
  }
  let img;
  try { img = decodePng(fs.readFileSync(tmpPng)); } catch (e) { fail(`game/assets/art/${f}: png decode failed (${e.message})`); continue; }
  decoded.set(stem, { width: img.width, height: img.height, pixels: toRgba(img).pixels });
  if (img.width !== 512 || img.height !== 512) {
    fail(`game/assets/art/${f}: ${img.width}x${img.height}, expected 512x512`);
  }
  const rgba = img.channels === 4 ? img : { width: img.width, height: img.height, channels: 4, pixels: Buffer.alloc(img.width*img.height*4) };
  // toRgba not in png lib? check
  const stats = alphaStats({ width: img.width, height: img.height, channels: 4, pixels: toRgba(img).pixels });
  if (stats.transparentPct < 5) {
    fail(`game/assets/art/${f}: only ${stats.transparentPct}% transparent (expected a real cut-out, >5%)`);
  }
  const corners = [0, img.width-1].flatMap((x) => [0, img.height-1].map((y) => img.pixels ? 0 : 0));
  // corner alpha check
  const px = toRgba(img).pixels;
  const cornerA = [px[3], px[(img.width-1)*4+3], px[(img.height-1)*img.width*4+3], px[(img.width*img.height-1)*4+3]];
  if (cornerA.filter((v) => v < 8).length < 3) {
    fail(`game/assets/art/${f}: corner alpha ${cornerA.join(',')} (expected a transparent background, >=3 corners <8)`);
  }
}

// --- T3 (task 450): unreferenced art (port from dead_art_scan.js) ---
function checkUnreferencedArt() {
  const root = path.join(ROOT, 'game');
  const artDir = path.join(root, 'assets', 'art');
  const files = fs.readdirSync(artDir).filter((f) => f.endsWith('.webp')).map((f) => f.replace(/\.webp$/, ''));
  const texts = [];
  (function walk(d) {
    for (const f of fs.readdirSync(d)) {
      const p = path.join(d, f);
      const st = fs.statSync(p);
      if (st.isDirectory()) { if (f !== 'assets') walk(p); }
      else if (/\.(js|mjs|html|css)$/.test(f) && !/art-registry\.js$/.test(f)) texts.push(fs.readFileSync(p, 'utf8'));
    }
  })(root);
  const corpus = texts.join('\n');
  const reg = fs.readFileSync(path.join(root, 'data', 'art-registry.js'), 'utf8');
  const eff = {};
  for (const m of reg.matchAll(/"([^"]+)"\s*:\s*"([^"]+)"/g)) eff[m[1]] = m[2];
  const used = new Set();
  for (const f of files) {
    const re = new RegExp('[\\"\'`/]' + f.replace(/-/g, '\\-') + '(\\.webp)?[\\"\'`]');
    if (re.test(corpus)) used.add(f);
  }
  for (const [emoji, stem] of Object.entries(eff)) if (corpus.includes(emoji)) used.add(stem);
  const dead = files.filter((f) => !used.has(f));
  if (dead.length) {
    dead.forEach((f) => fail(`art registry: game/assets/art/${f}.webp is unreferenced (dead weight in the offline cache)`));
  }
}

// --- T3: sheet-label chips ---
function checkSheetLabelChips(stem, img) {
  const { width, height, pixels } = img;
  let minX = width, maxX = 0, minY = height, maxY = 0;
  for (let y = 0; y < height; y++) {
    const row = y * width;
    for (let x = 0; x < width; x++) {
      const i = (row + x) * 4;
      if (pixels[i + 3] > 24) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (minX > maxX) return;
  const boxW = maxX - minX + 1;
  const boxH = maxY - minY + 1;
  if (boxW > 5 * boxH && boxH < 0.14 * 512) {
    fail(`game/assets/art/${stem}.webp: sheet-label chip — box ${boxW}x${boxH} (width > 5x height, height < 14% of canvas)`);
  }
}

// --- T3: stray fragments (connected components over alpha > 24) ---
// Matches sprite_audit.py: count only components individually > 0.05% of total,
// fail if their total > 0.4% of total alpha.
const FRAGMENT_ALLOW_LIST = new Set(['pawprint', 'skis', 'weather-rain', 'object-plate', 'notebook', 'bone', 'car', 'road-barrier']);
function checkStrayFragments(stem, img) {
  if (FRAGMENT_ALLOW_LIST.has(stem)) return;
  const { width, height, pixels } = img;
  const n = width * height;
  const visited = new Uint8Array(n);
  const areas = [];
  for (let y = 0; y < height; y++) {
    const row = y * width;
    for (let x = 0; x < width; x++) {
      const idx = row + x;
      if (visited[idx] || pixels[idx * 4 + 3] <= 24) continue;
      let area = 0;
      const queue = [idx];
      visited[idx] = 1;
      while (queue.length) {
        const cur = queue.pop();
        area++;
        const cx = cur % width;
        const cy = (cur - cx) / width;
        for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
          const nx = cx + dx, ny = cy + dy;
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const nidx = ny * width + nx;
            if (!visited[nidx] && pixels[nidx * 4 + 3] > 24) {
              visited[nidx] = 1;
              queue.push(nidx);
            }
          }
        }
      }
      areas.push(area);
    }
  }
  if (areas.length === 0) return;
  areas.sort((a, b) => b - a);
  const tot = areas.reduce((a, b) => a + b, 0);
  const big = areas[0];
  const stray = areas.filter((a) => a < big && a / tot > 0.0005);
  const straySum = stray.reduce((a, b) => a + b, 0);
  if (stray.length && straySum / tot > 0.004) {
    fail(`game/assets/art/${stem}.webp: stray fragments — non-main islands ${Math.round(100 * straySum / tot)}% of subject (>0.4%)`);
  }
}

// Run T3 checks
checkUnreferencedArt();
for (const [stem, img] of decoded) {
  checkSheetLabelChips(stem, img);
  checkStrayFragments(stem, img);
}

// toRgba helper (png lib has toRgba but not exported? check)
function toRgba(image) {
  if (image.channels === 4) return image;
  const out = Buffer.alloc(image.width * image.height * 4);
  for (let i = 0; i < image.width * image.height; i++) {
    const src = i * image.channels;
    out[i*4] = image.pixels[src];
    out[i*4+1] = image.channels === 1 ? image.pixels[src] : image.pixels[src+1];
    out[i*4+2] = image.channels === 1 ? image.pixels[src] : image.pixels[src+2];
    out[i*4+3] = 255;
  }
  return { width: image.width, height: image.height, channels: 4, pixels: out };
}

// Cleanup temp
try { fs.rmSync(TEMP, { recursive: true, force: true }); } catch (e) {}

// Report
console.log(`check_art: ${files.length} glyph WebP(s), ${stems.size} registry stems, ${warnings.length} warning(s), ${failures.length} failure(s)`);
for (const w of warnings) console.log('  WARN ' + w);
for (const f of failures) console.log('  FAIL ' + f);
if (failures.length) {
  console.log('\nFix: re-encode the offending files with tools/asset_cutout.js, or update the registry. See project/lessons/asset-generation.md.');
  process.exit(1);
}
console.log('check_art: OK');
