/* tools/validate_workflow.js — R5 (task 165): validate .github/workflows/ci.yml.
 *
 * Read-only. Guards the two CI-topology faults that task 164 found, each of
 * which lets the pipeline report success while testing nothing:
 *
 *   1. a step invokes a `node tools/...` script that does not exist. The old
 *      workflow ran the deleted `tools/touch_interruption_smoke.js`, so the
 *      release job failed on EVERY push while the matrix quietly covered only
 *      16 of 24 tools.
 *   2. a job reads `needs.<job>.outputs.<x>` while that job is not in its own
 *      `needs:` list. The `needs` context exposes DIRECT dependencies only, so
 *      the reference resolves to an empty string, `fromJSON('')` throws, and
 *      the whole matrix job never runs — on a green-looking pipeline.
 *
 * Plus a few invariants R4 depends on, because each is a way for CI to
 * silently stop doing its job.
 *
 * Usage:  node tools/validate_workflow.js           # validate + summary
 *         node tools/validate_workflow.js --quiet   # exit code only
 * Exit 0 = all checks passed, 1 = failures.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const WORKFLOW = path.join(ROOT, '.github', 'workflows', 'ci.yml');
const QUIET = process.argv.slice(2).includes('--quiet');

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

if (!fs.existsSync(WORKFLOW)) {
  console.error(`FAIL ci.yml exists  [missing: ${path.relative(ROOT, WORKFLOW)}]`);
  process.exit(1);
}

const y = fs.readFileSync(WORKFLOW, 'utf8');
const lines = y.split(/\r?\n/);

// ---------------------------------------------------------------------------
// Parse the top-level job map. Deliberately not a full YAML parser: this file
// is ours, it uses a fixed 2-space job indent, and a dependency-free reader
// keeps the check runnable with zero installs (same rule as the rest of tools/).
// ---------------------------------------------------------------------------
function parseJobs(text) {
  const jobs = {};
  const rows = text.split(/\r?\n/);
  const start = rows.findIndex((l) => l === 'jobs:');
  if (start < 0) return null;
  let current = null;
  for (let i = start + 1; i < rows.length; i++) {
    const header = rows[i].match(/^ {2}([A-Za-z0-9_-]+):\s*$/);
    if (header) {
      current = header[1];
      jobs[current] = [];
      continue;
    }
    if (current) jobs[current].push(rows[i]);
  }
  return jobs;
}

const jobs = parseJobs(y);

// 1. Every `node tools/<script>` the workflow invokes must exist on disk.
const referenced = new Set();
for (const m of y.matchAll(/node tools\/([\w.${}-]+)/g)) {
  const name = m[1];
  if (name.includes('$') || name.includes('{')) continue; // matrix expression
  referenced.add(name);
}
const missing = [...referenced].filter((f) => !fs.existsSync(path.join(ROOT, 'tools', f)));
check(
  'every tools/ script the workflow invokes exists',
  missing.length === 0,
  missing.length ? `missing: ${missing.join(', ')}` : `${referenced.size} referenced, all present`
);

// 2. Every needs.<job>.outputs read must be a DIRECT dependency of that job.
const jobNames = Object.keys(jobs || {});
const indirect = [];
for (const [name, body] of Object.entries(jobs || {})) {
  const text = body.join('\n');
  const declaredLine = (text.match(/^\s+needs:\s*(.*)$/m) || [])[1] || '';
  const direct = [...declaredLine.matchAll(/[\w-]+/g)].map((m) => m[0]);
  const used = new Set([...text.matchAll(/needs\.([\w-]+)\.outputs/g)].map((m) => m[1]));
  for (const dep of used) {
    if (!direct.includes(dep)) {
      indirect.push(`${name} reads needs.${dep}.outputs but its needs are [${direct.join(', ') || 'none'}]`);
    }
  }
  for (const dep of direct) {
    if (!jobNames.includes(dep)) indirect.push(`${name} needs unknown job ${dep}`);
  }
}
check(
  'every needs.<job>.outputs read is a direct dependency',
  indirect.length === 0,
  indirect.length ? indirect.join('; ') : `${jobNames.length} jobs, no indirect output reads`
);

// 3. Structure R4 relies on.
check('no tab characters (YAML forbids them for indentation)', !/\t/.test(y), /\t/.test(y) ? 'tab found' : 'clean');
check('no CR characters (the workflow must stay LF)', !y.includes('\r'), y.includes('\r') ? 'CR found' : 'LF only');
const expressions = (y.match(/\$\{\{/g) || []).length;
const closers = (y.match(/\}\}/g) || []).length;
check('${{ }} expressions are balanced', expressions === closers && expressions > 0, `${expressions} open / ${closers} close`);

const noRunsOn = jobNames.filter((j) => !/^\s+runs-on:/m.test(jobs[j].join('\n')));
check('every job declares runs-on', noRunsOn.length === 0, noRunsOn.length ? `missing: ${noRunsOn.join(', ')}` : `${jobNames.length} jobs`);

// Every step must be one of: name / uses / run. A bare list item is a typo.
const badSteps = [];
for (const [name, body] of Object.entries(jobs || {})) {
  for (const row of body) {
    const t = row.trim();
    if (!t.startsWith('- ')) continue;
    if (/^-\s+(name|uses|run):/.test(row.replace(/^\s+/, ''))) continue;
    badSteps.push(`${name}: ${t}`);
  }
}
check('every workflow step has uses: or run:', badSteps.length === 0, badSteps.length ? badSteps.join('; ') : 'all steps well-formed');

// 4. The matrix must be generated from the battery, never hand-listed — that
//    hand-listing is what left 8 tools unrun. And fail-fast must be off, which
//    is R4's central rule: one game must never hide the others.
const matrixGenerated = /fromJSON\(needs\.setup\.outputs\.\w+\)/.test(y);
check('smoke matrix is generated from the setup job output', matrixGenerated, matrixGenerated ? 'fromJSON(needs.setup.outputs...)' : 'hand-listed or missing');
check('matrix uses fail-fast: false (one failure must not hide the others)', /fail-fast:\s*false/.test(y), /fail-fast:\s*false/.test(y) ? 'present' : 'missing');

// The battery is no longer derived inline in the workflow: the setup job calls
// tools/ci_affected_matrix.js, and the helper must still derive the battery
// from `run_all --list --json` rather than hand-listing it. --affected needs
// the diff base SHA on disk, so full history must be checked out.
const setupBody = jobs && jobs.setup ? jobs.setup.join('\n') : '';
const matrixHelper = /ci_affected_matrix\.js/.test(setupBody);
check('setup job computes the matrix via tools/ci_affected_matrix.js', matrixHelper, matrixHelper ? 'present' : 'missing');
const fullHistory = /fetch-depth:\s*0/.test(setupBody);
check('setup job checks out full history (fetch-depth: 0) so the diff base SHA exists', fullHistory, fullHistory ? 'present' : 'missing');
const helperSrc = fs.readFileSync(path.join(ROOT, 'tools', 'ci_affected_matrix.js'), 'utf8');
const helperDerives = /run_all\.js/.test(helperSrc) && /'--list'/.test(helperSrc) && /'--json'/.test(helperSrc);
check('ci_affected_matrix.js derives the battery from run_all --list --json', helperDerives, helperDerives ? '--list --json argv present' : 'missing --list/--json argv');
const helperFiltersHub = /'hub_smoke\.js'/.test(helperSrc);
check('ci_affected_matrix.js excludes hub_smoke (the fast job runs it)', helperFiltersHub, helperFiltersHub ? 'filter present' : 'missing hub_smoke filter');
const hasSmokesOutput = /has_smokes:\s*\$\{\{\s*steps\.matrix\.outputs\.has_smokes\s*\}\}/.test(setupBody);
check('setup exports whether the affected matrix has smoke legs', hasSmokesOutput, hasSmokesOutput ? 'has_smokes output wired' : 'missing output');
const smokeJob = jobs && jobs.smoke ? jobs.smoke.join('\n') : '';
const smokeJobGated = /if:\s*needs\.setup\.outputs\.has_smokes\s*==\s*'true'/.test(smokeJob);
check('smoke job gates off the placeholder for an empty selection', smokeJobGated, smokeJobGated ? 'gated on has_smokes' : 'missing empty-selection guard');
const emptySelectionHandled = /__no_affected_smokes__/.test(helperSrc) &&
  /has_smokes=' \+ String\(matrix\.length > 0\)/.test(helperSrc);
check('matrix helper uses a guarded placeholder for an empty selection', emptySelectionHandled,
  emptySelectionHandled ? 'non-empty matrix + false gate' : 'missing placeholder or false gate');

// 5. The expensive browser matrix must not run on every push.
const extendedJob = jobs && jobs.extended ? jobs.extended.join('\n') : '';
const extendedGated = /workflow_dispatch|schedule/.test(extendedJob);
check('extended (browser matrix) job is manual/schedule only', extendedGated, extendedGated ? 'gated' : 'would run on every push');

if (QUIET) {
  if (failures.length) {
    console.error(`validate_workflow: ${failures.length} of ${checks} checks FAILED`);
    for (const f of failures) console.error('  ' + f);
  }
} else if (failures.length) {
  console.log(`\n${failures.length} of ${checks} workflow checks FAILED.`);
  for (const f of failures) console.log('  ' + f);
} else {
  console.log(`\nAll ${checks} workflow checks passed.`);
}
process.exit(failures.length ? 1 : 0);
