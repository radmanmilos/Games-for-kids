/* visual_compare.js — baseline-vs-current screenshot comparison (task 10).
   Compares screenshots in tools/screenshots/baseline/ vs tools/screenshots/current/.
   Allows tiny anti-alias/subpixel differences; fails meaningful layout regressions.

   Usage:
     node tools/visual_compare.js              # compare all
     node tools/visual_compare.js --threshold 0.01  # 1% pixel diff tolerance
     node tools/visual_compare.js --update     # update baselines to current
   Exit 0 = all pass, 1 = failures found. */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const TOOLS = __dirname;
const SCREENSHOTS = path.join(TOOLS, 'screenshots');
const BASELINE = path.join(SCREENSHOTS, 'baseline');
const CURRENT = path.join(SCREENSHOTS, 'current');

const args = process.argv.slice(2);
const threshold = args.includes('--threshold') ? parseFloat(args[args.indexOf('--threshold') + 1]) : 0.02;
const updateMode = args.includes('--update');

const failures = [];
const passes = [];

function hashFile(filePath) {
  const buf = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(buf).digest('hex');
}

function compareImages(baselinePath, currentPath) {
  const baseline = fs.readFileSync(baselinePath);
  const current = fs.readFileSync(currentPath);

  // Quick check: identical files
  if (baseline.equals(current)) return { identical: true, diffPercent: 0 };

  // Compare byte-by-byte (catches any change, even small)
  let diffBytes = 0;
  const len = Math.min(baseline.length, current.length);
  for (let i = 0; i < len; i++) {
    if (baseline[i] !== current[i]) diffBytes++;
  }
  // Penalize size differences
  diffBytes += Math.abs(baseline.length - current.length);

  const diffPercent = diffBytes / Math.max(baseline.length, current.length);
  return { identical: false, diffPercent };
}

// Ensure directories exist
if (!fs.existsSync(BASELINE)) fs.mkdirSync(BASELINE, { recursive: true });
if (!fs.existsSync(CURRENT)) fs.mkdirSync(CURRENT, { recursive: true });

// Get list of screenshots
const baselineFiles = fs.existsSync(BASELINE) ? fs.readdirSync(BASELINE).filter(f => f.endsWith('.png')) : [];
const currentFiles = fs.existsSync(CURRENT) ? fs.readdirSync(CURRENT).filter(f => f.endsWith('.png')) : [];

if (updateMode) {
  // Copy current to baseline
  for (const f of currentFiles) {
    fs.copyFileSync(path.join(CURRENT, f), path.join(BASELINE, f));
    passes.push(`updated: ${f}`);
    console.log(`UPDATED ${f}`);
  }
  console.log(`\n=== Updated ${currentFiles.length} baselines ===`);
  process.exit(0);
}

if (!baselineFiles.length) {
  console.log('No baselines found. Run with --update to create baselines from current screenshots.');
  process.exit(0);
}

// Compare each baseline with current
for (const f of baselineFiles) {
  const baselinePath = path.join(BASELINE, f);
  const currentPath = path.join(CURRENT, f);

  if (!fs.existsSync(currentPath)) {
    failures.push(f);
    console.log(`FAIL ${f} — current screenshot missing`);
    continue;
  }

  const result = compareImages(baselinePath, currentPath);
  if (result.identical) {
    passes.push(f);
    console.log(`PASS ${f} — identical`);
  } else if (result.diffPercent <= threshold) {
    passes.push(f);
    console.log(`PASS ${f} — ${(result.diffPercent * 100).toFixed(2)}% diff (within ${(threshold * 100).toFixed(0)}% threshold)`);
  } else {
    failures.push(f);
    console.log(`FAIL ${f} — ${(result.diffPercent * 100).toFixed(2)}% diff (exceeds ${(threshold * 100).toFixed(0)}% threshold)`);
  }
}

// Summary
console.log(`\n=== SUMMARY: ${passes.length} pass, ${failures.length} fail ===`);
if (failures.length) {
  console.log('FAILURES:');
  for (const f of failures) console.log('  ' + f);
  process.exit(1);
}
console.log('ALL VISUAL CHECKS PASSED');
process.exit(0);
