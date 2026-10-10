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
| **V0.1** | Deterministic gameplay-state capture: stable state ids, seeded state, capture helper, per-game state map, `<game>__<viewport>__<state>.png` naming, state metadata. | **DONE** (2026-10-08, task 216 — `tools/visual-states.json` + state support, commit `af80862`) |
| **V0.2** | Wire state capture into `tools/screenshot.js --review=<name>` and the `Screenshot_Review` TOC/provenance. | **DONE** (2026-10-08, task 216 — `--state=<id>`, commit `af80862`) |

### Phase 1 — P0 blockers

| ID | Work | Verdict |
|---|---|---|
| **V1.1** | **Animal Puzzle `[object Object]`.** Root cause confirmed: `game/games/animal_puzzle.js:340` initialises `rows`/`columns` to `GRIDS[0]` — an **object** `{rows:1,cols:2}`. `setGrid()` (line 344) converts them to numbers, but line **598** calls `updateLabels()` with **no preceding `setGrid()`**, so line 353 renders `[object Object]×[object Object]`. Fix: initialise to numbers (`GRIDS[0].rows`, `GRIDS[0].cols`) **and** make `setGrid()` run before any `updateLabels()`. | **DONE** (2026-10-08, task 216, commit `9023b6f`) |
| **V1.2** | Header rule for Animal Puzzle phone portrait: `[back] Слагалица / 1. сцена` or `[back] Слагалица 1/5`; no grid internals unless child-valuable. | **DONE** (2026-10-08, task 216, commit `6753226`) |

### Phase 2 — Shared shell (P0, greenfield)

| ID | Work | Verdict |
|---|---|---|
| **V2.1** | Create `game/styles/shell.css` with the spec's §8.1 canonical header contract: `.ps-shell`, `.ps-header`, `.ps-header-left/-center/-right`, `.ps-title`, `.ps-subtitle`, `.ps-status`. | **DONE** (2026-10-08, task 216) |
| **V2.2** | Safe-area foundation: `--ps-safe-{top,right,bottom,left}` from `env(safe-area-inset-*)`, composed spacing (spec §9). One system only. | **DONE** (2026-10-08, task 216) |
| **V2.3** | Migrate Animal Puzzle → shared header. | **DONE** (2026-10-08, task 216 — `shell.css` linked, header/title rule landed with V1.2) |
| **V2.4** | Migrate Classroom → shared header. | **DONE** (2026-10-08) — title in `.ps-header` flow row with 16vmin corner zones, hub is the pinned-header scroller; smoke §31 overlap check added. |
| **V2.5** | Migrate Coloring → shared header. | **DONE** (2026-10-08) — name/status own the `.ps-header` centre; mode + palette + clear in an in-flow `.coloring-tools` row below the band; 5 §32 geometry checks in `coloring_smoke` (23→28). |
| **V2.6** | Migrate Piano → shared header. | **DONE** (2026-10-08) — title in `.ps-header` flow row, `max(12vmin, 56px)` band (back button's 56px a11y floor beat 12vmin and tucked the portrait primary button 294px² under its corner); 5 §32 geometry checks in `piano_smoke` (25→30). |
| **V2.7** | Migrate Ocean → shared header. | **DONE** (2026-10-08) — title in an absolute `.ps-header` overlay (canvas keeps full-bleed), band `max(12vmin, 64px)` (generic button floor); HUD trio drops below the band in portrait where five items can't fit 390px. Cleared title∩worlds 545px², title∩score 244px², back∩music 1305px² (phone) and title∩music 260px² (tablet). 4 §42.10 checks in `ocean_smoke` (23→27). |
| **V2.8** | Migrate Space → shared header. | **DONE** (2026-10-08) — title in an absolute `.ps-header` overlay (full-bleed canvas preserved), band `max(12vmin, 64px)` (generic button floor); HUD trio drops below the band in portrait. Fixes title∩worlds 684px², title∩score 689px², back∩music 1305px² (390×844) and title∩music 896px² (768×1024). 4 §42.11 geometry checks in `space_smoke` (24→28), measured after `document.fonts.ready` so font-swap transients can't flake. Related: `ocean_smoke`'s V2.7 pairwise check hardened the same way (scoped to title+back clear, deterministic). **Deferred to V4 (adventure HUD unification, spec line 1366):** the score card vs the fixed-offset 🌍/🔊 buttons is a font-width-coupled HUD coupling shared by all 4 adventure worlds — not introduced here. |
| **V2.9** | Migrate Driving → shared header. | **DONE** (2026-10-08; §42.9's road-trip scenery is separate content, not this header row) |
| **V2.10** | Migrate Memory → shared header. | **DONE** (2026-10-08) |
| **V2.11** | Migrate remaining pages with top-cluster collisions. | **DONE** (2026-10-08) — VERIFY sweep of all 16 non-migrated pages with back buttons (animal_counting, animals, compare, dino, explorer, matching_game, maze, phonics, rhythm, sequencing, shapes, sorting, spatial, tracing, parent, racing3d) at 390×844: zero top-band collisions. All spec-named collision pages (§42.3/5/6/9/10/11) were already migrated in V2.4–V2.10. No further migration needed. |

> **Spec constraint (§20):** *"Do not perform a mechanical 'replace all headers' edit."*
> Each page: identify current shell → map title/status/utility → preserve the gameplay
> stage → migrate → test four viewports.

### Phase 3 — Short landscape (P0/P1)

| ID | Work | Verdict |
|---|---|---|
| **V3.1** | Audit all 25 surfaces at **844×390** against the §11 checklist (header fits, back visible, title visible, primary interaction fits, board/tray fits, bottom controls fit, modal fits, no h-overflow, no accidental v-scroll, no clipped object, no tiny essential text). | **DONE** (2026-10-09, task 217) — `node tools/short_landscape_audit.js` → `resources/General_reviews/SHORT_LANDSCAPE_AUDIT.md`. **Result: 25 surfaces · 9 OK · 13 WARN · 4 FAIL** (`sorting` tray item 23px below fold; `matching_game` candy bottom row 16px below fold; `dino` back button covered by the boot hero-picker (`#adv-dino-picker.show`); `space` `#adv-score` ∩ `#adv-worlds-btn` 254px² — only with a long world name like «Сатурнови прстенови», so it is intermittent in real play and captured deterministically by seeding `Math.random` + `getAnimations().cancel()` (both were run-to-run flip-flops before: `pause()` froze WAAPI at arbitrary progress). **WARN adjudications:** (a) header budget 75–90px (maze 90, memory 88, compare/driving/ocean/space/dino 83, piano 75) = advisory cross-ref V4 (adventure chrome family) / V9 (maze redesign) / V12 (memory), not V3.2; (b) titleless stage-led pages (`animals`, `animal_counting`, `shapes`, `phonics`) = accepted, the stage is the header per §23/§31 grammar; (c) `animal_memory` v-scroll 432px + `.diff-btn` scroll + 88px header = owned by V12 (spec's short-landscape difficulty controls); (d) `parent` gate scroll = by design (task 201); (e) `racing3d` picker «Крени» needs scroll = adjudicated WARN→fix (§11 "modal fits"), pulled into V3.2. Exits 1 while any FAIL remains — a worklist, deliberately NOT in `check_fast`/CI. |
| **V3.2** | Fix every failure by the §11 order: remove decoration → collapse secondary text → move secondary controls → resize stage → only then reduce non-critical typography. | **DONE** (2026-10-09, task 219) — audit now reads **25 surfaces · 0 FAIL**. (1) `sorting.html` desktop sizing (`@media (min-width:800px)`, 112px items/230px baskets) height-guarded with `and (min-height:600px)` so short landscape keeps the compact `vmin` sizing (~310px). (2) `matching_game.html` — `#candyHintBtn`'s 44px floor (task 211) inflated the level row; the bar outgrew candy.js's `14vmin` budget and the flex column **silently shrank `.candy-grid`** (326→310) while its absolute tiles did not (bottom row 16px below fold) → hint moved **out of the row flow** (absolute, right of the bar block) + `flex:none` so the stage can never silently shrink. (3) `dino.html`/`shared/adventure.css` — `#adv-dino-picker` `z-index:25` covered the back button (20) at boot → lowered to **15** (HUD/buttons 10–12 still covered; win/worlds modals 20/30 still above). (4) `shared/adventure.css` — `#adv-score` capped at **176px** (`200−16−8`, border-box) + world-name ellipsised (long «Сатурнови прстенови» widened it to 188 → 254px² ∩ `#adv-worlds-btn`); 164px cap in the `≤329px` breakpoint. (5) `racing3d.html` start box overflowed its 92% cap by 123px → `@media (max-height:520px)` compact layout (padding/h1/grid card, kart-colour label collapsed, button line-height). `check_fast` 7/7; 6 affected smokes 164 checks green; `sync-docs.sh` + `build_offline.js`; 20 screenshots refreshed (`--task=219`). |

### Phase 4 — Adventure HUD (P1)

| ID | Work | Verdict |
|---|---|---|
| **V4.1** | Unify Dino / Driving / Ocean / Space / Explorer / Maze / Racing3D: back, title treatment, modal backdrop, control shadow, semantic feedback, orientation behaviour. | **DONE** (2026-10-09, task 220) — header defined **once** in `shared/adventure.css` (`.ps-header` overlay band + `#adv-title` in flow at `--ps-safe-top` + portrait HUD-drop rule), 3 verbatim inline `.ps-header` copies removed (`driving`/`ocean`/`space`), **dino** migrated to the shared row (last world on the old absolute title), **explorer** back-shadow + plum scrims. `maze`/`racing3d` already conformant → untouched (V4.2). `dino_smoke` gained the portrait geometry + defined-once checks, negative-tested. `check_fast` 7/7, affected smokes green, audit 0 FAIL, screenshots `--task=220`. |
| **V4.2** | Keep worlds distinct — Ocean ≠ Space, Driving ≠ card UI, Explorer ≠ Racing3D HUD. | constraint on V4.1 |

### Phase 5 — Learning stage (P1)

| ID | Work | Verdict |
|---|---|---|
| **V5.1** | Introduce the §23 learning-stage grammar: instruction zone / stage-play mat / answer-object zone / feedback layer. A layout grammar, **not** a skin; no forced rectangular container. | **DONE** (2026-10-09, task 221) — new `game/styles/learning-stage.css` names the four regions (`.learn-instruction`/`.learn-stage-mat`/.`learn-answers`/`.learn-feedback`) + opt-in `.learn-stage` container; pure hooks (overflow-safety only), no skin, no forced box. Linked from all 14 learning pages; region-tagged reference set = compare/phonics/sequencing/sorting/spatial (static zones); JS-injected-zone pages adopt next learning task. Fixed `sequencing.html`'s malformed `accessibility.css` link en route. Guards: `hub_smoke` static + per-page runtime region checks in the 5 smokes, negative-tested. `check_fast` 7/7, 15 learning smokes green. |

### Phase 6 — Petrin Glow (P1, greenfield)

| ID | Work | Verdict |
|---|---|---|
| **V6.1** | One reusable focus treatment. Spec's reference contract: `box-shadow: 0 0 0 3px rgb(155 109 255 / .16), 0 8px 22px rgb(74 63 107 / .12)`. | **DONE** (2026-10-09, task 222) — `.ps-focus-glow` added once to the shared `game/shared/accessibility.css` (global, zero page edits), exact §24 contract, static (no reduced-motion variant needed). Not applied yet — that is V6.2. Guards: `hub_smoke` pins the class + the exact shadows and that every child page links `accessibility.css` (negative-tested; would have caught the task-221 sequencing link bug). `check_fast` 7/7, `hub_smoke` 17→19. |
| **V6.2** | Apply to: current card, expected placement, selected object, active control, hint target, focus. Never to errors; never continuous; never a replacement for semantic green/yellow. | **DONE** (2026-10-09, task 223) - one source `--ps-glow` consumed by `.ps-focus-glow`, a shared six-state rule (`.cmp-answer.cmp-hint`, `.phonics-choice.phonics-hint`, `.sort-basket.sort-hint`, `.candy-grid .candy.hint`, `.slot.hint`, `.seq-slot.seq-over`, `.sort-basket.sort-over`, `.piece.kb-selected`, `.card.flipped:not(.matched)`, `.mode-btn.active`, `.recog-toggle.active`, `#shapesTier button.active`, `.coloring-mode-toggle.free`) and `:focus-visible` (own `!important` rule; companions, never replaces, the yellow outline); per-page merges where the state rule already sets a box-shadow (sorting `.sort-selected`, spatial `.spatial-hint`, animals `.recog-hint`, classroom `.class-tab.active`, piano `.mode-btn.on`/`.song-chip.on` + `#modeFree.on`) and in the two keyframes that animate box-shadow (shapes `hintPulse`, matching_game `hintGlow`). Guards: 4 static `hub_smoke` checks (single source, six categories, no error/success token or animation, cascade merges) + runtime computed-boxShadow checks in `sorting_smoke`/`memory_smoke`/`shapes_smoke`/`classroom_smoke`/`piano_smoke`/`rhythm_smoke`, all negative-tested. `check_fast` 7/7; 15 affected smokes green; 12 review screenshots refreshed. |

### Phase 7 — Tactile system (P1, greenfield)

| ID | Work | Verdict |
|---|---|---|
| **V7.1** | Standardise primary button, secondary button, icon button, back button, selectable card, draggable object, modal, status chip, instruction strip, completion state — each with normal / pressed / selected / disabled / correct / hint. | **DONE** (2026-10-09, task 224) — the shared tactile layer `game/styles/components.css` now defines all ten families once (`.ps-btn`/`--secondary`/`--icon`, `.ps-back`, `.ps-card`, `.ps-drag`, `.ps-modal` + `__scrim`/`__panel`, `.ps-chip`, `.ps-instruction`, `.ps-complete`) with every state (`:hover`/`:active`/`:disabled`, `[aria-pressed/selected/disabled]`, `.is-selected`/`.is-correct`/`.is-hint`/`.ps-hint`), consumed from the design tokens + `--ps-glow`; it is linked on all 24 child pages. Per the task-224 user decision, adoption is staged: this task adopts only `.ps-back` (spec §44.1) on the 7 pages whose back buttons already match the canonical chrome (classroom, animals, coloring, matching_game, piano, shapes, tracing — rendering byte-identical to the pre-change refs, no screenshot refresh needed); the remaining families' per-page adoption rolls into the page-specific rows (V9–V19). Guards: 4 `hub_smoke` checks (families defined, all pages link, `.ps-back` canonical chrome, adopted pages carry the class), all negative-tested; `check_fast` 7/7; `hub_smoke` 15→19. |

### Phase 8 — Animal content (P2)

| ID | Work | Verdict |
|---|---|---|
| **V8.1** | Keep native emoji. Improve composition only: larger readable card, clear name, speaker affordance, subtle idle cue, consistent spacing, consistent selection feedback. | **DONE** (2026-10-10, task 225) — composition-only pass on `animals.html` keeping native emoji (spec §26 allows a custom-art pass only with a coherent full set + local bundling + documented licensing; none attempted). Flashcard is now a larger 56vmin lockup (emoji + Serbian name from `SERBIAN.animals`), with a visible speaker button, a subtle reduced-motion-safe emoji idle bob, one `--animal-gap`/`--animal-radius`/`--animal-shadow` rhythm shared with `.recog-choice`, and matching press feedback. `animals_smoke` 27→36 (+9 guards: name/emoji pairing, speaker, idle, spacing, shared radius/shadow), all negative-tested; `check_fast` 7/7; axe clean; audit 0 FAIL; offline E2E green; 4 screenshots refreshed. |

### Phases 9–20 — Page-specific (P2)

| ID | Work | Verdict |
|---|---|---|
| **V9** | Maze elevation → cozy garden journey (green ground, 2–4 motifs, house landmark, path contrast, clear walls). No enemies/timer/punishment. | **DONE** (2026-10-10, task 226) — every off-path cell is now a hedge wall (`.maze-hedge`) over a soft green lawn (`.maze-ground`); the warm sand path (`.maze-stone`) reads as a clear corridor; 2–4 garden motifs (`🌼🌷🦋🐞`) decorate the hedges only (never the path); the destination is a distinct `.maze-goal` house landmark with a dominant bear. Logic, forgiving snap and the no-enemies/timer/punishment rule unchanged. `maze_smoke` 19→24 (+5 guards, negative-tested); `check_fast` 7/7; axe clean; audit 0 FAIL; offline E2E green; 4 screenshots refreshed. |
| **V10** | Rhythm: four pads read as **drums** — icon contrast, tactile surface, clear active state, depth, percussion symbolism. Mode distinction clear without a complex menu. No extra pads. | **DONE** (2026-10-10, task 227) — the four pads now read as drums: a cast shadow (subtle depth), an inset rim + skin shading (tactile surface), and a light drumhead disc behind the icon (stronger contrast) with a dark icon shadow; the struck state is a bright white ring + real press, the wrong state a gentle dim; the 4th pad is now `🥁` «Високи бубањ» so all four read as one kit; **no pads added**, the two-mode bar unchanged (its active glow stays with `accessibility.css`). The drum set carries the live phase (`data-phase`) so pads dim while listening and a `drumCheer` animation cues a correct repeat. `rhythm_smoke` 22→30 (+8 guards, negative-tested); `check_fast` 7/7; axe clean; audit 0 FAIL; offline E2E green; 4 screenshots refreshed. |
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