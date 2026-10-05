/* Spatial smoke test — R26 "Простор" spatial-concepts pilot.
   Exercises all five concept modes, the gentle-miss/hint path, the celebration
   cadence, large reachable controls, and the registry/hub wiring. */
const { start, check, getFails, sleep } = require('./headless.js');
const { checkRouteWired } = require('./route_contract.js');
const fs = require('fs');
const path = require('path');

const STUB = `window.audioBuses.playTone=function(){};window.successChime=function(){};window.gentleMiss=function(){};window.showHint=function(){};window.speakSr=function(){};window.__spatialCelebrations=0;window.celebrate=function(){window.__spatialCelebrations++};true`;

/* The five words the roadmap names, and the scene mode each belongs to. The
 * smoke asserts the child is shown both sides of every pair, so a mode cannot
 * quietly lose one of its two choices. */
const MODES = [
  { id: 'updown', words: ['Горе', 'Доле'] },
  { id: 'insideoutside', words: ['Унутра', 'Ван'] },
  { id: 'leftright', words: ['Лево', 'Десно'] },
  { id: 'nearfar', words: ['Близу', 'Далеко'] },
  { id: 'frontbehind', words: ['Испред', 'Иза'] },
];

(async () => {
  const h = await start({ page: '/pages/spatial.html', tag: 'spatial-smoke', width: 1024, height: 800 });
  const ready = await h.waitFor(`!!window.__spatial && window.__spatial.state().phase==='ask'`,
    { timeout: 5000, label: 'the first spatial round to be ready' });
  check('spatial game boots with a round ready to answer', ready.ok,
    ready.ok ? JSON.stringify(await h.evalv(`JSON.stringify(window.__spatial.state())`)) : ready.why);
  await h.evalv(STUB);

  const state = async () => JSON.parse(await h.evalv(`JSON.stringify(window.__spatial.state())`));

  // Geometry is asserted, not just presence: `headless.boxOf` scrolls a control
  // into view, so a clipped control would otherwise pass a presence-only check
  // while no child could tap it (task 177c).
  const geometry = JSON.parse(await h.evalv(`JSON.stringify(
    [document.getElementById('spatial-choice-a'),document.getElementById('spatial-choice-b')].map(el=>{
      const r=el.getBoundingClientRect(),hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
      return {inside:r.top>=0&&r.left>=0&&r.bottom<=innerHeight&&r.right<=innerWidth,
        hit:hit===el||el.contains(hit),w:r.width,h:r.height,text:el.textContent};
    }))`));
  check('both choice buttons are large and reachable in the viewport',
    geometry.length === 2 && geometry.every(g => g.inside && g.hit && g.w >= 150 && g.h >= 70),
    JSON.stringify(geometry));

  check('no score or timer is shown', await h.evalv(
    `!document.querySelector('[data-score],#score,[data-timer],#timer')`));
  check('the prompt is a short Cyrillic question, not a sentence of instructions',
    (await h.evalv(`document.getElementById('spatial-prompt').textContent`)) === 'Где је лопта?');
  check('exactly one choice is marked correct, and exactly two choices exist', await h.evalv(
    `document.querySelectorAll('#spatial-choices .spatial-choice').length===2 &&
     document.querySelectorAll('#spatial-choices .spatial-choice[data-correct="1"]').length===1`));
  check('the scene draws the ball it asks about', await h.evalv(
    `[...document.querySelectorAll('#spatial-scene .sp-item')].some(el=>el.textContent==='⚽')`));

  /* Every mode: the words are the roadmap's pair, the marked answer matches the
     drawn scene, a wrong tap neither advances nor is punished, and a second
     wrong tap hints instead of failing. */
  for (let i = 0; i < MODES.length; i++) {
    const mode = MODES[i];
    await h.evalv(`window.__spatial.setRound(${i})`);
    const shown = await h.evalv(`JSON.stringify(
      [...document.querySelectorAll('#spatial-choices .spatial-choice')]
        .map(el=>({text:el.textContent,correct:el.dataset.correct==='1'})))`);
    const choices = JSON.parse(shown);
    const words = choices.map(c => c.text).sort();
    check(`${mode.id}: offers the Serbian pair ${mode.words.join('/')}`,
      JSON.stringify(words) === JSON.stringify([...mode.words].sort()), shown);
    check(`${mode.id}: exactly one of the two words is marked correct`,
      choices.filter(c => c.correct).length === 1, shown);

    // The correct answer is whichever the game marked; the wrong one is its
    // sibling, so this drives a genuine miss rather than a scripted class.
    const wrongKey = choices.findIndex(c => !c.correct) === 0 ? 'a' : 'b';
    await h.tap(`#spatial-choice-${wrongKey}`);
    await sleep(120);
    const afterMiss = await state();
    check(`${mode.id}: a wrong tap stays gentle — no advance, still asking`,
      afterMiss.mode === mode.id && afterMiss.phase === 'ask' && afterMiss.misses === 1,
      JSON.stringify(afterMiss));
    check(`${mode.id}: the wrong button shakes instead of failing`,
      await h.evalv(`document.getElementById('spatial-choice-${wrongKey}').classList.contains('spatial-wrong')`));

    await h.tap(`#spatial-choice-${wrongKey}`);
    await sleep(120);
    check(`${mode.id}: a second miss hints the right answer, never a failure screen`,
      await h.evalv(`document.querySelector('#spatial-choices .spatial-choice[data-correct="1"]').classList.contains('spatial-hint')`)
      && (await state()).misses === 2);
  }

  // Correct answers advance, chime, and lock the buttons so a double tap
  // cannot score two rounds.
  await h.evalv(`window.__spatial.setRound(0)`);
  const correctKey = (await state()).correct;
  await h.tap(`#spatial-choice-${correctKey}`);
  const correctState = await state();
  check('a correct answer is accepted and locks both buttons',
    correctState.phase === 'success' && await h.evalv(
      `document.getElementById('spatial-choice-a').disabled && document.getElementById('spatial-choice-b').disabled`),
    JSON.stringify(correctState));
  const advanced = await h.waitFor(`window.__spatial.state().phase==='ask' && window.__spatial.state().round===1`,
    { timeout: 4000, label: 'the round to advance after a correct answer' });
  check('a correct answer advances to the next concept', advanced.ok, advanced.why);
  check('the two sides of the answer alternate between rounds', (await state()).correct === 'b');

  /* Celebration cadence. Asserted as a rule over four successive answers rather
     than one boundary: `successes` is a session counter that deliberately
     survives setRound, and the checks above have already spent some of it, so a
     single "wait for the third celebration" would be testing an accident of
     ordering rather than the every-third rule. */
  await h.evalv(`window.__spatialCelebrations=0`);
  const startSuccesses = (await state()).successes;
  const cadence = [];
  for (let n = 0; n < 4; n++) {
    await h.evalv(`window.__spatial.setRound(0)`);
    const key = (await state()).correct;
    const before = (await state()).successes;
    await h.tap(`#spatial-choice-${key}`);
    cadence.push(`${before + 1}:${await h.evalv(`window.__spatialCelebrations`)}`);
    await h.waitFor(`window.__spatial.state().phase==='ask'`, { timeout: 4000, label: 'the next round' });
  }
  // `__spatialCelebrations` is cumulative, so the expectation is the number of
  // multiples of 3 reached so far — not a 0/1 flag that would reset each time.
  const expectedCadence = [];
  for (let s = startSuccesses + 1; s <= startSuccesses + 4; s++) {
    expectedCadence.push(`${s}:${Math.floor(s / 3) - Math.floor(startSuccesses / 3)}`);
  }
  check('celebration fires exactly on every third correct answer',
    cadence.join(' ') === expectedCadence.join(' '), `got ${cadence.join(' ')} want ${expectedCadence.join(' ')}`);
  check('celebration is the only reward — no points or streak are displayed', await h.evalv(
    `!document.body.textContent.match(/\\d+\s*(поена|бала|x\\s*\d)/i)`));

  const index = fs.readFileSync(path.join(__dirname, '..', 'game', 'index.html'), 'utf8');
  check('hub button wired (data-go="game-spatial")', index.includes('data-go="game-spatial"'));
  checkRouteWired('spatial', 'game-spatial', 'pages/spatial.html',
    { back: 'spatial-back', start: 'startSpatial', check });

  await h.close();
  console.log(`\n${getFails() === 0 ? 'ALL' : 'SOME'} CHECKS ${getFails() === 0 ? 'PASSED' : 'FAILED'} (${getFails()} fail)`);
  process.exit(getFails() ? 1 : 0);
})().catch(error => { console.error('spatial_smoke crashed:', error); process.exit(1); });