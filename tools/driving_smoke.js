/* Возила (Driving) smoke test — Phase 4 adventure engine.
   Drives the REAL page headlessly: engine boots, 10 worlds config is valid
   (names, collectibles, music keys, obstacles, coins, goal), drive-mode steering
   moves the car, clamps hold, coins collect, obstacles knock the car back, goal
   completes the level, worlds picker + win modal + music toggle work, and the
   hub wiring (button / navigation / standalone boot) is in place.
   V2.9 (spec §42.9: "top cluster must be fixed for portrait"): a second 390x844
   session pins the portrait top-chrome geometry - title in the .ps-header band,
   HUD trio below it, title + back clear of every other chrome item, all inside
   the viewport (measured after `document.fonts.ready`).
   Run:  node tools/driving_smoke.js     (from the repo root or anywhere)
   Requires Node >= 22. CHROME_PATH env optional. */
const { start, check, getFails } = require('./headless.js');
const { checkRouteWired } = require('./route_contract.js');
const fs = require('fs');
const path = require('path');

const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const h = await start({ page: '/pages/driving.html', tag: 'driving-smoke', width: 1100, height: 700 });

  let ready = false;
  for (let i = 0; i < 25 && !ready; i++) {
    ready = await h.evalv(`typeof window.__adv === 'object' && window.__adv !== null`);
    if (!ready) await sleep(200);
  }
  check('driving booted (window.__adv ready)', ready);
  await h.evalv(`window.audioBuses.connect=function(){}; true`);

  const boot = await h.evalv(`(() => {
    const t = document.createElement('div');
    t.style.background = window.__adv.theme.bgPage;
    return JSON.stringify({
      mode: window.__adv.mode,
      levels: window.__adv.levels.length,
      worldName: document.getElementById('adv-world-name').textContent,
      themeName: window.__adv.theme.name,
      collectEmoji: document.getElementById('adv-collect-emoji').textContent,
      themeCollect: window.__adv.theme.collectible,
      levelText: document.getElementById('adv-level').textContent,
      bgApplied: document.body.style.background === t.style.background,
      hero: document.querySelectorAll('#adv-canvas').length,
      controls: [...document.querySelectorAll('#adv-controls [data-adv]')].map(btn => btn.dataset.adv).join(','),
      heroW: window.__adv.player.width
    });
  })()`);
  const bj = JSON.parse(boot);
  check('engine: drive mode, 10 levels, HUD matches theme', bj.mode === 'drive' && bj.levels === 10 && bj.worldName === bj.themeName && bj.collectEmoji === bj.themeCollect && bj.levelText === '1' && bj.controls === 'down,up' && bj.heroW >= 70, boot);
  check('page chrome: title, back button, canvas, body bg applied', bj.bgApplied === true && bj.hero === 1, boot);

  const cfg = await h.evalv(`JSON.stringify(window.__adv.levels.map((l, i) => ({
    i,
    name: !!l.name,
    collect: !!l.collectible,
    music: l.music,
    musicDefined: !!window.__adv.music[l.music],
    obs: (l.obstacles || []).length,
    coins: (l.coins || []).length,
    goalX: l.goalX || 0
  })))`);
  const cfgs = JSON.parse(cfg);
  const bad = cfgs.filter(c => !c.name || !c.collect || !c.musicDefined || c.obs < 1 || c.coins < 1 || c.goalX < 1000);
  check('all 10 worlds: name, collectible, music theme, obstacles, coins, goal', bad.length === 0, cfg);

  const seqs = await h.evalv(`JSON.stringify(Object.keys(window.__adv.music).map(k => {
    const m = window.__adv.music[k];
    return { k, seq: (m.seq || []).length, bass: (m.bass || []).length, root: !!m.root };
  }))`);
  const seqj = JSON.parse(seqs);
  const badSeq = seqj.filter(m => m.seq !== 32 || m.bass !== 16 || !m.root);
  check('music themes: 10 themes, each 32-step melody + 16-beat bass + root', seqj.length === 10 && badSeq.length === 0, seqs);

  // Steering is driven by updateDrive(), which moves a FIXED step per update()
  // tick (adventure.js). The old test held the keys, slept a fixed 150 ms and
  // hoped the rAF loop had ticked; under CI load it sometimes had not (0
  // movement -> red on an already-green host), because a fixed sleep buys
  // simulated time only if the browser actually schedules frames. Advance the
  // loop deterministically instead — pause rAF, run a known number of update()
  // ticks, then assert (the same approach racing3d_smoke uses for physics).
  const steering = await h.evalv(`(() => {
    const a = window.__adv;
    a.setPaused(true);
    a.keys.up = true; a.keys.right = true;
    const before = { y: a.player.y, ox: a.player.offsetX };
    for (let i = 0; i < 5; i++) a.update();
    const after = { y: a.player.y, ox: a.player.offsetX };
    a.keys.up = false; a.keys.right = false;
    a.setPaused(false);
    return JSON.stringify({ before, after });
  })()`);
  const sj = JSON.parse(steering);
  check('steering: up decreases y, right increases offsetX', sj.after.y < sj.before.y && sj.after.ox > sj.before.ox, steering);

  const clamp = await h.evalv(`(() => {
    const a = window.__adv;
    const cv = document.getElementById('adv-canvas');
    a.player.y = 0;
    a.player.offsetX = -50;
    a.update();
    const y = a.player.y, ox = a.player.offsetX;
    return JSON.stringify({ y, ox, minY: cv.clientHeight * 0.20 - 20, minOx: 30 });
  })()`);
  const cj = JSON.parse(clamp);
  check('clamps: y stays in band, offsetX >= 30', cj.y >= cj.minY && cj.ox >= cj.minOx, clamp);

  const coin = await h.evalv(`(() => {
    const a = window.__adv;
    a.loadWorld();
    const before = a.coinCount;
    const c = a.coins.find(coin => !coin.collected);
    a.coins.slice(1).forEach(other => { other.collected = true; });
    a.player.offsetX = c.x - a.cameraX;
    a.player.y = c.y;
    a.update();
    return JSON.stringify({ before: before, count: a.coinCount, collected: c.collected, hud: document.getElementById('adv-coin-count').textContent });
  })()`);
  const coj = JSON.parse(coin);
  check('coin pickup: count +1, HUD updated', coj.count === coj.before + 1 && coj.collected === true && coj.hud === String(coj.before + 1), coin);

  await sleep(1100);
  const hit = await h.evalv(`(() => {
    const a = window.__adv;
    a.loadWorld();
    const o = a.obstacles[0];
    const beforeBumps = a.bumpCount;
    o.x = a.player.x + 20;
    o.y = a.player.y;
    a.update();
    return JSON.stringify({ bumped: a.bumpCount > beforeBumps, after: a.cameraX, completed: a.levelCompleted });
  })()`);
  const hj = JSON.parse(hit);
  check('obstacle hit: car knocked back, level not completed', hj.bumped === true && hj.completed === false, hit);

  const go = await h.evalv(`(() => {
    const a = window.__adv;
    a.setPaused(true);
    a.obstacles.length = 0;
    const px = a.player.x;
    a.goal.x = a.player.x - 60;
    a.goal.width = 400;
    a.goal.y = a.player.y;
    a.goal.height = 100;
    a.update();
    const stoppedX = a.player.x;
    a.update();
    return JSON.stringify({
      px, gx: a.goal.x, gw: a.goal.width, pxAfter: a.player.x,
      stoppedX,
      done: a.levelCompleted,
      shown: document.getElementById('adv-win-modal').classList.contains('show'),
      title: document.getElementById('adv-win-title').textContent,
      btn: document.getElementById('adv-modal-btn').textContent
    });
  })()`);
  const goj = JSON.parse(go);
  check('goal reached: car stops, win modal shown', goj.done === true && goj.pxAfter === goj.stoppedX && goj.shown === true && goj.title.indexOf('ПРЕЂЕН') !== -1 && goj.btn.indexOf('СЛЕДЕЋИ') !== -1, go);
  await h.evalv(`document.getElementById('adv-modal-btn').click(); true`);
  await sleep(80);
  const nxt = await h.evalv(`JSON.stringify({
    level: document.getElementById('adv-level').textContent,
    hidden: !document.getElementById('adv-win-modal').classList.contains('show'),
    completed: window.__adv.levelCompleted
  })`);
  const nj = JSON.parse(nxt);
  check('next level: advances to world 2, modal closes', nj.level === '2' && nj.hidden === true && nj.completed === false, nxt);

  await h.evalv(`document.getElementById('adv-worlds-btn').click(); true`);
  await sleep(80);
  const wm = await h.evalv(`JSON.stringify({
    shown: document.getElementById('adv-worlds-modal').classList.contains('show'),
    btns: document.querySelectorAll('#adv-worlds-grid .adv-world-btn').length
  })`);
  const wmj = JSON.parse(wm);
  check('worlds picker: opens, shows 10 worlds', wmj.shown === true && wmj.btns === 10, wm);

  await h.evalv(`document.querySelectorAll('#adv-worlds-grid .adv-world-btn')[5].click(); true`);
  await sleep(80);
  const wj = await h.evalv(`JSON.stringify({
    level: document.getElementById('adv-level').textContent,
    modalHidden: !document.getElementById('adv-worlds-modal').classList.contains('show'),
    name: document.getElementById('adv-world-name').textContent,
    themeName: window.__adv.theme.name
  })`);
  const wjj = JSON.parse(wj);
  check('worlds picker: jump to world 6, modal closes, HUD updated', wjj.level === '6' && wjj.modalHidden === true && wjj.name === wjj.themeName, wj);

  const mus0 = await h.evalv(`document.getElementById('adv-music-btn').textContent`);
  await h.evalv(`document.getElementById('adv-music-btn').click(); true`);
  const mus1 = await h.evalv(`document.getElementById('adv-music-btn').textContent`);
  await h.evalv(`document.getElementById('adv-music-btn').click(); true`);
  const mus2 = await h.evalv(`document.getElementById('adv-music-btn').textContent`);
  check('music toggle: 🔊 -> 🔇 -> 🔊', mus0 === '🔊' && mus1 === '🔇' && mus2 === '🔊', mus0 + '/' + mus1 + '/' + mus2);

  await h.close();

  // V2.9 (spec §42.9) — portrait top-chrome geometry. Runs in a 390x844 session
  // because the collisions only exist in portrait; measured after
  // `document.fonts.ready` so font-swap transients cannot flake it. V2.9 owns
  // the title collision + the back button's corner; the font-width-coupled
  // score↔worlds HUD coupling (shared by all 4 adventure worlds, spec line
  // 1366 → Phase V4) is reported as evidence only.
  const hp = await start({ page: '/pages/driving.html', tag: 'driving-smoke-portrait', width: 390, height: 844 });
  let pReady = false;
  for (let i = 0; i < 25 && !pReady; i++) {
    pReady = await hp.evalv(`typeof window.__adv === 'object' && window.__adv !== null`);
    if (!pReady) await sleep(200);
  }
  await hp.evalv(`window.audioBuses.connect=function(){}; true`);
  await hp.evalv(`document.fonts.ready.then(() => true)`);
  const geo = await hp.evalv(`(() => {
    const sels = ['#driving-back', '#adv-title', '#adv-score', '#adv-worlds-btn', '#adv-music-btn'];
    const box = s => { const el = document.querySelector(s); if (!el) return null; const r = el.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom }; };
    const boxes = Object.fromEntries(sels.map(s => [s, box(s)]));
    const overlaps = [];
    for (let i = 0; i < sels.length; i++) for (let j = i + 1; j < sels.length; j++) {
      const a = boxes[sels[i]], b = boxes[sels[j]];
      if (!a || !b) continue;
      const w = Math.min(a.r, b.r) - Math.max(a.l, b.l);
      const hh = Math.min(a.b, b.b) - Math.max(a.t, b.t);
      if (w > 0.5 && hh > 0.5) overlaps.push(sels[i] + '∩' + sels[j] + '=' + (w * hh).toFixed(0) + 'px²');
    }
    const clean = s => overlaps.filter(o => o.startsWith(s));
    const title = boxes['#adv-title'];
    return JSON.stringify({
      booted: ${pReady},
      vw: innerWidth, vh: innerHeight,
      inHeader: document.getElementById('adv-title').closest('.ps-header') !== null,
      titleCx: (title.l + title.r) / 2,
      titleOrBackOverlaps: [...clean('#driving-back'), ...clean('#adv-title')],
      allOverlaps: overlaps,
      bandBottom: title.b,
      hudTops: ['#adv-score', '#adv-worlds-btn', '#adv-music-btn'].map(s => boxes[s].t),
      inside: sels.every(s => boxes[s].l >= -0.5 && boxes[s].t >= -0.5 && boxes[s].r <= innerWidth + 0.5 && boxes[s].b <= innerHeight + 0.5)
    });
  })()`);
  const gj = JSON.parse(geo);
  check('V2.9 shell: title lives in the .ps-header row, centred on the viewport',
    gj.inHeader === true && Math.abs(gj.titleCx - gj.vw / 2) < 0.5, geo);
  check('V2.9 portrait: title + back clear of every other chrome item (§42.9)',
    gj.titleOrBackOverlaps.length === 0, geo);
  check('V2.9 portrait: HUD trio steps below the .ps-header band',
    gj.hudTops.every(t => t >= gj.bandBottom - 0.5), geo);
  check('V2.9 portrait: all five chrome items inside the viewport (390x844)', gj.inside === true, geo);
  await hp.close();

  const root = path.join(__dirname, '..');
  const indexHtml = fs.readFileSync(path.join(root, 'game', 'index.html'), 'utf8');
  check('hub button wired (data-go="game-driving")', indexHtml.includes('data-go="game-driving"'));
  // R7: the route/back wiring lives in app-registry.js now, not in navigation.js.
  checkRouteWired('driving', 'game-driving', 'pages/driving.html',
    { back: 'driving-back', start: 'startDriving', check });

  process.exit(getFails() ? 1 : 0);
})();
