/* audit_bundle.js — bundle ↔ inventory consistency for the asset generation work.
 *
 * Answers three questions the inventory cannot answer about itself:
 *   - is there a PNG in the WIP bundle that no inventory row points at?
 *   - does a row point at a bundle file that is not on disk?
 *   - does a row's status disagree with whether its file exists?
 *
 * Read-only. Exits 1 when a problem is found, so it can be used as a gate.
 *
 * Usage: node tools/audit_bundle.js
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BUNDLE = path.join(ROOT, 'resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle');
const INVENTORY = path.join(ROOT, 'resources/General_reviews/Asset_Generation/ASSET_INVENTORY.md');

for (const [label, file] of [['bundle', BUNDLE], ['inventory', INVENTORY]]) {
  if (!fs.existsSync(file)) {
    console.error(`audit_bundle: ${label} not found: ${file}`);
    process.exit(1);
  }
}

const bundleFiles = fs.readdirSync(BUNDLE).filter((f) => f.toLowerCase().endsWith('.png')).sort();

const rows = [];
fs.readFileSync(INVENTORY, 'utf8').split(/\r?\n/).forEach((line, index) => {
  const cells = line.split('|').map((c) => c.trim());
  if (cells.length < 9) return;
  const id = cells[1];
  if (!id || id.startsWith('-') || !/^[a-z0-9-]+$/.test(id)) return;
  rows.push({ line: index + 1, id, status: cells[6], file: cells[7] });
});

const byFile = new Map();
for (const row of rows) {
  const match = /assets_work_in_progress_bundle\/([^`|)\s]+\.png)/.exec(row.file);
  if (!match) continue;
  if (!byFile.has(match[1])) byFile.set(match[1], []);
  byFile.get(match[1]).push(row);
}

const GENERATED = /GENERATED/;
const problems = [];

console.log(`=== WIP bundle .png files (${bundleFiles.length}) ===`);
for (const name of bundleFiles) {
  const hits = byFile.get(name) || [];
  if (hits.length === 0) {
    problems.push(`${name}: file exists but NO inventory row points at it`);
    console.log(`  ${name.padEnd(20)} -> NO INVENTORY ROW`);
    continue;
  }
  for (const row of hits) {
    const ok = GENERATED.test(row.status);
    if (!ok) problems.push(`${row.id} (line ${row.line}): status "${row.status}" but ${name} exists`);
    console.log(`  ${name.padEnd(20)} -> ${row.id.padEnd(22)} ${ok ? 'ok  ' : 'FIX '} ${row.status}`);
  }
}

console.log('\n=== inventory rows pointing at a bundle file that does not exist ===');
let missing = 0;
for (const [name, hits] of byFile) {
  if (bundleFiles.includes(name)) continue;
  missing++;
  for (const row of hits) console.log(`  ${row.id.padEnd(22)} -> ${name} (MISSING ON DISK)`);
  problems.push(`${name}: inventory row points at a file that is not on disk`);
}
if (!missing) console.log('  none');

console.log('\n=== rows with NO file (status REVIEW etc.) — the remaining queue ===');
const queue = rows.filter((r) => !r.file || r.file === '—' || r.file === '-');
console.log('  count:', queue.length);

console.log(`\n=== PROBLEMS (${problems.length}) ===`);
for (const p of problems) console.log('  -', p);

process.exit(problems.length ? 1 : 0);
