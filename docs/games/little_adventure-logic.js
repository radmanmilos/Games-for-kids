/* Мала авантура (Little Adventure) — pure logic (TD §3).
   Classic script; no DOM, no three.js; all randomness via mulberry32(seed).
   Exports validateConfig, validateSave, createGame, stickVector on window.little_adventureLogic. */
(function () {
  'use strict';

  function mulberry32(seed) {
    return function () {
      var t = (seed += 0x6D2B79F5) | 0;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function stickVector(dx, dy, radius, deadzone) {
    var mag = Math.min(Math.hypot(dx, dy) / radius, 1);
    if (mag < deadzone) return { x: 0, y: 0, mag: 0 };
    return { x: dx / Math.hypot(dx, dy), y: dy / Math.hypot(dx, dy), mag: mag };
  }

  var ASCII_ID = /^[a-zA-Z0-9_]+$/;
  var ITEM_KINDS = ['key', 'gem'];
  var ALL_SPEECH_KEYS = ['intro', 'hintGuard', 'hintGate', 'hintShield', 'hintGems',
    'key', 'gem', 'gateOpen', 'befriend', 'red', 'green', 'blue', 'bridge', 'complete', 'noWebgl'];
  var VALID_ROLES = ['normal', 'guard', 'boss'];
  var PEDESTAL_COLOURS = ['red', 'green', 'blue'];
  var ITEM_STATES = ['hidden', 'world', 'carried', 'used'];

  function str(s) { return typeof s === 'string'; }
  function num(n) { return typeof n === 'number' && isFinite(n); }
  function pos(p) { return Array.isArray(p) && p.length === 2 && num(p[0]) && num(p[1]); }
  function boundsShape(b) { return b && num(b.xMin) && num(b.xMax) && num(b.zMin) && num(b.zMax) && b.xMin < b.xMax && b.zMin < b.zMax; }
  function clamp(x, a, b) { return x < a ? a : (x > b ? b : x); }
  function circleOverlap(x1, z1, r1, x2, z2, r2) {
    var dx = x2 - x1, dz = z2 - z1;
    return dx * dx + dz * dz <= (r1 + r2) * (r1 + r2);
  }
  function rectOverlap(x, z, r, rx, rz, rw, rd) {
    var hx = rw / 2, hz = rd / 2;
    var cx = clamp(x, rx - hx, rx + hx);
    var cz = clamp(z, rz - hz, rz + hz);
    var dx = x - cx, dz = z - cz;
    return dx * dx + dz * dz <= r * r;
  }
  function inBounds(x, z, cfg) {
    return x >= cfg.bounds.xMin && x <= cfg.bounds.xMax &&
           z >= cfg.bounds.zMin && z <= cfg.bounds.zMax;
  }

  function validateConfig(cfg) {
    var problems = [];
    if (!cfg || typeof cfg !== 'object') return ['config is not an object'];
    if (!pos(cfg.hero.start)) problems.push('hero.start must be [x,z]');
    if (!num(cfg.hero.radius) || cfg.hero.radius <= 0) problems.push('hero.radius must be >0');
    if (!num(cfg.hero.speed) || cfg.hero.speed <= 0) problems.push('hero.speed must be >0');
    if (!boundsShape(cfg.bounds)) problems.push('bounds must be {xMin,xMax,zMin,zMax} with xMin<xMax and zMin<zMax');
    if (boundsShape(cfg.bounds) && !inBounds(cfg.hero.start[0], cfg.hero.start[1], cfg)) problems.push('hero.start inside bounds');

    var itemIds = {};
    if (!Array.isArray(cfg.items)) problems.push('items must be an array');
    else cfg.items.forEach(function (it) {
      if (!str(it.id) || !ASCII_ID.test(it.id)) problems.push('item id not ASCII: ' + it.id);
      else if (itemIds[it.id]) problems.push('duplicate item id: ' + it.id);
      else itemIds[it.id] = it;
      if (!str(it.kind) || ITEM_KINDS.indexOf(it.kind) === -1) problems.push('item ' + it.id + ' kind invalid');
    });
    var itemIdList = Object.keys(itemIds);

    function mustExist(item, what, field) {
      var id = item[field];
      if (str(id) && itemIdList.indexOf(id) === -1) {
        problems.push(what + ' ' + (item.id || '?') + ' references unknown ' + field + ': ' + id);
      }
    }
    if (Array.isArray(cfg.grumpies)) cfg.grumpies.forEach(function (g) { mustExist(g, 'grumpy', 'drops'); });
    if (Array.isArray(cfg.chests)) cfg.chests.forEach(function (c) { mustExist(c, 'chest', 'item'); });
    if (Array.isArray(cfg.bushes)) cfg.bushes.forEach(function (b) { mustExist(b, 'bush', 'item'); });
    if (Array.isArray(cfg.gates)) cfg.gates.forEach(function (g) { mustExist(g, 'gate', 'needs'); });

    if (!Array.isArray(cfg.pedestals)) problems.push('pedestals must be an array');
    else {
      var ids = cfg.pedestals.map(function (p) { return p.id; }).sort();
      var expected = PEDESTAL_COLOURS.slice().sort();
      if (cfg.pedestals.length !== 3) problems.push('exactly 3 pedestals required, got ' + cfg.pedestals.length);
      if (JSON.stringify(ids) !== JSON.stringify(expected)) problems.push('pedestal ids must be red/green/blue, got ' + ids.join(','));
      cfg.pedestals.forEach(function (p) {
        if (!pos(p.pos)) problems.push('pedestal ' + (p.id || '?') + ' pos must be [x,z]');
        else if (!inBounds(p.pos[0], p.pos[1], cfg)) problems.push('pedestal ' + (p.id || '?') + ' outside bounds');
      });
    }
    if (!Array.isArray(cfg.gates)) problems.push('gates must be an array');
    else cfg.gates.forEach(function (g) {
      if (!pos(g.pos)) problems.push('gate ' + (g.id || '?') + ' pos must be [x,z]');
      else if (!inBounds(g.pos[0], g.pos[1], cfg)) problems.push('gate ' + (g.id || '?') + ' outside bounds');
    });
    if (!Array.isArray(cfg.chests)) problems.push('chests must be an array');
    else cfg.chests.forEach(function (c) {
      if (!pos(c.pos)) problems.push('chest ' + (c.id || '?') + ' pos must be [x,z]');
      else if (!inBounds(c.pos[0], c.pos[1], cfg)) problems.push('chest ' + (c.id || '?') + ' outside bounds');
    });
    var gIds = {};
    if (!Array.isArray(cfg.grumpies)) problems.push('grumpies must be an array');
    else cfg.grumpies.forEach(function (g) {
      if (!str(g.id) || !ASCII_ID.test(g.id)) problems.push('grumpy id not ASCII: ' + g.id);
      else if (gIds[g.id]) problems.push('duplicate grumpy id: ' + g.id);
      else gIds[g.id] = g;
      if (VALID_ROLES.indexOf(g.role) === -1) problems.push('grumpy ' + (g.id || '?') + ' role invalid: ' + g.role);
      if (!num(g.hits) || g.hits < 1) problems.push('grumpy ' + (g.id || '?') + ' hits must be >=1');
      if (!pos(g.home)) problems.push('grumpy ' + (g.id || '?') + ' home must be [x,z]');
      else if (!inBounds(g.home[0], g.home[1], cfg)) problems.push('grumpy ' + (g.id || '?') + ' home outside bounds');
    });
    var bossCount = cfg.grumpies ? cfg.grumpies.filter(function (g) { return g.role === 'boss'; }).length : 0;
    if (bossCount !== 1) problems.push('exactly 1 boss required, got ' + bossCount);

    if (!cfg.speech || typeof cfg.speech !== 'object') problems.push('speech missing');
    else ALL_SPEECH_KEYS.forEach(function (key) {
      if (!str(cfg.speech[key])) problems.push('speech key missing: ' + key);
    });
    return problems;
  }

  function validateSave(obj, cfg) {
    if (!obj || typeof obj !== 'object') return null;
    if (obj.v !== 1) return null;
    var keys = ['gates', 'chests', 'bushes', 'items', 'befriended', 'pedestals', 'bridge', 'complete'];
    for (var i = 0; i < keys.length; i++) if (!(keys[i] in obj)) return null;
    if (typeof obj.gates !== 'object' || obj.gates === null) return null;
    if (typeof obj.chests !== 'object' || obj.chests === null) return null;
    if (typeof obj.bushes !== 'object' || obj.bushes === null) return null;
    if (typeof obj.items !== 'object' || obj.items === null) return null;
    if (typeof obj.befriended !== 'object' || obj.befriended === null) return null;
    if (typeof obj.pedestals !== 'object' || obj.pedestals === null) return null;
    if (typeof obj.bridge !== 'boolean' || typeof obj.complete !== 'boolean') return null;

    function ids(list) { return list.map(function (o) { return o.id; }); }
    var gateIds = ids(cfg.gates), chestIds = ids(cfg.chests), bushIds = ids(cfg.bushes);
    var itemIds = ids(cfg.items), pedIds = ids(cfg.pedestals), grumpyIds = ids(cfg.grumpies);

    for (var k in obj.gates) if (gateIds.indexOf(k) === -1 || typeof obj.gates[k] !== 'boolean') return null;
    for (var k2 in obj.chests) if (chestIds.indexOf(k2) === -1 || typeof obj.chests[k2] !== 'boolean') return null;
    for (var k3 in obj.bushes) if (bushIds.indexOf(k3) === -1 || typeof obj.bushes[k3] !== 'boolean') return null;
    for (var k4 in obj.items) if (itemIds.indexOf(k4) === -1 || ITEM_STATES.indexOf(obj.items[k4]) === -1) return null;
    for (var k5 in obj.befriended) if (grumpyIds.indexOf(k5) === -1 || typeof obj.befriended[k5] !== 'boolean') return null;
    for (var k6 in obj.pedestals) if (pedIds.indexOf(k6) === -1 || typeof obj.pedestals[k6] !== 'boolean') return null;

    return { v: 1, gates: obj.gates, chests: obj.chests, bushes: obj.bushes, items: obj.items,
             befriended: obj.befriended, pedestals: obj.pedestals, bridge: obj.bridge, complete: obj.complete };
  }

  /* ======================== createGame ======================== */
  function createGame(cfg, seed) {
    var rng = mulberry32((seed >>> 0) || 1);
    var stepMs = cfg.sim.stepMs;
    var dtClampMs = cfg.sim.dtClampMs;
    var heroR = cfg.hero.radius;
    var heroSpeed = cfg.hero.speed;
    var heroAccel = cfg.hero.accelRate;
    var shieldMul = cfg.hero.shieldSpeedMul;
    var bumpDist = cfg.hero.bumpDist;
    var bumpMs = cfg.hero.bumpMs;
    var swordReach = cfg.sword.reach;
    var swordArc = cfg.sword.arcDeg * Math.PI / 180;
    var swingMs = cfg.sword.swingMs;
    var cooldownMs = cfg.sword.cooldownMs;
    var assistRange = cfg.sword.assistRange;
    var assistCone = cfg.sword.assistConeDeg * Math.PI / 180;
    var grumpyR = cfg.grumpy.radius;
    var grumpySpeed = cfg.grumpy.speed;
    var notice = cfg.grumpy.notice;
    var wanderR = cfg.grumpy.wanderR;
    var bumpCooldownMs = cfg.grumpy.bumpCooldownMs;
    var retreatMs = cfg.grumpy.retreatMs;
    var respawnMs = cfg.grumpy.respawnMs;
    var respawnMinHeroDist = cfg.grumpy.respawnMinHeroDist;
    var maxAliveNormal = cfg.grumpy.maxAliveNormal;
    var acornInterval = cfg.acorn.intervalMs;
    var acornSpeed = cfg.acorn.speed;
    var acornRadius = cfg.acorn.radius;
    var acornLifeMs = cfg.acorn.lifeMs;
    var pickupRange = cfg.interact.pickup;
    var chestRange = cfg.interact.chest;
    var keyUseRange = cfg.interact.keyUse;
    var gemPlaceRange = cfg.interact.gemPlace;
    var owlRange = cfg.interact.owlTalk;
    var owlRepeatMs = cfg.interact.owlRepeatMs;
    var bounds = cfg.bounds;

    function zoneIndexForZ(z) {
      if (z > cfg.zones[0].z1) return 0;
      if (z > cfg.zones[1].z1) return 1;
      return 2;
    }
    function zoneRangeForIndex(i) {
      var hi = i === 0 ? bounds.zMax : cfg.zones[i - 1].z1;
      var lo = cfg.zones[i].z1;
      return { zMin: Math.max(lo, bounds.zMin), zMax: Math.min(hi, bounds.zMax) };
    }
    var zoneA = zoneRangeForIndex(0), zoneB = zoneRangeForIndex(1), zoneC = zoneRangeForIndex(2);

    function zoneForZ(z) {
      var i = zoneIndexForZ(z);
      return cfg.zones[i].id;
    }

    var t = 0;
    var events = [];

    var hero = {
      x: cfg.hero.start[0], z: cfg.hero.start[1], facing: -Math.PI / 2,
      vx: 0, vz: 0, swingT: 0, cooldown: 0, shield: false, bumpT: 0, swingHits: {}
    };

    var carry = [];

    var items = {};
    cfg.items.forEach(function (it) { items[it.id] = { state: 'hidden', x: 0, z: 0 }; });

    var grumpies = [];
    cfg.grumpies.forEach(function (g) {
      var zr = zoneRangeForIndex(zoneIndexForZ(g.home[1]));
      grumpies.push({
        id: g.id, role: g.role, drops: g.drops || null,
        x: g.home[0], z: g.home[1], hp: g.hits,
        state: 'idle', mood: 0, follow: false,
        homeX: g.home[0], homeZ: g.home[1],
        zMin: zr.zMin, zMax: zr.zMax,
        wanderAngle: rng() * 2 * Math.PI, wanderTimer: 0,
        retreatT: 0, respawnTimer: 0, bumpCooldown: 0
      });
    });

    var gates = {};
    cfg.gates.forEach(function (g) {
      gates[g.id] = { open: false, openT: 0, posX: g.pos[0], posZ: g.pos[1], w: g.w, d: g.d, needs: g.needs };
    });
    var chests = {};
    cfg.chests.forEach(function (c) {
      chests[c.id] = { open: false, posX: c.pos[0], posZ: c.pos[1], item: c.item };
    });
    var bushes = {};
    cfg.bushes.forEach(function (b) {
      bushes[b.id] = { cut: false, posX: b.pos[0], posZ: b.pos[1], item: b.item };
    });
    var pedestals = {};
    cfg.pedestals.forEach(function (p) {
      pedestals[p.id] = { lit: false, wiggleT: 0, posX: p.pos[0], posZ: p.pos[1] };
    });

    var acorns = [];
    var nextAcornT = acornInterval;
    var bridge = { built: false, t: 0 };
    var owl = { talkT: 0 };
    var complete = false;
    var zone = zoneForZ(hero.z);

    function pushEvent(ev) { events.push(ev); }

    function blockedHero(x, z) {
      var i, o;
      for (i = 0; i < cfg.obstacles.length; i++) {
        o = cfg.obstacles[i];
        if (circleOverlap(x, z, heroR, o.x, o.z, o.r)) return true;
      }
      for (var gid in gates) if (!gates[gid].open && rectOverlap(x, z, heroR, gates[gid].posX, gates[gid].posZ, gates[gid].w, gates[gid].d)) return true;
      for (var cid in chests) if (!chests[cid].open && circleOverlap(x, z, heroR, chests[cid].posX, chests[cid].posZ, 1.0)) return true;
      for (i = 0; i < grumpies.length; i++) {
        o = grumpies[i];
        if (o.state !== 'happy' && o.respawnTimer <= 0 && circleOverlap(x, z, heroR, o.x, o.z, grumpyR)) return true;
      }
      return false;
    }

    function blockedGrumpy(x, z) {
      for (var i = 0; i < cfg.obstacles.length; i++) {
        var o = cfg.obstacles[i];
        if (circleOverlap(x, z, grumpyR, o.x, o.z, o.r)) return true;
      }
      for (var gid in gates) if (!gates[gid].open && rectOverlap(x, z, grumpyR, gates[gid].posX, gates[gid].posZ, gates[gid].w, gates[gid].d)) return true;
      return false;
    }

    function moveHero(dx, dz) {
      var nx = hero.x + dx, nz = hero.z + dz;
      if (!blockedHero(nx, nz)) { hero.x = nx; hero.z = nz; return; }
      if (dx !== 0 && !blockedHero(nx, hero.z)) hero.x = nx;
      if (dz !== 0 && !blockedHero(hero.x, nz)) hero.z = nz;
    }

    function moveGrumpy(gr, dx, dz) {
      var nx = clamp(gr.x + dx, bounds.xMin + grumpyR, bounds.xMax - grumpyR);
      var nz = clamp(gr.z + dz, gr.zMin, gr.zMax);
      if (!blockedGrumpy(nx, nz)) { gr.x = nx; gr.z = nz; return; }
      if (dx !== 0 && !blockedGrumpy(nx, gr.z)) gr.x = nx;
      if (dz !== 0 && !blockedGrumpy(gr.x, nz)) gr.z = nz;
    }

    function clampHero() {
      hero.x = clamp(hero.x, bounds.xMin + heroR, bounds.xMax - heroR);
      hero.z = clamp(hero.z, bounds.zMin + heroR, bounds.zMax - heroR);
    }

    function heroStep(dtMs, dtSec, input) {
      var hasInput = (input.sx !== 0 || input.sy !== 0);
      if (hero.bumpT > 0) {
        moveHero(hero.vx * dtSec, hero.vz * dtSec);
        hero.bumpT -= dtMs;
        if (hero.bumpT <= 0) { hero.vx = 0; hero.vz = 0; hero.bumpT = 0; }
      } else if (!hasInput) {
        hero.vx = 0; hero.vz = 0;
      } else {
        var speed = heroSpeed * (hero.shield ? shieldMul : 1);
        var targetVx = input.sx * speed, targetVz = input.sy * speed;
        var accel = heroAccel * dtSec;
        hero.vx += clamp(targetVx - hero.vx, -accel, accel);
        hero.vz += clamp(targetVz - hero.vz, -accel, accel);
        if (hero.vx !== 0 || hero.vz !== 0) {
          hero.facing = Math.atan2(hero.vz, hero.vx);
          moveHero(hero.vx * dtSec, hero.vz * dtSec);
        }
      }
      clampHero();

      var wasSwinging = hero.swingT > 0;
      if (hero.swingT > 0) hero.swingT -= dtMs;
      if (wasSwinging && hero.swingT <= 0) { hero.swingT = 0; hero.cooldown = cooldownMs; }
      else if (hero.cooldown > 0) hero.cooldown -= dtMs;
      if (hero.cooldown < 0) hero.cooldown = 0;
    }

    function angleDiff(a, b) {
      var d = a - b;
      while (d <= -Math.PI) d += 2 * Math.PI;
      while (d > Math.PI) d -= 2 * Math.PI;
      return d;
    }

    function swingStep() {
      if (hero.swingT <= 0) return;
      var dir = hero.facing;
      var arcHalf = swordArc / 2;
      for (var i = 0; i < grumpies.length; i++) {
        var gr = grumpies[i];
        if (gr.state === 'happy' || gr.respawnTimer > 0) continue;
        if (hero.swingHits[gr.id]) continue;
        var dx = gr.x - hero.x, dz = gr.z - hero.z;
        var d = Math.hypot(dx, dz);
        if (d > swordReach) continue;
        var ang = Math.atan2(dz, dx);
        if (Math.abs(angleDiff(ang, dir)) > arcHalf) continue;
        hero.swingHits[gr.id] = true;
        gr.hp -= 1;
        pushEvent({ type: 'hit', id: gr.id });
        if (gr.hp <= 0) {
          gr.state = 'happy'; gr.mood = 100;
          pushEvent({ type: 'befriend', id: gr.id });
          if (gr.drops && items[gr.drops] && items[gr.drops].state === 'hidden') {
            items[gr.drops].state = 'world';
            items[gr.drops].x = gr.x; items[gr.drops].z = gr.z;
            pushEvent({ type: 'itemSpawn', id: gr.drops });
          }
        } else {
          gr.state = 'retreat'; gr.retreatT = retreatMs;
        }
      }
    }

    function grumpyStep(dtMs, dtSec) {
      for (var i = 0; i < grumpies.length; i++) {
        var gr = grumpies[i];
        if (gr.bumpCooldown > 0) gr.bumpCooldown -= dtMs;

        if (gr.state === 'happy') {
          gr.mood -= dtSec * 50;
          if (gr.mood <= 0) { gr.mood = 0; gr.state = 'idle'; gr.respawnTimer = respawnMs; }
          continue;
        }
        if (gr.respawnTimer > 0) {
          gr.respawnTimer -= dtMs;
          if (gr.respawnTimer <= 0) {
            var heroDist = Math.hypot(hero.x - gr.homeX, hero.z - gr.homeZ);
            if (heroDist > respawnMinHeroDist) {
              gr.x = gr.homeX; gr.z = gr.homeZ;
              gr.hp = (gr.role === 'boss') ? 3 : (gr.role === 'guard' ? 2 : 1);
              gr.state = 'idle';
              pushEvent({ type: 'grumpyRespawn', id: gr.id });
            } else { gr.respawnTimer = respawnMs; }
          }
          continue;
        }

        var dx = hero.x - gr.x, dz = hero.z - gr.z;
        var d = Math.hypot(dx, dz) || 0.0001;

        if (gr.state === 'retreat') {
          gr.retreatT -= dtMs;
          moveGrumpy(gr, (-dx / d) * grumpySpeed * dtSec, (-dz / d) * grumpySpeed * dtSec);
          if (gr.retreatT <= 0) gr.state = 'idle';
          continue;
        }

        if (d <= notice) {
          gr.state = 'approach';
          moveGrumpy(gr, (dx / d) * grumpySpeed * dtSec, (dz / d) * grumpySpeed * dtSec);
        } else {
          gr.state = 'idle';
          gr.wanderTimer -= dtMs;
          if (gr.wanderTimer <= 0) { gr.wanderAngle = rng() * 2 * Math.PI; gr.wanderTimer = 1000 + rng() * 2000; }
          var wx = Math.cos(gr.wanderAngle) * grumpySpeed * dtSec;
          var wz = Math.sin(gr.wanderAngle) * grumpySpeed * dtSec;
          var nx = gr.x + wx, nz = gr.z + wz;
          var homeDist = Math.hypot(nx - gr.homeX, nz - gr.homeZ);
          if (homeDist > wanderR) { wx = -wx; wz = -wz; gr.wanderAngle += Math.PI; }
          moveGrumpy(gr, wx, wz);
        }
      }

      var aliveNormal = 0;
      for (var j = 0; j < grumpies.length; j++) {
        var g2 = grumpies[j];
        if (g2.role === 'normal' && g2.state !== 'happy' && g2.respawnTimer <= 0) aliveNormal++;
      }
      if (aliveNormal > maxAliveNormal) {
        var sleepCount = aliveNormal - maxAliveNormal;
        for (var k = 0; k < grumpies.length && sleepCount > 0; k++) {
          var g3 = grumpies[k];
          if (g3.role === 'normal' && g3.state !== 'happy' && g3.respawnTimer <= 0) { g3.respawnTimer = respawnMs; sleepCount--; }
        }
      }
    }

    function acornStep(dtMs, dtSec) {
      nextAcornT -= dtMs;
      if (nextAcornT <= 0) {
        nextAcornT = acornInterval;
        var side = rng() < 0.5 ? -1 : 1;
        acorns.push({ x: side * (15 + rng() * 5), z: bounds.zMax - 2, vx: 0, vz: -acornSpeed, age: 0 });
      }
      for (var i = acorns.length - 1; i >= 0; i--) {
        var a = acorns[i];
        a.age += dtMs;
        if (a.age >= acornLifeMs) { acorns.splice(i, 1); continue; }
        a.z += a.vz * dtSec;
        if (a.z <= bounds.zMin) { acorns.splice(i, 1); continue; }
        var dx = hero.x - a.x, dz = hero.z - a.z;
        var d = Math.hypot(dx, dz) || 0.0001;
        if (d <= heroR + acornRadius) {
          if (hero.shield) {
            pushEvent({ type: 'shieldBlock' });
            a.vz = acornSpeed;
          } else {
            pushEvent({ type: 'bump', from: 'acorn' });
            hero.bumpT = bumpMs;
            hero.vx = (dx / d) * (bumpDist / (bumpMs / 1000));
            hero.vz = (dz / d) * (bumpDist / (bumpMs / 1000));
            acorns.splice(i, 1);
          }
        }
      }
    }

    function interactStep(dtMs) {
      var bid, cid, iid, pid, gid;
      /* bush cut by swing */
      if (hero.swingT > 0) {
        for (bid in bushes) {
          var b = bushes[bid];
          if (b.cut) continue;
          var bdx = b.posX - hero.x, bdz = b.posZ - hero.z;
          var bd = Math.hypot(bdx, bdz);
          if (bd > swordReach) continue;
          if (Math.abs(angleDiff(Math.atan2(bdz, bdx), hero.facing)) > swordArc / 2) continue;
          b.cut = true;
          if (items[b.item] && items[b.item].state === 'hidden') {
            items[b.item].state = 'world'; items[b.item].x = b.posX; items[b.item].z = b.posZ;
            pushEvent({ type: 'itemSpawn', id: b.item });
          }
          pushEvent({ type: 'bushCut', id: bid });
        }
      }
      /* chest by swing + proximity */
      for (cid in chests) {
        var c = chests[cid];
        if (c.open) continue;
        var cd = Math.hypot(hero.x - c.posX, hero.z - c.posZ);
        if (cd <= chestRange && hero.swingT > 0) {
          c.open = true;
          if (items[c.item] && items[c.item].state === 'hidden') {
            items[c.item].state = 'world'; items[c.item].x = c.posX; items[c.item].z = c.posZ;
            pushEvent({ type: 'itemSpawn', id: c.item });
          }
          pushEvent({ type: 'chestOpen', id: cid });
        }
      }
      /* pickup */
      for (iid in items) {
        var it = items[iid];
        if (it.state !== 'world') continue;
        if (Math.hypot(hero.x - it.x, hero.z - it.z) <= pickupRange) {
          it.state = 'carried'; carry.push(iid);
          var src = null;
          for (var q = 0; q < cfg.items.length; q++) if (cfg.items[q].id === iid) src = cfg.items[q];
          pushEvent({ type: 'pickup', id: iid, kind: src ? src.kind : 'gem' });
        }
      }
      /* gate with key */
      for (gid in gates) {
        var g = gates[gid];
        if (g.open) continue;
        if (Math.hypot(hero.x - g.posX, hero.z - g.posZ) > keyUseRange) continue;
        var ki = carry.indexOf(g.needs);
        if (ki !== -1) {
          carry.splice(ki, 1);
          if (items[g.needs]) items[g.needs].state = 'used';
          g.open = true; g.openT = t;
          pushEvent({ type: 'gateOpen', id: gid });
        }
      }
      /* pedestal gem */
      for (pid in pedestals) {
        var p = pedestals[pid];
        if (p.lit) continue;
        if (Math.hypot(hero.x - p.posX, hero.z - p.posZ) > gemPlaceRange) continue;
        var gemId = 'gem' + pid.charAt(0).toUpperCase() + pid.slice(1);
        var gi = carry.indexOf(gemId);
        if (gi !== -1) {
          carry.splice(gi, 1);
          if (items[gemId]) { items[gemId].state = 'used'; items[gemId].x = p.posX; items[gemId].z = p.posZ; }
          p.lit = true; p.wiggleT = 500;
          pushEvent({ type: 'pedestalFill', id: pid });
        } else {
          var holdGem = false;
          for (var ci = 0; ci < carry.length; ci++) if (carry[ci].indexOf('gem') === 0) holdGem = true;
          if (holdGem) pushEvent({ type: 'pedestalWrong', id: pid });
        }
      }
      /* bridge + complete */
      var allLit = true;
      for (var np = 0; np < cfg.pedestals.length; np++) if (!pedestals[cfg.pedestals[np].id].lit) allLit = false;
      if (allLit && !bridge.built) { bridge.built = true; bridge.t = 0; pushEvent({ type: 'bridgeUp' }); }
      if (bridge.built) bridge.t += dtMs;
      if (bridge.built && !complete) {
        if (Math.hypot(hero.x - cfg.lighthouse.pos[0], hero.z - cfg.lighthouse.pos[1]) <= cfg.lighthouse.r + heroR + 0.5) {
          complete = true;
          pushEvent({ type: 'complete' });
        }
      }
      /* owl talk */
      var owlPos = cfg.npcs[0].pos;
      if (Math.hypot(hero.x - owlPos[0], hero.z - owlPos[1]) <= owlRange) {
        owl.talkT -= dtMs;
        if (owl.talkT <= 0) { pushEvent({ type: 'owlTalk', line: owlLine() }); owl.talkT = owlRepeatMs; }
      } else { owl.talkT = 0; }
      /* grumpy bump hero */
      for (var x = 0; x < grumpies.length; x++) {
        var gr = grumpies[x];
        if (gr.state === 'happy' || gr.respawnTimer > 0 || gr.bumpCooldown > 0) continue;
        var ddx = hero.x - gr.x, ddz = hero.z - gr.z;
        var dd = Math.hypot(ddx, ddz) || 0.0001;
        if (dd <= heroR + grumpyR + 0.1) {
          pushEvent({ type: 'bump', from: gr.id });
          hero.bumpT = bumpMs;
          hero.vx = (ddx / dd) * (bumpDist / (bumpMs / 1000));
          hero.vz = (ddz / dd) * (bumpDist / (bumpMs / 1000));
          gr.bumpCooldown = bumpCooldownMs;
        }
      }
    }

    function owlLine() {
      var obj = nextObjective();
      if (complete) return 'complete';
      if (!obj) return 'intro';
      if (obj.kind === 'gate') return 'hintGate';
      if (obj.kind === 'pedestal') return 'hintGems';
      if (obj.kind === 'bridge') return 'bridge';
      return 'intro';
    }

    function nextObjective() {
      var gid, pid;
      for (gid in gates) if (!gates[gid].open && carry.indexOf(gates[gid].needs) !== -1) return { x: gates[gid].posX, z: gates[gid].posZ, kind: 'gate', id: gid };
      for (pid in pedestals) {
        if (pedestals[pid].lit) continue;
        var gemId = 'gem' + pid.charAt(0).toUpperCase() + pid.slice(1);
        if (carry.indexOf(gemId) !== -1) return { x: pedestals[pid].posX, z: pedestals[pid].posZ, kind: 'pedestal', id: pid };
      }
      var allLit = true;
      for (var i = 0; i < cfg.pedestals.length; i++) if (!pedestals[cfg.pedestals[i].id].lit) allLit = false;
      if (allLit && !bridge.built) return { x: (cfg.bridge.from[0] + cfg.bridge.to[0]) / 2, z: (cfg.bridge.from[1] + cfg.bridge.to[1]) / 2, kind: 'bridge', id: 'bridge' };
      if (bridge.built && !complete) return { x: cfg.lighthouse.pos[0], z: cfg.lighthouse.pos[1], kind: 'lighthouse', id: 'lighthouse' };
      return null;
    }

    function step(dtMs, input) {
      input = input || {};
      var sx = num(input.sx) ? input.sx : 0;
      var sy = num(input.sy) ? input.sy : 0;
      var swing = !!input.swing;
      if (dtMs > dtClampMs) dtMs = dtClampMs;
      if (!(dtMs > 0)) dtMs = 0;
      var n = Math.max(1, Math.ceil(dtMs / stepMs));
      var subDt = dtMs / n;
      var subSec = subDt / 1000;

      for (var i = 0; i < n; i++) {
        hero.shield = !!input.shield;
        if (swing && hero.swingT <= 0 && hero.cooldown <= 0) {
          hero.swingT = swingMs; hero.swingHits = {};
          pushEvent({ type: 'swing' });
        }
        heroStep(subDt, subSec, { sx: sx, sy: sy });
        swingStep();
        grumpyStep(subDt, subSec);
        acornStep(subDt, subSec);
        interactStep(subDt);
        t += subDt;
        swing = false;
      }
      zone = zoneForZ(hero.z);
    }

    function state() {
      var s = {
        t: t,
        hero: { x: hero.x, z: hero.z, facing: hero.facing, vx: hero.vx, vz: hero.vz,
                swingT: hero.swingT, cooldown: hero.cooldown, shield: hero.shield, bumpT: hero.bumpT },
        carry: carry.slice(), items: {}, grumpies: [],
        gates: {}, chests: {}, bushes: {}, pedestals: {},
        acorns: [], bridge: { built: bridge.built, t: bridge.t },
        owl: { talkT: owl.talkT }, statue: { nextT: nextAcornT }, complete: complete, zone: zone
      };
      for (var iid in items) s.items[iid] = { state: items[iid].state, x: items[iid].x, z: items[iid].z };
      for (var i = 0; i < grumpies.length; i++) {
        var gr = grumpies[i];
        s.grumpies.push({ id: gr.id, role: gr.role, x: gr.x, z: gr.z, state: gr.state, hp: gr.hp, mood: gr.mood, follow: gr.follow });
      }
      for (var gid in gates) s.gates[gid] = { open: gates[gid].open, openT: gates[gid].openT };
      for (var cid in chests) s.chests[cid] = { open: chests[cid].open };
      for (var bid in bushes) s.bushes[bid] = { cut: bushes[bid].cut };
      for (var pid in pedestals) s.pedestals[pid] = { lit: pedestals[pid].lit, wiggleT: pedestals[pid].wiggleT };
      for (var a = 0; a < acorns.length; a++) s.acorns.push({ x: acorns[a].x, z: acorns[a].z, vx: acorns[a].vx, vz: acorns[a].vz, age: acorns[a].age });
      return s;
    }

    function drainEvents() { var e = events.slice(); events.length = 0; return e; }

    function save() {
      var s = { v: 1, gates: {}, chests: {}, bushes: {}, items: {}, befriended: {}, pedestals: {}, bridge: bridge.built, complete: complete };
      for (var gid in gates) s.gates[gid] = gates[gid].open;
      for (var cid in chests) s.chests[cid] = chests[cid].open;
      for (var bid in bushes) s.bushes[bid] = bushes[bid].cut;
      for (var iid in items) s.items[iid] = items[iid].state;
      for (var i = 0; i < grumpies.length; i++) s.befriended[grumpies[i].id] = (grumpies[i].state === 'happy');
      for (var pid in pedestals) s.pedestals[pid] = pedestals[pid].lit;
      return s;
    }

    function load(obj) {
      var v = validateSave(obj, cfg);
      if (!v) return false;
      var gid, cid, bid, iid, pid, i;
      for (gid in v.gates) if (gates[gid]) gates[gid].open = v.gates[gid];
      for (cid in v.chests) if (chests[cid]) chests[cid].open = v.chests[cid];
      for (bid in v.bushes) if (bushes[bid]) bushes[bid].cut = v.bushes[bid];
      for (iid in v.items) if (items[iid]) items[iid].state = v.items[iid];
      for (i = 0; i < grumpies.length; i++) if (v.befriended[grumpies[i].id]) { grumpies[i].state = 'happy'; grumpies[i].mood = 100; }
      for (pid in v.pedestals) if (pedestals[pid]) pedestals[pid].lit = v.pedestals[pid];
      bridge.built = v.bridge; complete = v.complete;
      carry.length = 0;
      for (iid in items) {
        var it = items[iid];
        if (it.state === 'carried') carry.push(iid);
        if (it.state === 'world') {
          var found = false;
          for (bid in bushes) if (bushes[bid].item === iid && !bushes[bid].cut) { it.x = bushes[bid].posX; it.z = bushes[bid].posZ; found = true; break; }
          if (!found) for (cid in chests) if (chests[cid].item === iid && !chests[cid].open) { it.x = chests[cid].posX; it.z = chests[cid].posZ; found = true; break; }
          if (!found) for (i = 0; i < grumpies.length; i++) if (grumpies[i].drops === iid && grumpies[i].state !== 'happy') { it.x = grumpies[i].x; it.z = grumpies[i].z; found = true; break; }
          if (!found) it.state = 'hidden';
        }
      }
      var lastGate = null;
      for (gid in gates) if (gates[gid].open) lastGate = gates[gid];
      hero.x = lastGate ? lastGate.posX : cfg.hero.start[0];
      hero.z = lastGate ? lastGate.posZ : cfg.hero.start[1];
      hero.vx = 0; hero.vz = 0; hero.facing = -Math.PI / 2;
      hero.swingT = 0; hero.cooldown = 0; hero.shield = false; hero.bumpT = 0; hero.swingHits = {};
      t = 0; events.length = 0;
      for (i = 0; i < grumpies.length; i++) {
        var g = grumpies[i];
        if (g.state !== 'happy') { g.x = g.homeX; g.z = g.homeZ; g.hp = (g.role === 'boss') ? 3 : (g.role === 'guard' ? 2 : 1); g.state = 'idle'; g.respawnTimer = 0; }
      }
      acorns.length = 0; nextAcornT = acornInterval;
      bridge.t = 0; owl.talkT = 0;
      zone = zoneForZ(hero.z);
      return true;
    }

    var debug = {
      teleport: function (x, z) { hero.x = clamp(x, bounds.xMin + heroR, bounds.xMax - heroR); hero.z = clamp(z, bounds.zMin + heroR, bounds.zMax - heroR); },
      give: function (itemId) {
        if (items[itemId] && items[itemId].state !== 'carried' && items[itemId].state !== 'used') {
          items[itemId].state = 'carried';
          if (carry.indexOf(itemId) === -1) carry.push(itemId);
        }
      },
      setHits: function (id, n) { for (var i = 0; i < grumpies.length; i++) if (grumpies[i].id === id) grumpies[i].hp = n; },
      reset: function () {
        return load({ v: 1, gates: {}, chests: {}, bushes: {}, items: {}, befriended: {}, pedestals: {}, bridge: false, complete: false });
      }
    };

    return { step: step, state: state, drainEvents: drainEvents, nextObjective: nextObjective,
             save: save, load: load, debug: debug };
  }

  window.little_adventureLogic = {
    stickVector: stickVector,
    validateConfig: validateConfig,
    validateSave: validateSave,
    createGame: createGame
  };
})();