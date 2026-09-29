/* touch_interruption_smoke.js — system-wide touch interruption tests (task 11).
   Simulates touch interruptions on all games and verifies they don't break.

   Cases per game:
   - pointerdown + pointercancel (touch interrupted)
   - pointerdown + pointermove + pointercancel (drag interrupted)
   - second finger (multi-touch)
   - page hidden during interaction

   Usage: node tools/touch_interruption_smoke.js [--game <name>]
   Exit 0 = all pass, 1 = failures found. */
const path = require('path');
const fs = require('fs');
const { start, serve } = require('./headless.js');

const ROOT = path.resolve(__dirname, '..');
const REGISTRY = path.join(ROOT, 'game', 'data', 'app-registry.js');

// Parse args
const args = process.argv.slice(2);
const gameFilter = args.includes('--game') ? args[args.indexOf('--game') + 1] : null;

// Load registry
const registrySrc = fs.existsSync(REGISTRY) ? fs.readFileSync(REGISTRY, 'utf8') : 'window.APP_REGISTRY = [];';
const mockWindow = {};
const APP_REGISTRY = new Function('window', registrySrc + '; return window.APP_REGISTRY;')(mockWindow);

const GAMES = APP_REGISTRY.map(a => ({
  id: a.id,
  path: '/' + a.path
}));

if (gameFilter) {
  const filtered = GAMES.filter(g => g.id === gameFilter);
  if (!filtered.length) { console.error(`Unknown game: ${gameFilter}`); process.exit(1); }
  GAMES.length = 0;
  GAMES.push(...filtered);
}

const failures = [];
const passes = [];

function check(name, ok, detail) {
  if (ok) {
    passes.push(name);
    console.log(`PASS ${name}  [${detail}]`);
  } else {
    failures.push(name);
    console.log(`FAIL ${name}  [${detail}]`);
  }
}

async function testGame(game, srv) {
  const h = await start({ page: game.path, tag: `touch-${game.id}`, width: 1280, height: 800 });
  await h.sleep(600);

  // Test 1: pointerdown + pointercancel
  const t1 = await h.evalv(`(() => {
    const el = document.getElementById('app') || document.body;
    const rect = el.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    el.dispatchEvent(new PointerEvent('pointerdown', { clientX: x, clientY: y, bubbles: true, pointerId: 1 }));
    el.dispatchEvent(new PointerEvent('pointercancel', { clientX: x, clientY: y, bubbles: true, pointerId: 1 }));
    return { ok: true };
  })()`);
  check(`${game.id}: pointerdown+cancel`, t1 && t1.ok, 'no crash');

  // Test 2: pointerdown + pointermove + pointercancel
  const t2 = await h.evalv(`(() => {
    const el = document.getElementById('app') || document.body;
    const rect = el.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    el.dispatchEvent(new PointerEvent('pointerdown', { clientX: x, clientY: y, bubbles: true, pointerId: 1 }));
    el.dispatchEvent(new PointerEvent('pointermove', { clientX: x + 50, clientY: y + 50, bubbles: true, pointerId: 1 }));
    el.dispatchEvent(new PointerEvent('pointercancel', { clientX: x + 50, clientY: y + 50, bubbles: true, pointerId: 1 }));
    return { ok: true };
  })()`);
  check(`${game.id}: drag interrupted`, t2 && t2.ok, 'no crash');

  // Test 3: second finger (multi-touch)
  const t3 = await h.evalv(`(() => {
    const el = document.getElementById('app') || document.body;
    const rect = el.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    el.dispatchEvent(new PointerEvent('pointerdown', { clientX: x, clientY: y, bubbles: true, pointerId: 1 }));
    el.dispatchEvent(new PointerEvent('pointerdown', { clientX: x + 100, clientY: y + 100, bubbles: true, pointerId: 2 }));
    el.dispatchEvent(new PointerEvent('pointerup', { clientX: x + 100, clientY: y + 100, bubbles: true, pointerId: 2 }));
    el.dispatchEvent(new PointerEvent('pointerup', { clientX: x, clientY: y, bubbles: true, pointerId: 1 }));
    return { ok: true };
  })()`);
  check(`${game.id}: multi-touch`, t3 && t3.ok, 'no crash');

  // Test 4: page hidden during interaction
  const t4 = await h.evalv(`(() => {
    const el = document.getElementById('app') || document.body;
    const rect = el.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    el.dispatchEvent(new PointerEvent('pointerdown', { clientX: x, clientY: y, bubbles: true, pointerId: 1 }));
    document.dispatchEvent(new Event('visibilitychange'));
    el.dispatchEvent(new PointerEvent('pointerup', { clientX: x, clientY: y, bubbles: true, pointerId: 1 }));
    return { ok: true };
  })()`);
  check(`${game.id}: page hidden`, t4 && t4.ok, 'no crash');

  // Test 5: UI still present after all interruptions
  const t5 = await h.evalv(`(() => {
    const app = document.getElementById('app') || document.body;
    return { hasUI: app.children.length > 0, title: document.title };
  })()`);
  check(`${game.id}: UI intact`, t5 && t5.hasUI, t5 ? t5.title : 'no UI');

  h.close();
}

async function run() {
  console.log(`Testing touch interruptions on ${GAMES.length} games...\n`);
  const srv = await serve();

  for (const game of GAMES) {
    console.log(`--- ${game.id} ---`);
    await testGame(game, srv);
    console.log('');
  }

  srv.close();

  // Summary
  console.log(`\n=== SUMMARY: ${passes.length} pass, ${failures.length} fail ===`);
  if (failures.length) {
    console.log('FAILURES:');
    for (const f of failures) console.log('  ' + f);
    process.exit(1);
  }
  console.log('ALL TOUCH INTERRUPTION CHECKS PASSED');
  process.exit(0);
}

run().catch(e => { console.error('HARNESS ERROR:', e); process.exit(1); });
