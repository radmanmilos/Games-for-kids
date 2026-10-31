# Petrin svet — Status

*Overwrite this file at the end of every session (never append). Budget: 6 KB, checked by `node tools/check_docs.js`.*

**Last updated:** 2026-10-31 **App version:** 2.4.0 (`game/manifest.json`) **Repository:** https://github.com/radmanmilos/Games-for-kids

## Where we are

- **Cat Forest 2.4.0 shipped** — commit `9a4af99`, CI green. Tasks 261-283 (CF-00-CF-21) DONE/archived. CF-22 (real-device play-test) remains and belongs to the user. The "look & feel" phase is parked at the user's request.
- **Tasks 284-294 DONE** (racing3d steering, smoke hardening, de-flake, asset pipeline, resolution pass, asset bundle reconciliation through cactus/parrot handoff).
- **Task 295 DONE** (housekeeping: harness scratch localized, 3 new tools, bundle↔inventory repaired, 131 PNGs, 0 problems).
- **Task 296 DONE** (production assets): 155 approved masters cut to 512×512 WebP (q85) via `tools/cutout.py` with overrides (4 classical, 6 excluded). Copied to `game/assets/art/` (155 files). Generated `game/data/art-registry.js` (125 glyph→stem) and `game/shared/art.js` (helper, emoji fallback; Node test 8/8). Updated `sw-cache-list.json` (417) + `offline-manifest.json` (416). `sync-docs.sh` mirrored game/→docs/. `check_fast` 8/8 green. Decisions recorded in `DECISIONS.md` (WebP q85, Cat Forest painted art allowed, 13.4" tablet, merges confirmed, 5 pending rows approved as-is). Runtime game migration (209 textContent sites) deferred to follow-up.
- **Pages gated on CI (task 274):** CI's `pages` job publishes `docs/` only from a green push on `main`.

## Asset generation

- Production art: **155 WebP** under `game/assets/art/` (and `docs/assets/art/`), traced to approved masters in `resources/.../assets_work_in_progress_bundle/` (1024² PNG masters retained).
- 6 masters excluded as non-cut-outs (night-sky, sunrise, sunset, galaxy, sun, cards-pattern) — ship as opaque images/CSS per pipeline spec.
- Inventory: 180 rows. 5 previously pending (butterfly, soap, acorn, sunflower, mushroom) approved as-is.
- Shared helper `game/shared/art.js` + registry `game/data/art-registry.js` ready; game migration pending.
- Next: runtime migration of the 16 data-driven games + 9 canvas files + Cat Forest (separate task).

## Validate

- `node tools/check_fast.js` — **8/8 green** on 2026-10-31.
- `node tools/audit_bundle.js` — PROBLEMS (0), exit 0 (last run task 295).

## Next steps

1. Runtime migration: wire `Art.html/fill/draw` into the 16 data-driven games by occurrence count, then 9 canvas files, then Cat Forest.
2. CF-22 (real-device play-test) belongs to the user.
3. User visual review of the 5 previously-pending candidates is now folded into the shipped WebPs.

## Rules of the road

- `game/` changes → `node tools/build_offline.js` FIRST, then `tools/sync-docs.sh`, then refresh affected review screenshots. Never edit `docs/` by hand.
- Never commit Cloudflare credentials (`tools/vendor/` is git-ignored). Never push to `main` without the user asking.
- Keep `resources/` and `tools/` for dev assets and tooling; `game/` must stay deployable-only.
- Runtime scratch goes under git-ignored `tools/.cache/`, never system temp (task 295).
- Before touching a risky area read its lesson file (table in `AGENTS.md`). Locked decisions: `project/DECISIONS.md`. Process: `project/PROCESS.md`.
