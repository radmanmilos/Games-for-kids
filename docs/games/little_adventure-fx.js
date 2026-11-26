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

  // Particle type configs (Q-14)
  A.PARTICLES = {
    dust:    { color: 0xD2B48C, size: 0.22, life: 0.7, vy: 0.6, spread: 0.8, count: 8 },
    spark:   { color: 0xFFD23F, size: 0.18, life: 0.5, vy: 1.2, spread: 1.0, count: 10 },
    hearts:  { color: 0xFF7AA2, size: 0.24, life: 1.0, vy: 0.8, spread: 0.6, count: 12 },
    leaves:  { color: 0x6FB35A, size: 0.20, life: 1.2, vy: 0.5, spread: 1.2, count: 10 },
    sparkle: { color: 0xFFF176, size: 0.20, life: 0.9, vy: 1.0, spread: 0.9, count: 10 },
    rune:    { color: 0x8EC5FF, size: 0.22, life: 1.0, vy: 0.7, spread: 0.7, count: 8 },
    feather: { color: 0xFFFFFF, size: 0.18, life: 1.1, vy: 0.4, spread: 0.8, count: 6 },
    bloom:   { color: 0xFFD23F, size: 0.26, life: 1.4, vy: 0.6, spread: 1.4, count: 16 },
    puff:    { color: 0xC06C84, size: 0.24, life: 0.8, vy: 0.5, spread: 1.0, count: 8 }
  };

  A.makeAtlas = function (THREE) {
    const c = document.createElement('canvas');
    c.width = 64; c.height = 64;
    const g = c.getContext('2d');
    const grd = g.createRadialGradient(32, 32, 2, 32, 32, 30);
    grd.addColorStop(0, 'rgba(255,255,255,1)');
    grd.addColorStop(0.5, 'rgba(255,255,255,0.8)');
    grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 64, 64);
    const tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    return tex;
  };

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
