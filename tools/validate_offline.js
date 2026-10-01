#!/usr/bin/env node
/* tools/validate_offline.js — R2 (task 153): validate the offline inventory.
 *
 * The offline story has THREE inventories that are easy to conflate:
 *   1. game/sw-cache-list.json   — what the service worker pre-caches (generated)
 *   2. game/offline-manifest.json— sha256 + size for exactly those entries
 *   3. docs/game-offline.zip    — built by copying ALL of game/, so it is a
 *                                 strict superset (it also carries the caregiver
 *                                 doc game/docs/OFFLINE_INSTALL.md, which no
 *                                 runtime page loads and which therefore must NOT
 *                                 be in the runtime cache list).
 *
 * Usage:  node tools/validate_offline.js          # validate + print the report
 *         node tools/validate_offline.js --quiet  # exit code only
 *
 * Exit 0 = all checks pass. Exit 1 = at least one check failed.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { canonicalBytes, hashFile } = require('./manifest_hash.js');

const REPO = path.resolve(__dirname, '..');
const GAME = path.join(REPO, 'game');
const TOOLS = path.join(__dirname);
const QUIET = process.argv.includes('--quiet');

/* Files that are deliberately packaged for caregivers but are not runtime
   dependencies. The roadmap allows classifying these separately instead of
   forcing them into the runtime cache inventory. */
const CAREGIVER_DOCS = ['docs/OFFLINE_INSTALL.md'];

/* Directories that must never appear in the runtime cache list. */
const FORBIDDEN_PREFIXES = ['resources/'];

let fails = 0;
const problems = [];
function check(name, ok, info) {
  if (!QUIET) console.log((ok ? 'PASS ' : 'FAIL ') + name + (info ? '  [' + info + ']' : ''));
  if (!ok) { fails++; problems.push(name + (info ? ' — ' + info : '')); }
}

const rel = p => path.relative(GAME, p).split(path.sep).join('/');
const exists = r => fs.existsSync(path.join(GAME, r));
const read = r => fs.readFileSync(path.join(GAME, r), 'utf8');

// ---- load the three inventories -------------------------------------------
const listPath = path.join(GAME, 'sw-cache-list.json');
const manifestPath = path.join(GAME, 'offline-manifest.json');
if (!fs.existsSync(listPath)) { console.error('missing ' + listPath); process.exit(2); }
const list = JSON.parse(fs.readFileSync(listPath, 'utf8'));
const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : {};

// ---- walk game/ to know what actually exists ------------------------------
function walk(dir, base, out) {
  out = out || [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    const r = base ? base + '/' + e.name : e.name;
    if (e.isDirectory()) walk(full, r, out);
    else out.push(r);
  }
  return out;
}
const onDisk = walk(GAME, '');
const onDiskSet = new Set(onDisk);

// =========================================================================
// 1. Every cache entry exists
// =========================================================================
const missing = list.filter(e => !exists(e));
check('every cache entry exists on disk', missing.length === 0,
  missing.length ? missing.slice(0, 5).join(', ') + (missing.length > 5 ? ' +' + (missing.length - 5) : '') : list.length + ' entries');

// =========================================================================
// 2. No cache entry points to a retired (non-existent) file
// =========================================================================
const retired = list.filter(e => onDiskSet.has(e) === false);
check('no cache entry points to a retired/missing file', retired.length === 0,
  retired.length ? retired.join(', ') : '0 retired');

// =========================================================================
// 3. Manifest keys match cache-list keys EXACTLY, with one documented exception:
//    the manifest cannot contain its own hash (it is written after hashing), so
//    it must NOT list itself. build_offline.js enforces the same exclusion, and
//    this check fails if the manifest ever grows a self-entry again.
// =========================================================================
const SELF = 'offline-manifest.json';
const listKeys = [...list].sort();
const manKeys = Object.keys(manifest).sort();
const onlyManifest = manKeys.filter(k => !listKeys.includes(k));
const expectedListKeys = listKeys.filter(k => k !== SELF);
const onlyList = expectedListKeys.filter(k => !manKeys.includes(k));
check('manifest keys match cache-list keys exactly (minus the manifest itself)',
  onlyManifest.length === 0 && onlyList.length === 0 && !manKeys.includes(SELF),
  onlyManifest.length || onlyList.length || manKeys.includes(SELF)
    ? 'only-in-manifest=[' + onlyManifest.join(',') + '] missing-from-manifest=[' + onlyList.join(',') + '] self-listed=' + manKeys.includes(SELF)
    : manKeys.length + ' keys, self-excluded as required');

// =========================================================================
// 4. Manifest hashes + sizes match the real files (integrity)
//    Compared through manifest_hash.js (canonical LF for text), because the
//    manifest describes the bytes GitHub Pages serves, not whatever line
//    endings the machine that built it happened to have on disk.
// =========================================================================
const badHash = [], badSize = [];
check('manifest does not list itself (it cannot contain its own hash)',
  !Object.prototype.hasOwnProperty.call(manifest, SELF),
  'offline-manifest.json correctly absent from its own contents');
for (const [k, v] of Object.entries(manifest)) {
  if (!exists(k)) { badHash.push(k + ' (absent)'); continue; }
  const real = hashFile(path.join(GAME, k));
  if (real.sha256 !== v.sha256) badHash.push(k);
  if (real.size !== v.size) badSize.push(k);
}
check('manifest sha256 matches the real bytes of every file', badHash.length === 0,
  badHash.length ? badHash.slice(0, 5).join(', ') : 'all ' + manKeys.length + ' verified');
check('manifest size matches the real size of every file', badSize.length === 0,
  badSize.length ? badSize.slice(0, 5).join(', ') : 'all verified');

// =========================================================================
// 5. Every runtime dependency referenced by an HTML page is in the inventory
//    (this is the check that would have caught the R1 racing-config.js bug)
// =========================================================================
const htmlFiles = onDisk.filter(f => f.endsWith('.html'));
const extRef = /^(https?:)?\/\//;
const missingDeps = new Set();
let refCount = 0;
for (const page of htmlFiles) {
  const dir = path.posix.dirname(page);
  const html = fs.readFileSync(path.join(GAME, page), 'utf8');
  // src=, href=, and url() inside inline <style>
  const refs = [];
  for (const m of html.matchAll(/(?:src|href)\s*=\s*"([^"]+)"/g)) refs.push(m[1]);
  for (const m of html.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) refs.push(m[1]);
  for (const raw of refs) {
    const ref = raw.trim();
    if (!ref || extRef.test(ref) || ref.startsWith('data:') || ref.startsWith('#') ||
        ref.startsWith('mailto:') || ref.startsWith('javascript:') || ref.startsWith('vbscript:')) continue;
    const clean = ref.split('?')[0].split('#')[0];
    if (!clean) continue;
    const resolved = path.posix.normalize(path.posix.join(dir, clean));
    if (!onDiskSet.has(resolved)) continue;   // genuinely absent → not our problem here
    refCount++;
    if (!listKeys.includes(resolved)) missingDeps.add(resolved + '  (from ' + page + ')');
  }
}
check('every local runtime dependency referenced by an HTML page is in the cache list',
  missingDeps.size === 0,
  missingDeps.size ? [...missingDeps].slice(0, 6).join(' | ') : refCount + ' refs across ' + htmlFiles.length + ' pages');

// =========================================================================
// 6. No docs/ or resources/ leakage into the runtime cache list
// =========================================================================
const leaked = list.filter(e => e.startsWith('docs/') || FORBIDDEN_PREFIXES.some(p => e.startsWith(p)));
check('no cache entry is a docs-only or resources file', leaked.length === 0,
  leaked.length ? leaked.join(', ') : 'clean');

// =========================================================================
// 7. Classified caregiver documents are packaged but not cached
// =========================================================================
const caretaking = CAREGIVER_DOCS.filter(f => onDiskSet.has(f));
const caretakingOk = caretaking.every(f => !listKeys.includes(f));
check('caregiver docs ship in the ZIP but stay out of the runtime cache list',
  caretakingOk,
  caretaking.length ? caretaking.join(', ') + ' packaged, not cached' : 'none configured');

// =========================================================================
// 8. Generation is deterministic (re-running the generator is a no-op)
//    Compared canonically: a Windows checkout holds this JSON as CRLF while the
//    generator emits LF, so a raw byte compare reports a "change" that is only
//    line endings — an inventory the validator would call unstable on one OS
//    and perfectly stable on every other.
//
//    R5 (task 165): the generator is invoked with --stdout, so it returns the
//    fresh list INSTEAD of writing it. This check used to overwrite
//    game/sw-cache-list.json and then compare the file with itself, which meant
//    a read-only "validator" mutated the worktree and a green run silently
//    repaired a stale inventory instead of reporting it. That is exactly the
//    anti-pattern R5 exists to remove: a check must FAIL on a stale artifact,
//    never quietly rewrite it. Freshness of this file is now owned by
//    tools/validate_generated.js; this check only proves the generator is
//    deterministic and agrees with the committed list.
// =========================================================================
const committed = fs.readFileSync(listPath);
let genOk = true, genInfo = '';
try {
  const fresh = execFileSync(process.execPath, [path.join(TOOLS, 'generate_sw_list.js'), '--stdout'], {
    encoding: 'utf8',
    maxBuffer: 8 * 1024 * 1024
  });
  genOk = canonicalBytes(committed).equals(canonicalBytes(Buffer.from(fresh, 'utf8')));
  genInfo = genOk ? 'a fresh generation reproduced the list (canonically, writing nothing)'
                  : 'a fresh generation DIFFERS from sw-cache-list.json — run: node tools/generate_sw_list.js';
} catch (e) {
  genOk = false;
  genInfo = 'generator failed: ' + (e.stderr ? e.stderr.toString().trim().split('\n')[0] : e.message);
}
check('cache-list generation is deterministic (regenerating is a no-op)', genOk, genInfo);

// =========================================================================
// 9. The list is sorted (stable ordering = readable diffs)
// =========================================================================
const sorted = [...list].sort();
check('cache list is sorted for stable diffs',
  list.every((v, i) => v === sorted[i]), 'deterministic ordering');

// =========================================================================
// Report
// =========================================================================
const ext = f => (path.extname(f) || '').toLowerCase();
const isVendor = f => f.includes('/lib/');
const cats = {
  'Runtime pages': list.filter(f => f.endsWith('.html')),
  'JS': list.filter(f => ['.js', '.mjs'].includes(ext(f))),
  'CSS': list.filter(f => ext(f) === '.css'),
  'Images': list.filter(f => ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico'].includes(ext(f))),
  'Audio': list.filter(f => ['.ogg', '.mp3', '.wav', '.m4a'].includes(ext(f))),
  'Fonts': list.filter(f => ['.woff', '.woff2', '.ttf', '.otf'].includes(ext(f))),
  'Vendor': list.filter(f => isVendor(f) && ['.js', '.mjs'].includes(ext(f))),
};
// Vendor JS is also counted as JS; report it as a subset, not a double count.
cats['JS'] = cats['JS'].filter(f => !isVendor(f));
const other = list.filter(f => !Object.values(cats).some(a => a.includes(f)));
if (other.length) cats['Other (manifests/service worker/docs)'] = other;

let totalBytes = 0;
const sizes = [];
for (const f of list) {
  if (!exists(f)) continue;
  const n = fs.statSync(path.join(GAME, f)).size;
  totalBytes += n;
  sizes.push({ f, n });
}
sizes.sort((a, b) => b.n - a.n);
const kb = n => (n / 1024).toFixed(1) + ' KB';
const mb = n => (n / 1048576).toFixed(2) + ' MB';

if (!QUIET) {
  console.log('\nOffline package report');
  console.log('----------------------');
  for (const [k, arr] of Object.entries(cats)) {
    const bytes = arr.reduce((a, f) => a + (exists(f) ? fs.statSync(path.join(GAME, f)).size : 0), 0);
    console.log(k + ': ' + arr.length + (bytes ? '  (' + kb(bytes) + ')' : ''));
  }
  console.log('Total runtime files: ' + list.length);
  console.log('Total runtime bytes: ' + mb(totalBytes));
  console.log('Largest assets:');
  sizes.slice(0, 5).forEach((s, i) => console.log('  ' + (i + 1) + '. ' + s.f + ' — ' + kb(s.n)));
  console.log('\nZIP note: the ZIP copies all of game/, so it additionally carries the');
  console.log('classified caregiver doc(s): ' + (caretaking.join(', ') || 'none') + '.');
  console.log('Those are intentionally NOT in the runtime cache inventory.');
}

if (fails) {
  console.error('\n' + fails + ' validation check(s) FAILED:');
  problems.forEach(p => console.error('  - ' + p));
}
if (!QUIET && !fails) console.log('\nAll ' + 10 + ' inventory checks passed.');
process.exit(fails ? 1 : 0);
