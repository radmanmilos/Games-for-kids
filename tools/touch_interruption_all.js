/* touch_interruption_all.js — run every touch-interruption shard in ONE process.
 *
 * NOT part of the smoke battery: this file name does not end in _smoke.js, so
 * run_all ignores it. The battery runs touch_interruption_{a,b,c,d}_smoke.js as
 * four independent tools, which is what makes them parallel, individually
 * checkpointed by --resume, and survivable on a host that restarts mid-run
 * (task 156). Use this only for a quick local full pass in a single process.

 * Usage:  node tools/touch_interruption_all.js
 *          node tools/touch_interruption_all.js --game racing3d
 */
const { loadGames, shardGames, runShard, SHARD_IDS } = require('./touch_interruption_core.js');

const args = process.argv.slice(2);
const gameFilter = args.includes('--game') ? args[args.indexOf('--game') + 1] : null;

const all = loadGames();

(async () => {
  const targets = gameFilter
    ? all.filter(g => g.id === gameFilter)
    : [];
  if (gameFilter && !targets.length) { console.error(`Unknown game: ${gameFilter}`); process.exit(1); }

  let pass = 0, fail = 0;
  for (const id of SHARD_IDS) {
    // With --game, run the shard that owns it (and only that one).
    const games = gameFilter
      ? shardGames(all, id).filter(g => g.id === gameFilter)
      : shardGames(all, id);
    if (!games.length) continue;
    const r = await runShard(id, games);
    pass += r.passes;
    fail += r.failures.length;
  }
  console.log(`\n=== touch_interruption[all]: ${pass} pass, ${fail} fail ===`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(1); });
