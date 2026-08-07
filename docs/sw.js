const CACHE_NAME = 'petrin-v2';
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
  if (data.cmd === 'cacheAll') {
    cacheAllAssets(event.source || event.target);
  }
  if (data.cmd === 'checkForUpdates') {
    checkForUpdates(event.source || event.target);
  }
});

async function postToAllClients(msg) {
  const clients = await self.clients.matchAll({ includeUncontrolled: true });
  for (const c of clients) {
    try { c.postMessage(msg); } catch (_) {}
  }
}

async function cacheAllAssets(sourceClient) {
  try {
    const res = await fetch(CACHE_LIST_URL);
    const list = await res.json();
    const cache = await caches.open(CACHE_NAME);
    let completed = 0;
    for (const url of list) {
      try {
        await cache.add(url);
      } catch (e) {
        // ignore individual failures
      }
      completed++;
      await postToAllClients({ type: 'cache-progress', completed, total: list.length });
    }
    await postToAllClients({ type: 'cache-complete', total: list.length });
  } catch (e) {
    await postToAllClients({ type: 'cache-error', message: String(e) });
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

    // Read the cached manifest if present
    const cache = await caches.open(CACHE_NAME);
    let cachedManifest = null;
    try {
      const cachedResp = await cache.match('/game/offline-manifest.json');
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
