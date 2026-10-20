# Petrin svet — Status

*Overwrite this file at the end of every session (never append). Budget: 6 KB, checked by `node tools/check_docs.js`.*

**Last updated:** 2026-10-20 · **App version:** 2.3.4 (`game/manifest.json`; Cat Forest ships 2.4.0 at CF-21)**Repository:** https://github.com/radmanmilos/Games-for-kids

## Where we are

- **Мачја шума (Cat Forest) — building.** The approved plan package lives at `resources/General_reviews/Cat_Forest/` (ledger: its `PROGRESS.md`; cards: its `03_TASKS.md`). **Done:** task 261 = CF-00 (governance baseline) · 262 = CF-01 (page shell + registry + hub tile) · 263 = CF-02 (smoke skeleton) · 264 = CF-03 (static stage; 3-viewport geometry; 42 checks) · 265 = CF-04 (engine core: constants, seedable RNG, clock frozen while hidden, state/render, TD §8 hook; 51 checks) · 266 = CF-05 (treat selection + placement + picture-only hints; 62 checks) · 267 = CF-06 (cat/treat/gift data + weighted picker; 68 checks) · 268 = CF-07 (cat actor lifecycle: spawn, enter/sit/eat/leave on the game clock, `state.met`; 87 checks) · 269 = CF-08 (gift per visit → decor slot, cap 14; reduce skips the flight; 94 checks) · 270 = CF-09 (cuddle tap: hearts, meow, spoken name, first-sit ✨; 103 checks) · 271 = CF-10 (first-visit nicety, `previewPick`/`setTime`, idle hint, boot prompt; 119 checks) · 272 = CF-11 (day/night toggle; 131 checks) · 273 = CF-12 (rain; V21 allowlist += `cf-drop`; 148 checks) · 275 = CF-13 (drag-and-drop: ghost clone, `DRAG_START_PX`, `DROP_PAD`, drop = same `place()`; 163 checks) · 276 = CF-14 (persistence, D4: one `catForestSave` key `{v:1,met,decor}`, validated load in try/catch, save on first sit + decoration landing, `reset()`; 175 checks) · **277 = CF-15 (friends book, D3: `#cf-friends` 📖 → `#cf-book` modal whose grid is a pure projection of `state.met` — met cats only, one decorative 🐾 when empty, no counts/silhouettes/text, a card tap is the CF-09 cuddle, `state.book` freezes `step`/`tick`, focus → close → 📖, closed by the `hidden` attribute, portrait lift clear of the tray; 188 checks)** · **278 = CF-16 (smoke completeness: all TP §3, 1280×800 in the viewport matrix, TP §4 philosophy guards each with a negative test, polls not sleeps, `offline_smoke` row = real treat interaction; 210 checks)** · **279 = CF-17 (all four repo audits pass, no `game/` fixes: axe 0 violations, touch_interruption 6/0, short-landscape 0 FAIL — 1 WARN accepted, the page is deliberately wordless, play_matrix 270/0 with cat_forest in all 10 combos)**. Every card closed with `check_fast` 8/8, `run_all --game cat_forest`, `offline_smoke` 25/25 and all 6 guards exit 0. **Bundle:** 271+272 shipped as `0ab8562`; the ledger has records. **Next: task 280 = CF-18** (offline + generated artifacts). Delivery: after each done card/bundle the AI commits+pushes to `main` and verifies CI; never continue on red or dirty.
- **Tasks 258–279 archived (2026-10-19/20):** UI consistency round 2 (2.3.3) · fastcat malformed-SVG fix (2.3.4) · harness hardening · Cat Forest CF-00…CF-17.
- **Pages gated on CI (task 274, 2026-10-20):** build type switched to GitHub Actions; CI's `pages` job publishes `docs/` only from a green push on `main` (waits on every gate; `validate_workflow.js` 17→21 checks); the old ungated publisher is retired.
- **Asset Generation project — active, Phase 1 (inventory/approval).** Test-batch PNGs under `resources/General_reviews/Asset_Generation/`: bone and elephant (approved), **lion (user-accepted)**, **frog (QA pending)**. Nothing integrated at runtime.

## Candidate next work (the user decides; do not start without asking)

0. **Cat Forest CF-18 (task 280, offline + generated artifacts)** then CF-19…CF-21 — see `resources/General_reviews/Cat_Forest/03_TASKS.md`; the AI continues card by card unless a decision is needed. CF-17 (task 279) is delivered.
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
