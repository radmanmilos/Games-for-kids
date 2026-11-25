/* little_adventure-terrain.js — pure terrain (heightfield, masks). Node-testable. */
(function () {
  'use strict';
  function mulberry32(seed) { let a = seed >>> 0; return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  function generate(cfg, seed) {
    seed = seed || 12345;
    const rng = mulberry32(seed);
    const bounds = cfg.bounds || { xMin: -24, xMax: 24, zMin: -80, zMax: 16 };
    const cx = (bounds.xMin + bounds.xMax) / 2;
    const cz = (bounds.zMin + bounds.zMax) / 2;
    const hw = (bounds.xMax - bounds.xMin) / 2;
    const hd = (bounds.zMax - bounds.zMin) / 2;
    const margin = 10;

    function landMask(x, z) {
      // superellipse/blob around gameplay rect expanded by margin
      const nx = (x - cx) / (hw + margin);
      const nz = (z - cz) / (hd + margin);
      const d = Math.pow(Math.abs(nx), 2.5) + Math.pow(Math.abs(nz), 2.5);
      if (d <= 1) return 1;
      if (d <= 1.35) return 1 - (d - 1) / 0.35;
      return 0;
    }
    function maskAt(x, z) { return Math.max(0, Math.min(1, landMask(x, z))); }

    function heightAt(x, z) {
      // flat corridor inside bounds shrunk by 2u (|h| <= 0.12); hills outside; below water at coast
      const inside = (x >= bounds.xMin + 2 && x <= bounds.xMax - 2 && z >= bounds.zMin + 2 && z <= bounds.zMax - 2);
      if (inside) return (rng() - 0.5) * 0.05; // tiny noise, |h|<=0.12
      const m = maskAt(x, z);
      if (m <= 0) return -1.5; // water
      // hills outside bounds
      const dist = Math.max(Math.abs(x - cx) / hw, Math.abs(z - cz) / hd);
      const hill = Math.max(0, (dist - 0.85) * 3) * (0.5 + rng() * 0.5);
      return Math.min(3, hill) * m - (1 - m) * 0.5;
    }

    function pathAt(x, z) {
      // dirt path along spine x≈0
      return Math.abs(x) < 1.5 ? 1 : 0;
    }

    // vertex data arrays for a grid
    const gridW = 96, gridH = 160;
    const stepX = (hw * 2 + margin * 2) / gridW;
    const stepZ = (hd * 2 + margin * 2) / gridH;
    const startX = cx - hw - margin;
    const startZ = cz - hd - margin;
    const verts = [];
    const colors = [];
    for (let j = 0; j <= gridH; j++) {
      for (let i = 0; i <= gridW; i++) {
        const x = startX + i * stepX;
        const z = startZ + j * stepZ;
        const h = heightAt(x, z);
        const m = maskAt(x, z);
        verts.push(x, h, z);
        // vertex colour by zone/slope/beach
        let r = 0.4, g = 0.7, b = 0.35;
        if (m < 0.5) { r = 0.3; g = 0.5; b = 0.7; } // water
        else if (Math.abs(h) < 0.12) { r = 0.55; g = 0.45; b = 0.3; } // path/beach
        colors.push(r, g, b);
      }
    }
    return { heightAt, maskAt, pathAt, verts, colors, gridW, gridH, stepX, stepZ, startX, startZ };
  }

  window.little_adventureTerrain = { generate };
})();
