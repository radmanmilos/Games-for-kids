/* ---------------- МАЧЈА ШУМА (Cat Forest) ----------------
   Feed visiting emoji cats; each visit leaves a gift that grows into the
   forest. Calm, wordless, no fail states. Plan package:
   resources/General_reviews/Cat_Forest/ (01_TECH_DESIGN.md is the contract).
   CF-01 shell · CF-03 static stage · CF-04 engine core (below): constants,
   clock, seedable RNG, state, render() and the __catForest test hook.
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
      met: [],
      lastVisitorId: null,
      visitsThisSession: 0,
      idle: { sinceMs: 0, hints: 0, firstDone: false },
      fx: { count: 0 },
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
    // CF-06 appends the pick-history reset here — seed() is documented to clear it.
  }

  seed((Math.random() * 0x100000000) >>> 0);

  function rngRange(min, max) {
    return min + Math.floor(rnd() * (max - min + 1));
  }

  /* ---- DOM handles and the render projection ----------------------------
     render() is a pure projection of state to the DOM (TD §6): positions and
     classes come from state, never from CSS transitions, which is what keeps
     the hook's step() exact in tests. Layers are filled by later cards. */
  var els = null;

  function cacheEls() {
    els = {
      app: document.getElementById('app'),
      tray: document.getElementById('cf-tray'),
      treats: [].slice.call(document.querySelectorAll('#cf-tray .cf-treat')),
      plates: [].slice.call(document.querySelectorAll('#cf-plates .cf-plate')),
      plateTreats: [].slice.call(document.querySelectorAll('#cf-plates .cf-plate-treat'))
    };
  }

  function render() {
    if (!els || !els.app) return;
    els.app.setAttribute('data-time', state.time);
    els.app.setAttribute('data-weather', state.weather);

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
  }

  /* Tick order (TD §6): idle/hints → arrivals → cats → gifts → flights → fx →
     clock. CF-04 owns only the clock (last, so a tick's effects and its stamp
     agree); CF-05..CF-09 fill the earlier stages. */
  function tick(dt) {
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
      place: place
    };

    els.treats.forEach(function (el) { el.addEventListener('click', onTreatClick); });
    els.plates.forEach(function (el) { el.addEventListener('click', onPlateClick); });

    lastTs = 0;
    // A tab that woke up must not jump the clock by the time it slept.
    document.addEventListener('visibilitychange', function () {
      lastTs = 0;
    });
    requestAnimationFrame(frame);
  }

  window.startCatForest = startCatForest;
})();
