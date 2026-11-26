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
      shader.vertexShader = 'uniform float uTime;\nattribute float aMask;\nvarying vec2 vWUv;\nvarying float vMask;\n' + shader.vertexShader.replace(
        '#include <begin_vertex>',
        '#include <begin_vertex>\nvec4 wp = modelMatrix * vec4(transformed, 1.0);\nvWUv = wp.xz;\nvMask = aMask;\nfloat w1 = sin(wp.x * 0.18 + uTime * 0.9) * 0.08;\nfloat w2 = sin(wp.z * 0.22 + uTime * 1.1) * 0.06;\ntransformed.y += w1 + w2;'
      );
      shader.fragmentShader = 'uniform float uTime;\nvarying vec2 vWUv;\nvarying float vMask;\n' + shader.fragmentShader.replace(
        '#include <dithering_fragment>',
        'float foam = smoothstep(0.02, 0.45, vMask) * (1.0 - smoothstep(0.45, 0.85, vMask));\nfoam *= (0.5 + 0.5*sin(vWUv.x*0.7 + vWUv.y*0.6 + uTime*1.6));\ngl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.95, 0.98, 1.0), foam * 0.45);\ngl_FragColor.rgb += vec3(0.05,0.08,0.10) * (0.5 + 0.5*sin(vWUv.x*0.35 + uTime*0.5));\n#include <dithering_fragment>'
      );
    };
    waterMat.customProgramCacheKey = () => 'la-water-v2';
    // Q-07: low tier uses a simple flat water material (no wave shader/foam) for perf.
    const waterFlatMat = new THREE.MeshLambertMaterial({ color: 0x6EC6E8, transparent: true, opacity: 0.62, flatShading: true });
    const waterGeo = new THREE.PlaneGeometry(96, 160, 48, 80);
    const waterPos = waterGeo.attributes.position;
    const waterMask = new Float32Array(waterPos.count);
    for (let i = 0; i < waterPos.count; i++) {
      const wx = waterPos.getX(i);
      const wy = waterPos.getY(i);
      const wz = -wy - 32; // plane rotated -PI/2 around X, translated z=-32
      waterMask[i] = terrain && terrain.maskAt ? terrain.maskAt(wx, wz) : 0;
    }
    waterGeo.setAttribute('aMask', new THREE.BufferAttribute(waterMask, 1));
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.y = -0.05;
    water.position.z = -32;
    water.userData.uniforms = waterUniforms;
    scene.add(water);
    // Q-07 low-tier water sparkles (cheap sprites/points)
    const waterSparkleCount = 24;
    const waterSparkleGeo = new THREE.BufferGeometry();
    const waterSparklePos = new Float32Array(waterSparkleCount * 3);
    const waterSparkleBase = [];
    for (let i = 0; i < waterSparkleCount; i++) {
      const a = (i / waterSparkleCount) * Math.PI * 2;
      const r = 24 + (i % 5) * 1.2;
      const x = Math.cos(a) * r * 0.55;
      const z = -32 + Math.sin(a) * r * 1.25;
      waterSparkleBase.push({ x, z, ph: i * 0.7 });
      waterSparklePos[i*3] = x; waterSparklePos[i*3+1] = 0.08; waterSparklePos[i*3+2] = z;
    }
    waterSparkleGeo.setAttribute('position', new THREE.BufferAttribute(waterSparklePos, 3));
    const waterSparkleMat = new THREE.PointsMaterial({ color: 0xFFFFFF, size: 0.35, transparent: true, opacity: 0.85, depthWrite: false });
    const waterSparkles = new THREE.Points(waterSparkleGeo, waterSparkleMat);
    waterSparkles.visible = false;
    scene.add(waterSparkles);

    const galleryRoot = new THREE.Group();
    scene.add(galleryRoot);
    const sheetRoot = new THREE.Group();
    sheetRoot.visible = false;
    scene.add(sheetRoot);

    function buildSheet(name, frames) {
      while (sheetRoot.children.length) sheetRoot.remove(sheetRoot.children[0]);
      const n = Math.max(1, frames | 0);
      const spacing = 1.7;
      const startX = -((n - 1) * spacing) / 2;
      const chars = window.little_adventureCharacters;
      const anim = window.little_adventureAnim;
      const mats = (window.little_adventureMaterials && window.little_adventureMaterials.create)
        ? window.little_adventureMaterials.create(THREE)
        : { toon: (c) => new THREE.MeshToonMaterial({ color: c }) };

      function poseAt(name, i, n) {
        const f = n <= 1 ? 0 : i / (n - 1);
        const t = f; // normalized 0..1
        const sec = t * 2;
        if (name === 'hero-idle') return { rig: 'hero', pose: anim.evalHero({ hero: { vx:0,vz:0,swingT:0,shield:false,bumpT:0 } }, sec, { motionScale: 1 }) };
        if (name === 'hero-walk') return { rig: 'hero', pose: anim.evalHero({ hero: { vx:3,vz:0,swingT:0,shield:false,bumpT:0 } }, 0, { motionScale: 1, phase: f * Math.PI * 2 }) };
        if (name === 'hero-swing') return { rig: 'hero', pose: anim.evalHero({ hero: { vx:0,vz:0,swingFrac:f,shield:false,bumpT:0 } }, 0, { motionScale: 1 }) };
        if (name === 'hero-shield') return { rig: 'hero', pose: anim.evalHero({ hero: { vx:0,vz:0,swingT:0,shield:true,bumpT:0 } }, sec, { motionScale: 1 }) };
        if (name === 'hero-bump') return { rig: 'hero', pose: anim.evalHero({ hero: { vx:0,vz:0,swingT:0,shield:false,bumpT:200*(1-f) } }, sec, { motionScale: 1 }) };
        if (name === 'hero-pickup') return { rig: 'hero', pose: anim.evalHero({ hero: { vx:0,vz:0,swingT:0,shield:false,bumpT:0,pickupFrac:f } }, sec, { motionScale: 1 }) };
        if (name === 'hero-celebrate') return { rig: 'hero', pose: anim.evalHero({ hero: { vx:0,vz:0,swingT:0,shield:false,bumpT:0,celebrateFrac:f } }, sec, { motionScale: 1 }) };
        if (name === 'grumpy-walk') return { rig: 'grumpy', pose: anim.evalGrumpy({ state:'approach', hp:3, mood:1 }, sec, { motionScale: 1 }) };
        if (name === 'grumpy-notice') return { rig: 'grumpy', pose: anim.evalGrumpy({ state:'notice', hp:3, mood:1, noticeFrac:f }, sec, { motionScale: 1 }) };
        if (name === 'grumpy-hit') return { rig: 'grumpy', pose: anim.evalGrumpy({ state:'retreat', hp:2, mood:1, hitT:Math.max(0,430-f*430) }, sec, { motionScale: 1 }) };
        if (name === 'grumpy-befriend') return { rig: 'grumpy', pose: anim.evalGrumpy({ state:'happy', hp:0, mood:100, befriendT:Math.max(0,400-f*400) }, sec, { motionScale: 1 }) };
        if (name === 'happy-dance') return { rig: 'grumpy', pose: anim.evalGrumpy({ state:'happyDance', hp:0, mood:100 }, sec, { motionScale: 1 }) };
        if (name === 'boss-stomp') return { rig: 'boss', pose: anim.evalGrumpy({ state:'bossStomp', hp:5, mood:1, stompFrac:f }, sec, { motionScale: 1 }) };
        if (name === 'owl-talk') return { rig: 'owl', pose: anim.evalOwl({ pos:[0,0] }, { x:0, z:2 }, true, sec, { motionScale: 1 }) };
        return null;
      }

      const models = (window.little_adventureModels && window.little_adventureModels.create) ? window.little_adventureModels.create(THREE, mats) : null;
      const propSheet = (name === 'chest-open' || name === 'gate-open' || name === 'bridge-build' || name === 'bloom-wave');
      for (let i = 0; i < n; i++) {
        const f = n <= 1 ? 0 : i / (n - 1);
        const info = poseAt(name, i, n);
        let g;
        if (propSheet && models) {
          g = new THREE.Group();
          if (name === 'chest-open') {
            const chest = models.makeChest();
            const lid = chest.getObjectByName('lid');
            const t = anim && anim.outBack ? Math.max(0, Math.min(1.1, anim.outBack(f))) : f;
            if (lid) lid.rotation.x = -Math.PI / 2 * t;
            g.add(chest);
          } else if (name === 'gate-open') {
            const gate = models.makeGate();
            const openAmt = anim && anim.outCubic ? anim.outCubic(f) : f;
            const leafL = gate.getObjectByName('gateLeafL');
            const leafR = gate.getObjectByName('gateLeafR');
            if (leafL) leafL.rotation.y = -openAmt * Math.PI / 2;
            if (leafR) leafR.rotation.y = openAmt * Math.PI / 2;
            gate.position.y = -openAmt * 1.2;
            g.add(gate);
          } else if (name === 'bridge-build') {
            const total = 5;
            const show = Math.round(f * total);
            for (let k = 0; k < total; k++) {
              const seg = models.makeBridgeSegment(k);
              seg.position.set(0, 0.05 + k * 0.02, -1.0 + k * 0.55);
              seg.visible = k < show;
              g.add(seg);
            }
            const base = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.2, 2.8), new THREE.MeshLambertMaterial({ color: 0x7a6b5d }));
            base.position.y = -0.12; g.add(base);
          } else if (name === 'bloom-wave') {
            const ground = new THREE.Mesh(new THREE.CircleGeometry(1.2, 20), new THREE.MeshLambertMaterial({ color: 0x6ea85f }));
            ground.rotation.x = -Math.PI / 2; ground.position.y = -0.01; g.add(ground);
            const total = 12;
            const show = Math.round(f * total);
            const cols = [0xFFB7D5, 0xFFD23F, 0xB388FF, 0x80D8FF];
            for (let k = 0; k < total; k++) {
              const a = (k / total) * Math.PI * 2;
              const r = 0.25 + (k % 3) * 0.28;
              const flower = models.makeFlower();
              flower.traverse((o) => { if (o.isMesh && o.material && o.material.color && o.geometry && o.geometry.type === 'SphereGeometry') o.material = o.material.clone(), o.material.color.setHex(cols[k % cols.length]); });
              flower.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
              const sc = k < show ? 0.35 + 0.65 * Math.min(1, (f * total - k)) : 0.001;
              flower.scale.setScalar(Math.max(0.001, sc));
              g.add(flower);
            }
          }
        } else if (info && chars && chars.create && anim) {
          const c = chars.create(THREE, mats);
          if (info.rig === 'hero') g = c.makeHero2();
          else if (info.rig === 'grumpy') g = c.makeGrumpy2('normal');
          else if (info.rig === 'boss') g = c.makeGrumpy2('boss');
          else if (info.rig === 'owl') g = c.makeOwl2();
          if (g) {
            if (chars.applyPose) chars.applyPose(g, info.pose);
            if (info.rig === 'hero' && g.userData && g.userData.setFace) g.userData.setFace(name === 'hero-celebrate' ? 'happy' : (name === 'hero-bump' ? 'strain' : 'open'));
            if ((info.rig === 'grumpy' || info.rig === 'boss') && g.userData && g.userData.setFace) g.userData.setFace(name === 'grumpy-befriend' || name === 'happy-dance' ? 'happy' : (name === 'grumpy-hit' ? 'strain' : 'grumpy'));
          }
        }
        if (!g) {
          g = new THREE.Group();
          const body = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.0, 0.6), new THREE.MeshLambertMaterial({ color: 0x88ccee }));
          body.position.y = 0.5; g.add(body);
          const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 10), new THREE.MeshLambertMaterial({ color: 0xffe0bd }));
          head.position.y = 1.15; g.add(head);
        }
        g.position.x = startX + i * spacing;
        g.userData.t = f;
        sheetRoot.add(g);
      }
      sheetRoot.visible = true;
      galleryRoot.visible = false;
      heroMesh.visible = false;
      if (propSheet) {
        const camZ = name === 'gate-open' ? 8 + n * 0.35 : 5.5 + n * 0.35;
        const camY = name === 'gate-open' ? 2.8 : 2.2;
        camera.position.set(0, camY, camZ);
        camera.lookAt(0, name === 'gate-open' ? 0.6 : 0.5, 0);
      } else {
        camera.position.set(0, 2.2, 6 + n * 0.45);
        camera.lookAt(0, 0.8, 0);
      }
    }

    // Particle pools (Q-14: normal + additive, total cap = partCount)
    const partCount = cfg.budget.particleCap;
    const partAtlas = (window.little_adventureFx && window.little_adventureFx.makeAtlas) ? window.little_adventureFx.makeAtlas(THREE) : null;
    function makePartPool(additive) {
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(partCount * 3);
      const col = new Float32Array(partCount * 3);
      for (let i = 0; i < partCount; i++) pos[i * 3 + 1] = -1000;
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
      const mat = new THREE.PointsMaterial({
        size: additive ? 0.34 : 0.28, map: partAtlas || undefined, vertexColors: true, transparent: true,
        opacity: additive ? 0.75 : 0.95, depthWrite: false, sizeAttenuation: true, alphaTest: additive ? 0.01 : 0.02,
        blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending
      });
      const pts = new THREE.Points(geo, mat);
      scene.add(pts);
      return { geo, pos, col, mat, pts };
    }
    const partN = makePartPool(false);
    const partA = makePartPool(true);
    const particles = [];
    for (let i = 0; i < partCount; i++) particles.push({ alive: false, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, life: 0, color: 0xFFD23F, additive: false });

    // Q-11 sword trail ribbon (6-segment ring buffer)
    const swordTrailSegs = 6;
    const swordTrailPos = new Float32Array((swordTrailSegs + 1) * 2 * 3);
    const swordTrailGeo = new THREE.BufferGeometry();
    swordTrailGeo.setAttribute('position', new THREE.BufferAttribute(swordTrailPos, 3));
    const swordTrailIdx = [];
    for (let i = 0; i < swordTrailSegs; i++) { const a = i * 2, b = a + 1, c = a + 2, d = a + 3; swordTrailIdx.push(a, b, c, b, d, c); }
    swordTrailGeo.setIndex(swordTrailIdx);
    const swordTrailMat = new THREE.MeshBasicMaterial({ color: 0xFFF3DC, transparent: true, opacity: 0.0, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending });
    const swordTrail = new THREE.Mesh(swordTrailGeo, swordTrailMat);
    swordTrail.frustumCulled = false; swordTrail.visible = false;
    scene.add(swordTrail);
    const swordTrailPts = [];
    for (let i = 0; i <= swordTrailSegs; i++) swordTrailPts.push({ a: new THREE.Vector3(), b: new THREE.Vector3() });

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
    let winFX = null; // Q-21: {t, nextBurst}
    let bloom = null; // Q-21: {mesh, t}
    let butterflies = null; // Q-21 free-play ambience
    let footstepAcc = 0;
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
      if (water) water.material = (tier === 'low') ? waterFlatMat : waterMat;
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
    let lighthouseBeam = null;
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
    const chars = (window.little_adventureCharacters && window.little_adventureCharacters.create) ? window.little_adventureCharacters.create(THREE, mats) : null;
    if (gallery) {
      const items = [
        models.makeHero(), ...(chars ? [chars.makeHero2()] : []), models.makeOwl(), ...(chars && chars.makeOwl2 ? [chars.makeOwl2()] : []),
        models.makeGrumpy('normal'), ...(chars && chars.makeGrumpy2 ? [chars.makeGrumpy2('normal')] : []),
        models.makeGrumpy('guard'), ...(chars && chars.makeGrumpy2 ? [chars.makeGrumpy2('guard')] : []),
        models.makeGrumpy('boss'), ...(chars && chars.makeGrumpy2 ? [chars.makeGrumpy2('boss')] : []), models.makeKey(),
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

      function collectPositions(count, opts) {
        const positions = [];
        const rotations = [];
        const scales = [];
        const o = opts || {};
        let tries = 0;
        while (positions.length < count && tries < count * 30) {
          tries++;
          const x = (rng() * 44) - 22;
          const z = (rng() * 90) - 76;
          if (Math.abs(x) < 3) continue;
          if (o.zMin != null && z < o.zMin) continue;
          if (o.zMax != null && z > o.zMax) continue;
          let ok = true;
          for (const f of forbidden) {
            if (Math.hypot(x - f.x, z - f.z) < (f.r + (o.extraR || 0))) { ok = false; break; }
          }
          if (!ok) continue;
          positions.push({ x, z });
          rotations.push(rng() * Math.PI * 2);
          scales.push(0.85 + rng() * 0.4);
        }
        return { positions, rotations, scales };
      }

      function makeInstanced(geometry, material, placement, y, yFn) {
        const mesh = new THREE.InstancedMesh(geometry, material, placement.positions.length);
        const dummy = new THREE.Object3D();
        placement.positions.forEach((p, i) => {
          const yy = yFn ? yFn(p.x, p.z, y) : y;
          dummy.position.set(p.x, yy, p.z);
          dummy.rotation.y = placement.rotations[i];
          const sc = (placement.scales && placement.scales[i]) || 1;
          dummy.scale.setScalar(sc);
          dummy.updateMatrix();
          mesh.setMatrixAt(i, dummy.matrix);
        });
        mesh.count = placement.positions.length;
        mesh.instanceMatrix.needsUpdate = true;
        return mesh;
      }

      const mToon = (c) => mats ? mats.toon(c, { flat: true }) : new THREE.MeshLambertMaterial({ color: c, flatShading: true });
      // Q-08: zone vegetation/props
      const decoPlacements = [];
      const trackDeco = (pl) => { (pl.positions || []).forEach((p) => decoPlacements.push(p)); return pl; };
      const treeA = trackDeco(collectPositions(35, { zMin: -16, zMax: 8 }));
      const treeB = trackDeco(collectPositions(25, { zMin: -46, zMax: -16 }));
      const treeC = trackDeco(collectPositions(18, { zMin: -80, zMax: -46 }));
      const addTrees = (pl, crownColor, trunkColor) => {
        const tr = makeInstanced(new THREE.CylinderGeometry(0.12, 0.18, 0.9, 6), mToon(trunkColor), pl, 0, (x,z)=>hAt(x,z)+0.45);
        const cr = makeInstanced(new THREE.ConeGeometry(0.7, 1.4, 8), mToon(crownColor), pl, 0, (x,z)=>hAt(x,z)+1.6);
        scene.add(tr); scene.add(cr);
      };
      addTrees(treeA, 0x2E7D32, 0xA66B3A);
      addTrees(treeB, 0x3E8E41, 0x8D5A2B);
      addTrees(treeC, 0x6A8EAE, 0x7A6A5A);

      const tuftPlacement = trackDeco(collectPositions(100));
      const tuftMat = mToon(0x6FB35A);
      tuftMat.onBeforeCompile = (shader) => {
        shader.uniforms.uTime = waterUniforms.uTime;
        shader.vertexShader = 'uniform float uTime;\n' + shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nfloat wy = max(0.0, transformed.y);\nfloat wind = ' + (reducedMotion ? '0.0' : '1.0') + ';\ntransformed.x += sin(uTime * 1.2 + instanceMatrix[3][0] * 0.3) * wy * 0.08 * wind;');
      };
      tuftMat.customProgramCacheKey = () => 'la-tuft-wind';
      scene.add(makeInstanced(new THREE.IcosahedronGeometry(0.45, 0), tuftMat, tuftPlacement, 0, (x,z)=>hAt(x,z)+0.3));

      const flowerColors = [0xFFD23F, 0xFF8A80, 0xB388FF, 0x80D8FF, 0xFFFFFF];
      flowerColors.forEach((fc, i) => {
        const fp = trackDeco(collectPositions(14, { zMin: i < 3 ? -46 : -80, zMax: i < 3 ? 8 : -46 }));
        scene.add(makeInstanced(new THREE.SphereGeometry(0.11, 6, 4), mToon(fc), fp, 0, (x,z)=>hAt(x,z)+0.25));
      });

      const rockPl = trackDeco(collectPositions(26));
      scene.add(makeInstanced(new THREE.DodecahedronGeometry(0.38, 0), mToon(0x9AA0A6), rockPl, 0, (x,z)=>hAt(x,z)+0.18));

      const mushPl = trackDeco(collectPositions(18, { zMin: -46, zMax: -16 }));
      scene.add(makeInstanced(new THREE.CylinderGeometry(0.04, 0.06, 0.18, 6), mToon(0xE8D5B5), mushPl, 0, (x,z)=>hAt(x,z)+0.09));
      scene.add(makeInstanced(new THREE.SphereGeometry(0.12, 6, 4, 0, Math.PI*2, 0, Math.PI/2), mToon(0xD84315), mushPl, 0, (x,z)=>hAt(x,z)+0.18));

      const logPl = trackDeco(collectPositions(10, { zMin: -46, zMax: -16 }));
      scene.add(makeInstanced(new THREE.CylinderGeometry(0.12, 0.14, 1.2, 6), mToon(0x8D6E63), logPl, 0, (x,z)=>hAt(x,z)+0.12));

      const lanternPl = trackDeco(collectPositions(8, { zMin: -80, zMax: -46 }));
      scene.add(makeInstanced(new THREE.CylinderGeometry(0.08, 0.08, 0.5, 6), mToon(0x8D6E63), lanternPl, 0, (x,z)=>hAt(x,z)+0.45));
      scene.add(makeInstanced(new THREE.SphereGeometry(0.1, 6, 4), new THREE.MeshBasicMaterial({ color: 0xFFD54F, transparent: true, opacity: 0.8 }), lanternPl, 0, (x,z)=>hAt(x,z)+0.75));

      const runePl = trackDeco(collectPositions(10, { zMin: -80, zMax: -46 }));
      scene.add(makeInstanced(new THREE.BoxGeometry(0.25, 1.2, 0.25), mToon(0x607D8B), runePl, 0, (x,z)=>hAt(x,z)+0.6));
      window.__laDeco = { forbidden: forbidden.map((f) => ({ x: f.x, z: f.z, r: f.r })), placements: decoPlacements.map((p) => ({ x: p.x, z: p.z })) };

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
        owlMesh = (chars && chars.makeOwl2) ? chars.makeOwl2() : models.makeOwl();
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
        lighthouseMesh.traverse((o) => { if (o.name === 'lhLight') lighthouseLight = o; if (o.name === 'lhBeam') lighthouseBeam = o; });
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
        const m = (chars && chars.makeGrumpy2) ? chars.makeGrumpy2(g.role) : models.makeGrumpy(g.role);
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
      const heroMesh = (chars && chars.makeHero2) ? chars.makeHero2() : models.makeHero();
      heroMesh.traverse((o) => { if (o.isMesh) { o.castShadow = true; } });
      scene.add(heroMesh);
      window.__laHeroMesh = heroMesh;
      window.__laChars = chars;
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

    function updateActors(dtFrame) {
      if (gallery || !game) return;
      const dt = dtFrame || 0.016;
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
        if (ev.type === 'grumpyRespawn') {
          const rg = s.grumpies.find((gg) => gg.id === ev.id);
          if (rg) {
            const puffN = reducedMotion ? 3 : 8;
            let pn = 0;
            for (const p of particles) {
              if (pn >= puffN) break;
              if (!p.alive) {
                p.alive = true; p.x = rg.x + (Math.random() - 0.5) * 0.4; p.y = hAt(rg.x, rg.z) + 0.2; p.z = rg.z + (Math.random() - 0.5) * 0.4;
                p.vx = (Math.random() - 0.5) * 1.2; p.vy = 0.6 + Math.random() * 0.8; p.vz = (Math.random() - 0.5) * 1.2;
                p.life = 500 + Math.random() * 300; p.color = 0xD2B48C; p.additive = false; pn++;
              }
            }
            const rm = grumpyMeshes[ev.id]; if (rm) { rm.userData.respawnT = reducedMotion ? 0 : 0.35; }
          }
        }
        if (ev.type === 'complete' && !winFX) {
          winFX = { t: 0, nextBurst: 0 };
          if (!bloom) {
            const bCount = tier === 'low' ? 12 : 24;
            const bGeo = new THREE.CircleGeometry(0.18, 6);
            const bMat = new THREE.MeshBasicMaterial({ color: 0xFFB7D5, transparent: true, opacity: 0.9 });
            bloom = { mesh: new THREE.InstancedMesh(bGeo, bMat, bCount), t: reducedMotion ? 99 : 0, count: bCount };
            bloom.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
            const dummy = new THREE.Object3D();
            for (let i = 0; i < bCount; i++) { dummy.position.set(0,-10,0); dummy.scale.setScalar(0.001); dummy.updateMatrix(); bloom.mesh.setMatrixAt(i, dummy.matrix); }
            bloom.mesh.instanceMatrix.needsUpdate = true;
            scene.add(bloom.mesh);
          }
          if (!butterflies) {
            const n = tier === 'low' ? 4 : 8;
            butterflies = [];
            const bGeo = new THREE.PlaneGeometry(0.28, 0.18);
            for (let i = 0; i < n; i++) {
              const m = new THREE.Mesh(bGeo, new THREE.MeshBasicMaterial({ color: i % 2 ? 0xFFD54F : 0xFF8A80, side: THREE.DoubleSide, transparent: true, opacity: 0.85 }));
              m.position.set(s.hero.x + (Math.random()-0.5)*8, 1.2 + Math.random()*1.5, s.hero.z + (Math.random()-0.5)*8);
              m.userData = { ph: Math.random()*Math.PI*2, r: 1.5+Math.random()*2, sp: 0.4+Math.random()*0.4 };
              scene.add(m); butterflies.push(m);
            }
          }
        }
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
              p.life = (pCfg.life || 0.8) * 1000; p.color = pCfg.color || 0xFFD23F; p.additive = !!pCfg.additive;
              n++;
            }
          }
        }
      }
      if (progress) lastProgressT = s.t;

      // Q-21 completion celebration (soft, <=2Hz bursts, playable after)
      if (winFX) {
        winFX.t += dt;
        if (winFX.ox == null) { winFX.ox = s.hero.x; winFX.oz = s.hero.z; }
        if (!reducedMotion && winFX.t < 4.5 && winFX.t >= winFX.nextBurst) {
          winFX.nextBurst += 0.65; // ~1.5Hz
          const colors = [0xFFD23F, 0xFF8A80, 0x80D8FF, 0xB388FF, 0xFFFFFF];
          const burstN = tier === 'low' ? 6 : 10;
          let bn = 0;
          for (const p of particles) {
            if (bn >= burstN) break;
            if (!p.alive) {
              p.alive = true;
              const a = (bn / burstN) * Math.PI * 2;
              const r = 2 + Math.random() * 3;
              p.x = s.hero.x + Math.cos(a) * r; p.y = 1 + Math.random() * 2; p.z = s.hero.z + Math.sin(a) * r;
              p.vx = Math.cos(a) * 0.8; p.vy = 1.5 + Math.random() * 1.2; p.vz = Math.sin(a) * 0.8;
              p.life = 1400 + Math.random() * 600; p.color = colors[bn % colors.length]; p.additive = true;
              bn++;
            }
          }
        }
        if (bloom && bloom.mesh) {
          bloom.t += dt;
          const dummy = bloom._dummy || (bloom._dummy = new THREE.Object3D());
          for (let i = 0; i < bloom.count; i++) {
            const a = (i / bloom.count) * Math.PI * 2;
            const r = 2.5 + (i % 5) * 0.9;
            const x = winFX.ox + Math.cos(a) * r;
            const z = winFX.oz + Math.sin(a) * r;
            const d = r;
            const grow = Math.max(0, Math.min(1, (bloom.t * 2.2) - d * 0.15));
            const sc = grow * (0.8 + (i % 3) * 0.2);
            dummy.position.set(x, hAt(x, z) + 0.03, z);
            dummy.rotation.set(-Math.PI / 2, 0, a);
            dummy.scale.setScalar(Math.max(0.001, sc));
            dummy.updateMatrix();
            bloom.mesh.setMatrixAt(i, dummy.matrix);
          }
          bloom.mesh.instanceMatrix.needsUpdate = true;
        }
        if (winFX.t > 6) winFX = { t: 6, nextBurst: 999, done: true };
      }
      if (butterflies) {
        for (let i = 0; i < butterflies.length; i++) {
          const b = butterflies[i]; const u = b.userData;
          if (!reducedMotion) { u.ph += dt * u.sp; b.position.x += Math.cos(u.ph) * dt * 0.6; b.position.z += Math.sin(u.ph * 0.7) * dt * 0.6; b.position.y = 1.1 + Math.sin(u.ph * 1.3) * 0.4 + (i % 3) * 0.2; b.rotation.y = u.ph; b.rotation.z = Math.sin(u.ph * 2) * 0.2; }
        }
      }

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
            p.additive = zoneIdx >= 1; // forest fireflies / cave runes
            break;
          }
        }
      }

      // hero anim (Q-11)
      if (heroMesh) {
        const anim = window.little_adventureAnim;
        const chars = window.little_adventureCharacters;
        if (heroMesh.userData && heroMesh.userData.pivots && anim && anim.evalHero && chars && chars.applyPose) {
          const pose = anim.evalHero(s, s.t / 1000, { motionScale: reducedMotion ? 0.4 : 1 });
          chars.applyPose(heroMesh, pose);
          const shieldP = heroMesh.userData.pivots.shield;
          if (shieldP) {
            const st = s.hero.shield ? 1 : 0;
            shieldP.position.y = -0.12 + st * 0.08;
            shieldP.position.z = 0.1 + st * 0.04;
            shieldP.rotation.x = st ? -0.6 : 0;
            shieldP.scale.setScalar(s.hero.shield ? 1.15 : 1);
          }
          // Q-11 sword trail ribbon (6-segment ring buffer)
          const swordP = heroMesh.userData.pivots.sword;
          const swinging = (s.hero.swingT || 0) > 0 && !reducedMotion;
          if (swordP && swinging) {
            heroMesh.updateMatrixWorld(true);
            const tip = new THREE.Vector3(0, 0.78, 0).applyMatrix4(swordP.matrixWorld);
            const base = new THREE.Vector3(0, 0.08, 0).applyMatrix4(swordP.matrixWorld);
            if (!swordTrail.visible || swordTrailMat.opacity < 0.05) {
              for (let i = 0; i < swordTrailPts.length; i++) swordTrailPts[i] = { a: base.clone(), b: tip.clone() };
            }
            swordTrailPts.pop();
            swordTrailPts.unshift({ a: base, b: tip });
            for (let i = 0; i <= swordTrailSegs; i++) {
              const p = swordTrailPts[i] || swordTrailPts[swordTrailPts.length - 1];
              swordTrailPos[i*6] = p.a.x; swordTrailPos[i*6+1] = p.a.y; swordTrailPos[i*6+2] = p.a.z;
              swordTrailPos[i*6+3] = p.b.x; swordTrailPos[i*6+4] = p.b.y; swordTrailPos[i*6+5] = p.b.z;
            }
            swordTrailGeo.attributes.position.needsUpdate = true;
            swordTrailGeo.computeVertexNormals();
            swordTrailMat.opacity = 0.28;
            swordTrail.visible = true;
          } else {
            swordTrailMat.opacity *= 0.82;
            if (swordTrailMat.opacity < 0.02) { swordTrail.visible = false; swordTrailMat.opacity = 0; }
          }
        } else {
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
          if (shield) { shield.position.y = s.hero.shield ? 0.9 : 0.6; shield.rotation.x = s.hero.shield ? 0 : 0; }
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
      let piN = 0, piA = 0;
      for (const p of particles) {
        if (!p.alive) continue;
        const pool = p.additive ? partA : partN;
        const pi = p.additive ? piA : piN;
        if (pi < partCount) {
          pool.pos[pi*3] = p.x; pool.pos[pi*3+1] = p.y; pool.pos[pi*3+2] = p.z;
          const c = new THREE.Color(p.color);
          pool.col[pi*3] = c.r; pool.col[pi*3+1] = c.g; pool.col[pi*3+2] = c.b;
          if (p.additive) piA++; else piN++;
        }
      }
      for (let i = piN; i < partCount; i++) { partN.pos[i*3+1] = -1000; }
      for (let i = piA; i < partCount; i++) { partA.pos[i*3+1] = -1000; }
      partN.geo.attributes.position.needsUpdate = true;
      partN.geo.attributes.color.needsUpdate = true;
      partA.geo.attributes.position.needsUpdate = true;
      partA.geo.attributes.color.needsUpdate = true;

      if (heroMesh) {
        heroMesh.position.set(s.hero.x, hAt(s.hero.x, s.hero.z), s.hero.z);
        heroMesh.rotation.y = -s.hero.facing + Math.PI / 2;
        const moving = Math.hypot(s.hero.vx || 0, s.hero.vz || 0) > 0.6;
        if (moving && !reducedMotion) {
          footstepAcc += dt;
          if (footstepAcc > 0.35) {
            footstepAcc = 0;
            let dn = 0;
            for (const p of particles) {
              if (dn >= 2) break;
              if (!p.alive) { p.alive = true; p.x = s.hero.x + (Math.random()-0.5)*0.3; p.y = hAt(s.hero.x, s.hero.z)+0.05; p.z = s.hero.z + (Math.random()-0.5)*0.3; p.vx = (Math.random()-0.5)*0.4; p.vy = 0.3+Math.random()*0.3; p.vz = (Math.random()-0.5)*0.4; p.life = 450; p.color = 0xD2B48C; p.additive = false; dn++; }
            }
          }
        } else { footstepAcc = 0; }
      }

      // grumpies
      s.grumpies.forEach((g) => {
        const m = grumpyMeshes[g.id];
        if (!m) return;
        m.position.set(g.x, hAt(g.x, g.z), g.z);
        const happy = g.state === 'happy';
        const anim = window.little_adventureAnim;
        const ch = window.little_adventureCharacters;
        // Q-12 respawn puff-in scale
        if (m.userData.respawnT > 0) {
          m.userData.respawnT = Math.max(0, m.userData.respawnT - dt);
          const rt = 1 - (m.userData.respawnT / 0.35);
          const sc = 0.6 + 0.4 * (anim && anim.outBack ? anim.outBack(Math.max(0, Math.min(1, rt))) : rt);
          m.scale.setScalar(sc);
        } else if (m.scale.x !== 1) { m.scale.setScalar(1); }
        if (m.userData && m.userData.pivots && anim && anim.evalGrumpy && ch && ch.applyPose) {
          let rg = g;
          // Q-12 boss stomp ring/crown wobble (renderer-only, no logic mutation)
          if (g.role === 'boss' && !happy && (g.respawnTimer || 0) <= 0) {
            m.userData.stompT = (m.userData.stompT || 0) + dt;
            const cycle = 2.4;
            const win = 0.8; // stomp duration inside cycle
            const ct = m.userData.stompT % cycle;
            if (ct < win) {
              const sf = ct / win;
              rg = Object.assign({}, g, { state: 'bossStomp', stompFrac: sf });
              if (sf > 0.45 && !m.userData.stompDidRing && !reducedMotion) {
                m.userData.stompDidRing = true;
                const ringN = tier === 'low' ? 4 : 8;
                let rn = 0;
                for (const p of particles) {
                  if (rn >= ringN) break;
                  if (!p.alive) {
                    const a = (rn / ringN) * Math.PI * 2;
                    p.alive = true; p.x = g.x + Math.cos(a) * 0.6; p.y = hAt(g.x, g.z) + 0.05; p.z = g.z + Math.sin(a) * 0.6;
                    p.vx = Math.cos(a) * 1.2; p.vy = 0.2 + Math.random() * 0.2; p.vz = Math.sin(a) * 1.2;
                    p.life = 500; p.color = 0xD2B48C; p.additive = false; rn++;
                  }
                }
              }
              if (sf < 0.1) m.userData.stompDidRing = false;
            } else {
              m.userData.stompDidRing = false;
            }
          } else { m.userData.stompT = 0; m.userData.stompDidRing = false; }
          const pose = anim.evalGrumpy(rg, s.t / 1000, { motionScale: reducedMotion ? 0.4 : 1 });
          if (winFX && happy && !reducedMotion) { pose.root = pose.root || {}; pose.root.py = (pose.root.py || 0) + Math.abs(Math.sin(s.t * 0.008 + (g.x || 0))) * 0.12; }
          ch.applyPose(m, pose);
          if (m.userData.setFace) m.userData.setFace(happy ? 'happy' : (g.state === 'hit' ? 'strain' : 'grumpy'));
          const matsU = m.userData.materials || {};
          if (matsU.body && matsU.body.color) matsU.body.color.setHex(happy ? 0xFFD86B : 0xC9708F);
          if (matsU.belly && matsU.belly.color) matsU.belly.color.setHex(happy ? 0xFFF0A8 : 0xE6A3BA);
          const bodyP = m.userData.pivots.body;
          if (bodyP) bodyP.rotation.y = (g.facing || 0);
          const crownP = m.userData.pivots.crown;
          if (crownP && g.role === 'boss') { crownP.rotation.z = (reducedMotion ? 0 : Math.sin(s.t * 0.008) * 0.08); crownP.rotation.x = (rg.state === 'bossStomp' ? Math.sin((rg.stompFrac || 0) * Math.PI) * 0.15 : 0); }
        } else {
          if (m.children.length && m.children[0].isMesh && m.children[0].material && m.children[0].material.color) {
            m.children[0].material.color.setHex(happy ? 0xFFD86B : 0xC06C84);
          }
          m.traverse((o) => { if (o.name === 'smile') o.visible = happy; if (o.name === 'eyebrows') o.visible = !happy; });
        }
      });

      // owl
      if (owlMesh && owlMesh.userData && owlMesh.userData.pivots && window.little_adventureAnim && window.little_adventureAnim.evalOwl && window.little_adventureCharacters && window.little_adventureCharacters.applyPose) {
        const owlCfgNow = (cfg.npcs || [])[0];
        const owlCelebrate = !!(winFX && !reducedMotion);
        const owlPose = window.little_adventureAnim.evalOwl(owlCfgNow, { x: s.hero.x, z: s.hero.z }, !!s.lastSpeech || owlCelebrate, s.t / 1000, { motionScale: reducedMotion ? 0.4 : 1 });
        if (owlCelebrate) { owlPose.root = owlPose.root || {}; owlPose.root.py = (owlPose.root.py || 0) + Math.abs(Math.sin(s.t * 0.01)) * 0.08; }
        window.little_adventureCharacters.applyPose(owlMesh, owlPose);
      }

      // items
      for (const id in s.items) {
        const it = s.items[id];
        const m = itemMeshes[id];
        if (!m) continue;
        const halo = m.getObjectByName('halo');
        if (halo) { halo.rotation.z += dt * 1.2; if (halo.material) halo.material.opacity = 0.18 + 0.08 * Math.sin(s.t * 0.004 + id.charCodeAt(0)); }
        if (it.state === 'world') {
          m.visible = true;
          const tx = it.x, ty = hAt(it.x, it.z) + 0.8 + Math.sin(s.t * 0.003 + id.charCodeAt(0)) * 0.15, tz = it.z;
          if (m.userData.prevState === 'carried') { m.userData.prevState = 'world'; }
          m.position.set(tx, ty, tz);
          m.rotation.y += 0.02;
          m.userData.prevState = 'world';
        } else if (it.state === 'carried') {
          m.visible = true;
          const idx = s.carry.indexOf(id);
          const ang = (idx / Math.max(1, s.carry.length)) * Math.PI - Math.PI / 2;
          const tx = s.hero.x + Math.cos(ang) * 1.2;
          const ty = hAt(s.hero.x, s.hero.z) + 0.9 + Math.sin(s.t * 0.004 + idx) * 0.05;
          const tz = s.hero.z + Math.sin(ang) * 1.2;
          if (m.userData.prevState !== 'carried') { m.userData.carryT = 0; m.userData.from = m.position.clone(); m.userData.prevState = 'carried'; }
          m.userData.carryT = Math.min(1, (m.userData.carryT || 0) + dt * 3.5);
          const tArc = m.userData.carryT;
          const from = m.userData.from || m.position;
          const arcY = Math.sin(tArc * Math.PI) * 1.2;
          m.position.x += (from.x + (tx - from.x) * tArc - m.position.x) * Math.min(1, dt * 8);
          m.position.z += (from.z + (tz - from.z) * tArc - m.position.z) * Math.min(1, dt * 8);
          m.position.y += (from.y + (ty - from.y) * tArc + arcY * (1 - tArc) - m.position.y) * Math.min(1, dt * 8);
          if (tArc >= 1) { m.position.x += (tx - m.position.x) * Math.min(1, dt * 6); m.position.z += (tz - m.position.z) * Math.min(1, dt * 6); m.position.y += (ty - m.position.y) * Math.min(1, dt * 6); }
          m.rotation.y += 0.03;
        } else {
          m.visible = false;
          m.userData.prevState = it.state;
        }
      }

      // chests
      for (const id in s.chests) {
        const c = chestMeshes[id];
        if (!c || !c.lid) continue;
        const open = !!s.chests[id].open;
        c._openT = (c._openT == null) ? (open ? 1 : 0) : c._openT;
        const target = open ? 1 : 0;
        c._openT += (target - c._openT) * Math.min(1, dt * 6);
        const ease = (window.little_adventureAnim && window.little_adventureAnim.outBack) ? window.little_adventureAnim.outBack(Math.max(0, Math.min(1, c._openT))) : c._openT;
        c.lid.rotation.x = -Math.PI / 2 * Math.max(0, Math.min(1.1, ease));
      }

      // gates
      for (const id in s.gates) {
        const m = gateMeshes[id];
        if (!m) continue;
        const openT = s.gates[id].openT || 0;
        const openAmt = s.gates[id].open ? (openT > 0 ? Math.min(openT / 500, 1) : 1) : 0;
        m.position.y = -openAmt * 1.2;
        const leafL = m.getObjectByName('gateLeafL'); const leafR = m.getObjectByName('gateLeafR');
        if (leafL) leafL.rotation.y = -openAmt * Math.PI / 2;
        if (leafR) leafR.rotation.y = openAmt * Math.PI / 2;
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
          p.ring.scale.setScalar(lit ? 1.15 + Math.sin(s.t * 0.004) * 0.05 : 1);
          if (p.ring.material && 'emissive' in p.ring.material) { if (!p.ring.userData.ownMat) { p.ring.material = p.ring.material.clone(); p.ring.userData.ownMat = true; } p.ring.material.emissive.setHex(lit ? 0x332200 : 0x000000); }
        }
        const beam = p.mesh.getObjectByName('beam');
        if (beam && beam.material) { if (!beam.userData.ownMat) { beam.material = beam.material.clone(); beam.userData.ownMat = true; } beam.material.opacity = lit ? 0.22 + 0.08 * Math.sin(s.t * 0.005) : 0; beam.visible = lit; }
        const gemId = 'gem' + id.charAt(0).toUpperCase() + id.slice(1);
        const nearGem = !lit && (s.carry || []).indexOf(gemId) !== -1;
        p.mesh.traverse(o => { if (o.isMesh && o.material && 'emissive' in o.material && o !== p.ring) { if (!o.userData.ownMat) { o.material = o.material.clone(); o.userData.ownMat = true; } o.material.emissive.setHex(nearGem ? 0x333300 : 0x000000); } });
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
          if (winFX && m.material) {
            if (!m.userData.ownMat) { m.material = m.material.clone(); m.userData.ownMat = true; }
            if ('emissive' in m.material) m.material.emissive.setHex(0x221100);
            if ('emissiveIntensity' in m.material) m.material.emissiveIntensity = 0.35 + 0.15 * Math.sin(s.t * 0.008 + i);
          }
        });
      }
      // lighthouse light
      if (lighthouseLight) {
        lighthouseLight.visible = !!(s.bridge && s.bridge.built);
        if (lighthouseLight.visible) {
          if (!lighthouseLight.userData.ownMat && lighthouseLight.material) { lighthouseLight.material = lighthouseLight.material.clone(); lighthouseLight.userData.ownMat = true; }
          if (lighthouseLight.material && 'emissiveIntensity' in lighthouseLight.material) lighthouseLight.material.emissiveIntensity = winFX ? 0.9 : 0.4;
        }
      }
      if (lighthouseBeam) {
        const beamOn = !!(s.bridge && s.bridge.built);
        lighthouseBeam.visible = beamOn;
        if (lighthouseBeam.material) {
          if (!lighthouseBeam.userData.ownMat) { lighthouseBeam.material = lighthouseBeam.material.clone(); lighthouseBeam.userData.ownMat = true; }
          lighthouseBeam.material.opacity = beamOn ? (winFX ? 0.28 : 0.08) : 0;
        }
        if (beamOn) lighthouseBeam.rotation.z += dt * (winFX ? 1.8 : 0.8);
      }

      // statue mouth charge-glow (Q-13 AC)
      if (statueMesh && s.statue) {
        const mouth = statueMesh.getObjectByName('statueMouth');
        if (mouth && mouth.material) {
          if (!mouth.userData.ownMat) { mouth.material = mouth.material.clone(); mouth.userData.ownMat = true; }
          const nt = s.statue.nextT || 0;
          const glow = nt < 800 ? (1 - nt / 800) : 0;
          mouth.material.emissive.setHex(glow > 0 ? 0xFF6622 : 0x331100);
          if ('emissiveIntensity' in mouth.material) mouth.material.emissiveIntensity = 0.2 + glow * 1.2;
        }
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
      waterSparkles.visible = tier === 'low';
      if (waterSparkles.visible) {
        const wt = waterUniforms.uTime.value;
        for (let i = 0; i < waterSparkleCount; i++) {
          const b = waterSparkleBase[i];
          waterSparklePos[i*3] = b.x + Math.sin(wt * 0.6 + b.ph) * 0.25;
          waterSparklePos[i*3+1] = 0.06 + 0.03 * Math.sin(wt * 1.8 + b.ph);
          waterSparklePos[i*3+2] = b.z + Math.cos(wt * 0.5 + b.ph) * 0.25;
        }
        waterSparkleGeo.attributes.position.needsUpdate = true;
        waterSparkleMat.opacity = 0.55 + 0.35 * (0.5 + 0.5 * Math.sin(wt * 2.2));
      }
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

      updateActors(dt / 1000);
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