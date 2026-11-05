# Petrin svet — Status

*Overwrite this file at the end of every session (never append). Budget: 6 KB, checked by node tools/check_docs.js.*

**Last updated:** 2026-11-05 **App version:** 3.0.1 (game/manifest.json) **Repository:** https://github.com/radmanmilos/Games-for-kids **Working branch:** docs/readme-phone-landscape-hero-task-376 (based on main 185b041)

## Current snapshot

- **Task 375 DONE** — parent-first README rehaul and documentation reconciliation. Existing app icon and hub screenshot reused; no runtime changes.
- **Task 376 DONE (PR #9 pending)** — README hero now references the owner-selected `resources/General_reviews/Screenshot_Review/hub_phone-landscape.png`. The image path was verified in the main Git tree. This is a user-requested README exception to the normal no-per-task README rule.
- **Runtime inventory:** 26 registered entries (25 child-facing pages + parent page); all registered pages and referenced smoke files exist. See project/reference/INVENTORY_MATRIX.md.
- **Assets:** 154 glyph WebPs and 11 scene assets. The art-integrity checker now diagnoses missing decoder tooling; CI provisions ffmpeg.
- **Version discovery:** task 365 added cache: 'no-store' for manifest discovery and service-worker bypass for the no-store manifest requests. Deeper lifecycle scenarios remain future validation.
- **Privacy review:** the runtime audit found local-origin app requests only, minimal local storage, no analytics/tracking/ads/third-party runtime scripts or unnecessary permission requests. Progress remains local.
- **Accessibility:** the automated axe report recorded 0 serious/critical violations across 27 pages. Manual keyboard, touch, zoom and screen-reader review was not re-run in that audit.
- **Visual audit:** short-landscape measurement (844×390) recorded 27 surfaces: 12 OK, 15 WARN, 0 FAIL. The warnings still need human adjudication. The screenshot PNGs were not individually inspected in that audit.
- **Game portfolio:** the registry/game matrix is structurally complete. A detailed behavioural, learning, audio, performance and child play-test review remains a separate activity; do not treat structural inventory as proof of full game quality.

## CI evidence on main

- **Run #487** — merge commit 185b041, fast gate and all listed smoke jobs succeeded; extended Chromium/WebKit matrix skipped; overall run completed successfully.
- **Run #483** — commit 2378ed2, full fast + smoke matrix + Release QA + Pages deployment: all completed jobs succeeded.
- **Run #484** — commit f9d2188, documentation-only: fast gate and Pages deployment succeeded; smoke and release jobs were skipped by the diff-driven workflow.
- The extended Chromium/WebKit × viewport matrix was skipped in these runs; it is reserved for scheduled/manual execution.
- The previous art-integrity blocker was traced to ffmpeg being absent on the GitHub runner. The workflow now installs it and the checker reports startup/spawn diagnostics.

## CI evidence on this branch

- **Run #488** (PR #9, task 376): in progress at the time of this status update; do not treat as green until GitHub reports completion.
- **Run #485** (PR #8, head a4cc041): fast gate passed all 10 stages; all 27 smoke jobs passed after one rerun; Release QA passed offline E2E, axe accessibility report and all three negative-test guards. The extended Chromium/WebKit matrix was skipped (scheduled/manual only).
- **Known smoke-test flake:** the first dino_smoke attempt failed on the randomly selected “Ледено доба” world because the assertion compares Art.fill's variation-selector-normalized dataset glyph with the original theme emoji. The retry passed. No game or smoke code was changed in this documentation task; track a deterministic assertion correction separately.

## Remaining review work

1. Human review of the 15 short-landscape WARN findings; some may be intentional stage-led or wordless screens, but each needs an explicit decision.
2. Manual accessibility and device checks (keyboard, touch, zoom, screen reader, reduced motion, orientation and safe areas).
3. Deeper service-worker lifecycle tests (multi-tab updates, interrupted downloads, quota/eviction, failed refresh and offline recovery).
4. Child/family playtesting and detailed per-game review for clarity, learning value, forgiveness and age fit.
5. Refresh/inspect visual screenshots as part of future UI changes; screenshot presence alone is not visual approval.

## Validation reference

- Fast read-only gate: node tools/check_fast.js
- Full smoke battery: node tools/check_all.js
- Release gate: node tools/check_release.js --release
- Accessibility report: node tools/axe_check.js --report
- Extended browser/device matrix: node tools/play_matrix.mjs

## Project rules

- game/ is the deployable source of truth; docs/ is its generated mirror.
- resources/ contains development/review assets; tools/ contains development and validation tooling.
- Do not claim manual validation, child playtesting or release readiness without evidence.
- Follow AGENTS.md, project/PROCESS.md and project/DECISIONS.md.
