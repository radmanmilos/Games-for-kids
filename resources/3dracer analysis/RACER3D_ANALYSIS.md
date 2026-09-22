# Мала тркачица 3Д (Little Racer 3D) — Deep Technical & Design Analysis

> **Purpose of this file:** a single, self-contained briefing on the 3D racing game in this repo,
> intended to be handed to another LLM coding assistant (Claude Code, ChatGPT, etc.) for analysis and
> for recommendations on the next steps toward a *great toddler-friendly 3D racer*. The user deletes this
> file when they are done with it. All child-facing text in the actual game is Serbian Cyrillic; this
> document itself is written in English for the receiving AI.
>
> Repo root this file lives in: `E:\GitHub\Games for kids`. Git repo, GitHub Pages published
> (`main` → `/docs`).

---

## 1. Executive overview

`Mала тркачица 3Д` ("Little Racer 3D") is a full 3D kart racer built with **three.js (r169, vendored,
offline-capable)** as a brand-new ES-module game inside a child-education website ("Petrin svet" — a suite
of 16 toddler games in Serbian). It is the **flagship racing game** — the older pseudo-3D canvas racer
("Мала тркачица", 2D) still exists but its hub button is hidden.

Target audience: **toddlers / early preschoolers (~2–4 years)**, played on a tablet with fingers. Games
are validated by automated headless-Chrome smoke tests and must run 100% offline (single-download PWA).

The game has gone through: a prototype → a vertical slice → a full 8-world game → a look-and-feel pass →
5 structured play-test tuning rounds → 1 polish round (world ambience pack). It is considered
functional and fun for its age group; the open question is what *quality* bar to chase next.

---

## 2. Project constraint sheet (non-negotiable — read before recommending anything)

- **Language:** every string shown or spoken to the child is **Serbian, Serbian Cyrillic**. No exceptions.
  Speech synthesis uses a shared `window.speech` helper (Serbian).
- **Offline first:** the game must work with zero network after the site is downloaded. All three.js code is
  vendored (`game/assets/lib/three.module.min.js`, r169). No CDN, no remote fonts, no API calls.
- **Deployment:** GitHub Pages serves `main` → `/docs`. `docs/` is a mechanical mirror of `game/`
  (never edited by hand). A service worker + ZIP fallback provide offline install on Android.
- **Zero new dependencies** unless explicitly approved. Everything is hand-rolled WebGL/WebAudio.
- **Reduced motion is a real constraint:** the user's device reports `prefers-reduced-motion: reduce`,
  so the browsing-device screen-shake and some extremes are suppressed by the `REDUCED_MOTION` gate
  (`racing3d.mjs:3`). This is the ONLY user-facing behavior the accessibility gate still changes.
- **No fail states, no losing, no timeout, no scoreboard pressure for the child.** Speed slowdowns on
  obstacles, gentle celebrations on success.
- **iOS/Safari + Android.** Landscape lock encouraged (HUD designed for landscape).
- **Pace/approach:** small verifiable batches (YAGNI — no gold-plating), validate with headless smoke tests
  after each change, user commits and pushes manually.

---

## 3. Repo map (racing3d-relevant files)

| Path | Role |
|---|---|
| `game/pages/racing3d.html` | Page shell, HUD markup, start-picker + win modal, CSS |
| `game/games/racing3d.mjs` | **The game engine** (ES module, ~1650 lines, self-contained) |
| `game/games/racing3d-config.js` | 3D-only world extras (`R3D_EXTRAS`), obstacle defs, `KART_COLORS` |
| `game/games/racing-config.js` | **Shared 2D/3D config**: the 8 `RACING_CONFIG.worlds` + `RACING_MUSIC` themes (single source of truth) |
| `game/assets/lib/three.module.min.js` | Vendored three.js r169 |
| `game/shared/audio.js`, `game/shared/speech.js` | Global `window.ctx/tone/sweep/successChime/gentleMiss/speech` helpers used by the engine |
| `game/index.html`, `game/shared/navigation.js`, `game/shared/main.js` | Hub entry, routing, standalone boot wiring (`window.startRacing3D`) |
| `tools/racing3d_smoke.js` | Canonical headless validation (17 checks) |
| `tools/hub_smoke.js` | Hub-wide link/nav validation |
| `tools/headless.js` | Shared headless-Chrome + CDP harness |
| `tools/sync-docs.sh`, `tools/build_offline.ps1` | Flow: `tools/sync-docs.sh` mirrors `game/` → `docs/`; `build_offline.ps1` regenerates SW cache list + `docs/game-offline.zip` |

Engine constraint: the game module must never `import` or read anything outside `game/` at runtime
(`resources/` and `tools/` are dev-only).

---

## 4. Architecture & data flow

### 4.1 Single source of truth for the 8 worlds
`racing-config.js` defines 8 worlds (meadow/beach/snow/candy/jungle/space/night/farm — Ливада, Плажа,
Снег, Слаткиш, Џунгла, Свемир, Ноћ, Фарма) with palettes, curve seeds, per-world decor emoji lists,
obstacle types, `obstacleDensity`, `goal` distance, and a `music` theme key. The 2D racer reads the same
object. `racing3d-config.js` holds **only 3D-only knobs** keyed by world: laps, `flowersPerLap`,
track `hill` factor (0.55–1.25 × base hill formula), pickup style + color, kart/boost/wheel/hub/tree/light
colors, and the new sky/weather flags (`sky: 'clouds' | 'stars'`, `moon`, `weather: 'snow' | 'stars'`).

At boot `racing3d.mjs` merges both into one `world` object (`racing3d.mjs:80–111`) with a `col()` helper
that accepts either `'#RRGGBB'` strings (shared config) or raw hex numbers (extras).

### 4.2 Boot flow
- Page loads `racing-config.js` → `racing3d-config.js` → ES module `racing3d.mjs` (plus vendored three.js).
- On DOM ready the page calls `window.startRacing3D()` (guarded by `booted`).
- `loadSave()` reads `racing3dSave = {wins, world, kart}` from localStorage (clamped to valid ranges).
- Boot state is `mode='menu'` → the **start picker** modal shows 8 world cards + 4 kart colors; the race
  only starts on «Крени!» (user gesture, also unlocks WebAudio).
- After that: countdown 3-2-1-Крени! with Serbian speech → `mode='drive'` → win flow on lap finish.

### 4.3 Interfaces for automation
The engine exposes `window.__r3d = {...}` (test-only introspection: mode/speed/lateral/progress/lap/score,
`confirmStart()`, `tris()`, `particles()`, boost pads, wheel poses, steer state, hill range, map marker,
world/kart indices). This is what the headless smoke tests drive.

---

## 5. Engine details (technical)

### 5.1 Per-frame model
- `requestAnimationFrame` loop with `THREE.Clock`, dt clamped to 0.05 s.
- Track = `THREE.CatmullRomCurve3` closed loop from 16 control points whose Y is shaped by a procedural
  hill formula: `(sin(ang·2)·4.6 + sin(ang·4)·2.1) · world.hill + jitter·2.6` (`racing3d.mjs:260`).
  Seeded per world by `curveSeed` (mulberry32 PRNG for all world placement).
- Kart progress is parametric along the curve (`progress ∈ [0,1)`, `lap` counter, per-lap pickup counter).
- Lateral movement is **driven by front-wheel steering angle**, not by a lateral velocity kept from before:
  `lateral += steerDrive · LATERAL_GAIN · dt` — `steerDrive` rises while a steer button is held and decays
  fast on release so the kart **stops drifting immediately and stays where it was placed** (no auto-centering).
  Visible front wheels self-center slowly after release (purely cosmetic, slower unwind).
- Speed model: pneumatic ~`ACCEL=16` toward `MAX_SPEED=35` (deliberately toddler slow). Boost ⚡ multiplies
  to 42 for 1.2 s, offroad drops below, obstacle hits apply a burst slowdown (`slowMult`/`slowTime` per type).
  Auto-forward; the child only steers left/right.

### 5.2 Rendering & art systems
- Gradient sky dome (BackSide sphere, per-world vertical gradient), depth fog 90→420.
- **Terrain:** a hilly ribbon that exactly follows the track surface (edge droop `(dist−ROAD_HALF)·0.1`,
  half-width 58) so the road never sinks below the grass, plus a far low plane at y=−16. `minRoadClear` ≈ 0.05.
- **Road:** dark asphalt ribbon, dashed center line (two lanes), solid white edge lines, flat vertex-colored
  red/white rumble strips at ±9.0, checkered start/finish line.
- **Scenery:** 46 seed-spawned trees (trunk + cone crown, per-world colors), 12 rocks + 16 bushes,
  flower patches (single InstancedMesh, 130 instances / 1 draw call), 24 pennant flags, start-gate arch with
  checkered banner. **New in polish round 1:** 16 camera-facing emoji `THREE.Sprite` billboards per world
  from the world's decor list (tractors on Фарма, stars/owls at Ноћ, palms in Џунгла…).
- **Sky props (polish round 1):** 260-point starfield for Свемир/Ноћ, moon disc + crater for Ноћ, soft sun
  disc for day worlds, 7 drifting cloud sprites circling the track on bright worlds. All `fog:false`.
- **Kart:** glossy chunky cartoon kart — rounded hood/bumper, windshield, exhaust pipes, 4 chunky wheels
  (tyre + white sidewall ring + emissive hub + **4 gold tread studs per wheel** so spin is visible),
  body banks into turns, nose points into travel, camera does suspension bob + steer sway + FOV kick
  (60→80 at full speed + boost).
- **Particles** (`spawnP`/`updateParticles`, cap 420, per-particle simple material): boost flames,
  drift skid smoke, offroad dust, pickup petal burst, obstacle puff, finish confetti (110 flakes),
  and **weather emitters** (snowfall in Снег, falling gold stars in Свемир) added in polish round 1.
- **Race-track mini-map:** 2D canvas HUD drawing the loop once + a live red kart marker + gold driven arc.

### 5.3 Audio design (all synthesized, no audio files)
- **Music:** 8 per-world step-sequencer themes from shared `RACING_MUSIC` (root freq + bpm + triangle/sine
  lead + bass line + ambient), scheduled look-ahead style like the 2D racer. 🔊 HUD toggle, persisted as
  `racing3dMusic`.
- **Ambient layer (polish round 1):** `playAmbient()` ports the 2D racer's bird/waves/wind/chime/stars/owl
  synth snippets + a cached noise buffer; each theme's `ambient` fires at its own rate/vol (beach waves,
  snow wind, night/farm owl, space star chimes…).
- **SFX:** `window.tone`/`window.sweep` for pickups (rise chime), boost whoosh, obstacle thud
  (`gentleMiss`), rumble grumble on the strips, engine hum synth tied to speed. **New in polish round 1:**
  soft 330 Hz warning beep when an obstacle is 12–90 units ahead (kid-friendly heads-up, not alarming).

### 5.4 Gameplay systems
- **Steering:** two touch zones (left/right) + keyboard arrows/AD. Front-wheel-led steering (see 5.1).
- **Pickups:** `flowersPerLap` (12) per lap; HUD counter `world.collectible score/total`. Pickups have a
  gentle sparkle + float + slow spin. Collect plays a chime + petal burst, counter persists across laps.
- **Obstacles:** 💧puddle / 🪨rock / 🚧barricade; slowdown only, no fail, announce in Serbian. **New in
  polish round 1:** number now scales with the world's `obstacleDensity` (`clamp(6, round(density·1700), 16)`)
  instead of a fixed 8. Appear between lap 0.6→0.98 of the first lap.
- **Boost pads:** 6 seeded ⚡ pads on lane centers (±3.0), 1.2× burst + flames + whoosh + FOV kick.
- **Win flow:** after `laps` (3, some worlds could differ) → win modal with confetti, «Следећи свет ➡️»
  (advances world + reloads), «Играј поново 🔄», «Изабери свет 🌍»; `wins` increments only on a real
  finish-recorded finish (`finishRecorded` guard).

### 5.5 Performance & stability notes
- Draw calls are modest (one InstancedMesh for flowers; sprites are cheap). Typical frame triangle count in
  the smoke ~13–17 k. Headless `--disable-gpu` renders fine (SwiftShader).
- No `renderer.setPixelRatio` peaks above 2; map canvas dpr-capped at 2.

---

## 6. Design choices & decision log (important — do not re-litigate)

These were explicitly decided with the user and are recorded in `HANDOVER_PROMPT.md` / `PROJECT_TASKS.md`:

1. **No AI rivals.** The race is against the track, the child, and the world; winning is unconditional fun.
2. **Obstacles slow you down, never fail you.** No game over, no "try again" screen for losing.
3. **`MAX_SPEED = 35`** (was 132 → 88 → 70 → 35 after three toddler play-test rounds; boost caps at 42).
4. **Kart holds its line when released** — no auto-centering. A deliberate departure from arcade "snap-back".
5. **Front-wheel-led steering** with immediate stop on release (Play-test round 5 killed a residual
   side-drag) — the kart "settles exactly where you left it".
6. **Flashy fun beats realism**: cartoon ray-traced-look shading (glossy plastic, rim lights), visible
   wheel studs so spinning reads across the room, landmarks readable from far.
7. **Reduced-motion gate** suppresses screen shake/bounce extremes; the confetti stays (celebration
   feedback). The user's machine is always reduced-motion, so shake is effectively off for them — flagged for review.
8. **YAGNI**: no unlockable stickers, no difficulty levels, no jigsaw pieces, no screen transitions,
   no currency/loot (unlock thresholds were literally removed).
9. **8 worlds** come from the shared 2D config (no duplication); **default world = meadow** so smoke
   thresholds stay stable.
10. **The 2D canvas racer is now hidden** (button `hidden`), 3D is the flagship.

---

## 7. Current state

- **Code:** functional, polished, and stable. All main branches headless-validated across worlds.
- **Validation:** `racing3d_smoke.js` **17/17 PASS** (boot, Serbian HUD, picker 8 cards + 4 swatches,
  card-click selection, countdown→drive, front-wheel steering + no-side-drift, boost, wheel roll + studs,
  drift smoke, bank/steer-state, rumble+offroad dust, mini-map marker, hills+floor-clear, real geometry,
  page chrome); `hub_smoke.js` ALL PASS; `node --check` clean. A throwaway probe has booted + *driven*
  Снег (snowfall particles), Ноћ, and Свемир (star particles) via the real picker flow.
- **Docs:** `docs/` mirrors `game/` (201 files), offline PWA package rebuilt on every change (200-entry
  cache list + ZIP).
- **Compilation of recent work** (most recent first):
  - Polish round 1 "world ambience pack" (2026-09-22): decor billboards, sky props, per-world ambient
    sounds, weather particles, pickup float/spin, obstacle-warning beep + density scaling.
  - Full 8-world game (2026-09-22): worlds via shared config, world picker, per-world pickups + music,
    win-flow progression, 4-color kart picker, start-gate + rock obstacle.
  - Play-test rounds 1–5 (2026-09-11 → 14): speed, chase-cam gimbal fix, DoubleSide road visibility fix,
    wider road, wheel axle roll, bigger hills, terrain-under-road fix, steering feel, wheel studs,
    half speed, follow-the-wheels, no side-drift.
  - Look-and-feel pass (2026-09-14) per `RACING_VISUAL_STYLE_ANALYSIS.md` (also in `resources/`).

---

## 8. Known limitations / technical debt / headless harness gotchas

- **Headless harness quirk:** direct `Page.reload` / eval-`location.reload()` is unreliable in
  `tools/headless.js` (CDP execution-context staleness after a second navigation). The *proven* path for
  world-switching in tests is clicking the picker's cards + «Крени!» (which triggers the game's own
  `location.reload()` via the real handler). Real browsers are unaffected (restart works normally).
- **No audio content files**: everything is synthesized WebAudio, so the "soundscape" is simple/lo-fi
  compared to a real audio-middleware game.
- **No HUD feedback for the obstacle warning beep** (audio-only signal). No vibration API use.
- **Offline ZIP fallback** exists but the "stuck download" self-heal (skip-and-report) was recently
  improved in the service worker; the Android stuck-file scenario remains manually untested.
- **One ES module only**: racing3d is the only games module; any new module must be vendored/ESM-compatible.
- **No touch joystick** — two fixed steering buttons only (deliberate for toddlers; worth re-validating).

---

## 9. Where we aspire to go — a *great* toddler-friendly 3D racer

Long-term aspirations (not commitments; the other AI should evaluate priority/feasibility/cost):

1. **One-screen joy:** arrivals and small wins should feel big and instant (celebrations, the world reacts
   to the kart — decor items pop/dance, gates wave) while staying reduced-motion-safe.
2. **Second-finger-OS first:** toddler proofing — accidental multi-touch, palm-press on the screen,
   "just tap anywhere to go". Buttons must be unmissable, touch targets large, and the child should never
   get stuck in a modal they don't understand.
3. **Audio richness within synthesis:** per-world ambience was just added; further polish = music/ambient
   layering, louder/shorter celebration SFX, maybe a gentle "watch out" spoken hint instead of the beep.
4. **Visible learning with invisible difficulty:** the child always *feels* in control. Difficulty should
   come from world flavor (more curves, denser pickups), never from speed or fail pressure.
5. **Session rhythm:** quick restarts (the reload on restart is fast), short races (3 laps at 35 speed),
   and instant "go again" — no menus between lore.
6. **Consistent art language across all 8 worlds** (the shared palettes do most of this; the remaining gap
   is per-world engine-feel particles/sky variety).
7. **Feedback loop rigor:** every future change validated by the smoke during the build, tablet play-test
   afterwards, and the same "propose → approve → build small" rhythm that got it here.

### Suggested areas for the receiving AI to analyze
A. Art/look: what 2–3 cheap upgrades most raise the "wow" with the current sprite/instanced/particle set
   (e.g., emissive feedback trails, baked-style lighting tricks, bigger celebratory states)?
B. Feel: is `MAX_SPEED=35` + `ACCEL=16` + front-wheel steering optimal for ages 2–4? Any frame-timing /
   interpolation risks across 60 Hz tablets vs high-refresh phones?
C. Audio: structural recommendations that fit a zero-asset, all-synth pipeline; whether to add a spoken
   Serbian hint system.
D. Robustness: multi-touch / paused-window handling, iOS Safari specifics (WebGL context loss, audio unlock),
   and offline-service-worker edge cases.
E. Measurement: what test instrumentation (FPS meter, play-test logs) fits a toddler game without eating
   into kid-facing UX?
F. Next polish micro-batches that keep a 2–4 year old delighted without scope creep (YAGNI discipline).

---

## 10. How to verify any change (the team's contract)

1. Edit only `game/…` files.
2. `node --check` the changed JS.
3. `node tools/racing3d_smoke.js` (expect 17/17) and `node tools/hub_smoke.js` (ALL PASS).
4. Run `bash tools/sync-docs.sh`, then `pwsh -NoProfile -File tools/build_offline.ps1` to refresh `docs/`
   and the offline package.
5. Update `PROJECT_TASKS.md`, `README.md`, `HANDOVER_PROMPT.md`, `tools/README.md` with dated notes.
6. User commits + pushes manually (never auto-commit; `main` publishes the site).

---

### Crawl path for the receiving AI (fast context load)
- `game/games/racing3d.mjs` — the whole engine (start at the constants block `:7`, then world merge `:80`,
  sky props `:180`, decor billboards `:487`, pickups `:820`, audio `:1039–1220`, `__r3d` `:1615`).
- `game/games/racing3d-config.js` — 3D extras + obstacles + kart colors.
- `game/games/racing-config.js` — the 8 worlds + music themes (single source of truth).
- `tools/racing3d_smoke.js` — the 17 checks and what "good" means mechanically.
- `resources/RACING_VISUAL_STYLE_ANALYSIS.md` — the original art-direction bible the look was built to.
- `HANDOVER_PROMPT.md`, `PROJECT_TASKS.md` (task 100 / 99) — decision log and rhythm.