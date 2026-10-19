# Petrin svet — Status

*Overwrite this file at the end of every session (never append). Budget: 6 KB, checked by `node tools/check_docs.js`.*

**Last updated:** 2026-10-19 · **App version:** 2.3.4 (`game/manifest.json`)
**Repository:** https://github.com/radmanmilos/Games-for-kids

## Where we are

- **No open task.** The next task number is **261** (tasks 258-260 archived 2026-10-19).
- **Task 260 — DONE (2026-10-19, OpenCode/Big Pickle):** harness hardening, closing the blind spot task 259 exposed. `tools/headless.js` now sends `Log.enable` and records `Log.entryAdded` at level `error` (kind `log.<source>`, e.g. `log.rendering`; `source === 'network'` skipped — request failures already flow through `addResourceError`). That is the domain carrying **rendering/parser** errors (a malformed SVG `d` path logs there, never in Runtime), so the fastcat defect class is now caught by **every smoke and the screenshot tool on every push**, not only by the weekly Extended matrix. Proven by a negative test: re-introducing the bad path from a staged copy makes the capture FAIL (`log.rendering | <path> attribute d: Expected number`); restored from the copy and hash-verified. An all-pages sweep found **zero** new `log.*` errors (no false positives), and the full battery's failure set is unchanged (3/35, all racing3d WebGL). Docs: `tools/README.md`, `project/reference/tools-detail.md`, new Trap in `project/lessons/testing-harness.md`. No version bump (tools-only) and no screenshot refresh (no screen changed).
- **Task 259 — DONE (2026-10-19, OpenCode/Big Pickle):** fixed a pre-existing malformed SVG path in `game/pages/fastcat.html` (2.3.4, `912d21a`): the «Играј поново» icon read `s3.58 8 8c3.73` instead of the canonical `s3.58 8 8 8c3.73` (one `8` lost), so both engines rejected it and the icon was broken on WebKit (**iPad/Safari**). Found by the *scheduled* Extended matrix (250 passed / 10 failed, all fastcat); that job runs only on `schedule`/`workflow_dispatch`, and `runtime_error_smoke` misses it because headless.js collects only `Runtime.consoleAPICalled` while Chrome reports SVG parse errors via `Log.entryAdded` (play_matrix's Playwright `page.on('console')` collects both). Validation: `check_fast` 8/8, `fastcat_smoke` 67/0, **Extended matrix re-run via workflow_dispatch = success** — the pipeline is green again. Full detail in `archive/tasks/`.
- **Task 258 — DONE (2026-10-19, OpenCode/Big Pickle):** UI consistency round 2, 2.3.3 (`60947ad`), the user's 5 play-test items: (1) ONE corner nav bubble app-wide — `--ps-nav-size: clamp(56px, 9vmin, 84px)` on both `.ps-back` and the in-game next controls (`#coloring-next`, `#tracingNext`, `#animalNext`+`#animalSpeak`, `#countNext`, `#puzzleNext`; puzzle's private yellow bubble deleted), so back and next match everywhere; (2) the `.ps-btn--control .ps-tri` triangle sized as 44% of its bubble (was `.58em`), ~21% → ~36-41%; (3) racing3D's «Поени» pill removed (markup/CSS/`scoreEl`/win-modal) — the 🌸 n/12 counter is the only readout, flower pill + minimap moved up; (4) tracing's duplicate panel back removed, the header back state-aware (activity → hub → index, `backTaps: 2`); docs synced, offline inventory rebuilt, 104 review shots refreshed. Gates: `check_fast` 8/8, battery 32/35 (the 3 = local WebGL only; CI green).
- **Tasks 255-258 (2.3.0-2.3.3)** are archived; detail in `archive/tasks/` and in the previous STATUS revisions.
- **Asset Generation project — active, Phase 1 (inventory/approval).** Test-batch PNGs under `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/`: bone and elephant (approved), **lion (user-accepted)** and **frog (candidate, technical QA pending)**. Nothing integrated at runtime.

## Candidate next work (the user decides; do not start without asking)

1. **Live play-test of 2.3.4** on a real device (the unified nav bubble, bigger triangles, racing3D flowers-only HUD, tracing one-back, and now the repaired fastcat «Играј поново» icon). Force-refresh may be needed for the cached shell.
2. **racing3d tuning** — levers in `game/games/racing3d.mjs` (`bankMax`, `LATERAL_GAIN`, `inRate`/`outRate`, `bobY`, `camPull`/`camRise`).
3. **"Tier A" learning content** from the finished roadmaps in `archive/plans/` (see `project/reference/LEARNING_ROADMAP_REVIEW.md`).
4. **(Optional)** a small guard for the `Log.entryAdded` handler itself — `guards/boot_enable_negtest.js` already pins `Log.enable`'s place in the boot block, but nothing proves the handler still records an entry if someone edits it (the negative test for it lives only in this task's scratch log).

## Validate (details: `AGENTS.md`)

`node tools/check_fast.js` (read-only, ~9 s) → `node tools/run_all.js --game <name>` / `--since HEAD` → `node tools/check_release.js` before a release. Smokes need Chrome (`CHROME_PATH`); racing3d needs WebGL (this host has none, so its WebGL battery is skipped locally and covered by CI). **Host caveats:** the sandbox kills long single runs (use `run_all.js --concurrency 2 --resume` for the battery), and newly created files under `tools/.cache/` and some working-tree writes can be silently lost between shell calls — re-read after writing.

## Rules of the road

- `game/` changes ⇒ run `tools/sync-docs.sh` **and** `node tools/build_offline.js` when assets/pages change (the offline inventory hashes real bytes), **bump `game/manifest.json`** (A.B.C, deliberately NOT semver: C = minor, B = major, A = overhaul) **and refresh the affected review screenshots** (`AGENTS.md`). Never edit `docs/` by hand.
- Never commit or push to `main` unless the user says so for this task.
- Before touching a risky area read its lesson file: see the table in `AGENTS.md` (`project/lessons/`).
- Locked decisions: `project/DECISIONS.md`. Process: `project/PROCESS.md`.
- Older session logs: `archive/handover/`.
