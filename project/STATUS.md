# Petrin svet — Status

*Overwrite this file at the end of every session (never append). Budget: 6 KB, checked by `node tools/check_docs.js`.*

**Last updated:** 2026-10-30 A **App version:** 2.4.0 (`game/manifest.json`) A **Repository:** https://github.com/radmanmilos/Games-for-kids

## Where we are

- **Cat Forest 2.4.0 shipped** — commit `9a4af99`, CI green. Tasks 261-283 (CF-00-CF-21) DONE/archived. CF-22 (real-device play-test) remains and belongs to the user. The "look & feel" phase is parked at the user's request.
- **Tasks 284-294 DONE** (racing3d steering, smoke hardening, de-flake, asset pipeline, resolution pass, asset bundle reconciliation through cactus/parrot handoff).
- **Task 295 IN PROGRESS** — housekeeping: harness scratch localized to `tools/.cache/chrome` (sweep + close grace), 3 new tools (`scan_glyphs.js`, `asset_inspect.js`, `audit_bundle.js`), bundle↔inventory repaired (131 PNGs, 0 problems), glyph gap analysis (30 illustration candidates), `%TEMP%` cleaned (2050 leaked Chrome profiles removed), docs/lessons updated. CI green: `63fb8dd..2ea4d6d` pushed, runs `41049440291` / `41049455424` / `41049439668` all success.
- **Pages gated on CI (task 274):** CI's `pages` job publishes `docs/` only from a green push on `main`.

## Asset generation

- WIP bundle: **131 PNGs** under `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/`.
- Inventory: 180 rows, 37 rows without a file, 30 illustration candidates (Cat Forest 14, ocean 6, dino 1, hibiscus 1, puzzle 4, Kitty 2, maze 2), 20 glyphs already covered by existing PNGs.
- Next asset: `parrot.png` (prompt at `.../prompts/parrot.md`, refs `bear.png`/`star.png`/`bird.png`). No runtime integration yet.

## Validate

- `node tools/check_fast.js` — **8/8 green** on 2026-10-30.
- Full battery — **36/36 tools, 1306 checks, 0 fail** (`tools/.cache/run295-full.log`, 486 s).
- `node tools/audit_bundle.js` — PROBLEMS (0), exit 0.

## Next steps

1. Close task 295: mark DONE in `ACTIVE.md`, commit + push, `node tools/archive_tasks.js`.
2. Continue the asset pipeline one asset at a time (parrot first), then runtime integration of approved assets.
3. User visual review of measured candidates (`soap`, `sunflower`, `butterfly`, `acorn`, `mushroom`, `egg`).

## Rules of the road

- `game/` changes → `node tools/build_offline.js` FIRST, then `tools/sync-docs.sh`, then refresh affected review screenshots. Never edit `docs/` by hand.
- Never commit Cloudflare credentials (`tools/vendor/` is git-ignored). Never push to `main` without the user asking.
- Keep `resources/` and `tools/` for dev assets and tooling; `game/` must stay deployable-only.
- Runtime scratch goes under git-ignored `tools/.cache/`, never system temp (task 295).
- Before touching a risky area read its lesson file (table in `AGENTS.md`). Locked decisions: `project/DECISIONS.md`. Process: `project/PROCESS.md`.
