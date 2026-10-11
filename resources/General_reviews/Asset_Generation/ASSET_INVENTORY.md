# Petra's World — Emoticon Replacement Inventory

**Status:** Source-audit draft v0.3 — canonical `game/` JavaScript modules, data, page HTML, shared modules, and major runtime configs have been inspected for literal emoji. This is substantially broader, but dynamic/runtime construction and any missed files still require a final automated repo-wide check. Review before generation.  
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

## Additional source-confirmed candidates from the expanded all-pages audit

| ID | Current glyph / visual | Confirmed source location(s) | Current purpose | Proposed treatment | Status |
|---|---|---|---|---|---|
| object-car | 🚗 | `game/data/serbian.js`, `game/index.html`, driving favicon | Serbian phonics object and hub tile/icon | Reuse existing driving-car illustration if visually appropriate; favicon/UI may remain icon | REVIEW |
| food-banana | 🍌 | `game/data/serbian.js`, Kitty collectible themes | Phonics vocabulary and collectible theme | One shared banana asset | REVIEW |
| animal-wolf | 🐺 | `game/data/serbian.js` | Serbian phonics picture | Simple wolf asset | REVIEW |
| animal-caterpillar | 🐛 | `game/data/serbian.js`, `sequencing.js` | Phonics and life-cycle sequence | One shared caterpillar asset | REVIEW |
| object-tree | 🌳 | `game/data/serbian.js`, `sequencing.js`, racing decor | Phonics, tree-growth sequence, scenery | One tree illustration if scale/use match | REVIEW |
| object-student | 🧑‍🎓 | `game/data/serbian.js` | Serbian phonics picture | Simple child/student illustration; not an existing game character | REVIEW |
| object-screen | 🖥️ | `game/data/serbian.js` | Serbian phonics picture | Simple computer monitor illustration | REVIEW |
| object-needle | 🪡 | `game/data/serbian.js` | Serbian phonics picture | Simple needle/thread illustration | REVIEW |
| object-heart | ❤️ | `game/data/serbian.js` | Word/picture for love | Simple heart shape; SVG is likely sufficient | SVG/CSS |
| object-nose | 👃 | `game/data/serbian.js` | Body-part phonics picture | Simple nose illustration if the phonics picture card needs it | REVIEW |
| object-pig-nose | 🐽 | `game/data/serbian.js` | Word for snout | Reuse pig asset only if the teaching meaning remains clear; otherwise distinct snout icon | REVIEW |
| object-eye | 👁️ | `game/data/serbian.js` | Body-part phonics picture | Simple eye illustration | REVIEW |
| animal-turkey | 🦃 | `game/data/serbian.js` | Serbian phonics picture | Simple turkey illustration | REVIEW |
| object-ear | 👂 | `game/data/serbian.js` | Body-part phonics picture | Simple ear illustration | REVIEW |
| animal-flamingo | 🦩 | `game/data/serbian.js` | Serbian phonics picture | Simple flamingo illustration | REVIEW |
| object-helicopter | 🚁 | `game/data/serbian.js` | Serbian phonics picture | Simple helicopter illustration | REVIEW |
| object-flower | 🌼 | `game/data/serbian.js`, `sequencing.js`, maze/racing decor | Phonics picture, sequence and decor | One shared flower where the meaning and scale fit | REVIEW |
| object-sailboat | ⛵ | `game/data/serbian.js` | Serbian phonics picture | Simple sailboat illustration | REVIEW |
| object-sweater | 🧥 | `game/data/serbian.js` | Serbian phonics picture | Simple sweater illustration | REVIEW |
| object-hat | 🎩 | `game/data/serbian.js` | Serbian phonics picture | Simple hat illustration | REVIEW |
| food-strawberry | 🍓 | `game/games/sorting.js`, `kitty-standalone.js` | Sorting item and Kitty collectible | One shared strawberry illustration | REVIEW |
| food-grapes | 🍇 | `compare.js`/Kitty collectible themes | Comparison object and Kitty collectible | One shared grape bunch | REVIEW |
| food-orange | 🍊 | `compare.js` | Comparison object | Simple orange illustration | REVIEW |
| food-pear | 🍐 | `compare.js` | Comparison object | Simple pear illustration | REVIEW |
| food-watermelon | 🍉 | `kitty-standalone.js` | Kitty collectible | Simple watermelon slice | REVIEW |
| food-carrot | 🥕 | `sequencing.js`, `kitty-standalone.js` | Growth sequence result and Kitty collectible | One shared carrot illustration | REVIEW |
| food-apple-green | 🍏 | `sequencing.js` | Unripe fruit sequence step | Separate from red apple because color conveys sequence stage | REVIEW |
| object-egg | 🥚 | `sequencing.js` | Egg-to-bird sequence | Simple egg illustration | REVIEW |
| animal-chick | 🐣 | `sequencing.js` | Egg-to-bird sequence | Simple chick illustration | REVIEW |
| animal-bird | 🐦 | `sequencing.js` | Egg-to-bird sequence | Simple bird illustration | REVIEW |
| object-soap | 🧼 | `sequencing.js` | Washing sequence | Simple soap illustration | REVIEW |
| object-water-drop | 💧 | `sequencing.js`, dino collectible | Washing/growing sequence and collectible | One shared water drop if visually appropriate | REVIEW |
| object-acorn | 🌰 | `sequencing.js` | Tree-growth sequence | Simple acorn illustration | REVIEW |
| object-sunflower | 🌻 | `sequencing.js`, racing decor | Plant sequence and scenery | One shared sunflower | REVIEW |
| object-mushroom | 🍄 | `animal_puzzle.js`, Kitty collectible | Forest puzzle and Kitty collectible | One shared mushroom | REVIEW |
| animal-zebra | 🦓 | `animal_puzzle.js` | Savanna puzzle | Simple zebra illustration | REVIEW |
| animal-giraffe | 🦒 | `animal_puzzle.js` | Savanna puzzle | Simple giraffe illustration | REVIEW |
| animal-deer | 🦌 | `animal_puzzle.js`, racing decor | Forest puzzle and winter scenery | One shared deer illustration if appropriate | REVIEW |
| animal-squirrel | 🐿️ | `animal_puzzle.js` | Forest puzzle | Simple squirrel illustration | REVIEW |
| animal-cow | 🐄 | `animal_puzzle.js`, racing decor | Farm puzzle and scenery | Consolidate with `animal-cow` using one approved cow asset | REVIEW |
| animal-rooster | 🐓 | `animal_puzzle.js`, racing decor | Farm puzzle and scenery | Consolidate with `animal-chicken` only if one image reads correctly as rooster/chicken | REVIEW |
| object-tractor | 🚜 | `animal_puzzle.js`, racing decor | Farm puzzle and scenery | One shared tractor illustration | REVIEW |
| object-rocket | 🚀 | `animal_puzzle.js`, space game/hub | Space puzzle, page decoration, hub tile | Reuse one rocket illustration for large game artwork; UI may use SVG | REVIEW |
| object-planet | 🪐 | `animal_puzzle.js`, driving/space/racing decor | Puzzle and game-world object | One shared planet illustration where meaning matches | REVIEW |
| object-astronaut | 👨‍🚀 | `animal_puzzle.js` | Space puzzle | Simple astronaut illustration | REVIEW |
| object-snowman | ⛄ | `animal_puzzle.js`, driving/racing decor | Winter puzzle and collectible scenery | One shared snowman illustration | REVIEW |
| object-sled | 🛷 | `animal_puzzle.js` | Winter puzzle | Simple sled illustration | REVIEW |
| animal-penguin | 🐧 | `animal_puzzle.js` | Winter puzzle | Simple penguin illustration | REVIEW |
| object-birthday-cake | 🎂 | `game/data/serbian.js`, `piano.js` | Phonics picture and song label | One shared cake illustration; piano UI may use smaller icon | REVIEW |
| object-bell | 🔔 | `piano.js` | Song label | Simple bell or SVG icon | REVIEW |
| object-balloons | 🎈 | `compare.js` | Comparison object | Simple balloon illustration | REVIEW |
| object-rainbow | 🌈 | `game/index.html` | Main hub title and favicon | Small brand illustration/logo; treat as hub branding rather than game object | REVIEW |
| object-school | 🏫 | `game/index.html`, `classroom.html` | Hub/classroom icon | Prefer consistent small UI icon or reuse a simple school illustration | REVIEW |
| object-notebook | 📝 | `game/index.html` | Learning hub tile | UI icon or small illustration depending on tile style | REVIEW |
| object-gamepad | 🎮 | `game/index.html` | Game hub label | UI icon, not watercolor object by default | UI ICON |
| object-playing-cards | 🃏 | `game/index.html`, `animal_memory.html` | Memory hub/card-back symbol | Replace card-back with a designed card pattern; hub icon can remain UI | REVIEW |
| object-puzzle-piece | 🧩 | `game/index.html` | Puzzle hub icon | SVG/UI icon or reuse designed puzzle-piece asset if used as a game object | REVIEW |
| object-scale | ⚖️ | `game/index.html` | Compare-game hub icon | SVG/UI icon | UI ICON |
| object-basket | 🧺 | `game/index.html` | Sorting-game hub icon | SVG/UI icon or small basket illustration if prominent | REVIEW |
| object-calendar | 📆 | `game/index.html` | Sequencing hub icon | UI icon | UI ICON |
| object-compass | 🧭 | `game/index.html` | Spatial-game hub icon | UI icon or small illustration depending on visual redesign scope | REVIEW |
| object-pencil | ✏️ | `game/index.html`, `tracing.html`, tracing celebration | Hub, tracing intro/activity and celebration | Reuse simple pencil illustration for prominent objects; controls may use SVG | REVIEW |
| object-paint-palette | 🎨 | hub/classroom/coloring | Game hub and coloring controls | UI icon for controls; no need for multiple generated assets | UI ICON |
| object-medal | 🏅 | `coloring.js`, `kids_games.js`, `piano.html` | Reward/celebration | Prefer consistent reward illustration; consider reusing the golden star for generic reward moments if semantically suitable | REVIEW |
| object-lightbulb | 💡 | `matching_game.html` | Hint button | SVG/CSS UI icon | UI ICON |
| object-search | 🔍 | `animals.html` | Find-animal control | SVG/CSS UI icon | UI ICON |
| object-trash | 🗑️ | `coloring.html`, parent page | Clear/reset controls | SVG/CSS UI icon | UI ICON |
| object-progress-chart | 📊 | `parent.html` | Parent dashboard heading | SVG/CSS UI icon | UI ICON |
| object-download | 📥 | `parent.html` | Download/offline button | SVG/CSS UI icon | UI ICON |
| object-lock | 🔒 | `parent.html` | Parent area icon/title | SVG/CSS UI icon | UI ICON |
| object-sound | 🔊 / 🔇 | Many pages and shared/game scripts | Sound/music toggle or sound action | One consistent SVG icon pair; not generated illustrations | UI ICON |
| object-world-globe | 🌍 | Shared adventure pages and 3D Racing page | World-selection button/title/hint | One consistent SVG globe icon; no generated image needed by default | UI ICON |
| object-finish-flag | 🏁 | `racing3d.html` | Start/win UI | SVG flag or remove decorative glyph | UI ICON |
| object-retry | 🔄 / 🔁 | adventure, maze, parent, racing3d, rhythm | Restart/update/repeat controls | One consistent SVG icon family | UI ICON |
| object-next-arrow | ➜ / ➡️ | animal counting, puzzle, animals, coloring, tracing | Next/navigation controls | SVG arrow | UI ICON |
| object-celebration | 🎉 / ✨ / 🌟 | shared celebration, counting, matching, adventure, sequencing | Success/feedback and small effects | Use restrained CSS/SVG particles and the approved star where appropriate | REVIEW |
| object-book-picture | 🖼️ | `coloring.js` | Coloring mode toggle | UI icon | UI ICON |
| object-music-note | 🎵 | `piano.js`, `rhythm.js` | Music prompt/label | SVG icon or retain text symbol | UI ICON |
| object-drum | 🥁 | `rhythm.js`, `rhythm.html`, hub | Rhythm pads and activity icon | One canonical drum illustration for prominent pads; hub/control may use icon | REVIEW |
| object-season-leaf | 🍂 | `classroom.html`, `racing-config.js` | Seasons activity and racing scenery | One shared leaf illustration if it is a gameplay visual; UI tile may use icon | REVIEW |
| object-snowflake | ❄️ | `animal_puzzle.js`, driving/racing config | Winter decoration/collectible | SVG snowflake for tiny effects; illustration only if a large collectible | REVIEW |
| object-shell | 🐚 | ocean/driving/Kitty/adventure collectible themes | Shared collectible across games | One shared shell asset; consolidate adventure-fish/kitty-fish similarly | REVIEW |
| object-fish | 🐟 | `adventure-modes.js`, `kitty-standalone.js`, Serbian phonics, ocean | Shared underwater decor, phonics and ocean visual | **One canonical fish asset** reused wherever suitable; no separate adventure-fish/kitty-fish files | REVIEW |
| object-pickaxe | ⛏ | `kitty-standalone.js` | Cave gameplay glyph | SVG or simple illustrated pickaxe if visibly used as a game object | REVIEW |
| object-sparkles | ✨ | `kitty-standalone.js`, `sequencing.js` | Cave/effect glyph and clean-sequence result | Prefer CSS/SVG effect; no unique PNG needed | SVG/CSS |
| object-shell | 🐚 | `kitty-standalone.js`, `ocean.js`, `racing-config.js` | Collectible and scenery | Single shared shell asset; consolidate repeated use | REVIEW |
| object-gem | 💎 | dino/ocean collectible themes | Collectible | One shared gem asset | REVIEW |
| object-moon | 🌙 | classroom, driving/dino/ocean/space worlds | Moon/time/collectible motif | One shared moon illustration for gameplay objects; classroom time icon may remain UI | REVIEW |
| object-candy-lollipop | 🍭 | `driving.js`, `racing-config.js` | Collectible and candy scenery | One shared lollipop asset | REVIEW |
| object-candy-wrapped | 🍬 | `racing-config.js` | Candy-world scenery | One simple wrapped candy asset | REVIEW |
| object-cupcake | 🧁 | `racing-config.js` | Candy-world scenery | One cupcake asset | REVIEW |
| object-donut | 🍩 | `racing-config.js` | Candy-world scenery | One donut asset | REVIEW |
| object-candy-rice | 🍡 | `racing-config.js` | Candy-world scenery | Simple dango/skewer asset if retained in scenery | REVIEW |
| object-palm-tree | 🌴 | driving/Kitty/racing config | Island/tropical scenery and collectible context | One shared palm tree asset | REVIEW |
| object-island | 🏝️ | `dino.js` | Island collectible/theme glyph | Could be a simple island illustration if this glyph is visibly rendered as an object | REVIEW |
| object-volcano | 🌋 | `dino.js` | Volcano collectible/theme glyph | Simple volcano asset only if visibly rendered as collectible | REVIEW |
| object-cactus | 🌵 | driving/dino theme collectibles | Desert theme | One shared cactus asset | REVIEW |
| object-parrot | 🦜 | `dino.js`, racing decor | Tropical collectible/scenery | One shared parrot asset | REVIEW |
| object-butterfly | 🦋 | maze/racing decor | Garden/forest scenery | One shared butterfly asset | REVIEW |
| object-puddle | 💧 | `racing-config.js` | Racing obstacle | Use a simple shape/SVG if it is a small gameplay hazard | REVIEW |
| object-rock | 🪨 | `racing-config.js` | Racing obstacle | Use simple SVG/geometry if small; no generated illustration by default | REVIEW |
| object-road-barrier | 🚧 | `racing-config.js` | Racing obstacle | Small barrier illustration only if emoji is actually rendered in-game | REVIEW |
| object-satellite | 🛰️ | `space.js` | Space collectible/theme glyph | Simple satellite illustration if visibly rendered | REVIEW |
| object-telescope | 🔭 | `space.js` | Space collectible/theme glyph | Simple telescope illustration if visibly rendered | REVIEW |
| object-ice-cube | 🧊 | `space.js` | Space collectible/theme glyph | Simple ice cube asset if visibly rendered | REVIEW |
| object-spiral | 🌀 | `space.js` | Space collectible/theme glyph | Prefer vector effect if used as a swirl, not a physical object | SVG/CSS |
| object-comet | 💫 / 🌠 | `space.js`, racing decor | Space effect/decoration | Vector effect or simple image depending on actual rendering size | REVIEW |

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
