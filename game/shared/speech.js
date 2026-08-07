(function () {
    const assetRoot = /\/pages\//.test(location.pathname) ? '../' : '';
    const speechFiles = {
        'Браво!': 'assets/audio/speech/bravo.mp3',
        'Пас': 'assets/audio/speech/pas.mp3',
        'Мачка': 'assets/audio/speech/macka.mp3',
        'Крава': 'assets/audio/speech/krava.mp3',
        'Лав': 'assets/audio/speech/lav.mp3',
        'Слон': 'assets/audio/speech/slon.mp3',
        'Жаба': 'assets/audio/speech/zaba.mp3',
        'Свиња': 'assets/audio/speech/svinja.mp3',
        'Патка': 'assets/audio/speech/patka.mp3',
        'Лисица': 'assets/audio/speech/lisica.mp3',
        'Овца': 'assets/audio/speech/ovca.mp3',
        'Коњ': 'assets/audio/speech/konj.mp3',
        'Кока': 'assets/audio/speech/koka.mp3',
        'Круг': 'assets/audio/speech/krug.mp3',
        'Квадрат': 'assets/audio/speech/kvadrat.mp3',
        'Троугао': 'assets/audio/speech/trougao.mp3',
        'Звезда': 'assets/audio/speech/zvezda.mp3',
        'један': 'assets/audio/speech/jedan.mp3',
        'два': 'assets/audio/speech/dva.mp3',
        'три': 'assets/audio/speech/tri.mp3',
        'четири': 'assets/audio/speech/cetiri.mp3',
        'пет': 'assets/audio/speech/pet.mp3',
        'шест': 'assets/audio/speech/sest.mp3',
        'седам': 'assets/audio/speech/sedam.mp3',
        'осам': 'assets/audio/speech/osam.mp3',
        'девет': 'assets/audio/speech/devet.mp3',
        'десет': 'assets/audio/speech/deset.mp3',
        // Учионица: letter sounds (30)
        'а': 'assets/audio/speech/a.mp3', 'б': 'assets/audio/speech/b.mp3', 'в': 'assets/audio/speech/v.mp3',
        'г': 'assets/audio/speech/g.mp3', 'д': 'assets/audio/speech/d.mp3', 'ђ': 'assets/audio/speech/dj.mp3',
        'е': 'assets/audio/speech/e.mp3', 'ж': 'assets/audio/speech/zh.mp3', 'з': 'assets/audio/speech/z.mp3',
        'и': 'assets/audio/speech/i.mp3', 'ј': 'assets/audio/speech/j.mp3', 'к': 'assets/audio/speech/k.mp3',
        'л': 'assets/audio/speech/l.mp3', 'љ': 'assets/audio/speech/lj.mp3', 'м': 'assets/audio/speech/m.mp3',
        'н': 'assets/audio/speech/n.mp3', 'њ': 'assets/audio/speech/nj.mp3', 'о': 'assets/audio/speech/o.mp3',
        'п': 'assets/audio/speech/p.mp3', 'р': 'assets/audio/speech/r.mp3', 'с': 'assets/audio/speech/s.mp3',
        'т': 'assets/audio/speech/t.mp3', 'ћ': 'assets/audio/speech/cj.mp3', 'у': 'assets/audio/speech/u.mp3',
        'ф': 'assets/audio/speech/f.mp3', 'х': 'assets/audio/speech/h.mp3', 'ц': 'assets/audio/speech/c.mp3',
        'ч': 'assets/audio/speech/ch.mp3', 'џ': 'assets/audio/speech/dz.mp3', 'ш': 'assets/audio/speech/sh.mp3',
        // Учионица: alphabet words
        'Аутомобил': 'assets/audio/speech/automobil.mp3', 'Банана': 'assets/audio/speech/banana.mp3',
        'Вук': 'assets/audio/speech/vuk.mp3', 'Гусеница': 'assets/audio/speech/gusenica.mp3',
        'Дрво': 'assets/audio/speech/drvo.mp3', 'Ђак': 'assets/audio/speech/djak.mp3',
        'Екран': 'assets/audio/speech/ekran.mp3', 'Игла': 'assets/audio/speech/igla.mp3',
        'Јабука': 'assets/audio/speech/jabuka.mp3', 'Љубав': 'assets/audio/speech/ljubav.mp3',
        'Нос': 'assets/audio/speech/nos.mp3', 'Њушка': 'assets/audio/speech/njuska.mp3',
        'Око': 'assets/audio/speech/oko.mp3', 'Риба': 'assets/audio/speech/riba.mp3',
        'Торта': 'assets/audio/speech/torta.mp3', 'Ћуран': 'assets/audio/speech/cjuran.mp3',
        'Уво': 'assets/audio/speech/uvo.mp3', 'Фламинго': 'assets/audio/speech/flamingo.mp3',
        'Хеликоптер': 'assets/audio/speech/helikopter.mp3', 'Цвет': 'assets/audio/speech/cvet.mp3',
        'Чамац': 'assets/audio/speech/chamac.mp3', 'Џемпер': 'assets/audio/speech/dzemper.mp3',
        'Шешир': 'assets/audio/speech/sesir.mp3',
        // Учионица: colors
        'Црвена': 'assets/audio/speech/crvena.mp3', 'Наранџаста': 'assets/audio/speech/narandzasta.mp3',
        'Жута': 'assets/audio/speech/zuta.mp3', 'Зелена': 'assets/audio/speech/zelena.mp3',
        'Плава': 'assets/audio/speech/plava.mp3', 'Љубичаста': 'assets/audio/speech/ljubicasta.mp3',
        'Розе': 'assets/audio/speech/roze.mp3', 'Браон': 'assets/audio/speech/braon.mp3',
        'Сива': 'assets/audio/speech/siva.mp3', 'Бела': 'assets/audio/speech/bela.mp3',
        'Црна': 'assets/audio/speech/crna.mp3',
        // Учионица: 3D shapes
        'Лопта': 'assets/audio/speech/lopta.mp3', 'Коцка': 'assets/audio/speech/kocka.mp3',
        'Квадар': 'assets/audio/speech/kvadar.mp3', 'Ваљак': 'assets/audio/speech/valjak.mp3',
        'Купа': 'assets/audio/speech/kupa.mp3', 'Пирамида': 'assets/audio/speech/piramida.mp3',
        // Учионица: numbers — zero + sentences
        'нула': 'assets/audio/speech/nula.mp3', 'Нула': 'assets/audio/speech/nula.mp3',
        'Један пас': 'assets/audio/speech/jedan_pas.mp3', 'Два пса': 'assets/audio/speech/dva_psa.mp3',
        'Три мачке': 'assets/audio/speech/tri_macke.mp3', 'Четири краве': 'assets/audio/speech/cetiri_krave.mp3',
        'Пет слонова': 'assets/audio/speech/pet_slonova.mp3', 'Шест лавова': 'assets/audio/speech/sest_lavova.mp3',
        'Седам патака': 'assets/audio/speech/sedam_pataka.mp3', 'Осам коња': 'assets/audio/speech/osam_konja.mp3',
        'Девет жаба': 'assets/audio/speech/devet_zaba.mp3', 'Десет свиња': 'assets/audio/speech/deset_svinja.mp3',
        'Јао': 'assets/audio/speech/jao.mp3',
        'Јао!': 'assets/audio/speech/jao.mp3'
    };
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
    window.speech = {
        speak(text, onDone) {
            if (!text) { if (onDone) onDone(); return; }
            window.speech.cancel();
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
            // remove any pending finish listeners to avoid accumulation
            if (speechAudio._currentFinish) {
                speechAudio.removeEventListener('ended', speechAudio._currentFinish);
                speechAudio.removeEventListener('error', speechAudio._currentFinish);
                speechAudio._currentFinish = null;
            }
            speechAudio.pause();
            speechAudio.currentTime = 0;
            if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        }
    };
}());
