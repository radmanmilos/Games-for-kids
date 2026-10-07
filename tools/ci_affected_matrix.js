/* tools/ci_affected_matrix.js — compute the CI smoke matrix from the files
 * changed since the base of this push/PR, instead of always running the whole
 * battery (task: "run only the affected jobs").
 *
 * The selection logic lives in tools/run_all.js --affected <base>, which maps
 * changed files through the same game-file -> smoke mapping as --since, and
 * escalates harness/pipeline changes to the WHOLE battery. This script only
 * answers two questions CI cannot derive by itself:
 *   1. what is the diff base?  push -> github.event.before,
 *      pull_request -> github.event.pull_request.base.sha,
 *      schedule / workflow_dispatch -> no base (full battery).
 *   2. hub_smoke is filtered out of the matrix because the fast job runs it.
 *
 * A docs-only push has no selected smokes. GitHub Actions cannot expand an
 * empty matrix, so the workflow receives a guarded placeholder plus
 * has_smokes=false; the smoke job is skipped before its placeholder can run.
 * The weekly schedule and manual dispatch still run the full battery.
 *
 * Usage (CI setup job):
 *   node tools/ci_affected_matrix.js            # writes smokes=<json> to GITHUB_OUTPUT
 *   node tools/ci_affected_matrix.js --stdout   # print the matrix, no GITHUB_OUTPUT
 * An empty selection is represented by a guarded placeholder in GITHUB_OUTPUT.
 * Failures to run or decode the selector fail visibly.
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const RUN_ALL = path.join(ROOT, 'tools', 'run_all.js');
const STDOUT_ONLY = process.argv.slice(2).includes('--stdout');

/* The diff base for this event, or null for a full-battery run. The all-zero
   SHA GitHub uses for the first push to a branch would make git throw, so it is
   treated as "no base" — and the all-zero fallback inside run_all's git catch
   would otherwise silently degrade to the whole battery anyway. */
function eventBase() {
  const name = process.env.GITHUB_EVENT_NAME || '';
  if (name !== 'push' && name !== 'pull_request') return null;
  let evt;
  try {
    evt = JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'));
  } catch (e) {
    return null;
  }
  const sha = name === 'push'
    ? evt && evt.before
    : evt && evt.pull_request && evt.pull_request.base && evt.pull_request.base.sha;
  if (sha && /^[0-9a-f]{40}$/.test(sha) && !/^0+$/.test(sha)) return sha;
  return null;
}

function compute() {
  const base = eventBase();
  const args = base ? ['--affected', base, '--list', '--json'] : ['--list', '--json'];
  const battery = JSON.parse(execFileSync(process.execPath, [RUN_ALL, ...args], {
    encoding: 'utf8',
    cwd: ROOT,
    timeout: 60000
  }));
  const matrix = battery.filter(n => n !== 'hub_smoke.js');
  return { base, battery, matrix };
}

const { base, battery, matrix } = compute();
const scope = base ? 'affected vs ' + base.slice(0, 10) : 'full battery (no base)';
if (STDOUT_ONLY) {
  console.log(JSON.stringify(matrix));
} else {
  if (process.env.GITHUB_OUTPUT) {
    const workflowMatrix = matrix.length ? matrix : ['__no_affected_smokes__'];
    fs.appendFileSync(process.env.GITHUB_OUTPUT,
      'smokes=' + JSON.stringify(workflowMatrix) + '\n' +
      'has_smokes=' + String(matrix.length > 0) + '\n');
  } else {
    console.log(JSON.stringify(matrix));
  }
}
console.log(`ci_affected_matrix: ${scope} -> ${battery.length} tools selected, ${matrix.length} smoke legs (hub runs in the fast job)`);