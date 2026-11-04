# Petrin svet — Status

*Overwrite this file at the end of every session (never append). Budget: 6 KB, checked by `node tools/check_docs.js`.*

**Last updated:** 2026-11-04 **App version:** 3.0.1 (`game/manifest.json`) **Repository:** https://github.com/radmanmilos/Games-for-kids **Branch:** `main`

## Where we are

- **All five art-audit tasks (358–362) shipped and pushed to main.**
  - 358 Art integrity: 6 opaque PNGs-as-WebP fixed (shark/sun re-cut, crab/octopus remapped, sunrise/sunset moved to scenes/), 18 dangling illustrations registered, U+FE0F root cause fixed, `tools/asset_cutout.js` added.
  - 359 Painted art on last emoji surfaces: hub, classroom/tracing buttons, animal_memory card back, racing3d decor + world cards.
  - 360 Art-integrity gate: `tools/check_art.js` wired into `check_fast` (10 stages, all green).
  - 361 Animal Puzzle: 8 painted scene backgrounds generated and wired with gradient fallback.
  - 362 Orphans closed (card-stack/meteor/puddle deleted); 5 glyphs accepted as emoji.
- Art payload: 154 glyph WebPs, 154 registry stems, 0 orphans, 0 warnings.
- Git: clean tree, in sync with origin/main.

## Open tasks

- **328** DEFERRED — hub/nav tile icons and shell-chrome glyphs; needs a user decision (see `DECISIONS.md`).

## Validate

- `node tools/check_fast.js` — 10/10 green.
- `node tools/check_art.js` — 0 failures, 0 warnings.
- `node tools/check_release.js` — release gate before a release.

## Rules of the road

- `game/` changes → `node tools/build_offline.js` FIRST, then `tools/sync-docs.sh`, then refresh affected review screenshots.
- Never commit Cloudflare credentials. Never push to `main` without the user asking.
- Keep `resources/` and `tools/` for dev assets and tooling; `game/` must stay deployable-only.
- Runtime scratch goes under git-ignored `tools/.cache/`, never system temp.
- **Tests must be updated to follow implementation changes.**
