# Gate 2 approval batch 2 — Platforms

- **Date prepared:** 2026-11-08
- **Package:** `resources/General_reviews/Little_explorer_assets/Little_Explorer_Asset_Review_Package/`
- **Source:** `00_SOURCE_ATLASES/Watercolor Platformer Game Asset Atlas-1.png` (crops unchanged since extraction — no edits applied).
- **Status:** APPROVED 2026-11-08 — 11/11 candidates approved per-asset by the project owner (blanket, no conditions).
- **Controlling style reference:** `resources/General_reviews/Asset_Generation/STYLE_BIBLE.md` + `EXPLORER_STYLE_ADDENDUM.md` (note: both are still "Proposed — Gate 1 acceptance pending"; approving this batch does not waive that pending acceptance).

## 1. Batch contents

| Status | Count | Meaning |
|---|---:|---|
| READY FOR REVIEW | 11 | complete, clean, candidate for approval |
| NEEDS WORK | 0 | excluded from approval until recropped/cleaned |
| REJECTED | 0 | excluded — reasons in §5 |

## 2. Consumer and world mapping (EXPLORER_MAPPING.md)

| Entity | Call-site | Mapped asset | Treatment |
|---|---|---|---|
| Float platforms (26 px) | `draw()` static platforms, `kitty-standalone.js:1671` + mapping `:1009` | `platform-<world>` | Transparent glyph; geometry/collision unchanged |
| Moving platforms (22 px) | `draw()` moving platforms `:1683`, creation `:1036` | `platform-<world>` | Transparent glyph; motion + collision unchanged |
| Bridges / crate / spring (no entity) | — | — | No direct Explorer consumer; approve only as optional set dressing with a separately approved consumer |

All 11 worlds: float/moving platform colours are per-world theme today (`f.color`, `m.color`); the glyph would carry the world material. No world-specific exclusions found.

## 3. Size check (guide §9: native + in-game)

Native: 11 crops 82–138 px wide, 59–68 px tall (bboxes in table below). In-game: floats 26 px tall (`:1009`), moving platforms 22 px tall (`:1037`) — a painted platform glyph is taller than the current band, so the pilot must confirm display height vs unchanged collision box (guide: silhouette must not imply a changed collision area). Exact sizing decided at Gate 4.

## 4. Style pre-check vs style bible

Pre-check vs style bible (agent, Gate 1 visual pass): soft watercolor finish ✓; warm muted palette ✓; rounded organic silhouettes ✓; no heavy outlines / sticker borders / glow ✓; no unnecessary faces ✓; platform tops visually distinct from terrain family ✓ (guide 8.3). Owner to re-confirm at native + in-game size.

## 5. Labelled contact sheet (click any image for the full-resolution PNG)

| | | | | |
|---|---|---|---|---|
| <img src="../02_PLATFORMS/platforms_candidate_01.png" width="140" alt="platform-grass-float-a"> | <img src="../02_PLATFORMS/platforms_candidate_02.png" width="140" alt="platform-grass-float-b"> | <img src="../02_PLATFORMS/platforms_candidate_03.png" width="140" alt="platform-wood-log-bridge"> | <img src="../02_PLATFORMS/platforms_candidate_04.png" width="140" alt="platform-grass-long"> | <img src="../02_PLATFORMS/platforms_candidate_05.png" width="140" alt="platform-stone-grass"> |
| **platform-grass-float-a**<br>`platforms_candidate_01`<br>138×59 px | **platform-grass-float-b**<br>`platforms_candidate_02`<br>82×68 px | **platform-wood-log-bridge**<br>`platforms_candidate_03`<br>150×66 px | **platform-grass-long**<br>`platforms_candidate_04`<br>147×62 px | **platform-stone-grass**<br>`platforms_candidate_05`<br>116×49 px |
| <img src="../02_PLATFORMS/platforms_candidate_06.png" width="140" alt="platform-stone"> | <img src="../02_PLATFORMS/platforms_candidate_07.png" width="140" alt="platform-wood-plank-bridge"> | <img src="../02_PLATFORMS/platforms_candidate_08.png" width="140" alt="platform-rock"> | <img src="../02_PLATFORMS/platforms_candidate_09.png" width="140" alt="platform-spring"> | <img src="../02_PLATFORMS/platforms_candidate_10.png" width="140" alt="platform-grass-bush"> |
| **platform-stone**<br>`platforms_candidate_06`<br>106×55 px | **platform-wood-plank-bridge**<br>`platforms_candidate_07`<br>137×52 px | **platform-rock**<br>`platforms_candidate_08`<br>152×57 px | **platform-spring**<br>`platforms_candidate_09`<br>72×67 px | **platform-grass-bush**<br>`platforms_candidate_10`<br>77×58 px |
| <img src="../02_PLATFORMS/platforms_candidate_11.png" width="140" alt="platform-crate"> |
| **platform-crate**<br>`platforms_candidate_11`<br>55×54 px |   |   |   |   |

## 6. Review notes — READY FOR REVIEW candidates

| Semantic name | Asset ID | Bbox (x,y,w,h) | Review note |
|---|---|---|---|
| platform-grass-float-a | `platforms_candidate_01` | 631,59,138,59 | Complete grass-topped floating platform (round, grass top + stone/dirt bottom). Single object; clean silhouette. |
| platform-grass-float-b | `platforms_candidate_02` | 960,127,82,68 | Complete grass-topped platform (smaller round). Single object; clean silhouette. |
| platform-wood-log-bridge | `platforms_candidate_03` | 793,132,150,66 | Complete wooden log bridge (horizontal log with end posts). Single object. |
| platform-grass-long | `platforms_candidate_04` | 630,139,147,62 | Complete grass platform (long, grass top + dirt/stone base). Single object; wider variant. |
| platform-stone-grass | `platforms_candidate_05` | 802,211,116,49 | Complete stone platform with grass top (grey stone base). Single object. |
| platform-stone | `platforms_candidate_06` | 939,211,106,55 | Complete stone platform (grey stone, no grass, small feet). Single object. |
| platform-wood-plank-bridge | `platforms_candidate_07` | 639,218,137,52 | Complete wooden plank bridge with posts. Single object. |
| platform-rock | `platforms_candidate_08` | 725,280,152,57 | Complete rock/boulder platform (grey boulders with grass tufts). Single object. |
| platform-spring | `platforms_candidate_09` | 895,282,72,67 | Complete spring/bouncy platform (wooden disc on metal spring). Single object; functional read clear. |
| platform-grass-bush | `platforms_candidate_10` | 626,285,77,58 | Complete grass-topped platform with bush underneath. Single object. |
| platform-crate | `platforms_candidate_11` | 999,285,55,54 | Complete wooden crate/box (X pattern, corner studs). Single object. |

## 7. Approval request (guide §9 protocol)

Please approve **per exact candidate** (semantic name / asset ID above). A general "looks good" is not per-asset approval. Conditions or rejects can be named per item. Alternates to already-approved reused art are marked in §6 — approving an alternate does NOT authorize replacing existing approved art without a separate explicit decision.

**Approved by:** project owner (radmanmilos), via OpenCode session — **Date:** 2026-11-08 — **Conditions:** none (blanket approval of all 11 candidates in this batch). Recorded in `TABLE_OF_CONTENT.csv` `approval_evidence` for each row. Note: approval covers the art only — bridges/crate/spring still have no approved runtime consumer (Gate 3 decides mapping).

---
_Generated by `tools/.cache/gen_batch.js` from `REVIEW/TABLE_OF_CONTENT.csv` (task 432)._
