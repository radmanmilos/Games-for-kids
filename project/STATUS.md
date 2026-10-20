# Petrin svet — Status

*Overwrite this file at the end of every session (never append). Budget: 6 KB, checked by `node tools/check_docs.js`.*

**Last updated:** 2026-10-20 · **App version:** 2.3.4 (`game/manifest.json`; Cat Forest ships 2.4.0 at CF-21)**Repository:** https://github.com/radmanmilos/Games-for-kids

## Where we are

- **Мачја шума (Cat Forest) — building.** The approved plan package lives at `resources/General_reviews/Cat_Forest/` (ledger: its `PROGRESS.md`; cards: its `03_TASKS.md`). **Done:** task 261 = CF-00 (governance baseline) · 262 = CF-01 (page shell + registry + hub tile) · 263 = CF-02 (smoke skeleton) · 264 = CF-03 (static stage; 3-viewport geometry; 42 checks) · 265 = CF-04 (engine core: constants, seedable RNG, clock frozen while hidden, state/render, TD §8 hook; 51 checks) · 266 = CF-05 (treat selection + placement + picture-only hints; 62 checks) · 267 = CF-06 (cat/treat/gift data + weighted picker with a non-null fallback; 68 checks) · 268 = CF-07 (cat actor lifecycle: spawn on arrival, enter/sit/eat/leave on the game clock, `state.met`, plate frees at end of eating; 87 checks) · 269 = CF-08 (gift per visit → logic-driven flight to a decor slot, `.cf-decor-item` cap 14, ✨ cap 12, `#cf-gifts`/`#cf-fx` layers; reduce skips the flight; 94 checks) · 270 = CF-09 (cuddle tap: hearts via `spawnFx`, meow, spoken name, first-sit ✨ burst; throttles are game-clock stamps — a cuddle changes **no** `state`; 103 checks) · 271 = CF-10 (first-visit nicety, `previewPick`/`setTime` hooks via a shared `pickArgs`, suppressed idle hint, boot prompt «Нахрани мачиће!»; 119 checks) · 272 = CF-11 (day/night toggle on `setTime` + `sweep` swish; night = three `data-time` opacity layers; 131 checks) · 273 = CF-12 (rain via `setWeather`/`renderRain` — 24 deterministic `cf-drop` drops; reduce audit pinned; V21 allowlist += `cf-drop`; alert #11/issue #7 folded in via `codeArg`; 148 checks) · 275 = CF-13 (drag-and-drop: pointer gesture with an inert ghost clone, `CF.DRAG_START_PX` keeps taps as taps, `CF.DROP_PAD` plate highlight, drop = the same `place()` path, miss = `transitionend` glide with no engine timers, trailing click suppressed; 163 checks) · **276 = CF-14 (persistence, D4: one `catForestSave` key `{v:1,met,decor}`, validated load at boot in try/catch — unknown ids dropped, bad emoji/slot dropped, decor clamped to 14, wrong version/shape → fresh, never throws; saved on a cat's first sit and on a decoration landing, never in the render loop; `reset()` hook clears state + storage; `parent.html` untouched because its reset is `localStorage.clear()`; 175 checks)**. Every card closed with `check_fast` 8/8, `run_all --game cat_forest`, `offline_smoke` 25/25 and all 6 guards exit 0. **Bundle:** 271+272 shipped as `0ab8562`; the ledger has records. **Next: task 276 = CF-14** (persistence save/load/reset, D4 approved). Delivery: after each done card/bundle the AI commits+pushes to `main` and verifies CI; never continue on red or dirty.
- **Tasks 258–275 archived (2026-10-19/20):** UI consistency round 2 (2.3.3) · fastcat malformed-SVG fix (2.3.4) · harness hardening · Cat Forest CF-00…CF-13 (task 276 / CF-14 leaves this session and archives next).
- **Pages gated on CI (task 274, 2026-10-20):** build type switched to GitHub Actions; CI's `pages` job publishes `docs/` only from a green push on `main` (waits on every gate; `validate_workflow.js` 17→21 checks); the old ungated publisher is retired.
- **Asset Generation project — active, Phase 1 (inventory/approval).** Test-batch PNGs under `resources/General_reviews/Asset_Generation/`: bone and elephant (approved), **lion (user-accepted)**, **frog (QA pending)**. Nothing integrated at runtime.

## Candidate next work (the user decides; do not start without asking)

0. **Cat Forest CF-15 (task 277, «Мачке пријатељи» book)** then CF-16… — see the package; the AI continues card by card unless a decision is needed. CF-14 (task 276) is delivered and committed.
1. **Live play-test of 2.3.4** on a real device (unified nav bubble, bigger triangles, racing3D flowers-only HUD, tracing one-back, repaired fastcat 🌍 icon). Force-refresh may be needed for the cached shell.
2. **racing3d tuning** — levers in `game/games/racing3d.mjs` (`bankMax`, `LATERAL_GAIN`, `inRate`/`outRate`, `bobY`, `camPull`/`camRise`).
3. **"Tier A" learning content** from the finished roadmaps in `archive/plans/` (see `project/reference/LEARNING_ROADMAP_REVIEW.md`).

## Validate (details: `AGENTS.md`)

`node tools/check_fast.js` (read-only, ~9 s) → `node tools/run_all.js --game <name>` / `--since HEAD` → `node tools/check_release.js` before a release. Smokes need Chrome (`CHROME_PATH`); racing3d needs WebGL (this host has none, so its WebGL battery is skipped locally and covered by CI). **Host caveats:** the sandbox kills long single runs (use `run_all.js --concurrency 2 --resume` for the battery), and newly created files under `tools/.cache/` and some working-tree writes can be silently lost between shell calls — re-read after writing.

## Rules of the road

- `game/` changes ⇒ run `tools/sync-docs.sh` **and** `node tools/build_offline.js` when assets/pages change (the offline inventory hashes real bytes) **and refresh the affected review screenshots**. Never edit `docs/` by hand. Cat Forest's `game/manifest.json` bump is deferred to CF-21 (2.3.4 → 2.4.0) per the approved ROADMAP — recorded in the package ledger.
- **Cat Forest delivery (D11 amended 2026-10-19):** after each card/bundle is DONE and gates are green, the AI commits and pushes to `main` and verifies CI; never continue on red or dirty.
- Before touching a risky area read its lesson file: see the table in `AGENTS.md` (`project/lessons/`).
- Locked decisions: `project/DECISIONS.md`. Process: `project/PROCESS.md`.
- Older session logs: `archive/handover/`.
