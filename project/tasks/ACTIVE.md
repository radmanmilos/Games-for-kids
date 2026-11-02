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

- 341. IN PROGRESS — Feedback batch 1: Classroom time/seasons art + celebrations emoticon replacement sweep (2026-11-02, Kilo/kilo-auto/free). Add painted art for classroom time-of-day scenes and seasons (generate missing via asset pipeline if absent). Sweep all celebrations to replace remaining emoticons with painted art where possible.
- 342. NEW — Feedback batch 2: Candy/cards art usage + puzzle image art generation (2026-11-02, Kilo/kilo-auto/free). Use existing card art in candy/cards game. Replace puzzle game images with generated painted art.
- 343. NEW — Feedback batch 3: Kitty explorer - rocket art on fast button, enemy art usage + generation (2026-11-02, Kilo/kilo-auto/free). Use rocket art for fast button, replace enemies with art where available, generate missing enemy art via pipeline.
- 344. NEW — Feedback batch 4: Ocean - fix fish direction, enemy art + generation (2026-11-02, Kilo/kilo-auto/free). Fix fish facing direction, replace enemies with art where available, generate missing.
- 345. NEW — Feedback batch 5: Spaceship - rotate rocket 90° to point forward, art usage + generation (2026-11-02, Kilo/kilo-auto/free). Rotate rocket to point forward, use art where available, generate missing.
- 346. NEW — Feedback batch 6: Cat forest - remove emoticons keep only art, fix food display on plate (2026-11-02, Kilo/kilo-auto/free). Remove emoticon fallbacks keeping only painted art; fix plate display to show proper food representation/name as intended.
- 347. IN PROGRESS — Classroom time-of-day art (2026-11-02, Kilo/kilo-auto/free). Map classroom time scenes (јутро/дан/вече/ноћ) to painted art. Add art entries to art-registry.js, update classroom.js to use Art.fill() properly, generate missing art via tools/asset_generate.js following existing pipeline (use references from assets/art).
- 348. NEW — Classroom seasons art (2026-11-02, Kilo/kilo-auto/free). Map classroom seasons (пролеће/лето/јесен/зима) to painted art. Add art entries, update classroom.js, generate missing seasonal art via asset pipeline.
- 349. IN PROGRESS — Global celebration sweep (2026-11-02, Kilo/kilo-auto/free). Audit game/shared/celebration.js and all celebration usages; replace remaining emoticons with painted art via Art system.
- 350. IN PROGRESS — Kitty Explorer rocket fast button + enemies (2026-11-02, Kilo/kilo-auto/free). Wire rocket.webp art to fast button in explorer/fastcat, replace enemies with painted art where available, generate missing enemy art via asset pipeline.
- 351. IN PROGRESS — Ocean enemies art + generation (2026-11-02, Kilo/kilo-auto/free). Replace ocean enemies with painted art where available (fish/crab/etc), generate missing via asset pipeline. Verify fish direction is correct.
- 352. IN PROGRESS — Puzzle images art generation (2026-11-02, Kilo/kilo-auto/free). Generate painted art for animal puzzle scenes/images via asset pipeline and integrate in animal_puzzle.js.
- 328. DEFERRED — T328 (user input needed): migrate hub/nav tile icons and shell-chrome glyphs (back buttons, parent/progress controls, mode buttons' leading emoji) to painted art. Parked: DECISIONS.md line 16 settles native emoji animals; hub tiles and chrome are composite/branding surfaces, not play-screen artwork. Needs user decision on whether painted icons are wanted there. (2026-11-01, OpenCode/Big Pickle)
