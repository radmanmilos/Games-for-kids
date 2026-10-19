# Petrin svet — Status

*Overwrite this file at the end of every session (never append). Budget: 6 KB, checked by `node tools/check_docs.js`.*

**Last updated:** 2026-10-19 · **App version:** 2.3.2 (`game/manifest.json`)
**Repository:** https://github.com/radmanmilos/Games-for-kids

## Where we are

- **No open task.** The next task number is **257** (task 256 archived 2026-10-19).
- **Task 256 — DONE (2026-10-19):** post-release fixes after 2.3.0, shipped as two pushes.
  - **2.3.1** (`3b6a099`) — real regression from 2.3.0: `.ps-btn{display:inline-flex}` is a class rule, so it beat the UA `[hidden]{display:none}`; `animal_puzzle`'s start card stayed in the layout and pushed `#puzzleBoard` to y=635, off an 800px viewport, so the piece never snapped home („Слагалице" was unplayable). Fixed at the root with `.ps-btn[hidden], .ps-back[hidden]{display:none}` in `game/styles/components.css`, plus two negative-tested guards in `tools/puzzle_smoke.js` (start card leaves the layout; board fully on-screen). Caught only by the offline E2E (all 60 smoke jobs had passed).
  - **2.3.2** (`b1339df`) — **one back button per screen**: classroom had three (header `.ps-back` + plum `#classroomBack` pill + plum `#kidsBack`); only the header button remains and it now goes one screen up per tap (activity → classroom hub → app hub) via a capture-phase listener that pre-empts main.js only while an inner screen is open; `#kidsExit`/`kidsGame.exit` call the new `window.classroomLeaveKids`. Removed the private `.back-btn:active{scale(.92)}` press override on compare/phonics/rhythm/sequencing/sorting so every back button presses like the component. `tools/offline_smoke.mjs` gained `backTaps` (classroom = 2). **racing3D steering** (user: "50% larger and closer by their width to the middle"): `.r3d-zone .r3d-btn` is `min(165px,25.5vmin)` (1.5× the shared control), `flex:0 0 auto`, and margin equal to its own width; `racing3d_smoke`'s old "pushed to the edges" assertion was replaced with the new geometry.
- **Task 256 validation:** `check_fast` 8/8; classroom/compare/phonics/rhythm/sequencing/sorting/puzzle smokes green (incl. the new "one screen up" assertion); `short_landscape_audit` 0 FAIL; headless probe measured 24/25 pages on one identical back signature; racing3d geometry probe 99px @844×390 / 165px @1280×800 & 1100×700; the classroom step of the real offline E2E passed locally (P1/P4/P5/P6). CI for `3b6a099` = **run 39209880038 success**, including `Release QA (offline E2E, a11y report)`. CI for `b1339df` = **run 39218395770** (in progress when this was written). Review screenshots refreshed for racing3d (the only captured page whose pixels change).
- **Task 255 — DONE (2026-10-19):** unified bubble button system for the whole app (2.3.0). Detail in `archive/tasks/`.
- **Asset Generation project — active, Phase 1 (inventory/approval).** Test-batch PNGs are committed under `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/`: bone and elephant (approved candidates), **lion (user-accepted candidate)** and **frog (candidate, technical QA pending)**. Nothing integrated at runtime. Outstanding: technical QA, style comparison, then user approval of the inventory.

## Candidate next work (the user decides; do not start without asking)

1. **Live play-test of 2.3.2** on a real device (puzzle fix + one back button + racing3d steering).
2. **Two open back-button questions from task 256:** (a) `#coloring-next` is a right-anchored "next" control wearing the same `.ps-back` chrome — leave it or restyle? (b) the classroom finished-card „Назад" (`#kidsExit`, owned by `game/games/kids_games.js`) still leaves the whole room — keep as a completion-card action, or route it one screen up?
3. **racing3d tuning** — levers in `game/games/racing3d.mjs` (`bankMax`, `LATERAL_GAIN`, `inRate`/`outRate`, `bobY`, `camPull`/`camRise`).
4. **"Tier A" learning content** from the finished roadmaps in `archive/plans/` (see `project/reference/LEARNING_ROADMAP_REVIEW.md`).

## Validate (details: `AGENTS.md`)

`node tools/check_fast.js` (read-only, ~9 s) → `node tools/run_all.js --game <name>` / `--since HEAD` → `node tools/check_release.js` before a release. Smokes need Chrome (`CHROME_PATH`); racing3d needs WebGL. After a restart, read `tools/.cache/task<N>-validation.md` first and re-run only what is missing. **Note:** on this host newly created files in `tools/.cache/` disappear between shell calls — keep durable notes in tracked files.

## Rules of the road

- `game/` changes ⇒ run `tools/sync-docs.sh` **and** `node tools/build_offline.js` when assets/pages change (the offline inventory hashes real bytes), **bump `game/manifest.json`** (A.B.C, deliberately NOT semver: C = minor, B = major, A = overhaul) **and refresh the affected review screenshots** (`AGENTS.md`). Never edit `docs/` by hand.
- Never commit or push to `main` unless the user says so for this task.
- Before touching a risky area read its lesson file: see the table in `AGENTS.md` (`project/lessons/`).
- Locked decisions: `project/DECISIONS.md`. Process: `project/PROCESS.md`.
- Older session logs: `archive/handover/`.
