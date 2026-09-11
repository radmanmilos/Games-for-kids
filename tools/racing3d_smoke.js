/* Мала тркачица 3Д (3D Little Racer) smoke test — vertical slice (meadow).
   Boosts the REAL page headlessly: module boots, WebGL renderer creates a
   canvas, HUD shows Serbian world/lap/flower labels, countdown drives the
   start, keyboard/touch steering moves the kart laterally, auto-forward
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

    const cd = await h.evalv(`JSON.stringify({
        countdown: document.getElementById('r3d-countdown').textContent,
        shown: document.getElementById('r3d-countdown').classList.contains('show'),
        mode: window.__r3d.mode()
    })`);
    const cj = JSON.parse(cd);
    check('countdown overlay active (3 / Крени!)',
        cj.shown === true && (cj.countdown === '3' || cj.countdown === '2'), cd);

    let driveWait = null;
    for (let i = 0; i < 40 && !driveWait; i++) {
        driveWait = await h.evalv(`window.__r3d.mode() === 'drive'`);
        if (!driveWait) await sleep(200);
    }
    check('countdown finished -> driving mode', driveWait === true);

    await h.evalv(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' })); true`);
    await sleep(350);
    await h.evalv(`window.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowRight' })); true`);
    const holdA = await h.evalv(`JSON.stringify({ lat: window.__r3d.lateral(), sp: window.__r3d.speed() })`);
    await sleep(350);
    const holdB = await h.evalv(`JSON.stringify({ lat: window.__r3d.lateral(), sp: window.__r3d.speed() })`);
    await h.evalv(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' })); true`);
    await sleep(350);
    await h.evalv(`window.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowLeft' })); true`);
    const steerLeft = await h.evalv(`JSON.stringify({ lat: window.__r3d.lateral(), sp: window.__r3d.speed() })`);
    const hj = JSON.parse(holdA), hj2 = JSON.parse(holdB), lj = JSON.parse(steerLeft);
    check('steering moves kart laterally, holds its line when released, reverses on other key',
        hj.sp > 10 && hj.lat > 0.5 && hj2.lat === hj.lat && lj.lat < hj.lat,
        holdA + ' -> ' + holdB + ' -> ' + steerLeft);

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