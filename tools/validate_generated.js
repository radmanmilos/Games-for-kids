/* tools/validate_generated.js — R5 (task 165): are the generated files current?
 *
 * Read-only. Answers exactly one question: **would regenerating change
 * anything?** It never writes. That is the whole point — the old
 * `check_release.js` ran `sync-docs.sh` and `build_offline.js` as part of a
 * "check", so a stale artifact was silently repaired by the checker and the
 * command reported green. A release check must FAIL on a stale artifact and
 * leave the fix to an explicit generation command.
 *
 * What is generated in this repo, and who owns which question:
 *   - `docs/` (mirror of `game/`)          -> FRESHNESS, here
 *   - `game/sw-cache-list.json`            -> FRESHNESS, here
 *   - `game/offline-manifest.json` + ZIP   -> INTEGRITY, tools/validate_offline.js
 *
 * The split is deliberate: this tool asks "is it current?", validate_offline.js
 * asks "is it correct for the files on disk?". Overlapping meanings between
 * those two is what R5 was called to remove.
 *
 * Comparison is CANONICAL (LF for text, identity for binary) via manifest_hash.js.
 * A raw byte compare would report every text file as stale on this Windows
 * checkout forever: git has `core.autocrlf=true` and no `.gitattributes`, so the
 * worktree holds CRLF while the generator — and GitHub Pages — serve LF.
 *
 * Usage:  node tools/validate_generated.js           # validate + report
 *         node tools/validate_generated.js --quiet   # exit code only
 * Exit 0 = current, 1 = stale (with the exact fix for each).
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { canonicalBytes } = require('./manifest_hash.js');

const ROOT = path.resolve(__dirname, '..');
const GAME = path.join(ROOT, 'game');
const DOCS = path.join(ROOT, 'docs');
const QUIET = process.argv.slice(2).includes('--quiet');

const failures = [];   // failed checks
const advice = [];     // the fix to run, when a check fails
let checks = 0;

function check(name, ok, info) {
  checks++;
  if (!ok) failures.push(`${name} — ${info}`);
  if (!QUIET) console.log(`${ok ? 'PASS' : 'FAIL'} ${name}  [${info}]`);
}

function advise(line) {
  advice.push(line);
}

/** relative posix paths of every file under dir, ignoring build noise */
function listFiles(dir) {
  const skip = new Set(['.git', 'node_modules', '.DS_Store']);
  const out = [];
  (function walk(cur, base) {
    for (const e of fs.readdirSync(cur, { withFileTypes: true })) {
      if (skip.has(e.name)) continue;
      const rel = base ? `${base}/${e.name}` : e.name;
      if (e.isDirectory()) walk(path.join(cur, e.name), rel);
      else if (e.isFile()) out.push(rel);
    }
  })(dir, '');
  return out.sort();
}

function sameBytes(a, b) {
  return canonicalBytes(fs.readFileSync(a)).equals(canonicalBytes(fs.readFileSync(b)));
}

// ---------------------------------------------------------------------------
// 1. docs/ must mirror game/ exactly — same file set, same canonical bytes.
//    Until 2026-10-02 this had to excuse docs/game-offline.zip, a manual download
//    archive left in the tree by tools/build_offline.js. That archive is gone for
//    good (user decision: offline is the service worker, nothing is hand-unpacked),
//    so docs/ must mirror game/ exactly with no exceptions.
// ---------------------------------------------------------------------------
if (!fs.existsSync(DOCS)) {
  check('docs/ exists', false, 'missing — run: bash tools/sync-docs.sh');
} else {
  const gameFiles = listFiles(GAME);
  const docsFiles = listFiles(DOCS);
  const onlyGame = gameFiles.filter((f) => !docsFiles.includes(f));
  const onlyDocs = docsFiles.filter((f) => !gameFiles.includes(f));

  check(
    'docs/ has no file missing from game/',
    onlyGame.length === 0,
    onlyGame.length ? `${onlyGame.length} missing, e.g. ${onlyGame.slice(0, 3).join(', ')}` : `${gameFiles.length} files`
  );
  check(
    'docs/ has no extra file not in game/',
    onlyDocs.length === 0,
    onlyDocs.length ? `${onlyDocs.length} extra, e.g. ${onlyDocs.slice(0, 3).join(', ')}` : 'clean'
  );

  const differing = gameFiles.filter((f) => docsFiles.includes(f) && !sameBytes(path.join(GAME, f), path.join(DOCS, f)));
  check(
    'every mirrored file is byte-identical (canonically)',
    differing.length === 0,
    differing.length ? `${differing.length} differ, e.g. ${differing.slice(0, 3).join(', ')}` : `${gameFiles.length} files identical`
  );

  if (!onlyGame.length && !onlyDocs.length && !differing.length) {
    if (!QUIET) console.log(`\ndocs/ is a current mirror of game/ (${gameFiles.length} files).`);
  } else {
    advise('FIX: run `bash tools/sync-docs.sh`, then review and commit docs/');
  }
}

// ---------------------------------------------------------------------------
// 2. The service worker's cache list must match a fresh generation. Generated
//    with --stdout so this tool cannot write to the worktree even by accident.
// ---------------------------------------------------------------------------
const listPath = path.join(GAME, 'sw-cache-list.json');
if (!fs.existsSync(listPath)) {
  check('game/sw-cache-list.json exists', false, 'missing — run: node tools/generate_sw_list.js');
} else {
  let fresh = null;
  let genErr = null;
  try {
    fresh = execFileSync(process.execPath, [path.join(__dirname, 'generate_sw_list.js'), '--stdout'], {
      encoding: 'utf8',
      maxBuffer: 8 * 1024 * 1024
    });
  } catch (e) {
    genErr = (e.stderr || e.message || '').toString().trim();
  }
  if (genErr) {
    check('cache list regenerates without error', false, genErr.split('\n')[0]);
  } else {
    const committed = fs.readFileSync(listPath, 'utf8');
    const freshCount = (JSON.parse(fresh) || []).length;
    const same = canonicalBytes(Buffer.from(committed, 'utf8')).equals(canonicalBytes(Buffer.from(fresh, 'utf8')));
    check('game/sw-cache-list.json is what a fresh generation produces', same, same ? `${freshCount} entries, current` : `stale (fresh generation has ${freshCount} entries)`);
    if (!same) advise('FIX: run `node tools/generate_sw_list.js`');
  }
}

if (QUIET) {
  if (failures.length) {
    console.error(`validate_generated: ${failures.length} of ${checks} checks FAILED`);
    for (const f of failures) console.error('  ' + f);
    for (const a of advice) console.error('  ' + a);
  }
} else if (failures.length) {
  console.log(`\n${failures.length} of ${checks} generated-artifact checks FAILED.`);
  for (const a of advice) console.log('  ' + a);
} else {
  console.log(`\nAll ${checks} generated-artifact checks passed — nothing to regenerate.`);
}
process.exit(failures.length ? 1 : 0);
