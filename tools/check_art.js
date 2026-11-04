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
for (const f of files) {
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
  if (ff.status !== 0 || !fs.existsSync(tmpPng)) {
    fail(`game/assets/art/${f}: could not decode (${(ff.stderr || '').trim().slice(-120)})`);
    continue;
  }
  let img;
  try { img = decodePng(fs.readFileSync(tmpPng)); } catch (e) { fail(`game/assets/art/${f}: png decode failed (${e.message})`); continue; }
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
