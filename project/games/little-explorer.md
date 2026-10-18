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
- Character-specific death sounds (cat for the kitty, "Јао!" for the girl, task 90)
- **Toddler-first (task 125):** soft respawn to last safe position, forgiving platforms (40px tolerance), exploration reward (bonus coin for new areas)
- **Fun speed toggle (task 251):** a 🚀 button under the point counter runs the whole tick 3× faster (hero walks and jumps 3× quicker; OFF on every load — normal speed is the default)
- **Ground band (task 254):** the ground line sits 100px above the canvas bottom (was 140) so the world reads lower on landscape screens, matching Брзи мачак

Educational goals:

- Exploration
- Timing
- Motor skills
- Cause and effect

---
