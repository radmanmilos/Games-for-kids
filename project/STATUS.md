# Petrin svet — Status

*Overwrite this file at the end of every session (never append). Budget: 6 KB, checked by `node tools/check_docs.js`.*

**Last updated:** 2026-10-17 · **App version:** 2.0.5 (`game/manifest.json`)
**Repository:** https://github.com/radmanmilos/Games-for-kids

## Where we are

- **No open task.** The next task number is **253**.
- **Task 251 — DONE (closed 2026-10-17):** Little Explorer got a "fun speed" rocket toggle under the star counter — when ON the whole tick runs 3x faster (exact time-scale: `stepFrame()` calls `update()` 3x per frame, so per-substep displacement is unchanged and nothing tunnels). Default OFF on every load; the choice is deliberately not remembered. Merged to `main` via PR #6 (merge commit `2b34cda`). `kitty_smoke` went 34 → 35 checks (four task-251 guards, each negative-tested by mutation), `check_fast` 8/8, Release QA + CodeQL green, axe clean, offline E2E 23 games green. `game/` synced to `docs/`; the four explorer review screenshots refreshed with `--task=251`.
- **Task 252 — DONE (closed 2026-10-17):** bumped the app version **2.0.4 → 2.0.5** because the user's device still showed the pre-251 page ("downloaded the latest version and don't see the button"). The live deploy was verified first (fresh browser: the button renders, 89x89, `opacity:.62`, correct `aria-label`), so the cause was `docs/sw.js` cache-first serving: the cache is named `petrin-v<version>` from `manifest.json` and registered as `sw.js?v=<version>`, so a device already on 2.0.4 kept getting the old `pages/explorer.html`. A `game/` change is not really shipped until the version is bumped (the rule that `bb03745` and `9eac9fe` established).
- **CI is green** on the PR #6 merge, the task-251 closure, and the version bump. Re-check with `gh run list` before starting anything.

## Candidate next work (the user decides; do not start without asking)

1. **Emoticon-replacement asset project** — `resources/General_reviews/Asset_Generation/` (`PROGRESS.md`, `STYLE_BIBLE.md`, `ASSET_INVENTORY.md`). Phase 1 (inventory) awaits the user's approval; no production assets yet. **Open question:** the project brief treats native emoji animals as settled, while this project explores replacing them. Ask before building.
2. **racing3d further play-test tuning** — levers: `bankMax`, `LATERAL_GAIN`, `inRate`/`outRate`, `bobY`, `camPull`/`camRise` (all in `game/games/racing3d.mjs`).
3. **"Tier A" learning content** from the finished learning roadmaps in `archive/plans/` (see `project/reference/LEARNING_ROADMAP_REVIEW.md`) — verify what is still open before acting.

## Validate (details: `AGENTS.md`)

`node tools/check_fast.js` (read-only, ~9 s) → `node tools/run_all.js --game <name>` / `--since HEAD` → `node tools/check_release.js` before a release. Smokes need Chrome (`CHROME_PATH`); racing3d needs WebGL.

## Rules of the road

- `game/` changes ⇒ run `tools/sync-docs.sh` (updates `docs/`) **and bump `game/manifest.json`'s version** (installed/offline devices only refresh on a new `petrin-v<version>` cache) and refresh the affected review screenshots (`AGENTS.md`). Never edit `docs/` by hand.
- Never commit or push to `main` unless the user says so for this task.
- Before touching a risky area read its lesson file: see the table in `AGENTS.md` (`project/lessons/`).
- Locked decisions: `project/DECISIONS.md`. Process: `project/PROCESS.md`.
- Older session logs: `archive/handover/`.
