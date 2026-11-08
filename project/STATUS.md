# Project status

**Last verified:** 2026-11-07  
**Repository:** radmanmilos/Games-for-kids  
**Main HEAD:** 5605c700e949becde084db3427245b6d8e788373 (merge of PR #23)  
**Current documentation branch:** docs/explorer-gate1-preflight-429

## Repository and verification

- PR #22, `fix(explorer): switch world scenes and reuse approved art`, is merged. Merge commit: `beb4683811ac210463167b348f783bdba100aa17`.
- The merged Little Explorer engine and generated docs mirror are byte-for-byte identical at the fetched repository contents (same Git blob SHA `a62f07ed54d0c0a6d6f095dc40554a14e1cf012c`).
- `tools/kitty_smoke.js` contains the all-world scene mapping regression and approved-art reuse checks. These tests have not been executed in this session.
- The available GitHub workflow lookup returned no PR-triggered runs for the merge commit. This does not establish that no other Actions run exists; post-merge CI status remains unverified here.
- No local checkout, local test execution, browser playtest, or real-device test is available through this session. Do not describe those checks as passed.

## Task tracking

- Task 429 remains IN PROGRESS. The scene-switch fix and reuse of approved art were merged via PR #22; remaining work is terrain/pipe art generation and integration, platform art planning, remaining enemies/walkers/goals, and real PLAY-state visual review.
- Task 415 remains LIMITED: the earlier four Explorer screenshots showed the character-selection surface rather than gameplay. Fresh PLAY-state captures are still required.
- Tasks 399–414 and 420–428 were archived by PR #22. The next task number remains 430.
- Other open/limited tasks: 391 (compare portrait feedback), 392 (real-device playtesting), 396 (accessibility/input interruption), 398 (modest Android performance), 415, and 429.

## Little Explorer — merged implementation

- All 11 world background images exist under `game/assets/scenes/`. They are single horizontally tiled images, not multi-layer parallax backgrounds.
- `loadWorld()` now tracks `sceneSrc` and updates the cached image source when the active world changes. The smoke test contains a regression that iterates all 11 worlds.
- Approved existing art is reused for mouse, bat, penguin, snowman, crab, and the Spring goal house. Existing collectibles and the water-hazard fish accent already use approved art. Procedural fallbacks remain while images load.
- Terrain and pipes remain procedural. Task 429 has 18 item-level user-authorized candidates (8 terrain, 10 pipe); all 18 prompts have the required brief metadata and exact `--- prompt ---` marker. However, the shared Explorer art-direction addendum, world palettes, and technical contract still explicitly say **Gate 1 acceptance pending**. Item-level authorization does not waive that project-wide gate. Do not generate until Gate 1 is accepted, the current bear/star references and WIP bundle are inspected, and duplicate/preflight checks are complete.
- Four additional prompt files — `terrain-summer-top`, `terrain-savanna-top`, `terrain-water-top`, and `pipe-japan` — are outside the 18-item list. Their status in the gitignored local WIP bundle is unknown; verify locally before generating them.
- Remaining art families: static/moving platforms; enemies mole, piranha, snake, oni, scorpion; walkers bee, hedgehog, worm, spider, meerkat, panda, seal, scarab; and goal structures mine, cave, submarine, hut, torii, igloo, pyramid. Ladybug remains a candidate, not approved for Explorer reuse. Spring house is integrated; other seasonal house goals remain procedural.
- Hazards and decorative particles remain procedural by design. Collectibles require no new generation.

## Visual QA and performance

- Earlier screenshot review found only character-selection captures for Explorer, not PLAY-state evidence. Capture gameplay in all relevant world/viewport combinations before declaring environment visual QA complete.
- The Water scene has a visually strong seabed/seaweed band near its lower edge; inspect it against the actual gameplay plane.
- Backgrounds are approximately 2048×592 and add offline payload. Measure load time, memory, and frame time on modest Android hardware (Task 398).
- No physics, collision geometry, enemy AI, spawn timing, platform movement, camera, controls, progression, HUD, or player sprites were changed in PR #22.

## Generation limitation

- The project uses the Cloudflare-backed local generation pipeline followed by cutout and technical QA to produce 512×512 alpha WebP assets.
- Cloudflare quota was reported exhausted at 10,000/10,000. Local credentials and the gitignored WIP bundle are unavailable in this GitHub-only session. No new art was generated or integrated.
- ChatGPT ImageGen is not a drop-in replacement for the project pipeline. Do not substitute it for production assets without explicit approval.
- Generation preflight, Gate 1 acceptance, local WIP duplicate checks, smoke execution, and in-game visual review remain outstanding. The four extra prompts (`terrain-summer-top`, `terrain-savanna-top`, `terrain-water-top`, `pipe-japan`) are old-format drafts without the normalized brief header/marker and are not part of the 18 authorized candidates; do not silently add them to the batch.
