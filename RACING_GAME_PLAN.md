# Racing Game Plan — "Мала тркачица" (Little Racer)

## Overview
A pseudo-3D racing game (OutRun-style) with cute aesthetic matching Kitty Explorer. Built in stages, reusing existing systems, zero regression on current games.

---

## Core Concept
- **Perspective**: Simulated 3D — road scales toward horizon, car fixed at bottom-center, only horizontal (left/right) input
- **Controls**: Left/Right buttons only (or tilt). Car auto-accelerates forward; run ends at finish line
- **Aesthetic**: Cute, pastel, child-friendly — same design language as Kitty Explorer (Fredoka font, cream/plum/pastel palette)
- **Themes**: Multiple worlds like Kitty (e.g., Meadow, Beach, Snow, Space, Candy, Jungle)
- **Pickups**: Theme-specific collectibles along the road (stars, flowers, shells, snowflakes, candy, gems)
- **Obstacles (later)**: Slippery puddles, breaking rocks, barricades — slow the car briefly
- **Drivers**: Kitty (explorer kitty) + Girl (explorer girl) — reusable from Kitty Explorer assets
- **Cars**: 3-4 cute vehicles per driver (e.g., kitty: cardboard box car, yarn-ball kart, fish-mobile; girl: bike, scooter, roller skates)

---

## Technical Approach

### Reuse Strategy
| System | Reuse | Notes |
|--------|-------|-------|
| `shared/navigation.js` | ✅ Full | Hub integration, back button |
| `shared/audio.js` | ✅ Full | `ctx()`, `tone()`, `popSound()`, `successChime()`, `playAnimalSound()` |
| `shared/speech.js` | ✅ Full | Serbian TTS for UI, countdown, finish |
| `shared/utils.js` | ✅ Full | `shuffle`, `clamp`, `lerp`, collision helpers |
| `shared/celebration.js` | ✅ Full | Finish celebration |
| `shared/accessibility.css` | ✅ Full | Large touch targets, focus styles |
| `game/assets/fonts/` | ✅ Full | Fredoka woff2 already bundled |
| `game/assets/images/explorer_kitty/` | ✅ Full | Driver sprites (kitty + girl) |
| `tools/headless.js` | ✅ Full | Smoke test harness |
| `kitty-standalone.js` pattern | ✅ Adapt | Character picker, world selector, game loop structure |

### New Files (minimal, additive)
```
game/pages/racing.html          # Standalone page
game/games/racing.js            # Core game logic
game/games/racing-config.js     # World/track/pickup/obstacle data
game/assets/images/racing/      # Road segments, pickup sprites, car sprites
tools/racing_smoke.js           # Validation
```

### No Changes To
- Any existing `game/games/*.js`
- Any existing `game/pages/*.html`
- `game/index.html` (only additive: new hub button + route)
- `shared/*.js` (only additive exports if needed)

---

## Stage Plan

### Stage 1 — Foundation & Core Loop (Task 95)
**Goal**: Playable vertical slice — straight road, car movement, one world, finish line
- `racing.html` page + `racing.js` module
- Canvas renderer with pseudo-3D road (segment-based, like OutRun)
- Car sprite (single), fixed horizontal position, left/right input
- Auto-forward motion with configurable speed curve
- One world config (Meadow): road color, grass color, sky gradient
- Pickup system: spawn collectibles on road segments, collision = score + pop sound
- Finish line → celebration + "Браво!" + score summary + "Играј поново"
- Character picker modal at start (reuses Kitty pattern): Driver (Kitty/Girl) + Car (1 per driver for now)
- World picker (reuses Kitty pattern): single world for now
- Hub integration: button in ИГРЕ sub-hub, `data-go="game-racing"`, navigation route, standalone boot
- Smoke test: `tools/racing_smoke.js` (boot, road renders, left/right works, pickup registers, finish triggers celebrate)

### Stage 2 — Multi-World & Visual Polish (Task 96)
**Goal**: 6-8 themed worlds with distinct look & pickups
- World configs in `racing-config.js`: name, sky gradient, road/grass colors, side decorations (trees, rocks, signs), pickup sprite + type, music theme
- Worlds: Meadow 🌸, Beach 🏖️, Snow ❄️, Candy 🍭, Jungle 🌴, Space 🌌, Night 🌙, Farm 🚜
- Per-world pickup sprites (SVG or small PNG): flower, shell, snowflake, candy, gem, star, moon, carrot
- Procedural track generation: curves, hills, straightaways — seeded per run for reproducibility
- Side decoration rendering (billboard sprites scaling with perspective)
- Music: reuse adventure engine music system (32-step melody + 16-beat bass + ambient per world)
- HUD: world name, pickup count, progress bar (distance to finish)
- Smoke test: all worlds load, pickups render, music plays, curves/hills work

### Stage 3 — Obstacles & Difficulty (Task 97)
**Goal**: Obstacles that slow the car — forgiving, no fail state
- Obstacle types (config-driven):
  - Slippery puddle (blue splash) — reduces speed 50% for 1.5s
  - Breaking rock (cracks on hit) — stops car briefly (0.5s), then crumbles
  - Barricade (wooden fence) — knocks car back + brief slow
- Visual feedback: screen shake (subtle), particle puff, sound (gentle thud)
- Obstacles spawn on road segments, avoid pickup positions
- Difficulty scaling: more obstacles in later worlds, or per-world density config
- All obstacles = slowdown only, never stop the run
- Smoke test: each obstacle type triggers slowdown + recovers, no crashes

### Stage 4 — Full Driver/Car Roster & Progression (Task 98)
**Goal**: Complete character picker + car selection + simple progression
- Drivers: Kitty (explorer kitty sprites) + Girl (explorer girl sprites)
- Cars per driver (3-4 each):
  - Kitty: Cardboard Box 📦, Yarn Kart 🧶, Fish Mobile 🐟, Rocket Box 🚀
  - Girl: Bicycle 🚲, Scooter 🛴, Roller Skates 🛼, Hoverboard 🛹
- Car stats (subtle, cosmetic-only for kids): max speed, handling, acceleration — all balanced
- Character picker shows driver + car combos (grid), preview animation
- Persistence: `localStorage` remembers last driver+car+world
- "Играј поново" restarts same config; "Промени" reopens picker
- Smoke test: all combos load, persist, restart works

### Stage 5 — Polish & Accessibility (Task 99)
**Goal**: Production-ready feel
- Countdown sequence (3-2-1-GO!) with speech + tone
- Engine hum sound (Web Audio, pitch tied to speed)
- Road lines animation (dashed lines scrolling)
- Particle bursts on pickup (sparkles matching theme)
- Screen-reader friendly: ARIA labels, live region for score/progress
- Reduced-motion safe (no forced motion; CSS respects `prefers-reduced-motion`)
- Tablet-first: large touch zones for left/right (full left/right screen halves)
- Landscape lock hint
- Final smoke suite + visual review (MiMo V2.5 Free)

---

## Integration Checklist (per stage)

| Item | Stage 1 | Stage 2 | Stage 3 | Stage 4 | Stage 5 |
|------|---------|---------|---------|---------|---------|
| Hub button added | ✅ | | | | |
| Navigation route | ✅ | | | | |
| Standalone boot in `main.js` | ✅ | | | | |
| `manifest.json` cache list updated | | | | | ✅ |
| `tools/build_offline.ps1` regenerates | | | | | ✅ |
| `tools/sync-docs.sh` mirrors | ✅ each stage | | | | |
| All existing smokes still pass | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## File Structure Impact (additive only)

```
game/
  pages/
    racing.html           ← NEW
  games/
    racing.js             ← NEW
    racing-config.js      ← NEW
  assets/
    images/
      racing/
        cars/             ← NEW (car sprites per driver)
        pickups/          ← NEW (pickup sprites per world)
        obstacles/        ← NEW (obstacle sprites)
        decorations/      ← NEW (side decoration sprites)
tools/
  racing_smoke.js         ← NEW
```

---

## Validation Commands (per stage)

```bash
# Syntax
node --check game/games/racing.js game/games/racing-config.js

# Smoke test
node tools/racing_smoke.js

# Full regression (run after each stage)
node tools/hub_smoke.js
node tools/kitty_smoke.js
node tools/driving_smoke.js
node tools/ocean_smoke.js
node tools/dino_smoke.js
node tools/space_smoke.js
node tools/candy_smoke.js
node tools/puzzle_smoke.js
node tools/memory_smoke.js
```

---

## Serbian Cyrillic Text (all child-facing)

| English | Serbian Cyrillic |
|---------|------------------|
| Little Racer | Мала тркачица |
| Choose Driver | Изабери возача |
| Choose Car | Изабери кола |
| Choose World | Изабери свет |
| Ready? | Спреман? |
| Go! | Крени! |
| Finish | ЦИЉ |
| Score | Поени |
| Play Again | Играј поново |
| Change | Промени |
| Meadow | Ливада |
| Beach | Плажа |
| Snow | Снег |
| Candy | Слаткиш |
| Jungle | Џунгла |
| Space | Свемир |
| Night | Ноћ |
| Farm | Фарма |

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Pseudo-3D math errors on resize | Reuse Kitty's `resizeCanvas` pattern; test `tools/racing_smoke.js` resize check |
| Asset loading race (sprites) | Preload all images in picker; `Promise.all` before `startRace()` |
| Performance on low-end tablets | Limit segments to ~200; reuse offscreen canvases; no per-frame allocations |
| Breaking existing games | Zero edits to existing files; only additive hub wiring |
| Scope creep | Strict stage gates — no Stage 2 work until Stage 1 smoke passes + user approval |

---

## Approval Gate
**Before any implementation:** User confirms this plan. Then Stage 1 begins with Task 95.