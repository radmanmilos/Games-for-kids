/* Shapes smoke test — Phase 5 task 77.
   Drives pages/shapes.html headlessly: 3 slots + 3 pieces render, keyboard
   selection + placement works, correct match triggers success, round completion
   starts a fresh round.
   Run:  node tools/shapes_smoke.js     (from the repo root or anywhere)
   Requires Node >= 22. CHROME_PATH env optional. */
const { start, check, getFails } = require('./headless.js');
const fs = require('fs');
const path = require('path');

const sleep = ms => new Promise(r => setTimeout(r, ms));

const STUB = `window.speech={speak:function(){},cancel:function(){}};window.popSound=window.gentleMiss=window.successChime=window.celebrate=function(){}; true`;

const CLICK = sel => `document.querySelector('${sel}').click(); true`;

(async () => {
  const h = await start({ page: '/pages/shapes.html', tag: 'shapes-smoke', width: 1024, height: 800 });

  let ready = false;
  for (let i = 0; i < 20 && !ready; i++) {
    ready = await h.evalv(`typeof window.startShapesRound === 'function' && !!document.getElementById('shapesStage')`);
    if (!ready) await sleep(200);
  }
  check('shapes game booted (startShapesRound ready)', ready);
  await h.evalv(STUB);

  const boot = await h.evalv(`JSON.stringify({
    slots: document.querySelectorAll('#shapesStage .slot').length,
    pieces: document.querySelectorAll('#shapesStage .piece').length,
    slotTypes: Array.from(document.querySelectorAll('#shapesStage .slot')).map(s => s.classList.contains('circle') ? 'circle' : s.classList.contains('triangle') ? 'triangle' : s.classList.contains('star') ? 'star' : 'square').sort().join(','),
    pieceTypes: Array.from(document.querySelectorAll('#shapesStage .piece')).map(s => s.classList.contains('circle') ? 'circle' : s.classList.contains('triangle') ? 'triangle' : s.classList.contains('star') ? 'star' : 'square').sort().join(',')
  })`);
  const B = JSON.parse(boot);
  check('first round: 3 slots + 3 pieces render', B.slots === 3 && B.pieces === 3, boot);
  check('slot and piece types contain the same 3 shapes', B.slotTypes === B.pieceTypes, boot);

  await h.evalv(`(function(){ const p = document.querySelector('#shapesStage .piece'); p.dispatchEvent(new KeyboardEvent('keydown', {key:'Enter', bubbles:true})); return true; })()`);
  const selected = await h.evalv(`document.querySelector('#shapesStage .piece.kb-selected') !== null`);
  check('Enter on piece selects it (kb-selected class)', selected === true);

  const matchingSlot = await h.evalv(`(function(){
    const p = document.querySelector('#shapesStage .piece.kb-selected');
    const type = p.dataset.type;
    return document.querySelector('#shapesStage .slot[data-type="' + type + '"]:not([data-filled])') ? true : false;
  })()`);
  check('a matching unfilled slot exists for the selected piece', matchingSlot === true);

  await h.evalv(`(function(){ const s = document.querySelector('#shapesStage .slot[data-type="' + document.querySelector('#shapesStage .piece.kb-selected').dataset.type + '"]:not([data-filled])'); s.dispatchEvent(new KeyboardEvent('keydown', {key:'Enter', bubbles:true})); return true; })()`);
  const placed = await h.evalv(`document.querySelector('#shapesStage .piece[data-done="1"]') !== null`);
  check('Enter on matching slot places the piece (data-done=1)', placed === true);

  for (let step = 0; step < 2; step++) {
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
  check('all 3 pieces placed in first round', placedCount === 3, String(placedCount));

  await sleep(400);
  const newRound = await h.evalv(`JSON.stringify({
    slots: document.querySelectorAll('#shapesStage .slot').length,
    pieces: document.querySelectorAll('#shapesStage .piece').length
  })`);
  const NR = JSON.parse(newRound);
  check('after round completion: fresh 3 slots + 3 pieces', NR.slots === 3 && NR.pieces === 3, newRound);

  const root = path.join(__dirname, '..');
  const indexHtml = fs.readFileSync(path.join(root, 'game', 'index.html'), 'utf8');
  check('hub button wired (data-go="game-shapes")', indexHtml.includes('data-go="game-shapes"'));
  const nav = fs.readFileSync(path.join(root, 'game', 'shared', 'navigation.js'), 'utf8');
  check('navigation route wired (game-shapes -> shapes.html)', nav.includes("'game-shapes'") && nav.includes("'pages/shapes.html'"));
  const main = fs.readFileSync(path.join(root, 'game', 'shared', 'main.js'), 'utf8');
  check('standalone boot wired (shapes -> shapes-back/startShapesRound)', main.includes("'shapes': ['shapes-back', 'startShapesRound']"));

  h.close();
  console.log(`\n${getFails() === 0 ? 'ALL' : 'SOME'} CHECKS ${getFails() === 0 ? 'PASSED' : 'FAILED'} (${getFails()} fail)`);
  process.exit(getFails() ? 1 : 0);
})().catch(e => { console.error('shapes_smoke crashed:', e); process.exit(1); });
