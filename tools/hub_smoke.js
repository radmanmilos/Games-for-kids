/* Petrin svet hub smoke test — two-level landing (two group tiles → sub-hubs).
   Drives index.html headlessly: the landing shows the title + two tiles (ИГРЕ /
   УЧЕЊЕ), the games sub-hub shows its 8 buttons, the learning sub-hub its 7, the
   back buttons return to the landing, and the static wiring is in place (every
   game data-go present, kitty's back button returns to the games sub-hub).
   Run:  node tools/hub_smoke.js     (from the repo root or anywhere)
   Requires Node >= 22. CHROME_PATH env optional. */
const { start, check, getFails } = require('./headless.js');
const fs = require('fs');
const path = require('path');

const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const h = await start({ page: '/', tag: 'hub-smoke', width: 1100, height: 700 });

  let ready = false;
  for (let i = 0; i < 25 && !ready; i++) {
    ready = await h.evalv(`document.getElementById('hub') && document.getElementById('hub').classList.contains('active')`);
    if (!ready) await sleep(200);
  }
  check('hub landing rendered (active)', ready);

  const landing = await h.evalv(`JSON.stringify((() => {
    const act = document.querySelector('.screen.active');
    const tiles = [...document.querySelectorAll('.hub-tile')].map(t => t.querySelector('.tile-label').textContent);
    return {
      active: act && act.id,
      title: document.getElementById('hub-title').textContent,
      tiles: tiles.join(','),
      tileButtons: document.querySelectorAll('.hub-tile').length,
      learnEmojis: [...document.querySelector('.hub-tile.tile-learning').querySelectorAll('.tile-emojis span')].map(s => s.textContent).join(','),
      games: document.getElementById('hub-games') ? document.getElementById('hub-games').querySelectorAll('[data-go]').length : -1,
      learning: document.getElementById('hub-learning') ? document.getElementById('hub-learning').querySelectorAll('[data-go]').length : -1
    };
  })())`);
  const L = JSON.parse(landing);
  check('landing: title visible, learning first, two labeled tiles, only landing active', L.active === 'hub' && L.title === '🌈 Петрин свет' && L.tiles === 'УЧЕЊЕ,ИГРЕ' && L.tileButtons === 2, landing);
  check('learning tile shows 4 emoji cells (2x2)', L.learnEmojis === '🏫,📝,🎹,🎨', landing);

  await h.evalv(`document.querySelector('.hub-tile.tile-games').click()`);
  await sleep(300);
  const games = await h.evalv(`JSON.stringify((() => {
    const act = document.querySelector('.screen.active');
    return {
      active: act && act.id,
      title: document.querySelector('.hub-sub-title') ? document.querySelector('.hub-sub-title').textContent : '',
      go: [...act.querySelectorAll('.hub-grid [data-go]')].map(b => b.dataset.go).join(',')
    };
  })())`);
  const G = JSON.parse(games);
  check('games tile opens games sub-hub (8 buttons, kitty back target intact)', G.active === 'hub-games' && G.title === '🎮 ИГРЕ' && G.go.split(',').length === 8 && G.go === 'game-kitty,game-driving,game-ocean,game-dino,game-space,game-candy,game-memory,game-puzzle', games);

  await h.evalv(`document.querySelector('#hub-games .back-btn').click()`);
  await sleep(300);
  const back1 = await h.evalv(`document.querySelector('.screen.active').id`);
  check('games back button returns to landing', back1 === 'hub', back1);

  await h.evalv(`document.querySelector('.hub-tile.tile-learning').click()`);
  await sleep(300);
  const learning = await h.evalv(`JSON.stringify((() => {
    const act = document.querySelector('.screen.active');
    return {
      active: act && act.id,
      title: act.querySelector('.hub-sub-title').textContent,
      go: [...act.querySelectorAll('.hub-grid [data-go]')].map(b => b.dataset.go).join(',')
    };
  })())`);
  const L2 = JSON.parse(learning);
  check('learning tile opens learning sub-hub (7 buttons)', L2.active === 'hub-learning' && L2.title === '🧠 УЧЕЊЕ' && L2.go.split(',').length === 7 && L2.go === 'game-classroom,game-tracing,game-animals,game-shapes,game-counting,game-coloring,game-piano', learning);

  await h.evalv(`document.querySelector('#hub-learning .back-btn').click()`);
  await sleep(300);
  const back2 = await h.evalv(`document.querySelector('.screen.active').id`);
  check('learning back button returns to landing', back2 === 'hub', back2);

  const html = fs.readFileSync(path.join(__dirname, '..', 'game', 'index.html'), 'utf8');
  const allGo = ['game-kitty','game-driving','game-ocean','game-dino','game-space','game-candy','game-memory','game-puzzle','game-classroom','game-tracing','game-animals','game-shapes','game-counting','game-coloring','game-piano'];
  check('all 15 game buttons still wired (data-go present)', allGo.every(id => html.includes(`data-go="${id}"`)), allGo.join(','));
  check('kitty back button targets the games sub-hub', html.includes('id="game-kitty"') && /id="game-kitty"[\s\S]*?data-go="hub-games"/.test(html), 'data-go="hub-games"');

  h.close();
  const fails = getFails();
  console.log(`\n${fails === 0 ? 'ALL' : 'SOME'} CHECKS ${fails === 0 ? 'PASSED' : 'FAILED'} (${fails} fail)`);
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error('hub_smoke crashed:', e); process.exit(1); });
