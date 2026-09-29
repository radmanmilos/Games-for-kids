/* Учионицa kids tier (За децу) smoke test — Phase 2 task 120 (GAME-CLASS-001).
   Drives the REAL pipeline headlessly: hub two-set render, entering each of the
   4 quiz games, wrong-answer nudge, correct-answer advance, session end + replay.
   Also tests category tabs: 4 tabs visible in activity mode, active state,
   tab switching between categories.
   Only the speech + WebAudio primitives are stubbed, so the real shared feedback
   wrappers (popSound / gentleMiss / successChime / celebrate) execute — that is
   what pins the window.tone(freq, dur, delay, type, vol) signature (task 120).
   Run:  node tools/classroom_smoke.js  (from the repo root or anywhere)
   Requires Node >= 22. CHROME_PATH env optional. */
const { start, check, getFails } = require('./headless.js');

const sleep = ms => new Promise(r => setTimeout(r, ms));

const STUB = `window.speech={speak:function(t,cb){if(cb)cb();},cancel:function(){}};window.tone=window.sweep=function(){}; true`;

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
  check('hub shows two sets (4+4) + labels', hubj.babies === 4 && hubj.kids === 4 && hubj.groups.join('|') === 'За малишане|За децу', hub);

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
  check('4 category tabs visible in activity mode', T.tabCount === 4 && T.tabsVisible === true, tabsInfo);
  const tabText = T.tabLabels.map(l => l.replace(/[^\u0400-\u04FF]/g, '')).join('|');
  check('tabs labeled Азбука/Бројеви/Облици/Боје', tabText === 'Азбука|Бројеви|Облици|Боје', T.tabLabels.join('|'));
  check('active tab matches current activity', T.activeTab === 'alphabet', tabsInfo);

  // Tab switching: click Бројеви tab
  await h.evalv(CLICK('.class-tab[data-tab="numbers"]'));
  await sleep(150);
  const switched = await h.evalv(`JSON.stringify({
    activeTab: document.querySelector('.class-tab.active') ? document.querySelector('.class-tab.active').dataset.tab : null,
    title: document.getElementById('activityTitle').textContent,
    tiles: document.querySelectorAll('#activityGrid .class-tile').length
  })`);
  const SW = JSON.parse(switched);
  check('tab switch to Бројевi updates activity', SW.activeTab === 'numbers' && SW.title === 'Бројеви' && SW.tiles === 11, switched);

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

  h.close();
  process.exit(getFails() ? 1 : 0);
})();
