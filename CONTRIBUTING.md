# Contributing to Petrin svet

## Setup

1. Clone the repo and open it in VS Code.
2. Serve `game/` over HTTP — never `file://` (breaks audio, the kitty iframe, and throws `Unsafe-attempt` warnings).
   - Recommended: use the **Live Server** extension (`ritwickdey.LiveServer`).
3. No `npm install` or build step is required. The app is plain HTML/CSS/JS.
4. Serbian Cyrillic text and speech are mandatory for all child-facing content.

## Validation

Before opening a PR, run the smallest targeted check that covers your change:

- Syntax: `node --check game/shared/*.js game/games/*.js`
- Hub changes → `node tools/hub_smoke.js`
- Kitty changes → `node tools/kitty_smoke.js`
- Adventure engine / Driving / Ocean / Dino / Space → `node tools/adventure_smoke.js` (25 checks)
- Tracing → `node tools/tracing_smoke.js`
- Piano → `node tools/piano_smoke.js`
- Memory → `node tools/memory_smoke.js`
- Candy → `node tools/candy_smoke.js`
- Puzzle → `node tools/puzzle_smoke.js`
- Classroom kids tier → `node tools/kids_smoke.js`
- Animals / Shapes / Counting / Coloring → `node tools/animals_smoke.js`, `node tools/shapes_smoke.js`, `node tools/counting_smoke.js`, `node tools/coloring_smoke.js`

If a smoke does not exist for the game you changed, run the page manually in Live Server and verify the interaction visually.

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
