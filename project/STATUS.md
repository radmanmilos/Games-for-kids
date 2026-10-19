# Petrin svet — Status

*Overwrite this file at the end of every session (never append). Budget: 6 KB, checked by `node tools/check_docs.js`.*

**Last updated:** 2026-10-19 · **App version:** 2.3.2 (`game/manifest.json`)
**Repository:** https://github.com/radmanmilos/Games-for-kids

## Where we are

- **No open task.** The next task number is **258** (tasks 256 and 257 archived 2026-10-19).
- **Task 257 — DONE (2026-10-19):** the coloring „Следеће" control stopped wearing the back-button chrome. `#coloring-next` was the last `.back-btn ps-back` control, so the header showed two identical round sky buttons (a child could not tell advance from back). It now uses the app's existing next-control family (`.ps-btn ps-btn--icon`, the green primary bubble `tracingNext`/`animalNext` already use) at the back bubble's corner, footprint and glyph weight. Probe-measured: both 96×96, 50% radius, 48px glyph, 32px from their edge; back **sky** `rgb(79,195,247)` vs next **green** `rgb(103,201,113)`; tapping it advances the picture. `coloring_smoke` ALL PASS (V2.5/V14 are geometry-only). Coloring review screenshots refreshed.
- **Task 256 — DONE (2026-10-19):** post-release fixes after 2.3.0, shipped across three pushes (`3b6a099`, `b1339df`, `1a5111f`).
  - **Puzzle regression (2.3.1):** `.ps-btn{display:inline-flex}` is a class rule, so it beat the UA `[hidden]{display:none}`; `animal_puzzle`'s start card stayed in the layout and pushed `#puzzleBoard` to y=635, off an 800px viewport, so the piece never snapped home („Слагалице" was unplayable). Fixed at the root in `game/styles/components.css` with `.ps-btn[hidden], .ps-back[hidden]{display:none}`, plus two negative-tested guards in `tools/puzzle_smoke.js`. Only the offline E2E had caught it.
  - **One back button per screen + racing3D steering:** classroom had three back controls (header + plum pill + plum quiz button); only the header one remains and it goes one screen up per tap (activity → classroom hub → app hub) via a capture-phase listener that pre-empts main.js only while an inner screen is open; `#kidsExit`/`kidsGame.exit` call the new `window.classroomLeaveKids`. Removed the private `.back-btn:active{scale(.92)}` press override on compare/phonics/rhythm/sequencing/sorting. `tools/offline_smoke.mjs` gained `backTaps` (classroom = 2). racing3D steering is `min(165px,25.5vmin)` (1.5× the shared control) and one control width in from the edge; `racing3d_smoke`'s old "pushed to the edges" assertion was replaced with the new geometry.
  - **Closed question:** the classroom finished-card „Назад" already goes exactly one level up (quiz → classroom hub); no change was needed.
- **Task 256/257 validation:** `check_fast` 8/8 each time; classroom/compare/phonics/rhythm/sequencing/sorting/puzzle/coloring smokes green; `short_landscape_audit` 0 FAIL; a headless probe measured 24/25 pages on one identical back signature; racing3d geometry probe 99px @844×390 and 165px @1280×800 & 1100×700. CI: `3b6a099` = run 39209880038 **success** (incl. Release QA), `b1339df` = run 39218395770 **success** (incl. racing3d_smoke with the new assertion and Release QA), `1a5111f` = run 39222236251 (in progress when this was written).
- **Version note:** the `2.3.1 → 2.3.2` manifest bump written during task 256 silently failed to reach disk, so `b1339df` shipped with the manifest still at 2.3.1; `1a5111f` applied 2.3.2 for real.
- **Task 255 — DONE (2026-10-19):** unified bubble button system for the whole app (2.3.0). Detail in `archive/tasks/`.
- **Asset Generation project — active, Phase 1 (inventory/approval).** Test-batch PNGs are committed under `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/`: bone and elephant (approved candidates), **lion (user-accepted candidate)** and **frog (candidate, technical QA pending)**. Nothing integrated at runtime. Outstanding: technical QA, style comparison, then user approval of the inventory.

## Candidate next work (the user decides; do not start without asking)

1. **Live play-test of 2.3.2** on a real device (puzzle fix + one back button + racing3D steering + the green „Следеће"). Note the site may need a force-refresh: the manifest version only just reached 2.3.2, so a device that ran 2.3.1 earlier may hold a cached shell.
2. **Check the coloring look on a device** — the „Следеће" bubble is now green (primary) at the back bubble's footprint; if the user wants it larger/smaller or a different tint, that is a one-line change.
3. **racing3d tuning** — levers in `game/games/racing3d.mjs` (`bankMax`, `LATERAL_GAIN`, `inRate`/`outRate`, `bobY`, `camPull`/`camRise`).
4. **"Tier A" learning content** from the finished roadmaps in `archive/plans/` (see `project/reference/LEARNING_ROADMAP_REVIEW.md`).

## Validate (details: `AGENTS.md`)

`node tools/check_fast.js` (read-only, ~9 s) → `node tools/run_all.js --game <name>` / `--since HEAD` → `node tools/check_release.js` before a release. Smokes need Chrome (`CHROME_PATH`); racing3d needs WebGL. **Host caveat:** newly created files under `tools/.cache/` and some working-tree writes can be silently lost between shell calls on this host — always re-read a file after writing it, and keep durable notes in tracked files.

## Rules of the road

- `game/` changes ⇒ run `tools/sync-docs.sh` **and** `node tools/build_offline.js` when assets/pages change (the offline inventory hashes real bytes), **bump `game/manifest.json`** (A.B.C, deliberately NOT semver: C = minor, B = major, A = overhaul) **and refresh the affected review screenshots** (`AGENTS.md`). Never edit `docs/` by hand.
- Never commit or push to `main` unless the user says so for this task.
- Before touching a risky area read its lesson file: see the table in `AGENTS.md` (`project/lessons/`).
- Locked decisions: `project/DECISIONS.md`. Process: `project/PROCESS.md`.
- Older session logs: `archive/handover/`.
