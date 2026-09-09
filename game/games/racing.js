(function () {
    'use strict';

    const cfg = window.RACING_CONFIG;
    const canvas = document.getElementById('racing-canvas');
    const ctx = canvas.getContext('2d');

    let W = canvas.width, H = canvas.height;
    let HORIZON_Y = 0.24 * H, ROAD_BOTTOM_Y = 0.90 * H, ROAD_CENTER = W / 2, ROAD_MAX_W = 0;
    const ROAD_MIN_W = 14;
    let MAX_LATERAL = 0;

    let progress = 0;
    let speed = cfg.startSpeed;
    let maxSpeed = cfg.maxSpeed;
    let carX = W / 2;
    const carHalfW = cfg.carWidth / 2;
    let score = 0;
    let raceFinished = false;
    let currentWorld = cfg.worlds[0];
    let selectedCharacter = cfg.characters[0];
    let selectedCar = null;
    let musicOn = localStorage.getItem('racingMusic') !== 'off';
    let audioCtx = null;
    let musicTimer = null;
    let musicStep = 0;
    let musicStepTime = 0;
    let frames = [];
    let loadingFrames = 0;
    let gameReady = false;
    let keys = { left: false, right: false };
    let pickupCount = 0;
    let obstacles = [];
    let slowdown = null;
    let puffs = [];
    let shake = 0;
    let roadOffset = 0;
    let running = false;
    let lastTimestamp = 0;
    let finishRecorded = false;

    let countdownActive = false;
    let countdownLeft = 0;
    let countdownDoneAt = 0;
    let engineOsc = null;
    let engineOsc2 = null;
    let engineGain = null;
    const REDUCED_MOTION = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

    const SAVE_KEY = 'racingSave';
    const UNLOCK_WINS = cfg.unlockWins || [0, 2, 4, 7];

    function defaultSave() {
        return {
            char: cfg.characters[0].id,
            car: cfg.characters[0].cars[0].id,
            world: cfg.worlds[0].key,
            wins: 0
        };
    }

    function loadSave() {
        try {
            const raw = localStorage.getItem(SAVE_KEY);
            if (!raw) return defaultSave();
            const s = JSON.parse(raw);
            if (!s || typeof s.char !== 'string') return defaultSave();
            const ch = cfg.characters.find(c => c.id === s.char) || cfg.characters[0];
            const car = (ch.cars || []).find(c => c.id === s.car) || ch.cars[0];
            const world = cfg.worlds.find(w => w.key === s.world) || cfg.worlds[0];
            return { char: ch.id, car: car.id, world: world.key, wins: Math.max(0, s.wins | 0) };
        } catch (e) {
            return defaultSave();
        }
    }

    let save = loadSave();

    function persistSave() {
        try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) { /* private mode: ignore */ }
    }

    function applySave() {
        const ch = cfg.characters.find(c => c.id === save.char) || cfg.characters[0];
        selectedCharacter = ch;
        selectedCar = (ch.cars || []).find(c => c.id === save.car) || ch.cars[0] || null;
        currentWorld = cfg.worlds.find(w => w.key === save.world) || cfg.worlds[0];
    }

    function carIndex(ch, carId) {
        const cars = (ch && ch.cars) || [];
        for (let i = 0; i < cars.length; i++) if (cars[i].id === carId) return i;
        return -1;
    }

    function isUnlocked(ch, carId) {
        const i = carIndex(ch, carId);
        return i >= 0 && save.wins >= (UNLOCK_WINS[i] || 0);
    }

    function unlockedCars(ch) {
        const cars = (ch && ch.cars) || [];
        return cars.filter(c => isUnlocked(ch, c.id));
    }

    const SEG_LEN = 30;
    const STEER_SPEED = 300;

    const CURVE_CHUNK = 240;
    const MAX_CURVE_OFF = 0.45;
    let curvatureKnots = [];
    let offs = null;
    let offRaw = null;

    function mulberry32(a) {
        return function () {
            a |= 0; a = (a + 0x6D2B79F5) | 0;
            let t = Math.imul(a ^ (a >>> 15), 1 | a);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    function initCurve() {
        if (!offs) {
            offs = new Float64Array(VISIBLE_DIST + 2);
            offRaw = new Float64Array(VISIBLE_DIST + 2);
        }
        const rng = mulberry32((currentWorld.curveSeed || 2026));
        const n = Math.ceil((finishLineDist + VISIBLE_DIST) / CURVE_CHUNK) + 3;
        curvatureKnots = [];
        const strength = (typeof currentWorld.curveMax === 'number' ? currentWorld.curveMax : 0.5) * 0.0005;
        for (let i = 0; i < n; i++) {
            curvatureKnots.push((rng() * 2 - 1) * strength);
        }
        clampOffsets();
    }

    function curveAt(w) {
        const idx = w / CURVE_CHUNK;
        const i = Math.floor(idx);
        const f = idx - i;
        const a = curvatureKnots[i] !== undefined ? curvatureKnots[i] : 0;
        const b = curvatureKnots[i + 1] !== undefined ? curvatureKnots[i + 1] : a;
        const s = f * f * (3 - 2 * f);
        return a + (b - a) * s;
    }

    function clampOffsets() {
        const raw = offRaw;
        let heading = 0;
        raw[0] = 0;
        for (let d = 1; d <= VISIBLE_DIST; d++) {
            heading += curveAt(progress + d - 0.5);
            raw[d] = raw[d - 1] + heading;
        }
        const target = Math.min(MAX_CURVE_OFF, Math.max(0.1, currentWorld.curveMax || 0.5));
        let peak = 0;
        for (let d = 0; d <= VISIBLE_DIST; d++) peak = Math.max(peak, Math.abs(raw[d]));
        const scale = peak > 1e-9 ? target / peak : 0;
        for (let d = 0; d <= VISIBLE_DIST; d++) offs[d] = raw[d] * scale;
    }

    function roadCenterX(d) {
        const i = Math.min(VISIBLE_DIST, Math.max(0, Math.round(d)));
        return ROAD_CENTER + offs[i] * projectW(d);
    }

    function resizeCanvas() {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        W = canvas.width; H = canvas.height;
        HORIZON_Y = 0.24 * H;
        ROAD_BOTTOM_Y = 0.90 * H;
        ROAD_CENTER = W / 2;
        ROAD_MAX_W = Math.max(200, Math.min(640, W * 0.34));
        MAX_LATERAL = projectW(1) * 0.32;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    function fitToViewport() {
        const game = document.getElementById('racing-game');
        if (game) game.style.height = window.innerHeight + 'px';
    }
    window.addEventListener('resize', fitToViewport);
    window.addEventListener('orientationchange', fitToViewport);
    fitToViewport();

    function initAudio() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            startEngine();
            startMusic(currentWorld.music);
        }
    }

    function noteFreq(root, semi) {
        return root * Math.pow(2, semi / 12);
    }

    let noiseBuf = null;
    function makeNoiseBuffer(dur) {
        const b = audioCtx.createBuffer(1, Math.ceil(audioCtx.sampleRate * dur), audioCtx.sampleRate);
        const d = b.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
        return b;
    }

    function playAmbient(type) {
        if (!audioCtx) return;
        const vol = 0.035;
        const t = audioCtx.currentTime;
        if (type === 'bird') {
            for (let k = 0; k < 3; k++) {
                const t0 = t + k * 0.14;
                const base = 2200 + Math.random() * 800;
                const o = audioCtx.createOscillator(), g = audioCtx.createGain();
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
        } else if (type === 'waves') {
            if (!noiseBuf) noiseBuf = makeNoiseBuffer(2);
            const src = audioCtx.createBufferSource(), f = audioCtx.createBiquadFilter(), g = audioCtx.createGain();
            src.buffer = noiseBuf; f.type = 'lowpass';
            f.frequency.setValueAtTime(420, t);
            f.frequency.linearRampToValueAtTime(760, t + 1.6);
            f.frequency.linearRampToValueAtTime(420, t + 3.2);
            g.gain.setValueAtTime(0.0001, t);
            g.gain.linearRampToValueAtTime(vol * 1.4, t + 1.0);
            g.gain.linearRampToValueAtTime(0.0001, t + 3.2);
            src.connect(f); f.connect(g); g.connect(audioCtx.destination);
            src.start(t); src.stop(t + 3.3);
        } else if (type === 'wind') {
            if (!noiseBuf) noiseBuf = makeNoiseBuffer(2);
            const src = audioCtx.createBufferSource(), f = audioCtx.createBiquadFilter(), g = audioCtx.createGain();
            src.buffer = noiseBuf; src.loop = true; f.type = 'bandpass';
            const f0 = 420 + Math.random() * 220;
            f.frequency.setValueAtTime(f0, t);
            f.frequency.linearRampToValueAtTime(f0 + 90, t + 1.4);
            f.frequency.linearRampToValueAtTime(f0, t + 2.8);
            g.gain.setValueAtTime(0.0001, t);
            g.gain.linearRampToValueAtTime(vol * 0.9, t + 0.9);
            g.gain.linearRampToValueAtTime(0.0001, t + 2.8);
            src.connect(f); f.connect(g); g.connect(audioCtx.destination);
            src.start(t); src.stop(t + 2.9);
        } else if (type === 'chime') {
            for (let k = 0; k < 2; k++) {
                const t0 = t + k * 0.3;
                const base = 1240 + Math.random() * 360;
                const o = audioCtx.createOscillator(), g = audioCtx.createGain();
                o.connect(g); g.connect(audioCtx.destination);
                o.type = 'sine';
                o.frequency.value = base;
                g.gain.setValueAtTime(0, t0);
                g.gain.linearRampToValueAtTime(vol * 0.8, t0 + 0.02);
                g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.7);
                o.start(t0); o.stop(t0 + 0.75);
            }
        } else if (type === 'stars') {
            const t0 = t + Math.random() * 0.4;
            const base = 3200 + Math.random() * 700;
            const o = audioCtx.createOscillator(), g = audioCtx.createGain();
            o.connect(g); g.connect(audioCtx.destination);
            o.type = 'sine';
            o.frequency.value = base;
            g.gain.setValueAtTime(0, t0);
            g.gain.linearRampToValueAtTime(vol * 0.5, t0 + 0.01);
            g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.35);
            o.start(t0); o.stop(t0 + 0.4);
        } else if (type === 'owl') {
            const f0 = 320 + Math.random() * 60;
            for (let k = 0; k < 2; k++) {
                const t0 = t + k * (0.55 + Math.random() * 0.1);
                const o = audioCtx.createOscillator(), g = audioCtx.createGain();
                o.connect(g); g.connect(audioCtx.destination);
                o.type = 'sine';
                o.frequency.setValueAtTime(f0, t0);
                o.frequency.linearRampToValueAtTime(f0 * 0.96, t0 + 0.35);
                g.gain.setValueAtTime(0, t0);
                g.gain.linearRampToValueAtTime(vol * 1.1, t0 + 0.08);
                g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.4);
                o.start(t0); o.stop(t0 + 0.45);
            }
        }
    }

    function startMusic(themeKey) {
        if (!audioCtx) return;
        const m = cfg.music[themeKey];
        if (!m) return;
        if (musicTimer) clearInterval(musicTimer);
        musicStep = 0;
        musicStepTime = audioCtx.currentTime + 0.05;
        const eighth = 60 / m.bpm / 2;
        musicTimer = setInterval(() => {
            const horizon = audioCtx.currentTime + 0.35;
            while (musicStepTime < horizon) {
                const mel = m.seq[musicStep % m.seq.length];
                if (mel !== null && mel !== undefined) {
                    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
                    o.connect(g); g.connect(audioCtx.destination);
                    o.type = m.wave;
                    o.frequency.value = noteFreq(m.root, mel);
                    g.gain.setValueAtTime(0, musicStepTime);
                    g.gain.linearRampToValueAtTime(m.vol, musicStepTime + 0.02);
                    g.gain.exponentialRampToValueAtTime(0.001, musicStepTime + eighth * 0.9);
                    o.start(musicStepTime); o.stop(musicStepTime + eighth * 0.95);
                }
                if (musicStep % 2 === 0) {
                    const bassIdx = (musicStep / 2) % m.bass.length;
                    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
                    o.connect(g); g.connect(audioCtx.destination);
                    o.type = 'sine';
                    o.frequency.value = noteFreq(m.root, m.bass[bassIdx]);
                    g.gain.setValueAtTime(0, musicStepTime);
                    g.gain.linearRampToValueAtTime(m.vol * 0.7, musicStepTime + 0.03);
                    g.gain.exponentialRampToValueAtTime(0.001, musicStepTime + eighth * 1.8);
                    o.start(musicStepTime); o.stop(musicStepTime + eighth * 1.85);
                }
                if (m.ambient && Math.random() < m.ambient.rate) {
                    playAmbient(m.ambient.sound);
                }
                musicStep++;
                musicStepTime += eighth;
            }
        }, 120);
    }

    function stopMusic() {
        if (musicTimer) { clearInterval(musicTimer); musicTimer = null; }
    }

    function announce(text) {
        const el = document.getElementById('racing-announcer');
        if (el && el.textContent !== text) el.textContent = text;
    }

    function countTone(freq, dur, type) {
        if (!audioCtx) return;
        const t = audioCtx.currentTime;
        const o = audioCtx.createOscillator(), g = audioCtx.createGain();
        o.connect(g); g.connect(audioCtx.destination);
        o.type = type || 'triangle';
        o.frequency.value = freq;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.14, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, t + dur);
        o.start(t); o.stop(t + dur + 0.02);
    }

    function countdownDisplay(left) {
        if (left > 2700) return 3;
        if (left > 1800) return 2;
        if (left > 900) return 1;
        return 'go';
    }

    function announceCountdown(label) {
        if (label === 'go') {
            countTone(880, 0.3, 'square');
            if (window.speech && window.speech.speak) window.speech.speak('Крени!');
            announce('Крени!');
        } else {
            countTone(660, 0.12, 'triangle');
            const word = label === 3 ? 'три' : label === 2 ? 'два' : 'један';
            if (window.speech && window.speech.speak) window.speech.speak(word);
            announce(word);
        }
    }

    function beginCountdown() {
        countdownActive = true;
        countdownLeft = 3600;
        countdownDoneAt = 0;
        announceCountdown(3);
    }

    function stepCountdown(dt) {
        if (!countdownActive) return;
        const before = countdownDisplay(countdownLeft);
        countdownLeft -= dt;
        const after = countdownDisplay(countdownLeft);
        if (after !== before) announceCountdown(after);
        if (countdownLeft <= 0) {
            countdownActive = false;
            countdownDoneAt = performance.now();
        }
    }

    function skipCountdown() {
        countdownActive = false;
        countdownLeft = 0;
        countdownDoneAt = performance.now();
    }

    function startEngine() {
        if (!audioCtx || engineOsc) return;
        engineGain = audioCtx.createGain();
        engineGain.gain.value = 0;
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 900;
        engineGain.connect(filter);
        filter.connect(audioCtx.destination);
        engineOsc = audioCtx.createOscillator();
        engineOsc.type = 'sawtooth';
        engineOsc.frequency.value = 70;
        engineOsc.connect(engineGain);
        engineOsc2 = audioCtx.createOscillator();
        engineOsc2.type = 'sawtooth';
        engineOsc2.frequency.value = 70.6;
        engineOsc2.connect(engineGain);
        engineOsc.start();
        engineOsc2.start();
    }

    function updateEngine() {
        if (!audioCtx || !engineGain) return;
        const ratio = Math.max(0, Math.min(1, speed / cfg.maxSpeed));
        const base = 70 + ratio * 190;
        if (engineOsc) engineOsc.frequency.setTargetAtTime(base, audioCtx.currentTime, 0.08);
        if (engineOsc2) engineOsc2.frequency.setTargetAtTime(base * 1.01, audioCtx.currentTime, 0.08);
        const target = (raceFinished || countdownActive) ? 0 : 0.012 + ratio * 0.006;
        engineGain.gain.setTargetAtTime(target, audioCtx.currentTime, 0.08);
    }

    function stopEngine() {
        if (audioCtx && engineGain) engineGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.1);
    }

    function toggleMusic() {
        musicOn = !musicOn;
        localStorage.setItem('racingMusic', musicOn ? 'on' : 'off');
        const btn = document.getElementById('racing-music-btn');
        if (btn) btn.textContent = musicOn ? '🔊' : '🔇';
        if (musicOn) { initAudio(); startMusic(currentWorld.music); }
        else stopMusic();
    }

    const btnLeft = document.getElementById('racing-left');
    const btnRight = document.getElementById('racing-right');

    function bindControl(el, key) {
        if (!el) return;
        const start = (e) => {
            e.preventDefault();
            initAudio();
            keys[key] = true;
        };
        const end = (e) => {
            e.preventDefault();
            keys[key] = false;
        };
        el.addEventListener('touchstart', start, { passive: false });
        el.addEventListener('touchend', end, { passive: false });
        el.addEventListener('touchcancel', end, { passive: false });
        el.addEventListener('mousedown', start);
        el.addEventListener('mouseup', end);
        el.addEventListener('mouseleave', end);
    }
    bindControl(btnLeft, 'left');
    bindControl(btnRight, 'right');

    window.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = true;
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = true;
    });
    window.addEventListener('keyup', (e) => {
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = false;
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = false;
    });

    function loadFrames() {
        loadingFrames = 0;
        frames = [];
        cfg.characters.forEach(ch => {
            const idle = new Image();
            idle.src = '../assets/images/' + ch.folder + '01_idle_right.png';
            idle.onload = () => { frames.push({ character: ch, image: idle }); loadingFrames--; };
            idle.onerror = () => { loadingFrames--; };
            loadingFrames++;
        });
    }

    function drawCar(carX, carY, character) {
        const cw = cfg.carWidth;
        const ch = cfg.carHeight;
        const car = selectedCar || ((character.cars && character.cars[0]) || {});
        const body = car.body || '#e52521';
        const accent = '#fff8ed';
        const wheel = '#0d0d0d';
        const wheelR = 14;

        ctx.fillStyle = accent;
        ctx.beginPath();
        ctx.ellipse(carX, carY + ch * 0.45, cw * 0.42, ch * 0.18, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = body;
        ctx.beginPath();
        ctx.roundRect(carX - cw * 0.42, carY, cw * 0.84, ch * 0.55, 22);
        ctx.fill();

        ctx.fillStyle = body;
        ctx.beginPath();
        ctx.ellipse(carX, carY + ch * 0.22, cw * 0.28, ch * 0.18, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.globalAlpha = 0.25;
        ctx.fillRect(carX - cw * 0.28, carY + ch * 0.12, cw * 0.12, ch * 0.06);
        ctx.fillRect(carX + cw * 0.16, carY + ch * 0.12, cw * 0.16, ch * 0.06);
        ctx.globalAlpha = 1;

        ctx.fillStyle = '#fff8ed';
        ctx.beginPath();
        ctx.ellipse(carX - cw * 0.22, carY + ch * 0.52, cw * 0.08, ch * 0.04, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(carX + cw * 0.22, carY + ch * 0.52, cw * 0.08, ch * 0.04, 0, 0, Math.PI * 2);
        ctx.fill();

        const frame = frames.find(f => f.character.id === selectedCharacter);
        if (frame && frame.image.complete) {
            const spriteW = cw * 0.32;
            const spriteH = spriteW * (frame.character.srcH / frame.character.srcW);
            ctx.drawImage(frame.image, carX - spriteW / 2, carY - spriteH + ch * 0.15, spriteW, spriteH);
        }

        if (car.emoji) {
            ctx.font = (ch * 0.5) + 'px "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(car.emoji, carX, carY + ch * 0.28);
            ctx.textAlign = 'left';
            ctx.textBaseline = 'alphabetic';
        }

        ctx.fillStyle = wheel;
        const wh = wheelR * 1.6;
        ctx.beginPath();
        ctx.ellipse(carX - cw * 0.24, carY + ch * 0.62, wheelR, wh, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(carX + cw * 0.24, carY + ch * 0.62, wheelR, wh, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#0d0d0d';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(carX - cw * 0.24 - wheelR, carY + ch * 0.62);
        ctx.lineTo(carX - cw * 0.24 + wheelR, carY + ch * 0.62);
        ctx.moveTo(carX - cw * 0.24, carY + ch * 0.62 - wh);
        ctx.lineTo(carX - cw * 0.24, carY + ch * 0.62 + wh);
        ctx.beginPath();
        ctx.moveTo(carX + cw * 0.24 - wheelR, carY + ch * 0.62);
        ctx.lineTo(carX + cw * 0.24 + wheelR, carY + ch * 0.62);
        ctx.moveTo(carX + cw * 0.24, carY + ch * 0.62 - wh);
        ctx.lineTo(carX + cw * 0.24, carY + ch * 0.62 + wh);
        ctx.stroke();
    }

    function projectW(d) {
        if (d <= 0) return ROAD_MAX_W;
        return Math.max(ROAD_MIN_W, ROAD_MAX_W * 300 / (300 + d));
    }

    // Visible range of the road ahead
    const VISIBLE_DIST = 400;
    const NUM_SEGMENTS = 30;
    const SEG_DIST = VISIBLE_DIST / NUM_SEGMENTS;

    function drawRoad() {
        const w = canvas.width;
        ctx.fillStyle = currentWorld.horizonColor;
        ctx.fillRect(0, 0, w, HORIZON_Y);

        const grad = ctx.createLinearGradient(0, HORIZON_Y, 0, H);
        grad.addColorStop(0, currentWorld.bgTop);
        grad.addColorStop(1, currentWorld.bgBottom);
        ctx.fillStyle = grad;
        ctx.fillRect(0, HORIZON_Y, w, H - HORIZON_Y);

        clampOffsets();

        for (let i = NUM_SEGMENTS - 1; i >= 0; i--) {
            const dFar = (i + 1) * SEG_DIST;
            const dNear = i * SEG_DIST;
            const yFar = ROAD_BOTTOM_Y - ((ROAD_BOTTOM_Y - HORIZON_Y) * dFar / VISIBLE_DIST);
            const yNear = ROAD_BOTTOM_Y - ((ROAD_BOTTOM_Y - HORIZON_Y) * dNear / VISIBLE_DIST);

            const wFar = projectW(dFar);
            const wNear = projectW(dNear);

            const yClampedF = Math.max(HORIZON_Y, Math.min(ROAD_BOTTOM_Y, yFar));
            const yClampedN = Math.max(HORIZON_Y, Math.min(ROAD_BOTTOM_Y, yNear));

            const xCenterFar = roadCenterX(dFar);
            const xCenterNear = roadCenterX(dNear);

            ctx.fillStyle = currentWorld.roadColor;
            ctx.beginPath();
            ctx.moveTo(xCenterFar - wFar / 2, yClampedF);
            ctx.lineTo(xCenterFar + wFar / 2, yClampedF);
            ctx.lineTo(xCenterNear + wNear / 2, yClampedN);
            ctx.lineTo(xCenterNear - wNear / 2, yClampedN);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = currentWorld.grassColor;
            ctx.beginPath();
            ctx.moveTo(0, yClampedF);
            ctx.lineTo(xCenterFar - wFar / 2, yClampedF);
            ctx.lineTo(xCenterNear - wNear / 2, yClampedN);
            ctx.lineTo(0, yClampedN);
            ctx.closePath();
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(w, yClampedF);
            ctx.lineTo(xCenterFar + wFar / 2, yClampedF);
            ctx.lineTo(xCenterNear + wNear / 2, yClampedN);
            ctx.lineTo(w, yClampedN);
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = currentWorld.grassSideColor;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(xCenterFar - wFar / 2, yClampedF);
            ctx.lineTo(xCenterNear - wNear / 2, yClampedN);
            ctx.moveTo(xCenterFar + wFar / 2, yClampedF);
            ctx.lineTo(xCenterNear + wNear / 2, yClampedN);
            ctx.stroke();
        }

        drawCenterDashes();
    }

    function drawCenterDashes() {
        const dashLen = 6;
        const gapLen = 10;
        const pitch = dashLen + gapLen;
        ctx.strokeStyle = currentWorld.stripeColor;
        ctx.lineWidth = 3;
        const first = (Math.ceil(progress / pitch) * pitch) - progress;
        for (let dNear = first; dNear < VISIBLE_DIST; dNear += pitch) {
            const dFar = dNear + dashLen;
            const yNear = ROAD_BOTTOM_Y - ((ROAD_BOTTOM_Y - HORIZON_Y) * dNear / VISIBLE_DIST);
            const yFar = ROAD_BOTTOM_Y - ((ROAD_BOTTOM_Y - HORIZON_Y) * dFar / VISIBLE_DIST);
            if (yFar < HORIZON_Y - 4) continue;
            const xNear = roadCenterX(dNear);
            const xFar = roadCenterX(dFar);
            ctx.beginPath();
            ctx.moveTo(xNear, Math.min(ROAD_BOTTOM_Y, Math.max(HORIZON_Y, yNear)));
            ctx.lineTo(xFar, Math.max(HORIZON_Y, Math.min(ROAD_BOTTOM_Y, yFar)));
            ctx.stroke();
        }
    }

    const pickups = [];
    const decors = [];
    let finishLineDist = cfg.worlds[0].goal;

    function initPickups() {
        pickups.length = 0;
        const interval = 240;
        for (let d = interval; d < finishLineDist; d += interval) {
            const lane = (d % 480 < 240) ? -1 : 1;
            pickups.push({ dist: d, lane: lane, collected: false });
        }
    }

    function initObstacles() {
        obstacles.length = 0;
        const rng = mulberry32((currentWorld.curveSeed || 2026) * 104729 + 7);
        const types = currentWorld.obstacleTypes || ['puddle'];
        const density = currentWorld.obstacleDensity || 0.006;
        const step = 1 / density;
        let d = 600 + rng() * 300;
        let last = 0;
        while (d < finishLineDist - 400) {
            if (d - last >= 140) {
                let lane = rng() < 0.5 ? -1 : 1;
                for (let i = 0; i < pickups.length; i++) {
                    if (Math.abs(pickups[i].dist - d) < 60) { lane = -pickups[i].lane; break; }
                }
                const type = types[Math.floor(rng() * types.length)];
                obstacles.push({ dist: d, lane: lane, type: type, hitCd: 0 });
                last = d;
            }
            d += step * (0.7 + rng() * 0.6);
        }
    }

    function drawObstacles() {
        obstacles.forEach(o => {
            const screenDist = o.dist - progress;
            if (screenDist < 0 || screenDist > VISIBLE_DIST || screenDist < SEG_DIST * 0.6) return;
            const scale = screenDist / VISIBLE_DIST;
            const y = ROAD_BOTTOM_Y - ((ROAD_BOTTOM_Y - HORIZON_Y) * scale);
            if (y > ROAD_BOTTOM_Y || y < HORIZON_Y) return;
            const w = projectW(screenDist);
            const x = roadCenterX(screenDist) + o.lane * w * 0.32;
            const t = cfg.obstacleTypes[o.type];
            const size = pickupScreenSize(screenDist) * 1.25;
            if (size < 8) return;
            ctx.font = size + 'px "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(t.emoji, x, y);
            ctx.font = '';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'alphabetic';
        });
    }

    function addPuff(x, y) {
        for (let i = 0; i < 6; i++) {
            puffs.push({
                x: x, y: y,
                vx: (Math.random() * 2 - 1) * 40,
                vy: -40 - Math.random() * 60,
                life: 380,
                r: 3 + Math.random() * 4,
                col: '#E8DCC8'
            });
        }
    }

    function addSparkle(x, y, color) {
        for (let i = 0; i < 5; i++) {
            puffs.push({
                x: x, y: y,
                vx: (Math.random() * 2 - 1) * 70,
                vy: -60 - Math.random() * 80,
                life: 320,
                r: 2.5 + Math.random() * 3.5,
                col: color
            });
        }
    }

    function updatePuffs(dt) {
        for (let i = puffs.length - 1; i >= 0; i--) {
            const p = puffs[i];
            p.life -= dt;
            if (p.life <= 0) { puffs.splice(i, 1); continue; }
            p.x += p.vx * (dt / 1000);
            p.y += p.vy * (dt / 1000);
            p.vy -= 140 * (dt / 1000);
        }
    }

    function playThud() {
        if (!audioCtx) return;
        const t = audioCtx.currentTime;
        const o = audioCtx.createOscillator(), g = audioCtx.createGain();
        o.connect(g); g.connect(audioCtx.destination);
        o.type = 'sine';
        o.frequency.setValueAtTime(150, t);
        o.frequency.exponentialRampToValueAtTime(55, t + 0.22);
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.16, t + 0.015);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
        o.start(t); o.stop(t + 0.26);
    }

    function triggerObstacle(type, obs) {
        const o = cfg.obstacleTypes[type];
        if (!o) return;
        const t = performance.now();
        if (slowdown && slowdown.type === type && slowdown.remaining > 0 && t - slowdown.hitAt < 800) return;
        slowdown = { type: type, remaining: o.duration, hitAt: t };
        speed = speed * o.speedMult;
        shake = 1;
        playThud();
        if (type === 'barricade') {
            progress = Math.max(0, progress - 50);
        }
        if (type === 'rock' && obs) {
            const screenDist = obs.dist - progress;
            const w = projectW(screenDist);
            addPuff(roadCenterX(screenDist) + obs.lane * w * 0.32, ROAD_BOTTOM_Y - ((ROAD_BOTTOM_Y - HORIZON_Y) * screenDist / VISIBLE_DIST));
            const idx = obstacles.indexOf(obs);
            if (idx >= 0) obstacles.splice(idx, 1);
        }
    }

    function updateObstacles(dt) {
        if (slowdown) {
            slowdown.remaining -= dt;
            if (slowdown.remaining <= 0) {
                slowdown = null;
                speed = Math.max(speed, cfg.startSpeed);
            }
        }
        if (shake > 0) shake = Math.max(0, shake - dt / 250);
        const carDepthY = ROAD_BOTTOM_Y - cfg.carHeight * 0.82;
        obstacles.forEach(o => {
            if (o.hitCd > 0) { o.hitCd = Math.max(0, o.hitCd - dt); return; }
            const screenDist = o.dist - progress;
            if (screenDist < 0 || screenDist > VISIBLE_DIST) return;
            const scale = screenDist / VISIBLE_DIST;
            const y = ROAD_BOTTOM_Y - ((ROAD_BOTTOM_Y - HORIZON_Y) * scale);
            const w = projectW(screenDist);
            const x = roadCenterX(screenDist) + o.lane * w * 0.32;
            const size = pickupScreenSize(screenDist) * 1.25;
            if (Math.abs(x - carX) < (cfg.carWidth / 2 + size / 2) &&
                y > carDepthY - size && y < carDepthY + size) {
                o.hitCd = 600;
                triggerObstacle(o.type, o);
            }
        });
    }

    function initDecor() {
        decors.length = 0;
        const rng = mulberry32((currentWorld.curveSeed || 2026) * 7919 + 13);
        const list = currentWorld.decor;
        if (!list || !list.length) return;
        let d = 60 + rng() * 120;
        while (d < finishLineDist) {
            const side = rng() < 0.5 ? -1 : 1;
            decors.push({
                dist: d,
                side: side,
                offset: 0.16 + rng() * 0.6,
                scale: 0.85 + rng() * 0.7,
                char: list[Math.floor(rng() * list.length)]
            });
            d += 170 + rng() * 140;
        }
    }

    function drawDecor() {
        decors.forEach(dc => {
            const screenDist = dc.dist - progress;
            if (screenDist < 0 || screenDist > VISIBLE_DIST) return;
            const scale = screenDist / VISIBLE_DIST;
            const y = ROAD_BOTTOM_Y - ((ROAD_BOTTOM_Y - HORIZON_Y) * scale);
            if (y < HORIZON_Y - 4 || y > ROAD_BOTTOM_Y) return;
            const w = projectW(screenDist);
            const x = roadCenterX(screenDist) + dc.side * (w / 2 + w * dc.offset);
            if (x < -60 || x > canvas.width + 60) return;
            const size = cfg.pickupSize * (w / ROAD_MAX_W) * 1.5 * dc.scale;
            if (size < 8) return;
            ctx.font = size + 'px "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(dc.char, x, y);
            ctx.textAlign = 'left';
            ctx.textBaseline = 'alphabetic';
        });
    }

    function pickupScreenSize(screenDist) {
        const w = projectW(screenDist);
        return Math.max(ROAD_MIN_W, cfg.pickupSize * (w / ROAD_MAX_W) * 1.6);
    }

    function drawPickups() {
        pickups.forEach(p => {
            if (p.collected) return;
            const screenDist = p.dist - progress;
            if (screenDist < 0 || screenDist > VISIBLE_DIST || screenDist < SEG_DIST) return;
            const scale = screenDist / VISIBLE_DIST;
            const y = ROAD_BOTTOM_Y - ((ROAD_BOTTOM_Y - HORIZON_Y) * scale);
            if (y > ROAD_BOTTOM_Y || y < HORIZON_Y) return;
            const w = projectW(screenDist);
            const x = roadCenterX(screenDist) + p.lane * w * 0.32;
            const size = pickupScreenSize(screenDist);
            ctx.font = size + 'px "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(currentWorld.collectible, x, y);
            ctx.font = '';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'alphabetic';
        });
    }

    function drawFinishLine() {
        const screenDist = finishLineDist - progress;
        if (screenDist <= 0 || screenDist > VISIBLE_DIST) return;
        const scale = screenDist / VISIBLE_DIST;
        const y = ROAD_BOTTOM_Y - ((ROAD_BOTTOM_Y - HORIZON_Y) * scale);
        if (y > ROAD_BOTTOM_Y + 40 || y < HORIZON_Y - 40) return;
        const w = projectW(screenDist);
        const x = roadCenterX(screenDist);

        ctx.fillStyle = currentWorld.finishColor;
        ctx.fillRect(x - cfg.finishWidth / 2, y - cfg.finishWidth / 2, cfg.finishWidth, cfg.finishWidth);

        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 4;
        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        ctx.moveTo(x - w / 2, y);
        ctx.lineTo(x + w / 2, y);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#4A3F6B';
        ctx.font = 'bold ' + Math.max(16, cfg.pickupSize * 0.6) + 'px "Fredoka", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('ЦИЉ', x, y + cfg.finishWidth + 24);
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
    }

    function updatePickups() {
        const carDepthY = ROAD_BOTTOM_Y - cfg.carHeight * 0.82;
        pickups.forEach(p => {
            if (p.collected) return;
            const screenDist = p.dist - progress;
            if (screenDist < 0 || screenDist > VISIBLE_DIST) return;
            const scale = screenDist / VISIBLE_DIST;
            const y = ROAD_BOTTOM_Y - ((ROAD_BOTTOM_Y - HORIZON_Y) * scale);
            const w = projectW(screenDist);
            const x = roadCenterX(screenDist) + p.lane * w * 0.32;
            const size = pickupScreenSize(screenDist);
            if (Math.abs(x - carX) < (cfg.carWidth / 2 + size / 2) &&
                y > carDepthY - size && y < carDepthY + size) {
                p.collected = true;
                score++;
                pickupCount++;
                addSparkle(x, y, currentWorld.finishColor);
                window.popSound && window.popSound();
            }
        });
    }

    function checkFinish() {
        const screenDist = finishLineDist - progress;
        if (screenDist < SEG_DIST) {
            raceFinished = true;
            finishRace();
        }
    }

    function cap(s) {
        if (!s) return '';
        return s.charAt(0).toUpperCase() + s.slice(1);
    }

    function finishRace() {
        if (finishRecorded) return;
        finishRecorded = true;
        stopMusic();
        stopEngine();
        const modal = document.getElementById('racing-win-modal');
        const title = document.getElementById('racing-win-title');
        const scoreEl = document.getElementById('racing-win-score');
        const unlockEl = document.getElementById('racing-win-unlock');
        save.wins++;
        persistSave();
        if (modal) modal.classList.add('show');
        if (title) title.textContent = 'Игра завршена!';
        if (scoreEl) scoreEl.textContent = 'ПОЕНИ: ' + score + '  ·  ' + cap(currentWorld.collectibleName) + ': ' + pickupCount + '  ·  🏆 Трке: ' + save.wins;
        announce('Игра завршена! Поени: ' + score);
        if (unlockEl) {
            const ch = selectedCharacter;
            const idx = carIndex(ch, selectedCar.id);
            const newly = (ch.cars || []).filter((c, i) => i > idx && UNLOCK_WINS[i] === save.wins);
            if (newly.length) {
                const c = newly[0];
                unlockEl.textContent = '🎉 НОВО: ' + c.name + ' ' + c.emoji + '!';
                announce('Ново кола: ' + c.name);
                if (window.speech && window.speech.speak) window.speech.cancel();
            } else {
                unlockEl.textContent = '';
            }
        }
        if (window.celebrate) window.celebrate('🏁');
        if (window.speech && window.speech.speak) {
            window.speech.cancel();
            window.speech.speak('Браво!');
        }
    }

    function restart() {
        progress = 0;
        speed = cfg.startSpeed;
        score = 0;
        pickupCount = 0;
        raceFinished = false;
        finishRecorded = false;
        carX = ROAD_CENTER;
        keys.left = false;
        keys.right = false;
        slowdown = null;
        puffs.length = 0;
        shake = 0;
        finishLineDist = currentWorld.goal;
        initCurve();
        initPickups();
        initObstacles();
        initDecor();
        const modal = document.getElementById('racing-win-modal');
        if (modal) modal.classList.remove('show');
        beginCountdown();
        if (musicOn) {
            try {
                if (!audioCtx) initAudio();
                else startMusic(currentWorld.music);
            } catch (e) { /* audio not ready yet */ }
        }
        startGame();
    }

    function update(dt) {
        if (raceFinished) return;

        const sec = dt / 1000;
        const steer = (selectedCar && selectedCar.steer) || STEER_SPEED;
        const mult = slowdown ? (cfg.obstacleTypes[slowdown.type].speedMult || 0) : 1;

        if (keys.left) carX -= steer * sec;
        if (keys.right) carX += steer * sec;

        carX = Math.max(ROAD_CENTER - MAX_LATERAL, Math.min(ROAD_CENTER + MAX_LATERAL, carX));

        progress += speed * mult * sec;
        const accel = ((selectedCar && selectedCar.accel) || 1) * mult;
        speed = Math.min((selectedCar && selectedCar.maxSpeed) || maxSpeed, speed + cfg.speedGrowth * sec * accel);

        updateObstacles(dt);
        updatePuffs(dt);
        updatePickups();
        checkFinish();
        updateEngine();
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        if (shake > 0 && !REDUCED_MOTION) {
            ctx.translate((Math.random() * 2 - 1) * 6 * shake, (Math.random() * 2 - 1) * 4 * shake);
        }
        drawRoad();
        drawDecor();
        drawPickups();
        drawObstacles();
        drawFinishLine();

        drawCar(carX, ROAD_BOTTOM_Y - cfg.carHeight, selectedCharacter);

        puffs.forEach(p => {
            ctx.globalAlpha = Math.max(0, Math.min(1, p.life / 380));
            ctx.fillStyle = p.col || '#E8DCC8';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;

        if (countdownActive || (countdownDoneAt > 0 && performance.now() - countdownDoneAt < 600)) {
            drawCountdown(countdownActive ? countdownDisplay(countdownLeft) : 'go');
        }
        ctx.restore();

        const scoreEl = document.getElementById('racing-score');
        if (scoreEl && scoreEl.textContent !== 'Поени: ' + score) {
            scoreEl.textContent = 'Поени: ' + score;
        }

        const pickupEl = document.getElementById('racing-pickup-count');
        if (pickupEl) {
            const txt = cap(currentWorld.collectibleName) + ': ' + pickupCount;
            if (pickupEl.textContent !== txt) pickupEl.textContent = txt;
        }

        const fill = document.getElementById('racing-progress-fill');
        if (fill) {
            const pct = Math.max(0, Math.min(100, progress / finishLineDist * 100));
            fill.style.width = pct.toFixed(1) + '%';
        }
    }

    function drawCountdown(label) {
        const cx = W / 2;
        const cy = H * 0.4;
        const size = Math.round(Math.min(W, H) * 0.22);
        const text = label === 'go' ? 'Крени!' : String(label);
        ctx.font = 'bold ' + size + 'px "Fredoka", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.lineWidth = 10;
        ctx.strokeStyle = 'rgba(74,63,107,0.85)';
        ctx.strokeText(text, cx, cy);
        ctx.fillStyle = label === 'go' ? '#8CE99A' : '#FFD23F';
        ctx.fillText(text, cx, cy);
        ctx.font = '';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
    }

    function loop(timestamp) {
        if (!running) return;
        const dt = timestamp - lastTimestamp;
        lastTimestamp = timestamp;
        if (dt < 50) {
            if (countdownActive) {
                stepCountdown(dt);
                draw();
            } else {
                update(dt);
                draw();
            }
        }
        requestAnimationFrame(loop);
    }

    function startGame() {
        if (running) return;
        running = true;
        lastTimestamp = performance.now();
        const musicBtn = document.getElementById('racing-music-btn');
        if (musicBtn) musicBtn.textContent = musicOn ? '🔊' : '🔇';
        if (musicOn) { try { initAudio(); } catch (e) {} }
        requestAnimationFrame(loop);
    }

    window.startRacing = function () {
        if (window.__racing) return;
        applySave();
        finishLineDist = currentWorld.goal;
        initCurve();
        loadFrames();
        initPickups();
        initObstacles();
        window.__racing = {
            config: cfg,
            progress: () => progress,
            speed: () => speed,
            score: () => score,
            carX: () => carX,
            raceFinished: () => raceFinished,
            ROAD_CENTER: () => ROAD_CENTER,
            ROAD_BOTTOM_Y: () => ROAD_BOTTOM_Y,
            HORIZON_Y: () => HORIZON_Y,
            maxLateral: () => MAX_LATERAL,
            W: () => W,
            H: () => H,
            VISIBLE_DIST: VISIBLE_DIST,
            finishLineDist: finishLineDist,
            roadCenterX: roadCenterX,
            offs: () => offs,
            pickupSizeAt: pickupScreenSize,
            obstacles: () => obstacles,
            obstacleTypes: () => cfg.obstacleTypes,
            slowdownState: () => slowdown,
            triggerObstacle: triggerObstacle,
            shake: () => shake,
            particles: () => puffs,
            countdown: () => ({ active: countdownActive, left: countdownLeft, label: countdownActive ? countdownDisplay(countdownLeft) : null }),
            beginCountdown: beginCountdown,
            stepCountdown: stepCountdown,
            skipCountdown: skipCountdown,
            engine: () => ({ active: !!engineOsc, freq: engineOsc ? Math.round(engineOsc.frequency.value) : null }),
            reducedMotion: () => REDUCED_MOTION,
            announce: announce,
            pickups: () => pickups,
            selection: () => ({ char: selectedCharacter.id, car: (selectedCar && selectedCar.id) || null, world: currentWorld.key }),
            wins: () => save.wins,
            isUnlocked: (chId, carId) => isUnlocked(cfg.characters.find(c => c.id === chId), carId),
            unlockWins: () => UNLOCK_WINS,
            saveState: () => JSON.parse(JSON.stringify(loadSave())),
            finishRace: finishRace,
            startGame: startGame,
            restart: restart,
            keys: keys,
            update: update,
            draw: draw
        };
        window.racingRestart = restart;

        const modal = document.getElementById('racing-win-modal');
        if (modal) modal.classList.remove('show');
        const restartBtn = document.getElementById('racing-restart-btn');
        if (restartBtn) restartBtn.addEventListener('click', restart);
        const changeBtn = document.getElementById('racing-change-btn');
        if (changeBtn) changeBtn.addEventListener('click', showCharacterPicker);
        const worldBtn = document.getElementById('racing-worlds-btn');
        if (worldBtn) worldBtn.addEventListener('click', showWorldPicker);

        document.getElementById('racing-world-name').textContent = currentWorld.name;

        setTimeout(() => showCharacterPicker(), 50);
    };

    function showCharacterPicker() {
        const modal = document.getElementById('racing-char-modal');
        if (!modal) return;
        const grid = document.getElementById('racing-char-grid');
        if (!grid) return;
        const stats = document.getElementById('racing-char-stats');
        if (stats) stats.textContent = '🏆 Завршене трке: ' + save.wins;
        grid.innerHTML = '';
        const selectedKey = selectedCharacter.id + '/' + ((selectedCar && selectedCar.id) || '');
        cfg.characters.forEach(ch => {
            (ch.cars || []).forEach(car => {
                const key = ch.id + '/' + car.id;
                const locked = !isUnlocked(ch, car.id);
                const need = UNLOCK_WINS[carIndex(ch, car.id)] || 0;
                const btn = document.createElement('button');
                btn.className = 'racing-char-btn' + (key === selectedKey ? ' selected' : '') + (locked ? ' locked' : '');
                btn.dataset.combo = key;
                btn.setAttribute('role', 'option');
                btn.setAttribute('aria-selected', key === selectedKey ? 'true' : 'false');
                if (locked) btn.setAttribute('aria-disabled', 'true');
                btn.innerHTML =
                    '<span class="racing-combo-face"><img src="../assets/images/' + ch.folder + '01_idle_right.png" alt=""><em>' +
                    car.emoji + '</em></span>' +
                    '<span class="racing-combo-name">' + car.name + '</span>' +
                    '<span class="racing-combo-driver">' + (ch.short || ch.name) + '</span>' +
                    (locked ? '<span class="racing-combo-lock">🔒 ' + need + ' победе</span>' : '');
                btn.addEventListener('click', () => {
                    if (locked) {
                        window.popSound && window.popSound();
                        return;
                    }
                    window.popSound && window.popSound();
                    save.char = ch.id;
                    save.car = car.id;
                    save.world = currentWorld.key;
                    persistSave();
                    selectedCharacter = ch;
                    selectedCar = car;
                    carX = ROAD_CENTER;
                    announce(car.name + ', ' + (ch.short || ch.name));
                    modal.classList.remove('show');
                    restart();
                });
                grid.appendChild(btn);
            });
        });
        modal.classList.add('show');
    }

    function showWorldPicker() {
        if (raceFinished || !running) return;
        const modal = document.getElementById('racing-worlds-modal');
        if (!modal) return;
        const grid = document.getElementById('racing-worlds-grid');
        if (!grid) return;
        grid.innerHTML = '';
        cfg.worlds.forEach((w, i) => {
            const btn = document.createElement('button');
            btn.className = 'racing-world-btn';
            btn.dataset.world = i;
            btn.textContent = w.collectible + ' ' + w.name;
            btn.addEventListener('click', () => {
                window.popSound && window.popSound();
                currentWorld = w;
                save.world = w.key;
                persistSave();
                document.getElementById('racing-world-name').textContent = currentWorld.name;
                announce('Свет: ' + w.name);
                modal.classList.remove('show');
                restart();
            });
            grid.appendChild(btn);
        });
        modal.classList.add('show');
    }

    document.getElementById('racing-back').addEventListener('click', () => {
        running = false;
        stopMusic();
        stopEngine();
        if (window.popSound) window.popSound();
        setTimeout(() => location.href = '../index.html#hub-games', 90);
    });
})();
