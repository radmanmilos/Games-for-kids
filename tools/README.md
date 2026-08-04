# tools/ — Dev tooling (never deployed)

Headless-Chrome test harnesses and helpers for this project. Everything in here
is dev-only; `game/` stays deployable-only and never requires `tools/` at runtime.

Run any tool from anywhere with `node` (Node >= 22 — uses global `fetch` +
`WebSocket`). No npm install needed. `CHROME_PATH` env overrides the Chrome
binary.

## Files

| File | What it is |
| --- | --- |
| `headless.js` | Shared harness: serves `game/` over HTTP, boots headless Chrome on a **unique temp profile**, returns `{ evalv, navigate, close, port }`. Also exports `check(name, ok, info)` (prints `PASS`/`FAIL`), `sleep`, `getFails()`. Kills only this run's Chrome on `close()` — stale-Chrome profile locks were the historical "Chrome did not start" cause. |
| `tracing_smoke.js` | Canonical validation for the Писање (Tracing) free-draw game — 22 checks: hub, dashed guide present, layout (no ref/caption overlap), pointer drawing, clear, correct А/0/circle accepted, sloppy Б accepted (forgiving), line/scribble/blob rejected, success auto-advance, shape wrap, hub wiring. |
| `tracing_probe.js` | Matching-metric table for threshold tuning. Prints `cov` (guide coverage), `ink`, `ratio`, `near` (fraction of ink within 2 cells of the guide) and the distance histogram `hist` for each good/bad drawing. |
| `dilate_test.js` | Standalone check that the integral-image `dilate()` in `tracing.js` produces a correct symmetric dilation (center/corner/corners cases). |
| `kids_smoke.js` | Validation for the Учионица kids tier (Phase 3, "За децу" quiz games) — 12 checks: two-set hub (4 baby + 4 kids buttons + labels), each of the 4 games renders its screen (title/4 options/1 answer/prompt), numbers prompt shows the countable emoji row, wrong tap nudges without advancing, 8 corrects → finish panel + score, replay restarts, back → hub. |
| `piano_smoke.js` | Validation for the Клавир (Piano) game (Phase 4) — 14 checks: boot, 8 keys render, free-play tap glows, song mode shows "1 од 42" with a single lit C, song picker (3 emoji chips ⭐/🎂/🔔 with aria-label titles + active state), switching to birthday/jingle resets counter + lit key, wrong key nudges + keeps the note, preview button toggles, re-entering song mode resets, 42 correct taps → finish panel, replay restarts, hub route + standalone-boot wiring (static file checks). |
| `driving_smoke.js` | Canonical validation for Возила (Driving, task 60) — 17 checks: boot + engine/theme HUD match, page chrome + background, 10 world configs, 10 music themes (32-step melody / 16-beat bass / root), up/right steering, drive clamps, coin pickup + HUD, obstacle knockback, goal → win modal, next level, worlds picker (10 buttons + jump to world 6), music toggle, hub route + standalone-boot + page wiring (static file checks). |
| `ocean_smoke.js` | Canonical validation for Океан (Ocean, task 61, fly mode) — 20 checks: boot + engine/theme HUD match, page chrome + background, fly controls split into two tablet clusters (left/right pad + up/down pad), 10 world configs, 10 music themes, 4-way steering, fly clamps, coin pickup + HUD, obstacle knockback, patrolling shark (vx flips at maxX and minX), goal → win modal, next level, worlds picker (10 buttons + jump to world 6), music toggle, hub route + standalone-boot + page wiring (static file checks, incl. `heroFlip`/`heroBob` config). |
| `sync-docs.sh` | Publish helper: replaces the ENTIRE `docs/` content with the current `game/` content (GitHub Pages serves main → `/docs`). Run after every change to `game/`, then commit + push to `main`. Bash; run from anywhere in the repo. |

## Commands

```
node tools/dilate_test.js       # visual: r=1 dilation is a 3x3 box
node tools/tracing_probe.js     # metrics table (uses window.__traceDebug)
node tools/tracing_smoke.js     # full game smoke test — expect ALL PASS
node tools/kids_smoke.js        # classroom kids-tier smoke test — expect ALL PASS
node tools/piano_smoke.js       # piano (Клавир) smoke test — expect ALL PASS
node tools/driving_smoke.js     # driving (Возила) smoke test — expect ALL PASS
node tools/ocean_smoke.js       # ocean (Океан) smoke test — expect ALL PASS
bash tools/sync-docs.sh         # mirror game/ -> docs/ for GitHub Pages
```

## Rules / gotchas

- **Deployment:** `game/` is the single source of truth; `docs/` is only the
  published copy. On every change to `game/`, run `tools/sync-docs.sh` (it
  deletes `docs/` and re-copies `game/`) and push to `main`. Never edit
  `docs/` by hand.

- Always test over HTTP, never `file://` — `file://` breaks audio, the kitty
  iframe, and throws Unsafe-attempt warnings. `headless.js` serves `game/`
  automatically.
- Each `start()` uses a fresh unique Chrome profile, so parallel harnesses
  cannot collide; `close()` kills that run's Chrome by profile tag. If a run is
  interrupted and a later run says "Chrome did not start", kill stale Chrome:
  `Get-Process chrome | Where-Object { $_.CommandLine -match 'pkv-' } | Stop-Process -Force`.
- `celebration.js` caches its overlay element in a closure — a harness must hide
  overlays by removing the `.show` class, never by removing the element.
- `window.__adv` (adventure engine debug handle) exposes `cameraX`, `lastHitAt`
  etc. as **getter-only** — assignments silently no-op (and throw in strict
  mode). Reset state with `a.loadWorld()` instead; the obstacle-hit checks must
  wait ≥1100 ms after `loadWorld()` for the `lastHitAt` cooldown to expire.
- `tracing_probe.js` needs the `window.__traceDebug` hook that `tracing.js`
  exposes (`matchResult` / `refGrid` / `inkGrid`) — do not delete it.
- Matching rule to re-verify after touching `tracing.js` constants:
  pass = `coverage >= MIN_COVER && near >= MIN_NEAR && ink <= MAX_INK`, where
  `near` is the fraction of ink cells within 2 grid cells of the guide line.
  Measured separation: genuine traces `near ≈ 0.98–1.0`, blobs/scribbles ≤ 0.70.
