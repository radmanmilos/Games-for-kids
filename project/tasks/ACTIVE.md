# Active tasks

Only **NEW / IN PROGRESS / DEFERRED** tasks live here (budget: 20 KB, checked by `node tools/check_docs.js`). Every finished task is in `archive/tasks/`, one line each in `INDEX.md`.

## Status legend

- NEW: not started
- IN PROGRESS: being worked on (say who/what model, and the date)
- DONE: completed (a dated note: who (tool + model), what, why)
- REVERTED / FIXED / DEFERRED / ABANDONED / RETIRED: terminal or parked (the note says why)

## How to work with this file

1. **Start:** add `- N. NEW — <title> (<date>, <tool/model>)` at the top of *Open tasks*. N = the "next task number" in `INDEX.md`. Flip it to IN PROGRESS when you start.
2. **Finish:** mark it DONE with a dated note: who (tool + model), what, why. Keep the entry short; put long reasoning in the entry only if a future session needs it.
3. **End of session:** run `node tools/archive_tasks.js`. It moves DONE / FIXED / REVERTED / ABANDONED / RETIRED entries to `archive/tasks/` and adds their `INDEX.md` lines. (`--dry-run` shows what would move.)
4. Do **not** copy the task into README, CONTRIBUTING or STATUS. `project/STATUS.md` is overwritten at session end instead.

## Open tasks

- 429. IN PROGRESS (2026-11-07, ChatGPT/GPT-6) — Little Explorer environment-art audit/integration: fix world scene switching, reuse approved art, prepare 18 terrain/pipe candidates (4 extra prompts require local WIP verification), and complete in-game PLAY screenshot review; generation is Cloudflare-quota blocked.
- 415. LIMITED (2026-11-07, ChatGPT/GPT-6) — Spring pilot screenshot review incomplete: four viewport captures show the character-selection surface, not in-game PLAY states; capture and review real gameplay after scene-switch fix.
- 391. ASSESSED (limited) — Compare portrait scale measured at all four viewports.
- 392. LIMITED — Portfolio playtesting Sessions A–D require a real device.
- 396. LIMITED — Manual accessibility and input-interruption checks require a real device.
- 398. LIMITED — Measure performance and resilience on representative modest Android hardware.
