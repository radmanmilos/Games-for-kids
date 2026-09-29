/* Visual regression: capture screenshots of representative pages in multiple sizes.
   Usage: node tools/screenshot.js [--pages hub,animals,...] [--sizes phone,tablet,desktop]
   Saves to tools/screenshots/<page>_<size>.png */
const { start } = require('./headless.js');
const fs = require('fs');
const path = require('path');

const sleep = ms => new Promise(r => setTimeout(r, ms));

const REGISTRY_PATH = path.resolve(__dirname, '..', 'game', 'data', 'app-registry.js');
const registrySrc = fs.existsSync(REGISTRY_PATH) ? fs.readFileSync(REGISTRY_PATH, 'utf8') : 'window.APP_REGISTRY = [];';
const mockWindow = {};
const APP_REGISTRY = new Function('window', registrySrc + '; return window.APP_REGISTRY;')(mockWindow);
const PAGES = { hub: '/index.html' };
for (const app of APP_REGISTRY) { PAGES[app.id] = '/' + app.path; }

const SIZES = {
  phone: { width: 390, height: 844, mobile: true },
  tablet: { width: 820, height: 1180, mobile: true },
  desktop: { width: 1280, height: 800, mobile: false }
};

(async () => {
  const args = process.argv.slice(2);
  const pageArg = args.find(a => a.startsWith('--pages='));
  const sizeArg = args.find(a => a.startsWith('--sizes='));
  const pages = pageArg ? pageArg.split('=')[1].split(',') : Object.keys(PAGES);
  const sizes = sizeArg ? sizeArg.split('=')[1].split(',') : Object.keys(SIZES);

  const outDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const h = await start({ tag: 'screenshot', width: 1280, height: 800 });

  for (const page of pages) {
    const url = PAGES[page];
    if (!url) { console.error(`Unknown page: ${page}`); continue; }

    for (const size of sizes) {
      const opts = SIZES[size];
      if (!opts) { console.error(`Unknown size: ${size}`); continue; }

      await h.c.send('Emulation.setDeviceMetricsOverride', opts);
      await h.navigate(url);
      await sleep(800);

      const result = await h.c.send('Page.captureScreenshot', { format: 'png' });
      const file = path.join(outDir, `${page}_${size}.png`);
      fs.writeFileSync(file, Buffer.from(result.data, 'base64'));
      console.log(`  ${page}_${size}.png`);
    }
  }

  h.close();
  console.log(`\nScreenshots saved to ${outDir}`);
})().catch(e => { console.error('screenshot crashed:', e); process.exit(1); });
