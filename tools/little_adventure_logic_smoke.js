/* Мала авантура (Little Adventure) — pure logic smoke (IS-03 → IS-07, TP §2 L1…L24).
   Runs in Node (no Chrome). Loads config/logic with new Function('window', src).
   Checks: L1 config valid; L2–L6 negative mutations; L7–L11 stickVector; L12–L24 IS-04 sim. */
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

(function () {
  const cfgWin = loadClassic('games/little_adventure-config.js');
  const logicWin = loadClassic('games/little_adventure-logic.js');
  const cfg = cfgWin.little_adventure_CONFIG;
  const logic = logicWin.little_adventureLogic;

  /* L1: validateConfig(cfg) returns empty array */
  const valid = logic.validateConfig(cfg);
  check('L1: config is valid (validateConfig returns [])', Array.isArray(valid) && valid.length === 0,
    valid.length ? valid.join(' | ') : 'empty');

  /* Negative mutations — each must produce >= 1 problem */
  function cloneDeep(o) { return JSON.parse(JSON.stringify(o)); }
  function testMutation(name, mutate) {
    const c = cloneDeep(cfg);
    mutate(c);
    const probs = logic.validateConfig(c);
    check('L2–L6: ' + name + ' produces >= 1 error', Array.isArray(probs) && probs.length > 0,
      probs.join(' | ') || 'none');
  }
  testMutation('unknown item id in drops', c => { c.grumpies[0].drops = 'noSuchItem'; });
  testMutation('duplicate grumpy id', c => { c.grumpies.push({ id: 'a1', role: 'normal', home: [0, 0], hits: 1 }); });
  testMutation('hero.start outside bounds', c => { c.hero.start = [100, 100]; });
  testMutation('missing speech key', c => { delete c.speech.intro; });
  testMutation('two bosses', c => { c.grumpies.push({ id: 'boss2', role: 'boss', home: [0, -50], hits: 3 }); });

  /* stickVector cases */
  const stick = logic.stickVector;
  const radius = 100, deadzone = 0.12;
  var r = stick(0, 0, radius, deadzone);
  check('L7: zero stick returns {x:0,y:0,mag:0}', r.x === 0 && r.y === 0 && r.mag === 0, JSON.stringify(r));
  r = stick(10, 0, radius, deadzone);
  check('L8: below deadzone returns zeros', r.x === 0 && r.y === 0 && r.mag === 0, JSON.stringify(r));
  r = stick(50, 0, radius, deadzone);
  check('L9: half radius returns mag 0.5', Math.abs(r.mag - 0.5) < 1e-9 && r.x === 1 && r.y === 0, JSON.stringify(r));
  r = stick(100, 0, radius, deadzone);
  check('L10: full radius returns mag 1', Math.abs(r.mag - 1) < 1e-9 && r.x === 1 && r.y === 0, JSON.stringify(r));
  r = stick(150, 0, radius, deadzone);
  check('L10b: beyond radius clamps mag to 1', r.mag === 1 && r.x === 1 && r.y === 0, JSON.stringify(r));
  r = stick(50, 50, radius, deadzone);
  var expected = 1 / Math.SQRT2;
  check('L11: diagonal normalised', Math.abs(r.x - expected) < 1e-9 && Math.abs(r.y - expected) < 1e-9 && Math.abs(r.mag - Math.SQRT1_2) < 1e-9, JSON.stringify(r));

  /* ============ IS-04: sim basics (TP §2 L12–L24) ============ */
  const ZERO = { sx: 0, sy: 0, swing: false, shield: false };

  /* L12: speed at full stick reaches hero.speed */
  var gFull = logic.createGame(cfg, 7);
  for (var i12 = 0; i12 < 60; i12++) gFull.step(20, { sx: 1, sy: 0 });
  var sFull = gFull.state();
  check('L12: full stick reaches hero.speed', Math.abs(sFull.hero.vx - cfg.hero.speed) < 1e-3, 'vx=' + sFull.hero.vx);

  /* L13: half stick reaches half speed */
  var gHalf = logic.createGame(cfg, 7);
  for (var i13 = 0; i13 < 60; i13++) gHalf.step(20, { sx: 0.5, sy: 0 });
  var sHalf = gHalf.state();
  check('L13: half stick reaches half speed', Math.abs(sHalf.hero.vx - cfg.hero.speed / 2) < 1e-3, 'vx=' + sHalf.hero.vx);

  /* L14: stop on release < 100 ms */
  gHalf.step(20, ZERO);
  var sStop = gHalf.state();
  check('L14: stop on release within <100ms', Math.abs(sStop.hero.vx) < 1e-9, 'vx=' + sStop.hero.vx);

  /* L15: blocked by circle (owl stump at (-5,4) r=0.8) */
  var gBlk = logic.createGame(cfg, 7);
  gBlk.debug.teleport(-5, 6);
  for (var i15 = 0; i15 < 20; i15++) gBlk.step(20, { sx: 0, sy: -1 });
  var sBlk = gBlk.state();
  var blkMinZ = 4 + (cfg.hero.radius + 0.8);
  check('L15: blocked by circle', sBlk.hero.z >= blkMinZ - 1e-9, 'z=' + sBlk.hero.z + ' want>=' + blkMinZ);

  /* L16: slides on wall (statue s1 at (-10,-30) r=1.0), no overlap after move */
  var gSlide = logic.createGame(cfg, 7);
  gSlide.debug.teleport(-9, -28);
  for (var i16 = 0; i16 < 60; i16++) gSlide.step(20, { sx: -0.70710678, sy: -0.70710678 });
  var sSlide = gSlide.state();
  var slideDist = Math.hypot(sSlide.hero.x - (-10), sSlide.hero.z - (-30));
  check('L16: slides on wall, stays clear of obstacle', Number.isFinite(sSlide.hero.x) && Number.isFinite(sSlide.hero.z) && slideDist >= cfg.hero.radius + 1.0 - 0.05, 'dist=' + slideDist);

  /* L17: closed gate blocks (G1 at (0,-16) w=6 d=1) */
  var gGate = logic.createGame(cfg, 7);
  gGate.debug.teleport(0, -14);
  for (var i17 = 0; i17 < 20; i17++) gGate.step(20, { sx: 0, sy: -1 });
  var sGate = gGate.state();
  var gateBlocked = !sGate.gates['G1'].open;
  var gateFront = -16 + 0.5 + cfg.hero.radius;
  check('L17: closed gate blocks', gateBlocked && sGate.hero.z >= gateFront - 1e-9, 'z=' + sGate.hero.z + ' open=' + sGate.gates['G1'].open);

  /* L18: bounds hold on all 4 sides */
  var corners = [
    { x: -22, z: 0, sx: -1, sy: 0, axis: 'x', want: cfg.bounds.xMin + cfg.hero.radius, label: 'xMin' },
    { x: 22, z: 0, sx: 1, sy: 0, axis: 'x', want: cfg.bounds.xMax - cfg.hero.radius, label: 'xMax' },
    { x: 20, z: -78, sx: 0, sy: -1, axis: 'z', want: cfg.bounds.zMin + cfg.hero.radius, label: 'zMin' },
    { x: 20, z: 14, sx: 0, sy: 1, axis: 'z', want: cfg.bounds.zMax - cfg.hero.radius, label: 'zMax' }
  ];
  var boundsOk = true, boundsMsg = '';
  for (var ci = 0; ci < corners.length; ci++) {
    var cc = corners[ci];
    var gg = logic.createGame(cfg, 7);
    gg.debug.teleport(cc.x, cc.z);
    for (var ii = 0; ii < 60; ii++) gg.step(20, { sx: cc.sx, sy: cc.sy });
    var ss = gg.state();
    if (Math.abs(ss.hero[cc.axis] - cc.want) > 1e-6) { boundsOk = false; boundsMsg = cc.label + '=' + ss.hero[cc.axis] + ' want=' + cc.want; }
  }
  check('L18: bounds hold on all 4 sides', boundsOk, boundsMsg);

  /* L19: dt 5 s clamps */
  var gDt = logic.createGame(cfg, 7);
  gDt.step(5000, ZERO);
  var sDt = gDt.state();
  check('L19: dt 5s clamps to dtClampMs', Math.abs(sDt.t - cfg.sim.dtClampMs) < 1e-6, 't=' + sDt.t);

  /* L20: same seed + inputs => identical JSON */
  var gA = logic.createGame(cfg, 7);
  var gB = logic.createGame(cfg, 7);
  for (var ia = 0; ia < 30; ia++) { gA.step(20, { sx: Math.sin(ia / 3), sy: Math.cos(ia / 4) }); gB.step(20, { sx: Math.sin(ia / 3), sy: Math.cos(ia / 4) }); }
  check('L20: same seed + inputs => identical JSON', JSON.stringify(gA.state()) === JSON.stringify(gB.state()),
    JSON.stringify(gA.state()) === JSON.stringify(gB.state()) ? 'identical' : 'DIFFERENT');

  /* L21: state() is a copy */
  var gCopy = logic.createGame(cfg, 7);
  var st1 = gCopy.state();
  st1.hero.x = 999; st1.carry.push('zz');
  var st2 = gCopy.state();
  check('L21: state() is a copy', st2.hero.x !== 999 && st2.carry.indexOf('zz') === -1, 'x=' + st2.hero.x);

  /* L22: no NaN / Infinity in state after varied drive */
  var gNan = logic.createGame(cfg, 7);
  var nanOk = true;
  for (var in1 = 0; in1 < 200; in1++) {
    gNan.step(20, { sx: (in1 % 3 === 0 ? 1 : 0), sy: (in1 % 4 === 0 ? 1 : 0), swing: (in1 % 7 === 0), shield: (in1 % 11 === 0) });
  }
  var sNan = gNan.state();
  var serial = JSON.stringify(sNan);
  check('L22: no NaN in state after varied drive', !serial.includes('null'), 'serial=' + serial.slice(0, 120));

  /* ---- IS-05: swing / combat (TP §2 L25–L44) ---- */
  /* L25: swing triggers event + swingT */
  var gSw = logic.createGame(cfg, 7);
  gSw.step(20, { swing: true });
  var evSw = gSw.drainEvents();
  var sSw = gSw.state();
  check('L25: swing emits swing event, swingT>0', evSw.length === 1 && evSw[0].type === 'swing' && sSw.hero.swingT > 0, JSON.stringify(evSw));

  /* L26: swing hits grumpy within reach/arc; hp decreases, hit event fires */
  var gHit = logic.createGame(cfg, 7);
  gHit.debug.teleport(0, 2);
  for (var ih = 0; ih < 50; ih++) gHit.step(20, { sx: 1, sy: 0 });
  gHit.step(20, { swing: true });
  var evHit = gHit.drainEvents();
  var sHit = gHit.state();
  var targetGrumpy = sHit.grumpies.find(function (gr) { return gr.id === 'a1'; });
  check('L26: swing hit within arc emits hit + lowers hp',
    evHit.some(function (e) { return e.type === 'hit'; }) && targetGrumpy.hp < 1,
    'ev=' + JSON.stringify(evHit) + ' hp=' + (targetGrumpy ? targetGrumpy.hp : '?'));

  /* L27: befriend (hp<=0) sets state happy + emits befriend (fresh game) */
  var gBf = logic.createGame(cfg, 7);
  gBf.debug.teleport(0, 2);
  for (var ib2 = 0; ib2 < 50; ib2++) gBf.step(20, { sx: 1, sy: 0 });
  var befriendSeen = false, befriendId = null;
  var befriendGrumpy = null;
  for (var ib = 0; ib < 10; ib++) { gBf.step(20, { swing: true }); var evBf = gBf.drainEvents(); var gr = gBf.state().grumpies.find(function (g) { return g.id === 'a1'; }); if (gr && gr.state === 'happy') { befriendGrumpy = gr; break; } }
  check('L27: befriend via swing sets grumpy happy', befriendGrumpy && befriendGrumpy.state === 'happy', befriendGrumpy ? JSON.stringify(befriendGrumpy.state) : 'none');

  /* L28: shield slows hero ×0.7 */
  var gSh = logic.createGame(cfg, 7);
  for (var ish = 0; ish < 50; ish++) gSh.step(20, { sx: 1, sy: 0 });
  var sShNo = gSh.state();
  var gSh2 = logic.createGame(cfg, 7);
  for (var ish2 = 0; ish2 < 50; ish2++) gSh2.step(20, { sx: 1, sy: 0, shield: true });
  var sShYes = gSh2.state();
  check('L28: shield slows hero x0.7',
    Math.abs(sShYes.hero.vx - cfg.hero.speed * cfg.hero.shieldSpeedMul) < 1e-3 &&
    sShNo.hero.vx > sShYes.hero.vx,
    'noShield=' + sShNo.hero.vx + ' shield=' + sShYes.hero.vx + ' expected=' + (cfg.hero.speed * cfg.hero.shieldSpeedMul));

  /* L29: no NaN/throw across 36000 random-ish steps */
  var gNan = logic.createGame(cfg, 7);
  var nanOk = true;
  var serial = '';
  for (var in1 = 0; in1 < 36000; in1++) {
    gNan.step(20, { sx: (in1 % 2), sy: (Math.floor(in1 / 2) % 2), swing: (in1 % 13 === 0), shield: (in1 % 17 === 0) });
    serial = JSON.stringify(gNan.state());
    if (serial.includes('null')) nanOk = false;
  }
  check('L29: 36000 random-ish steps -> no NaN/throw', nanOk, 'serial=' + serial.slice(0, 80));

  /* Summary */
  console.log('\n' + fails + ' check(s) FAILED');
  process.exit(fails ? 1 : 0);
})();
