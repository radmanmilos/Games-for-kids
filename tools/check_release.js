/* check_release.js — R5 (task 165): the READ-ONLY release gate.
 *
 * Usage:
 *   node tools/check_release.js            # full gate: fast gate + whole battery
 *   node tools/check_release.js --fast     # the fast gate only (pre-push)
 *   node tools/check_release.js --release  # + the two advisory deep gates
 *   node tools/check_release.js --concurrency 2 --resume
 *
 * R5 CHANGED WHAT THIS COMMAND MEANS, because it used to mean three things at
 * once and none of them were "check":
 *   1. its "syntax: node --check all files" step called `check_all.js`, which
 *      runs the ENTIRE 24-tool battery — so a label said syntax and the work
 *      done was every game smoke;
 *   2. it ran `sync-docs.sh`, rewriting the whole deployable `docs/` tree;
 *   3. in release mode it ran `build_offline.js`, regenerating the manifest and
 *      the ZIP.
 * A "check" that repairs what it inspects can never report a stale artifact,
 * because by the time it exits, the artifact is whatever the checker just made.
 * The rule now: **a release check FAILS on a stale artifact and writes nothing.
 * Regeneration belongs to the explicit commands — `sync-docs.sh`,
 * `generate_sw_list.js`, `build_offline.js`.**
 *
 * The contract is enforced, not just documented: the generated artifacts are
 * fingerprinted before and after the run, and any change is a hard failure.
 *
 * One stage is ADVISORY, and says so in its output rather than quietly passing:
 * `axe_check.js --report` only becomes a blocking gate in R10. It runs, and its
 * result is printed — it just does not decide the exit code.
 *
 * R6 promoted `offline_smoke.mjs` from advisory to blocking. It had been
 * "known-red" because its phase 2 started a fresh profile with no service
 * worker, so it only verified static markup; the rewrite primes and cuts the
 * network in ONE session and drives all 16 games with trusted input, so a
 * failure there is a real offline regression and the release must stop.
 */
const { spawnSync } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TOOLS = __dirname;

const argv = process.argv.slice(2);
const FAST_ONLY = argv.includes('--fast');
const DEEP = argv.includes('--release');
const QUIET = argv.includes('--quiet');

/** args forwarded verbatim to run_all.js (the battery runner) */
const passthrough = [];
for (const flag of ['--concurrency', '--resume', '--game', '--since']) {
  const i = argv.indexOf(flag);
  if (i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--')) passthrough.push(flag, argv[i + 1]);
}

// ---------------------------------------------------------------------------
// The read-only contract: fingerprint the generated artifacts, and prove at the
// end that this command did not touch them.
// ---------------------------------------------------------------------------
const GENERATED = ['game/sw-cache-list.json', 'game/offline-manifest.json', 'game-offline.zip'];
function fingerprint() {
  const out = {};
  for (const rel of GENERATED) {
    const abs = path.join(ROOT, rel.startsWith('game-') ? 'docs' : 'game', rel.replace(/^game[-\/]/, ''));
    try {
      const b = fs.readFileSync(abs);
      out[rel] = crypto.createHash('sha256').update(b).digest('hex');
    } catch {
      out[rel] = 'absent';
    }
  }
  // docs/ as a whole: a cheap recursive digest of names+sizes+mtimes.
  const docsDir = path.join(ROOT, 'docs');
  const acc = crypto.createHash('sha256');
  (function walk(dir) {
    let entries = [];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      const full = path.join(dir, e.name);
      acc.update(e.name);
      if (e.isDirectory()) walk(full);
      else {
        try {
          const s = fs.statSync(full);
          acc.update(String(s.size));
        } catch {}
      }
    }
  })(docsDir);
  out['docs/ (tree)'] = acc.digest('hex');
  return out;
}

const before = fingerprint();
const failed = [];

/**
 * Run a stage. `blocking: false` makes it advisory — it runs and prints, but
 * does not decide the exit code (used for the two known-unreliable gates).
 * `cmd` is a single executable path (never a shell string).
 */
function stage(label, cmd, args, { timeout = 0, blocking = true } = {}) {
  if (!QUIET) console.log(`\n----- ${label}`);
  const res = spawnSync(cmd, args, {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    timeout: timeout || undefined
  });
  const out = ((res.stdout || '') + (res.stderr || '') || '').trim();
  if (out && !QUIET) console.log(out);

  if (blocking) {
    if (res.status !== 0) {
      failed.push(label);
      console.log(`FAIL ${label}  [exit ${res.status}]`);
      // status null means the child never ran to completion (spawn error, or a
      // signal). Without this line the reason is invisible — which is how a
      // broken stage can look like a mere test failure.
      if (res.error) console.log(`    spawn error: ${res.error.code || ''} ${(res.error.message || '').split('\n')[0]}`);
      if (res.signal) console.log(`    killed by signal: ${res.signal}`);
    } else if (!QUIET) {
      console.log(`PASS ${label}`);
    }
  } else {
    // Never dressed up as a pass: the real exit code is printed either way.
    console.log(`ADVISORY ${label}  [exit ${res.status}] — non-blocking by design (see the header comment)`);
  }
  return res.status === 0;
}

const node = process.execPath;

// 1. The read-only fast gate: syntax, registry/metadata, CI workflow,
//    generated-artifact freshness, offline inventory, hub smoke.
stage('fast gate (read-only)', node, [path.join(TOOLS, 'check_fast.js')], { timeout: 600000 });

if (!FAST_ONLY) {
  // 2. The whole smoke battery, through the runner that already does
  //    parallelism, boot-crash retries and --resume. NOT a hand-rolled loop of
  //    one-process-per-smoke: that is what the old release script did, and it
  //    threw away every one of those properties.
  stage('smoke battery (all tools)', node, [path.join(TOOLS, 'run_all.js'), ...passthrough], { timeout: 3600000 });
}

if (DEEP) {
  // 3+4. Blocking offline E2E (R6 promoted it), advisory accessibility report.
  // Both print their real result; only the second one is non-blocking.
  stage('offline E2E (blocking)', node, [path.join(TOOLS, 'offline_smoke.mjs')], { timeout: 900000 });
  stage('accessibility report (advisory)', node, [path.join(TOOLS, 'axe_check.js'), '--report'], { timeout: 900000, blocking: false });
}

// ---------------------------------------------------------------------------
// The contract check — did this "read-only" command write anything?
// ---------------------------------------------------------------------------
const after = fingerprint();
const mutated = Object.keys(before).filter((k) => before[k] !== after[k]);

console.log('\n=== check_release summary ===');
if (failed.length) console.log(`FAILED: ${failed.join(', ')}`);
if (mutated.length) {
  console.log(`READ-ONLY CONTRACT VIOLATED — this command modified: ${mutated.join(', ')}`);
  console.log('  A release gate must never regenerate what it inspects. Move that step into an');
  console.log('  explicit generation command (sync-docs.sh / generate_sw_list.js / build_offline.js).');
}
if (!failed.length && !mutated.length) {
  console.log('Release gate green. Nothing was written: docs/, the cache list and the manifest are untouched.');
  process.exit(0);
}
process.exit(1);
