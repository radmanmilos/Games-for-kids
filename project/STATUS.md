# Project status

**Last verified:** 2026-11-23
**Repository:** radmanmilos/Games-for-kids
**Current branch:** `claude/cat-forest-village`
**Version:** `3.0.20` (main) / `2.4.0` (cat_forest manifest, on main)

## Driving engine work (complete on `main`, CI green)

- Driving car sizing fix (task 453): headless probe confirmed `heroBox` = 186.5×128 at desktop, `player` = 186.5×128, aspect preserved (440/302 source = 1.457 vs 186.49/128 = 1.456); driving smoke passes with `heroW:186.49`; `check_fast.js` 10/10 green; `build_offline.js` regenerated sw-cache-list.json (556 entries) + offline-manifest.json (555 entries). Temp probe `tools/probe_car.js` deleted.
- CI verified green on `main` (`05edfd1` — CI + CodeQL both success).
- Obstacle knockback smoke test fix: removed forced `o.width = 200; o.height = 200;` in `tools/adventure_smoke.js`; committed `05edfd1`, pushed, CI green.

## Cat Forest Village expansion (Phase 1 complete, Phase 2 pending)

Branch `claude/cat-forest-village`. Base game CF-00..CF-21 complete on `main` (05edfd1), CI green, `check_fast.js` 10/10, driving 25/25, ocean 27/27, cat_forest smoke 221 checks.

### Task 464 — Phase 1: art direction & scene prototypes (DONE, 2026-11-23, OpenCode/Big Pickle)

All 6 Phase 1 deliverables complete:
- Village-house concept `resources/General_reviews/Cat_Forest/village_house_concept.png`
- Cat illustration `village_cat_prototype.png`
- Fish basket `village_fish_basket_prototype.png`
- Decoration `village_decoration_prototype.png`
- Village scene mockup `village_scene_mockup.png` (three feeding positions on porch, pond/woodland hotspots, workshop shed, diary-on-table, empty pot rings)
- Palette/camera/shadow/scale guide `resources/General_reviews/Cat_Forest/ART_DIRECTION.md`

Four prompt briefs under `resources/General_reviews/Asset_Generation/prompts/` (`cat_forest_village_house.md`, `cat_forest_village_cat.md`, `cat_forest_village_fish_basket.md`, `cat_forest_village_decoration.md`, `cat_forest_village_scene.md`). ~1,470 of 10,000 daily neurons used (17 runs).

### Task 465 — Phase 2: village hub + 3 feeding spots (DONE, 2026-11-24, OpenCode/Big Pickle)

All Phase 2 deliverables complete:
- Village house + garden decorative elements in `game/pages/cat_forest.html` inside `#cf-scenery` (CSS + markup, aria-hidden, no visible text)
- `FEED_ANCHORS` table pins 3 fixed stage-fraction anchors (`porch.feed.1/2/3` at x 0.26/0.50/0.74, y 0.62, plates 0/1/2)
- Plates positioned at anchor fractions via CSS percentages (`left:26%/50%/74%; top:62%`) so spot is stable across all viewports
- Scene state machine: `SCENES=['village','pond','woodland','workshop','diary']`, `DEFAULT_SCENE='village'`, `state.scene`, `enterScene/exitScene/setScene`, `data-scene` on `#app` in `render()`
- Hook exposes `anchors: FEED_ANCHORS` in `window.__catForest.data`
- Smoke asserts feeding anchors match `FEED_ANCHORS` fractions (≤1% tol) across all 4 target viewports
- Existing cat feeding works; no feeding anchor moves between viewport sizes; existing save data readable
- `check_fast.js` 10/10 green, `build_offline.js` regenerated manifest, docs synced

### Next: Phase 3 deferred — pond/woodland/workshop/diary scenes

## Open tasks (from ACTIVE.md)

- 465 (Phase 2 village hub + 3 feeding spots): DONE
- 435 (Gate 5 family rollout): NEW
- 436 (Gate 6: 11-world regression): NEW
- 437 (Little Explorer full review + screenshots): NEW — recommend CLOSE
- 444–452 (art reorganization phases 3–5): NEW — mostly generate + validate
- 391/392/396/398/415: LIMITED — need a real device or manual review

## Deferred (recorded in `project/DECISIONS.md`)

- Converting the 11 background scenes to WebP (measured 2–8% of PNG size).
- devicePixelRatio canvas scaling.

## Generation pipeline

- Cloudflare credentials staged at `%TEMP%\opencode\cloudflare-creds.json` (never in repo).
- Cat Forest painted art direction approved by user 2026-11-23 (Phase 1 prototypes).