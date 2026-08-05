/* Petrin svet Memory (Памтилица) smoke test — task 65 polish.
   Drives pages/animal_memory.html headlessly: board boots with 16 cards, the
   status line tracks pairs/moves, the card back uses the game icon (🃏), a
   floating "Пар!" popup appears on each matched pair, mismatches only advance
   the move counter, and all 8 pairs can be completed.
   Run:  node tools/memory_smoke.js     (from the repo root or anywhere)
   Requires Node >= 22. CHROME_PATH env optional. */
const { start, check, getFails } = require('./headless.js');

const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const h = await start({ page: '/pages/animal_memory.html', tag: 'memory-smoke', width: 900, height: 800 });

  let ready = false;
  for (let i = 0; i < 25 && !ready; i++) {
    ready = await h.evalv(`document.querySelectorAll('#board .card').length === 16`);
    if (!ready) await sleep(200);
  }
  check('memory page boots with 16 cards (4x4)', ready);

  const status0 = await h.evalv(`document.getElementById('memoryStatus').textContent`);
  check('status line starts at 0/8 pairs, 0 moves', status0 === 'Парова: 0 од 8 · Потези: 0', status0);

  const cardBack = await h.evalv(`getComputedStyle(document.querySelector('.card-back'), '::before').content`);
  check('card back uses the game icon (🃏)', cardBack === '"🃏"', cardBack);

  const firstPair = await h.evalv(`JSON.stringify((() => {
    const cards = [...document.querySelectorAll('#board .card')];
    const a = cards[0];
    const b = cards.find(c => c !== a && c.dataset.name === a.dataset.name);
    return { a: a.dataset.index, b: b.dataset.index, name: a.dataset.name };
  })())`);
  const P = JSON.parse(firstPair);
  await h.evalv(`document.querySelectorAll('#board .card')[${P.a}].click()`);
  await sleep(50);
  await h.evalv(`document.querySelectorAll('#board .card')[${P.b}].click()`);
  await sleep(150);
  const m1 = await h.evalv(`JSON.stringify((() => ({
    status: document.getElementById('memoryStatus').textContent,
    pops: document.querySelectorAll('.match-pop').length,
    matched: document.querySelectorAll('#board .card.matched').length
  }))())`);
  const M1 = JSON.parse(m1);
  check('matching a pair: status 1/8, 1 move, popup, 2 matched cards', M1.status === 'Парова: 1 од 8 · Потези: 1' && M1.pops === 1 && M1.matched === 2, m1);

  await sleep(1000);
  const popsGone = await h.evalv(`document.querySelectorAll('.match-pop').length`);
  check('"Пар!" popup removes itself', popsGone === 0, popsGone + ' pop(s) left');

  const mismatch = await h.evalv(`JSON.stringify((() => {
    const cards = [...document.querySelectorAll('#board .card')].filter(c => !c.classList.contains('matched'));
    const a = cards[0];
    const b = cards.find(c => c !== a && c.dataset.name !== a.dataset.name);
    return { a: a.dataset.index, b: b.dataset.index, nameA: a.dataset.name, nameB: b.dataset.name };
  })())`);
  const X = JSON.parse(mismatch);
  await h.evalv(`document.querySelectorAll('#board .card')[${X.a}].click()`);
  await sleep(50);
  await h.evalv(`document.querySelectorAll('#board .card')[${X.b}].click()`);
  await sleep(100);
  const m2 = await h.evalv(`JSON.stringify((() => ({
    status: document.getElementById('memoryStatus').textContent,
    matched: document.querySelectorAll('#board .card.matched').length,
    locked: document.querySelectorAll('#board .card.flipped:not(.matched)').length
  }))())`);
  const M2 = JSON.parse(m2);
  check('mismatch: move count advances, no match added, cards held flipped', M2.status === 'Парова: 1 од 8 · Потези: 2' && M2.matched === 2 && M2.locked === 2, m2);

  await sleep(800);
  const flippedBack = await h.evalv(`document.querySelectorAll('#board .card.flipped:not(.matched)').length`);
  check('mismatched cards flip back', flippedBack === 0, flippedBack + ' still flipped');

  const done = await h.evalv(`(() => {
    const cards = () => [...document.querySelectorAll('#board .card')];
    let guard = 0;
    while (guard++ < 30 && cards().some(c => !c.classList.contains('matched'))) {
      const un = cards().filter(c => !c.classList.contains('matched'));
      const a = un[0];
      const b = un.find(c => c !== a && c.dataset.name === a.dataset.name);
      if (!b) return JSON.stringify({ error: 'no pair found' });
      a.click(); b.click();
    }
    return JSON.stringify({ status: document.getElementById('memoryStatus').textContent, matched: cards().length });
  })()`);
  const D = JSON.parse(done);
  check('all 8 pairs complete: status 8/8, moves 1+1+7', D.status === 'Парова: 8 од 8 · Потези: 9' && D.matched === 16, JSON.stringify(D));

  h.close();
  const fails = getFails();
  console.log(`\n${fails === 0 ? 'ALL' : 'SOME'} CHECKS ${fails === 0 ? 'PASSED' : 'FAILED'} (${fails} fail)`);
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error('memory_smoke crashed:', e); process.exit(1); });
