# Project status

Updated: 2026-11-28
Repository: `radmanmilos/Games-for-kids`
Branch: `main`
Verified base for current follow-up: `231a2a7c14ba902bb000f9ba87d18eec52984da5`.

## Release/version

- Deployed baseline: `3.0.28`.
- Cat Forest full-overhaul candidate: `4.0.0` (A-version bump per the approved full-overhaul rule).
- Candidate is not a release until generated-artifact, offline, smoke, release and screenshot gates pass.

## Cat Forest — task 467

**Status: IN PROGRESS**

- User-approved scope: village, pond, woodland, workshop, keepsake crafting, reversible fixed-anchor decoration and expanded cat diary.
- Main implementation commit `611af17` adds four local scene illustrations, responsive scene navigation, compact baskets, keepsake recipes, crafted storage, save migration v3, smoke coverage, deterministic visual states and the CI screenshot-review job.
- Cat-render boot helpers were restored in commit `376ad25`.
- Viewport setup, 320px touch sizing and a test snapshot assertion were corrected in commit `231a2a7`.
- **CI history:** first two Fast gates passed 10/10. The first browser run failed at boot because of omitted cat-render helpers. The second browser run booted and ran 231 checks (225 passed, 6 failed) due to viewport readiness/scene isolation, small-screen sizing and an internal snapshot assertion.
- **Latest CI run (231a2a7):** Fast failed syntax (duplicate `booted` binding) and offline inventory (stale SHA-256 for Cat Forest engine/page; sizes matched). All other Fast stages passed, including generated artifacts, art integrity and hub smoke. The current follow-up fixes the variable binding and regenerates offline hashes from exact committed bytes; rerun pending.
- The visual screenshot job has not run because the required smoke/release gates have not passed. The configured review battery is phone portrait, phone landscape, tablet portrait and tablet landscape. No current screenshots have been captured or reviewed.
- Save schema v3 is required because the live pre-overhaul source already used v2. Existing v2 data migrates; v1 is discarded as explicitly approved.
- Real-device performance, audio/readability, reduced-motion, and child playtesting still require owner-run verification.

## Other project work

- Little Explorer: Q-plan implementation is reported complete through Q-23. Remaining owner-run work is tablet performance/visual/audio/readability checks, flashing/leak/acne checks, real-child playtesting, QG6 four-viewport package review and release sign-off. Do not mark these owner-run gates complete without evidence.
- Continue to use `project/PROCESS.md` and `AGENTS.md` for task lifecycle, generated docs, screenshot refresh and verification.

## Known process note

The earlier Cat Forest resource-persistence repair was pushed separately before the larger refactor was ready. The full refactor is built from the then-current main head; no history rewrite is planned. The user explicitly authorized work on main. The visual-review workflow may commit only refreshed review artifacts after the automated gates pass.
