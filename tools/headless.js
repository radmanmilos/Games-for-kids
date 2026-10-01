/* Shared headless-Chrome harness for the Petrin svet project (dev only).
   Serves game/ over HTTP (file:// breaks audio, the kitty iframe, and throws
   Unsafe-attempt warnings), boots headless Chrome on a UNIQUE temp profile, and
   exposes an evalv / navigate / close API. No deps: Node >= 22 (global fetch +
   WebSocket). Usage from a tools/*.js script:

     const { start, check } = require('./headless.js');
     const h = await start({ page: '/pages/tracing.html', tag: 'tracing-smoke', width: 1280, height: 800 });
     await h.evalv('...expression...');
     check('name', condition, info);
     h.close();                      // stops server + kills this run's Chrome
     process.exit(fails ? 1 : 0);    // 'fails' is tracked here via check()

   Gotchas handled here:
     - Stale Chrome processes lock their temp profile and the debug port, which
       intermittently made Chrome "not start". Each start() uses a fresh unique
       profile, retries, and close() kills only this run's Chrome by profile tag.
       killChromeByTag() has BOTH a Windows (pwsh) and a POSIX (pkill -f on the
       unique profile path) branch - the Windows-only version silently leaked
       every browser on Linux and starved the suite.
     - CHROME_PATH env overrides the Chrome binary.
     - skip(name, why) records a check that could not run because the ENVIRONMENT
       lacks a capability. Use it ONLY for that. Never use a skip (or a stubbed
       hook) to make a real failure disappear: a skip still prints SKIP and is
       counted, so reduced coverage never reads as a green battery.
*/
const { execFile, execFileSync } = require('child_process');
const path = require('path');
const http = require('http');
const fs = require('fs');

const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const ROOT = path.resolve(__dirname, '..', 'game');
const TMP = process.env.TMPDIR || process.env.TEMP || '/tmp';

function findChrome() {
  if (fs.existsSync(CHROME)) return CHROME;
  const candidates = [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    path.join(process.env.LOCALAPPDATA || '', 'Google/Chrome/Application/chrome.exe'),
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
  ]
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css',
  '.svg': 'image/svg+xml', '.ogg': 'audio/ogg', '.mp3': 'audio/mpeg',
  '.woff2': 'font/woff2', '.png': 'image/png',
};

const sleep = ms => new Promise(r => setTimeout(r, ms));

let fails = 0;
let skips = 0;
function check(name, ok, info) {
  console.log((ok ? 'PASS ' : 'FAIL ') + name + (info ? '  [' + info + ']' : ''));
  if (!ok) fails++;
}

/* Record a check that could NOT run because the environment lacks a capability
   (e.g. no WebGL in headless Chrome). A skip is NOT a pass: it is counted and
   reported so reduced coverage can never be mistaken for a green battery.
   `why` must say what was missing. */
function skip(name, why) {
  skips++;
  console.log('SKIP ' + name + (why ? '  [' + why + ']' : ''));
}

/* Kill Chrome processes whose command line contains `tag` (e.g. a profile path). */
function killChromeByTag(tag) {
  // Windows: the profile path appears in the process command line, so match on it.
  if (process.platform === 'win32') {
    try {
      execFileSync('pwsh', ['-NoProfile', '-Command',
        `Get-Process chrome -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -match [regex]::Escape('${tag}') } | Stop-Process -Force -ErrorAction SilentlyContinue`],
        { timeout: 8000, stdio: 'ignore' });
    } catch (e) { /* pwsh not available or nothing to kill — fine */ }
    return;
  }
  // Linux/macOS: the pwsh branch above is a silent no-op, so close() reaped
  // NOTHING and every smoke run leaked its Chrome. On a busy machine those
  // orphans keep burning CPU and starve later runs — which is a very likely
  // source of the "only fails under parallel load" flakes. start() gives every
  // run a unique profile path, so matching on it is safe and precise.
  try {
    execFileSync('pkill', ['-f', 'user-data-dir=' + tag], { stdio: 'ignore' });
  } catch (e) { /* nothing to kill — fine */ }
}

function cdp(wsUrl) {
  let id = 0;
  const pending = new Map();
  const ws = new WebSocket(wsUrl);
  return new Promise((resolve) => {
    ws.onopen = () => resolve({
      send(method, params = {}, sessionId) {
        return new Promise((res) => {
          const mid = ++id;
          pending.set(mid, res);
          ws.send(JSON.stringify({ id: mid, method, params, ...(sessionId ? { sessionId } : {}) }));
        });
      },
    });
    ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg.result); pending.delete(msg.id); }
    };
  });
}

/* Serve game/ over HTTP on an ephemeral port. file:// breaks audio, the kitty
   iframe and throws Unsafe-attempt warnings, so EVERY harness (including the
   Playwright/a11y tools) must go through this. Returns { port, close }. */
async function serve() {
  const server = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (p === '/') p = '/index.html';
    const file = path.join(ROOT, p);
    fs.readFile(file, (err, data) => {
      if (err) { res.writeHead(404); res.end('nf'); return; }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream' });
      res.end(data);
    });
  });
  await new Promise(r => server.listen(0, r));
  return { port: server.address().port, close: () => server.close() };
}

async function start({ page, tag = 'pkv', width = 1280, height = 800, dpr = 1 } = {}) {
  const srv = await serve();
  const httpPort = srv.port;

  const profile = path.join(TMP, 'pkv-' + tag + '-' + Date.now() + '-' + Math.floor(Math.random() * 1e6));
  const dbgPort = httpPort + 100 + Math.floor(Math.random() * 1000);

  const chromeBin = findChrome();
  if (!chromeBin) {
    srv.close();
    throw new Error('Chrome not found. Install Chrome or set CHROME_PATH, then re-run this smoke.');
  }

  const CHROME_FLAGS = [
    '--headless=new', '--disable-gpu', `--remote-debugging-port=${dbgPort}`,
    '--user-data-dir=' + profile, '--no-first-run', '--no-default-browser-check',
    '--disable-background-networking', '--disable-component-update', '--disable-default-apps',
    '--disable-sync', '--disable-features=Translate,MediaRouter,OptimizationGuideModelDownloading',
    '--no-sandbox', '--mute-audio', 'about:blank',
  ];
  let version = null;
  for (let attempt = 0; attempt < 2 && !version; attempt++) {
    execFile(chromeBin, CHROME_FLAGS);
    for (let i = 0; i < 20 && !version; i++) {
      try { version = await (await fetch(`http://127.0.0.1:${dbgPort}/json/version`)).json(); }
      catch { await sleep(100); }
    }
    if (!version) { killChromeByTag(profile); await sleep(250); }
  }
  if (!version) {
    srv.close();
    throw new Error('Chrome did not start (debug port ' + dbgPort + ') — skipped in this environment');
  }

  const dbg = await cdp(version.webSocketDebuggerUrl);
  const target = await dbg.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await dbg.send('Target.attachToTarget', { targetId: target.targetId, flatten: true });
  const c = { send: (m, p) => dbg.send(m, p, sessionId) };
  await c.send('Page.enable');
  await c.send('Runtime.enable');
  if (width && height) {
    // dpr=2 lets a test compare pixel cost (see racing3d perf hooks)
    await c.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: dpr, mobile: false });
  }

  const evalv = async (expression) => {
    const r = await c.send('Runtime.evaluate', { expression, returnByValue: true });
    if (r.exceptionDetails) return { __err: r.exceptionDetails.exception?.description || r.exceptionDetails.text };
    return r.result ? r.result.value : undefined;
  };
  // Same, but for expressions that return a Promise (awaitPromise).
  const evalp = async (expression) => {
    const r = await c.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) return { __err: r.exceptionDetails.exception?.description || r.exceptionDetails.text };
    return r.result ? r.result.value : undefined;
  };
  const navigate = url => c.send('Page.navigate', { url });
  const close = () => { srv.close(); killChromeByTag(profile); };
  // Shut the origin down while keeping the browser alive. After this nothing can
  // come off the wire, so "it still works" proves it came from the app's own cache.
  const closeServer = () => srv.close();

  // --- trusted input -------------------------------------------------------
  // el.click() bypasses hit-testing, so a smoke can pass while a child cannot
  // reach the control (task-120 anti-pattern). Everything below drives real
  // gestures: geometry is proven first, then CDP dispatches a trusted event so
  // capture/drag/touch code paths actually run.
  const boxOf = selector => evalv(`(function(){
    const e = document.querySelector(${JSON.stringify(selector)});
    if (!e) return { ok: false, why: 'element not found' };
    e.scrollIntoView({ block: 'center', inline: 'center' });
    const r = e.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return { ok: false, why: 'element has zero size' };
    if (r.left < 0 || r.top < 0 || r.right > innerWidth || r.bottom > innerHeight)
      return { ok: false, why: 'outside the viewport (' + Math.round(r.left) + ',' + Math.round(r.top) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height) + ')' };
    // Prefer the centre, but a shape can leave its own bounding box empty (an
    // L-shaped SVG region, a donut), so probe a few points before giving up.
    const hits = t => { const p = document.elementFromPoint(t[0], t[1]); return !!p && (p === e || e.contains(p)); };
    const pts = [[.5,.5],[.5,.35],[.5,.65],[.35,.5],[.65,.5],[.35,.35],[.65,.35],[.35,.65],[.65,.65]];
    for (const [fx, fy] of pts) {
      const x = r.left + r.width * fx, y = r.top + r.height * fy;
      if (hits([x, y])) return { ok: true, x: x, y: y, rect: { l: r.left, t: r.top, w: r.width, h: r.height } };
    }
    const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return { ok: false, why: 'covered by ' + (top ? (top.id || top.className || top.tagName) : 'nothing') };
  })()`);

  // A release must carry button:'left' or Chrome drops it — with button:'none'
  // the game's key-up handler never runs and the control stays stuck down.
  const mouse = (type, x, y, buttons) => c.send('Input.dispatchMouseEvent', {
    type, x, y,
    button: type === 'mouseMoved' && !buttons ? 'none' : 'left',
    buttons, clickCount: buttons || type === 'mouseReleased' ? 1 : 0,
  });
  const pressAt = async (x, y) => { await mouse('mouseMoved', x, y, 0); await mouse('mousePressed', x, y, 1); };
  const releaseAt = (x, y) => mouse('mouseReleased', x, y, 0);

  // Tap = verify a child could reach it, then send a real press+release.
  const tap = async selector => {
    const b = await boxOf(selector);
    if (!b.ok) return b;
    await pressAt(b.x, b.y);
    await releaseAt(b.x, b.y);
    return b;
  };
  const drag = async (fromSel, toSel, steps = 12) => {
    const a = await boxOf(fromSel), b = await boxOf(toSel);
    if (!a.ok) return { ok: false, why: 'start ' + a.why };
    if (!b.ok) return { ok: false, why: 'end ' + b.why };
    await dragTo(a.x, a.y, b.x, b.y, steps);
    return { ok: true };
  };
  // Same gesture, but the drop point is a viewport coordinate — for scatter-drag
  // puzzles where the target is a computed cell, not a DOM node.
  const dragTo = async (x1, y1, x2, y2, steps = 14) => {
    await pressAt(x1, y1);
    for (let i = 1; i <= steps; i++) {
      await mouse('mouseMoved', x1 + (x2 - x1) * i / steps, y1 + (y2 - y1) * i / steps, 1);
      await sleep(16);
    }
    await releaseAt(x2, y2);
  };
  // Scribble across an element — a dense zigzag, because one straight line can
  // land under an ink threshold (tracing needs MIN_INK=40 grid cells).
  const stroke = async (selector, steps = 60) => {
    const a = await boxOf(selector);
    if (!a.ok) return a;
    // stay inside the element's own box — deriving points from the viewport
    // origin puts the press on the page background, not the target
    const L = a.rect.l + a.rect.w * 0.08, R = a.rect.l + a.rect.w * 0.92;
    const T = a.rect.t + a.rect.h * 0.08, B = a.rect.t + a.rect.h * 0.92;
    await pressAt(L, (T + B) / 2);
    for (let i = 1; i <= steps; i++) {
      const tri = Math.abs(((i / 6) % 2) - 1);   // triangle wave top↔bottom
      await mouse('mouseMoved', L + (R - L) * (i / steps), T + (B - T) * tri, 1);
      await sleep(8);
    }
    await releaseAt(R, (T + B) / 2);
    return a;
  };
  const press = async selector => {
    const b = await boxOf(selector);
    if (!b.ok) return b;
    await pressAt(b.x, b.y);
    return b;
  };
  const release = async selector => {
    const b = await boxOf(selector);
    if (!b.ok) return b;
    await releaseAt(b.x, b.y);
    return b;
  };
  const hold = async (selector, ms) => {
    const b = await press(selector);
    if (!b.ok) return b;
    await sleep(ms);
    await releaseAt(b.x, b.y);
    return b;
  };
  // Readiness wait: poll a condition unrelated to the assertion. Never a retry
  // on the assertion itself — that would make it vacuous.
  const waitFor = async (expression, { timeout = 8000, interval = 100, label = '' } = {}) => {
    const t0 = Date.now();
    for (;;) {
      let v;
      try { v = await evalv(expression); } catch { v = false; }
      if (v && v !== false && !(typeof v === 'object' && v.__err)) return { ok: true, value: v };
      if (Date.now() - t0 > timeout) return { ok: false, why: 'timed out waiting for ' + (label || expression) };
      await sleep(interval);
    }
  };

  if (page) await navigate(`http://127.0.0.1:${httpPort}${page}`);

  return { c, evalv, evalp, navigate, close, closeServer, port: httpPort, sleep, tap, press, release, hold, drag, dragTo, stroke, boxOf, waitFor };
}

module.exports = { start, serve, check, skip, sleep, getFails: () => fails, getSkips: () => skips };
