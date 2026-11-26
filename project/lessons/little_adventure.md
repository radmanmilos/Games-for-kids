# Lessons — Little Adventure

- Keep `game/` deployable-only; sync `docs/` via `tools/sync-docs.sh`.
- Run `node tools/check_fast.js` and `node tools/run_all.js --game little_adventure` after changes.
- Models must build in Node without DOM; import Three as a parameter.
- Use `bootEmulated` for reduced-motion assertions, never host default.
- Save only on milestone events; wrap storage in try/catch.
- Emit ambient particles from the fixed pool (`for (const p of particles) if (!p.alive) { ... }`), never with `particles.push({...})`: pushed objects have no `alive` flag, never render and never die, so `particlesAlive` undercounts and the cap proof is wrong.
- `check_fast`'s offline-inventory stage fails on stale hashes after any `game/` edit; rebuild with `node tools/build_offline.js` (then `bash tools/sync-docs.sh`). A "boot crash (exit 1, 0 checks)" is a Chrome-under-load flake, not a real failure; rerun standalone.
- The Q-04 "<=40 material instances" AC is not reachable with the approved palette (53 cached variants, ~101 unique scene materials including per-prop emissive clones and per-rig face atlases). The perf-relevant ceiling enforced in the smoke is shader programs <=40 (currently 13); the deviation is recorded in `PROGRESS.md`, not hidden.
- Share identical outline/blob-shadow materials once per kit (`sharedOutline`, `blobShadowMat`); allocating one per outlined part pushed the scene past 100 materials.
- `wall-clock` stride SFX/dust timers are functional but NOT stride-phase locked; do not claim footstep-synchronised animation without a phase-driven implementation.