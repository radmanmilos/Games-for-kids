# Little Explorer — Asset Map (Phase 0, task 401)

**Source:** current game/games/kitty-standalone.js WORLDS registry and named render functions (draw(), drawEnemy(), drawWalker(), drawGoal()). Verified 2026-11-07; line numbers omitted because the renderer is changing.

**Protected (unchanged in this redesign, per plan §5/§9 and DECISIONS.md):** Explorer/Kitty character sprites + animation frames; player physics/collision; enemy AI/speed/spawn; platform movement; camera/world dimensions; level order/world count/progression; collectible values; touch controls; audio; win/lose conditions. Serbian Cyrillic child text; Serbian speech. Offline-first; no remote assets.

**Render pipeline (draw()):** world scene image (or procedural sky/hills/clouds fallback) → drawPitHazards() → static platforms → moving platforms → pipes → pipe pop-out enemies (drawEnemy) → ground walkers (drawWalker) → collectible coins (theme.collectible) → drawGoal() → hero sprite → particles → ceiling → drawDecor().

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

**Background layer (sky + hills + clouds + night stars)** — one opaque image per world from game/assets/scenes/, selected from WORLDS[].scene in loadWorld() and tiled horizontally in draw(); procedural sky/hills/clouds are the fallback when no image is loaded. Scene selection now changes on every world load. There are no separate parallax layers yet.
- QA note: current screenshots do not include PLAY states. The Water scene has a strong seabed/seaweed band near the bottom and needs in-game readability review.

**Terrain (grounds + floats + stairs)** — `platforms` built from `w.grounds` + `w.floats` + `w.stairs`; drawn as white border + `p.color` fill + paper stitch line.
- Treatment: terrain tile family (top surface + side/underside, left/centre/right/corner/end-cap variants), tileable, consistent edge thickness and collision readability. Transparent glyph cut-outs in `game/assets/art/`.

**Platforms (moves)** — `movingPlatforms` from `w.moves`, same white-border + fill + stitch drawing.
- Treatment: platform family distinct from background, readable edges at small scale, modular lengths. Moving platform artwork must stay clear in motion.

**Pipes / entrances** — `pipes` from `w.pipes`; drawn as themed spawner with white border, pipeColor fill, cap strip.
- Treatment: world-themed entrance, clear emergence point, no decoration/spawn ambiguity, artwork must not imply a different collision shape, must not occlude enemy during emergence.

**Pipe pop-out enemies (drawEnemy)** — mouse, bat, and penguin now reuse approved mouse.webp, bat.webp, and penguin.webp through drawExplorerArt(); procedural fallback remains until each image loads. Mole, piranha, snake, oni, and scorpion remain procedural and need art.
- Treatment: friendly, distinct silhouettes; preserve current spawn timing, movement, and collision.

**Ground walkers (drawWalker)** — snowman and crab now reuse approved snowman.webp and animal-crab.webp; the other walkers remain procedural. animal-ladybug.webp exists but is only CANDIDATE in the inventory and is not used.
- Treatment: patrol sprites remain smaller than Kitty (48px), preserve the caller's direction flip and existing foot/collision data.

**Hazards (`drawPitHazards`)** — water (gradient + 🐟 via Art.draw), lava (gradient + bubbles), spikes (dark fill + triangles).
- Treatment: strong silhouette, clear danger via shape+colour (not colour alone), decorative effects must not disguise collision, preserve exact collision boundaries.

**Collectibles (coins, theme.collectible)** — coins bob+sparkle+glow; `theme.collectible` emoji drawn via `Art.draw(ctx, theme.collectible, ...)` with glow backing.
- Treatment: one shared illustrated collectible per world (strawberry/watermelon/apple/carrot/shell/banana/rice-ball/orange/etc.), reused where meaning fits. Preserve glow+bob+sparkle behaviour.

**Goals (drawGoal)** — the Spring house goal now reuses approved house.webp; other seasonal house goals and mine/cave/arch/hut/torii/igloo/pyramid/submarine structures remain procedural. Pickaxe/sparkle/shell details already use registered glyph art where present.
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


## Verified implementation delta — 2026-11-07 (Task 429)

- All 11 background image files are present in the runtime scene directory. They are one horizontally tiled layer per world, not a multi-layer parallax system.
- loadWorld() now updates the selected scene source when the world changes; a smoke regression check covers all 11 world entries.
- Reused approved art: mouse, bat, penguin, snowman, crab, and Spring house. Collectibles were already integrated through Art.draw; water hazard uses the existing fish glyph. Procedural fallback remains during loading.
- Terrain and pipes remain procedural. Task 429 contains 18 user-authorized candidates; four other prompt files require local WIP verification. Static/moving platform family, remaining enemy/walker art, and most goal structures remain outstanding.
- No physics, collision geometry, spawn timing, platform movement, player sprites, HUD, or progression changes.
