/* Мала авантура (Little Adventure) — pure logic (TD §3).
   Classic script; no DOM, no three.js, no Date/Math.random.
   Exports validateConfig and stickVector on window.little_adventureLogic. */
(function () {
  'use strict';

  /* mulberry32 — deterministic RNG; source copied from racing3d.mjs near its top. */
  function mulberry32(seed) {
    return function () {
      var t = (seed += 0x6D2B79F5) | 0;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* stickVector: magnitude = min(hypot/radius,1); below deadzone -> zeros;
     direction normalised; y NOT flipped (renderer decides). */
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

  function str(s) { return typeof s === 'string'; }
  function num(n) { return typeof n === 'number' && isFinite(n); }
  function pos(p) { return Array.isArray(p) && p.length === 2 && num(p[0]) && num(p[1]); }
  function boundsShape(b) { return b && num(b.xMin) && num(b.xMax) && num(b.zMin) && num(b.zMax) && b.xMin < b.xMax && b.zMin < b.zMax; }

  function inBounds(x, z, cfg) {
    return x >= cfg.bounds.xMin && x <= cfg.bounds.xMax &&
           z >= cfg.bounds.zMin && z <= cfg.bounds.zMax;
  }

  function validateConfig(cfg) {
    var problems = [];

    if (!cfg || typeof cfg !== 'object') {
      return ['config is not an object'];
    }
    if (!pos(cfg.hero.start)) problems.push('hero.start must be [x,z]');
    if (!num(cfg.hero.radius) || cfg.hero.radius <= 0) problems.push('hero.radius must be >0');
    if (!num(cfg.hero.speed) || cfg.hero.speed <= 0) problems.push('hero.speed must be >0');

    if (!boundsShape(cfg.bounds)) problems.push('bounds must be {xMin,xMax,zMin,zMax} with xMin<xMax and zMin<zMax');
    if (boundsShape(cfg.bounds) && !inBounds(cfg.hero.start[0], cfg.hero.start[1], cfg)) problems.push('hero.start inside bounds');

    /* item ids unique, ASCII, kind valid */
    var itemIds = {};
    if (!Array.isArray(cfg.items)) problems.push('items must be an array');
    else {
      cfg.items.forEach(function (it) {
        if (!str(it.id) || !ASCII_ID.test(it.id)) problems.push('item id not ASCII: ' + it.id);
        else if (itemIds[it.id]) problems.push('duplicate item id: ' + it.id);
        else itemIds[it.id] = it;
        if (!str(it.kind) || ITEM_KINDS.indexOf(it.kind) === -1) problems.push('item ' + it.id + ' kind invalid');
      });
    }

    var itemIdList = Object.keys(itemIds);

    /* all drops/item/needs reference an existing item id */
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

    /* pedestal colours: exactly red/green/blue (by pedestal id) */
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

    /* gates inside bounds */
    if (!Array.isArray(cfg.gates)) problems.push('gates must be an array');
    else {
      cfg.gates.forEach(function (g) {
        if (!pos(g.pos)) problems.push('gate ' + (g.id || '?') + ' pos must be [x,z]');
        else if (!inBounds(g.pos[0], g.pos[1], cfg)) problems.push('gate ' + (g.id || '?') + ' outside bounds');
      });
    }

    /* chests inside bounds */
    if (!Array.isArray(cfg.chests)) problems.push('chests must be an array');
    else {
      cfg.chests.forEach(function (c) {
        if (!pos(c.pos)) problems.push('chest ' + (c.id || '?') + ' pos must be [x,z]');
        else if (!inBounds(c.pos[0], c.pos[1], cfg)) problems.push('chest ' + (c.id || '?') + ' outside bounds');
      });
    }

    /* grumpy ids unique ASCII */
    var gIds = {};
    if (!Array.isArray(cfg.grumpies)) problems.push('grumpies must be an array');
    else {
      cfg.grumpies.forEach(function (g) {
        if (!str(g.id) || !ASCII_ID.test(g.id)) problems.push('grumpy id not ASCII: ' + g.id);
        else if (gIds[g.id]) problems.push('duplicate grumpy id: ' + g.id);
        else gIds[g.id] = g;
        if (VALID_ROLES.indexOf(g.role) === -1) problems.push('grumpy ' + (g.id || '?') + ' role invalid: ' + g.role);
        if (!num(g.hits) || g.hits < 1) problems.push('grumpy ' + (g.id || '?') + ' hits must be >=1');
        if (!pos(g.home)) problems.push('grumpy ' + (g.id || '?') + ' home must be [x,z]');
        else if (!inBounds(g.home[0], g.home[1], cfg)) problems.push('grumpy ' + (g.id || '?') + ' home outside bounds');
      });
    }

    /* exactly one boss */
    var bossCount = cfg.grumpies ? cfg.grumpies.filter(function (g) { return g.role === 'boss'; }).length : 0;
    if (bossCount !== 1) problems.push('exactly 1 boss required, got ' + bossCount);

    /* speech keys complete */
    if (!cfg.speech || typeof cfg.speech !== 'object') {
      problems.push('speech missing');
    } else {
      ALL_SPEECH_KEYS.forEach(function (key) {
        if (!str(cfg.speech[key])) problems.push('speech key missing: ' + key);
      });
    }

    return problems;
  }

  window.little_adventureLogic = {
    stickVector: stickVector,
    validateConfig: validateConfig
  };
})();