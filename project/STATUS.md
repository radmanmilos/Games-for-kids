# Project status

Updated: 2026-11-28
Repository: `radmanmilos/Games-for-kids`
Branch: `main`
Verified base for the current follow-up: `376ad2596d2488b5dd384d39be985f40fd6848b0`.

## Release/version

- Deployed baseline: `3.0.28`.
- Cat Forest full-overhaul candidate: `4.0.0` (A-version bump per the approved full-overhaul rule).
- Candidate is not a release until generated-artifact, offline, smoke, release and screenshot gates pass.

## Cat Forest — task 467

**Status: IN PROGRESS**

- User-approved scope: village, pond, woodland, workshop, keepsake crafting, reversible fixed-anchor decoration and expanded cat diary.
- Main implementation commit `611af17` adds four local scene illustrations, responsive scene navigation, compact baskets, keepsake recipes, crafted storage, save migration v3, smoke coverage, deterministic visual states and the CI screenshot-review job.
- **Verified CI:** Fast passed all 10 stages, including generated-artifact mirror and offline-inventory checks.
- **First CI run:** Cat Forest browser smoke failed at boot (18 checks passed, 3 failed) because five cat-render helpers were accidentally omitted; they were restored in commit `376ad25`.
- **Second CI run:** Cat Forest now boots and runs the full smoke suite: 225 passed, 6 failed. The remaining failures were geometry-test readiness/scene isolation, 320px treat sizing and an assertion reading an internal `flights` field not exposed by the JSON-safe state snapshot. These are corrected in the current follow-up; rerun is pending.
- The visual screenshot job is configured for the standard review battery: phone portrait, phone landscape, tablet portrait and tablet landscape. It has not run because the required smoke/release gates have not passed. No current screenshots have yet been captured or reviewed.
- Save schema v3 is required because the live pre-overhaul source already used v2. Existing v2 data migrates; v1 is discarded as explicitly approved.
- Real-device performance, audio/readability, reduced-motion, and child playtesting still require owner-run verification.

## Other project work

- Little Explorer: Q-plan implementation is reported complete through Q-23. Remaining owner-run work is tablet performance/visual/audio/readability checks, flashing/leak/acne checks, real-child playtesting, QG6 four-viewport package review and release sign-off. Do not mark these owner-run gates complete without evidence.
- Continue to use `project/PROCESS.md` and `AGENTS.md` for task lifecycle, generated docs, screenshot refresh and verification.

## Known process note

The earlier Cat Forest resource-persistence repair was pushed separately before the larger refactor was ready. The full refactor is built from the then-current main head; no history rewrite is planned. The user explicitly authorized work on main. The visual-review workflow may commit only refreshed review artifacts after the automated gates pass.
