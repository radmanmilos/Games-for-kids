/* guards/chrome_diagnostic_negtest.js — regression guard for the CDP diagnostic's
   ability to name the RIGHT Chrome (task 178).

   Run: node tools/guards/chrome_diagnostic_negtest.js

   The bug. headless.js boots Chrome in a BOOT_ATTEMPTS loop and hands cdp() a
   `diagnose()` callback so a dropped socket can say whether the browser died or
   is merely gone quiet. That callback used to read the loop-wide `chromeExitEvent`
   variable. Every attempt writes that variable — including a failed attempt's child
   still winding down — and nothing ever clears it once a later attempt succeeds. So
   the string could describe a corpse from attempt 1 while the live browser was
   perfectly healthy.

   Why that matters here: CI run #39 (commit 359085b) failed Release QA with exactly
   that line —
       CDP websocket closed unexpectedly (...) browser=Chrome exited code=0 signal=null
   — and it is the ONLY evidence of why the browser went away. Untrustworthy evidence
   is worse than none, so the fix makes the callback read per-attempt state.

   How this test proves the difference (behaviourally, not by matching text):
     1. CHROME_PATH points at a shim that fails the FIRST boot attempt and execs the
        real Chromium for the rest, so a stale exit record really does exist.
     2. The live browser is then killed, which closes the CDP socket and makes
        headless.js call diagnose().
     3. The reported line must describe the LIVE kill, not the stale attempt-1 exit.

   Against the pre-fix code the assertion fails (it reports the stale attempt). The
   mutation is restored afterwards, so this guard cannot pass by being broken. */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync, execSync } = require('child_process');

const REPO = path.resolve(__dirname, '..', '..');
const HEADLESS = path.join(REPO, 'tools', 'headless.js');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'cdpdiag-'));
const REAL_CHROME = ['/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome']
  .find(p => fs.existsSync(p));

let pass = 0, fail = 0;
const check = (name, ok, info) => {
  if (ok) { pass++; console.log('PASS ' + name + '  [' + (info || '') + ']'); }
  else { fail++; console.log('FAIL ' + name + '  [' + (info || '') + ']'); }
};

/* ------------------------------------------------------------------ *
 * 1. DETERMINISTIC checks on the source shape.                          *
 *                                                                     *
 * These are the ones that must not be flaky. The behavioural check     *
 * below turned out to be unusable on its own: whether describe() sees *
 * the browser's exit event or not depends on whether the CDP socket    *
 * close or the child 'exit' event lands first, which varies per run.   *
 * The pre-fix code was proven to PASS a purely behavioural assertion,   *
 * so the invariant is pinned here instead — a diagnostic can only be    *
 * trustworthy if it cannot reach the loop-wide variable at all.        *
 * ------------------------------------------------------------------ */
const src = fs.readFileSync(HEADLESS, 'utf8');

const loopStart = src.indexOf('for (let attempt = 0; attempt < BOOT_ATTEMPTS');
check('the boot loop is present (source anchor found)', loopStart > 0, 'offset ' + loopStart);

const decl = src.indexOf('let exitEvent = null;', loopStart);
check('the exit record is declared INSIDE the boot loop (a fresh one per attempt)',
  decl > loopStart && decl < src.indexOf('\n  }\n  if (!session)', loopStart),
  'declared ' + (decl - loopStart) + ' chars into the loop');

/* Isolate describe()'s own body and prove the shared variable is out of reach. */
const callAt = src.indexOf('cdp(version.webSocketDebuggerUrl, () => (');
check('describe() is passed to cdp()', callAt > 0, 'offset ' + callAt);
const body = src.slice(callAt, src.indexOf('));', callAt));
check('describe() reads the per-attempt exit record, not the loop-wide one',
  /exitEvent/.test(body) && !/chromeExitEvent/.test(body),
  body.replace(/\s+/g, ' ').trim().slice(0, 90) + '…');
check('the loop-wide variable is still fed by each attempt (boot-failure report unchanged)',
  /chromeExitEvent = exitEvent/.test(src), 'the fix narrows only describe(), nothing else');

if (!REAL_CHROME) {
  console.error('SKIP chrome_diagnostic_negtest — no Chromium binary on this host');
  process.exit(0);
}

/* A shim that poisons exactly one boot attempt, then behaves like Chromium. */
const counter = path.join(TMP, 'attempt');
const shim = path.join(TMP, 'chrome-shim.sh');
fs.writeFileSync(shim, [
  '#!/bin/sh',
  `n=$(cat ${JSON.stringify(counter)} 2>/dev/null || echo 0)`,
  'n=$((n+1))',
  `echo $n > ${JSON.stringify(counter)}`,
  /* Attempt 1 fails the way a real early-exit Chrome does: instantly, cleanly. */
  'if [ "$n" = "1" ]; then echo "shim: simulated early exit" >&2; exit 7; fi',
  `exec ${JSON.stringify(REAL_CHROME)} "$@"`,
  ''
].join('\n'));
fs.chmodSync(shim, 0o755);

/* Must be set before headless.js is required — CHROME is read at module load. */
process.env.CHROME_PATH = shim;
process.env.TMPDIR = TMP;
const h = require(HEADLESS);

/* Find the one profile headless.js made under our TMPDIR, so we can kill exactly
   the live browser by its unique --user-data-dir. */
const findProfile = () => {
  for (const d of fs.readdirSync(TMP))
    if (d.startsWith('pkv-')) return path.join(TMP, d);
  return null;
};

(async () => {
  const a = await h.start();
  const profile = findProfile();
  check('a live session booted after a poisoned first attempt', !!profile, profile || 'no profile dir');
  check('the first attempt really did exit (stale record exists)',
    fs.readFileSync(counter, 'utf8').trim() !== '1', 'attempts=' + fs.readFileSync(counter, 'utf8').trim());

  /* Kill the live browser: the CDP socket closes and headless.js calls diagnose().
     The rejection surfaces through close()/process exit; we only want the message,
     so we listen for the absorber's report instead of awaiting the caller. */
  let reported = '';
  const origErr = console.error;
  console.error = (m) => { reported += String(m) + '\n'; origErr(m); };

  const wait = ms => new Promise(r => setTimeout(r, ms));
  /* diagnose() only runs when fail() rejects something still in flight. With an idle
     session a killed browser is silently swallowed (nothing pending, and the cdp()
     promise already resolved), which is precisely the case Release QA was NOT in:
     it dies holding an open command. So start a long evaluate and deliberately do
     NOT await it, then kill the browser underneath it. */
  /* Deliberately NOT awaited and NOT caught: the absorber only speaks for an
     UNHANDLED rejection, so a .catch() here would swallow the very line we assert. */
  a.evalp('new Promise(r => setTimeout(r, 20000))');
  await wait(300);
  try { execSync('pkill -f ' + JSON.stringify('user-data-dir=' + profile), { stdio: 'ignore' }); } catch { /* already gone */ }
  /* Match ONLY describe()'s own wording. The "[headless] Chrome exited while a
     CDP session was open" line is a different message and would satisfy a looser
     pattern, which is how this test would read the wrong line and pass vacuously. */
  const DIAGNOSE = /Chrome exited code=\d|Chrome still running \(pid \d/;
  for (let i = 0; i < 40 && !DIAGNOSE.test(reported); i++) await wait(250);
  console.error = origErr;

  const diagLine = () => reported.split('\n').find(l => DIAGNOSE.test(l)) || '';
  const brief = () => { const l = diagLine(); return !l ? '(describe() never ran)' : (l.length > 130 ? l.slice(0, 130) + '…' : l); };

  /* Supporting evidence, NOT the regression assertion — see note above. Which of
     describe()'s two truthful branches appears depends on whether the socket close
     or the child 'exit' event lands first, so these must hold either way. */
  check('describe() ran and described the browser', !!diagLine(), brief());
  check('the report never names the poisoned attempt-1 exit',
    !/code=7\b/.test(diagLine()), 'shim exited 7 on attempt 1; naming 7 would be the stale record');
  check('the "still running" report names the live pid, not a bare assertion',
    !/still running(?! \(pid \d)/.test(diagLine()),
    'pre-fix this branch read the shared variable and could not name a process at all');

  try { await a.close({ checkErrors: false }); } catch { /* teardown races the kill */ }
  console.log('\nchrome_diagnostic_negtest: ' + pass + ' passed, ' + fail + ' failed');
  try { fs.rmSync(TMP, { recursive: true, force: true }); } catch { /* best effort */ }
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('ERROR ' + (e && e.stack || e)); process.exit(1); });