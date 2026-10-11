# Petra's World — Emoticon Replacement Inventory

**Status:** Working inventory — review required before generation.  
**Scope:** Replace existing emoji/emoticon pictographs used as game artwork. Do not redesign games or replace proper illustrations, character sprites, 3D models, CSS/SVG controls, or ordinary text.

## Fixed reference images

- **Bear:** exact user-supplied seated honey-brown bear image.
- **Star:** exact user-supplied plain golden-yellow five-point star image.
- These are style references, not a license to replace them with a different bear/star. Store reference files under `resources/General_reviews/Asset_Generation/references/` when available.

## Scope constraints

- Explorer: preserve existing explorer character sprites/animation frames; inventory only emoticons used as other game objects/effects.
- Kitty: preserve existing Kitty character sprites/animation frames; inventory only emoticons used as other game objects/effects.
- 3D Racing: preserve 3D models, geometry, environment, lighting, and rendering. Replace only emoji glyphs used as visuals in HTML/UI or game feedback. Do not turn 3D game objects into flat image assets unless the code audit proves the current object itself is an emoji.
- All other games: include only emoji/pictographs actually used as game visuals, prompts, rewards, or decoration.
- Standard controls (back, arrows, sound, retry, etc.) should remain or become consistent SVG/CSS icons, not watercolor illustrations.
- Reuse one approved asset across games whenever the same object has the same meaning.
- Do not generate anything until the inventory rows are verified and approved.

## Verified findings from source inspection

### 3D Racing — `game/pages/racing3d.html`

The following emoji glyphs are visibly present in the HTML/UI source. Confirm whether each should become a cohesive illustrated asset or remain a standard icon/text symbol:

| ID | Current glyph/text | Current location/purpose | Proposed treatment | Status |
|---|---|---|---|---|
| r3d-title-car | 🏎️ | Page title | Small illustrated racing kart only if the title decoration is to remain; otherwise remove glyph and use text title | REVIEW |
| r3d-flower-counter | 🌸 | Flower/collectible counter | Small flower illustration/icon matching pickup identity | REVIEW |
| r3d-world-button | 🌍 | World-selection button | Small world/globe illustration or consistent SVG icon; likely UI icon, not watercolor asset | REVIEW |
| r3d-music-on | 🔊 | Music button state | Consistent SVG icon; do not generate | KEEP AS UI ICON |
| r3d-music-off | 🔇 | Music button state (set in script) | Consistent SVG icon; do not generate | KEEP AS UI ICON |
| r3d-win-flag | 🏁 | Win modal heading | Small finish flag illustration if decorative artwork is retained | REVIEW |
| r3d-next-world-arrow | ➡️ | Next-world button label | Keep text and use a consistent SVG arrow; do not generate | KEEP AS UI ICON |
| r3d-restart-arrow | 🔄 | Restart button label | Keep text and use a consistent SVG retry icon; do not generate | KEEP AS UI ICON |
| r3d-pick-world | 🌍 | Choose-world button label | Reuse world/globe icon from world button | REVIEW |
| r3d-start-world | 🌍 | Start modal heading | Reuse same world/globe icon, or remove if redundant | REVIEW |
| r3d-start-flag | 🏁 | Start-race button label | Reuse finish flag if retained | REVIEW |
| r3d-landscape-world | 🌍 | Landscape/orientation hint | Prefer text-only hint or reuse world/globe icon if it adds meaning | REVIEW |
| r3d-favicon-car | 🏎️ | Inline SVG favicon rendered as emoji text | Prefer a real project icon/SVG, not a generated watercolor asset | KEEP AS APP ICON TASK |

**Important distinction:** the 3D racing config defines 3D pickups and obstacles (flower, shell, snowflake, candy, gem, star, moon, carrot; puddle, rock, barricade) as world/game concepts. These are not automatically emoji replacements. The configuration uses 3D geometry/material settings. Preserve them unless inspection of the actual rendering module proves an emoji glyph is used for the same object.

## Remaining game inventory — source audit required

The game source files exist in the repository, but each visual emoji must be verified in its rendering context before being added as a confirmed row. The following are audit targets, not yet approved asset requests:

- Animal counting, animal memory, animal puzzle, animals
- Candy
- Classroom
- Coloring
- Compare
- Dino
- Driving
- Maze
- Ocean
- Phonics
- Piano
- Rhythm
- Sequencing
- Shapes
- Sorting
- Space
- Spatial
- Tracing
- Explorer (objects/effects only; preserve character)
- Kitty (objects/effects only; preserve character)
- Adventure modes and shared celebration/feedback components

## Inventory row requirements

Every confirmed row must include:
1. Stable ID
2. Exact game/component and source file
3. Current emoji glyph
4. Meaning/use in game
5. Whether interactive or decorative
6. Proposed asset ID (shared asset reuse where applicable)
7. Treatment: generated illustration / SVG-CSS icon / keep text / remove decoration
8. Status: AUDIT / REVIEW / APPROVED / GENERATED / QA / READY FOR IMPLEMENTATION
9. Notes and any implementation caveat

## Completion gate

This inventory is **not final for generation** until all target game sources and relevant shared modules have been scanned, duplicate glyphs consolidated, existing assets checked, and every proposed replacement reviewed by the user.
