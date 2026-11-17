# Project status

**Last verified:** 2026-11-17  
**Repository:** radmanmilos/Games-for-kids  
**Current branch:** `claude/explorer-ui-kit` (off main `bdcc3d7`, task 458 STEP 3-5, not yet committed/pushed)  
**Main HEAD:** `bdcc3d7` (PR #28, task 458 STEP 0-2) version `3.0.15`  
**PR to open:** "Explorer paper UI kit, painted pits, ground-cap alignment" → `main` (do not merge without the user's visual sign-off)

## Uncommitted changes (working tree, not yet committed)

- Paper UI kit: `game/styles/design-tokens.css` (paper tokens + inline SVG-noise grain), `game/styles/components.css` (`.ps-paper`, `.ps-pill--paper`, `.ps-disc--paper`, `.ps-card--paper`, `.ps-panel--paper`, `.ps-btn--paper`), `game/pages/explorer.html` (HUD chips/discs, three modals, hero tiles, action button).
- Worlds menu: `buildWorldsMenu()` rewritten as 11 paper cards with a 400×116 thumbnail of each world's own scene (`game/assets/ui/world-thumbs/`, 11 PNG, 746 391 B); Serbian name as DOM text.
- Ground caps: `stemBox()` measures `solidTop` and `tileStem()` crops the painted haze above it (measured 17/15/0 px on spring/savanna/autumn); goals and pipes still anchor to `box.y`.
- `drawGoal`: Spring-only exception removed — all four seasons draw `goal-house`.
- Pits: `pit-{water,lava,spikes}.webp` (768×202, 16/11/18 KB) in `game/assets/ui/pits/`, drawn by `pitStripPainted()` inside `drawPitHazards()`; flat gradient/fillRect fallback and procedural animation kept.
- `game/manifest.json` 3.0.15 → 3.0.16; `sw-cache-list.json` (499) + `offline-manifest.json` (498) regenerated; `docs/` mirrors `game/` (500 files).
- Deleted `resources/Little_Explorer_unused_art/platform-01.webp` + `terrain-tile-01.webp` (README counts updated).
- Review shots refreshed: explorer/fastcat × 4 viewports + two ad-hoc shots (`tools/.cache/task458_worlds-menu.png`, `tools/.cache/task458_pit.png`).

## Verification

- `node tools/check_fast.js`: 10/10 green (after build_offline + sync-docs).
- `node tools/check_release.js`: fast gate PASS + full smoke battery PASS — "Release gate green. Nothing was written."
- `tools/kitty_smoke.js`: 0 FAIL; four new guards (worlds cards, paper surfaces, `solidTop` tiling, pit strips) proven to FAIL on mutated copies, restore hash-matched.
- Per-task evidence: `tools/.cache/task458-validation.md`.

## Task tracking

- Task 458 (Explorer finalize): DONE on `claude/explorer-ui-kit` — awaiting PR review/merge and the user's visual sign-off. Long note in `project/tasks/ACTIVE.md`; decisions in `project/DECISIONS.md`.
- Previous session (task 458 STEP 0-2: white-band guards, screenshot hero-picker fix) merged to `main` as `bdcc3d7`.

## Open tasks (from ACTIVE.md)

- 435 (Gate 5 family rollout): NEW
- 436 (Gate 6: 11-world regression): NEW
- 437 (Little Explorer full review + screenshots): NEW — recommend CLOSE
- 438–443 (art reorganization): NEW — recommend DO NOT DO (per brief section 2b)
- 444–449 (terrain/pipes/enemies/walkers/goals/collectibles): NEW — recommend RE-SCOPE (mostly done)
- 450 (cut-out + QA): NEW — recommend KEEP
- 451–452 (regenerate + full validation): NEW — recommend KEEP (closing steps)

## Little Explorer — current state

- Every child-visible surface (HUD, modals, hero tiles, worlds picker, action button) now uses the shared paper kit; icons, arrows and letters stay crisp DOM/SVG.
- Ground: all 11 worlds use their own painted `terrain-*-top` tile; the soft-cap float is fixed by cropping to `solidTop` instead of re-painting the approved art.
- All four seasons share one `goal-house`; other world goals remain procedural pending art.
- Pits: painted body strips with procedural animation; hazard-to-world mapping and collision unchanged.
- Art QA gate (`check_art.js`): unreferenced art, sheet-label chips, stray fragments, 512×512 cut-outs, transparent corners, white-cap guard.

## Visual QA

- **This model (Big Pickle) cannot read images** — verdicts come from subagents on `opencode/nemotron-3.5-super-vl-free` or from the user. The user's sign-off on the PR screenshots is still required.
- Vision verdicts this session: worlds menu ACCEPT (11 cream cards, no blank/cropped/unreadable card); Spring pit ACCEPT (painted water, banks meet acceptably; the water surface starts behind the dirt rim, read as painted pit geometry).
- `screenshot.js --review=Screenshot_Review --pages=explorer,fastcat --task=458`: 8 shots, no browser runtime errors.

## Deferred (recorded in `project/DECISIONS.md`)

- Converting the 11 background scenes to WebP (measured 2–8% of PNG size).
- devicePixelRatio canvas scaling.

## Generation pipeline

- Cloudflare credentials staged at `%TEMP%\opencode\cloudflare-creds.json` (never in repo).
- Task 458 pits: 6 runs, 3 accepted (water v2, spikes v1, lava v3), ~684 of 10 000 neurons. Source PNGs stay in the git-ignored WIP bundle; production files are the cropped 768×202 WebP bands.
- World thumbnails spent 0 neurons (downscales of approved scenes).
