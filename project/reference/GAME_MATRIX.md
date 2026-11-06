# Game-by-game audit matrix (task 393 — reconciled from the live registry)

Columns: ID | Category | Smoke | Screenshot | Offline | Toddler | Guide doc | Notes

- Registry is authoritative for ID, path, category, smoke, offline, toddler (game/data/app-registry.js).
- Screenshot reflects actual captured review coverage (resources/General_reviews/Screenshot_Review): all 25 child games have 4-viewport captures; parent is left at the registry value.
- Guide doc reflects actual files in project/games/*.md (some guide filenames differ from their registry ID — see mapping below).
- Verified with `node tools/run_all.js --game <name>` and `node tools/offline_smoke.mjs`.

| ID | Category | Smoke | Screenshot | Offline | Toddler | Guide doc | Notes |
|---|---|---|---|---|---|---|---|
| animals | learning | animals_smoke | true | true | true | yes | animals.md |
| animal_counting | learning | counting_smoke | true | true | true | yes | counting.md |
| animal_memory | learning | memory_smoke | true | true | true | yes | memory.md |
| animal_puzzle | learning | puzzle_smoke | true | true | true | yes | puzzle.md |
| classroom | learning | classroom_smoke | true | true | true | yes | classroom.md |
| compare | learning | compare_smoke | true | true | true | MISSING | registry screenshot flag flipped false→true (task 393) |
| sorting | learning | sorting_smoke | true | true | true | MISSING | registry screenshot flag flipped false→true (task 393) |
| phonics | learning | phonics_smoke | true | true | true | MISSING | registry screenshot flag flipped false→true (task 393) |
| sequencing | learning | sequencing_smoke | true | true | true | MISSING | registry screenshot flag flipped false→true (task 393) |
| rhythm | learning | rhythm_smoke | true | true | true | MISSING | registry screenshot flag flipped false→true (task 393) |
| spatial | learning | spatial_smoke | true | true | true | MISSING | registry screenshot flag flipped false→true (task 393) |
| maze | learning | maze_smoke | true | true | true | MISSING | registry screenshot flag flipped false→true (task 393) |
| coloring | create | coloring_smoke | true | true | true | yes | coloring.md |
| tracing | learning | tracing_smoke | true | true | true | MISSING | - |
| piano | learning | piano_smoke | true | true | true | MISSING | - |
| shapes | learning | shapes_smoke | true | true | true | yes | shape-match.md |
| matching_game | games | candy_smoke | true | true | true | yes | candy-match.md |
| driving | games | driving_smoke | true | true | false | yes | driving.md |
| ocean | games | ocean_smoke | true | true | false | yes | ocean.md |
| dino | games | dino_smoke | true | true | false | yes | dino.md |
| space | games | space_smoke | true | true | false | yes | space.md |
| racing3d | games | racing3d_smoke | true | true | false | MISSING | - |
| explorer | games | kitty_smoke | true | true | false | yes | little-explorer.md |
| fastcat | games | fastcat_smoke | true | true | false | yes | fastcat.md |
| cat_forest | games | cat_forest_smoke | true | true | true | yes | cat-forest.md |
| parent | parent | null | false | true | false | MISSING | adult surface; screenshot flag left as registry value |

## Guide docs present (16 files in project/games/)

- project/games/animals.md
- project/games/candy-match.md  → matching_game
- project/games/cat-forest.md
- project/games/classroom.md
- project/games/coloring.md
- project/games/counting.md  → animal_counting
- project/games/dino.md
- project/games/driving.md
- project/games/fastcat.md
- project/games/little-explorer.md  → explorer
- project/games/little-racer.md  → orphan (no registry ID)
- project/games/memory.md  → animal_memory
- project/games/ocean.md
- project/games/puzzle.md  → animal_puzzle
- project/games/shape-match.md  → shapes
- project/games/space.md

## Games without a guide doc (11)

- compare, sorting, phonics, sequencing, rhythm, spatial, maze, tracing, piano, racing3d, parent

## Discrepancies corrected (task 393)

1. Registry `screenshot` flags were `false` for compare, sorting, phonics, sequencing, rhythm, spatial, maze, cat_forest even though 4-viewport review screenshots exist for every child game. Flipped to `true` so `visual_compare.js` includes them in baseline coverage (visual_compare.js:14 builds `PAGES` from `registryAll().filter(app => app.screenshot)`).
2. GAME_MATRIX.md "Guide doc" column previously marked only 8 rows as `yes`; 15 registry IDs are now covered by guide docs (little-racer.md is an orphan with no registry ID).
3. Previous "Games without a guide doc" list incorrectly included cat_forest (cat-forest.md exists) and omitted some rows; lists rebuilt from actual project/games/*.md files.

## Notes

Detailed per-game lifecycle/state/audio/perf/learning audit deferred to task 394. This matrix records structural coverage only.
