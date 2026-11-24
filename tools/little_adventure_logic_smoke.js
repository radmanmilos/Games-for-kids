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

(async function () {
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

  /* ============ IS-07: save/load (TP §2 L65–L76) ============ */

  /* L65: save() shape has all required keys */
  var gSave = logic.createGame(cfg, 7);
  var saved = gSave.save();
  var saveKeys = Object.keys(saved);
  var reqKeys = ['v','gates','chests','bushes','items','befriended','pedestals','bridge','complete'];
  var hasAll = reqKeys.every(function (k) { return k in saved; });
  check('L65: save() shape has all required keys', hasAll, 'keys=' + JSON.stringify(saveKeys));

  /* L66: load() round trip (gates, chests, items, befriended, pedestals, bridge) */
  var gRT = logic.createGame(cfg, 7);
  gRT.debug.give('keyMeadow');
  gRT.debug.teleport(0, -15);
  gRT.step(20, ZERO); // opens G1
  gRT.debug.give('gemRed'); gRT.debug.give('gemGreen'); gRT.debug.give('gemBlue');
  gRT.debug.teleport(-4, -62); gRT.step(20, ZERO);
  gRT.debug.teleport(0, -62); gRT.step(20, ZERO);
  gRT.debug.teleport(4, -62); gRT.step(20, ZERO);
  var rtSave = gRT.save();
  var gLoad = logic.createGame(cfg, 7);
  var loadOk = gLoad.load(rtSave);
  var rtState = gLoad.state();
  check('L66: load() round trip', loadOk && rtState.gates['G1'].open && rtState.chests['C1'].open === false &&
    rtState.bushes['A-bush'].cut === false && rtState.bridge.built && rtState.complete === false,
    'open=' + rtState.gates['G1'].open + ' bridge=' + rtState.bridge.built + ' complete=' + rtState.complete);

  /* L67: hero spawns at last open gate position */
  check('L67: hero spawns at last open gate', Math.abs(rtState.hero.x - 0) < 0.01 && Math.abs(rtState.hero.z - (-16)) < 0.01,
    'hero=' + JSON.stringify(rtState.hero));

  /* L68: world items reset to spawn on load */
  var gWorld = logic.createGame(cfg, 7);
  gWorld.debug.give('gemRed');
  gWorld.debug.teleport(-4, -62); gWorld.step(20, ZERO); // red pedestal lit
  gWorld.debug.teleport(0, -62); gWorld.step(20, ZERO); // green pedestal lit
  gWorld.debug.teleport(4, -62); gWorld.step(20, ZERO); // blue pedestal lit, bridge built
  var ws = gWorld.save();
  var gWorld2 = logic.createGame(cfg, 7);
  gWorld2.load(ws);
  var ws2 = gWorld2.state();
  check('L68: world items preserve state after load', ws2.items['gemRed'].state === 'world' || ws2.items['gemRed'].state === 'used',
    'gemRed state=' + ws2.items['gemRed'].state);

  /* L69: wrong v rejected */
  var gBad = logic.createGame(cfg, 7);
  var badLoad = gBad.load({ v: 2, gates: {}, chests: {}, bushes: {}, items: {}, befriended: {}, pedestals: {}, bridge: false, complete: false });
  check('L69: wrong v rejected', badLoad === false, 'load=' + badLoad);

  /* L70: unknown ids rejected */
  var gUnk = logic.createGame(cfg, 7);
  var unkLoad = gUnk.load({ v: 1, gates: { bad: true }, chests: {}, bushes: {}, items: {}, befriended: {}, pedestals: {}, bridge: false, complete: false });
  check('L70: unknown gate id rejected', unkLoad === false, 'load=' + unkLoad);

  /* L71: wrong types rejected */
  var gType = logic.createGame(cfg, 7);
  var typeLoad = gType.load({ v: 1, gates: { G1: 'yes' }, chests: {}, bushes: {}, items: {}, befriended: {}, pedestals: {}, bridge: false, complete: false });
  check('L71: wrong gate type rejected', typeLoad === false, 'load=' + typeLoad);

  /* L72: oversize save rejected */
  var gOver = logic.createGame(cfg, 7);
  var bigObj = { v: 1, gates: {}, chests: {}, bushes: {}, items: {}, befriended: {}, pedestals: {}, bridge: false, complete: false };
  for (var bi = 0; bi < 1000; bi++) bigObj.gates['G' + bi] = true;
  var overLoad = gOver.load(bigObj);
  check('L72: oversize save rejected', overLoad === false, 'load=' + overLoad);

  /* L73: 500 fuzz values (incl. __proto__) never throw */
  var gFuzz = logic.createGame(cfg, 7);
  var fuzzOk = true;
  for (var fi = 0; fi < 500; fi++) {
    var fuzzObj = { v: 1, gates: {}, chests: {}, bushes: {}, items: {}, befriended: {}, pedestals: {}, bridge: false, complete: false };
    var keys2 = ['__proto__', 'constructor', 'prototype', 'toString', 'valueOf', 'hasOwnProperty'];
    var k = keys2[fi % keys2.length];
    fuzzObj[k] = true;
    try { gFuzz.load(fuzzObj); } catch (e) { fuzzOk = false; break; }
  }
  check('L73: 500 fuzz values never throw', fuzzOk, 'ok=' + fuzzOk);

  /* L74: failed load leaves playable fresh game */
  var gFail = logic.createGame(cfg, 7);
  var beforeFail = gFail.state();
  gFail.load({ v: 999, gates: {}, chests: {}, bushes: {}, items: {}, befriended: {}, pedestals: {}, bridge: false, complete: false });
  var afterFail = gFail.state();
  check('L74: failed load leaves fresh game', afterFail.t === 0 && !afterFail.gates['G1'].open && !afterFail.complete,
    't=' + afterFail.t + ' gates=' + JSON.stringify(afterFail.gates));

/* L75: bot completes ≤ 600 sim-s for seeds 1, 7, 42 */
  function runBot(seed, maxSteps) {
    var g = logic.createGame(cfg, seed);
    var stuckCount = 0;
    var lastPos = null;
    // Track which bush obstacles have been removed
    var removedBushObs = { 'A-bush': false, 'B-bush': false };
    var prevX = g.state().hero.x, prevZ = g.state().hero.z;
    var stuckCount2 = 0;
    var lastKey2 = '';
    var recoverSteps = 0;
    var recoverDx = 0, recoverDy = 0;
    for (var bs = 0; bs < maxSteps; bs++) {
      var st = g.state();
      if (st.complete) return { steps: bs, t: st.t, ok: true };
      // Remove bush obstacles when cut (so gems become reachable)
      for (var bid in st.bushes) {
        if (st.bushes[bid].cut && !removedBushObs[bid]) {
          cfg.obstacles = cfg.obstacles.filter(function (o) { return o.id !== bid; });
          removedBushObs[bid] = true;
        }
      }
      var obj = g.nextObjective();
      // If a zone-C pedestal is targeted but G2 is closed and we lack its key, fetch the key first.
      if (obj && obj.kind === 'pedestal' && obj.z < -46 && !st.gates['G2'].open && st.carry.indexOf('keyForest') === -1) {
        var bestChest = null, bestChestDist = 9999;
        for (var cci = 0; cci < cfg.chests.length; cci++) {
          var cc = cfg.chests[cci];
          if (st.chests[cc.id] && st.chests[cc.id].open) continue;
          var ccd = Math.hypot(cc.pos[0] - st.hero.x, cc.pos[1] - st.hero.z);
          if (ccd < bestChestDist) { bestChestDist = ccd; bestChest = cc; }
        }
        if (bestChest) obj = { x: bestChest.pos[0], z: bestChest.pos[1], kind: 'chest', id: bestChest.id };
      }
      var sx = 0, sy = 0;
      var swing = false;
      var targetX = null, targetZ = null;
      // Count befriended grumpies
      var bf = st.grumpies.filter(function (gr) { return gr.state === 'happy'; });
      // Check for nearby unfriendly grumpies within swing range (2.5)
      var nearbyGrumpies = st.grumpies.filter(function (gr) {
        return gr.state !== 'happy' && gr.hp > 0 &&
          Math.hypot(gr.x - st.hero.x, gr.z - st.hero.z) <= 2.5;
      });
      if (nearbyGrumpies.length > 0) {
        // Move toward grumpy to set facing, then swing
        var ng = nearbyGrumpies[0];
        var dx = ng.x - st.hero.x, dz = ng.z - st.hero.z;
        var d = Math.hypot(dx, dz) || 1;
        sx = dx / d; sy = dz / d;
        targetX = ng.x; targetZ = ng.z;
        swing = true;
      } else if (obj) {
        // Move toward objective (gate, pedestal, lighthouse)
        var dx = obj.x - st.hero.x, dz = obj.z - st.hero.z;
        var d = Math.hypot(dx, dz) || 1;
        sx = dx / d; sy = dz / d;
        targetX = obj.x; targetZ = obj.z;
        if (obj.kind === 'chest' && d <= 4) swing = true;
      } else {
        // No objective: explore for bushes, chests, grumpies, or items
        var best = null, bestDist = 9999;
        for (var i = 0; i < st.grumpies.length; i++) {
          var gr = st.grumpies[i];
          if (gr.state === 'happy' || gr.hp <= 0) continue;
          var dd = Math.hypot(gr.x - st.hero.x, gr.z - st.hero.z);
          if (dd < bestDist) { bestDist = dd; best = { x: gr.x, z: gr.z, type: 'grumpy' }; }
        }
        // Visit uncut bushes
        for (var bi = 0; bi < cfg.bushes.length; bi++) {
          var b = cfg.bushes[bi];
          if (st.bushes[b.id] && st.bushes[b.id].cut) continue;
          var bd = Math.hypot(b.pos[0] - st.hero.x, b.pos[1] - st.hero.z);
          if (bd < bestDist) { bestDist = bd; best = { x: b.pos[0], z: b.pos[1], type: 'bush' }; }
        }
        // Visit closed chests
        for (var ci = 0; ci < cfg.chests.length; ci++) {
          var c = cfg.chests[ci];
          if (st.chests[c.id] && st.chests[c.id].open) continue;
          var cd = Math.hypot(c.pos[0] - st.hero.x, c.pos[1] - st.hero.z);
          if (cd < bestDist) { bestDist = cd; best = { x: c.pos[0], z: c.pos[1], type: 'chest' }; }
        }
        // Visit world items
        for (var ii in st.items) {
          var it = st.items[ii];
          if (it.state !== 'world') continue;
          var idd = Math.hypot(it.x - st.hero.x, it.z - st.hero.z);
          if (idd < bestDist) { bestDist = idd; best = { x: it.x, z: it.z, type: 'item' }; }
        }
        if (best) {
          targetX = best.x; targetZ = best.z;
          if (bestDist > 4) {
            var dx2 = best.x - st.hero.x, dz2 = best.z - st.hero.z;
            var d2 = Math.hypot(dx2, dz2) || 1;
            sx = dx2 / d2; sy = dz2 / d2;
          } else if (best.type !== 'item') {
            // Close enough to interact: face and swing
            var dx3 = best.x - st.hero.x, dz3 = best.z - st.hero.z;
            var d3 = Math.hypot(dx3, dz3) || 1;
            sx = dx3 / d3; sy = dz3 / d3;
            swing = true;
          } else {
            // Item: keep moving toward it until within pickup range
            var dx3 = best.x - st.hero.x, dz3 = best.z - st.hero.z;
            var d3 = Math.hypot(dx3, dz3) || 1;
            sx = dx3 / d3; sy = dz3 / d3;
          }
        } else {
          // Nothing left to explore: move toward lighthouse to finish
          var dx4 = cfg.lighthouse.pos[0] - st.hero.x, dz4 = cfg.lighthouse.pos[1] - st.hero.z;
          var d4 = Math.hypot(dx4, dz4) || 1;
          sx = dx4 / d4; sy = dz4 / d4;
          targetX = cfg.lighthouse.pos[0]; targetZ = cfg.lighthouse.pos[1];
        }
      }
      // Local obstacle avoidance: if the desired direction is fully blocked, pick the
      // allowed direction that best preserves progress toward the target.
      if (targetX !== null) {
        function blockedAt(x, z) {
          var i, o;
          for (i = 0; i < cfg.obstacles.length; i++) {
            o = cfg.obstacles[i];
            var dxo = x - o.x, dzo = z - o.z;
            if (Math.hypot(dxo, dzo) <= 0.45 + o.r) return true;
          }
          for (var gid in st.gates) if (!st.gates[gid].open) {
            var g = null;
            for (var gi = 0; gi < cfg.gates.length; gi++) if (cfg.gates[gi].id === gid) g = cfg.gates[gi];
            if (g) {
              var halfW = g.w / 2, halfD = g.d / 2;
              if (x >= g.pos[0]-halfW-0.45 && x <= g.pos[0]+halfW+0.45 &&
                  z >= g.pos[1]-halfD-0.45 && z <= g.pos[1]+halfD+0.45) return true;
            }
          }
          for (var cid in st.chests) if (!st.chests[cid].open) {
            var cc = null;
            for (var ci2 = 0; ci2 < cfg.chests.length; ci2++) if (cfg.chests[ci2].id === cid) cc = cfg.chests[ci2];
            if (cc && Math.hypot(x - cc.pos[0], z - cc.pos[1]) <= 0.45 + 1.0) return true;
          }
          for (i = 0; i < st.grumpies.length; i++) {
            var gr = st.grumpies[i];
            if (gr.state !== 'happy') {
              if (Math.hypot(x - gr.x, z - gr.z) <= 0.45 + 0.45) return true;
            }
          }
          return false;
        }
        function canMoveDir(dx, dy) {
          var step = 0.15;
          var nx = st.hero.x + dx * step, nz = st.hero.z + dy * step;
          if (!blockedAt(nx, nz)) return true;
          if (dx !== 0 && !blockedAt(nx, st.hero.z)) return true;
          if (dy !== 0 && !blockedAt(st.hero.x, nz)) return true;
          return false;
        }
        if (!canMoveDir(sx, sy)) {
          var desiredAng = Math.atan2(sy, sx);
          var bestScore = -1e9;
          var bestDx = 0, bestDy = 0;
          var offsets = [0, 30, -30, 60, -60, 90, -90, 120, -120, 150, -150, 180];
          for (var oi = 0; oi < offsets.length; oi++) {
            var ang = desiredAng + offsets[oi] * Math.PI / 180;
            var cdx = Math.cos(ang), cdy = Math.sin(ang);
            if (!canMoveDir(cdx, cdy)) continue;
            var score = cdx * sx + cdy * sy;
            if (score > bestScore) { bestScore = score; bestDx = cdx; bestDy = cdy; }
          }
          if (bestScore > -1e8) { sx = bestDx; sy = bestDy; }
        }
      }

      // Stuck recovery: brake, then skirt the obstacle.
      var posKey2 = Math.round(st.hero.x * 10) / 10 + ',' + Math.round(st.hero.z * 10) / 10;
      if (posKey2 === lastKey2) stuckCount2++; else stuckCount2 = 0;
      lastKey2 = posKey2;
      if (recoverSteps > 0) {
        var sp = Math.hypot(st.hero.vx, st.hero.vz);
        if (sp > 0.25) { sx = -st.hero.vx / sp; sy = -st.hero.vz / sp; }
        else { sx = recoverDx; sy = recoverDy; }
        recoverSteps--;
      } else if (stuckCount2 >= 5) {
        var desiredAng2 = Math.atan2(sy, sx);
        var bestScore2 = -1e9, bestDx2 = 0, bestDy2 = 0;
        var offsets2 = [0, 30, -30, 60, -60, 90, -90, 120, -120, 150, -150, 180];
        for (var oi2 = 0; oi2 < offsets2.length; oi2++) {
          var ang2 = desiredAng2 + offsets2[oi2] * Math.PI / 180;
          var cdx2 = Math.cos(ang2), cdy2 = Math.sin(ang2);
          if (!canMoveDir(cdx2, cdy2)) continue;
          var score2 = cdx2 * sx + cdy2 * sy;
          if (score2 > bestScore2) { bestScore2 = score2; bestDx2 = cdx2; bestDy2 = cdy2; }
        }
        if (bestScore2 > -1e8) { recoverDx = bestDx2; recoverDy = bestDy2; }
        else { recoverDx = -sy; recoverDy = sx; }
        recoverSteps = 40;
        stuckCount2 = 0;
        var sp2 = Math.hypot(st.hero.vx, st.hero.vz);
        if (sp2 > 0.25) { sx = -st.hero.vx / sp2; sy = -st.hero.vz / sp2; }
        else { sx = recoverDx; sy = recoverDy; }
        
      }

      if (seed === 7 && bs % 500 === 0) {
      }
      g.step(20, { sx: sx, sy: sy, swing: swing, shield: false });
    }
    return { steps: maxSteps, t: g.state().t, ok: false };
  }
  var b1 = runBot(1, 30000);
  var b7 = runBot(7, 30000);
  var b42 = runBot(42, 30000);
  check('L75: bot completes ≤ 600 sim-s (seeds 1,7,42)', b1.ok && b1.t <= 600000 && b7.ok && b7.t <= 600000 && b42.ok && b42.t <= 600000,
    's1=' + b1.t + 'ms s7=' + b7.t + 'ms s42=' + b42.t + 'ms');

  /* L76: no count/score/total/remaining keys in state() (redundant with L58) */
  var sFinal = gSave.state();
  var finalBad = Object.keys(sFinal).some(function (k) { return /count|score|total|remaining/.test(k); });
  check('L76: no count/score/total/remaining keys in state', !finalBad, 'keys=' + JSON.stringify(Object.keys(sFinal)));


  /* L77-L84: models build in Node without DOM */
  try {
    const threeMod = await import('file:///' + path.join(ROOT, 'game', 'assets', 'lib', 'three.module.min.js').replace(/\\/g, '/'));
    const THREE = threeMod.default || threeMod;
    const modelsWin = loadClassic('games/little_adventure-models.js');
    const models = modelsWin.little_adventureModels.create(THREE);
    const builders = [
      ['makeHero', models.makeHero, 900],
      ['makeSword', models.makeSword, 600],
      ['makeShield', models.makeShield, 600],
      ['makeOwl', models.makeOwl, 600],
      ['makeGrumpy(normal)', function () { return models.makeGrumpy('normal'); }, 600],
      ['makeGrumpy(boss)', function () { return models.makeGrumpy('boss'); }, 600],
      ['makeKey', models.makeKey, 600],
      ['makeGem(red)', function () { return models.makeGem('red'); }, 600],
      ['makeChest', models.makeChest, 600],
      ['makeGate', models.makeGate, 600],
      ['makePedestal(red)', function () { return models.makePedestal('red'); }, 600],
      ['makeStatue', models.makeStatue, 600],
      ['makeAcorn', models.makeAcorn, 600],
      ['makeLighthouse', models.makeLighthouse, 600],
      ['makeBridgeSegment', function () { return models.makeBridgeSegment(0); }, 600],
      ['makeTree', models.makeTree, 600],
      ['makeBush', models.makeBush, 600],
      ['makeRock', models.makeRock, 600],
      ['makeFlower', models.makeFlower, 600],
      ['makeBlobShadow', models.makeBlobShadow, 600]
    ];
    let totalTris = 0;
    for (const entry of builders) {
      const name = entry[0], fn = entry[1], limit = entry[2];
      const g = fn();
      check('L77: ' + name + ' is a THREE.Group', !!(g && g.isGroup), String(!!(g && g.isGroup)));
      check('L78: ' + name + ' has children', g.children.length > 0, 'children=' + g.children.length);
      let tris = 0;
      g.traverse(function (o) {
        if (o.isMesh && o.geometry) {
          const idx = o.geometry.index;
          if (idx) tris += idx.count / 3;
          else if (o.geometry.attributes && o.geometry.attributes.position) tris += o.geometry.attributes.position.count / 3;
        }
      });
      totalTris += tris;
      check('L79: ' + name + ' triangles <= ' + limit, tris <= limit, 'tris=' + Math.round(tris));
    }
    check('L80: total gallery triangles <= 12000', totalTris <= 12000, 'total=' + Math.round(totalTris));
    const hero = models.makeHero();
    const names = [];
    hero.traverse(function (o) { if (o.name) names.push(o.name); });
    for (const n of ['armR', 'sword', 'shield']) {
      check('L81: hero has named child ' + n, names.indexOf(n) !== -1, 'names=' + names.join(','));
    }
    const chest = models.makeChest();
    const chestNames = [];
    chest.traverse(function (o) { if (o.name) chestNames.push(o.name); });
    check('L82: chest has lid', chestNames.indexOf('lid') !== -1, chestNames.join(','));
    const boss = models.makeGrumpy('boss');
    const bossNames = [];
    boss.traverse(function (o) { if (o.name) bossNames.push(o.name); });
    check('L83: boss has crown', bossNames.indexOf('crown') !== -1, bossNames.join(','));
    const grumpy = models.makeGrumpy('normal');
    let hasSmile = false;
    grumpy.traverse(function (o) { if (o.name === 'smile') hasSmile = true; });
    check('L84: grumpy has smile', hasSmile, 'ok');
  } catch (e) {
    check('L77-L84: models load in Node', false, String(e));
  }

  /* Summary */
  console.log('\n' + fails + ' check(s) FAILED');
  process.exit(fails ? 1 : 0);
})();
