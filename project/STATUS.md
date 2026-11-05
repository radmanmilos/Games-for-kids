# Petrin svet — Status

*Overwritten 2026-11-05. App version: 3.0.1. Repository: https://github.com/radmanmilos/Games-for-kids.*

**Main:** `96d628b291e6ada08dffc8b12024c9d34d188148` (PR #14 merged).
**Working branch:** `fix/short-landscape-title-detection-task-381`, based on main.

## Current state

- **Task 380 — merged.** PR #14 merge commit is main HEAD. Main CI run `42106982211` completed successfully.
- **Task 381 — IN PROGRESS.** Correcting the short-landscape audit's title selector and documenting the disposition of remaining WARNs.
- **Verified baseline:** `resources/General_reviews/SHORT_LANDSCAPE_AUDIT.md` was generated at 2026-11-05 20:03 UTC: 27 surfaces, 13 OK / 14 WARN / 0 FAIL. The report is pre-task-381.
- **Root cause:** the selector omitted the visible `.count-title` heading created in `game/games/animal_counting.js:10`. The selector change is targeted; generic `h2` is deliberately not accepted.
- **WARN disposition:** six no-title screens are intentionally stage-led (animals, phonics, shapes, matching_game, fastcat, cat_forest). Seven remaining header-budget WARNs are advisory measurements; task-380 recorded no clipping and no FAIL for them. Details are in `resources/General_reviews/VISUAL_UX_REVIEW_2026-11.md`.
- **Pending verification:** rerun `node tools/short_landscape_audit.js` locally to confirm the expected 14 OK / 13 WARN / 0 FAIL. This environment has no local repository checkout/browser harness, so that command has not been run here.
- No child-visible screens changed; no screenshot refresh is required. No game/runtime files changed.

## Project invariants

- `game/` is the deployable source of truth; `docs/` is its generated mirror.
- `resources/` contains review/development material; `tools/` contains validation tooling.
- Preserve Serbian Cyrillic child-facing text, offline-first operation, child privacy, and each game's distinct identity.
- Never claim manual child/family playtesting without evidence.
