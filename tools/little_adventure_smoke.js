/* Мала авантура (Little Adventure) smoke — IS-02 skeleton + IS-08+ shell (task 467+).
   Drives pages/little_adventure.html headlessly: boot + hook, route contract,
   back control reachability, no-WebGL fallback, no-network static rule, and
   Serbian locale. Gameplay assertions arrive card by card (TP §3 S1…S6 here,
   W1…W14 behind the WebGL gate from IS-18).
   Run:  node tools/little_adventure_smoke.js
   Requires Node >= 22. CHROME_PATH env optional. */
const { start, check, skip, getFails, getSkips } = require('./headless.js');
const { checkRouteWired } = require('./route_contract.js');
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* TD §8 / TP §3.1: the page may never reach the network. The one legitimate
   occurrence of an absolute URL is the inline SVG xmlns in the favicon/back icon. */
const ALLOWED_SVG_XMLNS = /http:\/\/www\.w3\.org\/2000\/svg/g;
const BANNED = ['fetch(', 'XMLHttpRequest', 'sendBeacon', 'WebSocket', 'http://', 'https://'];

const backGeometry = async hh => JSON.parse(await hh.evalv(`JSON.stringify((() => {
  const el = document.getElementById('i3d-back');
  if (!el) return { found: false, inside: false, hit: false, w: 0, h: 0 };
  const r = el.getBoundingClientRect();
  const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
  return { found: true,
    inside: r.top >= -1 && r.left >= -1 && r.bottom <= innerHeight + 1 && r.right <= innerWidth + 1,
    hit: !!(hit && (hit === el || el.contains(hit))),
    w: r.width, h: r.height };
})())`));

(async () => {
  const h = await start({ page: '/pages/little_adventure.html', tag: 'little_adventure-smoke', width: 1100, height: 700 });

  let ready = false;
  for (let i = 0; i < 40 && !ready; i++) {
    ready = await h.evalv(`typeof window.startlittle_adventure === 'function'`);
    if (!ready) await sleep(250);
  }
  /* S1: page boots, the start hook is present */
  check('page boots (startlittle_adventure is a function)', ready === true, String(ready));

  /* WebGL gate — same discipline as racing3d_smoke: never stub, count as SKIP */
  const webglOK = await h.evalv(`(function () {
    try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; }
  })()`);

  await h.evalv(`
    (function(){ window.speech={speak:function(){},cancel:function(){}};
      window.audioBuses.play=function(){};window.audioBuses.speakWithDuck=function(t,cb){if(cb)cb();};
      window.celebrate=function(){}; true })()`);

  /* S4: no-WebGL fallback shows the Serbian message instead of a blank page */
  const fb = JSON.parse(await h.evalv(`JSON.stringify({
    shown: document.getElementById('i3d-view') ? true : false,
    fallback: document.getElementById('i3d-view').textContent,
    gameBg: getComputedStyle(document.getElementById('i3d-game')).backgroundColor,
    startFn: typeof window.startlittle_adventure
  })`));
  check('the page is not blank — sky-blue stage is painted (S4 stage)', fb.gameBg.includes('135') && fb.gameBg.includes('206') && fb.gameBg.includes('235'), JSON.stringify(fb));
  check('no-WebGL fallback text present when WebGL is missing (S4)', webglOK || fb.fallback === '3D није доступан овде', JSON.stringify(fb));

  const g = await backGeometry(h);
  /* S3: back button inside the viewport, hit-testable, >= 56 px */
  check('back button inside viewport and hit-testable (S3)', g.found && g.inside && g.hit, JSON.stringify(g));
  check('back button is a comfortable tap target (>= 56px) (S3)',
    g.found && Math.min(g.w, g.h) >= 56, `w=${g.w} h=${g.h}`);

  /* S2: route contract — registry fields + hidden tile data-go */
  const indexHtml = fs.readFileSync(path.join(ROOT, 'game', 'index.html'), 'utf8');
  checkRouteWired('little_adventure', 'game-little_adventure', 'pages/little_adventure.html',
    { back: 'i3d-back', start: 'startlittle_adventure', check });
  check('hub tile data-go present (hidden until IS-19)', indexHtml.includes('data-go="game-little_adventure"'));

/* S5: page + stub module contain no network calls */
  for (const [label, file] of [['page', 'pages/little_adventure.html'], ['stub', 'games/little_adventure.mjs']]) {
    const src = fs.readFileSync(path.join(ROOT, 'game', file), 'utf8').replace(ALLOWED_SVG_XMLNS, '');
    const hits = BANNED.filter(b => src.includes(b));
    check(`the ${label} makes no network calls (S5 / TD §8)`, hits.length === 0, hits.join(', ') || 'none');
  }

  if (!webglOK) {
    skip('WebGL battery (renderer boot, canvas, ground, water, hero box, camera, loop, back)', 'no WebGL context in this environment');
    const f = getFails();
    console.log(`\nlittle_adventure: ${getSkips()} SKIPPED (no WebGL) — W1…W14 need a WebGL host.`);
    await h.close();
    process.exit(f ? 1 : 0);
  }

  await h.close();
  process.exit(getFails() ? 1 : 0);
})();
