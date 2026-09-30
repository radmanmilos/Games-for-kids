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
node tools/check_fast.js                 # read-only fast gate, ~9 s (syntax, registry, CI workflow,
                                         # generated artifacts, offline inventory, hub smoke)
node tools/check_release.js              # read-only release gate: check_fast + the FULL battery
node tools/sync-docs.sh                  # REQUIRED whenever game/ changed - this is the command that
                                         # writes docs/; the gates above will FAIL on an unsynced mirror
node tools/build_offline.js              # only for new/changed offline assets (needs `zip`; use the .ps1 on Windows)
```

`check_fast.js` and `check_release.js` exit non-zero if any stage fails, and they
**write nothing** \u2014 a stale artifact is reported with the command that fixes it,
never repaired in place (R5). `check_all.js --docs --offline` still exists as the
one command that regenerates, and belongs to a release/commit boundary or a broad
refactor rather than a scoped fix.

**If nothing under `game/` changed** (a `tools/`, `docs/` or CI-only change), the
full battery is the wrong gate \u2014 the same rule AGENTS.md states. `check_fast.js`
covers it in ~9 s, and it includes the validators a `tools/`-only change needs:

```bash
node tools/check_fast.js         # supersedes running these by hand:
                                 # check_syntax.js  validate_pages.js  validate_workflow.js
                                 # validate_generated.js  validate_offline.js  hub_smoke.js
```

For a CI-workflow change, `validate_workflow.js` is the point: it proves the
workflow still references existing tools, that every `needs.<job>.outputs` read is
a direct dependency, and that the matrix is still generated from the battery.

## Reading results

- `PASS`/`FAIL` per check, then a per-tool summary table and the exit code.
- A smoke that exits non-zero with **0 checks** did not fail an assertion — its
  Chrome never booted (parallel port/profile contention). The runner already
  retries those twice; only a third failure is a real problem. Re-run it alone:
  `node tools/<name>_smoke.js`. `check_fast.js` retries the same signature for its
  own stages.
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
