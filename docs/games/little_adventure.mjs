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

    const models = modelsFactory.create(THREE);

    // Ground with vertex colours by zone
    const groundSeg = 64;
    const groundGeo = new THREE.PlaneGeometry(96, 160, groundSeg, groundSeg);
    const pos = groundGeo.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const colA = new THREE.Color(cfg.zones[0].color);
    const colB = new THREE.Color(cfg.zones[1].color);
    const colC = new THREE.Color(cfg.zones[2].color);
    for (let i = 0; i < pos.count; i++) {
      const z = pos.getY(i);
      let c;
      if (z > cfg.zones[0].z1) c = colA.clone();
      else if (z > cfg.zones[1].z1) c = colB.clone();
      else c = colC.clone();
      const d1 = Math.abs(z - cfg.zones[0].z1);
      const d2 = Math.abs(z - cfg.zones[1].z1);
      if (d1 < 3) c.lerp(z > cfg.zones[0].z1 ? colB : colA, 1 - d1 / 3);
      if (d2 < 3) c.lerp(z > cfg.zones[1].z1 ? colC : colB, 1 - d2 / 3);
      const x = pos.getX(i);
      colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
    }
    groundGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const ground = new THREE.Mesh(groundGeo, new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true }));
    ground.rotation.x = -Math.PI / 2;
    ground.position.z = -32;
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

    const water = new THREE.Mesh(
      new THREE.PlaneGeometry(96, 160),
      new THREE.MeshLambertMaterial({ color: 0x6EC6E8, transparent: true, opacity: 0.55, flatShading: true })
    );
    water.rotation.x = -Math.PI / 2;
    water.position.y = -0.05;
    water.position.z = -32;
    scene.add(water);

    const galleryRoot = new THREE.Group();
    scene.add(galleryRoot);

    // Particle pool
    const partCount = cfg.budget.particleCap;
    const partGeo = new THREE.BufferGeometry();
    const partPos = new Float32Array(partCount * 3);
    const partCol = new Float32Array(partCount * 3);
    partGeo.setAttribute('position', new THREE.BufferAttribute(partPos, 3));
    partGeo.setAttribute('color', new THREE.BufferAttribute(partCol, 3));
    const partMat = new THREE.PointsMaterial({ size: 0.25, vertexColors: true, transparent: true, opacity: 0.9 });
    const partPoints = new THREE.Points(partGeo, partMat);
    scene.add(partPoints);
    const particles = [];
    for (let i = 0; i < partCount; i++) particles.push({ alive: false, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, life: 0, color: 0xFFD23F });

    // Beacon + arrow
    const beacon = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 8, 8), new THREE.MeshBasicMaterial({ color: 0xFFD23F, transparent: true, opacity: 0.25 }));
    scene.add(beacon);
    const arrow = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.6, 6), new THREE.MeshBasicMaterial({ color: 0xFFD23F }));
    scene.add(arrow);
    let lastProgressT = 0;

    const camera = new THREE.PerspectiveCamera(cfg.camera.fov, window.innerWidth / window.innerHeight, 0.1, 1000);
    const off = cfg.camera.offset;
    camera.position.set(0, off[1], off[2]);
    camera.lookAt(0, 0.6, 0);

    let game = null;
    let paused = false;
    let currentPhoto = null;
    let currentSheet = null;
    const input = { sx: 0, sy: 0, swing: false, shield: false };
    let keyX = 0, keyY = 0;
    let forceSlow = false;
    let lastFrame = performance.now();
    let frameMs = 16;
    let dpr = renderer.getPixelRatio();
    let tier = 'high';
    let tierStepped = false;
    const TIERS = (window.little_adventureFx && window.little_adventureFx.TIERS) || { high: { dprCap: 1.5, particles: 250 }, medium: { dprCap: 1.25, particles: 120 }, low: { dprCap: 1.0, particles: 40 } };
    function applyTier(next) {
      if (!TIERS[next]) return;
      tier = next;
      const cap = TIERS[tier].dprCap || 1.0;
      const target = Math.min(window.devicePixelRatio || 1, cfg.budget.dprMax, cap);
      if (target < dpr) { dpr = target; renderer.setPixelRatio(dpr); }
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
      const treeTrunk = makeInstanced(new THREE.CylinderGeometry(0.12, 0.18, 0.9, 6), new THREE.MeshLambertMaterial({ color: 0xA66B3A, flatShading: true }), treePlacement, 0.45);
      const treeCrown = makeInstanced(new THREE.ConeGeometry(0.7, 1.4, 8), new THREE.MeshLambertMaterial({ color: 0x2E7D32, flatShading: true }), treePlacement, 1.6);
      scene.add(treeTrunk);
      scene.add(treeCrown);

      const tuftPlacement = collectPositions(120);
      const tuftMesh = makeInstanced(new THREE.IcosahedronGeometry(0.5, 0), new THREE.MeshLambertMaterial({ color: 0x6FB35A, flatShading: true }), tuftPlacement, 0.35);
      scene.add(tuftMesh);

      const flowerPlacement = collectPositions(80);
      const flowerMesh = makeInstanced(new THREE.SphereGeometry(0.12, 6, 4), new THREE.MeshLambertMaterial({ color: 0xFFD23F, flatShading: true }), flowerPlacement, 0.3);
      scene.add(flowerMesh);

      const rockPlacement = collectPositions(30);
      const rockMesh = makeInstanced(new THREE.DodecahedronGeometry(0.4, 0), new THREE.MeshLambertMaterial({ color: 0x9AA0A6, flatShading: true }), rockPlacement, 0.2);
      scene.add(rockMesh);

      // Static structures + actor refs
      (cfg.gates || []).forEach((g) => {
        const m = models.makeGate();
        m.position.set(g.pos[0], 0, g.pos[1]);
        scene.add(m);
        gateMeshes[g.id] = m;
      });
      const owlCfg = (cfg.npcs || [])[0];
      if (owlCfg) {
        owlMesh = models.makeOwl();
        owlMesh.position.set(owlCfg.pos[0], 0, owlCfg.pos[1]);
        scene.add(owlMesh);
      }
      (cfg.statues || []).forEach((s) => {
        statueMesh = models.makeStatue();
        statueMesh.position.set(s.pos[0], 0, s.pos[1]);
        scene.add(statueMesh);
      });
      (cfg.chests || []).forEach((c) => {
        const m = models.makeChest();
        m.position.set(c.pos[0], 0, c.pos[1]);
        scene.add(m);
        let lid = null;
        m.traverse((o) => { if (o.name === 'lid') lid = o; });
        chestMeshes[c.id] = { mesh: m, lid };
      });
      (cfg.pedestals || []).forEach((p) => {
        const m = models.makePedestal(p.id);
        m.position.set(p.pos[0], 0, p.pos[1]);
        scene.add(m);
        let ring = null;
        m.traverse((o) => { if (o.isMesh && o.geometry && o.geometry.type === 'TorusGeometry') ring = o; });
        pedestalMeshes[p.id] = { mesh: m, ring };
      });
      if (cfg.lighthouse) {
        lighthouseMesh = models.makeLighthouse();
        lighthouseMesh.position.set(cfg.lighthouse.pos[0], 0, cfg.lighthouse.pos[1]);
        scene.add(lighthouseMesh);
        lighthouseLight = lighthouseMesh.children[lighthouseMesh.children.length - 1];
      }
      (cfg.bushes || []).forEach((b) => {
        const m = models.makeBush();
        m.position.set(b.pos[0], 0, b.pos[1]);
        scene.add(m);
        bushMeshes[b.id] = m;
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
        m.position.set(g.home[0], 0, g.home[1]);
        scene.add(m);
        grumpyMeshes[g.id] = m;
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
      scene.add(heroMesh);
      window.__laHeroMesh = heroMesh;
      window.__laModels = models;
      addBlobShadow(heroMesh);

      paused = true;
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
      // Sound toggle (Q-16, separate key to avoid logic.js validateSave contract change)
      const SOUND_KEY = 'little_adventureSound';
      const soundBtn = document.getElementById('i3d-sound-btn');
      let soundOn = true;
      try { soundOn = localStorage.getItem(SOUND_KEY) !== '0'; } catch (e) { soundOn = true; }
      function applySound(on) {
        soundOn = !!on;
        if (window.audioBuses && window.audioBuses.setBus) {
          window.audioBuses.setBus('master', soundOn ? 1 : 0, 0);
        }
        if (soundBtn) {
          soundBtn.setAttribute('aria-pressed', soundOn ? 'true' : 'false');
          soundBtn.style.opacity = soundOn ? '1' : '0.45';
        }
        try { localStorage.setItem(SOUND_KEY, soundOn ? '1' : '0'); } catch (e) {}
      }
      applySound(soundOn);
      if (soundBtn) soundBtn.addEventListener('click', () => applySound(!soundOn));

      function playSfx(name) {
        if (!soundOn || !window.audioBuses) return;
        const A = window.little_adventureAudio;
        const recipe = A && A.SFX ? A.SFX[name] : null;
        if (!recipe) return;
        for (const l of recipe.layers) {
          if (l.type === 'tone' && window.audioBuses.playSweep) {
            window.audioBuses.playSweep('sfx', l.f0, l.f1, l.dur, 'sine', l.gain || 0.1, 0);
          } else if (l.type === 'noise' && window.audioBuses.playTone) {
            window.audioBuses.playTone('sfx', 180, l.dur || 0.05, 'triangle', (l.gain || 0.05) * 0.6, 0);
          }
        }
      }

      // milestone events -> save
      const _origDrain = game.drainEvents.bind(game);
      // wrap drainEvents to trigger saves
      const origStepGame = stepGame;
      // We'll handle save in updateActors via event drain.

      // Start overlay
      const startOverlay = document.getElementById('i3d-start');
      const btnContinue = document.getElementById('i3d-btn-continue');
      const btnNew = document.getElementById('i3d-btn-new');
      const saved = loadSave();
      if (saved) { btnContinue.style.display = 'block'; }
      btnNew.addEventListener('click', () => {
        try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
        game = logic.createGame(cfg, 7);
        if (startOverlay) startOverlay.style.display = 'none';
        paused = false;
      });
      btnContinue.addEventListener('click', () => {
        if (saved && game) { game.load(saved); }
        if (startOverlay) startOverlay.style.display = 'none';
        paused = false;
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
        // speech
        const speechMap = { befriend:'befriend', bushCut:'gem', chestOpen:'key', gateOpen:'gateOpen', pedestalFill:'gem', complete:'complete', owlTalk: ev.line };
        const key = ev.type === 'owlTalk' ? ev.line : speechMap[ev.type];
        if (key && cfg.speech && cfg.speech[key]) {
          const txt = cfg.speech[key];
          if (window.audioBuses && window.audioBuses.speakWithDuck) window.audioBuses.speakWithDuck(txt);
          else if (window.speech && window.speech.speak) window.speech.speak(txt);
          const ann = document.getElementById('i3d-announcer');
          if (ann) ann.textContent = txt;
          window.__laLastSpeech = { key, time: s.t };
        }
        // particles
        const burst = window.REDUCED_MOTION ? cfg.budget.burstReduced : cfg.budget.burst;
        function spawnBurst(x, z, color) {
          let n = 0;
          for (const p of particles) {
            if (n >= burst) break;
            if (!p.alive) {
              p.alive = true; p.x = x; p.y = 0.5; p.z = z;
              p.vx = (Math.random() - 0.5) * 4; p.vy = 2 + Math.random() * 2; p.vz = (Math.random() - 0.5) * 4;
              p.life = 600; p.color = color;
              n++;
            }
          }
        }
        if (ev.type === 'befriend') spawnBurst(s.grumpies.find(g=>g.id===ev.id)?.x || s.hero.x, s.grumpies.find(g=>g.id===ev.id)?.z || s.hero.z, 0xFFD23F);
        if (ev.type === 'bushCut') { const b = cfg.bushes.find(b=>b.id===ev.id); if (b) spawnBurst(b.pos[0], b.pos[1], 0x9BD37A); }
        if (ev.type === 'pickup') spawnBurst(s.hero.x, s.hero.z, 0xFFD23F);
        if (ev.type === 'pedestalFill') { const p = cfg.pedestals.find(p=>p.id===ev.id); if (p) spawnBurst(p.pos[0], p.pos[1], 0xFFD23F); }
      }
      if (progress) lastProgressT = s.t;

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

      // beacon + arrow
      const obj = game.nextObjective();
      if (obj) {
        beacon.visible = true;
        beacon.position.set(obj.x, 4, obj.z);
        beacon.scale.y = 1 + 0.1 * Math.sin(s.t * 0.005);
      } else {
        beacon.visible = false;
      }
      if (s.t - lastProgressT > 6000) {
        arrow.visible = true;
        const ang = s.t * 0.003;
        arrow.position.set(s.hero.x + Math.cos(ang) * 1.4, 1.2, s.hero.z + Math.sin(ang) * 1.4);
        arrow.rotation.y = -ang + Math.PI / 2;
      } else {
        arrow.visible = false;
      }

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
        heroMesh.position.set(s.hero.x, 0, s.hero.z);
        heroMesh.rotation.y = -s.hero.facing + Math.PI / 2;
      }

      // grumpies
      s.grumpies.forEach((g) => {
        const m = grumpyMeshes[g.id];
        if (!m) return;
        m.position.set(g.x, 0, g.z);
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
          m.position.set(it.x, 0.8 + Math.sin(s.t * 0.003 + id.charCodeAt(0)) * 0.15, it.z);
          m.rotation.y += 0.02;
        } else if (it.state === 'carried') {
          m.visible = true;
          const idx = s.carry.indexOf(id);
          const ang = (idx / Math.max(1, s.carry.length)) * Math.PI - Math.PI / 2;
          m.position.set(s.hero.x + Math.cos(ang) * 1.2, 0.9, s.hero.z + Math.sin(ang) * 1.2);
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
        m.position.y = -Math.min(openT / 500, 1) * 1.2;
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
          dir.target.position.set(s.hero.x, 0, s.hero.z);
          dir.target.updateMatrixWorld();
        }
      }
      water.position.y = -0.05 + Math.sin(performance.now() * 0.002) * 0.05;
const offc = cfg.camera.offset;
      const b = cfg.bounds;
      const cx = Math.max(b.xMin, Math.min(b.xMax, s.hero.x));
      const cz = Math.max(b.zMin, Math.min(b.zMax, s.hero.z));
      const desired = new THREE.Vector3(cx + offc[0], offc[1], cz + offc[2]);
      camera.position.lerp(desired, 1 - Math.exp(-cfg.camera.follow * (frameMs / 1000)));
      camera.lookAt(cx, 0.6, cz);
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
        stepGame(frameMs);
      }

      if (gallery && !reducedMotion) {
        galleryRoot.rotation.y += 0.002;
      }

      updateActors();
      if (perfOverlay.style.display !== 'none') perfOverlay.textContent = 'frameMs=' + frameMs.toFixed(1) + ' dpr=' + dpr.toFixed(2) + ' tier=' + tier + ' calls=' + renderer.info.render.calls + ' tris=' + renderer.info.render.triangles;

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
    document.getElementById('i3d-back').addEventListener('click', () => {
      cancelAnimationFrame(rafId);
      renderer.dispose();
      booted = false;
      try { if (window.top !== window && window.top && typeof window.top.goTo === "function") window.top.goTo("hub-games"); else location.href = "../index.html#hub-games"; }
      catch (e) { location.href = "../index.html#hub-games"; }
    });

    window.__little_adventure = {
      state: () => (game ? Object.assign({}, game.state(), { frameMs, dpr, tier, drawCalls: renderer.info.render.calls, triangles: renderer.info.render.triangles, webgl: true, motionScale: reducedMotion ? 0 : 1 }) : { frameMs, dpr, tier, drawCalls: renderer.info.render.calls, triangles: renderer.info.render.triangles, webgl: true, motionScale: reducedMotion ? 0 : 1 }),
      seed: (n) => { if (game) game = logic.createGame(cfg, n); },
      pause: () => { paused = true; },
      step: (ms) => { if (game) stepGame(ms); },
      setStick: (x, y) => { input.sx = x; input.sy = y; },
      swing: () => { input.swing = true; },
      shield: (b) => { input.shield = !!b; },
      teleport: (x, z) => { if (game && game.debug) game.debug.teleport(x, z); },
      give: (id) => { if (game && game.debug) game.debug.give(id); },
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
      sheet: (name, frames) => { if (game) { paused = true; game = logic.createGame(cfg, 7); currentSheet = { name, frames: frames || 8 }; } },
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