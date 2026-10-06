/* ---------------- УЧИОНИЦА (CLASSROOM) ---------------- */
/* Hub with 6 learning activities: Азбука, Бројеви, Облици, Боје,
   Време, Годишња доба. Tap a tile to speak it (and show a picture); autoplay
   button walks through tiles one by one, slowly, so the child can repeat the
   words. No celebrate — the goal is learn + repeat. All text is Serbian
   Cyrillic. */
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

  const TIME_SCENES = [
    { emoji: '🌅' },
    { emoji: '☀️' },
    { emoji: '🌇' },
    { emoji: '🌙' },
  ];

  const SEASON_SCENES = [
    { svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="#BFE9FF"/><circle cx="85" cy="15" r="10" fill="#FFD23F"/><path d="M0 65 Q25 45 50 65 T100 65 L100 100 L0 100 Z" fill="#67C971"/><circle cx="30" cy="75" r="5" fill="#FF6F91"/><circle cx="42" cy="82" r="5" fill="#FFD23F"/><circle cx="60" cy="76" r="5" fill="#FF6F91"/><circle cx="70" cy="83" r="5" fill="#FFD23F"/></svg>' },
    { svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="#7FDBFF"/><circle cx="20" cy="20" r="12" fill="#FFD23F"/><path d="M0 60 Q25 50 50 60 T100 60 L100 100 L0 100 Z" fill="#4FC3F7"/><rect x="0" y="62" width="100" height="8" fill="#7FD7FF"/><path d="M0 75 Q25 67 50 75 T100 75 L100 100 L0 100 Z" fill="#2FA6DA"/></svg>' },
    { svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="#FFF4D6"/><rect x="45" y="40" width="10" height="35" fill="#8B5E3C"/><circle cx="50" cy="25" r="22" fill="#FF8C42"/><circle cx="37" cy="38" r="14" fill="#FF6F91"/><circle cx="63" cy="38" r="14" fill="#FFD23F"/><circle cx="30" cy="78" r="4" fill="#FF8C42"/><circle cx="70" cy="82" r="4" fill="#FF6F91"/></svg>' },
    { svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="#E4F7FB"/><circle cx="50" cy="35" r="16" fill="#fff"/><circle cx="50" cy="60" r="13" fill="#fff"/><circle cx="50" cy="82" r="10" fill="#fff"/><circle cx="44" cy="33" r="2.5" fill="#3A3A3A"/><circle cx="56" cy="33" r="2.5" fill="#3A3A3A"/><path d="M42 42 L58 48 M42 48 L58 42" stroke="#FF8C42" stroke-width="3"/><circle cx="15" cy="20" r="5" fill="#9AA5B1"/><circle cx="85" cy="15" r="5" fill="#9AA5B1"/><circle cx="78" cy="40" r="4" fill="#9AA5B1"/></svg>' },
  ];

  const WEATHER_SCENES = [
    { svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="#7FDBFF"/><circle cx="50" cy="50" r="20" fill="#FFD23F"/><path d="M50 12 L56 26 L44 26 Z" fill="#FFD23F"/><path d="M50 88 L56 74 L44 74 Z" fill="#FFD23F"/><path d="M12 50 L26 56 L26 44 Z" fill="#FFD23F"/><path d="M88 50 L74 56 L74 44 Z" fill="#FFD23F"/><path d="M23 23 L33 33 L29 37 L19 27 Z" fill="#FFD23F"/><path d="M77 77 L67 67 L71 63 L81 73 Z" fill="#FFD23F"/><path d="M77 23 L67 33 L71 37 L81 27 Z" fill="#FFD23F"/><path d="M23 77 L33 67 L29 63 L19 73 Z" fill="#FFD23F"/></svg>' },
    { svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="#E9F4FF"/><path d="M25 45 Q15 45 15 35 Q15 25 28 25 Q32 12 50 14 Q66 12 70 25 Q85 22 85 35 Q85 45 75 45 Z" fill="#9AA5B1"/><line x1="35" y1="55" x2="27" y2="70" stroke="#4FC3F7" stroke-width="4" stroke-linecap="round"/><line x1="52" y1="55" x2="44" y2="70" stroke="#4FC3F7" stroke-width="4" stroke-linecap="round"/><line x1="69" y1="55" x2="61" y2="70" stroke="#4FC3F7" stroke-width="4" stroke-linecap="round"/></svg>' },
    { svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="#E4F7FB"/><path d="M25 45 Q15 45 15 35 Q15 25 28 25 Q32 12 50 14 Q66 12 70 25 Q85 22 85 35 Q85 45 75 45 Z" fill="#9AA5B1"/><circle cx="38" cy="66" r="5" fill="#fff" stroke="#9AA5B1" stroke-width="1"/><circle cx="62" cy="66" r="5" fill="#fff" stroke="#9AA5B1" stroke-width="1"/><circle cx="50" cy="80" r="5" fill="#fff" stroke="#9AA5B1" stroke-width="1"/></svg>' },
    { svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="#BFE9FF"/><path d="M20 30 Q55 10 80 28 Q92 36 84 42" stroke="#67C971" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M15 52 Q50 40 75 54 Q88 60 82 66" stroke="#9B6DFF" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M25 76 Q55 66 72 76" stroke="#FF8C42" stroke-width="6" fill="none" stroke-linecap="round"/><circle cx="22" cy="40" r="4" fill="#FF6F91"/><circle cx="82" cy="30" r="4" fill="#FFD23F"/></svg>' },
  ];

  const ALPHABET = SERBIAN.alphabet;
  const NUMBERS = SERBIAN.numbers;
  const SHAPES = SERBIAN.shapes.map((name, index) => ({ name, ...SHAPE_PRESENTATION[index] }));
  const COLORS = SERBIAN.colors;
  const TIME = SERBIAN.time.map((name, index) => ({ name, ...TIME_SCENES[index] }));
  /* Годишња доба is one activity: the four seasons, then the four weather
     concepts (Сунце/Киша/Снег/Ветар), all feeding the same shared speech. */
  const SEASONS = SERBIAN.seasons.map((name, index) => ({ name, ...SEASON_SCENES[index] }))
    .concat(SERBIAN.weather.map((name, index) => ({ name, ...WEATHER_SCENES[index] })));

  const TILE_PASTELS = ['#FFE9EF', '#E9F4FF', '#FFF4D6', '#E8F7E6', '#F1EBFF', '#FFEFE0', '#E4F7FB', '#FBEAF6'];

  const ACTIVITIES = {
    alphabet: { title: SERBIAN.classroom.activities.alphabet, items: ALPHABET },
    numbers: { title: SERBIAN.classroom.activities.numbers, items: NUMBERS },
    shapes: { title: SERBIAN.classroom.activities.shapes, items: SHAPES },
    colors: { title: SERBIAN.classroom.activities.colors, items: COLORS },
    time: { title: SERBIAN.classroom.activities.time, items: TIME },
    seasons: { title: SERBIAN.classroom.activities.seasons, items: SEASONS },
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
    } else if (currentActivity === 'shapes' || currentActivity === 'time' || currentActivity === 'seasons') {
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

  window.classroomData = { alphabet: ALPHABET, numbers: NUMBERS, shapes: SHAPES, colors: COLORS, time: TIME, seasons: SEASONS };
  window.startClassroom = startClassroom;
}());
