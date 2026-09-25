/* check_all.js — one-command validation ritual (dev only, no deps).
   Sequence: (1) node --check over every JS/MJS file under game/ and tools/;
             (2) run the parallel smoke battery via run_all.js;
   Optional flags after the smoke battery:
     --docs     run tools/sync-docs.sh (mirror game/ -> docs/ for GitHub Pages)
     --offline  run tools/build_offline.ps1 (rebuild offline package + cache list)
   Exit code is non-zero if any stage failed. Run from anywhere:
     node tools/check_all.js
     node tools/check_all.js --docs --offline       # full pre-commit ritual
     node tools/check_all.js --game racing3d        # passes through to run_all
*/
const { spawn, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const GAME = path.join(ROOT, 'game');
const TOOLS = path.join(ROOT, 'tools');

const args = process.argv.slice(2);
const doDocs = args.includes('--docs');
const doOffline = args.includes('--offline');
// forwarded to run_all (--game/--since/--concurrency/positionals)
const fwdArgs = args.filter(a => a !== '--docs' && a !== '--offline');

for (const dir of [GAME, TOOLS]) {
  if (!fs.existsSync(dir)) { console.error('Missing directory: ' + dir); process.exit(1); }
}

/* ---- stage 1: syntax check all JS/MJS under a directory (recursive) ---- */
function collectJs(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === 'node_modules' || ent.name.startsWith('.')) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) collectJs(full, out);
    else if (ent.isFile() && /\.(js|mjs)$/.test(ent.name)) out.push(full);
  }
  return out;
}

function runCheck() {
  const files = collectJs(GAME).concat(collectJs(TOOLS));
  console.log('=== Syntax check: node --check (' + files.length + ' files) ===');
  let failed = 0;
  for (const f of files) {
    const r = spawnSync(process.execPath, ['--check', f], { encoding: 'utf8' });
    if (r.status !== 0) {
      failed++;
      console.error('SYNTAX FAIL: ' + path.relative(ROOT, f) + '\n' + (r.stderr || r.stdout || '').trim());
    }
  }
  return failed;
}

function runAsync(cmd, argsList, opts = {}) {
  return new Promise((resolve) => {
    const child = spawn(cmd, argsList, { stdio: 'inherit', cwd: opts.cwd || ROOT, shell: false });
    child.on('close', code => resolve(code === 0));
  });
}

function findBash() {
  const cands = [
    process.env.BASH,
    'C:/Program Files/Git/bin/bash.exe',
    'C:/Program Files (x86)/Git/bin/bash.exe'
  ].filter(Boolean);
  for (const c of cands) if (fs.existsSync(c)) return c;
  return null; // fall back to PATH
}

(async () => {
  const syntaxFails = runCheck();
  if (syntaxFails) { console.error(syntaxFails + ' file(s) failed node --check'); process.exit(1); }
  console.log('Syntax OK.');

  const runnerArgs = [path.join(TOOLS, 'run_all.js'), ...fwdArgs];
  const smokeOk = await runAsync(process.execPath, runnerArgs);
  if (!smokeOk) { console.error('Smoke battery FAILED — fix before docs/offline.'); process.exit(1); }

  if (doDocs) {
    console.log('\n=== Sync docs (game/ -> docs/) ===');
    const bash = findBash();
    const cmd = bash ? bash : 'bash';
    const ok = await runAsync(cmd, [path.join(TOOLS, 'sync-docs.sh')]);
    if (!ok) { console.error('docs sync failed'); process.exit(1); }
  }
  if (doOffline) {
    console.log('\n=== Rebuild offline package ===');
    const ok = await runAsync('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', path.join(TOOLS, 'build_offline.ps1')]);
    if (!ok) { console.error('offline rebuild failed'); process.exit(1); }
  }

  console.log('\ncheck_all complete: syntax + ' + (doDocs ? 'docs + ' : '') + (doOffline ? 'offline + ' : '') + 'smokes all green.');
  process.exit(0);
})().catch(e => { console.error('check_all ERROR:', e); process.exit(1); });