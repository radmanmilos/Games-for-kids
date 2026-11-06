# Little Explorer — World Art Redesign Plan

**Source document:** `resources/Little_Explorer_World_Art_Redesign_Implementation_Plan.md` (18 phases, Phases 0–18). This plan breaks that document into executable, numbered tasks starting at **399** (next task number per `project/tasks/INDEX.md`). Every task ties back to the plan's phases, sections, and gates.

**Mode:** Plan. No source-code or asset changes are made by this plan. Implementation begins only after the user switches to code mode and approves each gate.

---

## Baseline (verified)

- Repo: `E:\GitHub\Games for kids`, HEAD `a11c919` (unpushed), 5 commits ahead of what `project/STATUS.md` reports (`db005f3`).
- Working tree: clean except untracked `resources/Little_Explorer_World_Art_Redesign_Implementation_Plan.md`.
- All tasks 388–398 are terminal (DONE/pushed or LIMITED/ASSESSED). Nothing IN PROGRESS. Next task number: **399**.
- Entry page: `game/pages/explorer.html`. Engine: `game/games/kitty-standalone.js` (Canvas 2D, ~2606 lines).
- 11 worlds in `WORLDS` array: Spring (Пролећни дан), Summer (Летњи залазак), Autumn (Јесења ноћ), Winter (Зимски снег), Underground (Подземље), Cave (Пећина), Water (Подводни свет), Savanna (Савана), Japan (Јапан), North Pole (Северни пол), Egypt (Египат).
- All world visuals are currently procedural Canvas drawing inside `draw()` (sky fill, hills, clouds, platforms, pipes, enemies, walkers, hazards, collectibles, goals). No environment images exist yet.
- Protected (per plan §5, §9, DECISIONS.md): Explorer/Kitty character sprites and animation frames; player physics/collision; enemy AI/speed/spawn; platform movement; camera/world dimensions; level order/progression; collectible values; touch controls; audio; win/lose conditions. Serbian Cyrillic child text; Serbian speech. Offline-first; no remote assets.
- Production format (DECISIONS.md, task 360): glyph art = WebP 512×512 with real alpha in `game/assets/art/`; full-bleed scene art = opaque, in `game/assets/scenes/` (exempt from alpha gate).
- Art pipeline (project/lessons/asset-generation.md): `tools/asset_generate.js` (Cloudflare Flux), `tools/asset_qa.js`, `tools/asset_cutout.js`, WIP bundle `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/`, prompts `prompts/`, references `Reference/bear.png` + `Reference/star.png`, inventory `ASSET_INVENTORY.md`, progress `PROGRESS.md`, style `STYLE_BIBLE.md`.
- Validation gates: `node tools/check_fast.js` (10/10), `tools/kitty_smoke.js` (explorer.html), `node tools/check_release.js`, screenshot refresh via `tools/screenshot.js --review=Screenshot_Review --pages=explorer --task=<N>`, `tools/sync-docs.sh` after any `game/` change.
- Process (project/PROCESS.md): one write per task in `project/tasks/ACTIVE.md`; archive via `node tools/archive_tasks.js` at session end; overwrite `project/STATUS.md`; never commit/push without user request.

---

## Gates (from the plan, must be respected)

- **Gate 0** (end of Phase 0): No image generation or broad renderer changes until source audit, all 11 worlds, asset reuse opportunities, and generation process are audited. Read-only research only before this gate.
- **Gate 1** (end of Phase 1): Art-direction addendum, world palettes, and technical contract reviewed and accepted by the user before large-scale asset generation.
- **Gate 2** (end of Phase 2): Integration design confirmed to preserve collision/gameplay independently from artwork before implementing a full world.
- **Pilot gate** (end of Phase 3): Spring pilot reviewed and approved in the actual game before mass production (Phase 4).

---

## Tasks

### Phase 0 — Repository and visual audit (read-only)

**399. NEW — Baseline record.** Record repo, branch, commit `a11c919`, working-tree status (untracked plan file), CI status, and open-task state. Confirm the plan file is the authoritative source. No code/asset changes.
- Files: none (documentation only). Update `project/tasks/ACTIVE.md`.
- Validation: `git status --short`, `git log --oneline -5`.

**400. NEW — Source audit of explorer.html + kitty-standalone.js.** Inspect entry page, engine, world registry (`WORLDS`), render pipeline (`draw()`), asset loading, collision definitions, world-ID palette/scenery selection, enemy assignment, platform representation, entrance/goal objects, camera/world coords, image loading/caching, per-frame render loop. Identify active render functions and which draw each category (ground, platforms, pipes, enemies, walkers, hazards, collectibles, goals, decor, hero).
- Files: `game/pages/explorer.html`, `game/games/kitty-standalone.js` (lines 589–2606).
- Validation: confirm 11 worlds enumerated; list every `drawX` function and what it renders.

**401. NEW — Build complete asset map.** One row per visual element per world: world ID, world name, element category (background/terrain/platform/pipe/entrance/enemy/hazard/collectible/goal/decor), current implementation (function/Canvas primitive/color), current source path, current use (which levels/worlds), proposed treatment (reuse/adapt/replace/create/retain procedural), candidate asset ID, required variants, gameplay dependency (collision/spawn/movement/visual-only), generation eligibility (unknown/eligible/not-eligible/approved).
- Source: plan §6.3 table; extract from current source, not fabricated.
- Validation: complete map covering all 11 worlds × all categories.

**402. NEW — Screenshot audit.** Review current Little Explorer screenshots in `resources/General_reviews/Screenshot_Review/` (TABLE_OF_CONTENT.md: `explorer_*`, 4 viewports, last captured 2026-11-05 task 379). Record which worlds/orientations are covered, which visual categories visible, which shots are outdated/missing, major readability issues, assets to preserve.
- Validation: document gaps; capture new screenshots if coverage incomplete before visual judgments.

**Gate 0 review:** User confirms audit complete. Proceed to Phase 1 only after approval.

---

### Phase 1 — Environment art direction

**403. NEW — Little Explorer environment-art addendum to STYLE_BIBLE.md.** Shared art rules for large environments: palette construction, warm/cool balance, light direction/shadow, surface texture/brush character, edge softness/outline, shape language, detail density by size, contrast hierarchy, foreground/midground/background separation, character-background contrast, transparent-edge quality, texture scale at gameplay size. Does not replace or contradict the master style bible.
- Files: `resources/General_reviews/Asset_Generation/STYLE_BIBLE.md` (addendum section), new file `resources/General_reviews/Asset_Generation/EXPLORER_STYLE_ADDENDUM.md` (proposed).
- Validation: addendum consistent with bear/star references; no thick black outlines, no glossy 3D, no photorealism.

**404. NEW — World palette sheets (11 worlds).** Per world: primary environment colours, secondary, accent, ground/platform materials, background atmosphere, hazard colours, enemy contrast requirements, goal landmark colours. One palette first, then individual asset briefs derive from it.
- Files: new `resources/General_reviews/Asset_Generation/EXPLORER_PALETTES.md` (proposed).
- Validation: each world distinct identity; all within warm/muted storybook family.

**405. NEW — Asset-family technical contract.** Standards for backgrounds (parallax layers, seamless tiling, no baked gameplay), terrain (top/side/underside, tileable, corner/end-cap variants), platforms (distinct from background, readable edges, modular), entrances (themed, clear emergence point, no collision ambiguity), enemies (friendly silhouette, distinct from terrain, required animation states), hazards (readable danger, preserve collision bounds), goals (memorable, focal hierarchy, no trigger misrepresentation). Technical export: dimensions, formats, transparency, sprite-sheet layout, naming, compression, tile seams, mipmaps/filtering, loading/fallback, naming/inventory IDs.
- Files: new `resources/General_reviews/Asset_Generation/EXPLORER_TECHNICAL_CONTRACT.md` (proposed).
- Validation: follows existing pipeline (512×512 glyph cut-outs WebP; scenes opaque in `game/assets/scenes/`).

**406. NEW — Updated asset inventory.** Add proposed Little Explorer environment items to `ASSET_INVENTORY.md`, clearly distinguished as Proposed (not Approved for generation). No duplicate of style rules; refers to STYLE_BIBLE.md for visual requirements.
- Files: `resources/General_reviews/Asset_Generation/ASSET_INVENTORY.md`.
- Validation: statuses distinct (Proposed ≠ Approved for generation ≠ Generated).

**Gate 1 review:** User accepts art direction, palettes, technical contract. Proceed to Phase 2 only after approval.

---

### Phase 2 — Rendering architecture and integration design

**407. NEW — Renderer integration design.** Data-driven mapping layer in `kitty-standalone.js` `draw()`: world/element ID → visual asset. Separate visual representation from gameplay data (world/level data, physics/collision, entity behaviour, render asset selection, render transforms). Alpha bounds never replace explicit collision geometry. Parallax only on background layers. Stable z-order. No per-frame allocations.
- Files: design doc `resources/General_reviews/Asset_Generation/EXPLORER_INTEGRATION.md` (proposed); no `game/` changes yet.
- Validation: collision/geometry preserved independent of artwork.

**408. NEW — Asset loading / registry implementation plan.** Registry resolves world backgrounds, terrain tiles, platforms, entrances, enemies, hazards, goals, decor. Stable IDs, explicit world→family mapping, safe fallback for absent optional decoration, dev-time warning for missing required assets, no silent fallback to unrelated world's art, no remote URLs, offline-first, cache image objects, no per-frame reload.
- Files: design doc; no `game/` changes yet.
- Validation: missing-asset behaviour safe and diagnosable.

**409. NEW — Gameplay entity ↔ visual asset mapping.** Explicit mapping: pipes→entrances, walkers→enemies (11 types), goals→buildings (house/mine/cave/arch/hut/torii/igloo/pyramid/submarine), collectibles→items (strawberry/watermelon/apple/carrot/shell/banana/etc.), hazards→puddles/lava/spikes, decor→snow/leaves/petals/bubbles.
- Files: design doc; no `game/` changes yet.
- Validation: every current `drawX` call site has a mapped asset or documented procedural retention.

**410. NEW — Performance and fallback strategy.** Modest Android tablet targets: frame rate, image memory footprint, initial load time, world-transition load, GC/allocations, canvas draw cost, large-image decode, failed-image behaviour, long sessions. Fallback: emoji/procedural if image fails; never crash the game loop; never hide gameplay-critical missing object silently.
- Files: design doc; no `game/` changes yet.
- Validation: performance strategy documented; no remote asset URLs.

**Gate 2 review:** User confirms integration design preserves collision/gameplay. Proceed to Phase 3 only after approval.

---

### Phase 3 — Spring pilot (reference implementation)

**411. NEW — Spring asset brief + preflight.** Subject, purpose, silhouette, pose, framing, palette, lighting, texture, outline, background/transparency, dimensions/aspect ratio, prohibited features, failure modes. References: bear + star + closest exemplars. Run mandatory preflight (MANDATORY_ASSET_GENERATION_PREFLIGHT.md §1–6). Categories: background layers, terrain, platforms, pipes, mouse enemy, ladybug walker, water hazard, strawberry collectible, house goal, decor (none for Spring).
- Files: `resources/General_reviews/Asset_Generation/prompts/spring-*.md` (proposed).
- Validation: preflight pass; no duplicates; eligible and approved for generation.

**412. NEW — Generate Spring assets.** One subject at a time or small reviewable batch via `tools/asset_generate.js`. Output to WIP bundle. Do not batch-generate; do not mark user-approved without review.
- Files: `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/spring-*.png` (WIP).
- Validation: dry-run inspected; generation output inspected at full size.

**413. NEW — QA each Spring asset.** `tools/asset_qa.js <file> --against Reference/bear.png` (canvas, alpha, palette, palette-match, small-size legibility). Present for explicit user visual approval. On approval: update `ASSET_INVENTORY.md` row → `GENERATED / USER-APPROVED / TECHNICAL QA MEASURED`; append `PROGRESS.md` section.
- Validation: all Spring assets QA-measured and user-approved before integration.

**414. NEW — Integrate Spring into `draw()`.** Replace Spring's procedural drawing with image assets per the integration design; preserve collision geometry, enemy spawn, goal trigger, collectible behaviour. Remove only procedural code genuinely replaced; keep useful procedural effects.
- Files: `game/games/kitty-standalone.js` (`draw()` Spring branch).
- Validation: `tools/kitty_smoke.js` passes; `check_fast.js` 10/10; collision unchanged (geometry assertions in smoke).

**415. NEW — Spring pilot review.** Screenshots at 4 viewports (390×844, 844×390, 820×1180, 1180×820) via `tools/screenshot.js --review=Screenshot_Review --pages=explorer --task=415`. Visual QA checklist (plan §13.3) + gameplay regression checklist (plan §13.4). Pilot must pass review before mass production.
- Validation: screenshots captured; QA checklist complete; user approves pilot.

**Pilot gate:** User approves Spring pilot. Proceed to Phase 4 only after approval.

---

### Phase 4 — Expand to remaining worlds (one task group per world)

**416. NEW — Summer: brief + preflight + generate + QA + approve.** Warm sunlit landscape, richer greens/golden accents, summer vegetation/flowers, distinct landmarks, platform/terrain material, entrance/goal motifs. Not a recolour of Spring.
- Validation: preflight pass; generated; QA measured; user-approved.

**417. NEW — Summer: integrate into `draw()` + QA.** Replace Summer procedural drawing; preserve collision/gameplay.
- Validation: `kitty_smoke.js`; `check_fast.js`; screenshots.

**418. NEW — Autumn: brief + preflight + generate + QA + approve.** Amber/rust/ochre/muted red palette, layered foliage, seasonal ground detail, decorative leaves vs hazards separated, world-specific platforms/entrances/enemies/goal.
- Validation: preflight pass; generated; QA measured; user-approved.

**419. NEW — Autumn: integrate into `draw()` + QA.**
- Validation: `kitty_smoke.js`; `check_fast.js`; screenshots.

**420. NEW — Winter: brief + preflight + generate + QA + approve.** Snow/ice/muted evergreen/cool palette, readable solid vs slippery surfaces (only if mechanics exist), snow accumulation must not obscure platform edges, avoid white-on-white contrast loss.
- Validation: preflight pass; generated; QA measured; user-approved.

**421. NEW — Winter: integrate into `draw()` + QA.**
- Validation: `kitty_smoke.js`; `check_fast.js`; screenshots.

**422. NEW — North Pole: brief + preflight + generate + QA + approve.** Distinct polar identity (not Winter duplicate), ice formations, distant polar landscape, snow, landmarks, cool palette with warm accents for readability, unique goal.
- Validation: preflight pass; generated; QA measured; user-approved.

**423. NEW — North Pole: integrate into `draw()` + QA.**
- Validation: `kitty_smoke.js`; `check_fast.js`; screenshots.

**424. NEW — Underground: brief + preflight + generate + QA + approve.** Subterranean atmosphere, earth/roots/stone/crystals, distinct background depth/lighting, clear platform/ground silhouettes against darker scenery.
- Validation: preflight pass; generated; QA measured; user-approved.

**425. NEW — Underground: integrate into `draw()` + QA.**
- Validation: `kitty_smoke.js`; `check_fast.js`; screenshots.

**426. NEW — Cave: brief + preflight + generate + QA + approve.** Distinct from Underground, stronger rock formations/cave depth, restrained luminous accents, dark areas readable, no large black regions/intense glows.
- Validation: preflight pass; generated; QA measured; user-approved.

**427. NEW — Cave: integrate into `draw()` + QA.**
- Validation: `kitty_smoke.js`; `check_fast.js`; screenshots.

**428. NEW — Underwater: brief + preflight + generate + QA + approve.** Layered aquatic depth, foreground plane vs distant sea life, water/bubble/plant decoration must not look like collision object, distinct platforms/entrances/hazards/enemies/goal, player silhouette readable against light/dark water, no contrast-reducing effects.
- Validation: preflight pass; generated; QA measured; user-approved.

**429. NEW — Underwater: integrate into `draw()` + QA.**
- Validation: `kitty_smoke.js`; `check_fast.js`; screenshots.

**430. NEW — Savanna: brief + preflight + generate + QA + approve.** Warm grassland palette, distant acacia-like silhouettes (if supported), layered grasses, world-specific ground/platform materials, creature designs match actual enemy roster.
- Validation: preflight pass; generated; QA measured; user-approved.

**431. NEW — Savanna: integrate into `draw()` + QA.**
- Validation: `kitty_smoke.js`; `check_fast.js`; screenshots.

**432. NEW — Egypt: brief + preflight + generate + QA + approve.** Warm desert/sandstone palette, distinctive architecture/landmarks, strong soft-edged shape language, no tiny hieroglyphic overload, respectful cultural motifs, unique entrance/goal.
- Validation: preflight pass; generated; QA measured; user-approved.

**433. NEW — Egypt: integrate into `draw()` + QA.**
- Validation: `kitty_smoke.js`; `check_fast.js`; screenshots.

**434. NEW — Japan: brief + preflight + generate + QA + approve.** Distinct composed identity, restrained harmonious palette, Japanese-inspired architecture/landscape only where appropriate to existing concept, no mixed cultural symbols/generic shorthand, calm gameplay plane/readable silhouettes, world-specific entrance/enemies/platforms/finish.
- Validation: preflight pass; generated; QA measured; user-approved.

**435. NEW — Japan: integrate into `draw()` + QA.**
- Validation: `kitty_smoke.js`; `check_fast.js`; screenshots.

---

### Phase 5 — Cross-world enemy / hazard / entrance / goal review

**436. NEW — Enemy family review.** All enemy types (mouse, mole, bat, piranha, snake, oni, penguin, scorpion, ladybug, bee, hedgehog, snowman, worm, spider, crab, meerkat, panda, seal, scarab): distinctive silhouette, face/identity readable at native size, consistent material/texture, contrasts with local ground/background, collision preserved, only required directional/animation variants, checked in motion.
- Validation: `kitty_smoke.js` walker/enemy assertions; visual review per world.

**437. NEW — Hazard review.** Water/lava/spikes: strong silhouette, clear visual language, danger readable without frightening imagery, not colour-alone, decorative effects don't disguise collision, all gameplay rules preserved.
- Validation: `drawPitHazards()` unchanged or replaced with equivalent collision; `kitty_smoke.js`.

**438. NEW — Entrance review.** Pipes per world themed to world (not generic plumbing), clear emergence point, no decoration/spawn ambiguity, artwork doesn't imply different collision shape, doesn't occlude enemy during emergence.
- Validation: pipe collision unchanged; visual review.

**439. NEW — Goal review.** All 9 goal types (house/mine/cave/arch/hut/torii/igloo/pyramid/submarine): world-specific, memorable, large enough, friendly, consistent style, distinct from scenery, compatible with finish trigger/animation.
- Validation: `drawGoal()` branches unchanged or replaced equivalently; `kitty_smoke.js` goal assertions.

---

### Phase 6 — Integration cleanup

**440. NEW — Remove replaced procedural drawing.** Remove `draw()` procedural code only where genuinely replaced by approved assets. Preserve useful procedural effects and dynamic geometry. No dead/duplicate asset references.
- Files: `game/games/kitty-standalone.js`.
- Validation: `kitty_smoke.js`; `check_fast.js`; no runtime dependency on `resources/`; no remote URLs.

**441. NEW — Final inventory/progress sync.** `ASSET_INVENTORY.md` rows → production-ready paths/status; `PROGRESS.md` complete; per-asset handoff record (ID, filename, dimensions, format, alpha status, source glyph replaced, game/component/location, runtime destination, prompt/references, reuse plan, QA status).
- Files: `resources/General_reviews/Asset_Generation/ASSET_INVENTORY.md`, `PROGRESS.md`.
- Validation: statuses accurate; every runtime asset has an inventory row.

---

### Phase 7 — Full QA and handover

**442. NEW — Full viewport matrix QA.** All 4 viewports × all 11 worlds: opening camera, normal traversal, platforms, enemies, entrances/spawn, every hazard, collectibles, moving platforms, goal/finish. Viewport matrix per plan §13.1.
- Validation: `kitty_smoke.js`; manual runtime inspection; screenshots.

**443. NEW — Screenshot battery refresh.** `node tools/screenshot.js --review=Screenshot_Review --pages=explorer --task=443` (full battery for explorer). Register any new screens in `tools/registry.js` first. Update TABLE_OF_CONTENT.md provenance.
- Validation: screenshots current; no stale shots.

**444. NEW — Release gate.** `node tools/check_fast.js` (10/10) + `node tools/check_release.js` (full battery). Version bump C (minor): 3.0.7 → 3.0.8 per shipped segment (or B if major release per user decision).
- Files: `game/manifest.json` (version only if user approves bump).
- Validation: both gates green.

**445. NEW — Docs sync + STATUS + archive.** `tools/sync-docs.sh` (refresh `docs/` from `game/`). `node tools/check_docs.js`. Overwrite `project/STATUS.md`. `node tools/archive_tasks.js` (move DONE tasks to archive, update INDEX.md). Final report distinguishing implementation/review/approval/testing; record blockers/unverified items.
- Validation: `check_docs.js` passes; STATUS.md reflects `a11c919` + new tasks.

---

## Key decisions / open questions (to resolve with user)

1. **Gate sequencing:** Respect Gates 0/1/2 and the pilot gate strictly (read-only/documentation first, then generation, then integration)? Or batch phases after the pilot?
2. **Version bump:** Bump C (3.0.7 → 3.0.8) per segment, or wait for a major B bump? User must approve any `manifest.json` change.
3. **Asset references:** Confirm bear.png + star.png in `Reference/` are the controlling anchors; confirm whether additional per-subject references (e.g. candy.jpeg for wrapped-candy) should be used.
4. **Procedural retention:** Which small effects (particles, sparkles, decor snow/leaves/petals/bubbles, hills, clouds) remain procedural vs. become image assets? Plan §8.6 says retain procedural for simple effects/tiny particles/repeated low-detail elements.
5. **Scenes vs. glyphs:** Decide which environment layers become opaque scene art (`game/assets/scenes/`) vs. transparent glyph cut-outs (`game/assets/art/`). Plan §8.6 / DECISIONS.md task 360: backgrounds likely scenes; platforms/enemies/collectibles likely glyphs.

---

## Validation plan

| Check | Command | When |
|---|---|---|
| Fast gate | `node tools/check_fast.js` | After each task touching `game/` or docs |
| Explorer smoke | `node tools/kitty_smoke.js` | After each world integration + Phase 5/6 |
| Release gate | `node tools/check_release.js` | Before release (task 444) |
| Screenshots | `tools/screenshot.js --review=Screenshot_Review --pages=explorer --task=<N>` | After any screen change (tasks 415, 443) |
| Docs sync | `tools/sync-docs.sh` + `check_docs.js` | After any `game/` change (task 445) |
| Asset QA | `tools/asset_qa.js <file> --against Reference/bear.png` | Every generated asset (task 413 + per-world QA) |

---

## Deliverables (Definition of Done, plan §14)

- Environment-art addendum consistent with STYLE_BIBLE.md; every world has approved palette + visual brief.
- Every required visual element has inventory entry or documented reason to remain procedural.
- Every generated asset passed preflight + QA + user inspection; approval status explicit and evidence-based.
- All production assets integrated; mapping complete per world; no runtime asset depends on `resources/` or internet; missing-asset behaviour safe; Explorer/Kitty sprites unchanged.
- All worlds pass visual QA checklist + gameplay regression checklist; viewport matrix complete; offline operation verified; automated checks green; screenshots refreshed.
- Asset inventory/progress records reflect actual status; docs/sync-docs.sh run; STATUS.md overwritten; tasks archived.
