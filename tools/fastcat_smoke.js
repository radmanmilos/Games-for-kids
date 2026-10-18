/* Брзи мачак smoke test — task 254.
   Drives pages/fastcat.html headlessly: character picker, auto-run forward
   motion, jump/slide, coin→meter fill, super-speed gate + drain + 2x speed,
   hazard behaviours (puddle slows, rock jumpable, bar slideable, boost pad),
   win + restart, portrait play (no rotate gate — controls tappable there), control geometry
   (on-screen + topmost at the centre point), and the route contract.
   Run:  node tools/fastcat_smoke.js     Requires Node >= 22. CHROME_PATH optional. */
const { start, check, getFails } = require('./headless.js');
const { checkRouteWired } = require('./route_contract.js');
const fs = require('fs');
const path = require('path');

const sleep = ms => new Promise(r => setTimeout(r, ms));

const STUB = `window.speech={speak:function(){},cancel:function(){}};window.audioBuses.play=function(){};window.audioBuses.speakWithDuck=function(t,cb){if(cb)cb();};window.celebrate=function(){}; true`;

(async () => {
  const h = await start({ page: '/pages/fastcat.html', tag: 'fastcat-smoke', width: 844, height: 390 });

  // Boot: main.js calls startFastCat(); the character picker must be up.
  let ready = false;
  for (let i = 0; i < 20 && !ready; i++) {
    ready = await h.evalv(`typeof window.startFastCat === 'function' && !!document.getElementById('char-modal')`);
    if (!ready) await sleep(200);
  }
  check('fastcat game booted (startFastCat ready, char modal present)', ready);
  await h.evalv(STUB);

  const picker = JSON.parse(await h.evalv(`JSON.stringify({
    shown: document.getElementById('char-modal').classList.contains('show'),
    buttons: document.querySelectorAll('#char-modal .char-btn').length
  })`));
  check('character picker shown on load with 2 choices (kitty + explorer)', picker.shown && picker.buttons === 2, JSON.stringify(picker));

  // Pick kitty — the loop starts.
  await h.evalv(`document.querySelector('#char-modal .char-btn[data-character="kitty"]').click()`);
  await sleep(100);

  const boot = await h.evalv(`JSON.stringify(Object.assign(window.__fc.state(), {
    modalHidden: !document.getElementById('char-modal').classList.contains('show')
  }))`);
  const B = JSON.parse(boot);
  check('picking a character hides the modal and starts the run', B.modalHidden && B.x > 0, boot);
  check('level 1 generated: long course with every hazard family',
    B.levelLen === 19500 && B.coinsTotal > 30 && B.rocks > 0 && B.banners > 0 && B.puddles > 0 && B.boosts > 0 && B.plateaus > 0,
    boot);

  // Auto-run: x advances, stays grounded on the flat intro.
  const before = B.x;
  const run = JSON.parse(await h.evalv(`JSON.stringify(window.__fc.step(30))`));
  check('auto-run: moves forward ~BASE_SPEED per frame and stays grounded on flat intro',
    run.x - before > 150 && run.x - before < 240 && run.grounded, JSON.stringify({ before, after: run.x }));

  // Jump: leaves the ground, rises, lands again.
  await h.evalv(`window.__fc.press('jump', true); true`);
  const jt = JSON.parse(await h.evalv(`JSON.stringify(window.__fc.step(3))`));
  await h.evalv(`window.__fc.press('jump', false); true`);
  check('jump: leaves the ground and rises', !jt.grounded && jt.y < run.y, JSON.stringify({ runY: run.y, jt }));
  const landed = JSON.parse(await h.evalv(`JSON.stringify(window.__fc.step(90))`));
  check('jump: lands back on the ground', landed.grounded && landed.y <= jt.y, JSON.stringify(landed));

  // Slide: hitbox ducks for SLIDE_FRAMES then recovers.
  await h.evalv(`window.__fc.press('slide', true); true`);
  const sl = JSON.parse(await h.evalv(`JSON.stringify(window.__fc.step(2))`));
  await h.evalv(`window.__fc.press('slide', false); true`);
  check('slide: ducks while the button is held', sl.slide > 0 && sl.grounded, JSON.stringify(sl));
  const slEnd = JSON.parse(await h.evalv(`JSON.stringify(window.__fc.step(60))`));
  check('slide: recovers after the slide window', slEnd.slide === 0, JSON.stringify(slEnd));

  // Coins → meter + score. Earlier movement may already have collected coins,
  // so capture a pre-state and assert DELTAS. A coin is grounded-reachable
  // while off <= 55 (player box 48 tall, coin box 26 → overlap iff off < 61).
  const spots = JSON.parse(await h.evalv(`JSON.stringify(window.__fc.spots())`));
  const coinSpot = spots.coins.find(c => c.off <= 55);
  check('level has a grounded-reachable coin', !!coinSpot, JSON.stringify(spots.coins.slice(0, 8)));
  const preCoin = JSON.parse(await h.evalv(`JSON.stringify(window.__fc.state())`));
  if (coinSpot) await h.evalv(`window.__fc.teleport(${coinSpot.x - 55}); true`);
  const coin = JSON.parse(await h.evalv(`JSON.stringify(window.__fc.step(14))`));
  check('coins fill the meter and score points',
    coin.score > preCoin.score && coin.coinsLeft < preCoin.coinsLeft && coin.meter > 0,
    JSON.stringify({ pre: preCoin, post: coin }));

  // Super-speed gate: needs a full meter.
  const gate = JSON.parse(await h.evalv(`window.__fc.setMeter(50); JSON.stringify({ ok: window.__fc.super(), st: window.__fc.state() })`));
  check('super speed refuses below a full meter', gate.ok === false && gate.st.superT === 0, JSON.stringify(gate));

  // Base pace for the 2x comparison, measured in the guaranteed-empty zone
  // before the first chunk (the level's first chunk starts at x=800).
  await h.evalv(`window.__fc.teleport(300); true`);
  const baseA = JSON.parse(await h.evalv(`JSON.stringify(window.__fc.state())`));
  const baseB = JSON.parse(await h.evalv(`JSON.stringify(window.__fc.step(20))`));
  const basePace = baseB.x - baseA.x;

  // Full meter → super engages: drains the meter and runs at ~2x.
  const sup = JSON.parse(await h.evalv(`window.__fc.setMeter(100); JSON.stringify({ ok: window.__fc.super(), st: window.__fc.state() })`));
  check('super speed engages on a full meter', sup.ok === true && sup.st.superT > 0 && sup.st.meter === 100, JSON.stringify(sup));
  const supB = JSON.parse(await h.evalv(`JSON.stringify(window.__fc.step(20))`));
  check('super speed: meter drains while active', supB.meter < 100 && supB.superT > 0, JSON.stringify(supB));
  const supPace = supB.x - baseB.x;
  check('super speed: ~2x forward pace', supPace > basePace * 1.7 && supPace < basePace * 2.4, JSON.stringify({ basePace, supPace }));

  // Let super lapse, then hazards:
  await h.evalv(`JSON.stringify(window.__fc.step(260))`);
  const after = JSON.parse(await h.evalv(`JSON.stringify(window.__fc.state())`));
  // The lapse run legally collects coins, so the meter is low but not 0.
  check('super speed lapses back to normal (timer off, meter no longer full)',
    after.superT === 0 && after.meter < 100, JSON.stringify(after));

  // Settle in the empty zone first so a leftover slowT from the super-lapse
  // run cannot make the puddle assertion vacuous (72-frame slow expires).
  const pudPre = JSON.parse(await h.evalv(`window.__fc.teleport(300); JSON.stringify(window.__fc.step(80))`));
  const pud = spots.puddles[0];
  await h.evalv(`window.__fc.teleport(${pud - 40}); true`);
  const pudHit = JSON.parse(await h.evalv(`JSON.stringify(window.__fc.step(10))`));
  check('puddle: slows a grounded run', pudPre.slowT === 0 && pudHit.slowT > 0, JSON.stringify({ pre: pudPre, post: pudHit }));
  await h.evalv(`JSON.stringify(window.__fc.step(90))`);

  // Rocks: a super-speed run-through CONSUMES obstacles (hit latches per
  // run), so re-pick FRESH targets for each test.
  const rockHitSpot = spots.rocks.find(r => !r.hit);
  check('level has a fresh rock for the standing-hit test', !!rockHitSpot, JSON.stringify(spots.rocks));
  await h.evalv(`window.__fc.teleport(${rockHitSpot ? rockHitSpot.x - 40 : 0}); true`);
  const rockHit = JSON.parse(await h.evalv(`JSON.stringify(window.__fc.step(10))`));
  check('rock: a grounded hit slows you (never kills)', rockHit.slowT > 0 && !rockHit.won, JSON.stringify(rockHit));
  await h.evalv(`JSON.stringify(window.__fc.step(90))`);
  // A DIFFERENT fresh rock, cleared by a well-timed jump; the hit flag
  // staying false is the anti-vacuous proof.
  const rockSpots2 = JSON.parse(await h.evalv(`JSON.stringify(window.__fc.spots())`));
  const rockClearSpot = rockSpots2.rocks.find(r => !r.hit && r.x !== rockHitSpot.x);
  check('level has a second fresh rock for the jump-clear test', !!rockClearSpot, JSON.stringify(rockSpots2.rocks));
  // Start 160px back, not 260: the arc lasts ~49 frames (~314px at 6.4px/f),
  // so from -260 the descent dips into the rock's box (observed: slowT 47 at
  // x = rock+28), while from -160 the whole horizontal pass happens at
  // ~-147px height (clear threshold -92) and the landing is past the box.
  await h.evalv(`window.__fc.teleport(${rockClearSpot ? rockClearSpot.x - 160 : 0}); window.__fc.press('jump', true); true`);
  await h.evalv(`JSON.stringify(window.__fc.step(70))`);
  await h.evalv(`window.__fc.press('jump', false); true`);
  const rockClear = JSON.parse(await h.evalv(`JSON.stringify(window.__fc.state())`));
  const rockClearSpots = JSON.parse(await h.evalv(`JSON.stringify(window.__fc.spots())`));
  const rockUntouched = rockClearSpots.rocks.some(r => r.x === rockClearSpot.x && !r.hit);
  check('rock: a jumped approach clears it untouched', rockClear.slowT === 0 && rockUntouched,
    JSON.stringify({ state: rockClear, rockX: rockClearSpot && rockClearSpot.x }));

  // Same consumption caveat as rocks: fresh banner per test.
  const banHitSpot = spots.banners.find(b => !b.hit);
  check('level has a fresh slide bar for the standing-hit test', !!banHitSpot, JSON.stringify(spots.banners));
  await h.evalv(`window.__fc.teleport(${banHitSpot ? banHitSpot.x - 30 : 0}); true`);
  const banHit = JSON.parse(await h.evalv(`JSON.stringify(window.__fc.step(8))`));
  check('slide bar: running into it standing slows you', banHit.slowT > 0, JSON.stringify(banHit));
  await h.evalv(`JSON.stringify(window.__fc.step(90))`);
  const banSpots2 = JSON.parse(await h.evalv(`JSON.stringify(window.__fc.spots())`));
  const banClearSpot = banSpots2.banners.find(b => !b.hit && b.x !== banHitSpot.x);
  check('level has a second fresh slide bar for the slide-clear test', !!banClearSpot, JSON.stringify(banSpots2.banners));
  // The slide hitbox (28 tall, re-anchored to the ground) passes under the
  // bar zone (off 34..96), so no overlap; the untouched hit flag is the
  // anti-vacuous proof.
  await h.evalv(`window.__fc.teleport(${banClearSpot ? banClearSpot.x - 30 : 0}); window.__fc.press('slide', true); true`);
  await h.evalv(`JSON.stringify(window.__fc.step(10))`);
  await h.evalv(`window.__fc.press('slide', false); true`);
  const banClear = JSON.parse(await h.evalv(`JSON.stringify(window.__fc.state())`));
  const banClearSpots = JSON.parse(await h.evalv(`JSON.stringify(window.__fc.spots())`));
  const banUntouched = banClearSpots.banners.some(b => b.x === banClearSpot.x && !b.hit);
  check('slide bar: sliding under it clears it untouched', banClear.slowT === 0 && banUntouched,
    JSON.stringify({ state: banClear, banX: banClearSpot && banClearSpot.x }));

  const bst = spots.boosts[0];
  await h.evalv(`window.__fc.teleport(${bst - 30}); true`);
  const bstHit = JSON.parse(await h.evalv(`JSON.stringify(window.__fc.step(8))`));
  check('boost pad: gives a temporary boost', bstHit.boostT > 0, JSON.stringify(bstHit));
  await h.evalv(`JSON.stringify(window.__fc.step(90))`);

  // Win + replay.
  const goal = JSON.parse(await h.evalv(`window.__fc.teleport(${spots.goal - 30}); JSON.stringify(window.__fc.step(10))`));
  check('goal: finishing wins and shows the win modal',
    goal.won && goal.score >= 100, JSON.stringify(goal));
  const modalShown = await h.evalv(`document.getElementById('win-modal').classList.contains('show')`);
  check('goal: win modal is visible', modalShown === true);
  const replay = JSON.parse(await h.evalv(`window.__fc.restart(); JSON.stringify(window.__fc.state())`));
  check('replay: restart resets score, meter and win state', replay.won === false && replay.score === 0 && replay.meter === 0, JSON.stringify(replay));

  // Control geometry (AGENTS: a .click() smoke is not enough — the controls
  // must be on-screen AND topmost where a child actually taps). Only the
  // tappable controls get the topmost check: #hud is pointer-events:none, so
  // meter-wrap (display-only) correctly resolves to the canvas underneath.
  const TAPPABLE = ['btn-jump', 'btn-slide', 'super-btn', 'back-btn'];
  const geo = JSON.parse(await h.evalv(`JSON.stringify((() => {
    const out = {};
    for (const id of ['btn-jump', 'btn-slide', 'super-btn', 'meter-wrap', 'back-btn']) {
      const el = document.getElementById(id);
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      out[id] = {
        inViewport: r.left >= 0 && r.top >= 0 && r.bottom <= innerHeight + 1 && r.right <= innerWidth + 1 && r.width > 0,
        topmost: !!(document.elementFromPoint(cx, cy) && document.elementFromPoint(cx, cy).closest('#' + id)),
        top: r.top, bottom: r.bottom, right: r.right
      };
    }
    return out;
  })())`));
  for (const id of ['btn-jump', 'btn-slide', 'super-btn', 'meter-wrap', 'back-btn']) {
    if (TAPPABLE.includes(id)) {
      check(`geometry: ${id} fully in viewport and topmost at its centre (844x390 landscape)`,
        geo[id].inViewport && geo[id].topmost, JSON.stringify(geo[id]));
    } else {
      check(`geometry: ${id} fully in viewport (display-only, under the HUD's pointer-events:none)`,
        geo[id].inViewport, JSON.stringify(geo[id]));
    }
  }
  // play-test 3: the ⚡ tap must sit clearly ABOVE the jump button — pin a
  // real clear gap (its glow ring + pulse used to visually touch the jump
  // button), right edges stay aligned for one-thumb reach.
  check('geometry: super-btn sits directly above the jump button (right edges aligned, >=8px clear)',
    geo['btn-jump'].top - geo['super-btn'].bottom >= 8 &&
    Math.abs(geo['super-btn'].right - geo['btn-jump'].right) <= 4,
    JSON.stringify({ super: geo['super-btn'], jump: geo['btn-jump'] }));

  // Portrait (play-test 2): portrait play is allowed — no rotate gate. Prove
  // it is genuinely playable: the overlay element is gone AND the three game
  // controls are in the viewport and topmost where a child taps (an overlay
  // re-added at any z-index fails the elementFromPoint half).
  await h.c.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  // readiness wait: poll on the viewport size (not on the assertion itself)
  for (let i = 0; i < 20 && !(await h.evalv(`innerWidth === 390 && innerHeight === 844`)); i++) await sleep(100);
  const rot = await h.evalv(`!!document.getElementById('fc-rotate')`);
  check('portrait 390x844: rotate-device overlay is gone (portrait play allowed)', rot === false, JSON.stringify({ fcRotatePresent: rot }));
  const pGeo = JSON.parse(await h.evalv(`JSON.stringify((() => {
    const out = {};
    for (const id of ['btn-jump', 'btn-slide', 'super-btn']) {
      const el = document.getElementById(id);
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const hit = document.elementFromPoint(cx, cy);
      out[id] = r.left >= 0 && r.top >= 0 && r.bottom <= innerHeight + 1 && r.right <= innerWidth + 1 &&
        !!(hit && hit.closest('#' + id));
    }
    return out;
  })())`));
  check('portrait 390x844: jump, slide and super buttons are in the viewport and tappable',
    pGeo['btn-jump'] === true && pGeo['btn-slide'] === true && pGeo['super-btn'] === true, JSON.stringify(pGeo));
  // back to landscape for the static route-contract checks below
  await h.c.send('Emulation.setDeviceMetricsOverride', { width: 844, height: 390, deviceScaleFactor: 1, mobile: true });
  for (let i = 0; i < 20 && !(await h.evalv(`innerWidth === 844 && innerHeight === 390`)); i++) await sleep(100);

  // Static: hub + route contract + Serbian title.
  const root = path.join(__dirname, '..');
  const indexHtml = fs.readFileSync(path.join(root, 'game', 'index.html'), 'utf8');
  check('hub button wired (data-go="game-fastcat")', indexHtml.includes('data-go="game-fastcat"'));
  checkRouteWired('fastcat', 'game-fastcat', 'pages/fastcat.html',
    { back: 'back-btn', start: 'startFastCat', check });
  const pageTitle = await h.evalv(`document.title`);
  check('page title is Serbian Cyrillic (Брзи мачак)', /Брзи мачак/.test(pageTitle), pageTitle);

  await h.close();
  process.exit(getFails() ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
