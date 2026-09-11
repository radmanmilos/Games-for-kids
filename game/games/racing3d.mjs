import * as THREE from 'three';

const REDUCED_MOTION = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
const UP = new THREE.Vector3(0, 1, 0);
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

const ROAD_WIDTH = 14;
const ROAD_SEGMENTS = 360;
const MAX_LATERAL = 5.0;
const STEER_SPEED = 12;
const MAX_SPEED = 70;
const ACCEL = 16;
const SAVE_KEY = 'racing3dSave';

function mulberry32(a) {
    return function () {
        a |= 0; a = (a + 0x6D2B79F5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

let booted = false;

window.startRacing3D = function () {
    if (!booted) { booted = true; main(); }
};

function main() {
    const cfg = window.RACING3D_CONFIG || { obstacles: {}, worlds: [{ name: 'Ливада', laps: 3, flowersPerLap: 12 }] };
    const world = cfg.worlds[0];
    const obstacleCfg = cfg.obstacles || {};
    const TOTAL_LAPS = world.laps || 3;
    const FLOWER_TOTAL = (world.flowersPerLap || 12);
    const ROAD_HALF = ROAD_WIDTH / 2;

    const scoreEl = document.getElementById('r3d-score');
    const flowersEl = document.getElementById('r3d-flowers');
    const worldEl = document.getElementById('r3d-world');
    const roundEl = document.getElementById('r3d-round');
    const countdownEl = document.getElementById('r3d-countdown');
    const announcerEl = document.getElementById('r3d-announcer');
    const winModalEl = document.getElementById('r3d-win-modal');
    const winScoreEl = document.getElementById('r3d-win-score');
    const restartBtn = document.getElementById('r3d-restart');

    worldEl.textContent = world.name;
    flowersEl.textContent = '🌸 0/' + FLOWER_TOTAL;
    roundEl.textContent = 'Круг 1/' + TOTAL_LAPS;

    function loadSave() {
        try {
            const s = JSON.parse(localStorage.getItem(SAVE_KEY));
            return s && typeof s.wins === 'number' ? s : { wins: 0 };
        } catch (e) { return { wins: 0 }; }
    }
    function persistSave(s) {
        try { localStorage.setItem(SAVE_KEY, JSON.stringify(s)); } catch (e) { /* private mode */ }
    }
    let save = loadSave();

    const announce = (text) => { if (announcerEl) announcerEl.textContent = text; };

    // --- renderer / scene / camera ---
    const view = document.getElementById('r3d-view');
    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({ antialias: true });
    } catch (e) {
        countdownEl.textContent = '3D није доступан овде';
        countdownEl.classList.add('show');
        return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    view.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(world.fogColor, 90, 420);
    scene.background = new THREE.Color(world.bgTop);
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const sun = new THREE.DirectionalLight(0xffffff, 1.0);
    sun.position.set(60, 90, 40);
    scene.add(sun);
    const rim = new THREE.DirectionalLight(0xffffff, 0.35);
    rim.position.set(-40, 40, -60);
    scene.add(rim);

    const camera = new THREE.PerspectiveCamera(68, window.innerWidth / window.innerHeight, 0.1, 800);
    camera.position.set(-15, 7, 0);

    // --- sky dome (gradient) ---
    {
        const c = document.createElement('canvas');
        c.width = 2; c.height = 64;
        const g = c.getContext('2d');
        const grd = g.createLinearGradient(0, 0, 0, 64);
        grd.addColorStop(0, '#' + world.bgTop.toString(16).padStart(6, '0'));
        grd.addColorStop(1, '#' + world.bgBottom.toString(16).padStart(6, '0'));
        g.fillStyle = grd;
        g.fillRect(0, 0, 2, 64);
        const sky = new THREE.Mesh(
            new THREE.SphereGeometry(520, 24, 12),
            new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), side: THREE.BackSide, fog: false })
        );
        scene.add(sky);
    }

    // --- ground ---
    {
        const g = new THREE.Mesh(
            new THREE.PlaneGeometry(1100, 1100),
            new THREE.MeshPhongMaterial({ color: world.grassColor })
        );
        g.rotation.x = -Math.PI / 2;
        g.position.y = -0.05;
        scene.add(g);
    }

    // --- track curve ---
    const rand = mulberry32(world.curveSeed || 2026);
    const N = 16;
    const pts = [];
    for (let i = 0; i < N; i++) {
        const ang = (i / N) * Math.PI * 2;
        const r = 150 + (rand() - 0.5) * 95;
        const hillY = Math.max(0, Math.sin(ang * 2) * 3.5 + Math.sin(ang * 4) * 1.6 + (rand() - 0.5) * 2);
        pts.push(new THREE.Vector3(Math.cos(ang) * r, hillY, Math.sin(ang) * r));
    }
    const curve = new THREE.CatmullRomCurve3(pts, true);
    const trackLen = curve.getLength();

    function ribbonVerts(width, centerOffset, yOffset, fn) {
        const pos = [];
        const idx = [];
        const out = [];
        for (let i = 0; i <= ROAD_SEGMENTS; i++) {
            const t = i / ROAD_SEGMENTS;
            const p = curve.getPointAt(t);
            const tan = curve.getTangentAt(t);
            const right = new THREE.Vector3().crossVectors(tan, UP).normalize();
            const l = p.clone().addScaledVector(right, centerOffset - width / 2);
            const r = p.clone().addScaledVector(right, centerOffset + width / 2);
            l.y += yOffset; r.y += yOffset;
            pos.push(l.x, l.y, l.z, r.x, r.y, r.z);
            if (i < ROAD_SEGMENTS) {
                const a = i * 2, b = a + 1, c = a + 2, d = a + 3;
                idx.push(a, c, b, b, c, d);
            }
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
        g.setIndex(idx);
        if (fn) {
            const cols = [];
            for (let i = 0; i <= ROAD_SEGMENTS; i++) {
                const c = fn(i / ROAD_SEGMENTS);
                cols.push(c.r, c.g, c.b, c.r, c.g, c.b);
            }
            g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
            out.push(g);
        } else {
            g.computeVertexNormals();
            out.push(g);
        }
        return out[0];
    }

    // road surface: clean asphalt, clear lane markings (two-lane standard road)
    scene.add(new THREE.Mesh(
        ribbonVerts(ROAD_WIDTH, 0, 0.02),
        new THREE.MeshPhongMaterial({ color: 0x6b7176, shininess: 8, side: THREE.DoubleSide })
    ));

    function ribbonDash(count, width, yOffset) {
        const pos = [];
        const idx = [];
        for (let i = 0; i < count; i++) {
            const t0 = i / count;
            const t1 = (i + 0.45) / count;
            const p0 = curve.getPointAt(t0);
            const p1 = curve.getPointAt(t1);
            const r0 = new THREE.Vector3().crossVectors(curve.getTangentAt(t0), UP).normalize();
            const r1 = new THREE.Vector3().crossVectors(curve.getTangentAt(t1), UP).normalize();
            const l0 = p0.clone().addScaledVector(r0, -width / 2); l0.y += yOffset;
            const r0p = p0.clone().addScaledVector(r0, width / 2); r0p.y += yOffset;
            const l1 = p1.clone().addScaledVector(r1, -width / 2); l1.y += yOffset;
            const r1p = p1.clone().addScaledVector(r1, width / 2); r1p.y += yOffset;
            const b = i * 4;
            pos.push(l0.x, l0.y, l0.z, r0p.x, r0p.y, r0p.z, l1.x, l1.y, l1.z, r1p.x, r1p.y, r1p.z);
            idx.push(b, b + 2, b + 1, b + 1, b + 2, b + 3);
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
        g.setIndex(idx);
        g.computeVertexNormals();
        return g;
    }
    // dashed center line (two lanes)
    scene.add(new THREE.Mesh(
        ribbonDash(55, 0.5, 0.05),
        new THREE.MeshBasicMaterial({ color: 0xf2f2f4, side: THREE.DoubleSide })
    ));
    // solid white edge lines
    const edgeMat = new THREE.MeshBasicMaterial({ color: 0xf2f2f4, side: THREE.DoubleSide });
    scene.add(new THREE.Mesh(ribbonVerts(0.4, ROAD_HALF - 0.55, 0.035), edgeMat));
    scene.add(new THREE.Mesh(ribbonVerts(0.4, -(ROAD_HALF - 0.55), 0.035), edgeMat));
    // finish line
    {
        const cv = document.createElement('canvas');
        cv.width = 256; cv.height = 32;
        const g = cv.getContext('2d');
        for (let ix = 0; ix < 8; ix++) {
            for (let iy = 0; iy < 4; iy++) {
                g.fillStyle = (ix + iy) % 2 === 0 ? '#111' : '#eee';
                g.fillRect(ix * 32, iy * 8, 32, 8);
            }
        }
        const p0 = curve.getPointAt(0);
        const tan = curve.getTangentAt(0);
        const right = new THREE.Vector3().crossVectors(tan, UP).normalize();
        const line = new THREE.Mesh(
            new THREE.PlaneGeometry(ROAD_WIDTH, 2),
            new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv) })
        );
        line.geometry.rotateX(-Math.PI / 2);
        line.position.copy(p0);
        line.position.y += 0.06;
        line.rotation.y = Math.atan2(-right.z, right.x);
        scene.add(line);
    }

    // --- scenery: trees ---
    {
        const trunkMat = new THREE.MeshPhongMaterial({ color: world.treeTrunk });
        const crownMat = new THREE.MeshPhongMaterial({ color: world.treeCrown });
        const trunkGeo = new THREE.CylinderGeometry(0.4, 0.6, 3, 7);
        const crownGeo = new THREE.ConeGeometry(3, 6, 8);
        for (let i = 0; i < 46; i++) {
            const t = i / 46;
            const p = curve.getPointAt(t);
            const tan = curve.getTangentAt(t);
            const right = new THREE.Vector3().crossVectors(tan, UP).normalize();
            const side = i % 2 === 0 ? 1 : -1;
            const dist = ROAD_HALF + 10 + rand() * 30;
            const base = p.clone().addScaledVector(right, side * dist);
            if (base.y < 0.4) continue;
            const s = 0.8 + rand() * 1.1;
            const trunk = new THREE.Mesh(trunkGeo, trunkMat);
            trunk.position.copy(base); trunk.position.y = 1.5 * s;
            trunk.scale.setScalar(s);
            const crown = new THREE.Mesh(crownGeo, crownMat);
            crown.position.copy(base); crown.position.y = (1.5 + 3) * s;
            crown.scale.setScalar(s);
            scene.add(trunk, crown);
        }
    }

    // --- kart ---
    const kartMat = new THREE.MeshPhongMaterial({ color: world.kartColor, shininess: 55 });
    const accentMat = new THREE.MeshPhongMaterial({ color: world.kartAccent, shininess: 40 });
    const wheelMat = new THREE.MeshPhongMaterial({ color: world.wheelColor, shininess: 25 });
    const hubMat = new THREE.MeshPhongMaterial({ color: world.hubColor, shininess: 60 });
    const helmMat = new THREE.MeshPhongMaterial({ color: world.kartAccent, shininess: 70 });
    const skinMat = new THREE.MeshPhongMaterial({ color: 0xffdca8, shininess: 20 });

    const kart = new THREE.Group();
    const kartBounce = new THREE.Group(); // suspension bounce
    const kartLean = new THREE.Group();   // turn roll
    kart.add(kartBounce);
    kartBounce.add(kartLean);

    const hull = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.55, 3.3), kartMat);
    hull.position.y = 0.68;
    kartLean.add(hull);
    const nose = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.42, 1.0), kartMat);
    nose.position.set(0, 0.55, 2.15);
    kartLean.add(nose);
    const wing = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.14, 0.7), kartMat);
    wing.position.set(0, 1.0, -1.75);
    kartLean.add(wing);
    const stripe1 = new THREE.Mesh(new THREE.BoxGeometry(1.96, 0.12, 0.9), accentMat);
    stripe1.position.set(0, 0.62, 0.6);
    kartLean.add(stripe1);
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.5, 1.5), kartMat);
    cabin.position.set(0, 1.05, -0.55);
    kartLean.add(cabin);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 10), skinMat);
    head.position.set(0, 1.4, -0.55);
    kartLean.add(head);
    const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.34, 12, 10), helmMat);
    helmet.position.set(0, 1.4, -0.58);
    helmet.scale.set(1, 0.94, 1.03);
    kartLean.add(helmet);
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.18, 0.08), new THREE.MeshPhongMaterial({ color: 0x222222, shininess: 90 }));
    visor.position.set(0, 1.42, -0.28);
    kartLean.add(visor);

    const wheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.3, 14);
    wheelGeo.rotateZ(Math.PI / 2);
    const hubGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.32, 10);
    hubGeo.rotateZ(Math.PI / 2);
    const wheels = [];
    [[-1.0, 0.42, 1.5], [1.0, 0.42, 1.5], [-1.05, 0.42, -1.4], [1.05, 0.42, -1.4]].forEach((p) => {
        const w = new THREE.Mesh(wheelGeo, wheelMat);
        w.position.set(p[0], p[1], p[2]);
        const h = new THREE.Mesh(hubGeo, hubMat);
        h.position.copy(w.position);
        h.position.add(new THREE.Vector3(p[0] > 0 ? -1 : 1, 0, 0).multiplyScalar(0.16));
        kartLean.add(h);
        kartLean.add(w);
        wheels.push(w);
    });
    scene.add(kart);

    // --- flowers (pickups) ---
    const flowers = [];
    const petalMat = new THREE.MeshPhongMaterial({ color: 0xff8fcc, shininess: 30 });
    const coreMat = new THREE.MeshPhongMaterial({ color: world.finishColor, emissive: 0x9a6b00, shininess: 40 });
    const stemMat = new THREE.MeshPhongMaterial({ color: 0x2e8b2e });
    for (let i = 0; i < FLOWER_TOTAL; i++) {
        const t = (i + 0.5) / FLOWER_TOTAL;
        const p = curve.getPointAt(t);
        const tan = curve.getTangentAt(t);
        const right = new THREE.Vector3().crossVectors(tan, UP).normalize();
        const off = (t % 1 < 0.5 ? 2.4 : -2.4);
        const pos = p.clone().addScaledVector(right, off);
        if (pos.y > 3.5) pos.y -= 0.5;
        const g = new THREE.Group();
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.5, 6), stemMat);
        g.add(stem);
        for (let k = 0; k < 5; k++) {
            const a = (k / 5) * Math.PI * 2;
            const pet = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 6), petalMat);
            pet.position.set(Math.cos(a) * 0.34, 0.5, Math.sin(a) * 0.34);
            pet.scale.set(1, 0.55, 0.62);
            g.add(pet);
        }
        const core = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), coreMat);
        core.position.y = 0.5;
        g.add(core);
        g.position.copy(pos);
        g.position.y += 0.3;
        scene.add(g);
        flowers.push({ mesh: g, done: false });
    }

    // --- obstacles ---
    const obstacles = [];
    const OBS_COUNT = 8;
    for (let i = 0; i < OBS_COUNT; i++) {
        const type = world.obstacleTypes[(i * 3) % world.obstacleTypes.length];
        const def = obstacleCfg[type];
        if (!def) continue;
        let t = (i + 0.6) / OBS_COUNT + (rand() - 0.5) * 0.05;
        if (t >= 0.98) t = 0.5 + (rand() - 0.5) * 0.1;
        const p = curve.getPointAt(t);
        const tan = curve.getTangentAt(t);
        const right = new THREE.Vector3().crossVectors(tan, UP).normalize();
        const base = p.clone();
        base.y += 0.04;
        const mesh = (() => {
            if (type === 'puddle') {
                const m = new THREE.Mesh(
                    new THREE.CylinderGeometry(def.size, def.size, 0.12, 18),
                    new THREE.MeshPhongMaterial({ color: def.base, transparent: true, opacity: 0.85, shininess: 90 })
                );
                m.position.copy(base);
                return m;
            }
            const cv = document.createElement('canvas');
            cv.width = 128; cv.height = 32;
            const g = cv.getContext('2d');
            for (let x = 0; x < 16; x++) {
                g.fillStyle = (x % 2 === 0) ? '#' + def.base.toString(16).padStart(6, '0') : '#ffffff';
                g.fillRect(x * 8, 0, 8, 32);
            }
            const m = new THREE.Mesh(
                new THREE.BoxGeometry(2.6, 1.1, 0.32),
                new THREE.MeshPhongMaterial({ map: new THREE.CanvasTexture(cv), shininess: 25 })
            );
            m.position.copy(base);
            const up = p.clone().add(tan);
            m.lookAt(up);
            return m;
        })();
        scene.add(mesh);
        obstacles.push({ mesh, def, radius: def.size + 1.2, cooldownUntil: 0, hitText: def.label + '! Брзина смањена.' });
    }

    // --- state ---
    const keys = { left: false, right: false };
    let progress = 0.04;
    let lateral = 0;
    let speed = 0;
    let steer = 0;
    let lap = 1;
    let score = 0;
    let mode = 'countdown';           // countdown | drive | finished
    let countdownStart = 0;
    let slowUntil = 0;
    let slowMult = 1;
    let offroad = false;
    let engineStarted = false;
    let engineOsc = null;
    let engineGain = null;
    let finishShake = 0;
    let leanValue = 0;
    const lookTarget = new THREE.Vector3();
    const curTime = () => performance.now();

    const COUNT_SEQ = [
        { t: 0, txt: '3', word: 'три' },
        { t: 900, txt: '2', word: 'два' },
        { t: 1800, txt: '1', word: 'један' },
        { t: 2700, txt: 'Крени!', word: 'Крени!' }
    ];

    function startEngine() {
        if (engineStarted || !window.ctx) return;
        engineStarted = true;
        try {
            const audio = window.ctx();
            engineOsc = audio.createOscillator();
            engineGain = audio.createGain();
            engineOsc.type = 'sawtooth';
            engineOsc.frequency.value = 55;
            engineGain.gain.setValueAtTime(0.0001, audio.currentTime);
            engineGain.gain.exponentialRampToValueAtTime(0.03, audio.currentTime + 0.2);
            engineOsc.connect(engineGain);
            engineGain.connect(audio.destination);
            engineOsc.start();
        } catch (e) { engineStarted = false; }
    }
    function updateEngine() {
        if (engineOsc && engineGain) {
            try {
                engineOsc.frequency.setTargetAtTime(55 + speed * 1.1, window.ctx().currentTime, 0.08);
            } catch (e) { /* ignore */ }
        }
    }

    function speak(word) {
        if (window.speech) window.speech.speak(word);
    }

    function showCountdown() {
        let shown = '';
        let cur = -1;
        for (let i = 0; i < COUNT_SEQ.length; i++) {
            if (curTime() - countdownStart >= COUNT_SEQ[i].t) cur = i;
        }
        if (cur !== lastCountdownIndex) {
            lastCountdownIndex = cur;
            if (cur >= 0) {
                countdownEl.textContent = COUNT_SEQ[cur].txt;
                countdownEl.classList.add('show');
                speak(COUNT_SEQ[cur].word);
                if (window.tone) window.tone(440 + cur * 60, 0.12);
            }
        }
        if (cur >= COUNT_SEQ.length - 1) { speed = Math.max(speed, 30); }
        if (curTime() - countdownStart > 3400) {
            mode = 'drive';
            countdownEl.classList.remove('show');
            countdownEl.textContent = '';
        }
    }
    let lastCountdownIndex = -1;

    function launch() {
        if (mode !== 'countdown') return;
        countdownStart = curTime();
        lastCountdownIndex = -1;
        countdownEl.classList.add('show');
        announce('Припрема, крени!');
    }

    function finish() {
        mode = 'finished';
        winModalEl.classList.add('show');
        winScoreEl.textContent = 'Поени: ' + score + '  ·  Цвеће: ' + score + '/' + FLOWER_TOTAL;
        save = { wins: save.wins + 1 };
        persistSave(save);
        if (window.successChime) window.successChime();
        if (!REDUCED_MOTION) finishShake = 1;
    }

    restartBtn.addEventListener('click', () => location.reload());

    // --- per frame ---
    const _tmpM = new THREE.Matrix4();
    const _tmpQ = new THREE.Quaternion();

    function update(dt, now) {
        if (mode === 'countdown') { showCountdown(); }

        const canSteer = mode === 'drive';
        if (canSteer) {
            steer = (keys.left ? -1 : 0) + (keys.right ? 1 : 0);
        } else {
            steer = 0;
        }
        const prevLateral = lateral;
        if (mode === 'drive') {
            lateral += steer * STEER_SPEED * dt;
            lateral = clamp(lateral, -MAX_LATERAL, MAX_LATERAL);

            let target = MAX_SPEED;
            if (now < slowUntil) target *= slowMult;
            offroad = Math.abs(lateral) > ROAD_HALF - 1.2;
            if (offroad) target *= 0.62;
            if (now >= slowUntil) slowMult = 1;
            speed = clamp(speed + (target - speed) * Math.min(1, 2.2 * dt), 0, MAX_SPEED);

            let np = progress + (speed / trackLen) * dt;
            if (np >= 1) {
                np -= 1;
                lap++;
                if (lap > TOTAL_LAPS) { finish(); }
                else {
                    roundEl.textContent = 'Круг ' + lap + '/' + TOTAL_LAPS;
                    if (window.tone) window.tone(660, 0.15);
                }
            }
            progress = np;
        } else {
            speed = Math.max(0, speed - 60 * dt);
        }

        const p = curve.getPointAt(progress);
        const tan = curve.getTangentAt(progress);
        const right = new THREE.Vector3().crossVectors(tan, UP).normalize();

        const lateralVel = mode === 'drive' ? (lateral - prevLateral) / Math.max(dt, 0.001) : 0;

        kart.position.copy(p).addScaledVector(right, lateral);
        kart.lookAt(p.clone().add(tan));

        const slip = Math.atan2(lateralVel, Math.max(speed, 25));
        kartLean.rotation.y = clamp(slip, -0.3, 0.3);
        const targetLean = steer * 0.22;
        leanValue += (targetLean - leanValue) * Math.min(1, 8 * dt);
        kartLean.rotation.z = leanValue;

        const bounce = (mode !== 'countdown') ? Math.abs(Math.sin(now * 0.03 * (speed / MAX_SPEED + 0.4))) * 0.06 : 0;
        kartBounce.position.y = bounce;
        wheels.forEach((w) => { w.rotation.y += (speed / 0.42) * dt; });

        if (mode === 'drive') {
            // pickups
            for (const f of flowers) {
                if (f.done) continue;
                if (kart.position.distanceTo(f.mesh.position) < 2.3) {
                    f.done = true;
                    f.mesh.visible = false;
                    score++;
                    scoreEl.textContent = 'Поени: ' + score;
                    flowersEl.textContent = '🌸 ' + score + '/' + FLOWER_TOTAL;
                    if (window.tone) { window.tone(1046, 0.07); window.tone(1568, 0.09, 0.05); }
                }
            }
            // obstacles
            for (const o of obstacles) {
                if (now < o.cooldownUntil) continue;
                if (kart.position.distanceTo(o.mesh.position) < o.radius) {
                    slowUntil = now + o.def.slowTime * 1000;
                    slowMult = o.def.slowMult;
                    o.cooldownUntil = now + 600;
                    announce(o.hitText);
                    if (window.gentleMiss) window.gentleMiss();
                    if (!REDUCED_MOTION) kartBounce.position.y = 0.12;
                }
            }
        }

        // camera
        const camTarget = kart.position.clone()
            .addScaledVector(tan, -12)
            .add(new THREE.Vector3(0, 6.0, 0));
        camTarget.y = Math.max(camTarget.y, kart.position.y + 5.0);
        camera.position.lerp(camTarget, 1 - Math.exp(-4 * dt));
        const desired = kart.position.clone()
            .addScaledVector(tan, 10)
            .add(new THREE.Vector3(0, 1.5, 0));
        lookTarget.lerp(desired, 1 - Math.exp(-6 * dt));
        const lookPt = lookTarget.clone().add(
            new THREE.Vector3(
                (Math.random() - 0.5) * finishShake * 0.6,
                (Math.random() - 0.5) * finishShake * 0.6,
                0
            )
        );
        _tmpM.lookAt(camera.position, lookPt, UP);
        _tmpQ.setFromRotationMatrix(_tmpM);
        camera.quaternion.slerp(_tmpQ, 1 - Math.exp(-9 * dt));
        camera.rotateZ(steer * 0.02);
        finishShake = Math.max(0, finishShake - 1.8 * dt);

        const targetFov = 60 + (speed / MAX_SPEED) * 14;
        camera.fov += (targetFov - camera.fov) * Math.min(1, 4 * dt);
        camera.updateProjectionMatrix();

        updateEngine();

        renderer.render(scene, camera);
    }

    const clock = new THREE.Clock();
    function loop() {
        requestAnimationFrame(loop);
        const dt = Math.min(clock.getDelta(), 0.05);
        update(dt, curTime());
    }

    // --- input ---
    window.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') { keys.left = true; }
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') { keys.right = true; }
        startEngine();
    });
    window.addEventListener('keyup', (e) => {
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = false;
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = false;
    });
    function bindZone(id, dir) {
        const el = document.getElementById(id);
        const set = (v) => { keys[dir] = v; if (v) startEngine(); };
        el.addEventListener('pointerdown', (e) => { e.preventDefault(); set(true); });
        ['pointerup', 'pointercancel', 'pointerleave'].forEach((ev) =>
            el.addEventListener(ev, () => set(false))
        );
    }
    bindZone('r3d-zone-left', 'left');
    bindZone('r3d-zone-right', 'right');

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    launch();
    requestAnimationFrame(loop);

    window.__r3d = {
        mode: () => mode,
        speed: () => speed,
        lateral: () => lateral,
        progress: () => progress,
        lap: () => lap,
        score: () => score,
        flowerTotal: FLOWER_TOTAL,
        webglOK: true,
        tris: () => renderer.info.render.triangles
    };
}