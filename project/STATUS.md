# Petrin svet — Status

*Overwrite this file at the end of every session (never append). Budget: 6 KB, checked by `node tools/check_docs.js`.*

**Last updated:** 2026-10-13 (written during the repo refactor, base `main` @ 71e1b7a) · **App version:** 2.0.3 (`game/manifest.json`; bump it when a shipped fix must reach installed devices)
**User's machine:** `E:\GitHub\Games for kids` (Windows); the repo is public: https://github.com/radmanmilos/Games-for-kids

## Where we are

- **Visual/UX plan V0–V23 is complete** (38/38, tasks 216–240). Plan, ledger and spec are in `archive/plans/`.
- **racing3d tuning (tasks 242–249) is done:** hover steering, kart heading follows the road, chase camera closer / higher / lag-cancelled / looking up, HUD layout (minimap under «Поени», buttons on the edges). The user confirmed the framing after a play-test (task 249).
- **Offline download freeze fixed** (task 243: `sw.js` `event.waitUntil` + parent stall watchdog).
- **No task is open.** `project/tasks/ACTIVE.md` is empty; all 249 tasks are archived (`project/tasks/INDEX.md`).
- CI was green on the last recorded runs (tasks 237 and 241). Re-check with `gh run list` before starting anything.

## Candidate next work (the user decides; do not start without asking)

1. **Emoticon-replacement asset project** — `resources/General_reviews/Asset_Generation/` (`PROGRESS.md`, `STYLE_BIBLE.md`, `ASSET_INVENTORY.md`). Phase 1 (inventory): final inventory awaits the user's approval; no production assets yet. **Open question:** the project brief says native emoji animals are a settled choice, while this project explores replacing them. Ask before building.
2. **racing3d further play-test tuning** — levers: `bankMax`, `LATERAL_GAIN`, `inRate`/`outRate`, `bobY`, `camPull`/`camRise` (all in `game/games/racing3d.mjs`).
3. **"Tier A" learning content** from the finished learning roadmaps in `archive/plans/` (see `project/reference/LEARNING_ROADMAP_REVIEW.md`) — verify what is still open before acting.

## Validate (details: `AGENTS.md`)

`node tools/check_fast.js` (read-only, ~9 s) → `node tools/run_all.js --game <name>` / `--since HEAD` → `node tools/check_release.js` before a release. Smokes need Chrome (`CHROME_PATH`); racing3d needs WebGL.

## Rules of the road

- `game/` changes ⇒ run `tools/sync-docs.sh` (updates `docs/`) and refresh the affected review screenshots (`AGENTS.md`). Never edit `docs/` by hand.
- Never commit or push to `main` unless the user says so for this task.
- Before touching a risky area read its lesson file: see the table in `AGENTS.md` (`project/lessons/`).
- Locked decisions: `project/DECISIONS.md`. Process: `project/PROCESS.md`.
- Older session logs: `archive/handover/`.
