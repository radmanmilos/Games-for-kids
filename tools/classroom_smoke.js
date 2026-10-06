/* Учионицa kids tier (За децу) smoke test — Phase 2 task 120 (GAME-CLASS-001).
   Drives the REAL pipeline headlessly: hub two-set render, entering each of the
   4 quiz games, wrong-answer nudge, correct-answer advance, session end + replay.
   Also tests category tabs: 4 tabs visible in activity mode, active state,
   tab switching between categories.
   PLUS (task 209) small-screen geometry guards: the global accessibility.css
   64px button min-size used to force .class-tile/.kids-option wider than their
   grid tracks (crowding + right-edge clip), the #kidsPrompt card flex-shrink
   let a 20-emoji count row clip, and the overflow hub top started at negative
   top. A phone session asserts tiles stay disjoint inside the grid, the kids
   prompt never clips (worst-case count row forced), and a tablet session
   asserts the hub is reachable (top-anchored) when taller than the viewport.
   Shared audio entry points are recorded so the activity proves it uses semantic
   events and ducked speech; audio-buses_smoke.js covers Web Audio routing itself.
   Run:  node tools/classroom_smoke.js  (from the repo root or anywhere)
   Requires Node >= 22. CHROME_PATH env optional. */
const { start, check, getFails } = require('./headless.js');

const sleep = ms => new Promise(r => setTimeout(r, ms));

const STUB = `window.__audioEvents=[];window.speech={speak:function(t,cb){if(cb)cb();},cancel:function(){}};window.audioBuses.play=function(name){window.__audioEvents.push('play:'+name);};window.audioBuses.speakWithDuck=function(text,cb){window.__audioEvents.push('speak:'+text);if(cb)cb();}; true`;

const CLICK = sel => `document.querySelector('${sel}').click(); true`;

(async () => {
  const h = await start({ page: '/pages/classroom.html', tag: 'kids-smoke', width: 1024, height: 800 });

  let ready = false;
  for (let i = 0; i < 20 && !ready; i++) {
    ready = await h.evalv(`typeof window.startClassroom === 'function' && typeof window.kidsGame === 'object'`);
    if (!ready) await sleep(200);
  }
  check('classroom + kids engine booted', ready);
  await h.evalv(STUB);

  const hub = await h.evalv(`JSON.stringify({
    babies: document.querySelectorAll('#classroomHub .activity-btn').length,
    kids: document.querySelectorAll('#classroomHub .kids-btn').length,
    groups: Array.from(document.querySelectorAll('.hub-group-title')).map(e => e.textContent)
  })`);
  const hubj = JSON.parse(hub);
  check('hub shows two sets (6+4) + labels', hubj.babies === 6 && hubj.kids === 4 && hubj.groups.join('|') === 'За малишане|За децу', hub);

  // --- Category tabs in activity mode ---
  await h.evalv(CLICK('#classroomHub .activity-btn[data-activity="alphabet"]'));
  await sleep(150);

  const tabsInfo = await h.evalv(`JSON.stringify({
    tabCount: document.querySelectorAll('.class-tab').length,
    tabLabels: Array.from(document.querySelectorAll('.class-tab')).map(t => t.textContent.trim()),
    activeTab: document.querySelector('.class-tab.active') ? document.querySelector('.class-tab.active').dataset.tab : null,
    tabsVisible: !document.getElementById('classroomActivity').hidden
  })`);
  const T = JSON.parse(tabsInfo);
  check('6 category tabs visible in activity mode', T.tabCount === 6 && T.tabsVisible === true, tabsInfo);
  const tabText = T.tabLabels.map(l => l.replace(/[^\u0400-\u04FF]/g, '')).join('|');
  /* The label filter strips spaces too (only Cyrillic survives), so the expected
     string has no space in Годишња доба — same normalization as the original
     four-tab assertion. */
  check('tabs labeled Азбука/Бројеви/Облици/Боје/Време/Годишња доба', tabText === 'Азбука|Бројеви|Облици|Боје|Време|Годишњадоба', T.tabLabels.join('|'));
  check('active tab matches current activity', T.activeTab === 'alphabet', tabsInfo);

  // The two new activities render every shared word, in order — the same
  // derived invariant the numbers tab uses, so adding a word stays green while
  // a classroom that stops rendering a word (or renders stale hardcoded tiles)
  // goes red. Време shows 4 time words; Годишња доба shows 4 seasons + 4 weather.
  // The tiles present emoji/time-pastels and SVG scenes, so the word itself is
  // carried by the tile's aria-label (same channel sequencing_smoke asserts).
  async function assertActivityWords(tab, title, serbianExpr) {
    await h.evalv(CLICK('.class-tab[data-tab="' + tab + '"]'));
    await sleep(150);
    const words = JSON.parse(await h.evalv(`JSON.stringify({
      activeTab: document.querySelector('.class-tab.active') ? document.querySelector('.class-tab.active').dataset.tab : null,
      got: document.getElementById('activityTitle').textContent
    })`));
    check('tab switch to ' + title + ' updates activity',
      words.activeTab === tab && words.got === title, JSON.stringify(words));
    const labels = await h.evalv(`JSON.stringify([...document.querySelectorAll('#activityGrid .class-tile')].map(t => t.getAttribute('aria-label')).filter(Boolean))`);
    const expected = await h.evalv(`JSON.stringify(window.SERBIAN.${serbianExpr})`);
    check(title + ': every shared word appears as a tile label, in order',
      labels === expected, `rendered ${labels} expected ${expected}`);
  }

  await assertActivityWords('time', 'Време', 'time.map(t => String(t))');
  await assertActivityWords('seasons', 'Годишња доба', 'seasons.concat(window.SERBIAN.weather).map(w => String(w))');

  // Back to the numbers tab where the audio-tap check below expects a tile.
  await h.evalv(CLICK('.class-tab[data-tab="numbers"]'));
  await sleep(150);

  // Tab switching: click Бројеви tab
  await h.evalv(CLICK('.class-tab[data-tab="numbers"]'));
  await sleep(150);
  const switched = await h.evalv(`JSON.stringify({
    activeTab: document.querySelector('.class-tab.active') ? document.querySelector('.class-tab.active').dataset.tab : null,
    title: document.getElementById('activityTitle').textContent,
    tiles: document.querySelectorAll('#activityGrid .class-tile').length
  })`);
  const SW = JSON.parse(switched);
  /* The tile count is derived from SERBIAN.numbers, not pinned at 11.
     This assertion used to hardcode 11, which pinned today's value: adding 11-20
     to the shared vocabulary (roadmap review Tier A item 2) would have turned it
     red for a change the assertion was never meant to police, and the lesson is
     the one R21 already applied to hub_smoke's LEARNING_EXPECTED. The real
     invariant is "the numbers activity renders exactly the shared vocabulary" —
     which still fails if classroom stops rendering a number, or renders a stale
     hardcoded set, so this is a stronger assertion, not a looser one. */
  const NUMBER_TILES = await h.evalv(`window.SERBIAN.numbers.length`);
  check('tab switch to Бројевi updates activity', SW.activeTab === 'numbers' && SW.title === 'Бројеви' && SW.tiles === NUMBER_TILES,
    switched + ` (expected ${NUMBER_TILES} tiles from SERBIAN.numbers)`);

  // Every shared number must actually appear, in order — catches a classroom that
  // renders the right COUNT of the wrong numbers, which a count alone cannot see.
  const numberLabels = await h.evalv(`JSON.stringify(
    [...document.querySelectorAll('#activityGrid .class-tile')].map(t => t.textContent.trim()))`);
  const expectedLabels = await h.evalv(`JSON.stringify(window.SERBIAN.numbers.map(n => String(n.label)))`);
  check('the numbers activity shows every shared number, in order',
    numberLabels === expectedLabels, `rendered ${numberLabels} expected ${expectedLabels}`);

  // Tab switching: click Облици tab
  await h.evalv(CLICK('.class-tab[data-tab="shapes"]'));
  await sleep(150);
  const shapesTab = await h.evalv(`JSON.stringify({
    activeTab: document.querySelector('.class-tab.active') ? document.querySelector('.class-tab.active').dataset.tab : null,
    title: document.getElementById('activityTitle').textContent
  })`);
  const ST = JSON.parse(shapesTab);
  check('tab switch to Облици updates activity', ST.activeTab === 'shapes' && ST.title === 'Облици', shapesTab);

  // Tab switching: click Боје tab
  await h.evalv(CLICK('.class-tab[data-tab="colors"]'));
  await sleep(150);
  const colorsTab = await h.evalv(`JSON.stringify({
    activeTab: document.querySelector('.class-tab.active') ? document.querySelector('.class-tab.active').dataset.tab : null,
    title: document.getElementById('activityTitle').textContent
  })`);
  const CT = JSON.parse(colorsTab);
  check('tab switch to Боје updates activity', CT.activeTab === 'colors' && CT.title === 'Боје', colorsTab);

  await h.evalv(`window.__audioEvents.length=0; true`);
  await h.evalv(CLICK('#activityGrid .class-tile'));
  const classroomAudio = JSON.parse(await h.evalv(`JSON.stringify(window.__audioEvents)`));
  check('classroom routes taps and labels through shared audio buses',
    classroomAudio[0] === 'play:tap' && classroomAudio.some(event => event.startsWith('speak:')), classroomAudio.join('|'));

  // Back to hub
  await h.evalv(CLICK('#classroomBack'));
  await sleep(100);

  // --- Kids tier quiz games ---
  for (const [kind, title] of [['alphabet', 'Азбука за децу'], ['numbers', 'Бројеви за децу'], ['colors', 'Боје за децу'], ['shapes', 'Облици за децу']]) {
    await h.evalv(CLICK(`#classroomHub .kids-btn[data-kids="${kind}"]`));
    await sleep(150);
    const r = await h.evalv(`JSON.stringify({
      visible: !document.getElementById('kidsGame').hidden,
      title: document.getElementById('kidsTitle').textContent,
      progress: document.getElementById('kidsProgress').textContent,
      opts: document.querySelectorAll('#kidsOptions .kids-option').length,
      answer: document.querySelectorAll('#kidsOptions .kids-option.is-answer').length,
      prompt: document.querySelector('#kidsPrompt .kids-question').textContent,
      countRow: !!document.querySelector('#kidsPrompt .kids-count-row')
    })`);
    const j = JSON.parse(r);
    check(kind + ': game screen shows title + 4 options + 1 answer', j.visible && j.title === title && j.progress === '1 од 8' && j.opts === 4 && j.answer === 1, r);
    if (kind === 'numbers') check('numbers: prompt shows countable emoji row', j.countRow === true, r);
    await h.evalv(CLICK('#kidsBack'));
    await sleep(100);
  }

  // full session in one game: wrong nudge, then 8 corrects -> finish -> replay
  await h.evalv(CLICK('#classroomHub .kids-btn[data-kids="alphabet"]'));
  await sleep(150);
  const wrong = await h.evalv(`(function(){
    const wrongBtn = Array.from(document.querySelectorAll('#kidsOptions .kids-option')).find(b => !b.classList.contains('is-answer'));
    wrongBtn.click();
    return true;
  })()`);
  await sleep(120);
  const w = await h.evalv(`JSON.stringify({ fb: document.getElementById('kidsFeedback').textContent, prog: document.getElementById('kidsProgress').textContent })`);
  const wj = JSON.parse(w);
  check('wrong tap nudges, question stays', wj.fb === 'Хајде поново!' && wj.prog === '1 од 8', w);

  for (let i = 0; i < 8; i++) {
    let busy = true;
    for (let w = 0; w < 60 && busy; w++) {
      busy = await h.evalv(`window.kidsGame.isBusy()`);
      if (busy) await sleep(100);
    }
    await h.evalv(`(function(){
      const a = document.querySelector('#kidsOptions .kids-option.is-answer');
      if(a) a.click();
      return true;
    })()`);
    await sleep(200);
  }
  await sleep(2000);
  const fin = await h.evalv(`JSON.stringify({ done: !document.getElementById('kidsFinished').hidden, sub: document.getElementById('kidsFinishedSub').textContent })`);
  const finj = JSON.parse(fin);
  check('8 corrects -> finish panel + score', finj.done && finj.sub === '8 од 8 тачно!', fin);

  await h.evalv(CLICK('#kidsReplay'));
  await sleep(150);
  const rep = await h.evalv(`JSON.stringify({ done: document.getElementById('kidsFinished').hidden, prog: document.getElementById('kidsProgress').textContent })`);
  const repj = JSON.parse(rep);
  check('replay restarts at 1 од 8', repj.done === true && repj.prog === '1 од 8', rep);

  await h.evalv(CLICK('#kidsExit'));
  await sleep(100);
  const back = await h.evalv(`JSON.stringify({ kidsHidden: document.getElementById('kidsGame').hidden, hubVisible: !document.getElementById('classroomHub').hidden })`);
  const backj = JSON.parse(back);
  check('back returns to hub', backj.kidsHidden === true && backj.hubVisible === true, back);

  // --- Small-screen geometry guards (task 209) ---
  // Phone session: grid tiles disjoint inside the grid + kids prompt never clips.
  const h2 = await start({ page: '/pages/classroom.html', tag: 'kids-smoke-phone', width: 360, height: 640 });
  let ready2 = false;
  for (let i = 0; i < 20 && !ready2; i++) {
    ready2 = await h2.evalv(`typeof window.startClassroom === 'function' && typeof window.kidsGame === 'object'`);
    if (!ready2) await sleep(200);
  }
  check('phone session: classroom + kids engine booted', ready2);
  await h2.evalv(STUB);

  // (a) activityGrid tiles: pairwise disjoint and each fits inside the grid —
  //     catches the global 64px button min-size crowding tiles into their tracks.
  await h2.evalv(CLICK('#classroomHub .activity-btn[data-activity="numbers"]'));
  await sleep(200);
  const tiles = JSON.parse(await h2.evalv(`JSON.stringify((function(){
    const grid = document.getElementById('activityGrid');
    const gb = grid.getBoundingClientRect();
    const boxes = [...grid.children].filter(c => c.offsetHeight > 0).map(c => c.getBoundingClientRect());
    let worst = 0;
    for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i], b = boxes[j];
      const cx = Math.min(a.right, b.right) - Math.max(a.left, b.left);
      const cy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
      if (cx > 0 && cy > 0) worst = Math.max(worst, Math.max(cx, cy));
    }
    const clip = boxes.filter(b => b.right > gb.right + 0.5 || b.left < gb.left - 0.5).length;
    let maxW = 0;
    for (const c of grid.children) if (c.offsetHeight > 0) maxW = Math.max(maxW, c.getBoundingClientRect().width);
    return { n: boxes.length, worst, clip, maxW };
  })())`));
  check('phone: activity tiles disjoint (no grid crowding/overlap)', tiles.n > 0 && tiles.worst === 0 && tiles.clip === 0, JSON.stringify(tiles));
  check('phone: tile widths come from the grid, not the 64px button floor', tiles.maxW < 64, JSON.stringify(tiles));

  // (b) kids numbers: a worst-case emoji count row must not clip the prompt.
  await h2.evalv(`window._origNums = window.classroomData.numbers; window.classroomData.numbers = window._origNums.filter(n => n.count >= 10); true`);
  await h2.evalv(CLICK('#classroomBack'));
  await sleep(100);
  await h2.evalv(CLICK('#classroomHub .kids-btn[data-kids="numbers"]'));
  await sleep(300);
  const promptGeom = JSON.parse(await h2.evalv(`JSON.stringify((function(){
    const p = document.getElementById('kidsPrompt');
    const row = document.querySelector('.kids-count-row');
    const pb = p.getBoundingClientRect();
    const rb = row.getBoundingClientRect();
    let maxOverlap = 0;
    const spans = [...row.children];
    for (let i = 0; i < spans.length; i++) for (let j = i + 1; j < spans.length; j++) {
      const a = spans[i].getBoundingClientRect(), b = spans[j].getBoundingClientRect();
      const cx = Math.min(a.right, b.right) - Math.max(a.left, b.left);
      if (cx > 0 && a.top === b.top) maxOverlap = Math.max(maxOverlap, cx);
    }
    return {
      kids: spans.length,
      scrollW: p.scrollWidth, clientW: p.clientWidth,
      rowInside: rb.left >= pb.left - 0.5 && rb.right <= pb.right + 0.5,
      maxSpanOverlap: maxOverlap
    };
  })())`));
  check('phone: big emoji count row does not clip the kids prompt',
    promptGeom.kids >= 10 && promptGeom.scrollW <= promptGeom.clientW + 0.5 && promptGeom.rowInside, JSON.stringify(promptGeom));
  // Emoji advance boxes are wider than their minmax(0,1fr) tracks; glyph ink has
  // side bearings, so a small box overlap is normal. The pre-fix crowding was 6px+
  // (62vmin row); now it must stay near-cosmetic (< 2px).
  check('phone: count-row emoji glyphs are not crowded', promptGeom.maxSpanOverlap < 2, JSON.stringify(promptGeom));
  await h2.close();

  // (c) tablet portrait: hub taller than the viewport must start at top (reachable).
  const h3 = await start({ page: '/pages/classroom.html', tag: 'kids-smoke-tablet', width: 768, height: 1024 });
  let ready3 = false;
  for (let i = 0; i < 20 && !ready3; i++) {
    ready3 = await h3.evalv(`typeof window.startClassroom === 'function' && typeof window.kidsGame === 'object'`);
    if (!ready3) await sleep(200);
  }
  const hubTop = JSON.parse(await h3.evalv(`JSON.stringify((function(){
    const b = document.getElementById('classroomHub').getBoundingClientRect();
    return { top: b.top, bottom: b.bottom, height: b.height, ioh: window.innerHeight };
  })())`));
  check('tablet portrait: overflowing hub is top-anchored (reachable), not clipped above',
    hubTop.top >= -0.5 && hubTop.top < 5 && hubTop.bottom > hubTop.ioh, JSON.stringify(hubTop));
  await h3.close();

  await h.close();
  process.exit(getFails() ? 1 : 0);
})();
