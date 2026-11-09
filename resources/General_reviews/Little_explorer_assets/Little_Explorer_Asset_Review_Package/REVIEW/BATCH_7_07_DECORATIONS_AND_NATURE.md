# Gate 2 approval batch 7 — Decorations and nature

- **Date prepared:** 2026-11-08
- **Package:** `resources/General_reviews/Little_explorer_assets/Little_Explorer_Asset_Review_Package/`
- **Source:** `00_SOURCE_ATLASES/Watercolor Platformer Game Asset Atlas-1.png` (crop geometry unchanged since extraction; leftover-neighbor-bit cleanup applied 2026-11-09 — deterministic non-main component drop on 14 files + guarded region erase on 07/08/11 fused fragments; originals SHA256-backed in `%TEMP%\opencode\decor_orig_backup\`).
- **Status:** FINAL 2026-11-09 — 15 APPROVED (02–16, owner conditional on cutout cleanup — executed and verified same day); 0 NEEDS WORK; 1 REJECTED (01 header label).
- **Controlling style reference:** `resources/General_reviews/Asset_Generation/STYLE_BIBLE.md` + `EXPLORER_STYLE_ADDENDUM.md` (note: both are still "Proposed — Gate 1 acceptance pending"; approving this batch does not waive that pending acceptance).

## 1. Batch contents

| Status | Count | Meaning |
|---|---:|---|
| APPROVED | 15 | owner-approved 2026-11-09, cutout cleanup condition executed + verified |
| READY FOR REVIEW | 0 | none — all reviewed 2026-11-09 |
| NEEDS WORK | 0 | none |
| REJECTED | 1 | excluded — reasons in §5 (01) |

## 2. Consumer and world mapping (EXPLORER_MAPPING.md)

| Entity | Call-site | Mapped asset | Treatment |
|---|---|---|---|
| Scene decor | `drawDecor(t)`, `kitty-standalone.js:1501` — particle-only ambient effects today | — | No direct static-prop consumer; approving these is art-only. Any static decor placement (bushes, trees, fence, lantern, signpost, stump) is a Gate 3 mapping decision with no gameplay effect |
| Possible future props | none assigned | `decor-<type>` | Set dressing only: no collision, no trigger, no gameplay binding |

Gate 1 hints: pine tree -> winter/northpole/cave edges; stone lantern (tōrō) -> japan; fence/signpost -> spring/village; bushes/berries -> general green worlds (spring/summer/autumn); mushroom cluster -> cave/underground; stump -> autumn forest. Bush variants 03/07/08/09 are near-duplicates of 04/10 — owner may approve all as a variant set or thin them out. Gate 2 approves the art only; placement/mapping is Gate 3.

## 3. Size check (guide §9: native + in-game)

Native: crops 49-138 px wide x 33-106 px tall (bboxes in table below). In-game: no consumer sizes exist yet (decor is particle-only) — a Gate 3 mapping would propose a draw size; no collision box to preserve.

## 4. Style pre-check vs style bible

Pre-check vs style bible (agent, Gate 1 visual pass): soft watercolor finish, muted palette, rounded organic shapes, no heavy outlines/sticker borders/glow, no faces on ordinary objects. All 15 are complete single objects with clean silhouettes. Owner to re-confirm at native size.

## 5. Labelled contact sheet (click any image for the full-resolution PNG)

| | | | | |
|---|---|---|---|---|
| <img src="../07_DECORATIONS_AND_NATURE/decorations_and_nature_candidate_02.png" width="140" alt="decor-bush-flowers"> | <img src="../07_DECORATIONS_AND_NATURE/decorations_and_nature_candidate_03.png" width="140" alt="decor-bush-berries-yellow"> | <img src="../07_DECORATIONS_AND_NATURE/decorations_and_nature_candidate_04.png" width="140" alt="decor-bush"> | <img src="../07_DECORATIONS_AND_NATURE/decorations_and_nature_candidate_05.png" width="140" alt="decor-rock"> | <img src="../07_DECORATIONS_AND_NATURE/decorations_and_nature_candidate_06.png" width="140" alt="decor-pine-tree"> |
| **decor-bush-flowers**<br>`decorations_and_nature_candidate_02`<br>70×49 px | **decor-bush-berries-yellow**<br>`decorations_and_nature_candidate_03`<br>86×49 px | **decor-bush**<br>`decorations_and_nature_candidate_04`<br>118×136 px | **decor-rock**<br>`decorations_and_nature_candidate_05`<br>77×55 px | **decor-pine-tree**<br>`decorations_and_nature_candidate_06`<br>74×124 px |
| <img src="../07_DECORATIONS_AND_NATURE/decorations_and_nature_candidate_07.png" width="140" alt="decor-bush-small"> | <img src="../07_DECORATIONS_AND_NATURE/decorations_and_nature_candidate_08.png" width="140" alt="decor-bush-berries-orange"> | <img src="../07_DECORATIONS_AND_NATURE/decorations_and_nature_candidate_09.png" width="140" alt="decor-bush-berries-orange-b"> | <img src="../07_DECORATIONS_AND_NATURE/decorations_and_nature_candidate_10.png" width="140" alt="decor-bush-berries-blue"> | <img src="../07_DECORATIONS_AND_NATURE/decorations_and_nature_candidate_11.png" width="140" alt="decor-lamp-stone"> |
| **decor-bush-small**<br>`decorations_and_nature_candidate_07`<br>51×41 px | **decor-bush-berries-orange**<br>`decorations_and_nature_candidate_08`<br>64×38 px | **decor-bush-berries-orange-b**<br>`decorations_and_nature_candidate_09`<br>51×40 px | **decor-bush-berries-blue**<br>`decorations_and_nature_candidate_10`<br>49×33 px | **decor-lamp-stone**<br>`decorations_and_nature_candidate_11`<br>50×117 px |
| <img src="../07_DECORATIONS_AND_NATURE/decorations_and_nature_candidate_12.png" width="140" alt="decor-fence-wood"> | <img src="../07_DECORATIONS_AND_NATURE/decorations_and_nature_candidate_13.png" width="140" alt="decor-signpost"> | <img src="../07_DECORATIONS_AND_NATURE/decorations_and_nature_candidate_14.png" width="140" alt="decor-mushroom-flowers"> | <img src="../07_DECORATIONS_AND_NATURE/decorations_and_nature_candidate_15.png" width="140" alt="decor-rock-mushroom"> | <img src="../07_DECORATIONS_AND_NATURE/decorations_and_nature_candidate_16.png" width="140" alt="decor-stump"> |
| **decor-fence-wood**<br>`decorations_and_nature_candidate_12`<br>123×55 px | **decor-signpost**<br>`decorations_and_nature_candidate_13`<br>68×96 px | **decor-mushroom-flowers**<br>`decorations_and_nature_candidate_14`<br>108×61 px | **decor-rock-mushroom**<br>`decorations_and_nature_candidate_15`<br>106×56 px | **decor-stump**<br>`decorations_and_nature_candidate_16`<br>138×38 px |

### REJECTED — excluded from this batch

| Asset ID | Semantic name | Reason |
|---|---|---|
| `decorations_and_nature_candidate_01` | label-decorations-nature | Extraction false positive: this is the "Decorations & Details" header label, not an asset. Discard. |

## 6. Review notes — READY FOR REVIEW candidates

| Semantic name | Asset ID | Bbox (x,y,w,h) | Review note |
|---|---|---|---|
| decor-bush-flowers | `decorations_and_nature_candidate_02` | 268,784,70,49 | Complete green bush with pink blossoms. Single object; clean silhouette. NOTE: Explorer drawDecor is particle-only — no direct runtime consumer; static decor stays procedural unless explicitly approved as a new consumer. |
| decor-bush-berries-yellow | `decorations_and_nature_candidate_03` | 342,784,86,49 | Complete bush with yellow berries. Single object. No direct runtime consumer (drawDecor is particle-only). Near-variant of candidates 08/09 — variant check before retaining all. |
| decor-bush | `decorations_and_nature_candidate_04` | 21,789,118,136 | Complete plain round green bush. Single object. No direct runtime consumer (drawDecor particle-only). |
| decor-rock | `decorations_and_nature_candidate_05` | 437,788,77,55 | Complete grey boulder with grass tufts at base. Single object. No direct runtime consumer. Check vs hazards candidate_09 (object-rock) for cross-family duplicate before both retained. |
| decor-pine-tree | `decorations_and_nature_candidate_06` | 136,795,74,124 | Complete pine/fir tree (conifer, brown trunk). Single object; clean silhouette. No direct runtime consumer (drawDecor particle-only). Strong candidate if static scenery is ever approved. |
| decor-bush-small | `decorations_and_nature_candidate_07` | 210,803,51,41 | Complete small light-green bush. Single object. No direct runtime consumer. Near-variant of candidate_04 — variant check. |
| decor-bush-berries-orange | `decorations_and_nature_candidate_08` | 229,842,64,38 | Complete bush with orange berries (round). Single object. No direct runtime consumer. Near-variant of candidates 03/09 — variant check. |
| decor-bush-berries-orange-b | `decorations_and_nature_candidate_09` | 363,843,51,40 | Complete bush with orange berries (wider, yellow-green highlights). Single object. No direct runtime consumer. Near-variant of candidates 03/08 — variant check before all retained. |
| decor-bush-berries-blue | `decorations_and_nature_candidate_10` | 303,845,49,33 | Complete bush with blue/purple berries. Single object. No direct runtime consumer (drawDecor particle-only). |
| decor-lamp-stone | `decorations_and_nature_candidate_11` | 453,879,50,117 | Complete stone lantern/lamp post (grey stone, glowing window, Japanese tōrō style). Single object. No direct runtime consumer. Strong Japan-world candidate if static decor is approved. |
| decor-fence-wood | `decorations_and_nature_candidate_12` | 319,898,123,55 | Complete wooden fence (vertical planks, horizontal rails). Single object; clean edges. No direct runtime consumer. |
| decor-signpost | `decorations_and_nature_candidate_13` | 236,900,68,96 | Complete wooden signpost (two-post frame, blank board). Single object. No direct runtime consumer; could host Serbian text if a sign feature is ever approved. |
| decor-mushroom-flowers | `decorations_and_nature_candidate_14` | 127,935,108,61 | Complete red-capped mushroom with white spots plus pink flowers cluster. Single object. No direct runtime consumer. |
| decor-rock-mushroom | `decorations_and_nature_candidate_15` | 19,940,106,56 | Complete grey rock with grass tuft and small red mushroom. Single object. No direct runtime consumer. Cross-check vs platform-rock (platforms_08) for similarity. |
| decor-stump | `decorations_and_nature_candidate_16` | 307,961,138,38 | Complete tree stump (cut log with roots, grass at base). Single object; clean silhouette. No direct runtime consumer (drawDecor particle-only). |

## 7. Approval request (guide §9 protocol)

Please approve **per exact candidate** (semantic name / asset ID above). A general "looks good" is not per-asset approval. Conditions or rejects can be named per item. Alternates to already-approved reused art are marked in §6 — approving an alternate does NOT authorize replacing existing approved art without a separate explicit decision.

**Approved by:** project owner (radmanmilos), via OpenCode session — **Date:** 2026-11-09 — **Conditions:** owner replied "ok all decors are good, it is fine to have diferent variants of similar thing it will give a nicer look to the sceens a bit of diversity, i approve all it just some items have a bit of leftowers in their catouts so that needs to be cleaned". **APPROVED (15):** `decor-bush-flowers` (02), `decor-bush-berries-yellow` (03), `decor-bush` (04), `decor-rock` (05), `decor-pine-tree` (06), `decor-bush-small` (07), `decor-bush-berries-orange` (08), `decor-bush-berries-orange-b` (09), `decor-bush-berries-blue` (10), `decor-lamp-stone` (11), `decor-fence-wood` (12), `decor-signpost` (13), `decor-mushroom-flowers` (14), `decor-rock-mushroom` (15), `decor-stump` (16). **Condition — cutout cleanup:** executed 2026-11-09, deterministic only (drop all non-main connected components on 14 files; 07 single-component, guarded region erase of the fused bottom-right fragment; 08 top-left green fragment; 11 top-left leaf), originals SHA256-backed before edits; verified all 15 = 1 component, corner alpha ≤3, art intact on visual check. **Variant set:** owner explicitly keeps near-duplicate bushes (03/04/07/08/09/10) for screen diversity — do not thin at Gate 3 without a new decision. Art-only approval: `drawDecor()` `:1501` is particle-only, no static-prop consumer; placement/mapping is Gate 3, no gameplay effect; 05 vs hazards `object-rock` and 15 vs `platform-rock` cross-family checks deferred to Gate 3.

---
_Generated by `tools/.cache/gen_batch.js` from `REVIEW/TABLE_OF_CONTENT.csv` (task 432)._
