/* axe_check.js — one-off accessibility scan (dev only, task 103).
   Runs axe-core against a page in the normal headless-Chrome harness and prints
   WCAG 2.0/2.1 A+AA violations, worst impact first.

   axe-core is NOT vendored into the repo (game/ must stay deployable-only and the
   repo has no package.json). It is fetched ONCE from the jsDelivr CDN and cached
   in tools/.cache/axe.min.js (git-ignored), so later runs work offline. Delete the
   cache file to force a refresh.

   Usage:
     node tools/axe_check.js                          # default page set
     node tools/axe_check.js tracing coloring         # only those pages
     node tools/axe_check.js --page /index.html       # one page (repeatable)
     node tools/axe_check.js --all                   # every page under game/pages
     node tools/axe_check.js --wcag wcag2aa           # narrower rule set
     node tools/axe_check.js --report                # exit 1 on serious/critical

   Exit codes: 0 = no serious/critical violations (info-level only, or no --report),
   1 = serious/critical violations found, 2 = axe-core unavailable (offline, and no
   cache). Without --report the scan is informational and always exits 0 — the repo
   has pre-existing minor/serious findings in places, so a hard gate on everything
   would just be noise; add --report when a page must be clean.
 */
const fs = require('fs');
const path = require('path');
const { start, serve, sleep } = require('./headless.js');

const CACHE = path.join(__dirname, '.cache', 'axe.min.js');
const AXE_CDN = 'https://cdn.jsdelivr.net/npm/axe-core@4.10.2/axe.min.js';
const DEFAULT_PAGES = ['/index.html', '/pages/tracing.html', '/pages/coloring.html', '/pages/animals.html', '/pages/piano.html', '/pages/racing.html', '/pages/animal_memory.html'];

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

async function loadAxe() {
  if (fs.existsSync(CACHE)) return fs.readFileSync(CACHE, 'utf8');
  process.stdout.write('fetching axe-core once from jsDelivr... ');
  const res = await fetch(AXE_CDN, { signal: AbortSignal.timeout(30000) });
  if (!res.ok) throw new Error('CDN returned HTTP ' + res.status);
  const src = await res.text();
  fs.mkdirSync(path.dirname(CACHE), { recursive: true });
  fs.writeFileSync(CACHE, src);
  console.log('cached to tools/.cache/axe.min.js');
  return src;
}

function resolvePages() {
  if (opts.pages.length) return [...new Set(opts.pages)];
  if (opts.all) {
    const dir = path.resolve(__dirname, '..', 'game', 'pages');
    return fs.readdirSync(dir).filter(f => f.endsWith('.html')).map(f => '/pages/' + f).sort();
  }
  return DEFAULT_PAGES.filter(p => p.endsWith('.html') && fs.existsSync(path.resolve(__dirname, '..', 'game', p.slice(1))));
}

const IMPACT_ORDER = { critical: 0, serious: 1, moderate: 2, minor: 3 };

(async () => {
  let axeSrc;
  try { axeSrc = await loadAxe(); }
  catch (e) {
    console.error('axe-core unavailable: ' + e.message);
    console.error('It is cached at tools/.cache/axe.min.js — reconnect once and re-run.');
    process.exit(2);
  }

  const pages = resolvePages();
  const srv = await serve();
  let seriousTotal = 0;
  const report = [];

  for (const p of pages) {
    const h = await start({ page: p, tag: 'axe-' + path.basename(p, '.html'), width: 1280, height: 800 });
    try {
      await sleep(700);
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
        if (v.impact === 'serious' || v.impact === 'critical') seriousTotal += v.n;
        console.log(`  [${String(v.impact).padEnd(8)}] ${v.id} x${v.n} — ${v.help}`);
        console.log(`             e.g. ${v.sample}`);
      }
      report.push({ page: p, violations });
    } catch (e) {
      console.log('\n=== ' + p + ' — SCAN ERROR: ' + e.message);
      report.push({ page: p, error: e.message });
    } finally {
      h.close();
    }
  }
  srv.close();

  console.log('\n=== A11Y SUMMARY ===');
  for (const r of report) {
    const n = r.error ? 'ERROR' : r.violations.length;
    const worst = r.error ? r.error : (r.violations[0] ? r.violations[0].impact + '/' + r.violations[0].id : 'clean');
    console.log(`  ${String(n).padStart(3)} types  ${r.page.padEnd(34)} ${worst}`);
  }
  console.log(seriousTotal === 0
    ? 'No serious/critical violations.'
    : `${seriousTotal} serious/critical node violation(s) across ${pages.length} page(s).`);
  if (opts.report && seriousTotal > 0) process.exit(1);
  process.exit(0);
})().catch(e => { console.error('axe_check ERROR:', e); process.exit(2); });
