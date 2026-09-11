import * as THREE from 'three';

// --- config ---
const ROAD_WIDTH = 14;
const ROAD_SEGMENTS = 300;
const TOTAL_PICKUPS = 10;
const TOTAL_LAPS = 3;
const MAX_LATERAL = 5.2;
const MAX_SPEED = 130;
const ACCEL = 12;
const STEER_SPEED = 10;

const UP = new THREE.Vector3(0, 1, 0);
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const rnd = (i) => {
  const x = Math.sin(i * 127.1) * 43758.5453;
  return x - Math.floor(x);
};

// --- messages ---
const speedEl = document.getElementById('speed');
const scoreEl = document.getElementById('score');
const lapEl = document.getElementById('lap');
const fpsEl = document.getElementById('fps');
const msgEl = document.getElementById('msg');
const msgSubEl = document.getElementById('msg-sub');

function fail(text) {
  msgSubEl.textContent = text;
  msgEl.style.display = 'block';
}

// --- renderer / scene / camera ---
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ antialias: true });
} catch (e) {
  fail('WebGL није доступан: ' + e.message);
  throw e;
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('view').appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.Fog(0x87ceeb, 40, 230);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(-12, 6.5, 0);

const sun = new THREE.DirectionalLight(0xffffff, 1.1);
sun.position.set(50, 80, 30);
scene.add(sun);
scene.add(new THREE.AmbientLight(0xffffff, 0.5));

// --- track curve (closed loop with hills) ---
const trackPoints = [
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(40, 0, -30),
  new THREE.Vector3(70, 2, -80),
  new THREE.Vector3(80, 4, -150),
  new THREE.Vector3(60, 6, -220),
  new THREE.Vector3(20, 4, -270),
  new THREE.Vector3(-20, 1, -290),
  new THREE.Vector3(-50, 0, -250),
  new THREE.Vector3(-60, 2, -180),
  new THREE.Vector3(-50, 3, -120),
  new THREE.Vector3(-30, 1, -60),
  new THREE.Vector3(-5, 0, -15)
];
const curve = new THREE.CatmullRomCurve3(trackPoints, true);
const trackLen = curve.getLength();

// --- road geometry builder ---
function ribbon(width, centerOffset, yOffset) {
  const pos = [];
  const uv = [];
  const idx = [];
  for (let i = 0; i <= ROAD_SEGMENTS; i++) {
    const t = i / ROAD_SEGMENTS;
    const p = curve.getPointAt(t);
    const tan = curve.getTangentAt(t);
    const right = new THREE.Vector3().crossVectors(tan, UP).normalize();
    const l = p.clone().addScaledVector(right, centerOffset - width / 2);
    const r = p.clone().addScaledVector(right, centerOffset + width / 2);
    l.y += yOffset;
    r.y += yOffset;
    pos.push(l.x, l.y, l.z, r.x, r.y, r.z);
    uv.push(0, i / 10, 1, i / 10);
    if (i < ROAD_SEGMENTS) {
      const a = i * 2, b = a + 1, c = a + 2, d = a + 3;
      idx.push(a, c, b, b, c, d);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

// road surface with subtle tone bands + dashed center line (canvas texture)
const roadCanvas = document.createElement('canvas');
roadCanvas.width = 256;
roadCanvas.height = 64;
{
  const c = roadCanvas.getContext('2d');
  for (let row = 0; row < 64; row++) {
    c.fillStyle = (row >> 3) % 2 === 0 ? '#424246' : '#4a4a4e';
    c.fillRect(0, row, 256, 1);
  }
  c.fillStyle = '#e8e8e8';
  c.fillRect(0, 5, 8, 46);
  c.fillRect(118, 5, 18, 46);
  c.fillRect(230, 5, 8, 46);
}
scene.add(new THREE.Mesh(
  ribbon(ROAD_WIDTH, 0, 0.02),
  new THREE.MeshPhongMaterial({ map: new THREE.CanvasTexture(roadCanvas) })
));

const edgeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
scene.add(new THREE.Mesh(ribbon(0.35, ROAD_WIDTH / 2, 0.05), edgeMat));
scene.add(new THREE.Mesh(ribbon(0.35, -ROAD_WIDTH / 2, 0.05), edgeMat));

// --- start/finish line (checkered) ---
{
  const startPos = curve.getPointAt(0);
  const startTan = curve.getTangentAt(0);
  const startRight = new THREE.Vector3().crossVectors(startTan, UP).normalize();
  const checker = document.createElement('canvas');
  checker.width = 256;
  checker.height = 32;
  const c = checker.getContext('2d');
  for (let x = 0; x < 8; x++) {
    for (let y = 0; y < 4; y++) {
      c.fillStyle = (x + y) % 2 === 0 ? '#111' : '#eee';
      c.fillRect(x * 32, y * 8, 32, 8);
    }
  }
  const line = new THREE.Mesh(
    new THREE.PlaneGeometry(ROAD_WIDTH, 2),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(checker) })
  );
  line.geometry.rotateX(-Math.PI / 2);
  line.position.copy(startPos);
  line.position.y += 0.06;
  line.rotation.y = Math.atan2(-startRight.z, startRight.x);
  scene.add(line);
}

// --- ground ---
{
  const g = new THREE.Mesh(
    new THREE.PlaneGeometry(700, 700),
    new THREE.MeshPhongMaterial({ color: 0x5fae5f })
  );
  g.rotation.x = -Math.PI / 2;
  g.position.y = -0.2;
  scene.add(g);
}

// --- trees for speed/depth cues ---
const trunkMat = new THREE.MeshPhongMaterial({ color: 0x8b5a2b });
const crownMat = new THREE.MeshPhongMaterial({ color: 0x2e7d32 });
const trunkGeo = new THREE.CylinderGeometry(0.3, 0.45, 2.6, 6);
const crownGeo = new THREE.ConeGeometry(2.2, 4.5, 7);
for (let i = 0; i < 72; i++) {
  const t = i / 72;
  const p = curve.getPointAt(t);
  const tan = curve.getTangentAt(t);
  const right = new THREE.Vector3().crossVectors(tan, UP).normalize();
  const side = i % 2 === 0 ? 1 : -1;
  const dist = ROAD_WIDTH / 2 + 6 + rnd(i) * 24;
  const base = p.clone().addScaledVector(right, side * dist);
  const s = 0.7 + rnd(i + 7) * 0.9;
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.copy(base);
  trunk.position.y = 1.3 * s;
  trunk.scale.setScalar(s);
  const crown = new THREE.Mesh(crownGeo, crownMat);
  crown.position.copy(base);
  crown.position.y = (2.6 + 2.2) * s;
  crown.scale.setScalar(s);
  scene.add(trunk, crown);
}

// --- kart ---
const kart = new THREE.Group();
const lean = new THREE.Group();
kart.add(lean);

const bodyMat = new THREE.MeshPhongMaterial({ color: 0xd12b2b });
const wheelMat = new THREE.MeshPhongMaterial({ color: 0x1a1a1a });

const body = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.5, 3.0), bodyMat);
body.position.y = 0.55;
lean.add(body);

const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.5, 1.5), bodyMat);
cabin.position.set(0, 0.95, -0.4);
lean.add(cabin);

const head = new THREE.Mesh(new THREE.SphereGeometry(0.32, 10, 8), new THREE.MeshPhongMaterial({ color: 0xffdca8 }));
head.position.set(0, 1.32, -0.35);
lean.add(head);

const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.36, 10, 8), new THREE.MeshPhongMaterial({ color: 0xf4c430 }));
helmet.position.set(0, 1.3, -0.4);
helmet.scale.set(1, 0.95, 1.02);
lean.add(helmet);

const wheelGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.24, 12);
wheelGeo.rotateZ(Math.PI / 2);
const wheels = [];
[[-0.85, 0.32, 1.1], [0.85, 0.32, 1.1], [-0.85, 0.32, -1.1], [0.85, 0.32, -1.1]].forEach((p) => {
  const w = new THREE.Mesh(wheelGeo, wheelMat);
  w.position.set(p[0], p[1], p[2]);
  lean.add(w);
  wheels.push(w);
});

scene.add(kart);

// --- pickups ---
const pickups = [];
const goldMat = new THREE.MeshPhongMaterial({ color: 0xffd700, emissive: 0x7a5b00 });
for (let i = 0; i < TOTAL_PICKUPS; i++) {
  const t = (i + 0.5) / TOTAL_PICKUPS;
  const p = curve.getPointAt(t);
  const tan = curve.getTangentAt(t);
  const right = new THREE.Vector3().crossVectors(tan, UP).normalize();
  const off = t % 1 < 0.5 ? 2.6 : -2.6;
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.55, 14, 10), goldMat);
  mesh.position.copy(p).addScaledVector(right, off);
  mesh.position.y += 1.2;
  scene.add(mesh);
  pickups.push({ mesh, done: false });
}

// --- state ---
const keys = { left: false, right: false };
let progress = 0.06;
let lateral = 0;
let speed = 55;
let steer = 0;
let lap = 1;
let score = 0;
let done = false;
const lookTarget = new THREE.Vector3();

function finish() {
  done = true;
  msgSubEl.textContent = 'Поени: ' + score;
  msgEl.style.display = 'block';
}

// --- per-frame update ---
function update(dt) {
  steer = (keys.left ? -1 : 0) + (keys.right ? 1 : 0);
  lateral += steer * STEER_SPEED * dt;
  lateral = clamp(lateral, -MAX_LATERAL, MAX_LATERAL);
  lateral *= 1 - 0.4 * dt;

  speed = Math.min(MAX_SPEED, speed + ACCEL * dt);
  let np = progress + (speed * dt) / trackLen;
  if (np >= 1) {
    np -= 1;
    if (!done) {
      lap++;
      lapEl.textContent = Math.min(lap, TOTAL_LAPS);
      if (lap > TOTAL_LAPS) finish();
    }
  }
  progress = np;

  const p = curve.getPointAt(progress);
  const tan = curve.getTangentAt(progress);
  const right = new THREE.Vector3().crossVectors(tan, UP).normalize();

  kart.position.copy(p).addScaledVector(right, lateral);
  kart.lookAt(p.clone().add(tan));
  lean.rotation.z = steer * 0.28;

  wheels.forEach((w) => { w.rotation.y += (speed / 0.32) * dt; });

  const camTarget = kart.position.clone()
    .addScaledVector(tan, -13)
    .add(new THREE.Vector3(0, 6.5, 0));
  camera.position.lerp(camTarget, 1 - Math.exp(-5 * dt));

  const desired = kart.position.clone()
    .addScaledVector(tan, 9)
    .add(new THREE.Vector3(0, 1.6, 0));
  lookTarget.lerp(desired, 1 - Math.exp(-6 * dt));
  camera.lookAt(lookTarget);

  const targetFov = 70 + (speed / MAX_SPEED) * 18;
  camera.fov += (targetFov - camera.fov) * Math.min(1, 5 * dt);
  camera.updateProjectionMatrix();

  for (const pk of pickups) {
    pk.mesh.rotation.y += 3 * dt;
    if (!pk.done && kart.position.distanceTo(pk.mesh.position) < 3) {
      pk.done = true;
      pk.mesh.visible = false;
      score++;
      scoreEl.textContent = score;
    }
  }

  speedEl.textContent = Math.round(speed);
}

// --- loop + FPS ---
const clock = new THREE.Clock();
let fpsAcc = 0;
let fpsFrames = 0;
function loop() {
  requestAnimationFrame(loop);
  const dt = Math.min(clock.getDelta(), 0.05);
  update(dt);
  renderer.render(scene, camera);
  fpsAcc += dt;
  fpsFrames++;
  if (fpsAcc >= 1) {
    fpsEl.textContent = Math.round(fpsFrames / fpsAcc);
    fpsAcc = 0;
    fpsFrames = 0;
  }
}

// --- input ---
window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = true;
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = true;
});
window.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = false;
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = false;
});
function bindZone(id, dir) {
  const el = document.getElementById(id);
  const set = (v) => { keys[dir] = v; };
  el.addEventListener('pointerdown', (e) => { e.preventDefault(); set(true); });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach((ev) =>
    el.addEventListener(ev, () => set(false))
  );
}
bindZone('left-zone', 'left');
bindZone('right-zone', 'right');

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- go ---
requestAnimationFrame(loop);