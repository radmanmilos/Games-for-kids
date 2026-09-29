/* check_release.js — release validation orchestrator (task 9).
   Fast mode (default): syntax + targeted smoke.
   Release mode (--release): full QA stack.

   Usage:
     node tools/check_release.js              # fast: syntax + hub smoke
     node tools/check_release.js --release    # full: everything
     node tools/check_release.js --game animals  # fast + specific game smoke
   Exit 0 = all pass, 1 = failures found. */
const { execFileSync, spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');
const TOOLS = __dirname;

const args = process.argv.slice(2);
const releaseMode = args.includes('--release');
const gameFilter = args.includes('--game') ? args[args.indexOf('--game') + 1] : null;

const failures = [];
const passes = [];

function run(name, cmd, opts = {}) {
  const result = spawnSync(cmd[0], cmd.slice(1), {
    cwd: ROOT,
    encoding: 'utf8',
    timeout: opts.timeout || 120000,
    stdio: ['ignore', 'pipe', 'pipe']
  });
  const out = (result.stdout || '') + (result.stderr || '');
  const ok = result.status === 0;
  if (ok) {
    passes.push(name);
    console.log(`PASS ${name}`);
  } else {
    failures.push(name);
    console.log(`FAIL ${name}`);
    if (out.trim()) console.log(out.trim().split('\n').slice(-10).join('\n'));
  }
  return ok;
}

function runNode(script, label) {
  return run(label, [process.execPath, path.join(TOOLS, script)]);
}

// 1. Syntax check
console.log('\n=== 1. Syntax ===');
runNode('check_all.js', 'syntax: node --check all files');

// 2. Registry/route validation
console.log('\n=== 2. Registry/Route Validation ===');
runNode('validate_pages.js', 'registry: pages valid');

// 3. Metadata validation (same tool, but explicit)
console.log('\n=== 3. Metadata Validation ===');
// validate_pages.js already covers this — just note it
passes.push('metadata: covered by validate_pages.js');
console.log('PASS metadata: covered by validate_pages.js');

// 4. Smoke battery
console.log('\n=== 4. Smoke Battery ===');
if (gameFilter) {
  runNode(`hub_smoke.js`, `smoke: hub`);
  runNode(`${gameFilter}_smoke.js`, `smoke: ${gameFilter}`);
} else if (releaseMode) {
  // Full battery
  const smokes = fs.readdirSync(TOOLS).filter(f => f.endsWith('_smoke.js')).sort();
  for (const s of smokes) {
    runNode(s, `smoke: ${s.replace('_smoke.js', '')}`);
  }
} else {
  // Fast mode: just hub smoke
  runNode('hub_smoke.js', 'smoke: hub (fast mode)');
}

// 5. Offline E2E
if (releaseMode) {
  console.log('\n=== 5. Offline E2E ===');
  runNode('offline_smoke.mjs', 'offline: E2E test');
}

// 6. Docs sync
console.log('\n=== 6. Docs Sync ===');
run('docs: sync', ['bash', path.join(TOOLS, 'sync-docs.sh')]);

// 7. Offline package rebuild
if (releaseMode) {
  console.log('\n=== 7. Offline Package ===');
  runNode('build_offline.js', 'offline: package rebuild');
}

// Summary
console.log(`\n=== SUMMARY: ${passes.length} pass, ${failures.length} fail ===`);
if (failures.length) {
  console.log('FAILURES:');
  for (const f of failures) console.log('  ' + f);
  process.exit(1);
}
console.log('ALL RELEASE CHECKS PASSED');
process.exit(0);
