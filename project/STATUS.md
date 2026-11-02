# Petrin svet — Status

*Overwrite this file at the end of every session (never append). Budget: 6 KB, checked by `node tools/check_docs.js`.*

**Last updated:** 2026-11-02 **App version:** 3.0.1 (`game/manifest.json`) **Repository:** https://github.com/radmanmilos/Games-for-kids

## Where we are

- **Code-review remediation applied (3.0.1).** Four reviews (chatGPT, Claude, DeepSeek, Grok) were compared against current HEAD `52927bb`. Findings verified against live code; DeepSeek's "stub pages" claim refuted. Applied 9 fixes + 2 decision outcomes.
- **Fixes shipped:**
  - T329 Explorer held input now releases on `touchcancel` and pause (port from adventure.js).
  - T330 Shared `shuffle` replaced biased `sort()` with Fisher–Yates.
  - T331 Music `localStorage` reads/writes now guarded (no boot crash on locked-down storage).
  - T332 Parent gate re-rolls after a wrong answer (keeps "Покушај поново", no lockout).
  - T333 SW fetch handler no longer caches failed HTTP responses.
  - T334 SW install now fails safely (keeps previous working offline copy).
  - T335 Adventure/explorer/fastcat controls now focusable + keyboard-activatable (tabindex + Enter/Space).
  - T336 Progress dates use local calendar date instead of UTC.
  - T337 Negative-test guards now restore mutated files via `try/finally`.
- **Decisions recorded:** T338 (version discovery deferred — needs real-tablet test), T339 (DeepSeek Tasks 0–6 rejected; keyboard part covered by T335).
- **Gates green:** check_fast 8/8, check_release green (all 37 smokes + guards, 1329 checks), axe_check clean (0 serious/critical).
- **Tasks 329-340 DONE/archived.** Open: 328 (deferred, user input).

## Asset generation

- Production art: **155 WebP** under `game/assets/art/`.
- `game/data/art-registry.js` — **138 glyph→stem** entries.
- `game/shared/art.js` — `url`, `html`, `fill`, `fillAttr`, `image`, `draw`, `_BASE`.

## Validate

- `node tools/check_fast.js` — **8/8 green**.
- `node tools/check_release.js` — release gate green (all 37 smokes + guards).
- All affected smokes pass.

## Rules of the road

- `game/` changes → `node tools/build_offline.js` FIRST, then `tools/sync-docs.sh`, then refresh affected review screenshots. Never edit `docs/` by hand.
- Never commit Cloudflare credentials (`tools/vendor/` is git-ignored). Never push to `main` without the user asking.
- Keep `resources/` and `tools/` for dev assets and tooling; `game/` must stay deployable-only.
- Runtime scratch goes under git-ignored `tools/.cache/`, never system temp.
- Before touching a risky area read its lesson file (table in `AGENTS.md`). Locked decisions: `project/DECISIONS.md`. Process: `project/PROCESS.md`.
- **Tests must be updated to follow implementation changes.**