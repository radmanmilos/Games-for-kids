/* Rhythm smoke test — R25 "Ритам" imitation pilot.
   Exercises both echo patterns, forgiving replay, large reachable controls,
   and the registry/hub wiring. */
const { start, check, getFails, sleep } = require('./headless.js');
const { checkRouteWired } = require('./route_contract.js');
const fs = require('fs');
const path = require('path');

const STUB = `window.__rhythmSounds=0;window.audioBuses.playTone=function(){window.__rhythmSounds++};window.successChime=function(){};window.gentleMiss=function(){};window.__rhythmCelebrations=0;window.celebrate=function(){window.__rhythmCelebrations++};true`;

(async () => {
  const h = await start({ page: '/pages/rhythm.html', tag: 'rhythm-smoke', width: 1024, height: 800 });
  const ready = await h.waitFor(
    `!!window.__rhythm && window.__rhythm.state().phase==='repeat'`,
    { timeout: 5000, label: 'the first rhythm to finish playing' }
  );
  check('rhythm game boots and plays the tap-tap pattern', ready.ok,
    ready.ok ? JSON.stringify(await h.evalv(`JSON.stringify(window.__rhythm.state())`)) : ready.why);
  await h.evalv(STUB);

  const state = async () => JSON.parse(await h.evalv(`JSON.stringify(window.__rhythm.state())`));
  const geometry = JSON.parse(await h.evalv(`JSON.stringify(
    [document.getElementById('drum-area'),document.getElementById('repeat-btn')].map(el=>{
      const r=el.getBoundingClientRect(),hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
      return {inside:r.top>=0&&r.left>=0&&r.bottom<=innerHeight&&r.right<=innerWidth,
        hit:hit===el||el.contains(hit),w:r.width,h:r.height};
    }))`));
  check('large drum and repeat controls are reachable in the viewport',
    geometry.length===2&&geometry.every(g=>g.inside&&g.hit)&&geometry[0].w>=200&&geometry[0].h>=200,
    JSON.stringify(geometry));

  const visible = await h.evalv(`document.getElementById('rhythm-prompt').textContent==='Сад ти понови!' &&
    !document.querySelector('[data-score],#score,[data-timer],#timer')`);
  check('Cyrillic repeat prompt with no score or timer', visible===true);
  check('two taps are requested in the first pattern', (await state()).pattern==='tap-tap');

  await h.tap('#drum-area');
  await sleep(850);
  await h.tap('#drum-area');
  const mismatch = await state();
  check('a long pause is gently rejected for tap-tap without advancing',
    mismatch.phase==='retry'&&mismatch.successes===0,
    JSON.stringify(mismatch));
  const replay = await h.tap('#repeat-btn');
  const replayReady = replay.ok&&await h.waitFor(
    `window.__rhythm.state().phase==='repeat'`,
    { timeout: 4000, label: 'the replayed tap-tap pattern to finish' }
  );
  check('repeat button replays the rhythm', replayReady.ok, replayReady.ok?'replayed':replayReady.why);
  check('both the heard rhythm and child taps use the drum sound',
    await h.evalv(`window.__rhythmSounds>=4`),String(await h.evalv(`window.__rhythmSounds`)));

  await h.tap('#drum-area');
  await sleep(250);
  await h.tap('#drum-area');
  const fastEcho = await h.waitFor(
    `window.__rhythm.state().round===1&&window.__rhythm.state().phase==='repeat'`,
    { timeout: 5000, label: 'a correct tap-tap echo to advance to the pause pattern' }
  );
  check('a close pair of taps matches tap-tap and advances', fastEcho.ok,
    JSON.stringify(await state()));

  await h.tap('#drum-area');
  await sleep(250);
  await h.tap('#drum-area');
  const wrongPause = await state();
  check('tap-tap is gently rejected for tap-pause-tap', wrongPause.phase==='retry'&&wrongPause.successes===1,
    JSON.stringify(wrongPause));

  await h.tap('#repeat-btn');
  const pauseReady = await h.waitFor(
    `window.__rhythm.state().phase==='repeat'`,
    { timeout: 4000, label: 'the pause pattern replay to finish' }
  );
  check('pause pattern can be replayed after a miss', pauseReady.ok);

  await h.tap('#drum-area');
  await sleep(850);
  await h.tap('#drum-area');
  const pauseEcho = await h.waitFor(
    `window.__rhythm.state().phase==='success'&&window.__rhythm.state().successes===2`,
    { timeout: 1500, label: 'the long-pause echo to be accepted' }
  );
  check('a long pause matches tap-pause-tap', pauseEcho.ok, JSON.stringify(await state()));

  await h.evalv(`window.__rhythm.setRound(0)`);
  const finalReady = await h.waitFor(`window.__rhythm.state().phase==='repeat'`, { timeout: 4000, label: 'test pattern to finish' });
  check('the short pattern can be selected again for a new echo',finalReady.ok);
  await h.tap('#drum-area');
  await sleep(250);
  await h.tap('#drum-area');
  const celebration = await h.waitFor(`window.__rhythmCelebrations===1`,{timeout:1500,label:'third success celebration'});
  check('celebrates every third successful echo, without a score',celebration.ok);

  const index = fs.readFileSync(path.join(__dirname, '..', 'game', 'index.html'), 'utf8');
  check('hub button wired (data-go="game-rhythm")', index.includes('data-go="game-rhythm"'));
  checkRouteWired('rhythm','game-rhythm','pages/rhythm.html',
    {back:'rhythm-back',start:'startRhythm',check});

  await h.close();
  console.log(`\n${getFails()===0?'ALL':'SOME'} CHECKS ${getFails()===0?'PASSED':'FAILED'} (${getFails()} fail)`);
  process.exit(getFails()?1:0);
})().catch(error=>{console.error('rhythm_smoke crashed:',error);process.exit(1);});
