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

- 288. IN PROGRESS (2026-10-22, OpenCode/Big Pickle) — Asset Generation candidate `animal-rooster` (🐓): the glyph is live in the farm puzzle (`game/games/animal_puzzle.js:8`) and racing decor (`game/games/racing-config.js:180`), no rooster picture exists in the repo, and the `animal-chicken` row asks for the rooster to stay visually distinct from the approved hen. **Candidate generated** with the task-287 pipeline (Cloudflare Workers AI, FLUX.2, references bear + star + chicken) → `assets_work_in_progress_bundle/rooster.png`, 1024x1024, opaque, paper 246.8/243.3/236.5, subject 163.7/121.9/97.6, palette-match 0.5042 vs the bear, small contrast 136.4. Status `GENERATED / CANDIDATE` — waiting for the user's review; approval, production readiness and runtime integration stay separate steps.

