/* Petrin svet Memory (Памтица) smoke test — task 116 (GAME-MEMORY-001).
   Drives pages/animal_memory.html headlessly: board boots in easy mode (4 cards),
   difficulty selector switches board sizes, the status line tracks pairs/moves,
   the card back uses the game icon (🃏), a floating "Пар!" popup appears on each
   matched pair, mismatches only advance the move counter, and all pairs can be
   completed.
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

  const status0 = await h.evalv(`document.getElementById('memoryStatus').textContent`);
  check('status line starts at 0/2 pairs, 0 moves (easy)', status0 === 'Парова: 0 од 2 · Потези: 0', status0);

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
  check('matching a pair: status 1/2, 1 move, popup, 2 matched cards', M1.status === 'Парова: 1 од 2 · Потези: 1' && M1.pops === 1 && M1.matched === 2, JSON.stringify(M1));

  // Popup removes itself
  await sleep(1000);
  const popsGone = await h.evalv(`document.querySelectorAll('.match-pop').length`);
  check('"Пар!" popup removes itself', popsGone === 0, popsGone + ' pop(s) left');

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
  check('all 2 pairs complete (easy): status 2/2, moves 2', D.status === 'Парова: 2 од 2 · Потези: 2' && D.matched === 4, JSON.stringify(D));

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

  h.close();
  const fails = getFails();
  console.log(`\n${fails === 0 ? 'ALL' : 'SOME'} CHECKS ${fails === 0 ? 'PASSED' : 'FAILED'} (${fails} fail)`);
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error('memory_smoke crashed:', e); process.exit(1); });
