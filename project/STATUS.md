# Project status

**Last verified:** 2026-11-17  
**Repository:** radmanmilos/Games-for-kids  
**Current branch:** `claude/explorer-ui-kit`  
**Main HEAD:** `bdcc3d7` (PR #28, task 458 STEP 0-2) version `3.0.15`  
**Open PR:** #29 "Explorer paper UI kit, painted pits, ground-cap alignment" → `main` (not merged; waiting for the user's visual sign-off)  
**Branch commits:** `2abe5a8` (task 458 STEP 3-5) + the task 459 pit-rework commit on top

## Task 459 — pit rework (this session, OpenCode/Big Pickle)

The user rejected the first pit strips: bird's-eye look, colours not matching the worlds, pit edges not meeting the ground tiles, and no visible spikes. Both causes fixed:

- **Crop** — the old crop only rejected near-white paper, so the painting's warm cream margin (223,210,185) shipped as a stripe at the pit edge. `tools/.cache/pit_crop2.js` now classifies by hue and **refuses to write** a strip whose edge columns are not hazard paint.
- **Draw** — one strip was stretched across every 300–500 px pit. Strips are 4:1 (`800×200`) like a real pit and are tiled at native scale with src-rect draws, a neutral depth gradient and an 8–16 px bank shadow.
- **Water** 9.0 KB (`pit-water-v3.png`, x10..1013 y128..378, hazard 1.00, edges 1.00/1.00, edge `#9dd2d6`).
- **Spikes** 17.2 KB (dense stone band of `pit-spikes.png`) + bigger outlined triangles (46±10 px, `#eef3fa` face, 3 px `#14161c` outline, 8 px base) so 9–10 spikes are visible.
- **Lava** 14.0 KB — **derived, not generated**: three Cloudflare attempts all framed the square with cream and the crop guard rejected each (v4 hazard 0.02, v5 core 112 px). `tools/.cache/pit_derive_lava.js` remaps the accepted water strip by luminance → molten ramp with a depth factor (crest `#ffd27f`, body `#c24d1e`→`#c6451a`).

## Verification

- `node tools/build_offline.js`: 499 cache entries / 498 manifest.
- `bash tools/sync-docs.sh`: `docs/` mirrors `game/` (500 files); hashes of the changed JS/strips/manifest verified identical.
- `node tools/check_fast.js`: 10/10 green.
- `node tools/check_release.js`: fast gate PASS + full smoke battery PASS — "Release gate green. Nothing was written." (log `tools/.cache/task458-check_release2.log`).
- `tools/kitty_smoke.js`: 0 FAIL. Three new guards (coverage as contiguous runs, aspect/no-stretch, strip edge colours, spike pixels) each proven to FAIL on mutated input; files restored from pre-mutation **copies** and hash-matched (`906f81cb001caa7e` JS, `5b0bccf88de11c4d` strip).
- Review screenshots refreshed: `screenshot.js --review=Screenshot_Review --pages=explorer,fastcat --task=458` → 8 shots, no browser runtime errors.
- CI run [44038945180](https://github.com/radmanmilos/Games-for-kids/actions/runs/44038945180) on `afcc354`: **success** (smoke matrix + Release QA + Pages).
- Per-task evidence: `tools/.cache/task458-validation.md`.

## Visual QA

- **This model (Big Pickle) cannot read images** — verdicts come from subagents on `opencode/nemotron-3.5-super-vl-free` or from the user. The user's sign-off is still required before merge.
- Corrected close-ups (`tools/.cache/task458_pit_{water,spikes,lava}.png`): water **ACCEPT**, spikes **ACCEPT** (9–10 visible spikes), lava **ACCEPT** — all read as side-view pits with world-matching colours and clean edges.
- Trap recorded in `project/lessons/testing-harness.md`: `update()` re-drives `cameraX` (`kitty-standalone.js:1407`), so review captures must pause the game before framing — the first capture set slid off the pit and produced phantom "cream stripe"/"vertical seam" verdicts against ground tiles.

## Little Explorer — current state

- Every child-visible surface (HUD, modals, hero tiles, worlds picker, action button) uses the shared paper kit; icons, arrows and letters stay crisp DOM/SVG.
- Worlds picker: 11 paper cards with a 400×116 thumbnail of each world's own scene (0 generation neurons).
- Ground: all 11 worlds use their own painted `terrain-*-top` tile; the soft-cap float is fixed by cropping to `solidTop`.
- All four seasons share one `goal-house`.
- Pits: painted strips, tiled at native scale, procedural animation and the flat fill fallback kept; hazard-to-world mapping and collision unchanged.

## Open tasks (from ACTIVE.md)

- 435 (Gate 5 family rollout): NEW
- 436 (Gate 6: 11-world regression): NEW
- 437 (Little Explorer full review + screenshots): NEW — recommend CLOSE
- 438–443 (art reorganization): NEW — recommend DO NOT DO (per brief section 2b)
- 444–449 (terrain/pipes/enemies/walkers/goals/collectibles): NEW — recommend RE-SCOPE (mostly done)
- 450 (cut-out + QA): NEW — recommend KEEP
- 451–452 (regenerate + full validation): NEW — recommend KEEP (closing steps)

## Deferred (recorded in `project/DECISIONS.md`)

- Converting the 11 background scenes to WebP (measured 2–8% of PNG size).
- devicePixelRatio canvas scaling.

## Generation pipeline

- Cloudflare credentials staged at `%TEMP%\opencode\cloudflare-creds.json` (never in repo).
- Task 458/459 pits: 9 runs total, 4 accepted (water v2, spikes v1, lava v3, water v3); ~344.8 neurons spent on the rework (1 029 cumulative of 10 000). Source PNGs stay in the git-ignored WIP bundle; production files are the cropped `800×200` WebP strips.
- World thumbnails and the lava strip spent 0 neurons (downscale / deterministic derivation).
