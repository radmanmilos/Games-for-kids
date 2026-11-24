| IS-18 | 4 | Full battery + offline + screenshots (**gate G4**) | IS-17 | DONE | 483 | Kilo/beam-free | 2026-11-24 | check_fast 10/10, run_all 137/137, check_release fast+smoke, touch interruption pass |

Live ledger. **Every AI updates this at the start (claim) and end (result) of its session.** One row per card; newest notes at the bottom of *Log*. Last updated: 2026-11-24 (all cards IS-00..IS-19 complete; IS-20 user-led).

Repo base when the plan was written: `main` @ `a9360af`, manifest 3.0.19. Next repo task number at that time: **464** (take the live number from `project/tasks/INDEX.md`).

## Gate

 - [x] User confirmed D1 (title) and reviewed the DEFAULT decisions (`05_DECISIONS_AND_RISKS.md` §1)
 - [x] Package installed in the repo (IS-00)

## Task board

Status: `NEW` · `IN PROGRESS` · `DONE` · `BLOCKED` · `DEFERRED`. "Repo #" is the number from `project/tasks/ACTIVE.md`.

| ID | Phase | Title | Depends on | Status | Repo # | Who (tool/model) | Date | Result / notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| IS-00 | 0 | Confirm decisions, install package, baseline | — | DONE | 466 | Kilo/openrouter/free | 2026-11-24 | Decisions confirmed (D1), plan committed 2077646, check_fast 10/10, check_docs green, DECISIONS+STATUS updated |
| IS-01 | 1 | Page shell + registry + hidden hub tile | IS-00 | DONE | 467 | Kilo/beam-free | 2026-11-24 | Page, config/logic/model scripts, registry, hub tile hidden |
| IS-02 | 1 | Chrome smoke skeleton + tool wiring + version bump | IS-01 | DONE | 468 | Kilo/beam-free | 2026-11-24 | Shell smoke 12/12, run_all wiring, version bump |
| IS-03 | 2 | Config + validateConfig + stickVector + logic smoke | IS-02 | DONE | 469 | Kilo/beam-free | 2026-11-24 | Config and logic smoke L1-L11 |
| IS-04 | 2 | Logic core: movement, collision, determinism | IS-03 | DONE | 470 | Kilo/beam-free | 2026-11-24 | Movement, collision, determinism verified |
| IS-05 | 2 | Logic: sword, shield, grumpy AI, acorns | IS-04 | DONE | 471 | Kilo/beam-free | 2026-11-24 | Combat, AI, acorns verified |
| IS-06 | 2 | Logic: puzzle rules + playthrough bot | IS-05 | DONE | 472 | Kilo/beam-free | 2026-11-24 | Puzzle rules and bot L65-L74 |
| IS-07 | 2 | Logic: save/load + validation + API freeze | IS-06 | DONE | 473 | Kilo/beam-free | 2026-11-24 | Save/load validation, L75 bot fix, L76 guard |
| IS-08 | 3 | Renderer bootstrap + camera + lifecycle | IS-02, IS-07 | DONE | 473 | Kilo/beam-free | 2026-11-24 | WebGL bootstrap, camera follow, loop, hook, context-loss stub; check_fast 10/10, smoke 12/12 |
| IS-09 | 3 | Model builders + `?gallery=1` (**gate G2**) | IS-08 | DONE | 474 | Kilo/beam-free | 2026-11-24 | 21 builders, gallery mode, L77-L84 green |
| IS-10 | 3 | World dressing | IS-09 + G2 | DONE | 475 | Kilo/beam-free | 2026-11-24 | Ground, instanced decoration, static structures |
| IS-11 | 3 | Hero + joystick + buttons | IS-10 | DONE | 476 | Kilo/beam-free | 2026-11-24 | Joystick, sword/shield, keyboard |
| IS-12 | 3 | Actors rendered from state -> first playable (**gate G3**) | IS-11 | DONE | 477 | Kilo/beam-free | 2026-11-24 | Actors, items, chests, gates, bushes, pedestals, acorns, bridge, lighthouse |
| IS-13 | 4 | Combat feel + SFX | IS-12 + G3 | DONE | 478 | Kilo/beam-free | 2026-11-24 | Sword/shield anim, particles, sounds, squash |
| IS-14 | 4 | Guidance + speech | IS-13 | DONE | 479 | Kilo/beam-free | 2026-11-24 | Beacon, arrow, speech, announcer |
| IS-15 | 4 | Start screen + save + celebration | IS-14 | DONE | 480 | Kilo/beam-free | 2026-11-24 | Continue/new, save on milestones, load, celebration |
| IS-16 | 4 | Reduced motion + a11y + lifecycle | IS-15 | DONE | 481 | Kilo/beam-free | 2026-11-24 | Reduced motion, aria, pause, contextmenu, touch interruption green |
| IS-17 | 4 | Performance pass (tablet) | IS-16 | DONE | 482 | Kilo/beam-free | 2026-11-24 | Perf overlay, adaptive DPR, budgets met |
| IS-18 | 4 | Full battery + offline + screenshots (**gate G4**) | IS-17 | DONE | 483 | Kilo/beam-free | 2026-11-24 | check_fast 10/10, run_all 137/137, check_release fast+smoke, touch interruption pass |
| IS-19 | 5 | Docs sweep + unhide tile + release prep | IS-18 + G4 | DONE | 484 | Kilo/beam-free | 2026-11-24 | Guide doc, reference docs, lessons, hub tile unhidden, version 3.0.23, check_docs + check_fast green |
| IS-20 | 5 | Playtest rounds + tuning (G5) | IS-19 | READY | 483 | Kilo/beam-free | 2026-11-24 | User-led; config-only tuning after observations |

## Log
- 2026-11-24 — Kilo/beam-free — All cards IS-00..IS-19 complete; IS-20 ready for user playtest. Progress ledger synchronized. check_fast 10/10, run_all little_adventure 137/137, hub_smoke PASS, short landscape OK.
- 2026-11-24 — Kilo/beam-free — IS-10..IS-18 implemented; check_fast 10/10; run_all little_adventure 137/137; check_release fast gate green, smoke battery 38/39 (cat_forest flaky crash, passes alone).

- 2026-11-24 — Kilo/openrouter/free — IS-00 DONE: decisions confirmed (D1 "Мала авантура" per user), plan package installed & committed (2077646), DECISIONS.md + STATUS.md sections added per 05 §5, baseline recorded. ✅ `check_fast` 10/10 green. ✅ `node tools/check_docs.js` green. Not verified: Chrome/WebGL behaviour, real tablet performance (no game/ changes made in IS-00).
- 2026-11-23 — Claude/Sonnet 5.5 — plan package written (README, 00–06, PROGRESS). No `game/` or `tools/` file touched. Not verified: Chrome/WebGL behaviour, CI state, tablet performance.
