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
  check('Q-18: TIERS has 3 tiers', Object.keys(FX.TIERS).length === 3);
  check('Q-18: high tier particles 250', FX.particleCapFor('high') === 250);
  const nudge = FX.cameraNudge({ x: 0, z: 0 }, { x: 10, z: 0 }, 6, false);
  check('Q-15: cameraNudge moves toward thing', nudge.x > 0, nudge.x);

  // evalHero swing envelope (Q-11)
  const heroState = { hero: { vx: 0, vz: 0, facing: 0, swingT: 350, cooldown: 0, shield: false, bumpT: 0 } };
  const p0 = A.evalHero(heroState, 0, { motionScale: 1 });
  const pMid = A.evalHero({ hero: { ...heroState.hero, swingT: 350 * (1 - 0.26) } }, 0, { motionScale: 1 });
  const pEnd = A.evalHero({ hero: { ...heroState.hero, swingT: 0 } }, 0, { motionScale: 1 });
  check('Q-11: evalHero returns armR', p0.armR != null);
  // reduced motion scales amplitudes
  const pRM = A.evalHero(heroState, 0, { motionScale: 0.4 });
  check('Q-11: reduced motion scales armR (0.4x)', Math.abs(pRM.armR.rx) <= Math.abs(p0.armR.rx) * 0.45 + 0.01);
  // no NaN
  check('Q-11: evalHero no NaN', !Object.values(p0).some((v) => Object.values(v).some((n) => isNaN(n))));
  // evalGrumpy
  const gp = A.evalGrumpy({ state: 'idle', hp: 3, mood: 1 }, 0, { motionScale: 1 });
  check('Q-11: evalGrumpy returns root', gp.root != null);
  // evalOwl
  const op = A.evalOwl({ pos: [-5, 4] }, { x: 0, z: 0 }, true, 0, { motionScale: 1 });
  check('Q-11: evalOwl returns head', op.head != null);

  process.exit(fails ? 1 : 0);
})();
