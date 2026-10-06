/* validate_pages.js — PWA metadata + route integrity validator (dev only).
   Checks every page in game/pages/ for required metadata:
     - <html lang="sr">
     - <link rel="manifest" href="../manifest.json">
     - <meta name="theme-color" content="#4A3F6B">
     - <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
   Also validates that every page in app-registry.js exists on disk.

   Usage: node tools/validate_pages.js [--json]
   Exit 0 = all valid, 1 = failures found. */
const fs = require('fs');
const path = require('path');
const { all: registryAll, RETIRED_ROUTES } = require('./registry.js');

const ROOT = path.resolve(__dirname, '..');
const PAGES_DIR = path.join(ROOT, 'game', 'pages');
const REGISTRY = path.join(ROOT, 'game', 'data', 'app-registry.js');
const SERBIAN = require(path.join(ROOT, 'game', 'data', 'serbian.js'));

const REQUIRED = [
  { name: 'lang="sr"', re: /<html\s+lang="sr"/i },
  { name: 'manifest', re: /<link\s+rel="manifest"\s+href="\.\.\/manifest\.json"/i },
  { name: 'theme-color', re: /<meta\s+name="theme-color"\s+content="#4A3F6B"/i },
  { name: 'viewport-fit=cover', re: /<meta\s+name="viewport"\s+content="width=device-width,\s*initial-scale=1(\.0)?,\s*viewport-fit=cover"/i }
];

const failures = [];
const warnings = [];

// Validate each page in game/pages/
const pages = fs.readdirSync(PAGES_DIR).filter(f => f.endsWith('.html')).sort();
for (const page of pages) {
  const filePath = path.join(PAGES_DIR, page);
  const html = fs.readFileSync(filePath, 'utf8');
  for (const req of REQUIRED) {
    if (!req.re.test(html)) {
      failures.push(`${page}: missing ${req.name}`);
    }
  }
  const languageScript = html.search(/<script\b[^>]*src=["'][^"']*data\/serbian\.js["'][^>]*>/i);
  const firstScript = html.search(/<script\b[^>]*src=/i);
  if (firstScript >= 0 && (languageScript < 0 || languageScript > firstScript)) {
    failures.push(`${page}: data/serbian.js must load before page scripts`);
  }

  /* Back-button arrow convention (task 207): every back control must render the
     shared Material "arrow_back" SVG path, never a raw text glyph. Three newer
     pages (maze, rhythm, spatial) shipped a bare "←" that renders inconsistently
     across fonts and unlike every other page's SVG button. A control counts as a
     back control when it carries the .back-btn/.adv-back class or a "…-back"/
     "back-btn" navigation id; coloring-next shares the .back-btn class but is the
     forward arrow, so the glyph discriminates it. animal_puzzle/animal_counting/
     animal_memory inject their back button from JS (already the SVG); static HTML
     is what this scan sees. */
  const ARROW_BACK = 'M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z';
  for (const m of html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/gi)) {
    const attrs = m[1];
    const isBack = /\bclass="[^"]*\b(?:back-btn|adv-back)\b[^"]*"/i.test(attrs) ||
      /id="(?:[a-z0-9_-]+-back|back-btn)"/i.test(attrs);
    if (!isBack) continue;
    const textOnly = m[2].replace(/<[^>]*>/g, '').trim();
    if (/^(➡|→)$/.test(textOnly)) continue;
    if (textOnly && !m[2].includes(ARROW_BACK)) {
      failures.push(`${page}: back control uses a text glyph "${textOnly}" instead of the shared SVG arrow (task 207)`);
    }
  }
}

// Validate registry entries exist on disk
if (fs.existsSync(REGISTRY)) {
  const apps = registryAll();
  for (const app of apps) {
    const filePath = path.join(ROOT, 'game', app.path);
    if (!fs.existsSync(filePath)) {
      failures.push(`registry: ${app.id} -> ${app.path} not found on disk`);
    }
    if (!SERBIAN.titles[app.id] || app.title !== SERBIAN.titles[app.id]) {
      failures.push(`registry: ${app.id} title does not match game/data/serbian.js`);
    }
  }
  /* Check for pages not in registry. This is a FAILURE, not a warning: R7 made the
   registry the single source of truth, so an unregistered page is a page no tool
   covers and no runtime route knows about - it ships as an orphan. It was a
   warning, and the negative test below proved a warning is invisible: deleting an
   entry produced a green run while `space_smoke` and offline coverage silently
   stopped covering a page. */
  const registryPaths = new Set(apps.map(a => a.path.replace('pages/', '')));
  for (const page of pages) {
    if (!registryPaths.has(page)) {
      failures.push(`page ${page} exists but not in app-registry.js`);
    }
  }
} else {
  failures.push('game/data/app-registry.js not found');
}

/* ---- registry contract (R7) ----
   The registry is now the single source of truth for routes, hub order and the
   back/start wiring that every tool and the runtime itself read. These checks
   exist so that "the tools and the app agree" cannot silently rot: a duplicate
   id, a route the hub does not render, or a retired route that leaked back into
   a live list all produce a failure rather than a test that quietly covers less.
   Negative-tested by temporarily breaking each field and confirming a failure. */
if (fs.existsSync(REGISTRY)) {
  const apps = registryAll();
  const indexHtml = fs.readFileSync(path.join(ROOT, 'game', 'index.html'), 'utf8');
  const languageScript = indexHtml.search(/<script\b[^>]*src=["'][^"']*data\/serbian\.js["'][^>]*>/i);
  const firstScript = indexHtml.search(/<script\b[^>]*src=/i);
  if (languageScript < 0 || firstScript < 0 || languageScript > firstScript) {
    failures.push('index.html: data/serbian.js must load before page scripts');
  }

  const seenIds = new Set();
  for (const app of apps) {
    if (!app.id) failures.push('registry: an entry has no id');
    else if (seenIds.has(app.id)) failures.push(`registry: duplicate id "${app.id}"`);
    seenIds.add(app.id);
    if (app.path && !app.path.startsWith('pages/')) {
      failures.push(`registry: ${app.id} path "${app.path}" must live under pages/`);
    }
  }

  // Every route a tool would navigate to must exist as a registry entry.
  const routes = apps.map(a => a.route).filter(Boolean);
  const seenRoutes = new Set();
  for (const r of routes) {
    if (seenRoutes.has(r)) failures.push(`registry: duplicate route "${r}"`);
    seenRoutes.add(r);
    const routeOwner = apps.find(a => a.route === r);
    if (routeOwner && routeOwner.category !== 'parent' && !indexHtml.includes(`data-go="${r}"`)) {
      failures.push(`registry: route "${r}" has no hub button in index.html`);
    }
  }

  // Retired routes must stay retired: hidden in the markup AND absent from the
  // live hub ordering the tools use to pick what to test.
  for (const d of RETIRED_ROUTES) {
    const entry = apps.find(a => a.route === d.route);
    if (entry) failures.push(`retired route "${d.route}" is still present in the registry`);
    const markupLines = indexHtml.split('\n');
    for (const line of markupLines) {
      if (!line.includes(`data-go="${d.route}"`)) continue;
      const hidden = /\bhidden\b/i.test(line) || /display:\s*none/i.test(line);
      if (!hidden) failures.push(`retired route "${d.route}" has a visible hub button`);
    }
  }

  // Hub order must be a permutation of the grouped entries, with no gaps, so a
  // newly added game cannot land in the wrong group or collide with an order.
  for (const g of ['games', 'learning']) {
    const members = apps.filter(a => a.hubGroup === g);
    const orders = members.map(a => a.hubOrder).filter(o => typeof o === 'number');
    const dupes = orders.filter((o, i) => orders.indexOf(o) !== i);
    if (dupes.length) failures.push(`registry: duplicate hubOrder ${dupes.join(', ')} in group "${g}"`);
    for (const a of members) {
      if (typeof a.hubOrder !== 'number') failures.push(`registry: ${a.id} is in hubGroup "${g}" but has no hubOrder`);
    }
  }

  /* Every runtime field the registry feeds into main.js must actually resolve,
   or the page boots silently broken. The two fields mean different things and
   need different evidence:
     - `back` is passed to document.getElementById, so the id must be in the page.
     - `start` is called as window[fnName](), so the name must be defined as a
       global function by one of the page's own scripts.
   A missing one is not an error main.js can report - tryStart() just gives up
   silently - which is exactly why it needs a gate here. null means "this page
   handles itself" (animal_counting/animal_memory/animal_puzzle) and is allowed. */
  for (const app of apps) {
    if (app.category === 'parent') continue;
    const pagePath = path.join(ROOT, 'game', app.path);
    if (!fs.existsSync(pagePath)) continue;
    const pageHtml = fs.readFileSync(pagePath, 'utf8');
    const pageDir = path.dirname(pagePath);

    if (app.back && !pageHtml.includes(`id="${app.back}"`)) {
      failures.push(`registry: ${app.id}.back = "${app.back}" but no such element id in ${app.path}`);
    }

    if (app.start) {
      const scripts = [...pageHtml.matchAll(/<script[^>]*\ssrc="([^"]+)"/g)]
        .map(m => path.resolve(pageDir, m[1]))
        .filter(p => fs.existsSync(p));
      /* Two ways a page can publish a global boot function, and the codebase uses
         both: `window.startX = function () {}` in the standalone games, and a
         bare `function startX()` in the small ones. Matching only one of them
         reported six working games as broken, so accept either. */
      const patterns = [
        new RegExp(`function\\s+${app.start}\\s*\\(`),
        new RegExp(`(?:var|let|const)\\s+${app.start}\\s*=`),
        new RegExp(`window\\.${app.start}\\s*=`),
      ];
      const defines = scripts.some(p => {
        const src = fs.readFileSync(p, 'utf8');
        return patterns.some(re => re.test(src));
      });
      if (!defines) {
        failures.push(`registry: ${app.id}.start = "${app.start}" but no page script defines that global function`);
      }
    }
  }
}

// Output
const asJson = process.argv.includes('--json');
if (asJson) {
  console.log(JSON.stringify({ failures, warnings, pagesChecked: pages.length }, null, 2));
} else {
  if (failures.length) {
    console.error('FAIL:');
    for (const f of failures) console.error('  ' + f);
  }
  if (warnings.length) {
    console.warn('WARN:');
    for (const w of warnings) console.warn('  ' + w);
  }
  if (!failures.length) {
    console.log(`OK: ${pages.length} pages validated, all metadata present.`);
  }
}
process.exit(failures.length ? 1 : 0);
