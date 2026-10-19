# Petrin svet — Status

*Overwrite this file at the end of every session (never append). Budget: 6 KB, checked by `node tools/check_docs.js`.*

**Last updated:** 2026-10-19 · **App version:** 2.3.4 (`game/manifest.json`)
**Repository:** https://github.com/radmanmilos/Games-for-kids

## Where we are

- **Мачја шума (Cat Forest) — execution started.** The approved plan package lives at `resources/General_reviews/Cat_Forest/` (committed `15dfb03`); the cross-session ledger is its `PROGRESS.md`, task cards are in its `03_TASKS.md`. **Task 261 = CF-00 DONE (2026-10-19, OpenCode/Big Pickle):** decisions D1–D11 verified APPROVED, baseline recorded (clean tree, CI success, `check_fast` 8/8), STATUS pointer + ≤10-line «Мачја шума» section added to `project/DECISIONS.md`. User decisions this session: **D11 amended** — after each done card/bundle the AI commits+pushes to `main` and verifies CI (never continue on red/dirty); small cards may be bundled in one repo task; `ACTIVE.md` stays lean with pointers to the package. **Next: CF-01 (task 262) — page shell + registry + hub tile.**
- **Tasks 258–260 archived (2026-10-19):** UI consistency round 2 (2.3.3, `60947ad`) · fastcat malformed-SVG icon fix (2.3.4, `912d21a`) · harness hardening — every smoke now captures Chrome `Log.entryAdded` rendering/parser errors (`d2ceed6`). Detail in `archive/tasks/` and the package log.
- **Asset Generation project — active, Phase 1 (inventory/approval).** Test-batch PNGs under `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/`: bone and elephant (approved), **lion (user-accepted)** and **frog (candidate, technical QA pending)**. Nothing integrated at runtime.

## Candidate next work (the user decides; do not start without asking)

0. **Cat Forest CF-01 (task 262)** — page shell + registry + hub tile; card in `resources/General_reviews/Cat_Forest/03_TASKS.md`; master prompt in its `06_AI_HANDOFF_PROMPTS.md`.
1. **Live play-test of 2.3.4** on a real device (the unified nav bubble, bigger triangles, racing3D flowers-only HUD, tracing one-back, and the repaired fastcat «Играј поново» icon). Force-refresh may be needed for the cached shell.
2. **racing3d tuning** — levers in `game/games/racing3d.mjs` (`bankMax`, `LATERAL_GAIN`, `inRate`/`outRate`, `bobY`, `camPull`/`camRise`).
3. **"Tier A" learning content** from the finished roadmaps in `archive/plans/` (see `project/reference/LEARNING_ROADMAP_REVIEW.md`).

## Validate (details: `AGENTS.md`)

`node tools/check_fast.js` (read-only, ~9 s) → `node tools/run_all.js --game <name>` / `--since HEAD` → `node tools/check_release.js` before a release. Smokes need Chrome (`CHROME_PATH`); racing3d needs WebGL (this host has none, so its WebGL battery is skipped locally and covered by CI). **Host caveats:** the sandbox kills long single runs (use `run_all.js --concurrency 2 --resume` for the battery), and newly created files under `tools/.cache/` and some working-tree writes can be silently lost between shell calls — re-read after writing.

## Rules of the road

- `game/` changes ⇒ run `tools/sync-docs.sh` **and** `node tools/build_offline.js` when assets/pages change (the offline inventory hashes real bytes), **bump `game/manifest.json`** (A.B.C, deliberately NOT semver: C = minor, B = major, A = overhaul) **and refresh the affected review screenshots** (`AGENTS.md`). Never edit `docs/` by hand.
- **Cat Forest delivery (D11 amended 2026-10-19):** after each card/bundle is DONE and gates are green, the AI commits and pushes to `main` and verifies CI; never continue on red or dirty.
- Before touching a risky area read its lesson file: see the table in `AGENTS.md` (`project/lessons/`).
- Locked decisions: `project/DECISIONS.md`. Process: `project/PROCESS.md`.
- Older session logs: `archive/handover/`.
