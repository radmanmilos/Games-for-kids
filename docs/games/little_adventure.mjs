/* little_adventure.mjs — renderer bootstrap, camera, input, loop, save I/O */

import * as THREE from 'three';

'use strict';

const cfg = window.little_adventure_CONFIG;
const logic = window.little_adventureLogic;
const modelsFactory = window.little_adventureModels;

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let booted = false;

window.startlittle_adventure = function startlittle_adventure() {
  if (booted) return;
  booted = true;

  const reducedMotion = !!window.REDUCED_MOTION;
  const gallery = new URLSearchParams(location.search).has('gallery');
  let tickAudio = null;

  try {
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, cfg.budget.dprMax));
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('i3d-view').appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x87CEEB, 60, 120);
    scene.background = new THREE.Color(0x87CEEB);
    const perfOverlay = document.createElement('div');
    perfOverlay.style.cssText = 'position:fixed; top:4px; left:4px; z-index:60; color:#FFF; font:12px monospace; background:rgba(0,0,0,0.5); padding:2px 4px; display:none;';
    document.body.appendChild(perfOverlay);
    if (new URLSearchParams(location.search).has('perf')) perfOverlay.style.display = 'block';

    const hemi = new THREE.HemisphereLight(0xFFFFFF, 0x4488FF, 0.9);
    scene.add(hemi);
    const dir = new THREE.DirectionalLight(0xFFFFFF, 0.8);
    dir.position.set(5, 10, 7.5);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    dir.castShadow = true;
    dir.shadow.mapSize.width = 1024;
    dir.shadow.mapSize.height = 1024;
    dir.shadow.camera.near = 0.5;
    dir.shadow.camera.far = 50;
    dir.shadow.camera.left = -14;
    dir.shadow.camera.right = 14;
    dir.shadow.camera.top = 14;
    dir.shadow.camera.bottom = -14;
    dir.shadow.bias = -0.0005;
    dir.shadow.normalBias = 0.02;
    scene.add(dir);

    // Q-03: atmosphere state + blend
    const zoneAtmos = (cfg.zoneAtmos || []);
    const atmos = { idx: 0, t: 0, blend: 1, from: null, to: null };
    function zoneIndexForZ(z) {
      const zones = cfg.zones || [];
      for (let i = 0; i < zones.length; i++) {
        if (z > zones[i].z1) return i;
      }
      return zones.length - 1;
    }
    function applyAtmos(a) {
      const c = new THREE.Color(a.skyTop);
      scene.background = c;
      if (scene.fog) { scene.fog.color = new THREE.Color(a.fog); scene.fog.near = a.fogNear; scene.fog.far = a.fogFar; }
      hemi.color.set(a.key); hemi.groundColor.set(a.fill); hemi.intensity = a.intensity;
      dir.color.set(a.key);
    }
    // initial
    if (zoneAtmos.length) applyAtmos(zoneAtmos[0]);

    const mats = (window.little_adventureMaterials && window.little_adventureMaterials.create)
      ? window.little_adventureMaterials.create(THREE) : null;
    const terrain = (window.little_adventureTerrain && window.little_adventureTerrain.generate)
      ? window.little_adventureTerrain.generate(cfg, 12345) : null;
    const hAt = (x, z) => terrain ? terrain.heightAt(x, z) : 0;
    const models = modelsFactory.create(THREE);

    // Ground - Q-06 terrain mesh (deterministic, seeded)
    let ground;
    if (terrain && terrain.verts && terrain.colors) {
      const gGeo = new THREE.BufferGeometry();
      gGeo.setAttribute('position', new THREE.Float32BufferAttribute(terrain.verts, 3));
      gGeo.setAttribute('color', new THREE.Float32BufferAttribute(terrain.colors, 3));
      const gw = terrain.gridW, gh = terrain.gridH;
      const idx = [];
      for (let j = 0; j < gh; j++) {
        for (let i = 0; i < gw; i++) {
          const a = j * (gw + 1) + i;
          const b = a + 1;
          const c = a + (gw + 1);
          const d = c + 1;
          idx.push(a, c, b, b, c, d);
        }
      }
      gGeo.setIndex(idx);
      gGeo.computeVertexNormals();
      ground = new THREE.Mesh(gGeo, new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true }));
    } else {
      const groundGeo = new THREE.PlaneGeometry(96, 160, 64, 64);
      ground = new THREE.Mesh(groundGeo, new THREE.MeshLambertMaterial({ color: 0x7ec850, flatShading: true }));
      ground.rotation.x = -Math.PI / 2;
      ground.position.z = -32;
    }
    ground.receiveShadow = true;
    scene.add(ground);

    // Q-05: sky dome (inverted sphere, vertex colour gradient)
    const skyGeo = new THREE.SphereGeometry(400, 24, 16);
    const skyPos = skyGeo.attributes.position;
    const skyCol = new Float32Array(skyPos.count * 3);
    const zenith = new THREE.Color(0x4A90D9);
    const horizon = new THREE.Color(0xFFE4B5);
    for (let i = 0; i < skyPos.count; i++) {
      const y = skyPos.getY(i);
      const t = Math.max(0, Math.min(1, (y + 400) / 800)); // 0 horizon, 1 zenith
      const c = horizon.clone().lerp(zenith, t);
      skyCol[i * 3] = c.r; skyCol[i * 3 + 1] = c.g; skyCol[i * 3 + 2] = c.b;
    }
    skyGeo.setAttribute('color', new THREE.BufferAttribute(skyCol, 3));
    const sky = new THREE.Mesh(skyGeo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false }));
    scene.add(sky);

    // sun disc sprite
    const sunCanvas = document.createElement('canvas');
    sunCanvas.width = 64; sunCanvas.height = 64;
    const sctx = sunCanvas.getContext('2d');
    const grad = sctx.createRadialGradient(32, 32, 2, 32, 32, 30);
    grad.addColorStop(0, 'rgba(255,250,220,1)');
    grad.addColorStop(1, 'rgba(255,200,120,0)');
    sctx.fillStyle = grad;
    sctx.fillRect(0, 0, 64, 64);
    const sunTex = new THREE.CanvasTexture(sunCanvas);
    const sunSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: sunTex, transparent: true, depthWrite: false }));
    sunSprite.scale.set(20, 20, 1);
    sunSprite.position.set(80, 120, -60);
    scene.add(sunSprite);

    // instanced clouds (low-poly)
    const cloudGeo = new THREE.SphereGeometry(6, 6, 4);
    const cloudMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.85, fog: false });
    const cloudCount = 10;
    const clouds = new THREE.InstancedMesh(cloudGeo, cloudMat, cloudCount);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < cloudCount; i++) {
      dummy.position.set((Math.random() - 0.5) * 200, 60 + Math.random() * 40, (Math.random() - 0.5) * 200);
      dummy.scale.set(2 + Math.random() * 3, 0.6 + Math.random() * 0.6, 2 + Math.random() * 3);
      dummy.updateMatrix();
      clouds.setMatrixAt(i, dummy.matrix);
    }
    clouds.instanceMatrix.needsUpdate = true;
    scene.add(clouds);

    const waterUniforms = { uTime: { value: 0 } };
    const waterMat = new THREE.MeshLambertMaterial({ color: 0x6EC6E8, transparent: true, opacity: 0.62, flatShading: true });
    waterMat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = waterUniforms.uTime;
      shader.vertexShader = 'uniform float uTime;\nvarying vec2 vWUv;\n' + shader.vertexShader.replace(
        '#include <begin_vertex>',
        '#include <begin_vertex>\nvec4 wp = modelMatrix * vec4(transformed, 1.0);\nvWUv = wp.xz;\nfloat w1 = sin(wp.x * 0.18 + uTime * 0.9) * 0.08;\nfloat w2 = sin(wp.z * 0.22 + uTime * 1.1) * 0.06;\ntransformed.y += w1 + w2;'
      );
      shader.fragmentShader = 'uniform float uTime;\nvarying vec2 vWUv;\n' + shader.fragmentShader.replace(
        '#include <dithering_fragment>',
        'float dx = max(abs(vWUv.x) - 22.0, 0.0);\nfloat dz = max(max(vWUv.y - 14.0, -78.0 - vWUv.y), 0.0);\nfloat shore = sqrt(dx*dx + dz*dz);\nfloat foam = smoothstep(5.5, 1.2, shore) * (0.5 + 0.5*sin(vWUv.x*0.7 + vWUv.y*0.6 + uTime*1.6));\ngl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.95, 0.98, 1.0), foam * 0.35);\ngl_FragColor.rgb += vec3(0.05,0.08,0.10) * (0.5 + 0.5*sin(vWUv.x*0.35 + uTime*0.5));\n#include <dithering_fragment>'
      );
    };
    waterMat.customProgramCacheKey = () => 'la-water';
    const water = new THREE.Mesh(new THREE.PlaneGeometry(96, 160, 48, 80), waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.y = -0.05;
    water.position.z = -32;
    water.userData.uniforms = waterUniforms;
    scene.add(water);

    const galleryRoot = new THREE.Group();
    scene.add(galleryRoot);
    const sheetRoot = new THREE.Group();
    sheetRoot.visible = false;
    scene.add(sheetRoot);

    function buildSheet(name, frames) {
      while (sheetRoot.children.length) sheetRoot.remove(sheetRoot.children[0]);
      const n = Math.max(1, frames | 0);
      const spacing = 1.6;
      const startX = -((n - 1) * spacing) / 2;
      for (let i = 0; i < n; i++) {
        const t = n === 1 ? 0 : i / (n - 1);
        const g = new THREE.Group();
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.0, 0.6), new THREE.MeshLambertMaterial({ color: 0x88ccee }));
        body.position.y = 0.5 + Math.sin(t * Math.PI) * 0.2;
        g.add(body);
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 10), new THREE.MeshLambertMaterial({ color: 0xffe0bd }));
        head.position.y = 1.15 + Math.sin(t * Math.PI) * 0.2;
        g.add(head);
        g.position.x = startX + i * spacing;
        g.userData.t = t;
        sheetRoot.add(g);
      }
      sheetRoot.visible = true;
      galleryRoot.visible = false;
      heroMesh.visible = false;
      camera.position.set(0, 2.5, 6 + n * 0.4);
      camera.lookAt(0, 0.8, 0);
    }

    // Particle pool
    const partCount = cfg.budget.particleCap;
    const partGeo = new THREE.BufferGeometry();
    const partPos = new Float32Array(partCount * 3);
    const partCol = new Float32Array(partCount * 3);
    partGeo.setAttribute('position', new THREE.BufferAttribute(partPos, 3));
    partGeo.setAttribute('color', new THREE.BufferAttribute(partCol, 3));
    const partAtlas = (window.little_adventureFx && window.little_adventureFx.makeAtlas) ? window.little_adventureFx.makeAtlas(THREE) : null;
    const partMat = new THREE.PointsMaterial({ size: 0.28, map: partAtlas || undefined, vertexColors: true, transparent: true, opacity: 0.95, depthWrite: false, sizeAttenuation: true, alphaTest: 0.02 });
    const partPoints = new THREE.Points(partGeo, partMat);
    scene.add(partPoints);
    const particles = [];
    for (let i = 0; i < partCount; i++) particles.push({ alive: false, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, life: 0, color: 0xFFD23F });

    // Beacon + arrow (Q-20 readability)
    const beacon = new THREE.Group();
    const beaconRay = new THREE.Mesh(new THREE.ConeGeometry(1.2, 7, 16, 1, true), new THREE.MeshBasicMaterial({ color: 0xFFE89A, transparent: true, opacity: 0.12, side: THREE.DoubleSide, depthWrite: false }));
    beaconRay.position.y = 3.5;
    const beaconBase = new THREE.Mesh(new THREE.RingGeometry(0.35, 0.7, 24), new THREE.MeshBasicMaterial({ color: 0xFFD23F, transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false }));
    beaconBase.rotation.x = -Math.PI / 2;
    beaconBase.position.y = 0.05;
    beacon.add(beaconRay); beacon.add(beaconBase);
    scene.add(beacon);
    const arrow = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const ch = new THREE.Mesh(new THREE.RingGeometry(0.18, 0.28, 3, 1, Math.PI * 0.75, Math.PI * 0.5), new THREE.MeshBasicMaterial({ color: 0xFFD23F, transparent: true, opacity: 0.85 - i * 0.2, side: THREE.DoubleSide, depthWrite: false }));
      ch.rotation.x = -Math.PI / 2;
      ch.position.z = -i * 0.32;
      arrow.add(ch);
    }
    scene.add(arrow);
    const aimRing = new THREE.Mesh(new THREE.RingGeometry(0.75, 0.92, 32), new THREE.MeshBasicMaterial({ color: 0xFF6B6B, transparent: true, opacity: 0.0, side: THREE.DoubleSide, depthWrite: false }));
    aimRing.rotation.x = -Math.PI / 2; aimRing.position.y = 0.04; scene.add(aimRing);
    let lastProgressT = 0;
    let ambientAcc = 0;

    const camera = new THREE.PerspectiveCamera(cfg.camera.fov, window.innerWidth / window.innerHeight, 0.1, 1000);
    const off = cfg.camera.offset;
    camera.position.set(0, off[1], off[2]);
    camera.lookAt(0, 0.6, 0);

    let game = null;
    let paused = false;
    let currentPhoto = null;
    let currentSheet = null;
    let camNudge = null; // Q-15: {x,z,tLeft}
    let soundOn = true;
    // Save helpers (IS-15)
    const SAVE_KEY = 'little_adventureSave';
    function loadSave() {
      try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return null;
        const obj = JSON.parse(raw);
        return logic.validateSave ? logic.validateSave(obj, cfg) : obj;
      } catch (e) { return null; }
    }
    function saveNow() {
      if (!game) return;
      try { localStorage.setItem(SAVE_KEY, JSON.stringify(game.save())); } catch (e) {}
    }
    function playSfx(name) {
      if (!soundOn || !window.audioBuses) return;
      const A = window.little_adventureAudio;
      const recipe = A && A.SFX ? A.SFX[name] : null;
      if (!recipe) return;
      const pv = recipe.pitchVar || 0;
      const jitter = pv ? (1 + (Math.random() * 2 - 1) * pv) : 1;
      for (const l of recipe.layers) {
        if (l.type === 'tone' && window.audioBuses.playSweep) {
          window.audioBuses.playSweep('sfx', (l.f0 || 440) * jitter, (l.f1 || l.f0 || 440) * jitter, l.dur, 'sine', l.gain || 0.1, 0);
        } else if (l.type === 'noise' && window.audioBuses.playTone) {
          window.audioBuses.playTone('sfx', 180 * jitter, l.dur || 0.05, 'triangle', (l.gain || 0.05) * 0.6, 0);
        }
      }
      if (name === 'befriend' && window.audioBuses.playSweep) {
        window.audioBuses.playSweep('sfx', 880, 1320, 0.18, 'sine', 0.08, 0.05);
      }
      if (name === 'complete' && window.audioBuses.playSweep) {
        [523, 659, 784, 1047].forEach((f, i) => window.audioBuses.playSweep('sfx', f, f * 1.5, 0.2, 'sine', 0.07, i * 0.08));
      }
    }
    const input = { sx: 0, sy: 0, swing: false, shield: false };
    let keyX = 0, keyY = 0;
    let forceSlow = false;
    let lastFrame = performance.now();
    let frameMs = 16;
    let dpr = renderer.getPixelRatio();
    let tier = 'high';
    let tierStepped = false;
    const TIERS = (window.little_adventureFx && window.little_adventureFx.TIERS) || { high: { dprCap: 1.5, particles: 250 }, medium: { dprCap: 1.25, particles: 120 }, low: { dprCap: 1.0, particles: 40 } };
    const shadowActors = [];
    function applyShadowTier(t) {
      const heroOn = t === 'medium' || t === 'high';
      const actorsOn = t === 'high';
      dir.castShadow = heroOn;
      const hm = window.__laHeroMesh;
      if (hm) hm.traverse((o) => { if (o.isMesh) o.castShadow = heroOn; });
      for (const m of shadowActors) { if (m && m.traverse) m.traverse((o) => { if (o.isMesh) o.castShadow = actorsOn; }); }
      for (const b of blobShadows) { if (b.mesh) b.mesh.visible = !heroOn; }
    }
    function applyTier(next) {
      if (!TIERS[next]) return;
      tier = next;
      const cap = TIERS[tier].dprCap || 1.0;
      const target = Math.min(window.devicePixelRatio || 1, cfg.budget.dprMax, cap);
      if (target < dpr) { dpr = target; renderer.setPixelRatio(dpr); }
      applyShadowTier(tier);
    }
    let rafId = 0;

    // --- Actor storage ---
    const grumpyMeshes = {};   // id -> mesh
    const itemMeshes = {};     // id -> mesh
    const chestMeshes = {};    // id -> {mesh, lid}
    const gateMeshes = {};     // id -> mesh
    const bushMeshes = {};     // id -> mesh
    const pedestalMeshes = {}; // id -> {mesh, ring}
    let owlMesh = null;
    let statueMesh = null;
    let lighthouseMesh = null;
    let lighthouseLight = null;
    const bridgeSegments = [];
    const acornMeshes = [];
    const blobShadows = [];

    function addBlobShadow(m) {
      const sh = models.makeBlobShadow();
      scene.add(sh);
      blobShadows.push({ mesh: sh, target: m });
    }

    let startOverlay = null;
    let dragHint = null;
    let hideDragHint = () => {};
    let maybeShowDragHint = () => {};
    if (gallery) {
      const items = [
        models.makeHero(), models.makeOwl(), models.makeGrumpy('normal'), models.makeGrumpy('normal'),
        models.makeGrumpy('guard'), models.makeGrumpy('boss'), models.makeKey(),
        models.makeGem('red'), models.makeGem('green'), models.makeGem('blue'),
        models.makeChest(), models.makeGate(), models.makePedestal('red'),
        models.makePedestal('green'), models.makePedestal('blue'), models.makeStatue(),
        models.makeAcorn(), models.makeLighthouse(), models.makeBridgeSegment(0),
        models.makeTree(), models.makeBush(), models.makeRock(), models.makeFlower(),
        models.makeBlobShadow()
      ];
      let x = -items.length * 1.2;
      items.forEach((m) => {
        m.position.set(x, 0, 0);
        galleryRoot.add(m);
        x += 2.4;
      });
      camera.position.set(0, 8, 18);
      camera.lookAt(0, 1, 0);
    } else {
      // World dressing
      const rng = mulberry32(12345);
      const forbidden = [];
      function addForbidden(x, z, r) { forbidden.push({ x, z, r: r + 1.5 }); }
      (cfg.obstacles || []).forEach((o) => addForbidden(o.x, o.z, o.r));
      (cfg.gates || []).forEach((g) => addForbidden(g.pos[0], g.pos[1], 1));
      (cfg.chests || []).forEach((c) => addForbidden(c.pos[0], c.pos[1], 1));
      (cfg.pedestals || []).forEach((p) => addForbidden(p.pos[0], p.pos[1], 0.6));
      (cfg.bushes || []).forEach((b) => addForbidden(b.pos[0], b.pos[1], 0.6));

      function collectPositions(count) {
        const positions = [];
        const rotations = [];
        let tries = 0;
        while (positions.length < count && tries < count * 20) {
          tries++;
          const x = (rng() * 44) - 22;
          const z = (rng() * 90) - 76;
          if (Math.abs(x) < 3) continue;
          let ok = true;
          for (const f of forbidden) {
            if (Math.hypot(x - f.x, z - f.z) < f.r) { ok = false; break; }
          }
          if (!ok) continue;
          positions.push({ x, z });
          rotations.push(rng() * Math.PI * 2);
        }
        return { positions, rotations };
      }

      function makeInstanced(geometry, material, placement, y) {
        const mesh = new THREE.InstancedMesh(geometry, material, placement.positions.length);
        const dummy = new THREE.Object3D();
        placement.positions.forEach((p, i) => {
          dummy.position.set(p.x, y, p.z);
          dummy.rotation.y = placement.rotations[i];
          dummy.updateMatrix();
          mesh.setMatrixAt(i, dummy.matrix);
        });
        mesh.count = placement.positions.length;
        mesh.instanceMatrix.needsUpdate = true;
        return mesh;
      }

      const treePlacement = collectPositions(60);
      const mToon = (c) => mats ? mats.toon(c, { flat: true }) : new THREE.MeshLambertMaterial({ color: c, flatShading: true });
      const treeTrunk = makeInstanced(new THREE.CylinderGeometry(0.12, 0.18, 0.9, 6), mToon(0xA66B3A), treePlacement, 0.45);
      const treeCrown = makeInstanced(new THREE.ConeGeometry(0.7, 1.4, 8), mToon(0x2E7D32), treePlacement, 1.6);
      scene.add(treeTrunk);
      scene.add(treeCrown);

      const tuftPlacement = collectPositions(120);
      const tuftMesh = makeInstanced(new THREE.IcosahedronGeometry(0.5, 0), mToon(0x6FB35A), tuftPlacement, 0.35);
      scene.add(tuftMesh);

      const flowerPlacement = collectPositions(80);
      const flowerMesh = makeInstanced(new THREE.SphereGeometry(0.12, 6, 4), mToon(0xFFD23F), flowerPlacement, 0.3);
      scene.add(flowerMesh);

      const rockPlacement = collectPositions(30);
      const rockMesh = makeInstanced(new THREE.DodecahedronGeometry(0.4, 0), mToon(0x9AA0A6), rockPlacement, 0.2);
      scene.add(rockMesh);

      // Static structures + actor refs
      (cfg.gates || []).forEach((g) => {
        const m = models.makeGate();
        m.position.set(g.pos[0], hAt(g.pos[0], g.pos[1]), g.pos[1]);
        scene.add(m);
        gateMeshes[g.id] = m;
        shadowActors.push(m);
      });
      const owlCfg = (cfg.npcs || [])[0];
      if (owlCfg) {
        owlMesh = models.makeOwl();
        shadowActors.push(owlMesh);
        owlMesh.position.set(owlCfg.pos[0], hAt(owlCfg.pos[0], owlCfg.pos[1]), owlCfg.pos[1]);
        scene.add(owlMesh);
      }
      (cfg.statues || []).forEach((s) => {
        statueMesh = models.makeStatue();
        shadowActors.push(statueMesh);
        statueMesh.position.set(s.pos[0], hAt(s.pos[0], s.pos[1]), s.pos[1]);
        scene.add(statueMesh);
      });
      (cfg.chests || []).forEach((c) => {
        const m = models.makeChest();
        m.position.set(c.pos[0], hAt(c.pos[0], c.pos[1]), c.pos[1]);
        scene.add(m);
        let lid = null;
        m.traverse((o) => { if (o.name === 'lid') lid = o; });
        chestMeshes[c.id] = { mesh: m, lid };
        shadowActors.push(m);
      });
      (cfg.pedestals || []).forEach((p) => {
        const m = models.makePedestal(p.id);
        m.position.set(p.pos[0], hAt(p.pos[0], p.pos[1]), p.pos[1]);
        scene.add(m);
        let ring = null;
        m.traverse((o) => { if (o.isMesh && o.geometry && o.geometry.type === 'TorusGeometry') ring = o; });
        pedestalMeshes[p.id] = { mesh: m, ring };
        shadowActors.push(m);
      });
      if (cfg.lighthouse) {
        lighthouseMesh = models.makeLighthouse();
        shadowActors.push(lighthouseMesh);
        lighthouseMesh.position.set(cfg.lighthouse.pos[0], hAt(cfg.lighthouse.pos[0], cfg.lighthouse.pos[1]), cfg.lighthouse.pos[1]);
        scene.add(lighthouseMesh);
        lighthouseLight = lighthouseMesh.children[lighthouseMesh.children.length - 1];
      }
      (cfg.bushes || []).forEach((b) => {
        const m = models.makeBush();
        m.position.set(b.pos[0], hAt(b.pos[0], b.pos[1]), b.pos[1]);
        scene.add(m);
        bushMeshes[b.id] = m;
        shadowActors.push(m);
      });

      // Bridge segments
      if (cfg.bridge) {
        const from = cfg.bridge.from, to = cfg.bridge.to;
        const segCount = 6;
        for (let i = 0; i < segCount; i++) {
          const t = i / (segCount - 1);
          const m = models.makeBridgeSegment(i);
          m.position.set(from[0] + (to[0] - from[0]) * t, -2, from[1] + (to[1] - from[1]) * t);
          scene.add(m);
          bridgeSegments.push(m);
        }
      }

      // Grumpies
      (cfg.grumpies || []).forEach((g) => {
        const m = models.makeGrumpy(g.role);
        m.position.set(g.home[0], hAt(g.home[0], g.home[1]), g.home[1]);
        scene.add(m);
        grumpyMeshes[g.id] = m;
        shadowActors.push(m);
        addBlobShadow(m);
      });

      // Items
      (cfg.items || []).forEach((it) => {
        const m = it.kind === 'key' ? models.makeKey() : models.makeGem(it.color);
        m.visible = false;
        scene.add(m);
        itemMeshes[it.id] = m;
      });

      // Acorn pool
      for (let i = 0; i < 12; i++) {
        const m = models.makeAcorn();
        m.visible = false;
        scene.add(m);
        acornMeshes.push(m);
      }

      // Hero
      game = logic.createGame(cfg, 7);
      const heroMesh = models.makeHero();
      heroMesh.traverse((o) => { if (o.isMesh) { o.castShadow = true; } });
      scene.add(heroMesh);
      window.__laHeroMesh = heroMesh;
      window.__laModels = models;
      addBlobShadow(heroMesh);
      applyShadowTier(tier);

      paused = true;
      // (Save helpers moved to top-level scope for updateActors access)
      // Sound toggle (Q-16, separate key to avoid logic.js validateSave contract change)
      const SOUND_KEY = 'little_adventureSound';
      const soundBtn = document.getElementById('i3d-sound-btn');
      soundOn = true;
      try { soundOn = localStorage.getItem(SOUND_KEY) !== '0'; } catch (e) { soundOn = true; }
      function applySound(on) {
        soundOn = !!on;
        if (window.audioBuses && window.audioBuses.setBus) {
          window.audioBuses.setBus('master', soundOn ? 1 : 0, 0);
        }
        if (soundBtn) {
          soundBtn.setAttribute('aria-pressed', soundOn ? 'true' : 'false');
          soundBtn.style.opacity = soundOn ? '1' : '0.55';
          soundBtn.innerHTML = soundOn
            ? '<svg view="0 0 24 24" width="1em" height="1em" aria-hidden="true"><path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0014 8.97v6.02A4.47 4.47 0 0016.5 12zM14 3.23v2.06a6.5 6.5 0 010 13.42v2.06a8.5 8.5 0 000-17.54z"/></svg>'
            : '<svg view="0 0 24 24" width="1em" height="1em" aria-hidden="true"><path fill="currentColor" d="M16.5 12A4.5 4.5 0 0014 8.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0021 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 003.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>';
        }
        try { localStorage.setItem(SOUND_KEY, soundOn ? '1' : '0'); } catch (e) {}
      }
      applySound(soundOn);
      if (soundBtn) soundBtn.addEventListener('click', () => applySound(!soundOn));

      // Q-16 thin music/ambient/footstep player (no-gate slice; full polish later)
      const ZONE_LETTERS = ['A', 'B', 'C'];
      let musicZone = 'A';
      let musicClock = 0;
      let musicIdx = 0;
      let musicEvents = [];
      let footstepClock = 0;
      let ambientClock = 0;
      function rebuildMusic(zone) {
        const A = window.little_adventureAudio;
        musicZone = zone;
        musicClock = 0;
        musicIdx = 0;
        musicEvents = (A && A.sequencer) ? A.sequencer(zone, 4, 7) : [];
      }
      rebuildMusic('A');
      tickAudio = function(dtSec, heroMoving, zoneIdx) {
        if (!soundOn || !window.audioBuses || paused || document.hidden) return;
        const A = window.little_adventureAudio;
        const zone = ZONE_LETTERS[Math.max(0, Math.min(2, zoneIdx | 0))] || 'A';
        if (zone !== musicZone) {
          // Q-16: crossfade 2s on zone change (simple bus gain ramp)
          if (window.audioBuses.setBus) window.audioBuses.setBus('music', 0.001, 300);
          rebuildMusic(zone);
          if (window.audioBuses.setBus) window.audioBuses.setBus('music', 1, 2000);
        }
        musicClock += dtSec;
        while (musicIdx < musicEvents.length && musicEvents[musicIdx].time <= musicClock) {
          const ev = musicEvents[musicIdx++];
          if (window.audioBuses.playTone) window.audioBuses.playTone(ev.bus || 'music', ev.freq, ev.dur, 'sine', ev.gain || 0.06, 0);
        }
        if (musicEvents.length && musicClock >= (musicEvents[musicEvents.length - 1].time + 2)) {
          rebuildMusic(zone); // loop
        }
        footstepClock -= dtSec;
        if (heroMoving && footstepClock <= 0) {
          footstepClock = 0.38;
          playSfx('footstep');
        }
        ambientClock -= dtSec;
        if (ambientClock <= 0) {
          ambientClock = 4.5 + Math.random() * 3.5;
          const amb = A && A.AMBIENT ? A.AMBIENT[zone] : null;
          if (amb && window.audioBuses.playTone) {
            const f = zone === 'B' ? 220 : zone === 'C' ? 330 : 180;
            window.audioBuses.playTone('music', f, 0.6, 'sine', (amb.gain || 0.05) * 0.5, 0);
          }
        }
      }

      // milestone events -> save
      const _origDrain = game.drainEvents.bind(game);
      // wrap drainEvents to trigger saves
      const origStepGame = stepGame;
      // We'll handle save in updateActors via event drain.

      // Start overlay
      startOverlay = document.getElementById('i3d-start');
      const btnContinue = document.getElementById('i3d-btn-continue');
      const btnNew = document.getElementById('i3d-btn-new');
      dragHint = document.getElementById('i3d-drag-hint');
      const DRAG_HINT_KEY = 'little_adventureDragHintSeen';
      let dragHintTimer = null;
      hideDragHint = function(markSeen) {
        if (dragHint) dragHint.style.display = 'none';
        if (dragHintTimer) { clearTimeout(dragHintTimer); dragHintTimer = null; }
        if (markSeen) { try { localStorage.setItem(DRAG_HINT_KEY, '1'); } catch (e) {} }
      };
      maybeShowDragHint = function() {
        let seen = false;
        try { seen = localStorage.getItem(DRAG_HINT_KEY) === '1'; } catch (e) { seen = false; }
        if (seen || !dragHint) return;
        dragHint.style.display = 'block';
        dragHintTimer = setTimeout(() => hideDragHint(true), 5000);
      };
      const saved = loadSave();
      if (saved) { btnContinue.style.display = 'block'; }
      btnNew.addEventListener('click', () => {
        try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
        game = logic.createGame(cfg, 7);
        if (startOverlay) startOverlay.style.display = 'none';
        paused = false;
        maybeShowDragHint();
      });
      btnContinue.addEventListener('click', () => {
        if (saved && game) { game.load(saved); }
        if (startOverlay) startOverlay.style.display = 'none';
        paused = false;
        maybeShowDragHint();
      });
      // if no save, hide continue already

      // Input wiring (IS-11)
      const stickZone = document.getElementById('i3d-stick-zone');
      const stickBase = document.getElementById('i3d-stick-base');
      const stickKnob = document.getElementById('i3d-stick-knob');
      let stickOrigin = null;
      const vmin = Math.min(window.innerWidth, window.innerHeight);
      const radiusPx = Math.min(Math.max(cfg.stick.radiusVmin * vmin / 100, cfg.stick.minPx), cfg.stick.maxPx);
      window.pointerDrag(stickZone, {
        down(e) {
          stickOrigin = { x: e.clientX, y: e.clientY };
          stickBase.style.display = 'block';
          stickBase.style.left = e.clientX + 'px';
          stickBase.style.top = e.clientY + 'px';
          stickKnob.style.display = 'block';
          stickKnob.style.left = e.clientX + 'px';
          stickKnob.style.top = e.clientY + 'px';
        },
        move(e) {
          if (!stickOrigin) return;
          const dx = e.clientX - stickOrigin.x;
          const dy = e.clientY - stickOrigin.y;
          const v = logic.stickVector(dx, dy, radiusPx, cfg.stick.deadzone);
          input.sx = v.x; input.sy = v.y;
          stickKnob.style.left = (stickOrigin.x + v.x * radiusPx) + 'px';
          stickKnob.style.top = (stickOrigin.y + v.y * radiusPx) + 'px';
        },
        up() {
          stickOrigin = null;
          input.sx = 0; input.sy = 0;
          stickBase.style.display = 'none';
          stickKnob.style.display = 'none';
        },
        cancel() {
          stickOrigin = null;
          input.sx = 0; input.sy = 0;
          stickBase.style.display = 'none';
          stickKnob.style.display = 'none';
        }
      });

      const swordBtn = document.getElementById('i3d-btn-sword');
      const shieldBtn = document.getElementById('i3d-btn-shield');
      window.pointerDrag(swordBtn, {
        down() { input.swing = true; },
        up() {},
        cancel() {}
      });
      window.pointerDrag(shieldBtn, {
        down() { input.shield = true; },
        up() { input.shield = false; },
        cancel() { input.shield = false; }
      });

      const keyMap = { ArrowUp: [0,-1], ArrowDown: [0,1], ArrowLeft: [-1,0], ArrowRight: [1,0],
        w: [0,-1], s: [0,1], a: [-1,0], d: [1,0], W: [0,-1], S: [0,1], A: [-1,0], D: [1,0] };
      const keysDown = new Set();
      function updateKeys() {
        keyX = 0; keyY = 0;
        for (const k of keysDown) {
          const v = keyMap[k];
          if (v) { keyX += v[0]; keyY += v[1]; }
        }
        const m = Math.hypot(keyX, keyY);
        if (m > 1) { keyX /= m; keyY /= m; }
      }
      window.addEventListener('keydown', (e) => {
        if (keyMap[e.key]) { keysDown.add(e.key); updateKeys(); e.preventDefault(); }
      });
      window.addEventListener('keyup', (e) => {
        if (keysDown.has(e.key)) { keysDown.delete(e.key); updateKeys(); }
      });
    }

    function updateActors() {
      if (gallery || !game) return;
      const s = game.state();
      const heroMesh = window.__laHeroMesh;

      // drain events
      const evs = game.drainEvents();
      let progress = false;
      for (const ev of evs) {
        if (['pickup','befriend','gateOpen','chestOpen','bushCut','pedestalFill'].indexOf(ev.type) !== -1) progress = true;
        // save on milestones
        if (['gateOpen','chestOpen','bushCut','pedestalFill','complete','befriend'].indexOf(ev.type) !== -1) saveNow();
        playSfx(ev.type);
        // Q-15: reveal nudge on gateOpen/bridgeUp
        if (!reducedMotion && (ev.type === 'gateOpen' || ev.type === 'bridgeUp')) {
          let nx = s.hero.x, nz = s.hero.z;
          if (ev.type === 'gateOpen' && ev.gateId && cfg.gates) {
            const g = cfg.gates.find((x) => x.id === ev.gateId);
            if (g && g.pos) { nx = g.pos[0]; nz = g.pos[1]; }
          } else if (ev.type === 'bridgeUp' && cfg.bridge && cfg.bridge.to) {
            nx = cfg.bridge.to[0]; nz = cfg.bridge.to[1];
          }
          camNudge = { x: nx, z: nz, tLeft: 1.2 };
        }
        // speech
        const speechMap = { befriend:'befriend', bushCut:'gem', chestOpen:'key', gateOpen:'gateOpen', pedestalFill:'gem', complete:'complete', owlTalk: ev.line };
        const key = ev.type === 'owlTalk' ? ev.line : speechMap[ev.type];
        if (key && cfg.speech && cfg.speech[key]) {
          const lastSp = window.__laLastSpeech;
          const nowSp = s.t;
          if (!(lastSp && lastSp.key === key && (nowSp - lastSp.time) < 4000)) {
            const txt = cfg.speech[key];
            if (window.audioBuses && window.audioBuses.speakWithDuck) window.audioBuses.speakWithDuck(txt);
            else if (window.speech && window.speech.speak) window.speech.speak(txt);
            const ann = document.getElementById('i3d-announcer');
            if (ann) ann.textContent = txt;
            window.__laLastSpeech = { key, time: nowSp };
          }
        }
        // particles (Q-14: EVENT_TABLE driven)
        const fxDef = (window.little_adventureFx && window.little_adventureFx.EVENT_TABLE) ? window.little_adventureFx.EVENT_TABLE[ev.type] : null;
        const pType = fxDef && fxDef.particles ? fxDef.particles : null;
        const pCfg = (window.little_adventureFx && window.little_adventureFx.PARTICLES && pType) ? window.little_adventureFx.PARTICLES[pType] : null;
        if (pCfg) {
          const burst = Math.min(window.REDUCED_MOTION ? cfg.budget.burstReduced : (pCfg.count || cfg.budget.burst), tier === 'low' ? 8 : tier === 'medium' ? 14 : (pCfg.count || cfg.budget.burst));
          let px = s.hero.x, pz = s.hero.z;
          if (ev.type === 'befriend') { const g = s.grumpies.find((gg)=>gg.id===ev.id); if (g) { px = g.x; pz = g.z; } }
          else if (ev.type === 'bushCut') { const b = cfg.bushes.find((bb)=>bb.id===ev.id); if (b) { px = b.pos[0]; pz = b.pos[1]; } }
          else if (ev.type === 'pedestalFill') { const pd = cfg.pedestals.find((pp)=>pp.id===ev.id); if (pd) { px = pd.pos[0]; pz = pd.pos[1]; } }
          else if (ev.type === 'chestOpen') { const c = cfg.chests.find((cc)=>cc.id===ev.id); if (c) { px = c.pos[0]; pz = c.pos[1]; } }
          else if (ev.type === 'gateOpen') { const g2 = cfg.gates.find((gg)=>gg.id===ev.gateId); if (g2 && g2.pos) { px = g2.pos[0]; pz = g2.pos[1]; } }
          let n = 0;
          for (const p of particles) {
            if (n >= burst) break;
            if (!p.alive) {
              p.alive = true; p.x = px; p.y = 0.5; p.z = pz;
              const sp = pCfg.spread || 1;
              p.vx = (Math.random() - 0.5) * 4 * sp; p.vy = (pCfg.vy || 1.5) * (0.7 + Math.random() * 0.6); p.vz = (Math.random() - 0.5) * 4 * sp;
              p.life = (pCfg.life || 0.8) * 1000; p.color = pCfg.color || 0xFFD23F;
              n++;
            }
          }
        }
      }
      if (progress) lastProgressT = s.t;

      // Q-14 ambient life (tier-gated, reduced-motion scaled)
      ambientAcc += frameMs;
      const ambientEvery = reducedMotion ? 900 : 450;
      if (ambientAcc >= ambientEvery) {
        ambientAcc = 0;
        const ambCap = tier === 'low' ? 0 : (tier === 'medium' ? 1 : 2);
        const zoneIdx = (s.hero.z > (cfg.zones[0].z1)) ? 0 : (s.hero.z > (cfg.zones[1].z1) ? 1 : 2);
        const ambColor = [0xFFF176, 0xFFB74D, 0x8EC5FF][zoneIdx] || 0xFFF176;
        const ambCount = reducedMotion ? Math.max(1, ambCap) : ambCap;
        for (let a = 0; a < ambCount; a++) {
          for (const p of particles) {
            if (p.alive) continue;
            p.alive = true;
            p.x = s.hero.x + (Math.random() - 0.5) * 10;
            p.y = 0.5 + Math.random() * 2.5;
            p.z = s.hero.z + (Math.random() - 0.5) * 10;
            p.vx = (Math.random() - 0.5) * 0.4; p.vy = 0.15 + Math.random() * 0.25; p.vz = (Math.random() - 0.5) * 0.4;
            p.life = 1800 + Math.random() * 1200; p.color = ambColor;
            break;
          }
        }
      }

      // sword anim
      if (heroMesh) {
        const armR = heroMesh.getObjectByName('armR');
        if (armR) {
          if (s.hero.swingT > 0) {
            const frac = 1 - s.hero.swingT / cfg.sword.swingMs;
            armR.rotation.x = -Math.PI / 2 + frac * (Math.PI * 110 / 180);
          } else {
            armR.rotation.x = 0;
          }
        }
        const shield = heroMesh.getObjectByName('shield');
        if (shield) {
          shield.position.y = s.hero.shield ? 0.9 : 0.6;
          shield.rotation.x = s.hero.shield ? 0 : 0;
        }
      }

      // beacon + arrow (Q-20 readability)
      const obj = game.nextObjective();
      if (obj) {
        beacon.visible = true;
        beacon.position.set(obj.x, 0, obj.z);
        beaconRay.material.opacity = 0.10 + 0.04 * Math.sin(s.t * 0.003);
        beaconBase.scale.setScalar(1 + 0.12 * Math.sin(s.t * 0.004));
        if (Math.random() < (reducedMotion ? 0.01 : 0.04)) {
          particles.push({ x: obj.x + (Math.random()-0.5)*0.6, y: 0.2, z: obj.z + (Math.random()-0.5)*0.6, vx: (Math.random()-0.5)*0.3, vy: 0.6 + Math.random()*0.5, vz: (Math.random()-0.5)*0.3, life: 1200, color: 0xFFE89A, size: 0.08 });
        }
      } else {
        beacon.visible = false;
      }
      if (obj && s.t - lastProgressT > 6000) {
        arrow.visible = true;
        const dx = obj.x - s.hero.x, dz = obj.z - s.hero.z;
        const len = Math.hypot(dx, dz) || 1;
        const ux = dx / len, uz = dz / len;
        const baseD = Math.min(2.2, Math.max(1.2, len * 0.25));
        arrow.position.set(s.hero.x + ux * baseD, 0.03, s.hero.z + uz * baseD);
        arrow.rotation.y = Math.atan2(ux, uz);
        arrow.children.forEach((ch, i) => { ch.material.opacity = 0.85 - i * 0.2 + 0.1 * Math.sin(s.t * 0.008 - i * 0.6); });
      } else {
        arrow.visible = false;
      }
      // Q-20 aim-assist target ring
      let aimTarget = null, aimDist = 1e9;
      (s.grumpies || []).forEach((g) => {
        if (g.state === 'happy' || (g.respawnTimer && g.respawnTimer > 0)) return;
        const d = Math.hypot(g.x - s.hero.x, g.z - s.hero.z);
        if (d < 3.2 && d < aimDist) { aimDist = d; aimTarget = g; }
      });
      if (aimTarget) { aimRing.visible = true; aimRing.position.set(aimTarget.x, 0.04, aimTarget.z); aimRing.material.opacity = 0.35 + 0.15 * Math.sin(s.t * 0.01); }
      else { aimRing.visible = false; aimRing.material.opacity = 0; }

      // particles update
      const dtSec = frameMs / 1000;
      for (const p of particles) {
        if (!p.alive) continue;
        p.x += p.vx * dtSec; p.y += p.vy * dtSec; p.z += p.vz * dtSec;
        p.vy -= 9.8 * dtSec;
        p.life -= frameMs;
        if (p.life <= 0) p.alive = false;
      }
      let pi = 0;
      for (const p of particles) {
        if (p.alive && pi < partCount) {
          partPos[pi*3] = p.x; partPos[pi*3+1] = p.y; partPos[pi*3+2] = p.z;
          const c = new THREE.Color(p.color);
          partCol[pi*3] = c.r; partCol[pi*3+1] = c.g; partCol[pi*3+2] = c.b;
          pi++;
        }
      }
      for (let i = pi; i < partCount; i++) { partPos[i*3+1] = -1000; }
      partGeo.attributes.position.needsUpdate = true;
      partGeo.attributes.color.needsUpdate = true;

      if (heroMesh) {
        heroMesh.position.set(s.hero.x, hAt(s.hero.x, s.hero.z), s.hero.z);
        heroMesh.rotation.y = -s.hero.facing + Math.PI / 2;
      }

      // grumpies
      s.grumpies.forEach((g) => {
        const m = grumpyMeshes[g.id];
        if (!m) return;
        m.position.set(g.x, hAt(g.x, g.z), g.z);
        const happy = g.state === 'happy';
        if (m.children.length && m.children[0].isMesh && m.children[0].material && m.children[0].material.color) {
          m.children[0].material.color.setHex(happy ? 0xFFD86B : 0xC06C84);
        }
        m.traverse((o) => {
          if (o.name === 'smile') o.visible = happy;
          if (o.name === 'eyebrows') o.visible = !happy;
        });
      });

      // items
      for (const id in s.items) {
        const it = s.items[id];
        const m = itemMeshes[id];
        if (!m) continue;
        if (it.state === 'world') {
          m.visible = true;
          m.position.set(it.x, hAt(it.x, it.z) + 0.8 + Math.sin(s.t * 0.003 + id.charCodeAt(0)) * 0.15, it.z);
          m.rotation.y += 0.02;
        } else if (it.state === 'carried') {
          m.visible = true;
          const idx = s.carry.indexOf(id);
          const ang = (idx / Math.max(1, s.carry.length)) * Math.PI - Math.PI / 2;
          m.position.set(s.hero.x + Math.cos(ang) * 1.2, hAt(s.hero.x, s.hero.z) + 0.9, s.hero.z + Math.sin(ang) * 1.2);
        } else {
          m.visible = false;
        }
      }

      // chests
      for (const id in s.chests) {
        const c = chestMeshes[id];
        if (!c || !c.lid) continue;
        c.lid.rotation.x = s.chests[id].open ? -Math.PI / 2 : 0;
      }

      // gates
      for (const id in s.gates) {
        const m = gateMeshes[id];
        if (!m) continue;
        const openT = s.gates[id].openT || 0;
        const openAmt = s.gates[id].open ? (openT > 0 ? Math.min(openT / 500, 1) : 1) : 0;
        m.position.y = -openAmt * 1.2;
        const gDef = (cfg.gates || []).find(g => g.id === id);
        const nearKey = gDef && !s.gates[id].open && (s.carry || []).indexOf(gDef.needs) !== -1 && Math.hypot(s.hero.x - gDef.pos[0], s.hero.z - gDef.pos[1]) < 6;
        m.traverse(o => { if (o.isMesh && o.material && 'emissive' in o.material) { if (!o.userData.ownMat) { o.material = o.material.clone(); o.userData.ownMat = true; } o.material.emissive.setHex(nearKey ? 0x664400 : 0x000000); } });
      }

      // bushes
      (cfg.bushes || []).forEach((b) => {
        const m = bushMeshes[b.id];
        if (!m) return;
        m.visible = !s.bushes[b.id].cut;
        m.scale.setScalar(s.bushes[b.id].cut ? 0.001 : 1);
      });

      // pedestals
      for (const id in s.pedestals) {
        const p = pedestalMeshes[id];
        if (!p) continue;
        const lit = s.pedestals[id].lit;
        const wiggle = s.pedestals[id].wiggleT || 0;
        p.mesh.scale.setScalar(1 + (wiggle > 0 ? 0.15 * (wiggle / 500) : 0));
        if (p.ring) {
          p.ring.material = p.ring.material || p.ring.material;
          p.ring.scale.setScalar(lit ? 1.15 : 1);
        }
        const gemId = 'gem' + id.charAt(0).toUpperCase() + id.slice(1);
        const nearGem = !lit && (s.carry || []).indexOf(gemId) !== -1;
        p.mesh.traverse(o => { if (o.isMesh && o.material && 'emissive' in o.material) { if (!o.userData.ownMat) { o.material = o.material.clone(); o.userData.ownMat = true; } o.material.emissive.setHex(nearGem ? 0x333300 : 0x000000); } });
      }

      // acorns
      s.acorns.forEach((a, i) => {
        if (i >= acornMeshes.length) return;
        const m = acornMeshes[i];
        m.visible = true;
        m.position.set(a.x, 0.25, a.z);
      });
      for (let i = s.acorns.length; i < acornMeshes.length; i++) acornMeshes[i].visible = false;

      // bridge
      if (s.bridge && s.bridge.built) {
        bridgeSegments.forEach((m, i) => {
          const threshold = (i + 1) * 300;
          const y = s.bridge.t > threshold ? 0 : -2;
          m.position.y += (y - m.position.y) * 0.1;
        });
      }
      // lighthouse light
      if (lighthouseLight) {
        lighthouseLight.visible = !!(s.bridge && s.bridge.built);
      }

      // blob shadows
      blobShadows.forEach((sh) => {
        sh.mesh.position.set(sh.target.position.x, 0.01, sh.target.position.z);
      });

// atmosphere blend (Q-03)
      if (game && zoneAtmos.length) {
        const s = game.state();
        if (s && s.hero) {
          const zi = zoneIndexForZ(s.hero.z);
          if (zi !== atmos.idx && atmos.to === null) {
            atmos.from = zoneAtmos[atmos.idx] || zoneAtmos[0];
            atmos.to = zoneAtmos[zi] || zoneAtmos[0];
            atmos.idx = zi;
            atmos.t = 0;
          }
          if (atmos.to) {
            atmos.t += frameMs / 1000;
            const k = Math.min(1, atmos.t / 2.0);
            // lerp colours
            const from = atmos.from, to = atmos.to;
            const lerpColor = (a, b, k) => {
              const ca = new THREE.Color(a), cb = new THREE.Color(b);
              return ca.lerp(cb, k).getHex();
            };
            scene.background = new THREE.Color(lerpColor(from.skyTop, to.skyTop, k));
            if (scene.fog) {
              scene.fog.color = new THREE.Color(lerpColor(from.fog, to.fog, k));
              scene.fog.near = from.fogNear + (to.fogNear - from.fogNear) * k;
              scene.fog.far = from.fogFar + (to.fogFar - from.fogFar) * k;
            }
            hemi.color.set(lerpColor(from.key, to.key, k));
            hemi.groundColor.set(lerpColor(from.fill, to.fill, k));
            hemi.intensity = from.intensity + (to.intensity - from.intensity) * k;
            dir.color.set(lerpColor(from.key, to.key, k));
            if (k >= 1) { atmos.to = null; atmos.from = null; }
          }
        }
      }

// cloud drift (Q-05)
      if (!reducedMotion) {
        const t = performance.now() * 0.0001;
        const dm = new THREE.Object3D();
        for (let i = 0; i < clouds.count; i++) {
          clouds.getMatrixAt(i, dm.matrix);
          dm.matrix.decompose(dm.position, dm.quaternion, dm.scale);
          dm.position.x += Math.sin(t + i) * 0.02;
          dm.position.z += Math.cos(t + i * 0.7) * 0.015;
          dm.updateMatrix();
          clouds.setMatrixAt(i, dm.matrix);
        }
        clouds.instanceMatrix.needsUpdate = true;
      }
// shadow frustum follows hero (Q-19)
      if (game && dir.castShadow) {
        const s = game.state();
        if (s && s.hero) {
          dir.shadow.camera.position.set(s.hero.x, 10, s.hero.z);
          dir.target.position.set(s.hero.x, hAt(s.hero.x, s.hero.z), s.hero.z);
          dir.target.updateMatrixWorld();
        }
      }
      if (!paused) waterUniforms.uTime.value += (frameMs / 1000) * (reducedMotion ? 0.25 : 1);
      water.position.y = -0.05;
const offc = cfg.camera.offset;
      const b = cfg.bounds;
      const la = reducedMotion ? 0 : 0.35;
      let cx = s.hero.x + Math.max(-2, Math.min(2, (s.hero.vx || 0) * la));
      let cz = s.hero.z + Math.max(-2, Math.min(2, (s.hero.vz || 0) * la));
      if (camNudge && camNudge.tLeft > 0) {
        camNudge.tLeft -= frameMs / 1000;
        const k = Math.max(0, Math.min(1, camNudge.tLeft / 1.2));
        const nudgeAmt = 6 * k;
        const dx = camNudge.x - cx, dz = camNudge.z - cz;
        const len = Math.hypot(dx, dz) || 1;
        cx += (dx / len) * Math.min(nudgeAmt, len);
        cz += (dz / len) * Math.min(nudgeAmt, len);
        if (camNudge.tLeft <= 0) camNudge = null;
      }
      cx = Math.max(b.xMin, Math.min(b.xMax, cx));
      cz = Math.max(b.zMin, Math.min(b.zMax, cz));
      const desired = new THREE.Vector3(cx + offc[0], offc[1], cz + offc[2]);
      if (!sheetRoot.visible) {
        const startVisible = startOverlay && startOverlay.style.display !== 'none';
        if (startVisible && !gallery && !reducedMotion) {
          const t = performance.now() * 0.00018;
          const r = 10;
          camera.position.set(s.hero.x + Math.sin(t) * r, 5.8, s.hero.z + Math.cos(t) * r + 2);
          camera.lookAt(s.hero.x, 0.9, s.hero.z);
        } else if (startVisible && !gallery) {
          camera.position.set(s.hero.x + 6, 5.8, s.hero.z + 8);
          camera.lookAt(s.hero.x, 0.9, s.hero.z);
        } else {
          camera.position.lerp(desired, 1 - Math.exp(-cfg.camera.follow * (frameMs / 1000)));
          camera.lookAt(cx, 0.6, cz);
        }
      }
    }

    function stepGame(ms) {
      if (!game) return;
      game.step(ms, input);
      input.swing = false;
    }

    function renderLoop() {
      rafId = requestAnimationFrame(renderLoop);
      const now = performance.now();
      let dt = now - lastFrame;
      if (dt > cfg.sim.dtClampMs) dt = cfg.sim.dtClampMs;
      lastFrame = now;
      frameMs = dt || 16;

      if (forceSlow) frameMs = 40;

      if (!paused && !gallery && game) {
        const sm = Math.hypot(input.sx, input.sy);
        const km = Math.hypot(keyX, keyY);
        if (km > sm) { input.sx = keyX; input.sy = keyY; }
        if (dragHint && dragHint.style.display !== 'none' && (Math.abs(input.sx)+Math.abs(input.sy) > 0.05)) hideDragHint(true);
        stepGame(frameMs);
      }

      if (gallery && !reducedMotion) {
        galleryRoot.rotation.y += 0.002;
      }

      updateActors();
      const _st = game ? game.state() : null;
      const _hm = !!(_st && _st.hero && (Math.abs(_st.hero.vx || 0) + Math.abs(_st.hero.vz || 0) > 0.02));
      const _zi = (_st && _st.hero) ? zoneIndexForZ(_st.hero.z) : 0;
      if (tickAudio) tickAudio(frameMs / 1000, _hm, _zi);
      if (perfOverlay.style.display !== 'none') perfOverlay.textContent = 'frameMs=' + frameMs.toFixed(1) + ' dpr=' + dpr.toFixed(2) + ' tier=' + tier + ' calls=' + renderer.info.render.calls + ' tris=' + renderer.info.render.triangles + ' tex=' + renderer.info.memory.textures + ' geo=' + renderer.info.memory.geometries;

      renderer.render(scene, camera);

      if (!gallery && !tierStepped && frameMs > cfg.budget.slowFrameMs) {
        tierStepped = true;
        if (tier === 'high') applyTier('medium');
        else if (tier === 'medium') applyTier('low');
        else { dpr = 1.0; renderer.setPixelRatio(dpr); }
      }
    }
    renderLoop();

    renderer.domElement.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      paused = true;
    }, false);
    renderer.domElement.addEventListener('webglcontextrestored', () => {
      paused = false;
    }, false);

    window.addEventListener('blur', () => { paused = true; input.sx = 0; input.sy = 0; input.swing = false; input.shield = false; const po = document.getElementById('i3d-pause'); if (po) po.style.display = 'flex'; });
    document.addEventListener('contextmenu', (e) => e.preventDefault());
    document.addEventListener('visibilitychange', () => {
      const ac = window.audioBuses && window.audioBuses.getAudioContext ? window.audioBuses.getAudioContext() : null;
      if (document.hidden) {
        paused = true; input.sx = 0; input.sy = 0; input.swing = false; input.shield = false;
        const po = document.getElementById('i3d-pause'); if (po) po.style.display = 'flex';
        if (ac && ac.state === 'running' && ac.suspend) ac.suspend().catch(() => {});
      } else if (ac && ac.state === 'suspended' && ac.resume) {
        ac.resume().catch(() => {});
      }
    });

    const pauseOverlay = document.getElementById('i3d-pause');
    if (pauseOverlay) pauseOverlay.addEventListener('click', () => { pauseOverlay.style.display = 'none'; paused = false; });
    function disposeObject(obj) {
      if (!obj) return;
      if (obj.geometry) obj.geometry.dispose();
      const mats = obj.material ? (Array.isArray(obj.material) ? obj.material : [obj.material]) : [];
      mats.forEach((m) => {
        for (const k in m) { const v = m[k]; if (v && v.isTexture && v.dispose) v.dispose(); }
        if (m.dispose) m.dispose();
      });
    }
    document.getElementById('i3d-back').addEventListener('click', () => {
      cancelAnimationFrame(rafId);
      scene.traverse(disposeObject);
      renderer.dispose();
      booted = false;
      try { if (window.top !== window && window.top && typeof window.top.goTo === "function") window.top.goTo("hub-games"); else location.href = "../index.html#hub-games"; }
      catch (e) { location.href = "../index.html#hub-games"; }
    });

    window.__little_adventure = {
      state: () => {
        const particlesAlive = particles ? particles.reduce((n, p) => n + (p.alive ? 1 : 0), 0) : 0;
        const base = { frameMs, dpr, tier, drawCalls: renderer.info.render.calls, triangles: renderer.info.render.triangles, textures: renderer.info.memory.textures, geometries: renderer.info.memory.geometries, programs: renderer.info.programs ? renderer.info.programs.length : 0, webgl: true, motionScale: reducedMotion ? 0 : 1, particlesAlive, particleCap: partCount };
        return game ? Object.assign({}, game.state(), base) : base;
      },
      seed: (n) => { if (game) game = logic.createGame(cfg, n); },
      pause: () => { paused = true; },
      step: (ms) => { if (game) stepGame(ms); },
      setStick: (x, y) => { input.sx = x; input.sy = y; },
      swing: () => { input.swing = true; },
      shield: (b) => { input.shield = !!b; },
      teleport: (x, z) => { if (game && game.debug) game.debug.teleport(x, z); },
      give: (id) => { if (game && game.debug) game.debug.give(id); },
      save: () => (game ? game.save() : null),
      load: (snap) => { if (game && snap) game.load(snap); },
      project: (x, y, z) => { const v = new THREE.Vector3(x, y, z); v.project(camera); return { x: v.x, y: v.y, z: v.z }; },
      shouldSpeak: (key, t) => { const lastSp = window.__laLastSpeech; return !(lastSp && lastSp.key === key && (t - lastSp.time) < 4000); },
      meshState: () => {
        const gates = {};
        Object.keys(gateMeshes).forEach(id => { const m = gateMeshes[id]; gates[id] = { visible: !!(m && m.visible), y: m ? m.position.y : null }; });
        const chests = {};
        Object.keys(chestMeshes).forEach(id => { const c = chestMeshes[id]; chests[id] = { lidRotX: c && c.lid ? c.lid.rotation.x : null }; });
        const pedestals = {};
        Object.keys(pedestalMeshes).forEach(id => { const p = pedestalMeshes[id]; pedestals[id] = { ringScale: p && p.ring ? p.ring.scale.x : null, lit: p && p.ring ? p.ring.visible : null }; });
        return { gates, chests, pedestals };
      },
      setHits: (id, n) => { if (game && game.debug) game.debug.setHits(id, n); },
      reset: () => { if (game) game = logic.createGame(cfg, 7); },
      forceSlow: (b) => { forceSlow = !!b; },
      photo: (name) => {
        if (!game) return;
        paused = true;
        game = logic.createGame(cfg, 7);
        const so = document.getElementById('i3d-start');
        if (so) so.style.display = 'none';
        const presets = {
          'hero-front': [0, 8], 'hero-side': [0, 8], 'hero-34': [0, 8],
          'meadow-wide': [0, 8], 'meadow-flowers': [0, 8],
          'forest-wide': [0, -20], 'forest-lane': [0, -20],
          'shrine-wide': [0, -30], 'pedestals-lit': [0, -62],
          'lighthouse': [0, -78], 'owl-closeup': [-5, 4],
          'grumpy-angry': [-8, -10], 'grumpy-happy': [-8, -10],
          'boss': [10, -56], 'gate-closed': [0, -16], 'gate-open': [0, -16],
          'chest-open': [14, -34], 'bridge-built': [0, -70],
          'complete-bloom': [0, -78], 'start-screen': [0, 8],
          'hud-landscape': [0, 8]
        };
        const p = presets[name] || [0, 8];
        if (game.debug) game.debug.teleport(p[0], p[1]);
        stepGame(50);
        currentPhoto = name || null;
      },
      sheet: (name, frames) => { if (game) { paused = true; game = logic.createGame(cfg, 7); currentSheet = { name, frames: frames || 8 }; buildSheet(name, currentSheet.frames); } },
      setPose: (actor, id, t) => { /* reserved for Q-10+ */ },
      quality: (t) => { if (TIERS[t]) { tierStepped = true; applyTier(t); } return tier; },
      fxTable: () => (window.little_adventureFx && window.little_adventureFx.eventKeys ? window.little_adventureFx.eventKeys() : []),
      data: { cfg }
    };
  } catch (e) {
    const view = document.getElementById('i3d-view');
    if (view) view.textContent = '3D \u043D\u0438\u0458\u0435 \u0434\u043E\u0441\u0442\u0443\u043F\u0430\u043D \u043E\u0432\u0434\u0435';
  }
};