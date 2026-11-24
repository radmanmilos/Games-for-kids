# 03 — Task cards (IS-00 … IS-20)

Each card is self-contained: an AI that reads `README.md`, this card and the files in **Read first** can execute it. Status lives in `PROGRESS.md`, not here.

## Legend

- **Size:** S ≈ ≤150 changed lines · M ≈ ≤400 · L = split it (no L cards exist; if you hit one, stop, split, and record it in `PROGRESS.md`).
- **Env tags:** `[NODE]` any sandbox with Node ≥ 22 · `[CHROME]` headless Chrome, no WebGL · `[WEBGL]` needs a GPU/WebGL host · `[USER-RUN]` the user runs/plays it. If you cannot run a tagged step, mark that AC `UNVERIFIED — needs user run` and print the exact command.
- **Stale generated artifacts:** after any `game/` change `node tools/check_fast.js` may report stale generated files. Run **exactly the fix command it prints** (never hand-edit generated files), then re-run it until green.
- **Do not touch** `game/shared/*`, `docs/` (by hand), `game/games/adventure*.js`, or files outside the card's list. If you must, STOP and ask.
- **AC** = acceptance criterion; cite them in your DONE note. *TD §n* = `01_TECH_DESIGN.md`, *PS §n* = `00_PRODUCT_SPEC.md`, *TP §n* = `04_TEST_PLAN.md`.
- Every `game/games/little_adventure*.js` file starts with a short header comment (purpose, TD section) and uses `'use strict'` in an IIFE (classic scripts) as in `game/games/sorting.js`.

---

## Phase 0 — Governance

### IS-00 — Confirm decisions, install the package, baseline
- **Size** S · **Depends** — · **Owner** the user, optionally with any AI · **ACTIVE title** `little_adventure: approve decisions + install plan package`
- **Goal:** decisions are confirmed, the package lives in the repo, the starting state is known-good.
- **Read first:** `05_DECISIONS_AND_RISKS.md` §1, `project/STATUS.md`, `project/tasks/ACTIVE.md`, `project/PROCESS.md`.
- **Files:** `resources/General_reviews/Little_adventure/little_adventure/*` (already in the patch); modify `project/DECISIONS.md` (≤ 12-line "little_adventure" section = `05` §5), `project/STATUS.md` (one pointer line = `05` §5), `project/tasks/ACTIVE.md` (claim).
- **Steps:** 1. Check every D in `05` §1: APPROVED rows are closed; DEFAULT rows stand unless the user changed them; ask the user about D1 (title) and any OPEN row — do not guess. 2. Baseline and record in `PROGRESS.md`: `git status --short` (expect empty), `git log --oneline -5`, `gh run list --limit 5`, `node tools/check_fast.js`. 3. Add the DECISIONS section and the STATUS pointer from `05` §5 (keep STATUS ≤ 6 KB). 4. Claim the repo task.
- **AC:** 1. Every D has a status; no OPEN row is left undecided without the user's note. 2. Baseline results recorded. 3. `node tools/check_docs.js` green `[NODE]`; `check_fast` result recorded.
- **Regression risks:** exceeding STATUS (6 KB) / ACTIVE (20 KB) budgets.
- **Out of scope:** any `game/` or `tools/` change.

---

## Phase 1 — Skeleton and wiring

### IS-01 — Page shell, registry entry, title, hidden hub tile
- **Size** M · **Depends** IS-00 · **ACTIVE title** `little_adventure: page shell + registry + hidden hub tile`
- **Goal:** `pages/little_adventure.html` opens, shows an empty sky-blue stage with a working back button, and every repo contract (registry, route, page validator) is green. No gameplay, no three.js yet.
- **Read first:** TD §1, §12; `game/pages/racing3d.html` (metadata, `.ps-back`, landscape hint, script order); `game/games/sorting.js` (outline); registry header comment (`game/data/app-registry.js` lines 1–40); `project/lessons/game-runtime.md`.
- **Files:** create `game/pages/little_adventure.html`, `game/games/little_adventure.mjs`; modify `game/data/serbian.js` (`titles.little_adventure: 'Мала авантура'`), `game/data/app-registry.js`, `game/index.html`. Plus generated artifacts via printed fix commands.
- **Steps:** 1. Copy the `<head>` metadata of `racing3d.html` (lang `sr`, manifest link, `theme-color #4A3F6B`, exact viewport meta, the same stylesheets and Fredoka `@font-face`), title `Мала авантура — Петрин свет`, favicon emoji 🏝️. 2. Body: `<div id="i3d-game">` containing back button `<button class="adv-back ps-back" id="i3d-back" aria-label="Назад">` with the same SVG arrow as racing3d's `#r3d-back` (copy its markup and its absolute-position CSS rule under the `i3d-` id; do not link `shared/adventure.css`), `<div id="i3d-view">`, `<div id="i3d-announcer" class="sr-only" role="status" aria-live="polite">`, landscape hint `<div id="i3d-landscape-hint">Окрени уређај водоравно 🌍</div>` with the racing3d CSS rule. 3. Script tags: only the ones that exist now (`serbian.js`, `little_adventure.mjs` as `type="module"`, trailing shared scripts as in racing3d). The importmap is added in IS-08. 4. `little_adventure.mjs`: `window.startlittle_adventure = function(){ if (booted) return; booted = true; … }` that only sets the stage background and a stub `window.__little_adventure`? **No** — do not define `__little_adventure` yet (it is only set when WebGL boots, TD §8). 5. `serbian.js`: add the title next to neighbours. 6. Registry: add the entry from TD §12 (`hubOrder:13`). 7. `index.html`: add the tile from TD §12 **with `hidden`**, after the `game-cat-forest` tile. 8. Run `node tools/validate_pages.js`, `node tools/hub_smoke.js`, `node tools/check_fast.js`; run the fix commands it prints. **If `hub_smoke` fails only because the tile is `hidden`, STOP and ask the user — do not loosen the test.**
- **AC:** 1. Page opens, no console errors, `typeof window.startlittle_adventure === 'function'` `[CHROME]`. 2. Back returns to the Games hub (route contract) `[CHROME]`. 3. `validate_pages`, `hub_smoke`, `check_fast` green. 4. The tile is `hidden` in `index.html`. 5. `bash tools/sync-docs.sh` run; `docs/` mirrors `game/`.
- **Regression risks:** duplicate `hubOrder`; hand-edited generated files; accidentally un-hiding the tile; hub grid overflow at 844×390.
- **Out of scope:** three.js, config, logic, CSS beyond the blank stage, smoke files (IS-02).

### IS-02 — Chrome smoke skeleton and tool wiring
- **Size** M · **Depends** IS-01 · **ACTIVE title** `little_adventure: smoke skeleton + tool wiring + version bump`
- **Goal:** `tools/little_adventure_smoke.js` runs green on a no-WebGL host with real checks, and every tool that lists games knows about `little_adventure`.
- **Read first:** TD §12; TP §3; `tools/racing3d_smoke.js` (WebGL gate pattern) and `tools/cat_forest_smoke.js` (shell checks, back-control checks, no-network static rule); `tools/run_all.js` lines ~80–135; `tools/offline_smoke.mjs` around the `racing3d` entries (lines ~355, ~588, ~726, ~824); `tools/visual-states.json` (`racing3d`, `cat_forest` entries).
- **Files:** create `tools/little_adventure_smoke.js`; modify `tools/run_all.js` (mapping for `little_adventure-config`, `little_adventure-logic`, `little_adventure-models` → `['little_adventure_smoke','little_adventure_logic_smoke']`), `tools/offline_smoke.mjs`, `tools/visual-states.json`, `tools/validate_pages.js` (only if it keeps a per-page id list and an unlisted page would fail), `game/manifest.json` (version 3.0.19 → 3.0.20, **C = minor**, see AGENTS Versioning).
- **Steps:** 1. Write the smoke from the cat_forest/racing3d patterns: boot the real page via `start({page:'/pages/little_adventure.html', tag:'little_adventure-smoke', width:1100, height:700})`; checks S1–S6 (TP §3). 2. Copy the WebGL gate: if no WebGL, assert the fallback and `skip(...)` the rest with a counted reason; **never stub**. 3. Add the `run_all.js` mapping; run `node tools/guards/games_map_negtest.js` and read its output (update it only if it enumerates games and now fails). 4. Add the `little_adventure` entries to `offline_smoke.mjs` (copy the racing3d no-WebGL handling) and `visual-states.json` (a minimal state: just load). 5. Bump the version; run the fix commands from `check_fast`; `bash tools/sync-docs.sh`.
- **AC:** 1. `node tools/little_adventure_smoke.js` exits 0 with ≥ 6 real checks `[CHROME]`. 2. `node tools/run_all.js --game little_adventure` runs it `[CHROME]`. 3. `check_fast` green. 4. Version bumped, offline pack regenerated by the printed command. 5. Running the smoke against a deliberately broken registry route (mutate a copy, restore from a copy — see AGENTS negative-test rule) turns S2 red.
- **Regression risks:** touching other games' mappings; a smoke that "passes" with 0 checks; offline_smoke exit code 0 on failure (see its header note).
- **Out of scope:** logic tests (IS-03+), WebGL checks (IS-18).

---

## Phase 2 — Pure logic (all `[NODE]`; read TD §2–§3, TP §2 before each)

### IS-03 — Config data, validator, stick math, logic smoke harness
- **Size** M · **Depends** IS-02 (or parallel with it) · **ACTIVE title** `little_adventure: config + validateConfig + stickVector + logic smoke`
- **Goal:** all layout/tunables exist as data; the validator catches bad data; the stick math is correct; a Node smoke exists and is green.
- **Read first:** TD §1–§2; PS §4; `tools/check_art.js` lines 1–40 (the `new Function('window', src)` loader); `tools/headless.js` (`check`, `getFails`).
- **Files:** create `game/games/little_adventure-config.js`, `game/games/little_adventure-logic.js` (only `validateConfig` and `stickVector` for now, exported on `window.little_adventureLogic`), `tools/little_adventure_logic_smoke.js`.
- **Steps:** 1. Write the config exactly as TD §2 (all values from PS §4; speech lines from PS §7). 2. `validateConfig`: checks ids unique + ASCII, positions inside `bounds`, every `drops/item/needs` resolves, each gate/pedestal/chest inside its zone, exactly 3 pedestals with colours red/green/blue, exactly one boss, speech keys complete. 3. `stickVector(dx,dy,radius,deadzone)`: magnitude = min(hypot/radius,1); below `deadzone` return zeros; direction normalised; y not flipped (renderer decides). 4. Smoke: load files with `new Function('window', src)`; checks L1–L10 (TP §2): config valid; five negative mutations each produce ≥ 1 problem (unknown item id, duplicate id, position out of bounds, missing speech key, 2 bosses); stick cases (zero, below deadzone, half, full, beyond radius clamps to 1, diagonal normalised). 5. Run it; it must print its summary and exit 0.
- **AC:** 1. `node tools/little_adventure_logic_smoke.js` ≥ 10 checks, exit 0 `[NODE]`. 2. `validateConfig(cfg)` returns `[]`. 3. Files contain no `document`/`localStorage`/`Date`/`Math.random` (the smoke greps for them). 4. `check_fast` green.
- **Regression risks:** logic file accidentally referencing the DOM (breaks Node loading).
- **Out of scope:** `createGame`.

### IS-04 — Game core: hero movement, collision, bounds, determinism
- **Size** M · **Depends** IS-03 · **ACTIVE title** `little_adventure: logic core — movement, collision, determinism`
- **Goal:** `createGame(cfg, seed)` exists; the hero walks with the stick, slides along obstacles, respects bounds and closed gates; the same seed + inputs ⇒ identical state.
- **Read first:** TD §3 (state shape, sub-step order, collision); PS §6.1; TP §2 (L11–L24).
- **Files:** modify `game/games/little_adventure-logic.js`, `tools/little_adventure_logic_smoke.js`.
- **Steps:** 1. Add `mulberry32`, `createGame`, fixed 20 ms sub-steps with a 100 ms dt clamp, `state()`, `drainEvents()`, `debug.teleport/reset`. 2. Hero: velocity eases toward `stick × speed` with `1−exp(−accelRate·dt)`; facing follows movement; releasing the stick stops immediately (set target to 0 and snap |v| < 0.05 to 0). 3. Collision: circles + closed gate rectangles with push-out; slide (remove the normal component, keep the tangent); clamp to bounds minus hero radius. 4. `owl` stump circle and every obstacle from config are solid. 5. Tests L11–L24 (TP §2): speed at full stick ≈ `hero.speed`, half stick ≈ half; stop on release within 100 ms; cannot enter a tree circle; slides along a wall without sticking (progress along the tangent > 0); cannot pass a closed gate; cannot leave bounds from any side; dt of 5 s behaves like 100 ms; **determinism** — two games with seed 7 and the same 600-step input script have byte-identical `JSON.stringify(state())`; a different seed after wandering starts differs only in random fields (or equal if none yet — assert it does not throw).
- **AC:** 1. L11–L24 all green `[NODE]`. 2. No `Math.random`/`Date` (smoke grep still green). 3. `state()` returns a fresh plain object each call (mutating it does not change the game — asserted).
- **Regression risks:** tunnelling through thin gates at low frame rate (sub-steps + dt clamp are the guard); stuck-in-corner behaviour.
- **Out of scope:** combat, items.

### IS-05 — Sword, shield, grumpy AI, befriending, acorns
- **Size** M · **Depends** IS-04 · **ACTIVE title** `little_adventure: logic — combat rules, grumpy AI, acorns`
- **Goal:** swing/aim-assist/shield, grumpy behaviours, hit points and befriending, respawn, followers, acorn statue — all per PS §6.2–§6.3, §6.10 and all **harmless to the hero**.
- **Read first:** PS §2, §6; TD §2 (`sword`, `grumpy`, `acorn`), §3 events; TP §2 (L25–L44).
- **Files:** modify `game/games/little_adventure-logic.js`, `tools/little_adventure_logic_smoke.js`.
- **Steps:** 1. Swing: edge-triggered by `input.swing`, ignored during `swingMs + cooldownMs`; aim assist snaps `facing` to the nearest target within `assistRange` and `assistConeDeg`; hit test = within `reach` + arc; emits `swing` and `hit{id}`. 2. Grumpy states `idle → approach → retreat → happy`; bump = push hero `bumpDist`, emit `bump`, set the grumpy to `retreat` for `retreatMs`, cooldown `bumpCooldownMs`; **the hero has no health field anywhere** (the smoke asserts `Object.keys(state().hero)` contains no `hp|health|hearts|lives`). 3. `hp` per role from config; at 0 → `befriend{id}`, state `happy` forever, `mood` rises 0→1 per hit for the boss; `drops` item spawns (`itemSpawn`) at the grumpy's position. 4. Respawn rules for normal grumpies (PS §6.3); guard/boss never. 5. Followers: up to `followersMax` happy blobs follow at `followDist`, the rest idle-dance. 6. Shield: `input.shield` hold ⇒ `hero.shield=true`, speed ×`shieldSpeedMul`. 7. Acorns: statue spawns every `intervalMs` toward `dir`; shield up and acorn inside the `blockArcDeg` front arc ⇒ `shieldBlock` and acorn removed; else bump the hero gently and remove the acorn; lifetime `lifeMs`. 8. Tests L25–L44 incl.: one hit befriends a normal grumpy; guard needs 2, boss 3; swing during cooldown is ignored; aim assist snaps; a swing hits two grumpies in the arc; bump moves the hero ≤ `bumpDist + 0.1` and never kills/blocks the game; acorn blocked with shield / bounces hero without; respawn after 20 s only when the hero is > 12 u away; boss never respawns; followers ≤ 3; a 10-minute scripted flail never throws and never produces a `state()` with NaN.
- **AC:** 1. L25–L44 green `[NODE]`. 2. No health-like field exists (asserted). 3. No NaN/Infinity in 36 000 steps of random-but-seeded input (asserted).
- **Regression risks:** grumpies trapped in obstacles; respawn stacking; perf (O(n²) is fine at ≤ 10 actors).
- **Out of scope:** items, gates, chests, pedestals.

### IS-06 — Items, bushes, chests, gates, pedestals, bridge, owl, guidance + playthrough bot
- **Size** M · **Depends** IS-05 · **ACTIVE title** `little_adventure: logic — puzzle rules + full-playthrough bot`
- **Goal:** the whole game is completable in Node by a simple bot, with no soft-lock possible.
- **Read first:** PS §4, §6.4–§6.11; TD §3 (`nextObjective`, events); TP §2 (L45–L64).
- **Files:** modify `game/games/little_adventure-logic.js`, `tools/little_adventure_logic_smoke.js`.
- **Steps:** 1. Items: states `hidden/world/carried/used`; pickup within `pickup`; `carry` array (no cap needed). 2. Bush: one hit ⇒ `bushCut`, spawns its item (`itemSpawn`). 3. Chest: walk-in within `chest` or hit ⇒ `chestOpen`, spawns its item. 4. Gate: carried key `needs` within `keyUse` ⇒ item `used`, gate `open` with `openT` 0→1 over 1.2 s, `gateOpen`; open gates stop blocking when `openT ≥ 0.5`. 5. Pedestals: matching gem within `gemPlace` ⇒ `used`, `lit`, `pedestalFill`; wrong colour ⇒ `pedestalWrong{id}` (cooldown 2 s), gem stays carried. 6. All three lit ⇒ `bridge.built` over `buildMs`, `bridgeUp`; hero within 3 u of the lighthouse after the bridge ⇒ `complete` once. 7. Owl: within `owlTalk` ⇒ `owlTalk{line}`; first time `intro`, later (after `owlRepeatMs`) the hint matching `nextObjective` (guard / gate / shield / gems). 8. `nextObjective()` per PS §6.11 priority; returns null after `complete`. 9. **Playthrough bot** in the smoke: each step compute `nextObjective`, steer toward it (straight line with simple slide), swing when a target is within reach, raise the shield when an acorn is within 6 u and the hero is in the lane; assert `complete` within **600 simulated seconds** from a fresh game for seeds 1, 7, 42. 10. Soft-lock tests: carrying any subset of items never blocks any gate/pedestal; wrong-colour attempts don't consume gems; opening G1 then walking back keeps it open.
- **AC:** 1. L45–L64 green `[NODE]`. 2. Bot completes for all three seeds. 3. No event or state exposes a counter of collected/remaining items (asserted: no `count|score|total|remaining` keys in `state()`).
- **Regression risks:** a key spawning inside a wall; the bot passing only because it is generous — keep its inputs honest (stick + swing + shield only; no `debug.*`).
- **Out of scope:** save/load.

### IS-07 — Save/load, validation, fuzz, final logic API freeze
- **Size** S · **Depends** IS-06 · **ACTIVE title** `little_adventure: logic — save/load + validation + API freeze`
- **Goal:** `save()`, `load()`, `validateSave()` per TD §10; nothing crashes on garbage; the API is frozen for the renderer.
- **Read first:** TD §3, §10; `game/games/cat_forest.js` save code (grep `SAVE_KEY`) for the validated-load pattern; TP §2 (L65–L76).
- **Files:** modify `game/games/little_adventure-logic.js`, `tools/little_adventure_logic_smoke.js`.
- **Steps:** 1. Implement TD §10 exactly (no hero position; `world` items reset on load; hero spawns at the last opened gate or start). 2. `validateSave` rejects wrong `v`, unknown ids/keys, wrong types, non-objects, giant payloads (> 8 KB serialised). 3. Fuzz test: 500 seeded random garbage values (numbers, strings, arrays, nested junk, prototype-pollution keys like `__proto__`) never throw and return `null`. 4. Round-trip: play to mid-game with the bot, `save()`, new game `load()`, assert gates/chests/items/befriended/pedestals equal. 5. Add a header comment to the logic file listing the frozen public API (TD §3). Any later change needs a note in `PROGRESS.md`.
- **AC:** 1. L65–L76 green `[NODE]`. 2. Fuzz never throws. 3. `check_fast` green.
- **Out of scope:** `localStorage` access (renderer, IS-15).

---

## Phase 3 — Rendering

### IS-08 — Renderer bootstrap: scene, camera, lifecycle, fallback, hook
- **Size** M · **Depends** IS-02, IS-07 · **ACTIVE title** `little_adventure: renderer bootstrap + camera + lifecycle`
- **Goal:** the page shows a lit low-poly ground and water with a placeholder box that follows a fixed 3/4 camera; the loop, pause, context-loss and no-WebGL fallback all work. **[WEBGL] visual checks are `[USER-RUN]`.**
- **Read first:** TD §1, §4, §6, §8, §9, §11; `game/games/racing3d.mjs` (`startRacing3D`, renderer creation ~l.229, visibility/context-loss ~l.2676–2740, `window.__r3d` ~l.2837); `project/lessons/racing3d.md`.
- **Files:** modify `game/pages/little_adventure.html` (importmap + scripts per TD §1), `game/games/little_adventure.mjs`.
- **Steps:** 1. Add the importmap and script order. 2. In `startlittle_adventure`: create the renderer in try/catch → fallback text `«3D није доступан овде»` inside `#i3d-view` and return (no hook). 3. Scene: sky background + fog, hemisphere + directional light, ground = subdivided plane with vertex colours per zone from config, water plane. 4. Camera per TD §6; a placeholder box mesh driven by `createGame`'s hero (no input yet). 5. Loop: fixed-step accumulation through `game.step`, dt clamp, `visibilitychange`/blur ⇒ pause; context lost/restored handlers; adaptive DPR per TD §9 with `renderer.info` counters. 6. Define `window.__little_adventure` (TD §8) only after the renderer exists. 7. Back button: stop loop, dispose renderer/geometries/materials.
- **AC:** 1. On a no-WebGL host the fallback text shows and the back button works `[CHROME]`. 2. With WebGL the page renders a lit ground with the box and no console errors `[USER-RUN]`. 3. `__little_adventure.state().webgl === true` and `drawCalls ≤ 30` at this stage `[WEBGL]`. 4. `check_fast`, `little_adventure_smoke`, `little_adventure_logic_smoke` green.
- **Regression risks:** leaking GPU resources on back; double boot; loop continuing after back.
- **Out of scope:** input, models, dressing.

### IS-09 — Model builders + gallery mode (user look-review gate G2)
- **Size** M · **Depends** IS-08 (parallel-safe with it for the Node part) · **ACTIVE title** `little_adventure: models.js + ?gallery=1 + Node model tests`
- **Goal:** every character/object exists as a code-built low-poly group, testable in Node, viewable side by side in `?gallery=1`.
- **Read first:** TD §7 (recipes + palette), §1 (Node loading rule); PS §5; TP §2 (L77–L84).
- **Files:** create `game/games/little_adventure-models.js`; modify `game/games/little_adventure.mjs` (gallery mode only), `game/pages/little_adventure.html` (script tag), `tools/little_adventure_logic_smoke.js` (model section).
- **Steps:** 1. Implement `little_adventureModels.create(THREE)` with every builder in TD §7, named children exactly as listed, shared materials from one palette object, `flatShading:true`. 2. Gallery: when `location.search` contains `gallery=1`, skip the game and lay out hero (with sword + shield), owl, grumpy, happy grumpy, guard, boss, key, 3 gems, chest (open + closed), gate, pedestal ×3, statue + acorn, lighthouse, bridge segments, tree, bush, rock, flower in a labelled-by-order row on a plain ground, slow turntable (none under reduced motion). 3. Node tests: `await import(pathToFileURL('game/assets/lib/three.module.min.js'))` builds every model with no DOM; assert each returns a `THREE.Group`, the named children exist, per-model triangle count ≤ 600 (hero ≤ 900), total gallery ≤ 12 000.
- **AC:** 1. L77–L84 green `[NODE]`. 2. Gallery renders without console errors `[USER-RUN]`. 3. **Gate G2:** print "G2: open `…/pages/little_adventure.html?gallery=1` on your tablet/PC and tell me what to change." and STOP; do not start IS-10 until the user replies.
- **Regression risks:** per-call material creation (leaks); ES `import` inside the classic script (forbidden — THREE is a parameter).
- **Out of scope:** animation, game wiring.

### IS-10 — World dressing: ground colours, instanced decoration, static structures
- **Size** M · **Depends** IS-09 (G2 approved) · **ACTIVE title** `little_adventure: world dressing`
- **Goal:** the island looks like Meadow → Forest → Shrine and all static structures stand where config says.
- **Read first:** TD §4, §7; PS §4; `project/reference/ASSET_BUDGET.md` (racing3d budget note).
- **Files:** modify `game/games/little_adventure.mjs` (a `buildWorld(cfg, models)` section; if the file passes ~900 lines, move it to a new classic script `little_adventure-world.js` exposing `little_adventureWorld.build(THREE, models, cfg)` and add it to the page).
- **Steps:** 1. Ground vertex colours by zone with a soft blend at zone borders; water plane; island edge falloff. 2. `InstancedMesh` for trees (ring around bounds + zone B clusters), grass tufts, flowers, rocks; positions from a seeded RNG (seed fixed in config, e.g. 12345), rejecting spots within 1.5 u of any obstacle, gate, chest, pedestal, bush or the spine path (x∈[-3,3]); obstacles in config that are circles must each have a visible model on top. 3. Static meshes: gates (closed pose), stump + owl placeholder position, statue, chest, pedestals, lighthouse, bushes (uncut). 4. `__little_adventure.state()` now also reports `drawCalls` and `triangles` from `renderer.info`.
- **AC:** 1. `drawCalls ≤ 90`, `triangles ≤ 40 000` at the start position and at every zone centre `[WEBGL]`. 2. No decoration intersects an obstacle circle (a Node test on the placement function with the same seed, L85) `[NODE]`. 3. Visual check of three zones `[USER-RUN]`.
- **Regression risks:** instanced counts too high for modest tablets; z-fighting between ground and water.
- **Out of scope:** actors, animation.

### IS-11 — Hero rendering, joystick UI, buttons, keyboard → the hero walks
- **Size** M · **Depends** IS-10 · **ACTIVE title** `little_adventure: hero + joystick + buttons`
- **Goal:** the child can walk the hero with the floating joystick; sword/shield buttons exist (they drive logic input; visuals are IS-13).
- **Read first:** TD §5; PS §3; `game/shared/input.js`; `game/pages/racing3d.html` control CSS (`.r3d-zone`, `.ps-btn--control`); `project/lessons/game-runtime.md`.
- **Files:** modify `game/pages/little_adventure.html` (zone + base + knob + 2 buttons + CSS), `game/games/little_adventure.mjs` (input wiring, hero mesh from `makeHero`, facing, walk bob).
- **Steps:** 1. `#i3d-stick-zone` (left 50 %, `top` below the back/sound row), `#i3d-stick-base`/`#i3d-stick-knob` (hidden until touch), `#i3d-btn-sword`, `#i3d-btn-shield` (bubble style via `ps-btn ps-btn--control`; ≥ 64 px; sword ≥ 16 vmin, shield ≥ 14 vmin; bottom-right, not overlapping). 2. Wire each with `window.pointerDrag` per TD §5; `little_adventureLogic.stickVector`; keyboard map; `resetInput` on blur/visibility/orientation/context-loss. 3. Hero mesh follows `state().hero`, rotates toward `facing` smoothly, simple walk bob (none under `window.REDUCED_MOTION`). 4. Camera follows the hero.
- **AC:** 1. Dragging the stick moves the hero; releasing stops it at once `[USER-RUN]`. 2. Thumb on stick + thumb on a button works simultaneously `[USER-RUN]`. 3. Hit-test: each button ≥ 56 px, inside the viewport at 1024×800 and 844×390, not covered by another element `[CHROME]` (add to the smoke, TP §3). 4. `setStick/swing/shield` hook calls drive the same code path (a smoke check drives `__little_adventure.setStick(1,0)` + `step(1000)` and asserts the hero moved east) `[WEBGL]`.
- **Regression risks:** stuck input after a lost pointer; the stick zone swallowing taps meant for the back button (zone must not cover the HUD row).
- **Out of scope:** swing/shield visuals, effects.

### IS-12 — Actors rendered from state → first playable (gate G3)
- **Size** M · **Depends** IS-11 · **ACTIVE title** `little_adventure: actors + first playable`
- **Goal:** grumpies, guard, boss, owl, items, carried-item train, chests, gates, bushes, pedestals, acorns, bridge and lighthouse all appear and animate from `state()`; the game is completable on the tablet.
- **Read first:** TD §3 (state shape), §4, §7; PS §5–§6.
- **Files:** modify `game/games/little_adventure.mjs` (or `little_adventure-world.js` + a new classic script `little_adventure-actors.js` if size demands; each file ≤ ~1200 lines).
- **Steps:** 1. Create meshes once from config ids; each frame set position/rotation/visibility/state-driven colour from `state()` only (grumpy mood → colour lerp pink→yellow; happy shows smile, hides eyebrows; boss crown; follower trail). 2. Items float and spin when `world`; `carried` items orbit behind the hero in an arc; `used` hidden (a short fly-to-target tween on `pickup/gateOpen/pedestalFill` events). 3. Chest lid angle from `open`; gate group lowers by `openT`; bush swaps to a stump when cut; pedestal ring glows when `lit`, wiggles on `wiggleT`; bridge segments rise one by one with `bridge.t`; lighthouse light on after `bridge.built`. 4. Acorns drawn at their positions. 5. Blob shadows under hero and actors.
- **AC:** 1. The game is completable on a real tablet from a fresh start `[USER-RUN]` (record time and any stuck spots). 2. Smoke (W-checks, TP §4): after `give()`/`teleport()` shortcuts the visible mesh states match `state()` for gate open, chest open, pedestal lit `[WEBGL]`. 3. `drawCalls ≤ 150`, `triangles ≤ 60 000` throughout a scripted run `[WEBGL]`. 4. **Gate G3:** list for the user: joystick feel, camera, readability of keys/gems, frame rate, and **ask them to approve or change the Serbian wording in PS §7**; STOP.
- **Regression risks:** meshes created per frame; renderer deciding gameplay (forbidden, TD §4).
- **Out of scope:** particles, sounds, speech, beacon.

---

## Phase 4 — Polish

### IS-13 — Combat feel: swing/shield animation, particles, sounds
- **Size** M · **Depends** IS-12 (G3 approved) · **ACTIVE title** `little_adventure: combat feel + SFX`
- **Files:** `game/games/little_adventure.mjs` (or `little_adventure-fx.js` classic script if > ~1200 lines). **Read first:** PS §7–§8; TD §4; `game/shared/audio.js`, `audio-buses.js`; `project/lessons/game-runtime.md`.
- **Steps:** 1. Sword: arm + sword group rotates through the 110° arc over `swingMs` (position from `hero.swingT`, so it stays logic-driven); shield: raised pose while `hero.shield`, a soft blue ring flash on `shieldBlock`. 2. Particle pool (TD §4): star burst on `befriend`, leaf burst on `bushCut`, sparkle on `pickup`/`pedestalFill`; counts `burst` (12) or `burstReduced` (6) when `window.REDUCED_MOTION`; ≤ 24 alive. 3. Grumpy squash-and-stretch on `bump`/`hit` (skipped under reduced motion). 4. Sounds per PS §7 via `window.tone/sweep` (route through `audioBuses` as racing3d does — copy its helper); a single `sfx(name)` table; sound mute toggle (`#i3d-sound-btn`, `ps-icon-toggle`, copy `r3d-music-btn` markup). 5. No screen shake, no full-screen flash.
- **AC:** 1. Every event in TD §3 has a visual or sound mapping (a smoke walks the event list and asserts a handler exists via a hook-exposed `fxTable` keys list) `[WEBGL]`. 2. Particles alive ≤ 24 at all times in a 60 s scripted flail `[WEBGL]`. 3. Under `REDUCED_MOTION` burst size is 6 — assert `burst === (rm ? burstReduced : burst)` from the hook, never the host setting itself `[WEBGL]`. 4. Sounds audible, not harsh `[USER-RUN]`.
- **Out of scope:** speech, beacon.

### IS-14 — Guidance and speech: beacon, arrow, owl, announcer
- **Size** S · **Depends** IS-13 · **ACTIVE title** `little_adventure: guidance + speech`
- **Files:** `game/games/little_adventure.mjs` (or `little_adventure-fx.js`). **Read first:** PS §6.11, §7; TD §4; `game/shared/speech.js`.
- **Steps:** 1. Beacon mesh at `nextObjective()`, gentle pulse (static under reduced motion), hidden when null. 2. Arrow circling the hero after 6 s without a progress event (`pickup`, `befriend`, `gateOpen`, `chestOpen`, `bushCut`, `pedestalFill`). 3. Speech: map events to PS §7 keys through `config.speech` (never hard-code lines in the module); `owlTalk{line}` speaks the line and bobs the owl; same-key repeat guard of 4 s; call `window.speech.speak`. 4. `#i3d-announcer` text for key moments (Serbian, same lines). 5. Use the **approved** wording from G3 (edit `config.speech` only).
- **AC:** 1. Hook exposes `lastSpeech` (key + time); a smoke drives `owlTalk`, `gateOpen`, `complete` and asserts the keys and the 4 s guard `[WEBGL]`. 2. Beacon follows the objective through a bot run `[WEBGL]`. 3. Speech is Serbian and understandable `[USER-RUN]`.

### IS-15 — Start screen, save/continue/new, completion celebration
- **Size** M · **Depends** IS-14 · **ACTIVE title** `little_adventure: start screen + save + celebration`
- **Files:** `game/pages/little_adventure.html`, `game/games/little_adventure.mjs`. **Read first:** TD §10; `game/games/cat_forest.js` save I/O; `game/games/racing3d.mjs` `SAVE_KEY` use; PS §6.9.
- **Steps:** 1. Start overlay `#i3d-start`: title `<h1>`, two icon-only buttons with `aria-label`s «Настави» (continue, shown only when `validateSave` accepts the stored data) and «Нова авантура» (clears `little_adventureSave`). 2. Save on milestone events only; load via `game.load`, spawn at the last opened gate. 3. Wrap every storage call in try/catch (private mode/quota ⇒ play without saving). 4. Completion: on `complete`, flowers sprout everywhere (instanced, grows over 3 s, scale 1 immediately under reduced motion), fanfare, owl speaks `complete`; free play continues; save `complete:true`.
- **AC:** 1. Reload mid-game continues with gates/items/befriended intact `[WEBGL]` via hook; corrupt `localStorage` value ⇒ fresh game, no error `[WEBGL]`. 2. No numbers/progress meters appear anywhere (a smoke scans visible text nodes for digits) `[CHROME]`. 3. Celebration visible and not flashing `[USER-RUN]`.

### IS-16 — Reduced motion, accessibility, landscape, pause, robustness
- **Size** S · **Depends** IS-15 · **ACTIVE title** `little_adventure: a11y + reduced motion + lifecycle`
- **Files:** `game/pages/little_adventure.html`, `game/games/little_adventure.mjs`. **Read first:** PS §8; TD §11; `project/lessons/racing3d.md` (reduced-motion lesson); `tools/touch_interruption_all.js`.
- **Steps:** 1. Audit every animation against `window.REDUCED_MOTION` (PS §8 list). 2. `aria-label` on every control; announcer lines; focus order. 3. Landscape hint CSS for portrait ≥ 520 px. 4. Pause overlay on hide/blur that resumes only on touch. 5. `contextmenu` prevented; long-press never selects. 6. Run `node tools/touch_interruption_all.js --game little_adventure` and fix issues in `game/` only.
- **AC:** 1. Smoke asserts the product's response to the media query (`motionScale === (rm ? 0 : 1)` from the hook) never the host setting `[WEBGL]`. 2. Touch-interruption battery green or `UNVERIFIED` with the printed command `[CHROME]`. 3. Every button has a Cyrillic `aria-label` (scan) `[CHROME]`.

### IS-17 — Performance pass (measured on the tablet)
- **Size** S · **Depends** IS-16 · **ACTIVE title** `little_adventure: performance pass`
- **Read first:** TD §9; `project/reference/ASSET_BUDGET.md`; `project/tasks/ACTIVE.md` task 398 (modest-hardware measurement is a known gap).
- **Steps:** 1. `[USER-RUN]` the user opens the page with `?perf=1` (add a tiny overlay showing `frameMs`, `dpr`, `drawCalls`, `triangles`; remove or hide it in normal play) and records the numbers on their tablet in each zone and during a flail. 2. If over budget: first lower instanced counts, merge static geometry, lower `dprMax`, then simplify models — each as a **config/data** change where possible. 3. Verify adaptive DPR step-down by forcing slow frames through the hook (`__little_adventure.forceSlow(true)` test-only).
- **AC:** 1. Measured numbers recorded in `PROGRESS.md` (tablet model, zone, fps) `[USER-RUN]`. 2. Budgets from TD §9 met or the deviation written down and approved `[USER-RUN]`. 3. Adaptive step-down asserted once, never up `[WEBGL]`.

### IS-18 — Full test battery, offline, screenshots (gate G4)
- **Size** M · **Depends** IS-17 · **ACTIVE title** `little_adventure: full smoke battery + offline + screenshots`
- **Read first:** TP §3–§6; `tools/play_matrix.mjs` (racing3d special case ~l.353); `tools/offline_smoke.mjs` (racing3d no-WebGL handling); `project/PROCESS.md` step 5; `tools/README.md`.
- **Steps:** 1. Complete `little_adventure_smoke.js` W-checks (TP §4) behind the WebGL gate; keep S-checks real everywhere. 2. Finish the `tools/visual-states.json` PLAY state (poll to a named phase, not a fixed long step). 3. Make sure the offline battery covers `little_adventure` and a second visit works offline `[WEBGL]/[USER-RUN]`. 4. `node tools/play_matrix.mjs` (chromium + webkit, phone/tablet/desktop) `[WEBGL]`. 5. Refresh screenshots: `node tools/screenshot.js --review=Screenshot_Review --pages=little_adventure --task=<repo task #>` `[USER-RUN]` (needs a GPU). 6. `node tools/check_release.js` `[CHROME]/[WEBGL]`. 7. Write a short test report into `PROGRESS.md` listing every check as PASS / SKIP(reason) / UNVERIFIED.
- **AC:** 1. All TP §2–§4 checks accounted for (no silent skips). 2. Screenshots exist for 4 viewports `[USER-RUN]`. 3. `check_release` result recorded. 4. **Gate G4:** present the report and screenshots; STOP until the user approves shipping.

---

## Phase 5 — Ship

### IS-19 — Docs sweep, unhide tile, version, sync
- **Size** M · **Depends** IS-18 + G4 · **ACTIVE title** `little_adventure: docs sweep + unhide hub tile + release prep`
- **Steps:** 1. Create `project/games/little_adventure.md` (model on `project/games/cat-forest.md`: purpose + rules, where, constants live in `little_adventure_CONFIG`, how to add a gem/zone/grumpy, test hook, determinism recipe). 2. Mirror every hit of the grep in TD §12 (GAME_MATRIX, INVENTORY_MATRIX, folder-structure, ASSET_BUDGET, SAFETY_PRIVACY_AUDIT, tools/README, DECISIONS final form). 3. Append new footguns to `project/lessons/racing3d.md` (or a new `project/lessons/little_adventure.md` and link it from `AGENTS.md`'s lessons list if the budget allows). 4. Remove `hidden` from the hub tile; run `hub_smoke` and `short_landscape_audit` at 1024×800 **and** 844×390. 5. Bump the version (C = minor; ask the user whether this is a B bump). 6. Fix commands from `check_fast`, `bash tools/sync-docs.sh`, `node tools/archive_tasks.js`, overwrite `project/STATUS.md`, `node tools/check_docs.js`.
- **AC:** 1. `check_fast` + `check_docs` green. 2. Tile visible and hit-testable at both viewports. 3. `docs/` mirrors `game/`. 4. Do **not** commit or push — the user does.

### IS-20 — Tablet playtest rounds and tuning (user-led)
- **Size** S per round · **Depends** IS-19 · **ACTIVE title** `little_adventure: playtest round N`
- **Protocol:** TP §5. After each session the user brings observations; the AI changes **only config values** where possible (speeds, ranges, cooldowns, bump distance, notice radius, camera offset, counts) and records each round's decisions in `PROGRESS.md` and `project/games/little_adventure.md`. Gate **G5** decides ship/tune/cut.
- **AC:** 1. Every change is traceable to an observation. 2. Smokes re-run green after each round. 3. No locked rule (PS §2) is weakened without a new user decision.
