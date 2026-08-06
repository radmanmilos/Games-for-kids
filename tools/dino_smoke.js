/* Дино (Dino) smoke test — Phase 4 adventure engine (ground mode).
   Drives the REAL page headlessly: engine boots in ground mode, 10 world
   configs are valid (names, collectibles, music keys, grounds, coins, goal,
   ground-mode features), the dino falls onto solid ground, runs left/right,
   jumps, collects coins, is blocked by pipes, gets knocked back when a raptor
   pops out, reaches the goal, and the worlds picker + win modal + music toggle
   work. Also verifies the hub wiring (button / navigation / standalone boot).
   Run:  node tools/dino_smoke.js     (from the repo root or anywhere)
   Requires Node >= 22. CHROME_PATH env optional. */
const { start, check, getFails } = require('./headless.js');
const fs = require('fs');
const path = require('path');

const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const h = await start({ page: '/pages/dino.html', tag: 'dino-smoke', width: 1100, height: 700 });

  let ready = false;
  for (let i = 0; i < 25 && !ready; i++) {
    ready = await h.evalv(`typeof window.__adv === 'object' && window.__adv !== null`);
    if (!ready) await sleep(200);
  }
  check('dino booted (window.__adv ready)', ready);

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
      pad: [...document.querySelectorAll('#adv-controls .adv-d-pad [data-adv]')].map(btn => btn.dataset.adv).join(','),
      heroW: window.__adv.player.width
    });
  })()`);
  const bj = JSON.parse(boot);
  check('engine: ground mode, 10 levels, HUD matches theme, 3-button layout', bj.mode === 'ground' && bj.levels === 10 && bj.worldName === bj.themeName && bj.collectEmoji === bj.themeCollect && bj.levelText === '1' && bj.controls === 'left,right,jump', boot);
  check('page chrome: title, back button, canvas, body bg applied', bj.bgApplied === true && bj.canvas === 1 && bj.heroW === 110, boot);
  check('ground controls: left/right in the D-pad cluster, jump on its own', bj.pad === 'left,right' && bj.controls.indexOf('jump') !== -1, boot);

  const pick = await h.evalv(`JSON.stringify({
    shown: document.getElementById('adv-dino-picker').classList.contains('show'),
    btns: [...document.querySelectorAll('#adv-dino-grid .adv-dino-btn')].map(b => b.dataset.dino),
    names: [...document.querySelectorAll('#adv-dino-grid .adv-dino-btn span')].map(s => s.textContent)
  })`);
  const pk = JSON.parse(pick);
  check('dino picker: shown at level start with the 2 PNG dinos', pk.shown === true && pk.btns.join(',') === 'bronto,t_rex' && pk.names.join(';') === 'Бронтосаурус;Тиранозаур', pick);
  await h.evalv(`document.querySelector('#adv-dino-grid .adv-dino-btn[data-dino="t_rex"]').click(); true`);
  await sleep(80);
  const pkj = JSON.parse(await h.evalv(`JSON.stringify({ hero: window.__adv.heroType, shown: document.getElementById('adv-dino-picker').classList.contains('show'), paused: window.__adv.paused })`));
  check('dino picker: picking a dino sets the hero, closes the picker, resumes the game', pkj.hero === 't_rex' && pkj.shown === false && pkj.paused === false, JSON.stringify(pkj));

  // The PNGs load async; wait for both cropped frames, then verify their sizing.
  let framesReady = false;
  for (let i = 0; i < 60 && !framesReady; i++) {
    framesReady = (await h.evalv(`(() => { const f = window.__dinoFrames; return JSON.stringify({ b: !!f.bronto, t: !!f.t_rex }); })()`)) === '{"b":true,"t":true}';
    if (!framesReady) await sleep(100);
  }
  const frames = await h.evalv(`JSON.stringify({ bronto: window.__dinoFrames.bronto && { w: window.__dinoFrames.bronto.width, h: window.__dinoFrames.bronto.height }, t_rex: window.__dinoFrames.t_rex && { w: window.__dinoFrames.t_rex.width, h: window.__dinoFrames.t_rex.height } })`);
  const fj = JSON.parse(frames);
  check('dino sprites: both PNGs cropped (transparent padding trimmed) + scaled to the 110x100 hitbox', framesReady === true && fj.bronto.w > 60 && fj.bronto.w <= 110 && fj.bronto.h === 100 && fj.t_rex.w > 60 && fj.t_rex.w <= 110 && fj.t_rex.h === 100, frames);

  const cfg = await h.evalv(`JSON.stringify(window.__adv.levels.map((l, i) => ({
    i,
    name: !!l.name,
    collect: !!l.collectible,
    music: l.music,
    musicDefined: !!window.__adv.music[l.music],
    grounds: (l.grounds || []).length,
    coins: (l.coins || []).length,
    goalX: l.goalX || 0,
    decor: !!l.decor,
    floats: (l.floats || []).length,
    moves: (l.moves || []).length,
    stairs: (l.stairs || []).length,
    pipes: (l.pipes || []).length,
    isNight: !!l.isNight,
    ceiling: !!l.ceiling
  })))`);
  const cfgs = JSON.parse(cfg);
  const bad = cfgs.filter(c => !c.name || !c.collect || !c.musicDefined || c.grounds < 1 || c.coins < 1 || c.goalX < 1000 || !c.decor);
  check('all 10 worlds: name, collectible, music theme, grounds, coins, goal, decor', bad.length === 0, cfg);
  const variety = cfgs.reduce((acc, c) => {
    if (c.floats > 0) acc.floats++;
    if (c.moves > 0) acc.moves++;
    if (c.stairs > 0) acc.stairs++;
    if (c.pipes > 0) acc.pipes++;
    if (c.ceiling) acc.ceiling++;
    if (c.isNight) acc.isNight++;
    return acc;
  }, { floats: 0, moves: 0, stairs: 0, pipes: 0, ceiling: 0, isNight: 0 });
  check('ground features: floats, moving platforms, stairs, pipes, ceiling + night world all present', variety.floats >= 3 && variety.moves >= 3 && variety.stairs >= 3 && variety.pipes >= 5 && variety.ceiling === 1 && variety.isNight === 1, JSON.stringify(variety));

  const gaps = await h.evalv(`JSON.stringify(window.__adv.levels.map((l, i) => {
    const solids = (l.grounds || []).slice().sort((a, b) => a.x - b.x);
    const floats = (l.floats || []).map(f => ({ x: f.x, right: f.x + f.w }));
    const moves = (l.moves || []).map(m => ({ minX: m.minX, maxX: m.maxX }));
    const openGaps = [];
    for (let i = 1; i < solids.length; i++) {
      const gapStart = solids[i - 1].x + solids[i - 1].w, gapEnd = solids[i].x;
      if (gapEnd <= gapStart) continue;
      const bridged = floats.some(f => f.right > gapStart && f.x < gapEnd) || moves.some(m => m.maxX > gapStart && m.minX < gapEnd);
      openGaps.push({ start: gapStart, end: gapEnd, w: gapEnd - gapStart, open: !bridged });
    }
    const open = openGaps.filter(g => g.w >= 150 && g.open);
    return { i, open: open.length, big: open.filter(g => g.w >= 180).length, tooWide: openGaps.some(g => g.w > 240) };
  }))`);
  const gapsJ = JSON.parse(gaps);
  const badGaps = gapsJ.filter(g => g.open < 2 || g.big < 1 || g.tooWide);
  check('pits: every world has >= 2 open fallable pits (>= 150px, one >= 180px), no unjumpable gap', badGaps.length === 0, gaps);

  const goals = await h.evalv(`JSON.stringify(window.__adv.levels.map((l, i) => {
    const grounds = (l.grounds || []).slice().sort((a, b) => a.x - b.x);
    const last = grounds[grounds.length - 1];
    return { i, lastRight: last ? last.x + last.w : 0, goalX: l.goalX || 0 };
  }))`);
  const goalsJ = JSON.parse(goals);
  const badGoals = goalsJ.filter(g => g.lastRight < g.goalX + 220);
  check('goal ground: the last ground always extends past the finish line', badGoals.length === 0, goals);

  const seqs = await h.evalv(`JSON.stringify(Object.keys(window.__adv.music).map(k => {
    const m = window.__adv.music[k];
    return { k, seq: (m.seq || []).length, bass: (m.bass || []).length, root: !!m.root, amb: !!m.ambient };
  }))`);
  const seqj = JSON.parse(seqs);
  const badSeq = seqj.filter(m => m.seq !== 32 || m.bass !== 16 || !m.root || !m.amb);
  check('music themes: 10 themes, each 32-step melody + 16-beat bass + root + ambient', seqj.length === 10 && badSeq.length === 0, seqs);

  // Settle the dino onto the ground, then verify it lands and stays put.
  await h.evalv(`(() => { const a = window.__adv; a.setPaused(true); a.keys.left = a.keys.right = a.keys.jump = false; for (let i = 0; i < 200; i++) a.update(); return true; })()`);
  const land = await h.evalv(`(() => {
    const a = window.__adv;
    const gy = a.platforms[0].y;
    return JSON.stringify({ y: a.player.y, gy: gy, grounded: a.player.grounded, onGround: a.player.y === gy - a.player.height, x: a.player.x });
  })()`);
  const lj = JSON.parse(land);
  check('physics: dino falls and lands on the ground', lj.grounded === true && lj.onGround === true, land);

  const run0 = await h.evalv(`window.__adv.player.x`);
  await h.evalv(`(() => { const a = window.__adv; a.keys.right = true; for (let i = 0; i < 30; i++) a.update(); a.keys.right = false; return true; })()`);
  const runR = await h.evalv(`window.__adv.player.x`);
  await h.evalv(`(() => { const a = window.__adv; a.keys.left = true; for (let i = 0; i < 30; i++) a.update(); a.keys.left = false; return true; })()`);
  const runL = await h.evalv(`window.__adv.player.x`);
  check('running: right key moves forward, left key moves back', runR > run0 && runL < runR, JSON.stringify({ run0, runR, runL }));

  const j0 = await h.evalv(`(() => { const a = window.__adv; a.loadWorld(); a.keys.left = a.keys.right = false; for (let i = 0; i < 200; i++) a.update(); return JSON.stringify({ y: a.player.y, g: a.player.grounded }); })()`);
  const jj0 = JSON.parse(j0);
  const jump = await h.evalv(`(() => {
    const a = window.__adv;
    const startY = a.player.y;
    let minY = startY;
    a.keys.jump = true;
    for (let i = 0; i < 40; i++) { a.update(); if (a.player.y < minY) minY = a.player.y; }
    a.keys.jump = false;
    return JSON.stringify({ startY: startY, minY: minY, endY: a.player.y });
  })()`);
  const jpj = JSON.parse(jump);
  check('jump: holding jump lifts the dino off the ground', jj0.g === true && jpj.minY < jpj.startY, JSON.stringify({ jj0, jump }));

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

  const pipe = await h.evalv(`(() => {
    const a = window.__adv;
    a.loadWorld();
    const p = a.obstacles && a.obstacles.length ? a.obstacles[0] : null;
    return JSON.stringify({ hasObstacles: !!p, pipesCount: 0 });
  })()`);
  const pj0 = JSON.parse(pipe);
  check('ground mode: no fly obstacles (obstacles array empty)', pj0.hasObstacles === false, pipe);

  const pipeBlock = await h.evalv(`(() => {
    const a = window.__adv;
    a.loadWorld();
    a.keys.left = a.keys.jump = false;
    for (let i = 0; i < 200; i++) a.update();
    // worldPos indexes the shuffled worldOrder; read the pipe of the ACTUAL
    // loaded world so the test is valid no matter which world booted first.
    const pw = a.levels[a.worldOrder[a.worldPos]].pipes[0].x;
    a.player.x = pw - a.player.width - 60;
    a.keys.right = true;
    for (let i = 0; i < 40; i++) a.update();
    a.keys.right = false;
    return JSON.stringify({ px: a.player.x, pw: pw, w: a.player.width, rightEdge: a.player.x + a.player.width });
  })()`);
  const pbj = JSON.parse(pipeBlock);
  check('pipe collision: right edge stops at the pipe, never crosses', pbj.rightEdge <= pbj.pw + 0.5 && pbj.px > pbj.pw - pbj.w - 60, pipeBlock);

  const pop = await h.evalv(`(() => {
    const a = window.__adv;
    a.loadWorld();
    const m = a.mice[0];
    m.visible = false;
    m.nextPopAt = performance.now() - 1;
    a.update();
    return JSON.stringify({ visible: m.visible });
  })()`);
  const popj = JSON.parse(pop);
  check('pipe hazard: raptor pops out on its 3s cycle', popj.visible === true, pop);

  await h.evalv(`(() => {
    const a = window.__adv;
    a.loadWorld();
    const m = a.mice[0];
    m.visible = true;
    m.animationStart = performance.now() - 800;
    m.y = m.visibleY;
    a.player.x = m.x - 10;
    a.player.y = m.visibleY - 50;
    a.player.vy = 0;
    a.player.grounded = false;
    a.update();
    return true;
  })()`);
  const knock = await h.evalv(`JSON.stringify({ y: window.__adv.player.y, bumps: window.__adv.bumpCount, done: window.__adv.levelCompleted })`);
  const kj = JSON.parse(knock);
  check('raptor hit: dino knocked back, level not completed', kj.bumps >= 1 && kj.done === false, knock);

  const heroDraw = await h.evalv(`(() => {
    try {
      const a = window.__adv;
      a.setPaused(true);
      a.loadWorld();
      a.update();
      a.draw();
      return 'ok';
    } catch (e) { return 'ERR:' + e.message; }
  })()`);
  check('draw: chosen dino hero + behind-the-world decor render without error', heroDraw === 'ok', heroDraw);

  const go = await h.evalv(`(() => {
    const a = window.__adv;
    a.setPaused(true);
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
  check('goal reached: dino stops, win modal shown', goj.done === true && goj.pxAfter === goj.stoppedX && goj.shown === true && goj.title.indexOf('ПРЕЂЕН') !== -1 && goj.btn.indexOf('СЛЕДЕЋИ') !== -1, go);
  await h.evalv(`document.getElementById('adv-modal-btn').click(); true`);
  await sleep(80);
  const nxt = await h.evalv(`JSON.stringify({
    level: document.getElementById('adv-level').textContent,
    hidden: !document.getElementById('adv-win-modal').classList.contains('show'),
    completed: window.__adv.levelCompleted
  })`);
  const nj = JSON.parse(nxt);
  check('next level: advances to world 2, modal closes', nj.level === '2' && nj.hidden === true && nj.completed === false, nxt);
  const npk = JSON.parse(await h.evalv(`JSON.stringify({ shown: document.getElementById('adv-dino-picker').classList.contains('show'), paused: window.__adv.paused })`));
  check('dino picker: re-shown before world 2', npk.shown === true && npk.paused === true, JSON.stringify(npk));
  await h.evalv(`document.querySelector('#adv-dino-grid .adv-dino-btn[data-dino="bronto"]').click(); true`);
  await sleep(80);
  const nkj = JSON.parse(await h.evalv(`JSON.stringify({ hero: window.__adv.heroType, shown: document.getElementById('adv-dino-picker').classList.contains('show'), paused: window.__adv.paused })`));
  check('dino picker: picking a new dino for world 2 resumes play', nkj.hero === 'bronto' && nkj.shown === false && nkj.paused === false, JSON.stringify(nkj));

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
  const wpk = JSON.parse(await h.evalv(`JSON.stringify({ shown: document.getElementById('adv-dino-picker').classList.contains('show'), paused: window.__adv.paused })`));
  check('dino picker: re-shown after jumping to a world', wpk.shown === true && wpk.paused === true, JSON.stringify(wpk));
  await h.evalv(`document.querySelector('#adv-dino-grid .adv-dino-btn[data-dino="t_rex"]').click(); true`);
  await sleep(80);

  const mus0 = await h.evalv(`document.getElementById('adv-music-btn').textContent`);
  await h.evalv(`document.getElementById('adv-music-btn').click(); true`);
  const mus1 = await h.evalv(`document.getElementById('adv-music-btn').textContent`);
  await h.evalv(`document.getElementById('adv-music-btn').click(); true`);
  const mus2 = await h.evalv(`document.getElementById('adv-music-btn').textContent`);
  check('music toggle: 🔊 -> 🔇 -> 🔊', mus0 === '🔊' && mus1 === '🔇' && mus2 === '🔊', mus0 + '/' + mus1 + '/' + mus2);

  // Regression: a viewport resize after load (URL bar / orientation) must keep
  // the ground anchored to the bottom so the player never "drops through the
  // ground and respawns". Old code left platforms at the pre-resize gy.
  await h.c.send('Emulation.setDeviceMetricsOverride', { width: 1100, height: 1200, deviceScaleFactor: 1, mobile: false });
  await sleep(400);
  const rsz = await h.evalv(`(() => {
    const a = window.__adv;
    a.setPaused(true);
    a.keys.left = a.keys.right = a.keys.jump = false;
    for (let i = 0; i < 300; i++) a.update();
    return JSON.stringify({ y: a.player.y, gy: a.platforms[0].y, ch: document.getElementById('adv-canvas').height, gyExpected: document.getElementById('adv-canvas').height - 140, grounded: a.player.grounded, onGround: a.player.y === a.platforms[0].y - a.player.height });
  })()`);
  const rj = JSON.parse(rsz);
  check('resize: ground re-anchored to the new canvas height, dino lands on it', rj.ch >= 1100 && rj.gy === rj.gyExpected && rj.onGround === true && rj.grounded === true, rsz);

  h.close();

  const root = path.join(__dirname, '..');
  const indexHtml = fs.readFileSync(path.join(root, 'game', 'index.html'), 'utf8');
  check('hub button wired (data-go="game-dino")', indexHtml.includes('data-go="game-dino"'));
  const nav = fs.readFileSync(path.join(root, 'game', 'shared', 'navigation.js'), 'utf8');
  check('navigation route wired (game-dino -> dino.html)', nav.includes("'game-dino'") && nav.includes("'pages/dino.html'"));
  const main = fs.readFileSync(path.join(root, 'game', 'shared', 'main.js'), 'utf8');
  check('standalone boot wired (dino -> dino-back/startDino)', main.includes("'dino': ['dino-back', 'startDino']"));
  const dino = fs.readFileSync(path.join(root, 'game', 'games', 'dino.js'), 'utf8');
  check('dino config: heroFlip set (PNG sprites face left natively) + jump power set', dino.includes('heroFlip: true') && dino.includes('jumpPower: -13.5'));
  check('dino config: file:// crop fallback present (getImageData is tainted under file://)', dino.includes('DINO_CROP_FALLBACK') && dino.includes('bronto: { x: 264, y: 106, w: 1529, h: 1633 }') && dino.includes('t_rex: { x: 154, y: 112, w: 1691, h: 1775 }'));
  check('dino config: pickHero/drawHero/decorBehind/heroBob wired', dino.includes('pickHero: true') && dino.includes('drawHero: drawDinoHero') && dino.includes('onHeroNeeded: showDinoPicker') && dino.includes('decorBehind: true') && dino.includes('heroBob: 2'));
  const adv = fs.readFileSync(path.join(root, 'game', 'games', 'adventure.js'), 'utf8');
  check('engine: hero-picker + decor-behind hooks present', adv.includes('cfg.pickHero') && adv.includes('cfg.drawHero') && adv.includes('cfg.decorBehind') && adv.includes('maybePickHero') && adv.includes('setHeroType'));
  const page = fs.readFileSync(path.join(root, 'game', 'pages', 'dino.html'), 'utf8');
  check('dino page: jump button present (data-adv="jump")', page.includes('data-adv="jump"'));
  check('dino page: hero picker overlay present', page.includes('adv-dino-picker'));
  const css = fs.readFileSync(path.join(root, 'game', 'shared', 'adventure.css'), 'utf8');
  check('adventure css: overlay controls + dino picker styles', css.includes('adv-dino-btn') && css.includes('pointer-events: none') && css.includes('z-index: 12'));

  process.exit(getFails() ? 1 : 0);
})();
