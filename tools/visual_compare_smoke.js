const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { comparePixels, decodePng, encodePng } = require('./visual_compare.js');

const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'visual-compare-smoke-'));
let passed = 0;
let failed = 0;

function check(name, fn) {
  try {
    fn();
    passed++;
    console.log(`PASS ${name}`);
  } catch (error) {
    failed++;
    console.error(`FAIL ${name}  [${error.message}]`);
  }
}

try {
  const original = Buffer.from([
    10, 20, 30, 40, 50, 60,
    70, 80, 90, 100, 110, 120,
  ]);
  const encoded = encodePng(2, 2, original);
  const roundTripFile = path.join(temp, 'round-trip.png');
  fs.writeFileSync(roundTripFile, encoded);
  check('PNG encoding round-trips RGB pixels', () => {
    const decoded = decodePng(roundTripFile);
    assert.deepStrictEqual([decoded.width, decoded.height, decoded.channels], [2, 2, 3]);
    assert.deepStrictEqual(decoded.pixels, original);
  });

  const corruptedFile = path.join(temp, 'corrupted.png');
  const corrupted = Buffer.from(encoded);
  corrupted[29] ^= 0xff;
  fs.writeFileSync(corruptedFile, corrupted);
  check('PNG decoder rejects invalid chunk checksums', () => {
    assert.throws(() => decodePng(corruptedFile), /bad IHDR chunk checksum/);
  });

  const baseline = { width: 2, height: 2, channels: 3, pixels: Buffer.alloc(12) };
  const currentPixels = Buffer.alloc(12);
  currentPixels[0] = 40;
  const result = comparePixels(
    baseline,
    { width: 2, height: 2, channels: 3, pixels: currentPixels },
    16,
  );
  check('pixel comparison reports changed percentage and channel delta', () => {
    assert.strictEqual(result.changedPercent, 25);
    assert.strictEqual(result.averageChannelDelta, 40 / 12);
  });

  const diffFile = path.join(temp, 'diff.png');
  fs.writeFileSync(diffFile, result.diffPng);
  check('visual diff marks changed pixels in red', () => {
    const diff = decodePng(diffFile);
    assert.deepStrictEqual([...diff.pixels.subarray(0, 3)], [255, 24, 0]);
    assert.deepStrictEqual([...diff.pixels.subarray(3, 6)], [0, 0, 0]);
  });

  check('pixel comparison detects mismatched dimensions', () => {
    const mismatch = comparePixels(
      baseline,
      { width: 1, height: 2, channels: 3, pixels: Buffer.alloc(6) },
      16,
    );
    assert.match(mismatch.error, /dimensions differ/);
    const mismatchFile = path.join(temp, 'dimension-diff.png');
    fs.writeFileSync(mismatchFile, mismatch.diffPng);
    const diff = decodePng(mismatchFile);
    assert.deepStrictEqual([diff.width, diff.height], [3, 2]);
    assert.deepStrictEqual([...diff.pixels.subarray(6, 9)], [255, 210, 0]);
  });
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exitCode = 1;
