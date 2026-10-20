# Petrin svet — Status

*Overwrite this file at the end of every session (never append). Budget: 6 KB, checked by `node tools/check_docs.js`.*

**Last updated:** 2026-10-20 · **App version:** 2.3.4 (`game/manifest.json`; Cat Forest ships 2.4.0 at CF-21)
**Repository:** https://github.com/radmanmilos/Games-for-kids

## Where we are

- **Мачја шума (Cat Forest) — building.** The approved plan package lives at `resources/General_reviews/Cat_Forest/` (ledger: its `PROGRESS.md`; cards: its `03_TASKS.md`). **Done:** task 261 = CF-00 (governance baseline) · 262 = CF-01 (page shell + registry + hub tile) · 263 = CF-02 (smoke skeleton) · 264 = CF-03 (static stage; 3-viewport geometry; 42 checks) · 265 = CF-04 (engine core: `CF` constants, seedable RNG, integer-ms clock frozen while hidden, `state`, `render()`, TD §8 hook; 51 checks) · 266 = CF-05 (treat selection + placement + picture-only hints; 62 checks) · 267 = CF-06 (cat/treat/gift data + weighted picker with a non-null fallback; 68 checks) · 268 = CF-07 (cat actor lifecycle: spawn on arrival, enter/sit/eat/leave on the game clock, `state.met`, plate frees at end of eating; 87 checks) · 269 = CF-08 (gift per finished visit, tap → logic-driven flight to a shuffled decor slot, `.cf-decor-item` capped at 14, ✨ particles capped at 12, `#cf-gifts`/`#cf-fx` layers; reduced motion skips the flight; 94 checks) · 270 = CF-09 (cuddle tap: hearts as CSS `content` via the new `spawnFx`, meow `playAnimalSound('Cat')`, spoken name, first-sit ✨ burst; throttles are module stamps on the game clock so a cuddle changes **no** `state` field; 103 checks). Every card closed with `check_fast` 8/8, `run_all --game cat_forest`, `validate_pages` 26 OK, `offline_smoke` 25/25 and all 6 guards exit 0; CI green on `2cccadb` (CF-07) and earlier. **Next: task 271 = CF-10** (special rules + idle hint), then CF-11 (day/night toggle). Delivery: after each done card/bundle the AI commits+pushes to `main` and verifies CI (D11 amended 2026-10-19); `ACTIVE.md` stays lean with pointers to the package. Engine facts to remember: emoji are CSS `content` (never text nodes — the no-visible-text guard reads `body.innerText`); all picture hints, the walking bob, the gift flight and the particle fades are `state`/game-clock-driven (no `setInterval`, no CSS infinite animation — hub_smoke V21 allows exactly six justified loops; the only new keyframes are one-shot opacity fades); every random draw goes through `rnd()` (seeded) except the fixed decor-slot shuffle (local seed 1337) and the fixed particle anchors (so a tap never disturbs a seeded run); `pickCat` never returns null; `audio.js` keys a capitalized (`'Cat'`, not `'cat'`) or a mismatch silently degrades to `popSound`. Test harness note: headless Chrome defaults `prefers-reduced-motion: reduce`, so reduced-motion paths need `Emulation.setEmulatedMedia` + a reload to exercise the other branch.
- **Tasks 258–270 archived (2026-10-19/20):** UI consistency round 2 (2.3.3) · fastcat malformed-SVG fix (2.3.4) · harness hardening · Cat Forest CF-00…CF-09. CI queue on 2026-10-19 ran 15–30 min per push (full smoke matrix), so each card's push was verified before the next commit.
- **Asset Generation project — active, Phase 1 (inventory/approval).** Test-batch PNGs under `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/`: bone and elephant (approved), **lion (user-accepted)** and **frog (candidate, technical QA pending)**. Nothing integrated at runtime.

## Candidate next work (the user decides; do not start without asking)

0. **Cat Forest CF-10 (task 271)** then CF-11… — see the package; the AI continues card by card unless a decision is needed.
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
