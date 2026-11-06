# Art Inventory — Emoticons / Glyphs / Images used in the game

Purpose: list every child-facing emoji/glyph drawn in the games, cross-referenced
against `game/data/art-registry.js` so the team knows which ones already have
painted WebP art and which ones need new art commissioned.

Format: `EMOJI — stem (status)` where status is:
- `✅ art exists` — in ART_REGISTRY, art file at `game/assets/art/<stem>.webp`
- `⚠️ art exists but not used` — in registry, but the game draws CSS/text instead of Art.fill()
- `❌ missing art` — used in a game but NOT in ART_REGISTRY; needs new art

---

## 1. Emojis WITH painted art already (✅)

These are in `game/data/art-registry.js` and `Art.fill()`/`Art.draw()` can swap them for WebP illustrations:

| Emoji | Stem | File |
|-------|------|------|
| 🐶 | dog | assets/art/dog.webp |
| 🐱 | cat | assets/art/cat.webp |
| 🐮 | cow | assets/art/cow.webp |
| 🐄 | cow | assets/art/cow.webp |
| 🦁 | lion | assets/art/lion.webp |
| 🧶 | object-yarn | assets/art/object-yarn.webp |
| 🪴 | object-potted-plant | assets/art/object-potted-plant.webp |
| 👧 | object-girl | assets/art/object-girl.webp |
| 👦 | object-boy | assets/art/object-boy.webp |
| 🐘 | elephant | assets/art/elephant.webp |
| 🐸 | frog | assets/art/frog.webp |
| 🐷 | pig | assets/art/pig.webp |
| 🦆 | duck | assets/art/duck.webp |
| 🦊 | fox | assets/art/fox.webp |
| 🐑 | sheep | assets/art/sheep.webp |
| 🐴 | horse | assets/art/horse.webp |
| 🐔 | chicken | assets/art/chicken.webp |
| 🐻 | bear | assets/art/bear.webp |
| 🦴 | bone | assets/art/bone.webp |
| 🏠 | house | assets/art/house.webp |
| 🍎 | apple | assets/art/apple.webp |
| 🐾 | pawprint | assets/art/pawprint.webp |
| ⭐ | star | assets/art/star.webp |
| 🥁 | drum | assets/art/drum.webp |
| 🌱 | seedling | assets/art/seedling.webp |
| 🌿 | leaves | assets/art/leaves.webp |
| 🎉 | celebration | assets/art/celebration.webp |
| ❄ | snowflake | assets/art/snowflake.webp |
| 🐟 | fish | assets/art/fish.webp |
| ⛏ | pickaxe | assets/art/pickaxe.webp |
| 🚗 | car | assets/art/car.webp |
| 🍌 | banana | assets/art/banana.webp |
| 🐺 | wolf | assets/art/wolf.webp |
| 🐛 | caterpillar | assets/art/caterpillar.webp |
| 🦋 | butterfly | assets/art/butterfly.webp |
| 🌳 | tree | assets/art/tree.webp |
| 🧑‍🎓 | student | assets/art/student.webp |
| 🖥 | screen | assets/art/screen.webp |
| 🪡 | needle | assets/art/needle.webp |
| 👃 | nose | assets/art/nose.webp |
| 🐽 | pig-nose | assets/art/pig-nose.webp |
| 👁 | eye | assets/art/eye.webp |
| 🦃 | turkey | assets/art/turkey.webp |
| 👂 | ear | assets/art/ear.webp |
| 🦩 | flamingo | assets/art/flamingo.webp |
| 🚁 | helicopter | assets/art/helicopter.webp |
| 🌼 | flower | assets/art/flower.webp |
| ⛵ | sailboat | assets/art/sailboat.webp |
| 🧥 | sweater | assets/art/sweater.webp |
| 🎩 | hat | assets/art/hat.webp |
| 🍓 | strawberry | assets/art/strawberry.webp |
| 🍇 | grapes | assets/art/grapes.webp |
| 🍊 | orange | assets/art/orange.webp |
| 🍐 | pear | assets/art/pear.webp |
| 🍉 | watermelon | assets/art/watermelon.webp |
| 🥕 | carrot | assets/art/carrot.webp |
| 🍏 | apple-green | assets/art/apple-green.webp |
| 🥚 | egg | assets/art/egg.webp |
| 🐣 | chick | assets/art/chick.webp |
| 🐦 | bird | assets/art/bird.webp |
| 🧼 | soap | assets/art/soap.webp |
| 💧 | water-drop | assets/art/water-drop.webp |
| 🌰 | acorn | assets/art/acorn.webp |
| 🌻 | sunflower | assets/art/sunflower.webp |
| 🍄 | mushroom | assets/art/mushroom.webp |
| 🦓 | zebra | assets/art/zebra.webp |
| 🦒 | giraffe | assets/art/giraffe.webp |
| 🦌 | deer | assets/art/deer.webp |
| 🐿 | squirrel | assets/art/squirrel.webp |
| 🐓 | rooster | assets/art/rooster.webp |
| 🚜 | tractor | assets/art/tractor.webp |
| 🚀 | rocket | assets/art/rocket.webp |
| 🪐 | planet | assets/art/planet.webp |
| 👨‍🚀 | astronaut | assets/art/astronaut.webp |
| ⛄ | snowman | assets/art/snowman.webp |
| 🛷 | sled | assets/art/sled.webp |
| 🐧 | penguin | assets/art/penguin.webp |
| 🎂 | birthday-cake | assets/art/birthday-cake.webp |
| 🔔 | bell | assets/art/bell.webp |
| 🎈 | balloons | assets/art/balloons.webp |
| 🌈 | rainbow | assets/art/rainbow.webp |
| 🏫 | school | assets/art/school.webp |
| 📝 | notebook | assets/art/notebook.webp |
| 🃏 | playing-cards | assets/art/playing-cards.webp |
| 🀄 | playing-cards | assets/art/playing-cards.webp |
| 🧺 | basket | assets/art/basket.webp |
| 🧭 | compass | assets/art/compass.webp |
| ✏ | pencil | assets/art/pencil.webp |
| 🏅 | medal | assets/art/medal.webp |
| ✨ | celebration | assets/art/celebration.webp |
| 🌟 | celebration | assets/art/celebration.webp |
| ☀ | sun | assets/art/sun.webp |
| 🌙 | moon | assets/art/moon.webp |
| 🌸 | flower-blossom | assets/art/flower-blossom.webp |
| 🍂 | season-leaf | assets/art/season-leaf.webp |
| 🐚 | shell | assets/art/shell.webp |
| 💎 | gem | assets/art/gem.webp |
| 🍬 | wrapped-candy | assets/art/wrapped-candy.webp |
| 🧁 | cupcake | assets/art/cupcake.webp |
| 🍩 | donut | assets/art/donut.webp |
| 🍡 | dango | assets/art/dango.webp |
| 🌴 | palm-tree | assets/art/palm-tree.webp |
| 🏝 | island | assets/art/island.webp |
| 🌋 | volcano | assets/art/volcano.webp |
| 🌵 | cactus | assets/art/cactus.webp |
| 🦜 | parrot | assets/art/parrot.webp |
| 🪨 | rock | assets/art/rock.webp |
| 🚧 | road-barrier | assets/art/road-barrier.webp |
| 🛰 | satellite | assets/art/satellite.webp |
| 🔭 | telescope | assets/art/telescope.webp |
| 🧊 | ice-cube | assets/art/ice-cube.webp |
| 💫 | comet | assets/art/comet.webp |
| 🌠 | comet | assets/art/comet.webp |
| 🐰 | rabbit | assets/art/rabbit.webp |
| 🐭 | mouse | assets/art/mouse.webp |
| 🧀 | cheese | assets/art/cheese.webp |
| ⚽ | ball | assets/art/ball.webp |
| 🌲 | pine-tree | assets/art/pine-tree.webp |
| ⛰ | mountain | assets/art/mountain.webp |
| ⛱ | beach-umbrella | assets/art/beach-umbrella.webp |
| 🏄 | surfboard | assets/art/surfboard.webp |
| 🌊 | wave | assets/art/wave.webp |
| 🎿 | skis | assets/art/skis.webp |
| ⛷ | skier | assets/art/skier.webp |
| 🏮 | evergreen-lantern | assets/art/evergreen-lantern.webp |
| 🦈 | shark | assets/art/shark.webp |
| 🦀 | animal-crab | assets/art/animal-crab.webp |
| 🐙 | animal-octopus | assets/art/animal-octopus.webp |
| 🦇 | bat | assets/art/bat.webp |
| 🐒 | monkey | assets/art/monkey.webp |
| 🌾 | grass | assets/art/grass.webp |
| 🛸 | spaceship | assets/art/spaceship.webp |
| 🕰 | clock | assets/art/clock.webp |
| 🦕 | animal-dinosaur | assets/art/animal-dinosaur.webp |
| 🐬 | animal-dolphin | assets/art/animal-dolphin.webp |
| 🐋 | animal-whale | assets/art/animal-whale.webp |
| 🐞 | animal-ladybug | assets/art/animal-ladybug.webp |
| 🐠 | fish | assets/art/fish.webp |
| 🐤 | chick | assets/art/chick.webp |
| 🐥 | chick | assets/art/chick.webp |
| 🌺 | flower-hibiscus | assets/art/flower-hibiscus.webp |
| 🌷 | flower-tulip | assets/art/flower-tulip.webp |
| 🍀 | plant-clover | assets/art/plant-clover.webp |
| 🍭 | lollipop | assets/art/lollipop.webp |
| 🍙 | food-rice-ball | assets/art/food-rice-ball.webp |
| 🎁 | object-gift | assets/art/object-gift.webp |
| ⚓ | object-anchor | assets/art/object-anchor.webp |
| 💰 | object-money-bag | assets/art/object-money-bag.webp |
| 🚩 | object-flag | assets/art/object-flag.webp |
| 🦉 | owl | assets/art/owl.webp |
| 🧩 | puzzle-piece | assets/art/puzzle-piece.webp |
| ☃ | snowman | assets/art/snowman.webp |

**Cat Forest extras (lines 169-181 of art-registry.js):**
| Emoji | Stem | File |
|-------|------|------|
| 🐈 | cat-forest-tabby | assets/art/cat-forest-tabby.webp |
| 🐈‍⬛ | cat-forest-black-cat | assets/art/cat-forest-black-cat.webp |
| 🐯 | cat-forest-tiger | assets/art/cat-forest-tiger.webp |
| 🐆 | cat-forest-leopard | assets/art/cat-forest-leopard.webp |
| 👑 | object-crown | assets/art/object-crown.webp |
| 🎀 | object-ribbon | assets/art/object-ribbon.webp |
| 🌸 | flower-tulip | assets/art/flower-tulip.webp |
| 🥛 | food-milk | assets/art/food-milk.webp |
| 🍗 | food-chicken-leg | assets/art/food-chicken-leg.webp |
| 🍣 | food-sushi | assets/art/food-sushi.webp |
| 🍪 | food-cookie | assets/art/food-cookie.webp |
| 🍽 | object-plate | assets/art/object-plate.webp |
| 🌧 | weather-rain | assets/art/weather-rain.webp |

---

## 2. Emojis USED in games but WITHOUT painted art (❌ needs new art)

These appear in game code but are NOT in `game/data/art-registry.js`. `Art.fill()` falls back to showing the raw emoji.

| Game | Emoji | Where used | Needed art stem (suggested) |
|------|-------|------------|----------------------------|
| Cat Forest | 🙀 | `CATS[senka].emoji` — weary cat face for night cat `Сенка` | `cat-forest-weary-cat` |
| Cat Forest | ❤️ | Cuddle hearts (CF-09 `spawnFx(pos, '❤️', ...)`) | `object-heart` |
| Classroom Time | 🌅 | `TIME_SCENES[0]` — sunrise (scene image added, registry entry missing) | `scene-sunrise` |
| Classroom Time | 🌇 | `TIME_SCENES[2]` — sunset (scene image added, registry entry missing) | `scene-sunset` |

> Note: Scene images `sunrise.png` and `sunset.png` were added to `game/assets/scenes/` and referenced in `classroom.js` `SCENE_IMAGES`, but the emoji glyphs `🌅`/`🌇` are not yet in `art-registry.js`. Add them so `Art.fill()` can swap the text glyph for the painted illustration on non-scene render sites.

---

## 3. Emojis WITH art but drawn via CSS/text instead of Art.fill() (⚠️ upgrade opportunity)

These have art in the registry, but the game renders them as CSS `::before` content or canvas `fillText` instead of calling `Art.fill()`/`Art.draw()`. The child sees the raw emoji, not the painted illustration.

| Game | Emoji | Where used | Current rendering | Fix |
|------|-------|------------|-------------------|-----|
| Spatial | 🌳 | `sp-tree` part in `spatial.js` scene parts | CSS `.sp-tree::before` (green blob, not the painted tree art) | Use `Art.draw()` or `Art.fill()` for tree parts |
| Spatial | 🍎 | Apple part in `spatial.js` scene parts | CSS/canvas text glyph | Use `Art.draw()` for apple |
| Spatial | Other part emojis | Various scene parts (basket, nest, house, fence, etc.) | Canvas `fillText` emoji | Use `Art.draw()` where art exists |

> The spatial scene parts are drawn on a canvas (`spatial.js` `drawScene`). Each part has an `emoji` property that is drawn with `ctx.fillText`. Even when the emoji exists in `art-registry.js` (e.g. 🌳 → `tree`), the canvas draws the text glyph instead of the painted WebP. To upgrade: replace `ctx.fillText(a, ...)` with `window.Art.draw(ctx, a, x, y, size)`.

---

## 4. Scene background images (already in `game/assets/scenes/`)

These are PNG scene backdrops, not emoji glyphs:

| File | Used by |
|------|---------|
| night-sky.png | classroom.js Time (night) |
| sunrise.png | classroom.js Time (sunrise) — added in this task |
| sunset.png | classroom.js Time (sunset) — added in this task |
| scene-farm.png | animal_puzzle.js (farm theme) |
| scene-forest.png | animal_puzzle.js (forest theme) |
| scene-house.png | animal_puzzle.js (house theme) |
| scene-park.png | animal_puzzle.js (park theme) |
| scene-savanna.png | animal_puzzle.js (savanna theme) |
| scene-sea.png | animal_puzzle.js (sea theme) |
| scene-space.png | animal_puzzle.js (space theme) |
| scene-winter.png | animal_puzzle.js (winter theme) |

---

## 5. Summary

- **Art already exists:** ~120 emoji glyphs have painted WebP art in `game/assets/art/`
- **Art missing (needs commissioning):** 4 emoji glyphs — 🙀, ❤️, 🌅, 🌇
- **Art exists but not used via Art.fill():** Spatial scene parts (🌳, 🍎, and others) drawn as canvas text instead of painted illustration
- **Scene backdrops:** 10 PNG files in `game/assets/scenes/`

## Recommended next steps

1. Commission painted WebP art for: 🙀 (weary cat), ❤️ (heart), 🌅 (sunrise scene), 🌇 (sunset scene)
2. Register 🌅 and 🌇 in `game/data/art-registry.js` pointing to the scene images
3. Upgrade `spatial.js` to use `Art.draw()` for scene parts that have art in the registry
4. Verify all `Art.fill()` calls have a matching registry entry (the registry throws if a glyph has no art — it falls back to text, which is safe)
