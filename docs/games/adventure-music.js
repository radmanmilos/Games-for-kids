/* Adventure music/audio — extracted from adventure.js for task 79.
   Owns the AudioContext and procedural music scheduler. */
(function () {
    'use strict';

    const AC = window.AudioContext || window.webkitAudioContext;
    let audioCtx = null;
    let noiseBuf = null;

    function init() {
        if (!audioCtx) audioCtx = new AC();
        return audioCtx;
    }

    function noteFreq(root, semi) {
        return root * Math.pow(2, semi / 12);
    }

    function makeNoiseBuffer(dur) {
        const b = audioCtx.createBuffer(1, Math.ceil(audioCtx.sampleRate * dur), audioCtx.sampleRate);
        const d = b.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
        return b;
    }

    function play(type) {
        if (!audioCtx) return;
        const now = audioCtx.currentTime;

        if (type === 'jump') {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(200, now);
            osc.frequency.exponentialRampToValueAtTime(500, now + 0.12);
            gain.gain.setValueAtTime(0.25, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
            osc.start(now);
            osc.stop(now + 0.12);
        } else if (type === 'coin') {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(987.77, now);
            osc.frequency.setValueAtTime(1318.51, now + 0.08);
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.22);
            osc.start(now);
            osc.stop(now + 0.22);
        } else if (type === 'win') {
            const notes = [523.25, 659.25, 783.99];
            notes.forEach((freq, idx) => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                const start = now + (idx * 0.07);
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, start);
                gain.gain.setValueAtTime(0, start);
                gain.gain.linearRampToValueAtTime(0.2, start + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.001, start + 0.12);
                osc.start(start);
                osc.stop(start + 0.12);
            });
        } else if (type === 'pop') {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.type = 'square';
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.exponentialRampToValueAtTime(420, now + 0.05);
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.05);
            osc.start(now);
            osc.stop(now + 0.07);
        } else if (type === 'bump') {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.type = 'square';
            osc.frequency.setValueAtTime(220, now);
            osc.frequency.exponentialRampToValueAtTime(110, now + 0.18);
            gain.gain.setValueAtTime(0.18, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.18);
            osc.start(now);
            osc.stop(now + 0.2);
        }
    }

    let musicTimer = null;
    let musicStep = 0;
    let musicStepTime = 0;
    let musicTheme = null;
    let musicMap = {};
    let musicOn = true;
    let pausedFn = () => false;

    function startTheme(themeKey, map, isPaused) {
        if (!map || !map[themeKey]) return;
        musicMap = map;
        pausedFn = isPaused;
        musicTheme = themeKey;
        if (!musicOn || !audioCtx) return;
        stopTheme();
        musicStep = 0;
        musicStepTime = audioCtx.currentTime + 0.08;
        musicTimer = setInterval(tick, 120);
    }

    function stopTheme() {
        if (musicTimer) { clearInterval(musicTimer); musicTimer = null; }
    }

    function setOn(on) {
        musicOn = on;
        const btn = document.getElementById('adv-music-btn');
        if (btn) {
            btn.textContent = on ? '🔊' : '🔇';
            btn.classList.toggle('off', !on);
        }
        if (on) startTheme(musicTheme, musicMap, pausedFn);
        else stopTheme();
    }

    function tick() {
        if (!audioCtx || !musicOn || pausedFn()) return;
        const cfg = musicMap[musicTheme];
        if (!cfg) return;
        const eighth = 60 / cfg.bpm / 2;
        const horizon = audioCtx.currentTime + 0.35;
        while (musicStepTime < horizon) {
            schedule(cfg, musicStep, musicStepTime, eighth);
            musicStep++;
            musicStepTime += eighth;
        }
    }

    function schedule(cfg, step, t, eighth) {
        const mel = cfg.seq[step % cfg.seq.length];
        if (mel !== null && mel !== undefined) {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.type = cfg.wave;
            osc.frequency.value = noteFreq(cfg.root, mel);
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(cfg.vol, t + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, t + eighth * 0.9);
            osc.start(t);
            osc.stop(t + eighth * 0.95);
        }
        if (step % 2 === 0) {
            const bassIdx = (step / 2) % cfg.bass.length;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.type = 'sine';
            osc.frequency.value = noteFreq(cfg.root, cfg.bass[bassIdx]);
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(cfg.vol * 0.7, t + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.001, t + eighth * 1.8);
            osc.start(t);
            osc.stop(t + eighth * 1.85);
        }
        const amb = cfg.ambient;
        if (amb && Math.random() < amb.rate) {
            ambient(amb.sound, amb.vol, t);
        }
    }

    function ambient(type, vol, t) {
        switch (type) {
            case 'bird': ambBird(vol, t); break;
            case 'cricket': ambCricket(vol, t); break;
            case 'wind': ambWind(vol, t, 1.6, 900); break;
            case 'rustle': ambRustle(vol, t); break;
            case 'rumble': ambWind(vol, t, 2.4, 200); break;
            case 'drip': ambDrip(vol, t); break;
            case 'bubble': ambBubble(vol, t); break;
            case 'flute': ambFlute(vol, t); break;
            case 'bell': ambBell(vol, t); break;
            case 'coo': ambCoo(vol, t); break;
            case 'desert': ambDesert(vol, t); break;
            case 'horn': ambHorn(vol, t); break;
            case 'waves': ambWaves(vol, t); break;
        }
    }

    function ambBird(vol, t) {
        for (let k = 0; k < 3; k++) {
            const t0 = t + k * 0.16;
            const base = 2200 + Math.random() * 1400;
            const o = audioCtx.createOscillator();
            const g = audioCtx.createGain();
            o.connect(g); g.connect(audioCtx.destination);
            o.type = 'sine';
            o.frequency.setValueAtTime(base, t0);
            o.frequency.exponentialRampToValueAtTime(base * 1.4, t0 + 0.05);
            o.frequency.exponentialRampToValueAtTime(base * 0.9, t0 + 0.09);
            g.gain.setValueAtTime(0, t0);
            g.gain.linearRampToValueAtTime(vol, t0 + 0.01);
            g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.1);
            o.start(t0); o.stop(t0 + 0.11);
        }
    }

    function ambCricket(vol, t) {
        for (let k = 0; k < 4; k++) {
            const t0 = t + k * 0.09;
            const o = audioCtx.createOscillator();
            const g = audioCtx.createGain();
            o.connect(g); g.connect(audioCtx.destination);
            o.type = 'sine';
            o.frequency.value = 4300;
            g.gain.setValueAtTime(0, t0);
            g.gain.linearRampToValueAtTime(vol * 0.6, t0 + 0.005);
            g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.05);
            o.start(t0); o.stop(t0 + 0.06);
        }
    }

    function ambWind(vol, t, dur, freq) {
        if (!noiseBuf) noiseBuf = makeNoiseBuffer(2);
        const src = audioCtx.createBufferSource();
        src.buffer = noiseBuf;
        src.loop = true;
        const f = audioCtx.createBiquadFilter();
        f.type = 'lowpass';
        f.frequency.value = freq || 500;
        const g = audioCtx.createGain();
        src.connect(f); f.connect(g); g.connect(audioCtx.destination);
        const d = dur || 1.5;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(vol, t + d * 0.35);
        g.gain.linearRampToValueAtTime(0, t + d);
        src.start(t); src.stop(t + d + 0.05);
    }

    function ambRustle(vol, t) {
        if (!noiseBuf) noiseBuf = makeNoiseBuffer(2);
        for (let k = 0; k < 3; k++) {
            const src = audioCtx.createBufferSource();
            src.buffer = noiseBuf;
            src.loop = true;
            const f = audioCtx.createBiquadFilter();
            f.type = 'highpass';
            f.frequency.value = 1800 + Math.random() * 1400;
            const g = audioCtx.createGain();
            src.connect(f); f.connect(g); g.connect(audioCtx.destination);
            const t0 = t + k * (0.1 + Math.random() * 0.15);
            const d = 0.12 + Math.random() * 0.1;
            g.gain.setValueAtTime(0, t0);
            g.gain.linearRampToValueAtTime(vol, t0 + 0.02);
            g.gain.exponentialRampToValueAtTime(0.001, t0 + d);
            src.start(t0); src.stop(t0 + d + 0.05);
        }
    }

    function ambDrip(vol, t) {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.connect(g); g.connect(audioCtx.destination);
        o.type = 'sine';
        o.frequency.setValueAtTime(900 + Math.random() * 300, t);
        o.frequency.exponentialRampToValueAtTime(180, t + 0.14);
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(vol, t + 0.01);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
        o.start(t); o.stop(t + 0.2);
    }

    function ambBubble(vol, t) {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.connect(g); g.connect(audioCtx.destination);
        o.type = 'sine';
        const f0 = 250 + Math.random() * 300;
        o.frequency.setValueAtTime(f0, t);
        o.frequency.exponentialRampToValueAtTime(f0 * 2.2, t + 0.12);
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(vol, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
        o.start(t); o.stop(t + 0.15);
    }

    function ambFlute(vol, t) {
        const notes = [0, 7, 12, 7];
        notes.forEach((semi, i) => {
            const t0 = t + i * 0.32;
            const o = audioCtx.createOscillator();
            const g = audioCtx.createGain();
            o.connect(g); g.connect(audioCtx.destination);
            o.type = 'sine';
            o.frequency.value = noteFreq(440, semi);
            const lfo = audioCtx.createOscillator();
            const lg = audioCtx.createGain();
            lfo.connect(lg);
            lg.connect(o.frequency);
            lg.gain.value = 4;
            lfo.frequency.value = 5.5;
            lfo.start(t0); lfo.stop(t0 + 0.5);
            g.gain.setValueAtTime(0, t0);
            g.gain.linearRampToValueAtTime(vol, t0 + 0.05);
            g.gain.linearRampToValueAtTime(vol * 0.7, t0 + 0.2);
            g.gain.linearRampToValueAtTime(0, t0 + 0.55);
            o.start(t0); o.stop(t0 + 0.6);
        });
    }

    function ambBell(vol, t) {
        [0, 7, 12].forEach((semi) => {
            const o = audioCtx.createOscillator();
            const g = audioCtx.createGain();
            o.connect(g); g.connect(audioCtx.destination);
            o.type = 'triangle';
            o.frequency.value = noteFreq(659.25, semi);
            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(vol, t + 0.01);
            g.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
            o.start(t); o.stop(t + 1.3);
        });
    }

    function ambCoo(vol, t) {
        [0, -2].forEach((semi, i) => {
            const t0 = t + i * 0.14;
            const o = audioCtx.createOscillator();
            const g = audioCtx.createGain();
            o.connect(g); g.connect(audioCtx.destination);
            o.type = 'sine';
            o.frequency.value = 440 * Math.pow(2, semi / 12) * 0.5;
            g.gain.setValueAtTime(0, t0);
            g.gain.linearRampToValueAtTime(vol, t0 + 0.03);
            g.gain.linearRampToValueAtTime(0, t0 + 0.18);
            o.start(t0); o.stop(t0 + 0.2);
        });
    }

    function ambDesert(vol, t) {
        ambWind(vol, t, 1.8, 420);
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.connect(g); g.connect(audioCtx.destination);
        o.type = 'sine';
        o.frequency.value = 110;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(vol * 0.7, t + 0.5);
        g.gain.linearRampToValueAtTime(0, t + 1.8);
        o.start(t); o.stop(t + 1.9);
    }

    function ambHorn(vol, t) {
        [0, 7].forEach((semi, i) => {
            const t0 = t + i * 0.09;
            const o = audioCtx.createOscillator();
            const g = audioCtx.createGain();
            o.connect(g); g.connect(audioCtx.destination);
            o.type = 'square';
            o.frequency.value = noteFreq(220, semi);
            g.gain.setValueAtTime(0, t0);
            g.gain.linearRampToValueAtTime(vol, t0 + 0.01);
            g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.16);
            o.start(t0); o.stop(t0 + 0.18);
        });
    }

    function ambWaves(vol, t) {
        if (!noiseBuf) noiseBuf = makeNoiseBuffer(2);
        const src = audioCtx.createBufferSource();
        src.buffer = noiseBuf;
        src.loop = true;
        const f = audioCtx.createBiquadFilter();
        f.type = 'lowpass';
        f.frequency.value = 700;
        const g = audioCtx.createGain();
        src.connect(f); f.connect(g); g.connect(audioCtx.destination);
        const d = 1.4;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(vol, t + d * 0.5);
        g.gain.linearRampToValueAtTime(0, t + d);
        src.start(t); src.stop(t + d + 0.05);
    }

    window.AdventureMusic = {
        init,
        play,
        startTheme,
        stopTheme,
        setOn,
        get musicOn() { return musicOn; },
        get audioCtx() { return audioCtx; },
        noteFreq,
        makeNoiseBuffer,
        tick,
        schedule,
        ambient,
        ambBird,
        ambCricket,
        ambWind,
        ambRustle,
        ambDrip,
        ambBubble,
        ambFlute,
        ambBell,
        ambCoo,
        ambDesert,
        ambHorn,
        ambWaves
    };
})();
