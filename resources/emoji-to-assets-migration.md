# Plan: Emoji/Glyph → Game-Ready Asset Migration (2.4.0 → 3.0.0)

Prepared 2026-10-31. Source of truth: `project/STATUS.md` (2.4.0 shipped), `project/DECISIONS.md` (production-asset decisions 2026-10-31), `resources/.../petras-world-production-assets-2026-10-29/PRODUCTION_ASSET_PIPELINE.md`, `game/shared/art.js`, `game/data/art-registry.js` (125 entries), `game/assets/art/` (155 WebPs).

## Goal
Replace every emoji/pictograph used as game artwork with the painted WebP assets, keeping emoji as the fallback for any unregistered glyph. Finish at app version **3.0.0**. No redesign of games, no character-sprite/3D-mesh changes (scope constraints from `ASSET_INVENTORY.md`).

## Versioning (per user rule: C = minor, B = major, A = overhaul)
- Intermediate minor bumps per stage (2.5.0 … 2.9.0).
- Final migration completes at **3.0.0** (B bump = major release).

## Display-mechanism groups (from source scan)
- **G-DOM**: 27 files use `textContent`/`innerText`/`innerHTML` with glyphs (24 game/page/shared files + art.js).
- **G-FIELD**: 16 files carry `emoji:` fields in data tables (serbian.js has 51).
- **G-CANVAS**: 11 files use canvas `fillText` with glyphs.
- **G-CSS**: `pages/cat_forest.html` (30 `content:` rules) + Cat Forest JS.
- **G-EXCLUDED**: 6 masters (night-sky, sunrise, sunset, galaxy, sun, cards-pattern) shipped as opaque images/CSS/SVG, not cut-outs.

## Stage breakdown

### Stage 0 — Foundation (already done in task 296)
Assets cut, registry + helper shipped, offline inventories updated, check_fast green. Version stays 2.4.0 until Stage 1.

### Stage 1 — Wire the helper globally (target 2.5.0)
Make `Art` available on every page and add the sizing CSS rule. No emoji replaced yet.

Tasks (sequential):
- **T298** Add `game/data/art-registry.js` + `game/shared/art.js` script tags to all 18 game pages (registry before art.js), in the existing shared-script block. Add CSS rule `.art { width:1em; height:1em; display:inline-block; vertical-align:-0.12em; object-fit:contain; pointer-events:none; }` to `game/styles/` (or the main stylesheet). Run check_fast + hub_smoke. Commit+push.
- **T299** Add a smoke assertion that `window.Art` is defined and `Art.url('🐶')` resolves on hub load (extend `hub_smoke.js` or new `art_smoke.js` in `tools/`). Commit+push.
- **T300** Bump version to 2.5.0 in `game/manifest.json`, run build_offline + sync-docs, update `project/games/*.md` notes, commit+push.

### Stage 2 — Emoji-field data tables (target 2.6.0)
Games whose cards/tiles read `spec.emoji` and write it to DOM. Replace the render site with `Art.fill(el, spec.emoji)` (or `Art.html`), keeping `emoji` as fallback data.

Group A (animal/object cards): `animals.js`, `animal_counting.js`, `candy.js`, `sorting.js`, `spatial.js`.
Group B (sequences/puzzles): `sequencing.js`, `animal_puzzle.js`, `maze.js`.
Group C (phonics/music/UI): `phonics.js`, `piano.js`, `rhythm.js`, `classroom.js`, `fastcat.js`.

Tasks:
- **T301** Group A render sites (5 files): replace `el.textContent = spec.emoji` / `span.textContent = ...` with `Art.fill`. Update docs/game notes. check_fast + targeted smokes (animals, animal_counting, candy, sorting, spatial). Commit+push.
- **T302** Group B render sites (3 files). Commit+push.
- **T303** Group C render sites (5 files) incl. fastcat lake theme. Commit+push.
- **T304** `cat_forest.html` data table (18 `emoji:`) — render via Art.fill where shown; respect Cat Forest exemption decision (painted art now allowed). Commit+push.
- **T305** Bump to 2.6.0, build_offline + sync-docs, screenshots refresh (affected pages), commit+push.

### Stage 3 — Canvas games (target 2.7.0)
Replace `ctx.fillText(glyph, ...)` with `Art.draw(ctx, glyph, cx, cy, size)`, preloading images in each game's init so they're ready before first frame. Fallback to fillText for unregistered glyphs.

Files: `adventure.js`, `adventure-modes.js`, `animal_puzzle.js`, `dino.js`, `fastcat.js`, `kitty-standalone.js`, `ocean.js`, `racing3d.mjs`, `space.js`, `tracing.js`.

Tasks:
- **T306** Adventure family (adventure.js + adventure-modes.js) canvas draws. Commit+push.
- **T307** Dino + FastCat canvas draws. Commit+push.
- **T308** Kitty-standalone canvas draws (5 fillText). Commit+push.
- **T309** Ocean + Space + Tracing canvas draws. Commit+push.
- **T310** Animal-puzzle + racing3d.mjs canvas draws. Commit+push.
- **T311** Bump to 2.7.0, build_offline + sync-docs, screenshots, commit+push.

### Stage 4 — DOM text-content sites (target 2.8.0)
The remaining `textContent`/`innerText`/`innerHTML` writes not covered by Stage 2 (celebration, navigation, compare, kids_games, coloring, animals memory, etc.) plus `shared/celebration.js`, `shared/navigation.js`.

Tasks:
- **T312** Shared modules: `shared/celebration.js`, `shared/navigation.js` (2+2 sites) → Art.fill. Commit+push.
- **T313** `compare.js`, `kids_games.js`, `coloring.js`, `animal_memory.js` DOM sites. Commit+push.
- **T314** `adventure.js`, `animals.js`, `dino.js`, `maze.js`, `piano.js`, `rhythm.js`, `tracing.js` remaining DOM sites. Commit+push.
- **T315** `pages/parent.html` (36 sites) + `pages/cat_forest.html` (1 site). Commit+push.
- **T316** Bump to 2.8.0, build_offline + sync-docs, screenshots, commit+push.

### Stage 5 — Phonics data + decor + excluded (target 2.9.0)
- **T317** `data/serbian.js`: 51 `emoji:` fields. Keep the field (it's data) but ensure consumers (phonics, classroom, animals) render via Art (covered by Stages 2/4). Add a note that `emoji` is now a fallback key; no data change needed unless a glyph is unregistered. Commit+push.
- **T318** `racing-config.js` decor glyphs (3 emoji: fields) + 3D racing UI title/counter (r3d-title-car, r3d-flower-counter) — apply Art or SVG per inventory. Commit+push.
- **T319** Excluded 6 (night-sky, sunrise, sunset, galaxy, sun, cards-pattern): ship as opaque images/CSS (sun → disc + radial-gradient; cards-pattern → SVG/CSS; scenes → CSS backgrounds). Commit+push.
- **T320** Bump to 2.9.0, build_offline + sync-docs, screenshots, commit+push.

### Stage 6 — Final migration to 3.0.0
- **T321** Cat Forest full migration (now allowed): feed/gift/collectible glyphs → Art, including CSS `content:` rules in `cat_forest.html`. Commit+push.
- **T322** Audit: grep for remaining emoji render sites; any unregistered glyph either gets an asset or stays emoji fallback intentionally. Document exceptions. Commit+push.
- **T323** Remove emoji fallback only where 100% covered? (Keep fallback in `Art.draw`/`Art.html` for safety — do NOT remove; offline safety.) Instead: verify every registered glyph has a WebP. Commit+push.
- **T324** Bump to 3.0.0 in `game/manifest.json`. Run full battery (`check_release.js`), play_matrix (chromium+webkit), axe_check. Refresh full review screenshot battery (`--review=Screenshot_Review --task=324`). Archive tasks, overwrite STATUS.md. Commit+push.
- **T325** Update `project/games/*.md` for all touched games, `project/lessons/game-runtime.md` if needed, `project/DECISIONS.md` final note. Commit+push.

## Per-task checklist (every task)
1. Read the task entry; set IN PROGRESS in `project/tasks/ACTIVE.md`.
2. Implement the scoped change only.
3. Update affected `project/games/<game>.md`.
4. Run `node tools/check_fast.js` (must be green) and the smallest targeted smoke(s) for touched games.
5. If `game/` changed: `node tools/build_offline.js` then `bash tools/sync-docs.sh`.
6. Refresh affected review screenshots: `node tools/screenshot.js --review=Screenshot_Review --pages=<pages> --task=<id>`.
7. Commit with `Agent: OpenCode/Big Pickle` trailer and push to main.
8. Mark task DONE in ACTIVE.md with dated note; archive at session end.

## Risk notes
- Canvas preloading: images must be loaded before first frame; use `Art.image()` + `onload` or a preload list to avoid flicker.
- Offline safety: `Art.html`/`Art.draw` fall back to emoji, so partial migration never shows a broken image.
- Do not touch Explorer/Kitty/3D Racing character sprites or meshes (scope constraints).
- The 6 excluded assets need special handling (CSS/opaque), not cut-outs.
- Keep `game/` deployable-only; dev tooling stays in `tools/`/`resources/`.

## Out of scope
- New asset generation (all 155 needed are already shipped).
- Character sprites, 3D models, audio.
- Redesign of game logic or layouts.
