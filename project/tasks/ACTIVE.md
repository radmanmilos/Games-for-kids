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
4. Do **not** copy the task into README, CONTRIBUTING or STATUS. `project/STATUS.md` is overwritten at session end instead.

## Open tasks

- 428. DONE — Integrate all remaining 7 scenes into `draw()`: added `scene` field to Underground/Cave/Water/Savanna/Japan/NorthPole/Egypt world entries; sceneImg draws after `ctx.translate(-cameraX, 0)`; all validation green: check_fast.js 10/10, kitty_smoke.js 38/38; pilot screenshots captured at 4 viewports; inventory rows → USER-APPROVED.
- 427. DONE — Egypt background generated: `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/little-explorer/scenes/scene-egypt.png` (2048×592 opaque RGB, 943KB, warm sandstone desert). USER-APPROVED by user — integrated.
- 426. DONE — North Pole background generated: `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/little-explorer/scenes/scene-northpole.png` (2048×592 opaque RGB, 1.03MB, cool polar ice). USER-APPROVED by user — integrated.
- 425. DONE — Japan background generated: `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/little-explorer/scenes/scene-japan.png` (2048×592 opaque RGB, 1.53MB, soft cherry-pink). USER-APPROVED by user — integrated.
- 424. DONE — Savanna background generated: `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/little-explorer/scenes/scene-savanna.png` (2048×592 opaque RGB, 1.77MB, warm golden grassland). USER-APPROVED by user — integrated.
- 423. DONE — Water background generated: `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/little-explorer/scenes/scene-water.png` (2048×592 opaque RGB, 908KB, deep aquatic blue). USER-APPROVED by user — integrated.
- 422. DONE — Cave background generated: `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/little-explorer/scenes/scene-cave.png` (2048×592 opaque RGB, 1.56MB, cool cave-grey, no sky visible). USER-APPROVED by user — integrated.
- 421. DONE — Underground background brief + generation + user approval: `resources/General_reviews/Asset_Generation/prompts/scene-underground.md` + `assets_work_in_progress_bundle/little-explorer/scenes/scene-underground.png` (2048×592 opaque RGB, 1.74MB, subterranean earth brown, no sky visible). APPROVED by user — integrated.
- 420. DONE — Integrate Winter scene into `draw()`: added `scene: 'winter-explorer'` to Winter world entry (filename suffix avoids clash with existing 1024x1024 scene-winter.png used by animal_puzzle.js); sceneImg draws it after `ctx.translate(-cameraX, 0)`. All validation green: check_fast.js 10/10, kitty_smoke.js 38/38. Pilot screenshots captured at 4 viewports.
- 415. DONE — Spring pilot review: 4 viewport screenshots captured (390×844, 844×390, 820×1180, 1180×820) via `tools/screenshot.js --review=Screenshot_Review --pages=explorer --task=415`; no browser runtime errors; kitty_smoke.js 38/38 pass; check_fast.js 10/10 green. User-approved Spring scene integrated. Pilot PASSED — ready for Phase 4 mass production (task 416: Summer).
- 414. DONE — Integrate Spring scene into `draw()`: added `sceneImg` variable, `scene: 'spring'` to Spring world entry, scene image loading in `loadWorld()`, replaced procedural sky/hills/clouds with tiled scene image after `ctx.translate(-cameraX, 0)` in `draw()`. Copied `scene-spring.png` to `game/assets/scenes/`. All 38 `kitty_smoke.js` checks pass; collision/gameplay unchanged.
- 413. DONE — QA + user visual review: Spring scene APPROVED by user at `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/little-explorer/scenes/scene-spring.png` (2048×592 wide horizontal strip, opaque RGB).
- 412. DONE — Generate Spring background: first run (1024×1024 square with bear — WRONG, deleted). Second run: `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/little-explorer/scenes/scene-spring.png` (2048×592 wide horizontal strip, opaque RGB, 798KB, only star.png as reference). QA passes technically; small-contrast 17.75 (expected for sky background).
- 411. DONE — Spring background brief: `resources/General_reviews/Asset_Generation/prompts/scene-spring.md`; mandatory preflight passed; dry-run verified prompt composes with star.png (no bear subject). Depth-safe revision: sky-dominant, distant hills high on horizon, NO baked ground/terrain/gameplay elements (2D platformer constraint).
- 410. DONE — Performance and fallback strategy: `resources/General_reviews/Asset_Generation/EXPLORER_PERFORMANCE.md` — modest Android targets (FPS, memory, load, transitions, GC, canvas draw, decode, failed-image), emoji/procedural fallback via Art.js, cache/memory control, headless verification path; real-device measurement (task 398) remains LIMITED/outstanding.
- 409. DONE — Gameplay entity ↔ visual asset mapping: `resources/General_reviews/Asset_Generation/EXPLORER_MAPPING.md` — every `draw()` call-site mapped to asset or documented procedural retention; enemy×world, goal×world, collectible×world tables; decor/hazard retention rationale.
- 408. DONE — Asset loading / registry plan: `resources/General_reviews/Asset_Generation/EXPLORER_LOADING.md` — registry resolves backgrounds/terrain/platforms/entrances/enemies/hazards/collectibles/goals/decor; stable IDs, world→family mapping, safe fallback, dev-time warning, no remote URLs, cache images; world→family mapping table.
- 407. DONE — Renderer integration design: `resources/General_reviews/Asset_Generation/EXPLORER_INTEGRATION.md` — data-driven world/element-ID → asset mapping in `draw()`; gameplay/collision/physics/camera unchanged; alpha bounds never replace collision; parallax only on backgrounds; stable z-order; no per-frame allocations; per-call-site mapping.
- 406. DONE — Asset inventory: appended "Little Explorer — World Environment (proposed, Phase 1 task 406)" section to `ASSET_INVENTORY.md` — 40 PROPOSED rows (11 world backgrounds, terrain/platform/pipe families, 8 pipe enemies, 11 walkers, 3 hazards, 11 collectibles, 9 goals), all PROPOSED (not approved for generation), scenes opaque vs glyphs alpha, hero/HUD out of scope. `env-spring-bg` row → USER-APPROVED / TECHNICAL QA MEASURED. Restored displaced "Production corrections — task 358" heading.
- 405. DONE — Asset-family technical contract: `resources/General_reviews/Asset_Generation/EXPLORER_TECHNICAL_CONTRACT.md` — placement rule (art/ 512×512 alpha WebP glyphs vs scenes/ opaque), coordinate/scale conventions, sprite/frame notes, transparency/edges, 60 KB cap, loading/fallback, naming/inventory IDs, per-category notes, §4.5 depth constraints for 2D platformer scenes.
- 404. DONE — World palette sheets: `resources/General_reviews/Asset_Generation/EXPLORER_PALETTES.md` — one sheet per 11 world (primary/secondary/accent colours, ground/platform materials, background atmosphere, hazard colours, enemy contrast, goal landmark colours), derived from current WORLDS colours as harmony base + EXPLORER_STYLE_ADDENDUM shared family; each world distinct identity, all within warm/muted storybook family.
- 403. DONE — Environment-art addendum: `resources/General_reviews/Asset_Generation/EXPLORER_STYLE_ADDENDUM.md` — shared art rules for all 11 worlds (shape, paint/surface, contours, light/shading, palette, faces, detail budget, composition, consistency), asset-family standards, technical export requirements, preserved-procedural list, per-asset review checklist.
- 402. DONE — Screenshot audit: `resources/General_reviews/Screenshot_Review/TABLE_OF_CONTENT.md` — explorer has 4 viewport shots captured 05.11.2026 under task 379, but no `__PLAY` in-game state variants. Coverage is baseline-only.
- 401. DONE — Asset map: `resources/General_reviews/Asset_Generation/EXPLORER_ASSET_MAP.md` — 11 worlds × every visual category mapped to current `draw()` implementation and proposed treatment.
- 400. DONE — Source audit: explorer.html + kitty-standalone.js render pipeline, WORLDS registry, draw functions, collision, asset loading.
- 399. DONE — Baseline record: repo HEAD `a11c919` → `616f7a1` (committed), all tasks 388–398 terminal.
- 391. ASSESSED (limited) — Compare portrait scale measured at all four viewports.
- 392. LIMITED — Portfolio playtesting Sessions A–D require a real device.
- 396. LIMITED — Manual accessibility and input-interruption checks require a real device.
- 398. LIMITED — Measure performance and resilience on representative modest Android hardware.
