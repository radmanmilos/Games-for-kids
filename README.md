# Petrin svet

> **Petrin svet** is an offline collection of educational mini-games for young children (approximately 2–6 years old), designed to be fun, safe, simple, and frustration-free.

---

## Where things are

| Need | Go to |
| --- | --- |
| Rules for every AI tool (OpenCode, Kilo, Codex, Copilot, Claude) | [`AGENTS.md`](AGENTS.md) |
| Current state and candidate next work | [`project/STATUS.md`](project/STATUS.md) |
| Open tasks / task history | [`project/tasks/ACTIVE.md`](project/tasks/ACTIVE.md), [`project/tasks/INDEX.md`](project/tasks/INDEX.md) (full text: `archive/tasks/`) |
| Process and definition of done | [`project/PROCESS.md`](project/PROCESS.md), [`CONTRIBUTING.md`](CONTRIBUTING.md) |
| Locked decisions (do not re-open) | [`project/DECISIONS.md`](project/DECISIONS.md) |
| Lessons (read before touching an area) | [`project/lessons/`](project/lessons/) |
| One doc per game | [`project/games/`](project/games/) |
| Offline, playtesting, asset budget, setup | [`project/reference/`](project/reference/) |
| Roadmap | [`ROADMAP.md`](ROADMAP.md) |
| Which AI reads what (OpenCode, Kilo, Codex, Copilot, Claude) | [`project/reference/ai-tools.md`](project/reference/ai-tools.md) |
| Finished work (plans, reviews, handover logs, tasks) | `archive/` (excluded from AI search by `.ignore`) |
| The app / its published copy | `game/` / `docs/` (byte-exact mirror, never edit by hand) |
| Dev tooling | `tools/` (index: [`tools/README.md`](tools/README.md)) |

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

One doc per game in [`project/games/`](project/games/) — behaviour, files and decisions. Update that file when a game's behaviour changes (not this README).

| Game | Doc |
| --- | --- |
| 🐶 Animals | [`project/games/animals.md`](project/games/animals.md) |
| ⭐ Shape Match | [`project/games/shape-match.md`](project/games/shape-match.md) |
| 🐱🐶 Match Game (Candy) | [`project/games/candy-match.md`](project/games/candy-match.md) |
| 🧭 Мала истраживачица (Little Explorer, formerly Paper Kitty Adventure) | [`project/games/little-explorer.md`](project/games/little-explorer.md) |
| 🚗 Возила (Driving) | [`project/games/driving.md`](project/games/driving.md) |
| 🐠 Океан (Ocean) | [`project/games/ocean.md`](project/games/ocean.md) |
| 🦕 Дино (Dino) | [`project/games/dino.md`](project/games/dino.md) |
| 🚀 Свемир (Space) | [`project/games/space.md`](project/games/space.md) |
| 🏎️ Мала тркачица (Little Racer) | [`project/games/little-racer.md`](project/games/little-racer.md) |
| 🧩 Animal Scene Puzzle | [`project/games/puzzle.md`](project/games/puzzle.md) |
| 🔢 Animal Counting | [`project/games/counting.md`](project/games/counting.md) |
| 🧠 Animal Memory | [`project/games/memory.md`](project/games/memory.md) |
| 🎨 Coloring | [`project/games/coloring.md`](project/games/coloring.md) |
| 🏫 Учионица (Classroom) | [`project/games/classroom.md`](project/games/classroom.md) |

# Deployment (GitHub Pages)

The live site is served by GitHub Pages from the **`docs/` folder on the `main` branch** — so the site updates on every push to `main`. Site URL: **https://radmanmilos.github.io/Games-for-kids/**

- **`game/` is the single source of truth.** `docs/` is just the published copy — never edit `docs/` directly.
- **When `game/` changes, replace the ENTIRE `docs/` content with the new `game/` content.** Run `tools/sync-docs.sh` (deletes `docs/` and copies `game/` into it), then commit and push — the site is live.
- One-time setup (already done): Settings → Pages → **Source: `Deploy from a branch`** → `main` → `/docs`. No build step (plain static HTML; the app uses only relative paths, so it works under the `/Games-for-kids/` subpath).
- The earlier GitHub Actions workflow (`.github/workflows/deploy.yml`, deploy `game/` → `gh-pages`) was **abandoned** — GitHub Pages refused to deploy from `game/`, so it was removed per user decision. Keep it that way: no workflow, `docs/` mirror only.
- Local preview: use Live Server on `game/` over HTTP — never `file://` (breaks audio and throws Unsafe-attempt warnings).

## Offline installation (Task 94 — mechanism documented in `project/reference/OFFLINE.md`)

The hub is being prepared as an installable Serbian-Cyrillic PWA. The manifest is at `game/manifest.json`, with a relative scope that works both at the repository root and under the GitHub Pages repository subpath. The service worker (`game/sw.js`) has install/activate/fetch handling, one-tap cache-all messaging with progress events, and content-hash update comparison. The hub exposes a download and an update-check control in the parent area; caregiver documentation and validation are tracked in Task 94.

Caregiver instructions are in `game/docs/OFFLINE_INSTALL.md`. **The full mechanism — service worker, the two generated inventories, the never-hard-code-the-path rule, and how it is tested — is documented in [`project/reference/OFFLINE.md`](project/reference/OFFLINE.md).**

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

- `game/` — the deployable app (plain HTML/CSS/JS, no build step). It must run standalone and never depend on `resources/` or `tools/`. Pages and routes: `game/data/app-registry.js`.
- `docs/` — byte-exact mirror of `game/`, served by GitHub Pages. Regenerate with `tools/sync-docs.sh`; never edit by hand.
- `tools/` — Node smokes, guards, checks and screenshot tooling.
- `resources/` — development workspace: reviews, screenshots, prototypes, the asset-generation project.
- `project/` — live docs: status, tasks, decisions, lessons, per-game docs, reference.
- `archive/` — finished work, kept for reference.

The older, detailed folder trees are in `project/reference/folder-structure.md`.

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

# Long-Term Vision

Petrin svet should become a polished collection of educational mini-games that children can safely explore for hours.

Every game should plug into the main application, reuse shared systems, and maintain a consistent design language.

The finished application should feel like a premium offline children's learning app rather than a collection of separate HTML pages.

---
