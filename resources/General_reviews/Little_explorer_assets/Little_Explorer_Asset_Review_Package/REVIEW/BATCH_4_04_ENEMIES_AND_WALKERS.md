# Gate 2 approval batch 4 — Enemies and walkers

- **Date prepared:** 2026-11-08
- **Package:** `resources/General_reviews/Little_explorer_assets/Little_Explorer_Asset_Review_Package/`
- **Source:** `00_SOURCE_ATLASES/Watercolor Platformer Game Asset Atlas-1.png` (crops unchanged since extraction — no edits applied).
- **Status:** MIXED final 2026-11-09 — 12 APPROVED (02/03/04/05/06/07/08/09/11/12/13/14; owner reply "rest are approved"); 2 NEEDS WORK (10 snowman, 17 ladybug — defect fixes required, see §7); 3 REJECTED (01 header label; 15 frog + 16 snail confirmed rejected, owner added reasons — see §5/§7). Every candidate has a final disposition.
- **Controlling style reference:** `resources/General_reviews/Asset_Generation/STYLE_BIBLE.md` + `EXPLORER_STYLE_ADDENDUM.md` (note: both are still "Proposed — Gate 1 acceptance pending"; approving this batch does not waive that pending acceptance).

## 1. Batch contents

| Status | Count | Meaning |
|---|---:|---|
| APPROVED | 12 | owner-approved per candidate 2026-11-09 |
| READY FOR REVIEW | 0 | none — all reviewed 2026-11-09 |
| NEEDS WORK | 2 | excluded until the defects are fixed and re-approved (10, 17) |
| REJECTED | 3 | excluded — reasons in §5 (01, 15, 16) |

## 2. Consumer and world mapping (EXPLORER_MAPPING.md)

| Entity | Call-site | Mapped asset | Treatment |
|---|---|---|---|
| Pipe enemies (mouse/mole/bat/piranha/snake/oni/penguin/scorpion) | `drawEnemy()`, `kitty-standalone.js:1716`, clipped to pipe mouth `:1713` | `enemy-<type>` | Transparent glyph; spawn timing + clip unchanged; friendly silhouette |
| Ground walkers (11 types) | `drawWalker()`, `:1726` | `walker-<type>` | Transparent glyph <=48 px; direction flip, foot anchor and bob unchanged |

Per EXPLORER_MAPPING section 2: pipe enemies - spring/summer/autumn/winter mouse (existing mouse.webp), underground mole, cave bat (existing bat.webp), water piranha, savanna snake, japan oni, northpole penguin (existing penguin.webp), egypt scorpion (NOT in atlas - roster gap). Walkers - spring ladybug, summer bee, autumn hedgehog, winter snowman (existing snowman.webp), underground worm, cave spider, water crab (existing animal-crab.webp), savanna meerkat / japan panda / egypt scarab (all three NOT in atlas - roster gaps).

## 3. Size check (guide §9: native + in-game)

Native: crops 37-95 px in the CSV bboxes (see table). In-game: walkers <=48 px (EXPLORER_MAPPING); pipe enemies drawn inside a 64 px clip above the pipe mouth (`:1713`). Confirm small-size readability at 48 px during Gate 4.

## 4. Style pre-check vs style bible

Pre-check vs style bible (agent, Gate 1 visual pass): calm, friendly expressions; rounded organic silhouettes; no scary/mean faces; soft watercolor finish; no heavy outlines or glow. IMPORTANT: snowman/penguin/crab/bat candidates are ALTERNATES to already-approved reused art (snowman.webp, penguin.webp, animal-crab.webp, bat.webp) - approving them does NOT authorize replacement without a separate explicit decision (guide 4.1).

## 5. Labelled contact sheet (click any image for the full-resolution PNG)

| | | | | |
|---|---|---|---|---|
| <img src="../04_ENEMIES_AND_WALKERS/enemies_and_walkers_candidate_02.png" width="140" alt="enemy-oni"> | <img src="../04_ENEMIES_AND_WALKERS/enemies_and_walkers_candidate_03.png" width="140" alt="enemy-snake"> | <img src="../04_ENEMIES_AND_WALKERS/enemies_and_walkers_candidate_04.png" width="140" alt="enemy-piranha"> | <img src="../04_ENEMIES_AND_WALKERS/enemies_and_walkers_candidate_05.png" width="140" alt="enemy-mole"> | <img src="../04_ENEMIES_AND_WALKERS/enemies_and_walkers_candidate_06.png" width="140" alt="walker-bee"> |
| **enemy-oni**<br>`enemies_and_walkers_candidate_02`<br>88×97 px | **enemy-snake**<br>`enemies_and_walkers_candidate_03`<br>103×80 px | **enemy-piranha**<br>`enemies_and_walkers_candidate_04`<br>102×71 px | **enemy-mole**<br>`enemies_and_walkers_candidate_05`<br>111×76 px | **walker-bee**<br>`enemies_and_walkers_candidate_06`<br>82×71 px |
| <img src="../04_ENEMIES_AND_WALKERS/enemies_and_walkers_candidate_07.png" width="140" alt="walker-hedgehog"> | <img src="../04_ENEMIES_AND_WALKERS/enemies_and_walkers_candidate_08.png" width="140" alt="walker-worm"> | <img src="../04_ENEMIES_AND_WALKERS/enemies_and_walkers_candidate_09.png" width="140" alt="walker-spider"> | <img src="../04_ENEMIES_AND_WALKERS/enemies_and_walkers_candidate_10.png" width="140" alt="walker-snowman"> | <img src="../04_ENEMIES_AND_WALKERS/enemies_and_walkers_candidate_11.png" width="140" alt="enemy-penguin"> |
| **walker-hedgehog**<br>`enemies_and_walkers_candidate_07`<br>112×74 px | **walker-worm**<br>`enemies_and_walkers_candidate_08`<br>101×51 px | **walker-spider**<br>`enemies_and_walkers_candidate_09`<br>105×59 px | **walker-snowman**<br>`enemies_and_walkers_candidate_10`<br>94×105 px | **enemy-penguin**<br>`enemies_and_walkers_candidate_11`<br>73×90 px |
| <img src="../04_ENEMIES_AND_WALKERS/enemies_and_walkers_candidate_12.png" width="140" alt="walker-crab"> | <img src="../04_ENEMIES_AND_WALKERS/enemies_and_walkers_candidate_13.png" width="140" alt="walker-seal"> | <img src="../04_ENEMIES_AND_WALKERS/enemies_and_walkers_candidate_14.png" width="140" alt="enemy-bat"> | <img src="../04_ENEMIES_AND_WALKERS/enemies_and_walkers_candidate_17.png" width="140" alt="walker-ladybug"> |
| **walker-crab**<br>`enemies_and_walkers_candidate_12`<br>113×80 px | **walker-seal**<br>`enemies_and_walkers_candidate_13`<br>108×81 px | **enemy-bat**<br>`enemies_and_walkers_candidate_14`<br>116×61 px | **walker-ladybug**<br>`enemies_and_walkers_candidate_17`<br>93×59 px |   |

### REJECTED — excluded from this batch

| Asset ID | Semantic name | Reason |
|---|---|---|
| `enemies_and_walkers_candidate_01` | label-enemies-walkers | Extraction false positive: this is the "Enemies & Walkers" header label (bbox 221x37), not a creature asset. Discard. |
| `enemies_and_walkers_candidate_15` | frog | Valid frog illustration but no Explorer runtime consumer: not in the enemy/walker world roster (guide 7: do not map objects with no consumer). Out of Explorer scope. |
| `enemies_and_walkers_candidate_16` | snail | Valid snail illustration but no Explorer runtime consumer: not in the enemy/walker world roster. Out of Explorer scope. |

## 6. Review notes — READY FOR REVIEW candidates

| Semantic name | Asset ID | Bbox (x,y,w,h) | Review note |
|---|---|---|---|
| enemy-oni | `enemies_and_walkers_candidate_02` | 401,390,88,97 | Complete oni (red demon, horns). Japan pipe enemy. Friendly rounded silhouette per style bible. |
| enemy-snake | `enemies_and_walkers_candidate_03` | 275,397,103,80 | Complete snake (green, friendly, curled). Savanna pipe enemy. |
| enemy-piranha | `enemies_and_walkers_candidate_04` | 160,406,102,71 | Complete fish (orange, friendly). Water pipe enemy (piranha). Not scary; readable at small size. |
| enemy-mole | `enemies_and_walkers_candidate_05` | 26,408,111,76 | Complete mole (brown, digging pose). Underground pipe enemy. |
| walker-bee | `enemies_and_walkers_candidate_06` | 36,496,82,71 | Complete bee (yellow/black stripes, wings). Summer walker. |
| walker-hedgehog | `enemies_and_walkers_candidate_07` | 152,496,112,74 | Complete hedgehog (spines, friendly). Autumn walker. |
| walker-worm | `enemies_and_walkers_candidate_08` | 280,506,101,51 | Complete worm (pink, segmented). Underground walker. |
| walker-spider | `enemies_and_walkers_candidate_09` | 403,506,105,59 | Complete spider (brown, friendly, round body). Cave walker. |
| walker-snowman | `enemies_and_walkers_candidate_10` | 164,576,94,105 | Complete snowman (top hat). Winter walker. NOTE: snowman.webp already approved+reused; this is an alternate candidate — do NOT replace without explicit approval (guide 4.1/8.4). |
| enemy-penguin | `enemies_and_walkers_candidate_11` | 287,578,73,90 | Complete penguin. Northpole pipe enemy. NOTE: penguin.webp already approved+reused; alternate candidate only. |
| walker-crab | `enemies_and_walkers_candidate_12` | 25,580,113,80 | Complete crab (orange). Water walker. NOTE: animal-crab.webp already approved+reused; alternate candidate only. |
| walker-seal | `enemies_and_walkers_candidate_13` | 385,587,108,81 | Complete seal (grey/white). Northpole walker. Procedural currently; candidate for integration. |
| enemy-bat | `enemies_and_walkers_candidate_14` | 23,675,116,61 | Complete bat (purple, wings spread). Cave pipe enemy. NOTE: bat.webp already approved+reused; alternate candidate only. |
| walker-ladybug | `enemies_and_walkers_candidate_17` | 290,683,93,59 | Complete ladybug (red with spots). Spring walker. NOTE: animal-ladybug.webp exists but is CANDIDATE-only and unused; this atlas ladybug is an alternate candidate. |

## 7. Approval request (guide §9 protocol)

Please approve **per exact candidate** (semantic name / asset ID above). A general "looks good" is not per-asset approval. Conditions or rejects can be named per item. Alternates to already-approved reused art are marked in §6 — approving an alternate does NOT authorize replacing existing approved art without a separate explicit decision.

**Approved by:** project owner (radmanmilos), via OpenCode session — **Date:** 2026-11-09 — **Conditions/decisions per candidate:**
- **APPROVED, no conditions (12):** `enemy-oni` (02), `enemy-snake` (03), `enemy-piranha` (04), `enemy-mole` (05), `walker-bee` (06), `walker-hedgehog` (07), `walker-worm` (08), `walker-spider` (09), `enemy-penguin` (11), `walker-crab` (12), `walker-seal` (13), `enemy-bat` (14) — owner reply "rest are approved" on 2026-11-09 after reviewing this batch; approval covers the exact cropped images as extracted (no edits applied).
- `walker-snowman` (10): **NEEDS WORK** — owner 2026-11-09: only one arm, a pile of snow beside him, and part of the frog head is included in the cutout (crop contamination). Recrop/cleanup required; the fixed version re-enters approval.
- `walker-ladybug` (17): **NEEDS WORK** — owner 2026-11-09: the eyes drawn on the shell are not correct. Fix required; the fixed version re-enters approval.
- `frog` (15): **REJECTED** — Gate 1 (no Explorer consumer) plus owner's added reasons 2026-11-09: eyes are not correct and there are leaves around it.
- `snail` (16): **REJECTED** — Gate 1 (no Explorer consumer) plus owner's added reasons 2026-11-09: head is too small and it has no antennas.
- header label (01): **REJECTED** (Gate 1 extraction false positive; not presented for approval).

---
_Generated by `tools/.cache/gen_batch.js` from `REVIEW/TABLE_OF_CONTENT.csv` (task 432)._
