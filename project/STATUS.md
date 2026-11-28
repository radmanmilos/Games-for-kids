# Project status

Updated: 2026-11-28
Repository: `radmanmilos/Games-for-kids`
Branch: `main`
Verified main head before task 467 implementation: `97dbb3fa243bba1cf5567ca38fd15a6e4de2ee35`.

## Release/version

- Deployed baseline: `3.0.28`.
- Cat Forest full-overhaul candidate: `4.0.0` (A-version bump per the approved full-overhaul rule).
- Candidate is not a release until generated-artifact, offline, smoke, release and screenshot gates pass.

## Cat Forest — task 467

**Status: IN PROGRESS**

- Scope is the user-approved 2026-11-26 expansion: village, pond, woodland, workshop, keepsake crafting, reversible fixed-anchor decoration and the expanded cat diary.
- Implementation is prepared as one cohesive commit from main head `97dbb3f`.
- Four original local SVG scene illustrations, persistent bottom navigation, scene-specific return controls and compact visual resource baskets are being integrated.
- Crafting consumes wood plus the matching cat-gift keepsake. Fish is reserved for feeding; one fish is consumed when eating begins.
- Save schema is v3 because the live pre-overhaul source already used v2. Existing v2 data migrates; v1 is discarded as explicitly approved.
- Targeted smoke coverage and deterministic visual states are updated. CI is configured to capture the stable Screenshot_Review battery at phone portrait, phone landscape, tablet and desktop.
- Source parsing and visual-state JSON parsing were checked. Browser execution, full smoke, release checks, screenshot capture and visual review are still pending.

## Other project work

- Little Explorer: Q-plan implementation is reported complete through Q-23. Remaining owner-run work is tablet performance/visual/audio/readability checks, flashing/leak/acne checks, real-child playtesting, QG6 four-viewport package review and release sign-off. Do not mark these owner-run gates complete without evidence.
- Continue to use `project/PROCESS.md` and `AGENTS.md` for task lifecycle, generated docs, screenshot refresh and verification.

## Known process note

The earlier Cat Forest resource-persistence repair was pushed separately before the larger refactor was ready. The full refactor is built from the then-current main head; no history rewrite is planned. The user explicitly authorized work on main. The visual-review workflow may commit only refreshed review artifacts after the automated gates pass.
