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
