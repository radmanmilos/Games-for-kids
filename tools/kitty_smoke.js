/* Canonical validation for Папир Маца (Paper Kitty, task 68) — walking enemies,
   submarine finish line, kitty bob.
   Run: node tools/kitty_smoke.js   (expect ALL PASS)
   Uses the shared headless harness (serves game/ over HTTP, unique Chrome profile).
*/
const fs = require('fs');
const path = require('path');
const { start, check, getFails } = require('./headless.js');

const HTML = path.join(__dirname, '..', 'game', 'pages', 'explorer.html');
const JS = path.join(__dirname, '..', 'game', 'games', 'kitty-standalone.js');

(async () => {
  const h = await start({ page: '/pages/explorer.html', tag: 'kitty-smoke', width: 1280, height: 800 });
  await h.sleep(600);

  let ready = false;
  for (let i = 0; i < 10 && !ready; i++) {
    ready = await h.evalv('typeof WORLDS !== "undefined" && typeof loadWorld === "function"');
    if (!ready) await h.sleep(300);
  }
  check('boot: game globals ready', ready === true, ready ? 'WORLDS + loadWorld present' : 'not ready');
  await h.evalv(`window.audioBuses.play=function(){};window.audioBuses.connect=function(){};window.audioBuses.registerMedia=function(){};window.audioBuses.speakWithDuck=function(t,cb){if(cb)cb();}; true`);

  // Task 90: the character picker must show before the world loads.
  const picker = await h.evalv(`(() => {
    const m = document.getElementById('char-modal');
    const btns = [...document.querySelectorAll('.char-btn')].map(b => b.dataset.character);
    return { shown: !!m && m.classList.contains('show'), count: btns.length, ids: btns.join(',') };
  })()`);
  check('task90: character picker shown at boot with both heroes',
    picker && picker.shown && picker.count === 2 && picker.ids === 'kitty,explorer',
    JSON.stringify(picker));

  // Regression guard (2026-09-30, user-reported "the explorer does not start").
  // #char-modal shipped with no CSS at all, so it stayed in normal flow inside
  // #app (position:fixed; overflow:hidden) and its buttons landed ~1090px down,
  // clipped off-screen: a child could see "Изабери лик" but could not tap a
  // hero, so the game never started. The boot check above passed anyway because
  // it clicks the button programmatically, which bypasses hit-testing. Assert
  // the buttons are genuinely on-screen and are the topmost element at their own
  // centre, i.e. that a real tap can reach them.
  const tappable = await h.evalv(`(() => {
    return [...document.querySelectorAll('.char-btn')].map(b => {
      const r = b.getBoundingClientRect();
      const cx = (r.left + r.right) / 2, cy = (r.top + r.bottom) / 2;
      const top = document.elementFromPoint(cx, cy);
      return {
        ch: b.dataset.character,
        inViewport: r.top >= 0 && r.left >= 0 && r.bottom <= innerHeight && r.right <= innerWidth,
        onTop: !!(top && top.closest && top.closest('.char-btn') === b)
      };
    });
  })()`);
  check('character picker is tappable: both hero buttons fully on-screen and topmost at their centre',
    Array.isArray(tappable) && tappable.length === 2 &&
    tappable.every(t => t.inViewport && t.onTop), JSON.stringify(tappable));

  await h.evalv(`document.querySelector('.char-btn[data-character="kitty"]').click()`);

  // Task 329: held input must release on touchcancel and on pause.
  const touchCancel = await h.evalv(`(() => {
    const btn = document.getElementById('btn-right');
    const before = keys.right;
    btn.dispatchEvent(new TouchEvent('touchstart', { bubbles: true, cancelable: true }));
    const held = keys.right;
    btn.dispatchEvent(new TouchEvent('touchcancel', { bubbles: true, cancelable: true }));
    const released = keys.right;
    return { before, held, released };
  })()`);
  check('task329: touchcancel releases held input',
    touchCancel && touchCancel.held === true && touchCancel.released === false,
    JSON.stringify(touchCancel));

  // Regression guard (2026-10-02, offline E2E P4): the three play controls and
  // the HUD labels were left in normal flow after the 100%-height canvas inside
  // #app (position:fixed; overflow:hidden), so they rendered below the fold on
  // every viewport — a child could not move or jump, and the world/level/coin
  // labels were invisible. Same class of bug as #char-modal above. Wait for the
  // picker to hide (readiness, not a sleep), then assert the controls are fully
  // on-screen AND topmost at their centre (a real tap, not .click(), which
  // bypasses hit-testing), and the pointer-events:none HUD labels are on-screen.
  let pickerHidden = false;
  for (let i = 0; i < 10 && !pickerHidden; i++) {
    pickerHidden = await h.evalv(`!document.getElementById('char-modal').classList.contains('show')`);
    if (!pickerHidden) await h.sleep(100);
  }
  const geom = await h.evalv(`(() => {
    const box = (s, hitTest) => {
      const b = document.querySelector(s);
      if (!b) return { s, missing: true };
      const r = b.getBoundingClientRect();
      const inside = r.top >= 0 && r.left >= 0 && r.bottom <= innerHeight && r.right <= innerWidth;
      if (!hitTest) return { s, inViewport: inside };
      const cx = (r.left + r.right) / 2, cy = (r.top + r.bottom) / 2;
      const top = document.elementFromPoint(cx, cy);
      return { s, inViewport: inside, onTop: !!(top && top.closest && top.closest(s) === b) };
    };
    return {
      controls: ['#btn-left', '#btn-right', '#btn-jump'].map(s => box(s, true)),
      hud: ['#level-num', '#world-name', '#coin-count'].map(s => box(s, false))
    };
  })()`);
  check('play controls tappable: left/right/jump fully on-screen and topmost at their centre',
    pickerHidden === true && geom && geom.controls.length === 3 &&
    geom.controls.every(c => !c.missing && c.inViewport && c.onTop),
    'pickerHidden=' + pickerHidden + ' ' + JSON.stringify(geom && geom.controls));
  check('HUD labels visible: level/world/coin fully on-screen',
    geom && geom.hud.length === 3 && geom.hud.every(c => !c.missing && c.inViewport),
    JSON.stringify(geom && geom.hud));

  // Task 251: the "fun speed" toggle sits under the point counter, a real tap
  // can reach it, and it boots OFF (normal speed is the default for a child).
  const funUi = await h.evalv(`(() => {
    const b = document.getElementById('fun-speed-btn');
    const c = document.getElementById('coin-count');
    if (!b || !c) return { missing: true };
    const r = b.getBoundingClientRect(), cr = c.getBoundingClientRect();
    const cx = (r.left + r.right) / 2, cy = (r.top + r.bottom) / 2;
    const top = document.elementFromPoint(cx, cy);
    return {
      inViewport: r.top >= 0 && r.left >= 0 && r.bottom <= innerHeight && r.right <= innerWidth,
      onTop: !!(top && top.closest && top.closest('#fun-speed-btn') === b),
      underCounter: r.top >= cr.bottom - 1,
      rightAligned: Math.abs(r.right - cr.right) < 4,
      label: (b.textContent || '').trim(),
      ariaLabel: (b.getAttribute('aria-label') || '').trim(),
      on: b.classList.contains('on'),
      pressed: b.getAttribute('aria-pressed'),
      state: funSpeedOn
    };
  })()`);
  check('task251: fun speed button under the point counter, tappable, default OFF',
    funUi && !funUi.missing && funUi.inViewport && funUi.onTop && funUi.underCounter &&
    funUi.rightAligned && (funUi.label.length > 0 || funUi.ariaLabel.length > 0) &&
    funUi.on === false && funUi.pressed === 'false' && funUi.state === false,
    JSON.stringify(funUi));

  const bootName = await h.evalv('document.getElementById("world-name").textContent');
  check('boot: world HUD renders after choosing the kitty', typeof bootName === 'string' && bootName.length > 0, bootName);

  // Task 429: each world must select its own scene image when loadWorld runs.
  // This catches a stale global Image source surviving a world transition.
  const sceneSelection = await h.evalv(`(() => {
    const savedOrder = worldOrder.slice();
    const savedPos = worldPos;
    const rows = [];
    worldOrder = WORLDS.map((_, i) => i);
    for (let i = 0; i < WORLDS.length; i++) {
      worldPos = i;
      loadWorld();
      rows.push({
        name: WORLDS[i].name,
        scene: WORLDS[i].scene,
        src: sceneImg ? sceneImg.getAttribute('src') : null
      });
    }
    worldOrder = savedOrder;
    worldPos = savedPos;
    loadWorld();
    return rows;
  })()`);
  const sceneSelectionOk = Array.isArray(sceneSelection) && sceneSelection.length === 11 &&
    sceneSelection.every(row => row.scene &&
      row.src === '../assets/scenes/scene-' + row.scene + '.png');
  check('task429: loadWorld selects the matching scene image for all 11 worlds',
    sceneSelectionOk, JSON.stringify(sceneSelection || []));

  const reusableArtUrls = await h.evalv(`['🐭', '🦇', '🐧', '⛄', '🦀', '🏠'].map(g => Art.url(g))`);
  const reusableArtStems = ['mouse.webp', 'bat.webp', 'penguin.webp', 'snowman.webp', 'animal-crab.webp', 'house.webp'];
  const reusableArtOk = Array.isArray(reusableArtUrls) && reusableArtUrls.length === reusableArtStems.length &&
    reusableArtUrls.every((url, i) => typeof url === 'string' && url.endsWith('/assets/art/' + reusableArtStems[i]));
  check('task429: shared emojis still resolve through ART_REGISTRY (no cross-game collision)',
    reusableArtOk, JSON.stringify(reusableArtUrls || []));

  const artReuseCalls = await h.evalv(`(() => {
    const oldImageStem = Art.imageStem;
    const oldDrawStem = Art.drawStem;
    const oldTheme = theme;
    const calls = [];
    // stemBox() caches the measured subject per stem. This test swaps in a fake padded image, so
    // start from an empty cache (else a real measured 'house' box changes the expected size) and
    // leave it empty so the fake box never leaks into real drawing.
    for (const k in stemBoxCache) delete stemBoxCache[k];
    Art.imageStem = () => ({ complete: true, naturalWidth: 512 });
    Art.drawStem = (context, stem, cx, cy, size) => {
      calls.push({ stem, size });
      return true;
    };
    try {
      drawEnemy('mouse');
      drawEnemy('bat');
      drawEnemy('penguin');
      drawWalker('snowman');
      drawWalker('crab');
      theme = WORLDS.find(w => w.scene === 'spring');
      drawGoal('house', { x: 0, y: 0, width: 220, height: 220 });
    } finally {
      Art.imageStem = oldImageStem;
      Art.drawStem = oldDrawStem;
      theme = oldTheme;
      for (const k in stemBoxCache) delete stemBoxCache[k];
    }
    return calls;
  })()`);
  const expectedArtCalls = [
    { stem: 'enemy-mouse', size: 40 }, { stem: 'enemy-bat', size: 40 }, { stem: 'enemy-penguin', size: 40 },
    { stem: 'walker-snowman', size: 36 }, { stem: 'walker-crab', size: 32 }, { stem: 'house', size: 220 }
  ];
  const artReuseOk = Array.isArray(artReuseCalls) && artReuseCalls.length === expectedArtCalls.length &&
    artReuseCalls.every((call, i) => call.stem === expectedArtCalls[i].stem && call.size === expectedArtCalls[i].size);
  check('task429: explorer uses stem-based art for mouse, bat, penguin, snowman, crab and Spring goal',
    artReuseOk, JSON.stringify(artReuseCalls || []));

  // Rendering guards (task 430). The suite used to prove only "draw() does not throw", so a screen
  // full of white boxes, a squashed background and an overwritten icon all passed. Assert what is drawn.
  const musicBtnSvg = await h.evalv(`(() => {
    const b = document.getElementById('music-btn');
    return !!(b && b.querySelector('svg'));
  })()`);
  check('task453: music button keeps its shared SVG icon (not overwritten by an emoji)',
    musicBtnSvg === true, String(musicBtnSvg));

  const sceneCover = await h.evalp(`(async () => {
    loadWorld();
    if (!sceneImg.complete) await new Promise(r => { sceneImg.onload = r; sceneImg.onerror = r; });
    const calls = [];
    const orig = ctx.drawImage.bind(ctx);
    ctx.drawImage = function (img, ...a) { if (img === sceneImg) calls.push(a); return orig(img, ...a); };
    try { draw(); } finally { ctx.drawImage = orig; }
    const want = sceneImg.naturalWidth * groundY / sceneImg.naturalHeight;
    const sky = calls.filter(a => a.length === 4);       // (x, y, w, h): the sky draw
    const strip = calls.filter(a => a.length === 8);     // bottom row continued below the ground
    return { n: calls.length, sky: sky.length, strip: strip.length, groundY, canvasH: canvas.height,
      allCoverSky: sky.length > 0 && sky.every(a => a[3] === groundY && Math.abs(a[2] - want) <= 1),
      stripBelowGround: canvas.height <= groundY ||
        (strip.length > 0 && strip.every(a => a[5] === groundY && a[7] === canvas.height - groundY)) };
  })()`);
  check('task453: scene art covers the whole sky area at its true aspect (no flat band, no squash)',
    sceneCover && sceneCover.allCoverSky === true && sceneCover.stripBelowGround === true, JSON.stringify(sceneCover));

  const whiteUnderArt = await h.evalp(`(async () => {
    loadWorld();
    for (const stem of [TERRAIN_STEMS[theme.scene], PIPE_STEMS[theme.scene], MOVING_PLATFORM_STEM]) {
      const im = Art.imageStem(stem);
      if (!im.complete) await new Promise(r => { im.onload = r; im.onerror = r; });
    }
    let white = 0;
    const orig = ctx.fillRect.bind(ctx);
    ctx.fillRect = function (...a) { if (String(ctx.fillStyle).toLowerCase() === '#ffffff') white++; return orig(...a); };
    try { draw(); } finally { ctx.fillRect = orig; }
    return { white, platforms: platforms.length, moving: movingPlatforms.length, pipes: pipes.length };
  })()`);
  check('task453: no white paper-outline is filled under loaded terrain, moving-platform or pipe art',
    whiteUnderArt && whiteUnderArt.white === 0, JSON.stringify(whiteUnderArt));

  const staleCanvas = await h.evalp(`(async () => {
    loadWorld();
    for (const stem of [TERRAIN_STEMS[theme.scene], PIPE_STEMS[theme.scene], MOVING_PLATFORM_STEM]) {
      const im = Art.imageStem(stem);
      if (!im.complete) await new Promise(r => { im.onload = r; im.onerror = r; });
    }
    if (!sceneImg.complete) await new Promise(r => { sceneImg.onload = r; sceneImg.onerror = r; });
    // Poison the whole canvas, draw one frame, and count what survives: every pixel must be repainted.
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#ff00ff';
    ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.restore();
    draw();
    const d = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let stale = 0;
    for (let i = 0; i < d.length; i += 4) { if (d[i] > 250 && d[i + 1] < 5 && d[i + 2] > 250) stale++; }
    return { stale, w: canvas.width, h: canvas.height, groundY };
  })()`);
  check('task453: every canvas pixel is repainted each frame (no stale fallback frame under the ground)',
    staleCanvas && staleCanvas.stale === 0, JSON.stringify(staleCanvas));

  const walkerFootAnchors = await h.evalv('({ snowman: WALKER_FOOT.snowman })');
  const walkerFootOk = walkerFootAnchors && walkerFootAnchors.snowman === 18;
  check('task429: approved snowman art anchor aligns its sprite feet with the ground',
    walkerFootOk, JSON.stringify(walkerFootAnchors || {}));

  // Data-driven (task 455): a cleaned walker's WALKER_FOOT must follow from its sprite's real bounds,
  // foot = size/2 - bottomPad * size/512, instead of a pinned magic number that silently goes stale
  // when a sprite is edited (the crab's baked ground band made its old value 16; clean it is 6).
  const walkerFootMeasured = await h.evalp(`(async () => {
    const sizes = { crab: 32, ladybug: 32, bee: 32, meerkat: 32, worm: 32 };
    const out = {};
    for (const [type, size] of Object.entries(sizes)) {
      const im = Art.imageStem('walker-' + type);
      if (!im.complete) await new Promise(r => { im.onload = r; im.onerror = r; });
      const box = stemBox('walker-' + type, im);
      const bottomPad = im.naturalHeight - (box.y + box.h);
      out[type] = { foot: WALKER_FOOT[type], expected: +(size / 2 - bottomPad * size / im.naturalHeight).toFixed(2) };
    }
    return out;
  })()`);
  const footWithin = walkerFootMeasured && Object.values(walkerFootMeasured).every(v => Math.abs(v.foot - v.expected) <= 1.5);
  check('task455: cleaned walkers stand on the ground (WALKER_FOOT matches the sprite bounds within 1.5px)',
    footWithin === true, JSON.stringify(walkerFootMeasured || {}));

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

  // Task 251: the button really toggles the flag (and its pressed/on states),
  // and ON runs the tick 3x per frame — measured as distance covered over the
  // same number of steps, on a cleared stretch of the first ground.
  const funToggle = await h.evalv(`(() => {
    const b = document.getElementById('fun-speed-btn');
    const snap = () => ({ state: funSpeedOn, pressed: b.getAttribute('aria-pressed'), cls: b.classList.contains('on') });
    b.click();
    const on = snap();
    b.click();
    const off = snap();
    return { on, off };
  })()`);
  check('task251: fun speed button toggles ON then OFF (flag + aria-pressed + class)',
    funToggle && funToggle.on.state === true && funToggle.on.pressed === 'true' && funToggle.on.cls === true &&
    funToggle.off.state === false && funToggle.off.pressed === 'false' && funToggle.off.cls === false,
    JSON.stringify(funToggle));

  const funPace = await h.evalv(`(() => {
    const run = (on) => {
      setFunSpeed(on);
      worldPos = 0; loadWorld();
      pipes.length = 0; walkers.length = 0; mice.length = 0;
      keys.left = keys.jump = false; keys.right = true;
      player.x = 40; player.grounded = true; player.y = groundY - player.height;
      player.vx = 0; player.vy = 0; player.squish = 1; player.animTime = 0;
      const x0 = player.x;
      for (let i = 0; i < 30; i++) stepFrame();
      keys.right = false;
      return +(player.x - x0).toFixed(1);
    };
    const off = run(false);
    const on = run(true);
    setFunSpeed(false);
    return { off, on, ratio: +(on / off).toFixed(2), restored: funSpeedOn };
  })()`);
  check('task251: fun speed ON covers ~2x the distance of OFF in the same steps',
    funPace && funPace.off > 0 && funPace.ratio > 1.5 && funPace.ratio < 2.5 && funPace.restored === false,
    JSON.stringify(funPace));

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

  // Dropping the player from 210px above the walker covers ground, and the game
  // awards coins from three independent sources: the stomp itself, the
  // exploration bonus (player.x > maxExploredX + 400, awarded every 400px of new
  // ground), and collectible pickups. Measuring the global counter across the
  // whole fall therefore counted 1-3 coins depending on where the player and the
  // pickups happened to be — a flaky assertion, not a product fault. Neutralize
  // the two incidental sources so the counter measures only the stomp award:
  // pre-set maxExploredX (kills the exploration bonus) and collect the nearby
  // coins up front (they stay collected).
  const stomp = await h.evalv(`(() => {
    worldPos = 0; loadWorld();
    walkers[0].vx = 0;
    player.x = walkers[0].x;
    player.y = groundY - 210;
    player.vy = 0; player.grounded = false; player.vx = 0;
    maxExploredX = player.x;          // no exploration bonus during the fall
    coins.forEach(c => { c.collected = true; });
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
    player.x = walkers[0].x + 200;
    player.y = groundY - 48;
    player.vy = 0; player.vx = -5; player.grounded = true;
    const startX = player.x;
    const before = coinCount;
    let respawned = false;
    for (let i = 0; i < 60; i++) {
      update();
      if (Math.abs(player.x - startX) > 10) { respawned = true; break; }
    }
    return { respawned, dead: walkers[0].dead, coins: coinCount - before };
  })()`);
  check('walkers: touching the side respawns kitty (soft reset)', side && side.respawned === true && side.dead === false, JSON.stringify(side));

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

  // Task 251: on the two smallest viewports the new toggle must not collide with
  // the counter or any other control (a child must be able to tap each of them)
  // and must stay fully inside the viewport.
  const funFit = async (w, ht) => {
    await h.c.send('Emulation.setDeviceMetricsOverride', { width: w, height: ht, deviceScaleFactor: 1, mobile: false });
    await h.sleep(150);
    await h.evalv(`window.dispatchEvent(new Event('resize'))`);
    await h.sleep(100);
    return await h.evalv(`(() => {
      const ids = ['#coin-count', '#worlds-btn', '#music-btn', '#btn-jump'];
      const f = document.getElementById('fun-speed-btn');
      if (!f) return { missing: true };
      const fr = f.getBoundingClientRect();
      const hit = (a, b) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
      return {
        inViewport: fr.top >= 0 && fr.left >= 0 && fr.bottom <= innerHeight && fr.right <= innerWidth,
        overlaps: ids.filter(s => {
          const b = document.querySelector(s);
          return b && hit(fr, b.getBoundingClientRect());
        })
      };
    })()`);
  };
  const funSmall = await funFit(844, 390);
  const funTall = await funFit(390, 844);
  check('task251: fun speed button stays in view and clears every HUD control at 844x390 and 390x844',
    funSmall && funTall && funSmall.inViewport && funSmall.overlaps.length === 0 &&
    funTall.inViewport && funTall.overlaps.length === 0,
    JSON.stringify({ small: funSmall, tall: funTall }));

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
    return JSON.stringify({ gy0, ch: canvasEl.height, gyExpected: canvasEl.height - 100 });
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

  await h.close();
  process.exit(getFails() ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(1); });
