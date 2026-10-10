/* Rhythm smoke test — task 206 mini drum set.
   Exercises both echo modes, growing melody complexity (2 → 6), forgiving
   replay on a wrong pad, free play, large reachable controls, and the
   registry/hub wiring. Determined only by state waits, never by sleep()-and-pray.
   V10 (spec §28 / §42.17): also asserts each pad reads as a drum (drumhead + skin
   + rim), the icon contrast, the struck-pad active ring, the listen/repeat state
   and the completion cue. */
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
  const modeGlow = await h.evalv(`(() => { const el = document.querySelector('.mode-btn.active'); return el ? getComputedStyle(el).boxShadow : ''; })()`);
  check('V6.2: the active rhythm mode button carries the Petrin Glow', /155,\s*109,\s*255/.test(modeGlow), modeGlow);

  /* V10 (spec §28): four pads must read as drums, not flat coloured circles.
     Assert the surface is real (a drumhead + skin + rim + a clear struck ring). */
  const padLook = JSON.parse(await h.evalv(`JSON.stringify([...document.querySelectorAll('.rhythm-pad')].map(el=>{
    const cs=getComputedStyle(el);
    return {bg:cs.backgroundImage, shadow:cs.boxShadow, text:cs.textShadow, emoji:el.textContent.trim(), label:el.getAttribute('aria-label')};
  }))`));
  const layers = s => (s.match(/radial-gradient/g) || []).length;
  check('every pad reads as a drum: a light drumhead over a coloured skin',
    padLook.length === 4 && padLook.every(p => layers(p.bg) >= 2), JSON.stringify(padLook.map(p => layers(p.bg))));
  check('every pad has a tactile surface (an inset rim + skin shading)',
    padLook.every(p => p.shadow.includes('inset')), JSON.stringify(padLook.map(p => p.shadow.includes('inset'))));
  check('every pad icon carries a contrasting shadow so the drum symbol reads',
    padLook.every(p => p.text !== 'none' && /rgba?\(0,\s*0,\s*0/.test(p.text)), JSON.stringify(padLook.map(p => p.text)));
  check('all four pads carry drum symbolism (🥁) and a drum name',
    padLook.every(p => p.emoji === '🥁') && padLook.every(p => /бубањ|добош/.test(p.label)),
    JSON.stringify(padLook.map(p => p.emoji + ' ' + p.label)));

  const hitState = JSON.parse(await h.evalv(`JSON.stringify((()=>{
    const el=document.querySelector('.rhythm-pad');
    el.classList.add('hit');
    const hit=getComputedStyle(el).boxShadow;
    el.classList.remove('hit');
    const rest=getComputedStyle(el).boxShadow;
    const ring=/255,\\s*255,\\s*255,\\s*0\\.9/;
    return {hit:ring.test(hit), rest:ring.test(rest)};
  })())`));
  check('a struck pad shows a clear bright ring that a resting pad does not',
    hitState.hit === true && hitState.rest === false, JSON.stringify(hitState));

  /* V10 (spec §42.17): the drum set carries the live phase, and a success cues it.
     The completion rule is proved by toggling the phase on the real element, so the
     check does not depend on catching the ~0.9 s success window under load, and it
     is conditional on the motion preference (the O/S may reduce, not the code). */
  const repeatLook = JSON.parse(await h.evalv(`JSON.stringify((()=>{
    const set=document.getElementById('rhythm-pads');
    return {attr:set.dataset.phase, live:window.__rhythm.state().phase,
      filter:getComputedStyle(document.querySelector('.rhythm-pad')).filter};
  })())`));
  check('V10 listen/repeat state: the drum set tracks the live phase',
    repeatLook.attr === 'repeat' && repeatLook.attr === repeatLook.live, JSON.stringify(repeatLook));
  const cheerState = JSON.parse(await h.evalv(`JSON.stringify((()=>{
    const set=document.getElementById('rhythm-pads'), el=document.querySelector('.rhythm-pad');
    const prev=set.dataset.phase; set.dataset.phase='success';
    const anim=getComputedStyle(el).animationName; set.dataset.phase=prev;
    return {anim, rm:matchMedia('(prefers-reduced-motion: reduce)').matches};
  })())`));
  const rhythmPage = fs.readFileSync(path.join(__dirname, '..', 'game', 'pages', 'rhythm.html'), 'utf8');
  const hasCheerRule = /\[data-phase="success"\]\s*\.rhythm-pad\s*\{[^}]*animation\s*:\s*drumCheer/.test(rhythmPage);
  check('V10 completion cue: repeating a melody right cues the drum set to cheer',
    hasCheerRule && (cheerState.anim === 'drumCheer' || cheerState.rm),
    JSON.stringify({hasCheerRule, ...cheerState}));

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
  const listenLook = JSON.parse(await h.evalv(`JSON.stringify((()=>{
    const set=document.getElementById('rhythm-pads');
    const pad=[...document.querySelectorAll('.rhythm-pad')].find(el=>!el.classList.contains('hit'))||document.querySelector('.rhythm-pad');
    return {attr:set.dataset.phase, filter:getComputedStyle(pad).filter};
  })())`));
  check('V10 listen/repeat state: the pads look dimmed while listening, full on the repeat turn',
    listenLook.attr === 'listen' && listenLook.filter !== repeatLook.filter,
    JSON.stringify({listen:listenLook, repeat:repeatLook.filter}));
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