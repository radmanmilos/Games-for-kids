# 🐱💨 Брзи мачак (Fastcat)

Purpose:

A Sonic-style 2D auto-runner: the kitty or the explorer-girl sprints forward on her own and the child only steers the timing — jump over rocks, slide under bars, gather coins, and blast through everything with the ⚡ super speed.

Gameplay:

- Auto-run: the character always moves forward at a steady pace; the big JUMP button (right edge) and SLIDE button (left edge) are the only steering, plus the ⚡ button that appears when the meter is full.
- Coins and golden bolts fill the ⚡ meter; a full meter enables super speed — about 4 seconds of invulnerable 2× barrel-roll motion that smashes rocks and bars while the meter drains.
- Obstacles never kill or fail the run: puddles slow you, rocks must be jumped, slide bars must be ducked, boost pads speed you up for free.
- One deterministic 15000px course (seed 254) dealt from a shuffled 7-type deck (calm / rocks / puddle / banner / boost / hills / mixed) so every hazard family is guaranteed to recur; coin arcs teach the jump lines and the low coin lines teach the slide lines.
- Character picker on start: kitty or explorer-girl (same choice as Мала истраживачица).
- Landscape-first: portrait orientation shows the "okreni uređaj" rotate overlay.
- Reaching the goal shows the win modal; replay resets score, meter and the course.

Educational goals:

- Timing
- Reflexes and planning (jump vs slide)
- Cause and effect
- Fine motor skills

---

Refactoring note (task 254, 2026-10-17): first shipped version — game core (`game/games/fastcat.js`), page (`game/pages/fastcat.html`), registry/hub wiring, and `tools/fastcat_smoke.js` (42 checks: picker, auto-run, jump/slide, coin→meter, super gate/drain/2x/lapse, all four hazards incl. anti-vacuous hit-flag proofs, win/replay, control geometry, rotate overlay, route contract).
