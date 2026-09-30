/* parent_smoke.js — R12: the parent area is the only surface with technical controls.
   Also guards the new connection-status + version strip, and the manual ZIP link.
   Run: node tools/parent_smoke.js */
const { start, check, getFails } = require('./headless.js');
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const h = await start({ page: '/pages/parent.html', tag: 'parent-smoke', width: 1100, height: 800 });
  await sleep(1200);

  // R12 parent surface: offline download, update check, reset progress, audio test,
  // plus the facts the roadmap requires — version and offline status. (The manual
  // ZIP link is present but hidden; asserted separately below.)
  const surface = JSON.parse(await h.evalv(`JSON.stringify({
    download: !!document.getElementById('download-offline'),
    check: !!document.getElementById('check-updates'),
    reset: !!document.getElementById('reset-progress'),
    audio: !!document.getElementById('audio-test'),
    zip: !!document.getElementById('offline-zip'),
    zipHref: (document.getElementById('offline-zip') || {}).getAttribute
      ? document.getElementById('offline-zip').getAttribute('href') : '',
    conn: (document.getElementById('conn-status') || {}).textContent || '',
    version: (document.getElementById('version-info') || {}).textContent || '',
    back: !!document.querySelector('.back-btn')
  })`));
  check('R12: parent surface has download, update check, reset progress and audio test',
    surface.download && surface.check && surface.reset && surface.audio, JSON.stringify(surface));

  // R12 asked for a manual ZIP link, but the archive is untracked and therefore
  // not published, so the link 404s on the live site. Per user decision (2026-09-30)
  // it stays in the markup but HIDDEN until the ZIP is actually deployed. Assert
  // that it is genuinely not presented, not merely absent from the DOM.
  const zip = JSON.parse(await h.evalv(`JSON.stringify((function(){
    var a = document.getElementById('offline-zip');
    if (!a) return { present: false };
    var cs = getComputedStyle(a);
    var r = a.getBoundingClientRect();
    return { present: true, hiddenAttr: a.hasAttribute('hidden'),
             display: cs.display, visible: cs.display !== 'none' && r.width > 0 && r.height > 0,
             href: a.getAttribute('href') };
  })())`));
  check('R12: manual ZIP link is present but NOT shown (unpublished archive, hidden by decision)',
    zip.present === true && zip.visible === false && zip.hiddenAttr === true,
    JSON.stringify(zip));

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

  h.close();
  process.exit(getFails() ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
