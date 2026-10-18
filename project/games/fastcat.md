# 🐱💨 Брзи мачак (Fastcat)

Purpose:

A Sonic-style 2D auto-runner: the kitty or the explorer-girl sprints forward on her own and the child only steers the timing — jump over rocks, slide under bars, gather coins, and blast through everything with the ⚡ super speed.

Gameplay:

- Auto-run: the character always moves forward at a steady pace; the big JUMP button (right edge) and SLIDE button (left edge) are the only steering, plus the ⚡ button that appears when the meter is full.
- Coins and golden bolts fill the ⚡ meter; a full meter enables super speed — about 4 seconds of invulnerable 2× barrel-roll motion that smashes rocks and bars while the meter drains.
- Obstacles never kill or fail the run: puddles slow you, rocks must be jumped, slide bars must be ducked, boost pads speed you up for free.
- **Ten themed levels (play-test 4):** Прашума🌺, Тропска долина🦜, Језеро💧, Вулкан🌋, Пећина💎, Мочвара🐸, Ледено доба❄️, Пустиња🌵, Ноћни свет🌙, Острво🏝️. Each level themes the whole course — sky/hills/ground palette, the pickup emoji (the old star coins are now the level's thing, with a glow backing for visibility; the HUD score icon matches), and its own synthesized music loop (explorer-parity engine on the shared `music` bus, runner tempos, no ambient layer). Each level is its own deterministic 19500px course from the same shuffled 7-type deck (calm / rocks / puddle / banner / boost / hills / mixed) with a per-level seed (254 + 101·i), so every hazard family recurs while no two courses are alike; coin arcs teach the jump lines and the low coin lines teach the slide lines.
- Character picker on start: kitty or explorer-girl (same choice as Мала истраживачица). A 🌍 button (top-right) opens the level picker any time — 10 open choices with name + emoji, no locks (explorer parity, toddler-first).
- ♪ music toggle (top-right, under 🌍): shares the explorer's `pkMusic` preference, so one tap mutes music across both games; each level starts its own loop.
- Playable in both orientations (play-test 2 removed the portrait rotate gate); controls: SLIDE bottom-left, JUMP bottom-right, and the ⚡ button stacked directly above JUMP so one thumb reaches both. Sliding shows the character lying flat on the surface.
- Reaching the goal shows the win modal with СЛЕДЕЋИ НИВО (while levels remain; the last level offers replay only); replay/next resets score, meter and the course, and the level label (bottom-centre) always shows the current level number + name + emoji.

Educational goals:

- Timing
- Reflexes and planning (jump vs slide)
- Cause and effect
- Fine motor skills

---

Refactoring note (task 254, 2026-10-17): first shipped version — game core (`game/games/fastcat.js`), page (`game/pages/fastcat.html`), registry/hub wiring, and `tools/fastcat_smoke.js` (42 checks: picker, auto-run, jump/slide, coin→meter, super gate/drain/2x/lapse, all four hazards incl. anti-vacuous hit-flag proofs, win/replay, control geometry, rotate overlay, route contract).

Refactoring note (task 254 round 3, 2026-10-18): ⚡ button enlarged (56px min target) and raised to a 5vmin clear gap above JUMP (geometry pin now requires ≥8px clear — its glow ring used to visually touch the jump button); level length 15000 → 19500px (~30% longer, same seed/deck); offline E2E gained the fastcat interaction spec (Release QA 140/140); manifest 2.1.0 → 2.1.1. Next: themed levels with per-level themed pickups and per-level music (user-confirmed), shipping as 2.2.0.

Refactoring note (task 254 round 4, 2026-10-18): the themed-levels segment (manifest 2.1.1 → 2.2.0, B = major per the AGENTS versioning rule) — 10 themed levels mirroring the explorer's world system: per-level palette (sky/hill/ground/grass), pickup emoji on a glow backing (star coins removed, `drawStar` deleted with them), HUD score icon = level emoji, 🌍 level picker (open, no locks), bottom-centre level label, СЛЕДЕЋИ НИВО on the win modal (hidden on the last level), per-level seeds (254 + 101·i), and per-level synthesized music (`MUSIC` with fcJungle…fcIsland, explorer's scheduler shape on the shared `music` bus, ♪ toggle sharing `pkMusic`). `__fc` gained `selectLevel(i)` + level/coinEmoji/musicTheme/musicRunning state; `tools/fastcat_smoke.js` 43 → 58 checks (picker contract, re-theming, per-level course difference, ♪ toggle incl. the shared key, next-level flow, last-level rule, new-control geometry in both orientations).
