# README development roadmap, Phases 1-6 (all done; verbatim)

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
