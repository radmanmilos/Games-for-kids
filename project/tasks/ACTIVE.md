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

- 289. IN PROGRESS (2026-10-22, OpenCode/Big Pickle; updated 2026-10-25, ChatGPT/GPT-6 and OpenCode/Big Pickle) — Asset bundle reconciliation (WIP): bundle now contains **29 PNGs**. Commit `20e9d5974bb11ee49c2986bc71d1aae73d8b3947` added `acorn.png` and commit `c7e6500` added `mushroom.png`; the inventory records both as generated candidates, with technical QA and user review not recorded. **`object-egg` (`egg.png`)** remains `GENERATED / CANDIDATE — TECHNICAL QA MEASURED` (iteration 2: 1024×1024 opaque, proxy 38.8 vs `bone.png` 36.8), used in `game/games/sequencing.js` for egg→chick→bird and egg→caterpillar→butterfly. Other pending candidates include `soap.png`, `sunflower.png`, `butterfly.png`, `acorn.png`, and `mushroom.png`. No runtime integration is implied.

