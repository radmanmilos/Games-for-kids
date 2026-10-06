/* ---------------- ПРОСТОР (Spatial concepts) ----------------
   R26 pilot: name where something is, in a scene instead of in a sentence.
   Five concepts cycle (gore/dole, unutra/van, levo/desno, blizu/daleko,
   ispred/iza), and each concept has THREE scenes: after one pass of the five
   concepts the next pass shows different objects and prompts, so a session is
   15 rounds before anything repeats (task 208). There is no clock, no score,
   and no limit on retries. */
(function () {
  'use strict';

  /* `a` and `b` are the two words the child chooses between; each `build`
     returns scene elements for the correct answer first and the mirror for the
     wrong one, so a mode can never describe a position it did not actually
     render. Every concept keeps the ORIGINAL R26 scene as rounds[0], so a fresh
     boot looks and behaves exactly as before - the extra scenes only appear as
     the child keeps playing. */
  const MODES = [
    {
      id: 'updown',
      a: 'Горе', b: 'Доле',
      rounds: [
        { prompt: 'Где је лопта?', build: first => [
          { cls: 'sp-shelf' },
          { emoji: '⚽', size: 26, x: 50, y: first ? 20 : 80 },
        ] },
        /* The apple sits in the tree crown when up, on the grass when down. */
        { prompt: 'Где је јабука?', build: first => [
          { cls: 'sp-tree' },
          { emoji: '🍎', size: 18, x: 50, y: first ? 43 : 88 },
        ] },
        /* The duck stands on the top rail when up, digs under it when down. */
        { prompt: 'Где је птица?', build: first => [
          { cls: 'sp-fence' },
          { emoji: '🦆', size: 22, x: 50, y: first ? 60 : 90 },
        ] },
      ],
    },
    {
      id: 'insideoutside',
      a: 'Унутра', b: 'Ван',
      rounds: [
        { prompt: 'Где је лопта?', build: first => [
          { cls: 'sp-basket' },
          { emoji: '⚽', size: 22, x: 50, y: first ? 50 : 88 },
        ] },
        /* The bunny peeks out of the box when in, hops beside it when out. */
        { prompt: 'Где је зека?', build: first => [
          { cls: 'sp-box' },
          { emoji: '🐰', size: 22, x: first ? 50 : 85, y: first ? 50 : 88 },
        ] },
        /* The chick is tucked in its nest, or out on the grass beside it. */
        { prompt: 'Где је пиле?', build: first => [
          { cls: 'sp-nest' },
          { emoji: '🐤', size: 20, x: first ? 50 : 83, y: first ? 42 : 88 },
        ] },
      ],
    },
    {
      id: 'leftright',
      a: 'Лево', b: 'Десно',
      rounds: [
        { prompt: 'Где је лопта?', build: first => [
          { emoji: '🐱', size: 24, x: 50, y: 50 },
          { emoji: '⚽', size: 22, x: first ? 20 : 80, y: 50 },
        ] },
        { prompt: 'Где је кост?', build: first => [
          { emoji: '🐶', size: 24, x: 50, y: 50 },
          { emoji: '🦴', size: 19, x: first ? 20 : 80, y: 50 },
        ] },
        { prompt: 'Где је сир?', build: first => [
          { emoji: '🐭', size: 22, x: 50, y: 50 },
          { emoji: '🧀', size: 20, x: first ? 20 : 80, y: 50 },
        ] },
      ],
    },
    {
      id: 'nearfar',
      a: 'Близу', b: 'Далеко',
      rounds: [
        { prompt: 'Где је лопта?', build: first => [
          { emoji: '🐱', size: 24, x: 26, y: 50 },
          // "near" sits beside the cat, "far" is pushed to the opposite edge, so
          // the difference is distance the child can see rather than a word.
          { emoji: '⚽', size: 20, x: first ? 52 : 90, y: 50 },
        ] },
        { prompt: 'Где је паче?', build: first => [
          { emoji: '🦆', size: 24, x: 26, y: 50 },
          { emoji: '🐤', size: 18, x: first ? 54 : 90, y: 50 },
        ] },
        { prompt: 'Где је клупко?', build: first => [
          { emoji: '🐭', size: 24, x: 26, y: 50 },
          { emoji: '🧶', size: 18, x: first ? 54 : 90, y: 50 },
        ] },
      ],
    },
    {
      id: 'frontbehind',
      a: 'Испред', b: 'Иза',
      rounds: [
        { prompt: 'Где је мачка?', build: first => [
          { emoji: '🐭', size: 20, x: 50, y: 50 },
          // The mouse is the reference: large and in front when correct, small
          // and tucked behind the cat otherwise.
          { emoji: '🐱', size: first ? 34 : 18, x: 50, y: 50, behind: !first },
        ] },
        /* The bunny stands in front of the house, or hides behind it. */
        { prompt: 'Где је зека?', build: first => [
          { cls: 'sp-house' },
          { emoji: '🐰', size: first ? 23 : 15, x: 50, y: first ? 82 : 52, behind: !first },
        ] },
        /* The fox steps out in front of the tree, or hides behind the trunk. */
        { prompt: 'Где је лисица?', build: first => [
          { cls: 'sp-tree' },
          { emoji: '🦊', size: first ? 25 : 16, x: 50, y: first ? 76 : 44, behind: !first },
        ] },
      ],
    },
  ];

  const CONCEPTS = MODES.length;
  const VARIANT_COUNT = MODES[0].rounds.length;
  const TOTAL_ROUNDS = CONCEPTS * VARIANT_COUNT;

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
      // Rebuild from scratch: `build` returns absolute positions, so leftovers
      // from the previous round would otherwise stack up behind the new scene.
      scene.textContent = '';
      currentRound().build(answerFirst).forEach(part => {
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

    function currentRound() {
      const mode = MODES[round % CONCEPTS];
      return mode.rounds[Math.floor(round / CONCEPTS)];
    }

    function currentMode() {
      return MODES[round % CONCEPTS];
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
      const mode = currentMode();
      const roundSpec = currentRound();
      misses = 0;
      prompt.textContent = roundSpec.prompt;
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
          round = (round + 1) % TOTAL_ROUNDS;
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
        mode: currentMode().id,
        variant: Math.floor(round / CONCEPTS),
        total: TOTAL_ROUNDS,
        phase,
        correct,
        misses,
        successes,
      }),
      setRound(next) {
        clearTimeout(transitionTimer);
        round = ((next % TOTAL_ROUNDS) + TOTAL_ROUNDS) % TOTAL_ROUNDS;
        startRound();
      },
    };

    startRound();
  }

  window.startSpatial = startSpatial;
})();