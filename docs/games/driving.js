/* Возила (Driving) — Phase 4 adventure game on the shared adventure engine.
   The car rolls forward automatically; the child steers up/down/left/right to
   dodge vehicles and road works, collecting the world's collectible emoji and
   reaching the ЦИЉ finish gate. 10 themed road worlds, each with its own
   procedural music theme + ambient layer. */
(function () {
    'use strict';

    const MUSIC = {
        city: {
            root: 523.25, bpm: 92, wave: 'sine', vol: 0.09,
            bass: [-12, -12, -12, -12, -12, -12, -12, -12, -5, -5, -5, -5, -12, -12, -12, -12],
            seq: [0, 4, 7, 9, 7, 4, 2, 4, 0, 4, 7, 12, 9, 7, 4, 2, 7, 9, 12, 14, 12, 9, 7, 4, 2, 4, 7, 9, 4, 2, 0, null],
            ambient: { sound: 'horn', rate: 0.03, vol: 0.04 }
        },
        field: {
            root: 587.33, bpm: 96, wave: 'triangle', vol: 0.09,
            bass: [-12, -12, -12, -12, -7, -7, -7, -7, -12, -12, -12, -12, -7, -7, -7, -7],
            seq: [0, 4, 7, 9, 12, 9, 7, 4, 0, 4, 7, 9, 7, 4, 2, 4, 9, 12, 14, 16, 14, 12, 9, 7, 4, 7, 9, 12, 9, 7, 4, 2],
            ambient: { sound: 'cricket', rate: 0.06, vol: 0.03 }
        },
        forest: {
            root: 440.00, bpm: 84, wave: 'sine', vol: 0.10,
            bass: [-12, -12, -12, -12, -16, -16, -16, -16, -14, -14, -14, -14, -16, -16, -16, -16],
            seq: [0, 2, 3, 5, 7, 5, 3, 2, 0, null, 3, 5, 7, 8, 7, 5, 3, 5, 7, 8, 10, 8, 7, 5, 3, 2, 3, 5, 2, null, 0, null],
            ambient: { sound: 'bird', rate: 0.05, vol: 0.045 }
        },
        winter: {
            root: 523.25, bpm: 84, wave: 'triangle', vol: 0.08,
            bass: [-12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12],
            seq: [12, 16, 19, 16, 12, 16, 19, 21, 16, 19, 21, 24, 19, 16, 12, 16, 19, 21, 24, 28, 24, 21, 19, 16, 12, 16, 19, 21, 19, 16, 14, 16],
            ambient: { sound: 'wind', rate: 0.06, vol: 0.035 }
        },
        mountain: {
            root: 349.23, bpm: 72, wave: 'sine', vol: 0.10,
            bass: [-12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -5, -5, -5, -5],
            seq: [0, 3, 5, 7, 5, 3, 0, null, 0, 3, 5, 3, 7, 5, 3, 0, 0, 3, 5, 7, 10, 7, 5, 3, 5, 3, 0, null, 3, 0, null, null],
            ambient: { sound: 'rumble', rate: 0.04, vol: 0.04 }
        },
        night: {
            root: 293.66, bpm: 66, wave: 'sine', vol: 0.10,
            bass: [-12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -7, -7, -7, -7],
            seq: [0, 3, 7, 8, 7, 3, 0, null, 0, 3, 7, 12, 8, 7, 3, 0, 3, 7, 8, 7, 3, 0, null, 3, 0, 3, 7, 8, 12, 8, 7, 3],
            ambient: { sound: 'coo', rate: 0.06, vol: 0.05 }
        },
        desert: {
            root: 329.63, bpm: 78, wave: 'sine', vol: 0.10,
            bass: [-12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -17, -17, -17, -17],
            seq: [0, 1, 4, 5, 7, 5, 4, 1, 0, 4, 5, 7, 8, 7, 5, 4, 0, 1, 4, 7, 8, 10, 8, 7, 5, 4, 1, 0, 4, 1, 0, null],
            ambient: { sound: 'desert', rate: 0.06, vol: 0.05 }
        },
        island: {
            root: 587.33, bpm: 90, wave: 'triangle', vol: 0.09,
            bass: [-12, -12, -12, -12, -5, -5, -5, -5, -12, -12, -12, -12, -5, -5, -5, -5],
            seq: [0, 4, 7, 9, 12, 9, 7, 4, 0, 4, 7, 12, 14, 12, 9, 7, 4, 7, 9, 14, 12, 9, 7, 4, 0, 4, 7, 9, 12, 9, 7, 4],
            ambient: { sound: 'waves', rate: 0.08, vol: 0.045 }
        },
        coast: {
            root: 523.25, bpm: 88, wave: 'sine', vol: 0.09,
            bass: [-12, -12, -12, -12, -12, -12, -12, -12, -5, -5, -5, -5, -12, -12, -12, -12],
            seq: [0, 4, 7, 9, 7, 4, 2, 4, 0, 4, 7, 12, 9, 7, 4, 2, 7, 9, 12, 14, 12, 9, 7, 4, 2, 4, 7, 9, 4, 2, 0, null],
            ambient: { sound: 'waves', rate: 0.09, vol: 0.05 }
        },
        cosmic: {
            root: 659.25, bpm: 76, wave: 'triangle', vol: 0.07,
            bass: [-12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12],
            seq: [12, 16, 19, 16, 12, 16, 19, 21, 16, 19, 21, 24, 21, 19, 16, 12, 19, 16, 12, 16, 19, 21, 19, 16, 12, 16, 19, 24, 21, 19, 16, 19],
            ambient: { sound: 'bell', rate: 0.07, vol: 0.04 }
        }
    };

    // dy = height of the obstacle's bottom above the canvas bottom edge.
    // low obstacles (40-80) block the lower road, high ones (150-230) the upper road.
    const LEVELS = [
        {
            name: 'Градски трг', collectible: '⭐', goal: 'finish', music: 'city',
            bgSky: '#8fd3ff', bgPage: '#8fd3ff', roadColor: '#6f6f6f', grassColor: '#67c971',
            hillColor: '#5aa76a', isNight: false, decor: 'city', noClouds: true, noHills: true,
            obstacles: [
                { x: 700, dy: 80, w: 44, h: 40, type: 'cone' },
                { x: 1400, dy: 60, w: 52, h: 42, type: 'car', color: '#ff6f91' },
                { x: 2200, dy: 190, w: 60, h: 34, type: 'barrier' },
                { x: 3000, dy: 70, w: 44, h: 40, type: 'cone' },
                { x: 3800, dy: 55, w: 52, h: 42, type: 'car', color: '#4fc3f7' },
                { x: 4600, dy: 170, w: 60, h: 34, type: 'barrier' },
                { x: 5300, dy: 60, w: 60, h: 50, type: 'truck', color: '#fbd000' }
            ],
            coins: [
                { x: 350, dy: 150 }, { x: 520, dy: 220 }, { x: 900, dy: 200 }, { x: 1250, dy: 180 },
                { x: 1550, dy: 240 }, { x: 2050, dy: 220 }, { x: 2350, dy: 280 }, { x: 2900, dy: 200 },
                { x: 3200, dy: 260 }, { x: 3950, dy: 240 }, { x: 4450, dy: 190 }, { x: 5050, dy: 230 }, { x: 5450, dy: 150 }
            ],
            goalX: 5800
        },
        {
            name: 'Поље сунцокрета', collectible: '🍭', goal: 'finish', music: 'field',
            bgSky: '#ffe066', bgPage: '#ffe066', roadColor: '#b0965a', grassColor: '#7bc74f',
            hillColor: '#a0c860', isNight: false, decor: null, noClouds: false,
            obstacles: [
                { x: 800, dy: 60, w: 60, h: 34, type: 'barrier' },
                { x: 1600, dy: 100, w: 44, h: 40, type: 'cone' },
                { x: 2500, dy: 200, w: 60, h: 50, type: 'truck', color: '#e88b62' },
                { x: 3300, dy: 55, w: 52, h: 42, type: 'car', color: '#67c971' },
                { x: 4100, dy: 90, w: 44, h: 40, type: 'cone' },
                { x: 4900, dy: 180, w: 60, h: 34, type: 'barrier' },
                { x: 5500, dy: 60, w: 52, h: 42, type: 'car', color: '#a070ff' }
            ],
            coins: [
                { x: 380, dy: 160 }, { x: 620, dy: 240 }, { x: 1050, dy: 200 }, { x: 1450, dy: 180 },
                { x: 1750, dy: 250 }, { x: 2350, dy: 220 }, { x: 2680, dy: 290 }, { x: 3150, dy: 200 },
                { x: 3450, dy: 260 }, { x: 4250, dy: 240 }, { x: 4750, dy: 190 }, { x: 5250, dy: 230 }, { x: 5650, dy: 160 }
            ],
            goalX: 6000
        },
        {
            name: 'Јесења шума', collectible: '🍂', goal: 'finish', music: 'forest',
            bgSky: '#f0a860', bgPage: '#f0a860', roadColor: '#a08050', grassColor: '#b08838',
            hillColor: '#c88040', isNight: false, decor: 'leaves', noClouds: false,
            obstacles: [
                { x: 600, dy: 70, w: 44, h: 40, type: 'cone' },
                { x: 1500, dy: 190, w: 52, h: 42, type: 'car', color: '#cc5500' },
                { x: 2400, dy: 55, w: 60, h: 34, type: 'barrier' },
                { x: 3100, dy: 110, w: 60, h: 50, type: 'truck', color: '#7b4b3a' },
                { x: 3900, dy: 200, w: 44, h: 40, type: 'cone' },
                { x: 4700, dy: 60, w: 52, h: 42, type: 'car', color: '#e88b62' },
                { x: 5500, dy: 90, w: 60, h: 34, type: 'barrier' }
            ],
            coins: [
                { x: 330, dy: 150 }, { x: 560, dy: 220 }, { x: 950, dy: 190 }, { x: 1350, dy: 230 },
                { x: 1700, dy: 270 }, { x: 2250, dy: 210 }, { x: 2600, dy: 280 }, { x: 3250, dy: 200 },
                { x: 3550, dy: 250 }, { x: 4100, dy: 220 }, { x: 4550, dy: 190 }, { x: 5050, dy: 230 }, { x: 5650, dy: 160 }
            ],
            goalX: 6000
        },
        {
            name: 'Зимски пут', collectible: '⛄', goal: 'finish', music: 'winter',
            bgSky: '#cfe8ff', bgPage: '#cfe8ff', roadColor: '#e8f0f8', grassColor: '#dbe7f0',
            hillColor: '#b8d0e8', isNight: false, decor: 'snow', noClouds: false,
            obstacles: [
                { x: 700, dy: 55, w: 52, h: 42, type: 'car', color: '#e52521' },
                { x: 1600, dy: 180, w: 60, h: 34, type: 'barrier' },
                { x: 2500, dy: 70, w: 44, h: 40, type: 'cone' },
                { x: 3300, dy: 60, w: 60, h: 50, type: 'truck', color: '#4fc3f7' },
                { x: 4100, dy: 200, w: 52, h: 42, type: 'car', color: '#a070ff' },
                { x: 4800, dy: 85, w: 44, h: 40, type: 'cone' },
                { x: 5500, dy: 60, w: 60, h: 34, type: 'barrier' }
            ],
            coins: [
                { x: 360, dy: 160 }, { x: 600, dy: 240 }, { x: 1000, dy: 200 }, { x: 1450, dy: 180 },
                { x: 1800, dy: 260 }, { x: 2350, dy: 220 }, { x: 2700, dy: 290 }, { x: 3450, dy: 200 },
                { x: 3750, dy: 250 }, { x: 4300, dy: 230 }, { x: 4650, dy: 190 }, { x: 5150, dy: 240 }, { x: 5650, dy: 160 }
            ],
            goalX: 6000
        },
        {
            name: 'Планински пут', collectible: '🎿', goal: 'finish', music: 'mountain',
            bgSky: '#bfd8ff', bgPage: '#bfd8ff', roadColor: '#8a8a8a', grassColor: '#9aa88a',
            hillColor: '#8a98a8', isNight: false, decor: null, noClouds: true,
            obstacles: [
                { x: 700, dy: 200, w: 60, h: 34, type: 'barrier' },
                { x: 1400, dy: 60, w: 52, h: 42, type: 'car', color: '#ff6f91' },
                { x: 2100, dy: 90, w: 60, h: 34, type: 'rock' },
                { x: 2900, dy: 210, w: 44, h: 40, type: 'cone' },
                { x: 3700, dy: 55, w: 60, h: 50, type: 'truck', color: '#67c971' },
                { x: 4500, dy: 190, w: 52, h: 42, type: 'car', color: '#fbd000' },
                { x: 5300, dy: 70, w: 60, h: 34, type: 'barrier' },
                { x: 5800, dy: 110, w: 44, h: 40, type: 'cone' }
            ],
            coins: [
                { x: 350, dy: 160 }, { x: 600, dy: 240 }, { x: 950, dy: 200 }, { x: 1300, dy: 180 },
                { x: 1700, dy: 260 }, { x: 2250, dy: 220 }, { x: 2600, dy: 290 }, { x: 3050, dy: 200 },
                { x: 3850, dy: 240 }, { x: 4350, dy: 190 }, { x: 4750, dy: 250 }, { x: 5450, dy: 230 }, { x: 5950, dy: 170 }
            ],
            goalX: 6400
        },
        {
            name: 'Ноћни град', collectible: '🌙', goal: 'finish', music: 'night',
            bgSky: '#1a1a3a', bgPage: '#1a1a3a', roadColor: '#4a4a5a', grassColor: '#2a3a2a',
            hillColor: '#23233f', isNight: true, decor: 'city', noClouds: true, noHills: true,
            obstacles: [
                { x: 650, dy: 60, w: 52, h: 42, type: 'car', color: '#ff6f91' },
                { x: 1400, dy: 190, w: 44, h: 40, type: 'cone' },
                { x: 2300, dy: 55, w: 60, h: 50, type: 'bus', color: '#fbd000' },
                { x: 3100, dy: 200, w: 52, h: 42, type: 'car', color: '#4fc3f7' },
                { x: 3800, dy: 70, w: 44, h: 40, type: 'cone' },
                { x: 4600, dy: 185, w: 60, h: 34, type: 'barrier' },
                { x: 5400, dy: 60, w: 52, h: 42, type: 'car', color: '#a070ff' },
                { x: 6000, dy: 100, w: 60, h: 50, type: 'truck', color: '#67c971' }
            ],
            coins: [
                { x: 340, dy: 160 }, { x: 580, dy: 240 }, { x: 1000, dy: 200 }, { x: 1450, dy: 180 },
                { x: 1850, dy: 260 }, { x: 2450, dy: 220 }, { x: 2750, dy: 290 }, { x: 3350, dy: 200 },
                { x: 3650, dy: 250 }, { x: 4200, dy: 230 }, { x: 4650, dy: 190 }, { x: 5250, dy: 240 }, { x: 5800, dy: 180 }
            ],
            goalX: 6500
        },
        {
            name: 'Пустињска магистрала', collectible: '🌵', goal: 'finish', music: 'desert',
            bgSky: '#f8d878', bgPage: '#f8d878', roadColor: '#e0c878', grassColor: '#e8c878',
            hillColor: '#d0a860', isNight: false, decor: null, noClouds: false,
            obstacles: [
                { x: 700, dy: 70, w: 60, h: 34, type: 'barrier' },
                { x: 1500, dy: 200, w: 52, h: 42, type: 'car', color: '#e52521' },
                { x: 2300, dy: 60, w: 44, h: 40, type: 'cone' },
                { x: 3100, dy: 90, w: 60, h: 50, type: 'truck', color: '#b89038' },
                { x: 3900, dy: 210, w: 44, h: 40, type: 'cone' },
                { x: 4700, dy: 55, w: 52, h: 42, type: 'car', color: '#a070ff' },
                { x: 5500, dy: 190, w: 60, h: 34, type: 'barrier' },
                { x: 6100, dy: 65, w: 44, h: 40, type: 'cone' }
            ],
            coins: [
                { x: 360, dy: 160 }, { x: 610, dy: 240 }, { x: 1050, dy: 200 }, { x: 1550, dy: 180 },
                { x: 1950, dy: 260 }, { x: 2450, dy: 220 }, { x: 2800, dy: 290 }, { x: 3350, dy: 200 },
                { x: 3650, dy: 250 }, { x: 4150, dy: 230 }, { x: 4550, dy: 190 }, { x: 5150, dy: 240 }, { x: 5700, dy: 180 }
            ],
            goalX: 6500
        },
        {
            name: 'Тропско острво', collectible: '🌴', goal: 'finish', music: 'island',
            bgSky: '#a8e8ff', bgPage: '#a8e8ff', roadColor: '#d8a868', grassColor: '#7bc74f',
            hillColor: '#5ab8a8', isNight: false, decor: 'palms', palmColor: '#2f9e44', noClouds: false,
            obstacles: [
                { x: 650, dy: 60, w: 52, h: 42, type: 'car', color: '#ff6f91' },
                { x: 1450, dy: 190, w: 44, h: 40, type: 'cone' },
                { x: 2400, dy: 70, w: 60, h: 50, type: 'truck', color: '#4fc3f7' },
                { x: 3200, dy: 200, w: 52, h: 42, type: 'car', color: '#fbd000' },
                { x: 3900, dy: 60, w: 44, h: 40, type: 'cone' },
                { x: 4700, dy: 180, w: 60, h: 34, type: 'barrier' },
                { x: 5500, dy: 65, w: 52, h: 42, type: 'car', color: '#67c971' },
                { x: 6100, dy: 100, w: 60, h: 34, type: 'barrier' }
            ],
            coins: [
                { x: 350, dy: 160 }, { x: 590, dy: 240 }, { x: 1000, dy: 200 }, { x: 1500, dy: 180 },
                { x: 1950, dy: 260 }, { x: 2550, dy: 220 }, { x: 2850, dy: 290 }, { x: 3450, dy: 200 },
                { x: 3750, dy: 250 }, { x: 4250, dy: 230 }, { x: 4650, dy: 190 }, { x: 5250, dy: 240 }, { x: 5800, dy: 180 }
            ],
            goalX: 6500
        },
        {
            name: 'Морска обала', collectible: '🐚', goal: 'finish', music: 'coast',
            bgSky: '#7fc8f8', bgPage: '#7fc8f8', roadColor: '#9ab0b8', grassColor: '#e8d8a0',
            hillColor: '#6aa8d8', isNight: false, decor: 'gulls', noClouds: false,
            obstacles: [
                { x: 700, dy: 60, w: 52, h: 42, type: 'car', color: '#e52521' },
                { x: 1500, dy: 190, w: 60, h: 34, type: 'barrier' },
                { x: 2400, dy: 70, w: 44, h: 40, type: 'cone' },
                { x: 3200, dy: 200, w: 60, h: 50, type: 'truck', color: '#ff6f91' },
                { x: 4000, dy: 60, w: 52, h: 42, type: 'car', color: '#4fc3f7' },
                { x: 4800, dy: 185, w: 44, h: 40, type: 'cone' },
                { x: 5600, dy: 70, w: 60, h: 34, type: 'barrier' },
                { x: 6200, dy: 110, w: 52, h: 42, type: 'car', color: '#a070ff' }
            ],
            coins: [
                { x: 360, dy: 160 }, { x: 610, dy: 240 }, { x: 1050, dy: 200 }, { x: 1550, dy: 180 },
                { x: 1950, dy: 260 }, { x: 2550, dy: 220 }, { x: 2850, dy: 290 }, { x: 3450, dy: 200 },
                { x: 3750, dy: 250 }, { x: 4350, dy: 230 }, { x: 4750, dy: 190 }, { x: 5350, dy: 240 }, { x: 5900, dy: 180 }
            ],
            goalX: 6600
        },
        {
            name: 'Космичка стаза', collectible: '🪐', goal: 'finish', music: 'cosmic',
            bgSky: '#14142e', bgPage: '#14142e', roadColor: '#3a3a5a', grassColor: '#1a1a30',
            hillColor: '#232340', isNight: true, decor: 'stars', noClouds: true, noHills: true,
            obstacles: [
                { x: 650, dy: 200, w: 60, h: 34, type: 'barrier' },
                { x: 1350, dy: 60, w: 52, h: 42, type: 'car', color: '#4fc3f7' },
                { x: 2200, dy: 90, w: 60, h: 50, type: 'truck', color: '#a070ff' },
                { x: 3000, dy: 210, w: 44, h: 40, type: 'cone' },
                { x: 3800, dy: 55, w: 52, h: 42, type: 'car', color: '#ff6f91' },
                { x: 4600, dy: 190, w: 60, h: 34, type: 'barrier' },
                { x: 5400, dy: 70, w: 44, h: 40, type: 'cone' },
                { x: 6200, dy: 100, w: 60, h: 50, type: 'truck', color: '#fbd000' }
            ],
            coins: [
                { x: 340, dy: 160 }, { x: 590, dy: 240 }, { x: 1000, dy: 200 }, { x: 1450, dy: 180 },
                { x: 1900, dy: 260 }, { x: 2350, dy: 220 }, { x: 2650, dy: 290 }, { x: 3250, dy: 200 },
                { x: 3550, dy: 250 }, { x: 4150, dy: 230 }, { x: 4550, dy: 190 }, { x: 5150, dy: 240 }, { x: 5750, dy: 180 }
            ],
            goalX: 6650
        }
    ];

    window.startDriving = function () {
        if (window.__adv) return;
        AdventureEngine.create({
            id: 'driving',
            mode: 'drive',
            hero: '🚗',
            heroImage: '../assets/images/driving-car.png',
            heroFilter: 'hue-rotate(150deg) saturate(1.35)',
            heroW: 280,
            heroH: 215,
            offsetStartRatio: 0.16,
            speed: 4.2,
            driveSpeed: 3.2,
            driveTopPadding: -20,
            obstacleScale: 2.7,
            pickupFontSize: 72,
            levels: LEVELS,
            music: MUSIC
        });
    };
})();
