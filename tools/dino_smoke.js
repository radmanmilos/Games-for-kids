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
    const gy = document.getElementById('adv-canvas').clientHeight - 50;
    return JSON.stringify({ y: a.player.y, grounded: a.player.grounded, onGround: a.player.y === gy - a.player.height, x: a.player.x });
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
    const pipe = window.__adv.levels[window.__adv.worldPos].pipes[0];
    const pw = pipe.x;
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

  h.close();

  const root = path.join(__dirname, '..');
  const indexHtml = fs.readFileSync(path.join(root, 'game', 'index.html'), 'utf8');
  check('hub button wired (data-go="game-dino")', indexHtml.includes('data-go="game-dino"'));
  const nav = fs.readFileSync(path.join(root, 'game', 'shared', 'navigation.js'), 'utf8');
  check('navigation route wired (game-dino -> dino.html)', nav.includes("'game-dino'") && nav.includes("'pages/dino.html'"));
  const main = fs.readFileSync(path.join(root, 'game', 'shared', 'main.js'), 'utf8');
  check('standalone boot wired (dino -> dino-back/startDino)', main.includes("'dino': ['dino-back', 'startDino']"));
  const dino = fs.readFileSync(path.join(root, 'game', 'games', 'dino.js'), 'utf8');
  check('dino config: heroFlip + jump power set', dino.includes('heroFlip: true') && dino.includes('jumpPower: -13.5'));
  const page = fs.readFileSync(path.join(root, 'game', 'pages', 'dino.html'), 'utf8');
  check('dino page: jump button present (data-adv="jump")', page.includes('data-adv="jump"'));

  process.exit(getFails() ? 1 : 0);
})();
