/* route_contract_negtest.js - negative test for tools/route_contract.js (NOT a smoke).
   A check that cannot fail proves nothing. This asserts the replacement for the
   11 stale `navigation route wired` / `standalone boot wired` assertions really
   does fail when the wiring is wrong, rather than passing on whatever it finds.

   It mutates the REGISTRY (restored afterwards) rather than navigation.js/main.js,
   because breaking the registry is what a real regression would look like: someone
   renames a route, repoints a page, or nulls out a back button.

   Usage: node tools/guards/route_contract_negtest.js
   Exit 0 = every assertion can fail. */
const fs = require('fs');
const path = require('path');
const { byId } = require('../registry.js');
const { checkRouteWired } = require('../route_contract.js');

const REG = path.join(__dirname, '..', '..', 'game', 'data', 'app-registry.js');
const orig = fs.readFileSync(REG, 'utf8');

/* headless.js's check() writes to stdout and counts failures. Capture both so the
   result is a boolean instead of a log line. */
function run(appId, route, page, opts) {
  const results = [];
  checkRouteWired(appId, route, page, {
    ...opts,
    check: (name, ok, detail) => results.push({ name, ok: !!ok, detail: String(detail || '') }),
  });
  return results;
}

function allPassed(results) {
  return results.length > 0 && results.every(r => r.ok);
}

/* Mutate the registry, run the helper, restore. Writing the entry through a
   helper keeps every case a real, loadable registry - a mutation that only breaks
   the JS parse would let the helper crash instead of reporting the mismatch. */
function withMutatedRegistry(field, replacement, fn) {
  const entry = orig.match(/\{ id: 'animals',[\s\S]*?\},/)[0];
  const re = new RegExp(`(${field}: ')[^']*(')`);
  if (!re.test(entry)) throw new Error('cannot mutate ' + field);
  fs.writeFileSync(REG, orig.replace(entry, entry.replace(re, `$1${replacement}$2`)));
  try { return fn(); } finally { fs.writeFileSync(REG, orig); }
}

const CASES = [
  ['route renamed away from the hub', () => withMutatedRegistry('route', 'game-animals-v2', () => {
    const r = run('animals', 'game-animals', 'pages/animals.html',
      { back: 'animals-back', start: 'startAnimals' });
    return !allPassed(r);
  })],

  ['page path repointed', () => {
    const r = run('animals', 'game-animals', 'pages/somewhere_else.html',
      { back: 'animals-back', start: 'startAnimals' });
    return !allPassed(r);
  }],

  ['back button id changed', () => {
    const r = run('animals', 'game-animals', 'pages/animals.html',
      { back: 'not-the-back-btn', start: 'startAnimals' });
    return !allPassed(r);
  }],

  ['start function renamed', () => {
    const r = run('animals', 'game-animals', 'pages/animals.html',
      { back: 'animals-back', start: 'startSomethingElse' });
    return !allPassed(r);
  }],

  ['unknown registry id', () => {
    const r = run('no_such_game', 'game-nope', 'pages/nope.html', { back: null, start: null });
    return !allPassed(r);
  }],

  ['a self-wiring page given a back button it does not have', () => {
    const r = run('animal_counting', 'game-counting', 'pages/animal_counting.html',
      { back: 'counting-back', start: null });
    return !allPassed(r);
  }],
];

let bad = 0;
for (const [name, fn] of CASES) {
  let ok = false;
  try { ok = fn(); }
  catch (e) { console.log('ERROR ' + name + ': ' + e.message); bad++; continue; }
  if (!ok) bad++;
  console.log((ok ? 'detected ' : 'MISSED   ') + name);
}

/* Control: the real wiring must pass, or the negative tests above prove nothing
   because the helper fails unconditionally. */
const good = allPassed(run('animals', 'game-animals', 'pages/animals.html',
  { back: 'animals-back', start: 'startAnimals' }));
console.log((good ? 'control   real animals wiring passes' : 'control   REAL wiring FAILED - the helper is broken'));
if (!good) bad++;

fs.writeFileSync(REG, orig);
console.log(bad === 0 ? `\nall ${CASES.length} assertions can fail, and the real wiring passes`
  : `\n${bad} problem(s)`);
process.exit(bad === 0 ? 0 : 1);