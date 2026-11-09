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
4. **Do** not copy the task into README, CONTRIBUTING or STATUS. `project/STATUS.md` is overwritten at session end instead.

## Open tasks

- 434. DONE (2026-11-09, OpenCode/Big Pickle) — Gate 4 pilot: terrain-spring-top + pipe-spring generated via Cloudflare flux-2-klein-4b, cut out to 512x512 real-alpha WebP (15 KB / 6 KB, both ≤60 KB), added to art-registry.js (🍃→terrain-spring-top, 🚰→pipe-spring), integrated into kitty-standalone.js draw() — spring platforms/pipes use Art.draw with fillRect fallback for non-spring worlds.
- 435. NEW — Gate 5: family rollout (pipes, enemies/walkers, goals) (2026-11-08, OpenCode/Nemotron-3.5-Super-VL)
- 436. NEW — Gate 6: 11-world regression, screenshots, docs sync, commit (2026-11-08, OpenCode/Nemotron-3.5-Super-VL)
- 429. IN PROGRESS (2026-11-07, ChatGPT/GPT-6) — Umbrella: Little Explorer environment-art integration. Execution decomposed into Gates 0–6 (tasks 430–436). Generation blocked until Gate 1 acceptance is documented; item-level authorization does not waive the gate.
- 415. LIMITED (2026-11-07, ChatGPT/GPT-6) — Spring pilot screenshot review incomplete: existing four viewport captures show the character-selection surface, not in-game PLAY states; capture and review real gameplay.
- 391. ASSESSED (limited) — Compare portrait scale measured at all four viewports.
- 392. LIMITED — Portfolio playtesting Sessions A–D require a real device.
- 396. LIMITED — Manual accessibility and input-interruption checks require a real device.
- 398. LIMITED — Measure performance and resilience on representative modest Android hardware.
