# Petrin svet

> **Petrin svet** is an offline collection of educational mini-games for young children (approximately 2–6 years old), designed to be fun, safe, simple, and frustration-free.

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

Drag shapes into matching outlines.

Educational goals:

- Shape recognition
- Fine motor skills
- Hand-eye coordination

---

## 🐱🐶 Match Game

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

## 🐱 Paper Kitty Adventure

Current status:

Integrated into Petrin svet.

Features:

- Side-scrolling platformer
- Canvas renderer
- Touch controls
- Physics
- Camera
- Coins
- Multiple levels
- Win screen
- Synthesized audio

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

## 🧩 Animal Scene Puzzle

Purpose:

Build observation and problem-solving skills through a simple classic puzzle.

Gameplay:

- Show an animal scene (playground, house, savanna).
- Tap the scene to split it into puzzle pieces.
- Drag pieces into a rectangular placeholder with forgiving placement.
- Pop sound on correct placement; celebration and next-puzzle button on completion.

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

- 4×4 board of face-down animal cards.
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
- 🔢 Бројеви — numbers 0–10. Tap a number to hear it and a sentence like "Пет слонова" (Five elephants), shown with that many animal pictures.
- 🔷 Облици — Круг, Квадрат, Троугао, Звезда, plus 3D shapes Лопта, Коцка, Квадар, Ваљак, Купа, Пирамида (drawn as inline SVG so the real 3D form is visible). Tap a shape to hear its name.
- 🎨 Боје — the 11-color palette. Tap a color to hear its name.

The hub carries **two button sets** — "За малишане" (the 4 learn-and-repeat activities above) and "За децу" (full-fledged quiz games, Phase 3): Азбука за децу (hear a letter sound → pick the letter), Бројеви за децу (count the animal emojis → pick the number), Боје за децу (hear a color → pick the swatch), Облици за децу (hear a shape → pick the shape). Each is a forgiving 8-question multiple-choice game: pop + bounce on correct, gentle shake and "Покушај још једном!" on wrong (no punishment), 🏅 + "Све си урадио!" panel with score on completion, and a replay button. Tap the prompt card to replay the sound.

Every activity has an autoplay button (▶) that walks through the tiles one by one, advancing only after the spoken word finishes plus a short pause, so the child has time to repeat. No celebration icon — the goal is to learn and repeat the words. All text is Serbian Cyrillic, and all speech is Serbian (pre-generated MP3 assets).

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

- **Hub landing (task 64, 2026-08-05):** `index.html` opens on the "🌈 Петрин свет" title with two big group tiles — **УЧЕЊЕ first** (icon = 2×2 emoji combo 🏫📝/🎹🎨) then 🎮 **ИГРЕ** (Kitty, Driving, Ocean, Dino, Space, Candy, Memory, Puzzle). Each tile opens that group's sub-hub screen with the round game buttons; a back arrow returns to the landing. УЧЕЊЕ = Classroom, Tracing, Animals, Shapes, Counting, Coloring, Piano.
- **Kitty Adventure** runs inside the main app screen (embedded `papper_kitty.html`).
- All other games open as standalone pages launched from the hub.
- Navigation, audio, speech, and utilities are shared modules.

**Current focus: Phase 3 (Учионица kids tier) + Phase 4.** All **fifteen** games are playable. Phase 3 is reactivated (2026-08-04) as **full-fledged games delivered inside Учионица**: the classroom keeps its 4 baby-tier learn-and-repeat activities and gains a second menu set "За децу" with full games for the same content (Азбука/Бројеви/Боје/Облици) — e.g. "Бројеви" (for babies) next to "Бројеви" (for kids). **Phase 4 (2026-08-04)**: Клавир (Piano, task 58) — 8-key keyboard with free play and a "Свирај песму" follow-the-melody mode ("Трепери, трепери звездице"), synthesized Web Audio, no new audio assets; then **Возила (Driving, task 60)** — 10 themed road worlds (Градски трг → Космичка стаза) on a new shared adventure engine (`adventure.js`, drive mode), each world with its own synthesized music theme and ambient layer; then **Океан (Ocean, task 61)** — 10 underwater worlds (Корални гребен → Ноћни океан) on the same engine in fly mode, with patrolling sharks and per-world music + ambient; then **Дино (Dino, task 62)** — 10 prehistoric worlds (Прашума → Острво диносауруса) on the same engine in ground mode (jump/gravity/platforms), with pop-out raptor enemies and per-world music + ambient; then **Свемир (Space, task 63)** — 10 space worlds (Звездано небо → Дубоки свемир) on the same engine in fly mode, with patrolling UFOs and per-world music + ambient, **completing Phase 4**. Писање (Tracing) shipped as task 53 — it covers Letter Tracing + Number Tracing (and shape tracing) from the Future Mini Games list in one hub, as **free draw on a dashed guide** (draw over the dashed outline; validated by forgiving ink-proximity metrics). See the [Development Roadmap](#development-roadmap) for phase status.

---

# Deployment (GitHub Pages)

The live site is served by GitHub Pages from the **`docs/` folder on the `main` branch** — so the site updates on every push to `main`. Site URL: **https://radmanmilos.github.io/Games-for-kids/**

- **`game/` is the single source of truth.** `docs/` is just the published copy — never edit `docs/` directly.
- **When `game/` changes, replace the ENTIRE `docs/` content with the new `game/` content.** Run `tools/sync-docs.sh` (deletes `docs/` and copies `game/` into it), then commit and push — the site is live.
- One-time setup (already done): Settings → Pages → **Source: `Deploy from a branch`** → `main` → `/docs`. No build step (plain static HTML; the app uses only relative paths, so it works under the `/Games-for-kids/` subpath).
- The earlier GitHub Actions workflow (`.github/workflows/deploy.yml`, deploy `game/` → `gh-pages`) was **abandoned** — GitHub Pages refused to deploy from `game/`, so it was removed per user decision. Keep it that way: no workflow, `docs/` mirror only.
- Local preview: use Live Server on `game/` over HTTP — never `file://` (breaks audio, the kitty iframe, and throws Unsafe-attempt warnings).

---

# Navigation Model

The app follows a hybrid model:

```
Petrin svet (index.html landing: 🌈 title + two group tiles — УЧЕЊЕ 🏫📝🎹🎨 first, then 🎮 ИГРЕ)

↓

Group tile

↓

Group sub-hub (round game buttons — ИГРЕ 8, УЧЕЊЕ 7)

↓

Standalone game page (or in-app Kitty screen)

↓

Back button

↓

Main Menu (landing)
```

`shared/navigation.js` drives every `data-go` button. Most games load their own page; Kitty is the one in-app screen (embedded via iframe so it keeps its own canvas loop and HUD).

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

This is implemented in `games/kitty.js`: the animation loop stops when leaving the game, and standalone pages expose `start<Game>()` entrypoints booted by `shared/main.js`.

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

Test tooling lives in `tools/` (see `tools/README.md`): `headless.js` shared harness, `hub_smoke.js` (hub navigation), `tracing_smoke.js` (canonical tracing validation), `tracing_probe.js` (metric tuning), `dilate_test.js`. Run with `node tools/<file>.js` — no install needed.

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
  papper_kitty.html
  driving.html
  ocean.html
  dino.html

games/
shared/
assets/
```

- `index.html` is the hub. It loads every game module and embeds Kitty.
- The standalone pages (`pages/animals.html`, `pages/shapes.html`, `pages/matching_game.html`, `pages/animal_puzzle.html`, `pages/animal_counting.html`, `pages/animal_memory.html`, `pages/coloring.html`, `pages/classroom.html`, `pages/tracing.html`, `pages/driving.html`, `pages/ocean.html`, `pages/dino.html`) each load only the modules they need.
- `papper_kitty.html` is the self-contained Kitty runtime, embedded in the hub via iframe.

```
games/

animals.js
shapes.js
candy.js
kitty.js
animal_puzzle.js
animal_counting.js
animal_memory.js
coloring.js
classroom.js
tracing.js
adventure.js
driving.js
ocean.js
dino.js
```

```
shared/

navigation.js
audio.js
speech.js
utils.js
main.js
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
  papper_kitty.html
  driving.html
  ocean.html
  dino.html
  space.html

games/

animals.js
shapes.js
candy.js
kitty.js
animal_puzzle.js
animal_counting.js
animal_memory.js
coloring.js
classroom.js
tracing.js
adventure.js
driving.js
ocean.js
dino.js
space.js

shared/

audio.js
speech.js
navigation.js
utils.js
main.js
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

- 🎵 Piano — ✅ (Клавир, task 58; 3 songs: Трепери, Срећан ти рођендан, Џингл белс — task 59)
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
- kitty.js
- animal_puzzle.js
- animal_counting.js
- animal_memory.js

---

## Phase 3 — ACTIVE (reactivated 2026-08-04 as the Учионица kids tier)

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

## Phase 4 — New game set (NEXT, queued after Phase 3)

Build the next batch of mini-games, one per task, picked from the [Future Mini Games](#future-mini-games) list:

- 🎵 Piano — ✅ built (2026-08-04, as **Клавир**, task 58: 8-key one-octave keyboard, free play + "Свирај песму" follow-the-melody mode; **3 songs** since task 59: Трепери, Срећан ти рођендан, Џингл белс — chip picker in song mode)
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

## Phase 5 — Game polish (was Phase 4; refocused 2026-08-05)

**Focus (user decision 2026-08-05): the 8 ИГРЕ games only** (Paper Kitty, Driving, Ocean, Dino, Space, Candy, Memory, Puzzle). The УЧЕЊЕ learning apps (Classroom, Tracing, Animals, Shapes, Counting, Coloring, Piano) are **out of scope** this phase. Workflow rule: the assistant proposes a task per game, then **asks the user what to add/change before executing** any of them.

Registered tasks (one per game, see PROJECT_TASKS): Memory (65 — progress + "Пар!" popup + moves counter), Candy (66 — level milestones), Puzzle (67 — more scenes + finish sparkle), Kitty (68 — level-pacing re-tune), adventure games (69 — speed/density/length tuning).

Improve:

- Animations
- Sound effects
- Screen transitions
- Reward system
- Unlockable stickers
- Additional mini-games

### Polish backlog (candidate items)

Shared (all done 2026-08-02):

- Play a soft click sound on every navigation (hub buttons, back, next) — **DONE** (task 23).
- Use the shared speech helper for vocabulary where missing: Animals should speak the animal name, Shapes the shape name, Counting the number, Memory the animal on flip — **DONE** (task 24/27/28).
- Consistent celebration feedback (celebrate overlay + pop/chime) across all games — **DONE** (task 25).
- Remove unused legacy audio files in `game/assets/audio/` — **DONE** (task 26).

Per game:

- Animals: speak the animal name on tap; roster expanded with Fox, Sheep, Horse, Chicken — **DONE** (task 27).
- Shape Match: speak the shape name on correct placement — **DONE** (task 28).
- Match Game (candy): streak/combo flourish on cascading matches — **DONE** (task 29).
- Paper Kitty: pause the animation loop when the screen or tab is hidden — **DONE** (task 30); tuning level pacing still open.
- Animal Scene Puzzle: more scenes + 2×2/3×3 grid — **DONE** (task 31; jigsaw-shaped pieces rejected by user, deferred).
- Animal Counting: speak the number aloud; more levels; bigger celebration — **DONE** (task 32).
- Animal Memory: flip sound and spoken animal name; optional difficulty (fewer pairs); prettier card back — **DONE** (task 33: flip sound + paw-print card back; difficulty deferred by user). Animal sound + name speech now fire **only on matched pairs**, not on every flip (task 46, 2026-08-03).
- Coloring: show scene progress (e.g. "Животиња 3 од 12") and a sticker/reward when all 12 are done; human visual pass on the 12 scenes — **DONE** (task 34: randomized order, "Животиња N од 12" progress, all-12 🏅 reward with restart; ref + coloring images enlarged via side-by-side layout; smallest paint regions enlarged; human visual pass still recommended).

Big-ticket (deferred to a later phase 2026-08-03):

- Reward system with unlockable stickers — deferred (task 35).
- Screen transitions between hub and games — deferred (task 36).

Open items in Phase 5:

- Visual pass on the 12 coloring scenes (task 51 redraw) — screenshots in `resources/coloring-redraw/*.png`; review with MiMo V2.5 Free.

---

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
