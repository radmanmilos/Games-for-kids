/* Возила (Driving) smoke test — Phase 4 adventure engine.
   Drives the REAL page headlessly: engine boots, 10 worlds config is valid
   (names, collectibles, music keys, obstacles, coins, goal), drive-mode steering
   moves the car, clamps hold, coins collect, obstacles knock the car back, goal
   completes the level, worlds picker + win modal + music toggle work, and the
   hub wiring (button / navigation / standalone boot) is in place.
   Run:  node tools/driving_smoke.js     (from the repo root or anywhere)
   Requires Node >= 22. CHROME_PATH env optional. */
const { start, check, getFails } = require('./headless.js');
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

  const s0 = await h.evalv(`(() => {
    const a = window.__adv;
    a.keys.up = true; a.keys.right = true;
    return JSON.stringify({ y: a.player.y, ox: a.player.offsetX });
  })()`);
  await sleep(150);
  const s1 = await h.evalv(`(() => {
    const a = window.__adv;
    const r = JSON.stringify({ y: a.player.y, ox: a.player.offsetX });
    a.keys.up = false; a.keys.right = false;
    return r;
  })()`);
  const sj0 = JSON.parse(s0), sj1 = JSON.parse(s1);
  check('steering: up decreases y, right increases offsetX', sj1.y < sj0.y && sj1.ox > sj0.ox, s0 + ' -> ' + s1);

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
    const c = a.coins[0];
    a.coins.slice(1).forEach(other => { other.collected = true; });
    a.player.offsetX = c.x - a.cameraX;
    a.player.y = c.y;
    a.update();
    return JSON.stringify({ count: a.coinCount, collected: c.collected, hud: document.getElementById('adv-coin-count').textContent });
  })()`);
  const coj = JSON.parse(coin);
  check('coin pickup: count 1, HUD updated', coj.count === 1 && coj.collected === true && coj.hud === '1', coin);

  await sleep(1100);
  const hit = await h.evalv(`(() => {
    const a = window.__adv;
    a.loadWorld();
    const o = a.obstacles[0];
    const before = a.cameraX;
    o.x = a.player.x + 20;
    o.y = a.player.y;
    a.update();
    return JSON.stringify({ before, after: a.cameraX, completed: a.levelCompleted });
  })()`);
  const hj = JSON.parse(hit);
  check('obstacle hit: car knocked back, level not completed', hj.after < hj.before && hj.completed === false, hit);

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

  h.close();

  const root = path.join(__dirname, '..');
  const indexHtml = fs.readFileSync(path.join(root, 'game', 'index.html'), 'utf8');
  check('hub button wired (data-go="game-driving")', indexHtml.includes('data-go="game-driving"'));
  const nav = fs.readFileSync(path.join(root, 'game', 'shared', 'navigation.js'), 'utf8');
  check('navigation route wired (game-driving -> driving.html)', nav.includes("'game-driving'") && nav.includes("'pages/driving.html'"));
  const main = fs.readFileSync(path.join(root, 'game', 'shared', 'main.js'), 'utf8');
  check('standalone boot wired (driving -> driving-back/startDriving)', main.includes("'driving': ['driving-back', 'startDriving']"));

  process.exit(getFails() ? 1 : 0);
})();
