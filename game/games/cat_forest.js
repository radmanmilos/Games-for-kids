/* ---------------- МАЧЈА ШУМА (Cat Forest) ----------------
   Feed visiting emoji cats; each visit leaves a gift that grows into the
   forest. Calm, wordless, no fail states. Plan package:
   resources/General_reviews/Cat_Forest/ (01_TECH_DESIGN.md is the contract).
   CF-01 shell · CF-03 static stage · CF-04 engine core (below): constants,
   clock, seedable RNG, state, render() and the __catForest test hook.
   CF-06 adds the cat/treat/gift data and the weighted picker; CF-07 the cat
   actor lifecycle (walk in, sit, eat, leave) fully driven by the game clock.
   CF-08 the gift that a finished visit leaves and the forest it grows into.
   CF-09 the cuddle tap: hearts, meow and the spoken name, changing nothing else.
   CF-10 the first-visit nicety, the setTime hook and the gentle idle hint.
   CF-11 the ☀️/🌙 toggle: night sky, stars and the swish cue, all on data-time.
   Gameplay arrives card by card — nothing here is visible to the child yet. */
(function () {
  'use strict';

  /* Every tunable lives here (PS §6); no magic numbers anywhere else. CF-22
     play-test tuning edits these values and nothing else. */
  var CF = {
    PLATES: 3,
    MAX_CATS: 3,
    ARRIVE_MIN: 2500,
    ARRIVE_MAX: 4000,
    ENTER_MIN: 2200,
    ENTER_MAX: 3000,
    SIT_MS: 900,
    EAT_MIN: 8000,
    EAT_MAX: 14000,
    LEAVE_MIN: 2200,
    LEAVE_MAX: 3000,
    UNLIKED_FACTOR: 0.25,
    GIFT_CAP: 5,
    DECOR_MAX: 14,
    GIFT_FLY_MS: 600,
    PARTICLE_CAP: 12,
    SPEECH_GAP_MS: 1500,
    MEOW_GAP_MS: 300,
    IDLE_HINT_MS: 10000,
    FIRST_HINT_MS: 1500,
    HINT_MS: 1200,
    HINT_REPEAT_MAX: 3,
    RAIN_DROPS: 24,
    DROP_PAD: 24,
    DRAG_START_PX: 8,
    DT_CLAMP_MS: 100,
    STEP_MS: 50
  };

  /* ---- data (CF-06; TD §3, PS §5) --------------------------------------
     ids are ASCII code ids; names are the approved D9 Cyrillic strings. A new
     cat or treat is a data-only change, so every list lives here in one place. */
  var TREATS = [
    { id: 'fish',    emoji: '🐟', name: 'Риба' },
    { id: 'milk',    emoji: '🥛', name: 'Млеко' },
    { id: 'chicken', emoji: '🍗', name: 'Пилетина' },
    { id: 'sushi',   emoji: '🍣', name: 'Суши' },
    { id: 'cookie',  emoji: '🍪', name: 'Колачић' }
  ];

  /* `acc` is the accessory drawn over the body emoji; `fallbackEmoji` covers
     devices that do not render the 🐈‍⬛ ZWJ glyph as one (D7, probed later). */
  var CATS = [
    { id: 'maca',   name: 'Маца',     emoji: '🐱', acc: null, likes: ['fish', 'milk'],      weight: 1.0 },
    { id: 'puhko',  name: 'Пухко',    emoji: '🐈', acc: null, likes: ['milk', 'cookie'],    weight: 1.0 },
    { id: 'mica',   name: 'Мица',     emoji: '🐱', acc: '🎀', likes: ['cookie', 'chicken'], weight: 0.8 },
    { id: 'sef',    name: 'Шеф',      emoji: '🐈', acc: '🎩', likes: ['chicken', 'sushi'],  weight: 0.7 },
    { id: 'cveta',  name: 'Цвета',    emoji: '🐱', acc: '🌸', likes: ['milk', 'sushi'],     weight: 0.7 },
    { id: 'tigar',  name: 'Тигар',    emoji: '🐯', acc: null, likes: ['chicken', 'fish'],   weight: 0.5 },
    { id: 'tacka',  name: 'Тачка',    emoji: '🐆', acc: null, likes: ['sushi', 'fish'],     weight: 0.5 },
    { id: 'senka',  name: 'Сенка',    emoji: '🐈‍⬛', fallbackEmoji: '🐱', acc: null, likes: ['fish'], weight: 1.0, night: true },
    { id: 'zvezda', name: 'Звездица', emoji: '🐈', acc: '⭐', likes: ['milk', 'sushi'],     weight: 0.7, night: true },
    { id: 'kralj',  name: 'Краљ',     emoji: '🦁', acc: '👑', likes: [],                    weight: 0.4, needsAllPlates: true }
  ];

  var GIFTS = ['🌸', '🌷', '🍄', '🍀', '🦋'];

  var started = false;

  /* ---- state (TD §5) ---------------------------------------------------- */
  function newPlate(idx) {
    return { idx: idx, state: 'empty', treat: null, arriveMs: 0, catId: null };
  }

  function newState() {
    var plates = [];
    for (var i = 0; i < CF.PLATES; i++) plates.push(newPlate(i));
    return {
      clock: 0,
      paused: false,
      time: 'day',
      weather: 'clear',
      selectedTreat: null,
      plates: plates,
      cats: [],
      gifts: [],
      flights: [],
      decor: [],
      decorCollected: 0,
      met: [],
      lastVisitorId: null,
      visitsThisSession: 0,
      idle: { sinceMs: 0, hints: 0, firstDone: false },
      fx: { count: 0, parts: [] },
      /* Transient picture hints (no text): a gentle bounce of the tray or of the
         selected treat. Kept in state and timed by the clock so step() can drive
         it in tests; not part of the TD §8 snapshot. */
      nudge: { kind: null, treat: null, until: 0 }
    };
  }

  var state = newState();

  /* ---- seedable RNG (mulberry32, TD §6) ---------------------------------
     Every random draw in the game goes through rnd() — no Math.random() in
     gameplay code — so a seeded run is reproducible. The default seed is taken
     once at boot; seed(n) resets the stream for tests. */
  function mulberry32(a) {
    return function () {
      a |= 0;
      a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  var rnd = mulberry32(1);

  function seed(n) {
    rnd = mulberry32((n >>> 0) || 1);
    /* Reseeding also clears the session pick history (TD §8): the anti-repeat
       memory and the first-visit nicety's visit count (CF-10), so a seeded run
       is fully reproducible and "the first visit" is testable per seed. */
    state.lastVisitorId = null;
    state.visitsThisSession = 0;
  }

  seed((Math.random() * 0x100000000) >>> 0);

  function rngRange(min, max) {
    return min + Math.floor(rnd() * (max - min + 1));
  }

  /* ---- picker (CF-06; TD §7) -------------------------------------------
     Pure and UI-free: given the treat on the table and the world this instant,
     choose the next visiting cat. Every draw goes through rnd(), so a seeded
     run is reproducible and tests can pin the distribution. */
  function eligibleCats(skipOccupied, night, platesFilled, occupied) {
    return CATS.filter(function (c) {
      if (c.night && !night) return false;                              // night-only cats only at night
      if (c.needsAllPlates && platesFilled !== 3) return false;         // Краљ only with all plates full
      if (!skipOccupied && occupied.indexOf(c.id) !== -1) return false; // a cat already on stage stays out
      return true;
    });
  }

  /* One cumulative-weight draw over `pool`. `noRepeat` drops the anti-repeat
     halving and `relaxLike` drops the non-favourite penalty (fallback only). */
  function weightedPick(pool, treat, lastVisitorId, noRepeat, relaxLike) {
    var total = 0, w = [], i, c, x;
    for (i = 0; i < pool.length; i++) {
      c = pool[i];
      x = c.weight;
      if (!noRepeat && c.id === lastVisitorId) x *= 0.5;
      if (!relaxLike && c.likes.indexOf(treat) === -1) x *= CF.UNLIKED_FACTOR;
      w.push(x);
      total += x;
    }
    var r = rnd() * total, acc = 0;
    for (i = 0; i < pool.length; i++) {
      acc += w[i];
      if (r < acc) return pool[i];
    }
    return pool[pool.length - 1]; // float safety net — the draw never misses
  }

  /* CF-10 step 2 (TD §7): the very first pick of a session only offers the
     friendly heavyweight cats (weight >= FIRST_VISIT_W) that like the placed
     treat — else any heavyweight — so the opening visit is warm and
     predictable. An empty restriction falls through to the normal path, so the
     never-null guarantee is untouched. FIRST_VISIT_W lives outside CF like
     EDGE_FRAC: the smoke pins CF's key set against PS §6. */
  var FIRST_VISIT_W = 1.0;

  function firstVisitPool(pool, treat) {
    var strong = pool.filter(function (c) {
      return c.weight >= FIRST_VISIT_W && c.likes.indexOf(treat) !== -1;
    });
    if (strong.length) return strong;
    return pool.filter(function (c) { return c.weight >= FIRST_VISIT_W; });
  }

  function pickCat(opts) {
    opts = opts || {};
    var treat = opts.treat || null;
    var night = !!opts.night;
    var platesFilled = opts.platesFilled || 0;
    var occupied = opts.occupiedIds || [];
    var last = opts.lastVisitorId || null;

    var pool = eligibleCats(false, night, platesFilled, occupied);
    if (pool.length) {
      if (opts.firstVisit) {
        var opening = firstVisitPool(pool, treat);
        if (opening.length) return weightedPick(opening, treat, last, false, false);
      }
      return weightedPick(pool, treat, last, false, false);
    }

    /* Fallback (TD §7): the normal pool is empty only because every eligible
       cat is occupied, so relax the anti-repeat, then the like penalty, and as
       a last resort the occupied filter — pickCat must never return null. */
    pool = eligibleCats(true, night, platesFilled, occupied);
    if (!pool.length) pool = CATS.slice();
    return weightedPick(pool, treat, last, true, true);
  }

  /* ---- cats: actor lifecycle (CF-07; TD §5, §7) -------------------------
     A cat actor is a JSON-safe record in state.cats; render() projects it to a
     button. Every phase is timed off the game clock through the sub-step loop,
     so step() reproduces a visit exactly and no per-cat timer exists.
     EDGE_FRAC/CAT_LIFT are stage fractions kept out of CF, whose key set the
     smoke pins (PS §6). */
  var EDGE_FRAC = 0.08; // how far past the stage edge a walk starts/ends
  var CAT_LIFT = 0.10;  // the cat sits this far above its plate so the treat shows
  var BOB_PX = 6;       // walking-bob amplitude; forced to 0 under reduced motion
  var uidSeq = 0;

  /* Reduced motion (TD §7): one module-level boolean; it switches only the
     decorative bob, never the logic-driven walk itself. */
  var reduceMotion = false;
  if (window.matchMedia) {
    var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    reduceMotion = mq.matches;
    var onMqChange = function (e) { reduceMotion = e.matches; };
    if (mq.addEventListener) mq.addEventListener('change', onMqChange);
    else if (mq.addListener) mq.addListener(onMqChange);
  }

  function catById(id) {
    for (var i = 0; i < CATS.length; i++) if (CATS[i].id === id) return CATS[i];
    return null;
  }

  function easeOut(p) { return 1 - (1 - p) * (1 - p); }
  function easeIn(p) { return p * p; }

  function phaseDur(phase) {
    if (phase === 'entering') return rngRange(CF.ENTER_MIN, CF.ENTER_MAX);
    if (phase === 'sitting') return CF.SIT_MS;
    if (phase === 'eating') return rngRange(CF.EAT_MIN, CF.EAT_MAX);
    return rngRange(CF.LEAVE_MIN, CF.LEAVE_MAX); // leaving
  }

  function platesFilled() {
    var n = 0;
    for (var i = 0; i < state.plates.length; i++) if (state.plates[i].state !== 'empty') n++;
    return n;
  }

  function spawnCat(plate, cat) {
    state.cats.push({
      uid: ++uidSeq, id: cat.id, plate: plate.idx,
      side: rnd() < 0.5 ? 'L' : 'R', phase: 'entering', t: 0, dur: phaseDur('entering')
    });
    plate.state = 'occupied';
    plate.catId = cat.id;
    state.lastVisitorId = cat.id;
    state.visitsThisSession++; // CF-10: the first-visit nicety applies only while this is 0
  }

  /* The exact arguments the engine passes for a plate right now (CF-10 step 1):
     the spawn path and previewPick() share this one function, so a preview can
     never drift from what a real pick would receive. */
  function pickArgs(plate) {
    return {
      treat: plate.treat,
      night: state.time === 'night',
      platesFilled: platesFilled(),
      occupiedIds: state.cats.map(function (c) { return c.id; }),
      lastVisitorId: state.lastVisitorId,
      firstVisit: state.visitsThisSession === 0
    };
  }

  /* Arrival timers (TD §7): a treat plate counts down on the game clock and a
     cat spawns when it elapses and a slot is free; otherwise the plate waits
     (no deadlock — cats always leave). */
  function updateArrivals(dt) {
    for (var i = 0; i < state.plates.length; i++) {
      var plate = state.plates[i];
      if (plate.state !== 'treat') continue;
      plate.arriveMs -= dt;
      if (plate.arriveMs > 0 || state.cats.length >= CF.MAX_CATS) continue;
      var cat = pickCat(pickArgs(plate));
      if (cat) spawnCat(plate, cat);
    }
  }

  /* One sub-step can cross at most one phase boundary (every duration is much
     larger than STEP_MS), so the leftover time is carried by hand. */
  function advanceCat(c) {
    var overflow = c.t - c.dur;
    if (c.phase === 'entering') {
      c.phase = 'sitting';
      c.dur = phaseDur('sitting');
      if (state.met.indexOf(c.id) === -1) { // first sit = met (TD §5)
        state.met.push(c.id);
        var here = catPos(c); // CF-09 step 5: one decorative sparkle burst around the cat
        spawnFx(here.x, here.y, '✨', FX_BURST);
      }
    } else if (c.phase === 'sitting') {
      c.phase = 'eating';
      c.dur = phaseDur('eating');
    } else if (c.phase === 'eating') {
      endEating(c);
      c.phase = 'leaving';
      c.dur = phaseDur('leaving');
    } else {
      removeCat(c);
      return;
    }
    c.t = overflow > 0 ? overflow : 0;
  }

  function updateCats(dt) {
    for (var i = state.cats.length - 1; i >= 0; i--) {
      var c = state.cats[i];
      c.t += dt;
      if (c.t >= c.dur) advanceCat(c);
    }
  }

  function endEating(c) {
    var plate = state.plates[c.plate];
    if (plate) { plate.state = 'empty'; plate.treat = null; plate.catId = null; plate.arriveMs = 0; }
    spawnGift(c.plate); // the finished visit leaves a gift on the freed plate (CF-08)
  }

  function removeCat(c) {
    var i = state.cats.indexOf(c);
    if (i !== -1) state.cats.splice(i, 1);
  }

  /* forceCat (TD §8): spawn a named cat, bypassing the picker, so tests and the
     geometry checks never depend on the RNG. */
  function forceCat(catId, plateIdx) {
    var plate = state.plates[plateIdx];
    var cat = catById(catId);
    if (!plate || !cat || plate.state === 'occupied' || state.cats.length >= CF.MAX_CATS) return false;
    spawnCat(plate, cat);
    render();
    return true;
  }

  /* ---- cuddle (CF-09; PS §4) --------------------------------------------
     Tapping a cat in any phase is joyful and always safe: hearts, a throttled
     meow and the spoken name. It changes nothing else — no timers, no met, no
     counters — so the throttle stamps live outside state (next to uidSeq) and
     nothing in the snapshot moves. Every cue is guarded; the game works
     silently when audio or TTS is unavailable. */
  var lastMeowMs = -1e9;   // first tap always meows; then MEOW_GAP_MS on the game clock
  var lastSpeakMs = -1e9;  // SPEECH_GAP_MS on the game clock (step() drives it in tests)

  function cuddle(c) {
    if (state.cats.indexOf(c) === -1) return; // the node is dropped in the render that ends a visit
    var pos = catPos(c);
    spawnFx(pos.x, pos.y, '❤️', reduceMotion ? 1 : FX_BURST);
    if (state.clock - lastMeowMs >= CF.MEOW_GAP_MS) {
      lastMeowMs = state.clock;
      /* audio.js keys are capitalized: 'Cat' maps to assets/audio/cat.ogg
         (audio.js:99) and falls back internally; the documented sweep is the
         last resort (CF-09 step 2). No audio file is ever added here. */
      if (window.playAnimalSound) window.playAnimalSound('Cat');
      else if (window.sweep) window.sweep(600, 900, 0.18, 0, 'sine', 0.2);
    }
    if (state.clock - lastSpeakMs >= CF.SPEECH_GAP_MS) {
      lastSpeakMs = state.clock;
      var cat = catById(c.id);
      if (cat) {
        if (window.audioBuses && window.audioBuses.speakWithDuck) window.audioBuses.speakWithDuck(cat.name);
        else if (window.speech && window.speech.speak) window.speech.speak(cat.name);
      }
    }
    render();
  }

  /* ---- world + gentle guidance (CF-10; PS §4, TD §7) ---------------------
     setTime flips only state.time (CF-11 wires the ☀️/🌙 button to this same
     function); the idle hint is picture-only guidance — the tray bounces, never
     a word, and only while the forest is quiet (no treat out, no cat on stage),
     at most CF.HINT_REPEAT_MAX times until the next interaction. */
  function setTime(t) {
    if (t !== 'day' && t !== 'night') return false;
    state.time = t;
    render();
    return true;
  }

  /* CF-11 (PS §4/§5): the child's ☀️/🌙 switch. It flips through the very same
     setTime the hook exposes, plus the soft swish — down for night, up for day
     (PS §5 sound table). The state flip is all that matters; the cue is a
     guarded nicety. Cats already on stage are untouched: only NEW picks see
     the new time (pickArgs reads state.time when it is asked). */
  function onDayNightClick() {
    var next = state.time === 'day' ? 'night' : 'day';
    setTime(next);
    if (window.sweep) {
      window.sweep(next === 'night' ? 900 : 400, next === 'night' ? 400 : 900,
        0.25, 0, 'sine', 0.2);
    }
  }

  /* CF-12 (TP §3.10): the 🌧️ switch — mirrors setTime exactly (validate, flip
     state.weather, project through render). Weather never affects gameplay
     (card: out of scope), and rain is visual only: audio.js and adventure.js     expose no ambient/noise helper and the card forbids adding a shared one
     (step 3), so there is deliberately no cue here. */
  function setWeather(w) {
    if (w !== 'clear' && w !== 'rain') return false;
    state.weather = w;
    render();
    return true;
  }

  function onRainClick() {
    setWeather(state.weather === 'rain' ? 'clear' : 'rain');
  }

  /* previewPick (TD §8): the picks the engine would make for this plate right
     now, through the same pickArgs the spawn path uses. Side-effect free apart
     from the RNG stream itself (same contract as the pick hook). */
  function previewPick(plateIdx, n) {
    var plate = state.plates[plateIdx];
    var out = [];
    if (!plate) return out;
    var opts = pickArgs(plate);
    for (var i = 0; i < n; i++) out.push(pickCat(opts).id);
    return out;
  }

  /* Idle hint (TD §7): the clock accumulates since the last interaction; while
     the forest is quiet the tray bounces once per idle window — one early
     welcome hint at FIRST_HINT_MS if nothing was touched, then repeats at
     IDLE_HINT_MS up to HINT_REPEAT_MAX. A treat on any plate or a cat on stage
     suppresses the hint entirely (regression risk from the card), but the clock
     keeps counting so guidance returns right after a visit ends. The bounce
     reuses the CF-05 nudge channel, so it is clock-driven and self-clearing. */
  function updateIdle(dt) {
    state.idle.sinceMs += dt;
    if (state.cats.length > 0 || platesFilled() > 0) return;
    if (!state.idle.firstDone && state.idle.sinceMs >= CF.FIRST_HINT_MS) {
      state.idle.firstDone = true;
      state.idle.sinceMs = 0;
      state.nudge = { kind: 'hint', treat: null, until: state.clock + CF.HINT_MS };
    } else if (state.idle.hints < CF.HINT_REPEAT_MAX && state.idle.sinceMs >= CF.IDLE_HINT_MS) {
      state.idle.hints++;
      state.idle.sinceMs = 0;
      state.nudge = { kind: 'hint', treat: null, until: state.clock + CF.HINT_MS };
    }
  }

  /* Any real pointer interaction restarts the idle windows and the hint budget
     (TD §7 "any interaction resets hints to 0"). Synthetic .click() in tests
     dispatches no pointerdown, so step-driven hint scenarios stay exact. */
  function onAppPointerDown() {
    state.idle.sinceMs = 0;
    state.idle.hints = 0;
    state.idle.firstDone = true;
  }

  /* ---- DOM handles and the render projection ----------------------------
     render() is a pure projection of state to the DOM (TD §6): positions and
     classes come from state, never from CSS transitions, which is what keeps
     the hook's step() exact in tests. Layers are filled by later cards. */
  var els = null;
  var geom = null;    // { plates:[{x,y}] } in stage fractions, cached on resize (TD §7)
  var catEls = {};    // actor uid -> button; DOM refs stay out of the JSON-safe state

  function cacheEls() {
    els = {
      app: document.getElementById('app'),
      stage: document.getElementById('cf-stage'),
      cats: document.getElementById('cf-cats'),
      decor: document.getElementById('cf-decor'),
      gifts: document.getElementById('cf-gifts'),
      fx: document.getElementById('cf-fx'),
      rain: document.getElementById('cf-rain'),
      tray: document.getElementById('cf-tray'),
      dayNight: document.getElementById('cf-daynight'),
      rainBtn: document.getElementById('cf-rain-btn'),
      treats: [].slice.call(document.querySelectorAll('#cf-tray .cf-treat')),
      plates: [].slice.call(document.querySelectorAll('#cf-plates .cf-plate')),
      plateTreats: [].slice.call(document.querySelectorAll('#cf-plates .cf-plate-treat'))
    };
  }

  /* Plate centres in stage fractions, cached when the layout changes — never
     read inside tick() (TD §7/§10). render() projects them onto the actors. */
  function measure() {
    if (!els || !els.stage) return;
    var sr = els.stage.getBoundingClientRect();
    if (!sr.width || !sr.height) return;
    var plates = [];
    for (var i = 0; i < els.plates.length; i++) {
      var pr = els.plates[i].getBoundingClientRect();
      plates.push({
        x: (pr.left + pr.width / 2 - sr.left) / sr.width,
        y: (pr.top + pr.height / 2 - sr.top) / sr.height
      });
    }
    geom = { plates: plates };
  }

  function render() {
    if (!els || !els.app) return;
    els.app.setAttribute('data-time', state.time);
    els.app.setAttribute('data-weather', state.weather);
    /* CF-11: the toggle's pressed state mirrors the world; the glyph and the
       whole night palette hang off data-time in CSS. */
    if (els.dayNight) els.dayNight.setAttribute('aria-pressed', state.time === 'night' ? 'true' : 'false');
    /* CF-12: the rain switch mirrors state.weather the same way. */
    if (els.rainBtn) els.rainBtn.setAttribute('aria-pressed', state.weather === 'rain' ? 'true' : 'false');

    for (var i = 0; i < els.treats.length; i++) {
      var el = els.treats[i];
      var on = state.selectedTreat === el.getAttribute('data-treat');
      el.classList.toggle('cf-selected', on);
      el.setAttribute('aria-pressed', on ? 'true' : 'false');
      el.classList.toggle('cf-bounce', on && state.nudge.kind === 'treat' && state.clock < state.nudge.until);
    }

    for (var j = 0; j < els.plates.length; j++) {
      var plate = state.plates[j];
      if (plate && plate.treat) els.plateTreats[j].setAttribute('data-treat', plate.treat);
      else if (els.plateTreats[j]) els.plateTreats[j].removeAttribute('data-treat');
    }

    if (els.tray) {
      els.tray.classList.toggle('cf-hint', state.nudge.kind === 'hint' && state.clock < state.nudge.until);
    }

    renderDecor();
    renderCats();
    renderGifts();
    renderFlights();
    renderFx();
    renderRain();
  }

  /* CF-12: the drops layer is pure state projection — no RNG anywhere, so a
     rebuild is byte-identical every time (TD §6). At most CF.RAIN_DROPS <i>
     nodes exist and only while it rains: clear empties the layer (AC1). Each     drop gets its own x/phase/duration/park values so the sheet never falls     as one; the stylesheet parks them at --y under reduced motion, still
     visible but motionless (card step 2). */
  function renderRain() {
    if (!els || !els.rain) return;
    var want = state.weather === 'rain' ? CF.RAIN_DROPS : 0;
    if (els.rain.children.length === want) return;
    while (els.rain.firstChild) els.rain.removeChild(els.rain.firstChild);
    for (var i = 0; i < want; i++) {
      var d = document.createElement('i');
      d.style.setProperty('--x', ((i + 0.5) / want * 100).toFixed(2) + '%');
      d.style.setProperty('--d', (-(i * 0.061 % 1.3)).toFixed(3) + 's');
      d.style.setProperty('--dur', (1.05 + (i % 3) * 0.17).toFixed(2) + 's');
      d.style.setProperty('--y', (10 + (i * 137) % 76) + 'vh');
      els.rain.appendChild(d);
    }
  }

  /* ---- cat rendering (CF-07; TD §7/§10) ---------------------------------
     render() projects each actor's fraction of its phase to a position; CSS
     only scales the body for facing and bobs it while walking, so step() stays
     exact and positions never come from a transition. */
  function geomPlate(idx) {
    return (geom && geom.plates[idx]) || { x: 0.3 + idx * 0.2, y: 0.48 };
  }

  function catDir(c) {
    if (c.phase === 'leaving') return geomPlate(c.plate).x < 0.5 ? -1 : 1; // walk out the nearer edge
    return c.side === 'L' ? 1 : -1;
  }

  function catPos(c) {
    var plate = geomPlate(c.plate);
    var p = c.dur > 0 ? c.t / c.dur : 1;
    if (p < 0) p = 0; else if (p > 1) p = 1;
    var x;
    if (c.phase === 'entering') {
      var from = c.side === 'L' ? -EDGE_FRAC : 1 + EDGE_FRAC;
      x = from + (plate.x - from) * easeOut(p);
    } else if (c.phase === 'leaving') {
      var to = plate.x < 0.5 ? -EDGE_FRAC : 1 + EDGE_FRAC;
      x = plate.x + (to - plate.x) * easeIn(p);
    } else {
      x = plate.x;
    }
    return { x: x, y: plate.y - CAT_LIFT }; // lifted so the treat on the plate stays visible
  }

  function makeCatEl(c) {
    var cat = catById(c.id);
    var el = document.createElement('button');
    el.type = 'button';
    el.className = 'cf-cat';
    el.setAttribute('data-cat', c.id);
    el.setAttribute('aria-label', cat ? cat.name : '');
    var body = document.createElement('span');
    body.className = 'cf-cat-body';
    body.setAttribute('data-e', cat ? cat.emoji : '');
    el.appendChild(body);
    if (cat && cat.acc) {
      var acc = document.createElement('span');
      acc.className = 'cf-cat-acc';
      acc.setAttribute('data-e', cat.acc);
      el.appendChild(acc);
    }
    el.addEventListener('click', function () { cuddle(c); }); // CF-09: any visible phase is a safe cuddle
    return el;
  }

  function renderCats() {
    if (!els || !els.cats) return;
    if (!geom) measure();
    var alive = {}, i, uid;
    for (i = 0; i < state.cats.length; i++) alive[state.cats[i].uid] = true;
    for (uid in catEls) {
      if (!alive[uid]) { // gone: drop the node (no leaks, TD §10)
        if (catEls[uid].parentNode) catEls[uid].parentNode.removeChild(catEls[uid]);
        delete catEls[uid];
      }
    }
    for (i = 0; i < state.cats.length; i++) {
      var c = state.cats[i];
      var el = catEls[c.uid];
      if (!el) { el = makeCatEl(c); catEls[c.uid] = el; els.cats.appendChild(el); }
      var pos = catPos(c);
      el.style.left = (pos.x * 100) + '%';
      el.style.top = (pos.y * 100) + '%';
      el.style.setProperty('--dir', String(catDir(c)));
      /* Walk-bob: a per-frame transform value from the game clock (never a CSS
         animation loop), zero while sitting/eating and under reduced motion. */
      var moving = c.phase === 'entering' || c.phase === 'leaving';
      var bob = moving && !reduceMotion ? Math.sin((state.clock + c.uid * 90) / 110) * -BOB_PX : 0;
      el.style.setProperty('--bob', bob.toFixed(2) + 'px');
    }
  }

  /* ---- gifts, the growing forest and particles (CF-08; TD §5, §7, §10) --
     A finished visit leaves a gift on the freed plate; tapping it flies the
     gift to the next decor slot and it becomes scenery. Everything is
     logic-driven off the game clock (a one-shot decor fade-in is the only CSS
     animation) and capped so the forest never fills up and the child is never
     blocked. Gift/decor/fly coordinates are stage fractions, like the cats. */
  var DECOR_LIFT = 0.02; // a gift sits just above its plate's centre
  /* 14 hand-placed slots on the grass and between the trees — clear of the tray,
     the plate row and the toggles/back controls (PS §4, TP §3.2). */
  var DECOR_SLOTS = [
    { x: 0.10, y: 0.28 }, { x: 0.19, y: 0.17 }, { x: 0.28, y: 0.30 }, { x: 0.37, y: 0.19 },
    { x: 0.46, y: 0.31 }, { x: 0.55, y: 0.18 }, { x: 0.64, y: 0.30 }, { x: 0.73, y: 0.19 },
    { x: 0.82, y: 0.29 }, { x: 0.91, y: 0.20 }, { x: 0.15, y: 0.41 }, { x: 0.42, y: 0.42 },
    { x: 0.62, y: 0.41 }, { x: 0.88, y: 0.41 }
  ];

  /* Slots fill in a fixed shuffled order (TD §7) from a local PRNG seeded by a
     constant, so the spread is varied but never touches the gameplay RNG. */
  function buildDecorOrder() {
    var a = [], r = mulberry32(1337), i, j, t;
    for (i = 0; i < CF.DECOR_MAX; i++) a.push(i);
    for (j = a.length - 1; j > 0; j--) {
      i = Math.floor(r() * (j + 1)); t = a[j]; a[j] = a[i]; a[i] = t;
    }
    return a;
  }

  var decorOrder = buildDecorOrder();
  var giftEls = {};   // gift uid -> button
  var flightEls = {}; // flight uid -> element
  var decorEls = {};  // decor uid -> element
  var fxEls = {};     // particle uid -> element

  function spawnGift(plateIdx) {
    state.gifts.push({ uid: ++uidSeq, emoji: GIFTS[rngRange(0, GIFTS.length - 1)], plate: plateIdx });
    if (state.gifts.length > CF.GIFT_CAP) collectGift(state.gifts[0]); // cap: the oldest auto-collects
  }

  /* The exact function a tap on a gift runs; the auto-collect uses it too, so a
     capped gift leaves with the normal animation (CF-08 step 2). */
  function collectGift(gift) {
    var i = state.gifts.indexOf(gift);
    if (i === -1) return;
    state.gifts.splice(i, 1);
    var plate = geomPlate(gift.plate);
    var from = { x: plate.x, y: plate.y - DECOR_LIFT };
    var slot = decorOrder[state.decorCollected % CF.DECOR_MAX];
    state.decorCollected++;
    spendSparkle(from.x, from.y - 0.02);
    if (window.softPop && giftEls[gift.uid]) window.softPop(giftEls[gift.uid]);
    if (window.tone) {
      window.tone(880, 0.09, 0, 'sine', 0.18);
      window.tone(1174, 0.1, 0.07, 'sine', 0.12);
    }
    if (reduceMotion) {
      landDecor(gift.emoji, slot); // no flight: the gift fades, the decoration fades in
    } else {
      state.flights.push({
        uid: ++uidSeq, emoji: gift.emoji, from: from,
        to: { x: DECOR_SLOTS[slot].x, y: DECOR_SLOTS[slot].y },
        t: 0, dur: CF.GIFT_FLY_MS, slot: slot
      });
    }
  }

  function landDecor(emoji, slot) {
    state.decor.push({ uid: ++uidSeq, e: emoji, s: slot });
    if (state.decor.length > CF.DECOR_MAX) state.decor.shift(); // the forest never fills up
  }

  /* Particles anchor at fixed offsets around their point (stage fractions), so
     a tap never consumes the gameplay RNG stream and seeded runs stay exact.
     n = 1 keeps the exact anchor, so CF-08's gift sparkle lands where it did. */
  var FX_BURST = 3;   // hearts per cuddle / sparkles on a cat's first sit (CF-09)
  var FX_OFFSETS = [{ x: 0, y: 0 }, { x: -0.03, y: -0.05 }, { x: 0.03, y: -0.05 }];

  function spawnFx(x, y, emoji, n) {
    for (var i = 0; i < n; i++) {
      var o = FX_OFFSETS[i % FX_OFFSETS.length];
      state.fx.parts.push({ uid: ++uidSeq, x: x + o.x, y: y + o.y, e: emoji, t: 0, dur: 520 });
      while (state.fx.parts.length > CF.PARTICLE_CAP) state.fx.parts.shift();
    }
    state.fx.count = state.fx.parts.length;
  }

  function spendSparkle(x, y) { spawnFx(x, y, '✨', 1); }

  function updateFlights(dt) {
    for (var i = state.flights.length - 1; i >= 0; i--) {
      var f = state.flights[i];
      f.t += dt;
      if (f.t >= f.dur) { landDecor(f.emoji, f.slot); state.flights.splice(i, 1); }
    }
  }

  function updateFx(dt) {
    for (var i = state.fx.parts.length - 1; i >= 0; i--) {
      var p = state.fx.parts[i];
      p.t += dt;
      if (p.t >= p.dur) state.fx.parts.splice(i, 1);
    }
    state.fx.count = state.fx.parts.length;
  }

  function removeNode(el) {
    if (el && el.parentNode) el.parentNode.removeChild(el);
  }

  function makeGiftEl(g) {
    var el = document.createElement('button');
    el.type = 'button';
    el.className = 'cf-gift';
    el.setAttribute('aria-label', 'Поклон');
    el.setAttribute('data-e', g.emoji);
    el.addEventListener('click', function () { collectGift(g); });
    return el;
  }

  function makeFlyEl(emoji) {
    var el = document.createElement('span');
    el.className = 'cf-fly';
    el.setAttribute('aria-hidden', 'true');
    el.setAttribute('data-e', emoji);
    return el;
  }

  function makeDecorEl(emoji) {
    var el = document.createElement('span');
    el.className = 'cf-decor-item'; // one-shot fade-in (CSS); decorative only
    el.setAttribute('aria-hidden', 'true');
    el.setAttribute('data-e', emoji);
    return el;
  }

  function makeFxEl(emoji) {
    var el = document.createElement('span');
    el.className = 'cf-party';
    el.setAttribute('aria-hidden', 'true');
    el.setAttribute('data-e', emoji);
    return el;
  }

  function renderGifts() {
    if (!els || !els.gifts) return;
    if (!geom) measure();
    var alive = {}, i, uid;
    for (i = 0; i < state.gifts.length; i++) alive[state.gifts[i].uid] = true;
    for (uid in giftEls) if (!alive[uid]) { removeNode(giftEls[uid]); delete giftEls[uid]; }
    for (i = 0; i < state.gifts.length; i++) {
      var g = state.gifts[i], el = giftEls[g.uid];
      if (!el) { el = makeGiftEl(g); giftEls[g.uid] = el; els.gifts.appendChild(el); }
      var p = geomPlate(g.plate);
      el.style.left = (p.x * 100) + '%';
      el.style.top = ((p.y - DECOR_LIFT) * 100) + '%';
    }
  }

  function renderFlights() {
    if (!els || !els.fx) return;
    var alive = {}, i, uid;
    for (i = 0; i < state.flights.length; i++) alive[state.flights[i].uid] = true;
    for (uid in flightEls) if (!alive[uid]) { removeNode(flightEls[uid]); delete flightEls[uid]; }
    for (i = 0; i < state.flights.length; i++) {
      var f = state.flights[i], el = flightEls[f.uid];
      if (!el) { el = makeFlyEl(f.emoji); flightEls[f.uid] = el; els.fx.appendChild(el); }
      var q = f.dur > 0 ? f.t / f.dur : 1;
      if (q < 0) q = 0; else if (q > 1) q = 1;
      var e = easeOut(q);
      el.style.left = ((f.from.x + (f.to.x - f.from.x) * e) * 100) + '%';
      el.style.top = ((f.from.y + (f.to.y - f.from.y) * e) * 100) + '%';
      el.style.opacity = String(1 - q * 0.6);
    }
  }

  function renderDecor() {
    if (!els || !els.decor) return;
    var alive = {}, i, uid;
    for (i = 0; i < state.decor.length; i++) alive[state.decor[i].uid] = true;
    for (uid in decorEls) if (!alive[uid]) { removeNode(decorEls[uid]); delete decorEls[uid]; }
    for (i = 0; i < state.decor.length; i++) {
      var d = state.decor[i], el = decorEls[d.uid];
      if (!el) { el = makeDecorEl(d.e); decorEls[d.uid] = el; els.decor.appendChild(el); }
      var s = DECOR_SLOTS[d.s] || DECOR_SLOTS[0];
      el.style.left = (s.x * 100) + '%';
      el.style.top = (s.y * 100) + '%';
    }
  }

  function renderFx() {
    if (!els || !els.fx) return;
    var alive = {}, i, uid;
    for (i = 0; i < state.fx.parts.length; i++) alive[state.fx.parts[i].uid] = true;
    for (uid in fxEls) if (!alive[uid]) { removeNode(fxEls[uid]); delete fxEls[uid]; }
    for (i = 0; i < state.fx.parts.length; i++) {
      var p = state.fx.parts[i], el = fxEls[p.uid];
      if (!el) { el = makeFxEl(p.e); fxEls[p.uid] = el; els.fx.appendChild(el); }
      var q = p.dur > 0 ? p.t / p.dur : 1;
      el.style.left = (p.x * 100) + '%';
      el.style.top = (p.y * 100) + '%';
      el.style.opacity = String(1 - q);
    }
  }

  /* Tick order (TD §6): idle/hints → arrivals → cats → gifts → flights → fx →
     clock (last, so a tick's effects and its stamp agree). CF-07 fills arrivals
     and cats; CF-08 flights and fx; CF-10 the idle hint at the front. */
  function tick(dt) {
    updateIdle(dt);
    updateArrivals(dt);
    updateCats(dt);
    updateFlights(dt);
    updateFx(dt);
    state.clock += dt;
    if (state.nudge.kind && state.clock >= state.nudge.until) {
      state.nudge.kind = null;
      state.nudge.treat = null;
    }
  }

  /* Advance the logic by exactly `ms`, in fixed STEP_MS sub-steps, then render
     once. Used by the rAF loop (clamped dt) and by the test hook, so there is
     one code path for both. */
  function step(ms) {
    var left = ms;
    while (left > 0) {
      var sub = left < CF.STEP_MS ? left : CF.STEP_MS;
      tick(sub);
      left -= sub;
    }
    render();
  }

  var lastTs = 0;
  var acc = 0;

  function frame(ts) {
    requestAnimationFrame(frame);
    var dt = lastTs === 0 ? 0 : Math.min(ts - lastTs, CF.DT_CLAMP_MS);
    lastTs = ts;
    if (dt <= 0 || state.paused || document.hidden) return; // a hidden tab never advances
    /* rAF timestamps carry fractions of a millisecond; carry that remainder in
       `acc` and advance the clock in whole milliseconds so `state.clock` never
       accumulates float drift and the hook's deltas stay exact. */
    acc += dt;
    if (acc >= CF.STEP_MS) {
      var whole = Math.floor(acc);
      step(whole);
      acc -= whole;
    }
  }

  function pause(on) {
    state.paused = !!on;
  }

  /* ---- treats and plates (CF-05; PS §4) ---------------------------------
     There is no failure path: every tap either does the thing or shows a
     picture hint (a bounce), never a message, colour or sound that reads as
     "wrong". */
  function selectTreat(id) {
    state.selectedTreat = state.selectedTreat === id ? null : id;
    render();
  }

  function allPlatesBusy() {
    for (var i = 0; i < state.plates.length; i++) {
      if (state.plates[i].state === 'empty') return false;
    }
    return true;
  }

  function nudge(kind, treat) {
    state.nudge = { kind: kind, treat: treat || null, until: state.clock + CF.HINT_MS };
    render();
  }

  /* The exact function a tap on an empty plate runs; the hook calls this too
     (TD §8), so tests exercise the real path. */
  function place(treat, plateIdx) {
    var plate = state.plates[plateIdx];
    if (!plate || plate.state !== 'empty' || !treat) return false;
    plate.state = 'treat';
    plate.treat = treat;
    plate.arriveMs = rngRange(CF.ARRIVE_MIN, CF.ARRIVE_MAX);
    state.selectedTreat = null;
    render();
    if (window.tone) {
      window.tone(660, 0.12, 0, 'sine', 0.3);
      window.tone(880, 0.12, 0.08, 'sine', 0.25);
    }
    return true;
  }

  function onTreatClick(e) {
    selectTreat(e.currentTarget.getAttribute('data-treat'));
  }

  function onPlateClick(e) {
    var plate = state.plates[+e.currentTarget.getAttribute('data-plate')];
    if (!plate) return;
    /* Full forest: if a treat is in hand, it bounces gently; either way nothing
       else happens (PS §4). */
    if (allPlatesBusy()) {
      if (state.selectedTreat) nudge('treat', state.selectedTreat);
      return;
    }
    if (plate.state !== 'empty') return;           // occupied plate: nothing
    if (!state.selectedTreat) { nudge('hint'); return; } // empty-handed: picture hint
    place(state.selectedTreat, plate.idx);
  }

  /* ---- test hook (TD §8; the game itself never reads it) ---------------- */
  function snapshot() {
    return {
      clock: state.clock,
      time: state.time,
      weather: state.weather,
      selectedTreat: state.selectedTreat,
      paused: state.paused,
      plates: state.plates.map(function (p) {
        return { idx: p.idx, state: p.state, treat: p.treat, arriveMs: p.arriveMs, catId: p.catId };
      }),
      cats: state.cats.map(function (c) {
        return { uid: c.uid, id: c.id, plate: c.plate, side: c.side, phase: c.phase, t: c.t, dur: c.dur };
      }),
      gifts: state.gifts.map(function (g) {
        return { uid: g.uid, emoji: g.emoji, plate: g.plate };
      }),
      decor: state.decor.map(function (d) {
        return { e: d.e, s: d.s };
      }),
      met: state.met.slice(),
      idle: { sinceMs: state.idle.sinceMs, hints: state.idle.hints, firstDone: state.idle.firstDone },
      timers: {
        arrive: state.plates.filter(function (p) { return p.state === 'treat'; }).map(function (p) { return p.arriveMs; }),
        cats: state.cats.map(function (c) { return { id: c.id, t: c.t, dur: c.dur }; })
      },
      config: CF
    };
  }

  function startCatForest() {
    if (started) return; // main.js boots each page once; a second call would double every handler and the rAF loop
    started = true;

    cacheEls();
    measure();
    window.addEventListener('resize', measure);
    render();

    window.__catForest = {
      state: snapshot,
      seed: seed,
      rand: function (n) {
        var out = [];
        for (var i = 0; i < n; i++) out.push(rnd());
        return out;
      },
      pause: pause,
      step: step,
      place: place,
      forceCat: forceCat,
      /* `pick` is the documented hook (TD §8); the two trailing arguments let
         CF-06 tests exercise the occupied/last-visitor rules without a new
         method. The engine itself never reads the hook. */
      pick: function (treat, night, platesFilled, n, occupiedIds, lastVisitorId) {
        var out = [];
        for (var i = 0; i < n; i++) {
          out.push(pickCat({
            treat: treat, night: night, platesFilled: platesFilled,
            occupiedIds: occupiedIds || [], lastVisitorId: lastVisitorId || null
          }).id);
        }
        return out;
      },
      /* CF-10 (TD §8): the picks the engine would make for a plate right now,
         and the time switch CF-11's button will call. */
      previewPick: previewPick,
      setTime: setTime,
      setWeather: setWeather, // CF-12
      /* Read-only view of the DATA tables so the smoke can assert the roster
         (AC5). Inspection only — nothing here changes behaviour. */
      data: { treats: TREATS, cats: CATS, gifts: GIFTS }
    };

    els.treats.forEach(function (el) { el.addEventListener('click', onTreatClick); });
    els.plates.forEach(function (el) { el.addEventListener('click', onPlateClick); });
    els.dayNight.addEventListener('click', onDayNightClick); // CF-11
    els.rainBtn.addEventListener('click', onRainClick);      // CF-12
    els.app.addEventListener('pointerdown', onAppPointerDown); // CF-10: any real touch restarts the idle windows

    /* CF-10 step 4: one spoken welcome prompt at boot (PS §5, D9). Best-effort
       with the sorting idiom — a silent failure is fine and nothing depends
       on it (TTS pronunciation is a playtest question on the tablet). */
    if (window.audioBuses && window.audioBuses.speakWithDuck) window.audioBuses.speakWithDuck('Нахрани мачиће!');
    else if (window.speech && window.speech.speak) window.speech.speak('Нахрани мачиће!');

    lastTs = 0;
    // A tab that woke up must not jump the clock by the time it slept.
    document.addEventListener('visibilitychange', function () {
      lastTs = 0;
    });
    requestAnimationFrame(frame);
  }

  window.startCatForest = startCatForest;
})();
