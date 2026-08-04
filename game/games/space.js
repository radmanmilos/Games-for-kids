/* Свемир (Space) — Phase 4 adventure game on the shared adventure engine.
   Fly-mode rocket: free 2D movement, no gravity. The little rocket 🚀 flies
   through 10 space worlds, dodging meteors / asteroids / UFOs / comets / black
   holes and collecting the world's collectible emoji, reaching the ЦИЉ gate.
   Every world has its own procedural music theme + ambient layer and cosmic
   scenery. */
(function () {
    'use strict';

    const MUSIC = {
        stars: {
            root: 783.99, bpm: 84, wave: 'triangle', vol: 0.07,
            bass: [-12, -12, -12, -12, -5, -5, -5, -5, -12, -12, -12, -12, -7, -7, -7, -7],
            seq: [0, 4, 7, 12, 16, 12, 7, 4, 0, 4, 7, 9, 12, 9, 7, 4, 12, 16, 19, 16, 12, 16, 19, 21, 16, 12, 9, 7, 4, 7, 9, 12],
            ambient: { sound: 'flute', rate: 0.05, vol: 0.04 }
        },
        moon: {
            root: 523.25, bpm: 68, wave: 'sine', vol: 0.08,
            bass: [-12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12],
            seq: [0, 3, 5, 7, 5, 3, 0, null, 0, 3, 5, 10, 7, 5, 3, 0, 5, 7, 10, 12, 10, 7, 5, 3, 0, 3, 5, 7, 5, 3, 0, null],
            ambient: { sound: 'wind', rate: 0.05, vol: 0.05 }
        },
        mars: {
            root: 349.23, bpm: 88, wave: 'triangle', vol: 0.09,
            bass: [-12, -12, -12, -12, -5, -5, -5, -5, -12, -12, -12, -12, -7, -7, -7, -7],
            seq: [0, 4, 7, 9, 12, 9, 7, 4, 0, 2, 4, 7, 9, 7, 4, 2, 7, 9, 12, 14, 12, 9, 7, 4, 2, 4, 7, 9, 7, 4, 2, 0],
            ambient: { sound: 'desert', rate: 0.06, vol: 0.045 }
        },
        belt: {
            root: 440.00, bpm: 96, wave: 'sawtooth', vol: 0.05,
            bass: [-12, -12, -12, -12, -12, -12, -12, -12, -5, -5, -5, -5, -12, -12, -12, -12],
            seq: [0, 5, 7, 12, 7, 5, 0, null, 0, 5, 7, 12, 14, 12, 7, 5, 0, 5, 7, 12, 7, 5, 0, null, 7, 5, 0, 5, 7, 12, 7, null],
            ambient: { sound: 'cricket', rate: 0.05, vol: 0.035 }
        },
        rings: {
            root: 493.88, bpm: 74, wave: 'sine', vol: 0.08,
            bass: [-12, -12, -12, -12, -7, -7, -7, -7, -12, -12, -12, -12, -7, -7, -7, -7],
            seq: [0, 2, 4, 7, 11, 7, 4, 2, 0, 2, 4, 7, 9, 7, 4, 2, 4, 7, 11, 14, 11, 7, 4, 2, 0, 2, 4, 7, 11, 7, 4, 2],
            ambient: { sound: 'bell', rate: 0.06, vol: 0.035 }
        },
        giant: {
            root: 146.83, bpm: 58, wave: 'sine', vol: 0.10,
            bass: [-12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12],
            seq: [0, null, 3, null, 0, null, 5, null, 0, null, 3, null, 7, null, 5, null, 0, null, 3, null, 5, null, 3, null, 0, null, null, null, 3, null, null, null],
            ambient: { sound: 'rumble', rate: 0.06, vol: 0.05 }
        },
        ice: {
            root: 659.25, bpm: 72, wave: 'triangle', vol: 0.07,
            bass: [-12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12],
            seq: [12, 16, 19, 16, 12, 16, 19, 21, 16, 19, 21, 24, 21, 19, 16, 12, 19, 16, 12, 16, 19, 21, 19, 16, 12, 16, 19, 24, 21, 19, 16, 19],
            ambient: { sound: 'bell', rate: 0.05, vol: 0.035 }
        },
        station: {
            root: 587.33, bpm: 90, wave: 'sine', vol: 0.08,
            bass: [-12, -12, -12, -12, -5, -5, -5, -5, -12, -12, -12, -12, -5, -5, -5, -5],
            seq: [0, 4, 7, 11, 12, 11, 7, 4, 0, 4, 7, 11, 14, 11, 7, 4, 4, 7, 11, 14, 12, 11, 7, 4, 0, 2, 4, 7, 11, 7, 4, 2],
            ambient: { sound: 'coo', rate: 0.05, vol: 0.05 }
        },
        galaxy: {
            root: 523.25, bpm: 80, wave: 'triangle', vol: 0.07,
            bass: [-12, -12, -12, -12, -7, -7, -7, -7, -12, -12, -12, -12, -7, -7, -7, -7],
            seq: [0, 4, 7, 12, 14, 12, 7, 4, 0, 4, 7, 12, 16, 12, 7, 4, 7, 12, 16, 19, 16, 12, 7, 4, 0, 4, 7, 12, 7, 4, 2, 0],
            ambient: { sound: 'flute', rate: 0.04, vol: 0.04 }
        },
        deep: {
            root: 196.00, bpm: 60, wave: 'sine', vol: 0.09,
            bass: [-12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12],
            seq: [0, 3, 5, 7, 3, 0, null, 3, 0, 5, 7, 10, 7, 5, 3, 0, 0, 3, 5, 7, 8, 7, 5, 3, 2, 3, 5, 3, null, 0, null, null],
            ambient: { sound: 'rumble', rate: 0.05, vol: 0.045 }
        }
    };

    // dy = height of the obstacle's bottom / coin centre above the canvas bottom.
    // Obstacles with vx/minX/maxX patrol back and forth (UFOs, comets, aliens).
    const LEVELS = [
        {
            name: 'Звездано небо', collectible: '🌟', goal: 'finish', music: 'stars', decor: 'stars',
            bgSky: '#101a3a', bgPage: '#101a3a', isNight: true, noClouds: true, noHills: true,
            obstacles: [
                { x: 650, dy: 210, w: 80, h: 70, type: 'meteor' },
                { x: 1400, dy: 70, w: 90, h: 70, type: 'asteroid' },
                { x: 2100, dy: 250, w: 70, h: 70, type: 'ufo', color: '#9bd3ff', vx: 2, minX: 1950, maxX: 2250 },
                { x: 2800, dy: 120, w: 56, h: 140, type: 'sat' },
                { x: 3500, dy: 300, w: 80, h: 70, type: 'meteor' },
                { x: 4200, dy: 90, w: 100, h: 70, type: 'asteroid' },
                { x: 4900, dy: 220, w: 70, h: 70, type: 'ufo', color: '#9bd3ff', vx: -2, minX: 4750, maxX: 5050 },
                { x: 5600, dy: 200, w: 130, h: 70, type: 'comet', vx: 2.5, minX: 5450, maxX: 5750 }
            ],
            coins: [
                { x: 350, dy: 150 }, { x: 550, dy: 260 }, { x: 950, dy: 200 }, { x: 1300, dy: 300 },
                { x: 1650, dy: 120 }, { x: 2250, dy: 220 }, { x: 2600, dy: 330 }, { x: 3050, dy: 200 },
                { x: 3600, dy: 140 }, { x: 4300, dy: 260 }, { x: 4700, dy: 320 }, { x: 5250, dy: 180 }, { x: 5700, dy: 300 }
            ],
            goalX: 6100, goalW: 240, goalDy: 70, goalH: 340
        },
        {
            name: 'Месечева стаза', collectible: '🌙', goal: 'finish', music: 'moon', decor: 'moon',
            bgSky: '#16214a', bgPage: '#16214a', isNight: true, noClouds: true, noHills: true,
            obstacles: [
                { x: 650, dy: 110, w: 90, h: 70, type: 'asteroid', color: '#8a94a8' },
                { x: 1300, dy: 300, w: 80, h: 70, type: 'meteor' },
                { x: 2000, dy: 70, w: 70, h: 50, type: 'alien' },
                { x: 2700, dy: 130, w: 56, h: 150, type: 'sat' },
                { x: 3400, dy: 240, w: 70, h: 70, type: 'ufo', color: '#b8c8ff', vx: 2, minX: 3250, maxX: 3550 },
                { x: 4100, dy: 80, w: 90, h: 70, type: 'asteroid', color: '#8a94a8' },
                { x: 4800, dy: 310, w: 80, h: 70, type: 'meteor' },
                { x: 5500, dy: 190, w: 130, h: 70, type: 'comet', vx: -2, minX: 5350, maxX: 5650 }
            ],
            coins: [
                { x: 330, dy: 200 }, { x: 590, dy: 300 }, { x: 1000, dy: 140 }, { x: 1450, dy: 250 },
                { x: 1850, dy: 330 }, { x: 2350, dy: 180 }, { x: 2850, dy: 280 }, { x: 3250, dy: 110 },
                { x: 3800, dy: 240 }, { x: 4250, dy: 320 }, { x: 4650, dy: 140 }, { x: 5150, dy: 260 }, { x: 5750, dy: 200 }
            ],
            goalX: 6150, goalW: 240, goalDy: 70, goalH: 340
        },
        {
            name: 'Црвена планета', collectible: '🔭', goal: 'finish', music: 'mars', decor: 'mars',
            bgSky: '#7a3b2a', bgPage: '#7a3b2a', isNight: false, noClouds: true, noHills: true,
            obstacles: [
                { x: 600, dy: 90, w: 90, h: 70, type: 'asteroid', color: '#b5534a' },
                { x: 1200, dy: 140, w: 70, h: 70, type: 'meteor', color: '#ff9a5a' },
                { x: 1800, dy: 300, w: 80, h: 70, type: 'ufo', color: '#d89080', vx: 2.5, minX: 1650, maxX: 1950 },
                { x: 2400, dy: 100, w: 90, h: 70, type: 'asteroid', color: '#b5534a' },
                { x: 3000, dy: 160, w: 130, h: 130, type: 'planet', color: '#c25a3f' },
                { x: 3600, dy: 70, w: 56, h: 150, type: 'sat', color: '#ffcf8a' },
                { x: 4200, dy: 110, w: 70, h: 70, type: 'meteor', color: '#ff9a5a' },
                { x: 4800, dy: 260, w: 70, h: 50, type: 'alien', color: '#7a8a5a' },
                { x: 5400, dy: 80, w: 90, h: 70, type: 'asteroid', color: '#b5534a' },
                { x: 6000, dy: 200, w: 130, h: 70, type: 'comet', color: '#ffcf8a', vx: 2, minX: 5850, maxX: 6150 }
            ],
            coins: [
                { x: 340, dy: 250 }, { x: 720, dy: 120 }, { x: 1050, dy: 300 }, { x: 1500, dy: 170 },
                { x: 1950, dy: 120 }, { x: 2600, dy: 280 }, { x: 3050, dy: 90 }, { x: 3450, dy: 320 },
                { x: 4000, dy: 180 }, { x: 4400, dy: 300 }, { x: 5000, dy: 130 }, { x: 5550, dy: 250 }, { x: 5900, dy: 330 }
            ],
            goalX: 6300, goalW: 240, goalDy: 70, goalH: 340
        },
        {
            name: 'Астероидни појас', collectible: '💫', goal: 'finish', music: 'belt', decor: 'belt',
            bgSky: '#101830', bgPage: '#101830', isNight: true, noClouds: true, noHills: true,
            obstacles: [
                { x: 650, dy: 80, w: 90, h: 70, type: 'asteroid' },
                { x: 1300, dy: 300, w: 70, h: 70, type: 'meteor' },
                { x: 2000, dy: 100, w: 90, h: 70, type: 'asteroid' },
                { x: 2700, dy: 260, w: 80, h: 70, type: 'hole' },
                { x: 3400, dy: 70, w: 90, h: 70, type: 'asteroid' },
                { x: 4100, dy: 320, w: 70, h: 70, type: 'meteor' },
                { x: 4800, dy: 110, w: 90, h: 70, type: 'asteroid' },
                { x: 5500, dy: 250, w: 80, h: 80, type: 'hole' },
                { x: 6100, dy: 80, w: 90, h: 70, type: 'asteroid' }
            ],
            coins: [
                { x: 360, dy: 200 }, { x: 700, dy: 310 }, { x: 1150, dy: 140 }, { x: 1600, dy: 260 },
                { x: 2150, dy: 300 }, { x: 2550, dy: 110 }, { x: 3050, dy: 250 }, { x: 3650, dy: 320 },
                { x: 4250, dy: 140 }, { x: 4650, dy: 270 }, { x: 5150, dy: 120 }, { x: 5750, dy: 230 }, { x: 6300, dy: 320 }
            ],
            goalX: 6650, goalW: 240, goalDy: 70, goalH: 340
        },
        {
            name: 'Сатурнови прстенови', collectible: '🪐', goal: 'finish', music: 'rings', decor: 'rings',
            bgSky: '#2a2450', bgPage: '#2a2450', isNight: true, noClouds: true, noHills: true,
            obstacles: [
                { x: 600, dy: 90, w: 130, h: 130, type: 'planet', color: '#d8a03f' },
                { x: 1200, dy: 280, w: 130, h: 50, type: 'ring' },
                { x: 2000, dy: 80, w: 90, h: 70, type: 'asteroid', color: '#b8b8c8' },
                { x: 2700, dy: 240, w: 70, h: 70, type: 'ufo', color: '#d0c0ff', vx: 2, minX: 2550, maxX: 2850 },
                { x: 3400, dy: 100, w: 130, h: 50, type: 'ring' },
                { x: 4100, dy: 300, w: 70, h: 70, type: 'meteor' },
                { x: 4900, dy: 200, w: 90, h: 70, type: 'asteroid', color: '#b8b8c8' },
                { x: 5600, dy: 90, w: 130, h: 50, type: 'ring' }
            ],
            coins: [
                { x: 350, dy: 230 }, { x: 650, dy: 320 }, { x: 1100, dy: 120 }, { x: 1550, dy: 260 },
                { x: 2100, dy: 300 }, { x: 2600, dy: 100 }, { x: 3000, dy: 250 }, { x: 3550, dy: 320 },
                { x: 4250, dy: 150 }, { x: 4650, dy: 280 }, { x: 5300, dy: 120 }, { x: 5850, dy: 250 }, { x: 6200, dy: 330 }
            ],
            goalX: 6500, goalW: 240, goalDy: 70, goalH: 340
        },
        {
            name: 'Јупитеров вихор', collectible: '🌀', goal: 'finish', music: 'giant', decor: 'giant',
            bgSky: '#2a2020', bgPage: '#2a2020', isNight: false, noClouds: true, noHills: true,
            obstacles: [
                { x: 600, dy: 240, w: 80, h: 80, type: 'hole' },
                { x: 1300, dy: 320, w: 90, h: 70, type: 'meteor', color: '#ffcf8a' },
                { x: 2000, dy: 80, w: 90, h: 70, type: 'asteroid', color: '#c0a080' },
                { x: 2700, dy: 260, w: 80, h: 80, type: 'hole' },
                { x: 3400, dy: 300, w: 70, h: 70, type: 'ufo', color: '#ffb890', vx: -2, minX: 3250, maxX: 3550 },
                { x: 4100, dy: 70, w: 90, h: 70, type: 'asteroid', color: '#c0a080' },
                { x: 4800, dy: 280, w: 130, h: 50, type: 'ring', color: '#d89080' },
                { x: 5500, dy: 220, w: 80, h: 80, type: 'hole' }
            ],
            coins: [
                { x: 340, dy: 190 }, { x: 620, dy: 300 }, { x: 1100, dy: 130 }, { x: 1600, dy: 250 },
                { x: 2150, dy: 300 }, { x: 2600, dy: 110 }, { x: 3050, dy: 240 }, { x: 3700, dy: 310 },
                { x: 4250, dy: 140 }, { x: 4650, dy: 260 }, { x: 5200, dy: 120 }, { x: 5750, dy: 230 }, { x: 6200, dy: 300 }
            ],
            goalX: 6500, goalW: 240, goalDy: 70, goalH: 340
        },
        {
            name: 'Ледени месец', collectible: '🧊', goal: 'finish', music: 'ice', decor: 'ice',
            bgSky: '#1a3a5a', bgPage: '#1a3a5a', isNight: true, noClouds: true, noHills: true,
            obstacles: [
                { x: 650, dy: 80, w: 90, h: 70, type: 'asteroid', color: '#bfe8ff' },
                { x: 1400, dy: 300, w: 100, h: 70, type: 'asteroid', color: '#dff0ff' },
                { x: 2100, dy: 100, w: 90, h: 70, type: 'asteroid', color: '#bfe8ff' },
                { x: 2800, dy: 260, w: 70, h: 50, type: 'alien', color: '#8ad8f0' },
                { x: 3500, dy: 80, w: 90, h: 70, type: 'asteroid', color: '#bfe8ff' },
                { x: 4200, dy: 320, w: 70, h: 70, type: 'ufo', color: '#bfe8ff', vx: 2, minX: 4050, maxX: 4350 },
                { x: 4900, dy: 110, w: 90, h: 70, type: 'asteroid', color: '#bfe8ff' },
                { x: 5600, dy: 250, w: 130, h: 50, type: 'ring', color: '#9fd4ff' }
            ],
            coins: [
                { x: 350, dy: 200 }, { x: 610, dy: 310 }, { x: 1050, dy: 140 }, { x: 1500, dy: 260 },
                { x: 2000, dy: 300 }, { x: 2450, dy: 110 }, { x: 2950, dy: 250 }, { x: 3650, dy: 320 },
                { x: 4250, dy: 150 }, { x: 4650, dy: 280 }, { x: 5250, dy: 120 }, { x: 5800, dy: 240 }, { x: 6300, dy: 320 }
            ],
            goalX: 6600, goalW: 240, goalDy: 70, goalH: 340
        },
        {
            name: 'Свемирска станица', collectible: '🛰️', goal: 'finish', music: 'station', decor: 'station',
            bgSky: '#2a3a5a', bgPage: '#2a3a5a', isNight: true, noClouds: true, noHills: true,
            obstacles: [
                { x: 600, dy: 260, w: 90, h: 70, type: 'sat', color: '#ffd0a0' },
                { x: 1300, dy: 320, w: 70, h: 70, type: 'ufo', color: '#c0d0ff' },
                { x: 2000, dy: 240, w: 80, h: 80, type: 'hole' },
                { x: 2700, dy: 300, w: 56, h: 150, type: 'sat', color: '#ffd0a0' },
                { x: 3400, dy: 280, w: 70, h: 70, type: 'meteor', color: '#ff9a5a' },
                { x: 4100, dy: 90, w: 90, h: 70, type: 'asteroid', color: '#b8c0d0' },
                { x: 4800, dy: 260, w: 70, h: 50, type: 'alien', color: '#9aff9a' },
                { x: 5500, dy: 310, w: 70, h: 70, type: 'ufo', color: '#c0d0ff', vx: -2, minX: 5350, maxX: 5650 }
            ],
            coins: [
                { x: 340, dy: 170 }, { x: 650, dy: 300 }, { x: 1150, dy: 120 }, { x: 1600, dy: 260 },
                { x: 2150, dy: 320 }, { x: 2650, dy: 110 }, { x: 3100, dy: 250 }, { x: 3750, dy: 310 },
                { x: 4300, dy: 150 }, { x: 4700, dy: 270 }, { x: 5250, dy: 130 }, { x: 5800, dy: 250 }, { x: 6300, dy: 320 }
            ],
            goalX: 6600, goalW: 240, goalDy: 70, goalH: 340
        },
        {
            name: 'Галаксија', collectible: '🌌', goal: 'finish', music: 'galaxy', decor: 'galaxy',
            bgSky: '#2a1a4a', bgPage: '#2a1a4a', isNight: true, noClouds: true, noHills: true,
            obstacles: [
                { x: 650, dy: 70, w: 90, h: 70, type: 'asteroid', color: '#c0a0e0' },
                { x: 1400, dy: 90, w: 70, h: 70, type: 'meteor', color: '#c880ff' },
                { x: 2100, dy: 300, w: 80, h: 80, type: 'hole' },
                { x: 2800, dy: 80, w: 130, h: 130, type: 'planet', color: '#8a5ab8' },
                { x: 3500, dy: 110, w: 90, h: 70, type: 'asteroid', color: '#c0a0e0' },
                { x: 4200, dy: 310, w: 70, h: 70, type: 'ufo', color: '#d0a0ff', vx: 2, minX: 4050, maxX: 4350 },
                { x: 4900, dy: 70, w: 70, h: 50, type: 'alien', color: '#8affb8' },
                { x: 5600, dy: 260, w: 80, h: 80, type: 'hole' }
            ],
            coins: [
                { x: 360, dy: 220 }, { x: 610, dy: 320 }, { x: 1050, dy: 130 }, { x: 1500, dy: 260 },
                { x: 2050, dy: 300 }, { x: 2500, dy: 110 }, { x: 3000, dy: 250 }, { x: 3650, dy: 320 },
                { x: 4250, dy: 140 }, { x: 4650, dy: 280 }, { x: 5200, dy: 120 }, { x: 5750, dy: 240 }, { x: 6300, dy: 330 }
            ],
            goalX: 6600, goalW: 240, goalDy: 70, goalH: 340
        },
        {
            name: 'Дубоки свемир', collectible: '🌠', goal: 'finish', music: 'deep', decor: 'deep',
            bgSky: '#0a0e24', bgPage: '#0a0e24', isNight: true, noClouds: true, noHills: true,
            obstacles: [
                { x: 650, dy: 220, w: 130, h: 70, type: 'comet', color: '#9fe0ff', vx: 2, minX: 500, maxX: 850 },
                { x: 1400, dy: 310, w: 80, h: 80, type: 'hole' },
                { x: 2100, dy: 80, w: 90, h: 70, type: 'asteroid', color: '#4a5a7a' },
                { x: 2800, dy: 240, w: 130, h: 70, type: 'comet', color: '#9fe0ff', vx: -2, minX: 2650, maxX: 2950 },
                { x: 3500, dy: 280, w: 70, h: 70, type: 'meteor', color: '#c880ff' },
                { x: 4200, dy: 320, w: 70, h: 50, type: 'alien', color: '#7ae0c0' },
                { x: 4900, dy: 200, w: 130, h: 70, type: 'comet', color: '#9fe0ff', vx: 2, minX: 4750, maxX: 5050 },
                { x: 5600, dy: 90, w: 90, h: 70, type: 'asteroid', color: '#4a5a7a' }
            ],
            coins: [
                { x: 350, dy: 160 }, { x: 650, dy: 300 }, { x: 1150, dy: 120 }, { x: 1600, dy: 250 },
                { x: 2150, dy: 300 }, { x: 2650, dy: 110 }, { x: 3150, dy: 250 }, { x: 3800, dy: 310 },
                { x: 4350, dy: 150 }, { x: 4750, dy: 280 }, { x: 5300, dy: 120 }, { x: 5850, dy: 240 }, { x: 6300, dy: 320 }
            ],
            goalX: 6600, goalW: 240, goalDy: 70, goalH: 340
        }
    ];

    // --- Cosmic scenery (drawn on top, semi-transparent) ---
    function spx(cameraX, spacing, factor, w) {
        const arr = [];
        const start = Math.floor((cameraX * factor - 100) / spacing);
        const end = Math.ceil((cameraX * factor + w + 100) / spacing);
        for (let i = start; i <= end; i++) arr.push(i * spacing - cameraX * factor);
        return arr;
    }

    function drawStarField(ctx, t, cameraX, w, h, colors, n) {
        const cols = colors || ['#ffffff', '#ffd0a0', '#a0d0ff', '#ffd23f'];
        for (let i = 0; i < n; i++) {
            const x = ((i * 293 + cameraX * (0.2 + (i % 3) * 0.2)) % (w + 20)) - 10;
            const y = ((i * 173 + t * (8 + (i % 4) * 6)) % (h + 20)) - 10;
            const tw = (Math.sin(t * 2 + i * 1.7) + 1) / 2;
            ctx.fillStyle = cols[i % cols.length];
            ctx.globalAlpha = 0.35 + tw * 0.65;
            const s = 1.5 + (i % 3);
            ctx.fillRect(x, y, s, s);
        }
        ctx.globalAlpha = 1;
    }

    function drawShootingStar(ctx, t, w, h) {
        const period = 9;
        const phase = (t % period) / period;
        const x = w * (0.9 - phase * 1.2);
        const y = h * (0.1 + phase * 0.5);
        if (phase < 0.12) {
            ctx.save();
            ctx.strokeStyle = 'rgba(255,255,255,0.9)';
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x - 70, y + 30);
            ctx.stroke();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    function drawBackdropPlanet(ctx, px, py, r, color, crater) {
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.beginPath(); ctx.arc(px, py, r + 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.22)';
        ctx.beginPath(); ctx.arc(px - r * 0.3, py - r * 0.3, r * 0.45, 0, Math.PI * 2); ctx.fill();
        if (crater) {
            ctx.fillStyle = 'rgba(0,0,0,0.18)';
            ctx.beginPath(); ctx.arc(px + r * 0.2, py + r * 0.25, r * 0.2, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(px - r * 0.45, py + r * 0.4, r * 0.13, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
    }

    function drawStars(ctx, t, cameraX, w, h) {
        drawStarField(ctx, t, cameraX, w, h, null, 90);
        const moons = spx(cameraX, 1100, 0.12, w);
        for (let i = 0; i < moons.length; i++) {
            drawBackdropPlanet(ctx, moons[i] + 120, 90, 42, i % 2 ? '#c0a060' : '#80a0c0', true);
        }
        drawShootingStar(ctx, t, w, h);
    }

    function drawMoon(ctx, t, cameraX, w, h) {
        drawStarField(ctx, t, cameraX, w, h, null, 60);
        const moons = spx(cameraX, 900, 0.15, w);
        for (let i = 0; i < moons.length; i++) {
            drawBackdropPlanet(ctx, moons[i] + 80, 100, 60, '#e8e8f0', true);
        }
        drawBackdropPlanet(ctx, w * 0.82, 90, 70, '#d8d8e8', true);
        drawShootingStar(ctx, t, w, h);
    }

    function drawMars(ctx, t, cameraX, w, h) {
        drawStarField(ctx, t, cameraX, w, h, ['#ffd0a0', '#ffffff', '#a0d0ff'], 40);
        ctx.fillStyle = '#c25a3f';
        const dunes = spx(cameraX, 220, 0.5, w);
        for (let i = 0; i < dunes.length; i++) {
            ctx.beginPath();
            ctx.ellipse(dunes[i], h - 20, 70, 18, 0, Math.PI, Math.PI * 2);
            ctx.fill();
        }
        const dust = spx(cameraX, 500, 0.3, w);
        for (let i = 0; i < dust.length; i++) {
            ctx.fillStyle = 'rgba(255,170,120,0.4)';
            ctx.fillRect(dust[i], 40 + ((i * 53) % (h - 120)), 5, 5);
        }
        drawBackdropPlanet(ctx, w * 0.85, 80, 40, '#ffd09a', true);
    }

    function drawBelt(ctx, t, cameraX, w, h) {
        drawStarField(ctx, t, cameraX, w, h, null, 70);
        const rocks = spx(cameraX, 130, 0.55, w);
        for (let i = 0; i < rocks.length; i++) {
            ctx.save();
            ctx.translate(rocks[i], 60 + ((i * 61) % (h - 140)));
            ctx.rotate(i * 0.8);
            ctx.fillStyle = 'rgba(160,170,190,0.8)';
            ctx.beginPath();
            ctx.arc(0, 0, 8 + (i % 3) * 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,0.35)';
            ctx.beginPath();
            ctx.arc(-2, -2, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    function drawRings(ctx, t, cameraX, w, h) {
        drawStarField(ctx, t, cameraX, w, h, null, 55);
        const big = spx(cameraX, 1300, 0.1, w);
        for (let i = 0; i < big.length; i++) {
            const px = big[i] + 200;
            const py = 150;
            drawBackdropPlanet(ctx, px, py, 90, '#e0a848', false);
            ctx.save();
            ctx.strokeStyle = i % 2 ? 'rgba(240,220,160,0.75)' : 'rgba(200,180,120,0.6)';
            ctx.lineWidth = 16;
            ctx.beginPath();
            ctx.ellipse(px, py, 190, 42, -0.25, 0, Math.PI * 2);
            ctx.stroke();
            ctx.strokeStyle = 'rgba(255,240,200,0.4)';
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.ellipse(px, py, 150, 32, -0.25, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
        drawShootingStar(ctx, t, w, h);
    }

    function drawGiant(ctx, t, cameraX, w, h) {
        drawStarField(ctx, t, cameraX, w, h, null, 45);
        const giants = spx(cameraX, 1500, 0.1, w);
        for (let i = 0; i < giants.length; i++) {
            const px = giants[i] + 200;
            const py = 190;
            ctx.save();
            ctx.fillStyle = '#d8905a';
            ctx.beginPath(); ctx.arc(px, py, 140, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#e8a878';
            ctx.beginPath(); ctx.arc(px, py, 140, Math.PI, 0); ctx.fill();
            ctx.fillStyle = '#c07848';
            for (let b = -2; b <= 2; b++) {
                ctx.beginPath();
                ctx.ellipse(px, py + b * 26, 140, 12, 0, 0, Math.PI * 2);
                ctx.fill();
            }
            const ex = px + Math.sin(t * 0.7) * 30;
            ctx.fillStyle = '#e87858';
            ctx.beginPath(); ctx.ellipse(ex, py + 40, 30, 16, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#f0a888';
            ctx.beginPath(); ctx.ellipse(ex, py + 36, 18, 9, 0, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
        }
    }

    function drawIce(ctx, t, cameraX, w, h) {
        drawStarField(ctx, t, cameraX, w, h, ['#ffffff', '#bfe8ff', '#dff0ff'], 70);
        const crystals = spx(cameraX, 240, 0.45, w);
        for (let i = 0; i < crystals.length; i++) {
            const x = crystals[i];
            const cy = h - 22;
            const s = 12 + (i % 3) * 8;
            ctx.strokeStyle = 'rgba(190,235,255,0.8)';
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(x, cy);
            ctx.lineTo(x, cy - s * 2);
            ctx.moveTo(x - s * 0.5, cy - s * 0.8);
            ctx.lineTo(x + s * 0.5, cy - s * 0.8);
            ctx.moveTo(x - s * 0.3, cy - s * 1.3);
            ctx.lineTo(x + s * 0.3, cy - s * 1.3);
            ctx.stroke();
        }
        drawBackdropPlanet(ctx, w * 0.78, 100, 56, '#dfeefc', true);
    }

    function drawStation(ctx, t, cameraX, w, h) {
        drawStarField(ctx, t, cameraX, w, h, null, 70);
        const sts = spx(cameraX, 900, 0.18, w);
        for (let i = 0; i < sts.length; i++) {
            const x = sts[i];
            const y = 90 + (i % 2) * 50;
            ctx.fillStyle = 'rgba(180,190,210,0.85)';
            ctx.fillRect(x - 70, y - 18, 140, 36);
            ctx.fillRect(x - 60, y + 12, 28, 40);
            ctx.fillRect(x + 32, y + 12, 28, 40);
            ctx.fillStyle = 'rgba(120,130,160,0.9)';
            ctx.fillRect(x - 4, y - 28, 8, 14);
            ctx.fillStyle = 'rgba(255,210,80,0.9)';
            for (let wy = y - 8; wy < y + 14; wy += 10) {
                ctx.fillRect(x - 64, wy, 8, 5);
                ctx.fillRect(x + 56, wy, 8, 5);
            }
            ctx.fillStyle = 'rgba(160,235,255,0.9)';
            ctx.fillRect(x - 60, y - 10, 120, 20);
        }
    }

    function drawGalaxy(ctx, t, cameraX, w, h) {
        ctx.save();
        const clouds = spx(cameraX, 500, 0.2, w);
        for (let i = 0; i < clouds.length; i++) {
            ctx.fillStyle = ['rgba(160,80,220,0.14)', 'rgba(60,120,255,0.14)', 'rgba(240,120,200,0.12)'][i % 3];
            ctx.beginPath();
            ctx.ellipse(clouds[i] + 120, 60 + (i % 2) * 140, 230, 80, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
        drawStarField(ctx, t, cameraX, w, h, ['#ffffff', '#ffd23f', '#a0d0ff', '#ff9ae0'], 110);
        const sw = spx(cameraX, 1600, 0.08, w);
        for (let i = 0; i < sw.length; i++) {
            const px = sw[i] + 150;
            const py = 120 + (i % 2) * 60;
            ctx.save();
            ctx.translate(px, py);
            ctx.rotate(-0.5);
            ctx.strokeStyle = 'rgba(220,190,255,0.55)';
            ctx.lineWidth = 7;
            ctx.beginPath();
            for (let a = 0; a < Math.PI * 2; a += 0.05) {
                const r = 34 + a * 12;
                const xx = Math.cos(a) * r * 2.4;
                const yy = Math.sin(a) * r * 0.7;
                if (a === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
            }
            ctx.stroke();
            ctx.restore();
        }
    }

    function drawDeep(ctx, t, cameraX, w, h) {
        ctx.save();
        ctx.fillStyle = 'rgba(120,60,200,0.10)';
        ctx.beginPath(); ctx.ellipse(w * 0.3, h * 0.3, 260, 90, 0.4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(40,120,255,0.10)';
        ctx.beginPath(); ctx.ellipse(w * 0.75, h * 0.65, 240, 80, -0.3, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        drawStarField(ctx, t, cameraX, w, h, null, 130);
        const far = spx(cameraX, 700, 0.25, w);
        for (let i = 0; i < far.length; i++) {
            drawBackdropPlanet(ctx, far[i] + 100, 60 + (i % 2) * 130, 26 + (i % 3) * 14, ['#c0a0e0', '#80b0ff', '#ffb080'][i % 3], i % 2 === 0);
        }
        drawShootingStar(ctx, t, w, h);
    }

    function drawDecor(ctx, t, cameraX, canvas, theme) {
        const w = canvas.width, h = canvas.height;
        ctx.save();
        switch (theme.decor) {
            case 'stars': drawStars(ctx, t, cameraX, w, h); break;
            case 'moon': drawMoon(ctx, t, cameraX, w, h); break;
            case 'mars': drawMars(ctx, t, cameraX, w, h); break;
            case 'belt': drawBelt(ctx, t, cameraX, w, h); break;
            case 'rings': drawRings(ctx, t, cameraX, w, h); break;
            case 'giant': drawGiant(ctx, t, cameraX, w, h); break;
            case 'ice': drawIce(ctx, t, cameraX, w, h); break;
            case 'station': drawStation(ctx, t, cameraX, w, h); break;
            case 'galaxy': drawGalaxy(ctx, t, cameraX, w, h); break;
            case 'deep': drawDeep(ctx, t, cameraX, w, h); break;
        }
        ctx.restore();
    }

    // --- Space obstacles (meteors/asteroids/UFOs/etc.) ---
    function drawObstacle(ctx, o, theme) {
        switch (o.type) {
            case 'meteor': drawMeteor(ctx, o); break;
            case 'asteroid': drawAsteroid(ctx, o); break;
            case 'ufo': drawUfo(ctx, o); break;
            case 'comet': drawComet(ctx, o); break;
            case 'ring': drawSpaceRing(ctx, o); break;
            case 'planet': drawSpacePlanet(ctx, o); break;
            case 'sat': drawSatellite(ctx, o); break;
            case 'hole': drawBlackHole(ctx, o); break;
            case 'alien': drawAlien(ctx, o); break;
            default: drawAsteroid(ctx, o);
        }
    }

    function drawMeteor(ctx, o) {
        const x = o.x, y = o.y, w = o.width, h = o.height;
        const cx = x + w / 2, cy = y + h / 2;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.fillStyle = 'rgba(255,120,40,0.4)';
        ctx.beginPath();
        ctx.moveTo(-w * 0.42, 0);
        ctx.quadraticCurveTo(-w * 0.6, -h * 0.22, -w * 0.75, -h * 0.12);
        ctx.quadraticCurveTo(-w * 0.68, -h * 0.3, -w * 0.85, -h * 0.2);
        ctx.quadraticCurveTo(-w * 0.75, -h * 0.38, -w * 0.95, -h * 0.28);
        ctx.quadraticCurveTo(-w * 0.72, -h * 0.44, -w * 0.9, -h * 0.42);
        ctx.quadraticCurveTo(-w * 0.6, -h * 0.5, -w * 0.4, -h * 0.05);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath(); ctx.ellipse(cx, cy + h * 0.5, w * 0.42, 5, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = o.color || '#9a6a5a';
        ctx.beginPath();
        ctx.moveTo(cx - w * 0.38, cy + h * 0.3);
        ctx.quadraticCurveTo(cx - w * 0.42, cy - h * 0.3, cx + w * 0.05, cy - h * 0.42);
        ctx.quadraticCurveTo(cx + w * 0.4, cy - h * 0.32, cx + w * 0.42, cy + h * 0.02);
        ctx.quadraticCurveTo(cx + w * 0.36, cy + h * 0.34, cx - w * 0.1, cy + h * 0.42);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.beginPath(); ctx.ellipse(cx - w * 0.05, cy - h * 0.12, w * 0.18, h * 0.12, -0.3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,180,80,0.9)';
        ctx.beginPath(); ctx.arc(cx + w * 0.12, cy + h * 0.1, w * 0.09, 0, Math.PI * 2); ctx.fill();
    }

    function drawAsteroid(ctx, o) {
        const x = o.x, y = o.y, w = o.width, h = o.height;
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath(); ctx.ellipse(x + w / 2, y + h + 4, w * 0.5, 6, 0, 0, Math.PI * 2); ctx.fill();
        const c = o.color || '#7a8290';
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.moveTo(x + 4, y + h - 4);
        ctx.quadraticCurveTo(x - 2, y + h * 0.55, x + w * 0.28, y + 8);
        ctx.quadraticCurveTo(x + w * 0.6, y - 4, x + w - 4, y + h * 0.42);
        ctx.quadraticCurveTo(x + w, y + h, x + 4, y + h - 4);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath(); ctx.ellipse(x + w * 0.3, y + h * 0.28, w * 0.16, h * 0.1, -0.4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(0,0,0,0.22)';
        ctx.beginPath(); ctx.ellipse(x + w * 0.68, y + h * 0.6, w * 0.12, h * 0.09, 0.3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(x + w * 0.2, y + h * 0.7, w * 0.08, h * 0.06, 0.2, 0, Math.PI * 2); ctx.fill();
    }

    function drawUfo(ctx, o) {
        const x = o.x, y = o.y, w = o.width, h = o.height;
        const flip = o.vx < 0;
        ctx.save();
        ctx.translate(x + w / 2, y + h / 2);
        if (flip) ctx.scale(-1, 1);
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath(); ctx.ellipse(0, h * 0.5, w * 0.42, 5, 0, 0, Math.PI * 2); ctx.fill();
        const c = o.color || '#9bd3ff';
        ctx.fillStyle = '#c0d8e8';
        ctx.beginPath(); ctx.ellipse(0, -h * 0.02, w * 0.42, h * 0.2, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = c;
        ctx.beginPath(); ctx.ellipse(0, 0, w * 0.5, h * 0.24, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#dff0ff';
        ctx.beginPath(); ctx.ellipse(0, -h * 0.28, w * 0.18, h * 0.22, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#b8d8e8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-w * 0.24, -h * 0.02);
        ctx.lineTo(w * 0.24, -h * 0.02);
        ctx.stroke();
        ctx.fillStyle = '#ffd23f';
        for (let i = -2; i <= 2; i++) {
            ctx.beginPath();
            ctx.arc(i * w * 0.16, h * 0.02, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    function drawComet(ctx, o) {
        const x = o.x, y = o.y, w = o.width, h = o.height;
        const flip = o.vx < 0;
        const cx = x + w / 2, cy = y + h / 2;
        ctx.save();
        ctx.translate(cx, cy);
        if (flip) ctx.scale(-1, 1);
        const c = o.color || '#9fe0ff';
        ctx.strokeStyle = c;
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-w * 0.36, 0);
        ctx.quadraticCurveTo(-w * 0.55, h * 0.14, -w * 0.68, 0);
        ctx.quadraticCurveTo(-w * 0.55, -h * 0.14, -w * 0.36, 0);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-w * 0.3, 0);
        ctx.quadraticCurveTo(-w * 0.62, h * 0.22, -w * 0.9, h * 0.06);
        ctx.stroke();
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.arc(0, 0, w * 0.16, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-w * 0.05, -h * 0.05, w * 0.07, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    function drawSpaceRing(ctx, o) {
        const x = o.x, y = o.y, w = o.width, h = o.height;
        const c = o.color || '#d8c890';
        ctx.save();
        ctx.strokeStyle = c;
        ctx.lineWidth = Math.max(8, h * 0.35);
        ctx.beginPath();
        ctx.ellipse(x + w / 2, y + h / 2, w * 0.44, h * 0.5, -0.2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = Math.max(3, h * 0.1);
        ctx.beginPath();
        ctx.ellipse(x + w / 2, y + h / 2, w * 0.4, h * 0.46, -0.2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    function drawSpacePlanet(ctx, o) {
        const x = o.x, y = o.y, w = o.width, h = o.height;
        const cx = x + w / 2, cy = y + h / 2, r = Math.min(w, h) * 0.44;
        const c = o.color || '#d8a03f';
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.beginPath(); ctx.arc(cx, cy + r * 0.9, r * 0.9, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = c;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.beginPath(); ctx.arc(cx - r * 0.3, cy - r * 0.3, r * 0.5, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.18)';
        ctx.lineWidth = 2;
        for (let b = -2; b <= 2; b++) {
            ctx.beginPath();
            ctx.ellipse(cx, cy + b * r * 0.28, r * 0.9, r * 0.12, 0, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.restore();
    }

    function drawSatellite(ctx, o) {
        const x = o.x, y = o.y, w = o.width, h = o.height;
        const cx = x + w / 2, cy = y + h / 2;
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.beginPath(); ctx.ellipse(cx, y + h + 3, w * 0.4, 5, 0, 0, Math.PI * 2); ctx.fill();
        const c = o.color || '#9fb4c8';
        ctx.fillStyle = c;
        ctx.fillRect(cx - w * 0.12, cy - h * 0.24, w * 0.24, h * 0.48);
        ctx.fillStyle = '#2b3a52';
        ctx.fillRect(cx - w * 0.06, cy - h * 0.4, w * 0.12, h * 0.22);
        ctx.fillRect(cx - w * 0.02, cy - h * 0.34, w * 0.04, h * 0.5);
        ctx.fillStyle = 'rgba(80,120,180,0.9)';
        ctx.fillRect(cx - w * 0.4, cy - h * 0.1, w * 0.28, h * 0.2);
        ctx.fillRect(cx + w * 0.12, cy - h * 0.1, w * 0.28, h * 0.2);
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fillRect(cx - w * 0.4, cy - h * 0.1, w * 0.28, h * 0.05);
        ctx.fillRect(cx + w * 0.12, cy - h * 0.1, w * 0.28, h * 0.05);
        ctx.fillStyle = 'rgba(255,210,80,0.95)';
        ctx.beginPath(); ctx.arc(cx, cy - h * 0.3, 4, 0, Math.PI * 2); ctx.fill();
    }

    function drawBlackHole(ctx, o) {
        const x = o.x, y = o.y, w = o.width, h = o.height;
        const cx = x + w / 2, cy = y + h / 2;
        const t = Date.now() / 1000;
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.beginPath(); ctx.ellipse(cx, cy + h * 0.55, w * 0.5, 6, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#ffb84d';
        ctx.lineWidth = 6;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.ellipse(cx, cy, w * (0.3 + i * 0.12), h * (0.3 + i * 0.12), t * 0.6 + i, 0, Math.PI * 1.5);
            ctx.stroke();
        }
        ctx.fillStyle = '#0a0a14';
        ctx.beginPath(); ctx.arc(cx, cy, w * 0.26, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,184,77,0.9)';
        ctx.beginPath(); ctx.arc(cx, cy, w * 0.1, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }

    function drawAlien(ctx, o) {
        const x = o.x, y = o.y, w = o.width, h = o.height;
        const flip = o.vx < 0;
        const c = o.color || '#7aff9a';
        ctx.save();
        ctx.translate(x + w / 2, y + h / 2);
        if (flip) ctx.scale(-1, 1);
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath(); ctx.ellipse(0, h * 0.5, w * 0.3, 4, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = c;
        ctx.beginPath(); ctx.ellipse(0, 0, w * 0.34, h * 0.4, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#1b2430';
        ctx.beginPath();
        ctx.ellipse(-w * 0.12, -h * 0.02, w * 0.12, h * 0.16, 0, 0, Math.PI * 2);
        ctx.ellipse(w * 0.12, -h * 0.02, w * 0.12, h * 0.16, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-w * 0.12, -h * 0.02, w * 0.05, 0, Math.PI * 2);
        ctx.arc(w * 0.12, -h * 0.02, w * 0.05, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = c;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, -h * 0.42);
        ctx.lineTo(0, -h * 0.52);
        ctx.moveTo(-w * 0.08, -h * 0.5);
        ctx.lineTo(w * 0.08, -h * 0.5);
        ctx.stroke();
        ctx.fillStyle = '#ffd23f';
        ctx.beginPath(); ctx.arc(0, -h * 0.56, 4, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }

    // Space station / portal finish arch: two pylons + glowing portal + ЦИЉ banner.
    function drawSpaceGoal(ctx, themeGoal, goal) {
        const gx = goal.x, gy = goal.y, gw = goal.width, gh = goal.height;
        const pw = 26;
        ctx.fillStyle = '#2b3a52';
        ctx.fillRect(gx, gy, pw, gh);
        ctx.fillRect(gx + gw - pw, gy, pw, gh);
        ctx.fillStyle = 'rgba(120,180,255,0.35)';
        ctx.beginPath();
        ctx.arc(gx + gw / 2, gy + 46, gw / 2 - 4, Math.PI, 0);
        ctx.fill();
        ctx.strokeStyle = 'rgba(140,200,255,0.6)';
        ctx.lineWidth = 5;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.ellipse(gx + gw / 2, gy + 40 + i * 44, gw / 2 - 8 + i * 6, 90 + i * 26, 0, 0, Math.PI * 2);
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

    window.startSpace = function () {
        if (window.__adv) return;
        AdventureEngine.create({
            id: 'space',
            mode: 'fly',
            hero: '🚀',
            heroFontSize: 84,
            heroW: 110,
            heroH: 100,
            heroBob: 4,
            offsetStartRatio: 0.16,
            speed: 4.5,
            obstacleScale: 1.15,
            pickupFontSize: 58,
            levels: LEVELS,
            music: MUSIC,
            drawObstacle: drawObstacle,
            drawDecor: drawDecor,
            drawGoal: drawSpaceGoal
        });
    };
})();
