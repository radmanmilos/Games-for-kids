(function () {
    'use strict';

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
        music: 'meadow',
        goal: 7200
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
        }
    };

    const RACING_CHARACTERS = [{
        id: 'kitty',
        name: 'Маца Истраживачица',
        folder: 'explorer_kitty/',
        srcW: 273,
        srcH: 312,
        carBody: '#e52521',
        carAccent: '#2b2d42',
        carWheel: '#1a1a1a'
    }, {
        id: 'explorer',
        name: 'Истраживачица',
        folder: 'explorer/',
        srcW: 237,
        srcH: 329,
        carBody: '#4fc3f7',
        carAccent: '#2b2d42',
        carWheel: '#1a1a1a'
    }];

    window.RACING_CONFIG = {
        worlds: RACING_WORLDS,
        music: RACING_MUSIC,
        characters: RACING_CHARACTERS,
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
