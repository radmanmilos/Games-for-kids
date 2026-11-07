# Little Explorer — Asset-Family Technical Contract (Phase 1, task 405)

**Project:** Little Play / Petrin svet — Мала истраживачица (Little Explorer)
**Scope:** Technical export and integration contract for environment assets across all 11 worlds. Derived from the existing pipeline (DECISIONS.md task 360; project/lessons/asset-generation.md; STYLE_BIBLE.md §17).
**Relationship:** Companion to `EXPLORER_STYLE_ADDENDUM.md` and `EXPLORER_PALETTES.md`. Does not change gameplay, collision, physics, camera, or world dimensions.
**Status:** Proposed — Gate 1 acceptance pending.

---

## 1. Asset placement rule (DECISIONS.md task 360)

| Location | Contents | Format | Alpha | Size | Consumer |
|---|---|---|---|---|---|
| `game/assets/art/` | Glyph cut-outs only (platforms, terrain tiles, pipes, enemies, walkers, hazards, collectibles, goals) | WebP lossy q85, alpha q100 | Real alpha required | 512×512 | `window.Art` registry (art.js) via `ART_REGISTRY` glyph → stem |
| `game/assets/scenes/` | Full-bleed opaque scene art (world backgrounds: sky/hills/clouds per world) | PNG or WebP | Opaque (exempt) | World-fit | Code `draw()` paint calls |

Glyph art with no consumer is dead weight in the offline manifest; every art file must have a registry entry or an explicit scenery decision. Scenes have no alpha/size/registry gate.

---

## 2. Coordinate & scale conventions

- Gameplay coordinates unchanged: `cameraX` follow, `groundY = canvas.height - 100`, platforms/pipes/coins/goal/walkers/mice laid out in world pixels per `WORLDS`.
- Glyph assets drawn centred via `Art.draw(ctx, glyph, cx, cy, size)` at current call-site sizes (coins 36, enemies ~20-40, walkers ≤48, goal emblems 26-30).
- Scene backgrounds drawn full-bleed behind `ctx.translate(-cameraX, 0)` gameplay layer; parallax only on background layers, never on gameplay geometry.
- Hero sprites (`game/assets/images/explorer[_kitty]/`) unchanged — 60px tall frames, feet-flush baseline, runtime mirror.

---

## 3. Sprite-sheet / frame conventions

Only where relevant (enemy directional states, walker animation):
- Enemies drawn facing right; caller flips with `ctx.scale(dir, 1)` — no separate left/right assets required unless a future variant is approved.
- Walker pop-out cycle ~3 s preserved; walker bob preserved; coin bob+sparkle+glow preserved.
- No new animation frames added beyond current engine behaviour.

---

## 4. Transparency & edges

- Glyph cut-outs: real alpha, transparent corners, clean edges, no white matte / colored fringe / semi-transparent haze around subject.
- Enforced by `tools/asset_cutout.js` + `tools/check_art.js` (magic bytes = webp, canvas 512×512, alpha corners transparent, consumer exists).
- Scenes: opaque, no transparency requirement.

## 4.5 Depth & 2D platformer constraints (scenes)

Little Explorer is a side-scrolling 2D platformer. `draw()` layers: sky → distant hills (semicircles at `canvas.height` bottom) → clouds → pit hazards → **platforms at `groundY = canvas.height - 100`** → pipes → enemies → collectibles → goal → hero → particles → ceiling → decor.

Scene backgrounds must therefore be **sky/distant-only**:

- **No baked ground line** — platforms are procedural at `groundY`; a baked ground would collide with gameplay geometry.
- **No baked platforms, hazards, enemies, or collectibles** — all are drawn/procedural on top.
- **Distant/low-contrast elements only** — hills, trees, clouds high on the horizon; soft so gameplay elements (hero, platforms, enemies) read clearly in front.
- **Clear negative space in the lower portion** — around the gameplay plane so platforms and the hero stand out.
- **Sky-dominant composition** — the scene fills the screen behind everything but should not compete with gameplay for visual attention.
- **Seamless horizontal continuation** — the world scrolls via `cameraX`; the scene must tile/continue horizontally without obvious seams.
- No ground/platforms baked into the scene; collision uses explicit rects, never image alpha bounds.


---

## 5. Compression & size

- Hard limit 60 KB per glyph file (DECISIONS.md task 360).
- Mean ~27.5 KB expected; 3.6 MB for 131 assets baseline (existing project).
- `tools/asset_qa.js` reports canvas, alpha, palette, palette-match vs bear reference, small-size legibility proxy.

---

## 6. Loading & fallback

- Cache image objects; do not create new Image instances every frame (`Art.image()` memoizes by URL).
- Load required assets before gameplay or use a reliable loading state that prevents invisible gameplay.
- Missing image: never crashes the game loop; `Art` falls back to emoji/procedural (`ctx.fillText`).
- Never silently hide a gameplay-critical missing object; dev-time warning for missing required assets.
- No remote asset URLs; offline-first; local paths only.
- No repeated reloads when changing worlds unnecessarily; memory appropriate for modest Android tablets.

---

## 7. Naming & inventory IDs

- Inventory ID keeps category prefix: `object-water-drop`, `enemy-mouse`, `goal-house`, `terrain-spring-top`, etc.
- Bundle/runtime filename drops category prefix: `water-drop.png`, `mouse.webp`, `house.webp`, `spring-top.webp` (matches existing `food-apple` → `apple.png`, `animal-dog` → `dog.png`).
- Prompt filename drops category prefix: `water-drop.md`.
- Stable asset IDs; explicit world→family mapping; safe fallback when optional decoration absent; no silent fallback to unrelated world's art.

---

## 8. Per-category technical notes

**Backgrounds (scenes):** opaque, seamless horizontal continuation where a world scrolls, parallax layers, no baked-in gameplay platforms/hazards/enemies, clear negative space around gameplay plane, low-contrast distant forms.

**Terrain:** separate top surface from side/underside; consistent edge thickness; tileable/modular; left/centre/right/inner-corner/outer-corner/end-cap variants; no visible seams.

**Platforms:** distinct from background; consistent top+side; readable edges at small scale; modular lengths; moving-platform artwork clear in motion.

**Entrances (pipes):** world-themed; clear emergence point; artwork must not imply a different collision shape; must not occlude enemy during emergence.

**Enemies/walkers:** friendly silhouette; distinct from terrain; required directional/animation states; no appendages obscuring collision body; ≤48 px (walker size gate).

**Hazards:** strong silhouette; danger via shape+colour (not colour alone); preserve exact collision boundaries; decorative effects must not disguise active region.

**Collectibles:** one shared illustrated asset per world; preserve glow+bob+sparkle behaviour; readable at 36 px coin size.

**Goals:** world-specific; clear focal hierarchy; does not cover/misrepresent goal trigger area; compatible with finish trigger/animation.

**Decor/ceiling:** retained procedural (snow/leaves/petals/bubbles, rock ceiling); no image assets.

---

## 9. Gate 1

Art direction (EXPLORER_STYLE_ADDENDUM.md), palettes (EXPLORER_PALETTES.md), and this technical contract reviewed and accepted by the user before large-scale asset generation (Phase 3 Spring pilot).
