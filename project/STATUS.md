# Petrin svet — Status

*Overwritten 2026-11-05. App version: 3.0.1. Repository: https://github.com/radmanmilos/Games-for-kids.*

**Working branch:** `fix/visual-ux-priorities-task-380`, based on main `d82a0d2`.

## Current state

- **Task 379 — merged.** Main contains 108 default + 56 PLAY screenshots (164 total), all with task-379 provenance. The short-landscape audit reports 12 OK / 15 WARN / 0 FAIL.
- **PR #13 — merged.** Visual confirmation report and task-380 scope merged as `d82a0d286a4ab5e2091f68afd9e1ecb28a3cfe51`; CI passed.
- **Task 380 — in progress.** Implementing the approved hub learning tile, parent gate first-viewport, and short-landscape header fixes. Source changes are on the task branch; screenshot refresh and local validation remain pending.
- **Validation boundary:** GPT-6 used GitHub source inspection and screenshot review. It cannot run the repository's local Node/Chromium commands in this environment. Do not mark task 380 DONE until CI, local smokes, short-landscape audit and affected screenshot refresh are verified.

## Project invariants

- `game/` is the deployable source of truth; `docs/` is its generated mirror.
- `resources/` contains review/development material; `tools/` contains validation tooling.
- Preserve Serbian Cyrillic child-facing text, offline-first operation, child privacy, and each game's distinct identity.
- Keep all child touch targets large; this task does not reduce interactive target sizes.
- No manual child/family playtesting is claimed without evidence.
