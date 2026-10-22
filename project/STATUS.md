# Petrin svet — Status

*Overwrite this file at the end of every session (never append). Budget: 6 KB, checked by `node tools/check_docs.js`.*

**Last updated:** 2026-10-22 · **App version:** 2.4.0 (`game/manifest.json`) · **Repository:** https://github.com/radmanmilos/Games-for-kids

## Where we are

- **Мачја шума (Cat Forest) 2.4.0 shipped** — commit `9a4af99`, CI **39491259589** green. CF-00…CF-21 (tasks 261–283) DONE/archived. The reference-app "look & feel" phase is **parked at the user's request** — do not start it; when resumed it stays art/animation/ambience/polish only. **CF-22 (real-device play-test of 2.4.0) remains and belongs to the user.**
- **Tasks 284–286 DONE (2026-10-21)** — racing3d steering, smoke hardening, de-flake. Logs: `tools/.cache/task28[4-6]-validation.md`.
- **Task 287 DONE (2026-10-22, OpenCode/Big Pickle)** — Asset Generation pipeline + the `animal-bird` candidate. Free-tier image path (**Cloudflare Workers AI, FLUX.2 multi-reference**) that sends the approved bundle as style references. New tools in `tools/`: `lib/png.js` (dependency-free PNG codec + stats), `lib/imagefile.js` (magic-byte sniffer + JPEG→PNG — the endpoint returns JPEG whatever the file name says), `asset_qa.js`, `asset_refpool.js`, `asset_generate.js`. The bird was generated twice — iteration 1 rejected as **too chick-like**, iteration 2 approved. Credentials live in the git-ignored `tools/vendor/`; **runtime integration is a separate, later task.**
- **Task 288 DONE (2026-10-22, OpenCode/Big Pickle)** — the `animal-rooster` candidate + the bundle audit. `rooster.png` (references bear + star + chicken) measured 1024x1024, opaque, subject 163.7/121.9/97.6, palette-match 0.5042 vs the bear — **the user approved it** after a side-by-side review with `chicken.png`/`chick.png`; the row is `GENERATED / USER-APPROVED` and it joined the exemplar index in `STYLE_BIBLE.md` §18.4. The audit fixed **11 stale `REVIEW` rows** whose `.png` already existed + 3 status spellings. Pushed, CI green.
- **Archived through task 288.** Next task number: **290**.
- **Pages gated on CI (task 274):** CI's `pages` job publishes `docs/` only from a green push on `main`.
- **Asset Generation project - active, Phase 1 (inventory/approval).** Bundle `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/`: **23 files** - 22 user-approved (25 rows) + the **egg candidate** in review (task 289). Known defects: `pig.png` is washed out; seven small files (165-305 px) are rasterised emoji, not painted family. The rooster (🐓) has its own painted picture, distinct from the hen; the egg (🥚) completes two sequences (`sequencing.js:26` and `:46`).

## Candidate next work (the user decides; do not start without asking)

1. **CF-22 play-test rounds** on the real tablet (Cat Forest TP §6 protocol; tune only `CF` constants/CSS/data) — the remaining Cat Forest phase.
2. **Next Asset Generation candidate** — the egg 🥚 is in review (task 289); after it the wash sequence 💧/🧼 (`object-water-drop`, `object-soap`) — both glyphs are live in `sequencing.js` and neither has a picture. One subject per round; the user reviews each candidate.
3. **Runtime integration of the approved assets** (copy into `game/assets/images/`, swap the glyphs, smokes, screenshots) — a bigger step, not started.
4. **"Tier A" learning content** from the finished roadmaps in `archive/plans/` (see `project/reference/LEARNING_ROADMAP_REVIEW.md`).
5. **Cat Forest "look & feel toward Secret Cat Forest"** — **parked by the user** ("we will come back for that later"). No spec until resumed; art/animation/ambience/polish only.
6. **Live play-test of 2.4.0** on a real device (unified nav bubble, bigger triangles, racing3D flowers-only HUD, tracing one-back, repaired fastcat 🌍 icon, new portrait steering geometry); force-refresh may be needed for the cached shell.
7. **racing3d tuning** — levers in `game/games/racing3d.mjs` (`bankMax`, `LATERAL_GAIN`, `inRate`/`outRate`, `bobY`, `camPull`/`camRise`).
8. **Optional deeper gates if ever needed:** `tools/play_matrix.mjs` (chromium+webkit viewports), `tools/axe_check.js` (axe-core).

## Validate (details: `AGENTS.md`)

`node tools/check_fast.js` (read-only, ~9 s) → `node tools/run_all.js --game <name>` / `--since HEAD` → `node tools/check_release.js` before a release. Smokes need Chrome (`CHROME_PATH`); racing3d needs WebGL (this host has none, so its WebGL battery is skipped locally and covered by CI). **Host caveats:** the sandbox kills long single runs (use `run_all.js --concurrency 2 --resume`), and writes under `tools/.cache/`/the tree can be silently lost between shell calls — re-read after writing. This host reports `prefers-reduced-motion: reduce`; **tasks 284–286 removed every assertion that depended on that or on host timing** (fastcat/animals/rhythm pin the media; racing3d pins its clock via `setClock`; seven smokes now wait on a render artifact, not script load).

## Rules of the road

- `game/` changes ⇒ **`node tools/build_offline.js` FIRST, then** `tools/sync-docs.sh` (the manifest/pages are hashed; the wrong order leaves `docs/offline-manifest.json` stale and `validate_generated` fails), **and refresh the affected review screenshots**. Never edit `docs/` by hand.
- **Cat Forest delivery (D11 amended 2026-10-19):** after each card/bundle is DONE and gates are green, the AI commits and pushes to `main` and verifies CI; never continue on red or dirty. (2.4.0 was handed off uncommitted and then committed at the user's request — `9a4af99`.)
- **Never commit the Cloudflare credentials** (`tools/vendor/` is git-ignored) and never push to `main` without the user asking.
- Before touching a risky area read its lesson file: see the table in `AGENTS.md` (`project/lessons/`).
- Locked decisions: `project/DECISIONS.md`. Process: `project/PROCESS.md`.
- Older session logs: `archive/handover/`.
