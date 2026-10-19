# Petrin svet — Status

*Overwrite this file at the end of every session (never append). Budget: 6 KB, checked by `node tools/check_docs.js`.*

**Last updated:** 2026-10-19 · **App version:** 2.3.4 (`game/manifest.json`; Cat Forest ships 2.4.0 at CF-21)
**Repository:** https://github.com/radmanmilos/Games-for-kids

## Where we are

- **Мачја шума (Cat Forest) — building.** The approved plan package lives at `resources/General_reviews/Cat_Forest/` (ledger: its `PROGRESS.md`; cards: its `03_TASKS.md`). **Done:** task 261 = CF-00 (governance baseline) · task 262 = CF-01 (page shell + registry + hub tile — «Мачја шума» opens from the Games hub, empty stage + working back button) · task 263 = CF-02 (`tools/cat_forest_smoke.js`, 14 checks + negative control; registry `smoke` wired). Every card closed with `check_fast` 8/8 and CI green. **Next: task 264 = CF-03** (static stage layout + geometry checks; may bundle with CF-04 only if it stays small). Delivery: after each done card/bundle the AI commits+pushes to `main` and verifies CI (D11 amended 2026-10-19); `ACTIVE.md` stays lean with pointers to the package.
- **Tasks 258–263 archived (2026-10-19):** UI consistency round 2 (2.3.3) · fastcat malformed-SVG fix (2.3.4) · harness hardening (every smoke captures Chrome `Log.entryAdded` rendering errors) · Cat Forest CF-00, CF-01, CF-02.
- **Asset Generation project — active, Phase 1 (inventory/approval).** Test-batch PNGs under `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/`: bone and elephant (approved), **lion (user-accepted)** and **frog (candidate, technical QA pending)**. Nothing integrated at runtime.

## Candidate next work (the user decides; do not start without asking)

0. **Cat Forest CF-03 (task 264)** then CF-04… — see the package; the AI continues card by card unless a decision is needed.
1. **Live play-test of 2.3.4** on a real device (unified nav bubble, bigger triangles, racing3D flowers-only HUD, tracing one-back, repaired fastcat 🌍 icon). Force-refresh may be needed for the cached shell.
2. **racing3d tuning** — levers in `game/games/racing3d.mjs` (`bankMax`, `LATERAL_GAIN`, `inRate`/`outRate`, `bobY`, `camPull`/`camRise`).
3. **"Tier A" learning content** from the finished roadmaps in `archive/plans/` (see `project/reference/LEARNING_ROADMAP_REVIEW.md`).

## Validate (details: `AGENTS.md`)

`node tools/check_fast.js` (read-only, ~9 s) → `node tools/run_all.js --game <name>` / `--since HEAD` → `node tools/check_release.js` before a release. Smokes need Chrome (`CHROME_PATH`); racing3d needs WebGL (this host has none, so its WebGL battery is skipped locally and covered by CI). **Host caveats:** the sandbox kills long single runs (use `run_all.js --concurrency 2 --resume` for the battery), and newly created files under `tools/.cache/` and some working-tree writes can be silently lost between shell calls — re-read after writing.

## Rules of the road

- `game/` changes ⇒ run `tools/sync-docs.sh` **and** `node tools/build_offline.js` when assets/pages change (the offline inventory hashes real bytes) **and refresh the affected review screenshots**. Never edit `docs/` by hand. Cat Forest's `game/manifest.json` bump is deferred to CF-21 (2.3.4 → 2.4.0) per the approved ROADMAP — recorded in the package ledger.
- **Cat Forest delivery (D11 amended 2026-10-19):** after each card/bundle is DONE and gates are green, the AI commits and pushes to `main` and verifies CI; never continue on red or dirty.
- Before touching a risky area read its lesson file: see the table in `AGENTS.md` (`project/lessons/`).
- Locked decisions: `project/DECISIONS.md`. Process: `project/PROCESS.md`.
- Older session logs: `archive/handover/`.
