> **EXECUTED 2026-10-13** as one commit (Phases 1–4; Phase 5, dropping the `docs/` mirror, was not done and is not needed).
> Deviations from this plan, found while measuring: AGENTS.md ended at ~15 KB (budget 16 KB, not 12), README ~15 KB (budget 18 KB), CONTRIBUTING ~7.5 KB (budget 8 KB);
> AGENTS.md held **39** footgun bullets, not 41; only the 3 unreferenced probe scripts moved to `tools/_archive/` (`tracing_probe.js` and `dilate_test.js` are documented commands, so they stayed);
> `plan_progress.js` was archived with the finished plan (`archive/tools/`); `check_docs.js` FAILS on a budget breach or dead link and only WARNS about finished tasks left in `ACTIVE.md`;
> `kilo.jsonc` now also allows edits under `project/**` (the new live-docs folder); `start_ai.bat` stays in the root; Kilo compaction settings were left unchanged.
> Everything moved verbatim: every non-blank line of the old PROJECT_TASKS.md and HANDOVER_PROMPT.md exists unchanged under `project/` or `archive/`.
> Added after review: root `CLAUDE.md` (Claude Code does not read `AGENTS.md`), `project/reference/ai-tools.md`, `project/reference/claude-project-brief.md`, the product principles in `project/DECISIONS.md`, and the findings-report format in `project/PROCESS.md`.
> The sections below are the original proposal text (written before execution).

# Petrin svet — Repo Refactor Plan (AI workflow + file hygiene)

**Date:** 2026-10-13 (re-verified against `main` @ `71e1b7a`, 307 commits; first draft was written against `ea2dbdd` on 2026-10-11) · **Status:** PROPOSAL. Nothing in the repo has been edited. Awaiting approval.
**Scope of Phases 1–4:** docs, config and tooling only. **No `game/` file is touched**, so no `docs/` re-sync and no screenshot refresh is needed for them. Phase 5 (optional) would change that and says so.

---

## 0. Summary

1. **The AI startup read is about 225K tokens.** AGENTS.md's orientation protocol makes every agent read six files totalling 899 KB. Most of it is finished work.
2. **The bloat is finished work that never leaves the live files.** 145 of the 146 entries in PROJECT_TASKS.md's "Active" section are DONE (413 KB). The one exception (#155) describes a completed fix under a non-standard label. **No task is NEW or IN PROGRESS.**
3. **Manual trimming does not hold.** Task 88 (2026-08-07) trimmed HANDOVER_PROMPT.md. It was 106 KB on 2026-10-11 and **138 KB two days later**. In the same two days PROJECT_TASKS grew 498 → 534 KB and README 85 → 99 KB. The fix is a structure plus a size guard, not another cleanup.
4. **One task costs four doc edits, twice.** Rules require updating PROJECT_TASKS, README, HANDOVER_PROMPT and CONTRIBUTING at task start and at task end.
5. **Target:** root from 18 `.md` files to 4, AI startup read from about 225K to about 5K tokens, everything done moved to `archive/` with a one-line-per-task index.
6. **New since the first draft:** the Visual/UX plan is **complete (38/38)**, so it is archived rather than kept as the live plan, and no plan is currently open (see Q3).

---

## 1. How the repo is worked on today (verified)

| AI / tool | Entry points in repo | Notes |
|---|---|---|
| OpenCode | `opencode.json`, `AGENTS.md`, `.opencode/skills/validate-game-change/` | Playwright MCP enabled. Default model "Big Pickle". |
| Kilo | `kilo.jsonc`, `.kilo/agent/ponytail.md`, `.kilo/command/*.md` (5) | `compaction.auto=false`, `prune=false`. Default `kilo-auto/free`. |
| Codex | `.codex/instructions.md` | A **divergent copy** of AGENTS.md (5 KB, older). |
| GitHub Copilot | Named in AGENTS.md | No `.github/copilot-instructions.md` exists. 18 commits are co-authored by Copilot, 2 by Copilot Autofix. |
| Claude (this project) | Project instructions | Their file paths will go stale after the refactor (see §7). |
| External reviewers | `resources/General_reviews/` | Commit messages mention `claude_review.md`, `deepseek_review.md`, `ChatGpt_review.md`. Only the last still exists, at 0 bytes. |

Models named in AGENTS.md: Big Pickle (default), MiMo V2.5 Free (images/audio), DeepSeek V4 Flash Free (bulk coding), Nemotron 3 Ultra Free (1M context).

**Shared identity.** Every agent works as the persona "Ponytail Lazy Dev". Git shows 102 of 307 commits under `ponytail@localhost`, the rest under radmanmilos. **All 24 commits made since the first draft are authored as radmanmilos**, so authorship says even less than before. PROJECT_TASKS "who" fields also say "Ponytail Lazy Dev". You cannot tell which tool or model did what.

**Working pattern.** Propose → approve → implement. Smallest correct fix. Task lifecycle written into PROJECT_TASKS. CI: fast gate, diff-driven smoke matrix, release gate. `docs/` mirrors `game/`.

---

## 2. Verified findings

Format per project rules: where / why it hurts / fix / risk / test. Phase numbers refer to §5.

| # | Finding (evidence) | Why it hurts | Fix (phase) |
|---|---|---|---|
| F1 | Orientation protocol (AGENTS.md:109-121) reads PROJECT_TASKS 534 KB + HANDOVER 138 KB + README 99 KB + AGENTS 43 KB + CONTRIBUTING 26 KB + tools/README 59 KB = **899 KB ≈ 225K tokens** (4 chars/token; Cyrillic and emoji cost more). | Exceeds or fills the context of small free models before any work starts. | New startup set (Ph 2) |
| F2 | PROJECT_TASKS.md: "Active" section is 416 KB; 145 of 146 entries are DONE (413 KB, 99%). The only other one is #155, labelled `BUGFIX` (not in the file's own legend) though its text describes a finished fix. #100 and #205, open on 2026-10-11, are now DONE (task 246 closed #100). Largest entry: #178 at 28.7 KB. | Agents must read 413 KB of finished work to learn that nothing is open. | Split active / index / archive (Ph 1) |
| F3 | HANDOVER_PROMPT.md is **138 KB** (was 106 KB). It says "History archived" yet holds 29 session blocks; the newest alone (tasks 242–249) is 17 KB. Two archive files exist in different folders (`resources/General_reviews/HANDOVER_ARCHIVE.md` 167 KB, `resources/handover-archive/…` 32 KB). | The "current-state handoff" is itself a history log. | Replace with overwrite-only STATUS.md (Ph 1) |
| F4 | AGENTS.md is 43 KB. Lines 1-46 (rules) = 8 KB. Lines 47-87 (footguns) = **29 KB**, mostly post-mortems of tasks 164, 177, 178, 180, 181, 223 and similar. Lines reach 1.7K characters. | The rules that matter on every task are buried under incident write-ups relevant to one area each. | Extract to topic files, keep a trigger table (Ph 2) |
| F5 | README.md is **99 KB** (was 85 KB). It contains a **33 KB** "Current status" changelog (was 19 KB), a 10 KB racing3d section, roadmap phases, and folder trees. | The product overview is also the changelog and the per-game manual. | Slim README, one doc per game (Ph 3) |
| F6 | Doc churn in all 307 commits: PROJECT_TASKS touched by 74%, HANDOVER by 65%, README by 40%; **39% touch all three** (37% of the last 100). Offline manifest / sw-cache-list by 44%. `docs/` by 56%. | Constant merge-conflict and stale-copy surface (ANTI_LOOP rule 7 exists because of it). | Task lifecycle v2 (Ph 2) |
| F7 | `docs/` is a byte-exact mirror of `game/` (`diff -rq game docs` clean): 7.6 MB, 257 files. | Every search hits twice. The name `docs/` suggests documentation but is the deployed site. | `.ignore` now (Ph 4); remove the mirror later (Ph 5) |
| F8 | Root holds 18 `.md` files plus `start_ai.bat`, `kilo.jsonc`, `opencode.json`. | Hard to see what is live. | Root diet (Ph 1-3) |
| F9 | `ROADMAP.md` (last touched 2026-10-05) names the Fresh Elevation Roadmap as active and says "Tier A is next". That roadmap is finished, and so is its successor: `node tools/plan_progress.js` now reports **38/38 (100%) — plan complete** (V20–V23 are tasks 237–240). The "single entry point" points at nothing open. | A new agent is told to start work that is already done. | Rewrite ROADMAP.md (Ph 1) |
| F10 | Rule conflict: ANTI_LOOP_RULES #4 says "Update docs, Sync, Commit, Push" after every micro-step. AGENTS.md:42 says never commit or push to `main` automatically. `.kilo/command/sync-docs.md` says "commit and push to main". | Agents following the wrong file push to the live site. | One rule set, no push in any command (Ph 2) |
| F11 | `.codex/instructions.md` duplicates AGENTS.md rules and has drifted. | Two sources of truth. | Reduce to a 3-line pointer (Ph 2) |
| F12 | Small defects: `resources/General_reviews/ChatGpt_review.md` is 0 bytes. `ASSET_BUDGET.md` contains literal `\n` text (one long line). Task #155 carries a non-standard `BUGFIX` status. | Noise and false signals. | Ph 1 / Ph 4 |
| F13 | `resources/` is now **30.5 MB** (was 23 MB; a WIP asset-image bundle was added) with two screenshot stores (`visual-baselines/` 85 PNG, used by `tools/visual_compare.js`; `General_reviews/Screenshot_Review/` 101 PNG, used by `tools/screenshot.js`). `tools/` has 5 one-off scripts (`debug_adv.js`, `debug_evalv.js`, `dilate_test.js`, `probe_b6.mjs`, `tracing_probe.js`). `tools/README.md` is 59 KB. | Both screenshot stores are tool-coupled, so they stay. The probes are clutter. | Ph 4 |
| F14 | Commit history is 72 MiB packed, 307 commits. | Not a working problem. Noted only so nobody tries to "fix" it. | None |

**Baseline run (my sandbox, not your machine; repeated on `71e1b7a` with the same result).** `node tools/check_fast.js`: 6 of 7 stages pass (syntax, registry, CI workflow, scan-alert guards, generated artifacts, offline inventory). `hub smoke` failed with "Chrome not found", which is an environment limit here, not a repo defect. **No browser smoke was run.** `node tools/plan_progress.js` ran fine.

---

## 3. Hypotheses and playtest questions (not verified)

- **H1.** Agent tools built on ripgrep honor a root `.ignore` file. Must be tested per tool (OpenCode, Kilo, Claude Code) before relying on it.
- **H2.** The startup read is what breaks the smaller models. The evidence is size, not an observed failure. Which AI choked, and where, would confirm it.
- **H3.** Kilo's `compaction.auto=false` makes H2 worse. It may be intentional.
- **H4.** Task lifecycle v2 (below) lowers per-task overhead without losing the audit trail. Check after two or three real tasks.

---

## 4. Decisions needed from you

1. **Archive location.** In-repo `archive/` (recommended: still browsable, excluded from AI search by `.ignore`), or delete from the tree and rely on a git tag?
2. **Live-docs folder name.** `project/` OK? (It must not be `docs/`.)
3. **What is the next live workstream?** No task is open and the Visual/UX plan is complete. Candidates I can see in the repo: (a) the emoticon-replacement asset project (`resources/General_reviews/Asset_Generation/`, still Phase 1, inventory awaiting your approval), (b) racing3d tuning (task 249 has your play-test approval), (c) the "Tier A" learning content that the old ROADMAP.md still lists. `STATUS.md` and the new ROADMAP.md need this from you; I will not guess it.
4. **Emoji direction.** The project brief says native emoji animals are a settled choice. The repo now holds a style bible (consolidated 2026-10-13), an asset inventory and a work-in-progress image bundle for replacing emoji with illustrations. Is the replacement approved, or still an exploration? It decides what `DECISIONS.md` records.
5. **Kilo compaction** (`auto:false`, `prune:false`): intentional?
6. **Phase 5** (drop the `docs/` mirror): interested, or leave as is?
7. **Who executes:** your in-repo agents, or I prepare each phase as a patch/zip for you to review and commit?

---

## 5. Target layout

```text
/                        README.md  AGENTS.md  ROADMAP.md  CONTRIBUTING.md   (4 docs)
                         opencode.json  kilo.jsonc  .ignore  .gitignore  .gitattributes
project/                 LIVE docs only
  STATUS.md              overwrite-only: phase, next 3 items, open tasks, blockers (≤ 6 KB)
  DECISIONS.md           locked decisions, one line each: decision · date · source
  PROCESS.md             task lifecycle v2, definition of done, archiving rule
  tasks/ACTIVE.md        NEW / IN PROGRESS only (≤ 20 KB)
  tasks/INDEX.md         one line per task: number · status · date · title · archive file
  lessons/               testing-harness.md  ci-offline.md  game-runtime.md  racing3d.md  security.md
  plans/                 only plans that are still open (none today; the asset project stays in resources/)
  games/<game>.md        one short doc per game
  reference/             OFFLINE.md  ASSET_BUDGET.md  PLAYTESTING.md  SETUP_LINUX.md  opencode-setup.md
archive/                 everything DONE (excluded from search by .ignore)
  tasks/                 tasks-001-099.md  tasks-100-199.md  tasks-200-249.md
  handover/  plans/  reviews/  sessions/   (plans/ includes the finished Visual/UX plan, ledger and master spec)
game/  docs/  tools/  resources/   (unchanged in Ph 1-3)
```

**Token budgets (hard caps, enforced by a guard in Ph 4):**

| File | Now | Target |
|---|---|---|
| AGENTS.md | 43 KB | ≤ 12 KB |
| project/STATUS.md (replaces HANDOVER_PROMPT) | 138 KB | ≤ 6 KB |
| project/tasks/ACTIVE.md (replaces PROJECT_TASKS) | 534 KB | ≤ 20 KB (empty today) |
| README.md | 99 KB | ≤ 12 KB |
| CONTRIBUTING.md | 26 KB | ≤ 4 KB |
| **Startup read** (AGENTS + STATUS) | **≈ 899 KB** | **≈ 18 KB (≈ 5K tokens)** |
| Per-task extras, read on demand | n/a | one game doc (≤ 8 KB) + relevant lessons file |

---

## 6. Phases

Each phase is its own commit (by you), touches no `game/` file, and is reversible. Before Phase 1: `git tag pre-refactor-2026-10-13`.

### Phase 0 — Safety and decisions
- Tag the current commit. Get answers to §4.
- Run `node tools/check_fast.js` on your machine (Chrome present) and record the result as the baseline.

### Phase 1 — Archive finished work (biggest win, lowest risk)
1. **Split PROJECT_TASKS.md with a script, never by hand.** Entries move verbatim. Output: `ACTIVE.md` (open tasks only, **empty at the moment**), `INDEX.md`, and three archive files (tasks 1–99, 100–199, 200–249). Normalise #155's `BUGFIX` label to a legend status.
   - *Checks:* every task number (1–249) appears exactly once across ACTIVE + archives; the byte count of moved entries equals the original; INDEX has one line per task; a grep for `^- 249\.` finds it in INDEX and the archive.
   - *Run it last:* tasks are still landing on `main` (24 commits in two days), so re-run the script against the then-current file immediately before committing.
2. **HANDOVER_PROMPT.md → `project/STATUS.md`.** Keep the newest session summary and the two "traps" block. Older session blocks → `archive/handover/`. Move "Racing game decisions" and any other locked decisions into `DECISIONS.md`. Merge both existing handover archives into `archive/handover/`.
3. **Root clean-up moves:**
   - `CodeReview_Findings.md` (all fixed, 2026-08-03), `SESSION_SUMMARY_2026-10-08.md`, `ROADMAP_AUDIT.md` (self-labelled historical) → `archive/`.
   - `RACING_GAME_PLAN.md`, `RACING_VISUAL_STYLE_ANALYSIS.md` → `archive/plans/` (the umbrella task #100 is closed, task 246).
   - `ASSET_BUDGET.md` (fix its literal `\n`), `OFFLINE.md`, `PLAYTESTING.md`, `SETUP_LINUX.md` → `project/reference/`.
   - `VISUAL_UX_IMPLEMENTATION_PLAN.md` (38/38 complete) → `archive/plans/`, together with `tools/plan_progress.js`, which only serves that plan and is referenced nowhere but `README.md`, `tools/README.md` and itself (no CI use). YAGNI: archive the script rather than repoint it; if you prefer to keep it, change the one `PLAN` path on its line 19.
   - `LEARNING_ROADMAP_REVIEW.md` → `project/reference/`; copy its do-not-build list into `DECISIONS.md`.
4. **Archive completed roadmaps** (Fresh Elevation R0–R27b, the old Master Implementation Plan, PETRIN_SVET_MASTER_EXECUTION_ROADMAP, and the finished Visual/UX master spec) → `archive/plans/`. `project/plans/` starts empty and only receives a plan once one is open.
5. **Rewrite ROADMAP.md** (≈ 20 lines): "no open plan; Visual/UX V0–V23 complete (archived)", the candidate workstreams from Q3 once you pick, links to STATUS and ACTIVE.
6. Delete the 0-byte `ChatGpt_review.md` (with your OK).
- *Risk:* broken links and the hard references in §7. *Test:* link check (`tools/check_docs.js`, Phase 4; until then a one-off grep for dead relative links), `node tools/check_fast.js`.

### Phase 2 — AGENTS.md diet, one rule set, lighter task lifecycle
1. Move the 41 footgun bullets **verbatim** into `project/lessons/*.md` by theme (testing-harness, ci-offline, game-runtime, racing3d, security). Replace them in AGENTS.md with a trigger table, for example "touching `tools/*_smoke*` or `headless.js` → read `lessons/testing-harness.md`" (≈ 1.5 KB).
2. Fold ANTI_LOOP_RULES.md into AGENTS.md (≈ 10 lines). **Drop rule 4's "Push"** and rule 6's "one tool call per step" (it blocks parallel reads). Original → `archive/`.
3. **Orientation protocol v2:** read `AGENTS.md` + `project/STATUS.md`. Everything else on demand, found via `tasks/INDEX.md` and `games/<game>.md`.
4. **Task lifecycle v2** (goes in `PROCESS.md`):
   - Start: add or flip one entry in `ACTIVE.md`.
   - Finish: mark DONE with who/what/why. At session end, a script moves DONE entries to the archive file and adds an INDEX line.
   - `STATUS.md` is **overwritten**, never appended to.
   - README and CONTRIBUTING are **not** edited per task.
   - "Who" records **tool + model** (for example "OpenCode / Big Pickle"). Commits get an `Agent:` trailer. The persona stays; the provenance is added.
5. `.codex/instructions.md` → "Read /AGENTS.md" (3 lines). Update `.kilo/command/where-are-we.md` to the new startup set. Edit `.kilo/command/sync-docs.md` to stop after syncing and report (no commit, no push). Optionally add `.github/copilot-instructions.md` as a pointer (check first that Copilot reads it). Optionally add a root `CLAUDE.md` containing `@AGENTS.md`.
- *Risk:* a rule lost in translation. *Test:* diff the set of bullets before and after (count 41 = 41), and have one agent run the new orientation and report what it read.

### Phase 3 — README diet and per-game docs
- Cut README to ≤ 150 lines: vision, principles, how to run, how to validate, map of `project/`.
- Move each "Current Mini Games" section, including the 10 KB racing3d one, to `project/games/<game>.md`. Move the "Current status" changelog to `archive/`.
- Slim CONTRIBUTING.md; its 12 KB lifecycle section goes to `PROCESS.md`.
- *Test:* link check; an agent asked to work on one game opens only that game's doc and the lessons file it is pointed to.

### Phase 4 — Tools, search noise, and a guard so it stays small
1. **Root `.ignore`:** `docs/`, `archive/`, `game/assets/lib/`, `tools/vendor/`, `*.min.js`, `game/offline-manifest.json`, `game/sw-cache-list.json`, `resources/**/*.png`. Test H1 per tool.
2. Move the 5 one-off probe scripts to `tools/_archive/` after a grep proves nothing references them. Move `opencode-setup-instructions.md` to `project/reference/`. Split `tools/README.md` (59 KB) into a short index plus per-topic files.
3. **`tools/check_docs.js`** (~60 lines, added to `check_fast`): fails if a budgeted file is over its cap, if a relative markdown link is broken, or if a DONE task sits in ACTIVE.md. This is the same "pin the rule, not the diff" principle AGENTS.md already uses, and the answer to Task 88 regrowing.
4. Decide Q5 (Kilo compaction).
- *Risk:* the guard fails on first run. *Test:* run it against the new tree; mutate a file over budget and confirm it goes red (restore from a copy, never `git checkout`).

### Phase 5 — Optional: remove the `docs/` mirror
Deploy `game/` with a GitHub Actions Pages workflow instead of mirroring into `docs/`. Removes 7.6 MB of duplicates, `sync-docs.sh`, and the twice-written manifest files.
- **Not a docs change.** It touches `tools/manifest_hash.js` (hashes over game+docs), `validate_offline.js`, the CI release gate's deployment-artifact validation, `validate_pages.js`, `offline_smoke.mjs`, and the repo's Pages setting (done by you in GitHub).
- Needs its own investigation and approval. **Do not start until Phases 1-4 are stable.** This phase would require `docs/` and screenshot refresh per the repo rules.

---

## 7. Hard references to update when files move (found by grep)

- `tools/plan_progress.js:19` reads `VISUAL_UX_IMPLEMENTATION_PLAN.md` by path (archived together with the plan; also remove its mentions in `README.md` and `tools/README.md`).
- `tools/ai_startup.ps1` and `start_ai.bat` read `PROJECT_TASKS.md`.
- `.kilo/command/where-are-we.md` lists PROJECT_TASKS, HANDOVER_PROMPT, README, CONTRIBUTING, CodeReview_Findings by name.
- `.codex/instructions.md`, `.kilo/agent/ponytail.md`, `.opencode/skills/validate-game-change/SKILL.md` name root docs.
- Cross-links inside ROADMAP.md, README.md, tools/README.md and `resources/General_reviews/Screenshot_Review/TABLE_OF_CONTENT.md`.
- **The Claude Project instructions** list ROADMAP.md, PROJECT_TASKS.md, HANDOVER_PROMPT.md, the master spec path, and the plan ledger. Update them after Phase 1.
- Left alone on purpose: two comments in `game/games/phonics.js:15` and `game/pages/parent.html:196` mention "PROJECT_TASKS task N". Task numbers stay valid through INDEX, and editing `game/` would trigger the docs re-sync and manifest churn.
- `tools/guards/games_map_negtest.js:192` uses `PROJECT_TASKS.md` only as a sample string. Harmless.

**CI.** From reading `tools/run_all.js:152-169`, paths outside `game/` map to no smokes, so docs-only pushes should skip the smoke matrix. I did not execute this. Changes under `tools/` (Phase 4) may escalate to the full battery by design.

---

## 8. Not proposed (and why)

- **Splitting large code files** (`racing3d.mjs` 99 KB, `kitty-standalone.js` 101 KB). That is a code refactor with regression risk and no evidence yet that agents fail on it. If they do, first add a section map with line ranges to `project/games/racing3d.md`.
- **Replacing the persona or the propose-then-approve flow.** They work; only provenance is added.
- **Changing locked game decisions** or touching `game/`.
- **Rewriting task or lesson text.** Everything moves verbatim.

---

## 9. Definition of done for this refactor

- Root has 4 `.md` files; `ACTIVE.md` has only open tasks; the startup set is ≤ 18 KB.
- Every moved task is findable by number in `INDEX.md`; counts match the pre-refactor tag.
- `node tools/check_fast.js` is green on a machine with Chrome, including the new docs guard.
- Every AI entry file (`.codex`, `.kilo`, `.opencode`, Claude Project) points at the same `AGENTS.md` and `STATUS.md`.
- The finished plan itself is moved to `archive/plans/`.
