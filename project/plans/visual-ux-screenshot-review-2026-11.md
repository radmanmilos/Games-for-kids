# Visual/UX screenshot review — November 2026

**Task:** 379  
**Status:** DONE (task 379 evidence); task 380 visual review in progress  
**Owner:** OpenAI ChatGPT / GPT-6 (plan) · OpenCode / Big Pickle (capture + docs)  
**Started:** 2026-11-05  
**Report:** [`resources/General_reviews/VISUAL_UX_REVIEW_2026-11.md`](../../resources/General_reviews/VISUAL_UX_REVIEW_2026-11.md)

## Purpose

Establish a trustworthy, current visual baseline for Petrin svet and review the child/parent experience across all registered surfaces and the four standard viewport formats. This is a review and evidence-gathering task, not authorization to change runtime UI.

## Verified starting evidence

- `resources/General_reviews/Screenshot_Review/TABLE_OF_CONTENT.md` lists 108 screenshots: 27 surfaces × 4 viewport formats.
- `screenshot-provenance.json` and the TOC show 76/108 screenshots still originate from task 324; 32 were refreshed by tasks 358, 359, 361 and 362.
- `resources/General_reviews/SHORT_LANDSCAPE_AUDIT.md` (generated 2026-11-04) reports 27 surfaces, 12 OK, 15 WARN, 0 FAIL. The warnings are explicitly marked for human adjudication.
- `tools/screenshot.js` supports deterministic named states through `--state=<id>` and `tools/visual-states.json` defines INIT and PLAY hooks for the game surfaces (parent has INIT only).
- The Cat Forest guide gives a deterministic PLAY recipe and deliberately sets `screenshot:false`; its default screenshot shows the empty opening state, not the visiting-cat gameplay.

## Capture required

Run from an updated local clone on the task branch after it is available:

```bash
node tools/screenshot.js --review=Screenshot_Review --task=379
node tools/screenshot.js --review=Screenshot_Review --pages=hub,animals,animal_counting,animal_memory,animal_puzzle,classroom,compare,sorting,phonics,sequencing,rhythm,spatial,maze,coloring,tracing,piano,shapes,matching_game,driving,ocean,dino,space,racing3d,explorer,fastcat,cat_forest --state=PLAY --task=379
node tools/short_landscape_audit.js
node tools/check_docs.js
```

The first command refreshes the 108 default-state images. The second adds named PLAY captures for the 26 non-parent pages (including the deterministic Cat Forest visitor state); `visual-states.json` is the source of the hooks. Review both initial and gameplay views. Preserve existing screenshots/provenance for unchanged pages only where the capture process itself does not overwrite them.

## Review criteria

1. Child clarity: obvious first action, understandable visual hierarchy, no confusing blank or ambiguous states.
2. Responsive composition: safe areas, no clipping or accidental scroll, no unreachable controls, comfortable touch sizes at 844×390, 390×844, 1180×820 and 820×1180.
3. Visual language: shared cozy Petrin svet shell, consistent tactile controls and spacing, while preserving each game's distinct visual identity.
4. Readability and accessibility: Serbian Cyrillic, text scale/contrast, non-colour-only signals, clear control labels and focus.
5. Game-specific quality: stage prominence, instruction proximity, feedback, state visibility, appropriate empty/loading/selection states.
6. Parent surface: readable status and reachable controls without turning it into a child-facing dashboard.

## Required deliverables

- Updated screenshot battery and provenance.
- Re-run short-landscape audit with a human disposition for every WARN (acceptable by design, stale/false positive, or actionable issue).
- A prioritized visual/UX report with exact screenshot and source paths, child/parent impact, proposed fix, regression risk, and validation plan.
- Separate implementation tasks only after the user reviews/approves the recommendations.

## Result (2026-11-05)

- Captured 108 default + 56 PLAY screenshots; all 164 provenance rows at task 379.
- Fixed the stale `tools/visual-states.json` hooks (see the report) and made
  `TABLE_OF_CONTENT.md` list named-state captures.
- Re-ran the short-landscape audit: 12 OK / 15 WARN / 0 FAIL, every WARN given a
  disposition in the report.
- `node tools/axe_check.js`: 27 surfaces, 0 violations.
- Prioritized findings: P1 parent gate below the fold, P2 short-landscape header budget,
  P3 audit header selector, P4 visual confirmation.
- No runtime UI change was made; fixes need separate approved tasks.

## Task 380 visual review progress (2026-11-05)

GPT-6 visually inspected all 27 phone-landscape default captures and all 14 phone-landscape PLAY captures, plus targeted portrait/tablet screenshots for hub, parent, compare, maze, sorting and coloring. This confirmed a new P1 hub issue: the learning tile is blank and its label is displaced outside the tile in all four default viewport captures. The parent gate below-fold issue is confirmed specifically at 844×390; portrait parent layout keeps the gate visible.

Further review notes and exact proposed fixes are in `resources/General_reviews/VISUAL_UX_REVIEW_2026-11.md`. The 164-file set has not yet been inspected image-by-image across all formats; tablet/portrait PLAY variants and the remaining screens need a dedicated pass. No runtime files were changed.

