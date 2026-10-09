/* Petrin svet Memory (Памтица) smoke test — task 116 (GAME-MEMORY-001) + task 122 (GAME-MATCH-001).
   Drives pages/animal_memory.html headlessly: board boots in easy mode (4 cards),
   toddler-first (no visible score, large cards, "Пронађен пар!" feedback),
   difficulty selector switches board sizes, the status line tracks pairs/moves
   in older modes, the card back uses the game icon (🃏), a floating "Пронађен пар!"
   popup appears on each matched pair, mismatches only advance the move counter,
   and all pairs can be completed.
   V2.10 (spec §42.3 "header overlap"): a second 390x844 session pins the
   portrait header geometry - title in the .ps-header row, back button in normal
   flow (not position:fixed), back + title never overlap, both inside the
   viewport (measured after `document.fonts.ready`).
   Run:  node tools/memory_smoke.js     (from the repo root or anywhere)
   Requires Node >= 22. CHROME_PATH env optional. */
const { start, check, getFails } = require('./headless.js');

const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const h = await start({ page: '/pages/animal_memory.html', tag: 'memory-smoke', width: 900, height: 800 });

  // Easy mode: 2 pairs = 4 cards
  let ready = false;
  for (let i = 0; i < 25 && !ready; i++) {
    ready = await h.evalv(`document.querySelectorAll('#board .card').length === 4`);
    if (!ready) await sleep(200);
  }
  check('memory page boots in easy mode (4 cards, 2x2)', ready);
  await h.evalv(`window.audioBuses.play=function(){};window.audioBuses.speakWithDuck=function(t,cb){if(cb)cb();}; true`);

  const status0 = await h.evalv(`document.getElementById('memoryStatus').style.display`);
  check('status line hidden in toddler mode (easy)', status0 === 'none', status0);

  const toddlerClass = await h.evalv(`document.body.classList.contains('toddler')`);
  check('body has toddler class in easy mode', toddlerClass === true, toddlerClass);

  const cardBack = await h.evalv(`getComputedStyle(document.querySelector('.card-back'), '::before').content`);
  check('card back uses the game icon (🃏)', cardBack === '"🃏"', cardBack);

  // Match a pair
  const P = await h.evalv(`(() => {
    const cards = [...document.querySelectorAll('#board .card')];
    const a = cards[0];
    const b = cards.find(c => c !== a && c.dataset.name === a.dataset.name);
    return { a: a.dataset.index, b: b.dataset.index, name: a.dataset.name };
  })()`);
  await h.evalv(`document.querySelectorAll('#board .card')[${P.a}].click()`);
  await sleep(50);
  const flipGlow = await h.evalv(`(() => { const el = document.querySelector('#board .card.flipped:not(.matched)'); return el ? getComputedStyle(el).boxShadow : ''; })()`);
  check('V6.2: the current (flipped) card carries the Petrin Glow', /155,\s*109,\s*255/.test(flipGlow), flipGlow);
  await h.evalv(`document.querySelectorAll('#board .card')[${P.b}].click()`);
  await sleep(150);
  const M1 = await h.evalv(`(() => ({
    status: document.getElementById('memoryStatus').textContent,
    pops: document.querySelectorAll('.match-pop').length,
    matched: document.querySelectorAll('#board .card.matched').length
  }))()`);
  check('matching a pair: popup "Пронађен пар!", 2 matched cards', M1.pops === 1 && M1.matched === 2, JSON.stringify(M1));

  const popText = await h.evalv(`document.querySelector('.match-pop') ? document.querySelector('.match-pop').textContent : ''`);
  check('popup text is "Пронађен пар!"', popText === 'Пронађен пар!', popText);

  // Popup removes itself.
  // The popup is removed by the Web Animations `onfinish` of a 900ms animation
  // (animal_memory.js:90), so a fixed 1000ms sleep left only a 100ms margin and
  // failed under parallel load. Poll for removal instead of assuming the
  // animation finished on schedule.
  let popsGone = -1;
  for (let i = 0; i < 30; i++) {
    popsGone = await h.evalv(`document.querySelectorAll('.match-pop').length`);
    if (popsGone === 0) break;
    await sleep(150);
  }
  check('"Пронађен пар!" popup removes itself', popsGone === 0, popsGone + ' pop(s) left');

  // Complete remaining pair (easy mode)
  const D = await h.evalv(`(() => {
    const cards = () => [...document.querySelectorAll('#board .card')];
    let guard = 0;
    while (guard++ < 30 && cards().some(c => !c.classList.contains('matched'))) {
      const un = cards().filter(c => !c.classList.contains('matched'));
      const a = un[0];
      const b = un.find(c => c !== a && c.dataset.name === a.dataset.name);
      if (!b) return { error: 'no pair found' };
      a.click(); b.click();
    }
    return { status: document.getElementById('memoryStatus').textContent, matched: cards().length };
  })()`);
  check('all 2 pairs complete (easy): 4 matched cards', D.matched === 4, JSON.stringify(D));

  // Switch to standard mode: 8 pairs = 16 cards, then test mismatch
  await h.evalv(`document.querySelector('.diff-btn[data-diff="standard"]').click()`);
  await sleep(200);
  const S = await h.evalv(`({
    cards: document.querySelectorAll('#board .card').length,
    cols: document.getElementById('board').style.gridTemplateColumns,
    status: document.getElementById('memoryStatus').textContent
  })`);
  check('standard mode: 16 cards, 4 columns, 0/8 pairs', S.cards === 16 && S.cols.includes('4') && S.status === 'Парова: 0 од 8 · Потези: 0', JSON.stringify(S));

  // Mismatch: pick two cards with different names
  const X = await h.evalv(`(() => {
    const cards = [...document.querySelectorAll('#board .card')].filter(c => !c.classList.contains('matched'));
    const a = cards[0];
    const b = cards.find(c => c !== a && c.dataset.name !== a.dataset.name);
    return { a: a.dataset.index, b: b.dataset.index };
  })()`);
  await h.evalv(`document.querySelectorAll('#board .card')[${X.a}].click()`);
  await sleep(50);
  await h.evalv(`document.querySelectorAll('#board .card')[${X.b}].click()`);
  await sleep(100);
  const M2 = await h.evalv(`(() => ({
    status: document.getElementById('memoryStatus').textContent,
    matched: document.querySelectorAll('#board .card.matched').length
  }))()`);
  check('mismatch: move count advances, no match added', M2.status === 'Парова: 0 од 8 · Потези: 1' && M2.matched === 0, JSON.stringify(M2));

  await sleep(800);
  const flippedBack = await h.evalv(`document.querySelectorAll('#board .card.flipped:not(.matched)').length`);
  check('mismatched cards flip back', flippedBack === 0, flippedBack + ' still flipped');

  // Complete all pairs (standard)
  const D2 = await h.evalv(`(() => {
    const cards = () => [...document.querySelectorAll('#board .card')];
    let guard = 0;
    while (guard++ < 30 && cards().some(c => !c.classList.contains('matched'))) {
      const un = cards().filter(c => !c.classList.contains('matched'));
      const a = un[0];
      const b = un.find(c => c !== a && c.dataset.name === a.dataset.name);
      if (!b) return { error: 'no pair found' };
      a.click(); b.click();
    }
    return { status: document.getElementById('memoryStatus').textContent, matched: cards().length };
  })()`);
  check('all 8 pairs complete (standard): status 8/8', D2.status === 'Парова: 8 од 8 · Потези: 9' && D2.matched === 16, JSON.stringify(D2));

  // Audio-disabled state does not break game
  const audioDisabled = await h.evalv(`(() => {
    const cards = document.querySelectorAll('#board .card');
    if (cards.length < 4) return { ok: false, reason: 'no cards' };
    cards[0].click();
    return { ok: true, cards: cards.length };
  })()`);
  check('audio-disabled state does not break game', audioDisabled.ok === true, JSON.stringify(audioDisabled));

  // Resize does not break game
  await h.evalv(`window.dispatchEvent(new Event('resize'))`);
  await sleep(200);
  const resizeOk = await h.evalv(`(() => {
    const cards = document.querySelectorAll('#board .card');
    return { cards: cards.length, board: !!document.getElementById('board') };
  })()`);
  check('resize does not break game', resizeOk.cards >= 4 && resizeOk.board === true, JSON.stringify(resizeOk));

  // V2.10 (spec §42.3 "header overlap") — portrait top-chrome geometry. The
  // title was a full-width centred <h1> under a position:fixed back button, so
  // the title BOX ran under the button at EVERY viewport; the fix puts both in
  // the shell.css `.ps-header` row as flex siblings so they cannot overlap.
  // Measured after `document.fonts.ready` so font-swap transients cannot flake
  // it. §42.3's other items (card proportions, back symbol scale, short-
  // landscape difficulty controls) are not header work and stay out.
  const hp = await start({ page: '/pages/animal_memory.html', tag: 'memory-smoke-portrait', width: 390, height: 844 });
  let pReady = false;
  for (let i = 0; i < 25 && !pReady; i++) {
    pReady = await hp.evalv(`document.querySelectorAll('#board .card').length >= 4`);
    if (!pReady) await sleep(200);
  }
  await hp.evalv(`window.audioBuses.play=function(){}; true`);
  await hp.evalv(`document.fonts.ready.then(() => true)`);
  const geo = await hp.evalv(`(() => {
    const back = document.querySelector('.back-btn');
    const title = document.querySelector('.ps-header .ps-title') || document.querySelector('h1');
    const rb = back.getBoundingClientRect(), rt = title.getBoundingClientRect();
    const w = Math.min(rb.right, rt.right) - Math.max(rb.left, rt.left);
    const hh = Math.min(rb.bottom, rt.bottom) - Math.max(rb.top, rt.top);
    return JSON.stringify({
      booted: ${pReady},
      inHeader: !!(title && title.closest('.ps-header')),
      backPos: getComputedStyle(back).position,
      overlap: (w > 0.5 && hh > 0.5) ? (w * hh) : 0,
      inside: [back, title].every(el => { const r = el.getBoundingClientRect(); return r.left >= -0.5 && r.top >= -0.5 && r.right <= innerWidth + 0.5 && r.bottom <= innerHeight + 0.5; })
    });
  })()`);
  const rj = JSON.parse(geo);
  check('V2.10 shell: memory title lives in the .ps-header row', rj.booted === true && rj.inHeader === true, geo);
  check('V2.10: back button is in normal flow (not position:fixed)', rj.backPos === 'static', geo);
  check('V2.10 portrait: back button + title never overlap (§42.3)', rj.overlap === 0, geo);
  check('V2.10 portrait: header chrome inside the viewport (390x844)', rj.inside === true, geo);
  await hp.close();

  // Back button returns to hub (last — navigates away).
  // The handler waits 90ms then sets location.href to '../index.html#hub-games',
  // so this check races a real navigation: querying too early inspects the OLD
  // document, which has no #hub/#hub-games at all, and reads null. Poll for the
  // landed hub instead of assuming a fixed delay.
  await h.evalv(`document.querySelector('.back-btn').click()`);
  let backToHub = false, backInfo = null;
  for (let i = 0; i < 40 && !backToHub; i++) {
    backInfo = await h.evalv(`(() => {
      const hub = document.getElementById('hub');
      const hubGames = document.getElementById('hub-games');
      return JSON.stringify({
        landed: location.pathname.endsWith('/index.html'),
        hash: location.hash,
        hub: !!(hub && hub.style.display !== 'none'),
        hubGames: !!(hubGames && hubGames.style.display !== 'none')
      });
    })()`);
    let bj;
    try { bj = JSON.parse(backInfo); } catch (e) { bj = null; }
    if (bj && (bj.hub || bj.hubGames)) backToHub = true;
    else await sleep(150);
  }
  check('back button returns to hub', backToHub === true, backInfo);

  await h.close();
  const fails = getFails();
  console.log(`\n${fails === 0 ? 'ALL' : 'SOME'} CHECKS ${fails === 0 ? 'PASSED' : 'FAILED'} (${fails} fail)`);
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error('memory_smoke crashed:', e); process.exit(1); });
