/* Petrin svet Candy (Слагалица бомбона) smoke test — task 66 polish.
   Drives pages/matching_game.html headlessly: boots at level 1 (4x4, 16 tiles),
   the level label + cute progress bar are present and empty, the grid always fits
   the viewport (px-converted), the bar fills as the level score grows, crossing
   the target levels up (fresh board one row+column bigger, score reset, bar empty,
   overlay, set rotation, shrunken tiles). Then: the hint button shows a "Погледај ..."
   message and highlights the two tiles of a possible swap, and the star-spawn
   logic kicks in on a dead board at EVERY grid size (4x4 and 5x5).
   Run:  node tools/candy_smoke.js     (from the repo root or anywhere)
   Requires Node >= 22. CHROME_PATH env optional. */
const { start, check, getFails } = require('./headless.js');

const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const h = await start({ page: '/pages/matching_game.html', tag: 'candy-smoke', width: 900, height: 800 });

  let ready = false;
  for (let i = 0; i < 25 && !ready; i++) {
    ready = await h.evalv(`document.querySelectorAll('#candyGrid .candy').length === 16 && document.querySelector('#candyScore .matching-score-value').textContent === '0'`);
    if (!ready) await sleep(200);
  }
  check('candy boots at level 1 (16 tiles, score 0)', ready);

  const lv1 = await h.evalv(`JSON.stringify((() => {
    const grid = document.getElementById('candyGrid');
    const px = Math.min(innerWidth, innerHeight) / 100;
    return {
      label: document.getElementById('candyLevelLabel').textContent,
      bar: document.getElementById('candyBarFill').style.width,
      gw: parseFloat(grid.style.width),
      gpx: Math.round(parseFloat(grid.style.width) * px),
      gh: Math.round(parseFloat(grid.style.height) * px),
      tileW: parseFloat(document.querySelector('#candyGrid .candy').style.width),
      emoji: document.querySelector('#candyGrid .candy').textContent,
      vw: innerWidth, vh: innerHeight
    };
  })())`);
  const L1 = JSON.parse(lv1);
  check('level 1 label + empty progress bar', L1.label === 'Ниво 1 · до 60' && L1.bar === '0%', lv1);
  check('grid fits on screen (px): level 1', L1.gpx > 0 && L1.gpx <= L1.vw && L1.gh <= L1.vh, lv1);
  check('level 1 uses the farm animal set', '🐶🐮🐷🦆🐴🐔'.includes(L1.emoji), lv1);

  await h.evalv(`window.updateScore(30)`);
  const bar30 = await h.evalv(`document.getElementById('candyBarFill').style.width`);
  check('progress bar fills to 50% at score 30/60', bar30 === '50%', bar30);

  await h.evalv(`window.updateScore(60); window.resolveMatches()`);
  await sleep(300);
  const lv2 = await h.evalv(`JSON.stringify((() => {
    const grid = document.getElementById('candyGrid');
    const px = Math.min(innerWidth, innerHeight) / 100;
    return {
      label: document.getElementById('candyLevelLabel').textContent,
      score: document.querySelector('#candyScore .matching-score-value').textContent,
      tiles: document.querySelectorAll('#candyGrid .candy').length,
      bar: document.getElementById('candyBarFill').style.width,
      tileW: parseFloat(document.querySelector('#candyGrid .candy').style.width),
      emoji: document.querySelector('#candyGrid .candy').textContent,
      overlay: document.getElementById('levelUpMsg').classList.contains('show'),
      overlayText: document.getElementById('levelUpText').textContent,
      gpx: Math.round(parseFloat(grid.style.width) * px),
      gh: Math.round(parseFloat(grid.style.height) * px),
      vw: innerWidth, vh: innerHeight
    };
  })())`);
  const L2 = JSON.parse(lv2);
  check('level up: fresh 5x5 board, score reset, bar empty, overlay shown', L2.label === 'Ниво 2 · до 80' && L2.score === '0' && L2.tiles === 25 && L2.bar === '0%' && L2.overlay && L2.overlayText === 'Ниво 2!', lv2);
  check('grid fits on screen (px) + tiles shrank: level 2', L2.gpx <= L2.vw && L2.gh <= L2.vh && L2.tileW < L1.tileW, lv2);
  check('level 2 uses the wild animal set', '🦁🐘🐸🦊🐱🐑'.includes(L2.emoji), lv2);

  const hint = await h.evalv(`(() => {
    ROWS = 4; COLS = 4;
    board = [
      [0,1,1,1],
      [2,3,4,2],
      [5,0,3,4],
      [3,2,5,1]
    ];
    candyBusy = false; combo = 0;
    document.getElementById('candyHintBtn').click();
    return JSON.stringify({
      msg: (document.querySelector('.hint-float') || {}).textContent || '',
      hinted: document.querySelectorAll('#candyGrid .candy.hint').length
    });
  })()`);
  const H = JSON.parse(hint);
  check('hint button shows a "Погледај ... 😉" message', H.msg.startsWith('Погледај ') && H.msg.includes('😉'), hint);
  check('hint highlights the two tiles of the swap', H.hinted === 2, hint);

  const star4 = await h.evalv(`(() => {
    ROWS = 4; COLS = 4;
    board = [[0,1,3,0],[4,4,2,3],[0,3,5,4],[5,3,2,0]];
    candyBusy = false; combo = 0;
    resolveMatches();
    let star = false;
    for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++) if(board[r][c]===-1) star = true;
    return JSON.stringify({ star });
  })()`);
  check('dead board spawns a star (4x4)', JSON.parse(star4).star === true, star4);

  const star5 = await h.evalv(`(() => {
    ROWS = 5; COLS = 5;
    board = [[5,2,0,5,2],[3,3,1,1,5],[1,0,5,2,4],[0,2,3,3,4],[5,4,3,1,2]];
    candyBusy = false; combo = 0;
    resolveMatches();
    let star = false;
    for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++) if(board[r][c]===-1) star = true;
    return JSON.stringify({ star });
  })()`);
  check('dead board spawns a star at every grid size (5x5)', JSON.parse(star5).star === true, star5);

  h.close();
  const fails = getFails();
  console.log(`\n${fails === 0 ? 'ALL' : 'SOME'} CHECKS ${fails === 0 ? 'PASSED' : 'FAILED'} (${fails} fail)`);
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error('candy_smoke crashed:', e); process.exit(1); });
