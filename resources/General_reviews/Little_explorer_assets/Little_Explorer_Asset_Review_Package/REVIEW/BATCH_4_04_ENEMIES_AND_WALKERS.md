# Gate 2 approval batch 4 — Enemies and walkers

- **Date prepared:** 2026-11-08
- **Package:** `resources/General_reviews/Little_explorer_assets/Little_Explorer_Asset_Review_Package/`
- **Source:** `00_SOURCE_ATLASES/Watercolor Platformer Game Asset Atlas-1.png` (crops unchanged since extraction — no edits applied).
- **Status:** FINAL 2026-11-09 — 16 APPROVED (02–14 as extracted + 10/15/16/17 regenerated via Option C, side-view pose, owner-approved "now all looks good approved"); 0 NEEDS WORK; 1 REJECTED (01 header label). Owner re-opened 15+16 for regeneration on 2026-11-09; all four regenerations approved the same day.
- **Controlling style reference:** `resources/General_reviews/Asset_Generation/STYLE_BIBLE.md` + `EXPLORER_STYLE_ADDENDUM.md` (note: both are still "Proposed — Gate 1 acceptance pending"; approving this batch does not waive that pending acceptance).

## 1. Batch contents

| Status | Count | Meaning |
|---|---:|---|
| APPROVED | 16 | owner-approved 2026-11-09 (12 as extracted, 4 regenerated via Option C) |
| READY FOR REVIEW | 0 | none — all reviewed 2026-11-09 |
| NEEDS WORK | 0 | none — all defects resolved by regeneration and re-approved |
| REJECTED | 1 | excluded — reasons in §5 (01) |

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

Note: candidates 15 (frog) and 16 (snail) were listed here after Gate 1 (no runtime consumer) but were re-opened and regenerated by owner decision on 2026-11-09 — both are now APPROVED, see §7. Their no-consumer note still stands for Gate 3 mapping.

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
- **APPROVED, regenerated side-view versions (4), 2026-11-09, owner reply "now all looks good approved":**
  - `walker-snowman` (10): Option C regeneration (authorized 2026-11-09, "regenerate with cloudflare all 4") — attempt 1 fixed the owner's defects (one arm / snow pile / frog-head contamination) and attempt 2 reposed it in strict SIDE VIEW after the owner required a walking-left pose; cut with `--tol 7` (white-body-vs-paper risk noted by the owner) + grain specks dropped, 1 component. Prompt: `prompts/enemy-candidate-10-snowman.md`.
  - `frog` (15): owner re-opened the Gate 1 rejection for regeneration (eyes not correct, leaves around it), then required strict SIDE VIEW (creatures jump left/right); attempt 2 approved. Prompt: `prompts/enemy-candidate-15-frog.md`. Gate 1's no-runtime-consumer note still stands for Gate 3 mapping.
  - `snail` (16): owner re-opened the Gate 1 rejection for regeneration (head too small, no antennas) and approved attempt 1 ("snail is good") — no side-view rework needed. Prompt: `prompts/enemy-candidate-16-snail.md`. Gate 1's no-runtime-consumer note still stands for Gate 3 mapping.
  - `walker-ladybug` (17): Option C regeneration — shell eyes removed (attempt 1), then strict SIDE VIEW required by the owner (attempt 2 approved). Prompt: `prompts/enemy-candidate-17-ladybug.md`.
  - All four: text-only generation (no subject ref), flux-2-klein-4b, cut out to 512×512 alpha PNG, component check 1 component each, `asset_qa.js` pass, originals backed up SHA256-verified in `%TEMP%\opencode\enemies_orig_backup\` before overwrite. Approving these regenerated versions does NOT authorize replacing already-approved reused art (`snowman.webp` etc.) — that stays a separate Gate 3 decision.
- header label (01): **REJECTED** (Gate 1 extraction false positive; not presented for approval).

---
_Generated by `tools/.cache/gen_batch.js` from `REVIEW/TABLE_OF_CONTENT.csv` (task 432)._
