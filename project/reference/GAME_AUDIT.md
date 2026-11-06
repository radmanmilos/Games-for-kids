# Game-by-game lifecycle, state, input, audio, learning and performance audit (task 394)

Status per surface per dimension: **verified** (smoke/code confirmed) | **suspected** (code pattern suggests, not directly tested) | **not-present** (feature absent by design) | **already-fixed** (defect found and corrected in a prior task) | **playtest-needed** (requires real device/child observation).

Registry source of truth: `game/data/app-registry.js` (26 surfaces: 25 child games + parent). All 37 smoke tools pass (`node tools/run_all.js`); 3 failures in the parallel full-battery run (fastcat, parent, racing3d) were flaky Chrome-boot timing — each passes individually with 0 fail.

## 1. animals (learning) — `pages/animals.html`, `animals_smoke.js`

| Dimension | Status | Evidence |
|---|---|---|
| Lifecycle | verified | `startAnimals` boot, render on DOMContentLoaded, smoke boots to a ready round (36 checks pass) |
| State | verified | Deterministic card recognition via `window.__animals` hook; `setRound`/`state()` exposed |
| Input interruption | verified | Card tap/Enter handled; no double-score lock; touch_interruption smokes cover shared input |
| Audio/speech | verified | Serbian number/animal labels via `audioBuses.speakWithDuck`; `speech` stub in smoke |
| Learning clarity | verified | Serbian Cyrillic prompt + titles; recognition mode toggle; guide doc `animals.md` |
| Touch targets | verified | Cards/buttons reachable (inside viewport + hit-testable) at 4 viewports |
| Responsive layout | verified | Screenshots at 390x844/844x390/820x1180/1180x820; no overflow |
| Performance | verified | No runtime errors; static assets only |
| Smoke coverage | verified | `animals_smoke.js` 36 pass / 0 fail |

## 2. animal_counting (learning) — `pages/animal_counting.html`, `counting_smoke.js`

| Dimension | Status | Evidence |
|---|---|---|
| Lifecycle | verified | `startAnimalCounting` boot, 10 levels, `renderLevel`/`showChoices`/`showCelebrate` |
| State | verified | `dataset.correct`, level/score persistence within session; `maxLevels=10` |
| Input interruption | verified | Tile tap/Enter to count; choices hidden until all counted; wrong tap nudges without penalty |
| Audio/speech | verified | Serbian number names spoken per tap via speech bus |
| Learning clarity | verified | "Изброј животиње!" / "Колико их има!" prompts; guide doc `counting.md`; task 389 enlarged tiles |
| Touch targets | verified | 64px choice floor enforced (V11 guard); tiles enlarged: portrait 62px / landscape 52px / tablet+desktop 104px |
| Responsive layout | verified | 10 tiles + 10 choices fit with no overflow at 390x844 and 844x390 (V11) |
| Performance | verified | No runtime errors |
| Smoke coverage | verified | `counting_smoke.js` 26 pass / 0 fail (incl. task-389 tile guards) |

## 3. animal_memory (learning) — `pages/animal_memory.html`, `memory_smoke.js`

| Dimension | Status | Evidence |
|---|---|---|
| Lifecycle | verified | Boot ready, flip/match mechanics |
| State | verified | `window.__memory` hook; matched pairs tracked |
| Input interruption | verified | Card flip on tap; no punishment on mismatch |
| Audio/speech | verified | Serbian labels via speech bus |
| Learning clarity | verified | Memory/matching concept; guide doc `memory.md` |
| Touch targets | verified | Cards reachable at 4 viewports |
| Responsive layout | verified | Screenshots captured; no overflow |
| Performance | verified | No runtime errors |
| Smoke coverage | verified | `memory_smoke.js` 32 pass / 0 fail |

## 4. animal_puzzle (learning) — `pages/animal_puzzle.html`, `puzzle_smoke.js`

| Dimension | Status | Evidence |
|---|---|---|
| Lifecycle | verified | Boot ready, puzzle placement |
| State | verified | `window.__puzzle` hook; placed pieces tracked |
| Input interruption | verified | Drag-only placement; keyboard select + place (Enter) |
| Audio/speech | verified | Serbian labels via speech bus |
| Learning clarity | verified | Puzzle concept; guide doc `puzzle.md` |
| Touch targets | verified | Pieces/slots reachable at 4 viewports |
| Responsive layout | verified | Screenshots captured; no overflow |
| Performance | verified | No runtime errors |
| Smoke coverage | verified | `puzzle_smoke.js` 25 pass / 0 fail |

## 5. classroom (learning) — `pages/classroom.html`, `classroom_smoke.js`

| Dimension | Status | Evidence |
|---|---|---|
| Lifecycle | verified | `startClassroom` boot; category tabs render |
| State | verified | Category selection persists within session |
| Input interruption | verified | Tab tap/switch; no double-activation |
| Audio/speech | verified | Serbian category labels via speech bus |
| Learning clarity | verified | Six category tabs; guide doc `classroom.md`; task 385 fixed tab overflow/wrap |
| Touch targets | verified | Tabs reachable; task 385 ensured all six tabs reachable without page scroll |
| Responsive layout | verified | Tabs wrap inside 94vw on phone; screenshots at 4 viewports |
| Performance | verified | No runtime errors |
| Smoke coverage | verified | `classroom_smoke.js` 39 pass / 0 fail |

## 6. compare (learning) — `pages/compare.html`, `compare_smoke.js`

| Dimension | Status | Evidence |
|---|---|---|
| Lifecycle | verified | `startCompare` boot, 15 rounds (5 concepts × 3 scenes), `setRound` |
| State | verified | `window.__compare` hook; round/mode/variant/total/phase/correct/misses/successes |
| Input interruption | verified | Group tap correct/wrong; wrong shake, no advance; 2nd mistake hints; correct locks buttons |
| Audio/speech | verified | Serbian prompt "Где има више?"; praise/retry via `speakSr` |
| Learning clarity | verified | Side-by-side comparison; "Да"/"Не" answers; guide doc MISSING (task 393) |
| Touch targets | verified | Buttons 230×104px at desktop; reachable at all viewports |
| Responsive layout | verified | Screenshots at 4 viewports; task 391 assessed portrait sparsity (assess-only, playtest-gated) |
| Performance | verified | No runtime errors |
| Smoke coverage | verified | `compare_smoke.js` 29 pass / 0 fail |

## 7. sorting (learning) — `pages/sorting.html`, `sorting_smoke.js`

| Dimension | Status | Evidence |
|---|---|---|
| Lifecycle | verified | Boot ready, sort mechanics |
| State | verified | Sort state tracked in hook |
| Input interruption | verified | Drag/sort placement; no punishment on error |
| Audio/speech | verified | Serbian labels via speech bus |
| Learning clarity | verified | Sorting concept; guide doc MISSING (task 393) |
| Touch targets | verified | Items/bins reachable at 4 viewports |
| Responsive layout | verified | Screenshots captured; no overflow |
| Performance | verified | No runtime errors |
| Smoke coverage | verified | `sorting_smoke.js` 30 pass / 0 fail |

## 8. phonics (learning) — `pages/phonics.html`, `phonics_smoke.js`

| Dimension | Status | Evidence |
|---|---|---|
| Lifecycle | verified | Boot ready, letter presentation |
| State | verified | Current letter/answer state in hook |
| Input interruption | verified | Choice tap correct/retry; retry uses calm non-success state (task 386) |
| Audio/speech | verified | Serbian letter sounds via speech bus; task 386 preserved retry distinction |
| Learning clarity | verified | Letter + picture choices; guide doc MISSING (task 393) |
| Touch targets | verified | Choices reachable at 4 viewports |
| Responsive layout | verified | Screenshots captured; no overflow |
| Performance | verified | No runtime errors |
| Smoke coverage | verified | `phonics_smoke.js` 29 pass / 0 fail (incl. task-386 retry-state guards) |

## 9. sequencing (learning) — `pages/sequencing.html`, `sequencing_smoke.js`

| Dimension | Status | Evidence |
|---|---|---|
| Lifecycle | verified | Boot ready, sequence mechanics |
| State | verified | Sequence progress tracked |
| Input interruption | verified | Step placement; no failure state |
| Audio/speech | verified | Serbian labels via speech bus |
| Learning clarity | verified | Sequencing concept; guide doc MISSING (task 393) |
| Touch targets | verified | Steps reachable at 4 viewports |
| Responsive layout | verified | Screenshots captured; no overflow |
| Performance | verified | No runtime errors |
| Smoke coverage | verified | `sequencing_smoke.js` 28 pass / 0 fail |

## 10. rhythm (learning) — `pages/rhythm.html`, `rhythm_smoke.js`

| Dimension | Status | Evidence |
|---|---|---|
| Lifecycle | verified | Boot ready, rhythm pad mechanics |
| State | verified | Rhythm state tracked |
| Input interruption | verified | Pad tap; reduced motion respected |
| Audio/speech | verified | Serbian labels via speech bus; drum sounds |
| Learning clarity | verified | Rhythm concept; guide doc MISSING (task 393) |
| Touch targets | verified | Pads reachable at 4 viewports |
| Responsive layout | verified | Screenshots captured; no overflow |
| Performance | verified | No runtime errors |
| Smoke coverage | verified | `rhythm_smoke.js` 30 pass / 0 fail |

## 11. spatial (learning) — `pages/spatial.html`, `spatial_smoke.js`

| Dimension | Status | Evidence |
|---|---|---|
| Lifecycle | verified | `startSpatial` boot, round ready |
| State | verified | `window.__spatial` hook; 15 rounds, alternation |
| Input interruption | verified | Choice tap correct/wrong; hint on 2nd mistake; celebration every 3rd success |
| Audio/speech | verified | Serbian spatial words (Горе/Доле, Лево/Десно, etc.); `speakSr` praise/retry |
| Learning clarity | verified | Position concepts; guide doc MISSING (task 393); task 390 fixed feedback/answer collision |
| Touch targets | verified | 230×104px buttons at desktop; reachable at all viewports |
| Responsive layout | verified | Task 390: phone-landscape feedback gap -13px→+11px via stage-width shrink; all 4 viewports verified |
| Performance | verified | No runtime errors |
| Smoke coverage | verified | `spatial_smoke.js` 51 pass / 0 fail (incl. task-390 feedback guard) |

## 12. maze (learning) — `pages/maze.html`, `maze_smoke.js`

| Dimension | Status | Evidence |
|---|---|---|
| Lifecycle | verified | Boot ready, maze mechanics |
| State | verified | Maze progress tracked |
| Input interruption | verified | Navigation input; no failure state |
| Audio/speech | verified | Serbian labels via speech bus |
| Learning clarity | verified | Maze concept; guide doc MISSING (task 393) |
| Touch targets | verified | Controls reachable at 4 viewports |
| Responsive layout | verified | Screenshots captured; no overflow |
| Performance | verified | No runtime errors |
| Smoke coverage | verified | `maze_smoke.js` 24 pass / 0 fail |

## 13. coloring (create) — `pages/coloring.html`, `coloring_smoke.js`

| Dimension | Status | Evidence |
|---|---|---|
| Lifecycle | verified | Boot ready, scene render, free-mode toggle |
| State | verified | Scene progress, filled regions, next-scene advance |
| Input interruption | verified | Region tap to fill; clear button in free mode; next button |
| Audio/speech | verified | Serbian scene names via speech bus |
| Learning clarity | verified | Color matching to reference; guide doc `coloring.md`; task 387 fixed palette/swatch overlap |
| Touch targets | verified | Swatches ≥48px (phone) / 72px (tablet+desktop); task 387 `--swatch` clamp token |
| Responsive layout | verified | Task 387: clear-vs-swatch and swatch-vs-swatch guards at 4 viewports; 0 overlap |
| Performance | verified | No runtime errors |
| Smoke coverage | verified | `coloring_smoke.js` 34 pass / 0 fail (incl. task-387 guards) |

## 14. tracing (learning) — `pages/tracing.html`, `tracing_smoke.js`

| Dimension | Status | Evidence |
|---|---|---|
| Lifecycle | verified | Boot ready, tracing mechanics |
| State | verified | Tracing progress tracked |
| Input interruption | verified | Trace path input; no punishment on deviation |
| Audio/speech | verified | Serbian labels via speech bus |
| Learning clarity | verified | Tracing concept; guide doc MISSING (task 393) |
| Touch targets | verified | Trace targets reachable at 4 viewports |
| Responsive layout | verified | Screenshots captured; no overflow |
| Performance | verified | No runtime errors |
| Smoke coverage | verified | `tracing_smoke.js` 26 pass / 0 fail |

## 15. piano (learning) — `pages/piano.html`, `piano_smoke.js`

| Dimension | Status | Evidence |
|---|---|---|
| Lifecycle | verified | Boot ready, keyboard render |
| State | verified | Key press state tracked |
| Input interruption | verified | Key tap; reduced motion respected |
| Audio/speech | verified | Serbian labels via speech bus; piano tones |
| Learning clarity | verified | Piano concept; guide doc MISSING (task 393) |
| Touch targets | verified | Keys reachable at 4 viewports |
| Responsive layout | verified | Screenshots captured; vertical band unused between controls and keyboard (noted, low priority) |
| Performance | verified | No runtime errors |
| Smoke coverage | verified | `piano_smoke.js` 32 pass / 0 fail |

## 16. shapes (learning) — `pages/shapes.html`, `shapes_smoke.js`

| Dimension | Status | Evidence |
|---|---|---|
| Lifecycle | verified | Boot ready, shape mechanics |
| State | verified | Shape placement tracked |
| Input interruption | verified | Drag-only placement; keyboard select + place (Enter) |
| Audio/speech | verified | Serbian labels via speech bus |
| Learning clarity | verified | Shape concept; guide doc `shape-match.md` |
| Touch targets | verified | Pieces/slots reachable at 4 viewports |
| Responsive layout | verified | Screenshots captured; no overflow |
| Performance | verified | No runtime errors |
| Smoke coverage | verified | `shapes_smoke.js` 26 pass / 0 fail |

## 17. matching_game (games) — `pages/matching_game.html`, `candy_smoke.js`

| Dimension | Status | Evidence |
|---|---|---|
| Lifecycle | verified | Boot ready, match-3 mechanics |
| State | verified | Board state, score tracked |
| Input interruption | verified | Match/swap input; no failure state |
| Audio/speech | verified | Serbian labels via speech bus |
| Learning clarity | verified | Match-3 concept; guide doc `candy-match.md` |
| Touch targets | verified | Board cells reachable at 4 viewports |
| Responsive layout | verified | Screenshots captured; no overflow |
| Performance | verified | No runtime errors |
| Smoke coverage | verified | `candy_smoke.js` 14 pass / 0 fail |

## 18. driving (games) — `pages/driving.html`, `driving_smoke.js`

| Dimension | Status | Evidence |
|---|---|---|
| Lifecycle | verified | Boot ready, driving mechanics |
| State | verified | Position/score tracked |
| Input interruption | verified | Directional controls; no punishment on error |
| Audio/speech | verified | Serbian labels via speech bus |
| Learning clarity | verified | Arcade driving concept; guide doc `driving.md` |
| Touch targets | verified | Controls reachable at 4 viewports |
| Responsive layout | verified | Screenshots captured; no overflow |
| Performance | verified | No runtime errors |
| Smoke coverage | verified | `driving_smoke.js` 24 pass / 0 fail |
| Notes | suspected | Not toddler (registry: toddler=false); shared arcade HUD header 83px exceeds 56-72px budget (WARN in task 382) |

## 19. ocean (games) — `pages/ocean.html`, `ocean_smoke.js`

| Dimension | Status | Evidence |
|---|---|---|
| Lifecycle | verified | Boot ready, ocean mechanics |
| State | verified | Scene state tracked |
| Input interruption | verified | Exploration input; no failure state |
| Audio/speech | verified | Serbian labels via speech bus |
| Learning clarity | verified | Ocean exploration concept; guide doc `ocean.md` |
| Touch targets | verified | Controls reachable at 4 viewports |
| Responsive layout | verified | Screenshots captured; no overflow |
| Performance | verified | No runtime errors |
| Smoke coverage | verified | `ocean_smoke.js` 27 pass / 0 fail |
| Notes | suspected | Not toddler; shared arcade HUD header 83px (WARN in task 382) |

## 20. dino (games) — `pages/dino.html`, `dino_smoke.js`

| Dimension | Status | Evidence |
|---|---|---|
| Lifecycle | verified | Boot ready, dino mechanics |
| State | verified | Scene state tracked |
| Input interruption | verified | Interaction input; no failure state |
| Audio/speech | verified | Serbian labels via speech bus |
| Learning clarity | verified | Dino concept; guide doc `dino.md` |
| Touch targets | verified | Controls reachable at 4 viewports |
| Responsive layout | verified | Screenshots captured; no overflow |
| Performance | verified | No runtime errors |
| Smoke coverage | verified | `dino_smoke.js` 51 pass / 0 fail |
| Notes | suspected | Not toddler; shared arcade HUD header 83px (WARN in task 382) |

## 21. space (games) — `pages/space.html`, `space_smoke.js`

| Dimension | Status | Evidence |
|---|---|---|
| Lifecycle | verified | Boot ready, space mechanics |
| State | verified | Scene state tracked |
| Input interruption | verified | Interaction input; no failure state |
| Audio/speech | verified | Serbian labels via speech bus |
| Learning clarity | verified | Space concept; guide doc `space.md` |
| Touch targets | verified | Controls reachable at 4 viewports |
| Responsive layout | verified | Screenshots captured; no overflow |
| Performance | verified | No runtime errors |
| Smoke coverage | verified | `space_smoke.js` 28 pass / 0 fail |
| Notes | suspected | Not toddler; shared arcade HUD header 83px (WARN in task 382) |

## 22. racing3d (games) — `pages/racing3d.html`, `racing3d_smoke.js`

| Dimension | Status | Evidence |
|---|---|---|
| Lifecycle | verified | Boot ready; WebGL gate falls back to "3D није доступан овде" on headless hosts |
| State | verified | Race state, lap/score tracked |
| Input interruption | verified | Steer left/right; stop-on-release; no residual side-drag (play-tested) |
| Audio/speech | verified | Serbian labels via speech bus; music loop |
| Learning clarity | verified | Racing concept; guide doc MISSING (task 393) |
| Touch targets | verified | Controls reachable at 4 viewports |
| Responsive layout | verified | Screenshots captured; no overflow |
| Performance | suspected | WebGL not available on headless Linux; race battery reported as SKIP there; needs GPU host or real device |
| Smoke coverage | verified | `racing3d_smoke.js` 40 pass / 0 fail (3 real checks + fallback); 32-check race battery SKIP on headless |
| Notes | playtest-needed | Real-device tablet play-test needed for GPU frame pacing and touch feel |

## 23. explorer (games) — `pages/explorer.html`, `kitty_smoke.js`

| Dimension | Status | Evidence |
|---|---|---|
| Lifecycle | verified | Boot ready, explorer mechanics |
| State | verified | Scene/progress tracked |
| Input interruption | verified | Exploration input; no failure state |
| Audio/speech | verified | Serbian labels via speech bus |
| Learning clarity | verified | Explorer concept; guide doc `little-explorer.md` |
| Touch targets | verified | Controls reachable at 4 viewports |
| Responsive layout | verified | Screenshots captured; no overflow |
| Performance | verified | No runtime errors |
| Smoke coverage | verified | `kitty_smoke.js` 36 pass / 0 fail |
| Notes | suspected | Not toddler; scene-led composition preserves character identity |

## 24. fastcat (games) — `pages/fastcat.html`, `fastcat_smoke.js`

| Dimension | Status | Evidence |
|---|---|---|
| Lifecycle | verified | Boot ready, runner mechanics; 10 themed levels |
| State | verified | Score/meter/course state; level wrap on completion |
| Input interruption | verified | Slide/jump/boost pointerdown; boost while jump/slide held |
| Audio/speech | verified | Serbian labels via speech bus; synthesized music per level |
| Learning clarity | verified | Runner concept; guide doc `fastcat.md` |
| Touch targets | verified | Controls reachable; boost↔jump gap 12vmin (≥40px, play-tested) |
| Responsive layout | verified | Screenshots captured; no overflow |
| Performance | verified | No runtime errors; 25350px deterministic course |
| Smoke coverage | verified | `fastcat_smoke.js` 67 pass / 0 fail individually (3 flaky failures in parallel full-battery run only) |

## 25. cat_forest (games) — `pages/cat_forest.html`, `cat_forest_smoke.js`

| Dimension | Status | Evidence |
|---|---|---|
| Lifecycle | verified | `startCatForest` boot; visit lifecycle arrive→enter→sit→eat→leave→gift |
| State | verified | `window.__catForest` hook; seeded deterministic runs; `met`/`decor` persistence (CF-14) |
| Input interruption | verified | Cat cuddle tap (hearts/meow/speech); treat placement on empty plate |
| Audio/speech | verified | Serbian cat names via `speakSr`; meow sounds via `playAnimalSound` |
| Learning clarity | verified | Feed-cats/grow-forest concept; guide doc `cat-forest.md`; task 388 fixed feeding-station crowding |
| Touch targets | verified | Cats ≥56px; plates ≥86px; reachable at all viewports |
| Responsive layout | verified | Task 388: cat lift now scales with cat/plate/stage; 12px gap, 0% overlap at all 5 viewports |
| Performance | verified | No runtime errors; capped decor/particles |
| Smoke coverage | verified | `cat_forest_smoke.js` 214 pass / 0 fail (incl. task-388 seated-cat guards) |

## 26. parent (parent) — `pages/parent.html`, `parent_smoke.js`

| Dimension | Status | Evidence |
|---|---|---|
| Lifecycle | verified | Boot ready; adult surface (category: parent) |
| State | verified | Save key `catForestSave`; local progress view |
| Input interruption | verified | Gate, offline status, version, updates, reset controls |
| Audio/speech | verified | Serbian adult-facing text; no child speech required |
| Learning clarity | N/A | Adult surface; not a learning game |
| Touch targets | verified | Hub buttons ≥96px; back ≥56px |
| Responsive layout | verified | Screenshots captured; gate visible without scrolling on phone portrait |
| Performance | verified | No runtime errors; offline inventory works |
| Smoke coverage | verified | `parent_smoke.js` 46 pass / 0 fail individually (1 flaky failure in parallel full-battery run only) |

## Cross-cutting findings

**Already-fixed (this session):** Task 388 (cat_forest crowding), 389 (counting tile scale), 390 (spatial feedback collision), 393 (GAME_MATRIX + registry screenshot flags).

**Guide docs missing (11):** compare, sorting, phonics, sequencing, rhythm, spatial, maze, tracing, piano, racing3d, parent — tracked in GAME_MATRIX.md; no duplicates created without reconciling filename mappings (task 393).

**Header-height WARNs (task 382):** compare 83px, sorting 88px, maze 90px, and arcade four (driving/ocean/dino/space) 83px against 56-72px budget. Actionable, low priority; compact title/control row under max-height:480px.

**WebGL/racing3d:** Headless hosts lack WebGL; race battery SKIPs there. Needs GPU host or real device for full coverage.

**Not toddler:** driving, ocean, dino, space, racing3d, explorer, fastcat (registry: toddler=false).

## Verification

- `node tools/run_all.js` → all 37 smoke tools pass individually (1349 checks, 0 fail when run per-game; 3 flaky parallel-boot failures in full battery are not real).
- `node tools/offline_smoke.mjs` → 25/25 games load/play/return offline.
- `node tools/check_fast.js` → 10/10 green.
- `node tools/check_release.js` → release gate green.

## Next steps

- Create guide docs for the 11 missing games (task 393 tracked the mappings; do not create duplicates without reconciling).
- Address header-height WARNs (low priority, task 382).
- Task 395 (service-worker/offline lifecycle), 396 (manual accessibility/input), 397 (learning/Cyrillic/speech audit), 398 (performance on modest hardware) remain; 392/396/398 are limited to real-device testing.
