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

    function resizeCanvas() {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        W = canvas.width; H = canvas.height;
        HORIZON_Y = 0.24 * H;
        ROAD_BOTTOM_Y = 0.90 * H;
        ROAD_CENTER = W / 2;
        ROAD_MAX_W = Math.max(180, Math.min(360, W * 0.22));
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
        const body = character.carBody;
        const accent = character.carAccent;
        const wheel = character.carWheel;
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

        for (let i = NUM_SEGMENTS - 1; i >= 0; i--) {
            const dFar = (i + 1) * SEG_DIST;
            const dNear = i * SEG_DIST;
            const yFar = ROAD_BOTTOM_Y - ((ROAD_BOTTOM_Y - HORIZON_Y) * dFar / VISIBLE_DIST);
            const yNear = ROAD_BOTTOM_Y - ((ROAD_BOTTOM_Y - HORIZON_Y) * dNear / VISIBLE_DIST);

            const wFar = projectW(dFar);
            const wNear = projectW(dNear);

            const yClampedF = Math.max(HORIZON_Y, Math.min(ROAD_BOTTOM_Y, yFar));
            const yClampedN = Math.max(HORIZON_Y, Math.min(ROAD_BOTTOM_Y, yNear));

            const xCenter = ROAD_CENTER;

            ctx.fillStyle = currentWorld.roadColor;
            ctx.beginPath();
            ctx.moveTo(xCenter - wFar / 2, yClampedF);
            ctx.lineTo(xCenter + wFar / 2, yClampedF);
            ctx.lineTo(xCenter + wNear / 2, yClampedN);
            ctx.lineTo(xCenter - wNear / 2, yClampedN);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = currentWorld.grassColor;
            ctx.fillRect(0, yClampedF, xCenter - wFar / 2, yClampedN - yClampedF);
            ctx.fillRect(xCenter + wFar / 2, yClampedF, xCenter - wFar / 2, yClampedN - yClampedF);

            ctx.strokeStyle = currentWorld.grassSideColor;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(xCenter - wFar / 2, yClampedF);
            ctx.lineTo(xCenter - wNear / 2, yClampedN);
            ctx.moveTo(xCenter + wFar / 2, yClampedF);
            ctx.lineTo(xCenter + wNear / 2, yClampedN);
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
            ctx.beginPath();
            ctx.moveTo(ROAD_CENTER, Math.min(ROAD_BOTTOM_Y, Math.max(HORIZON_Y, yNear)));
            ctx.lineTo(ROAD_CENTER, Math.max(HORIZON_Y, Math.min(ROAD_BOTTOM_Y, yFar)));
            ctx.stroke();
        }
    }

    const pickups = [];
    const finishLineDist = cfg.worlds[0].goal;

    function initPickups() {
        pickups.length = 0;
        const interval = 240;
        for (let d = interval; d < finishLineDist; d += interval) {
            const lane = (d % 480 < 240) ? -1 : 1;
            pickups.push({ dist: d, lane: lane, collected: false });
        }
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
            const x = ROAD_CENTER + p.lane * w * 0.32;
            const size = cfg.pickupSize * (screenDist / VISIBLE_DIST) * 1.2 + 12;
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
        const x = ROAD_CENTER;

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
            const x = ROAD_CENTER + p.lane * w * 0.32;
            const size = 40;
            if (Math.abs(x - carX) < (cfg.carWidth / 2 + size / 2) &&
                y > carDepthY - size / 2 && y < carDepthY + size / 2) {
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

    function finishRace() {
        stopMusic();
        const modal = document.getElementById('racing-win-modal');
        const title = document.getElementById('racing-win-title');
        const scoreEl = document.getElementById('racing-win-score');
        if (modal) modal.classList.add('show');
        if (title) title.textContent = 'Игра завршена!';
        if (scoreEl) scoreEl.textContent = 'Поени: ' + score + '  ·  Цвеће: ' + pickupCount;
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
        keys = { left: false, right: false };
        initPickups();
        const modal = document.getElementById('racing-win-modal');
        if (modal) modal.classList.remove('show');
        const scoreEl = document.getElementById('racing-score');
        if (scoreEl) scoreEl.textContent = 'Поени: 0';
        startGame();
    }

    function update(dt) {
        if (raceFinished) return;

        const sec = dt / 1000;

        if (keys.left) carX -= STEER_SPEED * sec;
        if (keys.right) carX += STEER_SPEED * sec;

        carX = Math.max(ROAD_CENTER - MAX_LATERAL, Math.min(ROAD_CENTER + MAX_LATERAL, carX));

        progress += speed * sec;
        speed = Math.min(maxSpeed, speed + cfg.speedGrowth * sec);

        updatePickups();
        checkFinish();
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawRoad();
        drawPickups();
        drawFinishLine();

        drawCar(carX, ROAD_BOTTOM_Y - cfg.carHeight, selectedCharacter);

        const scoreEl = document.getElementById('racing-score');
        if (scoreEl && scoreEl.textContent !== 'Поени: ' + score) {
            scoreEl.textContent = 'Поени: ' + score;
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
                currentWorld = cfg.worlds[0];
                carX = ROAD_CENTER;
                document.getElementById('racing-world-name').textContent = currentWorld.name;
                const scoreEl = document.getElementById('racing-score');
                if (scoreEl) scoreEl.textContent = 'Поени: 0';
                modal.classList.remove('show');
                startGame();
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
