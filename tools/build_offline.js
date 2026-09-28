#!/usr/bin/env node
/* tools/build_offline.js — Node.js replacement for build_offline.ps1
   Generates game/sw-cache-list.json, produces docs/game-offline.zip,
   and writes game/offline-manifest.json with SHA256 and size for each asset.
   Usage: node tools/build_offline.js */
const { execSync } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const os = require('os');

const TOOLS = __dirname;
const REPO = path.resolve(TOOLS, '..');
const GAME = path.join(REPO, 'game');
const DOCS = path.join(REPO, 'docs');

console.log('[build_offline] regenerating sw-cache-list.json');
execSync('node ' + path.join(TOOLS, 'generate_sw_list.js'), { stdio: 'inherit' });

if (!fs.existsSync(DOCS)) fs.mkdirSync(DOCS, { recursive: true });

const swListPath = path.join(GAME, 'sw-cache-list.json');
if (!fs.existsSync(swListPath)) { console.error('Missing ' + swListPath); process.exit(2); }

const swList = JSON.parse(fs.readFileSync(swListPath, 'utf8'));
const manifest = {};
let failed = 0;

for (const entry of swList) {
  const rel = entry.replace(/^\//, '');
  const abs = path.join(GAME, rel);
  if (!fs.existsSync(abs)) {
    console.warn('Skipping missing file: ' + entry);
    failed++;
    continue;
  }
  const hash = crypto.createHash('sha256').update(fs.readFileSync(abs)).digest('hex');
  const size = fs.statSync(abs).size;
  manifest[entry] = { sha256: hash, size };
}

if (Object.keys(manifest).length === 0) { console.error('Refusing to write an empty offline manifest'); process.exit(2); }
if (failed > 0) { console.error('Offline manifest incomplete: ' + failed + ' of ' + swList.length + ' entries failed'); process.exit(2); }

const outPath = path.join(GAME, 'offline-manifest.json');
fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2));
console.log('[build_offline] wrote ' + outPath + ' (' + Object.keys(manifest).length + ' entries)');

const zipPath = path.join(DOCS, 'game-offline.zip');
if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
console.log('[build_offline] creating ZIP: ' + zipPath);

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'offline-zip-'));
fs.cpSync(GAME, tmpDir, { recursive: true });
execSync('cd ' + JSON.stringify(tmpDir) + ' && zip -r ' + JSON.stringify(zipPath) + ' .', { stdio: 'inherit' });
fs.rmSync(tmpDir, { recursive: true, force: true });

console.log('[build_offline] done. ZIP: ' + zipPath);
