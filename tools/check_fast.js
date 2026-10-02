/* check_fast.js — R5 (task 165): the read-only fast gate, as ONE command.
 *
 * Read-only by construction: it only ever runs tools that validate, plus the
 * hub smoke. It writes nothing, so it is safe to run at any time and safe to
 * run concurrently with real work.
 *
 * This exists because the "fast gate" used to exist only as four separate steps
 * inside .github/workflows/ci.yml, which meant a developer could not run "what
 * CI's fast job runs" without reading the workflow — and the two drifted. The
 * list below is now the single definition; ci.yml calls this script.
 *
 * Deliberately NOT here (see AGENTS.md → "Validate with the smallest relevant
 * command"): the 23-smoke game battery. That is what `run_all.js` is for, and
 * running it here is what made the old `check_all.js` "syntax" step silently
 * re-run everything.
 *
 * Usage:  node tools/check_fast.js           # run the gate
 *         node tools/check_fast.js --quiet   # only the summary
 * Exit 0 = gate green, 1 = at least one stage failed (all stages still run, so
 * one failure never hides the others — the same rule as the CI matrix).
 */
const { spawnSync } = require('child_process');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TOOLS = __dirname;
const QUIET = process.argv.slice(2).includes('--quiet');

// name -> [script, extra args]. Order is cheapest-and-most-fundamental first:
// if syntax is broken, nothing after it can be trusted.
const STAGES = [
  ['syntax', 'check_syntax.js', []],
  ['registry/metadata', 'validate_pages.js', []],
  ['ci workflow', 'validate_workflow.js', []],
  ['scan-alert guards', 'check_scan_alerts.js', ['--quiet']],
  ['generated artifacts', 'validate_generated.js', []],
  ['offline inventory', 'validate_offline.js', ['--quiet']],
  ['hub smoke', 'hub_smoke.js', []]
];

const failed = [];
const timings = [];

// A smoke exiting non-zero with ZERO checks never booted Chrome (port/profile
// contention) — it is not an assertion failure. `run_all.js` has retried these
// twice since task 152 for exactly this reason, and without the same rule here
// the fast gate itself would go red on a flake. Same threshold, same meaning.
const LAUNCH_RETRIES = 2;

function runStage(label, script, args, attempt = 0) {
  const started = Date.now();
  const res = spawnSync(process.execPath, [path.join(TOOLS, script), ...args], {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    timeout: 300000
  });
  const secs = ((Date.now() - started) / 1000).toFixed(1);
  const out = ((res.stdout || '') + (res.stderr || '')) || '';
  const passed = (out.match(/^PASS /gm) || []).length;
  const failedChecks = (out.match(/^FAIL /gm) || []).length;

  if (res.status !== 0 && passed === 0 && failedChecks === 0 && attempt < LAUNCH_RETRIES) {
    if (!QUIET) console.log(`     ${label}: boot crash (exit ${res.status}, 0 checks) — retry ${attempt + 1}/${LAUNCH_RETRIES}`);
    return runStage(label, script, args, attempt + 1);
  }
  return { ok: res.status === 0, secs, out, res };
}

for (const [label, script, args] of STAGES) {
  const r = runStage(label, script, args);
  timings.push({ label, ok: r.ok, secs: r.secs });

  if (r.ok) {
    if (!QUIET) console.log(`PASS ${label}  [${script}, ${r.secs}s]`);
  } else {
    failed.push(label);
    // The failing stage's own output is the diagnostic — never swallow it.
    const out = r.out.trim();
    console.log(`FAIL ${label}  [${script}, ${r.secs}s]`);
    if (out) console.log(out.split('\n').map((l) => '    ' + l).join('\n'));
    if (r.res.error) console.log(`    ${r.res.error.message}`);
  }
}

console.log('\n=== check_fast summary ===');
for (const t of timings) console.log(`  ${t.ok ? 'ok  ' : 'FAIL'}  ${t.label} (${t.secs}s)`);
if (failed.length) {
  console.log(`\n${failed.length} of ${STAGES.length} stages FAILED: ${failed.join(', ')}`);
  console.log('Note: every stage ran, so this list is complete — not just the first failure.');
  process.exit(1);
}
console.log(`\nAll ${STAGES.length} fast stages green. (This gate writes nothing; it never regenerates or syncs.)`);
process.exit(0);
