/* little_adventure-fx.js — sprite particle system + ambient life (data + pure helpers). */
(function () {
  'use strict';
  const A = {};

  // EVENT_TABLE: single source. event -> {sfx, particles, pose, camera, speech?}
  A.EVENT_TABLE = {
    swing: { sfx: 'swing', particles: 'dust', pose: 'swing', camera: 'none' },
    hit: { sfx: 'hit', particles: 'spark', pose: 'hit', camera: 'nudge' },
    befriend: { sfx: 'befriend', particles: 'hearts', pose: 'befriend', camera: 'reveal', speech: 'befriend' },
    bump: { sfx: 'bump', particles: 'dust', pose: 'bump', camera: 'none' },
    shieldBlock: { sfx: 'shieldBlock', particles: 'spark', pose: 'shield', camera: 'none' },
    bushCut: { sfx: 'bushCut', particles: 'leaves', pose: 'swing', camera: 'none' },
    chestOpen: { sfx: 'chestOpen', particles: 'sparkle', pose: 'open', camera: 'reveal' },
    itemSpawn: { sfx: 'itemSpawn', particles: 'sparkle', pose: 'none', camera: 'none' },
    pickup: { sfx: 'pickup', particles: 'sparkle', pose: 'pickup', camera: 'none' },
    gateOpen: { sfx: 'gateOpen', particles: 'sparkle', pose: 'open', camera: 'reveal' },
    pedestalFill: { sfx: 'pedestalFill', particles: 'rune', pose: 'none', camera: 'nudge' },
    pedestalWrong: { sfx: 'pedestalWrong', particles: 'dust', pose: 'none', camera: 'none' },
    bridgeUp: { sfx: 'bridgeUp', particles: 'sparkle', pose: 'none', camera: 'reveal' },
    owlTalk: { sfx: 'owlTalk', particles: 'feather', pose: 'talk', camera: 'none', speech: 'owl' },
    complete: { sfx: 'complete', particles: 'bloom', pose: 'celebrate', camera: 'reveal', speech: 'complete' },
    grumpyRespawn: { sfx: 'grumpyRespawn', particles: 'puff', pose: 'spawn', camera: 'none' }
  };

  A.eventKeys = () => Object.keys(A.EVENT_TABLE);

  // Tier table (Q-18)
  A.TIERS = {
    low: { dprCap: 1.0, drawCalls: 120, tris: 60000, particles: 40, shadows: 'blob', wind: false, water: 'flat', ambient: 'fireflies' },
    medium: { dprCap: 1.25, drawCalls: 160, tris: 90000, particles: 120, shadows: 'hero', wind: true, water: 'waves', ambient: 'butterflies' },
    high: { dprCap: 1.5, drawCalls: 220, tris: 130000, particles: 250, shadows: 'hero+actors', wind: true, water: 'foam', ambient: 'all' }
  };

  // Particle cap check
  A.particleCapFor = (tier) => (A.TIERS[tier] || A.TIERS.medium).particles;

  // Camera nudge helper (Q-15): returns new target clamped, max 6 units, <=1.2s
  A.cameraNudge = (target, thing, amount, reducedMotion) => {
    if (reducedMotion) return target;
    amount = Math.min(amount || 6, 6);
    const dx = thing.x - target.x, dz = thing.z - target.z;
    const len = Math.hypot(dx, dz) || 1;
    return { x: target.x + (dx / len) * amount, z: target.z + (dz / len) * amount };
  };

  window.little_adventureFx = A;
})();
