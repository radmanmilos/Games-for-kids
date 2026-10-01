/* play_matrix.mjs — Playwright device-matrix gate (task 172).
   Loads each page in a spread of phone / tablet / desktop viewports on every
   installed Playwright engine (chromium + webkit) and reports, per cell:
     - no uncaught page errors and no console errors
     - no horizontal overflow (document.scrollWidth <= innerWidth + 1)
     - touch input delivery on touch viewports
     - expected orientation and visible, unobstructed controls
   Missing browser engines count as skipped cells and make the run incomplete.

   No package.json in this repo, so Playwright is resolved from the npx cache
   that the Playwright MCP already populated. Override with PLAYWRIGHT_MODULE=
   <abs path to the playwright package dir> if it lives elsewhere.

   Usage:
     node tools/play_matrix.mjs                       # all engines, all pages
     node tools/play_matrix.mjs tracing coloring      # only those pages
     node tools/play_matrix.mjs --engine webkit       # one engine
     node tools/play_matrix.mjs --page /index.html    # one page (repeatable)
     node tools/play_matrix.mjs --list                # print the matrix and exit

   Engine install (once):  npx playwright install webkit chromium
   WebKit is the value here: it is the engine iOS/Safari actually uses, so it is
   the only way to catch Safari-only layout/CSS breakage locally.
 */
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { serve } = require('./headless.js');
const { all: registryAll } = require('./registry.js');

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');

/* ---- device matrix ---- */
const DEVICES = [
  { name: 'phone-portrait', width: 390, height: 844, touch: true },
  { name: 'phone-landscape', width: 844, height: 390, touch: true },
  { name: 'tablet-portrait', width: 820, height: 1180, touch: true },
  { name: 'tablet-landscape', width: 1180, height: 820, touch: true },
  { name: 'desktop', width: 1280, height: 800, touch: false },
];
const DEFAULT_PAGES = ['/index.html', ...registryAll().map(a => a.url)];

/* ---- arg parsing ---- */
const argv = process.argv.slice(2);
const opts = { pages: [], engines: [], list: false };
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--list') opts.list = true;
  else if (a === '--engine') opts.engines.push(argv[++i]);
  else if (a.startsWith('--engine=')) opts.engines.push(a.split('=')[1]);
  else if (a === '--page') opts.pages.push(argv[++i]);
  else if (a.startsWith('--page=')) opts.pages.push(a.split('=')[1]);
  else opts.pages.push('/pages/' + a + '.html');
}

/* ---- resolve playwright without a package.json ---- */
function findPlaywright() {
  if (process.env.PLAYWRIGHT_MODULE) return process.env.PLAYWRIGHT_MODULE;
  const roots = [
    path.join(process.env.LOCALAPPDATA || '', 'npm-cache', '_npx'),
    path.join(process.env.HOME || '', '.npm', '_npx'),
  ];
  for (const root of roots) {
    if (!fs.existsSync(root)) continue;
    for (const dir of fs.readdirSync(root)) {
      const p = path.join(root, dir, 'node_modules', 'playwright');
      if (fs.existsSync(p)) return p;
    }
  }
  return null;
}

const PAGE_ERRORS_IGNORED = [/favicon/i];
const ENGINES = ['chromium', 'webkit'];
const GESTURE_PAGES = new Set(['/pages/coloring.html', '/pages/tracing.html']);

async function waitForPageReady(page, pathname) {
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
  if (pathname === '/pages/matching_game.html') {
    await page.waitForFunction(() => {
      const pieces = Array.from(document.querySelectorAll('#candyGrid .candy'));
      if (pieces.length !== 16) return false;
      const rects = pieces.map(piece => piece.getBoundingClientRect());
      const positions = new Set(rects.map(rect => `${Math.round(rect.left)}:${Math.round(rect.top)}`));
      return rects.every(rect => rect.width > 0 && rect.height > 0)
        && positions.size === pieces.length
        && pieces.every(piece => piece.getAnimations().every(animation => {
          const iterations = animation.effect?.getComputedTiming().iterations;
          return iterations === Infinity || animation.playState !== 'running';
        }));
    }, null, { timeout: 6000 });
  }
}

async function checkTouchInput(page) {
  await page.evaluate(() => {
    const probe = document.createElement('button');
    probe.type = 'button';
    probe.id = 'play-matrix-touch-probe';
    probe.setAttribute('aria-label', 'Touch capability probe');
    probe.style.cssText = 'position:fixed;left:0;top:0;width:30px;height:30px;z-index:2147483647;opacity:0.01;touch-action:none';
    probe.addEventListener('pointerdown', event => {
      probe.dataset.pointerType = event.pointerType;
      event.stopPropagation();
    });
    probe.addEventListener('touchstart', event => {
      probe.dataset.touchStart = 'true';
      event.stopPropagation();
    });
    probe.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
    });
    document.body.appendChild(probe);
  });
  await page.touchscreen.tap(15, 15);
  const result = await page.locator('#play-matrix-touch-probe').evaluate(el => ({
    pointerType: el.dataset.pointerType || '',
    touchStart: el.dataset.touchStart === 'true',
  }));
  await page.locator('#play-matrix-touch-probe').evaluate(el => el.remove());
  return result.pointerType === 'touch' || result.touchStart;
}

async function checkGestureInteraction(page, pathname) {
  if (!GESTURE_PAGES.has(pathname)) return null;
  if (pathname === '/pages/coloring.html') {
    const swatch = page.locator('#coloringPalette .coloring-swatch').nth(1);
    const expectedColor = await swatch.getAttribute('data-color');
    const box = await swatch.boundingBox();
    if (!expectedColor || !box) throw new Error('coloring touch target is not visible');
    await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForFunction(color => {
      const selected = document.querySelector('#coloringPalette .coloring-swatch.selected');
      return selected?.dataset.color === color;
    }, expectedColor);
    return 'palette swatch selected by touch';
  }

  const activity = page.locator('#tracingHub .activity-btn[data-activity="prewriting"]');
  const activityBox = await activity.boundingBox();
  if (!activityBox) throw new Error('tracing activity target is not visible');
  await page.touchscreen.tap(
    activityBox.x + activityBox.width / 2,
    activityBox.y + activityBox.height / 2,
  );
  await page.waitForFunction(() => !!document.getElementById('tracingCanvas')
    && !document.getElementById('tracingActivity').hidden);
  const drewInk = await page.evaluate(() => {
    const canvas = document.getElementById('tracingCanvas');
    const rect = canvas.getBoundingClientRect();
    const countInk = () => {
      const pixels = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
      let count = 0;
      for (let i = 3; i < pixels.length; i += 4) if (pixels[i] > 0) count++;
      return count;
    };
    const before = countInk();
    const y = rect.top + rect.height / 2;
    const fire = (target, type, x) => target.dispatchEvent(new PointerEvent(type, {
      bubbles: true, cancelable: true, pointerId: 91, pointerType: 'touch',
      isPrimary: true, clientX: x, clientY: y,
    }));
    fire(canvas, 'pointerdown', rect.left + 12);
    for (let x = rect.left + 12; x <= rect.right - 12; x += 8) fire(window, 'pointermove', x, y);
    fire(window, 'pointerup', rect.right - 12);
    return countInk() > before;
  });
  if (!drewInk) throw new Error('tracing touch-pointer drag did not draw on the canvas');
  return 'touch-pointer drag drew on canvas';
}

async function main() {
  if (opts.list) {
    console.log('Pages:   ' + (opts.pages.length ? opts.pages.join(', ') : DEFAULT_PAGES.join(', ')));
    console.log('Devices: ' + DEVICES.map(d => d.name).join(', '));
    console.log('Engines: ' + (opts.engines.length ? opts.engines.join(', ') : 'chromium, webkit'));
    return 0;
  }
  const pages = opts.pages.length ? opts.pages : DEFAULT_PAGES;
  const engines = opts.engines.length ? opts.engines : ENGINES;
  const unknownEngines = engines.filter(engine => !ENGINES.includes(engine));
  if (unknownEngines.length) {
    console.error(`unknown engine(s): ${unknownEngines.join(', ')}; expected ${ENGINES.join(', ')}`);
    return 2;
  }
  if (pages.some(page => typeof page !== 'string' || !page.startsWith('/') || page.startsWith('//') || page.includes('..'))) {
    console.error('pages must be local absolute paths without parent-directory segments');
    return 2;
  }

  const pwDir = findPlaywright();
  if (!pwDir) {
    console.error('playwright not found. Install it first:\n  npx playwright install webkit chromium');
    return 2;
  }
  const pwMod = await import(pathToFileURL(path.join(pwDir, 'index.js')).href);
  const pw = pwMod.default && pwMod.default.chromium ? pwMod.default : pwMod;

  const srv = await serve();
  let passes = 0, fails = 0, skips = 0;
  const cellsPerEngine = DEVICES.length * pages.length;
  try {
    for (const engine of engines) {
      const type = pw[engine];
      if (!type) {
        skips += cellsPerEngine;
        console.log(`SKIP ${engine} — engine unavailable (${cellsPerEngine} cell(s))`);
        continue;
      }
      let browser;
      try {
        // System Chrome is already required by the smokes, so prefer it over a
        // separate Playwright chromium download.
        browser = await type.launch(engine === 'chromium' ? { channel: 'chrome' } : {});
      } catch (e) {
        try { browser = await type.launch(); }
        catch (e2) {
          skips += cellsPerEngine;
          console.log(`SKIP ${engine} — browser not installed (${cellsPerEngine} cell(s); ${String(e2.message).split('\n')[0]})`);
          console.log(`     run: npx playwright install ${engine}`);
          continue;
        }
      }
      try {
        for (const dev of DEVICES) {
          const ctx = await browser.newContext({
            viewport: { width: dev.width, height: dev.height },
            hasTouch: dev.touch,
            isMobile: dev.touch,
          });
          for (const p of pages) {
            const page = await ctx.newPage();
            const errors = [];
            page.on('pageerror', e => {
              if (!/(chrome-extension|devtools):\/\//i.test(e.stack || '')) errors.push('pageerror: ' + e.message);
            });
            page.on('console', m => {
              const swWarning = m.type() === 'warning'
                && /(?:service.?worker.*(?:register|registration|install)|SW register failed)/i.test(m.text());
              if ((m.type() === 'error' || swWarning)
                && !PAGE_ERRORS_IGNORED.some(r => r.test(m.text()))) errors.push(`${m.type()}: ${m.text()}`);
            });
            page.on('response', response => {
              const url = response.url();
              if (url.startsWith(`http://127.0.0.1:${srv.port}/`) && response.status() >= 400
                && !/\/favicon\.ico(?:[?#]|$)/i.test(url)) {
                errors.push(`resource: ${response.status()} ${url}`);
              }
            });
            page.on('requestfailed', request => {
              const url = request.url();
              const failure = request.failure()?.errorText || '';
              const cancelledMedia = /\/assets\/audio\//i.test(url)
                && /^(?:Load request cancelled|NS_BINDING_ABORTED)$/i.test(failure);
              if (url.startsWith(`http://127.0.0.1:${srv.port}/`)
                && !/\/favicon\.ico(?:[?#]|$)/i.test(url)
                && failure !== 'net::ERR_ABORTED' && !cancelledMedia) {
                errors.push(`resource: ${failure} (${request.resourceType()}) ${url}`);
              }
            });
            await page.addInitScript(() => {
              window.__psUnhandled = [];
              window.addEventListener('unhandledrejection', event => {
                const reason = event.reason;
                window.__psUnhandled.push(reason && (reason.stack || reason.message) || String(reason));
              });
            });
            let overflow = null, touchPoints = null, orientation = null, racingOrientationHint = null;
            let controlsChecked = 0, controlsScrolled = 0, controlProblems = [], touchInput = null, interaction = null;
            try {
              await page.goto(`http://127.0.0.1:${srv.port}${p}`, { waitUntil: 'load' });
              await waitForPageReady(page, p);
              const m = await page.evaluate(async () => {
                const overlaySelector = '[role="dialog"], [aria-modal="true"], [id*="modal" i], [class*="modal" i], '
                  + '[id*="picker" i], [class*="picker" i], [id*="hint" i], [class*="hint" i]';
                const candidates = Array.from(document.querySelectorAll(
                  'button:not([disabled]), a[href], [role="button"]:not([aria-disabled="true"])',
                )).filter(el => {
                  const style = getComputedStyle(el);
                  const rect = el.getBoundingClientRect();
                  return el.namespaceURI !== 'http://www.w3.org/2000/svg'
                    && style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0'
                    && rect.width > 0 && rect.height > 0;
                });
                const controls = [];
                for (const el of candidates) {
                  let rect = el.getBoundingClientRect();
                  const initiallyInViewport = rect.left >= -1 && rect.top >= -1
                    && rect.right <= window.innerWidth + 1 && rect.bottom <= window.innerHeight + 1;
                  const centerHit = () => {
                    const box = el.getBoundingClientRect();
                    return document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
                  };
                  const skipUnderlay = hit => {
                    const overlay = hit?.closest(overlaySelector);
                    return overlay && !overlay.contains(el) && !el.contains(overlay);
                  };
                  if (skipUnderlay(centerHit())) continue;
                  if (!initiallyInViewport) {
                    el.scrollIntoView({ block: 'center', inline: 'center' });
                    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
                    if (skipUnderlay(centerHit())) continue;
                  }
                  rect = el.getBoundingClientRect();
                  const hit = centerHit();
                  controls.push({
                    name: el.getAttribute('aria-label') || el.textContent.trim().replace(/\s+/g, ' ').slice(0, 40) || el.id || el.tagName,
                    initiallyInViewport,
                    inViewport: rect.left >= -1 && rect.top >= -1
                      && rect.right <= window.innerWidth + 1 && rect.bottom <= window.innerHeight + 1,
                    hit: !!hit && (hit === el || el.contains(hit)),
                    bounds: [Math.round(rect.left), Math.round(rect.top), Math.round(rect.right), Math.round(rect.bottom)],
                    hitTarget: hit ? hit.tagName.toLowerCase() + (hit.id ? '#' + hit.id : '') : 'none',
                  });
                }
                return {
                  scrollW: document.documentElement.scrollWidth,
                  innerW: window.innerWidth,
                  touch: navigator.maxTouchPoints,
                  orientation: window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape',
                  racingOrientationHint: document.getElementById('r3d-landscape-hint')
                    ? getComputedStyle(document.getElementById('r3d-landscape-hint')).display !== 'none' : null,
                  unhandled: window.__psUnhandled || [],
                  controls,
                };
              });
              errors.push(...m.unhandled.map(e => 'unhandledrejection: ' + e));
              overflow = m.scrollW - m.innerW;
              touchPoints = m.touch;
              orientation = m.orientation;
              racingOrientationHint = m.racingOrientationHint;
              controlsChecked = m.controls.length;
              controlsScrolled = m.controls.filter(c => !c.initiallyInViewport).length;
              controlProblems = m.controls.filter(c => !c.inViewport || !c.hit);
              if (dev.touch) touchInput = await checkTouchInput(page);
              if (dev.touch && dev.name === 'phone-portrait') interaction = await checkGestureInteraction(page, p);
            } catch (e) {
              errors.push('load: ' + e.message);
            }
            const label = `${engine} ${dev.name} ${p}`;
            const problems = [];
            if (errors.length) problems.push(errors.length + ' error(s): ' + errors.slice(0, 3).join('; '));
            if (overflow !== null && overflow > 1) problems.push(`h-overflow ${overflow}px`);
            const expectedOrientation = dev.width > dev.height ? 'landscape' : 'portrait';
            if (orientation && orientation !== expectedOrientation) problems.push(`orientation ${orientation}, expected ${expectedOrientation}`);
            if (p === '/pages/racing3d.html') {
              const expectsHint = dev.height > dev.width && dev.width >= 520;
              if (racingOrientationHint !== expectsHint) {
                problems.push(`Racing3D orientation hint ${racingOrientationHint}, expected ${expectsHint}`);
              }
            }
            if (dev.touch && !touchInput) problems.push('touch input was not delivered');
            if (dev.touch && engine === 'chromium' && !(touchPoints > 0)) problems.push('no touch points');
            if (controlProblems.length) {
              problems.push(`${controlProblems.length}/${controlsChecked} control(s) off-screen or covered: `
                + controlProblems.slice(0, 3).map(c => `${c.name} [${c.bounds.join(',')} → ${c.hitTarget}]`).join('; '));
            }
            if (problems.length) fails++;
            else passes++;
            console.log(`${problems.length ? 'FAIL' : 'PASS'} ${label}`
              + (problems.length
                ? '  [' + problems.join(' | ') + ']'
                : `  [scroll=${overflow}, touch=${touchPoints}, input=${dev.touch ? 'yes' : 'n/a'}, orientation=${orientation}, controls=${controlsChecked}${controlsScrolled ? ` (${controlsScrolled} scrolled into view)` : ''}${interaction ? ', interaction=' + interaction : ''}]`));
            await page.close();
          }
          await ctx.close();
        }
      } finally {
        await browser.close();
      }
    }
  } finally {
    srv.close();
  }
  console.log(`\nMATRIX: ${passes} passed, ${fails} failed, ${skips} skipped`
    + (skips ? ' — coverage incomplete' : ''));
  return fails ? 1 : skips ? 2 : 0;
}

main().then(c => process.exit(c)).catch(e => { console.error('play_matrix ERROR:', e); process.exit(2); });
