/* asset_refpool.js — build the approved reference pool for the next generation.
 *
 * Every illustration already accepted in
 * resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/ is a
 * reference for the next one, so each new candidate has to sit inside the same
 * painted family. This tool turns that folder into a usable pool:
 *
 *   1. decodes every PNG and records its palette signature,
 *   2. ranks the pool by similarity to the canonical bear reference
 *      (STYLE_BIBLE.md: the exact user-supplied bear and star are the fixed anchors),
 *   3. writes API-ready copies below 512x512 into tools/.cache/asset_refs/
 *      (the image API rejects larger reference images),
 *   4. tells the generator which files to send and in which order.
 *
 * Usage:
 *   node tools/asset_refpool.js            # print the ranked pool
 *   node tools/asset_refpool.js --json     # machine readable
 *   node tools/asset_refpool.js --pick 4   # the four reference files the generator sends
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { decodePng, encodePng, resizeRgba, paletteStats, paletteSimilarity } = require('./lib/png.js');

const ROOT = path.resolve(__dirname, '..');
const BASE = path.join(ROOT, 'resources', 'General_reviews', 'Asset_Generation');
const BUNDLE = path.join(BASE, 'assets_work_in_progress_bundle');
const REFERENCE = path.join(BASE, 'Reference');
const CACHE = path.join(ROOT, 'tools', '.cache', 'asset_refs');
const CANONICAL_BEAR = path.join(REFERENCE, 'bear.png');
const CANONICAL_STAR = path.join(REFERENCE, 'star.png');
// The image API rejects reference images that are 512x512 or larger, so the API-ready
// copies stay strictly below that edge.
const MAX_REFERENCE_EDGE = 500;

function pngFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((name) => name.toLowerCase().endsWith('.png'))
    .map((name) => path.join(dir, name))
    .sort();
}

/**
 * Cache a copy of `file` scaled so both edges stay below the API limit. The source
 * folder is part of the cache path: the canonical bear and the bundle bear share a
 * file name and a canvas size but are different pictures, and they must not
 * overwrite each other's copy.
 */
function prepareReference(file, label) {
  const image = decodePng(fs.readFileSync(file));
  const edge = Math.max(image.width, image.height);
  const target = edge <= MAX_REFERENCE_EDGE ? edge : MAX_REFERENCE_EDGE;
  const scale = target / edge;
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const scaled = edge <= MAX_REFERENCE_EDGE ? image : resizeRgba(image, width, height);
  const dir = path.join(CACHE, label);
  fs.mkdirSync(dir, { recursive: true });
  const out = path.join(dir, path.basename(file).replace(/\.png$/i, '') + '-' + width + 'x' + height + '.png');
  fs.writeFileSync(out, encodePng(scaled.width, scaled.height, scaled.pixels, scaled.channels === 4 ? 4 : 3));
  return out;
}

/**
 * Build the pool. Canonical references keep their fixed role; bundle files are the
 * approved family. Ranking is by palette similarity to the canonical bear.
 */
function buildPool() {
  const bearPalette = paletteStats(decodePng(fs.readFileSync(CANONICAL_BEAR)));
  const entries = [];
  for (const file of [CANONICAL_BEAR, CANONICAL_STAR]) {
    if (!fs.existsSync(file)) continue;
    const image = decodePng(fs.readFileSync(file));
    entries.push({
      file,
      name: path.basename(file),
      role: 'canonical',
      width: image.width,
      height: image.height,
      palette: paletteStats(image),
      similarity: paletteSimilarity(paletteStats(image), bearPalette),
      apiFile: prepareReference(file, 'canonical'),
    });
  }
  for (const file of pngFiles(BUNDLE)) {
    const image = decodePng(fs.readFileSync(file));
    entries.push({
      file,
      name: path.basename(file),
      role: 'approved',
      family: image.width >= 1000 ? 'painted' : 'legacy',
      width: image.width,
      height: image.height,
      palette: paletteStats(image),
      similarity: paletteSimilarity(paletteStats(image), bearPalette),
      apiFile: prepareReference(file, 'bundle'),
    });
  }
  entries.forEach((entry, index) => { entry.index = index; });
  return { entries, bearPalette };
}

/**
 * The files the generator should send, in order: the canonical anchors first, then the
 * approved painted illustrations whose palette matches the bear best. The small legacy
 * emoji rasters are not part of the painted family and are only sent when named
 * explicitly.
 */
function pickReferences(pool, count) {
  const canonical = pool.entries.filter((e) => e.role === 'canonical');
  const approved = pool.entries
    .filter((e) => e.role === 'approved' && e.family === 'painted')
    .slice()
    .sort((a, b) => b.similarity - a.similarity);
  return canonical.concat(approved).slice(0, count);
}

/** Resolve explicit reference names (file names) against the pool. */
function pickByName(pool, names) {
  const chosen = [];
  for (const name of names) {
    const entry = pool.entries.find((e) => e.name.toLowerCase() === name.toLowerCase());
    if (!entry) throw new Error(`Unknown reference "${name}". Known: ${pool.entries.map((e) => e.name).join(', ')}`);
    chosen.push(entry);
  }
  return chosen;
}

function main(argv) {
  const args = argv.slice(2);
  const pool = buildPool();
  if (args.includes('--pick')) {
    const index = args.indexOf('--pick');
    const count = Number(args[index + 1]) || 4;
    for (const entry of pickReferences(pool, count)) {
      console.log(`${entry.name}\t${entry.role}\t${entry.width}x${entry.height}\tmatch=${entry.similarity}\t${path.relative(ROOT, entry.apiFile)}`);
    }
    return;
  }
  if (args.includes('--json')) {
    console.log(JSON.stringify(pool.entries.map((e) => ({
      name: e.name, role: e.role, width: e.width, height: e.height,
      similarity: e.similarity, apiFile: path.relative(ROOT, e.apiFile).replace(/\\/g, '/'),
    })), null, 2));
    return;
  }
  console.log('name | role | family | size | palette-match vs canonical bear | api copy');
  for (const entry of pool.entries.slice().sort((a, b) => b.similarity - a.similarity)) {
    console.log(`${entry.name} | ${entry.role} | ${entry.family || '-'} | ${entry.width}x${entry.height} | ${entry.similarity} | ${path.basename(entry.apiFile)}`);
  }
  console.log(`\n${pool.entries.length} references prepared in tools/.cache/asset_refs/`);
}

if (require.main === module) main(process.argv);
module.exports = { buildPool, pickReferences, pickByName, prepareReference, CANONICAL_BEAR, CANONICAL_STAR };
