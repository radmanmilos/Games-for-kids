(function () {
    let audioContext;

    window.ctx = function () {
        if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
        if (audioContext.state === 'suspended') audioContext.resume();
        return audioContext;
    };

    window.tone = function (freq, dur, delay = 0, type = 'sine') {
        const audio = window.ctx();
        const oscillator = audio.createOscillator();
        const gain = audio.createGain();
        oscillator.type = type;
        oscillator.frequency.value = freq;
        oscillator.connect(gain);
        gain.connect(audio.destination);
        const start = audio.currentTime + delay;
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.25, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
        oscillator.start(start);
        oscillator.stop(start + dur + 0.05);
    };

    window.popSound = function () {
        window.tone(600, 0.15);
        window.tone(900, 0.12, 0.06);
    };

    window.flipSound = function () {
        window.sweep(400, 950, 0.09, 0, 'sine', 0.18);
    };

    window.successChime = function () {
        [523, 659, 784, 1047].forEach((frequency, index) => window.tone(frequency, 0.22, index * 0.11));
    };

    window.gentleMiss = function () {
        window.tone(220, 0.25, 0, 'sine');
    };

    window.sweep = function (from, to, duration, delay = 0, type = 'sine', volume = 0.3) {
        const audio = window.ctx();
        const oscillator = audio.createOscillator();
        const gain = audio.createGain();
        oscillator.type = type;
        const start = audio.currentTime + delay;
        oscillator.frequency.setValueAtTime(from, start);
        oscillator.frequency.exponentialRampToValueAtTime(to, start + duration);
        oscillator.connect(gain);
        gain.connect(audio.destination);
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(volume, start + Math.min(0.03, duration / 3));
        gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
        oscillator.start(start);
        oscillator.stop(start + duration + 0.05);
    };

    const assetRoot = /\/pages\//.test(location.pathname) ? '../' : '';
    const animalSoundFiles = {
        Dog: assetRoot + 'assets/audio/dog.ogg', Cat: assetRoot + 'assets/audio/cat.ogg', Cow: assetRoot + 'assets/audio/cow.ogg',
        Lion: assetRoot + 'assets/audio/lion.ogg', Elephant: assetRoot + 'assets/audio/elephant.ogg', Frog: assetRoot + 'assets/audio/frog.oga',
        Pig: assetRoot + 'assets/audio/pig-grunt.ogg', Duck: assetRoot + 'assets/audio/duck.ogg', Fox: assetRoot + 'assets/audio/fox.mp3',
        Sheep: assetRoot + 'assets/audio/sheep.ogg', Horse: assetRoot + 'assets/audio/horse.ogg',
        Chicken: assetRoot + 'assets/audio/chicken.ogg'
    };
    const animalAudio = Object.fromEntries(Object.entries(animalSoundFiles).map(([name, file]) => {
        const audio = new Audio(file);
        audio.preload = 'none';
        audio.volume = 0.85;
        audio._failed = false;
        audio.addEventListener('error', () => { audio._failed = true; }, { once: true });
        return [name, audio];
    }));

    // Synthesized fallbacks for Fox/Chicken — used ONLY when their real audio
    // file is missing, fails to load (onerror), or play() rejects (see the
    // fallback() closure in playAnimalSound). The real files (fox.mp3 /
    // chicken.ogg) load in practice, so these are near-unreachable but kept so
    // a failed asset degrades to a sound instead of silence. Keep in sync if
    // the real sounds change.
    function playFoxSynth() {
        // short synthesized 'yip' sequence for fox
        // two quick pitches sliding down
        window.tone(1200, 0.12);
        window.tone(900, 0.08, 0.06);
        // small sweep ending
        window.sweep(1400, 800, 0.18, 0.14, 'sine', 0.25);
    }

    function playChickenSynth() {
        // short cartoonish 'cluck' - two rapid descending toks
        window.tone(520, 0.07);
        window.tone(330, 0.06, 0.1);
        window.tone(470, 0.07, 0.2);
        window.tone(300, 0.07, 0.3);
    }

    window.playAnimalSound = function (name) {
        const audio = animalAudio[name];
        const fallback = () => {
            if (name === 'Fox') { playFoxSynth(); return; }
            if (name === 'Chicken') { playChickenSynth(); return; }
            window.popSound(); return;
        };
        // Fall back when the source is missing, failed to load (onerror flag), or play() rejects.
        if (!audio || audio.networkState === 3 || audio._failed) { fallback(); return; }
        clearTimeout(audio.stopTimer);
        try { audio.currentTime = 0; } catch (_) {}
        const playback = audio.play();
        if (playback) playback.catch(fallback);
        const maxDuration = { Dog: 1600, Cat: 1400, Cow: 1800, Lion: 1800, Elephant: 1600, Frog: 1600, Pig: 1000, Duck: 1800, Fox: 3000, Sheep: 1600, Horse: 2000, Chicken: 2500 }[name] || 1600;
        audio.stopTimer = setTimeout(() => { audio.pause(); audio.currentTime = 0; }, maxDuration);
    };
}());
