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

- **Kitty Adventure** runs inside the main app screen (embedded `papper_kitty.html`).
- All other games open as standalone pages launched from the hub.
- Navigation, audio, speech, and utilities are shared modules.

**Current focus: a new game set (Phase 4).** All ten games are playable. Phase 3 (standalone Alphabet/Numbers/Colors games) is deferred per user decision (2026-08-03); Учионица keeps covering that content. Писање (Tracing) shipped as task 53 — it covers Letter Tracing + Number Tracing (and shape tracing) from the Future Mini Games list in one hub, as **free draw on a dashed guide** (draw over the dashed outline; validated by forgiving ink-proximity metrics). See the [Development Roadmap](#development-roadmap) for phase status.

---

# Navigation Model

The app follows a hybrid model:

```
Petrin svet (index.html hub)

↓

Game button

↓

Standalone game page (or in-app Kitty screen)

↓

Back button

↓

Main Menu
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

Test tooling lives in `tools/` (see `tools/README.md`): `headless.js` shared harness, `tracing_smoke.js` (canonical tracing validation), `tracing_probe.js` (metric tuning), `dilate_test.js`. Run with `node tools/<file>.js` — no install needed.

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

games/
shared/
assets/
```

- `index.html` is the hub. It loads every game module and embeds Kitty.
- The standalone pages (`pages/animals.html`, `pages/shapes.html`, `pages/matching_game.html`, `pages/animal_puzzle.html`, `pages/animal_counting.html`, `pages/animal_memory.html`, `pages/coloring.html`, `pages/classroom.html`, `pages/tracing.html`) each load only the modules they need.
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
```

```
shared/

navigation.js
audio.js
speech.js
utils.js
main.js
accessibility.css
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

shared/

audio.js
speech.js
navigation.js
utils.js
main.js
accessibility.css

assets/

fonts/
sounds/
images/
```

Each mini-game is self-contained and uses shared systems where possible.

---

# Future Mini Games

Planned additions include (note: Alphabet, Numbers, and Colors are now covered as Учионица activities; Phase 4 builds from this list; ✅ = already shipped):

- 🎵 Piano
- 🥁 Musical Instruments
- 🎈 Balloon Pop
- 🚜 Farm
- 🚗 Vehicles
- 🍎 Fruit Matching
- 🦕 Dinosaurs
- 📚 Story Time
- ✏ Letter Tracing — ✅ (Писање / Tracing, task 53)
- ✏ Number Tracing — ✅ (Писање / Tracing, task 53)
- 🎂 Birthday Cake Builder
- 🐠 Ocean Discovery
- 🚀 Space Explorer

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

## Phase 3 — DEFERRED (per user decision, 2026-08-03)

Standalone educational mini-games (Alphabet, Numbers, Colors, Shapes as full games) are **not being built now**. Учионица continues to deliver this content as learn-and-repeat activities (task 39): all 30 letters, numbers 0–10, 4 flat + 6 3D shapes, 11 colors, each with spoken Serbian audio and autoplay.

Done in Phase 3 before the deferral:

- Memory (Animal Memory)
- Puzzles (Animal Scene Puzzle)
- Counting (Animal Counting)
- Coloring (tap-to-fill SVG scenes)

---

## Phase 4 — New game set (CURRENT FOCUS)

Build the next batch of mini-games, one per task, picked from the [Future Mini Games](#future-mini-games) list:

- 🎵 Piano
- 🥁 Musical Instruments
- 🎈 Balloon Pop
- 🚜 Farm
- 🚗 Vehicles
- 🍎 Fruit Matching
- 🦕 Dinosaurs
- 📚 Story Time
- ✏ Letter Tracing — ✅ built (2026-08-03, as part of **Писање (Tracing)**, task 53: all 30 Serbian Cyrillic letters + numbers 0–10 + 4 flat shapes in one hub; redesigned to FREE DRAW on a dashed guide — the child draws over a faint dashed outline, matched by ink-proximity metrics with a forgiving "nearness" threshold)
- ✏ Number Tracing — ✅ built (same game, see above)
- 🎂 Birthday Cake Builder
- 🐠 Ocean Discovery
- 🚀 Space Explorer

Built so far from this list: **Писање (Tracing)** (task 53). No commitment yet for the rest — the user picks which games to build; each chosen game gets its own task.

---

## Phase 5 — Polish (was Phase 4)

Polish.

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

## Project Activities

A companion file, `PROJECT_TASKS.md`, contains a minimal, machine-friendly list of current tasks and their statuses (NEW / IN PROGRESS / DONE). Contributors and AI assistants must check `PROJECT_TASKS.md` before starting work and update task statuses and brief notes when beginning or completing work. The AI assistant should read this file first and continue the highest-priority task not marked DONE.

### AI startup helper

A helper script is provided to automate the startup check: `tools\ai_startup.ps1` (Windows PowerShell). It reads `PROJECT_TASKS.md`, shows the next pending task, and asks whether to continue with that task or do something else. From the project root the helper can be launched with `start_ai.bat` or by running the PowerShell script directly.

AI assistants and human contributors are encouraged to run this script at the start of a work session so the project context and task state are always consulted before making changes.
