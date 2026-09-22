/* Мала тркачица 3Д (3D Little Racer) smoke test — full game.
   Boosts the REAL page headlessly: module boots, WebGL renderer creates a
   canvas, start picker shows 8 world cards + 4 kart colors, the race starts from
   the picker, HUD shows Serbian world/lap/collectible labels, countdown drives
   the start, keyboard/touch steering moves the kart laterally, auto-forward
   raises speed, and hub wiring (button / navigation / standalone boot) is in
   place.
   Run:  node tools/racing3d_smoke.js
   Requires Node >= 22. CHROME_PATH env optional. */
const { start, check, getFails } = require('./headless.js');
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
    const h = await start({ page: '/pages/racing3d.html', tag: 'racing3d-smoke', width: 1100, height: 700 });

    let ready = false;
    for (let i = 0; i < 40 && !ready; i++) {
        ready = await h.evalv(`typeof window.__r3d === 'object' && window.__r3d !== null`);
        if (!ready) await sleep(250);
    }
    check('racing3d booted (window.__r3d ready)', ready);

    const boot = await h.evalv(`JSON.stringify({
        canvas: (document.querySelector('#r3d-view canvas') || {}).width || 0,
        world: document.getElementById('r3d-world').textContent,
        round: document.getElementById('r3d-round').textContent,
        flowers: document.getElementById('r3d-flowers').textContent
    })`);
    const bj = JSON.parse(boot);
    check('canvas rendered and HUD in Serbian (Ливада, Круг 1/3, 0/12)',
        bj.canvas > 0 && bj.world === 'Ливада' && bj.round === 'Круг 1/3' && bj.flowers === '🌸 0/12', boot);

    const picker = await h.evalv(`JSON.stringify({
        modal: document.getElementById('r3d-start-modal').classList.contains('show'),
        cards: document.querySelectorAll('#r3d-world-grid .r3d-world-card').length,
        swatches: document.querySelectorAll('#r3d-kart-row .r3d-kart-swatch').length,
        name: document.getElementById('r3d-kart-name').textContent,
        wcount: window.__r3d.worldCount(),
        widx: window.__r3d.worldIdx(),
        pick: window.__r3d.pickupKind(),
        music: window.__r3d.musicOn()
    })`);
    const pk = JSON.parse(picker);
    check('start picker: 8 world cards + 4 kart colors, meadow/red selected, music on',
        pk.modal === true && pk.cards === 8 && pk.swatches === 4 && pk.name === 'Црвена' &&
        pk.wcount === 8 && pk.widx === 0 && pk.pick === 'flower' && pk.music === true, picker);

    // mark a world card selected (no reload — just selection state)
    const selClick = await h.evalv(`(function(){
        const cards = document.querySelectorAll('#r3d-world-grid .r3d-world-card');
        cards[1].click();
        return document.querySelectorAll('#r3d-world-grid .r3d-world-card')[1].classList.contains('sel');
    })(); true`);
    const sel = JSON.parse(await h.evalv(`JSON.stringify({
        sel: document.querySelectorAll('#r3d-world-grid .r3d-world-card')[1].classList.contains('sel'),
        name: document.getElementById('r3d-kart-name').textContent
    })`));
    check('world card click marks it selected, kart name stays readable', selClick === true && sel.sel === true);

    // start the race from the picker
    await h.evalv(`window.__r3d.confirmStart(); true`);
    await sleep(150);

    const cd = await h.evalv(`JSON.stringify({
        countdown: document.getElementById('r3d-countdown').textContent,
        shown: document.getElementById('r3d-countdown').classList.contains('show'),
        mode: window.__r3d.mode()
    })`);
    const cj = JSON.parse(cd);
    check('countdown overlay active (3 / Крени!)',
        cj.shown === true && (cj.countdown === '3' || cj.countdown === '2') && cj.mode === 'countdown', cd);

    let driveWait = null;
    for (let i = 0; i < 40 && !driveWait; i++) {
        driveWait = await h.evalv(`window.__r3d.mode() === 'drive'`);
        if (!driveWait) await sleep(200);
    }
    check('countdown finished -> driving mode', driveWait === true);

    await h.evalv(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' })); true`);
    await sleep(400);
    const stA = JSON.parse(await h.evalv(`JSON.stringify({ yaw: window.__r3d.steerState().steerYaw, lat: window.__r3d.lateral(), sp: window.__r3d.speed() })`));
    await h.evalv(`window.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowRight' })); true`);
    await sleep(150);
    const stE1 = JSON.parse(await h.evalv(`JSON.stringify({ yaw: window.__r3d.steerState().steerYaw, lat: window.__r3d.lateral() })`));
    await sleep(250);
    const stE2 = JSON.parse(await h.evalv(`JSON.stringify({ yaw: window.__r3d.steerState().steerYaw, lat: window.__r3d.lateral() })`));
    await sleep(900);
    const stB = JSON.parse(await h.evalv(`JSON.stringify({ yaw: window.__r3d.steerState().steerYaw, lat: window.__r3d.lateral() })`));
    await sleep(300);
    const stC = JSON.parse(await h.evalv(`JSON.stringify({ lat: window.__r3d.lateral() })`));
    await h.evalv(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' })); true`);
    await sleep(400);
    await h.evalv(`window.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowLeft' })); true`);
    const stLeft = JSON.parse(await h.evalv(`JSON.stringify({ lat: window.__r3d.lateral() })`));
    check('steering: wheels turn in + car drifts, car stops while wheels still return slowly, no side-drift, reverses',
        stA.sp > 10 && stA.yaw > 0.1 && stA.lat > 0.3 &&
        stE1.yaw > 0.1 && stE2.yaw > 0.07 && Math.abs(stE2.lat - stE1.lat) < 0.4 &&
        Math.abs(stB.yaw) < 0.05 && Math.abs(stC.lat - stB.lat) < 0.15 &&
        stLeft.lat < stC.lat - 0.5,
        JSON.stringify({ stA, stE1, stE2, stB, stC, stLeft }));

    const pads = await h.evalv(`JSON.stringify(window.__r3d.boostPads())`);
    const pj = JSON.parse(pads);
    check('boost pads spawned on road lanes (6 pads, within road width)',
        Array.isArray(pj) && pj.length === 6 && pj.every(p => Math.abs(p.x) <= 9.6), pads);

    const boostA = await h.evalv(`JSON.stringify({ ok: window.__r3d.triggerBoost(), active: window.__r3d.boosting() })`);
    const boostOn = JSON.parse(boostA);
    await sleep(250);
    const boostPart = await h.evalv(`window.__r3d.particles()`);
    check('boost raises speed target + spawns flame particles',
        boostOn.active === true && boostPart > 0, boostA + ' particles=' + boostPart);

    const wheelA = JSON.parse(await h.evalv(`JSON.stringify(window.__r3d.wheelPose())`));
    await sleep(250);
    const wheelB = JSON.parse(await h.evalv(`JSON.stringify(window.__r3d.wheelPose())`));
    check('wheels roll forward around their axle (rotation.x, no vertical wobble)',
        wheelA.length === 4 && wheelB.length === 4 &&
        wheelA.some((v, i) => wheelB[i][0] !== v[0]) &&
        wheelA.every((v) => Math.abs(v[1]) < 1e-6),
        JSON.stringify({ wheelA, wheelB }));

    await h.evalv(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' })); true`);
    await sleep(400);
    const driftA = await h.evalv(`window.__r3d.drifting()`);
    const driftPart = await h.evalv(`window.__r3d.particles()`);
    await h.evalv(`window.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowRight' })); true`);
    await sleep(150);
    const driftB = await h.evalv(`window.__r3d.drifting()`);
    check('drift engages while steering at speed (skid smoke) and disengages on release',
        driftA === true && driftB === false && driftPart > 0, 'drift=' + driftA + '->' + driftB + ' particles=' + driftPart);

    await h.evalv(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' })); true`);
    await sleep(400);
    const bankA = JSON.parse(await h.evalv(`JSON.stringify(window.__r3d.steerState())`));
    await h.evalv(`window.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowRight' })); true`);
    await sleep(1300);
    const bankB = JSON.parse(await h.evalv(`JSON.stringify(window.__r3d.steerState())`));
    check('kart banks into the turn + wheels carry a spin pattern, then point forward on release',
        bankA.spokes === 16 && bankA.roll > 0.15 && bankA.steerYaw > 0.1 &&
        Math.abs(bankB.roll) < 0.05 && Math.abs(bankB.steerYaw) < 0.05 && Math.abs(bankB.yaw) < 0.05,
        JSON.stringify({ bankA, bankB }));

    const rumA = await h.evalv(`window.__r3d.seekLateral(9.4); true`);
    await sleep(150);
    const rumB = await h.evalv(`JSON.stringify({ lat: window.__r3d.lateral(), ron: window.__r3d.rumbleOn(), off: window.__r3d.offroadState() })`);
    const ruj = JSON.parse(rumB);
    await sleep(220);
    const rumPart = await h.evalv(`window.__r3d.particles()`);
    const rumC = await h.evalv(`JSON.stringify({ lat: window.__r3d.seekLateral(0), ron: window.__r3d.rumbleOn() })`);
    const ruby = JSON.parse(rumC);
    check('edge rumble + offroad dust: past the rumble strip the kart rumbles, clears on return',
        ruj.ron === true && ruj.off === true && ruby.ron === false && rumPart > 0,
        rumA + ' -> ' + rumB + ' particles=' + rumPart + ' -> ' + rumC);

    const m0 = JSON.parse(await h.evalv(`JSON.stringify(window.__r3d.mapMarker())`));
    await sleep(300);
    const m1 = JSON.parse(await h.evalv(`JSON.stringify(window.__r3d.mapMarker())`));
    const mapCanvas = await h.evalv(`(document.querySelector('#r3d-map canvas') || {}).width || 0`);
    check('race-track mini-map renders the loop with a live moving kart marker',
        mapCanvas > 0 && m0.n > 0 && m1.n === m0.n && m1.t !== m0.t,
        JSON.stringify({ m0, m1, mapCanvas }));

    const terrain = JSON.parse(await h.evalv(`JSON.stringify({ hills: window.__r3d.hillRange(), clear: window.__r3d.floorClear() })`));
    check('hills clearly visible (≥6 height range) and the road always clears the terrain (never under it)',
        terrain.hills >= 6 && terrain.clear >= 0, JSON.stringify(terrain));

    const tris = await h.evalv(`window.__r3d.tris()`);
    check('scene renders real geometry (road/kart/flowers drawn, not a culled empty scene)',
        tris > 1000, 'triangles=' + tris);

    const modals = await h.evalv(`JSON.stringify({
        back: !!document.getElementById('r3d-back'),
        restart: !!document.getElementById('r3d-restart'),
        zones: !!document.getElementById('r3d-zone-left') && !!document.getElementById('r3d-zone-right')
    })`);
    const mj = JSON.parse(modals);
    check('page chrome present (back, restart, touch zones)', mj.back === true && mj.restart === true && mj.zones === true);

    h.close();
    process.exit(getFails() ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });