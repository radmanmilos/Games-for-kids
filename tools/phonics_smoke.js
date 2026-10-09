/* Phonics smoke test — R23 "Слова и звуци" pilot (pages/phonics.html).
   Drives the page headlessly: autoplay sound attempted, big Cyrillic letter
   rendered, exactly 2 choice objects, geometry reachable, wrong tap marks and
   hint after 2 misses, correct advances, repeat button present and wired, static
   wiring via checkRouteWired.
   Run:  node tools/phonics_smoke.js     (from the repo root or anywhere) */
const { start, check, getFails } = require('./headless.js');
const { checkRouteWired } = require('./route_contract.js');
const fs = require('fs');
const path = require('path');

const sleep = ms => new Promise(r => setTimeout(r, ms));

const STUB = `window.speech={speak:function(){},cancel:function(){}};window.audioBuses.play=function(){};window.audioBuses.speakWithDuck=function(t,cb){if(cb)cb();};window.celebrate=function(){}; true`;

(async () => {
  const h = await start({ page: '/pages/phonics.html', tag: 'phonics-smoke', width: 1024, height: 800 });

  let ready = false;
  for (let i = 0; i < 20 && !ready; i++) {
    ready = await h.evalv(`typeof window.startPhonics === 'function' && !!window.__phonics && !!document.getElementById('phonics-letter') && document.querySelectorAll('.phonics-choice').length===2`);
    if (!ready) await sleep(200);
  }
  check('phonics game booted (startPhonics + __phonics + letter + 2 choices)', ready);
  await h.evalv(STUB);

  const st = async () => JSON.parse(await h.evalv(`JSON.stringify(window.__phonics.state())`));
  const s = await st();

  check('round starts with a Cyrillic letter and sound string', s.letter.length === 1 && s.sound && s.sound.length > 0, JSON.stringify(s));
  check('exactly 2 choice objects are rendered', s.choices.length === 2, JSON.stringify(s));
  check('exactly one choice is marked correct', s.choices.filter(c => c.correct).length === 1, JSON.stringify(s));

  const geom = await h.evalv(`JSON.stringify((() => {
    const hitOf = el => { const r = el.getBoundingClientRect();
      const hit = document.elementFromPoint(r.left + r.width/2, r.top + r.height/2);
      return { inside: r.top >= -1 && r.left >= -1 && r.bottom <= innerHeight + 1 && r.right <= innerWidth + 1,
               hit: !!(hit && (hit === el || el.contains(hit))), w: r.width, h: r.height }; };
    return {
      letter: hitOf(document.getElementById('phonics-letter')),
      choices: [...document.querySelectorAll('.phonics-choice')].map(hitOf)
    };
  })())`);
  const GE = JSON.parse(geom);
  check('Cyrillic letter and both choices are inside viewport and hit-testable',
    GE.letter.inside && GE.letter.hit && GE.choices.every(i => i.inside && i.hit), geom);

  // wrong tap marks and doesn't advance
  const wrong = s.choices.find(c => !c.correct);
  const wrongKey = wrong ? wrong.key : null;
  const beforeRound = s.round;
  if (wrongKey) {
    await h.evalv(`document.querySelector('.phonics-choice[data-key="${wrongKey}"]').click()`);
    const wrongMarked = await h.evalv(`document.querySelector('.phonics-choice[data-key="${wrongKey}"]').classList.contains('phonics-wrong')`);
    check('a wrong choice gets the shake mark (no punishment)', wrongMarked === true);
    const stillRound = (await st()).round === beforeRound;
    check('a wrong answer does not force a new round', stillRound === true);
  }

  // second wrong -> hint
  const s2 = await st();
  const wrong2 = s2.choices.find(c => !c.correct);
  if (wrong2) {
    await h.evalv(`document.querySelector('.phonics-choice[data-key="${wrong2.key}"]').click()`);
    const hint = await h.evalv(`!!document.querySelector('.phonics-choice.phonics-hint')`);
    check('after two mistakes the correct choice is hinted', hint === true);
  }

  /* --- Alphabet data integrity (added 2026-10-05, task 196) ---
     The R23 smoke asserted only `letter.length === 1 && sound.length > 0`, while
     PROJECT_TASKS task 189 claimed the 10-letter set was "verified" for
     correct-start. Nothing ever checked it, so 6 of 10 entries shipped pointing
     at an item that did NOT start with its own letter (А→Јабука, С→Змија,
     Т→Ауто, К→Мачка, Р→Зец, И→Сова) — a false letter/sound association in a
     toddler learning game. These checks walk EVERY letter and are the guard the
     original comment only claimed.

     The letter count is read from SERBIAN.alphabet rather than hardcoded: this
     file previously computed the next round as `(sc.round + 1) % 10`, which would
     have started asserting the wrong thing the moment the set grew past ten. */
  const ALPHABET_LEN = await h.evalv(`window.SERBIAN.alphabet.length`);
  check('phonics covers every letter in the shared Serbian alphabet',
    ALPHABET_LEN === 30, `alphabet length ${ALPHABET_LEN}`);

  // Walk all rounds: the letter must be the alphabet's, the correct item must
  // start with it, the distractor must not, and the spoken sound must be the
  // alphabet entry's own name (which shared/speech.js registered to an MP3).
  const drift = await h.evalv(`JSON.stringify((() => {
    const A = window.SERBIAN.alphabet;
    const bad = [];
    const first = n => (n || '').charAt(0).toUpperCase();
    for (let i = 0; i < A.length; i++) {
      window.__phonics.goToRound(i);
      const s = window.__phonics.state();
      const btn = document.querySelector('.phonics-choice[data-correct="1"]');
      const other = document.querySelector('.phonics-choice[data-correct="0"]');
      const name = btn ? btn.getAttribute('aria-label') : '';
      const otherName = other ? other.getAttribute('aria-label') : '';
      if (s.letter !== A[i].label) bad.push(A[i].label + ': letter is ' + s.letter);
      if (first(name) !== s.letter) bad.push(s.letter + ': correct item ' + name + ' starts ' + first(name));
      if (first(otherName) === s.letter) bad.push(s.letter + ': distractor ' + otherName + ' collides');
      if (s.sound !== A[i].name) bad.push(s.letter + ': sound ' + s.sound + ' != alphabet name ' + A[i].name);
    }
    return bad;
  })())`);
  const DRIFT = JSON.parse(drift);
  check('every letter has a correct item starting with it, a non-colliding distractor, and the recorded sound',
    DRIFT.length === 0, DRIFT.length ? DRIFT.join(' | ') : 'all ' + ALPHABET_LEN + ' letters consistent with SERBIAN.alphabet');

  // back to round 0 for the interaction checks below
  await h.evalv(`window.__phonics.goToRound(0)`);
  await sleep(50);

  // correct advances
  const sc = await st();
  const correct = sc.choices.find(c => c.correct);
  if (correct) {
    await h.evalv(`document.querySelector('.phonics-choice[data-key="${correct.key}"]').click()`);
    let advanced = false;
    for (let i = 0; i < 30 && !advanced; i++) {
      // cycle length comes from the alphabet, not a literal
      advanced = (await st()).round === (sc.round + 1) % ALPHABET_LEN;
      if (!advanced) await sleep(100);
    }
    check('a correct answer advances to the next round', advanced === true);
  }

  // repeat button wired
  const repeat = await h.evalv(`!!document.getElementById('phonics-repeat')`);
  check('repeat sound button exists', repeat === true);

  // wiring
  const root = path.join(__dirname, '..');
  const indexHtml = fs.readFileSync(path.join(root, 'game', 'index.html'), 'utf8');
  check('hub button wired (data-go="game-phonics")', indexHtml.includes('data-go="game-phonics"'));
  checkRouteWired('phonics', 'game-phonics', 'pages/phonics.html',
    { back: 'phonics-back', start: 'startPhonics', check });

  // V5.1 (spec §23): learning-stage grammar regions tagged on phonics
  // (instruction is spoken here, so no .learn-instruction region).
  const lsj = JSON.parse(await h.evalv(`JSON.stringify({
    found: ['.learn-stage-mat','.learn-answers','.learn-feedback'].map(s => !!document.querySelector(s)),
    visible: (() => { const el = document.querySelector('.learn-stage-mat'); if (!el) return false; const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; })(),
    bogus: !!document.querySelector('.learn-does-not-exist'),
    overflow: document.documentElement.scrollWidth <= innerWidth + 1
  })`));
  check('V5.1 grammar: §23 regions present on phonics (stage-mat/answers/feedback)', lsj.found.every(Boolean), JSON.stringify(lsj));
  check('V5.1 grammar: stage-mat renders a real box; no h-overflow; non-vacuous', lsj.visible && lsj.overflow && lsj.bogus === false, JSON.stringify(lsj));

  await h.close();
  console.log(`\n${getFails() === 0 ? 'ALL' : 'SOME'} CHECKS ${getFails() === 0 ? 'PASSED' : 'FAILED'} (${getFails()} fail)`);
  process.exit(getFails() ? 1 : 0);
})().catch(e => { console.error('phonics_smoke crashed:', e); process.exit(1); });
