#!/usr/bin/env node
/* Doc guard (part of check_fast). Keeps the startup docs small and the live docs linked.
 *  - FAIL when a budgeted file is over its size budget (move finished/historic text to archive/ instead of raising a number)
 *  - FAIL on a dead relative markdown link in a live doc
 *  - WARN (non-fatal) when project/tasks/ACTIVE.md still lists finished tasks (run `node tools/archive_tasks.js`)
 * Usage: node tools/check_docs.js [--quiet] [--selftest]
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const KB = 1024;
const BUDGETS = {
  'AGENTS.md': 16 * KB,
  'README.md': 18 * KB,
  'CONTRIBUTING.md': 8 * KB,
  'project/STATUS.md': 6 * KB,
  'project/tasks/ACTIVE.md': 20 * KB,
};
const TERMINAL = /^- \d+\. (DONE|FIXED|REVERTED|ABANDONED|RETIRED)\b/;
const LINK = /\]\(([^)\s]+)\)/g;

function liveDocs(root) {
  const out = ['README.md', 'AGENTS.md', 'ROADMAP.md', 'CONTRIBUTING.md', 'tools/README.md'];
  (function walk(dir) {
    const abs = path.join(root, dir);
    if (!fs.existsSync(abs)) return;
    for (const e of fs.readdirSync(abs, { withFileTypes: true })) {
      const rel = path.posix.join(dir, e.name);
      if (e.isDirectory()) walk(rel);
      else if (e.name.endsWith('.md') && rel !== 'project/tasks/INDEX.md') out.push(rel);
    }
  })('project');
  return out.filter((f) => fs.existsSync(path.join(root, f)));
}

function check(root, read = (f) => fs.readFileSync(path.join(root, f), 'utf8'), size = (f) => Buffer.byteLength(read(f))) {
  const fails = [];
  const warns = [];
  for (const [f, max] of Object.entries(BUDGETS)) {
    if (!fs.existsSync(path.join(root, f))) { fails.push(`${f}: missing`); continue; }
    const n = size(f);
    if (n > max) fails.push(`${f}: ${n} B is over its ${max} B budget (move finished/historic text to archive/)`);
  }
  for (const f of liveDocs(root)) {
    let inFence = false;
    read(f).split('\n').forEach((line, i) => {
      if (line.startsWith('```')) inFence = !inFence;
      if (inFence) return;
      for (const m of line.matchAll(LINK)) {
        const t = m[1];
        if (/^(https?:|mailto:|#)/.test(t)) continue;
        const target = decodeURIComponent(t.split('#')[0]);
        if (!target) continue;
        if (!fs.existsSync(path.join(root, path.dirname(f), target))) fails.push(`${f}:${i + 1}: dead link -> ${t}`);
      }
    });
  }
  const act = 'project/tasks/ACTIVE.md';
  if (fs.existsSync(path.join(root, act))) {
    const done = read(act).split('\n').filter((l) => TERMINAL.test(l)).length;
    if (done) warns.push(`${act}: ${done} finished task(s) still listed; run node tools/archive_tasks.js`);
  }
  return { fails, warns };
}

function selftest() {
  const tmp = fs.mkdtempSync(path.join(require('os').tmpdir(), 'check_docs_'));
  const w = (f, s) => { fs.mkdirSync(path.dirname(path.join(tmp, f)), { recursive: true }); fs.writeFileSync(path.join(tmp, f), s); };
  for (const f of Object.keys(BUDGETS)) w(f, '# ok\n');
  w('project/tasks/INDEX.md', '1 | DONE | - | x | y\n');
  let bad = 0;
  const expect = (name, cond) => { if (!cond) { bad++; console.log('SELFTEST FAIL: ' + name); } };
  expect('clean tree passes', check(tmp).fails.length === 0 && check(tmp).warns.length === 0);
  w('AGENTS.md', 'x'.repeat(BUDGETS['AGENTS.md'] + 1));
  expect('over-budget file fails', check(tmp).fails.some((m) => m.startsWith('AGENTS.md')));
  w('AGENTS.md', '# ok\n');
  w('README.md', 'see [gone](nowhere/missing.md)\n');
  expect('dead link fails', check(tmp).fails.some((m) => m.includes('dead link')));
  w('README.md', '```\n[x](nowhere/missing.md)\n```\n[ok](AGENTS.md) [web](https://example.com) [a](#anchor)\n');
  expect('links in code fences / urls / anchors are ignored', check(tmp).fails.length === 0);
  w('project/tasks/ACTIVE.md', '## Open tasks\n- 5. DONE \u2014 finished\n');
  expect('finished task only warns', check(tmp).fails.length === 0 && check(tmp).warns.length === 1);
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log(bad ? `check_docs selftest: ${bad} FAILED` : 'check_docs selftest: 5 checks OK');
  process.exit(bad ? 1 : 0);
}

if (process.argv.includes('--selftest')) selftest();
const quiet = process.argv.includes('--quiet');
const { fails, warns } = check(ROOT);
for (const w of warns) console.log('WARN ' + w);
if (fails.length) { for (const f of fails) console.log('FAIL ' + f); console.log(`check_docs: ${fails.length} problem(s)`); process.exit(1); }
if (!quiet) console.log(`check_docs: OK (${Object.keys(BUDGETS).length} budgets, ${liveDocs(ROOT).length} live docs link-checked)`);
