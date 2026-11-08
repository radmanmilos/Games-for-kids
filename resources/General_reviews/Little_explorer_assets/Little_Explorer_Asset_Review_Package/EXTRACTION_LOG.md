# Extraction log

## Inputs
- `Watercolor Platformer Game Asset Atlas-1.png` — 1536×1024 RGBA; contains transparent artwork and alpha-fringe regions.
- `Watercolor Platformer Asset Atlas-2 (1).png` — 1536×1024 RGBA file with fully opaque pixels; used as a visual overview and for the 11 background reference crops.

## Operations performed
- Preserved both uploaded source atlases unchanged in `00_SOURCE_ATLASES/`.
- Segmented the transparent atlas using connected components on alpha > 60, retaining components with area > 650 px and excluding header labels and large merged/background regions.
- Saved 105 component crops into eight asset-family folders, with 5 px crop padding.
- Cropped 11 background thumbnails from the opaque atlas using approximate rectangular boundaries.
- Generated family review sheets and a CSV table of contents with source bounding boxes and initial review statuses.

## What was not done
- No manual pixel-level segmentation or semantic identification of every crop.
- No background removal from the opaque atlas.
- No edge decontamination, alpha cleanup, repainting, upscaling, downscaling, sprite packing, or runtime conversion.
- No changes to game code, asset maps, inventories, or GitHub repository.
- No gameplay tests or device tests.

## Verification performed
- Confirmed both input images load and are 1536×1024 RGBA.
- Confirmed 105 alpha-component crops and 11 background reference crops were written.
- Checked the background contact sheet visually. Its crop boundaries are approximate; inspect each full-size file.
- The automated component segmentation was not individually validated as one-object-per-file. Treat all crops as review candidates.

## Next review pass
Manually inspect each candidate, split merged crops, recombine fragmented pieces where appropriate, remove false positives, assign semantic names, and then update the table of contents. Only after that should the team perform technical QA and request approval.

## Review pass 1 — 2026-11-08 — terrain family (Gate 1, task 431)

- **Date:** 2026-11-08
- **Method:** Visual inspection at native resolution via vision model (Nemotron 3.5 Super VL, OpenCode); family review sheet `REVIEW/01_TERRAIN_TILES_review_sheet.jpg` used to locate candidates; each numbered PNG opened individually; source bbox from CSV used for atlas cross-reference.
- **Inputs:** `01_TERRAIN_TILES/terrain_tiles_candidate_01..21.png` (21 files).
- **Outcome per candidate:** 18 marked `READY FOR REVIEW` (complete single tiles, clean silhouettes, no neighbouring art); 3 marked `NEEDS WORK`:
  - `candidate_01` — wide strip (bbox 241×67), likely merged multi-tile component; needs atlas verification and split.
  - `candidate_04` — slope piece with dark corner marks (edge contamination); needs recrop/cleanup.
  - `candidate_11` — detached fragment at bottom-right; needs fragment removal or recrop.
- **Semantic names assigned:** all 21 candidates got category-prefixed IDs (e.g. `terrain-grass-top-a`, `terrain-snow-top-a`, `terrain-rock-top`, `terrain-sand-top`); material families identified (grass/dirt, stone, snow/ice, sand) for world mapping.
- **Materials found:** grass+dirt (spring/summer/autumn general), stone/rock (cave/underground), snow/ice (winter/northpole), sand (egypt/savanna).
- **Duplicates flagged:** `candidate_03` near-duplicate of `candidate_02`; `candidate_13` near-duplicate of `candidate_12`; both marked for variant check before both are retained.
- **Validation:** CSV updated with 8 new review columns (`semantic_name`, `art_status`, `approval_evidence`, `technical_status`, `runtime_consumer`, `worlds`, `implementation_status`, `review_note`); Markdown table of contents updated with new column guide and family counts.
- **Known limitations:** this pass reviewed visual completeness only; source-atlas side-by-side comparison for merged/duplicate candidates (01, 03, 10, 13) still pending; no pixel-level cleanup performed (3 NEEDS WORK candidates remain uncorrected); no technical QA, no approval, no integration.
- **Files changed:** `REVIEW/TABLE_OF_CONTENT.csv` (21 terrain rows updated + 8 columns added to all rows), `REVIEW/TABLE_OF_CONTENT.md` (column guide + family inventory), this log.

## Review pass 2 — 2026-11-08 — remaining 8 families (Gate 1, task 431)

- **Date:** 2026-11-08
- **Method:** same as pass 1 — visual inspection at native resolution via vision model (Nemotron 3.5 Super VL, OpenCode); family review sheets used to locate candidates; each numbered PNG opened individually; runtime cross-reference against `game/games/kitty-standalone.js` (WORLDS, draw functions) and `game/data/art-registry.js` (`ART_REGISTRY` glyph→stem map).
- **Order followed:** platforms → pipes → enemies/walkers → goals → hazards → decorations → collectibles (audit) → backgrounds (audit), per guide §6.1.

### Platforms (11/11 — all READY FOR REVIEW)
Complete single objects, clean silhouettes: 2 grass floating platforms, log bridge, long grass platform, 2 stone platforms, plank bridge, rock/boulder platform, spring/bouncy platform, grass+bush platform, wooden crate. No edge artifacts, no labels, no duplicates within family.

### Pipes (8/8 — all READY FOR REVIEW)
Complete themed pipe/entrance objects: stone, vine, classic green, wooden barrel, sandstone, ice, mushroom, terracotta. Each maps to an Explorer world material (cave/japan/generic/water/egypt/northpole/cave/savanna). Cave/underground `scorpion` pipe enemy remains absent from the atlas (known roster gap).

### Enemies/walkers (17/17 — 14 READY, 3 REJECTED)
- REJECTED: `01` header-label false positive; `15` frog + `16` snail — valid art but no Explorer consumer (not in any world roster; guide §7 no-consumer rule).
- READY: oni (japan), snake (savanna), piranha/fish (water), mole (underground) pipe enemies; bee, hedgehog, worm, spider, seal, ladybug walkers; snowman/penguin/crab/bat flagged as **alternates to already-approved reused art** (`snowman.webp`, `penguin.webp`, `animal-crab.webp`, `bat.webp`) — do NOT replace without explicit approval (guide §4.1).
- Known roster gaps still absent: `meerkat`, `panda`, `scarab` walkers; `scorpion` pipe enemy.

### Goals (5/5 — 4 READY, 1 REJECTED)
- REJECTED: `01` header-label false positive.
- READY: mine entrance, cave entrance, house, torii gate. House flagged as alternate to approved `house.webp` (Spring). Trigger regions must remain unchanged at integration (guide §8.4).

### Hazards/effects (12/12 — 10 READY, 2 REJECTED)
- REJECTED: `01` header-label false positive; `10` duplicate of `platforms_candidate_09` (spring platform).
- READY but **mostly no direct consumer**: pit hazards stay procedural per plan §8.6. Closest optional accents: spike strip (`06`, matches spike pit hazards) and flame (`03`, lava accent) — decorative overlay only, must not disguise collision boundary (guide §8.7). Others (ice crystal, barrel, spiked ball, thorn vine, tornado, rock, cloud, rock pile) are plausible decor only if explicitly approved.

### Decorations/nature (16/16 — 15 READY, 1 REJECTED)
- REJECTED: `01` header-label false positive.
- READY: bushes (plain/flowering/3 berry variants), small bush, rock, pine tree, stone lantern (Japan), wooden fence, 2 signposts, mushroom+flowers, rock+mushroom, tree stump. **No direct runtime consumer** — Explorer `drawDecor` is particle-only (snow/leaves/petals/bubbles); static scenery would need a new consumer + explicit approval. Variant checks flagged: berries 03/08/09, bushes 04/07, cross-family rock vs `hazards_09`.

### Collectibles/items (15/15 audit — 10 READY, 5 REJECTED)
- REJECTED: `01` header-label false positive; `12` potion, `13` treasure chest, `14` key, `15` music notes — valid art but require new game mechanics (no consumer; same rule as frog/snail).
- Audit finding: **all 11 world collectible emoji (🍓🍉🍎🥕🍄🍇🐚🍌🍙🎁🌴) already resolve through `ART_REGISTRY` to approved `.webp` files on disk** — existing art takes precedence (guide §4.1). Alternates flagged: gift box vs `object-gift.webp` (northpole 🎁), strawberry vs `strawberry.webp` (spring 🍓), tomato vs `apple.webp` (autumn 🍎), star/heart/daisy/tulip vs `star.webp`/`object-heart.webp`/`flower.webp`/`flower-tulip.webp`.
- Strongest new-consumer candidate in the family: **submarine (`02`)** — water-world goal `type === 'submarine'` is drawn procedurally at `kitty-standalone.js:2571` (`drawGoal`); candidate could replace that drawing after Gate 2 approval. Coin (`06`) would change per-world collectible identity (coins render the world emoji at `kitty-standalone.js:1749`) — behaviour change requiring explicit approval.

### Backgrounds (11/11 audit — 11 REJECTED as reference-only)
All 11 scene crops inspected (spring windmill, beach, autumn, winter, Egypt, castle, underwater, canyon, sunset, pagoda, night sky). Marked REJECTED **as integration candidates, not as art-quality judgments**: the guide states background crops are approximate opaque crops with margins, reference material only, excluded from approval batches by default (guide lines 148/269/717); runtime scenes already exist in `game/assets/scenes/` (one tiled layer per world); any scene replacement requires separate review + approval + scene-specific QA. They remain in the package as art-direction reference.

### Validation (pass 2)
- CSV: all 95 remaining rows updated (116/116 total rows now carry semantic_name + art_status + review_note; verified by `tools/.cache/toc_summary.js`: 90 READY FOR REVIEW / 3 NEEDS WORK / 23 REJECTED, 0 missing names/notes).
- Markdown table of contents: family inventory updated with per-family reviewed/READY/NEEDS/REJECTED columns + REJECTED breakdown.
- **Known limitations:** visual completeness + consumer mapping only; no source-atlas side-by-side for flagged near-duplicates; no pixel cleanup (3 terrain NEEDS WORK remain); no technical QA, no approval (Gate 2 pending), no integration.
- **Files changed:** `REVIEW/TABLE_OF_CONTENT.csv` (95 rows), `REVIEW/TABLE_OF_CONTENT.md` (inventory), this log. One-off update scripts in `tools/.cache/` (git-ignored): `update_toc_{platforms,pipes,enemies,goals,hazards,decorations,collectibles,backgrounds}.js`, `toc_summary.js`.
