# Petrin svet

> **Petrin svet** is an offline-first collection of educational mini-games for young children (approximately 2–6 years old), designed to be fun, safe, simple, and frustration-free.
>
> **[Play Petrin svet](https://radmanmilos.github.io/Games-for-kids/)** · Static HTML/CSS/JavaScript · Serbian Cyrillic · No ads or in-app purchases

---

## Where things are

| Need | Go to |
| --- | --- |
| Rules for every AI tool (OpenCode, Codex, Copilot, Claude) | [`AGENTS.md`](AGENTS.md) |
| Current state and candidate next work | [`project/STATUS.md`](project/STATUS.md) |
| Open tasks / task history | [`project/tasks/ACTIVE.md`](project/tasks/ACTIVE.md), [`project/tasks/INDEX.md`](project/tasks/INDEX.md) (full text: `archive/tasks/`) |
| Process and definition of done | [`project/PROCESS.md`](project/PROCESS.md), [`CONTRIBUTING.md`](CONTRIBUTING.md) |
| Locked decisions (do not re-open) | [`project/DECISIONS.md`](project/DECISIONS.md) |
| Lessons (read before touching an area) | [`project/lessons/`](project/lessons/) |
| One doc per game | [`project/games/`](project/games/) |
| Offline, playtesting, asset budget, setup | [`project/reference/`](project/reference/) |
| Roadmap | [`ROADMAP.md`](ROADMAP.md) |
| Which AI reads what (OpenCode, Codex, Copilot, Claude) | [`project/reference/ai-tools.md`](project/reference/ai-tools.md) |
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

# Game Guides

These guides document selected games—the list is not the authoritative runtime catalogue. The public pages and routes are defined by [`game/data/app-registry.js`](game/data/app-registry.js). Each guide records behaviour, files and decisions; update the relevant guide when that game's behaviour changes, rather than duplicating details here.

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

## Offline installation

The app supports offline use through its service worker. In the parent area, a caregiver can use **«📥 Преузми за офлајн рад»** to cache the files the application needs, then use the update check to identify changed content. Caregiver instructions are in [`game/docs/OFFLINE_INSTALL.md`](game/docs/OFFLINE_INSTALL.md); the technical mechanism and its validation are documented in [`project/reference/OFFLINE.md`](project/reference/OFFLINE.md).

**There is no ZIP download.** Offline delivery is handled by the service worker. After runtime changes, regenerate the published mirror from `game/` with `tools/sync-docs.sh`; never edit `docs/` directly. The offline inventories have their own generation and validation steps—follow the reference guide rather than editing generated files by hand.

---

# Navigation Model

The hub opens learning and game sub-hubs, which launch standalone game pages. The shared navigation system in `game/shared/navigation.js` handles registered `data-go` routes. The current route/page list is maintained in one place: [`game/data/app-registry.js`](game/data/app-registry.js). Do not maintain a second hand-written route list in documentation or runtime code.

# Game Runtime and Shared Systems

Games are standalone pages, with shared startup and navigation helpers. The exact pages, routes, boot functions and smoke-test associations are defined in [`game/data/app-registry.js`](game/data/app-registry.js); the registry is the source of truth, not an illustrative file tree in this README.

Shared systems include:

- **Navigation:** `game/shared/navigation.js` and `game/shared/main.js`.
- **Audio and speech:** reuse the existing shared helpers; do not create duplicate audio contexts or one-off systems without a demonstrated need.
- **Sound effects and celebrations:** reuse the established shared effects where appropriate.
- **Utilities:** reuse existing randomization, shuffle, animation and touch helpers when they fit.

For a particular game's files and behavior, consult its guide in [`project/games/`](project/games/). For test harnesses and validation commands, start with [`tools/README.md`](tools/README.md) and [`CONTRIBUTING.md`](CONTRIBUTING.md).

# Fonts

Main UI

- Fredoka

Fredoka is bundled locally (`game/assets/fonts/fredoka-latin.woff2` and `game/assets/fonts/fredoka-latin-ext.woff2`); runtime font loading must not require external network requests.

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

The app is plain HTML, CSS and JavaScript and requires no build step. The main runtime areas are:

- `game/index.html` and `game/pages/` — hub and standalone pages.
- `game/data/app-registry.js` — authoritative public page/route registry.
- `game/games/` and `game/shared/` — game implementations and shared systems.
- `game/assets/` — local runtime assets.

The full current folder reference is [`project/reference/folder-structure.md`](project/reference/folder-structure.md). Avoid copying a complete file tree into this README: it becomes stale as the app evolves.

# Current Development State

The current project status and user-approved candidate next work are recorded in [`project/STATUS.md`](project/STATUS.md). The roadmap is [`ROADMAP.md`](ROADMAP.md); completed plans are archived and should not be presented as open work. The public page catalogue is in [`game/data/app-registry.js`](game/data/app-registry.js).

Do not infer that a feature is planned, approved, complete or tested from an old README list or archived plan. Check the current status, active tasks and locked decisions before proposing work.

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

**Binding instructions:** [`AGENTS.md`](AGENTS.md) is the primary rule source for AI coding tools. Follow [`project/PROCESS.md`](project/PROCESS.md) for task lifecycle and approval, [`project/STATUS.md`](project/STATUS.md) for the current snapshot, [`project/tasks/ACTIVE.md`](project/tasks/ACTIVE.md) for open tasks, and [`project/DECISIONS.md`](project/DECISIONS.md) for locked decisions. This section is a project-principles summary, not a replacement for those documents; if wording conflicts, follow the authoritative instructions and current project records.

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
