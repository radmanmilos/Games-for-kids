/* Petrin svet Puzzle (Слагалице) smoke test — task 67 polish.
   Drives pages/animal_puzzle.html headlessly: 8 painted scenes cycle (5 original
   + farm/space/winter), images carry NO painted title, every picture gets a thin
   white frame with a plum inner line (corner/edge reference), and pieces are
   scattered AROUND the placement board (never covering it, no piece overlap).
   Pieces are solved via keyboard (Enter) which snaps them into their slots.
   Run:  node tools/puzzle_smoke.js     (from the repo root or anywhere)
   Requires Node >= 22. CHROME_PATH env optional. */
const { start, check, getFails } = require('./headless.js');
const fs = require('fs');
const path = require('path');

const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const h = await start({ page: '/pages/animal_puzzle.html', tag: 'puzzle-smoke', width: 900, height: 800 });

  let ready = false;
  for (let i = 0; i < 25 && !ready; i++) {
    ready = await h.evalv(`!!document.getElementById('scenePreview') && !!document.getElementById('sceneButton')`);
    if (!ready) await sleep(200);
  }
  check('puzzle page boots with scene preview + start button', ready);

  const px = await h.evalv(`JSON.stringify((() => {
    const g = document.getElementById('scenePreview').getContext('2d');
    const at = (x,y) => { const d = g.getImageData(x,y,1,1).data; return [d[0],d[1],d[2]]; };
    return { edge: at(3,3), inner: at(10,10), mid: at(320,37) };
  })())`);
  const P = JSON.parse(px);
  check('no painted title banner (mid-canvas is sky, not white)',
    P.mid[0] < 200 && P.mid[1] > 150 && P.mid[2] > 230, JSON.stringify(P.mid));
  check('thin white frame drawn on every picture (edge is white)',
    P.edge[0] > 245 && P.edge[1] > 245 && P.edge[2] > 245, JSON.stringify(P.edge));
  check('frame inner plum line present (not pure sky/white)',
    P.inner[0] < 200 && P.inner[1] < 190 && P.inner[2] < 240, JSON.stringify(P.inner));

  const src = fs.readFileSync(path.join(__dirname, '..', 'game', 'games', 'animal_puzzle.js'), 'utf8');
  const html = fs.readFileSync(path.join(__dirname, '..', 'game', 'pages', 'animal_puzzle.html'), 'utf8');
  check('images contain no painted title text', !src.includes('fillText(scene.title'), 'title lives in the h1 only');
  check('3 new scenes registered (farm/space/winter)',
    src.includes("theme:'farm'") && src.includes("theme:'space'") && src.includes("theme:'winter'"));
  check('frame drawn via strokeRect in paint()', src.includes('strokeRect(4.5,4.5,W-9,H-9)'));
  check('board sized so pieces can ring around it', html.includes('width:min(46vw,420px,60vh)'));

  await h.evalv(`document.getElementById('sceneButton').click()`);
  await sleep(250);
  const boot = await h.evalv(`JSON.stringify((() => ({
    pieces: document.querySelectorAll('#puzzleStage .piece').length,
    slots: document.querySelectorAll('#puzzleStage .board-slot').length,
    label: document.getElementById('puzzleLevel').textContent
  }))())`);
  const B = JSON.parse(boot);
  check('first puzzle starts 2×2: 4 pieces, 4 slots, label "Слагалица 1 · 2×2"',
    B.pieces === 4 && B.slots === 4 && B.label === 'Слагалица 1  ·  2×2', JSON.stringify(B));

  const ring2 = await h.evalv(`JSON.stringify((() => {
    const b = document.getElementById('puzzleBoard').getBoundingClientRect();
    const ps = [...document.querySelectorAll('#puzzleStage .piece')];
    const onBoard = ps.filter(p => {
      const r = p.getBoundingClientRect();
      return !(r.right <= b.left || r.left >= b.right || r.bottom <= b.top || r.top >= b.bottom);
    }).length;
    let overlaps = 0;
    for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) {
      const a = ps[i].getBoundingClientRect(), c = ps[j].getBoundingClientRect();
      if (!(a.right <= c.left || a.left >= c.right || a.bottom <= c.top || a.top >= c.bottom)) overlaps++;
    }
    return { onBoard, overlaps };
  })())`);
  const R2 = JSON.parse(ring2);
  check('2×2 pieces ring the board: none on the board, none overlapping',
    R2.onBoard === 0 && R2.overlaps === 0, JSON.stringify(R2));

  const finish = await h.evalv(`(() => {
    const pieces = () => [...document.querySelectorAll('#puzzleStage .piece')];
    let guard = 0;
    while (guard++ < 60 && pieces().some(p => !p.classList.contains('placed'))) {
      const p = pieces().find(pp => !pp.classList.contains('placed'));
      p.focus();
      p.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    }
    return JSON.stringify({
      score: document.getElementById('puzzleScore').textContent,
      nextShown: document.getElementById('puzzleNext').classList.contains('show'),
      bg: document.getElementById('puzzleBoard').style.backgroundImage.slice(0, 22)
    });
  })()`);
  const F = JSON.parse(finish);
  check('completing the 2×2 puzzle: score 1, next button shows, board shows picture',
    F.score === '1' && F.nextShown && F.bg.startsWith('url("data:image/png;'), JSON.stringify(F));

  await h.evalv(`document.getElementById('puzzleNext').click(); document.getElementById('sceneButton').click();`);
  await sleep(250);
  const lvl2 = await h.evalv(`JSON.stringify((() => ({
    pieces: document.querySelectorAll('#puzzleStage .piece').length,
    title: document.getElementById('puzzleTitle').textContent,
    label: document.getElementById('puzzleLevel').textContent
  }))())`);
  const L2 = JSON.parse(lvl2);
  check('second puzzle is 3×3, next scene title "Немир у кући"',
    L2.pieces === 9 && L2.title === 'Немир у кући' && L2.label === 'Слагалица 2  ·  3×3', JSON.stringify(L2));

  const ring3 = await h.evalv(`JSON.stringify((() => {
    const b = document.getElementById('puzzleBoard').getBoundingClientRect();
    const ps = [...document.querySelectorAll('#puzzleStage .piece')];
    const onBoard = ps.filter(p => {
      const r = p.getBoundingClientRect();
      return !(r.right <= b.left || r.left >= b.right || r.bottom <= b.top || r.top >= b.bottom);
    }).length;
    let overlaps = 0;
    for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) {
      const a = ps[i].getBoundingClientRect(), c = ps[j].getBoundingClientRect();
      if (!(a.right <= c.left || a.left >= c.right || a.bottom <= c.top || a.top >= c.bottom)) overlaps++;
    }
    return { onBoard, overlaps };
  })())`);
  const R3 = JSON.parse(ring3);
  check('3×3 pieces ring the board: none on the board, none overlapping',
    R3.onBoard === 0 && R3.overlaps === 0, JSON.stringify(R3));

  const cycle = await h.evalv(`(() => {
    const out = [];
    for (let lvl = 1; lvl < 8; lvl++) {
      const pieces = () => [...document.querySelectorAll('#puzzleStage .piece')];
      let guard = 0;
      while (guard++ < 60 && pieces().some(p => !p.classList.contains('placed'))) {
        const p = pieces().find(pp => !pp.classList.contains('placed'));
        p.focus();
        p.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      }
      out.push({ title: document.getElementById('puzzleTitle').textContent, n: pieces().length });
      if (lvl < 7) { document.getElementById('puzzleNext').click(); document.getElementById('sceneButton').click(); }
    }
    return JSON.stringify({ out, score: document.getElementById('puzzleScore').textContent });
  })()`);
  const C = JSON.parse(cycle);
  const expected = ['Немир у кући', 'Другари из саване', 'У морским дубинама', 'Другари из шуме', 'Другари на фарми', 'Другари у свемиру', 'Другари на снегу'];
  const titles = C.out.map(o => o.title);
  const sizes = C.out.map(o => o.n);
  check('all 8 scenes cycle in order (house, savanna, sea, forest, farm, space, winter)',
    JSON.stringify(titles) === JSON.stringify(expected), JSON.stringify(titles));
  check('grids alternate 3×3 / 2×2 across scenes', JSON.stringify(sizes) === JSON.stringify([9,4,9,4,9,4,9]), JSON.stringify(sizes));
  check('final score after all 8 puzzles is 8', C.score === '8', 'score=' + C.score);

  h.close();
  const fails = getFails();
  console.log(`\n${fails === 0 ? 'ALL' : 'SOME'} CHECKS ${fails === 0 ? 'PASSED' : 'FAILED'} (${fails} fail)`);
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error('puzzle_smoke crashed:', e); process.exit(1); });
