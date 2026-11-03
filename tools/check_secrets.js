/* tools/check_secrets.js — keep credentials, API keys and private keys out of
 * git (task 353).
 *
 * READ-ONLY: it never writes, stages, or "fixes" anything. It lists the files
 * git knows about (`git ls-files`, which includes anything already staged) and
 * refuses the ones that hold a secret. Two layers, for two different accidents:
 *
 *   1. PATH deny-list — files that must never be tracked at all (`.env`,
 *      `*credentials*.json`, `*.pem`, `id_rsa`, `.netrc`, …). These are what
 *      someone adds by reflex with `git add -A`.
 *   2. CONTENT patterns — a secret pasted into a normal tracked file: private
 *      key blocks, AWS/GitHub/Slack/OpenAI/Google key shapes, JWTs, and
 *      `api_key: "…"`-style assignments with a real-looking literal.
 *
 * A third layer catches the case the first two cannot know about: if a local
 * credential file exists (git-ignored `tools/vendor/Cloudflare-credentials.json`
 * by default, or `--credential-file <path>`), every tracked file is checked for
 * those EXACT values. That is the highest-confidence check — it needs no guess
 * about a token's shape — and it is skipped with a note when the file is absent
 * (CI has no credentials, by design).
 *
 * Content is read from the working tree, never through `git cat-file`: this repo
 * is a blob-less partial clone, so reading objects can trigger a lazy network
 * fetch (a 581-file batch hung on the slow link). The file LIST still comes from
 * the index, so a staged file is always in scope.
 *
 * The detectors are self-tested against synthetic samples held in memory — one
 * per detector, plus placeholders that must NOT trip — because a check that
 * cannot fail proves nothing (same rule as check_scan_alerts.js).
 *
 * Usage:  node tools/check_secrets.js              # checks + summary
 *         node tools/check_secrets.js --quiet      # summary only
 *         node tools/check_secrets.js --credential-file tools/vendor/Cloudflare-credentials.json
 * Exit 0 = clean, 1 = at least one secret/credential would be committed.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const QUIET = process.argv.slice(2).includes('--quiet');
const SELF = 'tools/check_secrets.js';
const argv = process.argv.slice(2);
const CRED_ARG = argv.indexOf('--credential-file');
const DEFAULT_CRED = 'tools/vendor/Cloudflare-credentials.json';

// Paths that must never be tracked. `.env.example`/`.env.sample`/`.env.template`
// stay allowed on purpose: they are the documented place to list empty keys.
const PATH_RULES = [
  ['env file', /(^|\/)\.env(?:\.(?!example$|sample$|template$)[^/]*)?$/],
  ['credentials/secrets JSON', /(^|\/)[^/]*(?:credentials?|secrets?)[^/]*\.json$/i],
  ['key material file', /\.(?:pem|pfx|p12|keystore|jks)$/i],
  ['SSH private key', /(^|\/)id_(?:rsa|dsa|ecdsa|ed25519)$/],
  ['machine credential file', /(^|\/)(?:\.netrc|_netrc|\.htpasswd|\.npmrc|\.aws\/credentials)$/]
];

// Prefix match, so `your-api-key-here` and `example_token_1234` pass: they are
// documentation placeholders, not a leaked literal.
const PLACEHOLDER = /^(?:your|xxx+|\$\{|\$\(|<|\.{3}|example|sample|dummy|fake|test|changeme|placeholder|redacted|todo|none|null|undefined)/i;

// High-confidence value shapes. Each entry is [name, regex, groupIndex?].
const VALUE_RULES = [
  ['private key block', /-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----/],
  ['AWS access key id', /\bAKIA[0-9A-Z]{16}\b/],
  ['GitHub token', /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{30,}\b/],
  ['Slack token', /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/],
  ['OpenAI-style key', /\bsk-[A-Za-z0-9_-]{32,}\b/],
  ['Google API key', /\bAIza[0-9A-Za-z_-]{35}\b/],
  ['JWT', /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/],
  [
    'credential assignment',
    /(?:api[_-]?key|api[_-]?token|access[_-]?token|auth[_-]?token|secret[_-]?key|client[_-]?secret|password|passwd)\s*[:=]\s*['"`]([A-Za-z0-9_\-./+=]{16,})['"`]/i,
    1
  ]
];

const BINARY = /\.(?:png|jpe?g|webp|gif|ico|svgz|mp3|ogg|oga|wav|mp4|webm|woff2?|ttf|otf|zip|pack|gz|pdf)$/i;
const MAX_BYTES = 4 * 1024 * 1024;

let checks = 0;
const failures = [];
const notes = [];
function pass(label) {
  checks++;
  if (!QUIET) console.log(`PASS ${label}`);
}
function fail(label, detail) {
  checks++;
  failures.push(label);
  console.log(`FAIL ${label}`);
  for (const line of detail) console.log(`     ${line}`);
}

// ---- the detectors (pure functions, so the self-test can exercise them) -----
function pathViolation(file) {
  for (const [name, re] of PATH_RULES) if (re.test(file)) return name;
  return null;
}
function valueViolations(text) {
  const hits = [];
  text.split(/\r?\n/).forEach((line, i) => {
    for (const [name, re, group] of VALUE_RULES) {
      const m = line.match(re);
      if (!m) continue;
      const value = group ? m[group] : m[0];
      if (group && PLACEHOLDER.test(value)) continue;
      hits.push(`${i + 1}: ${name} (${value.slice(0, 2)}…${value.slice(-2)}, ${value.length} chars)`);
    }
  });
  return hits;
}

// ---- self-test: every detector must trip, placeholders must not ------------
// Samples are assembled from pieces so this file never contains a contiguous
// key-shaped literal itself — a fixture that looks like a real token is exactly
// what GitHub's secret scanning would flag on the commit that adds this guard.
const SAMPLES = [
  ['private key', '-----BEGIN RSA ' + 'PRIVATE KEY-----', true],
  ['aws key', 'const id = "AKIA' + 'IOSFODNN7EXAMPLE";', true],
  ['github token', 'token: "ghp_' + '0123456789abcdefghijklmnopqrstuvwx"', true],
  ['openai key', 'OPENAI_KEY=sk-' + '0123456789abcdefghijklmnopqrstuv', true],
  ['credential assignment', 'const cfg = { apiKey: "Zx8Kq2Lm9Pw4Rt7Yv1Nb" }', true],
  ['placeholder key', 'const cfg = { apiKey: "your-api-key-here" }', false],
  ['short value', 'password: "required"', false]
];
const selfFailures = [];
for (const [name, sample, shouldTrip] of SAMPLES) {
  const tripped = valueViolations(sample).length > 0;
  if (tripped !== shouldTrip) selfFailures.push(`${name}: expected ${shouldTrip ? 'a hit' : 'no hit'}, got ${tripped ? 'a hit' : 'no hit'}`);
}
for (const [name, sample, shouldTrip] of [
  ['.env', '.env', true],
  ['.env.local', 'game/.env.local', true],
  ['.env.example', '.env.example', false],
  ['credentials json', 'resources/foo/my-credentials.json', true],
  ['ssh key', 'deploy/id_ed25519', true],
  ['design tokens css', 'game/styles/design-tokens.css', false]
]) {
  const tripped = pathViolation(sample) === null ? false : true;
  if (tripped !== shouldTrip) selfFailures.push(`path ${name}: expected ${shouldTrip ? 'a hit' : 'no hit'}, got ${tripped ? 'a hit' : 'no hit'}`);
}
if (selfFailures.length) fail('detector self-test', selfFailures);
else pass(`detector self-test (${SAMPLES.length + 6} samples)`);

// ---- the real scan over what git knows about -------------------------------
let files = [];
try {
  files = execSync('git ls-files -z', { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 28 })
    .split('\0')
    .filter(Boolean);
} catch (e) {
  fail('file list (git ls-files)', [String(e.message).split('\n')[0]]);
}

const pathFails = files
  .map((f) => [f, pathViolation(f)])
  .filter(([, why]) => why)
  .map(([f, why]) => `${f} — ${why} must never be tracked`);
if (pathFails.length) fail('path deny-list', pathFails);
else pass(`path deny-list (${files.length} tracked files)`);

const contentFails = [];
let scanned = 0;
let skipped = 0;
for (const file of files) {
  if (file === SELF || BINARY.test(file)) {
    skipped++;
    continue;
  }
  const abs = path.join(ROOT, file);
  let buf;
  try {
    const st = fs.statSync(abs);
    if (st.size > MAX_BYTES) {
      skipped++;
      continue;
    }
    buf = fs.readFileSync(abs);
  } catch {
    skipped++;
    continue;
  }
  if (buf.includes(0)) {
    skipped++;
    continue;
  }
  scanned++;
  for (const hit of valueViolations(buf.toString('utf8'))) contentFails.push(`${file}:${hit}`);
}
if (contentFails.length) fail('secret patterns', contentFails.slice(0, 40));
else pass(`secret patterns (${scanned} text files, ${skipped} binary/skipped)`);

// ---- exact values from the local credential file (the highest confidence) --
const credPath = CRED_ARG >= 0 ? argv[CRED_ARG + 1] : DEFAULT_CRED;
if (!credPath) {
  fail('credential value scan', ['--credential-file needs a path argument']);
} else {
  let values = [];
  try {
    const parsed = JSON.parse(fs.readFileSync(path.join(ROOT, credPath), 'utf8').replace(/^\uFEFF/, ''));
    values = Object.entries(parsed)
      .filter(([, v]) => typeof v === 'string' && v.length >= 16)
      .map(([k, v]) => [k, v]);
  } catch {
    notes.push(`${credPath} not present — exact-value scan skipped (expected in CI)`);
  }
  if (!values.length) {
    pass(`local credential values (none to compare — ${credPath} absent)`);
  } else {
    const localFails = [];
    for (const file of files) {
      if (file === SELF || BINARY.test(file)) continue;
      const abs = path.join(ROOT, file);
      let text;
      try {
        const st = fs.statSync(abs);
        if (st.size > MAX_BYTES) continue;
        text = fs.readFileSync(abs, 'utf8');
      } catch {
        continue;
      }
      for (const [key, value] of values) {
        if (text.includes(value)) localFails.push(`${file} contains the real ${key} from ${credPath}`);
      }
    }
    if (localFails.length) fail('local credential values', localFails);
    else pass(`local credential values (${values.length} values, ${files.length} files)`);
  }
}

console.log('');
for (const note of notes) console.log(`note: ${note}`);
if (failures.length) {
  console.log(`${failures.length} of ${checks} checks FAILED: ${failures.join(', ')}`);
  console.log('Remove the secret from the file (and from history if it was pushed), then rotate it.');
  process.exit(1);
}
console.log(`All ${checks} secret checks passed.`);
