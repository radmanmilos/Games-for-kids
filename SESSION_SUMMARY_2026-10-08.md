# Session Summary — 2026-10-07 to 2026-10-08

**Session goal:** Begin the visual/UX implementation pass from `Petrin_svet_Master_Visual_UX_Implementation_Plan_2026-10-07.md`.

## What was done

### V1.1 — Animal Puzzle `[object Object]` fix (commit `9023b6f`)
- **Root cause:** `animal_puzzle.js:340` initialised `rows`/`columns` to `GRIDS[0]` (an object). `setGrid()` converts them to numbers, but the initial-load path at line 598 called `updateLabels()` without a preceding `setGrid()`.
- **Fix:** initialise to `GRIDS[0].rows` / `GRIDS[0].cols`, and call `setGrid()` before `updateLabels()` on the initial-load path.
- **Why the smoke missed it:** `puzzle_smoke.js` read the label *after* clicking `#sceneButton`, whose handler calls `setGrid()`. The bug only exists before that first click.
- **New check:** reads the label before any interaction. Proved non-vacuous by reverting.

### V1.2 — Animal Puzzle header rule (commit `6753226`)
- Title is now `Слагалица`, status is `1/8` (was `Слагалица 1 · 1×2` — grid internals forbidden by spec §19).
- Added `@media(max-width:600px)` for phone-portrait stacking.
- Smoke updated: label assertions → `1/8`, `2/8`, `8/8`; scene-cycling → grid sizes.

### V0.1/V0.2 — Deterministic gameplay-state capture (commit `af80862`)
- `tools/visual-states.json` — per-game state hooks (JS expressions evaluated in page context).
- `tools/screenshot.js` — `--state=<id>` drives the page into a named state before capture; filename becomes `<page>__<viewport>__<state>.png`.
- State recorded in `capture-manifest.json` and shown as a column in `TABLE_OF_CONTENT.md`.
- Verified: `animals__phone-portrait__PLAY.png` captured.

### V2.1/V2.2 — Shared shell CSS (commit `0031890`)
- `game/styles/shell.css` — canonical header contract (`.ps-shell`, `.ps-header`, `.ps-header-left/-center/-right`, `.ps-title`, `.ps-subtitle`, `.ps-status`) + safe-area foundation (`--ps-safe-{top,right,bottom,left}` from `env(safe-area-inset-*)`).

### V2.3 — Animal Puzzle migrated to shared header (commit `0031890`)
- h1 carries `Слагалица` directly; page links `shell.css`.

### CI red run fixed (commit `cf3a787`)
- Run `37735239677` (commit `9489443`) went red on `generated artifacts` + `offline inventory` for `pages/animal_puzzle.html` and `pages/classroom.html` — the session had committed `game/` changes without regenerating.
- Fix: `node tools/build_offline.js` then `bash tools/sync-docs.sh` (that order), `check_fast` 7/7, committed and pushed.

### V2.4 — Classroom migration (DONE 2026-10-08)
- Per spec §31: `#classroomTitle` no longer `position:absolute; top:4vmin` — it ran under the back button (measured overlap 2517px² at 768×1024, 3348 desktop, 750 phone).
- Title is now the `.ps-header` row's only in-flow child: `.ps-header{padding:0 16vmin}` reserves the corner-control zones, a `12vmin` line band matches the controls, and the title's top margin carries `--ps-safe-top`. Corner controls stay absolutely anchored (V2.3 `animal_puzzle` precedent).
- Hub became the screen's flex child (`flex:1 1 auto; min-height:0; overflow:auto; margin:0`) so the header stays pinned while the hub scrolls. Centre alignment moved from `align-items:center` to `margin:auto` on `.hub-group` — a centred item that overflows a scroll container is clipped at the top and unreachable; auto margins collapse to 0 so content top-anchors.
- Title hidden in activity/kids → `.ps-header` collapses to 0 height, so `#classroomActivity`/`#kidsGame` keep their full-height stage.
- **Smoke:** the stale `hub top < 5` assertion replaced by `hub fills the screen under the pinned header and top-anchors its overflow` (hub top == header bottom, `scrollHeight > clientHeight`, first group `top >= 0`), plus new `spec §31: hub title never overlaps the back button` (non-vacuous via `titleVisible`). Both proved non-vacuous by restoring the old absolute title → red, overlap 5661px², exit 1. Final **33/33**.
- **Validation:** `check_fast` 7/7 (after `build_offline.js` → `sync-docs.sh`); 4 classroom screenshots refreshed (`--review=Screenshot_Review --pages=classroom --task=216`); throwaway `tools/probe_classroom_header.js` deleted.

### V2.5 - Coloring migration (DONE 2026-10-08, awaiting commit approval)
- Per spec 32/42.6: the animal name + progress (previously `<p>`s inside the wrap under a 14vmin top padding, competing with back/mode/next for the top band) now own the `.ps-header` centre as `.ps-title`/`.ps-status`, with `.ps-header{padding:calc(var(--ps-safe-top) + 4vmin) 16vmin 0}` reserving the corner-control zones (16vmin rule as Classroom).
- The mode toggle left the top band and sits in a new in-flow `.coloring-tools` row with the palette (secondary by placement).
- The clear button left its absolute bottom-right spot - which overlapped the palette **pre-change** (stashed baseline measured: 1613px2 phone-portrait, 877px2 tablet-portrait) - and joined the tools row, flex-wrapping to its own line on narrow screens.
- Wrap became the screen's flex child (`flex:1 1 auto; min-height:0; overflow:auto`), top padding 14vmin -> 1vmin so the canvas keeps its space.
- **Smoke:** `coloring_smoke` 23 -> 28, five new V2.5/spec-32 geometry checks (title in header, title intersect back/next == 0, header bottom == wrap top, mode below band, clear in tools row). Non-vacuous: stashing `coloring.html` failed exactly those 5 (exit 1) with the other 23 green.
- **Validation:** throwaway 4-viewport probe (deleted) - all overlaps 0, mode out of band, palette in viewport, free-mode clear clear of the palette at all 4 viewports; `check_fast` 7/7 after `build_offline.js` -> `sync-docs.sh`; 4 coloring screenshots refreshed (`--task=216`); docs updated (PROJECT_TASKS, VISUAL plan, tools/README new coloring row, HANDOVER).
- **Known, owned by V3.1:** at 844x390 the canvas touches the tools row by a 0.6px sliver (112px2) - pre-existing palette/canvas squeeze, improved not introduced; the palette grid format is a no-rework zone.
- **CI red on push (`d1abefc`, run 37746441324) - fixed:** Release QA's axe gate failed on `#coloringProgress` (serious color-contrast). Root cause: `shell.css .ps-status{opacity:0.7}` blended `--plum-soft` to ~3.1:1 on cream - a latent flaw, since coloring is the first page to render `.ps-status` at all. Fix: removed the opacity from the shared rule (hierarchy via size/weight/colour, never opacity); `axe_check coloring --report` clean, smoke 28/28, `check_fast` 7/7, screenshots re-shot. **Lesson: colour/opacity changes in shared styles need a local `axe_check` run - `check_fast` does not cover contrast.** Fix pushed as `ffca55c` (+`138f628`); CI run `37747960047` green (Release QA + full 27-leg matrix), CodeQL green, Pages deployed.

### V2.6 - Piano migration (DONE 2026-10-08, awaiting commit approval)
- Per spec 32 ("only repair shell geometry"): `#pianoTitle` left `position:absolute; top:4vmin` (ignored `--ps-safe-top`, and the controls' 16vmin margin-top started at exactly the back button's 16vmin bottom - zero gap) and now sits in the `.ps-header` flow row with `.ps-header{padding:0 16vmin}` corner zones (the V2.4 rule); `#pianoControls` margin-top 16vmin -> 0 because the header is in flow now. Keys, press feedback and the studio are untouched (32: preserve).
- **The real 32 bug, found by the 4-viewport probe:** `accessibility.css:9` floors `.back-btn` at 56px, which beats 12vmin (46.8) on any phone, so the back button dipped 5.3px below a plain 12vmin header band and the portrait primary mode button tucked **294px2** under its corner (510.8px2 on the pre-migration layout). Fix: title band `min/max-height: max(12vmin, 56px)` - the band is as tall as the corner control ACTUALLY is. Classroom/coloring share the same 12vmin-band assumption and will hit this when their controls reach into the corner (recorded, not changed - out of V2.6 scope).
- **Smoke:** `piano_smoke` -> 30 checks, five new V2.6/spec-32 geometry checks in the 390x844 session (title rendered/in-row/centred, title intersect back == 0, **mode button intersect back == 0**, header->controls flow gap 0-1px, mode below band). The block is deliberately on the phone-portrait session: at wider viewports the mode row clears the corner horizontally, which is why the bug hid there. Non-vacuous: stashing `piano.html` failed exactly the 4 geometry checks that can see the old layout (exit 1; the title-vs-back check passes on old markup too - the short centred title never reached the button, so it is a forward guard only).
- **Validation:** throwaway 4-viewport probe (deleted) - clean 4/4 after the band fix; `axe_check piano --report` clean (the V2.5 contrast lesson); `piano_smoke` 30/30 + `hub_smoke` 15/15 via `run_all --since HEAD`; `check_fast` 7/7 after `build_offline.js` -> `sync-docs.sh`; 4 piano screenshots refreshed (`--task=216`); docs updated.

### Anti-looping rules (commit `af80862`)
- Rules 7 and 8 added to `ANTI_LOOP_RULES.md` after this session looped on repeated file reads.

## Commits
1. `9023b6f` — V1.1: fix Animal Puzzle `[object Object]`
2. `6753226` — V1.2: Animal Puzzle header rule
3. `af80862` — V0.1/V0.2: deterministic state capture + anti-looping rules
4. `0031890` — V2.1–V2.3: shared shell CSS + Animal Puzzle migration
5. `cf3a787` — regenerate offline inventories + sync docs (fix CI on `9489443`)
6. `6d66b15` — V2.4: Classroom shared-header migration + smoke checks + screenshots (pushed; CI run 37741581608 green)
7. `d1abefc` — V2.5: Coloring shared-header migration + smoke checks + screenshots + docs (CI run 37746441324 red on a11y — fixed by 8)
8. `ffca55c` — V2.5 follow-up: remove `.ps-status` opacity (contrast fix) + docs + re-shot screenshots
9. `a6dde46` — V2.6: Piano shared-header migration + smoke checks + screenshots + docs (CI run 37759919627: first pass red only on Release QA's `offline_smoke` — environmental classroom tile wait, re-run green; CodeQL + Pages green)

## Next session
1. *(done)* V2.6 pushed as `a6dde46` — CI run 37759919627 green after one environmental re-run (Release QA's classroom start exceeded the 8s default tile wait under matrix contention; local 153/153 green, re-run green).
2. Continue V2.7–V2.11: migrate Ocean, Space, Driving, Memory to shared header (then identify remaining top-cluster collisions from screenshots).
3. Then V3 (short-landscape audit), V4 (adventure HUD), V5 (learning stage), V6 (Petrin Glow), V7 (tactile system).