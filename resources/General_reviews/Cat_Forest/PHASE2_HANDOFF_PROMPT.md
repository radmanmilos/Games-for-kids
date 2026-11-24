# Cat Forest Village — Phase 2 Handoff Prompt (task 465)

Use this verbatim as the context prompt for the next agent session to continue **Phase 2** of the Cat Forest Village expansion.

---

CONTEXT:

You are working in the repo `radmanmilos/Games-for-kids` (working dir `E:\GitHub\Games for kids`).

Current state (as of 2026-11-23):
- Branch: `claude/cat-forest-village` (pushed to origin, commit `4f5413b`).
- Base game is complete on `main` (last good commit `05edfd1` on `main`); the user is now on the branch `claude/cat-forest-village` for the **Cat Forest Village expansion**.
- Version on `main`: `game/manifest.json` = `3.0.20`. Cat Forest internal version = `2.4.0`. (Do not bump versions unless explicitly asked.)

Phase 1 (task 464, DONE) completed the art direction:
- Prototype PNGs live in `resources/General_reviews/Cat_Forest/`: `village_house_concept.png`, `village_cat_prototype.png`, `village_fish_basket_prototype.png`, `village_decoration_prototype.png`, `village_scene_mockup.png`.
- Direction guide: `resources/General_reviews/Cat_Forest/ART_DIRECTION.md`.
- Prompt briefs: `resources/General_reviews/Asset_Generation/prompts/cat_forest_village_*.md` (house, cat, fish_basket, decoration, scene).
- Plan: `resources/General_reviews/CAT_FOREST_VILLAGE_EXPANSION_IMPLEMENTATION_PLAN.md` (see its Phase 2 section, around line 1121).

Task ledger (as of this session):
- Task 464: DONE — Cat Forest Village expansion Phase 1: art direction & scene prototypes (2026-11-23, OpenCode/Big Pickle).
- Task 465: NEW — Cat Forest Village expansion Phase 2: village hub + 3 fixed feeding spots (plan §8 Phase 2). Next task number is now **466**.

Engine / page (the work area):
- `game/games/cat_forest.js` — **1,353 lines** (Cat Forest engine).
- `game/pages/cat_forest.html` — **317 lines** (page shell + CSS).
- `game/data/app-registry.js` — cat_forest registry entry (screenshot:false, offline:true, toddler:true, hubOrder:12).
- Engine constants/tables in `cat_forest.js` (`CF` object, `TREATS`, `CATS`, `GIFTS`, plates).

PROBLEM TO SOLVE (Phase 2):

Implement the **village hub and fixed feeding area** per the plan's Phase 2:

Deliverables:
- New village scene with house and garden.
- Three fixed feeding places.
- Existing cat visit lifecycle integrated into the house scene.
- Cat positions, collision/hit testing and touch geometry.
- Existing day/night and weather presentation retained or deliberately migrated.

Exit gate:
- Existing cat feeding still works.
- No feeding anchor moves between viewport sizes.
- Existing save data remains readable.
- Smoke and viewport checks pass.

CONSTRAINTS (hard repo rules — do not violate):
- Repo first, plain HTML/CSS/JS PWA only. No framework / package / runtime dependency.
- Do not edit `game/shared/*` for convenience. Any shared-system requirement is a blocker requiring separate user approval.
- Keep existing repo patterns/naming. If the expansion cannot stay maintainable inside the current IIFE structure, propose the smallest game-specific split and record required offline inventory changes before proceeding. Do not replace wholesale.
- Scene state machine shape: `village`, `pond`, `woodland`, `workshop`, `diary`. One main scene interactive at a time; modal cat detail pages are overlays within diary. Define scene entry/exit functions preserving state.
- Do not create separate HTML pages per scene unless repo routing/perf evidence justifies it; prefer one game page with internal scene switching for first release.
- Data-driven definitions: recipes, decorations, cat profiles, gift definitions, anchor compatibility in data tables. Example shapes given in plan §7.3 (recipe record with `id, asset, category, ingredients, anchors, previewScale`; decoration record with `id, anchorId, variant`).
- Product rules for this game (from existing cards): no economy/counters/text; emoji-only UI where text not needed; Serbian Cyrillic for all shown text and speech; no fail states; no visible text; no digits/Latin in child-facing text; save contract is `catForestSave = JSON.stringify({v:1, met:[catIds], decor:[{e,s}]})`.

VALIDATION / HARNESS RULES:
- Use `node tools/check_fast.js` as the fast gate.
- Use `node tools/run_all.js --game cat_forest` for game smokes.
- Use `node tools/build_offline.js` then `bash tools/sync-docs.sh` (in that order) before any final gate; then `node tools/check_docs.js`, `node tools/validate_generated.js`, `node tools/validate_offline.js`, `node tools/offline_smoke.mjs`, `node tools/screenshot.js`, `node tools/visual_compare.js`.
- Review screenshots refresh via `node tools/screenshot.js --review=Screenshot_Review --pages=cat_forest --task=<task>`.
- Negative tests for guards must mutate artifacts on a COPY and restore byte-identically.
- A smoke that exits non-zero with 0 checks never got its assertions run; `run_all.js` retries twice.
- Always check a smoke is up to date with the code it tests before executing; fix stale assertions before running, not after.
- Never bend `game/` to satisfy a test; stale assertions are fixed to observed truth.

REPORTING:
- After each completed step, report file:line references and exact commands + results.
- Update `project/tasks/ACTIVE.md` and `project/STATUS.md` per task; append to `resources/General_reviews/Cat_Forest/PROGRESS.md`; record decisions in `project/DECISIONS.md`.

FIRST STEP (recommended):
- Read `resources\General_reviews\CAT_FOREST_VILLAGE_EXPANSION_IMPLEMENTATION_PLAN.md` Phase 2 section and the current `game/games/cat_forest.js` + `game/pages/cat_forest.html`.
- Add the first village scene implementation step (new village scene + fixed feeding anchors) in small verifiable increments, then run the Cat Forest smoke + fast gate + offline checks before advancing to Phase 3.

DO NOT:
- Do not commit or push unless explicitly asked.
- Do not push to `main`; only commit/push when asked and never push to main.
- Do not modify `game/shared/*` without user approval.
- Do not add new runtime deps.
- Do not switch personas/identity (stay Ponytail Lazy Dev).
- Do not use destructive git commands to restore files; use copy-then-restore for negative tests.
- Do not rewrite existing code speculatively; YAGNI, smallest correct fix.