# Little Explorer — World Art Redesign & Implementation Plan

> **Document type:** Implementation handoff for the coding / implementation AI  
> **Project:** Kids Games / Little Play  
> **Target game:** Little Explorer  
> **Status:** Proposed implementation plan — not an implementation report  
> **Scope:** Complete visual redesign of the game world and environmental elements across all existing worlds  
> **Character scope:** Keep the current playable Explorer and Kitty character sprite sets unchanged during this pass  
> **Primary principle:** Preserve the game that children already know how to play while transforming its visual world into a cohesive, warm, illustrated storybook experience.

---

## 1. Mission

Redesign the visual presentation of **Little Explorer** so that the complete game feels like one carefully art-directed, polished, cozy illustrated adventure.

This is not a request to place a few new pictures over the current game. The goal is to replace the current mixed/procedural environmental presentation with a coherent visual asset system covering:

- World backgrounds and distant scenery
- Ground, terrain edges, and terrain fill
- Static and moving platforms
- Pipes, tunnels, burrows, portals, and enemy entrances
- Enemies and environmental creatures
- Hazards and obstacles
- Collectibles and world decorations
- Level-end locations and goal structures
- Small environmental details and ambient visual effects

The visual redesign must give each world its own recognizable identity while keeping all worlds recognizably part of the same game.

The result should feel **hand-crafted, inviting, tactile, gentle, playful, and visually consistent**. It should not look like a collection of unrelated asset packs or a generic platformer reskin.

### 1.1 Primary success criteria

1. Every existing world has a coherent, intentional art direction.
2. Environmental elements share a consistent illustration language.
3. Important gameplay objects are immediately readable.
4. Backgrounds create depth without competing with gameplay.
5. Platforms and hazards remain visually clear and mechanically honest.
6. Enemies look friendly and expressive rather than threatening.
7. Every world has a satisfying and memorable finish location.
8. The current playable characters remain visually compatible with the redesigned world.
9. Existing gameplay, physics, progression, controls, and level structure remain intact unless a separate change is explicitly approved.
10. The game remains offline-capable and performs well on modest Android tablets.

---

## 2. Mandatory instructions for the implementation AI

Read and obey the current project instructions before making changes. This document is a task-specific plan; it does not supersede repository instructions, approved project decisions, or the existing asset-generation workflow.

### 2.1 Read the current project rules first

Before implementation, locate and read the current versions of the relevant project documentation. At minimum, inspect:

- Repository root instructions and any applicable `AGENTS.md`
- Project workflow / process documentation
- Project decisions and current status documentation
- The current art `STYLE_BIBLE.md`
- The current `ASSET_INVENTORY.md`
- The current asset `PROGRESS.md`
- Any asset-generation prompts, pipeline instructions, naming rules, export rules, and review/approval instructions
- Little Explorer-specific documentation and previous visual reviews
- The screenshot review table of contents and relevant screenshots

Do not assume these files are located at the paths suggested in this plan. Find the current authoritative paths in the repository.

### 2.2 Mandatory asset-generation preflight

The project’s existing image-generation process and tools are the only approved workflow for this task. Use the actual project-defined tools, prompt templates, asset preparation steps, review steps, and export process.

The mandatory asset-generation preflight applies to **every individual asset or asset batch**. Before generating anything:

1. Inspect the latest style bible, asset inventory, and progress file on the active branch.
2. Identify the exact inventory entry and intended use for each candidate asset.
3. Verify whether it is eligible and explicitly approved for generation.
4. Check prerequisites, exclusions, unresolved audits, and whether an approved exemplar already fulfils the need.
5. Search the relevant repository scope for existing equivalents and near-duplicates, including production assets, work-in-progress assets, reference bundles, alternate formats, SVG/CSS/code elements, and assets stored outside the expected output folder.
6. Decide whether the requirement genuinely needs a generated raster asset or is better solved by reuse, CSS, SVG, Canvas code, or another method.
7. Prepare a specific asset brief based on the current style bible and approved exemplars.
8. Specify subject, purpose, silhouette, pose, framing, palette, lighting, texture, outline treatment, background/transparency, intended dimensions/aspect ratio, prohibited features, and known failure modes.
9. Challenge the decision before generation. If necessity, eligibility, approval, brief quality, or intended use is unknown, stop and resolve it.
10. Generate only through the project’s defined process.
11. Inspect the actual returned result before accepting it. Review readability at intended in-game size, silhouette, composition, palette, texture, transparency, edges, halos, accidental details, consistency, and similarity to existing assets.
12. Record the correct status and evidence in the project’s asset documentation.

**Never infer that this plan itself approves every proposed asset for generation.** A proposed asset is not automatically eligible or approved. Do not bypass an inventory gate because an asset appears visually desirable.

Keep these statuses distinct:

- Proposed
- Audited
- Eligible
- Approved for generation
- Generated
- Reviewed
- User-approved
- Production-ready
- Integrated
- Committed
- Verified / tested

A generated image is not automatically approved, production-ready, integrated, committed, or tested.

### 2.3 Evidence and repository integrity

- Verify the active repository, branch, current commit, and working tree before starting.
- Read the current source files before editing. Do not rely on this plan as proof that a path, function, asset, or architecture still exists.
- Verify every path and asset name before documenting or referencing it as existing.
- Do not invent files, inventory rows, approvals, test results, commit IDs, or completed work.
- Do not overwrite approved assets or references without explicit authorization.
- Keep a clear record of what was proposed, changed, tested, committed, and approved.
- If a tool or check is unavailable, report that limitation rather than implying verification.

### 2.4 Scope protection

This task is a visual redesign, not a gameplay redesign.

Do not change without separate approval:

- Player physics, acceleration, jump height, gravity, friction, or movement response
- Collision dimensions or collision semantics
- Enemy damage, movement speed, AI, spawning, or defeat behaviour
- Platform movement rules or timing
- Camera behaviour or world dimensions
- Level order, world count, progression, unlocks, or checkpoints
- Collectible values or gameplay effects
- Touch controls, input mapping, or HUD behaviour
- Audio behaviour or sound design
- Win/lose conditions
- Accessibility behaviour already present

If the new art reveals a real readability problem that cannot be solved visually, document it as a proposed separate gameplay/readability change. Do not silently alter mechanics.

---

## 3. Verified starting context — re-verify before implementation

The following is the known starting context from the previous source audit. It is a guide for where to begin, **not a substitute for checking the active branch**.

### 3.1 Previously identified game entry and renderer

- `game/pages/explorer.html` was identified as the Little Explorer page entry point and HUD.
- `game/games/kitty-standalone.js` was identified as the active game engine loaded by that page.
- The engine uses Canvas 2D and contains world definitions, gameplay logic, and much of the procedural rendering.
- Do not assume `game/games/adventure.js` is the active engine for this page. Verify the actual script references in the current `explorer.html`.

### 3.2 Previously identified character asset locations

- `game/assets/images/explorer/` — Explorer girl sprites.
- `game/assets/images/explorer_kitty/` — Kitty sprites.

Treat these character sprite sets as protected during this project phase. Verify their current location and use before making any changes.

### 3.3 Previously identified world roster

The earlier audit identified 11 worlds:

1. Spring
2. Summer
3. Autumn
4. Winter
5. Underground
6. Cave
7. Underwater
8. Savanna
9. Japan
10. North Pole
11. Egypt

Re-read the current world registry and confirm the exact count, IDs, labels, ordering, and current world definitions before planning asset rows or implementation mappings. If the repository has changed, the repository wins.

### 3.4 Previously identified procedural rendering categories

The earlier audit found procedural Canvas rendering for categories including:

- Ground and terrain
- Static and moving platforms
- Enemy-spawning pipes / entrances
- Pop-up enemies
- Ground-walking enemies
- Hills, clouds, and scenery
- Water, lava, and spike hazards
- Goal / finish buildings
- Other world-specific decorations

The earlier audit also identified enemy examples such as mouse, mole, bat, piranha, snake, oni, penguin, and scorpion, plus ladybug, bee, hedgehog, and snowman. These are examples only. Build the real inventory from the current source.

### 3.5 Existing scene assets

`game/assets/scenes/` was previously observed to exist, but it was **not established** that its contents are currently used by Little Explorer. Inspect this directory and trace actual references before deciding whether any asset can be reused.

### 3.6 Existing visual references

The project has a screenshot review area previously identified as:

`resources/General_reviews/Screenshot_Review/`

It was reported to contain a `table_of_content.md` mapping screenshots to games. Verify the current folder, table of contents, screenshot coverage, and the latest relevant Little Explorer captures. Do not assume every screenshot is current.

---

## 4. Design direction

### 4.1 Overall visual identity

Use the current project style bible as the authority. The intended direction established for this task is a soft, hand-painted storybook world with a cozy, tactile feeling.

The world should feel like a beautifully illustrated children's picture book brought gently to life.

Target qualities:

- Soft watercolor / gouache-like painted surfaces, where consistent with the approved style bible
- Organic, imperfect shapes rather than rigid geometric primitives
- Layered pigment and subtle paper-like texture
- Warm, carefully balanced palettes
- Gentle lighting and soft atmospheric depth
- Clear, intentional silhouettes
- Rounded, friendly forms
- Expressive details without visual clutter
- A consistent level of detail across all asset categories

Do not treat “watercolor” as permission to make everything blurry. Gameplay objects must remain crisp enough to read instantly.

### 4.2 Avoid visual mismatches

Unless the current approved style bible explicitly allows a treatment, avoid:

- Glossy 3D or plastic-looking rendering
- Emoji-like vector art
- Heavy black outlines
- Excessively thick cartoon borders
- Strong outer glows and dark halos
- Harsh gradients that look unrelated to the painted style
- Overly detailed textures that become noise at gameplay scale
- Photorealistic objects mixed with illustrated objects
- Random asset-pack styles
- Flat procedural shapes beside highly detailed painted assets
- Large baked-in shadows that create false collision cues
- Decorative details that obscure hazards or platform edges
- Unwanted background colours on assets that require transparency

Use the project’s approved exemplars to resolve any uncertainty about line work, texture, edge softness, palette, and detail density.

### 4.3 Consistency without homogenization

All worlds must belong to the same visual family, but they must not become recolours of one generic environment.

Keep shared:

- Rendering technique
- Material language
- Edge and outline treatment
- Lighting logic
- Texture scale
- Detail density
- Shape vocabulary
- Shadow softness
- Asset readability standards

Vary by world:

- Dominant palette
- Local vegetation and architecture
- Geological / environmental materials
- Weather and atmosphere
- Background landmarks
- Enemy and creature designs
- Platform materials
- Entrance and goal motifs
- Local decorative motifs

Each world should be recognizable from its environment even before the player sees the world title.

---

## 5. Player characters: preserve in this pass

The Explorer girl and Kitty are to remain unchanged during the first environment redesign pass.

Requirements:

- Do not regenerate, repaint, recolour, resize, crop, or replace their sprite sheets.
- Do not alter animation frame order, frame dimensions, timing, hitboxes, or character scale.
- Do not change character outlines or add effects directly to the sprites.
- Design the world assets to harmonize with the existing characters.
- Check contrast between character silhouettes and every new background / platform palette.
- Avoid backgrounds with similar colours or texture density immediately behind the player.
- If a character appears stylistically inconsistent after the environment redesign, document the issue and propose a later, separate character-art phase. Do not solve it by changing the character now.

This scope protects the identity and animation work already present while allowing the world redesign to be evaluated independently.

---

## 6. Phase 0 — Repository and visual audit

**Purpose:** Establish the actual current state before changing code or creating assets.

### 6.1 Repository baseline

Record:

- Repository and active branch
- Current commit SHA
- Working-tree status
- Relevant open PRs / in-flight changes, if applicable
- Current CI status relevant to the branch
- Current project task ID and task workflow requirements

Do not start on a stale branch or overwrite another task’s work.

### 6.2 Source audit

Inspect the current Explorer entry page, engine, world registry, render functions, asset loading, collision definitions, and any existing world-specific configuration.

Identify:

- Which renderer functions are active
- Which functions draw each category
- Which objects are data-driven and which are hard-coded
- How world IDs select palettes and scenery
- How enemy types are assigned and rendered
- How platforms are represented and drawn
- How entrances and goal objects are represented
- How camera/world coordinates are applied
- How assets are loaded and cached
- Whether rendering is called every frame and how animation timing works
- Whether the current engine already has an asset registry or loading abstraction

Do not refactor the entire engine simply because the renderer is large. Prefer the smallest maintainable change that supports the redesign.

### 6.3 Build the complete asset map

Create a row for every visual element in the current game. At minimum include:

| Field | Meaning |
|---|---|
| World ID | Exact ID from the current world registry |
| World name | Current displayed name |
| Element category | Background, terrain, platform, enemy, entrance, hazard, goal, etc. |
| Current implementation | Existing function, asset, CSS, SVG, or Canvas primitive |
| Current source path | Verified file / function location |
| Current use | Which levels or worlds use it |
| Proposed treatment | Reuse, adapt, replace, create, or retain procedural |
| Candidate asset ID | Proposed inventory identifier, if appropriate |
| Required variants | State, size, direction, animation, or biome variants |
| Gameplay dependency | Collision, spawn, movement, visual-only, etc. |
| Generation eligibility | Unknown / eligible / not eligible / approved, based on evidence |
| Notes | Risks, references, open questions |

Do not fabricate an asset inventory from the examples in this plan. Extract the real list from the current source and existing asset inventory.

### 6.4 Screenshot audit

Use the screenshot table of contents to locate current Little Explorer screenshots. Review the game in every available world and orientation.

Record:

- Which worlds are represented
- Which important visual categories are visible
- Which screenshots are outdated or ambiguous
- Which states are missing
- Any major composition or readability issues
- Any current assets that should be preserved

If screenshot coverage is incomplete, document the missing views and obtain new captures using the project’s established screenshot procedure before making visual judgments that depend on them.

### 6.5 Phase 0 deliverables

Store development/review documents under the verified project `resources/` structure, following the project’s existing conventions. Suggested document names below are proposals; check for existing equivalents before creating duplicates.

- `ART_AUDIT.md` — source and visual audit
- `ASSET_MAPPING.md` — complete element-to-asset mapping
- `WORLD_VISUAL_ASSESSMENT.md` — current state and issues by world
- Updated asset inventory / progress entries, if required by the existing workflow

**Gate 0:** Do not begin image generation or broad renderer changes until the current source, all 11 (or current actual count) worlds, asset reuse opportunities, and generation process have been audited.

---

## 7. Phase 1 — Environment art direction and technical contract

**Purpose:** Turn the broad style into production rules that can be applied consistently to every asset.

Create a Little Explorer environment-art addendum to the current style bible. Do not replace or contradict the master style bible. It should explain how the established art direction applies specifically to large environments, tileable terrain, platforms, parallax scenes, hazards, and game-scale sprites.

### 7.1 Define shared art rules

Specify, with approved visual examples where possible:

- Palette construction and colour relationships
- Warm/cool balance
- Light direction and shadow behaviour
- Surface texture and brush / pigment character
- Edge softness and outline treatment
- Shape language
- Detail density by asset size
- Contrast hierarchy
- Foreground / midground / background separation
- Character-background contrast
- Transparent-edge quality
- Texture scale at native gameplay size

### 7.2 Define world palette sheets

For each world, document:

- Primary environment colours
- Secondary colours
- Accent colours
- Ground / platform materials
- Background atmosphere
- Hazard colours
- Enemy contrast requirements
- Goal landmark colours

Do not choose palettes independently for every asset. Establish a world palette first, then derive individual asset briefs from it.

### 7.3 Define asset families and construction rules

Create standards for:

**Backgrounds**
- Multiple parallax depth layers where supported by the renderer
- Seamless horizontal continuation where a world scrolls
- No baked-in gameplay platforms, hazards, or enemies
- Clear negative space around the gameplay plane
- Low-contrast distant forms
- No important visual detail hidden behind the player or HUD

**Terrain**
- Separate top / playable surface from side and underside
- Consistent edge thickness and collision readability
- Tileable or modular pieces where required
- Left, centre, right, inner-corner, outer-corner, and end-cap variants where the geometry needs them
- Avoid visible seams and repeated obvious patterns

**Platforms**
- Clearly distinct from background scenery
- Consistent top surface and side material
- Readable edges at small scale
- Modular lengths or variants where necessary
- Moving platform artwork must remain visually clear during motion

**Entrances**
- Themed to the world rather than generic plumbing
- Clear opening / emergence point for enemies
- No ambiguity between decoration and an active spawn point
- Artwork must not imply a different collision shape

**Enemies**
- Friendly, readable silhouette
- Distinct identity and colour from terrain
- Expressions suitable for young children
- Required directional / animation states based on actual engine behaviour
- No decorative appendages that obscure the collision-relevant body

**Hazards**
- Strong visual readability without becoming frightening
- Clearly communicate danger through shape and colour
- Avoid false safe-looking surfaces
- Preserve exact collision boundaries

**Goals**
- A memorable world-specific destination
- Visually rewarding and easy to recognize
- Clear focal hierarchy
- Do not cover or misrepresent the actual goal trigger area

### 7.4 Define technical export requirements

Derive exact dimensions, formats, transparency, sprite-sheet layout, naming, compression, and file-size limits from the current project pipeline and renderer.

Do not invent a universal pixel size or sprite-sheet format. Different asset families may need different specifications.

The technical contract must define:

- Coordinate and scale conventions
- Native display size / intended scale
- Sprite-sheet frame dimensions and order, where relevant
- Animation frame rate / timing expectations
- Transparent background requirements
- File format and colour mode
- Compression / maximum file size guidance
- Tile seam requirements
- Whether mipmaps / filtering / smoothing are used
- Asset loading and fallback behaviour
- Naming and inventory ID conventions

### 7.5 Phase 1 deliverables

- Environment-art style bible addendum
- World palette sheets
- Asset-family technical contract
- Updated asset inventory with proposed items clearly distinguished from approved items

**Gate 1:** The art direction and technical contract must be reviewed and accepted through the project’s normal approval process before large-scale asset generation.

---

## 8. Phase 2 — Rendering architecture and integration design

**Purpose:** Prepare the engine to use new art without disturbing gameplay.

The current game was previously audited as a Canvas 2D game with procedural drawing. Verify this before implementation.

### 8.1 Architectural approach

Prefer a data-driven rendering layer that maps world and element IDs to visual assets.

A possible conceptual structure (not a mandate to create these exact files):

```text
game/
  assets/
    images/
      explorer/                 # Existing player sprites; preserve
      explorer_kitty/           # Existing Kitty sprites; preserve
      explorer_worlds/
        spring/
        summer/
        autumn/
        winter/
        underground/
        cave/
        underwater/
        savanna/
        japan/
        north-pole/
        egypt/
  games/
    ...                         # Existing game engine structure
```

The exact folder structure must follow current repository conventions. Verify paths and avoid creating a second competing asset hierarchy.

Development-only material belongs in `resources/`, not in the deployable `game/` directory. The `game/` folder must contain all runtime assets needed to play and must not depend on `resources/`.

### 8.2 Separate visual representation from gameplay data

Keep these concepts independent:

- World / level data
- Physics and collision geometry
- Entity behaviour
- Render asset selection
- Render transforms / animation state

An asset may visually extend beyond its collision box. That is acceptable if the collision remains correct and the visual does not mislead the player.

Do not use image alpha bounds or image dimensions as an accidental replacement for explicit collision geometry.

### 8.3 Asset registry

Design a small, maintainable mapping layer that can resolve:

- World background layers
- Terrain tile family
- Platform family
- Entrance family
- Enemy visual by enemy type and state
- Hazard visual
- Goal visual
- Decorative world props

Requirements:

- Stable asset identifiers
- Explicit world-to-family mapping
- Safe fallback when an optional decoration is absent
- Visible development-time warning for missing required assets
- No silent fallback to an unrelated world’s art
- No remote asset URLs
- Asset paths must resolve locally and work offline

Avoid overengineering. A simple registry or world configuration may be sufficient.

### 8.4 Asset loading

- Load required assets before gameplay begins, or use a reliable loading state that prevents invisible gameplay.
- Cache image objects; do not create new image instances every frame.
- Avoid repeated disk/network fetches.
- Track loading and failure state.
- Do not allow a missing image to crash the game loop.
- Do not silently hide a missing gameplay-critical object.
- Preserve offline operation.
- Ensure assets are not loaded repeatedly when changing worlds unnecessarily.
- Keep memory use appropriate for modest Android devices.

### 8.5 Rendering behaviour

- Draw background layers in a stable order.
- Apply parallax only to background layers, not to gameplay geometry.
- Keep world-coordinate transforms and camera transforms consistent.
- Draw gameplay-critical objects at predictable z-order.
- Avoid excessive per-frame allocations.
- Avoid expensive filters, giant textures, or unnecessary canvas resizing.
- Do not add animation to every decorative object. Motion should be calm and purposeful.

### 8.6 Procedural rendering policy

The goal is to replace the inconsistent environmental look, not necessarily to eliminate all procedural rendering.

Retain procedural rendering when it is the better solution for:

- Simple effects
- Tiny particles
- Repeated low-detail elements
- Dynamic geometry
- Simple tinting or state changes
- Performance-sensitive details that do not need unique illustration

Use image assets when the visual identity, silhouette, texture, or hand-painted quality materially benefits from authored art.

Do not keep a large procedural object merely because it is already coded, and do not generate a raster asset for every tiny shape just to claim that everything is illustrated.

### 8.7 Phase 2 deliverables

- Renderer integration design
- Asset loading / registry implementation plan
- Explicit mapping between existing gameplay entities and new visual assets
- Performance and fallback strategy

**Gate 2:** Confirm the integration design can preserve collision and gameplay independently from the artwork before implementing a full world.

---

## 9. Phase 3 — Build one complete pilot world: Spring

**Purpose:** Validate the entire pipeline with one complete world before scaling to all worlds.

Recommended pilot: **Spring / Пролећни дан**.

Spring should become the reference implementation for asset quality, environment layering, terrain construction, platform treatment, entrances, enemies, hazards, and finish location.

### 9.1 Spring visual concept

A gentle, welcoming spring meadow with soft green hills, warm sunlight, flowering plants, and a sense of discovery.

It should feel alive without looking busy. Keep the gameplay area visually calm and the distant landscape atmospheric.

### 9.2 Spring asset categories

The exact assets must come from the Phase 0 audit and inventory. The following are candidate categories, not pre-approved generation instructions.

**Background**
- Distant sky / atmosphere
- Distant rolling hills
- Midground trees, bushes, and meadow shapes
- Near-background vegetation, if it does not obscure gameplay
- Optional small clouds or ambient details

**Terrain**
- Spring grass top surface
- Earth / soil side
- Modular horizontal ground pieces
- Left / right ends and corner transitions as required by actual level geometry
- Any special terrain variations used by the Spring world

**Platforms**
- Static platform family
- Moving platform family
- Any special platform variants found in the source

**Entrances**
- A spring-themed burrow, hollow stump, or other world-appropriate entrance concept
- The final motif must remain compatible with the actual enemy spawn location and collision design

**Enemies**
- Actual Spring-world enemy types from the current source
- Required movement / direction / animation states
- Any world-specific friendly creature variants

**Hazards**
- Actual Spring hazards from the level definitions
- If water is used, visually distinguish safe water decoration from the active hazard
- Keep hazard boundaries obvious and consistent with collision

**Collectibles and decorations**
- Existing collectible visuals used in Spring
- Small flowers, mushrooms, stones, leaves, or other approved decorative elements only where they do not clutter gameplay

**Goal**
- A small painted cottage / garden gate / meadow destination is a candidate concept
- Select the final goal design only after checking the existing goal behaviour and world narrative
- The goal trigger must remain easy to identify

### 9.3 Spring acceptance criteria

- The world looks complete, not like a background with placeholder gameplay pieces.
- Background depth is visible but does not compete with the player.
- Ground and platforms read as solid, walkable surfaces.
- Every enemy is recognizable at gameplay scale.
- Entrances clearly communicate enemy emergence.
- Hazards are unmistakable.
- Goal location feels like a satisfying destination.
- Explorer and Kitty remain readable against every scene layer.
- No gameplay behaviour or collision changes are introduced.
- All required images load locally and reliably.
- The world works at supported orientations and screen sizes.

### 9.4 Pilot review

Capture before / after screenshots from comparable camera positions and gameplay states.

Review the actual game, not only isolated asset previews. Inspect:

- Asset scale in context
- Composition during camera movement
- Player contrast
- Tile seams
- Sprite cropping
- Layer overlap
- Enemy readability during animation
- Platform edges
- Goal visibility
- Performance during active gameplay

Do not proceed to mass production until the pilot has passed the project’s review and approval process.

---

## 10. Phase 4 — Expand to the remaining worlds

After Spring validates the pipeline, use a dependency-aware rollout. Keep the visual language consistent while designing each world as its own place.

The following batch order is a proposed production sequence. Reorder only when the current source, asset dependencies, or project priorities justify it.

### Batch A — Spring and Summer

Spring is the pilot. Summer should reuse the validated environment system but have its own identity.

**Summer direction**
- Warm sunlit landscape
- Richer, warmer greens and golden accents
- Summer vegetation and flowers
- World-appropriate distant landmarks
- Distinct platform and terrain material treatment
- Summer-specific entrance and goal motifs

Do not simply recolour Spring assets. Shared construction rules are encouraged; world-specific art is required where the environment demands it.

### Batch B — Autumn, Winter, and North Pole

**Autumn**
- Warm amber, rust, ochre, and muted red palette
- Layered foliage and seasonal ground detail
- Clear separation between decorative leaves and gameplay hazards
- World-specific platforms, entrances, enemies, and goal

**Winter**
- Snow, ice, muted evergreen, and cool atmospheric palette
- Readable distinction between solid snow, slippery/icy surfaces (only if such mechanics already exist), and hazards
- Snow accumulation must not obscure platform edges
- Avoid excessive white-on-white contrast loss

**North Pole**
- A distinct polar identity rather than a duplicate Winter world
- Ice formations, distant polar landscape, snow, and world-specific landmarks
- Carefully controlled cool palette with enough warm accents for player and enemy readability
- A unique goal location

### Batch C — Underground and Cave

**Underground**
- Enclosed subterranean atmosphere
- Earth, roots, stone, crystals, or other motifs supported by the world’s existing content
- Distinct background depth and lighting
- Clear platform and ground silhouettes against darker scenery

**Cave**
- Visually distinct from Underground
- Stronger rock formations and cave depth
- Restrained luminous accents only where supported by the art direction
- Keep dark areas readable; do not hide enemies or platform edges
- Avoid large black regions or intense glow effects

### Batch D — Underwater

**Underwater**
- Layered aquatic depth and soft underwater atmosphere
- Clearly separated foreground gameplay plane and distant sea life
- Water / bubble / plant decoration must not look like a collision object
- Distinct treatment for platforms, entrances, hazards, enemies, and goal
- Keep the player silhouette readable against both light and dark water areas
- Avoid visual effects that reduce contrast or obscure movement

### Batch E — Savanna and Egypt

**Savanna**
- Warm grassland palette
- Distant acacia-like silhouettes or other appropriate scenery, if supported by the art brief
- Layered grasses and gentle landscape forms
- World-specific ground and platform materials
- Creature designs must match the actual enemy roster

**Egypt**
- Warm desert / sandstone palette
- Distinctive architecture and environmental landmarks
- Strong but soft-edged shape language
- Avoid overloading the scene with tiny hieroglyphic details
- Keep any cultural motifs considered and respectful; do not use arbitrary symbols as decoration
- Unique entrance and goal motifs

### Batch F — Japan

**Japan**
- A distinct, carefully composed world identity
- A restrained, harmonious palette
- Japanese-inspired architecture and landscape motifs only where appropriate to the existing world concept
- Avoid mixing unrelated cultural symbols or generic “Asian” visual shorthand
- Preserve a calm gameplay plane and readable silhouettes
- World-specific entrance, enemies, platforms, and finish location

### 10.1 Per-world design brief

Before generating or integrating a world’s assets, complete a short design brief containing:

1. World identity and mood
2. Palette sheet
3. Background depth plan
4. Ground / terrain material
5. Platform material and variants
6. Entrance motif
7. Actual enemy roster and visual states
8. Hazard list and readability rules
9. Collectibles / decorations
10. Goal / finish concept
11. Required asset dimensions and export rules
12. Existing assets to reuse
13. Assets explicitly not to replace
14. Generation eligibility and approval evidence
15. QA screenshots / states required

### 10.2 Per-world completion gate

A world is not complete merely because its background exists. It must have all required categories mapped and reviewed, including any categories that are intentionally retained or procedural.

---

## 11. Phase 5 — Enemies, hazards, entrances, and finish locations

These elements have a large effect on the game’s personality. Give them dedicated review rather than treating them as incidental details.

### 11.1 Enemies

For each actual enemy type:

- Identify its gameplay role and existing behaviour.
- Identify the visual states the engine actually uses.
- Create a distinctive silhouette.
- Keep the face and key identity readable at native size.
- Use a consistent material and texture language.
- Ensure the enemy contrasts with the local ground and background.
- Preserve the existing collision geometry and behaviour.
- Create only the required directional / animation variants.
- Check the sprite in motion, not just as a still image.

Do not invent new enemies or change enemy behaviour as part of this art pass.

### 11.2 Enemy entrances

Entrances should feel integrated into the world:

- Spring / Summer: natural burrow, hollow log, or another approved biome-specific structure
- Autumn / Winter / North Pole: use appropriate natural or constructed forms
- Underground / Cave: tunnel, rock opening, or cave structure
- Underwater: suitable aquatic opening or structure
- Savanna / Egypt / Japan: world-appropriate environmental or architectural motifs

These are concept directions only. The final choice must be consistent with the actual game content and art direction.

Every entrance must:

- Make the spawn point visually obvious
- Keep the enemy emergence area clear
- Avoid looking like a decorative object that has no gameplay role
- Preserve its existing spawn / collision behaviour
- Avoid occluding the enemy during emergence

### 11.3 Hazards

For each hazard:

- Document the actual collision geometry.
- Design a strong silhouette and clear visual language.
- Keep danger readable without frightening imagery.
- Avoid relying on colour alone.
- Ensure decorative effects do not disguise the active collision region.
- Preserve all existing gameplay rules.

### 11.4 Goal / finish locations

Each world should have a recognizable destination that feels like a reward for exploration.

Goals should be:

- World-specific
- Visually memorable
- Large enough to read
- Friendly and inviting
- Consistent in rendering style
- Clearly distinct from ordinary scenery
- Compatible with the current finish trigger and animation

Avoid using the same generic building with a palette swap in every world. Shared goal proportions or interaction language are fine; the landmark itself should belong to its world.

---

## 12. Phase 6 — Integration and cleanup

After assets have passed review and approval:

1. Place production-ready assets in the verified runtime asset structure under `game/`.
2. Keep source prompts, generation outputs, rejected variants, references, mockups, and review documentation under `resources/` following the project conventions.
3. Update the asset inventory with exact paths and status.
4. Connect each asset through the verified registry / world mapping.
5. Remove or disable only the procedural drawing code that the new asset actually replaces.
6. Preserve useful procedural effects and dynamic geometry.
7. Confirm no dead or duplicate asset references remain.
8. Confirm no runtime dependency points into `resources/`.
9. Confirm no remote URL is required.
10. Confirm image loading and fallback behaviour.
11. Confirm all world mappings are explicit and complete.
12. Update any required generated documentation / mirrors using the project’s established process.

Do not delete old art immediately if rollback or comparison is still needed. Follow the repository’s asset-retirement and review conventions. Do not leave unused experimental files in the production `game/` folder.

---

## 13. Phase 7 — Visual and gameplay QA

QA must be performed in the actual running game. Asset previews and code inspection alone are insufficient.

### 13.1 Viewport matrix

At minimum, validate the previously identified viewport set, if these remain relevant to the current project:

- 390 × 844
- 844 × 390
- 820 × 1180
- 1180 × 820

Also verify the project’s current supported device / viewport requirements. Do not assume these four sizes replace the official test matrix.

Pay special attention to short landscape layouts and HUD / safe-area overlap.

### 13.2 World coverage

Visit every world in the current world registry and inspect:

- Opening camera view
- Normal traversal
- A section with platforms
- A section with an enemy
- An entrance / spawn event
- Every hazard type used
- Collectible presentation
- Moving platform behaviour, where applicable
- Goal / finish sequence

If a world does not contain one of these elements, record it as not applicable rather than inventing a test case.

### 13.3 Visual QA checklist

- [ ] The world is visually coherent and belongs to the shared art direction.
- [ ] The world has a distinct identity.
- [ ] Background layers have correct depth and parallax.
- [ ] Backgrounds tile / scroll without visible seams where required.
- [ ] Ground top surfaces and sides align correctly.
- [ ] Terrain transitions and corners do not expose gaps.
- [ ] Platforms are clearly walkable.
- [ ] Moving platforms remain readable in motion.
- [ ] Enemies are recognizable at actual gameplay size.
- [ ] Enemy animations do not jitter, crop, or change scale unexpectedly.
- [ ] Entrances clearly communicate enemy emergence.
- [ ] Hazards are obvious and not confused with decoration.
- [ ] Goal locations are visible and rewarding.
- [ ] Player characters remain readable against all backgrounds.
- [ ] HUD and controls remain legible and unobstructed.
- [ ] No artwork creates a misleading collision impression.
- [ ] No missing images or broken asset paths.
- [ ] No unwanted halos, seams, edge artefacts, or transparency fringes.
- [ ] No visual flicker or inconsistent layering.
- [ ] No accidental asset stretching or distortion.

### 13.4 Gameplay regression checklist

- [ ] Player movement feels unchanged.
- [ ] Jump behaviour feels unchanged.
- [ ] Collision boundaries are unchanged.
- [ ] Enemy behaviour and damage rules are unchanged.
- [ ] Enemy spawn timing and locations are unchanged.
- [ ] Platforms retain their previous movement and collision.
- [ ] Hazards retain their previous collision and effects.
- [ ] Collectibles retain their previous behaviour and value.
- [ ] Camera and scrolling remain correct.
- [ ] Level progression and world order remain unchanged.
- [ ] Goal trigger and completion flow still work.
- [ ] Touch controls remain correct.
- [ ] Pause / resume / navigation lifecycle remains correct.
- [ ] No audio regressions.
- [ ] Offline operation remains intact.

### 13.5 Performance and reliability

Target the project’s established performance goals, including modest Android tablets.

Check:

- Frame rate during normal play and busy scenes
- Image memory footprint
- Initial asset load time
- World transition load behaviour
- Garbage collection / repeated allocations
- Canvas draw cost
- Large image decoding cost
- Behaviour when an image fails to load
- Long play sessions and repeated world changes

Do not claim 60 FPS or device performance unless measured on the relevant runtime / device. Record the actual environment and method used.

### 13.6 Screenshots and evidence

Use the project’s established screenshot workflow. Capture comparable states before and after redesign.

Update the screenshot table of contents only after the screenshots are actually created and verified. Do not claim that a visual QA pass occurred based only on code review.

---

## 14. Definition of Done

The redesign is complete only when all applicable criteria below are met.

### Art direction
- [ ] Environment-art addendum is reviewed and consistent with the master style bible.
- [ ] Every current world has an approved palette and visual brief.
- [ ] The overall rendering language is consistent.
- [ ] Each world retains a distinct identity.

### Assets
- [ ] Every required visual element has an inventory entry or a documented reason to remain procedural / reused.
- [ ] Every generated asset passed the mandatory preflight.
- [ ] Every generated result was actually inspected.
- [ ] Approval status is explicit and evidence-based.
- [ ] All production assets have verified paths and correct export settings.
- [ ] No unnecessary duplicates or untracked variants remain.

### Integration
- [ ] All required assets are integrated in the runtime game.
- [ ] Asset mapping is complete for every world.
- [ ] No runtime asset depends on `resources/` or the internet.
- [ ] Missing-asset behaviour is safe and diagnosable.
- [ ] Old procedural rendering is removed only where genuinely replaced.
- [ ] The player character sprite sets remain unchanged.

### Visual quality
- [ ] All worlds pass the visual QA checklist.
- [ ] Platforms, hazards, enemies, entrances, and goals are readable.
- [ ] Backgrounds and terrain are seamless where required.
- [ ] The game feels like one cohesive, premium storybook adventure.

### Gameplay and technical quality
- [ ] No unintended gameplay changes.
- [ ] Required viewport and orientation checks completed.
- [ ] Offline operation verified.
- [ ] Performance checked in the actual target environment.
- [ ] Relevant automated checks / builds / linters run and results recorded.
- [ ] Manual playtesting completed where available; if unavailable, clearly marked as outstanding.

### Documentation and repository
- [ ] Asset inventory and progress records reflect actual status.
- [ ] Screenshots and table of contents updated where required.
- [ ] Documentation mirrors / generated files updated using project workflow.
- [ ] Changes are committed and verified in the intended branch / PR.
- [ ] Final report distinguishes implementation, review, approval, and testing.

---

## 15. Recommended execution order and task breakdown

Use the project’s current task / branch / PR workflow. Create or update task tracking only after checking the current task index and active-task list. Do not assume a task number.

| Stage | Work package | Main output | Exit gate |
|---|---|---|---|
| 0 | Repository and visual audit | Verified baseline, world roster, asset map, screenshot audit | Source and asset landscape understood |
| 1 | Environment art direction | Style addendum, palettes, technical contract | Art direction approved |
| 2 | Renderer integration design | Asset registry / loading design, gameplay mapping | Safe integration approach confirmed |
| 3 | Spring pilot | One complete redesigned world | Actual in-game pilot reviewed and approved |
| 4A | Summer | Complete Summer environment | World QA passed |
| 4B | Autumn, Winter, North Pole | Three complete worlds | World QA passed |
| 4C | Underground, Cave | Two complete worlds | World QA passed |
| 4D | Underwater | Complete underwater world | World QA passed |
| 4E | Savanna, Egypt | Two complete worlds | World QA passed |
| 4F | Japan | Complete Japan world | World QA passed |
| 5 | Cross-world enemy / hazard / entrance / goal review | Consistent reusable families and world-specific variants | All element categories reviewed |
| 6 | Integration cleanup | Runtime assets, mappings, docs, retired code | Clean deployable build |
| 7 | Full QA and handover | Screenshot set, test evidence, final report | Definition of Done satisfied |

The work packages can be split into smaller repository tasks if required by project limits. Do not make a single oversized change that is difficult to review or roll back.

---

## 16. Implementation AI working rules

The implementation AI must follow this contract throughout the task.

### Before each work package
1. Read the relevant current repository instructions.
2. Confirm the active branch and task context.
3. Identify exact files and functions involved.
4. Check dependencies and existing approved work.
5. State the proposed scope and expected files.
6. Respect required approval gates.

### During implementation
1. Make the smallest coherent change.
2. Preserve unrelated behaviour.
3. Keep runtime assets in `game/` and development materials in `resources/`.
4. Use the project’s existing image-generation pipeline.
5. Run the mandatory preflight before each generation attempt.
6. Inspect every generated result.
7. Keep inventory and progress statuses factual.
8. Do not silently change gameplay to make the art easier to implement.
9. Do not replace the Explorer or Kitty player sprites in this phase.
10. Avoid broad refactors unless they are necessary and separately justified.

### Before declaring a work package complete
1. Inspect the final diff.
2. Verify changed paths and asset references.
3. Run the relevant tests / checks that are available.
4. Test the game in the actual runtime when available.
5. Capture and inspect screenshots for visual work.
6. Record checks that were not possible.
7. Update documentation only to match verified work.
8. Report what remains blocked or unverified.

### Final completion report format

```text
Work package:
Status: Proposed / In progress / Completed locally / Committed / Verified / Tested / Approved

Changed:
- Exact files and assets changed

Asset process:
- Inventory entries checked
- Preflight evidence
- Generated assets and exact paths
- Inspection outcome
- Approval status

Implementation:
- Renderer / registry / world mappings changed
- Gameplay systems intentionally left unchanged

Verification:
- Tests / builds / linters actually run
- Manual runtime checks actually performed
- Viewports / worlds inspected
- Screenshot evidence

Repository:
- Branch
- Commit / PR, if confirmed
- CI status, if checked

Remaining:
- Known issues
- Unverified items
- Blockers
- Required approvals
```

---

## 17. Explicit non-goals

Unless separately requested and approved, do not:

- Redesign the Explorer girl or Kitty player sprites
- Change the game’s story, world count, world order, or level layouts
- Add new gameplay mechanics, enemies, collectibles, or hazards
- Change physics, collision, enemy AI, or controls
- Redesign the global application UI or HUD
- Introduce new libraries or frameworks
- Add online dependencies or remote assets
- Add analytics, tracking, ads, accounts, cloud profiles, or monetization
- Replace every procedural effect with a bitmap
- Create one giant full-level background image as a substitute for modular world assets
- Generate assets before completing the mandatory preflight
- Treat a proposed asset or generated image as approved without evidence

---

## 18. Final instruction

Approach this as a complete art-direction and production project, not a quick reskin.

**Audit first. Define the visual system. Validate the pipeline with one complete world. Then expand methodically across the remaining worlds. Integrate only reviewed and approved assets. Preserve gameplay. Test the real game. Report only what the evidence proves.**

The desired outcome is a distinctive, consistent, cozy storybook adventure in which every world feels lovingly crafted, every gameplay element is immediately understandable, and the existing Explorer and Kitty characters feel naturally at home.
