/* asset_qa.js — deterministic technical QA for the asset-generation candidates.
 *
 * The ledger in resources/General_reviews/Asset_Generation/ASSET_INVENTORY.md keeps
 * saying "technical QA pending" because past passes could not read the actual pixels.
 * This tool answers the objective questions instead: real dimensions and colour type,
 * real alpha coverage (RGBA support alone does not prove a transparent background),
 * edge/border haze, palette signature and how the picture holds up at card size.
 *
 * It never judges art. It only reports facts, so the style review stays a human
 * (or a vision model) decision.
 *
 * Usage:
 *   node tools/asset_qa.js <file.png> [more.png ...] [--against <ref.png>] [--json]
 */
'use strict';
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { decodePng, alphaStats, borderStats, paletteStats, paletteSimilarity, smallSizeContrast } = require('./lib/png.js');
const { detectFormat } = require('./lib/imagefile.js');

const ROOT = path.resolve(__dirname, '..');

function colorTypeName(channels) {
  // Keyed by channel count: 1 gray, 2 gray+alpha, 3 rgb, 4 rgba.
  return { 1: 'gray', 2: 'gray+alpha', 3: 'rgb', 4: 'rgba' }[channels] || String(channels);
}

/** Expand a directory argument into the PNG files it holds. */
function expandPaths(inputs) {
  const files = [];
  for (const input of inputs) {
    if (fs.existsSync(input) && fs.statSync(input).isDirectory()) {
      for (const name of fs.readdirSync(input).sort()) {
        if (name.toLowerCase().endsWith('.png')) files.push(path.join(input, name));
      }
    } else {
      files.push(input);
    }
  }
  return files;
}

/** Keep a failure message printable: library errors can embed raw bytes. */
function sanitize(message) {
  return String(message).replace(/[^\x20-\x7E]/g, '.').slice(0, 240);
}

/** Read one PNG and return every objective fact we record in the ledger. */
function inspect(file, referencePalette) {
  const abs = path.resolve(file);
  const bytes = fs.readFileSync(abs);
  const image = decodePng(bytes);
  const alpha = alphaStats(image);
  const border = borderStats(image);
  const palette = paletteStats(image);
  const record = {
    file: path.relative(ROOT, abs).replace(/\\/g, '/'),
    bytes: bytes.length,
    sha256: crypto.createHash('sha256').update(bytes).digest('hex'),
    width: image.width,
    height: image.height,
    colorType: colorTypeName(image.channels),
    alphaOpaquePct: alpha.opaquePct,
    alphaTransparentPct: alpha.transparentPct,
    alphaPartialPct: alpha.partialPct,
    cornerAlpha: border.cornerAlpha,
    borderMeanAlpha: border.borderMeanAlpha,
    paletteMean: palette.mean,
    smallSizeContrast: smallSizeContrast(image),
  };
  if (referencePalette) record.paletteMatch = paletteSimilarity(palette, referencePalette);
  return record;
}

function main(argv) {
  const args = argv.slice(2);
  const asJson = args.includes('--json');
  const againstIndex = args.indexOf('--against');
  let referenceFile = null;
  if (againstIndex !== -1) {
    referenceFile = args[againstIndex + 1];
    args.splice(againstIndex, 2);
  }
  const files = expandPaths(args.filter((a) => !a.startsWith('--')));
  if (!files.length) {
    console.error('Usage: node tools/asset_qa.js <file.png|dir> [more ...] [--against <ref.png>] [--json]');
    process.exit(2);
  }
  let referencePalette = null;
  if (referenceFile) {
    referencePalette = paletteStats(decodePng(fs.readFileSync(path.resolve(referenceFile))));
  }
  const records = [];
  for (const file of files) {
    try {
      const bytes = fs.readFileSync(path.resolve(file));
      const detected = detectFormat(bytes);
      if (detected.format !== 'png') {
        throw new Error(`${file} is a ${detected.format}, not a PNG — the file name lies about its content`);
      }
      records.push(inspect(file, referencePalette));
    } catch (error) {
      console.error(`FAIL ${file}: ${sanitize(error.message)}`);
      process.exitCode = 1;
    }
  }
  if (asJson) {
    console.log(JSON.stringify(records, null, 2));
    return;
  }
  const header = ['file', 'size', 'mode', 'bytes', 'alpha op/tr/part %', 'cornerA', 'smallC', 'palette', 'match'];
  console.log(header.join(' | '));
  for (const r of records) {
    console.log([
      r.file.replace('resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/', 'bundle/'),
      `${r.width}x${r.height}`,
      r.colorType,
      r.bytes,
      `${r.alphaOpaquePct}/${r.alphaTransparentPct}/${r.alphaPartialPct}`,
      r.cornerAlpha.join(','),
      r.smallSizeContrast,
      r.paletteMean.join('/'),
      r.paletteMatch ?? '-',
    ].join(' | '));
  }
}

if (require.main === module) main(process.argv);
module.exports = { inspect };
