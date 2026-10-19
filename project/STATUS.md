# Petrin svet — Status

*Overwrite this file at the end of every session (never append). Budget: 6 KB, checked by `node tools/check_docs.js`.*

**Last updated:** 2026-10-19 · **App version:** 2.3.3 (`game/manifest.json`)
**Repository:** https://github.com/radmanmilos/Games-for-kids

## Where we are

- **No open task.** The next task number is **259** (task 258 archived 2026-10-19).
- **Task 258 — DONE (2026-10-19, OpenCode/Big Pickle):** UI consistency round 2, shipped as 2.3.3 (`60947ad`). The user's 5 play-test items:
  - **One corner navigation bubble app-wide.** New `--ps-nav-size: clamp(var(--touch-comfort,56px), 9vmin, 84px)`; `.ps-back` now takes `--ps-back-size: var(--ps-nav-size)` (the oversized `max(12vmin,44px)` bubble is retired — class name kept, so the 27 adopted pages and the hub/parent smokes keep their contract), and the in-game next controls `#coloring-next`, `#tracingNext`, `#animalNext` (+`#animalSpeak`, so the pair stays matched), `#countNext`, `#puzzleNext` (its private yellow bubble deleted) move onto the shared `.ps-btn--nav`. Back and next are now the same size on every page (56px phone-land, ~74px tablet-land).
  - **Bigger direction triangles.** `.ps-btn--control .ps-tri` is sized as a fraction of the bubble (44%) instead of `.58em` of a 40px font: ~21% → ~36-41% of the button (explorer, fastcat, dino, driving, ocean, space, racing3D; 23.9px → 43.1px on tablet).
  - **racing3D «Поени» gone.** `#r3d-score` removed from markup, CSS and the `scoreEl` writes; the win modal no longer prefixes the score. The icon counter (🌸 n/12) is the single progress readout; the flower pill moved into the freed top slot and the minimap with it (62px; the short-landscape override stays 106px).
  - **tracing: one back button.** The activity panel's second back (`#tracingBack`) is removed; the single header `#tracing-back` is state-aware (activity → tracing hub → index) via a capture-phase listener, the classroom rule. `tools/offline_smoke.mjs` declares `backTaps: 2` for tracing.
  - Version 2.3.3 (C = minor), `docs/` re-synced, offline manifest rebuilt, 104 review screenshots refreshed (provenance tagged 258).
- **Task 258 validation:** `check_fast` 8/8; full battery 32/35 tools green (1054 checks). The 3 non-zero tools (`runtime_error_smoke` 2 fail, `touch_interruption_d` 1 fail, `racing3d_smoke` exit 0) fail ONLY on racing3D's THREE WebGL `console.error`; a pristine-HEAD worktree (cfd41d5) fails `runtime_error_smoke` identically, so it is this host's missing WebGL (headless.js hardcodes `--disable-gpu`), **not** a regression — CI's runner passes all 35 jobs. `offline_smoke` P6 tracing back reaches the hub with `backTaps: 2`.
- **⚠ Pre-existing red pipeline (NOT from 258):** the **scheduled** CI run `39241320600` (on `cfd41d5`) failed its `Extended (Chromium + WebKit device matrix)` job: 250 passed / 10 failed — all 10 are `pages/fastcat.html` (5 viewports × chromium+webkit) with `<path> attribute d: Expected number` / WebKit `Problem parsing d="M17.65 6.35…"`. Cause: `game/pages/fastcat.html` has a malformed Material "refresh" path — `s3.58 8 8c3.73` (a smooth-cubic `s` given 3 numbers) instead of the canonical `s3.58 8 8 8c3.73`; one missing `8`. It breaks the icon in both engines; **WebKit = iPad/Safari**, i.e. this project's main target. The Extended job runs only on `schedule`/`workflow_dispatch`, so pushes are unaffected. **Proposed fix (awaiting the user):** add the missing `8` in `game/pages/fastcat.html` (+ `docs/` mirror via sync-docs), task 259.
- **Tasks 255-257 (2.3.0-2.3.2)** are archived; detail in `archive/tasks/` and in the previous STATUS revisions.
- **Asset Generation project — active, Phase 1 (inventory/approval).** Test-batch PNGs under `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/`: bone and elephant (approved), **lion (user-accepted)** and **frog (candidate, technical QA pending)**. Nothing integrated at runtime.

## Candidate next work (the user decides; do not start without asking)

1. **Fix the fastcat SVG path** (task 259, above) — a 1-character fix that turns the Extended matrix green and repairs the icon on iPads.
2. **Live play-test of 2.3.3** on a real device (the unified nav bubble, bigger triangles, racing3D flowers-only HUD, tracing one-back). Force-refresh may be needed for the cached shell.
3. **racing3d tuning** — levers in `game/games/racing3d.mjs` (`bankMax`, `LATERAL_GAIN`, `inRate`/`outRate`, `bobY`, `camPull`/`camRise`).
4. **"Tier A" learning content** from the finished roadmaps in `archive/plans/` (see `project/reference/LEARNING_ROADMAP_REVIEW.md`).

## Validate (details: `AGENTS.md`)

`node tools/check_fast.js` (read-only, ~9 s) → `node tools/run_all.js --game <name>` / `--since HEAD` → `node tools/check_release.js` before a release. Smokes need Chrome (`CHROME_PATH`); racing3d needs WebGL (this host has none, so its WebGL battery is skipped locally and covered by CI). **Host caveats:** the sandbox kills long single runs (use `run_all.js --concurrency 2 --resume` for the battery), and newly created files under `tools/.cache/` and some working-tree writes can be silently lost between shell calls — re-read after writing.

## Rules of the road

- `game/` changes ⇒ run `tools/sync-docs.sh` **and** `node tools/build_offline.js` when assets/pages change (the offline inventory hashes real bytes), **bump `game/manifest.json`** (A.B.C, deliberately NOT semver: C = minor, B = major, A = overhaul) **and refresh the affected review screenshots** (`AGENTS.md`). Never edit `docs/` by hand.
- Never commit or push to `main` unless the user says so for this task.
- Before touching a risky area read its lesson file: see the table in `AGENTS.md` (`project/lessons/`).
- Locked decisions: `project/DECISIONS.md`. Process: `project/PROCESS.md`.
- Older session logs: `archive/handover/`.
