# 02 — Roadmap

Eight phases, 23 cards. Each card is sized for **one AI session** (one repo task), so a usage limit or sandbox reset can never lose more than the current card. Status is tracked in `PROGRESS.md`.

## 1. Phases and milestones

| Phase | Cards | Milestone (what exists when the phase is done) | Gate to leave the phase |
| --- | --- | --- | --- |
| 0 Governance | CF-00 | Decisions approved, package in the repo, baseline recorded | User sign-off |
| 1 Skeleton | CF-01, 02, 03 | «Мачја шума» opens from the Games hub; empty-but-correct forest layout; smoke boots and checks geometry | `check_fast` + smoke green; hub tile verified at 1024×800 and 844×390 |
| 2 Core loop | CF-04 … 08 | Place a treat → cat walks in, eats, leaves a gift → gift grows the forest. Deterministic test hook | Smoke covers TP §3.3–§3.7 |
| 3 Personality | CF-09, 10 | Cuddle tap with meow and spoken name; special cats; idle hint | Smoke covers TP §3.8–§3.9 |
| 4 World | CF-11, 12, (13) | Day/night, rain, reduced-motion audit, optional drag | Smoke covers TP §3.10–§3.11 |
| 5 Memory | (CF-14, 15) | Saved forest + friends book (D4/D3 approved) | Smoke covers TP §3.12 |
| 6 Release | CF-16 … 21 | Full smoke, audits, offline, docs, release gate | `check_release` green; checklist (05 §3) ticked |
| 7 Play-test | CF-22 (×N) | Tuned with a real child on the real tablet | User sign-off per round |

**First playable:** end of Phase 2 (CF-08) — worth putting on the tablet immediately for an early look, before the polish phases.

## 2. Dependency graph

```
CF-00 ─ CF-01 ┬ CF-02 (smoke skeleton)
              └ CF-03 (layout) ─ CF-04 (engine) ┬ CF-05 (placement) ─┬ CF-07 (cats) ─ CF-08 (gifts) ┐
                                                └ CF-06 (picker)  ───┘          └ CF-09 (cuddle) ───┤
                                                                                                      ├ CF-10 (rules+hint)
        CF-05 ─ CF-13 (drag, optional)                                                               │
        CF-10 ─ CF-11 (day/night) ─ CF-12 (rain+reduced motion)                                      ┘
        CF-08 ─ CF-14 (persistence) ─ CF-15 (book)
        CF-12 + CF-14 ─ CF-16 (smoke complete) ┬ CF-17 (audits) ┐
                                               ├ CF-18 (offline) ┼ CF-20 (docs) ─ CF-21 (release) ─ CF-22 (play-test ×N)
                                               └ CF-19 (shots)  ┘
```
Critical path: CF-00 → 01 → 03 → 04 → 05/06 → 07 → 08 → 10 → 11 → 12 → 16 → 17/18 → 20 → 21.

## 3. Parallelisation and file ownership (multi-AI rules)

`game/games/cat_forest.js` is a **single file**. Two AIs editing it at once means merge pain, so:

- **Sequential (one AI at a time):** CF-04, 05, 06, 07, 08, 09, 10, 11, 12, 13, 14, 15 (all edit `cat_forest.js`). Within CF-05/CF-06 the two touch different sections (`PLATES` vs `PICKER`) and may run in parallel **only** if each works in its own checkout and the user merges; default is sequential.
- **Parallel-safe pairs:** CF-02 ∥ CF-03 (smoke file vs page/JS layout) · CF-17 ∥ CF-18 ∥ CF-19 (audits/artifacts/screenshots touch different files; if two need a `game/` fix, serialise those fixes) · CF-20 can start documenting stable parts once CF-16 is done.
- **Ownership:** `tools/cat_forest_smoke.js` is owned by whoever holds the current code card (every code card adds its own assertions in the same session). Docs are owned by CF-20. The ledger `PROGRESS.md` is edited by everyone (rows only, never reflow the table).
- **Claiming:** put `N. IN PROGRESS — <title> (<date>, <tool/model>)` in `project/tasks/ACTIVE.md` **before** touching files; run `git status --short` and `git log --oneline -5` first; if the tree is dirty with work you did not make, stop and ask the user.
- **Shared code:** never edit `game/shared/*`. If blocked, write the need in `PROGRESS.md` → *Blocked* and stop.

## 4. If a decision is ever reversed

All decisions were approved as proposed on 2026-10-19, so **all 23 cards stay in scope**. This table matters only if the user reverses one later.

| Decision | If NO / changed | Effect |
| --- | --- | --- |
| D3 friends book = no | skip CF-15 | CF-16 drops TP §3.12 book rows; CF-14 persistence still valid |
| D4 persistence = no | skip CF-14 and CF-15 | CF-16 depends on CF-12 only; no `catForestSave` key; `met` stays in-memory |
| D5 real-clock day/night | rewrite CF-11: read the hour via an injectable clock hook; keep tests deterministic with `setTime` | adds a risk R5 (real-clock surprises); needs a user-visible reason in `DECISIONS.md` |
| D8 drag = no | skip CF-13 | tap-select remains the only path |
| D10 screenshots = no | skip CF-19 | `screenshot:false` stays |
| D6 `toddler:false` | change one registry field in CF-01 | no other effect |

## 5. Session planning (usage-limit safety)

- One card per session. Start by reading `PROGRESS.md`; end by updating it.
- If a card cannot finish: stop at the end of the **current step**, leave the tree in a state where `check_fast` passes (revert half-edits from a copy, never `git checkout`), write in `PROGRESS.md`: what is done, exact next step, any uncommitted file list. A half-applied edit is never left behind.
- Smaller-than-card resumption points are the numbered **Steps** inside each card.
- Cheap wins when time is short: CF-02 (tests), CF-06 (data + picker), CF-09 (cuddle), CF-12 audit, CF-20 docs.

## 6. Release gates

1. All non-skipped cards DONE; `PROGRESS.md` consistent.
2. `node tools/check_release.js` green (full battery, read-only) — `[CHROME]`.
3. `docs/` equals `game/` (sync run; gate verifies).
4. Philosophy checklist (05 §3) ticked line by line, with evidence (smoke names, screenshots).
5. `project/STATUS.md` overwritten (≤ 6 KB); finished tasks archived; `check_docs` green.
6. The user performs the commit/push and watches CI (`gh run list`).
