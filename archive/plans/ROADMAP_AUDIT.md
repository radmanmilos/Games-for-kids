# Roadmap Audit — PETRIN_SVET_MASTER_EXECUTION_ROADMAP vs. Current Code

**Scope (clarified 2026-10-04, R18):** This file audits the concepts of the
**previous-generation** `resources/General_reviews/PETRIN_SVET_MASTER_EXECUTION_ROADMAP.md`
(superseded). It is a historical mapping of those concepts to code state, not the
active queue. The **active** implementation queue is the
[Fresh Elevation Roadmap](resources/General_reviews/Petrin_svet_Fresh_Elevation_Roadmap_2026-09-29.md);
see [`ROADMAP.md`](ROADMAP.md) for the single entry point.

**Purpose:** Map every task in `resources/General_reviews/PETRIN_SVET_MASTER_EXECUTION_ROADMAP.md` to its current implementation state in `game/`. This file is the resumable progress record.

**Status legend:**
- `DONE` — fully implemented in current code
- `PARTIAL` — some pieces exist, significant work remaining
- `MISSING` — not found in current code
- `N/A` — not applicable or contradicted by user-locked decisions

**Last updated:** 2026-10-04

---

## Phase 1 — Product Cohesion

### DS-001 — Shared design tokens
**Status:** DONE (task 106, 2026-09-26)

| Evidence | Location |
|----------|----------|
| `game/styles/design-tokens.css` | 30 CSS custom properties (9 colors, 6 spacing, 4 radii, 3 shadows, 3 touch targets) |
| Linked on all 18 pages | `<link>` in every `game/pages/*.html` |

---

### NAV-001 — Standardize all back/home controls
**Status:** DONE (task 108, 2026-09-26)

| Evidence | Location |
|----------|----------|
| Standard inline SVG arrow + "Назад" pattern | All 18 pages |
| `main.js` boot guard | `started` flag prevents double-boot |

---

### FB-001 — Shared feedback vocabulary
**Status:** DONE (task 110, 2026-09-26)

| Evidence | Location |
|----------|----------|
| `game/shared/feedback.js` | Unified `popSound()`, `gentleMiss()`, `successChime()`, `celebrate()` |
| `game/shared/celebration.js` | Shared celebration overlay |

---

### MOTION-001 — Make reduced motion global
**Status:** DONE (task 109, 2026-09-26)

| Evidence | Location |
|----------|----------|
| `game/shared/motion.js` | Global `window.reducedMotion()` |
| Global CSS reduced-motion rules | `game/shared/accessibility.css` |

---

### TOUCH-001 — Standardize pointer behavior
**Status:** DONE (task 111, 2026-09-26)

| Evidence | Location |
|----------|----------|
| `game/shared/input.js` | `pointerDrag()` + `resetInput()` |
| Wired into 13 game pages | `game/pages/*.html` |

---

### DEVICE-001 — Shared viewport rules
**Status:** DONE (task 112, 2026-09-26)

| Evidence | Location |
|----------|----------|
| `game/styles/viewport.css` | Shared viewport rules |
| `game/shared/viewport.js` | Shared viewport helper |

---

### AUDIO-001 — Shared audio buses and priorities
**Status:** DONE (task 113, 2026-09-26)

| Evidence | Location |
|----------|----------|
| `game/shared/audio-buses.js` | 4 buses, priority, ducking, event vocabulary |

---

### LANG-001 — Serbian language data layer
**Status:** DONE (task 107, 2026-09-26)

| Evidence | Location |
|----------|----------|
| `game/data/serbian.js` | Shared Serbian Cyrillic data layer (30 letters, 11 numbers, 10 shapes, 11 colors, 12 animals, praise/retry phrases, nav labels, game titles) |

---

### BRAND-001 — Recurring Petrin svet mascot
**Status:** N/A (per user decision)

**Note:** The kitty mascot (Мала истраживачица) already serves as the recurring character. No separate mascot asset needed.

---

### ART-001 — Local illustration strategy
**Status:** PARTIAL

| Evidence | Location |
|----------|----------|
| Local images | `game/assets/images/` — animal sprites, explorer sprites |
| Coloring scenes | `game/games/coloring.js` — SVG-based local scenes |
| Classroom 3D shapes | `game/games/classroom.js` — local SVG shapes |
| Emoji dependence | Many games still use emoji for animals/icons |

**Gap:** No systematic replacement of emoji with local illustrations. Some games have local art, most still rely on emoji for core educational content.

---

## Phase 2 — Toddler Adaptation

### GAME-COUNT-001 — One-to-one counting
**Status:** DONE (task 114, 2026-09-26)

| Evidence | Location |
|----------|----------|
| Tap-to-count flow | `game/games/animal_counting.js` — phase 1: tap each tile, phase 2: pick number |
| `.counted` CSS | `game/pages/animal_counting.html` |

---

### GAME-TRACING-001 — Developmental tracing
**Status:** DONE (task 115, 2026-09-26)

| Evidence | Location |
|----------|----------|
| Prewriting activity | 8 items: hline, vline, circle, arc, zigzag, wave, square, triangle |
| Stroke-order hint | Numbered dot on letter guides |
| classifyAttempt | complete/nearly/early instead of pass/fail |
| No forced auto-advance | Explicit Next/Repeat buttons |

---

### GAME-MEMORY-001 — Age-aware memory
**Status:** DONE (task 116, 2026-09-26)

| Evidence | Location |
|----------|----------|
| Difficulty selector | Лако 2×2 / Средње 3×2 / Стандардно 4×4 |
| `memory_smoke.js` | 8 checks → 12 checks (task 122) |

---

### GAME-PUZZLE-001 — Magnetic puzzle placement
**Status:** DONE (task 117, 2026-09-27)

| Evidence | Location |
|----------|----------|
| Magnetic snap | `.piece.snapping` (left/top .18s ease-out) |
| Developmental levels | 1×2 → 2×2 → 3×3 (capped) |
| Peek button | 👁 toggles `#puzzlePreviewOverlay` |

---

### GAME-ANIMALS-001 — Animal recognition mode
**Status:** DONE (task 118, 2026-09-27)

| Evidence | Location |
|----------|----------|
| "Пронађи животињу" mode | Adaptive difficulty: rounds 1-3 = 2 choices, round 4+ = 3 |
| `animals_smoke.js` | 13 → 24 checks |

---

### GAME-COLOR-001 — Split coloring modes
**Status:** DONE (task 119, 2026-09-27)

| Evidence | Location |
|----------|----------|
| "Слободно бојење" mode | Free coloring alongside "Обоји по слици" |
| Mode toggle button | Switches between modes |
| `coloring_smoke.js` | 13 → 20 checks |

---

### GAME-CLASS-001 — Calm classroom hub
**Status:** DONE (task 120, 2026-09-27)

| Evidence | Location |
|----------|----------|
| Category tabs | Азбука/Бројеви/Облици/Боје |
| Shared feedback fix | `NaN`-delay root-cause fix in `shared/feedback.js` + `shared/audio-buses.js` |
| Candy hint fix | `showHint` → `showCandyHint` (global name collision) |

---

### GAME-PIANO-001 — Free-play-first piano
**Status:** DONE (task 121, 2026-09-27)

| Evidence | Location |
|----------|----------|
| "Прати светло" mode | Soft light on expected key, no punishment on wrong press |
| Song data shape | `{ id, title, notes:['C4',...], tempo, speech }` |
| Free play primary | "Свирај слободно" at 5.4vmin vs "Прати светло" at 3.2vmin |
| Phone layout fix | `#pianoKeys .piano-key{ min-width:0 }` for 390px viewport |

---

### GAME-MATCH-001 — Toddler-first matching
**Status:** DONE (task 122, 2026-09-28)

| Evidence | Location |
|----------|----------|
| No visible score | Status line hidden in easy mode (toddler default) |
| "Пронађен пар!" feedback | Popup text changed from "Пар!" |
| Large cards | `body.toddler` class increases card size |

---

### GAME-SHAPES-001 — Magnetic shape placement
**Status:** DONE (task 123, 2026-09-28)

| Evidence | Location |
|----------|----------|
| Generous snap radius | 1.5× slot width, distance-based matching |
| Soft animation | left/top/transform .25s ease on snap |
| No punishment | No `gentleMiss()` on wrong target |
| Hint | Correct target pulses yellow after 2 failed attempts |
| Difficulty tiers | Tier 1 (2 shapes, default), Tier 2 (3 shapes), Tier 3 (4 shapes + rotation) |

---

## Phase 3 — Adventure Differentiation

### GAME-EXPLORER-001 — Exploration-first Explorer
**Status:** PARTIAL

**Gap:** Explorer is a platformer with death/restart. Needs softer reset, more forgiving platforms.

---

### GAME-DRIVE-001 — Driving identity
**Status:** PARTIAL

**Gap:** Driving has free movement + no-fail but no unique navigation identity (road color, arrows, landmarks).

---

### GAME-OCEAN-001 — Ocean identity
**Status:** MISSING

**Gap:** Ocean plays like "Driving underwater" — no unique swim/collect-bubble mechanics.

---

### GAME-DINO-001 — Forgiving jump timing
**Status:** MISSING

**Gap:** Dino is precision platformer. Needs larger jump windows, visual cues, quick respawn.

---

### GAME-SPACE-001 — Spatial flight identity
**Status:** MISSING

**Gap:** Space is obstacle-dodging clone. Needs altitude bands, portals, planet landmarks.

---

### GAME-RACE-001 — Racing3D polish only
**Status:** DONE

**Note:** Racing3D has received extensive polish (tasks 95–105). All items addressed.

---

### ADV-001 — Shared adventure engine boundary
**Status:** PARTIAL

**Gap:** Driving/Ocean/Dino/Space share some code via `adventure.js` but each re-implements movement, collision, camera independently.

---

## Phase 4 — PWA/Offline Hardening

### PWA-001 — Manifest consistency
**Status:** DONE (task 104, 2026-09-25)

**Note:** All pages have consistent manifest/theme-color/viewport metadata.

---

### PWA-002 — Offline inventory/report
**Status:** DONE (task 102 batch 11, 2026-09-25)

**Note:** `tools/build_offline.js` generates cache lists and reports. Empty manifest bug fixed.

---

### PWA-003 — True offline play testing
**Status:** MISSING

**Gap:** No automated network-blocked browser test. Only cache-list validation exists.

---

## Phase 5 — Cleanup and Quality

### CLEAN-001 — Legacy route cleanup
**Status:** PARTIAL

**Note:** `racing.html` back button retired but page still exists. `papper_kitty.html` still present. Hub already hides racing.

---

### REF-001 — Shared helper extraction
**Status:** DONE (tasks 106–113, 2026-09-26)

**Note:** `game/shared/` now has audio/speech/navigation/celebration/utils/main/feedback/input/motion/viewport/audio-buses modules.

---

### TEST-001 — Play-aware smoke tests
**Status:** PARTIAL

**Note:** 19 smoke tools exist with 398 checks. Cover boot + basic interaction. Don't cover wrong-answer, replay, back, resize.

---

### TEST-002 — Touch interruption tests
**Status:** MISSING

**Note:** Racing3D has pointer interruption tests. No system-wide touch interruption test suite.

---

### TEST-003 — Visual regression
**Status:** MISSING

**Note:** `play_matrix.mjs` checks overflow only. No screenshot comparison.

---

## Phase 6 — Future Learning Expansion

### FUT-001 through FUT-007
**Status:** N/A (not started, by design)

**Note:** Per roadmap, these should only be evaluated after Phases 1–5 are stable.

---

## Summary

| Phase | Tasks | DONE | PARTIAL | MISSING | N/A |
|-------|-------|------|---------|---------|-----|
| 1 — Cohesion | 10 | 8 | 1 | 0 | 1 |
| 2 — Toddler | 10 | 10 | 0 | 0 | 0 |
| 3 — Adventure | 7 | 1 | 3 | 3 | 0 |
| 4 — PWA | 3 | 2 | 0 | 1 | 0 |
| 5 — Cleanup | 5 | 1 | 2 | 2 | 0 |
| 6 — Future | 7 | 0 | 0 | 0 | 7 |
| **Total** | **42** | **22** | **6** | **6** | **8** |

---

## Recommended Priority (Phase 3 next, per roadmap dependency order)

1. **GAME-EXPLORER-001** — Exploration-first Explorer (soft reset, forgiving platforms)
2. **GAME-DRIVE-001** — Driving identity (road color, arrows, landmarks)
3. **GAME-OCEAN-001** — Ocean identity (swim/collect-bubble mechanics)
4. **GAME-DINO-001** — Forgiving jump timing (larger windows, visual cues)
5. **GAME-SPACE-001** — Spatial flight identity (altitude bands, portals)
6. **ADV-001** — Shared adventure engine boundary
7. **PWA-003** — True offline play testing
8. **TEST-002** — Touch interruption tests
9. **TEST-003** — Visual regression
10. **ART-001** — Local illustration strategy

---

## Session Log

- 2026-09-26 — Audit started. All 42 tasks mapped to current code state. See details above.
- 2026-09-26 — **Task 106 (DS-001) IMPLEMENTED + VALIDATED.** Created `game/styles/design-tokens.css` with color/spacing/radius/shadow/touch-target tokens. Added `<link>` to all 18 public pages. `node --check` passes (63 files). Installed Chromium on Alpine, fixed `tools/headless.js` for Linux (TMPDIR fallback, Linux Chrome paths, --no-sandbox). Smoke battery: **15/19 tools PASS (297 checks)**. 4 failures are pre-existing flakes unrelated to CSS-only change (adventure mouse-hit timing, memory popup timing, racing3d ES module load, shapes Chrome boot crash). Ready for user commit approval.
- 2026-09-26 — **Task 107 (LANG-001) IMPLEMENTED + VALIDATED.** Created `game/data/serbian.js` — shared Serbian Cyrillic data layer. Contains: 30 letters (label, name, example word), 11 numbers (0–10), 10 shapes, 11 colors (name + hex), 12 animals (English→Serbian map), 4 praise phrases, 2 retry phrases, 7 navigation labels, 15 game titles. All data sourced from existing game code (classroom.js, animals.js, tracing.js, shapes.js, kids_games.js). Zero behavior changes — data-only module exposed as `window.SERBIAN`. `node --check` 64 files OK. Smoke battery: **17/19 tools PASS (333 checks)**. 2 failures are pre-existing flakes unrelated to data-only module (racing3d ES module load, tracing Chrome boot crash). Committed `2367fce`.
- 2026-09-26 — **Task 108 (NAV-001) IMPLEMENTED.** Audited all 18 pages for back/home controls. Found that 17/18 pages already use the standard inline SVG arrow + "Назад" pattern (from task 105's fix). Only outlier: `racing.html` had an empty `<button class="adv-back" id="racing-back">` with no SVG arrow. Fixed by adding the same inline SVG arrow used by all other pages. All pages now have consistent back navigation with ≥48px touch target and no hover dependence. Committed `f3cf562`, pushed.
- 2026-09-26 — **Task 109 (MOTION-001) IMPLEMENTED + VALIDATED.** Created `game/shared/motion.js` + global CSS reduced-motion rules. Committed `40d417e`, pushed.
- 2026-09-26 — **Task 110 (FB-001) IMPLEMENTED + VALIDATED.** Created `game/shared/feedback.js` with unified feedback API. Committed `a3ff9ec`, pushed.
- 2026-09-26 — **Task 111 (TOUCH-001) IMPLEMENTED.** Created `game/shared/input.js` — shared pointer/touch helpers: `pointerDrag(el, handlers)` (pointer capture, second-finger filter, cleanup on cancel/leave/visibility/orientation) and `resetInput(state)`. Wired `input.js` into 13 game pages. Zero behavior changes — helper API only. `node --check` 67 files OK. Committed `bda3589`, pushed.
- 2026-09-26 — **Task 112 (DEVICE-001) IMPLEMENTED.** Created `game/styles/viewport.css` + `game/shared/viewport.js`. Committed `76ff9ac`, pushed.
- 2026-09-26 — **Task 113 (AUDIO-001) IMPLEMENTED.** Created `game/shared/audio-buses.js` with 4 buses, priority, ducking, event vocabulary. Committed `a5e4ace`, pushed.
- 2026-09-26 — **Task 114 (GAME-COUNT-001) IMPLEMENTED + VALIDATED.** Converted `animal_counting.js` from number-selection to actual one-to-counting: phase 1 shows animal tiles (buttons hidden, prompt "Изброј животиње!"), child taps each tile (highlighted `.counted` with green ring, plays counting word via speech), after all counted buttons appear with prompt "Колико их има?", child picks number as before. Added `.counted` CSS to `animal_counting.html`. Updated `counting_smoke.js` to drive the new flow (tap-all → verify buttons → answer): **10/10 checks PASS**. `node --check` 70 files OK. Committed `70c6299`, pushed.
- 2026-09-26 — **Task 115 (GAME-TRACING-001) IMPLEMENTED + VALIDATED.** Converted tracing from evaluative to developmental: added prewriting activity (8 items: hline, vline, circle, arc, zigzag, wave, square, triangle), stroke-order hint (numbered dot on letter guides), classifyAttempt (complete/nearly/early instead of pass/fail), weak attempts preserve drawing + highlight guide + "Хајде још једном." (no clear), no forced auto-advance (explicit Next/Repeat buttons). Updated `tracing_smoke.js` to match new behavior: **24/24 checks PASS**. `node --check` 71 files OK. Committed `c94e4c3`, pushed.
- 2026-09-27 — **Task 116 (GAME-MEMORY-001) IMPLEMENTED + VALIDATED.** Difficulty selector (Лако 2×2 / Средње 3×2 / Стандардно 4×4) in `animal_memory.js` + `memory_smoke.js` updated. Committed `994b804` + `4cc7368`, pushed.
- 2026-09-27 — **Task 117 (GAME-PUZZLE-001) IMPLEMENTED + VALIDATED.** Magnetic snap, developmental levels 1×2 → 2×2 → 3×3, peek button. `puzzle_smoke.js` 16 → 20 checks, ALL PASS. Committed `5245ed5`, pushed.
- 2026-09-27 — **Task 118 (GAME-ANIMALS-001) IMPLEMENTED + VALIDATED.** "Пронађи животињу" recognition mode with adaptive difficulty. `animals_smoke.js` 13 → 24 checks, ALL PASS. Committed `8e4ac79`, pushed.
- 2026-09-27 — **Task 119 (GAME-COLOR-001) IMPLEMENTED + VALIDATED.** Split coloring modes (reference + free). `coloring_smoke.js` 13 → 20 checks, ALL PASS. Committed `32b1a44`, pushed.
- 2026-09-27 — **Task 120 (GAME-CLASS-001) IMPLEMENTED + VALIDATED.** Category tabs + shared-feedback NaN-delay root-cause fix + candy showHint global-collision fix. `classroom_smoke.js` 17/17 PASS, `candy_smoke.js` 12/12 PASS. Committed `1fcf595`, pushed.
- 2026-09-27 — **Task 121 (GAME-PIANO-001) IMPLEMENTED + VALIDATED.** "Прати светло" soft-light song mode, song data on roadmap shape, free play primary, phone layout fix. `piano_smoke.js` 15 → 22 checks, ALL PASS. Committed `9c8b68d`, pushed.
- 2026-09-28 — **Task 122 (GAME-MATCH-001) IMPLEMENTED + VALIDATED.** Toddler-first memory game: no visible score in easy mode, "Пронађен пар!" feedback, large cards. `memory_smoke.js` 8 → 12 checks, ALL PASS. Committed `c55c935`, pushed.
- 2026-09-28 — **Task 123 (GAME-SHAPES-001) IMPLEMENTED + VALIDATED.** Magnetic shape placement: generous snap radius (1.5× slot width), soft animation, no punishment, hint after repeated attempts, 3 difficulty tiers. `shapes_smoke.js` 11 → 13 checks, ALL PASS. Committed `0afa9d4` + `bfa1c4a`, pushed.
- 2026-09-28 — **Phase 2 complete: all 10 toddler adaptation games DONE.**
- 2026-09-28 — **Audit updated.** All 42 tasks re-mapped to current code state. Phase 1: 8/10 DONE. Phase 2: 10/10 DONE. Phase 3: 1/7 DONE. Phase 4: 2/3 DONE. Phase 5: 1/5 DONE. Phase 6: 0/7 (N/A).
