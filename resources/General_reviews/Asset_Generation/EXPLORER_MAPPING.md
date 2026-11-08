# Little Explorer — Gameplay Entity ↔ Visual Asset Mapping (Phase 2, task 409)

**Project:** Little Play / Petrin svet — Мала истраживачица (Little Explorer)
**Scope:** Explicit mapping between every gameplay entity rendered in `game/games/kitty-standalone.js` `draw()` and its visual asset (image or documented procedural retention). Design doc only — no `game/` changes, no asset generation.
**Relationship:** Derived from `EXPLORER_ASSET_MAP.md` (task 401) and `EXPLORER_LOADING.md` (task 408).
**Status:** Proposed — Gate 2 acceptance pending before implementing a full world.

---

## 1. `draw()` call-site → asset mapping

| `draw()` section (line approx.) | Entity | Current implementation | Mapped asset | Treatment |
|---|---|---|---|---|
| Sky fill (1590) | World background | `ctx.fillStyle = theme.bgSky; fillRect` | `scene-<world>` (`game/assets/scenes/scene-<world>.png`) | Opaque scene art |
| Night stars (1599) | Night sky decor | `ctx.fillRect` stars | Retained procedural (or folded into scene) | Procedural |
| Distant hills (1607) | Hills | `ctx.arc` hills | `scene-<world>` background layer | Scene art or procedural |
| Clouds (1616) | Clouds | `ctx.arc` clouds | `scene-<world>` background layer | Scene art or procedural |
| `drawPitHazards()` (1627) | Pits (water/lava/spikes) | gradients + triangles | `hazard-water`/`hazard-lava`/`hazard-spikes` | Retained procedural (collision-preserving) |
| Water fish (1566) | Fish decor | `Art.draw(ctx,'🐟')` | Existing `fish` glyph (registry-mapped) | Reuse existing glyph |
| Static platforms (1630) | Ground/floats/stairs | white border + fill + stitch | `terrain-<world>-top`/`-side` + variants | Transparent glyph tile family |
| Moving platforms (1641) | Moving platforms | white border + fill + stitch | `platform-<world>` | Transparent glyph |
| Pipes (1652) | Pipe entrances | themed spawner rect | `pipe-<world>` | Transparent glyph, collision-preserving |
| Pipe enemies `drawEnemy()` (1674) | Mouse/mole/bat/piranha/snake/oni/penguin/scorpion | procedural arcs/paths | `enemy-<type>` | Transparent glyph, friendly silhouette |
| Ground walkers `drawWalker()` (1684) | 11 walker types | procedural | `walker-<type>` | Transparent glyph ≤48 px |
| Collectible coins (1689) | Per-world item | `Art.draw(ctx, theme.collectible)` + glow/bob/sparkle | `collectible-<item>` (reuse existing glyph) | Reuse existing glyph; preserve glow/bob/sparkle |
| Goal `drawGoal()` (1715) | house/mine/cave/arch/hut/torii/igloo/pyramid/submarine | procedural building | `goal-<type>` | Transparent glyph goal landmark |
| Hero sprite (1718) | Explorer/Kitty | sprite frames (unchanged) | `game/assets/images/explorer[_kitty]/` | Out of scope — unchanged |
| Particles (1730) | Particles | `ctx.arc` circles | Retained procedural | Procedural |
| Ceiling `drawCeiling()` (1742) | Rock ceiling | procedural | Retained procedural | Procedural |
| Decor `drawDecor()` (1744) | Snow/leaves/petals/bubbles | procedural | Retained procedural | Procedural |

---

## 2. Enemy × world × asset

| World | Pipe enemy | asset | Ground walker | asset |
|---|---|---|---|---|
| spring | mouse | enemy-mouse | ladybug | walker-ladybug |
| summer | mouse | enemy-mouse | bee | walker-bee |
| autumn | mouse | enemy-mouse | hedgehog | walker-hedgehog |
| winter | mouse | enemy-mouse | snowman | walker-snowman |
| underground | mole | enemy-mole | worm | walker-worm |
| cave | bat | enemy-bat | spider | walker-spider |
| water | piranha | enemy-piranha | crab | walker-crab |
| savanna | snake | enemy-snake | meerkat | walker-meerkat |
| japan | oni | enemy-oni | panda | walker-panda |
| northpole | penguin | enemy-penguin | seal | walker-seal |
| egypt | scorpion | enemy-scorpion | scarab | walker-scarab |

---

## 3. Goal × world × asset

| World | Goal type | asset |
|---|---|---|
| spring | house | goal-house |
| summer | house | goal-house |
| autumn | house | goal-house |
| winter | house | goal-house |
| underground | mine | goal-mine |
| cave | cave | goal-cave |
| water | submarine | goal-submarine |
| savanna | hut | goal-hut |
| japan | torii | goal-torii |
| northpole | igloo | goal-igloo |
| egypt | pyramid | goal-pyramid |

(`goal-arch` exists in `drawGoal()` but is unused by any world; keep procedural or drop.)

---

## 4. Collectible × world × asset

| World | Collectible glyph | asset |
|---|---|---|
| spring | 🍓 strawberry | existing strawberry glyph |
| summer | 🍉 watermelon | existing watermelon glyph |
| autumn | 🍎 apple | existing apple glyph |
| winter | 🥕 carrot | existing carrot glyph |
| underground | 🍄 mushroom | existing mushroom glyph |
| cave | 🍇 grapes | existing grapes glyph |
| water | 🐚 shell | existing shell glyph |
| savanna | 🍌 banana | existing banana glyph |
| japan | 🍙 rice-ball | existing food-rice-ball glyph |
| northpole | 🎁 gift | existing object-gift glyph |
| egypt | 🌴 palm-tree | existing palm-tree glyph |

Reuse existing glyphs where scale fits the 36 px coin render; no new asset required unless a glyph is missing or unreadable at that size.

---

## 5. Decor / hazard retention

- `drawDecor` (snow/leaves/petals/bubbles): retained procedural — no image assets.
- `drawCeiling` (rock ceiling): retained procedural — no image assets.
- `drawPitHazards` gradients: retained procedural; collision bounds preserved exactly. Water fish uses existing `fish` glyph.

---

## 6. Unmapped / intentionally retained

Everything listed as "Retained procedural" above has a documented reason (plan §8.6: simple effects, tiny particles, repeated low-detail elements, dynamic geometry). No `drawX` call site is left unmapped without a documented retention reason.

Gate 2: this mapping (with EXPLORER_INTEGRATION.md + EXPLORER_LOADING.md) confirmed to preserve collision/gameplay before Phase 3 Spring implementation.


## Verified runtime mapping — 2026-11-07 (Task 429)

| Element | Current runtime art | Status |
|---|---|---|
| World backgrounds | game/assets/scenes/scene-*.png; keys use scene-water and scene-winter-explorer | 11 images integrated; single tiled layer; world-switch source fix in Task 429 |
| Collectibles | Existing ART_REGISTRY glyphs via Art.draw | Already integrated; no new generation required |
| Water hazard fish accent | Existing fish.webp via Art.draw | Already integrated; water body remains procedural |
| Mouse / Bat / Penguin | mouse.webp, bat.webp, penguin.webp | Reused approved assets |
| Snowman / Crab | snowman.webp, animal-crab.webp | Reused approved assets |
| Spring goal | house.webp | Reused approved asset for Spring only |
| Terrain / pipes | No production art in tracked game/assets/art/ | 18 user-authorized candidates blocked by Cloudflare quota; 4 extra prompts need local WIP audit |
| Static / moving platforms | Procedural fills and stitch line | Separate platform family still needs a brief |
| Remaining enemies / walkers | Procedural | Missing art or existing candidate review |
| Other goal structures | Procedural | Mine, cave, submarine, hut, torii, igloo, pyramid still need art direction/assets |

The Explorer and Kitty player sprite sets, collision boxes, movement, enemy AI, pipe spawn timing, platform movement, camera, controls, progression, and HUD remain unchanged. Existing art is used only when its image has loaded; procedural fallback remains during loading.
