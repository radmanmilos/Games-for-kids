/* ---------------- РИТАМ (Rhythm — mini drum set) ----------------
   R25 became a real drum set: four pads with distinct deep-to-high sounds
   (Велики бубањ → Високи звук), and two modes the child picks at the top:
     • 🎵 Понови мелодију — the app plays a short melody of pads and the child
       echoes it on the pads. Each success grows the melody by ONE pad
       (2 → 6, capped), so complexity increases slowly.
     • 🥁 Слободно свирање — free play: every pad just plays its sound.
   No clock, no score, no limit on retries. A wrong pad during echo gently
   replays the melody so the child always hears it again before trying again. */
(function () {
  'use strict';

  var PADS = [
    { id: 'pad-boom', emoji: '🥁', name: 'Велики бубањ', freq: 130 },
    { id: 'pad-tam', emoji: '🥁', name: 'Средњи бубањ', freq: 220 },
    { id: 'pad-tim', emoji: '🥁', name: 'Мали добош', freq: 340 },
    { id: 'pad-ting', emoji: '🥁', name: 'Високи бубањ', freq: 540 }
  ];
  var MAX_LEN = 6;      /* melody length never grows past this */
  var ECHO_STEP_MS = 430;

  function startRhythm() {
    var set = document.getElementById('rhythm-pads');
    var repeat = document.getElementById('repeat-btn');
    var freeBtn = document.getElementById('free-btn');
    var echoBtn = document.getElementById('echo-btn');
    var prompt = document.getElementById('rhythm-prompt');
    var feedback = document.getElementById('rhythm-feedback');
    if (!set || !prompt || !feedback || !repeat || !freeBtn || !echoBtn) return;

    var pads = Array.prototype.slice.call(set.querySelectorAll('.rhythm-pad'));
    var padEls = {};
    pads.forEach(function (b) { padEls[Number(b.dataset.idx)] = b; });

    var mode = 'echo';       /* 'echo' | 'free' */
    var phase = 'idle';      /* 'listen' | 'repeat' | 'success' | 'free' */
    var round = 0;
    var pattern = [];
    var step = 0;
    var successes = 0;
    var playback = 0;
    var transitionTimer = null;

    function padSound(idx) {
      var p = PADS[idx];
      if (window.audioBuses && window.audioBuses.playTone) window.audioBuses.playTone('sfx', p.freq, 0.2, 'triangle', 0.34);
      else if (window.tone) window.tone(p.freq, 0.2, 0, 'triangle', 0.34);
    }

    function pulse(idx, miss) {
      var el = padEls[idx];
      if (!el) return;
      el.classList.remove('hit', 'miss');
      void el.offsetWidth;
      el.classList.add(miss ? 'miss' : 'hit');
      clearTimeout(el._pulseTimer);
      el._pulseTimer = setTimeout(function () { el.classList.remove('hit', 'miss'); }, 240);
      padSound(idx);
    }

    function setEnabled(on) {
      pads.forEach(function (b) { b.disabled = !on; b.setAttribute('aria-disabled', String(!on)); });
    }

    function setPhase(next, message) {
      phase = next;
      prompt.textContent = message;
      /* V10 (spec §42.17): expose the phase on the drum set so the look can
         differ while listening, while it is the child's turn, and on success. */
      if (set) set.dataset.phase = next;
    }

    function patternLength() { return Math.min(2 + round, MAX_LEN); }

    /* A random melody of n distinct-adjacent pads: nobody has to tap the same
       pad twice in a row, which is confusing for a small child. */
    function nextPattern(n) {
      var arr = [], prev = -1;
      for (var i = 0; i < n; i++) {
        var p;
        do { p = Math.floor(Math.random() * PADS.length); } while (p === prev);
        arr.push(p); prev = p;
      }
      return arr;
    }

    function stop() {
      playback++;
      clearTimeout(transitionTimer);
      pads.forEach(function (b) { clearTimeout(b._pulseTimer); });
    }

    function playMelody() {
      stop();
      var run = ++playback;
      setPhase('listen', 'Слушај, па понови');
      feedback.textContent = '';
      setEnabled(false);
      step = 0;
      pattern = nextPattern(patternLength());
      var i = 0;
      (function playStep() {
        if (run !== playback) return;
        pulse(pattern[i]);
        i++;
        if (i === pattern.length) {
          transitionTimer = setTimeout(function () {
            if (run !== playback) return;
            setPhase('repeat', 'Сад ти понови!');
            setEnabled(true);
          }, ECHO_STEP_MS);
        } else {
          transitionTimer = setTimeout(playStep, ECHO_STEP_MS);
        }
      })();
    }

    function onPad(idx) {
      if (mode === 'free') { pulse(idx); return; }
      if (phase !== 'repeat') return;
      if (idx === pattern[step]) {
        pulse(idx);
        step++;
        if (window.successChime) window.successChime();
        if (step === pattern.length) {
          successes++;
          feedback.textContent = 'Браво!';
          setPhase('success', 'Браво!');
          if (successes % 3 === 0 && window.celebrate) window.celebrate();
          setEnabled(false);
          transitionTimer = setTimeout(function () { round++; playMelody(); }, 900);
        }
      } else {
        pulse(idx, true);
        if (window.gentleMiss) window.gentleMiss();
        feedback.textContent = 'Покушај поново. Слушај још једном.';
        setEnabled(false);
        transitionTimer = setTimeout(playMelody, 750);
      }
    }

    pads.forEach(function (b) {
      var idx = Number(b.dataset.idx);
      b.addEventListener('click', function () { onPad(idx); });
    });

    repeat.addEventListener('click', function () {
      if (mode === 'echo') playMelody();
    });

    function setMode(next) {
      if (next === mode) return;
      mode = next;
      freeBtn.classList.toggle('active', mode === 'free');
      echoBtn.classList.toggle('active', mode === 'echo');
      freeBtn.setAttribute('aria-pressed', String(mode === 'free'));
      echoBtn.setAttribute('aria-pressed', String(mode === 'echo'));
      repeat.disabled = mode !== 'echo';
      repeat.setAttribute('aria-disabled', String(mode !== 'echo'));
      stop();
      feedback.textContent = '';
      if (mode === 'free') {
        setPhase('free', 'Свирај слободно!');
        setEnabled(true);
      } else {
        setEnabled(false);
        playMelody();
      }
    }
    freeBtn.addEventListener('click', function () { setMode('free'); });
    echoBtn.addEventListener('click', function () { setMode('echo'); });

    window.__rhythm = {
      state: function () {
        return { mode: mode, phase: phase, round: round, length: pattern.length, pattern: pattern.slice(), step: step, successes: successes };
      },
      play: playMelody,
      setMode: setMode,
      setRound: function (n) {
        stop();
        round = Math.max(0, n);
        playMelody();
      }
    };

    playMelody();
  }

  window.startRhythm = startRhythm;
})();