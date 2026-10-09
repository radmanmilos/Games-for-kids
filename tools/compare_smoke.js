/* Compare smoke test — R21 "Више или мање" pilot (pages/compare.html).
   Drives the page headlessly: the three modes (more / less / same), the prompt
   text, the group item counts, the correct-choice marking, the gentle no-punish
   miss with a hint after two mistakes, and the reachability of the two group
   buttons (inside the viewport AND hit-testable, not merely clickable).
   Run:  node tools/compare_smoke.js     (from the repo root or anywhere)
   Requires Node >= 22. CHROME_PATH env optional. */
const { start, check, getFails } = require('./headless.js');
const { checkRouteWired } = require('./route_contract.js');
const fs = require('fs');
const path = require('path');

const sleep = ms => new Promise(r => setTimeout(r, ms));

const STUB = `window.speech={speak:function(){},cancel:function(){}};window.audioBuses.play=function(){};window.audioBuses.speakWithDuck=function(t,cb){if(cb)cb();};window.celebrate=function(){}; true`;

(async () => {
  const h = await start({ page: '/pages/compare.html', tag: 'compare-smoke', width: 1024, height: 800 });

  let ready = false;
  for (let i = 0; i < 20 && !ready; i++) {
    ready = await h.evalv(`typeof window.startCompare === 'function' && !!window.__compare && !!document.getElementById('cmp-group-a')`);
    if (!ready) await sleep(200);
  }
  check('compare game booted (startCompare + __compare ready)', ready);
  await h.evalv(STUB);

  const st = async () => JSON.parse(await h.evalv(`JSON.stringify(window.__compare.state())`));

  // ---- round 0: "more" -------------------------------------------------------
  const s = await st();
  check('round 0 is "more" with the "Где има више?" prompt', s.mode === 'more' && s.prompt === 'Где има више?', JSON.stringify(s));
  check('round 0 groups are unequal', s.a !== s.b, JSON.stringify(s));

  const dom = await h.evalv(`JSON.stringify((() => {
    const a = document.getElementById('cmp-group-a');
    const b = document.getElementById('cmp-group-b');
    const items = el => el.querySelectorAll('.cmp-item').length;
    return {
      aCount: Number(a.dataset.count), bCount: Number(b.dataset.count),
      aItems: items(a), bItems: items(b),
      aCorrect: a.dataset.correct, bCorrect: b.dataset.correct,
      answersHidden: document.getElementById('compare-answers').hidden
    };
  })())`);
  const D = JSON.parse(dom);
  check('rendered item count matches data-count and state', D.aItems === D.aCount && D.bItems === D.bCount && D.aCount === s.a && D.bCount === s.b, dom);
  check('more round hides the yes/no answer buttons', D.answersHidden === true, dom);
  check('exactly one group is marked correct, and it is the larger',
    (D.aCorrect === '1') !== (D.bCorrect === '1') && ((D.aCorrect === '1') === (s.a > s.b)), dom);

  // Geometry: a passing .click() proves nothing about reachability.
  const geom = await h.evalv(`JSON.stringify(['cmp-group-a','cmp-group-b'].map(id => {
    const el = document.getElementById(id);
    const r = el.getBoundingClientRect();
    const hit = document.elementFromPoint(r.left + r.width/2, r.top + r.height/2);
    return { id,
      inside: r.top >= -1 && r.left >= -1 && r.bottom <= innerHeight + 1 && r.right <= innerWidth + 1,
      hit: !!(hit && (hit === el || el.contains(hit))) };
  }))`);
  const GE = JSON.parse(geom);
  check('both group buttons are reachable (inside viewport + hit-testable)', GE.every(g => g.inside && g.hit), geom);

  // ---- miss is gentle, hint after two ---------------------------------------
  const wrongId = s.a > s.b ? 'cmp-group-b' : 'cmp-group-a';
  await h.evalv(`document.getElementById('${wrongId}').click()`);
  const wrongMark = await h.evalv(`document.getElementById('${wrongId}').classList.contains('cmp-wrong')`);
  check('a wrong group gets the shake mark (no punishment)', wrongMark === true, String(wrongMark));
  const roundUnchanged = (await st()).round === 0;
  check('a wrong answer does not force a new round', roundUnchanged === true);

  await h.evalv(`document.getElementById('${wrongId}').click()`);
  const hintShown = await h.evalv(`!!document.querySelector('.cmp-hint')`);
  check('after two mistakes the correct group is hinted', hintShown === true, String(hintShown));

  // ---- correct answer marks and advances ------------------------------------
  await h.evalv(`window.__compare.goToRound(0)`);
  await sleep(50);
  const s0 = await st();
  const correctId = s0.correct === 'a' ? 'cmp-group-a' : 'cmp-group-b';
  await h.evalv(`document.getElementById('${correctId}').click()`);
  const correctMark = await h.evalv(`document.getElementById('${correctId}').classList.contains('cmp-correct')`);
  check('a correct group gets the success mark', correctMark === true, String(correctMark));
  let advanced = false;
  for (let i = 0; i < 30 && !advanced; i++) {
    advanced = (await st()).round === 1;
    if (!advanced) await sleep(100);
  }
  check('a correct answer advances to the next round', advanced === true);

  // ---- "less" mode -----------------------------------------------------------
  await h.evalv(`window.__compare.goToRound(3)`);
  await sleep(50);
  const sl = await st();
  const dless = await h.evalv(`JSON.stringify({a:Number(document.getElementById('cmp-group-a').dataset.count),b:Number(document.getElementById('cmp-group-b').dataset.count),ac:document.getElementById('cmp-group-a').dataset.correct,bc:document.getElementById('cmp-group-b').dataset.correct,hidden:document.getElementById('compare-answers').hidden})`);
  const DL = JSON.parse(dless);
  check('round 3 is "less" with the "Где има мање?" prompt and unequal groups',
    sl.mode === 'less' && sl.prompt === 'Где има мање?' && sl.a !== sl.b, JSON.stringify(sl));
  check('the correct choice in "less" is the smaller group',
    DL.a !== DL.b && ((DL.ac === '1') === (sl.a < sl.b)) && DL.hidden === true, dless);

  // ---- "same" mode -----------------------------------------------------------
  await h.evalv(`window.__compare.goToRound(6)`);
  await sleep(50);
  const ss = await st();
  const dsame = await h.evalv(`JSON.stringify({hidden:document.getElementById('compare-answers').hidden,ac:document.getElementById('cmp-group-a').dataset.correct,bc:document.getElementById('cmp-group-b').dataset.correct,yes:document.getElementById('cmp-yes').dataset.correct,no:document.getElementById('cmp-no').dataset.correct})`);
  const DS = JSON.parse(dsame);
  check('round 6 is "same" with the "Да ли имају исто?" prompt and answer buttons',
    ss.mode === 'same' && ss.prompt === 'Да ли имају исто?' && DS.hidden === false, JSON.stringify(ss));
  check('"same" leaves no group-correct mark and marks exactly one answer',
    DS.ac === '0' && DS.bc === '0' && ((DS.yes === '1') !== (DS.no === '1')), dsame);
  check('the correct "same" answer agrees with whether the counts are equal',
    ((DS.yes === '1') === ss.equal), dsame);

  const wrongAns = ss.correct === 'yes' ? 'cmp-no' : 'cmp-yes';
  await h.evalv(`document.getElementById('${wrongAns}').click()`);
  const wrongAnsMark = await h.evalv(`document.getElementById('${wrongAns}').classList.contains('cmp-wrong')`);
  check('a wrong yes/no answer gets the shake mark', wrongAnsMark === true, String(wrongAnsMark));

  await h.evalv(`window.__compare.goToRound(6)`);
  await sleep(50);
  const s6 = await st();
  const rightAns = s6.correct === 'yes' ? 'cmp-yes' : 'cmp-no';
  await h.evalv(`document.getElementById('${rightAns}').click()`);
  const rightAnsMark = await h.evalv(`document.getElementById('${rightAns}').classList.contains('cmp-correct')`);
  check('a correct yes/no answer gets the success mark', rightAnsMark === true, String(rightAnsMark));

  // ---- groups are inert in "same" mode --------------------------------------
  await h.evalv(`window.__compare.goToRound(6)`);
  await sleep(50);
  await h.evalv(`document.getElementById('cmp-group-a').click()`);
  const groupInert = await h.evalv(`(() => { const g = document.getElementById('cmp-group-a'); return g.classList.contains('cmp-correct') || g.classList.contains('cmp-wrong'); })()`);
  check('group taps are inert in "same" mode', groupInert === false, String(groupInert));

  // ---- stale focus ring (user-reported) --------------------------------------
  /* A tap leaves focus on the `.cmp-group` button, and
     shared/accessibility.css:10 paints a 4px #FFD23F (yellow) outline on
     :focus. clearMarks() removed the cmp-* classes but not the focus, so the
     yellow rectangle survived newRound and stayed wrapped around a group that
     had already been refilled with new objects — which read as "that one is
     still selected". Reproduce by answering correctly (focus lands on the
     tapped group) and then asserting no group still holds focus once the round
     has advanced. */
  await h.evalv(`window.__compare && window.__compare.goToRound(0)`);
  await sleep(60);
  const focusBefore = await h.evalv(`(()=>{const g=document.querySelector('.cmp-group[data-correct="1"]')||document.querySelector('.cmp-group');g.focus();return document.activeElement===g;})()`);
  check('a group can hold focus before the round advances', focusBefore === true);
  await h.evalv(`window.__compare.goToRound(1)`);
  await sleep(120);
  const lingering = await h.evalv(`JSON.stringify({
    activeTag: document.activeElement ? document.activeElement.tagName : null,
    activeIsGroup: !!(document.activeElement && document.activeElement.classList.contains('cmp-group')),
    outlined: document.activeElement ? (getComputedStyle(document.activeElement).outlineStyle !== 'none' && getComputedStyle(document.activeElement).outlineWidth !== '0px') : false
  })`);
  const L = JSON.parse(lingering);
  check('no stale yellow focus ring survives a round change (new objects, old outline)',
    L.activeIsGroup === false && L.outlined === false, lingering);

  // ---- static wiring ---------------------------------------------------------
  const root = path.join(__dirname, '..');
  const indexHtml = fs.readFileSync(path.join(root, 'game', 'index.html'), 'utf8');
  check('hub button wired (data-go="game-compare")', indexHtml.includes('data-go="game-compare"'));
  checkRouteWired('compare', 'game-compare', 'pages/compare.html',
    { back: 'compare-back', start: 'startCompare', check });

  // V5.1 (spec §23): the shared learning-stage regions are tagged on compare.
  const lsj = JSON.parse(await h.evalv(`JSON.stringify({
    found: ['.learn-instruction','.learn-stage-mat','.learn-answers','.learn-feedback'].map(s => !!document.querySelector(s)),
    visible: ['.learn-instruction','.learn-stage-mat'].every(s => { const el = document.querySelector(s); if (!el) return false; const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; }),
    bogus: !!document.querySelector('.learn-does-not-exist'),
    overflow: document.documentElement.scrollWidth <= innerWidth + 1
  })`));
  check('V5.1 grammar: all four §23 regions present on compare', lsj.found.every(Boolean), JSON.stringify(lsj));
  check('V5.1 grammar: instruction + stage-mat render a real box, no h-overflow, non-vacuous', lsj.visible && lsj.overflow && lsj.bogus === false, JSON.stringify(lsj));

  await h.close();
  console.log(`\n${getFails() === 0 ? 'ALL' : 'SOME'} CHECKS ${getFails() === 0 ? 'PASSED' : 'FAILED'} (${getFails()} fail)`);
  process.exit(getFails() ? 1 : 0);
})().catch(e => { console.error('compare_smoke crashed:', e); process.exit(1); });
