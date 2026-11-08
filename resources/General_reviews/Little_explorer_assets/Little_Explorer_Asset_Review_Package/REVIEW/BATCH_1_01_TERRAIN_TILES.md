# Gate 2 approval batch 1 — Terrain tiles

- **Date prepared:** 2026-11-08
- **Package:** `resources/General_reviews/Little_explorer_assets/Little_Explorer_Asset_Review_Package/`
- **Source:** `00_SOURCE_ATLASES/Watercolor Platformer Game Asset Atlas-1.png` (crops unchanged since extraction — no edits applied).
- **Status:** AWAITING EXPLICIT PER-ASSET APPROVAL (guide §9). Until approved, rows stay `READY FOR REVIEW` / `NEEDS WORK`.
- **Controlling style reference:** `resources/General_reviews/Asset_Generation/STYLE_BIBLE.md` + `EXPLORER_STYLE_ADDENDUM.md` (note: both are still "Proposed — Gate 1 acceptance pending"; approving this batch does not waive that pending acceptance).

## 1. Batch contents

| Status | Count | Meaning |
|---|---:|---|
| READY FOR REVIEW | 18 | complete, clean, candidate for approval |
| NEEDS WORK | 3 | excluded from approval until recropped/cleaned |
| REJECTED | 0 | excluded — reasons in §5 |

## 2. Consumer and world mapping (EXPLORER_MAPPING.md)

| Entity | Call-site | Mapped asset | Treatment |
|---|---|---|---|
| Ground segments (140 px band) | `draw()` static platforms, `kitty-standalone.js:1671` | `terrain-<world>-top` + `-side` variants | Transparent glyph tile; collision unchanged |
| Float platforms (26 px) | same loop, `:1009` mapping | `terrain-<world>-top` variants | Glyph top strip; geometry unchanged |
| Stair steps (`st.w`×`st.h`) | `stairSteps` draw | `terrain-<world>-top` variants | Glyph; riser geometry unchanged |

Material → worlds (Gate 1): grass+dirt → spring/summer/autumn general; stone/rock → cave/underground; snow/ice → winter/northpole; sand → egypt/savanna; water world floor material not present in atlas (confirm at Gate 3).

## 3. Size check (guide §9: native + in-game)

Native: 11 crops 63–138 px wide, all 64–67 px tall (bboxes in table below); 2 merged/irregular strips (candidates 01, 10) wider. In-game: ground band is 140 px tall × segment width (variable), floats 26 px tall — a tile glyph must tile horizontally at ~64–80 px and repeat vertically for the 140 px band; exact tiling decided at Gate 4 pilot.

## 4. Style pre-check vs style bible

Pre-check vs style bible (agent, Gate 1 visual pass): soft watercolor/gouache finish ✓; warm muted palette ✓; rounded organic silhouettes ✓; paper/colored-pencil texture visible ✓; soft edges, no heavy black outlines / white sticker borders / glow ✓; no unnecessary faces ✓. Owner to re-confirm at native + in-game size.

## 5. Labelled contact sheet (click any image for the full-resolution PNG)

| | | | | |
|---|---|---|---|---|
| <img src="../01_TERRAIN_TILES/terrain_tiles_candidate_02.png" width="140" alt="terrain-grass-top-a"> | <img src="../01_TERRAIN_TILES/terrain_tiles_candidate_03.png" width="140" alt="terrain-grass-top-b"> | <img src="../01_TERRAIN_TILES/terrain_tiles_candidate_05.png" width="140" alt="terrain-grass-slope-left"> | <img src="../01_TERRAIN_TILES/terrain_tiles_candidate_06.png" width="140" alt="terrain-grass-top-c"> | <img src="../01_TERRAIN_TILES/terrain_tiles_candidate_07.png" width="140" alt="terrain-grass-top-d"> |
| **terrain-grass-top-a**<br>`terrain_tiles_candidate_02`<br>79×64 px | **terrain-grass-top-b**<br>`terrain_tiles_candidate_03`<br>92×61 px | **terrain-grass-slope-left**<br>`terrain_tiles_candidate_05`<br>98×70 px | **terrain-grass-top-c**<br>`terrain_tiles_candidate_06`<br>91×67 px | **terrain-grass-top-d**<br>`terrain_tiles_candidate_07`<br>85×62 px |
| <img src="../01_TERRAIN_TILES/terrain_tiles_candidate_08.png" width="140" alt="terrain-grass-top-e"> | <img src="../01_TERRAIN_TILES/terrain_tiles_candidate_09.png" width="140" alt="terrain-grass-top-f"> | <img src="../01_TERRAIN_TILES/terrain_tiles_candidate_10.png" width="140" alt="terrain-grass-top-stone"> | <img src="../01_TERRAIN_TILES/terrain_tiles_candidate_12.png" width="140" alt="terrain-grass-top-h"> | <img src="../01_TERRAIN_TILES/terrain_tiles_candidate_13.png" width="140" alt="terrain-grass-top-i"> |
| **terrain-grass-top-e**<br>`terrain_tiles_candidate_08`<br>89×64 px | **terrain-grass-top-f**<br>`terrain_tiles_candidate_09`<br>64×66 px | **terrain-grass-top-stone**<br>`terrain_tiles_candidate_10`<br>119×67 px | **terrain-grass-top-h**<br>`terrain_tiles_candidate_12`<br>93×64 px | **terrain-grass-top-i**<br>`terrain_tiles_candidate_13`<br>92×61 px |
| <img src="../01_TERRAIN_TILES/terrain_tiles_candidate_14.png" width="140" alt="terrain-grass-top-j"> | <img src="../01_TERRAIN_TILES/terrain_tiles_candidate_15.png" width="140" alt="terrain-grass-top-k"> | <img src="../01_TERRAIN_TILES/terrain_tiles_candidate_16.png" width="140" alt="terrain-grass-top-stone-b"> | <img src="../01_TERRAIN_TILES/terrain_tiles_candidate_17.png" width="140" alt="terrain-grass-top-stone-c"> | <img src="../01_TERRAIN_TILES/terrain_tiles_candidate_18.png" width="140" alt="terrain-snow-top-a"> |
| **terrain-grass-top-j**<br>`terrain_tiles_candidate_14`<br>79×57 px | **terrain-grass-top-k**<br>`terrain_tiles_candidate_15`<br>54×45 px | **terrain-grass-top-stone-b**<br>`terrain_tiles_candidate_16`<br>77×66 px | **terrain-grass-top-stone-c**<br>`terrain_tiles_candidate_17`<br>81×65 px | **terrain-snow-top-a**<br>`terrain_tiles_candidate_18`<br>82×61 px |
| <img src="../01_TERRAIN_TILES/terrain_tiles_candidate_19.png" width="140" alt="terrain-rock-top"> | <img src="../01_TERRAIN_TILES/terrain_tiles_candidate_20.png" width="140" alt="terrain-snow-top-b"> | <img src="../01_TERRAIN_TILES/terrain_tiles_candidate_21.png" width="140" alt="terrain-sand-top"> |
| **terrain-rock-top**<br>`terrain_tiles_candidate_19`<br>86×63 px | **terrain-snow-top-b**<br>`terrain_tiles_candidate_20`<br>64×62 px | **terrain-sand-top**<br>`terrain_tiles_candidate_21`<br>99×54 px |   |   |

### NEEDS WORK — not approvable yet

| Asset ID | Semantic name | Problem |
|---|---|---|
| `terrain_tiles_candidate_01` | terrain-grass-strip-wide | Wide grass+dirt ground strip (bbox 241x67). Likely merged multi-tile component; verify vs source atlas and split into individual tiles before use. |
| `terrain_tiles_candidate_04` | terrain-grass-slope-right | Slope/end-cap piece (grass descends to right). Dark corner marks present (edge contamination); recrop/cleanup required. |
| `terrain_tiles_candidate_11` | terrain-grass-top-g | Tile with detached fragment at bottom-right. Remove fragment or recrop; do not ship with stray pixels. |

## 6. Review notes — READY FOR REVIEW candidates

| Semantic name | Asset ID | Bbox (x,y,w,h) | Review note |
|---|---|---|---|
| terrain-grass-top-a | `terrain_tiles_candidate_02` | 383,52,79,64 | Complete small tile: grass top + dirt base. Clean silhouette; no neighbours visible. |
| terrain-grass-top-b | `terrain_tiles_candidate_03` | 278,55,92,61 | Complete small tile: grass top + dirt base. Near-duplicate of candidate_02; variant check vs atlas before both retained. |
| terrain-grass-slope-left | `terrain_tiles_candidate_05` | 395,125,98,70 | Slope/end-cap piece (grass descends to left). Complete; grass overhang on right edge. No edge artifacts seen. |
| terrain-grass-top-c | `terrain_tiles_candidate_06` | 220,126,91,67 | Complete small tile: grass top + dirt base. |
| terrain-grass-top-d | `terrain_tiles_candidate_07` | 21,129,85,62 | Complete small tile: grass top + dirt base. |
| terrain-grass-top-e | `terrain_tiles_candidate_08` | 118,129,89,64 | Complete tile (slightly wider): grass top + dirt base. |
| terrain-grass-top-f | `terrain_tiles_candidate_09` | 323,128,64,66 | Complete narrow tile: grass top + dirt base. |
| terrain-grass-top-stone | `terrain_tiles_candidate_10` | 21,202,119,67 | Wide tile: grass top + stone/rock base. Possible merged strip; verify vs atlas. |
| terrain-grass-top-h | `terrain_tiles_candidate_12` | 245,207,93,64 | Complete tile: grass top + dirt base. |
| terrain-grass-top-i | `terrain_tiles_candidate_13` | 351,210,92,61 | Complete tile: grass top + dirt base. Near-duplicate of candidate_12; variant check. |
| terrain-grass-top-j | `terrain_tiles_candidate_14` | 455,213,79,57 | Complete tile: grass top + dirt base. |
| terrain-grass-top-k | `terrain_tiles_candidate_15` | 544,224,54,45 | Complete narrow tile: grass top + dirt base. |
| terrain-grass-top-stone-b | `terrain_tiles_candidate_16` | 122,282,77,66 | Tile: grass top + stone/rock base. Distinct stone material. |
| terrain-grass-top-stone-c | `terrain_tiles_candidate_17` | 323,284,81,65 | Tile: grass top + stone/rock base. Distinct stone material. |
| terrain-snow-top-a | `terrain_tiles_candidate_18` | 22,286,82,61 | Snow/ice tile: icy blue top + rock base. Winter/northpole material. |
| terrain-rock-top | `terrain_tiles_candidate_19` | 218,286,86,63 | Stone/rock tile (grey), no grass. Cave/underground material. |
| terrain-snow-top-b | `terrain_tiles_candidate_20` | 418,287,64,62 | Ice/snow tile: snow cap top + rock/ice base. Winter/northpole material. |
| terrain-sand-top | `terrain_tiles_candidate_21` | 498,296,99,54 | Sand/desert tile: golden/sand top + sandy base. Egypt/savanna material. |

## 7. Approval request (guide §9 protocol)

Please approve **per exact candidate** (semantic name / asset ID above). A general "looks good" is not per-asset approval. Conditions or rejects can be named per item. Alternates to already-approved reused art are marked in §6 — approving an alternate does NOT authorize replacing existing approved art without a separate explicit decision.

**Approved by:** _pending_ — **Date:** _pending_ — **Conditions:** _pending_

---
_Generated by `tools/.cache/gen_batch.js` from `REVIEW/TABLE_OF_CONTENT.csv` (task 432)._
