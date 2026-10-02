#!/usr/bin/env node
/* tools/build_offline.js — generates the two service-worker inventories:
     game/sw-cache-list.json    (what the worker pre-caches)
     game/offline-manifest.json (sha256 + size for exactly those entries)
   Usage: node tools/build_offline.js
   It writes nothing to docs/ and produces no archive — see the note at the end. */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { hashFile } = require('./manifest_hash.js');

const TOOLS = __dirname;
const REPO = path.resolve(TOOLS, '..');
const GAME = path.join(REPO, 'game');

console.log('[build_offline] regenerating sw-cache-list.json');
// execFileSync with an argv array, NOT execSync with an interpolated command:
// this repo's path contains a space ("Games for kids"), so the unquoted form
// died with "Cannot find module 'E:\GitHub\Games'" before generating anything.
execFileSync(process.execPath, [path.join(TOOLS, 'generate_sw_list.js')], { stdio: 'inherit' });

const swListPath = path.join(GAME, 'sw-cache-list.json');
if (!fs.existsSync(swListPath)) { console.error('Missing ' + swListPath); process.exit(2); }

const swList = JSON.parse(fs.readFileSync(swListPath, 'utf8'));
const manifest = {};
let failed = 0;

for (const entry of swList) {
  const rel = entry.replace(/^\//, '');
  const abs = path.join(GAME, rel);
  // The manifest cannot describe itself: it is written AFTER these hashes are
  // computed, so a self-entry could only ever hold the hash of the PREVIOUS
  // manifest. That is not a harmless artifact — sw.js checkForUpdates() diffs the
  // online manifest against the cached one and reports every differing key, so a
  // self-entry made "offline-manifest.json" show up as changed on EVERY update
  // check, and "Проверити ажурирања" could never report a clean result.
  // The file stays in sw-cache-list.json (sw.js reads it back out of the cache to
  // diff against), it is simply not listed inside its own contents.
  if (rel === 'offline-manifest.json') continue;
  if (!fs.existsSync(abs)) {
    console.warn('Skipping missing file: ' + entry);
    failed++;
    continue;
  }
  // Hash the CANONICAL bytes (LF for text) via manifest_hash.js, not the raw
  // work-tree bytes: git stores LF, GitHub Pages serves LF, and a manifest built
  // on a CRLF checkout (Windows core.autocrlf=true) would otherwise disagree
  // with the very same commit checked out on Linux/macOS.
  const { sha256, size } = hashFile(abs);
  manifest[entry] = { sha256, size };
}

if (Object.keys(manifest).length === 0) { console.error('Refusing to write an empty offline manifest'); process.exit(2); }
if (failed > 0) { console.error('Offline manifest incomplete: ' + failed + ' of ' + swList.length + ' entries failed'); process.exit(2); }

const outPath = path.join(GAME, 'offline-manifest.json');
fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2));
console.log('[build_offline] wrote ' + outPath + ' (' + Object.keys(manifest).length + ' entries)');

/* There is no ZIP step. Offline delivery is the service worker: the parent's
   "Преузми за офлајн рад" caches everything in sw-cache-list.json, so there is no
   archive for a parent to download and unpack by hand. The old step shelled out to
   `zip` (missing on this host, so `check_all.js --offline` could never complete)
   and wrote a ~5.4 MB binary that was never tracked in git, so GitHub Pages never
   published it and the parent-area link pointed at a 404. Removed 2026-10-02 by
   user decision; this tool now generates the two inventories and nothing else. */
console.log('[build_offline] done (service-worker inventories only; no archive is produced).');
