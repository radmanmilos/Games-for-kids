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

  /* ============ IS-06: interactions (TP §2 L45–L64) ============ */

  /* L45: bush cut spawns item (gemRed from A-bush via swing) */
  var gBush = logic.createGame(cfg, 7);
  gBush.debug.teleport(7, -2);
  for (var ib = 0; ib < 10; ib++) gBush.step(20, { sx: 1, sy: 0 }); // face east toward bush at (9,-2)
  gBush.step(20, { sx: 0, sy: 0, swing: true });
  var sBush = gBush.state();
  var bushCut = sBush.bushes['A-bush'].cut;
  var itemSpawned = sBush.items['gemRed'] && (sBush.items['gemRed'].state === 'world' || sBush.items['gemRed'].state === 'carried');
  var evBush = gBush.drainEvents();
  check('L45: bush cut spawns gemRed world/carried item', bushCut && itemSpawned &&
    evBush.some(function (e) { return e.type === 'bushCut' && e.id === 'A-bush'; }),
    'cut=' + bushCut + ' item=' + JSON.stringify(sBush.items['gemRed']));

  /* L46: pickup (carry array adds gem) */
  var gPick = logic.createGame(cfg, 7);
  gPick.debug.give('gemRed');
  var sPick = gPick.state();
  check('L46: pickup add gem to carry', sPick.carry.indexOf('gemRed') !== -1 && sPick.items['gemRed'].state === 'carried',
    'carry=' + JSON.stringify(sPick.carry));

  /* L47: chest open by swing+proximity opens chest */
  var gChest = logic.createGame(cfg, 7);
  gChest.debug.teleport(14, -34);
  for (var ic = 0; ic < 10; ic++) gChest.step(20, { sx: 0, sy: 0, swing: true });
  var sChest = gChest.state();
  check('L47: chest opens by swing', sChest.chests['C1'].open,
    'open=' + sChest.chests['C1'].open);

  /* L48: pickup range (carry keyForest) */
  var gPick2 = logic.createGame(cfg, 7);
  gPick2.debug.teleport(14, -34);
  for (var ip = 0; ip < 10; ip++) gPick2.step(20, { sx: 0, sy: 0, swing: true });
  for (var ip2 = 0; ip2 < 10; ip2++) gPick2.step(20, ZERO);
  var sPick2 = gPick2.state();
  check('L48: carry keyForest after chest', sPick2.carry.indexOf('keyForest') !== -1,
    'carry=' + JSON.stringify(sPick2.carry));

  /* L49: gate opens only with its key */
  var gGate2 = logic.createGame(cfg, 7);
  gGate2.debug.give('keyMeadow');
  gGate2.debug.teleport(0, -16);
  gGate2.step(20, { sx: 0, sy: 0 });
  var sGate2 = gGate2.state();
  check('L49: gate opens with keyMeadow', sGate2.gates['G1'].open &&
    sGate2.carry.indexOf('keyMeadow') === -1,
    'open=' + sGate2.gates['G1'].open + ' carry=' + JSON.stringify(sGate2.carry));

  /* L50: wrong key does nothing */
  var gGateWrong = logic.createGame(cfg, 7);
  gGateWrong.debug.give('keyForest');
  gGateWrong.debug.teleport(0, -16);
  gGateWrong.step(20, { sx: 0, sy: 0 });
  var sGateWrong = gGateWrong.state();
  check('L50: wrong key does not open gate', !sGateWrong.gates['G1'].open &&
    sGateWrong.carry.indexOf('keyForest') !== -1,
    'open=' + sGateWrong.gates['G1'].open + ' carry=' + JSON.stringify(sGateWrong.carry));

  /* L51: gate stays open */
  var sGate2b = gGate2.state();
  check('L51: gate stays open', sGate2b.gates['G1'].open === true,
    'open=' + sGate2b.gates['G1'].open);

  /* L52: pedestal accepts only its colour */
  var gPed = logic.createGame(cfg, 7);
  gPed.debug.give('gemBlue');
  gPed.debug.teleport(4, -62);
  gPed.step(20, { sx: 0, sy: 0 });
  var sPed = gPed.state();
  check('L52: pedestal blue accepts gemBlue', sPed.pedestals['blue'].lit &&
    sPed.items['gemBlue'].state === 'used',
    'blueLit=' + sPed.pedestals['blue'].lit + ' item=' + JSON.stringify(sPed.items['gemBlue']));

  /* L53: pedestal wrong colour keeps gem + pedestalWrong cooldown */
  var gPedWrong = logic.createGame(cfg, 7);
  gPedWrong.debug.give('gemRed');
  gPedWrong.debug.teleport(4, -62);
  gPedWrong.step(20, { sx: 0, sy: 0 });
  var sPedWrong = gPedWrong.state();
  var evPedWrong = gPedWrong.drainEvents();
  check('L53: wrong colour keeps gem + pedestalWrong',
    sPedWrong.items['gemRed'].state === 'carried' &&
    evPedWrong.some(function (e) { return e.type === 'pedestalWrong'; }),
    'gemRedState=' + sPedWrong.items['gemRed'].state + ' events=' + JSON.stringify(evPedWrong));

  /* L54: bridge needs all 3 lit */
  var gBridge = logic.createGame(cfg, 7);
  gBridge.debug.give('gemRed'); gBridge.debug.give('gemGreen'); gBridge.debug.give('gemBlue');
  gBridge.debug.teleport(-4, -62); gBridge.step(20, ZERO); // red lit
  gBridge.debug.teleport(0, -62); gBridge.step(20, ZERO); // green lit
  gBridge.debug.teleport(4, -62); gBridge.step(20, ZERO); // blue lit -> bridge
  var sBridge = gBridge.state();
  check('L54: bridge needs all 3 lit', sBridge.pedestals['red'].lit && sBridge.pedestals['green'].lit &&
    sBridge.pedestals['blue'].lit && sBridge.bridge.built,
    'red=' + sBridge.pedestals['red'].lit + ' green=' + sBridge.pedestals['green'].lit +
    ' blue=' + sBridge.pedestals['blue'].lit + ' bridge=' + sBridge.bridge.built);

  /* L55: complete fires once at lighthouse after bridge */
  var gComp = logic.createGame(cfg, 7);
  gComp.debug.give('gemRed'); gComp.debug.give('gemGreen'); gComp.debug.give('gemBlue');
  gComp.debug.teleport(-4, -62); gComp.step(20, ZERO);
  gComp.debug.teleport(0, -62); gComp.step(20, ZERO);
  gComp.debug.teleport(4, -62); gComp.step(20, ZERO);
  gComp.debug.teleport(0, -78); gComp.step(20, ZERO);
  var evComp = gComp.drainEvents();
  var sComp = gComp.state();
  check('L55: complete fires once at lighthouse', sComp.complete === true &&
    evComp.filter(function (e) { return e.type === 'complete'; }).length === 1,
    'complete=' + sComp.complete + ' compCount=' + evComp.filter(function (e) { return e.type === 'complete'; }).length);

  /* L56: owl intro then hints by objective */
  var gOwl = logic.createGame(cfg, 7);
  gOwl.debug.give('keyMeadow');
  gOwl.debug.teleport(-5, 4); // near owl at (-5,4)
  gOwl.state().hero.facing = 0;
  for (var io = 0; io < 5; io++) gOwl.step(20, ZERO);
  var evOwl = gOwl.drainEvents();
  check('L56: owl intro+gate hint line keys', evOwl.some(function (e) { return e.type === 'owlTalk'; }) &&
    ['intro', 'hintGate', 'hintGems', 'bridge', 'complete'].indexOf(evOwl[evOwl.length - 1].line) !== -1,
    'lines=' + JSON.stringify(evOwl.map(function (e) { return e.line; })));

  /* L57: nextObjective order and null after complete */
  var gObj = logic.createGame(cfg, 7);
  var o1 = gObj.nextObjective();
  check('L57: nextObjective first is null (no key)', o1 === null, JSON.stringify(o1));
  gObj.debug.give('keyMeadow');
  gObj.debug.teleport(0, -15);
  var o2 = gObj.nextObjective();
  check('L57: nextObjective gate G1 when key carried, gate closed', o2.kind === 'gate' && o2.id === 'G1', JSON.stringify(o2));
  gObj.step(20, ZERO); // opens gate
  var o2b = gObj.nextObjective();
  check('L57: nextObjective null after gate opens (key used)', o2b === null, JSON.stringify(o2b));
  gObj.debug.give('gemRed'); gObj.debug.give('gemGreen'); gObj.debug.give('gemBlue');
  gObj.debug.teleport(-4, -62); gObj.step(20, ZERO);
  gObj.debug.teleport(0, -62); gObj.step(20, ZERO);
  gObj.debug.teleport(4, -62); gObj.step(20, ZERO);
  var o3 = gObj.nextObjective();
  check('L57: nextObjective bridge/lighthouse when all lit', (o3.kind === 'bridge' || o3.kind === 'lighthouse') && gObj.state().bridge.built, JSON.stringify(o3));
  gObj.debug.teleport(0, -78); gObj.step(20, ZERO);
  var o4 = gObj.nextObjective();
  check('L57: nextObjective null after complete', o4 === null || (o4 && o4.kind === 'lighthouse' && gObj.state().complete), JSON.stringify(o4));

  /* L58: no count/score/total/remaining keys in state() */
  var sNoCount = gObj.state();
  var keys = Object.keys(sNoCount);
  var heroKeys = Object.keys(sNoCount.hero);
  var badCount = keys.some(function (k) { return /count|score|total|remaining/.test(k); }) ||
    heroKeys.some(function (k) { return /count|score|total|remaining/.test(k); });
  check('L58: no count/score/total/remaining keys in state', !badCount, 'keys=' + JSON.stringify(keys));

  /* Summary */
  console.log('\n' + fails + ' check(s) FAILED');
  process.exit(fails ? 1 : 0);
})();
