# Петрин свет — Fresh Product & Engineering Elevation Roadmap

**Document type:** Implementation-AI master handoff / executable roadmap  
**Prepared:** 2026-09-29  
**Repository:** `radmanmilos/Games-for-kids`  
**Current main HEAD reviewed:** `b9808f9cab9ef328b82c6d6d7ffd580f8b18d520`  
**Current HEAD commit:** `docs: mark all 18 Master Implementation Plan tasks DONE`  
**Purpose:** Replace the now-completed 18-task hardening plan with a truthful, dependency-ordered next-stage plan focused on release reliability, product cohesion, deployment confidence, quality depth, and then carefully selected learning expansion.

---

# 0. Executive Direction

Петрин свет has crossed an important threshold.

The project is no longer primarily an early prototype that needs more games. It already contains a meaningful collection of child experiences, shared architecture, local Serbian speech, local animal sounds, a service worker, an offline package, a parent area, a registry, smoke tests, touch-interruption checks, screenshots, visual comparison tooling, and GitHub Actions.

The next quality jump should therefore **not** be driven by adding many new icons or large gameplay systems.

The next quality jump should be driven by making the current product behave like one dependable children's application:

```text
truthful roadmap
      ↓
green release pipeline
      ↓
complete offline experience
      ↓
reliable deployment/update flow
      ↓
consistent child shell
      ↓
measurable visual/accessibility quality
      ↓
performance + asset discipline
      ↓
complete Serbian/audio integration
      ↓
stronger developmental progression
      ↓
small, evidence-driven new learning activities
```

The implementation AI must treat this document as the **new active roadmap** after the existing 18-task plan.

The old planning documents remain valuable historical records, but they are no longer the execution queue.

---

# 1. Current Repository Baseline

## 1.1 Product surface

Current registry state contains:

- 16 child-facing game experiences.
- 1 parent/technical area.
- 1 hub/launcher.
- Standalone pages under `game/pages/`.
- A canonical standalone Explorer page replacing the old embedded Kitty architecture.

The current public child set represented in `game/data/app-registry.js` is:

1. `animals`
2. `animal_counting`
3. `animal_memory`
4. `animal_puzzle`
5. `classroom`
6. `coloring`
7. `tracing`
8. `piano`
9. `shapes`
10. `matching_game`
11. `driving`
12. `ocean`
13. `dino`
14. `space`
15. `racing3d`
16. `explorer`
17. `parent` — technical/parent surface, not a child game

The implementation AI must preserve the distinction between **child apps** and the **parent surface** in all future tooling.

---

# 2. Important Decisions That Are Already Closed

Do not reopen these decisions unless the user explicitly asks.

## 2.1 Animal artwork decision

Native Unicode emoji are now the accepted animal-art baseline.

The custom SVG animal illustration experiment was explicitly rejected after real play-testing because the visuals looked too crude.

Current rule:

```text
animal emoji = accepted current visual language
```

Do not reintroduce the rejected custom SVG illustration system merely because a previous roadmap called for local illustrations.

Do not start a large animal-art replacement project in the first quality phase.

A future professional animal asset pack can be evaluated only as a separate product/design experiment with actual play-testing evidence and local/offline licensing. It must never be introduced simply to satisfy a historical ART-001 status.

---

## 2.2 Explorer architecture decision

Explorer is now a standalone route:

```text
pages/explorer.html
        ↓
games/kitty-standalone.js
```

The deleted legacy `kitty.js` must not be restored.

The old embedded Explorer/Kitty architecture must continue to be removed from the hub.

---

## 2.3 No pressure mechanics

Do not add:

- lives
- hearts
- energy
- leaderboards
- competitive rankings
- streak pressure
- daily return pressure
- public profiles
- accounts
- cloud progression
- purchases
- advertising

Adaptive difficulty must remain gentle and invisible to the child where practical.

---

## 2.4 Racing3D rule

Racing3D is a mature/high-risk area.

Do not destabilize it by broad refactors merely to make code aesthetically cleaner.

When touching Racing3D:

1. make one small change;
2. run `node tools/racing3d_smoke.js` alone;
3. validate the broader adventure/product surface only after the targeted test is green;
4. preserve the existing user-locked steering, reduced-motion, particle, audio, and world decisions.

---

# 3. Fresh Audit — High-Level Result

The previous 18-task plan is **not yet a trustworthy release baseline**, even though the project task tracker marks all 18 tasks DONE.

The key reason is that several completion claims were made from local/partial validation while the latest GitHub Actions run on the current HEAD is red.

The implementation AI must begin by correcting this truth gap.

---

# 4. P0 Findings — Must Be Resolved Before New Feature Work

## P0.1 Current CI is red

Latest GitHub Actions CI run for the current HEAD failed in the `fast` job.

The failure occurred after syntax checking completed successfully.

Current observed result:

```text
Syntax check: 73 files
Syntax OK

Smoke battery: 19 tools

FAIL adventure_smoke.js       24 pass / 1 fail
FAIL classroom_smoke.js       16 pass / 1 fail
FAIL counting_smoke.js        11 pass / 1 fail
FAIL racing3d_smoke.js         3 pass / 1 fail
```

The touch interruption suite itself passed:

```text
17 games
85 checks
0 failures
```

Therefore the immediate problem is not “CI infrastructure is completely broken”. The immediate problem is that the repository's own release assumptions are inconsistent with its current automated truth.

Current failing assertions were:

### Adventure

```text
FAIL ground mode: mouse hit knocks back
[bumpCount: 0, visible: true]
```

### Counting

```text
FAIL wrong tap: nudge "Покушај поново"
[actual result: "Хајде поново!"]
```

### Classroom

```text
FAIL wrong tap nudges, question stays
[actual feedback: "Хајде поново!"]
```

### Racing3D

```text
FAIL start picker: 8 world cards + 4 kart colors...
[actual cards: 1, actual worldCount: 1]
```

The AI must not automatically label these as “flakes”.

The counting and classroom failures are especially likely to be simple vocabulary/test-sync mismatches, but they still have to be proven against product intent.

The Racing3D failure is different: the current test expected eight worlds while the current runtime reported one. This requires inspecting whether the shared configuration changed, whether the module imports correctly, whether the smoke assumptions are stale, or whether the CI environment is loading a different/incomplete asset/config path.

The Adventure failure must similarly be reproduced alone before any change is made.

---

## P0.2 Offline cache inventory is stale

The current repository tree contains 207 files under `game/`, but `game/sw-cache-list.json` contains only 203 entries.

Files currently missing from the service-worker list include:

```text
data/app-registry.js
pages/explorer.html
pages/parent.html
docs/OFFLINE_INSTALL.md
```

The current offline manifest also contains two stale entries that are no longer present in the current game tree:

```text
games/racing-config.js
games/racing.js
```

That means the current repository has a direct truth mismatch between:

```text
game/
sw-cache-list.json
offline-manifest.json
```

This is a release-level issue.

A child or parent should not be told that an offline package is complete when the generated inventory is stale.

---

## P0.3 Offline smoke is weaker than its documentation says

`tools/offline_smoke.mjs` currently claims to verify:

- reopening offline;
- loading every public app;
- primary interaction;
- audio/speech;
- navigation.

The actual implementation currently verifies primarily:

```text
service worker ready
hub has UI
page has UI
```

It does **not yet perform the claimed primary interaction/audio/navigation sequence for every app**.

Therefore the next plan must upgrade it from:

```text
offline load smoke
```

to:

```text
offline play smoke
```

This distinction is important.

---

## P0.4 CI architecture is unnecessarily coupled

Current `.github/workflows/ci.yml` has:

- a `fast` job that runs `tools/check_all.js`;
- `check_all.js` itself runs the full smoke battery;
- then the same CI workflow separately defines a smoke matrix;
- the matrix depends on `fast`;
- the release job also depends on `fast`.

This creates a poor failure topology.

A failure in one game smoke prevents independent smoke jobs and the release job from running.

It also makes the `fast` job much more expensive than its name suggests.

The result is visible in the current failed run: four real smoke failures in `fast` caused the matrix/release jobs to be skipped.

The next CI design must separate:

```text
syntax / structural checks
        ↓
route / metadata / hub checks
        ↓
independent game smoke matrix
        ↓
full release quality checks
```

No single game failure should hide the test results of all unrelated games.

---

## P0.5 Release scripts overlap and mutate too much

`tools/check_all.js` and `tools/check_release.js` currently overlap conceptually.

Problems to resolve:

- `check_all.js` is described as a development validation ritual but runs the full smoke battery.
- `check_release.js` invokes `check_all.js` and then can re-run smoke tools again.
- `check_release.js` runs docs sync as part of validation, which mutates repository state.
- release validation should measure state before release rather than silently repairing it.

The target is:

```text
check_fast.js       = read-only fast checks
check_game.js       = targeted affected game battery
check_release.js    = read-only release gate
build_offline.js    = explicit artifact generation step
sync-docs.sh        = explicit mirror generation step
```

The commands may use different filenames, but the semantics must remain clear.

---

# 5. Current Documentation Is Not Yet a Single Source of Truth

The repository now contains multiple major planning documents:

```text
resources/General_reviews/PETRIN_SVET_MASTER_EXECUTION_ROADMAP.md
resources/General_reviews/Petrin_svet_Master_Implementation_Plan.md
resources/General_reviews/Learning_Content_Roadmap.md
ROADMAP_AUDIT.md
PROJECT_TASKS.md
HANDOVER_PROMPT.md
README.md
```

This was useful during rapid development, but the information has now drifted.

## 5.1 Concrete stale-document problem

`ROADMAP_AUDIT.md` still has a 2026-09-28 state that says things such as:

- ART-001 is partial because of emoji dependence;
- Explorer is partial;
- Driving is partial;
- Ocean is missing;
- Dino is missing;
- Space is missing;
- PWA-003 is missing;
- touch interruption is missing;
- visual regression is missing;

Those statements describe an earlier repository state, not the current implementation.

`PROJECT_TASKS.md` contains the more recent task numbers 135–150 and therefore is more current for those changes, but it also contains known failures marked under DONE tasks.

`HANDOVER_PROMPT.md` still contains large historical material describing older route sets, older racing architecture, and earlier “next work” that is no longer the active queue.

`README.md` contains historical sections that still refer to retired routes/features even though the current registry and source tree no longer contain them.

The new plan therefore starts with a **roadmap truth reconciliation** task after the release blockers are understood.

---

# 6. What Is Already Strong

The project should not lose the progress that is already valuable.

## 6.1 Strong current product foundation

Current strengths visible in the repository include:

- 16 distinct child experiences.
- Serbian/Cyrillic child-facing language policy.
- Local speech assets for a meaningful vocabulary set.
- Local animal sounds.
- Native emoji restored after actual animal-art playtesting.
- Standalone app pages.
- Shared navigation.
- Shared audio bus architecture.
- Shared feedback/celebration layers.
- Shared input helper.
- Reduced-motion infrastructure.
- Safe-area/viewport tokens.
- App registry.
- Parent area.
- Offline package tooling.
- Network-blocked offline smoke prototype.
- Touch interruption suite.
- Play matrix tooling.
- Accessibility scan tooling.
- Screenshot capture.
- Visual comparison tooling.
- GitHub Actions.
- Shared adventure engine boundary.
- User-tested Racing3D polish pipeline.

The next roadmap should therefore **finish and integrate what exists** instead of replacing the architecture.

---

# 7. New Roadmap Priority Model

Use this priority definition throughout implementation.

## P0 — Release blockers

Anything that can make the shipped application incorrect, unavailable, non-offline, or falsely reported as healthy.

Examples:

- failing CI
- missing offline assets
- broken routes
- broken service-worker update path
- invalid release gate

## P1 — Product-quality multipliers

Changes that improve every game or materially improve trustworthiness.

Examples:

- generic runtime error capture
- real offline gameplay testing
- proper visual regression
- meaningful accessibility gate
- child/parent shell separation
- unified language/audio data

## P2 — Cohesion and polish

Changes that make the collection feel like one polished product and improve maintainability/performance.

Examples:

- central shared components
- asset budget
- parent transparency
- better deployment diagnostics
- game lifecycle standardization

## P3 — Educational expansion

New learning mechanics after the existing platform is genuinely reliable.

Examples:

- more/less/same
- sorting
- phonics
- sequencing
- spatial concepts
- rhythm imitation

---

# 8. Dependency Graph — New Active Roadmap

Implement in this broad order:

```text
R0  Baseline truth + failing-test reproduction
 |
 +--> R1  Fix the four currently failing smoke/tool checks
 |
 +--> R2  Regenerate + validate offline inventory
 |      |
 |      +--> R3  Fix service-worker/update path correctness
 |
 +--> R4  Refactor CI topology
 |
 +--> R5  Make fast/release commands semantically clean
 |
 +--> R6  Make offline E2E truly behavioral
 |
 +--> R7  Make registry semantics authoritative for test classes
 |
 +--> R8  Runtime error/console/unhandled-rejection gate
 |
 +--> R9  Visual regression operational baseline
 |
 +--> R10 Accessibility gate operational
 |
 +--> R11 Browser/device quality matrix
 |
 +--> R12 Child/parent shell separation + hub cleanup
 |
 +--> R13 Serbian data/source-of-truth completion
 |
 +--> R14 Audio architecture completion
 |
 +--> R15 Asset + performance budget
 |
 +--> R16 PWA installation/update/version QA
 |
 +--> R17 Documentation/roadmap consolidation
 |
 +--> R18 Optional local progress layer
 |
 +--> R19 Portfolio-level playtest protocol
 |
 +--> R20 New learning pilot: More/Less/Same
 |
 +--> R21 New learning pilot: Sorting
 |
 +--> R22 New learning pilot: Serbian phonics
 |
 +--> R23 New learning pilot: Sequencing
 |
 +--> R24 New learning pilot: Rhythm
 |
 +--> R25 New learning pilot: Spatial concepts
 |
 +--> R26 New learning pilot: Maze/path
 |
 +--> R27 Review 1–20 / Colors / Time / Words / Seasons / STEM roadmap
```

Important dependency principle:

```text
new game work may NOT become the main development stream until R0–R17 are green.
```

---

# 9. R0 — Baseline Truth Reconciliation and Reproduction

**Priority:** P0  
**Dependencies:** none  
**Blocks:** all subsequent release work until baseline is understood  
**Suggested task number:** 151

## Goal

Create a factual current-state baseline from the actual HEAD rather than trusting DONE markers.

## Inspect

Record:

- current commit SHA;
- all public app registry entries;
- all page files;
- all smoke files;
- current offline inventory;
- current manifest;
- docs mirror status;
- current CI result;
- current failing smoke tests;
- current deployment targets in documentation.

## Reproduce the four failures individually

Run:

```text
node tools/adventure_smoke.js
node tools/classroom_smoke.js
node tools/counting_smoke.js
node tools/racing3d_smoke.js
```

Do not change test expectations before reproducing.

For each failure, determine one of:

```text
A = product bug
B = test expectation stale relative to accepted behavior
C = environment-specific loading issue
D = nondeterministic test fixture
E = deployment/configuration issue
```

The classification must be written into `PROJECT_TASKS.md` before fixing.

## Required output

Create a short machine-readable table in the task log:

| Check | Reproduces alone | Classification | Root cause | Fix |
|---|---|---|---|---|

## Acceptance

- all four failures reproduce or are explained with evidence;
- no failure is dismissed as a flake without an isolated rerun;
- no feature work starts before this classification exists.

---

# 10. R1 — Restore the Core Smoke Battery to Green

**Priority:** P0  
**Dependencies:** R0  
**Suggested task number:** 152

## Goal

Resolve the four red checks from the current HEAD.

## R1-A — Counting

Current mismatch:

```text
expected: Покушај поново
actual:   Хајде поново!
```

Do not blindly edit the game.

First inspect:

- `game/data/serbian.js`
- `game/games/animal_counting.js`
- `tools/counting_smoke.js`

Decide which phrase is the approved current vocabulary based on the project's current language data and recent product behavior.

Prefer the shared data source over duplicated hard-coded strings.

Then update either the test or game only if that is the correct source-of-truth direction.

## R1-B — Classroom

Current mismatch:

```text
expected: Покушај још једном!
actual:   Хајде поново!
```

Inspect:

- `game/games/kids_games.js`
- `game/games/classroom.js`
- `game/data/serbian.js`
- `tools/classroom_smoke.js`

Apply the same source-of-truth principle as counting.

## R1-C — Adventure ground hit

Current failure:

```text
mice[0]
visible = true
bumpCount = 0
```

Inspect the actual mouse object shape and collision conditions.

The smoke test must position a mouse in a deterministic, collision-valid state rather than relying on an assumption that its first entry has the expected geometry.

Preferred solution if the product code is correct:

```text
make the test fixture deterministic
```

Do not weaken the real collision system just to satisfy the test.

## R1-D — Racing3D world picker

Current CI result:

```text
cards = 1
worldCount = 1
```

Inspect:

- `game/games/racing3d.mjs`
- `game/games/racing3d-config.js`
- any shared `RACING_CONFIG` import
- `game/pages/racing3d.html`
- module-load errors in CI
- configuration initialization

The accepted product requirement remains eight worlds.

Determine why CI sees one world.

The preferred fix order is:

1. prove module/config load behavior;
2. prove `RACING_CONFIG.worlds` length;
3. prove picker DOM generation;
4. only then modify the smoke test if the accepted runtime contract has intentionally changed.

## Acceptance

```text
19/19 tools pass
0 fail
```

Run both:

```text
node tools/run_all.js
node tools/check_release.js --release
```

only after the underlying four tests are green individually.

---

# 11. R2 — Offline Inventory Truth and Cache Generation

**Priority:** P0  
**Dependencies:** R0, R1  
**Suggested task number:** 153

## Goal

Make `game/` the only source from which offline inventory is generated.

## Current issue

The current cache list is missing:

```text
data/app-registry.js
pages/explorer.html
pages/parent.html
docs/OFFLINE_INSTALL.md
```

and current offline manifest contains retired racing entries.

## Implement

The generated inventory must:

1. include every runtime file required by `game/`;
2. exclude retired files because they no longer exist;
3. include Explorer and Parent;
4. include app registry if used by the hub at runtime;
5. include all HTML, JS, CSS, local image, local audio, local fonts, vendor JS, manifests, service-worker files;
6. never include `docs/` or `resources/` unless a runtime page actually loads them;
7. never include missing files;
8. produce identical results every time for identical source trees.

## Add validation

Create a validator that checks:

```text
Every cache entry exists
Every runtime dependency appears in inventory
No cache entry points to retired files
No generated inventory references docs-only files accidentally
Manifest keys match cache list keys exactly
```

Exception: document files deliberately packaged for caregiver use may be classified separately rather than forced into runtime cache inventory.

## Report

Output:

```text
Offline package report
----------------------
Runtime pages: N
JS: N
CSS: N
Images: N
Audio: N
Fonts: N
Vendor: N
Total runtime files: N
Total runtime bytes: N
Largest assets:
1. ...
2. ...
3. ...
```

## Acceptance

```text
generate list
→ validate list
→ build manifest
→ validate manifest
→ build ZIP
→ validate ZIP contents
```

all pass.

---

# 12. R3 — Service Worker and Update Path Correctness

**Priority:** P0  
**Dependencies:** R2  
**Suggested task number:** 154

## Goal

Remove deployment-path assumptions from the service worker.

## Current issue

`sw.js` currently uses a hard-coded cached-manifest lookup path equivalent to:

```text
/game/offline-manifest.json
```

The worker already has an `APP_ROOT` derived from registration scope.

The cached manifest lookup must use that same scope-aware URL instead of a hard-coded deployment path.

## Implement

Use:

```text
const OFFLINE_MANIFEST_URL = new URL('offline-manifest.json', APP_ROOT)
```

for both:

- network fetch;
- cache lookup.

Do not duplicate path strings.

## Add update test

Test at least:

```text
version A cached
server changes manifest
checkForUpdates
changed > 0
```

and:

```text
no change
changed = 0
```

Also verify removed files are reported.

## Deployment variants

The test must work when the application is deployed under a subpath.

Do not hard-code `/game/` or repository names.

## Acceptance

- offline check is scope-relative;
- update detection works under subpath deployment;
- removed files are detected;
- no external network is required for core gameplay.

---

# 13. R4 — CI Topology Refactor

**Priority:** P0  
**Dependencies:** R1, R2, R3  
**Suggested task number:** 155 — **actual task: 164** (155 became the user-reported-bug fix, 156 the resource-budget task)
**Status: DONE 2026-09-30 (task 164).** Implemented as a 5-job workflow: `setup` generates the smoke matrix from `run_all.js --list --json` (so a new smoke can never be silently omitted), `fast` runs the read-only gates + hub smoke, `smoke` runs one leg per smoke with `fail-fast: false`, `release` runs offline-inventory validation plus the offline E2E and a11y report (`continue-on-error` until R6/R10), `extended` runs the Playwright device matrix manually/weekly. **The old `ci.yml` had been failing on every push** (it invoked a smoke deleted in task 156) and its hand-listed matrix had already gone stale. Deviations from the target architecture below, all deliberate and recorded in `PROJECT_TASKS.md` 164: `check_release.js` was left OUT of the release job because it is still mutating (it rewrites `docs/` and re-runs the whole battery) — that is R5's job, and the roadmap's own `check_fast.js` / `validate_generated.js` were replaced by the existing `check_syntax.js` + `validate_pages.js` + `validate_offline.js`, which already do the read-only half.

## Goal

Make CI failures independent and diagnosable.

## Target architecture

### Job A — fast

Run only:

```text
syntax
registry / route validation
metadata validation
hub smoke
offline inventory validation
```

Do not run the full smoke battery here.

### Job B — game-smoke matrix

Run each game smoke independently.

Do not make every game depend on every other game's result.

Recommended:

```text
animals
counting
memory
puzzle
classroom
coloring
tracing
piano
shapes
matching
adventure-related
racing3d
explorer
```

Parent area may get a separate parent smoke instead of being treated as a game.

### Job C — release QA

Depends on fast plus all required smoke jobs.

Runs:

- full offline E2E;
- release validation;
- optional visual regression;
- accessibility gate;
- deployment artifact validation.

### Job D — extended/manual

Runs expensive:

- Chromium/WebKit matrix;
- full screenshot matrix;
- visual comparisons;
- optional installed-PWA smoke.

This can be manual or scheduled if execution time is large.

## Important rule

A single game failure must not prevent all other game smoke results from appearing.

---

# 14. R5 — Make Validation Commands Semantically Clean

**Priority:** P0  
**Dependencies:** R4  
**Suggested task number:** 156

## Goal

Stop having commands with overlapping or misleading meanings.

## Recommended semantics

### `tools/check_syntax.js`

Read-only.

Only checks syntax for JS/MJS and selected structural rules.

### `tools/check_fast.js`

Read-only.

Runs:

- syntax;
- registry;
- metadata;
- hub smoke;
- offline inventory integrity.

### `tools/run_all.js`

Targeted smoke runner.

Supports:

```text
--game
--since
--watch
--concurrency
```

### `tools/check_release.js`

Read-only release gate.

Must not mutate `docs/` or generated assets.

### `tools/sync-docs.sh`

Explicit generation/mirroring command.

### `tools/build_offline.js`

Explicit artifact generation command.

## Important

A release check should fail when generated artifacts are out of date rather than silently rewriting them.

Add a separate command such as:

```text
node tools/validate_generated.js
```

that compares generated files to what a fresh generation would produce.

**Status: DONE 2026-09-30 (task 165).** Every command above now means exactly one thing. New: `tools/check_fast.js` (read-only, 6 stages - syntax, registry/metadata, CI-workflow topology, generated-artifact freshness, offline inventory, hub smoke; it retries a 0-check Chrome boot crash instead of reporting it as a failure), `tools/validate_generated.js` (208-file `docs/`-vs-`game/` inventory + canonical byte compare, plus a 207-entry cache list compared against `generate_sw_list.js --stdout`), `tools/validate_workflow.js` (11 permanent checks over `ci.yml` - tool existence, a direct `needs` entry for every `needs.*.outputs` read, balanced EXPRESSION braces, generated matrix, `fail-fast: false`, extended-job gating; negative-tested). Rewritten: `check_release.js` is a read-only release gate that runs `check_fast` + the battery through `run_all.js` (not a hand-rolled per-smoke loop) and **enforces its own contract** by fingerprinting `docs/`, the cache list and the manifest before and after, failing if it changed anything. **Bugs found and fixed:** (1) `validate_offline.js` re-ran the generator in WRITE mode and then compared the file with itself, so a read-only "validator" rewrote `game/sw-cache-list.json`, silently repaired a stale inventory instead of reporting it, and left a phantom CRLF modification in the worktree on every run - it now uses `--stdout` and compares canonically; (2) `check_release.js` labelled `check_all.js` as "syntax", i.e. the whole 24-tool battery, while also running `sync-docs.sh` and `build_offline.js`; (3) `build_offline.js` unlinked `docs/game-offline.zip` BEFORE creating it, so a failed build destroyed the archive it was meant to replace - it now builds to `.tmp` and renames on success (negative-tested: with `zip` absent the previous archive survives and the error names the `.ps1` fallback). CI `fast` is now a single `check_fast.js` call and `release` no longer re-runs `validate_offline`. Added `.gitattributes` pinning `.github/workflows/*.yml` to `eol=lf`, because `validate_workflow` asserts no CR and `core.autocrlf=true` would otherwise make that gate machine-dependent.

---

# 15. R6 — True Offline Play E2E

**Priority:** P0/P1 boundary  
**Dependencies:** R2, R3, R4, R5  
**Suggested task number:** 157

## Goal

Upgrade `offline_smoke.mjs` from page-load verification to actual child-use verification.

## Test phases

### Phase 1 — Prime online

1. open hub;
2. wait for worker control;
3. trigger offline caching;
4. wait for explicit completion state;
5. verify no skipped runtime assets;
6. verify cache list and manifest consistency;
7. open every child app once.

### Phase 2 — Fresh browser context

Create a truly new browser profile/context.

Block all network requests.

### Phase 3 — Hub

Verify:

- hub UI appears;
- group buttons work;
- child app can be opened.

### Phase 4 — Every child game

For every `offline:true` child registry entry:

```text
load
start
perform primary interaction
verify state changes
navigate back
```

The primary interaction must be defined per registry entry.

Examples:

```text
Animals        → tap card
Counting       → tap animal tile + choose number
Memory         → flip pair / complete a safe pair interaction
Puzzle         → drag piece
Coloring       → select swatch + tap region
Tracing        → draw a stroke
Piano          → tap key
Shapes         → drag shape toward slot
Classroom      → tap tile / answer
Adventure      → movement input
Racing3D       → start picker + steering
Explorer       → move/jump
```

### Phase 5 — Audio

Verify that audio failure does not crash gameplay.

Where practical, check local audio assets exist before the browser run and check game state after an attempted sound trigger.

Do not require a physical speaker in CI.

### Phase 6 — Navigation

Verify:

```text
child → back → hub
```

for every child app.

## Acceptance

Generate a table:

| app | loads offline | starts | primary interaction | state change | back | audio-safe |
|---|---|---|---|---|---|---|

Release fails on any required child gameplay failure.

---

# 16. R7 — Registry Becomes a Full Test Contract

**Priority:** P1  
**Dependencies:** R6, R4  
**Suggested task number:** 158

## Goal

Extend `app-registry.js` so tools know the role and validation requirements of every app.

## Current problem

The registry currently has useful metadata:

```text
id
path
category
title
smoke
screenshot
offline
toddler
```

but tooling still interprets some of these fields inconsistently.

## Add fields only where they directly remove duplication

Recommended:

```text
role: 'child-game' | 'parent'
orientation: 'any' | 'landscape-preferred' | 'portrait-preferred'
interaction: 'tap' | 'drag' | 'draw' | 'movement' | 'hybrid'
requiresAudio: false/true
visualStates: [...]
```

Do not turn the registry into a giant configuration framework.

## Use it to drive

- smoke selection;
- offline tests;
- screenshot selection;
- touch test classification;
- parent exclusion;
- orientation QA;
- release inventory checks.

## Acceptance

No tool maintains a second hand-authored app list unless it is explicitly a special-purpose test fixture.

---

# 17. R8 — Generic Runtime Error Gate

**Priority:** P1  
**Dependencies:** R4, R7  
**Suggested task number:** 159

## Goal

Catch the class of bugs that previous debugging sessions exposed:

```text
shared module collision
silent global overwrite
NaN audio parameter
unhandled page exception
broken module import
```

## Implement a reusable test harness capability

Every browser smoke should capture:

- `pageerror` / runtime exceptions;
- `console.error`;
- unhandled promise rejection where available;
- failed resource loads for required local assets;
- module script failures;
- service-worker registration errors when relevant.

## Important

Do not treat browser-extension errors as site errors.

Do not globally suppress real errors merely because an old environment produced noise.

Use narrow allowlists with comments.

## Shared global-collision defense

The existing footgun where classic-script globals silently overwrite other globals is important enough to test structurally.

Add a static or runtime check for duplicate top-level global names among game/shared scripts where practical.

Do not require a bundler.

Possible approach:

- reserve a `window.PS` namespace for new shared APIs;
- prohibit new generic top-level function declarations in shared/game scripts;
- provide a tooling audit for names such as `showHint`, `reset`, `start`, `play`, `render`, etc.

Do not rewrite all legacy code in one batch.

## Acceptance

A real thrown runtime error during a smoke test fails the smoke unless explicitly allowlisted.

---

# 18. R9 — Make Visual Regression Operational

**Priority:** P1  
**Dependencies:** R4, R7  
**Suggested task number:** 160

## Current problem

`tools/screenshot.js` exists and `tools/visual_compare.js` exists, but the current comparison is byte-level PNG comparison rather than decoded image/pixel comparison, and baseline management is not yet a reliable release practice.

The screenshot script also builds its page set from all registry entries rather than clearly honoring `screenshot:true`, so parent/technical pages can be captured unintentionally.

## Implement

### Screenshot set

Default to:

```text
hub
all registry entries with screenshot:true
```

Exclude parent when `screenshot:false`.

### Device matrix

Capture:

```text
390×844   phone portrait
844×390   phone landscape
820×1180  tablet portrait
1180×820  tablet landscape
1280×800  desktop
```

Use deterministic waits and deterministic game state where possible.

### Baseline metadata

Store a small manifest next to baselines with:

```text
commit SHA
browser
viewport
DPR
capture timestamp or deterministic generation marker
page set
```

Avoid storing timestamps in the image identity itself.

### Pixel comparison

Decode image pixels.

Compare:

- dimensions;
- changed-pixel percentage;
- optional average per-channel delta;
- optional region-based ignore masks only for known volatile areas.

Generate diff artifacts for failures.

Do not use byte-level PNG identity as the primary visual signal.

## Baseline rule

A baseline update must be an explicit human-approved operation.

Never automatically replace baselines from a release job.

## Acceptance

A layout regression produces:

```text
FAIL
page
viewport
changed pixels
visual diff artifact
```

not just a file hash mismatch.

---

# 19. R10 — Accessibility Gate That Measures the Real Product

**Priority:** P1  
**Dependencies:** R7, R8  
**Suggested task number:** 161

## Current state

`tools/axe_check.js` exists and can report serious/critical issues.

The scan currently downloads axe-core from jsDelivr and caches it under `tools/.cache/`.

That is acceptable for a developer tool but not ideal as the only release-gate source because CI availability now depends on an external download unless the cache is reconstructed.

## Improve

Use one of these approaches:

1. vendor a pinned tool-side `axe.min.js` outside `game/`; or
2. install/use a pinned npm tool dependency in a dev-only environment; or
3. make CI explicitly bootstrap the exact known axe-core version and fail clearly when unavailable.

Do not add axe-core to the runtime child app.

## Coverage

Scan:

- hub;
- all child pages;
- parent page as a separate parent surface.

## Rules

At minimum verify:

- icon-only controls have labels;
- visible focus exists;
- interactive semantics are valid;
- color is not the only correctness signal;
- dynamic feedback has appropriate live-region behavior where useful;
- buttons are not nested;
- important images have meaningful `alt` text;
- child UI is not flooded with text merely to satisfy accessibility tooling.

## Acceptance

Serious and critical violations fail the release gate.

Moderate/minor issues are reported and tracked separately.

---

# 20. R11 — Browser / Device Matrix as a Real Quality Gate

**Priority:** P1  
**Dependencies:** R6, R8, R9, R10  
**Suggested task number:** 162

## Current `play_matrix.mjs`

It already defines:

```text
phone portrait
phone landscape
tablet portrait
tablet landscape
desktop
```

and attempts Chromium/WebKit.

## Upgrade the test meaning

The matrix should capture:

```text
load errors
console errors
horizontal overflow
touch availability
orientation behavior
critical-control visibility
```

For child apps with known gestures, also run one targeted interaction.

## CI usage

Do not necessarily run the full Chromium+WebKit matrix on every commit if runtime is excessive.

Recommended:

```text
PR / push       → fast + independent smoke + release checks
nightly/manual  → full Chromium/WebKit device matrix
release         → full matrix or an explicit approved subset
```

## Acceptance

Every target size is covered at least once in automated QA.

No critical button may be off-screen or covered.

---

# 21. R12 — Remove Technical Controls from the Child Hub

**Priority:** P1  
**Dependencies:** R12 can start after R7; no dependency on future learning  
**Suggested task number:** 163

## Current issue

The parent area has been added, but the main child-facing hub still directly shows technical operations including:

```text
Преузми ванмрежно
Проверити ажурирања
ZIP за ручно преузимање
```

This violates the intended child/parent separation.

## Desired child hub

Child hub should contain only:

```text
Петрин свет

УЧЕЊЕ
ИГРЕ

🔒 За родитеље
```

The parent link can remain visually unobtrusive.

## Move to parent area

Parent surface should provide:

- offline download;
- update check;
- manual ZIP link;
- version;
- offline status;
- reset progress;
- audio test;
- optional diagnostics.

## Acceptance

No technical/offline management action is directly exposed on the child launcher except the parent entry.

Hub smoke must be updated to assert this.

---

# 22. R13 — Hub Cleanup After Explorer Migration

**Priority:** P1  
**Dependencies:** R12, existing Explorer migration  
**Suggested task number:** 164

## Current issue

`game/index.html` still contains legacy embedded Kitty/Explorer CSS blocks and dead selectors such as the old `#game-kitty` / `#kitty-container` architecture even though the active route is now `pages/explorer.html`.

## Implement

Remove only code proven to be dead:

- old embedded Explorer markup if still present;
- dead Kitty iframe selectors;
- dead Kitty score/container/control styles;
- dead old navigation assumptions.

Before deletion, search:

```text
index.html references
navigation.js
main.js
runtime selectors
test selectors
docs references
```

## Do not

Do not rewrite the hub visual design in the same task.

The purpose is cleanup and confidence, not redesign.

## Acceptance

- no dead Explorer architecture in hub;
- no broken hub smoke;
- no Explorer behavior changes;
- reduced hub source size/complexity is measurable.

---

# 23. R14 — Finish the Shared Serbian Data Layer

**Priority:** P1  
**Dependencies:** R7, R12  
**Suggested task number:** 165

## Current state

`game/data/serbian.js` exists and contains useful shared data, but recent implementation only integrated it into a small subset of pages.

The current goal is to make it a real source of truth rather than a mostly unused catalog.

## Migration order

Do not perform blind global replacement.

Migrate in small domains:

1. navigation labels;
2. praise/celebration phrases;
3. retry/hint phrases;
4. game titles;
5. animal names;
6. shape names;
7. color names;
8. number words;
9. classroom labels;
10. tracing labels;
11. any remaining stable instructional phrases.

## Important

Game-specific phrases can remain local when they are genuinely unique.

The data layer should contain stable vocabulary, not every sentence in the application.

## Static audit

Add tooling that identifies likely duplicated child-visible Cyrillic strings outside the data layer, then review the report manually.

Do not fail the build on every string duplication; some strings are intentionally local.

## Acceptance

- stable shared vocabulary is centralized;
- no contradictory Serbian labels exist for the same concept;
- smoke tests still pass;
- speech keys match the selected vocabulary.

---

# 24. R15 — Finish Shared Audio Architecture Adoption

**Priority:** P1  
**Dependencies:** R8, R14  
**Suggested task number:** 166

## Current state

`audio-buses.js` provides:

```text
master
speech
music
sfx
priority
ducking
event vocabulary
```

but the project still contains older direct audio patterns and page-specific audio logic.

## Goal

Move from:

```text
the shared bus exists
```

to:

```text
important product audio actually follows the shared policy
```

## Standard event vocabulary

Use small semantic events such as:

```text
tap
correct
gentle-miss
hint
goal
celebration
speech
music
ambience
```

## Migration order

Start with the non-Racing3D games:

1. Counting;
2. Memory;
3. Shapes;
4. Puzzle;
5. Animals;
6. Classroom;
7. Coloring;
8. Piano;
9. Match Game;
10. Adventure family.

Racing3D should remain untouched unless a concrete audio architecture defect is discovered.

## Rule

Do not create an abstraction for every possible sound.

The bus is valuable only if it provides predictable prioritization and ducking.

## Acceptance

For each migrated game:

- all primary SFX route through semantic bus events;
- speech remains independent from decorative sounds;
- music can be ducked when speech is active;
- audio-disabled state never prevents gameplay.

---

# 25. R16 — Asset and Performance Budget

**Priority:** P1/P2  
**Dependencies:** R2, R6, R11  
**Suggested task number:** 167

## Current measured repository scale

Current `game/` tree size is approximately:

```text
game files:    207
game bytes:   ~6.72 MB
asset files:   146
asset bytes:   ~5.88 MB
```

Largest current assets observed include approximately:

```text
driving-car.png              ~729 KB
three.module.min.js          ~687 KB
dino/tiranosaurus-rex.png    ~619 KB
fox.mp3                      ~535 KB
dino/brontosaurus.png        ~425 KB
```

These are not automatically problems.

The task is to measure where optimization is actually worth the complexity.

## Implement report

Produce:

```text
asset type
count
bytes
largest files
per-page asset dependency
```

## Prioritize

### Image optimization

Evaluate:

- PNG compression;
- WebP/AVIF only if local browser support and offline simplicity remain strong;
- sprite sheet optimization for repeated explorer assets;
- avoiding duplicate asset copies.

### Audio optimization

Evaluate:

- trimming unnecessary silence;
- mono conversion where appropriate;
- sample-rate reduction where perceptually invisible;
- removing duplicate clips.

### Three.js

Do not replace it merely to reduce bytes.

Measure actual load cost and whether it is the only large vendor dependency.

## Budgets

Establish measured soft budgets such as:

```text
child page initial dependency budget
offline total budget
largest single asset budget
```

Do not invent thresholds before observing actual deployment/device behavior.

## Acceptance

Build tooling reports the numbers automatically.

A future increase beyond an agreed budget must be visible in CI.

---

# 26. R17 — PWA Install / Update / Version QA

**Priority:** P1  
**Dependencies:** R3, R6, R12  
**Suggested task number:** 168

## Goal

Make the parent-facing offline experience trustworthy beyond “the cache exists”.

## Add explicit version identity

Introduce one small source of truth for application version/build ID.

It may be used by:

- manifest-adjacent metadata;
- parent page;
- service worker cache name;
- offline manifest;
- release report.

Avoid maintaining version strings in many hand-written files.

## Test lifecycle

```text
Version A
   ↓
install/cache
   ↓
Version B deployed
   ↓
check updates
   ↓
changed assets detected
   ↓
user chooses update
   ↓
new version active
```

## Parent UX

Show simple language:

```text
Верзија: x.y
Офлајн копија: спремна
Постоји нова верзија
Ажурирано
```

Technical details may live under a diagnostics disclosure.

## Acceptance

Update logic works under a repository subpath and does not depend on hard-coded `/game/` paths.

---

# 27. R18 — Documentation and Roadmap Consolidation

**Priority:** P1  
**Dependencies:** R1–R17  
**Suggested task number:** 169

## Goal

End the current multi-document drift.

## Recommended documentation model

### `ROADMAP.md` or one selected master roadmap

The active implementation queue.

### `PROJECT_TASKS.md`

Task lifecycle and execution log.

### `ROADMAP_AUDIT.md`

Current mapping of roadmap concepts to implementation state.

### `README.md`

Product-facing and contributor-facing project overview.

### `HANDOVER_PROMPT.md`

Short current-state session handoff only.

Historical logs belong in an archive.

### `resources/General_reviews/`

Research, external reviews, design studies, historical plans.

## Important

The old 18-task `Petrin_svet_Master_Implementation_Plan.md` should be marked as **SUPERSEDED / COMPLETED** rather than silently treated as the current queue.

The old `PETRIN_SVET_MASTER_EXECUTION_ROADMAP.md` should either:

- be updated into the active master roadmap; or
- be explicitly marked as the previous-generation master roadmap and linked to the new active roadmap.

Do not keep two documents both claiming to be the authoritative master plan.

## Acceptance

Every current “next task” reference points to the same active roadmap.

No README/HANDOVER section tells the AI to work on a retired task that is already complete.

---

# 28. R19 — Local Progress, Carefully Constrained

**Priority:** P2  
**Dependencies:** R12, R17  
**Suggested task number:** 170

## Goal

Provide useful continuity without turning the app into a reward/retention system.

## Candidate data

Store locally:

- visited app;
- completed activity count;
- favorite activity if one is useful;
- optional letter/number practice history;
- explorer worlds visited;
- racing wins already implemented where appropriate.

## Parent-only view

Parents may see:

```text
Шта је коришћено
Шта је вежбано
Ресетуј
```

## Never add

- XP bar;
- streak;
- badge collection pressure;
- locked educational basics;
- online profiles;
- cloud sync.

## Acceptance

Core gameplay behaves exactly as before even if storage is unavailable or cleared.

---

# 29. R20 — Portfolio-Level Playtesting Protocol

**Priority:** P2  
**Dependencies:** R6, R9, R11, R12  
**Suggested task number:** 171

## Goal

Move playtesting from isolated game sessions toward portfolio-level product review.

## Test sessions

Maintain a small repeatable manual protocol:

### Session A — first-time toddler flow

Start from hub.

Ask:

```text
Can the child choose something without adult explanation?
Can the child start within a few seconds?
Can the child recover from mistakes?
Can the child find the way back?
```

### Session B — five-game random walk

Open five games from different categories without looking at code.

Check whether they feel like the same product.

### Session C — offline session

Install/cache once, then run without network.

### Session D — parent handoff

Open parent area.

Check whether a parent can understand:

- offline status;
- version;
- updates;
- reset.

## Record

Use a simple issue classification:

```text
BLOCKER
MAJOR
MINOR
COSMETIC
```

Do not overreact to cosmetic differences if they do not affect child comprehension or usability.

---

# 30. Shared UI Cohesion After Release Gates

This phase should start only after R12 and R17 are stable.

## 30.1 Shared shell

Define a small common visual shell:

- background token;
- title treatment;
- back button;
- next/replay buttons;
- feedback text;
- safe-area spacing;
- focus styling.

Avoid building a framework.

## 30.2 Hub and game visual relationship

Games should feel related through:

- palette;
- typography;
- rounded surfaces;
- feedback language;
- illustration/emoji treatment;
- control sizing.

Do not force identical layouts onto different game types.

## 30.3 Child-facing density

Keep screens visually calm.

A higher-quality application is not necessarily one with more UI.

---

# 31. Gameplay Quality Program — Existing Games

The next gameplay phase should use **micro-polish**, not rewrites.

## 31.1 Animals

Keep native emoji.

Focus on:

- consistent animal order / randomness where useful;
- name + sound pairing;
- recognition mode;
- optional very simple classification;
- preventing repeated confusing choices.

Potential future variation:

```text
Где је пас?
```

followed by local speech and a gentle reveal.

---

## 31.2 Counting

Current one-to-one counting is a strong foundation.

Next refinements:

- compare two groups visually;
- more/less/same;
- quantity-to-number and number-to-quantity;
- careful progression from 1–3 to 1–10;
- defer 1–20 until 1–10 quality is excellent.

---

## 31.3 Memory

Keep adaptive board sizes.

Refine:

- first-session simplicity;
- no unnecessary score emphasis;
- sound only at useful moments;
- gentle replay.

Do not turn Memory into a speed game.

---

## 31.4 Puzzle

Next refinement candidates:

- scene variety;
- stronger preview guidance;
- safer drag recovery;
- completion flow consistency.

Avoid shrinking pieces just to increase difficulty.

---

## 31.5 Shapes

Current magnetic placement and hints are good foundations.

Possible next concept:

```text
пронађи исти облик
```

and later:

```text
облик у сцени
```

---

## 31.6 Coloring

Preserve the dual model:

```text
Обоји по слици
Слободно бојење
```

Do not let correctness dominate free creativity.

Future improvement:

- broader palette semantics;
- more scenes only after existing scene quality is validated;
- simple “finish” celebration without score pressure.

---

## 31.7 Tracing

Current developmental approach should remain.

Next refinement candidates:

- better first-stroke cue;
- clearer pre-writing progression;
- perhaps separate “practice” and “letters” conceptually without adding menus;
- ensure weak attempts remain safe and understandable.

Never turn tracing into a handwriting examination.

---

## 31.8 Classroom

Classroom is the reference learning center.

Its role should remain calm rather than game-heavy.

Future improvements:

- stronger cross-linking to child games through visual cues;
- consistent Serbian source data;
- parent-facing explanation of learning categories if useful.

---

## 31.9 Piano

Keep:

```text
Свирај слободно
```

as the primary concept.

Next refinement candidates:

- additional local songs only if licensing/audio quality is excellent;
- very small rhythm imitation activity later;
- no score.

---

## 31.10 Match Game

Maintain toddler-first mode.

Focus next on:

- visual clarity;
- hint reliability;
- gentle board progression;
- avoiding unnecessary effects on wrong moves.

---

# 32. Adventure Family Quality Program

Do not merge the games into one generic experience.

Shared engine:

```text
movement
collision
camera
world loading
recovery
input
audio boundary
```

Game-specific identity:

```text
Explorer   = discover
Driving    = travel
Ocean      = glide
Dino       = jump
Space      = fly
Racing3D   = race
```

This identity distinction is one of the project's strongest product directions.

## 32.1 Explorer

Priorities:

- exploration reward;
- forgiving platforming;
- soft recovery;
- simple character choice;
- avoid precision-platformer pressure.

## 32.2 Driving

Priorities:

- readable direction cue;
- discovery;
- no harsh failure.

## 32.3 Ocean

Priorities:

- fluid movement;
- visual guidance through bubbles/environment;
- unique feel distinct from Driving.

## 32.4 Dino

Priorities:

- forgiving jump timing;
- safe recovery;
- readable obstacles;
- no precision punishment.

## 32.5 Space

Priorities:

- altitude readability;
- planet landmarks;
- visual navigation;
- distinct flight identity.

## 32.6 Racing3D

Only continue user-driven polish after all release infrastructure is green.

Do not start a new large Racing3D feature system while core QA is red.

---

# 33. New Learning Content Roadmap — Revised Decision Logic

The existing `Learning_Content_Roadmap.md` proposes:

1. Бројеви 1–20
2. Боје
3. Време
4. Абецеда
5. Речи
6. Сечења / seasons entry
7. Математика
8. Наука
9. Свет

The file also contains an implementation-order section and shared design principles.

That roadmap should remain a **candidate backlog**, not an immediate build list.

There is also a terminology problem worth correcting when the roadmap is next edited:

```text
Сечења
```

is almost certainly a typo for a seasons concept. Use a clear Serbian term such as:

```text
Годишња доба
```

only after confirming the intended meaning from the existing roadmap context.

The new implementation order should prioritize **skill gaps** over “new app” count.

---

# 34. R21 — More / Less / Same Pilot

**Priority:** P3 after release stabilization  
**Dependencies:** R20, Counting quality  
**Suggested task number:** 172

## Why this comes first

It extends the existing counting concept without requiring a large new system.

## Core interaction

Show two visual groups.

Prompt:

```text
Где има више?
```

Later:

```text
Где има мање?
Да ли је исто?
```

Use objects the child already knows:

- animals;
- fruit;
- stars;
- shapes.

## Age progression

Start:

```text
1 vs 2
2 vs 3
```

Then:

```text
2 vs 4
3 vs 5
```

Do not start with written equations.

## Acceptance

- large visual groups;
- speech available locally;
- no punishment;
- wrong answer gives a visual/audio hint;
- replay is immediate;
- offline.

---

# 35. R22 — Sorting / Classification Pilot

**Priority:** P3  
**Dependencies:** R21 optional, Animals/Shapes/Colors stable  
**Suggested task number:** 173

## Example categories

```text
црвено | плаво
велико | мало
животиња | храна
копно | вода
```

Start with two categories only.

Interaction:

```text
drag object → basket
```

Wrong placement:

```text
soft return
visual hint
```

No failure screen.

## Acceptance

- two large targets;
- magnetic placement;
- no reading required;
- reusable source data;
- one smoke test;
- offline.

---

# 36. R23 — Serbian Phonics Pilot

**Priority:** P3  
**Dependencies:** R13 Serbian data; Classroom; Tracing  
**Suggested task number:** 174

## Goal

Bridge:

```text
sound → letter → familiar object
```

Example:

```text
М
ммм...
миша / миш
```

Prefer audio/visual interaction.

Do not require the child to read a question.

## Acceptance

- local Serbian speech;
- Cyrillic display;
- familiar object visuals;
- no formal reading test;
- no score pressure.

---

# 37. R24 — Sequencing Pilot

**Priority:** P3  
**Dependencies:** R21; simple visual asset set  
**Suggested task number:** 175

## Examples

```text
семе → биљка → цвет
```

or:

```text
опери → осуши
```

Start with two cards.

Later:

```text
2 → 3 → 4 cards
```

Use visual order more than text.

---

# 38. R25 — Rhythm Imitation Pilot

**Priority:** P3  
**Dependencies:** R15 audio; Piano  
**Suggested task number:** 176

## Start simple

Pattern examples:

```text
tap — tap
```

then:

```text
tap — pause — tap
```

Use one or two large drum/tap surfaces.

No timer.

No score.

The child repeats what was heard.

---

# 39. R26 — Spatial Concepts Pilot

**Priority:** P3  
**Dependencies:** R20; Adventure family; Serbian data  
**Suggested task number:** 177

Teach:

```text
горе / доле
унутра / ван
лево / десно
близу / далеко
испред / иза
```

Note that all child-visible language must be Cyrillic.

Use scenes and movement rather than text-heavy instructions.

---

# 40. R27 — Maze / Path Following Pilot

**Priority:** P3  
**Dependencies:** Touch/input quality; visual QA  
**Suggested task number:** 178

## Product shape

A large, forgiving path.

No timer.

No deadly traps.

A wrong path can gently redirect the child.

This should teach:

- visual following;
- path planning;
- fine-motor control.

---

# 41. Future Candidate Review — 1–20, Colors, Time, Words, Seasons, STEM

The original Learning Content Roadmap should be revisited only after the first pilots.

## Numbers 1–20

Do not start simply by adding more number buttons.

Preferred sequence:

```text
1–10 mastery
→ more/less/same
→ 11–20 recognition
→ 11–20 quantity
```

## Colors

Before building a standalone colors game, ask whether current Coloring plus Classroom already covers the concept sufficiently.

If the gap is pronunciation/recognition, make a focused activity rather than a duplicate coloring app.

## Time

This is useful but developmentally more complex.

Start with:

```text
јутро
дан
вече
ноћ
```

before clock faces.

## Words

Use familiar objects and existing Serbian speech assets first.

Avoid a text-building app that assumes strong literacy.

## Seasons

Use:

```text
Годишња доба
```

with visual scenes and weather concepts.

## Math

Start with visual quantities before symbolic equations.

## Science

Animals/habitats and plant growth fit the product better than dense factual content.

## World

Only after the product has strong localization, visual assets, and developmental rationale.

Avoid a quiz-heavy geography app for very young children.

---

# 42. Product Architecture Direction for the Next Stage

Do not introduce a framework.

Keep:

```text
HTML
CSS
Vanilla JS
small shared modules
local assets
service worker
```

## 42.1 Suggested new shared modules only when justified

Possible future additions:

```text
shared/progress.js
shared/runtime-monitor.js
tools/runtime-audit.js
tools/generated-file-check.js
tools/asset-report.js
```

Do not create all of them speculatively.

Create a module when a real repeated need exists.

---

# 43. Safe Shared Namespace Strategy

One of the project's most important historical lessons is the global-name collision problem.

Example class of failure:

```text
game function showHint()
        ↓
shared function showHint()
        ↓
classic script overwrites window.showHint
        ↓
button silently calls wrong function
```

The next architecture should reduce this class of failure.

## New rule

New shared APIs should prefer:

```text
window.PS = window.PS || {};
PS.audio
PS.feedback
PS.navigation
```

or module-local imports where supported.

Do not require a full-module rewrite of the legacy codebase.

## Tooling

Add a static warning for new generic globals:

```text
showHint
reset
start
render
play
init
update
```

Warnings should be reviewable, not blindly fatal at first.

---

# 44. Input Contract

Every interactive child game should answer these questions:

1. What happens on pointerdown?
2. What happens if a second pointer appears?
3. What happens on pointercancel?
4. What happens on lost pointer capture?
5. What happens when the page becomes hidden?
6. What happens on orientation change?
7. What happens if the pointer leaves the target?
8. What happens if the child taps during a transition?

Use `game/shared/input.js` where the interaction pattern fits.

Do not force every game into `pointerDrag()` if a simple tap is clearer.

---

# 45. Audio Contract

Every game should separate:

```text
speech
SFX
music
ambience
```

## Priority

A spoken learning cue should not be drowned by decorative ambience.

A celebratory moment can temporarily duck background music.

A disabled audio state must never block gameplay.

## Local-first requirement

For required child learning vocabulary:

```text
local MP3 → fallback speech synthesis → silence
```

The game must continue in all three cases.

---

# 46. Reduced Motion Contract

The project previously learned that the user's environment has `prefers-reduced-motion: reduce` active.

Do not blindly remove all visual feedback under reduced motion.

Correct principle:

```text
remove unnecessary motion
keep essential state visibility
```

Good:

- no continuous pulse;
- no camera shake;
- no excessive particle motion.

Keep:

- color/state change;
- static glow or outline;
- clear completion indication;
- visible expected-key cue.

---

# 47. Parent Area Contract

Parent area must remain useful without exposing developer jargon by default.

## Show simply

```text
Петрин свет

Офлајн: спремно
Верзија: x.y

Преузми ванмрежно
Провери ажурирања
Тестирај звук
Ресетуј напредак
```

## Optional diagnostics

Under a secondary section:

```text
Service worker
Cache entries
Last update
Asset report
```

Avoid presenting these as requirements for normal use.

---

# 48. Release Gate — Final Target

A future release must satisfy all of the following.

## Structural

- current registry matches disk;
- no retired route is child-accessible;
- no required runtime asset is missing from offline inventory;
- generated files are current;
- docs mirror is current.

## Automated

- syntax green;
- all game smokes green;
- hub green;
- offline E2E green;
- touch interruption green;
- runtime errors zero except approved allowlist;
- serious/critical accessibility zero;
- visual regression green or explicitly approved baseline changes.

## Device matrix

At minimum:

```text
390×844
844×390
820×1180
1180×820
1280×800
```

## Product

- child hub contains no technical controls;
- child can start a game without reading a settings screen;
- mistakes remain safe;
- back navigation works;
- audio failure does not stop play;
- reduced-motion mode remains understandable;
- offline play works after first cache/install step.

## Parent

- update status understandable;
- version visible;
- reset works;
- offline state understandable;
- no account needed.

---

# 49. Generated Artifacts Rule

After modifying `game/`, generated artifacts must be validated or regenerated as appropriate.

Expected relationships:

```text
game/
  ↓
sw-cache-list.json
  ↓
offline-manifest.json
  ↓
docs/game-offline.zip

and

game/
  ↓
docs/
```

However:

```text
release validation ≠ silent regeneration
```

A release gate should detect stale artifacts.

A build command should generate them.

A mirror command should mirror them.

---

# 50. Documentation Update Protocol for Every Task

When the implementation AI completes a task, update the task log with:

```text
Task:
Status:
Date:

Changed files:

Behavior:

Validation commands:

Validation result:

Manual QA:

Offline impact:

Docs updated:

Known follow-up:
```

Do not write only:

```text
DONE
```

For release-critical tasks, include exact counts/results.

---

# 51. Execution Protocol for the Implementation AI

## Step 1 — Read current task state

Read:

```text
PROJECT_TASKS.md
active roadmap
AGENTS.md
CONTRIBUTING.md
```

## Step 2 — Inspect actual files

Never infer a current implementation from an old roadmap description.

## Step 3 — Reproduce the smallest failing test

For a bug:

```text
isolated test
→ inspect runtime
→ classify
→ patch
```

## Step 4 — Make one coherent change

Avoid mixing:

```text
bug fix + design rewrite + refactor + new feature
```

in one task.

## Step 5 — Validate immediately

Run the smallest relevant command.

Then run the broader dependency suite.

## Step 6 — Regenerate deployment artifacts only when needed

If `game/` changes:

```text
sync docs
rebuild offline
```

or use the explicit generation flow from the repository.

## Step 7 — Re-check current state

Verify:

- no stale references;
- no route break;
- no console errors;
- no missing cache entries;
- no unexpected generated-file drift.

## Step 8 — Update roadmap/task status

Do this only after validation.

## Step 9 — Do not auto-commit/push

Follow the existing repository convention: implementation AI prepares changes, user controls commit/push unless explicitly delegated.

---

# 52. Anti-Patterns to Avoid in the Next Stage

Do not:

- mark a task DONE because the code file exists;
- mark CI work DONE while the current branch is red;
- label reproducible test failures as flakes without evidence;
- regenerate baselines automatically;
- hide technical hub controls after adding the parent page but leave duplicates visible;
- add more games while core offline validation is red;
- create a giant shared framework;
- move working files only for aesthetic folder purity;
- replace native animal emoji again without playtest evidence;
- add remote images/fonts/speech to runtime;
- hard-code `/game/` paths into reusable service-worker logic;
- use a test stub that removes the very layer being tested;
- refactor Racing3D broadly while unrelated release gates are red;
- use scores/timers/lives as default toddler motivation;
- turn every game into a quiz;
- make accessibility compliance synonymous with adding lots of text;
- trust screenshots that have not actually been reviewed;
- let one CI job hide the independent results of other game tests.

---

# 53. Priority Queue — Exact Order

This is the recommended implementation queue after the current 18-task plan.

| Order | ID | Priority | Task | Depends on | Outcome |
|---:|---|---|---|---|---|
| 1 | R0 / 151 | P0 | Baseline truth + reproduce current failures | none | factual current baseline |
| 2 | R1 / 152 | P0 | Fix four failing smoke checks | 151 | green smoke battery |
| 3 | R2 / 153 | P0 | Offline inventory reconciliation | 151,152 | exact runtime cache inventory |
| 4 | R3 / 154 | P0 | Service-worker/update path correctness | 153 | deployment-safe offline/update |
| 5 | R4 / 164 | P0 | CI topology refactor — **DONE 2026-09-30** | 152–154 | independent CI signal |
| 6 | R5 / 156 | P0 | Validation command semantics | 155 | trustworthy release command |
| 7 | R6 / 157 | P0/P1 | Behavioral offline E2E | 153–156 | prove actual offline play |
| 8 | R7 / 158 | P1 | Full registry test contract | 157 | remove duplicated app lists |
| 9 | R8 / 159 | P1 | Runtime error gate | 155,158 | catch silent runtime regressions |
| 10 | R9 / 160 | P1 | Visual regression operational | 155,158 | measurable visual quality |
| 11 | R10 / 161 | P1 | Accessibility release gate | 158,159 | real a11y confidence |
| 12 | R11 / 162 | P1 | Browser/device matrix | 157–161 | device confidence |
| 13 | R12 / 163 | P1 | Child/parent shell separation | 158 | cleaner child UX |
| 14 | R13 / 164 | P1 | Hub dead-code cleanup | 163 | smaller/cleaner launcher |
| 15 | R14 / 165 | P1 | Serbian data integration | 158,163 | vocabulary consistency |
| 16 | R15 / 166 | P1 | Audio bus adoption | 159,165 | sound consistency |
| 17 | R16 / 167 | P1/P2 | Asset/performance budget | 153,157,162 | measurable payload/perf |
| 18 | R17 / 168 | P1 | PWA version/update QA | 154,157,163 | trustworthy parent update flow |
| 19 | R18 / 169 | P1 | Docs/roadmap consolidation | 152–168 | one source of truth |
| 20 | R19 / 170 | P2 | Optional local progress | 163,169 | gentle continuity |
| 21 | R20 / 171 | P2 | Portfolio playtesting protocol | 157,160,162,163 | product-level feedback loop |
| 22 | R21 / 172 | P3 | More/Less/Same pilot | 171 | richer math concept |
| 23 | R22 / 173 | P3 | Sorting pilot | 171 | classification |
| 24 | R23 / 174 | P3 | Serbian phonics pilot | 165,171 | early language/phonics |
| 25 | R24 / 175 | P3 | Sequencing pilot | 171 | reasoning |
| 26 | R25 / 176 | P3 | Rhythm pilot | 166,171 | auditory pattern skill |
| 27 | R26 / 177 | P3 | Spatial concepts pilot | 171 | spatial language |
| 28 | R27 / 178 | P3 | Maze/path pilot | 171 | motor/path planning |
| 29 | R27b | P3 | Reassess original 9-game learning roadmap | 172–178 | next content priorities based on evidence |

The numbering is intentionally independent of the previous 135–150 task range so that the historical work remains intact.

---

# 54. Definition of Done — “Петрин свет vNext Foundation”

The vNext foundation milestone is complete only when:

## Reliability

- latest main CI is green;
- all 19 smoke tools pass;
- no known reproducible release failure remains;
- CI jobs report independently.

## Offline

- generated cache inventory matches runtime files;
- no stale retired entries remain;
- Explorer and Parent are included correctly;
- offline manifest matches cache inventory;
- network-blocked tests launch and interact with every child app.

## PWA

- service-worker paths are deployment-scope relative;
- update detection is tested;
- version identity exists;
- parent update UX is understandable.

## Product shell

- child hub is free of technical controls;
- parent area contains those controls;
- Explorer legacy hub code is removed;
- navigation is consistent.

## QA

- runtime errors captured;
- visual regression baseline is operational;
- accessibility gate is operational;
- device matrix is automated.

## Language/audio

- stable Serbian vocabulary is shared;
- core speech remains local-first;
- shared audio policy is actually used in current games.

## Performance

- asset report exists;
- payload budgets are measured;
- large assets are understood and justified.

## Documentation

- one active master roadmap exists;
- `PROJECT_TASKS.md` reflects reality;
- `ROADMAP_AUDIT.md` reflects current implementation;
- README reflects current routes/files;
- HANDOVER is current and concise.

Only after this milestone should the project move into regular new-learning-content expansion.

---

# 55. vNext Product Principle

The next leap is not:

```text
16 games → 25 games
```

The next leap is:

```text
many good games
        ↓
one coherent product
```

The desired experience is:

```text
Parent opens Петрин свет
        ↓
child sees only simple choices
        ↓
child taps something interesting
        ↓
play starts immediately
        ↓
mistakes feel safe
        ↓
speech/sounds reinforce learning
        ↓
back is always obvious
        ↓
offline continues to work
        ↓
parent can understand status without technical knowledge
```

For the engineering team, the corresponding experience is:

```text
change one game
        ↓
affected tests are obvious
        ↓
shared regressions are detected automatically
        ↓
offline inventory updates predictably
        ↓
visual/accessibility regressions are visible
        ↓
CI gives independent, trustworthy results
        ↓
roadmap and code tell the same story
```

That is the quality level the project should target before broadening the game catalog.

---

# 56. Final Instruction to the Implementation AI

Treat this roadmap as executable.

Start at **R0 / Task 151**.

Do not skip ahead to new learning content because the current learning roadmap already contains candidate ideas.

First restore truth:

```text
current HEAD
→ current failures
→ fixed release pipeline
→ complete offline system
→ reliable PWA/update
→ child/parent separation
→ testable visual/a11y quality
→ language/audio cohesion
→ measured performance
→ documentation truth
```

Then, and only then, begin the small learning pilots.

The implementation AI must not ask the product owner to re-decide already closed product principles. It should make the smallest implementation that preserves:

1. toddler usability;
2. Serbian/Cyrillic child experience;
3. offline-first behavior;
4. no ads/accounts/purchases/cloud dependency;
5. touch robustness;
6. calm visual feedback;
7. current vanilla architecture;
8. testability;
9. truthful documentation.

The project is ready for a higher level when the child experience feels simpler while the engineering experience feels more measurable.
