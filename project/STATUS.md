# Petrin svet — Status

*Overwritten 2026-11-06. App version: 3.0.1. Repository: https://github.com/radmanmilos/Games-for-kids.*

**Main:** \`983f7b4a3cc4b16d41747614c3dc5b963c992c5f\` (PR #17 merged).
**Current documentation branch:** \`docs/visual-ux-continuation-task-383\`.
**Task:** 383 IN PROGRESS — current-state reconciliation and continuation plan.

## Current state

- The 2026-10-07 visual/UX master plan's V0–V23 phases are recorded complete in Tasks 216–240. Do not reopen them as an untouched backlog.
- Task 379 refreshed the stable screenshot battery (108 default + 56 PLAY); Task 382 reviewed the 164 available captures and documented the new findings in \`resources/General_reviews/VISUAL_UX_REVIEW_2026-11.md\`.
- The two internal child sub-hubs (\`#hub-games\`, \`#hub-learning\`) remain a screenshot coverage gap; they were source-reviewed only.
- Current main CI run #516 (run \`42129112023\`) completed successfully: Fast gate, CodeQL and Pages deployment succeeded. Extended device matrix and Release QA were skipped.
- \`project/STATUS.md\` was stale at the previous commit; this snapshot now records the verified main SHA.
- A current continuation plan and numbered proposed tasks 383–398 are being published on the documentation branch. Only Task 383 is in progress; later tasks are NEW proposals and require approval before implementation.
- Highest-priority current visual task: Classroom's six category tabs overflow on phone widths. Phonics retry feedback uses success green. Coloring and Cat Forest findings remain investigation-first; Animal Counting and Spatial are composition/spacing follow-ups; Compare remains playtest-gated.
- The current \`GAME_MATRIX.md\` guide-doc metadata is inconsistent with its own guide list and the live \`project/games/\` directory; Task 393 will reconcile it.

## Project invariants

- \`game/\` is the deployable source of truth; \`docs/\` is its generated mirror.
- \`resources/\` contains review/development material; \`tools/\` contains validation tooling.
- Preserve Serbian Cyrillic child-facing text, Serbian speech, offline-first operation, child privacy, and each game's distinct identity.
- No ads, tracking, analytics, monetization, accounts or mandatory network dependency.
- Never claim manual child/family playtesting without evidence.

## Verification limits

This remote documentation session did not run local Node checks, browser/screenshot capture, smoke tests, offline E2E or physical-device playtesting. The latest verified CI result is the successful main run above; its Extended and Release QA jobs were skipped.
