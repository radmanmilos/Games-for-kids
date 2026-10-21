# Petrin svet — Status

*Overwrite this file at the end of every session (never append). Budget: 6 KB, checked by `node tools/check_docs.js`.*

**Last updated:** 2026-10-21 · **App version:** 2.4.0 (`game/manifest.json`) · **Repository:** https://github.com/radmanmilos/Games-for-kids

## Where we are

- **Мачја шума (Cat Forest) 2.4.0 shipped** — commit `9a4af99`, CI **39491259589** green. CF-00…CF-21 (tasks 261–283) DONE/archived. The reference-app "look & feel" phase is **parked at the user's request** — do not start it; when resumed it stays art/animation/ambience/polish only (the reference's fishing/crafting/upgrades/ads/IAP/album-counts are excluded by the approved no-economy rules). **CF-22 (real-device play-test of 2.4.0) remains and belongs to the user.**
- **Task 284 DONE (2026-10-21)** — racing3d phone-portrait steering: portrait media query (`orientation: portrait` + `max-width: 519px`) drops the ◀/▶ zones lower and wider (centres **61/329**, 268 px apart, bottom 813 at 390×844) and drops the task-256 inboard margin; landscape/tablet unchanged; asserted in `tools/racing3d_smoke.js`. Plus the fastcat reduced-motion pin (start of the host-dependency sweep). Commit `3fbeb13`.
- **Task 285 DONE (2026-10-21)** — swept the "assert the host" smoke class: **racing3d** audio bus got a test-only `setClock(t)` hook over `curTime` (racing3d.mjs:1495) and a pinned timeline instead of `4 × sleep(55)`; **rhythm** completion cue now pins `no-preference` (must be `drumCheer`) then `reduce` (must drop to `none`) instead of reading the host pref through an escape hatch; **animals** pins the media before its `animationName` read. Every guard negative-tested. Log: `tools/.cache/task285-validation.md`.
- **Task 286 DONE (2026-10-21, OpenCode/Big Pickle)** — de-flaked smoke boot races that only showed under parallel load (the last recurring CI/local noise). Boot-readiness loops polled `typeof window.startX === 'function' && !!document.getElementById(…)`, true **before** the game renders (static element + script-loaded function), so the next assertion read pre-render state. Seven smokes now wait on the render artifact their own assertion reads: **animals** (+non-empty name), **fastcat** (+`char-modal.show`), **piano** (+8 keys), **shapes** (+2 slots/pieces), **classroom** (+6/4 buttons), **counting** (+tiles); **sw_update** (different shape — a 10 s SW-control wait too short under load; raised to 30 s). Readiness waits only, no assertion loosened. Evidence: 6 tools isolated 221/0 · **full battery at default concurrency = ALL 36 TOOLS PASS (1306 checks)**, the run that failed before · `check_fast` 8/8. Follow-up audit: no other HIGH weak predicate. Log: `tools/.cache/task286-validation.md`.
- **Archived through task 286 (2026-10-19/20/21):** UI consistency round 2 · fastcat SVG fix · harness hardening · Cat Forest CF-00…CF-21 · task 284 (racing3d portrait + fastcat pin) · task 285 (host-dependency sweep) · task 286 (boot-race sweep). Next task number: **287**.
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

`node tools/check_fast.js` (read-only, ~9 s) → `node tools/run_all.js --game <name>` / `--since HEAD` → `node tools/check_release.js` before a release. Smokes need Chrome (`CHROME_PATH`); racing3d needs WebGL (this host has none, so its WebGL battery is skipped locally and covered by CI). **Host caveats:** the sandbox kills long single runs (use `run_all.js --concurrency 2 --resume`), and writes under `tools/.cache/`/the tree can be silently lost between shell calls — re-read after writing. This host reports `prefers-reduced-motion: reduce`; **tasks 284–286 removed every assertion that depended on that or on host timing** (fastcat/animals/rhythm pin the media; racing3d pins its clock via `setClock`; seven smokes now wait on a render artifact, not script load).

## Rules of the road

- `game/` changes ⇒ **`node tools/build_offline.js` FIRST, then** `tools/sync-docs.sh` (the manifest/pages are hashed; the wrong order leaves `docs/offline-manifest.json` stale and `validate_generated` fails), **and refresh the affected review screenshots**. Never edit `docs/` by hand.
- **Cat Forest delivery (D11 amended 2026-10-19):** after each card/bundle is DONE and gates are green, the AI commits and pushes to `main` and verifies CI; never continue on red or dirty. (2.4.0 was handed off uncommitted and then committed at the user's request — `9a4af99`.)
- Before touching a risky area read its lesson file: see the table in `AGENTS.md` (`project/lessons/`).
- Locked decisions: `project/DECISIONS.md`. Process: `project/PROCESS.md`.
- Older session logs: `archive/handover/`.
