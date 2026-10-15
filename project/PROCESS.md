# Process — task lifecycle v2

This replaces the old ritual of updating `PROJECT_TASKS.md`, `README.md`, `HANDOVER_PROMPT.md` and `CONTRIBUTING.md` at the start **and** end of every task. Those four files had grown to about 900 KB and 39% of all commits touched three of them. Now a task costs **one** write, and the history is archived mechanically.

## Where each thing lives

| File | Role | Written when |
| --- | --- | --- |
| `project/tasks/ACTIVE.md` | open tasks only (NEW / IN PROGRESS / DEFERRED) | task start, task end |
| `project/tasks/INDEX.md` + `archive/tasks/` | one line per task + full text | by `node tools/archive_tasks.js` at session end |
| `project/STATUS.md` | current state, candidate next work. **Overwrite-only, 6 KB budget** | session end |
| `project/games/<game>.md` | one doc per game | when that game's behaviour changes |
| `project/DECISIONS.md` | locked decisions | when the user confirms or changes one (dated one-liner + source) |
| `project/lessons/*.md` | incidents and footguns | when you learn a new one: append to the matching file |
| `README.md`, `CONTRIBUTING.md` | timeless overview / contributor setup | **not** per task |

## Lifecycle

1. **Before starting any new task, check git/CI status** (`git status --short`, `gh run list`). If anything is failing or the tree is dirty in a way you did not create, report it and propose fixing it first — never start a new task on a red pipeline or a stale tree (task 214).
2. **Propose, then wait for approval** (`AGENTS.md`). Name the tool and model you are.
3. **Start:** add `- N. NEW — …` to `ACTIVE.md` (N = "next task number" in `INDEX.md`) and flip it to IN PROGRESS.
4. **Implement and validate** with the smallest relevant command (the ladder is in `AGENTS.md`).
5. **Review screenshots** (definition of done when a screen changes):
   - **Refreshing review screenshots is part of a change's definition of done (task 213).** If your task changes what a child or parent SEES on any screen (a game page, the hub, shared CSS/JS that visibly alters a page), refresh the affected screenshots in the review battery under `resources/General_reviews/<name>/` and commit them with the change. The review folder uses a **stable generic name (`Screenshot_Review`)** — later tasks refresh the same folder (`--review=Screenshot_Review --pages=… --task=…`), never a new dated folder:
     - One changed screen → `node tools/screenshot.js --review=<name> --pages=<page ids> --task=<task id>`
     - Full battery (new review, or screens across many pages) → `node tools/screenshot.js --review=<name> --task=<task id>`
     - A brand-new screen must first be added to the registry (`tools/registry.js`) so `ALL_PAGES` sees it, then captured on the task that introduces it.
     - Provenance (`screenshot-provenance.json`) updates **per file**, so untouched pages keep their last `updatedAt`/task; the TOC's "Последња слика (датум · време)" and "Задатак" columns make a stale shot attributable. A stale screenshot is a regression like a missing docs update.
6. **Finish:** mark the entry DONE with a dated note (who = tool + model, what, why). If `game/` changed: `tools/sync-docs.sh` (refreshes `docs/`).
7. **Commits:** Never commit or push to `main` automatically — the user does that explicitly. (A commit message may carry an `Agent: <tool>/<model>` trailer.)
8. **Session end:** run `node tools/archive_tasks.js`, **overwrite** `project/STATUS.md`, run `node tools/check_docs.js`.

## Reporting findings and proposals (all AIs)

- Investigate first. Propose, then wait for approval before editing.
- For each issue give: file/location, what is wrong for the child or parent, why it matters, the fix, regression risks, how to test it.
- Keep three things apart: **verified facts** (you ran or read it), **hypotheses**, and **playtest questions** (anything that needs a real child or tablet).
- Never claim a test passed unless you ran it. If the environment cannot run it (for example no Chrome for browser smokes), say so plainly.

## Size budgets (enforced by `node tools/check_docs.js`, part of `check_fast`)

| File | Budget |
| --- | --- |
| `AGENTS.md` | 16 KB |
| `README.md` | 18 KB |
| `CONTRIBUTING.md` | 8 KB |
| `project/STATUS.md` | 6 KB |
| `project/tasks/ACTIVE.md` | 20 KB |

Over budget? Move finished or historical material to `archive/` (verbatim) instead of raising the number. The check fails on a breach and warns when a finished task is still listed in `ACTIVE.md`.

## What "archived" means

Finished work lives under `archive/` (tasks, handover logs, plans, reviews, old README sections). It is kept verbatim, indexed (`project/tasks/INDEX.md`), excluded from AI search by `.ignore`, and never needs to be read to start a session. Paths mentioned inside archived files refer to the pre-refactor layout (git tag `pre-refactor-2026-10-13`).
