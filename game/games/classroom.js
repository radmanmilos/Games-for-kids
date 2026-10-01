/* ---------------- УЧИОНИЦА (CLASSROOM) ---------------- */
/* Hub with 4 learning activities: Азбука, Бројеви, Облици, Боје.
   Tap a tile to speak it (and show a picture); autoplay button walks through
   tiles one by one, slowly, so the child can repeat the words. No celebrate —
   the goal is learn + repeat. All text is Serbian Cyrillic. */
(function () {
  const AUTOPLAY_PAUSE = 1500;

  const SHAPE_SVGS = {
    lopta: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="42" fill="#FF6F91"/><ellipse cx="35" cy="36" rx="15" ry="10" fill="rgba(255,255,255,.5)"/></svg>',
    kocka: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><polygon points="50,10 88,29 50,48 12,29" fill="#A67BFF"/><polygon points="12,29 50,48 50,90 12,71" fill="#8A55E8"/><polygon points="50,48 88,29 88,71 50,90" fill="#9B6DFF"/></svg>',
    kvadar: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><polygon points="26,20 76,32 76,70 26,82" fill="#4FC3F7"/><polygon points="26,20 76,32 84,26 34,14" fill="#7FD7FF"/><polygon points="76,32 84,26 84,64 76,70" fill="#2FA6DA"/></svg>',
    valjak: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="50" cy="25" rx="32" ry="13" fill="#FFD23F"/><rect x="18" y="25" width="64" height="46" fill="#F0BE3E"/><ellipse cx="50" cy="71" rx="32" ry="13" fill="#FFE07A"/><rect x="66" y="25" width="16" height="46" fill="rgba(0,0,0,.12)"/></svg>',
    kupa: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><polygon points="50,6 16,66 84,66" fill="#FF8C42"/><ellipse cx="50" cy="66" rx="34" ry="13" fill="#FF6F91"/><polygon points="50,6 84,66 50,66" fill="rgba(255,255,255,.2)"/></svg>',
    piramida: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><polygon points="50,6 14,74 86,74" fill="#57B663"/><polygon points="50,6 86,74 50,86" fill="#4FA85A"/><polygon points="50,6 14,74 50,86" fill="#67C971"/></svg>',
  };

  const SHAPE_PRESENTATION = [
    { emoji: '🔵' },
    { emoji: '🟪' },
    { emoji: '🔺' },
    { emoji: '⭐' },
    { svg: SHAPE_SVGS.lopta },
    { svg: SHAPE_SVGS.kocka },
    { svg: SHAPE_SVGS.kvadar },
    { svg: SHAPE_SVGS.valjak },
    { svg: SHAPE_SVGS.kupa },
    { svg: SHAPE_SVGS.piramida },
  ];
  const ALPHABET = SERBIAN.alphabet;
  const NUMBERS = SERBIAN.numbers;
  const SHAPES = SERBIAN.shapes.map((name, index) => ({ name, ...SHAPE_PRESENTATION[index] }));
  const COLORS = SERBIAN.colors;

  const TILE_PASTELS = ['#FFE9EF', '#E9F4FF', '#FFF4D6', '#E8F7E6', '#F1EBFF', '#FFEFE0', '#E4F7FB', '#FBEAF6'];

  const ACTIVITIES = {
    alphabet: { title: SERBIAN.classroom.activities.alphabet, items: ALPHABET },
    numbers: { title: SERBIAN.classroom.activities.numbers, items: NUMBERS },
    shapes: { title: SERBIAN.classroom.activities.shapes, items: SHAPES },
    colors: { title: SERBIAN.classroom.activities.colors, items: COLORS },
  };

  let currentActivity = null;
  let autoplayActive = false;
  let autoplayIndex = 0;
  let autoplayTimer = null;

  const $ = id => document.getElementById(id);

  function speakPhrase(phrases, onDone) {
    let i = 0;
    const next = () => {
      if (i >= phrases.length) { if (onDone) onDone(); return; }
      const text = phrases[i++];
      if (window.audioBuses) window.audioBuses.speakWithDuck(text, next);
      else if (window.speech && window.speech.speak) window.speech.speak(text, next);
      else next();
    };
    next();
  }

  function tileFor(item, kind, index) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'class-tile' + (kind === 'shapes' || kind === 'colors' ? ' pict' : '');
    btn.setAttribute('aria-label', item.word || item.name || item.label);
    if (kind === 'colors') {
      btn.style.background = item.hex;
      btn.style.border = '.6vmin solid rgba(74,63,107,.35)';
    } else {
      btn.style.background = TILE_PASTELS[index % TILE_PASTELS.length];
    }
    btn.textContent = kind === 'colors' ? '' : (item.emoji && kind === 'shapes') ? item.emoji : (item.label || item.emoji);
    if (item.svg) btn.innerHTML = item.svg;
    btn.addEventListener('click', () => {
      if (window.popSound) window.popSound();
      stopAutoplay();
      activateItem(item);
    });
    return btn;
  }

  function buildGrid() {
    const grid = $('activityGrid');
    grid.innerHTML = '';
    const kind = currentActivity;
    ACTIVITIES[kind].items.forEach((item, i) => grid.appendChild(tileFor(item, kind, i)));
  }

  function phrasesFor(item) {
    if (currentActivity === 'alphabet') return [item.name, item.word];
    if (currentActivity === 'numbers') return [item.name, item.sentence];
    return [item.name];
  }

  function renderDisplay(item) {
    const d = $('activityShowcase');
    const c = $('activityCaption');
    if (currentActivity === 'alphabet') {
      d.innerHTML = '<div class="show-big">' + item.label + '</div><div class="show-emoji">' + item.emoji + '</div>';
      c.textContent = item.word;
    } else if (currentActivity === 'numbers') {
      let row = '<div class="show-big">' + item.label + '</div>';
      if (item.count > 0) {
        let spans = '';
        for (let i = 0; i < item.count; i++) spans += '<span>' + item.emoji + '</span>';
        row += '<div class="show-emoji-row">' + spans + '</div>';
      }
      d.innerHTML = row;
      c.textContent = item.sentence;
    } else if (currentActivity === 'shapes') {
      d.innerHTML = item.svg ? '<div class="show-svg">' + item.svg + '</div>' : '<div class="show-emoji">' + item.emoji + '</div>';
      c.textContent = item.name;
    } else if (currentActivity === 'colors') {
      d.innerHTML = '<div class="show-color" style="background:' + item.hex + '"></div>';
      c.textContent = item.name;
    }
  }

  function activateItem(item, onDone) {
    renderDisplay(item);
    speakPhrase(phrasesFor(item), onDone);
  }

  function enterActivity(kind) {
    stopAutoplay();
    currentActivity = kind;
    $('classroomTitle').hidden = true;
    $('classroomHub').hidden = true;
    $('classroomActivity').hidden = false;
    $('classroomAutoplay').hidden = false;
    $('activityTitle').textContent = ACTIVITIES[kind].title;
    $('activityShowcase').innerHTML = '';
    $('activityCaption').textContent = 'Додирни сличицу!';
    buildGrid();
    updateTabs();
  }

  function enterKidsGame(kind) {
    stopAutoplay();
    currentActivity = 'kids';
    $('classroomTitle').hidden = true;
    $('classroomHub').hidden = true;
    $('classroomActivity').hidden = true;
    $('classroomAutoplay').hidden = true;
    $('kidsGame').hidden = false;
    if (window.kidsGame && window.kidsGame.start) window.kidsGame.start(kind);
  }

  function leaveKidsGame() {
    stopAutoplay();
    currentActivity = null;
    $('kidsGame').hidden = true;
    $('classroomTitle').hidden = false;
    $('classroomHub').hidden = false;
  }

  function leaveActivity() {
    stopAutoplay();
    currentActivity = null;
    $('classroomActivity').hidden = true;
    $('classroomTitle').hidden = false;
    $('classroomHub').hidden = false;
    $('classroomAutoplay').hidden = true;
  }

  function setAutoplayBtn(running) {
    const btn = $('classroomAutoplay');
    btn.textContent = running ? '⏸' : '▶';
    btn.classList.toggle('running', running);
    btn.setAttribute('aria-label', running ? 'Заустави' : 'Аутоматски приказ');
  }

  function startAutoplay() {
    if (!currentActivity) return;
    autoplayActive = true;
    autoplayIndex = 0;
    setAutoplayBtn(true);
    autoplayStep();
  }

  function stopAutoplay() {
    autoplayActive = false;
    clearTimeout(autoplayTimer);
    if ($('classroomAutoplay')) setAutoplayBtn(false);
  }

  function autoplayStep() {
    if (!autoplayActive) return;
    const items = ACTIVITIES[currentActivity].items;
    const item = items[autoplayIndex % items.length];
    activateItem(item, () => {
      if (!autoplayActive) return;
      autoplayTimer = setTimeout(() => {
        autoplayIndex = (autoplayIndex + 1) % items.length;
        autoplayStep();
      }, AUTOPLAY_PAUSE);
    });
  }

  function updateTabs() {
    document.querySelectorAll('.class-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === currentActivity);
    });
  }

  function startClassroom() {
    document.querySelectorAll('#classroomHub .activity-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (window.popSound) window.popSound();
        enterActivity(btn.dataset.activity);
      });
    });
    document.querySelectorAll('#classroomHub .kids-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (window.popSound) window.popSound();
        enterKidsGame(btn.dataset.kids);
      });
    });
    $('classroomBack').addEventListener('click', () => {
      if (window.popSound) window.popSound();
      leaveActivity();
    });
    $('kidsBack').addEventListener('click', () => {
      if (window.popSound) window.popSound();
      leaveKidsGame();
    });
    $('classroomAutoplay').addEventListener('click', () => {
      if (window.popSound) window.popSound();
      if (autoplayActive) stopAutoplay();
      else startAutoplay();
    });
    document.querySelectorAll('.class-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        if (window.popSound) window.popSound();
        enterActivity(tab.dataset.tab);
      });
    });
  }

  window.classroomData = { alphabet: ALPHABET, numbers: NUMBERS, shapes: SHAPES, colors: COLORS };
  window.startClassroom = startClassroom;
}());
