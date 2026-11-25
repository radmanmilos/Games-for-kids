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
    const swingFrac = s.swingT ? 1 - (s.swingT / 350) : 0;
    const swingPhase = Math.max(0, Math.min(1, swingFrac));
    // swing 3-phase: windup (0-0.26), strike (0.26-0.57), recover (0.57-1)
    let armR = 0;
    if (swingPhase > 0 && swingPhase < 0.26) armR = -0.6 * (swingPhase / 0.26) * ms;
    else if (swingPhase < 0.57) armR = (-0.6 + (swingPhase - 0.26) / 0.31 * 2.2) * ms;
    else armR = (1.6 - (swingPhase - 0.57) / 0.43 * 1.6) * ms;
    const walkPhase = (t * speed01 * 2) % (Math.PI * 2);
    const legSwing = Math.sin(walkPhase) * 0.4 * speed01 * ms;
    const idleBob = Math.sin(t * 2) * 0.02 * (1 - speed01) * ms;
    return {
      root: { ry: s.facing || 0 },
      torso: { ry: 0, py: idleBob },
      armR: { rx: armR },
      armL: { rx: speed01 * 0.3 * ms },
      legL: { rx: legSwing },
      legR: { rx: -legSwing },
      head: { ry: 0 },
      hatTip1: { rz: Math.sin(t * 1.5) * 0.1 * ms },
      hatTip2: { rz: Math.sin(t * 1.5 + 0.5) * 0.08 * ms },
      hatTip3: { rz: Math.sin(t * 1.5 + 1) * 0.05 * ms },
      scarf1: { rz: Math.sin(t * 2 + 0.3) * 0.15 * ms },
      scarf2: { rz: Math.sin(t * 2 + 0.8) * 0.12 * ms },
      scarf3: { rz: Math.sin(t * 2 + 1.3) * 0.08 * ms }
    };
  };

  A.evalGrumpy = (g, t, opts) => {
    opts = opts || {};
    const ms = opts.motionScale == null ? 1 : opts.motionScale;
    const state = (g && g.state) || 'idle';
    const idle = Math.sin(t * 1.2) * 0.03 * ms;
    const hop = state === 'approach' ? Math.abs(Math.sin(t * 4)) * 0.15 * ms : 0;
    return {
      root: { py: idle + hop },
      head: { ry: Math.sin(t * 0.8) * 0.1 * ms },
      armL: { rx: state === 'hit' ? -0.6 * ms : 0 },
      armR: { rx: state === 'hit' ? 0.6 * ms : 0 }
    };
  };

  A.evalOwl = (owl, heroPos, speaking, t, opts) => {
    opts = opts || {};
    const ms = opts.motionScale == null ? 1 : opts.motionScale;
    const bob = speaking ? Math.sin(t * 6) * 0.05 * ms : 0;
    // look-at limited ±70°
    let ry = 0;
    if (heroPos && owl && owl.pos) {
      const dx = (heroPos.x || 0) - (owl.pos[0] || 0);
      const dz = (heroPos.z || 0) - (owl.pos[1] || 0);
      ry = Math.atan2(dx, dz);
      const limit = (70 * Math.PI) / 180;
      ry = Math.max(-limit, Math.min(limit, ry));
    }
    return {
      root: { py: bob },
      head: { ry: ry * ms },
      wingL: { rz: speaking ? Math.sin(t * 8) * 0.2 * ms : 0 },
      wingR: { rz: speaking ? -Math.sin(t * 8) * 0.2 * ms : 0 }
    };
  };

  // filmstrip mode helper for renderer
  A.filmstrip = (evaluator, state, frames, duration, opts) => A.sheet(evaluator, state, frames, duration, opts);

  window.little_adventureAnim = A;
})();
