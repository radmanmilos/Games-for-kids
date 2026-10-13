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
    // Normalise to the top first: tapping the gate choice focuses it, and the
    // browser scrolls #app to reveal the focused button, so the card top would
    // read negative for a reason unrelated to clipping. The invariant is that at
    // the TOP of the scroll range the card top is on-screen.
    app.scrollTop = 0;
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
  // returns the raw string — do NOT JSON.parse it. V19 (spec §37): the value cell
  // holds only the number now; the «Верзија» label is a separate status row (see
  // the V19 guards below), so the word is no longer baked into this text.
  let version = '';
  for (let i = 0; i < 30; i++) {
    version = String(await h.evalv(`(document.getElementById('version-info')||{}).textContent || ''`));
    if (version && !/…/.test(version)) break;
    await sleep(150);
  }
  check('R12: parent surface shows the app version (resolved from manifest.json)',
    /^\d+\.\d+\.\d+$/.test(version.trim()), JSON.stringify(version));

  check('R12: parent surface shows a live connection status',
    surface.conn === 'Онлајн' || surface.conn === 'Офлајн', JSON.stringify(surface));

  check('parent page has a working back button', surface.back === true);

  /* --- V19 (spec §37/§43): the parent surface is grouped and calm -------------
     §37 asks the parent area to read as calm and grouped — grouped cards,
     readable labels, progress summaries, expandable details, restrained colour —
     and never as a developer dashboard (dense tables, tiny metadata, raw
     technical ids in the parent's face, child-facing toy shadows). These guards
     pin each half of that contract. */
  const v19 = JSON.parse(await h.evalv(`JSON.stringify((() => {
    const px = v => Math.round(parseFloat(v) * 10) / 10;
    const cs = el => getComputedStyle(el);
    const card = document.querySelector('.parent-card');
    const cardShadow = cs(card).boxShadow;
    const lens = (cardShadow.match(/\\d+(?:\\.\\d+)?px/g) || []).map(parseFloat);
    const sections = [...document.querySelectorAll('.parent-section')];
    const fuzzy = ['status-key','status-value','progress-key','progress-value','parent-status','diagnostics']
      .map(c => document.querySelector('.' + c)).filter(Boolean)
      .map(el => ({ cls: el.className, size: px(cs(el).fontSize), opacity: cs(el).opacity }));
    // Visible text with every disclosure removed: a raw technical fact may live
    // inside a <details>, never in the parent's face.
    const clone = card.cloneNode(true);
    clone.querySelectorAll('details').forEach(d => d.remove());
    const faceText = clone.textContent.replace(/\\s+/g, ' ');
    const rawTokens = ['offline-manifest.json','manifest.json','sw-cache','.js','.css','http://','https://','/game/'];
    const back = document.getElementById('back-btn');
    return {
      sectionCount: sections.length,
      sectionTitles: sections.map(s => ((s.querySelector('.section-title') || {}).textContent || '').trim()),
      sectionShadows: sections.map(s => cs(s).boxShadow),
      cardShadow,
      // A toy shadow is a hard offset with no blur: "0px 8px 0px".
      cardHardShadow: /0px \\d+(?:\\.\\d+)?px 0px/.test(cardShadow),
      cardBlur: lens.length >= 3 ? lens[2] : 0,
      fuzzy,
      tables: card.querySelectorAll('table').length,
      rawInFace: rawTokens.filter(t => faceText.includes(t)),
      backClasses: back ? back.className : '',
    };
  })())`));
  check('V19: the card is split into labelled groups, not one undifferentiated wall',
    v19.sectionCount >= 3 && v19.sectionTitles.length >= 3 && v19.sectionTitles.every(t => t.length > 0),
    JSON.stringify({ count: v19.sectionCount, titles: v19.sectionTitles }));
  check('V19: the card uses a soft shadow, never the child-facing toy offset shadow',
    v19.cardHardShadow === false && v19.cardBlur > 0, JSON.stringify({ shadow: v19.cardShadow, blur: v19.cardBlur }));
  check('V19: the groups are flat panels (restrained colour), not stacked toy cards',
    v19.sectionShadows.every(s => s === 'none'), JSON.stringify(v19.sectionShadows));
  check('V19: every label/value reads at >=13px and none is dimmed with opacity',
    v19.fuzzy.length >= 6 && v19.fuzzy.every(f => f.size >= 13 && f.opacity === '1'),
    JSON.stringify(v19.fuzzy));
  check('V19: no dense tables — the parent surface is prose rows, not a grid',
    v19.tables === 0, 'tables=' + v19.tables);
  check('V19: raw technical ids stay out of the parent face (disclosures only)',
    v19.rawInFace.length === 0, JSON.stringify(v19.rawInFace));
  check('V19: the back control adopts the shared .ps-back component chrome (§43)',
    v19.backClasses.includes('ps-back') && v19.backClasses.includes('back-btn'),
    JSON.stringify(v19.backClasses));

  // R17: the offline-copy state must be a real, current fact, not a stale label.
  // V19: the value cell holds only the state; «Офлајн копија» is a status row label.
  check('R17: parent surface states the offline-copy status',
    /^(спремна|није преузета)$/.test(surface.offlineCopy.trim()),
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

  // V19 (spec §37): progress leads with a readable count summary, and the game
  // names live behind a CLOSED disclosure — never a run-on comma list in the
  // parent's face. Record a second game and render the summary through the page's
  // own hook (the panel only renders on load/reset otherwise).
  await h.evalv(`window.PetrinProgress.play('piano'); window.PetrinProgress.complete('piano'); window.__parentProgress(); true`);
  const summary = JSON.parse(await h.evalv(`JSON.stringify((() => {
    const used = document.getElementById('progress-used');
    const det = document.querySelector('details.progress-details');
    const games = document.getElementById('progress-games');
    // A closed <details> hides its content via content-visibility, so a stale
    // getBoundingClientRect() still reports a size — checkVisibility() is the
    // honest test. Prove BOTH states so the probe cannot pass vacuously.
    const painted = () => games.checkVisibility ? games.checkVisibility() : games.offsetParent !== null;
    const closedHidden = det.open === false && painted() === false;
    det.open = true;
    const openShown = painted() === true;
    det.open = false;
    return { used: used.textContent.trim(), usedHasComma: used.textContent.includes(','), closedHidden, openShown, text: games.textContent.trim() };
  })())`));
  check('V19: progress leads with a count summary ("N од M"), not a run-on name list',
    /^\d+ од \d+$/.test(summary.used) && summary.usedHasComma === false,
    JSON.stringify(summary));
  check('V19: the game names sit behind a disclosure, hidden until the parent opens it',
    summary.closedHidden === true && summary.openShown === true &&
      /Животиње/.test(summary.text) && /Клавир/.test(summary.text),
    JSON.stringify(summary));

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

  // R20: a stalled cache-all must unstick itself. The worker can be reaped
  // mid-run (backgrounded tab / sleeping tablet), which used to freeze the bar and
  // lock the button forever. The page now arms a stall watchdog on the download
  // and re-issues cacheAll when progress stops.
  // (a) A worker must be live before the click can aim at it. `ready` is the
  //     same promise the button awaits, so it is the honest precondition; a
  //     `getRegistration().active` poll would false-fail while the ~250-file
  //     install precache is still running (registration exists, `.active` null).
  const swReady = await h.evalp(`(async () => { const r = await navigator.serviceWorker.ready; return (r && r.active) ? 'yes' : 'no'; })()`);
  check('R20: a live service worker is available to the parent page', swReady === 'yes');

  // (b) Clicking «Преузми» arms the watchdog (aimed at the live worker). The
  //     message is swallowed so the real worker does not start a full cache run —
  //     we are testing the page's wiring, not the download itself.
  await h.evalv(`(function(){
    window.__swPost = ServiceWorker.prototype.postMessage;
    window.__posts = 0;
    ServiceWorker.prototype.postMessage = function(){ window.__posts++; };
    document.getElementById('download-offline').click();
    return true;
  })()`);
  await sleep(300);
  const armed = JSON.parse(await h.evalv(`JSON.stringify({
    posts: window.__posts,
    armed: window.__parentCache.isArmed(),
    busy: document.getElementById('download-offline').disabled
  })`));
  check('R20: starting the download arms the stall watchdog against the live worker',
    armed.posts >= 1 && armed.armed === true && armed.busy === true, JSON.stringify(armed));

  // (c) With no further progress, the watchdog re-issues cacheAll by itself.
  await h.evalv(`(function(){
    window.__nudges = 0;
    window.__parentCache.setStallMs(200);
    window.__parentCache.setWorker({ postMessage: function(){ window.__nudges++; } });
    window.__parentCache.arm();
    return true;
  })()`);
  await sleep(750);
  const nudges = await h.evalv(`window.__nudges`);
  check('R20: a stalled download is re-issued automatically (the bar unsticks itself)',
    nudges >= 2, 'nudges=' + nudges);

  // (d) Completing the download clears the watchdog and unlocks the button.
  await fake({ type: 'cache-progress', completed: 10, total: 208 });
  await fake({ type: 'cache-complete', total: 208, skipped: [] });
  const cleared = JSON.parse(await h.evalv(`JSON.stringify({
    armed: window.__parentCache.isArmed(),
    busy: document.getElementById('download-offline').disabled
  })`));
  check('R20: completing the download clears the watchdog and unlocks the button',
    cleared.armed === false && cleared.busy === false, JSON.stringify(cleared));

  // restore the real postMessage for anything after this
  await h.evalv(`if (window.__swPost) ServiceWorker.prototype.postMessage = window.__swPost; true`);

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
