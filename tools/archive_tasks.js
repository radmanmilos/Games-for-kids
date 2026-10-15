#!/usr/bin/env node
/* Archive finished tasks.
 * Moves DONE / FIXED / REVERTED / ABANDONED / RETIRED entries from project/tasks/ACTIVE.md into
 * archive/tasks/tasks-<range>.md (verbatim) and appends one line per task to project/tasks/INDEX.md.
 * DEFERRED / NEW / IN PROGRESS entries stay in ACTIVE.md.
 *
 * Usage:  node tools/archive_tasks.js [--dry-run]
 * Test:   ARCHIVE_ROOT=<temp copy of the repo> node tools/archive_tasks.js
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = process.env.ARCHIVE_ROOT || path.join(__dirname, '..');
const DRY = process.argv.includes('--dry-run');
const ACTIVE = path.join(ROOT, 'project', 'tasks', 'ACTIVE.md');
const INDEX = path.join(ROOT, 'project', 'tasks', 'INDEX.md');
const ARCH = path.join(ROOT, 'archive', 'tasks');
const TERMINAL = new Set(['DONE', 'FIXED', 'REVERTED', 'ABANDONED', 'RETIRED']);
const ENTRY = /^- (\d+)\. ([A-Z][A-Z \/]*?)(?:\s*\([^)]*\))?\s+\u2014\s+(.*)$/;

function rangeFor(n) {
  if (n <= 99) return '001-099';
  if (n <= 199) return '100-199';
  if (n <= 249) return '200-249';
  const base = Math.floor(n / 100) * 100;
  return `${Math.max(250, base)}-${base + 99}`;
}
const clean = (s) => s.replace(/\*\*|`/g, '').replace(/\s+/g, ' ').trim();

const text = fs.readFileSync(ACTIVE, 'utf8');
const lines = text.split('\n');
const open = lines.findIndex((l) => l.startsWith('## Open tasks'));
if (open < 0) { console.error('ACTIVE.md has no "## Open tasks" heading'); process.exit(1); }

const starts = [];
for (let i = open + 1; i < lines.length; i++) if (ENTRY.test(lines[i])) starts.push(i);
const moved = [];
const keep = lines.slice(0, starts.length ? starts[0] : lines.length);
starts.forEach((s, k) => {
  const end = k + 1 < starts.length ? starts[k + 1] : lines.length;
  const block = lines.slice(s, end);
  const m = ENTRY.exec(block[0]);
  if (TERMINAL.has(m[2])) moved.push({ n: Number(m[1]), status: m[2], title: m[3], block });
  else keep.push(...block);
});

if (!moved.length) { console.log('archive_tasks: nothing to archive.'); process.exit(0); }

const date = (b) => { for (const t of b.slice(0, 3)) { const d = /\d{4}-\d{2}-\d{2}/.exec(t); if (d) return d[0]; } return '-'; };
const rows = [];
const perFile = {};
moved.sort((a, b) => a.n - b.n).forEach((t) => {
  const file = `tasks-${rangeFor(t.n)}.md`;
  (perFile[file] = perFile[file] || []).push(t);
  let title = clean(t.title);
  if (title.length > 110) title = title.slice(0, 110).replace(/\s+\S*$/, '') + '\u2026';
  rows.push(`${t.n} | ${t.status} | ${date(t.block)} | ${title} | ${file}`);
});

if (DRY) { console.log('archive_tasks (dry run) would move:\n' + rows.join('\n')); process.exit(0); }

fs.mkdirSync(ARCH, { recursive: true });
for (const [file, tasks] of Object.entries(perFile)) {
  const p = path.join(ARCH, file);
  let out = fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : `# Archived tasks ${file.slice(6, -3)}\n\nEntries moved verbatim from project/tasks/ACTIVE.md by tools/archive_tasks.js.\n\n`;
  for (const t of tasks) out += t.block.join('\n').replace(/\n+$/, '') + '\n\n';
  fs.writeFileSync(p, out);
}
let idx = fs.readFileSync(INDEX, 'utf8').replace(/\n*$/, '\n') + rows.join('\n') + '\n';
const openNums = keep.map((l) => ENTRY.exec(l)).filter(Boolean).map((m) => Number(m[1]));
const max = Math.max(...idx.split('\n').map((l) => parseInt(l, 10)).filter(Number.isFinite), ...openNums);
idx = idx.replace(/The next task number is \*\*\d+\*\*/, `The next task number is **${max + 1}**`);
fs.writeFileSync(INDEX, idx);
fs.writeFileSync(ACTIVE, keep.join('\n').replace(/\n*$/, '\n'));
console.log(`archive_tasks: moved ${moved.length} task(s): ${moved.map((t) => '#' + t.n).join(', ')}. Next task number: ${max + 1}.`);
