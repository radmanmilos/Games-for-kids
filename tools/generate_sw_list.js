const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const gameDir = path.join(root, 'game');
const outFile = path.join(gameDir, 'sw-cache-list.json');

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
      // normalize to URL path starting with /game/
      files.push('/game/' + rel.replace(/\\\\/g, '/'));
    }
  }
  return files;
}

try {
  if (!fs.existsSync(gameDir)) throw new Error('game directory not found: ' + gameDir);
  const list = walk(gameDir, '');
  // Deduplicate & sort
  const uniq = Array.from(new Set(list)).sort();
  fs.writeFileSync(outFile, JSON.stringify(uniq, null, 2), 'utf8');
  console.log('Wrote', outFile, 'entries:', uniq.length);
} catch (err) {
  console.error(err);
  process.exit(1);
}
