# Gate 2 approval batch 5 — Goals and structures

- **Date prepared:** 2026-11-08
- **Package:** `resources/General_reviews/Little_explorer_assets/Little_Explorer_Asset_Review_Package/`
- **Source:** `00_SOURCE_ATLASES/Watercolor Platformer Game Asset Atlas-1.png` (crops unchanged since extraction — no edits applied).
- **Status:** FINAL 2026-11-09 — 4 APPROVED (02/03/04 with owner condition "point to the left" — horizontally mirrored and verified; 05 as extracted); 0 NEEDS WORK; 1 REJECTED (01 header label).
- **Controlling style reference:** `resources/General_reviews/Asset_Generation/STYLE_BIBLE.md` + `EXPLORER_STYLE_ADDENDUM.md` (note: both are still "Proposed — Gate 1 acceptance pending"; approving this batch does not waive that pending acceptance).

## 1. Batch contents

| Status | Count | Meaning |
|---|---:|---|
| APPROVED | 4 | owner-approved 2026-11-09 (02/03/04 flipped left per condition; 05 as extracted) |
| READY FOR REVIEW | 0 | none — all reviewed 2026-11-09 |
| NEEDS WORK | 0 | none |
| REJECTED | 1 | excluded — reasons in §5 (01) |

## 2. Consumer and world mapping (EXPLORER_MAPPING.md)

| Entity | Call-site | Mapped asset | Treatment |
|---|---|---|---|
| Goal building (win trigger) | `drawGoal(theme.goal, goal)` call `kitty-standalone.js:1757`, definition `:2303`; trigger box 220x220 created `:1043`, win check `:1422` | `goal-<type>` | Transparent glyph inside the unchanged 220x220 trigger region; trigger logic untouched |
| Spring pilot house | `drawExplorerArt()` reuse of approved house.webp, `:2306-2307` | approved `house.webp` | Existing approved art; goal-house (04) is an ALTERNATE - no replacement without a separate explicit decision |

Per level definitions: house (spring/summer/autumn/winter), mine (underground), cave (cave), submarine (water), hut (savanna), torii (japan), igloo (northpole), pyramid (egypt). Family supplies 4 real candidates: mine -> underground, cave -> cave, house -> alternate to the approved Spring house, torii -> japan. Roster gaps (NOT in atlas): submarine, hut, igloo, pyramid. Gate 2 approves the art only; world mapping is Gate 3.

## 3. Size check (guide §9: native + in-game)

Native: crops 129-152 px wide x 127-148 px tall (bboxes in table below). In-game: goal box is 220x220 px (`:1043`); the glyph is drawn to the box and the win trigger stays exactly `goal.x + 30` (`:1422`) - the silhouette must not imply a changed trigger area.

## 4. Style pre-check vs style bible

Pre-check vs style bible (agent, Gate 1 visual pass): complete entrances/buildings, soft watercolor finish, warm muted palette, rounded organic shapes, no heavy outlines/sticker borders/glow, no faces on ordinary structures. NOTE: goal-house (04) is an alternate to already-approved reused house.webp - approving it does NOT authorize replacement (guide 4.1). Owner to re-confirm at native + in-game size.

## 5. Labelled contact sheet (click any image for the full-resolution PNG)

| | | | | |
|---|---|---|---|---|
| <img src="../06_GOALS_AND_STRUCTURES/goals_and_structures_candidate_02.png" width="140" alt="goal-mine"> | <img src="../06_GOALS_AND_STRUCTURES/goals_and_structures_candidate_03.png" width="140" alt="goal-cave"> | <img src="../06_GOALS_AND_STRUCTURES/goals_and_structures_candidate_04.png" width="140" alt="goal-house"> | <img src="../06_GOALS_AND_STRUCTURES/goals_and_structures_candidate_05.png" width="140" alt="goal-torii"> |
| **goal-mine**<br>`goals_and_structures_candidate_02`<br>152×142 px | **goal-cave**<br>`goals_and_structures_candidate_03`<br>138×131 px | **goal-house**<br>`goals_and_structures_candidate_04`<br>146×127 px | **goal-torii**<br>`goals_and_structures_candidate_05`<br>129×148 px |   |

### REJECTED — excluded from this batch

| Asset ID | Semantic name | Reason |
|---|---|---|
| `goals_and_structures_candidate_01` | label-goal-structures | Extraction false positive: this is the "Goal Structures" header label (bbox 186x36), not a structure asset. Discard. |

## 6. Review notes — READY FOR REVIEW candidates

| Semantic name | Asset ID | Bbox (x,y,w,h) | Review note |
|---|---|---|---|
| goal-mine | `goals_and_structures_candidate_02` | 839,405,152,142 | Complete mine entrance (rocky hill, wooden supports, mine tracks/cart). Underground goal. Trigger region must remain unchanged at integration. |
| goal-cave | `goals_and_structures_candidate_03` | 693,417,138,131 | Complete cave entrance (rocky hill, dark opening, plant). Cave goal. |
| goal-house | `goals_and_structures_candidate_04` | 541,419,146,127 | Complete house (cream walls, red roof, chimney). Seasonal house goal (spring/summer/autumn/winter). NOTE: house.webp already approved+reused for Spring; this is an alternate candidate — do NOT replace without explicit approval. |
| goal-torii | `goals_and_structures_candidate_05` | 542,561,129,148 | Complete torii gate (red, stone bases). Japan goal. |

## 7. Approval request (guide §9 protocol)

Please approve **per exact candidate** (semantic name / asset ID above). A general "looks good" is not per-asset approval. Conditions or rejects can be named per item. Alternates to already-approved reused art are marked in §6 — approving an alternate does NOT authorize replacing existing approved art without a separate explicit decision.

**Approved by:** project owner (radmanmilos), via OpenCode session — **Date:** 2026-11-09 — **Conditions/decisions per candidate:**
- **APPROVED, condition met (3):** `goal-mine` (02), `goal-cave` (03), `goal-house` (04) — owner reply "all 4 goals are good, i approve them, only the candidates 02,03,04 need to point to the left (just a simple flip will do it)". Horizontal mirror applied to each with `tools/.cache/flip_goals.ps1` (deterministic pixel-exact mirror of the original; verified by mirroring the SHA256-backed-up original in memory and hash-comparing — exact match on all 3; originals in `%TEMP%\opencode\goals_orig_backup\`), `asset_qa.js` pass in place. Approval covers the flipped versions.
- **APPROVED, no conditions (1):** `goal-torii` (05) — extracted crop unchanged.
- Notes: `goal-house` (04) is an ALTERNATE to approved+reused `house.webp` — approval does NOT authorize replacement (guide 4.1/8.4), stays a separate Gate 3 decision.

---
_Generated by `tools/.cache/gen_batch.js` from `REVIEW/TABLE_OF_CONTENT.csv` (task 432)._
