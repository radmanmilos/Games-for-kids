/* little_adventure-characters.js �?" character rigs, face atlas, pose apply (Q-10). */
(function () {
  'use strict';

  const FACE_CELLS = ['open', 'blink', 'happy', 'surprised', 'grumpy', 'strain', 'talk-a', 'talk-b'];
  const HERO_PIVOTS = ['root','hips','torso','head','face','hat','hatTip1','hatTip2','hatTip3','scarf1','scarf2','scarf3','armL','forearmL','handL','armR','forearmR','handR','legL','shinL','footL','legR','shinR','footR','sword','shield','shadow'];
  const GRUMPY_PIVOTS = ['root','body','face','feetL','feetR','armL','armR','tuft1','tuft2','tuft3','crown','shadow'];

  function paintFaceAtlas(ctx, size) {
    const w = size || 256, h = Math.floor(w / 2);
    const cols = 4, rows = 2, cw = w / cols, ch = h / rows;
    ctx.clearRect(0, 0, w, h);
    FACE_CELLS.forEach((name, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      const cx = col * cw + cw / 2, cy = row * ch + ch / 2;
      const eyeY = cy - ch * 0.08, eyeDx = cw * 0.14, r = cw * 0.08;
      // sclera
      ctx.fillStyle = '#FFFFFF';
      [ -1, 1 ].forEach((s) => { ctx.beginPath(); ctx.arc(cx + s * eyeDx, eyeY, r, 0, Math.PI * 2); ctx.fill(); });
      // pupils/highlights per expression
      let pupilR = r * 0.55, pupilDy = 0, lid = 0, mouth = 'smile';
      if (name === 'blink') { lid = 1; }
      if (name === 'happy') { mouth = 'happy'; pupilDy = -r * 0.1; }
      if (name === 'surprised') { pupilR = r * 0.45; mouth = 'o'; }
      if (name === 'grumpy') { mouth = 'frown'; }
      if (name === 'strain') { mouth = 'grit'; pupilDy = r * 0.1; }
      if (name === 'talk-a') { mouth = 'o'; }
      if (name === 'talk-b') { mouth = 'smile'; }
      ctx.fillStyle = '#2C2137';
      if (lid) {
        ctx.strokeStyle = '#2C2137'; ctx.lineWidth = Math.max(1, w * 0.008);
        [ -1, 1 ].forEach((s) => { ctx.beginPath(); ctx.moveTo(cx + s * eyeDx - r, eyeY); ctx.lineTo(cx + s * eyeDx + r, eyeY); ctx.stroke(); });
      } else {
        [ -1, 1 ].forEach((s) => {
          ctx.beginPath(); ctx.arc(cx + s * eyeDx, eyeY + pupilDy, pupilR, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath(); ctx.arc(cx + s * eyeDx - pupilR * 0.35, eyeY + pupilDy - pupilR * 0.35, pupilR * 0.28, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(cx + s * eyeDx + pupilR * 0.25, eyeY + pupilDy + pupilR * 0.1, pupilR * 0.14, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#2C2137';
        });
      }
      // brows
      ctx.strokeStyle = '#5A3A2A'; ctx.lineWidth = Math.max(1, w * 0.01); ctx.lineCap = 'round';
      [ -1, 1 ].forEach((s) => {
        const bx = cx + s * eyeDx, by = eyeY - r * 1.4;
        const tilt = name === 'grumpy' ? s * 0.18 : (name === 'surprised' ? -s * 0.12 : 0);
        ctx.beginPath(); ctx.moveTo(bx - r * 0.9, by + tilt * ch); ctx.lineTo(bx + r * 0.9, by - tilt * ch); ctx.stroke();
      });
      // cheeks
      ctx.fillStyle = 'rgba(255,140,140,0.35)';
      [ -1, 1 ].forEach((s) => { ctx.beginPath(); ctx.arc(cx + s * eyeDx * 1.5, cy + ch * 0.08, r * 0.7, 0, Math.PI * 2); ctx.fill(); });
      // mouth
      ctx.strokeStyle = '#7A3B3B'; ctx.lineWidth = Math.max(1, w * 0.009);
      const my = cy + ch * 0.18;
      ctx.beginPath();
      if (mouth === 'happy' || mouth === 'smile') { ctx.arc(cx, my - ch * 0.04, cw * 0.08, 0.15 * Math.PI, 0.85 * Math.PI); }
      else if (mouth === 'frown') { ctx.arc(cx, my + ch * 0.06, cw * 0.07, 1.2 * Math.PI, 1.8 * Math.PI); }
      else if (mouth === 'o') { ctx.arc(cx, my, cw * 0.045, 0, Math.PI * 2); }
      else { ctx.moveTo(cx - cw * 0.06, my); ctx.lineTo(cx + cw * 0.06, my); }
      ctx.stroke();
    });
    return { width: w, height: h, cells: FACE_CELLS.slice() };
  }

  function makeFaceTexture(THREE, size) {
    const c = document.createElement('canvas');
    c.width = size || 256; c.height = Math.floor(c.width / 2);
    const ctx = c.getContext('2d');
    paintFaceAtlas(ctx, c.width);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return { texture: tex, canvas: c, cells: FACE_CELLS.slice() };
  }

  function setFaceCell(faceMesh, name) {
    if (!faceMesh || !faceMesh.material || !faceMesh.material.map) return;
    const idx = Math.max(0, FACE_CELLS.indexOf(name));
    const col = idx % 4, row = Math.floor(idx / 4);
    faceMesh.material.map.offset.set(col / 4, 1 - (row + 1) / 2);
    faceMesh.material.map.repeat.set(1 / 4, 1 / 2);
    faceMesh.material.map.needsUpdate = true;
  }

  function applyPose(rig, pose) {
    if (!rig || !rig.userData || !rig.userData.pivots || !pose) return;
    const pivots = rig.userData.pivots;
    Object.keys(pose).forEach((k) => {
      const p = pivots[k];
      const v = pose[k];
      if (!p || !v) return;
      if (v.rot) { p.rotation.x = v.rot.x || 0; p.rotation.y = v.rot.y || 0; p.rotation.z = v.rot.z || 0; }
      if (v.pos) { p.position.x = v.pos.x !== undefined ? v.pos.x : p.position.x; p.position.y = v.pos.y !== undefined ? v.pos.y : p.position.y; p.position.z = v.pos.z !== undefined ? v.pos.z : p.position.z; }
      if (v.scl) { p.scale.x = v.scl.x !== undefined ? v.scl.x : p.scale.x; p.scale.y = v.scl.y !== undefined ? v.scl.y : p.scale.y; p.scale.z = v.scl.z !== undefined ? v.scl.z : p.scale.z; }
      // shorthand: rx/ry/rz/px/py/pz/sx/sy/sz
      if (v.rx !== undefined) p.rotation.x = v.rx;
      if (v.ry !== undefined) p.rotation.y = v.ry;
      if (v.rz !== undefined) p.rotation.z = v.rz;
      if (v.px !== undefined) p.position.x = v.px;
      if (v.py !== undefined) p.position.y = v.py;
      if (v.pz !== undefined) p.position.z = v.pz;
      if (v.sx !== undefined) p.scale.x = v.sx;
      if (v.sy !== undefined) p.scale.y = v.sy;
      if (v.sz !== undefined) p.scale.z = v.sz;
    });
  }

  function create(THREE, mats) {
    const mToon = (c, o) => mats ? mats.toon(c, o) : new THREE.MeshToonMaterial({ color: c });
    const outlineMat = () => new THREE.MeshBasicMaterial({ color: 0x2C2137, side: THREE.BackSide });
    const faceTex = makeFaceTexture(THREE, 256);

    function addOutline(mesh, thickness) {
      const o = mesh.clone();
      o.material = outlineMat();
      o.scale.multiplyScalar(1 + (thickness || 0.04));
      o.renderOrder = -1;
      mesh.add(o);
      return o;
    }

    function makeHero2() {
      const root = new THREE.Group(); root.name = 'hero2';
      const pivots = {};
      const mat = (k, c, o) => { const m = mToon(c, o); (root.userData.materials = root.userData.materials || {})[k] = m; return m; };
      const bodyMat = mat('body', 0xFFF3DC);
      const skinMat = mat('skin', 0xF7CDA4);
      const hatMat = mat('hat', 0x4FB06A);
      const bootMat = mat('boot', 0x8B5A2B);
      const beltMat = mat('trim', 0xD4A017);

      const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.45, 16), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.18 }));
      shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.02; shadow.name = 'shadow'; root.add(shadow); pivots.shadow = shadow;

      const hips = new THREE.Group(); hips.name = 'hips'; hips.position.y = 0.72; root.add(hips); pivots.hips = hips;
      const torso = new THREE.Group(); torso.name = 'torso'; torso.position.y = 0.1; hips.add(torso); pivots.torso = torso;
      const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.24, 0.42, 4, 8), bodyMat); body.position.y = 0.28; body.castShadow = true; torso.add(body); addOutline(body, 0.03);
      const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.08, 12), beltMat); belt.position.y = 0.08; torso.add(belt);

      const head = new THREE.Group(); head.name = 'head'; head.position.y = 0.72; torso.add(head); pivots.head = head;
      const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.31, 16, 14), skinMat); headMesh.scale.set(1.05, 1, 1); headMesh.castShadow = true; head.add(headMesh); addOutline(headMesh, 0.03);
      const face = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.21), new THREE.MeshBasicMaterial({ map: faceTex.texture.clone(), transparent: true }));
      face.position.set(0, 0.02, 0.27); face.name = 'face'; head.add(face); pivots.face = face;
      setFaceCell(face, 'open');

      const hat = new THREE.Group(); hat.name = 'hat'; hat.position.y = 0.2; head.add(hat); pivots.hat = hat;
      const hatBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.06, 12), hatMat); hatBrim.position.y = 0.02; hat.add(hatBrim);
      const hatCone = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.45, 12), hatMat); hatCone.position.y = 0.28; hatCone.castShadow = true; hat.add(hatCone); addOutline(hatCone, 0.03);
      let prevTip = hat;
      for (let i = 1; i <= 3; i++) {
        const tip = new THREE.Group(); tip.name = 'hatTip' + i; tip.position.y = i === 1 ? 0.5 : 0.08; prevTip.add(tip); pivots['hatTip' + i] = tip;
        const seg = new THREE.Mesh(new THREE.SphereGeometry(0.04 - i * 0.008, 8, 8), mToon(i === 3 ? 0xFFF3DC : 0x4FB06A)); tip.add(seg);
        prevTip = tip;
      }

      // scarf chain
      let prevScarf = torso;
      for (let i = 1; i <= 3; i++) {
        const sc = new THREE.Group(); sc.name = 'scarf' + i; sc.position.set(0, 0.52 - i * 0.08, -0.12 - i * 0.03); prevScarf.add(sc); pivots['scarf' + i] = sc;
        const sm = new THREE.Mesh(new THREE.BoxGeometry(0.22 - i * 0.03, 0.05, 0.08), mToon(0xE4572E)); sc.add(sm);
        prevScarf = sc;
      }

      function makeArm(side) {
        const s = side === 'L' ? -1 : 1;
        const arm = new THREE.Group(); arm.name = 'arm' + side; arm.position.set(s * 0.32, 0.5, 0); torso.add(arm); pivots['arm' + side] = arm;
        const upper = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.22, 4, 8), bodyMat); upper.position.y = -0.14; upper.castShadow = true; arm.add(upper);
        const forearm = new THREE.Group(); forearm.name = 'forearm' + side; forearm.position.y = -0.28; arm.add(forearm); pivots['forearm' + side] = forearm;
        const lower = new THREE.Mesh(new THREE.CapsuleGeometry(0.065, 0.2, 4, 8), skinMat); lower.position.y = -0.12; forearm.add(lower);
        const hand = new THREE.Group(); hand.name = 'hand' + side; hand.position.y = -0.25; forearm.add(hand); pivots['hand' + side] = hand;
        const mitten = new THREE.Mesh(new THREE.SphereGeometry(0.085, 10, 8), mToon(0xFFF3DC)); hand.add(mitten);
        return { arm, forearm, hand };
      }
      const armL = makeArm('L');
      const armR = makeArm('R');

      function makeLeg(side) {
        const s = side === 'L' ? -1 : 1;
        const leg = new THREE.Group(); leg.name = 'leg' + side; leg.position.set(s * 0.12, -0.02, 0); hips.add(leg); pivots['leg' + side] = leg;
        const upper = new THREE.Mesh(new THREE.CapsuleGeometry(0.085, 0.22, 4, 8), mToon(0x6FB35A)); upper.position.y = -0.16; upper.castShadow = true; leg.add(upper);
        const shin = new THREE.Group(); shin.name = 'shin' + side; shin.position.y = -0.3; leg.add(shin); pivots['shin' + side] = shin;
        const lower = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.2, 4, 8), mToon(0x5FA04A)); lower.position.y = -0.13; shin.add(lower);
        const foot = new THREE.Group(); foot.name = 'foot' + side; foot.position.y = -0.26; shin.add(foot); pivots['foot' + side] = foot;
        const boot = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.1, 0.22), bootMat); boot.position.set(0, -0.03, 0.03); boot.castShadow = true; foot.add(boot);
        return { leg, shin, foot };
      }
      makeLeg('L'); makeLeg('R');

      // sword as child of handR
      const sword = new THREE.Group(); sword.name = 'sword'; sword.position.set(0, -0.02, 0.08); sword.rotation.x = Math.PI / 2; armR.hand.add(sword); pivots.sword = sword;
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.7, 0.03), mToon(0xD8C49A)); blade.position.y = 0.42; blade.castShadow = true; sword.add(blade); addOutline(blade, 0.03);
      const guard = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.05, 0.06), mToon(0xD4A017)); guard.position.y = 0.06; sword.add(guard);
      const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.16, 8), mToon(0x8B5A2B)); grip.position.y = -0.04; sword.add(grip);

      // shield as child of forearmL
      const shield = new THREE.Group(); shield.name = 'shield'; shield.position.set(0.02, -0.12, 0.1); shield.rotation.y = -0.3; armL.forearm.add(shield); pivots.shield = shield;
      const shieldMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.06, 16), mToon(0x5B4B8A)); shieldMesh.rotation.x = Math.PI / 2; shieldMesh.castShadow = true; shield.add(shieldMesh); addOutline(shieldMesh, 0.03);
      const shieldBoss = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), mToon(0xD4A017)); shieldBoss.position.z = 0.04; shield.add(shieldBoss);
      const shieldRim = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.02, 8, 20), mToon(0xFFF3DC)); shieldRim.rotation.x = Math.PI / 2; shield.add(shieldRim);

      // rest pose snapshot
      const rest = {};
      Object.keys(pivots).forEach((k) => {
        const p = pivots[k];
        rest[k] = { rot: { x: p.rotation.x, y: p.rotation.y, z: p.rotation.z }, pos: { x: p.position.x, y: p.position.y, z: p.position.z }, scl: { x: p.scale.x, y: p.scale.y, z: p.scale.z } };
      });

      root.userData.pivots = pivots;
      root.userData.rest = rest;
      root.userData.faceTex = faceTex;
      root.userData.setFace = (name) => setFaceCell(face, name);
      root.traverse((o) => { if (o.isMesh) { o.castShadow = o.castShadow || false; o.receiveShadow = false; } });
      return root;
    }

    function makeGrumpy2(role) {
      const isBoss = role === 'boss';
      const isGuard = role === 'guard';
      const root = new THREE.Group(); root.name = 'grumpy2';
      const pivots = {};
      const mat = (k, c, o) => { const m = mToon(c, o); (root.userData.materials = root.userData.materials || {})[k] = m; return m; };
      const scale = isBoss ? 1.8 : 1;
      root.scale.setScalar(scale);
      const bodyMat = mat('body', 0xC9708F);
      const bellyMat = mat('belly', 0xE6A3BA);
      const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.5, 16), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.18 }));
      shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.02; root.add(shadow); pivots.shadow = shadow;
      const body = new THREE.Group(); body.name = 'body'; body.position.y = 0.55; root.add(body); pivots.body = body;
      const blob = new THREE.Mesh(new THREE.SphereGeometry(0.55, 16, 14), bodyMat); blob.scale.set(1, 0.85, 1); blob.castShadow = true; body.add(blob); addOutline(blob, 0.03);
      const belly = new THREE.Mesh(new THREE.SphereGeometry(0.38, 14, 12), bellyMat); belly.position.set(0, -0.05, 0.18); belly.scale.set(1, 0.85, 0.7); body.add(belly);
      const face = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.25), new THREE.MeshBasicMaterial({ map: faceTex.texture.clone(), transparent: true }));
      face.position.set(0, 0.05, 0.45); body.add(face); pivots.face = face;
      setFaceCell(face, 'grumpy');
      function mkFoot(side) {
        const s = side === 'L' ? -1 : 1;
        const f = new THREE.Group(); f.name = 'feet' + side; f.position.set(s * 0.22, -0.42, 0.05); body.add(f); pivots['feet' + side] = f;
        const m = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), mToon(0xA85A78)); m.scale.set(1.2, 0.7, 1.4); f.add(m);
      }
      mkFoot('L'); mkFoot('R');
      function mkArm(side) {
        const s = side === 'L' ? -1 : 1;
        const a = new THREE.Group(); a.name = 'arm' + side; a.position.set(s * 0.5, 0, 0.1); body.add(a); pivots['arm' + side] = a;
        const m = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.18, 4, 8), bodyMat); m.rotation.z = s * 0.6; m.position.set(s * 0.08, -0.08, 0); a.add(m);
      }
      mkArm('L'); mkArm('R');
      for (let i = 1; i <= 3; i++) {
        const t = new THREE.Group(); t.name = 'tuft' + i; t.position.set((i - 2) * 0.12, 0.42, -0.05); body.add(t); pivots['tuft' + i] = t;
        const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), mToon(0x6FB35A)); leaf.scale.set(0.7, 1.4, 0.7); t.add(leaf);
      }
      const crown = new THREE.Group(); crown.name = 'crown'; crown.position.y = 0.55; crown.visible = !!isBoss; body.add(crown); pivots.crown = crown;
      if (isBoss) {
        for (let i = 0; i < 3; i++) {
          const c = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.2, 6), mToon(0xD4A017));
          c.position.set((i - 1) * 0.14, 0.1, 0); c.rotation.z = (i - 1) * -0.15; crown.add(c);
        }
      }
      if (isGuard) {
        const helm = new THREE.Mesh(new THREE.SphereGeometry(0.58, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), mToon(0x7BA05B));
        helm.position.y = 0.18; body.add(helm);
      }
      const rest = {};
      Object.keys(pivots).forEach((k) => { const p = pivots[k]; rest[k] = { rot: { x: p.rotation.x, y: p.rotation.y, z: p.rotation.z }, pos: { x: p.position.x, y: p.position.y, z: p.position.z }, scl: { x: p.scale.x, y: p.scale.y, z: p.scale.z } }; });
      root.userData.pivots = pivots;
      root.userData.rest = rest;
      root.userData.faceTex = faceTex;
      root.userData.setFace = (name) => setFaceCell(face, name);
      root.userData.role = role || 'normal';
      root.traverse((o) => { if (o.isMesh) { o.castShadow = o.castShadow || false; o.receiveShadow = false; } });
      return root;
    }

    return { makeHero2, makeGrumpy2, paintFaceAtlas, makeFaceTexture: () => makeFaceTexture(THREE, 256), setFaceCell, applyPose, FACE_CELLS, HERO_PIVOTS, GRUMPY_PIVOTS };
  }

  window.little_adventureCharacters = { create, paintFaceAtlas, FACE_CELLS, HERO_PIVOTS, GRUMPY_PIVOTS };
})();
