/* axe_check.js — accessibility scan (dev only, R10/task 171).
   Runs axe-core against a page in the normal headless-Chrome harness and prints
   WCAG 2.0/2.1 A+AA violations, worst impact first.

   A pinned axe-core 4.10.2 build is vendored under tools/vendor/ so scans work
   offline and CI does not depend on a CDN. It is tool-only; game/ never loads it.

   Usage:
     node tools/axe_check.js                          # default page set
     node tools/axe_check.js tracing coloring         # only those pages
     node tools/axe_check.js --page /index.html       # one page (repeatable)
     node tools/axe_check.js --all                   # every page under game/pages
     node tools/axe_check.js --wcag wcag2aa           # narrower rule set
     node tools/axe_check.js --report                # exit 1 on serious/critical

   Exit codes: 0 = scan completed with no blocking violation (or informational mode),
   1 = serious/critical violations found under --report, 2 = pinned axe unavailable
   or one or more pages could not be scanned.
 */
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { start } = require('./headless.js');
const { children, parents } = require('./registry.js');

const GAME_ROOT = path.resolve(__dirname, '..', 'game');
const AXE_FILE = path.join(__dirname, 'vendor', 'axe-core-4.10.2.min.js');
const AXE_SHA256 = 'b511cd9dec01c76f4b2ad1723b66b6db37d4c2eb4ed199076e1829d9ee7b75e3';
const DEFAULT_PAGES = [
  '/index.html',
  ...children().map(app => app.url),
  ...parents().map(app => app.url),
];

const argv = process.argv.slice(2);
const opts = { pages: [], all: false, report: false, wcag: null };
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--all') opts.all = true;
  else if (a === '--report') opts.report = true;
  else if (a === '--wcag') opts.wcag = argv[++i];
  else if (a.startsWith('--wcag=')) opts.wcag = a.split('=')[1];
  else if (a === '--page') opts.pages.push(argv[++i]);
  else if (a.startsWith('--page=')) opts.pages.push(a.split('=')[1]);
  else opts.pages.push('/pages/' + a + '.html');
}

function loadAxe() {
  if (!fs.existsSync(AXE_FILE)) throw new Error(`Pinned axe-core file is missing: ${AXE_FILE}`);
  const bytes = fs.readFileSync(AXE_FILE);
  const hash = crypto.createHash('sha256').update(bytes).digest('hex');
  if (hash !== AXE_SHA256) throw new Error(`Pinned axe-core integrity mismatch: expected ${AXE_SHA256}, got ${hash}`);
  const src = bytes.toString('utf8');
  if (!src.includes('axe.version="4.10.2"')) throw new Error('Pinned axe-core file does not declare version 4.10.2');
  return src;
}

function resolvePages() {
  if (opts.pages.length) return [...new Set(opts.pages)];
  if (opts.all) {
    const dir = path.join(GAME_ROOT, 'pages');
    return fs.readdirSync(dir).filter(f => f.endsWith('.html')).map(f => '/pages/' + f).sort();
  }
  return DEFAULT_PAGES;
}

function isGamePage(page) {
  if (!page.startsWith('/') || page.includes('?') || page.includes('#')) return false;
  const file = path.resolve(GAME_ROOT, page.slice(1));
  const relative = path.relative(GAME_ROOT, file);
  return relative !== '..' && !relative.startsWith('..' + path.sep)
    && !path.isAbsolute(relative) && fs.existsSync(file) && fs.statSync(file).isFile();
}

const IMPACT_ORDER = { critical: 0, serious: 1, moderate: 2, minor: 3 };

(async () => {
  let axeSrc;
  try { axeSrc = loadAxe(); }
  catch (e) {
    console.error('axe-core unavailable: ' + e.message);
    console.error('Restore tools/vendor/axe-core-4.10.2.min.js from the repository and re-run.');
    process.exit(2);
  }

  const pages = resolvePages();
  const invalidPages = pages.filter(page => !isGamePage(page));
  if (invalidPages.length) {
    console.error(`Invalid or missing game page(s): ${invalidPages.join(', ')}`);
    process.exit(2);
  }
  let seriousTotal = 0;
  const impactTotals = { critical: 0, serious: 0, moderate: 0, minor: 0 };
  const scanErrors = [];
  const report = [];
  const h = await start({ page: null, tag: 'axe-scan', width: 1280, height: 800 });
  try {
    for (const p of pages) {
      try {
        await h.navigate(`http://127.0.0.1:${h.port}${p}`);
        const loaded = await h.waitFor(
          `location.pathname === ${JSON.stringify(p)} && document.readyState === 'complete'`,
          { timeout: 15000, label: `${p} to finish loading` },
        );
        if (!loaded.ok) throw new Error(loaded.why);

        const err = await h.evalv(axeSrc + '\n; true');
        if (err && typeof err === 'object' && err.__err) throw new Error(err.__err);
        const hasAxe = await h.evalv(`!!(window.axe && typeof window.axe.run === 'function')`);
        if (!hasAxe) throw new Error('axe did not define window.axe');

        const runOpts = opts.wcag
          ? `{ runOnly: { type: 'tag', values: [${JSON.stringify(opts.wcag)}] } }`
          : `{ runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } }`;
        const res = await h.evalp(`axe.run(document, ${runOpts}).then(r => JSON.stringify(r.violations.map(v => ({ id: v.id, impact: v.impact, help: v.help, n: v.nodes.length, sample: v.nodes[0] && v.nodes[0].target.join(' ') }))))`);
        const violations = JSON.parse(res || '[]');
        violations.sort((a, b) => (IMPACT_ORDER[a.impact] ?? 9) - (IMPACT_ORDER[b.impact] ?? 9));

        console.log('\n=== ' + p + ' — ' + violations.length + ' violation type(s) ===');
        if (!violations.length) console.log('  (clean)');
        for (const v of violations) {
          impactTotals[v.impact] = (impactTotals[v.impact] || 0) + v.n;
          if (v.impact === 'serious' || v.impact === 'critical') seriousTotal += v.n;
          console.log(`  [${String(v.impact).padEnd(8)}] ${v.id} x${v.n} — ${v.help}`);
          console.log(`             e.g. ${v.sample}`);
        }
        report.push({ page: p, violations });
      } catch (e) {
        console.log('\n=== ' + p + ' — SCAN ERROR: ' + e.message);
        report.push({ page: p, error: e.message });
        scanErrors.push(`${p}: ${e.message}`);
      }
    }
  } finally {
    await h.close();
  }

  console.log('\n=== A11Y SUMMARY ===');
  for (const r of report) {
    const n = r.error ? 'ERROR' : r.violations.length;
    const worst = r.error ? r.error : (r.violations[0] ? r.violations[0].impact + '/' + r.violations[0].id : 'clean');
    console.log(`  ${String(n).padStart(3)} types  ${r.page.padEnd(34)} ${worst}`);
  }
  console.log(seriousTotal === 0
    ? 'No serious/critical violations.'
    : `${seriousTotal} serious/critical node violation(s) across ${pages.length} page(s).`);
  console.log(`Impact totals: critical=${impactTotals.critical}, serious=${impactTotals.serious}, moderate=${impactTotals.moderate}, minor=${impactTotals.minor}.`);
  if (scanErrors.length) {
    console.error(`Accessibility scan incomplete: ${scanErrors.length} page(s) could not be scanned.`);
    process.exit(2);
  }
  if (opts.report && seriousTotal > 0) process.exit(1);
  process.exit(0);
})().catch(e => { console.error('axe_check ERROR:', e); process.exit(2); });
