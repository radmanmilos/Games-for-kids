# Petrin svet — Status

*Overwritten 2026-11-05. App version: 3.0.1. Repository: https://github.com/radmanmilos/Games-for-kids.*

**Working branch:** `review/visual-confirmation-task-380`, based on main `208f9fb`.

## Current state

- **Task 379 — merged to main.** The November screenshot battery contains 108 default + 56 PLAY screenshots; 164/164 provenance entries are task 379. The visual-state hooks and screenshot TOC were updated. The short-landscape audit reports 12 OK / 15 WARN / 0 FAIL; axe reports 0 violations.
- **Task 380 — in progress.** GPT-6 visually inspected all 27 phone-landscape default captures and all 14 phone-landscape PLAY captures, plus targeted portrait/tablet views for hub, parent, compare, maze, sorting and coloring. New P1 finding: hub learning tile is blank and its label is displaced outside the tile in all four default viewports. Parent gate below-fold is confirmed at 844×390 only. Additional review notes are in `resources/General_reviews/VISUAL_UX_REVIEW_2026-11.md`.
- **CI for task 379 commit:** run `42094644764` completed successfully; Fast, CodeQL and Pages deployment passed. Extended Chromium/WebKit matrix and Release QA were skipped by workflow configuration. The local validation results are recorded in the task-379 report; GPT-6 did not rerun local commands.
- **No runtime UI changes made.** Proposed fixes await owner approval and separate implementation tasks.

## Project invariants

- `game/` is the deployable source of truth; `docs/` is its generated mirror.
- `resources/` contains review/development material; `tools/` contains validation tooling.
- Preserve Serbian Cyrillic child-facing text, offline-first operation, child privacy, and each game's distinct identity.
- No manual child/family playtesting is claimed without evidence.
