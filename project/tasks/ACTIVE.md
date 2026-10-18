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

- 254. DONE (2026-10-17, OpenCode/Big Pickle) — New game „Брзи мачак" (fastcat): one deterministic 15000px auto-runner course (seed 254, shuffled 7-type chunk deck so every hazard family recurs), coins/bolts → ⚡ super (4s invulnerable 2×, smashes obstacles), 4 hazards, no fail states, char picker, landscape + rotate overlay. First smoke run: 6 fail + 1 crash, all root-caused (deck, plateau coin off, slide re-anchor, stale/vacuous asserts, h.c.send, jump-approach offset). Final: fastcat_smoke 42/42, hub_smoke all green (10th button → 4-col short-landscape grid; V21 allowlist gains superPulse ready cue, reduced-motion frozen), check_fast 8/8, manifest 2.0.6 → 2.1.0, offline + docs + 4 screenshots refreshed. Round 2 (2026-10-18, user play-test): portrait play allowed (#fc-rotate removed; smoke asserts controls tappable at 390x844), ⚡ stacked directly above JUMP, slide draws the character lying flat (0.35 → PI/2 about the sprite centre), scene lowered in landscape (baseY band 140 → 100px); fastcat_smoke 43/43. Same commit fixes the racing3d_smoke CI load-flake (run 39063913068): the countdown read raced the wall-clock 3400ms sequence from after the camera batch — it now captures immediately after confirmStart with a readiness wait on the rendered label.
- 253. DONE (2026-10-17, OpenCode/Big Pickle) — Explorer fun-speed multiplier 3x → 2x (user request); manifest 2.0.6, offline manifest regenerated after CI caught the stale hashes.

