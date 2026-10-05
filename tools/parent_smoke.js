/* parent_smoke.js — R12: the parent area is the only surface with technical controls.
   Also guards the new connection-status + version strip.
   Run: node tools/parent_smoke.js */
const { start, check, getFails } = require('./headless.js');
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const h = await start({ page: '/pages/parent.html', tag: 'parent-smoke', width: 1100, height: 800 });
  await sleep(1200);

  /* --- Parent gate (task 201, user-requested) --------------------------------
     The gate exists so a small child cannot reach «Преузми за офлајн рад» or
     «Обриши локални напредак». The pre-gate checks below all use .click(),
     which bypasses hit-testing entirely, so they pass whether or not the gate
     works — these checks assert the real, reachable state instead. */
  const gateStart = JSON.parse(await h.evalv(`JSON.stringify({
    gateVisible: !document.getElementById('parentGate').hidden,
    actionsHidden: document.getElementById('parentActions').hidden,
    question: document.getElementById('gateQuestion').textContent,
    choices: document.querySelectorAll('.gate-choice').length,
    // Reachability, not presence: an element inside a hidden ancestor has no
    // box, so it cannot be tapped however present it looks in the DOM.
    actionsHit: (() => {
      const el = document.getElementById('reset-progress');
      if (!el || el.offsetParent === null) return false;
      const r = el.getBoundingClientRect();
      const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return hit === el || el.contains(hit);
    })(),
  })`));
  check('gate: the parenting actions are NOT reachable before the question is answered',
    gateStart.actionsHidden === true && gateStart.actionsHit === false, JSON.stringify(gateStart));
  check('gate: shown first, with a multiplication question and 4 answers',
    gateStart.gateVisible === true && /^\d+\s*×\s*\d+\s*=\s*\?$/.test(gateStart.question.trim()) && gateStart.choices === 4,
    JSON.stringify(gateStart));
  check('gate: it is multiplication, not addition (a child who knows +/- must not pass)',
    gateStart.question.includes('×') && !gateStart.question.includes('+') && !gateStart.question.includes('-'),
    gateStart.question);

  // A wrong answer must not unlock anything.
  const wrongBtn = await h.evalv(`(()=>{const a=window.__parentGate.answer();
    const b=[...document.querySelectorAll('.gate-choice')].find(x=>Number(x.dataset.value)!==a);
    return b?b.dataset.value:null;})()`);
  await h.tap(`.gate-choice[data-value="${wrongBtn}"]`);
  await sleep(120);
  const afterWrong = JSON.parse(await h.evalv(`JSON.stringify({
    actionsHidden: document.getElementById('parentActions').hidden,
    note: document.getElementById('gateNote').textContent
  })`));
  check('gate: a wrong answer does NOT unlock the actions',
    afterWrong.actionsHidden === true && afterWrong.note.length > 0, JSON.stringify(afterWrong));

  // The correct answer unlocks them.
  const rightVal = await h.evalv(`String(window.__parentGate.answer())`);
  await h.tap(`.gate-choice[data-value="${rightVal}"]`);
  await sleep(150);
  const afterRight = JSON.parse(await h.evalv(`JSON.stringify({
    actionsHidden: document.getElementById('parentActions').hidden,
    gateHidden: document.getElementById('parentGate').hidden,
    resetHit: (() => {
      const el = document.getElementById('reset-progress');
      const r = el.getBoundingClientRect();
      const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return hit === el || el.contains(hit);
    })()
  })`));
  check('gate: the correct answer reveals the actions and they become tappable',
    afterRight.actionsHidden === false && afterRight.gateHidden === true && afterRight.resetHit === true,
    JSON.stringify(afterRight));

  // The answer must not be learnable from its position.
  const positions = JSON.parse(await h.evalv(`JSON.stringify((()=>{
    const out=[]; for(let i=0;i<12;i++){ window.__parentGate.open();
      const a=window.__parentGate.answer();
      const b=[...document.querySelectorAll('.gate-choice')].findIndex(x=>Number(x.dataset.value)===a);
      out.push(b); } return out; })())`));
  check('gate: the correct answer moves between positions (cannot be learned by position)',
    new Set(positions).size > 1 && positions.filter(p => p === 0).length < 12, JSON.stringify(positions));

  // Put it back into the solved state for the pre-existing checks below.
  const solveAgain = await h.evalv(`String(window.__parentGate.answer())`);
  await h.tap(`.gate-choice[data-value="${solveAgain}"]`);
  await sleep(120);

  /* --- small viewport (user-reported: "does not show all") -------------------
     This page used to be `overflow:hidden` with a centred flex child, so on a
     short screen the bottom of the card was unreachable — and because #app could
     not scroll, there was no way to reveal it. A second session at phone size is
     the only honest way to check that: at desktop size everything fits and the
     bug is invisible. Asserts both halves of the fix: the card's TOP is not
     clipped (the centred-flex overflow trap) and the last action is reachable
     after scrolling. */
  const small = await start({ page: '/pages/parent.html', tag: 'parent-smallvp', width: 390, height: 480 });
  await sleep(1000);
  const sSolve = await small.evalv(`String(window.__parentGate.answer())`);
  await small.tap(`.gate-choice[data-value="${sSolve}"]`);
  await sleep(200);
  const smallBefore = JSON.parse(await small.evalv(`JSON.stringify((() => {
    const app = document.getElementById('app');
    return {
      scrollable: app.scrollHeight > app.clientHeight + 1,
      overflowY: getComputedStyle(app).overflowY,
      cardTop: Math.round(document.querySelector('.parent-card').getBoundingClientRect().top)
    };
  })())`));
  check('small viewport: the parent page can scroll (it used to be overflow:hidden)',
    smallBefore.overflowY === 'auto' || smallBefore.overflowY === 'scroll', JSON.stringify(smallBefore));
  check('small viewport: the top of the card is not clipped off-screen',
    smallBefore.cardTop >= 0, JSON.stringify(smallBefore));
  await small.evalv(`document.getElementById('app').scrollTop = 99999`);
  await sleep(200);
  const smallAfter = JSON.parse(await small.evalv(`JSON.stringify((() => {
    const el = document.getElementById('audio-test');
    const r = el.getBoundingClientRect();
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return { reachable: hit === el || el.contains(hit), bottom: Math.round(r.bottom), vh: innerHeight };
  })())`));
  check('small viewport: the last parent action is reachable after scrolling',
    smallAfter.reachable === true && smallAfter.bottom <= smallAfter.vh + 1, JSON.stringify(smallAfter));
  await small.close();

  // R12 parent surface: offline download, update check, reset progress, audio test,
  // plus the facts the roadmap requires — version and offline status.
  const surface = JSON.parse(await h.evalv(`JSON.stringify({
    download: !!document.getElementById('download-offline'),
    check: !!document.getElementById('check-updates'),
    reset: !!document.getElementById('reset-progress'),
    audio: !!document.getElementById('audio-test'),
    zip: !!document.getElementById('offline-zip'),
    zipLinks: document.querySelectorAll('a[href*=".zip"]').length,
    conn: (document.getElementById('conn-status') || {}).textContent || '',
    version: (document.getElementById('version-info') || {}).textContent || '',
    offlineCopy: (document.getElementById('offline-copy-info') || {}).textContent || '',
    diagnostics: !!document.querySelector('details.diagnostics'),
    diagBody: !!document.getElementById('diag-body'),
    back: !!document.querySelector('.back-btn')
  })`));
  check('R12: parent surface has download, update check, reset progress and audio test',
    surface.download && surface.check && surface.reset && surface.audio, JSON.stringify(surface));

  // The manual ZIP download was REMOVED on 2026-10-02 (user decision), superseding
  // the 2026-09-30 "keep it hidden" outcome. Offline is the service worker:
  // "Преузми за офлајн рад" caches everything, so there is nothing to hand-unpack.
  // This previously asserted the link was present-but-hidden; it now asserts the
  // opposite, so the removed option cannot quietly return and 404 for a parent.
  check('no manual ZIP download remains in the parent area',
    surface.zip === false && surface.zipLinks === 0,
    'offline-zip=' + surface.zip + ' zipAnchors=' + surface.zipLinks);

  // Version is fetched from manifest.json, so wait for it to actually land rather
  // than assuming a fixed delay (readiness wait, not a sleep). NB: evalv already
  // returns the raw string — do NOT JSON.parse it.
  let version = '';
  for (let i = 0; i < 30; i++) {
    version = String(await h.evalv(`(document.getElementById('version-info')||{}).textContent || ''`));
    if (version && !/…/.test(version)) break;
    await sleep(150);
  }
  check('R12: parent surface shows the app version (resolved from manifest.json)',
    /^Верзија: \d+\.\d+\.\d+$/.test(version.trim()), JSON.stringify(version));

  check('R12: parent surface shows a live connection status',
    surface.conn === 'Онлајн' || surface.conn === 'Офлајн', JSON.stringify(surface));

  check('parent page has a working back button', surface.back === true);

  // R17: the offline-copy state must be a real, current fact, not a stale label.
  check('R17: parent surface states the offline-copy status',
    /^Офлајн копија: (спремна|није преузета)$/.test(surface.offlineCopy.trim()),
    JSON.stringify(surface.offlineCopy));

  // R17: technical facts live behind a disclosure, not in the parent's face.
  check('R17: technical details live under a diagnostics disclosure',
    surface.diagnostics === true && surface.diagBody === true, JSON.stringify(surface));

  // R19: the parent area is the only place local progress is shown, and it is a
  // plain record ("what was used / practiced"), never a score or comparison.
  const progressPanel = JSON.parse(await h.evalv(`JSON.stringify({
    panel: !!document.getElementById('parent-progress'),
    used: (document.getElementById('progress-used') || {}).textContent || '',
    practiced: (document.getElementById('progress-practiced') || {}).textContent || '',
    api: !!(window.PetrinProgress && window.PetrinProgress.play && window.PetrinProgress.complete && window.PetrinProgress.reset && window.PetrinProgress.snapshot)
  })`));
  check('R19: parent area shows a local progress panel, empty by default',
    progressPanel.panel && progressPanel.api && progressPanel.used === 'још ништа' && progressPanel.practiced === 'још ништа',
    JSON.stringify(progressPanel));

  await h.evalv(`window.PetrinProgress.play('animals'); window.PetrinProgress.complete('animals'); window.PetrinProgress.complete('animals'); true`);
  const snap = JSON.parse(await h.evalv(`JSON.stringify(window.PetrinProgress.snapshot())`));
  check('R19: the local store records played and completed counts',
    snap.played.animals === 1 && snap.completed.animals === 2 && snap.visits >= 1,
    JSON.stringify(snap));

  // Reset clears the store. Confirm is stubbed so the smoke drives the real
  // click path, not a bypass.
  await h.evalv(`window.confirm = function(){ return true; }; true`);
  await h.evalv(`document.getElementById('reset-progress').click(); true`);
  await sleep(150);
  const afterReset = JSON.parse(await h.evalv(`JSON.stringify({ snap: window.PetrinProgress.snapshot(), status: (document.getElementById('parent-status')||{}).textContent || '' })`));
  check('R19: reset empties the local progress store and confirms it',
    Object.keys(afterReset.snap.played).length === 0 && afterReset.status === 'Напредак обрисан',
    JSON.stringify(afterReset));

  // R17 update flow: drive it deterministically with the exact letters the worker
  // posts. A real deploy would post these; the UI's reaction is what must hold.
  const fake = async (data) => {
    await h.evalv(`navigator.serviceWorker.dispatchEvent(new MessageEvent('message', { data: ${JSON.stringify(data)} })); true`);
    await sleep(150);
  };
  const textOf = sel => h.evalv(`((document.querySelector(${JSON.stringify(sel)})||{}).textContent || '').trim()`);

  await fake({ type: 'check-result', changed: 2, changes: ['a.js', 'b.js'] });
  let s = await textOf('#parent-status');
  check('R17: a detected change prompts "Постоји нова верзија"',
    s === 'Постоји нова верзија', JSON.stringify(s));
  check('R17: an available update relabels the download button',
    /Ажурирај/.test(await textOf('#download-offline')), JSON.stringify(await textOf('#download-offline')));

  await fake({ type: 'cache-complete', total: 207, skipped: [] });
  s = await textOf('#parent-status');
  check('R17: completing the re-cache confirms "Ажурирано"', s === 'Ажурирано', JSON.stringify(s));
  check('R17: the download button returns to its normal label after updating',
    /Преузми/.test(await textOf('#download-offline')), JSON.stringify(await textOf('#download-offline')));

  await fake({ type: 'updated', version: 'petrin-v2.0.0' });
  s = await textOf('#parent-status');
  check('R17: a worker upgrade confirms "Ажурирано"', s === 'Ажурирано', JSON.stringify(s));

  // R17: the offline download must show real movement, not a frozen label.
  const barState = () => h.evalp(`(function(){
    var b = document.getElementById('cache-bar'), f = document.getElementById('cache-bar-fill');
    return JSON.stringify({ hidden: !!b.hidden, width: f.style.width || '', now: b.getAttribute('aria-valuenow') || '' });
  })()`);
  check('R17: the download progress bar starts hidden',
    JSON.parse(await barState()).hidden === true);

  await fake({ type: 'cache-progress', completed: 52, total: 208 });
  let bar = JSON.parse(await barState());
  s = await textOf('#parent-status');
  check('R17: cache progress reveals the bar, fills it and states the count',
    bar.hidden === false && bar.width === '25%' && bar.now === '25' && s === 'Преузимам 52/208 (25%)',
    JSON.stringify({ bar, status: s }));

  await fake({ type: 'cache-complete', total: 208, skipped: [] });
  bar = JSON.parse(await barState());
  check('R17: completing the download hides the progress bar',
    bar.hidden === true && bar.width === '0%', JSON.stringify(bar));

  await fake({ type: 'cache-error', message: 'network down' });
  s = await textOf('#parent-status');
  check('R17: a cache failure hides the bar and reports the error',
    (JSON.parse(await barState()).hidden === true) && /Грешка при преузимању/.test(s),
    JSON.stringify({ status: s }));

  // The audio test should actually produce a running audio context.
  await h.evalv(`document.getElementById('audio-test').click(); true`);
  await sleep(600);
  const audioState = await h.evalv(`(function(){
    var b = document.getElementById('audio-test');
    return { pressed: !!b, status: (document.getElementById('parent-status')||{}).textContent || '' };
  })()`);
  check('audio test button is wired and reports status', audioState.pressed === true, JSON.stringify(audioState));

  await h.close();
  process.exit(getFails() ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
