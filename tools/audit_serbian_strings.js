/* Report exact repeated child-facing Cyrillic strings outside the shared data
   module. This is an advisory inventory, not a build or test gate. */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const GAME = path.join(ROOT, 'game');
const DATA_FILE = 'data/serbian.js';
const EXTENSIONS = new Set(['.html', '.js', '.mjs']);
const ignored = new Set(['node_modules', 'assets']);
const matches = new Map();

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if (entry.isDirectory()) {
      if (!ignored.has(entry.name)) walk(path.join(dir, entry.name), files);
    } else if (entry.isFile() && EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      files.push(path.join(dir, entry.name));
    }
  }
  return files;
}

function lineStarts(source) {
  const starts = [0];
  for (let i = 0; i < source.length; i++) if (source.charCodeAt(i) === 10) starts.push(i + 1);
  return starts;
}

function lineAt(starts, offset) {
  let low = 0;
  let high = starts.length;
  while (low < high) {
    const middle = (low + high) >>> 1;
    if (starts[middle] <= offset) low = middle + 1;
    else high = middle;
  }
  return low;
}

function add(starts, offset, file, value) {
  const text = value.replace(/\\([\\'"`])/g, '$1').replace(/\s+/g, ' ').trim().normalize('NFC');
  if (text.length < 2 || !/[\u0400-\u04ff]/.test(text)) return;

  const relative = path.relative(ROOT, file).replace(/\\/g, '/');
  const locations = matches.get(text) || [];
  locations.push(`${relative}:${lineAt(starts, offset)}`);
  matches.set(text, locations);
}

function mask(source, pattern) {
  return source.replace(pattern, value => value.replace(/[^\n]/g, ' '));
}

function scanJavaScript(source, file, starts, baseOffset = 0) {
  for (let i = 0; i < source.length;) {
    if (source.startsWith('//', i)) {
      const end = source.indexOf('\n', i + 2);
      i = end < 0 ? source.length : end + 1;
      continue;
    }
    if (source.startsWith('/*', i)) {
      const end = source.indexOf('*/', i + 2);
      i = end < 0 ? source.length : end + 2;
      continue;
    }

    const quote = source[i];
    if (quote !== '"' && quote !== "'" && quote !== '`') {
      i++;
      continue;
    }

    const start = i++;
    let value = '';
    while (i < source.length) {
      if (source[i] === '\\') {
        value += source.slice(i, i + 2);
        i += 2;
      } else if (source[i] === quote) {
        i++;
        break;
      } else {
        value += source[i++];
      }
    }

    if (quote !== '`' || !value.includes('${')) add(starts, baseOffset + start, file, value);
  }
}

function scanHtml(source, file) {
  const starts = lineStarts(source);
  let visible = mask(source, /<!--[\s\S]*?-->/g);
  const scripts = [];
  visible = visible.replace(/<script\b[^>]*>[\s\S]*?<\/script(?:\s+[^>]*)?>/gi, (tag, offset) => {
    const openEnd = tag.indexOf('>') + 1;
    scripts.push({ source: tag.slice(openEnd, tag.lastIndexOf('<')), offset: offset + openEnd });
    return tag.replace(/[^\n]/g, ' ');
  });
  visible = visible.replace(/<style\b[^>]*>[\s\S]*?<\/style(?:\s+[^>]*)?>/gi, tag => tag.replace(/[^\n]/g, ' '));

  const attributes = /\b(?:aria-label|alt|title|placeholder|value)\s*=\s*(["'])(.*?)\1/gi;
  for (const match of visible.matchAll(attributes)) add(starts, match.index + match[0].indexOf(match[2]), file, match[2]);
  for (const match of visible.matchAll(/>([^<>]+)</g)) add(starts, match.index + 1, file, match[1]);
  for (const script of scripts) scanJavaScript(script.source, file, starts, script.offset);
}

const files = walk(GAME).filter(file => path.relative(GAME, file).replace(/\\/g, '/') !== DATA_FILE);
for (const file of files) {
  const source = fs.readFileSync(file, 'utf8');
  if (path.extname(file).toLowerCase() === '.html') scanHtml(source, file);
  else scanJavaScript(source, file, lineStarts(source));
}

const duplicates = [...matches.entries()]
  .map(([text, locations]) => ({ text, locations: [...new Set(locations)].sort() }))
  .filter(item => new Set(item.locations.map(location => location.slice(0, location.lastIndexOf(':')))).size > 1)
  .sort((a, b) => {
    const fileCount = item => new Set(item.locations.map(location => location.slice(0, location.lastIndexOf(':')))).size;
    return fileCount(b) - fileCount(a) || b.locations.length - a.locations.length || a.text.localeCompare(b.text);
  });

console.log(`Advisory scan: ${files.length} game HTML/JS files; ${duplicates.length} repeated Cyrillic strings across files.`);
for (const item of duplicates) {
  console.log(`${JSON.stringify(item.text)} — ${item.locations.length} occurrences: ${item.locations.join(', ')}`);
}
