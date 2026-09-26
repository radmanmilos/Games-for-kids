/* Петрин свет — shared audio buses and priorities
   4 buses: master, speech, music, sfx.
   Priority: speech > success > interaction sfx > music.
   Ducking: music/sfx volume drops while speech is active. */
(function () {
  'use strict';

  const buses = {
    master: { gain: 1, target: 1 },
    speech: { gain: 1, target: 1 },
    music: { gain: 1, target: 1 },
    sfx: { gain: 1, target: 1 },
  };

  let duckUntil = 0;
  let speechActive = false;

  function ctx() {
    if (window.ctx) return window.ctx();
    return null;
  }

  function now() {
    return performance.now();
  }

  // Set bus volume (0..1) with optional fade.
  function setBus(name, vol, fadeMs) {
    const bus = buses[name];
    if (!bus) return;
    bus.target = Math.max(0, Math.min(1, vol));
    const audioCtx = ctx();
    if (audioCtx && bus.gainNode) {
      const t = audioCtx.currentTime;
      bus.gainNode.gain.cancelScheduledValues(t);
      bus.gainNode.gain.linearRampToValueAtTime(bus.target, t + (fadeMs || 0.05));
    }
    bus.gain = bus.target;
  }

  // Duck music and sfx while speech is active.
  function duck(on, durationMs) {
    const audioCtx = ctx();
    if (on) {
      duckUntil = now() + (durationMs || 2000);
      speechActive = true;
      setBus('music', 0.3);
      setBus('sfx', 0.4);
    } else {
      duckUntil = 0;
      speechActive = false;
      setBus('music', 1);
      setBus('sfx', 1);
    }
    if (audioCtx) {
      // Auto-unduck after duration
      setTimeout(() => {
        if (now() >= duckUntil && speechActive) {
          speechActive = false;
          setBus('music', 1);
          setBus('sfx', 1);
        }
      }, (durationMs || 2000) + 100);
    }
  }

  // Play a tone on a specific bus.
  function busTone(bus, freq, duration, type, vol) {
    const audioCtx = ctx();
    if (!audioCtx || !window.tone) return;
    const effectiveVol = (vol || 0.15) * buses[bus].gain;
    window.tone(freq, duration, type || 'sine', effectiveVol);
  }

  // Standardized audio events.
  const events = {
    tap() { busTone('sfx', 600, 0.05, 'sine', 0.1); },
    placeCorrect() { busTone('sfx', 880, 0.08, 'sine', 0.12); busTone('sfx', 1174, 0.1, 'sine', 0.1); },
    placeWrong() { busTone('sfx', 220, 0.12, 'sine', 0.08); },
    success() { busTone('sfx', 880, 0.08, 'sine', 0.12); setTimeout(() => busTone('sfx', 1174, 0.1, 'sine', 0.1), 70); },
    celebrate() { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => busTone('sfx', f, 0.15, 'sine', 0.12), i * 90)); },
    goal() { busTone('sfx', 1047, 0.2, 'sine', 0.15); },
    hint() { busTone('sfx', 440, 0.1, 'sine', 0.08); },
    animalName() { busTone('speech', 0, 0, 'sine', 0); },
    animalSound() { busTone('sfx', 300, 0.15, 'triangle', 0.1); },
    number() { busTone('sfx', 700, 0.06, 'sine', 0.1); },
    shape() { busTone('sfx', 500, 0.06, 'sine', 0.1); },
    letter() { busTone('speech', 0, 0, 'sine', 0); },
  };

  // Play a named event on its bus.
  function play(eventName) {
    const fn = events[eventName];
    if (fn) fn();
  }

  // Speak with ducking.
  function speakWithDuck(text, durationMs) {
    duck(true, durationMs);
    if (window.speech && window.speech.speak) {
      window.speech.speak(text);
    }
    setTimeout(() => duck(false), (durationMs || 2000) + 100);
  }

  window.audioBuses = {
    setBus: setBus,
    duck: duck,
    busTone: busTone,
    play: play,
    speakWithDuck: speakWithDuck,
    events: Object.keys(events),
  };
})();
