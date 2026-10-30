#!/usr/bin/env node
/* Read-only audit: every pictographic glyph used in game/ source, with counts and
   first locations. Feeds the asset-inventory review (is there an emoji with no
   illustrated replacement yet?). It changes nothing and asserts nothing.
 *
 * Usage: node tools/scan_glyphs.js [--json] [--emoji-only]
 *   --json        machine-readable output
 *   --emoji-only  only \p{Extended_Pictographic} (skips text symbols like ♪ ★)
 *
 * Scope: .js .mjs .html .css .json under game/, minus the third-party three.js
 * bundle (the inventory excludes it too). */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'game');
const EXT = new Set(['.js', '.mjs', '.html', '.css', '.json']);
const SKIP = new Set([path.join(ROOT, 'assets', 'lib', 'three.module.min.js')]);
const LOCATION_LIMIT = 4;

const args = new Set(process.argv.slice(2));
const asJson = args.has('--json');
const emojiOnly = args.has('--emoji-only');

const EMOJI = String.raw`(?:\p{Regional_Indicator}{2})|(?:\p{Extended_Pictographic}(?:\uFE0F|[\u{1F3FB}-\u{1F3FF}]|\u200D\p{Extended_Pictographic})*)`;
const TEXT_SYMBOLS = String.raw`\p{So}`;
const CLUSTER = new RegExp(emojiOnly ? EMOJI : `${EMOJI}|${TEXT_SYMBOLS}`, 'gu');

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (EXT.has(path.extname(entry.name).toLowerCase()) && !SKIP.has(full)) out.push(full);
  }
  return out;
}

const glyphs = new Map();
for (const file of walk(ROOT)) {
  const text = fs.readFileSync(file, 'utf8');
  const rel = path.relative(path.join(__dirname, '..'), file).replace(/\\/g, '/');
  let line = 1;
  let consumed = 0;
  for (const m of text.matchAll(CLUSTER)) {
    for (let i = consumed; i < m.index; i++) if (text.charCodeAt(i) === 10) line++;
    consumed = m.index;
    const key = m[0];
    const row = glyphs.get(key) || { glyph: key, count: 0, locations: [] };
    row.count++;
    if (row.locations.length < LOCATION_LIMIT) row.locations.push(`${rel}:${line}`);
    glyphs.set(key, row);
  }
}

const rows = [...glyphs.values()].sort((a, b) => b.count - a.count || a.glyph.localeCompare(b.glyph));

if (asJson) {
  console.log(JSON.stringify(rows, null, 2));
} else {
  console.log(`${rows.length} distinct glyph(s) in game/\n`);
  const pad = Math.max(5, ...rows.map(r => [...r.glyph].length));
  for (const r of rows) {
    const cps = [...r.glyph].map(ch => 'U+' + ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')).join(' ');
    console.log(`${r.glyph.padEnd(pad)}  ${r.count.toString().padStart(3)}  ${cps}  ${r.locations.join(', ')}`);
  }
}
