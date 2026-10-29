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

### Task 289 handoff update — 2026-10-26

Prompt coverage is complete for the approved queue through `cactus.png`. After Cloudflare recharges, retry `prompts/parrot.md` first with its documented `bear.png`, `star.png` and `bird.png` references. Do not generate rows marked `REVIEW` or visual-review-pending. Run technical QA and obtain user visual approval after each generated image.

User-approved preparation scope: add briefs for 29 post-parrot candidates (20 standalone/raster candidates plus 9 possible designed assets). Briefs are prepared, not generation-approved.

Next-generation instruction: process `parrot.md` and then the prepared prompts strictly one by one. For every image, run technical QA, obtain explicit user visual approval, update inventory/progress, commit with an `Agent: <tool>/<model>` trailer, and push to `main`. Do not batch-generate or perform runtime integration.

- 293. DONE (2026-10-29, OpenCode/Big Pickle) — parent smoke gate flake seen on the scheduler run `40314102209` (`question:"…"`, `choices:0`). Cause: `Page.navigate` resolves when the navigation commits, so the gate (rendered by the page's inline script) had not run when the fixed `sleep(1200)` expired; that sleep was enough locally but not on the loaded runner. Fix: both page loads in `tools/parent_smoke.js` now readiness-wait on `document.querySelectorAll('.gate-choice').length === 4`; the assertions are unchanged. Verified 44/44 locally, and negative-tested from a file copy (gate render delayed 2.5 s → still 44/44 PASS; gate with 3 choices → FAIL with `choices:3`), `check_fast` 8/8 green.
- 289. IN PROGRESS (2026-10-22, OpenCode/Big Pickle; updated 2026-10-29, OpenCode/Big Pickle) — Asset-bundle reconciliation (WIP): bundle has **105 PNGs**. Approved on 2026-10-29: `parrot.png` (iteration 3), `moon.png` (iteration 3), `satellite.png` (iteration 2), `telescope.png` (iteration 2), `ice-cube.png` (iteration 1), `ball.png` (iteration 1), `comet.png` (iteration 3, user subject photos), `pine-tree.png` (iteration 3, user subject photos), `surfboard.png` (iteration 1), `mountain.png` (iteration 3), `beach-umbrella.png` (iteration 2) and `wave.png` (iteration 1). **Process change 2026-10-29 (user): generate three candidates at a time** in the prepared order, still reviewing/approving/committing each one before it counts as approved. In review: `skis` iteration 2 (wooden, skiing position), `skier` iteration 2 (exactly two legs), plus first candidates for `evergreen-lantern`, `grass`, `spaceship`. Next batch after those: `sun`, `sunrise`, `sunset`. No runtime integration.
