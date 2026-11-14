# Project status

**Last verified:** 2026-11-14  
**Repository:** radmanmilos/Games-for-kids  
**Current branch:** `claude/explorer-review-followup-454` (committed, PR open, waiting for user to merge)  
**Main HEAD:** `81b3339` version `3.0.10`

## Repository and verification

- PR #26, task 453 (Little Explorer render fixes), merged to main. CI green on 81b3339.
- Task 456 work is on `claude/explorer-review-followup-454`, based on tip `892f34d`.
- All 10 fast gate stages PASS after the final art swap + `sync-docs.sh` (syntax, registry/metadata, CI workflow, secrets, scan alerts, generated artifacts, offline inventory, docs budgets, art integrity, hub smoke).
- Full battery before the art swap (`run_all.js`): ALL 37 TOOLS PASS, 1358 checks, 0 failures. After the swap, the diff-relevant smokes were re-run: `kitty_smoke.js` 45/45, `art_smoke.js` 22/22.
- Review screenshots for the `explorer` page refreshed (`--review=Screenshot_Review --pages=explorer --task=456`), 4 viewports, no browser runtime errors.

## Task tracking

- Task 454 (Claude review follow-up: T1/T2/T3): DONE — archived.
  - T1: flat-topped Japan/Winter ground caps were produced, then REVERTED in task 455: in game they were a near-white slab on a white scene and pink on pink; the interim painted art was back.
  - T2: walker sprites cleaned of baked ground strips/white background; finished in task 455.
  - T3: `tools/check_art.js` extended with unreferenced-art, sheet-label chips and stray-fragment checks; calibrated in task 455.
- Task 455 (independent review of the 454 follow-up): DONE — archived. Reverted Japan/Winter flat caps; cleaned walker-crab/-meerkat/-ladybug/-bee; crab `WALKER_FOOT` 16 → 6; chip rule calibrated (w/h > 4.5 and h < 20% of 512); `kitty_smoke` crab foot check made data-driven.
- Task 456 (Explorer review follow-up, this branch): DONE — archived (next task number 457).
  - Gates first: `check_fast` 10/10; full `run_all` 37/37 tools, 1358 checks.
  - Visual sign-off of all 11 worlds at 1024x800 (criteria A–G); moving-platform and walker criteria also proven numerically.
  - Real painted ground caps for the two remaining worlds: Japan `terrain-japan-top` (seed 4561) and Winter `terrain-winter-explorer-top` (v4 slate body + v3 painted snow cap through a wavy feathered mask; four straight generations each failed one half of the brief). Both `tile_edge_check` OK and judged as ground in-game.
  - `TERRAIN_STEMS` now points at real stems for all 11 worlds; interim `terrain-tile-16.webp` deleted (art gate: 0 failures).
  - Sprite-float above the soft grass edge measured (spring 7.8 px, autumn 18.6 px, savanna 11.6 px at 140 px draw height) with the trim-to-first-solid-row fix proposed — reported only, not implemented.
  - Evidence: `tools/.cache/task456-validation.md`, `tools/.cache/world_probe456_ground/`.
- Version stays `3.0.10` (no bump in this task).

## Open tasks (from ACTIVE.md)

- 435 (Gate 5 family rollout): NEW
- 436 (Gate 6: 11-world regression): NEW
- 437 (Little Explorer full review + screenshots): NEW — recommend CLOSE (done by tasks 455/456; keep only screenshot refresh)
- 438–443 (art reorganization): NEW — recommend DO NOT DO (per brief section 2b)
- 444–449 (terrain/pipes/enemies/walkers/goals/collectibles): NEW — recommend RE-SCOPE (Japan/Winter terrain now done in 456; rest already done)
- 450 (cut-out + QA): NEW — recommend KEEP (done as T3)
- 451–452 (regenerate + full validation): NEW — recommend KEEP (closing steps)

## Little Explorer — current state

- Ground: all 11 worlds use their own painted `terrain-*-top` tile. Japan `terrain-japan-top` and Winter `terrain-winter-explorer-top` are built by `tools/.cache/make_tile.py` ([centre strip | mirrored strip] on a 512x512 canvas with 8 px transparent side margins, top trimmed to the first visibly solid row).
- Known follow-up: the soft top edge of spring/autumn/savanna still leaves a small float under the hero's feet (7.8 / 18.6 / 11.6 px at 140 px draw height) — fix proposed in task 456, not implemented.
- Walkers: ladybug/bee/worm/meerkat/crab cleaned of baked ground and white background; `WALKER_FOOT` matches the sprite bounds (data-driven smoke check); snowman anchor 18 unchanged.
- Art QA gate: `check_art.js` enforces unreferenced art, sheet-label chips, stray fragments, 512x512 cut-outs with transparent corners, and the calibrated alpha threshold.

## Visual QA

- **This model (Big Pickle) cannot read images** — every visual verdict in task 456 was produced by subagents on `opencode/nemotron-3.5-super-vl-free`, or by the user.
- All 11 Explorer worlds captured programmatically (`tools/.cache/world_probe456*`); before/after ground contact sheet at `tools/.cache/world_probe456_ground/ground_before_after_sheet.png`.
- Tile-boundary texture step in the rendered band: before winter 24.2 / japan 19.1 vs after winter 2.4 / japan 3.8 (median 4.4 / 6.6) — no hard repeat seam.

## Generation pipeline

- Cloudflare credentials staged at `%TEMP%\opencode\cloudflare-creds.json` (never in repo).
- Task 456 used 5 generations for the two caps (~575 of 10 000 daily neurons).
- Candidates and rejected variants: `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/little-explorer/` (git-ignored); old rejected flat caps in `resources/Little_Explorer_unused_art/rejected/`.
