# Gate 2 approval batch 3 — Pipes and entrances

- **Date prepared:** 2026-11-08
- **Package:** `resources/General_reviews/Little_explorer_assets/Little_Explorer_Asset_Review_Package/`
- **Source:** `00_SOURCE_ATLASES/Watercolor Platformer Game Asset Atlas-1.png` (crops unchanged since extraction — no edits applied).
- **Status:** AWAITING EXPLICIT PER-ASSET APPROVAL (guide §9). Until approved, rows stay `READY FOR REVIEW` / `NEEDS WORK`.
- **Controlling style reference:** `resources/General_reviews/Asset_Generation/STYLE_BIBLE.md` + `EXPLORER_STYLE_ADDENDUM.md` (note: both are still "Proposed — Gate 1 acceptance pending"; approving this batch does not waive that pending acceptance).

## 1. Batch contents

| Status | Count | Meaning |
|---|---:|---|
| READY FOR REVIEW | 8 | complete, clean, candidate for approval |
| NEEDS WORK | 0 | excluded from approval until recropped/cleaned |
| REJECTED | 0 | excluded — reasons in §5 |

## 2. Consumer and world mapping (EXPLORER_MAPPING.md)

| Entity | Call-site | Mapped asset | Treatment |
|---|---|---|---|
| Pipe entrances | `draw()` themed pipes, `kitty-standalone.js:1694`, creation `:1041` | `pipe-<world>` | Transparent glyph; collision box (60 px wide x `p.h`) unchanged |
| Enemy pop-out clip | `:1713` clips enemy to pipe mouth | — | Glyph must keep the mouth position readable so emergence stays visible |

8 candidates for 11 worlds — per-world assignment proposed at Gate 3 (Gate 1 material hints: stone -> cave/underground; vine -> savanna/jungle; green -> classic/spring-summer-autumn; barrel -> water; sandstone -> egypt; ice -> winter/northpole; mushroom -> cave/underground; terracotta -> savanna). Gate 2 approves the art only; the mapping decision is Gate 3.

## 3. Size check (guide §9: native + in-game)

Native: 8 crops ~90-119 px wide x ~114-116 px tall (bboxes in table below). In-game: pipe body 60 px wide (`:1041`), height `p.h` per level, 24 px rim overhang (`:1701`). The glyph is drawn to the existing box; silhouette must not imply a changed collision area (guide 8.5).

## 4. Style pre-check vs style bible

Pre-check vs style bible (agent, Gate 1 visual pass): complete themed entrances, soft watercolor finish, warm muted palette, rounded organic shapes, no heavy outlines/sticker borders/glow, no faces on ordinary objects. Owner to re-confirm at native + in-game size.

## 5. Labelled contact sheet (click any image for the full-resolution PNG)

| | | | | |
|---|---|---|---|---|
| <img src="../03_PIPES_AND_ENTRANCES/pipes_and_entrances_candidate_01.png" width="140" alt="pipe-stone"> | <img src="../03_PIPES_AND_ENTRANCES/pipes_and_entrances_candidate_02.png" width="140" alt="pipe-vine"> | <img src="../03_PIPES_AND_ENTRANCES/pipes_and_entrances_candidate_03.png" width="140" alt="pipe-green"> | <img src="../03_PIPES_AND_ENTRANCES/pipes_and_entrances_candidate_04.png" width="140" alt="pipe-barrel"> | <img src="../03_PIPES_AND_ENTRANCES/pipes_and_entrances_candidate_05.png" width="140" alt="pipe-sandstone"> |
| **pipe-stone**<br>`pipes_and_entrances_candidate_01`<br>90×106 px | **pipe-vine**<br>`pipes_and_entrances_candidate_02`<br>105×107 px | **pipe-green**<br>`pipes_and_entrances_candidate_03`<br>91×106 px | **pipe-barrel**<br>`pipes_and_entrances_candidate_04`<br>107×104 px | **pipe-sandstone**<br>`pipes_and_entrances_candidate_05`<br>109×128 px |
| <img src="../03_PIPES_AND_ENTRANCES/pipes_and_entrances_candidate_06.png" width="140" alt="pipe-ice"> | <img src="../03_PIPES_AND_ENTRANCES/pipes_and_entrances_candidate_07.png" width="140" alt="pipe-mushroom"> | <img src="../03_PIPES_AND_ENTRANCES/pipes_and_entrances_candidate_08.png" width="140" alt="pipe-terracotta"> |
| **pipe-ice**<br>`pipes_and_entrances_candidate_06`<br>95×114 px | **pipe-mushroom**<br>`pipes_and_entrances_candidate_07`<br>90×114 px | **pipe-terracotta**<br>`pipes_and_entrances_candidate_08`<br>106×116 px |   |   |

## 6. Review notes — READY FOR REVIEW candidates

| Semantic name | Asset ID | Bbox (x,y,w,h) | Review note |
|---|---|---|---|
| pipe-stone | `pipes_and_entrances_candidate_01` | 1191,62,90,106 | Complete stone/rock pipe entrance (grey stone tower, arched door, circular top opening). Cave/underground material. |
| pipe-vine | `pipes_and_entrances_candidate_02` | 1406,62,105,107 | Complete vine-covered pipe entrance (green vines over stone, arched door). Jungle/savanna material. |
| pipe-green | `pipes_and_entrances_candidate_03` | 1086,66,91,106 | Complete green pipe (classic pipe with rim, no door). Generic/classic pipe. |
| pipe-barrel | `pipes_and_entrances_candidate_04` | 1292,66,107,104 | Complete wooden barrel entrance (barrel with arched door, leaf sprigs). Water material. |
| pipe-sandstone | `pipes_and_entrances_candidate_05` | 1406,192,109,128 | Complete sandstone pipe entrance (golden/sandstone, arched door, leaf sprigs). Egypt material. |
| pipe-ice | `pipes_and_entrances_candidate_06` | 1085,195,95,114 | Complete ice pipe entrance (blue/ice, arched door, snow base). Northpole/winter material. |
| pipe-mushroom | `pipes_and_entrances_candidate_07` | 1193,195,90,114 | Complete mushroom pipe entrance (purple/pink mushroom with spots, arched door). Cave material. |
| pipe-terracotta | `pipes_and_entrances_candidate_08` | 1295,195,106,116 | Complete terracotta pipe entrance (orange/terracotta, arched door, leaf sprigs). Savanna material. |

## 7. Approval request (guide §9 protocol)

Please approve **per exact candidate** (semantic name / asset ID above). A general "looks good" is not per-asset approval. Conditions or rejects can be named per item. Alternates to already-approved reused art are marked in §6 — approving an alternate does NOT authorize replacing existing approved art without a separate explicit decision.

**Approved by:** _pending_ — **Date:** _pending_ — **Conditions:** _pending_

---
_Generated by `tools/.cache/gen_batch.js` from `REVIEW/TABLE_OF_CONTENT.csv` (task 432)._
