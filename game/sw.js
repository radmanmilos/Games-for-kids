// R17: the app version lives in manifest.json only (the single source of truth).
// Pages register this worker as `sw.js?v=<version>` (see shared/navigation.js),
// so the cache name is derived from the registration URL. This must be computed
// at script evaluation every time: a service worker is re-evaluated per event
// and keeps no module state, so a name resolved during `install` would be lost
// on the next wake-up. Bumping the version installs a new worker, names a new
// cache and lets activate() delete the superseded one.
const SW_VERSION = new URL(self.location.href).searchParams.get('v') || '0';
const CACHE_NAME = 'petrin-v' + SW_VERSION;
const APP_ROOT = new URL('./', self.registration.scope);
const CACHE_LIST_URL = new URL('sw-cache-list.json', APP_ROOT);
const OFFLINE_MANIFEST_URL = new URL('offline-manifest.json', APP_ROOT);

function resolveAssets(list) {
  return list.map(entry => new URL(entry, APP_ROOT).href);
}

self.addEventListener('install', event => {
  // try to pre-cache the list; fallback to skip on failure
  event.waitUntil((async () => {
    try {
      const res = await fetch(CACHE_LIST_URL);
      const list = await res.json();
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(resolveAssets(list));
      console.log('SW: initial cache complete', list.length);
    } catch (e) {
      console.warn('SW: initial cache failed', e);
    }
    // activate immediately
    self.skipWaiting();

  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    // claim clients so pages register quickly
    await self.clients.claim();
    // Bumping CACHE_NAME must not orphan the previous copy: on a tablet the
    // old cache is a full offline copy, so it has to actually be deleted.
    const names = await caches.keys();
    const superseded = names.filter(name => name.startsWith('petrin-') && name !== CACHE_NAME);
    await Promise.all(superseded.map(name => caches.delete(name)));
    // Tell every open page that an upgrade (not a first install) took over, so
    // the parent area can surface "Ажурирано" without a manual reload. A first
    // install has no superseded cache, so it stays quiet.
    if (superseded.length > 0) {
      try {
        const clientsArr = await self.clients.matchAll({ includeUncontrolled: true });
        for (const c of clientsArr) {
          try { c.postMessage({ type: 'updated', version: CACHE_NAME }); } catch (_) {}
        }
      } catch (_) {}
    }

  })());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  // only handle GET requests
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Keep the worker limited to this app. In particular, never cache external
  // requests or development-only paths that happen to be loaded by a page.
  if (url.origin !== self.location.origin || !url.pathname.startsWith(APP_ROOT.pathname)) return;
  // Update checks must see the server's current manifest, not the cached copy.
  if (url.href === OFFLINE_MANIFEST_URL.href && req.cache === 'no-store') {
    event.respondWith(fetch(req));
    return;
  }
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(req);
    if (cached) return cached;
    try {
      const net = await fetch(req);
      // update cache for future
      try { await cache.put(req, net.clone()); } catch(_){}
      return net;
    } catch (e) {
      return cached || Response.error();
    }

  })());
});

// message API: { cmd: 'cacheAll' } or { cmd: 'checkForUpdates' }
self.addEventListener('message', event => {
  const data = event.data || {};
  // waitUntil is NOT optional here. A service worker only lives as long as the
  // event that woke it: with no promise passed to waitUntil/respondWith, the
  // browser treats the message event as finished the moment this handler returns
  // and is free to terminate the worker mid-run. On a tablet that is exactly what
  // happened — the worker was shut down partway through cacheAllAssets, so the
  // last cache-progress and the final cache-complete simply never arrived and the
  // parent's «Преузми за офлајн рад» progress bar froze forever, forcing a restart
  // from file 0. Passing the run to waitUntil keeps the worker (and therefore the
  // progress stream) alive until it finishes.
  if (data.cmd === 'cacheAll') {
    event.waitUntil(cacheAllAssets(event.source || event.target));
  }
  if (data.cmd === 'checkForUpdates') {
    event.waitUntil(checkForUpdates(event.source || event.target));
  }
});

async function postToAllClients(msg) {
  const clients = await self.clients.matchAll({ includeUncontrolled: true });
  for (const c of clients) {
    try { c.postMessage(msg); } catch (_) {}
  }
}

// Per-file capped download: timeout + limited retries so a single stuck
// request can never freeze the whole cache-all run (progress keeps moving).
const FETCH_TIMEOUT_MS = 20000;
const FETCH_RETRIES = 2;

async function addWithTimeout(cache, url, timeoutMs = FETCH_TIMEOUT_MS, retries = FETCH_RETRIES) {
  const target = new URL(url, APP_ROOT).href;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(target, { signal: controller.signal });
      clearTimeout(timer);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      await cache.put(target, res);
      return true;
    } catch (e) {
      clearTimeout(timer);
    }
  }
  return false;
}

let cacheInFlight = false;

async function cacheAllAssets(sourceClient) {
  // A cache-all is a long run. Two at once (e.g. a page's stall watchdog
  // re-issuing while a live run is merely slow) would double the work, so only
  // one may be in flight per worker lifetime. Module state is fine for this: a
  // worker that was killed and restarted starts with the flag false — which is
  // exactly the case the watchdog is recovering from, so the resume is not
  // blocked by a stale lock.
  if (cacheInFlight) return;
  cacheInFlight = true;
  try {
    const res = await fetch(CACHE_LIST_URL);
    const list = await res.json();
    const cache = await caches.open(CACHE_NAME);
    const skipped = [];
    let completed = 0;
    for (const url of list) {
      const ok = await addWithTimeout(cache, url);
      if (!ok) skipped.push(url);
      completed++;
      await postToAllClients({ type: 'cache-progress', completed, total: list.length });
    }
    await postToAllClients({ type: 'cache-complete', total: list.length, skipped });
  } catch (e) {
    await postToAllClients({ type: 'cache-error', message: String(e) });
  } finally {
    cacheInFlight = false;
  }
}

async function checkForUpdates(sourceClient) {
  try {
    // Fetch the authoritative offline manifest from the server (no-cache)
    const onlineRes = await fetch(OFFLINE_MANIFEST_URL, { cache: 'no-store' });
    if (!onlineRes.ok) {
      await postToAllClients({ type: 'check-error', message: 'offline-manifest not found on server' });
      return;
    }
    const online = await onlineRes.json();

    // Read the cached manifest if present.
    // This MUST be the same scope-aware URL used for the network fetch above.
    // It used to be the hard-coded '/game/offline-manifest.json', which is wrong
    // for this project's real deployment (GitHub Pages serves docs/ from
    // /Games-for-kids/, so APP_ROOT is https://.../Games-for-kids/ and the cache
    // key is not /game/...). That made cache.match() miss, cachedManifest stayed
    // null, and EVERY file was reported as changed on every update check.
    const cache = await caches.open(CACHE_NAME);
    let cachedManifest = null;
    try {
      const cachedResp = await cache.match(OFFLINE_MANIFEST_URL);
      if (cachedResp) cachedManifest = await cachedResp.json();
    } catch (e) {
      // ignore parse errors
    }

    // Compare the union so removed files are also reported as changes.
    const changed = [];
    const keys = new Set([
      ...Object.keys(online),
      ...(cachedManifest ? Object.keys(cachedManifest) : [])
    ]);
    for (const key of keys) {
      const onlineHash = online[key] ? online[key].sha256 : null;
      const cachedHash = cachedManifest && cachedManifest[key] ? cachedManifest[key].sha256 : null;
      if (onlineHash !== cachedHash) changed.push(key);
    }

    await postToAllClients({ type: 'check-result', changed: changed.length, changes: changed });
  } catch (e) {
    await postToAllClients({ type: 'check-error', message: String(e) });
  }
}
