/* run_all.js — parallel smoke-suite runner (dev only, no deps).
   Every tools/*_smoke.js boots its own headless Chrome on a UNIQUE temp profile
   and debug port (tools/headless.js), so the whole battery is safe to run
   in parallel. This tool spawns smokes with a capped worker pool, streams each
   one's output as a clean block, and exits non-zero if any smoke failed.

   Usage:
     node tools/run_all.js                     # run the entire battery
     node tools/run_all.js racing3d_smoke.js   # positional: run only those
     node tools/run_all.js --game racing3d     # filter by mapped game/page name
     node tools/run_all.js --since <sha>       # only smokes for files changed since <sha>
     node tools/run_all.js --watch             # re-run affected smokes on game/ change
     node tools/run_all.js --concurrency 6     # workers (default 4, or $RUN_ALL_CONCURRENCY)
     node tools/run_all.js --sequential        # same as --concurrency 1
     node tools/run_all.js --resume [dir]      # skip smokes that already passed in <dir>
     node tools/run_all.js --list              # print the battery and exit
     node tools/run_all.js --list --json        # same, as a JSON array (used by CI)

   Constrained hosts (phone / Acode sandbox): the process can be killed outright on
   a CPU/RAM spike, losing the whole run. Use `--concurrency 1 --sequential` there,
   and `--resume` to skip what already passed (see task 156).

   Mapping: game-file pattern -> smoke script(s). Broad/unknown changes (shared/*,
   audio, sw.js) default to the WHOLE battery (safe; it is parallel, so cheap).
*/
const { execFile, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { all: registryAll, byId } = require('./registry.js');

const TOOLS = __dirname;
const ROOT = path.resolve(__dirname, '..');
const GAME = path.join(ROOT, 'game');
const SMOKE_DIR = TOOLS;
/* Concurrency default. Each smoke boots its own headless Chrome, so concurrency
   is the dominant driver of peak CPU/RAM. On a constrained host (phone / Acode
   sandbox) the process can be killed outright on a usage spike, which loses the
   whole run — override with RUN_ALL_CONCURRENCY=1 or --concurrency 1. */
const CONCURRENCY_DEFAULT = parseInt(process.env.RUN_ALL_CONCURRENCY || '4', 10) || 4;
const TMPDIR = process.env.TMPDIR || process.env.TEMP || '/tmp';
const CHILD_TIMEOUT_MS = 300000;
const WATCH_POLL_MS = 700;
const LAUNCH_RETRIES = 2;

const args = process.argv.slice(2);
const positional = [];
const opts = { concurrency: CONCURRENCY_DEFAULT, watch: false, list: false, json: false, resume: null };
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === '--watch') opts.watch = true;
  else if (a === '--list') opts.list = true;
  else if (a === '--json') opts.json = true;
  else if (a === '--sequential') opts.concurrency = 1;
  else if (a === '--resume') opts.resume = args[i + 1] && !args[i + 1].startsWith('--') ? args[++i] : path.join(TMPDIR, 'run_all_resume');
  else if (a.startsWith('--concurrency=')) opts.concurrency = parseInt(a.split('=')[1], 10) || CONCURRENCY_DEFAULT;
  else if (a === '--concurrency') { opts.concurrency = parseInt(args[i + 1], 10) || CONCURRENCY_DEFAULT; i++; }
  else if (a.startsWith('--game=')) opts.game = a.split('=')[1];
  else if (a === '--game') { opts.game = args[i + 1]; i++; }
  else if (a.startsWith('--since=')) opts.since = a.split('=')[1];
  else if (a === '--since') { opts.since = args[i + 1]; i++; }
  else positional.push(a);
}
if (!(opts.concurrency >= 1)) opts.concurrency = CONCURRENCY_DEFAULT;

/* ---- game-file -> smoke mapping (reads from app-registry.js) ---- */
const PAGE_SMOKE = {};
for (const app of registryAll()) { PAGE_SMOKE[app.id] = app.smoke; }
/* ---- game-file -> smoke mapping ------------------------------------------
   This used to be a hand-written GAME_SMOKE table, which was a second app list
   that had to be kept in step with the registry by hand (and had already drifted:
   `candy.js` vs the registry's `matching_game`). It is now DERIVED, in both
   directions:
     - games/<id>.js        -> the smoke of the app with that id, where they agree
     - games/<x>.js         -> the smokes of every page that loads it, for shared
                                modules (adventure.js is loaded by 4 pages, so all
                                4 of their smokes are relevant)
   The leftover cases (kids_games.js -> classroom, racing-config.js -> racing3d)
   are declared here explicitly because they are module/config files with no id of
   their own. That list is short, has no app metadata in it, and is verified
   against the registry by tools/guards/registry_guards_negtest.js - so if a page
   starts loading a new shared module, the "page loads" rule picks it up and this
   table cannot silently go stale the way GAME_SMOKE could. */
const SHARED_MODULE_SMOKE = {
  'kids_games': ['classroom_smoke'],
  'racing-config': ['racing3d_smoke'],
  // racing3d-config.js is config for the racing3d module; no page loads it
  // directly, so the page rule below cannot reach racing3d_smoke.
  'racing3d-config': ['racing3d_smoke'],
};
/* Games file -> id. Only needed where the filename and the registry id differ. */
const GAME_FILE_ALIAS = { candy: 'matching_game', 'kitty-standalone': 'explorer' };

/* game/games/adventure.js is a shared adventure ENGINE, loaded by the driving,
   ocean, dino and space pages. adventure_smoke.js drives that engine through its
   own page (pages/adventure.html), which no longer exists as a registry app, so
   the "pages that load it" rule below cannot reach its smoke - hence naming it
   here. The other four come from that rule. */
const ENGINE_SMOKE = { adventure: ['adventure_smoke'] };

/* The game-file smoke table that used to live here was hand-written and had
   already drifted from app-registry.js (candy.js vs matching_game, explorer vs
   kitty-standalone). A negative test for the derived version asserts that every
   engine/shared module listed above is genuinely reachable, so this declaration
   cannot quietly become an empty list that still "passes". */

function smokesForGameFile(base) {
  // A shared module's own smoke comes FIRST, then every page that loads it.
  // adventure.js is the shared engine for driving/ocean/dino/space, and its own
  // adventure_smoke drives it through a page that no longer exists in the registry,
  // so it is named explicitly; the other four come from the page-loading rule
  // below. Order is stable so --list output is reproducible.
  const named = SHARED_MODULE_SMOKE[base] || ENGINE_SMOKE[base];
  if (named && named.length) {
    const extra = pagesLoadingGame(base);
    return [...new Set([...named, ...extra])];
  }
  const app = byId(GAME_FILE_ALIAS[base] || base);
  if (app && app.smoke) return [app.smoke];
  return pagesLoadingGame(base);
}

/* Every page that loads game/games/<base>.js inherits that page's smoke. This is
   what covers shared modules like adventure.js without a hand-written list, and
   it cannot go stale: if a page starts (or stops) loading a module, the set moves
   with it. */
function pagesLoadingGame(base) {
  const dir = path.join(ROOT, 'game', 'pages');
  const hit = new Set();
  for (const page of fs.readdirSync(dir).filter(n => n.endsWith('.html'))) {
    if (!fs.readFileSync(path.join(dir, page), 'utf8').includes(`games/${base}.`)) continue;
    const app = byId(path.basename(page, '.html'));
    if (app && app.smoke) hit.add(app.smoke);
  }
  return [...hit].sort();
}
// broad patterns -> whole battery (safe default)
const BROAD = () => allSmokes();

function newliney(f) { return f.replace(/\\/g, '/'); }

function allSmokes() {
  return fs.readdirSync(SMOKE_DIR)
    .filter(n => n.endsWith('_smoke.js') && n.startsWith('_') === false)
    .sort();
}

/* Map a relative game/ path to the set of smoke scripts it affects. */
function mapFileToSmokes(rel) {
  rel = newliney(rel);
  const hit = [];
  if (!rel.startsWith('game/')) return hit;
  const p = rel.slice(5);
  if (p === 'index.html' || p === 'pages/index.html') return ['hub_smoke'];
  if (p === 'sw.js' || p === 'manifest.json' || p === 'offline-manifest.json' || p === 'sw-cache-list.json') return ['hub_smoke'];
  if (p.startsWith('shared/')) return BROAD();
  if (p.startsWith('pages/')) {
    const key = path.basename(p, '.html');
    if (PAGE_SMOKE[key]) { hit.push(PAGE_SMOKE[key]); }
  }
  if (p.startsWith('games/')) {
    const base = path.basename(p).replace(/\.(js|mjs)$/, '');
    hit.push(...smokesForGameFile(base));
  }
  if (p.startsWith('assets/')) return [];
  return hit.length ? [...new Set(hit)] : BROAD();
}

/* Resolve the list of smokes for the current invocation. */
function resolveSmokes() {
  let list;
  if (positional.length) {
    // An explicit filename is taken as given, so a release-gate tool that is not
    // part of the battery can still be run through this runner and inherit the
    // boot-crash retry: `node tools/run_all.js offline_smoke.mjs`. Adding it to
    // the battery instead would put a ~2-minute gate in every matrix leg.
    list = positional.map(n => (/\.(js|mjs)$/.test(n) ? n : n + '.js'));
    list = list.filter(n => fs.existsSync(path.join(SMOKE_DIR, n)));
    if (!list.length) { console.error('No matching smoke files given; see node tools/run_all.js --list'); process.exit(1); }
  } else if (opts.since) {
    list = smokesForGitDiff(opts.since);
  } else if (opts.game) {
    list = allSmokes().filter(n => n.includes(opts.game));
  } else {
    list = allSmokes();
  }
  // `_smoke.mjs` counts as a tool too: offline_smoke.mjs is the Release QA gate
  // and is deliberately NOT in the battery, but it is still run through this
  // runner (by explicit filename) so it inherits the boot-crash retry.
  return [...new Set(list.filter(n => /_smoke\.m?js$/.test(n)))];
}

/* --resume: skip smokes that already passed in a previous (possibly killed) run.
   Each finished smoke is written to <dir>/<smoke>.json as it lands, so a host
   that kills the process on a usage spike loses at most the one in-flight smoke
   instead of the entire battery. */
function resumePath(name) { return path.join(opts.resume, name.replace('_smoke.js', '.json')); }
function alreadyPassed(name) {
  try {
    const r = JSON.parse(fs.readFileSync(resumePath(name), 'utf8'));
    return r.code === 0 && r.fail === 0;
  } catch (e) { return false; }
}
function recordResume(name, rec) {
  try {
    fs.mkdirSync(opts.resume, { recursive: true });
    fs.writeFileSync(resumePath(name), JSON.stringify(rec));
  } catch (e) { /* resume is best-effort */ }
}

function smokesForGitDiff(since) {
  let changed;
  try {
    changed = execFile('git', ['-C', ROOT, 'diff', '--name-only', since, '--', 'game'],
      { timeout: 10000 }).stdout.split(/\r?\n/).filter(Boolean);
  } catch (e) {
    console.error('git diff unavailable (' + e.message + ') — running the whole battery.');
    return allSmokes();
  }
  const set = new Set();
  for (const f of changed) for (const s of mapFileToSmokes(f)) set.add(s);
  return set.size ? [...set].sort() : allSmokes();
}

/* Run a worker pool over smokes; print block output, collect results. */
async function runBatch(smokes, label) {
  if (!smokes.length) return [];
  console.log(`\n=== run_all: ${label} — ${smokes.length} smoke(s), concurrency ${opts.concurrency} ===`);
  const results = new Map();
  let next = 0;
  let active = 0;
  let done = 0;
  await new Promise((resolve) => {
    function launch(name, attempt = 0) {
      // --resume: a smoke that already passed in an earlier (killed) run is
      // reported from its checkpoint instead of being re-run.
      if (attempt === 0 && opts.resume && alreadyPassed(name)) {
        const prior = JSON.parse(fs.readFileSync(resumePath(name), 'utf8'));
        results.set(name, prior);
        console.log(`\n----- ${name} [exit 0, ${prior.pass} pass / 0 fail (from --resume checkpoint)]`);
        done++;
        if (done === smokes.length) resolve();
        else if (next < smokes.length) launch(smokes[next++]);
        return;
      }
      const child = spawn(process.execPath, [path.join(SMOKE_DIR, name)], { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] });
      const started = Date.now();
      let out = '';
      const timer = setTimeout(() => { console.log(`  [timeout ${CHILD_TIMEOUT_MS}ms] ${name}`); child.kill('SIGKILL'); }, CHILD_TIMEOUT_MS);
      child.stdout.on('data', d => { out += d; });
      child.stderr.on('data', d => { out += d; });
      child.on('close', code => {
        clearTimeout(timer);
        const ms = Date.now() - started;
        const pass = (out.match(/^PASS /gm) || []).length;
        const fail = (out.match(/^FAIL /gm) || []).length;
        const skip = (out.match(/^SKIP /gm) || []).length;
        // A boot crash means Chrome never came up, not that an assertion failed.
        // Two ways to see one:
        //   - non-zero exit with zero checks at all (the usual case), or
        //   - headless.js's own explicit marker in the throw message. A tool that
        //     prints disk/registry PASS lines BEFORE it boots a browser still has
        //     a boot crash, and the pass===0 rule alone would miss it. CI run #40
        //     proved this: 13 of 27 matrix legs hit a boot crash and recovered on
        //     retry, while Release QA — which ran offline_smoke.mjs raw, with no
        //     retry — reported 3 passes and a hard failure for the same event.
        const bootCrash = code !== 0 && ((pass === 0 && fail === 0) || /no assertions ran/.test(out));
        if (bootCrash && attempt < LAUNCH_RETRIES) {
          console.log(`\n----- ${name} [boot crash, exit ${code} — retrying (${attempt + 1}/${LAUNCH_RETRIES})]`);
          launch(name, attempt + 1);
          return;
        }
        results.set(name, { name, code, pass, fail, skip, ms });
        if (opts.resume) recordResume(name, { name, code, pass, fail, skip, ms });
        console.log(`\n----- ${name} [exit ${code}, ${pass} pass / ${fail} fail${skip ? ' / ' + skip + ' skip' : ''}, ${(ms / 1000).toFixed(1)}s]\n${out.trimEnd()}`);
        done++;
        active--;
        if (done === smokes.length) resolve();
        else if (next < smokes.length) launch(smokes[next++]);
      });
    }
    while (active < opts.concurrency && next < smokes.length) { active++; launch(smokes[next++]); }
  });
  return smokes.map(n => results.get(n));
}

function printSummary(results) {
  let fails = 0;
  console.log('\n=== SUMMARY ===');
  for (const r of results) {
    const ok = r.code === 0 && r.fail === 0;
    if (!ok) fails++;
    console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${r.name.padEnd(24)} exit=${r.code} checks pass=${r.pass} fail=${r.fail}${r.skip ? ' skip=' + r.skip : ''} ${((r.ms || 0) / 1000).toFixed(1)}s`);
  }
  // Slowest tools first: the suite is dominated by per-tool Chrome boot cost and
  // fixed sleeps, so the optimisation targets are always visible (task 156).
  const byTime = [...results].sort((a, b) => (b.ms || 0) - (a.ms || 0));
  const totalMs = results.reduce((a, r) => a + (r.ms || 0), 0);
  const totalChecks = results.reduce((a, r) => a + r.pass + r.fail, 0);
  console.log('  --- slowest ---');
  byTime.slice(0, 5).forEach(r => console.log(`  ${((r.ms || 0) / 1000).toFixed(1).padStart(6)}s  ${r.name} (${r.pass + r.fail} checks)`));
  console.log(`  total ${(totalMs / 1000).toFixed(1)}s across ${results.length} tools, ${totalChecks} checks, ${totalChecks ? Math.round(totalMs / totalChecks) : 0} ms/check`);
  console.log(fails === 0
    ? `ALL ${results.length} TOOLS PASS`
    : `${fails}/${results.length} TOOL(S) FAILED — see blocks above`);
  return fails;
}

/* ---- watch mode: poll game/ mtimes, re-run affected smokes on change ---- */
function snapshotTree() {
  const state = new Map();
  function walk(dir) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) walk(full);
      else if (ent.isFile()) {
        const st = fs.statSync(full);
        state.set(newliney(path.relative(ROOT, full)), st.size + ':' + st.mtimeMs);
      }
    }
  }
  walk(GAME);
  return state;
}

async function watchLoop() {
  let prev = snapshotTree();
  console.log('\nWatching game/ for changes (Ctrl+C to stop)...');
  while (true) {
    await new Promise(r => setTimeout(r, WATCH_POLL_MS));
    const now = snapshotTree();
    const changed = [...now.entries()].filter(([k, v]) => !prev.has(k) || prev.get(k) !== v)
      .map(([k]) => k)
      .concat([...prev.keys()].filter(k => !now.has(k)));
    if (!changed.length) continue;
    const set = new Set();
    for (const f of changed) for (const s of mapFileToSmokes(f)) set.add(s);
    for (const s of set) {
      if (!fs.existsSync(path.join(SMOKE_DIR, s))) set.delete(s);
    }
    prev = now;
    console.log('\nChanged:\n  ' + changed.join('\n  '));
    await runBatch([...set].sort(), `watch-hit (${changed.length} file(s))`);
  }
}

(async () => {
  if (opts.list) {
    // --json feeds CI's matrix job: the workflow never hard-codes the battery,
    // so a newly added smoke can never be silently left out of CI.
    if (opts.json) console.log(JSON.stringify(allSmokes()));
    else for (const n of allSmokes()) console.log('  ' + n);
    process.exit(0);
  }
  if (opts.watch) { await watchLoop(); return; }
  const smokes = resolveSmokes();
  if (!smokes.length) { console.error('No smokes to run. Try: node tools/run_all.js --list'); process.exit(1); }
  const results = await runBatch(smokes, 'battery');
  process.exit(printSummary(results) ? 1 : 0);
})().catch(e => { console.error('run_all ERROR:', e); process.exit(1); });