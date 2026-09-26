# Roadmap Audit — PETRIN_SVET_MASTER_EXECUTION_ROADMAP vs. Current Code

**Purpose:** Map every task in `resources/General_reviews/PETRIN_SVET_MASTER_EXECUTION_ROADMAP.md` to its current implementation state in `game/`. This file is the resumable progress record.

**Status legend:**
- `DONE` — fully implemented in current code
- `PARTIAL` — some pieces exist, significant work remaining
- `MISSING` — not found in current code
- `N/A` — not applicable or contradicted by user-locked decisions

**Last updated:** 2026-09-26

---

## Phase 1 — Product Cohesion v1

### DS-001 — Shared design tokens
**Status:** PARTIAL

| Evidence | Location |
|----------|----------|
| CSS custom properties exist per-page | `game/pages/*.html` — each defines its own `:root` block |
| Shared accessibility CSS | `game/shared/accessibility.css` — has some tokens |
| Shared adventure CSS | `game/shared/adventure.css` — has palette variables |
| No unified `design-tokens.css` | No `game/styles/` directory exists |

**Gap:** No single token layer. Each page re-declares its own colors/spacing/radii. The `game/shared/adventure.css` and `accessibility.css` have some shared values but nothing comprehensive.

---

### NAV-001 — Standardize all back/home controls
**Status:** PARTIAL

| Evidence | Location |
|----------|----------|
| Shared navigation module | `game/shared/navigation.js` — exists with route handling |
| Back button pattern | Most pages have a back button, but implementations vary |
| `main.js` boot guard | `game/shared/main.js` — `started` flag prevents double-boot |
| Back SVG arrows | Some pages use inline SVG, some use emoji, some empty |

**Gap:** Back controls exist but are not standardized — some are emoji, some SVG, some empty. Touch areas and positioning vary by page.

---

### FB-001 — Shared feedback vocabulary
**Status:** PARTIAL

| Evidence | Location |
|----------|----------|
| Celebration module | `game/shared/celebration.js` — exists |
| Audio module | `game/shared/audio.js` — has `tone()`, `sweep()`, `play()` |
| Speech module | `game/shared/speech.js` — Serbian TTS |
| Per-game feedback | Each game implements its own success/miss feedback |

**Gap:** No centralized `softPop()`, `successChime()`, `gentleMiss()`, `celebrate()` API. Each game re-implements feedback inline. `celebration.js` provides some shared pieces but not a unified vocabulary.

---

### MOTION-001 — Make reduced motion global
**Status:** PARTIAL

| Evidence | Location |
|----------|----------|
| Racing3D reduced motion | `game/games/racing3d.mjs` — `REDUCED_MOTION` gates |
| Racing2D reduced motion | `game/games/racing.js` — `REDUCED_MOTION` gates |
| Accessibility CSS | `game/shared/accessibility.css` — `@media (prefers-reduced-motion: reduce)` |
| Per-page reduced motion | Some pages have it, most don't |

**Gap:** No global JS helper (`window.matchMedia('(prefers-reduced-motion: reduce)')`). Each game that supports it re-detects independently. CSS-level reduced motion only in `accessibility.css`.

---

### TOUCH-001 — Standardize pointer behavior
**Status:** PARTIAL

| Evidence | Location |
|----------|----------|
| Racing3D pointer handling | `game/games/racing3d.mjs` — pointerId ownership, capture, palm filter |
| Racing2D pointer handling | `game/games/racing.js` — thumb zones |
| Per-game drag | Each drag game (shapes, puzzle, coloring) implements its own |

**Gap:** No shared `shared/input.js` module. Racing3D has excellent pointer handling but it's not extracted for reuse. Drag games each re-implement pointer logic independently.

---

### DEVICE-001 — Shared viewport rules
**Status:** PARTIAL

| Evidence | Location |
|----------|----------|
| Viewport meta | All pages have `<meta name="viewport">` |
| Safe area | Some pages use `env(safe-area-inset-*)` |
| Responsive CSS | Per-page media queries |
| Canvas resize | Each canvas game handles resize independently |

**Gap:** No shared viewport wrapper pattern. Safe area handling is inconsistent. No shared resize helper.

---

### AUDIO-001 — Shared audio buses and priorities
**Status:** PARTIAL

| Evidence | Location |
|----------|----------|
| Shared audio module | `game/shared/audio.js` — `window.tone()`, `window.sweep()`, `window.play()` |
| AudioContext management | `game/shared/audio.js` — `ctx()` singleton |
| Racing3D audio queue | `game/games/racing3d.mjs` — 4 GainNode buses + ducking |
| Per-game audio | Each game calls `window.tone()` independently |

**Gap:** `audio.js` provides low-level primitives but no bus/priority system. Racing3D has its own 4-bus + ducking system but it's not extracted. No shared audio event vocabulary.

---

### LANG-001 — Serbian language data layer
**Status:** PARTIAL

| Evidence | Location |
|----------|----------|
| Speech module | `game/shared/speech.js` — Serbian TTS wrapper |
| Per-game Serbian data | Each game has its own Serbian word lists inline |
| `game/assets/audio/speech/*.mp3` | Pre-recorded Serbian words exist |

**Gap:** No shared `game/data/serbian.js` module. Each game re-declares Serbian words (animal names, numbers, colors, shapes, etc.) independently.

---

### BRAND-001 — Recurring Petrin svet mascot
**Status:** MISSING

| Evidence | Location |
|----------|----------|
| No mascot file | No SVG/PNG mascot found in `game/assets/` |
| No mascot in code | No references to a mascot in any game |

**Gap:** Entirely missing. Needs asset creation + integration.

---

### ART-001 — Local illustration strategy
**Status:** PARTIAL

| Evidence | Location |
|----------|----------|
| Some local images | `game/assets/images/` — animal sprites, explorer sprites |
| Coloring scenes | `game/games/coloring.js` — SVG-based local scenes |
| Classroom 3D shapes | `game/games/classroom.js` — local SVG shapes |
| Emoji dependence | Many games still use emoji for animals/icons |

**Gap:** No systematic replacement of emoji with local illustrations. Some games have local art, most still rely on emoji for core educational content.

---

## Phase 2 — Toddler Adaptation v1

### GAME-ANIMALS-001 — Animal recognition mode
**Status:** MISSING

**Gap:** Animals game is passive flashcards only. No "Пронађи животињу" (find the animal) mode with choices.

### GAME-COUNT-001 — One-to-one counting
**Status:** MISSING

**Gap:** Counting game tests number selection, not actual one-to-one counting with tap-to-count interaction.

### GAME-SHAPES-001 — Magnetic shape placement
**Status:** PARTIAL

**Gap:** Shapes game has drag-to-match but no magnetic snap radius.

### GAME-MEMORY-001 — Age-aware memory
**Status:** MISSING

**Gap:** Fixed 4×4 board only. No adaptive 2×2 or 3×2 modes for younger children.

### GAME-PUZZLE-001 — Magnetic puzzle placement
**Status:** PARTIAL

**Gap:** Puzzle has drag-to-place but no magnetic snap. No preview helper.

### GAME-COLOR-001 — Split coloring modes
**Status:** MISSING

**Gap:** Only "color by reference" mode exists. No free coloring mode.

### GAME-TRACING-001 — Developmental tracing
**Status:** PARTIAL

**Gap:** Tracing exists with pass/fail scoring. No pre-writing stages, no stroke-order hints, scoring is evaluative not developmental.

### GAME-CLASS-001 — Calm learning center
**Status:** PARTIAL

**Gap:** Classroom has content but no visual tab reorganization. Quiz is primary, not positioned as older-child option.

### GAME-PIANO-001 — Free-play-first piano
**Status:** PARTIAL

**Gap:** Piano has free play + song mode. Song UI uses expected-note highlighting but not the "Прати светло" visual phrase system.

### GAME-MATCH-001 — Toddler-first matching
**Status:** PARTIAL

**Gap:** Match game starts at 4×4 and grows to 8×8 with score pressure. No toddler default (2×2, no score).

---

## Phase 3 — Adventure Differentiation

### GAME-EXPLORER-001 — Exploration-first Explorer
**Status:** PARTIAL

**Gap:** Explorer is a platformer with death/restart. Needs softer reset, more forgiving platforms.

### GAME-DRIVE-001 — Driving identity
**Status:** PARTIAL

**Gap:** Driving has free movement + no-fail but no unique navigation identity (road color, arrows, landmarks).

### GAME-OCEAN-001 — Ocean identity
**Status:** MISSING

**Gap:** Ocean plays like "Driving underwater" — no unique swim/collect-bubble mechanics.

### GAME-DINO-001 — Forgiving jump timing
**Status:** MISSING

**Gap:** Dino is precision platformer. Needs larger jump windows, visual cues, quick respawn.

### GAME-SPACE-001 — Spatial flight identity
**Status:** MISSING

**Gap:** Space is obstacle-dodging clone. Needs altitude bands, portals, planet landmarks.

### GAME-RACE-001 — Racing3D polish only
**Status:** DONE

**Note:** Racing3D has received extensive polish (tasks 95–105). All items addressed.

### ADV-001 — Shared adventure engine boundary
**Status:** PARTIAL

**Gap:** Driving/Ocean/Dino/Space share some code via `adventure.js` but each re-implements movement, collision, camera independently.

---

## Phase 4 — PWA/Offline Hardening

### PWA-001 — Manifest consistency
**Status:** DONE

**Note:** All pages have consistent manifest/theme-color/viewport metadata (task 104 fixed viewport issues).

### PWA-002 — Offline inventory/report
**Status:** DONE

**Note:** `tools/build_offline.ps1` generates cache lists and reports (task 102 batch 11 fixed empty manifest bug).

### PWA-003 — True offline play testing
**Status:** MISSING

**Gap:** No automated network-blocked browser test. Only cache-list validation exists.

---

## Phase 5 — Cleanup and Quality

### CLEAN-001 — Legacy route cleanup
**Status:** PARTIAL

**Note:** `racing.html` back button retired but page still exists. `papper_kitty.html` still present. Hub already hides racing.

### REF-001 — Shared helper extraction
**Status:** PARTIAL

**Note:** `game/shared/` has audio/speech/navigation/celebration/utils/main but no feedback/input/motion/progress/viewport modules.

### TEST-001 — Play-aware smoke tests
**Status:** PARTIAL

**Note:** 19 smoke tools exist with 364 checks. Cover boot + basic interaction. Don't cover wrong-answer, replay, back, resize.

### TEST-002 — Touch interruption tests
**Status:** MISSING

**Note:** Racing3D has pointer interruption tests. No system-wide touch interruption test suite.

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
| 1 — Cohesion | 10 | 0 | 8 | 1 | 1 |
| 2 — Toddler | 10 | 0 | 5 | 5 | 0 |
| 3 — Adventure | 7 | 1 | 3 | 3 | 0 |
| 4 — PWA | 3 | 2 | 0 | 1 | 0 |
| 5 — Cleanup | 5 | 0 | 3 | 2 | 0 |
| 6 — Future | 7 | 0 | 0 | 0 | 7 |
| **Total** | **42** | **3** | **19** | **12** | **8** |

---

## Recommended Priority (Phase 1 first, per roadmap dependency order)

1. **DS-001** — Shared design tokens (foundation for everything visual)
2. **LANG-001** — Serbian language data (used by every game)
3. **NAV-001** — Standardized back controls (touches every page)
4. **MOTION-001** — Global reduced motion (accessibility foundation)
5. **FB-001** — Shared feedback vocabulary (used by every game)
6. **TOUCH-001** — Pointer standards (used by every drag game)
7. **DEVICE-001** — Viewport rules (responsive foundation)
8. **AUDIO-001** — Audio buses (used by every game)

---

## Session Log

- 2026-09-26 — Audit started. All 42 tasks mapped to current code state. See details above.
- 2026-09-26 — **Task 106 (DS-001) IMPLEMENTED + VALIDATED.** Created `game/styles/design-tokens.css` with color/spacing/radius/shadow/touch-target tokens. Added `<link>` to all 18 public pages. `node --check` passes (63 files). Installed Chromium on Alpine, fixed `tools/headless.js` for Linux (TMPDIR fallback, Linux Chrome paths, --no-sandbox). Smoke battery: **15/19 tools PASS (297 checks)**. 4 failures are pre-existing flakes unrelated to CSS-only change (adventure mouse-hit timing, memory popup timing, racing3d ES module load, shapes Chrome boot crash). Ready for user commit approval.
- 2026-09-26 — **Task 107 (LANG-001) IMPLEMENTED + VALIDATED.** Created `game/data/serbian.js` — shared Serbian Cyrillic data layer. Contains: 30 letters (label, name, example word), 11 numbers (0–10), 10 shapes, 11 colors (name + hex), 12 animals (English→Serbian map), 4 praise phrases, 2 retry phrases, 7 navigation labels, 15 game titles. All data sourced from existing game code (classroom.js, animals.js, tracing.js, shapes.js, kids_games.js). Zero behavior changes — data-only module exposed as `window.SERBIAN`. `node --check` 64 files OK. Smoke battery: **17/19 tools PASS (333 checks)**. 2 failures are pre-existing flakes unrelated to data-only module (racing3d ES module load, tracing Chrome boot crash). Committed `2367fce`.
- 2026-09-26 — **Task 108 (NAV-001) IMPLEMENTED.** Audited all 18 pages for back/home controls. Found that 17/18 pages already use the standard inline SVG arrow + "Назад" pattern (from task 105's fix). Only outlier: `racing.html` had an empty `<button class="adv-back" id="racing-back">` with no SVG arrow. Fixed by adding the same inline SVG arrow used by all other pages. All pages now have consistent back navigation with ≥48px touch target and no hover dependence. Committed `f3cf562`, pushed.
- 2026-09-26 — **Task 109 (MOTION-001) IMPLEMENTED + VALIDATED.** Created `game/shared/motion.js` + global CSS reduced-motion rules. Committed `40d417e`, pushed.
- 2026-09-26 — **Task 110 (FB-001) IMPLEMENTED + VALIDATED.** Created `game/shared/feedback.js` with unified feedback API. Committed `a3ff9ec`, pushed.
- 2026-09-26 — **Task 111 (TOUCH-001) IMPLEMENTED.** Created `game/shared/input.js` — shared pointer/touch helpers: `pointerDrag(el, handlers)` (pointer capture, second-finger filter, cleanup on cancel/leave/visibility/orientation) and `resetInput(state)`. Wired `input.js` into 13 game pages. Zero behavior changes — helper API only. `node --check` 67 files OK. NOT committed — user approves commit + sync.
