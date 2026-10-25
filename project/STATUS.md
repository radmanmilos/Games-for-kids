# Petrin svet — Status

*Overwrite this file at the end of every session (never append). Budget: 6 KB, checked by `node tools/check_docs.js`.*

**Last updated:** 2026-10-25 · **App version:** 2.4.0 (`game/manifest.json`) · **Repository:** https://github.com/radmanmilos/Games-for-kids

## Where we are

- **Мачја шума (Cat Forest) 2.4.0 shipped** — commit `9a4af99`, CI `39491259589` green. CF-00…CF-21 (tasks 261–283) DONE/archived. The reference-app "look & feel" phase is parked at the user's request. **CF-22 (real-device play-test of 2.4.0) remains and belongs to the user.**
- **Tasks 284–286 DONE (2026-10-21)** — racing3d steering, smoke hardening, de-flake.
- **Task 287 DONE (2026-10-22, OpenCode/Big Pickle)** — Asset Generation pipeline and the `animal-bird` candidate.
- **Task 288 DONE (2026-10-22, OpenCode/Big Pickle)** — `animal-rooster` candidate and bundle audit; rooster user-approved. See task archive and asset-generation docs.
- **Task 289 IN PROGRESS** — asset-bundle reconciliation. On 2026-10-25, commit `20e9d5974bb11ee49c2986bc71d1aae73d8b3947` added `acorn.png` to `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/`. The bundle now contains 28 PNGs. The inventory records acorn as a candidate; technical QA and user review are still pending. Egg remains a candidate awaiting user review; soap, sunflower, and butterfly also have pending QA/review records.
- **Pages gated on CI (task 274):** CI's `pages` job publishes `docs/` only from a green push on `main`.

## Asset-generation next steps

1. **Acorn (`object-acorn`):** committed to WIP bundle; inventory synchronized in this documentation update. Technical QA (dimensions, file size, actual alpha/background, silhouette, small-size legibility, edge quality) and user review remain unrecorded. No runtime integration.
2. **Next candidate to investigate: mushroom (`object-mushroom`).** Inventory links it to the forest scene in `game/games/animal_puzzle.js` and a Kitty collectible. Before generation, inspect the full repository visual-file tree for reusable artwork and confirm the Kitty render path and display scale. GitHub filename/code search alone has not proved the image is absent everywhere.
3. **Runtime integration of approved assets** is a separate future task: copy only approved assets to `game/assets/images/`, replace the appropriate glyph render sites, run relevant smokes, rebuild offline artifacts, sync docs, and refresh affected screenshots.

## Validate

Use `node tools/check_fast.js` → relevant `node tools/run_all.js --game <name>` / `--since HEAD` → `node tools/check_release.js` before release. No game source changed in this asset-documentation pass, so no game tests, screenshot refresh, offline build, or `sync-docs.sh` were run.

## Rules of the road

- `game/` changes ⇒ `node tools/build_offline.js` FIRST, then `tools/sync-docs.sh`, then refresh affected review screenshots. Never edit `docs/` by hand.
- Never commit Cloudflare credentials. Never push to `main` without explicit user authorization; the user explicitly requested commit and push for this task.
- Keep `resources/` and `tools/` for dev assets and tooling; `game/` must stay deployable-only.
