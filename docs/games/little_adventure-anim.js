/* little_adventure-anim.js — pure animation toolkit (no THREE). Loaded as classic script. */
(function () {
  'use strict';
  const A = {};

  A.clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  // Easings: endpoints 0->0, 1->1
  A.outCubic = (t) => 1 - Math.pow(1 - t, 3);
  A.inOutSine = (t) => -(Math.cos(Math.PI * t) - 1) / 2;
  A.smoothstep = (t) => t * t * (3 - 2 * t);
  A.outBack = (t, s) => {
    s = s == null ? 1.70158 : s;
    const u = t - 1;
    return u * u * ((s + 1) * u + s) + 1;
  };
  A.outElastic = (t) => {
    if (t === 0 || t === 1) return t;
    const p = 0.3;
    return Math.pow(2, -10 * t) * Math.sin(((t - p / 4) * (2 * Math.PI)) / p) + 1;
  };

  // Spring (semi-implicit Euler), returns {x, v}
  A.spring = (x, v, target, k, d, dt) => {
    const f = -k * (x - target) - d * v;
    const nv = v + f * dt;
    const nx = x + nv * dt;
    return { x: nx, v: nv };
  };

  A.springChain = (chain, parentVelocity, dt, k, d) => {
    k = k == null ? 80 : k; d = d == null ? 12 : d;
    // chain: array of {x,v,target?}; each follows previous with lag
    let prev = parentVelocity || 0;
    for (let i = 0; i < chain.length; i++) {
      const node = chain[i];
      const tgt = i === 0 ? 0 : chain[i - 1].x * 0.3;
      const r = A.spring(node.x || 0, node.v || 0, tgt, k, d, dt);
      node.x = r.x; node.v = r.v;
      prev = r.x;
    }
    return chain;
  };

  // Envelope: array of [t, value] keyframes, returns interpolated value
  A.envelope = (t, keys, ease) => {
    if (!keys || keys.length === 0) return 0;
    if (t <= keys[0][0]) return keys[0][1];
    if (t >= keys[keys.length - 1][0]) return keys[keys.length - 1][1];
    let i = 0;
    while (i < keys.length - 1 && t > keys[i + 1][0]) i++;
    const t0 = keys[i][0], v0 = keys[i][1];
    const t1 = keys[i + 1][0], v1 = keys[i + 1][1];
    const u = (t - t0) / (t1 - t0);
    const e = ease ? ease(u) : u;
    return v0 + (v1 - v0) * e;
  };

  // Blend weight toward target, max step dt/blendTime
  A.blend = (w, target, dt, blendTime) => {
    blendTime = blendTime || 0.1;
    const maxStep = dt / blendTime;
    const diff = target - w;
    if (Math.abs(diff) <= maxStep) return target;
    return w + (diff > 0 ? maxStep : -maxStep);
  };

  // Seeded idle noise (deterministic)
  A.idleNoise = (seed, t) => {
    // simple pseudo-noise
    const s = (seed * 9301 + 49297) % 233280;
    return Math.sin(t * 1.3 + s * 0.001) * 0.5 + Math.sin(t * 2.7 + s * 0.002) * 0.25;
  };

  // Filmstrip: pose an array of rigs at evenly spaced times (pure: returns array of pose objects via evaluator)
  A.sheet = (evaluator, state, frames, duration, opts) => {
    const out = [];
    for (let i = 0; i < frames; i++) {
      const t = (frames <= 1) ? 0 : (i / (frames - 1)) * duration;
      out.push(evaluator(state, t, opts || {}));
    }
    return out;
  };

  // Evaluators (pure) — return pivot transforms
  A.evalHero = (state, t, opts) => {
    opts = opts || {};
    const ms = opts.motionScale == null ? 1 : opts.motionScale;
    const s = (state && state.hero) ? state.hero : (state || {});
    const speed = Math.hypot(s.vx || 0, s.vz || 0);
    const speed01 = Math.min(1, speed / 5.0);
    const DEG = Math.PI / 180;
    const swingFrac = s.swingFrac != null ? s.swingFrac : (s.swingT ? 1 - (s.swingT / 350) : 0);
    const swingPhase = Math.max(0, Math.min(1, swingFrac));
    // AD §4 swing 3-phase: windup 0-0.26 (0 -> -25deg), strike 0.26-0.57 (-25 -> 85deg), recover 0.57-1 (85 -> 0deg)
    let armRrx = 0;
    if (swingPhase > 0 && swingPhase < 0.26) {
      armRrx = (-25 * DEG) * (swingPhase / 0.26) * ms;
    } else if (swingPhase >= 0.26 && swingPhase < 0.57) {
      armRrx = (-25 * DEG + (110 * DEG) * ((swingPhase - 0.26) / 0.31)) * ms;
    } else if (swingPhase >= 0.57 && swingPhase < 1) {
      const u = (swingPhase - 0.57) / 0.43;
      const over = 10 * DEG * Math.sin(u * Math.PI) * (1 - u);
      armRrx = (85 * DEG * (1 - u) + over) * ms;
    }

    const phase = opts.phase != null ? opts.phase : (t * speed01 * 2 * Math.PI);
    const legSwing = Math.sin(phase) * (0.66 * DEG / DEG) * 0.4 * speed01 * ms; // ~±23deg scaled
    const legSwingR = Math.sin(phase) * 0.38 * DEG * 38 * speed01 * ms; // legacy magnitude
    const legA = Math.sin(phase) * 0.66 * speed01 * ms;
    const armSwing = Math.sin(phase) * 0.49 * speed01 * ms;
    const bob = speed01 > 0.01 ? Math.sin(phase * 2) * 0.06 * speed01 * ms : Math.sin(t * 2) * 0.02 * ms;
    const lean = 0.14 * speed01 * ms; // ~8deg
    const shieldUp = !!s.shield;
    const bumpT = s.bumpT || 0;
    const bumpFrac = bumpT > 0 ? Math.max(0, Math.min(1, 1 - bumpT / 200)) : 0;
    const pickupFrac = s.pickupFrac != null ? Math.max(0, Math.min(1, s.pickupFrac)) : 0;
    const celebrateFrac = s.celebrateFrac != null ? Math.max(0, Math.min(1, s.celebrateFrac)) : 0;

    let rootPy = bob;
    let rootRx = 0, rootRy = s.facing || 0, rootSx = 1, rootSy = 1, rootSz = 1;
    let torsoRx = lean, torsoRy = 0, torsoPy = 0;
    let armLrx = -armSwing + (shieldUp ? -1.2 * ms : 0);
    let armLrz = shieldUp ? 0.35 * ms : 0;
    let headRy = 0, headRx = 0;

    if (bumpFrac > 0) {
      const bsy = 1 - 0.18 * Math.sin(bumpFrac * Math.PI) * ms;
      rootSy = bsy; rootSx = 1 / Math.sqrt(Math.max(0.01, bsy)); rootSz = rootSx;
      rootPy += Math.sin(bumpFrac * Math.PI) * 0.25 * ms;
      torsoRx += -0.25 * ms * Math.sin(bumpFrac * Math.PI);
    }
    if (pickupFrac > 0) {
      armRrx = -2.2 * ms * Math.sin(pickupFrac * Math.PI);
      armLrx = -1.8 * ms * Math.sin(pickupFrac * Math.PI);
      rootPy += Math.sin(pickupFrac * Math.PI) * 0.05 * ms;
    }
    if (celebrateFrac > 0) {
      const hop = Math.abs(Math.sin(celebrateFrac * Math.PI * 2)) * 0.18 * ms;
      rootPy += hop;
      rootRy += celebrateFrac * Math.PI * 2 * ms;
      armRrx = -2.4 * ms;
      armLrx = -2.4 * ms;
    }

    // swing overrides armR
    if (swingPhase > 0) armRrx = armRrx;

    const hat1 = Math.sin(t * 1.5) * 0.1 * ms;
    const hat2 = Math.sin(t * 1.5 + 0.5) * 0.08 * ms;
    const hat3 = Math.sin(t * 1.5 + 1) * 0.05 * ms;
    const sc1 = Math.sin(t * 2 + 0.3) * 0.15 * ms;
    const sc2 = Math.sin(t * 2 + 0.8) * 0.12 * ms;
    const sc3 = Math.sin(t * 2 + 1.3) * 0.08 * ms;

    return {
      root: { py: rootPy, rx: rootRx, ry: rootRy, sx: rootSx, sy: rootSy, sz: rootSz },
      hips: { ry: Math.sin(phase) * 0.1 * speed01 * ms },
      torso: { rx: torsoRx, ry: torsoRy, py: torsoPy },
      armR: { rx: armRrx },
      armL: { rx: armLrx, rz: armLrz },
      legL: { rx: legA },
      legR: { rx: -legA },
      head: { ry: headRy, rx: headRx },
      hatTip1: { rz: hat1 },
      hatTip2: { rz: hat2 },
      hatTip3: { rz: hat3 },
      scarf1: { rz: sc1 },
      scarf2: { rz: sc2 },
      scarf3: { rz: sc3 }
    };
  };

  A.evalGrumpy = (g, t, opts) => {
    opts = opts || {};
    const ms = opts.motionScale == null ? 1 : opts.motionScale;
    const state = (g && g.state) || 'idle';
    const idle = Math.sin(t * 1.2) * 0.03 * ms;
    let hop = state === 'approach' ? Math.abs(Math.sin(t * 4)) * 0.15 * ms : 0;
    const body = { sx: 1, sy: 1, sz: 1 };
    let headRy = Math.sin(t * 0.8) * 0.1 * ms;
    let armLrx = state === 'hit' || state === 'retreat' ? -0.6 * ms : 0;
    let armRrx = state === 'hit' || state === 'retreat' ? 0.6 * ms : 0;
    let rootRy = 0;

    // Hit squash: 0.7 in 80ms, outElastic back over 350ms (AD §4) — volume-preserving
    const hitT = g && g.hitT > 0 ? (430 - g.hitT) : -1;
    if (hitT >= 0 && hitT <= 430) {
      let sy = 1;
      if (hitT < 80) sy = 1 - 0.3 * (hitT / 80);
      else { const u = Math.min(1, (hitT - 80) / 350); sy = 0.7 + (1 - 0.7) * A.outElastic(u); }
      sy = 1 + (sy - 1) * ms;
      const sxz = sy > 0.01 ? 1 / Math.sqrt(sy) : 1;
      body.sx = sxz; body.sy = sy; body.sz = sxz;
      armLrx = -0.6 * ms; armRrx = 0.6 * ms;
    }

    // Befriend elastic pop: scale 1.25->1 over 400ms, volume-preserving
    const befT = g && g.befriendT > 0 ? (400 - g.befriendT) : -1;
    if (befT >= 0 && befT <= 400) {
      const u = Math.min(1, befT / 400);
      let sy = 1.25 - 0.25 * A.outElastic(u);
      sy = 1 + (sy - 1) * ms;
      const sxz = sy > 0.01 ? 1 / Math.sqrt(sy) : 1;
      body.sx = sxz; body.sy = sy; body.sz = sxz;
    }

    // Notice pop (AD §4): scale pop 1.15 in 140ms
    if (state === 'notice') {
      const nf = g.noticeFrac != null ? g.noticeFrac : ((t * 1000 % 140) / 140);
      const pop = 1 + 0.15 * Math.sin(Math.min(1, nf) * Math.PI) * ms;
      body.sy = pop; body.sx = 1 / Math.sqrt(Math.max(0.01, pop)); body.sz = body.sx;
      headRy += 0.12 * ms;
    }

    // Happy dance (AD §4): hop-dance @1.2 Hz ±0.12u
    if (state === 'happy' || state === 'happyDance') {
      hop = Math.abs(Math.sin(t * Math.PI * 2 * 1.2)) * 0.12 * ms;
      armLrx = -0.8 * ms; armRrx = -0.8 * ms;
      rootRy = Math.sin(t * 1.2) * 0.25 * ms;
    }

    // Boss stomp (AD §4): stomp ring / heavy hop
    if (state === 'stomp' || state === 'bossStomp') {
      const sf = g.stompFrac != null ? g.stompFrac : ((t % 0.8) / 0.8);
      hop = sf < 0.35 ? (sf / 0.35) * 0.25 * ms : Math.max(0, (1 - (sf - 0.35) / 0.65)) * 0.05 * ms;
      const sy = sf < 0.35 ? 1 + 0.12 * (sf / 0.35) * ms : 1 - 0.12 * Math.max(0, 1 - (sf - 0.35) / 0.2) * ms;
      body.sy = sy; body.sx = 1 / Math.sqrt(Math.max(0.01, sy)); body.sz = body.sx;
    }

    return {
      root: { py: idle + hop, ry: rootRy },
      body: body,
      head: { ry: headRy },
      armL: { rx: armLrx },
      armR: { rx: armRrx }
    };
  };

  A.evalOwl = (owl, heroPos, speaking, t, opts) => {
    opts = opts || {};
    const ms = opts.motionScale == null ? 1 : opts.motionScale;
    const bob = speaking ? Math.sin(t * 6) * 0.05 * ms : 0;
    let ry = 0;
    const ox = owl && (owl.pos ? owl.pos[0] : owl.x);
    const oz = owl && (owl.pos ? owl.pos[1] : owl.z);
    if (heroPos && ox != null && oz != null) {
      const dx = (heroPos.x || 0) - ox;
      const dz = (heroPos.z || 0) - oz;
      ry = Math.atan2(dx, dz);
      const limit = (70 * Math.PI) / 180;
      ry = Math.max(-limit, Math.min(limit, ry));
    }
    const blink = (t % 3.2) < 0.12 ? 1 : 0.001;
    const flap = speaking ? Math.sin(t * 8) * 0.2 * ms : 0;
    return {
      root: { py: bob },
      head: { ry: ry * ms },
      lidL: { sy: blink },
      lidR: { sy: blink },
      wingL: { rz: flap },
      wingR: { rz: -flap }
    };
  };

  // filmstrip mode helper for renderer
  A.filmstrip = (evaluator, state, frames, duration, opts) => A.sheet(evaluator, state, frames, duration, opts);

  window.little_adventureAnim = A;
})();
