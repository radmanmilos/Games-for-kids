/* little_adventure-audio.js — pure audio data + sequencer (no AudioContext). Player is thin. */
(function () {
  'use strict';
  const A = {};

  // SFX recipes: name -> {layers:[{type:'tone'|'noise', f0, f1, dur, gain, filter?}], pitchVar}
  A.SFX = {
    swing: { layers: [{ type: 'tone', f0: 440, f1: 660, dur: 0.12, gain: 0.18 }], pitchVar: 0.05 },
    hit: { layers: [{ type: 'tone', f0: 220, f1: 110, dur: 0.15, gain: 0.22 }, { type: 'noise', dur: 0.08, gain: 0.1 }], pitchVar: 0.04 },
    befriend: { layers: [{ type: 'tone', f0: 523, f1: 784, dur: 0.25, gain: 0.2 }, { type: 'tone', f0: 659, f1: 988, dur: 0.25, gain: 0.15 }], pitchVar: 0.03 },
    bump: { layers: [{ type: 'tone', f0: 180, f1: 90, dur: 0.18, gain: 0.2 }], pitchVar: 0.05 },
    shieldBlock: { layers: [{ type: 'tone', f0: 330, f1: 330, dur: 0.1, gain: 0.15 }, { type: 'noise', dur: 0.05, gain: 0.08 }], pitchVar: 0.02 },
    bushCut: { layers: [{ type: 'noise', dur: 0.12, gain: 0.15 }], pitchVar: 0.06 },
    chestOpen: { layers: [{ type: 'tone', f0: 440, f1: 880, dur: 0.2, gain: 0.2 }], pitchVar: 0.03 },
    itemSpawn: { layers: [{ type: 'tone', f0: 660, f1: 990, dur: 0.15, gain: 0.18 }], pitchVar: 0.04 },
    pickup: { layers: [{ type: 'tone', f0: 523, f1: 784, dur: 0.12, gain: 0.18 }], pitchVar: 0.03 },
    gateOpen: { layers: [{ type: 'tone', f0: 330, f1: 660, dur: 0.3, gain: 0.2 }], pitchVar: 0.02 },
    pedestalFill: { layers: [{ type: 'tone', f0: 440, f1: 660, dur: 0.2, gain: 0.18 }], pitchVar: 0.03 },
    pedestalWrong: { layers: [{ type: 'tone', f0: 220, f1: 180, dur: 0.2, gain: 0.18 }], pitchVar: 0.04 },
    bridgeUp: { layers: [{ type: 'tone', f0: 392, f1: 784, dur: 0.4, gain: 0.2 }], pitchVar: 0.02 },
    owlTalk: { layers: [{ type: 'tone', f0: 440, f1: 550, dur: 0.15, gain: 0.15 }], pitchVar: 0.05 },
    complete: { layers: [{ type: 'tone', f0: 523, f1: 1046, dur: 0.5, gain: 0.22 }, { type: 'tone', f0: 659, f1: 1318, dur: 0.5, gain: 0.18 }], pitchVar: 0.02 },
    grumpyRespawn: { layers: [{ type: 'tone', f0: 330, f1: 440, dur: 0.2, gain: 0.15 }], pitchVar: 0.04 },
    footstep: { layers: [{ type: 'noise', dur: 0.05, gain: 0.06 }], pitchVar: 0.08 }
  };

  A.AMBIENT = {
    A: { bed: 'wind', gain: 0.06 },
    B: { bed: 'forest', gain: 0.07 },
    C: { bed: 'shrine', gain: 0.05 }
  };

  A.SCORE = {
    A: { bpm: 96, scale: [0, 2, 4, 5, 7, 9, 11] },
    B: { bpm: 88, scale: [0, 2, 3, 5, 7, 8, 10] },
    C: { bpm: 80, scale: [0, 2, 4, 7, 9] }
  };

  // Deterministic sequencer: score -> [{time, freq, dur, bus}] for N bars with seed
  A.sequencer = (zone, bars, seed) => {
    const score = A.SCORE[zone] || A.SCORE.A;
    const rng = (function (s) { let a = s >>> 0; return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; })(seed || 7);
    const beatDur = 60 / score.bpm;
    const barDur = beatDur * 4;
    const total = barDur * (bars || 4);
    const events = [];
    const root = 261.63; // C4
    for (let t = 0; t < total; t += beatDur) {
      if (rng() < 0.6) {
        const deg = score.scale[Math.floor(rng() * score.scale.length)];
        const freq = root * Math.pow(2, deg / 12);
        events.push({ time: t, freq, dur: beatDur * 0.5, bus: 'music', gain: 0.08 });
      }
    }
    return events;
  };

  // Max gain check
  A.maxGain = () => {
    let m = 0;
    for (const k in A.SFX) {
      for (const l of A.SFX[k].layers) {
        if (l.gain > m) m = l.gain;
      }
    }
    return m;
  };

  window.little_adventureAudio = A;
})();
