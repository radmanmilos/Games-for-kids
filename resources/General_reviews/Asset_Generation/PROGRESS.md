# Petra's World — Asset Generation Progress

This file is the single progress tracker for the emoticon replacement project. Update it as source inventory, user approvals, generation, and QA proceed.

## Current phase

**Phase 1 — Source audit and inventory.** No production assets have been generated or approved yet.

## Fixed decisions

- [x] Use the exact user-supplied brown bear as the main style reference.
- [x] Use the exact user-supplied plain golden star as the matching secondary reference.
- [x] Keep Explorer character sprites and animation frames unchanged; only consider other emoticons in that game.
- [x] Keep Kitty character sprites and animation frames unchanged; only consider other emoticons in that game.
- [x] In 3D Racing, replace only emoji glyphs; preserve 3D models, geometry, environment, and rendering.
- [x] Preserve suitable existing illustrations; do not regenerate assets just to make them new.
- [x] Keep standard interface controls as SVG/CSS icons or text where appropriate.
- [x] Store project documentation and prompts in `resources/`; approved runtime assets only in `game/`.
- [ ] Complete source-backed inventory of every emoji used as a game visual.
- [ ] User approves final asset inventory.
- [ ] Generate and review first small test batch.
- [ ] User approves the test batch against the fixed references.
- [ ] Generate remaining approved assets in manageable batches.
- [ ] Run image transparency, dimensions, file-size, naming, and visual consistency checks.
- [ ] Prepare final implementation handoff for implementation AI.
- [ ] Implementation AI swaps only the approved emoji render sites and runs regression checks.

## Source-confirmed starting findings

### 3D Racing — `game/pages/racing3d.html`

- [x] 🏎️ page title decoration — review whether to keep as a small illustration or remove.
- [x] 🌸 flower counter — review for a small matching flower asset.
- [x] 🌍 world selector icon — prefer a consistent UI icon or small simple illustration; reuse it wherever repeated.
- [x] 🔊 / 🔇 music state — UI icon task, not watercolor illustration.
- [x] 🏁 win/start finish decoration — review for a small matching flag asset or remove decoration.
- [x] ➡️ next-world arrow — UI icon task, not watercolor illustration.
- [x] 🔄 restart arrow — UI icon task, not watercolor illustration.
- [x] 🏎️ favicon — app-icon task, not part of the object asset batch.
- [ ] Audit `game/games/racing3d.mjs` before classifying any in-world objects. Configured pickups/obstacles are 3D concepts and must not be assumed to be emoji render sites.

## Batch log

| Batch | Scope | Status | Notes |
|---|---|---|---|
| B0 | Source audit and inventory | IN PROGRESS | Current inventory has initial confirmed examples; other game files still need a complete scan. |
| B1 | 1–3 test objects selected from approved inventory | NOT STARTED | Wait for user approval of final inventory. |
| B2+ | Small generation batches | NOT STARTED | Avoid wasting free-tier image generations; do not regenerate approved assets. |
| QA | Transparency, dimensions, consistency, runtime/offline checks | NOT STARTED | Use approved assets only. |
| Handoff | Asset map and implementation instructions | NOT STARTED | Final handoff must list exact source render sites and filenames. |

## Asset status ledger

Add one row per asset. Keep this table synchronized with the inventory.

| Asset ID | Replaces glyph / current visual | Used by | Prompt/reference saved? | File | Status | QA / notes |
|---|---|---|---|---|---|---|
| — | No production assets yet | — | — | — | NOT STARTED | Wait for final source audit and inventory approval |

## Decisions / issues

- The broad preliminary inventory document was intentionally superseded by the narrower emoticon-only scope. Do not generate all of its speculative candidates.
- The exact original reference image files should be stored in `references/` before production generation if they are not already available as project files.
- Source inventory must distinguish emoji pictographs from SVG controls, CSS geometry, ordinary text, and actual 3D models.
