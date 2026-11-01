# Petrin svet — Status

*Overwrite this file at the end of every session (never append). Budget: 6 KB, checked by `node tools/check_docs.js`.*

**Last updated:** 2026-11-01 **App version:** 3.0.0 (`game/manifest.json`) **Repository:** https://github.com/radmanmilos/Games-for-kids

## Where we are

- **Art migration complete (3.0.0).** Every emoji render site in `game/` now paints through the shared `Art` helper (`game/shared/art.js`): `Art.fill` (textContent), `Art.fillAttr` (CSS `::before`), `Art.draw` (canvas), `Art.html` (HTML strings). Emoji is the universal fallback; `Art.url()` returns null for unregistered glyphs.
- **Registered-glyph coverage is a hard-fail guard** in `tools/validate_pages.js` (registry/metadata stage): 138 glyphs / 134 stems, all present in `game/assets/art/` (155 WebPs); 21 orphans warn (non-fatal).
- **Exceptions documented** in `project/reference/emoji-audit.md`: hub/nav tile icons, shell chrome, composite sentence/HUD text, hidden legacy nodes, data fields, unregistered glyphs. Hub/nav migration parked as task 328 (user input).
- **Committed/pushed:** `cea2591` (T322+T323), `5b3a0f7` (T321), `3e08757` (T327), `ad6caf5` (T326). CI green.
- **check_release green** (release gate + whole battery), play_matrix 270 passed / 0 failed / 0 skipped, axe_check clean (0 serious/critical), check_fast 8/8 green.
- **Full screenshot battery** (108 shots) refreshed under `resources/General_reviews/Screenshot_Review/`.
- **Tasks 298-325 DONE/archived.** Remaining: 328 (deferred, user input).

## Asset generation

- Production art: **155 WebP** under `game/assets/art/`.
- `game/data/art-registry.js` — **138 glyph→stem** entries.
- `game/shared/art.js` — `url`, `html`, `fill`, `fillAttr`, `image`, `draw`, `_BASE`.

## Validate

- `node tools/check_fast.js` — **8/8 green**.
- `node tools/check_release.js` — release gate green.
- All affected smokes pass.

## Rules of the road

- `game/` changes → `node tools/build_offline.js` FIRST, then `tools/sync-docs.sh`, then refresh affected review screenshots. Never edit `docs/` by hand.
- Never commit Cloudflare credentials (`tools/vendor/` is git-ignored). Never push to `main` without the user asking.
- Keep `resources/` and `tools/` for dev assets and tooling; `game/` must stay deployable-only.
- Runtime scratch goes under git-ignored `tools/.cache/`, never system temp.
- Before touching a risky area read its lesson file (table in `AGENTS.md`). Locked decisions: `project/DECISIONS.md`. Process: `project/PROCESS.md`.
- **Tests must be updated to follow implementation changes.**
