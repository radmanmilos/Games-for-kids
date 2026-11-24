/* Мала авантура (Little Adventure) — config data (TD §2).
   Loaded as a classic script; assigns to window.little_adventure_CONFIG. */
(function () {
  'use strict';

  window.little_adventure_CONFIG = {
    hero: { radius: 0.45, speed: 5.0, accelRate: 12, shieldSpeedMul: 0.7, start: [0, 8], bumpDist: 1.2, bumpMs: 200 },
    sword: { reach: 1.9, arcDeg: 110, swingMs: 350, cooldownMs: 200, assistRange: 2.8, assistConeDeg: 70 },
    shield: { blockArcDeg: 140 },
    stick: { deadzone: 0.12, radiusVmin: 9, minPx: 56, maxPx: 110 },
    grumpy: { radius: 0.6, speed: 1.6, notice: 7, wanderR: 4, bumpCooldownMs: 1500, retreatMs: 900, respawnMs: 20000, respawnMinHeroDist: 12, maxAliveNormal: 4, followersMax: 3, followDist: 2.5 },
    acorn: { intervalMs: 2500, speed: 5, radius: 0.25, lifeMs: 4000 },
    interact: { pickup: 0.9, chest: 1.5, keyUse: 2.2, gemPlace: 1.8, owlTalk: 3.0, owlRepeatMs: 30000 },
    bounds: { xMin: -24, xMax: 24, zMin: -80, zMax: 16 },
    sim: { stepMs: 20, dtClampMs: 100 },
    camera: { fov: 45, fovNarrow: 55, narrowAspect: 1.2, offset: [0, 13, 11], follow: 6 },
    budget: { dprMax: 1.5, slowFrameMs: 24, slowWindowMs: 2000, particleCap: 24, burst: 12, burstReduced: 6 },
    zones: [
      { id: 'A', z0: 16, z1: -16, color: '#9BD37A' },
      { id: 'B', z0: -16, z1: -46, color: '#6FB35A' },
      { id: 'C', z0: -46, z1: -80, color: '#D9D2C0' }
    ],
    obstacles: [
      { t: 'circle', x: 9, z: -2, r: 1.2, id: 'A-bush' },
      { t: 'circle', x: -12, z: -22, r: 1.2, id: 'B-bush' },
      { t: 'circle', x: -5, z: 4, r: 0.8, id: 'owl-stump' },
      { t: 'circle', x: -10, z: -30, r: 1.0, id: 's1' },
      { t: 'circle', x: -4, z: -62, r: 0.6, id: 'pedestal-red' },
      { t: 'circle', x: 0, z: -62, r: 0.6, id: 'pedestal-green' },
      { t: 'circle', x: 4, z: -62, r: 0.6, id: 'pedestal-blue' },
      { t: 'circle', x: 0, z: -78, r: 2.0, id: 'lighthouse' }
    ],
    gates: [
      { id: 'G1', pos: [0, -16], w: 6, d: 1, needs: 'keyMeadow' },
      { id: 'G2', pos: [0, -46], w: 6, d: 1, needs: 'keyForest' }
    ],
    chests: [
      { id: 'C1', pos: [14, -34], item: 'keyForest' }
    ],
    bushes: [
      { id: 'A-bush', pos: [9, -2], item: 'gemRed' },
      { id: 'B-bush', pos: [-12, -22], item: 'gemGreen' }
    ],
    items: [
      { id: 'keyMeadow', kind: 'key' },
      { id: 'keyForest', kind: 'key' },
      { id: 'gemRed', kind: 'gem', color: 'red' },
      { id: 'gemGreen', kind: 'gem', color: 'green' },
      { id: 'gemBlue', kind: 'gem', color: 'blue' }
    ],
    pedestals: [
      { id: 'red', pos: [-4, -62] },
      { id: 'green', pos: [0, -62] },
      { id: 'blue', pos: [4, -62] }
    ],
    grumpies: [
      { id: 'guard1', role: 'guard', home: [-8, -10], hits: 2, drops: 'keyMeadow' },
      { id: 'boss', role: 'boss', home: [10, -56], hits: 3, drops: 'gemBlue' },
      { id: 'a1', role: 'normal', home: [6, 2], hits: 1 },
      { id: 'a2', role: 'normal', home: [-6, -4], hits: 1 },
      { id: 'b1', role: 'normal', home: [8, -24], hits: 1 },
      { id: 'b2', role: 'normal', home: [-4, -40], hits: 1 }
    ],
    statues: [
      { id: 's1', pos: [-10, -30], dir: [1, 0] }
    ],
    npcs: [
      { id: 'owl', pos: [-5, 4] }
    ],
    bridge: { from: [0, -64], to: [0, -76], buildMs: 2000 },
    lighthouse: { pos: [0, -78], r: 2 },
    speech: {
      intro: 'Здраво, мали јуначе! Мрзовољци су узели моје сјајне драгуље. Помози ми!',
      hintGuard: 'Додирни мрзовољца дрвеним мачем!',
      hintGate: 'Однеси кључ до врата!',
      hintShield: 'Подигни штит када лете жирови!',
      hintGems: 'Постави драгуље на постоља!',
      key: 'Кључ!',
      gem: 'Драгуљ!',
      gateOpen: 'Врата су отворена!',
      befriend: 'Постао је весео!',
      red: 'Црвено!',
      green: 'Зелено!',
      blue: 'Плаво!',
      bridge: 'Дуга је направила мост!',
      complete: 'Браво! Острво је процветало!',
      noWebgl: '3D није доступан овде'
    }
  };
})();