/* Петрин свет — shared reduced-motion detection
   Single source of truth for prefers-reduced-motion.
   Games should consume window.REDUCED_MOTION instead of re-detecting. */
(function () {
  'use strict';

  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  const REDUCED_MOTION = mq.matches;

  window.REDUCED_MOTION = REDUCED_MOTION;

  // Keep the flag live if the OS preference changes while the app is open.
  if (mq.addEventListener) {
    mq.addEventListener('change', (e) => { window.REDUCED_MOTION = e.matches; });
  } else if (mq.addListener) {
    mq.addListener((e) => { window.REDUCED_MOTION = e.matches; });
  }
})();
