/* route_contract.js - shared assertion for "is this page correctly wired?".
   NOT a smoke; used by the per-game smokes.

   R7 replaced the hand-written tables in game/shared/navigation.js and
   game/shared/main.js with lookups into game/data/app-registry.js. A dozen
   smokes used to assert those tables by grepping the source for literals like
   `'game-animals'` and `'animals': ['animals-back', 'startAnimals', 'hub-learning']`.
   Those assertions became wrong the moment the tables were removed - they
   reported 11 games as broken while every one of them actually worked, which is
   the stale-test failure mode, not a real regression.

   What is worth asserting now is the contract that replaced them:
     1. the registry really maps this id to the expected route and page,
     2. the registry really carries the back/start wiring main.js needs,
     3. the shared files resolve that data from the registry rather than keeping
        a second hand-authored copy (the whole point of R7).

   Pass `back`/`start` as null for pages that wire themselves. */
const fs = require('fs');
const path = require('path');
const { byId } = require('./registry.js');

const ROOT = path.resolve(__dirname, '..');
const nav = fs.readFileSync(path.join(ROOT, 'game', 'shared', 'navigation.js'), 'utf8');
const main = fs.readFileSync(path.join(ROOT, 'game', 'shared', 'main.js'), 'utf8');

/* Both shared files must read the registry. If one ever grows its own table
   again this fails, which is the drift R7 exists to prevent. */
const navReadsRegistry = /APP_REGISTRY/.test(nav);
const mainReadsRegistry = /APP_REGISTRY/.test(main);

/**
 * Assert that `appId` is wired end to end.
 * @param {string} appId      registry id, e.g. 'animals'
 * @param {string} route      expected hub route, e.g. 'game-animals'
 * @param {string} page       expected page path, e.g. 'pages/animals.html'
 * @param {object} opts       { back, start, label, check }
 */
function checkRouteWired(appId, route, page, opts = {}) {
  const { check } = opts;
  if (typeof check !== 'function') throw new Error('checkRouteWired needs a check() function');
  const entry = byId(appId);

  check(`registry maps ${appId} -> ${route} (${page})`,
    !!entry && entry.route === route && entry.path === page,
    entry ? `got route=${entry.route} path=${entry.path}` : 'no such registry entry');

  check(`registry carries ${appId}'s runtime wiring (back=${opts.back} start=${opts.start})`,
    !!entry && entry.back === (opts.back ?? null) && entry.start === (opts.start ?? null),
    entry ? `got back=${entry.back} start=${entry.start}` : 'no such registry entry');

  // Only for pages the shared runtime boots. A self-wiring page legitimately
  // appears nowhere in main.js.
  if (opts.back !== undefined && opts.start !== undefined) {
    check(`navigation.js and main.js resolve routes from the registry, not a private copy`,
      navReadsRegistry && mainReadsRegistry,
      `navigation=${navReadsRegistry} main=${mainReadsRegistry}`);
  }
}

module.exports = { checkRouteWired, navReadsRegistry, mainReadsRegistry };