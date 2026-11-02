# BUILD-INSTRUCTIONS.md

**Audience:** automated build/coding agent (and human reviewers)
**Source:** full code review of `radmanmilos/Games-for-kids`
**Goal:** apply the review's findings as a sequence of small, independently verifiable changes.

---

## 0. Read-first contract (do not skip)

Before writing any code:

1. Read `AGENTS.md`, `PROCESS.md`, and `DECISIONS.md` in full. Their rules override this document where they conflict.
2. Read the current `app-registry.js`, `navigation.js`, `audio.js`, and the service worker.
3. Run the fast-gate exactly as documented in `AGENTS.md` / `PROCESS.md` and record the baseline result. **If the gate is red before you start, stop and report — do not "fix forward".**

### Global rules for every task

- **YAGNI.** No new dependencies, no refactors outside the stated scope, no "while I'm here" changes.
- **Reuse existing patterns.** Match the style of neighbouring files.
- **One task per commit/PR.** Each task below is independently reviewable and revertable.
- **Screenshot evidence required** for any task that changes rendering (per the project's definition of done).
- **If reality contradicts this document, STOP and report.** Do not guess. Several tasks below have an explicit "investigate first" branch for exactly this reason.

---

## Task 0 — Investigation (blocking, no code changes)

The review found that `animals.html` contains only the text `Пронађи` and `animal_counting.html` is empty, while the game scripts query specific element IDs (`animalCard`, `animalEmoji`, `animalName`, …). **Confirm or refute this before doing anything else.**

Steps:

1. Open every registered page listed in `app-registry.js` and record which ones have real markup vs. empty/stub bodies.
2. Search the repo for a build step, template engine, `document.write`, `insertAdjacentHTML`, server-side injection, or any process that populates HTML at runtime.
3. Cross-reference each game script's `getElementById(...)` / `querySelector(...)` calls against the IDs actually present in its HTML file. Produce a table: `page | missing IDs | script that needs them`.

**Output:** a short report committed as `docs/investigation-dom-shells.md`.
**Gate:** do not proceed to Task 1 until a human confirms the branch (A or B) below.

---

## Task 1 (P0) — Restore runnable pages

### Branch A — No build step exists (most likely)
The HTML files are truncated and must be restored.

For each page flagged in Task 0:
1. Add the minimal markup required by that page's script — use the element IDs the script queries, the classes the CSS targets, and the ARIA attributes already implied by existing accessible components (see any working page as the reference pattern).
2. Do **not** add logic to HTML; keep it declarative and match existing structure/indentation.
3. Preserve existing `<head>` includes (manifest link, service worker registration, stylesheet order, script `type="module"`/defer order).

**Acceptance criteria**
- Every game in the registry boots with **zero** console errors.
- Every ID/selector referenced by a page's script exists in that page.
- Fast-gate is green.
- Screenshots attached for each restored page (initial state + one interaction).

### Branch B — A build step exists but is undocumented
1. Do **not** edit generated HTML.
2. Document the generation command and inputs in `PROCESS.md`.
3. Add the generation step to the fast-gate so stale generated HTML fails CI.
4. Add a "generated file — do not edit" header to each generated HTML file.

---

## Task 2 (P1) — Defensive DOM guards

Prevent hard crashes when a page is partially loaded or an element is renamed.

For every game script:
1. After each `getElementById` / `querySelector` used at module top level or in a boot function, add a guard. Preferred pattern (match existing style):

```js
const animalCard = document.getElementById('animalCard');
if (!animalCard) return; // page not mounted; bail quietly
```

2. If a script has multiple required elements, prefer a single early-return check that lists all required IDs, so failure is obvious:

```js
const required = ['animalCard', 'animalEmoji', 'animalName'];
const els = Object.fromEntries(required.map(id => [id, document.getElementById(id)]));
if (required.some(id => !els[id])) return;
```

3. Do **not** swallow errors silently in a way that hides real bugs — log once at `console.warn` with the page name, then bail.

**Acceptance criteria**
- Removing any single required element from a page (test locally) results in a warning, not an uncaught `TypeError`.
- Existing behaviour unchanged on the happy path.
- Fast-gate green; screenshots unchanged.

---

## Task 3 (P3, do before P2) — Replace `innerHTML` with safe DOM APIs

Scope: `animal_memory.js` and any other script that builds nodes with `innerHTML`.

1. Replace templated `innerHTML` string building with `document.createElement` + `textContent`, or `<template>` cloning if a template already exists.
2. For static content, `textContent` is mandatory. If a template clone is genuinely simpler, use it and document why in a one-line comment.
3. Do not change markup structure, classes, or behaviour — this is a pure safety/consistency refactor.

**Acceptance criteria**
- `grep -R "innerHTML" src/` returns only comments or justified template uses (each with a reason comment).
- Visual diff of affected pages is empty (screenshot compare).
- Fast-gate green.

---

## Task 4 (P2) — Unit tests for pure logic

Add tests only for side-effect-free functions. No DOM, no timers, no audio.

1. Extract pure helpers (shuffle, match detection, registry lookup/route resolution, score math) into named, exported functions if they are currently inline. Keep extraction minimal and behaviour-preserving.
2. Use Node's built-in test runner (`node:test` + `node:assert`) — **no new dependencies**.
3. Add `test/*.test.js` with one test file per helper module.
4. Wire the test command into the fast-gate ahead of the existing checks.

Suggested first coverage set:
- Shuffle: deterministic length, permutation preserved, works for n=0/1.
- Match detection: correct pair, wrong pair, already-matched card.
- Registry: every route resolves to a known page; no duplicate ids/paths.
- Route normalisation: trailing slash, case, unknown route → fallback.

**Acceptance criteria**
- `node --test` passes locally and in CI.
- Pure helpers have no `window`/`document` references.
- Fast-gate runs the tests first; a failing test fails the gate.

---

## Task 5 (P4) — Formatter + linter (adopt, don't churn)

1. Add Prettier with the smallest config that matches the existing codebase (infer from current files; do not reformat the whole repo in the same commit).
2. Run Prettier **only on files you touch** until a separate, clearly-labelled "format-only" commit is approved.
3. Add ESLint with a minimal ruleset: `no-undef`, `no-unused-vars`, `eqeqeq`, `no-implicit-globals`. Fix only violations in touched files; file the rest as follow-up.
4. Add both to the fast-gate as **warn-only** for one release cycle, then promote to errors.

**Acceptance criteria**
- Config files committed and documented in `PROCESS.md`.
- `npm run format:check` and `npm run lint` exist and run in the gate.
- No behaviour changes; screenshots unchanged.

---

## Task 6 (P5) — Accessibility audit (after Task 1)

Only start once pages actually render.

1. Run an automated a11y audit (axe or Lighthouse) on every registered page; save reports under `docs/a11y/`.
2. Manually verify: keyboard-only traversal reaches every interactive element; focus is visible; Enter/Space activate cards; no focus traps.
3. Fix only **critical/serious** findings in this task; log the rest as follow-up issues.
4. Add the automated audit to CI as warn-only initially.

**Acceptance criteria**
- Zero critical/serious axe findings on all pages.
- Keyboard-only playthrough of each game succeeds.
- Reports committed.

---

## Definition of done (every task)

- [ ] Scope matches exactly one task above.
- [ ] Fast-gate green.
- [ ] Screenshots (before/after) attached for UI-affecting tasks.
- [ ] No new dependencies (or explicit approval recorded in `DECISIONS.md`).
- [ ] `docs/` updated where the task says so.
- [ ] Commit message references the task ID (e.g. `fix(dom): restore animals page shell — Task 1A`).

## STOP conditions (report, don't proceed)

- Task 0 findings contradict this document.
- Fixing one task requires touching files owned by another task.
- A "quick fix" would require adding a dependency.
- The fast-gate was already red at baseline.
- You cannot produce screenshot evidence for a UI change.

## Reporting format (after each task)

```
Task: <id + name>
Branch taken (if applicable): <A/B>
Files changed: <list>
Fast-gate: <pass/fail + key output>
Screenshots: <links/paths>
Deviations from instructions: <none | description + reason>
Open questions: <none | list>
```