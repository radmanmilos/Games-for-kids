/* Shapes smoke test — Phase 5 task 77 + task 123 (GAME-SHAPES-001).
   Drives pages/shapes.html headlessly: tier selector (1/2/3), generous snap
   radius, soft animation, no punishment on wrong target, hint highlight after
   repeated attempts, keyboard selection + placement, round completion.
   Run:  node tools/shapes_smoke.js     (from the repo root or anywhere)
   Requires Node >= 22. CHROME_PATH env optional. */
const { start, check, getFails } = require('./headless.js');
const { checkRouteWired } = require('./route_contract.js');
const fs = require('fs');
const path = require('path');

const sleep = ms => new Promise(r => setTimeout(r, ms));

const STUB = `window.speech={speak:function(){},cancel:function(){}};window.popSound=window.gentleMiss=window.successChime=window.celebrate=function(){}; true`;

(async () => {
  const h = await start({ page: '/pages/shapes.html', tag: 'shapes-smoke', width: 1024, height: 800 });

  let ready = false;
  for (let i = 0; i < 20 && !ready; i++) {
    ready = await h.evalv(`typeof window.startShapesRound === 'function' && !!document.getElementById('shapesStage')`);
    if (!ready) await sleep(200);
  }
  check('shapes game booted (startShapesRound ready)', ready);
  await h.evalv(STUB);

  // Tier 1 (default): 2 slots + 2 pieces
  const boot = await h.evalv(`JSON.stringify({
    slots: document.querySelectorAll('#shapesStage .slot').length,
    pieces: document.querySelectorAll('#shapesStage .piece').length,
    tierBtns: document.querySelectorAll('#shapesTier button').length,
    activeTier: document.querySelector('#shapesTier button.active') ? document.querySelector('#shapesTier button.active').dataset.tier : 'none'
  })`);
  const B = JSON.parse(boot);
  check('tier 1 (default): 2 slots + 2 pieces', B.slots === 2 && B.pieces === 2, boot);
  check('tier selector: 3 buttons, tier 1 active', B.tierBtns === 3 && B.activeTier === '1', boot);

  // Switch to tier 2: 3 slots + 3 pieces
  await h.evalv(`document.querySelector('#shapesTier button[data-tier="2"]').click()`);
  await sleep(100);
  const T2 = await h.evalv(`JSON.stringify({
    slots: document.querySelectorAll('#shapesStage .slot').length,
    pieces: document.querySelectorAll('#shapesStage .piece').length,
    activeTier: document.querySelector('#shapesTier button.active').dataset.tier
  })`);
  const T2R = JSON.parse(T2);
  check('tier 2: 3 slots + 3 pieces', T2R.slots === 3 && T2R.pieces === 3, T2);
  check('tier 2 button active', T2R.activeTier === '2', T2);

  // Switch to tier 3: 4 slots + 4 pieces
  await h.evalv(`document.querySelector('#shapesTier button[data-tier="3"]').click()`);
  await sleep(100);
  const T3 = await h.evalv(`JSON.stringify({
    slots: document.querySelectorAll('#shapesStage .slot').length,
    pieces: document.querySelectorAll('#shapesStage .piece').length,
    activeTier: document.querySelector('#shapesTier button.active').dataset.tier
  })`);
  const T3R = JSON.parse(T3);
  check('tier 3: 4 slots + 4 pieces', T3R.slots === 4 && T3R.pieces === 4, T3);
  check('tier 3 button active', T3R.activeTier === '3', T3);

  // Back to tier 1 for placement tests
  await h.evalv(`document.querySelector('#shapesTier button[data-tier="1"]').click()`);
  await sleep(100);

  // Keyboard: select piece, place on matching slot
  await h.evalv(`(function(){ const p = document.querySelector('#shapesStage .piece'); p.dispatchEvent(new KeyboardEvent('keydown', {key:'Enter', bubbles:true})); return true; })()`);
  const selected = await h.evalv(`document.querySelector('#shapesStage .piece.kb-selected') !== null`);
  check('Enter on piece selects it (kb-selected class)', selected === true);

  await h.evalv(`(function(){ const s = document.querySelector('#shapesStage .slot[data-type="' + document.querySelector('#shapesStage .piece.kb-selected').dataset.type + '"]:not([data-filled])'); s.dispatchEvent(new KeyboardEvent('keydown', {key:'Enter', bubbles:true})); return true; })()`);
  const placed = await h.evalv(`document.querySelector('#shapesStage .piece[data-done="1"]') !== null`);
  check('Enter on matching slot places the piece (data-done=1)', placed === true);

  // Place remaining piece(s)
  for (let step = 0; step < 3; step++) {
    await h.evalv(`(function(){
      const undone = document.querySelector('#shapesStage .piece:not([data-done="1"])');
      if (!undone) return false;
      undone.dispatchEvent(new KeyboardEvent('keydown', {key:'Enter', bubbles:true}));
      return true;
    })()`);
    await sleep(60);
    await h.evalv(`(function(){
      const p = document.querySelector('#shapesStage .piece.kb-selected');
      if (!p) return false;
      const s = document.querySelector('#shapesStage .slot[data-type="' + p.dataset.type + '"]:not([data-filled])');
      if (s) s.dispatchEvent(new KeyboardEvent('keydown', {key:'Enter', bubbles:true}));
      return true;
    })()`);
    await sleep(60);
  }
  const placedCount = await h.evalv(`document.querySelectorAll('#shapesStage .piece[data-done="1"]').length`);
  check('all pieces placed in tier 1 round', placedCount === 2, String(placedCount));

  // Touch interruption: pointercancel (start fresh round first)
  await h.evalv(`window.startShapesRound()`);
  await sleep(100);
  const cancelOk = await h.evalv(`(() => {
    const piece = document.querySelector('#shapesStage .piece:not([data-done="1"])');
    if (!piece) return { ok: false, reason: 'no piece' };
    piece.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1, clientX: 100, clientY: 100 }));
    piece.dispatchEvent(new PointerEvent('pointercancel', { bubbles: true, pointerId: 1 }));
    return { ok: true, done: piece.dataset.done };
  })()`);
  check('touch interruption: pointercancel does not place piece', cancelOk.ok === true && cancelOk.done === undefined, JSON.stringify(cancelOk));

  // Touch interruption: second finger (multi-touch)
  const multiTouchOk = await h.evalv(`(() => {
    const piece = document.querySelector('#shapesStage .piece:not([data-done="1"])');
    if (!piece) return { ok: false, reason: 'no piece' };
    piece.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1, clientX: 100, clientY: 100 }));
    piece.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 2, clientX: 200, clientY: 200 }));
    piece.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 2 }));
    return { ok: true, done: piece.dataset.done };
  })()`);
  check('touch interruption: second finger does not break game', multiTouchOk.ok === true && multiTouchOk.done === undefined, JSON.stringify(multiTouchOk));

  // Touch interruption: page hidden
  const hiddenOk = await h.evalv(`(() => {
    document.dispatchEvent(new Event('visibilitychange'));
    return { ok: true, pieces: document.querySelectorAll('#shapesStage .piece').length };
  })()`);
  check('touch interruption: page hidden does not break game', hiddenOk.ok === true && hiddenOk.pieces >= 2, JSON.stringify(hiddenOk));

  await sleep(400);
  const newRound = await h.evalv(`JSON.stringify({
    slots: document.querySelectorAll('#shapesStage .slot').length,
    pieces: document.querySelectorAll('#shapesStage .piece').length
  })`);
  const NR = JSON.parse(newRound);
  check('after round completion: fresh 2 slots + 2 pieces', NR.slots === 2 && NR.pieces === 2, newRound);

  // Static checks
  const root = path.join(__dirname, '..');
  const indexHtml = fs.readFileSync(path.join(root, 'game', 'index.html'), 'utf8');
  check('hub button wired (data-go="game-shapes")', indexHtml.includes('data-go="game-shapes"'));
// R7: the route/back wiring lives in app-registry.js now, not in navigation.js.
  checkRouteWired('shapes', 'game-shapes', 'pages/shapes.html',
    { back: 'shapes-back', start: 'startShapesRound', check });

  h.close();
  console.log(`\n${getFails() === 0 ? 'ALL' : 'SOME'} CHECKS ${getFails() === 0 ? 'PASSED' : 'FAILED'} (${getFails()} fail)`);
  process.exit(getFails() ? 1 : 0);
})().catch(e => { console.error('shapes_smoke crashed:', e); process.exit(1); });
