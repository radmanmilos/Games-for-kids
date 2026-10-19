# PROGRESS — Мачја шума (Cat Forest)

Live ledger. **Every AI updates this at the start (claim) and end (result) of its session.** Keep it short: one row per task, newest notes at the bottom of *Log*. Last updated: 2026-10-19 (plan written, nothing started).

Repo base when the plan was written: `main` @ `d83d6fc`. Next repo task number at that time: **250** (take the live number from `project/tasks/INDEX.md`).

## Gate

- [x] User approved decisions D1–D11 and the risk plan (2026-10-19; `05_DECISIONS_AND_RISKS.md` §1–§2)
- [ ] Package copied to `resources/General_reviews/Cat_Forest/` and committed by the user (CF-00)

## Task board

Status: `NEW` · `IN PROGRESS` · `DONE` · `BLOCKED` · `DEFERRED`. "Repo #" is the number from `project/tasks/ACTIVE.md`/`INDEX.md`.

| ID | Phase | Title | Depends on | Status | Repo # | Who (tool/model) | Date | Result / commit / notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CF-00 | 0 | Approve decisions, install package, baseline | — | NEW | | | | decisions done; remaining: copy package, baseline, STATUS/DECISIONS/ACTIVE lines (text in 05 §5) |
| CF-01 | 1 | Page shell + registry + title + hub tile | CF-00 | NEW | | | | |
| CF-02 | 1 | Smoke skeleton + tool wiring | CF-01 | NEW | | | | |
| CF-03 | 1 | Static stage layout (CSS) + geometry checks | CF-01 | NEW | | | | |
| CF-04 | 2 | Engine core: config, clock, RNG, state, test hook | CF-03 | NEW | | | | |
| CF-05 | 2 | Treat selection + placement + plate states | CF-04 | NEW | | | | |
| CF-06 | 2 | Cat data + weighted picker | CF-04 | NEW | | | | |
| CF-07 | 2 | Cat actor lifecycle (enter/sit/eat/leave) | CF-05, CF-06 | NEW | | | | |
| CF-08 | 2 | Gifts + growing forest decorations | CF-07 | NEW | | | | |
| CF-09 | 3 | Cuddle tap: hearts, meow, spoken name | CF-07 | NEW | | | | |
| CF-10 | 3 | Special rules + idle hint | CF-08, CF-09 | NEW | | | | |
| CF-11 | 4 | Day/night toggle | CF-10 | NEW | | | | |
| CF-12 | 4 | Rain toggle + reduced-motion gates | CF-11 | NEW | | | | |
| CF-13 | 4 | Drag-and-drop placement (D8 approved) | CF-05 | NEW | | | | |
| CF-14 | 5 | Persistence (save/load/reset) (D4 approved) | CF-08 | NEW | | | | |
| CF-15 | 5 | «Мачке пријатељи» book (D3 approved) | CF-14 | NEW | | | | |
| CF-16 | 6 | Smoke completeness + negative tests + viewport matrix | CF-12, CF-14 | NEW | | | | |
| CF-17 | 6 | Accessibility + touch + short-landscape audits | CF-16 | NEW | | | | |
| CF-18 | 6 | Offline + generated artifacts | CF-16 | NEW | | | | |
| CF-19 | 6 | Screenshot states + baseline instructions (D10: states now, flip later) | CF-16 | NEW | | | | |
| CF-20 | 6 | Docs, decisions, lessons | CF-17, CF-18 | NEW | | | | |
| CF-21 | 6 | Release gate + version bump + user commit | CF-17–CF-20 | NEW | | | | |
| CF-22 | 7 | Play-test rounds + tuning (repeatable) | CF-21 | NEW | | | | |

## Blocked / questions for the user

*(none yet)*

## Log (newest last)

- 2026-10-19 — Claude/Sonnet 5.5 — Plan package written. No repo files changed. Sandbox had no Chrome and no `gh`: browser smokes and CI status were not (and could not be) checked.
- 2026-10-19 — Claude/Sonnet 5.5 — Decisions D1–D11 and risk plan approved by the user in chat (D1 «Мачја шума»; D3+D4 book + saving; D2/D5–D8/D10/D11 defaults accepted; D9 names approved as written, TTS to be verified). Package updated; still no repo changes. Next: CF-00.
