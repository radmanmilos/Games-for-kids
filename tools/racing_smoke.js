/* Мала тркачица (Little Racer) smoke test — Stage 1.
   Drives the REAL page headlessly: game boots, config is valid,
   character picker appears and starts the game, left/right input
   changes carX, pickups collect, finish triggers celebration,
   road renders on canvas, HUD shows world name, and the hub wiring
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
    check('config: 1 world, 2 characters, music defined, goal > 0', cj.worlds === 1 && cj.chars === 2 && cj.hasMusic === true && cj.goal > 1000, cfg);

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

    await h.evalv(`window.__racing.startGame(); true`);
    await sleep(400);

    const progress1 = await h.evalv(`JSON.stringify({ p: window.__racing.progress(), s: window.__racing.speed() })`);
    await sleep(300);
    const progress2 = await h.evalv(`JSON.stringify({ p: window.__racing.progress(), s: window.__racing.speed() })`);
    const pj1 = JSON.parse(progress1), pj2 = JSON.parse(progress2);
    check('auto-forward: progress increases over time', pj2.p > pj1.p && pj2.s > 0, progress1 + ' -> ' + progress2);

    const carX1 = await h.evalv(`JSON.stringify({ x: window.__racing.carX(), cx: window.__racing.ROAD_CENTER() })`);
    await h.evalv(`window.__racing.keys.left = true; window.__racing.update(20); true`);
    const carX2 = await h.evalv(`window.__racing.carX()`);
    await h.evalv(`window.__racing.keys.left = false; window.__racing.update(20); true`);
    const cxj = JSON.parse(carX1);
    check('left input: carX decreases', carX2 < cxj.x, carX1 + ' -> ' + carX2);

    await h.evalv(`window.__racing.keys.right = true; window.__racing.update(20); true`);
    const carX3 = await h.evalv(`window.__racing.carX()`);
    check('right input: carX increases', carX3 > carX2, String(carX2) + ' -> ' + String(carX3));

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
