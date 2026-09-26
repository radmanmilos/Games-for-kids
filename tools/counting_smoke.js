/* Animal Counting smoke test — Phase 2 task 114 (GAME-COUNT-001).
   Drives pages/animal_counting.html headlessly: scene shows animal tiles,
   child taps each tile to count (buttons hidden until all counted),
   then picks the correct number, 10 levels then "Готово!" celebration.
   Run:  node tools/counting_smoke.js     (from the repo root or anywhere)
   Requires Node >= 22. CHROME_PATH env optional. */
const { start, check, getFails } = require('./headless.js');
const fs = require('fs');
const path = require('path');

const sleep = ms => new Promise(r => setTimeout(r, ms));

const STUB = `window.speech={speak:function(t,cb){if(cb)cb();},cancel:function(){}};window.popSound=window.gentleMiss=window.successChime=window.celebrate=function(){}; true`;

const CLICK = sel => `document.querySelector('${sel}').click(); true`;

// Tap every animal tile in the scene, then return the count.
const COUNT_ALL = `(function(){
  const tiles = document.querySelectorAll('#countScene .count-tile');
  let n = 0;
  tiles.forEach(t => { if (!t.classList.contains('counted')) { t.click(); n++; } });
  return n;
})()`;

(async () => {
  const h = await start({ page: '/pages/animal_counting.html', tag: 'counting-smoke', width: 1024, height: 800 });

  let ready = false;
  for (let i = 0; i < 20 && !ready; i++) {
    ready = await h.evalv(`typeof window.startAnimalCounting === 'function' && !!document.getElementById('countScene')`);
    if (!ready) await sleep(200);
  }
  check('counting game booted (startAnimalCounting ready + scene present)', ready);
  await h.evalv(STUB);

  // --- Level 1: verify counting phase (tiles visible, buttons hidden) ---
  const lvl1 = await h.evalv(`JSON.stringify({
    sceneTiles: document.querySelectorAll('#countScene .count-tile').length,
    buttons: document.querySelectorAll('#countButtons button').length,
    level: document.getElementById('countLevel').textContent,
    score: document.getElementById('countScoreValue').textContent,
    result: document.getElementById('countResult').textContent,
    nextHidden: document.getElementById('countNext').style.display === 'none'
  })`);
  const L1 = JSON.parse(lvl1);
  check('level 1: tiles visible (1-10), buttons hidden, level=1, score=0, result prompts counting',
    L1.sceneTiles >= 1 && L1.sceneTiles <= 10 && L1.buttons === 0 && L1.level === '1' && L1.score === '0' && L1.result === 'Изброј животиње!' && L1.nextHidden === true, lvl1);

  const correctVal = await h.evalv(`document.getElementById('game-counting').dataset.correct`);
  const cv = correctVal != null ? String(correctVal) : '';
  check('correct answer stored in game-counting dataset', cv !== '', cv);

  // Tap all tiles to count them
  const tapped = await h.evalv(COUNT_ALL);
  await sleep(150);
  const afterCount = await h.evalv(`JSON.stringify({
    counted: document.querySelectorAll('#countScene .count-tile.counted').length,
    buttons: document.querySelectorAll('#countButtons button').length,
    result: document.getElementById('countResult').textContent
  })`);
  const AFC = JSON.parse(afterCount);
  check('after tapping all: all counted, buttons appear, prompt asks "Колико их има?"',
    AFC.counted === L1.sceneTiles && AFC.buttons >= 4 && AFC.result === 'Колико их има?', afterCount);

  // Now pick the correct answer
  await h.evalv(CLICK(`#countButtons button[data-val="${cv}"]`));
  await sleep(120);
  const afterCorrect = await h.evalv(`JSON.stringify({
    score: document.getElementById('countScoreValue').textContent,
    result: document.getElementById('countResult').textContent,
    nextHidden: document.getElementById('countNext').style.display === 'none',
    correctDisabled: document.querySelector('#countButtons button[data-val="${cv}"]').disabled
  })`);
  const AC = JSON.parse(afterCorrect);
  check('correct tap: score=1, result empty, next shown, correct button disabled',
    AC.score === '1' && AC.result === '' && AC.nextHidden === false && AC.correctDisabled === true, afterCorrect);

  const wrongBtns = await h.evalv(`Array.from(document.querySelectorAll('#countButtons button:not([data-val="${cv}"])')).filter(b => !b.disabled).length`);
  check('wrong buttons are still enabled after correct tap', wrongBtns === 0, String(wrongBtns));

  // --- Level 2: count again, then wrong answer ---
  await h.evalv(CLICK('#countNext'));
  await sleep(120);
  const lvl2pre = await h.evalv(`JSON.stringify({
    level: document.getElementById('countLevel').textContent,
    score: document.getElementById('countScoreValue').textContent,
    buttons: document.querySelectorAll('#countButtons button').length
  })`);
  const L2P = JSON.parse(lvl2pre);
  check('next advances to level 2, score stays 1, buttons hidden again', L2P.level === '2' && L2P.score === '1' && L2P.buttons === 0, lvl2pre);

  await h.evalv(COUNT_ALL);
  await sleep(150);
  const wrongVal = await h.evalv(`(function(){
    const correct = Number(document.getElementById('game-counting').dataset.correct);
    const opts = Array.from(document.querySelectorAll('#countButtons button')).map(b => Number(b.dataset.val));
    return opts.find(v => v !== correct) || opts[0];
  })()`);
  await h.evalv(CLICK(`#countButtons button[data-val="${wrongVal}"]`));
  await sleep(80);
  const wrong = await h.evalv(`JSON.stringify({
    result: document.getElementById('countResult').textContent,
    score: document.getElementById('countScoreValue').textContent
  })`);
  const W = JSON.parse(wrong);
  check('wrong tap: nudge "Покушај поново", score unchanged', W.result === 'Покушај поново' && W.score === '1', wrong);

  // --- Finish remaining levels: count all, then correct answer ---
  let level = 2;
  for (let i = 0; i < 9; i++) {
    const cv = await h.evalv(`document.getElementById('game-counting').dataset.correct`);
    await h.evalv(CLICK(`#countButtons button[data-val="${cv}"]`));
    await sleep(100);
    await h.evalv(CLICK('#countNext'));
    await sleep(80);
    level++;
  }
  const fin = await h.evalv(`JSON.stringify({
    result: document.getElementById('countResult').textContent,
    nextHidden: document.getElementById('countNext').style.display === 'none'
  })`);
  const F = JSON.parse(fin);
  check('after 10 correct levels: "Готово!" + next hidden', F.result === 'Готово! 🌟' && F.nextHidden === true, fin);

  const root = path.join(__dirname, '..');
  const indexHtml = fs.readFileSync(path.join(root, 'game', 'index.html'), 'utf8');
  check('hub button wired (data-go="game-counting")', indexHtml.includes('data-go="game-counting"'));
  const nav = fs.readFileSync(path.join(root, 'game', 'shared', 'navigation.js'), 'utf8');
  check('navigation route wired (game-counting -> animal_counting.html)', nav.includes("'game-counting'") && nav.includes("'pages/animal_counting.html'"));
  const main = fs.readFileSync(path.join(root, 'game', 'shared', 'main.js'), 'utf8');
  check('page boots via inline DOMContentLoaded (counting.html)', main.includes('startAnimalCounting') || fs.readFileSync(path.join(root, 'game', 'pages', 'animal_counting.html'), 'utf8').includes('startAnimalCounting'));

  h.close();
  console.log(`\n${getFails() === 0 ? 'ALL' : 'SOME'} CHECKS ${getFails() === 0 ? 'PASSED' : 'FAILED'} (${getFails()} fail)`);
  process.exit(getFails() ? 1 : 0);
})().catch(e => { console.error('counting_smoke crashed:', e); process.exit(1); });
