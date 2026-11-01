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

- 327. DONE — T327: verified T301-T311 against the code and closed the gaps. T308 had missed two canvas emoji in `kitty-standalone.js` (cave ✨ at the goal, arch 🐚) — now `Art.draw`; T309 needed no change (ocean/space/tracing only `fillText` the Cyrillic word ЦИЉ and the digit 1); piano's song chips dropped the textContent+dataset+second-pass dance for one `Art.fill`. Bookkeeping: 301/302/306-311 archived as DONE, 316 and 320 RETIRED (their 2.8.0/2.9.0 boundaries were absorbed into 2.7.0/2.7.1 and merged into T324), 326 archived. Documented in `tools/screenshot.js` that `capture-manifest.json` records only the LAST capture run (a `--pages` refresh rewrites it for the subset; per-file truth is `screenshot-provenance.json` + the TOC). Refreshed explorer+piano screenshots. (2026-11-01, OpenCode/Big Pickle)
- 321. DONE — T321: Cat Forest finished — the last CSS-only glyph sites now paint too. `paintStaticGlyphs()` runs once after `cacheEls()` and fills the plates, tray treats, trees and stars from their `data-e`; the rain-cloud button moved from a literal `content:"🌧️"` to `content:attr(data-e)` and is painted with the rest. `.cf-treat`/`.cf-plate` font-size moved onto the element (the `::before` carried the clamp, so a `1em` image would have rendered at the inherited 16px); the desktop-tier overrides follow. Glyphs with no art stem (✨ and the ☀️/🌙/📖/✖️ chrome) stay emoji through the same call (fillAttr leaves them alone). New `tools/art_smoke.js` (19 checks) pins the helper contract the whole migration rests on: url/html/fill/fillAttr/draw, `fillAttr` idempotency + child preservation + attribute retention, `draw` fallback font and ctx-state restore — run_all auto-discovers it and `shared/` already maps to the whole battery. (2026-11-01, OpenCode/Big Pickle)
- 322. NEW — T322: Audit remaining emoji render sites, document exceptions (target 3.0.0) (2026-10-31, OpenCode/Big Pickle)
- 323. NEW — T323: Verify all registered glyphs have WebPs, keep fallback (target 3.0.0) (2026-10-31, OpenCode/Big Pickle)
- 324. NEW — T324: Bump to 3.0.0, full battery (check_release + play_matrix + axe), full screenshot battery, archive, update STATUS (target 3.0.0) (2026-10-31, OpenCode/Big Pickle)
- 325. NEW — T325: Update all project/games docs, lessons if needed, DECISIONS final note (target 3.0.0) (2026-10-31, OpenCode/Big Pickle)
