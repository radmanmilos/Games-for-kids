# Petrin svet — Status

*Overwrite this file at the end of every session (never append). Budget: 6 KB, checked by `node tools/check_docs.js`.*

**Last updated:** 2026-10-20 · **App version:** 2.4.0 (`game/manifest.json`) · **Repository:** https://github.com/radmanmilos/Games-for-kids

## Where we are

- **Мачја шума (Cat Forest) — code complete, awaiting the user's commit.** The approved package is `resources/General_reviews/Cat_Forest/` (ledger `PROGRESS.md`, cards `03_TASKS.md`). **CF-00…CF-21 all DONE** (tasks 261–283; the ledger and `archive/tasks/` have every row). Highlights: engine core + TD §8 hook, treats/plates, the 10-cat roster + weighted picker, the actor lifecycle, gift→decor (cap 14), the cuddle tap, day/night + rain, drag-and-drop, the `catForestSave` key, the Friends book, a 210-check smoke with TP §4 philosophy guards (each negative-tested), the four repo audits, the offline inventory, deterministic screenshot states, and the live docs. **CF-22 (play-test rounds) is the remaining phase and belongs to the user.** Version bumped **2.3.4 → 2.4.0** in CF-21 so installed devices re-cache and receive the game. **Handed off uncommitted** (the CF-21 card says never commit/push): the user reviews `git status` and commits.
- **CF-21 note (report, not a blocker):** `check_release` is UNVERIFIED-clean on this host — its only red leg is the **pre-existing** `fastcat_smoke` "pulse + rotating ring" assertion, which pins the host's `prefers-reduced-motion` (this host = reduce; CI = no-preference, green on all 35 smokes in run 39481714681). Not a Cat Forest issue, out of scope, fix is a future harness task.
- **Tasks 258–283 archived (2026-10-19/20):** UI consistency round 2 (2.3.3) · fastcat malformed-SVG fix (2.3.4) · harness hardening · Cat Forest CF-00…CF-21.
- **Pages gated on CI (task 274):** CI's `pages` job publishes `docs/` only from a green push on `main`.
- **Asset Generation project — active, Phase 1 (inventory/approval).** Test-batch PNGs under `resources/General_reviews/Asset_Generation/`: bone and elephant (approved), **lion (user-accepted)**, **frog (QA pending)**. Nothing integrated at runtime.

## Candidate next work (the user decides; do not start without asking)

0. **Review and commit Cat Forest 2.4.0** (CF-21's hand-off is on disk, uncommitted), then **CF-22 play-test rounds** on the real tablet (TP §6 protocol; tune only `CF` constants/CSS/data).
1. **Fix the fastcat reduced-motion assertion** — assert the product's response to the preference, not the host's value (`project/lessons/racing3d.md` pattern). Small harness task.
2. **Live play-test of 2.4.0** on a real device (Cat Forest, unified nav bubble, bigger triangles, racing3D flowers-only HUD, tracing one-back, repaired fastcat 🌍 icon); a force-refresh may be needed for the cached shell.
3. **racing3d tuning** — levers in `game/games/racing3d.mjs` (`bankMax`, `LATERAL_GAIN`, `inRate`/`outRate`, `bobY`, `camPull`/`camRise`).
4. **"Tier A" learning content** from the finished roadmaps in `archive/plans/` (see `project/reference/LEARNING_ROADMAP_REVIEW.md`).

## Validate (details: `AGENTS.md`)

`node tools/check_fast.js` (read-only, ~9 s) → `node tools/run_all.js --game <name>` / `--since HEAD` → `node tools/check_release.js` before a release. Smokes need Chrome (`CHROME_PATH`); racing3d needs WebGL (this host has none, so its WebGL battery is skipped locally and covered by CI). **Host caveats:** the sandbox kills long single runs (use `run_all.js --concurrency 2 --resume` for the battery), and newly created files under `tools/.cache/` and some working-tree writes can be silently lost between shell calls — re-read after writing. This host reports `prefers-reduced-motion: reduce`, so any assertion that reads a live animation name fails locally though it passes on CI.

## Rules of the road

- `game/` changes ⇒ run `tools/sync-docs.sh` **and** `node tools/build_offline.js` **before** it when bytes change (manifest/pages/assets are hashed) **and refresh the affected review screenshots**. Never edit `docs/` by hand. Cat Forest shipped 2.4.0 (CF-21).
- **Cat Forest delivery (D11 amended 2026-10-19):** after each card/bundle is DONE and gates are green, the AI commits and pushes to `main` and verifies CI; never continue on red or dirty. **Exception:** the final card CF-21 is handed off uncommitted at the user's request (card text: "Never commit/push").
- Before touching a risky area read its lesson file: see the table in `AGENTS.md` (`project/lessons/`).
- Locked decisions: `project/DECISIONS.md`. Process: `project/PROCESS.md`.
- Older session logs: `archive/handover/`.
