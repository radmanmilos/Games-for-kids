/* ---------------- РИТАМ (Rhythm imitation) ----------------
   R25 pilot: echo two drum hits, first close together, then with a pause.
   There is no clock, score, or limit on retries. */
(function () {
  'use strict';

  const PATTERNS = [
    { id: 'tap-tap', gap: 450 },
    { id: 'tap-pause-tap', gap: 950 },
  ];

  function startRhythm() {
    const drum = document.getElementById('drum-area');
    const repeat = document.getElementById('repeat-btn');
    const prompt = document.getElementById('rhythm-prompt');
    const feedback = document.getElementById('rhythm-feedback');
    if (!drum || !repeat || !prompt || !feedback) return;

    let round = 0;
    let phase = 'idle';
    let firstTapAt = null;
    let successes = 0;
    let playback = 0;
    let transitionTimer = null;

    function drumSound() {
      if (window.audioBuses && window.audioBuses.playTone) {
        window.audioBuses.playTone('sfx', 150, 0.18, 'triangle', 0.32);
      } else if (window.tone) {
        window.tone(150, 0.18, 0, 'triangle', 0.32);
      }
    }

    function pulse() {
      drum.classList.remove('drum-hit');
      void drum.offsetWidth;
      drum.classList.add('drum-hit');
      setTimeout(() => drum.classList.remove('drum-hit'), 220);
      drumSound();
    }

    function setPhase(next, message) {
      phase = next;
      prompt.textContent = message;
      drum.disabled = next !== 'repeat';
      repeat.disabled = next !== 'repeat' && next !== 'retry';
      drum.setAttribute('aria-disabled', String(drum.disabled));
      repeat.setAttribute('aria-disabled', String(repeat.disabled));
    }

    function playPattern() {
      if (phase === 'listen') return;
      const run = ++playback;
      firstTapAt = null;
      clearTimeout(transitionTimer);
      feedback.textContent = '';
      setPhase('listen', 'Слушај, па понови');
      pulse();
      setTimeout(() => {
        if (run !== playback) return;
        pulse();
        setTimeout(() => {
          if (run === playback) setPhase('repeat', 'Сад ти понови!');
        }, 180);
      }, PATTERNS[round].gap);
    }

    function onDrumTap() {
      if (phase !== 'repeat') return;
      pulse();
      if (firstTapAt === null) {
        firstTapAt = performance.now();
        return;
      }

      const gap = performance.now() - firstTapAt;
      const heardPause = gap >= 700;
      const expectedPause = round === 1;
      firstTapAt = null;
      if (heardPause === expectedPause) {
        successes++;
        feedback.textContent = 'Браво!';
        setPhase('success', 'Браво!');
        if (window.successChime) window.successChime();
        if (successes % 3 === 0 && window.celebrate) window.celebrate();
        transitionTimer = setTimeout(() => {
          round = (round + 1) % PATTERNS.length;
          playPattern();
        }, 850);
      } else {
        feedback.textContent = 'Хајде поново. Слушај још једном.';
        setPhase('retry', 'Слушај, па понови');
        if (window.gentleMiss) window.gentleMiss();
      }
    }

    drum.addEventListener('click', onDrumTap);
    repeat.addEventListener('click', playPattern);
    window.__rhythm = {
      state: () => ({
        round,
        pattern: PATTERNS[round].id,
        phase,
        successes,
        hasFirstTap: firstTapAt !== null,
      }),
      play: playPattern,
      setRound(next) {
        playback++;
        clearTimeout(transitionTimer);
        round = ((next % PATTERNS.length) + PATTERNS.length) % PATTERNS.length;
        phase = 'idle';
        playPattern();
      },
    };

    playPattern();
  }

  window.startRhythm = startRhythm;
})();
