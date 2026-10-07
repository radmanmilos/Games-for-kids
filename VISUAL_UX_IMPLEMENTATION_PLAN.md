# Visual / UX Implementation Plan (V0–V23)

**Created:** 2026-10-07
**Source spec:** `resources/General_reviews/Petrin_svet_Master_Visual_UX_Implementation_Plan_2026-10-07.md` (3,445 lines)
**Status:** ACTIVE — execution list, not a competing roadmap

---

## 0. Relationship to the source spec

This document is **subordinate** to the Master Visual/UX Implementation Plan. Per that
document's §60 (*"Do not create a second conflicting visual roadmap"*), the spec is the
authoritative handoff; this file is its **code-verified execution list**.

What this file adds and deliberately does not do:

| | |
|---|---|
| **Adds** | each phase re-expressed as concrete, verifiable work items; every claim checked against the current tree; an explicit **BUILD** vs **VERIFY-FIRST** verdict per phase; the stale §1.1 facts corrected. |
| **Does not do** | re-decide priorities, invent new phases, relax any rule, or contradict the spec. Where the spec says "do not over-design", this file says so too. |

**Governing rules carried over unchanged** (spec §64 MASTER CONTRACT, §52, Appendix C):

- Preserve existing functionality; inspect before editing.
- The current repository is **newer than old roadmaps** — never resurrect old Explorer,
  Racing3D world-count, manifest, offline-list or animal-SVG/Twemoji work.
- Solve shared problems **once**; never five copies of the same header CSS.
- Consistency is shell / hierarchy / interaction / semantics — **not** identical
  backgrounds, cards or decoration.
- **844×390 is first-class.** Inspect it before declaring any child screen finished.
- Never sacrifice the mechanic to save chrome: remove decoration → collapse secondary UI
  → relocate utility → simplify status → *then* resize.
- Never hide a bug behind styling. `[object Object]`, clipping, title-under-back and a
  stuck drag are **blockers**, not polish items.
- Semantic colour only: green = correct/safe, yellow = attention/selected, plum =
  structure, pink = creative, sky/blue = movement, violet = learning/focus.
- Petrin Glow means *"look here / this is active"* — never *"you won"*.
- Audio never blocks gameplay. Reduced motion replaces motion with static feedback.
- Everything stays offline and local. No CDN fonts, icons or illustration libraries.
- **Final test (spec §66):** the product should need *fewer* visual rules to explain it
  after the work than before. *"More coherent without becoming more uniform."*

---

## 1. Current state — verified, not assumed

The spec's §1.1 names `main HEAD = 0e5bb53`. That is **stale in both directions** and is
corrected here against the actual tree at `3419c70`:

| Spec claim | Verified reality |
|---|---|
| "current main HEAD is `0e5bb53`" | HEAD is **`3419c70`**; 17 commits landed after the spec's snapshot. |
| "screenshot review contains 100 screenshots" | **True.** `resources/General_reviews/Screenshot_Review/` — 100 PNGs, 25 pages, 4 viewports, task 213, Chrome 155. |
| "stable state identifiers / deterministic seeded state" (V0 deliverables) | **Not present.** `capture-manifest.json` records **zero** states; filenames are `<page>_<viewport>.png` only. V0 is the review *folder*, not state capture. |
| "shared shell classes" (V2 premise) | **None exist.** `game/styles/` holds only `design-tokens.css` + `viewport.css`; no `ps-header`, `ps-title`, `ps-shell` anywhere in `game/`. |
| "Petrin Glow" (V6 premise) | **Does not exist.** No `ps-focus-glow` / `petrin-glow` in any CSS or JS. |
| "tactile component system" (V7 premise) | **Does not exist.** No `ps-btn` / `ps-card` / `ps-modal` classes. |
| "back arrows use the canonical Material `arrow_back` SVG" | **True** (task 207) — and now guarded in `validate_pages.js`. |
| "Animal Puzzle shows `[object Object]`" (V1 blocker) | **TRUE — root cause confirmed.** See V1 below. |
| "Rhythm is a 4-pad drum set" | **True** (task 206). |
| "Spatial has 15 rounds" | **True** (task 208). |
| "Sequencing has 8 plant-growth sequences" | **True** (task 203). |
| "Classroom Време + Годишња доба exist" | **True** (task 203). |
| "Racing3D steering root cause fixed" | **True** (task 212). |

**Consequence:** V2, V6 and V7 are genuine greenfield work, not refactors. V0 is
half-built. Several later phases may already be satisfied by the 17 commits and must be
verified before any edit.

---

## 2. Execution order

Ordered by the spec's own priority matrix (§55) and Appendix E. Each item is tagged:

- **BUILD** — verified absent; real work required.
- **VERIFY** — may already be satisfied; inspect first, edit only on evidence.
- **BLOCKED** — cannot proceed for a reason outside this pass.

### Phase 0 — Foundations

| ID | Work | Verdict |
|---|---|---|
| **V0.1** | Deterministic gameplay-state capture: stable state ids, seeded state, capture helper, per-game state map, `<game>__<viewport>__<state>.png` naming, state metadata. | **BUILD** — review folder exists, state support does not. |
| **V0.2** | Wire state capture into `tools/screenshot.js --review=<name>` and the `Screenshot_Review` TOC/provenance. | **BUILD** |

### Phase 1 — P0 blockers

| ID | Work | Verdict |
|---|---|---|
| **V1.1** | **Animal Puzzle `[object Object]`.** Root cause confirmed: `game/games/animal_puzzle.js:340` initialises `rows`/`columns` to `GRIDS[0]` — an **object** `{rows:1,cols:2}`. `setGrid()` (line 344) converts them to numbers, but line **598** calls `updateLabels()` with **no preceding `setGrid()`**, so line 353 renders `[object Object]×[object Object]`. Fix: initialise to numbers (`GRIDS[0].rows`, `GRIDS[0].cols`) **and** make `setGrid()` run before any `updateLabels()`. | **BUILD** — smallest P0, root cause pinned. |
| **V1.2** | Header rule for Animal Puzzle phone portrait: `[back] Слагалица / 1. сцена` or `[back] Слагалица 1/5`; no grid internals unless child-valuable. | **BUILD** (follows V1.1) |

### Phase 2 — Shared shell (P0, greenfield)

| ID | Work | Verdict |
|---|---|---|
| **V2.1** | Create `game/styles/shell.css` with the spec's §8.1 canonical header contract: `.ps-shell`, `.ps-header`, `.ps-header-left/-center/-right`, `.ps-title`, `.ps-subtitle`, `.ps-status`. | **BUILD** — no shared shell CSS exists. |
| **V2.2** | Safe-area foundation: `--ps-safe-{top,right,bottom,left}` from `env(safe-area-inset-*)`, composed spacing (spec §9). One system only. | **BUILD** |
| **V2.3** | Migrate Animal Puzzle → shared header. | **BUILD** |
| **V2.4** | Migrate Classroom → shared header. | **BUILD** |
| **V2.5** | Migrate Coloring → shared header. | **BUILD** |
| **V2.6** | Migrate Piano → shared header. | **BUILD** |
| **V2.7** | Migrate Ocean → shared header. | **BUILD** |
| **V2.8** | Migrate Space → shared header. | **BUILD** |
| **V2.9** | Migrate Driving → shared header. | **BUILD** |
| **V2.10** | Migrate Memory → shared header. | **BUILD** |
| **V2.11** | Migrate remaining pages with top-cluster collisions. | **VERIFY** — identify from screenshots first. |

> **Spec constraint (§20):** *"Do not perform a mechanical 'replace all headers' edit."*
> Each page: identify current shell → map title/status/utility → preserve the gameplay
> stage → migrate → test four viewports.

### Phase 3 — Short landscape (P0/P1)

| ID | Work | Verdict |
|---|---|---|
| **V3.1** | Audit all 25 surfaces at **844×390** against the §11 checklist (header fits, back visible, title visible, primary interaction fits, board/tray fits, bottom controls fit, modal fits, no h-overflow, no accidental v-scroll, no clipped object, no tiny essential text). | **VERIFY** — produce the audit table first. |
| **V3.2** | Fix every failure by the §11 order: remove decoration → collapse secondary text → move secondary controls → resize stage → only then reduce non-critical typography. | **BUILD** (per V3.1 findings) |

### Phase 4 — Adventure HUD (P1)

| ID | Work | Verdict |
|---|---|---|
| **V4.1** | Unify Dino / Driving / Ocean / Space / Explorer / Maze / Racing3D: back, title treatment, modal backdrop, control shadow, semantic feedback, orientation behaviour. | **BUILD** |
| **V4.2** | Keep worlds distinct — Ocean ≠ Space, Driving ≠ card UI, Explorer ≠ Racing3D HUD. | constraint on V4.1 |

### Phase 5 — Learning stage (P1)

| ID | Work | Verdict |
|---|---|---|
| **V5.1** | Introduce the §23 learning-stage grammar: instruction zone / stage-play mat / answer-object zone / feedback layer. A layout grammar, **not** a skin; no forced rectangular container. | **BUILD** |

### Phase 6 — Petrin Glow (P1, greenfield)

| ID | Work | Verdict |
|---|---|---|
| **V6.1** | One reusable focus treatment. Spec's reference contract: `box-shadow: 0 0 0 3px rgb(155 109 255 / .16), 0 8px 22px rgb(74 63 107 / .12)`. | **BUILD** — does not exist. |
| **V6.2** | Apply to: current card, expected placement, selected object, active control, hint target, focus. Never to errors; never continuous; never a replacement for semantic green/yellow. | **BUILD** |

### Phase 7 — Tactile system (P1, greenfield)

| ID | Work | Verdict |
|---|---|---|
| **V7.1** | Standardise primary button, secondary button, icon button, back button, selectable card, draggable object, modal, status chip, instruction strip, completion state — each with normal / pressed / selected / disabled / correct / hint. | **BUILD** — no component classes exist. |

### Phase 8 — Animal content (P2)

| ID | Work | Verdict |
|---|---|---|
| **V8.1** | Keep native emoji. Improve composition only: larger readable card, clear name, speaker affordance, subtle idle cue, consistent spacing, consistent selection feedback. | **VERIFY** — spec §26 forbids a new illustration dependency without a coherent full set, better demonstrated quality, local bundling, documented licensing and a simultaneous all-animal update. |

### Phases 9–20 — Page-specific (P2)

| ID | Work | Verdict |
|---|---|---|
| **V9** | Maze elevation → cozy garden journey (green ground, 2–4 motifs, house landmark, path contrast, clear walls). No enemies/timer/punishment. | **BUILD** |
| **V10** | Rhythm: four pads read as **drums** — icon contrast, tactile surface, clear active state, depth, percussion symbolism. Mode distinction clear without a complex menu. No extra pads. | **BUILD** |
| **V11** | Counting: enlarge stage, move instruction closer, reduce dead space, comfortable choices, immediate feedback, full mechanic at 844×390. **No quantity 11–20** (curriculum decision, not visual). | **BUILD** |
| **V12** | Memory: near-square cards, strong central back symbol, inner padding, clear flip state, matched state settles. Fix portrait title/back collision and short-landscape difficulty controls. Do not shrink cards to fit. | **BUILD** |
| **V13** | Classroom: fix tablet-portrait title overlap, title safe zone, hierarchy between «За малишане»/«За децу» and the page title. Remove dependence on `#classroomTitle { position: absolute; top: 4vmin; }`. Preserve the activity grid. | **BUILD** |
| **V14** | Coloring header: title owns header centre, mode is secondary, next is a clear action in a dedicated location, canvas stays dominant. Piano: repair shell geometry only; keyboard is the hero. | **BUILD** |
| **V15** | Sorting: rounded bucket material, plum labels (not black), softer typography, clear destination surfaces, full tray visibility in short landscape. | **BUILD** |
| **V16** | Sequencing: soft paper/tray material, slightly larger pieces, clearer placement feedback, small completion moment. No decorative story text. | **BUILD** |
| **V17** | Shapes: subtle play mat, better shape material, clear selected state. Do not over-design; spatial relationship stays the hero. | **BUILD** |
| **V18** | Phonics: letter glow, speaker cue, subtle object highlight, immediate success feedback. Never text-heavy; no alphabet wall. | **BUILD** |
| **V19** | Parent visual system: grouped cards, readable labels, progress summaries, expandable details, restrained colour. Never a developer dashboard, never child toy shadows, never tiny dense metrics. May begin after V2. | **BUILD** |
| **V20** | Hub: improve vertical rhythm, enlarge/relocate useful clusters, preserve calmness, keep parent/technical utilities out of the child hub. Do not fill space with decorative noise. | **VERIFY** — spec calls the hub one of the strongest screens. |

### Phase 21–23 — Audit and baseline

| ID | Work | Verdict |
|---|---|---|
| **V21** | Semantic motion pass: classify every animation (idle/press/hint/success/transition/celebration); delete decorative motion that fails the §39 tests. | **VERIFY** — 14 files currently contain `@keyframes`. |
| **V22** | Icon system: canonical `arrow_back` for back; consistent stroke/weight/scale/contrast elsewhere. Do not replace game-world icons for consistency's sake. | **VERIFY** |
| **V23** | Final visual QA baseline: regenerate deterministic screenshots, inspect all four viewports and all states, update TOC + provenance, review drift, full smoke, accessibility, offline. | **BUILD** — only after V1–V22. |

---

## 3. Acceptance criteria

A task is done only when the spec's §62 Definition of Done passes:

- **Composition** — no overlap, no clipping, primary action obvious, title safe, whitespace intentional.
- **Interaction** — target looks tappable, is large, press/selection/correct/hint states all work.
- **Identity** — belongs to Петрин свет, keeps game personality, semantic colours respected, icons coherent.
- **Device** — 390×844, 844×390, 820×1180, 1180×820.
- **Accessibility** — reduced motion, labels, non-color-only states, contrast, robust pointer handling.
- **Reliability** — no console errors, smokes pass, no new offline failure, no stuck input, no audio exception.
- **Screenshot** — affected shots refreshed, TOC updated, state documented, no unexplained drift.

Plus the spec's Appendix C anti-patterns as hard rejects, and §51's per-screenshot
questions (composition / interaction / identity / device / emotion).

---

## 4. Immediate next step

**V1.1 — Animal Puzzle `[object Object]`.** Smallest P0, root cause confirmed with line
numbers, fix is two lines. Doing it first proves the verification method on the cheapest
possible case before the greenfield shell work.

Then V1.2, then V0.1/V0.2 (state capture) so that every later phase can be screenshot-verified
as the spec's §17 workflow requires.