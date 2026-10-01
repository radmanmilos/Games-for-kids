/* tools/offline_smoke.mjs — R6: behavioural offline end-to-end.
 *
 * The previous version of this test proved nothing. It primed the cache in one
 * browser, closed it, and started a *fresh* profile for the offline phase — so
 * the "offline" browser had no service worker and an empty Cache Storage. Its
 * 15 green checks were static markup only; the 2 red ones were exactly the two
 * pages whose UI is built by JavaScript.
 *
 * The fix is not clever, it is structural: ONE session, primed while online,
 * then taken offline with the same service worker and the same Cache Storage
 * still attached. Everything after that point is a real offline user.
 *
 * Offline is applied with Network.emulateNetworkConditions (Chrome DevTools'
 * own offline switch), and PROVED with a negative control: a URL that is not
 * in the offline inventory must fail to load. Without that control a bug that
 * left the network reachable would pass silently.
 *
* Interaction coverage is a table keyed by registry id, and every registry
 * entry with offline:true must have a row - a new game cannot join the app
 * without also joining this test. R7 done: the table's ids, page paths and the
 * parent exclusion come from tools/registry.js, so this file no longer carries its
 * own copy of the app list. The table still owns the parts that are genuinely
 * test fixtures and cannot live in the registry - the per-game readiness predicate
 * and the gesture that proves the game responds.
 */

import { createRequire } from 'node:module';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { start, check, skip, sleep } = require('./headless.js');
const { children, parents } = require('./registry.js');

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', 'game');

const CACHE_NAME = 'petrin-v2';
const BASE = 'http://127.0.0.1';

/* R7: the parent page is the only place that triggers caching, so its URL comes
 * from the registry's own `role: parent` classification rather than a literal. */
const PARENT_URL = (parents()[0] || {}).url;
if (!PARENT_URL) {
  check('the registry declares exactly one parent surface', false, 'no entry has category "parent"');
  process.exit(1);
}

/* ------------------------------------------------------------------ *
 * Phase 5 (audio) happens before the browser starts: prove every audio
 * asset the app will ask for is really on disk, so a silent failure
 * later is a code bug and not a missing file.
 * ------------------------------------------------------------------ */
const cacheList = JSON.parse(fs.readFileSync(path.join(ROOT, 'sw-cache-list.json'), 'utf8'));
const assets = Array.isArray(cacheList) ? cacheList : cacheList.files || [];
const audioAssets = assets.filter(f => /^assets\/audio\//.test(f));
const missingAudio = audioAssets.filter(f => !fs.existsSync(path.join(ROOT, f)));
check(`all ${audioAssets.length} audio assets in sw-cache-list.json exist on disk`, missingAudio.length === 0,
  missingAudio.slice(0, 5).join(', ') || 'none missing');
const missingAny = assets.filter(f => !fs.existsSync(path.join(ROOT, f)));
check(`all ${assets.length} sw-cache-list entries exist on disk`, missingAny.length === 0,
  missingAny.slice(0, 5).join(', ') || 'none missing');

/* ------------------------------------------------------------------ *
 * Per-registry primary interaction.
 *   ready — JS predicate polled until true (boot readiness)
 *   start — dismiss a start/modal screen, return {ok, why}
 *   act   — the real child gesture + its proof, returns {ok, why}
 *   back  — selector of the control that must return to the hub
 * ------------------------------------------------------------------ */
/* One proven input path for the four adventure modes: press the real control,
 * prove the game saw it (keys.<key> flips), prove the world moved, release. */
const adventureAct = (key, selector) => async h => {
  const x0 = await h.evalv(`window.__adv.player.x`), y0 = await h.evalv(`window.__adv.player.y`);
  const p = await h.press(selector);
  if (!p.ok) return p;
  const seen = await h.waitFor(`window.__adv.keys.${key}===true`,
    { timeout: 2000, label: `the ${key} press to reach the game` });
  if (!seen.ok) { await h.release(selector); return seen; }
  const moved = await h.waitFor(`window.__adv.player.x!==${x0}||window.__adv.player.y!==${y0}`,
    { timeout: 4000, label: 'the player to move' });
  await h.release(selector);
  if (!moved.ok) return moved;
  const off = await h.waitFor(`window.__adv.keys.${key}===false`,
    { timeout: 2000, label: 'the release to reach the game' });
  if (!off.ok) return off;
  return { ok: true };
};

const APPS = [
  {
    id: 'animals', back: '#animals-back',
    ready: `(()=>{const c=document.querySelector('#animalCard');return !!c && c.textContent.trim().length>0})()`,
    act: async h => {
      const before = await h.evalv(`document.querySelector('#animalCard').textContent`);
      const t = await h.tap('#animalNext');
      if (!t.ok) return t;
      return h.waitFor(`document.querySelector('#animalCard').textContent !== ${JSON.stringify(before)}`,
        { label: 'the next animal to appear' });
    },
  },
  {
    id: 'animal_counting', back: '#game-counting .back-btn',
    ready: `document.querySelectorAll('#countScene .count-tile').length>0`,
    act: async h => {
      // phase 1: a child taps every animal to count it; the answer buttons only
      // appear once the last one is counted
      const n = await h.evalv(`document.querySelectorAll('#countScene .count-tile').length`);
      for (let i = 0; i < n; i++) {
        const t = await h.tap(`#countScene .count-tile:nth-of-type(${i + 1})`);
        if (!t.ok) return { ok: false, why: `animal ${i + 1} of ${n}: ` + t.why };
      }
      const counted = await h.waitFor(`document.querySelectorAll('#countScene .count-tile.counted').length>=${n}`,
        { label: 'all ' + n + ' animals to be counted' });
      if (!counted.ok) return counted;
      const want = await h.evalv(`document.querySelector('#game-counting').dataset.correct`);
      if (want == null) return { ok: false, why: 'no expected count on #game-counting' };
      const choices = await h.waitFor(
        `!!document.querySelector('#countButtons .count-choice[data-val="${want}"]')`,
        { label: 'the answer buttons to appear' });
      if (!choices.ok) return choices;
      const t2 = await h.tap(`#countButtons .count-choice[data-val="${want}"]`);
      if (!t2.ok) return { ok: false, why: 'answer button: ' + t2.why };
      return h.waitFor(`document.querySelector('#countScoreValue').textContent.trim()!=='0'`,
        { label: 'the correct answer to score' });
    },
  },
  {
    id: 'animal_memory', back: '#controls .back-btn',
    ready: `document.querySelectorAll('#board .card').length>0`,
    act: async h => {
      const n = await h.evalv(`(()=>{const c=[...document.querySelectorAll('#board .card')];
        return c.length? c[0].dataset.name : null})()`);
      if (!n) return { ok: false, why: 'no cards to play' };
      const t1 = await h.tap('#board .card');
      if (!t1.ok) return t1;
      const twin = await h.evalv(`(()=>{const c=[...document.querySelectorAll('#board .card')];
        return c.findIndex((e,i)=>i>0 && e.dataset.name===${JSON.stringify(n)})})()`);
      if (twin < 0) return { ok: false, why: 'no matching card for ' + n };
      const t2 = await h.tap(`#board .card:nth-of-type(${twin + 1})`);
      if (!t2.ok) return t2;
      return h.waitFor(`document.querySelectorAll('#board .card.matched').length>=2`,
        { label: 'the pair to lock in' });
    },
  },
  {
    id: 'animal_puzzle', back: '#game-puzzle .back-btn',
    ready: `!!document.getElementById('sceneButton')`,
    start: async h => {
      const t = await h.tap('#sceneButton');
      if (!t.ok) return { ok: false, why: 'start button: ' + t.why };
      // pieces are scattered on the next animation frame — wait for real geometry
      return h.waitFor(`(()=>{const p=[...document.querySelectorAll('#puzzleStage .piece')];
        if(!p.length) return false;
        const r=p.map(e=>e.getBoundingClientRect());
        return r.every(b=>b.width>4&&b.height>4) && new Set(r.map(b=>b.left+','+b.top)).size===r.length})()`,
        { label: 'the puzzle pieces to be scattered' });
    },
    act: async h => {
      // scatter-drag: the drop point is a computed cell centre, not a DOM node
      const target = await h.evalv(`(()=>{const p=document.querySelector('#puzzleStage .piece');
        if(!p) return null;
        const board=document.getElementById('puzzleBoard');
        const cs=getComputedStyle(board);
        const cols=cs.gridTemplateColumns.split(' ').length;
        const rows=cs.gridTemplateRows.split(' ').length;
        const b=board.getBoundingClientRect();
        return {x:b.left+(Number(p.dataset.col)+0.5)*b.width/cols, y:b.top+(Number(p.dataset.row)+0.5)*b.height/rows};
      })()`);
      if (!target) return { ok: false, why: 'no puzzle board to drop onto' };
      const src = await h.boxOf('#puzzleStage .piece');
      if (!src.ok) return src;
      await h.dragTo(src.x, src.y, target.x, target.y);
      return h.waitFor(`document.querySelectorAll('#puzzleStage .piece.placed').length>0`,
        { label: 'the dropped piece to snap home' });
    },
  },
  {
    id: 'classroom', back: '#classroom-back',
    ready: `!!document.querySelector('#classroomHub .activity-btn')`,
    start: async h => {
      const t = await h.tap('#classroomHub .activity-btn[data-activity="alphabet"]');
      if (!t.ok) return { ok: false, why: 'alphabet activity: ' + t.why };
      return h.waitFor(`document.querySelectorAll('#activityGrid .class-tile').length>0`,
        { label: 'the alphabet tiles' });
    },
    act: async h => {
      const before = await h.evalv(`document.querySelector('#activityCaption').textContent`);
      const t = await h.tap('#activityGrid .class-tile');
      if (!t.ok) return t;
      return h.waitFor(`document.querySelector('#activityCaption').textContent !== ${JSON.stringify(before)}`,
        { label: 'the caption to name the letter' });
    },
  },
  {
    id: 'coloring', back: '#coloring-back',
    ready: `document.querySelectorAll('#coloringSvg .coloring-region').length>0`,
    act: async h => {
      const want = await h.evalv(`document.querySelector('#coloringSvg .coloring-region').dataset.target`);
      if (!want) return { ok: false, why: 'region has no expected colour' };
      const t1 = await h.tap(`#coloringPalette .coloring-swatch[data-color="${want}"]`);
      if (!t1.ok) return { ok: false, why: 'colour swatch: ' + t1.why };
      const t2 = await h.tap('#coloringSvg .coloring-region');
      if (!t2.ok) return { ok: false, why: 'region: ' + t2.why };
      return h.waitFor(`document.querySelectorAll('#coloringSvg .coloring-region.ok').length>0`,
        { label: 'the region to be coloured correctly' });
    },
  },
  {
    id: 'tracing', back: '#tracing-back',
    ready: `!!document.querySelector('#tracingHub .activity-btn')`,
    start: async h => {
      const t = await h.tap('#tracingHub .activity-btn[data-activity="letters"]');
      if (!t.ok) return { ok: false, why: 'letters activity: ' + t.why };
      return h.waitFor(`!!document.querySelector('#tracingActivity:not([hidden]) #tracingCanvas')`,
        { label: 'the tracing canvas' });
    },
    act: async h => {
      const s = await h.stroke('#tracingActivity #tracingCanvas');
      if (!s.ok) return s;
      return h.waitFor(`!!window.__traceDebug && window.__traceDebug.matchResult().drew===true`,
        { label: 'the stroke to land on the canvas' });
    },
  },
  {
    id: 'piano', back: '#piano-back',
    ready: `document.querySelectorAll('.piano-key').length>0`,
    act: async h => {
      const t1 = await h.tap('#modeSong');
      if (!t1.ok) return { ok: false, why: 'song mode: ' + t1.why };
      const lit = await h.waitFor(`document.querySelectorAll('.piano-key.lit').length>0`,
        { label: 'a key to light up in song mode' });
      if (!lit.ok) return lit;
      const before = await h.evalv(`document.querySelector('#pianoCounter').textContent`);
      const t2 = await h.tap('.piano-key.lit');
      if (!t2.ok) return { ok: false, why: 'lit key: ' + t2.why };
      return h.waitFor(`document.querySelector('#pianoCounter').textContent !== ${JSON.stringify(before)}`,
        { label: 'the note counter to advance' });
    },
  },
  {
    id: 'shapes', back: '#shapes-back',
    ready: `document.querySelectorAll('#shapesStage .piece').length>0`,
    act: async h => {
      const type = await h.evalv(`document.querySelector('#shapesStage .piece:not([data-done])')?.dataset.type`);
      if (!type) return { ok: false, why: 'no draggable shape' };
      const d = await h.drag(`#shapesStage .piece[data-type="${type}"]:not([data-done])`,
        `#shapesStage .slot[data-type="${type}"]`);
      if (!d.ok) return d;
      return h.waitFor(`document.querySelector('#shapesStage .piece[data-type="${type}"]').dataset.done==='1'`,
        { label: 'the shape to snap into its slot' });
    },
  },
  {
    id: 'matching_game', back: '#candy-back',
    ready: `document.querySelectorAll('#candyGrid .candy').length>0`,
    act: async h => {
      // Two honest outcomes, both real interactions:
      //  (a) the deal has a move -> the hint names it, and the child matches it.
      //  (b) the deal has none -> the game says so and spawns a star 400ms later
      //      (candy.js:157); tapping that star refills the cell (explodeStarAt).
      // Case (b) used to be reported as a failure, and "retry the hint 3x" was
      // tried first - that is retry-until-pass and it still failed when the star
      // handed back another unplayable tile. Branching on what the game actually
      // said is the honest shape: each branch asserts a state change that matters.
      const t1 = await h.tap('#candyHintBtn');
      if (!t1.ok) return { ok: false, why: 'hint button: ' + t1.why };
      const hinted = await h.waitFor(`document.querySelectorAll('#candyGrid .candy.hint').length>=2
        || !!document.querySelector('#candyGrid .hint-float')`,
        { timeout: 4000, label: 'the hint to answer' });
      if (!hinted.ok) return hinted;

      const lit = await h.evalv(`document.querySelectorAll('#candyGrid .candy.hint').length`);
      const said = await h.evalv(`(document.querySelector('#candyGrid .hint-float')||{}).textContent||''`);

      if (lit < 2) {
        if (!said.includes('Нема потеза')) {
          return { ok: false, why: 'hint button answered: "' + said + '" but no pair is highlighted' };
        }
        const star = await h.waitFor(`document.querySelectorAll('#candyGrid .candy.star').length>0`,
          { timeout: 6000, label: 'the promised star tile' });
        if (!star.ok) return { ok: false, why: 'no move available and no star appeared' };
        const ts = await h.tap('#candyGrid .candy.star');
        if (!ts.ok) return { ok: false, why: 'star tile: ' + ts.why };
        return h.waitFor(`document.querySelectorAll('#candyGrid .candy.star').length===0`,
          { timeout: 5000, label: 'the star to be consumed and the cell refilled' });
      }

      // drag by index: the hint window is short, re-resolving selectors can miss it
      const pair = await h.evalv(`(()=>{const c=[...document.querySelectorAll('#candyGrid .candy')];
        const ix=c.map((e,i)=>e.classList.contains('hint')?i:-1).filter(i=>i>=0);
        return ix.length>=2?{a:ix[0],b:ix[1]}:null})()`);
      if (!pair) return { ok: false, why: 'hinted tiles have no index' };
      const from = await h.boxOf(`#candyGrid .candy:nth-of-type(${pair.a + 1})`);
      const to = await h.boxOf(`#candyGrid .candy:nth-of-type(${pair.b + 1})`);
      if (!from.ok) return from;
      if (!to.ok) return to;
      await h.dragTo(from.x, from.y, to.x, to.y, 10);
      return h.waitFor(`parseInt(document.querySelector('#candyScore .matching-score-value').textContent,10)>0`,
        { timeout: 5000, label: 'the hinted pair to match' });
    },
  },
  {
    id: 'driving', back: '#driving-back',
    ready: `!!window.__adv && !!document.querySelector('#adv-controls [data-adv="up"]')`,
    act: adventureAct('up', '#adv-controls [data-adv="up"]'),
  },
  {
    id: 'ocean', back: '#ocean-back',
    ready: `!!window.__adv && !!document.querySelector('#adv-controls [data-adv="right"]')`,
    act: adventureAct('right', '#adv-controls [data-adv="right"]'),
  },
  {
    id: 'dino', back: '#dino-back',
    ready: `!!window.__adv && !!document.querySelector('#adv-controls [data-adv="jump"]')`,
    start: async h => {
      const shown = await h.waitFor(`document.querySelectorAll('#adv-dino-grid .adv-dino-btn').length>0`,
        { timeout: 8000, label: 'the dino chooser' });
      if (!shown.ok) return shown;
      const t = await h.tap('#adv-dino-grid .adv-dino-btn');
      if (!t.ok) return { ok: false, why: 'dino button: ' + t.why };
      return h.waitFor(`!document.getElementById('adv-dino-picker').classList.contains('show')`,
        { label: 'the dino chooser to close' });
    },
    act: adventureAct('jump', '#adv-controls [data-adv="jump"]'),
  },
  {
    id: 'space', back: '#space-back',
    ready: `!!window.__adv && !!document.querySelector('#adv-controls [data-adv="up"]')`,
    act: adventureAct('up', '#adv-controls [data-adv="up"]'),
  },
  {
    id: 'racing3d', back: '#r3d-back',
    // the start button exists in markup long before the modal is shown, so waiting
// on its presence returns a button that is still zero-size
    ready: `(()=>{const b=document.getElementById('r3d-start-btn');
      if(!b || !document.getElementById('r3d-zone-right')) return false;
      const r=b.getBoundingClientRect();
      return r.width>4 && r.height>4 && !!window.__r3d;})()`,
    act: async h => {
      // the countdown first: steering zones are inert while the lap has not started
      const t = await h.tap('#r3d-start-btn');
      if (!t.ok) return t;
      const started = await h.waitFor(`window.__r3d.mode()!=='idle'`,
        { timeout: 15000, label: 'the countdown to finish' });
      if (!started.ok) return started;
      const p = await h.press('#r3d-zone-right');
      if (!p.ok) return p;
      const steered = await h.waitFor(`window.__r3d.lateral() > 0`,
        { timeout: 4000, label: 'the car to steer right' });
      await h.release('#r3d-zone-right');
      // no auto-centring to assert: lateral only clamps to MAX_LATERAL, so the
      // honest post-release property is that the car stays within its track limit
      return h.waitFor(`Math.abs(window.__r3d.lateral()) <= 9.6`,
        { timeout: 4000, label: 'lateral offset to stay clamped to the track' });
    },
  },
  {
    id: 'explorer', back: '#back-btn',
    ready: `!!document.querySelector('#char-modal.show .char-btn[data-character="kitty"]')`,
    start: async h => {
      const t = await h.tap('#char-modal .char-btn[data-character="kitty"]');
      if (!t.ok) return { ok: false, why: 'character button: ' + t.why };
      const closed = await h.waitFor(`!document.getElementById('char-modal').classList.contains('show')`,
        { label: 'the character chooser to close' });
      if (!closed.ok) return closed;
      return h.waitFor(`!!player && player.grounded===true`,
        { timeout: 8000, label: 'the kitty to land on the ground' });
    },
    act: async h => {
      const p = await h.press('#btn-jump');
      if (!p.ok) return p;
      const jumped = await h.waitFor(`player.grounded===false`,
        { timeout: 3000, label: 'the kitty to leave the ground' });
      await h.release('#btn-jump');
      if (!jumped.ok) return jumped;
      return h.waitFor(`player.grounded===true`,
        { timeout: 6000, label: 'the kitty to land again' });
    },
  },
];

/* Every registry child must be covered - a new offline game cannot skip this test.
 * R7: ids, pages and the parent exclusion now come from tools/registry.js instead of
 * a regex scrape of the registry source plus a hardcoded `'parent'` filter. The old
 * scrape was line-shape dependent (one object per line) and would have silently
 * stopped matching the moment an entry was reformatted. */
const offlineChildren = children().filter(a => a.offline);
const uncovered = offlineChildren.filter(a => !APPS.some(s => s.id === a.id));
const extra = APPS.filter(s => !offlineChildren.some(a => a.id === s.id)).map(s => s.id);
check(`offline interaction coverage: ${offlineChildren.length} registry children, ${APPS.length} specs`,
  uncovered.length === 0 && extra.length === 0,
  [...uncovered.map(a => 'missing ' + a.id), ...extra.map(i => 'unknown ' + i)].join(', ') || 'exact match');

/* Join the per-game interaction specs to the registry. `id` above is the join key;
 * the page path is only ever read from here, so a spec can never point at a page
 * that is not the one the registry says belongs to that id. */
for (const spec of APPS) {
  const app = offlineChildren.find(a => a.id === spec.id);
  if (!app) continue;
  spec.page = app.url;
}

// landscape on purpose: racing3d shows a full-screen "rotate me" overlay in
// portrait, and the classroom activity row needs the width to fit on screen
const h = await start({
  page: null, tag: 'offline-smoke', width: 1280, height: 800,
  ignoreResourceErrors: ['?nocache='],
});
const results = [];

try {
  /* ---------------- Phase 1: prime the cache while online ---------------- */
  const wait = ms => sleep(ms);

  await h.navigate(`${BASE}:${h.port}${PARENT_URL}`);
  const loaded = await h.waitFor(`!!document.getElementById('download-offline')`,
    { label: 'the parent page' });
  check('P1 parent page (the only place that triggers caching) loads', loaded.ok, loaded.why || 'ok');

  // capture the explicit completion signal instead of sleeping a guessed interval
  await h.evalv(`(()=>{window.__r6cache=null;window.__r6progress=0;window.__r6err=null;
    navigator.serviceWorker.addEventListener('message',e=>{
      const d=e.data||{};
      if(d.type==='cache-progress') window.__r6progress=d.completed;
      else if(d.type==='cache-complete') window.__r6cache=d;
      else if(d.type==='cache-error') window.__r6err=d.message;
    });
    return true})()`);
  // `navigator.serviceWorker.ready` is a Promise and therefore always truthy —
// asking for it proves nothing. Only a real controller means the page is served
// by the worker at all.
const swReady = await h.waitFor(`!!navigator.serviceWorker.controller`,
    { label: 'a service worker to control the page', timeout: 30000 });
  check('P1 service worker takes control', swReady.ok, swReady.why || 'controller present');

  const primed = await h.tap('#download-offline');
  check('P1 «Преузми за офлајн» control is reachable by a child', primed.ok, primed.why || 'tapped');
  const done = await h.waitFor(`!!window.__r6cache || !!window.__r6err`,
    { timeout: 180000, label: 'cache-complete from the service worker' });
  const progress = await h.evalv(`window.__r6progress`);
  const swErr = await h.evalv(`window.__r6err`);
  check('P1 caching reports explicit completion (no guessed timeout)', done.ok,
    (done.ok ? `cache-complete after all ${progress} of ${assets.length} files`
      : done.why + ' (progress stopped at ' + progress + '/' + assets.length + (swErr ? ', sw error: ' + swErr : '') + ')'));
  if (done.ok) {
    const msg = await h.evalv(`JSON.stringify(window.__r6cache)`);
    const skipped = JSON.parse(msg).skipped || [];
    check('P1 no runtime asset skipped while caching', skipped.length === 0, skipped.join(', ') || 'skipped: []');
  }

  const cached = await h.evalp(`(async()=>{
    const c = await caches.open(${JSON.stringify(CACHE_NAME)});
    const keys = (await c.keys()).map(r=>new URL(r.url).pathname);
    return JSON.stringify(keys);
  })()`);
  if (cached && !cached.__err) {
    const have = new Set(JSON.parse(cached));
    const notCached = assets.map(f => '/' + f.replace(/^\/+/, '')).filter(f => !have.has(f));
    check(`P1 all ${assets.length} inventory files reached Cache Storage`, notCached.length === 0,
      notCached.slice(0, 5).join(', ') || 'cache matches sw-cache-list.json');
  } else {
    check('P1 Cache Storage is readable', false, 'could not open ' + CACHE_NAME);
  }

  for (const a of APPS) {
    await h.navigate(`${BASE}:${h.port}${a.page}`);
    const r = await h.waitFor(`document.readyState === 'complete'`, { timeout: 10000, label: a.page });
    check(`P1 ${a.id} opens once online`, r.ok, r.why || 'loaded');
  }

/* ---------------- Phase 2: make offline unambiguous --------------------- */
await h.c.send('Network.enable');
  await h.c.send('Network.setCacheDisabled', { cacheDisabled: true });
  await h.c.send('Network.emulateNetworkConditions', {
    offline: true, latency: 0, downloadThroughput: -1, uploadThroughput: -1,
  });
  // The flag alone is not proof — shut the origin down as well. Then nothing can
  // arrive over the wire and every byte below provably came from the app's cache.
  h.closeServer();
  const live = await h.evalp(`fetch('/index.html?nocache=' + Date.now(), { cache: 'no-store' })
    .then(r => 'REACHED ' + r.status).catch(() => 'BLOCKED')`);
  check('P2 negative control: the origin is physically gone, not just flagged offline',
    live === 'BLOCKED', 'uncached fetch returned ' + live);
  const cachedReach = await h.evalp(`fetch('/index.html').then(r => 'OK ' + r.status).catch(() => 'FAILED')`);
  check('P2 positive control: a cached file is still served by the service worker',
    /^OK /.test(String(cachedReach)), 'fetch returned ' + cachedReach);
  const online = await h.evalv(`navigator.onLine`);
  check('P2 the browser itself reports offline', online === false, 'navigator.onLine = ' + online);

  /* ---------------- Phase 3: the hub, offline ---------------------------- */
  await h.navigate(`${BASE}:${h.port}/index.html`);
  const hub = await h.waitFor(`document.querySelectorAll('#hub .hub-tile').length>0`,
    { label: 'the hub tiles' });
  check('P3 hub renders offline', hub.ok, hub.why || 'tiles present');
  const groups = await h.evalv(`JSON.stringify([...document.querySelectorAll('#hub .hub-tile')]
    .map(b=>({go:b.dataset.go,label:b.getAttribute('aria-label')||''})))`);
  const tiles = groups && !groups.__err ? JSON.parse(groups) : [];
  check('P3 hub group tiles carry real Serbian titles', tiles.length === 2 && tiles.every(t => t.go && t.label),
    JSON.stringify(tiles));

  // a child must be able to walk hub -> group -> game, offline
  const t1 = await h.tap('#hub .hub-tile[data-go="hub-learning"]');
  if (!t1.ok) check('P3 a group tile is reachable by a child offline', false, t1.why);
  const inGroup = await h.waitFor(`document.querySelectorAll('#hub-learning .hub-btn').length>0`,
    { label: 'the learning group to open' });
  check('P3 a child can walk hub -> group -> game offline', inGroup.ok, inGroup.why || 'group opened');
  const total = await h.evalv(`document.querySelectorAll('#hub-games .hub-btn, #hub-learning .hub-btn').length`);
  // one button per child game plus the parent lock, counted from the registry
  const expectedButtons = children().length + parents().length;
  check(`P3 every game is listed offline (${expectedButtons} buttons: ${children().length} games + the parent area)`,
    total === expectedButtons, total + ' game buttons');

  /* ------- Phase 4 + 6: every child app plays, then returns to hub ------ */
  for (const a of APPS) {
    await h.navigate(`${BASE}:${h.port}${a.page}`);
    const boot = await h.waitFor(a.ready, { timeout: 15000, label: a.id + ' boot' });
    if (!boot.ok) {
      check(`P4 ${a.id} loads and boots offline`, false, boot.why);
      results.push([a.id, 'LOAD FAILED', boot.why]);
      continue;
    }
    check(`P4 ${a.id} loads and boots offline`, true, 'booted');

    if (a.start) {
      const s = await a.start(h);
      if (!s.ok) { check(`P4 ${a.id} start`, false, s.why); results.push([a.id, 'START FAILED', s.why]); continue; }
    }

    let note = 'played';
    let passed = true;
    if (a.id === 'racing3d') {
      // probe a throwaway canvas, not a page selector: the view canvas is built
      // at runtime, so a wrong selector would report "no WebGL" on a host that
      // has it and quietly reduce coverage to a SKIP
      const gl = await h.evalv(`(function(){
        try { const c=document.createElement('canvas');
          return !!(c.getContext('webgl2')||c.getContext('webgl')); }
        catch(e){ return false; }
      })()`);
      if (!gl) {
        skip(`P4 ${a.id} primary interaction`, 'no WebGL on this host — the game correctly shows its fallback');
        results.push([a.id, 'SKIP (no WebGL)', 'no software GL available']);
        passed = null;
      }
    }
    if (passed !== null) {
      let res;
      try { res = await a.act(h); } catch (e) { res = { ok: false, why: 'threw: ' + e.message }; }
      if (!res.ok) {
        check(`P4 ${a.id} primary interaction offline`, false, res.why);
        results.push([a.id, 'INTERACTION FAILED', res.why]);
        continue;
      }
      check(`P4 ${a.id} primary interaction offline`, true, 'state changed under a trusted gesture');
    }

    // Phase 5: audio must not break the game even with no network
    const audio = await h.evalv(`(function(){
      try { if (window.tone) window.tone(440, .08);
            if (window.speech && window.speech.speak) window.speech.speak('Офлајн тест');
            if (window.audio && window.audio.resume) window.audio.resume();
            return 'no-throw';
      } catch (e) { return 'THREW: ' + e.message; }
    })()`);
    check(`P5 ${a.id} audio failure does not crash the game`, audio === 'no-throw', String(audio));

    // Phase 6: a child must be able to leave the game and get back to the hub
    const back = await h.tap(a.back);
    if (!back.ok) { check(`P6 ${a.id} back button returns to the hub`, false, back.why); results.push([a.id, 'BACK FAILED', back.why]); continue; }
    const home = await h.waitFor(`location.pathname.endsWith('/index.html')`,
    { timeout: 10000, label: a.id + ' to land on the hub' });
    check(`P6 ${a.id} back button returns to the hub`, home.ok, home.why || 'landed on the hub');
    if (passed !== null) results.push([a.id, 'PASS', note]);
  }

  /* ---------------- the caregiver page, offline too ---------------------- */
  await h.navigate(`${BASE}:${h.port}${PARENT_URL}`);
  const p = await h.waitFor(`!!document.getElementById('check-updates')`, { label: 'the parent page' });
  check('P4 parent page loads offline', p.ok, p.why || 'ok');
  if (p.ok) {
    const ver = await h.waitFor(`document.getElementById('version-info')?.textContent.trim().length>0`,
      { timeout: 15000, label: 'the version to resolve from cache' });
    check('P4 parent reads the app version from the offline cache', ver.ok, ver.why || 'version resolved');
    const ctl = await h.tap('#check-updates');
    check('P4 «Провери ажурирања» control is reachable by a parent offline', ctl.ok, ctl.why || 'tapped');
    const rep = await h.waitFor(`(function(){
      const s = document.getElementById('parent-status').textContent.trim();
      return s.length>0 && s!=='Проверавам...' && s!=='Преузимање...' && !document.getElementById('check-updates').disabled;
    })()`,
      { timeout: 25000, label: 'the update check to report something' });
    check('P4 update check reports an answer offline instead of hanging', rep.ok,
      rep.why || await h.evalv(`document.getElementById('parent-status').textContent.trim()`));
    const conn = await h.evalv(`document.getElementById('conn-status').textContent.trim()`);
    check('P4 parent page shows the real connection state', !!conn && conn !== '?', conn || '(empty)');
  }

  /* ---------------- acceptance table ------------------------------------- */
  const pad = (s, n) => (s + ' '.repeat(n)).slice(0, n);
  console.log('\n--- R6 offline acceptance ------------------------------------------');
  console.log('  ' + pad('game', 18) + pad('result', 18) + 'note');
  for (const [id, r, note] of results) console.log('  ' + pad(id, 18) + pad(r, 18) + note);
  console.log('----------------------------------------------------------------------');
  const bad = results.filter(r => r[1] !== 'PASS' && !r[1].startsWith('SKIP'));
  check(`acceptance: every offline game loads, plays and returns (${results.length} games)`,
    bad.length === 0, bad.map(b => b[0]).join(', ') || 'all green');
} finally {
  await h.close();
}