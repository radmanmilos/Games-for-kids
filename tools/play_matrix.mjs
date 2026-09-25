/* play_matrix.mjs — Playwright device-matrix smoke (dev only, task 103).
   Loads each page in a spread of phone / tablet / desktop viewports on every
   installed Playwright engine (chromium + webkit) and reports, per cell:
     - no uncaught page errors and no console errors
     - no horizontal overflow (document.scrollWidth <= innerWidth + 1)
     - touch points reported by the engine (chromium only — Playwright's WebKit
       desktop build always reports navigator.maxTouchPoints === 0, so asserting
       it there would flag an engine limitation, not a page defect)
   It is a REPORT, not a gate: a failing cell prints FAIL and the script exits 1,
   so it can be wired into the same ritual as the smokes.

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

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');

/* ---- device matrix ---- */
const DEVICES = [
  { name: 'phone-portrait', width: 390, height: 844, touch: true },
  { name: 'phone-landscape', width: 844, height: 390, touch: true },
  { name: 'tablet-portrait', width: 820, height: 1180, touch: true },
  { name: 'tablet-landscape', width: 1180, height: 820, touch: true },
  { name: 'desktop', width: 1280, height: 800, touch: false },
];
const DEFAULT_PAGES = ['/index.html', '/pages/tracing.html', '/pages/coloring.html', '/pages/piano.html', '/pages/racing.html'];

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

async function main() {
  if (opts.list) {
    console.log('Pages:   ' + (opts.pages.length ? opts.pages.join(', ') : DEFAULT_PAGES.join(', ')));
    console.log('Devices: ' + DEVICES.map(d => d.name).join(', '));
    console.log('Engines: ' + (opts.engines.length ? opts.engines.join(', ') : 'chromium, webkit'));
    return 0;
  }
  const pages = opts.pages.length ? opts.pages : DEFAULT_PAGES;
  const engines = opts.engines.length ? opts.engines : ['chromium', 'webkit'];

  const pwDir = findPlaywright();
  if (!pwDir) {
    console.error('playwright not found. Install it first:\n  npx playwright install webkit chromium');
    return 2;
  }
  const pwMod = await import(pathToFileURL(path.join(pwDir, 'index.js')).href);
  const pw = pwMod.default && pwMod.default.chromium ? pwMod.default : pwMod;

  const srv = await serve();
  let fails = 0;
  try {
    for (const engine of engines) {
      const type = pw[engine];
      if (!type) { console.log(`SKIP ${engine} — unknown engine`); continue; }
      let browser;
      try {
        // System Chrome is already required by the smokes, so prefer it over a
        // separate Playwright chromium download.
        browser = await type.launch(engine === 'chromium' ? { channel: 'chrome' } : {});
      } catch (e) {
        try { browser = await type.launch(); }
        catch (e2) {
          console.log(`SKIP ${engine} — browser not installed (${String(e2.message).split('\n')[0]})`);
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
            page.on('pageerror', e => errors.push('pageerror: ' + e.message));
            page.on('console', m => { if (m.type() === 'error' && !PAGE_ERRORS_IGNORED.some(r => r.test(m.text()))) errors.push('console: ' + m.text()); });
            let overflow = null, touchPoints = null;
            try {
              await page.goto(`http://127.0.0.1:${srv.port}${p}`, { waitUntil: 'load' });
              await page.waitForTimeout(1200);
              const m = await page.evaluate(() => ({
                scrollW: document.documentElement.scrollWidth,
                innerW: window.innerWidth,
                touch: navigator.maxTouchPoints,
              }));
              overflow = m.scrollW - m.innerW;
              touchPoints = m.touch;
            } catch (e) {
              errors.push('load: ' + e.message);
            }
            const label = `${engine} ${dev.name} ${p}`;
            const problems = [];
            if (errors.length) problems.push(errors.length + ' error(s): ' + errors[0]);
            if (overflow !== null && overflow > 1) problems.push(`h-overflow ${overflow}px`);
            if (dev.touch && engine === 'chromium' && !(touchPoints > 0)) problems.push('no touch points');
            if (problems.length) fails++;
            console.log(`${problems.length ? 'FAIL' : 'PASS'} ${label}` + (problems.length ? '  [' + problems.join(' | ') + ']' : `  [scroll=${overflow}, touch=${touchPoints}]`));
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
  console.log(fails === 0 ? '\nMATRIX: ALL CELLS OK' : `\nMATRIX: ${fails} cell(s) failed`);
  return fails === 0 ? 0 : 1;
}

main().then(c => process.exit(c)).catch(e => { console.error('play_matrix ERROR:', e); process.exit(2); });
