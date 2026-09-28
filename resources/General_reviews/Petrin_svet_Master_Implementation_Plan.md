# Петрин свет — Master Implementation Plan
## Current-state audit + prioritized execution plan for the implementation AI

**Repository:** `radmanmilos/Games-for-kids`  
**Branch reviewed:** `main`  
**Current HEAD reviewed:** `e9d8fa170118bec1f46adba8e5b64e41c61e0133`  
**Review date:** 2026-09-28

---

## 0. Mission

Continue turning **Петрин свет** into one coherent, child-friendly, offline-capable Serbian children's application rather than a loose collection of web games.

The project must remain:

- free forever
- no ads
- no IAP
- no accounts
- no cloud dependency
- offline-capable
- Serbian spoken
- Serbian Cyrillic written
- toddler-friendly
- forgiving rather than punishing
- playable in desktop browsers
- optimized for phones/tablets, especially landscape tablets
- simple enough that a child can start playing immediately

Do not add a large number of new games until the current application is release-hardened.

---

# 1. CURRENT STATE — IMPORTANT

The repository has progressed significantly beyond the older `ROADMAP_AUDIT.md`.

The following work is already implemented in the current history:

- shared design tokens
- shared navigation patterns
- shared feedback
- global reduced-motion handling
- shared pointer/touch helpers
- viewport helpers
- shared audio-bus architecture
- shared Serbian data layer
- toddler counting flow
- developmental tracing
- age-aware memory
- magnetic puzzle placement
- animal recognition mode
- free/reference coloring modes
- classroom categories
- piano free-play-first flow
- toddler-first matching
- magnetic shape matching
- Explorer/adventure soft-reset work
- Driving goal guidance
- Ocean goal guidance
- Dino forgiving jump timing
- Space spatial landmarks
- shared adventure engine boundary
- local animal illustration attempt
- legacy cleanup attempt
- play-aware smoke tests
- touch interruption tests
- screenshot capture infrastructure

**Do not re-implement these as if they are missing. Inspect the current code before changing anything.**

The old audit is stale and must not be treated as authoritative.

---

# 2. NON-NEGOTIABLE IMPLEMENTATION RULES

## Child experience

The child should never need to understand:

- service workers
- caches
- manifests
- updates
- browser permissions
- technical diagnostics
- versions
- files
- downloads
- error codes

Those belong in a parent/developer area.

## Interaction

Prefer:

- large touch targets
- forgiving hit detection
- magnetic placement
- soft corrections
- visual guidance
- immediate feedback
- short sessions
- cause/effect
- exploration

Avoid:

- lives
- hearts
- energy
- timers that punish
- leaderboards
- rankings
- competitive scoring
- long forms
- forced reading
- hard game-over states
- repeated failure loops

## Offline

No runtime dependency on:

- CDN assets
- remote APIs
- network fonts
- external image hosts
- cloud saves
- remote game state

Everything required for core play must be local.

## Serbian

Use Serbian Cyrillic for visible text.

Use Serbian audio/speech for spoken feedback wherever an asset exists.

Do not create multiple competing copies of the same vocabulary.

## Architecture

Prefer shared systems over per-game reimplementation.

However, do **not** force unrelated games into the same visual or mechanical identity merely for code reuse.

---

# 3. PRIORITY ORDER

Execute in this order unless a task discovers a blocker that makes a dependency impossible.

| Order | Task | Priority | Dependencies |
|---|---|---|---|
| 1 | Animal Art Recovery | P0 | none |
| 2 | Public App Registry + Route Integrity | P0 | 1 |
| 3 | Explorer Migration / Broken Route Fix | P0 | 2 |
| 4 | PWA Metadata Consistency | P0 | 2 |
| 5 | True Offline Browser Test | P0 | 2, 3, 4 |
| 6 | Shared Safe-Area / Viewport Fix | P1 | 2 |
| 7 | Serbian Data Layer Integration | P1 | 2 |
| 8 | Shared Audio-Bus Adoption | P1 | 2, 7 |
| 9 | Release Validation Orchestrator | P1 | 2, 4, 5, 6, 7, 8 |
| 10 | Real Visual Regression | P1 | 2, 9 |
| 11 | System-Wide Touch Interruption Tests | P1 | 2, 9 |
| 12 | Full Screenshot Coverage | P1 | 2, 10 |
| 13 | Legacy Code + Cache Cleanup | P1 | 3, 5, 9 |
| 14 | Documentation Regeneration | P1 | 2–13 |
| 15 | Parent Area | P2 | 4, 5, 9 |
| 16 | Accessibility Product Pass | P2 | 2, 9 |
| 17 | CI / GitHub Actions | P2 | 9, 10, 11 |
| 18 | New Learning Content Roadmap | P3 | 1–17 stable |

---

# 4. TASK 1 — ANIMAL ART RECOVERY

## Priority

**P0 — do this first.**

## Problem

The current custom SVG animal illustrations introduced by `ART-001` do not look good in actual playtesting.

The implementation in:

```text
game/shared/illustrations.js
```

is visually too crude for the intended child-facing experience.

This is more important than architectural purity. The child-facing visual result wins.

## Decision

### Immediate safe baseline

Restore the previous native Unicode emoji presentation for animal artwork.

Do this first so there is no period where the application is left with the poor custom animal art.

### Preferred optional upgrade

Prototype a **local, pinned Twemoji animal asset pack** as the next visual experiment.

Twemoji is a strong candidate because its graphics are consistently styled, downloadable, and officially licensed under **CC BY 4.0**. The official project provides SVG assets and downloadable versioned releases.

Official source:

- https://github.com/jdecked/twemoji
- https://creativecommons.org/licenses/by/4.0/

The official repository currently publishes versioned assets in its releases. Use a pinned version; do not depend on `latest` at runtime.

## Scope

Start with the 12 animals already used by the project:

```text
cat
dog
cow
lion
elephant
frog
pig
duck
fox
sheep
horse
chicken
```

Suggested Twemoji code points:

```text
cat       1f431
dog       1f436
cow       1f42e
lion      1f981
elephant  1f418
frog      1f438
pig       1f437
duck      1f986
fox       1f98a
sheep     1f411
horse     1f434
chicken   1f414
```

## Implementation strategy

Create a single animal-art adapter rather than scattering asset decisions across games.

Suggested:

```text
game/shared/animal-art.js
```

API concept:

```js
AnimalArt.get(name)
AnimalArt.img(name, alt)
AnimalArt.emoji(name)
AnimalArt.mode()
```

Supported modes:

```text
emoji
twemoji
```

Default mode at the start of Task 1:

```text
emoji
```

Then build the local Twemoji pilot:

```text
game/assets/images/animals/twemoji/
```

Use only local files.

Do not load Twemoji from a CDN in production.

Do not make the core application depend on the internet.

## Visual acceptance test

Check the animal visuals at:

```text
390x844   phone portrait
844x390   phone landscape
820x1180  tablet portrait
1180x820  tablet landscape
1280x800  desktop
```

Check at least:

- Animals
- Animal Counting
- Memory
- Puzzle where applicable

The new local art must be:

- immediately recognizable
- friendly
- large enough
- crisp
- consistent
- visually better than the current custom SVGs

## Decision rule

After the pilot:

### If Twemoji is clearly better than the current SVGs

Adopt local Twemoji for animal artwork.

### If Twemoji does not look better in actual play

Keep native emoji.

Do **not** keep poor custom SVGs merely because they are “more controlled”.

## Licensing

If Twemoji is adopted, include an attribution entry in a parent/about/documentation location.

Twemoji's official README states that graphics are CC BY 4.0 and accepts attribution in a project README/About section or HTML/JS source.

Do not use arbitrary image aggregators as the production source when an official open asset source is available.

## Acceptance criteria

- current ugly custom animal SVGs are no longer the default
- all animal games use the same `AnimalArt` interface
- no runtime CDN dependency
- offline behavior is preserved
- no game-specific code directly decides between emoji and Twemoji
- animal labels remain Serbian Cyrillic
- smoke tests still pass
- screenshot review completed on phone/tablet/desktop

---

# 5. TASK 2 — PUBLIC APP REGISTRY + ROUTE INTEGRITY

## Priority

**P0**

## Problem

The repository currently duplicates knowledge of public pages/routes in multiple places:

- navigation
- standalone boot
- smoke runner
- screenshot tool
- accessibility tool
- offline inventory
- README
- roadmap documentation

This has already caused stale references to deleted `racing.html` and the retired Kitty implementation.

## Goal

Create one authoritative public app registry.

Suggested:

```text
game/data/app-registry.js
```

Each public app should contain at least:

```js
{
  id,
  path,
  category,
  title,
  smoke,
  screenshot,
  offline,
  toddler
}
```

Example:

```js
{
  id: "animals",
  path: "pages/animals.html",
  category: "learning",
  title: "Животиње",
  smoke: "animals_smoke",
  screenshot: true,
  offline: true,
  toddler: true
}
```

## Categories

Use simple product categories:

```text
learning
create
games
```

Do not overengineer.

## Registry should become authoritative for

- `run_all.js`
- `play_matrix.mjs`
- `axe_check.js`
- `screenshot.js`
- offline validation
- route validation
- documentation generation where practical

## Acceptance criteria

No test tool contains a manually maintained stale page list when it can read the registry.

Deleted routes do not appear in:

- test defaults
- screenshots
- accessibility defaults
- offline registry
- navigation registry

---

# 6. TASK 3 — EXPLORER MIGRATION / BROKEN ROUTE FIX

## Priority

**P0**

## Current defect

The current hub still loads:

```html
<script src="games/kitty.js"></script>
```

but `game/games/kitty.js` was deleted.

The current hub still contains the old:

```text
#game-kitty
#kitty-container
#kitty-embedded
```

architecture.

The surviving implementation:

```text
game/games/kitty-standalone.js
```

is not currently wired to a live standalone public route.

This must be corrected.

## Preferred architecture

Create:

```text
game/pages/explorer.html
```

and make it the canonical Explorer game route.

Then:

```text
hub → game-explorer → pages/explorer.html
```

## Remove obsolete embedded architecture

After migration, remove old integrated Explorer markup and boot assumptions:

```text
#game-kitty
#kitty-embedded
#kitty-canvas
#kitty-controls
old startKitty/stopKitty assumptions
```

Do not restore deleted `kitty.js`.

## Update

- app registry
- navigation
- smoke runner
- screenshot tool
- accessibility tool
- offline cache
- docs
- deployment mirror

## Acceptance criteria

- clicking Explorer from the hub opens a real game
- no console errors
- no `kitty.js` reference remains
- Explorer works standalone
- Back returns to the correct hub category
- offline route works
- touch works
- audio-disabled state does not break it
- resize does not break it

---

# 7. TASK 4 — PWA METADATA CONSISTENCY

## Priority

**P0**

## Problem

`game/index.html` has the manifest, but the standalone child game pages currently do not consistently declare the same manifest metadata.

The old audit incorrectly says all pages are consistent.

## Every public page must have

Root:

```html
<link rel="manifest" href="manifest.json">
```

Standalone pages:

```html
<link rel="manifest" href="../manifest.json">
```

And:

```html
<meta name="theme-color" content="#4A3F6B">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```

## Also verify

```html
<html lang="sr">
```

## Add automated metadata validation

Create:

```text
tools/validate_pages.js
```

or merge this into the registry-driven validation.

It should fail if a public page is missing:

- `lang="sr"`
- manifest
- theme-color
- viewport metadata

---

# 8. TASK 5 — TRUE OFFLINE BROWSER TEST

## Priority

**P0**

## Problem

The repository can generate a cache list and ZIP, but there is still no end-to-end proof that the application can actually be reopened and played with the network unavailable.

## Goal

Add:

```text
tools/offline_smoke.mjs
```

or equivalent.

## Test sequence

1. Start local HTTP server.
2. Open hub.
3. Wait for service worker readiness.
4. Visit every public app.
5. Allow required local resources to cache.
6. Close page/context.
7. Create a fresh browser context.
8. Block all network requests.
9. Open hub.
10. Open every public app.
11. Verify:
   - no fatal page error
   - no console error that prevents play
   - main UI exists
   - primary interaction works
12. Verify local speech/audio assets do not fail in a way that breaks gameplay.

## Games

At minimum:

```text
hub
animals
animal_counting
animal_memory
animal_puzzle
classroom
coloring
dino
driving
matching_game
ocean
piano
racing3d
shapes
space
tracing
explorer
```

## Acceptance criteria

A fresh browser context can play every public app without a network.

---

# 9. TASK 6 — FIX SHARED SAFE-AREA / VIEWPORT LAYER

## Priority

**P1**

## Current inconsistency

`design-tokens.css` defines variables such as:

```text
--space-1
--space-2
--space-3
--space-4
```

but `viewport.css` uses:

```text
--ps-space-4
```

without the matching token definition.

`viewport.js` also expects:

```text
--sat
--sar
--sab
--sal
```

which are not consistently defined by the CSS layer.

## Goal

Make safe-area behavior explicit and internally consistent.

Use a single naming convention.

Suggested:

```css
--safe-top: env(safe-area-inset-top, 0px);
--safe-right: env(safe-area-inset-right, 0px);
--safe-bottom: env(safe-area-inset-bottom, 0px);
--safe-left: env(safe-area-inset-left, 0px);
```

Use those consistently.

## Test

At minimum:

- phone portrait
- phone landscape
- tablet portrait
- tablet landscape
- desktop

Also test orientation change, dynamic viewport changes, and safe-area-capable browser emulation where practical.

---

# 10. TASK 7 — ACTUALLY INTEGRATE THE SERBIAN DATA LAYER

## Priority

**P1**

## Current state

`game/data/serbian.js` exists and is useful, but many public pages do not actually load or use it.

The architecture therefore still contains duplicated Serbian strings.

## Goal

Move the shared vocabulary from:

```text
hardcoded game code
```

to:

```text
SERBIAN
```

## Load order

For public pages that use it:

```text
serbian.js
↓
shared modules
↓
game module
```

## Migrate in this order

1. praise
2. retry
3. navigation
4. game titles
5. animal names
6. shape names
7. colors
8. numbers
9. letters

## Important

Do not do a giant blind search-and-replace.

For each game:

- inspect existing wording
- preserve correct local grammar
- move stable data
- preserve intentional game-specific phrases

## Acceptance criteria

No important shared vocabulary has multiple competing definitions.

`feedback.js` can safely access Serbian praise/retry phrases.

---

# 11. TASK 8 — SHARED AUDIO BUS ADOPTION

## Priority

**P1**

## Current state

`game/shared/audio-buses.js` exists with:

```text
master
speech
music
sfx
```

but not every game routes audio through it.

There are still direct calls to `window.tone(...)` and custom game-specific audio paths.

## Goal

Move gradually to:

```text
game event
→ shared audio event
→ bus
→ output
```

## Standard vocabulary

At least:

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

## Do not break existing games

This should be incremental.

Prioritize:

1. shared feedback
2. educational games
3. adventure games
4. racing
5. special/legacy audio

---

# 12. TASK 9 — CREATE A REAL RELEASE VALIDATION COMMAND

## Priority

**P1**

## Current state

`tools/check_all.js` currently validates:

- syntax
- smoke battery

with optional:

- docs
- offline package rebuild

It does not automatically include the complete QA stack.

## Goal

Create:

```text
tools/check_release.js
```

Release validation should eventually run:

1. syntax
2. smoke battery
3. registry/route validation
4. metadata validation
5. browser matrix
6. accessibility
7. offline E2E
8. visual regression
9. docs sync
10. offline package rebuild

## Two modes

### Fast development

```text
syntax + targeted smoke
```

### Release

```text
everything
```

Do not make every tiny development edit wait for the entire release suite.

---

# 13. TASK 10 — REAL VISUAL REGRESSION

## Priority

**P1**

## Current state

`tools/screenshot.js` can capture screenshots, but there is no reliable baseline-vs-current image comparison.

## Goal

Add:

```text
baseline PNG
current PNG
pixel diff
PASS/FAIL
```

## Requirements

Make captures deterministic:

- fixed viewport
- fixed game state
- fixed/random seed where practical
- animations disabled for regression screenshots
- audio not affecting layout
- deterministic initial route

## Suggested workflow

```text
node tools/screenshot.js
→ current screenshots

node tools/visual_compare.js
→ compare against baselines
```

## Tolerance

Allow tiny anti-alias/subpixel differences.

Fail meaningful layout regressions.

## Do not make visual tests brittle

We care about:

- missing buttons
- clipping
- wrong card size
- broken layout
- wrong positioning
- missing art
- wrong responsive structure

not one-pixel browser rasterization differences.

---

# 14. TASK 11 — SYSTEM-WIDE TOUCH INTERRUPTION TESTING

## Priority

**P1**

## Current state

The Shapes smoke test now checks:

- pointercancel
- second finger
- page hidden

That is good, but it is not yet a system-wide suite.

## Apply interruption testing to

### Drag games

```text
Shapes
Puzzle
Tracing
Coloring
```

### Tap-heavy games

```text
Animals
Memory
Counting
Classroom
Piano
```

### Canvas/control games

```text
Explorer
Driving
Ocean
Dino
Space
Racing3D
```

## Cases

For interaction-heavy games:

```text
pointerdown
pointermove
second finger
pointercancel
pointerup outside
visibility change
blur
orientation change
resize
```

## Acceptance

No interaction leaves the game permanently stuck.

No held control remains active after cancellation.

No piece remains permanently attached to a pointer.

No game breaks after returning from background.

---

# 15. TASK 12 — SCREENSHOT COVERAGE FOR ALL PUBLIC APPS

## Priority

**P1**

The current screenshot set excludes several public experiences.

Once the app registry exists, screenshot coverage should default to the registry.

Minimum:

```text
hub
animals
animal_counting
animal_memory
animal_puzzle
classroom
coloring
dino
driving
matching_game
ocean
piano
racing3d
shapes
space
tracing
explorer
```

Sizes:

```text
phone portrait
phone landscape
tablet portrait
tablet landscape
desktop
```

A smaller fast subset can still exist for local development.

---

# 16. TASK 13 — LEGACY CODE + CACHE CLEANUP

## Priority

**P1**

Do this only after Explorer migration and offline validation.

## Investigate

```text
games/racing.js
games/racing-config.js
tools/racing_smoke.js
legacy Kitty references
legacy page mappings
legacy cache entries
legacy docs
```

## Rule

Do not delete old code simply because it looks old.

Delete it when:

- no public route needs it
- no production game imports it
- no smoke test needs it
- offline manifest no longer needs it
- documentation no longer references it

## Final goal

There should be no zombie code paths that describe retired public games.

---

# 17. TASK 14 — REGENERATE DOCUMENTATION

## Priority

**P1**

The current:

```text
ROADMAP_AUDIT.md
README.md
PROJECT_TASKS.md
HANDOVER_PROMPT.md
```

contain stale historical assumptions.

The most serious issue is that the audit still describes several recently implemented tasks as missing/partial.

## After implementation work stabilizes

Regenerate the audit from current code.

It must clearly distinguish:

```text
DONE
PARTIAL
BLOCKED
PLANNED
INTENTIONALLY NOT IMPLEMENTED
RETIRED
```

## README

README should describe the current product, not the historical journey.

Remove obsolete references to:

```text
racing.html
papper_kitty.html
kitty.js
old embedded architecture
```

unless explicitly preserved as historical documentation.

---

# 18. TASK 15 — PARENT AREA

## Priority

**P2**

Technical controls currently appear directly in the child-facing hub.

This is not ideal.

## Child hub should prioritize

```text
УЧЕЊЕ
ИГРЕ
```

and gameplay.

## Parent area

Create a small unobtrusive entry such as:

```text
🔒 За родитеље
```

It may contain:

- offline status
- install/download
- check updates
- version
- reset local progress
- audio test
- diagnostics

Do not require the child to understand this UI.

No account system.

No cloud system.

---

# 19. TASK 16 — ACCESSIBILITY PRODUCT PASS

## Priority

**P2**

The project already has:

```text
tools/axe_check.js
game/shared/accessibility.css
```

Continue with a focused product pass.

## Check

- focus-visible
- keyboard fallback where practical
- labels
- live regions for dynamic feedback
- no hover dependency
- large hit areas
- sufficient contrast
- no essential information conveyed only through color
- reduced motion
- touch behavior

Accessibility must not turn toddler play into a reading exercise.

---

# 20. TASK 17 — CI

## Priority

**P2**

Add GitHub Actions when the local release command is reliable.

At minimum run:

```text
node --check
smoke suite
route/registry validation
```

Then add:

```text
browser matrix
offline E2E
accessibility
visual regression
```

Keep very expensive tests separated if necessary.

---

# 21. PRODUCT / VISUAL RULES FOR ALL FUTURE WORK

## Visual language

The application should feel like one studio.

Standardize:

- typography
- buttons
- cards
- back control
- spacing
- shadow language
- success feedback
- hint feedback
- modal language
- safe areas
- background treatment
- audio controls

Avoid making every page look like a completely different app.

## Animal artwork

Priority:

1. native emoji if it looks best
2. validated local Twemoji pilot if it looks better
3. custom artwork only if it is demonstrably stronger

Never choose a visual system just because it is architecturally elegant.

---

# 22. GAME-SPECIFIC QUALITY TARGETS

## Animals

Should support two complementary experiences:

- free discovery
- recognition: “Пронађи животињу”

Keep the child successful quickly.

## Counting

Current one-to-one counting flow is correct direction.

Continue to emphasize:

```text
see object
tap object
hear count
understand quantity
choose number
```

Avoid reducing counting to a number quiz.

## Memory

Age tiers should remain.

The easy mode should be genuinely easy.

Do not reintroduce score pressure.

## Puzzle

Keep:

- magnetic placement
- preview
- 1x2 → 2x2 → 3x3

Consider future enhancements only if playtesting shows they help.

## Shapes

Current magnetic/tier structure is the right model.

Continue to favor:

```text
recognize
drag
snap
celebrate
```

over precision.

## Coloring

Keep the two distinct experiences:

```text
Слободно бојење
Обоји по слици
```

Do not merge them back.

## Tracing

Keep developmental behavior.

Important:

- pre-writing before letters
- stroke guidance
- preserve imperfect attempts
- explicit retry/next
- no punitive red crosses
- no forced auto-advance

## Piano

Keep free play primary.

“Прати светло” should feel like following a friendly guide, not taking a test.

## Classroom

Keep it calm.

Avoid turning the main classroom experience into a quiz.

Quiz mode belongs as a secondary older-child activity.

---

# 23. ADVENTURE FAMILY RULES

The current shared engine is good.

The four games must remain mechanically distinct.

## Explorer

Identity:

```text
explore
discover
jump gently
find safe routes
```

Not:

```text
precision platformer
```

## Driving

Identity:

```text
follow the road
notice landmarks
reach the goal
```

## Ocean

Identity:

```text
swim
float
follow bubbles
discover underwater spaces
```

## Dino

Identity:

```text
jump
time movements
use forgiving windows
```

## Space

Identity:

```text
move through altitude layers
navigate around planets/landmarks
```

Do not solve differentiation by merely creating more worlds.

---

# 24. RACING3D RULES

Racing3D is now the flagship racing game.

Do not destabilize the existing polished work while doing unrelated architecture changes.

Protect:

- toddler speed
- broad track
- clear steering
- no fail state
- world picker
- kart colors
- pickups
- boost
- finish flow
- reduced motion
- context-loss handling
- current touch behavior
- world-specific visual/audio identity

Use Racing3D as a reference when establishing polished canvas/game UX patterns for other games.

---

# 25. DEVICE QA MATRIX

Every meaningful release should consider:

```text
390x844     phone portrait
844x390     phone landscape
820x1180    tablet portrait
1180x820    tablet landscape
1280x800    desktop
```

Primary target:

```text
tablet landscape
```

Secondary:

```text
phone landscape
```

Then:

```text
tablet portrait
phone portrait
desktop
```

Check:

- no horizontal scrolling
- no clipped controls
- no controls under HUD
- no inaccessible final tile
- no overlap with safe-area
- back button always reachable
- game controls remain comfortable
- dialogs fit

---

# 26. AUDIO QA MATRIX

For each game:

```text
sound on
sound off
speech unavailable
music disabled
rapid repeated interaction
background/foreground
```

No audio failure may break game logic.

Speech should never block gameplay.

---

# 27. PERFORMANCE RULES

For canvas/WebGL games:

- cap DPR where appropriate
- cap particles
- avoid unnecessary object allocation
- avoid unbounded arrays
- clean event listeners
- stop loops when hidden
- recover from context loss
- avoid expensive layout reads in animation loops

For DOM games:

- avoid repeated full-tree rebuilds when unnecessary
- keep animations lightweight
- avoid layout thrashing

---

# 28. NO NEW GAME POLICY

Do not add a new game unless:

1. an existing skill gap is identified
2. the gap cannot reasonably be covered by improving an existing game
3. the interaction is age-appropriate
4. it adds educational/motor value
5. it can work offline
6. it fits the Serbian-language product
7. it can be maintained without creating another isolated architecture

Potential future learning areas:

```text
sorting
more / less / same
early phonics
simple mazes
rhythm imitation
spatial concepts
sequencing
```

These are **future candidates**, not immediate implementation tasks.

---

# 29. EXECUTION PROTOCOL FOR THE IMPLEMENTATION AI

For every task:

## Step 1 — inspect first

Read the relevant current files.

Do not trust:

- old roadmap states
- old README claims
- old task numbers
- assumptions from previous AI sessions

## Step 2 — identify shared dependencies

Before editing a game, check:

- navigation
- audio
- speech
- input
- motion
- viewport
- Serbian data
- app registry
- offline cache

## Step 3 — implement the smallest coherent change

Prefer one complete vertical slice over scattered partial edits.

## Step 4 — validate immediately

At minimum:

```bash
node --check <changed JS/MJS files>
```

Then affected smoke:

```bash
node tools/<affected>_smoke.js
```

For shared changes:

```bash
node tools/run_all.js
```

## Step 5 — update generated/deployment artifacts

When applicable:

```bash
node tools/check_all.js --docs --offline
```

## Step 6 — verify the deployment mirror

Important production files under `docs/` should match `game/`.

## Step 7 — update documentation

Do not leave implementation and documentation out of sync.

## Step 8 — only then move to the next task

---

# 30. DO NOT MAKE THESE MISTAKES

Do not:

- reintroduce a deleted game route accidentally
- add CDN dependencies to production gameplay
- replace good child-facing visuals with technically “cleaner” but uglier art
- create per-game copies of shared Serbian vocabulary
- create per-game touch systems when the shared one is appropriate
- introduce scores into toddler-first modes
- add punishment loops
- expand world counts when identity is weak
- build a giant settings menu
- add analytics/tracking
- add accounts
- add cloud sync
- add monetization
- add network-only features
- trust stale task audit status
- maintain several independent public page lists

---

# 31. DEFINITION OF DONE FOR THIS HARDENING MILESTONE

The milestone is complete when:

## Child experience

- animal artwork is visually validated
- no broken public game route
- hub is simple and consistent
- all games remain toddler-friendly
- controls are reliable

## Architecture

- public app registry exists
- route inventory is authoritative
- Serbian layer is actually integrated
- audio system is converging on shared buses
- viewport/safe-area layer is internally consistent

## Offline

- every public game can be reopened and played offline
- offline package is regenerated
- no runtime CDN dependency

## QA

- complete smoke suite passes
- browser/device matrix passes
- touch interruption suite passes
- accessibility scan is usable
- visual regression compares real screenshots
- release command can validate the full stack

## Documentation

- README describes current reality
- roadmap reflects current reality
- retired routes are clearly retired
- implementation AI instructions match the actual architecture

---

# 32. NEXT PHASE AFTER HARDENING

Only after the above is stable:

## Educational depth

Build small improvements that deepen existing games first.

Examples:

### Animals

```text
Где је пас?
Покажи ко каже: ав-ав!
Покажи велику животињу.
```

### Numbers

```text
више
мање
исто
```

### Shapes

```text
пронађи круг
пронађи исте облике
облици у сцени
```

### Language

```text
sound → letter
letter → familiar object
```

### Spatial

```text
горе
доле
унутра
ван
лево
desno
близу
далеко
```

### Sequencing

```text
прво
онда
на крају
```

These should be introduced only where they fit naturally into existing experiences.

---

# 33. FINAL PRODUCT PRINCIPLE

**Do not keep adding games. Make the existing world better.**

The next major quality jump should come from:

```text
better art
+
consistent architecture
+
reliable offline behavior
+
reliable touch
+
consistent Serbian
+
consistent audio
+
better visual QA
+
cleaner parent/child separation
```

The target is that a parent can hand a tablet to a young child, the child can immediately pick something, play without frustration, and the entire collection feels like it came from one polished children's studio.

---

# 34. WEB RESEARCH NOTE — ANIMAL ASSETS

The preferred external asset candidate evaluated for Task 1 is **Twemoji**.

Official repository:

https://github.com/jdecked/twemoji

Twemoji's official documentation describes downloadable SVG assets and states that the graphics are licensed under **CC BY 4.0**. The project also describes acceptable attribution locations such as a README/About section or source.

Graphics license:

https://creativecommons.org/licenses/by/4.0/

Use a pinned version and local assets for Petrin svet. Never make production gameplay depend on the Twemoji CDN.

