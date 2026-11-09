# Little Explorer — Asset Review to Runtime Implementation Guide

**Document type:** Implementation handoff / execution plan  
**Project:** Games-for-kids — Little Explorer (also referred to in source documents as Little Play / Petrin svet)  
**Status:** Instructions for the local implementation AI; not evidence that any step below has been completed  
**Starting point:** The first-pass `Little_Explorer_Asset_Review_Package` is present under `resources/General_reviews/Little_explorer_assets/`, alongside the two source atlas PNGs, as described in the package README.  
**Primary rule:** Do not move an asset into the runtime game, mark it approved, or change gameplay merely because it appears in an atlas or extraction package.

---

## 1. Mission and definition of done

Take the extracted candidate artwork through a traceable pipeline:

1. Verify the local repository and source package.
2. Audit the current game implementation and existing reusable assets.
3. Review every extracted candidate against its source atlas.
4. Correct the extraction: split merged objects, recombine fragmented objects, recrop, clean edges, or reject unusable candidates.
5. Identify each asset semantically and map it to an actual game use.
6. Obtain explicit artistic approval for the final candidate artwork.
7. Prepare and validate runtime exports against the current technical contract.
8. Integrate the approved assets through the existing rendering/asset architecture.
9. Verify that all 11 worlds still behave exactly as before.
10. Update documentation and provide evidence of what changed, what was tested, and what remains.

**Done means:** only the approved and technically valid assets are integrated; the game works offline; the visual result is checked in actual gameplay at relevant sizes; protected mechanics remain unchanged; automated checks and manual QA are recorded; documentation accurately reflects the resulting repository state.

A completed extraction, a visually approved image, a technically valid file, and an integrated runtime asset are four different states. Never collapse them into one status.

---

## 2. Start by verifying the local clone

Before editing anything:

- Confirm repository root, active branch, working-tree status, and current commit.
- Confirm that the clone is the intended `radmanmilos/Games-for-kids` repository.
- Confirm that the source atlas files and review package exist at the expected paths.
- Check whether the local clone already contains newer work than the remote state previously inspected. The local clone is authoritative for the implementation session; do not overwrite local work.
- Check for uncommitted user changes and preserve them.
- Read the current versions of all relevant project documents rather than relying on this handoff alone.

Useful commands (adapt to the shell/OS):

```bash
git rev-parse --show-toplevel
git branch --show-current
git status --short --branch
git log -1 --oneline --decorate
```

Expected source/review locations, assuming the package was placed as instructed:

```text
resources/
└── General_reviews/
    ├── Little_explorer_assets/
    │   ├── Watercolor Platformer Game Asset Atlas-1.png
    │   ├── Watercolor Platformer Asset Atlas-2 (1).png
    │   └── Little_Explorer_Asset_Review_Package/
    │       ├── 00_SOURCE_ATLASES/
    │       ├── 01_TERRAIN_TILES/
    │       ├── 02_PLATFORMS/
    │       ├── 03_PIPES_AND_ENTRANCES/
    │       ├── 04_ENEMIES_AND_WALKERS/
    │       ├── 05_COLLECTIBLES_AND_ITEMS/
    │       ├── 06_GOALS_AND_STRUCTURES/
    │       ├── 07_DECORATIONS_AND_NATURE/
    │       ├── 08_HAZARDS_AND_EFFECTS/
    │       ├── 09_BACKGROUND_SCENES/
    │       └── REVIEW/
    │           ├── TABLE_OF_CONTENT.md
    │           ├── TABLE_OF_CONTENT.csv
    │           └── *_review_sheet.jpg
    └── Asset_Generation/
        ├── STYLE_BIBLE.md
        ├── ASSET_INVENTORY.md
        ├── PROGRESS.md
        ├── EXPLORER_STYLE_ADDENDUM.md
        ├── EXPLORER_TECHNICAL_CONTRACT.md
        ├── EXPLORER_ASSET_MAP.md
        ├── EXPLORER_PALETTES.md
        └── EXPLORER_MAPPING.md
```

The exact source package tree must be checked locally. The tree above is the intended layout, not a claim that every listed path has been verified in the current clone.

### 2.1 Read these documents before implementation

Read the latest local versions, including their status fields and any more recent decisions:

- `resources/General_reviews/Asset_Generation/STYLE_BIBLE.md`
- `resources/General_reviews/Asset_Generation/ASSET_INVENTORY.md`
- `resources/General_reviews/Asset_Generation/PROGRESS.md`
- `resources/General_reviews/Asset_Generation/EXPLORER_STYLE_ADDENDUM.md`
- `resources/General_reviews/Asset_Generation/EXPLORER_TECHNICAL_CONTRACT.md`
- `resources/General_reviews/Asset_Generation/EXPLORER_ASSET_MAP.md`
- `resources/General_reviews/Asset_Generation/EXPLORER_PALETTES.md`
- `resources/General_reviews/Asset_Generation/EXPLORER_MAPPING.md`
- `project/STATUS.md`
- relevant decision records, especially the asset pipeline decision/task 360 and any later superseding decision
- the review package `README.md`, `EXTRACTION_LOG.md`, and `REVIEW/TABLE_OF_CONTENT.md`

**Resolve document conflicts explicitly.** Some checked-in Explorer documents have historically described Gate 1 as pending, while prior project discussion recorded acceptance of the art direction, palettes, and technical direction. Do not silently choose one record. Check the latest local decision/approval evidence and update the authoritative status document only when the evidence is clear. If approval status is still ambiguous, continue non-destructive inspection and review preparation, but do not treat the unresolved gate as permission for a large-scale new generation or a change to the technical contract.

---

## 3. Understand the review package before using it

The package is a **first-pass extraction**, not a clean production library.

### 3.1 What the package contains

The package README and extraction log report:

- Two original source atlases, preserved unchanged in `00_SOURCE_ATLASES/`.
- 105 connected-component crops extracted from the transparent atlas.
- 11 approximate background-thumbnail crops from the opaque overview atlas.
- 116 candidate PNG crops total across the family folders.
- Nine family review sheets and an editable CSV/Markdown table of contents.
- No pixel-level manual segmentation, edge decontamination, repainting, resampling, sprite packing, runtime conversion, code changes, or gameplay testing.

Family candidate counts in the current package table of contents:

| Family | Folder | First-pass candidates |
|---|---|---:|
| Terrain tiles | `01_TERRAIN_TILES/` | 21 |
| Platforms | `02_PLATFORMS/` | 11 |
| Pipes and entrances | `03_PIPES_AND_ENTRANCES/` | 8 |
| Enemies and walkers | `04_ENEMIES_AND_WALKERS/` | 17 |
| Collectibles and items | `05_COLLECTIBLES_AND_ITEMS/` | 15 |
| Goals and structures | `06_GOALS_AND_STRUCTURES/` | 5 |
| Decorations and nature | `07_DECORATIONS_AND_NATURE/` | 16 |
| Hazards and effects | `08_HAZARDS_AND_EFFECTS/` | 12 |
| Background scene references | `09_BACKGROUND_SCENES/` | 11 |
| **Total** | | **116** |

The counts are crop counts, not a verified count of distinct game-ready assets.

### 3.2 Known extraction limitations

Treat all candidates as untrusted until visually checked:

- Connected-component extraction used an alpha threshold and area threshold. Soft alpha fringes can connect neighbouring objects into one crop.
- One object can also be split into multiple connected components.
- A crop can contain partial artwork, unwanted fragments, a label, a neighbouring object, or a large merged region.
- The goal-structure family is incomplete in the first pass.
- Background candidates are approximate crops from an opaque overview sheet, include margins, and are reference material only. They are not production backgrounds.
- No colour-key removal was performed on the opaque atlas.
- Candidate filenames are numbered because semantic identity was not reliably assigned during extraction.
- The package table of contents has a duplicated background review-sheet bullet; this is a documentation typo, not an extra sheet.

Do not assume a crop is correct because it has a numbered PNG and appears in a review sheet.

### 3.3 Keep source material immutable

- Never edit or overwrite either original atlas.
- Keep a source-to-candidate trace for every retained asset: source filename, source bounding box (where applicable), original candidate ID, and any later derivative filename.
- If a candidate is replaced, retain the old candidate or record its disposition in the extraction log; do not silently erase provenance.
- Use versioned or clearly named review outputs when a new extraction pass changes the crop.

---

## 4. Audit the current game before deciding what to replace

The current source-backed Explorer map identifies the main runtime module as:

```text
game/games/kitty-standalone.js
```

The exact local file layout and current call sites must be re-verified before editing. Inspect the current `WORLDS` registry, render functions, asset loader, asset registry, and all call sites.

Inspect at minimum:

- `WORLDS` and all 11 world definitions.
- `loadWorld()` and scene selection/loading.
- `draw()` and the render order.
- `drawEnemy()`, `drawWalker()`, `drawGoal()`, and pit-hazard rendering.
- terrain/static platform rendering and moving-platform rendering.
- pipe/spawn rendering and enemy pop-out logic.
- collectible drawing and the existing `Art.draw()` path.
- `drawDecor()` and `drawCeiling()`.
- `game/assets/art/` and its `window.Art`/`ART_REGISTRY` implementation.
- `game/assets/scenes/` and the current scene assets.
- `tools/asset_cutout.js`, `tools/check_art.js`, `tools/asset_qa.js`, and any related tools if they exist in the current branch.
- package scripts/build/test instructions and any asset manifest/service-worker/offline precache list.

Do not assume tool names, flags, or scripts still match an older document. Open the actual scripts and use their current interfaces.

### 4.1 Existing assets that should be reused, not regenerated

The existing asset map reports that these Explorer art assets are already reused in the game:

- mouse
- bat
- penguin
- snowman
- crab
- Spring house

The existing collectible registry art is already integrated. The water hazard uses an existing fish accent. Verify each of these against the current local source and registry before acting.

Do not replace an existing approved asset with a visually similar atlas crop unless there is a clear, reviewed reason and explicit approval.

### 4.2 Existing background scenes

The project asset map reports that all 11 world background image files already exist under the runtime scene directory, one horizontally tiled layer per world. These are not a multi-layer parallax system.

Therefore:

- Do not copy the 11 overview-sheet background thumbnails into runtime.
- Do not replace the existing 11 world scenes as part of this asset integration by default.
- Compare existing runtime scene files against the source atlases only as a review/reference exercise.
- A scene redesign is a separate scoped task requiring explicit approval and its own technical brief.
- Preserve current scene selection and procedural fallback.
- The Water scene has a known gameplay-state QA concern: the dark seabed/seaweed band near the lower area may compete with the gameplay plane. Verify it in the actual game before proposing any change.

### 4.3 Assets/categories intentionally kept procedural

The current asset map says simple effects, small particles, repeated low-detail elements, decor, and ceiling details remain procedural. In particular, preserve:

- `drawDecor()` effects such as snow, leaves, petals, bubbles.
- `drawCeiling()` rock ceiling.
- particle system and coin glow/bob/sparkle.
- simple dynamic geometry and performance-sensitive details.

Do not extract every visible decorative element merely because it appears in the atlas. A raster asset is only useful if it improves the real runtime result and has an actual consumer.

---

## 5. The protected scope: what must not change

This work is an art-asset integration, not a gameplay redesign.

Unless the project owner gives separate explicit approval, do not change:

- Explorer/Kitty player sprites, frame artwork, frame timing, animation state machine, or runtime mirroring.
- Player physics, hitboxes, collision geometry, movement, jump, or controls.
- Enemy AI, enemy speed, spawn logic, spawn timing, or collision boxes.
- Walker movement, patrol logic, bob/pop-out timing, or collision data.
- Static or moving platform positions, dimensions, motion, or collision.
- Camera behaviour, world dimensions, level layout, world order, world count, or progression.
- Collectible values, placement, collection logic, bobbing, glow, or sparkle behaviour.
- Goal trigger coordinates, win conditions, finish animation, or level transitions.
- Pit hazard collision boundaries or damage/death behaviour.
- Audio, music, mute state, or sound effects.
- Touch controls, HUD, menus, modals, or child-facing text.
- Offline-first behaviour or local-only asset loading.

Do not adjust geometry to fit an image. Artwork must fit the existing gameplay geometry. Collision must continue to use explicit game rectangles/data, never alpha bounds from a PNG/WebP.

---

## 6. Phase A — Review and repair the extracted candidates

Work one family at a time. Do not begin with mass integration.

### 6.1 Recommended review order

1. Terrain tiles.
2. Platforms.
3. Pipes and entrances.
4. Enemies and walkers.
5. Goals and structures.
6. Hazards and effects.
7. Decorations and nature.
8. Collectibles and items (primarily check whether the atlas contains useful missing variants; existing registry art takes precedence).
9. Background references (audit only; no runtime replacement by default).

This order prioritizes the foundational world geometry and the families most directly related to the procedural rendering that remains.

### 6.2 For each candidate

For every numbered PNG:

1. Open the family review sheet to locate the candidate quickly.
2. Open the candidate at native resolution.
3. Open the original atlas at full resolution and compare the crop with its source region.
4. Verify that the crop contains the intended complete object and no neighbouring art.
5. Check for clipping, detached fragments, labels, stray pixels, transparent fringe, opaque matte, and alpha contamination.
6. Decide whether it is one asset, several merged assets, one fragment of a larger asset, a duplicate, or unusable.
7. Identify the semantic object only when the source image supports that identification.
8. Compare style, colour, apparent scale, detail density, and silhouette with the style references and current in-game art.
9. Check whether the game actually needs this asset and identify its exact runtime consumer.
10. Update the CSV and Markdown tracker with the decision and a reason.

Do not use a candidate number as the final asset identity.

### 6.3 Permitted review outcomes

Use these states consistently:

- `EXTRACTED — NEEDS REVIEW`: untouched automated crop; not individually assessed.
- `NEEDS WORK`: asset is potentially useful but requires recrop, split/merge, alpha cleanup, edge repair, or new source artwork.
- `REJECTED`: wrong subject, unusable source, duplicate with no reason to retain, or style/quality failure. Record why.
- `READY FOR REVIEW`: corrected individual candidate with provenance, semantic name, and review preview. Still not approved.
- `APPROVED`: project owner explicitly approved this exact candidate/version.
- `READY FOR IMPLEMENTATION`: exact approved file has passed all technical checks and has a verified runtime mapping.
- `INTEGRATED`: verified in the runtime source and visible/working in the game.
- `BLOCKED`: cannot proceed due to missing source, unclear requirement, unresolved approval, or technical limitation.

Record artistic approval separately from implementation status. A technically valid asset can still be unapproved; an approved image can still fail technical QA.

### 6.4 Correct extraction and naming

Once the object is understood:

- Split merged objects into separate images when they have independent runtime use.
- Recombine fragments only when they clearly belong to the same object.
- Crop with balanced transparent padding; do not crop tightly enough to clip soft painted edges.
- Preserve the original proportions. Never stretch or squash.
- Remove unwanted background only where needed for the intended runtime role.
- Do not use a simple white-to-alpha colour key on watercolor art without inspecting edge damage; it can erase pale parts of the subject and leave halos.
- Inspect alpha at 100% over both light and dark checkerboard backgrounds.
- Keep an untouched source candidate and log each processed derivative.
- Record the crop/cleanup method and any manual edits.

Use semantic names based on stable asset IDs, not appearance-only guesses. The technical convention is:

- Inventory ID includes category prefix, e.g. `enemy-mouse`, `goal-house`, `terrain-spring-top`.
- Runtime filename drops the category prefix, e.g. `mouse.webp`, `house.webp`, `spring-top.webp`.
- Keep the existing registry naming convention and avoid collisions with existing files.

Before renaming, search the repository for existing files, IDs, stems, aliases, registry entries, and use sites.

---

## 7. Phase B — Build a complete asset-to-game mapping

The mapping is a mandatory gate between art review and implementation.

For every retained candidate, record:

| Field | Required meaning |
|---|---|
| Stable asset ID | Unique, permanent identifier, normally category-prefixed |
| Semantic name | What the image depicts |
| Family | Terrain, platform, pipe, enemy, walker, goal, hazard, collectible, etc. |
| Source atlas | Exact original atlas filename |
| Source candidate | Original numbered crop filename |
| Source coordinates | Bounding box from the extraction CSV, if applicable |
| Final candidate path | Corrected review candidate |
| World(s) | One or more of the 11 world IDs |
| Runtime consumer | Exact function/registry/call site that will draw it |
| Current visual | Existing procedural/emoji/asset representation |
| Proposed asset | Exact replacement image |
| Display size | Existing call-site size or geometry; do not invent |
| Anchor | Centre/feet/base/top/other anchor required by the existing renderer |
| Direction/state | Whether current engine flips or animates the asset |
| Alpha/background | Required transparency or opaque scene status |
| Artistic status | Current review/approval state |
| Technical status | QA state |
| Integration status | Not started/in progress/integrated/verified |
| Notes | Exceptions, known limitations, approval evidence |

Do not mark an asset as needed until its runtime use is confirmed. Do not create a mapping row for an object that has no consumer unless the project owner has approved a scenery/scene use.

### 7.1 Known world roster and semantic mapping

Use the current local `EXPLORER_ASSET_MAP.md` and `WORLDS` registry as the source of truth. The existing map describes 11 worlds:

| World ID | World | Pipe enemy | Ground walker | Goal | Collectible |
|---|---|---|---|---|---|
| `spring` | Spring | mouse | ladybug | house | strawberry |
| `summer` | Summer | mouse | bee | house | watermelon |
| `autumn` | Autumn | mouse | hedgehog | house | apple |
| `winter` | Winter | mouse | snowman | house | carrot |
| `underground` | Underground | mole | worm | mine | mushroom |
| `cave` | Cave | bat | spider | cave | grapes |
| `water` | Water | piranha | crab | submarine | shell |
| `savanna` | Savanna | snake | meerkat | hut | banana |
| `japan` | Japan | oni | panda | torii | rice ball |
| `northpole` | North Pole | penguin | seal | igloo | gift |
| `egypt` | Egypt | scorpion | scarab | pyramid | palm |

This table is a planning index. Check the actual current world registry and asset map before changing any source.

The map also records an unused `arch` goal mapping for Water. Do not assume it is a live consumer.

### 7.2 Current known art gaps to verify

The existing asset map reported the following at its last documented verification; re-check locally:

- Reused enemy/character art: mouse, bat, penguin.
- Reused walker art: snowman, crab.
- Reused goal: Spring house.
- Other pipe enemies still procedural: mole, piranha, snake, oni, scorpion.
- Other walkers still procedural: ladybug, bee, hedgehog, worm, spider, meerkat, panda, seal, scarab.
- Other goals still procedural: seasonal house variants, mine, cave, submarine, hut, torii, igloo, pyramid.
- Terrain and pipes remain procedural.
- Moving/static platform art remains outstanding or procedural.
- Collectible art already exists through the registry; do not replace without a specific verified gap.

The atlas package may contain new candidates for some of these needs, but it does not prove completeness. Compare the candidates with this gap list and the actual runtime.

---

## 8. Phase C — Asset-family-specific requirements

Apply these checks before requesting approval and again before implementation.

### 8.1 Terrain tiles

Terrain is functional geometry, not merely decoration.

- Separate the playable top surface from side and underside artwork where the renderer needs them.
- Confirm edge thickness and contact with the existing collision surface.
- Identify modular pieces needed by actual world layouts: left, centre, right, inner corner, outer corner, end cap, and any top/side variants required by the code.
- Confirm that tile edges meet without visible seams or sudden changes in grass/stone/snow thickness.
- Test repeated patterns for obvious repetition.
- Keep the image aligned with the existing platform/ground geometry; do not alter collision dimensions.
- Check all relevant world materials and palette mapping.
- If the atlas does not contain all required variants, record the gap. Do not invent missing tiles from a partial crop and claim the family is complete.

### 8.2 Platforms

- Keep platforms visually distinct from background scenery and terrain.
- Ensure top surface and side material are consistent.
- Confirm modular length variants match the existing platform geometry.
- Moving-platform art must remain legible while moving and must not visually wobble because of mismatched dimensions.
- Preserve existing platform movement, dimensions, positions, and collision.
- Test both static and moving platform call sites.

### 8.3 Pipes and entrances

- Preserve the exact emergence/opening point and current collision shape.
- The artwork must not imply an opening that differs from the actual spawn geometry.
- Keep enemy visibility clear during pop-out; do not cover the emerging enemy with a decorative lip or foreground detail.
- Use world-appropriate materials/palettes, but keep the functional silhouette consistent.
- Preserve current pipe position, dimensions, spawn timing, and enemy movement.

### 8.4 Enemies and walkers

- Keep friendly, calm, recognisable silhouettes consistent with the approved storybook style.
- Confirm the actual facing convention. Existing map says enemies face right and caller flips using `ctx.scale(dir, 1)`; do not add duplicate left/right artwork unless the current engine requires it.
- Walkers should remain within the documented ≤48 px display-size gate unless the current source/contract has been deliberately revised.
- Preserve the existing caller's direction flip, foot position, animation timing, patrol bounds, and collision body.
- Avoid appendages or shadows that make the visual footprint appear to differ substantially from the hitbox.
- Check every creature at its actual in-game size, not just at source resolution.
- Reuse existing approved mouse, bat, penguin, snowman, and crab assets where appropriate.

### 8.5 Collectibles and items

- Existing collectible art is already integrated through the asset registry; audit before adding anything.
- The existing coin/collectible bob, glow, and sparkle behaviours must remain unchanged.
- The technical contract uses a coin display size around 36 px; test at the actual current call-site size.
- The atlas contains visually appealing item candidates, but do not replace existing approved registry art simply to make the library uniform.
- Check meaning: the world collectible should remain recognisable and appropriate to its world.
- A collectible's artwork must not change collection radius, value, timing, or placement.

### 8.6 Goals and structures

- Goal art should make each destination recognisable and rewarding.
- Keep the goal trigger region and position unchanged.
- Ensure the image does not hide the trigger, overlap important UI, or create a false impression of a different platform/collision boundary.
- Check the finish animation and transition.
- The first-pass goal family is incomplete; use the asset map to identify missing structures and do not infer that five crops satisfy all world goals.
- Reuse the existing approved Spring house asset.

### 8.7 Hazards and effects

- Preserve the exact active collision region.
- Communicate danger through both shape and colour; colour alone is insufficient.
- Keep effects visually gentle and child-appropriate.
- Do not allow decorative flames, rocks, spikes, or particle effects to disguise the hazard's actual collision boundary.
- Preserve water/lava/spike gameplay logic and existing effect timing.
- Retain small particles and simple dynamic effects procedurally where the current design calls for it.

### 8.8 Decorations and nature

- Treat the family as optional environmental dressing, not a reason to change the world layout.
- Use only assets with a clear rendering need and low performance/memory cost.
- Keep repeated low-detail decor procedural where that is already the agreed direction.
- Ensure decoration does not obscure enemies, collectibles, pipes, platforms, hazards, goal triggers, or the player.
- Do not create a new parallax system as part of this task.

### 8.9 Background scenes

- The 11 extracted thumbnails are not production scene files.
- Existing scene files are already in use and should be preserved.
- Scene art, if separately approved for replacement, must be full-bleed, opaque, world-fit, and horizontally continuous for scrolling worlds.
- Sky/distant hills/clouds only; no baked ground line, platforms, hazards, enemies, or collectibles.
- Keep the lower gameplay plane visually quiet and maintain negative space.
- Current renderer has one tiled image layer per world, not multi-layer parallax. Do not add parallax layers without separate design and performance approval.
- Scene assets are exempt from the glyph alpha/512×512/60 KB gates; follow the scene-specific current requirements instead.

---

## 9. Phase D — Artistic review and explicit approval

Prepare one review batch per family, not a huge undifferentiated approval request.

Each review batch should contain:

1. A labelled contact sheet showing the proposed semantic name and stable asset ID.
2. Full-resolution individual PNGs.
3. A short Markdown review note describing the source crop, any edits, and remaining limitations.
4. A list of rejected/duplicate/incomplete candidates and reasons.
5. A mapping to the exact game consumer and world(s).
6. A clear request for approval of the exact version(s).

Review every asset at:
- native size;
- intended in-game size;
- light and dark background contexts where relevant;
- adjacent to existing approved style references and existing game art;
- in a representative gameplay screenshot where possible.

Use the style bible as the controlling style reference:

- softly painted watercolor/gouache storybook finish;
- warm, natural, gently muted palette;
- rounded, organic, recognisable silhouette;
- subtle paper/coloured-pencil texture;
- gentle shading and restrained contrast;
- soft edges without loss of readability;
- calm and friendly expressions for animals;
- no unnecessary face on ordinary objects;
- no glossy 3D, emoji/vector look, heavy black outlines, white sticker border, glow, excessive detail, or unrelated props.

**Approval protocol:**
- Approval applies to the exact candidate file/version shown.
- If the file is materially altered after approval (repaint, new crop changing the silhouette, recolour, subject change), request approval again.
- Record who approved it, when, which exact file/version, and any conditions.
- A general statement that an atlas looks good is not per-asset approval for every crop.
- Until approval is explicit, status remains `READY FOR REVIEW` or `NEEDS WORK`.

---

## 10. Phase E — Technical preparation and export

The current Explorer technical contract describes the following pipeline. Re-open the latest local contract and scripts before applying it; if a later decision supersedes it, document the change.

### 10.1 Runtime locations

| Asset type | Intended runtime location | Expected use |
|---|---|---|
| Glyph/cut-out art | `game/assets/art/` | Platforms, terrain tiles, pipes, enemies, walkers, hazards, collectibles, goals where a glyph cut-out is appropriate |
| Full-bleed scene art | `game/assets/scenes/` | Opaque world backgrounds |

The review candidates remain under `resources/`. Do not point runtime code at the review package.

### 10.2 Glyph export contract

The checked-in Explorer technical contract currently specifies:

- 512×512 canvas for glyph cut-outs.
- WebP lossy quality 85 with alpha quality 100.
- Real alpha required.
- Transparent corners.
- Clean edges; no white matte, coloured fringe, or semi-transparent haze.
- Hard maximum 60 KB per glyph file.
- Every runtime glyph must have a registry entry or an explicit documented scenery decision.
- Stable registry IDs/stems.
- Offline local paths only.

The current contract mentions validation by:

- `tools/asset_cutout.js`
- `tools/check_art.js`
- `tools/asset_qa.js`

Inspect their current implementation and CLI usage. Do not assume their exact flags. Use the existing approved pipeline rather than writing a competing converter unless the current scripts demonstrably cannot meet a requirement.

### 10.3 Scenes

Scene files are opaque and world-fit. They do not follow the glyph 512×512/alpha/60 KB gates. Follow the current scene pipeline and preserve the current one-layer tiled implementation unless a separate approved task changes it.

### 10.4 Technical QA for each glyph

Record at least:

- source candidate and provenance;
- final filename and stable asset ID;
- actual pixel dimensions;
- file format and decoded image type;
- alpha channel presence and corner alpha values;
- whether all intended transparent regions are truly transparent;
- edge fringe/halo inspection;
- file size in bytes;
- whether it meets the 60 KB hard limit;
- visual legibility at actual draw size;
- palette/style comparison against approved references;
- runtime consumer/registry entry;
- whether the offline asset manifest includes it;
- whether it loads from a local path.

A PNG extension is not proof of PNG encoding; a `.webp` extension is not proof of WebP encoding. Inspect actual file bytes/decoder output.

### 10.5 Naming

Use stable category-prefixed IDs in inventory and filenames without the category prefix where the current registry convention requires that. Examples from the contract:

- `object-water-drop` → `water-drop.webp`
- `enemy-mouse` → `mouse.webp`
- `goal-house` → `house.webp`
- `terrain-spring-top` → `spring-top.webp`

Examples illustrate the convention only. Search the current repo and registry before creating or renaming any file.

### 10.6 Display size, anchor and geometry

- Use the existing call-site display size and anchor.
- The technical contract says glyphs are drawn centred through `Art.draw(ctx, glyph, cx, cy, size)` at current sizes.
- Existing examples include coins around 36 px, enemies around 20–40 px, walkers up to 48 px, and goal emblems around 26–30 px. Re-check actual local call sites; do not hard-code these approximate examples where source differs.
- Preserve foot-flush alignment for characters and current centre/base anchors for other objects.
- Never derive collision or hitboxes from image dimensions or alpha bounds.

---

## 11. Phase F — Runtime registry and renderer integration

Implement only after an exact asset has reached `READY FOR IMPLEMENTATION`.

### 11.1 Preferred integration pattern

Follow the current `window.Art` / `ART_REGISTRY` architecture and the existing data-driven mapping approach:

- Map stable glyph IDs/stems to local asset paths.
- Map world/entity IDs to the appropriate asset IDs in data, not by scattering world-specific filename conditionals throughout draw code.
- Reuse the existing renderer and `Art.draw()` where suitable.
- Draw the optional image at the same gameplay position, dimensions, and anchor as the current procedural object.
- Retain procedural/emoji fallback while the image is loading or unavailable.
- Cache image objects; never construct a new `Image` on every animation frame.
- Load required assets before gameplay or use a loading state that prevents invisible gameplay.
- Missing assets must never crash the game loop.
- Add a development warning for missing required art; do not silently hide a gameplay-critical object.
- Keep every path local and available offline.
- Do not load remote URLs or external CDNs.

### 11.2 Preserve render order

The existing asset map records this general draw sequence:

1. World scene image (or procedural sky/hills/clouds fallback).
2. Pit hazards.
3. Static platforms/terrain.
4. Moving platforms.
5. Pipes.
6. Pipe pop-out enemies.
7. Ground walkers.
8. Collectibles.
9. Goal.
10. Hero.
11. Particles.
12. Ceiling.
13. Decor.

Verify the exact current `draw()` order before modifying it. Keep the established depth relationships. Do not reorder layers just to make an asset look better; revise the asset crop or art treatment first.

### 11.3 Renderer integration rules

- Replace only the visual drawing of the intended object.
- Keep object state, positions, dimensions, collision, update logic, and timing untouched.
- Preserve `ctx.save()` / `ctx.restore()` balance and transform state.
- Preserve direction flipping and camera transforms.
- Avoid unnecessary canvas state changes and per-frame allocations.
- Do not draw a full 512×512 source at native size if the current object is meant to be 24–48 px; use the current size contract.
- Do not let transparent padding change the visual anchor. If padding changes optical centre, record and correct the draw offset without moving gameplay geometry.
- Keep procedural fallback until image load success is confirmed.
- Avoid drawing both the fallback and image simultaneously except for an intentional transition already in the design.
- Ensure fallback is not removed before the new asset is proven to load.

### 11.4 Avoid unnecessary architecture changes

Do not introduce a new asset framework, scene graph, animation system, sprite atlas packer, or parallax renderer if the current architecture can support the assets. Prefer a small, explicit change using existing abstractions.

---

## 12. Phase G — Integrate in controlled batches

Do not integrate all 116 crops at once. Use a small pilot and validate before expanding.

Recommended batch sequence:

### Batch 1 — One terrain material and one platform type

- Select only a small approved set with complete modular pieces.
- Confirm seams, edge thickness, top alignment, and display scale.
- Integrate into one representative world first, behind a feature/data mapping that can safely fall back.
- Check all ground/platform geometry and collisions remain unchanged.
- If the atlas does not supply a complete modular set, do not claim the family is complete; either retain procedural rendering or request/prepare missing variants.

### Batch 2 — Pipes and entrances

- Integrate one or two world variants.
- Verify enemy pop-out visibility and emergence position.
- Verify pipe visual silhouette does not imply a changed collision area.

### Batch 3 — Enemies and walkers

- Integrate one candidate at a time.
- Verify direction flips, foot anchor, actual small-size readability, and current animation behaviour.
- Do not replace the already reused approved assets unnecessarily.

### Batch 4 — Goals and structures

- Integrate one destination type at a time.
- Verify goal trigger and finish sequence.
- Confirm the full world-specific set is covered before declaring completion.

### Batch 5 — Hazards/effects and decorations

- Integrate only where the current design needs a static image and where procedural rendering is not preferable.
- Confirm hazard collision and active region remain clear.
- Leave particles, tiny repeated details, decor and ceiling procedural where specified.

### Batch 6 — Collectibles

- Audit existing registry assets first.
- Only replace/add assets for a documented gap and with explicit approval.
- Verify coin bob/glow/sparkle and world collectible mapping remain unchanged.

### Backgrounds

Do not include background replacement in the above batches by default. The 11 scene crops in the package are reference crops only; current runtime scenes already exist. Any scene replacement requires a separate review, approval, and scene-specific QA.

---

## 13. Phase H — Testing and visual QA

Testing must be reported precisely. A successful syntax check is not a gameplay test.

### 13.1 Static and asset checks

Run the current repository's relevant checks, as discovered from actual scripts/package configuration:

- image decode/read validation;
- alpha/corner/fringe validation;
- file-size and dimension validation;
- asset registry/consumer validation;
- offline manifest validation;
- JavaScript syntax/lint checks;
- unit/integration tests for asset loading or world mapping;
- build checks, if the project defines them.

Record exact commands and exit codes. If a script is not available, say so; do not invent a replacement result.

### 13.2 World coverage

Verify all 11 world IDs individually:

- `spring`
- `summer`
- `autumn`
- `winter`
- `underground`
- `cave`
- `water`
- `savanna`
- `japan`
- `northpole`
- `egypt`

For each world, check:
- correct scene still loads;
- correct terrain/platform material is selected;
- correct pipe art and enemy are mapped;
- correct walker art is mapped;
- correct collectible art is mapped;
- correct goal art is mapped;
- missing optional art falls back safely;
- no asset from an unrelated world is silently substituted.

### 13.3 Gameplay regression checklist

Test the actual PLAY state, not just a character picker or static menu screenshot.

- Start each world and allow all required images to load.
- Move and jump across static and moving platforms.
- Observe collision/contact at ground and platform edges.
- Trigger pipe enemy spawn and watch the full pop-out cycle.
- Observe each walker in both movement directions.
- Collect items and verify values, bob, glow and sparkle.
- Trigger the goal and verify finish animation/transition.
- Observe hazards and confirm collision/danger remains readable.
- Check camera scrolling and horizontal background continuity.
- Check foreground/background overlap and render order.
- Check no visual flicker, repeated image loading, missing-image frame, or memory growth during world switching.
- Check offline launch and play with network disabled.
- Check on a modest Android tablet or the closest available representative device for memory/performance.

### 13.4 Screenshot evidence

Capture consistent screenshots:
- at least one gameplay screenshot per world;
- representative terrain/platform edge and seam close-ups;
- moving-platform screenshot;
- pipe emergence screenshot;
- enemy/walker at real display size;
- collectible and goal states;
- hazard visibility;
- scene transition/scrolling.

Compare before/after with the same game state where practical. Screenshots must be actual runtime captures, not mockups or contact sheets presented as game evidence.

### 13.5 Protected-behaviour regression

Explicitly compare or test:
- world count/order/progression;
- player movement/jump/physics;
- collision geometry;
- enemy AI/spawn timing;
- walker behaviour;
- moving platform motion;
- collectible values and logic;
- goal trigger and win/lose behaviour;
- audio and controls;
- offline operation.

If a test cannot be performed, mark it `NOT RUN` and explain the limitation.

---

## 14. Documentation and tracking requirements

Keep the review package as the source/reference library under `resources/`. Keep runtime files in `game/` only.

Update these files as the work progresses, using the existing documents as sources of truth rather than creating competing standards:

### 14.1 `REVIEW/TABLE_OF_CONTENT.csv`

Maintain one row per candidate/asset, with at least:

- stable asset ID;
- family;
- semantic name;
- original candidate filename;
- final review filename/path;
- source atlas;
- source bounding box;
- status;
- artistic review note;
- approval evidence;
- technical QA status;
- runtime target path;
- registry ID/consumer;
- world mapping;
- implementation status;
- notes/blockers.

If columns are added, update the Markdown table-of-contents guide. Do not remove source provenance.

### 14.2 `REVIEW/TABLE_OF_CONTENT.md`

Update family totals and state definitions. Add links/relative paths to final review sheets. Clearly distinguish candidate count, approved count, technically ready count, and integrated count.

### 14.3 `EXTRACTION_LOG.md`

Append each extraction/cleanup pass:
- date;
- tool/script or manual method;
- inputs;
- thresholds/parameters if automated;
- number of files created/changed/rejected;
- known limitations;
- validation performed.

### 14.4 Asset inventory and progress

Update `ASSET_INVENTORY.md` and `PROGRESS.md` only when the relevant facts are verified. Keep the Little Explorer asset map current when a real runtime mapping changes. Do not use the broad cross-game inventory as a substitute for the Explorer mapping.

### 14.5 Status vocabulary

Use precise, consistent status labels. Recommended fields:

- `art_status`: candidate / needs-work / ready-for-review / approved / rejected
- `technical_status`: not-checked / blocked / passed / failed
- `implementation_status`: not-started / in-progress / integrated / verified
- `approval_evidence`: user decision/date/reference or `pending`

Do not use a single generic `done` status.

---

## 15. Git workflow and change management

- Work on a dedicated feature branch, not directly on `main`.
- Check the working tree before creating the branch.
- Do not discard, reset, or overwrite user changes.
- Keep commits logically grouped: review/extraction corrections, technical export, registry/render integration, tests/docs.
- Avoid a huge unreviewable commit containing all candidate crops and code changes.
- Do not commit raw candidates into `game/`.
- Do not commit generated outputs unless they are needed and the project owner has approved their inclusion.
- Keep `resources/` source and review artifacts separate from runtime assets.
- Before commit, inspect `git diff --check`, `git status`, and the full diff/stat.
- Run the relevant tests before committing.
- After commit, verify commit hash, branch, changed files, and clean/expected working tree.
- Do not merge or push to protected branches unless the project owner explicitly authorizes it and the repository workflow permits it.

Example workflow (adapt names and commands to the repository):

```bash
git switch -c feature/little-explorer-art-integration
# make one reviewed batch
git diff --check
git status --short
git diff --stat
# run actual project checks discovered from the repo
git add <explicit-reviewed-paths>
git commit -m "Add approved Little Explorer terrain art"
git show --stat --oneline HEAD
git status --short --branch
```

Do not blindly copy this example commit message or stage the whole repository. Use explicit paths and inspect the diff.

---

## 16. Required completion report from the implementation AI

At the end of each batch, report:

### Changed
- Exact files/assets/code changed.
- Whether changes are local, committed, pushed, or merged.

### Location
- Exact repository paths.
- Exact runtime asset paths and review/source paths.

### Mapping
- Stable asset IDs, worlds, and runtime consumers changed.

### Evidence
- Branch and commit hash where applicable.
- Diff/file listing or other evidence.
- Approval record for the exact asset versions.

### Checks
- Exact commands run and results.
- Worlds/devices manually checked.
- Screenshots or logs captured.
- Tests not run and why.

### Approval
- Which assets are user-approved.
- Which are still awaiting review.
- Any approval conditions.

### Remaining
- Missing asset variants.
- Known visual defects.
- Performance/offline/device issues.
- Unverified behaviour.
- Any blocked gate or unresolved decision.

Never say “implemented”, “tested”, “approved”, or “complete” without evidence appropriate to that exact claim.

---

## 17. Suggested execution checklist

Use this as the working sequence. Do not skip gates.

### Gate 0 — Repository and source verification
- [ ] Confirm repo root, branch, commit, working tree.
- [ ] Preserve uncommitted local work.
- [ ] Verify source atlases and package tree.
- [ ] Read all current Explorer asset documents and decisions.
- [ ] Resolve/document Gate 1 approval status discrepancy.
- [ ] Inspect current game source and actual asset tools.

### Gate 1 — Candidate review
- [ ] Review terrain candidates against source.
- [ ] Review platform candidates.
- [ ] Review pipe candidates.
- [ ] Review enemy/walker candidates.
- [ ] Review goal candidates.
- [ ] Review hazards/effects.
- [ ] Review decorations.
- [ ] Audit collectibles against existing art.
- [ ] Treat background thumbnails as references only.
- [ ] Correct merged/split/poor crops.
- [ ] Reject unusable/duplicate candidates with reasons.
- [ ] Assign semantic names and stable IDs.
- [ ] Update review sheet and table of contents.

### Gate 2 — Artistic approval
- [ ] Prepare one family review batch at a time.
- [ ] Compare to style bible and approved references.
- [ ] Check native and actual in-game size.
- [ ] Obtain explicit approval for exact candidate versions.
- [ ] Record approval evidence.
- [ ] Do not promote unapproved candidates.

### Gate 3 — Technical preparation
- [ ] Confirm exact runtime consumer and world mapping.
- [ ] Confirm dimensions, alpha, format, file size, edge quality.
- [ ] Export glyphs using the current approved pipeline.
- [ ] Validate 512×512, real alpha, WebP q85/alpha q100, ≤60 KB where the current contract applies.
- [ ] Confirm registry and offline manifest coverage.
- [ ] Mark only passing approved files `READY FOR IMPLEMENTATION`.

### Gate 4 — Pilot integration
- [ ] Integrate a small terrain/platform pilot.
- [ ] Preserve geometry and procedural fallback.
- [ ] Test seams, anchors, render order and small-size readability.
- [ ] Verify one representative world before expanding.
- [ ] Record screenshots and test results.

### Gate 5 — Family rollout
- [ ] Integrate pipes.
- [ ] Integrate missing enemies/walkers.
- [ ] Integrate missing goals.
- [ ] Integrate only justified hazards/decor.
- [ ] Audit collectibles; reuse existing assets where possible.
- [ ] Do not replace backgrounds without separate approval.

### Gate 6 — Regression and release readiness
- [ ] Run asset, syntax, build, and test checks that exist.
- [ ] Test all 11 worlds in actual gameplay.
- [ ] Verify protected mechanics and offline mode.
- [ ] Check memory/performance on representative hardware.
- [ ] Capture before/after evidence.
- [ ] Update all relevant inventories and progress docs.
- [ ] Review diff and commit in logical batches.
- [ ] Verify commit and final repository state.

---

## 18. Non-negotiable reminders

1. The 116 first-pass crops are not 116 approved or production-ready assets.
2. The opaque background thumbnails are references, not runtime scene replacements.
3. Existing approved art and collectible registry assets take precedence over redundant atlas crops.
4. Preserve the original atlases and provenance.
5. Keep review assets in `resources/`; only approved, validated runtime assets belong in `game/`.
6. Follow the current technical contract and inspect actual scripts before using them.
7. Keep all game assets local and offline-capable.
8. Keep fallback rendering until the replacement has been verified.
9. Do not change gameplay geometry or behaviour to accommodate artwork.
10. Do not treat an image's transparency, dimensions, file extension, or visual quality as proof of technical readiness.
11. Do not invent approvals, tests, file paths, commands, or implementation status.
12. Work in small, reviewable batches and report evidence after each one.

**The immediate next action is Gate 0, followed by a manual terrain-family review. Do not begin runtime integration directly from the numbered candidate crops.**
