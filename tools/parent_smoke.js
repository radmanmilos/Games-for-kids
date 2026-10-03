/* parent_smoke.js — R12: the parent area is the only surface with technical controls.
   Also guards the new connection-status + version strip.
   Run: node tools/parent_smoke.js */
const { start, check, getFails } = require('./headless.js');
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const h = await start({ page: '/pages/parent.html', tag: 'parent-smoke', width: 1100, height: 800 });
  await sleep(1200);

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
