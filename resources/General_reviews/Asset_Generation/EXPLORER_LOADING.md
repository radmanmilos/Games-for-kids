# Little Explorer — Asset Loading / Registry Plan (Phase 2, task 408)

**Project:** Little Play / Petrin svet — Мала истраживачица (Little Explorer)
**Scope:** Registry and loading behaviour that resolves world backgrounds, terrain tiles, platforms, entrances, enemies, hazards, collectibles, goals, and decor to visual assets. Design doc only — no `game/` changes, no asset generation.
**Relationship:** Implements the mapping from `EXPLORER_INTEGRATION.md` and the contract from `EXPLORER_TECHNICAL_CONTRACT.md`.
**Status:** Proposed — Gate 2 acceptance pending before implementing a full world.

---

## 1. Registry responsibilities

The registry resolves:
- World background layers (`scene-<world>`).
- Terrain tile family (`terrain-<world>-top`, `-side`, corner/end-cap variants).
- Platform family (`platform-<world>`, static + moving).
- Entrance family (`pipe-<world>`).
- Enemy visual by enemy type and state (`enemy-mouse`, etc.).
- Walker visual by walker type (`walker-ladybug`, etc.).
- Hazard visual (`hazard-water`, `hazard-lava`, `hazard-spikes` — mostly retained procedural).
- Collectible visual (`collectible-<item>` — reuse existing glyphs).
- Goal visual (`goal-house`, `goal-mine`, `goal-cave`, `goal-arch`, `goal-hut`, `goal-torii`, `goal-igloo`, `goal-pyramid`, `goal-submarine`).
- Decorative world props (retained procedural: snow/leaves/petals/bubbles/ceiling).

Requirements:
- Stable asset identifiers.
- Explicit world → family mapping.
- Safe fallback when an optional decoration is absent.
- Visible development-time warning for a missing required asset.
- No silent fallback to an unrelated world's art.
- No remote asset URLs; asset paths resolve locally and work offline.
- Asset with no consumer is not added (no dead weight in offline manifest).

---

## 2. Registry shape

Reuse the existing `window.ART_REGISTRY` glyph → stem mechanism (`game/data/art-registry.js`) extended with Little Explorer stems, plus a small world-config table mapping each world ID to its scene + family stems. The `Art.url(glyph)` / `Art.image(glyph)` / `Art.draw(ctx, glyph, cx, cy, size)` helpers in `game/shared/art.js` already provide cached image lookup with emoji fallback.

Add Little Explorer stems to `ART_REGISTRY` only when the corresponding asset is approved and production-ready; until then the emoji/procedural fallback keeps the game playable (existing behaviour).

---

## 3. Asset loading

- Cache `HTMLImageElement` objects keyed by URL (`Art.image()` memoizes) — never create new Image instances every frame.
- Load required assets before gameplay begins, or use a reliable loading state that prevents invisible gameplay.
- Track loading and failure state.
- Missing image: never crash the game loop; fall back to emoji/procedural via `Art.draw`/`Art.fill`; never silently hide a gameplay-critical missing object.
- Dev-time `console.warn` for missing required assets.
- No remote URLs; offline-first; local paths only.
- Do not reload assets unnecessarily when changing worlds; cache keyed by URL persists across world transitions.
- Memory appropriate for modest Android tablets; 60 KB/file glyph cap.

---

## 4. World → family mapping (from EXPLORER_ASSET_MAP.md)

| World | Scene | Enemy | Walker | Goal | Collectible |
|---|---|---|---|---|---|
| spring | scene-spring | enemy-mouse | walker-ladybug | goal-house | collectible-strawberry |
| summer | scene-summer | enemy-mouse | walker-bee | goal-house | collectible-watermelon |
| autumn | scene-autumn | enemy-mouse | walker-hedgehog | goal-house | collectible-apple |
| winter | scene-winter | enemy-mouse | walker-snowman | goal-house | collectible-carrot |
| underground | scene-underground | enemy-mole | walker-worm | goal-mine | collectible-mushroom |
| cave | scene-cave | enemy-bat | walker-spider | goal-cave | collectible-grapes |
| water | scene-sea | enemy-piranha | walker-crab | goal-submarine | collectible-shell |
| savanna | scene-savanna | enemy-snake | walker-meerkat | goal-hut | collectible-banana |
| japan | scene-japan | enemy-oni | walker-panda | goal-torii | collectible-rice-ball |
| northpole | scene-northpole | enemy-penguin | walker-seal | goal-igloo | collectible-gift |
| egypt | scene-egypt | enemy-scorpion | walker-scarab | goal-pyramid | collectible-palm-tree |

---

## 5. Missing-asset behaviour

- Required asset missing at load: dev-time warning + emoji/procedural fallback; game remains playable.
- Optional decoration missing: silent safe fallback, no warning noise.
- Never fall back to an unrelated world's art (no wrong-world silhouette confusion).
- Gameplay-critical object (enemy, walker, goal, collectible, hazard) never hidden silently; fallback renders something recognizable.

---

## 6. Gate 2

Asset loading / registry approach confirmed; combined with `EXPLORER_INTEGRATION.md`, the design preserves collision and gameplay independently from artwork before implementing a full world (Phase 3 Spring).
