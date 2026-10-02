/* Shared headless-Chrome harness for the Petrin svet project (dev only).
   Serves game/ over HTTP (file:// breaks audio and throws
   Unsafe-attempt warnings), boots headless Chrome on a UNIQUE temp profile, and
   exposes an evalv / navigate / close API. No deps: Node >= 22 (global fetch +
   WebSocket). Usage from a tools/*.js script:

     const { start, check } = require('./headless.js');
     const h = await start({ page: '/pages/tracing.html', tag: 'tracing-smoke', width: 1280, height: 800 });
     await h.evalv('...expression...');
     check('name', condition, info);
     await h.close();                // checks browser errors, stops server + kills Chrome
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

/* How long to wait for Chrome to expose its debugging port.
   This is deliberately generous. These smokes run 4-way parallel on a
   constrained host (and in CI), where a cold Chrome can take several seconds to
   answer /json/version. Running out of patience produces a smoke that exits
   non-zero with ZERO checks, which in the summary is indistinguishable from a
   real failure - the shape that made tools/touch_interruption_b_smoke.js fail
   intermittently in R7 while every one of its assertions was fine. */
const BOOT_ATTEMPTS = 4;
const BOOT_POLL_TRIES = 30;
const BOOT_POLL_MS = 200;
const BOOT_RETRY_PAUSE_MS = 500;

/* The DevTools handshake and every CDP command are bounded too, and this is not
   defensive decoration - it fixes a hang that CI actually hit. `cdp()` resolved
   only on `ws.onopen`, with no `onerror`, no `onclose` and no timeout, and
   `send()` returned a promise that only settled from a message id which may
   never arrive. A refused or lost DevTools connection therefore hung the whole
   smoke forever: `ocean_smoke.js` on CI run 25 printed *nothing* for the whole
   10-minute step timeout and was then reported as "Terminate orphan process:
   node", with no assertion and no diagnostic anywhere. A harness that cannot
   fail loudly is the same defect as a check that cannot fail. */
const CDP_CONNECT_TIMEOUT_MS = 15000;
const CDP_COMMAND_TIMEOUT_MS = 30000;
/* Runtime.evaluate gets a longer budget than the control-plane commands.
   It is the only method whose cost scales with how fast the *page* draws: a
   `Runtime.evaluate` has to be scheduled on the main thread, which the render
   loop is holding for a whole frame. Measured on the software-WebGL CI runner
   (no GPU, frames measured at 113ms, worst 183ms), a trivial 12-step racing3d
   batch exceeded the flat 30s bound and aborted the smoke with
   `CDP Runtime.evaluate (id 61) got no response within 30000ms` after 23 passing
   checks -- a slow page misreported as a broken harness. Keeping the two apart
   means the tight bound still guards navigation/attach (where a real wedge
   lives, and where the connect fix above applies) while page evaluation is
   allowed the time a slow page legitimately needs. */
const CDP_EVALUATE_TIMEOUT_MS = 90000;

/* One /json/version request must not be able to outlive the poll budget it is
   counted against, or the "~Ns of waiting" in the boot error is a lie. */
const BOOT_REQUEST_TIMEOUT_MS = 2000;

/* Teardown bounds for close(): how long to wait for Chrome to stop answering its
   debug port before moving on. Cheap insurance - in the normal case the first
   poll already finds the port closed. */
const TEARDOWN_TRIES = 20;
const TEARDOWN_POLL_MS = 50;

/* Ask the OS for an unused TCP port.

   This used to be `httpPort + 100 + Math.random()*1000`, which is wrong on
   Windows: ephemeral ports sit around 52290-57760, and Hyper-V/WinNAT reserves
   dozens of ~100-port blocks inside that span (`netsh interface ipv4 show
   excludedportrange protocol=tcp` listed 52240-52339, 53865-53964, 55973-56072,
   56473-56572 and more). Chrome then cannot bind its --remote-debugging-port at
   all, so it never publishes /json/version and the smoke dies with
   "Chrome did not start" and ZERO checks run. That is exactly how
   tools/touch_interruption_b_smoke.js failed intermittently in R7 while all its
   assertions passed, and why lengthening the boot timeout could not fix it.

   listen(0) hands back a port the OS has just confirmed is free, which is
   exactly the guarantee we need. */
async function freePort() {
  return new Promise((resolve, reject) => {
    const s = require('net').createServer();
    s.once('error', reject);
    s.listen(0, '127.0.0.1', () => {
      const { port } = s.address();
      s.close(() => resolve(port));
    });
  });
}

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
  const listeners = new Map();
  const ws = new WebSocket(wsUrl);
  return new Promise((resolve, reject) => {
    /* The socket can die before it opens, or at any point afterwards. Either way
       every command still in flight will now never be answered, so they are all
       failed here rather than left pending forever. */
    const fail = (why) => {
      for (const [, p] of pending) p.rej(new Error(why));
      pending.clear();
      try { ws.close(); } catch { /* already gone */ }
      reject(new Error(why));
    };
    const connectTimer = setTimeout(
      () => fail(`CDP websocket did not open within ${CDP_CONNECT_TIMEOUT_MS}ms (${wsUrl})`),
      CDP_CONNECT_TIMEOUT_MS);
    ws.onopen = () => {
      clearTimeout(connectTimer);
      resolve({
        on(method, handler) {
          if (!listeners.has(method)) listeners.set(method, new Set());
          listeners.get(method).add(handler);
        },
        send(method, params = {}, sessionId) {
          return new Promise((res, rej) => {
            const mid = ++id;
            const budget = method === 'Runtime.evaluate' ? CDP_EVALUATE_TIMEOUT_MS : CDP_COMMAND_TIMEOUT_MS;
            const timer = setTimeout(() => {
              pending.delete(mid);
              rej(new Error(`CDP ${method} (id ${mid}) got no response within ${budget}ms`));
            }, budget);
            pending.set(mid, { res, rej });
            try {
              ws.send(JSON.stringify({ id: mid, method, params, ...(sessionId ? { sessionId } : {}) }));
            } catch (e) {
              clearTimeout(timer);
              pending.delete(mid);
              rej(e);
            }
          });
        },
      });
    };
    ws.onerror = (ev) => {
      clearTimeout(connectTimer);
      fail(`CDP websocket error: ${(ev && ev.message) || 'connection failed'} (${wsUrl})`);
    };
    ws.onclose = () => {
      clearTimeout(connectTimer);
      fail(`CDP websocket closed unexpectedly (${wsUrl})`);
    };
    ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && pending.has(msg.id)) { pending.get(msg.id).res(msg.result); pending.delete(msg.id); }
      if (msg.method && listeners.has(msg.method)) {
        for (const handler of listeners.get(msg.method)) handler(msg.params, msg.sessionId);
      }
    };
  });
}

/* Serve game/ over HTTP on an ephemeral port. file:// breaks audio and throws
   Unsafe-attempt warnings, so EVERY harness (including the
   Playwright/a11y tools) must go through this. Returns { port, close }. */
async function serve() {
  const sockets = new Set();
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
  // Keep-alive sockets outlive server.close(), which only stops NEW connections.
  // offline_smoke's negative control needs the origin to be physically gone, and
  // Chrome holds a warm socket - without tracking and destroying them the control
  // silently passed whenever that socket happened to be dead, and failed when it
  // was alive. A control that is sometimes right proves nothing.
  server.on('connection', s => { sockets.add(s); s.on('close', () => sockets.delete(s)); });
  await new Promise(r => server.listen(0, r));
  return {
    port: server.address().port,
    close: () => {
      server.close();
      for (const s of sockets) s.destroy();
      sockets.clear();
    },
  };
}

async function start({
  page, tag = 'pkv', width = 1280, height = 800, dpr = 1,
  ignoreResourceErrors = [],
} = {}) {
  const srv = await serve();
  const httpPort = srv.port;

  const profile = path.join(TMP, 'pkv-' + tag + '-' + Date.now() + '-' + Math.floor(Math.random() * 1e6));
  const dbgPort = await freePort();

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
    /* /dev/shm is 64 MB on a GitHub runner, which is not enough for a Chrome
       that is also serving a game page headlessly. Exhausting it kills the
       renderer, and the symptom is exactly what CI showed: the debug port never
       answered, and Chrome printed nothing at all. */
    '--disable-dev-shm-usage',
    /* Chrome >= 111 rejects a DevTools websocket that carries an Origin header
       unless the browser is started with this. We launch Chrome ourselves on
       loopback and speak CDP to it, so there is nothing to protect here. */
    '--remote-allow-origins=*',
    '--no-sandbox', '--mute-audio', 'about:blank',
  ];
  /* Retry Chrome's boot properly. The old loop tried twice and polled 20x100ms =
   * 2s per attempt, which on a loaded host (4 shards booting at once) was often
   * not enough - the smoke then died with "Chrome did not start" and ZERO checks
   * ran, so a run reported fail=0 and exited non-zero. That is a crash, not a
   * failed assertion, and it recurred on tools/touch_interruption_b_smoke.js in
   * R7 until the shards stopped dying. Widening the wait and the retry count is
   * the honest fix: nothing is being asserted less often, the browser just gets
   * longer to show up.
   *
   * The loop now covers the DevTools handshake as well, not just /json/version.
   * It used to stop at "the port answers", so a refused websocket left the smoke
   * with nothing to retry - and with no timeout either, it simply hung (see
   * CDP_CONNECT_TIMEOUT_MS). Both phases now end in a bounded error, so a bad
   * environment produces a named failure in ~1 minute instead of a silent
   * 10-minute step timeout. */
  let session = null;
  let lastBootError = '';
  for (let attempt = 0; attempt < BOOT_ATTEMPTS && !session; attempt++) {
    if (attempt) await sleep(BOOT_RETRY_PAUSE_MS);
    execFile(chromeBin, CHROME_FLAGS);

    let version = null;
    for (let i = 0; i < BOOT_POLL_TRIES && !version; i++) {
      try {
        version = await (await fetch(`http://127.0.0.1:${dbgPort}/json/version`,
          { signal: AbortSignal.timeout(BOOT_REQUEST_TIMEOUT_MS) })).json();
      } catch { await sleep(BOOT_POLL_MS); }
    }

    if (version) {
      try {
        const dbg = await cdp(version.webSocketDebuggerUrl);
        const target = await dbg.send('Target.createTarget', { url: 'about:blank' });
        const { sessionId } = await dbg.send('Target.attachToTarget', { targetId: target.targetId, flatten: true });
        session = { dbg, sessionId, version };
      } catch (e) {
        lastBootError = String((e && e.message) || e);
        session = null;
      }
    }
    if (!session) killChromeByTag(profile);
  }
  if (!session) {
    srv.close();
    const waited = Math.round(BOOT_ATTEMPTS * BOOT_POLL_TRIES * (BOOT_POLL_MS + BOOT_REQUEST_TIMEOUT_MS) / 1000);
    const msg = 'Chrome did not start (debug port ' + dbgPort + ') after ' +
      BOOT_ATTEMPTS + ' attempts (~' + waited + 's of waiting)' +
      (lastBootError ? ' — last handshake error: ' + lastBootError : '') +
      ' — no assertions ran';
    throw new Error(msg);
  }

  const { dbg, sessionId } = session;
  const c = { send: (m, p) => dbg.send(m, p, sessionId), on: (m, fn) => dbg.on(m, fn) };
  await c.send('Page.enable');
  await c.send('Runtime.enable');
  await c.send('Network.enable');

  const runtimeErrors = [];
  const requestUrls = new Map();
  const localOrigin = `http://127.0.0.1:${httpPort}/`;
  const addRuntimeError = (kind, detail, source = '') => {
    if (/^(chrome-extension|devtools):\/\//i.test(source)) return;
    runtimeErrors.push({ kind, detail: String(detail || '(no details)'), source });
  };
  c.on('Runtime.exceptionThrown', ({ exceptionDetails = {} }) => {
    addRuntimeError(
      'exception',
      exceptionDetails.exception?.description || exceptionDetails.text,
      exceptionDetails.url || '',
    );
  });
  c.on('Runtime.consoleAPICalled', ({ type, args = [], stackTrace }) => {
    const detail = args.map(a => a.value ?? a.description ?? '').filter(Boolean).join(' ');
    const serviceWorkerWarning = type === 'warning'
      && /(?:service.?worker.*(?:register|registration|install)|SW register failed)/i.test(detail);
    if (type !== 'error' && !serviceWorkerWarning) return;
    const source = stackTrace?.callFrames?.[0]?.url || '';
    addRuntimeError(serviceWorkerWarning ? 'service-worker' : 'console.error',
      detail || 'console.error called', source);
  });
  c.on('Network.requestWillBeSent', ({ requestId, request, type }) => {
    requestUrls.set(requestId, { url: request.url, type });
  });
  c.on('Network.responseReceived', ({ requestId, response, type }) => {
    const url = response.url || requestUrls.get(requestId)?.url || '';
    if (response.status >= 400) {
      addResourceError(url, `${response.status} ${response.statusText || ''}`.trim(), type);
    }
  });
  c.on('Network.loadingFailed', ({ requestId, errorText, canceled, type }) => {
    const request = requestUrls.get(requestId);
    if (request && !canceled && errorText !== 'net::ERR_ABORTED') {
      addResourceError(request.url, errorText, type || request.type);
    }
    requestUrls.delete(requestId);
  });
  function addResourceError(url, detail, type) {
    if (!url.startsWith(localOrigin) || /\/favicon\.ico(?:[?#]|$)/i.test(url)) return;
    if (ignoreResourceErrors.some(part => url.includes(part))) return;
    if (!['Document', 'Script', 'Stylesheet', 'Image', 'Font', 'Media', 'XHR', 'Fetch'].includes(type)) return;
    addRuntimeError('resource', `${type || 'resource'} ${detail}`, url);
  }
  await c.send('Runtime.addBinding', { name: '__psReportUnhandledRejection' });
  await c.send('Page.addScriptToEvaluateOnNewDocument', {
    source: `window.addEventListener('unhandledrejection', event => {
      const reason = event.reason;
      const detail = reason && (reason.stack || reason.message) || String(reason);
      window.__psReportUnhandledRejection(detail);
    });`,
  });
  c.on('Runtime.bindingCalled', ({ name, payload, executionContextId }) => {
    if (name !== '__psReportUnhandledRejection') return;
    addRuntimeError('unhandledrejection', payload, String(executionContextId));
  });
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
  const checkRuntimeErrors = async () => {
    await sleep(50);
    const details = runtimeErrors.slice(0, 3)
      .map(e => `${e.kind}: ${e.detail}${e.source ? ` (${e.source})` : ''}`)
      .join('; ');
    check('no browser runtime errors', runtimeErrors.length === 0,
      runtimeErrors.length ? `${runtimeErrors.length} captured: ${details}` : 'none');
    return runtimeErrors.length === 0;
  };
  /* Tear down for real. killChromeByTag() is a request, not a guarantee: Chrome
     keeps its debug port answering for a moment afterwards. A shard that runs
     several games in one process (tools/touch_interruption_{a..d}_smoke.js) then
     calls start() again immediately, and the new instance loses the race - which
     is why touch_interruption_b_smoke.js intermittently exited with
     "Chrome did not start" while every one of its assertions had passed. So we
     wait for the port to go quiet, bounded, and clean up the profile dir we
     created (it is ~20MB and would otherwise pile up in %TEMP% forever). */
  const close = async ({ checkErrors = true } = {}) => {
    if (checkErrors) await checkRuntimeErrors();
    srv.close();
    killChromeByTag(profile);
    for (let i = 0; i < TEARDOWN_TRIES; i++) {
      let alive = false;
      try { await fetch(`http://127.0.0.1:${dbgPort}/json/version`, { signal: AbortSignal.timeout(BOOT_REQUEST_TIMEOUT_MS) }); alive = true; } catch { /* gone */ }
      if (!alive) break;
      await sleep(TEARDOWN_POLL_MS);
    }
    try { fs.rmSync(profile, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 }); }
    catch { /* still locked; %TEMP% cleanup is not the smoke's job */ }
  };
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

  return {
    c, evalv, evalp, navigate, close, closeServer, port: httpPort, sleep,
    tap, press, release, hold, drag, dragTo, stroke, boxOf, waitFor,
    browser: {
      product: session.version.Browser || '',
      userAgent: session.version['User-Agent'] || '',
      protocolVersion: session.version['Protocol-Version'] || '',
    },
    getRuntimeErrors: () => runtimeErrors.slice(),
    checkRuntimeErrors,
  };
}

module.exports = { start, serve, check, skip, sleep, getFails: () => fails, getSkips: () => skips };
