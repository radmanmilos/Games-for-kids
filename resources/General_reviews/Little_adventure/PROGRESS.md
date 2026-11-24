# PROGRESS — little_adventure («Мала авантура»)

Live ledger. **Every AI updates this at the start (claim) and end (result) of its session.** One row per card; newest notes at the bottom of *Log*. Last updated: 2026-11-23 (plan written; nothing implemented).

Repo base when the plan was written: `main` @ `a9360af`, manifest 3.0.19. Next repo task number at that time: **464** (take the live number from `project/tasks/INDEX.md`).

## Gate

- [ ] User confirmed D1 (title) and reviewed the DEFAULT decisions (`05_DECISIONS_AND_RISKS.md` §1)
- [ ] Package installed in the repo and committed by the user (IS-00)

## Task board

Status: `NEW` · `IN PROGRESS` · `DONE` · `BLOCKED` · `DEFERRED`. "Repo #" is the number from `project/tasks/ACTIVE.md`.

| ID | Phase | Title | Depends on | Status | Repo # | Who (tool/model) | Date | Result / notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| IS-00 | 0 | Confirm decisions, install package, baseline | — | NEW | | | | |
| IS-01 | 1 | Page shell + registry + hidden hub tile | IS-00 | NEW | | | | |
| IS-02 | 1 | Chrome smoke skeleton + tool wiring + version bump | IS-01 | NEW | | | | |
| IS-03 | 2 | Config + validateConfig + stickVector + logic smoke | IS-02 | NEW | | | | |
| IS-04 | 2 | Logic core: movement, collision, determinism | IS-03 | NEW | | | | |
| IS-05 | 2 | Logic: sword, shield, grumpy AI, acorns | IS-04 | NEW | | | | |
| IS-06 | 2 | Logic: puzzle rules + playthrough bot | IS-05 | NEW | | | | |
| IS-07 | 2 | Logic: save/load + validation + API freeze | IS-06 | NEW | | | | |
| IS-08 | 3 | Renderer bootstrap + camera + lifecycle | IS-02, IS-07 | NEW | | | | |
| IS-09 | 3 | Model builders + `?gallery=1` (**gate G2**) | IS-08 | NEW | | | | |
| IS-10 | 3 | World dressing | IS-09 + G2 | NEW | | | | |
| IS-11 | 3 | Hero + joystick + buttons | IS-10 | NEW | | | | |
| IS-12 | 3 | Actors rendered from state → first playable (**gate G3**) | IS-11 | NEW | | | | |
| IS-13 | 4 | Combat feel + SFX | IS-12 + G3 | NEW | | | | |
| IS-14 | 4 | Guidance + speech | IS-13 | NEW | | | | |
| IS-15 | 4 | Start screen + save + celebration | IS-14 | NEW | | | | |
| IS-16 | 4 | Reduced motion + a11y + lifecycle | IS-15 | NEW | | | | |
| IS-17 | 4 | Performance pass (tablet) | IS-16 | NEW | | | | |
| IS-18 | 4 | Full battery + offline + screenshots (**gate G4**) | IS-17 | NEW | | | | |
| IS-19 | 5 | Docs sweep + unhide tile + release prep | IS-18 + G4 | NEW | | | | |
| IS-20 | 5 | Playtest rounds + tuning (**gate G5**) | IS-19 | NEW | | | | |

## Log

- 2026-11-23 — Claude/Sonnet 5.5 — plan package written (README, 00–06, PROGRESS). No `game/` or `tools/` file touched. Not verified: Chrome/WebGL behaviour, CI state, tablet performance.
