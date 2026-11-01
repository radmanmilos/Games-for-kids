# Petrin svet — Status

*Overwrite this file at the end of every session (never append). Budget: 6 KB, checked by `node tools/check_docs.js`.*

**Last updated:** 2026-11-01 **App version:** 2.7.0 (`game/manifest.json`) **Repository:** https://github.com/radmanmilos/Games-for-kids

## Where we are

- **Art migration is essentially complete.** Every emoji render site in `game/` now paints through the shared `Art` helper (`game/shared/art.js`):
  - `Art.fill(el, g, cls)` — textContent sites → `<img class="art">` with `dataset.emoji` set (12 games + shared/celebration.js + compare/kids_games/animal_memory/maze/piano)
  - `Art.fillAttr(el, attr, g, cls)` — CSS `::before{content:attr(data-e)}` sites (Cat Forest: cats, gifts, decor, flies, fx, plates, plate-treats, treats, trees, stars, book cats; 19 CSS sites converted in `cat_forest.html`)
  - `Art.draw(ctx, g, x, y, size)` — canvas fillText sites (adventure, adventure-modes, kitty-standalone, animal_puzzle, fastcat)
  - `Art.html(g, cls)` — HTML-string sites (kids_games tiles, animal_memory card fronts)
- **Deliberately left as opaque textContent** (no art stem exists): the excluded family ⭐ 🎉 🌵 🌙 ☀️ 🌧️ 📖 ✖️ 🐾 ✨ 🐚 ⛏ ❄ 📊 📥 🔄 🗑 🔊, plus static Serbian labels.
- **`Art.url()` returns null for unregistered glyphs** → `Art.html()` emits the escaped glyph, so `data/serbian.js` emoji fields need no change (T317).
- **`racing3d.mjs` decor billboards** keep `fillText`: the emoji is rendered to a 128×128 canvas then wrapped in a `THREE.CanvasTexture`, so `Art.draw`'s drawImage path is not usable there (T308/T318).
- **Committed:** `7b731cb` (T305 smoke fixes), `48d9099` (T301-T302 Cat Forest + 2.7.0), `0ca3c0e` (T306-T310 canvas), `248435c` (T312-T314). All pushed to `main`; CI green.
- **Cat Forest smoke:** 192 checks, 0 fail. `check_fast` 8/8 green. Full screenshot battery (108 shots) refreshed under `resources/General_reviews/Screenshot_Review/` (tasks 302, 310).
- **Tasks 298-305, 312-319 DONE/archived.** Remaining: T320-T325 (audit remaining sites, verify WebP coverage, bump 3.0.0 + full battery, final docs/DECISIONS).

## Asset generation

- Production art: **155 WebP** under `game/assets/art/` (and `docs/assets/art/`).
- `game/data/art-registry.js` — 125 + 12 (Cat Forest) = **137 glyph→stem** entries.
- `game/shared/art.js` — `url`, `html`, `fill`, `fillAttr`, `image`, `draw`, `_BASE`. `fillAttr` keeps the attribute intact so CSS `::before` and `getAttribute(attr)` both still work.

## Validate

- `node tools/check_fast.js` — **8/8 green** on 2026-11-01.
- All affected smokes pass: animals, spatial, maze, piano, fastcat, cat_forest, compare, animal_memory.

## Next steps

1. T320-T322: audit remaining emoji render sites, document exceptions, verify every registered glyph has a WebP.
2. T323-T325: bump to 3.0.0, full battery (`check_release` + `play_matrix` + `axe`), full screenshot battery, archive, update `DECISIONS.md`.

## Rules of the road

- `game/` changes → `node tools/build_offline.js` FIRST, then `tools/sync-docs.sh`, then refresh affected review screenshots. Never edit `docs/` by hand.
- Never commit Cloudflare credentials (`tools/vendor/` is git-ignored). Never push to `main` without the user asking.
- Keep `resources/` and `tools/` for dev assets and tooling; `game/` must stay deployable-only.
- Runtime scratch goes under git-ignored `tools/.cache/`, never system temp.
- Before touching a risky area read its lesson file (table in `AGENTS.md`). Locked decisions: `project/DECISIONS.md`. Process: `project/PROCESS.md`.
- **Tests must be updated to follow implementation changes** — when the rendered output changes, the assertions that read it are stale and must be updated in the same change (`project/lessons/testing-harness.md`, T305).