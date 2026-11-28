# 🐱 Мачја шума (Cat Forest)

**Current implementation:** expanded village, pond, woodland, workshop and cat diary (task 467).
**Runtime:** offline-only; no external libraries, network requests, ads, purchases, currency or pressure mechanics.

## Product rules

- Calm, cozy, forgiving experience for young children. No coins, gems, XP, levels, locks, score, visible counters, timers, fail states, offline earnings or notifications.
- Essential interactions work with simple taps and forgiving touch targets. No essential instruction is delivered only through sound.
- All child-facing visible text, accessible labels and speech are Serbian Cyrillic.
- Day/night and rain are optional settings; they do not change rewards or progression.
- Cats remain friendly and safe. The child may explore, gather, craft, decorate, feed and revisit without losing collected items.

## Runtime files

- Engine: `game/games/cat_forest.js` (`window.startCatForest`, deterministic `window.__catForest` test hook)
- Page: `game/pages/cat_forest.html`
- Scene illustrations: `game/assets/scenes/cat-forest-{village,pond,woodland,workshop}.svg`
- Registry: `game/data/app-registry.js` (`cat_forest`, offline/toddler)
- Smoke: `tools/cat_forest_smoke.js`
- Deterministic visual states: `tools/visual-states.json` (`INIT`, `PLAY`, `POND`, `WOODLAND`, `WORKSHOP`, `DECOR`, `DIARY`)
- Review battery: `resources/General_reviews/Screenshot_Review/`
- Product/visual decisions: `project/DECISIONS.md`, `resources/General_reviews/Cat_Forest/`

## Scenes and interactions

### Village

- Three feeding plates remain at fixed stage-fraction anchors in `FEED_ANCHORS`: x = 0.26 / 0.50 / 0.74, y = 0.62.
- Cats visit, eat, rest and leave gifts. Feeding consumes one gathered fish when the cat begins eating.
- Four fixed decoration anchors (`DECOR_ANCHORS`) sit at the garden edges. An empty anchor accepts the selected crafted item; tapping a placed item with no selection returns it to storage. Replacing an occupied anchor returns the previous decoration to storage; nothing is destroyed.
- The village is the default scene. The bottom navigation gives direct access to the pond, woodland, workshop and diary.

### Pond

- `#cf-fishing-spot` gathers one fish per tap, up to `FISH_BASKET_CAP` (24).
- `#cf-fish-basket` shows a small visual sample; no numeric count is displayed.
- Fish are consumed once when a cat begins eating, not when a treat is merely placed.

### Woodland

- `#cf-gather-spot` gathers one wood per tap, up to `WOOD_BASKET_CAP` (50).
- `#cf-wood-basket` shows a small visual sample without digits or counters.

### Workshop

- Six recipes are visible from the start; none are locked and crafting is instant.
- Each recipe consumes its listed wood amount and one specific cat-gift keepsake (`RECIPES[].gift`). Fish are not a crafting ingredient.
- A crafted item enters the crafted tray/storage. The child selects it, returns to the village and taps one of the four fixed garden anchors.
- Selecting a new item and tapping an occupied anchor replaces the old item and returns the old one to storage. Removing a placed item also returns it to storage.

### Cat diary

- The diary is an overlay, not a fifth world scene.
- It shows discovered cats only: large portrait, visible Serbian Cyrillic name, a short fact, favourite place and favourite treat indicators.
- No unseen-cat silhouettes, empty slots for undiscovered cats, completion totals, percentages or visit-count hearts are shown.
- Tapping a discovered cat card still offers the gentle cuddle interaction.

## Visual system and responsive UI

- Four separate local SVG scene illustrations are loaded by `SCENE_ART` into `#cf-scene-bg`. They use the approved warm wood, cream, terracotta, sage and dusty-blue palette, organic layered silhouettes, soft gradients and a subtle paper-grain/wash treatment.
- The scene image is an actual `img` element (not a CSS-only background) so loading can be awaited by screenshot capture and is included in the offline inventory.
- Scene navigation is a persistent bottom row. Day/night and rain remain separate top-right controls. Scene-specific return-to-village buttons appear in the pond, woodland and workshop.
- Inventory is represented by compact baskets and a short sample of resource sprites, not long horizontal rows of dozens of tiny icons.
- Reduced-motion mode removes non-essential movement and transitions while preserving every interaction and its feedback.

## Tunable data

The engine owns the only source of tunables and data:
- `CF`: timing, touch thresholds, visitor/gift limits, animation and particle budgets.
- `TREATS`: five feeding treats.
- `CATS`: ten cat definitions; each includes a Serbian Cyrillic name, short diary fact and favourite place.
- `GIFTS`: five keepsake types.
- `RECIPES`: six wood + keepsake recipes.
- `FEED_ANCHORS`: three fixed feeding positions.
- `DECOR_ANCHORS`: four fixed garden decoration positions.
- `SCENES` / `SCENE_ART`: four navigable world scenes and their local SVG paths.

## Persistence: `catForestSave` schema v3

The current save is:

```js
{
  v: 3,
  met: [/* discovered cat ids */],
  resources: { fish, wood },
  keepsakes: [/* cat-gift emoji */],
  crafted: [{ id, e }],
  placedDecorations: [{ id, e, s }],
  scene,
  settings: { time, weather },
  visitCounts,
  metTimes
}
```

- Gathered fish and wood, collected keepsakes, crafted inventory, placed decorations, selected scene and day/weather settings persist.
- Cat positions, active visits, plate contents, transient selection, selected recipe and selected crafted item remain transient.
- The code that existed immediately before this overhaul already wrote a live v2 save. Therefore the expanded format uses **v3**, rather than reusing v2 and misreading existing data.
- Live v2 saves migrate to v3: discovered cats and fish/wood resources are preserved; up to four old decorations are assigned to fixed anchors; overflow decorations are moved into crafted storage. Existing v2 data is not silently discarded.
- The older v1 base-game save is intentionally discarded on this full-overhaul version bump, as explicitly approved in the 2026-11-26 expansion decision.
- Invalid JSON and unknown versions safely start fresh. Storage failures never block play.
- Parent reset clears the existing local storage key.

## Test hook

The test hook is not used by runtime gameplay. It exposes deterministic controls including `seed`, `pause`, `step`, `place`, `setResources`, `selectRecipe`, `craftNow`, `selectCrafted`, `placeCrafted`, `removeDecoration`, `setScene`, `setMet`, `setTime`, `setWeather` and `reset`.

The cat-visit timing guard remains important: a cat is in the `sitting` phase only for a short interval, so smoke and screenshot hooks must poll for the named phase instead of using a fixed long step.

## Verification and release status

- Targeted smoke: `node tools/cat_forest_smoke.js`.
- Fast project gate: `node tools/check_fast.js` (includes syntax, registry, generated-artifact and offline-inventory checks).
- Release gate: `node tools/run_all.js offline_smoke.mjs --concurrency 1` plus the configured Cat Forest smoke matrix.
- Screenshot capture: `node tools/screenshot.js --review=Screenshot_Review --pages=cat_forest --task=467`, plus the named visual states.
- The screenshot review is required at phone portrait, phone landscape, tablet and desktop. Automated screenshot capture does not replace real-device performance or child playtesting.
