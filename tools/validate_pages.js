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

const ROOT = path.resolve(__dirname, '..');
const PAGES_DIR = path.join(ROOT, 'game', 'pages');
const REGISTRY = path.join(ROOT, 'game', 'data', 'app-registry.js');

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
}

// Validate registry entries exist on disk
if (fs.existsSync(REGISTRY)) {
  const src = fs.readFileSync(REGISTRY, 'utf8');
  const mockWindow = {};
  const APP_REGISTRY = new Function('window', src + '; return window.APP_REGISTRY;')(mockWindow);
  for (const app of APP_REGISTRY) {
    const filePath = path.join(ROOT, 'game', app.path);
    if (!fs.existsSync(filePath)) {
      failures.push(`registry: ${app.id} -> ${app.path} not found on disk`);
    }
  }
  // Check for pages not in registry
  const registryPaths = new Set(APP_REGISTRY.map(a => a.path.replace('pages/', '')));
  for (const page of pages) {
    if (!registryPaths.has(page)) {
      warnings.push(`page ${page} exists but not in app-registry.js`);
    }
  }
} else {
  failures.push('game/data/app-registry.js not found');
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
