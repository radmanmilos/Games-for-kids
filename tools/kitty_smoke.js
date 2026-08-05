/* Canonical validation for Папир Маца (Paper Kitty, task 68) — walking enemies,
   submarine finish line, kitty bob.
   Run: node tools/kitty_smoke.js   (expect ALL PASS)
   Uses the shared headless harness (serves game/ over HTTP, unique Chrome profile).
*/
const fs = require('fs');
const path = require('path');
const { start, check, getFails } = require('./headless.js');

const HTML = path.join(__dirname, '..', 'game', 'pages', 'papper_kitty.html');

(async () => {
  const h = await start({ page: '/pages/papper_kitty.html', tag: 'kitty-smoke', width: 1280, height: 800 });
  await h.sleep(600);

  let ready = false;
  for (let i = 0; i < 10 && !ready; i++) {
    ready = await h.evalv('typeof WORLDS !== "undefined" && typeof loadWorld === "function"');
    if (!ready) await h.sleep(300);
  }
  check('boot: game globals ready', ready === true, ready ? 'WORLDS + loadWorld present' : 'not ready');

  const bootName = await h.evalv('document.getElementById("world-name").textContent');
  check('boot: world HUD renders', typeof bootName === 'string' && bootName.length > 0, bootName);

  const data = await h.evalv(`(() => {
    const types = Object.keys(WALKER_FOOT);
    const missing = [];
    WORLDS.forEach((w, i) => {
      if (!Array.isArray(w.walkers) || w.walkers.length !== 4) missing.push(i + ':walkers');
      if (!w.walker || !types.includes(w.walker)) missing.push(i + ':walkerType');
    });
    return { n: WORLDS.length, missing };
  })()`);
  check('data: 11 worlds, 4 walkers each, valid walker type',
    data && data.n === 11 && data.missing.length === 0,
    data ? (data.n + ' worlds, missing=' + JSON.stringify(data.missing)) : 'n/a');

  const geo = await h.evalv(`(() => {
    const fails = [];
    WORLDS.forEach((w, wi) => {
      w.walkers.forEach((wk, ki) => {
        const lo = wk.x, hi = wk.x + wk.range;
        if (!w.grounds.some(g => g.x <= lo && hi <= g.x + g.w)) fails.push(wi + ':' + ki + ' offGround');
        if (w.pipes.some(p => lo < p.x + 60 && hi > p.x)) fails.push(wi + ':' + ki + ' pipe');
        if ((w.stairs || []).some(st => { const end = st.x + (2 * st.peak - 1) * st.w; return lo < end && hi > st.x; })) fails.push(wi + ':' + ki + ' stair');
        if (hi > w.goalX - 60) fails.push(wi + ':' + ki + ' goal');
        if (w.floats.some(f => lo < f.x + f.w && hi > f.x && f.dy < 70)) fails.push(wi + ':' + ki + ' float');
        if ((w.moves || []).some(m => lo < m.maxX && hi > m.minX && m.dy < 66)) fails.push(wi + ':' + ki + ' move');
        w.walkers.forEach((wk2, ki2) => {
          if (ki2 > ki) {
            const lo2 = wk2.x, hi2 = wk2.x + wk2.range;
            if (lo < hi2 && lo2 < hi) fails.push(wi + ':' + ki + 'x' + ki2);
          }
        });
      });
    });
    return fails;
  })()`);
  check('geometry: all patrols on ground, clear of pipes/stairs/goal/floats/moves/peers',
    Array.isArray(geo) && geo.length === 0, JSON.stringify(geo || []));

  const water = await h.evalv(`WORLDS[6].name === 'Подводни свет' && WORLDS[6].goal === 'submarine'`);
  check('water world: finish line is a submarine', water === true, 'Подводни свет -> submarine');

  const src = fs.readFileSync(HTML, 'utf8');
  check('static: drawGoal has a submarine branch', src.includes("type === 'submarine'"), 'drawGoal submarine');
  check('static: kitty bob applied on draw', src.includes('Math.sin(player.bobPhase) * 2.5'), 'bob offset');
  check('static: walker draw + creation wired', src.includes('drawWalker(theme.walker)') && src.includes('walkers = (w.walkers || []).map'), 'drawWalker/loadWorld');

  await h.evalv('setPaused(true); "paused"');

  const patrol = await h.evalv(`(() => {
    worldPos = 0; loadWorld();
    const w0 = walkers[0];
    let minX = w0.x, maxX = w0.x;
    for (let i = 0; i < 300; i++) {
      update();
      if (w0.x < minX) minX = w0.x;
      if (w0.x > maxX) maxX = w0.x;
    }
    return { minX, maxX, lo: w0.minX, hi: w0.maxX, walked: +(maxX - minX).toFixed(1), dir: w0.dir };
  })()`);
  check('walkers: patrol left/right inside [minX,maxX]',
    patrol && patrol.walked >= 100 && patrol.minX >= patrol.lo - 1 && patrol.maxX <= patrol.hi + 1,
    JSON.stringify(patrol));

  const stomp = await h.evalv(`(() => {
    worldPos = 0; loadWorld();
    player.x = walkers[0].x - 10;
    player.y = groundY - 210;
    player.vy = 0; player.grounded = false; player.vx = 0;
    const before = coinCount;
    let dead = false;
    for (let i = 0; i < 240; i++) {
      update();
      if (walkers[0].dead) { dead = true; break; }
    }
    return { dead, coins: coinCount - before };
  })()`);
  check('walkers: jumping on one defeats it + gives a coin', stomp && stomp.dead === true && stomp.coins === 1, JSON.stringify(stomp));

  const side = await h.evalv(`(() => {
    worldPos = 0; loadWorld();
    player.x = walkers[0].x - 30;
    player.y = groundY - 48;
    player.vy = 0; player.vx = 0; player.grounded = true;
    const before = coinCount;
    let respawned = false;
    for (let i = 0; i < 60; i++) {
      update();
      if (player.y < groundY - 300) { respawned = true; break; }
    }
    return { respawned, dead: walkers[0].dead, coins: coinCount - before };
  })()`);
  check('walkers: touching the side respawns kitty, no coin', side && side.respawned === true && side.dead === false && side.coins === 0, JSON.stringify(side));

  const freeze = await h.evalv(`(() => {
    worldPos = 0; loadWorld();
    levelCompleted = true;
    const x0 = walkers[0].x;
    for (let i = 0; i < 30; i++) update();
    return { frozen: walkers[0].x === x0 };
  })()`);
  check('walkers: freeze after the level is won', freeze && freeze.frozen === true, JSON.stringify(freeze));

  const sizes = await h.evalv(`(() => {
    const W = 60, G = 6;
    const types = Object.keys(WALKER_FOOT);
    const out = {};
    types.forEach((t, i) => {
      const x0 = i * (W + G) + 10, y0 = 10;
      ctx.clearRect(x0, y0, W, W);
      ctx.save();
      ctx.translate(x0 + W / 2, y0 + W / 2);
      drawWalker(t);
      ctx.restore();
      const d = ctx.getImageData(x0, y0, W, W).data;
      let x1 = W, y1 = W, x2 = -1, y2 = -1;
      for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) {
        if (d[(y * W + x) * 4 + 3] > 0) {
          if (x < x1) x1 = x; if (x > x2) x2 = x;
          if (y < y1) y1 = y; if (y > y2) y2 = y;
        }
      }
      out[t] = (x2 - x1 + 1) + 'x' + (y2 - y1 + 1);
    });
    return out;
  })()`);
  const sizesOk = sizes && Object.entries(sizes).every(([, v]) => {
    const [w, hgt] = v.split('x').map(Number);
    return w <= 48 && hgt <= 48;
  });
  check('walkers: all 11 sprites are 48x48 or smaller (<= kitty size)', sizesOk === true, JSON.stringify(sizes));

  const allWorlds = await h.evalv(`(() => {
    const errs = [];
    for (let i = 0; i < 11; i++) {
      try {
        worldPos = i; loadWorld();
        for (let j = 0; j < 40; j++) update();
        draw();
        if (walkers.length !== 4) errs.push(i + ':walkers=' + walkers.length);
        if (!Number.isFinite(groundY)) errs.push(i + ':noGroundY');
      } catch (e) { errs.push(i + ':ex=' + e.message); }
    }
    return errs;
  })()`);
  check('all 11 worlds: load + update + draw without error (incl. submarine water goal)',
    Array.isArray(allWorlds) && allWorlds.length === 0, JSON.stringify(allWorlds || []));

  // Regression: a viewport resize after load must keep the ground anchored to
  // the bottom so the kitty never "drops through the ground and respawns".
  await h.c.send('Emulation.setDeviceMetricsOverride', { width: 1100, height: 1200, deviceScaleFactor: 1, mobile: false });
  await h.sleep(400);
  const rsz = await h.evalv(`(() => {
    setPaused(true);
    worldPos = 0; loadWorld();
    walkers.length = 0;
    const gy0 = platforms[0].y;
    const canvasEl = document.getElementById('canvas');
    return JSON.stringify({ gy0, ch: canvasEl.height, gyExpected: canvasEl.height - 140 });
  })()`);
  const rj = JSON.parse(rsz);
  const settle = await h.evalv(`(() => {
    keys.left = keys.right = keys.jump = false;
    for (let i = 0; i < 300; i++) update();
    return JSON.stringify({ y: player.y, gy: platforms[0].y, grounded: player.grounded, onGround: player.y === platforms[0].y - player.height });
  })()`);
  const sj = JSON.parse(settle);
  check('resize: ground re-anchored to the new canvas height, kitty lands on it', rj.ch >= 1100 && rj.gy0 === rj.gyExpected && sj.onGround === true && sj.grounded === true, JSON.stringify({ rj, sj }));

  h.close();
  process.exit(getFails() ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(1); });
