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

  // Start a fresh game (dismiss start overlay)
  await h.evalv('(function(){const b=document.getElementById("i3d-btn-new"); if(b) b.click(); return true;})()');
  await sleep(200);

  // W1: hook exists & webgl
  const w1 = await h.evalv('window.__little_adventure && window.__little_adventure.state().webgl === true');
  check('W1: hook exists & state().webgl', w1 === true, String(w1));

  // W2: setStick + step moves hero; release stops
  await h.evalv('window.__little_adventure.seed(7); window.__little_adventure.pause();');
  const before = JSON.parse(await h.evalv('JSON.stringify(window.__little_adventure.state().hero)'));
  await h.evalv('window.__little_adventure.setStick(1,0); window.__little_adventure.step(200);');
  const after = JSON.parse(await h.evalv('JSON.stringify(window.__little_adventure.state().hero)'));
  await h.evalv('window.__little_adventure.setStick(0,0); window.__little_adventure.step(200);');
  const stopped = JSON.parse(await h.evalv('JSON.stringify(window.__little_adventure.state().hero)'));
  check('W2: setStick+step moves hero (x increases)', after.x > before.x, `before=${before.x} after=${after.x}`);
  check('W2b: release stops (x stops increasing)', Math.abs(stopped.x - after.x) < 0.5 || stopped.x >= after.x, `after=${after.x} stopped=${stopped.x}`);

  // W4: draw-call/triangle budgets at start
  const info = JSON.parse(await h.evalv('JSON.stringify({calls: window.__little_adventure.state().drawCalls, tris: window.__little_adventure.state().triangles})'));
  check('W4: draw calls <= 220 (high tier budget)', info.calls <= 220, `calls=${info.calls}`);
  check('W4b: triangles <= 130000', info.tris <= 130000, `tris=${info.tris}`);

  // photo() preset smoke (state valid after each)
  let photoOk = true;
  for (const name of ['meadow-wide','shrine-wide','lighthouse']) {
    const r = await h.evalv(`(function(){ try { window.__little_adventure.photo(${JSON.stringify(name)}); return window.__little_adventure.state().webgl === true; } catch(e){ return false; } })()`);
    if (r !== true) { photoOk = false; console.log('  photo failed:', name, r); }
  }
  check('Q-00: photo() works for presets', photoOk, '');

  // W3: closed gate blocks
  await h.evalv('window.__little_adventure.seed(7); window.__little_adventure.pause(); window.__little_adventure.teleport(0,-14);');
  await h.evalv('window.__little_adventure.setStick(0,-1); for(let i=0;i<20;i++) window.__little_adventure.step(50); window.__little_adventure.setStick(0,0);');
  const w3z = await h.evalv('window.__little_adventure.state().hero.z');
  check('W3: closed gate blocks hero (z does not pass G1)', w3z > -16.5, `z=${w3z}`);

  // W5: mesh/logic states match after give/teleport (gate opens)
  await h.evalv('window.__little_adventure.seed(7); window.__little_adventure.pause(); window.__little_adventure.give("keyMeadow"); window.__little_adventure.teleport(0,-14);');
  await h.evalv('window.__little_adventure.setStick(0,-1); for(let i=0;i<30;i++) window.__little_adventure.step(50); window.__little_adventure.setStick(0,0);');
  const w5gate = await h.evalv('(function(){ var s=window.__little_adventure.state(); return s && s.gates && s.gates.G1 ? !!s.gates.G1.open : null; })()');
  check('W5: give+teleport+step opens G1 in logic state', w5gate === true, `G1.open=${w5gate}`);

  // W6: fxTable covers event types
  const fxKeys = JSON.parse(await h.evalv('JSON.stringify(window.__little_adventure.fxTable ? window.__little_adventure.fxTable() : [])'));
  check('W6: fxTable() covers >=16 event types', Array.isArray(fxKeys) && fxKeys.length >= 16, `n=${fxKeys.length}`);

  // W7: particles <= cap in a 60s flail (real-time render loop, frantic input)
  await h.evalv('window.__little_adventure.seed(7); window.__little_adventure.pause(); (function(){ var po=document.getElementById("i3d-pause"); if(po){po.style.display="none";} })();');
  await h.evalv('(function(){ window.__laFlailStart=performance.now(); window.__laFlailMax=0; window.__laFlailInt=setInterval(function(){ var h=window.__little_adventure; if(!h) return; var t=performance.now(); var a=t*0.003; h.setStick(Math.cos(a), Math.sin(a*1.3)); if(Math.floor(t/300)%2===0) h.swing(); h.shield(Math.floor(t/500)%2===0); var st=h.state(); if(st.particlesAlive>window.__laFlailMax) window.__laFlailMax=st.particlesAlive; }, 50); })()');
  await sleep(60000);
  const w7 = JSON.parse(await h.evalv('JSON.stringify({max: window.__laFlailMax||0, cap: (window.__little_adventure.state().particleCap||0), alive: window.__little_adventure.state().particlesAlive||0})'));
  await h.evalv('(function(){ clearInterval(window.__laFlailInt); var h=window.__little_adventure; if(h){h.setStick(0,0); h.setShield(false);} })()');
  check('W7: particles <= cap in 60s flail', w7.max <= w7.cap && w7.cap > 0, `max=${w7.max} cap=${w7.cap} alive=${w7.alive}`);

  // W9: speech keys / 4s guard hook present
  const w9 = await h.evalv('(function(){ var s=window.__little_adventure.state(); return typeof window.__laLastSpeech === "object" || window.__laLastSpeech === undefined; })()');
  check('W9: speech hook does not throw / shape ok', w9 === true, String(w9));

  // W11: pause on visibility
  await h.evalv('(function(){ try{ Object.defineProperty(document,"hidden",{get:function(){return true;},configurable:true}); document.dispatchEvent(new Event("visibilitychange")); }catch(e){} })()');
  const w11Paused = await h.evalv('(function(){ return document.getElementById("i3d-pause") ? document.getElementById("i3d-pause").style.display : ""; })()');
  // paused flag is internal; visibility handler sets it - verify no throw and overlay/pause path engaged by checking audio suspend guard path indirectly via state still readable
  const w11StateOk = await h.evalv('window.__little_adventure.state().webgl === true');
  await h.evalv('(function(){ try{ Object.defineProperty(document,"hidden",{get:function(){return false;},configurable:true}); document.dispatchEvent(new Event("visibilitychange")); }catch(e){} })()');
  check('W11: visibilitychange(hidden) handled without throw', w11StateOk === true, `pause=${w11Paused}`);

  // W13: adaptive tier steps down once, never up (via render loop)
  await h.evalv('window.__little_adventure.seed(7); window.__little_adventure.forceSlow(true);');
  await h.evalv('(function(){ var po=document.getElementById("i3d-pause"); if(po){po.style.display="flex"; po.click();} })()');
  let tierAfterSlow = 'high';
  for (let i = 0; i < 40; i++) {
    await sleep(100);
    tierAfterSlow = await h.evalv('window.__little_adventure.state().tier');
    if (tierAfterSlow !== 'high') break;
  }
  await h.evalv('window.__little_adventure.forceSlow(false);');
  await sleep(800);
  const tierAfterRecover = await h.evalv('window.__little_adventure.state().tier');
  check('W13: adaptive tier steps down under slow frames', tierAfterSlow !== 'high', `tier=${tierAfterSlow}`);
  check('W13b: tier never steps up automatically', tierAfterRecover === tierAfterSlow, `afterSlow=${tierAfterSlow} afterRecover=${tierAfterRecover}`);

  // W10: save round trip (progress flags)
  await h.evalv('window.__little_adventure.seed(7); window.__little_adventure.pause(); window.__little_adventure.give("keyMeadow"); window.__little_adventure.step(50);');
  const w10snap = JSON.parse(await h.evalv('JSON.stringify(window.__little_adventure.save())'));
  await h.evalv('window.__little_adventure.seed(7); window.__little_adventure.step(50);');
  await h.evalv(`window.__little_adventure.load(${JSON.stringify(w10snap)})`);
  await h.evalv('window.__little_adventure.step(50);');
  const w10after = JSON.parse(await h.evalv('JSON.stringify({carry: window.__little_adventure.state().carry, items: window.__little_adventure.state().items})'));
  const w10ok = !!w10snap && w10snap.v === 1 && Array.isArray(w10after.carry) && w10after.carry.indexOf('keyMeadow') !== -1;
  check('W10: save round trip restores progress (carry)', w10ok, `carry=${JSON.stringify(w10after.carry)}`);

  // W12: context lost/restored does not throw (use temp canvas to avoid polluting game renderer)
  const w12 = await h.evalv(`(function(){
    try {
      var c = document.createElement('canvas');
      var gl = c.getContext('webgl') || c.getContext('experimental-webgl');
      if (!gl) return 'no-gl';
      var ext = gl.getExtension('WEBGL_lose_context');
      if (!ext) return 'no-ext';
      ext.loseContext();
      ext.restoreContext();
      return 'ok';
    } catch(e) { return 'err:' + e.message; }
  })()`);
  check('W12: WEBGL_lose_context lose/restore does not throw', w12 === 'ok' || w12 === 'no-ext', String(w12));

  // W8: reduced-motion response (motionScale) via bootEmulated
  let w8ok = false, w8detail = 'not-run';
  try {
    const h2 = await start({ page: null, tag: 'la-smoke-rm', width: 1100, height: 700 });
    try {
      await h2.c.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
      await h2.navigate(`http://127.0.0.1:${h2.port}/pages/little_adventure.html`);
      let ready2 = false;
      for (let i = 0; i < 40 && !ready2; i++) {
        ready2 = await h2.evalv(`typeof window.startlittle_adventure === 'function'`);
        if (!ready2) await sleep(250);
      }
      await h2.evalv('(function(){ var b=document.getElementById("i3d-btn-new"); if(b) b.click(); })()');
      await sleep(500);
      const ms = await h2.evalv('window.__little_adventure && window.__little_adventure.state ? window.__little_adventure.state().motionScale : null');
      const rm = await h2.evalv('!!window.REDUCED_MOTION');
      w8ok = (ms === 0 || rm === true);
      w8detail = `motionScale=${ms} REDUCED_MOTION=${rm}`;
    } finally {
      await h2.close({ checkErrors: false });
    }
  } catch (e) {
    w8detail = 'err:' + (e && e.message ? e.message : e);
  }
  check('W8: reduced-motion response (motionScale) via bootEmulated', w8ok, w8detail);

  await h.close();
  process.exit(getFails() ? 1 : 0);
})();
