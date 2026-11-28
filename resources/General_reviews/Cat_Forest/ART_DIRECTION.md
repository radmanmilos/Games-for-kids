# Cat Forest Village — Art Direction Guide (Phase 1)

Established from the four approved prototypes:
`village_house_concept.png`, `village_cat_prototype.png`,
`village_fish_basket_prototype.png`, `village_decoration_prototype.png`.

This is the working guide for every asset generated in Phases 2–8. It is a
summary of the plan §5 rules plus the concrete decisions locked by the
prototypes. It lives in `resources/` (never in `game/`).

## Palette (concrete, derived from the prototypes)

| Family | Usage | Notes |
|---|---|---|
| Warm honey wood `#C89B6A` / `#B98A55` | house walls, basket wicker, workshop wood | warm, not orange |
| Cream plaster `#F2E7D5` / `#EAD9BE` | house body, cloth lining, UI surfaces | warm linen, not white |
| Muted terracotta `#C97F5E` / `#B96F50` | roof, flower pot | desaturated clay |
| Sage / moss `#9FB08A` / `#7E9670` | foliage, leaves, ground | muted, never neon |
| Soft fern `#6E8B60` | middle foliage | |
| Deep pine / teal `#3E5A54` | distant forest, accents | |
| Warm grass green `#A9B56E` | ground plane | with muted yellow highlights |
| Dusty blue pond `#9FB8C4` / pale reflection `#D3E0E4` | pond water | |
| Dusty rose `#D9A0A0`, pale butter `#EFD9A0`, lavender `#B7A6CE` | flower accents | use sparingly |
| Amber window light `#F0C46C` | windows, lantern glow | |

Keep overall scenes soft; keep controls high-contrast (plan §5.6).

## Camera and composition (plan §5.3)

- Consistent 2D illustrated camera: gentle three-quarter / front-facing
  diorama view for the house and garden.
- One horizon + ground plane across village, pond, woodland, workshop.
- Layered backgrounds: distant forest → middle-ground trees/buildings →
  foreground grass/flowers.
- Interactive objects at a consistent apparent scale; leave negative space
  around touch targets; never let foreground foliage overlap a button or a
  cat's face.

## Shadow (plan §5.3)

- Soft contact shadow, one consistent direction (light from upper left in
  the prototypes), soft edge, low contrast.
- No hard drop shadows, no dark fringe, no white halo, no opaque outline
  around the whole object (style bible).

## Scale / readability

- Every asset must read at small tablet size; rounded silhouettes, gentle
  asymmetry, minimal clean detail.
- Subjects centered with comfortable padding; one subject per frame; no
  cropping of identifying parts (roof, porch, chimney, tail).

## Rendering finish (style bible)

- Soft watercolor / gouache wash, subtle paper grain, gentle painted
  shading, hand-painted edges, no heavy outline.
- No photorealism, 3D render, glossy plastic, vector emoji, anime, neon,
  thick black outline, glow, sparkles.

## Edge treatment / pipeline

- Transparent cut-outs for glyphs go to `game/assets/art/` as 512×512
  WebP ≤60 KB via `tools/asset_cutout.js` + `tools/asset_qa.js`.
- Opaque scene backgrounds go to `game/assets/scenes/` (never the glyph
  folder).
- Reference anchors: `bear.png` + `star.png` canonical; plus the matching
  approved family member (e.g. `scene-house.png`, `basket.png`,
  `object-potted-plant.png`) for subject finish.

## Locked decisions

- Cat faces stay simple and calm (no exaggerated emoji expressions).
- One tail per cat; no M/letter forehead markings; no collars with text.
- Baskets read as fish baskets, not bowls/buckets.
- Decorations are single objects, no clutter, no baked-in sky/ground line.


## Task 467 — scene implementation note (2026-11-28)

Four original, local SVG scene illustrations now provide the village, pond,
woodland and workshop backdrops under `game/assets/scenes/`. They use the
guide's warm wood, cream, terracotta, sage and dusty-blue palette, layered
diorama composition, organic silhouettes, soft shading and a subtle paper/wash
treatment. These are watercolor-inspired vector scene paintings, not emoji
artwork and not raster cut-outs. The four approved prototypes above remain the
visual reference. The new scene set must be judged from the refreshed
four-viewport Screenshot_Review battery before the owner flips the registry's
`screenshot:false` baseline gate; screenshot capture alone is not approval.
