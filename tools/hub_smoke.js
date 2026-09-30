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

  // Readiness wait, NOT retry-until-pass. A `.click()` that navigates is applied
  // by the page's own handler, and under parallel load a fixed sleep races it:
  // the observed flake was `active: 'hub', go: ''` — the assertion ran before
  // the class swap, so it reported a wrong-game-panel failure for a hub that was
  // fine. Poll a condition unrelated to the assertion (navigation applied), then
  // let the assertion itself fail honestly if the panel is still wrong.
  const waitForActive = async (id, tries = 40, extra = null) => {
    for (let i = 0; i < tries; i++) {
      const got = await h.evalv(`(document.querySelector('.screen.active')||{}).id`);
      if (got === id) {
        if (!extra) return true;
        const ok2 = await h.evalv(extra);
        if (ok2) return true;
      }
      await sleep(50);
    }
    return false;
  };

  // Readiness wait on SCRIPT EXECUTION, not on static markup. The landing is
  // already `.active` in the shipped HTML, so waiting for that alone proves
  // nothing about the page's behaviour: in ~20% of runs the first click landed
  // before `shared/navigation.js` had run, the tile had no listener yet, and
  // `goTo` was never called at all (traced: `window.goTo === undefined` at click
  // time, empty call trace, no thrown error). A child cannot tap before the page
  // loads, so this is a harness race, not a game defect - and a readiness wait is
  // the honest fix, not a longer sleep.
  let ready = false;
  for (let i = 0; i < 25 && !ready; i++) {
    ready = await h.evalv(
      `!!(document.getElementById('hub') && document.getElementById('hub').classList.contains('active')) &&
       typeof window.goTo === 'function'`
    );
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
  const gamesReady = await waitForActive('hub-games', 60,
    `(() => { const a = document.querySelector('.screen.active'); return !!a && a.id === 'hub-games' && a.querySelectorAll('.hub-grid [data-go]').length === 10; })()`);
  const games = await h.evalv(`JSON.stringify((() => {
    const act = document.querySelector('.screen.active');
    return {
      ready: ${gamesReady},
      active: act && act.id,
      title: (act && act.querySelector('.hub-sub-title')) ? act.querySelector('.hub-sub-title').textContent : '',
      go: [...act.querySelectorAll('.hub-grid [data-go]')].map(b => b.dataset.go).join(',')
    };
  })())`);
  const G = JSON.parse(games);
  check('games tile opens games sub-hub (10 buttons, explorer back target intact)', gamesReady && G.active === 'hub-games' && G.title === '🎮 ИГРЕ' && G.go.split(',').length === 10 && G.go === 'game-explorer,game-driving,game-ocean,game-dino,game-space,game-candy,game-memory,game-puzzle,game-racing,game-racing3d', games);

  await h.evalv(`document.querySelector('#hub-games .back-btn').click()`);
  await waitForActive('hub');
  const back1 = await h.evalv(`document.querySelector('.screen.active').id`);
  check('games back button returns to landing', back1 === 'hub', back1);

  await h.evalv(`document.querySelector('.hub-tile.tile-learning').click()`);
  await waitForActive('hub-learning', 60,
    `(() => { const a = document.querySelector('.screen.active'); return !!a && a.id === 'hub-learning' && a.querySelectorAll('.hub-grid [data-go]').length === 7; })()`);
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
  await waitForActive('hub');
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
  await waitForActive('hub');
  await h.evalv(`window.goTo('hub-games')`);
  // The layout guard needs the reflowed grid, not just the class swap: poll until
  // the racing3d button actually has a non-zero height in the new viewport.
  let laidOut = false;
  for (let i = 0; i < 25 && !laidOut; i++) {
    laidOut = await h.evalv(
      `(() => { const b = document.querySelector('[data-go="game-racing3d"]');
        if (!b) return false; const r = b.getBoundingClientRect();
        return (document.querySelector('.screen.active')||{}).id === 'hub-games' && r.height > 0; })()`
    );
    if (!laidOut) await sleep(50);
  }
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
