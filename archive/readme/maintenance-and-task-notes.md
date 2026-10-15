# README maintenance note and per-task polish notes (verbatim)

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
