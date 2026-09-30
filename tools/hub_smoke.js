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
  check('games tile opens games sub-hub (10 buttons, explorer back target intact)', G.active === 'hub-games' && G.title === '🎮 ИГРЕ' && G.go.split(',').length === 10 && G.go === 'game-explorer,game-driving,game-ocean,game-dino,game-space,game-candy,game-memory,game-puzzle,game-racing,game-racing3d', games);

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
  const allGo = ['game-explorer','game-driving','game-ocean','game-dino','game-space','game-candy','game-memory','game-puzzle','game-classroom','game-tracing','game-animals','game-shapes','game-counting','game-coloring','game-piano'];
  check('all 15 game buttons still wired (data-go present)', allGo.every(id => html.includes(`data-go="${id}"`)), allGo.join(','));
  check('explorer back button targets the games sub-hub', html.includes('data-go="game-explorer"') && /data-go="game-explorer"[\s\S]*?aria-label="Мала истраживачица"/.test(html), 'data-go="game-explorer"');

  // R12 acceptance: no technical / offline-management action may be exposed on the
  // child launcher. Only the parent lock may lead to those. This is a static check
  // on the child hub's markup, so it cannot be defeated by a re-layout.
  const TECHNICAL = ['download-offline', 'check-updates', 'offline-zip', 'download-status',
                     'reset-progress', 'audio-test', 'offline-manifest', 'serviceWorker'];
  const leaked = TECHNICAL.filter(id => html.includes(id));
  check('R12: child hub exposes NO technical/offline controls (parent lock is the only entry)',
    leaked.length === 0, leaked.length ? 'leaked: ' + leaked.join(',') : 'clean');
  check('R12: child hub keeps exactly one parent entry point',
    (html.match(/data-go="game-parent"/g) || []).length === 1, 'game-parent links=' +
    (html.match(/data-go="game-parent"/g) || []).length);

  // Regression guard (task 105): on a short landscape viewport the 24vh grid
  // margin + 2 columns put the last row below the fold, so the racing3d button
  // was only reachable after navigating into and back out of a game.
  await h.c.send('Emulation.setDeviceMetricsOverride', { width: 844, height: 390, deviceScaleFactor: 1, mobile: false });
  await sleep(300);
  await h.evalv(`window.goTo('hub-games')`);
  await sleep(400);
  const shortVp = await h.evalv(`JSON.stringify((() => {
    const vh = window.innerHeight;
    const bad = [];
    document.querySelectorAll('#hub-games .hub-btn:not([hidden])').forEach(b => {
      const r = b.getBoundingClientRect();
      if (r.top < -1 || r.bottom > vh + 1) bad.push(b.dataset.go + ':' + Math.round(r.bottom) + '/' + vh);
    });
    const last = document.querySelector('[data-go="game-racing3d"]').getBoundingClientRect();
    return { vh, bad, racing3dBottom: Math.round(last.bottom),
             cols: getComputedStyle(document.querySelector('#hub-games .hub-grid')).gridTemplateColumns.split(' ').length };
  })())`);
  const S = JSON.parse(shortVp);
  check('short landscape (844x390): every visible games button is inside the viewport, racing3d included', S.bad.length === 0 && S.racing3dBottom <= S.vh + 1, shortVp);

  h.close();
  const fails = getFails();
  console.log(`\n${fails === 0 ? 'ALL' : 'SOME'} CHECKS ${fails === 0 ? 'PASSED' : 'FAILED'} (${fails} fail)`);
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error('hub_smoke crashed:', e); process.exit(1); });
