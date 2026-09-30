#!/usr/bin/env node
/* tools/build_offline.js — Node.js replacement for build_offline.ps1
   Generates game/sw-cache-list.json, produces docs/game-offline.zip,
   and writes game/offline-manifest.json with SHA256 and size for each asset.
   Usage: node tools/build_offline.js */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { hashFile } = require('./manifest_hash.js');

const TOOLS = __dirname;
const REPO = path.resolve(TOOLS, '..');
const GAME = path.join(REPO, 'game');
const DOCS = path.join(REPO, 'docs');

console.log('[build_offline] regenerating sw-cache-list.json');
// execFileSync with an argv array, NOT execSync with an interpolated command:
// this repo's path contains a space ("Games for kids"), so the unquoted form
// died with "Cannot find module 'E:\GitHub\Games'" before generating anything.
execFileSync(process.execPath, [path.join(TOOLS, 'generate_sw_list.js')], { stdio: 'inherit' });

if (!fs.existsSync(DOCS)) fs.mkdirSync(DOCS, { recursive: true });

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

const zipPath = path.join(DOCS, 'game-offline.zip');

// R5 (task 165): build to a temporary name and move it into place only on
// success. The old code unlinked the existing archive FIRST, so any failure
// after that point — and on this machine the very next line fails, because
// `zip` is not on PATH — destroyed the artifact it was supposed to replace.
// A failed build must leave the previous archive untouched.
const zipTmp = zipPath + '.tmp';
console.log('[build_offline] creating ZIP: ' + zipPath);

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'offline-zip-'));
try {
  fs.cpSync(GAME, tmpDir, { recursive: true });
  execFileSync('zip', ['-r', zipTmp, '.'], { cwd: tmpDir, stdio: 'inherit' });
  // Only now is it safe to touch the real path.
  fs.mkdirSync(path.dirname(zipPath), { recursive: true });
  fs.renameSync(zipTmp, zipPath);
} catch (e) {
  // Clean up the partial temp archive; never leave it to be mistaken for the real one.
  try { if (fs.existsSync(zipTmp)) fs.unlinkSync(zipTmp); } catch {}
  console.error('[build_offline] ZIP creation FAILED. The existing ' + path.basename(zipPath) + ' was left untouched.');
  console.error('[build_offline] cause: ' + (e.code === 'ENOENT'
    ? 'the `zip` command is not on PATH — install it, or run tools/build_offline.ps1 (PowerShell Compress-Archive) on Windows'
    : (e.message || String(e)).split('\n')[0]));
  process.exit(1);
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

console.log('[build_offline] done. ZIP: ' + zipPath);
