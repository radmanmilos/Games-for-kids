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

- 289. IN PROGRESS (2026-10-22, OpenCode/Big Pickle; updated 2026-10-25, GitHub Copilot CLI/Auto) — Asset-bundle reconciliation (WIP): bundle has **65 PNGs**. Added and pushed the user-approved `ear.png` candidate in `28d9900`; technical QA passed (1024×1024, 770,630 bytes, opaque, contrast proxy 33.93). Measured technical QA for `soap.png`, `sunflower.png`, `butterfly.png`, `acorn.png` and `mushroom.png`; their inventory rows now await user visual review. `flower.png` is already approved; `egg.png` remains measured but awaits review. The pushed CI fast gate and Pages deployment passed. The local 2026-10-22 soap render and brief were discarded at the user's request on 2026-10-25; `soap.png` on `main` stands, and only the subject-reference technique was kept (task 291). No runtime integration is implied.
