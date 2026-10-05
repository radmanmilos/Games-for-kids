/* ---------------- ВИШЕ ИЛИ МАЊЕ (More / Less / Same) ----------------
   R21 pilot: two visual groups, no written equations. The child taps the group
   that has more (or fewer) objects; later rounds ask whether the two groups are
   the same. Wrong answers are never punishing - a gentle miss, a shake, and
   after two mistakes a hint highlight on the right answer. */
(function () {
  'use strict';

  var OBJECTS = ['🐶', '🐱', '🐮', '🐷', '🐸', '🦊', '🦁', '🐘', '🐰', '🐥', '🐤',
    '🍎', '🍌', '🍓', '🍇', '🍊', '🍐', '⭐', '🌟', '🎈'];

  var round = 0;
  var mode = 'more';
  var countA = 0;
  var countB = 0;
  var correctKey = 'a';
  var locked = false;
  var misses = 0;
  var streak = 0;
  var started = false;

  var elPrompt, groupA, groupB, answers, feedback;
  var answerButtons = [];

  function rand(n) { return Math.floor(Math.random() * n); }
  function pickEmoji() { return OBJECTS[rand(OBJECTS.length)]; }

  function speak(text) {
    if (!text) return;
    if (window.audioBuses && window.audioBuses.speakWithDuck) window.audioBuses.speakWithDuck(text);
    else if (window.speech && window.speech.speak) window.speech.speak(text);
  }

  /* Rounds 0-2 compare "more", 3-5 compare "less", then "same" repeats. */
  function modeForRound(n) {
    if (n < 3) return 'more';
    if (n < 6) return 'less';
    return 'same';
  }

  function fillGroup(el, emoji, count) {
    el.innerHTML = '';
    el.dataset.count = String(count);
    el.dataset.correct = '0';
    for (var i = 0; i < count; i++) {
      var span = document.createElement('span');
      span.className = 'cmp-item';
      span.textContent = emoji;
      span.setAttribute('aria-hidden', 'true');
      el.appendChild(span);
    }
  }

  function clearMarks() {
    [groupA, groupB].forEach(function (g) {
      g.classList.remove('cmp-wrong', 'cmp-hint', 'cmp-correct');
      g.dataset.correct = '0';
      // Blur as well as unmark. `.cmp-group` is a <button>, and
      // shared/accessibility.css:10 paints a 4px #FFD23F (yellow) outline on
      // :focus. Removing the cmp-* classes does not remove that ring, so after a
      // tap the outline survived newRound and stayed wrapped around the refilled
      // group — a stale yellow rectangle pointing at the previous answer while
      // new objects were already on screen. Keyboard focus visibility is
      // untouched: this only drops focus at the moment the content is replaced,
      // where retaining focus on a stale target is wrong anyway.
      if (document.activeElement === g) g.blur();
    });
    answerButtons.forEach(function (b) {
      b.classList.remove('cmp-wrong', 'cmp-hint', 'cmp-correct');
      b.dataset.correct = '0';
      if (document.activeElement === b) b.blur();
    });
    if (feedback) feedback.textContent = '';
  }

  function correctEl() {
    if (mode === 'same') {
      return answerButtons.filter(function (b) { return b.dataset.answer === correctKey; })[0] || null;
    }
    return correctKey === 'a' ? groupA : groupB;
  }

  function newRound() {
    locked = false;
    misses = 0;
    clearMarks();
    mode = modeForRound(round);

    var emoji = pickEmoji();

    if (mode === 'same') {
      var base = 2 + rand(3);
      var equal = Math.random() < 0.5;
      countA = base;
      countB = equal ? base : base + 1;
      correctKey = (countA === countB) ? 'yes' : 'no';
    } else {
      var small = round < 3 ? (1 + rand(2)) : (2 + rand(3));
      var gap = round < 3 ? 1 : (1 + rand(2));
      var big = Math.min(6, small + gap);
      var aIsBig = Math.random() < 0.5;
      countA = aIsBig ? big : small;
      countB = aIsBig ? small : big;
      correctKey = mode === 'more'
        ? (countA > countB ? 'a' : 'b')
        : (countA < countB ? 'a' : 'b');
    }

    fillGroup(groupA, emoji, countA);
    fillGroup(groupB, emoji, countB);

    if (mode === 'same') {
      answers.hidden = false;
      elPrompt.textContent = 'Да ли имају исто?';
      var cb = correctEl();
      if (cb) cb.dataset.correct = '1';
    } else {
      answers.hidden = true;
      elPrompt.textContent = mode === 'more' ? 'Где има више?' : 'Где има мање?';
      (correctKey === 'a' ? groupA : groupB).dataset.correct = '1';
    }

    speak(elPrompt.textContent);
  }

  function onCorrect(el) {
    locked = true;
    el.classList.add('cmp-correct');
    if (window.successChime) window.successChime();
    if (window.speakSr) window.speakSr('praise');
    if (feedback) feedback.textContent = 'Браво!';
    streak++;
    if (streak >= 3) {
      streak = 0;
      if (window.celebrate) window.celebrate();
    }
    setTimeout(function () { round++; newRound(); }, 1200);
  }

  function onWrong(el) {
    if (window.gentleMiss) window.gentleMiss();
    if (feedback) feedback.textContent = 'Покушај поново';
    el.classList.add('cmp-wrong');
    setTimeout(function () { el.classList.remove('cmp-wrong'); }, 500);
    misses++;
    if (misses >= 2) {
      var target = correctEl();
      if (target) target.classList.add('cmp-hint');
      if (window.speakSr) window.speakSr('retry');
    }
  }

  function choose(key, el) {
    if (locked) return;
    if (key === correctKey) onCorrect(el);
    else onWrong(el);
  }

  function startCompare() {
    if (started) return;
    started = true;

    elPrompt = document.getElementById('compare-prompt');
    groupA = document.getElementById('cmp-group-a');
    groupB = document.getElementById('cmp-group-b');
    answers = document.getElementById('compare-answers');
    feedback = document.getElementById('compare-feedback');
    answerButtons = Array.prototype.slice.call(answers.querySelectorAll('.cmp-answer'));

    groupA.addEventListener('click', function () { if (mode !== 'same') choose('a', groupA); });
    groupB.addEventListener('click', function () { if (mode !== 'same') choose('b', groupB); });
    answerButtons.forEach(function (b) {
      b.addEventListener('click', function () { if (mode === 'same') choose(b.dataset.answer, b); });
    });

    round = 0;
    newRound();

    /* Dev/test hook: lets the harness reach each mode deterministically instead
       of clicking through nine rounds. Not read by the game itself. */
    window.__compare = {
      state: function () {
        return {
          round: round, mode: mode, a: countA, b: countB,
          equal: countA === countB, correct: correctKey, prompt: elPrompt.textContent
        };
      },
      goToRound: function (n) { round = n; newRound(); }
    };
  }

  window.startCompare = startCompare;
})();
