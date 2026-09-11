(function () {
    'use strict';

    const OBSTACLES = {
        puddle: { label: 'Бара', base: 0x4aa5e0, size: 1.5, slowMult: 0.5, slowTime: 1.5 },
        barricade: { label: 'Баријера', base: 0xe52521, size: 1.4, slowMult: 0.3, slowTime: 1.0 }
    };

    const R3D_WORLDS = [{
        key: 'meadow',
        name: 'Ливада',
        roadColor: 0x5a5a5a,
        grassColor: 0x67c971,
        stripeColor: 0xffffff,
        finishColor: 0xffd23f,
        bgTop: 0x7ec8e3,
        bgBottom: 0xb8e986,
        fogColor: 0xa8d8f0,
        kartColor: 0xe52521,
        kartAccent: 0xffd23f,
        wheelColor: 0x1c1c1c,
        hubColor: 0xbdbdbd,
        treeTrunk: 0x8b5a2b,
        treeCrown: 0x2e7d32,
        curveSeed: 2026,
        laps: 3,
        flowersPerLap: 12,
        obstacleTypes: ['puddle', 'barricade']
    }];

    window.RACING3D_CONFIG = {
        obstacles: OBSTACLES,
        worlds: R3D_WORLDS
    };
}());