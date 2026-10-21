# Petrin svet — Status

*Overwrite this file at the end of every session (never append). Budget: 6 KB, checked by `node tools/check_docs.js`.*

**Last updated:** 2026-10-21 · **App version:** 2.4.0 (`game/manifest.json`) · **Repository:** https://github.com/radmanmilos/Games-for-kids

## Where we are

- **Мачја шума (Cat Forest) 2.4.0 shipped** — commit `9a4af99`, CI **39491259589** green. CF-00…CF-21 (tasks 261–283) DONE/archived. The reference-app "look & feel" phase is **parked at the user's request** — do not start it; when resumed it stays art/animation/ambience/polish only (the reference's fishing/crafting/upgrades/ads/IAP/album-counts are excluded by the approved no-economy rules). **CF-22 (real-device play-test of 2.4.0) remains and belongs to the user.**
- **Task 284 DONE (2026-10-21, OpenCode/Big Pickle)** — one pass, two fixes:
  - **racing3d phone-portrait steering.** The ◀/▶ buttons bunched mid-screen (centres 60px apart at 390×844) and sat high. A portrait media query (`orientation: portrait` + `max-width: 519px`) puts each zone in a lower band (`top: 40vmin`, `align-items: flex-end`, `padding-bottom: 8vmin`) and drops the task-256 inboard margin: centres **61/329 (268px apart), bottom 813** at 390×844. Landscape and tablet-portrait unchanged. Asserted in `tools/racing3d_smoke.js`. Commit `3fbeb13`, CI **39563153468** green.
  - **fastcat reduced-motion assertion.** `tools/fastcat_smoke.js` pins `prefers-reduced-motion: no-preference` before the ⚡ ready check (headless Chrome defaults to reduce; this host reports reduce) so it asserts the **product's** loud state on any host.
- **Task 285 DONE (2026-10-21, OpenCode/Big Pickle)** — sweep of the host-dependent smoke class behind 284's fastcat fix; four sites now prove the **product's** rule on any host:
  - **racing3d audio bus** (`tools/racing3d_smoke.js` batches 9+10): new test-only `setClock(t)` hook over `curTime` (`racing3d.mjs:1495`; `setClock(null)` restores the wall clock); `4 × sleep(55)` replaced with a pinned timeline, so the 40 ms drain gate and 600 ms backoff assert a controlled `now`.
  - **rhythm completion cue** (`tools/rhythm_smoke.js`): old check passed on `anim === 'drumCheer' || rm` (host pref) — a broken cheer rule could hide. Now pins `no-preference` (must be `drumCheer`) then `reduce` (must drop to `none`), both load-bearing.
  - **animals flashcard idle** (`tools/animals_smoke.js`): pins `no-preference` before the `animationName` read.
  - Evidence: racing3d 40/0 · fastcat 67/0 · rhythm 30/0 · animals 36/0 · `check_fast` 8/8 · `check_release` **green** at `--concurrency 2`. Every guard negative-tested (mutate, restore from copy): backoff disabled → FAIL; gate never reopens → FAIL; reduce-rule removed → FAIL (the case the old assertion passed). Log: `tools/.cache/task285-validation.md`. No screen change ⇒ no screenshot refresh.
- **Archived through task 285 (2026-10-19/20/21):** UI consistency round 2 · fastcat SVG fix · harness hardening · Cat Forest CF-00…CF-21 · task 284 (racing3d portrait + fastcat pin) · task 285 (host-dependency sweep). Next task number: **286**.
- **Pages gated on CI (task 274):** CI's `pages` job publishes `docs/` only from a green push on `main`.
- **Asset Generation project — active, Phase 1 (inventory/approval).** Test-batch PNGs under `resources/General_reviews/Asset_Generation/`: bone and elephant (approved), **lion (user-accepted)**, **frog (QA pending)**. Nothing at runtime.

## Candidate next work (the user decides; do not start without asking)

1. **CF-22 play-test rounds** on the real tablet (Cat Forest TP §6 protocol; tune only `CF` constants/CSS/data) — the remaining Cat Forest phase.
2. **"Tier A" learning content** from the finished roadmaps in `archive/plans/` (see `project/reference/LEARNING_ROADMAP_REVIEW.md`).
3. **Cat Forest "look & feel toward Secret Cat Forest"** — **parked by the user** ("we will come back for that later"). No spec until resumed; art/animation/ambience/polish only.
4. **Live play-test of 2.4.0** on a real device (unified nav bubble, bigger triangles, racing3D flowers-only HUD, tracing one-back, repaired fastcat 🌍 icon, new portrait steering geometry); force-refresh may be needed for the cached shell.
5. **racing3d tuning** — levers in `game/games/racing3d.mjs` (`bankMax`, `LATERAL_GAIN`, `inRate`/`outRate`, `bobY`, `camPull`/`camRise`).
6. **Optional deeper gates if ever needed:** `tools/play_matrix.mjs` (chromium+webkit viewports), `tools/axe_check.js` (axe-core).

## Validate (details: `AGENTS.md`)

`node tools/check_fast.js` (read-only, ~9 s) → `node tools/run_all.js --game <name>` / `--since HEAD` → `node tools/check_release.js` before a release. Smokes need Chrome (`CHROME_PATH`); racing3d needs WebGL (this host has none, so its WebGL battery is skipped locally and covered by CI). **Host caveats:** the sandbox kills long single runs (use `run_all.js --concurrency 2 --resume`), and writes under `tools/.cache/`/the tree can be silently lost between shell calls — re-read after writing. This host reports `prefers-reduced-motion: reduce`; **tasks 284–285 removed every assertion that depended on that** (fastcat/animals/rhythm pin the media; racing3d pins its clock via `setClock`).

## Rules of the road

- `game/` changes ⇒ **`node tools/build_offline.js` FIRST, then** `tools/sync-docs.sh` (the manifest/pages are hashed; the wrong order leaves `docs/offline-manifest.json` stale and `validate_generated` fails), **and refresh the affected review screenshots**. Never edit `docs/` by hand.
- **Cat Forest delivery (D11 amended 2026-10-19):** after each card/bundle is DONE and gates are green, the AI commits and pushes to `main` and verifies CI; never continue on red or dirty. (2.4.0 was handed off uncommitted and then committed at the user's request — `9a4af99`.)
- Before touching a risky area read its lesson file: see the table in `AGENTS.md` (`project/lessons/`).
- Locked decisions: `project/DECISIONS.md`. Process: `project/PROCESS.md`.
- Older session logs: `archive/handover/`.
