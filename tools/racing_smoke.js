/* Мала тркачица (Little Racer) smoke test — Stages 1-5.
   Drives the REAL page headlessly: game boots, config is valid,
   character picker appears and starts the game, left/right input
   changes carX, pickups collect, finish triggers celebration,
   road renders on canvas (curved, widened), pickups grow as they
   approach, HUD shows world name, and the hub wiring
   (button / navigation / standalone boot) is in place.
   Run:  node tools/racing_smoke.js
   Requires Node >= 22. CHROME_PATH env optional. */
const { start, check, getFails } = require('./headless.js');
const fs = require('fs');
const path = require('path');
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
    const h = await start({ page: '/pages/racing.html', tag: 'racing-smoke', width: 1100, height: 700 });

    let ready = false;
    for (let i = 0; i < 30 && !ready; i++) {
        ready = await h.evalv(`typeof window.__racing === 'object' && window.__racing !== null`);
        if (!ready) await sleep(200);
    }
    check('racing booted (window.__racing ready)', ready);

    const cfg = await h.evalv(`JSON.stringify({
        worlds: window.__racing.config.worlds.length,
        chars: window.__racing.config.characters.length,
        hasMusic: !!window.__racing.config.music[window.__racing.config.worlds[0].music],
        goal: window.__racing.finishLineDist,
        roadCenter: window.__racing.ROAD_CENTER()
    })`);
    const cj = JSON.parse(cfg);
    check('config: 8 worlds, 2 characters, music defined, goal > 0', cj.worlds === 8 && cj.chars === 2 && cj.hasMusic === true && cj.goal > 1000, cfg);

    const modal = await h.evalv(`document.getElementById('racing-char-modal').classList.contains('show')`);
    check('character picker modal shown at start', modal === true);

    await h.evalv(`document.querySelector('.racing-char-btn').click(); true`);
    await sleep(300);

    const started = await h.evalv(`JSON.stringify({
        running: typeof window.__racing.keys === 'object',
        worldName: document.getElementById('racing-world-name').textContent,
        modalHidden: !document.getElementById('racing-char-modal').classList.contains('show')
    })`);
    const sj = JSON.parse(started);
    check('character chosen: game started, picker hidden, world name shown', sj.running === true && sj.modalHidden === true && sj.worldName === 'Ливада', started);

    await h.evalv(`window.__racing.startGame(); window.__racing.skipCountdown(); true`);
    await sleep(400);

    const progress1 = await h.evalv(`JSON.stringify({ p: window.__racing.progress(), s: window.__racing.speed() })`);
    await sleep(300);
    const progress2 = await h.evalv(`JSON.stringify({ p: window.__racing.progress(), s: window.__racing.speed() })`);
    const pj1 = JSON.parse(progress1), pj2 = JSON.parse(progress2);
    check('auto-forward: progress increases over time', pj2.p > pj1.p && pj2.s > 0, progress1 + ' -> ' + progress2);

    const steerCheck = await h.evalv(`(() => {
        const a = window.__racing;
        const x0 = a.carX();
        a.keys.left = true;
        for (let i = 0; i < 10; i++) a.update(20);
        a.keys.left = false;
        const afterL = a.carX();
        a.keys.right = true;
        for (let i = 0; i < 10; i++) a.update(20);
        a.keys.right = false;
        const afterR = a.carX();
        return JSON.stringify({ x0, afterL, afterR, leftOK: afterL < x0, rightOK: afterR > afterL });
    })()`);
    const stj = JSON.parse(steerCheck);
    check('left/right input: steering moves the car left then right',
        stj.leftOK === true && stj.rightOK === true, steerCheck);

    await h.evalv(`window.__racing.keys.right = false; true`);
    const clamped = await h.evalv(`(() => {
        window.__racing.keys.right = true;
        for (let i = 0; i < 80; i++) window.__racing.update(20);
        const x = window.__racing.carX();
        const cx = window.__racing.ROAD_CENTER();
        const ml = window.__racing.maxLateral();
        return JSON.stringify({ x, cx, ml, bounded: Math.abs(x - cx) <= ml + 1 });
    })()`);
    const cj2 = JSON.parse(clamped);
    check('clamp: carX does not exceed road boundary', cj2.bounded === true, clamped);

    const lean = await h.evalv(`(() => {
        const a = window.__racing;
        a.restart(); a.startGame();
        a.keys.right = true;
        for (let i = 0; i < 6; i++) a.update(33);
        a.keys.right = false;
        const right = a.lean();
        a.keys.left = true;
        for (let i = 0; i < 12; i++) a.update(33);
        a.keys.left = false;
        const left = a.lean();
        for (let i = 0; i < 12; i++) a.update(33);
        const back = a.lean();
        return JSON.stringify({ right, left, back });
    })()`);
    const lj = JSON.parse(lean);
    check('camera juice: steering banks the view (positive/negative lean, settles back to center)',
        lj.right > 0.2 && lj.left < -0.2 && Math.abs(lj.back) < 0.05, lean);

    const beforeScore = await h.evalv(`(() => {
        window.__racing.restart();
        window.__racing.startGame();
        return JSON.stringify({ progress: window.__racing.progress(), score: window.__racing.score() });
    })()`);
    const bsj = JSON.parse(beforeScore);
    check('game resets: progress is 0, score is 0', bsj.progress === 0 && bsj.score === 0, beforeScore);

    const finish = await h.evalv(`(() => {
        const a = window.__racing;
        a.restart();
        a.startGame();
        a.obstacles().length = 0; // deterministic: no obstacle slowdown during the finish sim
        // Simulate reaching the finish line (~50s of game time, time-based)
        for (let i = 0; i < 3200; i++) {
            a.keys.left = false; a.keys.right = false;
            a.update(16);
            if (a.raceFinished()) break;
        }
        return JSON.stringify({
            progress: a.progress(),
            goal: a.finishLineDist,
            finished: a.raceFinished(),
            modal: document.getElementById('racing-win-modal').classList.contains('show')
        });
    })()`);
    const fj = JSON.parse(finish);
    check('finish: race completes, win modal shows', fj.finished === true && fj.modal === true, finish);

    const ctx = await h.evalv(`(() => {
        const cv = document.getElementById('racing-canvas');
        const c = cv.getContext('2d');
        // Read a pixel from the center of the canvas
        const d = c.getImageData(cv.width/2, cv.height/2, 1, 1).data;
        return d[0] + ',' + d[1] + ',' + d[2] + ',' + d[3];
    })()`);
    check('canvas renders content (non-transparent pixels at center)', ctx !== '0,0,0,0', ctx);

    const geo = await h.evalv(`JSON.stringify({
        W: window.__racing.W(), H: window.__racing.H(),
        cx: window.__racing.ROAD_CENTER(), bot: window.__racing.ROAD_BOTTOM_Y(),
        hor: window.__racing.HORIZON_Y()
    })`);
    const gj = JSON.parse(geo);
    check('geometry: road uses live canvas size (1100x700 -> center 550, bottom 630)',
        gj.W === 1100 && gj.H === 700 && gj.cx === 550 && gj.bot === 630, geo);

    const curves = await h.evalv(`(() => {
        const a = window.__racing;
        a.restart(); a.startGame();
        const offs = a.offs();
        a.update(32);
        let maxOff = 0;
        for (let i = 0; i < offs.length; i++) maxOff = Math.max(maxOff, Math.abs(offs[i]));
        const bend = Math.abs(a.roadCenterX(320) - a.ROAD_CENTER());
        return JSON.stringify({ maxOff, bend });
    })()`);
    const cuj = JSON.parse(curves);
    check('curves: road bends ahead (lateral offset present)', cuj.maxOff > 0.05 && cuj.bend > 5, curves);

    const hills = await h.evalv(`(() => {
        const a = window.__racing;
        a.restart(); a.startGame(); a.skipCountdown();
        const hor = a.HORIZON_Y(), bot = a.ROAD_BOTTOM_Y();
        const flatY = (d) => bot - ((bot - hor) * d / 400);
        let maxDev = 0;
        for (let t = 0; t < 12; t++) {
            for (let i = 0; i < 15; i++) a.update(16);
            for (let d = 40; d <= 380; d += 20) {
                maxDev = Math.max(maxDev, Math.abs(a.roadY(d) - flatY(d)));
            }
        }
        return JSON.stringify({ maxDev, cam: (a.hillStrength() > 0) });
    })()`);
    const hlj = JSON.parse(hills);
    check('hills: road rises/falls above the flat baseline (vertical profile varies)',
        hlj.maxDev > 8 && hlj.cam === true, hills);

    const psz = await h.evalv(`(() => {
        const a = window.__racing;
        const far = a.pickupSizeAt(380);
        const mid = a.pickupSizeAt(190);
        const near = a.pickupSizeAt(20);
        return JSON.stringify({ far, mid, near });
    })()`);
    const psj = JSON.parse(psz);
    check('pickups grow as they approach (small far, big near)', psj.far < psj.mid && psj.mid < psj.near, psz);

    const worldSwitch = await h.evalv(`(() => {
        const a = window.__racing;
        a.restart();
        // Open the worlds picker first, then choose 'space' (index 5)
        document.getElementById('racing-worlds-btn').click();
        document.querySelectorAll('.racing-world-btn')[5].click();
        a.restart();
        return JSON.stringify({
            goal: a.finishLineDist,
            name: document.getElementById('racing-world-name').textContent,
            expectGoal: a.config.worlds[5].goal,
            expectName: a.config.worlds[5].name,
            goalMatches: a.finishLineDist === a.config.worlds[5].goal
        });
    })()`);
    const wsj = JSON.parse(worldSwitch);
    check('world switch: finish line and label follow the chosen world', wsj.goalMatches === true && wsj.name === wsj.expectName, worldSwitch);

    const obstacleCfg = await h.evalv(`JSON.stringify({
        types: Object.keys(window.__racing.config.obstacleTypes).length,
        keys: Object.keys(window.__racing.config.obstacleTypes),
        worlds: window.__racing.config.worlds.map(w => ({ k: w.key, d: w.obstacleDensity, h: w.hillStrength, t: (w.obstacleTypes || []).join(',') }))
    })`);
    const ocfg = JSON.parse(obstacleCfg);
    check('obstacle config: 3 types, every world has density + types',
        ocfg.types === 3 && ocfg.keys.includes('puddle') && ocfg.keys.includes('rock') && ocfg.keys.includes('barricade') &&
        ocfg.worlds.every(w => typeof w.d === 'number' && w.d > 0 && w.t.length > 0), obstacleCfg);
    check('hills: every world has a numeric hillStrength (non-negative, bounded)',
        ocfg.worlds.every(w => typeof w.h === 'number' && w.h >= 0 && w.h <= 2), obstacleCfg);

    const obstacleSpawn = await h.evalv(`(() => {
        // Switch to jungle (has all 3 obstacle types) via the picker for determinism
        document.getElementById('racing-worlds-btn').click();
        document.querySelectorAll('.racing-world-btn')[4].click();
        const a = window.__racing;
        const obs = a.obstacles();
        let ok = obs.length > 0;
        const rockCount = obs.filter(o => o.type === 'rock').length;
        for (const o of obs) {
            if (o.lane !== -1 && o.lane !== 1) ok = false;
            if (!a.config.obstacleTypes[o.type]) ok = false;
            if (o.dist >= a.finishLineDist - 300) ok = false;
        }
        return JSON.stringify({ count: obs.length, ok, rockCount, types: [...new Set(obs.map(o => o.type))].join(',') });
    })()`);
    const osj = JSON.parse(obstacleSpawn);
    check('obstacles: spawn on road, valid lanes/types, rocks present in jungle', osj.ok === true && osj.count > 0 && osj.rockCount > 0, obstacleSpawn);

    const puddle = await h.evalv(`(() => {
        const a = window.__racing;
        a.restart(); a.startGame();
        const base = a.speed();
        a.triggerObstacle('puddle');
        const slowed = a.speed();
        a.triggerObstacle('puddle'); // same-type cooldown must block
        const doubleHit = a.speed();
        let d = 0; while (d < 2000) { a.update(16); d += 16; }
        const recovered = a.speed();
        return JSON.stringify({ base, slowed, doubleHit, recovered });
    })()`);
    const pj = JSON.parse(puddle);
    check('puddle: halves speed, cooldown blocks re-hit, then recovers',
        Math.abs(pj.slowed - pj.base * 0.5) < 0.001 && pj.doubleHit === pj.slowed && pj.recovered >= pj.base, puddle);

    const rock = await h.evalv(`(() => {
        const a = window.__racing;
        const before = a.obstacles().length;
        const rockObs = a.obstacles().find(o => o.type === 'rock');
        if (!rockObs) return JSON.stringify({ ok: false, why: 'no rock spawned' });
        a.triggerObstacle('rock', rockObs);
        const after = a.obstacles().length;
        return JSON.stringify({ ok: after === before - 1 && a.speed() === 0, before, after, speed: a.speed() });
    })()`);
    const rj = JSON.parse(rock);
    check('rock: stops car (speed 0) and crumbles away', rj.ok === true, rock);

    const barricade = await h.evalv(`(() => {
        const a = window.__racing;
        a.restart(); a.startGame();
        for (let i = 0; i < 3; i++) a.update(600);
        const p1 = a.progress();
        const s1 = a.speed();
        a.triggerObstacle('barricade');
        const p2 = a.progress();
        const s2 = a.speed();
        return JSON.stringify({ p1, p2, s1, s2 });
    })()`);
    const bj = JSON.parse(barricade);
    check('barricade: knocks progress back ~50 and slows the car',
        Math.abs(bj.p1 - bj.p2 - 50) < 0.001 && bj.s2 < bj.s1, barricade);

    const collide = await h.evalv(`(() => {
        const a = window.__racing;
        a.restart(); a.startGame();
        // Deterministic harness: flatten the curve so lane offsets are static,
        // then steer the car onto the obstacle and let it approach.
        a.offs().fill(0);
        a.config.worlds.forEach(w => w.hillStrength = 0);
        a.obstacles().length = 0;
        const sd0 = 200;
        const obs = { dist: Math.round(a.progress()) + sd0, lane: -1, type: 'puddle', hitCd: 0 };
        a.obstacles().push(obs);
        const w = a.W() * 0.34 * 300 / (300 + sd0);
        const targetX = a.ROAD_CENTER() - 0.32 * w; // obstacle x with curve flattened
        a.keys.left = true;
        for (let i = 0; i < 24; i++) a.update(16);
        a.keys.left = false;
        const carAt = a.carX();
        const aimed = Math.abs(carAt - targetX);
        let hit = null;
        for (let i = 0; i < 200 && !hit; i++) {
            a.update(16);
            const st = a.slowdownState();
            if (st && st.type === 'puddle') hit = st;
        }
        return JSON.stringify({ aimed, targetX, carAt, hitType: hit ? hit.type : null, cd: obs.hitCd });
    })()`);
    const cjCol = JSON.parse(collide);
    check('collision: steering into an obstacle triggers the slowdown via update()',
        cjCol.hitType === 'puddle' && cjCol.aimed < 60 && cjCol.cd === 600, collide);

    const boostCfg = await h.evalv(`(() => {
        const a = window.__racing;
        a.restart(); a.startGame(); a.skipCountdown();
        const bs = a.boosts();
        let ok = bs.length > 0;
        for (const b of bs) {
            if (b.lane !== -1 && b.lane !== 1) ok = false;
            if (b.dist < 500 || b.dist >= a.finishLineDist - 500) ok = false;
        }
        return JSON.stringify({ count: bs.length, ok });
    })()`);
    const bcj = JSON.parse(boostCfg);
    check('boosts: pads spawn on track (valid lanes, clear of start/finish)', bcj.ok === true && bcj.count > 0, boostCfg);

    const boostHit = await h.evalv(`(() => {
        const a = window.__racing;
        a.restart(); a.startGame(); a.skipCountdown();
        a.offs().fill(0);
        a.config.worlds.forEach(w => w.hillStrength = 0);
        a.obstacles().length = 0;
        const bs = a.boosts();
        bs.length = 0;
        const before = a.speed();
        bs.push({ dist: Math.round(a.progress()) + 120, lane: 0, hitCd: 0, used: false });
        const p0 = a.particles().length;
        for (let i = 0; i < 160 && !bs[0].used; i++) {
            a.keys.left = false; a.keys.right = false;
            a.update(16);
        }
        const after = a.speed();
        return JSON.stringify({ before, after, used: bs[0].used, puffsGrown: a.particles().length > p0 + 3 });
    })()`);
    const bhj = JSON.parse(boostHit);
    check('boost: pad boosts the car (speed jumps) and emits flame particles',
        bhj.used === true && bhj.after > bhj.before * 1.3 && bhj.puffsGrown === true, boostHit);

    const dust = await h.evalv(`(() => {
        const a = window.__racing;
        a.restart(); a.startGame(); a.skipCountdown();
        a.config.worlds.forEach(w => w.hillStrength = 0);
        const p0 = a.particles().length;
        a.keys.right = true;
        for (let i = 0; i < 40; i++) a.update(16);
        a.keys.right = false;
        return JSON.stringify({ skid: a.skid(), dust: a.particles().length - p0 });
    })()`);
    const dj = JSON.parse(dust);
    check('particles: steering churns wheel dust and leaves skid marks',
        dj.skid > 0 && dj.dust > 0, dust);

    const carJuice = await h.evalv(`(() => {
        const a = window.__racing;
        a.restart(); a.startGame(); a.skipCountdown();
        const b0 = a.bobPhase();
        const p0 = a.progress();
        for (let i = 0; i < 20; i++) a.update(16);
        return JSON.stringify({ bobDelta: a.bobPhase() - b0, spin: (a.progress() - p0) * 0.05 });
    })()`);
    const cjJ = JSON.parse(carJuice);
    check('car juice: suspension bobs and wheels roll while driving',
        cjJ.bobDelta > 0 && cjJ.spin > 0, carJuice);

    // ---- Stage 4: combos, progression, persistence ----
    // Reset progression to a clean state: earlier finish checks bumped the win counter.
    await h.evalv(`localStorage.removeItem('racingSave'); true`);
    await h.navigate(`http://127.0.0.1:${h.port}/pages/racing.html?reset=${Date.now()}`);
    let freshBoot = false;
    for (let i = 0; i < 30 && !freshBoot; i++) {
        freshBoot = await h.evalv(`typeof window.__racing === 'object' && window.__racing !== null`);
        if (!freshBoot) await sleep(200);
    }
    const comboData = await h.evalv(`JSON.stringify({
        chars: window.__racing.config.characters.map(c => ({
            id: c.id, short: !!c.short,
            cars: c.cars.map(car => ({ id: car.id, emoji: !!car.emoji, accel: typeof car.accel === 'number' }))
        })),
        unlock: window.__racing.unlockWins()
    })`);
    const c4 = JSON.parse(comboData);
    check('config: 2 drivers x 4 cars each with emoji+accel, unlock wins [0,2,4,7]',
        c4.chars.length === 2 && c4.chars.every(c => c.short && c.cars.length === 4 && c.cars.every(x => x.emoji && x.accel)) &&
        JSON.stringify(c4.unlock) === JSON.stringify([0, 2, 4, 7]), comboData);

    const comboGrid = await h.evalv(`(() => {
        const a = window.__racing;
        document.getElementById('racing-change-btn').click(); // reopen picker (hidden button, programmatic)
        a.restart(); // picker render is synchronous inside showCharacterPicker -> hide win modal state
        const cards = document.querySelectorAll('.racing-char-btn');
        return JSON.stringify({
            cards: cards.length,
            locked: document.querySelectorAll('.racing-char-btn.locked').length,
            unlocked: document.querySelectorAll('.racing-char-btn:not(.locked)').length,
            stats: document.getElementById('racing-char-stats').textContent
        });
    })()`);
    const c4g = JSON.parse(comboGrid);
    check('picker: 8 combo cards, only the first car of each driver unlocked at 0 wins',
        c4g.cards === 8 && c4g.locked === 6 && c4g.unlocked === 2 && c4g.stats.includes('0'), comboGrid);

    const winProg = await h.evalv(`(() => {
        const a = window.__racing;
        a.restart(); a.finishRace();
        a.restart(); a.finishRace();
        a.restart(); a.finishRace();
        return JSON.stringify({ wins: a.wins(), yarn: a.isUnlocked('kitty', 'yarn'), fish: a.isUnlocked('kitty', 'fish'), rocket: a.isUnlocked('kitty', 'rocket') });
    })()`);
    const w4 = JSON.parse(winProg);
    check('progression: 3 wins unlock the 2nd car (yarn), still lock the 3rd (fish) and 4th (rocket)',
        w4.wins === 3 && w4.yarn === true && w4.fish === false && w4.rocket === false, winProg);

    const comboPick = await h.evalv(`(() => {
        const a = window.__racing;
        a.restart();
        document.getElementById('racing-change-btn').click();
        const card = document.querySelector('.racing-char-btn[data-combo="kitty/yarn"]');
        if (!card) return JSON.stringify({ ok: false });
        card.click();
        document.getElementById('racing-worlds-btn').click();
        document.querySelectorAll('.racing-world-btn')[1].click();
        return JSON.stringify({ ok: true, sel: a.selection(), raw: localStorage.getItem('racingSave') });
    })()`);
    const p4 = JSON.parse(comboPick);
    check('selection: kitty/yarn combo + beach world saved to localStorage',
        p4.ok === true && p4.sel.char === 'kitty' && p4.sel.car === 'yarn' && p4.sel.world === 'beach' &&
        /"char":"kitty"/.test(p4.raw) && /"car":"yarn"/.test(p4.raw) && /"world":"beach"/.test(p4.raw), comboPick);

    await h.navigate(`http://127.0.0.1:${h.port}/pages/racing.html?t=${Date.now()}`);
    let reloaded = false;
    for (let i = 0; i < 30 && !reloaded; i++) {
        reloaded = await h.evalv(`typeof window.__racing === 'object' && window.__racing !== null`);
        if (!reloaded) await sleep(200);
    }
    const reloadState = await h.evalv(`(() => {
        const a = window.__racing;
        return JSON.stringify({
            sel: a.selection(),
            wins: a.wins(),
            stats: (document.getElementById('racing-char-stats') || {}).textContent || ''
        });
    })()`);
    const rs = JSON.parse(reloadState);
    check('persistence: after reload the driver/car/world + wins are restored',
        freshBoot === true && reloaded === true && rs.sel.char === 'kitty' && rs.sel.car === 'yarn' && rs.sel.world === 'beach' &&
        rs.wins === 3 && rs.stats.includes('3'), reloadState);

    // ---- Stage 5: countdown, engine hum, sparkles, accessibility, responsive ----
    const countdown = await h.evalv(`(() => {
        const a = window.__racing;
        a.skipCountdown();
        const ar = document.getElementById('racing-announcer');
        a.beginCountdown();
        const announced = ar.textContent;
        a.stepCountdown(1000);
        const s1 = a.countdown();
        a.stepCountdown(900);
        const s2 = a.countdown();
        a.stepCountdown(900);
        const s3 = a.countdown();
        a.stepCountdown(799);
        const s4 = a.countdown();
        a.stepCountdown(2);
        const s5 = a.countdown();
        return JSON.stringify({ announced, labels: [s1.label, s2.label, s3.label, s4.label], done: s5, left2: s4.left });
    })()`);
    const cd = JSON.parse(countdown);
    const cdLabels = JSON.stringify(cd.labels);
    check('countdown: deterministic 3-2-1-Крени! sequence with ms-exact steps + live ARIA text',
        cd.announced === 'три' && cdLabels === JSON.stringify([2, 1, 'go', 'go']) &&
        cd.left2 === 1 && cd.done.active === false && cd.done.label === null, countdown);

    const engine = await h.evalv(`JSON.stringify({
        active: window.__racing.engine().active,
        freq: window.__racing.engine().freq,
        rm: window.__racing.reducedMotion()
    })`);
    const ej = JSON.parse(engine);
    check('engine: exposes active/freq state, reduced-motion flag is a boolean',
        typeof ej.active === 'boolean' && (ej.freq === null || (ej.freq >= 70 && ej.freq <= 265)) &&
        typeof ej.rm === 'boolean', engine);

    const sparkles = await h.evalv(`(() => {
        const a = window.__racing;
        a.restart(); a.startGame(); a.skipCountdown();
        a.offs().fill(0);          // flatten the curve: lane x == road center
        a.config.worlds.forEach(w => w.hillStrength = 0);  // flatten the hills: vertical y == flat baseline
        a.obstacles().length = 0;  // no slowdown puffs during approach
        a.pickups().push({ dist: Math.round(a.progress()) + 120, lane: 0, collected: false });
        for (let i = 0; i < 120 && a.score() === 0; i++) {
            a.keys.left = false; a.keys.right = false;
            a.update(16);
        }
        return JSON.stringify({ score: a.score(), puffs: a.particles().length });
    })()`);
    const sj5 = JSON.parse(sparkles);
    check('pickup collect: scores and spawns sparkle particles',
        sj5.score > 0 && sj5.puffs >= 5, sparkles);

    const a11y = await h.evalv(`(() => {
        const a = window.__racing;
        a.announce('Тест објаве');
        const ar = document.getElementById('racing-announcer');
        const zones = document.querySelectorAll('.racing-zone').length;
        const inZone = document.querySelector('#racing-zone-left #racing-left') &&
            document.querySelector('#racing-zone-right #racing-right');
        const hint = document.getElementById('racing-landscape-hint');
        const hintDisplay = hint ? getComputedStyle(hint).display : 'missing';
        return JSON.stringify({ announced: ar.textContent === 'Тест објаве', live: ar.getAttribute('aria-live'), role: ar.getAttribute('role'), zones, inZone: !!inZone, hintDisplay });
    })()`);
    const aj = JSON.parse(a11y);
    check('a11y/responsive: sr-only live announcer, 2 thumb zones wrapping the buttons, portrait-only hint',
        aj.announced === true && aj.live === 'polite' && aj.role === 'status' &&
        aj.zones === 2 && aj.inZone === true && aj.hintDisplay === 'none', a11y);

    h.close();

    // Hub wiring checks
    const root = path.join(__dirname, '..');
    const indexHtml = fs.readFileSync(path.join(root, 'game', 'index.html'), 'utf8');
    check('hub button wired (data-go="game-racing")', indexHtml.includes('data-go="game-racing"'));
    const nav = fs.readFileSync(path.join(root, 'game', 'shared', 'navigation.js'), 'utf8');
    check('navigation route wired (game-racing -> racing.html)', nav.includes("'game-racing'") && nav.includes("'pages/racing.html'"));
    const main = fs.readFileSync(path.join(root, 'game', 'shared', 'main.js'), 'utf8');
    check('standalone boot wired (racing -> racing-back/startRacing)', main.includes("'racing': ['racing-back', 'startRacing'"));

    process.exit(getFails() ? 1 : 0);
})().catch(e => { console.error('racing_smoke crashed:', e); process.exit(1); });
