# PETRIN SVET — MASTER PROJECT AUDIT & BUILD-AI IMPLEMENTATION DIRECTIVE

**Document type:** Authoritative audit handoff and implementation instruction  
**Project:** Petrin svet / Games-for-kids  
**Repository:** https://github.com/radmanmilos/Games-for-kids  
**Audit snapshot:** 4 November 2026  
**Audited branch:** `main`  
**Audited HEAD:** `ab0fae68c104024d6a7b1939898e117523fb4375`  
**Application version at audit:** `3.0.1` (`game/manifest.json`)  
**Intended audience:** OpenCode / Codex / Claude / other authorized build AI  
**Primary outcome:** Make Petrin svet a dependable, delightful, privacy-respecting, offline-first learning and play environment that parents can trust and children can explore independently.

---

# PART I — MANDATE

## 1. The product we are building

Petrin svet is not merely a collection of mini-games. It should become a small, safe, cozy digital world where a child can explore, play, discover, create, listen, practise and learn — while a parent can feel that the child's screen time is purposeful, age-appropriate, calm and worthwhile.

The product promise is:

> **If a child is spending time in Petrin svet, that time should be well spent.**

The application must earn that trust through its actual behaviour, not through marketing language.

The child should experience:
- immediate, understandable play;
- warmth, curiosity, discovery and gentle delight;
- freedom to explore without fear of failure;
- activities that develop real skills and understanding;
- simple navigation that does not require reading;
- consistent controls and familiar feedback;
- a visual world that feels coherent, crafted and cared for;
- no manipulative pressure to keep playing.

The parent should be able to trust that:
- the app contains no advertising, tracking, analytics, monetization, in-app purchases or social interaction;
- core functionality works offline after the offline package is prepared;
- child activity is not uploaded to a server;
- no external service is required during play;
- the app does not ask for unnecessary permissions or personal information;
- progress information is modest, local and parent-facing;
- the experience is suitable for the intended age range, subject to the limitations and device context described below.

**Do not optimize for maximum session length, compulsive engagement, streaks, retention loops or reward exploitation.** Optimize for meaningful play, learning, autonomy, emotional safety and a natural stopping point.

## 2. Product principles — non-negotiable

These principles are grounded in the repository's `README.md`, `AGENTS.md`, `project/DECISIONS.md`, `project/PROCESS.md`, per-game guides and the established project history.

1. **Learning through play, never homework.**
2. **Forgiving by design.** Mistakes are invitations to try again, not failures.
3. **No punishment.** Do not introduce lives, fail screens, punitive timers, loss states, leaderboards, currency, XP, streaks or competitive pressure.
4. **Child-first simplicity.** Basic navigation and play must be understandable with little or no reading.
5. **Instant play.** Keep the path from choosing an activity to playing it short.
6. **Serbian Cyrillic is mandatory** for every child-facing text string.
7. **All child-facing speech must be Serbian.** Prefer the existing offline speech/audio assets and shared helpers.
8. **Offline first.** All core activities and required assets must work without internet.
9. **No ads, tracking, analytics, monetization, in-app purchases, chat or user-generated social content.**
10. **Privacy by default.** Keep child data local and minimal. Do not add accounts, remote profiles or data collection.
11. **One cozy shared world, not one generic game template.** Shared shell, navigation, feedback, touch and motion language should feel related while each game keeps its own identity.
12. **Touch-first, device-inclusive.** Android tablets are a primary target; phones and desktop browsers must also be treated as real supported contexts.
13. **Gentle sensory design.** Avoid flashing, startling sounds, excessive motion, clutter and unnecessary stimulation.
14. **Performance on modest hardware.** Smooth, responsive play matters more than visual effects that compromise it.
15. **Respect settled decisions.** Never reopen a locked decision without new evidence and the user's approval.

## 3. What this directive authorizes

This document is an instruction to conduct a comprehensive audit, prepare a verified worklist, and implement approved, evidence-backed improvements in the existing repository.

It is **not** permission to:
- push or commit directly to `main`;
- bypass the project's task/approval lifecycle;
- regenerate, replace or integrate assets without the required approval;
- redesign or rewrite the whole app;
- change locked gameplay/product decisions;
- add new dependencies or online services;
- claim child-safety certification, regulatory compliance or release readiness without evidence.

Follow `AGENTS.md` and `project/PROCESS.md`. They remain binding. If the checkout is dirty or CI is red, report the state and propose the next safe action before beginning implementation. The user must approve work where the repository process requires approval.

---

# PART II — VERIFIED REPOSITORY SNAPSHOT

## 4. Repository state observed

At the audit snapshot:

- Repository: `radmanmilos/Games-for-kids`
- Default branch: `main`
- HEAD: `ab0fae68c104024d6a7b1939898e117523fb4375`
- Latest commit title: `feat(classroom): show night-sky scene for the night time tile`
- Commit date: 2026-11-04 14:27:15 UTC
- Manifest version: `3.0.1`
- The repository is public.
- The branch API reported `protected: false`. The branch-protection endpoint itself was not accessible to the audit connection; do not infer additional settings from that limitation.

The latest commit history included recent work on:
- classroom night-sky artwork;
- classroom night tile integration;
- puzzle painted scene repainting;
- memory card-back artwork;
- art integrity, asset mapping and orphan cleanup.

This shows active development. Do not treat earlier reviews as current truth without checking the actual code.

## 5. Verified repository architecture and strengths

The current repository has a substantial and purposeful architecture.

### 5.1 Runtime application

`game/` is the source of truth for the playable application. It contains:
- `game/index.html`
- `game/pages/`
- `game/games/`
- `game/shared/`
- `game/data/`
- `game/styles/`
- `game/assets/`
- `game/sw.js`
- `game/manifest.json`
- offline inventory files.

The app is static HTML, CSS and vanilla JavaScript. The repository does not require an npm build step for the application.

### 5.2 Published mirror

`docs/` is the GitHub Pages deployment copy of `game/`. It must never be edited manually. The repository documents `tools/sync-docs.sh` as the synchronization command.

**Verified at this snapshot:** the Git tree contained 428 blobs under `game/` and 428 under `docs/`. Every corresponding `game/<path>` and `docs/<path>` pair had the same Git blob SHA; there were no missing counterparts or docs-only files. This verifies mirror equality at the audited commit, not future cleanliness.

### 5.3 Central registry

`game/data/app-registry.js` is the central registry for public app pages, routes, category, title, smoke association, screenshot flag, offline inclusion, toddler designation, hub placement, back wiring and startup function.

This is a strong design decision. Preserve it. Do not create parallel hand-maintained page, route, smoke or screenshot inventories.

### 5.4 Shared runtime systems

The current shared layer includes:
- `game/shared/navigation.js`
- `game/shared/main.js`
- `game/shared/art.js`
- `game/shared/audio.js`
- `game/shared/audio-buses.js`
- `game/shared/speech.js`
- `game/shared/input.js`
- `game/shared/feedback.js`
- `game/shared/celebration.js`
- `game/shared/motion.js`
- `game/shared/viewport.js`
- `game/shared/accessibility.css`

The visual foundation includes:
- `game/styles/design-tokens.css`
- `game/styles/components.css`
- `game/styles/shell.css`
- `game/styles/learning-stage.css`
- `game/styles/viewport.css`
- `game/shared/adventure.css`

Reuse these systems where they fit. Do not replace them with one-off implementations.

### 5.5 Current runtime catalogue

The audited tree and screenshot index show a portfolio of 25 registered activity/page surfaces, plus the hub and parent surface in the screenshot review set.

The registry includes these activity families and pages (verify exact current IDs/order from the registry before editing):

- Animals
- Animal Counting
- Animal Memory
- Animal Scene Puzzle
- Classroom
- Compare
- Sorting
- Phonics
- Sequencing
- Rhythm
- Spatial
- Maze
- Coloring
- Tracing
- Piano
- Shapes
- Candy Match
- Driving
- Ocean
- Dino
- Space
- Little Racer 3D
- Little Explorer
- Fast Cat
- Cat Forest

Do not use this list as a replacement for the live registry. The registry is authoritative.

### 5.6 Tests and validation tooling

The repository has a meaningful test and QA system, including:
- `tools/check_fast.js`
- `tools/check_release.js`
- `tools/run_all.js`
- `tools/check_syntax.js`
- `tools/validate_pages.js`
- `tools/validate_offline.js`
- `tools/validate_generated.js`
- `tools/check_art.js`
- `tools/check_secrets.js`
- `tools/validate_workflow.js`
- `tools/axe_check.js`
- `tools/offline_smoke.mjs`
- `tools/play_matrix.mjs`
- per-game smoke tests;
- runtime error smoke;
- service-worker update smoke;
- touch interruption tests;
- visual baseline comparison;
- short-landscape audit;
- screenshot capture and provenance.

The CI workflow uses a generated affected-smoke matrix and separate fast, smoke, release and extended jobs. Preserve the intent: failures must be visible, a failed gate must not silently publish, and checks must not regenerate the files they inspect.

### 5.7 Documentation and governance

The repository has:
- `AGENTS.md`
- `README.md`
- `CONTRIBUTING.md`
- `ROADMAP.md`
- `project/STATUS.md`
- `project/PROCESS.md`
- `project/DECISIONS.md`
- `project/tasks/ACTIVE.md`
- `project/tasks/INDEX.md`
- `project/games/`
- `project/lessons/`
- `project/reference/`
- `archive/`
- asset-generation documentation and inventories.

This is a valuable knowledge base. Improve its accuracy and discoverability; do not recreate the former oversized, duplicated documentation structure.

---

# PART III — IMMEDIATE RELEASE BLOCKER

## 6. P0 — Latest CI run is red: art-integrity gate

**Status: VERIFIED CI FAILURE. Root cause: NOT YET VERIFIED.**

Latest CI run at the audit snapshot:
- Workflow run: `41847713983`
- Run number: `474`
- Commit: `ab0fae68c104024d6a7b1939898e117523fb4375`
- Result: `failure`
- Failing job: `Fast (syntax, registry, metadata, hub, offline inventory)`
- Job ID: `126635638196`
- Failure stage: `art integrity`
- The other nine fast stages passed in this run.
- The smoke, release and Pages jobs were skipped after the fast job failed.
- The separate CodeQL workflow run succeeded; that does not make the CI workflow green.

### 6.1 What the log actually says

The `tools/check_art.js` stage reported that every listed glyph WebP could not be decoded. The messages had empty decoder detail, for example:

`FAIL game/assets/art/ball.webp: could not decode ()`

The same pattern repeated across the art set. The checker exited non-zero.

The current checker:
- validates WebP magic bytes;
- invokes `ffmpeg` through `spawnSync`;
- converts each WebP to a temporary PNG;
- decodes PNG dimensions and alpha;
- checks transparent corners and registry consumers.

The error formatter prints `ff.stderr`, but does not report `ff.error`, `ff.status`, `ff.signal` or `ff.spawnargs`. Consequently, the log does not establish whether:
- `ffmpeg` is missing from the runner PATH;
- the process could not be spawned;
- the installed ffmpeg lacks the required decoder;
- the WebP files are actually invalid;
- another environment-specific failure occurred.

**Do not assume the assets are corrupt. Do not regenerate or delete all assets.**

### 6.2 Required first action

Before any unrelated implementation:

1. Inspect the exact current `tools/check_art.js`, `tools/lib/imagefile.js`, asset-generation pipeline and CI environment.
2. Reproduce the failing command in an environment equivalent to CI.
3. Capture `spawnSync` diagnostics: `error`, `status`, `signal`, `stderr`, `stdout`, command and version.
4. Check whether `ffmpeg` is installed and whether it can decode a known valid WebP.
5. Test a small representative sample of committed WebP assets independently.
6. Distinguish a tool/environment problem from genuine file corruption.
7. Fix the root cause with the smallest maintainable change.
8. Ensure the checker gives actionable diagnostics when its external decoder is missing.
9. Run the art gate locally and in CI.
10. Confirm the new CI run is green before describing the release gate as healthy.

Possible solution paths must be evidence-driven:
- explicitly provision/pin the required decoder in CI if the tool is a required dependency;
- use a decoder that is already reliably available in the project's supported environments;
- fail early with a precise dependency diagnostic if no decoder is available.

Do not weaken the art gate, silently skip assets, turn hard failures into warnings, or make a check green by checking fewer files.

### 6.3 Release rule

Until the failure is diagnosed and a fresh CI run passes:
- release readiness is **blocked**;
- Pages deployment must remain blocked by the workflow;
- do not mark the current app release-ready;
- do not continue unrelated implementation on a red pipeline without following the approval rule in `AGENTS.md` / `PROCESS.md`.

---

# PART IV — AUDIT FINDINGS AND INVESTIGATION WORKLIST

The following items are divided into **verified current facts**, **risks requiring confirmation**, and **documentation/portfolio work**. The build AI must re-check each item against its current checkout before changing it.

## 7. P1 — Version discovery and service-worker cache identity

**Current code inspected:** `game/shared/navigation.js`, `game/sw.js`, `game/manifest.json`.

`navigation.js` fetches `manifest.json` to obtain the application version and uses that value as the `v` query parameter on the service-worker registration URL.

The fetch currently has no explicit cache policy. The service worker's fetch strategy is cache-first for normal GET requests. If the app manifest is in the active offline cache, the version-discovery fetch can therefore receive a cached manifest rather than the current server manifest.

The worker derives its cache name from the registration query parameter. A stale version can undermine the intended relationship between the deployed manifest version and the cache identity.

This is a **code-path risk supported by source inspection**, not a reproduced end-to-end update failure.

### Required investigation and implementation

- Trace first install, normal online startup, offline startup, app-version change, worker-script change, cache-list change, parent update check and cache-all.
- Establish exactly which URL and cache key each request uses under the GitHub Pages `/Games-for-kids/` subpath.
- Ensure online version discovery cannot silently consume a stale manifest.
- Ensure the cache strategy does not defeat the intended cache policy.
- Preserve offline startup if version discovery is unavailable.
- Ensure a failed update never destroys the last known-good offline application.
- Ensure removed files, changed files and new files are handled correctly.
- Avoid unbounded cache proliferation.
- Preserve the single version source in `game/manifest.json` and the project's non-semver version convention.

### Required tests

- Version A → Version B with A's worker controlling the page.
- New app manifest but unchanged worker script.
- New worker script with unchanged app version.
- Offline startup with no network available for version discovery.
- Failed new-worker installation.
- Failed asset refresh.
- Repeated update checks.
- Removed asset in the new inventory.
- GitHub Pages subpath deployment.
- Confirm old offline copy remains usable until the new one is complete.

Do not simply add `cache: 'no-store'` without proving how the service worker treats that request. Test the whole flow.

## 8. P1 — Service-worker lifecycle and offline recovery

**Current code inspected:** `game/sw.js`.

The current worker contains important safety improvements:
- required install precaching is awaited;
- installation errors are rethrown;
- the failed new cache is deleted;
- `skipWaiting()` occurs only after successful precaching;
- the normal fetch path caches only `net.ok` responses;
- the worker derives its root from registration scope.

These improvements must be preserved. Do not carry forward the old review's install-failure or HTTP-error-cache findings as current defects: the inspected code now contains fixes for those behaviours.

Still perform a complete lifecycle audit:
- atomicity and completeness of install;
- activation timing and old-cache deletion;
- multiple open tabs;
- worker termination during `cacheAll`;
- timeout/retry behaviour;
- update-check behaviour offline;
- cache quota failure;
- storage eviction;
- corrupted cached manifest;
- interrupted download;
- progress reporting and recovery;
- subpath deployments;
- first install versus upgrade messaging.

The worker currently deletes superseded `petrin-*` caches during activation after a new worker has installed. Verify that this remains safe under all supported lifecycle states. Do not change the policy without tests and a clear rollback argument.

### Required acceptance

A parent must never be left with a false "offline ready" state when required files are missing. A failed update must not remove the last usable offline version. The parent must receive an honest, recoverable error state.

## 9. P1 — Full child-safety and privacy audit

This is a product requirement, not a checkbox.

Audit every runtime file under `game/` and all dependencies it loads.

### Prohibited without explicit user approval

- advertising networks;
- analytics or telemetry;
- tracking pixels;
- remote logging;
- accounts or authentication services;
- chat, messaging, public profiles or social sharing;
- user-generated public content;
- in-app purchases or payment flows;
- remote APIs required for play;
- unnecessary camera, microphone, location, contacts or notification permissions;
- external links accessible to a child;
- third-party scripts loaded at runtime;
- remote fonts, images, audio or video required for core play.

### Inspect

- all external URL references;
- all `fetch`, `XMLHttpRequest`, `WebSocket`, `EventSource`, beacon and dynamic script loading;
- all browser permission requests;
- all service-worker caching and origin checks;
- all `localStorage`, `sessionStorage`, IndexedDB and cookies;
- all parent reset behaviour;
- all HTML injection and URL construction paths;
- all imported or vendored libraries;
- all user-controlled values entering DOM, CSS, selectors, URLs or speech;
- all error/reporting paths.

Classify every network-capable path as:
1. required local-origin application operation;
2. development-only tool;
3. optional external behaviour;
4. prohibited/unexpected behaviour.

A runtime network request that is not necessary for the local application must be removed or explicitly justified and approved.

### Data minimization

The current shared progress model in `game/shared/main.js` is described as deliberately tiny and local. Preserve that philosophy.

Audit:
- exact keys and fields stored;
- whether any data can contain personal information;
- schema validation and malformed storage recovery;
- reset coverage across all game-specific save keys;
- whether clearing progress truly clears all app-owned child data;
- whether data can leave the device.

Do not add per-child accounts or identity tracking. A parent-facing local activity summary is sufficient unless the user explicitly approves a new requirement.

### Parent gate limitation

`game/pages/parent.html` describes the multiplication question as a **speed bump for a small child, never a lock**. Preserve this accurate description. Do not claim it is secure authentication or robust parental control. If a feature needs real protection, it must be provided by the device/operating system or a separately approved design.

## 10. P1 — Accessibility and inclusive interaction audit

Existing infrastructure includes `accessibility.css`, semantic page metadata, axe scanning and a release accessibility gate. This is a strong foundation, not proof that every interaction is accessible.

Audit every registry page and every dynamic state for:

- semantic buttons and links;
- keyboard reachability and activation;
- visible focus;
- accessible names and state;
- heading and landmark structure;
- meaningful alt text versus decorative images;
- contrast;
- zoom/text scaling;
- focus management in modals and overlays;
- escape/close behaviour where appropriate;
- touch target size and spacing;
- pointer cancellation and interruption;
- drag alternatives;
- reduced-motion behaviour;
- audio controls and understandable silent operation;
- canvas accessibility alternatives where feasible;
- orientation changes and safe-area insets.

Do not make the product less usable for touch in the name of keyboard-only compliance. Support both.

### Reduced motion

The owner’s device has previously reported `prefers-reduced-motion: reduce`. Treat this as a real, first-class test path.

- Preserve essential gameplay movement.
- Suppress decorative motion when requested.
- Never gate core feedback so completely that the child cannot understand an outcome.
- Keep feedback available through a calm visual or audio alternative.
- Do not reintroduce previously reverted motion behaviour without user approval.

### Required test coverage

- `node tools/axe_check.js --report`
- `node tools/play_matrix.mjs` where the required engines are installed.
- keyboard-only manual pass;
- touch-only manual pass;
- reduced-motion emulation;
- portrait and landscape;
- text scaling/zoom;
- screen-reader spot checks on key flows.

Record actual coverage. A clean axe scan is not proof of complete accessibility.

## 11. P1 — Learning quality, developmental appropriateness and content integrity

The product promise depends on learning value, not merely the presence of educational labels.

For every activity, document and verify:
- intended age/cohort;
- one or more specific learning objectives;
- what the child actually practises;
- whether the interaction measures or reinforces that objective;
- whether instructions are understandable without reading;
- whether speech, image and expected answer agree;
- whether the activity is developmentally appropriate;
- whether difficulty is forgiving and adjustable by design;
- whether the child can explore without a forced quiz;
- whether the activity can be completed without a parent explaining it.

### Serbian language quality

Audit all child-facing text and all speech:
- Serbian Cyrillic spelling;
- grammar and inflection;
- natural child-friendly vocabulary;
- letter-to-word correctness;
- number and noun agreement;
- pronunciation and phoneme quality;
- consistency between visible labels and spoken words;
- absence of accidental English or Latin-script UI strings.

Do not regenerate audio wholesale. The project has prior user listening approvals for specific speech assets. Change only demonstrably incorrect content and follow the existing approval workflow.

### Curriculum scope

`project/reference/LEARNING_ROADMAP_REVIEW.md` is dated 2026-10-05/06 and contains findings that may have been overtaken by later implementation. For example, it describes numbers 11–20 as incomplete, while the current `project/games/classroom.md` says the Classroom numbers activity covers 0–20 and `game/data/serbian.js` contains the extended data.

Re-audit the actual current implementation before treating any roadmap gap as open. Do not rebuild features already present.

Do not add a new game merely to increase the game count. First identify the educational gap and determine whether an existing activity can address it more coherently.

## 12. P1 — Game-by-game code and lifecycle audit

Perform a systematic review of every current registry entry, not just the games recently changed.

For each game inspect:
- HTML structure and metadata;
- script loading order;
- boot function and registry mapping;
- initialization idempotence;
- lifecycle start/stop/pause/resume;
- animation-frame ownership and cancellation;
- event listener cleanup;
- pointer/touch/mouse/keyboard handling;
- viewport resize/orientation changes;
- audio start/stop and overlapping playback;
- speech interruption/cancellation;
- state transitions;
- reset/replay behaviour;
- persistence, if any;
- empty/error/fallback states;
- offline assets;
- performance and memory;
- accessibility;
- Serbian content;
- screenshot states;
- smoke-test assertions.

A game must not keep running hidden animation loops or playing audio after the child leaves it. A game must recover correctly from:
- tab/backgrounding;
- screen lock/unlock;
- orientation change;
- rapid repeated taps;
- pointer cancellation;
- audio context suspension;
- offline reload;
- repeated entry and exit;
- replay after completion.

Do not impose one identical visual/gameplay structure on every game. The common contract is reliable behaviour, navigation and sensory language; game identity remains individual.

### Required output

Create a matrix with one row per registry entry and columns:

`ID | Display name | Category | Age/cohort | Learning goal | Runtime files | Shared systems | Smoke | Screenshot | Offline | Accessibility | Known issues | Manual test status | Documentation status`

Every status must be evidence-based. Use `unknown` where not checked.

## 13. P1 — Shared runtime systems audit

### Navigation

- Verify every `data-go` route maps through the central registry.
- Verify every game can return to the correct parent hub.
- Verify browser back/forward behaviour where expected.
- Verify deep links and hashes.
- Verify no dead or duplicate routes.
- Verify controls remain reachable in short landscape and portrait.

### Audio and speech

- Preserve the shared audio context/bus architecture.
- Ensure audio is user-gesture compliant.
- Prevent uncontrolled overlapping sounds.
- Ensure speech can be cancelled or superseded safely.
- Verify music/effects/speech do not drown each other out.
- Provide a clear sound-off path.
- Ensure silence or unavailable speech does not block gameplay.
- Confirm all runtime audio assets are local and in the offline inventory.

### Input

- Use shared pointer/touch helpers where appropriate.
- Test pointer capture and `pointercancel`.
- Prevent accidental scrolling/zooming only where the game genuinely requires it.
- Ensure drag interactions have forgiving hit areas and a tap/alternative path where possible.
- Ensure fast repeated input cannot duplicate actions or corrupt state.

### Artwork

- Preserve `Art.url/html/fill/fillAttr/image/draw` and registry-based reuse.
- Verify every registry stem has a valid asset.
- Verify each asset has a real consumer.
- Verify image loading failure has a graceful fallback.
- Verify image onload triggers repaint where canvas backgrounds are involved.
- Verify transparent cut-outs, crop, dimensions and file format.
- Keep full-bleed scenes separate from glyph cut-outs.
- Do not turn standard controls into watercolor illustrations; keep control icons consistent and legible.

### Viewport and layout

- Use the shared viewport and safe-area system.
- Avoid fixed assumptions that only work on one tablet.
- Test short landscape 844×390, phone portrait 390×844, tablet landscape 1180×820 and tablet portrait 820×1180.
- Ensure no essential controls or text are clipped or hidden behind system UI.
- Verify both browser and installed-PWA viewport behaviour.

## 14. P2 — Performance and resilience

Target modest Android tablets, phones and desktop browsers.

Audit:
- large asset payloads and unnecessary duplication;
- image dimensions and compression;
- audio payloads;
- 3D library/runtime costs;
- animation loops and frame pacing;
- canvas redraw scope;
- DOM churn and layout thrashing;
- memory growth after repeated navigation;
- long tasks;
- expensive filters, shadows and blur;
- repeated object allocation in animation loops;
- event listener leaks;
- startup cost and offline cache size.

Do not pursue a theoretical 60 FPS by removing meaningful interactions or reducing visual quality without evidence. Measure on representative hardware.

Define practical performance budgets based on measurements:
- initial download size;
- complete offline package size;
- startup time;
- frame-time stability;
- memory after a repeated game-navigation session;
- image/audio decode and load behaviour.

Record the device, browser, test scenario and measured result. Do not invent target measurements.

## 15. P2 — Asset library, visual identity and visual QA

### Current art pipeline

The repository has:
- `resources/General_reviews/Asset_Generation/STYLE_BIBLE.md`
- `ASSET_INVENTORY.md`
- `MANDATORY_ASSET_GENERATION_PREFLIGHT.md`
- `PROGRESS.md`
- per-asset prompts and reference material;
- `project/lessons/asset-generation.md`;
- `tools/asset_generate.js`, `asset_qa.js`, `asset_cutout.js`, `asset_inspect.js`, `check_art.js`;
- `game/data/art-registry.js`;
- `game/shared/art.js`;
- production artwork under `game/assets/art/` and `game/assets/scenes/`.

### Mandatory asset-generation process

Before any image generation:
1. Inspect the current branch and actual current style bible, inventory and progress ledger.
2. Verify the candidate is needed and explicitly eligible.
3. Search the whole relevant repository for duplicates and reusable art.
4. Determine whether code, CSS, SVG or an existing asset is more appropriate.
5. Select subject and style references based on the actual subject, not habit.
6. Write a precise brief and exclusions.
7. Run the documented dry-run.
8. Generate only when authorized.
9. Inspect the actual output.
10. Obtain explicit user approval before production integration.
11. Record exact provenance, QA and status.

**Generated does not mean reviewed. Reviewed does not mean approved. Approved does not mean integrated.**

Follow `resources/General_reviews/Asset_Generation/MANDATORY_ASSET_GENERATION_PREFLIGHT.md` and `project/lessons/asset-generation.md` exactly. Do not bypass this process.

### Visual language

The project style bible describes quietly charming, softly painted children's storybook illustrations: rounded, warm, tactile, gently imperfect and immediately readable. The original reference images are the controlling examples. The bear and star are distinct references, not interchangeable templates.

However, locked product decisions also state that native emoji remain acceptable in defined contexts and that new art should not flatten each game's identity. Reconcile the current user-approved state before replacing anything.

### Visual review battery

`resources/General_reviews/Screenshot_Review/TABLE_OF_CONTENT.md` records 27 surfaces in four viewport formats. It is an important regression-review resource.

At the audit snapshot:
- the TOC was generated 2026-11-04;
- some screenshots were refreshed on 2026-11-04;
- other screenshots were last refreshed 2026-11-01;
- the index includes hub, parent and game pages.

Do not assume that an indexed screenshot has been visually reviewed or approved. Inspect the actual PNGs, compare with the prior approved baseline, and record specific findings.

The short-landscape audit at `resources/General_reviews/SHORT_LANDSCAPE_AUDIT.md` was generated 2026-10-20 and reports 27 surfaces, 12 OK, 15 WARN, 0 FAIL. Its WARNs include header-height budgets, intentionally titleless/stage-led pages and a parent-gate control that needs scrolling. This report is stale relative to the 2026-11-04 visual work and must be regenerated before being treated as current.

### Required visual audit

Review:
- overall visual identity and emotional tone;
- hub hierarchy and category discoverability;
- tile consistency without making every game identical;
- typography and readability;
- art quality at actual display size;
- visual hierarchy inside each game;
- header/back/next controls;
- empty, loading, success, retry and modal states;
- portrait and short-landscape layouts;
- safe areas and clipping;
- visual noise, excessive decoration and motion;
- contrast and focus;
- parent area clarity;
- consistency of audio/visual feedback.

The objective is a coherent, cozy, premium-feeling world — not a generic UI kit.

---

# PART V — DOCUMENTATION AND REPOSITORY HEALTH

## 16. P1 — Make forward-facing documentation truthful and current

The user explicitly wants repository-facing files to represent the real project and its vision. The build AI must audit and update documentation without reviving the former duplicated-documentation problem.

### 16.1 README

Current `README.md` is a timeless overview and correctly points to:
- `AGENTS.md`
- `project/STATUS.md`
- task tracking
- process/decisions
- per-game guides
- tools
- `game/` and `docs/`.

It describes the vision as an offline-first collection for children approximately 2–6 years old, Serbian Cyrillic, no ads/IAP, and learning through play.

Required review:
- ensure the public product description matches what is actually shipped;
- include a concise, complete product promise and privacy/offline explanation;
- ensure game catalogue discoverability without duplicating registry data;
- ensure every link resolves;
- avoid a hand-maintained route list that can drift;
- explain the parent area accurately;
- explain that the multiplication gate is a toddler speed bump, not secure parental authentication;
- retain the `game/` source-of-truth / `docs/` mirror rule;
- retain concise setup and play links.

Do not add a large per-task changelog to README.

### 16.2 ROADMAP

`ROADMAP.md` says it was updated 2026-10-13 and describes no open plan plus candidate next work. Reconcile it with:
- the current 2026-11-04 status;
- completed work archived through task 362;
- current next task number 363;
- any currently valid deferred decisions.

Do not mark historical candidates as open work unless current code and user-approved priorities support that status.

### 16.3 STATUS

`project/STATUS.md` is dated 2026-11-04 and reports:
- tasks 358–362 shipped;
- art integrity with 154 glyph WebPs and 154 registry stems;
- 0 orphans / 0 warnings;
- clean tree and sync;
- a green `check_fast` result.

The last bullet is contradicted by the latest GitHub Actions run for the current HEAD, which failed the art-integrity stage. This may reflect a local-versus-CI environment difference or an update after the status write. The build AI must correct this discrepancy only after diagnosis. Do not copy a stale green claim forward.

### 16.4 Learning roadmap and game guides

`project/reference/LEARNING_ROADMAP_REVIEW.md` is dated 2026-10-05/06 and contains claims that must be checked against current code. The number 11–20 gap is one example that appears to have been overtaken.

The repository currently has game guides for selected games, not every registered page. The README explicitly says the guides are selected. The audit must:
- identify which registry entries lack a guide;
- decide whether each missing guide materially helps maintenance;
- create missing guides only when useful and grounded in actual code;
- update stale guides when behaviour or architecture has changed;
- keep guides concise and avoid copying source code wholesale.

The `project/games/classroom.md` guide says numbers 0–20 and describes its activities. It also has a 2026-11-04 note for tasks 341–352, while subsequent art work occurred in tasks 358–362. Review whether the guide accurately represents the current visual/runtime behaviour.

`project/games/cat-forest.md` describes specific product constraints and a wordless UI. Verify it against current code and locked decisions; do not accidentally break its intentional exception rules.

### 16.5 Process and decisions

Preserve:
- one task entry per task in `project/tasks/ACTIVE.md`;
- archive completed tasks using `node tools/archive_tasks.js`;
- overwrite `project/STATUS.md` at session end;
- update per-game docs when behaviour changes;
- add to `DECISIONS.md` only when the user confirms a decision;
- keep `README.md` and `CONTRIBUTING.md` timeless;
- respect size budgets enforced by `tools/check_docs.js`.

Do not rewrite `AGENTS.md`, `PROCESS.md` or `DECISIONS.md` merely for stylistic reasons. Update only where evidence shows a real contradiction or missing rule, and respect the approval process.

## 17. P2 — Branch and release governance

The branch object at audit time reported `protected: false`. The branch-protection detail endpoint was unavailable to the audit connection, so no further policy is asserted.

The workflow is designed to gate Pages deployment on successful checks, which is good. Consider whether `main` should require:
- pull requests;
- successful CI checks;
- no force pushes;
- no deletion;
- review/approval before merge.

This is a repository-owner decision. Do not alter branch settings or workflows without explicit approval. Never push to `main` automatically.

---

# PART VI — IMPLEMENTATION PLAN

## 18. Execution protocol

The build AI must not attempt a giant rewrite. Work in small, verifiable task units.

Before each task:
1. Read `AGENTS.md`, `project/PROCESS.md`, relevant `project/DECISIONS.md` entries and the affected game/system guide.
2. Check current branch, HEAD, working tree and latest CI.
3. If dirty or red, report the evidence and follow the user-approval rule before proceeding.
4. Verify the finding in the current source.
5. Identify the smallest root-cause fix.
6. Add/update the regression test before or alongside the fix.
7. Implement only the approved scope.
8. Run the smallest relevant checks, then escalate according to the validation ladder.
9. Refresh screenshots if a child/parent-visible screen changes.
10. If `game/` changes, rebuild offline inventories as documented, sync `docs/`, and validate generated artifacts.
11. Update the task, relevant guide and status.
12. Report exact evidence and remaining uncertainty.

### Validation ladder

Use the repository's current documented commands. At this audit snapshot:

- `node tools/check_fast.js` — read-only fast gate.
- `node tools/run_all.js --game <name>` — targeted game smoke.
- `node tools/run_all.js --since HEAD` — diff-driven smoke selection where appropriate.
- `node tools/check_release.js` — fast gate + full smoke battery.
- `node tools/check_release.js --release` — deeper offline and accessibility gates.
- `node tools/offline_smoke.mjs` through `run_all.js` where required by CI/release guidance.
- `node tools/axe_check.js --report`
- `node tools/play_matrix.mjs`
- `node tools/short_landscape_audit.js`
- `node tools/visual_compare.js`
- `node tools/check_docs.js`
- `node tools/validate_pages.js`
- `node tools/validate_offline.js`
- `node tools/check_art.js`

Do not blindly run stale test commands. Read each test's assertions and verify they still match current behaviour before executing it. A smoke that ran zero assertions is not a pass.

## 19. Priority sequence

### Phase 0 — Establish truth and unblock CI

**P0.1 Diagnose art-integrity CI failure.**
- Inspect `check_art.js` and `ffmpeg` invocation.
- Determine if CI lacks the decoder or if files are invalid.
- Improve diagnostics.
- Fix the real cause.
- Verify all assets and re-run CI.

**Exit condition:** current HEAD has a green fast gate and successful CI run. No false green, no skipped asset checks.

### Phase 1 — Complete technical audit

**P1.1 Build a verified repository inventory.**
- enumerate every registry entry;
- map every runtime file and asset;
- map every smoke and screenshot;
- identify unregistered/orphan pages and assets;
- identify runtime dependencies missing from offline inventory;
- map all game docs and decisions;
- inspect third-party/vendor code.

**P1.2 Complete service-worker/version audit.**
- trace version discovery and cache identity;
- test install/update/failure/offline recovery;
- add regression tests for confirmed gaps.

**P1.3 Complete child-safety/privacy/security audit.**
- inspect network paths, permissions, storage, HTML injection, URLs and third-party dependencies;
- confirm parent reset semantics;
- remove any unapproved tracking/network surface.

**P1.4 Complete accessibility audit.**
- all registered pages;
- keyboard, touch, reduced motion, focus, contrast, zoom, screen-reader essentials;
- automated plus manual evidence.

**P1.5 Complete game-by-game audit.**
- lifecycle, state, controls, audio, persistence, errors, offline, performance and learning correctness;
- produce the game matrix.

**P1.6 Complete visual audit.**
- inspect the current screenshot PNGs;
- regenerate stale audit outputs;
- adjudicate all warnings;
- produce specific page-by-page findings.

**Exit condition:** every registry entry and shared system has a verified status; unknowns are explicit; findings are prioritized and approved.

### Phase 2 — Fix foundational reliability

Address confirmed issues in:
1. version discovery/cache identity;
2. service-worker update and rollback safety;
3. offline inventory and download-state truthfulness;
4. runtime error handling and recovery;
5. game lifecycle cleanup;
6. input interruption and audio lifecycle;
7. data validation and parent reset.

Do not change a subsystem that passes a verified contract merely to make it look cleaner.

### Phase 3 — Make the portfolio genuinely excellent

For every game:
- improve clarity of the first interaction;
- ensure the child knows what to do through visual/audio cues;
- ensure mistakes are safe and understandable;
- ensure success feedback is warm but not overwhelming;
- ensure replay and exit are obvious;
- ensure educational content is correct;
- ensure the activity has a natural stopping point;
- ensure controls work on the smallest supported target viewport;
- preserve its own personality inside the shared world.

Prioritize BLOCKER and MAJOR issues over cosmetic consistency.

### Phase 4 — Visual and sensory refinement

- resolve meaningful screenshot findings;
- maintain a cozy, consistent visual language;
- remove accidental clutter and hierarchy conflicts;
- improve readability and touch affordances;
- preserve individual game identities;
- respect reduced motion;
- balance speech, music and sound effects;
- keep art recognisable at real UI size;
- do not generate or integrate unapproved assets.

### Phase 5 — Documentation and release readiness

- reconcile README, ROADMAP, STATUS, game guides and learning roadmap;
- verify all links and instructions;
- regenerate screenshot/short-landscape reports;
- verify docs mirror and offline inventories;
- run the full release gate;
- run the portfolio playtesting protocol on real devices where possible;
- publish only after the user-authorized release process.

---

# PART VII — EXPERIENCE QUALITY STANDARD

## 20. Child experience — acceptance standard

A child should be able to:
- understand where to go;
- start an activity quickly;
- discover what to do without reading paragraphs;
- tap/drag/trace/play with forgiving interaction;
- recover from an accidental action;
- retry without shame or pressure;
- hear clear, appropriately paced feedback;
- return to the hub reliably;
- stop playing without losing essential progress or being pressured to continue.

Do not add a forced tutorial if the activity can be made self-explanatory. Do not add more UI just to explain confusing UI; fix the interaction first.

## 21. Parent experience — acceptance standard

A parent should be able to understand:
- what the app is;
- what it does not do;
- how offline use works;
- whether the offline copy is ready;
- what version is installed;
- whether an update is available;
- what local progress is recorded;
- how to clear local progress;
- what the parent gate does and does not protect.

Do not expose developer diagnostics as the main parent experience. Keep technical details behind an optional disclosure and use plain Serbian.

## 22. Sensory and emotional safety

- No flashing/strobing.
- No sudden loud audio.
- No frightening or aggressive imagery.
- No shame language.
- No punitive timers or countdown pressure in learning games.
- No manipulative reward loops.
- No endless autoplay by default.
- No unnecessary vibration/haptics.
- No rapid full-screen movement that can cause discomfort.
- Provide calm feedback and accessible alternatives.
- Respect reduced-motion settings.
- Keep sound volume balanced and controllable.

These are product quality requirements; automated tests alone cannot establish that the experience feels calm or appropriate.

## 23. Visual consistency without homogenization

Shared:
- shell/navigation conventions;
- back/next control family;
- typography system;
- spacing and safe-area behaviour;
- touch affordances;
- focus treatment;
- feedback timing/volume principles;
- motion restraint;
- palette relationships and illustration quality.

Individual:
- game boards;
- world environments;
- character identity;
- game-specific mechanics;
- meaningful colour identity;
- distinctive visual metaphors;
- appropriate game-specific HUDs.

Do not flatten every screen into identical cards, buttons or layouts. Consistency is the feeling that the same thoughtful product made the games — not that every game is the same game.

---

# PART VIII — DEFINITION OF DONE

## 24. Technical definition of done

A task is not complete because code was written.

A meaningful implementation is complete only when:
- the current defect was verified before editing;
- the root cause was addressed;
- regression coverage exists;
- relevant tests were actually run;
- the app works online and offline as applicable;
- generated artifacts are fresh;
- `docs/` mirrors `game/` when runtime files change;
- screenshot review is refreshed for visible changes;
- no unrelated user changes were lost;
- no secrets or credentials were added;
- documentation reflects actual behaviour;
- remaining risks are disclosed.

## 25. Product definition of done

A user-facing change is complete only when:
- the child can understand and use it;
- it is developmentally and linguistically appropriate;
- it is forgiving and non-punitive;
- it works with touch and relevant accessibility modes;
- it respects privacy and offline requirements;
- it is visually and emotionally appropriate;
- it does not make the wider product less coherent;
- it has been manually playtested when automated checks cannot establish quality.

## 26. Release definition of done

A release is not ready until:
- latest CI is green;
- all relevant smoke tests pass;
- offline E2E passes;
- accessibility release gate passes;
- generated artifacts are current;
- screenshots and short-landscape report are current;
- manual portfolio playtesting is completed or explicitly waived by the owner;
- parent offline/update/reset flows are verified;
- no BLOCKER or MAJOR issue remains;
- version and documentation are correct;
- the user authorizes the release/push.

Never claim certification or absolute safety. State the scope of checks and known limitations.

---

# PART IX — REQUIRED BUILD-AI REPORTING

## 27. Initial audit report — before implementation

The build AI must first return:

### Repository state
- branch;
- HEAD;
- working-tree status;
- latest CI run and exact conclusion;
- current application version.

### Audit coverage
- files/directories inspected;
- registry entries inspected;
- tests inspected;
- tests run;
- screenshots actually viewed;
- devices/browsers actually tested.

### Findings
For every issue:
- priority: P0 / P1 / P2 / P3;
- status: verified / suspected / not present / already fixed / needs playtest;
- exact file and function/selector;
- child/parent impact;
- evidence;
- proposed fix;
- regression risk;
- verification plan.

### Work proposed
- dependency order;
- estimated scope;
- files likely to change;
- tests to add/update;
- documentation to update;
- approval required.

Do not start broad implementation while the latest CI is red. First diagnose the known P0 failure and present the evidence-backed recovery proposal, following `AGENTS.md`.

## 28. Final report after each approved implementation batch

Use these headings:

1. **Summary**
2. **Verified findings**
3. **Changes made**
4. **Files changed**
5. **Tests actually run**
6. **Manual playtesting actually performed**
7. **Screenshots refreshed and inspected**
8. **Offline/docs/generated-artifact verification**
9. **Repository state**
10. **Remaining risks and unknowns**
11. **Approval / commit / push / CI status**

Use exact test commands and real results. Distinguish local tests, CI tests, browser tests and physical-device tests.

Never say:
- “all games tested” if only a subset ran;
- “safe” as an absolute guarantee;
- “CI green” based on a local run;
- “committed” without a commit SHA;
- “published” without deployment evidence;
- “approved” without explicit user approval.

---

# PART X — AUDIT CHECKLIST FOR THE BUILD AI

## 29. Repository inventory

- [ ] Confirm branch, HEAD, dirty state and CI before work.
- [ ] Enumerate all 25 current registry entries from the live registry.
- [ ] Map each page to its engine, data, shared dependencies and assets.
- [ ] Map each registry entry to a real smoke test or documented reason for no smoke.
- [ ] Map each screenshot flag to current screenshot baseline policy.
- [ ] Find unregistered HTML pages.
- [ ] Find unreferenced/orphan runtime files and assets.
- [ ] Verify all runtime dependencies are in offline inventory.
- [ ] Verify no `game/` runtime dependency points into `resources/` or `tools/`.
- [ ] Verify docs mirror equality.
- [ ] Review third-party libraries and licenses.
- [ ] Produce a verified inventory matrix.

## 30. Reliability

- [ ] Diagnose and fix the current art-integrity CI failure.
- [ ] Test service-worker install failure.
- [ ] Test version A → B update.
- [ ] Test offline launch and offline navigation.
- [ ] Test failed cache download and retry.
- [ ] Test storage quota/eviction behaviour where feasible.
- [ ] Test worker lifecycle with multiple tabs.
- [ ] Test no stale cache poisoning.
- [ ] Test parent progress and reset.
- [ ] Test malformed local storage.
- [ ] Test repeated game entry/exit and animation cleanup.
- [ ] Test orientation/background/resume interruptions.

## 31. Safety and privacy

- [ ] No ads, analytics, telemetry or tracking.
- [ ] No unapproved external runtime requests.
- [ ] No unnecessary permissions.
- [ ] No accounts or remote child profiles.
- [ ] Child data remains local.
- [ ] Parent reset clears all app-owned progress.
- [ ] No unsafe HTML/URL injection paths.
- [ ] No child-accessible external navigation.
- [ ] Parent gate is described honestly as a toddler speed bump.
- [ ] Third-party dependencies are identified and justified.

## 32. Accessibility and usability

- [ ] All controls have accessible names.
- [ ] Keyboard access and visible focus.
- [ ] Touch target and hit-test validation.
- [ ] Drag alternatives or forgiving interaction.
- [ ] Reduced-motion path.
- [ ] Contrast and text scaling.
- [ ] Modal focus and dismissal.
- [ ] Screen-reader spot checks.
- [ ] Portrait/landscape and safe-area.
- [ ] No clipped or unreachable essential control.

## 33. Learning and content

- [ ] Learning goal documented per activity.
- [ ] Content accuracy verified.
- [ ] Serbian Cyrillic verified.
- [ ] Serbian speech verified.
- [ ] Grammar and inflection checked.
- [ ] Letter-to-word mapping checked.
- [ ] Counting and number agreement checked.
- [ ] Age/cohort designation justified.
- [ ] No duplicate activity added without a demonstrated gap.
- [ ] No punitive or manipulative learning mechanic.

## 34. Visual and sensory quality

- [ ] Inspect current screenshot PNGs, not just their filenames.
- [ ] Refresh stale visual audit reports.
- [ ] Review all registry surfaces.
- [ ] Review phone portrait and landscape.
- [ ] Review tablet portrait and landscape.
- [ ] Review short landscape 844×390.
- [ ] Review hub and parent surfaces.
- [ ] Review empty/loading/play/success/retry/modal states.
- [ ] Review art at real UI size.
- [ ] Check visual hierarchy and clutter.
- [ ] Check focus/contrast.
- [ ] Check motion and sound restraint.
- [ ] Preserve game-specific identity.
- [ ] No asset generation/integration without preflight and approval.

## 35. Documentation

- [ ] README accurately represents the product.
- [ ] ROADMAP matches current status and decisions.
- [ ] STATUS agrees with current CI and repository evidence.
- [ ] Learning roadmap claims are checked against current code.
- [ ] Per-game guides match current implementation.
- [ ] Missing useful game guides are identified.
- [ ] All links resolve.
- [ ] Docs size budgets pass.
- [ ] No duplicated route/game inventory is introduced.
- [ ] Locked decisions remain intact.
- [ ] Screenshot TOC and provenance are current.
- [ ] Short-landscape audit is regenerated.

---

# FINAL DIRECTIVE

Build Petrin svet as if a parent is handing a device to a child they love and trust.

Every interaction should be understandable. Every sound should be considered. Every image should belong. Every activity should have a reason to exist. Every saved byte of child data should have a clear purpose. Every offline update should protect the working copy. Every claim in the repository should be true.

Do not chase feature count. Do not chase screen time. Do not chase visual effects for their own sake.

**Build a safe, warm, thoughtful place where children can explore, play and learn — and where parents can feel confident that the time spent there matters.**

**Excellence is not a claim. It is the result of verified behaviour, careful design, honest testing, and respect for the child.**
