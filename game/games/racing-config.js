(function () {
    'use strict';

    const OBSTACLE_TYPES = {
        puddle: { emoji: '💧', label: 'Бара', speedMult: 0.5, duration: 1500, knockback: 0, slowOnly: true },
        rock: { emoji: '🪨', label: 'Камен', speedMult: 0, duration: 500, knockback: 0, slowOnly: false },
        barricade: { emoji: '🚧', label: 'Баријера', speedMult: 0.3, duration: 1000, knockback: 80, slowOnly: true }
    };

    const RACING_WORLDS = [{
        key: 'meadow',
        name: 'Ливада',
        collectible: '🌸',
        collectibleName: 'цвеће',
        bgTop: '#7EC8E3',
        bgBottom: '#B8E986',
        horizonColor: '#A8D8F0',
        roadColor: '#5A5A5A',
        grassColor: '#67C971',
        grassSideColor: '#4CAF50',
        stripeColor: '#FFFFFF',
        finishColor: '#FFD23F',
        curveMax: 0.5,
        curveSeed: 2026,
        decor: ['🌳', '🌳', '🌸', '🌸', '🦋', '⛰️', '🌳', '🌼'],
        decorScale: 1.0,
        goal: 7200,
        music: 'meadow',
        obstacleDensity: 0.004,
        obstacleTypes: ['puddle', 'barricade']
    }, {
        key: 'beach',
        name: 'Плажа',
        collectible: '🐚',
        collectibleName: 'шкољке',
        bgTop: '#8ED5F5',
        bgBottom: '#F7E7B4',
        horizonColor: '#A0DCF7',
        roadColor: '#8A7B66',
        grassColor: '#EFD9A7',
        grassSideColor: '#C9A96A',
        stripeColor: '#FFFFFF',
        finishColor: '#FF8C42',
        curveMax: 0.7,
        curveSeed: 3031,
        decor: ['🌴', '🌴', '⛱️', '🐚', '🐚', '🏄', '🌴', '🌊'],
        decorScale: 1.0,
        goal: 7200,
        music: 'beach',
        obstacleDensity: 0.005,
        obstacleTypes: ['puddle', 'rock']
    }, {
        key: 'snow',
        name: 'Снег',
        collectible: '❄️',
        collectibleName: 'пахуље',
        bgTop: '#A8C8E8',
        bgBottom: '#EAF4FB',
        horizonColor: '#C8DCF0',
        roadColor: '#6E7B8B',
        grassColor: '#DCE8F2',
        grassSideColor: '#A8BFD6',
        stripeColor: '#F0F8FF',
        finishColor: '#7EC8E3',
        curveMax: 0.4,
        curveSeed: 4042,
        decor: ['⛄', '🎿', '🌲', '🌲', '☃️', '⛷️', '🌲', '🦌'],
        decorScale: 1.0,
        goal: 7200,
        music: 'snow',
        obstacleDensity: 0.006,
        obstacleTypes: ['puddle', 'rock', 'barricade']
    }, {
        key: 'candy',
        name: 'Слаткиш',
        collectible: '🍭',
        collectibleName: 'бомбоне',
        bgTop: '#FFD1E8',
        bgBottom: '#FFF0E0',
        horizonColor: '#FFE0F0',
        roadColor: '#B06A9E',
        grassColor: '#FFE9F2',
        grassSideColor: '#F4A9CF',
        stripeColor: '#FFFFFF',
        finishColor: '#FF6F91',
        curveMax: 0.8,
        curveSeed: 5053,
        decor: ['🍬', '🧁', '🍭', '🍡', '🍬', '🧁', '🍩', '🍡'],
        decorScale: 1.0,
        goal: 7200,
        music: 'candy',
        obstacleDensity: 0.004,
        obstacleTypes: ['puddle', 'barricade']
    }, {
        key: 'jungle',
        name: 'Џунгла',
        collectible: '💎',
        collectibleName: 'драгуље',
        bgTop: '#7FB77E',
        bgBottom: '#D9E7B0',
        horizonColor: '#A8C89A',
        roadColor: '#6B5B4F',
        grassColor: '#7CB476',
        grassSideColor: '#4E8C58',
        stripeColor: '#EAF7E9',
        finishColor: '#FF8C42',
        curveMax: 0.75,
        curveSeed: 6064,
        decor: ['🌴', '🦜', '🌺', '🌴', '🐒', '🌿', '🦋', '🌴'],
        decorScale: 1.0,
        goal: 7200,
        music: 'jungle',
        obstacleDensity: 0.008,
        obstacleTypes: ['puddle', 'rock', 'barricade']
    }, {
        key: 'space',
        name: 'Свемир',
        collectible: '⭐',
        collectibleName: 'звезде',
        bgTop: '#1B1B3A',
        bgBottom: '#4A3F8C',
        horizonColor: '#3A2E6B',
        roadColor: '#7A6FB0',
        grassColor: '#241F4D',
        grassSideColor: '#4A3F8C',
        stripeColor: '#C9C3F0',
        finishColor: '#FFD23F',
        curveMax: 0.5,
        curveSeed: 7075,
        decor: ['🪐', '🌌', '🛸', '⭐', '🌠', '🪐', '🌌', '⭐'],
        decorScale: 1.0,
        goal: 7200,
        music: 'space',
        obstacleDensity: 0.005,
        obstacleTypes: ['rock', 'barricade']
    }, {
        key: 'night',
        name: 'Ноћ',
        collectible: '🌙',
        collectibleName: 'месеце',
        bgTop: '#201A40',
        bgBottom: '#3A2E5E',
        horizonColor: '#2E274E',
        roadColor: '#6E6590',
        grassColor: '#2A2248',
        grassSideColor: '#4A3F70',
        stripeColor: '#E0D9F5',
        finishColor: '#FFD23F',
        curveMax: 0.6,
        curveSeed: 8086,
        decor: ['🌲', '🌙', '🦉', '⭐', '🌲', '🏮', '🌌', '🦇'],
        decorScale: 1.0,
        goal: 7200,
        music: 'night',
        obstacleDensity: 0.007,
        obstacleTypes: ['puddle', 'rock', 'barricade']
    }, {
        key: 'farm',
        name: 'Фарма',
        collectible: '🥕',
        collectibleName: 'шаргарепе',
        bgTop: '#8FC0E8',
        bgBottom: '#C9E8A8',
        horizonColor: '#A8D8F0',
        roadColor: '#7A6A52',
        grassColor: '#7CB86C',
        grassSideColor: '#4E9448',
        stripeColor: '#FFF8ED',
        finishColor: '#FFB84D',
        curveMax: 0.55,
        curveSeed: 9097,
        decor: ['🚜', '🌻', '🐄', '🌾', '🚜', '🐑', '🌻', '🐓'],
        decorScale: 1.0,
        goal: 7200,
        music: 'farm',
        obstacleDensity: 0.006,
        obstacleTypes: ['puddle', 'rock', 'barricade']
    }];

    const RACING_MUSIC = {
        meadow: {
            root: 587.33,
            bpm: 96,
            wave: 'triangle',
            vol: 0.09,
            bass: [-12, -12, -12, -12, -5, -5, -5, -5, -12, -12, -12, -12, -5, -5, -5, -5],
            seq: [0, 4, 7, 9, 12, 9, 7, 4, 0, 4, 7, 9, 7, 4, 2, 4, 9, 12, 14, 16, 14, 12, 9, 7, 4, 7, 9, 12, 9, 7, 4, null],
            ambient: { sound: 'bird', rate: 0.05, vol: 0.045 }
        },
        beach: {
            root: 440.00,
            bpm: 86,
            wave: 'sine',
            vol: 0.1,
            bass: [-7, -7, -7, -7, -12, -12, -12, -12, -7, -7, -7, -7, -5, -5, -5, -5],
            seq: [0, 3, 7, 12, 10, 7, 3, 0, 5, 9, 12, 15, 12, 9, 7, 5, 0, 3, 7, 12, 14, 12, 9, 7, 3, 7, 10, 7, 3, 0, -2, null],
            ambient: { sound: 'waves', rate: 0.04, vol: 0.06 }
        },
        snow: {
            root: 523.25,
            bpm: 72,
            wave: 'sine',
            vol: 0.09,
            bass: [-8, -8, -8, -8, -12, -12, -12, -12, -8, -8, -8, -8, -3, -3, -3, -3],
            seq: [0, 7, 12, 7, 16, 12, 7, 4, 0, 7, 12, 16, 19, 16, 12, 7, 5, -3, 4, -3, 0, 4, 7, 12, 7, 4, 0, -5, 0, 4, 7, null],
            ambient: { sound: 'wind', rate: 0.05, vol: 0.05 }
        },
        candy: {
            root: 349.23,
            bpm: 104,
            wave: 'triangle',
            vol: 0.1,
            bass: [-5, -5, -5, -5, -12, -12, -12, -12, 0, 0, 0, 0, -3, -3, -3, -3],
            seq: [0, 2, 4, 7, 9, 7, 4, 2, 0, 2, 4, 7, 12, 11, 9, 7, 4, 7, 9, 11, 12, 11, 9, 7, 5, 7, 9, 12, 9, 7, 5, null],
            ambient: { sound: 'chime', rate: 0.07, vol: 0.04 }
        },
        jungle: {
            root: 493.88,
            bpm: 92,
            wave: 'triangle',
            vol: 0.09,
            bass: [-2, -2, -2, -2, -9, -9, -9, -9, -2, -2, -2, -2, -7, -7, -7, -7],
            seq: [0, 3, 7, 10, 12, 10, 7, 3, 0, 3, 7, 10, 7, 3, 0, -5, 5, 7, 10, 12, 14, 12, 10, 7, 3, 5, 7, 10, 7, 5, 3, null],
            ambient: { sound: 'bird', rate: 0.06, vol: 0.05 }
        },
        space: {
            root: 440.00,
            bpm: 80,
            wave: 'sine',
            vol: 0.11,
            bass: [-11, -11, null, -11, -11, null, -11, -6, -11, -11, null, -11, -3, null, -3, -11],
            seq: [0, null, 7, null, 12, null, 19, null, 0, null, 7, null, 12, null, 7, null, 2, null, 9, null, 14, null, 21, null, 0, null, 9, null, 14, null, 9, null],
            ambient: { sound: 'stars', rate: 0.08, vol: 0.04 }
        },
        night: {
            root: 466.16,
            bpm: 70,
            wave: 'sine',
            vol: 0.09,
            bass: [-4, null, -4, null, -8, null, -8, null, -4, null, -4, null, null, null, -8, null],
            seq: [0, null, 7, null, 3, null, 7, null, 0, null, 10, null, 7, null, 3, null, -4, null, 4, null, 0, null, 4, null, 7, null, 11, null, 7, null, 4, null],
            ambient: { sound: 'owl', rate: 0.04, vol: 0.045 }
        },
        farm: {
            root: 392.00,
            bpm: 88,
            wave: 'triangle',
            vol: 0.1,
            bass: [0, 0, 0, 0, -9, -9, -9, -9, 0, 0, 0, 0, -5, -5, -5, -5],
            seq: [0, 4, 7, 12, 7, 4, 0, -5, 0, 4, 7, 12, 9, 7, 4, 2, 0, 4, 7, 9, 12, 9, 7, 4, 7, 9, 12, 16, 12, 9, 7, null],
            ambient: { sound: 'owl', rate: 0.03, vol: 0.04 }
        }
    };

    const RACING_CHARACTERS = [{
        id: 'kitty',
        name: 'Маца Истраживачица',
        short: 'Маца',
        folder: 'explorer_kitty/',
        srcW: 273,
        srcH: 312,
        cars: [{
            id: 'box',
            name: 'Картонска кутија',
            emoji: '📦',
            maxSpeed: 290,
            steer: 310,
            accel: 0.95,
            body: '#e52521'
        }, {
            id: 'yarn',
            name: 'Клупко вуне',
            emoji: '🧶',
            maxSpeed: 300,
            steer: 330,
            accel: 1.0,
            body: '#e52521'
        }, {
            id: 'fish',
            name: 'Рибица',
            emoji: '🐟',
            maxSpeed: 270,
            steer: 360,
            accel: 1.05,
            body: '#e52521'
        }, {
            id: 'rocket',
            name: 'Ракета',
            emoji: '🚀',
            maxSpeed: 320,
            steer: 300,
            accel: 1.15,
            body: '#e52521'
        }]
    }, {
        id: 'explorer',
        name: 'Истраживачица',
        short: 'Девојчица',
        folder: 'explorer/',
        srcW: 237,
        srcH: 329,
        cars: [{
            id: 'bike',
            name: 'Бицикл',
            emoji: '🚲',
            maxSpeed: 290,
            steer: 320,
            accel: 1.0,
            body: '#4fc3f7'
        }, {
            id: 'scooter',
            name: 'Тротинет',
            emoji: '🛴',
            maxSpeed: 300,
            steer: 340,
            accel: 1.05,
            body: '#4fc3f7'
        }, {
            id: 'skates',
            name: 'Котурке',
            emoji: '🛼',
            maxSpeed: 275,
            steer: 370,
            accel: 0.95,
            body: '#4fc3f7'
        }, {
            id: 'hoverboard',
            name: 'Ховерборд',
            emoji: '🛹',
            maxSpeed: 315,
            steer: 310,
            accel: 1.15,
            body: '#4fc3f7'
        }]
    }];

    const RACING_UNLOCK_WINS = [0, 2, 4, 7];

    window.RACING_CONFIG = {
        worlds: RACING_WORLDS,
        music: RACING_MUSIC,
        characters: RACING_CHARACTERS,
        obstacleTypes: OBSTACLE_TYPES,
        unlockWins: RACING_UNLOCK_WINS,
        roadLength: 7200,
        segmentLength: 20,
        startSpeed: 130,
        maxSpeed: 300,
        speedGrowth: 8,
        carWidth: 70,
        carHeight: 110,
        pickupSize: 36,
        finishWidth: 80
    };
})();