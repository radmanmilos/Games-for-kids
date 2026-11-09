# 🧭 Мала истраживачица (Little Explorer, formerly Paper Kitty Adventure)

Moved verbatim from `README.md` (2026-10-13 refactor). Keep this file current when the game's behaviour changes; the README only links here.

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
- Held input (◀/▶/jump) now releases on `touchcancel` and on pause/blur (task 329)
- Character-specific death sounds (cat for the kitty, "Јао!" for the girl, task 90)
- **Toddler-first (task 125):** soft respawn to last safe position, forgiving platforms (40px tolerance), exploration reward (bonus coin for new areas)
- **Fun speed toggle (task 251):** a 🚀 button under the point counter runs the whole tick 3× faster (hero walks and jumps 3× quicker; OFF on every load — normal speed is the default)
- **Ground band (task 254):** the ground line sits 100px above the canvas bottom (was 140) so the world reads lower on landscape screens, matching Брзи мачак
- **World backgrounds (Gate 3, task 433):** all 11 world scenes regenerated as storybook-painted backgrounds (spring, summer, autumn, winter-explorer, underground, cave, water, savanna, japan, northpole, egypt), 2048×592 opaque PNG, seamless horizontal tiling, sky-dominant with no baked gameplay elements, replacing procedural sky in `draw()`.
- **Pilot art glyphs (Gate 4, task 434):** spring static platforms and spawner pipes render via `Art.draw()` with painted glyph WebPs (`terrain-spring-top.webp`, `pipe-spring.webp`, both ≤60 KB real-alpha WebP, ≤60 KB), with `fillRect` fallback for non-spring worlds and while images load.

Educational goals:

- Exploration
- Timing
- Motor skills
- Cause and effect

---
