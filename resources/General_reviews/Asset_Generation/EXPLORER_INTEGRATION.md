# Little Explorer — Renderer Integration Design (Phase 2, task 407)

**Project:** Little Play / Petrin svet — Мала истраживачица (Little Explorer)
**Scope:** Data-driven mapping layer in `game/games/kitty-standalone.js` `draw()` that resolves world/element IDs to visual assets, while keeping gameplay, collision, physics, camera, and world dimensions unchanged.
**Relationship:** Companion to `EXPLORER_STYLE_ADDENDUM.md`, `EXPLORER_PALETTES.md`, `EXPLORER_TECHNICAL_CONTRACT.md`, `EXPLORER_ASSET_MAP.md`. No `game/` changes in this task; design doc only.
**Status:** Proposed — Gate 2 acceptance pending before implementing a full world.

---

## 1. Architectural approach

Prefer a small data-driven rendering layer that maps world and element IDs to visual assets, layered on top of the existing `draw()` pipeline. Do not refactor the entire engine; prefer the smallest maintainable change that supports the redesign (plan §8.1).

Conceptual mapping (not a mandate to create these exact files):
```
game/assets/scenes/      # opaque full-bleed world backgrounds (one per world)
game/assets/art/         # 512×512 alpha WebP glyphs (one per registry stem)
  terrain-<world>-top.webp
  terrain-<world>-side.webp
  platform-<world>.webp
  pipe-<world>.webp
  enemy-<type>.webp
  walker-<type>.webp
  collectible-<item>.webp
  goal-<type>.webp
```

Keep visual representation separate from gameplay data:
- World / level data (`WORLDS`) — unchanged.
- Physics and collision geometry (explicit rects) — unchanged.
- Entity behaviour (enemy AI, spawn, walker patrol) — unchanged.
- Render asset selection — new mapping layer.
- Render transforms / animation state — unchanged.

An asset may visually extend beyond its collision box; that is acceptable if collision remains correct and the visual does not mislead the player. Image alpha bounds never replace explicit collision geometry (plan §8.2).

---

## 2. What becomes an image asset vs. what stays procedural

**Become images (per EXPLORER_TECHNICAL_CONTRACT.md):**
- World backgrounds → `game/assets/scenes/scene-<world>.png` (opaque).
- Terrain tiles (top/side + corner/end-cap variants) → `game/assets/art/`.
- Platforms (static + moving) → `game/assets/art/`.
- Pipes / entrances → `game/assets/art/`.
- Pipe pop-out enemies (8 types) → `game/assets/art/`.
- Ground walkers (11 types) → `game/assets/art/` (≤48 px, walker size gate).
- Collectibles (per-world item on coins) → reuse existing glyph where scale fits.
- Goals (9 types) → `game/assets/art/`.

**Stay procedural (plan §8.6 — simple effects / tiny particles / repeated low-detail / dynamic geometry):**
- Coin glow + bob + sparkle (preserve exactly).
- Particle system (preserve exactly).
- `drawDecor` (snow / leaves / petals / bubbles) — retained procedural.
- `drawCeiling` (underground / cave rock) — retained procedural.
- Distant hills / clouds / stars — may be folded into scene art or kept procedural per world.
- Hero sprite animation state machine — unchanged.
- All physics / collision / enemy AI / platform movement / camera — unchanged.

---

## 3. Integration points in `draw()` (current pipeline, lines 1588–1745)

`draw()` order:
1. Sky fill → night stars → distant hills → clouds → `drawPitHazards()` → static platforms → moving platforms → pipes → pipe pop-out enemies (`drawEnemy`) → ground walkers (`drawWalker`) → collectible coins (`theme.collectible`) → `drawGoal()` → hero sprite → particles → ceiling → `drawDecor()`.

Mapping per call site:
- Sky/hills/clouds/stars → scene background (parallax layers where supported).
- `drawPitHazards()` → keep procedural gradients; replace `Art.draw(ctx,'🐟')` water fish with existing fish glyph (already registry-mapped).
- Static platforms / moving platforms → terrain + platform glyphs drawn at `p.x,p.y` with `p.width,p.height`; keep collision rects identical.
- Pipes → pipe glyph at pipe rect; keep side-collision logic identical.
- `drawEnemy(theme.enemy)` → enemy glyph at pop-out position; keep clip rect + rise/hold/slide timing identical.
- `drawWalker(theme.walker)` → walker glyph at patrol position; keep bob + flip logic identical.
- Coins `theme.collectible` → existing collectible glyph via `Art.draw`; keep glow+bob+sparkle.
- `drawGoal(theme.goal)` → goal glyph at goal rect; keep finish-trigger hitbox identical.
- Hero → unchanged sprite state machine.
- Particles / ceiling / decor → unchanged procedural.

---

## 4. Collision preservation

Collision uses explicit rects (groundY-based platforms, pipes, walkers, goal, coins, enemies). The integration must not derive collision from image alpha bounds or dimensions. Where a glyph visually extends beyond its collision box, the collision rect stays the explicit gameplay rect. No `getImageData`/alpha-based collision (file:// compatibility, plan §8.2).

Walkers: `WALKER_FOOT` offsets and groundY placement unchanged. Enemies: pop-out clip rect and hit box unchanged. Goal: `goal.x/y/width/height` trigger unchanged. Coins: 18 px collection radius unchanged.

---

## 5. Asset loading

- `Art.image(glyph)` memoizes `HTMLImageElement` by URL (existing in art.js) — no per-frame Image creation.
- Required assets load before gameplay or via a reliable loading state.
- Missing image → emoji/procedural fallback via `Art.draw`/`Art.fill`; never crashes the loop; never hides a gameplay-critical object silently.
- Dev-time warning for missing required assets (console).
- No remote URLs; offline-first; local paths only.
- No repeated reloads on world change; cache keyed by URL.
- Memory appropriate for modest Android tablets; 60 KB/file glyph cap.

---

## 6. Rendering behaviour

- Background layers drawn in stable order (scene first, then gameplay).
- Parallax only on background layers, never on gameplay geometry.
- World-coordinate transform `ctx.translate(-cameraX, 0)` applied consistently; camera follow unchanged.
- Gameplay-critical objects at predictable z-order (background < terrain < platforms < pipes < enemies < collectibles < goal < hero < particles).
- No excessive per-frame allocations; reuse cached images.
- No expensive filters, giant textures, or unnecessary canvas resizing.
- Motion calm and purposeful; not every decorative object animated.

---

## 7. World→element mapping (from EXPLORER_ASSET_MAP.md)

Enemy × world: mouse (spring/summer/autumn/winter), mole (underground), bat (cave), piranha (water), snake (savanna), oni (japan), penguin (northpole), scorpion (egypt).
Walker × world: ladybug (spring), bee (summer), hedgehog (autumn), snowman (winter), worm (underground), spider (cave), crab (water), meerkat (savanna), panda (japan), seal (northpole), scarab (egypt).
Goal × world: house (spring/summer/autumn/winter), mine (underground), cave (cave), hut (savanna), torii (japan), igloo (northpole), pyramid (egypt), submarine (water).
Collectible × world: strawberry/watermelon/apple/carrot/mushroom/grapes/shell/banana/rice-ball/gift/palm-tree.

---

## 8. Gate 2

Integration design confirmed to preserve collision and gameplay independently from artwork before implementing a full world (Phase 3 Spring). The design doc must be reviewed/accepted by the user; no `game/` edits or asset generation until Gate 2.
