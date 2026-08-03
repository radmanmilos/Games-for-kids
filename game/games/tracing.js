/* ---------------- ПИСАЊЕ (TRACING) ---------------- */
/* Free-drawing with closeness matching: the target letter / number / shape is
   shown on a reference card and as a dashed guide on the canvas; the child
   draws over the guide with their finger. Tapping Готово! rasterizes both onto
   a small grid (size/position normalized) and accepts the drawing when most of
   the guide is covered AND the ink stays within the guide line (nearness) —
   forgiving, but scribbles / filled blobs that merely contain the glyph fail.
   Three activities: Слова (30 Serbian Cyrillic letters), Бројеви (0–10), Облици
   (4 flat shapes only). All text Serbian. */
(function () {
  const GRID = 48;
  const MIN_INK = 40;
  const TOL_COV = 4;
  const MIN_COVER = 0.45;
  const MIN_NEAR = 0.8;
  const MAX_INK = 2000;

  const LETTERS = [
    { label: 'А', name: 'а', word: 'Аутомобил', emoji: '🚗' },
    { label: 'Б', name: 'бе', word: 'Банана', emoji: '🍌' },
    { label: 'В', name: 'ве', word: 'Вук', emoji: '🐺' },
    { label: 'Г', name: 'ге', word: 'Гусеница', emoji: '🐛' },
    { label: 'Д', name: 'де', word: 'Дрво', emoji: '🌳' },
    { label: 'Ђ', name: 'ђе', word: 'Ђак', emoji: '🧑‍🎓' },
    { label: 'Е', name: 'е', word: 'Еж', emoji: '🦔' },
    { label: 'Ж', name: 'же', word: 'Жаба', emoji: '🐸' },
    { label: 'З', name: 'зе', word: 'Звезда', emoji: '⭐' },
    { label: 'И', name: 'и', word: 'Играчка', emoji: '🧸' },
    { label: 'Ј', name: 'је', word: 'Јабука', emoji: '🍎' },
    { label: 'К', name: 'ка', word: 'Крава', emoji: '🐮' },
    { label: 'Л', name: 'ел', word: 'Лав', emoji: '🦁' },
    { label: 'Љ', name: 'ељ', word: 'Љубав', emoji: '❤️' },
    { label: 'М', name: 'ем', word: 'Мачка', emoji: '🐱' },
    { label: 'Н', name: 'ен', word: 'Нос', emoji: '👃' },
    { label: 'Њ', name: 'ењ', word: 'Њушка', emoji: '🐽' },
    { label: 'О', name: 'о', word: 'Око', emoji: '👁️' },
    { label: 'П', name: 'пе', word: 'Пас', emoji: '🐶' },
    { label: 'Р', name: 'ер', word: 'Риба', emoji: '🐟' },
    { label: 'С', name: 'ес', word: 'Слон', emoji: '🐘' },
    { label: 'Т', name: 'те', word: 'Торта', emoji: '🎂' },
    { label: 'Ћ', name: 'ће', word: 'Ћуран', emoji: '🦃' },
    { label: 'У', name: 'у', word: 'Уво', emoji: '👂' },
    { label: 'Ф', name: 'еф', word: 'Фламинго', emoji: '🦩' },
    { label: 'Х', name: 'ха', word: 'Хеликоптер', emoji: '🚁' },
    { label: 'Ц', name: 'це', word: 'Цвет', emoji: '🌼' },
    { label: 'Ч', name: 'че', word: 'Чамац', emoji: '⛵' },
    { label: 'Џ', name: 'џе', word: 'Џем', emoji: '🍓' },
    { label: 'Ш', name: 'ша', word: 'Шешир', emoji: '🎩' },
  ];

  const NUMBERS = [
    { label: '0', name: 'нула' },
    { label: '1', name: 'један' },
    { label: '2', name: 'два' },
    { label: '3', name: 'три' },
    { label: '4', name: 'четири' },
    { label: '5', name: 'пет' },
    { label: '6', name: 'шест' },
    { label: '7', name: 'седам' },
    { label: '8', name: 'осам' },
    { label: '9', name: 'девет' },
    { label: '10', name: 'десет' },
  ];

  const SHAPES = [
    { label: 'Круг', name: 'Круг', shape: 'circle' },
    { label: 'Квадрат', name: 'Квадрат', shape: 'square' },
    { label: 'Троугао', name: 'Троугао', shape: 'triangle' },
    { label: 'Звезда', name: 'Звезда', shape: 'star' },
  ];

  const ACTIVITIES = {
    letters: { title: 'Слова', items: LETTERS },
    numbers: { title: 'Бројеви', items: NUMBERS },
    shapes: { title: 'Облици', items: SHAPES },
  };

  const SHAPE_SVGS = {
    circle: '<circle cx="50" cy="50" r="42" fill="none" stroke="#9B6DFF" stroke-width="6"/>',
    square: '<rect x="13" y="13" width="74" height="74" rx="3" fill="none" stroke="#9B6DFF" stroke-width="6"/>',
    triangle: '<polygon points="50,10 88,90 12,90" fill="none" stroke="#9B6DFF" stroke-width="6" stroke-linejoin="round"/>',
    star: '<polygon points="50,10 61,35 98,35 68,57 79,91 50,70 21,91 32,57 2,35 39,35" fill="none" stroke="#9B6DFF" stroke-width="6" stroke-linejoin="round"/>',
  };

  const FONT = '900 144px Fredoka, "Segoe UI", Arial, sans-serif';
  const GUIDE_FONT = '900 288px Fredoka, "Segoe UI", Arial, sans-serif';
  const CW = 400;

  let activity = null;
  let index = 0;
  let drawing = false;
  let prev = null;
  let finished = false;
  let finishTimer = null;
  let canvas = null;
  let guide = null;
  let cctx = null;

  const $ = id => document.getElementById(id);

  function speakPhrase(phrases) {
    let i = 0;
    const next = () => {
      if (i >= phrases.length) return;
      const text = phrases[i++];
      if (window.speech && window.speech.speak) window.speech.speak(text, next);
      else next();
    };
    next();
  }

  function current() {
    return ACTIVITIES[activity].items[index];
  }

  /* ---------- reference card ---------- */
  function renderRef() {
    const item = current();
    const svg = item.shape
      ? SHAPE_SVGS[item.shape]
      : '<text x="50" y="56" text-anchor="middle" dominant-baseline="middle" font-size="72" font-weight="700" fill="#9B6DFF" font-family="Fredoka, Segoe UI, Arial, sans-serif">' + item.label + '</text>';
    $('tracingRef').innerHTML = '<svg id="tracingRefSvg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" aria-hidden="true">' + svg + '</svg>';
  }

  /* ---------- rasterize helpers ---------- */
  function inkBBox(data, W) {
    let minX = W, minY = W, maxX = -1, maxY = -1;
    for (let y = 0; y < W; y++) {
      for (let x = 0; x < W; x++) {
        if (data[(y * W + x) * 4 + 3] > 0) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (maxX < 0) return null;
    return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
  }

  function rasterToGrid(data, W, bbox) {
    const grid = new Uint8Array(GRID * GRID);
    const m = 0.08;
    const s = (GRID * (1 - 2 * m)) / Math.max(bbox.w, bbox.h);
    const ox = (GRID - bbox.w * s) / 2;
    const oy = (GRID - bbox.h * s) / 2;
    for (let j = 0; j < GRID; j++) {
      for (let i = 0; i < GRID; i++) {
        let hit = 0;
        for (let sy = 0; sy < 2 && !hit; sy++) {
          for (let sx = 0; sx < 2; sx++) {
            const cx = i + (sx + 0.5) / 2;
            const cy = j + (sy + 0.5) / 2;
            const px = Math.min(W - 1, Math.max(0, Math.floor(bbox.x + (cx - ox) / s)));
            const py = Math.min(W - 1, Math.max(0, Math.floor(bbox.y + (cy - oy) / s)));
            if (data[(py * W + px) * 4 + 3] > 0) hit = 1;
          }
        }
        grid[j * GRID + i] = hit;
      }
    }
    return grid;
  }

  function dilate(grid, r) {
    const R = GRID + 2 * r;
    const RR = R + 1;
    const acc = new Int32Array(RR * RR);
    const c0 = v => Math.max(0, v), c1 = v => Math.min(R, v);
    for (let j = 0; j < GRID; j++) {
      for (let i = 0; i < GRID; i++) {
        if (!grid[j * GRID + i]) continue;
        const x0 = c0(i), x1 = c1(i + 2 * r + 1), y0 = c0(j), y1 = c1(j + 2 * r + 1);
        acc[y0 * RR + x0] += 1;
        acc[y0 * RR + x1] -= 1;
        acc[y1 * RR + x0] -= 1;
        acc[y1 * RR + x1] += 1;
      }
    }
    const out = new Uint8Array(GRID * GRID);
    const A = new Int32Array(RR * RR);
    for (let j = 0; j < RR; j++) {
      for (let i = 0; i < RR; i++) {
        A[j * RR + i] = acc[j * RR + i]
          + (i > 0 ? A[j * RR + i - 1] : 0)
          + (j > 0 ? A[(j - 1) * RR + i] : 0)
          - (i > 0 && j > 0 ? A[(j - 1) * RR + i - 1] : 0);
        if (A[j * RR + i] > 0 && j >= r && j < r + GRID && i >= r && i < r + GRID) out[(j - r) * GRID + (i - r)] = 1;
      }
    }
    return out;
  }

  function drawShapeOutline(g, shape, S) {
    if (shape === 'circle') {
      g.beginPath(); g.arc(S / 2, S / 2, S * 0.42, 0, Math.PI * 2); g.stroke();
    } else if (shape === 'square') {
      const m = S * 0.13;
      g.beginPath(); g.rect(m, m, S - 2 * m, S - 2 * m); g.stroke();
    } else if (shape === 'triangle') {
      g.beginPath(); g.moveTo(S / 2, S * 0.10); g.lineTo(S * 0.88, S * 0.90); g.lineTo(S * 0.12, S * 0.90); g.closePath(); g.stroke();
    } else if (shape === 'star') {
      const pts = [50, 10, 61, 35, 98, 35, 68, 57, 79, 91, 50, 70, 21, 91, 32, 57, 2, 35, 39, 35];
      g.beginPath();
      g.moveTo(S * pts[0] / 100, S * pts[1] / 100);
      for (let i = 2; i < pts.length; i += 2) g.lineTo(S * pts[i] / 100, S * pts[i + 1] / 100);
      g.closePath(); g.stroke();
    }
  }

  function rasterToGridOf(drawFn) {
    const W = 200;
    const off = document.createElement('canvas');
    off.width = W; off.height = W;
    const g = off.getContext('2d');
    g.lineJoin = 'round';
    g.lineCap = 'round';
    g.strokeStyle = '#000';
    drawFn(g, W);
    const img = g.getImageData(0, 0, W, W);
    const bbox = inkBBox(img.data, W);
    if (!bbox) return null;
    return rasterToGrid(img.data, W, bbox);
  }

  function refGrid() {
    const item = current();
    return rasterToGridOf((g, W) => {
      g.lineWidth = 14;
      if (item.shape) {
        drawShapeOutline(g, item.shape, W);
      } else {
        g.font = FONT;
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        g.strokeText(item.label, W / 2, W / 2 + W * 0.02);
      }
    });
  }

  function inkGrid() {
    const W = 200;
    const off = document.createElement('canvas');
    off.width = W; off.height = W;
    const g = off.getContext('2d');
    g.drawImage(canvas, 0, 0, W, W);
    const img = g.getImageData(0, 0, W, W);
    const bbox = inkBBox(img.data, W);
    if (!bbox) return null;
    return rasterToGrid(img.data, W, bbox);
  }

  /* Is the ink within the dashed guide? "Near" = ink cells that sit within 2
     grid cells of the guide line (dilate the reference by 2). Genuine traces
     score ~0.98–1.0; filled blobs / scribbles that merely contain the glyph
     drop to ~0.7 because their interior strays far from the line. */
  function nearFrac(ink, ref) {
    const refD2 = dilate(ref, 2);
    let near = 0, inkTotal = 0;
    for (let i = 0; i < GRID * GRID; i++) {
      if (ink[i]) { inkTotal++; if (refD2[i]) near++; }
    }
    return inkTotal ? near / inkTotal : 0;
  }

  function matchResult() {
    const ref = refGrid();
    const inkG = inkGrid();
    if (!ref || !inkG) return { drew: false };
    let inkTotal = 0;
    for (let i = 0; i < GRID * GRID; i++) inkTotal += inkG[i];
    if (inkTotal < MIN_INK) return { drew: false };
    const inkD = dilate(inkG, TOL_COV);
    let refCount = 0, inter = 0;
    for (let i = 0; i < GRID * GRID; i++) {
      if (ref[i]) { refCount++; if (inkD[i]) inter++; }
    }
    const coverage = inter / refCount;
    const near = nearFrac(inkG, ref);
    return {
      drew: true,
      coverage: coverage,
      near: near,
      pass: coverage >= MIN_COVER && near >= MIN_NEAR && inkTotal <= MAX_INK,
    };
  }

  /* ---------- canvas drawing ---------- */
  function clearCanvas() {
    cctx.clearRect(0, 0, CW, CW);
  }

  /* Dashed outline of the target glyph on the guide canvas, so the child has a
     line to follow. Drawn on a separate overlay canvas (pointer-events:none)
     so it never counts as the child's ink in matchResult(). */
  function drawGuide() {
    const g = guide.getContext('2d');
    g.clearRect(0, 0, CW, CW);
    const item = current();
    g.lineJoin = 'round';
    g.lineCap = 'round';
    g.strokeStyle = 'rgba(155, 109, 255, 0.35)';
    g.lineWidth = 12;
    g.setLineDash([16, 14]);
    if (item.shape) {
      drawShapeOutline(g, item.shape, CW);
    } else {
      g.font = GUIDE_FONT;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.strokeText(item.label, CW / 2, CW / 2 + CW * 0.02);
    }
    g.setLineDash([]);
  }

  function seg(from, to) {
    if (from) {
      cctx.beginPath();
      cctx.moveTo(from.x, from.y);
      cctx.lineTo(to.x, to.y);
      cctx.stroke();
    } else {
      cctx.beginPath();
      cctx.arc(to.x, to.y, 8, 0, Math.PI * 2);
      cctx.fill();
    }
  }

  function canvasPoint(ev) {
    const r = canvas.getBoundingClientRect();
    return {
      x: (ev.clientX - r.left) * (canvas.width / r.width),
      y: (ev.clientY - r.top) * (canvas.height / r.height),
    };
  }

  function onDown(ev) {
    if (finished || !activity) return;
    ev.preventDefault();
    const p = canvasPoint(ev);
    drawing = true;
    prev = p;
    seg(null, p);
  }

  function onMove(ev) {
    if (!drawing || finished) return;
    const p = canvasPoint(ev);
    seg(prev, p);
    prev = p;
  }

  function onUp() {
    drawing = false;
  }

  /* ---------- flow ---------- */
  function renderCaption(text) {
    $('tracingCaption').textContent = text;
  }

  function render() {
    const items = ACTIVITIES[activity].items;
    $('tracingCounter').textContent = (index + 1) + ' од ' + items.length;
    renderRef();
    if (finished) {
      const item = current();
      if (activity === 'letters') {
        renderCaption(item.word + ' ' + item.emoji);
      } else if (activity === 'numbers') {
        renderCaption(item.label + ' · ' + item.name);
      } else {
        renderCaption(item.name);
      }
    } else {
      renderCaption('Нацртај ' + current().label);
    }
  }

  function glyphDone() {
    finished = true;
    drawing = false;
    render();
    if (window.popSound) window.popSound();
    if (window.celebrate) window.celebrate('✏️');
    clearTimeout(finishTimer);
    finishTimer = setTimeout(() => {
      if (finished) {
        document.querySelectorAll('.celebration-overlay.show').forEach(e => e.classList.remove('show'));
        loadItem(index + 1);
      }
    }, 2600);
  }

  function loadItem(i) {
    clearTimeout(finishTimer);
    const items = ACTIVITIES[activity].items;
    index = ((i % items.length) + items.length) % items.length;
    finished = false;
    drawing = false;
    clearCanvas();
    drawGuide();
    render();
    speakPhrase([current().name]);
  }

  function onDone() {
    if (finished || !activity) return;
    const res = matchResult();
    if (!res.drew) {
      renderCaption('Нацртај ' + current().label + ' прво!');
      if (window.gentleMiss) window.gentleMiss();
      return;
    }
    if (res.pass) {
      glyphDone();
    } else {
      clearCanvas();
      renderCaption('Покушај још једном!');
      if (window.gentleMiss) window.gentleMiss();
    }
  }

  function enterActivity(kind) {
    if (window.popSound) window.popSound();
    activity = kind;
    $('tracingTitle').hidden = true;
    $('tracingHub').hidden = true;
    $('tracingActivity').hidden = false;
    $('tracingTitle2').textContent = ACTIVITIES[kind].title;
    loadItem(0);
  }

  function leaveActivity() {
    clearTimeout(finishTimer);
    if (window.popSound) window.popSound();
    activity = null;
    drawing = false;
    $('tracingActivity').hidden = true;
    $('tracingTitle').hidden = false;
    $('tracingHub').hidden = false;
  }

  function startTracing() {
    canvas = $('tracingCanvas');
    guide = $('tracingGuide');
    cctx = canvas.getContext('2d');
    cctx.lineJoin = 'round';
    cctx.lineCap = 'round';
    cctx.strokeStyle = '#9B6DFF';
    cctx.fillStyle = '#9B6DFF';
    cctx.lineWidth = 16;

    document.querySelectorAll('#tracingHub .activity-btn').forEach(btn => {
      btn.addEventListener('click', () => enterActivity(btn.dataset.activity));
    });
    $('tracingBack').addEventListener('click', leaveActivity);
    $('tracingNext').addEventListener('click', () => {
      if (window.popSound) window.popSound();
      loadItem(index + 1);
    });
    $('tracingDone').addEventListener('click', onDone);
    $('tracingClear').addEventListener('click', () => {
      if (!finished) {
        clearCanvas();
        renderCaption('Нацртај ' + current().label);
      }
    });
    canvas.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  }

  window.startTracing = startTracing;
  window.__traceDebug = { matchResult: matchResult, refGrid: refGrid, inkGrid: inkGrid };
}());
