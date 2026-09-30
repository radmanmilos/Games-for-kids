# Contributing to Petrin svet

## Setup

1. Clone the repo and open it in VS Code.
2. Serve `game/` over HTTP — never `file://` (breaks audio, the kitty iframe, and throws `Unsafe-attempt` warnings).
   - Recommended: use the **Live Server** extension (`ritwickdey.LiveServer`).
3. No `npm install` or build step is required. The app is plain HTML/CSS/JS.
4. Serbian Cyrillic text and speech are mandatory for all child-facing content.

## Validation

Before opening a PR, run the smallest targeted check that covers your change:

- Syntax (whole repo, no browser): `node tools/check_syntax.js` — `node --check` over every `.js`/`.mjs` in `game/` + `tools/`
- Registry / routes / PWA metadata: `node tools/validate_pages.js`
- Offline inventory (cache list + manifest): `node tools/validate_offline.js`
- Parent area (offline download, update check, reset, version) → `node tools/parent_smoke.js`
- Service-worker update path → `node tools/sw_update_smoke.js`
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
- Before a release → `node tools/check_release.js` (read-only: `check_fast` + the whole battery).

If a smoke does not exist for the game you changed, run the page manually in Live Server and verify the interaction visually.

## CI (GitHub Actions)

`.github/workflows/ci.yml` runs on every push and PR, and is split so that one failure can never hide the others:

| Job | What it runs | When |
| --- | --- | --- |
| `setup` | derives the smoke list from `node tools/run_all.js --list --json` | every push/PR |
| `fast` | `check_fast.js` — syntax, registry/metadata, CI-workflow topology, generated-artifact freshness, offline inventory, hub smoke (**no** game battery; read-only) | every push/PR |
| `smoke` | one leg per smoke, `fail-fast: false`, `max-parallel: 6` | every push/PR |
| `release` | offline E2E + a11y report (both `continue-on-error`) | every push/PR |
| `extended` | `play_matrix.mjs` (chromium + webkit × 5 viewports) | manual run or weekly |

Consequences for contributors:

- **A new smoke needs no workflow edit** — the matrix is generated from the battery. If you add `tools/*_smoke.js`, it is picked up automatically.
- `offline_smoke.mjs` and `axe_check.js --report` are `continue-on-error` until R6/R10 make them trustworthy gates; they still run and still print their report.
- **No CI step or validator may regenerate what it inspects** (R5). If you edit `game/`, run `node tools/sync-docs.sh` (or `check_all.js --docs`) and commit the result; `check_fast.js` and `check_release.js` will *fail* on an unsynced `docs/` rather than fixing it, which is deliberate — a check that repairs what it inspects can never report a stale artifact.
- `tools/check_release.js` is deliberately **not** a CI job: it re-runs the entire battery, which the `smoke` matrix already ran in parallel, one leg per job. Run it locally before a release.
- The CI workflow's own shape is guarded by `tools/validate_workflow.js` (11 checks, runs inside `check_fast`), so the R4 fixes — a deleted tool reference, a matrix generated from the battery, `fail-fast: false`, a direct `needs` for every `needs.*.outputs` read — cannot silently regress.
- A red `fast` job means a syntax/registry/inventory/generated-artifact/workflow/hub problem — not a game. Read the failing leg's own matrix cell before suspecting a game.

## Task lifecycle

- Mark the task **IN PROGRESS** in `PROJECT_TASKS.md` when starting and **DONE** with a dated note (who, what, why) when finished.
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
