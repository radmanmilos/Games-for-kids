/* Брзи мачак — task 254: Sonic-like 2D auto-runner.
   The character runs forward by itself; the child only jumps (▲) and slides
   (▼). Coins/bolts fill the super-speed meter; when full, ⚡ starts a few
   seconds of invulnerable 2x speed with a barrel-roll spin that drains the
   meter. Level hazards adapt the racer's mechanic set: puddles slow you,
   rocks must be jumped, striped bars must be slid under, boost pads give a
   short burst. No fail states — a hit only slows (product principle).

   Terrain is a heightmap (groundYAt), not platform AABBs: the auto-run can
   never get stuck against a wall side, and "hills" are just ground profile.
   Level 1 is generated deterministically (mulberry32 with a fixed seed) so
   the smoke always sees the exact same 15000px course.

   Everything lives in an IIFE; only window.startFastCat (boot, called by
   shared/main.js via the registry) and window.__fc (smoke hooks) are global,
   so no top-level name can ever be shadowed by a shared module. */
(function () {
  'use strict';

  // --- Constants -----------------------------------------------------------
  const BASE_SPEED = 6.4;      // px/frame at 60fps reference
  const SUPER_MULT = 2.0;
  const SUPER_FRAMES = 240;    // 4s of super speed
  const BOOST_MULT = 1.35;
  const BOOST_FRAMES = 72;     // 1.2s boost panel
  const SLOW_MULT = 0.5;
  const SLOW_FRAMES = 72;      // 1.2s puddle/hit slowdown
  const GRAVITY = 0.55;        // explorer parity (kitty-standalone.js:1184)
  const JUMP_POWER = -13.5;    // explorer parity (kitty-standalone.js:1175)
  const SLIDE_FRAMES = 45;
  const SLIDE_H = 28;          // standing hitbox is 48; banner bottom sits at
                               // 34 above ground, so sliding clears by 6px
  const STAND_H = 48;
  const PLAYER_W = 48;
  const LEVEL_LEN = 15000;
  const GOAL_PAD = 240;        // flat run-out after the goal post
  const COIN_SCORE = 10, COIN_METER = 3;
  const BOLT_SCORE = 50, BOLT_METER = 12;
  const SPRITE_H = 60;         // explorer parity (kitty-standalone.js:892)
  const ANNOUNCE_COOLDOWN = 120; // frames between spoken "Пази!" repeats

  // --- Character sprites (copied loader from kitty-standalone.js:893-953;
  //     explorer keeps its own copy — extracting a shared module just for
  //     this would risk the explorer page for no gain, per YAGNI) ----------
  const CHARACTERS = {
    kitty: { folder: 'explorer_kitty/', srcW: 273, srcH: 312 },
    explorer: { folder: 'explorer/', srcW: 237, srcH: 329 }
  };
  const FRAME_FILES = {
    idle: ['01_idle_right.png', '04_idle_right_b.png', '06_idle_right_c.png'],
    walk: ['02_walk_right.png'],
    run: ['03_run_right.png'],
    jump: ['05_jump_right.png']
  };
  let selectedCharacter = 'kitty';
  const frames = {};

  function loadFrames() {
    ['idle', 'walk', 'run', 'jump'].forEach(k => delete frames[k]);
    Object.entries(FRAME_FILES).forEach(([key, files]) => files.forEach(file => {
      const c = CHARACTERS[selectedCharacter];
      const img = new Image();
      img.onload = () => {
        const w = Math.max(1, Math.round(c.srcW * SPRITE_H / c.srcH));
        const f = document.createElement('canvas');
        f.width = w; f.height = SPRITE_H;
        f.getContext('2d').drawImage(img, 0, 0, c.srcW, c.srcH, 0, 0, w, SPRITE_H);
        if (key === 'idle') { frames.idle = frames.idle || []; frames.idle.push(f); }
        else frames[key] = f;
      };
      img.src = '../assets/images/' + c.folder + file;
    }));
  }

  // --- Canvas / terrain ----------------------------------------------------
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  let baseY = 0;
  let plateaus = [];

  function groundYAt(x) {
    // base ground line + hill profile (rise / hold / fall ramps)
    let lift = 0;
    for (const p of plateaus) {
      const endRise = p.x0 + p.rampW;
      const endHold = endRise + p.holdW;
      const endFall = endHold + p.rampW;
      if (x < p.x0 || x > endFall) continue;
      let h = 0;
      if (x < endRise) h = p.h * (x - p.x0) / p.rampW;
      else if (x < endHold) h = p.h;
      else h = p.h * (1 - (x - endHold) / p.rampW);
      if (h > lift) lift = h;
    }
    return baseY - lift;
  }

  function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    baseY = canvas.height - 140;
    if (!level.length) return;
    // every entity stores `off` (height above ground line), so a resize only
    // re-derives y — no delta bookkeeping that can drift (unlike explorer).
    coins.forEach(e => { e.y = groundYAt(e.x) - e.off; });
    bolts.forEach(e => { e.y = groundYAt(e.x) - e.off; });
    puddles.forEach(e => { e.y = groundYAt(e.x); });
    rocks.forEach(e => { e.y = groundYAt(e.x); });
    banners.forEach(e => { e.y = groundYAt(e.x); });
    boosts.forEach(e => { e.y = groundYAt(e.x); });
    if (player) {
      const gy = groundYAt(player.x) - hitH();
      if (player.grounded || player.y > gy) { player.y = gy; player.grounded = true; player.vy = 0; }
    }
  }
  window.addEventListener('resize', resizeCanvas);

  // --- Level generation (deterministic) ------------------------------------
  let coins = [], bolts = [], puddles = [], rocks = [], banners = [], boosts = [];
  let level = [];

  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  const addCoin = (x, off) => coins.push({ x, off, y: 0, got: false });
  const addBolt = (x, off) => bolts.push({ x, off, y: 0, got: false });
  const addPuddle = (x, w) => puddles.push({ x, w, y: 0, hit: false });
  const addRock = (x) => rocks.push({ x, y: 0, hit: false, wob: 0 });
  const addBanner = (x) => banners.push({ x, y: 0, hit: false });
  const addBoost = (x) => boosts.push({ x, w: 90, y: 0 });

  function buildLevel() {
    coins = []; bolts = []; puddles = []; rocks = []; banners = []; boosts = []; plateaus = [];
    const rnd = mulberry32(254);           // fixed seed = stable course
    const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
    const arc = (x0, n, gap, h0, h1) => {
      for (let i = 0; i < n; i++) {
        const t = n > 1 ? i / (n - 1) : 0;
        addCoin(x0 + i * gap, h0 + Math.sin(t * Math.PI) * h1);
      }
    };
    // A shuffled deck instead of a plain pick(): pure pick() over the same
    // seed 254 never once drew 'boost' for the whole level (task 254 first
    // smoke). Dealing all 7 types before reshuffling guarantees every hazard
    // family — boost pads included — recurs once per ~7 chunks, and the
    // shuffle draws from the same rnd stream, so the course stays
    // deterministic.
    let deck = [];
    const drawType = () => {
      if (!deck.length) {
        deck = ['calm', 'rocks', 'puddle', 'banner', 'boost', 'hills', 'mixed'];
        for (let i = deck.length - 1; i > 0; i--) {
          const j = Math.floor(rnd() * (i + 1));
          const tmp = deck[i]; deck[i] = deck[j]; deck[j] = tmp;
        }
      }
      return deck.pop();
    };
    let x = 800;
    while (x < LEVEL_LEN - 700) {
      const canHazard = x > 1700;          // calm intro before any hazard
      const type = canHazard
        ? drawType()
        : pick(['calm', 'calm', 'hills']);
      if (type === 'calm') { arc(x, 5, 64, 40, 80); x += 520; }
      else if (type === 'rocks') {
        addRock(x + 300);
        arc(x + 150, 5, 64, 55, 105);      // collecting the arc = clearing the rock
        x += 660;
      } else if (type === 'puddle') {
        addPuddle(x + 260, 96);
        arc(x + 190, 4, 56, 45, 60);
        x += 620;
      } else if (type === 'banner') {
        addBanner(x + 320);
        for (let i = 0; i < 4; i++) addCoin(x + 240 + i * 56, 16); // low = slide line
        x += 600;
      } else if (type === 'boost') {
        addBoost(x + 300);
        for (let i = 0; i < 6; i++) addCoin(x + 160 + i * 60, 42);
        x += 660;
      } else if (type === 'hills') {
        const h = 90 + Math.round(rnd() * 40);
        const hold = 180 + Math.round(rnd() * 80);
        plateaus.push({ x0: x, h, rampW: 150, holdW: hold });
        // off is measured from the LOCAL ground (groundYAt already includes
        // the plateau lift) — writing h + 42 here double-counted the lift and
        // parked the coins above the screen (task 254 first smoke).
        for (let i = 0; i < 5; i++) addCoin(x + 200 + i * (hold / 4), 42);
        x += 150 * 2 + hold + 240;
      } else if (type === 'mixed') {
        addPuddle(x + 220, 88);
        addRock(x + 580);
        arc(x + 340, 4, 60, 50, 70);
        x += 840;
      }
      if (rnd() < 0.18) addBolt(x - 170, 80 + Math.round(rnd() * 40));
    }
    level = [{ goalX: LEVEL_LEN, pad: GOAL_PAD }];
    resizeCanvas();
  }

  // --- State ---------------------------------------------------------------
  let player = null;
  let camX = 0, score = 0, meter = 0, meterFullAnnounced = false;
  let superT = 0, boostT = 0, slowT = 0, annT = 0;
  let won = false, started = false, loopOn = false, rafId = 0, frame = 0;
  let particles = [];
  const keys = { jump: false, slide: false };
  let slideHeld = false;

  const hitH = () => (player && player.slide > 0) ? SLIDE_H : STAND_H;

  function reset() {
    player = { x: 150, y: 0, vy: 0, grounded: true, slide: 0, animState: 'run', animTime: 0, squish: 1 };
    buildLevel();
    camX = 0; score = 0; meter = 0; meterFullAnnounced = false;
    superT = 0; boostT = 0; slowT = 0; annT = 0; won = false; frame = 0;
    particles = [];
    player.y = groundYAt(player.x) - STAND_H;
    updateHud();
  }

  // --- HUD -----------------------------------------------------------------
  const el = (id) => document.getElementById(id);
  function updateHud() {
    const s = el('score-count'); if (s) s.textContent = '⭐ ' + score;
    const f = el('meter-fill'); if (f) f.style.width = Math.round(meter) + '%';
    const bar = el('meter-bar'); if (bar) bar.setAttribute('aria-valuenow', String(Math.round(meter)));
    const b = el('super-btn');
    if (b) {
      b.classList.toggle('ready', meter >= 100 && superT <= 0);
      b.classList.toggle('active', superT > 0);
    }
  }

  function addMeter(amount) {
    const before = meter;
    meter = Math.min(100, meter + amount);
    if (meter >= 100 && before < 100 && !meterFullAnnounced) {
      meterFullAnnounced = true;
      window.successChime && successChime();
      burst(player.x + 24, player.y, '#FFD23F', 10);
    }
    if (meter < 100) meterFullAnnounced = false;
    updateHud();
  }

  function announce(text) {
    if (annT > 0) return;
    annT = ANNOUNCE_COOLDOWN;
    if (window.audioBuses && audioBuses.speakWithDuck) audioBuses.speakWithDuck(text);
    else if (window.speech && speech.speak) speech.speak(text);
  }

  // --- Particles (explorer pattern, cap 120) -------------------------------
  function burst(x, y, color, n) {
    for (let i = 0; i < n && particles.length < 120; i++) {
      particles.push({
        x, y, color, life: 1,
        vx: (Math.random() - 0.5) * 6,
        vy: -Math.random() * 5 - 1
      });
    }
  }

  function updateParticles() {
    for (const p of particles) { p.x += p.vx; p.y += p.vy; p.vy += 0.25; p.life -= 0.03; }
    particles = particles.filter(p => p.life > 0);
  }

  // --- Input ---------------------------------------------------------------
  function bindButton(id, prop) {
    const b = el(id); if (!b) return;
    const down = (e) => { e.preventDefault(); window.initAudio && initAudio(); keys[prop] = true; };
    const up = (e) => { e.preventDefault(); keys[prop] = false; };
    b.addEventListener('touchstart', down, { passive: false });
    b.addEventListener('touchend', up, { passive: false });
    b.addEventListener('touchcancel', up, { passive: false });
    b.addEventListener('mousedown', down);
    b.addEventListener('mouseup', up);
    b.addEventListener('mouseleave', up);
  }

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'w' || e.key === 's') e.preventDefault();
    window.initAudio && initAudio();
    if (e.code === 'Space' || e.key === 'ArrowUp' || e.key === 'w') keys.jump = true;
    if (e.key === 'ArrowDown' || e.key === 's') keys.slide = true;
  });
  window.addEventListener('keyup', (e) => {
    if (e.code === 'Space' || e.key === 'ArrowUp' || e.key === 'w') keys.jump = false;
    if (e.key === 'ArrowDown' || e.key === 's') keys.slide = false;
  });

  function activateSuper() {
    if (meter < 100 || superT > 0 || won) return false;
    superT = SUPER_FRAMES;
    burst(player.x + 24, player.y + 24, '#FFD23F', 14);
    window.playSound && playSound('win');
    updateHud();
    return true;
  }

  // --- Update --------------------------------------------------------------
  function speedMul() {
    if (superT > 0) return SUPER_MULT;
    if (boostT > 0) return BOOST_MULT;
    if (slowT > 0) return SLOW_MULT;
    return 1;
  }

  function stepFrame() {
    frame++;
    if (annT > 0) annT--;
    if (superT > 0) {
      superT--;
      meter = superT > 0 ? 100 * superT / SUPER_FRAMES : 0;
      if (superT === 0) { meterFullAnnounced = false; updateHud(); }
      if (superT % 6 === 0) burst(player.x, player.y + 40, '#FFD23F', 2); // barrel-roll trail
    }
    if (boostT > 0) boostT--;
    if (slowT > 0) slowT--;
    updateParticles();
    if (won) { player.animTime++; return; }

    player.x += BASE_SPEED * speedMul();
    player.animTime++;

    // slide (grounded only, fresh press)
    if (keys.slide && !slideHeld && player.grounded) {
      player.slide = SLIDE_FRAMES;
      // hitH() just dropped 48 → 28: re-anchor the hitbox top to the ground
      // immediately, otherwise the grounded branch reads the 20px top shift
      // as "ground fell away" and wrongly flags the slide as airborne.
      player.y = groundYAt(player.x) - hitH();
      burst(player.x, player.y + 46, '#C9C9C9', 5);
      window.playSound && playSound('pop');
    }
    slideHeld = keys.slide;
    if (player.slide > 0) player.slide--;

    // jump
    if (keys.jump && player.grounded) {
      player.vy = JUMP_POWER;
      player.grounded = false;
      player.squish = 1.35;
      player.animState = 'jump';
      window.playSound && playSound('jump');
    }

    // vertical physics
    if (!player.grounded) {
      player.vy += GRAVITY;
      player.y += player.vy;
      const gy = groundYAt(player.x) - hitH();
      if (player.vy > 0 && player.y >= gy) {          // land
        player.y = gy; player.vy = 0; player.grounded = true;
        player.squish = 0.8;
        burst(player.x + 24, player.y + 46, '#E8E2D5', 4);
        if (keys.slide) player.slide = Math.max(player.slide, SLIDE_FRAMES);
      }
    } else {
      const gy = groundYAt(player.x) - hitH();
      if (gy > player.y + 1) {                        // ground falls away
        player.grounded = false;
      } else {
        player.y = gy;                                // climb/snap the ramp
      }
    }

    if (player.grounded && player.slide <= 0) player.animState = 'run';
    else if (!player.grounded) player.animState = 'jump';
    player.squish += (1 - player.squish) * 0.15;

    // --- entity interactions (AABB in world space) ---
    const px = player.x, pw = PLAYER_W, ph = hitH(), py = player.y;
    const overlap = (ex, ey, ew, eh) => px < ex + ew && px + pw > ex && py < ey + eh && py + ph > ey;

    for (const c of coins) {
      if (c.got) continue;
      if (overlap(c.x - 13, c.y - 13, 26, 26)) {
        c.got = true; score += COIN_SCORE;
        burst(c.x, c.y, '#FFD23F', 5);
        window.playSound && playSound('coin');
        addMeter(COIN_METER);
      }
    }
    for (const b of bolts) {
      if (b.got) continue;
      if (overlap(b.x - 15, b.y - 15, 30, 30)) {
        b.got = true; score += BOLT_SCORE;
        burst(b.x, b.y, '#FFE45C', 9);
        window.playSound && playSound('coin');
        addMeter(BOLT_METER);
      }
    }
    for (const p of puddles) {                       // grounded only = jump clears
      if (player.grounded && px + pw > p.x && px < p.x + p.w &&
          player.y + ph > groundYAt(p.x) - 8) {
        if (slowT <= 0) {
          slowT = SLOW_FRAMES;
          announce('Пази!');
          window.gentleMiss && gentleMiss();
          burst(px + 24, py + ph, '#4FA8E8', 6);
        }
      }
    }
    for (const r of rocks) {
      if (r.hit) continue;
      if (overlap(r.x, groundYAt(r.x) - 44, 46, 44)) {
        if (superT > 0) {                             // super = smash through
          r.hit = true; score += 20;
          burst(r.x + 23, groundYAt(r.x) - 24, '#9C9C9C', 12);
          window.playSound && playSound('coin');
        } else {
          r.hit = true; slowT = SLOW_FRAMES; r.wob = 20;
          announce('Пази!');
          window.gentleMiss && gentleMiss();
          player.squish = 1.3;
          burst(px + 24, py + ph, '#9C9C9C', 6);
        }
      }
    }
    for (const bn of banners) {
      const by = groundYAt(bn.x) - 96;               // bar zone: off 34..96
      if (overlap(bn.x, by, 76, 62)) {
        if (superT > 0) {
          if (!bn.hit) {
            bn.hit = true; score += 20;
            burst(bn.x + 38, by + 31, '#FF6B6B', 12);
            window.playSound && playSound('coin');
          }
        } else if (!bn.hit) {
          bn.hit = true; slowT = SLOW_FRAMES;
          announce('Пази!');
          window.gentleMiss && gentleMiss();
          player.squish = 1.3;
          burst(px + 24, py + ph, '#FF6B6B', 6);
        }
      }
    }
    for (const bd of boosts) {
      if (player.grounded && px + pw > bd.x && px < bd.x + bd.w &&
          player.y + ph > groundYAt(bd.x) - 10) {
        if (boostT <= 0) {
          boostT = BOOST_FRAMES;
          window.playSound && playSound('jump');
          burst(bd.x + bd.w / 2, groundYAt(bd.x) - 10, '#FFE45C', 8);
        }
      }
    }
    for (const r of rocks) if (r.wob > 0) r.wob--;

    // goal
    if (player.x >= LEVEL_LEN) {
      won = true;
      score += 100;
      window.playSound && playSound('win');
      window.speakSr && speakSr('praise');
      burst(player.x + 24, player.y, '#FFD23F', 20);
      const m = el('win-modal'), sub = el('win-sub');
      if (sub) sub.textContent = 'Поени: ' + score;
      if (m) m.classList.add('show');
      updateHud();
    }

    // camera
    const target = player.x - canvas.width * 0.3;
    camX += (target - camX) * 0.12;
    const camMax = LEVEL_LEN + GOAL_PAD - canvas.width;
    camX = Math.max(0, Math.min(camX, Math.max(0, camMax)));
    updateHud();
  }

  // --- Draw ----------------------------------------------------------------
  function drawStar(cx, cy, r, fill, stroke) {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const rad = i % 2 === 0 ? r : r * 0.45;
      const a = -Math.PI / 2 + i * Math.PI / 5;
      ctx[i === 0 ? 'moveTo' : 'lineTo'](cx + Math.cos(a) * rad, cy + Math.sin(a) * rad);
    }
    ctx.closePath();
    ctx.fillStyle = fill; ctx.fill();
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); }
  }

  function currentFrame() {
    const s = player.animState;
    if (s === 'jump') return frames.jump;
    if (s === 'run') return (Math.floor(player.animTime / 10) % 2 === 0) ? frames.run : frames.walk;
    const list = frames.idle || [];
    return list.length ? list[Math.floor(player.animTime / 22) % list.length] : undefined;
  }

  function draw() {
    const w = canvas.width, h = canvas.height;
    // sky
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#7FC2FF');
    sky.addColorStop(1, '#CDEBFF');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);

    // clouds (slow parallax)
    ctx.fillStyle = 'rgba(255,255,255,.85)';
    for (let i = 0; i < 6; i++) {
      const cx = ((i * 431 - camX * 0.15) % (w + 300) + w + 300) % (w + 300) - 150;
      const cy = 30 + (i * 47) % Math.max(60, h * 0.28);
      ctx.beginPath();
      ctx.ellipse(cx, cy, 44, 18, 0, 0, Math.PI * 2);
      ctx.ellipse(cx + 30, cy + 6, 30, 14, 0, 0, Math.PI * 2);
      ctx.ellipse(cx - 32, cy + 7, 26, 12, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // far hills (parallax)
    ctx.fillStyle = '#A5E5A0';
    for (let i = 0; i < 8; i++) {
      const hx = ((i * 613 - camX * 0.35) % (w + 500) + w + 500) % (w + 500) - 250;
      ctx.beginPath();
      ctx.ellipse(hx, baseY + 10, 190, 95, 0, Math.PI, 0);
      ctx.fill();
    }

    // terrain (heightmap)
    ctx.beginPath();
    ctx.moveTo(-8, h);
    for (let sx = -8; sx <= w + 8; sx += 6) ctx.lineTo(sx, groundYAt(sx + camX));
    ctx.lineTo(w + 8, h);
    ctx.closePath();
    ctx.fillStyle = '#C98B5E';
    ctx.fill();
    // grass line
    ctx.beginPath();
    for (let sx = -8; sx <= w + 8; sx += 6) {
      const gy = groundYAt(sx + camX);
      if (sx === -8) ctx.moveTo(sx, gy); else ctx.lineTo(sx, gy);
    }
    ctx.strokeStyle = '#5FBF57';
    ctx.lineWidth = 10;
    ctx.stroke();

    ctx.save();
    ctx.translate(-camX, 0);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // coins
    const pulse = 1 + Math.sin(frame * 0.15) * 0.08;
    for (const c of coins) {
      if (c.got) continue;
      if (c.x < camX - 40 || c.x > camX + w + 40) continue;
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.scale(pulse, pulse);
      drawStar(0, 0, 13, '#FFD23F', '#E8A800');
      ctx.restore();
    }
    // bolts (powerup pickups)
    for (const b of bolts) {
      if (b.got || b.x < camX - 40 || b.x > camX + w + 40) continue;
      ctx.beginPath();
      ctx.arc(b.x, b.y, 17, 0, Math.PI * 2);
      ctx.fillStyle = '#4A3F6B'; ctx.fill();
      ctx.strokeStyle = '#FFD23F'; ctx.lineWidth = 3; ctx.stroke();
      ctx.beginPath();                                  // lightning bolt
      ctx.moveTo(b.x + 3, b.y - 11); ctx.lineTo(b.x - 6, b.y + 2);
      ctx.lineTo(b.x, b.y + 2); ctx.lineTo(b.x - 3, b.y + 11);
      ctx.lineTo(b.x + 7, b.y - 3); ctx.lineTo(b.x + 1, b.y - 3);
      ctx.closePath();
      ctx.fillStyle = '#FFE45C'; ctx.fill();
    }
    // puddles
    for (const p of puddles) {
      if (p.x < camX - 120 || p.x > camX + w + 40) continue;
      const gy = groundYAt(p.x);
      ctx.beginPath();
      ctx.ellipse(p.x + p.w / 2, gy - 4, p.w / 2, 11, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(79,168,232,.9)'; ctx.fill();
      ctx.beginPath();
      ctx.ellipse(p.x + p.w / 2 - 14, gy - 7, 12, 4, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fill();
    }
    // rocks
    for (const r of rocks) {
      if (r.x < camX - 80 || r.x > camX + w + 40) continue;
      const gy = groundYAt(r.x) + (r.wob > 0 ? Math.sin(r.wob * 1.6) * 3 : 0);
      ctx.beginPath();
      ctx.moveTo(r.x, gy);
      ctx.lineTo(r.x + 4, gy - 30);
      ctx.lineTo(r.x + 16, gy - 44);
      ctx.lineTo(r.x + 34, gy - 40);
      ctx.lineTo(r.x + 46, gy - 20);
      ctx.lineTo(r.x + 44, gy);
      ctx.closePath();
      ctx.fillStyle = '#9C9C9C'; ctx.fill();
      ctx.strokeStyle = '#7A7A7A'; ctx.lineWidth = 3; ctx.stroke();
      ctx.beginPath();
      ctx.arc(r.x + 16, gy - 26, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#B5B5B5'; ctx.fill();
    }
    // striped slide bars (two posts + bar, off 34..96 above ground)
    for (const bn of banners) {
      if (bn.x < camX - 120 || bn.x > camX + w + 40) continue;
      const gy = groundYAt(bn.x);
      ctx.fillStyle = '#8A5A2B';
      ctx.fillRect(bn.x + 2, gy - 100, 8, 100);
      ctx.fillRect(bn.x + 66, gy - 100, 8, 100);
      const by = gy - 96;
      for (let i = 0; i < 6; i++) {
        ctx.fillStyle = i % 2 === 0 ? '#FF6B6B' : '#FFFFFF';
        ctx.fillRect(bn.x + 4 + i * 11.6, by + 14, 11.6, 26);
      }
      ctx.strokeStyle = '#E04B4B'; ctx.lineWidth = 3;
      ctx.strokeRect(bn.x + 4, by + 14, 70, 26);
    }
    // boost pads (yellow pad + chevrons)
    for (const bd of boosts) {
      if (bd.x < camX - 120 || bd.x > camX + w + 40) continue;
      const gy = groundYAt(bd.x);
      ctx.fillStyle = '#FFD23F';
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(bd.x, gy - 12, bd.w, 12, 5);
      else ctx.rect(bd.x, gy - 12, bd.w, 12);
      ctx.fill();
      ctx.strokeStyle = '#E8A800'; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = '#4A3F6B';
      for (let i = 0; i < 3; i++) {
        const cx0 = bd.x + 16 + i * 24;
        ctx.beginPath();
        ctx.moveTo(cx0 - 5, gy - 9); ctx.lineTo(cx0 + 5, gy - 6); ctx.lineTo(cx0 - 5, gy - 3);
        ctx.lineWidth = 3; ctx.strokeStyle = '#4A3F6B';
        ctx.stroke();
      }
    }
    // goal: checkered post
    const gx = LEVEL_LEN;
    if (gx > camX - 100 && gx < camX + w + 200) {
      const gy = groundYAt(gx);
      ctx.fillStyle = '#4A3F6B';
      ctx.fillRect(gx, gy - 170, 10, 170);
      for (let r = 0; r < 4; r++) for (let c2 = 0; c2 < 6; c2++) {
        ctx.fillStyle = (r + c2) % 2 === 0 ? '#FFFFFF' : '#222222';
        ctx.fillRect(gx + 10 + c2 * 18, gy - 170 + r * 16, 18, 16);
      }
      ctx.fillStyle = '#FFD23F';
      ctx.beginPath();
      ctx.arc(gx + 5, gy - 178, 9, 0, Math.PI * 2);
      ctx.fill();
    }

    // particles
    for (const p of particles) {
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // player
    if (player) {
      const f = currentFrame();
      const feetX = player.x + PLAYER_W / 2;
      const feetY = player.y + hitH();
      ctx.save();
      ctx.translate(feetX, feetY);
      // rotate around the sprite CENTER (not the feet): the barrel roll and
      // the slide lean read as body motion, not as spinning in place on the spot
      ctx.translate(0, -SPRITE_H / 2);
      if (superT > 0) ctx.rotate(frame * 0.45);        // barrel roll
      else if (player.slide > 0) ctx.rotate(0.35);    // slide lean
      ctx.translate(0, SPRITE_H / 2);
      const sq = player.squish;
      if (f) {
        ctx.scale(1, sq);
        ctx.drawImage(f, -f.width / 2, -SPRITE_H);
      } else {
        ctx.fillStyle = '#FFB6D0';
        ctx.fillRect(-PLAYER_W / 2, -hitH(), PLAYER_W, hitH());
      }
      ctx.restore();
    }
    ctx.restore();
  }

  // --- Loop ----------------------------------------------------------------
  function stepOne() {
    stepFrame();
    draw();
  }

  function loop() {
    rafId = requestAnimationFrame(loop);
    stepOne();
  }

  function startLoop() {
    if (loopOn) return;
    loopOn = true;
    loop();
  }
  function stopLoop() {
    loopOn = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopLoop();
    // `player` exists only after a character was picked — never resume into a
    // null-player tick (the rAF loop must not run before the game really starts).
    else if (player && !won && !loopOn) startLoop();
  });

  function winAgain() {
    const m = el('win-modal');
    if (m) m.classList.remove('show');
    reset();
    startLoop();
  }

  // --- Boot ----------------------------------------------------------------
  function startFastCat() {
    if (started) return;
    started = true;

    resizeCanvas();
    bindButton('btn-jump', 'jump');
    bindButton('btn-slide', 'slide');

    const superBtn = el('super-btn');
    if (superBtn) superBtn.addEventListener('click', () => {
      window.initAudio && initAudio();
      activateSuper();
    });
    const modalBtn = el('modal-btn');
    if (modalBtn) modalBtn.addEventListener('click', () => {
      window.initAudio && initAudio();
      winAgain();
    });

    // character picker (explorer parity: shown every load)
    const charModal = el('char-modal');
    document.querySelectorAll('#char-modal .char-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        window.initAudio && initAudio();
        selectedCharacter = btn.getAttribute('data-character') || 'kitty';
        loadFrames();
        if (charModal) charModal.classList.remove('show');
        reset();
        startLoop();
      });
    });
    if (charModal) charModal.classList.add('show');
  }
  window.startFastCat = startFastCat;

  // --- Smoke hooks (tools/fastcat_smoke.js) -------------------------------
  window.__fc = {
    // deterministic: pause the rAF loop, run exactly n ticks, draw once
    step(n) {
      stopLoop();
      for (let i = 0; i < n; i++) stepFrame();
      draw();
      return this.state();
    },
    resume() { if (started && !won) startLoop(); },
    press(key, down) { keys[key] = !!down; },
    super: activateSuper,
    restart: winAgain,
    // deterministic state setup / inspection for the smoke (test hooks — the
    // smoke drives real state through them, it does not stub behaviour)
    setMeter(v) { meter = Math.max(0, Math.min(100, v)); meterFullAnnounced = meter >= 100; updateHud(); },
    teleport(x) {
      stopLoop();
      player.x = Math.max(0, Math.min(x, LEVEL_LEN + GOAL_PAD - PLAYER_W));
      player.vy = 0; player.grounded = true; player.slide = 0;
      player.y = groundYAt(player.x) - STAND_H;
      camX = Math.max(0, Math.min(player.x - canvas.width * 0.3, LEVEL_LEN + GOAL_PAD - canvas.width));
      draw();
      return this.state();
    },
    spots() {
      return {
        coins: coins.filter(c => !c.got).map(c => ({ x: c.x, off: c.off })),
        bolts: bolts.filter(b => !b.got).map(b => b.x),
        puddles: puddles.map(p => p.x),
        rocks: rocks.map(r => ({ x: r.x, hit: r.hit })),
        banners: banners.map(b => ({ x: b.x, hit: b.hit })),
        boosts: boosts.map(b => b.x),
        goal: LEVEL_LEN
      };
    },
    state() {
      return {
        x: Math.round(player ? player.x : 0),
        y: Math.round(player ? player.y : 0),
        grounded: !!(player && player.grounded),
        slide: player ? player.slide : 0,
        score, meter: Math.round(meter),
        superT, boostT, slowT, won,
        coinsTotal: coins.length,
        coinsLeft: coins.filter(c => !c.got).length,
        rocks: rocks.length, banners: banners.length,
        puddles: puddles.length, boosts: boosts.length,
        plateaus: plateaus.length,
        levelLen: LEVEL_LEN,
        hasGoal: true
      };
    }
  };
})();
