# 🚗 Возила (Driving)

Moved verbatim from `README.md` (2026-10-13 refactor). Keep this file current when the game's behaviour changes; the README only links here.

Purpose:

Drive a little car through ten different road worlds, dodging vehicles and road works.

Gameplay:

- The road rolls forward automatically; the child steers the car up/down/left/right.
- Avoid cars, trucks, buses, cones and barriers — bumping just knocks the car back a little (no fail states).
- Collect the world's emoji (⭐🍭🍂⛄🎿🌙🌵🌴🐚🪐) and reach the "ЦИЉ" finish gate.
- 10 themed worlds: Градски трг, Поље сунцокрета, Јесења шума, Зимски пут, Планински пут, Ноћни град, Пустињска магистрала, Тропско острво, Морска обала, Космичка стаза.
- Every world has its own synthesized music theme with an ambient layer (horns, crickets, birdsong, wind, rumble, owl hoots, desert wind, waves, sleigh bells).
- **Navigation arrow (task 126):** a large pulsing yellow arrow appears near the goal when the child is far away, pointing toward the finish — no text instructions.
- **Bubble trail (task 127):** in Ocean mode, gentle bubbles float toward the goal when the child is far away — visual guidance without arrows.
- **Forgiving jump (task 128):** in Dino mode, jump buffer (150ms), forgiving collision (40px), and soft respawn to last safe position — a child who reacts slightly late still gets many successful jumps.
- **Spatial identity (task 129):** in Space mode, altitude bands (3 subtle horizontal layers) and planets as landmarks (4 large decorative circles) — teaches simple spatial movement through play.
- **Shared engine (task 130):** all 4 adventure games use `AdventureEngine.create()` — a bug fix in shared movement applies once across all games.
- **Legacy cleanup (task 131):** removed `papper_kitty.html`, `racing.html`, `kitty-standalone.js` — all replaced by newer implementations.
- **Play-aware tests (task 132):** memory smoke now covers audio-disabled, resize, and back-button scenarios (12 → 15 checks).
- **Touch interruption tests (task 133):** shapes smoke now covers pointercancel, multi-touch, and page-hidden scenarios (13 → 16 checks).
- **Visual regression (R9/task 170):** captures the hub and all 16 `screenshot:true` apps at five phone/tablet/desktop viewports (85 images). `node tools/visual_compare.js` compares decoded pixels against reviewed baselines; changed-pixel metrics and failure diffs are reported. Baselines live in `resources/visual-baselines/` and can be replaced only by explicitly running `node tools/visual_compare.js --approve-baseline` after reviewing the complete capture set.
- **Animal art recovery (task 135):** reverted custom SVG illustrations — restored native Unicode emoji for all animal artwork (per Master Implementation Plan: custom SVGs were "visually too crude")
- **Navigation arrow (task 126):** a large pulsing yellow arrow appears near the goal when the child is far away, pointing toward the finish — no text instructions.

Educational goals:

- Motor skills
- Cause and effect
- Observation

---
