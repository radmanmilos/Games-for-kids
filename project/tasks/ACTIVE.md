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

- 298. DONE — T298: wired Art helper globally (art-registry + shared/art on 25 game pages, .art CSS in components.css), rebuilt offline inventories, synced docs (2026-10-31, OpenCode/Big Pickle).
- 299. DONE — T299: Art smoke assertion added (art_smoke.js + check_fast coverage) (2026-10-31, OpenCode/Big Pickle)
- 300. IN PROGRESS — T300: Bump to 2.5.0, build_offline + sync-docs, update game docs (target 2.5.0) (2026-10-31, OpenCode/Big Pickle)
- 301. NEW — T301: Group A emoji-field render sites (animals, animal_counting, candy, sorting, spatial) (target 2.6.0) (2026-10-31, OpenCode/Big Pickle)
- 302. NEW — T302: Group B emoji-field render sites (sequencing, animal_puzzle, maze) (target 2.6.0) (2026-10-31, OpenCode/Big Pickle)
- 303. NEW — T303: Group C emoji-field render sites (phonics, piano, rhythm, classroom, fastcat) (target 2.6.0) (2026-10-31, OpenCode/Big Pickle)
- 304. NEW — T304: cat_forest.html data table render via Art.fill (target 2.6.0) (2026-10-31, OpenCode/Big Pickle)
- 305. NEW — T305: Bump to 2.6.0, build_offline + sync-docs, screenshots (target 2.6.0) (2026-10-31, OpenCode/Big Pickle)
- 306. NEW — T306: Adventure family canvas draws (adventure.js + adventure-modes.js) (target 2.7.0) (2026-10-31, OpenCode/Big Pickle)
- 307. NEW — T307: Dino + FastCat canvas draws (target 2.7.0) (2026-10-31, OpenCode/Big Pickle)
- 308. NEW — T308: Kitty-standalone canvas draws (target 2.7.0) (2026-10-31, OpenCode/Big Pickle)
- 309. NEW — T309: Ocean + Space + Tracing canvas draws (target 2.7.0) (2026-10-31, OpenCode/Big Pickle)
- 310. NEW — T310: Animal-puzzle + racing3d.mjs canvas draws (target 2.7.0) (2026-10-31, OpenCode/Big Pickle)
- 311. NEW — T311: Bump to 2.7.0, build_offline + sync-docs, screenshots (target 2.7.0) (2026-10-31, OpenCode/Big Pickle)
- 312. NEW — T312: Shared modules (shared/celebration.js, shared/navigation.js) → Art.fill (target 2.8.0) (2026-10-31, OpenCode/Big Pickle)
- 313. NEW — T313: compare.js, kids_games.js, coloring.js, animal_memory.js DOM sites (target 2.8.0) (2026-10-31, OpenCode/Big Pickle)
- 314. NEW — T314: adventure.js, animals.js, dino.js, maze.js, piano.js, rhythm.js, tracing.js remaining DOM sites (target 2.8.0) (2026-10-31, OpenCode/Big Pickle)
- 315. NEW — T315: pages/parent.html + pages/cat_forest.html remaining sites (target 2.8.0) (2026-10-31, OpenCode/Big Pickle)
- 316. NEW — T316: Bump to 2.8.0, build_offline + sync-docs, screenshots (target 2.8.0) (2026-10-31, OpenCode/Big Pickle)
- 317. NEW — T317: data/serbian.js note - emoji fields fallback (target 2.9.0) (2026-10-31, OpenCode/Big Pickle)
- 318. NEW — T318: racing-config.js decor + racing3d UI (target 2.9.0) (2026-10-31, OpenCode/Big Pickle)
- 319. NEW — T319: Excluded 6 assets as opaque images/CSS (target 2.9.0) (2026-10-31, OpenCode/Big Pickle)
- 320. NEW — T320: Bump to 2.9.0, build_offline + sync-docs, screenshots (target 2.9.0) (2026-10-31, OpenCode/Big Pickle)
- 321. NEW — T321: Cat Forest full migration (CSS content: rules + glyphs) → Art (target 3.0.0) (2026-10-31, OpenCode/Big Pickle)
- 322. NEW — T322: Audit remaining emoji render sites, document exceptions (target 3.0.0) (2026-10-31, OpenCode/Big Pickle)
- 323. NEW — T323: Verify all registered glyphs have WebPs, keep fallback (target 3.0.0) (2026-10-31, OpenCode/Big Pickle)
- 324. NEW — T324: Bump to 3.0.0, full battery (check_release + play_matrix + axe), full screenshot battery, archive, update STATUS (target 3.0.0) (2026-10-31, OpenCode/Big Pickle)
- 325. NEW — T325: Update all project/games docs, lessons if needed, DECISIONS final note (target 3.0.0) (2026-10-31, OpenCode/Big Pickle)
