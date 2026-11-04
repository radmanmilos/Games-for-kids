# Petrin svet — Status

*Overwrite this file at the end of every session (never append). Budget: 6 KB, checked by `node tools/check_docs.js`.*

**Last updated:** 2026-11-04 **App version:** 3.0.1 (`game/manifest.json`) **Repository:** https://github.com/radmanmilos/Games-for-kids **Branch:** `main`

## Where we are

- **Task 363 (P0.1) DONE** — art-integrity CI failure diagnosed and fixed: root cause was ffmpeg missing from the ubuntu-24.04 runner (ENOENT with empty stderr). `tools/check_art.js` now probes ffmpeg up front with an actionable message and reports spawnSync diagnostics; `.github/workflows/ci.yml` fast job installs ffmpeg. Follow-up fixes in the same pass: puzzle frame pixel assertions (painted scenes), hub axe color-contrast, duplicate dog glyph (registry guard), space FE0F collectible, tracing button assertion. Local `check_fast` 10/10 green.
- Follow-up CI run (push f95419a/e5e4bcf) is queued/in progress on GitHub Actions; a prior run surfaced and fixed space/tracing/puzzle/axe/registry-guard failures. Pages deploy remains gated on a fully green run.
- Art payload: 154 glyph WebPs, 154 registry stems, 0 orphans, 0 warnings.

## Open tasks

- **328** DEFERRED — hub/nav tile icons and shell-chrome glyphs; needs a user decision (see `DECISIONS.md`).
- **364–373** NEW — audit/phase tasks from the master directive (see `ACTIVE.md`).

## Validate

- `node tools/check_fast.js` — 10/10 green locally.
- `node tools/check_art.js` — 0 failures, 0 warnings.
- `node tools/check_release.js` — release gate before a release.

## Rules of the road

- `game/` changes → `node tools/build_offline.js` FIRST, then `tools/sync-docs.sh`, then refresh affected review screenshots.
- Never commit Cloudflare credentials. Never push to `main` without the user asking.
- Keep `resources/` and `tools/` for dev assets and tooling; `game/` must stay deployable-only.
- Runtime scratch goes under git-ignored `tools/.cache/`, never system temp.
- **Tests must be updated to follow implementation changes.**
