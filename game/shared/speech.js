(function () {
    const assetRoot = /\/pages\//.test(location.pathname) ? '../' : '';
    const vocabulary = window.SERBIAN;
    const speechFiles = {};
    const register = (phrase, file) => {
        if (!phrase || !file) throw new Error('Invalid Serbian speech asset mapping');
        speechFiles[phrase] = `assets/audio/speech/${file}.mp3`;
    };
    const registerEach = (items, files, getPhrase) => {
        if (items.length !== files.length) throw new Error('Serbian speech vocabulary and asset lists differ in length');
        items.forEach((item, index) => register(getPhrase(item, index), files[index]));
    };

    register(vocabulary.praise[1], 'bravo');
    const animalFiles = {
        Dog: 'pas', Cat: 'macka', Cow: 'krava', Lion: 'lav', Elephant: 'slon', Frog: 'zaba',
        Pig: 'svinja', Duck: 'patka', Fox: 'lisica', Sheep: 'ovca', Horse: 'konj', Chicken: 'koka',
    };
    if (Object.keys(animalFiles).length !== Object.keys(vocabulary.animals).length ||
        Object.keys(vocabulary.animals).some(id => !animalFiles[id])) {
        throw new Error('Serbian speech animal assets do not match vocabulary');
    }
    for (const [id, file] of Object.entries(animalFiles)) register(vocabulary.animals[id], file);

    const letterFiles = ['a', 'b', 'v', 'g', 'd', 'dj', 'e', 'zh', 'z', 'i', 'j', 'k', 'l', 'lj', 'm', 'n', 'nj', 'o', 'p', 'r', 's', 't', 'cj', 'u', 'f', 'h', 'c', 'ch', 'dz', 'sh'];
    const wordFiles = ['automobil', 'banana', 'vuk', 'gusenica', 'drvo', 'djak', 'ekran', 'zaba', 'zvezda', 'igla', 'jabuka', 'krava', 'lav', 'ljubav', 'macka', 'nos', 'njuska', 'oko', 'pas', 'riba', 'slon', 'torta', 'cjuran', 'uvo', 'flamingo', 'helikopter', 'cvet', 'chamac', 'dzemper', 'sesir'];
    registerEach(vocabulary.alphabet, letterFiles, item => item.name);
    registerEach(vocabulary.alphabet, wordFiles, item => item.word);

    const shapeFiles = ['krug', 'kvadrat', 'trougao', 'zvezda', 'lopta', 'kocka', 'kvadar', 'valjak', 'kupa', 'piramida'];
    registerEach(vocabulary.shapes, shapeFiles, shape => shape);

    const numberFiles = ['nula', 'jedan', 'dva', 'tri', 'cetiri', 'pet', 'sest', 'sedam', 'osam', 'devet', 'deset',
        'jedanaest', 'dvanaest', 'trinaest', 'cetrnaest', 'petnaest', 'sesnaest', 'sedamnaest', 'osamnaest', 'devetnaest', 'dvadeset'];
    const sentenceFiles = ['nula', 'jedan_pas', 'dva_psa', 'tri_macke', 'cetiri_krave', 'pet_slonova', 'sest_lavova', 'sedam_pataka', 'osam_konja', 'devet_zaba', 'deset_svinja',
        'jedanaest_pasa', 'dvanaest_macaka', 'trinaest_krava', 'cetrnaest_slonova', 'petnaest_lavova', 'sesnaest_pataka', 'sedamnaest_konja', 'osamnaest_zaba', 'devetnaest_svinja', 'dvadeset_pasa'];
    registerEach(vocabulary.numbers, numberFiles, number => number.name);
    registerEach(vocabulary.numbers, sentenceFiles, number => number.sentence);

    const colorFiles = ['crvena', 'narandzasta', 'zuta', 'zelena', 'plava', 'ljubicasta', 'roze', 'braon', 'siva', 'bela', 'crna'];
    registerEach(vocabulary.colors, colorFiles, color => color.name);
    register(vocabulary.reactions.ouch, 'jao');
    register(vocabulary.reactions.ouchPlain, 'jao');
    const speechAudio = new Audio();
    speechAudio.preload = 'none';
    let srVoice = null;
    function pickVoice() {
        if (!('speechSynthesis' in window)) return;
        srVoice = window.speechSynthesis.getVoices().find(v => /^sr([-_]|$)/.test(v.lang)) || null;
    }
    if ('speechSynthesis' in window) {
        pickVoice();
        window.speechSynthesis.onvoiceschanged = pickVoice;
    }
    function cancelSpeech(notifyAudioBuses) {
        if (speechAudio._currentFinish) {
            speechAudio.removeEventListener('ended', speechAudio._currentFinish);
            speechAudio.removeEventListener('error', speechAudio._currentFinish);
            speechAudio._currentFinish = null;
        }
        speechAudio.pause();
        speechAudio.currentTime = 0;
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        if (notifyAudioBuses && window.audioBuses) window.audioBuses.speechCancelled();
    }
    window.speech = {
        speak(text, onDone) {
            if (!text) { if (onDone) onDone(); return; }
            cancelSpeech(false);
            const file = speechFiles[text];
            if (file) {
                speechAudio.src = assetRoot + file;
                let done = false;
                const finish = () => {
                    if (done) return;
                    done = true;
                    // cleanup any stored finish reference
                    if (speechAudio._currentFinish) {
                        speechAudio.removeEventListener('ended', speechAudio._currentFinish);
                        speechAudio.removeEventListener('error', speechAudio._currentFinish);
                        speechAudio._currentFinish = null;
                    }
                    if (onDone) onDone();
                };
                if (window.audioBuses) window.audioBuses.registerMedia(speechAudio, 'speech');
                // store finish so cancel() can remove the listeners safely
                speechAudio._currentFinish = finish;
                speechAudio.addEventListener('ended', finish, { once: true });
                speechAudio.addEventListener('error', finish, { once: true });
                const playback = speechAudio.play();
                if (playback) playback.catch(finish);
                return;
            }
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = 'sr-RS';
                if (srVoice) utterance.voice = srVoice;
                utterance.rate = 0.9;
                utterance.pitch = 1.1;
                if (onDone) utterance.onend = onDone;
                window.speechSynthesis.speak(utterance);
            } else if (onDone) {
                onDone();
            }
        },
        cancel() {
            cancelSpeech(true);
        }
    };
}());
