# ⭐ Shape Match

Moved verbatim from `README.md` (2026-10-13 refactor). Keep this file current when the game's behaviour changes; the README only links here.

Purpose:

Learn geometric shapes.

Gameplay:

- **Toddler-first (Tier 1, default):** 2 shapes, generous snap radius (1.5× slot width), soft animation toward target, no punishment on wrong target.
- **Tier 2:** 3 shapes. **Tier 3:** 4 shapes with rotation variation.
- Drag shapes into matching outlines — no pixel-perfect dragging needed.
- Correct placement triggers a success chime and the shape name is spoken.
- Wrong placement returns the shape gently; after 2 failed attempts the correct target pulses yellow as a hint.

Educational goals:

- Shape recognition
- Fine motor skills
- Hand-eye coordination

---

Refactoring note (task 250, 2026-10-16): tier 3 uses four explicit horizontal positions. Drag cancellation and lost pointer capture restore a piece to its neutral visual state; the Shapes smoke checks both on-stage geometry and cancellation cleanup.
