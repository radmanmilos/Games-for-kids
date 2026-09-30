/* check_syntax.js — read-only syntax gate (dev only, no deps).
   Runs `node --check` over every .js/.mjs under game/ and tools/ and exits
   non-zero if any file fails to parse. Writes nothing.

   Usage:
     node tools/check_syntax.js            # print per-failure detail + summary
     node tools/check_syntax.js --quiet    # summary + exit code only

   Split out of check_all.js so CI's fast job can check syntax WITHOUT running
   the smoke battery (roadmap R4, Job A). check_all.js calls runSyntax() as its
   syntax stage, so there is exactly one implementation. */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIRS = [path.join(ROOT, 'game'), __dirname];

function collectJs(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === 'node_modules' || ent.name.startsWith('.')) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) collectJs(full, out);
    else if (ent.isFile() && /\.(js|mjs)$/.test(ent.name)) out.push(full);
  }
  return out;
}

/** @returns {{files:number, failed:number}} number of files checked + failures */
function runSyntax({ quiet = false, dirs = DIRS } = {}) {
  const files = dirs.flatMap(d => collectJs(d));
  if (!quiet) console.log('=== Syntax check: node --check (' + files.length + ' files) ===');
  let failed = 0;
  for (const f of files) {
    const r = spawnSync(process.execPath, ['--check', f], { encoding: 'utf8' });
    if (r.status !== 0) {
      failed++;
      console.error('SYNTAX FAIL: ' + path.relative(ROOT, f) + '\n' + (r.stderr || r.stdout || '').trim());
    }
  }
  return { files: files.length, failed };
}

module.exports = { runSyntax, collectJs, DIRS };

if (require.main === module) {
  for (const d of DIRS) {
    if (!fs.existsSync(d)) { console.error('Missing directory: ' + d); process.exit(1); }
  }
  const quiet = process.argv.includes('--quiet');
  const { files, failed } = runSyntax({ quiet });
  if (failed) { console.error(failed + ' file(s) failed node --check'); process.exit(1); }
  if (!quiet) console.log('Syntax OK (' + files + ' files).');
  process.exit(0);
}
