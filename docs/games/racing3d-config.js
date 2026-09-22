(function () {
    'use strict';

    // 3D-obstacle definitions (mesh + effect). Keys match the shared
    // RACING_CONFIG world `obstacleTypes` (puddle / rock / barricade).
    const OBSTACLES = {
        puddle: { label: 'Бара', base: 0x4aa5e0, size: 1.5, slowMult: 0.5, slowTime: 1.5,
                  hitText: 'Бара! Брзина смањена.' },
        rock: { label: 'Камен', base: 0x9aa0a6, size: 1.0, slowMult: 0, slowTime: 0.5,
                hitText: 'Камен! Кратка пауза.' },
        barricade: { label: 'Баријера', base: 0xe52521, size: 1.4, slowMult: 0.3, slowTime: 1.0,
                     hitText: 'Баријера! Брзина смањена.' }
    };

    // Per-world 3D extras. Palette/collectible/seed/music/obstacleTypes/decor
    // are read from the shared RACING_CONFIG.worlds entries (single source of
    // truth); this map adds the 3D-only knobs (laps, kart/boost/tree/light
    // colors, track hill factor, pickup style, sky/weather) keyed by the world
    // `key`.
    const R3D_EXTRAS = {
        meadow: {
            laps: 3, flowersPerLap: 12, hill: 1.0,
            pickup: 'flower', pickupColor: 0xff8fcc,
            kartColor: 0xe52521, kartAccent: 0xffd23f,
            wheelColor: 0x1c1c1c, hubColor: 0xbdbdbd,
            boostColor: 0xffd23f,
            sunColor: 0xfff3d6, ambColor: 0xffffff,
            treeTrunk: 0x8b5a2b, treeCrown: 0x2e7d32,
            sky: 'clouds'
        },
        beach: {
            laps: 3, flowersPerLap: 12, hill: 0.55,
            pickup: 'shell', pickupColor: 0xfff3e0,
            kartColor: 0xff8c42, kartAccent: 0xffd23f,
            wheelColor: 0x6a5a44, hubColor: 0xe8d8b8,
            boostColor: 0xff9d50, sunColor: 0xfff0c0, ambColor: 0xffffff,
            treeTrunk: 0xc9a96a, treeCrown: 0x3f8f4f,
            sky: 'clouds'
        },
        snow: {
            laps: 3, flowersPerLap: 12, hill: 0.8,
            pickup: 'snowflake', pickupColor: 0xdff3ff,
            kartColor: 0x3f9be0, kartAccent: 0xcfeeff,
            wheelColor: 0x2a2a30, hubColor: 0xcfeeff,
            boostColor: 0x9fd0ff, sunColor: 0xdfefff, ambColor: 0xffffff,
            treeTrunk: 0x6a4a2f, treeCrown: 0xdceef7,
            sky: 'clouds', weather: 'snow'
        },
        candy: {
            laps: 3, flowersPerLap: 12, hill: 1.25,
            pickup: 'candy', pickupColor: 0xff6f91,
            kartColor: 0xff6f91, kartAccent: 0xffe066,
            wheelColor: 0x6a3a6a, hubColor: 0xffd9ec,
            boostColor: 0xff7ba9, sunColor: 0xffe8f0, ambColor: 0xffffff,
            treeTrunk: 0x7a4a7a, treeCrown: 0xffb6d0,
            sky: 'clouds'
        },
        jungle: {
            laps: 3, flowersPerLap: 12, hill: 1.15,
            pickup: 'gem', pickupColor: 0x40e060,
            kartColor: 0x43c65f, kartAccent: 0xffe066,
            wheelColor: 0x2a2a30, hubColor: 0xbfe8c8,
            boostColor: 0x7ce07a, sunColor: 0xffe8c0, ambColor: 0xd8ffe8,
            treeTrunk: 0x5a3a1e, treeCrown: 0x2e7d32,
            sky: 'clouds'
        },
        space: {
            laps: 3, flowersPerLap: 12, hill: 0.55,
            pickup: 'star', pickupColor: 0xffd23f,
            kartColor: 0x7a6fb0, kartAccent: 0xffd23f,
            wheelColor: 0x1c1c1c, hubColor: 0xa49ce0,
            boostColor: 0xffd23f, sunColor: 0xe8e4ff, ambColor: 0x8090ff,
            treeTrunk: 0x3a2e6b, treeCrown: 0x4a3f8c,
            sky: 'stars', weather: 'stars'
        },
        night: {
            laps: 3, flowersPerLap: 12, hill: 0.75,
            pickup: 'moon', pickupColor: 0xffe066,
            kartColor: 0x5a6be0, kartAccent: 0xffd23f,
            wheelColor: 0x1c1c1c, hubColor: 0xd8d0ff,
            boostColor: 0xffd23f, sunColor: 0xd0d8ff, ambColor: 0x6068a8,
            treeTrunk: 0x2a2a2a, treeCrown: 0x1f5e3a,
            sky: 'stars', moon: true
        },
        farm: {
            laps: 3, flowersPerLap: 12, hill: 0.95,
            pickup: 'carrot', pickupColor: 0xff8c42,
            kartColor: 0x9b6df0, kartAccent: 0xffb84d,
            wheelColor: 0x2a2a30, hubColor: 0xe8d8b8,
            boostColor: 0xffb84d, sunColor: 0xfff0c0, ambColor: 0xffffff,
            treeTrunk: 0x8b5a2b, treeCrown: 0x4e9448,
            sky: 'clouds'
        }
    };

    // Kart color picker (recolors the chassis only — toddler-friendly flavor,
    // no stat differences).
    const KART_COLORS = [
        { name: 'Црвена', color: 0xe52521 },
        { name: 'Плава', color: 0x3f9be0 },
        { name: 'Зелена', color: 0x43c65f },
        { name: 'Љубичаста', color: 0x9b6df0 }
    ];

    window.RACING3D_CONFIG = {
        obstacles: OBSTACLES,
        worlds: R3D_EXTRAS,
        kartColors: KART_COLORS
    };
}());