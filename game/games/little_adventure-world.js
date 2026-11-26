/* little_adventure-world.js — decoration/landmark builders (Q-08). */
(function (root) {
  'use strict';
  var W = root.little_adventureWorld = root.little_adventureWorld || {};

  function mulberry32(a) { return function () { var t = a += 0x6D2B79F5; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  W.buildDecor = function (opts) {
    var THREE = opts.THREE, scene = opts.scene, mats = opts.mats, cfg = opts.cfg, terrain = opts.terrain;
    var reducedMotion = !!opts.reducedMotion, waterUniforms = opts.waterUniforms;
    var hAt = function (x, z) { return terrain && terrain.heightAt ? terrain.heightAt(x, z) : 0; };
    var rng = mulberry32((opts.seed == null ? 12345 : opts.seed) >>> 0);
    var forbidden = [];
    function addForbidden(x, z, r) { forbidden.push({ x: x, z: z, r: r + 1.5 }); }
    addForbidden(0, 10, 5); addForbidden(0, 4, 5);
    (cfg.obstacles || []).forEach(function (o) { addForbidden(o.x, o.z, o.r); });
    (cfg.gates || []).forEach(function (g) { addForbidden(g.pos[0], g.pos[1], 1); });
    (cfg.chests || []).forEach(function (c) { addForbidden(c.pos[0], c.pos[1], 1); });
    (cfg.pedestals || []).forEach(function (p) { addForbidden(p.pos[0], p.pos[1], 0.6); });
    (cfg.bushes || []).forEach(function (b) { addForbidden(b.pos[0], b.pos[1], 0.6); });

    function collectPositions(count, o) {
      var positions = [], rotations = [], scales = []; o = o || {};
      var tries = 0;
      while (positions.length < count && tries < count * 30) {
        tries++;
        var x = (rng() * 44) - 22, z = (rng() * 90) - 76;
        if (Math.abs(x) < 3) continue;
        if (o.zMin != null && z < o.zMin) continue;
        if (o.zMax != null && z > o.zMax) continue;
        var ok = true;
        for (var i = 0; i < forbidden.length; i++) { var f = forbidden[i]; if (Math.hypot(x - f.x, z - f.z) < (f.r + (o.extraR || 0))) { ok = false; break; } }
        if (!ok) continue;
        positions.push({ x: x, z: z }); rotations.push(rng() * Math.PI * 2); scales.push(0.85 + rng() * 0.4);
      }
      return { positions: positions, rotations: rotations, scales: scales };
    }

    function makeInstanced(geometry, material, placement, y, yFn) {
      var mesh = new THREE.InstancedMesh(geometry, material, placement.positions.length);
      var dummy = new THREE.Object3D();
      placement.positions.forEach(function (p, i) {
        var yy = yFn ? yFn(p.x, p.z, y) : y;
        dummy.position.set(p.x, yy, p.z); dummy.rotation.y = placement.rotations[i];
        dummy.scale.setScalar((placement.scales && placement.scales[i]) || 1); dummy.updateMatrix(); mesh.setMatrixAt(i, dummy.matrix);
      });
      mesh.count = placement.positions.length; mesh.instanceMatrix.needsUpdate = true; return mesh;
    }
    var mToon = function (c) { return mats ? mats.toon(c, { flat: true }) : new THREE.MeshLambertMaterial({ color: c, flatShading: true }); };
    var decoPlacements = [];
    var trackDeco = function (pl) { (pl.positions || []).forEach(function (p) { decoPlacements.push(p); }); return pl; };

    var treeA = trackDeco(collectPositions(35, { zMin: -16, zMax: 8 }));
    var treeB = trackDeco(collectPositions(25, { zMin: -46, zMax: -16 }));
    var treeC = trackDeco(collectPositions(18, { zMin: -80, zMax: -46 }));
    function addTrees(pl, crownColor, trunkColor) {
      scene.add(makeInstanced(new THREE.CylinderGeometry(0.12, 0.18, 0.9, 6), mToon(trunkColor), pl, 0, function (x, z) { return hAt(x, z) + 0.45; }));
      scene.add(makeInstanced(new THREE.ConeGeometry(0.7, 1.4, 8), mToon(crownColor), pl, 0, function (x, z) { return hAt(x, z) + 1.6; }));
    }
    addTrees(treeA, 0x2E7D32, 0xA66B3A); addTrees(treeB, 0x3E8E41, 0x8D5A2B); addTrees(treeC, 0x6A8EAE, 0x7A6A5A);

    var tuftPlacement = trackDeco(collectPositions(100));
    var tuftMat = mToon(0x6FB35A);
    tuftMat.onBeforeCompile = function (shader) {
      shader.uniforms.uTime = waterUniforms.uTime;
      shader.vertexShader = 'uniform float uTime;\n' + shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nfloat wy = max(0.0, transformed.y);\nfloat wind = ' + (reducedMotion ? '0.0' : '1.0') + ';\ntransformed.x += sin(uTime * 1.2 + instanceMatrix[3][0] * 0.3) * wy * 0.08 * wind;');
    };
    tuftMat.customProgramCacheKey = function () { return 'la-tuft-wind'; };
    scene.add(makeInstanced(new THREE.IcosahedronGeometry(0.45, 0), tuftMat, tuftPlacement, 0, function (x, z) { return hAt(x, z) + 0.3; }));

    var flowerColors = [0xFFD23F, 0xFF8A80, 0xB388FF, 0x80D8FF, 0xFFFFFF];
    flowerColors.forEach(function (fc, i) {
      var fp = trackDeco(collectPositions(14, { zMin: i < 3 ? -46 : -80, zMax: i < 3 ? 8 : -46 }));
      scene.add(makeInstanced(new THREE.SphereGeometry(0.11, 6, 4), mToon(fc), fp, 0, function (x, z) { return hAt(x, z) + 0.25; }));
    });
    scene.add(makeInstanced(new THREE.DodecahedronGeometry(0.38, 0), mToon(0x9AA0A6), trackDeco(collectPositions(26)), 0, function (x, z) { return hAt(x, z) + 0.18; }));
    var mushPl = trackDeco(collectPositions(18, { zMin: -46, zMax: -16 }));
    scene.add(makeInstanced(new THREE.CylinderGeometry(0.04, 0.06, 0.18, 6), mToon(0xE8D5B5), mushPl, 0, function (x, z) { return hAt(x, z) + 0.09; }));
    scene.add(makeInstanced(new THREE.SphereGeometry(0.12, 6, 4, 0, Math.PI * 2, 0, Math.PI / 2), mToon(0xD84315), mushPl, 0, function (x, z) { return hAt(x, z) + 0.18; }));
    scene.add(makeInstanced(new THREE.CylinderGeometry(0.12, 0.14, 1.2, 6), mToon(0x8D6E63), trackDeco(collectPositions(10, { zMin: -46, zMax: -16 })), 0, function (x, z) { return hAt(x, z) + 0.12; }));
    var lanternPl = trackDeco(collectPositions(8, { zMin: -80, zMax: -46 }));
    scene.add(makeInstanced(new THREE.CylinderGeometry(0.08, 0.08, 0.5, 6), mToon(0x8D6E63), lanternPl, 0, function (x, z) { return hAt(x, z) + 0.45; }));
    scene.add(makeInstanced(new THREE.SphereGeometry(0.1, 6, 4), new THREE.MeshBasicMaterial({ color: 0xFFD54F, transparent: true, opacity: 0.8 }), lanternPl, 0, function (x, z) { return hAt(x, z) + 0.75; }));
    scene.add(makeInstanced(new THREE.BoxGeometry(0.25, 1.2, 0.25), mToon(0x607D8B), trackDeco(collectPositions(10, { zMin: -80, zMax: -46 })), 0, function (x, z) { return hAt(x, z) + 0.6; }));

    // Q-08 landmarks: big blossom tree (A), hollow log arch (B), ruined arch (C)
    function addLandmarkA() {
      var x = -7, z = -2, y = hAt(x, z);
      var g = new THREE.Group();
      var trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.38, 2.2, 8), mToon(0x8D5A2B)); trunk.position.y = 1.1; g.add(trunk);
      var crown = new THREE.Mesh(new THREE.SphereGeometry(1.5, 10, 8), mToon(0x4CAF50)); crown.position.y = 2.9; g.add(crown);
      [[0.8,3.4,0.8,0xFFB7D5],[-0.9,3.1,0.5,0xFFD1E8],[0.2,3.8,-0.6,0xFFB7D5],[1.0,2.8,-0.4,0xFFD1E8],[-0.4,3.6,-0.9,0xFFB7D5]].forEach(function (b) {
        var s = new THREE.Mesh(new THREE.SphereGeometry(0.35, 7, 6), mToon(b[3])); s.position.set(b[0], b[1], b[2]); g.add(s);
      });
      g.position.set(x, y, z); scene.add(g);
    }
    function addLandmarkB() {
      var x = 7, z = -30, y = hAt(x, z);
      var g = new THREE.Group();
      var mat = mToon(0x7A5A46);
      var l = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 2.2, 8), mat); l.rotation.z = Math.PI / 2; l.position.set(-0.9, 0.45, 0); g.add(l);
      var r = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 2.2, 8), mat); r.rotation.z = Math.PI / 2; r.position.set(0.9, 0.45, 0); g.add(r);
      var top = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.5, 1.0), mat); top.position.set(0, 1.0, 0); g.add(top);
      g.position.set(x, y, z); scene.add(g);
    }
    function addLandmarkC() {
      var x = -6, z = -62, y = hAt(x, z);
      var g = new THREE.Group();
      var mat = mToon(0x78909C);
      var p1 = new THREE.Mesh(new THREE.BoxGeometry(0.7, 2.4, 0.7), mat); p1.position.set(-1.1, 1.2, 0); g.add(p1);
      var p2 = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.8, 0.7), mat); p2.position.set(1.1, 0.9, 0); p2.rotation.z = 0.08; g.add(p2);
      var top = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.45, 0.8), mat); top.position.set(0, 2.45, 0); top.rotation.z = -0.05; g.add(top);
      g.position.set(x, y, z); scene.add(g);
    }
    addLandmarkA(); addLandmarkB(); addLandmarkC();

    return { forbidden: forbidden, placements: decoPlacements };
  };
})(window);
