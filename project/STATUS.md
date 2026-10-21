# Petrin svet — Status

*Overwrite this file at the end of every session (never append). Budget: 6 KB, checked by `node tools/check_docs.js`.*

**Last updated:** 2026-10-21 · **App version:** 2.4.0 (`game/manifest.json`) · **Repository:** https://github.com/radmanmilos/Games-for-kids

## Where we are

- **Мачја шума (Cat Forest) 2.4.0 shipped** — commit `9a4af99` on `main`, CI run **39491259589** all-green (Fast, smoke, Release QA, Deploy Pages). CF-00…CF-21 (tasks 261–283) all DONE and archived. The reference-app "look & feel" phase is **parked at the user's request** — do not start it; when resumed it must stay art/animation/ambience/polish only (the reference's fishing/crafting/upgrades/ads/IAP/album-counts are excluded by the approved no-economy rules). **CF-22 (real-device play-test of 2.4.0) remains and belongs to the user.**
- **Task 284 DONE (2026-10-21, OpenCode/Big Pickle)** — two user requests fixed in one pass:
  - **racing3d phone-portrait steering.** On a phone held upright the ◀/▶ buttons bunched in the middle (centres 60px apart at 390×844) and sat high. A portrait media query (`orientation: portrait` + `max-width: 519px`) now aligns each zone to a lower band (`top: 40vmin`, `align-items: flex-end`, `padding-bottom: 8vmin`) and drops the task-256 inboard margin (`margin-left/right: 0`, `padding-left/right: 3vmin`): centres **61/329 (268px apart), bottom 813** at 390×844 — lower and wider, fully on screen. Landscape and tablet-portrait (hint-covered) are unchanged. A portrait **geometry assertion** was added to `tools/racing3d_smoke.js` (a click-driven smoke passes with any of this wrong).
  - **fastcat reduced-motion assertion (was the last red leg of `check_release` here).** `tools/fastcat_smoke.js` now pins `prefers-reduced-motion` to `no-preference` (`Emulation.setEmulatedMedia`) before the ⚡ ready check, so it asserts the **product's** loud state on any host instead of inheriting the OS setting (headless Chrome defaults to reduce; this Windows host reports reduce too). The page deliberately drops the pulse/ring under reduced motion (fastcat.html, V21 §39) — hence the pin.
- **Evidence:** `racing3d_smoke` 40/0 · `fastcat_smoke` 67/0 · `check_fast` 8/8 · 4 racing3d review PNGs refreshed (task 284) · `check_release` all-green except a `hub_smoke` `ERR_NO_BUFFER_SPACE` parallel-load flake that **passes isolated**. Log: `tools/.cache/task284-validation.md`.
- **Task 284 landed on `main`:** commit `3fbeb13`, CI run **39563153468** = **success** (Fast, both racing3d jobs, fastcat, sw_update, Release QA, Deploy Pages all green). First attempt had one racing3d job fail on a **pre-existing wall-clock flake** in the `audio bus … backoff gate` check (39/1) — `game/games/racing3d.mjs` was untouched by this task; `gh run rerun --failed` passed. Filed as **task 285 NEW**.
- **Tasks 258–284 archived (2026-10-19/20/21):** UI consistency round 2 (2.3.3) · fastcat malformed-SVG fix (2.3.4) · harness hardening · Cat Forest CF-00…CF-21 · this task 284. Next task number: **285**.
- **Pages gated on CI (task 274):** CI's `pages` job publishes `docs/` only from a green push on `main`.
- **Asset Generation project — active, Phase 1 (inventory/approval).** Test-batch PNGs under `resources/General_reviews/Asset_Generation/`: bone and elephant (approved), **lion (user-accepted)**, **frog (QA pending)**. Nothing integrated at runtime.

## Candidate next work (the user decides; do not start without asking)

1. **CF-22 play-test rounds** on the real tablet (Cat Forest TP §6 protocol; tune only `CF` constants/CSS/data) — the remaining Cat Forest phase.
2. **Task 285** — de-flake the racing3d audio-bus backoff assertion (it reads host wall time; same class as the task-284 fastcat fix).
3. **Cat Forest "look & feel toward Secret Cat Forest"** — **parked by the user** ("we will come back for that later"). No spec until resumed; art/animation/ambience/polish only.
4. **Live play-test of 2.4.0** on a real device (unified nav bubble, bigger triangles, racing3D flowers-only HUD, tracing one-back, repaired fastcat 🌍 icon, the new portrait steering geometry); a force-refresh may be needed for the cached shell.
5. **racing3d tuning** — levers in `game/games/racing3d.mjs` (`bankMax`, `LATERAL_GAIN`, `inRate`/`outRate`, `bobY`, `camPull`/`camRise`).
6. **"Tier A" learning content** from the finished roadmaps in `archive/plans/` (see `project/reference/LEARNING_ROADMAP_REVIEW.md`).

## Validate (details: `AGENTS.md`)

`node tools/check_fast.js` (read-only, ~9 s) → `node tools/run_all.js --game <name>` / `--since HEAD` → `node tools/check_release.js` before a release. Smokes need Chrome (`CHROME_PATH`); racing3d needs WebGL (this host has none, so its WebGL battery is skipped locally and covered by CI). **Host caveats:** the sandbox kills long single runs (use `run_all.js --concurrency 2 --resume` for the battery), and newly created files under `tools/.cache/` and some working-tree writes can be silently lost between shell calls — re-read after writing. This host reports `prefers-reduced-motion: reduce`; **task 284 removed the last assertion that depended on that** (fastcat now pins the media).

## Rules of the road

- `game/` changes ⇒ **`node tools/build_offline.js` FIRST, then** `tools/sync-docs.sh` (the manifest/pages are hashed; the wrong order leaves `docs/offline-manifest.json` stale and `validate_generated` fails), **and refresh the affected review screenshots**. Never edit `docs/` by hand.
- **Cat Forest delivery (D11 amended 2026-10-19):** after each card/bundle is DONE and gates are green, the AI commits and pushes to `main` and verifies CI; never continue on red or dirty. (2.4.0 was handed off uncommitted and then committed at the user's request — `9a4af99`.)
- Before touching a risky area read its lesson file: see the table in `AGENTS.md` (`project/lessons/`).
- Locked decisions: `project/DECISIONS.md`. Process: `project/PROCESS.md`.
- Older session logs: `archive/handover/`.
