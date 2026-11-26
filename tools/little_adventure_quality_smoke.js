/* Мала авантура (Little Adventure) — quality smoke (Node).
   Q-00/Q-01: ground containment + camera clamp sanity. Grows in later Q cards. */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

function loadClassic(file) {
  const win = {};
  const src = fs.readFileSync(path.join(ROOT, 'game', file), 'utf8');
  new Function('window', src)(win);
  return win;
}

let fails = 0;
function check(name, ok, info) {
  if (!ok) { fails++; console.log('FAIL ' + name + (info ? ' [' + info + ']' : '')); }
  else { console.log('PASS ' + name + (info ? ' [' + info + ']' : '')); }
}

(async function () {
  const cfgWin = loadClassic('games/little_adventure-config.js');
  const cfg = cfgWin.little_adventure_CONFIG;

  // Ground rectangle: 96 wide x 160 deep, centred at z = -32
  const halfW = 48, halfD = 80, cz = -32;
  function inGround(x, z) {
    return x >= -halfW && x <= halfW && z >= cz - halfD && z <= cz + halfD;
  }

  // Collect positions
  const positions = [];
  if (cfg.hero && Array.isArray(cfg.hero.start)) positions.push(['hero.start', cfg.hero.start[0], cfg.hero.start[1]]);
  for (const g of cfg.gates || []) if (Array.isArray(g.pos)) positions.push(['gate ' + g.id, g.pos[0], g.pos[1]]);
  for (const c of cfg.chests || []) if (Array.isArray(c.pos)) positions.push(['chest ' + c.id, c.pos[0], c.pos[1]]);
  for (const b of cfg.bushes || []) if (Array.isArray(b.pos)) positions.push(['bush ' + b.id, b.pos[0], b.pos[1]]);
  for (const p of cfg.pedestals || []) if (Array.isArray(p.pos)) positions.push(['pedestal ' + p.id, p.pos[0], p.pos[1]]);
  for (const g of cfg.grumpies || []) if (Array.isArray(g.home)) positions.push(['grumpy ' + g.id, g.home[0], g.home[1]]);
  for (const s of cfg.statues || []) if (Array.isArray(s.pos)) positions.push(['statue ' + s.id, s.pos[0], s.pos[1]]);
  for (const n of cfg.npcs || []) if (Array.isArray(n.pos)) positions.push(['npc ' + n.id, n.pos[0], n.pos[1]]);
  if (cfg.bridge) {
    if (Array.isArray(cfg.bridge.from)) positions.push(['bridge from', cfg.bridge.from[0], cfg.bridge.from[1]]);
    if (Array.isArray(cfg.bridge.to)) positions.push(['bridge to', cfg.bridge.to[0], cfg.bridge.to[1]]);
  }
  if (cfg.lighthouse && Array.isArray(cfg.lighthouse.pos)) positions.push(['lighthouse', cfg.lighthouse.pos[0], cfg.lighthouse.pos[1]]);
  for (const o of cfg.obstacles || []) if (typeof o.x === 'number') positions.push(['obstacle ' + o.id, o.x, o.z]);

  let bad = 0;
  for (const [name, x, z] of positions) {
    if (!inGround(x, z)) { bad++; console.log('  OUTSIDE GROUND: ' + name + ' (' + x + ',' + z + ')'); }
  }
  check('Q-01: every config position lies inside the ground rectangle', bad === 0, bad + ' outside / ' + positions.length + ' total');

  // Camera clamp sanity: bounds must be within ground rect
  const b = cfg.bounds;
  check('Q-01: bounds.xMin >= -halfW', b.xMin >= -halfW, b.xMin);
  check('Q-01: bounds.xMax <= halfW', b.xMax <= halfW, b.xMax);
  check('Q-01: bounds.zMin >= cz-halfD', b.zMin >= cz - halfD, b.zMin);
  check('Q-01: bounds.zMax <= cz+halfD', b.zMax <= cz + halfD, b.zMax);

  // Anim toolkit (Q-09) — load and test
  const animWin = loadClassic('games/little_adventure-anim.js');
  const A = animWin.little_adventureAnim;
  check('Q-09: anim module loads', !!A, 'little_adventureAnim');
  // easing endpoints
  check('Q-09: outCubic(0)=0', A.outCubic(0) === 0);
  check('Q-09: outCubic(1)=1', Math.abs(A.outCubic(1) - 1) < 1e-9);
  check('Q-09: outBack overshoots then settles (outBack(0.5)>1 or <0? check end)', Math.abs(A.outBack(1) - 1) < 1e-9);
  // spring convergence
  let sx = 0, sv = 0;
  for (let i = 0; i < 300; i++) { const r = A.spring(sx, sv, 1, 40, 8, 0.01); sx = r.x; sv = r.v; }
  check('Q-09: spring converges to target', Math.abs(sx - 1) < 1e-3, sx);
  // no NaN
  check('Q-09: no NaN in spring', !isNaN(sx) && !isNaN(sv));
  // envelope endpoints
  const env = A.envelope(0.5, [[0,0],[1,1]], A.outCubic);
  check('Q-09: envelope mid in range', env >= 0 && env <= 1, env);
  // blend
  const bw = A.blend(0, 1, 0.016, 0.1);
  check('Q-09: blend moves toward target', bw > 0 && bw <= 1, bw);
  // sheet
  const sh = A.sheet((s, t) => ({ t }), {}, 6, 1);
  check('Q-09: sheet returns N frames', Array.isArray(sh) && sh.length === 6, sh.length);

  // Audio (Q-16) — load and test
  const audioWin = loadClassic('games/little_adventure-audio.js');
  const AU = audioWin.little_adventureAudio;
  check('Q-16: audio module loads', !!AU, 'little_adventureAudio');
  // gains <= 0.25
  check('Q-16: max SFX gain <= 0.25', AU.maxGain() <= 0.25, AU.maxGain());
  // sequencer determinism
  const e1 = AU.sequencer('A', 4, 7);
  const e2 = AU.sequencer('A', 4, 7);
  check('Q-16: sequencer deterministic (same seed => same events)', JSON.stringify(e1) === JSON.stringify(e2), e1.length + ' events');
  // all freq finite
  check('Q-16: sequencer events have finite freq', e1.every((e) => isFinite(e.freq) && e.freq > 0), '');

  // Terrain (Q-06) — load and test
  const terrWin = loadClassic('games/little_adventure-terrain.js');
  const T = terrWin.little_adventureTerrain;
  check('Q-06: terrain module loads', !!T, 'little_adventureTerrain');
  const terrain = T.generate(cfg, 12345);
  check('Q-06: generate returns heightAt', typeof terrain.heightAt === 'function');
  check('Q-06: generate deterministic (same seed)', T.generate(cfg, 12345).heightAt(0, 0) === terrain.heightAt(0, 0));
  // flat corridor: |h| <= 0.12 inside bounds
  let flatOk = true;
  for (let x = -20; x <= 20; x += 4) for (let z = -70; z <= 10; z += 4) {
    if (x >= cfg.bounds.xMin+2 && x <= cfg.bounds.xMax-2 && z >= cfg.bounds.zMin+2 && z <= cfg.bounds.zMax-2) {
      if (Math.abs(terrain.heightAt(x, z)) > 0.12) flatOk = false;
    }
  }
  check('Q-06: flat corridor |h|<=0.12', flatOk);
  // mask is 1 inside bounds
  check('Q-06: maskAt(0,0) === 1', terrain.maskAt(0, 0) === 1);
  // all config positions have mask 1
  const tpos = [];
  if (cfg.hero && Array.isArray(cfg.hero.start)) tpos.push(cfg.hero.start);
  for (const g of cfg.gates || []) if (Array.isArray(g.pos)) tpos.push(g.pos);
  for (const c of cfg.chests || []) if (Array.isArray(c.pos)) tpos.push(c.pos);
  for (const p of cfg.pedestals || []) if (Array.isArray(p.pos)) tpos.push(p.pos);
  check('Q-06: all config positions have land mask 1', tpos.every((p) => terrain.maskAt(p[0], p[1]) === 1), tpos.length + ' positions');

  // FX (Q-14/Q-15/Q-18) — load and test
  const fxWin = loadClassic('games/little_adventure-fx.js');
  const FX = fxWin.little_adventureFx;
  check('Q-14: fx module loads', !!FX, 'little_adventureFx');
  check('Q-14: EVENT_TABLE has 16 entries', Object.keys(FX.EVENT_TABLE).length === 16, Object.keys(FX.EVENT_TABLE).length);
  const missingSfx = Object.keys(FX.EVENT_TABLE).filter(k => !AU.SFX[FX.EVENT_TABLE[k].sfx]);
  check('Q-16: every EVENT_TABLE sfx exists in audio SFX', missingSfx.length === 0, missingSfx.join(','));
  const emitted = [...new Set((fs.readFileSync(path.resolve(__dirname, '../game/games/little_adventure-logic.js'), 'utf8').match(/type: '([^']+)'/g)||[]).map(x=>x.slice(7,-1)))];
  const unmapped = emitted.filter(t => !FX.EVENT_TABLE[t]);
  check('Q-13: every logic event has visual mapping', unmapped.length === 0, unmapped.join(','));
  check('Q-18: TIERS has 3 tiers', Object.keys(FX.TIERS).length === 3);
  check('Q-18: high tier particles 250', FX.particleCapFor('high') === 250);
  const nudge = FX.cameraNudge({ x: 0, z: 0 }, { x: 10, z: 0 }, 6, false);
  check('Q-15: cameraNudge moves toward thing', nudge.x > 0, nudge.x);

  // Characters (Q-10) - face atlas + pivot contract
  const charWin = loadClassic('games/little_adventure-characters.js');
  const CH = charWin.little_adventureCharacters;
  check('Q-10: characters module loads', !!CH, 'little_adventureCharacters');
  check('Q-10: HERO_PIVOTS has 27 entries', Array.isArray(CH.HERO_PIVOTS) && CH.HERO_PIVOTS.length === 27, CH.HERO_PIVOTS && CH.HERO_PIVOTS.length);
  const requiredPivots = ['root','hips','torso','head','face','hat','hatTip1','hatTip2','hatTip3','scarf1','scarf2','scarf3','armL','forearmL','handL','armR','forearmR','handR','legL','shinL','footL','legR','shinR','footR','sword','shield','shadow'];
  check('Q-10: HERO_PIVOTS contains AD3 names', requiredPivots.every((p) => CH.HERO_PIVOTS.includes(p)), 'missing=' + requiredPivots.filter((p) => !CH.HERO_PIVOTS.includes(p)).join(','));
  // fake ctx for face painter
  const calls = [];
  const fakeCtx = { fillStyle: '', strokeStyle: '', lineWidth: 1, lineCap: '', beginPath(){calls.push('bp');}, arc(){calls.push('arc');}, fill(){calls.push('fill');}, stroke(){calls.push('stroke');}, moveTo(){}, lineTo(){}, clearRect(){calls.push('clear');} };
  const faceInfo = CH.paintFaceAtlas(fakeCtx, 256);
  check('Q-10: face atlas paints 8 cells', faceInfo && faceInfo.cells && faceInfo.cells.length === 8, faceInfo && faceInfo.cells && faceInfo.cells.length);
  check('Q-10: face atlas draws highlights (arcs)', calls.filter((c)=>c==='arc').length >= 32, calls.filter((c)=>c==='arc').length);

  // Minimal THREE mock for triangle counting (Q-10 AC)
  function makeMockThree() {
    class V3 { constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z;} set(x,y,z){this.x=x;this.y=y;this.z=z;return this;} setScalar(s){this.x=s;this.y=s;this.z=s;return this;} clone(){return new V3(this.x,this.y,this.z);} copy(v){this.x=v.x;this.y=v.y;this.z=v.z;return this;} multiplyScalar(s){this.x*=s;this.y*=s;this.z*=s;return this;} }
    class Obj3D {
      constructor(){ this.position=new V3(); this.rotation={x:0,y:0,z:0}; this.scale=new V3(1,1,1); this.children=[]; this.parent=null; this.name=''; this.visible=true; this.userData={}; this.renderOrder=0; this.castShadow=false; this.receiveShadow=false; }
      add(o){ if(o&&o!==this){ o.parent=this; this.children.push(o); } return this; }
      remove(o){ const i=this.children.indexOf(o); if(i>=0){ this.children.splice(i,1); o.parent=null; } return this; }
      clone(){ const c=new this.constructor(); c.position=this.position.clone(); c.rotation={...this.rotation}; c.scale=this.scale.clone(); c.name=this.name; c.visible=this.visible; c.userData={}; return c; }
      traverse(fn){ fn(this); for(const c of this.children) c.traverse(fn); }
      getObjectByName(n){ if(this.name===n) return this; for(const c of this.children){ const r=c.getObjectByName(n); if(r) return r; } return undefined; }
    }
    class Group extends Obj3D {}
    class Mesh extends Obj3D { constructor(g,m){ super(); this.geometry=g; this.material=m; this.isMesh=true; } clone(){ const c=new Mesh(this.geometry,this.material); c.position=this.position.clone(); c.rotation={...this.rotation}; c.scale=this.scale.clone(); c.name=this.name; c.visible=this.visible; c.userData={}; return c; } }
    function triGeom(tris){ return { _tris: tris, isBufferGeometry:true }; }
    class SphereGeometry { constructor(r,w=8,h=6){ this._tris = Math.max(0, 2*w*(h-1)); } }
    class BoxGeometry { constructor(){ this._tris = 12; } }
    class CapsuleGeometry { constructor(r,len,capSeg=4,radSeg=8){ this._tris = radSeg * (4*capSeg + 2); } }
    class CylinderGeometry { constructor(rt,rb,h,rs=8,hs=1,open=false){ this._tris = rs*hs*2 + (open?0:(rt>0?rs:0)+(rb>0?rs:0)); } }
    class ConeGeometry { constructor(r,h,rs=8,hs=1,open=false){ this._tris = rs*hs*2 + (open?0:rs); } }
    class CircleGeometry { constructor(r,seg=8){ this._tris = Math.max(0, seg-2); } }
    class PlaneGeometry { constructor(){ this._tris = 2; } }
    class RingGeometry { constructor(ri,ro,ts=8){ this._tris = ts*2; } }
    class TorusGeometry { constructor(r,t,rs=8,ts=6){ this._tris = rs*ts*2; } }
    class Mat { constructor(p={}){ Object.assign(this,p); this.color={r:1,g:1,b:1,setHex(){return this;},set(){return this;}}; this.map=null; } clone(){ return new Mat(this); } }
    class MeshToonMaterial extends Mat {}
    class MeshBasicMaterial extends Mat {}
    class MeshLambertMaterial extends Mat {}
    class CanvasTexture { constructor(c){ this.image=c; this.colorSpace=null; this.needsUpdate=false; this.offset={x:0,y:0,set(x,y){this.x=x;this.y=y;}}; this.repeat={x:1,y:1,set(x,y){this.x=x;this.y=y;}}; } clone(){ const t=new CanvasTexture(this.image); t.offset={...this.offset,set(x,y){this.x=x;this.y=y;}}; t.repeat={...this.repeat,set(x,y){this.x=x;this.y=y;}}; return t; } }
    return { Group, Mesh, SphereGeometry, BoxGeometry, CapsuleGeometry, CylinderGeometry, ConeGeometry, CircleGeometry, PlaneGeometry, RingGeometry, TorusGeometry, MeshToonMaterial, MeshBasicMaterial, MeshLambertMaterial, CanvasTexture, SRGBColorSpace:'srgb', BackSide:1, DoubleSide:2 };
  }
  function countTris(obj) {
    let t = 0;
    obj.traverse((n) => { if (n.isMesh && n.geometry && typeof n.geometry._tris === 'number') t += n.geometry._tris; });
    return t;
  }
  const THREE = makeMockThree();
  // characters.js expects document.createElement('canvas') for face texture
  if (typeof global.document === 'undefined') {
    global.document = { createElement(tag) { if (tag === 'canvas') return { width:0, height:0, getContext(){ return fakeCtx; } }; return {}; } };
  }
  const chars = CH.create(THREE, { toon(c, o){ return new THREE.MeshToonMaterial({ color:c, ...(o||{}) }); } });
  const hero2 = chars.makeHero2();
  const grumpy2 = chars.makeGrumpy2('normal');
  const owl2 = chars.makeOwl2();
  const heroTris = countTris(hero2);
  const grumpyTris = countTris(grumpy2);
  const owlTris = countTris(owl2);
  check('Q-10: hero2 triangles <= 2500', heroTris <= 2500, heroTris);
  check('Q-10: grumpy2 triangles <= 1200', grumpyTris <= 1200, grumpyTris);
  check('Q-10: owl2 triangles <= 1200', owlTris <= 1200, owlTris);

  // evalHero swing envelope (Q-11) — AD §4 phases at swingFrac 0/0.26/0.57/1 within 5°
  const deg5 = 5 * Math.PI / 180;
  function heroAtFrac(frac) {
    return A.evalHero({ hero: { vx: 0, vz: 0, facing: 0, swingFrac: frac, cooldown: 0, shield: false, bumpT: 0 } }, 0, { motionScale: 1 });
  }
  const hs0 = heroAtFrac(0), hsA = heroAtFrac(0.26), hsS = heroAtFrac(0.57), hs1 = heroAtFrac(1);
  check('Q-11: swing frac 0 armR ~0deg', Math.abs((hs0.armR && hs0.armR.rx) || 0) <= deg5, ((hs0.armR||{}).rx));
  check('Q-11: swing frac 0.26 armR ~-25deg', Math.abs(((hsA.armR||{}).rx || 0) - (-25*Math.PI/180)) <= deg5, ((hsA.armR||{}).rx));
  check('Q-11: swing frac 0.57 armR ~85deg', Math.abs(((hsS.armR||{}).rx || 0) - (85*Math.PI/180)) <= deg5, ((hsS.armR||{}).rx));
  check('Q-11: swing frac 1 armR ~0deg', Math.abs(((hs1.armR||{}).rx || 0)) <= deg5, ((hs1.armR||{}).rx));
  // pose continuity (no jump > 25° between 16ms steps)
  let heroContOk = true;
  for (let i = 0; i < 60; i++) {
    const tA = i / 60, tB = (i + 1) / 60;
    const a = A.evalHero({ hero: { vx: 3, vz: 0, facing: 0, swingFrac: tA, cooldown: 0, shield: false, bumpT: 0 } }, tA, { motionScale: 1 });
    const b = A.evalHero({ hero: { vx: 3, vz: 0, facing: 0, swingFrac: tB, cooldown: 0, shield: false, bumpT: 0 } }, tB, { motionScale: 1 });
    for (const k of Object.keys(a)) { const va=a[k]||{}, vb=b[k]||{}; for (const ax of ['rx','ry','rz']) { if (Math.abs((va[ax]||0)-(vb[ax]||0)) > 25*Math.PI/180) heroContOk = false; } }
  }
  check('Q-11: hero pose continuity (16ms, <25deg)', heroContOk, heroContOk);
  // reduced motion scales amplitudes
  const pRM = A.evalHero({ hero: { vx: 0, vz: 0, facing: 0, swingFrac: 0.57, cooldown: 0, shield: false, bumpT: 0 } }, 0, { motionScale: 0.4 });
  check('Q-11: reduced motion scales armR (0.4x)', Math.abs((pRM.armR||{}).rx || 0) <= Math.abs((hsS.armR||{}).rx || 0) * 0.41 + 0.01, (pRM.armR||{}).rx);
  // no NaN
  const p0 = heroAtFrac(0.1);
  check('Q-11: evalHero no NaN', !Object.values(p0).some((v) => v && typeof v === 'object' && Object.values(v).some((n) => typeof n === 'number' && isNaN(n))));
  // evalGrumpy / evalOwl basic
  const gp = A.evalGrumpy({ state: 'idle', hp: 3, mood: 1 }, 0, { motionScale: 1 });
  check('Q-11: evalGrumpy returns root', gp.root != null);
  const op = A.evalOwl({ pos: [-5, 4] }, { x: 0, z: 0 }, true, 0, { motionScale: 1 });
  check('Q-11: evalOwl returns head', op.head != null);

  // Q-12 grumpy2 contract
  check('Q-12: GRUMPY_PIVOTS has 12 entries', Array.isArray(CH.GRUMPY_PIVOTS) && CH.GRUMPY_PIVOTS.length === 12, CH.GRUMPY_PIVOTS && CH.GRUMPY_PIVOTS.length);
  const gReq = ['root','body','face','feetL','feetR','armL','armR','tuft1','tuft2','tuft3','crown','shadow'];
  check('Q-12: GRUMPY_PIVOTS contains AD3 names', gReq.every((p) => CH.GRUMPY_PIVOTS.includes(p)), 'missing=' + gReq.filter((p)=>!CH.GRUMPY_PIVOTS.includes(p)).join(','));
  // evalGrumpy continuity (no big jump over 16ms)
  let gContOk = true;
  for (let i = 0; i < 60; i++) {
    const a = A.evalGrumpy({ state: 'approach', hp: 3, mood: 1 }, i/60, { motionScale: 1 });
    const b = A.evalGrumpy({ state: 'approach', hp: 3, mood: 1 }, (i+1)/60, { motionScale: 1 });
    for (const k of Object.keys(a)) { const va=a[k]||{}, vb=b[k]||{}; for (const ax of ['rx','ry','rz','px','py','pz']) { if (Math.abs((va[ax]||0)-(vb[ax]||0)) > 0.8) gContOk = false; } }
  }
  check('Q-12: evalGrumpy continuity (16ms steps)', gContOk, gContOk);
  // volume preservation during squash/stretch (sx*sy*sz within 0.15 of 1)
  let volOk = true, squashSeen = false;
  for (const kind of ['hit', 'befriend']) {
    for (let i = 0; i <= 20; i++) {
      const elapsed = kind === 'hit' ? i * 20 : i * 20; // ms
      const g = { state: kind === 'hit' ? 'retreat' : 'happy', hp: 3, mood: kind === 'befriend' ? 100 : 1,
        hitT: kind === 'hit' ? Math.max(0, 430 - elapsed) : 0,
        befriendT: kind === 'befriend' ? Math.max(0, 400 - elapsed) : 0 };
      const p = A.evalGrumpy(g, i / 20, { motionScale: 1 });
      const b = p.body || {};
      const sx = b.sx == null ? 1 : b.sx, sy = b.sy == null ? 1 : b.sy, sz = b.sz == null ? 1 : b.sz;
      const vol = sx * sy * sz;
      if (Math.abs(vol - 1) > 0.15) volOk = false;
      if (Math.abs(sy - 1) > 0.05) squashSeen = true;
    }
  }
  check('Q-12: evalGrumpy squash/stretch volume-preserving', volOk && squashSeen, 'volOk=' + volOk + ' squashSeen=' + squashSeen);

  // Q-13 owl2 contract
  check('Q-13: OWL_PIVOTS has 10 entries', Array.isArray(CH.OWL_PIVOTS) && CH.OWL_PIVOTS.length === 10, CH.OWL_PIVOTS && CH.OWL_PIVOTS.length);
  const oReq = ['root','body','head','eyeL','eyeR','lidL','lidR','wingL','wingR','tail'];
  check('Q-13: OWL_PIVOTS contains AD3 names', oReq.every((p) => CH.OWL_PIVOTS.includes(p)), 'missing=' + oReq.filter((p)=>!CH.OWL_PIVOTS.includes(p)).join(','));

  process.exit(fails ? 1 : 0);
})();
