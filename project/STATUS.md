# Petrin svet — Status

*Overwrite this file at the end of every session (never append). Budget: 6 KB, checked by `node tools/check_docs.js`.*

**Last updated:** 2026-10-19 · **App version:** 2.3.4 (`game/manifest.json`)
**Repository:** https://github.com/radmanmilos/Games-for-kids

## Where we are

- **No open task.** The next task number is **260** (tasks 258 and 259 archived 2026-10-19).
- **Task 259 — DONE (2026-10-19, OpenCode/Big Pickle):** fixed a pre-existing malformed SVG path in `game/pages/fastcat.html` (2.3.4, `912d21a`): the «Играј поново» icon read `s3.58 8 8c3.73` instead of the canonical `s3.58 8 8 8c3.73` (one `8` lost), so both engines rejected it and the icon was broken on WebKit (**iPad/Safari**). Found by the *scheduled* Extended matrix (250 passed / 10 failed, all fastcat); that job runs only on `schedule`/`workflow_dispatch`, and `runtime_error_smoke` misses it because headless.js collects only `Runtime.consoleAPICalled` while Chrome reports SVG parse errors via `Log.entryAdded` (play_matrix's Playwright `page.on('console')` collects both). Validation: `check_fast` 8/8, `fastcat_smoke` 67/0, **Extended matrix re-run via workflow_dispatch = success** — the pipeline is green again. Full detail in `archive/tasks/`.
- **Task 258 — DONE (2026-10-19, OpenCode/Big Pickle):** UI consistency round 2, shipped as 2.3.3 (`60947ad`). The user's 5 play-test items:
  - **One corner navigation bubble app-wide.** New `--ps-nav-size: clamp(var(--touch-comfort,56px), 9vmin, 84px)`; `.ps-back` now takes `--ps-back-size: var(--ps-nav-size)` (the oversized `max(12vmin,44px)` bubble is retired — class name kept, so the 27 adopted pages and the hub/parent smokes keep their contract), and the in-game next controls `#coloring-next`, `#tracingNext`, `#animalNext` (+`#animalSpeak`, so the pair stays matched), `#countNext`, `#puzzleNext` (its private yellow bubble deleted) move onto the shared `.ps-btn--nav`. Back and next are now the same size on every page (56px phone-land, ~74px tablet-land).
  - **Bigger direction triangles.** `.ps-btn--control .ps-tri` is sized as a fraction of the bubble (44%) instead of `.58em` of a 40px font: ~21% → ~36-41% of the button (explorer, fastcat, dino, driving, ocean, space, racing3D; 23.9px → 43.1px on tablet).
  - **racing3D «Поени» gone.** `#r3d-score` removed from markup, CSS and the `scoreEl` writes; the win modal no longer prefixes the score. The icon counter (🌸 n/12) is the single progress readout; the flower pill moved into the freed top slot and the minimap with it (62px; the short-landscape override stays 106px).
  - **tracing: one back button.** The activity panel's second back (`#tracingBack`) is removed; the single header `#tracing-back` is state-aware (activity → tracing hub → index) via a capture-phase listener, the classroom rule. `tools/offline_smoke.mjs` declares `backTaps: 2` for tracing.
  - Version 2.3.3 (C = minor), `docs/` re-synced, offline manifest rebuilt, 104 review screenshots refreshed (provenance tagged 258).
- **Task 258 validation:** `check_fast` 8/8; full battery 32/35 tools green (1054 checks). The 3 non-zero tools (`runtime_error_smoke` 2 fail, `touch_interruption_d` 1 fail, `racing3d_smoke` exit 0) fail ONLY on racing3D's THREE WebGL `console.error`; a pristine-HEAD worktree (cfd41d5) fails `runtime_error_smoke` identically, so it is this host's missing WebGL (headless.js hardcodes `--disable-gpu`), **not** a regression — CI's runner passes all 35 jobs. `offline_smoke` P6 tracing back reaches the hub with `backTaps: 2`.
- **Tasks 255-258 (2.3.0-2.3.3)** are archived; detail in `archive/tasks/` and in the previous STATUS revisions.
- **Asset Generation project — active, Phase 1 (inventory/approval).** Test-batch PNGs under `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/`: bone and elephant (approved), **lion (user-accepted)** and **frog (candidate, technical QA pending)**. Nothing integrated at runtime.

## Candidate next work (the user decides; do not start without asking)

1. **Live play-test of 2.3.4** on a real device (the unified nav bubble, bigger triangles, racing3D flowers-only HUD, tracing one-back, and now the repaired fastcat «Играј поново» icon). Force-refresh may be needed for the cached shell.
2. **racing3d tuning** — levers in `game/games/racing3d.mjs` (`bankMax`, `LATERAL_GAIN`, `inRate`/`outRate`, `bobY`, `camPull`/`camRise`).
3. **"Tier A" learning content** from the finished roadmaps in `archive/plans/` (see `project/reference/LEARNING_ROADMAP_REVIEW.md`).
4. **(Optional harness gap, if it recurs)** `runtime_error_smoke` and the screenshot tool could also collect `Log.entryAdded`, not just `Runtime.consoleAPICalled`, so SVG/rendering errors surface on every push instead of only in the weekly Extended matrix.

## Validate (details: `AGENTS.md`)

`node tools/check_fast.js` (read-only, ~9 s) → `node tools/run_all.js --game <name>` / `--since HEAD` → `node tools/check_release.js` before a release. Smokes need Chrome (`CHROME_PATH`); racing3d needs WebGL (this host has none, so its WebGL battery is skipped locally and covered by CI). **Host caveats:** the sandbox kills long single runs (use `run_all.js --concurrency 2 --resume` for the battery), and newly created files under `tools/.cache/` and some working-tree writes can be silently lost between shell calls — re-read after writing.

## Rules of the road

- `game/` changes ⇒ run `tools/sync-docs.sh` **and** `node tools/build_offline.js` when assets/pages change (the offline inventory hashes real bytes), **bump `game/manifest.json`** (A.B.C, deliberately NOT semver: C = minor, B = major, A = overhaul) **and refresh the affected review screenshots** (`AGENTS.md`). Never edit `docs/` by hand.
- Never commit or push to `main` unless the user says so for this task.
- Before touching a risky area read its lesson file: see the table in `AGENTS.md` (`project/lessons/`).
- Locked decisions: `project/DECISIONS.md`. Process: `project/PROCESS.md`.
- Older session logs: `archive/handover/`.
