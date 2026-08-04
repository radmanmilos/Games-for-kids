/* ---------------- УЧИОНИЦА "ЗА ДЕЦУ" (KIDS TIER) ---------------- */
/* Forgiving multiple-choice quiz engine + 4 content configs (Азбука, Бројеви,
   Боје, Облици за децу). Hear the target, pick the matching tile among 4.
   Reuses Учионица data (window.classroomData), speech MP3s, and celebrate().
   Correct -> pop + bounce + speak again, advance; wrong -> gentle miss + shake,
   same question (no punishment). Short session (8), then 🏅 + replay/back. */
(function () {
  const Q = id => document.getElementById(id);
  const SESSION = 8;
  const OPTIONS = 4;

  const CONFIG = {
    alphabet: {
      title: 'Азбука за децу', dataKey: 'alphabet', question: 'Које је ово слово?',
      speakOf: it => it.name,
      tile: it => '<span class="kids-glyph">' + it.label + '</span>',
    },
    numbers: {
      title: 'Бројеви за децу', dataKey: 'numbers', question: 'Колико има?',
      speakOf: it => it.name,
      tile: it => '<span class="kids-glyph">' + it.label + '</span>',
      countRow: true,
    },
    colors: {
      title: 'Боје за децу', dataKey: 'colors', question: 'Која је ово боја?',
      speakOf: it => it.name,
      swatch: it => it.hex,
      tile: () => '',
    },
    shapes: {
      title: 'Облици за децу', dataKey: 'shapes', question: 'Који је ово облик?',
      speakOf: it => it.name,
      tile: it => it.svg ? '<span class="kids-shape">' + it.svg + '</span>' : '<span class="kids-glyph">' + it.emoji + '</span>',
    },
  };

  let kind = null;
  let session = [];
  let index = 0;
  let correct = 0;
  let busy = false;

  function start(k) {
    kind = k;
    const cfg = CONFIG[k];
    let pool = window.classroomData[cfg.dataKey].slice();
    if (k === 'numbers') pool = pool.filter(it => it.count > 0);
    session = window.shuffle(pool).slice(0, SESSION);
    index = 0;
    correct = 0;
    busy = false;
    Q('kidsTitle').textContent = cfg.title;
    Q('kidsFinished').hidden = true;
    Q('kidsFeedback').textContent = '';
    showQuestion();
  }

  function showQuestion() {
    const cfg = CONFIG[kind];
    const item = session[index];
    busy = false;
    let prompt = '<div class="kids-question">' + cfg.question + '</div>';
    if (cfg.countRow) {
      let spans = '';
      for (let i = 0; i < item.count; i++) spans += '<span>' + item.emoji + '</span>';
      prompt += '<div class="kids-count-row">' + spans + '</div>';
    } else {
      prompt += '<div class="kids-sound">🔊</div>';
    }
    Q('kidsPrompt').innerHTML = prompt;
    const pool = window.classroomData[cfg.dataKey];
    const distractors = window.shuffle(pool.filter(p => p !== item)).slice(0, OPTIONS - 1);
    const options = window.shuffle([item].concat(distractors));
    const optsEl = Q('kidsOptions');
    optsEl.innerHTML = '';
    options.forEach(o => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'kids-option' + (o === item ? ' is-answer' : '');
      b.setAttribute('aria-label', o.name || o.label);
      if (cfg.swatch) b.style.background = cfg.swatch(o);
      b.innerHTML = cfg.tile(o);
      b.addEventListener('click', () => pick(b, o === item));
      optsEl.appendChild(b);
    });
    Q('kidsProgress').textContent = (index + 1) + ' од ' + session.length;
    Q('kidsFeedback').textContent = '';
    window.speech.speak(cfg.speakOf(item));
  }

  function pick(btn, isAnswer) {
    if (busy) return;
    if (isAnswer) {
      busy = true;
      correct++;
      if (window.popSound) window.popSound();
      btn.classList.add('correct');
      Q('kidsFeedback').textContent = 'Тачно!';
      window.speech.speak(CONFIG[kind].speakOf(session[index]));
      setTimeout(() => {
        index++;
        if (index >= session.length) finish();
        else showQuestion();
      }, 750);
    } else {
      if (window.gentleMiss) window.gentleMiss();
      btn.classList.add('wrong');
      setTimeout(() => btn.classList.remove('wrong'), 450);
      Q('kidsFeedback').textContent = 'Покушај још једном!';
    }
  }

  function finish() {
    if (window.celebrate) window.celebrate('🏅');
    Q('kidsFinishedSub').textContent = correct + ' од ' + session.length + ' тачно!';
    Q('kidsFinished').hidden = false;
  }

  Q('kidsPrompt').addEventListener('click', () => {
    if (busy || !session.length) return;
    window.speech.speak(CONFIG[kind].speakOf(session[index]));
  });
  Q('kidsReplay').addEventListener('click', () => {
    if (window.popSound) window.popSound();
    start(kind);
  });
  Q('kidsExit').addEventListener('click', () => {
    if (window.popSound) window.popSound();
    const b = Q('kidsBack');
    if (b) b.click();
  });

  window.kidsGame = {
    start,
    exit: () => { const b = Q('kidsBack'); if (b) b.click(); },
  };
}());
