# Progress tracker R0-R27 (finished)

Moved **verbatim** from `HANDOVER_PROMPT.md` (origin/main 71e1b7a) in the 2026-10-13 repo refactor. Paths inside refer to the pre-refactor layout (git tag `pre-refactor-2026-10-13`).

## Progress Tracker (R0–R27)

**Task numbers below are the real `PROJECT_TASKS.md` numbers, not the roadmap's "suggested task number"** — those drifted (the roadmap proposed 155–178, but 155 became the user-reported-bug fix, 156 the resource-budget task and 163 landed R12 early). Unfiled roadmap items show `—`. **29/29 done (R0–R27b) — the roadmap queue is complete.**

| # | ID | Task | Status |
|---|---|---|---|
| 1 | R0 | 151 | DONE — 4 failures classified (**2 of the 4 root causes were later found WRONG; see the correction note in `PROJECT_TASKS.md` 151**) |
| 2 | R1 | 152 | DONE — 19/19 tools, 435 checks, 0 fail, 1 skip |
| 3 | R2 | 153 | DONE — offline inventory validator + report; found & fixed the manifest self-hash bug and the Linux Chrome leak |
| 4 | R3 | 154 | DONE — fixed a live subpath bug in the service worker; added `sw_update_smoke.js` |
| 5 | R4 | 164 | DONE — CI topology refactor: 5 jobs, self-generating matrix, `fail-fast: false`; **CI was red before it** (referenced a deleted tool) |
| 6 | R5 | — | DONE 2026-09-30 (task 165) — validation commands are one meaning each: `check_fast.js` (read-only 6-stage gate), `validate_generated.js`, `validate_workflow.js` added; `check_release.js` rewritten as a read-only release gate that self-enforces the contract |
| 7 | R6 | 166 | DONE — true offline play E2E: one session, real offline controls (origin killed), 16 games driven with trusted input + geometry, **101 checks, 0 fail, 0 skip**; fixed 3 product bugs (dead back buttons in `explorer`/`parent`, racing3d start-modal trapping the back button, parent's update-check hanging forever offline) |
| 8 | R7 | 167 + 168 | DONE 2026-10-01 - `app-registry.js` is the single source of truth (shared `tools/registry.js`; 8 tools rewired; runtime routes, validation, offline coverage and the game-file-to-smoke mapping all derived); 3 guard negative-test suites so the new checks provably can fail. **Task 168 is the one to remember: 3 harness bugs that made checks pass while proving nothing** - the Chrome debug port was derived arithmetically and ~9% were unbindable on Windows (the real cause of the "intermittent" touch_interruption failures), `close()` was not awaited, and `screenshot.js` could not fail (relative navigate = blank PNGs, override applied before navigation, missing `deviceScaleFactor` = all sizes byte-identical). Battery **24/24, 492 checks**. |
| 9 | R8 | 169 | DONE — runtime-error, console, unhandled-rejection and resource-failure gate. |
| 10 | R9 | 170 | DONE 2026-10-01 — 85 reviewed baselines; deterministic decoded-pixel compare; explicit approval required for updates. |
| 11 | R10 | 171 | DONE 2026-10-01 — pinned axe-core, 18-surface blocking gate, contrast fixes. |
| 12 | R11 | 172 | DONE 2026-10-01 — blocking 180-cell Chromium/WebKit matrix; fixed portrait classroom overflow and covered coloring next button; 85 approved baselines refreshed. |
| 13 | R12 | 163 | DONE — parent area has version + connection status + manual ZIP link (**ZIP link hidden per user decision 2026-09-30**); hub guard asserts the child launcher stays clean |
| 14 | R13 | 173 | DONE — removed dead embedded Kitty/Explorer UI from the hub. |
| 15 | R14 | 174 | DONE — stable shared Serbian vocabulary, speech mappings and advisory duplicate-string audit. |
| 16 | R15 | 175 | DONE — shared audio routing, semantic events, speech ducking and game-family adoption. |
| 17 | R16 | 182 | DONE — asset and performance budget report (`ASSET_BUDGET.md`; committed `c2a40a2`). |
| 18 | R17 | 183 | DONE — manifest.json is the single version source; SW cache name derived from `sw.js?v=<version>`; update lifecycle + Serbian parent UX. |
| 19 | R18 | 184 | DONE — single roadmap index (`ROADMAP.md`); SUPERSEDED banners on the old plans; `HANDOVER_PROMPT.md` split into a short handoff + `resources/General_reviews/HANDOVER_ARCHIVE.md`. |
| 20 | R19 | 185 | DONE — local progress store (`window.PetrinProgress`); parent-only `📊 Напредак` panel (`Шта је коришћено` / `Шта је вежбано`) + reset. No XP/streak/badge/profile/sync. |
| 21 | R20 | 186 | DONE — `PLAYTESTING.md`: four manual sessions (toddler flow, five-game walk, offline, parent handoff) + `BLOCKER/MAJOR/MINOR/COSMETIC` classification. Live pass is the user's. |
| 22 | R21 | 187 | DONE — more/less/same pilot (`compare.html` + `compare.js`); three modes, no equations, gentle miss + hint; `compare_smoke` 24/24, offline E2E green (17 games). `screenshot:false` pending user-approved baseline. |
| 23 | R22 | 188 | DONE — sorting/classification pilot (`sorting.html` + `sorting.js`); two categories, drag/tap-to-place, magnetic + gentle miss, reusable category data. `sorting_smoke` 20/20, offline E2E green (18 games). `screenshot:false` pending user-approved baseline. |
| 24 | R23 | 189 | DONE — Serbian phonics pilot (`phonics.html` + `phonics.js`); audio-first (autoplay sound + tiny repeat), big Cyrillic letter, 2 choices with correct-start validation for 10 letters. No reading question, no score pressure. `phonics_smoke` 13/13, offline E2E green (19 games). `screenshot:false` pending user-approved baseline. |
| 25 | R24 | 190 | DONE 2026-10-04 — sequencing pilot (`sequencing.html` + `sequencing.js`); seed→plant→flower (start 3 cards), drag to slots, gentle feedback; celebration after each three-card sequence. `sequencing_smoke` 14/14; offline E2E 123/123 (20 games). `screenshot:false` pending user-approved baseline. |
| 26 | R25 | 191 | DONE 2026-10-04 — rhythm echo pilot; tap-tap and tap-pause-tap, one large drum, replay, gentle retry, no visible score/timer. `rhythm_smoke` 18/18; offline E2E 128/128 (21 games). `screenshot:false` pending user-approved baseline. |
| 27 | R26 | 192 | DONE 2026-10-05 — spatial concepts pilot (`spatial.html` + `spatial.js`); all five roadmap pairs as a scene plus two large Cyrillic words, mirrored `build()` so the scene cannot contradict the answer. `spatial_smoke` 41/41; offline E2E green (22 games). `screenshot:false` — baseline refresh blocked on a WebGL-capable host. |
| 28 | R27 | 193 | DONE 2026-10-05 — maze/path pilot (`maze.html` + `maze.js`); drag the bear along a wide forgiving stone path, cell-normalised snap, gentle off-path redirect, retry always available. `maze_smoke` 19/19; offline E2E green (23 games). `screenshot:false`. |
| 29 | R27b | 194 | DONE 2026-10-05 — reassessment of the original 9-item learning roadmap, delivered as `LEARNING_ROADMAP_REVIEW.md`: per-item verdicts with `file:line` evidence. Colors and World declined as duplicates per §41; alphabet largely done (30 letters in data, 10 with sounds) so the gap is data not architecture; numbers 11–20 is the cheapest real gap and is gated on de-hardcoding `classroom_smoke.js:62`. |
| — | *not a roadmap item* | 156 | DONE — resilient profiling, touch-interruption shards, piano readiness wait, and Windows Chrome teardown optimization; 27 tools / 575 checks passed. |
