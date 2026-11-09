# Gate 2 approval batch 8 — Collectibles and items

- **Date prepared:** 2026-11-08
- **Package:** `resources/General_reviews/Little_explorer_assets/Little_Explorer_Asset_Review_Package/`
- **Source:** `00_SOURCE_ATLASES/Watercolor Platformer Game Asset Atlas-1.png` (crops unchanged since extraction — no edits applied).
- **Status:** FINAL 2026-11-09 — 10 APPROVED (02–11, owner "all look good i approve them"); 0 NEEDS WORK; 5 REJECTED (01 header label, 12 potion, 13 treasure-chest, 14 key, 15 music-notes — no Explorer consumer, out of scope).
- **Controlling style reference:** `resources/General_reviews/Asset_Generation/STYLE_BIBLE.md` + `EXPLORER_STYLE_ADDENDUM.md` (note: both are still "Proposed — Gate 1 acceptance pending"; approving this batch does not waive that pending acceptance).

## 1. Batch contents

| Status | Count | Meaning |
|---|---:|---|
| APPROVED | 10 | owner-approved 2026-11-09 ("all look good i approve them"), art-only, alternates do not authorize replacement |
| READY FOR REVIEW | 0 | none — all reviewed 2026-11-09 |
| NEEDS WORK | 0 | none |
| REJECTED | 5 | excluded — reasons in §5 (01, 12, 13, 14, 15) |

## 2. Consumer and world mapping (EXPLORER_MAPPING.md)

| Entity | Call-site | Mapped asset | Treatment |
|---|---|---|---|
| Water-world goal "submarine" | per-level goal definition `kitty-standalone.js:2571` (drawn procedurally today) | — | Candidate 02 (object-submarine) is an alternate glyph for a future submarine goal type, decided at Gate 3; no sprite consumer today |
| On-field coins | `window.Art.draw(ctx, theme.collectible, ...)`, `kitty-standalone.js:1749` | `theme.collectible` = world glyph emoji (🍓🍉🍎🥕) | No direct sprite consumer — coins render the world collectible emoji, not a coin sprite. Candidate 06 (object-coin) is art-only with no consumer today |
| Gate 3 world collectibles | no entity call-site | `ART_REGISTRY` glyph emoji | Alternates to already-approved reused glyphs (gift🎁/star⭐/heart❤/daisy🌼/strawberry🍓/tulip🌷) — do NOT replace without a separate explicit decision (guide 4.1) |

Gate 1 hints: submarine -> water world goal type; gift box -> northpole collectible 🎁; star -> reward/star glyph ⭐; heart -> health/life glyph ❤; daisy -> spring flower glyph 🌼; tomato -> autumn fruit (near-alternate to apple 🍎, verify intent); strawberry -> spring collectible 🍓; tulip red -> spring flower glyph 🌷; purple flower -> no world collectible glyph today. World mapping is Gate 3; existing approved glyphs take precedence.

## 3. Size check (guide §9: native + in-game)

Native: crops ~49-138 px wide x ~33-138 px tall (bboxes in table below). In-game: coins drawn at 36px font via Art.draw `:1749`; goal glyphs drawn inside the 220x220 trigger box `:1043`; flower glyphs via Art draw. No collision box to preserve; exact glyph size decided at Gate 4 pilot.

## 4. Style pre-check vs style bible

Pre-check vs style bible (agent, Gate 1 visual pass): soft watercolor finish, muted palette, rounded organic shapes, no heavy outlines/sticker borders/glow. NOTE: candidates 03/04/05/07/10/11 are ALTERNATES to already-approved reused art (gift, star, heart, daisy, strawberry, tulip) - approving them does NOT authorize replacement without a separate explicit decision (guide 4.1).

## 5. Labelled contact sheet (click any image for the full-resolution PNG)

| | | | | |
|---|---|---|---|---|
| <img src="../05_COLLECTIBLES_AND_ITEMS/collectibles_and_items_candidate_02.png" width="140" alt="object-submarine"> | <img src="../05_COLLECTIBLES_AND_ITEMS/collectibles_and_items_candidate_03.png" width="140" alt="object-gift-box"> | <img src="../05_COLLECTIBLES_AND_ITEMS/collectibles_and_items_candidate_04.png" width="140" alt="collectible-star"> | <img src="../05_COLLECTIBLES_AND_ITEMS/collectibles_and_items_candidate_05.png" width="140" alt="object-heart"> | <img src="../05_COLLECTIBLES_AND_ITEMS/collectibles_and_items_candidate_06.png" width="140" alt="object-coin"> |
| **object-submarine**<br>`collectibles_and_items_candidate_02`<br>118×116 px | **object-gift-box**<br>`collectibles_and_items_candidate_03`<br>88×92 px | **collectible-star**<br>`collectibles_and_items_candidate_04`<br>73×72 px | **object-heart**<br>`collectibles_and_items_candidate_05`<br>73×66 px | **object-coin**<br>`collectibles_and_items_candidate_06`<br>62×64 px |
| <img src="../05_COLLECTIBLES_AND_ITEMS/collectibles_and_items_candidate_07.png" width="140" alt="flower-daisy"> | <img src="../05_COLLECTIBLES_AND_ITEMS/collectibles_and_items_candidate_08.png" width="140" alt="flower-purple"> | <img src="../05_COLLECTIBLES_AND_ITEMS/collectibles_and_items_candidate_09.png" width="140" alt="food-tomato"> | <img src="../05_COLLECTIBLES_AND_ITEMS/collectibles_and_items_candidate_10.png" width="140" alt="collectible-strawberry"> | <img src="../05_COLLECTIBLES_AND_ITEMS/collectibles_and_items_candidate_11.png" width="140" alt="flower-tulip-red"> |
| **flower-daisy**<br>`collectibles_and_items_candidate_07`<br>57×79 px | **flower-purple**<br>`collectibles_and_items_candidate_08`<br>54×79 px | **food-tomato**<br>`collectibles_and_items_candidate_09`<br>65×69 px | **collectible-strawberry**<br>`collectibles_and_items_candidate_10`<br>57×69 px | **flower-tulip-red**<br>`collectibles_and_items_candidate_11`<br>53×74 px |

### REJECTED — excluded from this batch

| Asset ID | Semantic name | Reason |
|---|---|---|
| `collectibles_and_items_candidate_01` | label-collectibles-items | Extraction false positive: this is the "Collectibles & Items" header label, not an asset. Discard. |
| `collectibles_and_items_candidate_12` | object-potion | Valid complete art but no Explorer consumer: no power-up/health mechanic exists; would require a new game feature (out of scope for art integration, same rule as enemies frog/snail). Revisit only if the owner approves a new mechanic. |
| `collectibles_and_items_candidate_13` | object-treasure-chest | Valid complete art but no Explorer consumer: no chest/loot mechanic exists; would require a new game feature (out of scope, same rule as enemies frog/snail). Revisit only if the owner approves a new mechanic. |
| `collectibles_and_items_candidate_14` | object-key | Valid complete art but no Explorer consumer: no lock/key mechanic exists; would require a new game feature (out of scope, same rule as enemies frog/snail). Revisit only if the owner approves a new mechanic. |
| `collectibles_and_items_candidate_15` | effect-music-notes | Valid complete art but no Explorer consumer: music is audio-only, no visual note asset is rendered anywhere (out of scope, same rule as enemies frog/snail). Revisit only if the owner approves a new UI element. |

## 6. Review notes — READY FOR REVIEW candidates

| Semantic name | Asset ID | Bbox (x,y,w,h) | Review note |
|---|---|---|---|
| object-submarine | `collectibles_and_items_candidate_02` | 993,399,118,116 | Complete yellow submarine. STRONGEST consumer in this family: water-world goal type "submarine" is drawn procedurally at kitty-standalone.js:2571 (drawGoal) — candidate to replace that procedural drawing after Gate 2 approval. Water world. |
| object-gift-box | `collectibles_and_items_candidate_03` | 1413,401,88,92 | Complete gift box (yellow, red ribbon). ALTERNATE to approved+in-use object-gift.webp: northpole world collectible 🎁 maps to it via ART_REGISTRY. Existing art takes precedence — do NOT replace without explicit approval (guide 4.1). |
| collectible-star | `collectibles_and_items_candidate_04` | 1146,408,73,72 | Complete gold star. ALTERNATE to approved star.webp (registry ⭐ -> star). Existing art takes precedence; not a world collectible (worlds use 🍓🍉🍎🥕🍄🍇🐚🍌🍙🎁🌴). Do NOT replace without explicit approval. |
| object-heart | `collectibles_and_items_candidate_05` | 1316,417,73,66 | Complete red heart. ALTERNATE to approved object-heart.webp (registry ❤ -> object-heart). Existing art takes precedence — do NOT replace without explicit approval. |
| object-coin | `collectibles_and_items_candidate_06` | 1238,419,62,64 | Complete gold coin ($ symbol). No direct consumer: on-field coins render the world collectible emoji via Art.draw at kitty-standalone.js:1749, not a generic coin sprite. Using this would change the per-world collectible identity — requires explicit approval as a behaviour change. |
| flower-daisy | `collectibles_and_items_candidate_07` | 1153,501,57,79 | Complete white daisy. ALTERNATE to approved flower.webp (registry 🌼 -> flower). Existing art takes precedence — do NOT replace without explicit approval. |
| flower-purple | `collectibles_and_items_candidate_08` | 1293,502,54,79 | Complete purple flower. No direct consumer: no registry glyph maps to a purple flower and Explorer drawDecor is particle-only (static scenery has no consumer). Plausible decor accent only if explicitly approved. |
| food-tomato | `collectibles_and_items_candidate_09` | 1368,505,65,69 | Complete red tomato/fruit. Near-alternate to approved apple.webp (registry 🍎 -> apple, autumn world collectible): verify intended fruit before use. Existing art takes precedence — do NOT replace without explicit approval. |
| collectible-strawberry | `collectibles_and_items_candidate_10` | 1450,505,57,69 | Complete strawberry. ALTERNATE to approved+in-use strawberry.webp: spring world collectible 🍓 maps to it via ART_REGISTRY. Existing art takes precedence — do NOT replace without explicit approval (guide 4.1). |
| flower-tulip-red | `collectibles_and_items_candidate_11` | 1224,506,53,74 | Complete red tulip. ALTERNATE to approved flower-tulip.webp (registry 🌷/🌸 -> flower-tulip). Existing art takes precedence — do NOT replace without explicit approval. |

## 7. Approval request (guide §9 protocol)

Please approve **per exact candidate** (semantic name / asset ID above). A general "looks good" is not per-asset approval. Conditions or rejects can be named per item. Alternates to already-approved reused art are marked in §6 — approving an alternate does NOT authorize replacing existing approved art without a separate explicit decision.

**Approved by:** project owner (radmanmilos), via OpenCode session — **Date:** 2026-11-09 — **Conditions:** owner replied "all look good i approve them". **APPROVED (10):** `object-submarine` (02, water-world goal alternate, Gate 3 decides replacing procedural `:2571`), `object-gift-box` (03), `collectible-star` (04), `object-heart` (05), `object-coin` (06, art-only; coins render world glyph emoji `:1749` — using this coin changes per-world identity), `flower-daisy` (07), `flower-purple` (08, no consumer), `food-tomato` (09, verify fruit intent), `collectible-strawberry` (10), `flower-tulip-red` (11). **Alternates rule:** 03/04/05/07/10/11 are alternates to already-approved reused art (gift/star/heart/daisy/strawberry/tulip) — approving them does NOT authorize replacing existing approved art without a separate explicit decision (guide 4.1). Art-only approval: no consumer mapped; no `game/` changes until Gate 3 (Gate 1 style-addendum still pending).

---
_Generated by `tools/.cache/gen_batch.js` from `REVIEW/TABLE_OF_CONTENT.csv` (task 432)._
