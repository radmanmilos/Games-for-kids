# 01 — Technical design (TD)

## §1 Files and load order

| File | Kind | Role |
| --- | --- | --- |
| `game/pages/little_adventure.html` | page | shell: metadata, HUD/UI elements, script order |
| `game/games/little_adventure-config.js` | classic script | `window.little_adventure_CONFIG` — every tunable and all layout data (TD §2). **No logic.** |
| `game/games/little_adventure-logic.js` | classic script | `window.little_adventureLogic` — pure simulation (TD §3). **No DOM, no three, no `Date`/`Math.random`.** |
| `game/games/little_adventure-models.js` | classic script | `window.little_adventureModels.create(THREE)` → builder functions (TD §7). Receives THREE as a parameter; never imports. |
| `game/games/little_adventure.mjs` | ES module | renderer, camera, input wiring, audio/speech glue, loop, save I/O, test hook. Imports `three` via the importmap. Defines `window.startlittle_adventure` (guarded by a `booted` flag). |
| `tools/little_adventure_logic_smoke.js` | Node | pure-logic battery (TP §2). Needs no Chrome. |
| `tools/little_adventure_smoke.js` | Chrome | shell battery + WebGL-gated battery (TP §3–§4). |

Page script order (copy the metadata/regex requirements from `game/pages/racing3d.html`; `tools/validate_pages.js` enforces `lang="sr"`, manifest link, `theme-color #4A3F6B`, viewport meta):
`<script type="importmap">{"imports":{"three":"../assets/lib/three.module.min.js"}}</script>` → `../data/serbian.js` → `../games/little_adventure-config.js` → `../games/little_adventure-logic.js` → `../games/little_adventure-models.js` → `<script type="module" src="../games/little_adventure.mjs">` → `../shared/audio.js` → `../shared/speech.js` → `../shared/audio-buses.js` → `../shared/input.js` → `../shared/motion.js` (same trailing-shared-scripts pattern as racing3d; check the exact list and order in `racing3d.html` and keep what it keeps).

**Node loading rule:** tests load config/logic/models with `new Function('window', src)(win)` (the pattern in `tools/check_art.js`). Therefore those three files may only *assign* to `window.*` and must not reference `document`, `navigator`, `localStorage`, `requestAnimationFrame` or any global other than `Math`, `JSON`, `Object`, `Array`, `Number`, `String`, `isFinite`.

IDs: page `little_adventure`, route `game-little_adventure`, back button `i3d-back`, start function `startlittle_adventure`, save key `little_adventureSave`, hub order 13, element-id prefix `i3d-`, global test hook `window.__little_adventure`.

## §2 Config (`window.little_adventure_CONFIG`) — single place to tune

```
hero:    { radius:0.45, speed:5.0, accelRate:12, shieldSpeedMul:0.7, start:[0,8], bumpDist:1.2, bumpMs:200 }
sword:   { reach:1.9, arcDeg:110, swingMs:350, cooldownMs:200, assistRange:2.8, assistConeDeg:70 }
shield:  { blockArcDeg:140 }
stick:   { deadzone:0.12, radiusVmin:9, minPx:56, maxPx:110 }
grumpy:  { radius:0.6, speed:1.6, notice:7, wanderR:4, bumpCooldownMs:1500, retreatMs:900,
           respawnMs:20000, respawnMinHeroDist:12, maxAliveNormal:4, followersMax:3, followDist:2.5 }
acorn:   { intervalMs:2500, speed:5, radius:0.25, lifeMs:4000 }
interact:{ pickup:0.9, chest:1.2, keyUse:2.2, gemPlace:1.8, owlTalk:3.0, owlRepeatMs:30000 }
bounds:  { xMin:-24, xMax:24, zMin:-80, zMax:16 }
sim:     { stepMs:20, dtClampMs:100 }
camera:  { fov:45, fovNarrow:55, narrowAspect:1.2, offset:[0,13,11], follow:6 }
budget:  { dprMax:1.5, slowFrameMs:24, slowWindowMs:2000, particleCap:24, burst:12, burstReduced:6 }
zones:     [ {id:'A',z0:16,z1:-16,color}, {id:'B',z0:-16,z1:-46,color}, {id:'C',z0:-46,z1:-80,color} ]
obstacles: [ {t:'circle',x,z,r}, ... ]            // trees, rocks, owl stump, statue, pedestals, lighthouse
gates:     [ {id:'G1',pos:[0,-16],w:6,d:1,needs:'keyMeadow'}, {id:'G2',pos:[0,-46],w:6,d:1,needs:'keyForest'} ]
chests:    [ {id:'C1',pos:[14,-34],item:'keyForest'} ]
bushes:    [ {id:'A-bush',pos:[9,-2],item:'gemRed'}, {id:'B-bush',pos:[-12,-22],item:'gemGreen'} ]
items:     [ {id:'keyMeadow',kind:'key'}, {id:'keyForest',kind:'key'},
             {id:'gemRed',kind:'gem',color:'red'}, {id:'gemGreen',kind:'gem',color:'green'}, {id:'gemBlue',kind:'gem',color:'blue'} ]
pedestals: [ {id:'red',pos:[-4,-62]}, {id:'green',pos:[0,-62]}, {id:'blue',pos:[4,-62]} ]
grumpies:  [ {id:'guard1',role:'guard',home:[-8,-10],hits:2,drops:'keyMeadow'},
             {id:'boss',role:'boss',home:[10,-56],hits:3,drops:'gemBlue'},
             {id:'a1',role:'normal',home:[6,2],hits:1}, {id:'a2',role:'normal',home:[-6,-4],hits:1},
             {id:'b1',role:'normal',home:[8,-24],hits:1}, {id:'b2',role:'normal',home:[-4,-40],hits:1} ]
statues:   [ {id:'s1',pos:[-10,-30],dir:[1,0]} ]
npcs:      [ {id:'owl',pos:[-5,4]} ]
bridge:    { from:[0,-64], to:[0,-76], buildMs:2000 }
lighthouse:{ pos:[0,-78], r:2 }
speech:    { intro:'…', hintGuard:'…', … }           // exactly the keys/lines in PS §7
```
Rules: ids are ASCII; positions are `[x,z]`; every `drops`/`item`/`needs` must reference an existing item id; `little_adventureLogic.validateConfig(cfg)` returns an array of problem strings (empty = valid) and the smoke asserts it is empty. Do not copy numbers into prose docs — read the config.

## §3 Pure logic (`window.little_adventureLogic`)

```
createGame(cfg, seed)      -> game
game.step(dtMs, input)     // input = {sx, sy, swing:boolean(edge), shield:boolean(hold)}; internally fixed 20 ms sub-steps, dt clamped to 100 ms
game.state()               -> plain JSON snapshot (see below); never mutated by callers
game.drainEvents()         -> array of events since the last call (then cleared)
game.nextObjective()       -> {x, z, kind, id} | null
game.save()                -> plain object (TD §10)       game.load(obj) -> boolean (validated; false = ignored)
game.debug                 { teleport(x,z), give(itemId), setHits(id,n), reset() }   // used only by the test hook
little_adventureLogic.stickVector(dxPx, dyPx, radiusPx, deadzone) -> {x, y, mag}   // y positive = down on screen; mag clamped 0..1; below deadzone -> 0
little_adventureLogic.validateConfig(cfg) -> string[]       little_adventureLogic.validateSave(obj, cfg) -> object | null
```
**State snapshot:** `{ t, hero:{x,z,facing,vx,vz,swingT,cooldown,shield,bumpT}, carry:[itemId…], items:{id:{state:'hidden'|'world'|'carried'|'used',x,z}}, grumpies:[{id,role,x,z,state:'idle'|'approach'|'retreat'|'happy',hp,mood,follow:boolean}], gates:{id:{open,openT}}, chests:{id:{open}}, bushes:{id:{cut}}, pedestals:{id:{lit,wiggleT}}, acorns:[{x,z,vx,vz,age}], bridge:{built,t}, owl:{talkT}, complete, zone }`.

**Events** (objects with `type` plus fields): `swing`, `hit{id}`, `befriend{id}`, `bump{from}`, `shieldBlock`, `bushCut{id}`, `chestOpen{id}`, `itemSpawn{id}`, `pickup{id,kind}`, `gateOpen{id}`, `pedestalFill{id}`, `pedestalWrong{id}`, `bridgeUp`, `owlTalk{line}` (line ∈ speech keys), `complete`, `grumpyRespawn{id}`.

**Determinism:** all randomness uses an internal `mulberry32(seed)` (copy `function mulberry32` from `game/games/racing3d.mjs`, near the top of the file); the same seed + same input sequence ⇒ identical `state()` JSON (a smoke asserts this). Wander targets and respawn timing are the only random uses.

**Collision:** circle-vs-circle (hero r 0.45) with push-out and slide; gates are rectangles blocking while closed; bounds clamp the hero centre to `bounds` shrunk by hero radius. Grumpies collide with obstacles and bounds the same way and never leave their zone (clamped to zone z-range).

Order of one sub-step: input → hero move/collide → swing timers + hit tests → grumpy AI → acorns → interactions (pickups, chest, gate, pedestal) → bridge/lighthouse/complete → owl talk → event emission.

## §4 Rendering architecture (`little_adventure.mjs`)

- `renderer = new THREE.WebGLRenderer({antialias:true})` wrapped in try/catch; on failure show the fallback (`«3D није доступан овде»`, back button works) and **do not** set `window.__little_adventure` (copy the racing3d pattern, `racing3d.mjs` ~l.229 and its fallback).
- `setPixelRatio(min(devicePixelRatio, cfg.budget.dprMax))`; adaptive step-down (TD §9).
- Scene: sky colour + fog; `HemisphereLight` + one `DirectionalLight`; **no shadow maps** — actors get a dark translucent `CircleGeometry` blob shadow on the ground.
- Materials: `MeshLambertMaterial({flatShading:true})` everywhere (cheap, faceted look). Share materials; never create per-frame.
- Static decoration (trees, tufts, flowers, rocks) uses `InstancedMesh` (one per kind). Ground = a subdivided plane with per-vertex colours by zone. Water = a large plane slightly below. Total budgets in §9.
- Each frame: `game.step(dt, input)` → `const s = game.state()` → update transforms/visibility of pre-built meshes from `s` → handle `game.drainEvents()` (particles, sounds, speech, announcer) → camera follow → `renderer.render`. **The renderer never changes gameplay**; if a visual needs a decision, add it to the logic.
- Particles: one pooled `Points` or small mesh pool (`cfg.budget.particleCap`); `burst` stars on befriend/bush/gate; `window.REDUCED_MOTION` ⇒ `burstReduced`.
- Guidance beacon: a tall additive-looking cylinder (opacity 0.25) at `nextObjective()`; objective arrow: flat triangle circling the hero at radius 1.4 after 6 s without a progress event.

## §5 Input

- `#i3d-stick-zone` (left 50 % of the screen, from below the HUD to the bottom) wired with `window.pointerDrag`: `down` → record origin, show `#i3d-stick-base` at the touch point; `move` → `stickVector(dx, dy, radiusPx, deadzone)`, move `#i3d-stick-knob`; `up/cancel` → zero and hide. `radiusPx = clamp(radiusVmin·vmin/100, minPx, maxPx)`.
- `#i3d-btn-sword` (tap → `input.swing = true` for one step) and `#i3d-btn-shield` (hold) each wired with their own `pointerDrag`.
- Keyboard map (PS §3) merged with the stick (largest magnitude wins). One `resetInput()` on `blur`, `visibilitychange` (hidden), `orientationchange`, `webglcontextlost`.
- `touch-action:none` on the zones; `user-select:none`; no text selection or context menu on long press (`contextmenu` preventDefault on the page).

## §6 Camera

Fixed pitch/yaw: `camera.position = heroPos + offset`, `lookAt(heroPos + [0,0.6,0])`, smoothed with `1 − exp(−follow·dt)`; the target is clamped so the water edge never dominates the view (`bounds` shrunk by 8 u horizontally, 6 u vertically). `fov` = `cfg.camera.fov`, or `fovNarrow` when `aspect < narrowAspect`. Under reduced motion the follow rate is raised so the camera does not "lag-wobble". No user rotation/zoom.

## §7 Model recipes (`little_adventure-models.js`) — primitives only

`create(THREE)` returns `{ makeHero, makeSword, makeShield, makeOwl, makeGrumpy(role), makeKey, makeGem(color), makeChest, makeGate, makePedestal(color), makeStatue, makeAcorn, makeLighthouse, makeBridgeSegment(i), makeTree, makeBush, makeRock, makeFlower, makeBlobShadow, palette }`. Each builder returns a `THREE.Group` with named children (`'lid'`, `'armR'`, `'sword'`, `'shield'`, `'eyebrows'`, `'smile'`, `'crown'`) so the renderer can animate them. Palette (hex): cream `#FFF8ED`, gold `#FFD23F`, purple `#4A3F6B`, hero hat green `#4CAF50`, peach `#F6C9A0`, wood `#A66B3A`, grumpy `#C06C84`, happy `#FFD86B`, stone `#9AA0A6`, grass A `#9BD37A`, grass B `#6FB35A`, shrine `#D9D2C0`, water `#6EC6E8`, gems red `#E5484D` green `#3FBF6F` blue `#3E8EF7`.

Recipes (segments ≤ 10, keep each model ≤ ~600 triangles): **hero** — body `CylinderGeometry(.32,.4,.7,8)`; head `SphereGeometry(.35,10,8)`; hat `ConeGeometry(.38,.7,8)` tilted back; arms = 2 small cylinders; feet = 2 boxes; eyes = 2 tiny dark spheres; **sword** — box `.08×.9×.04` wood + crossguard box; **shield** — `CylinderGeometry(.4,.4,.08,12)` rotated to face forward, purple with a gold `SphereGeometry` boss. **grumpy** — `SphereGeometry(.6,12,8)` scaled `(1,.8,1)`; eyes; 2 eyebrow boxes rotated ±20° (`eyebrows`); `smile` = `TorusGeometry(.18,.03,6,10,Math.PI)` hidden until happy; boss ×1.8 + `crown` of 3 cones; guard + a leaf hat. **owl** — scaled sphere body, 2 big cream eye spheres with dark pupils, orange cone beak, 2 box wings, on a cylinder stump. **key** — `TorusGeometry` ring + box shaft + 2 teeth. **gem** — `OctahedronGeometry(.3)` with emissive tint. **chest** — box base + half-`CylinderGeometry` lid (`'lid'` rotates open). **gate** — 2 posts + 3 bars (group slides down/rotates on open). **statue** — grey cylinder + round "mouth" ring; **acorn** — brown sphere + tan cap. **lighthouse** — 3 stacked tapered cylinders (red/white) + glowing sphere. **bridge segment** — thin box, one per rainbow colour, positioned on an arc by the renderer. **tree** — cone on cylinder (instanced); **bush** — `IcosahedronGeometry`; **rock** — `DodecahedronGeometry`; **flower** — tiny cone + sphere (instanced).

A debug **gallery mode** (`?gallery=1` on the page URL, ignored in normal play): lays every model in a row on a plain ground for visual review without gameplay (card IS-09).

## §8 Test hook — `window.__little_adventure` (the engine never reads it)

`state()` (logic snapshot plus `{frameMs, dpr, drawCalls, triangles, webgl:true}`) · `seed(n)` · `pause()` / `step(ms)` (game clock; `pause` is the harness rAF gate) · `setStick(x,y)` · `swing()` · `shield(bool)` · `teleport(x,z)` · `give(itemId)` · `setHits(id,n)` · `reset()` · `data {cfg}`. Determinism recipe for smokes and `tools/visual-states.json`: `seed(7)` → `pause()` → drive with `step(50)`; poll to a named phase (e.g. `state().gates.G1.open`) instead of a fixed long `step(N)` (lesson in `project/lessons/testing-harness.md`). Set only when WebGL booted.

## §9 Budgets (measure on a real modest Android tablet; tune after playtest)

Draw calls ≤ 150 · visible triangles ≤ 60 k · particles alive ≤ 24 · `dprMax` 1.5 · target 60 fps, floor 30 fps. **Adaptive:** if the average frame time over `slowWindowMs` exceeds `slowFrameMs` (24 ms) the renderer lowers the pixel ratio one step (1.5 → 1.0) once and records it in `state().dpr`; it never raises it again in the session. Frame time and counters come from `renderer.info` and are exposed via the hook for the `[WEBGL]` perf check.

## §10 Save (`localStorage['little_adventureSave']`)

`{ v:1, gates:{G1:true,…}, chests:{C1:true}, bushes:{'A-bush':true,…}, items:{id:'hidden'|'world'|'carried'|'used'}, befriended:{guard1:true,boss:true}, pedestals:{red:true,…}, bridge:boolean, complete:boolean }`. Hero position is **not** saved: on load the hero starts at the most recently opened gate's position (or `hero.start`). Saved only on milestone events (not per frame), always inside try/catch. `validateSave` rejects unknown keys/ids, wrong types and `v≠1` (⇒ fresh game, never a crash). Items with state `world` reset to their spawn position on load. The start screen offers two icon buttons: **continue** (only if a valid save exists) and **new adventure** (clears the key). No numbers or progress meters are shown.

## §11 Lifecycle and robustness

Boot guarded by `booted`; `visibilitychange` hidden / `blur` ⇒ pause + `resetInput`; WebGL `webglcontextlost` ⇒ `preventDefault`, freeze the sim, show nothing broken; `webglcontextrestored` ⇒ rebuild GPU resources and resume (copy the structure of `racing3d.mjs` ~l.2676–2740, which is the proven pattern). `dt` clamp 100 ms; the loop never throws (wrap the frame body; on an exception stop the loop and show the fallback once). Back button stops the loop and disposes geometries/materials/renderer.

## §12 Tool-wiring checklist for a new game (what `cat_forest` and `racing3d` each touched)

New game ⇒ touch exactly: `game/data/serbian.js` (`titles.little_adventure`), `game/data/app-registry.js` (entry below), `game/index.html` (hub tile), `tools/little_adventure_smoke.js`, `tools/little_adventure_logic_smoke.js`, `tools/run_all.js` mapping (config/logic/models stems → both smokes; read lines ~80–135 first), `tools/offline_smoke.mjs` (entry + the racing3d no-WebGL special-case), `tools/visual-states.json`, `tools/validate_pages.js` (per-page required-id list if applicable), docs (`project/games/little_adventure.md`, `project/reference/GAME_MATRIX.md`, `INVENTORY_MATRIX.md`, `folder-structure.md`, `ASSET_BUDGET.md`, `SAFETY_PRIVACY_AUDIT.md`, `tools/README.md`, `project/DECISIONS.md`), generated artifacts via printed fix commands, `docs/` via `tools/sync-docs.sh`. Find every spot with: `grep -rIl "cat_forest" --exclude-dir=docs --exclude-dir=archive --exclude-dir=resources --exclude-dir=node_modules --exclude-dir=.git .` and mirror each hit.

Registry entry: `{ id:'little_adventure', path:'pages/little_adventure.html', category:'games', title: window.SERBIAN.titles.little_adventure, smoke:'little_adventure_smoke', screenshot:true, offline:true, toddler:false, route:'game-little_adventure', hubOrder:13, hubGroup:'games', back:'i3d-back', start:'startlittle_adventure' }`. Hub tile: `<button class="hub-btn green" data-go="game-little_adventure" aria-label="Мала авантура" hidden>🏝️🛡️</button>` — **`hidden` until IS-19** (Gate G4), so a half-built game is never published by accident.
