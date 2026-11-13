# Project status

**Last verified:** 2026-11-12  
**Repository:** radmanmilos/Games-for-kids  
**Current branch:** `claude/explorer-review-followup-454` (not merged; waiting for user)  
**Main HEAD:** `81b3339` version `3.0.10` (bumped C from 3.0.9)

## Repository and verification

- PR #26, task 453 (Little Explorer render fixes), merged to main. CI green on 81b3339.
- All 10 fast gate stages PASS (syntax, registry/metadata, CI workflow, secrets, scan alerts, generated artifacts, offline inventory, docs budgets, art integrity, hub smoke).
- Full battery (run_all.js): ALL 37 TOOLS PASS, 1357 checks, 0 failures, including racing3d_smoke.js and kitty_smoke.js.

## Task tracking

- Task 454 (Claude review follow-up: T1/T2/T3): DONE — archived.
  - T1: flat-topped Japan/Winter ground caps were produced, then REVERTED in task 455 (see below): in game they were a near-white slab on a white scene and pink on pink; the interim painted art is back.
  - T2: Removed baked ground planks from walker-ladybug, walker-bee, walker-worm, walker-meerkat sprites; crab/hedgehog were wrongly reported clean (crab still had a large cream ground band; meerkat/ladybug/bee kept strips and white background blobs): fixed in task 455.
  - T3: Extended tools/check_art.js with unreferenced-art (port of dead_art_scan.js), sheet-label chips, and stray fragments checks (matched sprite_audit.py algorithm); fixed 3 flagged files (terrain-northpole-top, walker-crab, walker-scarab). check_art.js: 0 failures.
- Task 455 (independent review of the 454 follow-up, with in-game screenshots): DONE — archived. Reverted Japan/Winter flat caps to the painted interim art (`terrain-spring-top`, `terrain-tile-16`; the flat files are in `resources/Little_Explorer_unused_art/rejected/`); cleaned the leftover ground band/strips/white background from walker-crab, -meerkat, -ladybug, -bee; crab `WALKER_FOOT` 16 → 6; `check_art.js` chip rule corrected (w/h > 4.5 and h < 20% of 512: the old 5x/14% rule missed all five real chips, 14.5-16.8% tall); `kitty_smoke` pinned `crab === 16` replaced by a data-driven foot check (task455).
- Version: 3.0.9 → 3.0.10 (C bump). build_offline.js + sync-docs.sh + check_fast.js all green.

## Open tasks (from ACTIVE.md)

- 435 (Gate 5 family rollout): NEW
- 436 (Gate 6: 11-world regression): NEW
- 437 (Little Explorer full review + screenshots): NEW — recommend CLOSE (done by this review; keep only screenshot refresh)
- 438–443 (art reorganization): NEW — recommend DO NOT DO (per brief section 2b)
- 444–449 (terrain/pipes/enemies/walkers/goals/collectibles): NEW — recommend RE-SCOPE (only Japan/Winter terrain needed; rest done)
- 450 (cut-out + QA): NEW — recommend KEEP (this is T3, done)
- 451–452 (regenerate + full validation): NEW — recommend KEEP (closing steps)

## Little Explorer — current state

- Japan ground: interim painted grass `terrain-spring-top` (task 455 reverted the flat pink cap); real painted cap still needed (task 444 scope)
- Winter ground: interim icy block `terrain-tile-16` (task 455 reverted the flat white cap); real painted cap still needed (task 444 scope)
- Walkers: ladybug/bee/worm/meerkat/crab cleaned of baked ground and white background; `WALKER_FOOT` matches the sprite bounds (data-driven smoke check); snowman anchor 18 unchanged
- Art QA gate: check_art.js enforces unreferenced art, sheet-label chips (calibrated in task 455), stray fragments

## Visual QA

- **Model cannot read images** — visual screenshot review deferred to Nemotron 3.5 Super VL Free
- All 11 Explorer worlds captured programmatically (tools/.cache/world_probe/); verified as game worlds (not character picker) by pixel heuristics
- kitty_smoke.js: all 44 checks pass including task453 render guards and task429 walker foot anchors

## Generation pipeline

- Cloudflare credentials staged at %TEMP%\opencode\cloudflare-creds.json (never in repo)
- ~200+ neurons used this session; remaining daily allowance available for future generations