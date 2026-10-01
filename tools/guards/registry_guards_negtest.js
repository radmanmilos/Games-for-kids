/* registry_guards_negtest.js - negative test for the R7 registry contract checks
   in tools/validate_pages.js (NOT a smoke; run explicitly).

   A check that cannot fail proves nothing, so every guard added in R7 is broken
   on purpose here and must produce a non-zero exit. The registry and index.html
   are restored afterwards.

   Two rules this file had to learn the hard way, both from its own first draft:
     1. Every mutation must stay SYNTACTICALLY VALID. Three early cases "passed"
        only by breaking the JS parse - that is a crash, not a contract report,
        and it is exactly the shape of a check that cannot fail.
     2. A detection must come from the guard's own message, not merely a non-zero
        exit, or an unrelated failure (e.g. "page not found on disk") gets
        credited for a guard that did nothing.

   Usage: node tools/guards/registry_guards_negtest.js
   Exit 0 = every guard can fail. */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const REG = path.join(ROOT, 'game', 'data', 'app-registry.js');
const INDEX = path.join(ROOT, 'game', 'index.html');
const VALIDATOR = path.join(ROOT, 'tools', 'validate_pages.js');

const regOrig = fs.readFileSync(REG, 'utf8');
const indexOrig = fs.readFileSync(INDEX, 'utf8');

/* A syntactically valid stand-in for the registry's last entry (which carries no
   trailing comma), so an inserted entry does not break the array. */
function insertBeforeEnd(src, entry) {
  const withComma = src.replace(/(start: null \})\n\];/, '$1,\n];');
  if (withComma === src) throw new Error('could not find the last entry to terminate');
  return withComma.replace(/\n\];/, '\n' + entry + '];');
}

const oceanEntry = regOrig.match(/\{ id: 'ocean',[\s\S]*?\},/)[0];
const retiredEntry = "  { id: 'game-racing', path: 'pages/racing.html', category: 'games', title: 'Trke', smoke: null, screenshot: false, offline: false, toddler: false, route: 'game-racing', hubOrder: 12, hubGroup: 'games', back: null, start: null },\n";

/* Each case: [name, apply(source) -> source, expected substring in the report] */
const CASES = [
  // A whole second entry that reuses an existing id. The id in the copied entry
  // must match an id already in the registry, which is what makes it a duplicate.
  ['duplicate id',
    () => insertBeforeEnd(regOrig,
      "  { id: 'ocean', path: 'pages/ocean.html', category: 'games', title: 'Океан', smoke: 'ocean_smoke', screenshot: true, offline: true, toddler: false,\n"
      + "    route: 'game-ocean', hubOrder: 12, hubGroup: 'games', back: 'ocean-back', start: 'startOcean' },\n"),
    'duplicate id'],
  ['duplicate route',
    () => regOrig.replace(/\{ id: 'dino',[\s\S]*?\},/,
      oceanEntry.replace("id: 'ocean'", "id: 'dino'").replace("path: 'pages/ocean.html'", "path: 'pages/dino.html'")),
    'duplicate route'],
  // dino=4 -> 3, which collides with ocean=3 in the same 'games' group. Writing
  // ocean's OWN value instead would be a no-op mutation and would pass vacuously.
  ['duplicate hubOrder inside a group',
    () => regOrig.replace(/(id: 'dino',[\s\S]*?hubOrder: )\d+/, '$13'),
    'duplicate hubOrder'],
  ['route with no hub button in index.html',
    () => regOrig.replace(/(id: 'ocean',[\s\S]*?route: ')[a-z0-9-]+/, '$1made-up-route'),
    'has no hub button'],
  ['back element id that no page contains',
    () => regOrig.replace(/(id: 'ocean',[\s\S]*?back: ')[a-z0-9_-]+/, '$1no-such-btn'),
    'no such element id'],
  ['start global that no page script defines',
    () => regOrig.replace(/(id: 'ocean',[\s\S]*?start: ')[A-Za-z0-9_]+/, '$1startNothingHere'),
    'defines that global function'],
  ['hubOrder removed from a grouped entry',
    () => regOrig.replace(/(id: 'ocean',[\s\S]*?hubOrder: )\d+/, '$1undefined'),
    'has no hubOrder'],
  ['path outside pages/',
    () => regOrig.replace(/(id: 'ocean',[\s\S]*?path: ')[a-z0-9/.]+/, '$1wrong-place.html'),
    'must live under pages/'],
  ['entry with no id',
    () => regOrig.replace("{ id: 'ocean',", '{ '),
    'has no id'],
  ['page on disk missing from the registry',
    () => regOrig.replace(/\{ id: 'space',[\s\S]*?\},/, ''),
    'space.html exists but not in app-registry.js'],
  ['retired route restored to the registry',
    () => insertBeforeEnd(regOrig, retiredEntry),
    'is still present in the registry'],
  ['retired hub button un-hidden',
    () => indexOrig.replace(/(data-go="game-racing"[^>]*?) hidden/, '$1'),
    'has a visible hub button'],
];

function runValidator() {
  try {
    return { code: 0, out: execFileSync(process.execPath, [VALIDATOR], { encoding: 'utf8' }) };
  } catch (e) {
    return { code: e.status, out: (e.stdout || '') + (e.stderr || '') };
  }
}

function restore() {
  fs.writeFileSync(REG, regOrig);
  fs.writeFileSync(INDEX, indexOrig);
}

let bad = 0;
for (const [name, mutate, expected] of CASES) {
  let mutated;
  try { mutated = mutate(); }
  catch (e) { console.log('BAD TEST  ' + name + ': ' + e.message); bad++; continue; }

  const touchesIndex = name === 'retired hub button un-hidden';
  if (touchesIndex) fs.writeFileSync(INDEX, mutated); else fs.writeFileSync(REG, mutated);

  const { code, out } = runValidator();
  restore();

  const crashed = /SyntaxError|at loadRegistry/.test(out);
  const reported = out.includes(expected);
  const ok = code !== 0 && !crashed && reported;
  if (!ok) bad++;
  console.log((ok ? 'detected ' : 'MISSED   ') + name
    + (ok ? '\n           -> ' + expected : crashed ? '\n           -> validator crashed on a parse error, not a report'
      : code === 0 ? '\n           -> validator still exited 0 (guard does nothing)'
        : '\n           -> non-zero exit, but never said "' + expected + '"'));
}

restore();
console.log(bad === 0 ? '\nall ' + CASES.length + ' registry guards can fail'
  : '\n' + bad + ' guard(s) could not fail');
process.exit(bad === 0 ? 0 : 1);