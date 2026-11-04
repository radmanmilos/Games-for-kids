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

- 358. NEW — Art integrity: re-encode the 6 opaque/mislabelled assets, remap crab+octopus, register every orphaned art file (2026-11-04, OpenCode/Big Pickle)
  - `game/assets/art/{crab,octopus,shark,sun,sunrise,sunset}.webp` are PNG bytes (magic `89 50 4E 47`), rgb24 1024², 0% alpha — 7.6 MB of the 11.9 MB art payload. Re-cut them to real 512² alpha WebP. Remap `🦀→animal-crab`, `🐙→animal-octopus` (transparent, currently unused); re-cut `shark`; keep `sun/sunrise/sunset` only where a transparent cut-out is legitimate (classroom time tile, cat-forest toggle) and stop registering them where the asset is a full-bleed scene.
  - Register the 15 orphaned art files against their live glyph sites: `🦕 animal-dinosaur`, `🌺 flower-hibiscus`, `🍭 lollipop`, `🍙 food-rice-ball`, `🎁 object-gift`, `⚓ object-anchor`, `💰 object-money-bag`, `🐋 animal-whale`, `🚩 object-flag`, `🐞 animal-ladybug`, `🍀 plant-clover`, `🌷 flower-tulip`, `🦉 owl`, `🧩 puzzle-piece`, `🐤/🐥 chick`; fold `🐠` into the existing fish stem.
  - Why: children currently see cream squares in ocean (shark/octopus/crab), classroom time tiles and the cat-forest day/night toggle, while 15 paid-for illustrations are unreachable.
  - Done when: `node tools/art_smoke.js` green, `detectFormat` reports webp for all 161, every glyph art file has a registry consumer, docs + offline manifest synced, review screenshots refreshed for ocean + classroom + cat_forest.

- 359. NEW — Painted art on the last emoji surfaces: hub, classroom/tracing/matching buttons, racing3d decor (2026-11-04, OpenCode/Big Pickle)
  - `index.html:331-339` loads no `art-registry.js`/`shared/art.js`, so all 30+ hub tiles (`:273-325`) are static emoji; `classroom.html:288-293,299-302`, `tracing.html:196-199` and `animal_memory.html:66` (card back `content:"🃏"`) hard-code glyphs; `racing3d.mjs:805-821` paints every decor billboard with `cg.fillText`, and `:2199-2205` builds world cards from raw emoji.
  - Fix: load the art pipeline where it is missing, run the static buttons through `Art.fill`, switch racing3d decor to `Art.image()` textures (29 of 32 decor glyphs already have art) and the world cards to `Art.html`. Animal Puzzle sea scene `🐠/🐬/🦀` (`animal_puzzle.js:8`) follows the registry fixed by 358.
  - Done when: `node tools/scan_glyphs.js` shows no child-facing glyph that has art mapped but is still rendered as text; hub/racing3d smokes green; screenshots refreshed for hub, classroom, tracing, matching, racing3d.

- 360. NEW — Art-integrity gates in `check_fast` (2026-11-04, OpenCode/Big Pickle)
  - Nothing currently enforces that `game/assets/art/*.webp` really is WebP, is 512², or has alpha; nothing notices an art file with no consumer. `tools/lib/imagefile.js#detectFormat` and `tools/asset_qa.js` already measure all three facts, they are just never run over the shipped folder.
  - Add `tools/check_art.js`: format (magic bytes) + dimensions + alpha coverage for every glyph in `game/assets/art/`, registry-coverage (every mapped stem has a file, every file has a consumer) and an orphan report. Wire it as a `check_fast` stage with a failing exit code and an explicit fix message; scene backgrounds live in `game/assets/scenes/` and are exempt.
  - Done when: `node tools/check_fast.js` includes the new stage, a deliberate negative test (mutate one file, expect FAIL, restore from a copy) proves it fails, and CI's `fast` job inherits it.

- 361. NEW — Animal Puzzle painted scene backgrounds (2026-11-04, OpenCode/Big Pickle)
  - Task 352 was marked DONE but `git log -- game/games/animal_puzzle.js` stops at `0ca3c0e`; no scene art exists. Scenes (`animal_puzzle.js:2-12`, `paint()` at `:200`) are canvas gradients plus procedural decor.
  - Generate 8 painted backgrounds (park, house, savanna, sea, forest, farm, space, snow) through `asset_generate.js` → bundle → `game/assets/scenes/`, wire them as the `paint()` backdrop layer with the existing gradient as fallback, keep the 64 px animal row on top.
  - Done when: each scene shows painted art, generation QA + user visual approval recorded in `ASSET_INVENTORY.md`/`PROGRESS.md`, puzzle smoke green, screenshots refreshed.

- 362. NEW — Remaining unmapped child-facing glyphs: generate or accept (2026-11-04, OpenCode/Big Pickle)
  - Still no art and not deliberately excluded: `🌀` (space), `🌌` (space + racing night world), `☃️` (racing snow world), `❤️` (cat-forest match effect), `😉` (candy). Audio/UI glyphs (`🔊 🔇 🎵 🎹 🔒 📊 📥 🔄 🗑 ⬆`) and the documented exclusions (`⬛ 📖 ✖️`) stay emoji.
  - Generate the five through the pipeline, or record an explicit "accepted emoji" decision in `project/DECISIONS.md` for any the user declines.
  - Done when: `tools/check_art.js` (360) reports zero unmapped child-facing glyphs, each outcome is documented.

- 328. DEFERRED — T328 (user input needed): migrate hub/nav tile icons and shell-chrome glyphs (back buttons, parent/progress controls, mode buttons' leading emoji) to painted art. Parked: DECISIONS.md line 16 settles native emoji animals; hub tiles and chrome are composite/branding surfaces, not play-screen artwork. Needs user decision on whether painted icons are wanted there. (2026-11-01, OpenCode/Big Pickle)
