// Node sanity test for the pure logic of art.draft.js (no DOM needed). Run: node proposal/art.draft.test.js
const assert = require('assert');
globalThis.ART_REGISTRY = { '🐮': 'cow', '❤': 'heart' };
require('./art.draft.js');
const A = globalThis.Art;
assert.strictEqual(A.url('🐮'), 'assets/art/cow.webp');
assert.strictEqual(A.url('❤️'), 'assets/art/heart.webp', 'variation selector U+FE0F must be ignored');
assert.strictEqual(A.url('🦖'), null);
assert.strictEqual(A.html('🦖'), '🦖', 'unknown glyph falls back to the emoji');
assert.strictEqual(A.html('<'), '&lt;', 'fallback is escaped');
assert.ok(/^<img class="art big" src="assets\/art\/cow\.webp" alt="" draggable="false">$/.test(A.html('🐮', 'big')));
const calls = []; const ctx = { fillText: (...a) => calls.push(a) };
assert.strictEqual(A.draw(ctx, '🦖', 10, 20, 64), false); assert.strictEqual(calls.length, 1, 'canvas falls back to fillText');
const el = {}; A.fill(el, '🐮'); assert.ok(el.innerHTML.includes('cow.webp'));
console.log('art.draft.js: all 8 checks passed');
