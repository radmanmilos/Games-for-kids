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

- 289. IN PROGRESS (2026-10-22, OpenCode/Big Pickle; updated 2026-10-25, GitHub Copilot CLI/Auto) — Asset-bundle reconciliation (WIP): bundle has **65 PNGs**. Local `ear.png` and `prompts/ear.md` were added; ear is user-approved and technically measured (1024×1024, 770,630 bytes, opaque, contrast proxy 33.93), with inventory and progress ledger updated. QA and user review remain unrecorded for `soap.png`, `sunflower.png`, `butterfly.png`, `acorn.png`, `mushroom.png` and `flower.png`; `egg.png` is measured but awaits review. The local 2026-10-22 soap render and brief were discarded at the user's request on 2026-10-25; `soap.png` on `main` stands, and only the subject-reference technique was kept (task 291). No runtime integration is implied. Recent remote CI is red on the AGENTS.md byte budget; the local whitespace reduction makes `check_fast` pass but is uncommitted.
