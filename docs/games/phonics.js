/* ---------------- СЛОВА И ЗВУЦИ (Phonics) ----------------
   R23 pilot: sound  letter  familiar object. Autoplay sound on round start,
   show big Cyrillic letter, 2 choices. Correct item ACTUALLY starts with the
   letter in question. Tiny repeat button. Gentle miss; hint after 2 misses.
   Celebrate every 3 correct answers; no score pressure, no reading question. */
(function () {
  'use strict';

  /* DERIVED from SERBIAN.alphabet — the single source of truth that classroom
     and tracing already read.

     The R23 version hand-wrote its own 10-entry list here, and 6 of those
     pointed at an item that did NOT start with its own letter (А→Јабука,
     С→Змија, Т→Ауто, К→Мачка, Р→Зец, И→Сова) — the game taught a false
     letter/sound association, and PROJECT_TASKS task 189 recorded the set as
     "verified" when no check ever asserted it. A duplicated list cannot be
     validated against the alphabet it claims to teach; deriving from it makes
     every correct item the alphabet's own example word, which is correct-start
     by construction, and phonics can never drift from classroom/tracing again.

     `sound` is the entry's lowercase letter name, which shared/speech.js has
     already registered to a real recorded Serbian MP3 (letterFiles — 30 of them,
     and registerEach throws if the counts ever diverge). Pronunciation therefore
     comes from the project's existing audio assets instead of an invented
     "Ммм..." string that had no asset and fell through to speechSynthesis.

     The distractor rotates +7 through the alphabet, so it is always a DIFFERENT
     letter's word; since every word starts with its own distinct letter, a
     distractor can never accidentally start with the letter being asked about.
     Each object keeps its Serbian name for the aria-label (accessibility only). */
  var LETTERS = window.SERBIAN.alphabet.map(function (a, i, all) {
    var other = all[(i + 7) % all.length];
    return {
      letter: a.label,
      sound: a.name,
      correct: { emoji: a.emoji, name: a.word },
      distractor: { emoji: other.emoji, name: other.word }
    };
  });

  var round = 0;
  var letterData = LETTERS[0];
  var correctObj = null;
  var choices = [];
  var misses = 0;
  var correctStreak = 0;
  var locked = false;
  var started = false;

  var elLetter, elObjects, elFeedback, elRepeat;

  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function speak(text) {
    if (!text) return;
    if (window.audioBuses && window.audioBuses.speakWithDuck) window.audioBuses.speakWithDuck(text);
    else if (window.speech && window.speech.speak) window.speech.speak(text);
  }

  function autoplaySound() {
    if (letterData && letterData.sound) speak(letterData.sound);
  }

  function clearMarks() {
    var btns = elObjects.querySelectorAll('.phonics-choice');
    btns.forEach(function (b) {
      b.classList.remove('phonics-wrong', 'phonics-hint', 'phonics-correct');
    });
    if (elFeedback) elFeedback.textContent = '';
  }

  function findCorrectBtn() {
    var btns = elObjects.querySelectorAll('.phonics-choice');
    for (var i = 0; i < btns.length; i++) {
      if (btns[i].dataset.correct === '1') return btns[i];
    }
    return null;
  }

  function buildChoices() {
    elObjects.innerHTML = '';
    choices = [];
    var c = letterData.correct;
    var d = letterData.distractor;
    var items = [
      { key: 'c', obj: c, isCorrect: true },
      { key: 'd', obj: d, isCorrect: false }
    ];
    shuffle(items);
    items.forEach(function (it) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'phonics-choice';
      btn.dataset.key = it.key;
      btn.dataset.correct = it.isCorrect ? '1' : '0';
      btn.setAttribute('aria-label', it.obj.name);
      var span = document.createElement('span');
      span.className = 'phonics-emoji';
      span.textContent = it.obj.emoji;
      span.setAttribute('aria-hidden', 'true');
      btn.appendChild(span);
      btn.addEventListener('click', function () { onChoose(it.isCorrect, btn); });
      elObjects.appendChild(btn);
      choices.push(btn);
    });
    correctObj = c;
  }

  function newRound() {
    locked = false;
    misses = 0;
    clearMarks();
    letterData = LETTERS[round % LETTERS.length];
    if (elLetter) elLetter.textContent = letterData.letter;
    buildChoices();
    autoplaySound();
  }

  function onChoose(isCorrect, btn) {
    if (locked) return;
    if (isCorrect) {
      locked = true;
      btn.classList.add('phonics-correct');
      if (window.successChime) window.successChime();
      if (window.speakSr) window.speakSr('praise');
      if (elFeedback) elFeedback.textContent = 'Браво!';
      correctStreak++;
      if (correctStreak >= 3) {
        correctStreak = 0;
        if (window.celebrate) window.celebrate();
      }
      setTimeout(function () { round++; newRound(); }, 1000);
    } else {
      if (window.gentleMiss) window.gentleMiss();
      if (elFeedback) elFeedback.textContent = 'Покушај поново';
      btn.classList.add('phonics-wrong');
      setTimeout(function () { btn.classList.remove('phonics-wrong'); }, 500);
      misses++;
      if (misses >= 2) {
        var target = findCorrectBtn();
        if (target) {
          target.classList.add('phonics-hint');
          setTimeout(function () { target.classList.remove('phonics-hint'); }, 1500);
        }
        if (window.speakSr) window.speakSr('retry');
      }
    }
  }

  function startPhonics() {
    if (started) return;
    started = true;
    elLetter = document.getElementById('phonics-letter');
    elObjects = document.getElementById('phonics-objects');
    elFeedback = document.getElementById('phonics-feedback');
    elRepeat = document.getElementById('phonics-repeat');
    if (elRepeat) elRepeat.addEventListener('click', function (e) { e.preventDefault(); autoplaySound(); });
    round = 0;
    correctStreak = 0;
    newRound();

    window.__phonics = {
      state: function () {
        return {
          round: round,
          letter: letterData ? letterData.letter : '',
          sound: letterData ? letterData.sound : '',
          misses: misses,
          correctStreak: correctStreak,
          choices: Array.prototype.slice.call(elObjects.querySelectorAll('.phonics-choice')).map(function (b) {
            return { key: b.dataset.key, correct: b.dataset.correct === '1', emoji: b.textContent.trim() };
          })
        };
      },
      goToRound: function (n) { round = n % LETTERS.length; newRound(); },
      repeatSound: function () { autoplaySound(); }
    };
  }

  window.startPhonics = startPhonics;
})();
