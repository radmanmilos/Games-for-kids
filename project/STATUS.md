# Petrin svet — Status

*Overwrite this file at the end of every session (never append). Budget: 6 KB, checked by `node tools/check_docs.js`.*

**Last updated:** 2026-10-16 · **App version:** 2.0.4 (`game/manifest.json`)
**Repository:** https://github.com/radmanmilos/Games-for-kids

## Where we are

- **No open task.** The next task number is **251**.
- **Task 250 — DONE (closed 2026-10-16):** game input/round-lifecycle refactor (Shapes/Candy drag cancellation, shared adventure focus/touch reset, Coloring timer invalidation). Merged to `main` via PR #5. Closure this session (OpenCode/Big Pickle): refreshed the `Screenshot_Review` battery for the 8 affected pages with provenance/TOC stamped 250, then archived the task and overwrote this status. Only the Parent screens changed pixels (app version 2.0.3→2.0.4); the other 7 pages are pixel-identical, confirming the refactor was logic-only.
- **CI is green** on the last runs (the PR #5 merge and its checks all succeeded). Re-check with `gh run list` before starting anything.
- **Model recommendations refreshed:** `AGENTS.md` now points to the current free set (screenshots → Nemotron 3.5 Super VL Free; fast bulk coding → DeepSeek V4.1 Flash Free; huge context → Nemotron 3.5 Lightning Free; default stays Big Pickle), verified 2026-10-16 against `https://opencode.ai/zen/v1/models`. The retired MiMo V2.5 references were removed from `AGENTS.md` and `resources/visual_audit_instructions.md`.
- **Tooling fix:** `tools/archive_tasks.js` now tolerates CRLF (its `ENTRY` regex anchored `$` and failed on a Windows `core.autocrlf=true` checkout, so it silently found nothing to archive). Fixed by allowing a trailing `\r`.

## Candidate next work (the user decides; do not start without asking)

1. **Emoticon-replacement asset project** — `resources/General_reviews/Asset_Generation/` (`PROGRESS.md`, `STYLE_BIBLE.md`, `ASSET_INVENTORY.md`). Phase 1 (inventory) awaits the user's approval; no production assets yet. **Open question:** the project brief treats native emoji animals as settled, while this project explores replacing them. Ask before building.
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
