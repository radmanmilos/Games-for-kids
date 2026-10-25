# Petra's World — Emoticon Replacement Inventory

**Status:** Source-audit draft v0.4 — literal emoji scan completed across the canonical `game/` JavaScript modules, page HTML, shared modules, CSS, manifests, and runtime configs (excluding the third-party minified Three.js bundle). Candidate rows have been expanded and duplicate asset IDs have been consolidated. This is a source-backed inventory draft, not yet approved for generation: semantic use-site verification and a final review of dynamic rendering remain.  
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

| ID | Current glyph / visual | Confirmed source location(s) | Current purpose | Proposed treatment | Status  | Existing WIP asset file/location | Production-ready asset file/location |
|---|---|---|---|---|---|---|---|
| animal-dog | 🐶 | `game/games/animals.js`, `animal_counting.js`, `candy.js`, `spatial.js`, `sorting.js` | Animal flashcard/counting, candy game's animal set, spatial scene, sorting item | One shared simple dog PNG for all object/animal-card uses | GENERATED / USER-APPROVED / TECHNICAL QA MEASURED | `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/dog.png` | Raster-emoji art, resampled to 1024x1024 (task 292); not the painted family |
| animal-cat | 🐱 | `game/games/animals.js`, `animal_counting.js`, `sorting.js` | Animal flashcard/counting and sorting item | One shared simple cat PNG | GENERATED / USER-APPROVED / TECHNICAL QA MEASURED | `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/cat.png` | Raster-emoji art, resampled to 1024x1024 (task 292); not the painted family |
| animal-cow | 🐮 / 🐄; 🐄 | `game/games/animals.js`, `animal_counting.js`, `candy.js`, `animal_puzzle.js`, `racing-config.js`, `game/data/serbian.js`; `animal_puzzle.js`, racing decor | Animal flashcard/counting, candy set, farm puzzle/scenery, Serbian phonics; Farm puzzle and scenery | One canonical cow illustration; confirm it reads clearly at card and scenery sizes | GENERATED / USER-APPROVED / TECHNICAL QA MEASURED | `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/cow.png` | Raster-emoji art, resampled to 1024x1024 (task 292); not the painted family |
| animal-lion | 🦁 | `game/games/animals.js` | Animal flashcard | Simple lion PNG | GENERATED / USER-APPROVED / TECHNICAL QA MEASURED | `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/lion.png` | — |
| animal-elephant | 🐘 | `game/games/animals.js` | Animal flashcard | Shared softly painted elephant illustration; use only where the elephant glyph represents the animal | GENERATED / USER-APPROVED / TECHNICAL QA MEASURED | `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/elephant.png` | — |
| animal-frog | 🐸 | `game/games/animals.js` | Animal flashcard/name mapping | Simple softly painted frog PNG; use only where the glyph represents the animal | GENERATED / USER-APPROVED / TECHNICAL QA MEASURED | `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/frog.png` | — |
| animal-pig | 🐷 | `game/games/animal_counting.js`, `candy.js` | Counting and candy-game set | One shared simple pig PNG | GENERATED / USER-APPROVED / TECHNICAL QA MEASURED | `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/pig.png` | — |
| animal-duck | 🦆 | `game/games/animal_counting.js`, `candy.js`, `spatial.js` | Counting, candy-game set, spatial scene | Simple duck in the bear's low-detail style; avoid the rejected elaborate duckling look | GENERATED / USER-APPROVED / TECHNICAL QA MEASURED | `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/duck.png` | Raster-emoji art, resampled to 1024x1024 (task 292); a painted replacement is queued |
| animal-fox | 🦊 | Mentioned in the animals smoke-test mapping; verify runtime list in full source | Animal flashcard/name mapping | One shared simple fox PNG; confirm runtime use before integration | GENERATED / USER-APPROVED / TECHNICAL QA MEASURED | `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/fox.png` | — |
| animal-sheep | 🐑 | `game/games/animals.js:12`, `game/games/candy.js:20,33`, `game/data/serbian.js:165` (`Овца`), `game/games/animal_puzzle.js:8` (farm scene) | Animal flashcard, candy-game set, Serbian phonics, farm scene | One shared simple sheep illustration; rounded wool silhouette and restrained facial detail. Do not reuse the colouring-page sheep (`resources/coloring-redraw/Sheep.png`) — that is line art for a different purpose | GENERATED / USER-APPROVED / TECHNICAL QA MEASURED | `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/sheep.png` | — |
| animal-horse | 🐴 | `game/games/animal_memory.js`, `candy.js`, `game/data/serbian.js` | Animal memory cards, candy-game set, Serbian number-sentence illustrations | One shared simple horse PNG; do not reuse the coloring-game SVG unless it passes finished-illustration requirements | GENERATED / USER-APPROVED / TECHNICAL QA MEASURED | `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/horse.png` | — |
| animal-chicken | 🐔 | `game/games/animal_counting.js`; also candy smoke-test set | Counting and candy-game set | One shared simple chicken PNG; keep distinct from rooster-specific farm puzzle/scenery use unless visual semantics are confirmed | GENERATED / USER-APPROVED / TECHNICAL QA MEASURED | `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/chicken.png` | — |
| animal-bear | 🐻 | `game/games/maze.js` | Maze start marker (“bear”) | Use the exact supplied bear reference if appropriate; assess scale/transparent crop | GENERATED / USER-APPROVED / TECHNICAL QA MEASURED | `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/bear.png` | Canonical style anchor; the bundle copy is resampled to 1024x1024 (task 292), `Reference/bear.png` stays 800x800 |
| object-bone | 🦴 | `game/games/spatial.js` | Object in “Where is the bone?” spatial task | Simple bone PNG; keep silhouette clear | GENERATED / USER-APPROVED / TECHNICAL QA MEASURED | `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/bone.png` | — |
| object-house | 🏠 | `game/games/maze.js` | Maze goal marker (“house”) | Simple cozy house PNG | REVIEW  | — | — |
| food-apple | 🍎 | `game/games/sorting.js` | Food sorting bin/item | One shared simple apple PNG | GENERATED / USER-APPROVED / TECHNICAL QA MEASURED | `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/apple.png` | Raster-emoji art, resampled to 1024x1024 (task 292); not the painted family |
| animal-pawprint | 🐾 | `game/games/sorting.js` | Animal-category bin label | Prefer a small paw icon (SVG or simple illustration); not necessarily watercolor | REVIEW  | — | — |
| shape-blue-circle | 🔵 | `game/games/classroom.js` | Shape presentation | Replace emoji-like shape glyph with exact vector geometry/SVG, not generated raster art | SVG/CSS  | — | — |
| shape-purple-square | 🟪 | `game/games/classroom.js` | Shape presentation | Use vector geometry/SVG | SVG/CSS  | — | — |
| shape-red-triangle | 🔺 | `game/games/classroom.js` | Shape presentation | Use vector geometry/SVG | SVG/CSS  | — | — |
| reward-star | ⭐ | `game/games/classroom.js`, `game/games/piano.js` | Shape presentation and song-chip label | Distinguish shape-learning star from reward star; use SVG for geometry, use supplied star reference only where a reward illustration is semantically correct | GENERATED / USER-APPROVED / TECHNICAL QA MEASURED | `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/star.png` | Raster-emoji art, resampled to 1024x1024 (task 292); not the painted family |
| music-drum | 🥁 | `game/games/rhythm.js` | Four rhythm pads, each labelled with a drum emoji despite different pitches | One simple illustrated drum reused across pads; alternatively use distinct drum-size variants only if musically meaningful | REVIEW  | — | — |
| plant-seedling | 🌱 | `game/games/sequencing.js` | Plant-growth sequence, seed step | Simple seedling PNG | REVIEW  | — | — |
| plant-leaves | 🌿 | `game/games/sequencing.js`, adventure world names may use similar symbols | Plant-growth sequence, plant step | One simple leafy plant PNG if visual meaning matches | REVIEW  | — | — |
| flower | 🌼 | `game/games/sequencing.js` | Plant-growth sequence, flower step | Simple flower PNG; reuse only when meaning and scale fit | REVIEW  | — | — |
| flower-counter | 🌸 | `game/pages/racing3d.html` | 3D Racing UI flower counter | Small flat storybook flower or a consistent icon; do not alter the 3D world model | REVIEW  | — | — |
| celebration-confetti | 🎉 | `game/shared/celebration.js` fallback | Shared celebration overlay | Prefer a restrained celebration animation using CSS/SVG and/or approved star; avoid one large emoji glyph | REVIEW  | — | — |
| winter-snowflake | ❄ | `game/games/animal_puzzle.js` | Winter scene decoration drawn on canvas | Simple snowflake as SVG/canvas vector; generated watercolor not needed | SVG/CSS  | — | — |
| adventure-fish | 🐟 | `game/games/adventure-modes.js` | Animated underwater decoration drawn on canvas | Small fish PNG or simple procedural fish; preserve game engine and motion | GENERATED / USER-APPROVED / TECHNICAL QA MEASURED | `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/fish.png` | Raster-emoji art, resampled to 1024x1024 (task 292); not the painted family |
| kitty-fish | 🐟 | `game/games/kitty-standalone.js` | Animated underwater decoration; Kitty character itself is out of scope | Reuse adventure-fish if visually appropriate | GENERATED / USER-APPROVED / TECHNICAL QA MEASURED | `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/fish.png` | Same file as `adventure-fish`; resampled to 1024x1024 (task 292) |
| kitty-pickaxe | ⛏ | `game/games/kitty-standalone.js` | Cave object/effect glyph | Small pickaxe PNG only if it is a visible gameplay object; otherwise simple SVG | REVIEW  | — | — |
| piano-song-star | ⭐ | `game/games/piano.js` | Song chip label for “Twinkle, Twinkle” | Prefer text label / small SVG star icon; do not automatically use reward illustration | GENERATED / USER-APPROVED / TECHNICAL QA MEASURED | `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/star.png` | Same file as `reward-star`; resampled to 1024x1024 (task 292) |
| r3d-title-car | 🏎️ | `game/pages/racing3d.html` | Page title decoration | Remove glyph or use project car icon/SVG; no generated watercolor asset required by default | REVIEW  | — | — |
| r3d-flower-counter | 🌸 | `game/pages/racing3d.html` | Flower/collectible counter | See shared flower row; keep 3D gameplay rendering unchanged | REVIEW  | — | — |
| r3d-world-button | 🌍 | `game/pages/racing3d.html` | World-selection UI | Consistent SVG UI icon or remove redundant decoration | UI ICON  | — | — |
| r3d-music-on | 🔊 | `game/pages/racing3d.html` | Music button state | Consistent SVG UI icon | UI ICON  | — | — |
| r3d-music-off | 🔇 | `game/pages/racing3d.html` | Music button state | Consistent SVG UI icon | UI ICON  | — | — |
| r3d-win-flag | 🏁 | `game/pages/racing3d.html` | Start/win modal decoration | Small SVG flag or remove decoration; not necessarily a generated illustration | REVIEW  | — | — |
| r3d-next-world-arrow | ➡️ | `game/pages/racing3d.html` | Next-world button | SVG arrow or text; no generated illustration | UI ICON  | — | — |
| r3d-restart-arrow | 🔄 | `game/pages/racing3d.html` | Restart button | SVG retry icon or text; no generated illustration | UI ICON  | — | — |
| r3d-favicon-car | 🏎️ | `game/pages/racing3d.html` | Inline SVG favicon containing emoji text | Replace with a real SVG/project icon if desired; outside illustration batch | APP ICON  | — | — |
| maze-start-bear | 🐻 | `game/games/maze.js` | Start marker | Same exact bear reference as animal-bear; avoid duplicate file | GENERATED / USER-APPROVED / TECHNICAL QA MEASURED | `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/bear.png` | Same file as `animal-bear` |
| maze-goal-house | 🏠 | `game/games/maze.js` | Goal marker | Same house asset as object-house | REVIEW  | — | — |

## Additional source-confirmed candidates from the expanded all-pages audit

| ID | Current glyph / visual | Confirmed source location(s) | Current purpose | Proposed treatment | Status  | Existing WIP asset file/location | Production-ready asset file/location |
|---|---|---|---|---|---|---|---|
| object-car | 🚗 | `game/data/serbian.js`, `game/index.html`, driving favicon | Serbian phonics object and hub tile/icon | Reuse existing driving-car illustration if visually appropriate; favicon/UI may remain icon | REVIEW  | — | — |
| food-banana | 🍌 | `game/data/serbian.js`, Kitty collectible themes | Phonics vocabulary and collectible theme | One shared banana asset | GENERATED / USER-APPROVED / TECHNICAL QA MEASURED | `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/banana.png` | — |
| animal-wolf | 🐺 | `game/data/serbian.js` | Serbian phonics picture | One shared simple wolf illustration; calm, readable, consistent with bear reference | GENERATED / USER-APPROVED / TECHNICAL QA MEASURED | `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/wolf.png` | — |
| animal-caterpillar | 🐛 | `game/data/serbian.js`, `sequencing.js` | Phonics and life-cycle sequence | One shared caterpillar asset; curved segmented body, restrained detail, readable at card size | GENERATED / USER-APPROVED / TECHNICAL QA MEASURED | `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/caterpillar.png` | — |
| animal-butterfly | 🦋 | `game/games/sequencing.js` (butterfly life-cycle sequence, stage 3: egg → caterpillar → butterfly) | Life-cycle sequencing | One clearly recognizable butterfly; default style guidance says no face/personification unless specifically approved | GENERATED / CANDIDATE — TECHNICAL QA AND USER REVIEW NOT RECORDED; VISUAL REVIEW REQUIRED | `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/butterfly.png` | — |
| object-tree | 🌳 | `game/data/serbian.js`, `sequencing.js`, racing decor | Phonics, tree-growth sequence, scenery | One tree illustration if scale/use match | REVIEW  | — | — |
| object-student | 🧑‍🎓 | `game/data/serbian.js` | Serbian phonics picture | Simple child/student illustration; not an existing game character | REVIEW  | — | — |
| object-screen | 🖥️ | `game/data/serbian.js` | Serbian phonics picture | Simple computer monitor illustration | REVIEW  | — | — |
| object-needle | 🪡 | `game/data/serbian.js` | Serbian phonics picture | Simple needle/thread illustration | REVIEW  | — | — |
| object-heart | ❤️ | `game/data/serbian.js` | Word/picture for love | Simple heart shape; SVG is likely sufficient | SVG/CSS  | — | — |
| object-nose | 👃 | `game/data/serbian.js` | Body-part phonics picture; Serbian phonics vocabulary | Simple nose illustration if the phonics picture card needs it | REVIEW  | — | — |
| object-pig-nose | 🐽 | `game/data/serbian.js` | Word for snout | Reuse pig asset only if the teaching meaning remains clear; otherwise distinct snout icon | REVIEW  | — | — |
| object-eye | 👁️ | `game/data/serbian.js` | Body-part phonics picture; Serbian phonics vocabulary | Simple eye illustration | REVIEW  | — | — |
| animal-turkey | 🦃 | `game/data/serbian.js` | Serbian phonics picture; Serbian phonics vocabulary | Simple turkey illustration | REVIEW  | — | — |
| object-ear | 👂 | `game/data/serbian.js` | Body-part phonics picture; Serbian phonics vocabulary | Simple ear illustration | REVIEW  | — | — |
| animal-flamingo | 🦩 | `game/data/serbian.js` | Serbian phonics picture | Simple flamingo illustration | REVIEW  | — | — |
| object-helicopter | 🚁 | `game/data/serbian.js` | Serbian phonics picture; Serbian phonics vocabulary | Simple helicopter illustration | REVIEW  | — | — |
| object-flower | 🌼 | `game/data/serbian.js:34` (phonics word `Цвет`), `game/games/sequencing.js:18` (label `Цвет`, plant-growth step 2), maze/racing decor | Phonics picture, sequence and decor | One shared flower where the meaning and scale fit | GENERATED / CANDIDATE — TECHNICAL QA AND USER REVIEW NOT RECORDED | `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/flower.png` | — |
| object-sailboat | ⛵ | `game/data/serbian.js` | Serbian phonics picture; Serbian phonics vocabulary | Simple sailboat illustration | REVIEW  | — | — |
| object-sweater | 🧥 | `game/data/serbian.js` | Serbian phonics picture; Serbian phonics vocabulary | Simple sweater illustration | REVIEW  | — | — |
| object-hat | 🎩 | `game/data/serbian.js` | Serbian phonics picture; Serbian phonics vocabulary | Simple hat illustration | REVIEW  | — | — |
| food-strawberry | 🍓 | `game/games/sorting.js`, `kitty-standalone.js` | Sorting item and Kitty collectible | One shared strawberry illustration | GENERATED / USER-APPROVED / TECHNICAL QA MEASURED | `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/strawberry.png` | — |
| food-grapes | 🍇 | `compare.js`/Kitty collectible themes | Comparison object and Kitty collectible | One shared grape bunch | GENERATED / USER-APPROVED / TECHNICAL QA MEASURED | `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/grapes.png` | — |
| food-orange | 🍊 | `compare.js` | Comparison object | Simple orange illustration | GENERATED / USER-APPROVED / TECHNICAL QA MEASURED | `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/orange.png` | — |
| food-pear | 🍐 | `compare.js` | Comparison object | Simple pear illustration | GENERATED / USER-APPROVED / TECHNICAL QA MEASURED | `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/pear.png` | — |
| food-watermelon | 🍉 | `kitty-standalone.js` | Kitty collectible | Simple watermelon slice | REVIEW  | — | — |
| food-carrot | 🥕 | `sequencing.js`, `kitty-standalone.js` | Growth sequence result and Kitty collectible | One shared carrot illustration | REVIEW  | — | — |
| food-apple-green | 🍏 | `sequencing.js` | Unripe fruit sequence step | Separate from red apple because color conveys sequence stage | REVIEW  | — | — |
| object-egg | 🥚 | `game/games/sequencing.js:26` (label `Јаје`, stage 1 of the egg → chick → bird sequence) and `game/games/sequencing.js:46` (label `Јаје`, stage 1 of the egg → caterpillar → butterfly sequence) | Egg-to-bird and egg-to-butterfly sequences | One shared simple egg illustration for both sequences: a smooth upright oval shell, warm cream-beige, a scatter of medium warm-brown speckles, one deeper tan shaded side — no face, no crack, no nest, no ribbon; must read at card size | GENERATED / CANDIDATE — TECHNICAL QA MEASURED | `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/egg.png` | — |
| animal-chick | 🐣 | `sequencing.js`; `sequencing.js`, `compare.js` | Egg-to-bird sequence; Egg-to-bird sequence and comparison pool | One shared simple chick illustration; clearly juvenile and distinct from adult chicken | GENERATED / USER-APPROVED / TECHNICAL QA MEASURED | `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/chick.png` | — |
| animal-bird | 🐦 | `game/games/sequencing.js:28` (label `Птица`), stage 3 of the egg → chick → bird sequence | Egg-to-bird sequence | One shared simple bird illustration; a generic small songbird, clearly distinct from the chick and the chicken; rounded compact body, short small beak, one simple wing, short tail, small feet, muted natural palette, tiny understated dark eye | GENERATED / USER-APPROVED / TECHNICAL QA MEASURED | `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/bird.png` | — |
| object-soap | 🧼 | `game/games/sequencing.js` (washing sequence, step 2) | Washing sequence | One simple, uniform rectangular bar of soft pastel-pink soap with rounded corners and a few delicate bubbles at the edges; matte watercolor/paper finish, no face or packaging | GENERATED / CANDIDATE — TECHNICAL QA PENDING | `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/soap.png` | — |
| object-water-drop | 💧 | `game/games/sequencing.js:31` (label `Прљаво`, step 1 of the wash sequence 💧 → 🧼 → ✨), `game/games/sequencing.js:52` (label `Заливам`, the watering step of the vegetable sequence), the dino lake collectible (`game/games/dino.js:137`), the fastcat lake theme (`game/games/fastcat.js:130`) and the racing puddle hazard (`game/games/racing-config.js:5`) | Washing sequence, plant watering, lake collectibles, racing puddle | One shared water drop if visually appropriate: a plump upright teardrop in a muted grey blue with one soft highlight — no face, no splash, no puddle spreading under it; must read as a drop and not a grey blob at card size | GENERATED / USER-APPROVED / TECHNICAL QA MEASURED | `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/water-drop.png` | — |
| object-acorn | 🌰 | `game/games/sequencing.js` (tree-growth sequence, stage 1: acorn → sprout → tree) | Tree-growth sequence | One shared simple acorn illustration; recognizable nut and cap, no face or extra scene elements | GENERATED / CANDIDATE — TECHNICAL QA AND USER REVIEW NOT RECORDED | `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/acorn.png` | — |
| object-sunflower | 🌻 | `game/games/sequencing.js` (sunflower sequence, stage 3) and racing decor | Plant-growth sequence and scenery | One shared sunflower illustration, reused only where meaning and scale fit | GENERATED / CANDIDATE — TECHNICAL QA AND USER REVIEW NOT RECORDED | `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/sunflower.png` | — |
| object-mushroom | 🍄 | `game/games/animal_puzzle.js:7` (forest puzzle), `game/games/cat_forest.js:78` (gift), `game/games/kitty-standalone.js:701` (collectible) | Forest puzzle, Cat Forest gift and Kitty collectible | One shared mushroom | GENERATED / CANDIDATE — TECHNICAL QA AND USER REVIEW NOT RECORDED | `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/mushroom.png` | — |
| animal-zebra | 🦓 | `animal_puzzle.js` | Savanna puzzle | Simple zebra illustration | REVIEW  | — | — |
| animal-giraffe | 🦒 | `animal_puzzle.js` | Savanna puzzle | Simple giraffe illustration | REVIEW  | — | — |
| animal-deer | 🦌 | `animal_puzzle.js`, racing decor | Forest puzzle and winter scenery | One shared deer illustration if appropriate | REVIEW  | — | — |
| animal-squirrel | 🐿️ | `animal_puzzle.js` | Forest puzzle | Simple squirrel illustration | REVIEW  | — | — |
| animal-rooster | 🐓 | `game/games/animal_puzzle.js:8` (farm puzzle scene), `game/games/racing-config.js:180` (racing decor) | Farm puzzle and scenery | Its own picture, kept distinct from the approved hen (`chicken.png`): large red comb and wattle, golden-orange hackles, rich russet body, long arching deep green-black sickle tail, sturdy yellow legs | GENERATED / USER-APPROVED / TECHNICAL QA MEASURED | `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/rooster.png` | — |
| object-tractor | 🚜 | `animal_puzzle.js`, racing decor | Farm puzzle and scenery | One shared tractor illustration | REVIEW  | — | — |
| object-rocket | 🚀 | `animal_puzzle.js`, space game/hub | Space puzzle, page decoration, hub tile | Reuse one rocket illustration for large game artwork; UI may use SVG | REVIEW  | — | — |
| object-planet | 🪐 | `animal_puzzle.js`, driving/space/racing decor | Puzzle and game-world object | One shared planet illustration where meaning matches | REVIEW  | — | — |
| object-astronaut | 👨‍🚀 | `animal_puzzle.js` | Space puzzle | Simple astronaut illustration | REVIEW  | — | — |
| object-snowman | ⛄ | `animal_puzzle.js`, driving/racing decor | Winter puzzle and collectible scenery | One shared snowman illustration | REVIEW  | — | — |
| object-sled | 🛷 | `animal_puzzle.js` | Winter puzzle | Simple sled illustration | REVIEW  | — | — |
| animal-penguin | 🐧 | `animal_puzzle.js` | Winter puzzle | Simple penguin illustration | REVIEW  | — | — |
| object-birthday-cake | 🎂 | `game/data/serbian.js`, `piano.js` | Phonics picture and song label | One shared cake illustration; piano UI may use smaller icon | REVIEW  | — | — |
| object-bell | 🔔 | `piano.js` | Song label | Simple bell or SVG icon | REVIEW  | — | — |
| object-balloons | 🎈 | `compare.js` | Comparison object | Simple balloon illustration | REVIEW  | — | — |
| object-rainbow | 🌈 | `game/index.html` | Main hub title and favicon; Main hub brand/title/favicon | Small brand illustration/logo; treat as hub branding rather than game object | REVIEW  | — | — |
| object-school | 🏫 | `game/index.html`, `classroom.html` | Hub/classroom icon | Prefer consistent small UI icon or reuse a simple school illustration | REVIEW  | — | — |
| object-notebook | 📝 | `game/index.html` | Learning hub tile | UI icon or small illustration depending on tile style | REVIEW  | — | — |
| object-gamepad | 🎮 | `game/index.html` | Game hub label | UI icon, not watercolor object by default | UI ICON  | — | — |
| object-playing-cards | 🃏 | `game/index.html`, `animal_memory.html` | Memory hub/card-back symbol | Replace card-back with a designed card pattern; hub icon can remain UI | REVIEW  | — | — |
| object-puzzle-piece | 🧩 | `game/index.html` | Puzzle hub icon | SVG/UI icon or reuse designed puzzle-piece asset if used as a game object | REVIEW  | — | — |
| object-scale | ⚖️ | `game/index.html` | Compare-game hub icon | SVG/UI icon | UI ICON  | — | — |
| object-basket | 🧺 | `game/index.html` | Sorting-game hub icon | SVG/UI icon or small basket illustration if prominent | REVIEW  | — | — |
| object-calendar | 📆 | `game/index.html` | Sequencing hub icon | UI icon | UI ICON  | — | — |
| object-compass | 🧭 | `game/index.html` | Spatial-game hub icon | UI icon or small illustration depending on visual redesign scope | REVIEW  | — | — |
| object-pencil | ✏️ | `game/index.html`, `tracing.html`, tracing celebration | Hub, tracing intro/activity and celebration | Reuse simple pencil illustration for prominent objects; controls may use SVG | REVIEW  | — | — |
| object-paint-palette | 🎨 | hub/classroom/coloring | Game hub and coloring controls | UI icon for controls; no need for multiple generated assets | UI ICON  | — | — |
| object-medal | 🏅 | `coloring.js`, `kids_games.js`, `piano.html`; shared celebration, coloring, kids game, piano | Reward/celebration | Prefer consistent reward illustration; consider reusing the golden star for generic reward moments if semantically suitable | REVIEW  | — | — |
| object-lightbulb | 💡 | `matching_game.html` | Hint button | SVG/CSS UI icon | UI ICON  | — | — |
| object-search | 🔍 | `animals.html` | Find-animal control | SVG/CSS UI icon | UI ICON  | — | — |
| object-trash | 🗑️ | `coloring.html`, parent page | Clear/reset controls | SVG/CSS UI icon | UI ICON  | — | — |
| object-progress-chart | 📊 | `parent.html`; `game/pages/parent.html` | Parent dashboard heading; Progress dashboard | SVG/CSS UI icon | UI ICON  | — | — |
| object-download | 📥 | `parent.html`; `game/pages/parent.html` | Download/offline button; Offline download action | SVG/CSS UI icon | UI ICON  | — | — |
| object-lock | 🔒 | `parent.html`; `game/pages/parent.html` | Parent area icon/title; Parent area | SVG/CSS UI icon | UI ICON  | — | — |
| object-sound | 🔊 / 🔇 | Many pages and shared/game scripts | Sound/music toggle or sound action | One consistent SVG icon pair; not generated illustrations | UI ICON  | — | — |
| object-world-globe | 🌍 | Shared adventure pages and 3D Racing page | World-selection button/title/hint | One consistent SVG globe icon; no generated image needed by default | UI ICON  | — | — |
| object-finish-flag | 🏁 | `racing3d.html` | Start/win UI | SVG flag or remove decorative glyph | UI ICON  | — | — |
| object-retry | 🔄 / 🔁 | adventure, maze, parent, racing3d, rhythm | Restart/update/repeat controls | One consistent SVG icon family | UI ICON  | — | — |
| object-next-arrow | ➜ / ➡️ | animal counting, puzzle, animals, coloring, tracing | Next/navigation controls | SVG arrow | UI ICON  | — | — |
| object-celebration | 🎉 / ✨ / 🌟 | shared celebration, counting, matching, adventure, sequencing | Success/feedback and small effects | Use restrained CSS/SVG particles and the approved star where appropriate | REVIEW  | — | — |
| object-book-picture | 🖼️ | `coloring.js` | Coloring mode toggle | UI icon | UI ICON  | — | — |
| object-music-note | 🎵 | `piano.js`, `rhythm.js` | Music prompt/label | SVG icon or retain text symbol | UI ICON  | — | — |
| object-drum | 🥁 | `rhythm.js`, `rhythm.html`, hub | Rhythm pads and activity icon | One canonical drum illustration for prominent pads; hub/control may use icon | REVIEW  | — | — |
| object-season-leaf | 🍂 | `classroom.html`, `racing-config.js` | Seasons activity and racing scenery | One shared leaf illustration if it is a gameplay visual; UI tile may use icon | REVIEW  | — | — |
| object-snowflake | ❄️ | `animal_puzzle.js`, driving/racing config | Winter decoration/collectible | SVG snowflake for tiny effects; illustration only if a large collectible | REVIEW  | — | — |
| object-shell | 🐚 | `game/games/ocean.js`, `driving.js`, `kitty-standalone.js`, `racing-config.js` | Shared collectible and scenery | One shared shell asset across all listed uses | REVIEW  | — | — |
| object-fish | 🐟 | `adventure-modes.js`, `kitty-standalone.js`, Serbian phonics, ocean | Shared underwater decor, phonics and ocean visual | **One canonical fish asset** reused wherever suitable; no separate adventure-fish/kitty-fish files | REVIEW  | — | — |
| object-pickaxe | ⛏ | `kitty-standalone.js` | Cave gameplay glyph | SVG or simple illustrated pickaxe if visibly used as a game object | REVIEW  | — | — |
| object-sparkles | ✨ | `kitty-standalone.js`, `sequencing.js` | Cave/effect glyph and clean-sequence result | Prefer CSS/SVG effect; no unique PNG needed | SVG/CSS  | — | — |
| object-gem | 💎 | dino/ocean collectible themes | Collectible | One shared gem asset | REVIEW  | — | — |
| object-moon | 🌙 | classroom, driving/dino/ocean/space worlds | Moon/time/collectible motif | One shared moon illustration for gameplay objects; classroom time icon may remain UI | REVIEW  | — | — |
| object-candy-lollipop | 🍭 | `driving.js`, `racing-config.js` | Collectible and candy scenery | One shared lollipop asset | REVIEW  | — | — |
| object-candy-wrapped | 🍬 | `racing-config.js` | Candy-world scenery | One simple wrapped candy asset | REVIEW  | — | — |
| object-cupcake | 🧁 | `racing-config.js`; `game/games/racing-config.js` | Candy-world scenery; Candy world decor | One cupcake asset | REVIEW  | — | — |
| object-donut | 🍩 | `racing-config.js`; `game/games/racing-config.js` | Candy-world scenery; Candy world decor | One donut asset | REVIEW  | — | — |
| object-candy-rice | 🍡 | `racing-config.js`; `game/games/racing-config.js` | Candy-world scenery; Candy world decor | Simple dango/skewer asset if retained in scenery | REVIEW  | — | — |
| object-palm-tree | 🌴 | driving/Kitty/racing config | Island/tropical scenery and collectible context | One shared palm tree asset | REVIEW  | — | — |
| object-island | 🏝️ | `dino.js`; `game/games/dino.js` | Island collectible/theme glyph; World collectible/theme glyph | Could be a simple island illustration if this glyph is visibly rendered as an object | REVIEW  | — | — |
| object-volcano | 🌋 | `dino.js`; `game/games/dino.js` | Volcano collectible/theme glyph; World collectible/theme glyph | Simple volcano asset only if visibly rendered as collectible | REVIEW  | — | — |
| object-cactus | 🌵 | driving/dino theme collectibles | Desert theme | One shared cactus asset | REVIEW  | — | — |
| object-parrot | 🦜 | `dino.js`, racing decor | Tropical collectible/scenery | One shared parrot asset | REVIEW  | — | — |
| object-butterfly | 🦋 | maze/racing decor | Garden/forest scenery | One shared butterfly asset | REVIEW  | — | — |
| object-puddle | 💧 | `racing-config.js` | Racing obstacle | Use a simple shape/SVG if it is a small gameplay hazard | REVIEW  | — | — |
| object-rock | 🪨 | `racing-config.js` | Racing obstacle | Use simple SVG/geometry if small; no generated illustration by default | REVIEW  | — | — |
| object-road-barrier | 🚧 | `racing-config.js` | Racing obstacle | Small barrier illustration only if emoji is actually rendered in-game | REVIEW  | — | — |
| object-satellite | 🛰️ | `space.js`; `game/games/space.js` | Space collectible/theme glyph; World collectible/theme glyph | Simple satellite illustration if visibly rendered | REVIEW  | — | — |
| object-telescope | 🔭 | `space.js`; `game/games/space.js` | Space collectible/theme glyph; World collectible/theme glyph | Simple telescope illustration if visibly rendered | REVIEW  | — | — |
| object-ice-cube | 🧊 | `space.js`; `game/games/space.js` | Space collectible/theme glyph; World collectible/theme glyph | Simple ice cube asset if visibly rendered | REVIEW  | — | — |
| object-spiral | 🌀 | `space.js`; `game/games/space.js` | Space collectible/theme glyph; World collectible/theme glyph | Prefer vector effect if used as a swirl, not a physical object | SVG/CSS  | — | — |
| object-comet | 💫 / 🌠 | `space.js`, racing decor | Space effect/decoration | Vector effect or simple image depending on actual rendering size | REVIEW  | — | — |

## Source-audit coverage and findings

A literal Unicode pictograph scan was completed against the canonical runtime files under `game/`: all first-party `.js`, `.mjs`, `.html`, `.css`, and `.json` files returned by the repository tree, including `game/index.html`, all game pages, all game modules, shared modules, CSS, manifests, and service-worker files. The third-party minified Three.js library was excluded. Comments and explanatory prose may contain emoji too; the scan is a candidate-finding pass, not proof that every glyph is actually rendered.

Important source-specific findings that need careful treatment:
- `game/data/serbian.js` has 28 alphabet picture records plus counting records for 1–20. Reuse the canonical animal/object art for repeated concepts; do not generate a separate image for every letter or number.
- `game/games/compare.js` has a dynamic object pool containing animal faces, rabbit, chick variants, fruits, star variants, and a balloon. Any generated object must work at the actual comparison scale.
- `game/games/adventure.js`, `adventure-modes.js`, `dino.js`, `driving.js`, `ocean.js`, `space.js`, `kitty-standalone.js`, and `racing-config.js` contain per-world collectible/decor glyphs. Keep character sprites and existing engine/rendering behavior intact; only replace non-character glyphs that are actually rendered.
- `game/games/racing3d.mjs` has emoji in UI text/fallbacks (sound state and finish flag), while world objects and pickups are rendered as 3D meshes. Do not replace those meshes with 2D art.
- Page-level emoji include favicons, hub tiles, labels, card backs, rewards, and controls. Controls and favicons should generally be handled as SVG/CSS or app-icon work rather than watercolor assets.
- No literal emoji were found in the scanned shared input/audio/navigation utilities or primary design-token/component CSS files; shared celebration does have an emoji fallback.


## Additional canonical concepts found in the literal scan

These are source-confirmed concepts/use sites that were not fully represented in the earlier rows. Merge each with an existing row above when the same semantic asset already exists; IDs are canonical suggestions, not a requirement to create one image per glyph occurrence.

| ID | Current glyph | Confirmed source location(s) | Current purpose | Proposed treatment | Status |
|---|---|---|---|---|---|
| animal-rabbit | 🐰 | `game/games/compare.js`, `spatial.js` | Comparison pool and spatial scene | One simple rabbit illustration | REVIEW |
| animal-baby-chick | 🐤 | `game/games/compare.js`, `spatial.js` | Comparison pool and spatial scene | Reuse chick only if visual distinction is not pedagogically needed; otherwise keep a separate canonical variant | REVIEW |
| animal-mouse | 🐭 | `game/games/spatial.js` | Spatial scene / position task | Simple mouse illustration | REVIEW |
| food-cheese | 🧀 | `game/games/spatial.js` | Spatial scene / position task | Simple cheese illustration | REVIEW |
| object-ball | ⚽ | `game/games/spatial.js` | Spatial scene / position task | Keep a clear, simple ball illustration; SVG may be sufficient | REVIEW |
| object-pine-tree | 🌲 | `game/games/racing-config.js` | Winter/forest scenery | Reuse tree family only if evergreen silhouette is distinct enough | REVIEW |
| object-mountain | ⛰️ | `game/games/racing-config.js` | Racing scenery | SVG/CSS scenery shape or one simple illustration | REVIEW |
| object-beach-umbrella | ⛱️ | `game/games/racing-config.js` | Beach scenery | Simple illustration only if the glyph is actually visible at meaningful size | REVIEW |
| object-surfboard | 🏄 | `game/games/racing-config.js` | Beach scenery | Usually remove/replace with a simple vector; avoid unnecessary tiny art | REVIEW |
| object-wave | 🌊 | `game/games/racing-config.js` | Ocean scenery | CSS/SVG wave or one simple image, depending on render scale | REVIEW |
| object-skis | 🎿 | `game/games/racing-config.js` | Winter scenery/collectible | Small SVG or illustration if prominent | REVIEW |
| object-skier | ⛷️ | `game/games/racing-config.js` | Winter scenery | Likely remove if tiny decorative clutter; otherwise simple vector | REVIEW |
| object-evergreen-lantern | 🏮 | `game/games/racing-config.js` | Night scenery | Simple vector/illustration only if retained | REVIEW |
| animal-owl | 🦉 | `game/games/racing-config.js` | Night scenery | One simple owl illustration if retained as a visible object | REVIEW |
| animal-bat | 🦇 | `game/games/racing-config.js` | Night scenery | One simple bat illustration if retained as a visible object | REVIEW |
| animal-monkey | 🐒 | `game/games/racing-config.js` | Tropical scenery | One simple monkey illustration if retained | REVIEW |
| object-grass | 🌾 | `game/games/racing-config.js` | Farm scenery | Simple vector or shared grass/plant art | REVIEW |
| object-spaceship | 🛸 | `game/games/racing-config.js` | Space scenery | Reuse a spaceship illustration only if visually distinct from the rocket | REVIEW |
| object-galaxy | 🌌 | `game/games/space.js`, `racing-config.js` | Space world theme/scenery | Prefer background treatment, not a standalone object asset | REVIEW |
| object-meteor | 🌠 | `game/games/space.js`, `racing-config.js` | Space collectible/effect | SVG/canvas effect likely better than watercolor art | REVIEW |
| object-lightning | ⚡ | `game/games/racing3d.mjs` | Speed-boost comment/effect label | SVG/CSS effect; not an illustration candidate unless actually rendered as a glyph | SVG/CSS |
| object-arrow-right | ➜ / ➡ / ➡️ | multiple game pages/modules | Next/navigation controls | One consistent SVG/CSS arrow; never generate image assets for it | UI ICON |
| object-eye-button | 👁 / 👁️ | `game/games/animal_puzzle.js` | Peek/reveal picture control | SVG/CSS icon | UI ICON |
| object-calendar-clock | 🕰️ | `game/games/classroom.js`, `classroom.html` | Time activity icon | SVG/CSS icon or a designed clock face | UI ICON |
| object-seasons-leaf | 🍂 | `game/pages/classroom.html`, `game/games/racing-config.js` | Seasons tile and scenery | One leaf illustration if used as scenery; tile may remain icon | REVIEW |
| object-sun | ☀️ | `game/games/classroom.js` | Time-of-day teaching scene | SVG/canvas sun or simple illustration depending on display size | REVIEW |
| object-sunrise | 🌅 | `game/games/classroom.js` | Time-of-day teaching scene | Reuse a sunrise scene only if it is a prominent teaching image | REVIEW |
| object-sunset | 🌇 | `game/games/classroom.js` | Time-of-day teaching scene | Reuse a sunset scene only if it is a prominent teaching image | REVIEW |
| object-night-sky | 🌙 | `game/games/classroom.js` and several world configs | Time-of-day teaching and world motif | Reuse canonical moon; avoid separate duplicates | REVIEW |
| object-cards-pattern | 🃏 | `game/pages/animal_memory.html`, `matching_game.html`, hub | Memory card-back and game tile | Design a proper card-back pattern; do not use a playing-card emoji as a large card face | REVIEW |
| object-heart-shape | ❤️ | `game/data/serbian.js` | Serbian phonics vocabulary | SVG shape is preferable to a generated raster image | SVG/CSS |
| object-pig-snout | 🐽 | `game/data/serbian.js` | Serbian phonics vocabulary | Pig image may not clearly teach “snout”; use a distinct crop/icon if required | REVIEW |
| object-monitor | 🖥️ | `game/data/serbian.js` | Serbian phonics vocabulary | Simple monitor illustration | REVIEW |
| object-needle-thread | 🪡 | `game/data/serbian.js` | Serbian phonics vocabulary | Simple needle/thread illustration | REVIEW |
| object-clock | 🕰️ | `game/games/classroom.js`, `classroom.html` | Time activity and day/night scene | Use a clear clock face; consider SVG at UI size | REVIEW |
| object-music-bell | 🔔 | `game/games/piano.js` | Song label | SVG or small bell illustration depending on prominence | REVIEW |
| object-hint-bulb | 💡 | `game/pages/matching_game.html` | Hint control | SVG/CSS UI icon | UI ICON |
| object-search-glass | 🔍 | `game/pages/animals.html` | Find-animal control | SVG/CSS UI icon | UI ICON |
| object-trash-bin | 🗑 / 🗑️ | `game/pages/coloring.html`, `parent.html` | Clear/reset controls | SVG/CSS UI icon | UI ICON |
| object-card-stack | 🃏 | `game/index.html`, `animal_memory.html` | Memory game icon/card back | Replace card-back with a designed pattern; tile may use UI icon | REVIEW |
| object-celebration-sparkle | ✨ / 🌟 | sequencing, Kitty, adventure and success states | Success/effect | CSS/SVG particles and approved star; no duplicate sparkle PNGs | SVG/CSS |
| object-wrapped-candy | 🍬 | `game/games/racing-config.js` | Candy world decor | One canonical wrapped candy image only if visible enough | REVIEW |

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

## Technical QA facts for the work-in-progress bundle (measured 2026-10-21)

Measured with `node tools/asset_qa.js <dir> --against Reference/bear.png`. These are objective
measurements only — they say nothing about how the pictures look.

- `palette-match` = histogram intersection against the canonical bear (1 = same colour distribution).
- `small contrast` = legibility proxy after downscaling to 64x64 (low = the subject fades at card size).
- `alpha` = share of fully opaque / transparent / semi-transparent pixels.

| file | canvas | format | alpha op/tr/part % | palette-match | small contrast | family |
|---|---|---|---|---|---|---|
| bear.png | 1024x1024 | rgb | 100/0/0 | 1.0000 | 110.5 | canonical anchor (resampled 800 -> 1024, task 292) |
| chicken.png | 1254x1254 | rgb | 100/0/0 | 0.7475 | 69.7 | painted |
| horse.png | 1448x1086 | rgb | 100/0/0 | 0.7142 | 98.1 | painted |
| lion.png | 1448x1086 | rgb | 100/0/0 | 0.6746 | 125.1 | painted |
| frog.png | 1448x1086 | rgb | 100/0/0 | 0.6700 | 80.7 | painted |
| chick.png | 1254x1254 | rgb | 100/0/0 | 0.6732 | 58.9 | painted |
| elephant.png | 1536x1024 | rgb | 100/0/0 | 0.6596 | 102.9 | painted |
| sheep.png | 1254x1254 | rgb | 100/0/0 | 0.4186 | 61.6 | painted |
| rooster.png | 1024x1024 | rgb | 100/0/0 | 0.5042 | 136.4 | painted |
| bird.png | 1024x1024 | rgb | 100/0/0 | 0.0192 | 55.6 | painted (iteration 2, 2026-10-22) |
| fox.png | 1254x1254 | rgb | 100/0/0 | 0.1596 | 116.9 | painted |
| dog.png | 1024x1024 | rgb | 100/0/0 | 0.1125 | 104.5 | raster-emoji art, resampled (task 292) |
| cat.png | 1024x1024 | rgb | 100/0/0 | 0.0800 | 84.3 | raster-emoji art, resampled (task 292) |
| bone.png | 1536x1024 | rgb | 100/0/0 | 0.0798 | 36.8 | painted |
| cow.png | 1024x1024 | rgb | 100/0/0 | 0.0305 | 79.5 | raster-emoji art, resampled (task 292) |
| wolf.png | 1254x1254 | rgb | 100/0/0 | 0.0291 | 106.2 | painted |
| duck.png | 1024x1024 | rgb | 100/0/0 | 0.0248 | 83.1 | raster-emoji art, resampled (task 292) |
| fish.png | 1024x1024 | rgb | 100/0/0 | 0.0194 | 75.8 | raster-emoji art, resampled (task 292) |
| caterpillar.png | 1448x1086 | rgb | 100/0/0 | 0.0171 | 107.6 | painted |
| star.png | 1024x1024 | rgb | 100/0/0 | 0.0161 | 68.7 | raster-emoji art, resampled (task 292) |
| egg.png | 1024x1024 | rgb | 100/0/0 | 0.0164 | 38.8 | painted (candidate, iteration 2, 2026-10-22) |
| water-drop.png | 1024x1024 | rgb | 100/0/0 | 0.0117 | 49.2 | painted (iteration 2, 2026-10-22) |
| apple.png | 1024x1024 | rgb | 100/0/0 | 0.0095 | 140.0 | raster-emoji art, resampled (task 292) |
| banana.png | 1024x1024 | rgb | 100/0/0 | 0.0812 | 32.61 | painted (approved 2026-10-25, food batch 1) |
| strawberry.png | 1024x1024 | rgb | 100/0/0 | 0.0129 | 90.11 | painted (approved 2026-10-25, food batch 1) |
| grapes.png | 1024x1024 | rgb | 100/0/0 | 0.0125 | 80.35 | painted (approved 2026-10-25, food batch 1) |
| orange.png | 1024x1024 | rgb | 100/0/0 | 0.0526 | 102.83 | painted (approved 2026-10-25, food batch 1) |
| pear.png | 1024x1024 | rgb | 100/0/0 | 0.0071 | 67.71 | painted (approved 2026-10-25, food batch 1) |
| pig.png | 1024x1024 | rgba | 0/83/17 | 0.0059 | 163.5 | painted (resampled, task 292) |

Findings that still block the production step:

1. **No approved asset has a transparent background.** Every bundle PNG is fully opaque
   (corners alpha 255). `Reference/star.png` carries an alpha channel but never uses it.
2. **`pig.png` is the odd one out**: it has an alpha channel, yet only 0.02% of its pixels are
   fully opaque and 22% are semi-transparent — the subject is washed out edge to edge and will
   look faded once composited. It needs a fresh alpha cut-out.
3. `bundle/bear.png` was pixel-identical to the canonical bear (`Reference/bear.png`, 800x800)
   until task 292 resampled the bundle copy to 1024x1024; the canonical file in `Reference/`
   stays the style anchor.
4. Every bundle file is now at least 1024 px on its long side. The seven raster-emoji files
   (165-305 px until task 292) were resampled to 1024x1024 without redrawing them; they still
   show emoji-style art rather than the painted family, so they stay excluded from the
   automatic reference pick.
5. `bone.png` has the lowest small-size contrast (36.8) and `chick.png` the second lowest (58.9)
   — pale subjects on pale paper, so both need a check at real card size.
6. `sheep.png`, `caterpillar.png` and `chick.png` (added 2026-10-21) follow the same pattern as
   the rest of the painted family: opaque, no alpha channel, same cream paper background.
7. **`palette-match` is hypersensitive to the background tone and must not be read as a style
   score.** It is a 4-bit-per-channel histogram intersection over the whole frame, and the flat
   paper is roughly 80% of the frame, so a ~10-unit shift in the paper's green channel moves the
   whole background mass into a different bin. `bird.png` scores 0.0152 against the bear while
   its paper (corners 243.3/239.5/231.8) sits inside the family range (251.8-254.3 / 249.5-254 /
   237-254); against the sheep it scores 0.3157, the highest of all references. Use the paper
   tone, the subject colour and the subject coverage instead:

   | file | paper (corners) | subject mean RGB | subject coverage |
   |---|---|---|---|
   | bird.png (iteration 2) | 247.5/244.3/234.8 | 180.1/175.5/164.1 | 16.2% |
   | rooster.png (approved) | 246.8/243.3/236.5 | 163.7/121.9/97.6 | 27.2% |
   | water-drop.png (approved, iteration 2) | 247.5/238.3/226.8 | 148.6/199.5/225.4 | 19.6% |
   | egg.png (candidate, iteration 2) | 241.3/238.8/231.3 | 219.2/193.8/167.0 | 16.8% |
   | bone.png (approved object exemplar) | 249.3/239.0/219.5 | 236.7/197.0/146.9 | 16.5% |
   | chicken.png | 253.3/250.5/238.3 | 239.0/182.3/127.0 | 23.8% |
   | chick.png | 252.8/252.5/239.0 | 249.4/213.7/118.5 | 23.7% |
   | sheep.png | 253.0/251.3/237.0 | 237.4/202.0/157.7 | 30.9% |
   | bear.png (canonical) | 247.0/246.0/244.0 | 218.3/166.4/98.5 | 33.1% |

8. **A pale subject needs a legibility check before it is handed over.** `egg.png` iteration 1
   measured a 64 px legibility proxy of **21.0** — the lowest value in the bundle, and the whole
   card was nearly blank, because a cream shell on cream paper has almost no tonal range. It was
   re-briefed (a shell a clear step deeper than the paper, medium warm-brown speckles instead of
   faint light ones, a deeper tan shaded side) and iteration 2 measures **38.8**, just above
   `bone.png` (36.8); the subject coverage rose from 8.8% to 16.8%, exactly the `bone.png` value.
   Measure the 64 px proxy for every pale subject, not just the coloured ones. The next object
   candidate, `water-drop.png`, was measured the same way: iteration 1 read as a cool **grey**
   (subject 164.0/172.2/178.1 — the blue only 14 units above the red) and the user asked for
   "more blue", so iteration 2 states the blue explicitly and bans grey-blue / slate / steel.
   Iteration 2 measures **148.6/199.5/225.4** (the blue 77 units above the red), paper
   247.5/238.3/226.8 back inside the family range, and a 64 px proxy of **49.2** — below the
   family band (55-125) because a light blue on cream paper is a small luminance step, and above
   the two pale-object exemplars (`bone.png` 36.8, `egg.png` 38.8). The user approved it.

9. **The references decide the form, not the words — and the shape can be sent as a reference.**
   A brief alone could not make the soap read as a bar: with warm references (bear, star, bone)
   it came out tan and lumpy, with the water drop in the set it came out peaked like a teardrop,
   and with no object reference it came out an amorphous blob. The fix is to send **the subject
   itself** as an image: `tools/asset_generate.js --subject-ref <file>` passes it as image 0 with
   the role *subject*, and the routing tells the model to copy that file's shape and colours while
   taking only the rendering style from the family references (paper tone, brushwork, one soft
   highlight, one shaded side, no face). **Rule for the next subjects: if the words cannot pin the
   form, send the form.** The soap render produced during those 2026-10-22 iterations was discarded
   at the user's request — the `soap.png` on `main` came from a later session — so only the
   technique and the flag were kept (task 291).

## Completion gate

This inventory is **not final for generation** until:
- canonical `game/` first-party JS/MJS/HTML/CSS/JSON files have been scanned for literal emoji/pictograph characters;
- dynamic emoji pools and per-world themes have been semantically checked against their actual render paths;
- shared/page-level emoji have been reviewed;
- duplicate concepts have been consolidated (including cow glyph variants and the repeated shell row);
- existing image assets and the excluded Explorer/Kitty/3D Racing areas have been checked;
- the user has approved which rows are to be illustrated, handled as SVG/CSS, or left unchanged.
