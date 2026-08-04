/* Учионица kids tier (За децу) smoke test — Phase 3 quiz games.
   Drives the REAL pipeline headlessly: hub two-set render, entering each of the
   4 quiz games, wrong-answer nudge, correct-answer advance, session end + replay.
   Run:  node tools/kids_smoke.js     (from the repo root or anywhere)
   Requires Node >= 22. CHROME_PATH env optional. */
const { start, check, getFails } = require('./headless.js');

const sleep = ms => new Promise(r => setTimeout(r, ms));

const STUB = `window.speech={speak:function(t,cb){if(cb)cb();},cancel:function(){}};window.popSound=window.gentleMiss=function(){}; true`;

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
  check('wrong tap nudges, question stays', wj.fb === 'Покушај још једном!' && wj.prog === '1 од 8', w);

  for (let i = 0; i < 8; i++) {
    await h.evalv(`(function(){ const a = document.querySelector('#kidsOptions .kids-option.is-answer'); a.click(); return true; })()`);
    await sleep(850);
  }
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
