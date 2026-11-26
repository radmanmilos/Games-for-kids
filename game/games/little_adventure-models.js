/* little_adventure-models.js — code-built low-poly models (TD §7). Classic script. */
(function () {
  'use strict';

  window.little_adventureModels = {
    create: function (THREE) {
      const mk = (window.little_adventureMaterials && window.little_adventureMaterials.create)
        ? window.little_adventureMaterials.create(THREE)
        : null;
      function mat(color, opts) {
        if (mk && mk.toon) return mk.toon(color, opts);
        return new THREE.MeshLambertMaterial(Object.assign({ color: color, flatShading: true }, opts || {}));
      }
      const P = {
        cream: 0xFFF8ED, gold: 0xFFD23F, purple: 0x4A3F6B, hatGreen: 0x4CAF50,
        peach: 0xF6C9A0, wood: 0xA66B3A, grumpy: 0xC06C84, happy: 0xFFD86B,
        stone: 0x9AA0A6, grassA: 0x9BD37A, grassB: 0x6FB35A, shrine: 0xD9D2C0,
        water: 0x6EC6E8, gemRed: 0xE5484D, gemGreen: 0x3FBF6F, gemBlue: 0x3E8EF7,
        white: 0xFFFFFF, black: 0x222222, brown: 0x8B5A2B, tan: 0xD2B48C,
        red: 0xD32F2F, orange: 0xFF8C00, grey: 0x808080, darkGreen: 0x2E7D32
      };

      function group() { return new THREE.Group(); }
      function mesh(geo, m) { return new THREE.Mesh(geo, m); }

      function makeHero() {
        const g = group();
        const body = mesh(new THREE.CylinderGeometry(0.32, 0.4, 0.7, 8), mat( P.peach));
        body.position.y = 0.35; g.add(body);
        const head = mesh(new THREE.SphereGeometry(0.35, 10, 8), mat( P.peach));
        head.position.y = 0.95; g.add(head);
        const hat = mesh(new THREE.ConeGeometry(0.38, 0.7, 8), mat( P.hatGreen));
        hat.position.set(0, 1.45, -0.05); hat.rotation.x = -0.25; g.add(hat);
        const armR = group(); armR.name = 'armR';
        const armGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.45, 6);
        const la = mesh(armGeo, mat( P.peach)); la.position.y = -0.22; armR.add(la);
        armR.position.set(0.42, 0.75, 0); g.add(armR);
        const armL = mesh(armGeo, mat( P.peach)); armL.position.set(-0.42, 0.53, 0); g.add(armL);
        const footGeo = new THREE.BoxGeometry(0.18, 0.12, 0.28);
        const f1 = mesh(footGeo, mat( P.brown)); f1.position.set(0.12, 0.06, 0.05); g.add(f1);
        const f2 = mesh(footGeo, mat( P.brown)); f2.position.set(-0.12, 0.06, 0.05); g.add(f2);
        const eyeGeo = new THREE.SphereGeometry(0.06, 6, 4);
        const e1 = mesh(eyeGeo, mat( P.black)); e1.position.set(0.12, 1.0, 0.3); g.add(e1);
        const e2 = mesh(eyeGeo, mat( P.black)); e2.position.set(-0.12, 1.0, 0.3); g.add(e2);
        const sword = makeSword(); sword.name = 'sword'; armR.add(sword); sword.position.set(0, -0.45, 0);
        const shield = makeShield(); shield.name = 'shield'; g.add(shield); shield.position.set(-0.45, 0.6, 0.15);
        return g;
      }

      function makeSword() {
        const g = group();
        const blade = mesh(new THREE.BoxGeometry(0.08, 0.9, 0.04), mat( P.wood));
        blade.position.y = 0.45; g.add(blade);
        const guard = mesh(new THREE.BoxGeometry(0.28, 0.06, 0.1), mat( P.gold));
        guard.position.y = 0; g.add(guard);
        return g;
      }

      function makeShield() {
        const g = group();
        const disc = mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.08, 12), mat( P.purple));
        disc.rotation.x = Math.PI / 2; g.add(disc);
        const boss = mesh(new THREE.SphereGeometry(0.08, 8, 6), mat( P.gold));
        boss.position.z = 0.06; g.add(boss);
        return g;
      }

      function makeGrumpy(role) {
        const g = group();
        const body = mesh(new THREE.SphereGeometry(0.6, 12, 8), mat( P.grumpy));
        body.scale.set(1, 0.8, 1); g.add(body);
        const eyeGeo = new THREE.SphereGeometry(0.1, 6, 4);
        const e1 = mesh(eyeGeo, mat( P.black)); e1.position.set(0.18, 0.1, 0.5); g.add(e1);
        const e2 = mesh(eyeGeo, mat( P.black)); e2.position.set(-0.18, 0.1, 0.5); g.add(e2);
        const browGeo = new THREE.BoxGeometry(0.22, 0.05, 0.05);
        const b1 = mesh(browGeo, mat( P.black)); b1.position.set(0.18, 0.28, 0.45); b1.rotation.z = 0.35; b1.name = 'eyebrows'; g.add(b1);
        const b2 = mesh(browGeo, mat( P.black)); b2.position.set(-0.18, 0.28, 0.45); b2.rotation.z = -0.35; g.add(b2);
        const smile = mesh(new THREE.TorusGeometry(0.18, 0.03, 6, 10, Math.PI), mat( P.happy));
        smile.position.set(0, -0.1, 0.5); smile.rotation.x = Math.PI / 2; smile.name = 'smile'; smile.visible = false; g.add(smile);
        if (role === 'boss') {
          g.scale.set(1.8, 1.8, 1.8);
          const crown = group(); crown.name = 'crown';
          for (let i = 0; i < 3; i++) {
            const c = mesh(new THREE.ConeGeometry(0.12, 0.3, 6), mat( P.gold));
            c.position.set((i - 1) * 0.22, 0.85, 0); crown.add(c);
          }
          g.add(crown);
        }
        if (role === 'guard') {
          const leaf = mesh(new THREE.ConeGeometry(0.2, 0.35, 6), mat( P.darkGreen));
          leaf.position.set(0, 0.75, 0); g.add(leaf);
        }
        if (role === 'normal') {
          // small tuft
          const tuft = mesh(new THREE.ConeGeometry(0.12, 0.2, 6), mat( P.grumpy));
          tuft.position.set(0, 0.7, 0); g.add(tuft);
        }
        return g;
      }

      function makeOwl() {
        const g = group();
        const body = mesh(new THREE.SphereGeometry(0.5, 10, 8), mat( P.brown));
        body.scale.set(1, 1.1, 1); g.add(body);
        const eyeGeo = new THREE.SphereGeometry(0.18, 8, 6);
        const e1 = mesh(eyeGeo, mat( P.cream)); e1.position.set(0.18, 0.2, 0.4); g.add(e1);
        const e2 = mesh(eyeGeo, mat( P.cream)); e2.position.set(-0.18, 0.2, 0.4); g.add(e2);
        const p1 = mesh(new THREE.SphereGeometry(0.08, 6, 4), mat( P.black)); p1.position.set(0.18, 0.2, 0.55); g.add(p1);
        const p2 = mesh(new THREE.SphereGeometry(0.08, 6, 4), mat( P.black)); p2.position.set(-0.18, 0.2, 0.55); g.add(p2);
        const beak = mesh(new THREE.ConeGeometry(0.08, 0.2, 6), mat( P.orange));
        beak.position.set(0, 0, 0.6); beak.rotation.x = Math.PI / 2; g.add(beak);
        const wingGeo = new THREE.BoxGeometry(0.1, 0.4, 0.25);
        const w1 = mesh(wingGeo, mat( P.brown)); w1.position.set(0.45, 0, 0); g.add(w1);
        const w2 = mesh(wingGeo, mat( P.brown)); w2.position.set(-0.45, 0, 0); g.add(w2);
        const stump = mesh(new THREE.CylinderGeometry(0.3, 0.35, 0.4, 8), mat( P.wood));
        stump.position.y = -0.65; g.add(stump);
        return g;
      }

      function makeKey() {
        const g = group();
        const ring = mesh(new THREE.TorusGeometry(0.2, 0.05, 8, 12), mat( P.gold));
        ring.position.y = 0.25; g.add(ring);
        const shaft = mesh(new THREE.BoxGeometry(0.08, 0.5, 0.08), mat( P.gold));
        shaft.position.y = -0.1; g.add(shaft);
        const tooth = mesh(new THREE.BoxGeometry(0.18, 0.06, 0.08), mat( P.gold));
        tooth.position.set(0.1, -0.32, 0); g.add(tooth);
        const halo = mesh(new THREE.TorusGeometry(0.45, 0.03, 8, 24), mat(P.gold, { transparent: true, opacity: 0.25, emissive: P.gold, emissiveIntensity: 0.2 }));
        halo.name = 'halo'; halo.rotation.x = Math.PI / 2; halo.position.y = 0.05; g.add(halo);
        return g;
      }

      function makeGem(color) {
        const hex = color === 'red' ? P.gemRed : color === 'green' ? P.gemGreen : P.gemBlue;
        const g = group();
        const gem = mesh(new THREE.OctahedronGeometry(0.3), mat( hex, { emissive: hex, emissiveIntensity: 0.25 }));
        g.add(gem);
        const halo = mesh(new THREE.TorusGeometry(0.42, 0.03, 8, 24), mat(hex, { transparent: true, opacity: 0.22, emissive: hex, emissiveIntensity: 0.25 }));
        halo.name = 'halo'; halo.rotation.x = Math.PI / 2; g.add(halo);
        return g;
      }

      function makeChest() {
        const g = group();
        const base = mesh(new THREE.BoxGeometry(0.9, 0.5, 0.6), mat( P.wood));
        base.position.y = 0.25; g.add(base);
        const lid = mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.9, 8, 1, true, 0, Math.PI), mat( P.wood));
        lid.name = 'lid'; lid.rotation.z = Math.PI / 2; lid.position.set(0, 0.5, 0); g.add(lid);
        return g;
      }

      function makeGate() {
        const g = group();
        const postGeo = new THREE.CylinderGeometry(0.12, 0.12, 1.2, 6);
        const p1 = mesh(postGeo, mat( P.wood)); p1.position.set(-2.5, 0.6, 0); g.add(p1);
        const p2 = mesh(postGeo, mat( P.wood)); p2.position.set(2.5, 0.6, 0); g.add(p2);
        const topBar = mesh(new THREE.BoxGeometry(5.4, 0.16, 0.18), mat(P.wood));
        topBar.position.set(0, 1.24, 0); g.add(topBar);
        const arch = mesh(new THREE.TorusGeometry(0.45, 0.07, 6, 10, Math.PI), mat(P.gold || 0xD4A017));
        arch.position.set(0, 1.32, 0); g.add(arch);
        const leafL = new THREE.Group(); leafL.name = 'gateLeafL'; leafL.position.set(-2.4, 0, 0); g.add(leafL);
        const leafR = new THREE.Group(); leafR.name = 'gateLeafR'; leafR.position.set(2.4, 0, 0); g.add(leafR);
        const leafGeo = new THREE.BoxGeometry(2.3, 1.0, 0.12);
        const l1 = mesh(leafGeo, mat(P.wood)); l1.position.set(1.15, 0.6, 0); leafL.add(l1);
        const l2 = mesh(leafGeo, mat(P.wood)); l2.position.set(-1.15, 0.6, 0); leafR.add(l2);
        return g;
      }

      function makePedestal(color) {
        const hex = color === 'red' ? P.gemRed : color === 'green' ? P.gemGreen : P.gemBlue;
        const g = group();
        const base = mesh(new THREE.CylinderGeometry(0.45, 0.5, 0.3, 8), mat( P.stone));
        base.position.y = 0.15; g.add(base);
        const ring = mesh(new THREE.TorusGeometry(0.35, 0.05, 6, 12), mat(hex));
        ring.position.y = 0.35; ring.rotation.x = Math.PI / 2; g.add(ring);
        const beam = mesh(new THREE.CylinderGeometry(0.08, 0.18, 2.2, 8, 1, true), mat(hex, { transparent: true, opacity: 0, emissive: hex, emissiveIntensity: 0.4 }));
        beam.name = 'beam'; beam.position.y = 1.45; g.add(beam);
        return g;
      }

      function makeStatue() {
        const g = group();
        const col = mesh(new THREE.CylinderGeometry(0.25, 0.3, 1.2, 8), mat( P.stone));
        col.position.y = 0.6; g.add(col);
        const mouth = mesh(new THREE.TorusGeometry(0.2, 0.05, 6, 10), mat( P.grey, { emissive: 0x331100, emissiveIntensity: 0.2 }));
        mouth.name = 'statueMouth'; mouth.position.set(0, 0.9, 0.26); mouth.rotation.x = Math.PI / 2; g.add(mouth);
        return g;
      }

      function makeAcorn() {
        const g = group();
        const nut = mesh(new THREE.SphereGeometry(0.25, 8, 6), mat( P.brown));
        g.add(nut);
        const cap = mesh(new THREE.SphereGeometry(0.18, 8, 6), mat( P.tan));
        cap.position.y = 0.15; cap.scale.y = 0.6; g.add(cap);
        return g;
      }

      function makeLighthouse() {
        const g = group();
        const c1 = mesh(new THREE.CylinderGeometry(0.4, 0.6, 1.2, 8), mat( P.red));
        c1.position.y = 0.6; g.add(c1);
        const c2 = mesh(new THREE.CylinderGeometry(0.35, 0.4, 1.2, 8), mat( P.white));
        c2.position.y = 1.8; g.add(c2);
        const c3 = mesh(new THREE.CylinderGeometry(0.3, 0.35, 1.2, 8), mat( P.red));
        c3.position.y = 3.0; g.add(c3);
        const light = mesh(new THREE.SphereGeometry(0.35, 8, 6), mat( P.gold, { emissive: P.gold, emissiveIntensity: 0.4 }));
        light.name = 'lhLight'; light.position.y = 4.0; g.add(light);
        const beam = mesh(new THREE.ConeGeometry(1.8, 8, 12, 1, true), mat( P.gold, { transparent: true, opacity: 0, emissive: P.gold, emissiveIntensity: 0.3 }));
        beam.name = 'lhBeam'; beam.position.set(0, 4.0, 4.0); beam.rotation.x = Math.PI / 2; g.add(beam);
        return g;
      }

      function makeBridgeSegment(i) {
        const colors = [P.gemRed, P.gemGreen, P.gemBlue, P.gold, P.purple];
        const g = group();
        const seg = mesh(new THREE.BoxGeometry(0.8, 0.1, 0.4), mat( colors[i % colors.length]));
        g.add(seg);
        return g;
      }

      function makeTree() {
        const g = group();
        const trunk = mesh(new THREE.CylinderGeometry(0.12, 0.18, 0.9, 6), mat( P.wood));
        trunk.position.y = 0.45; g.add(trunk);
        const crown = mesh(new THREE.ConeGeometry(0.7, 1.4, 8), mat( P.darkGreen));
        crown.position.y = 1.6; g.add(crown);
        return g;
      }

      function makeBush() {
        const g = group();
        const b = mesh(new THREE.IcosahedronGeometry(0.5, 0), mat( P.grassB));
        b.position.y = 0.35; g.add(b);
        return g;
      }

      function makeRock() {
        const g = group();
        const r = mesh(new THREE.DodecahedronGeometry(0.4, 0), mat( P.stone));
        r.position.y = 0.2; g.add(r);
        return g;
      }

      function makeFlower() {
        const g = group();
        const stem = mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.25, 4), mat( P.darkGreen));
        stem.position.y = 0.125; g.add(stem);
        const head = mesh(new THREE.SphereGeometry(0.1, 6, 4), mat( P.gold));
        head.position.y = 0.3; g.add(head);
        return g;
      }

      const blobShadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.25 });
      function makeBlobShadow() {
        const g = group();
        const s = mesh(new THREE.CircleGeometry(0.5, 12), blobShadowMat);
        s.rotation.x = -Math.PI / 2; g.add(s);
        return g;
      }

      return {
        makeHero, makeSword, makeShield, makeOwl, makeGrumpy, makeKey, makeGem,
        makeChest, makeGate, makePedestal, makeStatue, makeAcorn, makeLighthouse,
        makeBridgeSegment, makeTree, makeBush, makeRock, makeFlower, makeBlobShadow,
        palette: P
      };
    }
  };
})();