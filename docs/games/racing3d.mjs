import * as THREE from 'three';

const REDUCED_MOTION = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
const UP = new THREE.Vector3(0, 1, 0);
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

const ROAD_WIDTH = 20;
const ROAD_SEGMENTS = 360;
const MAX_LATERAL = 9.6;
const STEER_YAW_MAX = 0.45;   // front-wheel steering angle at full lock
const LATERAL_GAIN = 26;      // lateral speed per radian of front-wheel yaw
const MAX_SPEED = 35;
const ACCEL = 16;
const BOOST_MULT = 1.2;
const BOOST_TIME = 1200;
const BOOST_LAT = 3.0;
const RUMBLE_X = 9.0;
const RUMBLE_ON = 8.4;
const OFFROAD_LAT = 9.3;
const MAX_PARTICLES = 420;
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
    // --- shared (2D) world/music config + 3D-only extras --------------------
    const sharedCfg = window.RACING_CONFIG || { worlds: [], music: {} };
    const r3dCfg = window.RACING3D_CONFIG || { obstacles: {}, worlds: {}, kartColors: [] };
    const WORLD_LIST = (Array.isArray(sharedCfg.worlds) && sharedCfg.worlds.length)
        ? sharedCfg.worlds :
        [{ key: 'meadow', name: 'Ливада', collectible: '🌸', collectibleName: 'цвеће',
            bgTop: 0x7ec8e3, bgBottom: 0xb8e986, horizonColor: 0xa8d8f0, grassColor: 0x67c971,
            finishColor: 0xffd23f, curveSeed: 2026, music: 'meadow', obstacleTypes: ['puddle', 'barricade'] }];
    const KART_COLORS = (Array.isArray(r3dCfg.kartColors) && r3dCfg.kartColors.length)
        ? r3dCfg.kartColors : [{ name: 'Црвена', color: 0xe52521 }, { name: 'Плава', color: 0x3f9be0 }];
    const obstacleCfg = Object.assign({}, {
        puddle: { label: 'Бара', base: 0x4aa5e0, size: 1.5, slowMult: 0.5, slowTime: 1.5, hitText: 'Бара! Брзина смањена.' },
        rock: { label: 'Камен', base: 0x9aa0a6, size: 1.0, slowMult: 0, slowTime: 0.5, hitText: 'Камен! Кратка пауза.' },
        barricade: { label: 'Баријера', base: 0xe52521, size: 1.4, slowMult: 0.3, slowTime: 1.0, hitText: 'Баријера! Брзина смањена.' }
    }, r3dCfg.obstacles || {});

    // color helper: shared config passes '#RRGGBB' strings, 3D extras use raw hex numbers
    const col = (v, fb) => (typeof v === 'number' ? v
        : (typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v) ? parseInt(v.slice(1), 16) : fb));

    function loadSave() {
        try {
            const s = JSON.parse(localStorage.getItem(SAVE_KEY));
            if (!s || typeof s.wins !== 'number') return { wins: 0, world: 0, kart: 0 };
            return { wins: s.wins, world: s.world || 0, kart: s.kart || 0 };
        } catch (e) { return { wins: 0, world: 0, kart: 0 }; }
    }
    function persistSave(s) {
        const w = clamp(Math.round(s.world || 0), 0, WORLD_LIST.length - 1);
        const k = clamp(Math.round(s.kart || 0), 0, KART_COLORS.length - 1);
        try {
            localStorage.setItem(SAVE_KEY, JSON.stringify({ wins: s.wins, world: w, kart: k }));
        } catch (e) { /* private mode */ }
    }
    let save = loadSave();
    const worldIdx = clamp(save.world, 0, WORLD_LIST.length - 1);
    const kartIdx = clamp(save.kart, 0, KART_COLORS.length - 1);

    // merge shared 2D world palette + R3D extras into the 3D world object
    const base = WORLD_LIST[worldIdx];
    const ex = (r3dCfg.worlds && r3dCfg.worlds[base.key]) || {};
    const world = {
        key: base.key,
        name: base.name,
        collectible: base.collectible || '🌸',
        collectibleName: base.collectibleName || 'цвеће',
        laps: ex.laps || 3,
        flowersPerLap: ex.flowersPerLap || 12,
        hill: ex.hill || 1,
        pickup: ex.pickup || 'flower',
        pickupColor: ex.pickupColor || 0xff8fcc,
        music: base.music || base.key || 'meadow',
        decor: base.decor || [],
        sky: ex.sky || 'sun',
        moon: !!ex.moon,
        weather: ex.weather || '',
        curveSeed: base.curveSeed || 2026,
        obstacleTypes: base.obstacleTypes || ['puddle'],
        bgTop: col(ex.bgTop, col(base.bgTop, 0x7ec8e3)),
        bgBottom: col(ex.bgBottom, col(base.bgBottom, 0xb8e986)),
        fogColor: col(ex.fogColor, col(base.horizonColor, 0xa8d8f0)),
        grassColor: col(ex.grassColor, col(base.grassColor, 0x67c971)),
        finishColor: col(ex.finishColor, col(base.finishColor, 0xffd23f)),
        boostColor: col(ex.boostColor, 0xffd23f),
        sunColor: col(ex.sunColor, 0xfff3d6),
        ambColor: col(ex.ambColor, 0xffffff),
        treeTrunk: col(ex.treeTrunk, 0x8b5a2b),
        treeCrown: col(ex.treeCrown, 0x2e7d32),
        kartAccent: col(ex.kartAccent, 0xffd23f),
        wheelColor: col(ex.wheelColor, 0x1c1c1c),
        hubColor: col(ex.hubColor, 0xbdbdbd),
        kartColor: col(KART_COLORS[kartIdx].color, col(ex.kartColor, 0xe52521))
    };
    const TOTAL_LAPS = world.laps;
    const FLOWER_TOTAL = world.flowersPerLap;
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
    flowersEl.textContent = world.collectible + ' 0/' + FLOWER_TOTAL;
    roundEl.textContent = 'Круг 1/' + TOTAL_LAPS;

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
    scene.add(new THREE.AmbientLight(world.ambColor || 0xffffff, 0.62));
    const sun = new THREE.DirectionalLight(world.sunColor || 0xfff3d6, 1.05);
    sun.position.set(60, 90, 40);
    scene.add(sun);
    const rim = new THREE.DirectionalLight(0xbfe0ff, 0.45);
    rim.position.set(-40, 40, -60);
    scene.add(rim);
    const fill = new THREE.DirectionalLight(0xffffff, 0.25);
    fill.position.set(0, 30, 70);
    scene.add(fill);

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

    // --- sky props: stars / sun / moon / drifting clouds ---
    if (world.sky === 'stars') {
        const starN = 260;
        const sp = new Float32Array(starN * 3);
        for (let i = 0; i < starN; i++) {
            const th = Math.random() * Math.PI * 2;
            const ph = Math.acos(Math.random());
            const r = 470 + Math.random() * 60;
            sp[i * 3] = Math.cos(th) * Math.sin(ph) * r;
            sp[i * 3 + 1] = Math.cos(ph) * r;
            sp[i * 3 + 2] = Math.sin(th) * Math.sin(ph) * r;
        }
        const starGeo = new THREE.BufferGeometry();
        starGeo.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
        const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({
            color: world.moon ? 0xdfe6ff : 0xffffff,
            size: 1.8, transparent: true, sizeAttenuation: false, fog: false
        }));
        scene.add(stars);
    } else if (world.moon) {
        const moonFace = () => {
            const m = new THREE.Mesh(
                new THREE.CircleGeometry(24, 28),
                new THREE.MeshBasicMaterial({ color: 0xfff2d0, fog: false })
            );
            m.position.set(280, 300, -380);
            m.lookAt(0, 0, 0);
            scene.add(m);
            return m;
        };
        moonFace();
        const crater = new THREE.Mesh(
            new THREE.CircleGeometry(7, 14),
            new THREE.MeshBasicMaterial({ color: 0xddc8a0, fog: false })
        );
        crater.position.set(294, 288, -380);
        crater.lookAt(0, 0, 0);
        scene.add(crater);
    } else {
        const sunC = new THREE.Mesh(
            new THREE.CircleGeometry(30, 28),
            new THREE.MeshBasicMaterial({ color: world.sunColor || 0xfff3d6, fog: false })
        );
        sunC.position.set(300, 330, -420);
        sunC.lookAt(0, 0, 0);
        scene.add(sunC);
    }
    const driftClouds = [];
    if (world.sky === 'clouds' && !world.moon) {
        const cloudCv = document.createElement('canvas');
        cloudCv.width = 200; cloudCv.height = 128;
        const cg2 = cloudCv.getContext('2d');
        cg2.fillStyle = 'rgba(255,255,255,0.92)';
        for (let k = 0; k < 6; k++) {
            cg2.beginPath();
            cg2.arc(55 + k * 18, 66 + (k % 3) * 10 - 6, 20 + (k % 4) * 4, 0, Math.PI * 2);
            cg2.fill();
        }
        const cloudTex = new THREE.CanvasTexture(cloudCv);
        for (let i = 0; i < 7; i++) {
            const cl = new THREE.Sprite(new THREE.SpriteMaterial({ map: cloudTex, transparent: true, opacity: 0.9, fog: false }));
            const a = (i / 7) * Math.PI * 2;
            const rad = 300 - (i % 3) * 45;
            const s = 55 + (i % 3) * 30;
            cl.position.set(Math.cos(a) * rad, 190 + (i % 4) * 26, Math.sin(a) * rad);
            cl.scale.set(s, s * 0.62, 1);
            scene.add(cl);
            driftClouds.push({ cl, a: (i / 7) * Math.PI * 2, v: 0.5 + (i % 3) * 0.35, rad });
        }
    }

    // --- ground: hilly terrain ribbon + far low plane are built after the road (see below) ---

    // --- track curve ---
    const rand = mulberry32(world.curveSeed || 2026);
    const N = 16;
    const pts = [];
    for (let i = 0; i < N; i++) {
        const ang = (i / N) * Math.PI * 2;
        const r = 150 + (rand() - 0.5) * 95;
        const hillY = (Math.sin(ang * 2) * 4.6 + Math.sin(ang * 4) * 2.1) * (world.hill || 1) + (rand() - 0.5) * 2.6;
        pts.push(new THREE.Vector3(Math.cos(ang) * r, hillY, Math.sin(ang) * r));
    }
    const curve = new THREE.CatmullRomCurve3(pts, true);
    const trackLen = curve.getLength();
    let hillMax = -Infinity, hillMin = Infinity, minRoadClear = Infinity;
    for (let i = 0; i <= ROAD_SEGMENTS; i++) {
        const y = curve.getPointAt(i / ROAD_SEGMENTS).y;
        if (y > hillMax) hillMax = y;
        if (y < hillMin) hillMin = y;
        minRoadClear = Math.min(minRoadClear, (y + 0.02) - (y - 0.03));
    }
    const hillRange = hillMax - hillMin;

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

    // --- ground: hilly terrain ribbon that follows the track surface, so the road
    //     always sits ON the grass (never sinks below it in the valleys) + a far
    //     low plane for the view beyond the belt ---
    const TERRAIN_HALF = 58;
    const TERRAIN_SLOPE = 0.1;
    const groundYAt = (p, offset) => p.y - 0.03 - Math.max(0, Math.abs(offset) - ROAD_HALF) * TERRAIN_SLOPE;
    {
        const flat = new THREE.Mesh(
            new THREE.PlaneGeometry(2000, 2000),
            new THREE.MeshPhongMaterial({ color: world.grassColor })
        );
        flat.rotation.x = -Math.PI / 2;
        flat.position.y = -16;
        scene.add(flat);
        const pos = [], idx = [];
        const droop = (TERRAIN_HALF - ROAD_HALF) * TERRAIN_SLOPE;
        for (let i = 0; i <= ROAD_SEGMENTS; i++) {
            const t = i / ROAD_SEGMENTS;
            const p = curve.getPointAt(t);
            const tan = curve.getTangentAt(t);
            const right = new THREE.Vector3().crossVectors(tan, UP).normalize();
            const l = p.clone().addScaledVector(right, -TERRAIN_HALF);
            const r = p.clone().addScaledVector(right, TERRAIN_HALF);
            l.y -= 0.03 + droop; r.y -= 0.03 + droop;
            pos.push(l.x, l.y, l.z, r.x, r.y, r.z);
            if (i < ROAD_SEGMENTS) {
                const a = i * 2, b = a + 1, c = a + 2, d = a + 3;
                idx.push(a, c, b, b, c, d);
            }
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
        g.setIndex(idx);
        g.computeVertexNormals();
        scene.add(new THREE.Mesh(g, new THREE.MeshPhongMaterial({ color: world.grassColor, side: THREE.DoubleSide })));
    }

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
    // flat red/white edge rumble strips (replaces tall curbs — classic racetrack edge feel)
    {
        const rumbleMat = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide });
        const red = new THREE.Color(0xff4b40);
        const white = new THREE.Color(0xffffff);
        const rumbleBand = (lat) => ribbonVerts(0.6, lat, 0.04, (t) => ((Math.floor(t * 70) % 2) === 0) ? red : white);
        scene.add(new THREE.Mesh(rumbleBand(RUMBLE_X), rumbleMat));
        scene.add(new THREE.Mesh(rumbleBand(-RUMBLE_X), rumbleMat));
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
            const gy = groundYAt(base, dist);
            if (gy < -2) continue;
            const s = 0.8 + rand() * 1.1;
            const trunk = new THREE.Mesh(trunkGeo, trunkMat);
            trunk.position.copy(base); trunk.position.y = gy + 1.5 * s;
            trunk.scale.setScalar(s);
            const crown = new THREE.Mesh(crownGeo, crownMat);
            crown.position.copy(base); crown.position.y = gy + (1.5 + 3) * s;
            crown.scale.setScalar(s);
            scene.add(trunk, crown);
        }
    }
    // --- scenery: distance-readable landmarks (rocks, bushes, flower patches, flags, start-gate arch) ---
    {
        const rockMat = new THREE.MeshPhongMaterial({ color: 0x9aa0a6, shininess: 15 });
        const bushMat = new THREE.MeshPhongMaterial({ color: 0x3f9b4f, shininess: 12 });
        const rockGeo = new THREE.DodecahedronGeometry(0.9, 0);
        const bushGeo = new THREE.SphereGeometry(0.8, 8, 6);
        for (let i = 0; i < 28; i++) {
            const t = (i + 0.15) / 28;
            const p = curve.getPointAt(t);
            const tan = curve.getTangentAt(t);
            const right = new THREE.Vector3().crossVectors(tan, UP).normalize();
            const side = i % 2 === 0 ? 1 : -1;
            const dist = ROAD_HALF + 6 + rand() * 22;
            const base = p.clone().addScaledVector(right, side * dist);
            const gy = groundYAt(base, dist);
            if (i < 12) {
                const r = new THREE.Mesh(rockGeo, rockMat);
                const s = 0.6 + rand() * 1.0;
                r.position.copy(base); r.position.y = gy + s * 0.45;
                r.scale.set(s, s * 0.65, s);
                scene.add(r);
            } else {
                const b = new THREE.Mesh(bushGeo, bushMat);
                const s = 0.5 + rand() * 1.2;
                b.position.copy(base); b.position.y = gy + s * 0.5;
                b.scale.set(s, s * 0.75, s);
                scene.add(b);
            }
        }
        // flower patches (InstancedMesh: ~26 patches × 5 = 130 instances)
        const petalColors = [0xff8fcc, 0xffffff, 0xffe066, 0xd8a0ff, 0xffb380];
        const patchGeo = new THREE.SphereGeometry(0.16, 6, 5);
        const patchMat = new THREE.MeshPhongMaterial({ color: 0xffffff });
        const PATCH_N = 130;
        const patches = new THREE.InstancedMesh(patchGeo, patchMat, PATCH_N);
        patches.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        const _tmpD = new THREE.Matrix4();
        let pi = 0;
        for (let i = 0; i < 26 && pi < PATCH_N; i++) {
            const t = (i + 0.42) / 26;
            const p = curve.getPointAt(t);
            const tan = curve.getTangentAt(t);
            const right = new THREE.Vector3().crossVectors(tan, UP).normalize();
            const side = i % 2 === 0 ? 1 : -1;
            const dist = ROAD_HALF + 3 + rand() * 8;
            const base = p.clone().addScaledVector(right, side * dist);
            for (let k = 0; k < 5 && pi < PATCH_N; k++) {
                const ox = (rand() - 0.5) * 1.6;
                const oz = (rand() - 0.5) * 1.6;
                const s = 0.7 + rand() * 0.6;
                _tmpD.makeTranslation(base.x + ox, base.y + 0.08, base.z + oz);
                _tmpD.scale(new THREE.Vector3(s, s, s));
                patches.setMatrixAt(pi, _tmpD);
                patches.setColorAt(pi, new THREE.Color(petalColors[(i + k) % petalColors.length]));
                pi++;
            }
        }
        if (pi > 0) { patches.count = pi; scene.add(patches); }
        // pennant flags (festive MK-style readable from far)
        const poleMat = new THREE.MeshPhongMaterial({ color: 0x5a4a36 });
        const poleGeo = new THREE.CylinderGeometry(0.08, 0.08, 3.2, 5);
        const flagColors = [world.finishColor || 0xffd23f, 0xff4040, 0x40a0ff];
        for (let i = 0; i < 24; i++) {
            const t = (i + 0.1) / 24;
            const p = curve.getPointAt(t);
            const tan = curve.getTangentAt(t);
            const right = new THREE.Vector3().crossVectors(tan, UP).normalize();
            const side = i % 2 === 0 ? 1 : -1;
            const dist = ROAD_HALF + 2.2;
            const base = p.clone().addScaledVector(right, side * dist);
            const pole = new THREE.Mesh(poleGeo, poleMat);
            pole.position.copy(base); pole.position.y = 1.6;
            scene.add(pole);
            const col = new THREE.Color(flagColors[i % 3]);
            const fm = new THREE.MeshBasicMaterial({ color: col, side: THREE.DoubleSide });
            const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 0.45), fm);
            flag.position.copy(base); flag.position.y = 3.0;
            flag.lookAt(p.clone().add(tan));
            scene.add(flag);
        }
        // start-gate arch (tall landmark over the finish line — readable from far)
        {
            const p0 = curve.getPointAt(0);
            const tan0 = curve.getTangentAt(0);
            const right0 = new THREE.Vector3().crossVectors(tan0, UP).normalize();
            const gateMat = new THREE.MeshPhongMaterial({ color: world.treeTrunk, shininess: 15 });
            const gateGeo = new THREE.CylinderGeometry(0.25, 0.3, 7.5, 7);
            const lBase = p0.clone().addScaledVector(right0, -(ROAD_HALF + 1.8));
            const rBase = p0.clone().addScaledVector(right0, (ROAD_HALF + 1.8));
            lBase.y += 3.75; rBase.y += 3.75;
            const gL = new THREE.Mesh(gateGeo, gateMat); gL.position.copy(lBase); scene.add(gL);
            const gR = new THREE.Mesh(gateGeo, gateMat); gR.position.copy(rBase); scene.add(gR);
            const bannerMat = new THREE.MeshBasicMaterial({ color: world.finishColor || 0xffd23f });
            const banner = new THREE.Mesh(new THREE.BoxGeometry(ROAD_WIDTH + 3.6, 1.1, 0.25), bannerMat);
            banner.position.copy(p0); banner.position.y = 7.2;
            banner.lookAt(p0.clone().add(tan0));
            scene.add(banner);
            // checkered strip on banner
            {
                const cv = document.createElement('canvas');
                cv.width = 128; cv.height = 16;
                const g = cv.getContext('2d');
                for (let ix = 0; ix < 16; ix++) for (let iy = 0; iy < 4; iy++) { g.fillStyle = (ix+iy)%2?'#222':'#eee'; g.fillRect(ix*8,iy*4,8,4); }
                const tx = new THREE.Mesh(new THREE.BoxGeometry(ROAD_WIDTH + 3.0, 0.38, 0.26),
                    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv) }));
                tx.position.copy(p0); tx.position.y = 7.85;
                tx.lookAt(p0.clone().add(tan0));
                scene.add(tx);
            }
        }
    }

    // per-world emoji decor billboards (camera-facing sprites from the shared decor list)
    if (world.decor && world.decor.length) {
        const texCache = {};
        const decorTex = (emoji) => {
            if (!texCache[emoji]) {
                const cv = document.createElement('canvas');
                cv.width = cv.height = 128;
                const cg = cv.getContext('2d');
                cg.font = '104px serif';
                cg.textAlign = 'center';
                cg.textBaseline = 'middle';
                cg.fillText(emoji, 64, 66);
                texCache[emoji] = new THREE.CanvasTexture(cv);
            }
            return texCache[emoji];
        };
        const scaleN = base.decorScale || 1;
        for (let i = 0; i < 16; i++) {
            const t = (i + 0.5) / 16 + (rand() - 0.5) * 0.02;
            const p = curve.getPointAt(t);
            const tan = curve.getTangentAt(t);
            const right = new THREE.Vector3().crossVectors(tan, UP).normalize();
            const side = i % 2 === 0 ? 1 : -1;
            const dist = ROAD_HALF + 10 + rand() * 22;
            const baseP = p.clone().addScaledVector(right, side * dist);
            const spr = new THREE.Sprite(new THREE.SpriteMaterial({
                map: decorTex(world.decor[i % world.decor.length]),
                transparent: true, depthTest: true
            }));
            const s = (2.6 + rand() * 1.6) * scaleN;
            spr.scale.set(s, s, 1);
            spr.position.copy(baseP);
            spr.position.y = groundYAt(baseP, dist) + s * 0.55;
            scene.add(spr);
        }
    }

    // --- race-track mini-map (top-down loop + live running position) ---
    const mapEl = document.getElementById('r3d-map');
    let mapCanvas = null, mapCtx = null, mapPts = [], mapScale = 1, lastMapMarker = { t: 0, x: 0, y: 0 };
    if (mapEl) {
        const MAP_STEPS = 140;
        const loopPts = [];
        for (let j = 0; j <= MAP_STEPS; j++) loopPts.push(curve.getPointAt(j / MAP_STEPS));
        mapCanvas = document.createElement('canvas');
        mapEl.appendChild(mapCanvas);
        function layoutMap() {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const cw = Math.max(64, mapEl.clientWidth), ch = Math.max(64, mapEl.clientHeight);
            mapCanvas.width = Math.round(cw * dpr);
            mapCanvas.height = Math.round(ch * dpr);
            mapCtx = mapCanvas.getContext('2d');
            mapCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
            let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
            for (const p of loopPts) { minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); minZ = Math.min(minZ, p.z); maxZ = Math.max(maxZ, p.z); }
            const pad = Math.floor(cw * 0.08);
            mapScale = Math.min((cw - pad * 2) / (maxX - minX), (ch - pad * 2) / (maxZ - minZ)) || 1;
            const midX = (minX + maxX) / 2, midZ = (minZ + maxZ) / 2;
            mapPts = loopPts.map((p) => ({ x: cw / 2 + (p.x - midX) * mapScale, y: ch / 2 + (p.z - midZ) * mapScale }));
        }
        layoutMap();
        window.addEventListener('resize', layoutMap);
    }
    function drawMap() {
        if (!mapCtx || mapPts.length < 2) return;
        const c = mapCtx, w = mapCanvas.width / Math.min(window.devicePixelRatio || 1, 2);
        c.clearRect(0, 0, w, w);
        c.lineCap = 'round'; c.lineJoin = 'round';
        const roadW = Math.max(8, ROAD_WIDTH * mapScale);
        c.beginPath();
        mapPts.forEach((pt, i) => { if (i === 0) c.moveTo(pt.x, pt.y); else c.lineTo(pt.x, pt.y); });
        c.closePath();
        c.strokeStyle = '#9aa0a6'; c.lineWidth = roadW; c.stroke();
        const show = progress % 1;
        c.beginPath();
        for (let i = 0; i <= mapPts.length; i++) {
            const t = i / mapPts.length;
            if (t > show) break;
            const pt = mapPts[Math.min(i, mapPts.length - 1)];
            if (i === 0) c.moveTo(pt.x, pt.y); else c.lineTo(pt.x, pt.y);
        }
        c.strokeStyle = '#ffd23f'; c.lineWidth = roadW * 0.55; c.stroke();
        const t0 = mapPts[0], t1 = mapPts[1] || mapPts[0];
        const dx = t1.x - t0.x, dz = t1.y - t0.y;
        const L = Math.hypot(dx, dz) || 1;
        const nx = -dz / L * roadW * 0.48, ny = dx / L * roadW * 0.48;
        c.beginPath(); c.moveTo(t0.x + nx, t0.y + ny); c.lineTo(t0.x - nx, t0.y - ny);
        c.strokeStyle = '#222'; c.lineWidth = Math.max(2, roadW * 0.5); c.stroke();
        c.beginPath(); c.moveTo(t0.x + nx, t0.y + ny); c.lineTo(t0.x - nx, t0.y - ny);
        c.strokeStyle = '#eee'; c.lineWidth = Math.max(1, roadW * 0.5) / 2.4; c.stroke();
        const fi = show * (mapPts.length - 1);
        const i0 = Math.floor(fi), i1 = Math.min(mapPts.length - 1, i0 + 1), f = fi - i0;
        const mk = {
            x: mapPts[i0].x + (mapPts[i1].x - mapPts[i0].x) * f,
            y: mapPts[i0].y + (mapPts[i1].y - mapPts[i0].y) * f
        };
        lastMapMarker = { t: show, x: mk.x, y: mk.y };
        c.beginPath(); c.arc(mk.x, mk.y, Math.max(4, w * 0.035), 0, Math.PI * 2);
        c.fillStyle = '#e52521'; c.fill();
        c.lineWidth = Math.max(1.5, w * 0.01); c.strokeStyle = '#fff'; c.stroke();
    }

    // --- kart (exaggerated cartoon box kart: glossy plastic, rim sheen, chunky wheels) ---
    const kartMat = new THREE.MeshPhongMaterial({ color: world.kartColor, shininess: 90, emissive: 0x120000 });
    const accentMat = new THREE.MeshPhongMaterial({ color: world.kartAccent, shininess: 70, emissive: 0x141000 });
    const darkMat = new THREE.MeshPhongMaterial({ color: 0x2a2a30, shininess: 30 });
    const wheelMat = new THREE.MeshPhongMaterial({ color: world.wheelColor, shininess: 30 });
    const hubMat = new THREE.MeshPhongMaterial({ color: world.hubColor, shininess: 80, emissive: 0x666666 });
    const rimMat = new THREE.MeshPhongMaterial({ color: 0xffffff, shininess: 20 });
    const helmMat = new THREE.MeshPhongMaterial({ color: world.kartAccent, shininess: 80, emissive: 0x141000 });
    const skinMat = new THREE.MeshPhongMaterial({ color: 0xffdca8, shininess: 20 });
    const sheenMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.18 });
    const glassMat = new THREE.MeshPhongMaterial({ color: 0x1e3a5f, shininess: 140 });

    const kart = new THREE.Group();
    const kartBounce = new THREE.Group(); // suspension bounce
    const kartLean = new THREE.Group();   // turn roll + slip yaw
    kart.add(kartBounce);
    kartBounce.add(kartLean);

    const hull = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.6, 3.4), kartMat);
    hull.position.y = 0.92;
    kartLean.add(hull);
    // hot-rim sheen strip along the hull ridge (cartoon plastic highlight)
    const sheen = new THREE.Mesh(new THREE.BoxGeometry(1.84, 0.05, 3.26), sheenMat);
    sheen.position.y = 1.24;
    kartLean.add(sheen);
    const nose = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.45, 1.0), kartMat);
    nose.position.set(0, 0.8, 2.2);
    kartLean.add(nose);
    const bumper = new THREE.Mesh(new THREE.SphereGeometry(0.55, 12, 8), accentMat);
    bumper.position.set(0, 0.82, 2.72);
    bumper.scale.set(1.5, 0.9, 0.85);
    kartLean.add(bumper);
    const wing = new THREE.Mesh(new THREE.BoxGeometry(2.15, 0.16, 0.75), kartMat);
    wing.position.set(0, 1.42, -1.9);
    kartLean.add(wing);
    const stripe1 = new THREE.Mesh(new THREE.BoxGeometry(2.04, 0.13, 0.95), accentMat);
    stripe1.position.set(0, 0.94, 0.8);
    kartLean.add(stripe1);
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.55, 1.6), kartMat);
    cabin.position.set(0, 1.4, -0.6);
    kartLean.add(cabin);
    const windshield = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.36), glassMat);
    windshield.position.set(0, 1.56, 0.22);
    windshield.rotation.x = -0.25;
    kartLean.add(windshield);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 10), skinMat);
    head.position.set(0, 1.78, -0.6);
    kartLean.add(head);
    const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.34, 12, 10), helmMat);
    helmet.position.set(0, 1.78, -0.62);
    helmet.scale.set(1, 0.94, 1.03);
    kartLean.add(helmet);
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.18, 0.08), new THREE.MeshPhongMaterial({ color: 0x222222, shininess: 120 }));
    visor.position.set(0, 1.8, -0.34);
    kartLean.add(visor);
    // exhaust pipes (boost-flame anchors)
    const exGeo = new THREE.CylinderGeometry(0.1, 0.17, 0.5, 8);
    exGeo.rotateX(Math.PI / 2);
    const exL = new THREE.Mesh(exGeo, darkMat); exL.position.set(-0.7, 1.02, -2.0); kartLean.add(exL);
    const exR = new THREE.Mesh(exGeo, darkMat); exR.position.set(0.7, 1.02, -2.0); kartLean.add(exR);

    const wheelGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.38, 16);
    wheelGeo.rotateZ(Math.PI / 2);
    const ringGeo = new THREE.CylinderGeometry(0.54, 0.54, 0.16, 16);
    ringGeo.rotateZ(Math.PI / 2);
    const hubGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.4, 12);
    hubGeo.rotateZ(Math.PI / 2);
    // chunky tread studs stuck on the tyre circumference — a repeating pattern
    // so the wheels visibly spin as they roll (chase cam sees the sidewalls)
    const studGeo = new THREE.BoxGeometry(0.09, 0.07, 0.07);
    const studMat = new THREE.MeshPhongMaterial({ color: world.boostColor || 0xffd23f, emissive: 0x664400, shininess: 40 });
    const wheels = [];
    const wheelParts = [];
    const steerWheels = [];
    let studCount = 0;
    const exhaust = [exL, exR];
    [[-1.05, 0.5, 1.55], [1.05, 0.5, 1.55], [-1.1, 0.5, -1.45], [1.1, 0.5, -1.45]].forEach((p, i) => {
        // per-wheel joint: carries tyre/ring/hub/studs and yaws (front wheels) to point where steering
        const wg = new THREE.Group();
        wg.position.set(p[0], p[1], p[2]);
        kartLean.add(wg);
        const w = new THREE.Mesh(wheelGeo, wheelMat);
        wg.add(w);
        const ring = new THREE.Mesh(ringGeo, rimMat);
        ring.position.add(new THREE.Vector3(p[0] > 0 ? -1 : 1, 0, 0).multiplyScalar(0.14));
        wg.add(ring);
        const h = new THREE.Mesh(hubGeo, hubMat);
        h.position.add(new THREE.Vector3(p[0] > 0 ? -1 : 1, 0, 0).multiplyScalar(0.19));
        wg.add(h);
        const studs = new THREE.Group();
        for (let k = 0; k < 4; k++) {
            const a = k * Math.PI / 2;
            const s = new THREE.Mesh(studGeo, studMat);
            s.position.set(0, Math.sin(a) * 0.55, Math.cos(a) * 0.55);
            studs.add(s);
        }
        studCount += 4;
        wg.add(studs);
        wheels.push(w);
        wheelParts.push(w, ring, h, studs);
        if (i < 2) steerWheels.push(wg);
    });
    scene.add(kart);

    // --- pickups (per-world collectible mesh) ---
    function buildPickupMesh(kind, pColor, finColor) {
        const mat = (color, emissive, shin) => new THREE.MeshPhongMaterial({ color, emissive: emissive || 0, shininess: shin || 40 });
        const g = new THREE.Group();
        if (kind === 'shell') {
            const shell = new THREE.Mesh(new THREE.SphereGeometry(0.34, 12, 8), mat(pColor, 0x221a00, 70));
            shell.position.y = 0.5; shell.scale.set(1, 0.72, 0.8); g.add(shell);
            const fan = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.34, 10), mat(pColor, 0x221a00, 70));
            fan.position.set(0, 0.62, -0.24); fan.rotation.x = Math.PI / 2 - 0.5; g.add(fan);
        } else if (kind === 'snowflake') {
            for (let k = 0; k < 3; k++) {
                const arm = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.08, 0.14), mat(pColor, 0x00a0e0, 60));
                arm.position.y = 0.5; arm.rotation.y = (k / 3) * Math.PI; g.add(arm);
            }
        } else if (kind === 'candy') {
            const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.62, 8), mat(0xffffff));
            stick.position.y = 0.35; g.add(stick);
            const head = new THREE.Mesh(new THREE.SphereGeometry(0.34, 14, 10), mat(pColor, 0x552200, 90));
            head.position.y = 0.72; g.add(head);
            const swirl = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.07, 8, 16), mat(0xffffff, 0, 30));
            swirl.position.y = 0.72; swirl.scale.set(1, 1.35, 1); g.add(swirl);
        } else if (kind === 'gem') {
            const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.42, 0), mat(pColor, 0x0a220a, 120));
            gem.position.y = 0.62; g.add(gem);
        } else if (kind === 'star') {
            const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.46, 0), mat(pColor, 0x664400, 90));
            star.position.y = 0.62; star.scale.set(1, 1.15, 0.45); g.add(star);
        } else if (kind === 'moon') {
            const moon = new THREE.Mesh(new THREE.SphereGeometry(0.4, 14, 10), mat(pColor, 0x553300, 70));
            moon.position.y = 0.62; g.add(moon);
            const cut = new THREE.Mesh(new THREE.SphereGeometry(0.36, 14, 10), mat(pColor, 0x553300, 70));
            cut.position.set(0.28, 0.85, 0); g.add(cut);
        } else if (kind === 'carrot') {
            const bodyC = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.8, 10), mat(pColor, 0x442200, 60));
            bodyC.position.y = 0.62; g.add(bodyC);
            for (let l = 0; l < 3; l++) {
                const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.4, 6), mat(0x2e8b2e));
                leaf.position.set(-0.1 + l * 0.1, 0.98, 0);
                leaf.rotation.z = (l - 1) * 0.4; g.add(leaf);
            }
        } else { // flower
            const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.5, 6), mat(0x2e8b2e));
            g.add(stem);
            for (let k = 0; k < 5; k++) {
                const a = (k / 5) * Math.PI * 2;
                const pet = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 6), mat(pColor, 0, 30));
                pet.position.set(Math.cos(a) * 0.34, 0.5, Math.sin(a) * 0.34);
                pet.scale.set(1, 0.55, 0.62);
                g.add(pet);
            }
            const core = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), mat(finColor, 0x9a6b00, 40));
            core.position.y = 0.5;
            g.add(core);
        }
        return g;
    }
    const pickupBase = buildPickupMesh(world.pickup, world.pickupColor, world.finishColor);
    const pickups = [];
    for (let i = 0; i < FLOWER_TOTAL; i++) {
        const t = (i + 0.5) / FLOWER_TOTAL;
        const p = curve.getPointAt(t);
        const tan = curve.getTangentAt(t);
        const right = new THREE.Vector3().crossVectors(tan, UP).normalize();
        const off = (t % 1 < 0.5 ? 2.4 : -2.4);
        const pos = p.clone().addScaledVector(right, off);
        if (pos.y > 3.5) pos.y -= 0.5;
        const g = pickupBase.clone();
        g.position.copy(pos);
        g.position.y += 0.3;
        scene.add(g);
        pickups.push({ mesh: g, done: false, baseY: g.position.y, phase: i * 0.9 });
    }

    // --- boost pads (⚡ speed burst + flames + whoosh) ---
    const boostPads = [];
    const BOOST_COUNT = 6;
    const boostTex = (() => {
        const cv = document.createElement('canvas'); cv.width = 128; cv.height = 64;
        const g = cv.getContext('2d');
        const bg = '#' + (world.boostColor || 0xffd23f).toString(16).padStart(6, '0');
        g.fillStyle = bg; g.fillRect(0, 0, 128, 64);
        g.fillStyle = '#fff';
        g.beginPath(); g.moveTo(58, 10); g.lineTo(72, 10); g.lineTo(66, 28); g.lineTo(82, 28); g.lineTo(52, 56); g.lineTo(60, 36); g.lineTo(46, 36); g.closePath(); g.fill();
        return new THREE.CanvasTexture(cv);
    })();
    const boostMat = new THREE.MeshBasicMaterial({ map: boostTex, side: THREE.DoubleSide });
    for (let i = 0; i < BOOST_COUNT; i++) {
        const t = (i + 0.75) / BOOST_COUNT + (rand() - 0.5) * 0.035;
        const p = curve.getPointAt(t % 1);
        const tan = curve.getTangentAt(t % 1);
        const right = new THREE.Vector3().crossVectors(tan, UP).normalize();
        const lat = (i % 2 === 0) ? BOOST_LAT : -BOOST_LAT;
        const pos = p.clone().addScaledVector(right, lat);
        pos.y += 0.07;
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.04, 2.6), boostMat);
        mesh.position.copy(pos);
        mesh.lookAt(p.clone().add(tan));
        scene.add(mesh);
        boostPads.push({ mesh, t: t % 1, x: lat, done: false, radius: 1.8 });
    }

    // --- obstacles ---
    const obstacles = [];
    const OBS_COUNT = Math.max(6, Math.min(16, Math.round((base.obstacleDensity || 0.005) * 1700)));
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
            if (type === 'rock') {
                const m = new THREE.Mesh(
                    new THREE.DodecahedronGeometry(def.size * 0.72, 0),
                    new THREE.MeshPhongMaterial({ color: def.base, flatShading: true, shininess: 25 })
                );
                m.position.copy(base);
                m.position.y += def.size * 0.3;
                m.rotation.y = rand() * Math.PI;
                m.scale.y = 0.72;
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
        obstacles.push({ mesh, def, radius: def.size + 1.2, cooldownUntil: 0, t, hitText: def.hitText || (def.label + '! Брзина смањена.') });
    }

    // --- state ---
    const keys = { left: false, right: false };
    let progress = 0.04;
    let lateral = 0;
    let speed = 0;
    let steer = 0;
    let lap = 1;
    let score = 0;
    let mode = 'menu';            // menu | countdown | drive | finished
    let countdownStart = 0;
    let slowUntil = 0;
    let slowMult = 1;
    let offroad = false;
    let engineStarted = false;
    let engineOsc = null;
    let engineGain = null;
    let finishShake = 0;
    let rumbleShake = 0;
    let leanValue = 0;
    let steerYawValue = 0;
    let steerDrive = 0;
    let slipYawValue = 0;
    let boostUntil = 0;
    let warnUntil = 0;
    let weatherAcc = 0;
    let driftNow = false;
    let skidAcc = 0;
    let dustAcc = 0;
    let flameAcc = 0;
    const lookTarget = new THREE.Vector3();
    const curTime = () => performance.now();

    // --- particles ---
    const particles = [];
    const particleGroup = new THREE.Group();
    scene.add(particleGroup);
    const _pCube = new THREE.BoxGeometry(0.14, 0.14, 0.14);
    const _pSmall = new THREE.BoxGeometry(0.08, 0.08, 0.08);
    const _pConfetti = new THREE.BoxGeometry(0.24, 0.24, 0.04);
    const _pSnow = new THREE.BoxGeometry(0.22, 0.22, 0.03);
    const _pStar = new THREE.BoxGeometry(0.16, 0.16, 0.16);
    function spawnP(o) {
        if (particles.length > MAX_PARTICLES) return;
        const geo = o.geo === 'confetti' ? _pConfetti : (o.geo === 'small' ? _pSmall : (o.geo === 'snow' ? _pSnow : (o.geo === 'star' ? _pStar : _pCube)));
        const mat = new THREE.MeshBasicMaterial({ color: o.col || 0xaaaaaa, transparent: true, opacity: 1, side: THREE.DoubleSide });
        const m = new THREE.Mesh(geo, mat);
        m.position.copy(o.pos);
        if (o.scale) m.scale.setScalar(o.scale);
        if (o.rot) m.rotation.set(o.rot[0], o.rot[1], o.rot[2]);
        particleGroup.add(m);
        particles.push({ m, vel: o.vel ? o.vel.clone() : new THREE.Vector3(), life: 0, max: o.max || 1, grow: o.grow || 0, gravity: o.gravity || 0, spin: o.spin || 0 });
    }
    function updateParticles(dt) {
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.life += dt;
            const k = p.life / p.max;
            p.m.position.addScaledVector(p.vel, dt);
            p.vel.y -= p.gravity * dt;
            p.m.material.opacity = Math.max(0, 1 - k);
            if (p.grow) p.m.scale.setScalar(p.m.scale.x + p.grow * dt);
            if (p.spin) { p.m.rotation.x += p.spin * dt; p.m.rotation.z += p.spin * 0.7 * dt; }
            if (p.life >= p.max) { particleGroup.remove(p.m); p.m.material.dispose(); particles.splice(i, 1); }
        }
    }
    function petalBurst(pos, colors) {
        for (let i = 0; i < 8; i++) {
            const ang = (i / 8) * Math.PI * 2 + Math.random() * 0.5;
            spawnP({
                pos, col: colors[i % colors.length],
                vel: new THREE.Vector3(Math.cos(ang) * 3.5, 2.5 + Math.random() * 2, Math.sin(ang) * 3.5),
                max: 0.65, grow: 1.2, geo: 'small', scale: 0.8 + Math.random() * 0.4, spin: 5 + Math.random() * 6
            });
        }
    }
    function confettiBurst(pos) {
        for (let i = 0; i < 110; i++) {
            const ang = Math.random() * Math.PI * 2;
            const sp = 4 + Math.random() * 7;
            spawnP({
                pos, col: [0xff4040, 0x40a0ff, 0xffd23f, 0x40e060, 0xff88cc, 0xff9933][i % 6],
                vel: new THREE.Vector3(Math.cos(ang) * sp, 8 + Math.random() * 7, Math.sin(ang) * sp),
                max: 2.5, gravity: 7, spin: 6 + Math.random() * 10, geo: 'confetti', scale: 0.7 + Math.random() * 0.5,
                rot: [Math.random() * 6, Math.random() * 6, Math.random() * 6]
            });
        }
    }
    function obstaclePuff(pos) {
        for (let i = 0; i < 6; i++) {
            const ang = (i / 6) * Math.PI * 2;
            spawnP({ pos: pos.clone(), col: 0xb0a896, vel: new THREE.Vector3(Math.cos(ang) * 2.2, 1.8 + Math.random(), Math.sin(ang) * 2.2), max: 0.45, grow: 2.5, geo: 'small', scale: 0.7 });
        }
    }
    function flamePuff(exhaustPos) {
        for (let e = 0; e < 2; e++) {
            const ep = exhaustPos[e] || exhaustPos[0];
            spawnP({
                pos: ep.clone(), col: [0xff6622, 0xffaa22][Math.random() > 0.5 ? 0 : 1],
                vel: new THREE.Vector3((Math.random() - 0.5) * 1.5, 0.8 + Math.random() * 1.2, -2.5 - Math.random() * 2),
                max: 0.3, grow: 2.5, scale: 1.1 + Math.random() * 0.5
            });
        }
    }
    function skidPuff(wheelPos) {
        spawnP({
            pos: wheelPos.clone(), col: 0x6a6a6a,
            vel: new THREE.Vector3((Math.random() - 0.5) * 1.5, 1 + Math.random() * 0.8, -1.2),
            max: 0.55, grow: 2, geo: 'small', scale: 0.6 + Math.random() * 0.5
        });
    }
    function dustPuff(pos) {
        spawnP({
            pos: pos.clone(), col: 0xb0a080,
            vel: new THREE.Vector3((Math.random() - 0.5) * 2, 1.2 + Math.random() * 1.2, (Math.random() - 0.5) * 2),
            max: 0.5, grow: 1.8, geo: 'small', scale: 0.6 + Math.random() * 0.4
        });
    }

    // --- audio helpers ---
    let lastRumbleSnd = 0;
    function playWhoosh() { try { window.sweep(350, 80, 0.35, 0, 'sine', 0.22); } catch (_){} }
    function playRumble(now) { if (now - lastRumbleSnd > 350) { lastRumbleSnd = now; try { window.sweep(75, 38, 0.38, 0, 'square', 0.14); } catch (_){} } }

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
            if (musicOn) startMusic();
        } catch (e) { engineStarted = false; }
    }
    function updateEngine() {
        if (engineOsc && engineGain) {
            try {
                engineOsc.frequency.setTargetAtTime(55 + speed * 1.1, window.ctx().currentTime, 0.08);
            } catch (e) { /* ignore */ }
        }
    }

    // --- per-world music (mirrors the 2D racer's step scheduler) ---
    let musicOn = localStorage.getItem('racing3dMusic') !== 'off';
    let musicTimer = null;
    let musicStep = 0;
    let musicStepTime = 0;
    function noteFreq(root, semi) { return root * Math.pow(2, semi / 12); }
    let noiseBuf = null;
    function makeNoiseBuffer(audio, dur) {
        const b = audio.createBuffer(1, Math.ceil(audio.sampleRate * dur), audio.sampleRate);
        const d = b.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
        return b;
    }
    function playAmbient(type, volParam) {
        const audio = window.ctx();
        if (!audio) return;
        try {
            const vk = (volParam || 0.035) / 0.035;
            const t = audio.currentTime;
            if (type === 'bird') {
                for (let k = 0; k < 3; k++) {
                    const t0 = t + k * 0.14;
                    const base = 2200 + Math.random() * 800;
                    const o = audio.createOscillator(), g = audio.createGain();
                    o.connect(g); g.connect(audio.destination);
                    o.type = 'sine';
                    o.frequency.setValueAtTime(base, t0);
                    o.frequency.exponentialRampToValueAtTime(base * 1.4, t0 + 0.05);
                    o.frequency.exponentialRampToValueAtTime(base * 0.9, t0 + 0.09);
                    g.gain.setValueAtTime(0, t0);
                    g.gain.linearRampToValueAtTime(0.035 * vk, t0 + 0.01);
                    g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.1);
                    o.start(t0); o.stop(t0 + 0.11);
                }
            } else if (type === 'waves') {
                if (!noiseBuf) noiseBuf = makeNoiseBuffer(audio, 2);
                const src = audio.createBufferSource(), f = audio.createBiquadFilter(), g = audio.createGain();
                src.buffer = noiseBuf; f.type = 'lowpass';
                f.frequency.setValueAtTime(420, t);
                f.frequency.linearRampToValueAtTime(760, t + 1.6);
                f.frequency.linearRampToValueAtTime(420, t + 3.2);
                g.gain.setValueAtTime(0.0001, t);
                g.gain.linearRampToValueAtTime(0.05 * vk, t + 1.0);
                g.gain.linearRampToValueAtTime(0.0001, t + 3.2);
                src.connect(f); f.connect(g); g.connect(audio.destination);
                src.start(t); src.stop(t + 3.3);
            } else if (type === 'wind') {
                if (!noiseBuf) noiseBuf = makeNoiseBuffer(audio, 2);
                const src = audio.createBufferSource(), f = audio.createBiquadFilter(), g = audio.createGain();
                src.buffer = noiseBuf; src.loop = true; f.type = 'bandpass';
                const f0 = 420 + Math.random() * 220;
                f.frequency.setValueAtTime(f0, t);
                f.frequency.linearRampToValueAtTime(f0 + 90, t + 1.4);
                f.frequency.linearRampToValueAtTime(f0, t + 2.8);
                g.gain.setValueAtTime(0.0001, t);
                g.gain.linearRampToValueAtTime(0.035 * vk, t + 0.9);
                g.gain.linearRampToValueAtTime(0.0001, t + 2.8);
                src.connect(f); f.connect(g); g.connect(audio.destination);
                src.start(t); src.stop(t + 2.9);
            } else if (type === 'chime') {
                for (let k = 0; k < 2; k++) {
                    const t0 = t + k * 0.3;
                    const base = 1240 + Math.random() * 360;
                    const o = audio.createOscillator(), g = audio.createGain();
                    o.connect(g); g.connect(audio.destination);
                    o.type = 'sine';
                    o.frequency.value = base;
                    g.gain.setValueAtTime(0, t0);
                    g.gain.linearRampToValueAtTime(0.035 * vk * 0.8, t0 + 0.02);
                    g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.7);
                    o.start(t0); o.stop(t0 + 0.75);
                }
            } else if (type === 'stars') {
                const t0 = t + Math.random() * 0.4;
                const base = 3200 + Math.random() * 700;
                const o = audio.createOscillator(), g = audio.createGain();
                o.connect(g); g.connect(audio.destination);
                o.type = 'sine';
                o.frequency.value = base;
                g.gain.setValueAtTime(0, t0);
                g.gain.linearRampToValueAtTime(0.035 * vk * 0.5, t0 + 0.01);
                g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.35);
                o.start(t0); o.stop(t0 + 0.4);
            } else if (type === 'owl') {
                const f0 = 320 + Math.random() * 60;
                for (let k = 0; k < 2; k++) {
                    const t0 = t + k * (0.55 + Math.random() * 0.1);
                    const o = audio.createOscillator(), g = audio.createGain();
                    o.connect(g); g.connect(audio.destination);
                    o.type = 'sine';
                    o.frequency.setValueAtTime(f0, t0);
                    o.frequency.linearRampToValueAtTime(f0 * 0.96, t0 + 0.35);
                    g.gain.setValueAtTime(0, t0);
                    g.gain.linearRampToValueAtTime(0.035 * vk * 1.1, t0 + 0.08);
                    g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.4);
                    o.start(t0); o.stop(t0 + 0.45);
                }
            }
        } catch (e) { /* audio not ready */ }
    }
    function startMusic() {
        const m = sharedCfg.music && sharedCfg.music[world.music];
        if (!m || !window.ctx) return;
        if (musicTimer) clearInterval(musicTimer);
        musicStep = 0;
        try { musicStepTime = window.ctx().currentTime + 0.05; } catch (e) { return; }
        const eighth = 60 / m.bpm / 2;
        musicTimer = setInterval(() => {
            const audio = window.ctx();
            const horizon = audio.currentTime + 0.35;
            while (musicStepTime < horizon) {
                const mel = m.seq[musicStep % m.seq.length];
                if (mel !== null && mel !== undefined) {
                    const o = audio.createOscillator(), g = audio.createGain();
                    o.connect(g); g.connect(audio.destination);
                    o.type = m.wave;
                    o.frequency.value = noteFreq(m.root, mel);
                    g.gain.setValueAtTime(0, musicStepTime);
                    g.gain.linearRampToValueAtTime(m.vol, musicStepTime + 0.02);
                    g.gain.exponentialRampToValueAtTime(0.001, musicStepTime + eighth * 0.9);
                    o.start(musicStepTime); o.stop(musicStepTime + eighth * 0.95);
                }
                if (musicStep % 2 === 0) {
                    const bassIdx = (musicStep / 2) % m.bass.length;
                    const b = audio.createOscillator(), bg = audio.createGain();
                    b.connect(bg); bg.connect(audio.destination);
                    b.type = 'sine';
                    b.frequency.value = noteFreq(m.root, m.bass[bassIdx]);
                    bg.gain.setValueAtTime(0, musicStepTime);
                    bg.gain.linearRampToValueAtTime(m.vol * 0.7, musicStepTime + 0.03);
                    bg.gain.exponentialRampToValueAtTime(0.001, musicStepTime + eighth * 1.8);
                    b.start(musicStepTime); b.stop(musicStepTime + eighth * 1.85);
                }
                if (m.ambient && Math.random() < m.ambient.rate) playAmbient(m.ambient.sound, m.ambient.vol);
                musicStep++;
                musicStepTime += eighth;
            }
        }, 120);
    }
    function stopMusic() {
        if (musicTimer) { clearInterval(musicTimer); musicTimer = null; }
    }

    const musicBtnEl = document.getElementById('r3d-music-btn');
    if (musicBtnEl) {
        musicBtnEl.textContent = musicOn ? '🔊' : '🔇';
        musicBtnEl.addEventListener('click', () => {
            musicOn = !musicOn;
            localStorage.setItem('racing3dMusic', musicOn ? 'on' : 'off');
            musicBtnEl.textContent = musicOn ? '🔊' : '🔇';
            if (musicOn) startMusic(); else stopMusic();
        });
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
        if (mode !== 'menu') return;
        mode = 'countdown';
        countdownStart = curTime();
        lastCountdownIndex = -1;
        countdownEl.classList.add('show');
        announce('Припрема, крени!');
        startMusic();
    }

    function finish() {
        mode = 'finished';
        winModalEl.classList.add('show');
        winScoreEl.textContent = 'Поени: ' + score + '  ·  ' + world.collectible + ' ' + score + '/' + FLOWER_TOTAL;
        confettiBurst(kart.position);
        save = { wins: save.wins + 1, world: worldIdx, kart: kartIdx };
        persistSave(save);
        if (window.successChime) window.successChime();
        if (!REDUCED_MOTION) finishShake = 1;
    }

    restartBtn.addEventListener('click', () => location.reload());

    const nextWorldBtn = document.getElementById('r3d-next-world');
    if (nextWorldBtn) {
        nextWorldBtn.addEventListener('click', () => {
            save = { wins: save.wins, world: (worldIdx + 1) % WORLD_LIST.length, kart: kartIdx };
            persistSave(save);
            location.reload();
        });
    }

    // --- start world/kart picker ---
    const startModal = document.getElementById('r3d-start-modal');
    const worldGrid = document.getElementById('r3d-world-grid');
    const kartRow = document.getElementById('r3d-kart-row');
    const kartNameEl = document.getElementById('r3d-kart-name');
    const startBtn = document.getElementById('r3d-start-btn');
    const worldBtn = document.getElementById('r3d-world-btn');
    let pendingWorld = worldIdx;
    let pendingKart = kartIdx;
    function renderPicker() {
        if (worldGrid && worldGrid.children.length) {
            Array.from(worldGrid.children).forEach((b, i) => {
                b.classList.toggle('sel', i === pendingWorld);
                b.setAttribute('aria-pressed', i === pendingWorld ? 'true' : 'false');
            });
            Array.from(kartRow.children).forEach((b, i) => b.classList.toggle('sel', i === pendingKart));
            if (kartNameEl) kartNameEl.textContent = KART_COLORS[pendingKart].name;
            return;
        }
        WORLD_LIST.forEach((wb, i) => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'r3d-world-card' + (i === pendingWorld ? ' sel' : '');
            b.setAttribute('aria-pressed', i === pendingWorld ? 'true' : 'false');
            b.innerHTML = '<span class="wc-emoji">' + (wb.collectible || '🏁') + '</span><span class="wc-name">' + wb.name + '</span>';
            b.addEventListener('click', () => { pendingWorld = i; renderPicker(); });
            if (worldGrid) worldGrid.appendChild(b);
        });
        KART_COLORS.forEach((kb, i) => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'r3d-kart-swatch' + (i === pendingKart ? ' sel' : '');
            b.style.background = '#' + kb.color.toString(16).padStart(6, '0');
            b.setAttribute('aria-label', kb.name);
            b.title = kb.name;
            b.addEventListener('click', () => { pendingKart = i; renderPicker(); });
            if (kartRow) kartRow.appendChild(b);
        });
        if (kartNameEl) kartNameEl.textContent = KART_COLORS[pendingKart].name;
    }
    function showStartPicker() {
        pickerMidGame = mode !== 'menu';
        pendingWorld = worldIdx;
        pendingKart = kartIdx;
        mode = 'menu';
        renderPicker();
        if (startModal) startModal.classList.add('show');
        speed = 0;
        countdownEl.classList.remove('show');
    }
    let pickerMidGame = false;
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            const needsReload = pickerMidGame || pendingWorld !== worldIdx || pendingKart !== kartIdx;
            if (needsReload) {
                save = { wins: save.wins || 0, world: pendingWorld, kart: pendingKart };
                persistSave(save);
                location.reload();
                return;
            }
            if (startModal) startModal.classList.remove('show');
            launch();
        });
    }
    if (worldBtn) worldBtn.addEventListener('click', showStartPicker);
    const pickWorldBtn = document.getElementById('r3d-pick-world');
    if (pickWorldBtn) pickWorldBtn.addEventListener('click', showStartPicker);

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
            // the car follows the drive value, which follows the front-wheel
            // angle while a button is held and dies fast on release — so the car
            // stops drifting the moment you let go (wheels still unwind slowly)
            lateral += steerDrive * LATERAL_GAIN * dt;
            lateral = clamp(lateral, -MAX_LATERAL, MAX_LATERAL);

            let target = MAX_SPEED;
            if (now < boostUntil) target *= BOOST_MULT;
            if (now < slowUntil) target *= slowMult;
            offroad = Math.abs(lateral) > OFFROAD_LAT;
            if (offroad) target *= 0.62;
            if (now >= slowUntil) slowMult = 1;
            speed = clamp(speed + (target - speed) * Math.min(1, 2.2 * dt), 0, MAX_SPEED * BOOST_MULT);

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
        const slipYaw = clamp(slip, -0.3, 0.3);
        slipYawValue += (slipYaw - slipYawValue) * Math.min(1, 11 * dt);
        kartLean.rotation.y = slipYawValue;
        // front wheels turn in quickly; on release they slowly return to the middle
        if (steer !== 0) {
            steerYawValue += (steer * STEER_YAW_MAX - steerYawValue) * Math.min(1, 8 * dt);
            steerDrive += (steer * STEER_YAW_MAX - steerDrive) * Math.min(1, 8 * dt);
        } else {
            steerYawValue += (0 - steerYawValue) * Math.min(1, 2.8 * dt);
            steerDrive += (0 - steerDrive) * Math.min(1, 10 * dt);
        }
        steerWheels.forEach((g) => { g.rotation.y = steerYawValue; });
        // bank the body with the drive (straightens up fast with the car; the
        // kart stays where it is — no auto-center)
        const targetLean = (steerDrive / STEER_YAW_MAX) * 0.34;
        leanValue += (targetLean - leanValue) * Math.min(1, 10 * dt);
        kartLean.rotation.z = leanValue;

        const bounce = (mode !== 'countdown') ? Math.abs(Math.sin(now * 0.03 * (speed / MAX_SPEED + 0.4))) * 0.06 + (now < boostUntil ? 0.05 : 0) : 0;
        kartBounce.position.y = bounce;
        // wheels roll forward around their axle (radius 0.5): rotation.x, not y
        const wheelRoll = (speed / 0.5) * dt;
        wheelParts.forEach((p) => { p.rotation.x -= wheelRoll; });

        // pickup idle animation: slow spin + gentle bob (runs even in menu picker)
        const bobNow = now / 1000;
        for (const f of pickups) {
            f.mesh.rotation.y += dt * 1.2;
            f.mesh.position.y = f.baseY + Math.sin(bobNow * 2 + f.phase) * 0.12;
        }

        // per-world weather (snowfall / falling stars) drifting around the kart
        if (world.weather && particles.length < MAX_PARTICLES - 40) {
            weatherAcc += dt;
            if (weatherAcc > 0.15) {
                weatherAcc = 0;
                for (let w = 0; w < 2 && particles.length < MAX_PARTICLES - 30; w++) {
                    const p2 = kart.position.clone();
                    p2.y += 10 + Math.random() * 10;
                    p2.x += (Math.random() - 0.5) * 26;
                    p2.z += (Math.random() - 0.5) * 26;
                    if (world.weather === 'snow') {
                        spawnP({ pos: p2, col: 0xffffff,
                            vel: new THREE.Vector3((Math.random() - 0.5) * 1.2, -2.2 - Math.random() * 1.2, (Math.random() - 0.5) * 1.2),
                            max: 6, geo: 'snow', scale: 0.9 + Math.random() * 0.8, spin: 1 + Math.random() });
                    } else {
                        spawnP({ pos: p2, col: [0xffd23f, 0xd8e0ff, 0xffffff][Math.floor(Math.random() * 3)],
                            vel: new THREE.Vector3((Math.random() - 0.5) * 2, -6 - Math.random() * 4, (Math.random() - 0.5) * 2),
                            max: 3.2, geo: 'star', scale: 0.6 + Math.random() * 0.5, spin: 6 + Math.random() * 6 });
                    }
                }
            }
        }

        if (mode === 'drive') {
            // pickups
            for (const f of pickups) {
                if (f.done) continue;
                if (kart.position.distanceTo(f.mesh.position) < 2.3) {
                    f.done = true;
                    f.mesh.visible = false;
                    score++;
                    scoreEl.textContent = 'Поени: ' + score;
                    flowersEl.textContent = world.collectible + ' ' + score + '/' + FLOWER_TOTAL;
                    petalBurst(f.mesh.position, [world.pickupColor, 0xffffff, world.finishColor, 0x80d0ff]);
                    if (window.tone) { window.tone(1046, 0.07); window.tone(1568, 0.09, 0.05); }
                }
            }
            // boost pads
            for (const b of boostPads) {
                if (b.done) continue;
                if (now >= boostUntil && kart.position.distanceTo(b.mesh.position) < b.radius) {
                    boostUntil = now + BOOST_TIME;
                    announce('Буст!');
                    playWhoosh();
                    if (!REDUCED_MOTION) finishShake = 0.5;
                }
            }
            // soft warning beep when an obstacle is coming up ahead
            if (now >= warnUntil) {
                let aheadT = 1;
                for (const o of obstacles) aheadT = Math.min(aheadT, (o.t - progress + 1) % 1);
                const aheadUnits = aheadT * trackLen;
                if (aheadT < 0.4 && aheadUnits > 12 && aheadUnits < 90) {
                    if (window.tone) window.tone(330, 0.06);
                    warnUntil = now + 720;
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
                    obstaclePuff(kart.position);
                    if (window.gentleMiss) window.gentleMiss();
                    if (!REDUCED_MOTION) kartBounce.position.y = 0.12;
                }
            }
            // edge rumble + offroad dust
            const absLat = Math.abs(lateral);
            if (absLat > RUMBLE_ON) {
                rumbleShake = 1;
                playRumble(now);
            }
            if (offroad) {
                dustAcc += dt;
                if (dustAcc > 0.07) { dustAcc = 0; dustPuff(kart.position); }
            }
            // drift: holding a direction at speed → gentle slide + skid smoke
            driftNow = (keys.left || keys.right) && speed / MAX_SPEED > 0.5 && absLat < RUMBLE_ON;
            if (driftNow) {
                skidAcc += dt;
                if (skidAcc > 0.05) {
                    skidAcc = 0;
                    skidPuff(kart.position.clone().addScaledVector(right, -steer * 1.0).add(new THREE.Vector3(0, 0.3, -2)));
                }
            }
            // boost flames
            if (now < boostUntil) {
                flameAcc += dt;
                if (flameAcc > 0.04) { flameAcc = 0; flamePuff(exhaust); }
            }
        }

        // camera (dynamic bouncy chase cam: suspension bob + steer sway + hill crest + shake)
        const camTarget = kart.position.clone()
            .addScaledVector(tan, -12)
            .add(new THREE.Vector3(-steer * 0.9 * (speed / MAX_SPEED), 6.0 + bounce * 2.0, 0));
        camTarget.y = Math.max(camTarget.y, kart.position.y + 5.0);
        camera.position.lerp(camTarget, 1 - Math.exp(-4 * dt));
        const desired = kart.position.clone()
            .addScaledVector(tan, 10)
            .add(new THREE.Vector3(0, 1.5 + (speed / MAX_SPEED) * 0.4, 0));
        lookTarget.lerp(desired, 1 - Math.exp(-6 * dt));
        const shake = Math.max(finishShake, rumbleShake);
        const lookPt = lookTarget.clone().add(
            new THREE.Vector3(
                (Math.random() - 0.5) * shake * 0.5,
                (Math.random() - 0.5) * shake * 0.5,
                0
            )
        );
        _tmpM.lookAt(camera.position, lookPt, UP);
        _tmpQ.setFromRotationMatrix(_tmpM);
        camera.quaternion.slerp(_tmpQ, 1 - Math.exp(-9 * dt));
        camera.rotateZ(steer * 0.02);
        finishShake = Math.max(0, finishShake - 1.8 * dt);
        rumbleShake = Math.max(0, rumbleShake - 3.2 * dt);

        const targetFov = 60 + (speed / MAX_SPEED) * 14 + (now < boostUntil ? 6 : 0);
        camera.fov += (targetFov - camera.fov) * Math.min(1, 4 * dt);
        camera.updateProjectionMatrix();

        updateParticles(dt);
        for (const c of driftClouds) {
            c.a += c.v * dt * 0.001;
            c.cl.position.x = Math.cos(c.a) * c.rad;
            c.cl.position.z = Math.sin(c.a) * c.rad;
        }
        updateEngine();
        drawMap();

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

    showStartPicker();
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
        worldIdx: () => worldIdx,
        worldCount: () => WORLD_LIST.length,
        kartIdx: () => kartIdx,
        pickupKind: () => world.pickup,
        musicOn: () => musicOn,
        confirmStart: () => { if (startModal) startModal.classList.remove('show'); launch(); return true; },
        tris: () => renderer.info.render.triangles,
        particles: () => particles.length,
        drifting: () => driftNow,
        boosting: () => curTime() < boostUntil,
        rumbleOn: () => Math.abs(lateral) > RUMBLE_ON,
        offroadState: () => offroad,
        boostPads: () => boostPads.map((b) => ({ x: b.x, t: b.t })),
        triggerBoost: () => { boostUntil = curTime() + BOOST_TIME; playWhoosh(); return true; },
        seekLateral: (v) => { lateral = clamp(v, -MAX_LATERAL, MAX_LATERAL); return lateral; },
        wheelPose: () => wheels.map((w) => [w.rotation.x, w.rotation.y]),
        spokes: () => studCount,
        steerState: () => ({ roll: leanValue, yaw: kartLean.rotation.y, steerYaw: steerYawValue, spokes: studCount }),
        hillRange: () => hillRange,
        floorClear: () => minRoadClear,
        mapMarker: () => lastMapMarker ? { t: lastMapMarker.t, x: lastMapMarker.x, y: lastMapMarker.y, n: mapPts.length } : { t: progress % 1, x: 0, y: 0, n: 0 }
    };
}