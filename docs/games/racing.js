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
    let roadOffset = 0;
    let running = false;
    let lastTimestamp = 0;

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
        stopMusic();
        const modal = document.getElementById('racing-win-modal');
        const title = document.getElementById('racing-win-title');
        const scoreEl = document.getElementById('racing-win-score');
        if (modal) modal.classList.add('show');
        if (title) title.textContent = 'Игра завршена!';
        if (scoreEl) scoreEl.textContent = 'Поени: ' + score + '  ·  ' + cap(currentWorld.collectibleName) + ': ' + pickupCount;
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
        carX = ROAD_CENTER;
        keys.left = false;
        keys.right = false;
        finishLineDist = currentWorld.goal;
        initCurve();
        initPickups();
        initDecor();
        const modal = document.getElementById('racing-win-modal');
        if (modal) modal.classList.remove('show');
        startGame();
    }

    function update(dt) {
        if (raceFinished) return;

        const sec = dt / 1000;
        const steer = (selectedCar && selectedCar.steer) || STEER_SPEED;

        if (keys.left) carX -= steer * sec;
        if (keys.right) carX += steer * sec;

        carX = Math.max(ROAD_CENTER - MAX_LATERAL, Math.min(ROAD_CENTER + MAX_LATERAL, carX));

        progress += speed * sec;
        speed = Math.min((selectedCar && selectedCar.maxSpeed) || maxSpeed, speed + cfg.speedGrowth * sec);

        updatePickups();
        checkFinish();
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawRoad();
        drawDecor();
        drawPickups();
        drawFinishLine();

        drawCar(carX, ROAD_BOTTOM_Y - cfg.carHeight, selectedCharacter);

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

    function loop(timestamp) {
        if (!running) return;
        const dt = timestamp - lastTimestamp;
        lastTimestamp = timestamp;
        if (dt < 50) {
            update(dt);
            draw();
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
        initCurve();
        loadFrames();
        initPickups();
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
        grid.innerHTML = '';
        cfg.characters.forEach(ch => {
            const btn = document.createElement('button');
            btn.className = 'racing-char-btn';
            btn.dataset.character = ch.id;
            btn.innerHTML = '<img src="../assets/images/' + ch.folder + '01_idle_right.png" alt="' + ch.name + '"><span>' + ch.name + '</span>';
            btn.addEventListener('click', () => {
                window.popSound && window.popSound();
                selectedCharacter = ch;
                selectedCar = (ch.cars && ch.cars[0]) || null;
                currentWorld = cfg.worlds[0];
                carX = ROAD_CENTER;
                modal.classList.remove('show');
                restart();
            });
            grid.appendChild(btn);
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
                document.getElementById('racing-world-name').textContent = currentWorld.name;
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
        if (window.popSound) window.popSound();
        setTimeout(() => location.href = '../index.html#hub-games', 90);
    });
})();
