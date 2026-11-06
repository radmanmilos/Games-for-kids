# Active tasks

Only **NEW / IN PROGRESS / DEFERRED** tasks live here (budget: 20 KB, checked by \`node tools/check_docs.js\`). Every finished task is in \`archive/tasks/\`, one line each in \`INDEX.md\`.

## Status legend

- NEW: not started
- IN PROGRESS: being worked on (say who/what model, and the date)
- DONE: completed (a dated note: who (tool + model), what, why)
- REVERTED / FIXED / DEFERRED / ABANDONED / RETIRED: terminal or parked (the note says why)

## How to work with this file

1. **Start:** add \`- N. NEW — <title> (<date>, <tool/model>)\` at the top of *Open tasks*. N = the "next task number" in \`INDEX.md\`. Flip it to IN PROGRESS when you start.
2. **Finish:** mark it DONE with a dated note: who (tool + model), what, why. Keep the entry short; put long reasoning in the entry only if a future session needs it.
3. **End of session:** run \`node tools/archive_tasks.js\`. It moves DONE / FIXED / REVERTED / ABANDONED / RETIRED entries to \`archive/tasks/\` and adds their \`INDEX.md\` lines. (\`--dry-run\` shows what would move.)
4. Do **not** copy the task into README, CONTRIBUTING or STATUS. \`project/STATUS.md\` is overwritten at session end instead.

## Open tasks

- 384. NEW — Add deterministic screenshot coverage for the internal Games and Learning sub-hubs at all four viewports; inspect discoverability and grid reachability.
- 385. NEW — Fix Classroom category-tab overflow on phone widths; keep all six tabs reachable without page-level horizontal scrolling.
- 386. NEW — Give Phonics retry feedback an explicit gentle non-success state; preserve green for correct answers and reset state between rounds.
- 387. NEW — Verify Coloring clear-button and palette geometry in phone landscape; change layout only if a real collision or unsafe proximity is measured.
- 388. NEW — Reproduce Cat Forest feeding-station crowding in the seeded PLAY state and normal play; change actor layout only if representative.
- 389. NEW — Improve Animal Counting stage balance and artwork scale without reducing the existing 64px answer-target floor.
- 390. NEW — Separate Spatial feedback from answer controls at short landscape; implement only after confirming the near-collision.
- 391. NEW — Assess Compare portrait scale through child/device feedback before making subjective composition changes.
- 392. NEW — Run portfolio playtesting Sessions A–D on a real device where possible; record observations and limitations.
- 393. NEW — Reconcile GAME_MATRIX, current app registry, test/offline/screenshot flags and actual game-guide file mappings.
- 394. NEW — Complete the phased game-by-game lifecycle, state, input, audio, learning and performance audit.
- 395. NEW — Verify service-worker update and offline recovery lifecycle end-to-end, preserving the last known-good offline copy.
- 396. NEW — Complete manual accessibility and input-interruption checks: focus, keyboard, pointercancel, touch, reduced motion and semantic feedback.
- 397. NEW — Audit learning quality, Serbian Cyrillic text, Serbian speech and content integrity while respecting locked curriculum decisions.
- 398. NEW — Measure performance and resilience on representative modest Android hardware before proposing optimizations.
