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

- 326. DONE — T326: review of the 2.7.x Art migration (T298 onward) + fixes. Found and fixed 6 defects: Cat Forest trees/stars rendered BLANK (`content:attr(data-e)` with no attribute); double-paint (emoji ::before + art `<img>`) on plates/treats/cats — fixed with `art-painted::before{content:none}` and by deleting 5 leftover literal `content:"🐟"` rules; `Art.fillAttr` was non-idempotent (stacked an `<img>` per render) and rebuilt `innerHTML` (dropping children/listeners); `Art.draw` leaked font/align state and forced `sans-serif` (lost the emoji font); racing3d passed a composite `"🌸 0/12"` string to `Art.fill` (never painted) and the HUD was rebuilt with `textContent` on every pickup; `celebration.js` assigned `textContent` twice. Also removed the dead `GAME_ICON` const (its removal in the redo was a no-op — the markup already carried the same glyph) and a stray blank line in `animals_smoke`. Version → **2.7.1**; cat_forest_smoke gained a regression guard for blank static decor; racing3d_smoke reads the painted glyph. (2026-11-01, OpenCode/Big Pickle)
- 301. NEW — T301: Cat Forest data/render sites → Art (target 2.7.0) (2026-10-31, OpenCode/Big Pickle)
- 302. NEW — T302: bump to 2.7.0, build_offline + sync-docs, screenshots (target 2.7.0) (2026-10-31, OpenCode/Big Pickle)
- 306. NEW — T306: Adventure family canvas draws (adventure.js + adventure-modes.js) (target 2.7.0) (2026-10-31, OpenCode/Big Pickle)
- 307. NEW — T307: Dino + FastCat canvas draws (target 2.7.0) (2026-10-31, OpenCode/Big Pickle)
- 308. NEW — T308: Kitty-standalone canvas draws (target 2.7.0) (2026-10-31, OpenCode/Big Pickle)
- 309. NEW — T309: Ocean + Space + Tracing canvas draws (target 2.7.0) (2026-10-31, OpenCode/Big Pickle)
- 310. NEW — T310: Animal-puzzle + racing3d.mjs canvas draws (target 2.7.0) (2026-10-31, OpenCode/Big Pickle)
- 311. NEW — T311: Bump to 2.7.0, build_offline + sync-docs, screenshots (target 2.7.0) (2026-10-31, OpenCode/Big Pickle)
- 320. NEW — T320: Bump to 2.9.0, build_offline + sync-docs, screenshots (target 2.9.0) (2026-10-31, OpenCode/Big Pickle)
- 321. NEW — T321: Cat Forest full migration (CSS content: rules + glyphs) → Art (target 3.0.0) (2026-10-31, OpenCode/Big Pickle)
- 322. NEW — T322: Audit remaining emoji render sites, document exceptions (target 3.0.0) (2026-10-31, OpenCode/Big Pickle)
- 323. NEW — T323: Verify all registered glyphs have WebPs, keep fallback (target 3.0.0) (2026-10-31, OpenCode/Big Pickle)
- 324. NEW — T324: Bump to 3.0.0, full battery (check_release + play_matrix + axe), full screenshot battery, archive, update STATUS (target 3.0.0) (2026-10-31, OpenCode/Big Pickle)
- 325. NEW — T325: Update all project/games docs, lessons if needed, DECISIONS final note (target 3.0.0) (2026-10-31, OpenCode/Big Pickle)
