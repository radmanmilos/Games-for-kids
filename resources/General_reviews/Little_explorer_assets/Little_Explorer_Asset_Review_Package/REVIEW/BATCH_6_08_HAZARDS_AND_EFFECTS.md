# Gate 2 approval batch 6 — Hazards and effects

- **Date prepared:** 2026-11-08
- **Package:** `resources/General_reviews/Little_explorer_assets/Little_Explorer_Asset_Review_Package/`
- **Source:** `00_SOURCE_ATLASES/Watercolor Platformer Game Asset Atlas-1.png` (crops unchanged since extraction — no edits applied).
- **Status:** FINAL 2026-11-09 — 10 APPROVED (02–09, 11, 12 — owner accepted the §6 notes as conditions); 0 NEEDS WORK; 2 REJECTED (01 header label, 10 duplicate of platforms 09).
- **Controlling style reference:** `resources/General_reviews/Asset_Generation/STYLE_BIBLE.md` + `EXPLORER_STYLE_ADDENDUM.md` (note: both are still "Proposed — Gate 1 acceptance pending"; approving this batch does not waive that pending acceptance).

## 1. Batch contents

| Status | Count | Meaning |
|---|---:|---|
| APPROVED | 10 | owner-approved 2026-11-09 with the §6 notes as conditions |
| READY FOR REVIEW | 0 | none — all reviewed 2026-11-09 |
| NEEDS WORK | 0 | none |
| REJECTED | 2 | excluded — reasons in §5 (01, 10) |

## 2. Consumer and world mapping (EXPLORER_MAPPING.md)

| Entity | Call-site | Mapped asset | Treatment |
|---|---|---|
| Pit hazards (spikes / lava / water) | `drawPitHazards()`, `kitty-standalone.js:1545`; per-level `theme.pitHazard` (spikes: 6 worlds, lava: underground+cave) | currently PROCEDURAL (canvas fills `:1556/:1573/:1595`) | Plan 8.6 keeps simple dynamic hazards procedural; any glyph use (e.g. hazard-spikes 06 as a pit overlay, hazard-flame 03 as a lava accent) is an optional decorative overlay decided at Gate 3 with collision untouched |
| Barrel / rock / rock-pile / cloud / tornado / thorn-vine / spiked-ball / ice-crystal | no entity call-site | — | No direct Explorer consumer; approve only as art with any consumer mapped separately at Gate 3 |

Spikes pit hazard is used by autumn/winter/water/savanna/northpole/egypt; lava by underground/cave. Candidate 06 (spike strip) matches the spike worlds, 03 (flame) the lava worlds as an optional accent. Rest are decor/effect art with no world binding. Gate 2 approves the art only; any overlay mapping is Gate 3.

## 3. Size check (guide §9: native + in-game)

Native: crops 32-115 px in the CSV bboxes (see table). In-game: pit hazards fill the gap from groundY to canvas bottom (variable width); today they are drawn procedurally, so a glyph overlay would be sized at Gate 4 pilot — no collision change either way.

## 4. Style pre-check vs style bible

Pre-check vs style bible (agent, Gate 1 visual pass): soft watercolor finish, muted palette, rounded organic shapes, no heavy outlines/sticker borders/glow. Hazard subjects stay soft and child-friendly (no gory or sharp-scary treatment). NOTE: these read as hazards/effects but most have NO runtime consumer today (plan 8.6 keeps them procedural) — approval is of the art only.

## 5. Labelled contact sheet (click any image for the full-resolution PNG)

| | | | | |
|---|---|---|---|---|
| <img src="../08_HAZARDS_AND_EFFECTS/hazards_and_effects_candidate_02.png" width="140" alt="hazard-ice-crystal"> | <img src="../08_HAZARDS_AND_EFFECTS/hazards_and_effects_candidate_03.png" width="140" alt="hazard-flame"> | <img src="../08_HAZARDS_AND_EFFECTS/hazards_and_effects_candidate_04.png" width="140" alt="object-barrel"> | <img src="../08_HAZARDS_AND_EFFECTS/hazards_and_effects_candidate_05.png" width="140" alt="hazard-spiked-ball"> | <img src="../08_HAZARDS_AND_EFFECTS/hazards_and_effects_candidate_06.png" width="140" alt="hazard-spikes"> |
| **hazard-ice-crystal**<br>`hazards_and_effects_candidate_02`<br>70×98 px | **hazard-flame**<br>`hazards_and_effects_candidate_03`<br>61×87 px | **object-barrel**<br>`hazards_and_effects_candidate_04`<br>66×80 px | **hazard-spiked-ball**<br>`hazards_and_effects_candidate_05`<br>64×69 px | **hazard-spikes**<br>`hazards_and_effects_candidate_06`<br>87×58 px |
| <img src="../08_HAZARDS_AND_EFFECTS/hazards_and_effects_candidate_07.png" width="140" alt="hazard-thorn-vine"> | <img src="../08_HAZARDS_AND_EFFECTS/hazards_and_effects_candidate_08.png" width="140" alt="effect-tornado"> | <img src="../08_HAZARDS_AND_EFFECTS/hazards_and_effects_candidate_09.png" width="140" alt="object-rock"> | <img src="../08_HAZARDS_AND_EFFECTS/hazards_and_effects_candidate_11.png" width="140" alt="effect-cloud"> | <img src="../08_HAZARDS_AND_EFFECTS/hazards_and_effects_candidate_12.png" width="140" alt="object-rock-pile"> |
| **hazard-thorn-vine**<br>`hazards_and_effects_candidate_07`<br>71×115 px | **effect-tornado**<br>`hazards_and_effects_candidate_08`<br>82×103 px | **object-rock**<br>`hazards_and_effects_candidate_09`<br>29×32 px | **effect-cloud**<br>`hazards_and_effects_candidate_11`<br>81×70 px | **object-rock-pile**<br>`hazards_and_effects_candidate_12`<br>73×58 px |

### REJECTED — excluded from this batch

| Asset ID | Semantic name | Reason |
|---|---|---|
| `hazards_and_effects_candidate_01` | label-hazards-effects | Extraction false positive: this is the "Hazards & Effects" header label (bbox 189x35), not an asset. Discard. |
| `hazards_and_effects_candidate_10` | duplicate-platform-spring | Duplicate of platforms_candidate_09 (platform-spring): identical spring/jack platform. Keep the platforms-family copy; discard this hazards copy to avoid two runtime candidates for one asset. |

## 6. Review notes — READY FOR REVIEW candidates

| Semantic name | Asset ID | Bbox (x,y,w,h) | Review note |
|---|---|---|---|
| hazard-ice-crystal | `hazards_and_effects_candidate_02` | 831,774,70,98 | Complete ice/crystal cluster. Plausible themed hazard accent. No direct Explorer pit-hazard consumer (pit hazards remain procedural per plan 8.6); runtime_consumer empty pending approval as decorative accent. |
| hazard-flame | `hazards_and_effects_candidate_03` | 759,783,61,87 | Complete flame. Closest candidate for an optional lava-pit accent (underground/cave). Pit hazards remain procedural; any use is a decorative overlay only — must not disguise collision boundary (guide 8.7). |
| object-barrel | `hazards_and_effects_candidate_04` | 681,789,66,80 | Complete wooden barrel. No direct Explorer consumer (not a pit hazard, walker, or goal). Possible decor/obstacle only if explicitly approved. |
| hazard-spiked-ball | `hazards_and_effects_candidate_05` | 616,799,64,69 | Complete spiked ball/mace. Alternate spike-hazard read. No direct Explorer consumer; pit hazards procedural. |
| hazard-spikes | `hazards_and_effects_candidate_06` | 529,819,87,58 | Complete spike strip (row of spikes on base). Closest match to Explorer spike pit hazard (autumn/winter/water/savanna/northpole/egypt). Pit collision stays procedural; use only as approved decorative accent that does not disguise the active region. |
| hazard-thorn-vine | `hazards_and_effects_candidate_07` | 601,885,71,115 | Complete green thorny vine. Alternate hazard read. No direct Explorer consumer; pit hazards procedural. |
| effect-tornado | `hazards_and_effects_candidate_08` | 764,892,82,103 | Complete tornado/water-spout swirl. Effect, not a pit hazard. No direct Explorer consumer; simple dynamic effects remain procedural (plan 8.6). |
| object-rock | `hazards_and_effects_candidate_09` | 870,906,29,32 | Complete small rock. Decor only. No direct Explorer consumer; repeated low-detail decor remains procedural (plan 8.6). |
| effect-cloud | `hazards_and_effects_candidate_11` | 680,909,81,70 | Complete puffy cloud. Decor/effect. No direct Explorer consumer; clouds are procedural in the scene layer (plan 8.6). |
| object-rock-pile | `hazards_and_effects_candidate_12` | 835,938,73,58 | Complete rock/boulder pile. Decor only. No direct Explorer consumer; repeated low-detail decor remains procedural (plan 8.6). |

## 7. Approval request (guide §9 protocol)

Please approve **per exact candidate** (semantic name / asset ID above). A general "looks good" is not per-asset approval. Conditions or rejects can be named per item. Alternates to already-approved reused art are marked in §6 — approving an alternate does NOT authorize replacing existing approved art without a separate explicit decision.

**Approved by:** project owner (radmanmilos), via OpenCode session — **Date:** 2026-11-09 — **Conditions:** owner replied "i agree with your notes and approve the batch 6" — the §6 per-candidate notes are accepted as the approval conditions, item by item: **APPROVED (10):** `hazard-ice-crystal` (02, art only, no consumer), `hazard-flame` (03, optional lava-pit accent — Gate 3), `object-barrel` (04, art only; decor/obstacle use only via explicit Gate 3 decision), `hazard-spiked-ball` (05, alternate spike read), `hazard-spikes` (06, closest match to the spike pit hazard — leading Gate 3 overlay candidate), `hazard-thorn-vine` (07, alternate hazard read), `effect-tornado` (08, effects stay procedural), `object-rock` (09, decor only), `effect-cloud` (11, clouds procedural), `object-rock-pile` (12, decor only). Art-only approval: no consumer is mapped by this batch; pit hazards stay procedural (`drawPitHazards()` `:1545`), collision untouched; any glyph overlay is a Gate 3 decision.

---
_Generated by `tools/.cache/gen_batch.js` from `REVIEW/TABLE_OF_CONTENT.csv` (task 432)._
