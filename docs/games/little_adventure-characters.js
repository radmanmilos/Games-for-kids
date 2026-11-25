/* little_adventure-characters.js — rigs per AD §3 (pivots named). */
(function () {
  'use strict';
  function create(THREE) {
    function makeHero2() {
      const g = new THREE.Group();
      const pivots = {};
      function pivot(name, parent) {
        const p = new THREE.Object3D();
        p.name = name;
        (parent || g).add(p);
        pivots[name] = p;
        return p;
      }
      // Body
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.3, 0.9, 8), new THREE.MeshToonMaterial({ color: 0xF2E6C9 }));
      body.position.y = 0.45;
      g.add(body);
      // Pivot names per AD §3
      const root = pivot('root', g);
      const torso = pivot('torso', root);
      const head = pivot('head', torso);
      const armL = pivot('armL', torso);
      const armR = pivot('armR', torso);
      const legL = pivot('legL', root);
      const legR = pivot('legR', root);
      const handR = pivot('handR', armR);
      const forearmL = pivot('forearmL', armL);
      // hat chain
      const hatTip1 = pivot('hatTip1', head);
      const hatTip2 = pivot('hatTip2', hatTip1);
      const hatTip3 = pivot('hatTip3', hatTip2);
      // scarf chain
      const scarf1 = pivot('scarf1', torso);
      const scarf2 = pivot('scarf2', scarf1);
      const scarf3 = pivot('scarf3', scarf2);
      // face plane
      const face = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.2), new THREE.MeshBasicMaterial({ color: 0xFFFFFF }));
      face.position.set(0, 0.85, 0.3);
      g.add(face);
      // sword child of handR
      const sword = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.6, 0.05), new THREE.MeshToonMaterial({ color: 0x888888 }));
      sword.position.y = 0.3;
      handR.add(sword);
      // shield child of forearmL
      const shield = new THREE.Mesh(new THREE.CircleGeometry(0.25, 8), new THREE.MeshToonMaterial({ color: 0x4A90D9 }));
      shield.position.set(0, 0, 0.1);
      forearmL.add(shield);
      g.userData.pivots = pivots;
      g.userData.materials = { body: body.material, face: face.material };
      g.userData.rest = {};
      for (const k in pivots) g.userData.rest[k] = { rx: 0, ry: 0, rz: 0 };
      return g;
    }

    function makeGrumpy2(role) {
      role = role || 'normal';
      const g = new THREE.Group();
      const pivots = {};
      function pivot(name, parent) {
        const p = new THREE.Object3D();
        p.name = name;
        (parent || g).add(p);
        pivots[name] = p;
        return p;
      }
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 6), new THREE.MeshToonMaterial({ color: 0x8B6F47 }));
      body.position.y = 0.5;
      g.add(body);
      const root = pivot('root', g);
      const head = pivot('head', root);
      const armL = pivot('armL', root);
      const armR = pivot('armR', root);
      const legL = pivot('legL', root);
      const legR = pivot('legR', root);
      // eyes
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 4), new THREE.MeshBasicMaterial({ color: 0x000000 }));
      eye.position.set(0.15, 0.6, 0.4);
      g.add(eye.clone());
      const eye2 = eye.clone(); eye2.position.x = -0.15; g.add(eye2);
      g.userData.pivots = pivots;
      g.userData.materials = { body: body.material };
      g.userData.rest = {};
      for (const k in pivots) g.userData.rest[k] = { rx: 0, ry: 0, rz: 0 };
      g.userData.role = role;
      return g;
    }

    function makeOwl2() {
      const g = new THREE.Group();
      const pivots = {};
      function pivot(name, parent) {
        const p = new THREE.Object3D();
        p.name = name;
        (parent || g).add(p);
        pivots[name] = p;
        return p;
      }
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 6), new THREE.MeshToonMaterial({ color: 0x8B7355 }));
      body.position.y = 0.4;
      g.add(body);
      const root = pivot('root', g);
      const head = pivot('head', root);
      const wingL = pivot('wingL', root);
      const wingR = pivot('wingR', root);
      g.userData.pivots = pivots;
      g.userData.materials = { body: body.material };
      g.userData.rest = {};
      for (const k in pivots) g.userData.rest[k] = { rx: 0, ry: 0, rz: 0 };
      return g;
    }

    function paintFaceAtlas(ctx, size) {
      // 4x2 grid of expressions
      const cells = ['open','blink','happy','surprised','grumpy','strain','talk-a','talk-b'];
      const cw = size / 4, ch = size / 2;
      for (let i = 0; i < cells.length; i++) {
        const cx = (i % 4) * cw, cy = Math.floor(i / 4) * ch;
        ctx.fillStyle = '#F2E6C9';
        ctx.fillRect(cx, cy, cw, ch);
        // two highlights per eye
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(cx + cw*0.3, cy + ch*0.3, 4, 4);
        ctx.fillRect(cx + cw*0.7, cy + ch*0.3, 4, 4);
        ctx.fillStyle = '#000000';
        ctx.fillRect(cx + cw*0.3 + 1, cy + ch*0.3 + 1, 2, 2);
        ctx.fillRect(cx + cw*0.7 + 1, cy + ch*0.3 + 1, 2, 2);
      }
      return cells;
    }

    function applyPose(rig, pose) {
      const pivots = rig.userData.pivots || {};
      for (const name in pose) {
        const p = pivots[name];
        if (!p) continue;
        const t = pose[name];
        if (t.rx != null) p.rotation.x = t.rx;
        if (t.ry != null) p.rotation.y = t.ry;
        if (t.rz != null) p.rotation.z = t.rz;
        if (t.px != null) p.position.x = t.px;
        if (t.py != null) p.position.y = t.py;
        if (t.pz != null) p.position.z = t.pz;
        if (t.sx != null) p.scale.x = t.sx;
        if (t.sy != null) p.scale.y = t.sy;
        if (t.sz != null) p.scale.z = t.sz;
      }
    }

    return { makeHero2, makeGrumpy2, makeOwl2, paintFaceAtlas, applyPose };
  }
  window.little_adventureCharacters = { create };
})();
