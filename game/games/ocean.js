/* Океан (Ocean) — Phase 4 adventure game on the shared adventure engine.
   Fly-mode swim: free 2D movement, no gravity. The little fish 🐟 swims
   through 10 underwater worlds, dodging jellyfish / sharks / mines / crabs and
   collecting the world's collectible emoji, reaching the ЦИЉ gate. Every world
   has its own procedural music theme + ambient layer and underwater scenery. */
(function () {
    'use strict';

    const MUSIC = {
        reef: {
            root: 392.00, bpm: 76, wave: 'triangle', vol: 0.09,
            bass: [-12, -12, -12, -12, -5, -5, -5, -5, -12, -12, -12, -12, -7, -7, -7, -7],
            seq: [0, 4, 7, 9, 12, 9, 7, 4, 0, 2, 4, 7, 9, 7, 4, 2, 0, 4, 7, 9, 14, 12, 9, 7, 4, 7, 9, 12, 9, 7, 4, 2],
            ambient: { sound: 'bubble', rate: 0.07, vol: 0.035 }
        },
        lagoon: {
            root: 523.25, bpm: 84, wave: 'sine', vol: 0.08,
            bass: [-12, -12, -12, -12, -12, -12, -12, -12, -7, -7, -7, -7, -12, -12, -12, -12],
            seq: [0, 4, 7, 9, 12, 9, 7, 4, 0, 4, 7, 12, 14, 12, 9, 7, 4, 7, 9, 14, 12, 9, 7, 4, 0, 4, 7, 9, 7, 4, 2, 0],
            ambient: { sound: 'bubble', rate: 0.06, vol: 0.04 }
        },
        seagrass: {
            root: 440.00, bpm: 64, wave: 'sine', vol: 0.10,
            bass: [-12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12],
            seq: [0, 3, 5, 7, 10, 7, 5, 3, 0, null, 5, 7, 10, 12, 10, 7, 5, 7, 10, 12, 15, 12, 10, 7, 3, 5, 7, 10, 7, 5, 3, null],
            ambient: { sound: 'bubble', rate: 0.05, vol: 0.03 }
        },
        rocks: {
            root: 349.23, bpm: 72, wave: 'triangle', vol: 0.09,
            bass: [-12, -12, -12, -12, -5, -5, -5, -5, -12, -12, -12, -12, -5, -5, -5, -5],
            seq: [0, 4, 7, 9, 12, 9, 7, 4, 0, 2, 4, 7, 9, 7, 4, 2, 7, 9, 12, 14, 12, 9, 7, 4, 2, 4, 7, 9, 7, 4, 2, 0],
            ambient: { sound: 'bubble', rate: 0.05, vol: 0.035 }
        },
        ship: {
            root: 164.81, bpm: 56, wave: 'sine', vol: 0.10,
            bass: [-12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12],
            seq: [0, 3, 5, 7, 3, 0, null, 3, 0, 5, 7, 10, 7, 5, 3, 0, 0, 3, 5, 7, 8, 7, 5, 3, 2, 3, 5, 3, null, 0, null, null],
            ambient: { sound: 'drip', rate: 0.07, vol: 0.04 }
        },
        cave: {
            root: 146.83, bpm: 52, wave: 'sine', vol: 0.10,
            bass: [-12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12],
            seq: [0, 3, 5, 7, 3, 0, null, null, 0, 3, 7, 10, 7, 3, 0, null, 3, 5, 7, 10, 12, 10, 7, 5, 3, 0, null, 3, 0, null, null, null],
            ambient: { sound: 'drip', rate: 0.10, vol: 0.045 }
        },
        arctic: {
            root: 659.25, bpm: 70, wave: 'triangle', vol: 0.07,
            bass: [-12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12],
            seq: [12, 16, 19, 16, 12, 16, 19, 21, 16, 19, 21, 24, 21, 19, 16, 12, 19, 16, 12, 16, 19, 21, 19, 16, 12, 16, 19, 24, 21, 19, 16, 19],
            ambient: { sound: 'bell', rate: 0.05, vol: 0.035 }
        },
        trench: {
            root: 130.81, bpm: 48, wave: 'sine', vol: 0.11,
            bass: [-12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12],
            seq: [0, null, 3, null, 0, null, 5, null, 0, null, 3, null, 7, null, 5, null, 0, null, 3, null, 5, null, 3, null, 0, null, null, null, 3, null, null, null],
            ambient: { sound: 'rumble', rate: 0.06, vol: 0.05 }
        },
        treasure: {
            root: 493.88, bpm: 80, wave: 'triangle', vol: 0.08,
            bass: [-12, -12, -12, -12, -7, -7, -7, -7, -12, -12, -12, -12, -7, -7, -7, -7],
            seq: [0, 2, 4, 7, 11, 7, 4, 2, 0, 2, 4, 7, 9, 7, 4, 2, 4, 7, 11, 14, 11, 7, 4, 2, 0, 2, 4, 7, 11, 7, 4, 2],
            ambient: { sound: 'bubble', rate: 0.06, vol: 0.04 }
        },
        night: {
            root: 293.66, bpm: 60, wave: 'sine', vol: 0.09,
            bass: [-12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12],
            seq: [0, 3, 5, 7, 5, 3, 0, null, 0, 3, 5, 10, 7, 5, 3, 0, 5, 7, 10, 12, 10, 7, 5, 3, 0, 3, 5, 7, 5, 3, 0, null],
            ambient: { sound: 'bubble', rate: 0.04, vol: 0.03 }
        }
    };

    // dy = height of the obstacle's bottom / coin centre above the canvas bottom.
    // Obstacles with vx/minX/maxX patrol back and forth (sharks).
    const LEVELS = [
        {
            name: 'Корални гребен', collectible: '🐚', goal: 'finish', music: 'reef', decor: 'reef',
            bgSky: '#3fbfd8', bgPage: '#3fbfd8', isNight: false, noClouds: true, noHills: true,
            obstacles: [
                { x: 700, dy: 210, w: 80, h: 70, type: 'jelly' },
                { x: 1400, dy: 70, w: 90, h: 60, type: 'rock' },
                { x: 2100, dy: 250, w: 70, h: 70, type: 'puffer' },
                { x: 2800, dy: 120, w: 56, h: 140, type: 'seaweed' },
                { x: 3500, dy: 300, w: 80, h: 70, type: 'jelly' },
                { x: 4200, dy: 90, w: 100, h: 60, type: 'rock' },
                { x: 4900, dy: 220, w: 70, h: 70, type: 'puffer' },
                { x: 5600, dy: 200, w: 130, h: 70, type: 'shark', color: '#8fa1b5', vx: 2, minX: 5450, maxX: 5750 }
            ],
            coins: [
                { x: 350, dy: 150 }, { x: 550, dy: 260 }, { x: 950, dy: 200 }, { x: 1300, dy: 300 },
                { x: 1650, dy: 120 }, { x: 2250, dy: 220 }, { x: 2600, dy: 330 }, { x: 3050, dy: 200 },
                { x: 3600, dy: 140 }, { x: 4300, dy: 260 }, { x: 4700, dy: 320 }, { x: 5250, dy: 180 }, { x: 5700, dy: 300 }
            ],
            goalX: 6100, goalW: 240, goalDy: 70, goalH: 340
        },
        {
            name: 'Тропска лагуна', collectible: '🦀', goal: 'finish', music: 'lagoon', decor: 'lagoon',
            bgSky: '#2fb8e8', bgPage: '#2fb8e8', isNight: false, noClouds: true, noHills: true,
            obstacles: [
                { x: 650, dy: 110, w: 56, h: 140, type: 'seaweed' },
                { x: 1300, dy: 300, w: 80, h: 70, type: 'jelly' },
                { x: 2000, dy: 70, w: 70, h: 50, type: 'crab' },
                { x: 2700, dy: 130, w: 56, h: 150, type: 'seaweed' },
                { x: 3400, dy: 240, w: 70, h: 70, type: 'puffer' },
                { x: 4100, dy: 80, w: 90, h: 55, type: 'rock' },
                { x: 4800, dy: 310, w: 80, h: 70, type: 'jelly' },
                { x: 5500, dy: 190, w: 130, h: 70, type: 'shark', color: '#8fa1b5', vx: -2, minX: 5350, maxX: 5700 }
            ],
            coins: [
                { x: 330, dy: 200 }, { x: 590, dy: 300 }, { x: 1000, dy: 140 }, { x: 1450, dy: 250 },
                { x: 1850, dy: 330 }, { x: 2350, dy: 180 }, { x: 2850, dy: 280 }, { x: 3250, dy: 110 },
                { x: 3800, dy: 240 }, { x: 4250, dy: 320 }, { x: 4650, dy: 140 }, { x: 5150, dy: 260 }, { x: 5750, dy: 200 }
            ],
            goalX: 6150, goalW: 240, goalDy: 70, goalH: 340
        },
        {
            name: 'Морске траве', collectible: '🐙', goal: 'finish', music: 'seagrass', decor: 'seagrass',
            bgSky: '#2aa878', bgPage: '#2aa878', isNight: false, noClouds: true, noHills: true,
            obstacles: [
                { x: 600, dy: 90, w: 56, h: 160, type: 'seaweed' },
                { x: 1200, dy: 140, w: 56, h: 170, type: 'seaweed' },
                { x: 1800, dy: 300, w: 80, h: 70, type: 'jelly' },
                { x: 2400, dy: 100, w: 56, h: 150, type: 'seaweed' },
                { x: 3000, dy: 160, w: 56, h: 160, type: 'seaweed' },
                { x: 3600, dy: 70, w: 70, h: 50, type: 'crab' },
                { x: 4200, dy: 110, w: 56, h: 160, type: 'seaweed' },
                { x: 4800, dy: 260, w: 70, h: 70, type: 'puffer' },
                { x: 5400, dy: 80, w: 90, h: 55, type: 'rock' },
                { x: 6000, dy: 140, w: 56, h: 160, type: 'seaweed' }
            ],
            coins: [
                { x: 340, dy: 250 }, { x: 720, dy: 120 }, { x: 1050, dy: 300 }, { x: 1500, dy: 170 },
                { x: 1950, dy: 120 }, { x: 2600, dy: 280 }, { x: 3050, dy: 90 }, { x: 3450, dy: 320 },
                { x: 4000, dy: 180 }, { x: 4400, dy: 300 }, { x: 5000, dy: 130 }, { x: 5550, dy: 250 }, { x: 5900, dy: 330 }
            ],
            goalX: 6300, goalW: 240, goalDy: 70, goalH: 340
        },
        {
            name: 'Каменита обала', collectible: '⭐', goal: 'finish', music: 'rocks', decor: 'rocks',
            bgSky: '#5fbfa0', bgPage: '#5fbfa0', isNight: false, noClouds: true, noHills: true,
            obstacles: [
                { x: 650, dy: 80, w: 90, h: 55, type: 'rock' },
                { x: 1300, dy: 300, w: 70, h: 70, type: 'mine' },
                { x: 2000, dy: 100, w: 90, h: 55, type: 'rock' },
                { x: 2700, dy: 260, w: 70, h: 70, type: 'mine' },
                { x: 3400, dy: 70, w: 90, h: 55, type: 'rock' },
                { x: 4100, dy: 320, w: 70, h: 70, type: 'mine' },
                { x: 4800, dy: 110, w: 90, h: 55, type: 'rock' },
                { x: 5500, dy: 250, w: 70, h: 70, type: 'mine' },
                { x: 6100, dy: 80, w: 90, h: 55, type: 'rock' }
            ],
            coins: [
                { x: 360, dy: 200 }, { x: 700, dy: 310 }, { x: 1150, dy: 140 }, { x: 1600, dy: 260 },
                { x: 2150, dy: 300 }, { x: 2550, dy: 110 }, { x: 3050, dy: 250 }, { x: 3650, dy: 320 },
                { x: 4250, dy: 140 }, { x: 4650, dy: 270 }, { x: 5150, dy: 120 }, { x: 5750, dy: 230 }, { x: 6300, dy: 320 }
            ],
            goalX: 6650, goalW: 240, goalDy: 70, goalH: 340
        },
        {
            name: 'Потопљени брод', collectible: '⚓', goal: 'finish', music: 'ship', decor: 'ship',
            bgSky: '#2f7090', bgPage: '#2f7090', isNight: false, noClouds: true, noHills: true,
            obstacles: [
                { x: 600, dy: 90, w: 70, h: 100, type: 'anchor' },
                { x: 1200, dy: 280, w: 130, h: 70, type: 'shark', color: '#6b7a8a', vx: 2.5, minX: 1050, maxX: 1400 },
                { x: 2000, dy: 80, w: 90, h: 55, type: 'rock' },
                { x: 2700, dy: 240, w: 130, h: 70, type: 'shark', color: '#6b7a8a', vx: -2.5, minX: 2550, maxX: 2900 },
                { x: 3400, dy: 100, w: 70, h: 100, type: 'anchor' },
                { x: 4100, dy: 300, w: 70, h: 70, type: 'mine' },
                { x: 4900, dy: 200, w: 130, h: 70, type: 'shark', color: '#6b7a8a', vx: 2, minX: 4750, maxX: 5100 },
                { x: 5600, dy: 90, w: 70, h: 100, type: 'anchor' }
            ],
            coins: [
                { x: 350, dy: 230 }, { x: 650, dy: 320 }, { x: 1100, dy: 120 }, { x: 1550, dy: 260 },
                { x: 2100, dy: 300 }, { x: 2600, dy: 100 }, { x: 3000, dy: 250 }, { x: 3550, dy: 320 },
                { x: 4250, dy: 150 }, { x: 4650, dy: 280 }, { x: 5300, dy: 120 }, { x: 5850, dy: 250 }, { x: 6200, dy: 330 }
            ],
            goalX: 6500, goalW: 240, goalDy: 70, goalH: 340
        },
        {
            name: 'Подводна пећина', collectible: '💎', goal: 'finish', music: 'cave', decor: 'cave',
            bgSky: '#1f3a5a', bgPage: '#1f3a5a', isNight: false, noClouds: true, noHills: true,
            ceiling: true, ceilingColor: '#0e2238',
            obstacles: [
                { x: 600, dy: 240, w: 70, h: 70, type: 'mine' },
                { x: 1300, dy: 320, w: 80, h: 70, type: 'jelly', color: '#7fd3ff' },
                { x: 2000, dy: 80, w: 90, h: 55, type: 'rock' },
                { x: 2700, dy: 260, w: 70, h: 70, type: 'mine' },
                { x: 3400, dy: 300, w: 80, h: 70, type: 'jelly', color: '#7fd3ff' },
                { x: 4100, dy: 70, w: 90, h: 55, type: 'rock' },
                { x: 4800, dy: 280, w: 70, h: 70, type: 'mine' },
                { x: 5500, dy: 220, w: 70, h: 70, type: 'puffer', color: '#7fd3ff' }
            ],
            coins: [
                { x: 340, dy: 190 }, { x: 620, dy: 300 }, { x: 1100, dy: 130 }, { x: 1600, dy: 250 },
                { x: 2150, dy: 300 }, { x: 2600, dy: 110 }, { x: 3050, dy: 240 }, { x: 3700, dy: 310 },
                { x: 4250, dy: 140 }, { x: 4650, dy: 260 }, { x: 5200, dy: 120 }, { x: 5750, dy: 230 }, { x: 6200, dy: 300 }
            ],
            goalX: 6500, goalW: 240, goalDy: 70, goalH: 340
        },
        {
            name: 'Ледени океан', collectible: '🐋', goal: 'finish', music: 'arctic', decor: 'arctic',
            bgSky: '#bfe8ff', bgPage: '#bfe8ff', isNight: false, noClouds: true, noHills: true,
            obstacles: [
                { x: 650, dy: 80, w: 90, h: 55, type: 'rock', color: '#cfeaff' },
                { x: 1400, dy: 300, w: 100, h: 44, type: 'rock', color: '#dff0ff' },
                { x: 2100, dy: 100, w: 90, h: 55, type: 'rock', color: '#cfeaff' },
                { x: 2800, dy: 260, w: 70, h: 70, type: 'puffer', color: '#9fd4ff' },
                { x: 3500, dy: 80, w: 90, h: 55, type: 'rock', color: '#cfeaff' },
                { x: 4200, dy: 320, w: 80, h: 70, type: 'jelly', color: '#bfe8ff' },
                { x: 4900, dy: 110, w: 90, h: 55, type: 'rock', color: '#cfeaff' },
                { x: 5600, dy: 250, w: 70, h: 70, type: 'mine', color: '#9fc4e8' }
            ],
            coins: [
                { x: 350, dy: 200 }, { x: 610, dy: 310 }, { x: 1050, dy: 140 }, { x: 1500, dy: 260 },
                { x: 2000, dy: 300 }, { x: 2450, dy: 110 }, { x: 2950, dy: 250 }, { x: 3650, dy: 320 },
                { x: 4250, dy: 150 }, { x: 4650, dy: 280 }, { x: 5250, dy: 120 }, { x: 5800, dy: 240 }, { x: 6300, dy: 320 }
            ],
            goalX: 6600, goalW: 240, goalDy: 70, goalH: 340
        },
        {
            name: 'Тамни ров', collectible: '🌟', goal: 'finish', music: 'trench', decor: 'trench',
            bgSky: '#101a30', bgPage: '#101a30', isNight: true, noClouds: true, noHills: true,
            obstacles: [
                { x: 600, dy: 260, w: 70, h: 70, type: 'mine' },
                { x: 1300, dy: 320, w: 80, h: 70, type: 'jelly', color: '#7fd3ff' },
                { x: 2000, dy: 240, w: 70, h: 70, type: 'mine' },
                { x: 2700, dy: 300, w: 80, h: 70, type: 'jelly', color: '#9bd3ff' },
                { x: 3400, dy: 280, w: 70, h: 70, type: 'mine' },
                { x: 4100, dy: 90, w: 90, h: 55, type: 'rock', color: '#2b3a52' },
                { x: 4800, dy: 260, w: 70, h: 70, type: 'mine' },
                { x: 5500, dy: 310, w: 80, h: 70, type: 'jelly', color: '#7fd3ff' }
            ],
            coins: [
                { x: 340, dy: 170 }, { x: 650, dy: 300 }, { x: 1150, dy: 120 }, { x: 1600, dy: 260 },
                { x: 2150, dy: 320 }, { x: 2650, dy: 110 }, { x: 3100, dy: 250 }, { x: 3750, dy: 310 },
                { x: 4300, dy: 150 }, { x: 4700, dy: 270 }, { x: 5250, dy: 130 }, { x: 5800, dy: 250 }, { x: 6300, dy: 320 }
            ],
            goalX: 6600, goalW: 240, goalDy: 70, goalH: 340
        },
        {
            name: 'Пиратско благо', collectible: '💰', goal: 'finish', music: 'treasure', decor: 'treasure',
            bgSky: '#2fbfa0', bgPage: '#2fbfa0', isNight: false, noClouds: true, noHills: true,
            obstacles: [
                { x: 650, dy: 70, w: 70, h: 50, type: 'crab' },
                { x: 1400, dy: 90, w: 90, h: 55, type: 'rock' },
                { x: 2100, dy: 300, w: 70, h: 70, type: 'mine' },
                { x: 2800, dy: 80, w: 70, h: 50, type: 'crab' },
                { x: 3500, dy: 110, w: 90, h: 55, type: 'rock' },
                { x: 4200, dy: 310, w: 80, h: 70, type: 'jelly', color: '#ffd23f' },
                { x: 4900, dy: 70, w: 70, h: 50, type: 'crab' },
                { x: 5600, dy: 260, w: 70, h: 70, type: 'mine' }
            ],
            coins: [
                { x: 360, dy: 220 }, { x: 610, dy: 320 }, { x: 1050, dy: 130 }, { x: 1500, dy: 260 },
                { x: 2050, dy: 300 }, { x: 2500, dy: 110 }, { x: 3000, dy: 250 }, { x: 3650, dy: 320 },
                { x: 4250, dy: 140 }, { x: 4650, dy: 280 }, { x: 5200, dy: 120 }, { x: 5750, dy: 240 }, { x: 6300, dy: 330 }
            ],
            goalX: 6600, goalW: 240, goalDy: 70, goalH: 340
        },
        {
            name: 'Ноћни океан', collectible: '🌙', goal: 'finish', music: 'night', decor: 'night',
            bgSky: '#1a2a5a', bgPage: '#1a2a5a', isNight: true, noClouds: true, noHills: true,
            obstacles: [
                { x: 650, dy: 220, w: 130, h: 70, type: 'shark', color: '#8fa1b5', vx: 2, minX: 500, maxX: 850 },
                { x: 1400, dy: 310, w: 80, h: 70, type: 'jelly', color: '#9bd3ff' },
                { x: 2100, dy: 80, w: 90, h: 55, type: 'rock', color: '#4a5a7a' },
                { x: 2800, dy: 240, w: 130, h: 70, type: 'shark', color: '#8fa1b5', vx: -2, minX: 2650, maxX: 3000 },
                { x: 3500, dy: 280, w: 70, h: 70, type: 'mine' },
                { x: 4200, dy: 320, w: 80, h: 70, type: 'jelly', color: '#9bd3ff' },
                { x: 4900, dy: 200, w: 130, h: 70, type: 'shark', color: '#8fa1b5', vx: 2, minX: 4750, maxX: 5100 },
                { x: 5600, dy: 90, w: 90, h: 55, type: 'rock', color: '#4a5a7a' }
            ],
            coins: [
                { x: 350, dy: 160 }, { x: 650, dy: 300 }, { x: 1150, dy: 120 }, { x: 1600, dy: 250 },
                { x: 2150, dy: 300 }, { x: 2650, dy: 110 }, { x: 3150, dy: 250 }, { x: 3800, dy: 310 },
                { x: 4350, dy: 150 }, { x: 4750, dy: 280 }, { x: 5300, dy: 120 }, { x: 5850, dy: 240 }, { x: 6300, dy: 320 }
            ],
            goalX: 6600, goalW: 240, goalDy: 70, goalH: 340
        }
    ];

    // --- Underwater scenery (drawn on top, semi-transparent) ---
    function bxs(cameraX, spacing, factor, w) {
        const arr = [];
        const start = Math.floor((cameraX * factor - 100) / spacing);
        const end = Math.ceil((cameraX * factor + w + 100) / spacing);
        for (let i = start; i <= end; i++) arr.push(i * spacing - cameraX * factor);
        return arr;
    }

    function drawRays(ctx, t, w, h, color) {
        ctx.save();
        ctx.fillStyle = color || 'rgba(255,255,255,0.07)';
        for (let i = 0; i < 4; i++) {
            const x0 = w * (0.12 + i * 0.22);
            ctx.beginPath();
            ctx.moveTo(x0, -20);
            ctx.lineTo(x0 + Math.sin(t + i) * 30, h);
            ctx.lineTo(x0 + w * 0.07 + Math.sin(t + i) * 30, h);
            ctx.lineTo(x0 + w * 0.05, -20);
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();
    }

    function drawFloor(ctx, w, h, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(0, h);
        ctx.lineTo(0, h - 26);
        ctx.quadraticCurveTo(w * 0.25, h - 40, w * 0.5, h - 26);
        ctx.quadraticCurveTo(w * 0.75, h - 14, w, h - 30);
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fill();
    }

    function drawBubbles(ctx, t, w, h, n) {
        ctx.fillStyle = 'rgba(255,255,255,0.28)';
        for (let i = 0; i < n; i++) {
            const x = ((i * 229 + t * 22) % (w + 40)) - 20;
            const y = h - ((i * 137 + t * 46) % (h + 40)) + 20;
            ctx.beginPath();
            ctx.arc(x, y, 4 + (i % 3) * 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function drawCoral(ctx, t, cameraX, w, h) {
        const floorY = h - 26;
        drawRays(ctx, t, w, h);
        drawFloor(ctx, w, h, '#c9a06a');
        const colors = ['#ff6f91', '#ffb64d', '#b84fff', '#ff4f4f'];
        const xs = bxs(cameraX, 260, 0.45, w);
        for (let i = 0; i < xs.length; i++) {
            const x = xs[i];
            const col = colors[i % colors.length];
            ctx.fillStyle = col;
            for (let k = 0; k < 3; k++) {
                ctx.beginPath();
                ctx.arc(x + (k - 1) * 16, floorY - 8 - (k % 2) * 16, 12, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.fillStyle = 'rgba(255,255,255,0.18)';
            ctx.beginPath();
            ctx.ellipse(x - 8, floorY - 20, 6, 4, -0.5, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.fillStyle = 'rgba(70,120,160,0.35)';
        for (let i = 0; i < 6; i++) {
            const x = ((i * 311 + t * 30) % (w + 60)) - 30;
            const y = 50 + ((i * 97) % (h - 140));
            ctx.beginPath();
            ctx.ellipse(x, y, 9, 5, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        drawBubbles(ctx, t, w, h, 18);
    }

    function drawLagoon(ctx, t, cameraX, w, h) {
        const floorY = h - 26;
        drawRays(ctx, t, w, h);
        drawFloor(ctx, w, h, '#f0d8a0');
        ctx.fillStyle = '#e8a860';
        const stars = bxs(cameraX, 340, 0.4, w);
        for (let i = 0; i < stars.length; i++) {
            ctx.save();
            ctx.translate(stars[i], floorY - 8);
            ctx.rotate(0.5);
            for (let k = 0; k < 5; k++) {
                const a = k * Math.PI * 2 / 5 - Math.PI / 2;
                ctx.beginPath();
                ctx.arc(Math.cos(a) * 10, Math.sin(a) * 10, 4, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }
        drawBubbles(ctx, t, w, h, 16);
    }

    function drawSeagrass(ctx, t, cameraX, w, h) {
        drawRays(ctx, t, w, h);
        drawFloor(ctx, w, h, '#8ab86a');
        ctx.lineCap = 'round';
        const xs = bxs(cameraX, 120, 0.55, w);
        for (let i = 0; i < xs.length; i++) {
            const x = xs[i];
            const sh = 90 + ((i * 37) % 4) * 50;
            ctx.strokeStyle = 'rgba(47,158,68,0.55)';
            ctx.lineWidth = 8;
            ctx.beginPath();
            ctx.moveTo(x, h - 20);
            ctx.quadraticCurveTo(x + 12, h - 20 - sh * 0.5, x + Math.sin(t + i) * 14, h - 20 - sh);
            ctx.stroke();
            ctx.strokeStyle = 'rgba(47,158,68,0.35)';
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.moveTo(x + 20, h - 20);
            ctx.quadraticCurveTo(x + 32, h - 20 - sh * 0.4, x + 22 + Math.sin(t + i) * 10, h - 20 - sh * 0.6);
            ctx.stroke();
        }
        drawBubbles(ctx, t, w, h, 16);
    }

    function drawRockScape(ctx, t, cameraX, w, h) {
        drawRays(ctx, t, w, h);
        drawFloor(ctx, w, h, '#5a6a78');
        const xs = bxs(cameraX, 320, 0.4, w);
        for (let i = 0; i < xs.length; i++) {
            const x = xs[i];
            const bh = 40 + ((i * 29) % 3) * 22;
            const bw = 110 + ((i * 17) % 3) * 40;
            ctx.fillStyle = '#6b7a88';
            ctx.beginPath();
            ctx.moveTo(x - bw / 2, h - 22);
            ctx.lineTo(x - bw * 0.35, h - 22 - bh);
            ctx.quadraticCurveTo(x, h - 22 - bh - 16, x + bw * 0.35, h - 22 - bh);
            ctx.lineTo(x + bw / 2, h - 22);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,0.2)';
            ctx.beginPath();
            ctx.ellipse(x - bw * 0.2, h - 22 - bh, bw * 0.14, bh * 0.16, -0.4, 0, Math.PI * 2);
            ctx.fill();
        }
        drawBubbles(ctx, t, w, h, 14);
    }

    function drawShipwreck(ctx, t, cameraX, w, h) {
        ctx.save();
        ctx.globalAlpha = 0.6;
        ctx.fillStyle = '#3f4a52';
        const xs = bxs(cameraX, 950, 0.25, w);
        for (let i = 0; i < xs.length; i++) {
            const x = xs[i];
            const sy = h * 0.5;
            ctx.save();
            ctx.translate(x, sy);
            ctx.rotate(-0.08);
            ctx.fillRect(-170, -30, 340, 60);
            ctx.beginPath();
            ctx.moveTo(-170, -30);
            ctx.lineTo(-120, -95);
            ctx.lineTo(-80, -30);
            ctx.closePath();
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(120, -30);
            ctx.lineTo(160, -80);
            ctx.lineTo(170, -30);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#2b333c';
            ctx.fillRect(20, -60, 5, 60);
            ctx.restore();
            ctx.fillStyle = '#3f4a52';
        }
        ctx.restore();
        drawRays(ctx, t, w, h);
        drawBubbles(ctx, t, w, h, 18);
    }

    function drawCaveDecor(ctx, t, cameraX, w, h) {
        drawFloor(ctx, w, h, '#14263c');
        ctx.fillStyle = 'rgba(127,211,255,0.5)';
        const gems = bxs(cameraX, 320, 0.4, w);
        for (let i = 0; i < gems.length; i++) {
            ctx.save();
            ctx.translate(gems[i], h - 30);
            ctx.rotate(0.6);
            ctx.beginPath();
            ctx.moveTo(0, -12);
            ctx.lineTo(9, 0);
            ctx.lineTo(0, 12);
            ctx.lineTo(-9, 0);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
        drawBubbles(ctx, t, w, h, 10);
    }

    function drawArctic(ctx, t, cameraX, w, h) {
        drawRays(ctx, t, w, h, 'rgba(255,255,255,0.10)');
        drawFloor(ctx, w, h, '#dff0ff');
        const xs = bxs(cameraX, 340, 0.4, w);
        for (let i = 0; i < xs.length; i++) {
            const x = xs[i];
            const bh = 34 + ((i * 29) % 3) * 20;
            ctx.fillStyle = i % 2 ? '#dff0ff' : '#cfeaff';
            ctx.beginPath();
            ctx.moveTo(x - 70, h - 24);
            ctx.lineTo(x - 40, h - 24 - bh);
            ctx.lineTo(x, h - 24 - bh - 12);
            ctx.lineTo(x + 45, h - 24 - bh);
            ctx.lineTo(x + 70, h - 24);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,0.6)';
            ctx.beginPath();
            ctx.moveTo(x - 30, h - 24 - bh);
            ctx.lineTo(x, h - 24 - bh - 10);
            ctx.lineTo(x + 20, h - 24 - bh);
            ctx.closePath();
            ctx.fill();
        }
        drawBubbles(ctx, t, w, h, 12);
    }

    function drawTrench(ctx, t, cameraX, w, h) {
        drawFloor(ctx, w, h, '#0a1322');
        ctx.fillStyle = 'rgba(43,58,82,0.8)';
        const xs = bxs(cameraX, 340, 0.4, w);
        for (let i = 0; i < xs.length; i++) {
            ctx.beginPath();
            ctx.ellipse(xs[i], h - 20, 60, 18, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.fillStyle = 'rgba(127,211,255,0.7)';
        const glows = bxs(cameraX, 220, 0.5, w);
        for (let i = 0; i < glows.length; i++) {
            const gy = 60 + ((i * 73) % (h - 160));
            ctx.save();
            ctx.shadowColor = '#7fd3ff';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(glows[i], gy, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        drawBubbles(ctx, t, w, h, 8);
    }

    function drawTreasure(ctx, t, cameraX, w, h) {
        drawRays(ctx, t, w, h);
        drawFloor(ctx, w, h, '#d8c080');
        const xs = bxs(cameraX, 520, 0.4, w);
        for (let i = 0; i < xs.length; i++) {
            const x = xs[i];
            const ty = h - 26;
            ctx.fillStyle = '#8a5a2a';
            ctx.fillRect(x - 24, ty - 20, 48, 20);
            ctx.fillStyle = '#a86a30';
            ctx.beginPath();
            ctx.moveTo(x - 24, ty - 20);
            ctx.lineTo(x - 18, ty - 32);
            ctx.lineTo(x + 18, ty - 32);
            ctx.lineTo(x + 24, ty - 20);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#ffd23f';
            ctx.fillRect(x - 24, ty - 14, 48, 4);
            ctx.fillRect(x - 3, ty - 30, 6, 14);
            for (let k = 0; k < 5; k++) {
                ctx.beginPath();
                ctx.arc(x - 14 + k * 7, ty - 6, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        drawBubbles(ctx, t, w, h, 16);
    }

    function drawNightOcean(ctx, t, cameraX, w, h) {
        drawRays(ctx, t, w, h, 'rgba(160,190,255,0.08)');
        drawFloor(ctx, w, h, '#101c40');
        ctx.fillStyle = 'rgba(200,220,255,0.5)';
        const glows = bxs(cameraX, 260, 0.5, w);
        for (let i = 0; i < glows.length; i++) {
            const gy = 50 + ((i * 83) % (h - 140));
            ctx.beginPath();
            ctx.arc(glows[i], gy, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        drawBubbles(ctx, t, w, h, 14);
    }

    function drawDecor(ctx, t, cameraX, canvas, theme) {
        const w = canvas.width, h = canvas.height;
        ctx.save();
        switch (theme.decor) {
            case 'reef': drawCoral(ctx, t, cameraX, w, h); break;
            case 'lagoon': drawLagoon(ctx, t, cameraX, w, h); break;
            case 'seagrass': drawSeagrass(ctx, t, cameraX, w, h); break;
            case 'rocks': drawRockScape(ctx, t, cameraX, w, h); break;
            case 'ship': drawShipwreck(ctx, t, cameraX, w, h); break;
            case 'cave': drawCaveDecor(ctx, t, cameraX, w, h); break;
            case 'arctic': drawArctic(ctx, t, cameraX, w, h); break;
            case 'trench': drawTrench(ctx, t, cameraX, w, h); break;
            case 'treasure': drawTreasure(ctx, t, cameraX, w, h); break;
            case 'night': drawNightOcean(ctx, t, cameraX, w, h); break;
        }
        ctx.restore();
    }

    // --- Underwater obstacles (fish/sharks/jellyfish/etc.) ---
    function drawObstacle(ctx, o, theme) {
        switch (o.type) {
            case 'shark': drawShark(ctx, o); break;
            case 'jelly': drawJelly(ctx, o); break;
            case 'rock': drawOceanRock(ctx, o); break;
            case 'mine': drawMine(ctx, o); break;
            case 'seaweed': drawSeaweed(ctx, o); break;
            case 'puffer': drawPuffer(ctx, o); break;
            case 'crab': drawCrab(ctx, o); break;
            case 'anchor': drawAnchor(ctx, o); break;
            default: drawOceanRock(ctx, o);
        }
    }

    function drawShark(ctx, o) {
        const x = o.x, y = o.y, w = o.width, h = o.height;
        const flip = o.vx < 0;
        ctx.save();
        ctx.translate(x + w / 2, y + h / 2);
        if (flip) ctx.scale(-1, 1);
        ctx.fillStyle = '#5f6b7a';
        ctx.beginPath();
        ctx.moveTo(-w * 0.42, 0);
        ctx.lineTo(-w * 0.52, -h * 0.35);
        ctx.lineTo(-w * 0.44, 0);
        ctx.lineTo(-w * 0.52, h * 0.35);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = o.color || '#8fa1b5';
        ctx.beginPath();
        ctx.ellipse(0, 0, w * 0.42, h * 0.36, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-w * 0.05, -h * 0.2);
        ctx.lineTo(w * 0.02, -h * 0.52);
        ctx.lineTo(w * 0.2, -h * 0.22);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.beginPath();
        ctx.ellipse(-w * 0.03, h * 0.16, w * 0.3, h * 0.16, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1b2430';
        ctx.beginPath();
        ctx.arc(w * 0.24, -h * 0.05, h * 0.08, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(27,36,48,0.5)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(w * 0.05 + i * 4, -h * 0.22);
            ctx.lineTo(w * 0.05 + i * 4, h * 0.18);
            ctx.stroke();
        }
        ctx.restore();
    }

    function drawJelly(ctx, o) {
        const x = o.x, y = o.y, w = o.width, h = o.height;
        const cx = x + w / 2, cy = y + h * 0.34;
        const col = o.color || '#c9a6ff';
        ctx.save();
        ctx.globalAlpha = 0.85;
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(cx, cy, w * 0.4, Math.PI, 0);
        ctx.fill();
        ctx.fillRect(cx - w * 0.4, cy - 2, w * 0.8, h * 0.12);
        ctx.globalAlpha = 0.6;
        ctx.strokeStyle = col;
        ctx.lineWidth = 3;
        for (let i = -2; i <= 2; i++) {
            ctx.beginPath();
            ctx.moveTo(cx + i * w * 0.14, cy);
            ctx.quadraticCurveTo(cx + i * w * 0.18, cy + h * 0.4, cx + i * w * 0.12, y + h);
            ctx.stroke();
        }
        ctx.restore();
    }

    function drawOceanRock(ctx, o) {
        const x = o.x, y = o.y, w = o.width, h = o.height;
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.beginPath(); ctx.ellipse(x + w / 2, y + h + 4, w * 0.5, 6, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = o.color || '#7a8a96';
        ctx.beginPath();
        ctx.moveTo(x + 4, y + h - 3);
        ctx.quadraticCurveTo(x - 2, y + h * 0.5, x + w * 0.3, y + 8);
        ctx.quadraticCurveTo(x + w * 0.7, y - 4, x + w - 4, y + h * 0.45);
        ctx.quadraticCurveTo(x + w, y + h, x + 4, y + h - 3);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.beginPath(); ctx.ellipse(x + w * 0.32, y + h * 0.3, w * 0.16, h * 0.1, -0.4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(47,158,68,0.5)';
        ctx.beginPath(); ctx.ellipse(x + w * 0.7, y + h * 0.2, 5, 3, 0.6, 0, Math.PI * 2); ctx.fill();
    }

    function drawMine(ctx, o) {
        const x = o.x, y = o.y, w = o.width, h = o.height;
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath(); ctx.ellipse(x + w / 2, y + h + 4, w * 0.5, 6, 0, 0, Math.PI * 2); ctx.fill();
        ctx.save();
        ctx.translate(x + w / 2, y + h / 2);
        ctx.fillStyle = o.color || '#4a5560';
        for (let i = 0; i < 10; i++) {
            ctx.save();
            ctx.rotate(i * Math.PI * 2 / 10);
            ctx.fillRect(-2, -h * 0.5, 4, h * 0.18);
            ctx.restore();
        }
        ctx.fillStyle = '#2b333c';
        ctx.beginPath(); ctx.arc(0, 0, w * 0.32, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.beginPath(); ctx.arc(-w * 0.08, -h * 0.08, w * 0.08, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#e52521';
        ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }

    function drawSeaweed(ctx, o) {
        const x = o.x, y = o.y, w = o.width, h = o.height;
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath(); ctx.ellipse(x + w / 2, y + h + 3, w * 0.5, 5, 0, 0, Math.PI * 2); ctx.fill();
        const col = o.color || '#2f9e44';
        ctx.strokeStyle = col;
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x + w * 0.4, y + h);
        ctx.quadraticCurveTo(x + w * 0.2, y + h * 0.55, x + w * 0.42, y + 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + w * 0.65, y + h);
        ctx.quadraticCurveTo(x + w * 0.85, y + h * 0.6, x + w * 0.6, y + h * 0.18);
        ctx.stroke();
        ctx.fillStyle = col;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.ellipse(x + w * 0.42 - (i % 2) * w * 0.12, y + h - i * h * 0.3, w * 0.16, h * 0.06, 0.6, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function drawPuffer(ctx, o) {
        const x = o.x, y = o.y, w = o.width, h = o.height;
        ctx.save();
        ctx.translate(x + w / 2, y + h / 2);
        ctx.strokeStyle = 'rgba(43,45,66,0.6)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
            const a = i * Math.PI * 2 / 8 + 0.3;
            ctx.beginPath();
            ctx.moveTo(Math.cos(a) * w * 0.3, Math.sin(a) * h * 0.3);
            ctx.lineTo(Math.cos(a) * w * 0.46, Math.sin(a) * h * 0.46);
            ctx.stroke();
        }
        ctx.fillStyle = o.color || '#fbd000';
        ctx.beginPath(); ctx.arc(0, 0, w * 0.3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(-w * 0.08, -h * 0.08, w * 0.09, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#1b2430';
        ctx.beginPath(); ctx.arc(-w * 0.08, -h * 0.08, w * 0.045, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }

    function drawCrab(ctx, o) {
        const x = o.x, y = o.y, w = o.width, h = o.height;
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.beginPath(); ctx.ellipse(x + w / 2, y + h + 3, w * 0.5, 5, 0, 0, Math.PI * 2); ctx.fill();
        const col = o.color || '#e52521';
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.ellipse(x + w / 2, y + h * 0.6, w * 0.34, h * 0.3, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = col;
        ctx.lineWidth = 3;
        for (let i = -2; i <= 2; i++) {
            if (i === 0) continue;
            ctx.beginPath();
            ctx.moveTo(x + w / 2 + i * 10, y + h * 0.6);
            ctx.lineTo(x + w / 2 + i * 18, y + h * 0.95);
            ctx.stroke();
        }
        for (const s of [-1, 1]) {
            ctx.beginPath();
            ctx.arc(x + w / 2 + s * w * 0.38, y + h * 0.42, h * 0.16, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(x + w / 2 - 6, y + h * 0.32, 4, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x + w / 2 + 6, y + h * 0.32, 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#1b2430';
        ctx.beginPath(); ctx.arc(x + w / 2 - 6, y + h * 0.32, 2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x + w / 2 + 6, y + h * 0.32, 2, 0, Math.PI * 2); ctx.fill();
    }

    function drawAnchor(ctx, o) {
        const x = o.x, y = o.y, w = o.width, h = o.height;
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.beginPath(); ctx.ellipse(x + w / 2, y + h + 3, w * 0.5, 5, 0, 0, Math.PI * 2); ctx.fill();
        const col = o.color || '#4a5560';
        ctx.strokeStyle = col;
        ctx.lineWidth = 7;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x + w / 2, y);
        ctx.lineTo(x + w / 2, y + h * 0.7);
        ctx.stroke();
        ctx.beginPath(); ctx.arc(x + w / 2, y + 6, 8, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + w / 2 - w * 0.3, y + h * 0.32);
        ctx.lineTo(x + w / 2 + w * 0.3, y + h * 0.32);
        ctx.stroke();
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.moveTo(x + w / 2 - w * 0.34, y + h * 0.72);
        ctx.quadraticCurveTo(x + w / 2 - w * 0.4, y + h * 0.98, x + w / 2, y + h);
        ctx.quadraticCurveTo(x + w / 2 + w * 0.4, y + h * 0.98, x + w / 2 + w * 0.34, y + h * 0.72);
        ctx.quadraticCurveTo(x + w / 2, y + h * 0.86, x + w / 2 - w * 0.34, y + h * 0.72);
        ctx.closePath();
        ctx.fill();
    }

    // Coral/rock finish arch: two pillars + curved top + bubble portal + ЦИЉ banner.
    function drawOceanGoal(ctx, themeGoal, goal) {
        const gx = goal.x, gy = goal.y, gw = goal.width, gh = goal.height;
        const pw = 26;
        ctx.fillStyle = '#6b5a4a';
        ctx.fillRect(gx, gy, pw, gh);
        ctx.fillRect(gx + gw - pw, gy, pw, gh);
        ctx.beginPath();
        ctx.arc(gx + gw / 2, gy + 44, gw / 2 - 4, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.18)';
        ctx.beginPath();
        ctx.arc(gx + gw / 2, gy + 44, gw / 2 - 16, Math.PI, 0);
        ctx.fill();
        ctx.strokeStyle = 'rgba(127,219,255,0.5)';
        ctx.lineWidth = 6;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.arc(gx + gw / 2, gy + 40 + i * 40, 46 + i * 30, 0, Math.PI * 2);
            ctx.stroke();
        }
        const bw = Math.min(gw - 44, 190), bh = 46;
        const by = gy + Math.max(20, (gh - bh) / 2 - 6);
        ctx.fillStyle = '#4a3f6b';
        ctx.beginPath();
        ctx.roundRect(gx + (gw - bw) / 2, by, bw, bh, 14);
        ctx.fill();
        ctx.fillStyle = '#FFD23F';
        ctx.font = 'bold 32px "Fredoka", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('ЦИЉ', gx + gw / 2, by + bh / 2 + 2);
    }

    window.startOcean = function () {
        if (window.__adv) return;
        AdventureEngine.create({
            id: 'ocean',
            mode: 'fly',
            hero: '🐟',
            heroFontSize: 84,
            heroW: 110,
            heroH: 100,
            heroFlip: true,
            heroBob: 5,
            offsetStartRatio: 0.16,
            speed: 4.5,
            obstacleScale: 1.15,
            pickupFontSize: 58,
            levels: LEVELS,
            music: MUSIC,
            drawObstacle: drawObstacle,
            drawDecor: drawDecor,
            drawGoal: drawOceanGoal
        });
    };
})();
