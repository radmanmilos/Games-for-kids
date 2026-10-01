/* Visual regression: capture screenshots of representative pages in multiple sizes.
   Usage: node tools/screenshot.js [--pages hub,animals,...] [--sizes phone,tablet,desktop]
   Saves to tools/screenshots/<page>_<size>.png */
const { start } = require('./headless.js');
const fs = require('fs');
const path = require('path');
const { all: registryAll } = require('./registry.js');

const sleep = ms => new Promise(r => setTimeout(r, ms));

/* Page list comes from the shared registry loader, the same one the smokes and
   offline E2E use. This tool used to read game/data/app-registry.js itself and
   evaluate it with new Function('window', ...) - a second, hand-rolled copy of
   the one loader that has to stay in step with it. */
const PAGES = { hub: '/index.html' };
for (const app of registryAll()) { PAGES[app.id] = '/' + app.path; }

/* deviceScaleFactor is NOT optional: Chrome silently ignores the entire
   Emulation.setDeviceMetricsOverride when it is absent, leaving the viewport at
   the harness default. Without it phone/tablet/desktop all produced byte-identical
   1280x800 PNGs - a "visual regression" tool that compared nothing. */
const SIZES = {
  phone: { width: 390, height: 844, deviceScaleFactor: 1, mobile: true },
  tablet: { width: 820, height: 1180, deviceScaleFactor: 1, mobile: true },
  desktop: { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false }
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

      // Absolute URL: Page.navigate is given a relative path, and from the
      // about:blank start page it never resolves to a real document. That made
      // this tool silently write blank 4.7KB PNGs for every page - it looked like
      // it worked, because it never failed, only produced pictures of nothing.
      await h.navigate(`http://127.0.0.1:${h.port}${url}`);
      // Readiness wait, not a longer sleep: capture once the page has actually
      // rendered, otherwise a slow boot yields a blank frame.
      await h.waitFor('document.readyState === "complete" && document.body.children.length > 0');
      // AFTER navigation: the metrics override is dropped on a cross-document
      // navigation, so setting it before navigate() left every capture at the
      // harness's own 1280x800 and the phone/tablet/desktop runs produced three
      // identical files.
      await h.c.send('Emulation.setDeviceMetricsOverride', opts);
      await sleep(300);

      const result = await h.c.send('Page.captureScreenshot', { format: 'png' });
      const file = path.join(outDir, `${page}_${size}.png`);
      fs.writeFileSync(file, Buffer.from(result.data, 'base64'));
      console.log(`  ${page}_${size}.png`);
    }
  }

  /* Never let this tool look like it worked without producing distinct images.
     Two bugs shipped here that only showed up as suspiciously tiny files: a
     relative navigate() (blank pages) and a deviceScaleFactor-less override
     (all sizes identical). Reject both rather than writing them to disk. */
  const dims = fs.readdirSync(outDir).filter(f => f.endsWith('.png')).map(f => {
    const b = fs.readFileSync(path.join(outDir, f));
    return { f, w: b.readUInt32BE(16), h: b.readUInt32BE(20), bytes: b.length };
  });
  const blanks = dims.filter(d => d.bytes < 20000);
  if (blanks.length) {
    console.error(`\nERROR: ${blanks.length} capture(s) look blank: ` +
      blanks.map(d => `${d.f} (${d.w}x${d.h}, ${d.bytes}B)`).join(', '));
    process.exit(1);
  }
  const seen = new Set(dims.map(d => `${d.w}x${d.h}`));
  if (seen.size < dims.length) {
    console.error(`\nERROR: ${dims.length} captures but only ${seen.size} distinct size(s) - ` +
      'the viewport override is not taking effect.');
    process.exit(1);
  }
  console.log(`\n${dims.length} capture(s), ${seen.size} distinct size(s)`);
  for (const d of dims) console.log(`  ${d.f}  ${d.w}x${d.h}  ${Math.round(d.bytes / 1024)}KB`);

  await h.close();
  console.log(`\nScreenshots saved to ${outDir}`);
})().catch(e => { console.error('screenshot crashed:', e); process.exit(1); });
