/* Клавир — free play + follow-the-melody song mode ("Свирај песму"). */
(function () {
    const KEY_FREQS = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];
    const KEY_COLORS = ['#FF6F91', '#FFA94D', '#FFD23F', '#67C971', '#4FC3F7', '#9B6DFF', '#C56CF0', '#FF6F91'];
    const NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C'];
    // Keyboard indices: C=0 D=1 E=2 F=3 G=4 A=5 B=6 high-C=7.
    // Each song: notes = keyboard indices, rhythm = relative note lengths (same length as notes).
    const SONGS = [
        { id: 'twinkle', title: 'Трепери, трепери звездице', emoji: '⭐',
          notes: [0,0,4,4,5,5,4, 3,3,2,2,1,1,0, 4,4,3,3,2,2,1, 4,4,3,3,2,2,1, 0,0,4,4,5,5,4, 3,3,2,2,1,1,0],
          rhythm: [1,1,1,1,1,1,2, 1,1,1,1,1,1,2, 1,1,1,1,1,1,2, 1,1,1,1,1,1,2, 1,1,1,1,1,1,2, 1,1,1,1,1,1,2] },
        { id: 'birthday', title: 'Срећан ти рођендан', emoji: '🎂',
          notes: [0,0,1,0,3,2, 0,0,1,0,4,3, 0,0,7,5,3,2,1, 6,6,5,3,4,3],
          rhythm: [1,1,1,1,1,2, 1,1,1,1,1,2, 1,1,1,1,1,1,2, 1,1,1,1,1,2] },
        { id: 'jingle', title: 'Џингл белс', emoji: '🔔',
          notes: [2,2,2, 2,2,2, 2,4,7,1,2, 3,3,3,3,3,2,2,2,2,2,1,1,2,1,4],
          rhythm: [1,1,2, 1,1,2, 1,1,1,1,2, 1,1,1,1,1,1,1,1,1,1,1,1,1,1,2] }
    ];

    const $ = id => document.getElementById(id);
    let mode = 'free';
    let songIndex = 0;
    let songStep = 0;
    let playingPreview = false;
    let previewTimers = [];
    let keys = [];
    let chips = [];

    function song() { return SONGS[songIndex]; }

    function noteDuration(i) { return song().rhythm[i] * 0.5; }

    function playNote(i) {
        if (window.tone) window.tone(KEY_FREQS[i], 1.0, 0, 'triangle');
        const k = keys[i];
        k.classList.remove('hit');
        void k.offsetWidth;
        k.classList.add('hit');
    }

    function clearLit() { keys.forEach(k => k.classList.remove('lit')); }

    function lit(i) { clearLit(); keys[i].classList.add('lit'); }

    function stopPreview() {
        playingPreview = false;
        previewTimers.forEach(clearTimeout);
        previewTimers = [];
        $('pianoPreview').textContent = '🔊 Чуј песму';
        clearLit();
        if (mode === 'song' && songStep < song().notes.length) lit(song().notes[songStep]);
    }

    function startPreview() {
        stopPreview();
        playingPreview = true;
        $('pianoPreview').textContent = '🔇 Стоп';
        const notes = song().notes;
        let t = 0;
        notes.forEach((note, idx) => {
            const dur = noteDuration(idx);
            previewTimers.push(setTimeout(() => { lit(note); playNote(note); }, t * 1000));
            t += dur;
        });
        previewTimers.push(setTimeout(() => { playingPreview = false; $('pianoPreview').textContent = '🔊 Чуј песму'; clearLit(); }, t * 1000 + 300));
    }

    function advanceSong() {
        const notes = song().notes;
        if (songStep >= notes.length) { finishSong(); return; }
        $('pianoCounter').textContent = (songStep + 1) + ' од ' + notes.length;
        lit(notes[songStep]);
        playNote(notes[songStep]);
    }

    function onKeyTap(i) {
        if (playingPreview) stopPreview();
        if (mode === 'free') { playNote(i); return; }
        if (mode !== 'song') return;
        const notes = song().notes;
        if (i === notes[songStep]) {
            playNote(i);
            $('pianoFeedback').textContent = '';
            songStep++;
            setTimeout(advanceSong, 250);
        } else {
            if (window.gentleMiss) window.gentleMiss();
            const k = keys[i];
            k.classList.remove('shake');
            void k.offsetWidth;
            k.classList.add('shake');
            $('pianoFeedback').textContent = 'Покушај још једном!';
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

    function setSong(i) {
        songIndex = i;
        songStep = 0;
        stopPreview();
        chips.forEach((c, k) => c.classList.toggle('on', k === i));
        if (mode === 'song') advanceSong();
    }

    function setMode(m) {
        mode = m;
        stopPreview();
        $('modeFree').classList.toggle('on', m === 'free');
        $('modeSong').classList.toggle('on', m === 'song');
        $('songInfo').classList.toggle('show', m === 'song');
        clearLit();
        $('pianoFeedback').textContent = '';
        if (m === 'song') { songStep = 0; advanceSong(); }
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
