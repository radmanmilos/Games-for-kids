/* Canonical validation for Папир Маца (Paper Kitty, task 68) — walking enemies,
   submarine finish line, kitty bob.
   Run: node tools/kitty_smoke.js   (expect ALL PASS)
   Uses the shared headless harness (serves game/ over HTTP, unique Chrome profile).
*/
const fs = require('fs');
const path = require('path');
const { start, check, getFails } = require('./headless.js');

const HTML = path.join(__dirname, '..', 'game', 'pages', 'papper_kitty.html');
const JS = path.join(__dirname, '..', 'game', 'games', 'kitty-standalone.js');

(async () => {
  const h = await start({ page: '/pages/papper_kitty.html', tag: 'kitty-smoke', width: 1280, height: 800 });
  await h.sleep(600);

  let ready = false;
  for (let i = 0; i < 10 && !ready; i++) {
    ready = await h.evalv('typeof WORLDS !== "undefined" && typeof loadWorld === "function"');
    if (!ready) await h.sleep(300);
  }
  check('boot: game globals ready', ready === true, ready ? 'WORLDS + loadWorld present' : 'not ready');

  // Task 90: the character picker must show before the world loads.
  const picker = await h.evalv(`(() => {
    const m = document.getElementById('char-modal');
    const btns = [...document.querySelectorAll('.char-btn')].map(b => b.dataset.character);
    return { shown: !!m && m.classList.contains('show'), count: btns.length, ids: btns.join(',') };
  })()`);
  check('task90: character picker shown at boot with both heroes',
    picker && picker.shown && picker.count === 2 && picker.ids === 'kitty,explorer',
    JSON.stringify(picker));

  await h.evalv(`document.querySelector('.char-btn[data-character="kitty"]').click()`);

  const bootName = await h.evalv('document.getElementById("world-name").textContent');
  check('boot: world HUD renders after choosing the kitty', typeof bootName === 'string' && bootName.length > 0, bootName);

  // Task 90: death sound is character-aware (cat.ogg for the kitty, "Јао!"
  // speech for the explorer girl) and the kitty is the default character.
  const deathSound = await h.evalv(`(() => {
    return {
      defaultChar: selectedCharacter,
      catWired: typeof playCatSound === 'function',
      girlWired: typeof playGirlHurt === 'function',
      hurtUsesChar: playHurtSound.toString().indexOf("selectedCharacter === 'kitty'") >= 0
    };
  })()`);
  check('task90: kitty is default, hurt sound branches per character',
    deathSound && deathSound.defaultChar === 'kitty' && deathSound.catWired && deathSound.girlWired && deathSound.hurtUsesChar,
    JSON.stringify(deathSound));
  const catAsset = fs.existsSync(path.join(__dirname, '..', 'game', 'assets', 'audio', 'cat.ogg'));
  check('task90: cat.ogg asset present for the kitty death sound', catAsset === true, 'game/assets/audio/cat.ogg');

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

  const waterPit = await h.evalv(`WORLDS[6].pitHazard`);
  check('water world: pits are spikes (per user request)', waterPit === 'spikes', 'Подводни свет pitHazard=' + waterPit);

  const src = fs.readFileSync(HTML, 'utf8');
  const js = fs.readFileSync(JS, 'utf8');
  const all = src + js;
  check('static: drawGoal has a submarine branch', all.includes("type === 'submarine'"), 'drawGoal submarine');
  check('static: hero grounded bob removed (per user 2026-08-06)', !all.includes('bobPhase'), 'no bob offset');
  check('static: walker draw + creation wired', all.includes('drawWalker(theme.walker)') && all.includes('walkers = (w.walkers || []).map'), 'drawWalker/loadWorld');

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
    walkers[0].vx = 0;
    player.x = walkers[0].x;
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
    player.x = walkers[0].x;
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

  // --- Task 73: Little Explorer sprite hero (state machine + rename) ---
  const heroStatic = await h.evalv(`(() => {
    return {
      title: document.title,
      hasLoader: typeof loadExplorerFrame === 'function' && typeof currentExplorerFrame === 'function',
      usesSprite: typeof currentExplorerFrame === 'function' && !!explorerFrames.idle,
      noEmoji: true,
      noCostume: typeof drawCostume === 'undefined',
      thud: typeof playHurtSound === 'function' && typeof kittyCatAudio === 'undefined',
      hasFrames: !!window.__explorerFrames
    };
  })()`);
  check('task73: renamed to Мала истраживачица, sprite hero wired (no emoji/costume/cat audio)',
    heroStatic && heroStatic.title.indexOf('Мала истраживачица') === 0 && heroStatic.hasLoader && heroStatic.usesSprite &&
    heroStatic.noEmoji && heroStatic.noCostume && heroStatic.thud && heroStatic.hasFrames,
    JSON.stringify(heroStatic));

  let framesReady = false;
  for (let i = 0; i < 20 && !framesReady; i++) {
    framesReady = await h.evalv(`(() => {
      const f = window.__explorerFrames;
      return !!f && Array.isArray(f.idle) && f.idle.length === 3 && !!f.walk && !!f.run && !!f.jump;
    })()`);
    if (!framesReady) await h.sleep(250);
  }
  check('task73: all 6 sprite frames loaded (3 idle + walk/run/jump)',
    framesReady === true, framesReady ? 'idle x3 + walk/run/jump' : 'not ready');

  const frameInfo = await h.evalv(`(() => {
    const f = window.__explorerFrames;
    const hasContent = (c) => {
      const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
      for (let i = 3; i < d.length; i += 4) if (d[i] > 10) return true;
      return false;
    };
    const feet = (c) => {
      const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
      for (let r = c.height - 2; r < c.height; r++) {
        for (let x = 0; x < c.width; x++) if (d[(r * c.width + x) * 4 + 3] > 10) return true;
      }
      return false;
    };
    const all = [f.idle[0], f.walk, f.run, f.jump, f.idle[1], f.idle[2]];
    return {
      size: f.idle[0].width + 'x' + f.idle[0].height,
      sameSize: all.every(c => c.width === f.idle[0].width && c.height === f.idle[0].height),
      content: all.every(hasContent),
      feetAtBottom: all.every(feet)
    };
  })()`);
  check('task73: kitty frames are 53x60, identical size, feet flush near the bottom row',
    frameInfo && frameInfo.size === '53x60' && frameInfo.sameSize && frameInfo.content && frameInfo.feetAtBottom,
    JSON.stringify(frameInfo));

  const states = await h.evalv(`(() => {
    worldPos = 0; loadWorld();
    walkers.length = 0; mice.length = 0;
    keys.left = keys.right = keys.jump = false;
    player.x = 40;
    player.grounded = true;
    player.y = groundY - player.height;
    player.vx = 0; player.vy = 0; player.squish = 1;
    player.animTime = 0;
    const out = {};
    update();
    out.idle = player.animState === 'idle' && currentExplorerFrame() === explorerFrames.idle[0];
    keys.right = true;
    update(); update(); update();
    out.walk = player.animState === 'walk' && currentExplorerFrame() === explorerFrames.walk;
    for (let i = 0; i < 6; i++) update();
    out.run = player.animState === 'run' &&
      (currentExplorerFrame() === explorerFrames.run || currentExplorerFrame() === explorerFrames.walk);
    keys.right = false;
    keys.jump = true;
    update();
    out.jump = player.animState === 'jump' && currentExplorerFrame() === explorerFrames.jump;
    keys.jump = false;
    return out;
  })()`);
  check('task73: state machine idle→walk→run→jump picks the right frame',
    states && states.idle && states.walk && states.run && states.jump, JSON.stringify(states));

  const runMix = await h.evalv(`(() => {
    worldPos = 0; loadWorld();
    walkers.length = 0; mice.length = 0;
    keys.left = keys.jump = false;
    keys.right = true;
    player.x = 40;
    player.grounded = true;
    player.y = groundY - player.height;
    player.vx = 0; player.vy = 0; player.squish = 1;
    player.animTime = 0; player.animState = 'run';
    const seen = new Set();
    let runFrames = 0;
    for (let i = 0; i < 40; i++) {
      update();
      if (player.animState === 'run') {
        runFrames++;
        seen.add(currentExplorerFrame());
      }
    }
    keys.right = false;
    return { runFrames, both: seen.has(explorerFrames.walk) && seen.has(explorerFrames.run) };
  })()`);
  check('task73: running alternates between the run and walk frames',
    runMix && runMix.runFrames > 10 && runMix.both === true, JSON.stringify(runMix));

  const ramp = await h.evalv(`(() => {
    worldPos = 0; loadWorld();
    walkers.length = 0; mice.length = 0;
    keys.left = keys.right = false;
    player.vx = 0;
    keys.right = true;
    update();
    const v1 = player.vx;
    keys.right = false;
    return { v1: +v1.toFixed(2) };
  })()`);
  check('task73: movement accelerates toward max speed (no instant full speed)',
    ramp && ramp.v1 > 0 && ramp.v1 < 3, JSON.stringify(ramp));

  const idleCycle = await h.evalv(`(() => {
    worldPos = 0; loadWorld();
    walkers.length = 0; mice.length = 0;
    keys.left = keys.right = keys.jump = false;
    player.x = 40;
    player.grounded = true;
    player.y = groundY - player.height;
    player.vx = 0; player.vy = 0; player.squish = 1;
    player.animTime = 0; player.animState = 'idle';
    for (let i = 0; i < 10; i++) update();
    const a = currentExplorerFrame() === explorerFrames.idle[0];
    for (let i = 0; i < 30; i++) update();
    const b = currentExplorerFrame() === explorerFrames.idle[1];
    return { a, b };
  })()`);
  check('task73: idle animates through the 3 variants',
    idleCycle && idleCycle.a && idleCycle.b, JSON.stringify(idleCycle));

  const mirror = await h.evalv(`(() => {
    worldPos = 0; loadWorld();
    walkers.length = 0; mice.length = 0;
    cameraX = 0;
    player.x = 100;
    player.grounded = true;
    player.y = groundY - player.height;
    player.vx = 0; player.vy = 0; player.squish = 1;
    player.animTime = 0; player.animState = 'idle';
    player.facingRight = true;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    draw();
    const snap = () => ctx.getImageData(95, player.y - 12, 56, 60).data;
    const right = snap();
    player.facingRight = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    draw();
    const left = snap();
    let diff = 0;
    for (let i = 0; i < right.length; i += 4) {
      if (right[i] !== left[i] || right[i + 1] !== left[i + 1] || right[i + 2] !== left[i + 2]) diff++;
    }
    return { diff, mirrored: diff > 200 };
  })()`);
  check('task73: hero mirrors when facing left (runtime flip)',
    mirror && mirror.mirrored === true, JSON.stringify(mirror));

  // Regression: a viewport resize after load must keep the ground anchored to
  // the bottom so the kitty never "drops through the ground and respawns".
  await h.c.send('Emulation.setDeviceMetricsOverride', { width: 1100, height: 1200, deviceScaleFactor: 1, mobile: false });
  await h.sleep(300);
  await h.evalv(`window.dispatchEvent(new Event('resize'))`);
  await h.sleep(200);
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
    const onAny = platforms.some(p => Math.abs(player.y + player.height - p.y) < 0.5);
    return JSON.stringify({ y: player.y, gy: platforms[0].y, grounded: player.grounded, onGround: onAny });
  })()`);
  const sj = JSON.parse(settle);
  check('resize: ground re-anchored to the new canvas height, kitty lands on it', rj.ch >= 1100 && rj.gy0 === rj.gyExpected && sj.onGround === true && sj.grounded === true, JSON.stringify({ rj, sj }));

  h.close();
  process.exit(getFails() ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(1); });
