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

  // V18 (spec §36/§42.15): "letter glow; speaker cue; subtle object highlight;
  // immediate success feedback; never text-heavy; no alphabet wall".
  // VERIFY-first found a bare floating letter (no bg/glow), a tiny top-right
  // repeat icon far from the letter, flat #fff choice buttons, and no reaction
  // on the stage when a round succeeds. The letter is now the active element.
  const stanza = await h.evalv(`(() => {
    const css = [...document.querySelectorAll('style')].map(s => s.textContent).join('\\n');
    const letter = document.getElementById('phonics-letter');
    return {
      css,
      letterBg: getComputedStyle(letter).backgroundImage,
      hasLiveRule: /\.phonics-letter-live\s*\{[^}]*box-shadow/.test(css),
      hasGoodRule: /\#phonics-letter\.phonics-good\s*\{[^}]*box-shadow/.test(css),
      hasGlowAllRule: /\.phonics-glow-all/.test(css) && /--ps-glow/.test(css),
      hasCorrectRule: /\.phonics-correct/.test(css)
    };
  })()`);
  check('V18: the letter sits on a tile (active letter, not a floating glyph)',
    /gradient/.test(stanza.letterBg), stanza.letterBg);
  check('V18: a bloom rule exists for the letter while its sound plays',
    stanza.hasLiveRule, stanza.hasLiveRule ? 'live rule present' : 'no live rule');

  // runtime bloom: a fresh round immediately blooms the letter (no wake needed —
  // the class is applied synchronously by autoplaySound)
  const bloom = JSON.parse(await h.evalv(`JSON.stringify((() => {
    window.__phonics.goToRound(6);
    const letter = document.getElementById('phonics-letter');
    const live = letter.classList.contains('phonics-letter-live');
    return { live, boxes: [...document.querySelectorAll('.phonics-choice')].map(b => b.classList.contains('phonics-glow-all')) };
  })())`));
  check('V18: a new round blooms the letter and lights both object choices once',
    bloom.live === true && bloom.boxes.every(Boolean) && bloom.boxes.length === 2, JSON.stringify(bloom));

  // speaker cue: a real button next to the letter, wired to replay the sound
  const spoke = JSON.parse(await h.evalv(`JSON.stringify((() => {
    const cue = document.getElementById('phonics-speaker');
    if (!cue) return { ok: false, why: 'no cue' };
    const r = cue.getBoundingClientRect();
    const stub = window.audioBuses.speakWithDuck;
    window.audioBuses.speakWithDuck = function () { window.__spkCount = (window.__spkCount || 0) + 1; if (arguments[1]) arguments[1](); };
    const before = window.__spkCount || 0;
    cue.click();
    const after = window.__spkCount || 0;
    window.audioBuses.speakWithDuck = stub;
    return { ok: true, wired: after > before, btn: cue.tagName === 'BUTTON', min44: Math.min(r.width, r.height) >= 44 };
  })())`));
  check('V18: the speaker cue is a real button (≥44px) next to the letter and replays the sound',
    spoke.ok && spoke.btn && spoke.min44 && spoke.wired, JSON.stringify(spoke));

  // object material: subtle highlighted tiles, not plain white circles
  const obj = JSON.parse(await h.evalv(`JSON.stringify((() => {
    const c = document.querySelector('.phonics-choice');
    const cs = getComputedStyle(c);
    return { grad: /gradient/.test(cs.backgroundImage), white: cs.backgroundColor === 'rgb(255, 255, 255)' };
  })())`));
  check('V18: object choices are softly highlighted tiles (gradient sheen, not flat #fff)',
    obj.grad === true && obj.white === false, JSON.stringify(obj));

  // immediate success feedback: green ring on the choice AND the letter settles
  // green, with «Браво!» — verified via the live classes (applied synchronously).
  const suc = JSON.parse(await h.evalv(`JSON.stringify((() => {
    const correct = document.querySelector('.phonics-choice[data-correct="1"]');
    if (!correct) return { ok: false, why: 'no correct choice' };
    correct.click();
    const letter = document.getElementById('phonics-letter');
    return {
      ok: true,
      ring: correct.classList.contains('phonics-correct'),
      good: letter.classList.contains('phonics-good'),
      fb: document.getElementById('phonics-feedback').textContent
    };
  })())`));
  check('V18: a correct tap gives immediate success feedback (choice ring + letter settles green + Браво!)',
    suc.ok && suc.ring && suc.good && stanza.hasGoodRule && String(suc.fb).includes('Браво'), JSON.stringify(suc));

  await h.close();

  // V18: the whole composition — letter, its speaker cue, the choices and the
  // feedback — must stay inside the 844x390 short-landscape fold (the desktop
  // block is now height-guarded; the short block keeps 128px letter + 64px cue +
  // 128px choices below the fold).
  const land = await start({ page: '/pages/phonics.html', tag: 'phonics-smoke-landscape', width: 844, height: 390 });
  let landReady = false;
  for (let i = 0; i < 20 && !landReady; i++) {
    landReady = await land.evalv(`!!window.__phonics && document.querySelectorAll('.phonics-choice').length === 2`);
    if (!landReady) await sleep(200);
  }
  await land.evalv(STUB);
  await sleep(250);
  const fold = JSON.parse(await land.evalv(`JSON.stringify((() => {
    const inV = el => { const r = el.getBoundingClientRect(); return r.top >= -1 && r.left >= -1 && r.bottom <= innerHeight + 1 && r.right <= innerWidth + 1; };
    const ids = ['phonics-letter', 'phonics-speaker', 'phonics-objects', 'phonics-feedback'];
    const letter = document.getElementById('phonics-letter');
    const choice = document.querySelector('.phonics-choice');
    return {
      all: ids.every(id => inV(document.getElementById(id))),
      choices: [...document.querySelectorAll('.phonics-choice')].every(inV),
      letterFs: parseFloat(getComputedStyle(letter).fontSize),
      choiceW: parseFloat(getComputedStyle(choice).width),
      scrollH: document.documentElement.scrollHeight, vh: innerHeight
    };
  })())`));
  check('V18: full composition visible in 844x390 short landscape (letter + speaker cue + objects + feedback, no v-scroll)',
    fold.all && fold.choices && fold.scrollH <= fold.vh && fold.letterFs <= 132 && fold.choiceW <= 132, JSON.stringify(fold));
  await land.close();

  console.log(`\n${getFails() === 0 ? 'ALL' : 'SOME'} CHECKS ${getFails() === 0 ? 'PASSED' : 'FAILED'} (${getFails()} fail)`);
  process.exit(getFails() ? 1 : 0);
})().catch(e => { console.error('phonics_smoke crashed:', e); process.exit(1); });
