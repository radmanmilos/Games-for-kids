# Project status

**Last verified:** 2026-11-09  
**Repository:** radmanmilos/Games-for-kids  
**Current branch:** `feature/little-explorer-art-integration` at `4797199` → bumped to version `3.0.8` for service-worker cache bust (uncommitted, see below)  
**Main HEAD:** 5605c700e949becde084db3427245b6d8e788373 (merge of PR #23)

## Repository and verification

- PR #22, `fix(explorer): switch world scenes and reuse approved art`, is merged. Merge commit: `beb4683811ac210463167b348f783bdba100aa17`.
- `tools/kitty_smoke.js` contains the all-world scene mapping regression and approved-art reuse checks.
- No local test execution or browser playtest in this session. Do not describe those checks as passed.

## Task tracking

- Task 429 (umbrella, Little Explorer env-art integration): IN PROGRESS. Gates 0–4 complete (tasks 430–434 archived).
- Tasks 430–433: DONE and archived (Gate 0 repo verify, Gate 1 review, Gate 2 batch approvals 91/0/3/22, Gate 3 background integration).
- Task 434 (Gate 4 pilot): DONE — terrain-spring-top + pipe-spring glyphs generated, cut out to 512×512 WebP (15 KB / 6 KB), added to art-registry.js, integrated into kitty-standalone.js draw() with fillRect fallback for non-spring worlds.
- Task 435: NEW — Gate 5: family rollout (pipes, enemies/walkers, goals).
- Task 436: NEW — Gate 6: 11-world regression, screenshots, docs sync, commit.
- Other open/limited tasks: 391, 392, 396, 398, 415.

## Little Explorer — merged implementation

- All 11 world background images under `game/assets/scenes/` replaced with newly generated storybook-painted backgrounds (2048×592, opaque PNG, seamless horizontal tiling, sky-dominant, no baked gameplay elements, no bear/star content).
- Two pilot glyphs integrated into `game/assets/art/`: `terrain-spring-top.webp` (15 KB) and `pipe-spring.webp` (6 KB), both real-alpha WebP ≤60 KB.
- `art-registry.js` extended: 🍃 → terrain-spring-top, 🚰 → pipe-spring.
- `kitty-standalone.js draw()` modified: spring static platforms use `Art.draw(ctx, '🍃', ...)` with fillRect fallback; spring pipes use `Art.draw(ctx, '🚰', ...)` with fillRect fallback; non-spring worlds unchanged.
- `loadWorld()` tracks `sceneSrc` and updates the cached image source when the active world changes (`kitty-standalone.js:1072`).
- Approved existing art is reused for mouse, bat, penguin, snowman, crab, and the Spring goal house. Existing collectibles and the water-hazard fish accent already use approved art.
- Terrain and pipes remain procedural outside the spring pilot.
- Hazards and decorative particles remain procedural by design.
- No physics, collision geometry, enemy AI, spawn timing, platform movement, camera, controls, progression, HUD, or player sprites were changed beyond the pilot glyph draw calls.

## Visual QA and performance

- Backgrounds are approximately 564 KB–2.3 MB each and add offline payload. Measure load time, memory, and frame time on modest Android hardware (Task 398).
- Earlier screenshot review found only character-selection captures for Explorer, not PLAY-state evidence. Capture gameplay in all relevant world/viewport combinations before declaring environment visual QA complete.

## Generation pipeline

- Cloudflare credentials staged at `%TEMP%\opencode\cloudflare-creds.json` (never in repo). `tools/asset_generate.js` uses `flux-2-klein-4b` (~110 neurons per 1024×1024 glyph, ~219 per 2048×592 scene).
- ~4,592 of 10,000 free neurons used today (27 runs).
- Background candidates copied to `resources/General_reviews/Asset_Generation/Reference/` as style references for future generations.
- Gate 1 style-addendum/palettes/technical-contract accepted before generation. Gate 2 complete. Gate 3 complete. Gate 4 complete.
