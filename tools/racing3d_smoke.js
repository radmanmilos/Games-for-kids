/* Мала тркачица 3Д (3D Little Racer) smoke test — full game.
   Boosts the REAL page headlessly: module boots, WebGL renderer creates a
   canvas, start picker shows 8 world cards + 4 kart colors, the race starts from
   the picker, HUD shows Serbian world/lap/collectible labels, countdown drives
   the start, keyboard/touch steering moves the kart laterally, auto-forward
   raises speed, and hub wiring (button / navigation / standalone boot) is in
   place.
   Run:  node tools/racing3d_smoke.js
   Requires Node >= 22. CHROME_PATH env optional.

   WebGL gate: on a host with no WebGL context (headless Chrome + --disable-gpu
   and no SwiftShader) the race cannot run, so those checks are reported as a
   counted SKIP, not a pass. The no-WebGL fallback path and the shared
   RACING_CONFIG load are still asserted, because both work without WebGL. */
const { start, check, skip, getFails, getSkips } = require('./headless.js');
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
    const h = await start({ page: '/pages/racing3d.html', tag: 'racing3d-smoke', width: 1100, height: 700 });

    // --- Environment gate -----------------------------------------------------
    // This is the ONLY WebGL game, and headless Chrome has no WebGL on some hosts
    // (Linux/CI with --disable-gpu and no SwiftShader: ANGLE needs VK_KHR_surface,
    // which a software container does not provide). When WebGL is missing the game
    // correctly shows its "3D није доступан овде" fallback and never sets
    // window.__r3d, so the whole WebGL battery below is unrunnable.
    //
    // That is an ENVIRONMENT limit, so it is reported as a counted SKIP — never as
    // a pass. Making it "pass" (by stubbing __r3d or exiting early with a green
    // summary) is exactly the anti-pattern that hid the real racing-config.js
    // regression in the first place. See R1 in PROJECT_TASKS.md.
    // Wait for the page to finish loading and the game to attempt its boot,
    // otherwise the probes below race the <script> tags and see an empty page.
    for (let i = 0; i < 40; i++) {
        const loaded = await h.evalv(`document.readyState === 'complete' && typeof window.startRacing3D === 'function'`);
        if (loaded) break;
        await sleep(250);
    }
    await sleep(500);

    const webglOK = await h.evalv(`(function () {
        try {
            const c = document.createElement('canvas');
            return !!(c.getContext('webgl2') || c.getContext('webgl'));
        } catch (e) { return false; }
    })()`);

    if (!webglOK) {
        const fb = JSON.parse(await h.evalv(`JSON.stringify({
            msg: document.getElementById('r3d-countdown').textContent,
            shown: document.getElementById('r3d-countdown').classList.contains('show'),
            worlds: (window.RACING_CONFIG && window.RACING_CONFIG.worlds || []).length,
            music: window.RACING_CONFIG && window.RACING_CONFIG.music
                ? Object.keys(window.RACING_CONFIG.music).length : 0,
            obstacles: window.RACING_CONFIG && window.RACING_CONFIG.obstacleTypes
                ? Object.keys(window.RACING_CONFIG.obstacleTypes).length : 0,
            startFn: typeof window.startRacing3D,
            chromeOk: !!document.getElementById('r3d-back') &&
                      !!document.getElementById('r3d-left') &&
                      !!document.getElementById('r3d-right')
        })`));

        // The fallback itself is real, testable behaviour, so assert it properly.
        check('no-WebGL fallback: shows "3D није доступан овде" instead of a blank page',
            fb.shown === true && fb.msg === '3D није доступан овде', JSON.stringify(fb));

        // Runs with or without WebGL, so the config regression stays covered even
        // here: task 146 deleted racing-config.js while racing3d.html still loads
        // it, which silently left the game with zero worlds.
        check('shared RACING_CONFIG loaded for racing3d (8 worlds, 8 music tracks, 3 obstacle types)',
            fb.worlds === 8 && fb.music === 8 && fb.obstacles === 3, JSON.stringify(fb));

        check('page chrome present on the fallback path (back + steering buttons wired)',
            fb.chromeOk === true && fb.startFn === 'function', JSON.stringify(fb));

        skip('WebGL race battery (module boot, canvas, world picker, countdown, steering, boost, drift, bank, rumble, mini-map, hills, triangles, frame-timing, touch/palm, visibility, decor, shadows, boost visuals, input reset, perf)',
            'no WebGL context in this environment');

        const f = getFails();
        console.log(`\nracing3d: ${getSkips()} SKIPPED (no WebGL) — the 3D race is NOT covered here.`);
        console.log('This battery needs a WebGL-capable host, or the user play-test on a real device.');
        await h.close();
        process.exit(f ? 1 : 0);
    }

    let ready = false;
    for (let i = 0; i < 40 && !ready; i++) {
        ready = await h.evalv(`typeof window.__r3d === 'object' && window.__r3d !== null`);
        if (!ready) await sleep(250);
    }
    check('racing3d booted (window.__r3d ready)', ready);

    // --- diagnostics (task 177 follow-up) -------------------------------
    // These 5 checks pass 33/33 on the Windows dev host and fail on the Linux
    // runner, so the fix needs evidence rather than a guess. Two mechanisms
    // could explain a cross-machine difference and they are not the same bug:
    //
    //  1. The sim clamps dt: `Math.min(clock.getDelta(), 0.05)` in the rAF loop.
    //     At 60fps the clamp never binds, so `await sleep(N)` buys N ms of sim.
    //     On a software-WebGL runner a frame can take >50ms, the clamp binds, and
    //     the game runs at a fraction of wall-clock speed -- so every fixed sleep
    //     in this file under-buys sim time and the physics samples read a state
    //     the kart has not reached yet. __probe measures real frames and the sim
    //     time they actually delivered (same 50ms clamp), so a sample payload can
    //     report "how much sim time did this window really buy".
    //  2. `prefers-reduced-motion` is read once at module load and is NOT
    //     settable at runtime, so the host decides it. The decor check asserts
    //     `ampInit === 0` (reduced motion ON); the Linux runner reports 1.
    //
    // Assertions are deliberately unchanged -- this only adds measurement.
    await h.evalv(`(function(){
        let frames = 0, simMs = 0, worstMs = 0, last = 0;
        function tick(t) {
            if (last) { const d = t - last; if (d > worstMs) worstMs = d; simMs += Math.min(d, 50); }
            last = t; frames++;
            requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        window.__probeReset = function () { frames = 0; simMs = 0; worstMs = 0; last = 0; return true; };
        window.__probe = function () {
            return JSON.stringify({
                frames: frames,
                simMs: Math.round(simMs),
                worstMs: Math.round(worstMs),
                rm: window.__r3d.reducedMotion()
            });
        };
        return true;
    })()`);

    const boot = await h.evalv(`JSON.stringify({
        canvas: (document.querySelector('#r3d-view canvas') || {}).width || 0,
        world: document.getElementById('r3d-world').textContent,
        round: document.getElementById('r3d-round').textContent,
        flowers: document.getElementById('r3d-flowers').textContent
    })`);
    const bj = JSON.parse(boot);
    check('canvas rendered and HUD in Serbian (Ливада, Круг 1/3, 0/12)',
        bj.canvas > 0 && bj.world === 'Ливада' && bj.round === 'Круг 1/3' && bj.flowers === '🌸 0/12', boot);

    // Regression guard (task 105): the back button shipped empty and the
    // steering arrows were two different emoji glyphs.
    const icons = await h.evalv(`JSON.stringify({
        backSvg: !!document.querySelector('#r3d-back svg'),
        leftSvg: !!document.querySelector('#r3d-left svg'),
        rightSvg: !!document.querySelector('#r3d-right svg'),
        leftText: (document.getElementById('r3d-left').textContent || '').trim(),
        rightText: (document.getElementById('r3d-right').textContent || '').trim()
    })`);
    const I = JSON.parse(icons);
    check('back button has an arrow and both steering buttons use SVG (no emoji glyphs)',
        I.backSvg && I.leftSvg && I.rightSvg && I.leftText === '' && I.rightText === '', icons);

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

    // The steering zones are z-index 11 and start at 26vmin, which on a short
    // landscape screen is above .r3d-corner and swallowed the world/music taps.
    // Measured mid-race, which is where the player hit it.
    await h.c.send('Emulation.setDeviceMetricsOverride', { width: 844, height: 390, deviceScaleFactor: 1, mobile: false });
    await sleep(400);
    const reach = await h.evalv(`JSON.stringify((() => {
        const topAt = id => { const b = document.getElementById(id).getBoundingClientRect();
            const el = document.elementFromPoint((b.left + b.right) / 2, (b.top + b.bottom) / 2);
            return el ? (el.id || (el.closest && el.closest('button') ? el.closest('button').id : '')) : 'none'; };
        return { world: topAt('r3d-world-btn'), music: topAt('r3d-music-btn') };
    })())`);
    const R = JSON.parse(reach);
    check('short landscape (844x390): world + music buttons are the topmost element (not covered by a steering zone)',
        R.world === 'r3d-world-btn' && R.music === 'r3d-music-btn', reach);
    await h.c.send('Emulation.setDeviceMetricsOverride', { width: 1100, height: 700, deviceScaleFactor: 1, mobile: false });
    await sleep(300);

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

    // Frame-rate independent by construction. This used to hold the key and
    // `await sleep(N)`, which only works if a frame costs less than the 50ms dt
    // clamp. Measured on the Linux runner: 15 frames of 113ms (worst 183ms) gave
    // 700ms of sim for 1700ms of wall clock, so every sleep below under-bought
    // and the samples read a state the easing had not reached. Stepping a fixed
    // dt delivers the exact sim budget on any host. The step counts are the
    // previous millisecond budgets at 1/60 (400/150/250/900/300/400 -> 24/9/15/
    // 54/18/24), so the assertion thresholds are unchanged.
    const steerCheck = await h.evalv(`(function(){
        const r3d = window.__r3d;
        const snap = () => ({ yaw: r3d.steerState().steerYaw, lat: r3d.lateral(), sp: r3d.speed() });
        const run = (n) => { for (let i = 0; i < n; i++) r3d.step(1 / 60); };
        r3d.haltLoop(true);
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
        run(24);
        const stA = snap();
        window.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowRight' }));
        run(9);
        const stE1 = snap();
        run(15);
        const stE2 = snap();
        run(54);
        const stB = snap();
        run(18);
        const stC = snap();
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
        run(24);
        window.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowLeft' }));
        const stLeft = snap();
        const rm = r3d.reducedMotion();
        r3d.resetInput();
        r3d.haltLoop(false);
        return JSON.stringify({ stA, stE1, stE2, stB, stC, stLeft, rm });
    })()`);
    const stj = JSON.parse(steerCheck);
    check('steering: wheels turn in + car drifts, car stops while wheels still return slowly, no side-drift, reverses',
        stj.stA.sp > 10 && stj.stA.yaw > 0.1 && stj.stA.lat > 0.3 &&
        stj.stE1.yaw > 0.1 && stj.stE2.yaw > 0.07 && Math.abs(stj.stE2.lat - stj.stE1.lat) < 0.4 &&
        Math.abs(stj.stB.yaw) < 0.05 && Math.abs(stj.stC.lat - stj.stB.lat) < 0.15 &&
        stj.stLeft.lat < stj.stC.lat - 0.5, steerCheck);

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

    // Same frame-rate-independent stepping as the steering batch above. The
    // release decay is the clearest case: steerYaw returns to centre as
    // exp(-2.8 * t), so 0.417 -> below 0.05 needs ~757ms of *simulated* time. A
    // sleep(1300) bought only ~540ms of sim on the runner, leaving 0.121 and a
    // false failure; 78 steps deliver the intended 1300ms everywhere.
    const bankCheck = await h.evalv(`(function(){
        const r3d = window.__r3d;
        const run = (n) => { for (let i = 0; i < n; i++) r3d.step(1 / 60); };
        r3d.haltLoop(true);
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
        run(24);
        const bankA = r3d.steerState();
        window.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowRight' }));
        run(78);
        const bankB = r3d.steerState();
        const rm = r3d.reducedMotion();
        r3d.resetInput();
        r3d.haltLoop(false);
        return JSON.stringify({ bankA, bankB, rm });
    })()`);
    const bkj = JSON.parse(bankCheck);
    check('kart banks into the turn + wheels carry a spin pattern, then point forward on release',
        bkj.bankA.spokes === 16 && bkj.bankA.roll > 0.15 && bkj.bankA.steerYaw > 0.1 &&
        Math.abs(bkj.bankB.roll) < 0.05 && Math.abs(bkj.bankB.steerYaw) < 0.05 && Math.abs(bkj.bankB.yaw) < 0.05,
        bankCheck);

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
    //
    // Two host-dependencies were removed here, both caught by run #28 evidence:
    //  - the billboard was picked with `decorNear(progress() + 0.05)`, i.e. from
    //    wherever the kart happened to be. That differed per host (idx 6 locally,
    //    idx 4 on the runner), and the pulse peaks a different number of steps
    //    after the seek depending on entry speed, so the fixed 26-step budget
    //    landed mid-decay on one host and at baseline on the other. The item is
    //    now chosen by index, so the test cannot draw a different billboard.
    //  - the assertion `ampInit === 0` asserted the *host's* OS setting
    //    (prefers-reduced-motion), not a product behaviour, and REDUCED_MOTION is
    //    read once at module load so a smoke cannot set it. The real invariant is
    //    that decorAmp is initialised from REDUCED_MOTION, now asserted on any host.
    // The return-to-baseline wait polls the *kart passing the billboard* (a state
    // change), never the assertion itself; the baseline is then checked once.
    const decorCheck = await h.evalv(`(function(){
        const r3d = window.__r3d;
        const rm = r3d.reducedMotion();
        r3d.haltLoop(true);
        const ampInit = r3d.decorAmp();
        let d = null, idx = -1;
        for (let i = 0; i < 40 && !d; i++) {
            const a = r3d.decorAt(i);
            if (a && a.t > 0.2 && a.t < 0.8) { d = a; idx = i; }
        }
        if (!d) { r3d.haltLoop(false); return JSON.stringify({ none: true }); }
        r3d.resetSteerState(0, 0, 0);
        r3d.setDecorAmp(0);
        // 2% of the track back, not 0.05%: the pulse only builds while the kart is
        // within ~10u, so seeking to just before the billboard clears it in a
        // single step and the pop never happens.
        const lead = 0.02;
        r3d.seekToProgress(d.t - lead);
        const baseOff = r3d.decorScale(idx);
        for (let i = 0; i < 8; i++) r3d.step(1 / 60);
        const midOff = r3d.decorScale(idx);
        r3d.setDecorAmp(1);
        r3d.seekToProgress(d.t - lead);
        const baseOn = r3d.decorScale(idx);
        // The pulse is a 0.3s sine that RE-TRIGGERS on every frame the kart is
        // inside the ~10u radius, so while nearby the scale oscillates between 1
        // and 1.15 forever and any single sample is a lottery -- 1.14095 is just
        // 1 + 0.15*sin(phase), which is why two different hosts sampled the same
        // value. So baseline can only be asserted once the kart is clear of the
        // radius (pulse can no longer re-trigger) and the final 0.3s has elapsed.
        const trigU = 0.03;  // real radius is 10/trackLen (~0.008); be generous
        let peak = baseOn, clear = false, steps = 0, atClear = 0;
        for (let k = 0; k < 900 && !clear; k++) {
            r3d.step(1 / 60);
            steps++;
            const s = r3d.decorScale(idx);
            if (s > peak) peak = s;
            const p = r3d.progress();
            // same min-distance the game uses, so "behind the billboard" also
            // counts as near and the kart is not clear the moment we seek back
            const delta = Math.min(((p - d.t) % 1 + 1) % 1, ((d.t - p) % 1 + 1) % 1);
            clear = delta >= trigU;
        }
        atClear = r3d.decorScale(idx);
        for (let i = 0; i < 24; i++) r3d.step(1 / 60);  // 0.4s > the 0.3s pulse
        const endOn = r3d.decorScale(idx);
        r3d.setDecorAmp(ampInit);
        r3d.haltLoop(false);
        return JSON.stringify({ idx, t: d.t, baseOff, midOff, baseOn, peak, atClear, endOn, ampInit, rm, steps, clear });
    })()`);
    const dcj = JSON.parse(decorCheck);
    check('reactive decor: pulse gated off under reduced motion, scale pops when the kart passes and returns to baseline',
        dcj.none !== true && dcj.baseOff === 1 && dcj.midOff === 1 &&
        dcj.baseOn === 1 && dcj.peak > 1.05 && dcj.clear === true && dcj.endOn === 1 &&
        dcj.ampInit === (dcj.rm ? 0 : 1), decorCheck);

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
    //
    // Sample the burst where it happens, not 1.4s later. The lap line is crossed
    // at whatever step the entry speed reaches it (36 on the CI runner vs 53
    // locally), and every petal expires about 70-85 steps after spawning, so
    // reading the count at a fixed step 120 meant the runner -- which crosses
    // earlier and therefore sampled latest -- saw `cele: 0, total: 0` while the
    // lap line had demonstrably fired 24 tagged petals at the cross. The
    // assertions below are the same ones, taken at the burst, plus a running
    // peak so the cap is still checked for the whole window rather than at one
    // instant.
    const celCheck = await h.evalv(`(function(){
        const r3d = window.__r3d;
        r3d.haltLoop(true);
        r3d.seekLateral(0);
        r3d.resetSteerState(0, 0, 0);
        const lap0 = r3d.lap();
        r3d.seekToProgress(0.985);  // just before the next lap line
        const sp0 = r3d.speed();
        const pre = r3d.particles();
        let crossStep = -1, atCross = 0, celeAtCross = 0, spinAtCross = 0, maxTotal = 0;
        for (let i = 0; i < 120; i++) {
            r3d.step(1 / 60);
            const n = r3d.particles();
            if (n > maxTotal) maxTotal = n;
            if (crossStep < 0 && r3d.lap() > lap0) {
                crossStep = i;
                atCross = n;
                celeAtCross = r3d.tagged("celebrate");
                spinAtCross = r3d.particlesSpinning();
            }
        }
        const lap1 = r3d.lap();
        const cele = r3d.tagged("celebrate");
        const total = r3d.particles();
        const spinning = r3d.particlesSpinning();
        const rm = r3d.reducedMotion();
        r3d.haltLoop(false);
        return JSON.stringify({ lap0, lap1, cele, total, spinning, crossStep, atCross, celeAtCross, spinAtCross, maxTotal, pre, sp0, rm });
    })()`);
    const celj = JSON.parse(celCheck);
    check('celebration: lap-line cross fires a world-colored burst (tagged celebrate), particle cap respected',
        celj.lap1 > celj.lap0 && celj.celeAtCross > 0 && celj.maxTotal <= 420, celCheck);
    check('particles carry a non-zero spin (spawnP stores the spin callers pass)',
        celj.spinAtCross > 0, celCheck);

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

// batch 10 — spoken Serbian hint: the obstacle announce speaks the MINIMAL
    // word "Пази!" (full hitText stays on the visual banner) and the boost
    // hint "Буст!"; beeps stay the authoritative cue — the queue carries 3
    // tones against 1 speech item, so a lagging/silent TTS never mutes the call
    await h.evalv(`(function(){
        const r3d = window.__r3d;
        r3d.haltLoop(true);
        r3d.seekLateral(0);
        r3d.resetAudio();
        r3d.resetObstacleMsgs();
        r3d.setWarnUntil(null);
        return true;
    })()`);
    const sh0 = JSON.parse(await h.evalv(`(function(){
        const r3d = window.__r3d;
        r3d.testObstacleHit();
        return JSON.stringify({ kinds: r3d.audioKinds(), q: r3d.audioQueueLen(), spoken: r3d.lastSpoken() });
    })()`));
    for (let i = 0; i < 4; i++) {
        await sleep(55);
        await h.evalv(`window.__r3d.step(1 / 60); true`);
    }
    const shDrain = JSON.parse(await h.evalv(`(function(){
        const r3d = window.__r3d;
        return JSON.stringify({ q: r3d.audioQueueLen(), spoken: r3d.lastSpoken() });
    })()`));
    const shBoost = JSON.parse(await h.evalv(`(function(){
        const r3d = window.__r3d;
        r3d.resetAudio();
        r3d.triggerBoost(80);
        return JSON.stringify({ kinds: r3d.audioKinds(), q: r3d.audioQueueLen() });
    })()`));
    for (let i = 0; i < 2; i++) {
        await sleep(55);
        await h.evalv(`window.__r3d.step(1 / 60); true`);
    }
    const shDrain2 = JSON.parse(await h.evalv(`(function(){
        const r3d = window.__r3d;
        return JSON.stringify({ q: r3d.audioQueueLen(), spoken: r3d.lastSpoken() });
    })()`));
    check('spoken Serbian hint: obstacle announce speaks minimal "Пази!" (beeps authoritative: 3 tone-producing items vs 1 speech), boost hint "Буст!"',
        // the two minor-third notes are 'motif' items now: they are still tones,
        // just anchored to the first note's play time so the 40ms drain cannot
        // stretch the gap
        sh0.kinds === 'tone,speak,motif,motif' && sh0.q === 4 && sh0.spoken === '' &&
        shDrain.q === 0 && shDrain.spoken === 'Пази!' &&
        shBoost.kinds === 'sweep,speak' && shBoost.q === 2 &&
        shDrain2.q === 0 && shDrain2.spoken === 'Буст!',
        JSON.stringify({ sh0, shDrain, shBoost, shDrain2 }));

    // task 105 — resetInput: a key released while the page was unfocused (or a
    // pointer still held from before a race) used to leave the kart steering
    // forever. Proves the state is cleared and that blur is wired to it.
    const inputCheck = await h.evalv(`(function(){
        const r3d = window.__r3d;
        r3d.haltLoop(true);
        const idle = r3d.inputState();
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
        const held = r3d.inputState();
        r3d.resetInput();
        const cleared = r3d.inputState();
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
        window.dispatchEvent(new Event('blur'));
        const afterBlur = r3d.inputState();
        r3d.haltLoop(false);
        return JSON.stringify({ idle, held, cleared, afterBlur });
    })()`);
    const I2 = JSON.parse(inputCheck);
    check('resetInput: held steering is cleared on demand and on window blur (no stuck steering)',
        I2.idle.left === false && I2.idle.right === false &&
        I2.held.left === true && I2.cleared.left === false && I2.cleared.right === false &&
        I2.cleared.zoneL === null && I2.cleared.zoneR === null &&
        I2.afterBlur.right === false, inputCheck);

    // task 105 — perf instrumentation. Only assert the hooks are wired and
    // self-consistent: frame times are machine/GL dependent (this harness runs
    // software GL), so pinning an FPS here would be a flaky test.
    await h.evalv(`window.__r3d.resetPerf(); true`);
    await sleep(1200);
    const perfCheck = await h.evalv(`JSON.stringify(window.__r3d.perf())`);
    const pf = JSON.parse(perfCheck);
    check('perf hooks: draw calls, triangles, particles, frame time and DPR all report sane values',
        pf.calls > 0 && pf.triangles > 0 && pf.dpr === 1 &&
        pf.avgFrameMs > 0 && pf.worstFrameMs >= pf.avgFrameMs && pf.drawBufferPx > 0, perfCheck);

    await h.close();
    process.exit(getFails() ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });