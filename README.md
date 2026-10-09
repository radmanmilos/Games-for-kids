# Petrin svet

> **Petrin svet** is an offline collection of educational mini-games for young children (approximately 2–6 years old), designed to be fun, safe, simple, and frustration-free.

---

## Current status (2026-10-09)

- **Task 216 DONE (2026-10-08):** the visual/UX plan's Phases 0–2 are complete — V1.1/V1.2 puzzle fixes, V0.1/V0.2 deterministic state capture, and V2.1–V2.11 (the shared `.ps-header` shell in `game/styles/shell.css` plus per-page migrations of Puzzle, Classroom, Coloring, Piano, Ocean, Space, Driving, Memory, and a VERIFY sweep of the remaining 16 pages) — all pushed with green CI (run 37801686226).
- **Task 218 DONE (2026-10-09):** terminal plan-status line — `node tools/plan_progress.js` prints `[bar] x/y (z%) · current: <task>` from the plan table itself (16/38, current V3.2); repaired 6 stale plan rows so the count is honest.
- **Task 217 DONE (2026-10-09):** Phase 3 — V3.1, the 844×390 short-landscape audit — `node tools/short_landscape_audit.js` → `resources/General_reviews/SHORT_LANDSCAPE_AUDIT.md`, 4 FAILs on the V3.2 worklist (sorting tray, matching candy row, dino back-under-picker, space score∩worlds). Next: task 219 = V3.2 fixes.

- **Task 215 done:** CI runs only affected smoke legs on pushes/PRs, keeps full manual/weekly coverage, and skips release work safely when no smoke legs are needed.
- **CI is green — for the first time in the repo's history.** Run **#41**: **29 jobs succeeded, 1 skipped** (`Extended`, manual/weekly by design), **0 failed**, including `Release QA`. `Release QA` had failed on *every* run since #31; issue **#3 is closed**. `gh` is installed and authed, so CI step logs are readable.
- **`Release QA` root cause (task 181):** Chrome boot crashes are **routine** on GitHub runners — 13 of 27 matrix legs hit one on run #40, all recovered on `run_all.js`'s retry. The `Offline E2E` step was the only runner executing its tool **raw**, so it had no retry and turned a self-healing event red every time. Also fixed: `offline_smoke.mjs` **had no exit code**, so a blocking gate could only go red by crashing, never by failing an assertion. **Never run a `*_smoke` tool raw in CI.**
- **Task 178/180:** the CDP diagnostic could describe the *wrong* Chrome process, and `games_map_negtest` asserted something it could never satisfy (that false red is what broke runs #34/#37). Both fixed and guarded with negative-tested regression guards.
- **Offline is the service worker; there is no ZIP.** The manual download archive was removed 2026-10-02 (user decision) — it was never published, so the link 404'd. See [`OFFLINE.md`](OFFLINE.md).
- Local gate: `node tools/check_fast.js` = **7/7 green**. Note: 3 local `racing3d` failures are this host's missing WebGL, not a regression.
- Roadmap: **29/29 done (R0–R27b) — the queue is complete.** R27 maze/path shipped (19/19 smoke, 23 offline-covered games), and R27b reassessed the original nine-item learning roadmap in [`LEARNING_ROADMAP_REVIEW.md`](LEARNING_ROADMAP_REVIEW.md). The review's Tier A (phonics to all 30 letters, numbers 11–20) and Tier B (Classroom `Време` and `Годишња доба` activities, sequencing growth to 8 sequences) are all done (tasks 196–203). A **visual/UX implementation pass** has now begun from [`Petrin_svet_Master_Visual_UX_Implementation_Plan_2026-10-07.md`](resources/General_reviews/Petrin_svet_Master_Visual_UX_Implementation_Plan_2026-10-07.md), with the execution list in [`VISUAL_UX_IMPLEMENTATION_PLAN.md`](VISUAL_UX_IMPLEMENTATION_PLAN.md). See `ROADMAP.md`.

---

# Project Vision

Petrin svet is intended to feel like a premium children's application that parents can confidently hand to their child.

The focus is on:

- Learning through play
- Simple interactions
- Bright and colorful design
- No advertisements
- No internet connection required
- No in-app purchases
- No difficult mechanics
- No reading required for basic navigation
- Instant fun

This project is being built primarily for my daughter, but should be suitable for any young child.

---

# Core Design Philosophy

Every feature added to this project should follow these principles.

## 1. No Frustration

Children should almost never fail.

If something is difficult:

- Make it easier.
- Increase touch areas.
- Assist the player.
- Never punish mistakes.
- Always reward interaction.

The child should always feel successful.

---

## 2. Learning Through Play

Learning should never feel like homework.

Instead, children naturally learn through interaction.

Examples:

### Animals

- Recognition
- Vocabulary
- Sounds

### Shapes

- Shape recognition
- Dragging practice

### Colors

- Color recognition

### Letters

- Pronunciation
- Recognition

### Numbers

- Counting
- Number recognition

### Memory

- Recall
- Observation

### Music

- Cause and effect
- Rhythm

### Fine Motor Skills

- Dragging
- Tapping
- Tracing

---

## 3. Instant Play

Navigation should always be extremely simple.

```
Home

↓

Choose Game

↓

Play Immediately

↓

Back

↓

Choose Another Game
```

No complex menus.

No settings screens before gameplay.

---

## 4. Offline First

Everything must work without internet.

Avoid:

- External APIs
- Online assets
- Cloud services

Prefer:

- Local assets
- WebAudio
- Vanilla JavaScript

---

## 5. Tablet First

Primary platform:

Android tablet

Requirements:

- Landscape orientation
- Large touch targets
- Big readable text
- Touch-friendly UI
- Responsive layout
- Smooth performance

Desktop support is optional.

---

# Current Mini Games

## 🐶 Animals

Purpose:

Learn animal names and sounds.

Features:

- Animal cards
- Spoken names
- Synthesized sounds
- Random animals

Educational goals:

- Vocabulary
- Listening
- Recognition

---

## ⭐ Shape Match

Purpose:

Learn geometric shapes.

Gameplay:

- **Toddler-first (Tier 1, default):** 2 shapes, generous snap radius (1.5× slot width), soft animation toward target, no punishment on wrong target.
- **Tier 2:** 3 shapes. **Tier 3:** 4 shapes with rotation variation.
- Drag shapes into matching outlines — no pixel-perfect dragging needed.
- Correct placement triggers a success chime and the shape name is spoken.
- Wrong placement returns the shape gently; after 2 failed attempts the correct target pulses yellow as a hint.

Educational goals:

- Shape recognition
- Fine motor skills
- Hand-eye coordination

---

## 🐱🐶 Match Game (Candy)

Purpose:

A simple toddler-friendly swap-to-match game.

Features:

- 4×4 board
- Drag to swap
- Automatic matching
- Cascading pieces
- Score counter
- Star power-ups

Educational goals:

- Pattern recognition
- Planning
- Cause and effect

---

## 🧭 Мала истраживачица (Little Explorer, formerly Paper Kitty Adventure)

Current status:

Integrated into Petrin svet.

Features:

- Side-scrolling platformer
- Canvas renderer
- Touch controls
- Physics
- Camera
- Coins (with glow backing for visibility)
- Multiple levels
- Win screen
- Synthesized audio
- Character picker at game start (kitty default / explorer girl, task 90)
- Character-specific death sounds (cat for the kitty, "Јао!" for the girl, task 90)
- **Toddler-first (task 125):** soft respawn to last safe position, forgiving platforms (40px tolerance), exploration reward (bonus coin for new areas)

Educational goals:

- Exploration
- Timing
- Motor skills
- Cause and effect

---

## 🚗 Возила (Driving)

Purpose:

Drive a little car through ten different road worlds, dodging vehicles and road works.

Gameplay:

- The road rolls forward automatically; the child steers the car up/down/left/right.
- Avoid cars, trucks, buses, cones and barriers — bumping just knocks the car back a little (no fail states).
- Collect the world's emoji (⭐🍭🍂⛄🎿🌙🌵🌴🐚🪐) and reach the "ЦИЉ" finish gate.
- 10 themed worlds: Градски трг, Поље сунцокрета, Јесења шума, Зимски пут, Планински пут, Ноћни град, Пустињска магистрала, Тропско острво, Морска обала, Космичка стаза.
- Every world has its own synthesized music theme with an ambient layer (horns, crickets, birdsong, wind, rumble, owl hoots, desert wind, waves, sleigh bells).
- **Navigation arrow (task 126):** a large pulsing yellow arrow appears near the goal when the child is far away, pointing toward the finish — no text instructions.
- **Bubble trail (task 127):** in Ocean mode, gentle bubbles float toward the goal when the child is far away — visual guidance without arrows.
- **Forgiving jump (task 128):** in Dino mode, jump buffer (150ms), forgiving collision (40px), and soft respawn to last safe position — a child who reacts slightly late still gets many successful jumps.
- **Spatial identity (task 129):** in Space mode, altitude bands (3 subtle horizontal layers) and planets as landmarks (4 large decorative circles) — teaches simple spatial movement through play.
- **Shared engine (task 130):** all 4 adventure games use `AdventureEngine.create()` — a bug fix in shared movement applies once across all games.
- **Legacy cleanup (task 131):** removed `papper_kitty.html`, `racing.html`, `kitty-standalone.js` — all replaced by newer implementations.
- **Play-aware tests (task 132):** memory smoke now covers audio-disabled, resize, and back-button scenarios (12 → 15 checks).
- **Touch interruption tests (task 133):** shapes smoke now covers pointercancel, multi-touch, and page-hidden scenarios (13 → 16 checks).
- **Visual regression (R9/task 170):** captures the hub and all 16 `screenshot:true` apps at five phone/tablet/desktop viewports (85 images). `node tools/visual_compare.js` compares decoded pixels against reviewed baselines; changed-pixel metrics and failure diffs are reported. Baselines live in `resources/visual-baselines/` and can be replaced only by explicitly running `node tools/visual_compare.js --approve-baseline` after reviewing the complete capture set.
- **Animal art recovery (task 135):** reverted custom SVG illustrations — restored native Unicode emoji for all animal artwork (per Master Implementation Plan: custom SVGs were "visually too crude")
- **Navigation arrow (task 126):** a large pulsing yellow arrow appears near the goal when the child is far away, pointing toward the finish — no text instructions.

Educational goals:

- Motor skills
- Cause and effect
- Observation

---

## 🐠 Океан (Ocean)

Purpose:

Swim a little fish through ten different underwater worlds, dodging sea creatures and obstacles.

Gameplay:

- Free 2D swimming (fly mode — no gravity); the child steers the fish with two thumb-friendly button clusters — ◀▶ on the left edge, ▲▼ on the right edge.
- Avoid sharks (which patrol back and forth), jellyfish, rocks, mines, seaweed, pufferfish, crabs and anchors — bumping just knocks the fish back a little (no fail states).
- Collect the world's emoji (🐙🐚⭐🐌⚓🕯️🐻‍❄️🐠💰🌙) and reach the "ЦИЉ" flag-arch banner.
- 10 themed worlds: Корални гребен, Лагуна, Морске траве, Каменита обала, Потопљени брод, Морска пећина, Ледени океан, Морски ров, Пиратско благо, Ноћни океан.
- Every world has its own synthesized music theme with an ambient layer (bubbles, corals, kelp, drifting fish schools, cave lights, treasure glints).

Educational goals:

- Motor skills
- Cause and effect
- Exploration

---

## 🦕 Дино (Dino)

Purpose:

Run and jump a little dinosaur through ten different prehistoric worlds, hopping across gaps and floating platforms and dodging raptors.

Gameplay:

- Ground-mode platformer (jump/gravity/physics); the child steers with two thumb-friendly controls — ◀▶ on the left edge and a big ⬆ jump button on the right edge.
- Solid ground, floating and moving platforms, auto step-up stairs, and pipes that pop out a mini-raptor every few seconds — bumping just knocks the dino back a little (no fail states).
- Collect the world's emoji (🌺🦜💧🌋💎🐸❄️🌵🌙🏝️) and reach the "ЦИЉ" stone-temple gate.
- 10 themed worlds: Прашума, Тропска долина, Језеро, Вулкан, Пећина, Мочвара, Ледено доба, Пустиња, Ноћни свет, Острво диносауруса.
- Every world has its own synthesized music theme with an ambient layer (jungle birds, lake waves, volcano rumble, cave drips, swamp crickets, ice bells, desert wind, night coos, island surf).

Educational goals:

- Motor skills
- Timing
- Cause and effect
- Exploration

---

## 🚀 Свемир (Space)

Purpose:

Fly a little rocket through ten different space worlds, weaving between meteors, asteroids and UFOs and collecting the world's emoji on the way to the glowing "ЦИЉ" portal.

Gameplay:

- Fly-mode adventure (free 2D movement, no gravity); the child steers with two thumb clusters — ◀▶ on the left edge and ▲▼ on the right edge.
- Dodge meteors, asteroids, comets, UFOs (some patrol side to side), ring bands, planets, satellites and black holes — bumping just knocks the rocket back a little (no fail states). A friendly alien makes a cameo.
- Collect the world's emoji (⭐🌙🔴💫🪐🌪️❄️🛰️🌌🕳️) and reach the "ЦИЉ" portal gate.
- 10 themed worlds: Звездано небо, Месечева стаза, Црвена планета, Астероидни појас, Сатурнови прстенови, Јупитеров вихор, Ледени месец, Свемирска станица, Галаксија, Дубоки свемир.
- Every world has its own synthesized music theme with an ambient layer (twinkling bells, moon flutes, desert wind, asteroid rumble, icy rings, station chimes, galaxy waves).

Educational goals:

- Motor skills
- Timing
- Cause and effect
- Exploration

---

## 🏎️ Мала тркачица (Little Racer)

Purpose:

An OutRun-style pseudo-3D racing game where the little racer speeds toward the horizon, steers left/right to dodge ahead, and collects the world's pickups.

Gameplay:

- Simulated 3D perspective — the road rushes toward the horizon, the car is fixed at bottom-center, auto-forward motion, left/right steering only.
- Procedural curves — the road bends along a seeded track (world's `curveSeed`/`curveMax`); road, dashes, pickups and finish line all follow the bend.
- Character picker at start (Маца Истраживачица / Истраживачица, reusing the explorer sprites, task 90); car rosters (4 per driver) are already defined in the config for the Stage 4 picker.
- Collect the world's emoji (🌸 flowers in the Ливада world) as the finish line approaches; pickups start small in the distance and grow as you reach them. Crossing the finish celebrates with "Браво!" and a 🏁 win modal.
- 8 themed worlds (Ливада, Плажа, Снег, Слаткиш, Џунгла, Свемир, Ноћ, Фарма) selectable mid-game via the 🌍 button — each with its own pickups (🌸🐚❄️🍭💎⭐🌙🥕), palette, track curves, roadside decorations, goal, and synthesized music theme (+ per-world ambience).
- HUD: score and world-name pills, a pickup counter using the world's collectible name, and a progress bar toward the finish line.
- Obstacles (Stage 3, task 97): puddles 💧, rocks 🪨 and barricades 🚧 spawned along the track slow the car briefly — no fail state, always a free lane to dodge into. Puddles halve speed for 1.5s, rocks stop the car for 0.5s then crumble away in a puff, barricades knock the car back ~50 units and slow it; each hit shakes the screen gently and plays a soft thud. Per-world density (meadow/candy lightest, jungle/night/farm densest) and obstacle types.
- Stages done: 1 (foundation) + 2 (wide curved road, 8 worlds with decor + per-world music, HUD) + 3 (obstacles/difficulty) + 4 (full car roster, unlocking progression, localStorage persistence) + 5 (countdown, engine hum, pickup sparkles, ARIA live region, reduced-motion safe, tablet thumb-zone controls). (Stage 1 committed as `4e028b4`; Stage 4 as `ffa64db`; Stage 5 commit local, push pending.)
- Visual-style upgrade (2026-09-11, per `RACING_VISUAL_STYLE_ANALYSIS.md` Option A «faux-3D juice»): per-world rolling hills + camera banking/sway + FOV/scale pulse + speed-line streaks + vignette; textured road (alternating pavement bands + solid white edge lines) with horizon fog + distance fade + ground shadows; wheel dust + skid marks; ⚡ boost pads (1.35× speed burst + flame particles); better-shaded car (gradient 3/4 look, suspension bob, rolling wheel spokes, cast shadow). Motion extremes stay reduced-motion-safe (shake/FOV pulse/speed lines suppressed when `prefers-reduced-motion: reduce`). Validation: `racing_smoke.js` **39/39 PASS** (not yet committed).

### 🏎️🔰 Мала тркачица 3Д (Little Racer 3D) — in review

A full 3D (WebGL / three.js, r169 vendored in `game/assets/lib/`) racing game, built after the MK World / Crash Nitro Kart visual-feel analysis in `RACING_VISUAL_STYLE_ANALYSIS.md`. The 2D racer above is kept as-is (and is now hidden from the games menu) while the 3D one is the flagship racing game.

- Vertical slice → **full 8-world game (task 100)**: new hub entry `racing3d` → `pages/racing3d.html` + `games/racing3d.mjs` + `games/racing3d-config.js`. The 3D racer reuses the 2D racer's shared `RACING_CONFIG.worlds` (single source of truth — 8 worlds: Ливада, Плажа, Снег, Слаткиш, Џунгла, Свемир, Ноћ, Фарма) merged with per-world 3D extras (laps, kart/boost/tree/light colors, hill factor, pickup style).
- **World picker** at start (8 emoji world cards + kart color swatches; countdown starts on «Крени!») matching the 2D racer's picker flow; 🌍 HUD button + «Изабери свет» in the win modal reopen it anytime.
- **Per-world pickups** — 🌸 flower / 🐚 shell / ❄️ snowflake / 🍭 lollipop / 💎 gem / ⭐ star / 🌙 moon / 🥕 carrot meshes, HUD counter uses the world's collectible emoji.
- **Per-world music** — 8 themes from the shared config via the same lookahead step-scheduler as the 2D racer, 🔊 toggle persisted as `racing3dMusic`.
- **Win-flow world progression** — «Следећи свет ➡️» advances to the next world, «Играј поново 🔄» restarts, «Изабери свет 🌍» reopens the picker; `racing3dSave` = `{wins, world, kart}`.
- **Kart color picker** — 4 chassis colors (Црвена/Плава/Зелена/Љубичаста), cosmetic only.
- Chunkier cartoon kart (bright primaries, big rounded wheels, rim-light sheen, suspension bounce + turn banking), procedural hilly closed-loop track with red/white rumble strips and a checkered start line, gradient sky dome + depth fog.
- Chase cam with lag, look-ahead, speed FOV kick and slight roll; countdown 3-2-1-Крени! with Serbian speech; obstacles 💧 puddle / 🪨 rock / 🚧 barricade that slow the kart (no fail state); 3-lap finish → win modal, wins persisted in `racing3dSave`.
- Look-and-feel pass (2026-09-14, per `RACING_VISUAL_STYLE_ANALYSIS.md`): glossy cartoon kart (hot-rim sheen, windshield, chunky wheels, exhaust), warm sun + cool rim lighting, distance-readable landmarks (rocks, bushes, flower patches, pennant flags, start-gate arch), particle system (boost flames, drift skid smoke, offroad dust, pickup petal burst, obstacle puff, finish confetti), ⚡ boost pads (1.2× burst + whoosh), gentle drift slide while steering at speed, flat red/white edge rumble strips with rumble shake + low sound, and a bouncier chase cam (suspension bob, steer sway, hill-crest pitch). Extremes stay reduced-motion-safe. `racing3d_smoke.js` **15/15 PASS**, `hub_smoke.js` ALL PASS.
- Play-test round 2 (2026-09-14, 5 items): **race-track mini-map** (top-down loop HUD with a live moving kart marker + gold driven-arc), **wider road** (14→20 + scaled rumble/offroad limits), **wheels now roll forward around their axle** (rotation.x, tyre + rim + hub together), **bigger symmetric hills/valleys**, and the **"road under the green ground" fix** — the flat ground plane was replaced with a hilly terrain ribbon that follows the track surface so the road always sits on the grass.
- Play-test round 3 (2026-09-14): **gold tread studs on the wheels** so the spin is clearly visible, and **steering feel** — the kart now clearly **banks into the turn** and **points** into the direction it's moving while a steer button is held (front wheels visually turn too); on release it stays where it is and straightens upright, pointing forward again.
- Play-test round 4 (2026-09-14): **half speed** (`MAX_SPEED` 70→35, toddler-paced) and **follow-the-wheels steering** — pressing a button turns the front wheels in and the car follows, drifting that way; on release the wheels **slowly return to the middle** and the car glides to a stop where it is (no auto-centering).
- Play-test round 5 (2026-09-14): **no side-drift fix** — the car now stops its sideways movement right when you release the button; only the front wheels keep slowly returning to the middle. No auto-centering, it settles exactly where you left it.
- **World ambience pack — polish round 1 (2026-09-22, 6 user-selected upgrades; kart colors 6-8 not chosen):** **per-world decor props** (16 camera-facing emoji billboards from the shared `decor` list — farm tractors, night stars/owls, jungle palms…), **sky props** (a 260-point starfield for Свемир/Ноћ, a moon disc + crater for Ноћ, a soft sun disc elsewhere, 7 drifting translucent clouds on bright worlds), **per-world ambient sounds** (the 2D racer's bird/waves/wind/chime/stars/owl layer ported in and keyed to each music theme), **weather particles** (snowfall in Снег, falling gold stars in Свемир), **pickup float/spin** (undriven pickups bob and slowly rotate), and **live obstacle density + warning beep** (`OBS_COUNT` now scales from the world's `obstacleDensity` 7–14; a soft 330 Hz beep sounds when an obstacle is 12–90 units ahead).
- Offline-ready: three.js is bundled, cache list + offline manifest regenerated by `tools/build_offline.ps1`.
- **WebGL context loss (2026-09-25, batch 11):** three.js already skips rendering while the context is lost and re-initialises it on restore, but the child saw a frozen black screen and the kart teleported on recovery. The game now shows "Графика се привремено искључила. Сачекај…" and freezes the simulation until the context returns.
- **Play-test round 6 (2026-09-25, task 105 — 4 reported defects + the `chatGPT_review2` queue, all DONE):**
  - **Hub reachability.** The `racing3d` button is the last one in the games grid; with a `24vh` grid margin and only 2 columns on a 390px-tall screen its bottom edge sat **249px below the fold** (and only 4-5px of clearance on tablet) — you had to enter and exit a game to make it appear. A `@media (max-height: 560px)` block now uses 3 narrower columns and a smaller margin, so every button is on screen.
  - **Steering zones no longer cover the HUD.** The touch zones (`z-index: 11`, starting at `26vmin`) started *above* the 🌍/🔊 buttons (`z-index: 10`) on short landscape screens, so both were untappable — which is why the world picker was only reachable by finishing a race. The corner buttons are now `z-index: 20`.
  - **Real SVG icons.** The 🏠 back button rendered as an empty circle (no arrow) and ⬅/➡ were two different emoji glyphs; all three are now mirrored inline Material SVGs like the rest of the project.
  - **Steering no longer points the car sideways.** The body yaw (a slip-angle term, ±17°) read as "the car spins sideways" and is gone; the bank is reduced to 0.22 rad and the front wheels still turn at full lock. Handling is unchanged.
  - **Reduced motion (2026-09-25, task 105):** the kart bob, camera steer-sway, camera roll, offroad rumble shake and boost FOV punch are now all suppressed when the device asks for reduced motion; the speed-linked FOV widening stays on because it is a speed cue. Only affects devices that set the OS preference.
  - **Mechanical queue:** particles now store the `spin` callers ask for (nothing ever spun), the particle cap is exact, the context-loss sentence is complete, `racing3d` is in the Playwright viewport matrix, `resetInput()` clears stuck steering on launch/blur/tab-hide, compound sound motifs are anchored to the first note so the audio bus's 40 ms drain can't stretch them, and the dead `ACCEL = 16` constant is now the real `ACCEL_RATE = 2.2`.
  - **Perf hooks (dev/test only):** `__r3d.perf()` reports draw calls, triangles, particle count, average and worst frame time, DPR and draw-buffer pixels. Measured: **71 draw calls driving → 162 during a confetti burst** (≈ +1 per particle). Burst frame time did not degrade beyond noise, and each particle fades independently via its own material (`racing3d.mjs:1520`), so sharing materials would make a whole burst fade in lockstep. **Pooling is therefore deliberately not done** (decided 2026-09-25) — revisit only if a real device shows burst frame-time spikes.
- Validation: `node tools/racing3d_smoke.js` (**32/32 PASS**), `node tools/hub_smoke.js` (**10/10 PASS**), `node tools/play_matrix.mjs racing3d` (**10/10 cells**: chromium + webkit × 5 viewports), `node tools/check_all.js --docs --offline` (**19/19 tools, 364 checks, 0 fail**).
- **WebGL gate (2026-09-29, R1).** `racing3d` is the only WebGL game, and **headless Linux hosts often have no WebGL** (`--disable-gpu`, and Chromium builds without SwiftShader — ANGLE then aborts with `SwANGLE failed with error EGL_NOT_INITIALIZED`). On such a host `racing3d_smoke.js` runs 3 real checks (the "3D није доступан овде" fallback, page chrome, and the shared `RACING_CONFIG` load = 8 worlds / 8 music / 3 obstacle types) and reports the 32-check race battery as a counted **SKIP**, exiting non-zero only on a real failure. A skip is never a pass, and the race is **not covered** on those hosts — it needs a GPU/SwiftShader host (CI) or a real-device play-test. `racing-config.js` is asserted in *both* modes, so the task-146 regression that silently left the game with 0 worlds stays guarded. Details in `PROJECT_TASKS.md` task 152 and `AGENTS.md` → Footguns.
- Tuning so far (2026-09-11, from user play-test feedback): `MAX_SPEED` 132→70→35; **quaternion-slerp chase cam** (no more upside-down flip on hills, hills tamed); **`DoubleSide` fix** — the road/dashes/edges ribbons were wound down-facing and back-face culled (the road was literally invisible; root cause, not a color issue); road is now a classic two-lane asphalt with dashed center line + solid white edges; camera pulled in tight; kart holds its line when released (the slip-angle body yaw was later removed in round 6).

Educational goals:

- Timing
- Motor skills
- Cause and effect

---

## 🧩 Animal Scene Puzzle

Purpose:

Build observation and problem-solving skills through a simple classic puzzle.

Gameplay:

- Show an animal scene (playground, house, savanna).
- Tap the scene to split it into puzzle pieces.
- Drag pieces into a rectangular placeholder with forgiving placement.
- Pop sound on correct placement; celebration and next-puzzle button on completion.
- Phase 2 (GAME-PUZZLE-001, task 117): magnetic snap — pieces animate quickly into the exact slot and lock; developmental levels 2 pieces (1×2) → 4 (2×2) → 9 (3×3); a 👁 peek button is always available during play to preview the finished scene again.

Educational goals:

- Observation
- Problem solving
- Hand-eye coordination

---

## 🔢 Animal Counting

Purpose:

Practice counting and number recognition with familiar animals.

Gameplay:

- Show a picture with a number of animals.
- Offer large, touch-friendly number choices.
- Immediate positive feedback for correct answers, gentle assistance for mistakes.

Educational goals:

- Counting
- Number recognition

---

## 🧠 Animal Memory

Purpose:

Exercise recall and observation with a classic matching game.

Gameplay:

- **Toddler-first (default):** 2×2 board (2 pairs), large cards, no visible score — just "Пронађен пар!" feedback when a pair is matched.
- **Older modes:** Средње (3×2, 3 pairs) and Тешко (4×4, 8 pairs) with a visible pair/move counter.
- Flip two cards to find matching pairs. Cards flip with a soft whoosh; the animal's name is spoken and its real sound plays only when a pair is matched.
- Celebration when the board is cleared, restart button to play again.

Educational goals:

- Recall
- Observation

---

## 🎨 Coloring

Purpose:

Encourage fine motor control and color recognition with tap-to-fill scenes.

Gameplay:

- A reference thumbnail shows the finished image ("✨ Color it like this!").
- Pick a color from the 6×2 palette grid (with spoken color name).
- Tap the outline regions of an SVG animal scene to fill them.
- A next-skip button (➡) lets the child jump to the next animal at any time.
- When every region matches the reference, celebrate, play the animal's real sound, and auto-advance to the next animal.
- Scenes: Dog, Cat, Cow, Lion, Elephant, Frog, Pig, Duck, Fox, Sheep, Horse, Chicken.

Educational goals:

- Colors
- Fine motor skills
- Observation (matching to reference)

---

## 🏫 Учионица (Classroom)

Purpose:

A learning hub where the child sees a word, hears it, and repeats it.

Activities:

- 🔤 Азбука — all 30 Serbian Cyrillic letters. Tap a letter to hear its sound and a word that starts with it (with an emoji picture).
- 🔢 Бројеви — numbers 0–20. Tap a number to hear it and a sentence like "Пет слонова" (Five elephants), shown with that many animal pictures. (11–20 added 2026-10-06, recordings generated with `resources/tts_generate.js`.)
- 🔷 Облици — Круг, Квадрат, Троугао, Звезда, plus 3D shapes Лопта, Коцка, Квадар, Ваљак, Купа, Пирамида (drawn as inline SVG so the real 3D form is visible). Tap a shape to hear its name.
- 🎨 Боје — the 11-color palette. Tap a color to hear its name.

The hub carries **two button sets** — "За малишане" (the 4 learn-and-repeat activities above) and "За децу" (full-fledged quiz games, Phase 3): Азбука за децу (hear a letter sound → pick the letter), Бројеви за децу (count the animal emojis → pick the number), Боје за децу (hear a color → pick the swatch), Облици за децу (hear a shape → pick the shape). Each is a forgiving 8-question multiple-choice game: pop + bounce on correct, gentle shake and "Покушај још једном!" on wrong (no punishment), 🏅 + "Све си урадио!" panel with score on completion, and a replay button. Tap the prompt card to replay the sound.

Every activity has an autoplay button (▶) that walks through the tiles one by one, advancing only after the spoken word finishes plus a short pause, so the child has time to repeat. No celebration icon — the goal is to learn and repeat the words. All text is Serbian Cyrillic, and all speech is Serbian (pre-generated MP3 assets).

**Category tabs (Phase 2, GAME-CLASS-001, task 120):** the learn-and-repeat activities now carry a visual category tab bar — Азбука / Бројеви / Облици / Боје — so the child can jump between content areas without going back to the hub; the active tab always matches the open activity.

Educational goals:

- Alphabet
- Vocabulary
- Counting
- Number recognition
- Shape recognition
- Color recognition

---

# Current Status

Paper Kitty Adventure has been fully integrated into Petrin svet and the placeholder is gone. The project is now a modular application:

- **Hub landing (task 64, 2026-08-05):** `index.html` opens on the "🌈 Петрин свет" title with two big group tiles — **УЧЕЊЕ first** (icon = 2×2 emoji combo 🏫📝/🎹🎨) then 🎮 **ИГРЕ** (Explorer, Driving, Ocean, Dino, Space, Candy, Memory, Puzzle, Racing). Each tile opens that group's sub-hub screen with the round game buttons; a back arrow returns to the landing. УЧЕЊЕ = Classroom, Tracing, Animals, Shapes, Counting, Coloring, Piano.
- **Explorer (Мала истраживачица)** is a standalone page (`pages/explorer.html`) — the canonical Explorer route. **Fixed 2026-09-30:** `#char-modal` had no CSS, so the "Изабери лик" hero buttons rendered off-screen (clipped by `#app{overflow:hidden}`) and the game could not be started by a child; it now has the same modal rules as `#win-modal`, and `kitty_smoke` asserts the buttons are in-viewport and topmost via `elementFromPoint`.
- **Parent area (task 147 + fix 2026-09-30):** the 🔒 button on the hub opens `pages/parent.html`, which owns the offline download, update check, progress reset and audio test. These controls were previously **duplicated on the child-facing hub** (a 140×140 download button, status line, "Проверити ажурирања" and a "ZIP за ручно преузимање" link); they now exist **only** in the parent area. **R12 (task 163) completed the parent surface:** a live **connection status** (Онлајн/Офлајн, updates on `online`/`offline` events) and the app **version** (single source of truth: `version` in `manifest.json`, fetched by the page so it also resolves offline). `tools/parent_smoke.js` covers the surface and `hub_smoke.js` statically asserts the child launcher never regains a technical control. **The manual ZIP link was removed on 2026-10-02 (user decision, superseding the 2026-09-30 "keep it hidden" outcome)** — offline is the service worker, so there is nothing to hand-unpack; `parent_smoke.js` now asserts the link is **absent** so it cannot return as a dead 404.
- All other games open as standalone pages launched from the hub.
- Navigation, audio, speech, and utilities are shared modules.
- **Accessibility / reduced motion (task 83, 2026-08-07, REVERTED):** the shared `window.reducedMotion()` utility in `shared/utils.js` (JS gates) + `@media (prefers-reduced-motion: reduce)` collapse in `shared/accessibility.css` was implemented then **fully reverted per user decision** — the user's OS has `prefers-reduced-motion: reduce` active, so it stripped the memory card-flip, candy combo/hint/level-up, and obstacle-hit-particle animations that ARE the gameplay feedback for kids. All animations are restored. Two pre-existing task-79 split regressions were fixed along the way: driving's dashed road divider now renders (`roadTopY()` fix) and ocean/space obstacles draw again (restored `cfg.drawObstacle` dispatch).

**Current focus: Phase 6 — Roadmap Cohesion.** R8–R15 are complete: this includes runtime-error capture, visual regression, accessibility, the browser/device matrix, hub cleanup, shared Serbian data, and shared audio adoption. **R15 / task 175** routes product speech, sound effects, music and media through shared buses, with speech ducking and audio-disabled fallbacks. R16, R17, R18, R19, R20 and R21 are complete (R16: asset/performance budget report; R17: `manifest.json` as the single version source with a version-derived SW cache name and a versioned update lifecycle; R18: `ROADMAP.md` single index, SUPERSEDED banners on the old plans, and a short `HANDOVER_PROMPT.md` with history archived; R19: a constrained local-progress store with a parent-only `📊 Напредак` view; R20: the `PLAYTESTING.md` portfolio protocol; R21: more/less/same (`compare.html`/`compare.js`); R22: sorting/classification (`sorting.html`/`sorting.js`); R23: Serbian phonics (`phonics.html`/`phonics.js`, audio-first, 2 choices, tiny repeat — since task 196 it derives **all 30 letters** from `SERBIAN.alphabet` and uses the recorded letter pronunciations, after an audit found 6 of its original 10 letter/word pairs were incorrect); R24: sequencing (`sequencing.html`/`sequencing.js`, visual order with three-card drag placement and gentle feedback); R25 rhythm imitation (`rhythm.html`/`rhythm.js`, two patterns, one drum, no timer/score); R26 spatial concepts (`spatial.html`/`spatial.js`, five scenes — горе/доле, унутра/ван, лево/десно, близу/далеко, испред/иза — with two large Cyrillic words each); R27 maze/path (`maze.html`/`maze.js`, drag the bear stone-to-stone along a wide forgiving path, gentle redirect off-path, no timer or traps); R27b (`LEARNING_ROADMAP_REVIEW.md`, the reassessment of the original nine-item learning roadmap) are complete — the roadmap queue is now finished. See `ROADMAP.md` for the single entry point and `PROJECT_TASKS.md` for task status. **Tasks 177 (CI), 177c (Release QA geometry), 177d (CDP disconnect reporting), and 156 (suite resilience/performance) are complete.** Task 156 reduced Windows Chrome teardown from a 2448 ms median to 52 ms average by terminating through the existing process handle, retaining a bounded wait and profile-specific fallback. The full 27-tool battery passed; **R16–R27b have been completed; the roadmap queue is finished.** Since then the learning-roadmap review's **Tier A (tasks 196–198: phonics → all 30 letters; numbers 11–20)** and **Tier B (tasks 202–203: sequencing growth to 8 sequences; Classroom `Време` and `Годишња доба` activities on pre-recorded clips)** are all done — the Classroom now has **6 activities** (Азбука, Бројеви, Облици, Боје, Време, Годишња доба) and every registered speech asset is on disk.

---

# Deployment (GitHub Pages)

The live site is served by GitHub Pages from the **`docs/` folder on the `main` branch** — so the site updates on every push to `main`. Site URL: **https://radmanmilos.github.io/Games-for-kids/**

- **`game/` is the single source of truth.** `docs/` is just the published copy — never edit `docs/` directly.
- **When `game/` changes, replace the ENTIRE `docs/` content with the new `game/` content.** Run `tools/sync-docs.sh` (deletes `docs/` and copies `game/` into it), then commit and push — the site is live.
- One-time setup (already done): Settings → Pages → **Source: `Deploy from a branch`** → `main` → `/docs`. No build step (plain static HTML; the app uses only relative paths, so it works under the `/Games-for-kids/` subpath).
- The earlier GitHub Actions workflow (`.github/workflows/deploy.yml`, deploy `game/` → `gh-pages`) was **abandoned** — GitHub Pages refused to deploy from `game/`, so it was removed per user decision. Keep it that way: no workflow, `docs/` mirror only.
- Local preview: use Live Server on `game/` over HTTP — never `file://` (breaks audio and throws Unsafe-attempt warnings).

## Offline installation (Task 94 — mechanism documented in `OFFLINE.md`)

The hub is being prepared as an installable Serbian-Cyrillic PWA. The manifest is at `game/manifest.json`, with a relative scope that works both at the repository root and under the GitHub Pages repository subpath. The service worker (`game/sw.js`) has install/activate/fetch handling, one-tap cache-all messaging with progress events, and content-hash update comparison. The hub exposes a download and an update-check control in the parent area; caregiver documentation and validation are tracked in Task 94.

Caregiver instructions are in `game/docs/OFFLINE_INSTALL.md`. **The full mechanism — service worker, the two generated inventories, the never-hard-code-the-path rule, and how it is tested — is documented in [`OFFLINE.md`](OFFLINE.md).**

**No ZIP is produced or published (2026-10-02, user decision).** The `docs/game-offline.zip` fallback package has been removed along with every reference to it: it was never tracked in git, so GitHub Pages never published it and the parent-area link pointed at a 404, and its build step shelled out to `zip`, which is unavailable on this host. Offline delivery is the **service worker** — «Преузми за офлајн рад» caches every file the app needs, so there is nothing to unpack by hand. Do not edit `docs/` directly; regenerate it from `game/` after runtime changes.

The one-tap download is self-healing (task 101, 2026-09-22): each file is fetched with a 20 s timeout and 2 retries — if one file keeps failing it is skipped and the run continues, so progress no longer gets stuck on a single file. The completion message reports how many files were skipped ("N прескочено — покушајте поново") and pressing the button again re-fetches the missing ones.

---

# Navigation Model

The hub launches each game as a standalone page:

```
Petrin svet (index.html landing: 🌈 title + two group tiles — УЧЕЊЕ 🏫📝🎹🎨 first, then 🎮 ИГРЕ)

↓

Group tile

↓

Group sub-hub (round game buttons — ИГРЕ 9, УЧЕЊЕ 7)

↓

Standalone game page

↓

Back button

↓

Group sub-hub
```

`shared/navigation.js` drives every `data-go` button. All games are standalone pages under `pages/`.

---

# Game Lifecycle

Every mini-game follows the same structure.

```javascript
startGame();

update();

draw();

stopGame();
```

Paper Kitty:

```javascript
startKitty();

updateKitty();

drawKitty();

stopKitty();
```

Standalone pages expose `start<Game>()` entrypoints booted by `shared/main.js`.

Example:

```javascript
let kittyRunning = false;

function startKitty() {
    kittyRunning = true;
    loop();
}

function stopKitty() {
    kittyRunning = false;
}

function loop() {

    if (!kittyRunning)
        return;

    updateKitty();

    drawKitty();

    requestAnimationFrame(loop);
}
```

---

# Shared Systems

The application shares common systems between all games.

## Navigation

One shared navigation system.

---

## Audio

Only one AudioContext.

Never create multiple AudioContexts.

---

## Speech

One reusable helper.

Example:

```javascript
speak("Dog");
```

---

## Sound Effects

Reusable sounds:

- Click
- Success
- Pop
- Star
- Win
- Animal sounds

---

## Utilities

Reusable helper functions.

Examples:

- Random
- Shuffle
- Collision helpers
- Animation helpers
- Touch helpers

---

# Fonts

Main UI

- Fredoka

Used throughout the application, including the Paper Kitty HUD (bundled locally as `game/assets/fonts/fredoka-latin.woff2` + `fredoka-latin-ext.woff2`, no external requests at runtime).

---

# Project Folder Structure

The repository follows a strict folder organization.

```
PetrinSvet/

resources/
game/
tools/
AGENTS.md
PROJECT_TASKS.md
HANDOVER_PROMPT.md
README.md
```

---

## resources/

This folder is the **development workspace**.

Everything related to creating the project belongs here.

Examples:

- Original HTML files
- Reference projects
- Images
- Sounds
- Fonts
- Icons
- Mockups
- Documentation
- AI-generated assets
- Notes
- External libraries
- Experimental code
- Temporary assets

Development tooling kept here (not part of the runtime):

- `tts_generate.js` — Serbian speech MP3 generator (Google Translate TTS, `node resources/tts_generate.js`).
- `visual_audit_capture.js` — headless-Chrome screenshot harness for the visual audit (no deps, run from repo root).
- `visual_audit_instructions.md` — full read-only instructions for the visual audit model (task 47).

Test tooling lives in `tools/` (see `tools/README.md`). Run with `node tools/<file>.js` — no install needed, no `package.json`.

- **`node tools/check_all.js`** — the one-command validation ritual: `node --check` over `game/` + `tools/`, then the whole 24-tool smoke battery in parallel. Add `--docs` to also run `tools/sync-docs.sh` (required whenever `game/` changed) and `--offline` to rebuild the offline package.
- **`node tools/check_fast.js`** — the read-only fast gate, ~9 s, no browser battery beyond the hub: syntax, registry/metadata, CI-workflow topology, code-scanning-alert guards, generated-artifact freshness, offline inventory, hub smoke. **Writes nothing.** CI's `fast` job is exactly this one command, so the gate has a single definition instead of YAML steps that can drift.
- **`node tools/check_scan_alerts.js`** — read-only guard for the two GitHub code-scanning alerts: a dangerous-scheme filter must test `javascript:` **and** `vbscript:` (not a partial denylist), and an HTML stripper must consume the whole closing tag (`</script foo="bar">`, not just `</script>`). Both rules are checked behaviourally and self-tested against the pre-autofix shapes. Runs inside `check_fast`.
- **`node tools/check_release.js`** — the read-only release gate: `check_fast` + the whole battery (through `run_all.js`). It **fails on a stale generated artifact instead of rewriting it**, and enforces that promise on itself by fingerprinting `docs/`, the cache list, the manifest and the ZIP before and after and exiting non-zero if it changed anything. `--fast` skips the battery; `--release` adds the two advisory gates (offline E2E, a11y report) that are known-unreliable until R6/R10.
- **`node tools/check_syntax.js`** — syntax only: `node --check` over every `.js`/`.mjs` in `game/` + `tools/`, no browser.
- **`node tools/validate_pages.js`** / **`node tools/validate_offline.js`** — read-only structural gates: the game registry/routes/PWA metadata, and the three offline inventories (cache list, manifest, ZIP contents). Both also run inside `check_fast`, so a bad manifest fails the build instead of shipping.
- **`node tools/validate_generated.js`** — read-only freshness check for the generated artifacts: the committed `docs/` mirror must hold exactly the same 208 files as `game/` with canonically identical bytes, and `game/sw-cache-list.json` must equal what `generate_sw_list.js --stdout` produces. It reports the fix (`sync-docs.sh` / `generate_sw_list.js`) and never applies it. This is the guard for "edited `game/` and forgot to sync", which shipped a stale site silently — `sw_update_smoke.js` cannot catch it, because a stale `docs/` is internally consistent.
- **`node tools/validate_workflow.js`** — read-only guard over `.github/workflows/ci.yml` (17 checks): referenced tools exist, every `needs.<job>.outputs` read is a **direct** dependency, no tabs/CR, balanced `${{ }}`, `runs-on` on every job, affected matrix wiring/empty-selection guard, `fail-fast: false`, `extended` gated to manual/schedule. R4 fixed two silent CI failure modes by hand; this makes them permanent.
- **`tools/manifest_hash.js`** — canonical-bytes hashing (text hashed as LF, binaries byte-for-byte) shared by the offline builder and validator. Without it the manifest was hashed off raw work-tree bytes, so with `core.autocrlf=true` on Windows it depended on the machine that built it, and a Windows rebuild would have made every Linux checkout plus the parent area's «Проверити ажурирања» report the whole app as changed. `tools/build_offline.ps1` hashes through the .NET BCL, not the `Get-FileHash` cmdlet, because `check_all.js` spawns `powershell` and the child inherits a `PSModulePath` that cannot auto-load `Microsoft.PowerShell.Utility`. It now also refuses to write an empty or partial `game/offline-manifest.json` and exits non-zero, so a broken offline pack can never be reported as green again. `tools/build_offline.js` is the Node entry point and **both builders now generate only the two service-worker inventories** — the ZIP step and its `zip` dependency are gone (2026-10-02).
- **`node tools/run_all.js`** — the parallel smoke runner on its own. `--game <name>`, `--since <sha>` (only the smokes covering your changes), `--watch` (re-run affected smokes as you save), `--concurrency N`, `--list`, `--list --json`.
- **`node tools/<game>_smoke.js`** — one game directly; fastest edit loop.
- Extended browser/device gate: **`node tools/play_matrix.mjs`** (Chromium + WebKit across 5 phone/tablet/desktop viewports); unavailable browsers are reported as incomplete coverage, not a pass. The axe-core 4.10.2 accessibility scan is pinned in `tools/vendor/` and runs as a blocking CI/release gate.
- The `.opencode/skills/validate-game-change/SKILL.md` skill spells out which smokes to run for which change.

### CI (GitHub Actions)

`.github/workflows/ci.yml` runs on every push and PR, split into independent layers so one failure cannot hide the others: a `setup` job generates the smoke matrix from `node tools/run_all.js --list --json` (so a newly added smoke is never silently left out), `fast` runs the read-only gates + the hub smoke, `smoke` runs one leg per smoke with `fail-fast: false`, each leg through `node tools/run_all.js <smoke>` so it inherits the same boot-crash retry the local runners use (a smoke that exits non-zero with **zero** checks is a cold browser, not a failed assertion; a run with at least one `FAIL` is never retried), `release` runs blocking offline E2E and accessibility checks, and `extended` runs the complete Playwright device matrix manually or weekly. A manual workflow dispatch runs both release and extended coverage. See `CONTRIBUTING.md` → CI.

Pushes and PRs use `tools/ci_affected_matrix.js` with `run_all.js --affected <base>` to limit smoke jobs to changed-file coverage; the fast gate always runs. Docs-only changes create no smoke legs and skip release checks, while manual and weekly runs retain the full battery.

Nothing inside this folder is required for the final application to run.

---

## game/

This folder contains **only the playable application**.

Everything inside this folder should be necessary to run Petrin svet.

Example (current structure):

```
game/

index.html

pages/
  animals.html
  shapes.html
  matching_game.html
  animal_puzzle.html
  animal_counting.html
  animal_memory.html
  coloring.html
  classroom.html
  tracing.html
  piano.html
  papper_kitty.html
  driving.html
  ocean.html
  dino.html
  space.html
  racing.html

games/
shared/
assets/
```

- `index.html` is the hub. It loads every game module and embeds Kitty.
- The standalone pages (`pages/animals.html`, `pages/shapes.html`, `pages/matching_game.html`, `pages/animal_puzzle.html`, `pages/animal_counting.html`, `pages/animal_memory.html`, `pages/coloring.html`, `pages/classroom.html`, `pages/tracing.html`, `pages/piano.html`, `pages/driving.html`, `pages/ocean.html`, `pages/dino.html`, `pages/space.html`, `pages/racing3d.html`, `pages/explorer.html`) each load only the modules they need.

```
games/

animals.js
shapes.js
candy.js
kitty-standalone.js
kitty-standalone.js
animal_puzzle.js
animal_counting.js
animal_memory.js
coloring.js
classroom.js
kids_games.js
tracing.js
piano.js
adventure.js
adventure-music.js
adventure-modes.js
driving.js
ocean.js
dino.js
space.js
racing-config.js
racing3d-config.js
racing3d.mjs
```

```
shared/

navigation.js
audio.js
speech.js
utils.js
main.js
celebration.js
accessibility.css
adventure.css
```

```
assets/

fonts/
sounds/
images/
```

Never store:

- Documentation
- Temporary files
- Backups
- Experiments
- Unused assets

The game folder should always represent the deployable version of the application.

---

# Development Workflow

Always follow this workflow.

1. Store working files inside `resources/`. Test harnesses go in `tools/` (see `tools/README.md`).
2. Develop and test features (headless runs go through `tools/headless.js` — unique Chrome profile per run).
3. Copy or generate only required runtime files into `game/`.
4. Ensure `game/` is always fully playable without relying on `resources/` or `tools/`.

The contents of the `game/` folder should always be enough to launch and play the application independently.

---

# Architecture

The project is modular.

Structure:

```
game/

index.html

pages/

  animals.html
  shapes.html
  matching_game.html
  animal_puzzle.html
  animal_counting.html
  animal_memory.html
  coloring.html
  classroom.html
  tracing.html
  piano.html
  papper_kitty.html
  driving.html
  ocean.html
  dino.html
  space.html
  racing.html

games/

animals.js
shapes.js
candy.js
kitty-standalone.js
kitty-standalone.js
animal_puzzle.js
animal_counting.js
animal_memory.js
coloring.js
classroom.js
kids_games.js
tracing.js
piano.js
adventure.js
adventure-music.js
adventure-modes.js
driving.js
ocean.js
dino.js
space.js
racing-config.js
racing3d-config.js
racing3d.mjs

shared/

audio.js
speech.js
navigation.js
utils.js
main.js
celebration.js
accessibility.css
adventure.css

assets/

fonts/
sounds/
images/
```

Each mini-game is self-contained and uses shared systems where possible.

---

# Future Mini Games

Planned additions include (note: Alphabet, Numbers, and Colors are now covered as Учионица activities; Phase 4 builds from this list; ✅ = already shipped):

- 🎵 Piano — ✅ (Клавир, task 58; 3 songs: Трепери, Срећан ти рођендан, Џингл белс — task 59; task 121: "Прати светло" soft-light song mode, no-punish wrong key, free play made visually primary)
- 🥁 Musical Instruments
- 🎈 Balloon Pop
- 🚜 Farm
- 🚗 Vehicles — ✅ (Возила, task 60)
- 🍎 Fruit Matching
- 🦕 Dinosaurs — ✅ (Дино, task 62)
- 📚 Story Time
- ✏ Letter Tracing — ✅ (Писање / Tracing, task 53)
- ✏ Number Tracing — ✅ (Писање / Tracing, task 53)
- 🎂 Birthday Cake Builder
- 🐠 Ocean Discovery — ✅ (Океан, task 61)
- 🚀 Space Explorer — ✅ (Свемир, task 63)

---

# User Experience Guidelines

Everything should feel alive.

Buttons bounce.

Cards wiggle.

Rewards sparkle.

Objects squish.

Animations should be playful but calm.

Avoid:

- Flashing effects
- Loud sounds
- Time pressure
- Punishing gameplay

---

# Accessibility

Always design for young children.

Requirements:

- Large buttons
- Large text
- High contrast
- Friendly colors
- Forgiving touch areas
- No precision required

---

# Performance Goals

Target inexpensive Android tablets.

Goals:

- 60 FPS
- Low memory usage
- Minimal garbage collection
- Efficient rendering
- Minimal unnecessary DOM updates

---

# Coding Guidelines

Use:

- Vanilla HTML
- Vanilla CSS
- Vanilla JavaScript

Avoid unnecessary libraries.

Prefer:

- Small functions
- Modular code
- Readable code
- Maintainable architecture

Never optimize at the expense of readability unless necessary.

---

# AI Development Rules

When working on this project:

1. Never break existing games.
2. Keep the UI consistent.
3. Reuse shared systems whenever possible.
4. Keep everything toddler-friendly.
5. Maintain offline compatibility.
6. Prioritize fun over complexity.
7. Every interaction should provide immediate visual and/or audio feedback.
8. Never introduce ads, analytics, tracking, or monetization.
9. Keep the `game/` folder clean and deployable.
10. Use the `resources/` folder for development assets only; test tooling goes in `tools/` (never deployed).
11. Modularize new code whenever practical.
12. Preserve backwards compatibility with existing mini-games.
13. All text shown to the child in the games must be in Serbian, written in Serbian Cyrillic; all speech (speech synthesis) must be in Serbian. Applies to all games and any refactors.

---

# Development Roadmap

## Phase 1 — DONE

- Integrate Paper Kitty
- Share navigation
- Share audio
- Replace placeholder with Kitty Adventure
- Pause/resume correctly

---

## Phase 2 — DONE

Refactor into modules.

Created:

- audio.js
- navigation.js
- speech.js
- utils.js
- animals.js
- shapes.js
- candy.js
- kitty-standalone.js
- animal_puzzle.js
- animal_counting.js
- animal_memory.js

---

## Phase 3 — DONE (Учионица kids tier completed 2026-08-04)

Full-fledged games for the classroom content, delivered **inside Учионица** as a second menu set ("За децу") beside the existing baby-tier learn-and-repeat activities ("За малишане"). Two buttons per content area — e.g. "Бројеви" for babies and "Бројеви" for kids:

- **Азбука за децу** — hear a letter sound or word, pick the matching letter.
- **Бројеви за децу** — count animal emojis (or hear a number), pick the matching number.
- **Боје за децу** — hear a color name, pick the matching color.
- **Облици за децу** — hear a shape name, pick the matching shape.

Style: forgiving multiple-choice quiz (4 big answer tiles), pop on correct, gentle "try again" on wrong (no punishment/time pressure), celebration + progress, short sessions. Reuses existing speech MP3s, celebrate(), and Учионица styling. One shared quiz engine configurable per content area (YAGNI), plus a headless smoke test.

Done in Phase 3 before the deferral (kept as-is, separate standalone games):

- Memory (Animal Memory)
- Puzzles (Animal Scene Puzzle)
- Counting (Animal Counting)
- Coloring (tap-to-fill SVG scenes)

---

## Phase 4 — DONE (new game set completed 2026-08-05)

Build the next batch of mini-games, one per task, picked from the [Future Mini Games](#future-mini-games) list:

- 🎵 Piano — ✅ built (2026-08-04, as **Клавир**, task 58: 8-key one-octave keyboard, free play + "Свирај песму" follow-the-melody mode; **3 songs** since task 59: Трепери, Срећан ти рођендан, Џингл белс — chip picker in song mode) **Task 121 (GAME-PIANO-001, 2026-09-27):** song mode is now "Прати светло" — the expected key softly lights (resting glow + slow pulse in the key colour), a correct press gets a brief green highlight and advances the counter, and a wrong press no longer punishes at all (no buzz, no shake, no red text): the light just pulses again where the child should press, with the neutral hint "Светли ти овде 🎵". Free play ("Свирај слободно") is now visibly the primary choice. Song data moved to the roadmap shape `{ id, title, notes:['C4',...], tempo, speech }` so Serbian children's songs can be added as one array. `piano_smoke.js` 15 → 22 checks.
- 🥁 Musical Instruments
- 🎈 Balloon Pop
- 🚜 Farm
- 🚗 Vehicles — ✅ built (2026-08-04, as **Возила**, task 60: new shared adventure engine in `game/games/adventure.js` (drive mode) + 10 road worlds — Градски трг ⭐, Поље сунцокрета 🍭, Јесења шума 🍂, Зимски пут ⛄, Планински пут 🎿, Ноћни град 🌙, Пустињска магистрала 🌵, Тропско острво 🌴, Морска обала 🐚, Космичка стаза 🪐; 13 coins + 7–8 obstacles per world, no fail states, per-world synthesized music + ambient; hub button + page + standalone wiring; canonical check `node tools/driving_smoke.js` → 17/17 PASS)
- 🍎 Fruit Matching
- 🦕 Dinosaurs — ✅ built (2026-08-05, as **Дино**, task 62: ground-mode platformer on the shared adventure engine from task 60 — jump/gravity/platforms; 10 prehistoric worlds — Прашума, Тропска долина, Језеро, Вулкан, Пећина, Мочвара, Ледено доба, Пустиња, Ноћни свет, Острво диносауруса; hero 🦕, floating + moving platforms, auto step-up stairs, pipes that pop out a mini-raptor every 3s, 15 coins + ЦИЉ temple gate per world, per-world synthesized music + ambient; hub button + page + standalone wiring; canonical check `node tools/dino_smoke.js` → 25/25 PASS)
- 📚 Story Time
- ✏ Letter Tracing — ✅ built (2026-08-03, as part of **Писање (Tracing)**, task 53: all 30 Serbian Cyrillic letters + numbers 0–10 + 4 flat shapes in one hub; redesigned to FREE DRAW on a dashed guide — the child draws over a faint dashed outline, matched by ink-proximity metrics with a forgiving "nearness" threshold)
- ✏ Number Tracing — ✅ built (same game, see above)
- 🎂 Birthday Cake Builder
- 🐠 Ocean Discovery — ✅ built (2026-08-05, as **Океан**, task 61: fly-mode swimming on the shared adventure engine from task 60 — free 2D movement, no gravity; 10 underwater worlds — Корални гребен, Лагуна, Морске траве, Каменита обала, Потопљени брод, Морска пећина, Ледени океан, Морски ров, Пиратско благо, Ноћни океан; hero 🐟, patrolling sharks + jellyfish/rocks/mines/seaweed/pufferfish/crabs/anchors, 13 coins + goal banner per world, per-world synthesized music + ambient; hub button + page + standalone wiring; canonical check `node tools/ocean_smoke.js` → 18/18 PASS)
- 🚀 Space Explorer — ✅ built (2026-08-05, as **Свемир**, task 63: fly-mode rocket on the shared adventure engine from task 60 — free 2D movement, no gravity; 10 space worlds — Звездано небо, Месечева стаза, Црвена планета, Астероидни појас, Сатурнови прстенови, Јупитеров вихор, Ледени месец, Свемирска станица, Галаксија, Дубоки свемир; hero 🚀, meteors/asteroids/UFOs (patrol)/comets/ring bands/planets/satellites/black holes, 13 coins + ЦИЉ portal per world, per-world synthesized music + ambient; hub button + page + standalone wiring; canonical check `node tools/space_smoke.js` → 18/18 PASS — **Phase 4 adventure series complete**)

Built so far from this list: **Писање (Tracing)** (task 53), **Возила (Driving)** (task 60), **Океан (Ocean)** (task 61), **Дино (Dino)** (task 62), **Свемир (Space)** (task 63). No commitment yet for the rest — the user picks which games to build; each chosen game gets its own task.

---

## Phase 5 — New Game: Мала тркачица (Little Racer) (2026-09-08)

**Focus (user decision 2026-09-08):** Build a pseudo-3D racing game (OutRun-style) in 5 stages. The previous Phase 5 polish backlog for the 8 ИГРЕ games is moved to Phase 6. УЧЕЊЕ learning apps remain out of scope.

**Game Concept:** Cute, child-friendly racing game with simulated 3D perspective (road moves toward horizon, car fixed at bottom-center). Left/Right controls only. Auto-forward motion. Theme-based worlds with unique pickups. Character picker (Kitty/Girl drivers + multiple cars). Obstacles added in later stages (puddles, rocks, barricades — slowdown only, no fail state).

**Stages (each a separate task, user approval per stage):**

- **Task 95 — Stage 1: Foundation & Core Loop** — Playable vertical slice: straight road, car movement, one world (Meadow), pickups, finish line, celebration, character/world picker modals, hub integration.
- **Task 96 — Stage 2: Multi-World & Visual Polish** — 6-8 themed worlds (Meadow, Beach, Snow, Candy, Jungle, Space, Night, Farm), distinct pickups/side decorations, procedural curved/hilly tracks, per-world music (reusing adventure engine music system). **IN PROGRESS (2026-09-08).** User play-test feedback folded into Stage 2 scope: wider/more interesting road, cool curves, more interesting world, pickups growing as they approach the car.
- **Task 97 — Stage 3: Obstacles & Difficulty** — Slippery puddles, breaking rocks, barricades that briefly slow the car. Forgiving, no fail state. Visual/audio feedback. **DONE (2026-09-09**, `racing_smoke.js` 23/23 PASS).
- **Task 98 — Stage 4: Full Driver/Car Roster & Progression** — Kitty + Girl drivers (reuse explorer sprites), 3-4 cars each with subtle cosmetic stats, localStorage persistence, restart/change flow. **DONE (2026-09-09**, `racing_smoke.js` 31/31 PASS; progression = unlock thresholds `[0,2,4,7]` finished races).
- **Task 99 — Stage 5: Polish & Accessibility** — Countdown 3-2-1-Крени! with speech+tones, engine hum (speed-pitched), pickup sparkle particles, union of all Stages 1–4 done. **DONE (2026-09-09**, `racing_smoke.js` 32/32 PASS; ARIA live announcer, reduced-motion safe shake, tablet thumb-zone controls, landscape hint. Commit local, push pending).

**Reuse Strategy:** Maximum reuse of existing systems — `shared/navigation.js`, `shared/audio.js`, `shared/speech.js`, `shared/utils.js`, `shared/celebration.js`, `shared/accessibility.css`, Fredoka fonts, Kitty Explorer driver sprites, adventure engine music system, `tools/headless.js` harness pattern. Zero edits to existing game files.

**Validation:** New `tools/racing_smoke.js` per stage; full regression suite after each stage.

---

## Phase 6 — Game Polish (moved from Phase 5)

# Long-Term Vision

Petrin svet should become a polished collection of educational mini-games that children can safely explore for hours.

Every game should plug into the main application, reuse shared systems, and maintain a consistent design language.

The finished application should feel like a premium offline children's learning app rather than a collection of separate HTML pages.

---

# README Maintenance

This README is the **single source of truth** for the project.

Any developer or AI assistant working on Petrin svet should read this document before making changes.

Whenever significant architectural decisions are made, this document should be updated to reflect them.

All future development should align with the goals, architecture, folder structure, and philosophy defined here.

## Driving task 60 final polish (2026-08-04)

The Возила car uses the updated transparent PNG asset with a red tint, forgiving car/obstacle hitboxes, and a higher upper-road movement limit. Task 60 is complete; task 61 (Океан) is next and remains pending until the user starts it.

## Ocean task 61 (2026-08-05)

Океан shipped — the second Phase 4 adventure game on the shared engine (`game/games/adventure.js`). Added 3 engine hooks for game-specific visuals: `cfg.drawObstacle`, `cfg.drawDecor`, `cfg.heroFontSize`. Three new files: `game/games/ocean.js` (10 underwater worlds, fly mode, patrolling sharks, 10 music + ambient themes), `game/pages/ocean.html` (4-way fly D-pad), `tools/ocean_smoke.js` (18/18 PASS). Wired into the hub. Task 62 (🦕 Дино, ground mode) is next and remains pending until the user gives feedback.

## Dino task 62 (2026-08-05)

Дино shipped — the third Phase 4 adventure game on the shared engine. Ground mode (jump/gravity/platforms). New files: `game/games/dino.js` (10 prehistoric worlds, mini-raptor enemies popping out of pipes, 10 music + ambient themes), `game/pages/dino.html` (◀▶ D-pad + big ⬆ jump button, new `.adv-ground-controls` CSS), `tools/dino_smoke.js` (25/25 PASS). Wired into the hub. Fixed a latent engine bug while shipping: ground-mode `loadWorld` called `w.floats.map`/`w.moves.map`/`w.pipes.map` unguarded (worlds missing those keys threw and left `goal` null) — dino is the first ground-mode game on this engine; all three now default to `[]`. Also added `get mice()` to the `window.__adv` debug handle for the enemy smoke checks. Task 63 (🚀 Свемир, fly mode) shipped next.

## Space task 63 (2026-08-05)

Свемир shipped — the fourth and **final Phase 4 adventure game** on the shared engine. Fly mode (free 2D, no gravity). New files: `game/games/space.js` (10 space worlds, meteors/asteroids/patrolling UFOs/comets/ring bands/planets/satellites/black holes, 10 music + ambient themes, `drawSpaceGoal` portal arch), `game/pages/space.html` (reuses the existing `.adv-fly-controls` — ◀▶ left pad, ▲▼ right pad, no new CSS), `tools/space_smoke.js` (18/18 PASS). Wired into the hub. No new engine work — reused the hooks from tasks 60–62 (`drawObstacle`, `drawDecor`, `drawGoal`, `heroBob`, `obstacleScale`, `speed`; no `heroFlip` — 🚀 faces right natively, unlike 🐟/🦕). All four adventure smokes re-run — all PASS. **Phase 4 is complete.** Task-62 + task-63 work is still uncommitted (user commit/push pending).

## Project Activities

A companion file, `PROJECT_TASKS.md`, contains a minimal, machine-friendly list of current tasks and their statuses (NEW / IN PROGRESS / DONE). Contributors and AI assistants must check `PROJECT_TASKS.md` before starting work and update task statuses and brief notes when beginning or completing work. The AI assistant should read this file first and continue the highest-priority task not marked DONE.

### AI startup helper

A helper script is provided to automate the startup check: `tools\ai_startup.ps1` (Windows PowerShell). It reads `PROJECT_TASKS.md`, shows the next pending task, and asks whether to continue with that task or do something else. From the project root the helper can be launched with `start_ai.bat` or by running the PowerShell script directly.

AI assistants and human contributors are encouraged to run this script at the start of a work session so the project context and task state are always consulted before making changes.
