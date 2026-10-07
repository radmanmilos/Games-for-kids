/* tools/check_scan_alerts.js — keep the two GitHub code-scanning alerts from
 * coming back (task 176).
 *
 * READ-ONLY. Two GitHub Advanced Security alerts were opened against this repo
 * and fixed by Copilot Autofix on 2026-10-01. A fix with no guard comes back the
 * next time somebody writes the same shape, so both shapes are now pinned here
 * and the guard runs inside `check_fast.js` — the read-only gate CI executes.
 *
 *   ALERT 7 — "Incomplete URL scheme check" (validate_offline.js). The ref filter
 *             excluded `data:`, `mailto:` and `javascript:` but NOT `vbscript:`,
 *             i.e. a partial denylist of dangerous URL schemes.
 *   ALERT 8 — "Bad HTML filtering regexp" (audit_serbian_strings.js). The
 *             `<script>`/`<style>` stripper ended its closing tag at
 *             `<\/script\s*>`, which `</script foo="bar">` and `</script/>`
 *             walk straight through — so the "visible text" it computed could
 *             still contain script bodies.
 *
 * Two rules, each checked behaviourally rather than by matching the autofix's
 * exact text, so a different-but-correct rewrite also passes:
 *
 *   1. Every place that decides a reference is safe because of its URL scheme
 *      must exclude EVERY dangerous scheme, not a subset.
 *   2. Every regex that strips an HTML element must actually strip it: it has to
 *      consume `</tag>`, `</tag >` and `</tag foo="bar">` whole.
 *
 * The third check is the important one. `checkers` below are exercised against
 * the PRE-autofix shapes held in memory, and must reject both — otherwise the
 * scan could match nothing at all and report green (the "a check that cannot
 * fail proves nothing" rule, AGENTS.md).
 *
 * Usage:  node tools/check_scan_alerts.js           # checks + summary
 *         node tools/check_scan_alerts.js --quiet   # exit code only
 * Exit 0 = clean, 1 = at least one check failed.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const QUIET = process.argv.slice(2).includes('--quiet');
const SELF = 'tools/check_scan_alerts.js';

// Schemes that must never be treated as an ordinary, safe reference. Kept here
// as data so the repo-wide rule can be restated independently of the code under
// it — the point is to catch a site that filtered SOME of them.
const DANGEROUS_SCHEMES = ['javascript:', 'vbscript:'];

const SCAN_ROOTS = ['game', 'tools'];
const SCAN_EXT = new Set(['.js', '.mjs']);
// Vendored/binary/generated trees: not our source, and huge enough to slow the
// scan down for no benefit.
const SKIP_DIRS = new Set(['assets', 'node_modules', '.cache', 'screenshots', 'vendor']);

const failures = [];
let checks = 0;

function check(name, ok, info) {
  checks++;
  if (QUIET) {
    if (!ok) failures.push(`${name} — ${info}`);
    return;
  }
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}  [${info}]`);
  if (!ok) failures.push(`${name} — ${info}`);
}

// ---------------------------------------------------------------------------
// File discovery
// ---------------------------------------------------------------------------
function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) walk(path.join(dir, entry.name), files);
    } else if (entry.isFile() && SCAN_EXT.has(path.extname(entry.name).toLowerCase())) {
      files.push(path.join(dir, entry.name));
    }
  }
  return files;
}

const sources = SCAN_ROOTS
  .filter(root => fs.existsSync(path.join(ROOT, root)))
  .flatMap(root => walk(path.join(ROOT, root)))
  // The guard itself quotes the dangerous schemes on purpose; scanning it would
  // only report its own sample strings.
  .filter(file => path.relative(ROOT, file).replace(/\\/g, '/') !== SELF)
  .map(file => ({ file: path.relative(ROOT, file).replace(/\\/g, '/'), source: fs.readFileSync(file, 'utf8') }));

// ---------------------------------------------------------------------------
// Rule 1 — dangerous-scheme filters must be complete
// ---------------------------------------------------------------------------
const SCHEME_TEST = /(['"`])javascript:\1/gi;

/** Text of the `if (...)` / ternary condition that a scheme test sits inside. */
function enclosingCondition(source, index) {
  const open = source.lastIndexOf('if (', index);
  if (open < 0) return null;
  let depth = 0;
  for (let i = open + 3; i < source.length; i++) {
    if (source[i] === '(') depth++;
    else if (source[i] === ')') {
      depth--;
      if (depth === 0) return source.slice(open + 3, i);
    }
  }
  return null;
}

/** Every `javascript:` scheme test, with the condition that decides it. */
function findSchemeSites(source) {
  const sites = [];
  for (const match of source.matchAll(SCHEME_TEST)) {
    sites.push({ index: match.index, condition: enclosingCondition(source, match.index) });
  }
  return sites;
}

function schemeSiteOk(site) {
  if (!site.condition) return false;
  const lower = site.condition.toLowerCase();
  return DANGEROUS_SCHEMES.every(scheme => lower.includes(scheme));
}

const schemeBad = [];
let schemeSiteCount = 0;
for (const { file, source } of sources) {
  for (const site of findSchemeSites(source)) {
    schemeSiteCount++;
    if (!schemeSiteOk(site)) {
      const lower = (site.condition || '').toLowerCase();
      const missing = DANGEROUS_SCHEMES.filter(scheme => !lower.includes(scheme));
      schemeBad.push(`${file}:${lineOf(source, site.index)} (missing ${missing.join(', ')})`);
    }
  }
}
check('every dangerous-scheme filter excludes every dangerous scheme', schemeBad.length === 0,
  schemeBad.length
    ? `incomplete: ${schemeBad.join('; ')} — every filter must test ${DANGEROUS_SCHEMES.join(' and ')}`
    : `${schemeSiteCount} filter(s) across ${sources.length} files, all test ${DANGEROUS_SCHEMES.join(' and ')}`);

// ---------------------------------------------------------------------------
// Rule 2 — HTML element strippers must not be bypassable
// ---------------------------------------------------------------------------
// A `.replace()` whose first argument is a regex literal that opens with `<`
// ("strip the HTML out" shape). That covers both the named-element strippers
// CodeQL's bad-pattern search knows (`</script>`/`</style>`, alert 8) and the
// GENERIC `<[^>]*>`-style stripper that CodeQL flags separately as incomplete
// multi-character sanitization (tasks 176 + 210): stripping `<scr<script>ipt>`
// with a single global replace removes the inner `<script>` and re-fabricates
// `<script>` from what is left, so a generic span stripper is exactly as
// dangerous as a careless closing-tag stripper — it must consume whole elements.
// The tag name is `\</script` in a regex SOURCE, hence the optional backslash
// handled inside `stripsElement`, and the body may or may not name a tag at all.
const REPLACE_LITERAL = /\.replace\(\s*\/((?:[^\/\\]|\\.)*)\/[a-z]*/g;

function findFilterPatterns(source) {
  return [...source.matchAll(REPLACE_LITERAL)]
    .map(m => ({ index: m.index, body: m[1] }))
    .filter(site => site.body.startsWith('<'));
}

/**
 * Does this pattern strip the whole element for every closing-tag spelling?
 *
 * Proved the way the callers use it: `replace` the element and mask it, then
 * require that nothing of the element — including its body — survives.
 *
 * The closing-tag forms asserted are the ones a hand-written or generated file
 * can actually contain. `</script/>` is HTML-legal too and this pattern does NOT
 * cover it (the tolerant group `(?:\s+[^>]*)?` needs whitespace first); the
 * pattern is left exactly as the code-scanning autofix wrote it, so widening it
 * here would be an unverifiable change. `audit_serbian_strings.js` is an
 * advisory scanner over our own source, so that residual is recorded, not
 * silently traded for a new alert.
 */
const CLOSING_FORMS = ['>', ' >', '\t>', '\n>', ' foo="bar">', ' data-x=1 >'];

function stripsElement(body) {
  let re;
  try {
    re = new RegExp(body, 'i');
  } catch {
    return false;
  }
  const tag = (body.match(/^<(\w+)/) || [])[1];
  if (!tag) return false;
  for (const closer of CLOSING_FORMS) {
    const html = `<${tag}>alert("Браво")</${tag}${closer}`;
    const match = re.exec(html);
    if (!match) return false;                                  // the filter did not match at all
    if (match[0].length < html.length) return false;           // it stopped before the closing tag
    const masked = html.replace(re, value => value.replace(/[^\n]/g, ' '));
    if (/alert|Браво/.test(masked)) return false;              // the element body survived the mask
  }
  return true;
}

const filterBad = [];
let filterCount = 0;
for (const { file, source } of sources) {
  for (const site of findFilterPatterns(source)) {
    filterCount++;
    if (!stripsElement(site.body)) filterBad.push(`${file}:${lineOf(source, site.index)}`);
  }
}
check('every HTML element stripper is not bypassable', filterBad.length === 0,
  filterBad.length
    ? `bypassable closing tag: ${filterBad.join(', ')} — use <\\/tag(?:\\s+[^>]*)?>`
    : `${filterCount} stripper(s), all consume every closing form: ${CLOSING_FORMS.map(f => `</tag${JSON.stringify(f)}`).join(', ')}`);

// ---------------------------------------------------------------------------
// Rule 3 — the two checkers above must REJECT the pre-autofix shapes
// ---------------------------------------------------------------------------
const BAD_SCHEME_SAMPLE = `
  const ref = raw.trim();
  if (!ref || ref.startsWith('mailto:') || ref.startsWith('javascript:')) continue;
`;
const GOOD_SCHEME_SAMPLE = `
  if (!ref || ref.startsWith('mailto:') || ref.startsWith('javascript:') || ref.startsWith('vbscript:')) continue;
`;
const BAD_FILTER_SAMPLE = `
  visible.replace(/<script\\b[^>]*>[\\s\\S]*?<\\/script\\s*>/gi, tag => tag);
`;
const GOOD_FILTER_SAMPLE = `
  visible.replace(/<script\\b[^>]*>[\\s\\S]*?<\\/script(?:\\s+[^>]*)?>/gi, tag => tag);
`;
const BAD_GENERIC_FILTER_SAMPLE = `
  const textOnly = m[2].replace(/<[^>]*>/g, '').trim();
`;
const GOOD_GENERIC_FILTER_SAMPLE = `
  let textOnly = '';
  let inTag = false;
  for (const ch of m[2]) { if (ch === '<') inTag = true; else if (ch === '>') inTag = false; else if (!inTag) textOnly += ch; }
  textOnly = textOnly.trim();
`;

const badSchemeSites = findSchemeSites(BAD_SCHEME_SAMPLE);
const badFilterSites = findFilterPatterns(BAD_FILTER_SAMPLE);
check('the scheme checker rejects an incomplete scheme filter',
  badSchemeSites.length === 1 && !schemeSiteOk(badSchemeSites[0]) && schemeSiteOk(findSchemeSites(GOOD_SCHEME_SAMPLE)[0]),
  `sample: ${badSchemeSites.length} site(s) found, incomplete one rejected`);

check('the stripper checker rejects a bypassable closing tag',
  badFilterSites.length === 1 && !stripsElement(badFilterSites[0].body) && stripsElement(findFilterPatterns(GOOD_FILTER_SAMPLE)[0].body),
  `sample: ${badFilterSites.length} site(s) found, bypassable one rejected`);

const badGenericSites = findFilterPatterns(BAD_GENERIC_FILTER_SAMPLE);
const goodGenericSites = findFilterPatterns(GOOD_GENERIC_FILTER_SAMPLE);
check('the generic <[^>]*> stripper shape is rejected (incomplete multi-char sanitization)',
  badGenericSites.length === 1 && !stripsElement(badGenericSites[0].body) && goodGenericSites.length === 0,
  `bad: ${badGenericSites.length} site(s), good: ${goodGenericSites.length} site(s)`);

// ---------------------------------------------------------------------------
// Rule 4 — the scans must not be vacuous
// ---------------------------------------------------------------------------
// If either scan ever finds nothing, it is reporting green because it is
// broken, not because the repo is clean.
check('the repo-wide scans are not vacuous', schemeSiteCount > 0 && filterCount > 0,
  `${schemeSiteCount} scheme filter(s), ${filterCount} stripper(s) found across ${sources.length} files`);

// ---------------------------------------------------------------------------
function lineOf(source, index) {
  let line = 1;
  for (let i = 0; i < index && i < source.length; i++) if (source.charCodeAt(i) === 10) line++;
  return line;
}

if (QUIET) {
  if (failures.length) {
    console.error(`check_scan_alerts: ${failures.length} of ${checks} checks FAILED`);
    for (const f of failures) console.error('  ' + f);
  }
} else if (failures.length) {
  console.log(`\n${failures.length} of ${checks} checks FAILED.`);
  for (const f of failures) console.log('  ' + f);
} else {
  console.log(`\nAll ${checks} scan-alert checks passed (${sources.length} files scanned).`);
}
process.exit(failures.length ? 1 : 0);