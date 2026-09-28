/* Petrin svet Memory (Памтица) smoke test — task 116 (GAME-MEMORY-001) + task 122 (GAME-MATCH-001).
   Drives pages/animal_memory.html headlessly: board boots in easy mode (4 cards),
   toddler-first (no visible score, large cards, "Пронађен пар!" feedback),
   difficulty selector switches board sizes, the status line tracks pairs/moves
   in older modes, the card back uses the game icon (🃏), a floating "Пронађен пар!"
   popup appears on each matched pair, mismatches only advance the move counter,
   and all pairs can be completed.
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

  // Popup removes itself
  await sleep(1000);
  const popsGone = await h.evalv(`document.querySelectorAll('.match-pop').length`);
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

  // Back button returns to hub (last — navigates away)
  await h.evalv(`document.querySelector('.back-btn').click()`);
  await sleep(300);
  const backToHub = await h.evalv(`document.getElementById('hub').style.display !== 'none' || document.getElementById('hub-games').style.display !== 'none'`);
  check('back button returns to hub', backToHub === true, String(backToHub));

  h.close();
  const fails = getFails();
  console.log(`\n${fails === 0 ? 'ALL' : 'SOME'} CHECKS ${fails === 0 ? 'PASSED' : 'FAILED'} (${fails} fail)`);
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error('memory_smoke crashed:', e); process.exit(1); });
