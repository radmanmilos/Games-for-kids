# Active tasks

Only **NEW / IN PROGRESS / DEFERRED** tasks live here (budget: 20 KB, checked by `node tools/check_docs.js`). Every finished task is in `archive/tasks/`, one line each in [`INDEX.md`](INDEX.md).

## Status legend

- NEW: not started
- IN PROGRESS: being worked on (say who/what model, and the date)
- DONE: completed (a dated note: who = tool + model, what, why)
- REVERTED / FIXED / DEFERRED / ABANDONED / RETIRED: terminal or parked (the note says why)

## How to work with this file

1. **Start:** add `- N. NEW — <title> (<date>, <tool/model>)` at the top of *Open tasks*. N = the "next task number" in `INDEX.md`. Flip it to IN PROGRESS when you start.
2. **Finish:** mark it DONE with a dated note: who (tool + model), what, why. Keep the entry short; put long reasoning in the entry only if a future session needs it.
3. **End of session:** run `node tools/archive_tasks.js`. It moves DONE / FIXED / REVERTED / ABANDONED / RETIRED entries to `archive/tasks/` and adds their `INDEX.md` lines. (`--dry-run` shows what would move.)
4. Do **not** copy the task into README, CONTRIBUTING or STATUS. `project/STATUS.md` is overwritten at session end instead.

## Open tasks

- 285. NEW — racing3d audio-bus smoke asserts host wall time (2026-10-21, OpenCode/Big Pickle). Found while validating task 284: the `audio bus: … exponential backoff gate` check reads `qRepeat === 1` after `4 × sleep(55)` ≈ 220 ms of WALL time, but `announceObstacle` gates on `performance.now()` (`curTime`, racing3d.mjs:1495) with a 600 ms minimum gap — so on a loaded CI runner the gate opens and the check fails (`qRepeat: 4`). Seen once in run 39563153468 (job 119099202885, 39/1); a rerun passed. Fix: assert the product's gate rule against a controlled `now`, or accept both branches, so the check cannot depend on host timing (same class as the task-284 fastcat fix).

