# Contributing to Petrin svet

## Setup

1. Clone the repo and open it in VS Code.
2. Serve `game/` over HTTP — never `file://` (breaks audio and throws `Unsafe-attempt` warnings).
   - Recommended: use the **Live Server** extension (`ritwickdey.LiveServer`).
3. No `npm install` or build step is required. The app is plain HTML/CSS/JS.
4. Serbian Cyrillic text and speech are mandatory for all child-facing content.

## Validation

Before opening a PR, run the smallest targeted check that covers your change:

- Syntax (whole repo, no browser): `node tools/check_syntax.js` — `node --check` over every `.js`/`.mjs` in `game/` + `tools/`
- Registry / routes / PWA metadata: `node tools/validate_pages.js`
- Offline inventory (cache list + manifest): `node tools/validate_offline.js`. There is **no ZIP** — offline delivery is the service worker; the mechanism is documented in `OFFLINE.md`.
- Parent area (offline download, update check, reset, version) → `node tools/parent_smoke.js`. It also asserts **no manual ZIP link** — that option was removed 2026-10-02 (see `OFFLINE.md` for the mechanism that replaced it).
- Service-worker update path → `node tools/sw_update_smoke.js`
- Runtime exceptions, console errors, rejected promises and local resource failures → `node tools/runtime_error_smoke.js`
- Visual baseline capture and pixel comparison → `node tools/visual_compare.js` (85 images; decoded pixels; failure diffs in `tools/screenshots/diff/`); algorithm smoke → `node tools/run_all.js visual_compare_smoke.js`. Replace the full baseline only after review, with the explicit `--approve-baseline` option.
- Hub changes → `node tools/hub_smoke.js`
- Kitty changes → `node tools/kitty_smoke.js`
- Adventure engine / Driving / Ocean / Dino / Space → `node tools/adventure_smoke.js` (25 checks)
- Tracing → `node tools/tracing_smoke.js`
- Piano → `node tools/piano_smoke.js`
- Memory → `node tools/memory_smoke.js`
- Candy → `node tools/candy_smoke.js`
- Puzzle → `node tools/puzzle_smoke.js`
- Classroom kids tier → `node tools/classroom_smoke.js`
- Racing 3D (Мала тркачица 3Д) → `node tools/racing3d_smoke.js`
- Touch-interruption resilience (4 shards) → `node tools/run_all.js --game touch_interruption`
- Animals / Shapes / Counting / Coloring → `node tools/animals_smoke.js`, `node tools/shapes_smoke.js`, `node tools/counting_smoke.js`, `node tools/coloring_smoke.js`
- Everything at once → `node tools/check_all.js` (syntax + the full battery; add `--docs` after any `game/` change). `node tools/run_all.js --list` shows the battery, `--game <name>` narrows it, `--resume` survives a host that kills the process.
- Quick read-only gate (~9 s, writes nothing) → `node tools/check_fast.js`. This is exactly what CI's `fast` job runs.
- Before a release → `node tools/check_release.js --release` (read-only: `check_fast` + the whole battery + blocking offline and accessibility gates).

If a smoke does not exist for the game you changed, run the page manually in Live Server and verify the interaction visually.

## CI (GitHub Actions)

`.github/workflows/ci.yml` runs on every push and PR, and is split so that one failure can never hide the others:

| Job | What it runs | When |
| --- | --- | --- |
| `setup` | derives the smoke list from `node tools/run_all.js --list --json` | every push/PR |
| `fast` | `check_fast.js` — syntax, registry/metadata, CI-workflow topology, code-scanning-alert guards, generated-artifact freshness, offline inventory, hub smoke (**no** game battery; read-only) | every push/PR |
| `smoke` | one leg per smoke via `run_all.js`, `fail-fast: false`, `max-parallel: 6` | every push/PR |
| `release` | blocking offline E2E + serious/critical accessibility scan | every push/PR |
| `extended` | blocking `play_matrix.mjs` (Chromium + WebKit × 5 viewports; missing-engine skips fail coverage) | manual run or weekly |

Consequences for contributors:

- **A new smoke needs no workflow edit** — the matrix is generated from the battery. If you add `tools/*_smoke.js`, it is picked up automatically.
- **Automated gates first, then a manual portfolio pass.** See `PLAYTESTING.md` (R20) for the four-session protocol (toddler flow, five-game random walk, offline, parent handoff) and the `BLOCKER / MAJOR / MINOR / COSMETIC` classification. Run it before a release and after any new pilot.
- `axe_check.js --report` is blocking for incomplete scans and serious/critical violations. Its pinned axe-core 4.10.2 tool asset is vendored under `tools/vendor/`; `game/` never depends on it. Moderate/minor findings remain visible in the page-by-page report without failing CI.
- **No CI step or validator may regenerate what it inspects** (R5). If you edit `game/`, run `node tools/sync-docs.sh` (or `check_all.js --docs`) and commit the result; `check_fast.js` and `check_release.js` will *fail* on an unsynced `docs/` rather than fixing it, which is deliberate — a check that repairs what it inspects can never report a stale artifact.
- `tools/check_release.js` is deliberately **not** a CI job: it re-runs the entire battery, which the `smoke` matrix already ran in parallel, one leg per job. Run it locally before a release.
- The CI workflow's own shape is guarded by `tools/validate_workflow.js` (11 checks, runs inside `check_fast`), so the R4 fixes — a deleted tool reference, a matrix generated from the battery, `fail-fast: false`, a direct `needs` for every `needs.*.outputs` read — cannot silently regress.
- The two GitHub code-scanning alerts are guarded by `tools/check_scan_alerts.js` (5 checks, also inside `check_fast`): a dangerous-scheme filter must test `javascript:` **and** `vbscript:`, and an HTML stripper must consume the whole closing tag. Both rules are checked behaviourally and self-tested against the pre-autofix shapes, so the guard cannot report green by matching nothing. Known residual: the `</script/>` closing form is deliberately not covered.
- A red `fast` job means a syntax/registry/inventory/generated-artifact/workflow/scan-alert/hub problem — not a game. Read the failing leg's own matrix cell before suspecting a game.

## Task lifecycle

- Mark the task **IN PROGRESS** in `PROJECT_TASKS.md` when starting and **DONE** with a dated note (who, what, why) when finished.
- Current roadmap item: **R22** (sorting / classification pilot); R16 (asset/performance budget, task 182), R17 (PWA install/update/version QA, task 183), R18 (documentation/roadmap consolidation, task 184), R19 (local progress, task 185), R20 (portfolio playtesting protocol, task 186) and R21 (more/less/same pilot, task 187) are DONE. The active roadmap is named in `ROADMAP.md`. **CI is green** — run #41 was the first fully green run (29 succeeded, 1 skipped by design, 0 failed) and issue #3 is closed. Tasks 178–181 are DONE: 178 made the CDP `describe()` diagnostic describe the right Chrome process (if you change `tools/headless.js`'s boot loop, run `node tools/guards/chrome_diagnostic_negtest.js` — it must read **per-attempt** exit state, never the loop-wide `chromeExitEvent`); 179 removed the offline ZIP (`OFFLINE.md`); 180 fixed a guard that asserted what it could never satisfy; 181 fixed `Release QA`.
- **Never run a `*_smoke` tool raw in CI.** Chrome boot crashes are routine on GitHub runners (13 of 27 legs hit one on run #40, all recovered on retry). `node tools/run_all.js <smoke>` is the retry that absorbs them; `Release QA` was the last runner bypassing it and went red on every run until task 181. Also note `tools/run_all.js` cannot route a tool that has no exit code — check `offline_smoke.mjs`'s `getFails()` if you add a new standalone gate, since a gate that prints FAIL and exits 0 is worse than no gate.
- **A guard that asserts something its own implementation can never satisfy will red a real pipeline (task 180).** Run every CI-run guard locally at clean HEAD before believing it.
- **A diagnostic is a check too, and it needs its own guard.** The first version of `guards/chrome_diagnostic_negtest.js` **passed against the code it was written to catch**, because its assertion was behavioural against a race (whether the CDP socket close or the child `exit` event lands first). When a guard's premise can only be true by luck, pin the deterministic invariant (which binding the code can reach) and demote the flaky observation to supporting evidence.
- **A layout that "passes" because the harness scrolls it into view is still broken** (task 177c). `headless.js`'s `boxOf` calls `scrollIntoView`, so a control clipped out of the viewport inside an `overflow:hidden` container gets scrolled into view and its geometry check passes — while a child still cannot see or tap it. When a test stands in for a human interaction, assert the geometry too, and remember that an animated control (e.g. a `pulse` scale) can tip a marginal check over only on some runs.
- Refresh `README.md` and `HANDOVER_PROMPT.md` alongside it. Missing docs updates are a regression (see `AGENTS.md` → Working rhythm).
- Never commit or push to `main` automatically — the user does that explicitly.

## Docs mirror (publishing to GitHub Pages)

`game/` is the single source of truth. `docs/` is the published copy served by GitHub Pages from the `main` branch.

Every time `game/` changes, replace the entire `docs/` content with the new `game/` content:

```bash
bash tools/sync-docs.sh
git add docs/
git commit -m "sync docs/"
git push
```

The site updates on push to `main`. Do not edit `docs/` directly.

## Project rules

- Follow the YAGNI rules in `AGENTS.md`.
- Do not add external runtime dependencies or remote assets without explicit approval.
- Keep `game/` clean and deployable — no docs, experiments, or unused assets.
- `resources/` is development-only; `tools/` is dev/test tooling. Neither is required at runtime.
- Do not commit secrets or keys.
- When in doubt, ask before expanding scope.
