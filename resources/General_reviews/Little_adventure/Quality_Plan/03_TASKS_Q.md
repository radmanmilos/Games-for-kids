# 03 — Quality task cards (Q-00 … Q-24)

Each card is self-contained for an AI that read `README.md`, the card, and the sections it cites. **Size:** S ≤ 150 changed lines · M ≤ 400 (no L: split and log in `PROGRESS.md`). **Look gate** = the card is not DONE until RV §1's loop produced images that were reviewed. After any `game/` change: the `check_fast` fix command(s), then `bash tools/sync-docs.sh`; refresh screenshots when a screen changed. Claim each card in `project/tasks/ACTIVE.md` and in `PROGRESS.md`; do not commit/push.

Ordering: Phase 0 → 1 → 2 → 3 → 4. Parallel-safe pairs are marked. User gates (QG1…QG7) are in `05_DECISIONS_AND_RISKS.md` §3 — the AI stops and waits at each.

---

## Phase 0 — Truth, tooling, defects

### Q-00 — Probe, shots tool, baseline, doc fix
- **Size** M · **Env** `[NODE][CHROME][WEBGL?][USER-RUN]` · **Depends** —
- **Goal:** know whether the AI's host has WebGL, be able to *see* the game, record the baseline.
- **Read first:** AU §1–§3; RV §1–§2; `tools/screenshot.js` header; `tools/little_adventure_smoke.js`; `tools/visual-states.json`.
- **Steps:** 1. Run `node tools/little_adventure_smoke.js` and report whether it printed the WebGL SKIP (⇒ this host has no WebGL; then every `[WEBGL]` step becomes `[USER-RUN]`). 2. Add the `photo(name)` hook (TDQ §10) to `little_adventure.mjs` with presets from RV §2 (hero closeup, meadow wide, forest wide, shrine wide, lighthouse, owl, grumpy happy/grumpy, gate closed/open, pedestals lit) — pure state + camera placement, paused. 3. Create `tools/little_adventure_shots.js`: boots the page with real WebGL, runs every preset at 1280×800 and 844×390, writes PNGs to `resources/General_reviews/Little_adventure/Quality_Plan/shots/<phase>/` with a tiny `INDEX.md`; **fail loudly if WebGL is missing** (never write blank images). 4. Extend `tools/visual-states.json` `little_adventure` with a PLAY state (seed 7, pause, step to a named phase). 5. Fix doc defect A9 (stray `EOF`, correct global names in `project/games/little_adventure.md`). 6. Capture **baseline shots** `shots/00_baseline/` (`[WEBGL]` or `[USER-RUN]`).
- **AC:** 1. WebGL availability recorded in `PROGRESS.md`. 2. `photo()` works for all presets (smoke checks `state()` after each) `[WEBGL]`. 3. Baseline PNGs exist, non-blank, ≥ 20 files `[WEBGL/USER-RUN]`. 4. `check_fast` + `check_docs` green; logic smoke 65/65 still green `[NODE]`.
- **Out of scope:** any visual change.

### Q-01 — Fix the floor/void defect (A1) and make the world fully covered
- **Size** S · **Env** `[WEBGL][USER-RUN]` · **Depends** Q-00 · **Look gate** yes
- **Goal:** every position in config has ground under it; nothing floats; the island edge no longer shows a dark square.
- **Steps:** 1. Look at baseline shots of the shrine/bridge/lighthouse. 2. Replace the two 128×128 planes with planes sized and **centred on the gameplay rectangle plus ≥ 24 u margin** (centre z ≈ −32, depth ≥ 160), keep colours by zone, remove the dark edge fade (it will be replaced by the real island in Q-06). 3. Make the camera target clamp use bounds (`cfg.bounds`) so the void is never in view. 4. Add smoke checks (Node, from `cfg`): every config object position lies inside the ground rectangle (`little_adventure_quality_smoke.js` — create it now, add its stems to `run_all.js` mapping).
- **AC:** 1. After shots show ground under pedestals, bridge and lighthouse `[WEBGL/USER-RUN]`. 2. Node containment check green `[NODE]`. 3. `check_fast` green.

### Q-02 — Real WebGL smoke battery (replace the stub)
- **Size** M · **Env** `[WEBGL]` · **Depends** Q-01
- **Goal:** the renderer is actually tested where WebGL exists; honest SKIP elsewhere.
- **Read first:** `tools/racing3d_smoke.js` (W pattern), TDQ §10, original TP §4.
- **Steps:** implement in `tools/little_adventure_smoke.js` behind the existing WebGL gate: W1 hook exists & `state().webgl`; W2 `setStick` + `step` moves the hero and release stops it; W3 closed gate blocks; W4 draw-call/triangle budgets at start and each zone centre (use `photo()`); W5 mesh states match logic after `give/teleport` (gate open, chest open, pedestal lit); W6 `fxTable()` covers all event types; W7 particles ≤ cap in a 60 s flail; W8 reduced-motion response (`motionScale`) via `bootEmulated`; W9 speech keys + 4 s guard; W10 save round trip; W11 pause on visibility; W12 context lost/restored does not throw (`WEBGL_lose_context`); W13 adaptive tier steps down once, never up. Poll to named phases; never fixed long `step(N)`.
- **AC:** each W-check PASS or counted SKIP(reason); no stubs; `run_all.js --game little_adventure` green.

---

## Phase 1 — Rendering foundation (the look)

### Q-03 — Colour pipeline, lighting rig, atmosphere blend
- **Size** M · **Env** `[WEBGL][USER-RUN]` · **Depends** Q-02 · **Look gate**
- **Read first:** AD §2; TDQ §6.
- **Steps:** set `renderer.outputColorSpace = SRGBColorSpace`; tone mapping per AD §2 (check `typeof THREE.NeutralToneMapping` in Node first); warm key + cool hemisphere per zone from a `ZONE_ATMOS` table in config (data only); implement `atmosphere(blend)` and the 2 s blend on zone change; CSS vignette overlay (≤ 12 %); keep intensities so existing flat-shaded models stay readable. Add `ZONE_ATMOS` validation to the config validator + Node tests (all colours parse, intensities in range).
- **AC:** zone transitions blend smoothly (shots at both sides of each gate differ in light/fog/sky as per AD §2) `[WEBGL]`; reduced motion ⇒ instant switch `[WEBGL]`; Node config validation green.

### Q-04 — Material kit: toon ramp, shared cache, outlines, AO helper
- **Size** M · **Env** `[NODE][WEBGL]` · **Depends** Q-03 · **Look gate (QG1)**
- **Read first:** AD §1, §2; TDQ §1.
- **Steps:** create `little_adventure-materials.js` (`create(THREE)` → `{toon(color,opts), standard cache, outlineOf(mesh, thickness, color), withVertexAO(geo, fn), windPatch(material)}`); toon ramp = 3-step `DataTexture` (`RedFormat`, Nearest); the cache returns the **same instance** for the same key; outline = back-face scaled clone sharing geometry; migrate `little_adventure-models.js` and the instanced decoration to the cache (no per-mesh `new Material`); switch current props from flat Lambert to toon **without changing geometry yet**. Node tests: same key ⇒ same material; N builders ⇒ material count ≤ palette size + constant.
- **AC:** material instances in a full scene ≤ 40 (hook reports `renderer.info.programs` and a material count) `[WEBGL]`; before/after shots show the toon look `[WEBGL/USER-RUN]`; **QG1:** user approves the direction (and answers D-Q1).

### Q-05 — Sky dome, clouds, sun, matched fog
- **Size** S · **Depends** Q-03 (parallel-safe with Q-04) · **Look gate** · **Read** AD §2, TDQ §5.
- **Steps:** gradient sky sphere (vertex colours; `depthWrite:false`, `fog:false`), sun disc sprite following the key light direction, 8–12 instanced low-poly clouds drifting slowly (static under reduced motion), fog colour = horizon colour per zone (feeds from `atmosphere`).
- **AC:** no hard horizon line, sky changes between zones `[WEBGL]`; draw-call delta ≤ +6.

### Q-06 — Terrain, island silhouette, beach, path
- **Size** M · **Env** `[NODE][WEBGL]` · **Depends** Q-04 · **Look gate**
- **Read first:** TDQ §5; AD §2; `little_adventure-config.js` (bounds, zones).
- **Steps:** implement `little_adventure-terrain.js` (pure, seeded `generate(cfg, 12345)`); build the mesh with vertex colours (zone/slope/beach/AO) and a dirt path along the spine; replace the Q-01 planes; set every actor/prop `y = heightAt(x,z)` (hero, grumpies, items, chests, gates, pedestals, owl, statue, lighthouse, instanced decoration); keep the corridor flat (|h| ≤ 0.12). Node tests (TDQ §5 list) in `little_adventure_quality_smoke.js`.
- **AC:** Node tests green; shots show a proper island with shoreline, hills outside the play area, a path; logic smoke unchanged 65/65; hero never floats/sinks (W-check: hero y equals `heightAt` ±0.01 after teleporting to 6 sample points) `[WEBGL]`.

### Q-07 — Water: waves, foam, sparkle
- **Size** M · **Depends** Q-06 · **Look gate** · **Read** TDQ §5, §9.
- **Steps:** wave displacement + tint + shoreline foam via a shader patch (`onBeforeCompile`) driven by `maskAt` baked into a vertex attribute; tier `low` = flat colour + animated sparkle sprites; time uniform advances only while the loop runs (paused ⇒ frozen).
- **AC:** foam ring follows the coast in shots; frame time impact ≤ 1.0 ms on the user's tablet (`?perf=1`, `[USER-RUN]`); draw-call delta ≤ +2.

### Q-08 — Vegetation and prop kit with zone identity (QG2)
- **Size** M · **Env** `[WEBGL]` · **Depends** Q-06 · **Look gate**
- **Read first:** AD §2, §3 (props), TDQ §9; current `buildWorld` section of `little_adventure.mjs`.
- **Steps:** new instanced kits via the material cache: 3 tree species, grass tufts with **wind sway** (shader patch, tiers med+), 3 flower shapes × 5 colours, rocks, mushrooms, logs, fence, signpost, lanterns, stepping stones, rune columns in C. Scatter by zone rules from a seeded RNG with exclusion radii (obstacles, gates, chest, pedestals, path, corridor ±2.5 u). Landmarks per zone (a big blossom tree in A, a hollow log arch in B, a ruined arch in C). Move builders out of `little_adventure.mjs` into `-models.js` (keep ≤ 900 lines each).
- **AC:** draw calls and triangles within TDQ §9 for each tier at each zone centre `[WEBGL]`; placement test: nothing inside exclusion zones (Node, same seed) `[NODE]`; **QG2:** user approves the world look.

---

## Phase 2 — Characters and animation

### Q-09 — Animation toolkit (pure) + filmstrip mode
- **Size** M · **Env** `[NODE][WEBGL]` · **Depends** Q-02 (parallel-safe with Phase 1)
- **Read first:** AD §4; TDQ §4, §10, §11.
- **Steps:** create `little_adventure-anim.js` (pure): easings (`outBack, outElastic, outCubic, inOutSine, smoothstep`), `spring(x,v,target,k,d,dt)` + `springChain`, `envelope(t, [[t0,v0],…], ease)`, `blend(w,target,dt,time)`, seeded `idleNoise(seed,t)`; implement `sheet(name, frames)` filmstrip mode in the renderer (clones a placeholder cube rig at evenly spaced `t` to prove the plumbing). Node tests: easing endpoints (0→0, 1→1), `outBack` overshoots then settles, springs converge (|x−target| < 1e-3 after 3 s) and never overshoot > 5 % when critically damped, determinism, no NaN.
- **AC:** Node tests green; `sheet('test', 6)` shows 6 evenly spaced clones `[WEBGL/USER-RUN]`.

### Q-10 — Hero v2: rig, face system, outlines
- **Size** M · **Depends** Q-04, Q-09 · **Look gate**
- **Read first:** AD §3 (Hero), TDQ §2–§3; `little_adventure-models.js` (old `makeHero`).
- **Steps:** create `little_adventure-characters.js` with `makeHero2()` exactly per AD §3 (cream tunic, hat + spring chain data, scarf chain, mitten hands, boots, sword/shield as children of `handR`/`forearmL`), face atlas painter + shared `CanvasTexture`, outline via the material kit; **all pivots named per AD §3**; keep old `makeHero` until Q-11 switches over; gallery shows both. Node tests: every pivot exists (three imported in Node), triangles ≤ 2 500 (hero) / ≤ 1 200 (others), face painter draws all 8 cells with highlights (fake ctx).
- **AC:** shots of the hero from front/side/3-4 at 1280×800 show a readable, charming silhouette `[WEBGL]`; `?gallery=1` lists it.

### Q-11 — Hero animation set (QG3)
- **Size** M · **Depends** Q-10 · **Look gate**
- **Read first:** AD §4 (all hero rows), TDQ §4; logic state fields `hero.{vx,vz,facing,swingT,cooldown,shield,bumpT}`.
- **Steps:** implement `evalHero` in `-anim.js` per AD §4 (idle, walk/run blend, swing 3-phase from `swingFrac`, shield raise/lower, bump, pickup hold, celebrate) and the renderer glue (stride phase integration, `applyPose`, spring chains, footstep events). Sword trail ribbon (6-segment ring buffer). Switch `heroMesh` to `makeHero2`. Footstep dust via the FX hooks if Q-14 is not done yet (use the existing pool) — otherwise skip. Filmstrips: `sheet('hero-idle',6)`, `hero-walk` (8 frames across one stride), `hero-swing` (8 frames across 350 ms), `hero-shield`, `hero-bump`, `hero-pickup`, `hero-celebrate`.
- **AC:** Node: swing envelope — arm angle at `swingFrac` 0/0.26/0.57/1 matches the AD §4 phases within 5°; pose continuity (no jump > 25° between steps of 16 ms); amplitudes ×0.4 under reduced motion; no NaN `[NODE]`. Filmstrip PNGs for all 7 animations in `shots/` `[WEBGL]`. **QG3:** the user reviews the filmstrips + plays on the tablet.

### Q-12 — Grumpy / guard / boss v2 and their animations
- **Size** M · **Depends** Q-10, Q-11 · **Look gate**
- **Read first:** AD §3 (Grumpy), §4 (grumpy rows); original PS §6.3 (states: idle, approach, retreat, happy).
- **Steps:** `makeGrumpy2(role)` per AD §3 with face atlas cells; `evalGrumpy` (idle breathe/grumble, hop-walk, notice pop, bump lunge, hit squash, befriend colour wave + elastic pop + smile, happy hop-dance, follower spring) driven by `g.state`, `g.hp`, `g.mood`, events `hit/befriend/bump`; boss stomp ring (dust) and crown wobble; respawn puff-in on `grumpyRespawn`. Add **read-only** logic fields only if truly needed (e.g. `g.vx,g.vz`) with Node tests.
- **AC:** filmstrips: grumpy-walk, notice, hit, befriend (8 frames), happy-dance, boss-stomp `[WEBGL]`; Node continuity + volume-preservation test (`sx·sy·sz` within 0.15 of 1 during squash/stretch) `[NODE]`.

### Q-13 — Owl, statue, chest, gate, items, pedestals, bridge, lighthouse (QG4)
- **Size** M (split in two sessions if needed: 13a owl/statue/chest/gate; 13b items/pedestals/bridge/lighthouse/bloom) · **Depends** Q-12 · **Look gate**
- **Read first:** AD §3 (Owl, Props), §4 (rows Owl…Bloom wave); TDQ §4.
- **Steps:** `makeOwl2` + `evalOwl` (look-at limited ±70°, blink, talk-bob on `lastSpeech`, wing flutter on `owlTalk`); statue mouth charge-glow before each acorn (anticipation from the logic's next-throw time — if not exposed, add a read-only `statue.nextT`); chest lid `outBack` + glow + item pop-arc; gate two leaves; keys/gems with halos + spin/bob + pickup fly arc + carry-orbit with spring lag; pedestals rune pulse/beam/wiggle; bridge segments rising in sequence with sparkle; lighthouse rotating beam cone; completion **bloom wave** (instanced flowers scale-in by distance) + butterflies.
- **AC:** filmstrips for owl-talk, chest-open, gate-open, bridge-build, bloom-wave `[WEBGL]`; EVENT_TABLE test shows every logic event has a visual mapping `[NODE]`; **QG4:** user approves characters + props.

---

## Phase 3 — FX, camera, audio, UI

### Q-14 — Sprite particle system and ambient life
- **Size** M · **Depends** Q-04 (parallel-safe with Phase 2) · **Look gate** · **Read** AD §5, TDQ §7, §9.
- **Steps:** `little_adventure-fx.js`: atlas painter (star, sparkle, dust, leaf, petal, glow) on a canvas; two pools (additive/normal) sized by tier; emitters from `EVENT_TABLE`; replace the square `PointsMaterial` pool; additive halo billboards; footstep dust; ambient life per zone (pollen + butterflies A, fireflies + falling leaves B, rune motes C, water sparkles) with tier gating; reduced motion ⇒ bursts 6, ambient ×0.3, no drifting clouds of particles.
- **AC:** hook `fxTable()` lists all events `[WEBGL]`; alive particles ≤ tier cap in a 60 s flail `[WEBGL]`; no square points (shots) `[WEBGL/USER-RUN]`.

### Q-15 — Camera polish and zone atmosphere moments
- **Size** S · **Depends** Q-03, Q-11 · **Look gate** · **Read** TDQ §6, AD §2.
- **Steps:** velocity look-ahead (0.35 s, ≤ 2 u); reveal nudges on `gateOpen` and `bridgeUp` (≤ 6 u, ≤ 1.2 s, returns, never blocks input, disabled under reduced motion); soften camera follow at zone edges; keep the target clamp from Q-01.
- **AC:** hero never leaves the safe frame (W-check: after `teleport` to the 4 extreme points the hero's screen position is inside the 90 % rect) `[WEBGL]`; reduced-motion response asserted `[WEBGL]`.

### Q-16 — Audio v2: SFX, ambient beds, generative music, sound toggle
- **Size** M · **Env** `[NODE][USER-RUN]` · **Depends** Q-09 · **Read** AD §6, TDQ §8; `game/shared/audio-buses.js`, `game/shared/audio.js`; how `racing3d`/`adventure-music.js` use the buses (grep `audioBuses.play`).
- **Steps:** `little_adventure-audio.js` data (SFX recipes for every EVENT_TABLE sfx, per-zone AMBIENT and SCORE) + pure deterministic sequencer + thin player on `audioBuses`; footsteps synced to stride events; music crossfade 2 s on zone change; sparkle layer on `befriend`; fanfare on `complete`; add `#i3d-sound-btn` (SVG icon, `aria-label` Cyrillic, `aria-pressed`) that mutes everything; pause/resume with visibility; duck music under speech; pitch variance per play; peak ≤ 0.25. Save the mute choice (in the existing save key as an optional field validated by the logic's `validateSave`, or in a separate `little_adventureSound` key — pick the smaller change and record why).
- **AC:** Node: sequencer determinism (same seed ⇒ identical event list), every SFX name referenced by EVENT_TABLE exists, gains ≤ 0.25 `[NODE]`; toggle mutes all buses and persists `[WEBGL]`; **the user listens on the tablet** (volume, harshness, repetition) `[USER-RUN]`.

### Q-17 — UI/UX art pass and start screen (QG5)
- **Size** M · **Depends** Q-11, Q-16 · **Look gate** · **Read** AD §7; `game/pages/little_adventure.html`; `game/styles/components.css` (`ps-btn`, `ps-icon-toggle`).
- **Steps:** replace every emoji control with inline SVG icons (sword, shield, play, new, sound on/off); button + joystick visual design per AD §7 (cooldown ring, held glow, press animation); start screen = live 3D island + slowly orbiting camera + hero idle + styled title + two big icon buttons; pause overlay; animated landscape hint; first-launch finger-drag hint (5 s, disappears after the first movement; remembered in the save). Keep all controls ≥ 56 px (sword ≥ 64 px) and inside the viewport at 1024×800 and 844×390; keep `aria-label`s Cyrillic; no digits anywhere.
- **AC:** S7/S8/S9 shell checks green (hit-testing, no digits, aria-labels) `[CHROME]`; shots of start/pause/HUD at 4 viewports `[WEBGL]`; **QG5:** user reviews the full presentation (world + characters + UI + audio) on the tablet.

---

## Phase 4 — Performance, feel, ending, release

### Q-18 — Quality tiers and performance pass
- **Size** M · **Env** `[WEBGL][USER-RUN]` · **Depends** Q-14, Q-08, Q-07 · **Read** TDQ §9; `?perf=1` overlay code; `project/lessons/racing3d.md` (perf lessons).
- **Steps:** implement tier table, initial tier detection, the **step-down only** adaptive rule (extend the existing slow-frame detector), per-tier switches for DPR, particle caps, wind, water, outlines (outlines stay on), ambient life, shadows (later card); expose `state().tier`, `quality(tier)`; `renderer.info` counters in the perf overlay (draw calls, triangles, textures, geometries); dispose everything on exit (check `renderer.info.memory` returns to baseline after back→reopen). **[USER-RUN]** measure on the real tablet: fps and ms per zone for each tier; record in `PROGRESS.md`.
- **AC:** W13 passes (step-down once, never up) `[WEBGL]`; budgets from TDQ §9 met on the tablet for the tier it selects, or the deviation is written down and approved `[USER-RUN]`; no leak after 5 open/close cycles (`renderer.info.memory` stable) `[WEBGL]`.

### Q-19 — Shadows
- **Size** S · **Depends** Q-18 · **Look gate** · **Read** TDQ §9, AD §2.
- **Steps:** one `DirectionalLight` shadow map (1024, PCFSoft) whose frustum follows the hero (±14 u), casting from hero (medium) and hero + actors (high); receiving on terrain/props; improved blob shadow (radial-gradient `CanvasTexture`) for low tier; bias tuned to avoid acne; shadow colour cool.
- **AC:** no acne/peter-panning in shots; high-tier frame time within budget on the tablet `[USER-RUN]`.

### Q-20 — Readability, guidance restyle, feel tuning
- **Size** M · **Depends** Q-17 · **Look gate** · **Read** original PS §6.11; AD §1, §5.
- **Steps:** beacon → soft god-ray cone + rising sparkles; objective arrow → small animated chevrons on the ground; aim-assist **target ring** under the nearest grumpy in range; glow on a gate when the carried key is near and on a pedestal when its gem is carried; make interactive items always readable (halo, outline, contrast check in shots); re-tune **config only** where animation changed feel (swing timing visual vs hit, bump distance, camera offset) — each change logged with the observation behind it.
- **AC:** a VL/user review of 6 gameplay shots finds keys, gems, gates and the objective identifiable at tablet scale `[WEBGL/USER-RUN]`; logic smoke 65/65 unchanged `[NODE]`.

### Q-21 — Completion celebration and free-play life
- **Size** S · **Depends** Q-13, Q-14, Q-16 · **Look gate** · **Read** AD §4 (Complete, Bloom), original PS §6.9.
- **Steps:** sequence on `complete`: lighthouse beam burst, bridge shimmer, fireworks of star sprites (soft, ≤ 2 Hz), bloom wave, followers dance, owl hop, fanfare; afterwards free-play ambience (butterflies, extra flowers) stays; reduced motion = shorter, still, no fireworks flicker.
- **AC:** shots/filmstrip of the sequence `[WEBGL]`; `complete` fires once and the game stays playable `[WEBGL]`; no flashing above 2 Hz (frame-diff check in the shots tool or manual `[USER-RUN]`).

### Q-22 — Full verification and visual regression set (QG6)
- **Size** M · **Env** `[NODE][CHROME][WEBGL][USER-RUN]` · **Depends** Q-17…Q-21
- **Read first:** RV §2–§4; `tools/visual_compare.js` header; `tools/check_release.js`; `tools/touch_interruption_all.js`.
- **Steps:** all W-checks + shell checks S1–S10 PASS/SKIP with reasons; reviewed **golden shots** (`shots/golden/`) for the presets + filmstrips; `node tools/visual_compare.js` baseline for the game; `node tools/touch_interruption_all.js --game little_adventure`; `node tools/check_release.js`; offline second-visit check; asset-budget update (`project/reference/ASSET_BUDGET.md`); rubric self-score (RV §5) by the AI + the user's own score.
- **AC:** report in `PROGRESS.md` (every check PASS / SKIP(reason) / UNVERIFIED); screenshots for 4 viewports; **QG6:** the user approves release.

### Q-23 — Docs, lessons, release prep
- **Size** S · **Depends** Q-22 + QG6
- **Steps:** update `project/games/little_adventure.md` (modules, rig contract, animation table pointer, hooks, tier table, how to add an animation/zone/prop), append footguns to `project/lessons/little_adventure.md`, `DECISIONS.md` (record accepted D-Q's), `STATUS.md` (≤ 6 KB), `ASSET_BUDGET.md`, `GAME_MATRIX`, `tools/README.md`; version bump (ask the user minor vs major); fix commands; `bash tools/sync-docs.sh`; `node tools/archive_tasks.js`; `node tools/check_docs.js`.
- **AC:** `check_fast` + `check_docs` green; `docs/` mirrors `game/`; no commit/push.

### Q-24 — Playtest rounds and polish backlog (QG7, user-led)
- **Protocol:** RV §4. After each session the user reports observations; the AI changes **config/data first**, then small code, logs each change with its observation, re-runs shots + smokes, and updates the rubric scores. Backlog items that need a new decision go to `05` §3, not into code.

---

## Optional tracks (only after the user decides; separate cards will be written then)

- **X1 — Authored character kit (GLB):** if the user wants a step beyond code-built characters, they supply converted CC0 `.glb` files (e.g. Quaternius or KayKit packs — the knight packs are `FBX/OBJ/Blend` and need conversion in Blender; KayKit's animation pack has glTF) and the AI integrates `GLTFLoader` (+ `SkeletonUtils`) vendored from three r169 `examples/jsm`, with `AnimationMixer` clips mapped to the same animation states. Costs: asset weight, licence note, a different art style than the blob characters, tooling the AI cannot do alone.
- **X2 — Content depth:** a second island or more puzzle types (pushable blocks, pressure plates, a lantern-lighting forest). Needs a new product spec first.
- **X3 — Post-processing (soft bloom) on a *high* tier only:** needs vendored `EffectComposer`/`UnrealBloomPass` and a tablet measurement; default is **no**.
