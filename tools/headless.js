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
     - CHROME_PATH env overrides the Chrome binary.
*/
const { execFile, execFileSync } = require('child_process');
const path = require('path');
const http = require('http');
const fs = require('fs');

const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const ROOT = path.resolve(__dirname, '..', 'game');

function findChrome() {
  if (fs.existsSync(CHROME)) return CHROME;
  const candidates = [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    path.join(process.env.LOCALAPPDATA || '', 'Google/Chrome/Application/chrome.exe'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.svg': 'image/svg+xml', '.ogg': 'audio/ogg', '.mp3': 'audio/mpeg',
  '.woff2': 'font/woff2', '.png': 'image/png',
};

const sleep = ms => new Promise(r => setTimeout(r, ms));

let fails = 0;
function check(name, ok, info) {
  console.log((ok ? 'PASS ' : 'FAIL ') + name + (info ? '  [' + info + ']' : ''));
  if (!ok) fails++;
}

/* Kill Chrome processes whose command line contains `tag` (e.g. a profile path). */
function killChromeByTag(tag) {
  try {
    execFileSync('pwsh', ['-NoProfile', '-Command',
      `Get-Process chrome -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -match [regex]::Escape('${tag}') } | Stop-Process -Force -ErrorAction SilentlyContinue`]);
  } catch (e) { /* pwsh not available or nothing to kill — fine */ }
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

async function start({ page, tag = 'pkv', width = 1280, height = 800 } = {}) {
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
  const httpPort = server.address().port;

  const profile = path.join(process.env.TEMP, 'pkv-' + tag + '-' + Date.now() + '-' + Math.floor(Math.random() * 1e6));
  const dbgPort = httpPort + 100 + Math.floor(Math.random() * 1000);

  const chromeBin = findChrome();
  if (!chromeBin) {
    server.close();
    throw new Error('Chrome not found. Install Chrome or set CHROME_PATH, then re-run this smoke.');
  }

  let version = null;
  for (let attempt = 0; attempt < 2 && !version; attempt++) {
    execFile(chromeBin, ['--headless=new', '--disable-gpu', `--remote-debugging-port=${dbgPort}`,
      '--user-data-dir=' + profile, '--no-first-run', '--mute-audio', 'about:blank']);
    for (let i = 0; i < 8 && !version; i++) {
      try { version = await (await fetch(`http://127.0.0.1:${dbgPort}/json/version`)).json(); }
      catch { await sleep(250); }
    }
    if (!version) { killChromeByTag(profile); await sleep(250); }
  }
  if (!version) {
    server.close();
    throw new Error('Chrome did not start (debug port ' + dbgPort + ') — skipped in this environment');
  }

  const dbg = await cdp(version.webSocketDebuggerUrl);
  const target = await dbg.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await dbg.send('Target.attachToTarget', { targetId: target.targetId, flatten: true });
  const c = { send: (m, p) => dbg.send(m, p, sessionId) };
  await c.send('Page.enable');
  await c.send('Runtime.enable');
  if (width && height) {
    await c.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
  }

  const evalv = async (expression) => {
    const r = await c.send('Runtime.evaluate', { expression, returnByValue: true });
    if (r.exceptionDetails) return { __err: r.exceptionDetails.exception?.description || r.exceptionDetails.text };
    return r.result ? r.result.value : undefined;
  };
  const navigate = url => c.send('Page.navigate', { url });
  const close = () => { server.close(); killChromeByTag(profile); };

  if (page) await navigate(`http://127.0.0.1:${httpPort}${page}`);

  return { c, evalv, navigate, close, port: httpPort, sleep };
}

module.exports = { start, check, sleep, getFails: () => fails };
