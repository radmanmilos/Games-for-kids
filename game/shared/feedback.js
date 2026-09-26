/* Петрин свет — shared feedback vocabulary
   Unified success/mistake/celebration feedback for all games.
   Consumes window.tone/sweep (audio.js) and window.SERBIAN (data/serbian.js). */
(function () {
  'use strict';

  let lastPraise = -1;
  let lastRetry = -1;

  function softPop(el) {
    if (!el) return;
    el.classList.remove('ps-pop');
    void el.offsetWidth;
    el.classList.add('ps-pop');
    setTimeout(() => el.classList.remove('ps-pop'), 300);
  }

  function successChime() {
    if (window.tone) {
      window.tone(880, 0.08, 'sine', 0.15);
      setTimeout(() => window.tone(1174, 0.1, 'sine', 0.12), 70);
    }
  }

  function gentleMiss() {
    if (window.tone) window.tone(220, 0.12, 'sine', 0.1);
  }

  function celebrate() {
    if (window.celebrate) {
      window.celebrate();
      return;
    }
    if (window.tone) {
      const notes = [523, 659, 784, 1047];
      notes.forEach((f, i) => setTimeout(() => window.tone(f, 0.15, 'sine', 0.15), i * 90));
    }
  }

  function speakSr(type) {
    const phrases = window.SERBIAN && window.SERBIAN[type];
    if (!phrases || !phrases.length) return;
    let idx;
    if (type === 'praise') {
      do { idx = Math.floor(Math.random() * phrases.length); } while (idx === lastPraise && phrases.length > 1);
      lastPraise = idx;
    } else {
      do { idx = Math.floor(Math.random() * phrases.length); } while (idx === lastRetry && phrases.length > 1);
      lastRetry = idx;
    }
    if (window.speech && window.speech.speak) window.speech.speak(phrases[idx]);
  }

  function showHint(el) {
    if (!el) return;
    el.classList.remove('ps-hint');
    void el.offsetWidth;
    el.classList.add('ps-hint');
    setTimeout(() => el.classList.remove('ps-hint'), 1500);
  }

  window.softPop = softPop;
  window.successChime = successChime;
  window.gentleMiss = gentleMiss;
  window.celebrateFeedback = celebrate;
  window.speakSr = speakSr;
  window.showHint = showHint;
})();
