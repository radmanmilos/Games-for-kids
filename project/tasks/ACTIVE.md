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
- 435. NEW — Gate 5: family rollout (pipes, enemies/walkers, goals) (2026-11-08, OpenCode/Nemotron-3.5-Super-VL)
- 436. NEW — Gate 6: 11-world regression, screenshots, docs sync, commit (2026-11-08, OpenCode/Nemotron-3.5-Super-VL)
- 437. NEW — Little Explorer full review + gameplay screenshots all worlds (2026-11-09, OpenCode/Big Pickle) — capture character-selection + in-game PLAY states for ALL 11 worlds (spring, summer, autumn, winter-explorer, underground, cave, water, savanna, japan, northpole, egypt) at 4 viewports: phone portrait (390×844), phone landscape (844×390), tablet (1024×800), desktop (1280×720). Verify art alignment (backgrounds, platforms, pipes, collectibles, goal, hero, enemies) and Serbian UI text readability. Output to resources/General_reviews/Screenshot_Review/. Output per-world contact sheets + per-viewport grid. Also verify Gate 5 art (terrain, pipes, enemies, walkers, goals, collectibles, hazards, decor) renders correctly in-game.
- 438. NEW — Art reorganization Phase 1: create category folder structure under game/assets/art/ (shared/{fruits,vegetables,animals/{wild,farm,forest,water,birds,insects},nature,objects,food-prepared,weather,transport,body,shapes}, game-specific: explorer,cat-forest,driving,ocean,space,dino,memory,puzzles,phonics,shapes,sorting,maze,compare,spatial,tracing,counting,rhythm,coloring,classroom)
- 439. NEW — Art reorganization Phase 1: move shared assets into category folders (~130 WebP: fruits, vegetables, wild/farm/forest/water/birds/insects animals, nature, objects, food-prepared, weather, transport, body, shapes)
- 440. NEW — Art reorganization Phase 1: move game-specific assets into game folders (cat-forest, driving, ocean, space, dino, memory, puzzles, etc.)
- 441. NEW — Art reorganization Phase 2: update art-registry.js with category subfolder paths
- 442. NEW — Art reorganization Phase 2: update kitty-standalone.js draw calls for new asset paths
- 443. NEW — Art reorganization Phase 2: update all other game JS files (animals, cat_forest, ocean, space, dino, driving, learning games, etc.) for new paths
- 444. NEW — Art reorganization Phase 3: generate missing terrain tiles for all 11 worlds via Cloudflare
- 445. NEW — Art reorganization Phase 3: generate missing pipes for remaining 10 worlds via Cloudflare
- 446. NEW — Art reorganization Phase 3: generate missing enemies (mouse, mole, bat, piranha, snake, oni, penguin, scorpion)
- 447. NEW — Art reorganization Phase 3: generate missing walkers (ladybug, bee, hedgehog, snowman, worm, spider, crab, meerkat, panda, scarab)
- 448. NEW — Art reorganization Phase 3: generate missing goals (house, mine, cave, submarine, hut, torii, igloo, pyramid)
- 449. NEW — Art reorganization Phase 3: generate missing collectibles (strawberry, watermelon, apple, carrot, banana, shell, grape, rice-ball, gift, star, heart)
- 450. NEW — Art reorganization Phase 3: cut out + QA all new assets (asset_cutout.js → 512×512 WebP ≤60 KB, asset_qa.js verification)
- 451. NEW — Art reorganization Phase 4: regenerate sw-cache-list.json + offline-manifest.json, sync docs/ mirror
- 452. NEW — Art reorganization Phase 5: run full validation (check_fast.js + check_release.js + game smokes)
- 415. LIMITED (2026-11-07, ChatGPT/GPT-6) — Spring pilot screenshot review incomplete: existing four viewport captures show the character-selection surface, not in-game PLAY states; capture and review real gameplay.
- 391. ASSESSED (limited) — Compare portrait scale measured at all four viewports.
- 392. LIMITED — Portfolio playtesting Sessions A–D require a real device.
- 396. LIMITED — Manual accessibility and input-interruption checks require a real device.
- 398. LIMITED — Measure performance and resilience on representative modest Android hardware.
