# 🐱🐶 Match Game (Candy)

Moved verbatim from `README.md` (2026-10-13 refactor). Keep this file current when the game's behaviour changes; the README only links here.

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

Refactoring note (task 250, 2026-10-16): an interrupted tile drag cancels the preview, clears transient drag classes/transforms on both tiles, and releases pointer ownership without committing a swap. The Candy smoke includes a pointer-cancellation regression check.
