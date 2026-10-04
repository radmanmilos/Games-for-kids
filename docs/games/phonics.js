/* ---------------- СЛОВА И ЗВУЦИ (Phonics) ----------------
   R23 pilot: sound  letter  familiar object. Autoplay sound on round start,
   show big Cyrillic letter, 2 choices. Correct item ACTUALLY starts with the
   letter in question. Tiny repeat button. Gentle miss; hint after 2 misses.
   Celebrate every 3 correct answers; no score pressure, no reading question. */
(function () {
  'use strict';

  /* Correct 10-letter set: letter -> sound to speak, correct object, distractor.
     Each object has Serbian name for aria-label (accessibility only). */
  var LETTERS = [
    { letter: 'М', sound: 'Ммм...', correct: { emoji: '🐭', name: 'Миш' }, distractor: { emoji: '🍎', name: 'Јабука' } },
    { letter: 'А', sound: 'Ааа...', correct: { emoji: '🍎', name: 'Јабука' }, distractor: { emoji: '🐭', name: 'Миш' } },
    { letter: 'С', sound: 'Ссс...', correct: { emoji: '🐍', name: 'Змија' }, distractor: { emoji: '🍌', name: 'Банана' } },
    { letter: 'Т', sound: 'Ттт...', correct: { emoji: '🚗', name: 'Ауто' }, distractor: { emoji: '🐸', name: 'Жаба' } },
    { letter: 'К', sound: 'Ккк...', correct: { emoji: '🐈', name: 'Мачка' }, distractor: { emoji: '🍓', name: 'Јагода' } },
    { letter: 'Р', sound: 'Ррр...', correct: { emoji: '🐇', name: 'Зец' }, distractor: { emoji: '🍊', name: 'Наранџа' } },
    { letter: 'Л', sound: 'Ллл...', correct: { emoji: '🦁', name: 'Лав' }, distractor: { emoji: '🥕', name: 'Шаргарепа' } },
    { letter: 'О', sound: 'Ооо...', correct: { emoji: '🐙', name: 'Октопод' }, distractor: { emoji: '🍐', name: 'Крушка' } },
    { letter: 'И', sound: 'Иии...', correct: { emoji: '🦉', name: 'Сова' }, distractor: { emoji: '🥔', name: 'Кромпир' } },
    { letter: 'П', sound: 'Ппп...', correct: { emoji: '🐷', name: 'Прасе' }, distractor: { emoji: '🍇', name: 'Грожђе' } }
  ];

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
