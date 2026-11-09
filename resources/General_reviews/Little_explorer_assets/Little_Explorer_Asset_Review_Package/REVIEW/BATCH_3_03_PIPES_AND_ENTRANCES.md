# Gate 2 approval batch 3 — Pipes and entrances

- **Date prepared:** 2026-11-08
- **Package:** `resources/General_reviews/Little_explorer_assets/Little_Explorer_Asset_Review_Package/`
- **Source:** `00_SOURCE_ATLASES/Watercolor Platformer Game Asset Atlas-1.png` (crops unchanged since extraction — exception: candidate 01 was replaced on 2026-11-08 by an owner-approved regenerated version; original backed up to `%TEMP%\opencode\pipes_orig_backup\`, SHA256-verified before overwrite).
- **Status:** MIXED 2026-11-08/09 — 6 APPROVED (`pipe-stone` 01, `pipe-vine` 02, `pipe-sandstone` 05 and `pipe-mushroom` 07 regenerated versions, `pipe-green` 03, `pipe-ice` 06); 1 REJECTED (`pipe-barrel` 04 — does not follow pipe style/design); 1 NEEDS WORK (08 — owner requires the side opening removed, hole on top only; targeted regeneration via Option C, one candidate at a time, awaiting owner review).
- **Controlling style reference:** `resources/General_reviews/Asset_Generation/STYLE_BIBLE.md` + `EXPLORER_STYLE_ADDENDUM.md` (note: both are still "Proposed — Gate 1 acceptance pending"; approving this batch does not waive that pending acceptance).

## 1. Batch contents

| Status | Count | Meaning |
|---|---:|---|
| APPROVED | 6 | owner-approved per candidate (01 + 02 + 05 + 07 regenerated versions, 03, 06) |
| NEEDS WORK | 1 | excluded until the side-opening removal is regenerated and re-approved (08) |
| REJECTED | 1 | excluded — reason in §7 (04) |

## 2. Consumer and world mapping (EXPLORER_MAPPING.md)

| Entity | Call-site | Mapped asset | Treatment |
|---|---|---|---|
| Pipe entrances | `draw()` themed pipes, `kitty-standalone.js:1694`, creation `:1041` | `pipe-<world>` | Transparent glyph; collision box (60 px wide x `p.h`) unchanged |
| Enemy pop-out clip | `:1713` clips enemy to pipe mouth | — | Glyph must keep the mouth position readable so emergence stays visible |

8 candidates for 11 worlds — per-world assignment proposed at Gate 3 (Gate 1 material hints: stone -> cave/underground; vine -> savanna/jungle; green -> classic/spring-summer-autumn; barrel -> water; sandstone -> egypt; ice -> winter/northpole; mushroom -> cave/underground; terracotta -> savanna). Gate 2 approves the art only; the mapping decision is Gate 3.

## 3. Size check (guide §9: native + in-game)

Native: 4 crops ~90-119 px wide x ~114-116 px tall (bboxes in table below); candidates 01, 02, 05 and 07 are now 512×512 regenerated glyphs (approved versions). In-game: pipe body 60 px wide (`:1041`), height `p.h` per level, 24 px rim overhang (`:1701`). The glyph is drawn to the existing box; silhouette must not imply a changed collision area (guide 8.5).

## 4. Style pre-check vs style bible

Pre-check vs style bible (agent, Gate 1 visual pass): complete themed entrances, soft watercolor finish, warm muted palette, rounded organic shapes, no heavy outlines/sticker borders/glow, no faces on ordinary objects. Owner to re-confirm at native + in-game size.

## 5. Labelled contact sheet (click any image for the full-resolution PNG)

| | | | | |
|---|---|---|---|---|
| <img src="../03_PIPES_AND_ENTRANCES/pipes_and_entrances_candidate_01.png" width="140" alt="pipe-stone"> | <img src="../03_PIPES_AND_ENTRANCES/pipes_and_entrances_candidate_02.png" width="140" alt="pipe-vine"> | <img src="../03_PIPES_AND_ENTRANCES/pipes_and_entrances_candidate_03.png" width="140" alt="pipe-green"> | <img src="../03_PIPES_AND_ENTRANCES/pipes_and_entrances_candidate_04.png" width="140" alt="pipe-barrel"> | <img src="../03_PIPES_AND_ENTRANCES/pipes_and_entrances_candidate_05.png" width="140" alt="pipe-sandstone"> |
| **pipe-stone**<br>`pipes_and_entrances_candidate_01`<br>512×512 px (regenerated, approved) | **pipe-vine**<br>`pipes_and_entrances_candidate_02`<br>512×512 px (regenerated, approved) | **pipe-green**<br>`pipes_and_entrances_candidate_03`<br>91×106 px | **pipe-barrel**<br>`pipes_and_entrances_candidate_04`<br>107×104 px | **pipe-sandstone**<br>`pipes_and_entrances_candidate_05`<br>512×512 px (regenerated, approved) |
| <img src="../03_PIPES_AND_ENTRANCES/pipes_and_entrances_candidate_06.png" width="140" alt="pipe-ice"> | <img src="../03_PIPES_AND_ENTRANCES/pipes_and_entrances_candidate_07.png" width="140" alt="pipe-mushroom"> | <img src="../03_PIPES_AND_ENTRANCES/pipes_and_entrances_candidate_08.png" width="140" alt="pipe-terracotta"> |
| **pipe-ice**<br>`pipes_and_entrances_candidate_06`<br>95×114 px | **pipe-mushroom**<br>`pipes_and_entrances_candidate_07`<br>512×512 px (regenerated, approved) | **pipe-terracotta**<br>`pipes_and_entrances_candidate_08`<br>106×116 px |   |   |

## 6. Review notes — READY FOR REVIEW candidates

| Semantic name | Asset ID | Bbox (x,y,w,h) | Review note |
|---|---|---|---|
| pipe-stone | `pipes_and_entrances_candidate_01` | 1191,62,90,106 (original crop) | **APPROVED regenerated version 2026-11-08** — side opening removed, hole on top only; 512×512 alpha PNG generated from `prompts/pipe-candidate-01-stone.md` (original as subject ref) and cut out. Original crop backed up. Cave/underground material. |
| pipe-vine | `pipes_and_entrances_candidate_02` | 1406,62,105,107 (original crop) | **APPROVED regenerated version 2026-11-09** — side opening removed, hole on top only; 512×512 alpha PNG (3 attempts; attempt 3 used approved pipe 01 as structural subject ref; detached artist-signature component removed deterministically, star decoration accepted by owner). Original crop backed up. Jungle/savanna material. |
| pipe-green | `pipes_and_entrances_candidate_03` | 1086,66,91,106 | Complete green pipe (classic pipe with rim, no door). Generic/classic pipe. |
| pipe-barrel | `pipes_and_entrances_candidate_04` | 1292,66,107,104 | Complete wooden barrel entrance (barrel with arched door, leaf sprigs). Water material. |
| pipe-sandstone | `pipes_and_entrances_candidate_05` | 1406,192,109,128 (original crop) | **APPROVED regenerated version 2026-11-09** — side opening removed, hole on top only; 512×512 alpha PNG (attempt 1 used approved pipe 01 as structural subject ref; detached signature-zone fragments removed deterministically, 122 px, per owner's standing option-1 choice). Original crop backed up. Egypt material, leaf sprigs. |
| pipe-ice | `pipes_and_entrances_candidate_06` | 1085,195,95,114 | Complete ice pipe entrance (blue/ice, arched door, snow base). Northpole/winter material. |
| pipe-mushroom | `pipes_and_entrances_candidate_07` | 1193,195,90,114 (original crop) | **APPROVED regenerated version 2026-11-09** — side opening removed, hole on top only; 512×512 alpha PNG (attempt 1 used approved pipe 01 as structural subject ref; component report clean, no signature). Original crop backed up. Cave material — purple mushroom cap with spots, no door. |
| pipe-terracotta | `pipes_and_entrances_candidate_08` | 1295,195,106,116 | Complete terracotta pipe entrance (orange/terracotta, arched door, leaf sprigs). Savanna material. |

## 7. Approval request (guide §9 protocol)

Please approve **per exact candidate** (semantic name / asset ID above). A general "looks good" is not per-asset approval. Conditions or rejects can be named per item. Alternates to already-approved reused art are marked in §6 — approving an alternate does NOT authorize replacing existing approved art without a separate explicit decision.

**Approved by:** project owner (radmanmilos), via OpenCode session — **Date:** 2026-11-08 (01/03/06/04), 2026-11-09 (02, 05, 07) — **Conditions/decisions per candidate:**
- `pipe-stone` (01): **APPROVED** — regenerated version only (side opening removed, top hole only), owner reply "looks good i approve it" on 2026-11-08 after visual review of `tools/.cache/pipe_regen/pipe01_gen1.png`. Approval covers this exact regenerated+cut-out image; the original crop is superseded (backup in `%TEMP%\opencode\pipes_orig_backup\`).
- `pipe-vine` (02): **APPROVED** — regenerated version only, owner reply "approved" on 2026-11-09 after visual review of `tools/.cache/pipe_regen/pipe02_gen3_final.png` (attempt 3; side opening gone, single top hole; detached artist-signature component removed deterministically before approval; the yellow star painted on the body was accepted by the owner). Original crop superseded (backup in `%TEMP%\opencode\pipes_orig_backup\`).
- `pipe-green` (03) and `pipe-ice` (06): **APPROVED**, no conditions.
- `pipe-barrel` (04): **REJECTED** — "does not follow the pipe style nor the expected pipe look and design"; discard as a pipe candidate (art may be reconsidered only as non-pipe decor with separate approval).
- `pipe-sandstone` (05): **APPROVED** — regenerated version only, owner reply "pipe05 approved" on 2026-11-09 after visual review of `tools/.cache/pipe_regen/pipe05_gen1.png` (attempt 1; side opening gone, single top hole, sandstone + leaf sprigs); detached signature-zone fragments removed deterministically before recording, per the owner's standing option-1 choice from pipe 02. Original crop superseded (backup in `%TEMP%\opencode\pipes_orig_backup\`).
- `pipe-mushroom` (07): **APPROVED** — regenerated version only, owner reply "pipe07 approved" on 2026-11-09 after visual review of `tools/.cache/cutout/pipe07_cut.png` (attempt 1; side opening gone, single top hole, purple mushroom cap + cream dots; component report clean — no signature; faint base shadow and two tiny sparkles accepted as part of the approved image). Original crop superseded (backup in `%TEMP%\opencode\pipes_orig_backup\`).
- `pipe-terracotta` (08): **NEEDS WORK** — remove the side opening; the hole must be on top only. Targeted regeneration (Option C, owner-authorized 2026-11-08) proceeds one candidate at a time, output shown to the owner before it replaces the crop. Original backed up to `%TEMP%\opencode\pipes_orig_backup\`.

Recorded in `TABLE_OF_CONTENT.csv` per row.

---
_Generated by `tools/.cache/gen_batch.js` from `REVIEW/TABLE_OF_CONTENT.csv` (task 432)._
