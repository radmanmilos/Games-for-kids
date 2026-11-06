# Petrin svet — Status

*Overwritten 2026-11-06. App version: 3.0.7. Repository: https://github.com/radmanmilos/Games-for-kids.*

**Main:** `778e772` (archive + status); CI green for 388/389/390; Task 393/394/395/397 pushed in archive commit.

## Current state

Tasks 388–398 processing status:

- **388 DONE, pushed** (`0314ced`) — Cat Forest cat lift scales with cat/plate/stage size; 12px gap, 0% overlap at all 5 viewports.
- **389 DONE, pushed** (`4c839cc`) — Animal Counting tiles enlarged; 64px choice floor preserved.
- **390 DONE, pushed** (`5209f4c`) — Spatial feedback no longer collides with answer buttons on phone landscape (gap -13px → +11px).
- **391 ASSESSED (limited)** — Compare portrait measured (groups 138×129px on 390x844; sparse central cluster, not a blocker). No code change: requires child/device feedback before subjective composition change. 8 screenshots; compare_smoke 29/0.
- **392 LIMITED** — Playtesting Sessions A–D need a real device. Automated foundation: offline_smoke 25/25, check_release green. Sessions A/B/D unperformed.
- **393 DONE, pushed** (`778e772` archive) — GAME_MATRIX reconciled with registry; screenshot flags flipped for 8 pages; guide-doc lists rebuilt.
- **394 DONE, pushed** (`778e772` archive) — Full per-game audit in project/reference/GAME_AUDIT.md (26 surfaces × 9 dimensions).
- **395 DONE, pushed** (`778e772` archive) — sw_update_smoke 14/14, offline_smoke 25/25; cache policy preserved.
- **396 LIMITED** — Manual a11y/input needs real device. Automated: axe_check 0 violations; touch_interruption a-d 156/0.
- **397 DONE, pushed** (`778e772` archive) — All child-facing text Cyrillic; Serbian speech mapped to audio assets; no Latin content.
- **398 LIMITED** — Modest-Android performance needs real device. Verifiable: no runtime errors, offline resilience, check_fast/release green.

**Next task number: 399.** Remaining open tasks (391, 392, 396, 398) are all LIMITED/ASSESSED — each requires a real device or child/family playtest to complete, and must be reported as limited, never claimed complete.

## Project invariants

- `game/` is the deployable source of truth; `docs/` is its generated mirror (regenerated via `build_offline.js` + `sync-docs.sh`, verified by `check_fast.js`).
- `resources/` contains review/development material; `tools/` contains validation tooling.
- Preserve Serbian Cyrillic child-facing text, Serbian speech, offline-first operation, child privacy, and each game's distinct identity.
- No ads, tracking, analytics, monetization, accounts or mandatory network dependency.
- Never claim manual child/family playtesting without evidence.

## Verification limits

- Fast gate (`node tools/check_fast.js`) 10/10 green after each task; per-task validation logs in `tools/.cache/task<N>-validation.md`.
- Full smoke battery (`node tools/run_all.js` per-game): all 37 tools pass individually. Release gate (`node tools/check_release.js`) green.
- Tasks 392/396/398 require real devices — report as limited, never claim complete.
