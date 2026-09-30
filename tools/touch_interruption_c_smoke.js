/* touch_interruption_c_smoke.js — system-wide touch interruption tests, shard c (task 11, split in task 156).
   Simulates touch interruptions on a slice of the games and verifies they don't break.
   Cases per game: pointerdown+pointercancel, drag interrupted, multi-touch, page hidden
   during interaction, and UI intact afterwards.

   The shared logic lives in touch_interruption_core.js; this file only says which
   slice is mine. All shards together cover every game in app-registry.js — they are
   a split of the old single 85-check tool, not extra coverage.

   Usage: node tools/touch_interruption_c_smoke.js
   Exit 0 = all pass, 1 = failures found. */
const { loadGames, shardGames, runShard, finish } = require('./touch_interruption_core.js');

const SHARD = 'c';
runShard(SHARD, shardGames(loadGames(), SHARD))
  .then(finish)
  .catch(e => { console.error('HARNESS ERROR:', e); process.exit(1); });
