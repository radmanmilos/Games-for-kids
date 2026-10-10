/* ---------------- ПУТАЊА (Path following) ----------------
   R27 pilot: drag the bear along a wide stone path from the start to the house.
   No timer, no traps, no score. A drop that strays from the path is gently
   returned to the last reached stone rather than punished. */
(function () {
  'use strict';

  /* Mazes are direction runs on a grid, so the solution is the path itself and
     there is no dead end to get stuck in — "no deadly traps" by construction.
     Every maze is solvable and none revisits a cell. */
  var MAZES = [
    { id: 'first-bend', cols: 5, rows: 3, steps: [['right', 3], ['down', 1], ['right', 1]] },
    { id: 'zigzag', cols: 5, rows: 4, steps: [['right', 2], ['down', 2], ['left', 2], ['down', 1], ['right', 3]] },
    { id: 'long-way-round', cols: 6, rows: 4, steps: [['right', 4], ['down', 2], ['left', 3], ['down', 1], ['right', 4]] },
  ];

  var START = { emoji: '🐻', label: 'Медвед' };
  var GOAL = { emoji: '🏠', label: 'Кућа' };

  var board, prompt, feedback, retryBtn, stage;
  var round = 0, cells = [], cols = 0, rows = 0;
  var reached = 0, misses = 0, completed = 0, started = false;
  var token = null, tokenEl = null, dragging = false, dragId = null, returning = false;

  function speak(text) {
    if (!text) return;
    if (window.audioBuses && window.audioBuses.speakWithDuck) window.audioBuses.speakWithDuck(text);
    else if (window.speech && window.speech.speak) window.speech.speak(text);
  }

  /* Expand the direction runs into the ordered list of cells the bear must
     touch. Index 0 is the start stone, the last index is the goal. */
  function buildCells(maze) {
    var list = [{ col: 0, row: 0 }];
    var cur = { col: 0, row: 0 };
    maze.steps.forEach(function (run) {
      var dir = run[0], n = run[1];
      var dc = dir === 'left' ? -1 : dir === 'right' ? 1 : 0;
      var dr = dir === 'up' ? -1 : dir === 'down' ? 1 : 0;
      for (var i = 0; i < n; i++) {
        cur = { col: cur.col + dc, row: cur.row + dr };
        list.push({ col: cur.col, row: cur.row });
      }
    });
    return list;
  }

  /* Centre of a cell in board-relative percent, so the token can be placed with
     percentages and stay correct at any viewport size. */
  function cellCentre(cell) {
    return {
      x: (cell.col + 0.5) * (100 / cols),
      y: (cell.row + 0.5) * (100 / rows),
    };
  }

  function placeToken(pos) {
    tokenEl.style.left = pos.x + '%';
    tokenEl.style.top = pos.y + '%';
  }

  function buildBoard() {
    var maze = MAZES[round];
    cols = maze.cols;
    rows = maze.rows;
    cells = buildCells(maze);
    stage.textContent = '';

    // Ground: one plain layer so the stones read as a path rather than as holes.
    var ground = document.createElement('div');
    ground.className = 'maze-ground';
    stage.appendChild(ground);

    var onPath = {};
    cells.forEach(function (cell) { onPath[cell.col + ',' + cell.row] = true; });
    var cellW = (100 / cols) + '%';
    var cellH = (100 / rows) + '%';

    // V9: every off-path cell becomes a hedge block, so the sand path reads as a
    // corridor through a garden instead of loose squares on grass (clear walls,
    // and the walls make the path obvious without hiding it).
    var hedges = [];
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        if (onPath[c + ',' + r]) continue;
        var hedge = document.createElement('div');
        hedge.className = 'maze-hedge';
        hedge.style.left = (c * (100 / cols)) + '%';
        hedge.style.top = (r * (100 / rows)) + '%';
        hedge.style.width = cellW;
        hedge.style.height = cellH;
        stage.appendChild(hedge);
        hedges.push(hedge);
      }
    }

    // A restrained garden layer: up to four motifs spread evenly across the
    // hedges, never on the path, so they decorate without cluttering the way.
    var MOTIFS = ['🌼', '🌷', '🦋', '🐞'];
    var wanted = Math.min(MOTIFS.length, hedges.length);
    for (var m = 0; m < wanted; m++) {
      var hedgeEl = hedges[Math.floor(m * hedges.length / wanted)];
      var motif = document.createElement('span');
      motif.className = 'maze-motif';
      motif.setAttribute('aria-hidden', 'true');
      motif.textContent = MOTIFS[m];
      hedgeEl.appendChild(motif);
    }

    cells.forEach(function (cell, i) {
      var stone = document.createElement('div');
      stone.className = 'maze-stone';
      stone.dataset.idx = String(i);
      stone.style.left = (cell.col * (100 / cols)) + '%';
      stone.style.top = (cell.row * (100 / rows)) + '%';
      stone.style.width = cellW;
      stone.style.height = cellH;
      if (i === 0) {
        var startMark = document.createElement('span');
        startMark.className = 'maze-mark';
        startMark.setAttribute('aria-hidden', 'true');
        startMark.textContent = '🚩';
        stone.appendChild(startMark);
      }
      if (i === cells.length - 1) {
        stone.classList.add('maze-goal');
        var goalMark = document.createElement('span');
        goalMark.className = 'maze-mark';
        goalMark.setAttribute('aria-hidden', 'true');
        goalMark.textContent = GOAL.emoji;
        stone.appendChild(goalMark);
      }
      stage.appendChild(stone);
    });

    tokenEl = document.createElement('button');
    tokenEl.type = 'button';
    tokenEl.className = 'maze-token';
    tokenEl.dataset.idx = '0';
    tokenEl.setAttribute('aria-label', START.label);
    tokenEl.textContent = START.emoji;
    tokenEl.style.width = (100 / cols) + '%';
    tokenEl.style.height = (100 / rows) + '%';
    stage.appendChild(tokenEl);
    bindToken();
  }

  function reachedIndex() {
    return reached;
  }

  function settleOn(index) {
    reached = index;
    token = cellCentre(cells[reached]);
    tokenEl.dataset.idx = String(reached);
    placeToken(token);
    stage.querySelectorAll('.maze-stone').forEach(function (stone, i) {
      stone.classList.toggle('maze-done', i < reached);
    });
  }

  /* Pointer position in board-relative percent. `input.js` already applies the
     coarse-pointer/touch handling elsewhere; this only needs the geometry. */
  function pointerToPercent(e) {
    var r = stage.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
    };
  }

  function distanceInCells(pos, cell) {
    var target = cellCentre(cell);
    // Normalised by cell size so the snap radius means the same thing on a
    // phone and on a desktop, instead of drifting with viewport width.
    var dx = (pos.x - target.x) / (100 / cols);
    var dy = (pos.y - target.y) / (100 / rows);
    return Math.sqrt(dx * dx + dy * dy);
  }

  /* Generous on purpose: the roadmap asks for a forgiving path, and a toddler
     dragging a fat finger should not have to be precise to stay on it. */
  var SNAP = 0.72;

  function completeMaze() {
    reached = cells.length - 1;
    completed++;
    if (feedback) feedback.textContent = 'Браво!';
    speak('Браво!');
    if (window.successChime) window.successChime();
    if (window.speakSr) window.speakSr('praise');
    var finished = completed;
    setTimeout(function () {
      if (finished % 2 === 0 && window.celebrate) window.celebrate();
      round = (round + 1) % MAZES.length;
      newMaze();
    }, 900);
  }

  function onDrop(pos) {
    if (returning) return;
    var next = reached + 1;
    if (next >= cells.length) { completeMaze(); return; }
    if (distanceInCells(pos, cells[next]) <= SNAP) {
      settleOn(next);
      if (feedback) feedback.textContent = '';
      if (window.softPop) window.softPop(tokenEl);
      if (next === cells.length - 1) completeMaze();
      return;
    }

    // Gently redirect: slide back to the last reached stone. No failure screen,
    // nothing is lost, and the path stays exactly where it was.
    misses++;
    returning = true;
    placeToken(cellCentre(cells[reachedIndex()]));
    if (window.gentleMiss) window.gentleMiss();
    if (feedback) feedback.textContent = 'Покушај поново';
    if (misses === 2 && window.speakSr) window.speakSr('retry');
    setTimeout(function () { returning = false; }, 260);
  }

  function bindToken() {
    tokenEl.addEventListener('pointerdown', function (e) {
      if (returning || reached >= cells.length - 1) return;
      dragId = e.pointerId;
      dragging = true;
      tokenEl.classList.add('maze-dragging');
      try { tokenEl.setPointerCapture(e.pointerId); } catch (_) { /* older engines */ }
      e.preventDefault();
    });
    tokenEl.addEventListener('pointermove', function (e) {
      if (!dragging || e.pointerId !== dragId) return;
      var pos = pointerToPercent(e);
      // Clamp to the board so the bear can never be dragged out of sight and
      // lost for the rest of the round.
      var half = 100 / cols / 2;
      pos.x = Math.min(Math.max(pos.x, half), 100 - half);
      var halfY = 100 / rows / 2;
      pos.y = Math.min(Math.max(pos.y, halfY), 100 - halfY);
      placeToken(pos);
      e.preventDefault();
    });
    function endDrag(e) {
      if (e.pointerId !== dragId) return;
      dragId = null;
      if (!dragging) return;
      dragging = false;
      tokenEl.classList.remove('maze-dragging');
      onDrop(pointerToPercent(e));
    }
    tokenEl.addEventListener('pointerup', endDrag);
    tokenEl.addEventListener('pointercancel', function () {
      dragId = null;
      dragging = false;
      if (tokenEl) tokenEl.classList.remove('maze-dragging');
    });
  }

  function newMaze() {
    reached = 0;
    misses = 0;
    dragging = false;
    returning = false;
    if (feedback) feedback.textContent = '';
    buildBoard();
    settleOn(0);
    speak('Пронађи пут до куће');
  }

  function startMaze() {
    if (started) return; // main.js boots each page once; a second call doubles every handler
    started = true;
    board = document.getElementById('maze-board');
    prompt = document.getElementById('maze-prompt');
    feedback = document.getElementById('maze-feedback');
    retryBtn = document.getElementById('maze-retry');
    stage = document.getElementById('maze-stage');
    if (!board || !prompt || !feedback || !retryBtn || !stage) return;
    round = 0;
    newMaze();

    if (retryBtn) {
      retryBtn.addEventListener('click', function () {
        // A total reset is always available, so a stuck bear is never a dead end.
        newMaze();
      });
    }

    window.__maze = {
      state: function () {
        return {
          round: round,
          id: MAZES[round].id,
          cols: cols,
          rows: rows,
          cells: cells.length,
          reached: reached,
          misses: misses,
          completed: completed,
          dragging: dragging,
        };
      },
      goToMaze: function (n) {
        round = ((n % MAZES.length) + MAZES.length) % MAZES.length;
        newMaze();
      },
      cellCentrePct: function (i) { return cellCentre(cells[i]); },
    };
  }

  window.startMaze = startMaze;
})();