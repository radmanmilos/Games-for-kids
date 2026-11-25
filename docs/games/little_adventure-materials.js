/* little_adventure-materials.js — material kit (toon ramp, shared cache, outline, AO, wind). */
(function () {
  'use strict';
  function create(THREE) {
    // 3-step toon ramp
    const rampData = new Uint8Array([60, 140, 220]);
    const rampTex = new THREE.DataTexture(rampData, 3, 1, THREE.RedFormat);
    rampTex.minFilter = THREE.NearestFilter;
    rampTex.magFilter = THREE.NearestFilter;
    rampTex.needsUpdate = true;

    const cache = new Map();
    function toon(color, opts) {
      opts = opts || {};
      const key = 'toon:' + color + ':' + (opts.flat ? 'f' : 's');
      if (cache.has(key)) return cache.get(key);
      const m = new THREE.MeshToonMaterial({ color: color, gradientMap: rampTex });
      if (opts.flat) m.flatShading = true;
      cache.set(key, m);
      return m;
    }
    function standard(color, opts) {
      opts = opts || {};
      const key = 'std:' + color;
      if (cache.has(key)) return cache.get(key);
      const m = new THREE.MeshStandardMaterial({ color: color, roughness: 0.8, metalness: 0.05 });
      cache.set(key, m);
      return m;
    }
    function outlineOf(mesh, thickness, color) {
      // inverted hull: clone mesh, scale, back-face material
      const m = new THREE.MeshBasicMaterial({ color: color || 0x000000, side: THREE.BackSide });
      const o = mesh.clone();
      o.material = m;
      o.scale.multiplyScalar(1 + (thickness || 0.04));
      o.renderOrder = -1;
      return o;
    }
    function withVertexAO(geo, fn) {
      // fn(x,y,z) -> 0..1 ao factor; bake into color attribute if present
      if (!geo.attributes.position) return geo;
      const pos = geo.attributes.position;
      if (!geo.attributes.color) {
        const c = new Float32Array(pos.count * 3);
        for (let i = 0; i < pos.count; i++) { c[i*3]=1; c[i*3+1]=1; c[i*3+2]=1; }
        geo.setAttribute('color', new THREE.BufferAttribute(c, 3));
      }
      const col = geo.attributes.color;
      for (let i = 0; i < pos.count; i++) {
        const ao = fn ? fn(pos.getX(i), pos.getY(i), pos.getZ(i)) : 1;
        col.setX(i, col.getX(i) * ao);
        col.setY(i, col.getY(i) * ao);
        col.setZ(i, col.getZ(i) * ao);
      }
      col.needsUpdate = true;
      return geo;
    }
    function windPatch(material) {
      // placeholder: mark material for wind (actual shader patch in Q-08)
      material.userData = material.userData || {};
      material.userData.wind = true;
      return material;
    }
    function materialCount() { return cache.size; }
    return { toon, standard, outlineOf, withVertexAO, windPatch, materialCount, _ramp: rampTex, _cache: cache };
  }
  window.little_adventureMaterials = { create };
})();
