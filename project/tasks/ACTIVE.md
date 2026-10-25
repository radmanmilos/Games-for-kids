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

- 289. IN PROGRESS (2026-10-22, OpenCode/Big Pickle; updated 2026-10-25, GitHub Copilot CLI/Auto) — Asset-bundle reconciliation (WIP): bundle has **66 PNGs**. `ear.png` is committed; `helicopter.png` was generated, technically measured and user-approved, with prompt and inventory/progress records added. Reference set: bear, star and bone; user clarified that future sets should be selected case-by-case from the existing reference/WIP folder, not fixed to bear/star. `soap.png`, `sunflower.png`, `butterfly.png`, `acorn.png` and `mushroom.png` await user visual review; `flower.png` is approved and `egg.png` remains measured awaiting review. No runtime integration.
