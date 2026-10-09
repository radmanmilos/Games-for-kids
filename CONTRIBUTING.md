# Contributing to Petrin svet

## Setup

1. Clone the repo and open it in VS Code.
2. Serve `game/` over HTTP — never `file://` (breaks audio and throws `Unsafe-attempt` warnings).
   - Recommended: use the **Live Server** extension (`ritwickdey.LiveServer`).
3. No `npm install` or build step is required. The app is plain HTML/CSS/JS.
4. Serbian Cyrillic text and speech are mandatory for all child-facing content.

## Validation

Before opening a PR, run the smallest targeted check that covers your change:

- Syntax (whole repo, no browser): `node tools/check_syntax.js` — `node --check` over every `.js`/`.mjs` in `game/` + `tools/`
- Registry / routes / PWA metadata: `node tools/validate_pages.js`
- Offline inventory (cache list + manifest): `node tools/validate_offline.js`. There is **no ZIP** — offline delivery is the service worker; the mechanism is documented in `OFFLINE.md`.
- Parent area (offline download, update check, reset, version) → `node tools/parent_smoke.js`. It also asserts **no manual ZIP link** — that option was removed 2026-10-02 (see `OFFLINE.md` for the mechanism that replaced it).
- Service-worker update path → `node tools/sw_update_smoke.js`
- Runtime exceptions, console errors, rejected promises and local resource failures → `node tools/runtime_error_smoke.js`
- Visual baseline capture and pixel comparison → `node tools/visual_compare.js` (85 images; decoded pixels; failure diffs in `tools/screenshots/diff/`); algorithm smoke → `node tools/run_all.js visual_compare_smoke.js`. Replace the full baseline only after review, with the explicit `--approve-baseline` option.
- Hub changes → `node tools/hub_smoke.js`
- Kitty changes → `node tools/kitty_smoke.js`
- Adventure engine / Driving / Ocean / Dino / Space → `node tools/adventure_smoke.js` (25 checks)
- Tracing → `node tools/tracing_smoke.js`
- Piano → `node tools/piano_smoke.js`
- Memory → `node tools/memory_smoke.js`
- Candy → `node tools/candy_smoke.js`
- Puzzle → `node tools/puzzle_smoke.js`
- Classroom kids tier → `node tools/classroom_smoke.js`
- Racing 3D (Мала тркачица 3Д) → `node tools/racing3d_smoke.js`
- Touch-interruption resilience (4 shards) → `node tools/run_all.js --game touch_interruption`
- Animals / Shapes / Counting / Coloring → `node tools/animals_smoke.js`, `node tools/shapes_smoke.js`, `node tools/counting_smoke.js`, `node tools/coloring_smoke.js`
- Everything at once → `node tools/check_all.js` (syntax + the full battery; add `--docs` after any `game/` change). `node tools/run_all.js --list` shows the battery, `--game <name>` narrows it, `--resume` survives a host that kills the process.
- Quick read-only gate (~9 s, writes nothing) → `node tools/check_fast.js`. This is exactly what CI's `fast` job runs.
- Before a release → `node tools/check_release.js --release` (read-only: `check_fast` + the whole battery + blocking offline and accessibility gates).

If a smoke does not exist for the game you changed, run the page manually in Live Server and verify the interaction visually.

## CI (GitHub Actions)

`.github/workflows/ci.yml` runs on every push and PR, and is split so that one failure can never hide the others:

| Job | What it runs | When |
| --- | --- | --- |
| `setup` | selects affected smokes via `tools/ci_affected_matrix.js` and `run_all.js --affected`; no usable event base falls back to the full battery | every push/PR; manual/weekly use the full battery |
| `fast` | `check_fast.js` — syntax, registry/metadata, CI-workflow topology, code-scanning-alert guards, generated-artifact freshness, offline inventory, hub smoke (**no** game battery; read-only) | every push/PR |
| `smoke` | one leg per selected smoke via `run_all.js`, `fail-fast: false`, `max-parallel: 6` | affected smoke changes; no legs for docs-only changes |
| `release` | blocking offline E2E + serious/critical accessibility scan | when smoke legs run |
| `extended` | blocking `play_matrix.mjs` (Chromium + WebKit × 5 viewports; missing-engine skips fail coverage) | manual run or weekly |

Consequences for contributors:

- **A new smoke needs no workflow edit** — the selector derives the battery from `run_all.js`; changes to the selector, workflow, or release-only gates escalate to the full battery. Docs-only changes run the fast gate without smoke/release legs. Manual and weekly runs always use the full battery.
- **Automated gates first, then a manual portfolio pass.** See `PLAYTESTING.md` (R20) for the four-session protocol (toddler flow, five-game random walk, offline, parent handoff) and the `BLOCKER / MAJOR / MINOR / COSMETIC` classification. Run it before a release and after any new pilot.
- `axe_check.js --report` is blocking for incomplete scans and serious/critical violations. Its pinned axe-core 4.10.2 tool asset is vendored under `tools/vendor/`; `game/` never depends on it. Moderate/minor findings remain visible in the page-by-page report without failing CI.
- **No CI step or validator may regenerate what it inspects** (R5). If you edit `game/`, run `node tools/sync-docs.sh` (or `check_all.js --docs`) and commit the result; `check_fast.js` and `check_release.js` will *fail* on an unsynced `docs/` rather than fixing it, which is deliberate — a check that repairs what it inspects can never report a stale artifact.
- `tools/check_release.js` is deliberately **not** a CI job: it re-runs the entire battery, which the `smoke` matrix already ran in parallel, one leg per job. Run it locally before a release.
- The CI workflow's own shape is guarded by `tools/validate_workflow.js` (17 checks, runs inside `check_fast`), so the R4 fixes — a deleted tool reference, a matrix generated from the battery, `fail-fast: false`, a direct `needs` for every `needs.*.outputs` read — cannot silently regress.
- The two GitHub code-scanning alerts are guarded by `tools/check_scan_alerts.js` (5 checks, also inside `check_fast`): a dangerous-scheme filter must test `javascript:` **and** `vbscript:`, and an HTML stripper must consume the whole closing tag. Both rules are checked behaviourally and self-tested against the pre-autofix shapes, so the guard cannot report green by matching nothing. Known residual: the `</script/>` closing form is deliberately not covered.
- A red `fast` job means a syntax/registry/inventory/generated-artifact/workflow/scan-alert/hub problem — not a game. Read the failing leg's own matrix cell before suspecting a game.

## Task lifecycle

- **Task 222 (Visual/UX V6.1 — Petrin Glow) is DONE (2026-10-09); task 221 (Visual/UX V5.1 — learning-stage grammar) is DONE (2026-10-09); task 220 (Visual/UX V4.1 — Adventure HUD unification) is DONE (2026-10-09); task 219 (Visual/UX V3.2 — 4 short-landscape FAIL fixes, audit at 0 FAIL) is DONE (2026-10-09); task 218 (terminal plan-status line `tools/plan_progress.js`) is DONE (2026-10-09); task 217 (Visual/UX V3.1 — 844×390 short-landscape audit) is DONE (2026-10-09); task 216 (V0–V2) is DONE (2026-10-08).**

- **Before starting any new task, check git/CI status** (`git status --short`, `gh run list`). If anything is failing or the tree is dirty in a way you did not create, report it and propose fixing it first — never start a new task on a red pipeline or a stale tree (task 214).
- Mark the task **IN PROGRESS** in `PROJECT_TASKS.md` when starting and **DONE** with a dated note (who, what, why) when finished.
- **Refreshing review screenshots is part of a change's definition of done (task 213).** If your task changes what a child or parent SEES on any screen (a game page, the hub, shared CSS/JS that visibly alters a page), refresh the affected screenshots in the review battery under `resources/General_reviews/<name>/` and commit them with the change. The review folder uses a **stable generic name (`Screenshot_Review`)** — later tasks refresh the same folder (`--review=Screenshot_Review --pages=… --task=…`), never a new dated folder:
  - One changed screen → `node tools/screenshot.js --review=<name> --pages=<page ids> --task=<task id>`
  - Full battery (new review, or screens across many pages) → `node tools/screenshot.js --review=<name> --task=<task id>`
  - A brand-new screen must first be added to the registry (`tools/registry.js`) so `ALL_PAGES` sees it, then captured on the task that introduces it.
  - Provenance (`screenshot-provenance.json`) updates **per file**, so untouched pages keep their last `updatedAt`/task; the TOC's "Последња слика (датум · време)" and "Задатак" columns make a stale shot attributable. A stale screenshot is a regression like a missing docs update.
- R24 (sequencing pilot, task 190) is DONE: its smoke covers real drag/feedback/completion, its offline spec performs a trusted drag, and the offline E2E passed for all 20 games. R25 rhythm imitation (task 191) is DONE; R26 spatial concepts (task 192), R27 maze/path (task 193) and R27b (task 194) are DONE, and **the Fresh Elevation Roadmap queue is now complete (29/29)**. R27b delivered `LEARNING_ROADMAP_REVIEW.md` — a per-item reassessment of `resources/General_reviews/Learning_Content_Roadmap.md`, each verdict verified against the code. **Tier A item 1 is DONE (task 196):** `phonics` now derives all **30** letters from `SERBIAN.alphabet` (the array `classroom.js:30` and `tracing.js:18` already read) and speaks the letter recordings `speech.js` registers, instead of a hand-written 10-entry list — 6 of whose pairs taught a false letter/sound association. **Tier A item 2 is DONE (tasks 197 + 198, 2026-10-06):** 11–20 added to `SERBIAN.numbers` (`classroom.js:41` displays them with zero game code; `speech.js` `numberFiles`/`sentenceFiles` → 21 each). The recordings were generated in-repo with `resources/tts_generate.js` — a Google Translate TTS fetcher present since the first commit `d02c6e2` that a history search for TTS *engines* missed; never assume a capability is absent without searching for a generator, and never weaken `registerEach`'s length check. **Tier B items 3+4 are DONE (task 203, 2026-10-06):** Classroom `Време` (time of day, emoji scenes) and `Годишња доба` (4 SVG season scenes + 4 SVG weather scenes) activities, registered on the task-198 clips, plus four more `sequencing` sequences (8 total) — Tier B item 5. **When adding content, derive from `SERBIAN.*` and feed it through `speech.js`'s `registerEach` (which throws if a recording list is short); never hand-write a parallel list**, and assert relationships in the game's smoke — a comment claiming verification is not a check. Number counters in smokes must derive from `SERBIAN.numbers.length` (see `tools/tracing_smoke.js`'s `1 од 21`), as `classroom_smoke.js` already does. **Regeneration order matters: run `node tools/build_offline.js` *before* `bash tools/sync-docs.sh`**, because `build_offline.js` rewrites the two inventories inside `game/` and explicitly writes nothing to `docs/`; mirroring first leaves `docs/` stale by exactly those 2 files and `validate_generated` fails. `check_all.js --docs --offline` was fixed to do this in the right order (task 195). R16 (asset/performance budget, task 182), R17 (PWA install/update/version QA, task 183), R18 (documentation/roadmap consolidation, task 184), R19 (local progress, task 185), R20 (portfolio playtesting protocol, task 186), R21 (more/less/same pilot, task 187), R22 (sorting/classification pilot, task 188) and R23 (Serbian phonics pilot, task 189) are DONE. The active roadmap is named in `ROADMAP.md`. **CI is green** — run #41 was the first fully green run (29 succeeded, 1 skipped by design, 0 failed) and issue #3 is closed. Tasks 178–181 are DONE: 178 made the CDP `describe()` diagnostic describe the right Chrome process (if you change `tools/headless.js`'s boot loop, run `node tools/guards/chrome_diagnostic_negtest.js` — it must read **per-attempt** exit state, never the loop-wide `chromeExitEvent`); 179 removed the offline ZIP (`OFFLINE.md`); 180 fixed a guard that asserted what it could never satisfy; 181 fixed `Release QA`.
- **Never run a `*_smoke` tool raw in CI.** Chrome boot crashes are routine on GitHub runners (13 of 27 legs hit one on run #40, all recovered on retry). `node tools/run_all.js <smoke>` is the retry that absorbs them; `Release QA` was the last runner bypassing it and went red on every run until task 181. Also note `tools/run_all.js` cannot route a tool that has no exit code — check `offline_smoke.mjs`'s `getFails()` if you add a new standalone gate, since a gate that prints FAIL and exits 0 is worse than no gate.
- **A guard that asserts something its own implementation can never satisfy will red a real pipeline (task 180).** Run every CI-run guard locally at clean HEAD before believing it.
- **A diagnostic is a check too, and it needs its own guard.** The first version of `guards/chrome_diagnostic_negtest.js` **passed against the code it was written to catch**, because its assertion was behavioural against a race (whether the CDP socket close or the child `exit` event lands first). When a guard's premise can only be true by luck, pin the deterministic invariant (which binding the code can reach) and demote the flaky observation to supporting evidence.
- **A layout that "passes" because the harness scrolls it into view is still broken** (task 177c). `headless.js`'s `boxOf` calls `scrollIntoView`, so a control clipped out of the viewport inside an `overflow:hidden` container gets scrolled into view and its geometry check passes — while a child still cannot see or tap it. When a test stands in for a human interaction, assert the geometry too, and remember that an animated control (e.g. a `pulse` scale) can tip a marginal check over only on some runs.
- **The parent area is behind a question gate** (task 201, at the user's request): a multiplication question guards the offline download, the update check, progress reset and audio test, so a small child cannot reach them. Anything that drives the parent page in a test **must answer the gate first** — `tools/offline_smoke.mjs` provides `unlockParentGate(h, label)` for this and calls it at **both** parent visits, because the tool navigates to the page twice (online to prime the cache, offline to prove the controls survive) and the gate is per page load, not remembered. Do not "fix" a gate failure by deleting the gate or forcing a button visible: the offline gate exists precisely to prove those controls are genuinely reachable once unlocked. Note the pre-existing parent checks use `.click()`, which bypasses hit-testing and so passes even when the gate is absent — `parent_smoke.js` asserts reachable state (`offsetParent === null` **and** `elementFromPoint`) for that reason.
- **`headless.js` drives real mouse input only and has no touch emulation**, so any `touch-action`-class defect stays green until a real finger finds it — task 200 shipped a broken sorting drag for exactly this reason. For anything draggable set `touch-action:none` on the draggable element itself (`touch-action` on `html,body` does not cover children) and assert `getComputedStyle(el).touchAction === 'none'` in the smoke.
- **A check that reads state *after* an interaction cannot see a bug that the interaction itself fixes.** Task 216: `puzzle_smoke.js` asserted the exact level-label string, but read it *after* clicking `#sceneButton` — whose handler `startPuzzle()` calls `setGrid()` → `updateLabels()`. The `[object Object]` defect existed only in the window between page load and that first click, so the assertion passed while the label was broken. **Read state before any interaction when the bug may be in the initial render.** Same family as the task-177c `scrollIntoView` rescue: the test's own setup can erase the defect it is meant to catch.
- **A count that pins today's value cannot survive the change it is supposed to allow.** This bit five times in one session: `classroom_smoke`'s `SW.tiles === 11`, `hub_smoke`'s games count of `10`, `coloring_smoke`'s `U.palette === 11`, `offline_smoke`'s `===3` sequencing step pin, and `sequencing_smoke`'s hardcoded 4-id sequence list. Derive the expectation from the data (`SERBIAN.*`, `app-registry.js`, the game's own `ids()` API, `run_all.js --list`) and assert the **invariant** — "slots and cards are equal and non-zero", "the numbers render in the vocabulary's order", "every sequence id builds" — rather than the literal.
- Refresh `README.md` and `HANDOVER_PROMPT.md` alongside it. Missing docs updates are a regression (see `AGENTS.md` → Working rhythm).
- Never commit or push to `main` automatically — the user does that explicitly.

## Docs mirror (publishing to GitHub Pages)

`game/` is the single source of truth. `docs/` is the published copy served by GitHub Pages from the `main` branch.

Every time `game/` changes, replace the entire `docs/` content with the new `game/` content:

```bash
bash tools/sync-docs.sh
git add docs/
git commit -m "sync docs/"
git push
```

The site updates on push to `main`. Do not edit `docs/` directly.

## Project rules

- Follow the YAGNI rules in `AGENTS.md`.
- Do not add external runtime dependencies or remote assets without explicit approval.
- Keep `game/` clean and deployable — no docs, experiments, or unused assets.
- `resources/` is development-only; `tools/` is dev/test tooling. Neither is required at runtime.
- Do not commit secrets or keys.
- When in doubt, ask before expanding scope.
