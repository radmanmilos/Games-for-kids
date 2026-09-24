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

    // batch 1 — frame-timing audit: steering must converge identically at 60 vs 120 Hz wall time
    const dtCheck = await h.evalv(`(function(){
        const r3d = window.__r3d;
        r3d.haltLoop(true);
        for (let i = 0; i < 40; i++) r3d.step(1 / 60);
        const b = r3d.steerState();
        const run = (dt, n) => {
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
            for (let i = 0; i < n; i++) r3d.step(dt);
            window.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowRight' }));
            for (let i = 0; i < n * 2; i++) r3d.step(dt);
            return r3d.steerState();
        };
        const A = run(1 / 120, 24);
        r3d.resetSteerState(b.steerYaw, 0, b.roll);
        const B = run(1 / 60, 12);
        r3d.haltLoop(false);
        return JSON.stringify({ A: A.steerYaw, B: B.steerYaw, rollA: A.roll, rollB: B.roll,
            dyaw: Math.abs(A.steerYaw - B.steerYaw), droll: Math.abs(A.roll - B.roll) });
    })()`);
    const dtj = JSON.parse(dtCheck);
    check('frame-timing: steering converged identically at simulated 60 Hz vs 120 Hz (dt-normalized easing)',
        dtj.dyaw < 0.02 && dtj.droll < 0.02, dtCheck);

    // batch 2 — touch/palm hardening: most-recent-wins + palm touches ignored
    const tpCheck = await h.evalv(`(function(){
        const r3d = window.__r3d;
        const zl = document.getElementById('r3d-zone-left');
        const zr = document.getElementById('r3d-zone-right');
        r3d.haltLoop(true);
        r3d.seekLateral(0);
        for (let i = 0; i < 20; i++) r3d.step(1 / 60);
        zr.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 1, bubbles: true, pointerType: 'touch', radiusX: 20 }));
        r3d.step(1 / 60); r3d.step(1 / 60);
        const latR = r3d.lateral();
        zl.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 2, bubbles: true, pointerType: 'touch', radiusX: 20 }));
        for (let i = 0; i < 6; i++) r3d.step(1 / 60);
        const latBoth = r3d.lateral();
        zr.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1, bubbles: true, pointerType: 'touch' }));
        r3d.step(1 / 60);
        const latL = r3d.lateral();
        zl.dispatchEvent(new PointerEvent('pointerup', { pointerId: 2, bubbles: true, pointerType: 'touch' }));
        for (let i = 0; i < 20; i++) r3d.step(1 / 60);
        const latBeforePalm = r3d.lateral();
        zr.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 9, bubbles: true, pointerType: 'touch', radiusX: 120 }));
        r3d.step(1 / 60); r3d.step(1 / 60);
        const latAfterPalm = r3d.lateral();
        zr.dispatchEvent(new PointerEvent('pointerup', { pointerId: 9, bubbles: true, pointerType: 'touch' }));
        r3d.haltLoop(false);
        return JSON.stringify({ latR, latBoth, latL, latBeforePalm, latAfterPalm });
    })()`);
    const tpj = JSON.parse(tpCheck);
    check('touch/palm hardening: most-recent press wins with both zones held, palm touches do not steer',
        tpj.latR > 0 && tpj.latBoth < tpj.latR - 0.1 && tpj.latL < tpj.latBoth &&
        Math.abs(tpj.latAfterPalm - tpj.latBeforePalm) < 0.1, tpCheck);

    // batch 3 — visibility pause + audio suspend (clean auto-resume)
    const visCheck = await h.evalv(`(function(){
        const r3d = window.__r3d;
        const before = r3d.musicPlaying();
        r3d.testVisibility(true);
        const afterHide = r3d.musicPlaying();
        r3d.testVisibility(false);
        const afterShow = r3d.musicPlaying();
        for (let i = 0; i < 10; i++) r3d.step(1 / 60);
        return JSON.stringify({ before, afterHide, afterShow, state: r3d.audioState(), drives: r3d.speed() > 0 });
    })()`);
    const visj = JSON.parse(visCheck);
    check('visibility: hiding stops music, returning restarts it, sim still drives (clean auto-resume)',
        visj.before === true && visj.afterHide === false && visj.afterShow === true && visj.drives === true, visCheck);

    // batch 4 — reactive decor billboards: reduced-motion gate off by default,
    // pulse scale up as the kart passes within ~10 u when amplitude is enabled
    const decorCheck = await h.evalv(`(function(){
        const r3d = window.__r3d;
        r3d.haltLoop(true);
        const ampInit = r3d.decorAmp();
        const d = r3d.decorNear(r3d.progress() + 0.05);
        if (d.idx < 0) { r3d.haltLoop(false); return JSON.stringify({ none: true }); }
        r3d.resetSteerState(0, 0, 0);
        r3d.setDecorAmp(0);
        r3d.seekToProgress(d.t - 0.0005);
        const baseOff = r3d.decorScale(d.idx);
        for (let i = 0; i < 8; i++) r3d.step(1 / 60);
        const midOff = r3d.decorScale(d.idx);
        r3d.setDecorAmp(1);
        r3d.seekToProgress(d.t - 0.0005);
        const baseOn = r3d.decorScale(d.idx);
        for (let i = 0; i < 6; i++) r3d.step(1 / 60);
        const midOn = r3d.decorScale(d.idx);
        for (let i = 0; i < 20; i++) r3d.step(1 / 60);
        const endOn = r3d.decorScale(d.idx);
        r3d.setDecorAmp(ampInit);
        r3d.haltLoop(false);
        return JSON.stringify({ idx: d.idx, t: d.t, baseOff, midOff, baseOn, midOn, endOn, ampInit });
    })()`);
    const dcj = JSON.parse(decorCheck);
    check('reactive decor: pulse gated off under reduced motion, scale pops when the kart passes and returns to baseline',
        dcj.none !== true && dcj.baseOff === 1 && dcj.midOff === 1 &&
        dcj.baseOn === 1 && dcj.midOn > 1.05 && dcj.endOn === 1 && dcj.ampInit === 0, decorCheck);

    // batch 5 — contact/blob shadows under kart/pickups/boost pads/obstacles.
    // Shared radial gradient sprite texture; depthWrite off + fog off stays the
    // cheap "decor" class of draw. Static blobs (no motion) => a11y-reduced-motion
    // does NOT gate them off. Kart blob lifts/re-seats flat on the kart y each step.
    const shadowCheck = await h.evalv(`(function(){
        const r3d = window.__r3d;
        const n = r3d.blobShadows();
        const onInit = r3d.shadowOn();
        const off = r3d.setShadows(false);
        const onAfter = r3d.setShadows(true);
        r3d.haltLoop(true);
        r3d.seekToProgress(0.32);
        for (let i = 0; i < 12; i++) r3d.step(1 / 60);
        const y = r3d.kartShadowY();
        r3d.haltLoop(false);
        return JSON.stringify({ n, onInit, off, onAfter, dy: +(y.sy - y.ky).toFixed(3) });
    })()`);
    const scj = JSON.parse(shadowCheck);
    check('contact shadows: blob sprites under all tracked objects (n>=14), gated on by default and re-enableable, kart shadow re-seats flat on the kart y each step',
        scj.n >= 14 && scj.onInit === true && scj.off === false && scj.onAfter === true &&
        scj.dy > -0.3 && scj.dy < 0.3 && scj.dy !== 0, shadowCheck);

    // batch 6 — boost visual identity: longer/hotter flames + warm amber road
    // dust + soft rear-wheel trail while now < boostUntil; all three particle
    // tags die and stop spawning once the boost expires
    const boostVis = await h.evalv(`(function(){
        const r3d = window.__r3d;
        r3d.haltLoop(true);
        r3d.seekLateral(0);
        r3d.resetSteerState(0, 0, 0);
        for (let i = 0; i < 10; i++) r3d.step(1 / 60);
        const pre = {
            boosting: r3d.boosting(),
            flame: r3d.tagged('boostFlame'),
            dust: r3d.tagged('boostDust'),
            trail: r3d.tagged('boostTrail')
        };
        r3d.triggerBoost(250);
        const on = r3d.boosting();
        for (let i = 0; i < 30; i++) r3d.step(1 / 60);
        const during = {
            flame: r3d.tagged('boostFlame'),
            dust: r3d.tagged('boostDust'),
            trail: r3d.tagged('boostTrail')
        };
        r3d.haltLoop(false);
        return JSON.stringify({ mode: r3d.mode(), pre, on, during });
    })()`);
    const bvj = JSON.parse(boostVis);
    await sleep(320);
    const boostGone = await h.evalv(`(function(){
        const r3d = window.__r3d;
        r3d.haltLoop(true);
        for (let i = 0; i < 75; i++) r3d.step(1 / 60);
        const out = {
            boosting: r3d.boosting(),
            flame: r3d.tagged('boostFlame'),
            dust: r3d.tagged('boostDust'),
            trail: r3d.tagged('boostTrail')
        };
        r3d.haltLoop(false);
        return JSON.stringify(out);
    })()`);
    const bgj = JSON.parse(boostGone);
    check('boost visual identity: flames + warm dust + rear-wheel trail spawn while boosting, all stop + clear after expiry',
        bvj.mode === 'drive' && bvj.pre.boosting === false && bvj.pre.flame === 0 &&
        bvj.pre.dust === 0 && bvj.pre.trail === 0 && bvj.on === true &&
        bvj.during.flame > 0 && bvj.during.dust > 0 && bvj.during.trail > 0 &&
        bgj.boosting === false && bgj.flame === 0 && bgj.dust === 0 && bgj.trail === 0,
        boostVis + ' -> after-expiry ' + boostGone);

    // batch 7 — pickup feedback: kart hull emissive flash pops on collect then
    // eases back to the base glow; the chime pitch rises per consecutive
    // collect; the combo resets to 0 on an obstacle hit
    const fbCheck = await h.evalv(`(function(){
        const r3d = window.__r3d;
        r3d.haltLoop(true);
        r3d.seekLateral(0);
        r3d.resetSteerState(0, 0, 0);
        r3d.resetCombo();
        for (let i = 0; i < 20; i++) r3d.step(1 / 60);  // drain a stale flash
        const combo0 = r3d.combo();
        r3d.forceCollect(0);
        const c1 = r3d.combo();
        const f1 = r3d.lastPickupFreq();
        const flash1 = r3d.kartFlash();
        r3d.forceCollect(1);
        const c2 = r3d.combo();
        const f2 = r3d.lastPickupFreq();
        for (let i = 0; i < 15; i++) r3d.step(1 / 60);
        const flashMid = r3d.kartFlash();
        for (let i = 0; i < 50; i++) r3d.step(1 / 60);
        const flashEnd = r3d.kartFlash();
        r3d.testObstacleHit();
        const comboAfter = r3d.combo();
        r3d.haltLoop(false);
        return JSON.stringify({ combo0, c1, f1, flash1, c2, f2, flashMid, flashEnd, comboAfter });
    })()`);
    const fbj = JSON.parse(fbCheck);
    check('pickup feedback: hull emissive flash on collect (decays back), rising chime pitch per consecutive collect, combo resets on obstacle hit',
        fbj.combo0 === 0 && fbj.c1 === 1 && fbj.c2 === 2 && fbj.f1 > 0 && fbj.f2 > fbj.f1 &&
        fbj.flash1 === 1 && fbj.flashMid > 0 && fbj.flashMid < 1 && fbj.flashEnd === 0 &&
        fbj.comboAfter === 0, fbCheck);

    // batch 8 — celebration choreography: crossing a lap line fires a
    // world-colored petal burst ('celebrate' tag) from the kart, the finish
    // layers a world burst over the confetti, and the shared emitter stays
    // within the MAX_PARTICLES cap
    const celCheck = await h.evalv(`(function(){
        const r3d = window.__r3d;
        r3d.haltLoop(true);
        r3d.seekLateral(0);
        r3d.resetSteerState(0, 0, 0);
        const lap0 = r3d.lap();
        r3d.seekToProgress(0.985);  // just before the next lap line
        for (let i = 0; i < 120; i++) r3d.step(1 / 60);
        const lap1 = r3d.lap();
        const cele = r3d.tagged("celebrate");
        const total = r3d.particles();
        r3d.haltLoop(false);
        return JSON.stringify({ lap0, lap1, cele, total });
    })()`);
    const celj = JSON.parse(celCheck);
    check('celebration: lap-line cross fires a world-colored burst (tagged celebrate), particle cap respected',
        celj.lap1 > celj.lap0 && celj.cele > 0 && celj.total <= 420, celCheck);

    // batch 9 — audio bus: every SFX/announcement flows through a single
    // queue drained AT MOST ONCE per frame (40 ms wall gate proves one call
    // per step even with back-to-back steps), the obstacle announce speaks
    // the hitText with a falling minor-third motif (G4 -> E4) and arms a duck
    // window, and immediate repeats are gated by exponential backoff
    await h.evalv(`(function(){
        const r3d = window.__r3d;
        r3d.haltLoop(true);
        r3d.seekLateral(0);
        r3d.resetSteerState(0, 0, 0);
        r3d.setWarnUntil(null);
        r3d.resetAudio();
        return true;
    })()`);
    // collect queues two chime tones; without wall time passing, two quick
    // steps still drain only one item (one audio call per frame)
    const ab0 = JSON.parse(await h.evalv(`(function(){
        const r3d = window.__r3d;
        r3d.forceCollect(0);
        const q = r3d.audioQueueLen();
        const d = r3d.audioDrained();
        r3d.step(1 / 60);
        const d1 = r3d.audioDrained();
        r3d.step(1 / 60);
        const d2 = r3d.audioDrained();
        return JSON.stringify({ q, d, d1, d2 });
    })()`));
    // let the wall gate pass, then the second tone drains
    await sleep(55);
    const abDrain = JSON.parse(await h.evalv(`(function(){
        const r3d = window.__r3d;
        r3d.step(1 / 60);
        return JSON.stringify({ q: r3d.audioQueueLen(), d: r3d.audioDrained() });
    })()`));
    // obstacle hit arms the announce: gentleMiss + speak + G4 + Eb4 (4 items)
    const ab1 = JSON.parse(await h.evalv(`(function(){
        const r3d = window.__r3d;
        r3d.resetCombo();
        const duckBefore = r3d.ducking();
        r3d.testObstacleHit();
        const duckAfter = r3d.ducking();
        return JSON.stringify({ duckBefore, duckAfter, q: r3d.audioQueueLen() });
    })()`));
    // drain those four items one per ~55 ms wall step
    let abD = 0;
    for (let i = 0; i < 4; i++) {
        await sleep(55);
        abD = JSON.parse(await h.evalv(`(function(){
            const r3d = window.__r3d;
            r3d.step(1 / 60);
            return JSON.stringify({ q: r3d.audioQueueLen(), d: r3d.audioDrained() });
        })()`));
    }
    // immediate repeat hit: backoff gate suppresses the announce, leaves only
    // the gentleMiss thud (still within the physical cooldown? no — direct
    // hook), and the duck window stays armed
    const ab2 = JSON.parse(await h.evalv(`(function(){
        const r3d = window.__r3d;
        r3d.testObstacleHit();
        return JSON.stringify({ qRepeat: r3d.audioQueueLen(), duckRepeat: r3d.ducking() });
    })()`));
    // both obstacle-hit items decode to two queued tones: G4 + E4 (minor third)
    const min3 = Math.abs(Math.log2(392 / 329.63) * 12);
    check('audio bus: one queued SFX call drained per frame, obstacle announce speaks + minor-third motif with duck window and exponential backoff gate',
        ab0.q === 2 && ab0.d === 0 && ab0.d1 === 1 && ab0.d2 === 1 &&
        abDrain.q === 0 && abDrain.d === ab0.d1 + 1 &&
        ab1.duckBefore === false && ab1.duckAfter === true && ab1.q === 4 &&
        abD.q === 0 && abD.d === ab0.d1 + 5 &&
        ab2.qRepeat === 1 && ab2.duckRepeat === true && Math.abs(min3 - 3) < 0.1,
        JSON.stringify({ ab0, ab1, ab2, abD, min3 }));

    h.close();
    process.exit(getFails() ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });