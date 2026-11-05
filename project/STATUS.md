# Petrin svet — Status

*Overwritten 2026-11-05. App version: 3.0.1. Repository: https://github.com/radmanmilos/Games-for-kids.*

**Working branch:** `main` (based on `af4014f`). Task 379 work is uncommitted in the working tree.

## Current state

- **Tasks 376–378 — merged.** README screenshot, Dino smoke normalization, meadow hero (PRs #9–#11). CI on main is green.
- **Task 379 — DONE (evidence).** Screenshot battery refreshed: 108 default + 56 gameplay images (14 surfaces × 4 viewports), 164/164 provenance rows at task 379. Stale `tools/visual-states.json` hooks repaired; `TABLE_OF_CONTENT.md` now lists named-state captures. Short-landscape audit: 12 OK / 15 WARN / 0 FAIL, with a disposition for every WARN. axe-core: 27 surfaces, 0 violations.
- **Task 380 — next.** Visual confirmation of the 164 images by a vision model, then scope the two actionable findings: P1 parent gate below the fold at 844×390, P2 short-landscape header budget (compare 83, sorting 88, maze 90, arcade four 83 px).
- **Report:** `resources/General_reviews/VISUAL_UX_REVIEW_2026-11.md`.

## Validation

- `node tools/check_fast.js` — all 10 stages green.
- `node tools/check_docs.js` — OK (5 budgets, 48 links).
- `node tools/screenshot.js --review=Screenshot_Review --task=379` — no browser runtime errors.
- `node tools/short_landscape_audit.js` — 0 FAIL.
- `node tools/axe_check.js` — 0 violations.

## Project invariants

- `game/` is the deployable source of truth; `docs/` is its generated mirror.
- `resources/` contains review/development material; `tools/` contains validation tooling.
- Preserve Serbian Cyrillic child-facing text, offline-first operation, child privacy, and each game's distinct identity.
- No manual playtesting is claimed without evidence.
