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
     node tools/run_all.js --concurrency 6     # workers (default 4)
     node tools/run_all.js --list              # print the battery and exit

   Mapping: game-file pattern -> smoke script(s). Broad/unknown changes (shared/*,
   audio, sw.js) default to the WHOLE battery (safe; it is parallel, so cheap).
*/
const { execFile, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const TOOLS = __dirname;
const ROOT = path.resolve(__dirname, '..');
const GAME = path.join(ROOT, 'game');
const SMOKE_DIR = TOOLS;
const CONCURRENCY_DEFAULT = 4;
const CHILD_TIMEOUT_MS = 300000;
const WATCH_POLL_MS = 700;
const LAUNCH_RETRIES = 2;

const args = process.argv.slice(2);
const positional = [];
const opts = { concurrency: CONCURRENCY_DEFAULT, watch: false, list: false };
for (const a of args) {
  if (a === '--watch') opts.watch = true;
  else if (a === '--list') opts.list = true;
  else if (a.startsWith('--concurrency=')) opts.concurrency = parseInt(a.split('=')[1], 10) || CONCURRENCY_DEFAULT;
  else if (a === '--concurrency') opts.concurrency = parseInt(args[args.indexOf(a) + 1], 10) || CONCURRENCY_DEFAULT;
  else if (a.startsWith('--game=')) opts.game = a.split('=')[1];
  else if (a === '--game') opts.game = args[args.indexOf(a) + 1];
  else if (a.startsWith('--since=')) opts.since = a.split('=')[1];
  else if (a === '--since') opts.since = args[args.indexOf(a) + 1];
  else positional.push(a);
}
if (!(opts.concurrency >= 1)) opts.concurrency = CONCURRENCY_DEFAULT;

/* ---- game-file -> smoke mapping ---- */
const PAGE_SMOKE = {
  animals: 'animals_smoke', shapes: 'shapes_smoke', matching_game: 'candy_smoke',
  animal_memory: 'memory_smoke', animal_puzzle: 'puzzle_smoke', animal_counting: 'counting_smoke',
  coloring: 'coloring_smoke', classroom: 'kids_smoke', tracing: 'tracing_smoke', piano: 'piano_smoke',
  driving: 'driving_smoke', ocean: 'ocean_smoke', dino: 'dino_smoke', space: 'space_smoke',
  racing: 'racing_smoke', racing3d: 'racing3d_smoke', papper_kitty: 'kitty_smoke',
};
const GAME_SMOKE = {
  animals: 'animals_smoke', shapes: 'shapes_smoke', candy: 'candy_smoke', kitty: 'kitty_smoke',
  'kitty-standalone': 'kitty_smoke', animal_puzzle: 'puzzle_smoke', animal_counting: 'counting_smoke',
  animal_memory: 'memory_smoke', coloring: 'coloring_smoke', classroom: 'kids_smoke',
  kids_games: 'kids_smoke', tracing: 'tracing_smoke', piano: 'piano_smoke',
  adventure: ['adventure_smoke', 'driving_smoke', 'ocean_smoke', 'dino_smoke', 'space_smoke'],
  'adventure-music': ['adventure_smoke', 'driving_smoke', 'ocean_smoke', 'dino_smoke', 'space_smoke'],
  'adventure-modes': ['adventure_smoke', 'driving_smoke', 'ocean_smoke', 'dino_smoke', 'space_smoke'],
  driving: ['driving_smoke', 'adventure_smoke'], ocean: ['ocean_smoke', 'adventure_smoke'],
  dino: ['dino_smoke', 'adventure_smoke'], space: ['space_smoke', 'adventure_smoke'],
  racing: 'racing_smoke', 'racing-config': 'racing_smoke', racing3d: 'racing3d_smoke',
  'racing3d-config': 'racing3d_smoke',
};
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
    const m = GAME_SMOKE[base];
    if (m) hit.push(...(Array.isArray(m) ? m : [m]));
  }
  if (p.startsWith('assets/')) return [];
  return hit.length ? [...new Set(hit)] : BROAD();
}

/* Resolve the list of smokes for the current invocation. */
function resolveSmokes() {
  let list;
  if (positional.length) {
    list = positional.map(n => (n.endsWith('.js') ? n : n + '.js'));
    list = list.filter(n => fs.existsSync(path.join(SMOKE_DIR, n)));
    if (!list.length) { console.error('No matching smoke files given; see node tools/run_all.js --list'); process.exit(1); }
  } else if (opts.since) {
    list = smokesForGitDiff(opts.since);
  } else if (opts.game) {
    list = allSmokes().filter(n => n.includes(opts.game));
  } else {
    list = allSmokes();
  }
  return [...new Set(list.filter(n => n.endsWith('_smoke.js')))];
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
      const child = spawn(process.execPath, [path.join(SMOKE_DIR, name)], { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] });
      let out = '';
      const timer = setTimeout(() => { console.log(`  [timeout ${CHILD_TIMEOUT_MS}ms] ${name}`); child.kill('SIGKILL'); }, CHILD_TIMEOUT_MS);
      child.stdout.on('data', d => { out += d; });
      child.stderr.on('data', d => { out += d; });
      child.on('close', code => {
        clearTimeout(timer);
        const pass = (out.match(/^PASS /gm) || []).length;
        const fail = (out.match(/^FAIL /gm) || []).length;
        // Non-zero exit with zero checks means Chrome never booted (port/profile/lock
        // contention under parallel load), not an assertion failure. Retry once.
        if (code !== 0 && pass === 0 && fail === 0 && attempt < LAUNCH_RETRIES) {
          console.log(`\n----- ${name} [boot crash, exit ${code} — retrying (${attempt + 1}/${LAUNCH_RETRIES})]`);
          launch(name, attempt + 1);
          return;
        }
        results.set(name, { name, code, pass, fail });
        console.log(`\n----- ${name} [exit ${code}, ${pass} pass / ${fail} fail]\n${out.trimEnd()}`);
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
    console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${r.name.padEnd(24)} exit=${r.code} checks pass=${r.pass} fail=${r.fail}`);
  }
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
    for (const n of allSmokes()) console.log('  ' + n);
    process.exit(0);
  }
  if (opts.watch) { await watchLoop(); return; }
  const smokes = resolveSmokes();
  if (!smokes.length) { console.error('No smokes to run. Try: node tools/run_all.js --list'); process.exit(1); }
  const results = await runBatch(smokes, 'battery');
  process.exit(printSummary(results) ? 1 : 0);
})().catch(e => { console.error('run_all ERROR:', e); process.exit(1); });