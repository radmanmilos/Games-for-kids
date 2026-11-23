# 🐠 Океан (Ocean)

Moved verbatim from `README.md` (2026-10-13 refactor). Keep this file current when the game's behaviour changes; the README only links here.

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

---

Refactoring note (task 250, 2026-10-16): the shared adventure engine now clears held keyboard/touch movement state when pausing on focus loss or document hiding, and touch controls treat `touchcancel` as release. Regression coverage is in `tools/adventure_smoke.js`.

## 2026-11-04 (OpenCode/Big Pickle)
- Painted art wiring + baseline smoke greening (tasks 341-352). See commit dfe4155.

## 2026-11-23 (Kilo/openrouter/free, task 463)
- Shared playfield rectangle (`pf`) measured from DOM chrome — hero/obstacles/coins/goal clamped inside, entity scale `u = pf.height / 520` clamped to [0.5, 1].
- Compact HUD on short screens (`canvas.height < 500px`): title hidden, score card shrunk to icon+number, HUD band ≤ 56px.
- Reaction-time budget: scroll speed scales by `clamp(canvas.width/1024, 0.6, 1)` so obstacle-to-hero time stays ≥ 2.0 s at every size.
- Debug overlay: `?debug=pf` draws pf rect, hero hitbox, obstacle hitboxes, shadow baseline (no network, no UI text).
- Ocean coin Y bug fixed (uses `maxDy` not `goalDy`).
