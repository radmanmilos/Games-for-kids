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

- 294. DONE (2026-10-30, OpenCode/Big Pickle) — applied the delivered `petras-world-regen-prompts-2026-10-29` package (6 new + 4 revised briefs) and regenerated the ten flagged bundle assets as `--subject-ref` finish passes: cow, duck, fish, egg, skis, medal, notebook, apple, cat, dog. One candidate each, ~1,377 neurons, technical QA measured, **user approved all ten on 2026-10-30**; candidates copied over the bundle files, `ASSET_INVENTORY.md` rows/QA facts and `PROGRESS.md` updated. No runtime integration, no `game/` change.

### Task 289 handoff update — 2026-10-26

Prompt coverage is complete for the approved queue through `cactus.png`. After Cloudflare recharges, retry `prompts/parrot.md` first with its documented `bear.png`, `star.png` and `bird.png` references. Do not generate rows marked `REVIEW` or visual-review-pending. Run technical QA and obtain user visual approval after each generated image.

User-approved preparation scope: add briefs for 29 post-parrot candidates (20 standalone/raster candidates plus 9 possible designed assets). Briefs are prepared, not generation-approved.

Next-generation instruction: process `parrot.md` and then the prepared prompts strictly one by one. For every image, run technical QA, obtain explicit user visual approval, update inventory/progress, commit with an `Agent: <tool>/<model>` trailer, and push to `main`. Do not batch-generate or perform runtime integration.

- 293. DONE (2026-10-29, OpenCode/Big Pickle) — parent smoke gate flake seen on the scheduler run `40314102209` (`question:"…"`, `choices:0`). Cause: `Page.navigate` resolves when the navigation commits, so the gate (rendered by the page's inline script) had not run when the fixed `sleep(1200)` expired; that sleep was enough locally but not on the loaded runner. Fix: both page loads in `tools/parent_smoke.js` now readiness-wait on `document.querySelectorAll('.gate-choice').length === 4`; the assertions are unchanged. Verified 44/44 locally, and negative-tested from a file copy (gate render delayed 2.5 s → still 44/44 PASS; gate with 3 choices → FAIL with `choices:3`), `check_fast` 8/8 green.
All prepared-brief assets are now approved. 4 REVIEW assets remain without generated PNGs (snowflake, rock, road-barrier, galaxy) � briefs exist, awaiting generation. Three more REVIEW assets (seasons-leaf, monitor, music-bell) were resolved by reusing existing PNGs. No runtime integration.
