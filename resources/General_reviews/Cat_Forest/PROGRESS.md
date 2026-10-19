# PROGRESS — Мачја шума (Cat Forest)

Live ledger. **Every AI updates this at the start (claim) and end (result) of its session.** Keep it short: one row per task, newest notes at the bottom of *Log*. Last updated: 2026-10-19 (plan written, nothing started).

Repo base when the plan was written: `main` @ `d83d6fc`. Next repo task number at that time: **250** (take the live number from `project/tasks/INDEX.md`; live number when execution started: **261**).

## Gate

- [x] User approved decisions D1–D11 and the risk plan (2026-10-19; `05_DECISIONS_AND_RISKS.md` §1–§2)
- [x] Package copied to `resources/General_reviews/Cat_Forest/` and committed (CF-00; committed `15dfb03` by OpenCode/Big Pickle per the amended D11 — the AI now commits+pushes after each done card/bundle)

## Task board

Status: `NEW` · `IN PROGRESS` · `DONE` · `BLOCKED` · `DEFERRED`. "Repo #" is the number from `project/tasks/ACTIVE.md`/`INDEX.md`.

| ID | Phase | Title | Depends on | Status | Repo # | Who (tool/model) | Date | Result / commit / notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CF-00 | 0 | Approve decisions, install package, baseline | — | DONE | 261 | OpenCode/Big Pickle | 2026-10-19 | decisions verified APPROVED; package committed `15dfb03`; baseline: clean tree, CI green (docs/CodeQL/pages), `check_fast` 8/8; STATUS pointer + DECISIONS.md section added; D11 amended (AI commits+pushes per done card/bundle) |
| CF-01 | 1 | Page shell + registry + title + hub tile | CF-00 | DONE | 262 | OpenCode/Big Pickle | 2026-10-19 | page+script+titles+registry+hub tile; check_fast 8/8; probe: boot OK, back→hub OK, no console errors; hub_smoke green; short_landscape_audit cat_forest **0 FAIL** (1 accepted WARN: no header text — wordless by design). Deviation: `#cf-stage` is `position:absolute` inside the fixed `#app` (TD §4 said fixed) — sibling fixed = chrome-overlap FAIL in the audit. Superseded by CF-02's smoke. |
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
- 2026-10-19 — OpenCode/Big Pickle — CF-00 done (repo task 261). Package committed+pushed (`15dfb03`). Baseline recorded: tree clean at `d2ceed6` before package commit; `gh run list`: last completed runs all success; `node tools/check_fast.js` 8/8 green. Added the STATUS.md pointer line, the ≤10-line «Мачја шума» section in `project/DECISIONS.md`, and claimed task 261. User decisions this session: **D11 amended** — after each done card/bundle the AI commits+pushes to main and verifies CI (was: user commits); **small cards may be bundled** in one session/one repo task when efficient; **ACTIVE.md stays lean** (one-liner + pointer to this package). Next: CF-01 (repo task 262).
- 2026-10-19 — OpenCode/Big Pickle — CF-01 done (repo task 262). Created `game/pages/cat_forest.html`, `game/games/cat_forest.js` (IIFE, started-guard, stub `__catForest`), `titles.cat_forest` in serbian.js, the `cat_forest` registry entry (`hubOrder:12`, `toddler:true`, `screenshot:false`), and the 🐱🌲 hub tile. Generated artifacts rebuilt with the printed fix commands (`sync-docs.sh`, `generate_sw_list.js`, `build_offline.js`); `check_fast` 8/8. One-off Chrome probe: boot OK, `no browser runtime errors`, back button 72×72 hit-testable → `index.html#hub-games`. `hub_smoke` green; `short_landscape_audit` cat_forest 0 FAIL, 1 accepted WARN (no header text — wordless by design). **Deviation recorded:** TD §4 says `#cf-stage` is `position:fixed`; implemented `position:absolute` inside the fixed `#app` because two sibling fixed elements make the audit report a chrome-overlap FAIL. Next: CF-02 (repo task 263, smoke skeleton; may bundle with CF-03).
- 2026-10-19 — OpenCode/Big Pickle — CF-01 CI follow-up (same task 262). CI's Release QA (`tools/offline_smoke.mjs`) went red on the CF-01 push: interaction coverage is a **table keyed by registry id** and the mandated `offline:true` makes a row compulsory the moment the entry lands, so a registry-only card can never be green without one (`25 registry children, 24 specs [missing cat_forest]`). Two things learned: (1) the close ritual must re-run `check_fast` **after** the last `game/` edit — the `#cf-stage` fix landed after the final `sync-docs`, so `docs/pages/cat_forest.html` + the offline manifest were stale in the first push (fixed in `30f978b`); (2) TP §4 lists `offline_smoke.mjs` as a CF-01 gate, so this belonged in CF-01 all along. Added a temporary `cat_forest` row to `tools/offline_smoke.mjs`: `ready` = boot predicate, `act` = the shell's one real behaviour (back control → hub, then re-open so the harness's own P6 still runs on this page). Row is honest, not vacuous, and **CF-16 replaces it with the real treat interaction**. Local `offline_smoke`: `25 children, 25 specs [exact match]`, cat_forest P1/P4/P4-interaction/P5/P6 all PASS, 0 FAIL.
