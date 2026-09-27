/* Клавир — free play first, plus the "Прати светло" song mode.
   Roadmap task GAME-PIANO-001: the expected key softly lights, a correct press
   gives a brief positive highlight and advances, a wrong press never punishes —
   it just points the light at the expected key again. */
(function () {
    const KEY_FREQS = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];
    const KEY_COLORS = ['#FF6F91', '#FFA94D', '#FFD23F', '#67C971', '#4FC3F7', '#9B6DFF', '#C56CF0', '#FF6F91'];
    const NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C'];
    // Song notes are note names ('C4'..'C5'); this maps a name to its keyboard index.
    const NOTE_INDEX = { C4: 0, D4: 1, E4: 2, F4: 3, G4: 4, A4: 5, B4: 6, C5: 7 };
    // Song shape per the roadmap: id, title, notes (name sequence), tempo (ms per beat),
    // speech (spoken line). `hold` is our per-note length in beats so melodies keep
    // their phrasing; `emoji` labels the song chip.
    const SONGS = [
        { id: 'twinkle', title: 'Трепери, трепери звездице', emoji: '⭐', tempo: 500,
          speech: 'Трепери, трепери звездице',
          notes: ['C4','C4','G4','G4','A4','A4','G4', 'F4','F4','E4','E4','D4','D4','C4',
                  'G4','G4','F4','F4','E4','E4','D4', 'G4','G4','F4','F4','E4','E4','D4',
                  'C4','C4','G4','G4','A4','A4','G4', 'F4','F4','E4','E4','D4','D4','C4'],
          hold:   [1,1,1,1,1,1,2, 1,1,1,1,1,1,2, 1,1,1,1,1,1,2, 1,1,1,1,1,1,2, 1,1,1,1,1,1,2, 1,1,1,1,1,1,2] },
        { id: 'birthday', title: 'Срећан ти рођендан', emoji: '🎂', tempo: 500,
          speech: 'Срећан ти рођендан',
          notes: ['C4','C4','D4','C4','F4','E4', 'C4','C4','D4','C4','G4','F4',
                  'C4','C4','C5','A4','F4','E4','D4', 'B4','B4','A4','F4','G4','F4'],
          hold:   [1,1,1,1,1,2, 1,1,1,1,1,2, 1,1,1,1,1,1,2, 1,1,1,1,1,2] },
        { id: 'jingle', title: 'Џингл белс', emoji: '🔔', tempo: 500,
          speech: 'Џингл белс',
          notes: ['E4','E4','E4', 'E4','E4','E4', 'E4','G4','C5','D4','E4',
                  'F4','F4','F4','F4','F4','E4','E4','E4','E4','E4','D4','D4','E4','D4','G4'],
          hold:   [1,1,2, 1,1,2, 1,1,1,1,2, 1,1,1,1,1,1,1,1,1,1,1,1,1,1,2] }
    ];

    const $ = id => document.getElementById(id);
    let mode = 'free';
    let songIndex = 0;
    let songStep = 0;
    let playingPreview = false;
    let previewTimers = [];
    let keys = [];
    let chips = [];
    let hintTimer = null;
    let goodTimer = null;
    let goodKey = null;

    function song() { return SONGS[songIndex]; }

    function stepNote() { return NOTE_INDEX[song().notes[songStep]]; }

    function noteDuration(i) { return (song().hold[i] || 1) * song().tempo / 1000; }

    function playNote(i) {
        if (window.tone) window.tone(KEY_FREQS[i], 1.0, 0, 'triangle');
        const k = keys[i];
        k.classList.remove('hit');
        void k.offsetWidth;
        k.classList.add('hit');
        // Drop .hit once its one-shot pop is done, otherwise it would keep shadowing the
        // .lit pulse (both rules set `animation`, and .hit comes later in the stylesheet).
        setTimeout(() => k.classList.remove('hit'), 350);
    }

    // Brief positive highlight on a correct press (kept off box-shadow so it never
    // fights the pulsing .lit glow on the same key).
    function flashGood(i) {
        if (goodKey) goodKey.classList.remove('good');
        const k = keys[i];
        goodKey = k;
        k.classList.add('good');
        clearTimeout(goodTimer);
        goodTimer = setTimeout(() => {
            k.classList.remove('good');
            if (goodKey === k) goodKey = null;
        }, 500);
    }

    // Wrong press: no error sound, no shake, no red text — the light just pulses
    // again on the key we are waiting for.
    function pointAtLight() {
        const i = stepNote();
        if (i === undefined) return;
        const k = keys[i];
        k.classList.remove('hint');
        void k.offsetWidth;
        k.classList.add('hint');
        clearTimeout(hintTimer);
        hintTimer = setTimeout(() => k.classList.remove('hint'), 1400);
    }

    function clearLit() {
        keys.forEach(k => k.classList.remove('lit', 'hint'));
        clearTimeout(hintTimer);
    }

    function lit(i) {
        keys.forEach(k => k.classList.remove('lit', 'hint'));
        keys[i].classList.add('lit');
    }

    function stopPreview() {
        playingPreview = false;
        previewTimers.forEach(clearTimeout);
        previewTimers = [];
        $('pianoPreview').textContent = '🔊 Чуј песму';
        clearLit();
        if (mode === 'song' && songStep < song().notes.length) lit(stepNote());
    }

    function startPreview() {
        stopPreview();
        playingPreview = true;
        $('pianoPreview').textContent = '🔇 Стоп';
        const notes = song().notes;
        let t = 0;
        notes.forEach((note, idx) => {
            const dur = noteDuration(idx);
            previewTimers.push(setTimeout(() => { lit(NOTE_INDEX[note]); playNote(NOTE_INDEX[note]); }, t * 1000));
            t += dur;
        });
        previewTimers.push(setTimeout(() => { playingPreview = false; $('pianoPreview').textContent = '🔊 Чуј песму'; clearLit(); }, t * 1000 + 300));
    }

    function advanceSong() {
        if (songStep >= song().notes.length) { finishSong(); return; }
        $('pianoCounter').textContent = (songStep + 1) + ' од ' + song().notes.length;
        lit(stepNote());
        playNote(stepNote());
    }

    function onKeyTap(i) {
        if (playingPreview) stopPreview();
        if (mode === 'free') { playNote(i); return; }
        if (mode !== 'song') return;
        if (i === stepNote()) {
            playNote(i);
            flashGood(i);
            $('pianoFeedback').textContent = '';
            songStep++;
            setTimeout(advanceSong, 250);
        } else {
            pointAtLight();
            $('pianoFeedback').textContent = 'Светли ти овде 🎵';
        }
    }

    function finishSong() {
        clearLit();
        $('pianoFeedback').textContent = '';
        $('pianoFinishSub').textContent = 'Одсвирао си свих ' + song().notes.length + ' ноте!';
        if (window.celebrate) window.celebrate('🎹');
        $('pianoFinish').classList.add('show');
        $('pianoFinish').setAttribute('aria-hidden', 'false');
    }

    function resetSong() {
        $('pianoFinish').classList.remove('show');
        $('pianoFinish').setAttribute('aria-hidden', 'true');
        songStep = 0;
        setMode('song');
    }

    function announceSong() {
        if (window.speech && song().speech) window.speech.speak(song().speech);
    }

    function setSong(i) {
        songIndex = i;
        songStep = 0;
        stopPreview();
        chips.forEach((c, k) => c.classList.toggle('on', k === i));
        if (mode === 'song') { advanceSong(); announceSong(); }
    }

    function setMode(m) {
        mode = m;
        stopPreview();
        $('modeFree').classList.toggle('on', m === 'free');
        $('modeSong').classList.toggle('on', m === 'song');
        $('songInfo').classList.toggle('show', m === 'song');
        clearLit();
        $('pianoFeedback').textContent = '';
        if (m === 'song') { songStep = 0; advanceSong(); announceSong(); }
    }

    window.startPiano = function () {
        const keysEl = $('pianoKeys');
        keysEl.innerHTML = '';
        keys = NOTES.map((n, i) => {
            const k = document.createElement('button');
            k.className = 'piano-key';
            k.style.setProperty('--kcolor', KEY_COLORS[i]);
            k.setAttribute('aria-label', n);
            const span = document.createElement('span');
            span.className = 'k-note';
            span.textContent = n;
            k.appendChild(span);
            k.addEventListener('click', () => onKeyTap(i));
            keysEl.appendChild(k);
            return k;
        });

        const chipsEl = $('songChips');
        chipsEl.innerHTML = '';
        chips = SONGS.map((s, i) => {
            const c = document.createElement('button');
            c.className = 'song-chip';
            if (i === 0) c.classList.add('on');
            c.dataset.song = s.id;
            c.textContent = s.emoji;
            c.setAttribute('aria-label', s.title);
            c.addEventListener('click', () => setSong(i));
            chipsEl.appendChild(c);
            return c;
        });

        $('modeFree').addEventListener('click', () => setMode('free'));
        $('modeSong').addEventListener('click', () => setMode('song'));
        $('pianoPreview').addEventListener('click', () => { if (playingPreview) stopPreview(); else startPreview(); });
        $('pianoReplay').addEventListener('click', resetSong);
        setMode('free');
    };
}());
