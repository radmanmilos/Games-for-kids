# 02 — Technical design for the quality pass (TDQ)

Vendored three.js is **r169 core only** (`game/assets/lib/three.module.min.js`, no `examples/jsm`, no EffectComposer, no GLTFLoader). Everything below uses core APIs: `MeshToonMaterial` + `gradientMap`, `onBeforeCompile` shader patches, `CanvasTexture`, `InstancedMesh`, `ExtrudeGeometry`, `LatheGeometry`, `TubeGeometry`, `Sprite`/`Points`, `DirectionalLight` shadow map. Verify any API you are unsure of in Node first (`import(pathToFileURL('game/assets/lib/three.module.min.js'))`).

## TDQ §1 Module map (new classic scripts take `THREE` as a parameter; pure parts must load via `new Function('window', src)` in Node)

| New file | Global | Pure/Node-testable | Role |
| --- | --- | --- | --- |
| `game/games/little_adventure-anim.js` | `window.little_adventureAnim` | **yes** | easing, spring, envelopes, blend weights, seeded idle noise, per-actor animation evaluators that return plain pose numbers (`evalHero(state, t, opts) → {pivotName:{rx,ry,rz,px,py,pz,sx,sy,sz}}`) |
| `game/games/little_adventure-materials.js` | `window.little_adventureMaterials` | partly (needs THREE param) | toon ramp, shared material cache, outline (inverted hull), vertex-AO helper, wind-sway shader patch |
| `game/games/little_adventure-characters.js` | `window.little_adventureCharacters` | partly | rigs: `makeHero2, makeOwl2, makeGrumpy2(role)` with the pivots in AD §3, face-atlas painter hooks |
| `game/games/little_adventure-terrain.js` | `window.little_adventureTerrain` | **yes** (heightfield, masks) | `generate(cfg, seed)` → `heightAt(x,z)`, `maskAt(x,z)` (land 0..1), `pathAt`, vertex data arrays |
| `game/games/little_adventure-fx.js` | `window.little_adventureFx` | partly | sprite-particle pool, emitters, trails, ambient life, atlases painted on canvas |
| `game/games/little_adventure-audio.js` | `window.little_adventureAudio` | **yes** (sequencer/score data) | SFX recipes, ambient/music score (data) and a player that talks to `window.audioBuses` |
| `game/games/little_adventure-models.js` (exists) | `window.little_adventureModels` | partly | props/world builders (upgraded in Q-08/Q-13); stays ≤ ~900 lines |
| `game/games/little_adventure.mjs` (exists) | — | no | bootstrap, loop, input, glue only; **must shrink**, not grow, as modules take over |
| `tools/little_adventure_quality_smoke.js` | — | **Node** | pure tests for anim/terrain/audio/materials-cache (auto-discovered by `run_all.js`; add stem mappings for the new files) |
| `tools/little_adventure_shots.js` | — | Chrome+WebGL | deterministic screenshots/filmstrips (RV §2) |

Page script order: existing scripts, then `-anim`, `-materials`, `-characters`, `-terrain`, `-fx`, `-audio` **before** the module script; the importmap stays. Add each file to the registry-driven offline inventory via the printed `check_fast` fix command.

## TDQ §2 Rig contract

A rig builder returns `THREE.Group` with `userData.pivots = { name: Object3D }` for **every** pivot named in AD §3 (missing = Node-test failure) and `userData.materials` (shared handles for recolour: `body, belly, face, trim`). Poses are applied by name: `applyPose(rig, pose)` sets each pivot's `rotation/position/scale` from the evaluator output; unspecified pivots keep their rest pose (`userData.rest`). Spring chains (`hatTip1..3`, `scarf1..3`, `tuft1..3`) are advanced by the renderer each frame with `little_adventureAnim.springChain(chain, parentVelocity, dt)`.

## TDQ §3 Face system

`paintFaceAtlas(ctx, size)` draws a 4×2 grid of expressions (open, blink, happy, surprised, grumpy, strain, talk-a, talk-b) onto a 2D canvas context; the characters module wraps it into one shared `CanvasTexture` (nearest/linear, 256×128). A face is a slightly curved plane/sphere-cap mesh with a `MeshBasicMaterial` whose `map.offset/repeat` selects the cell (no new draw calls). Blink and mood = change cell. Node tests use a fake recording `ctx` to assert all 8 cells are painted and that each draws two highlights per eye.

## TDQ §4 Animation system

`evalHero(state, t, opts)` inputs: `state.hero {vx, vz, facing, swingT, cooldown, shield, bumpT}`, `speed01 = hypot(vx,vz)/cfg.hero.speed`, `swingFrac = 1 − swingT/cfg.sword.swingMs`, render clock `t`, last events (pickup/complete timestamps) and `opts.motionScale` (1 or 0.4). Returns pivot transforms (AD §4 numbers). Same for `evalGrumpy(g, t, opts)`, `evalOwl(owl, heroPos, speaking, t, opts)`, and prop evaluators `evalChest/evalGate/evalPedestal/evalBridge/evalLighthouse`. **Evaluators are pure** (same inputs ⇒ same output; seeded noise only) so they are unit-tested in Node and drawn as **filmstrips** in the browser.
Transitions: one-line blend (`w += clamp(target − w, ±dt/blendTime)`), never snapping. Stride phase is integrated by the renderer (`phase += speed·dt/1.1`) and passed in.
Events → FX table (the single source, `little_adventureFx.EVENT_TABLE`): `swing, hit, befriend, bump, shieldBlock, bushCut, chestOpen, itemSpawn, pickup, gateOpen, pedestalFill, pedestalWrong, bridgeUp, owlTalk, complete, grumpyRespawn` each → `{sfx, particles, pose, camera, speech?}`; a Node test asserts every event type emitted by the logic (`little_adventure-logic.js`) has an entry.

## TDQ §5 Terrain, sky, water

**Terrain (`-terrain.js`)**: land mask = superellipse/blob around the gameplay rectangle (bounds `x∈[-24,24], z∈[-80,16]`) expanded by a **margin ≥ 10 u** (beach ring 4 u wide, then shallow water). `heightAt`: 0 on the gameplay corridor and everywhere inside bounds shrunk by 2 u (|h| ≤ 0.12 so logic 2D stays honest), rising to hills/cliffs only **outside** the bounds (max 3 u), and falling below water at the coast; seeded value noise. Mesh: 96×160 grid (≈ 15 k quads) with vertex colours by zone/slope/beach and baked AO (darker in hollows and under trees), a dirt **path** along the spine, a mowed-grass band. All actors set `y = terrain.heightAt(x,z)`. Node tests: determinism, flat corridor, mask is 1 inside bounds and 0 beyond margin, every config object position has land mask 1.
**Sky**: inverted sphere (r 400) with a vertex-colour gradient (zenith→horizon) + sun disc sprite + 8–12 low-poly clouds (instanced, slow drift) ; fog colour = horizon colour.
**Water**: large grid (48×48) with a shader patch for gentle wave displacement + fresnel-ish tint + shoreline foam from `maskAt` (precomputed to a vertex attribute); tiers: low = flat colour + animated UV sparkle texture only.

## TDQ §6 Atmosphere and camera

`atmosphere(zoneBlend)` interpolates: key/fill light colours & intensity, sky gradient, fog colour/near/far per AD §2; blended 2 s on zone change (instant under reduced motion). Camera: existing follow + **look-ahead** (0.35 s of velocity, max 2 u) + **reveal nudges** on `gateOpen`/`bridgeUp` (move target ≤ 6 u toward the thing for ≤ 1.2 s, then return; skipped under reduced motion; never take control away: the hero stays steerable). No shake. CSS vignette (radial gradient overlay, `pointer-events:none`, ≤ 12 % darkening).

## TDQ §7 FX and particles

Pool of ≤ tier-cap sprites (`THREE.Points` with a `ShaderMaterial` or `Sprite` batch) using an atlas painted on a canvas: star, sparkle, dust, leaf, petal, glow. Per-particle `size0→size1`, `alpha curve`, colour, gravity/drag, additive flag (two pools: additive + normal). Emitters are data in the EVENT_TABLE and ambient configs per zone. Halos (gems/keys/pedestals/lighthouse/beacon) are additive billboards. Sword trail = a ring buffer of the last 6 blade positions rendered as a quad strip.

## TDQ §8 Audio

`little_adventureAudio` holds **data**: `SFX[name] = {layers:[{type:'tone'|'noise', freq/f0→f1, dur, a, d, s, r, gain, filter?}], pitchVar}`, `SCORE[zone] = {bpm, scale, patterns:{pad,arp,bass}, sparkle}`, `AMBIENT[zone]`. Player functions use `window.audioBuses` (`playTone`, `playSweep`, `connect`, `getAudioContext`, `setBus`) — read `game/shared/audio-buses.js` first to learn the bus names (sfx/music/ambient) and use them; schedule with the AudioContext clock, not `setInterval`. A deterministic **sequencer** (`score → [{time, freq, dur, bus}]` for N bars with a seed) is pure and Node-tested; the player is thin. Music pauses with the game (visibility/blur) and ducks under speech (`audioBuses.duck` / `speakWithDuck`).

## TDQ §9 Budgets and tiers

| | low | medium | high |
| --- | --- | --- | --- |
| DPR cap | 1.0 | 1.25 | 1.5 |
| Draw calls | ≤ 120 | ≤ 160 | ≤ 220 |
| Visible triangles | ≤ 60 k | ≤ 90 k | ≤ 130 k |
| Particles alive | 40 | 120 | 250 |
| Outlines (characters) | on | on | on |
| Real shadows | off (blob) | hero only | hero + actors |
| Wind sway | off | on | on |
| Water | flat + sparkle | shader waves | shader + foam |
| Ambient life | fireflies only | + butterflies | all |
Tier selection: start from `navigator.deviceMemory`/`hardwareConcurrency`/screen size (low if ≤ 2 GB or ≤ 4 cores), then **adaptive**: the existing slow-frame detector steps the tier **down** one level (never up) and records it in `state().tier`. Target 60 fps high/medium, ≥ 30 fps low. Dispose geometries/materials/textures on exit; shared materials via the cache.

## TDQ §10 Hooks (extend `window.__little_adventure`; set only when WebGL booted)

Existing: `state, seed, pause, step, setStick, swing, shield, teleport, give, setHits, reset, forceSlow`. Add: `photo(name)` (jump to a **named deterministic scene** — fixed hero/camera/time of day/zone, paused — presets in RV §2), `sheet(name, frames)` (filmstrip of a named animation: N clones of the rig posed at evenly spaced times along a row — pure evaluators make this exact), `setPose(actor,id,t)`, `quality(tier)`, `fxTable()` (list of event keys handled). Never read by the engine.

## TDQ §11 Test layers

Node (`little_adventure_quality_smoke.js`): anim evaluators (continuity: pose at t and t+ε differ < ε·k; swing envelope hits the logic arc; amplitudes scaled 0.4 under reduced motion; no NaN), springs (critically damped never overshoots > 5 %), rigs have all pivots (via three imported in Node), terrain properties, sequencer determinism, EVENT_TABLE completeness, material cache reuse, triangle budgets per rig. Chrome/WebGL (`little_adventure_smoke.js` W-checks + shots tool): RV §3.
