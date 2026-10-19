# 06 — AI handoff prompts

Paste-ready prompts for any implementation AI (OpenCode, Kilo, Codex, Copilot, Claude). Replace `<…>`. The repo's own startup files (`AGENTS.md`, `project/STATUS.md`) always win over a prompt; the AI must tell you if they conflict.

## 1. Master prompt — start a card

```
You are working on Петрин свет (Petras World), repo radmanmilos/Games-for-kids, a toddler
mini-game PWA (plain HTML/CSS/JS, no build step, Serbian Cyrillic, ages 2–6, offline).

Your task: card <CF-NN> of the "Мачја шума" (Cat Forest) plan.

1. Read, in order: AGENTS.md, project/STATUS.md, then resources/General_reviews/Cat_Forest/README.md,
   PROGRESS.md, and the card <CF-NN> in 03_TASKS.md. Read ONLY the other files the card's
   "Read first" line names (00_PRODUCT_SPEC, 01_TECH_DESIGN, 04_TEST_PLAN, repo files).
2. Report first (no edits yet): git status --short, git log --oneline -5, the card's dependencies
   and whether they are DONE in PROGRESS.md, any decision (D1–D11) the card is blocked on, and
   your plan as numbered steps. Wait for my "go" unless I already said to proceed.
3. Claim the task in project/tasks/ACTIVE.md (next number from project/tasks/INDEX.md), flip to IN PROGRESS.
4. Implement ONLY the card. Smallest correct change. Touch only the files the card lists.
   Never edit game/shared/*, never hand-edit docs/ or generated files (use the fix command that
   check_fast prints and tools/sync-docs.sh via bash). If you need something outside the card: STOP,
   write it under "Blocked" in PROGRESS.md, and ask me.
5. Product rules are non-negotiable (00_PRODUCT_SPEC §2 and §10): no currency/shop/XP/levels/locks,
   no visible numbers/text/timers/score, no fail states, no notifications/offline earnings,
   emoji art only, Cyrillic only for anything a child sees or hears, no new assets/libraries/network.
6. Validate with the commands in the card. NEVER claim a test passed unless it actually ran. If you
   have no Chrome, mark that criterion "UNVERIFIED — needs user run" and print the exact command.
7. Finish: DONE note in ACTIVE.md citing the AC you met (and which are UNVERIFIED), node tools/archive_tasks.js,
   update PROGRESS.md (row + log line), overwrite project/STATUS.md (≤6 KB), node tools/check_docs.js.
   Do NOT commit or push. Give me: changed-file list, commands run with real results, and a suggested
   commit message ending with the trailer "Agent: <Tool>/<model>".
```

## 2. Short per-card variants

Use the master prompt, replacing `<CF-NN>` and appending one of:

- **CF-01** — "Copy `game/pages/sorting.html` as the template. Registry field names come from the header comment of `game/data/app-registry.js`, not from the card, if they differ. Verify the hub tile at 1024×800 and 844×390."
- **CF-02** — "Read `tools/sorting_smoke.js` completely before writing a line. Copy its header/ending. Add the negative test using a temp copy; never `git checkout`/`stash`."
- **CF-04…CF-08** — "Positions and progress must be computed from state in `render()`; no CSS transitions for movement. All randomness through the engine RNG. Add your assertions to `tools/cat_forest_smoke.js` in the same session."
- **CF-09** — "Check the accepted names in `game/shared/audio.js` around line 149 before calling `playAnimalSound`. Do not add audio files."
- **CF-12** — "Grep for an existing ambient helper before deciding on rain audio; if none, rain is visual-only. Do not add a shared helper."
- **CF-13** — "Read `sorting.js` `enableDrag` and its drag test first; copy the idiom."
- **CF-16…CF-19** — "No game behaviour changes unless an audit finding requires it; re-run the geometry assertions after any layout fix."
- **CF-20/21** — "Do not add content to README.md or CONTRIBUTING.md. Do not commit or push."

## 3. Review prompt (a second AI reviews a finished card)

```
Review card <CF-NN> of the Cat Forest plan as a careful code reviewer, children's UX designer
and visual reviewer. Do not edit files.
1. Read AGENTS.md, resources/General_reviews/Cat_Forest/README.md, 05_DECISIONS_AND_RISKS.md §3,
   the card, and the diff (git diff / git status).
2. For every acceptance criterion: PASS / FAIL / UNVERIFIED with evidence (file:line, command output).
   Keep verified facts, hypotheses and play-test questions in separate lists.
3. Walk the §3 checklist line by line. Flag any philosophy violation as BLOCKER.
4. Check: files touched ⊆ the card's list; game/shared untouched; docs/ only via sync-docs;
   generated files via fix commands; no assertion pins a literal the registry owns; smokes were
   actually run; budgets (STATUS 6 KB, ACTIVE 20 KB) respected.
5. For each issue: file/location · what is wrong for the child or parent · why it matters · fix ·
   regression risk · how to test it. End with: APPROVE / CHANGES REQUESTED.
```

## 4. Resume prompt (new chat, limit hit, or another AI continues)

```
Continue the Cat Forest plan. Clone the repo fresh (other AIs commit between sessions).
Read AGENTS.md, project/STATUS.md, resources/General_reviews/Cat_Forest/README.md and PROGRESS.md.
Find the first card that is IN PROGRESS or the first NEW card whose dependencies are DONE.
If a card is IN PROGRESS, read its "Log" notes and git status, verify what is actually done
(do not trust the notes blindly), then finish it. Report first; wait for my go.
```

## 5. Notes per tool

- **OpenCode / Kilo / Codex / Copilot / Claude:** the repo has per-tool config (`opencode.json`, `kilo.jsonc`, `.opencode/skills/*`, `.kilo/*`, `.claude`, Copilot instructions). Do not edit them for this project. The `validate-game-change` skill is a useful reminder of the ladder, but its `sync-docs` invocation may be wrong — see `05_DECISIONS_AND_RISKS.md` §4.
- **Agents with no Chrome** (typical sandboxes) can still do every card up to the `[CHROME]` steps; they must list those commands for the user.
- **One card per session.** Do not "also fix" nearby things; log them in `PROGRESS.md` as proposals.
