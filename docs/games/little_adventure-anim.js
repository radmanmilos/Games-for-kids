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

  window.little_adventureAnim = A;
})();
