# Little Explorer — Extracted Asset Review Library

**Status:** First-pass extraction package under active Gate 1 review. Nothing in this package is approved for production or integrated into the game.

## Status definitions
- **EXTRACTED — NEEDS REVIEW:** a crop has been created; visual completeness, family assignment, edge quality, and suitability still need human review.
- **NEEDS WORK:** requires recropping, cleanup, or a new source.
- **READY FOR REVIEW:** prepared and checked as an individual candidate.
- **APPROVED:** explicitly approved by the project owner.
- **READY FOR IMPLEMENTATION:** approved and technically checked against the runtime contract.
- **INTEGRATED:** verified in the game repository/runtime. This is separate from artistic approval.

## CSV columns

`TABLE_OF_CONTENT.csv` tracks every candidate with these fields (per `Little_Explorer_Asset_Implementation_Guide.md` §14.1):

- `asset_id`, `family`, `filename`, `path` — original numbered crop identity and location.
- `source_atlas`, `source_bbox_xywh` — provenance (source file + bounding box).
- `status` — current review state (see status definitions above).
- `notes` — automated extraction note from the first pass.
- `semantic_name` — stable category-prefixed asset ID (e.g. `terrain-grass-top-a`); assigned only when the image supports it.
- `art_status` — artistic review state (`READY FOR REVIEW` / `NEEDS WORK` / `REJECTED` / `APPROVED`).
- `approval_evidence` — `pending` until the project owner approves the exact version.
- `technical_status` — `not-checked` / `passed` / `failed` after export QA.
- `runtime_consumer`, `worlds` — exact game call-site and world mapping; empty until a consumer is confirmed.
- `implementation_status` — `not-started` / `in-progress` / `integrated` / `verified`.
- `review_note` — the Gate 1 review finding for that candidate.

## Family inventory

| Family folder | Candidate files | Reviewed | APPROVED | READY FOR REVIEW | NEEDS WORK | REJECTED | Current status |
|---|---:|---:|---:|---:|---:|---:|---|
| `01_TERRAIN_TILES/` | 21 | 21 | 18 | 0 | 3 | 0 | Gate 2 batch 1 APPROVED 2026-11-08 (3 NEEDS WORK still excluded) |
| `02_PLATFORMS/` | 11 | 11 | 11 | 0 | 0 | 0 | Gate 2 batch 2 APPROVED 2026-11-08 |
| `03_PIPES_AND_ENTRANCES/` | 8 | 8 | 5 | 0 | 2 | 1 | Gate 2 batch 3 MIXED 2026-11-08/09 (01+02+05 regenerated versions + 03 + 06 approved; 04 rejected; 07/08 side-opening removal pending, Option C regeneration in progress) |
| `04_ENEMIES_AND_WALKERS/` | 17 | 17 | 0 | 14 | 0 | 3 | Gate 1 review complete (task 431) |
| `05_COLLECTIBLES_AND_ITEMS/` | 15 | 15 | 0 | 10 | 0 | 5 | Gate 1 audit complete (task 431) |
| `06_GOALS_AND_STRUCTURES/` | 5 | 5 | 0 | 4 | 0 | 1 | Gate 1 review complete (task 431) |
| `07_DECORATIONS_AND_NATURE/` | 16 | 16 | 0 | 15 | 0 | 1 | Gate 1 review complete (task 431) |
| `08_HAZARDS_AND_EFFECTS/` | 12 | 12 | 0 | 10 | 0 | 2 | Gate 1 audit complete (task 431) |
| `09_BACKGROUND_SCENES/` | 11 | 11 | 0 | 0 | 0 | 11 | Gate 1 audit complete — reference only, excluded from approval batches (task 431) |
| `REVIEW/` | 9 review sheets + CSV | — | — | — | — | — | Review index |
| `00_SOURCE_ATLASES/` | 2 originals | — | — | — | — | — | Preserved unchanged |

**Counts:** 116 candidate files total; 116 reviewed (Gate 1 pass, task 431); 34 APPROVED (batches 1–3 incl. regenerated pipes 01+02+05, 2026-11-08/09); 53 READY FOR REVIEW; 5 NEEDS WORK (terrain 01/04/11 pixel recrop; pipes 07/08 side-opening removal via Option C); 24 REJECTED (5 header-label false positives, 1 cross-family duplicate, 6 no-Explorer-consumer art, 1 pipe style/design fail, 11 reference-only backgrounds); 0 technically ready; 0 integrated.

**REJECTED breakdown (23):** 5 header-label false positives (`enemies_01`, `goals_01`, `hazards_01`, `decorations_01`, `collectibles_01`); 1 cross-family duplicate (`hazards_10` = `platforms_09`); 6 no-Explorer-consumer art (`enemies_15` frog, `enemies_16` snail, `collectibles_12/13/14/15` potion/chest/key/music notes); 11 backgrounds as reference-only material, not an art-quality judgment (excluded from Gate 2 batches per guide §12).

**Note on REJECTED backgrounds:** the guide excludes background crops from approval batches by default (reference crops with margins; runtime scenes already exist in `game/assets/scenes/`). They stay in the package as art-direction reference.

## Important extraction limitations

- The transparent atlas (`Watercolor Platformer Game Asset Atlas-1.png`) was segmented using connected alpha regions. **A crop is not guaranteed to equal one asset**: nearby artwork can be joined by soft alpha fringes, and a single object can be split into multiple components. Review every numbered candidate against its review sheet and source atlas.
- Some large/merged regions and all background panels were excluded from automatic connected-component extraction. The goal-structure family is notably incomplete in this first pass; do not interpret the candidate count as the complete inventory.
- The 11 background candidates were manually cropped from the opaque overview atlas (`Watercolor Platformer Asset Atlas-2 (1).png`). These crops include some white margin and are **reference crops only**, not transparent production backgrounds. Check their crop boundaries and compare with the original scene/background files before deciding whether to use them.
- No colour-key removal was applied to the opaque atlas. No resizing, sharpening, repainting, or edge decontamination was performed.
- Candidate filenames are deliberately numbered rather than semantically named where identity is uncertain. Rename only after visual review.
- The source atlases are included unchanged under `00_SOURCE_ATLASES/`.

## How to review

1. Open the matching JPG in `REVIEW/` to scan a family.
2. Open the numbered PNG candidate at full resolution and compare it with the source atlas.
3. In `TABLE_OF_CONTENT.csv`, update the status and notes only after review. Record a clear reason for `NEEDS WORK` or `APPROVED`.
4. Do not mark anything `READY FOR IMPLEMENTATION` until transparency, dimensions, naming, display scale, anchor points, and runtime compatibility have been checked.
5. Keep approval and implementation status distinct.

## Review sheets

- `01_TERRAIN_TILES_review_sheet.jpg`
- `02_PLATFORMS_review_sheet.jpg`
- `03_PIPES_AND_ENTRANCES_review_sheet.jpg`
- `04_ENEMIES_AND_WALKERS_review_sheet.jpg`
- `05_COLLECTIBLES_AND_ITEMS_review_sheet.jpg`
- `06_GOALS_AND_STRUCTURES_review_sheet.jpg`
- `07_DECORATIONS_AND_NATURE_review_sheet.jpg`
- `08_HAZARDS_AND_EFFECTS_review_sheet.jpg`
- `09_BACKGROUND_SCENES_review_sheet.jpg`
- `09_BACKGROUND_SCENES_review_sheet.jpg`

See `EXTRACTION_LOG.md` for extraction method and verification details.
