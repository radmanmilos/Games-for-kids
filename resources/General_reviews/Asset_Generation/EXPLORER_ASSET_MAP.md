# Little Explorer — Asset Map (Phase 0, task 401)

**Source:** `game/games/kitty-standalone.js` `WORLDS[11]` (lines 602–862) and `draw()` pipeline (lines 1588–1745). Extracted from current source; not fabricated.

**Protected (unchanged in this redesign, per plan §5/§9 and DECISIONS.md):** Explorer/Kitty character sprites + animation frames; player physics/collision; enemy AI/speed/spawn; platform movement; camera/world dimensions; level order/world count/progression; collectible values; touch controls; audio; win/lose conditions. Serbian Cyrillic child text; Serbian speech. Offline-first; no remote assets.

**Render pipeline (`draw()`, lines 1588–1745):** sky fill → night stars → distant hills → clouds → `drawPitHazards()` → static platforms → moving platforms → pipes → pipe pop-out enemies (`drawEnemy`) → ground walkers (`drawWalker`) → collectible coins (`theme.collectible`) → `drawGoal()` → hero sprite → particles → ceiling → `drawDecor()`.

---

## World roster (11)

| # | World ID | Serbian name | Collectible | Pipe enemy | Ground walker | Goal | Music | Pit hazard | Decor | Ceiling | Night |
|---|----------|--------------|-------------|------------|---------------|------|-------|------------|-------|---------|-------|
| 1 | spring | Пролећни дан | 🍓 | mouse | ladybug | house | spring | water | null | no | no |
| 2 | summer | Летњи залазак | 🍉 | mouse | bee | house | summer | water | null | no | no |
| 3 | autumn | Јесења ноћ | 🍎 | mouse | hedgehog | house | autumn | spikes | leaves | no | yes |
| 4 | winter | Зимски снег | 🥕 | mouse | snowman | house | winter | spikes | snow | no | no |
| 5 | underground | Подземље | 🍄 | mole | worm | mine | underground | lava | null | yes | no |
| 6 | cave | Пећина | 🍇 | bat | spider | cave | cave | lava | null | yes | yes |
| 7 | water | Подводни свет | 🐚 | piranha | crab | submarine | water | spikes | bubbles | no | no |
| 8 | savanna | Савана | 🍌 | snake | meerkat | hut | savanna | spikes | null | no | no |
| 9 | japan | Јапан | 🍙 | oni | panda | torii | japan | water | petals | no | no |
|10 | northpole | Северни пол | 🎁 | penguin | seal | igloo | northpole | spikes | snow | no | no |
|11 | egypt | Египат | 🌴 | scorpion | scarab | pyramid | egypt | spikes | null | no | no |

---

## Per-world element → current implementation → proposed treatment

**Background layer (sky + hills + clouds + night stars)** — procedural `ctx.fillRect`/`ctx.arc` in `draw()`.
- Treatment: replace with full-bleed scene art per world (opaque PNG in `game/assets/scenes/`, exempt from alpha gate per DECISIONS.md task 360). Parallax only on background layers. No baked-in gameplay platforms/hazards/enemies. Clear negative space around gameplay plane.

**Terrain (grounds + floats + stairs)** — `platforms` built from `w.grounds` + `w.floats` + `w.stairs`; drawn as white border + `p.color` fill + paper stitch line.
- Treatment: terrain tile family (top surface + side/underside, left/centre/right/corner/end-cap variants), tileable, consistent edge thickness and collision readability. Transparent glyph cut-outs in `game/assets/art/`.

**Platforms (moves)** — `movingPlatforms` from `w.moves`, same white-border + fill + stitch drawing.
- Treatment: platform family distinct from background, readable edges at small scale, modular lengths. Moving platform artwork must stay clear in motion.

**Pipes / entrances** — `pipes` from `w.pipes`; drawn as themed spawner with white border, pipeColor fill, cap strip.
- Treatment: world-themed entrance, clear emergence point, no decoration/spawn ambiguity, artwork must not imply a different collision shape, must not occlude enemy during emergence.

**Pipe pop-out enemies (`drawEnemy`)** — mouse, mole, bat, piranha, snake, oni, penguin, scorpion (procedural arcs/paths).
- Treatment: enemy visual per type; friendly silhouette, distinct from terrain, expressions suitable for young children, required directional/animation states, no decorative appendages obscuring collision body.

**Ground walkers (`drawWalker`)** — ladybug, bee, hedgehog, snowman, worm, spider, crab, meerkat, panda, seal, scarab (procedural).
- Treatment: patrol enemies drawn facing right, caller flips with `ctx.scale(dir,1)`. Smaller than kitty (48px). Same friendly/readable requirements.

**Hazards (`drawPitHazards`)** — water (gradient + 🐟 via Art.draw), lava (gradient + bubbles), spikes (dark fill + triangles).
- Treatment: strong silhouette, clear danger via shape+colour (not colour alone), decorative effects must not disguise collision, preserve exact collision boundaries.

**Collectibles (coins, theme.collectible)** — coins bob+sparkle+glow; `theme.collectible` emoji drawn via `Art.draw(ctx, theme.collectible, ...)` with glow backing.
- Treatment: one shared illustrated collectible per world (strawberry/watermelon/apple/carrot/shell/banana/rice-ball/orange/etc.), reused where meaning fits. Preserve glow+bob+sparkle behaviour.

**Goals (`drawGoal`)** — house, mine, cave, arch, hut, torii, igloo, pyramid, submarine (procedural buildings).
- Treatment: world-specific memorable destination, clear focal hierarchy, does not cover/misrepresent goal trigger area. Compatible with finish trigger/animation.

**Decor (`drawDecor`)** — snow/leaves/petals/bubbles (procedural particles).
- Treatment: retain procedural (simple effects/tiny particles/repeated low-detail per plan §8.6). No image needed.

**Ceiling (`drawCeiling`)** — rock ceiling for underground/cave (procedural).
- Treatment: retain procedural.

**Hero** — Explorer/Kitty sprites under `game/assets/images/explorer[_kitty]/`, 6 frames, runtime mirror. UNCHANGED.

**HUD** — explorer.html: level-num, world-name, coin-count, worlds-btn, music-btn, fun-speed-btn, win-modal, char-modal, worlds-modal, btn-left/right/jump, back-btn. UNCHANGED (no visual redesign of HUD per plan §17 non-goals).

---

## Art vs scene placement decision (DECISIONS.md task 360)

- `game/assets/art/` — glyph cut-outs only, 512×512 real-alpha WebP, one file per registry stem, enforced by `tools/check_art.js`. Use for: platforms, terrain tiles, pipes, enemies, walkers, hazards, collectibles, goals (where a glyph-sized cut-out suffices).
- `game/assets/scenes/` — full-bleed opaque scene art, exempt from alpha/size/registry rules; consumer is code (`paint()`/draw in the game). Use for: world backgrounds (sky/hills/clouds).

---

## Enemies × worlds (for Phase 5 review)

mouse: spring, summer, autumn, winter | mole: underground | bat: cave | piranha: water | snake: savanna | oni: japan | penguin: northpole | scorpion: egypt
ladybug: spring | bee: summer | hedgehog: autumn | snowman: winter | worm: underground | spider: cave | crab: water | meerkat: savanna | panda: japan | seal: northpole | scarab: egypt

---

## Goals × worlds

house: spring, summer, autumn, winter | mine: underground | cave: cave | arch: (water, unused) | hut: savanna | torii: japan | igloo: northpole | pyramid: egypt | submarine: water

---

## Collectible × worlds (theme.collectible, drawn via Art.draw on coins)

spring 🍓 | summer 🍉 | autumn 🍎 | winter 🥕 | underground 🍄 | cave 🍇 | water 🐚 | savanna 🍌 | japan 🍙 | northpole 🎁 | egypt 🌴

---

## Validation

- 11 worlds confirmed in WORLDS; every world has: name, collectible, enemy, walker, goal, music, pitHazard, decor, grounds/floats/stairs/moves/pipes/walkers/coins, goalX.
- Every `drawX` call site in `draw()` has a mapped category above; decor and ceiling retained procedural (plan §8.6).
- Hero + HUD explicitly out of scope (unchanged).
