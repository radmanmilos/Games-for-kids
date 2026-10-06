/* Rhythm smoke test — task 206 mini drum set.
   Exercises both echo modes, growing melody complexity (2 → 6), forgiving
   replay on a wrong pad, free play, large reachable controls, and the
   registry/hub wiring. Determined only by state waits, never by sleep()-and-pray. */
const { start, check, getFails, sleep } = require('./headless.js');
const { checkRouteWired } = require('./route_contract.js');
const fs = require('fs');
const path = require('path');

const STUB = `window.__rhythmSounds=0;window.audioBuses.playTone=function(){window.__rhythmSounds++};window.successChime=function(){};window.gentleMiss=function(){window.__rhythmMisses++};window.__rhythmCelebrations=0;window.__rhythmMisses=0;window.celebrate=function(){window.__rhythmCelebrations++};true`;

(async () => {
  const h = await start({ page: '/pages/rhythm.html', tag: 'rhythm-smoke', width: 1024, height: 800 });
  const ready = await h.waitFor(
    `!!window.__rhythm && window.__rhythm.state().phase==='repeat'`,
    { timeout: 6000, label: 'the first melody (two pads) to finish playing' }
  );
  check('rhythm game boots into echo mode with a two-pad melody', ready.ok,
    ready.ok ? JSON.stringify(await h.evalv(`JSON.stringify(window.__rhythm.state())`)) : ready.why);
  await h.evalv(STUB);

  const state = async () => JSON.parse(await h.evalv(`JSON.stringify(window.__rhythm.state())`));
  const padSel = idx => `#rhythm-pads .rhythm-pad[data-idx="${idx}"]`;

  const geometry = JSON.parse(await h.evalv(`JSON.stringify(
    [...document.querySelectorAll('.rhythm-pad,.mode-btn')].map(el=>{
      const r=el.getBoundingClientRect(),hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
      return {cls:el.classList.contains('rhythm-pad')?'pad':'mode',inside:r.top>=0&&r.left>=0&&r.bottom<=innerHeight&&r.right<=innerWidth,
        hit:hit===el||el.contains(hit),w:r.width,h:r.height};
    }))`));
  const pads = geometry.filter(g=>g.cls==='pad'), modes = geometry.filter(g=>g.cls==='mode');
  check('all four pads and both mode buttons are reachable large targets',
    pads.length===4&&modes.length===2&&geometry.every(g=>g.inside&&g.hit)&&pads.every(g=>g.w>=120&&g.h>=120)&&modes.every(g=>g.w>=200&&g.h>=50),
    JSON.stringify(geometry));

  const visible = await h.evalv(`document.getElementById('rhythm-prompt').textContent==='Сад ти понови!' &&
    !document.querySelector('[data-score],#score,[data-timer],#timer')`);
  check('Cyrillic repeat prompt with no score or timer', visible === true);

  const st0 = await state();
  check('first melody length is 2 (the slowest start)', st0.length === 2 && st0.pattern.length === 2, JSON.stringify(st0));

  async function echoPattern() {
    const s = await state();
    if (s.phase !== 'repeat' || !Array.isArray(s.pattern) || s.pattern.length === 0) return { ok: false, why: JSON.stringify(s) };
    for (const idx of s.pattern) {
      const t = await h.tap(padSel(idx));
      if (!t.ok) return t;
      await sleep(70);
    }
    return { ok: true };
  }

  /* A wrong pad must be gently rejected and the melody replayed, never advance. */
  const s1 = await state();
  const wrongIdx = (s1.pattern[0] + 1) % 4;
  const wrong = await h.tap(padSel(wrongIdx));
  const afterWrong = await state();
  check('a wrong pad never advances the melody',
    wrong.ok && afterWrong.successes === 0 && afterWrong.step === 0,
    JSON.stringify(afterWrong));
  /* The game auto-replays the melody after a short pause: listen then repeat. */
  await h.waitFor(`window.__rhythm.state().phase==='listen'`, { timeout: 3000, label: 'the melody replay to begin' });
  await h.waitFor(`window.__rhythm.state().phase==='repeat'`, { timeout: 6000, label: 'the replayed melody to finish' });
  const missCounter = await h.evalv(`window.__rhythmMisses`);
  check('the wrong pad fired the gentlest miss feedback', missCounter === 1);

  /* Echoing the whole melody completes it and grows the next one to 3 pads. */
  const echo1 = await echoPattern();
  const done1 = await h.waitFor(`window.__rhythm.state().phase==='success'&&window.__rhythm.state().successes===1`,
    { timeout: 2000, label: 'the child to echo the two-pad melody' });
  check('echoing the two-pad melody succeeds', echo1.ok && done1.ok, JSON.stringify(await state()));
  const next1 = await h.waitFor(`window.__rhythm.state().round===1&&window.__rhythm.state().phase==='repeat'&&window.__rhythm.state().length===3`,
    { timeout: 7000, label: 'the next melody to be three pads long' });
  check('after success the melody grows to 3 pads', next1.ok, JSON.stringify(await state()));

  /* Second success: length grows to 4. */
  const echo2 = await echoPattern();
  const done2 = await h.waitFor(`window.__rhythm.state().phase==='success'&&window.__rhythm.state().successes===2`,
    { timeout: 2500, label: 'echoing the three-pad melody' });
  check('echoing the three-pad melody succeeds', echo2.ok && done2.ok, JSON.stringify(await state()));
  const next2 = await h.waitFor(`window.__rhythm.state().round===2&&window.__rhythm.state().phase==='repeat'&&window.__rhythm.state().length===4`,
    { timeout: 9000, label: 'the next melody to be four pads long' });
  check('after success the melody grows to 4 pads', next2.ok, JSON.stringify(await state()));

  const echo3 = await echoPattern();
  const done3 = await h.waitFor(`window.__rhythm.state().phase==='success'&&window.__rhythm.state().successes===3`,
    { timeout: 2500, label: 'echoing the four-pad melody' });
  check('the fourth success celebrates every third', done3.ok &&
    await h.evalv(`window.__rhythmCelebrations===1`), JSON.stringify(await state()));

  /* Cap: up near the top the melody must never exceed 6 pads. */
  await h.evalv(`window.__rhythm.setRound(9)`);
  const capReady = await h.waitFor(`window.__rhythm.state().phase==='repeat'&&window.__rhythm.state().length===6`,
    { timeout: 9000, label: 'the capped six-pad melody' });
  check('melody complexity is capped at 6 pads', capReady.ok, JSON.stringify(await state()));

  /* Free play mode: every pad plays, nothing is judged. */
  await h.tap('#free-btn');
  const free = await h.waitFor(`window.__rhythm.state().mode==='free'&&window.__rhythm.state().phase==='free'`,
    { timeout: 2000, label: 'free play mode to activate' });
  check('free play mode activates and asks no echo', free.ok && await h.evalv(`document.getElementById('rhythm-prompt').textContent==='Свирај слободно!'`),
    JSON.stringify(await state()));
  const soundsBefore = await h.evalv(`window.__rhythmSounds`);
  for (let i = 0; i < 4; i++) { const t = await h.tap(padSel(i)); if (!t.ok) { check('each drum plays in free play', false, t.why); break; } }
  check('each of the four drums plays its own sound in free play',
    await h.evalv(`window.__rhythmSounds >= ${soundsBefore + 4}`),
    String(await h.evalv(`window.__rhythmSounds`)));

  /* Back to echo: repeat button still replays the melody. */
  await h.tap('#echo-btn');
  const back = await h.waitFor(`window.__rhythm.state().mode==='echo'&&window.__rhythm.state().phase==='repeat'`,
    { timeout: 6000, label: 'echo mode to come back after free play' });
  check('switching back to echo plays a new melody', back.ok, JSON.stringify(await state()));
  const replay = await h.tap('#repeat-btn');
  const replayReady = replay.ok && await h.waitFor(
    `window.__rhythm.state().phase==='repeat'`,
    { timeout: 9000, label: 'the replayed melody (6 pads) to finish' }
  );
  check('repeat button replays the current melody', replayReady.ok);

  const index = fs.readFileSync(path.join(__dirname, '..', 'game', 'index.html'), 'utf8');
  check('hub button wired (data-go="game-rhythm")', index.includes('data-go="game-rhythm"'));
  checkRouteWired('rhythm', 'game-rhythm', 'pages/rhythm.html',
    { back: 'rhythm-back', start: 'startRhythm', check });

  await h.close();
  console.log(`\n${getFails() === 0 ? 'ALL' : 'SOME'} CHECKS ${getFails() === 0 ? 'PASSED' : 'FAILED'} (${getFails()} fail)`);
  process.exit(getFails() ? 1 : 0);
})().catch(error => { console.error('rhythm_smoke crashed:', error); process.exit(1); });