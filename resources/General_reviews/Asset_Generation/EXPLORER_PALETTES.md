# Little Explorer — World Palette Sheets (Phase 1, task 404)

**Project:** Little Play / Petrin svet — Мала истраживачица (Little Explorer)
**Scope:** One palette sheet per world (11 worlds). Each sheet: primary environment colours, secondary colours, accent colours, ground/platform materials, background atmosphere, hazard colours, enemy contrast requirements, goal landmark colours.
**Relationship:** Derived from `EXPLORER_STYLE_ADDENDUM.md` and `STYLE_BIBLE.md`; bear/star remain fixed style anchors. All palettes share the warm/muted storybook family but give each world a distinct identity.
**Source of current colours:** `game/games/kitty-standalone.js` `WORLDS` (bgSky, groundColor, hillColor, pipeColor, stairColor) — preserved as the harmony base; palettes expand each into a full storybook family.
**Status:** Proposed — Gate 1 acceptance pending. No generation approved until Gate 1.

---

## Palette family (shared across all worlds)

- Warm neutrals: honey brown, cocoa, chestnut, warm umber, beige, oat, ivory, cream.
- Golden accents: soft golden yellow, ochre, muted amber, a little warm orange near shaded edges.
- Plant colors: soft leaf green, muted sage, moss, gentle olive.
- Cool accents: dusty blue, softened sky blue, muted blue-green.
- Warm accent colors: peach, dusty rose, soft terracotta, restrained coral.
- Light areas: warm cream and softened off-white rather than stark glowing white.

Handling: each object built from a small coherent family (one main hue + lighter/darker variations + small accent). Shading moves toward related warmer/deeper color, never pure black or saturated complement. Highlights soft and broad.

---

## 1. Spring — Пролећни дан (spring)

Current: bgSky #5c94fc, groundColor #70c838, hillColor #00a800, pipeColor #00a800, stairColor #4f9a24.

- Primary: soft meadow green (#70c838 family), warm cream sky.
- Secondary: soft leaf green, muted sage, gentle olive.
- Accent: soft golden yellow, muted amber.
- Ground/platform materials: grass top, earth side, gentle soil.
- Background atmosphere: pale sky, soft distant rolling hills, fair-weather clouds.
- Hazard colour: water — softened sky blue → deep blue-green gradient.
- Enemy contrast: mouse (soft grey/tan), ladybug (warm red) — read against green ground.
- Goal landmark: house — warm cream walls, terracotta roof, soft blue window.

---

## 2. Summer — Летњи залазак (summer)

Current: bgSky #fc7438, groundColor #f8b800, hillColor #d88000, pipeColor #00a800, stairColor #c89100.

- Primary: warm golden (#f8b800 family), sunset sky.
- Secondary: richer warm greens, golden ochre, muted amber.
- Accent: warm orange near shaded edges, soft terracotta.
- Ground/platform materials: sunlit grass, baked earth.
- Background atmosphere: warm sky, distant hazy hills, soft clouds.
- Hazard colour: water — softened sky blue → deep blue-green.
- Enemy contrast: mouse (soft grey/tan), bee (yellow/black stripes) — read against golden ground.
- Goal landmark: house — warm cream walls, golden roof accents.

Note: not a recolour of Spring — richer warmer goldens, distinct vegetation/flowers.

---

## 3. Autumn — Јесења ноћ (autumn night)

Current: bgSky #00003c, groundColor #cc5500, hillColor #882200, pipeColor #387800, stairColor #994000. isNight: true, decor: leaves.

- Primary: deep rust (#cc5500 family), dark night sky.
- Secondary: amber, ochre, muted red, moss green.
- Accent: soft golden yellow (leaves), muted amber.
- Ground/platform materials: layered foliage, seasonal ground, earth.
- Background atmosphere: dark night sky, soft distant hills, subtle stars.
- Hazard colour: spikes — dark near-black fill, muted grey tips.
- Enemy contrast: mouse, hedgehog (brown/tan spines) — read against dark rust ground.
- Goal landmark: house — warm cream walls, rust roof.

Decor leaves distinct from hazards; decorative leaves never look like collision objects.

---

## 4. Winter — Зимски снег (winter)

Current: bgSky #a0c0f8, groundColor #f8f8f8, hillColor #c0d8f8, pipeColor #3888c8, stairColor #d8e0f0. decor: snow.

- Primary: soft snow white (#f8f8f8), pale blue sky.
- Secondary: muted evergreen, cool blue-grey, soft lavender-grey.
- Accent: soft golden yellow (carrot collectible), muted amber.
- Ground/platform materials: solid snow, packed ice side.
- Background atmosphere: cool pale sky, soft distant snowy hills, soft clouds.
- Hazard colour: spikes — dark fill with muted grey tips.
- Enemy contrast: mouse, snowman (white body, dark features, orange nose) — read against snow; avoid white-on-white contrast loss.
- Goal landmark: house — warm cream walls (warmth against cool snow), terracotta roof.

Snow accumulation must not obscure platform edges. No large black regions.

---

## 5. Underground — Подземље (underground)

Current: bgSky #3a2a1a, groundColor #8a5a33, hillColor #6b4526, pipeColor #7a4f2a, stairColor #6b4526. ceiling: true, noClouds: true.

- Primary: deep earth brown (#8a5a33 family), dark subterranean atmosphere.
- Secondary: warm umber, chestnut, muted ochre, soft crystal accents.
- Accent: soft golden yellow (mushroom collectible), muted amber.
- Ground/platform materials: earth, stone, roots.
- Background atmosphere: enclosed subterranean, distinct background depth and lighting, dark ceiling.
- Hazard colour: lava — warm orange-red → deep red gradient, bright surface line.
- Enemy contrast: mole, worm (brown/tan) — read against dark earth ground.
- Goal landmark: mine — dark earth arch, warm golden picket detail.

Clear platform/ground silhouettes against darker scenery. No baked gameplay in background.

---

## 6. Cave — Пећина (cave)

Current: bgSky #2a2a3a, groundColor #5a4a3a, hillColor #453a2e, pipeColor #5c5246, stairColor #453a2e. isNight: true, ceiling: true, noClouds: true.

- Primary: cool cave grey (#5a4a3a family), distinct from Underground (warmer).
- Secondary: muted stone grey, deeper charcoal, restrained luminous accents.
- Accent: soft golden yellow (grape collectible), muted amber.
- Ground/platform materials: rock formations, cave depth.
- Background atmosphere: cave depth, darker than Underground, cooler.
- Hazard colour: lava — warm orange-red → deep red gradient.
- Enemy contrast: bat (dark grey/purple), spider (dark) — read against cooler cave ground.
- Goal landmark: cave — dark stone arch, restrained luminous accent (sparkle).

Visually distinct from Underground (cooler, rock-focused). Stronger rock formations. Dark areas readable; no large black regions or intense glows.

---

## 7. Water — Подводни свет (underwater)

Current: bgSky #1a6a9a, groundColor #d9b98a, hillColor #1a5a8a, pipeColor #3a8ac0, stairColor #b09868. decor: bubbles.

- Primary: deep aquatic blue (#1a6a9a family), layered aquatic depth.
- Secondary: soft seafoam green, muted blue-green, sandy tan.
- Accent: soft cream (shell collectible), muted amber.
- Ground/platform materials: sandy ground, soft rock side.
- Background atmosphere: foreground gameplay plane vs distant sea life; water decoration must not look like collision object.
- Hazard colour: spikes — dark fill with muted grey tips.
- Enemy contrast: piranha (orange), crab (orange/red) — read against blue ground.
- Goal landmark: submarine — cool blue body, warm golden ports.

Player silhouette readable against both light and dark water areas. No contrast-reducing or movement-obscuring effects.

---

## 8. Savanna — Савана (savanna)

Current: bgSky #f8d870, groundColor #e0a860, hillColor #c89050, pipeColor #a87830, stairColor #bd8a44.

- Primary: warm grassland (#e0a860 family), golden sky.
- Secondary: muted sage, soft olive, warm tan.
- Accent: soft golden yellow (banana collectible), muted amber.
- Ground/platform materials: dry grass, baked earth.
- Background atmosphere: warm sky, distant acacia-like silhouettes (if supported by art brief), layered grasses.
- Hazard colour: spikes — dark fill with muted grey tips.
- Enemy contrast: snake (green), meerkat (tan) — read against savanna ground.
- Goal landmark: hut — warm earth walls, soft roof.

Creature designs match actual enemy roster. Distant silhouettes distinct.

---

## 9. Japan — Јапан (japan)

Current: bgSky #f8a0c0, groundColor #e0707f, hillColor #c85a6a, pipeColor #b05060, stairColor #b84f5e. decor: petals.

- Primary: soft cherry-pink (#f8a0c0 family), restrained harmonious palette.
- Secondary: muted warm red, soft cream, muted green.
- Accent: soft cream (rice-ball collectible), muted amber.
- Ground/platform materials: soft earth, wooden-style platforms.
- Background atmosphere: calm sky, Japanese-inspired landscape motifs only where appropriate to existing concept.
- Hazard colour: water — softened sky blue → deep blue-green gradient.
- Enemy contrast: oni (red), panda (black/white) — read against pink ground.
- Goal landmark: torii — warm red structure, soft cream accents.

Restrained harmonious palette. Calm gameplay plane and readable silhouettes. No mixed cultural symbols or generic shorthand.

---

## 10. North Pole — Северни пол (northpole)

Current: bgSky #b8d8f0, groundColor #f0f8fc, hillColor #c8e0f0, pipeColor #a0c0d8, stairColor #d0e4f0. decor: snow.

- Primary: cool polar (#f0f8fc family), pale blue sky — distinct from Winter (warmer, icier).
- Secondary: muted ice blue, soft lavender-grey, muted evergreen.
- Accent: soft golden yellow (gift collectible), warm amber.
- Ground/platform materials: packed snow, ice formations.
- Background atmosphere: distant polar landscape, ice formations, soft sky.
- Hazard colour: spikes — dark fill with muted grey tips.
- Enemy contrast: penguin (black/white), seal (grey/white) — read against snow; avoid white-on-white contrast loss.
- Goal landmark: igloo — cool white dome, warm golden door accent.

Distinct polar identity (not a Winter duplicate). Ice formations, distant polar landscape. Cool palette with enough warm accents for player/enemy readability.

---

## 11. Egypt — Египат (egypt)

Current: bgSky #f8d878, groundColor #e8c878, hillColor #d0a860, pipeColor #b89038, stairColor #c8a758.

- Primary: warm desert sandstone (#e8c878 family), golden sky.
- Secondary: muted tan, soft ochre, warm umber.
- Accent: soft golden yellow (palm-tree collectible), muted amber.
- Ground/platform materials: sandstone, desert earth.
- Background atmosphere: warm sky, distinctive architecture and environmental landmarks.
- Hazard colour: spikes — dark fill with muted grey tips.
- Enemy contrast: scorpion (brown), scarab (blue-gold) — read against sandstone ground.
- Goal landmark: pyramid — warm sandstone, golden tip.

Strong soft-edged shape language. No tiny hieroglyphic overload. Cultural motifs considered and respectful; no arbitrary symbols as decoration. Unique entrance/goal motifs.

---

## Validation

- 11 sheets complete; each world has primary/secondary/accent, ground/platform materials, background atmosphere, hazard colours, enemy contrast, goal landmark colours.
- All palettes within warm/muted storybook family; each world distinct identity.
- References current WORLDS colours as harmony base (no gameplay colour semantics changed).
- Gate 1: palettes reviewed and accepted by user before asset briefs derive from them (Phase 3 Spring brief uses Spring palette).
