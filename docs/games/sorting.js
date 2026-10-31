/* ---------------- РАЗВРСТАВАЊЕ (Sorting / Classification) ----------------
   R22 pilot: drag (or tap the object, then tap a basket) an object into one of
   two big baskets. Two categories only, chosen so no reading is needed: red/blue
   and animals/food. Objects never fail - a wrong drop softly returns home, the
   basket shakes gently, and after two misses the right basket is highlighted. */
(function () {
  'use strict';

  /* Reusable source data. A category is a pair of bins plus a pool of items; an
     item joins a bin by matching `cat`, so adding a category is data only. Each
     visual carries a Serbian `name` for its accessible label. */
  var CATEGORIES = [
    {
      id: 'color',
      bins: [
        { cat: 'red', label: 'Црвено', color: '#E4572E' },
        { cat: 'blue', label: 'Плаво', color: '#3B82F6' }
      ],
      items: [
        { cat: 'red', color: '#E4572E', name: 'Црвена боја' },
        { cat: 'blue', color: '#3B82F6', name: 'Плава боја' },
        { cat: 'red', color: '#E4572E', name: 'Црвена боја' },
        { cat: 'blue', color: '#3B82F6', name: 'Плава боја' }
      ]
    },
    {
      id: 'kind',
      bins: [
        { cat: 'animal', label: 'Животиње', emoji: '🐾' },
        { cat: 'food', label: 'Храна', emoji: '🍎' }
      ],
      items: [
        { cat: 'animal', emoji: '🐶', name: 'Пас' },
        { cat: 'food', emoji: '🍎', name: 'Јабука' },
        { cat: 'animal', emoji: '🐱', name: 'Мачка' },
        { cat: 'food', emoji: '🍌', name: 'Банана' },
        { cat: 'animal', emoji: '🐮', name: 'Крава' },
        { cat: 'food', emoji: '🍓', name: 'Јагода' }
      ]
    }
  ];

  var round = 0;
  var cat = CATEGORIES[0];
  var bins = [];
  var items = [];
  var selected = null;
  var misses = 0;
  var placedCount = 0;
  var roundsDone = 0;
  var locked = false;
  var suppressClick = false;
  var started = false;

  var promptEl, trayEl, feedbackEl, basketWrap;

  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function visual(spec) {
    var span = document.createElement('span');
    span.className = 'sort-visual';
    span.setAttribute('aria-hidden', 'true');
    if (spec.color) {
      span.classList.add('sort-swatch');
      span.style.background = spec.color;
    } else {
      span.classList.add('sort-emoji');
      span.textContent = spec.emoji;
    }
    return span;
  }

  function buildBins() {
    basketWrap.innerHTML = '';
    bins = [];
    cat.bins.forEach(function (spec, i) {
      var bin = { cat: spec.cat, index: i, el: null, slot: null };
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'sort-basket';
      btn.id = i === 0 ? 'sort-bin-a' : 'sort-bin-b';
      btn.dataset.cat = spec.cat;
      btn.dataset.bin = String(i);
      btn.setAttribute('aria-label', spec.label);

      var head = document.createElement('span');
      head.className = 'sort-bin-head';
      head.appendChild(visual(spec));
      var label = document.createElement('span');
      label.className = 'sort-bin-label';
      label.textContent = spec.label;
      head.appendChild(label);

      var slot = document.createElement('span');
      slot.className = 'sort-bin-slot';

      btn.appendChild(head);
      btn.appendChild(slot);
      btn.addEventListener('click', function () { onBinClick(bin); });
      basketWrap.appendChild(btn);

      bin.el = btn;
      bin.slot = slot;
      bins.push(bin);
    });
  }

  function buildTray() {
    trayEl.innerHTML = '';
    items = [];
    var pool = shuffle(cat.items.slice());
    pool.forEach(function (spec, i) {
      var item = { key: 'i' + i, cat: spec.cat, spec: spec, placed: false, el: null };
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'sort-item';
      btn.dataset.key = item.key;
      btn.dataset.cat = spec.cat;
      btn.setAttribute('aria-label', spec.name);
      btn.appendChild(visual(spec));
      btn.addEventListener('click', function () {
        if (suppressClick) { suppressClick = false; return; }
        onItemClick(item);
      });
      trayEl.appendChild(btn);
      item.el = btn;
      enableDrag(item);
      items.push(item);
    });
  }

  function setSelected(item) {
    if (selected && selected.el) selected.el.classList.remove('sort-selected');
    selected = item;
    if (item && item.el) item.el.classList.add('sort-selected');
  }

  function onItemClick(item) {
    if (locked || item.placed) return;
    setSelected(selected === item ? null : item);
  }

  function onBinClick(bin) {
    if (suppressClick) { suppressClick = false; return; }
    if (locked || !selected) return;
    var item = selected;
    setSelected(null);
    tryPlace(item, bin);
  }

  function clearBinHighlights() {
    bins.forEach(function (b) { b.el.classList.remove('sort-over'); });
  }

  function binAt(x, y, pad) {
    for (var i = 0; i < bins.length; i++) {
      var r = bins[i].el.getBoundingClientRect();
      if (x >= r.left - pad && x <= r.right + pad && y >= r.top - pad && y <= r.bottom + pad) return bins[i];
    }
    return null;
  }

  function enableDrag(item) {
    var el = item.el;
    var startX = 0, startY = 0, dragId = null, dragging = false;

    el.addEventListener('pointerdown', function (e) {
      if (locked || item.placed) return;
      dragId = e.pointerId;
      startX = e.clientX;
      startY = e.clientY;
      dragging = false;
      try { el.setPointerCapture(e.pointerId); } catch (_) { /* older engines */ }
    });

    el.addEventListener('pointermove', function (e) {
      if (e.pointerId !== dragId) return;
      var dx = e.clientX - startX;
      var dy = e.clientY - startY;
      if (!dragging && Math.abs(dx) + Math.abs(dy) > 8) {
        dragging = true;
        setSelected(null);
        el.classList.add('sort-dragging');
      }
      if (!dragging) return;
      var over = binAt(e.clientX, e.clientY, 20);
      bins.forEach(function (b) { b.el.classList.toggle('sort-over', b === over); });
      var px = dx, py = dy;
      if (over) { /* magnetic pull toward the basket centre */
        var r = over.el.getBoundingClientRect();
        px += (r.left + r.width / 2 - e.clientX) * 0.25;
        py += (r.top + r.height / 2 - e.clientY) * 0.25;
      }
      el.style.transform = 'translate(' + px + 'px,' + py + 'px)';
    });

    el.addEventListener('pointerup', function (e) {
      if (e.pointerId !== dragId) return;
      dragId = null;
      if (!dragging) return; /* a tap: let the click handler select it */
      dragging = false;
      el.classList.remove('sort-dragging');
      el.style.transform = '';
      var over = binAt(e.clientX, e.clientY, 26);
      clearBinHighlights();
      if (over) { suppressClick = true; tryPlace(item, over); }
    });

    el.addEventListener('pointercancel', function () {
      dragId = null;
      dragging = false;
      el.classList.remove('sort-dragging');
      el.style.transform = '';
      clearBinHighlights();
    });
  }

  function flashBin(bin, cls) {
    bin.el.classList.add(cls);
    setTimeout(function () { bin.el.classList.remove(cls); }, 500);
  }

  function tryPlace(item, bin) {
    if (locked || item.placed) return;
    if (item.cat === bin.cat) {
      item.placed = true;
      var chip = document.createElement('span');
      chip.className = 'sort-chip';
      chip.appendChild(visual(item.spec));
      bin.slot.appendChild(chip);
      if (item.el && item.el.parentNode) item.el.parentNode.removeChild(item.el);
      placedCount++;
      flashBin(bin, 'sort-good');
      if (window.successChime) window.successChime();
      if (feedbackEl) feedbackEl.textContent = '';
      if (placedCount === items.length) completeRound();
    } else {
      softReturn(item, bin);
    }
  }

  function softReturn(item, bin) {
    if (window.gentleMiss) window.gentleMiss();
    if (feedbackEl) feedbackEl.textContent = 'Покушај поново';
    flashBin(bin, 'sort-wrong');
    misses++;
    if (misses >= 2) {
      var target = bins.filter(function (b) { return b.cat === item.cat; })[0];
      if (target) {
        target.el.classList.add('sort-hint');
        setTimeout(function () { target.el.classList.remove('sort-hint'); }, 1600);
      }
      if (window.speakSr) window.speakSr('retry');
    }
  }

  function completeRound() {
    locked = true;
    roundsDone++;
    if (window.successChime) window.successChime();
    if (window.speakSr) window.speakSr('praise');
    if (feedbackEl) feedbackEl.textContent = 'Браво!';
    var doCelebrate = roundsDone % 2 === 0; /* a bigger party every second round */
    setTimeout(function () {
      if (doCelebrate && window.celebrate) window.celebrate();
      round++;
      newRound();
    }, 1000);
  }

  function newRound() {
    locked = false;
    misses = 0;
    placedCount = 0;
    setSelected(null);
    if (feedbackEl) feedbackEl.textContent = '';
    cat = CATEGORIES[round % CATEGORIES.length];
    if (promptEl) promptEl.textContent = 'Разврстај!';
    buildBins();
    buildTray();
    if (window.audioBuses && window.audioBuses.speakWithDuck) window.audioBuses.speakWithDuck('Разврстај слике');
    else if (window.speech && window.speech.speak) window.speech.speak('Разврстај слике');
  }

  function startSorting() {
    if (started) return;
    started = true;

    promptEl = document.getElementById('sort-prompt');
    trayEl = document.getElementById('sort-tray');
    feedbackEl = document.getElementById('sort-feedback');
    basketWrap = document.getElementById('sort-baskets');

    round = 0;
    newRound();

    /* Dev/test hook: lets the harness read the layout and jump rounds
       deterministically. Not read by the game itself. */
    window.__sorting = {
      state: function () {
        return {
          round: round,
          category: cat.id,
          misses: misses,
          selected: selected ? selected.key : null,
          bins: bins.map(function (b) { return { id: b.el.id, cat: b.cat }; }),
          items: items.map(function (it) { return { key: it.key, cat: it.cat, placed: it.placed }; }),
          remaining: items.filter(function (it) { return !it.placed; }).length
        };
      },
      goToRound: function (n) { round = n; newRound(); }
    };
  }

  window.startSorting = startSorting;
})();
