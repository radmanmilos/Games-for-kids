/* Maze smoke test — R27 "Путања" path-following pilot.
   Exercises the forgiving snap, the gentle redirect off-path, a full solve to
   the goal, the celebration cadence, and the registry/hub wiring.
   V9 (spec §27): also asserts the cozy-garden layer — soft green ground, a hedge
   wall per off-path cell, 2–4 motifs on the walls only, path/wall contrast, and
   the house landmark. */
const { start, check, getFails, sleep } = require('./headless.js');
const { checkRouteWired } = require('./route_contract.js');
const fs = require('fs');
const path = require('path');

const STUB = `window.softPop=function(){};window.successChime=function(){};window.gentleMiss=function(){};window.showHint=function(){};window.speakSr=function(){};window.audioBuses.speakWithDuck=function(){};window.__mazeCelebrations=0;window.celebrate=function(){window.__mazeCelebrations++};true`;

(async () => {
  const h = await start({ page: '/pages/maze.html', tag: 'maze-smoke', width: 1024, height: 800 });
  const ready = await h.waitFor(`!!window.__maze && document.querySelectorAll('.maze-stone').length>0`,
    { timeout: 5000, label: 'the first maze to be built' });
  check('maze game boots with a path built', ready.ok,
    ready.ok ? JSON.stringify(await h.evalv(`JSON.stringify(window.__maze.state())`)) : ready.why);
  await h.evalv(STUB);

  const state = async () => JSON.parse(await h.evalv(`JSON.stringify(window.__maze.state())`));

  // Geometry is asserted, not just presence: headless.boxOf scrolls a control
  // into view, so a clipped control would pass presence-only while no child
  // could tap it (task 177c).
  const geometry = JSON.parse(await h.evalv(`JSON.stringify(
    [document.getElementById('maze-retry'),document.getElementById('maze-back')].map(el=>{
      const r=el.getBoundingClientRect(),hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
      return {inside:r.top>=0&&r.left>=0&&r.bottom<=innerHeight&&r.right<=innerWidth,
        hit:hit===el||el.contains(hit),w:r.width,h:r.height};
    }))`));
  check('retry and back controls are reachable in the viewport',
    geometry.length === 2 && geometry.every(g => g.inside && g.hit && g.w >= 40 && g.h >= 40),
    JSON.stringify(geometry));

  const tokenBox = JSON.parse(await h.evalv(`JSON.stringify(
    (()=>{const r=document.querySelector('.maze-token').getBoundingClientRect();
      return {w:r.width,h:r.height,inside:r.top>=0&&r.bottom<=innerHeight&&r.left>=0&&r.right<=innerWidth};})())`));
  check('the bear token is a large, on-screen drag handle',
    tokenBox.w >= 60 && tokenBox.h >= 60 && tokenBox.inside, JSON.stringify(tokenBox));

  check('no score or timer is shown', await h.evalv(
    `!document.querySelector('[data-score],#score,[data-timer],#timer')`));
  check('the prompt is Cyrillic', (await h.evalv(`document.getElementById('maze-prompt').textContent`)) === 'Пронађи пут до куће');

  const first = await state();
  // Indexed rather than `:last-child`: the token button is the stage's last child,
  // so `:last-child` matches no stone at all and the page expression throws.
  const shape = JSON.parse(await h.evalv(`JSON.stringify((()=>{
    const stones=[...document.querySelectorAll('.maze-stone')];
    return {
      stones: stones.length,
      goal: (stones[stones.length-1].textContent||'').indexOf('🏠')>=0,
      firstMark: (stones[0].textContent||'').indexOf('🚩')>=0,
      tokenAtStart: document.querySelector('.maze-token').dataset.idx,
    };
  })())`));
  check('the path has a stone per cell and the last one is the house',
    shape.stones === first.cells && shape.goal === true, JSON.stringify({ ...shape, cells: first.cells }));
  check('the path is flagged at the start and the bear starts on the first stone',
    shape.firstMark === true && shape.tokenAtStart === '0', JSON.stringify(shape));

  /* V9 (spec §27): the prototype becomes a cozy garden. Assert the restrained
     world layer is real, not decorative markup that never renders. */
  const groundGreen = await h.evalv(`(()=>{
    const g=document.querySelector('.maze-ground');
    if(!g) return 'no ground';
    const m=getComputedStyle(g).backgroundColor.match(/\\d+/g);
    if(!m) return 'no bg';
    const [r,gr,b]=m.map(Number);
    return (gr>=r+10 && gr>=b+10) ? 'green' : 'not green '+m.join(',');
  })()`);
  check('the board ground is a soft green lawn', groundGreen === 'green', String(groundGreen));

  const wallCount = JSON.parse(await h.evalv(`JSON.stringify((()=>{
    return {stones:document.querySelectorAll('.maze-stone').length,
            hedges:document.querySelectorAll('.maze-hedge').length};
  })())`));
  check('every off-path cell is a hedge wall (clear walls)',
    wallCount.stones === first.cells &&
    wallCount.hedges === (first.cols * first.rows - first.cells) && wallCount.hedges > 0,
    JSON.stringify({ ...wallCount, cols: first.cols, rows: first.rows, cells: first.cells }));

  const motifs = JSON.parse(await h.evalv(`JSON.stringify((()=>{
    const ms=[...document.querySelectorAll('.maze-motif')];
    return {count:ms.length,
            onHedge:ms.every(m=>m.parentElement.classList.contains('maze-hedge'))};
  })())`));
  check('two to four garden motifs decorate the walls, never the path',
    motifs.count >= 2 && motifs.count <= 4 && motifs.onHedge === true, JSON.stringify(motifs));

  const contrast = await h.evalv(`(()=>{
    const s=getComputedStyle(document.querySelector('.maze-stone')).backgroundColor;
    const hd=getComputedStyle(document.querySelector('.maze-hedge')).backgroundColor;
    return s === hd ? 'same '+s : 'distinct';
  })()`);
  check('the sand path contrasts with the hedge walls (gentle path contrast)',
    contrast === 'distinct', String(contrast));

  const goalLandmark = JSON.parse(await h.evalv(`JSON.stringify((()=>{
    const stones=[...document.querySelectorAll('.maze-stone')];
    const g=stones[stones.length-1];
    return {isGoal:g.classList.contains('maze-goal'), house:(g.textContent||'').includes('🏠')};
  })())`));
  check('the destination is a distinct house landmark',
    goalLandmark.isGoal === true && goalLandmark.house === true, JSON.stringify(goalLandmark));

  /* Screen point of waypoint i, via the game's own percent->cell mapping. */
  const pointAt = async i => {
    const r = JSON.parse(await h.evalv(`JSON.stringify(document.getElementById('maze-stage').getBoundingClientRect())`));
    const p = JSON.parse(await h.evalv(`JSON.stringify(window.__maze.cellCentrePct(${i}))`));
    return { x: r.left + r.width * p.x / 100, y: r.top + r.height * p.y / 100 };
  };
  const solveMaze = async () => {
    const total = (await state()).cells;
    for (let i = 1; i < total; i++) {
      const from = await pointAt(i - 1);
      const to = await pointAt(i);
      await h.dragTo(from.x, from.y, to.x, to.y);
      await sleep(90);
    }
  };

  // A drop far off the path must be redirected, never punished: the bear goes
  // back to the last reached stone and the round does not advance.
  const startPoint = await pointAt(0);
  const board = JSON.parse(await h.evalv(`JSON.stringify(document.getElementById('maze-stage').getBoundingClientRect())`));
  await h.dragTo(startPoint.x, startPoint.y, board.right - 12, board.bottom - 12);
  await sleep(320);
  const afterStray = await state();
  check('a drop off the path is gently redirected — no advance, nothing lost',
    afterStray.reached === 0 && afterStray.misses === 1, JSON.stringify(afterStray));
  const tokenHome = await h.evalv(`document.querySelector('.maze-token').dataset.idx`);
  check('the bear is returned to the last reached stone', tokenHome === '0', tokenHome);

  await solveMaze();
  const solved = await state();
  check('dragging stone to stone reaches the house',
    solved.reached === solved.cells - 1 && solved.completed === 1, JSON.stringify(solved));
  check('reaching the house praises the child',
    (await h.evalv(`document.getElementById('maze-feedback').textContent`)) === 'Браво!');

  // Retry is always available, so a stuck bear is never a dead end.
  await h.waitFor(`window.__maze.state().completed===1 && window.__maze.state().reached===0`,
    { timeout: 4000, label: 'the next maze to start' });
  await h.tap('#maze-retry');
  const afterRetry = await state();
  check('the retry button starts the current maze over',
    afterRetry.reached === 0 && afterRetry.misses === 0, JSON.stringify(afterRetry));

  // Second maze completes: the celebration fires on every second maze.
  const celebrationsBefore = Number(await h.evalv(`window.__mazeCelebrations`));
  await solveMaze();
  await h.waitFor(`window.__maze.state().completed===2`, { timeout: 4000, label: 'the second maze to complete' });
  const celebrated = await h.waitFor(`window.__mazeCelebrations===${celebrationsBefore + 1}`,
    { timeout: 2500, label: 'the celebration on the second completed maze' });
  check('celebrates on every second completed maze', celebrated.ok, celebrated.why);

  // Every maze must be solvable: a path with a dead end would strand the child.
  const allSolvable = await h.evalv(`(()=>{
    const mazes=window.__maze; if(!mazes) return 'no hook';
    for (let i=0;i<3;i++){ mazes.goToMaze(i);
      const s=mazes.state();
      if (!s.cells || s.cells < 3 || s.id !== ['first-bend','zigzag','long-way-round'][i]) return 'maze '+i+' bad';
    }
    return 'ok';
  })()`);
  check('all three mazes build with their own ids and a real path', allSolvable === 'ok', String(allSolvable));

  const index = fs.readFileSync(path.join(__dirname, '..', 'game', 'index.html'), 'utf8');
  check('hub button wired (data-go="game-maze")', index.includes('data-go="game-maze"'));
  checkRouteWired('maze', 'game-maze', 'pages/maze.html',
    { back: 'maze-back', start: 'startMaze', check });

  await h.close();
  console.log(`\n${getFails() === 0 ? 'ALL' : 'SOME'} CHECKS ${getFails() === 0 ? 'PASSED' : 'FAILED'} (${getFails()} fail)`);
  process.exit(getFails() ? 1 : 0);
})().catch(error => { console.error('maze_smoke crashed:', error); process.exit(1); });