# Project status

**Last verified:** 2026-11-09  
**Repository:** radmanmilos/Games-for-kids  
**Current branch:** `feature/little-explorer-art-integration` at `97205cc` (pushed, secrets gate 4/4)  
**Main HEAD:** 5605c700e949becde084db3427245b6d8e788373 (merge of PR #23)

## Repository and verification

- PR #22, `fix(explorer): switch world scenes and reuse approved art`, is merged. Merge commit: `beb4683811ac210463167b348f783bdba100aa17`.
- `tools/kitty_smoke.js` contains the all-world scene mapping regression and approved-art reuse checks.
- No local test execution or browser playtest in this session. Do not describe those checks as passed.

## Task tracking

- Task 429 (umbrella, Little Explorer env-art integration): IN PROGRESS. Gates 0–3 complete (tasks 430–433 archived).
- Task 430 (Gate 0): DONE. Repo verified, branch created, package tree verified.
- Task 431 (Gate 1 review): DONE. All 116 candidates reviewed across 9 families.
- Task 432 (Gate 2): DONE. All 8 batches approved — CSV 91 APPROVED / 0 READY / 3 NEEDS WORK / 22 REJECTED (116 total). Backgrounds excluded from approval batches (reference-only).
- Task 433 (Gate 3): DONE. All 11 world backgrounds regenerated via Cloudflare flux-2-klein-4b, QA-verified (2048×592, opaque PNG), integrated into `game/assets/scenes/scene-<world>.png` replacing all 11 existing scenes. Originals SHA256-backed to `%TEMP%\opencode\scenes_backup_before_gate3\`.
- Task 434 (Gate 4): NEW — pilot integration (one terrain + one platform in one world).
- Tasks 435–436: NEW — family rollout, 11-world regression, screenshots, docs sync.
- Other open/limited tasks: 391, 392, 396, 398, 415.

## Little Explorer — merged implementation

- All 11 world background images under `game/assets/scenes/` have been replaced with newly generated storybook-painted backgrounds (2048×592, opaque PNG, seamless horizontal tiling, sky-dominant, no baked gameplay elements, no bear/star content).
- `loadWorld()` tracks `sceneSrc` and updates the cached image source when the active world changes (`kitty-standalone.js:1072`).
- Approved existing art is reused for mouse, bat, penguin, snowman, crab, and the Spring goal house. Existing collectibles and the water-hazard fish accent already use approved art.
- Terrain and pipes remain procedural.
- Hazards and decorative particles remain procedural by design.
- No physics, collision geometry, enemy AI, spawn timing, platform movement, camera, controls, progression, HUD, or player sprites were changed.

## Visual QA and performance

- Backgrounds are approximately 564 KB–2.3 MB each and add offline payload. Measure load time, memory, and frame time on modest Android hardware (Task 398).
- Earlier screenshot review found only character-selection captures for Explorer, not PLAY-state evidence. Capture gameplay in all relevant world/viewport combinations before declaring environment visual QA complete.

## Generation pipeline

- Cloudflare credentials staged at `%TEMP%\opencode\cloudflare-creds.json` (never in repo). `tools/asset_generate.js` uses `flux-2-klein-4b` (~219 neurons per 2048×592 scene).
- ~4,355 of 10,000 free neurons used today (25 runs).
- Background candidates copied to `resources/General_reviews/Asset_Generation/Reference/` as style references for future generations.
- Gate 1 style-addendum/palettes/technical-contract accepted before generation. Gate 2 complete. Gate 3 complete.
