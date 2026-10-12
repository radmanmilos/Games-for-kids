/* Petrin svet hub smoke test — two-level landing (two group tiles → sub-hubs).
   Drives index.html headlessly: the landing shows the title + two tiles (ИГРЕ /
   УЧЕЊЕ), each sub-hub shows its registered buttons in hubOrder, the
   back buttons return to the landing, and the static wiring is in place (every
   game data-go present, with no legacy embedded Kitty/Explorer UI in the hub).
   Run:  node tools/hub_smoke.js     (from the repo root or anywhere)
   Requires Node >= 22. CHROME_PATH env optional. */
const { start, check, getFails } = require('./headless.js');
const { routesByGroup, allHubRoutes, RETIRED_ROUTES } = require('./registry.js');
const fs = require('fs');
const path = require('path');

const sleep = ms => new Promise(r => setTimeout(r, ms));

/* R7: the expected button order per sub-hub comes from the registry's `route` +
 * `hubGroup` + `hubOrder`, not from lists hand-written here. Three such lists used
 * to live in this file and had already drifted - `game-racing` was asserted as a
 * live games button even though its page was deleted in task 131 and the button is
 * `hidden`. A typo in a route id now fails these checks instead of passing because
 * the test agreed with the typo.
 *
 * The games sub-hub ships 10 buttons: the 9 live routes plus the hidden, retired
 * `game-racing`, kept in the markup so the grid layout does not shift. That
 * retirement is the ONLY reason this file still names a route the registry does
 * not declare, and even its position comes from the registry module. */
const GAMES_EXPECTED = allHubRoutes().slice(0, routesByGroup('games').length + RETIRED_ROUTES.length);
const LEARNING_EXPECTED = routesByGroup('learning');
const ALL_LIVE_ROUTES = allHubRoutes().filter(r => !RETIRED_ROUTES.some(d => d.route === r));

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
  // The expected count is derived from the registry, never a literal. This wait
  // hardcoded 10, which happened to be correct only by coincidence (9 live games
  // routes + 1 retired). Adding one more games-category game — exactly what R21
  // did for the LEARNING count at line 27 — would have made this readiness wait
  // never satisfy and turned a correct hub into a red smoke.
  const gamesReady = await waitForActive('hub-games', 60,
    `(() => { const a = document.querySelector('.screen.active'); return !!a && a.id === 'hub-games' && a.querySelectorAll('.hub-grid [data-go]').length === ${GAMES_EXPECTED.length}; })()`);
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
  check('games tile opens games sub-hub (10 buttons, explorer back target intact)', gamesReady && G.active === 'hub-games' && G.title === '🎮 ИГРЕ' && G.go.split(',').length === GAMES_EXPECTED.length && G.go === GAMES_EXPECTED.join(','), games);

  await h.evalv(`document.querySelector('#hub-games .back-btn').click()`);
  await waitForActive('hub');
  const back1 = await h.evalv(`document.querySelector('.screen.active').id`);
  check('games back button returns to landing', back1 === 'hub', back1);

  await h.evalv(`document.querySelector('.hub-tile.tile-learning').click()`);
  await waitForActive('hub-learning', 60,
    `(() => { const a = document.querySelector('.screen.active'); return !!a && a.id === 'hub-learning' && a.querySelectorAll('.hub-grid [data-go]').length === ${LEARNING_EXPECTED.length}; })()`);
  const learning = await h.evalv(`JSON.stringify((() => {
    const act = document.querySelector('.screen.active');
    return {
      active: act && act.id,
      title: act.querySelector('.hub-sub-title').textContent,
      go: [...act.querySelectorAll('.hub-grid [data-go]')].map(b => b.dataset.go).join(',')
    };
  })())`);
  const L2 = JSON.parse(learning);
  check(`learning tile opens learning sub-hub (${LEARNING_EXPECTED.length} buttons)`, L2.active === 'hub-learning' && L2.title === '🧠 УЧЕЊЕ' && L2.go.split(',').length === LEARNING_EXPECTED.length && L2.go === LEARNING_EXPECTED.join(','), learning);

  await h.evalv(`document.querySelector('#hub-learning .back-btn').click()`);
  await waitForActive('hub');
  const back2 = await h.evalv(`document.querySelector('.screen.active').id`);
  check('learning back button returns to landing', back2 === 'hub', back2);

  const html = fs.readFileSync(path.join(__dirname, '..', 'game', 'index.html'), 'utf8');
  check(`all ${ALL_LIVE_ROUTES.length} child routes still wired (data-go present)`, ALL_LIVE_ROUTES.every(id => html.includes(`data-go="${id}"`)), ALL_LIVE_ROUTES.join(','));
  // The retired routes are named in ONE place (tools/registry.js). Each must still be
  // present in the markup - so the grid does not reflow - but hidden, because
  // navigation.js resolves routes from the registry and these resolve to nothing.
  const retiredInMarkup = RETIRED_ROUTES.filter(d => html.includes(`data-go="${d.route}"`));
  const retiredHidden = retiredInMarkup.length === RETIRED_ROUTES.length
    && retiredInMarkup.every(d => new RegExp(`<[^>]*data-go="${d.route}"[^>]*hidden`).test(html));
  check('retired hub routes are still in the markup but hidden (layout stability)', retiredHidden,
    RETIRED_ROUTES.map(d => d.route + (retiredInMarkup.includes(d) ? '=present' : '=ABSENT')).join(','));
  check('explorer back button targets the games sub-hub', html.includes('data-go="game-explorer"') && /data-go="game-explorer"[\s\S]*?aria-label="Мала истраживачица"/.test(html), 'data-go="game-explorer"');
  const legacyEmbeddedUI = /<iframe\b/i.test(html)
    || /#(?:game-kitty|kitty-(?:container|canvas|score|controls|win|next|embedded))\b/i.test(html);
  check('hub has no legacy embedded Kitty/Explorer UI', !legacyEmbeddedUI,
    legacyEmbeddedUI ? 'legacy iframe or selector found' : 'clean');

  // R12 acceptance: no technical / offline-management action may be exposed on the
  // child launcher. Only the parent lock may lead to those. This is a static check
  // on the child hub's markup, so it cannot be defeated by a re-layout.
  const TECHNICAL = ['download-offline', 'check-updates', 'download-status',
                     'reset-progress', 'audio-test', 'offline-manifest', 'serviceWorker'];
  const leaked = TECHNICAL.filter(id => html.includes(id));
  check('R12: child hub exposes NO technical/offline controls (parent lock is the only entry)',
    leaked.length === 0, leaked.length ? 'leaked: ' + leaked.join(',') : 'clean');
  check('R12: child hub keeps exactly one parent entry point',
    (html.match(/data-go="game-parent"/g) || []).length === 1, 'game-parent links=' +
    (html.match(/data-go="game-parent"/g) || []).length);

  // V5.1 (spec §23): the shared learning-stage grammar is the ONE vocabulary for
  // the learning family. Static wiring, so a re-layout cannot defeat it: the file
  // defines the four regions + the opt-in container, and every learning page links
  // it. (The tagged regions themselves are asserted per page in their own smokes.)
  const lsCss = fs.readFileSync(path.join(__dirname, '..', 'game', 'styles', 'learning-stage.css'), 'utf8');
  check('V5.1: learning-stage.css defines the §23 regions + container',
    ['.learn-instruction', '.learn-stage-mat', '.learn-answers', '.learn-feedback', '.learn-stage']
      .every(s => lsCss.includes(s)), 'missing a region');
  const LEARNING_PAGES = ['animal_counting', 'animal_memory', 'animal_puzzle', 'animals', 'classroom',
    'coloring', 'compare', 'matching_game', 'phonics', 'sequencing', 'shapes', 'sorting', 'spatial', 'tracing'];
  const pagesDir = path.join(__dirname, '..', 'game', 'pages');
  const notLinked = LEARNING_PAGES.filter(p =>
    !fs.readFileSync(path.join(pagesDir, p + '.html'), 'utf8').includes('styles/learning-stage.css'));
  check('V5.1: every learning page links the shared learning-stage.css', notLinked.length === 0, notLinked.join(','));

  // V6.1 (spec §24): the Petrin Glow is the ONE reusable focus/attention treatment —
  // defined once in the shared accessibility.css as a static box-shadow contract
  // (subtle, never a semantic colour). V6.2 applies it; this pins that it exists.
  const a11yCss = fs.readFileSync(path.join(__dirname, '..', 'game', 'shared', 'accessibility.css'), 'utf8');
  check('V6.1: accessibility.css defines .ps-focus-glow (the §24 reusable treatment)',
    a11yCss.includes('.ps-focus-glow') &&
    /0 0 0 3px rgb\(155 109 255/.test(a11yCss) &&
    /0 8px 22px rgb\(74 63 107/.test(a11yCss), 'glow contract missing');
  // The glow + reduced-motion live in the shared base stack, so every child page must
  // link accessibility.css — a malformed/missing link silently drops both (task 221
  // found exactly that on sequencing.html).
  const noA11y = fs.readdirSync(pagesDir).filter(f => f.endsWith('.html'))
    .filter(f => !fs.readFileSync(path.join(pagesDir, f), 'utf8').includes('shared/accessibility.css'));
  check('V6.1: every child page links the shared accessibility.css', noA11y.length === 0, noA11y.join(','));

  // V6.2 (spec §5.3/§24): the glow is APPLIED to the six attention states. Static wiring:
  // one source of truth (--ps-glow), every category has a selector, the treatment is a
  // box-shadow and never an animation, no error/success state can carry it, and each page
  // whose state rule already sets a box-shadow merges --ps-glow — otherwise the page rule
  // (loaded after this file) wins the cascade and the glow silently renders nowhere.
  check('V6.2: --ps-glow is the single source and .ps-focus-glow consumes it',
    /:root\s*\{[^}]*--ps-glow:\s*0 0 0 3px rgb\(155 109 255/.test(a11yCss) &&
    /\.ps-focus-glow\s*\{\s*box-shadow:\s*var\(--ps-glow\)/.test(a11yCss), 'glow not sourced from --ps-glow');
  const glowBlock = a11yCss
    .slice(a11yCss.indexOf('/* V6.2'), a11yCss.indexOf('/* Shared feedback animations */'))
    .replace(/\/\*[\s\S]*?\*\//g, '');
  check('V6.2: all six attention states carry the glow (focus/current card/expected/selected/active/hint)',
    [':focus-visible', '.card.flipped:not(.matched)', '.seq-slot.seq-over', '.sort-basket.sort-over',
     '.piece.kb-selected', '.class-tab.active', '.mode-btn.active', '.recog-toggle.active',
     '#shapesTier button.active', '.coloring-mode-toggle.free', '.cmp-answer.cmp-hint',
     '.phonics-choice.phonics-hint', '.sort-basket.sort-hint', '.candy-grid .candy.hint',
     '.slot.hint'].every(s => a11yCss.includes(s)), 'a state selector is missing');
  check('V6.2: the glow never touches an error/success state and is never animated',
    !/\b(wrong|error|miss|correct|good|hit)\b/i.test(glowBlock) && !/animation\s*:/.test(glowBlock),
    'glow leaked into a non-state or animates');
  const GLOW_MERGES = {
    'sorting.html': ['.sort-item.sort-selected'],
    'spatial.html': ['.spatial-choice.spatial-hint'],
    'animals.html': ['.recog-choice.recog-hint'],
    'classroom.html': ['.class-tab.active'],
    'piano.html': ['.mode-btn.on', '.song-chip.on', '#modeFree.on'],
    'shapes.html': ['@keyframes hintPulse'],
    'matching_game.html': ['@keyframes hintGlow'],
  };
  const noMerge = Object.entries(GLOW_MERGES).filter(([f, sels]) => {
    const src = fs.readFileSync(path.join(pagesDir, f), 'utf8');
    return sels.some(sel => {
      const i = src.indexOf(sel);
      return i === -1 || !src.slice(i, i + 400).includes('var(--ps-glow)');
    });
  });
  check('V6.2: every page whose state rule owns a box-shadow merges --ps-glow (cascade)',
    noMerge.length === 0, noMerge.map(x => x[0]).join(','));

  // V7.1 (spec §25/§44): one tactile component layer defines the ten control families
  // ONCE, so a page stops copy-pasting chrome (spec §22 "never five copies of the same
  // header CSS"). Static wiring, so a re-layout cannot defeat it: the file defines every
  // family, every child page links it, the back control has a canonical chrome rule, and
  // the pages that adopted .ps-back actually carry the class.
  const compCss = fs.readFileSync(path.join(__dirname, '..', 'game', 'styles', 'components.css'), 'utf8');
  const COMPONENTS = ['.ps-btn', '.ps-btn--secondary', '.ps-btn--icon', '.ps-back', '.ps-card',
    '.ps-drag', '.ps-modal', '.ps-chip', '.ps-instruction', '.ps-complete'];
  check('V7.1: components.css defines all ten tactile families',
    COMPONENTS.every(s => compCss.includes(s + ' {')), 'missing a family');
  const noComp = fs.readdirSync(pagesDir).filter(f => f.endsWith('.html'))
    .filter(f => !fs.readFileSync(path.join(pagesDir, f), 'utf8').includes('styles/components.css'));
  check('V7.1: every child page links the shared components.css', noComp.length === 0, noComp.join(','));
  check('V7.1: .ps-back carries the canonical back-control chrome (spec §44.1)',
    /\.ps-back\s*\{[^}]*width:\s*var\(--ps-back-size/.test(compCss) &&
    /\.ps-back\s*\{[^}]*box-shadow:/.test(compCss) &&
    /\.ps-back:active\s*\{\s*transform:/.test(compCss), 'back control contract missing');
  const BACK_ADOPTED = ['classroom', 'animals', 'coloring', 'matching_game', 'piano', 'shapes', 'tracing', 'parent'];
  const notAdopted = BACK_ADOPTED.filter(p =>
    !fs.readFileSync(path.join(pagesDir, p + '.html'), 'utf8').includes('class="back-btn ps-back"'));
  check('V7.1: adopted pages carry .ps-back on their back controls', notAdopted.length === 0, notAdopted.join(','));

  /* V20 (spec §38): phone portrait is the hub screen with the dead space — the two
   * group tiles used to sit at their 150px clamp floor (34vmin = 132.6 < 150) under
   * a 22vh offset that fought the centring flex, so the child's entire navigation
   * occupied 166 of 844px with a 335px (40%) void above it. These checks assert the
   * LIVE geometry at real viewports (readiness-wait on the reflow, never a sleep):
   * the cluster is stacked and enlarged on a phone, the void is small, the pair
   * still clears the title and the parent lock on a SHORT phone (the 22vh cap is
   * what buys that clearance — drop it and a 40vh cluster collides), the rule does
   * not leak into landscape, and the sub-hub grids clear their titles by a real
   * gap instead of the old flat 24vh (which left 116–136px of dead band while the
   * learning grid scrolled off the bottom). */
  const measureLanding = async (width, height) => {
    await h.c.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
    await waitForActive('hub');
    /* Readiness = the reflow settled (two identical reads of a sized tile with the
     * landing active), never a fixed sleep and never the assertion itself. */
    let prev = '', stable = 0;
    for (let i = 0; i < 25 && stable < 2; i++) {
      const now = await h.evalv(`(function(){
        var t = document.querySelector('.hub-tile'); if (!t) return '';
        var r = t.getBoundingClientRect();
        return (document.querySelector('.screen.active')||{}).id + ':' + Math.round(r.top) + ':' + Math.round(r.height);
      })()`);
      const m = /^hub:-?\d+:(\d+)$/.exec(now);
      stable = (m && +m[1] > 0 && now === prev) ? stable + 1 : 0;
      prev = now;
      if (stable < 2) await sleep(50);
    }
    return JSON.parse(await h.evalv(`JSON.stringify((function(){
      var R = function(s){ var e = document.querySelector(s); if (!e) return null;
        var r = e.getBoundingClientRect();
        return { t: r.top, b: r.bottom, l: r.left, r: r.right, w: r.width, h: r.height }; };
      var title = R('#hub-title'), tiles = R('.hub-tiles'), learn = R('.tile-learning'),
          games = R('.tile-games'), lock = R('[data-go="game-parent"]');
      var vh = innerHeight;
      var bands = [tiles.t - title.b,
                   lock ? lock.t - tiles.b : vh - tiles.b,
                   lock ? vh - lock.b : 0];
      return { vw: innerWidth, vh: vh, title: title, tiles: tiles, learn: learn,
               games: games, lock: lock, biggestBand: Math.max.apply(null, bands) };
    })())`));
  };
  const hits2 = (a, b) => Math.max(0, Math.min(a.r, b.r) - Math.max(a.l, b.l)) *
                          Math.max(0, Math.min(a.b, b.b) - Math.max(a.t, b.t));

  const V20P = await measureLanding(390, 844);
  check('V20: phone portrait stacks the two group tiles into one tall cluster',
    V20P.tiles.h >= 2 * V20P.learn.h - 8 && V20P.games.t > V20P.learn.b,
    JSON.stringify({ tiles: Math.round(V20P.tiles.h), tile: Math.round(V20P.learn.h), gamesTop: Math.round(V20P.games.t) }));
  check('V20: phone portrait tiles are enlarged past the old 150px clamp floor',
    V20P.learn.w >= 180 && Math.abs(V20P.learn.w - V20P.games.w) < 1,
    JSON.stringify({ learn: Math.round(V20P.learn.w), games: Math.round(V20P.games.w) }));
  check('V20: phone portrait keeps a calm rhythm (no empty band above 30% of the screen)',
    V20P.biggestBand <= 0.3 * V20P.vh,
    'biggestBand=' + Math.round(V20P.biggestBand) + '/' + V20P.vh + ' (' + Math.round(1000 * V20P.biggestBand / V20P.vh) / 10 + '%)');

  // The 22vh cap is a clearance guarantee, not a size preference: on a short phone
  // the stacked pair must still fit between the title box and the 96px parent lock.
  const V20S = await measureLanding(360, 640);
  const clearOf = m => hits2(m.tiles, m.title) === 0 && hits2(m.tiles, m.lock) === 0 &&
    m.tiles.t - m.title.b >= 8 && m.lock.t - m.tiles.b >= 8;
  check('V20: the enlarged portrait cluster clears the title and the parent lock (390x844 and 360x640)',
    clearOf(V20P) && clearOf(V20S),
    JSON.stringify({ p390: [Math.round(V20P.tiles.t - V20P.title.b), Math.round(V20P.lock.t - V20P.tiles.b)],
                     s360: [Math.round(V20S.tiles.t - V20S.title.b), Math.round(V20S.lock.t - V20S.tiles.b)],
                     hit360: hits2(V20S.tiles, V20S.title) + '/' + hits2(V20S.tiles, V20S.lock) }));

  // Sub-hub rhythm: the old flat `margin:24vh` left 116px (390x844) / 136px
  // (820x1180) / 70px (1024x800) of dead band between the sub-hub title and the
  // first row while the learning grid scrolled. The replacement tracks the title's
  // own box, so the gap is a constant ~45px on every tall viewport.
  const subGaps = [];
  for (const [vw, vh] of [[390, 844], [820, 1180], [1024, 800]]) {
    await h.c.send('Emulation.setDeviceMetricsOverride', { width: vw, height: vh, deviceScaleFactor: 1, mobile: false });
    await waitForActive('hub');
    await h.evalv(`window.goTo('hub-games')`);
    let ready2 = false;
    for (let i = 0; i < 25 && !ready2; i++) {
      ready2 = await h.evalv(`(function(){
        var a = document.querySelector('.screen.active'); if (!a || a.id !== 'hub-games') return false;
        var g = a.querySelector('.hub-grid'); if (!g) return false;
        var r = g.getBoundingClientRect();
        return r.height > 0 && r.top > 0;
      })()`);
      if (!ready2) await sleep(50);
    }
    const gap = await h.evalv(`(function(){
      var a = document.querySelector('.screen.active');
      var g = a.querySelector('.hub-grid').getBoundingClientRect();
      var t = a.querySelector('.hub-sub-title').getBoundingClientRect();
      return Math.round(g.top - t.bottom);
    })()`);
    subGaps.push(vw + 'x' + vh + '=' + gap);
  }
  const gapsOk = subGaps.every(s => { const g = +s.split('=')[1]; return g >= 24 && g <= 64; });
  check('V20: sub-hub grids clear their titles by a real gap at every tall viewport (24-64px)', gapsOk, subGaps.join(' '));
  await h.evalv(`window.goTo('hub')`);
  await waitForActive('hub');

  // Scoping: the portrait block must not reach landscape. 844x390 keeps the
  // side-by-side pair (and the task-105 games guard below keeps pinning the grid).
  const V20L = await measureLanding(844, 390);
  check('V20: the portrait rule does not leak into landscape (tiles stay side-by-side)',
    Math.abs(V20L.learn.t - V20L.games.t) < 2 && V20L.learn.h <= 1.3 * V20L.learn.w && V20L.learn.w >= 96,
    JSON.stringify({ learnTop: Math.round(V20L.learn.t), gamesTop: Math.round(V20L.games.t), w: Math.round(V20L.learn.w), h: Math.round(V20L.learn.h) }));

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

  await h.close();
  const fails = getFails();
  console.log(`\n${fails === 0 ? 'ALL' : 'SOME'} CHECKS ${fails === 0 ? 'PASSED' : 'FAILED'} (${fails} fail)`);
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error('hub_smoke crashed:', e); process.exit(1); });
