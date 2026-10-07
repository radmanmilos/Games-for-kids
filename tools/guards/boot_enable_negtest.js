/* boot_enable_negtest.js - negative test for the task 214 boot fix in
   tools/headless.js (NOT a smoke; run explicitly).
 *
 * The bug: the three renderer-session enable commands (Page.enable,
 * Runtime.enable, Network.enable) ran AFTER the boot retry loop. A Chrome whose
 * browser process answered /json/version + Target.* but whose renderer never
 * enabled the session threw a bare `CDP Page.enable (id 3) got no response
 * within 30000ms` straight out of start() with ZERO checks. run_all.js retried
 * the whole tool, but every retry re-created Chrome and re-hit the same 30s
 * wall. That is exactly the 2026-10-07 parent_smoke.js CI leg (0 checks, exit 1,
 * only red leg out of 22). The session enable belongs INSIDE the boot loop so a
 * wedged renderer counts as a failed boot attempt and gets a fresh Chrome.
 *
 * Two rules this file is written around (registry_guards_negtest.js):
 *   1. The mutation must stay SYNTACTICALLY VALID - a guard that only "fails"
 *      by breaking the JS parse is a crash, not a detection.
 *   2. The detection comes from the scenario's own output, not a non-zero exit.
 *
 * Usage:  node tools/guards/boot_enable_negtest.js
 * Exit 0 = the three enables are inside the boot retry loop and the mutation
 * round-trip works; exit 1 = the invariant is broken or the restore failed. */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const HEADLESS = path.join(ROOT, 'tools', 'headless.js');
const orig = fs.readFileSync(HEADLESS, 'utf8');
/* Windows checkouts use CRLF; the mutation searches and builds blocks with \n
   joins, so normalize once and write back with the file's own line ending. */
const EOL = orig.includes('\r\n') ? '\r\n' : '\n';
const text = orig.replace(/\r\n/g, '\n');

/* The invariant: the session-enable calls sit inside the boot-retry loop, i.e.
   between the `for (let attempt = 0;` line and the `if (!session)` throw that
   follows the loop. Moving them after that throw (the original bug) must make
   this test fail. */
const LOOP_OPEN = 'for (let attempt = 0; attempt < BOOT_ATTEMPTS && !session; attempt++)';
const SESSION_THROW = '  if (!session) {';
const inline = text.split('\n');
const loopIdx = inline.findIndex(l => l.includes(LOOP_OPEN));
const throwIdx = inline.findIndex((l, i) => i > loopIdx && l.includes(SESSION_THROW));
const between = loopIdx >= 0 && throwIdx > loopIdx ? inline.slice(loopIdx, throwIdx).join('\n') : '';
const ENABLES = ['Page.enable', 'Runtime.enable', 'Network.enable'];
const SESSION_ASSIGN = 'session = { dbg, sessionId, c, version };';

let failures = 0;
function report(name, ok, info) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  -- ' + info : ''}`);
  if (!ok) failures++;
}

report('boot loop is present in headless.js', loopIdx !== -1);
report('all three session enables sit inside the boot loop (before the !session throw)',
  loopIdx >= 0 && throwIdx > loopIdx && ENABLES.every(e => between.includes(`send('${e}')`)),
  ENABLES.map(e => `send('${e}')=${between.includes(`send('${e}')`)}`).join(' '));
report('the session object carries the derived c handle (enables ran before assignment)',
  text.includes(SESSION_ASSIGN));

// --- Prove the check can fail: move the enables after the throw, as it was ----
let mutated = orig;
try {
  if (loopIdx === -1 || throwIdx === -1) throw new Error('could not locate the boot loop to mutate - test is stale');
  const IN_LOOP = [
    "        const c = { send: (m, p) => dbg.send(m, p, sessionId), on: (m, fn) => dbg.on(m, fn) };",
    "        await c.send('Page.enable');",
    "        await c.send('Runtime.enable');",
    "        await c.send('Network.enable');",
    "        session = { dbg, sessionId, c, version };",
  ].join('\n');
  if (!text.includes(IN_LOOP)) throw new Error('expected in-loop enable block not found - test is stale');
  /* Revert to the pre-fix shape: session assigned right on attach inside the
     loop, the three enables plus the c handle built after the loop's throw. */
  const withoutInLoop = text.replace(IN_LOOP, '        session = { dbg, sessionId, version };');
  const after = withoutInLoop.replace(
    'const { dbg, sessionId, c } = session;',
    'const { dbg, sessionId } = session;\n  const c = { send: (m, p) => dbg.send(m, p, sessionId), on: (m, fn) => dbg.on(m, fn) };\n  await c.send(\'Page.enable\');\n  await c.send(\'Runtime.enable\');\n  await c.send(\'Network.enable\');',
  );
  if (after === text || after.includes('session = { dbg, sessionId, c, version };')) {
    throw new Error('mutation produced no change - cannot prove the guard fails');
  }
  const mutatedFile = after.replace(/\n/g, EOL);
  execFileSync(process.execPath, ['--check', HEADLESS], { cwd: ROOT, encoding: 'utf8' });
  fs.writeFileSync(HEADLESS, mutatedFile);
  const mutatedInline = after.split('\n');
  const mThrowIdx = mutatedInline.findIndex((l, i) => i > loopIdx && l.includes(SESSION_THROW));
  const mBetween = mThrowIdx > loopIdx ? mutatedInline.slice(loopIdx, mThrowIdx).join('\n') : '';
  const movedOut = !ENABLES.some(e => mBetween.includes(`send('${e}')`));
  report('guard can fail: when the enables move out, it detects it', movedOut,
    movedOut ? 'enables moved after the !session throw' : 'mutation ineffective — guard may be vacuous');
} catch (e) {
  report('guard can fail: mutation round-trip completes', false, String(e && e.message || e));
} finally {
  fs.writeFileSync(HEADLESS, orig);
}

// --- 3. Prove the restore actually restored -----------------------------------
const restored = fs.readFileSync(HEADLESS, 'utf8');
report('headless.js restored after mutation', restored === orig && restored.includes(SESSION_ASSIGN));

console.log(`\nboot_enable_negtest: ${failures} failure(s)`);
process.exit(failures ? 1 : 0);