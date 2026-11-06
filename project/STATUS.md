# Petrin svet — Status

*Overwritten 2026-11-06. App version: 3.0.7. Repository: https://github.com/radmanmilos/Games-for-kids.*

**Main:** `5209f4c` (Task 390 push); CI for Tasks 388/389 green; Task 390 CI in progress at session end.
**Latest main change:** Task 390 — Spatial feedback no longer collides with answer buttons on phone landscape (gap -13px → +11px).
**Task 390:** DONE, committed and pushed (`5209f4c`).
**Task 389:** DONE, committed and pushed (`4c839cc`) — Animal Counting tiles enlarged, 64px choice floor preserved.
**Task 388:** DONE, committed and pushed (`0314ced`) — Cat Forest cat lift scales with cat/plate/stage size.
**Tasks 384–387:** DONE and archived in prior sessions (see `archive/tasks/tasks-300-399.md`).

## Current state

- Tasks 388 (Cat Forest crowding), 389 (Animal Counting stage balance) and 390 (Spatial feedback spacing) are complete: code changed, smoke guards added and negative-tested, 8 review screenshots each, `build_offline.js` + `sync-docs.sh` + `check_fast.js` green, versions bumped 3.0.4 → 3.0.7, committed and pushed to main.
- `archive_tasks.js` archived tasks 384–390 into `archive/tasks/tasks-300-399.md`; `project/tasks/ACTIVE.md` now holds 391–398 as NEW.
- The continuation plan is `project/plans/visual-ux-continuation-plan-2026-11.md`. Findings source: `resources/General_reviews/VISUAL_UX_REVIEW_2026-11.md`.
- Next tasks in order: 391 (Compare portrait — assess only, playtest-gated), 393 (GAME_MATRIX reconciliation), then 394–398 (392/396/398 limited to real-device/manual testing and must be reported as limited, never claimed complete).

## Project invariants

- `game/` is the deployable source of truth; `docs/` is its generated mirror (regenerated via `build_offline.js` + `sync-docs.sh`, verified by `check_fast.js`).
- `resources/` contains review/development material; `tools/` contains validation tooling.
- Preserve Serbian Cyrillic child-facing text, Serbian speech, offline-first operation, child privacy, and each game's distinct identity.
- No ads, tracking, analytics, monetization, accounts or mandatory network dependency.
- Never claim manual child/family playtesting without evidence.

## Verification limits

- Fast gate (`node tools/check_fast.js`) 10/10 green locally after each task; per-task validation logs in `tools/.cache/task<N>-validation.md`.
- The full smoke battery (`node tools/run_all.js` / `check_release.js`) and CI were green for Tasks 388/389; Task 390 CI was in progress at session end.
- Tasks 392/396/398 require real devices or manual accessibility/playtesting — report as limited, never claim complete.
