# Мачја шума (Cat Forest) — implementation package

A complete plan, roadmap and task set for **implementation AIs** (OpenCode, Kilo, Codex, Copilot, Claude) to build one new game inside `radmanmilos/Games-for-kids` (Petras World / Петрин свет).

- Written: 2026-10-19 by Claude (Sonnet 5.5) · base: `main` @ `d83d6fc`, clean tree.
- Status: **READY TO EXECUTE — decisions D1–D11 and the risk plan were approved on 2026-10-19** (`05_DECISIONS_AND_RISKS.md` §1–§2). Nothing in the repo has been edited yet; the first step is CF-00 (install the package), then CF-01.
- Install location (after the user approves): copy this folder to `resources/General_reviews/Cat_Forest/`. Reason: `check_docs` link-checks and size-budgets everything `.md` under `project/`, and the repo keeps `project/` small for AI context; plans live in `resources/`. Only short pointers go into live docs (see CF-00).

## What the game is, in one paragraph

A calm "feed the kitties" game for ages ~2–6, adapted from the idle game *Secret Cat Forest*. The child picks a treat (🐟 🥛 🍗 🍣 🍪) and puts it on one of three plates; a cat (emoji) walks in, sits, eats for a few seconds and leaves a gift (🌸 🍄 🦋 …); tapping the gift makes it grow into the forest as a decoration. Tapping a cat gives hearts, a meow and its name spoken in Serbian. A ☀️/🌙 toggle changes the sky and which cats visit; a 🌧️ toggle adds rain. **There is no currency, shop, XP, level, lock, score, timer, fail state, offline earning or notification** — the repo's product principles forbid them (details and the full mapping from Secret Cat Forest are in `00_PRODUCT_SPEC.md` §2).

## Files in this package

| File | Purpose | Read when |
| --- | --- | --- |
| `README.md` | this index + rules | always, first |
| `00_PRODUCT_SPEC.md` | what to build: principles mapping, loop, content tables, tunable constants, non-goals | before any task |
| `01_TECH_DESIGN.md` | how to build it in the repo's technology: files, DOM contract, state model, algorithms, hook API, wiring | before any code task |
| `02_ROADMAP.md` | phases, dependency graph, parallelisation and file-ownership rules, release gates | when choosing the next task |
| `03_TASKS.md` | **the task cards CF-00 … CF-22** (goal, files, steps, acceptance criteria, commands, risks) | to execute one task |
| `04_TEST_PLAN.md` | smoke-test assertions per phase, viewport matrix, negative tests, manual play-test script | for any test task and for review |
| `05_DECISIONS_AND_RISKS.md` | approved decisions D1–D11, risk register + user actions, review checklist, paste-ready CF-00 text | before Phase 1; at review |
| `06_AI_HANDOFF_PROMPTS.md` | paste-ready prompts: master, per-task, review, resume | to start any AI session |
| `PROGRESS.md` | the live ledger every AI updates (status, who, mapping to repo task numbers) | start and end of every session |

## Read order for an implementing AI

1. `AGENTS.md` and `project/STATUS.md` (repo startup set — they win over this package if they disagree; tell the user about the conflict).
2. This README → `PROGRESS.md` → the task card you were given in `03_TASKS.md`.
3. Only the other package files that the card's **Read first** line names.
4. The repo files the card names (always the smallest set).

## Ground rules (summary — `AGENTS.md` is authoritative)

1. **Investigate, then change.** Smallest correct change; no speculative refactors; no duplicate shared systems; nothing outside the card's file list.
2. **Never edit `docs/` by hand.** After changing `game/`, run `tools/sync-docs.sh` (use Git Bash on Windows) — the gates fail on an unsynced mirror.
3. **`game/shared/*` is off-limits** for this project. If a card seems to need a shared change, STOP, record it in `PROGRESS.md` under *Blocked*, and ask the user (shared changes trigger the whole smoke battery and affect every game).
4. **Never claim a test passed unless it actually ran.** If your environment has no Chrome, mark the criterion `UNVERIFIED — needs user run` and give the exact command.
5. **Never commit or push to `main`** unless the user says so for this task. Leave the work uncommitted (or on the branch the user names). If you do commit, add the trailer `Agent: <Tool>/<model>`.
6. **Footguns:** read `project/lessons/game-runtime.md` and `project/lessons/testing-harness.md` before the first code task. Key ones: never give a game-file top-level function the name of a shared export (`showHint`, `softPop`, `speakSr`, `gentleMiss`, `successChime`, `celebrateFeedback`) — this game uses an IIFE and the prefix `catForest…` anyway; `window.tone(freq, dur, delay, type, vol)` has `type` as the **4th** argument; negative tests restore from a copy, never `git checkout`/`stash`.
7. **Child-facing text and speech are Serbian Cyrillic only.** Emoji animals are the settled art style: no image assets.
8. **One task = one repo task.** Claim it in `project/tasks/ACTIVE.md` (`N. NEW — <title> (<date>, <tool/model>)` → `IN PROGRESS`; `N` = next number in `project/tasks/INDEX.md`; as of this writing that is **250**). Add **only** the task you are about to start — do not paste the roadmap into `ACTIVE.md` (20 KB budget). At the end: DONE note, `node tools/archive_tasks.js`, update `PROGRESS.md`, overwrite `project/STATUS.md` (6 KB budget), `node tools/check_docs.js`.

## Definition of Done (applies to every code task)

- All acceptance criteria (AC) in the card are met **or** explicitly marked UNVERIFIED with the command the user must run.
- `node tools/check_fast.js` is green (or its failures are explained and unrelated).
- `node tools/cat_forest_smoke.js` is green once it exists; plus `node tools/run_all.js --since HEAD` for the changed files.
- `tools/sync-docs.sh` has been run if `game/` changed; `node tools/check_docs.js` is green if any `.md` under `project/` or `tools/README.md` changed.
- The philosophy checklist in `05_DECISIONS_AND_RISKS.md` §3 passes.
- `PROGRESS.md` updated; `ACTIVE.md` entry closed.

## Naming contract (use exactly these)

| Thing | Value |
| --- | --- |
| registry id / route / page | `cat_forest` / `game-cat-forest` / `game/pages/cat_forest.html` |
| game script | `game/games/cat_forest.js` (one IIFE, style as `sorting.js`) |
| start function / back button id | `window.startCatForest` / `cat-forest-back` |
| smoke | `tools/cat_forest_smoke.js` (registry `smoke: 'cat_forest_smoke'`) |
| test hook | `window.__catForest` |
| DOM/CSS prefix | `cf-` |
| storage key | `catForestSave` (schema in `01_TECH_DESIGN.md` §9) |
| title key | `window.SERBIAN.titles.cat_forest` → «Мачја шума» (D1 approved) |
| per-game doc (written in CF-20) | `project/games/cat-forest.md` |
