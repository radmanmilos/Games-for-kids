/* tools/registry.js - the ONE way to read game/data/app-registry.js from a tool.
 *
 * R7: seven tools had each grown their own copy of the same trick
 *
 *     new Function('window', src + '; return window.APP_REGISTRY;')({})
 *
 * plus their own copy of the registry path and their own idea of what a "game"
 * is. That is how a second app list gets hand-authored and quietly goes stale.
 * Everything reads from here instead.
 *
 * The file name does not end in _smoke.js, so run_all.js does not schedule it.
 *
 * The registry is evaluated with a mock `window` rather than required, because it
 * is a browser script (`window.APP_REGISTRY = [...]`), not a module.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const REGISTRY_PATH = path.join(ROOT, 'game', 'data', 'app-registry.js');
const SERBIAN_PATH = path.join(ROOT, 'game', 'data', 'serbian.js');

function loadRegistry() {
  if (!fs.existsSync(REGISTRY_PATH)) return [];
  if (!fs.existsSync(SERBIAN_PATH)) throw new Error('Missing game/data/serbian.js');
  const window = {};
  new Function('window', fs.readFileSync(SERBIAN_PATH, 'utf8'))(window);
  const src = fs.readFileSync(REGISTRY_PATH, 'utf8');
  return new Function('window', src + '; return window.APP_REGISTRY;')(window) || [];
}

/* role is DERIVED, not stored: the registry already carries
 * category:'parent' for the one adult surface, so a `role` field would be a
 * second copy of the same fact that can disagree with it. */
function roleOf(app) {
  return app.category === 'parent' ? 'parent' : 'child-game';
}

/* Every registry entry, with `role` resolved and `url` prepended. */
function all() {
  return loadRegistry().map(a => ({ ...a, role: roleOf(a), url: '/' + a.path }));
}

/* The child games - i.e. everything a child may open. `parent` is excluded by
 * its declared category, never by a hardcoded id in the caller. */
function children() {
  return all().filter(a => a.role === 'child-game');
}

/* The adult surface(s). */
function parents() {
  return all().filter(a => a.role === 'parent');
}

/* Hub route id (the `data-go` value) -> registry entry. Drives the hub smoke's
 * expected button order and replaces the hand-written route->path map that used
 * to live in game/shared/navigation.js. */
function byRoute() {
  const map = new Map();
  for (const app of all()) if (app.route) map.set(app.route, app);
  return map;
}

/* registry id -> entry, via registry id. Named after the accessor shape the
   callers expect; `byId()` with no argument returns the Map itself, so a caller
   writing `byId('animals')` gets the entry rather than silently undefined. */
function byId(id) {
  const map = new Map(all().map(a => [a.id, a]));
  return id === undefined ? map : map.get(id);
}

/* Hub route ids the child hub markup deliberately keeps but that lead nowhere.
 *
 * This is a RETIREMENT RECORD, not an app list. `game-racing` is the hidden 2D
 * racing button removed in task 131 (CLEAN-001), kept in the markup so the hub
 * grid does not reflow. navigation.js resolves routes from the registry, so a
 * route with no entry navigates nowhere - which is exactly what "retired" must
 * mean, and what the `hidden` assertion below pins.
 *
 * `after` records where the button sits in the hub grid, because that position is
 * a real layout fact that hub_smoke asserts and that no registry entry can carry.
 * Adding a name here means claiming a route was removed.
 */
const RETIRED_ROUTES = [{ route: 'game-racing', after: 'game-puzzle' }];

/* The routes the child hub is expected to show in one sub-hub, in display order.
 * Order comes from the registry's own `hubOrder`, NOT from array position: the
 * registry is grouped learning-then-games for readability, while the hub shows
 * games-then-learning. Pinning it as a field is what lets hub_smoke assert the
 * real order without keeping its own list. */
function routesByGroup(group) {
  return children()
    .filter(a => a.hubGroup === group && a.route)
    .sort((a, b) => (a.hubOrder ?? 99) - (b.hubOrder ?? 99))
    .map(a => a.route);
}

/* Every child route, games group first, matching the hub's own tab order.
 * Retired buttons are spliced back in at their recorded position, so the expected
 * order is the hub's real order and a misplaced retired button fails the check. */
function allHubRoutes() {
  const games = routesByGroup('games').slice();
  for (const dead of RETIRED_ROUTES) {
    const at = games.indexOf(dead.after);
    games.splice(at < 0 ? games.length : at + 1, 0, dead.route);
  }
  return [...games, ...routesByGroup('learning')];
}

module.exports = {
  ROOT,
  REGISTRY_PATH,
  RETIRED_ROUTES,
  loadRegistry,
  all,
  children,
  parents,
  byRoute,
  byId,
  roleOf,
  routesByGroup,
  allHubRoutes,
};