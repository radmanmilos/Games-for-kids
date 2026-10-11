# Petra's World — Emoticon Replacement Inventory

**Status:** Source-audit draft v0.2 — findings below are confirmed from current `game/` source/search results, but this is **not yet certified exhaustive**. Review before generation.  
**Scope:** Replace existing emoji/emoticon pictographs used as game artwork. Do not redesign games or replace proper illustrations, character sprites, 3D models, CSS/SVG controls, or ordinary text.

## Fixed reference images

- **Bear:** exact user-supplied seated honey-brown bear image.
- **Star:** exact user-supplied plain golden-yellow five-point star image.
- These are style references, not a license to replace them with a different bear/star. Store reference files under `resources/General_reviews/Asset_Generation/references/` when available.

## Scope constraints

- Explorer: preserve existing explorer character sprites/animation frames; inventory only emoticons used as other game objects/effects.
- Kitty: preserve existing Kitty character sprites/animation frames; inventory only emoticons used as other game objects/effects.
- 3D Racing: preserve 3D models, geometry, environment, lighting, and rendering. Replace only emoji glyphs used as visuals in HTML/UI or game feedback. Do not turn 3D game objects into flat image assets unless source inspection proves the object itself is an emoji.
- Other games: include only emoji/pictographs actually used as game visuals, prompts, rewards, or decoration.
- Standard controls (back, arrows, sound, retry, play/pause, close) should remain or become consistent SVG/CSS icons, not watercolor illustrations.
- Reuse one approved asset across games whenever the same object has the same meaning.
- `docs/` duplicates and test-only references are not separate runtime uses. Canonical runtime scope is `game/`.
- Do not generate anything until inventory rows are verified and approved.

## Source-confirmed candidate inventory

The rows below are based on actual glyphs/emoji fields found in current `game/` source. The same concept is consolidated where practical. **“Review” means the user must decide whether to replace it with a storybook image, retain it as an icon, or remove it.** This is not a request to generate every row.

| ID | Current glyph / visual | Confirmed source location(s) | Current purpose | Proposed treatment | Status |
|---|---|---|---|---|---|
| animal-dog | 🐶 | `game/games/animals.js`, `animal_counting.js`, `candy.js`, `spatial.js`, `sorting.js` | Animal flashcard/counting, candy game's animal set, spatial scene, sorting item | One shared simple dog PNG for all object/animal-card uses | REVIEW |
| animal-cat | 🐱 | `game/games/animals.js`, `animal_counting.js`, `sorting.js` | Animal flashcard/counting and sorting item | One shared simple cat PNG | REVIEW |
| animal-cow | 🐮 | `game/games/animals.js`, `animal_counting.js`, `candy.js` | Animal flashcard/counting and candy-game set | One shared simple cow PNG | REVIEW |
| animal-lion | 🦁 | `game/games/animals.js` | Animal flashcard | Simple lion PNG | REVIEW |
| animal-elephant | 🐘 | `game/games/animals.js` | Animal flashcard | Simple elephant PNG | REVIEW |
| animal-frog | 🐸 | Mentioned in the animals smoke-test mapping; verify runtime list in full source | Animal flashcard/name mapping | Generate only if runtime list uses it | AUDIT |
| animal-pig | 🐷 | `game/games/animal_counting.js`, `candy.js` | Counting and candy-game set | One shared simple pig PNG | REVIEW |
| animal-duck | 🦆 | `game/games/animal_counting.js`, `candy.js`, `spatial.js` | Counting, candy-game set, spatial scene | Simple duck in the bear's low-detail style; avoid the rejected elaborate duckling look | REVIEW |
| animal-fox | 🦊 | Mentioned in the animals smoke-test mapping; verify runtime list in full source | Animal flashcard/name mapping | Generate only if runtime list uses it | AUDIT |
| animal-sheep | 🐑 | Mentioned in the animals smoke-test mapping; verify runtime list in full source | Animal flashcard/name mapping | Generate only if runtime list uses it | AUDIT |
| animal-horse | 🐴 | `game/games/animal_counting.js`; also candy smoke-test set | Counting and candy-game set | One shared simple horse PNG | REVIEW |
| animal-chicken | 🐔 | `game/games/animal_counting.js`; also candy smoke-test set | Counting and candy-game set | One shared simple chicken PNG | REVIEW |
| animal-bear | 🐻 | `game/games/maze.js` | Maze start marker (“bear”) | Use the exact supplied bear reference if appropriate; assess scale/transparent crop | REVIEW |
| object-bone | 🦴 | `game/games/spatial.js` | Object in “Where is the bone?” spatial task | Simple bone PNG; keep silhouette clear | REVIEW |
| object-house | 🏠 | `game/games/maze.js` | Maze goal marker (“house”) | Simple cozy house PNG | REVIEW |
| food-apple | 🍎 | `game/games/sorting.js` | Food sorting bin/item | One shared simple apple PNG | REVIEW |
| animal-pawprint | 🐾 | `game/games/sorting.js` | Animal-category bin label | Prefer a small paw icon (SVG or simple illustration); not necessarily watercolor | REVIEW |
| shape-blue-circle | 🔵 | `game/games/classroom.js` | Shape presentation | Replace emoji-like shape glyph with exact vector geometry/SVG, not generated raster art | SVG/CSS |
| shape-purple-square | 🟪 | `game/games/classroom.js` | Shape presentation | Use vector geometry/SVG | SVG/CSS |
| shape-red-triangle | 🔺 | `game/games/classroom.js` | Shape presentation | Use vector geometry/SVG | SVG/CSS |
| reward-star | ⭐ | `game/games/classroom.js`, `game/games/piano.js` | Shape presentation and song-chip label | Distinguish shape-learning star from reward star; use SVG for geometry, use supplied star reference only where a reward illustration is semantically correct | REVIEW |
| music-drum | 🥁 | `game/games/rhythm.js` | Four rhythm pads, each labelled with a drum emoji despite different pitches | One simple illustrated drum reused across pads; alternatively use distinct drum-size variants only if musically meaningful | REVIEW |
| plant-seedling | 🌱 | `game/games/sequencing.js` | Plant-growth sequence, seed step | Simple seedling PNG | REVIEW |
| plant-leaves | 🌿 | `game/games/sequencing.js`, adventure world names may use similar symbols | Plant-growth sequence, plant step | One simple leafy plant PNG if visual meaning matches | REVIEW |
| flower | 🌼 | `game/games/sequencing.js` | Plant-growth sequence, flower step | Simple flower PNG; reuse only when meaning and scale fit | REVIEW |
| flower-counter | 🌸 | `game/pages/racing3d.html` | 3D Racing UI flower counter | Small flat storybook flower or a consistent icon; do not alter the 3D world model | REVIEW |
| celebration-confetti | 🎉 | `game/shared/celebration.js` fallback | Shared celebration overlay | Prefer a restrained celebration animation using CSS/SVG and/or approved star; avoid one large emoji glyph | REVIEW |
| winter-snowflake | ❄ | `game/games/animal_puzzle.js` | Winter scene decoration drawn on canvas | Simple snowflake as SVG/canvas vector; generated watercolor not needed | SVG/CSS |
| adventure-fish | 🐟 | `game/games/adventure-modes.js` | Animated underwater decoration drawn on canvas | Small fish PNG or simple procedural fish; preserve game engine and motion | REVIEW |
| kitty-fish | 🐟 | `game/games/kitty-standalone.js` | Animated underwater decoration; Kitty character itself is out of scope | Reuse adventure-fish if visually appropriate | REVIEW |
| kitty-pickaxe | ⛏ | `game/games/kitty-standalone.js` | Cave object/effect glyph | Small pickaxe PNG only if it is a visible gameplay object; otherwise simple SVG | REVIEW |
| piano-song-star | ⭐ | `game/games/piano.js` | Song chip label for “Twinkle, Twinkle” | Prefer text label / small SVG star icon; do not automatically use reward illustration | REVIEW |
| r3d-title-car | 🏎️ | `game/pages/racing3d.html` | Page title decoration | Remove glyph or use project car icon/SVG; no generated watercolor asset required by default | REVIEW |
| r3d-flower-counter | 🌸 | `game/pages/racing3d.html` | Flower/collectible counter | See shared flower row; keep 3D gameplay rendering unchanged | REVIEW |
| r3d-world-button | 🌍 | `game/pages/racing3d.html` | World-selection UI | Consistent SVG UI icon or remove redundant decoration | UI ICON |
| r3d-music-on | 🔊 | `game/pages/racing3d.html` | Music button state | Consistent SVG UI icon | UI ICON |
| r3d-music-off | 🔇 | `game/pages/racing3d.html` | Music button state | Consistent SVG UI icon | UI ICON |
| r3d-win-flag | 🏁 | `game/pages/racing3d.html` | Start/win modal decoration | Small SVG flag or remove decoration; not necessarily a generated illustration | REVIEW |
| r3d-next-world-arrow | ➡️ | `game/pages/racing3d.html` | Next-world button | SVG arrow or text; no generated illustration | UI ICON |
| r3d-restart-arrow | 🔄 | `game/pages/racing3d.html` | Restart button | SVG retry icon or text; no generated illustration | UI ICON |
| r3d-favicon-car | 🏎️ | `game/pages/racing3d.html` | Inline SVG favicon containing emoji text | Replace with a real SVG/project icon if desired; outside illustration batch | APP ICON |
| maze-start-bear | 🐻 | `game/games/maze.js` | Start marker | Same exact bear reference as animal-bear; avoid duplicate file | REVIEW |
| maze-goal-house | 🏠 | `game/games/maze.js` | Goal marker | Same house asset as object-house | REVIEW |

## Source-backed data and rendering systems requiring a full pass

The following sources contain or likely render emoji-backed content. Their exact full glyph inventories still need to be enumerated from source data before this document can be marked exhaustive:

- `game/data/serbian.js` — alphabet/phonics picture vocabulary includes emoji fields (confirmed examples include 🍌 banana, 🐺 wolf, 🐛 caterpillar, 👂 ear, 🦩 flamingo, 🚁 helicopter). Must inventory the complete data array and consolidate with game objects.
- `game/games/adventure.js` and `game/games/adventure-modes.js` — theme hero/collectible fields and canvas glyph rendering. Preserve existing character sprites where used; only non-character emoji objects are in scope. Identify exact collectible glyphs per theme.
- `game/games/animal_memory.js`, `game/games/animal_puzzle.js`, `game/games/ocean.js`, `space.js`, `dino.js`, `driving.js` — search their actual draw/render paths for emoji fields/glyphs; do not assume every concept is an emoji.
- `game/games/compare.js` — dynamic emoji selected at runtime; exact candidate pool must be captured from `pickEmoji()`.
- `game/games/kitty-standalone.js` — Kitty character/sprite and animation frames are explicitly out of scope; only other emoji objects/effects can be listed.
- `game/games/racing3d.mjs` — inspect actual render path separately. Do not treat configured 3D pickups/obstacles as emoji if they are already mesh geometry.
- `game/pages/*.html` and `game/shared/*.js` — scan for visible emoji in headings, buttons, feedback, page decorations, and shared celebration.
- `game/index.html` — landing/learning tiles include emoji pictographs; decide whether these count as artwork replacements or should remain UI glyphs.
- `game/games/animals.js`, `animal_counting.js`, `candy.js`, `sorting.js`, `spatial.js`, `classroom.js`, `sequencing.js`, `rhythm.js`, `piano.js`, `maze.js`, `animal_puzzle.js` — confirmed candidate rows above, but each full array/scene should be checked to capture any additional glyphs.

## Explicit exclusions

- All Explorer character sprites/animation frames.
- All Kitty character sprites/animation frames.
- All 3D Racing models, meshes, geometry, world objects, lighting, and rendering.
- Existing good PNG illustrations (including dinosaurs and driving car) unless separately approved for replacement.
- Numeric/letter glyphs, ordinary text, UI arrows, sound controls, and basic geometric shapes when SVG/CSS is more suitable.
- Any emoji appearing only in tests, documentation, comments, or duplicate `docs/` files; those are not runtime asset uses.

## Inventory row requirements

Every final row must include:
1. Stable asset ID
2. Exact game/component and source file
3. Exact current emoji glyph(s)
4. Meaning/use and whether interactive/decorative
5. Shared asset ID where reuse is possible
6. Treatment: generated illustration / SVG-CSS icon / keep text / remove decoration
7. Status: AUDIT / REVIEW / APPROVED / GENERATED / QA / READY FOR IMPLEMENTATION
8. Implementation notes and QA caveats

## Completion gate

This inventory is **not final for generation** until:
- all canonical `game/` runtime source and data files have been searched for emoji/pictograph literals and emoji-valued data fields;
- dynamic emoji pools and per-world themes have been enumerated;
- shared/page-level emoji have been reviewed;
- duplicate concepts have been consolidated;
- existing image assets and the excluded Explorer/Kitty/3D Racing areas have been checked;
- the user has approved which rows are to be illustrated, handled as SVG/CSS, or left unchanged.
