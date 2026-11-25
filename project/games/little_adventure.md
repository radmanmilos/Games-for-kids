# 🏝️ Мала авантура (Little Adventure)

A 3D isometric adventure for children: befriend grumpies, collect keys and gems, open gates, light pedestals, build the bridge and reach the lighthouse. Pure logic engine + Three.js renderer. Plan package: `resources/General_reviews/little_adventure/`.

## Where

- Engine: `game/games/little_adventure-logic.js` (`window.little_adventureLogic`)
- Models: `game/games/little_adventure-models.js` (`window.little_adventureModels`)
- Renderer: `game/games/little_adventure.mjs` (`window.startlittle_adventure`, sets `window.__little_adventure`)
- Page: `game/pages/little_adventure.html` · Registry: `game/data/app-registry.js` (`little_adventure`, `screenshot:true`, `offline:true`, `toddler:false`, `hubOrder:13`)
- Title: `game/data/serbian.js` (`titles.little_adventure`)
- Smoke: `tools/little_adventure_smoke.js`, `tools/little_adventure_logic_smoke.js`

## Constants and data

Every tunable lives in `window.little_adventure_CONFIG` (`game/games/little_adventure-config.js`). Logic and renderer read config; do not copy numbers into prose. Items, gates, bushes, pedestals, grumpies and obstacles are all data-driven.

## Test hook (`window.__little_adventure`, TD §8)

`state()` (logic snapshot plus `{frameMs,dpr,drawCalls,triangles,webgl,motionScale}`) · `seed(n)` · `pause()` / `step(ms)` · `setStick(x,y)` · `swing()` · `shield(bool)` · `teleport(x,z)` · `give(itemId)` · `setHits(id,n)` · `reset()` · `forceSlow(bool)` · `photo(name)` (jump to a named deterministic scene, paused) · `sheet(name,frames)` (filmstrip) · `setPose(actor,id,t)` · `quality(tier)` · `fxTable()` · `data {cfg}`. Set only when WebGL booted.

## Determinism recipe

`seed(7)` → `pause()` → drive with `step(50)`; poll to a named phase (e.g. `state().gates.G1.open`) instead of a fixed long `step(N)`.

## Save

`localStorage['little_adventureSave']` = `{v:1, gates, chests, bushes, items, befriended, pedestals, bridge, complete}`. Hero spawns at the last opened gate (or `hero.start`) on load. Saved only on milestone events, always in try/catch.

## Reduced motion

Every animation checks `window.REDUCED_MOTION`; `motionScale` is 0 under reduced motion. Assert with `bootEmulated`, not the host default.

## Gotchas

- `hidden` hub tile until IS-19 (G4 approved).
- Models are primitives only; `?gallery=1` lays them out for review.
- No shadows (blob shadows only); no shadow maps.
EOF
## Modules (quality pass)

- little_adventure-anim.js � easings, spring, springChain, envelope, blend, idleNoise, evalHero/evalGrumpy/evalOwl, sheet/filmstrip. Pure, Node-testable.
- little_adventure-materials.js � toon ramp (3-step DataTexture), shared material cache, outline (inverted hull), vertex-AO helper, wind patch.
- little_adventure-characters.js � makeHero2, makeGrumpy2, makeOwl2, paintFaceAtlas, applyPose. Rigs expose userData.pivots (named) + userData.materials + userData.rest.
- little_adventure-terrain.js � generate(cfg, seed) -> heightAt, maskAt, pathAt, vertex data. Pure, Node-testable.
- little_adventure-fx.js � EVENT_TABLE (16 events), TIERS (low/med/high), particleCapFor, cameraNudge. Pure data + helpers.
- little_adventure-audio.js � SFX recipes, AMBIENT, SCORE, sequencer (deterministic), maxGain. Pure data + helpers.

## Rig contract (TDQ S2)

A rig builder returns a THREE.Group with userData.pivots = { name: Object3D } for every pivot named in AD S3; missing pivot = Node test failure. Poses applied by name via applyPose(rig, pose). Spring chains advanced by renderer with little_adventureAnim.springChain.

## Animation table (AD S4)

evalHero/evalGrumpy/evalOwl are pure functions of (state, t, opts) returning pivot transforms. Filmstrips use sheet(name, frames) clones posed at evenly spaced t.

## Tiers (TDQ S9)

low/medium/high: DPR cap, draw calls, triangles, particles, shadows, wind, water, ambient. Adaptive step-down only (never up).

