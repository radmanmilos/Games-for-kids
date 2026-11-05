# Petrin svet — Status

*Overwritten 2026-11-05. App version: 3.0.1. Repository: https://github.com/radmanmilos/Games-for-kids.*

**Working branch:** `test/dino-smoke-emoji-normalization-task-377`, based on main `c8f695b`.

## Current state

- **Task 376 — merged.** PR #9 changed the README hub hero to `resources/General_reviews/Screenshot_Review/hub_phone-landscape.png`. Merge commit: `c8f695bb7be3acafa176c327cc0546d9bbdbaa76`.
- **Task 377 — in progress.** Correcting a flaky assertion in `tools/dino_smoke.js`. The test reads the rendered glyph from `dataset.emoji`; `game/shared/art.js` normalizes away U+FE0F, while the theme collectible may retain it. Planned comparison normalizes both values. No game/runtime source is changed.
- **Local archive step remains.** The remote GitHub connector cannot run `node tools/archive_tasks.js` or `node tools/check_docs.js` in the owner’s clone. Task 376 is marked DONE in ACTIVE.md pending the owner’s local archive/check pass.

## Verified CI on main

For merge commit `c8f695bb7be3acafa176c327cc0546d9bbdbaa76`:
- CI run #492 (`42058442337`): completed successfully.
- Push on main run #618 (`42058442499`): completed successfully.

## Known quality-review items

- The short-landscape measurement report is `resources/General_reviews/SHORT_LANDSCAPE_AUDIT.md`: 27 surfaces, 12 OK, 15 WARN, 0 FAIL. The prior audit did not individually inspect the screenshots; warnings still need visual adjudication.
- Manual accessibility/device checks and child/family playtesting remain unverified.
- Deeper service-worker lifecycle tests remain outstanding.

## Project invariants

- `game/` is the deployable source of truth; `docs/` is its generated mirror.
- `resources/` contains review/development material; `tools/` contains validation tooling.
- Preserve Serbian Cyrillic child-facing text, offline-first operation, child privacy, and each game's distinct identity.
- Do not claim manual validation or child playtesting without evidence.
