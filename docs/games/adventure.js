/* Shared adventure engine for the Petrin svet vehicle/adventure games.
   Ports the Paper Kitty runtime (canvas side-scroller, per-world themes,
   forgiving collisions, worlds picker) into a config-driven engine.
   Music/audio is in adventure-music.js; mode draw helpers are in adventure-modes.js.
   Each game supplies its own levels + music in games/<game>.js and a thin page
   that loads this file. */
(function () {
    'use strict';

    function fitAdvToViewport() {
        const advGame = document.getElementById('adv-game');
        if (!advGame) return;
        advGame.style.height = window.innerHeight + 'px';
    }
    window.addEventListener('resize', fitAdvToViewport);
    window.addEventListener('orientationchange', fitAdvToViewport);
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) setTimeout(fitAdvToViewport, 100);
    });
    fitAdvToViewport();

    function shuffleArr(arr) {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    // --- Canvas + HUD helpers ---
    function create(cfg) {
        const canvas = document.getElementById('adv-canvas');
        const ctx = canvas.getContext('2d');
        const el = (id) => document.getElementById(id);
        const mode = cfg.mode || 'ground';
        const heroImage = cfg.heroImage ? new Image() : null;
        if (heroImage) heroImage.src = cfg.heroImage;
        const heroW = cfg.heroW || 48;
        const heroH = cfg.heroH || 48;
        const roadTop = cfg.roadTop || 0.20;
        const roadTopY = () => canvas.height * roadTop;
        const pickupPad = 26;
        const dyScale = (mode === 'drive') ? (cfg.dyScale || 1) : 1;
        const obstacleScale = cfg.obstacleScale || 1;

        let coinCount = 0;
        let cameraX = 0;
        let levelCompleted = false;
        let theme = null;
        let player = null;
        let platforms = [];
        let movingPlatforms = [];
        let pipes = [];
        let mice = [];
        let coins = [];
        let obstacles = [];
        let goal = null;
        let particles = [];
        let stairSteps = [];
        let lastHitAt = 0;
        let bumpCount = 0;
        let worldOrder = shuffleArr(cfg.levels.map((_, i) => i));
        let worldPos = 0;
        let paused = false;
        let flyDyScale = 1;

        const keys = { left: false, right: false, up: false, down: false, jump: false };

        function resizeCanvas() {
            const oldH = canvas.height;
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
            if (!theme || Math.abs(canvas.height - oldH) < 2) return;
            const dy = canvas.height - oldH;
            if (mode === 'ground') {
                platforms.forEach(p => { p.y += dy; });
                movingPlatforms.forEach(mp => { mp.y += dy; });
                pipes.forEach(pp => { pp.y += dy; });
                coins.forEach(c => { c.y += dy; });
                if (goal) goal.y += dy;
                mice.forEach(m => { m.pipeY += dy; m.hiddenY += dy; m.visibleY += dy; m.y += dy; });
            } else {
                obstacles.forEach(o => { o.y += dy; });
                coins.forEach(c => { c.y += dy; });
                if (goal) goal.y += dy;
            }
        }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        function initAudio() {
            if (!window.AdventureMusic || window.AdventureMusic.audioCtx) return;
            window.AdventureMusic.init();
            if (musicTheme) window.AdventureMusic.startTheme(musicTheme, cfg.music, () => paused);
        }

        // --- Input controls ---
        function bindButton(btn, keyProp) {
            const start = (e) => {
                e.preventDefault();
                initAudio();
                keys[keyProp] = true;
            };
            const end = (e) => {
                e.preventDefault();
                keys[keyProp] = false;
            };
            btn.addEventListener('touchstart', start, { passive: false });
            btn.addEventListener('touchend', end, { passive: false });
            btn.addEventListener('mousedown', start);
            btn.addEventListener('mouseup', end);
            btn.addEventListener('mouseleave', end);
        }

        document.querySelectorAll('#adv-controls [data-adv]').forEach(btn => bindButton(btn, btn.dataset.adv));

        window.addEventListener('keydown', (e) => {
            const isGameKey = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key) || e.code === 'Space' || ['a', 'd', 'w', 's'].includes(e.key);
            if (isGameKey) e.preventDefault();
            initAudio();
            if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = true;
            if (e.key === 'ArrowRight' || e.key === 'd') keys.right = true;
            if (e.key === 'ArrowUp' || e.key === 'w') keys.up = true;
            if (e.key === 'ArrowDown' || e.key === 's') keys.down = true;
            if (e.key === 'ArrowUp' || e.code === 'Space' || e.key === 'w') keys.jump = true;
        });
        window.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = false;
            if (e.key === 'ArrowRight' || e.key === 'd') keys.right = false;
            if (e.key === 'ArrowUp' || e.key === 'w') keys.up = false;
            if (e.key === 'ArrowDown' || e.key === 's') keys.down = false;
            if (e.key === 'ArrowUp' || e.code === 'Space' || e.key === 'w') keys.jump = false;
        });

        // --- World loading ---
        function loadWorld() {
            const w = cfg.levels[worldOrder[worldPos]];
            theme = w;
            window.AdventureMusic.startTheme(w.music, cfg.music, () => paused);
            el('adv-level').textContent = worldPos + 1;
            el('adv-collect-emoji').textContent = w.collectible;
            el('adv-world-name').textContent = w.name;
            el('adv-win-modal').classList.remove('show');
            levelCompleted = false;
            cameraX = 0;
            if (w.bgPage) document.body.style.background = w.bgPage;

            const GROUND_H = 140;
            const gy = canvas.height - GROUND_H;

            player = {
                x: mode === 'ground'
                    ? Math.max(280, Math.min(w.grounds[0].x + w.grounds[0].w - 70, canvas.width * 0.3))
                    : Math.max(280, canvas.width * 0.3),
                y: mode === 'ground'
                    ? 100
                    : (mode === 'fly' ? Math.round(canvas.height * 0.4) : canvas.height - heroH - 24),
                width: heroW,
                height: heroH,
                vx: 0,
                vy: 0,
                speed: cfg.speed || 5.2,
                jumpPower: cfg.jumpPower || -13.5,
                grounded: false,
                facingRight: true,
                squish: 1,
                offsetX: cfg.offsetStartX || (canvas.width * (cfg.offsetStartRatio || 0.3))
            };

            coins = [];
            obstacles = [];
            platforms = [];
            movingPlatforms = [];
            pipes = [];
            mice = [];
            stairSteps = [];

            if (mode === 'ground') {
                platforms = w.grounds.map(g => ({ x: g.x, y: gy, width: g.w, height: GROUND_H, color: w.groundColor }))
                    .concat((w.floats || []).map(f => ({ x: f.x, y: gy - f.dy, width: f.w, height: 26, color: f.color })));

                coins = w.coins.map(c => ({ x: c.x, y: gy - c.dy, collected: false }));

                (w.stairs || []).forEach((st, si) => {
                    const ascending = [];
                    for (let i = 0; i < st.peak; i++) {
                        ascending.push({ x: st.x + i * st.w, y: gy - (i + 1) * st.h, width: st.w, height: st.h, color: w.stairColor, isStair: true });
                    }
                    const descending = [];
                    for (let j = 0; j < st.peak - 1; j++) {
                        descending.push({ x: st.x + (st.peak + j) * st.w, y: gy - (st.peak - 1 - j) * st.h, width: st.w, height: st.h, color: w.stairColor, isStair: true });
                    }
                    stairSteps = stairSteps.concat(ascending, descending);
                    if (si === 0) {
                        ascending.forEach((s, i) => {
                            if (i % 2 === 0) coins.push({ x: s.x + s.width / 2, y: s.y - 28, collected: false });
                        });
                    }
                });
                platforms = platforms.concat(stairSteps);

                movingPlatforms = (w.moves || []).map(m => ({
                    x: m.x, y: gy - m.dy, width: m.w, height: 22,
                    minX: m.minX, maxX: m.maxX, vx: m.vx, color: m.color
                }));

                pipes = (w.pipes || []).map(p => ({ x: p.x, y: gy - p.h, width: 60, height: p.h }));

                goal = { x: w.goalX, y: gy - 220, width: 220, height: 220 };

                const nextPop = performance.now() + 3000;
                mice = pipes.map(pipe => ({
                    x: pipe.x + pipe.width / 2,
                    pipeY: pipe.y,
                    hiddenY: pipe.y + 26,
                    visibleY: pipe.y - 24,
                    y: pipe.y + 26,
                    visible: false,
                    nextPopAt: nextPop,
                    animationStart: 0
                }));
            } else {
                if (mode === 'fly') {
                    const maxDy = Math.max(70, ...(w.obstacles || []).map(o => o.dy || 0), ...(w.coins || []).map(c => c.dy || 0), w.goalDy || 210);
                    flyDyScale = (canvas.height * 0.88) / maxDy;
                }
                obstacles = (w.obstacles || []).map(o => {
                    const ow = (o.w || 46) * obstacleScale;
                    const oh = (o.h || 42) * obstacleScale;
                    const roadY = mode === 'drive'
                        ? roadTopY() + 16 + Math.random() * Math.max(0, canvas.height - roadTopY() - oh - 32)
                        : canvas.height - o.dy * flyDyScale - oh;
                    return {
                        x: o.x,
                        y: roadY,
                        width: ow,
                        height: oh,
                        type: o.type || 'rock',
                        color: o.color,
                        minX: o.minX,
                        maxX: o.maxX,
                        vx: o.vx || 0,
                        dy: o.dy
                    };
                });
                coins = (w.coins || []).map(c => ({
                    x: c.x,
                    y: mode === 'drive'
                        ? roadTopY() + 24 + Math.random() * Math.max(0, canvas.height - roadTopY() - 48)
                        : canvas.height - c.dy * flyDyScale,
                    collected: false
                }));
                if (mode === 'drive') {
                    goal = { x: w.goalX, y: roadTopY(), width: w.goalW || 240, height: canvas.height - roadTopY() };
                } else {
                    const yScale = mode === 'fly' ? flyDyScale : 1;
                    const goalH = (w.goalH || 200) * yScale;
                    const goalW = w.goalW || 200;
                    goal = { x: w.goalX, y: canvas.height - (w.goalDy || 210) * yScale - goalH, width: goalW, height: goalH };
                }
            }

            particles = [];
            lastHitAt = 0;
            maybePickHero();
        }

        function nextLevel() {
            window.AdventureMusic.play('pop');
            if (worldPos < worldOrder.length - 1) {
                worldPos++;
                loadWorld();
            } else {
                worldOrder = shuffleArr(cfg.levels.map((_, i) => i));
                worldPos = 0;
                coinCount = 0;
                el('adv-coin-count').textContent = coinCount;
                loadWorld();
            }
        }

        // --- Worlds picker ---
        function buildWorldsMenu() {
            const grid = el('adv-worlds-grid');
            if (!grid) return;
            grid.innerHTML = '';
            worldOrder.forEach((wi, idx) => {
                const w = cfg.levels[wi];
                const btn = document.createElement('button');
                btn.className = 'adv-world-btn';
                btn.innerHTML = '<span class="adv-w-emoji">' + w.collectible + '</span>' + w.name;
                btn.addEventListener('click', () => {
            window.AdventureMusic.play('pop');
                    worldPos = idx;
                    coinCount = 0;
                    el('adv-coin-count').textContent = coinCount;
                    closeWorldsMenu();
                    loadWorld();
                });
                grid.appendChild(btn);
            });
        }

        function openWorldsMenu() {
            initAudio();
            buildWorldsMenu();
            el('adv-worlds-modal').classList.add('show');
            setPaused(true);
        }

        function closeWorldsMenu() {
            el('adv-worlds-modal').classList.remove('show');
            setPaused(false);
        }

        const worldsBtn = el('adv-worlds-btn');
        if (worldsBtn) worldsBtn.addEventListener('click', openWorldsMenu);
        const worldsClose = el('adv-worlds-close');
        if (worldsClose) worldsClose.addEventListener('click', closeWorldsMenu);
        const musicBtn = el('adv-music-btn');
        if (musicBtn) {
            musicBtn.addEventListener('click', () => window.AdventureMusic.setOn(!musicBtn.classList.contains('off')));
            musicBtn.textContent = window.AdventureMusic.musicOn ? '🔊' : '🔇';
            musicBtn.classList.toggle('off', !window.AdventureMusic.musicOn);
        }
        const modalBtn = el('adv-modal-btn');
        if (modalBtn) modalBtn.addEventListener('click', nextLevel);

        function spawnParticles(x, y, color) {
            const MAX_PARTICLES = 120;
            if (particles.length > MAX_PARTICLES) return;
            for (let i = 0; i < 10; i++) {
                particles.push({
                    x: x, y: y,
                    vx: (Math.random() - 0.5) * 6,
                    vy: (Math.random() - 0.5) * 6,
                    radius: Math.random() * 5 + 3,
                    color: color,
                    alpha: 1
                });
            }
        }

        function respawnPlayer() {
            bumpCount++;
            if (mode === 'drive') {
                cameraX = Math.max(0, cameraX - 160);
                player.offsetX = Math.min(player.offsetX, canvas.width * 0.6);
                player.x = cameraX + player.offsetX;
                lastHitAt = performance.now();
            } else if (mode === 'ground') {
                player.y = 50;
                player.x = Math.max(50, player.x - 220);
                player.vy = 0;
            } else {
                player.y = Math.max(60, player.y - 120);
            }
        }

        // --- Update ---
        function update() {
            const now = performance.now();
            const previousX = player.x;

            if (mode === 'ground') {
                updateGround(previousX);
            } else if (mode === 'drive') {
                updateDrive();
            } else {
                updateFly();
            }

            if (mode !== 'ground') {
                // collectibles + obstacles + goal are shared for fly/drive
                if (!levelCompleted) {
                    coins.forEach(c => {
                        if (!c.collected &&
                            player.x + player.width > c.x - 18 &&
                            player.x < c.x + 18 &&
                            player.y + player.height > c.y - 18 &&
                            player.y < c.y + 18) {
                            c.collected = true;
                            coinCount++;
                            el('adv-coin-count').textContent = coinCount;
                            window.AdventureMusic.play('coin');
                            spawnParticles(c.x, c.y, '#FFD23F');
                        }
                    });

                    obstacles.forEach(o => {
                        if (o.vx) {
                            o.x += o.vx;
                            if (o.x <= o.minX || o.x + o.width >= o.maxX) o.vx *= -1;
                        }
                        const playerLeft = player.x + player.width * 0.08;
                        const playerTop = player.y + player.height * 0.28;
                        const playerRight = player.x + player.width * 0.9;
                        const playerBottom = player.y + player.height * 0.92;
                        const obstacleLeft = o.x + o.width * 0.12;
                        const obstacleTop = o.y + o.height * 0.14;
                        const obstacleRight = o.x + o.width * 0.88;
                        const obstacleBottom = o.y + o.height * 0.9;
                        if (now - lastHitAt > 900 &&
                            playerRight > obstacleLeft &&
                            playerLeft < obstacleRight &&
                            playerBottom > obstacleTop &&
                            playerTop < obstacleBottom) {
                            window.AdventureMusic.play('bump');
                            spawnParticles(player.x + player.width / 2, player.y, '#ffffff');
                            respawnPlayer();
                        }
                    });
                }
            }

            // Level clear goal (all modes)
            if (!levelCompleted && player.x + player.width > goal.x + 30 && player.x < goal.x + goal.width) {
                levelCompleted = true;
                player.vx = 0;
                window.AdventureMusic.play('win');
                const title = el('adv-win-title');
                const btn = el('adv-modal-btn');
                if (worldPos < worldOrder.length - 1) {
                    title.textContent = theme.name + "\nПРЕЂЕН!";
                    btn.textContent = "СЛЕДЕЋИ СВЕТ! 🚀";
                } else {
                    title.textContent = "🌟 СВИ СВЕТОВИ ПРЕЂЕНИ! 🌟";
                    btn.textContent = "ИГРАЈ ПОНОВО! 🔄";
                }
                el('adv-win-modal').classList.add('show');
            }

            // Particles
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.alpha -= 0.035;
                if (p.alpha <= 0) particles.splice(i, 1);
            }
        }

        function updateGround(previousX) {
            if (!levelCompleted) {
                if (keys.left) {
                    player.vx = -player.speed;
                    player.facingRight = false;
                } else if (keys.right) {
                    player.vx = player.speed;
                    player.facingRight = true;
                } else {
                    player.vx *= 0.8;
                }

                if (keys.jump && player.grounded) {
                    player.vy = player.jumpPower;
                    player.grounded = false;
                    player.squish = 1.35;
                    window.AdventureMusic.play('jump');
                }
            } else {
                player.vx *= 0.8;
            }

            const previousY = player.y;
            player.vy += 0.55; // Gravity
            player.x += player.vx;
            player.y += player.vy;
            player.squish += (1 - player.squish) * 0.12;

            movingPlatforms.forEach(mp => {
                if (levelCompleted) return;
                mp.x += mp.vx;
                if (mp.x <= mp.minX || mp.x + mp.width >= mp.maxX) mp.vx *= -1;
                if (player.x + player.width > mp.x &&
                    player.x < mp.x + mp.width &&
                    player.vy >= 0 &&
                    player.y + player.height >= mp.y &&
                    previousY + player.height <= mp.y + 24) {
                    player.grounded = true;
                    player.vy = 0;
                    player.y = mp.y - player.height;
                    player.x += mp.vx;
                }
            });

            player.grounded = false;
            const allSolid = [...platforms, ...pipes];
            allSolid.forEach(p => {
                if (player.x + player.width > p.x &&
                    player.x < p.x + p.width &&
                    player.vy >= 0 &&
                    player.y + player.height >= p.y &&
                    previousY + player.height <= p.y + 24) {
                    player.grounded = true;
                    player.vy = 0;
                    player.y = p.y - player.height;
                }
            });

            pipes.forEach(pipe => {
                const overlapsVertically = player.y < pipe.y + pipe.height && player.y + player.height > pipe.y + 8;
                if (!overlapsVertically) return;
                if (player.vx > 0 && previousX + player.width <= pipe.x && player.x + player.width > pipe.x) {
                    player.x = pipe.x - player.width;
                    player.vx = 0;
                } else if (player.vx < 0 && previousX >= pipe.x + pipe.width && player.x < pipe.x + pipe.width) {
                    player.x = pipe.x + pipe.width;
                    player.vx = 0;
                }
            });

            stairSteps.forEach(step => {
                const rightEdge = player.x + player.width;
                const feetY = player.y + player.height;

                if (player.vy >= 0) {
                    let faceX = -1;
                    if (player.vx > 0 && previousX + player.width <= step.x && rightEdge > step.x) {
                        faceX = step.x;
                    } else if (player.vx < 0 && previousX >= step.x + step.width && player.x < step.x + step.width) {
                        faceX = step.x + step.width;
                    }
                    if (faceX >= 0 && feetY >= step.y - 2 && feetY <= step.y + step.height + 4) {
                        player.y = step.y - player.height;
                        player.vy = 0;
                        player.grounded = true;
                        return;
                    }
                }

                const overlapsVertically = player.y < step.y + step.height && player.y + player.height > step.y + 8;
                if (!overlapsVertically) return;
                if (player.vx > 0 && previousX + player.width <= step.x && rightEdge > step.x) {
                    player.x = step.x - player.width;
                    player.vx = 0;
                } else if (player.vx < 0 && previousX >= step.x + step.width && player.x < step.x + step.width) {
                    player.x = step.x + step.width;
                    player.vx = 0;
                }
            });

            if (!levelCompleted && player.y > canvas.height + 100) respawnPlayer();

            // Enemies pop out of pipes on a three-second cycle.
            const now = performance.now();
            mice.forEach(mouse => {
                if (mouse.visible) {
                    const elapsed = now - mouse.animationStart;
                    const riseDuration = 350;
                    const holdDuration = 900;
                    const slideDuration = 350;
                    if (elapsed < riseDuration) {
                        mouse.y = mouse.hiddenY + (mouse.visibleY - mouse.hiddenY) * (elapsed / riseDuration);
                    } else if (elapsed < riseDuration + holdDuration) {
                        mouse.y = mouse.visibleY;
                    } else if (elapsed < riseDuration + holdDuration + slideDuration) {
                        const progress = (elapsed - riseDuration - holdDuration) / slideDuration;
                        mouse.y = mouse.visibleY + (mouse.hiddenY - mouse.visibleY) * progress;
                    } else {
                        mouse.visible = false;
                        mouse.y = mouse.hiddenY;
                    }
                } else if (now >= mouse.nextPopAt) {
                    mouse.visible = true;
                    mouse.animationStart = now;
                    mouse.y = mouse.hiddenY;
                    mouse.nextPopAt += 3000;
                }
            });

            const hitMouse = mice.find(mouse => mouse.visible && mouse.y <= mouse.visibleY + 8 &&
                player.x + player.width > mouse.x - 18 &&
                player.x < mouse.x + 18 &&
                player.y + player.height > mouse.y - 22 &&
                player.y < mouse.y + 22);
            if (hitMouse) {
                window.AdventureMusic.play('bump');
                hitMouse.visible = false;
                hitMouse.nextPopAt = now + 3000;
                respawnPlayer();
            }

            // Camera follow
            cameraX += (player.x - canvas.width / 3 - cameraX) * 0.1;
            cameraX = Math.max(0, cameraX);

            if (!levelCompleted) {
                coins.forEach(c => {
                    if (!c.collected &&
                        player.x + player.width > c.x - pickupPad &&
                        player.x < c.x + pickupPad &&
                        player.y + player.height > c.y - pickupPad &&
                        player.y < c.y + pickupPad) {
                        c.collected = true;
                        coinCount++;
                        el('adv-coin-count').textContent = coinCount;
                        window.AdventureMusic.play('coin');
                        spawnParticles(c.x, c.y, '#FFD23F');
                    }
                });
            }
        }

        function updateDrive() {
            if (!levelCompleted) {
                const spd = player.speed;
                if (keys.left) player.offsetX -= spd;
                if (keys.right) player.offsetX += spd;
                if (keys.up) player.y -= spd;
                if (keys.down) player.y += spd;
            }

            // The road keeps rolling forward until the car reaches the finish line.
            if (!levelCompleted) cameraX += cfg.driveSpeed || 3.2;
            player.x = cameraX + player.offsetX;
            player.offsetX = Math.max(30, Math.min(canvas.width - player.width - 30, player.offsetX));
            const driveTopPadding = cfg.driveTopPadding ?? 12;
            player.y = Math.max(roadTopY() + driveTopPadding, Math.min(canvas.height - player.height - 10, player.y));
        }

        function updateFly() {
            if (!levelCompleted) {
                const spd = player.speed;
                if (keys.left) player.vx = -spd;
                else if (keys.right) player.vx = spd;
                else player.vx *= 0.85;

                if (keys.up) player.vy = -spd;
                else if (keys.down) player.vy = spd;
                else player.vy *= 0.85;
            } else {
                player.vx *= 0.85;
                player.vy *= 0.85;
            }

            player.x += player.vx;
            player.y += player.vy;
            if (player.vx > 0.1) player.facingRight = true;
            else if (player.vx < -0.1) player.facingRight = false;

            player.x = Math.max(cameraX + 20, player.x);
            player.y = Math.max(30, Math.min(canvas.height - player.height - 20, player.y));

            cameraX += (player.x - canvas.width / 3 - cameraX) * 0.1;
            cameraX = Math.max(0, cameraX);
            player.x = Math.max(cameraX + 20, player.x);
        }

        // --- Drawing ---
        function drawPaperStitchLine(x1, y1, x2, y2) {
            ctx.save();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3;
            ctx.setLineDash([8, 8]);
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
            ctx.restore();
        }

        function drawSparkle(x, y) {
            const t = Date.now() / 1000;
            for (let i = 0; i < 3; i++) {
                const a = (Math.sin(t * 2.5 + i * 2.1) + 1) / 2;
                if (a < 0.2) continue;
                const angle = i * 2.1 + t * 0.6;
                const dist = 26 + (i % 2) * 9;
                const sx = x + Math.cos(angle) * dist;
                const sy = y + Math.sin(angle) * dist - 4;
                ctx.save();
                ctx.globalAlpha = a * 0.85;
                ctx.strokeStyle = '#FFD23F';
                ctx.lineWidth = 2;
                const s = 3 + a * 3.5;
                ctx.beginPath();
                ctx.moveTo(sx, sy - s);
                ctx.lineTo(sx, sy + s);
                ctx.moveTo(sx - s, sy);
                ctx.lineTo(sx + s, sy);
                ctx.stroke();
                ctx.restore();
            }
        }

        // Parallax background art. Each decor sits in the sky band above the road
        // and scrolls slower than the road (factor < 1) for a sense of depth.
        function bgXs(spacing, factor) {
            const arr = [];
            const start = Math.floor((cameraX * factor - 100) / spacing);
            const end = Math.ceil((cameraX * factor + canvas.width + 100) / spacing);
            for (let i = start; i <= end; i++) arr.push(i * spacing - cameraX * factor);
            return arr;
        }

        function drawCity(baseY) {
            const night = theme.isNight;
            const xs = bgXs(210, 0.3);
            for (let i = 0; i < xs.length; i++) {
                const x = xs[i];
                const bw = 120 + ((i * 37) % 5) * 24;
                const bh = 90 + ((i * 53) % 4) * 36;
                ctx.fillStyle = night ? '#2a2a52' : 'rgba(122, 111, 160, 0.6)';
                ctx.fillRect(x, baseY - bh, bw, bh);
                if ((i % 3) === 0) {
                    ctx.fillStyle = night ? '#3a3a66' : 'rgba(138, 130, 168, 0.8)';
                    ctx.fillRect(x + bw / 2 - 16, baseY - bh - 18, 32, 18);
                }
                ctx.fillStyle = night ? '#FFD23F' : '#FFF8ED';
                for (let wy = baseY - bh + 14; wy < baseY - 16; wy += 24) {
                    for (let wx = x + 12; wx < x + bw - 16; wx += 26) {
                        if (((wx / 13) + (wy / 17)) % 3 < 1) {
                            ctx.fillRect(wx, wy, 10, 14);
                        }
                    }
                }
            }
            if (night) {
                ctx.fillStyle = '#FFF8ED';
                ctx.beginPath();
                ctx.arc(150, 76, 30, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#1a1a3a';
                ctx.beginPath();
                ctx.arc(162, 70, 24, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function drawSunflowers(baseY) {
            const xs = bgXs(230, 0.45);
            for (let i = 0; i < xs.length; i++) {
                const x = xs[i];
                const sh = 72 + ((i * 31) % 3) * 24;
                ctx.strokeStyle = '#4c9e2f';
                ctx.lineWidth = 6;
                ctx.beginPath();
                ctx.moveTo(x, baseY);
                ctx.lineTo(x, baseY - sh);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(x, baseY - sh + 26);
                ctx.quadraticCurveTo(x + 20, baseY - sh + 16, x + 24, baseY - sh + 6);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(x, baseY - sh + 46);
                ctx.quadraticCurveTo(x - 20, baseY - sh + 40, x - 24, baseY - sh + 26);
                ctx.stroke();
                for (let p = 0; p < 10; p++) {
                    const a = (p / 10) * Math.PI * 2;
                    ctx.fillStyle = '#ffd23f';
                    ctx.beginPath();
                    ctx.ellipse(x + Math.cos(a) * 21, baseY - sh + Math.sin(a) * 21, 10, 5, a, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.fillStyle = '#8a5a1c';
                ctx.beginPath();
                ctx.arc(x, baseY - sh, 12, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function drawAutumnTrees(baseY) {
            const xs = bgXs(300, 0.4);
            for (let i = 0; i < xs.length; i++) {
                const x = xs[i];
                const th = 100 + ((i * 41) % 4) * 30;
                ctx.fillStyle = '#7b4b3a';
                ctx.fillRect(x - 8, baseY - th + 36, 16, th - 36);
                ctx.fillStyle = ['#cc5500', '#d88000', '#e8a020'][i % 3];
                ctx.beginPath();
                ctx.arc(x, baseY - th + 10, 54, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(x - 38, baseY - th + 34, 38, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(x + 38, baseY - th + 34, 38, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function drawSnowPines(baseY) {
            const xs = bgXs(260, 0.4);
            for (let i = 0; i < xs.length; i++) {
                const x = xs[i];
                const ph = 92 + ((i * 29) % 4) * 28;
                ctx.fillStyle = '#2f6f46';
                for (let l = 0; l < 3; l++) {
                    const half = 44 - l * 12;
                    const botY = baseY - l * (ph / 3);
                    const topY = baseY - (l + 1) * (ph / 3);
                    ctx.beginPath();
                    ctx.moveTo(x - half, botY);
                    ctx.lineTo(x + half, botY);
                    ctx.lineTo(x, topY);
                    ctx.closePath();
                    ctx.fill();
                    ctx.fillStyle = '#ffffff';
                    ctx.beginPath();
                    ctx.moveTo(x - half * 0.55, botY - 5);
                    ctx.lineTo(x + half * 0.55, botY - 5);
                    ctx.lineTo(x, topY);
                    ctx.closePath();
                    ctx.fill();
                    ctx.fillStyle = '#2f6f46';
                }
                ctx.fillStyle = '#6b4423';
                ctx.fillRect(x - 5, baseY - 12, 10, 12);
            }
        }

        function drawMountainScape(baseY) {
            const peaks = bgXs(460, 0.2);
            for (let i = 0; i < peaks.length; i++) {
                const x = peaks[i];
                const ph = 150 + ((i * 61) % 3) * 60;
                ctx.fillStyle = '#8a98a8';
                ctx.beginPath();
                ctx.moveTo(x - 230, baseY);
                ctx.lineTo(x, baseY - ph);
                ctx.lineTo(x + 230, baseY);
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.moveTo(x - 80, baseY - ph + 42);
                ctx.lineTo(x, baseY - ph);
                ctx.lineTo(x + 80, baseY - ph + 42);
                ctx.closePath();
                ctx.fill();
            }
            const pines = bgXs(240, 0.5);
            for (let i = 0; i < pines.length; i++) {
                const x = pines[i];
                const ph = 58 + ((i * 37) % 3) * 22;
                ctx.fillStyle = '#2f6f46';
                ctx.beginPath();
                ctx.moveTo(x - 22, baseY);
                ctx.lineTo(x + 22, baseY);
                ctx.lineTo(x, baseY - ph);
                ctx.closePath();
                ctx.fill();
            }
        }

        function drawDesert(baseY) {
            const pyr = bgXs(520, 0.3);
            for (let i = 0; i < pyr.length; i++) {
                const x = pyr[i];
                const ph = 110 + ((i * 43) % 3) * 42;
                ctx.fillStyle = ['#e0b060', '#d0a050', '#c89848'][i % 3];
                ctx.beginPath();
                ctx.moveTo(x - 130, baseY);
                ctx.lineTo(x, baseY - ph);
                ctx.lineTo(x + 130, baseY);
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = 'rgba(0,0,0,0.1)';
                ctx.beginPath();
                ctx.moveTo(x, baseY - ph);
                ctx.lineTo(x + 130, baseY);
                ctx.lineTo(x, baseY);
                ctx.closePath();
                ctx.fill();
            }
            const cacti = bgXs(240, 0.5);
            for (let i = 0; i < cacti.length; i++) {
                const x = cacti[i];
                const ch = 54 + ((i * 29) % 3) * 16;
                ctx.fillStyle = '#3f8f3f';
                ctx.fillRect(x - 7, baseY - ch, 14, ch);
                ctx.fillRect(x - 22, baseY - ch + 14, 10, 20);
                ctx.fillRect(x + 12, baseY - ch + 8, 10, 20);
            }
        }

        function drawPalms(baseY, t) {
            const xs = bgXs(400, 0.4);
            for (let i = 0; i < xs.length; i++) {
                const x = xs[i];
                const ph = 90 + ((i * 31) % 4) * 20;
                ctx.fillStyle = '#8a5a33';
                ctx.fillRect(x - 4, baseY - ph, 8, ph);
                ctx.beginPath();
                ctx.ellipse(x + 2, baseY - ph, 11, 6, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = theme.palmColor || '#2f9e44';
                for (let k = 0; k < 6; k++) {
                    const a = -Math.PI + k * 0.55 + Math.sin(t + i) * 0.03;
                    ctx.save();
                    ctx.translate(x + 2, baseY - ph);
                    ctx.rotate(a);
                    ctx.beginPath();
                    ctx.ellipse(31, 0, 28, 8, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
            }
        }

        function drawBeach(baseY) {
            // sea band + waves just above the road
            ctx.fillStyle = '#3f9bd0';
            ctx.fillRect(0, baseY - 34, canvas.width, 34);
            ctx.strokeStyle = 'rgba(255,255,255,0.55)';
            ctx.lineWidth = 4;
            for (let i = 0; i < 7; i++) {
                const wx = (i * 190 + cameraX * 0.3) % (canvas.width + 90) - 45;
                ctx.beginPath();
                ctx.arc(wx, baseY - 26, 10, Math.PI, 0);
                ctx.stroke();
            }
            // lighthouse
            const xs = bgXs(720, 0.35);
            for (let i = 0; i < xs.length; i++) {
                const x = xs[i];
                const lh = 118;
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(x - 16, baseY - 34 - lh, 32, lh);
                ctx.fillStyle = '#e52521';
                ctx.fillRect(x - 16, baseY - 34 - lh + 24, 32, 22);
                ctx.fillRect(x - 16, baseY - 34 - lh + 68, 32, 22);
                ctx.fillStyle = '#FFD23F';
                ctx.beginPath();
                ctx.arc(x, baseY - 34 - lh - 16, 11, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function drawCosmic(baseY) {
            const xs = bgXs(760, 0.25);
            for (let i = 0; i < xs.length; i++) {
                const x = xs[i];
                const cy = 70 + ((i * 47) % 3) * 40;
                const r = 24 + ((i * 31) % 3) * 12;
                ctx.fillStyle = ['#a070ff', '#4fc3f7', '#ff6f91'][i % 3];
                ctx.beginPath();
                ctx.arc(x, cy, r, 0, Math.PI * 2);
                ctx.fill();
                if (i % 2 === 0) {
                    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
                    ctx.lineWidth = 6;
                    ctx.beginPath();
                    ctx.ellipse(x, cy, r * 1.6, r * 0.42, -0.35, 0, Math.PI * 2);
                    ctx.stroke();
                }
                ctx.fillStyle = 'rgba(0,0,0,0.18)';
                ctx.beginPath();
                ctx.arc(x - r * 0.3, cy - r * 0.2, 4, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(x + r * 0.25, cy + r * 0.3, 3, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.fillStyle = '#FFF8ED';
            ctx.beginPath();
            ctx.arc(150, 72, 34, 0, Math.PI * 2);
            ctx.fill();
        }

        function drawFalling(t, kind) {
            if (kind === 'snow') {
                ctx.fillStyle = '#ffffff';
                for (let i = 0; i < 22; i++) {
                    const x = ((i * 173 + t * 40) % (canvas.width + 40)) - 20 + Math.sin(t * 2 + i) * 8;
                    const y = ((i * 97 + t * 55) % (canvas.height + 40)) - 20;
                    ctx.beginPath();
                    ctx.arc(x, y, 3, 0, Math.PI * 2);
                    ctx.fill();
                }
            } else if (kind === 'leaves') {
                for (let i = 0; i < 20; i++) {
                    const x = ((i * 191 + t * 45) % (canvas.width + 40)) - 20 + Math.sin(t * 1.5 + i * 2) * 12;
                    const y = ((i * 113 + t * 60) % (canvas.height + 40)) - 20;
                    ctx.fillStyle = i % 3 === 0 ? '#cc5500' : '#d88000';
                    ctx.beginPath();
                    ctx.ellipse(x, y, 5, 3, Math.sin(t + i) * 0.8, 0, Math.PI * 2);
                    ctx.fill();
                }
            } else if (kind === 'bubbles') {
                for (let i = 0; i < 16; i++) {
                    const x = ((i * 229 + t * 20) % (canvas.width + 40)) - 20;
                    const y = canvas.height - ((i * 137 + t * 40) % (canvas.height + 40)) + 20;
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
                    ctx.beginPath();
                    ctx.arc(x, y, 5 + (i % 3) * 3, 0, Math.PI * 2);
                    ctx.fill();
                }
            } else if (kind === 'confetti') {
                for (let i = 0; i < 24; i++) {
                    const x = ((i * 149 + t * 55) % (canvas.width + 40)) - 20;
                    const y = canvas.height - ((i * 97 + t * 60) % (canvas.height + 40)) + 20;
                    ctx.fillStyle = ['#FFD23F', '#FF6F91', '#67C971', '#4FC3F7'][i % 4];
                    ctx.save();
                    ctx.translate(x, y);
                    ctx.rotate(t * 3 + i);
                    ctx.fillRect(-4, -2, 8, 4);
                    ctx.restore();
                }
            }
        }

        function drawGulls(t) {
            ctx.strokeStyle = 'rgba(255,255,255,0.85)';
            ctx.lineWidth = 3;
            for (let i = 0; i < 5; i++) {
                const x = ((i * 211 + t * 60) % (canvas.width + 80)) - 40;
                const y = 40 + (i % 3) * 26 + Math.sin(t * 2 + i) * 6;
                ctx.beginPath();
                ctx.moveTo(x - 10, y);
                ctx.quadraticCurveTo(x - 4, y - 8, x, y);
                ctx.quadraticCurveTo(x + 4, y - 8, x + 10, y);
                ctx.stroke();
            }
        }

        function drawDecor(t) {
            if (cfg.drawDecor) { cfg.drawDecor(ctx, t, cameraX, canvas, theme); return; }
            const baseY = roadTopY();
            switch (theme.decor) {
                case 'city': drawCity(baseY); break;
                case 'sunflower': drawSunflowers(baseY); break;
                case 'leaves': drawAutumnTrees(baseY); drawFalling(t, 'leaves'); break;
                case 'snow': drawSnowPines(baseY); drawFalling(t, 'snow'); break;
                case 'mountains': drawMountainScape(baseY); break;
                case 'desert': drawDesert(baseY); break;
                case 'palms': drawPalms(baseY, t); break;
                case 'beach': drawBeach(baseY); drawGulls(t); break;
                case 'cosmic': drawCosmic(baseY); break;
                case 'bubbles': drawFalling(t, 'bubbles'); break;
                case 'confetti': drawFalling(t, 'confetti'); break;
            }
        }

        function draw() {
            ctx.fillStyle = theme.bgSky;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const t = Date.now() / 1000;

            if (mode === 'drive') window.AdventureModes.drawRoad(ctx, theme, roadTopY, t, cameraX, canvas);

            if (cfg.decorBehind) drawDecor(t);

            ctx.save();
            ctx.translate(-cameraX, 0);

            if (theme.isNight) {
                ctx.fillStyle = '#ffffff';
                for (let sx = 100; sx < 7000; sx += 400) {
                    ctx.fillRect(sx, 40, 4, 4);
                    ctx.fillRect(sx + 120, 90, 4, 4);
                }
            }

            if (!theme.noHills) {
                ctx.fillStyle = theme.hillColor;
                for (let hx = 300; hx < 7200; hx += 800) {
                    ctx.beginPath();
                    ctx.arc(hx, mode === 'drive' ? roadTopY() + 40 : canvas.height, 170, Math.PI, 0);
                    ctx.fill();
                }
            }

            if (!theme.noClouds) {
                ctx.fillStyle = theme.isNight ? 'rgba(255, 255, 255, 0.3)' : '#ffffff';
                for (let cx = 200; cx < 7200; cx += 550) {
                    ctx.beginPath();
                    ctx.arc(cx, 80, 45, 0, Math.PI * 2);
                    ctx.arc(cx + 40, 70, 55, 0, Math.PI * 2);
                    ctx.arc(cx + 80, 80, 45, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            if (mode === 'ground') {
                window.AdventureModes.drawPitHazards(ctx, theme, t, canvas);
                platforms.forEach(p => {
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(p.x - 4, p.y - 4, p.width + 8, p.height + 8);
                    ctx.fillStyle = p.color;
                    ctx.fillRect(p.x, p.y, p.width, p.height);
                    drawPaperStitchLine(p.x + 10, p.y + p.height / 2, p.x + p.width - 10, p.y + p.height / 2);
                });
                movingPlatforms.forEach(mp => {
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(mp.x - 4, mp.y - 4, mp.width + 8, mp.height + 8);
                    ctx.fillStyle = mp.color;
                    ctx.fillRect(mp.x, mp.y, mp.width, mp.height);
                    drawPaperStitchLine(mp.x + 10, mp.y + mp.height / 2, mp.x + mp.width - 10, mp.y + mp.height / 2);
                });

                pipes.forEach(pipe => {
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(pipe.x - 4, pipe.y - 4, pipe.width + 8, pipe.height + 8);
                    ctx.fillStyle = theme.pipeColor;
                    ctx.fillRect(pipe.x, pipe.y, pipe.width, pipe.height);
                    ctx.fillRect(pipe.x - 6, pipe.y, pipe.width + 12, 24);
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                    ctx.fillRect(pipe.x + 6, pipe.y + 24, 8, pipe.height - 24);
                    ctx.fillRect(pipe.x, pipe.y, 8, 24);
                });

                mice.forEach(mouse => {
                    if (!mouse.visible) return;
                    ctx.save();
                    ctx.beginPath();
                    ctx.rect(mouse.x - 32, 0, 64, mouse.pipeY);
                    ctx.clip();
                    ctx.translate(mouse.x, mouse.y);
                    window.AdventureModes.drawEnemy(ctx, theme.enemy);
                    ctx.restore();
                });
            } else {
                obstacles.forEach(o => window.AdventureModes.drawObstacle(ctx, o.type, o));
            }

            coins.forEach(c => {
                if (!c.collected) {
                    const bob = Math.sin(t * 2.2 + c.x * 0.05) * 5;
                    const cy = c.y + bob;
                    ctx.save();
                    ctx.globalAlpha = 1;
                    ctx.font = (cfg.pickupFontSize || 54) + 'px "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(theme.collectible, c.x, cy + 1);
                    drawSparkle(c.x, cy);
                    ctx.restore();
                }
            });

            window.AdventureModes.drawGoalFinish(ctx, goal);

            if (mode === 'drive') {
                ctx.fillStyle = 'rgba(0,0,0,0.18)';
                ctx.beginPath();
                ctx.ellipse(player.x + player.width / 2, player.y + player.height + 3, player.width * 0.42, 6, 0, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.save();
            const carBob = mode === 'drive' ? Math.sin(t * 10) * 2 : 0;
            const heroBob = cfg.heroBob ? Math.sin(t * 6) * cfg.heroBob : 0;
            ctx.translate(player.x + player.width / 2, player.y + player.height / 2 + carBob + heroBob);
            ctx.globalAlpha = 1;
            if (mode === 'drive') {
                if (heroImage && heroImage.complete && heroImage.naturalWidth) {
                    const imageHeight = player.width * heroImage.naturalHeight / heroImage.naturalWidth;
                    ctx.filter = cfg.heroFilter || 'none';
                    ctx.drawImage(heroImage, -player.width / 2, player.height / 2 - imageHeight, player.width, imageHeight);
                    ctx.filter = 'none';
                } else {
                    window.AdventureModes.drawDriveCar(ctx, player.width, player.height, 0);
                }
            } else {
                ctx.scale((cfg.heroFlip ? !player.facingRight : player.facingRight) ? 1 : -1, player.squish);
                if (cfg.drawHero) {
                    ctx.translate(0, -3);
                    cfg.drawHero(ctx, heroType, player.facingRight, player.width, player.height);
                } else {
                    ctx.font = (cfg.heroFontSize || 48) + 'px "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(cfg.hero, 0, 0);
                }
            }
            ctx.restore();

            particles.forEach(p => {
                ctx.save();
                ctx.globalAlpha = p.alpha;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });

            ctx.restore();

            if (!cfg.decorBehind) drawDecor(t);
        }

        // --- Hero picker ---
        let heroType = cfg.heroType || cfg.hero || null;
        function setHeroType(type) {
            heroType = type;
            initAudio();
            if (cfg.onHeroChosen) cfg.onHeroChosen(type);
        }
        function maybePickHero() {
            if (!cfg.pickHero) return;
            setPaused(true);
            if (cfg.onHeroNeeded) cfg.onHeroNeeded(game);
        }

        // --- Loop ---
        function setPaused(p) {
            if (p === paused) return;
            paused = p;
            if (!p) requestAnimationFrame(loop);
        }

        function loop() {
            if (paused) return;
            update();
            draw();
            requestAnimationFrame(loop);
        }

        document.addEventListener('visibilitychange', () => setPaused(document.hidden));
        window.addEventListener('blur', () => setPaused(true));
        window.addEventListener('focus', () => setPaused(false));

        const game = {
            worldOrder,
            levels: cfg.levels,
            keys,
            mode,
            loadWorld,
            nextLevel,
            setPaused,
            update,
            draw,
            get worldPos() { return worldPos; },
            get coinCount() { return coinCount; },
            get cameraX() { return cameraX; },
            get levelCompleted() { return levelCompleted; },
            get player() { return player; },
            get obstacles() { return obstacles; },
            get platforms() { return platforms; },
            get coins() { return coins; },
            get mice() { return mice; },
            get goal() { return goal; },
            get theme() { return theme; },
            get music() { return cfg.music; },
            get lastHitAt() { return lastHitAt; },
            get bumpCount() { return bumpCount; },
            get heroType() { return heroType; },
            get paused() { return paused; },
            setHeroType,
        };
        window.__adv = game;

        loadWorld();
        loop();

        return game;
    }

    window.AdventureEngine = { create };
})();
