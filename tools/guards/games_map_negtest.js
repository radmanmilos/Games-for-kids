/* games_map_negtest.js - negative test for the DERIVED game-file -> smoke mapping
   in tools/run_all.js (NOT a smoke; run explicitly).

   tools/run_all.js used to carry a hand-written GAME_SMOKE table: a second app
   list that had to be kept in step with app-registry.js by hand, and had already
   drifted. It is gone; smokesForGameFile() now derives the mapping from the
   registry plus "which pages load this module".

   Two failure modes that would both be silent, so each is broken on purpose here:
     1. A game file that resolves to NO smoke. run_all.js falls back to BROAD() -
        the whole battery - so a wrong mapping still "passes" CI, just slowly.
     2. A shared module whose pages stop being detected, dropping a smoke it used
        to cover.

   Usage: node tools/guards/games_map_negtest.js
   Exit 0 = the derived mapping is complete and consistent. */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { all: registryAll, byId } = require('../registry.js');

const ROOT = path.resolve(__dirname, '..', '..');
const GAMES = path.join(ROOT, 'game', 'games');
const PAGES = path.join(ROOT, 'game', 'pages');
const RUN_ALL = path.join(ROOT, 'tools', 'run_all.js');

let bad = 0;
const say = (ok, msg, detail) => {
  if (!ok) bad++;
  console.log((ok ? 'ok      ' : 'MISSED  ') + msg + (detail ? '\n           -> ' + detail : ''));
};

/* Pull smokesForGameFile() out of run_all.js by evaluating its source, so this
   test cannot drift from the implementation it is testing. */
function loadMapping() {
  // Normalise line endings: this repo is CRLF in the worktree, so "\n}\n" does
  // not match the real file and the extraction silently finds no function end.
  const src = fs.readFileSync(RUN_ALL, 'utf8').replace(/\r\n/g, '\n');
  const start = src.indexOf('function smokesForGameFile');
  if (start < 0) throw new Error('smokesForGameFile() not found in run_all.js');
  // The function ends at the first line that is exactly "}" at column 0.
  const end = src.indexOf('\n}\n', start);
  if (end < 0) throw new Error('could not find the end of smokesForGameFile()');
  const body = src.slice(start, end + 3);
  const alias = src.match(/const GAME_FILE_ALIAS = \{[^}]*\}/)[0];
  const shared = src.match(/const SHARED_MODULE_SMOKE = \{[\s\S]*?\n\};/)[0];
  const engine = src.match(/const ENGINE_SMOKE = \{[^}]*\}/)[0];
  // pagesLoadingGame() is called by smokesForGameFile(), so it has to come with it.
  const helperStart = src.indexOf('function pagesLoadingGame');
  if (helperStart < 0) throw new Error('pagesLoadingGame() not found in run_all.js');
  const helperEnd = src.indexOf('\n}\n', helperStart) + 3;
  const helper = src.slice(helperStart, helperEnd);
  const fn = new Function('byId', 'fs', 'path', 'ROOT',
    `${shared}\n${alias}\n${engine}\n${body}\n${helper}\nreturn smokesForGameFile;`);
  return fn(byId, fs, path, ROOT);
}

/* Is there a hand-written id->smoke table left in the runner? */
const runner = fs.readFileSync(RUN_ALL, 'utf8').replace(/\r\n/g, '\n');
say(!/GAME_SMOKE\s*=\s*\{/.test(runner), 'no hand-written GAME_SMOKE table remains in run_all.js');

const smokesForGameFile = loadMapping();
const files = fs.readdirSync(GAMES).map(f => f.replace(/\.(js|mjs)$/, ''));
say(files.length > 0, `read ${files.length} game files from game/games`);

/* Only per-game smokes must be reachable from a page or game file. Whole-app
   and tooling-level smokes are intentionally excluded: they exercise global
   surfaces or test the harness itself, not one game changed by --since. */
const NON_GAME_SMOKES = new Set([
  'hub_smoke', 'parent_smoke', 'sw_update_smoke',
  'touch_interruption_a_smoke', 'touch_interruption_b_smoke',
  'touch_interruption_c_smoke', 'touch_interruption_d_smoke',
  'runtime_error_smoke', 'visual_compare_smoke',
]);
const allSmokeNames = fs.readdirSync(path.join(ROOT, 'tools'))
  .filter(n => n.endsWith('_smoke.js'))
  .map(n => n.replace(/\.js$/, ''))
  .filter(n => !NON_GAME_SMOKES.has(n));
const covered = new Set();
for (const f of files) for (const s of smokesForGameFile(f)) covered.add(s);
const pageSmokes = registryAll().map(a => a.smoke).filter(Boolean);
for (const s of pageSmokes) covered.add(s);
const uncovered = allSmokeNames.filter(s => !covered.has(s));
say(uncovered.length === 0, `every per-game smoke is reachable via pages or game files`,
  uncovered.length ? 'unreachable: ' + uncovered.join(', ') : '');

/* A smoke named for a game that does not exist is a stale reference. */
const stale = pageSmokes.filter(s => {
  const base = s.replace(/_smoke$/, '');
  return !fs.existsSync(path.join(ROOT, 'tools', s + '.js'));
});
say(stale.length === 0, 'no registry entry points at a missing smoke file',
  stale.length ? 'missing: ' + stale.join(', ') : '');

/* Negative control: break the "which pages load this module" lookup and confirm a
   shared module silently loses coverage. This is the failure the guard is for. */
const dinoPage = path.join(PAGES, 'dino.html');
const dinoOrig = fs.readFileSync(dinoPage, 'utf8');
fs.writeFileSync(dinoPage, dinoOrig.replace('games/adventure.js', 'games/adventure-DISABLED.js'));
const after = smokesForGameFile('adventure');
fs.writeFileSync(dinoPage, dinoOrig);
const lostSmoke = !after.includes('dino_smoke');
say(lostSmoke, 'negative control: detaching dino.html from adventure.js loses dino_smoke',
  lostSmoke ? '' : 'a broken module reference still reported full coverage - the guard cannot fail');

/* Positive control: the real wiring must still cover the whole adventure set. */
const adventure = smokesForGameFile('adventure');
const want = ['adventure_smoke', 'driving_smoke', 'ocean_smoke', 'dino_smoke', 'space_smoke'];
const missing = want.filter(s => !adventure.includes(s));
say(missing.length === 0, `positive control: adventure.js still maps to all ${want.length} smokes`,
  missing.length ? 'missing: ' + missing.join(', ') : 'got ' + adventure.join(', '));

/* Every declared shared/engine module must actually resolve to something, and its
   named smokes must still be real. Without this, emptying ENGINE_SMOKE.adventure
   is invisible: the page rule keeps supplying the other four, so the "positive
   control" above still passes while adventure_smoke coverage is silently gone -
   which is exactly what happens on the `if (named && named.length)` guard path. */
for (const table of ['SHARED_MODULE_SMOKE', 'ENGINE_SMOKE']) {
  const decl = runner.match(new RegExp(`const ${table} = (?:\\{[^}]*\\}|\\{[\\s\\S]*?\\n\\};)`));
  if (!decl) { say(false, `${table} is declared in run_all.js`); continue; }
  // Keys may be quoted ('racing-config') or bare (adventure).
  const entries = [...decl[0].matchAll(/(?:'([^']+)'|([A-Za-z_$][\w$]*)):\s*\[([^\]]*)\]/g)];
  say(entries.length > 0, `${table} declares at least one module`);
  for (const [, quoted, bare, list] of entries) {
    const mod = quoted || bare;
    const smokes = [...list.matchAll(/'([^']+)'/g)].map(m => m[1]);
    say(smokes.length > 0, `${table}['${mod}'] names at least one smoke`,
      'an empty list here silently drops that smoke from --since runs');
    for (const s of smokes) {
      say(fs.existsSync(path.join(ROOT, 'tools', s + '.js')),
        `${table}['${mod}'] -> ${s} exists as a smoke file`);
    }
    say(smokesForGameFile(mod).length > 0, `${table}['${mod}'] resolves to at least one smoke`);
  }
}

console.log(bad === 0 ? '\nthe derived game-file mapping is complete and every check can fail'
  : '\n' + bad + ' problem(s) with the derived mapping');
process.exit(bad === 0 ? 0 : 1);