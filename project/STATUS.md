# Petrin svet — Status

*Overwrite this file at the end of every session (never append). Budget: 6 KB, checked by `node tools/check_docs.js`.*

**Last updated:** 2026-10-16 · **App version:** 2.0.4 (`game/manifest.json`)
**Repository:** https://github.com/radmanmilos/Games-for-kids

## Where we are

- **Task 250 — IN PROGRESS:** game input and round-lifecycle refactoring on branch `fix/game-input-refactor-task-250`; draft PR #5: https://github.com/radmanmilos/Games-for-kids/pull/5.
- Fixes cover Shapes tier-3 layout and interrupted drag cleanup, Candy drag cancellation, shared adventure input reset on blur/hidden document and touch cancellation, and Coloring timer invalidation on restart.
- Focused regression assertions are in `tools/shapes_smoke.js`, `tools/candy_smoke.js`, `tools/adventure_smoke.js`, and `tools/coloring_smoke.js`.
- **Offline delivery:** app version bumped from 2.0.3 to 2.0.4 so installed devices can pick up the shipped fixes; the `manifest.json` entry in the offline integrity manifest is refreshed. `docs/` must mirror `game/` exactly.
- **Docs:** `docs/` and `game/` had 257 matching paths and zero content-hash mismatches after the previous sync. Shared adventure behavior notes now cover Driving, Dino, Ocean, and Space.
- **Validation:** the latest observed CI run passed the fast gate and all targeted game smokes plus `sw_update_smoke.js`; Release QA was still in progress and the extended Chromium/WebKit matrix was skipped. Re-check CI on the current PR head before completion. The earlier offline-manifest failure was corrected.
- **Still outstanding:** refresh review screenshots in `resources/General_reviews/Screenshot_Review/` for Shapes, matching_game (Candy), Coloring, Driving, Dino, Ocean, Space, and Parent (the app version is visible there); confirm the prescribed broader validation. Screenshot refresh and local browser tests cannot be executed in this connector-only environment.

## Next actions

1. Verify the version and manifest changes with CI.
2. Refresh the affected review screenshots using task ID 250 and update provenance/TOC.
3. Inspect all latest CI jobs and complete any required smokes.
4. Only after validation, finish task 250 and run `node tools/archive_tasks.js`, then overwrite this status again.

## Rules of the road

- Changes under `game/` require `tools/sync-docs.sh` and fresh affected review screenshots.
- Never commit or push to `main` automatically; publishing is the user's action.
- Read `AGENTS.md` and `project/PROCESS.md` before project work; record game behavior changes in `project/games/`.
