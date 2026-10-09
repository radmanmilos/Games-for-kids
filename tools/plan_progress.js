#!/usr/bin/env node
/* Terminal status line for the Visual/UX plan — task 218.
 *
 * Parses VISUAL_UX_IMPLEMENTATION_PLAN.md (the execution table) and prints:
 *
 *   [████████░░░░░░░░░░░░░░░░] 14/42 (33%) · current: V3.2 (Phase 3 …) — Fix every failure …
 *
 * Derived from the plan file itself, so it is always current: marking a row
 * DONE in the plan is what moves the bar. Constraint rows (status starting
 * with "constraint") are guidance, not work, and are excluded from totals.
 *
 * Run: node tools/plan_progress.js
 */
'use strict';

const fs = require('fs');
const path = require('path');

const PLAN = path.join(__dirname, '..', 'VISUAL_UX_IMPLEMENTATION_PLAN.md');

const md = fs.readFileSync(PLAN, 'utf8');
let phase = '(no phase)';
const tasks = [];
for (const line of md.split(/\r?\n/)) {
  const h = line.match(/^###\s+(.*)/);
  if (h) { phase = h[1].trim(); continue; }
  if (!/^\|\s*\*\*V[^*]+\*\*\s*\|/.test(line)) continue;
  const cells = line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|');
  const status = (cells[cells.length - 1] || '').trim();
  if (/^constraint/i.test(status)) continue;
  tasks.push({
    id: (line.match(/^\|\s*\*\*(V[^*]+)\*\*/) || [])[1].trim(),
    phase,
    desc: cells.length > 2 ? cells.slice(1, -1).join('|').trim() : '',
    done: /^\*{0,2}DONE\b/.test(status),
  });
}

if (!tasks.length) {
  console.error('plan_progress: no plan rows found in ' + PLAN + ' — parser rot?');
  process.exit(1);
}

const doneN = tasks.filter(t => t.done).length;
const current = tasks.find(t => !t.done);
const total = tasks.length;
const pct = Math.round((doneN / total) * 100);

const WIDTH = 24;
const fill = Math.round((doneN / total) * WIDTH);
const tty = Boolean(process.stdout.isTTY) && !process.env.NO_COLOR;
const paint = (s, code) => (tty ? `\x1b[${code}m${s}\x1b[0m` : s);
const bar = paint('█'.repeat(fill), '32') + paint('░'.repeat(WIDTH - fill), '2');

function shorten(s, max) {
  const text = s
    .replace(/\s+/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[`*_]/g, '')
    .trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return cut.slice(0, cut.lastIndexOf(' ') + 1).replace(/[,:;]$/, '') + '…';
}

let line = `[${bar}] ${paint(doneN + '/' + total, '1;32')} (${pct}%) · current: `;
if (current) {
  line += `${paint(current.id, '1;36')} (${shorten(current.phase, 44)}) — ${shorten(current.desc, 88)}`;
} else {
  line += paint('plan complete — all tasks DONE', '1;32');
}
console.log(line);
