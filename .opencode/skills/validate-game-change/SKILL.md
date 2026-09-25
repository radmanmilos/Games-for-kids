---
name: validate-game-change
description: Use when changing anything under game/ (pages, games/*.js, shared/*, CSS) or tools/*_smoke.js in the "Games for kids" repo, or when the user says "validate", "run the tests", "run the smokes", "check the game still works". Runs the smallest relevant subset of the headless smoke battery, then the full battery before declaring done.
---

# Validate a game change

`game/` is deployable-only. Every runtime change needs proof from a real
headless-Chrome smoke, not from reading the diff. There is no build step and no
test framework — validation IS the smoke battery in `tools/`.

## 1. Pick the smallest relevant subset

`tools/run_all.js` maps changed `game/` files to the smokes that cover them.
Do not hand-pick; let the map decide, and fall back to the full battery for
anything under `game/shared/` (shared changes are broad by definition).

```bash
node tools/run_all.js --since HEAD     # smokes for uncommitted changes
node tools/run_all.js --game tracing   # one game by name
node tools/run_all.js tracing coloring # explicit smoke names
node tools/run_all.js --list           # what exists
```

Mapping rules the runner applies: `game/index.html` → `hub_smoke`;
`game/pages/<p>.html` → that page's smoke; `game/games/<g>.js` → that game's
smoke (adventure's five modes expand to five smokes); `game/shared/*`, unknown
or unmatched files → the whole battery; `game/assets/*` → nothing.

## 2. While iterating

```bash
node tools/run_all.js --watch          # re-runs affected smokes on any game/ save
node tools/<game>_smoke.js             # one smoke directly, fastest loop
```

## 3. Before declaring done

```bash
node tools/check_all.js                # node --check + the FULL battery
node tools/check_all.js --docs         # + tools/sync-docs.sh (required: game/ changed)
node tools/check_all.js --docs --offline  # + tools/build_offline.ps1 (only for new/changed assets)
```

`check_all.js` exits non-zero if any stage fails. Do not report a game change as
done until it exits 0.

## Reading results

- `PASS`/`FAIL` per check, then a per-tool summary table and the exit code.
- A smoke that exits non-zero with **0 checks** did not fail an assertion — its
  Chrome never booted (parallel port/profile contention). The runner already
  retries those twice; only a third failure is a real problem. Re-run it alone:
  `node tools/<name>_smoke.js`.
- Assertions can go **stale** against current behaviour. When a check fails,
  first read the live page state in the FAIL info and decide whether the *game*
  or the *assertion* is wrong. Fix assertions to the observed truth; never
  weaken a game to satisfy a test.
- `racing3d` is the only ES-module game. It boots fine over HTTP (Live Server)
  and CORS-blocks under `file://` — never test it by opening the file directly.

## Optional deeper gates

Only when the change touches layout, touch input, or a11y — each needs a
one-off install/asset, so they are not part of the default ritual:

```bash
node tools/play_matrix.mjs             # chromium + webkit × 5 viewports; needs npx playwright install webkit
node tools/axe_check.js                # axe-core; first run fetches and caches it in tools/.cache/
```

## Rules

- Never run `tools/sync-docs.sh` or commit/push unless the change is in `game/`
  or the user asked. `docs/` is generated; never edit it by hand. Committing and
  pushing to `main` is the user's action, not yours.
- `game/` must never require `tools/` or `resources/` at runtime. If a change
  would introduce that, it is wrong.
- All text shown to a child and all speech stays Serbian Cyrillic.
- Every JS/`.mjs` change gets `node --check` (`check_all.js` does this for you).
