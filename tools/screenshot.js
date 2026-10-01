/* Capture deterministic visual-regression inputs from the hub and screenshot-enabled apps.
 * Usage: node tools/screenshot.js [--pages hub,animals] [--sizes phone-portrait,desktop] */
const { start } = require('./headless.js');
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { all: registryAll } = require('./registry.js');
const { decodePng } = require('./visual_compare.js');

const CURRENT = path.join(__dirname, 'screenshots', 'current');
const PAGES = { hub: '/index.html' };
for (const app of registryAll()) {
  if (app.screenshot) PAGES[app.id] = app.url;
}

const SIZES = {
  'phone-portrait': { width: 390, height: 844, deviceScaleFactor: 1, mobile: true },
  'phone-landscape': { width: 844, height: 390, deviceScaleFactor: 1, mobile: true },
  'tablet-portrait': { width: 820, height: 1180, deviceScaleFactor: 1, mobile: true },
  'tablet-landscape': { width: 1180, height: 820, deviceScaleFactor: 1, mobile: true },
  desktop: { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false },
};

function selectedArg(name, fallback) {
  const arg = process.argv.find(a => a.startsWith(`--${name}=`));
  return arg ? arg.slice(arg.indexOf('=') + 1).split(',') : fallback;
}

(async () => {
  const pages = selectedArg('pages', Object.keys(PAGES));
  const sizes = selectedArg('sizes', Object.keys(SIZES));
  const unknownPages = pages.filter(page => !PAGES[page]);
  const unknownSizes = sizes.filter(size => !SIZES[size]);
  if (unknownPages.length || unknownSizes.length) {
    throw new Error([
      ...unknownPages.map(page => `Unknown page "${page}"`),
      ...unknownSizes.map(size => `Unknown viewport "${size}"`),
    ].join('; '));
  }
  if (!pages.length || !sizes.length) throw new Error('Select at least one page and viewport');

  fs.rmSync(CURRENT, { recursive: true, force: true });
  fs.mkdirSync(CURRENT, { recursive: true });

  const h = await start({ page: null, tag: 'visual-capture', width: 1280, height: 800 });
  const outputs = [];
  const browser = h.browser;
  try {
    await h.c.send('Page.addScriptToEvaluateOnNewDocument', {
      source: `(() => {
        let seed = 0x13579bdf;
        let clock = 0;
        let nextFrameId = 1;
        let frameCount = 0;
        const frames = new Map();
        Math.random = () => {
          seed = (seed * 1664525 + 1013904223) >>> 0;
          return seed / 4294967296;
        };
        Date.now = () => 1700000000000 + clock;
        Object.defineProperty(performance, 'now', { configurable: true, value: () => clock });
        window.requestAnimationFrame = callback => {
          const id = nextFrameId++;
          frames.set(id, callback);
          return id;
        };
        window.cancelAnimationFrame = id => frames.delete(id);
        window.__visualAdvance = count => {
          for (let i = 0; i < count; i++) {
            clock += 1000 / 60;
            const pending = [...frames.values()];
            frames.clear();
            frameCount++;
            for (const callback of pending) callback(clock);
          }
          return frameCount;
        };
      })();`,
    });

    for (const page of pages) {
      const url = PAGES[page];
      for (const size of sizes) {
        const viewport = SIZES[size];
        await h.navigate(`http://127.0.0.1:${h.port}${url}`);
        const loaded = await h.waitFor(
          `location.pathname === ${JSON.stringify(url)} && document.readyState === 'complete'`,
          { timeout: 15000, label: `${page} to finish loading` },
        );
        if (!loaded.ok) throw new Error(loaded.why);

        await h.c.send('Emulation.setDeviceMetricsOverride', viewport);
        await h.evalp(`document.fonts ? document.fonts.ready.then(() => true) : Promise.resolve(true)`);
        const assetsReady = await h.waitFor(
          `Array.from(document.images).every(image => image.complete)`,
          { timeout: 15000, label: `${page} images to finish loading` },
        );
        if (!assetsReady.ok) throw new Error(assetsReady.why);

        await h.evalv(`(() => {
          if (!document.getElementById('__visual-regression-stability')) {
            const style = document.createElement('style');
            style.id = '__visual-regression-stability';
            style.textContent = '*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}';
            document.head.appendChild(style);
          }
          for (const animation of document.getAnimations()) animation.pause();
          window.scrollTo(0, 0);
          return true;
        })()`);
        await h.sleep(250);
        const frames = await h.evalv('window.__visualAdvance(60)');
        if (frames !== 60) throw new Error(`${page} advanced ${frames} visual frames, expected 60`);

        const result = await h.c.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
        const file = `${page}_${size}.png`;
        const target = path.join(CURRENT, file);
        const bytes = Buffer.from(result.data, 'base64');
        if (bytes.length < 8000) throw new Error(`${file} looks blank (${bytes.length} bytes)`);
        const image = decodePng(bytes);
        const colors = new Set();
        for (let i = 0; i < image.pixels.length && colors.size < 8; i += image.channels) {
          colors.add(`${image.pixels[i]},${image.pixels[i + 1]},${image.pixels[i + 2]}`);
        }
        if (colors.size < 8) throw new Error(`${file} has only ${colors.size} visible colors`);
        const { width, height } = image;
        const expectedWidth = viewport.width * viewport.deviceScaleFactor;
        const expectedHeight = viewport.height * viewport.deviceScaleFactor;
        if (width !== expectedWidth || height !== expectedHeight) {
          throw new Error(`${file} is ${width}x${height}, expected ${expectedWidth}x${expectedHeight}`);
        }
        fs.writeFileSync(target, bytes);
        outputs.push({ file, width, height, bytes: bytes.length });
        console.log(`CAPTURE ${file}  ${width}x${height}  ${Math.round(bytes.length / 1024)}KB`);
      }
    }
  } finally {
    await h.close();
  }
  const commitSha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  fs.writeFileSync(path.join(CURRENT, 'capture-manifest.json'), JSON.stringify({
    schemaVersion: 1,
    commitSha,
    browser,
    generatedAt: new Date().toISOString(),
    pageSet: pages,
    viewports: Object.fromEntries(sizes.map(size => [size, SIZES[size]])),
    screenshots: outputs,
  }, null, 2) + '\n');
  console.log(`\nCaptured ${outputs.length} screenshots into ${CURRENT}`);
})().catch(e => { console.error('screenshot ERROR:', e); process.exit(1); });
