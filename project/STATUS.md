# Project status

**Last verified:** 2026-11-26 (OpenCode/Big Pickle)
**Repository:** radmanmilos/Games-for-kids
**Current branch:** `main`
**Version:** `3.0.25` (unchanged — Q-23 bump awaits user's minor/major choice)

## Little Adventure (task 453, IN PROGRESS)

- Quality Plan automatable work is complete through Q-22; Q-23 docs prep is done; Q-24 is user-led playtest (parked).
- Base game IS-00..IS-19 complete; IS-20 playtest user-led.
- All 21 Q-cards have shipped code: Q-00..Q-22 DONE (partial where a look/device gate remains), Q-23 IN PROGRESS (docs done, version bump user-gated), Q-24 NEW (user-led).
- Latest proofs: quality smoke **56/56**, LA WebGL smoke **49/49**, touch-interruption **6/6**, offline smoke PASS (570/570 cached), golden shots **78 PNGs**, Screenshot_Review **4 viewports**, `check_fast` **10/10**, `check_release` LA scope green (racing3d drift flake standalone PASS 40/40, unrelated).
- Q-04 deviation recorded: literal <=40 material instances unreachable with approved palette (53 cached variants / ~101 unique scene materials); enforced perf ceiling is shader programs <=40 (13 measured).
- Full Q-22 verification matrix, rubric self-score and USER-RUN list: `resources/General_reviews/Little_adventure/Quality_Plan/PROGRESS.md`.

### Gates

- QG1: **approved** by user (2026-11-26).
- QG2–QG7 / per-card look gates: decisions **pre-approved** by user, but artifacts exist and VL/user look review remains **UNVERIFIED** — not self-approved.
- USER-RUN (unverified): tablet perf/fps/leak/shadow-acne/flashing, visual/audio listening, real-child playtest/readability, QG6 4-viewport package review + release sign-off.
- `visual_compare` LA baseline: SKIP (tool requires the full approved registered set at all 5 viewports).

## Cat Forest (task 454, IN PROGRESS)

- Base game feature-complete CF-21; merge of `claude/cat-forest-village` (Phase 2 village hub + Phase 3 pond) DONE; painted cat/lion art gaps DONE; screenshot flip DONE.
- Full validation green: `check_fast` 10/10, `cat_forest` smoke 218/218, `check_release` green.
- CF-22 real-tablet play-test: DEFERRED (user-led, real device).

## Next steps

1. User: choose Q-23 version bump (minor C = 3.0.26, or major B = 3.1.0; A only for a full overhaul) and give QG6 release sign-off.
2. User: run the tablet/audio/child playtest items and report observations for Q-24; AI then changes config/data first, logs each change and re-runs shots + smokes.
3. No automatic commit/push to `main` by the AI; the user publishes explicitly.

## Repo hygiene

- `docs/` mirrors `game/` (571 files); offline manifest/cache list rebuilt 2026-11-26.
- `node tools/archive_tasks.js` and `node tools/check_docs.js` run at the task boundary.
