# Visual/UX screenshot review — November 2026

**Task:** 379  
**Status:** IN PROGRESS  
**Owner:** OpenAI ChatGPT / GPT-6  
**Started:** 2026-11-05

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

## Known limitations

The GitHub connector can inspect files but cannot run the repository's local Node/Chromium screenshot pipeline. Until the capture commands above are run in a local clone and the resulting screenshots are committed/pushed, the visual review cannot claim a fresh 108-image baseline. Existing screenshots are useful for preliminary observations only.
