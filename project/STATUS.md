# Petrin svet — Status

*Overwritten 2026-11-05. App version: 3.0.1. Repository: https://github.com/radmanmilos/Games-for-kids.*

**Working branch:** `docs/readme-meadow-hero-task-378`, based on main `bacc6c9`.

## Current state

- **Tasks 376 and 377 — merged and archived.** Task 376 changed the README hero to the owner-selected phone screenshot (PR #9). Task 377 corrected the Dino smoke emoji normalization assertion (PR #10); CI run #493 completed successfully.
- **Task 378 — in progress.** Updating only the root README hero to use the owner-selected `resources/General_reviews/Repo images/learn-and-play-meadow-hero.jpg`. The image itself was added to main by the repository owner and was verified in the Git tree (627,964 bytes). The previous screenshot remains in the repository.
- **Validation pending.** README/task bookkeeping changes are being prepared through the GitHub connector. Local `node tools/archive_tasks.js` and `node tools/check_docs.js` have not been run in this environment.

## Project invariants

- `game/` is the deployable source of truth; `docs/` is its generated mirror.
- `resources/` contains review/development material; `tools/` contains validation tooling.
- Preserve Serbian Cyrillic child-facing text, offline-first operation, child privacy, and each game's distinct identity.
- Do not claim manual validation or child/family playtesting without evidence.
