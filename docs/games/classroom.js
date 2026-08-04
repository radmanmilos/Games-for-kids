/* ---------------- УЧИОНИЦА (CLASSROOM) ---------------- */
/* Hub with 4 learning activities: Азбука, Бројеви, Облици, Боје.
   Tap a tile to speak it (and show a picture); autoplay button walks through
   tiles one by one, slowly, so the child can repeat the words. No celebrate —
   the goal is learn + repeat. All text is Serbian Cyrillic. */
(function () {
  const AUTOPLAY_PAUSE = 1500;

  const ALPHABET = [
    { label: 'А', name: 'а', word: 'Аутомобил', emoji: '🚗' },
    { label: 'Б', name: 'б', word: 'Банана', emoji: '🍌' },
    { label: 'В', name: 'в', word: 'Вук', emoji: '🐺' },
    { label: 'Г', name: 'г', word: 'Гусеница', emoji: '🐛' },
    { label: 'Д', name: 'д', word: 'Дрво', emoji: '🌳' },
    { label: 'Ђ', name: 'ђ', word: 'Ђак', emoji: '🧑‍🎓' },
    { label: 'Е', name: 'е', word: 'Екран', emoji: '🖥️' },
    { label: 'Ж', name: 'ж', word: 'Жаба', emoji: '🐸' },
    { label: 'З', name: 'з', word: 'Звезда', emoji: '⭐' },
    { label: 'И', name: 'и', word: 'Игла', emoji: '🪡' },
    { label: 'Ј', name: 'ј', word: 'Јабука', emoji: '🍎' },
    { label: 'К', name: 'к', word: 'Крава', emoji: '🐮' },
    { label: 'Л', name: 'л', word: 'Лав', emoji: '🦁' },
    { label: 'Љ', name: 'љ', word: 'Љубав', emoji: '❤️' },
    { label: 'М', name: 'м', word: 'Мачка', emoji: '🐱' },
    { label: 'Н', name: 'н', word: 'Нос', emoji: '👃' },
    { label: 'Њ', name: 'њ', word: 'Њушка', emoji: '🐽' },
    { label: 'О', name: 'о', word: 'Око', emoji: '👁️' },
    { label: 'П', name: 'п', word: 'Пас', emoji: '🐶' },
    { label: 'Р', name: 'р', word: 'Риба', emoji: '🐟' },
    { label: 'С', name: 'с', word: 'Слон', emoji: '🐘' },
    { label: 'Т', name: 'т', word: 'Торта', emoji: '🎂' },
    { label: 'Ћ', name: 'ћ', word: 'Ћуран', emoji: '🦃' },
    { label: 'У', name: 'у', word: 'Уво', emoji: '👂' },
    { label: 'Ф', name: 'ф', word: 'Фламинго', emoji: '🦩' },
    { label: 'Х', name: 'х', word: 'Хеликоптер', emoji: '🚁' },
    { label: 'Ц', name: 'ц', word: 'Цвет', emoji: '🌼' },
    { label: 'Ч', name: 'ч', word: 'Чамац', emoji: '⛵' },
    { label: 'Џ', name: 'џ', word: 'Џемпер', emoji: '🧥' },
    { label: 'Ш', name: 'ш', word: 'Шешир', emoji: '🎩' },
  ];

  const NUMBERS = [
    { label: '0', name: 'нула', sentence: 'Нула', emoji: '', count: 0 },
    { label: '1', name: 'један', sentence: 'Један пас', emoji: '🐶', count: 1 },
    { label: '2', name: 'два', sentence: 'Два пса', emoji: '🐶', count: 2 },
    { label: '3', name: 'три', sentence: 'Три мачке', emoji: '🐱', count: 3 },
    { label: '4', name: 'четири', sentence: 'Четири краве', emoji: '🐮', count: 4 },
    { label: '5', name: 'пет', sentence: 'Пет слонова', emoji: '🐘', count: 5 },
    { label: '6', name: 'шест', sentence: 'Шест лавова', emoji: '🦁', count: 6 },
    { label: '7', name: 'седам', sentence: 'Седам патака', emoji: '🦆', count: 7 },
    { label: '8', name: 'осам', sentence: 'Осам коња', emoji: '🐴', count: 8 },
    { label: '9', name: 'девет', sentence: 'Девет жаба', emoji: '🐸', count: 9 },
    { label: '10', name: 'десет', sentence: 'Десет свиња', emoji: '🐷', count: 10 },
  ];

  const SHAPE_SVGS = {
    lopta: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="42" fill="#FF6F91"/><ellipse cx="35" cy="36" rx="15" ry="10" fill="rgba(255,255,255,.5)"/></svg>',
    kocka: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><polygon points="50,10 88,29 50,48 12,29" fill="#A67BFF"/><polygon points="12,29 50,48 50,90 12,71" fill="#8A55E8"/><polygon points="50,48 88,29 88,71 50,90" fill="#9B6DFF"/></svg>',
    kvadar: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><polygon points="26,20 76,32 76,70 26,82" fill="#4FC3F7"/><polygon points="26,20 76,32 84,26 34,14" fill="#7FD7FF"/><polygon points="76,32 84,26 84,64 76,70" fill="#2FA6DA"/></svg>',
    valjak: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="50" cy="25" rx="32" ry="13" fill="#FFD23F"/><rect x="18" y="25" width="64" height="46" fill="#F0BE3E"/><ellipse cx="50" cy="71" rx="32" ry="13" fill="#FFE07A"/><rect x="66" y="25" width="16" height="46" fill="rgba(0,0,0,.12)"/></svg>',
    kupa: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><polygon points="50,6 16,66 84,66" fill="#FF8C42"/><ellipse cx="50" cy="66" rx="34" ry="13" fill="#FF6F91"/><polygon points="50,6 84,66 50,66" fill="rgba(255,255,255,.2)"/></svg>',
    piramida: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><polygon points="50,6 14,74 86,74" fill="#57B663"/><polygon points="50,6 86,74 50,86" fill="#4FA85A"/><polygon points="50,6 14,74 50,86" fill="#67C971"/></svg>',
  };

  const SHAPES = [
    { name: 'Круг', emoji: '🔵' },
    { name: 'Квадрат', emoji: '🟪' },
    { name: 'Троугао', emoji: '🔺' },
    { name: 'Звезда', emoji: '⭐' },
    { name: 'Лопта', svg: SHAPE_SVGS.lopta },
    { name: 'Коцка', svg: SHAPE_SVGS.kocka },
    { name: 'Квадар', svg: SHAPE_SVGS.kvadar },
    { name: 'Ваљак', svg: SHAPE_SVGS.valjak },
    { name: 'Купа', svg: SHAPE_SVGS.kupa },
    { name: 'Пирамида', svg: SHAPE_SVGS.piramida },
  ];

  const COLORS = [
    { name: 'Црвена', hex: '#FF4F5E' },
    { name: 'Наранџаста', hex: '#FF8C42' },
    { name: 'Жута', hex: '#FFD23F' },
    { name: 'Зелена', hex: '#67C971' },
    { name: 'Плава', hex: '#4FC3F7' },
    { name: 'Љубичаста', hex: '#9B6DFF' },
    { name: 'Розе', hex: '#FF6F91' },
    { name: 'Браон', hex: '#8B5E3C' },
    { name: 'Сива', hex: '#9AA5B1' },
    { name: 'Бела', hex: '#FFFFFF' },
    { name: 'Црна', hex: '#3A3A3A' },
  ];

  const TILE_PASTELS = ['#FFE9EF', '#E9F4FF', '#FFF4D6', '#E8F7E6', '#F1EBFF', '#FFEFE0', '#E4F7FB', '#FBEAF6'];

  const ACTIVITIES = {
    alphabet: { title: 'Азбука', items: ALPHABET },
    numbers: { title: 'Бројеви', items: NUMBERS },
    shapes: { title: 'Облици', items: SHAPES },
    colors: { title: 'Боје', items: COLORS },
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
      if (window.speech && window.speech.speak) window.speech.speak(text, next);
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
  }

  window.classroomData = { alphabet: ALPHABET, numbers: NUMBERS, shapes: SHAPES, colors: COLORS };
  window.startClassroom = startClassroom;
}());
