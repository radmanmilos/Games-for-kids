/* Дино (Dino) — Phase 4 adventure game on the shared adventure engine.
   Ground-mode platformer: the little dinosaur 🦕 runs, jumps and climbs through
   10 prehistoric worlds, hopping across gaps and floating platforms, dodging
   raptors that pop out of pipes, and collecting the world's collectible emoji
   on the way to the ЦИЉ gate. Every world has its own procedural music theme +
   ambient layer and prehistoric scenery. */
(function () {
    'use strict';

    const MUSIC = {
        jungle: {
            root: 220.00, bpm: 92, wave: 'triangle', vol: 0.08,
            bass: [-12, -12, -12, -12, -5, -5, -5, -5, -12, -12, -12, -12, -7, -7, -7, -7],
            seq: [0, 3, 5, 7, 10, 7, 5, 3, 0, 2, 3, 7, 10, 12, 10, 7, 5, 7, 10, 12, 15, 12, 10, 7, 3, 5, 7, 10, 7, 5, 3, null],
            ambient: { sound: 'bird', rate: 0.05, vol: 0.045 }
        },
        valley: {
            root: 293.66, bpm: 76, wave: 'sine', vol: 0.08,
            bass: [-12, -12, -12, -12, -12, -12, -12, -12, -7, -7, -7, -7, -12, -12, -12, -12],
            seq: [0, 4, 7, 9, 12, 9, 7, 4, 0, 4, 7, 12, 14, 12, 9, 7, 4, 7, 9, 14, 12, 9, 7, 4, 0, 4, 7, 9, 7, 4, 2, 0],
            ambient: { sound: 'flute', rate: 0.05, vol: 0.05 }
        },
        lake: {
            root: 196.00, bpm: 72, wave: 'sine', vol: 0.09,
            bass: [-12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12],
            seq: [0, 3, 5, 7, 5, 3, 0, null, 0, 3, 5, 10, 7, 5, 3, 0, 5, 7, 10, 12, 10, 7, 5, 3, 0, 3, 5, 7, 5, 3, 0, null],
            ambient: { sound: 'waves', rate: 0.08, vol: 0.045 }
        },
        volcano: {
            root: 123.47, bpm: 88, wave: 'sawtooth', vol: 0.05,
            bass: [-12, -12, -12, -12, -5, -5, -5, -5, -12, -12, -12, -12, -5, -5, -5, -5],
            seq: [0, 3, 5, 7, 5, 3, null, 0, 0, 3, 5, 7, 10, 7, 5, 3, 3, 5, 7, 10, 12, 10, 7, 5, 0, 3, 5, 7, 5, 3, 0, null],
            ambient: { sound: 'rumble', rate: 0.06, vol: 0.05 }
        },
        cave: {
            root: 110.00, bpm: 50, wave: 'sine', vol: 0.10,
            bass: [-12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12],
            seq: [0, 3, 5, 7, 3, 0, null, null, 0, 3, 7, 10, 7, 3, 0, null, 3, 5, 7, 10, 12, 10, 7, 5, 3, 0, null, 3, 0, null, null, null],
            ambient: { sound: 'drip', rate: 0.09, vol: 0.04 }
        },
        swamp: {
            root: 174.61, bpm: 66, wave: 'triangle', vol: 0.08,
            bass: [-12, -12, -12, -12, -12, -12, -12, -12, -7, -7, -7, -7, -12, -12, -12, -12],
            seq: [0, 2, 4, 7, 4, 2, 0, null, 0, 2, 4, 9, 7, 4, 2, 0, 4, 7, 9, 12, 9, 7, 4, 2, 0, 2, 4, 7, 4, 2, 0, null],
            ambient: { sound: 'cricket', rate: 0.07, vol: 0.035 }
        },
        ice: {
            root: 587.33, bpm: 84, wave: 'triangle', vol: 0.06,
            bass: [-12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12],
            seq: [12, 16, 19, 16, 12, 16, 19, 21, 16, 19, 21, 24, 21, 19, 16, 12, 19, 16, 12, 16, 19, 21, 19, 16, 12, 16, 19, 24, 21, 19, 16, 19],
            ambient: { sound: 'bell', rate: 0.06, vol: 0.035 }
        },
        desert: {
            root: 261.63, bpm: 80, wave: 'sine', vol: 0.08,
            bass: [-12, -12, -12, -12, -12, -12, -12, -12, -5, -5, -5, -5, -12, -12, -12, -12],
            seq: [0, 4, 7, 9, 12, 9, 7, 4, 0, 2, 4, 7, 9, 7, 4, 2, 7, 9, 12, 14, 12, 9, 7, 4, 2, 4, 7, 9, 7, 4, 2, 0],
            ambient: { sound: 'desert', rate: 0.06, vol: 0.05 }
        },
        night: {
            root: 130.81, bpm: 60, wave: 'sine', vol: 0.09,
            bass: [-12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12, -12],
            seq: [0, 3, 5, 7, 5, 3, 0, null, 0, 3, 5, 10, 7, 5, 3, 0, 5, 7, 10, 12, 10, 7, 5, 3, 0, 3, 5, 7, 5, 3, 0, null],
            ambient: { sound: 'coo', rate: 0.06, vol: 0.05 }
        },
        island: {
            root: 196.00, bpm: 84, wave: 'triangle', vol: 0.08,
            bass: [-12, -12, -12, -12, -5, -5, -5, -5, -12, -12, -12, -12, -7, -7, -7, -7],
            seq: [0, 4, 7, 9, 12, 9, 7, 4, 0, 4, 7, 12, 14, 12, 9, 7, 4, 7, 9, 14, 12, 9, 7, 4, 0, 4, 7, 9, 7, 4, 2, 0],
            ambient: { sound: 'waves', rate: 0.07, vol: 0.04 }
        }
    };

    // Ground mode: solid grounds (x, w), floating platforms (floats, dy above
    // the ground line), moving platforms (moves, shuttle between minX/maxX),
    // stairs (auto step-up), and pipes (h) that pop out an enemy every 3s.
    // Coins sit at gy - dy. The player must be able to jump ~150px up and
    // ~250px across, so gaps stay <= 210 and floats <= 150 above ground.
    const LEVELS = [
        {
            name: 'Прашума', collectible: '🌺', goal: 'finish', music: 'jungle', decor: 'jungle', pitHazard: 'spikes',
            bgSky: '#6ecf6a', bgPage: '#6ecf6a', isNight: false, noHills: true,
            groundColor: '#4a9e4a', stairColor: '#5aa85a', pipeColor: '#2f8a3c', enemy: 'raptor',
            hillColor: '#3d8a3d',
            grounds: [
                { x: 0, w: 900 }, { x: 1100, w: 700 }, { x: 1900, w: 900 }, { x: 3000, w: 800 },
                { x: 3900, w: 800 }, { x: 4900, w: 900 }, { x: 5900, w: 1260 }
            ],
            floats: [
                { x: 2960, w: 110, dy: 90, color: '#5aa85a' }
            ],
            pipes: [
                { x: 600, h: 130 }, { x: 2300, h: 110 }, { x: 4400, h: 140 }
            ],
            stairs: [
                { x: 3400, peak: 3, w: 70, h: 34 }
            ],
            coins: [
                { x: 220, dy: 70 }, { x: 500, dy: 160 }, { x: 820, dy: 50 }, { x: 1250, dy: 120 },
                { x: 1550, dy: 60 }, { x: 2050, dy: 150 }, { x: 2350, dy: 80 }, { x: 2650, dy: 170 },
                { x: 3150, dy: 60 }, { x: 3450, dy: 120 }, { x: 4150, dy: 150 }, { x: 4550, dy: 70 },
                { x: 5200, dy: 130 }, { x: 6100, dy: 80 }, { x: 6500, dy: 170 }
            ],
            goalX: 6900
        },
        {
            name: 'Тропска долина', collectible: '🦜', goal: 'finish', music: 'valley', decor: 'valley', pitHazard: 'spikes',
            bgSky: '#7fd4ff', bgPage: '#7fd4ff', isNight: false, noHills: true,
            groundColor: '#8a6a3a', stairColor: '#9a7a4a', pipeColor: '#6b9e5a', enemy: 'raptor',
            hillColor: '#5a8a4a',
            grounds: [
                { x: 0, w: 1000 }, { x: 1150, w: 800 }, { x: 2100, w: 900 }, { x: 3150, w: 800 },
                { x: 4100, w: 900 }, { x: 5190, w: 860 }, { x: 6240, w: 1120 }
            ],
            floats: [
                { x: 1200, w: 100, dy: 60, color: '#9a7a4a' },
                { x: 3200, w: 100, dy: 70, color: '#9a7a4a' },
                { x: 5200, w: 100, dy: 60, color: '#9a7a4a' }
            ],
            moves: [
                { x: 2000, w: 110, dy: 90, minX: 1920, maxX: 2150, vx: 1.4, color: '#9a7a4a' }
            ],
            pipes: [
                { x: 500, h: 120 }, { x: 2700, h: 130 }, { x: 4800, h: 110 }
            ],
            stairs: [
                { x: 4600, peak: 3, w: 70, h: 34 }
            ],
            coins: [
                { x: 250, dy: 80 }, { x: 550, dy: 170 }, { x: 900, dy: 50 }, { x: 1350, dy: 120 },
                { x: 1700, dy: 60 }, { x: 2250, dy: 140 }, { x: 2550, dy: 80 }, { x: 2900, dy: 170 },
                { x: 3350, dy: 60 }, { x: 3750, dy: 130 }, { x: 4250, dy: 150 }, { x: 4750, dy: 70 },
                { x: 5450, dy: 120 }, { x: 6400, dy: 90 }, { x: 6700, dy: 170 }
            ],
            goalX: 7100
        },
        {
            name: 'Језеро', collectible: '💧', goal: 'finish', music: 'lake', decor: 'lake', pitHazard: 'water',
            bgSky: '#5fc8f0', bgPage: '#5fc8f0', isNight: false, noHills: true,
            groundColor: '#5a6a4a', stairColor: '#6a7a5a', pipeColor: '#5a6a78', enemy: 'raptor',
            hillColor: '#4a5a3a',
            grounds: [
                { x: 0, w: 700 }, { x: 850, w: 650 }, { x: 1650, w: 650 }, { x: 2450, w: 650 },
                { x: 3250, w: 650 }, { x: 4080, w: 670 }, { x: 4900, w: 700 }, { x: 5750, w: 1060 }
            ],
            floats: [
                { x: 780, w: 90, dy: 50, color: '#7a8a5a' },
                { x: 1600, w: 90, dy: 60, color: '#7a8a5a' },
                { x: 2400, w: 90, dy: 50, color: '#7a8a5a' },
                { x: 3200, w: 90, dy: 60, color: '#7a8a5a' },
                { x: 4850, w: 90, dy: 60, color: '#7a8a5a' }
            ],
            pipes: [
                { x: 1200, h: 110 }
            ],
            coins: [
                { x: 200, dy: 60 }, { x: 500, dy: 150 }, { x: 740, dy: 40 }, { x: 1100, dy: 120 },
                { x: 1450, dy: 60 }, { x: 1850, dy: 130 }, { x: 2200, dy: 70 }, { x: 2600, dy: 160 },
                { x: 3000, dy: 60 }, { x: 3450, dy: 120 }, { x: 3850, dy: 70 }, { x: 4300, dy: 150 },
                { x: 4700, dy: 60 }, { x: 5150, dy: 130 }, { x: 6000, dy: 90 }, { x: 6300, dy: 160 }
            ],
            goalX: 6550
        },
        {
            name: 'Вулкан', collectible: '🌋', goal: 'finish', music: 'volcano', decor: 'volcano', pitHazard: 'lava',
            bgSky: '#d97742', bgPage: '#d97742', isNight: false, noHills: true,
            groundColor: '#5a4a3a', stairColor: '#6a5a4a', pipeColor: '#8a3a2a', enemy: 'raptor',
            hillColor: '#4a3a2a',
            grounds: [
                { x: 0, w: 900 }, { x: 1100, w: 800 }, { x: 2080, w: 820 }, { x: 3000, w: 900 },
                { x: 4000, w: 900 }, { x: 5080, w: 820 }, { x: 6000, w: 1160 }
            ],
            moves: [
                { x: 1010, w: 130, dy: 70, minX: 940, maxX: 1170, vx: 1.5, color: '#6a5a4a' }
            ],
            pipes: [
                { x: 700, h: 140 }, { x: 2500, h: 120 }, { x: 4500, h: 130 }, { x: 6500, h: 110 }
            ],
            stairs: [
                { x: 3400, peak: 3, w: 70, h: 34 }
            ],
            coins: [
                { x: 220, dy: 80 }, { x: 520, dy: 170 }, { x: 860, dy: 50 }, { x: 1250, dy: 130 },
                { x: 1650, dy: 70 }, { x: 2150, dy: 150 }, { x: 2450, dy: 80 }, { x: 2750, dy: 170 },
                { x: 3200, dy: 60 }, { x: 3600, dy: 130 }, { x: 4150, dy: 150 }, { x: 4650, dy: 70 },
                { x: 5300, dy: 120 }, { x: 6150, dy: 90 }, { x: 6600, dy: 160 }
            ],
            goalX: 6900
        },
        {
            name: 'Пећина', collectible: '💎', goal: 'finish', music: 'cave', decor: 'cave', pitHazard: 'lava',
            bgSky: '#0e1c30', bgPage: '#0e1c30', isNight: false, noHills: true, noClouds: true,
            ceiling: true, ceilingColor: '#1a2c46',
            groundColor: '#3a3a4a', stairColor: '#4a4a5a', pipeColor: '#2a4a6a', enemy: 'raptor',
            hillColor: '#2a2a3a',
            grounds: [
                { x: 0, w: 900 }, { x: 1100, w: 800 }, { x: 2000, w: 900 }, { x: 3000, w: 900 },
                { x: 4000, w: 900 }, { x: 5070, w: 830 }, { x: 6000, w: 1160 }
            ],
            floats: [
                { x: 1150, w: 110, dy: 100, color: '#4a4a5a' },
                { x: 2100, w: 110, dy: 90, color: '#4a4a5a' },
                { x: 4100, w: 110, dy: 100, color: '#4a4a5a' }
            ],
            pipes: [
                { x: 600, h: 110 }, { x: 3200, h: 130 }, { x: 5300, h: 120 }
            ],
            coins: [
                { x: 220, dy: 80 }, { x: 500, dy: 170 }, { x: 820, dy: 50 }, { x: 1300, dy: 130 },
                { x: 1700, dy: 70 }, { x: 2200, dy: 150 }, { x: 2550, dy: 80 }, { x: 2850, dy: 170 },
                { x: 3250, dy: 60 }, { x: 3650, dy: 130 }, { x: 4200, dy: 150 }, { x: 4700, dy: 70 },
                { x: 5400, dy: 120 }, { x: 6200, dy: 90 }, { x: 6600, dy: 170 }
            ],
            goalX: 6900
        },
        {
            name: 'Мочвара', collectible: '🐸', goal: 'finish', music: 'swamp', decor: 'swamp', pitHazard: 'water',
            bgSky: '#7a8a4a', bgPage: '#7a8a4a', isNight: false, noHills: true,
            groundColor: '#5a6a3a', stairColor: '#6a7a4a', pipeColor: '#3a5a2a', enemy: 'raptor',
            hillColor: '#4a5a2a',
            grounds: [
                { x: 0, w: 800 }, { x: 950, w: 700 }, { x: 1800, w: 800 }, { x: 2820, w: 630 },
                { x: 3600, w: 800 }, { x: 4550, w: 800 }, { x: 5500, w: 1060 }
            ],
            moves: [
                { x: 950, w: 100, dy: 80, minX: 880, maxX: 1050, vx: 1.4, color: '#6a7a4a' }
            ],
            pipes: [
                { x: 600, h: 120 }, { x: 2000, h: 100 }, { x: 2900, h: 130 }, { x: 4800, h: 110 }
            ],
            stairs: [
                { x: 3800, peak: 3, w: 70, h: 34 }
            ],
            coins: [
                { x: 200, dy: 70 }, { x: 500, dy: 160 }, { x: 800, dy: 50 }, { x: 1200, dy: 130 },
                { x: 1550, dy: 60 }, { x: 2000, dy: 140 }, { x: 2350, dy: 80 }, { x: 2900, dy: 160 },
                { x: 3350, dy: 60 }, { x: 3800, dy: 130 }, { x: 4250, dy: 150 }, { x: 4700, dy: 70 },
                { x: 5200, dy: 120 }, { x: 5800, dy: 90 }, { x: 6100, dy: 160 }
            ],
            goalX: 6300
        },
        {
            name: 'Ледено доба', collectible: '❄️', goal: 'finish', music: 'ice', decor: 'ice', pitHazard: 'spikes',
            bgSky: '#bfe8ff', bgPage: '#bfe8ff', isNight: false, noHills: true,
            groundColor: '#dff0ff', stairColor: '#cfeaff', pipeColor: '#8fc4e8', enemy: 'raptor',
            hillColor: '#cfeaff',
            grounds: [
                { x: 0, w: 900 }, { x: 1050, w: 800 }, { x: 1950, w: 900 }, { x: 2950, w: 800 },
                { x: 3850, w: 900 }, { x: 4930, w: 820 }, { x: 5930, w: 1080 }
            ],
            floats: [
                { x: 1100, w: 110, dy: 70, color: '#cfeaff' },
                { x: 3000, w: 110, dy: 80, color: '#cfeaff' }
            ],
            pipes: [
                { x: 700, h: 110 }, { x: 2400, h: 130 }
            ],
            stairs: [
                { x: 4300, peak: 3, w: 70, h: 34 }
            ],
            coins: [
                { x: 220, dy: 70 }, { x: 520, dy: 160 }, { x: 820, dy: 50 }, { x: 1300, dy: 120 },
                { x: 1650, dy: 60 }, { x: 2100, dy: 150 }, { x: 2400, dy: 80 }, { x: 2700, dy: 170 },
                { x: 3200, dy: 60 }, { x: 3600, dy: 130 }, { x: 4100, dy: 150 }, { x: 4600, dy: 70 },
                { x: 5300, dy: 120 }, { x: 6200, dy: 90 }, { x: 6500, dy: 170 }
            ],
            goalX: 6750
        },
        {
            name: 'Пустиња', collectible: '🌵', goal: 'finish', music: 'desert', decor: 'desert', pitHazard: 'spikes',
            bgSky: '#f0d8a0', bgPage: '#f0d8a0', isNight: false, noHills: true,
            groundColor: '#d8c080', stairColor: '#e0c890', pipeColor: '#b0884a', enemy: 'raptor',
            hillColor: '#c8b070',
            grounds: [
                { x: 0, w: 800 }, { x: 1000, w: 700 }, { x: 1850, w: 800 }, { x: 2800, w: 800 },
                { x: 3750, w: 800 }, { x: 4700, w: 800 }, { x: 5720, w: 990 }
            ],
            floats: [
                { x: 1050, w: 110, dy: 90, color: '#e0c890' },
                { x: 2850, w: 110, dy: 80, color: '#e0c890' }
            ],
            pipes: [
                { x: 600, h: 120 }, { x: 3900, h: 110 }
            ],
            stairs: [
                { x: 5200, peak: 4, w: 70, h: 30 }
            ],
            coins: [
                { x: 200, dy: 70 }, { x: 500, dy: 160 }, { x: 800, dy: 50 }, { x: 1250, dy: 130 },
                { x: 1550, dy: 60 }, { x: 2000, dy: 150 }, { x: 2300, dy: 80 }, { x: 2600, dy: 170 },
                { x: 3050, dy: 60 }, { x: 3400, dy: 130 }, { x: 3900, dy: 150 }, { x: 4300, dy: 70 },
                { x: 4900, dy: 120 }, { x: 5850, dy: 90 }, { x: 6150, dy: 170 }
            ],
            goalX: 6450
        },
        {
            name: 'Ноћни свет', collectible: '🌙', goal: 'finish', music: 'night', decor: 'night', pitHazard: 'spikes',
            bgSky: '#1a2a5a', bgPage: '#1a2a5a', isNight: true, noHills: true,
            groundColor: '#3a3a5a', stairColor: '#4a4a6a', pipeColor: '#4a3a6a', enemy: 'raptor',
            hillColor: '#2a2a4a',
            grounds: [
                { x: 0, w: 900 }, { x: 1100, w: 800 }, { x: 2000, w: 900 }, { x: 3000, w: 900 },
                { x: 4000, w: 900 }, { x: 5090, w: 810 }, { x: 6070, w: 1090 }
            ],
            moves: [
                { x: 1010, w: 120, dy: 90, minX: 940, maxX: 1180, vx: 1.6, color: '#4a4a6a' }
            ],
            pipes: [
                { x: 750, h: 130 }, { x: 4500, h: 120 }
            ],
            coins: [
                { x: 220, dy: 80 }, { x: 520, dy: 170 }, { x: 860, dy: 50 }, { x: 1300, dy: 130 },
                { x: 1700, dy: 70 }, { x: 2150, dy: 150 }, { x: 2500, dy: 80 }, { x: 2800, dy: 170 },
                { x: 3250, dy: 60 }, { x: 3650, dy: 130 }, { x: 4200, dy: 150 }, { x: 4700, dy: 70 },
                { x: 5300, dy: 120 }, { x: 6200, dy: 90 }, { x: 6600, dy: 170 }
            ],
            goalX: 6900
        },
        {
            name: 'Острво диносауруса', collectible: '🏝️', goal: 'finish', music: 'island', decor: 'island', pitHazard: 'water',
            bgSky: '#4fc8e8', bgPage: '#4fc8e8', isNight: false, noHills: true,
            groundColor: '#e0c080', stairColor: '#e8c890', pipeColor: '#a87848', enemy: 'raptor',
            hillColor: '#4a9e4a',
            grounds: [
                { x: 0, w: 800 }, { x: 1000, w: 700 }, { x: 1900, w: 700 }, { x: 2700, w: 800 },
                { x: 3600, w: 800 }, { x: 4500, w: 800 },                 { x: 5400, w: 800 }, { x: 6370, w: 990 }
            ],
            floats: [
                { x: 2750, w: 110, dy: 90, color: '#e8c890' },
                { x: 4550, w: 110, dy: 80, color: '#e8c890' }
            ],
            moves: [
                { x: 1000, w: 100, dy: 70, minX: 920, maxX: 1080, vx: 1.4, color: '#e8c890' }
            ],
            pipes: [
                { x: 2100, h: 120 }, { x: 5800, h: 110 }
            ],
            stairs: [
                { x: 3600, peak: 3, w: 70, h: 34 }
            ],
            coins: [
                { x: 200, dy: 70 }, { x: 500, dy: 160 }, { x: 800, dy: 50 }, { x: 1250, dy: 130 },
                { x: 1550, dy: 60 }, { x: 2000, dy: 150 }, { x: 2350, dy: 80 }, { x: 2650, dy: 170 },
                { x: 3100, dy: 60 }, { x: 3500, dy: 130 }, { x: 4050, dy: 150 }, { x: 4450, dy: 70 },
                { x: 5100, dy: 120 }, { x: 5950, dy: 90 }, { x: 6500, dy: 170 }
            ],
            goalX: 7100
        }
    ];

    // --- Prehistoric scenery (drawn on top, semi-transparent, screen space) ---
    function bxs(cameraX, spacing, factor, w) {
        const arr = [];
        const start = Math.floor((cameraX * factor - 100) / spacing);
        const end = Math.ceil((cameraX * factor + w + 100) / spacing);
        for (let i = start; i <= end; i++) arr.push(i * spacing - cameraX * factor);
        return arr;
    }

    function drawTrunkTree(ctx, x, gy, h, canopy, trunk) {
        ctx.fillStyle = trunk;
        ctx.fillRect(x - 8, gy - h, 16, h);
        ctx.fillStyle = canopy;
        ctx.beginPath();
        ctx.arc(x, gy - h - 26, 46, 0, Math.PI * 2);
        ctx.arc(x + 36, gy - h - 12, 34, 0, Math.PI * 2);
        ctx.arc(x - 36, gy - h - 12, 34, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.18)';
        ctx.beginPath();
        ctx.arc(x - 14, gy - h - 34, 16, 0, Math.PI * 2);
        ctx.fill();
    }

    function drawFalling(ctx, t, w, h, type) {
        const col = type === 'snow' ? 'rgba(255,255,255,0.8)' : 'rgba(200,60,40,0.5)';
        ctx.fillStyle = col;
        for (let i = 0; i < 12; i++) {
            const x = ((i * 173 + t * (type === 'snow' ? 40 : 70)) % (w + 30)) - 15;
            const y = (i * 61 + t * 90) % (h + 30) - 15;
            ctx.beginPath();
            ctx.arc(x, y, type === 'snow' ? 4 : 5, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function drawJungle(ctx, t, cameraX, w, h) {
        const gy = h - 50;
        drawFalling(ctx, t, w, h, 'leaf');
        const xs = bxs(cameraX, 420, 1, w);
        for (let i = 0; i < xs.length; i++) {
            drawTrunkTree(ctx, xs[i] + (i % 3) * 90, gy, 90 + (i % 3) * 40, '#3d9e3d', '#6a4a2a');
        }
        ctx.fillStyle = 'rgba(47,158,68,0.5)';
        for (let i = 0; i < 14; i++) {
            const x = ((i * 227 + cameraX * 0.4) % (w + 60)) - 30;
            ctx.beginPath();
            ctx.arc(x, gy - 6, 5, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function drawValley(ctx, t, cameraX, w, h) {
        const gy = h - 50;
        const xs = bxs(cameraX, 300, 1, w);
        for (let i = 0; i < xs.length; i++) {
            const x = xs[i];
            ctx.fillStyle = i % 2 ? '#e8a060' : '#e08050';
            ctx.strokeStyle = '#2f9e44';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(x, gy - 6);
            ctx.quadraticCurveTo(x + 4, gy - 30, x + 10, gy - 40);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x, gy - 6);
            ctx.quadraticCurveTo(x - 4, gy - 30, x - 10, gy - 40);
            ctx.stroke();
            ctx.fillStyle = i % 2 ? '#ffb64d' : '#ff4f7a';
            ctx.beginPath();
            ctx.arc(x + (i % 2 ? 10 : -10), gy - 42, 5, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function drawLake(ctx, t, cameraX, w, h) {
        const gy = h - 50;
        ctx.fillStyle = '#3fb0e0';
        ctx.fillRect(0, gy, w, h - gy);
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        for (let i = 0; i < 8; i++) {
            const x = ((i * 173 + t * 20) % (w + 80)) - 40;
            ctx.beginPath();
            ctx.ellipse(x, gy + 14 + (i % 3) * 22, 16, 5, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        const xs = bxs(cameraX, 300, 1, w);
        ctx.fillStyle = '#4a9e4a';
        for (let i = 0; i < xs.length; i++) {
            ctx.beginPath();
            ctx.ellipse(xs[i], gy + 10, 20, 7, 0.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#e06aa0';
            ctx.beginPath();
            ctx.arc(xs[i] + 6, gy + 8, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#4a9e4a';
        }
    }

    function drawVolcano(ctx, t, cameraX, w, h) {
        const gy = h - 50;
        ctx.fillStyle = '#5a3a2a';
        for (const [vx, vw, vh] of [[260, 260, 300], [900, 320, 360], [1600, 280, 240]]) {
            const sx = vx - cameraX;
            ctx.beginPath();
            ctx.moveTo(sx - vw / 2, gy + 4);
            ctx.lineTo(sx, gy - vh);
            ctx.lineTo(sx + vw / 2, gy + 4);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#ff8a3a';
            ctx.beginPath();
            ctx.ellipse(sx, gy - vh + 6, 14, 6, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#5a3a2a';
        }
        ctx.fillStyle = 'rgba(255,120,50,0.8)';
        for (let i = 0; i < 8; i++) {
            const x = ((i * 211 + cameraX * 0.3) % (w + 60)) - 30;
            const y = gy - 8 - ((i * 97 + t * 60) % (gy - 60));
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function drawCave(ctx, t, cameraX, w, h) {
        const gy = h - 50;
        ctx.fillStyle = 'rgba(127,211,255,0.5)';
        const xs = bxs(cameraX, 300, 1, w);
        for (let i = 0; i < xs.length; i++) {
            ctx.save();
            ctx.translate(xs[i], gy - 8);
            ctx.rotate(0.5);
            ctx.beginPath();
            ctx.moveTo(0, -14);
            ctx.lineTo(10, 0);
            ctx.lineTo(0, 14);
            ctx.lineTo(-10, 0);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
        ctx.fillStyle = 'rgba(150,200,255,0.35)';
        for (let i = 0; i < 10; i++) {
            const x = ((i * 173 + cameraX * 0.4) % (w + 40)) - 20;
            const y = 90 + ((i * 83) % (h - 200));
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function drawSwamp(ctx, t, cameraX, w, h) {
        const gy = h - 50;
        ctx.fillStyle = 'rgba(200,220,160,0.35)';
        for (let i = 0; i < 4; i++) {
            ctx.fillRect(0, gy - 30 - i * 34, w, 10);
        }
        const xs = bxs(cameraX, 130, 1, w);
        ctx.strokeStyle = 'rgba(47,98,28,0.7)';
        ctx.lineWidth = 4;
        for (let i = 0; i < xs.length; i++) {
            const x = xs[i];
            ctx.beginPath();
            ctx.moveTo(x, gy - 6);
            ctx.quadraticCurveTo(x + 6, gy - 40, x + Math.sin(t + i) * 8, gy - 60);
            ctx.stroke();
        }
        ctx.fillStyle = '#ffd23f';
        for (let i = 0; i < 8; i++) {
            const x = ((i * 149 + cameraX * 0.3) % (w + 40)) - 20;
            const y = 70 + ((i * 67) % (h - 220));
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function drawIce(ctx, t, cameraX, w, h) {
        const gy = h - 50;
        drawFalling(ctx, t, w, h, 'snow');
        const xs = bxs(cameraX, 380, 1, w);
        for (let i = 0; i < xs.length; i++) {
            const x = xs[i];
            ctx.fillStyle = '#5a9e5a';
            ctx.beginPath();
            ctx.moveTo(x - 30, gy + 4);
            ctx.lineTo(x, gy - 120);
            ctx.lineTo(x + 30, gy + 4);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,0.6)';
            ctx.beginPath();
            ctx.moveTo(x - 12, gy - 60);
            ctx.lineTo(x, gy - 110);
            ctx.lineTo(x + 12, gy - 60);
            ctx.closePath();
            ctx.fill();
        }
    }

    function drawDesert(ctx, t, cameraX, w, h) {
        const gy = h - 50;
        const ds = bxs(cameraX, 700, 1, w);
        ctx.fillStyle = 'rgba(240,210,150,0.5)';
        for (let i = 0; i < ds.length; i++) {
            ctx.beginPath();
            ctx.arc(ds[i], gy + 20, 70 + (i % 3) * 20, Math.PI, 0);
            ctx.fill();
        }
        const xs = bxs(cameraX, 380, 1, w);
        for (let i = 0; i < xs.length; i++) {
            const x = xs[i];
            ctx.fillStyle = '#4a7a2a';
            ctx.fillRect(x - 4, gy - 46, 8, 46);
            ctx.fillRect(x - 16, gy - 36, 8, 22);
            ctx.fillRect(x + 8, gy - 30, 8, 18);
        }
        ctx.fillStyle = '#c8a060';
        const tween = Math.floor((t * 40 + cameraX) % (w + 40));
        ctx.beginPath();
        ctx.arc(tween, gy - 12, 8, 0, Math.PI * 2);
        ctx.fill();
    }

    function drawNightDecor(ctx, t, cameraX, w, h) {
        const gy = h - 50;
        ctx.fillStyle = 'rgba(160,220,255,0.4)';
        for (let i = 0; i < 12; i++) {
            const x = ((i * 167 + cameraX * 0.3) % (w + 40)) - 20;
            const y = 60 + ((i * 79) % (h - 160));
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        const xs = bxs(cameraX, 340, 1, w);
        ctx.fillStyle = 'rgba(127,211,255,0.7)';
        for (let i = 0; i < xs.length; i++) {
            ctx.save();
            ctx.translate(xs[i], gy - 12);
            ctx.rotate(0.5);
            ctx.beginPath();
            ctx.moveTo(0, -12);
            ctx.lineTo(9, 0);
            ctx.lineTo(0, 12);
            ctx.lineTo(-9, 0);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
    }

    function drawIsland(ctx, t, cameraX, w, h) {
        const gy = h - 50;
        ctx.fillStyle = '#3fb0e0';
        ctx.fillRect(0, gy, w, h - gy);
        const xs = bxs(cameraX, 480, 1, w);
        for (let i = 0; i < xs.length; i++) {
            const x = xs[i];
            ctx.strokeStyle = '#8a6a3a';
            ctx.lineWidth = 10;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(x, gy - 4);
            ctx.quadraticCurveTo(x, gy - 60, x, gy - 104);
            ctx.stroke();
            ctx.strokeStyle = '#3d9e3d';
            ctx.lineWidth = 12;
            ctx.beginPath();
            ctx.moveTo(x, gy - 99);
            ctx.quadraticCurveTo(x - 36, gy - 132, x - 30, gy - 88);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x, gy - 104);
            ctx.quadraticCurveTo(x + 36, gy - 142, x + 30, gy - 94);
            ctx.stroke();
        }
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        for (let i = 0; i < 6; i++) {
            const x = ((i * 173 + t * 20) % (w + 80)) - 40;
            ctx.beginPath();
            ctx.ellipse(x, gy + 16 + (i % 3) * 20, 16, 5, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function drawDecor(ctx, t, cameraX, canvas, theme) {
        const w = canvas.width, h = canvas.height;
        ctx.save();
        switch (theme.decor) {
            case 'jungle': drawJungle(ctx, t, cameraX, w, h); break;
            case 'valley': drawValley(ctx, t, cameraX, w, h); break;
            case 'lake': drawLake(ctx, t, cameraX, w, h); break;
            case 'volcano': drawVolcano(ctx, t, cameraX, w, h); break;
            case 'cave': drawCave(ctx, t, cameraX, w, h); break;
            case 'swamp': drawSwamp(ctx, t, cameraX, w, h); break;
            case 'ice': drawIce(ctx, t, cameraX, w, h); break;
            case 'desert': drawDesert(ctx, t, cameraX, w, h); break;
            case 'night': drawNightDecor(ctx, t, cameraX, w, h); break;
            case 'island': drawIsland(ctx, t, cameraX, w, h); break;
        }
        ctx.restore();
    }

    // --- Pop-out enemy: an angry mini-raptor that pops out of pipes ---
    function drawEnemy(ctx, type) {
        ctx.save();
        ctx.scale(0.9, 0.9);
        ctx.fillStyle = '#2f9e44';
        ctx.beginPath();
        ctx.ellipse(0, 0, 18, 16, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(12, -4);
        ctx.lineTo(27, 0);
        ctx.lineTo(12, 4);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#216e30';
        ctx.beginPath(); ctx.arc(-12, -14, 5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(-5, -16, 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(-9, -6, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#1b2430';
        ctx.beginPath(); ctx.arc(-8, -6, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(20, 2, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(16, 3, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }

    // Stone temple arch + ЦИЉ banner for the finish gate.
    function drawDinoGoal(ctx, themeGoal, goal) {
        const gx = goal.x, gy = goal.y, gw = goal.width, gh = goal.height;
        ctx.fillStyle = '#8a7a6a';
        ctx.fillRect(gx, gy, 26, gh);
        ctx.fillRect(gx + gw - 26, gy, 26, gh);
        ctx.beginPath();
        ctx.arc(gx + gw / 2, gy + 40, gw / 2 - 4, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.beginPath();
        ctx.arc(gx + gw / 2, gy + 40, gw / 2 - 18, Math.PI, 0);
        ctx.fill();
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

    // --- Playable dinosaur heroes (drawn from the PNG sprites; both source
    // images face LEFT natively, so the engine mirrors them right via heroFlip) ---
    const DINO_SPRITES = {
        bronto: { src: '../assets/images/dino/brontosaurus.png' },
        t_rex: { src: '../assets/images/dino/tiranosaurus-rex.png' }
    };
    const dinoFrames = {};
    const dinoPreviewC2d = {};
    // Opaque-content crop rects, measured from the resources/dino/ PNGs with the
    // same alpha scan below. Fallback when getImageData is blocked (a canvas
    // drawn from a file:// image is tainted -> SecurityError; drawing still works).
    const DINO_CROP_FALLBACK = {
        bronto: { x: 264, y: 106, w: 1529, h: 1633 },
        t_rex: { x: 154, y: 112, w: 1691, h: 1775 }
    };

    function loadDinoFrame(type) {
        const img = new Image();
        img.onload = () => {
            // Trim the transparent padding: find the opaque bounds of the source
            // PNG (both are 2000x2000 canvases with a margin) and pre-scale the
            // content to the 110x100 hitbox so feet land at the hitbox bottom.
            const c = document.createElement('canvas');
            c.width = img.naturalWidth;
            c.height = img.naturalHeight;
            const c2d = c.getContext('2d');
            c2d.drawImage(img, 0, 0);
            let crop = null;
            try {
                const d = c2d.getImageData(0, 0, c.width, c.height).data;
                let minX = c.width, minY = c.height, maxX = 0, maxY = 0;
                for (let y = 0; y < c.height; y += 2) {
                    for (let x = 0; x < c.width; x += 2) {
                        if (d[(y * c.width + x) * 4 + 3] > 32) {
                            if (x < minX) minX = x;
                            if (x > maxX) maxX = x;
                            if (y < minY) minY = y;
                            if (y > maxY) maxY = y;
                        }
                    }
                }
                crop = { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
            } catch (e) {
                crop = DINO_CROP_FALLBACK[type];
            }
            const frame = document.createElement('canvas');
            frame.width = Math.max(1, Math.round(crop.w * 100 / crop.h));
            frame.height = 100;
            const f2d = frame.getContext('2d');
            f2d.drawImage(img, crop.x, crop.y, crop.w, crop.h, 0, 0, frame.width, 100);
            dinoFrames[type] = frame;
            redrawPickerPreviews();
        };
        img.src = DINO_SPRITES[type].src;
    }

    // ctx origin = player centre (the engine shifts it up 3px before drawing),
    // so drawing the bottom edge at +53 sits the feet exactly on the hitbox bottom.
    function drawDinoHero(ctx, type) {
        const frame = dinoFrames[type];
        if (!frame) return;
        ctx.drawImage(frame, -frame.width / 2, 53 - frame.height, frame.width, frame.height);
    }

    // --- Level-start dino picker ---
    const DINO_OPTIONS = [
        { type: 'bronto', name: 'Бронтосаурус' },
        { type: 't_rex', name: 'Тиранозаур' }
    ];

    function redrawPickerPreviews() {
        const modal = document.getElementById('adv-dino-picker');
        if (!modal || !modal.classList.contains('show')) return;
        DINO_OPTIONS.forEach(opt => {
            const c2d = dinoPreviewC2d[opt.type];
            if (!c2d) return;
            c2d.setTransform(1, 0, 0, 1, 0, 0);
            c2d.clearRect(0, 0, 110, 100);
            // Mirror so the thumbnail matches the in-game look: the PNGs face left
            // natively and heroFlip mirrors them to face right at level start.
            c2d.translate(55, 47);
            c2d.scale(-1, 1);
            drawDinoHero(c2d, opt.type);
        });
    }

    function showDinoPicker(game) {
        const modal = document.getElementById('adv-dino-picker');
        if (!modal) return;
        const grid = document.getElementById('adv-dino-grid');
        grid.innerHTML = '';
        DINO_OPTIONS.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'adv-dino-btn';
            btn.dataset.dino = opt.type;
            const canvas = document.createElement('canvas');
            canvas.width = 110;
            canvas.height = 100;
            const c2d = canvas.getContext('2d');
            dinoPreviewC2d[opt.type] = c2d;
            btn.appendChild(canvas);
            const label = document.createElement('span');
            label.textContent = opt.name;
            btn.appendChild(label);
            btn.addEventListener('click', () => {
                game.setHeroType(opt.type);
                modal.classList.remove('show');
                game.setPaused(false);
            });
            grid.appendChild(btn);
        });
        modal.classList.add('show');
        redrawPickerPreviews();
    }

    window.startDino = function () {
        if (window.__adv) return;
        loadDinoFrame('bronto');
        loadDinoFrame('t_rex');
        window.__dinoFrames = dinoFrames;
        AdventureEngine.create({
            id: 'dino',
            mode: 'ground',
            hero: '🦕',
            heroFontSize: 78,
            heroW: 110,
            heroH: 100,
            heroBob: 2,
            pickHero: true,
            heroType: 't_rex',
            heroFlip: true,
            drawHero: drawDinoHero,
            onHeroNeeded: showDinoPicker,
            decorBehind: true,
            speed: 5.2,
            jumpPower: -13.5,
            pickupFontSize: 58,
            levels: LEVELS,
            music: MUSIC,
            drawEnemy: drawEnemy,
            drawDecor: drawDecor,
            drawGoal: drawDinoGoal
        });
    };
})();
