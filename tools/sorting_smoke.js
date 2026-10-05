/* Sorting smoke test — R22 "Разврставање" pilot (pages/sorting.html).
   Drives the page headlessly: two categories, two large baskets, a tray of
   objects, tap-to-select + tap-to-place into the correct basket, the gentle
   soft-return on a wrong drop with a hint after two misses, full-round
   completion, and the reachability of every basket and object (inside the
   viewport AND hit-testable, not merely clickable).
   Run:  node tools/sorting_smoke.js     (from the repo root or anywhere)
   Requires Node >= 22. CHROME_PATH env optional. */
const { start, check, getFails } = require('./headless.js');
const { checkRouteWired } = require('./route_contract.js');
const fs = require('fs');
const path = require('path');

const sleep = ms => new Promise(r => setTimeout(r, ms));

const STUB = `window.speech={speak:function(){},cancel:function(){}};window.audioBuses.play=function(){};window.audioBuses.speakWithDuck=function(t,cb){if(cb)cb();};window.celebrate=function(){}; true`;

(async () => {
  const h = await start({ page: '/pages/sorting.html', tag: 'sorting-smoke', width: 1024, height: 800 });

  let ready = false;
  for (let i = 0; i < 20 && !ready; i++) {
    ready = await h.evalv(`typeof window.startSorting === 'function' && !!window.__sorting && !!document.getElementById('sort-baskets')`);
    if (!ready) await sleep(200);
  }
  check('sorting game booted (startSorting + __sorting ready)', ready);
  await h.evalv(STUB);

  const st = async () => JSON.parse(await h.evalv(`JSON.stringify(window.__sorting.state())`));
  const binIdFor = (state, item) => {
    const bin = state.bins.find(b => b.cat === item.cat);
    return bin ? bin.id : null;
  };
  const firstUnplaced = state => state.items.find(it => !it.placed);
  const trayCount = () => h.evalv(`document.querySelectorAll('#sort-tray .sort-item').length`);

  // ---- shape of round 0 ------------------------------------------------------
  const s = await st();
  check('round 0 is the color category with two baskets', s.category === 'color' && s.bins.length === 2, JSON.stringify(s));
  check('round 0 offers a tray of objects, none placed yet', s.items.length >= 2 && s.remaining === s.items.length, JSON.stringify(s));

  const dom = await h.evalv(`JSON.stringify((() => {
    const tray = document.querySelectorAll('#sort-tray .sort-item');
    const bins = document.querySelectorAll('#sort-baskets .sort-basket');
    return {
      tray: tray.length,
      bins: bins.length,
      itemCats: [...tray].map(b => b.dataset.cat).sort().join(','),
      binCats: [...bins].map(b => b.dataset.cat).sort().join(','),
      eachItemHasBin: [...tray].every(b => [...bins].some(x => x.dataset.cat === b.dataset.cat))
    };
  })())`);
  const D = JSON.parse(dom);
  check('rendered tray size matches state and every object has a matching basket',
    D.tray === s.items.length && D.bins === 2 && D.eachItemHasBin, dom);
  check('basket category set equals the item category set (a classification is possible)',
    D.binCats === [...new Set(D.itemCats.split(','))].sort().join(','), dom);

  // Geometry: a passing .click() proves nothing about reachability.
  const geom = await h.evalv(`JSON.stringify((() => {
    const hitOf = el => { const r = el.getBoundingClientRect();
      const hit = document.elementFromPoint(r.left + r.width/2, r.top + r.height/2);
      return { inside: r.top >= -1 && r.left >= -1 && r.bottom <= innerHeight + 1 && r.right <= innerWidth + 1,
               hit: !!(hit && (hit === el || el.contains(hit))), w: r.width, h: r.height }; };
    return {
      bins: [...document.querySelectorAll('#sort-baskets .sort-basket')].map(hitOf),
      items: [...document.querySelectorAll('#sort-tray .sort-item')].map(hitOf)
    };
  })())`);
  const GE = JSON.parse(geom);
  check('both baskets are large targets, inside the viewport and hit-testable',
    GE.bins.length === 2 && GE.bins.every(b => b.inside && b.hit && Math.min(b.w, b.h) >= 100), geom);
  check('the tray objects are inside the viewport and hit-testable',
    GE.items.length >= 2 && GE.items.every(i => i.inside && i.hit), geom);

  // ---- wrong drop: soft return, no failure, hint after two -------------------
  const s0 = await st();
  const item0 = firstUnplaced(s0);
  const wrongBin = s0.bins.find(b => b.cat !== item0.cat);
  const before = await trayCount();
  await h.evalv(`document.querySelector('#sort-tray .sort-item[data-key="${item0.key}"]').click()`);
  const selected = (await st()).selected === item0.key;
  check('tapping an object selects it', selected === true, String(selected));
  await h.evalv(`document.getElementById('${wrongBin.id}').click()`);
  const afterWrong = await trayCount();
  const wrongState = await st();
  const wrongMarked = await h.evalv(`document.getElementById('${wrongBin.id}').classList.contains('sort-wrong')`);
  check('a wrong drop softly returns the object to the tray (nothing placed)',
    afterWrong === before && wrongState.misses === 1 && wrongState.items.find(i => i.key === item0.key).placed === false, JSON.stringify(wrongState));
  check('a wrong drop shakes the basket gently (no failure screen)', wrongMarked === true, String(wrongMarked));

  await h.evalv(`document.querySelector('#sort-tray .sort-item[data-key="${item0.key}"]').click()`);
  await h.evalv(`document.getElementById('${wrongBin.id}').click()`);
  const hintShown = await h.evalv(`!!document.querySelector('.sort-basket.sort-hint')`);
  check('after two misses the correct basket is hinted', hintShown === true, String(hintShown));

  // ---- correct drop: the object moves into the basket ------------------------
  await h.evalv(`window.__sorting.goToRound(0)`);
  await sleep(50);
  const sc = await st();
  const it1 = firstUnplaced(sc);
  const rightBin = binIdFor(sc, it1);
  const beforeOk = await trayCount();
  await h.evalv(`document.querySelector('#sort-tray .sort-item[data-key="${it1.key}"]').click()`);
  await h.evalv(`document.getElementById('${rightBin}').click()`);
  const afterOk = await trayCount();
  const okState = await st();
  const chipInBin = await h.evalv(`!!document.getElementById('${rightBin}').querySelector('.sort-chip')`);
  check('a correct drop moves the object into the matching basket',
    afterOk === beforeOk - 1 && okState.items.find(i => i.key === it1.key).placed === true && chipInBin === true,
    JSON.stringify(okState));

  // ---- complete the round ----------------------------------------------------
  await h.evalv(`window.__sorting.goToRound(0)`);
  await sleep(50);
  for (let guard = 0; guard < 12; guard++) {
    const cur = await st();
    if (cur.remaining === 0) break;
    const it = firstUnplaced(cur);
    const bin = binIdFor(cur, it);
    await h.evalv(`document.querySelector('#sort-tray .sort-item[data-key="${it.key}"]').click()`);
    await h.evalv(`document.getElementById('${bin}').click()`);
    await sleep(30);
  }
  let advanced = false;
  for (let i = 0; i < 30 && !advanced; i++) {
    advanced = (await st()).round === 1;
    if (!advanced) await sleep(100);
  }
  check('placing every object completes the round and starts the next one', advanced === true);

  // ---- category rotation -----------------------------------------------------
  await h.evalv(`window.__sorting.goToRound(1)`);
  await sleep(50);
  const s1 = await st();
  const d1 = await h.evalv(`JSON.stringify({bins:[...document.querySelectorAll('#sort-baskets .sort-basket')].map(b=>b.dataset.cat)})`);
  check('round 1 rotates to the second category (animals / food)',
    s1.category === 'kind' && s1.bins.length === 2 && JSON.parse(d1).bins.length === 2, JSON.stringify(s1));

  // ---- touch draggability -----------------------------------------------------
  /* The drag is implemented with pointer events, and a mouse-driven harness can
     never reproduce a finger. On a touchscreen, a draggable element that does not
     declare `touch-action:none` lets the browser claim the gesture for panning or
     zooming, which fires `pointercancel` and kills the drag part way — so the item
     silently refuses to move for the child while every mouse smoke stays green.
     Asserting the COMPUTED style is the only way to pin this without a
     touch-emulating runner.

     Measured before the fix: `.sort-item` computed `manipulation` (inherited from
     the page's `html,body` rule) and `.seq-card` computed `auto`. Both are
     non-`none` and both break a finger drag; after the fix both compute `none`. */
  const dragStyle = JSON.parse(await h.evalv(`JSON.stringify((() => {
    const el = document.querySelector('.sort-item');
    if (!el) return { found: false };
    const cs = getComputedStyle(el);
    return { found: true, touchAction: cs.touchAction, userSelect: cs.userSelect || cs.webkitUserSelect };
  })())`));
  check('sortable items declare touch-action:none so a finger drag is not cancelled by the browser',
    dragStyle.found === true && dragStyle.touchAction === 'none',
    `computed touch-action = ${dragStyle.touchAction} (must be 'none')`);
  check('sortable items are not text-selectable during a drag',
    dragStyle.userSelect === 'none' || dragStyle.userSelect === undefined || dragStyle.userSelect === '',
    `computed user-select = ${dragStyle.userSelect}`);

  // ---- static wiring ---------------------------------------------------------
  const root = path.join(__dirname, '..');
  const indexHtml = fs.readFileSync(path.join(root, 'game', 'index.html'), 'utf8');
  check('hub button wired (data-go="game-sorting")', indexHtml.includes('data-go="game-sorting"'));
  checkRouteWired('sorting', 'game-sorting', 'pages/sorting.html',
    { back: 'sorting-back', start: 'startSorting', check });

  await h.close();
  console.log(`\n${getFails() === 0 ? 'ALL' : 'SOME'} CHECKS ${getFails() === 0 ? 'PASSED' : 'FAILED'} (${getFails()} fail)`);
  process.exit(getFails() ? 1 : 0);
})().catch(e => { console.error('sorting_smoke crashed:', e); process.exit(1); });
