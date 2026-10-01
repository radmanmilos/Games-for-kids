/* Shared audio routing: speech stays clear while music and effects duck. */
(function () {
  'use strict';

  const levels = { master: 1, speech: 1, music: 1, sfx: 1 };
  const graphs = new Map();
  const mediaRecords = new Map();
  let ownedContext = null;
  let ducked = false;
  let duckTimer = null;
  let speechTimer = null;
  let speechRun = 0;
  let audioUnavailableReported = false;

  function reportAudioUnavailable() {
    if (audioUnavailableReported) return;
    audioUnavailableReported = true;
    console.warn('Shared audio is unavailable; gameplay continues without sound.');
  }

  function getContext() {
    if (typeof window.ctx === 'function') {
      try {
        return window.ctx();
      } catch {
        reportAudioUnavailable();
        return null;
      }
    }
    const AudioContextType = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextType) {
      reportAudioUnavailable();
      return null;
    }
    if (!ownedContext) {
      try {
        ownedContext = new AudioContextType();
      } catch (error) {
        reportAudioUnavailable();
        return null;
      }
    }
    if (ownedContext.state === 'suspended') {
      try {
        const resume = ownedContext.resume();
        if (resume && resume.catch) resume.catch(reportAudioUnavailable);
      } catch {
        reportAudioUnavailable();
      }
    }
    return ownedContext;
  }

  function effectiveGain(name) {
    if (name === 'master') return levels.master;
    const duckFactor = ducked && name === 'music' ? 0.3 : ducked && name === 'sfx' ? 0.4 : 1;
    return levels[name] * duckFactor;
  }

  function applyNodeGain(node, target, context, fadeMs) {
    const parameter = node.gain;
    const time = context.currentTime;
    parameter.cancelScheduledValues(time);
    parameter.setValueAtTime(parameter.value, time);
    if (fadeMs > 0) parameter.linearRampToValueAtTime(target, time + fadeMs / 1000);
    else parameter.setValueAtTime(target, time);
  }

  function graphFor(context) {
    let graph = graphs.get(context);
    if (graph) return graph;

    const master = context.createGain();
    master.gain.value = levels.master;
    master.connect(context.destination);
    const buses = {};
    for (const name of ['speech', 'music', 'sfx']) {
      const node = context.createGain();
      node.gain.value = effectiveGain(name);
      node.connect(master);
      buses[name] = node;
    }
    graph = { context, master, buses };
    graphs.set(context, graph);
    return graph;
  }

  function applyVolumes(fadeMs = 60) {
    for (const graph of graphs.values()) {
      applyNodeGain(graph.master, effectiveGain('master'), graph.context, fadeMs);
      for (const name of ['speech', 'music', 'sfx']) {
        applyNodeGain(graph.buses[name], effectiveGain(name), graph.context, fadeMs);
      }
    }
    for (const [element, record] of mediaRecords) {
      element.volume = Math.max(0, Math.min(1, record.volume * effectiveGain(record.bus) * effectiveGain('master')));
    }
  }

  function setBus(name, volume, fadeMs) {
    if (!Object.prototype.hasOwnProperty.call(levels, name)) throw new Error(`Unknown audio bus: ${name}`);
    levels[name] = Math.max(0, Math.min(1, volume));
    applyVolumes(fadeMs === undefined ? 60 : fadeMs);
  }

  function connect(source, name) {
    if (!['speech', 'music', 'sfx'].includes(name)) throw new Error(`Unknown audio bus: ${name}`);
    const context = source && source.context || getContext();
    if (!context) return false;
    source.connect(graphFor(context).buses[name]);
    return true;
  }

  function registerMedia(element, name) {
    if (!element || typeof element.volume !== 'number') throw new Error('Invalid audio element');
    if (!['speech', 'music', 'sfx'].includes(name)) throw new Error(`Unknown audio bus: ${name}`);
    const current = mediaRecords.get(element);
    if (current) {
      if (current.bus !== name) throw new Error('Audio element is already registered on another bus');
      return;
    }
    mediaRecords.set(element, { bus: name, volume: element.volume });
    applyVolumes(0);
  }

  function setMediaVolume(element, volume) {
    const record = mediaRecords.get(element);
    if (!record) throw new Error('Audio element is not registered on a bus');
    record.volume = Math.max(0, Math.min(1, volume));
    applyVolumes(0);
  }

  function busTone(name, frequency, duration, type = 'sine', volume = 0.15, delay = 0) {
    const context = getContext();
    if (!context) return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const start = context.currentTime + delay;
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    oscillator.connect(gain);
    connect(gain, name);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume), start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.05);
  }

  function busSweep(name, from, to, duration, type = 'sine', volume = 0.2, delay = 0) {
    const context = getContext();
    if (!context) return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const start = context.currentTime + delay;
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(from, start);
    oscillator.frequency.exponentialRampToValueAtTime(to, start + duration);
    oscillator.connect(gain);
    connect(gain, name);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume), start + Math.min(0.03, duration / 3));
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.05);
  }

  function playAnimalSound(element) {
    if (!element || typeof element.play !== 'function') throw new Error('Animal sound audio is unavailable');
    registerMedia(element, 'sfx');
    element.currentTime = 0;
    return element.play();
  }

  const events = {
    tap() {
      busTone('sfx', 600, 0.15, 'sine', 0.25);
      busTone('sfx', 900, 0.12, 'sine', 0.25, 0.06);
    },
    flip() { busSweep('sfx', 400, 950, 0.09, 'sine', 0.18); },
    correct() {
      busTone('sfx', 880, 0.08, 'sine', 0.15);
      busTone('sfx', 1174, 0.1, 'sine', 0.12, 0.07);
    },
    'gentle-miss'() { busTone('sfx', 220, 0.12, 'sine', 0.1); },
    hint() { busTone('sfx', 440, 0.1, 'sine', 0.08); },
    place() { busTone('sfx', 520, 0.06, 'triangle', 0.25); },
    goal() {
      [523.25, 659.25, 783.99].forEach((frequency, index) => {
        busTone('sfx', frequency, 0.12, 'sine', 0.2, index * 0.07);
      });
    },
    'star-appear'() {
      [784, 988, 1175, 1568].forEach((frequency, index) => {
        busTone('sfx', frequency, 0.15, 'sine', 0.25, index * 0.07);
      });
    },
    'star-explode'() {
      [300, 450, 650, 900, 1250].forEach((frequency, index) => {
        busTone('sfx', frequency, 0.25, 'triangle', 0.25, index * 0.05);
      });
    },
    combo() {
      [660, 880, 1100].forEach((frequency, index) => {
        busTone('sfx', frequency, 0.18, 'triangle', 0.25, index * 0.08);
      });
    },
    celebration() {
      [523, 659, 784, 1047].forEach((frequency, index) => {
        busTone('sfx', frequency, 0.15, 'sine', 0.15, index * 0.09);
      });
    },
    jump() { busSweep('sfx', 200, 500, 0.12, 'sine', 0.25); },
    coin() {
      busTone('sfx', 987.77, 0.22, 'triangle', 0.3);
      busTone('sfx', 1318.51, 0.14, 'triangle', 0.3, 0.08);
    },
    bump() { busSweep('sfx', 220, 110, 0.18, 'square', 0.18); },
    pop() { busSweep('sfx', 600, 420, 0.05, 'square', 0.12); },
    note(frequency) { busTone('music', frequency, 1, 'triangle', 0.25); },
    'animal-sound': playAnimalSound,
  };

  function play(eventName, ...args) {
    const event = events[eventName];
    if (!event) throw new Error(`Unknown audio event: ${eventName}`);
    return event(...args);
  }

  function duck(on, durationMs) {
    ducked = Boolean(on);
    clearTimeout(duckTimer);
    applyVolumes(100);
    if (ducked && durationMs > 0) duckTimer = setTimeout(() => duck(false), durationMs);
  }

  function speakWithDuck(text, onDone) {
    const run = ++speechRun;
    clearTimeout(speechTimer);
    duck(true);
    let finished = false;
    const finish = () => {
      if (finished || run !== speechRun) return;
      finished = true;
      clearTimeout(speechTimer);
      duck(false);
      if (onDone) onDone();
    };
    if (!window.speech || typeof window.speech.speak !== 'function') {
      finish();
      return;
    }
    speechTimer = setTimeout(finish, 15000);
    try {
      window.speech.speak(text, finish);
    } catch (error) {
      finish();
      throw error;
    }
  }

  function speechCancelled() {
    speechRun++;
    clearTimeout(speechTimer);
    duck(false);
  }

  window.audioBuses = {
    setBus,
    getBusGain(name) {
      if (!Object.prototype.hasOwnProperty.call(levels, name)) throw new Error(`Unknown audio bus: ${name}`);
      return effectiveGain(name) * (name === 'master' ? 1 : effectiveGain('master'));
    },
    connect,
    registerMedia,
    setMediaVolume,
    getAudioContext: getContext,
    playTone: busTone,
    playSweep: busSweep,
    play,
    duck,
    speakWithDuck,
    speechCancelled,
    events: Object.keys(events),
  };
})();
