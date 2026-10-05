/* ---------------- ПРОСТОР (Spatial concepts) ----------------
   R26 pilot: name where something is, in a scene instead of in a sentence.
   Five modes cycle: gore/dole, unutra/van, levo/desno, blizu/daleko, ispred/iza.
   There is no clock, no score, and no limit on retries. */
(function () {
  'use strict';

  /* `a` and `b` are the two words the child chooses between; the scene is drawn
     so that the correct one is visibly true. `draw` returns scene elements for
     the correct answer first and the mirror for the wrong one, so a mode can
     never describe a position it did not actually render. */
  const MODES = [
    {
      id: 'updown',
      prompt: 'Где је лопта?',
      a: 'Горе', b: 'Доле',
      build: first => [
        { cls: 'sp-shelf' },
        { emoji: '⚽', size: 26, x: 50, y: first ? 20 : 80 },
      ],
    },
    {
      id: 'insideoutside',
      prompt: 'Где је лопта?',
      a: 'Унутра', b: 'Ван',
      build: first => [
        { cls: 'sp-basket' },
        { emoji: '⚽', size: 22, x: 50, y: first ? 50 : 88 },
      ],
    },
    {
      id: 'leftright',
      prompt: 'Где је лопта?',
      a: 'Лево', b: 'Десно',
      build: first => [
        { emoji: '🐱', size: 24, x: 50, y: 50 },
        { emoji: '⚽', size: 22, x: first ? 20 : 80, y: 50 },
      ],
    },
    {
      id: 'nearfar',
      prompt: 'Где је лопта?',
      a: 'Близу', b: 'Далеко',
      build: first => [
        { emoji: '🐱', size: 24, x: 26, y: 50 },
        // "near" sits beside the cat, "far" is pushed to the opposite edge, so
        // the difference is distance the child can see rather than a word.
        { emoji: '⚽', size: 20, x: first ? 52 : 90, y: 50 },
      ],
    },
    {
      id: 'frontbehind',
      prompt: 'Где је мачка?',
      a: 'Испред', b: 'Иза',
      build: first => [
        { emoji: '🐭', size: 20, x: 50, y: 50 },
        // The mouse is the reference: large and in front when correct, small and
        // tucked behind the cat otherwise.
        { emoji: '🐱', size: first ? 34 : 18, x: 50, y: 50, behind: !first },
      ],
    },
  ];

  function startSpatial() {
    const scene = document.getElementById('spatial-scene');
    const prompt = document.getElementById('spatial-prompt');
    const feedback = document.getElementById('spatial-feedback');
    const buttons = {
      a: document.getElementById('spatial-choice-a'),
      b: document.getElementById('spatial-choice-b'),
    };
    if (!scene || !prompt || !feedback || !buttons.a || !buttons.b) return;

    let round = 0;
    let phase = 'ask';
    let correct = 'a';
    let misses = 0;
    let successes = 0;
    let transitionTimer = null;

    function drawScene(answerFirst) {
      const mode = MODES[round];
      // Rebuild from scratch: `build` returns absolute positions, so leftovers
      // from the previous mode would otherwise stack up behind the new scene.
      scene.textContent = '';
      mode.build(answerFirst).forEach(part => {
        if (part.cls) {
          const decor = document.createElement('div');
          decor.className = part.cls;
          scene.appendChild(decor);
          return;
        }
        const item = document.createElement('div');
        item.className = 'sp-item';
        item.textContent = part.emoji;
        item.style.fontSize = `min(${part.size}vmin, ${part.size * 3}px)`;
        item.style.left = part.x + '%';
        item.style.top = part.y + '%';
        if (part.behind) item.style.zIndex = '0';
        scene.appendChild(item);
      });
    }

    function setPhase(next) {
      phase = next;
      // Locking both buttons on success keeps a double-tap from scoring two
      // rounds, which is how one ➡️ tap once advanced three scenes.
      const locked = next !== 'ask';
      Object.keys(buttons).forEach(key => {
        buttons[key].disabled = locked;
        buttons[key].setAttribute('aria-disabled', String(locked));
      });
    }

    function startRound() {
      clearTimeout(transitionTimer);
      // Alternate which word is correct so a child cannot learn "always the
      // left button"; the scene follows the answer, never the reverse.
      correct = (round % 2 === 0) ? 'a' : 'b';
      const mode = MODES[round];
      misses = 0;
      prompt.textContent = mode.prompt;
      feedback.textContent = '';
      Object.keys(buttons).forEach(key => {
        buttons[key].textContent = mode[key];
        buttons[key].className = 'spatial-choice';
        buttons[key].removeAttribute('data-answer');
        buttons[key].removeAttribute('data-correct');
      });
      buttons[correct].dataset.answer = correct;
      buttons[correct].dataset.correct = '1';
      drawScene(correct === 'a');
      setPhase('ask');
    }

    function onAnswer(key, button) {
      if (phase !== 'ask') return;
      if (key === correct) {
        successes++;
        button.classList.add('spatial-correct');
        feedback.textContent = 'Браво!';
        setPhase('success');
        if (window.successChime) window.successChime();
        if (window.speakSr) window.speakSr('praise');
        if (successes % 3 === 0 && window.celebrate) window.celebrate();
        transitionTimer = setTimeout(() => {
          round = (round + 1) % MODES.length;
          startRound();
        }, 850);
        return;
      }

      misses++;
      // Shake only the pressed button: there is no failure screen and nothing
      // is taken away, so a wrong tap costs the child nothing but the round.
      button.classList.remove('spatial-wrong');
      void button.offsetWidth;
      button.classList.add('spatial-wrong');
      setTimeout(() => button.classList.remove('spatial-wrong'), 340);
      if (misses === 2) {
        if (window.showHint) window.showHint(buttons[correct]);
        buttons[correct].classList.add('spatial-hint');
        if (window.speakSr) window.speakSr('retry');
      }
    }

    buttons.a.addEventListener('click', () => onAnswer('a', buttons.a));
    buttons.b.addEventListener('click', () => onAnswer('b', buttons.b));

    window.__spatial = {
      state: () => ({
        round,
        mode: MODES[round].id,
        phase,
        correct,
        misses,
        successes,
      }),
      setRound(next) {
        clearTimeout(transitionTimer);
        round = ((next % MODES.length) + MODES.length) % MODES.length;
        startRound();
      },
    };

    startRound();
  }

  window.startSpatial = startSpatial;
})();