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

- 384. DONE — Add deterministic screenshot coverage for the internal Games and Learning sub-hubs at all four viewports; inspect discoverability and grid reachability (2026-11-06, OpenCode/Big Pickle). `tools/screenshot.js` now registers `hub-games` and `hub-learning` as review pages and opens each through its real `data-go` landing tile before capture, so the stable battery has 8 new shots (4 viewports each) with `TABLE_OF_CONTENT` titles "Игре — под-хаб" / "Учење — под-хаб". Inspection at 390×844: landing tiles 186×186 with labels, sub-hub back buttons 56px, no horizontal overflow, 96px grid targets; Games fits without scrolling (one route intentionally hidden), Learning needs 82px of vertical scroll to reach Простор/Путања — scroll works and the cut row is the affordance. New `hub_smoke.js` guard asserts both grids stay reachable (negative-tested: fails when `.screen` stops being user-scrollable). No runtime change, so no version bump.
- 385. DONE — Fix Classroom category-tab overflow on phone widths; keep all six tabs reachable without page-level horizontal scrolling (2026-11-06, OpenCode/Big Pickle). Rails was clipped in phone portrait (492px rail in a 390px viewport at 844px tablet portrait too); `.class-tabs` now uses `width:max-content; max-width:94vw; flex-wrap:wrap; justify-content:center` and `.class-tab{white-space:nowrap}` so it wraps to a second row instead of overflowing. Verified 390×844 / 844×390 / 820×1180 / 1180×820 / 1280×800: 0 clipped tabs, no page horizontal scroll, 64px tab height kept, no overlap with the activity grid, keyboard order intact. New `classroom_smoke.js` guard (negative-tested: fails on the old CSS) and 8 refreshed review screenshots (task 385). Version 3.0.1 → 3.0.2.
- 386. DONE — Give Phonics retry feedback an explicit gentle non-success state; preserve green for correct answers and reset state between rounds (2026-11-06, OpenCode/Big Pickle). `#phonics-feedback` no longer hard-codes success green: base is `--plum-soft`, `.phonics-feedback-good` is green, `.phonics-feedback-retry` is calm plum (`#4A3F6B`), set by `setFeedbackState()` in `phonics.js` and cleared in `clearMarks()`. Two new `phonics_smoke.js` guards cover miss/reset/correct-switch (negative-tested: fails if the retry colour is green). 8 refreshed review screenshots. No `project/games/phonics.md` guide exists (Tracked by 393). Version 3.0.2 → 3.0.3.
- 387. DONE — Verify Coloring clear-button and palette geometry in phone landscape; change layout only if a real collision or unsafe proximity is measured (2026-11-06, OpenCode/Big Pickle). Measured boxes confirmed the review: at 844×390 (and every phone size) the palette tracks were a flat `9vmin` (=35px) while each swatch is a button with the global 64px floor, so neighbouring circles overlapped by up to 1783px² and the last column of row 1 spilled 29px past the palette box into the clear button (230px² overlap). Root fix: one `--swatch: clamp(48px, 9vmin, 72px)` token feeds both `grid-template-columns` and the swatch size (with `min-width/min-height:0` so the grid decides, the established classroom-tile pattern); phones get clean 48px targets, tablet/desktop keep 72px. Two new `coloring_smoke.js` guards (clear vs palette/swatch, swatch vs swatch) negative-tested against the old CSS, 8 refreshed review screenshots, version 3.0.3 → 3.0.4.
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
