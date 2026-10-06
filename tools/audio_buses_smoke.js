const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { check, getFails } = require('./headless.js');

class FakeParam {
  constructor(value = 0) { this.value = value; }
  cancelScheduledValues() {}
  setValueAtTime(value) { this.value = value; }
  linearRampToValueAtTime(value) { this.value = value; }
  exponentialRampToValueAtTime(value) { this.value = value; }
}

class FakeNode {
  constructor(context) {
    this.context = context;
    this.connections = [];
    this.gain = new FakeParam();
  }
  connect(target) { this.connections.push(target); return target; }
}

class FakeContext {
  constructor() {
    this.currentTime = 0;
    this.state = 'running';
    this.destination = new FakeNode(this);
    this.gains = [];
    this.oscillators = [];
  }
  createGain() {
    const node = new FakeNode(this);
    this.gains.push(node);
    return node;
  }
  createOscillator() {
    const node = new FakeNode(this);
    node.frequency = new FakeParam();
    node.start = () => {};
    node.stop = () => {};
    this.oscillators.push(node);
    return node;
  }
}

class FakeAudio {
  static instances = [];
  constructor() {
    this.volume = 1;
    this.currentTime = 0;
    this.listeners = new Map();
    FakeAudio.instances.push(this);
  }
  addEventListener(type, listener) { this.listeners.set(type, listener); }
  removeEventListener(type) { this.listeners.delete(type); }
  pause() {}
  play() { return Promise.resolve(); }
}

function loadBus(window) {
  const source = fs.readFileSync(path.join(__dirname, '..', 'game', 'shared', 'audio-buses.js'), 'utf8');
  vm.runInNewContext(source, { window, setTimeout, clearTimeout, console });
  return window.audioBuses;
}

const context = new FakeContext();
let speechDone;
const window = {
  ctx: () => context,
  speech: { speak(_text, done) { speechDone = done; } },
};
const bus = loadBus(window);
const closeTo = (actual, expected) => Math.abs(actual - expected) < 1e-9;

bus.play('tap');
const tapOutput = context.oscillators[0].connections[0].connections[0];
const sfxBus = tapOutput;
const master = sfxBus.connections[0];
check('semantic SFX reaches the dedicated SFX bus and master output',
  sfxBus !== master && master.connections[0] === context.destination);

bus.playTone('music', 440, 0.2);
const musicBus = context.oscillators.at(-1).connections[0].connections[0];
check('music tone reaches a separate music bus', musicBus !== sfxBus && musicBus.connections[0] === master);

const semanticEvents = ['place', 'star-appear', 'star-explode', 'combo'];
const eventStart = context.oscillators.length;
semanticEvents.forEach(event => bus.play(event));
check('game-specific semantic events route through the SFX bus',
  semanticEvents.every(event => bus.events.includes(event)) &&
  context.oscillators.slice(eventStart).every(oscillator => oscillator.connections[0].connections[0] === sfxBus));

window.AudioContext = class { constructor() { return context; } };
const adventureSource = fs.readFileSync(path.join(__dirname, '..', 'game', 'games', 'adventure-music.js'), 'utf8');
vm.runInNewContext(adventureSource, { window, setInterval, clearInterval, Math });
window.AdventureMusic.init();
const adventureStart = context.oscillators.length;
window.AdventureMusic.schedule({ root: 440, seq: [0], bass: [-12], vol: 0.1, wave: 'sine' }, 0, 0, 0.2);
const adventureMusic = context.oscillators.slice(adventureStart);
const sfxStart = context.oscillators.length;
window.AdventureMusic.play('jump');
check('adventure music and effects route to their respective buses',
  adventureMusic.length === 2 &&
  adventureMusic.every(oscillator => oscillator.connections[0].connections[0] === musicBus) &&
  context.oscillators.slice(sfxStart).every(oscillator => oscillator.connections[0].connections[0] === sfxBus));

bus.setBus('master', 0.8, 0);
bus.setBus('music', 0.5, 0);
bus.setBus('sfx', 0.6, 0);
bus.duck(true);
check('duck lowers music and SFX while speech stays clear',
  closeTo(bus.getBusGain('music'), 0.12) && closeTo(bus.getBusGain('sfx'), 0.192) && closeTo(bus.getBusGain('speech'), 0.8));
bus.duck(false);

const media = { volume: 0.85 };
bus.registerMedia(media, 'sfx');
const beforeDuck = media.volume;
bus.duck(true);
check('registered media volume follows bus ducking',
  closeTo(beforeDuck, 0.408) && closeTo(media.volume, 0.1632));
bus.duck(false);

let completed = 0;
bus.speakWithDuck('Браво!', () => completed++);
const duckedDuringSpeech = closeTo(bus.getBusGain('music'), 0.12);
speechDone();
check('speech ducks music then restores levels and calls completion',
  duckedDuringSpeech && closeTo(bus.getBusGain('music'), 0.4) && completed === 1);

bus.speakWithDuck('Проба');
bus.speechCancelled();
check('speech cancellation immediately restores bus levels', closeTo(bus.getBusGain('music'), 0.4));

window.SERBIAN = {
  praise: ['Сјајно!', 'Браво!'],
  animals: Object.fromEntries(['Dog', 'Cat', 'Cow', 'Lion', 'Elephant', 'Frog', 'Pig', 'Duck', 'Fox', 'Sheep', 'Horse', 'Chicken'].map(name => [name, name])),
  alphabet: Array.from({ length: 30 }, (_, index) => ({ name: `letter${index}`, word: `word${index}` })),
  shapes: Array.from({ length: 10 }, (_, index) => `shape${index}`),
  numbers: Array.from({ length: 21 }, (_, index) => ({ name: `number${index}`, sentence: `sentence${index}` })),
  colors: Array.from({ length: 11 }, (_, index) => ({ name: `color${index}` })),
  time: Array.from({ length: 4 }, (_, index) => `time${index}`),
  seasons: Array.from({ length: 4 }, (_, index) => `season${index}`),
  weather: Array.from({ length: 4 }, (_, index) => `weather${index}`),
  reactions: { ouch: 'Јао!', ouchPlain: 'Јао!' },
};
const speechSource = fs.readFileSync(path.join(__dirname, '..', 'game', 'shared', 'speech.js'), 'utf8');
vm.runInNewContext(speechSource, { window, location: { pathname: '/pages/animals.html' }, Audio: FakeAudio });
bus.setBus('speech', 0.5, 0);
bus.speakWithDuck('Браво!');
const speechAudio = FakeAudio.instances.at(-1);
const speechRouted = speechAudio && closeTo(speechAudio.volume, 0.4);
window.speech.cancel();
check('shared speech assets use the speech bus and cancellation restores music',
  speechRouted && closeTo(bus.getBusGain('music'), 0.4));

const disabled = loadBus({
  ctx: () => null,
  speech: { speak(_text, done) { if (done) done(); } },
});
let disabledSpeechDone = false;
disabled.play('tap');
disabled.speakWithDuck('Тихо', () => { disabledSpeechDone = true; });
check('missing audio context does not block speech or gameplay', disabledSpeechDone);

if (getFails()) process.exitCode = 1;
