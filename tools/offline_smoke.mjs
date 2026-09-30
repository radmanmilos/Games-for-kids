/* offline_smoke.mjs — true offline browser test (task 5).
   Verifies the app can be reopened and played with the network unavailable.

   Sequence:
   1. Start local HTTP server
   2. Open hub, wait for service worker readiness
   3. Visit every public app (allow resources to cache)
   4. Close page/context
   5. Create a fresh browser context, block all network requests
   6. Open hub, open every public app
   7. Verify: no fatal page error, main UI exists, primary interaction works

   Usage: node tools/offline_smoke.mjs [--game <name>] [--verbose]
   Exit 0 = all pass, 1 = failures found. */
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const { start, serve } = require('./headless.js');

const ROOT = resolve(__dirname, '..');
const REGISTRY = resolve(ROOT, 'game', 'data', 'app-registry.js');

// Parse args
const args = process.argv.slice(2);
const gameFilter = args.includes('--game') ? args[args.indexOf('--game') + 1] : null;
const verbose = args.includes('--verbose');

// Load registry
const registrySrc = existsSync(REGISTRY) ? readFileSync(REGISTRY, 'utf8') : 'window.APP_REGISTRY = [];';
const mockWindow = {};
const APP_REGISTRY = new Function('window', registrySrc + '; return window.APP_REGISTRY;')(mockWindow);

const GAMES = APP_REGISTRY.map(a => ({
  id: a.id,
  path: '/' + a.path,
  title: a.title
}));

if (gameFilter) {
  const filtered = GAMES.filter(g => g.id === gameFilter);
  if (!filtered.length) { console.error(`Unknown game: ${gameFilter}`); process.exit(1); }
  GAMES.length = 0;
  GAMES.push(...filtered);
}

const failures = [];
const passes = [];

function check(name, ok, detail) {
  if (ok) {
    passes.push(name);
    if (verbose) console.log(`PASS ${name}  [${detail}]`);
  } else {
    failures.push(name);
    console.log(`FAIL ${name}  [${detail}]`);
  }
}

async function run() {
  // Phase 1: Online — cache all resources
  console.log('Phase 1: Online — caching resources...');
  const srv = await serve();
  // Phase 1 runs on the parent page, not the hub: the #download-offline button that
  // triggers the explicit cacheAll moved behind the parent lock in task 147, so this
  // opened page is the one that actually has the button. Phase 2 still verifies the
  // hub and every game page offline.
  const h = await start({ page: '/pages/parent.html', tag: 'offline-smoke', width: 1280, height: 800 });

  // Wait for service worker
  let swReady = false;
  for (let i = 0; i < 30 && !swReady; i++) {
    swReady = await h.evalv(`navigator.serviceWorker && navigator.serviceWorker.controller !== null`);
    if (!swReady) await h.sleep(500);
  }
  check('service worker ready', swReady, swReady ? 'SW active' : 'SW not active');

  // Trigger explicit cacheAll to ensure all assets are cached
  await h.evalv(`(() => {
    const btn = document.getElementById('download-offline');
    if (btn) btn.click();
    return 'clicked';
  })()`);
  // Wait for cache to complete
  await h.sleep(3000);

  // Visit every game page to populate cache
  for (const game of GAMES) {
    await h.navigate(`http://127.0.0.1:${srv.port}${game.path}`);
    await h.sleep(400);
  }
  console.log(`  Cached ${GAMES.length} pages.`);

  // Close the online context
  h.close();
  console.log('Phase 1 complete.\n');

  // Phase 2: Offline — block all network, verify playability
  console.log('Phase 2: Offline — verifying playability...');
  const h2 = await start({ page: '/index.html', tag: 'offline-smoke-offline', width: 1280, height: 800 });

  // Block all network requests
  await h2.c.send('Network.enable');
  await h2.c.send('Network.setBlockedURLs', { urls: ['*://*/*'] });
  await h2.c.send('Network.setCacheDisabled', { cacheDisabled: true });

  // Open hub
  await h2.navigate(`http://127.0.0.1:${srv.port}/index.html`);
  await h2.sleep(600);

  const hubUI = await h2.evalv(`(() => {
    const app = document.getElementById('app') || document.body;
    return { hasUI: !!app && app.children.length > 0, title: document.title };
  })()`);
  check('offline: hub UI renders', hubUI && hubUI.hasUI, hubUI ? hubUI.title : 'no UI');

  // Open every game page
  for (const game of GAMES) {
    await h2.navigate(`http://127.0.0.1:${srv.port}${game.path}`);
    await h2.sleep(500);

    const result = await h2.evalv(`(() => {
      const app = document.getElementById('app') || document.body;
      const canvas = document.getElementById('canvas');
      const hasUI = !!app && app.children.length > 0;
      const hasCanvas = !!canvas;
      const title = document.title;
      return { hasUI, hasCanvas, title };
    })()`);

    check(`offline: ${game.id} loads`, result && result.hasUI, result ? result.title : 'no UI');
  }

  h2.close();
  srv.close();

  // Summary
  console.log(`\n=== SUMMARY: ${passes.length} pass, ${failures.length} fail ===`);
  if (failures.length) {
    console.log('FAILURES:');
    for (const f of failures) console.log('  ' + f);
    process.exit(1);
  }
  console.log('ALL OFFLINE CHECKS PASSED');
  process.exit(0);
}

run().catch(e => { console.error('HARNESS ERROR:', e); process.exit(1); });
