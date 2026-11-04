# Active tasks

Only **NEW / IN PROGRESS / DEFERRED** tasks live here (budget: 20 KB, checked by `node tools/check_docs.js`). Every finished task is in `archive/tasks/`, one line each in [`INDEX.md`](INDEX.md).

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

- 364. NEW — P1.1 Verified repository inventory: enumerate all registry entries, map runtime files/assets/smokes/screenshots/offline deps, find unregistered pages & orphans, produce inventory matrix (2026-11-04, Kilo/reflection/beam-free)
- 365. NEW — P1.2 Service-worker & version-discovery audit: trace version discovery + cache identity, test install/update/failure/offline recovery, add regression tests for confirmed gaps (2026-11-04, Kilo/reflection/beam-free)
- 366. NEW — P1.3 Child-safety & privacy audit: audit network paths, permissions, storage, HTML/URL injection, parent reset; remove any unapproved runtime network surface (2026-11-04, Kilo/reflection/beam-free)
- 367. NEW — P1.4 Accessibility audit: all registry pages; keyboard, touch, reduced motion, focus, contrast, zoom, screen-reader essentials; automated + manual evidence (2026-11-04, Kilo/reflection/beam-free)
- 368. NEW — P1.5 Game-by-game audit: lifecycle, state, controls, audio, persistence, errors, offline, performance, learning correctness; produce game matrix (2026-11-04, Kilo/reflection/beam-free)
- 369. NEW — P1.6 Visual audit: inspect current screenshot PNGs, regenerate stale audit reports, adjudicate warnings, page-by-page findings (2026-11-04, Kilo/reflection/beam-free)
- 370. NEW — Phase 2 foundational reliability fixes (version discovery, SW update/rollback, offline truth, error handling, lifecycle cleanup, input/audio, data validation) (2026-11-04, Kilo/reflection/beam-free)
- 371. NEW — Phase 3 portfolio excellence pass (per-game clarity, forgiveness, success/exit, education, controls, personality) (2026-11-04, Kilo/reflection/beam-free)
- 372. NEW — Phase 4 visual & sensory refinement (screenshots, cozy language, clutter, readability, reduced motion, audio balance, game identity) (2026-11-04, Kilo/reflection/beam-free)
- 373. NEW — Phase 5 documentation reconciliation & release readiness (README/ROADMAP/STATUS/guides, mirror, gates, playtesting) (2026-11-04, Kilo/reflection/beam-free)
