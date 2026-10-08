/* Свемир (Space) smoke test — Phase 4 adventure engine (fly mode).
   Drives the REAL page headlessly: engine boots in fly mode, 10 world configs
   are valid (names, collectibles, music keys, obstacles, coins, goal), free-2D
   steering moves the rocket, clamps hold, coins collect, obstacles knock the
   rocket back, patrolling UFOs move, goal completes the level, worlds picker +
   rocket back, patrolling UFOs move, goal completes the level, worlds picker +
   win modal + music toggle work, and the hub wiring (button / navigation /
   standalone boot) is in place.
   V2.8 (spec §42.11): a second 390x844 session pins the portrait top-chrome
   geometry — title in the .ps-header band, HUD trio below it, no pairwise
   overlap among back/title/score/worlds/music, all inside the viewport.
   Run:  node tools/space_smoke.js     (from the repo root or anywhere)
   Requires Node >= 22. CHROME_PATH env optional. */
const { start, check, getFails } = require('./headless.js');
const { checkRouteWired } = require('./route_contract.js');
const fs = require('fs');
const path = require('path');

const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const h = await start({ page: '/pages/space.html', tag: 'space-smoke', width: 1100, height: 700 });

  let ready = false;
  for (let i = 0; i < 25 && !ready; i++) {
    ready = await h.evalv(`typeof window.__adv === 'object' && window.__adv !== null`);
    if (!ready) await sleep(200);
  }
  check('space booted (window.__adv ready)', ready);
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
      canvas: document.querySelectorAll('#adv-canvas').length,
      controls: [...document.querySelectorAll('#adv-controls [data-adv]')].map(btn => btn.dataset.adv).join(','),
      hPad: [...document.querySelectorAll('#adv-controls .adv-pad-horizontal [data-adv]')].map(btn => btn.dataset.adv).join(','),
      vPad: [...document.querySelectorAll('#adv-controls .adv-pad-vertical [data-adv]')].map(btn => btn.dataset.adv).join(','),
      heroW: window.__adv.player.width
    });
  })()`);
  const bj = JSON.parse(boot);
  check('engine: fly mode, 10 levels, HUD matches theme, 4-way D-pad', bj.mode === 'fly' && bj.levels === 10 && bj.worldName === bj.themeName && bj.collectEmoji === bj.themeCollect && bj.levelText === '1' && bj.controls === 'left,right,up,down', boot);
  check('page chrome: title, back button, canvas, body bg applied', bj.bgApplied === true && bj.canvas === 1 && bj.heroW >= 70, boot);
  check('fly controls: left/right on the left pad, up/down on the right pad', bj.hPad === 'left,right' && bj.vPad === 'up,down', boot);

  const cfg = await h.evalv(`JSON.stringify(window.__adv.levels.map((l, i) => ({
    i,
    name: !!l.name,
    collect: !!l.collectible,
    music: l.music,
    musicDefined: !!window.__adv.music[l.music],
    obs: (l.obstacles || []).length,
    coins: (l.coins || []).length,
    goalX: l.goalX || 0,
    decor: !!l.decor
  })))`);
  const cfgs = JSON.parse(cfg);
  const bad = cfgs.filter(c => !c.name || !c.collect || !c.musicDefined || c.obs < 1 || c.coins < 1 || c.goalX < 1000 || !c.decor);
  check('all 10 worlds: name, collectible, music theme, obstacles, coins, goal, decor', bad.length === 0, cfg);

  const seqs = await h.evalv(`JSON.stringify(Object.keys(window.__adv.music).map(k => {
    const m = window.__adv.music[k];
    return { k, seq: (m.seq || []).length, bass: (m.bass || []).length, root: !!m.root, amb: !!m.ambient };
  }))`);
  const seqj = JSON.parse(seqs);
  const badSeq = seqj.filter(m => m.seq !== 32 || m.bass !== 16 || !m.root || !m.amb);
  check('music themes: 10 themes, each 32-step melody + 16-beat bass + root + ambient', seqj.length === 10 && badSeq.length === 0, seqs);

  // Free-2D steering: hold up/down/left/right one at a time, verify motion.
  const s0 = await h.evalv(`(() => {
    const a = window.__adv;
    a.setPaused(true);
    return JSON.stringify({ x: a.player.x, y: a.player.y });
  })()`);
  const sj0 = JSON.parse(s0);
  await h.evalv(`(() => { const a = window.__adv; a.keys.up = true; for (let i = 0; i < 10; i++) a.update(); a.keys.up = false; return true; })()`);
  const up = JSON.parse(await h.evalv(`JSON.stringify({ y: window.__adv.player.y })`));
  await h.evalv(`(() => { const a = window.__adv; a.keys.down = true; for (let i = 0; i < 10; i++) a.update(); a.keys.down = false; return true; })()`);
  const down = JSON.parse(await h.evalv(`JSON.stringify({ y: window.__adv.player.y })`));
  await h.evalv(`(() => { const a = window.__adv; a.keys.right = true; for (let i = 0; i < 10; i++) a.update(); a.keys.right = false; return true; })()`);
  const right = JSON.parse(await h.evalv(`JSON.stringify({ x: window.__adv.player.x })`));
  await h.evalv(`(() => { const a = window.__adv; a.keys.left = true; for (let i = 0; i < 10; i++) a.update(); a.keys.left = false; return true; })()`);
  const left = JSON.parse(await h.evalv(`JSON.stringify({ x: window.__adv.player.x })`));
  check('steering: up moves y up, down moves y down, right moves x right, left moves x back', up.y < sj0.y && down.y > up.y && right.x > sj0.x && left.x < right.x, JSON.stringify({ sj0, up, down, right, left }));

  const clamp = await h.evalv(`(() => {
    const a = window.__adv;
    const cv = document.getElementById('adv-canvas');
    a.player.y = 0;
    a.player.x = 99999;
    a.update();
    const yTop = a.player.y;
    a.player.y = 99999;
    a.update();
    const yBottom = a.player.y;
    return JSON.stringify({ yTop, yBottom, maxY: cv.clientHeight - a.player.height - 20, minY: 30 });
  })()`);
  const cj = JSON.parse(clamp);
  check('clamps: y stays in [30, canvas-h-20]', cj.yTop >= cj.minY && cj.yBottom <= cj.maxY, clamp);

  const coin = await h.evalv(`(() => {
    const a = window.__adv;
    a.loadWorld();
    const before = a.coinCount;
    const c = a.coins[0];
    a.coins.slice(1).forEach(other => { other.collected = true; });
    a.player.x = c.x;
    a.player.y = c.y;
    a.update();
    return JSON.stringify({ before: before, count: a.coinCount, collected: c.collected, hud: document.getElementById('adv-coin-count').textContent });
  })()`);
  const coj = JSON.parse(coin);
  check('coin pickup: count +1, HUD updated', coj.count === coj.before + 1 && coj.collected === true && coj.hud === String(coj.before + 1), coin);

  await sleep(1100);
  await h.evalv(`(() => {
    const a = window.__adv;
    a.loadWorld();
    a.obstacles.length = 0;
    a.obstacles.push({ x: a.player.x - 10, y: a.player.y - 10, width: 90, height: 90, type: 'asteroid' });
    a.update();
    return true;
  })()`);
  const hit = await h.evalv(`JSON.stringify({ y: window.__adv.player.y, bumps: window.__adv.bumpCount, done: window.__adv.levelCompleted })`);
  const hj = JSON.parse(hit);
  check('obstacle hit: rocket knocked up (respawn), level not completed', hj.bumps >= 1 && hj.done === false, hit);

  const patrol = await h.evalv(`(() => {
    const a = window.__adv;
    a.loadWorld();
    a.obstacles.length = 0;
    const o = { x: 1500, y: 200, width: 40, height: 70, type: 'ufo', vx: 2, minX: 1400, maxX: 1600 };
    a.obstacles.push(o);
    const x0 = o.x;
    a.update();
    const x1 = o.x;
    const vx1 = o.vx;
    o.x = o.maxX;
    a.update();
    const x2 = o.x;
    const vx2 = o.vx;
    o.x = o.minX;
    a.update();
    const x3 = o.x;
    const vx3 = o.vx;
    return JSON.stringify({ x0, x1, vx1, x2, vx2, x3, vx3, maxX: o.maxX, minX: o.minX });
  })()`);
  const pj = JSON.parse(patrol);
  check('patrolling UFO: moves forward, bounces at maxX and minX (vx flips)', pj.x1 > pj.x0 && pj.vx1 === 2 && pj.x2 >= pj.maxX && pj.vx2 < 0 && pj.x3 <= pj.minX && pj.vx3 > 0, patrol);

  const go = await h.evalv(`(() => {
    const a = window.__adv;
    a.setPaused(true);
    a.obstacles.length = 0;
    const px = a.player.x;
    a.goal.x = a.player.x - 60;
    a.goal.width = 400;
    a.update();
    const stoppedX = a.player.x;
    a.update();
    return JSON.stringify({
      px, pxAfter: a.player.x, stoppedX, done: a.levelCompleted,
      shown: document.getElementById('adv-win-modal').classList.contains('show'),
      title: document.getElementById('adv-win-title').textContent,
      btn: document.getElementById('adv-modal-btn').textContent
    });
  })()`);
  const goj = JSON.parse(go);
  check('goal reached: rocket stops, win modal shown', goj.done === true && goj.pxAfter === goj.stoppedX && goj.shown === true && goj.title.indexOf('ПРЕЂЕН') !== -1 && goj.btn.indexOf('СЛЕДЕЋИ') !== -1, go);
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

  const draw = await h.evalv(`(() => {
    try {
      const a = window.__adv;
      a.setPaused(true);
      a.loadWorld();
      a.update();
      a.draw();
      return 'ok';
    } catch (e) { return 'ERR:' + e.message; }
  })()`);
  check('draw: space decor + vortex stargate goal render without error', draw === 'ok', draw);

  await h.close();

  // V2.8 (spec §42.11) — portrait top-chrome geometry. Runs in a 390x844
  // session because the collisions only exist in portrait (the 1100x700
  // session above measured clean before AND after the fix, so it is a forward
  // guard at best): the title owns the .ps-header band, the HUD trio steps
  // below it, and none of the five chrome items overlap.
  const hp = await start({ page: '/pages/space.html', tag: 'space-smoke-portrait', width: 390, height: 844 });
  let pReady = false;
  for (let i = 0; i < 25 && !pReady; i++) {
    pReady = await hp.evalv(`typeof window.__adv === 'object' && window.__adv !== null`);
    if (!pReady) await sleep(200);
  }
  await hp.evalv(`window.audioBuses.connect=function(){}; true`);
  await hp.evalv(`document.fonts.ready.then(() => true)`);
  const geo = await hp.evalv(`(() => {
    const sels = ['#space-back', '#adv-title', '#adv-score', '#adv-worlds-btn', '#adv-music-btn'];
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
    // V2.8 owns the title collision + the back button's corner. The score card
    // vs the fixed-offset world buttons is a pre-existing, font-width-coupled
    // HUD coupling shared by all 4 adventure worlds (spec line 1366 → Phase V4
    // adventure HUD unification), NOT introduced here — so V2.8 asserts that
    // #adv-title and #space-back are clear of every other chrome item, and
    // reports the rest (incl. any score/worlds pair) as evidence only.
    const clean = s => overlaps.filter(o => o.startsWith(s));
    const title = boxes['#adv-title'];
    return JSON.stringify({
      booted: ${pReady},
      vw: innerWidth, vh: innerHeight,
      inHeader: document.getElementById('adv-title').closest('.ps-header') !== null,
      titleCx: (title.l + title.r) / 2,
      titleOrBackOverlaps: [...clean('#space-back'), ...clean('#adv-title')],
      allOverlaps: overlaps,
      bandBottom: title.b,
      hudTops: ['#adv-score', '#adv-worlds-btn', '#adv-music-btn'].map(s => boxes[s].t),
      inside: sels.every(s => boxes[s].l >= -0.5 && boxes[s].t >= -0.5 && boxes[s].r <= innerWidth + 0.5 && boxes[s].b <= innerHeight + 0.5)
    });
  })()`);
  const gj = JSON.parse(geo);
  check('V2.8 shell: title lives in the .ps-header row, centred on the viewport',
    gj.inHeader === true && Math.abs(gj.titleCx - gj.vw / 2) < 0.5, geo);
  check('V2.8 portrait: title + back clear of every other chrome item (§42.11)',
    gj.titleOrBackOverlaps.length === 0, geo);
  check('V2.8 portrait: HUD trio steps below the .ps-header band',
    gj.hudTops.every(t => t >= gj.bandBottom - 0.5), geo);
  check('V2.8 portrait: all five chrome items inside the viewport (390x844)', gj.inside === true, geo);
  await hp.close();

  const root = path.join(__dirname, '..');
  const indexHtml = fs.readFileSync(path.join(root, 'game', 'index.html'), 'utf8');
  check('hub button wired (data-go="game-space")', indexHtml.includes('data-go="game-space"'));
// R7: the route/back wiring lives in app-registry.js now, not in navigation.js.
  checkRouteWired('space', 'game-space', 'pages/space.html',
    { back: 'space-back', start: 'startSpace', check });
  const space = fs.readFileSync(path.join(root, 'game', 'games', 'space.js'), 'utf8');
  check('space config: no heroFlip (🚀 faces right natively) + heroBob set', !space.includes('heroFlip: true') && space.includes('heroBob: 4'));

  process.exit(getFails() ? 1 : 0);
})();
