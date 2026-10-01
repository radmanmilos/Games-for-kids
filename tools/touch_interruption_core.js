/* tools/touch_interruption_core.js — shared logic for the touch-interruption
   shards (task 156). NOT a smoke itself: the file name does not end in
   _smoke.js, so run_all does not pick it up.

   This test was one 85-check tool that opened all 17 games in a single
   process, booting 17 Chromes back to back. It was ~22% of the whole suite's
   wall time and one host restart could throw all of it away. It is now split
   across touch_interruption_{a..d}_smoke.js, which run_all schedules in
   parallel with everything else and which the --resume checkpoints treat
   independently.

   Usage: node touch_interruption_all.js          # all shards, one process
          node touch_interruption_all.js --game X # just that game
          node touch_interruption_a_smoke.js      # one shard (the battery does this)
*/
const path = require('path');
const fs = require('fs');
const { start, serve } = require('./headless.js');
const { all: registryAll } = require('./registry.js');

const ROOT = path.resolve(__dirname, '..');
const SHARD_COUNT = 4;
const SHARD_IDS = ['a', 'b', 'c', 'd'];

/* The game list, straight from the shared registry module. `all()`, not
   `children()`: the parent lock is part of the surface a child touches too. */
function loadGames() {
  return registryAll().map(a => ({ id: a.id, path: a.url }));
}

/* Ordered, contiguous, evenly-sized slices. Ordered rather than hashed so
   "which shard is this game in" stays obvious to a human reading the output.
   Slices are balanced by proportional bounds rather than a fixed chunk size, so
   17 games over 4 shards gives 4/4/4/5 instead of leaving the last shard nearly
   empty (ceil-chunking gave 5/5/5/2). Rebalance here if the registry grows. */
function shardGames(games, shardId) {
  const i = SHARD_IDS.indexOf(shardId);
  if (i < 0) throw new Error('unknown shard: ' + shardId);
  const n = games.length;
  const from = Math.floor((i * n) / SHARD_COUNT);
  const to = Math.floor(((i + 1) * n) / SHARD_COUNT);
  return games.slice(from, to);
}

/* One game: four interruption patterns, then assert the UI survived. */
async function testGame(game, check, h) {
  await h.sleep(600);

  // 1. pointerdown + pointercancel (touch interrupted)
  const t1 = await h.evalv(`(() => {
    const el = document.getElementById('app') || document.body;
    const rect = el.getBoundingClientRect();
    const x = rect.left + rect.width / 2, y = rect.top + rect.height / 2;
    el.dispatchEvent(new PointerEvent('pointerdown', { clientX: x, clientY: y, bubbles: true, pointerId: 1 }));
    el.dispatchEvent(new PointerEvent('pointercancel', { clientX: x, clientY: y, bubbles: true, pointerId: 1 }));
    return { ok: true };
  })()`);
  check(`${game.id}: pointerdown+cancel`, t1 && t1.ok, 'no crash');

  // 2. pointerdown + pointermove + pointercancel (drag interrupted)
  const t2 = await h.evalv(`(() => {
    const el = document.getElementById('app') || document.body;
    const rect = el.getBoundingClientRect();
    const x = rect.left + rect.width / 2, y = rect.top + rect.height / 2;
    el.dispatchEvent(new PointerEvent('pointerdown', { clientX: x, clientY: y, bubbles: true, pointerId: 1 }));
    el.dispatchEvent(new PointerEvent('pointermove', { clientX: x + 50, clientY: y + 50, bubbles: true, pointerId: 1 }));
    el.dispatchEvent(new PointerEvent('pointercancel', { clientX: x + 50, clientY: y + 50, bubbles: true, pointerId: 1 }));
    return { ok: true };
  })()`);
  check(`${game.id}: drag interrupted`, t2 && t2.ok, 'no crash');

  // 3. second finger (multi-touch)
  const t3 = await h.evalv(`(() => {
    const el = document.getElementById('app') || document.body;
    const rect = el.getBoundingClientRect();
    const x = rect.left + rect.width / 2, y = rect.top + rect.height / 2;
    el.dispatchEvent(new PointerEvent('pointerdown', { clientX: x, clientY: y, bubbles: true, pointerId: 1 }));
    el.dispatchEvent(new PointerEvent('pointerdown', { clientX: x + 100, clientY: y + 100, bubbles: true, pointerId: 2 }));
    el.dispatchEvent(new PointerEvent('pointerup', { clientX: x + 100, clientY: y + 100, bubbles: true, pointerId: 2 }));
    el.dispatchEvent(new PointerEvent('pointerup', { clientX: x, clientY: y, bubbles: true, pointerId: 1 }));
    return { ok: true };
  })()`);
  check(`${game.id}: multi-touch`, t3 && t3.ok, 'no crash');

  // 4. page hidden during interaction
  const t4 = await h.evalv(`(() => {
    const el = document.getElementById('app') || document.body;
    const rect = el.getBoundingClientRect();
    const x = rect.left + rect.width / 2, y = rect.top + rect.height / 2;
    el.dispatchEvent(new PointerEvent('pointerdown', { clientX: x, clientY: y, bubbles: true, pointerId: 1 }));
    document.dispatchEvent(new Event('visibilitychange'));
    el.dispatchEvent(new PointerEvent('pointerup', { clientX: x, clientY: y, bubbles: true, pointerId: 1 }));
    return { ok: true };
  })()`);
  check(`${game.id}: page hidden`, t4 && t4.ok, 'no crash');

  // 5. UI still present after all interruptions
  const t5 = await h.evalv(`(() => {
    const app = document.getElementById('app') || document.body;
    return { hasUI: app.children.length > 0, title: document.title };
  })()`);
  check(`${game.id}: UI intact`, t5 && t5.hasUI, t5 ? t5.title : 'no UI');
}

/* Run one shard. `label` is the shard id (or a custom label for the combined
   runner). Returns { passes, failures } and exits non-zero on failure, the same
   contract every other smoke uses. */
async function runShard(label, games) {
  const failures = [];
  let passes = 0;
  const check = (name, ok, detail) => {
    if (ok) { passes++; console.log(`PASS ${name}  [${detail}]`); }
    else { failures.push(name); console.log(`FAIL ${name}  [${detail}]`); }
  };

  console.log(`touch_interruption[${label}]: ${games.length} game(s) — ${games.map(g => g.id).join(', ') || 'none'}\n`);
  const srv = await serve();
  for (const game of games) {
    console.log(`--- ${game.id} ---`);
    const h = await start({ page: game.path, tag: `touch-${game.id}`, width: 1280, height: 800 });
    try {
      await testGame(game, check, h);
      const runtimeErrors = h.getRuntimeErrors();
      check(`${game.id}: no browser runtime errors`, runtimeErrors.length === 0,
        runtimeErrors.slice(0, 2).map(e => `${e.kind}: ${e.detail}`).join('; ') || 'none');
    } finally {
      await h.close({ checkErrors: false });
    }
    console.log('');
  }
  srv.close();

  console.log(`\n=== touch_interruption[${label}]: ${passes} pass, ${failures.length} fail ===`);
  return { passes, failures };
}

/* Print a failure block and exit non-zero — the contract every smoke uses.
   Lives here so each shard entry point stays one line long. runShard itself
   does NOT exit, so touch_interruption_all.js can loop over several shards. */
function finish(result) {
  if (result.failures.length) {
    console.log('FAILURES:');
    for (const f of result.failures) console.log('  ' + f);
    process.exit(1);
  }
  console.log('ALL TOUCH INTERRUPTION CHECKS PASSED');
  process.exit(0);
}

module.exports = { loadGames, shardGames, runShard, finish, SHARD_COUNT, SHARD_IDS };
