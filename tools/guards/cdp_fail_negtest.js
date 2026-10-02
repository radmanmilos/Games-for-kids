/* cdp_fail_negtest.js - negative test for the task 177d harness fix in
   tools/headless.js (NOT a smoke; run explicitly).
 *
   The bug: when the DevTools websocket drops, cdp()'s fail() rejected every
   in-flight command. A rejected promise with no awaiting caller is an UNHANDLED
   REJECTION, and Node kills the process - which is how Release QA died on the
   runner with nothing but `at fail (headless.js:178)` in the log, before it could
   print a single check or any diagnostic. run_all.js's `pass=0 fail=0` retry
   could never see it, because the process was killed by Node, not by the tool.
 *
   This drives the REAL failure through the public API only: start Chrome, leave
 * one command in flight and un-awaited, then kill Chrome via close(). The
 * scenario must reach `SURVIVED`, report the CDP failure once, and exit nonzero.
 *
 * Two rules this file is written around, both learned from registry_guards_negtest.js:
 *   1. The mutation must stay SYNTACTICALLY VALID - a guard that only "fails" by
 *      breaking the JS parse is a crash, not a detection.
 *   2. The detection must come from the scenario's own output, not merely a
 *      non-zero exit, so an unrelated failure gets no credit.
 *
 * Usage:  node tools/guards/cdp_fail_negtest.js
 * Exit 0 = the harness reports a dropped socket, and the negative control fails. */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const HEADLESS = path.join(ROOT, 'tools', 'headless.js');
const orig = fs.readFileSync(HEADLESS, 'utf8');

/* The exact clause that makes the rejection survivable. Mutating it away must
   bring the crash back - that is what proves this test can fail. */
const GUARD = 'err[CDP_FATAL] = true;';
const WITHOUT_GUARD = '/* mutated away by cdp_fail_negtest.js */';

const SCENARIO = `
const h = require(${JSON.stringify(path.join(ROOT, 'tools', 'headless.js'))});
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const a = await h.start();
  // A command that is in flight and NEVER awaited: nothing holds its rejection.
  // This is the shape that killed Release QA.
  const hung = a.evalp('new Promise(()=>{})');
  await sleep(700);                       // let it reach Chrome and hang there
  await a.close({ checkErrors: false });  // kills Chrome -> the socket drops
  // Sleep BEFORE attaching a handler. Node reports an unhandled rejection when
  // the microtask queue drains, so attaching early (or attaching right after
  // close(), which can finish within a tick when the debug port dies instantly)
  // would race the detector and make this test pass or fail at random. The wait
  // guarantees the detector has already run before the late catch is attached.
  await sleep(800);
  let msg = '(never rejected)';
  await Promise.race([hung.catch(e => { msg = e && e.message || String(e); }), sleep(300)]);
  console.log('SURVIVED');
  console.log('MESSAGE: ' + msg);
  // Leave process.exitCode intact: headless.js must mark this tool failed.
})().catch(e => { console.error('SCENARIO ERROR: ' + (e && e.message || e)); process.exit(3); });
`;

let failures = 0;
function report(name, ok, info) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  -- ' + info : ''}`);
  if (!ok) failures++;
}

function runScenario(label) {
  try {
    const out = execFileSync(process.execPath, ['-e', SCENARIO], { cwd: ROOT, encoding: 'utf8', timeout: 120000, stdio: ['ignore', 'pipe', 'pipe'] });
    return { code: 0, out, err: '' };
  } catch (e) {
    return { code: e.status === undefined ? -1 : e.status, out: e.stdout || '', err: e.stderr || '' };
  }
}

// --- 1. The fixed harness reports the fatal disconnect without crashing -------
const real = runScenario('fixed');
report('harness reaches cleanup and exits failed', real.code === 1 && /SURVIVED/.test(real.out),
  `exit=${real.code}`);
report('one named CDP failure is reported', (real.err.match(/\[headless\] Unhandled CDP failure:/g) || []).length === 1,
  real.err.match(/\[headless\] Unhandled CDP failure:.*$/m)?.[0] || 'missing diagnostic');
report('the failure names browser state and close code',
  /browser=(Chrome exited|Chrome still running)/.test(real.err) && /code=\d+/.test(real.err),
  real.err.match(/\[headless\] Unhandled CDP failure:.*$/m)?.[0] || 'missing socket/browser evidence');
report('the originating operation receives the CDP error',
  /MESSAGE: CDP websocket (closed unexpectedly|error)/.test(real.out),
  real.out.match(/MESSAGE: .*/) ? '' : 'no CDP error reached the operation');

// --- 2. Scope: a rejection that is NOT socket-death must still crash ----------
// The absorber exists only because a dead socket leaves promises that can never
// settle. If it swallowed ordinary unhandled rejections it would hide real harness
// bugs - so prove it does not.
const PLAIN = `
require(${JSON.stringify(HEADLESS)});
Promise.reject(new Error('ordinary harness bug'));
setTimeout(() => { console.log('SURVIVED'); process.exit(0); }, 300);
`;
try {
  const out = execFileSync(process.execPath, ['-e', PLAIN], {
    cwd: ROOT, encoding: 'utf8', timeout: 60000, stdio: ['ignore', 'pipe', 'pipe'],
  });
  report('a non-CDP rejection still crashes the tool', false, 'it was absorbed — scope too wide');
} catch (e) {
  const out = `${e.stdout || ''}`;
  const err = `${e.stderr || ''}`;
  report('a non-CDP rejection still crashes the tool',
    !/SURVIVED/.test(out) && /ordinary harness bug/.test(err),
    `exit=${e.status} absorbed=${/SURVIVED/.test(out)}`);
}

// --- 3. Remove the fix: the CDP crash MUST come back -------------------------
let mutated = orig;
try {
  if (!mutated.includes(GUARD)) throw new Error('could not find the guard clause to mutate - test is stale');
  mutated = mutated.replace(GUARD, WITHOUT_GUARD);
  fs.writeFileSync(HEADLESS, mutated);
  const broke = runScenario('mutated');
  // Keyed off the guard's OWN stack frame, not merely a non-zero exit, so an
  // unrelated failure earns no credit (registry_guards_negtest.js rule 2).
  const crashed = broke.code !== 0 && !/SURVIVED/.test(broke.out) && /at fail .*headless\.js/.test(broke.err);
  report('guard can fail: without the fix the process dies', crashed,
    crashed ? 'unhandled rejection at fail()' : `exit=${broke.code} frame=${/at fail/.test(broke.err)}`);
} finally {
  fs.writeFileSync(HEADLESS, orig);
}

// --- 4. Prove the restore actually restored -----------------------------------
const restored = fs.readFileSync(HEADLESS, 'utf8');
report('headless.js restored after mutation', restored === orig && restored.includes(GUARD));

console.log(`\ncdp_fail_negtest: ${failures} failure(s)`);
process.exit(failures ? 1 : 0);
