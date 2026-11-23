# Project status

**Last verified:** 2026-11-23
**Repository:** radmanmilos/Games-for-kids
**Current branch:** `claude/adventure-playability`
**Version:** `3.0.18`

## Task 463 — Phase 1 adventure engine (this session, Kilo/openrouter/free)

Extended the shared adventure engine (`game/games/adventure.js`) with the Phase 1 fixes from `resources/General_reviews/OCEAN_DRIVING_FIXES.md` (1A–1E), applied to all four games that ride the engine (driving, ocean, space, dino-grounded paths):

- **1A/1B — playfield rectangle + entity scale.** `computePlayfield()` measures the real HUD (above) and control (below) DOM rects on every resize and builds `pf = {top, bottom, left, right, height}`, then `u = clamp(pf.height / 520, 0.5, 1)`. Hero clamps, obstacle/coin Y, and the goal all use `pf`; obstacle/coin sizes scale by `u`.
- **1C — compact HUD on short screens.** When `canvas.height < 500`: `#adv-game` gets `adv-compact`, the page title hides, the score card shrinks to icon+number (world-name line dropped), and the HUD band caps at 52 px (measured) ≤ 56 px.
- **1D — reaction-time budget.** Scroll speed scales by `clamp(canvas.width/1024, 0.6, 1)` in `updateDrive`, so obstacle-enters-screen-to-hero time stays ≥ 2.0 s at every viewport (measured ≈ 4.5 s at 844×390).
- **1E — debug overlay.** `?debug=pf` draws the playfield rect, the hero hitbox, every obstacle hitbox and the shadow baseline (no network, no UI text).
- **Ocean coin Y bug.** Coins divided by `goalDy` but ocean `dy` values exceed it, sending coins to `y=1112` (off-screen). Fixed to use the level's true `maxDy`.

Exposed read-only `pf`, `scrollScale`, `isCompact`, `debug` on `window.__adv` for smoke guards.

## Verification

- `node tools/check_fast.js`: 10/10 green.
- `node tools/build_offline.js`: 546 cache entries / 545 manifest; `bash tools/sync-docs.sh`: `docs/` mirrors `game/` (547 files).
- Smokes: `driving_smoke.js` PASS, `ocean_smoke.js` PASS, `dino_smoke.js` PASS, `space_smoke.js` PASS, `adventure_smoke.js` PASS — all report "no browser runtime errors".
- Headless probe at 844×390: `adv-compact` applied, title hidden, HUD band 52 px, pf 116→292, `scrollScale` 0.824 → reaction ≈ 4.5 s.
- Review screenshots refreshed: `screenshot.js --review=Screenshot_Review --pages=driving,ocean --task=462` → 8 shots (4 viewports × 2 games), no browser runtime errors.
- Version: `3.0.17` → `3.0.18` (C = minor segment).

## Open tasks (from ACTIVE.md)

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
- Driving/ocean painted art already shipped (task 462); Phase 1 only touched the engine + CSS, no new art.
