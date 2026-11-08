# Active tasks

Only **NEW / IN PROGRESS / DEFERRED** tasks live here (budget: 20 KB, checked by `node tools/check_docs.js`). Every finished task is in `archive/tasks/`, one line each in `INDEX.md`.

## Status legend

- NEW: not started
- IN PROGRESS: being worked on (say who/what model, and the date)
- DONE: completed (a dated note: who (tool + model), what, why)
- REVERTED / FIXED / DEFERRED / ABANDONED / RETIRED: terminal or parked (the note says why)

## How to work with this file

1. **Start:** add `- N. NEW — <title> (<date>, <tool/model>)` at the top of *Open tasks*. N = the "next task number" in `INDEX.md`. Flip it to IN PROGRESS when you start.
2. **Finish:** mark it DONE with a dated note: who (tool + model), what, why. Keep the entry short; put long reasoning in the entry only if a future session needs it.
3. **End of session:** run `node tools/archive_tasks.js`. It moves DONE / FIXED / REVERTED / ABANDONED / RETIRED entries to `archive/tasks/` and adds their `INDEX.md` lines. (`--dry-run` shows what would move.)
4. **Do** not copy the task into README, CONTRIBUTING or STATUS. `project/STATUS.md` is overwritten at session end instead.

## Open tasks

- 430. DONE (2026-11-08, OpenCode/Nemotron-3.5-Super-VL) — Gate 0 verified: repo root E:\GitHub\Games for kids; branch feature/little-explorer-art-integration created from main bcebd6a; working tree clean except untracked review package (preserved); both source atlases present (1536×1024 RGBA); package tree verified (116 candidates, 9 review sheets, CSV/MD TOC); Gate 1 docs read — style addendum, technical contract, palettes all "Proposed — Gate 1 acceptance pending"; no Gate 1 acceptance evidence in DECISIONS.md; item-level authorization (18 terrain/pipe prompts) does NOT waive the gate — no generation until accepted; game source inspected (WORLDS line 604, loadWorld line 972, draw 1614, drawExplorerArt 1815, drawEnemy 1823, drawWalker 2041, drawGoal 2303, art-registry.js); tools asset_cutout.js/asset_qa.js/check_art.js present; node v24.15.0 + ffmpeg 9.0.2 available.
- 431. DONE (2026-11-08, OpenCode/Nemotron-3.5-Super-VL [terrain–hazards + decorations 01–08] + OpenCode/MiMo-V2.6-Flash [decorations 09–16, collectibles, backgrounds; vision verified via ZQX7-OK readback]) — Gate 1 review of all 9 families (116/116 candidates) completed in guide §6.1 order. Outcome: 90 READY FOR REVIEW, 3 NEEDS WORK (terrain 01/04/11 — pixel recrop needed, agent cannot edit pixels), 23 REJECTED (5 header-label false positives, 1 cross-family duplicate hazards_10=platforms_09, 6 no-Explorer-consumer art [frog/snail/potion/chest/key/music-notes], 11 backgrounds reference-only per guide). Key findings: all 11 world collectible emoji already resolve via ART_REGISTRY to approved .webp (existing art takes precedence); strongest new-consumer candidate = submarine (water goal drawn procedurally at kitty-standalone.js:2571); alternates to approved reused art flagged (snowman/penguin/crab/bat/house/gift/strawberry/apple/star/heart/daisy/tulip) — do NOT replace without explicit approval; static decorations have no consumer (drawDecor is particle-only); Explorer roster gaps still absent from atlas (scorpion/meerkat/panda/scarab). CSV extended to 16 columns + all 116 rows carry semantic_name/art_status/review_note (verified by tools/.cache/toc_summary.js); TABLE_OF_CONTENT.md inventory + EXTRACTION_LOG.md passes 1–2 appended. No approval, no technical QA, no integration — Gate 2 pending.
- 432. IN PROGRESS (2026-11-08, OpenCode/MiMo-V2.6-Flash) — Gate 2: prepare family review batches; obtain user artistic approval (one family at a time per guide §9)
- 433. NEW — Gate 3: technical export + QA (cutout → WebP ≤60 KB; check_art/asset_qa; registry) (2026-11-08, OpenCode/Nemotron-3.5-Super-VL)
- 434. NEW — Gate 4: pilot integration (one terrain + one platform in one world) (2026-11-08, OpenCode/Nemotron-3.5-Super-VL)
- 435. NEW — Gate 5: family rollout (pipes, enemies/walkers, goals) (2026-11-08, OpenCode/Nemotron-3.5-Super-VL)
- 436. NEW — Gate 6: 11-world regression, screenshots, docs sync, commit (2026-11-08, OpenCode/Nemotron-3.5-Super-VL)
- 429. IN PROGRESS (2026-11-07, ChatGPT/GPT-6) — Umbrella: Little Explorer environment-art integration. Execution decomposed into Gates 0–6 (tasks 430–436). Generation blocked until Gate 1 acceptance is documented; item-level authorization does not waive the gate.
- 415. LIMITED (2026-11-07, ChatGPT/GPT-6) — Spring pilot screenshot review incomplete: existing four viewport captures show the character-selection surface, not in-game PLAY states; capture and review real gameplay.
- 391. ASSESSED (limited) — Compare portrait scale measured at all four viewports.
- 392. LIMITED — Portfolio playtesting Sessions A–D require a real device.
- 396. LIMITED — Manual accessibility and input-interruption checks require a real device.
- 398. LIMITED — Measure performance and resilience on representative modest Android hardware.
