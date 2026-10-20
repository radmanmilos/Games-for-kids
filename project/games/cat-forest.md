# 🐱 Мачја шума (Cat Forest)

A toddler port of the "Secret Cat Forest" idea: feed visiting emoji cats; their gifts grow a forest.
Approved plan package: `resources/General_reviews/Cat_Forest/` (cards `03_TASKS.md`, ledger `PROGRESS.md`).

Purpose and rules (product decisions, `project/DECISIONS.md`):
no currency, shop, XP, levels, locks, score, counters, timers, fail states, notifications or offline
earnings. No visible text at all — speech and `aria-label`s are Serbian Cyrillic only. Emoji art only:
**no image or audio assets, no new libraries, no network**. Day/night and rain are child toggles and
never affect a reward. The Friends book «Мачке пријатељи» shows met cats only (no silhouettes, no counts).

## Where

- Engine: `game/games/cat_forest.js` (`window.startCatForest`, sets `window.__catForest`)
- Page: `game/pages/cat_forest.html` · Registry: `game/data/app-registry.js` (`cat_forest`,
  `screenshot:false`, `offline:true`, `toddler:true`, `hubOrder:12`) · Title: `game/data/serbian.js`
- Smoke: `tools/cat_forest_smoke.js` · Review: `resources/General_reviews/Cat_Forest/`

## Constants and data (the only place to tune)

Every tunable is `CF` at the top of the engine (`PLATES:3`, `MAX_CATS:3`, arrive/enter/sit/eat/leave
windows, `GIFT_CAP:5`, `DECOR_MAX:14`, `RAIN_DROPS:24`, `PARTICLE_CAP:12`, `DROP_PAD:24`,
`DRAG_START_PX:8`, `DT_CLAMP_MS:100`, `STEP_MS:50`). Do not copy the numbers into prose — read `CF`.
Data lists are `TREATS` (🐟🥛🍗🍣🍪), `CATS` (10; each has `likes`, `weight`, optional `acc`,
`fallbackEmoji`, `night`, `needsAllPlates`) and `GIFTS` (🌸🌷🍄🍀🦋).

## Adding a cat or a treat (data-only)

1. Append one row to `TREATS` or `CATS` in `cat_forest.js` — ASCII `id`, emoji, approved Cyrillic
   `name`, and for a cat `likes`/`weight` plus any optional flags. Nothing else changes.
2. Add a smoke assertion for the new row if it carries new behaviour; keep `CF` untouched unless tuning.
3. `node tools/cat_forest_smoke.js`, then `bash tools/sync-docs.sh` (docs/ mirrors `game/`).

## Test hook (`window.__catForest`, TD §8) — the engine never reads it

`state()` snapshot · `seed(n)` deterministic RNG · `rand(n)` · `pause()` / `step(ms)` (game clock;
`pause` is the harness rAF gate) · `place(treat, plate)` · `forceCat(id, plate)` · `pick(...)` ·
`previewPick()` · `setTime()` / `setWeather()` · `reset()` · `openBook()` / `closeBook()` ·
`data {treats, cats, gifts}`.
Determinism recipe used by the smoke and by `tools/visual-states.json` `PLAY`: `seed(7)` →
`place('fish', 0)` → poll `step(50)` until a cat is `sitting` (it is `sitting` only ~5350–6250 ms,
so a fixed long step overshoots to an empty stage).

## Wiring and persistence

Plate states are `empty` → `treat` (placed) → `occupied` (cat seated); never `filled`.
Speech goes through `window.audioBuses.speakWithDuck`/`window.speech` and is best-effort (R3) — the
game is fully playable silently. Save is one key `catForestSave` = `{v:1, met:[ids], decor:[{e,s}]}`;
cats on stage, plates, selection, clock and weather are transient by design. `parent.html`'s existing
reset clears it. `state.book` freezes `step()` and the rAF `frame()` while the book is open;
`render()` always runs.

## Gotchas

- Reduced motion (the owner's tablet reports `reduce:ON`) is a primary path: decorative effects off,
  essential motion kept. Assert with `bootEmulated`, not the host default.
- Foil the hook instead of the DOM when asserting engine behaviour; keep assertions on behaviour, not
  source literals (R8). Philosophy is guarded by `failWords`/`metricWords`/`timerApis` on
  comments-stripped sources plus a live-DOM wordless scan (CF-16).
- `screenshot:false` is deliberate (D10) until baselines are approved.
