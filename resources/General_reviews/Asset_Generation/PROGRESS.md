# Petra's World — Asset Generation Progress

This file is the single progress tracker for the emoticon replacement project. Update it as source inventory, user approvals, generation, and QA proceed.

## Current phase

**Phase 1 — Source audit and inventory.** A literal pictograph scan has now been run across the first-party runtime JS/MJS/HTML/CSS/JSON files in `game/` (excluding the third-party minified Three.js bundle). The inventory has been expanded and duplicate asset IDs consolidated. It remains a review draft: every candidate's visual role and render scale still need final semantic verification and user approval. One generated object candidate (`object-bone`) has been user-approved as an illustration candidate and recorded below; it is not yet designated production-ready.

## Fixed decisions

- [x] Use the exact user-supplied brown bear as the main style reference.
- [x] Use the exact user-supplied plain golden star as the matching secondary reference.
- [x] Keep Explorer character sprites and animation frames unchanged; only consider other emoticons in that game.
- [x] Keep Kitty character sprites and animation frames unchanged; only consider other emoticons in that game.
- [x] In 3D Racing, replace only emoji glyphs; preserve 3D models, geometry, environment, and rendering.
- [x] Preserve suitable existing illustrations; do not regenerate assets just to make them new.
- [x] Keep standard interface controls as SVG/CSS icons or text where appropriate.
- [x] Store project documentation and prompts in `resources/`; approved runtime assets only in `game/`.
- [x] Run literal emoji/pictograph scan across first-party runtime JS/MJS/HTML/CSS/JSON files under `game/` (excluding third-party minified Three.js).
- [x] Add initial source-confirmed candidates from animals, animal counting, candy, sorting, spatial, classroom, sequencing, rhythm, piano, maze, animal puzzle, adventure-mode fish, shared celebration, and 3D Racing page UI.
- [x] Enumerate the emoji-backed Serbian phonics data and identify dynamic compare/adventure/world-theme pools; final semantic/render-path verification remains.
- [x] Scan canonical `game/` pages, game modules, shared modules, CSS, manifests, and runtime configs for literal pictographs; comments/docs and generated values require judgment.
- [ ] User approves final asset inventory.
- [ ] Generate and review first small test batch.
- [ ] User approves the test batch against the fixed references.
- [ ] Generate remaining approved assets in manageable batches.
- [ ] Run image transparency, dimensions, file-size, naming, and visual consistency checks.
- [ ] Prepare final implementation handoff for implementation AI.
- [ ] Implementation AI swaps only the approved emoji render sites and runs regression checks.

## Source-confirmed starting findings

### 3D Racing — `game/pages/racing3d.html`

- [x] 🏎️ page title decoration — review whether to keep as a small illustration or remove.
- [x] 🌸 flower counter — review for a small matching flower asset.
- [x] 🌍 world selector icon — prefer a consistent UI icon or small simple illustration; reuse it wherever repeated.
- [x] 🔊 / 🔇 music state — UI icon task, not watercolor illustration.
- [x] 🏁 win/start finish decoration — review for a small matching flag asset or remove decoration.
- [x] ➡️ next-world arrow — UI icon task, not watercolor illustration.
- [x] 🔄 restart arrow — UI icon task, not watercolor illustration.
- [x] 🏎️ favicon — app-icon task, not part of the object asset batch.
- [x] Audit `game/games/racing3d.mjs` render/UI path. Confirmed emoji UI glyphs (e.g. sound state/finish fallback); 3D pickups/obstacles are mesh geometry and remain out of scope.

## Batch log

| Batch | Scope | Status | Notes |
|---|---|---|---|
| B0 | Source audit and inventory | IN PROGRESS | Inventory v0.4 has expanded source coverage and deduplicated repeated asset IDs. Literal scan completed; semantic candidate approval is still pending. |
| B1 | 1–3 test objects selected from approved inventory | NOT STARTED | Wait for user approval of final inventory. |
| B2+ | Small generation batches | NOT STARTED | Avoid wasting free-tier image generations; do not regenerate approved assets. |
| QA | Transparency, dimensions, consistency, runtime/offline checks | NOT STARTED | Use approved assets only. |
| Handoff | Asset map and implementation instructions | NOT STARTED | Final handoff must list exact source render sites and filenames. |

## Asset status ledger

### Next-session handoff — 2026-10-26

- **Next asset:** `object-parrot` / `parrot.png`.
- **Prompt already prepared:** `prompts/parrot.md`; do not rewrite it before retrying.
- **References already selected:** `bear.png`, `star.png`, `bird.png`.
- **Current state:** dry run passed, but both live requests returned Cloudflare HTTP 429/code 4006; no `parrot.png` was created and no inventory approval record exists yet.
- **Resume rule:** retry the existing prompt, then run technical QA and visual review. Only after user approval update the inventory, QA table, style-bible exemplar, status, commit and push.

Add one row per asset. Keep this table synchronized with the inventory.

## Prompt coverage audit and generation handoff — 2026-10-26

- All currently approved-for-generation queue entries through `cactus.png` have matching briefs in `prompts/`.
- The only prompt without a WIP PNG is `prompts/parrot.md`. Retry it first after Cloudflare recharges, using `bear.png`, `star.png` and `bird.png`.
- `soap`, `sunflower`, `butterfly`, `acorn`, `mushroom` and `egg` already have measured PNGs but remain visual-review-pending; they are not a generation queue.
- Do not generate rows marked `REVIEW` or visual-review-pending. After each generated image, run technical QA and wait for user visual approval before updating inventory/status and moving on.
- Command template: `node tools/asset_generate.js --prompt resources/General_reviews/Asset_Generation/prompts/<name>.md --out resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/<name>.png --creds "tools/vendor/Cloudflare-credentials,json" --dry-run`; repeat without `--dry-run` only after preflight.

## Prompt preparation batch — 2026-10-26

The user requested preparatory briefs for these post-parrot candidates. These files are **prepared only**, not generated, reviewed, user-approved, production-ready or integrated:

`satellite.md`, `telescope.md`, `ice-cube.md`, `comet.md`, `ball.md`, `pine-tree.md`, `mountain.md`, `beach-umbrella.md`, `surfboard.md`, `wave.md`, `skis.md`, `skier.md`, `evergreen-lantern.md`, `grass.md`, `spaceship.md`, `sun.md`, `sunrise.md`, `sunset.md`, `clock.md`, `bell.md`, `cards-pattern.md`, `school.md`, `notebook.md`, `puzzle-piece.md`, `basket.md`, `compass.md`, `pencil.md`, `medal.md`, `rainbow.md`.

`bell.md` is the shared brief for both `object-bell` and `object-music-bell`. Before each future generation, re-check the current inventory row, duplicate/reuse options and whether SVG/CSS is more suitable; do not spend Cloudflare quota on rows that remain review-only or are better implemented as UI geometry.

### Required generation handoff

1. Start with the blocked `parrot.md` retry, then process the 29 briefs above in order, strictly one image at a time.
2. For each candidate: preflight, dry-run, generate, run technical QA, present the image for explicit user visual approval, and only then update inventory/progress/style-bible records.
3. After each approved candidate, commit the image and documentation and push to `main`. The commit message must include `Agent: <tool>/<model>`.
4. Do not batch-generate, mark generated files user-approved without review, copy assets into `game/`, swap runtime glyphs, or run runtime integration as part of this generation task.

| Asset ID | Replaces glyph / current visual | Used by | Prompt/reference saved? | File | Status | QA / notes |
|---|---|---|---|---|---|---|
| `object-bone` | 🦴 | `game/games/spatial.js` — “Where is the bone?” task | Prompt was generated in chat; no separate prompt file verified | `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/bone.png` | GENERATED / USER-APPROVED CANDIDATE | User praised the result and reported adding it to the repo; production readiness, transparency, dimensions, file size, and in-game scale not independently checked |
| `object-sailboat` | ⛵ | `game/data/serbian.js:35` — `Чамац` phonics picture | `prompts/sailboat.md`; bear + star + bone | `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/sailboat.png` | GENERATED / USER-APPROVED CANDIDATE | 1024x1024 RGB, opaque; small-size contrast 50.34; palette-match 0.6871; visual approval 2026-10-25 |
| `object-sweater` | 🧥 | `game/data/serbian.js:36` — `Џемпер` phonics picture | `prompts/sweater.md`; bear + star + bone | `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/sweater.png` | GENERATED / USER-APPROVED CANDIDATE | 1024x1024 RGB, opaque; small-size contrast 101.25; palette-match 0.0113; visual approval 2026-10-25 |
| `object-hat` | 🎩 | `game/data/serbian.js:37` — `Шешир` phonics picture | `prompts/hat.md`; bear + star + bone | `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/hat.png` | GENERATED / USER-APPROVED CANDIDATE | 1024x1024 RGB, opaque; small-size contrast 91.88; palette-match 0.6907; visual approval 2026-10-25 |
| `object-tractor` | 🚜 | `animal_puzzle.js` farm scene and `racing-config.js` farm decor | `prompts/tractor.md`; bear + star + bone | `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/tractor.png` | GENERATED / USER-APPROVED CANDIDATE | 1024x1024 RGB, opaque; small-size contrast 111.85; palette-match 0.0465; red retry visually approved 2026-10-25 |
| `object-rocket` | 🚀 | `animal_puzzle.js`, space game and hub artwork | `prompts/rocket.md`; bear + star + bone | `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/rocket.png` | GENERATED / USER-APPROVED CANDIDATE | 1024x1024 RGB, opaque; small-size contrast 62.5; palette-match 0.6768; visual approval 2026-10-25 |
| `object-planet` | 🪐 | `animal_puzzle.js`, driving/space/racing decor | `prompts/planet.md`; bear + star + bone | `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/planet.png` | GENERATED / USER-APPROVED CANDIDATE | 1024x1024 RGB, opaque; small-size contrast 65.1; palette-match 0.3019; visual approval 2026-10-25 |
| `object-astronaut` | 👨‍🚀 | `animal_puzzle.js` space puzzle | `prompts/astronaut.md`; bear + star + student | `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/astronaut.png` | GENERATED / USER-APPROVED CANDIDATE | 1024x1024 RGB, opaque; small-size contrast 58.92; palette-match 0.1591; visual approval 2026-10-25 |
| `object-snowman` | ⛄ | `animal_puzzle.js` winter puzzle and driving/racing decor | `prompts/snowman.md`; bear + star + bone | `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/snowman.png` | GENERATED / USER-APPROVED CANDIDATE | 1024x1024 RGB, opaque; small-size contrast 40.91; palette-match 0.0634; visual approval 2026-10-25 |
| `object-sled` | 🛷 | `animal_puzzle.js` winter puzzle | `prompts/sled.md`; bear + star + bone | `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/sled.png` | GENERATED / USER-APPROVED CANDIDATE | 1024x1024 RGB, opaque; small-size contrast 81.72; palette-match 0.0137; visual approval 2026-10-26 |
| `object-birthday-cake` | 🎂 | `game/data/serbian.js:29` phonics picture and `piano.js` birthday song label | `prompts/birthday-cake.md`; bear + star + bone | `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/birthday-cake.png` | GENERATED / USER-APPROVED CANDIDATE | 1024x1024 RGB, opaque; small-size contrast 52.5; palette-match 0.0602; visual approval 2026-10-26 |
| `object-balloons` | 🎈 | `game/games/compare.js` comparison object | `prompts/balloons.md`; bear + star + bone | `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/balloons.png` | GENERATED / USER-APPROVED CANDIDATE | 1024x1024 RGB, opaque; small-size contrast 47.79; palette-match 0.661; visual approval 2026-10-26 |
| `object-season-leaf` | 🍂 | `classroom.html` seasons activity and `racing-config.js` scenery | `prompts/season-leaf.md`; bear + star | `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/season-leaf.png` | GENERATED / USER-APPROVED CANDIDATE | 1024x1024 RGB, opaque; small-size contrast 95.34; palette-match 0.698; visual approval 2026-10-26 |
| `object-shell` | 🐚 | ocean, driving, Kitty and racing collectible/scenery uses | `prompts/shell.md`; bear + star + bone | `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/shell.png` | GENERATED / USER-APPROVED CANDIDATE | 1024x1024 RGB, opaque; small-size contrast 39.7; palette-match 0.6028; visual approval 2026-10-26 |
| `object-gem` | 💎 | dino/ocean collectible themes | `prompts/gem.md`; bear + star + bone | `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/gem.png` | GENERATED / USER-APPROVED CANDIDATE | 1024x1024 RGB, opaque; small-size contrast 47.46; palette-match 0.0115; visual approval 2026-10-26 |
| `object-moon` | 🌙 | classroom, driving/dino/ocean/space collectible/theme uses | `prompts/moon.md`; bear + star + bone | `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/moon.png` | GENERATED / USER-APPROVED CANDIDATE | 1024x1024 RGB, opaque; small-size contrast 26.03; palette-match 0.6799; visual approval 2026-10-26 |
| `object-candy-lollipop` | 🍭 | `driving.js` and `racing-config.js` collectible/candy scenery | `prompts/lollipop.md`; bear + star + bone | `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/lollipop.png` | GENERATED / USER-APPROVED CANDIDATE | 1024x1024 RGB, opaque; small-size contrast 60.04; palette-match 0.1269; visual approval 2026-10-26 |
| `object-candy-wrapped` / `object-wrapped-candy` | 🍬 | `racing-config.js` candy-world scenery/decor | `prompts/wrapped-candy.md`; `candy.jpeg` subject + bear + star + bone style references | `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/wrapped-candy.png` | GENERATED / USER-APPROVED CANDIDATE | 1024x1024 RGB, opaque; small-size contrast 84.32; palette-match 0.6687; visual approval 2026-10-26 |
| `object-cupcake` | 🧁 | `racing-config.js` candy-world scenery/decor | `prompts/cupcake.md`; bear + star + bone | `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/cupcake.png` | GENERATED / USER-APPROVED CANDIDATE | 1024x1024 RGB, opaque; small-size contrast 43.46; palette-match 0.0272; visual approval 2026-10-26 |
| `object-donut` | 🍩 | `racing-config.js` candy-world scenery/decor | `prompts/donut.md`; bear + star + bone | `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/donut.png` | GENERATED / USER-APPROVED CANDIDATE | 1024x1024 RGB, opaque; small-size contrast 57.29; palette-match 0.7075; visual approval 2026-10-26 |
| `object-candy-rice` | 🍡 | `racing-config.js` candy-world scenery/decor | `prompts/dango.md`; bear + star + bone | `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/dango.png` | GENERATED / USER-APPROVED CANDIDATE | 1024x1024 RGB, opaque; small-size contrast 17.96; palette-match 0.4033; visual approval 2026-10-26 |
| `object-palm-tree` | 🌴 | driving, Kitty and racing island/tropical scenery | `prompts/palm-tree.md`; bear + star + bone | `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/palm-tree.png` | GENERATED / USER-APPROVED CANDIDATE | 1024x1024 RGB, opaque; small-size contrast 71.58; palette-match 0.054; visual approval 2026-10-26 |
| `object-island` | 🏝️ | dino island collectible/theme visual | `prompts/island.md`; bear + star + bone | `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/island.png` | GENERATED / USER-APPROVED CANDIDATE | 1024x1024 RGB, opaque; small-size contrast 51.31; palette-match 0.6802; visual approval 2026-10-26 |
| `object-volcano` | 🌋 | dino volcano collectible/theme visual | `prompts/volcano.md`; bear + star + bone | `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/volcano.png` | GENERATED / USER-APPROVED CANDIDATE | 1024x1024 RGB, opaque; small-size contrast 166.75; palette-match 0.548; visual approval 2026-10-26 |
| `object-cactus` | 🌵 | driving and dino desert-theme collectibles | `prompts/cactus.md`; bear + star + bone | `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/cactus.png` | GENERATED / USER-APPROVED CANDIDATE | 1024x1024 RGB, opaque; small-size contrast 60.11; palette-match 0.0089; visual approval 2026-10-26 |

## Asset update — 2026-10-26 — cactus approved

- [x] **Preflight.** `object-cactus` is the shared `🌵` desert-theme collectible candidate for driving and dino; no matching raster asset existed.
- [x] **Brief written:** `prompts/cactus.md` — one upright rounded green saguaro with a tall central column, exactly two arms, and restrained pale spines.
- [x] **Reference set:** `bear.png`, `star.png` and `bone.png` as style/detail references.
- [x] **Generated:** `assets_work_in_progress_bundle/cactus.png`, 1024x1024 RGB, opaque, 1191634 bytes.
- [x] **Technical QA:** palette 227.53/225.85/216.26, palette-match 0.0089, small-size contrast 60.11.
- [x] **User review: APPROVED 2026-10-26.** The inventory row is now `GENERATED / USER-APPROVED / TECHNICAL QA MEASURED`.
- [ ] **Not done here:** no copy into `game/assets/images/`, no glyph swap, no new smoke, no screenshot refresh, no offline pack, no `sync-docs.sh` — `game/` was not touched.

## Asset update — 2026-10-26 — volcano approved

- [x] **Preflight.** `object-volcano` is the `🌋` dino collectible/theme visual candidate; no matching raster asset existed.
- [x] **Brief revised after review.** The first candidate was rejected because the cone needed to be taller with more lava; `prompts/volcano.md` now requires a noticeably tall cone, a larger lava pool and several broad lava flows.
- [x] **Generated retry:** `assets_work_in_progress_bundle/volcano.png`, 1024x1024 RGB, opaque, 1333656 bytes.
- [x] **Technical QA:** palette 214.4/202.58/197.52, palette-match 0.548, small-size contrast 166.75.
- [x] **User review: APPROVED 2026-10-26.** The inventory row is now `GENERATED / USER-APPROVED / TECHNICAL QA MEASURED`.
- [ ] **Not done here:** no copy into `game/assets/images/`, no glyph swap, no new smoke, no screenshot refresh, no offline pack, no `sync-docs.sh` — `game/` was not touched.

## Asset update — 2026-10-26 — island approved

- [x] **Preflight.** `object-island` is the `🏝️` dino island collectible/theme visual candidate; no matching raster asset existed.
- [x] **Brief written:** `prompts/island.md` — one centered sandy island mound with shallow blue water edge and one palm tree; no horizon or scene.
- [x] **Reference set:** `bear.png`, `star.png` and `bone.png` as style/detail references.
- [x] **Generated:** `assets_work_in_progress_bundle/island.png`, 1024x1024 RGB, opaque, 773379 bytes.
- [x] **Technical QA:** palette 240.98/243.75/241.34, palette-match 0.6802, small-size contrast 51.31.
- [x] **User review: APPROVED 2026-10-26.** The inventory row is now `GENERATED / USER-APPROVED / TECHNICAL QA MEASURED`.
- [ ] **Not done here:** no copy into `game/assets/images/`, no glyph swap, no new smoke, no screenshot refresh, no offline pack, no `sync-docs.sh` — `game/` was not touched.

## Asset update — 2026-10-26 — palm tree approved

- [x] **Preflight.** `object-palm-tree` is the shared `🌴` tropical scenery/collectible-context candidate for driving, Kitty and racing; no matching raster asset existed.
- [x] **Brief written:** `prompts/palm-tree.md` — one centered curved brown trunk with a crown of five broad green fronds; no island or scene.
- [x] **Reference set:** `bear.png`, `star.png` and `bone.png` as style/detail references.
- [x] **Generated:** `assets_work_in_progress_bundle/palm-tree.png`, 1024x1024 RGB, opaque, 1112050 bytes.
- [x] **Technical QA:** palette 224.19/225.67/222.44, palette-match 0.054, small-size contrast 71.58.
- [x] **User review: APPROVED 2026-10-26.** The inventory row is now `GENERATED / USER-APPROVED / TECHNICAL QA MEASURED`.
- [ ] **Not done here:** no copy into `game/assets/images/`, no glyph swap, no new smoke, no screenshot refresh, no offline pack, no `sync-docs.sh` — `game/` was not touched.

## Asset update — 2026-10-26 — dango approved

- [x] **Preflight.** `object-candy-rice` is the shared `🍡` dango/skewer candidate for racing candy-world scenery; no matching raster asset existed.
- [x] **Brief written:** `prompts/dango.md` — exactly three pale pink, cream and mint dumplings on one short wooden skewer.
- [x] **Reference set:** `bear.png`, `star.png` and `bone.png` as style/detail references.
- [x] **Generated:** `assets_work_in_progress_bundle/dango.png`, 1024x1024 RGB, opaque, 1086541 bytes.
- [x] **Technical QA:** palette 241.39/239.17/234.73, palette-match 0.4033, small-size contrast 17.96.
- [x] **User review: APPROVED 2026-10-26.** The inventory row is now `GENERATED / USER-APPROVED / TECHNICAL QA MEASURED`.
- [ ] **Not done here:** no copy into `game/assets/images/`, no glyph swap, no new smoke, no screenshot refresh, no offline pack, no `sync-docs.sh` — `game/` was not touched.

## Asset update — 2026-10-26 — donut approved

- [x] **Preflight.** `object-donut` is the shared `🍩` candy-world scenery/decor candidate for racing; no matching raster asset existed.
- [x] **Brief written:** `prompts/donut.md` — one centered ring donut with a golden base, pink icing cap, and restrained sprinkles.
- [x] **Reference set:** `bear.png`, `star.png` and `bone.png` as style/detail references.
- [x] **Generated:** `assets_work_in_progress_bundle/donut.png`, 1024x1024 RGB, opaque, 780727 bytes.
- [x] **Technical QA:** palette 248.25/239.45/235.69, palette-match 0.7075, small-size contrast 57.29.
- [x] **User review: APPROVED 2026-10-26.** The inventory row is now `GENERATED / USER-APPROVED / TECHNICAL QA MEASURED`.
- [ ] **Not done here:** no copy into `game/assets/images/`, no glyph swap, no new smoke, no screenshot refresh, no offline pack, no `sync-docs.sh` — `game/` was not touched.

## Asset update — 2026-10-26 — cupcake approved

- [x] **Preflight.** `object-cupcake` is the shared `🧁` candy-world scenery/decor candidate for racing; no matching raster asset existed.
- [x] **Brief written:** `prompts/cupcake.md` — one centered cupcake with a golden cake base, paper wrapper, pink frosting swirl and one small topping.
- [x] **Reference set:** `bear.png`, `star.png` and `bone.png` as style/detail references.
- [x] **Generated:** `assets_work_in_progress_bundle/cupcake.png`, 1024x1024 RGB, opaque, 1360216 bytes.
- [x] **Technical QA:** palette 237.62/227.06/215.82, palette-match 0.0272, small-size contrast 43.46.
- [x] **User review: APPROVED 2026-10-26.** The inventory row is now `GENERATED / USER-APPROVED / TECHNICAL QA MEASURED`.
- [ ] **Not done here:** no copy into `game/assets/images/`, no glyph swap, no new smoke, no screenshot refresh, no offline pack, no `sync-docs.sh` — `game/` was not touched.

## Asset update — 2026-10-26 — wrapped candy approved

- [x] **Preflight.** `object-candy-wrapped` and the duplicate `object-wrapped-candy` row identify the same `🍬` candy-world scenery/decor asset; the first candidate was rejected because its silhouette did not match the requested candy.
- [x] **Brief revised:** `prompts/wrapped-candy.md` now uses `Reference/candy.jpeg` as the subject reference for the elongated diagonal candy, pink/red bands, and fan-shaped twisted ends; bear, star and bone remain style references.
- [x] **Generated retry:** `assets_work_in_progress_bundle/wrapped-candy.png`, 1024x1024 RGB, opaque, 1367931 bytes.
- [x] **Technical QA:** palette 243.92/223.14/222.84, palette-match 0.6687, small-size contrast 84.32.
- [x] **User review: APPROVED 2026-10-26.** Both matching inventory rows are now `GENERATED / USER-APPROVED / TECHNICAL QA MEASURED`.
- [ ] **Not done here:** no copy into `game/assets/images/`, no glyph swap, no new smoke, no screenshot refresh, no offline pack, no `sync-docs.sh` — `game/` was not touched.

## Asset update — 2026-10-26 — lollipop approved

- [x] **Preflight.** `object-candy-lollipop` is the shared `🍭` collectible/candy scenery candidate for driving and racing; no matching raster asset existed.
- [x] **Brief written:** `prompts/lollipop.md` — one centered red-and-cream spiral lollipop on a short white stick; no wrapper, scene, face, or extra candy.
- [x] **Reference set:** `bear.png`, `star.png` and `bone.png` as style/detail references.
- [x] **Generated:** `assets_work_in_progress_bundle/lollipop.png`, 1024x1024 RGB, opaque, 1320199 bytes.
- [x] **Technical QA:** palette 234.96/226.43/221.98, palette-match 0.1269, small-size contrast 60.04.
- [x] **User review: APPROVED 2026-10-26.** The inventory row is now `GENERATED / USER-APPROVED / TECHNICAL QA MEASURED`.
- [ ] **Not done here:** no copy into `game/assets/images/`, no glyph swap, no new smoke, no screenshot refresh, no offline pack, no `sync-docs.sh` — `game/` was not touched.

## Asset update — 2026-10-26 — moon approved

- [x] **Preflight.** `object-moon` is the shared `🌙` gameplay object/theme candidate; existing 3D/procedural moon geometry and classroom toggle icon remain separate, and no matching raster asset existed.
- [x] **Brief written:** `prompts/moon.md` — one centered broad pale-golden crescent with soft painted shading; no face or space scene.
- [x] **Reference set:** `bear.png`, `star.png` and `bone.png` as style/detail references.
- [x] **Generated:** `assets_work_in_progress_bundle/moon.png`, 1024x1024 RGB, opaque, 487133 bytes.
- [x] **Technical QA:** palette 253.16/250.81/244.59, palette-match 0.6799, small-size contrast 26.03.
- [x] **User review: APPROVED 2026-10-26.** The inventory row is now `GENERATED / USER-APPROVED / TECHNICAL QA MEASURED`.
- [ ] **Not done here:** no copy into `game/assets/images/`, no glyph swap, no new smoke, no screenshot refresh, no offline pack, no `sync-docs.sh` — `game/` was not touched.

## Asset update — 2026-10-26 — gem approved

- [x] **Preflight.** `object-gem` is the shared `💎` collectible candidate in dino/ocean themes; existing 3D/procedural gem geometry remains separate and no matching raster asset existed.
- [x] **Brief written:** `prompts/gem.md` — one centered upright teal faceted gemstone with broad top facet, pointed lower tip and no jewelry or scene.
- [x] **Reference set:** `bear.png` and `star.png` as canonical style anchors, `bone.png` as the approved simple-object exemplar.
- [x] **Generated:** `assets_work_in_progress_bundle/gem.png`, 1024x1024 RGB, opaque, 1390254 bytes.
- [x] **Technical QA:** palette 227.57/229.98/224.62, palette-match 0.0115, small-size contrast 47.46.
- [x] **User review: APPROVED 2026-10-26.** The inventory row is now `GENERATED / USER-APPROVED / TECHNICAL QA MEASURED`.
- [ ] **Not done here:** no copy into `game/assets/images/`, no glyph swap, no new smoke, no screenshot refresh, no offline pack, no `sync-docs.sh` — `game/` was not touched.

## Asset update — 2026-10-26 — shell approved

- [x] **Preflight.** `object-shell` is the shared `🐚` collectible/scenery candidate; existing 3D racing shell geometry is separate and no matching 2D raster asset existed.
- [x] **Brief written:** `prompts/shell.md` — one centered warm cream/peach/coral seashell with a rounded spiral/fluted ridge and no beach scene.
- [x] **Reference set:** `bear.png` and `star.png` as canonical style anchors, `bone.png` as the approved simple-object exemplar.
- [x] **Generated:** `assets_work_in_progress_bundle/shell.png`, 1024x1024 RGB, opaque, 1278997 bytes.
- [x] **Technical QA:** palette 245.13/235.86/226.56, palette-match 0.6028, small-size contrast 39.7.
- [x] **User review: APPROVED 2026-10-26.** The inventory row is now `GENERATED / USER-APPROVED / TECHNICAL QA MEASURED`.
- [ ] **Not done here:** no copy into `game/assets/images/`, no glyph swap, no new smoke, no screenshot refresh, no offline pack, no `sync-docs.sh` — `game/` was not touched.

## Asset update — 2026-10-26 — season leaf approved

- [x] **Preflight.** `object-season-leaf` is the `🍂` seasonal/racing gameplay visual candidate; no suitable standalone autumn leaf asset existed.
- [x] **Brief written:** `prompts/season-leaf.md` — one centered orange-red lobed autumn leaf with stem and simple veins; no tree, branch, leaf pile, or scene.
- [x] **Generation:** first three-reference request timed out with no output; a targeted retry using `bear.png` and `star.png` succeeded.
- [x] **Generated:** `assets_work_in_progress_bundle/season-leaf.png`, 1024x1024 RGB, opaque, 1147301 bytes.
- [x] **Technical QA:** palette 244.76/226.79/216.96, palette-match 0.698, small-size contrast 95.34.
- [x] **User review: APPROVED 2026-10-26.** The inventory row is now `GENERATED / USER-APPROVED / TECHNICAL QA MEASURED`.
- [ ] **Not done here:** no copy into `game/assets/images/`, no glyph swap, no new smoke, no screenshot refresh, no offline pack, no `sync-docs.sh` — `game/` was not touched.

## Asset update — 2026-10-26 — balloon approved

- [x] **Preflight.** `object-balloons` is the `🎈` comparison object in `game/games/compare.js`; no existing suitable balloon asset or prompt was found.
- [x] **Brief written:** `prompts/balloons.md` — one centered rounded party balloon with tied knot and thin string; no bunch or party scene.
- [x] **Reference set:** `bear.png` and `star.png` as canonical style anchors, `bone.png` as the approved simple-object exemplar.
- [x] **Generated:** `assets_work_in_progress_bundle/balloons.png`, 1024x1024 RGB, opaque, 957739 bytes.
- [x] **Technical QA:** palette 246.87/238.72/235.34, palette-match 0.661, small-size contrast 47.79.
- [x] **User review: APPROVED 2026-10-26.** The inventory row is now `GENERATED / USER-APPROVED / TECHNICAL QA MEASURED`.
- [ ] **Not done here:** no copy into `game/assets/images/`, no glyph swap, no new smoke, no screenshot refresh, no offline pack, no `sync-docs.sh` — `game/` was not touched.

## Asset update — 2026-10-26 — birthday cake approved

- [x] **Preflight.** `object-birthday-cake` is the `🎂` phonics picture for `Торта` and the birthday-song label; no existing suitable cake asset or prompt was found.
- [x] **Brief written:** `prompts/birthday-cake.md` — one centered single-tier cake with cream frosting, pink/golden cake layer, icing drips and three candles; no extra props or scene.
- [x] **Reference set:** `bear.png` and `star.png` as canonical style anchors, `bone.png` as the approved simple-object exemplar.
- [x] **Generated:** `assets_work_in_progress_bundle/birthday-cake.png`, 1024x1024 RGB, opaque, 1274706 bytes.
- [x] **Technical QA:** palette 241.39/230.34/218.63, palette-match 0.0602, small-size contrast 52.5.
- [x] **User review: APPROVED 2026-10-26.** The inventory row is now `GENERATED / USER-APPROVED / TECHNICAL QA MEASURED`.
- [ ] **Not done here:** no copy into `game/assets/images/`, no glyph swap, no new smoke, no screenshot refresh, no offline pack, no `sync-docs.sh` — `game/` was not touched.

## Asset update — 2026-10-26 — sled approved

- [x] **Preflight.** `object-sled` is the winter-puzzle `🛷` pictograph; no existing sled asset or prompt was found.
- [x] **Brief written:** `prompts/sled.md` — one centered side-facing wooden sled with two curved runners, slatted seat, supports and pull rope; no snow scene.
- [x] **Reference set:** `bear.png` and `star.png` as canonical style anchors, `bone.png` as the approved simple-object exemplar.
- [x] **Generated:** `assets_work_in_progress_bundle/sled.png`, 1024x1024 RGB, opaque, 1373400 bytes.
- [x] **Technical QA:** palette 229.4/221.01/212.39, palette-match 0.0137, small-size contrast 81.72.
- [x] **User review: APPROVED 2026-10-26.** The inventory row is now `GENERATED / USER-APPROVED / TECHNICAL QA MEASURED`.
- [ ] **Not done here:** no copy into `game/assets/images/`, no glyph swap, no new smoke, no screenshot refresh, no offline pack, no `sync-docs.sh` — `game/` was not touched.

## Asset update — 2026-10-25 — snowman approved

- [x] **Preflight.** `object-snowman` is the winter-puzzle and winter-decor `⛄` pictograph; no existing matching snowman asset or prompt was found.
- [x] **Brief written:** `prompts/snowman.md` — one centered three-ball snowman with coal eyes/buttons, carrot nose, twig arms and a simple knitted hat; no winter scene.
- [x] **Reference set:** `bear.png` and `star.png` as canonical style anchors, `bone.png` as the approved simple-object exemplar.
- [x] **Generated:** `assets_work_in_progress_bundle/snowman.png`, 1024x1024 RGB, opaque, 1170201 bytes.
- [x] **Technical QA:** palette 235.79/232.58/228.54, palette-match 0.0634, small-size contrast 40.91.
- [x] **User review: APPROVED 2026-10-25.** The inventory row is now `GENERATED / USER-APPROVED / TECHNICAL QA MEASURED`.
- [ ] **Not done here:** no copy into `game/assets/images/`, no glyph swap, no new smoke, no screenshot refresh, no offline pack, no `sync-docs.sh` — `game/` was not touched.

## Asset update — 2026-10-25 — astronaut approved

- [x] **Preflight.** `object-astronaut` is the space-puzzle `👨‍🚀` pictograph; no existing astronaut asset or prompt was found.
- [x] **Brief written:** `prompts/astronaut.md` — one centered child astronaut with rounded helmet, calm face, cream suit, backpack, gloves and boots; no scene or extra characters.
- [x] **Reference set:** `bear.png` and `star.png` as canonical style anchors, `student.png` as the approved human-figure construction reference.
- [x] **Generated:** `assets_work_in_progress_bundle/astronaut.png`, 1024x1024 RGB, opaque, 1346995 bytes.
- [x] **Technical QA:** palette 234.43/228.96/221.67, palette-match 0.1591, small-size contrast 58.92.
- [x] **User review: APPROVED 2026-10-25.** The inventory row is now `GENERATED / USER-APPROVED / TECHNICAL QA MEASURED`.
- [ ] **Not done here:** no copy into `game/assets/images/`, no glyph swap, no new smoke, no screenshot refresh, no offline pack, no `sync-docs.sh` — `game/` was not touched.

## Asset update — 2026-10-25 — planet approved

- [x] **Preflight.** `object-planet` is the emoji planet object/decor candidate in the puzzle and space/future-world uses; existing procedural planets remain separate runtime geometry, and no matching raster asset existed.
- [x] **Brief written:** `prompts/planet.md` — one centered ringed planet with a round softly shaded body and one simple elliptical ring; no space scene or extra objects.
- [x] **Reference set:** `bear.png` and `star.png` as canonical style anchors, `bone.png` as the approved simple-object exemplar.
- [x] **Generated:** `assets_work_in_progress_bundle/planet.png`, 1024x1024 RGB, opaque, 1139943 bytes.
- [x] **Technical QA:** palette 239.22/228.6/218.39, palette-match 0.3019, small-size contrast 65.1.
- [x] **User review: APPROVED 2026-10-25.** The inventory row is now `GENERATED / USER-APPROVED / TECHNICAL QA MEASURED`.
- [ ] **Not done here:** no copy into `game/assets/images/`, no glyph swap, no new smoke, no screenshot refresh, no offline pack, no `sync-docs.sh` — `game/` was not touched.

## Asset update — 2026-10-25 — rocket approved

- [x] **Preflight.** `object-rocket` is used in the space puzzle, space game artwork, and hub/page decoration; no existing rocket asset or prompt was found.
- [x] **Brief written:** `prompts/rocket.md` — one centered upright rocket with rounded nose, compact body, circular window, two fins and a restrained flame; no astronaut or space scene.
- [x] **Reference set:** `bear.png` and `star.png` as canonical style anchors, `bone.png` as the approved simple-object exemplar.
- [x] **Generated:** `assets_work_in_progress_bundle/rocket.png`, 1024x1024 RGB, opaque, 1124608 bytes.
- [x] **Technical QA:** palette 246.01/237.33/234.2, palette-match 0.6768, small-size contrast 62.5.
- [x] **User review: APPROVED 2026-10-25.** The inventory row is now `GENERATED / USER-APPROVED / TECHNICAL QA MEASURED`.
- [ ] **Not done here:** no copy into `game/assets/images/`, no glyph swap, no new smoke, no screenshot refresh, no offline pack, no `sync-docs.sh` — `game/` was not touched.

## Asset update — 2026-10-25 — tractor approved

- [x] **Preflight.** `object-tractor` is used as farm-puzzle and racing-farm decor; no existing tractor asset or prompt was found.
- [x] **Brief written:** `prompts/tractor.md` — one isolated side-facing farm tractor with a red body, large rear wheel, smaller front wheel, seat, hood and exhaust; no scene or extra vehicles.
- [x] **Generation:** first green candidate was rejected by the user for an incorrect five-wheel appearance; the same WIP file was regenerated with a muted red body and stricter wheel wording.
- [x] **Reference set:** `bear.png` and `star.png` as canonical style anchors, `bone.png` as the approved simple-object exemplar.
- [x] **Technical QA of approved retry:** `tractor.png`, 1024x1024 RGB, opaque, 1413102 bytes; palette 221.75/213.73/205.05, palette-match 0.0465, small-size contrast 111.85.
- [x] **User review: APPROVED 2026-10-25.** The inventory row is now `GENERATED / USER-APPROVED / TECHNICAL QA MEASURED`.
- [ ] **Not done here:** no copy into `game/assets/images/`, no glyph swap, no new smoke, no screenshot refresh, no offline pack, no `sync-docs.sh` — `game/` was not touched.

## Asset update — 2026-10-25 — hat approved

- [x] **Preflight.** `object-hat` is the `🎩` phonics picture for `Шешир` in `game/data/serbian.js:37`; no existing hat asset or prompt was found.
- [x] **Brief written:** `prompts/hat.md` — one centered brimmed hat with a rounded crown and broad curved brim; no person, mannequin, decoration, text, or scene.
- [x] **Reference set:** `bear.png` and `star.png` as canonical style anchors, `bone.png` as the approved simple-object exemplar.
- [x] **Generated:** `assets_work_in_progress_bundle/hat.png`, 1024x1024 RGB, opaque, 815709 bytes.
- [x] **Technical QA:** palette 244.71/233.76/219.52, palette-match 0.6907, small-size contrast 91.88.
- [x] **User review: APPROVED 2026-10-25.** The inventory row is now `GENERATED / USER-APPROVED / TECHNICAL QA MEASURED`.
- [ ] **Not done here:** no copy into `game/assets/images/`, no glyph swap, no new smoke, no screenshot refresh, no offline pack, no `sync-docs.sh` — `game/` was not touched.

## Asset update — 2026-10-25 — sweater approved

- [x] **Preflight.** `object-sweater` is the `🧥` phonics picture for `Џемпер` in `game/data/serbian.js:36`; no existing sweater asset or prompt was found.
- [x] **Brief written:** `prompts/sweater.md` — one centered front-facing knitted pullover with crew neckline, sleeves, ribbed cuffs and hem; no person, mannequin, hood, buttons, text, or scene.
- [x] **Reference set:** `bear.png` and `star.png` as canonical style anchors, `bone.png` as the approved simple-object exemplar.
- [x] **Generated:** `assets_work_in_progress_bundle/sweater.png`, 1024x1024 RGB, opaque, 1384417 bytes.
- [x] **Technical QA:** palette 212.01/214.85/207.6, palette-match 0.0113, small-size contrast 101.25.
- [x] **User review: APPROVED 2026-10-25.** The inventory row is now `GENERATED / USER-APPROVED / TECHNICAL QA MEASURED`.
- [ ] **Not done here:** no copy into `game/assets/images/`, no glyph swap, no new smoke, no screenshot refresh, no offline pack, no `sync-docs.sh` — `game/` was not touched.

## Asset update — 2026-10-25 — sailboat approved

- [x] **Preflight.** `object-sailboat` is the `⛵` phonics picture for `Чамац` in `game/data/serbian.js:35`; no existing sailboat asset or prompt was found.
- [x] **Brief written:** `prompts/sailboat.md` — one centered, clearly recognizable compact sailboat with a side-view hull, one triangular sail, short mast, and simple keel/rudder detail; no scenery, text, face, or extra objects.
- [x] **Reference set:** `bear.png` and `star.png` as canonical style anchors, `bone.png` as the approved simple-object exemplar.
- [x] **Generated:** `assets_work_in_progress_bundle/sailboat.png`, 1024x1024 RGB, opaque, 779921 bytes.
- [x] **Technical QA:** palette 233.14/233.58/229.69, palette-match 0.6871, small-size contrast 50.34.
- [x] **User review: APPROVED 2026-10-25.** The inventory row is now `GENERATED / USER-APPROVED / TECHNICAL QA MEASURED`.
- [ ] **Not done here:** no copy into `game/assets/images/`, no glyph swap, no new smoke, no screenshot refresh, no offline pack, no `sync-docs.sh` — `game/` was not touched.

## Decisions / issues

- The broad preliminary inventory document was intentionally superseded by the narrower emoticon-only scope. Do not generate all of its speculative candidates.
- The exact original reference image files should be stored in `references/` before production generation if they are not already available as project files.
- Source inventory must distinguish emoji pictographs from SVG controls, CSS geometry, ordinary text, and actual 3D models.


## Latest source-audit update — 2026-10-11

- [x] Scanned the canonical first-party runtime source/data/page/style/manifest files for literal emoji/pictograph characters.
- [x] Expanded inventory with additional concepts from Serbian phonics, comparison/spatial activities, day/night classroom scenes, seasonal racing scenery, and page-level UI.
- [x] Consolidated duplicate asset IDs and merged their known use sites (including cow glyph variants and repeated shell rows); inventory table IDs are now unique.
- [ ] Manually verify every proposed illustration against actual render scale, semantic teaching purpose, existing PNG assets, and excluded character/3D areas.
- [ ] User approves the final treatment of each row before any generation begins.


## Asset update — 2026-10-16

- [x] Recorded `object-bone` as generated at `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/bone.png` after verifying the path exists on `main`.
- [x] User praised the bone result and reported adding it to the repository; this is recorded as approval of the illustration candidate, not as proof of production QA.
- [ ] Verify image dimensions, file size, alpha/transparency, and visual legibility at the actual spatial-game render size.
- [ ] After QA, decide whether to promote the asset to a production-ready location and update its inventory location accordingly.


## Asset update — 2026-10-18

- [x] Verified commit `bd526899f54940e627a4c5f7c3402e4c9a55b048` adds `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/elephant.png` to `main`.
- [x] Recorded `animal-elephant` in the asset inventory as a **generated, user-approved candidate**.
- [ ] Independently inspect the committed PNG at full size and verify dimensions, file size, alpha/transparency, edge quality, and legibility at the actual animal-flashcard render size.
- [ ] Compare the committed file directly with the canonical bear/star reference images before declaring style QA complete.
- [ ] Decide whether to promote it to a production-ready location after QA; it is not integrated into runtime and is not marked production-ready.
- Note: the user approved the illustration in conversation. That approval does not by itself establish technical QA or runtime integration.


## Animal asset update — 2026-10-18

- [x] Verified on `main` that `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/lion.png` exists (GitHub returned blob SHA `c493a9e7bc3c78d1b177889f6a874dc34a64b895`).
- [x] Verified on `main` that `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/frog.png` exists (GitHub returned blob SHA `3a46c83840b1e0babbcda6eb71de65b621202411`).
- [x] Updated the asset inventory rows for lion and frog to record their WIP paths.
- [ ] Inspect both committed PNG files at full size and verify dimensions, file size, alpha/transparency, edge quality, and legibility at the actual animal-flashcard render size.
- [ ] Compare both images directly with the canonical bear/star references and existing animal candidates.
- [ ] Decide whether either candidate is ready for promotion; neither is marked production-ready or integrated into runtime.
- Note: GitHub's file fetch returned empty Base64 content for lion and frog despite returning blob SHAs. Existence is verified; image bytes and technical properties were not verified by that fetch.

## Animal asset update — 2026-10-19

- [x] Verified that `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/pig.png` exists on `main`; GitHub blob SHA: `ef3e52435f005acd57f06d4ff9eabed4690e3b50`.
- [x] Updated the `animal-pig` inventory row with the confirmed WIP path and status **GENERATED / CANDIDATE — TECHNICAL QA PENDING**.
- [x] Inspected the actual repository image. PNG IHDR reports 1448 × 1086 pixels, 8-bit RGBA (color type 6). The illustration is readable and broadly matches the soft, warm storybook direction.
- [ ] Verify actual alpha values/background transparency, file size, edge quality, and visible colored fringes around the silhouette; RGBA support alone does not prove transparent background pixels.
- [ ] Compare pig directly against the canonical bear/star references and related animal candidates at full size and representative game sizes.
- [ ] Confirm whether the same pig image reads correctly in both counting and candy-game contexts; no runtime integration or game tests were performed as part of this update.
- Status remains a WIP candidate: not marked user-approved, production-ready, or runtime-integrated by this documentation update.

## Animal asset update — 2026-10-19 (horse)

- [x] Verified that `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/horse.png` exists on `main`; GitHub blob SHA: `a00b4f51b379880f7a8d38dc0796e0e2567ade00`.
- [x] Updated the `animal-horse` inventory row with its verified WIP path and status **GENERATED / CANDIDATE — TECHNICAL QA PENDING**.
- [x] Reviewed the generated horse illustration shown in this conversation for subject readability and broad storybook-style fit.
- [ ] Inspect the exact committed PNG bytes at full size and verify dimensions, file size, actual alpha/transparency, edge quality, and any colored fringes. The current GitHub file fetch returned an empty Base64 payload despite confirming the blob/path, so those technical properties remain unverified.
- [ ] Compare the committed horse file directly against the canonical bear/star anchors and other animal candidates at full size and representative in-game sizes.
- [ ] Confirm the horse image's intended rendering contexts (animal memory, candy game, Serbian phonics) and whether its background/crop is suitable in each. No runtime integration or game tests were performed for this update.
- Status remains a WIP candidate; it is not marked production-ready or runtime-integrated.

## Next-asset analysis — chicken vs. existing duck candidate

- **Recommended next action: audit the existing duck candidate before generating another animal.** The inventory already points to `assets_work_in_progress_bundle/duck.png`, so mandatory preflight requires checking whether it can be accepted, refined, or rejected before spending another generation attempt.
- If the duck is not suitable, **chicken** is the next sensible new-animal candidate: current source uses it in counting and candy contexts, and the inventory also has a separate rooster use in the farm puzzle/scenery. Before generating, reconcile whether a single chicken illustration can clearly serve both chicken and rooster contexts or whether those should remain distinct.
- Avoid generating a duplicate chicken until the existing duck file has been inspected and the chicken/rooster semantic decision is recorded. Keep the fixed bear/star references as style anchors; do not treat the horse as a new approved style exemplar until the user explicitly approves the specific image.

## Animal asset update — 2026-10-20 (chicken)

- [x] Verified that `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/chicken.png` exists on `main`; GitHub blob SHA: `ea7c737007bf7d198d8a45e36616c6fb3e86d523`.
- [x] Updated the `animal-chicken` inventory row with the verified WIP path and status **GENERATED / CANDIDATE — TECHNICAL QA PENDING**.
- [x] Reviewed the generated chicken image shown in the conversation: a recognizable, warm watercolor hen with a cream/tan body, red comb/wattle, yellow beak/feet, and cream background. Its feather detail and eye highlights are more pronounced than the canonical bear; consistency at game size still needs review.
- [ ] Inspect the exact committed PNG bytes and verify dimensions, file size, actual alpha/transparency, edge quality, and colored fringes. GitHub confirmed the blob/path, but the file-fetch endpoint returned an empty Base64 payload, so technical image properties cannot be confirmed from that response.
- [ ] Compare the committed chicken file directly against bear/star references and the other animal candidates at full size and representative game sizes.
- [ ] Confirm whether the image is intended only for counting/candy, or whether any rooster-specific farm puzzle/scenery use exists that must remain visually distinct. No runtime integration or tests were performed as part of this documentation update.
- Status remains a WIP candidate: not marked production-ready or runtime-integrated.

## Next-asset analysis — after chicken

- **Recommended next action: audit the existing cow candidate** at `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/cow.png` before generating another image. The inventory shows cow use across animal flashcards, counting, candy, farm puzzle/scenery, and Serbian phonics, so its semantic clarity and scalability are high-value to verify.
- If cow is already accepted in the user's workflow, move to the existing dog/cat candidates rather than generating a duplicate. Preflight should inspect the actual file and check for reuse before any new generation.
- For cow, check recognizability at small card sizes (clear cow face/markings/horns without excess detail), consistency with the bear's low-detail watercolor texture, clean silhouette/background handling, and whether the same art works for both a small icon/card and larger farm-scene use.
- Do not promote any candidate based only on its filename or the user's report that it was added. Keep technical QA and runtime integration as separate statuses.

## Animal asset update — 2026-10-20 (fox)

- [x] Verified that `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/fox.png` exists on `main`; GitHub blob SHA: `45c2f84efbab006f3e98a3fa417db61e91836a3d`; repository-reported file size: 1,615,033 bytes.
- [x] Updated the `animal-fox` inventory row with the confirmed WIP path and status **GENERATED / CANDIDATE — TECHNICAL QA PENDING**.
- [x] Reviewed the generated fox image shown in the conversation: recognizable rust-orange fox, cream muzzle/chest and tail tip, upright ears, four legs, and warm painted texture. Its eyes have conspicuous white highlights and the fur texture/detail is more pronounced than the canonical bear; check visual consistency at game size.
- [ ] Inspect the exact committed PNG bytes for dimensions, alpha-channel/background transparency, edge quality, and colored fringes. The directory listing confirms file size and blob SHA, but technical image inspection of the committed bytes has not been completed.
- [ ] Verify whether fox is actually used by the runtime animal list or only mentioned in smoke-test mapping before integrating it; the current inventory records this as needing confirmation.
- Status remains a WIP candidate: not marked user-approved, production-ready, or runtime-integrated.

## Next-asset analysis — after fox

- **Next candidate: wolf (`animal-wolf`).** The current WIP directory listing was checked on `main`; it contains no `wolf.png`. The inventory records wolf for `game/data/serbian.js` Serbian phonics picture use, so it has a concrete pedagogical use to investigate rather than being a speculative scenery asset.
- Before generating wolf, verify the current source entry and whether an existing wolf illustration is stored elsewhere in the repository; the WIP directory listing alone does not rule out another reusable asset.
- If no suitable existing asset is found, use a single full-body wolf with a calm, non-threatening expression, muted grey-brown fur, cream muzzle/chest, small understated dark eyes, rounded readable silhouette, and soft paper/watercolor texture aligned with the bear reference. Avoid sharp fangs, aggressive posture, glossy oversized eyes, heavy outlines, or highly detailed fur.
- Keep the wolf as a candidate pending file-level technical QA and in-context review. Do not generate an asset already present elsewhere in the repository.

## Animal asset update — 2026-10-20 (wolf)

- [x] Verified that `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/wolf.png` exists on `main`; GitHub blob SHA: `394e557d18912db80db957c431dbccb1c913601e`; repository-reported file size: 2,000,940 bytes.
- [x] Updated the `animal-wolf` inventory row with the confirmed WIP path and status **GENERATED / CANDIDATE — TECHNICAL QA PENDING**.
- [x] Reviewed the generated wolf image shown in the conversation: recognizable full-body grey-brown wolf, cream muzzle/chest, upright ears, fluffy tail, and warm painted finish. The surface has highly repetitive, dense feather-like fur marks and conspicuous white eye highlights, which may depart from the canonical bear's simpler painted surface. Compare at game size before approval.
- [ ] Inspect exact committed PNG bytes for dimensions, alpha channel/background transparency, edge quality, and colored fringes. GitHub confirms the path, blob SHA, and file size; these do not by themselves verify image properties.
- [ ] Confirm the wolf's Serbian phonics data entry and any other runtime uses before integration. No runtime code was changed and no tests were run during this documentation update.
- Status remains a WIP candidate: not marked user-approved, production-ready, or runtime-integrated.

## Next-asset analysis — after wolf

- The current `assets_work_in_progress_bundle/` directory listing on `main` was checked. It contains `apple.png`, `bear.png`, `bone.png`, `cat.png`, `chicken.png`, `cow.png`, `dog.png`, `duck.png`, `elephant.png`, `fish.png`, `fox.png`, `frog.png`, `horse.png`, `lion.png`, `pig.png`, `star.png`, and `wolf.png`. Do not recommend any of these as a new asset unless the user explicitly asks to revise one.
- **Next candidate to investigate: sheep (`animal-sheep`).** No `sheep.png` appears in the current WIP directory listing. The inventory currently marks sheep as `AUDIT` and says it is mentioned in smoke-test mapping; verify actual runtime use and search the rest of the repository for a reusable sheep illustration before generating anything.
- If a new sheep asset is justified, use a clearly readable rounded wool silhouette, muted warm off-white/cream wool, a restrained face with small dark eyes, simple warm-grey/beige face and legs, and subtle watercolor/paper texture. Avoid hundreds of tiny curls, high-contrast outlines, glossy eyes, or fluffy detail that becomes noisy at card size.
- Keep sheep distinct from `animal-chick` and `animal-baby-chick`; they are different learning concepts. Candidate status remains separate from approval, technical QA, and runtime integration.

## Animal asset update — 2026-10-21 (sheep)

- [x] Verified that `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/sheep.png` exists on `main`; GitHub blob SHA: `587a4d094e9d24d33a57b4d0167716a54c12118b`; repository-reported file size: 1,657,084 bytes.
- [x] Updated the `animal-sheep` inventory row with the confirmed WIP path and status **GENERATED / CANDIDATE — TECHNICAL QA PENDING**.
- [x] Reviewed the generated sheep image in the conversation: recognizable full-body sheep with cream wool, tan face and legs, warm painted finish, and a plain light background. Wool texture is dense and eyes have visible highlights; compare with canonical bear at game size before approval.
- [ ] Inspect the exact committed PNG bytes for dimensions, alpha/transparency, edge quality, and colored fringes. GitHub confirms path, blob SHA, and file size; those do not verify the PNG's actual pixel properties.
- [ ] Confirm whether sheep is actually present in a runtime list or only in smoke-test mapping. No runtime code was changed and no tests were run as part of this documentation update.
- Status remains a WIP candidate: not marked user-approved, production-ready, or runtime-integrated.

## Next-asset analysis — after sheep

- The current `assets_work_in_progress_bundle/` directory listing on `main` was checked. Existing PNGs are `apple.png`, `bear.png`, `bone.png`, `cat.png`, `chicken.png`, `cow.png`, `dog.png`, `duck.png`, `elephant.png`, `fish.png`, `fox.png`, `frog.png`, `horse.png`, `lion.png`, `pig.png`, `sheep.png`, `star.png`, and `wolf.png`. Do not recommend any of these as a new asset unless the user explicitly requests a revision.
- **Next candidate to investigate: caterpillar (`animal-caterpillar`).** No `caterpillar.png` is present in the WIP directory listing. The inventory maps it to `game/data/serbian.js` and `sequencing.js` for phonics and life-cycle sequencing.
- Before generating, inspect both runtime uses and search the entire repository for any reusable caterpillar PNG/SVG/illustration outside the WIP folder. Do not infer absence from the WIP folder alone.
- If no suitable reusable asset exists, art direction: a small, friendly caterpillar with a simple curved row of a few rounded segments, muted garden greens with subtle warm variation, tiny understated dark eyes, and a calm expression. Keep the silhouette clean and instantly readable at card size; avoid many tiny legs, hard black outlines, glossy eyes, or a saturated neon palette. For life-cycle sequencing, ensure it reads as a caterpillar rather than a generic worm.
- Keep caterpillar as a candidate pending explicit approval, technical QA, and context review; do not mark it production-ready or integrated merely because a PNG is added.

## Animal asset update — 2026-10-21 (caterpillar)

- [x] Verified that `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/caterpillar.png` exists on `main`; GitHub blob SHA: `94072bc053a92bf6837dcac163aad5910d716ff1`; repository-reported file size: 1,599,296 bytes.
- [x] Updated the `animal-caterpillar` inventory row with the confirmed WIP path and status **GENERATED / CANDIDATE — TECHNICAL QA PENDING**.
- [x] Reviewed the generated image shown in the conversation: recognizable green caterpillar with a curved segmented body, antennae, tiny legs, warm light background, and a soft painted finish. Its surface texture is very dense and the eyes have strong white highlights; compare against the canonical bear and test at card size.
- [ ] Inspect exact committed PNG bytes for dimensions, alpha/transparency, edge quality, and colored fringes. GitHub confirms path, blob SHA, and file size; those do not verify pixel properties.
- [ ] Verify the current Serbian phonics and sequencing runtime use sites before integration. No runtime code was changed and no tests were run as part of this documentation update.
- Status remains a WIP candidate: not marked user-approved, production-ready, or runtime-integrated.

## Next-asset analysis — after caterpillar

- The current `assets_work_in_progress_bundle/` directory listing on `main` was checked. Existing PNGs are `apple.png`, `bear.png`, `bone.png`, `cat.png`, `caterpillar.png`, `chicken.png`, `cow.png`, `dog.png`, `duck.png`, `elephant.png`, `fish.png`, `fox.png`, `frog.png`, `horse.png`, `lion.png`, `pig.png`, `sheep.png`, `star.png`, and `wolf.png`. Do not recommend these as new assets unless the user explicitly asks to revise one.
- **Next candidate to investigate: chick / baby chick**, but first resolve whether the inventory's `animal-chick` and `animal-baby-chick` rows refer to distinct learning concepts and use sites. The inventory lists chick/baby-chick in the life-cycle sequencing context, and they must remain distinct from chicken.
- `chick.png` is present in the WIP directory (approved). `animal-baby-chick` is covered by reusing `chick.png`; no separate `baby-chick.png` is generated. Before generating any chick variant, inspect the full repository for reusable chick illustrations and verify the exact runtime entries in `sequencing.js` and any relevant Serbian data.
- If the source confirms both a chick stage and an adult chicken, prefer one clearly juvenile, fluffy, pale-yellow chick asset only if it can satisfy both listed concepts without confusing learners; otherwise keep separate assets. Use the project's soft watercolor/paper style, rounded silhouette, tiny understated dark eyes, warm cream/yellow palette, and minimal feather detail. Avoid glossy oversized eyes, thick outlines, and excessive fluff texture.
- Do not generate until repository-wide reuse and runtime semantics are checked. Candidate generation, user approval, technical QA, and runtime integration remain separate statuses.

## Animal asset update — 2026-10-21 (chick)

- [x] Verified that `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/chick.png` exists on `main`; GitHub blob SHA: `bf52c9835e122ab3809f2aeec85d846c573170ba`; repository-reported file size: 1,793,805 bytes.
- [x] Updated the `animal-chick` inventory row with the confirmed WIP path and status **GENERATED / CANDIDATE — TECHNICAL QA PENDING**.
- [x] Reviewed the generated chick image in the conversation: clearly juvenile, pale-yellow, rounded body, orange beak and feet, warm cream background, and painted texture. The surface is highly detailed with pronounced feather-like marks and large glossy eyes with white highlights; compare with the canonical bear and evaluate at sequencing-card size.
- [ ] Inspect exact committed PNG bytes for dimensions, alpha/transparency, edge quality, and colored fringes. GitHub confirms path, blob SHA, and file size; these do not verify pixel properties.
- [ ] Confirm whether the same chick image is suitable for both the egg-to-bird sequence and the comparison/spatial contexts listed in the inventory; no runtime code was changed and no tests were run during this documentation update.
- Status remains a WIP candidate: not marked user-approved, production-ready, or runtime-integrated.

## Next-asset analysis — after chick

- The current `assets_work_in_progress_bundle/` listing on `main` contains `apple.png`, `bear.png`, `bone.png`, `cat.png`, `caterpillar.png`, `chick.png`, `chicken.png`, `cow.png`, `dog.png`, `duck.png`, `elephant.png`, `fish.png`, `fox.png`, `frog.png`, `horse.png`, `lion.png`, `pig.png`, `sheep.png`, `star.png`, and `wolf.png`. Do not recommend any of these as new assets unless the user explicitly requests a revision.
- **Next candidate to investigate: bird (`animal-bird`).** The inventory lists it in `sequencing.js` for the egg-to-bird sequence, where the current sequence uses the bird emoji `🐦`. No `bird.png` appears in the WIP directory listing.
- Before generating, search the rest of the repository for reusable bird PNG/SVG artwork and verify whether any existing bird illustration is appropriate for this final life-cycle stage. The WIP folder alone does not establish repository-wide absence.
- If no suitable reusable asset exists, make a simple generic small bird (not another chick and not a species-specific parrot/duck): rounded compact body, muted natural blue/grey or warm brown accents, tiny understated dark eye, small beak and feet, simple wing shape, and restrained watercolor/paper texture. It should read as a grown/young bird stage distinct from the chick, remain clear at card size, and match the bear's quieter detail level. Avoid glossy eyes, dense feather strokes, thick outlines, or saturated decorative plumage.
- Keep the bird as a candidate pending explicit approval, technical QA, and context review. Candidate generation, approval, and runtime integration are separate statuses.

## Generation pipeline — 2026-10-21 (OpenCode/Big Pickle)

### Decisions

- [x] **Backend: Cloudflare Workers AI, free plan.** It is the only free image backend that accepts *reference images* (`input_image_0`…`input_image_3`, each below 512x512), which is what keeps a new candidate inside the approved family instead of guessing the style from text. Model `@cf/black-forest-labs/flux-2-klein-4b`; the free allowance is 10,000 neurons per day. Gemini image models were checked and rejected as "free" (free tier: not available), and the keyless Pollinations Classic endpoint cannot take references.
- [x] **The whole `assets_work_in_progress_bundle/` is the reference pool.** The user confirmed on 2026-10-21 that every already created asset is approved and that each of them is a reference for the next candidate, and so on down the line.
- [x] **Reference order for a generation run:** the canonical bear (`Reference/bear.png`) and the canonical golden star (`Reference/star.png`) first, then the approved *painted* illustrations whose colour distribution matches the bear best. The small rasterised emoji (165-305 px) are not part of the painted family and are only sent when named explicitly. The set can be overridden per run with `--ref-files`.
- [x] **Runtime integration stays out of this task.** This work touches `tools/` and `resources/` only — no `game/` change, so no offline pack, no `sync-docs.sh`, no screenshot refresh.
- [x] **The credentials live outside git.** `tools/vendor/` is now git-ignored; the token never enters the repository.

### New tooling

- `tools/lib/png.js` — dependency-free PNG decode/encode, premultiplied-alpha resize, alpha/border/palette stats, 64x64 legibility proxy. `node tools/lib/png.js --selftest` proves round-trip, resize and palette behaviour.
- `tools/asset_qa.js` — objective QA of a PNG or a folder of PNGs (dimensions, format, alpha coverage, border alpha, palette mean, palette match against the bear, small-size contrast, sha256). It reports facts, never art.
- `tools/asset_refpool.js` — turns the bundle + `Reference/` into the ranked reference pool and writes API-ready copies below 512x512 into `tools/.cache/asset_refs/`.
- `tools/asset_generate.js` — one candidate per run: composes the prompt (reference routing + brief), posts multipart to Cloudflare, writes the picture into the bundle, then prints the QA line. Credentials come from `CF_ACCOUNT_ID` / `CF_API_TOKEN` or a JSON file outside the repository.

### Measured technical QA of the approved bundle

- [x] Real dimensions, format, alpha coverage, border alpha, palette match and small-size contrast measured for all 20 bundle files and both canonical references; recorded in `ASSET_INVENTORY.md` ("Technical QA facts" section).
- [x] **No approved asset has a transparent background.** Every bundle PNG is fully opaque; `Reference/star.png` has an alpha channel it never uses.
- [x] `pig.png` needs a fresh cut-out: only 0.02% of its pixels are fully opaque and 22% are semi-transparent, so the subject is faded edge to edge.
- [ ] Naming checks and the visual-consistency pass are still open — the second needs a human (or a vision model) looking at the pictures.

### API notes

- The image endpoint returns **JPEG**, not PNG, whatever the output file name says. The generator now sniffs the real format from the magic bytes and converts the result to PNG (the bundle convention) before writing it, so a mislabelled file can never land in the bundle again. `tools/lib/imagefile.js` holds the sniffer and the conversion; on Windows it uses the built-in System.Drawing assembly, elsewhere it keeps the original bytes under their true extension and says so.
- Reference images must stay below 512x512; the prepared copies are 500 px on the long edge.

### Candidate — bird (`animal-bird`), generated 2026-10-22

- [x] **Preflight.** The bird glyph `🐦` is live in the egg → chick → bird sequence at `game/games/sequencing.js:25-29` (stage 3, label `Птица`). A repository-wide search of `game/` and `resources/` found **no** reusable bird illustration, so the row was eligible for generation.
- [x] **Brief written:** `prompts/bird.md` — a generic small songbird, explicitly *not* a chick, chicken, rooster, parrot, duck or owl; no crest, no long tail, no saturated plumage; one subject, full body, small mobile size.
- [x] **Iteration 1 — rejected by the user as too chick-like.** References were `bear.png` + `star.png` + `chicken.png` + `chick.png`. Two causes: two round yellow birds pull the model towards a round yellow bird, and the brief itself said "compact rounded body", "tiny understated dark eyes" — baby-anatomy words. Rejected file kept at `%TEMP%\opencode\bird-v1-rejected-chicklike.png`.
- [x] **Iteration 2 — generated** with `bear.png` + `star.png` + `horse.png` (a painted family member for the finish and paper tone, a non-bird silhouette, so nothing in the reference set can be mistaken for a bird to copy) and a rewritten brief spelling out adult proportions: body longer than tall, head in proportion to the body, slim pointed beak, thin legs, a folded wing with a shoulder line, a short tail projecting past the body, no down, no ball body, no oversized head or eyes, and a slate-blue-grey / warm buff / brown palette with no yellow.
- [x] **Measured:** `assets_work_in_progress_bundle/bird.png` — 1024x1024 PNG, 1,169,139 bytes, fully opaque, paper 247.5/244.3/234.8 (iteration 1 was 243.3/239.5/231.8 — v2 sits on the canonical bear's tone), subject mean RGB 180.1/175.5/164.1 and desaturated (the chick's is 249.4/213.7/118.5, bright yellow), subject covers 16.2% of the frame (family 21-35%), small-size contrast 55.6 (family 36.8-146, median ~89).
- [x] **User approved iteration 2** (2026-10-22) after comparing it with `chick.png` and `chicken.png`. The row moved to `GENERATED / USER-APPROVED / TECHNICAL QA MEASURED`. Approval only — production readiness and runtime integration stay separate steps.
- [ ] If a later round still reads too young: iteration 3 should enlarge the bird in the frame (16.2% coverage is below the family) and deepen the palette (small-size contrast 55.6 is under the family median), not re-pick references.

## Next-asset analysis — after bird (bundle audit 2026-10-22)

The bundle was audited file by file against the inventory: **every `.png` in
`assets_work_in_progress_bundle/` is a finished, user-approved asset**, and every inventory row
that points at one of those files now says so. The audit script found **11 stale rows** that still
read `REVIEW` although their `.png` exists (`animal-dog`, `animal-cat`, `animal-cow`,
`animal-duck`, `animal-bear`, `maze-start-bear`, `food-apple`, `reward-star`, `piano-song-star`,
`adventure-fish`, `kitty-fish`) plus 3 status spellings that did not match the rest
(`animal-lion`, `animal-elephant`, `object-bone`). All 14 rows now carry the same status:
**GENERATED / USER-APPROVED / TECHNICAL QA MEASURED**.

Result: **21 bundle files, 24 inventory rows** (three rows share a file: `bear.png` → animal-bear
+ maze-start-bear, `fish.png` → adventure-fish + kitty-fish, `star.png` → reward-star +
piano-song-star), 0 rows pointing at a missing file, 0 bundle files without a row. (The rooster and
the egg were added later the same day, so the bundle now holds 23 files and 26 rows.) The note column
now also says which files are legacy rasters rather than painted family members:

| file | canvas | note |
|---|---|---|
| apple.png | 265x295 | legacy raster |
| cat.png | 275x305 | legacy raster |
| cow.png | 190x165 | legacy raster |
| dog.png | 285x295 | legacy raster |
| duck.png | 165x135 | legacy raster |
| fish.png | 280x220 | legacy raster (shared by two rows) |
| star.png | 290x280 | legacy raster (shared by two rows) |
| bear.png | 800x800 | canonical style anchor, pixel-identical to `Reference/bear.png` |

**Next candidate (chosen 2026-10-22): rooster (`animal-rooster`) — generated and approved the same day, see the candidate section below.** The glyph 🐓 is live in two places —
`game/games/animal_puzzle.js:8` (the farm-puzzle scene) and `game/games/racing-config.js:180`
(racing decor) — and no rooster picture exists anywhere in the repository, so the row is eligible.
The `animal-chicken` row says to keep the rooster "distinct from rooster-specific farm
puzzle/scenery use unless visual semantics are confirmed", and the user chose the rooster as the
next candidate on 2026-10-22, so the rooster gets its own picture and stays visually distinct from
the approved hen (`chicken.png`): a large red comb and wattle, golden hackles, a rich russet body
and long arching dark tail feathers.

- Generate one subject at a time and keep it a candidate until the user reviews it.

## Candidate — rooster (`animal-rooster`), generated 2026-10-22 (task 288)

- [x] **Preflight.** The rooster glyph 🐓 is live in two places — `game/games/animal_puzzle.js:8` (the farm-puzzle scene) and `game/games/racing-config.js:180` (racing decor) — and a repository-wide search found **no** rooster picture in `game/` or `resources/`. The `animal-chicken` row asks to keep the rooster "distinct from rooster-specific farm puzzle/scenery use unless visual semantics are confirmed", and the user chose the rooster as its own candidate on 2026-10-22.
- [x] **Brief written:** `prompts/rooster.md` — a proud adult rooster with a large red comb and wattle, golden-orange hackles, a rich russet body, long arching deep green-black sickle tail feathers and sturdy yellow legs; explicitly not a hen, chick, turkey, ostrich or peacock.
- [x] **Reference set:** `bear.png` (canonical anchor) + `star.png` (canonical secondary) + `chicken.png` — the closest category example, which supplies the family's bird brushwork but not the hen's cream colouring or shape.
- [x] **Generated:** `assets_work_in_progress_bundle/rooster.png` — 1024x1024 PNG, 1,509,865 bytes, fully opaque. Measured: paper 246.8/243.3/236.5 (the canonical bear's tone is 247/246/244), subject mean RGB 163.7/121.9/97.6 — a warm russet, against the hen's 239.0/182.3/127.0 cream — subject covers 27.2% of the frame (family 21-35%), small-size contrast 136.4 (the strongest in the family; the hen's is 69.7), palette-match vs the bear **0.5042**, vs the hen 0.5181, vs the sheep 0.6954 — all inside the family range.
- [x] **User review: APPROVED 2026-10-22.** The user opened `rooster.png` next to `chicken.png` and `chick.png` and approved it, so the row is `GENERATED / USER-APPROVED / TECHNICAL QA MEASURED` and the picture joins the approved-exemplar index in `STYLE_BIBLE.md` §18.4. Production readiness and runtime integration remain separate steps.
- [ ] **Not done here:** no copy into `game/assets/images/`, no glyph swap, no new smoke, no screenshot refresh, no offline pack, no `sync-docs.sh` - `game/` was not touched.





### What the numbers do not say

- `palette-match` against the bear is 0.0152 for the bird, but 0.3157 against the sheep. The metric is a 4-bit histogram intersection over the whole frame and the flat paper is ~80% of it, so a ~10-unit shift in the paper's green channel moves the entire background mass into another bin. The bird's paper (243.3/239.5/231.8) is inside the family range (251.8-254.3 / 249.5-254 / 237-254). Read the paper tone, subject colour and coverage instead — the detail is in `ASSET_INVENTORY.md` ("Technical QA facts", finding 7).
- Big Pickle cannot look at images. Every statement above is a measurement, not a judgement about how the bird looks.

## Candidate — egg (`object-egg`), generated 2026-10-22 (task 289)

- [x] **Preflight.** The 🥚 glyph is used in **two** sequences — `game/games/sequencing.js:26` (label `Јаје`, stage 1 of egg → chick → bird) and `game/games/sequencing.js:46` (label `Јаје`, stage 1 of egg → caterpillar → butterfly) — and every sibling step is already painted and approved (`chick.png`, `bird.png`, `caterpillar.png`). A repository-wide search found **no** egg illustration in `game/` or `resources/`, so the row is eligible for generation.
- [x] **Category decision — a simple object, not an animal.** The egg is the pipeline's first **object** candidate, so the reference set had to carry an object exemplar, and `bone.png` is the only approved simple object in the bundle. `chick.png` and `chicken.png` were deliberately **not** sent: their round, warm-yellow shapes pull the model towards a yellow chick-shaped blob.
- [x] **Brief written:** `prompts/egg.md` — one upright egg shell, a smooth oval, warm cream-beige, a scatter of soft warm-brown speckles, one deeper shaded side; no face, no crack, no chick peeking out, no nest, no straw, no ribbon, no props, no ground line.
- [x] **Reference set:** `bear.png` (canonical anchor) + `star.png` (canonical secondary) + `bone.png` (the approved object exemplar — finish and paper tone only, never its shape).
- [x] **Iteration 1:** 1024x1024, 1,214,827 bytes, opaque. Measured: paper 241.5/237.3/228.5, subject mean RGB 222.2/197.1/170.5, subject coverage 8.8%, **64 px legibility proxy 21.0** — the lowest value in the bundle, i.e. the whole card was nearly blank, because a cream shell on cream paper has almost no tonal range. The shape and the framing were right (silhouette bbox 65% x 80% of the canvas), so only the tone was wrong. **Re-briefed instead of handing it over**: the shell a clear step deeper than the paper, medium warm-brown speckles instead of faint light ones, a deeper tan shaded side, plus an explicit "the picture must not look almost blank" instruction.
- [x] **Iteration 2 (kept):** 1024x1024, 1,252,075 bytes, opaque. Measured: paper 241.3/238.8/231.3, subject mean RGB 219.2/193.8/167.0 (warm cream, no yellow), subject coverage **16.8%** (exactly `bone.png`'s 16.5%), **64 px legibility proxy 38.8** (up from 21.0, just above `bone.png`'s 36.8), 8.0% of the frame darker than luminance 200 (`bone.png` 5.7%, `chick.png` 4.2%), palette-match vs the bear 0.0164 — low, but that metric is dominated by the paper tone and a pale object has few tones to intersect (see `ASSET_INVENTORY.md` finding 7).
- [ ] **User review** — the picture has not been looked at by a human yet, so the row stays `GENERATED / CANDIDATE`. Approval, production readiness and runtime integration remain separate steps.
- [ ] **Not done here:** no copy into `game/assets/images/`, no glyph swap, no new smoke, no screenshot refresh, no offline pack, no `sync-docs.sh` - `game/` was not touched.

## Approved — water drop (`object-water-drop`), generated + approved 2026-10-22 (task 290)

- [x] **Preflight.** The 💧 glyph is used in **five** places — `game/games/sequencing.js:31` (label `Прљаво`, step 1 of the wash sequence 💧 → 🧼 → ✨), `game/games/sequencing.js:52` (label `Заливам`, the watering step of the vegetable sequence 🌱 → 💧 → 🥕), the dino lake collectible (`game/games/dino.js:137`), the fastcat lake theme (`game/games/fastcat.js:130`) and the racing puddle hazard (`game/games/racing-config.js:5`) — more runtime uses than any other open row. A repository-wide search found **no** water-drop illustration in `game/` or `resources/`.
- [x] **Category decision — a simple object.** As with the egg, the reference set needed an object exemplar (`bone.png`), but the **colour** problem was the real one: the family is warm and the canonical secondary reference `star.png` is golden, while a water drop is cool. `elephant.png` — the only approved family member in a cool blue-grey (measured subject mean 163.6/173.0/189.9) — was sent as the **coolness** reference, never as a shape.
- [x] **Brief written:** `prompts/water-drop.md` — one plump upright teardrop on its rounded bottom, tapering to a soft point at the top, one soft highlight on the upper left, deeper shading along the lower right, no face, no splash, no puddle spreading under it, no props, no ground line.
- [x] **Reference set:** `bear.png` (canonical anchor) + `star.png` (canonical secondary) + `elephant.png` (the cool tone only).
- [x] **Iteration 1:** 1024x1024, 932,242 bytes, opaque. Measured: paper 238.3/234.8/225.8 (the darkest paper in the bundle), subject mean RGB 163.98/172.23/178.14 — a **cool grey**, the blue only 14 units above the red — subject coverage 23.2%, 64 px legibility proxy 67.2. The shape was right but the colour read as grey, so it was **not** handed over as-is.
- [x] **User feedback: "water-drop to be more blue."** The brief was rewritten: instead of "a muted, slightly grey blue" it now asks for a *clear, unmistakable water blue*, names the greys to avoid (grey-blue, slate, steel, dusty, washed out) and states the red must be low and the blue high.
- [x] **Iteration 2 (kept):** 1024x1024, 1,163,711 bytes, opaque. Measured: paper **247.5/238.3/226.8** (back inside the family range), subject mean RGB **148.63/199.50/225.43** — the blue 77 units above the red, clearly blue — subject coverage 19.6%, 64 px legibility proxy 49.2, palette-match vs the bear 0.0117 and vs the elephant 0.0120 (the coolest reference, as expected for a cool subject on a warm-paper histogram). The silhouette check (ASCII mask of the subject) measured **32% of the canvas wide by 77% tall** — an upright teardrop; the wide threshold-45 bounding box was the paper wash around it, not the subject.
- [x] **User review: APPROVED 2026-10-22.** The row is `GENERATED / USER-APPROVED / TECHNICAL QA MEASURED` and the picture joins the approved-exemplar index in `STYLE_BIBLE.md` §18.4.
- [ ] **Not done here:** no copy into `game/assets/images/`, no glyph swap, no new smoke, no screenshot refresh, no offline pack, no `sync-docs.sh` - `game/` was not touched.

### Cost tracking (2026-10-22)
Workers AI bills in **neurons**: 10,000 per day are free and the allowance resets at 00:00 UTC; above that, the Workers Paid plan charges $0.011 per 1,000 neurons. The account total is on the Cloudflare dashboard (**AI -> Workers AI**, `https://dash.cloudflare.com/?to=/:account/ai/workers-ai`) — *Billing -> Billable Usage* does **not** list Workers AI neurons on the Free plan, so the AI dashboard is the place to look.

`tools/asset_generate.js` now also prints a per-run estimate and keeps a local log (`tools/.cache/asset-usage.json`, git-ignored), so the usage is visible per candidate and not only as a daily total:

```
neurons: ~120.3 (3 input tile(s) x 5.37 + 4 output tile(s) x 26.05) | today: 6 run(s), ~638.3 of the 10000 free neurons
```

Rates from the Workers AI pricing page (checked 2026-10-22): `@cf/black-forest-labs/flux-2-klein-4b` costs **5.37 neurons per input 512x512 tile** and **26.05 per output 512x512 tile**, so one 1024x1024 candidate with three references costs **~120 neurons**. Six runs today (five candidates + one 256x256 smoke) used **~638 neurons** by the local estimate, and the **dashboard showed 721.64 / 10,000** for the day — the difference is the runs that were made before this counter existed, so the local figure is a per-run planning number, not the account total. Read the dashboard for the real number.

**Planning number:** at ~120 neurons per candidate the free 10,000 neurons cover roughly **80 candidates per day**, so a subject can afford two or three iterations and the limit never has to shape the creative decisions. Note `flux-2-klein-9b` is priced per megapixel (1363.64 for the first MP) and would need a different estimate — 9b is ~11x the cost of a 4b candidate.

## Candidate — soap (`object-soap`), generated 2026-10-23

- [x] **Preflight / repository audit.** The current `main` branch WIP bundle was re-listed before documentation changes. It contains 25 PNGs, including the new `soap.png`; the repository-wide visual-file tree was also checked to look for other relevant image assets and duplicates. The wash sequence uses the soap glyph in `game/games/sequencing.js` between the water-drop and sparkle steps.
- [x] **Brief:** one uniform rectangular bar with rounded corners, soft pastel pink, subtle matte watercolor/paper texture, and a few delicate bubbles along the edges. No face, wrapper, excessive foam, glossy plastic or dramatic lighting.
- [x] **Generated:** `assets_work_in_progress_bundle/soap.png` was returned by image generation and is present in the current WIP directory listing.
- [ ] **Technical QA pending.** Dimensions, alpha/background, silhouette, small-size legibility and visual-family consistency have not yet been measured and recorded here.
- [ ] **User review pending.** Do not mark approved, production-ready or runtime-integrated until those steps actually occur.
- [ ] **Not done here:** no copy into `game/assets/images/`, no glyph swap, no runtime tests, no screenshot refresh, and no offline-pack/sync-docs work; `game/` was not changed.

## Bundle/document synchronization audit — 2026-10-23

- [x] Re-read the current `main` branch WIP directory and recursive repository tree.
- [x] The WIP directory contains **27 PNG files**. This count is only for `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/`; the repository-wide tree has many other PNGs (screenshots, app icons, legacy artwork, sprite frames and references) that are not all candidates for this inventory.
- [x] Compared every WIP PNG filename against the WIP asset paths recorded in `ASSET_INVENTORY.md` and `STYLE_BIBLE.md`.
- [x] Added missing inventory coverage for `sunflower.png` and `butterfly.png`; kept both as candidates, not approved or production-ready.
- [x] Updated the acorn row to reflect that no `acorn.png` is currently present in the WIP bundle.
- [ ] Technical QA for `sunflower.png` and `butterfly.png` is not yet recorded. The existence of a file does not mean it has been visually approved or technically measured.
- [ ] No runtime integration, glyph swap, tests, screenshot refresh or production asset copy was performed by this documentation audit.

The current 27-file WIP bundle, in alphabetical order, is:

`apple.png`, `bear.png`, `bird.png`, `bone.png`, `butterfly.png`, `cat.png`, `caterpillar.png`, `chick.png`, `chicken.png`, `cow.png`, `dog.png`, `duck.png`, `egg.png`, `elephant.png`, `fish.png`, `fox.png`, `frog.png`, `horse.png`, `lion.png`, `pig.png`, `rooster.png`, `sheep.png`, `soap.png`, `star.png`, `sunflower.png`, `water-drop.png`, and `wolf.png`.

The WIP file list and inventory coverage are now synchronized for the files visible on `main` at audit time. This does not assert that every PNG anywhere in the repository belongs in the asset-generation inventory; screenshots, app icons, legacy illustrations, sprite frames and reference boards have different purposes.


## Asset update — acorn (object-acorn), generated 2026-10-25

- [x] **Repository presence verified.** Commit 20e9d5974bb11ee49c2986bc71d1aae73d8b3947 adds resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/acorn.png to main.
- [x] **Source use confirmed.** game/games/sequencing.js uses 🌰 as stage 1 of the tree-growth sequence: acorn → sprout → tree.
- [x] **Inventory synchronized.** The object-acorn row now points to the committed WIP file and records it as a candidate.
- [ ] **Technical QA pending.** The exact committed PNG bytes have not been measured in this documentation pass; dimensions, file size, alpha/background, silhouette coverage, small-size legibility, and edge quality remain unverified. The generated image shown in chat has an opaque cream paper background, but that observation is not treated as a measurement of the committed file.
- [ ] **User review pending.** The image is not recorded as user-approved, production-ready, or runtime-integrated.
- [ ] **Not done here:** no copy into game/assets/images/, no glyph swap, no runtime tests, no screenshot refresh, no offline-pack build, and no sync-docs.sh; game/ was not changed.

## Next-candidate analysis — mushroom (object-mushroom), 2026-10-25

- **Recommendation: investigate mushroom next, but do not generate yet.** The inventory maps 🍄 to the forest scene in game/games/animal_puzzle.js and a Kitty collectible. A shared image could serve two contexts, but the actual Kitty render path and required scale/crop must be checked before deciding whether one asset is appropriate.
- **Duplicate check status:** GitHub code/file search for mushroom.png returned no result. That search alone does not prove no reusable mushroom artwork exists elsewhere in the repository; a recursive visual-file audit is still required before generation.
- **Prompt direction if preflight clears it:** a single recognizable woodland mushroom with a rounded warm red/rust cap and a short cream stem, softly painted storybook watercolor/paper texture, restrained natural shading, simple readable silhouette, no face, no surrounding grass/forest scene, no glossy 3D finish or thick outline. Final colors should be checked against the forest-puzzle palette and the existing bear/star/object references.
- **Decision gates before generation:** (1) inspect every repository mushroom image/SVG and relevant sprite folder, (2) inspect the Kitty collectible's actual use and scale, (3) confirm whether a single mushroom can serve both contexts without semantic/layout issues, and (4) finalize the prompt and reference set. No generation has been performed for mushroom.

## Asset update — mushroom (object-mushroom), added 2026-10-25

*(Supersedes the "do not generate yet" recommendation above: the user supplied `mushroom.png` directly.)*

- [x] **Repository presence verified.** Commit `c7e6500` adds `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/mushroom.png` to `main`.
- [x] **File sanity checked at add time.** `PNG image data, 1086 x 1448, 8-bit/color RGB, non-interlaced`, 1.8 MB — same format/size family as `acorn.png`.
- [x] **Source use confirmed.** `game/games/animal_puzzle.js:7` (forest puzzle animal), `game/games/cat_forest.js:78` (gift), `game/games/kitty-standalone.js:701` (Kitty collectible).
- [x] **Inventory synchronized.** The `object-mushroom` row now points to the committed WIP file and records it as a candidate.
- [ ] **Technical QA pending.** No measurement pass (alpha/background, silhouette coverage, small-size legibility, edge quality, palette match) has been recorded for this file.
- [ ] **User review pending.** The image is not recorded as user-approved, production-ready, or runtime-integrated.
- [ ] **Not done here:** no copy into `game/assets/images/`, no glyph swap, no runtime tests, no screenshot refresh, no offline-pack build, no `sync-docs.sh`; `game/` was not changed.

## Asset update — flower (object-flower), added 2026-10-25

- [x] **Repository presence verified.** Commit `6e2f517` adds `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/flower.png` to `main`.
- [x] **File sanity checked at add time.** `PNG image data, 1448 x 1086, 8-bit/color RGB, non-interlaced`, 1.7 MB — landscape, unlike the portrait acorn/mushroom files.
- [x] **Source use confirmed.** `game/data/serbian.js:34` (phonics word `Цвет`), `game/games/sequencing.js:18` (label `Цвет`, plant-growth step 2); also decor in maze/racing.
- [x] **Inventory synchronized.** The `object-flower` row now points to the committed WIP file and records it as a candidate.
- [ ] **UI counter rows untouched.** `flower-counter` and `r3d-flower-counter` (🌸, `game/pages/racing3d.html`) stay `REVIEW`: they need a small UI icon, so this landscape illustration is not assumed to fit them.
- [ ] **Technical QA pending.** No measurement pass (alpha/background, silhouette coverage, small-size legibility, edge quality, palette match) has been recorded.
- [ ] **User review pending.** Not recorded as user-approved, production-ready, or runtime-integrated.
- [ ] **Not done here:** no copy into `game/assets/images/`, no glyph swap, no runtime tests, no screenshot refresh, no offline-pack build, no `sync-docs.sh`; `game/` was not changed.

Current WIP bundle state (2026-10-25): **30 PNGs**, in alphabetical order:

`acorn.png`, `apple.png`, `bear.png`, `bird.png`, `bone.png`, `butterfly.png`, `cat.png`, `caterpillar.png`, `chick.png`, `chicken.png`, `cow.png`, `dog.png`, `duck.png`, `egg.png`, `elephant.png`, `fish.png`, `flower.png`, `fox.png`, `frog.png`, `horse.png`, `lion.png`, `mushroom.png`, `pig.png`, `rooster.png`, `sheep.png`, `soap.png`, `star.png`, `sunflower.png`, `water-drop.png`, `wolf.png`.

## Process reconciliation — 2026-10-25 (task 291)

The local checkout had an uncommitted 2026-10-22 soap experiment (seven prompt iterations, a dedicated brief in `prompts/soap.md`, and a `soap.png` render) on top of an older `main`. The user asked to keep only what belongs to the **generation process** and to drop the soap candidate:

- [x] **Discarded:** the local `soap.png` render and `prompts/soap.md` — a later session had already generated the `soap.png` now on `main` (2026-10-23 section above), so the local render is irrelevant.
- [x] **Kept — tooling:** `tools/asset_generate.js --subject-ref <file>` plus the role routing that makes image 0 the *subject* (copy its shape and colours; take only the rendering style from the family references). This is the transferable fix from the failed iterations and is documented as finding 9 in `ASSET_INVENTORY.md`.
- [x] **Kept — record:** the water-drop task 290 was archived and indexed (the bookkeeping had not reached `main`).
- [ ] **Not done here:** no measurement of the candidates on `main`, no approval, no runtime integration.

## Resolution pass — nine small approved files upscaled — 2026-10-25 (task 292)

The user asked for the same pictures at the family resolution, **not** new artwork: "we are not expecting the image to change just the resolution to be better". The nine named files are the smallest in the bundle (165x135 up to 800x800); the family standard is 1024x1024. New `_1` copies were made beside the originals and reviewed before any swap.

- [x] **Checked for a high-resolution original first.** `bear.png` is pixel-identical to `Reference/bear.png` (800x800, so no larger source exists); `star.png` is **not** the 2048x2048 `Reference/star.png` (luminance corr 0.10 at every tested scale, a different star); the seven small files have no larger copy anywhere in the repository. Re-rendering the emoji glyph was probed and rejected: Segoe UI Emoji 🦆 rendered at the bundle's own 165x135 matched `duck.png` only at corr 0.12, so it is not the same artwork and a re-render would change the picture.
- [x] **Method — resample only, never repaint.** New tool `tools/asset_upscale.js`: Lanczos-3 in premultiplied alpha, aspect ratio preserved, the picture centred on a 1024x1024 canvas padded with its own background colour (transparent padding for `pig.png`). No crop, no recolour, no sharpening.
- [x] **Proof it is the same picture.** Each `_1` file was scaled back to the original size and compared with the original: luminance correlation **0.9587-0.9995**, mean pixel difference **0.3-3.4**.
- [x] **Files written:** `duck_1.png`, `cow_1.png`, `fish_1.png`, `star_1.png`, `apple_1.png`, `dog_1.png`, `cat_1.png`, `bear_1.png`, `pig_1.png` — all 1024x1024, opaque except `pig_1.png` (transparent background, picture area 1024x768).
- [x] **User review: APPROVED 2026-10-25.** The user checked the nine `_1` files and approved them. The old files were removed, each `_1` copy was renamed to the original filename (`duck.png` … `pig.png`), so every document that references these names stays valid; `ASSET_INVENTORY.md` (facts table + row notes), `STYLE_BIBLE.md` §18.4.1 and `STATUS.md` now record the 1024x1024 sizes and the resample provenance.
- [x] **Not changed:** no inventory status change (the files stay `GENERATED / USER-APPROVED / TECHNICAL QA MEASURED`), no runtime integration, no glyph swap, no screenshot or offline-build work — this is the bundle artwork only.
- [ ] **Known limit:** an upscale cannot add detail the 165-305 px source never had; the result is a smooth enlargement of the same art, which is what was asked for.

## Approved — strawberry (food-strawberry), generated + approved 2026-10-25 (food batch 1)

- [x] **Preflight.** The 🍓 glyph is used in `game/games/sorting.js` (sorting item) and `game/games/kitty-standalone.js` (Kitty collectible). No strawberry illustration existed in `game/` or `resources/`, so the row was eligible for generation.
- [x] **Category decision — food/fruit** (STYLE_BIBLE.md §12): keep the whole item readable through shape and natural color; restrained soft highlights and shaded edges to suggest roundness; leaves/stems/seeds few, clear, appropriately sized; preserve the real-world red color cue.
- [x] **Brief written:** `prompts/strawberry.md` — one plump, slightly heart-shaped berry with a small cluster of short green leaves (calyx) at the top, clear unmistakable strawberry red (never brown/orange/pink/muddy/grey), one soft highlight on the upper left, deeper red shading on the lower right, a modest number of small pale-yellow seeds, no face, no props.
- [x] **Reference set:** `bear.png` (canonical anchor) + `star.png` (canonical secondary — golden warmth for paper/finish) + `bone.png` (approved simple-object exemplar — rounded, simple, faceless form). No cool references needed: a strawberry is a warm red and sits naturally inside the family palette.
- [x] **Generated (iteration 1, kept):** 1024x1024, 1,480,533 bytes, opaque. Measured: paper 242.01/218.99/203.98, palette-match vs bear 0.0129, small-size legibility proxy 90.11 (good — the red reads clearly at card size).
- [x] **User review: APPROVED 2026-10-25.** The row is `GENERATED / USER-APPROVED / TECHNICAL QA MEASURED` and the picture joins the approved set.
- [ ] **Not done here:** no copy into `game/assets/images/`, no glyph swap, no new smoke, no screenshot refresh, no offline pack, no `sync-docs.sh` — `game/` was not touched.

## Approved — banana (food-banana), generated + approved 2026-10-25 (food batch 1)

- [x] **Preflight.** The 🍌 glyph is used in `game/data/serbian.js` (Serbian phonics picture) and Kitty collectible themes. No banana illustration existed in `game/` or `resources/`, so the row was eligible for generation.
- [x] **Category decision — food/fruit** (STYLE_BIBLE.md §12): keep the whole item readable through shape and natural color; restrained soft highlights and shaded edges to suggest roundness; preserve the real-world yellow color cue.
- [x] **Brief written:** `prompts/banana.md` — one curved crescent banana, plump and rounded, warm ripe banana yellow (never beige/brown/green/grey), one soft highlight along the upper curve, deeper golden-amber shading along the inner edge, no spots/bruises/freckles, one small stem, no face, no props.
- [x] **Reference set:** `bear.png` (canonical anchor) + `star.png` (canonical secondary — golden warmth reinforces yellow) + `bone.png` (approved simple-object exemplar — rounded, simple, faceless form). No cool references needed: a banana is a warm yellow and sits naturally inside the family palette.
- [x] **Generated (iteration 1, kept):** 1024x1024, 862,917 bytes, opaque. Measured: paper 247.6/236/214.24, palette-match vs bear 0.0812, small-size legibility proxy 32.61 (low — a yellow subject on warm paper is a small luminance step, like bone/egg; the user approved it).
- [x] **User review: APPROVED 2026-10-25.** The row is `GENERATED / USER-APPROVED / TECHNICAL QA MEASURED` and the picture joins the approved set.
- [ ] **Not done here:** no copy into `game/assets/images/`, no glyph swap, no new smoke, no screenshot refresh, no offline pack, no `sync-docs.sh` — `game/` was not touched.

## Approved — grapes (food-grapes), generated + approved 2026-10-25 (food batch 1)

- [x] **Preflight.** The 🍇 glyph is used in `game/games/compare.js` (comparison object) and Kitty collectible themes. No grape illustration existed in `game/` or `resources/`, so the row was eligible for generation.
- [x] **Category decision — food/fruit** (STYLE_BIBLE.md §12): keep the whole item readable through shape and natural color; restrained soft highlights and shaded edges to suggest roundness; preserve the real-world purple color cue.
- [x] **Brief written:** `prompts/grapes.md` — one compact bunch of round plump grapes hanging from a short stem with one or two small simple leaves, clear unmistakable grape purple (never brown/muddy/grey/blue-only/red), one soft highlight per grape, deeper purple shading where they overlap, no face, no props.
- [x] **Reference set:** `bear.png` (canonical anchor) + `star.png` (canonical secondary — golden warmth for paper/finish) + `water-drop.png` (approved simple object — cool tone reference for the blue/purple component). The family is warm, so the purple was stated explicitly.
- [x] **Generated (iteration 1, kept):** 1024x1024, 1,188,074 bytes, opaque. Measured: paper 233.84/223.58/216.13, palette-match vs bear 0.0125, small-size legibility proxy 80.35.
- [x] **User review: APPROVED 2026-10-25.** The row is `GENERATED / USER-APPROVED / TECHNICAL QA MEASURED` and the picture joins the approved set.
- [ ] **Not done here:** no copy into `game/assets/images/`, no glyph swap, no new smoke, no screenshot refresh, no offline pack, no `sync-docs.sh` — `game/` was not touched.

## Approved — orange (food-orange), generated + approved 2026-10-25 (food batch 1)

- [x] **Preflight.** The 🍊 glyph is used in `game/games/compare.js` (comparison object). No orange illustration existed in `game/` or `resources/`, so the row was eligible for generation.
- [x] **Category decision — food/fruit** (STYLE_BIBLE.md §12): keep the whole item readable through shape and natural color; restrained soft highlights and shaded edges to suggest roundness; preserve the real-world orange color cue.
- [x] **Brief written:** `prompts/orange.md` — one plump slightly flattened sphere with a subtle top dimple, short stem and one or two small simple leaves, clear unmistakable orange (never brown/red/yellow/muddy), one soft highlight on the upper left, deeper orange-amber shading on the lower right, no skin pores, no face, no props.
- [x] **Reference set:** `bear.png` (canonical anchor) + `star.png` (canonical secondary — golden warmth for paper/finish) + `bone.png` (approved simple-object exemplar — rounded, simple, faceless form). No cool references needed: an orange is a warm orange and sits naturally inside the family palette.
- [x] **Generated (iteration 1, kept):** 1024x1024, 1,198,178 bytes, opaque. Measured: paper 238.86/218.41/194.12, palette-match vs bear 0.0526, small-size legibility proxy 102.83.
- [x] **User review: APPROVED 2026-10-25.** The row is `GENERATED / USER-APPROVED / TECHNICAL QA MEASURED` and the picture joins the approved set.
- [ ] **Not done here:** no copy into `game/assets/images/`, no glyph swap, no new smoke, no screenshot refresh, no offline pack, no `sync-docs.sh` — `game/` was not touched.

## Approved — pear (food-pear), generated + approved 2026-10-25 (food batch 1)

- [x] **Preflight.** The 🍐 glyph is used in `game/games/compare.js` (comparison object). No pear illustration existed in `game/` or `resources/`, so the row was eligible for generation.
- [x] **Category decision — food/fruit** (STYLE_BIBLE.md §12): keep the whole item readable through shape and natural color; restrained soft highlights and shaded edges to suggest roundness; preserve the real-world green color cue and the pear's distinct silhouette (not an apple).
- [x] **Brief written:** `prompts/pear.md` — one pear with a heavy bulbous bottom narrowing to a slimmer neck and small stem, clear unmistakable pear green (never brown/grey/blue/muddy), one soft highlight on the upper left, deeper green shading on the lower right, no face, no props.
- [x] **Reference set:** `bear.png` (canonical anchor) + `star.png` (canonical secondary — golden warmth for paper/finish) + `bone.png` (approved simple-object exemplar — rounded, simple, faceless form). The family is warm, so the green was stated explicitly.
- [x] **Generated (iteration 1, kept):** 1024x1024, 898,228 bytes, opaque. Measured: paper 229.56/222.07/204.23, palette-match vs bear 0.0071, small-size legibility proxy 67.71.
- [x] **User review: APPROVED 2026-10-25.** The row is `GENERATED / USER-APPROVED / TECHNICAL QA MEASURED` and the picture joins the approved set.
- [ ] **Not done here:** no copy into `game/assets/images/`, no glyph swap, no new smoke, no screenshot refresh, no offline pack, no `sync-docs.sh` — `game/` was not touched.

## Approved — watermelon (food-watermelon), generated + approved 2026-10-25 (food batch 1)

- [x] **Preflight.** The 🍉 glyph is used in `game/games/kitty-standalone.js` (Kitty collectible). No watermelon illustration existed in `game/` or `resources/`, so the row was eligible for generation.
- [x] **Category decision — food/fruit** (STYLE_BIBLE.md §12): keep the whole item readable through shape and natural color; restrained soft highlights and shaded edges to suggest roundness; preserve the real-world red/green color cue.
- [x] **Brief written:** `prompts/watermelon.md` — one triangular watermelon slice with a curved green rind and red flesh, a handful of dark seeds, one soft highlight on the flesh, deeper shading along the rind, no face, no props.
- [x] **Reference set:** `bear.png` (canonical anchor) + `star.png` (canonical secondary — golden warmth for paper/finish) + `bone.png` (approved simple-object exemplar — rounded, simple, faceless form).
- [x] **Generated (iteration 1, kept):** 1024x1024, 1,365,332 bytes, opaque. Measured: paper 240.28/228.13/217.86, palette-match vs bear 0.011, small-size legibility proxy 39.66 (low — a pale red/pink on warm paper is a small luminance step, like bone/egg; the user approved it).
- [x] **User review: APPROVED 2026-10-25.** The row is `GENERATED / USER-APPROVED / TECHNICAL QA MEASURED` and the picture joins the approved set.
- [ ] **Not done here:** no copy into `game/assets/images/`, no glyph swap, no new smoke, no screenshot refresh, no offline pack, no `sync-docs.sh` — `game/` was not touched.

## Approved — carrot (food-carrot), generated + approved 2026-10-25 (food batch 1)

- [x] **Preflight.** The 🥕 glyph is used in `game/games/sequencing.js` (growth sequence result) and `game/games/kitty-standalone.js` (Kitty collectible). No carrot illustration existed in `game/` or `resources/`, so the row was eligible for generation.
- [x] **Category decision — food/fruit** (STYLE_BIBLE.md §12): keep the whole item readable through shape and natural color; restrained soft highlights and shaded edges to suggest roundness; leaves/stems few, clear, appropriately sized; preserve the real-world orange color cue.
- [x] **Brief written:** `prompts/carrot.md` — one long tapered carrot root with a small cluster of green fronds at the top, clear unmistakable carrot orange (never brown/red/yellow/muddy), one soft highlight along the upper side, deeper orange shading along the lower side, no face, no props.
- [x] **Reference set:** `bear.png` (canonical anchor) + `star.png` (canonical secondary — golden warmth for paper/finish) + `bone.png` (approved simple-object exemplar — rounded, simple, faceless form).
- [x] **Generated (iteration 1, kept):** 1024x1024, 1,206,891 bytes, opaque. Measured: paper 244.48/233.16/212.64, palette-match vs bear 0.0363, small-size legibility proxy 38.7 (low — an orange subject on warm paper is a small luminance step; the user approved it).
- [x] **User review: APPROVED 2026-10-25.** The row is `GENERATED / USER-APPROVED / TECHNICAL QA MEASURED` and the picture joins the approved set.
- [ ] **Not done here:** no copy into `game/assets/images/`, no glyph swap, no new smoke, no screenshot refresh, no offline pack, no `sync-docs.sh` — `game/` was not touched.

## Approved — apple-green (food-apple-green), generated + approved 2026-10-25 (food batch 1)

- [x] **Preflight.** The 🍏 glyph is used in `game/games/sequencing.js` (unripe fruit sequence step). No green-apple illustration existed in `game/` or `resources/`, so the row was eligible for generation.
- [x] **Category decision — food/fruit** (STYLE_BIBLE.md §12): keep the whole item readable through shape and natural color; restrained soft highlights and shaded edges to suggest roundness; preserve the real-world green color cue and the apple's distinct round silhouette (not a pear).
- [x] **Brief written:** `prompts/apple-green.md` — one round green (unripe) apple with a small stem and one or two small simple leaves, clear unmistakable unripe-apple green (never brown/grey/blue/muddy), one soft highlight on the upper left, deeper green shading on the lower right, no face, no props.
- [x] **Reference set:** `bear.png` (canonical anchor) + `star.png` (canonical secondary — golden warmth for paper/finish) + `bone.png` (approved simple-object exemplar — rounded, simple, faceless form). The family is warm, so the green was stated explicitly.
- [x] **Generated (iteration 1, kept):** 1024x1024, 1,683,618 bytes, opaque. Measured: paper 228.75/224.19/199.48, palette-match vs bear 0.0156, small-size legibility proxy 72.47.
- [x] **User review: APPROVED 2026-10-25.** The row is `GENERATED / USER-APPROVED / TECHNICAL QA MEASURED` and the picture joins the approved set.
- [ ] **Not done here:** no copy into `game/assets/images/`, no glyph swap, no new smoke, no screenshot refresh, no offline pack, no `sync-docs.sh` — `game/` was not touched.

## Approved — cheese (food-cheese), generated + approved 2026-10-25 (food batch 1)

- [x] **Preflight.** The 🧀 glyph is used in `game/games/spatial.js` (spatial scene / position task). No cheese illustration existed in `game/` or `resources/`, so the row was eligible for generation.
- [x] **Category decision — food/fruit** (STYLE_BIBLE.md §12): keep the whole item readable through shape and natural color; restrained soft highlights and shaded edges to suggest roundness; preserve the real-world yellow color cue.
- [x] **Iteration 1 (rejected):** generated with bear + star + bone references. The golden-star reference's five-pointed silhouette leaked into the result and the cheese came out **star-shaped**. Colour and style were fine; shape was wrong. Iteration 1 was discarded.
- [x] **Brief rewritten (iteration 2):** `prompts/cheese.md` — one triangular wedge slice with a curved rind, a few small round holes, clear unmistakable cheese yellow, one soft highlight on the upper left, deeper yellow-amber shading on the lower right. The golden-star reference was **dropped** (bear + bone only) and explicit anti-star / anti-burst language was added to both the shape instruction and the exclusions.
- [x] **Reference set (iteration 2):** `bear.png` (canonical anchor) + `bone.png` (approved simple-object exemplar — rounded, simple, faceless form). Star deliberately omitted to avoid shape contamination.
- [x] **Generated (iteration 2, kept):** 1024x1024, 1,214,424 bytes, opaque. Measured: paper 244.46/232.92/211.8, palette-match vs bear 0.0774, small-size legibility proxy 40.19.
- [x] **User review: APPROVED 2026-10-25.** The row is `GENERATED / USER-APPROVED / TECHNICAL QA MEASURED` and the picture joins the approved set.
- [ ] **Not done here:** no copy into `game/assets/images/`, no glyph swap, no new smoke, no screenshot refresh, no offline pack, no `sync-docs.sh` — `game/` was not touched.

## Approved — seedling (plant-seedling), generated + approved 2026-10-25 (sequencing batch)

- [x] **Preflight.** The 🌱 glyph is used in `game/games/sequencing.js` (plant-growth sequence, seed step). No seedling illustration existed in `game/` or `resources/`, so the row was eligible for generation.
- [x] **Category decision — plants/nature** (STYLE_BIBLE.md §12): gentle organic curves, simple leaf/petal groups, avoid dense botanical detail, natural colors soft but identifiable.
- [x] **Brief written:** `prompts/seedling.md` — one small seedling with a short curved green stem and two small rounded cotyledon leaves facing upward, clear unmistakable seedling green, one soft highlight on each leaf, deeper green shading along lower edges, no soil/pot/ground, no face, no props.
- [x] **Reference set:** `bear.png` (canonical anchor) + `star.png` (canonical secondary — golden warmth for paper/finish) + `bone.png` (approved simple-object exemplar — rounded, simple, faceless form). The family is warm, so the green was stated explicitly.
- [x] **Generated (iteration 1, kept):** 1024x1024, 1,240,480 bytes, opaque. Measured: paper 235.96/229.79/216.77, palette-match vs bear 0.0136, small-size legibility proxy 29.73 (low — a pale green on warm paper is a small luminance step; the user approved it).
- [x] **User review: APPROVED 2026-10-25.** The row is `GENERATED / USER-APPROVED / TECHNICAL QA MEASURED` and the picture joins the approved set.
- [ ] **Not done here:** no copy into `game/assets/images/`, no glyph swap, no new smoke, no screenshot refresh, no offline pack, no `sync-docs.sh` — `game/` was not touched.

## Approved — leaves (plant-leaves), generated + approved 2026-10-25 (sequencing batch)

- [x] **Preflight.** The 🌿 glyph is used in `game/games/sequencing.js` (plant-growth sequence, plant step). No leafy-plant illustration existed in `game/` or `resources/`, so the row was eligible for generation.
- [x] **Category decision — plants/nature** (STYLE_BIBLE.md §12): gentle organic curves, simple leaf/petal groups, avoid dense botanical detail, natural colors soft but identifiable.
- [x] **Brief written:** `prompts/leaves.md` — one small leafy plant with a short green stem and three to five simple rounded leaves, clear unmistakable plant green, one soft highlight on each leaf, deeper green shading along lower edges, no soil/pot/ground/flowers, no face, no props.
- [x] **Reference set:** `bear.png` (canonical anchor) + `star.png` (canonical secondary — golden warmth for paper/finish) + `bone.png` (approved simple-object exemplar — rounded, simple, faceless form). The family is warm, so the green was stated explicitly.
- [x] **Generated (iteration 1, kept):** 1024x1024, 1,380,758 bytes, opaque. Measured: paper 237.3/231.78/214.4, palette-match vs bear 0.0155, small-size legibility proxy 50.35.
- [x] **User review: APPROVED 2026-10-25.** The row is `GENERATED / USER-APPROVED / TECHNICAL QA MEASURED` and the picture joins the approved set.
- [ ] **Not done here:** no copy into `game/assets/images/`, no glyph swap, no new smoke, no screenshot refresh, no offline pack, no `sync-docs.sh` — `game/` was not touched.

## Approved — tree (object-tree), generated + approved 2026-10-25 (sequencing batch)

- [x] **Preflight.** The 🌳 glyph is used in `game/data/serbian.js` (phonics), `game/games/sequencing.js` (tree-growth sequence, stage 3: acorn → sprout → tree) and racing decor. No tree illustration existed in `game/` or `resources/`, so the row was eligible for generation.
- [x] **Category decision — plants/nature** (STYLE_BIBLE.md §12): gentle organic curves, simple leaf/petal groups, avoid dense botanical detail, natural colors soft but identifiable.
- [x] **Brief written:** `prompts/tree.md` — one simple storybook tree with a short tapered brown trunk and a rounded full green canopy, clear unmistakable tree green, one soft highlight on the upper canopy, deeper green shading along lower edges, brown trunk, no apples/fruit/birds/extra trees/ground/roots/grass, no face, no props.
- [x] **Reference set:** `bear.png` (canonical anchor) + `star.png` (canonical secondary — golden warmth for paper/finish) + `bone.png` (approved simple-object exemplar — rounded, simple, faceless form). The family is warm, so the green was stated explicitly.
- [x] **Generated (iteration 1, kept):** 1024x1024, 1,036,022 bytes, opaque. Measured: paper 227.83/221.1/199.47, palette-match vs bear 0.0171, small-size legibility proxy 93.69.
- [x] **User review: APPROVED 2026-10-25.** The row is `GENERATED / USER-APPROVED / TECHNICAL QA MEASURED` and the picture joins the approved set.
- [ ] **Not done here:** no copy into `game/assets/images/`, no glyph swap, no new smoke, no screenshot refresh, no offline pack, no `sync-docs.sh` — `game/` was not touched.

## Approved — zebra (animal-zebra), generated + approved 2026-10-25 (animals batch)

- [x] **Preflight.** The 🦓 glyph is used in `game/games/animal_puzzle.js` (savanna puzzle). No zebra illustration existed in `game/` or `resources/`, so the row was eligible for generation.
- [x] **Category decision — animals** (STYLE_BIBLE.md §12): soft rounded body masses, simple believable anatomy, thick/clear legs, markings only as needed to identify the species, simple painted fur suggestions.
- [x] **Brief written:** `prompts/zebra.md` — one zebra standing in a calm friendly pose with rounded body, sturdy neck, short mane, tufted tail, four clear sturdy legs, clear simple black-and-white stripes (broad, few, natural direction), gentle face, no exaggerated expression, no accessories, no props.
- [x] **Reference set:** `bear.png` (canonical anchor) + `star.png` (canonical secondary — golden warmth for paper/finish) + `horse.png` (approved painted animal exemplar — similar hooved build, finish and paper tone only, never its shape or warm brown colour).
- [x] **Generated (iteration 1, kept):** 1024x1024, 1,248,503 bytes, opaque. Measured: paper 228.22/224.46/212.78, palette-match vs bear 0.0185, small-size legibility proxy 98.62.
- [x] **User review: APPROVED 2026-10-25.** The row is `GENERATED / USER-APPROVED / TECHNICAL QA MEASURED` and the picture joins the approved set.
- [ ] **Not done here:** no copy into `game/assets/images/`, no glyph swap, no new smoke, no screenshot refresh, no offline pack, no `sync-docs.sh` — `game/` was not touched.

## Approved — giraffe (animal-giraffe), generated + approved 2026-10-25 (animals batch)

- [x] **Preflight.** The 🦒 glyph is used in `game/games/animal_puzzle.js` (savanna puzzle). No giraffe illustration existed in `game/` or `resources/`, so the row was eligible for generation.
- [x] **Category decision — animals** (STYLE_BIBLE.md §12): soft rounded body masses, simple believable anatomy, thick/clear legs, markings only as needed to identify the species, simple painted fur suggestions.
- [x] **Brief written:** `prompts/giraffe.md` — one giraffe standing in a calm friendly pose with a long neck, small head with two small ossicones, rounded body, four sturdy legs, warm golden-yellow base with a few simple large irregular brown spots, gentle face, no exaggerated expression, no accessories, no props.
- [x] **Reference set:** `bear.png` (canonical anchor) + `star.png` (canonical secondary — golden warmth for paper/finish) + `horse.png` (approved painted animal exemplar — similar hooved build, finish and paper tone only, never its shape or warm brown colour).
- [x] **Generated (iteration 1, kept):** 1024x1024, 1,406,341 bytes, opaque. Measured: paper 242.29/233.94/219.48, palette-match vs bear 0.4155 (high — warm golden palette close to bear), small-size legibility proxy 58.67.
- [x] **User review: APPROVED 2026-10-25.** The row is `GENERATED / USER-APPROVED / TECHNICAL QA MEASURED` and the picture joins the approved set.
- [ ] **Not done here:** no copy into `game/assets/images/`, no glyph swap, no new smoke, no screenshot refresh, no offline pack, no `sync-docs.sh` — `game/` was not touched.

## Approved — deer (animal-deer), generated + approved 2026-10-25 (animals batch)

- [x] **Preflight.** The 🦌 glyph is used in `game/games/animal_puzzle.js` (forest puzzle) and racing decor. No deer illustration existed in `game/` or `resources/`, so the row was eligible for generation.
- [x] **Category decision — animals** (STYLE_BIBLE.md §12): soft rounded body masses, simple believable anatomy, thick/clear legs, markings only as needed to identify the species, simple painted fur suggestions.
- [x] **Brief written:** `prompts/deer.md` — one deer standing in a calm friendly pose with a slender body, graceful neck, gentle head, simple branching antlers, soft warm brown body, antlers a slightly lighter tan/brown with a few smooth branches, gentle face, no exaggerated expression, no accessories, no props.
- [x] **Reference set:** `bear.png` (canonical anchor) + `star.png` (canonical secondary — golden warmth for paper/finish) + `horse.png` (approved painted animal exemplar — similar hooved build, finish and paper tone only, never its shape or warm brown colour).
- [x] **Generated (iteration 1, kept):** 1024x1024, 1,211,963 bytes, opaque. Measured: paper 242.2/231.42/213.91, palette-match vs bear 0.0215, small-size legibility proxy 65.07.
- [x] **User review: APPROVED 2026-10-25.** The row is `GENERATED / USER-APPROVED / TECHNICAL QA MEASURED` and the picture joins the approved set.
- [ ] **Not done here:** no copy into `game/assets/images/`, no glyph swap, no new smoke, no screenshot refresh, no offline pack, no `sync-docs.sh` — `game/` was not touched.

## Approved — squirrel (animal-squirrel), generated + approved 2026-10-25 (animals batch)

- [x] **Preflight.** The 🐿️ glyph is used in `game/games/animal_puzzle.js` (forest puzzle). No squirrel illustration existed in `game/` or `resources/`, so the row was eligible for generation.
- [x] **Category decision — animals** (STYLE_BIBLE.md §12): soft rounded body masses, simple believable anatomy, thick/clear legs, markings only as needed to identify the species, simple painted fur suggestions.
- [x] **Brief written:** `prompts/squirrel.md` — one squirrel sitting upright in a calm friendly pose with a small rounded body, pointed but soft face, small rounded ears, tiny paws, big bushy tail curving up behind, warm brownish-orange body and slightly lighter fluffier tail, gentle face, no exaggerated expression, no accessories, no props.
- [x] **Reference set:** `bear.png` (canonical anchor) + `star.png` (canonical secondary — golden warmth for paper/finish) + `fox.png` (approved painted animal exemplar — small furry build, finish and paper tone only, never its shape or its orange colour).
- [x] **Generated (iteration 1, kept):** 1024x1024, 1,748,933 bytes, opaque. Measured: paper 233.23/217.84/201.55, palette-match vs bear 0.1326, small-size legibility proxy 98.06.
- [x] **User review: APPROVED 2026-10-25.** The row is `GENERATED / USER-APPROVED / TECHNICAL QA MEASURED` and the picture joins the approved set.
- [ ] **Not done here:** no copy into `game/assets/images/`, no glyph swap, no new smoke, no screenshot refresh, no offline pack, no `sync-docs.sh` — `game/` was not touched.

## Approved — turkey (animal-turkey), generated + approved 2026-10-25 (animals batch)

- [x] **Preflight.** The 🦃 glyph is used in `game/data/serbian.js` (Serbian phonics picture; Serbian phonics vocabulary). No turkey illustration existed in `game/` or `resources/`, so the row was eligible for generation.
- [x] **Category decision — animals** (STYLE_BIBLE.md §12): soft rounded body masses, simple believable anatomy, thick/clear legs, markings only as needed to identify the species, simple painted fur/feather suggestions.
- [x] **Iteration 1 (rejected):** generated with bear + star + rooster references. The rooster reference leaked its poultry silhouette (comb, body proportions) and the result read as a rooster/chicken rather than a turkey. Colour and style were fine; shape was wrong. Iteration 1 was discarded.
- [x] **Brief rewritten (iteration 2):** `prompts/turkey.md` — one turkey with a large fanned tail spread like an open fan, rounded body, small bare head with red wattle/snood (no comb, no crest), muted dark-brown plumage, fanned tail feathers radiating outward, muted blue-grey bare head. The rooster reference was **dropped** (bear + star + fox) and explicit anti-chicken/anti-rooster/anti-comb language was added.
- [x] **Reference set (iteration 2):** `bear.png` (canonical anchor) + `star.png` (canonical secondary — golden warmth for paper/finish) + `fox.png` (approved painted animal exemplar — finish and paper tone only, never its shape or colour).
- [x] **Generated (iteration 2, kept):** 1024x1024, 1,364,452 bytes, opaque. Measured: paper 215.13/202.43/187.39, palette-match vs bear 0.0204, small-size legibility proxy 143.44.
- [x] **User review: APPROVED 2026-10-25.** The row is `GENERATED / USER-APPROVED / TECHNICAL QA MEASURED` and the picture joins the approved set.
- [ ] **Not done here:** no copy into `game/assets/images/`, no glyph swap, no new smoke, no screenshot refresh, no offline pack, no `sync-docs.sh` — `game/` was not touched.

## Approved — flamingo (animal-flamingo), generated + approved 2026-10-25 (animals batch)

- [x] **Preflight.** The 🦩 glyph is used in `game/data/serbian.js` (Serbian phonics picture; Serbian phonics vocabulary). No flamingo illustration existed in `game/` or `resources/`, so the row was eligible for generation.
- [x] **Category decision — animals** (STYLE_BIBLE.md §12): soft rounded body masses, simple believable anatomy, thick/clear legs, markings only as needed to identify the species, simple painted fur/feather suggestions.
- [x] **Brief written:** `prompts/flamingo.md` — one flamingo standing in a calm friendly pose with a long curved S-shaped neck, small head with a downward-curved beak, rounded body, long thin legs (one slightly bent), soft muted pink body, beak a muted black/dark grey with lighter tip, gentle face, no exaggerated expression, no accessories, no props.
- [x] **Reference set:** `bear.png` (canonical anchor) + `star.png` (canonical secondary — golden warmth for paper/finish) + `horse.png` (approved painted animal exemplar — similar hooved build, finish and paper tone only, never its shape or warm brown colour).
- [x] **Generated (iteration 1, kept):** 1024x1024, 1,128,234 bytes, opaque. Measured: paper 244.29/237.9/227.77, palette-match vs bear 0.0207, small-size legibility proxy 26.21 (low — a pale pink on warm paper is a small luminance step; the user approved it).
- [x] **User review: APPROVED 2026-10-25.** The row is `GENERATED / USER-APPROVED / TECHNICAL QA MEASURED` and the picture joins the approved set.
- [ ] **Not done here:** no copy into `game/assets/images/`, no glyph swap, no new smoke, no screenshot refresh, no offline pack, no `sync-docs.sh` — `game/` was not touched.

## Approved — rabbit (animal-rabbit), generated + approved 2026-10-25 (animals batch)

- [x] **Preflight.** The 🐰 glyph is used in `game/games/compare.js` (comparison pool) and `game/games/spatial.js` (spatial scene). No rabbit illustration existed in `game/` or `resources/`, so the row was eligible for generation.
- [x] **Category decision — animals** (STYLE_BIBLE.md §12): soft rounded body masses, simple believable anatomy, thick/clear legs, markings only as needed to identify the species, simple painted fur suggestions.
- [x] **Brief written:** `prompts/rabbit.md` — one rabbit sitting in a calm friendly pose with a rounded body, small head, long upright ears, tiny nose, small paws, small fluffy tail, soft brownish-grey/brown body, ears with a slightly lighter inner tone, gentle face, no exaggerated expression, no accessories, no props.
- [x] **Reference set:** `bear.png` (canonical anchor) + `star.png` (canonical secondary — golden warmth for paper/finish) + `fox.png` (approved painted animal exemplar — small furry build, finish and paper tone only, never its shape or its orange colour).
- [x] **Generated (iteration 1, kept):** 1024x1024, 1,155,606 bytes, opaque. Measured: paper 233.92/226.67/215.81, palette-match vs bear 0.0194, small-size legibility proxy 81.18.
- [x] **User review: APPROVED 2026-10-25.** The row is `GENERATED / USER-APPROVED / TECHNICAL QA MEASURED` and the picture joins the approved set.
- [ ] **Not done here:** no copy into `game/assets/images/`, no glyph swap, no new smoke, no screenshot refresh, no offline pack, no `sync-docs.sh` — `game/` was not touched.

## Approved — mouse (animal-mouse), generated + approved 2026-10-25 (animals batch)

- [x] **Preflight.** The 🐭 glyph is used in `game/games/spatial.js` (spatial scene / position task). No mouse illustration existed in `game/` or `resources/`, so the row was eligible for generation.
- [x] **Category decision — animals** (STYLE_BIBLE.md §12): soft rounded body masses, simple believable anatomy, thick/clear legs, markings only as needed to identify the species, simple painted fur suggestions.
- [x] **Iteration 1 (rejected):** generated with bear + star + squirrel references. The squirrel reference leaked its bushy tail and the result came out with two tails and no visible paws. Iteration 1 was discarded.
- [x] **Brief rewritten (iteration 2):** `prompts/mouse.md` — one mouse in a calm friendly pose with a small rounded body, pointed but soft snout, large rounded ears, two small visible front paws, two small back feet, exactly ONE long thin tail extending behind. The squirrel reference was **dropped** (bear + star + bone) and explicit "exactly ONE tail, visible paws, no bushy tail" language was added.
- [x] **Reference set (iteration 2):** `bear.png` (canonical anchor) + `star.png` (canonical secondary — golden warmth for paper/finish) + `bone.png` (approved simple-object exemplar — rounded, simple, faceless form).
- [x] **Generated (iteration 2, kept):** 1024x1024, 1,435,868 bytes, opaque. Measured: paper 237.18/229.48/216.15, palette-match vs bear 0.0141, small-size legibility proxy 62.07.
- [x] **User review: APPROVED 2026-10-25.** The row is `GENERATED / USER-APPROVED / TECHNICAL QA MEASURED` and the picture joins the approved set.
- [ ] **Not done here:** no copy into `game/assets/images/`, no glyph swap, no new smoke, no screenshot refresh, no offline pack, no `sync-docs.sh` — `game/` was not touched.

## Approved — penguin (animal-penguin), generated + approved 2026-10-25 (animals batch)

- [x] **Preflight.** The 🐧 glyph is used in `game/games/animal_puzzle.js` (winter puzzle). No penguin illustration existed in `game/` or `resources/`, so the row was eligible for generation.
- [x] **Category decision — animals** (STYLE_BIBLE.md §12): soft rounded body masses, simple believable anatomy, thick/clear legs, markings only as needed to identify the species, simple painted fur/feather suggestions.
- [x] **Brief written:** `prompts/penguin.md` — one penguin standing in a calm friendly pose with an upright rounded body, small head, two flipper-like wings, two orange feet, classic black-and-white tuxedo pattern, beak and feet a soft muted orange, gentle face, no exaggerated expression, no accessories, no props.
- [x] **Reference set:** `bear.png` (canonical anchor) + `star.png` (canonical secondary — golden warmth for paper/finish) + `bird.png` (approved painted bird exemplar — finish and paper tone only, never its shape or its muted grey-brown colour).
- [x] **Generated (iteration 1, kept):** 1024x1024, 1,379,725 bytes, opaque. Measured: paper 233.14/227.28/215.68, palette-match vs bear 0.0226, small-size legibility proxy 65.22.
- [x] **User review: APPROVED 2026-10-25.** The row is `GENERATED / USER-APPROVED / TECHNICAL QA MEASURED` and the picture joins the approved set.
- [ ] **Not done here:** no copy into `game/assets/images/`, no glyph swap, no new smoke, no screenshot refresh, no offline pack, no `sync-docs.sh` — `game/` was not touched.

## Approved — owl (animal-owl), generated + approved 2026-10-25 (animals batch)

- [x] **Preflight.** The 🦉 glyph is used in `game/games/racing-config.js` (night scenery). No owl illustration existed in `game/` or `resources/`, so the row was eligible for generation.
- [x] **Category decision — animals** (STYLE_BIBLE.md §12): soft rounded body masses, simple believable anatomy, thick/clear legs, markings only as needed to identify the species, simple painted fur/feather suggestions.
- [x] **Iteration 1 (kept):** generated with bear + star + bird references. Warm brown body, belly streaks, ear tufts, big golden eyes. The user liked the body/style but wanted smaller dark open eyes. Saved as `owl-v1.png`.
- [x] **Iteration 2 (rejected):** small dark half-closed eyes (dropped bird ref, used bear + star + bone). Saved as `owl-v2.png`, then discarded.
- [x] **Iteration 3 (rejected):** small dark open eyes but body drifted. Saved as `owl-v3.png`, then discarded.
- [x] **Iteration 4 (rejected):** v1 body + small dark open eyes (bear + star + bone). Discarded.
- [x] **Decision:** keep **iteration 1** (the original with big golden eyes) as the approved owl. The user prefers the overall look despite the larger eyes.
- [x] **Brief written:** `prompts/owl.md` — one owl perched in a calm friendly pose with a rounded body, big round head, two small ear tufts, short hooked beak, warm brown body, belly streaks, gentle face.
- [x] **Reference set:** `bear.png` (canonical anchor) + `star.png` (canonical secondary — golden warmth for paper/finish) + `bird.png` (approved painted bird exemplar — finish and paper tone only, never its shape or its muted grey-brown colour).
- [x] **Generated (iteration 1, kept):** 1024x1024, 1,292,460 bytes, opaque. Measured: paper 233.34/222.82/206.76, palette-match vs bear 0.0224, small-size legibility proxy 85.74 (iteration 4 QA re-run).
- [x] **User review: APPROVED 2026-10-25.** The row is `GENERATED / USER-APPROVED / TECHNICAL QA MEASURED` and the picture joins the approved set.
- [ ] **Not done here:** no copy into `game/assets/images/`, no glyph swap, no new smoke, no screenshot refresh, no offline pack, no `sync-docs.sh` — `game/` was not touched.

## Approved — bat (animal-bat), generated + approved 2026-10-25 (animals batch)

- [x] **Preflight.** The 🦇 glyph is used in `game/games/racing-config.js` (night scenery). No bat illustration existed in `game/` or `resources/`, so the row was eligible for generation.
- [x] **Category decision — animals** (STYLE_BIBLE.md §12): soft rounded body masses, simple believable anatomy, thick/clear legs, markings only as needed to identify the species, simple painted fur suggestions.
- [x] **Iteration 1 (rejected):** generated with bear + star + bird references. Body was too stocky; user asked for rounder body with smaller body and bigger wings.
- [x] **Iteration 2 (rejected):** rounder body, but still bear-like face; user wanted mouse-like face.
- [x] **Iteration 3 (rejected):** mouse-like face + claws, but user wanted v2's color/texture with a mouse-like head and no bear reference.
- [x] **Brief rewritten (iteration 4):** `prompts/bat.md` — one bat with a small round compact body, tiny head with pointed ears, two large wings spread out, mouse-like face (pointed snout, tiny pointed ears, tiny nose, small dark eyes, NOT bear-like), tiny claws at the upper points of each wing, soft warm dark brown. References switched to `mouse.png` + `fox.png` + `bone.png` (most relevant approved references; bear/star dropped per user request).
- [x] **Reference set (iteration 4):** `mouse.png` (approved painted animal — mouse-like face and small furry body, the model for the bat's head), `fox.png` (approved painted animal — small furry build and painted finish, paper tone only, never its shape or its orange colour), `bone.png` (approved simple object — rounded, simple, faceless form, finish and paper tone).
- [x] **Generated (iteration 4, kept):** 1024x1024, 1,405,051 bytes, opaque. Measured: paper 224.83/214.24/200.71, palette-match vs bear 0.0159, small-size legibility proxy 114.72.
- [x] **User review: APPROVED 2026-10-25.** The row is `GENERATED / USER-APPROVED / TECHNICAL QA MEASURED` and the picture joins the approved set.
- [ ] **Not done here:** no copy into `game/assets/images/`, no glyph swap, no new smoke, no screenshot refresh, no offline pack, no `sync-docs.sh` — `game/` was not touched.

## Approved — monkey (animal-monkey), generated + approved 2026-10-25 (animals batch)

- [x] **Preflight.** The 🐒 glyph is used in `game/games/racing-config.js` (tropical scenery). No monkey illustration existed in `game/` or `resources/`, so the row was eligible for generation.
- [x] **Category decision — animals** (STYLE_BIBLE.md §12): soft rounded body masses, simple believable anatomy, thick/clear legs, markings only as needed to identify the species, simple painted fur suggestions.
- [x] **Brief written:** `prompts/monkey.md` — one monkey in a calm friendly pose with a rounded body, small head, long curved tail, four paws, soft warm brown body, face a slightly lighter tan/brown with a simple muzzle, long tail a matching brown, gentle face, no exaggerated expression, no accessories, no props.
- [x] **Reference set:** `bear.png` (canonical anchor) + `star.png` (canonical secondary — golden warmth for paper/finish) + `fox.png` (approved painted animal exemplar — small furry build, finish and paper tone only, never its shape or its orange colour).
- [x] **Generated (iteration 1, kept):** 1024x1024, 783,668 bytes, opaque. Measured: paper 232.98/222.28/204.9, palette-match vs bear 0.0238, small-size legibility proxy 97.23.
- [x] **User review: APPROVED 2026-10-25.** The row is `GENERATED / USER-APPROVED / TECHNICAL QA MEASURED` and the picture joins the approved set.
- [ ] **Not done here:** no copy into `game/assets/images/`, no glyph swap, no new smoke, no screenshot refresh, no offline pack, no `sync-docs.sh` — `game/` was not touched.

## Approved — flower (flower / object-flower / flower-counter), generated + approved 2026-10-25 (objects batch)

- [x] **Preflight.** The 🌼 glyph is used in `game/games/sequencing.js` (plant-growth sequence, flower step), `game/data/serbian.js:34` (phonics word `Цвет`), maze/racing decor; the 🌸 glyph is used in `game/pages/racing3d.html` (3D Racing UI flower counter). A prior `flower.png` candidate (1448x1086, pending QA/review) existed; the user asked to replace it with a new flower that also serves all flower use sites.
- [x] **Category decision — plants/nature** (STYLE_BIBLE.md §12): gentle organic curves, simple leaf/petal groups, avoid dense botanical detail, natural colors soft but identifiable.
- [x] **Brief written:** `prompts/flower.md` (renamed from `flower-counter.md`) — one small simple flower with five soft rounded petals around a small center, on a short stem with one or two small simple leaves, soft warm pink petals, gentle warm yellow center, soft muted green stem/leaves, no face, no props.
- [x] **Reference set:** `bear.png` (canonical anchor) + `star.png` (canonical secondary — golden warmth for paper/finish) + `bone.png` (approved simple-object exemplar — rounded, simple, faceless form).
- [x] **Generated (iteration 1, kept):** 1024x1024, 1,158,498 bytes, opaque. Measured: paper 243.5/234.25/220.03, palette-match vs bear 0.0226, small-size legibility proxy 29.92. Replaces the prior pending `flower.png`.
- [x] **User review: APPROVED 2026-10-25.** `flower`, `object-flower` and `flower-counter` are now all covered by this single `flower.png`. The row statuses are updated accordingly.
- [ ] **Not done here:** no copy into `game/assets/images/`, no glyph swap, no new smoke, no screenshot refresh, no offline pack, no `sync-docs.sh` — `game/` was not touched.

## Approved — house (object-house), generated + approved 2026-10-25 (objects batch)

- [x] **Preflight.** The 🏠 glyph is used in `game/games/maze.js` (maze goal marker, "house"); `maze-goal-house` reuses the same asset. No house illustration existed in `game/` or `resources/`, so the row was eligible for generation.
- [x] **Category decision — simple objects** (STYLE_BIBLE.md §12): simplify geometry without losing defining construction; same softly painted material treatment as animals and star; keep important parts (door, windows, roof) clearly separated.
- [x] **Brief written:** `prompts/house.md` — one small cozy house with a rectangular body, triangular roof, small door in the center, one or two small windows, soft warm cream/beige walls, soft warm terracotta/red-brown roof, gentle warm brown door, soft light blue or warm cream windows, no chimney smoke/fence/garden/path/extra buildings, no face, no props.
- [x] **Reference set:** `bear.png` (canonical anchor) + `star.png` (canonical secondary — golden warmth for paper/finish) + `bone.png` (approved simple-object exemplar — rounded, simple, faceless form).
- [x] **Generated (iteration 1, kept):** 1024x1024, 1,446,953 bytes, opaque. Measured: paper 240.34/230.33/216.57, palette-match vs bear 0.0214, small-size legibility proxy 45.02.
- [x] **User review: APPROVED 2026-10-25.** The row is `GENERATED / USER-APPROVED / TECHNICAL QA MEASURED` and the picture joins the approved set.
- [ ] **Not done here:** no copy into `game/assets/images/`, no glyph swap, no new smoke, no screenshot refresh, no offline pack, no `sync-docs.sh` — `game/` was not touched.

## Approved — pawprint (animal-pawprint), generated + approved 2026-10-25 (objects batch)

- [x] **Preflight.** The 🐾 glyph is used in `game/games/sorting.js` (animal-category bin label). No paw illustration existed in `game/` or `resources/`, so the row was eligible for generation.
- [x] **Category decision — simple objects** (STYLE_BIBLE.md §12): simplify geometry without losing defining construction; same softly painted material treatment as animals and star.
- [x] **Brief written:** `prompts/pawprint.md` — one simple paw print with four small rounded toe pads arranged in an arc above one larger rounded main pad, soft warm brown, no extra toes/claws/fur/animal, no face, no props.
- [x] **Reference set:** `bear.png` (canonical anchor) + `star.png` (canonical secondary — golden warmth for paper/finish) + `bone.png` (approved simple-object exemplar — rounded, simple, faceless form).
- [x] **Generated (iteration 1, kept):** 1024x1024, 1,443,467 bytes, opaque. Measured: paper 237.12/223.72/209.17, palette-match vs bear 0.0234, small-size legibility proxy 77.78.
- [x] **User review: APPROVED 2026-10-25.** The row is `GENERATED / USER-APPROVED / TECHNICAL QA MEASURED` and the picture joins the approved set.
- [ ] **Not done here:** no copy into `game/assets/images/`, no glyph swap, no new smoke, no screenshot refresh, no offline pack, no `sync-docs.sh` — `game/` was not touched.

## Approved — drum (music-drum), generated + approved 2026-10-25 (objects batch)

- [x] **Preflight.** The 🥁 glyph is used in `game/games/rhythm.js` (four rhythm pads, each labelled with a drum emoji despite different pitches). No drum illustration existed in `game/` or `resources/`, so the row was eligible for generation.
- [x] **Category decision — simple objects** (STYLE_BIBLE.md §12): simplify geometry without losing defining construction; same softly painted material treatment as animals and star; keep important parts (drumheads, body) clearly separated.
- [x] **Brief written:** `prompts/drum.md` — one simple drum with a short cylindrical body, circular drumhead on top and bottom, soft warm brown (or muted terracotta) body, soft warm cream/off-white drumheads, a few simple soft lacing lines, no drumsticks/hands/stand/extra drums, no face, no props.
- [x] **Reference set:** `bear.png` (canonical anchor) + `star.png` (canonical secondary — golden warmth for paper/finish) + `bone.png` (approved simple-object exemplar — rounded, simple, faceless form).
- [x] **Generated (iteration 1, kept):** 1024x1024, 990,202 bytes, opaque. Measured: paper 234.98/219.58/202.67, palette-match vs bear 0.0201, small-size legibility proxy 81.01.
- [x] **User review: APPROVED 2026-10-25.** The row is `GENERATED / USER-APPROVED / TECHNICAL QA MEASURED` and the picture joins the approved set.
- [ ] **Not done here:** no copy into `game/assets/images/`, no glyph swap, no new smoke, no screenshot refresh, no offline pack, no `sync-docs.sh` — `game/` was not touched.

## Approved — pickaxe (kitty-pickaxe), generated + approved 2026-10-25 (objects batch)

- [x] **Preflight.** The ⛏ glyph is used in `game/games/kitty-standalone.js` (cave object/effect glyph). No pickaxe illustration existed in `game/` or `resources/`, so the row was eligible for generation.
- [x] **Category decision — simple objects** (STYLE_BIBLE.md §12): simplify geometry without losing defining construction; same softly painted material treatment as animals and star; keep important parts (handle, head) clearly separated.
- [x] **Iterations 1-6 (rejected):** the metal head kept coming out star-like or not matching a real pickaxe. The golden-star reference was leaking its five-pointed silhouette; iterations 2-6 tried dropping the star, longer/pointier tips, and a detailed crescent description, but the shape still didn't match a real pickaxe.
- [x] **Brief rewritten (iteration 7):** `prompts/pickaxe.md` — used two real pickaxe photos (`Reference/CK-2738_02_crkt.jpeg` and `Reference/istockphoto-967674060-612x612.jpg`, converted to PNG) as **subject** references (copy their shape and proportions: crescent head, central collar with oval hole, long pointed pick, flat adze blade, handle) while `bear.png` and `bone.png` provided the painted finish. The star reference was dropped. The prompt includes a detailed description of the pickaxe head (crescent, central collar/eye, pointed pick, flat blade, hammered texture, polished silver tips).
- [x] **Reference set (iteration 7):** `pickaxe-ref.png` (subject, from CK-2738 photo) + `pickaxe-ref2.png` (subject, from istockphoto photo) + `bear.png` (style anchor) + `bone.png` (simple-object exemplar).
- [x] **Generated (iteration 7, kept):** 1024x1024, 1,330,132 bytes, opaque. Measured: paper 238.94/229.56/216.71, palette-match vs bear 0.0187, small-size legibility proxy 48.27.
- [x] **User review: APPROVED 2026-10-25.** The row is `GENERATED / USER-APPROVED / TECHNICAL QA MEASURED` and the picture joins the approved set.
- [ ] **Not done here:** no copy into `game/assets/images/`, no glyph swap, no new smoke, no screenshot refresh, no offline pack, no `sync-docs.sh` — `game/` was not touched.

## Approved — student (object-student), generated + approved 2026-10-25 (objects batch)

- [x] **Preflight.** The 🧑‍🎓 glyph is used in `game/data/serbian.js` (Serbian phonics picture). No student illustration existed in `game/` or `resources/`, so the row was eligible for generation.
- [x] **Category decision — simple objects / people** (STYLE_BIBLE.md §12): simplify geometry without losing defining construction; same softly painted material treatment as animals and star; keep important parts clearly separated; no face over-detail beyond gentle expression.
- [x] **Brief written:** `prompts/student.md` — one young child standing in a calm friendly pose with a small rounded head, simple body, simple clothes (shirt + small book/backpack), soft warm light skin, soft warm brown hair, gentle muted colour clothes, gentle simple face (small dark eyes, simple nose/mouth, calm friendly expression), no graduation cap/gown/diploma, no face accessories, no props beyond a small book.
- [x] **Reference set:** `bear.png` (canonical anchor) + `star.png` (canonical secondary — golden warmth for paper/finish) + `bone.png` (approved simple-object exemplar — rounded, simple, faceless form).
- [x] **Generated (iteration 1, kept):** 1024x1024, 1,403,161 bytes, opaque. Measured: paper 236.06/226.34/210.85, palette-match vs bear 0.0203, small-size legibility proxy 67.89.
- [x] **User review: APPROVED 2026-10-25.** The row is `GENERATED / USER-APPROVED / TECHNICAL QA MEASURED` and the picture joins the approved set.
- [ ] **Not done here:** no copy into `game/assets/images/`, no glyph swap, no new smoke, no screenshot refresh, no offline pack, no `sync-docs.sh` — `game/` was not touched.

## Approved — screen (object-screen), generated + approved 2026-10-25 (objects batch)

- [x] **Preflight.** The 🖥️ glyph is used in `game/data/serbian.js` (Serbian phonics picture). No screen illustration existed in `game/` or `resources/`, so the row was eligible for generation.
- [x] **Category decision — simple objects** (STYLE_BIBLE.md §12): simplify geometry without losing defining construction; same softly painted material treatment as animals and star; keep important parts (monitor, screen) clearly separated.
- [x] **Brief written:** `prompts/screen.md` — one simple computer monitor with a rectangular screen, thin bezel, small simple stand, soft warm grey or warm brown bezel, soft warm light blue or cream blank screen, no keyboard/mouse/cable/text on screen, no face, no props.
- [x] **Reference set:** `bear.png` (canonical anchor) + `star.png` (canonical secondary — golden warmth for paper/finish) + `bone.png` (approved simple-object exemplar — rounded, simple, faceless form).
- [x] **Generated (iteration 1, kept):** 1024x1024, 1,187,208 bytes, opaque. Measured: paper 234.79/229.06/214.61, palette-match vs bear 0.0115, small-size legibility proxy 41.6.
- [x] **User review: APPROVED 2026-10-25.** The row is `GENERATED / USER-APPROVED / TECHNICAL QA MEASURED` and the picture joins the approved set.
- [ ] **Not done here:** no copy into `game/assets/images/`, no glyph swap, no new smoke, no screenshot refresh, no offline pack, no `sync-docs.sh` — `game/` was not touched.

## Approved — needle (object-needle), generated + approved 2026-10-25 (objects batch)

- [x] **Preflight.** The 🪡 glyph is used in `game/data/serbian.js` (Serbian phonics picture; Serbian phonics vocabulary). No needle illustration existed in `game/` or `resources/`, so the row was eligible for generation.
- [x] **Category decision — simple objects** (STYLE_BIBLE.md §12): simplify geometry without losing defining construction; same softly painted material treatment as animals and star; keep important parts (needle, thread) clearly separated.
- [x] **Iteration 1 (rejected):** the needle came out too thick. User asked for a thinner needle.
- [x] **Brief rewritten (iteration 2):** `prompts/needle.md` — one very thin, slightly curved metal needle with a small eye at one end, and a short length of thread passing through the eye and trailing gently. The needle must be noticeably thinner and more slender — a delicate, fine needle, not a thick pin or rod. Painted soft muted grey-blue (metal) + soft warm cream thread.
- [x] **Reference set:** `bear.png` (canonical anchor) + `star.png` (canonical secondary — golden warmth for paper/finish) + `bone.png` (approved simple-object exemplar — rounded, simple, faceless form).
- [x] **Generated (iteration 2, kept):** 1024x1024, 1,201,371 bytes, opaque. Measured: paper 239.08/231.82/221.16, palette-match vs bear 0.0106, small-size legibility proxy 13.58.
- [x] **User review: APPROVED 2026-10-25.** The row is `GENERATED / USER-APPROVED / TECHNICAL QA MEASURED` and the picture joins the approved set. `object-needle-thread` is covered by this same asset.
- [ ] **Not done here:** no copy into `game/assets/images/`, no glyph swap, no new smoke, no screenshot refresh, no offline pack, no `sync-docs.sh` — `game/` was not touched.

## Approved — nose (object-nose), generated + approved 2026-10-25 (objects batch)

- [x] **Preflight.** The 👃 glyph is used in `game/data/serbian.js` (body-part phonics picture; Serbian phonics vocabulary). No nose illustration existed in `game/` or `resources/`, so the row was eligible for generation.
- [x] **Category decision — simple objects** (STYLE_BIBLE.md §12): simplify geometry without losing defining construction; same softly painted material treatment as animals and star.
- [x] **Iteration 1 (rejected):** too round; user wanted a real nose silhouette.
- [x] **Iteration 2 (rejected):** too much side/profile view; user preferred the forward-facing first version.
- [x] **Iteration 3 (rejected):** forward-facing with real silhouette, but user wanted another retry with reference photos.
- [x] **Brief rewritten (iteration 4):** `prompts/nose.md` — used two real nose photos (`Reference/images (1).jpeg` and `Reference/images (2).jpeg`, converted to PNG) as **subject** references (copy their shape and proportions: a real nose silhouette with bridge, tip, nostrils) while `bear.png` and `bone.png` provided the painted finish. The star reference was dropped.
- [x] **Reference set (iteration 4):** `nose-ref1.png` (subject, from images (1).jpeg) + `nose-ref2.png` (subject, from images (2).jpeg) + `bear.png` (style anchor) + `bone.png` (simple-object exemplar).
- [x] **Generated (iteration 4, kept):** 1024x1024, 1,326,005 bytes, opaque. Measured: paper 242.86/230.99/213.84, palette-match vs bear 0.0224, small-size legibility proxy 44.5.
- [x] **User review: APPROVED 2026-10-25.** The row is `GENERATED / USER-APPROVED / TECHNICAL QA MEASURED` and the picture joins the approved set.
- [ ] **Not done here:** no copy into `game/assets/images/`, no glyph swap, no new smoke, no screenshot refresh, no offline pack, no `sync-docs.sh` — `game/` was not touched.

## Approved — eye (object-eye), generated + approved 2026-10-25 (objects batch)

- [x] **Preflight.** The 👁️ glyph is used in `game/data/serbian.js` (body-part phonics picture; Serbian phonics vocabulary). No eye illustration existed in `game/` or `resources/`, so the row was eligible for generation.
- [x] **Category decision — simple objects** (STYLE_BIBLE.md §12): simplify geometry without losing defining construction; same softly painted material treatment as animals and star.
- [x] **Brief written:** `prompts/eye.md` — one simple human eye: almond-shaped eye with a coloured iris and dark pupil, a few simple eyelashes on the upper lid, soft warm brown (or gentle blue-green) iris, soft dark brown/black pupil, soft warm cream sclera, no eyebrow/tears/glasses, no face, no props.
- [x] **Reference set:** `bear.png` (canonical anchor) + `star.png` (canonical secondary — golden warmth for paper/finish) + `bone.png` (approved simple-object exemplar — rounded, simple, faceless form).
- [x] **Generated (iteration 1, kept):** 1024x1024, 1,133,241 bytes, opaque. Measured: paper 240.38/231.36/220.5, palette-match vs bear 0.0232, small-size legibility proxy 55.99.
- [x] **User review: APPROVED 2026-10-25.** The row is `GENERATED / USER-APPROVED / TECHNICAL QA MEASURED` and the picture joins the approved set.
- [ ] **Not done here:** no copy into `game/assets/images/`, no glyph swap, no new smoke, no screenshot refresh, no offline pack, no `sync-docs.sh` — `game/` was not touched.

## Approved — pig-nose (object-pig-nose), generated + approved 2026-10-25 (objects batch)

- [x] **Preflight.** The 🐽 glyph is used in `game/data/serbian.js` (word for snout; Serbian phonics vocabulary). No pig-snout illustration existed in `game/` or `resources/`, so the row was eligible for generation.
- [x] **Category decision — simple objects** (STYLE_BIBLE.md §12): simplify geometry without losing defining construction; same softly painted material treatment as animals and star.
- [x] **Brief written:** `prompts/pig-nose.md` — one simple pig snout: a rounded, slightly flattened disc with two large nostril openings, soft warm pink, no face, no extra facial features, no props.
- [x] **Reference set:** `bear.png` (canonical anchor) + `star.png` (canonical secondary — golden warmth for paper/finish) + `pig.png` (approved painted pig exemplar — finish and paper tone only, never its shape or its pink colour).
- [x] **Generated (iteration 1, kept):** 1024x1024, 924,844 bytes, opaque. Measured: paper 237.46/227.04/217.02, palette-match vs bear 0.0093, small-size legibility proxy 36.7.
- [x] **User review: APPROVED 2026-10-25.** The row is `GENERATED / USER-APPROVED / TECHNICAL QA MEASURED` and the picture joins the approved set. `object-pig-snout` is covered by this same asset.
- [ ] **Not done here:** no copy into `game/assets/images/`, no glyph swap, no new smoke, no screenshot refresh, no offline pack, no `sync-docs.sh` — `game/` was not touched.

## Approved — ear (object-ear), generated + approved 2026-10-25 (objects batch)

- [x] **Preflight.** The 👂 glyph is used in `game/data/serbian.js` (body-part phonics picture; Serbian phonics vocabulary). No ear illustration existed in `game/` or `resources/`, so the row was eligible for generation.
- [x] **Category decision — simple objects** (STYLE_BIBLE.md §12): simplify geometry without losing defining construction; same softly painted material treatment as animals and star.
- [x] **Brief written:** `prompts/ear.md` — one simple human ear with a rounded outer pinna and gentle inner fold, soft warm skin tone, no face or accessories.
- [x] **Reference set:** `bear.png` (canonical anchor) + `star.png` (canonical secondary — golden warmth for paper/finish) + `bone.png` (approved simple-object exemplar — rounded, simple form).
- [x] **Generated (iteration 1, kept):** 1024x1024, 770,630 bytes, opaque. Measured: paper 240.56/233.81/225.35, palette-match vs bear 0.0169, small-size legibility proxy 33.93.
- [x] **User review: APPROVED 2026-10-25.** The inventory row is `GENERATED / USER-APPROVED / TECHNICAL QA MEASURED` and the picture joins the approved set.
- [ ] **Not done here:** no copy into `game/assets/images/`, no glyph swap, no new smoke, no screenshot refresh, no offline pack, no `sync-docs.sh` — `game/` was not touched.

## Approved — helicopter (object-helicopter), generated + approved 2026-10-25 (objects batch)

- [x] **Preflight.** `game/data/serbian.js:33` uses 🚁 for the phonics word `Хеликоптер`. No helicopter image or same-named asset existed in the WIP bundle or repository.
- [x] **Category decision — simple objects** (STYLE_BIBLE.md §12): preserve the defining helicopter construction with a softly painted, simplified finish.
- [x] **Brief written:** `prompts/helicopter.md` — one civilian helicopter with cabin, main rotor, tail boom/rotor and landing skids; no military markings, face, people or scenery.
- [x] **Reference set:** `bear.png` (style anchor) + `star.png` (paper/finish) + `bone.png` (simple-object finish and detail level).
- [x] **Generated (iteration 1, kept):** 1024x1024, 1,213,639 bytes, opaque. Measured: paper 238.26/234.76/222.32, palette-match vs bear 0.0126, small-size legibility proxy 44.76.
- [x] **User review: APPROVED 2026-10-25.** The inventory row is `GENERATED / USER-APPROVED / TECHNICAL QA MEASURED`.
- [ ] **Not done here:** no copy into `game/assets/images/`, no glyph swap, no new smoke, no screenshot refresh, no offline pack, no `sync-docs.sh` — `game/` was not touched.

## Approved — car (object-car), generated + approved 2026-10-25 (objects batch)

- [x] **Preflight.** `game/data/serbian.js:8` uses 🚗 for `Аутомобил`. No car asset existed in the WIP bundle. The existing `game/assets/images/driving-car.png` is a flat graphic, not the painted family style, so it was used as a subject reference rather than reused as the WIP illustration.
- [x] **Category decision — simple objects** (STYLE_BIBLE.md §12): retain the existing car's blue colour and shape while adapting its rendering to the softly painted family style.
- [x] **Brief written:** `prompts/car.md` — one complete blue passenger car; no driver, brand markings, road or scenery.
- [x] **Reference set:** `driving-car.png` (subject only: shape and blue colour) + `helicopter.png` and `screen.png` (painted style only).
- [x] **Generated (iteration 1, kept):** 1024x1024, 1,501,706 bytes, opaque. Measured: paper 228.42/221.66/210.94, palette-match vs bear 0.0158, small-size legibility proxy 82.64.
- [x] **User review: APPROVED 2026-10-25.** The inventory row is `GENERATED / USER-APPROVED / TECHNICAL QA MEASURED`.
- [ ] **Not done here:** no copy into `game/assets/images/`, no glyph swap, no new smoke, no screenshot refresh, no offline pack, no `sync-docs.sh` — `game/` was not touched.

## Approved — parrot (object-parrot), generated + approved 2026-10-29 (task 289)

- [x] **Preflight.** `object-parrot` was the only approved-queue asset without a PNG (`prompts/parrot.md` had been prepared on 2026-10-26 but every live request returned Cloudflare HTTP 429/code 4006). It is used by the dino and racing tropical collectible/scenery paths; no parrot illustration existed in the bundle.
- [x] **Iteration 1 (discarded):** brief as prepared on 2026-10-26, references `bear.png` + `star.png` + `bird.png` (3 refs). Generated 1024x1024, 1,167,195 bytes, palette-match 0.0486, small contrast 91.2. **User feedback: too much like a regular bird/canary — not obviously a parrot.**
- [x] **Iteration 2 (discarded):** brief rewritten with parrot-specific anatomy (hooked beak ~1/4 of the head, upright chest-forward posture, long pointed tail past the feet, small rounded crest, cheek patch, 2+2 toes) and the `bird.png` reference **dropped** because its songbird construction was feeding the wrong silhouette; references `bear.png` + `star.png` (2 refs). Generated 1024x1024, 816,057 bytes, palette-match 0.6663, small contrast 82.5. **User feedback: a bit better, but go for the Scarlet macaw (Ara macao) — the default recognizable parrot.**
- [x] **Iteration 3 (approved):** brief rewritten to the Scarlet macaw pattern — scarlet red body, bare white face patch, large ivory hooked beak, yellow wing band, blue wing tips and blue tail tip, long scarlet tail — plus explicit exclusions for green bodies, small beaks, stubby tails and songbird posture. References `bear.png` + `star.png`.
- [x] **Generated (iteration 3, kept):** 1024x1024, 1,034,261 bytes, opaque. Measured: paper 218.16/206.9/206.9, palette-match vs bear 0.1234, small-size legibility proxy 128.63.
- [x] **User review: APPROVED 2026-10-29.** The inventory row is `GENERATED / USER-APPROVED / TECHNICAL QA MEASURED`.
- [ ] **Not done here:** no copy into `game/assets/images/`, no glyph swap, no new smoke, no screenshot refresh, no offline pack, no `sync-docs.sh` — `game/` was not touched.

## Approved — satellite (object-satellite), generated + approved 2026-10-29 (task 289)

- [x] **Preflight.** `game/games/space.js:220` uses `🛰️` for «Свемирска станица»; the bundle held `moon.png`, `planet.png`, `rocket.png` and `star.png` but no satellite, so the row was duplicate-free.
- [x] **Iteration 1 (discarded):** prepared brief unchanged, references `bear.png` + `star.png` + `bone.png`. Generated 1024x1024, 1,012,749 bytes, palette-match 0.6746, small contrast 55.78. **User feedback: it looks like a ball with something strapped on it.**
- [x] **Iteration 2 (approved):** brief rewritten for an unmistakable satellite silhouette — flat boxy/short-cylindrical body (explicitly not a ball), two large rectangular solar-panel wings with visible grid cells and booms as the widest part of the picture, top dish antenna, short antenna rod, thruster nozzle; exclusions added for spherical bodies, straps/belts/fabric, balloons. References unchanged.
- [x] **Generated (iteration 2, kept):** 1024x1024, 966,202 bytes, opaque. Measured: paper 221.87/227.03/235.74, palette-match vs bear 0.6591, small-size legibility proxy 117.22.
- [x] **User review: APPROVED 2026-10-29.** The inventory row is `GENERATED / USER-APPROVED / TECHNICAL QA MEASURED`.
- [ ] **Not done here:** no copy into `game/assets/images/`, no glyph swap, no new smoke, no screenshot refresh, no offline pack, no `sync-docs.sh` — `game/` was not touched.

## Regenerated — moon (object-moon), full moon, approved 2026-10-29 (task 289)

- [x] **Preflight.** The row was already `GENERATED / USER-APPROVED` from the 2026-10-26 objects batch, but the user reported at play-test review that the picture reads as a young crescent moon and asked for a full moon with craters, closer to the real moon. The brief is rewritten in place (`prompts/moon.md`) and the asset regenerated as iteration 2.
- [x] **Iteration 1 (replaced):** broad crescent moon, 1024x1024, palette-match 0.6799, small contrast 26.03.
- [x] **Iteration 2 (approved):** brief specifies one complete round, evenly lit disc, 4-6 soft shallow craters (one larger upper-left), warm pale cream-yellow; explicitly bans crescents, shadow sides, faces and ball/cookie/cheese readings. References `bear.png` + `star.png` + `bone.png`.
- [x] **Generated (iteration 2, kept):** 1024x1024, 822,917 bytes, opaque. Measured: paper 239.97/236.92/228.73, palette-match vs bear 0.1786, small-size legibility proxy 21.88 (low — a pale moon on warm paper is a small luminance step, the same class as the approved `bone` 32.61 and `egg` 39.66).
- [x] **User review: APPROVED 2026-10-29.** The inventory row stays `GENERATED / USER-APPROVED / TECHNICAL QA MEASURED`, now with the iteration-2 measurements.
- [ ] **Not done here:** no copy into `game/assets/images/`, no glyph swap, no new smoke, no screenshot refresh, no offline pack, no `sync-docs.sh` — `game/` was not touched.
