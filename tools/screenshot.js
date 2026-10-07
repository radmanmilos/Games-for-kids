/* Deterministic screenshots in two modes.
 *
 * 1. Visual-regression mode (default) — captures the hub + every `screenshot:true`
 *    registry app at the five standard viewports into tools/screenshots/current/
 *    (git-ignored). Used by visual_compare.js to diff against reviewed baselines.
 *        node tools/screenshot.js [--pages hub,animals] [--sizes phone-portrait,desktop]
 *
 * 2. UI-review battery (task 213) — the reusable review process. Captures EVERY
 *    page (hub + all registry apps, including games without `screenshot:true` and
 *    the parent area) at the 4 viewport/orientation combos (small + large ×
 *    portrait + landscape), and writes into a committed folder under
 *    resources/General_reviews/<name>/:
 *      - one PNG per page × viewport (deterministic, validated non-blank),
 *      - TABLE_OF_CONTENT.md — a table of contents with a row per screenshot:
 *          file, game (Serbian title from the registry), page, format,
 *          orientation, the DATE AND TIME of the last capture of that file and
 *          the TASK that produced it (from --task, falling back to the last git
 *          commit), so a reviewer knows when each shot is stale,
 *      - screenshot-provenance.json — file → { updatedAt, task }, the machine
 *        source behind the TOC columns. Re-running with --pages=<subset> updates
 *        ONLY those files' provenance, so a later task that changed one screen
 *        re-shoots that page without touching the rest.
 *        node tools/screenshot.js --review=<name> [--task=<id>]
 *        node tools/screenshot.js --review=<name> --pages=animals --task=250
 *
 * The review folder is committed like normal code (a screen change must keep its
 * screenshots fresh — see AGENTS.md rule). Use a STABLE generic name for the
 * battery (convention: `Screenshot_Review`) — later tasks re-shoot into the same
 * folder with --pages, not a new dated folder.
 *
 * Both modes seed Math.random, wait for document/fonts/images, disable CSS motion,
 * then advance a fake clock and queued animation frames exactly 60 times so canvas
 * scenes are repeatable. Screenshots are validated for dimensions, an 8 KB minimum
 * and at least eight visible colors.
 */
const { start } = require('./headless.js');
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { all: registryAll } = require('./registry.js');
const { decodePng } = require('./visual_compare.js');

const ROOT = path.resolve(__dirname, '..');
const CURRENT = path.join(__dirname, 'screenshots', 'current');
const REVIEW_ROOT = path.join(ROOT, 'resources', 'General_reviews');

/* Every registry app (children AND the parent area) plus the hub. The review
   battery captures the whole inventory, not just the screenshot-enabled subset. */
const ALL_PAGES = { hub: '/index.html' };
for (const app of registryAll()) ALL_PAGES[app.id] = app.url;

/* The screenshot-enabled subset — the historical visual-regression input set. */
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

/* The 4 combos of the review battery: small + large × portrait + landscape. */
const REVIEW_SIZES = ['phone-portrait', 'phone-landscape', 'tablet-portrait', 'tablet-landscape'];

/* How long review mode waits in total for a slow-booting scene (a game that
   builds its view on setTimeout, not rAF) to render before giving up. The blank
   and color gates below are still strict — this budget only gives the page real
   time, it never relaxes the validation. */
const REVIEW_READY_TIMEOUT_MS = 8000;
const REVIEW_READY_INTERVAL_MS = 800;

function selectedArg(name, fallback) {
  const arg = process.argv.find(a => a.startsWith(`--${name}=`));
  return arg ? arg.slice(arg.indexOf('=') + 1).split(',') : fallback;
}

function flagArg(name) {
  const arg = process.argv.find(a => a.startsWith(`--${name}=`));
  return arg ? arg.slice(arg.indexOf('=') + 1) : null;
}

/* The task id that produced (or refreshed) the screenshots in THIS run. Falls back
   to the last git commit (its subject carries the "(task N)" tag), which is the
   true author when the shots are committed as part of a change. */
function taskForRun() {
  return flagArg('task') || execFileSync('git', ['log', '-1', '--format=%h %s'], { cwd: ROOT, encoding: 'utf8' }).trim();
}

function reviewDir(review) {
  return path.join(REVIEW_ROOT, review);
}
function provenanceFile(review) {
  return path.join(reviewDir(review), 'screenshot-provenance.json');
}
function loadProvenance(review) {
  try { return JSON.parse(fs.readFileSync(provenanceFile(review), 'utf8')); } catch { return {}; }
}
function saveProvenance(review, provenance) {
  fs.writeFileSync(provenanceFile(review), JSON.stringify(provenance, null, 2) + '\n');
}

/* dd.mm.yyyy. hh:mm:ss in local time — the "last screenshot" column the reviewer
   reads to know if a shot is stale. */
function formatWhen(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const p = n => String(n).padStart(2, '0');
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()}. ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

/* Decode + validate a captured PNG. Returns the decoded image, or throws on a
   blank/colorless/short frame or wrong geometry. */
function validateShot(file, bytes, viewport) {
  if (bytes.length < 8000) throw new Error(`${file} looks blank (${bytes.length} bytes)`);
  const image = decodePng(bytes);
  const colors = new Set();
  for (let i = 0; i < image.pixels.length && colors.size < 8; i += image.channels) {
    colors.add(`${image.pixels[i]},${image.pixels[i + 1]},${image.pixels[i + 2]}`);
  }
  if (colors.size < 8) throw new Error(`${file} has only ${colors.size} visible colors`);
  const expectedWidth = viewport.width * viewport.deviceScaleFactor;
  const expectedHeight = viewport.height * viewport.deviceScaleFactor;
  if (image.width !== expectedWidth || image.height !== expectedHeight) {
    throw new Error(`${file} is ${image.width}x${image.height}, expected ${expectedWidth}x${expectedHeight}`);
  }
  return image;
}

/* Serbian-Cyrillic manual for whoever reviews the folder. One row per PNG found on
   disk (so a partial --pages refresh still lists the kept files), with a column
   that names the game, the page it belongs to, the format/orientation, and the
   date+time + task of the LAST capture of that file (from provenance). */
function writeReviewToc({ review, generatedAt }) {
  const dir = reviewDir(review);
  const provenance = loadProvenance(review);
  const byId = new Map(registryAll().map(a => [a.id, a]));
  const known = page => (page === 'hub'
    ? { title: 'Петрин свет — почетна', url: '/index.html' }
    : byId.get(page) || { title: page, url: '/' + page });
  const rows = fs.readdirSync(dir)
    .filter(f => f.endsWith('.png'))
    .sort()
    .map(file => {
      const size = Object.keys(SIZES).find(s => file.endsWith('_' + s + '.png'));
      if (!size) return null;
      const page = file.slice(0, -(size.length + 5));
      /* V0.1: extract state from filename `<page>__<size>__<state>.png` */
      const stateMatch = file.match(/^(.+)__(.+)__(.+)\.png$/);
      const state = stateMatch ? stateMatch[3] : '—';
      const width = SIZES[size].width;
      const height = SIZES[size].height;
      const orientation = height > width ? 'портрет' : 'пејзаж';
      const app = known(page);
      const prov = provenance[file] || {};
      return `| \`${file}\` | ${app.title} | \`${app.url}\` | ${width}×${height} | ${orientation} | ${state} | ${formatWhen(prov.updatedAt)} | ${prov.task || '—'} |`;
    })
    .filter(Boolean);
  const md = [
    '# Преглед екрана (UI review)',
    '',
    '- Генерисано / Generated: ' + generatedAt,
    '- Поново направи / Regenerate: `node tools/screenshot.js --review=' + review + '`',
    '- Освежи само промењену страну / Refresh only a changed page: `node tools/screenshot.js --review=' + review + ' --pages=<id> --task=<id>`',
    '',
    'Свака колона „Последња слика“ показује датум и време последњег снимка тог файла и задатак који га је направио.',
    '',
    '| Слика (PNG) | Игра / Game | Страна / Page | Формат | Оријентација | Стање | Последња слика (датум · време) | Задатак |',
    '|---|---|---|---|---|---|---|---|',
    ...rows,
    '',
  ].join('\n');
  fs.writeFileSync(path.join(dir, 'TABLE_OF_CONTENT.md'), md + '\n');
}

(async () => {
  const review = flagArg('review');
  if (review) fs.mkdirSync(reviewDir(review), { recursive: true });

  const pageSource = review ? ALL_PAGES : PAGES;
  const defaultSizes = review ? REVIEW_SIZES : Object.keys(SIZES);
  const pages = selectedArg('pages', Object.keys(pageSource));
  const sizes = selectedArg('sizes', defaultSizes);
  const unknownPages = pages.filter(page => !pageSource[page]);
  const unknownSizes = sizes.filter(size => !SIZES[size]);
  if (unknownPages.length || unknownSizes.length) {
    throw new Error([
      ...unknownPages.map(page => `Unknown page "${page}"`),
      ...unknownSizes.map(size => `Unknown viewport "${size}"`),
    ].join('; '));
  }
  if (!pages.length || !sizes.length) throw new Error('Select at least one page and viewport');

  const outDir = review ? reviewDir(review) : CURRENT;
  if (!review) {
    fs.rmSync(CURRENT, { recursive: true, force: true });
    fs.mkdirSync(CURRENT, { recursive: true });
  }

  const h = await start({ page: null, tag: review ? 'visual-review' : 'visual-capture', width: 1280, height: 800 });
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
      const url = pageSource[page];
      for (const size of sizes) {
        const viewport = SIZES[size];
        await h.c.send('Emulation.setDeviceMetricsOverride', viewport);
        await h.navigate(`http://127.0.0.1:${h.port}${url}`);
        const loaded = await h.waitFor(
          `location.pathname === ${JSON.stringify(url)} && document.readyState === 'complete'`,
          { timeout: 15000, label: `${page} to finish loading` },
        );
        if (!loaded.ok) throw new Error(loaded.why);

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

        /* V0.1: optional gameplay-state capture. `--state=<id>` drives the page into a
   named, deterministic state before the shot, and the filename becomes
   `<page>__<viewport>__<state>.png` per the spec's naming convention. The state
   map is per-game and lives beside this tool so a new game never needs a change
   here. Without --state the behaviour is byte-identical to before. */
  const stateArg = selectedArg('state', null);
  const stateMap = stateArg ? require('./visual-states.json') : null;
  const stateHook = stateMap && stateMap[page] ? stateMap[page][stateArg] : null;
  if (stateArg && !stateHook) {
    throw new Error(`Unknown state "${stateArg}" for "${page}". Known: ${Object.keys(stateMap[page] || {}).join(', ') || '(none)'}`);
  }
  const file = stateArg ? `${page}__${size}__${stateArg}.png` : `${page}_${size}.png`;

        /* V0.1: drive the page into the requested state before capturing. The
           state hook is a JavaScript expression evaluated in the page context.
           It must be deterministic — no reliance on random timing. */
        if (stateHook) {
          const stateResult = await h.evalv(stateHook);
          if (stateResult !== true) {
            throw new Error(`State "${stateArg}" for "${page}" did not apply: ${JSON.stringify(stateResult)}`);
          }
          /* Let the state settle visually before capturing. */
          await h.evalv('window.__visualAdvance(30)');
          await h.sleep(100);
        }
        const target = path.join(outDir, file);
        let bytes;
        let image;
        const deadline = Date.now() + REVIEW_READY_TIMEOUT_MS;
        for (;;) {
          const result = await h.c.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
          bytes = Buffer.from(result.data, 'base64');
          try {
            image = validateShot(file, bytes, viewport);
            break;
          } catch (e) {
            /* Geometry is deterministic — a wrong size is a real bug, never a
               symptom of "not booted yet". Only blank/colorless frames are on the
               slow-scene retry path, and only in review mode (visual-regression
               must stay strict and deterministic). */
            if (!review || e.message.includes('expected') || Date.now() >= deadline) throw e;
            console.log(`  ${file}: scene not ready yet (${e.message}); waiting`);
            await h.evalv('window.__visualAdvance(30)');
            await h.sleep(REVIEW_READY_INTERVAL_MS);
          }
        }
        const { width, height } = image;
        fs.writeFileSync(target, bytes);
        outputs.push({ file, page, size, state: stateArg || null, width, height, bytes: bytes.length });
        console.log(`CAPTURE ${file}  ${width}x${height}  ${Math.round(bytes.length / 1024)}KB`);
      }
    }
  } finally {
    await h.close();
  }

  const commitSha = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim();
  const generatedAt = new Date().toISOString();

  if (review) {
    /* Update ONLY the files touched this run; untouched files keep their old
       updatedAt/task so a --pages refresh of one screen never rewrites history
       of the rest. */
    const provenance = loadProvenance(review);
    const task = taskForRun();
    for (const o of outputs) provenance[o.file] = { updatedAt: generatedAt, task };
    saveProvenance(review, provenance);
    writeReviewToc({ review, generatedAt });
  }

  fs.writeFileSync(path.join(outDir, 'capture-manifest.json'), JSON.stringify({
    schemaVersion: 1,
    mode: review ? 'review' : 'visual-regression',
    reviewName: review || null,
    commitSha,
    browser,
    generatedAt,
    pageSet: pages,
    viewports: Object.fromEntries(sizes.map(size => [size, SIZES[size]])),
    screenshots: outputs,
  }, null, 2) + '\n');
  console.log(`\nCaptured ${outputs.length} screenshots into ${outDir}`);
})().catch(e => { console.error('screenshot ERROR:', e); process.exit(1); });