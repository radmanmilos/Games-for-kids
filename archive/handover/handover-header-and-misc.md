# Old HANDOVER_PROMPT.md header, setup and validation notes

Moved **verbatim** from `HANDOVER_PROMPT.md` (origin/main 71e1b7a) in the 2026-10-13 repo refactor. Paths inside refer to the pre-refactor layout (git tag `pre-refactor-2026-10-13`).

The "Validation" baseline numbers below are stale (19 tools / 398 checks); use the ladder in `AGENTS.md` instead.

## Header

# Petrin svet Handover Prompt

Location: `E:\GitHub\Games for kids`

Purpose

This file summarizes the current workspace, conventions, and project state so the next session can continue without friction. Read this before making changes. It is refreshed at the end of every session.

## History archived

Session logs and historical task write-ups (tasks 156, 176–181, R14/R15, the racing3d review and polish plans) were moved verbatim to
[`resources/General_reviews/HANDOVER_ARCHIVE.md`](resources/General_reviews/HANDOVER_ARCHIVE.md).

## Cross-platform setup

This project was originally built on Windows. When working from a Linux server (e.g. Alpine), see `SETUP_LINUX.md` for the non-obvious setup: PowerShell doesn't work on Alpine/musl, so `build_offline.ps1` was replaced with `build_offline.js` (Node.js). Everything else works as-is.

## Validation is now one command

`node tools/check_all.js` = `node --check` over `game/`+`tools/` → the full 19-tool smoke battery in parallel → optional `--docs` (`tools/sync-docs.sh`, required whenever `game/` changed) / `--offline` (`tools/build_offline.ps1`). Current baseline: **19/19 tools, 398 checks, 0 fail** (classroom 17 — grew in task 120; candy 12; racing3d 32, hub 10 — grew in task 105). While iterating use `node tools/run_all.js --game <name>` or `--watch`; the `validate-game-change` skill spells out the ladder. A smoke that exits non-zero with **0 checks** is a Chrome boot crash, not a real failure (the runner retries it twice automatically) — four separate 0-check crashes happened in the task 105 session and every one passed on a clean re-run. **A failure that reproduces when the tool is re-run ALONE is a real bug, not a load flake — do not dismiss it as "environment".** The task 120 session is the double proof: the classroom finish-panel failure had been carried as a "known flake" and was in fact a `NaN` audio-delay TypeError that stopped the 🏅 panel from ever appearing for a child; the candy hint failures also reproduced alone *and* on the committed tree, and were a silent shared-module/global name collision.

## Stale status paragraph cut from the racing decisions (2026-09-22)

Verified state to give the user: `racing_smoke.js` **39/39 PASS**, `hub_smoke.js` ALL PASS, docs mirrored (offline pack regenerated). **Open work: user commits the 2D racer visual-style adjustment (this session) + push, then play-tests.**
