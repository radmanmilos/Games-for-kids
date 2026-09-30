/* generate_sw_list.js — writes the service worker's cache-all list.
 *
 * Usage:  node tools/generate_sw_list.js            # write game/sw-cache-list.json
 *         node tools/generate_sw_list.js --out F    # write F instead
 *         node tools/generate_sw_list.js --stdout   # print the JSON, write nothing
 *
 * R5 (task 165): the read-only validators need to know what a fresh generation
 * would produce WITHOUT touching the worktree, so all three modes exist. A
 * release check must fail when a generated file is stale, never quietly rewrite
 * it — and `--stdout` means "tell me", `--out` means "write it somewhere harmless".
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const gameDir = path.join(root, 'game');

const argv = process.argv.slice(2);
const outFlag = argv.indexOf('--out');
const outFile = outFlag >= 0 && argv[outFlag + 1] ? path.resolve(argv[outFlag + 1]) : path.join(gameDir, 'sw-cache-list.json');
const toStdout = argv.includes('--stdout');

const ignoreNames = new Set(['.git', 'node_modules', 'docs', 'tools', 'resources', '.DS_Store']);

function walk(dir, base) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files = [];
  for (const e of entries) {
    if (ignoreNames.has(e.name)) continue;
    const full = path.join(dir, e.name);
    const rel = path.posix.join(base, e.name);
    if (e.isDirectory()) {
      files = files.concat(walk(full, rel));
    } else if (e.isFile()) {
      // skip source maps and build artifacts if any
      if (e.name.endsWith('.map')) continue;
      // Keep entries relative to the deployed app root. GitHub Pages may serve
      // the app below a repository subpath, so /game/... is not portable.
      files.push(rel.replace(/\\\\/g, '/'));
    }
  }
  return files;
}

try {
  if (!fs.existsSync(gameDir)) throw new Error('game directory not found: ' + gameDir);
  const list = walk(gameDir, '');
  // Deduplicate & sort
  const uniq = Array.from(new Set(list)).sort();
  const json = JSON.stringify(uniq, null, 2);
  if (toStdout) {
    process.stdout.write(json);
  } else {
    fs.mkdirSync(path.dirname(outFile), { recursive: true });
    fs.writeFileSync(outFile, json, 'utf8');
    console.log('Wrote', outFile, 'entries:', uniq.length);
  }
} catch (err) {
  console.error(err);
  process.exit(1);
}
