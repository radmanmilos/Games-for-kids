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

- 289. NEW (2026-10-22, OpenCode/Big Pickle) — Asset Generation candidate `object-egg` (🥚): the glyph is used in **two** sequences — `game/games/sequencing.js:26` (egg → chick → bird) and `game/games/sequencing.js:46` (egg → caterpillar → butterfly) — and every sibling step is already painted and approved, so the egg completes both chains and gives the pipeline its first **simple-object** exemplar (`bone.png` is the only approved one). Generate one candidate with the task-287 pipeline (Cloudflare Workers AI, FLUX.2, bundle as reference pool), measure it, and keep it a candidate until the user reviews it.

