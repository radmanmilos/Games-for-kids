/* tools/sw_update_smoke.js — R3 (task 154): service-worker update-path correctness.
 *
 * The bug this guards: sw.js fetched the offline manifest from the network using a
 * scope-derived URL, but read it back out of the Cache Storage with the hard-coded
 * '/game/offline-manifest.json'. This project is served by GitHub Pages from
 * docs/, i.e. from a SUBPATH (https://<host>/Games-for-kids/), so the cache key is
 * never /game/... The lookup missed, `cachedManifest` stayed null, and EVERY file
 * was reported as changed on every single update check.
 *
 * Everything here is served under a deliberate subpath ('/some/deep/prefix/') so
 * the test would fail immediately if any deployment-path assumption crept back in.
 *
 * Usage:  node tools/sw_update_smoke.js
 * Exit 0 = all pass, 1 = failures.
 */
const http = require('http');
const path = require('path');
const fs = require('fs');
const { start, check, getFails, sleep } = require('./headless.js');

const GAME = path.resolve(__dirname, '..', 'game');
/* Deliberately NOT '/' — this is the whole point of the test. */
const PREFIX = '/some/deep/prefix';

let fails = 0;
const t = (name, ok, info) => { check(name, ok, info); if (!ok) fails++; };

/* Minimal server over game/ mounted at PREFIX. `mutate` lets a test change the
   served manifest between the two checkForUpdates calls. */
function serveWith(manifestBody) {
  return new Promise(resolve => {
    const server = http.createServer((req, res) => {
      const url = req.url.split('?')[0];
      if (!url.startsWith(PREFIX + '/')) { res.writeHead(404); res.end(); return; }
      let rel = url.slice(PREFIX.length + 1);
      if (rel === 'offline-manifest.json') {
        const body = typeof manifestBody === 'function' ? manifestBody() : manifestBody;
        res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
        res.end(body);
        return;
      }
      const abs = path.join(GAME, rel);
      if (!fs.existsSync(abs) || fs.statSync(abs).isDirectory()) { res.writeHead(404); res.end(); return; }
      const ext = path.extname(abs);
      const mime = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
                     '.css': 'text/css', '.json': 'application/json', '.png': 'image/png',
                     '.svg': 'image/svg+xml', '.ogg': 'audio/ogg', '.mp3': 'audio/mpeg' }[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': mime });
      res.end(fs.readFileSync(abs));
    });
    server.listen(0, () => resolve({ server, port: server.address().port }));
  });
}

/* Ask the service worker to diff, and wait for its reply. */
async function askCheckUpdates(h, timeoutMs = 12000) {
  return h.evalp(`(async () => {
    const reg = await navigator.serviceWorker.ready;
    const sw = reg.active || navigator.serviceWorker.controller;
    if (!sw) return JSON.stringify({ error: 'no active service worker' });
    return await new Promise(resolve => {
      const timer = setTimeout(() => resolve(JSON.stringify({ error: 'timeout waiting for check-result' })), ${timeoutMs - 500});
      const onMsg = ev => {
        const m = ev.data || {};
        if (m.type === 'check-result' || m.type === 'check-error') {
          clearTimeout(timer);
          navigator.serviceWorker.removeEventListener('message', onMsg);
          resolve(JSON.stringify(m));
        }
      };
      navigator.serviceWorker.addEventListener('message', onMsg);
      sw.postMessage({ cmd: 'checkForUpdates' });
    });
  })()`);
}

const mkManifest = entries => JSON.stringify(
  Object.fromEntries(entries.map(([k, v]) => [k, { sha256: v, size: 1 }])), null, 2);

(async () => {
  // --- Version A: the app is served, SW registers and caches the manifest ---
  const manifestA = mkManifest([
    ['index.html', 'aaa1'], ['pages/animal_counting.html', 'aaa2'],
    ['shared/main.js', 'aaa3'], ['docs/OFFLINE_INSTALL.md', 'aaa4'],
  ]);
  let current = manifestA;
  const { server, port } = await serveWith(() => current);
  const base = `http://127.0.0.1:${port}${PREFIX}`;
  console.log(`serving game/ at ${base} (deliberate subpath)`);

  const h = await start({ page: null, tag: 'sw-update-smoke', width: 1100, height: 700 });
  // start() serves its own origin; this test uses the dedicated subpath server.
  await h.navigate(base + '/index.html');

  // wait for the SW to control the page
  let controlled = false;
  for (let i = 0; i < 40 && !controlled; i++) {
    controlled = await h.evalv(`!!navigator.serviceWorker.controller`);
    if (!controlled) await sleep(250);
  }
  t('service worker registers and controls the page under a subpath', controlled === true, 'controller=' + controlled);

  const scope = await h.evalv(`navigator.serviceWorker.controller ? navigator.serviceWorker.controller.scriptURL : ''`);
  t('worker scope follows the subpath, not the domain root',
    String(scope).includes(PREFIX), 'scriptURL=' + scope);

  // Explicit cacheAll so the manifest is definitely in the cache.
  await h.evalv(`(async () => { const r = await navigator.serviceWorker.ready; r.active.postMessage({ cmd: 'cacheAll' }); return true; })()`);
  await sleep(2500);

  const cached = await h.evalp(`(async () => {
    const names = await caches.keys();
    const c = await caches.open(names[0]);
    const keys = await c.keys();
    return JSON.stringify({ cache: names[0], total: keys.length,
      manifestCached: keys.some(k => k.url.endsWith('/offline-manifest.json')) });
  })()`);
  const C = JSON.parse(cached);
  t('offline manifest is present in the cache under its scope-relative URL',
    C.manifestCached === true, C.cache + ' holds ' + C.total + ' entries');

  // --- No change on the server => changed must be 0 (this is the regression) ---
  const r1 = JSON.parse(await askCheckUpdates(h));
  t('no server change => checkForUpdates reports 0 changes',
    r1 && r1.changed === 0 && Array.isArray(r1.changes) && r1.changes.length === 0,
    JSON.stringify(r1).slice(0, 300));

  // --- A file changes on the server => changed > 0, and names the right file ---
  current = mkManifest([
    ['index.html', 'aaa1'], ['pages/animal_counting.html', 'CHANGED'],
    ['shared/main.js', 'aaa3'], ['docs/OFFLINE_INSTALL.md', 'aaa4'],
  ]);
  const r2 = JSON.parse(await askCheckUpdates(h));
  t('a changed file is detected', r2 && r2.changed === 1, JSON.stringify(r2).slice(0, 300));
  t('the changed file is named in the result',
    r2 && Array.isArray(r2.changes) && r2.changes[0] === 'pages/animal_counting.html',
    JSON.stringify(r2 && r2.changes));

  // --- A file is REMOVED server-side => still reported (union diff) ---
  current = mkManifest([
    ['index.html', 'aaa1'], ['shared/main.js', 'aaa3'],
  ]);
  const r3 = JSON.parse(await askCheckUpdates(h));
  t('a removed file is reported as a change',
    r3 && Array.isArray(r3.changes) && r3.changes.includes('pages/animal_counting.html'),
    JSON.stringify(r3 && r3.changes));

  // --- And a clean rollback to "identical to cache" reports 0 again ---
  // (restore the server manifest, refresh the cached copy, expect silence)
  current = manifestA;
  await h.evalv(`(async () => { const r = await navigator.serviceWorker.ready; r.active.postMessage({ cmd: 'cacheAll' }); return true; })()`);
  await sleep(2500);
  const r4 = JSON.parse(await askCheckUpdates(h));
  t('after re-caching an identical manifest, updates report 0 changes again',
    r4 && r4.changed === 0, JSON.stringify(r4).slice(0, 200));

  await h.close();
  server.close();

  console.log(fails ? `\n${fails} FAIL` : '\nALL SERVICE-WORKER UPDATE CHECKS PASSED');
  process.exit(fails || getFails() ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
