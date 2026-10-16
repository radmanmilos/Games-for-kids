# Petrin svet — Status

*Overwrite this file at the end of every session (never append). Budget: 6 KB, checked by `node tools/check_docs.js`.*

**Last updated:** 2026-10-16 · **App version:** 2.0.3 (`game/manifest.json`; bump when a shipped fix must reach installed devices)
**Repository:** https://github.com/radmanmilos/Games-for-kids

## Where we are

- **Task 250 — IN PROGRESS:** game input and round-lifecycle refactoring on branch `fix/game-input-refactor-task-250`; draft PR #5: https://github.com/radmanmilos/Games-for-kids/pull/5.
- Fixes cover Shapes tier-3 layout and interrupted drag cleanup, Candy drag cancellation, shared adventure input reset on blur/hidden document and touch cancellation, and Coloring timer invalidation on restart.
- Focused regression assertions were added to `tools/shapes_smoke.js`, `tools/candy_smoke.js`, `tools/adventure_smoke.js`, and `tools/coloring_smoke.js`.
- **Docs mirror:** all 257 `docs/` paths matched `game/` before the offline-manifest correction. CI caught stale hashes/sizes for the four changed scripts; the manifest entries are now refreshed in `game/offline-manifest.json` and must be mirrored to `docs/` before validation.
- **Validation:** latest CI run failed the fast gate on stale offline-manifest hashes/sizes. Syntax, registry/metadata, workflow, scan-alert, generated-artifact, docs-budget/link, and hub-smoke stages passed; the game-specific smoke matrix was skipped after the fast-gate failure. The new manifest has not yet been validated by CI.
- **Still outstanding:** refresh review screenshots in `resources/General_reviews/Screenshot_Review/` for Shapes, Candy, Coloring, Driving, Dino, Ocean, and Space; run prescribed local smoke/release checks where available. Screenshot refresh and local browser tests could not be executed in the connector-only environment.

## Next actions

1. Mirror the refreshed offline manifest into `docs/`, then rerun CI and inspect failures.
2. Run focused smokes for Shapes, Candy, Coloring, and the four shared adventure modes; run `node tools/check_fast.js` and the appropriate broader gate.
3. Capture affected review screenshots with task ID 250, updating the existing review folder and provenance/TOC.
4. Only after validation, finish task 250 and run `node tools/archive_tasks.js`, then overwrite this status again.

## Rules of the road

- Changes under `game/` require `tools/sync-docs.sh` and fresh affected review screenshots.
- Never commit or push to `main` automatically; publishing is the user's action.
- Read `AGENTS.md` and `project/PROCESS.md` before project work; record game behavior changes in `project/games/`.
