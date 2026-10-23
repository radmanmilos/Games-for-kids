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

- 289. IN PROGRESS (2026-10-22, OpenCode/Big Pickle) — Asset bundle reconciliation (WIP): bundle now contains **27 PNGs** (`resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/`). Per inventory, many are `GENERATED / USER-APPROVED / TECHNICAL QA MEASURED` (animals + objects like `bone.png`, `water-drop.png`, `bird.png`, `chick.png`, `rooster.png`, etc.). **`object-egg` (`egg.png`)** is `GENERATED / CANDIDATE — TECHNICAL QA MEASURED` (iteration 2: 1024x1024 opaque, proxy 38.8 > bone.png 36.8); used in `game/games/sequencing.js:26` (egg→chick→bird) and `:46` (egg→caterpillar→butterfly). Other candidates present: `object-soap` (`soap.png`, `GENERATED / CANDIDATE — TECHNICAL QA PENDING`), `object-sunflower` (`sunflower.png`, `GENERATED / CANDIDATE — TECHNICAL QA AND USER REVIEW NOT RECORDED`), `animal-butterfly` (`butterfly.png`, `GENERATED / CANDIDATE — TECHNICAL QA AND USER REVIEW NOT RECORDED`). Treat all PNGs currently in the bundle as the approved set for now per user instruction; remaining work is review/approval of candidates and later runtime integration.

