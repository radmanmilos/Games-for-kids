> **SUPERSEDED (2026-10-04).** This is the previous-generation master roadmap,
> kept for history only. The active implementation queue is the
> [Fresh Elevation Roadmap](Petrin_svet_Fresh_Elevation_Roadmap_2026-09-29.md).
> See [`ROADMAP.md`](../../ROADMAP.md). Do not work from this file.

# Петрин свет — Master Execution Roadmap

## Purpose

This document is the implementation roadmap for the AI/code agent responsible for improving the entire **Петрин свет** repository.

Treat every item below as an engineering task, not as a suggestion. The agent should execute the work directly, preserve the project's existing philosophy, and avoid inventing alternate product directions unless a task explicitly permits it.

The project is a free, offline-first collection of toddler/young-child experiences written in Serbian Cyrillic, with spoken Serbian, browser support, phone support, and tablet support.

The target outcome is **not simply more games**. The target outcome is a coherent children's product in which every application feels like part of the same world, follows the same interaction language, works reliably on touch devices, remains understandable without reading, and gradually adds meaningful learning value without adding frustration.

---

# 0. Execution Rules for the Implementing AI

These rules apply to every task in this document.

### 0.1 Do not redesign the product randomly

Do not replace the existing visual language, architecture, game concepts, or Serbian wording with a new framework merely because another architecture is aesthetically cleaner.

Prefer incremental refactoring and shared primitives over rewrites.

Do not migrate the project to React, Vue, Svelte, Phaser, Unity, a backend, or a cloud service unless a later roadmap task explicitly requires it. The current project is intentionally lightweight and offline-friendly.

### 0.2 Preserve the project's core rules

Always preserve these product constraints:

- toddler-friendly
- learning through play
- Serbian spoken language
- Serbian Cyrillic written language
- no reading required for basic navigation
- offline operation must remain possible
- always free
- no advertisements
- no in-app purchases
- no accounts
- no cloud profiles
- no competitive leaderboards
- no energy systems, hearts, lives, streak pressure, or punitive timers
- no difficult menus
- immediate play
- generous touch targets
- forgiving interaction
- mistakes must not feel like punishment
- reward the child for interacting and exploring
- tablet-first with phone compatibility
- browser-first with installable/offline PWA support where practical

### 0.3 Execute in dependency order

Do not polish individual games independently while shared systems remain inconsistent.

The recommended order is:

1. shared visual and interaction system
2. global navigation and parent area
3. shared audio and feedback primitives
4. shared responsive/touch/reduced-motion behavior
5. core learning apps
6. creative apps
7. adventure/play apps
8. PWA/offline hardening
9. legacy cleanup
10. future skill-gap games

### 0.4 Every code change must have a validation step

For every task:

1. identify affected files
2. implement the smallest coherent change
3. run the narrowest relevant smoke test
4. run affected interaction tests
5. run the complete battery when shared code changed
6. update documentation when behavior or architecture changed

Do not mark a task complete because the page merely loads.

### 0.5 Do not create hidden product complexity

A feature is only valuable if a toddler can understand it through visual/audio feedback.

Avoid adding:

- nested settings menus in child-facing screens
- text-heavy instructions
- profile creation
- unlock currencies
- stars used as a progression economy
- artificial scarcity
- timed penalties
- forced advertisements or monetization
- social comparison
- complicated inventory systems
- unnecessary modal confirmations

A parent may have an optional technical/settings area, but children should not need it.

---

# 1. Current Repository Baseline

## 1.1 Public application pages currently present

The current `game/pages` collection includes:

- `animal_counting.html`
- `animal_memory.html`
- `animal_puzzle.html`
- `animals.html`
- `classroom.html`
- `coloring.html`
- `dino.html`
- `driving.html`
- `matching_game.html`
- `ocean.html`
- `papper_kitty.html`
- `piano.html`
- `racing.html` — legacy/hidden
- `racing3d.html`
- `shapes.html`
- `space.html`
- `tracing.html`

## 1.2 Current game scripts

Current game engines and data files include:

- `adventure-modes.js`
- `adventure-music.js`
- `adventure.js`
- `animal_counting.js`
- `animal_memory.js`
- `animal_puzzle.js`
- `animals.js`
- `candy.js`
- `classroom.js`
- `coloring.js`
- `dino.js`
- `driving.js`
- `kids_games.js`
- `kitty-standalone.js`
- `kitty.js`
- `ocean.js`
- `piano.js`
- `racing-config.js`
- `racing.js`
- `racing3d-config.js`
- `racing3d.mjs`
- `shapes.js`
- `space.js`
- `tracing.js`

## 1.3 Current service-worker/offline files

Relevant infrastructure currently includes:

- `game/sw.js`
- `game/sw-cache-list.json`
- `game/offline-manifest.json`
- `tools/build_offline.ps1`

## 1.4 Current testing architecture

The repository already has tooling around:

- per-game smoke tests
- `hub_smoke.js`
- `play_matrix.mjs`
- `tools/run_all.js`
- `tools/check_all.js`

The current validation philosophy should be extended rather than replaced.

Important: the latest repository state already includes the Racing3D fixes that were previously identified around short landscape hub reachability, steering/HUD overlap, empty back controls, car yaw, reduced motion, particle handling, context loss, input reset, audio motif timing, and related performance safeguards. Do not reintroduce those as new tasks unless a regression is detected.

---

# 2. Product Direction

## 2.1 Core problem to solve

The repository already contains enough experiences to be a useful children's collection. The main product problem is now **cohesion**.

The collection should stop feeling like many independent HTML games and start feeling like one children's world.

Every app should share:

- the same visual language
- the same navigation language
- the same button geometry
- the same touch behavior
- the same sound vocabulary
- the same mistake philosophy
- the same parent/child separation
- the same Serbian language quality
- the same responsive behavior
- the same offline assumptions
- the same reduced-motion behavior

## 2.2 Recommended conceptual information architecture

Use these three child-facing categories as the product mental model:

```text
Петрин свет
│
├── УЧИМО
│   ├── Животиње
│   ├── Бројеви
│   ├── Облици
│   ├── Боје
│   └── Азбука
│
├── СТВАРАМО
│   ├── Бојење
│   ├── Писање
│   └── Музика
│
└── ИГРАМО СЕ
    ├── Истраживач
    ├── Вожња
    ├── Океан
    ├── Дино
    ├── Свемир
    ├── Трка
    ├── Слагалица
    └── Памтилица
```

This is a conceptual organization. The implementation may use a shallower navigation if the current hub layout performs better for toddlers.

The critical requirement is that **children choose by picture/theme first**, not by technical labels.

---

# 3. Priority Model

Use this priority model for implementation.

## P0 — Product foundation

These are required before broad feature expansion:

- shared design system
- unified navigation/back behavior
- shared feedback system
- shared touch rules
- responsive/safe-area rules
- reduced-motion rules
- parent area separation
- manifest/PWA consistency
- offline validation
- regression test expansion

## P1 — High-value game improvements

- Animals
- Animal Counting
- Shapes
- Coloring
- Tracing
- Animal Memory
- Animal Puzzle
- Classroom
- Piano
- Match Game

## P2 — Play/adventure improvements

- Little Explorer
- Driving
- Ocean
- Dino
- Space
- Racing3D

## P3 — Cleanup and long-term structure

- legacy route cleanup
- shared module refactoring
- visual regression snapshots
- asset normalization
- deeper local progress
- future educational games only when they fill a skill gap

---

# 4. Shared Design System

## Task DS-001 — Create a single visual token layer

### Goal

Stop every page from individually inventing spacing, button sizes, shadows, radii, typography, and feedback colors.

### Target files

Prefer creating shared files such as:

- `game/styles/design-tokens.css`
- `game/styles/components.css`
- `game/styles/layout.css`

If the repository already has shared CSS files, extend them instead of creating duplicate systems.

### Implement

Create CSS custom properties for:

```css
:root {
  --ps-bg: #FFF8ED;
  --ps-plum: #4A3F6B;
  --ps-sky: #4FC3F7;
  --ps-yellow: #FFD23F;
  --ps-green: #67C971;
  --ps-pink: #FF6F91;
  --ps-violet: #9B6DFF;

  --ps-radius-sm: 14px;
  --ps-radius-md: 22px;
  --ps-radius-lg: 30px;
  --ps-radius-pill: 999px;

  --ps-shadow-soft: 0 8px 24px rgba(74,63,107,.12);
  --ps-shadow-card: 0 12px 28px rgba(74,63,107,.14);

  --ps-space-1: 6px;
  --ps-space-2: 10px;
  --ps-space-3: 14px;
  --ps-space-4: 18px;
  --ps-space-5: 24px;
  --ps-space-6: 32px;

  --ps-touch-min: 48px;
  --ps-touch-comfort: 56px;
  --ps-touch-large: 72px;
}
```

The exact values may be tuned during implementation, but every page should consume the shared tokens instead of hard-coding unrelated values.

### Create standard component classes

At minimum:

- `.ps-app`
- `.ps-header`
- `.ps-back`
- `.ps-title`
- `.ps-subtitle`
- `.ps-card`
- `.ps-choice`
- `.ps-primary`
- `.ps-secondary`
- `.ps-icon-button`
- `.ps-game-board`
- `.ps-status`
- `.ps-success`
- `.ps-hint`
- `.ps-parent-entry`

### Acceptance criteria

- New shared CSS files are referenced by public pages.
- Existing games preserve their recognizable theme.
- Buttons and back controls visibly belong to one product.
- No app has unnecessarily tiny critical controls.
- Shared spacing/radii/shadows are used in at least the hub, Classroom, Animals, Shapes, Coloring, Tracing, and one adventure page before expanding to every page.

---

# 5. Shared Navigation

## Task NAV-001 — Standardize all back/home controls

### Goal

The child must learn one navigation pattern and reuse it everywhere.

### Implement

Every child-facing game page should have:

- one obvious back/home control in a consistent location
- a large icon or icon + short Cyrillic label
- minimum touch area 48×48 CSS px; target 56–72 px where space allows
- no reliance on hover
- no icon-only control if the icon's meaning is ambiguous

Preferred semantics:

```text
← Назад
```

or visually:

```text
←
Назад
```

For very small child-facing screens, the icon may be dominant with accessible text.

### Behavioral rule

A tap on back should immediately return to the parent screen. Do not require confirmation unless a game contains an unusual destructive action.

### Hardware/back handling

Where applicable, use browser/history semantics so browser back returns to the previous game selection rather than unexpectedly closing the experience.

### Acceptance criteria

All current public pages use the same back pattern and same hit area.

---

# 6. Shared Feedback System

## Task FB-001 — Create one universal feedback vocabulary

### Goal

Every game should communicate success/mistake/progress using the same sensory language.

### Create shared functions

Prefer a shared helper module such as:

- `softPop()`
- `successChime()`
- `gentleMiss()`
- `celebrate()`
- `speakSr()`
- `showHint()`
- `announceStatus()`

If these already exist in distributed files, centralize without breaking current callers.

### Feedback rules

#### Correct action

Use:

- small visual pop
- brief positive color transition
- short positive sound
- optional Serbian praise
- no large intrusive modal

Possible spoken phrases:

- `Тачно!`
- `Браво!`
- `Одлично!`
- `Сјајно!`

Do not repeat the exact same phrase on every success. Rotate a small controlled set.

#### Incorrect action

Use:

- subtle shake or movement only where helpful
- gentle cue sound
- optional `Хајде поново!` or `Покушај још једном!`
- preserve useful state where possible
- immediately allow another attempt

Never use:

- red failure screens
- lives disappearing
- loss of earned progress
- harsh buzzer sounds
- “Game Over” for ordinary educational mistakes

#### Completion

Use a short celebratory animation and sound, then present a simple next/replay choice.

Do not force a long animation.

---

# 7. Shared Reduced Motion

## Task MOTION-001 — Make reduced motion global

### Goal

The Race3D implementation already contains its own reduced-motion fixes. Generalize the same principle to the entire product.

### Implement

Respect:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
}
```

Then add JS-level handling for canvas games where CSS cannot stop camera/particle motion.

At runtime create a helper:

```js
const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
```

Games must reduce or disable:

- camera shake
- rapid bobbing
- screen zoom pulses
- large particle bursts
- repeated scaling animations
- heavy confetti
- decorative idle movement

Do not remove all feedback. Replace motion with:

- color change
- static highlight
- short sound
- spoken confirmation

### Acceptance criteria

A device/browser configured for reduced motion no longer receives strong camera shake, repeated UI bobbing, or large decorative animation in any public game.

---

# 8. Touch Interaction Standard

## Task TOUCH-001 — Standardize pointer behavior

### Goal

Touch should be forgiving and robust on phones and tablets.

### Implement with Pointer Events

Use `pointerdown`, `pointermove`, `pointerup`, `pointercancel`, and `lostpointercapture` for custom drag interactions.

When starting a drag:

```js
element.setPointerCapture?.(event.pointerId);
```

When finished/cancelled, release/reset state.

Use deliberate CSS:

```css
.draggable,
.game-board,
.touch-control {
  touch-action: none;
}
```

Do not use `touch-action: none` on the entire document unless absolutely necessary.

### Robustness cases to handle in every drag game

- one-finger drag
- pointer leaves the element
- pointer leaves the viewport
- pointercancel
- accidental second finger
- long press
- rapid repeated taps
- pointerup after cancel
- page hidden while input is active
- orientation change while input is active

On any cancellation/visibility change/orientation change, reset transient input state.

### Large interaction areas

The visible object and hit area should not be identical when the object is small.

Use invisible padding around small controls where practical.

### Acceptance criteria

No public game can become permanently “stuck” in a dragged/pressed/accelerating state after interrupted touch input.

---

# 9. Responsive and Device Rules

## Task DEVICE-001 — Create shared viewport rules

Primary validation viewports:

- 390×844 portrait phone
- 844×390 landscape phone
- 820×1180 portrait tablet
- 1180×820 landscape tablet
- 1280×800 desktop

### Priority order

1. tablet landscape
2. phone landscape
3. tablet portrait
4. phone portrait
5. desktop

### General rules

- critical controls must fit without overlap
- no horizontal scrolling
- no controls hidden behind browser safe areas
- support `env(safe-area-inset-*)` when useful
- account for dynamic mobile browser UI
- canvas games must recalculate dimensions on resize/orientation change
- avoid viewport-fixed controls that cover game content without an inset

Recommended wrapper pattern:

```css
.page {
  padding:
    max(var(--ps-space-4), env(safe-area-inset-top))
    max(var(--ps-space-4), env(safe-area-inset-right))
    max(var(--ps-space-4), env(safe-area-inset-bottom))
    max(var(--ps-space-4), env(safe-area-inset-left));
}
```

### Tablet portrait

If a game is clearly designed for landscape, show a simple rotate hint instead of trying to compress the game into unusable dimensions.

The rotate hint should be visual-first and spoken only when audio is already enabled/expected.

### Acceptance criteria

Every public game is playable at all target viewports, or intentionally presents a clear rotate-to-landscape hint for the few experiences where landscape is required.

---

# 10. Main Hub Redesign

## Task HUB-001 — Redesign the home screen as a toddler-first launcher

### Current issue

The hub has many experiences plus technical controls. Technical offline/update actions should not compete with the child-facing game choices.

### Desired hierarchy

Top:

- Петрин свет brand/title
- recurring mascot
- optional short greeting

Middle:

- large game/category tiles

Bottom/secondary:

- subtle parent entry such as `🔒 За родитеље`

Technical actions such as:

- offline installation
- update checks
- ZIP/manual download
- diagnostics
- cache information

must move into the parent area.

### Recommended child-facing tile design

Each tile should have:

1. large recognizable illustration/icon
2. short Serbian Cyrillic name
3. one optional spoken title on tap
4. no long description
5. consistent tile size
6. consistent press animation

Example:

```text
🐶
Животиње
```

rather than:

```text
Animal Exploration and Recognition Game
```

### Category option

If the total tile count causes visual overload, use three visual sections:

- `Учимо`
- `Стварамо`
- `Играмо се`

Do not create deep nested menus. One tap should normally be enough to reach a game, and two taps maximum should be needed from the hub.

### Hub ordering

Prioritize:

1. Animals
2. Numbers
3. Shapes
4. Colors / Classroom
5. Coloring
6. Tracing
7. Piano
8. Memory/Puzzle/Match
9. Adventure worlds
10. Racing3D

The exact visual order can be tested, but the first screen should contain the clearest and simplest activities.

### Acceptance criteria

A toddler can visually choose a game without reading technical instructions.

A parent can still reach offline/update/diagnostic controls through a separate path.

---

# 11. Parent Area

## Task PARENT-001 — Add a small parent/technical area

### Goal

Separate adult operations from child gameplay without requiring accounts.

### Entry

Use a subtle control:

```text
🔒 За родитеље
```

It should be visible but not visually dominant.

### Parent page contents

Include:

- installed/offline status
- application version
- update/check status
- manual offline package/download option
- reset local progress
- audio test
- speech test
- reduced-motion status
- optional diagnostics
- app/about information

Do not expose developer console details directly to children.

### Parent-only reset

Resetting progress must require a deliberate parent action, e.g. press-and-hold or a simple confirmation.

Do not make accidental reset possible from a child tap.

### Acceptance criteria

Technical/offline functionality no longer occupies prominent child-facing space.

---

# 12. Mascot and Brand Cohesion

## Task BRAND-001 — Introduce one recurring Petrin svet mascot

### Goal

Create visual continuity between independent apps.

### Requirements

Mascot should:

- be visually simple
- work as SVG/local image
- have clear silhouette
- work at tiny sizes
- have 3–5 reusable poses
- never become an obstacle to gameplay

Recommended pose set:

1. greeting
2. happy/success
3. thinking/hint
4. celebration
5. sleeping/idle

### Usage

Use mascot on:

- main hub
- educational app headers
- completion screens
- rotate/orientation hints
- offline/parent information screen

Do not put the mascot everywhere. It should function as a visual signature.

### Asset rule

Use local SVG/PNG assets. Do not depend on remote image URLs.

---

# 13. Emoji and Illustration Strategy

## Task ART-001 — Reduce emoji dependence for important educational visuals

### Current issue

Emoji appearance varies across devices and operating systems. Emoji is useful for decoration but should not be the only representation of an important learning object.

### Implement

Use local SVG/PNG/procedural illustrations for:

- animal identification cards
- major educational icons
- puzzle scenes
- key classroom visuals
- mascot
- important buttons where icon identity matters

Emoji may remain for:

- decorative accents
- optional playful labels
- non-essential rewards
- temporary placeholders during asset production

### Design style

Illustrations should be:

- flat or lightly shaded
- high contrast
- thick outlines where useful
- visually distinct at small sizes
- consistent across all animals and objects

### Acceptance criteria

A cow should look like the same visual “cow character” across Animals, Counting, Puzzle, Coloring, and Classroom rather than five unrelated emoji/illustration styles.

---

# 14. Serbian Language and Speech Standard

## Task LANG-001 — Establish a language data layer

### Goal

Stop individual games from inventing slightly different Serbian phrasing.

### Create shared data

Prefer:

- `game/data/serbian.js`
- or an equivalent existing shared data module

Store:

- letter names
- example words
- number words
- shape names
- color names
- common praise phrases
- retry phrases
- navigation labels
- game titles

### Serbian Cyrillic rule

All visible child-facing educational text should be Serbian Cyrillic unless a technical browser label cannot reasonably be localized.

### Speech rule

Use local recorded Serbian speech where the repository already provides assets.

Browser TTS is fallback only.

If browser TTS is used:

1. request the Serbian voice where available
2. avoid excessive repeated announcements
3. do not make gameplay depend on TTS finishing
4. never block interaction because speech is unavailable

### Pronunciation consistency

Audit:

- letter names
- animal names
- numbers 0–10
- colors
- shapes
- feedback phrases

Ensure text and spoken content refer to the same concept.

---

# 15. Audio Architecture

## Task AUDIO-001 — Create shared audio buses and priorities

### Goals

Audio must be consistent and must never become a blocker.

Create shared conceptual buses:

- master
- speech
- music
- ambience
- SFX

### Priority order

When simultaneous audio conflicts:

1. safety/critical spoken instruction
2. speech
3. success feedback
4. interaction SFX
5. ambience
6. background music

### Audio event vocabulary

Use standardized events:

- `tap`
- `dragStart`
- `placeCorrect`
- `placeWrong`
- `success`
- `celebrate`
- `goal`
- `hint`
- `animalName`
- `animalSound`
- `number`
- `shape`
- `letter`

### Compound sound rule

Short musical motifs must be scheduled atomically rather than relying on queue systems that can stretch/overlap them unexpectedly.

### Offline rule

All important child-facing audio must be local/cached.

If speech/audio fails, gameplay must continue.

### Acceptance criteria

Turning down music should not silence speech or critical feedback.

Audio-disabled mode must still leave enough visual feedback to understand gameplay.

---

# 16. Animals

## Task GAME-ANIMALS-001 — Upgrade Animals from passive flashcards to gentle recognition

### Current behavior

Animal cards speak the animal name, play animal sounds, and allow random animal navigation.

This is already a good baseline.

### Keep

- large animal visual
- Serbian name
- animal sound
- simple navigation
- random exploration

### Add mode: `Пронађи животињу`

Generate a prompt such as:

```text
Где је пас?
```

Show 2 choices for easiest mode.

Use 3 choices for older-child mode.

Do not show more than 3 choices on the toddler path.

### Interaction

Child taps an animal.

Correct:

- highlight animal
- play success sound
- speak animal name
- play animal sound
- tiny celebration
- optionally offer another question

Wrong:

- gentle cue
- keep choices visible
- do not remove the wrong answer permanently
- optionally make the correct choice glow briefly after repeated misses

### Adaptive difficulty

Use simple local progression:

- first several rounds: 2 choices
- later: 3 choices
- use visually distinct animals before visually similar animals

### Acceptance criteria

The game supports both free exploration and recognition without introducing a complex mode-selection menu.

---

# 17. Animal Counting

## Task GAME-COUNT-001 — Convert number selection into actual one-to-one counting practice

### Current issue

The current game mainly tests selecting the correct number after showing a quantity.

Increase the amount of direct counting behavior.

### Add one-to-one counting interaction

For each level:

1. show 1–10 animals
2. child can tap animals one by one
3. tapped animal gets a subtle highlight
4. each tap may play a very short counting word
5. after all animals are counted, present the number choices

Example:

```text
🐶 🐶 🐶 🐶

један → два → три → четири

Колико их има?

[ 3 ] [ 4 ] [ 5 ]
```

### Important

Do not force exact timing between taps.

Do not require perfect order for basic toddler mode.

### Difficulty tiers

#### Tier 1

1–3 objects, large spacing.

#### Tier 2

1–5 objects, varied arrangement.

#### Tier 3

1–10 objects, less regular spacing.

### Feedback

Every counted object should visibly mark as counted.

The game should prevent accidental double counting of the same object unless the child explicitly restarts.

### Acceptance criteria

The game teaches counting, not just number-label recognition.

---

# 18. Shapes

## Task GAME-SHAPES-001 — Add magnetic matching and visual hints

### Current behavior

Shapes are dragged into matching targets with success/miss feedback.

### Implement

When a shape is dragged within a generous snap radius of its correct target:

- softly animate toward target
- snap into target
- play success feedback
- speak the shape name

Wrong target:

- return shape gently to original position
- do not punish
- optionally highlight correct target after repeated attempts

### Difficulty progression

Tier 1:

- 2 shapes
- distinct silhouettes
- large targets

Tier 2:

- 3–4 shapes
- smaller size differences

Tier 3:

- visually related shapes
- rotation/size variation only for older children

### Acceptance criteria

At no point should a toddler need pixel-perfect dragging.

---

# 19. Animal Memory

## Task GAME-MEMORY-001 — Add age-appropriate memory progression

### Current behavior

Fixed 4×4 board with 8 animal pairs.

### Problem

A 16-card memory board can be too difficult for the youngest children.

### Implement adaptive board sizes

#### Easy

2×2 = 2 pairs

#### Medium

3×2 = 3 pairs

#### Standard

4×4 = 8 pairs

Do not start a 2–3-year-old user on 4×4.

### Input behavior

On first tap:

- card stays open
- optionally speak animal name

On second tap:

Correct:

- keep both cards open
- speak animal name
- play soft success

Wrong:

- leave both visible for ~700–900 ms
- then flip back
- do not play a harsh error sound

### Add optional visual recall helper

After several misses on Easy mode:

- briefly glow the pair or show a hint animation

Never reveal the answer immediately on the first mistake.

### Acceptance criteria

Memory is approachable for a toddler but can still grow into a more difficult preschool activity.

---

# 20. Animal Puzzle

## Task GAME-PUZZLE-001 — Improve piece placement and developmental progression

### Current behavior

Custom canvas scenes; 2×2 and 3×3 puzzle grids; pieces can be dragged into approximate locations.

### Implement magnetic snap

Each piece gets a target rectangle.

Calculate normalized distance between dragged piece center and target center.

If within a forgiving threshold:

```text
snap threshold = max(0.16 * pieceSize, minimumTouchDistance)
```

Use a threshold large enough for touch.

On snap:

- animate quickly into exact position
- lock piece
- play success
- optionally speak context word

### Developmental levels

2 pieces:

- easiest
- large images
- central target

4 pieces:

- normal easy puzzle

9 pieces:

- older preschool

### Add preview helper

Always allow a short preview of the finished scene.

The child should be able to tap preview again if they need to look.

### Acceptance criteria

The puzzle feels like “put this here” instead of “perform precise coordinate dragging.”

---

# 21. Coloring

## Task GAME-COLOR-001 — Split “color matching” and “free coloring” concepts

### Current behavior

The current experience uses reference colors and treats exact target colors as correct.

### Product issue

This is useful as a matching activity but is not actually free coloring.

### Keep existing mode as

`Обоји по слици`

Child chooses a region and fills it with the target/reference color.

### Add optional second mode

`Слободно бојење`

In free mode:

- palette selection has no correctness state
- any color may be used
- no wrong feedback
- no success requirement
- provide simple clear/reset button
- completion can be optional, based on filling enough of the scene or simply saving the current art locally during the session

### Palette

Keep named Serbian colors:

- црвена
- жута
- плава
- зелена
- наранџаста
- љубичаста
- розе
- браон
- црна
- бела
- сива

### Touch

Palette controls must remain large in portrait and landscape.

### Acceptance criteria

Coloring becomes both an educational matching activity and a creative activity without confusing the two goals.

---

# 22. Tracing

## Task GAME-TRACING-001 — Make tracing developmental instead of evaluative

### Current behavior

The app traces Serbian Cyrillic letters, numbers, and shapes using raster coverage/nearness comparison.

### Product issue

Automatic pass/fail on handwriting can be too demanding for a toddler and can turn practice into evaluation.

### Keep

- dashed guide
- large writing area
- Serbian Cyrillic focus
- numbers
- shapes
- touch drawing

### Add pre-writing stage before letters

New progression:

1. horizontal lines
2. vertical lines
3. circles
4. arcs
5. simple zig-zags
6. simple paths
7. large block-like shapes
8. letters

This should be available as the natural “first writing” mode.

### Change scoring model

Do not expose:

- percentage
- accuracy score
- “failed” language

Instead internally classify:

- early attempt
- nearly there
- complete enough

### Preserve drawing on weak attempt

Do not clear the canvas immediately after a miss.

Instead:

- keep the child's drawing
- softly highlight the guide
- say `Хајде још једном.`
- add an optional `Обриши` button

### Improve stroke support

For letters that benefit from stroke order:

- show a small numbered dot or directional arrow for the next stroke
- do not require exact stroke order in the earliest mode

### Success

When the trace sufficiently follows the guide:

- celebrate
- optionally say the letter name
- do not auto-advance immediately unless the child has not interacted with the screen for a short delay
- give explicit next/repeat buttons

### Acceptance criteria

The child can practice repeatedly without feeling punished for imperfect handwriting.

---

# 23. Classroom

## Task GAME-CLASS-001 — Make Classroom the calm learning center

### Current role

Classroom contains alphabet, numbers, shapes, colors, autoplay, and a quiz mode.

### Preserve

- 29 Serbian Cyrillic letters
- number 0–10
- shapes
- colors
- tap-to-speak
- autoplay
- quiz mode

### Reorganize visually

Use simple visual tabs or category cards:

```text
А   1   ◯   🔴

Азбука | Бројеви | Облици | Боје
```

Do not make tabs look like complicated adult UI.

### Alphabet card

Each letter card should show:

- large letter
- local illustration
- example word in Cyrillic
- optional spoken letter
- optional spoken example word

Example:

```text
М
Миш
🐭
```

### Quiz positioning

The existing 8-question quiz should remain, but position it as an older-child option rather than the primary toddler classroom activity.

### Acceptance criteria

Classroom is useful even when the child simply taps around and listens, without ever entering quiz mode.

---

# 24. Piano

## Task GAME-PIANO-001 — Make free play primary

### Current behavior

8 white keys, free play, 3 songs, expected-note highlighting, gentle wrong-note behavior.

### Keep

- immediate sound on touch
- free play
- visual feedback per key
- song learning mode

### Change song UI

Use a simple visual phrase such as:

`Прати светло`

The expected key softly lights.

When the child presses the correct key:

- play note
- brief positive highlight
- advance indicator

Wrong key:

- do not produce strong negative feedback
- gently indicate expected key

### Add local Serbian children's songs later

Do not immediately expand to dozens of songs.

First establish a data structure that supports song sequences:

```js
{
  id: 'song-id',
  title: 'Назив',
  notes: ['C4', 'C4', 'G4'],
  tempo: 100,
  speech: '...'
}
```

### Acceptance criteria

Free play remains more prominent than challenge mode.

---

# 25. Match Game

## Task GAME-MATCH-001 — Make the game age-aware

### Current behavior

Starts at 4×4 and grows toward 8×8, with score and star power-ups.

### Product concern

8×8, score pressure, and power-ups are more suitable for older children than toddlers.

### Toddler mode

Default:

- 2×2
- 2–4 visual pairs depending on difficulty
- large cards
- no visible score
- no timer
- no limited moves

### Older mode

Can retain more advanced grids.

### Replace score-first presentation

Primary feedback should be:

`Пронађен пар!`

not a numeric score.

The internal move count may remain for debugging/progress, but should not be visually emphasized for toddlers.

### Power-ups

Keep only if they are visually understandable without reading.

A star should function as a friendly hint rather than a scarce resource.

### Acceptance criteria

The default experience is a simple matching game, not an optimization challenge.

---

# 26. Little Explorer

## Task GAME-EXPLORER-001 — Make exploration the identity

### Current behavior

Canvas side-scroller with touch controls, physics, coins, levels, win state, synthesized audio, character picker, and character-specific death sounds.

### Product direction

The primary purpose should be exploration and motor control, not precision platforming.

### Implement

- make platforms forgiving
- reduce punishment for misses
- allow quick recovery
- avoid repeated forced restarts
- make collectibles visually obvious
- reward movement/exploration
- keep camera smooth
- keep touch zones large

### Character picker

Do not make the character picker a deep customization system.

Use 3–4 characters with clear visual differences.

### Death/fall behavior

A mistake should be a soft reset to a nearby safe point rather than a dramatic death loop.

### Acceptance criteria

A toddler can move around for several minutes without understanding complex rules and still have fun.

---

# 27. Driving

## Task GAME-DRIVE-001 — Emphasize free movement and discovery

### Current behavior

10 worlds, free 2D movement, obstacles, emoji collection, goal, no-fail philosophy.

### Keep

- free movement
- no-fail
- world variety
- collectible discovery
- goal

### Differentiate from Ocean/Space/Dino

Driving should own the concept of:

- steering
- road/path following
- simple traffic awareness
- vehicle exploration

### Add very simple visual navigation

Use:

- road/path color
- large arrow near goal when child is far away
- world landmark

Avoid text instructions.

### Acceptance criteria

The game feels like a vehicle exploration game, not the same adventure engine with a car sprite.

---

# 28. Ocean

## Task GAME-OCEAN-001 — Emphasize fluid exploration

### Goal

Differentiate from Driving by focusing on swimming and spatial movement.

### Add unique mechanics

Possible low-complexity interactions:

- swim above/below objects
- collect bubbles
- touch gentle sea creatures
- reveal hidden sea objects
- enter simple caves

No combat.

No dangerous predator chase.

### Goal guidance

Use bubble trails/light beams/landmarks rather than arrows everywhere.

### Acceptance criteria

Ocean has its own identity and does not feel like “Driving underwater.”

---

# 29. Dino

## Task GAME-DINO-001 — Simplify jump timing for toddlers

### Current behavior

Platformer with jumps and raptors.

### Product direction

Convert from precision platformer toward rhythmical, forgiving jumping.

### Implement

- larger jump timing window
- generous collision forgiveness
- no hard lives
- quick respawn to recent safe position
- visual cue when approaching jump opportunity
- obstacle patterns that can be read visually

### Age progression

Easy mode:

- single obstacle
- clear jump
- large platform

Advanced:

- alternating obstacles
- more varied terrain

### Acceptance criteria

A child who reacts slightly late still gets many successful jumps.

---

# 30. Space

## Task GAME-SPACE-001 — Make vertical/horizontal flight the core skill

### Current behavior

Free 2D flight, obstacles, collections, goals, multiple worlds.

### Add unique interaction identity

Use:

- altitude bands
- floating stars/objects
- gentle portals
- planets as landmarks

Avoid turning it into another obstacle-dodging clone.

### Optional learning hook

Worlds may introduce simple visual concepts:

- big/small planets
- near/far
- up/down
- light/dark sky

Do not interrupt gameplay with quiz questions.

### Acceptance criteria

Space teaches simple spatial movement through play without becoming a classroom worksheet.

---

# 31. Racing3D

## Task GAME-RACE-001 — Preserve current stability and focus on polish

The current Racing3D version has already received substantial bug and accessibility/performance work.

Do not undo or replace current safeguards.

### Preserve current features

- three.js r169 vendored locally
- procedural hilly closed-loop track
- rumble strips
- checkered start
- sky dome/fog
- chase camera
- obstacles
- boosts
- particles
- per-world decor/sky/ambient/weather
- world picker
- kart color selection
- local progression
- no-fail approach
- current reduced-motion support
- current context-loss handling
- current input reset behavior

### Next improvements

#### 31.1 Simplify race UI

A toddler should only need to understand:

- move left/right
- maybe accelerate if a manual control exists
- reach the finish

Do not emphasize lap counts, speed numbers, technical diagnostics, or performance metrics.

#### 31.2 Friendly steering

Keep the current large touch zones.

Add gentle steering assistance near the center of the track.

If the kart approaches the outer boundary:

- apply soft steering correction
- reduce harsh collision response

#### 31.3 Boost readability

Boosts should be obvious through:

- simple shape/color
- glow
- sound
- short motion effect

Do not require text.

#### 31.4 World identity

Each of the 8 worlds should have a stronger visual identity using:

- color palette
- landmark
- sky
- one major environmental motif

Do not simply change background colors.

#### 31.5 Reduced motion

Preserve all current reduced-motion safeguards and extend them to any newly added camera/particle effects.

### Acceptance criteria

Racing3D remains stable on short landscape screens, touch controls remain clear of HUD, and the child can understand the core interaction without reading technical UI.

---

# 32. Adventure Family Architecture

## Task ADV-001 — Keep shared engine, differentiate player goals

Driving, Ocean, Dino, and Space already share an adventure engine.

This is good architecture only if the games feel different to the child.

### Shared engine should provide

- player movement
- collision infrastructure
- camera
- world loading
- checkpoint/recovery
- input handling
- common feedback
- common audio API

### Game-specific layer should provide

- movement model
- obstacles
- goals
- collectibles
- environment
- visual language
- learning hook

### Do not duplicate

Do not copy/paste the engine for each game.

### Acceptance criteria

A bug fix in shared movement can be applied once without duplicating logic across four games.

---

# 33. Educational Coverage Expansion

## Task EDU-001 — Do not add new games until skill gaps are mapped

The current collection already covers:

- animal vocabulary
- number recognition
- basic counting
- shapes
- colors
- alphabet recognition
- matching
- memory
- fine-motor drag
- tracing
- music
- exploration/motor movement

Before creating a new game, map the intended learning skill to this matrix.

### Existing skill coverage map

| Skill | Current coverage | Status |
|---|---|---|
| Animal vocabulary | Animals/Classroom | Covered |
| Animal sounds | Animals/Counting | Covered |
| Number recognition | Counting/Classroom | Covered |
| One-to-one counting | Counting needs improvement | Improve existing |
| Colors | Classroom/Coloring | Covered |
| Shape recognition | Shapes/Classroom | Covered |
| Alphabet recognition | Classroom | Covered |
| Phonics/sound awareness | Limited | Future |
| Fine motor | Shapes/Puzzle/Tracing/Coloring | Covered |
| Matching | Match Game | Covered |
| Memory | Animal Memory | Covered |
| Rhythm | Piano | Partial |
| Spatial concepts | Adventure games | Partial |
| Sorting/classification | Limited | Future |
| Sequencing | Limited | Future |
| More/less/same | Limited | Future |
| Mazes/path following | Limited | Future |

---

# 34. Future Game Candidates

Only implement these when product data/testing shows an actual skill gap.

## FUT-001 — Sorting

Examples:

- red vs blue
- big vs small
- animal vs food
- land vs water

Interaction:

- drag object to one of 2 large baskets
- correct snap
- gentle retry

Avoid more than 2 categories at the beginning.

## FUT-002 — More / Less / Same

Show two groups of objects.

Prompt:

```text
Где има више?
```

Use visual/audio feedback.

Avoid number-heavy presentation at first.

## FUT-003 — Serbian Phonics

Teach sound association such as:

```text
М → миш

Ммм...
```

Focus on sound recognition, not formal reading instruction.

## FUT-004 — Simple Maze / Path

Trace a path through a large, forgiving route.

No timer.

No “dead ends” that feel punitive.

## FUT-005 — Rhythm Imitation

Child hears:

```text
tap — tap — pause — tap
```

Then repeats using 1–3 large buttons/drum surfaces.

Start with two-beat patterns.

## FUT-006 — Spatial Concepts

Teach:

- above/below
- inside/outside
- left/right
- near/far
- in front/behind

Use pictures and movement rather than text.

## FUT-007 — Sequencing

Arrange 2–4 pictures into a simple sequence.

Examples:

- seed → plant → flower
- wash → dry
- morning → night

---

# 35. Local Progress System

## Task PROGRESS-001 — Add anonymous local progress only where useful

Use `localStorage` or an equivalent browser-local store.

Never require accounts.

### Useful progress examples

- visited game
- completed simple activity
- discovered letter
- practiced number
- visited world
- finished puzzle
- unlocked nothing commercial

### Avoid

- leaderboards
- public scores
- competition
- daily streak pressure
- XP grind
- “come back every day” manipulation

### Parent UI

Allow parents to reset progress.

### Acceptance criteria

Progress is optional, local, anonymous, and never required for core play.

---

# 36. PWA and Offline Hardening

## Task PWA-001 — Ensure every standalone page participates correctly in the PWA

The application already has:

- manifest
- service worker
- cache list
- offline manifest

The manifest currently uses:

```json
{
  "name": "Петрин свет",
  "short_name": "Петрин свет",
  "description": "Комплетан пакет дечјих игрица за офлајн употребу — Петрин свет",
  "lang": "sr",
  "start_url": "./index.html",
  "scope": "./",
  "display": "standalone",
  "background_color": "#FFF8ED",
  "theme_color": "#4A3F6B",
  "icons": [192,512]
}
```

### Implement

Ensure every public HTML page that participates in the multi-page PWA references the shared manifest.

Add consistent:

- `rel="manifest"`
- theme color metadata
- viewport metadata
- appropriate mobile web-app behavior where still useful

### Orientation

Manifest orientation may be used for games that clearly require a preferred orientation.

Do not rely on runtime `screen.orientation.lock()` as the only orientation mechanism.

Where landscape is required, provide a friendly rotate hint when the current viewport is unsuitable.

### Acceptance criteria

Opening an individual public page still gives the application consistent PWA metadata and offline behavior.

---

# 37. Offline Cache Integrity

## Task PWA-002 — Treat offline inventory as a build artifact

Every child-facing dependency must be either:

- bundled locally
- included in service-worker cache
- or generated at runtime from local code

### Audit categories

Check:

- HTML pages
- JavaScript
- CSS
- SVG
- PNG/JPG/WebP
- local speech audio
- local music/audio
- three.js/vendor assets
- fonts
- icons
- configuration JSON

### Prohibited for core gameplay

- external CDN dependencies
- remote font dependencies
- remote images
- remote APIs
- analytics calls required for play
- network-loaded speech required for play

### Build report

Extend `tools/build_offline.ps1` or equivalent tooling to output:

```text
Offline package report
----------------------
HTML files: N
JS files: N
CSS files: N
Images: N
Audio: N
Fonts: N
Total files: N
Total bytes: N
Largest assets:
1. ...
2. ...
3. ...
```

### Acceptance criteria

The build visibly reports package size and inventory.

Do not hard-code a total size without measuring the real repository state.

---

# 38. True Offline Play Test

## Task PWA-003 — Add a real network-blocked validation mode

Static cache-list validation is not enough.

The validation process must include a browser run where network access is deliberately blocked.

### Test sequence

1. install/load the application online
2. let service worker activate
3. close/reopen
4. disable/block network
5. open hub
6. open every public game
7. start one round of gameplay
8. test local speech/audio
9. navigate back to hub
10. repeat for all important pages

### Record

For each page:

```text
page | loads offline | starts offline | interaction works | audio works | navigation works
```

### Acceptance criteria

No core public experience requires network after it has been properly cached.

---

# 39. Accessibility

## Task A11Y-001 — Add baseline accessibility without making reading mandatory

### Implement

- semantic buttons where possible
- visible focus states
- `aria-label` for icon-only controls
- useful `alt` text for important images
- live region for dynamic quiz status where appropriate
- keyboard support where practical
- do not rely solely on color to indicate correct/incorrect state

### Child-specific principle

Accessibility improvements must not turn simple child interfaces into dense text interfaces.

The screen can remain visual-first.

---

# 40. Legacy Cleanup

## Task CLEAN-001 — Remove or archive legacy public routes safely

Known legacy items include:

- `racing.html`
- `papper_kitty.html`
- related legacy scripts where no current page requires them

### Process

1. search repository references
2. search hub/menu references
3. search service-worker/cache references
4. search documentation references
5. verify no active app links to them
6. move to an archive location or remove
7. add redirects only if an old public URL should remain valid
8. rebuild offline cache lists
9. rerun all smoke tests

Do not delete files blindly.

### Acceptance criteria

Child-facing navigation exposes only current polished experiences.

---

# 41. Shared Code Refactoring

## Task REF-001 — Centralize repeated helpers

Look for duplicated implementations of:

- sound effects
- speech
- button feedback
- resize handling
- pointer input
- random selection
- success animation
- progress storage
- back navigation
- reduced motion

Create small shared modules, not a giant framework.

### Rule

A shared helper should be extracted when at least two or three pages already use the same concept and extraction does not make the child-facing code harder to understand.

### Avoid

A giant `utils.js` containing unrelated behavior.

Prefer small modules:

```text
shared/
  audio.js
  speech.js
  feedback.js
  input.js
  navigation.js
  motion.js
  progress.js
```

Exact paths may be adapted to the repository's existing structure.

---

# 42. Testing Roadmap

## Task TEST-001 — Expand smoke tests from “loads” to “plays”

Each game smoke test should eventually cover:

1. page loads
2. main UI appears
3. first interaction works
4. correct interaction works
5. wrong interaction works
6. replay/next works
7. back works
8. audio-disabled state does not break game
9. resize/orientation does not break game

---

## Task TEST-002 — Add touch interruption tests

For drag games test:

- pointerdown
- pointermove
- pointerup
- pointercancel
- lostpointercapture
- pointer leaves viewport
- second finger
- page hidden
- orientation change

For movement games test:

- touch start
- hold
- release
- interrupted release
- focus change
- orientation change

---

## Task TEST-003 — Add representative visual regression testing

Capture screenshots for representative pages in multiple sizes.

Recommended representative set:

- hub
- Animals
- Classroom
- Shapes
- Coloring
- Tracing
- Animal Memory
- Animal Puzzle
- Piano
- Match Game
- one adventure game
- Racing3D

Compare:

- overlaps
- clipped buttons
- broken images
- unreadable text
- off-screen controls
- unexpected horizontal scroll
- incorrect canvas scaling

---

# 43. QA Matrix

Every release should test this matrix.

| Dimension | Cases |
|---|---|
| Device | phone / tablet / desktop |
| Orientation | portrait / landscape |
| Input | touch / mouse / keyboard where practical |
| Motion | normal / reduced motion |
| Audio | enabled / disabled |
| Network | online / offline |
| Navigation | direct URL / hub navigation / browser back |
| Interaction | tap / drag / long press / interrupted gesture |
| Visibility | active / hidden / restored |
| PWA | browser tab / standalone installed mode |

Minimum critical play matrix:

- 390×844
- 844×390
- 820×1180
- 1180×820
- 1280×800

---

# 44. Definition of Done for Any Game Change

A game improvement is complete only when all are true:

### Product

- interaction remains toddler-friendly
- no unnecessary reading is required
- no punishment mechanics were added
- learning purpose is clear
- visual identity matches Petrin svet

### Touch

- large targets
- no stuck input
- interruption safe
- two-finger accidental input does not break the state

### Layout

- works at target viewport sizes
- no overlap
- no horizontal scrolling
- safe-area aware when necessary

### Audio

- important sounds are local
- speech is local-first where available
- no audio requirement blocks gameplay

### Motion

- reduced motion is respected

### Offline

- files are cached
- game starts offline after cache installation
- gameplay interaction works offline

### QA

- relevant smoke passes
- relevant play matrix passes
- no regression in shared systems

### Docs

- changed behavior documented where appropriate
- offline inventory updated if assets changed
- roadmap/task status updated

---

# 45. Implementation Phases

## Phase 1 — Product Cohesion v1

Implement in this exact sequence:

### 1.1 Shared design tokens

Files:

- shared CSS/token files

Outcome:

- one visual vocabulary

### 1.2 Shared navigation

Outcome:

- one back/home behavior

### 1.3 Shared feedback/audio

Outcome:

- one sound/feedback vocabulary

### 1.4 Reduced motion

Outcome:

- global support

### 1.5 Touch/input helpers

Outcome:

- robust pointer behavior

### 1.6 Responsive/safe-area rules

Outcome:

- predictable layouts

### 1.7 Parent area

Outcome:

- technical features separated from children

### 1.8 Hub redesign

Outcome:

- child-first launcher

---

# 46. Phase 2 — Toddler Adaptation v1

Priority games:

1. Animals
2. Animal Counting
3. Shapes
4. Animal Memory
5. Animal Puzzle
6. Coloring
7. Tracing
8. Classroom
9. Piano
10. Match Game

Do not add many new games during this phase.

The objective is to make the current games genuinely excellent for the target age.

---

# 47. Phase 3 — Adventure Differentiation

Improve:

- Little Explorer
- Driving
- Ocean
- Dino
- Space
- Racing3D

Shared engine infrastructure should remain centralized.

Each game must receive a distinct interaction identity.

---

# 48. Phase 4 — Offline/PWA Hardening

Implement:

- full manifest consistency
- offline inventory report
- true network-blocked play tests
- cache/version strategy review
- asset size review
- offline parent status page

---

# 49. Phase 5 — Cleanup and Quality

Implement:

- legacy cleanup
- asset consistency
- repeated helper extraction
- screenshot regression tests
- full release QA matrix
- documentation cleanup

---

# 50. Phase 6 — Future Learning Expansion

Only after phases 1–5 are stable, evaluate:

1. sorting
2. more/less/same
3. Serbian phonics
4. simple mazes/path following
5. rhythm imitation
6. spatial concepts
7. sequencing

Prioritize the skill that existing apps cannot cover well.

Do not add a new game merely because the project has room for another icon on the home screen.

---

# 51. Suggested File/Module Structure

Do not force this structure if it conflicts with working repository conventions. Use it as the target architecture.

```text
game/
├── index.html
├── manifest.json
├── sw.js
├── sw-cache-list.json
├── offline-manifest.json
│
├── pages/
│   ├── animals.html
│   ├── animal_counting.html
│   ├── animal_memory.html
│   ├── animal_puzzle.html
│   ├── classroom.html
│   ├── coloring.html
│   ├── dino.html
│   ├── driving.html
│   ├── ocean.html
│   ├── piano.html
│   ├── racing3d.html
│   ├── shapes.html
│   ├── space.html
│   └── tracing.html
│
├── shared/
│   ├── audio.js
│   ├── feedback.js
│   ├── input.js
│   ├── motion.js
│   ├── navigation.js
│   ├── progress.js
│   ├── speech.js
│   └── viewport.js
│
├── data/
│   └── serbian.js
│
├── styles/
│   ├── design-tokens.css
│   ├── components.css
│   └── layout.css
│
├── assets/
│   ├── animals/
│   ├── mascot/
│   ├── classroom/
│   ├── puzzle/
│   └── icons/
│
└── games/
    ├── adventure.js
    ├── adventure-modes.js
    ├── adventure-music.js
    ├── animal_counting.js
    ├── animal_memory.js
    ├── animal_puzzle.js
    ├── animals.js
    ├── classroom.js
    ├── coloring.js
    ├── dino.js
    ├── driving.js
    ├── kids_games.js
    ├── ocean.js
    ├── piano.js
    ├── racing3d.mjs
    ├── shapes.js
    ├── space.js
    └── tracing.js
```

This is a direction rather than a requirement to physically move all files immediately.

---

# 52. Engineering Principles for Canvas Games

Apply to all canvas-based games.

## Rendering

- scale canvas for devicePixelRatio without exceeding practical memory budgets
- separate logical game coordinates from physical pixels
- recalculate on resize
- keep touch coordinates in logical coordinates

## Input

- use Pointer Events
- use pointer capture during drag/hold
- clear active pointers on `pointercancel`
- clear input on `visibilitychange`
- reset after orientation changes

## Performance

Avoid creating large numbers of short-lived objects each frame.

Prefer:

- object pools when needed
- capped particle systems
- cached geometry
- deterministic update loops

Do not optimize prematurely; profile before introducing complexity.

## Accessibility

For a canvas game, provide HTML controls for critical navigation and a visible non-canvas way to return home.

Do not pretend canvas itself is accessible simply because an `aria-label` exists.

---

# 53. Engineering Principles for DOM Games

For DOM-based games:

- use semantic `<button>` for interactive controls
- prevent accidental text selection during drag gameplay where appropriate
- use `touch-action` deliberately
- avoid click-only logic when pointer interaction is expected
- make buttons large enough
- avoid nested interactive controls
- preserve focus behavior after dynamic updates

---

# 54. Child UX Rules by Age

The repository targets approximately ages 2–6, but one interface should not try to teach every age identically.

## Ages ~2–3

Prioritize:

- 1–3 objects
- 2 choices
- giant controls
- immediate sound
- exploration
- no score
- no timer
- no reading
- almost no failure state

## Ages ~3–4

Add:

- 3–5 objects
- 3 choices
- simple matching
- basic recognition prompts
- short multi-step interactions

## Ages ~4–6

Add:

- 1–10 counting
- alphabet activities
- simple sequencing
- larger memory boards
- quiz questions
- more complex puzzles
- guided song play

This does not require a visible age-selection screen.

Difficulty can adapt automatically or use a very simple parent setting.

---

# 55. Adaptive Difficulty Without Pressure

Use hidden or local difficulty progression based on success patterns.

Example:

```text
3 successful rounds → slightly harder
2 repeated misses → slightly easier
```

Do not display this as a score/rating.

### Good adaptations

- increase choices from 2 → 3
- increase object count
- reduce target size slightly
- add one more puzzle piece
- make arrangement less regular

### Bad adaptations

- reduce lives
- speed up timers
- reset progress
- shame/punish for mistakes
- lock basic content behind failure

---

# 56. Completion Screen Standard

Every game completion should feel like the same product.

### Standard structure

```text
[happy visual / mascot]

Браво!

[Replay]   [Next]
```

Use visual-first actions.

Possible buttons:

```text
🔁 Поново
➡️ Следеће
🏠 Почетна
```

Do not show a large numerical score unless the specific experience genuinely teaches counting/quantitative concepts.

---

# 57. Error Prevention and Recovery

Every game must answer the question:

> What happens if a toddler does something unexpected?

Examples:

### Drag game

If released outside board:

- return to origin or nearest safe location
- do not freeze

### Adventure movement

If touch is interrupted:

- stop movement immediately

### Piano

If many keys are pressed:

- allow simple polyphony or gracefully ignore excess input
- never lock the UI

### Memory

If a third card is tapped:

- ignore while the pair resolution is in progress

### Tracing

If finger leaves screen:

- end current stroke
- preserve previous strokes

### Racing3D

If controls lose focus:

- reset steering/acceleration to safe neutral values

---

# 58. Parent-Friendly Transparency

Parents should be able to understand the product without seeing engineering internals.

Parent information should clearly explain:

- free
- no ads
- no purchases
- offline capable
- no account required
- progress stored locally, if enabled
- update state
- current app version

Avoid technical wording like:

```text
Service Worker Cache API
```

unless presented under an optional diagnostics section.

---

# 59. Build and Release Process

## Task REL-001 — Define one release gate

Before release:

1. update version metadata
2. rebuild offline lists
3. run repository-wide checks
4. run all smoke tests
5. run play matrix
6. run offline network-blocked test
7. verify hub links
8. verify manifest references
9. verify no remote asset dependencies
10. inspect representative screenshots

### Release should fail when

- public page is unreachable
- required local asset missing
- service worker references missing asset
- game cannot start
- main touch flow is broken
- back navigation is broken
- critical control is off-screen
- offline startup fails

---

# 60. Documentation Updates

Whenever a task changes architecture, update:

- README
- relevant game documentation
- offline build documentation
- testing documentation

The README should describe current behavior, not historical bugs that have already been fixed.

Do not leave stale warnings such as already-fixed Racing3D issues in current documentation.

---

# 61. Exact Task Backlog

Use these task IDs as implementation tracking keys.

## Foundation

- `DS-001` Shared design tokens
- `NAV-001` Unified navigation
- `FB-001` Shared feedback vocabulary
- `MOTION-001` Global reduced motion
- `TOUCH-001` Pointer/touch standard
- `DEVICE-001` Responsive/safe-area rules
- `AUDIO-001` Shared audio buses/priorities
- `LANG-001` Serbian language data layer
- `BRAND-001` Mascot system
- `ART-001` Local illustration strategy

## Product shell

- `HUB-001` Toddler-first hub
- `PARENT-001` Parent area
- `PROGRESS-001` Optional local progress

## Learning games

- `GAME-ANIMALS-001` Animal recognition mode
- `GAME-COUNT-001` One-to-one counting
- `GAME-SHAPES-001` Magnetic shape placement
- `GAME-MEMORY-001` Age-aware memory
- `GAME-PUZZLE-001` Magnetic puzzle placement
- `GAME-COLOR-001` Split coloring modes
- `GAME-TRACING-001` Developmental tracing
- `GAME-CLASS-001` Calm classroom hub
- `GAME-PIANO-001` Free-play-first piano
- `GAME-MATCH-001` Toddler-first matching

## Adventure

- `GAME-EXPLORER-001` Exploration-first Explorer
- `GAME-DRIVE-001` Driving identity
- `GAME-OCEAN-001` Ocean identity
- `GAME-DINO-001` Forgiving jump timing
- `GAME-SPACE-001` Spatial flight identity
- `GAME-RACE-001` Racing3D polish only
- `ADV-001` Shared adventure engine boundary

## Infrastructure

- `PWA-001` Manifest consistency
- `PWA-002` Offline inventory/report
- `PWA-003` True offline play testing
- `A11Y-001` Accessibility baseline
- `CLEAN-001` Legacy cleanup
- `REF-001` Shared helper extraction

## Testing/release

- `TEST-001` Play-aware smoke tests
- `TEST-002` Touch interruption tests
- `TEST-003` Visual regression
- `REL-001` Release gate

## Future learning

- `FUT-001` Sorting
- `FUT-002` More/Less/Same
- `FUT-003` Serbian phonics
- `FUT-004` Maze/path following
- `FUT-005` Rhythm imitation
- `FUT-006` Spatial concepts
- `FUT-007` Sequencing

---

# 62. Dependency Graph

Use this dependency order:

```text
DS-001
  ↓
NAV-001 ─────┐
FB-001 ──────┤
AUDIO-001 ───┤
LANG-001 ────┤
MOTION-001 ──┤
TOUCH-001 ───┤
DEVICE-001 ──┤
              ↓
         HUB-001 + PARENT-001
              ↓
      Core educational games
              ↓
        Adventure polish
              ↓
   PWA-001 + PWA-002 + PWA-003
              ↓
     TEST-001 + TEST-002 + TEST-003
              ↓
         CLEAN-001 / REF-001
              ↓
        Future skill-gap games
```

Do not build future games ahead of the foundation unless there is a specific reason documented in the task tracker.

---

# 63. What Not to Do

Do not:

- add ads
- add purchases
- add accounts
- add online multiplayer
- add cloud saves
- add leaderboards
- add daily streaks
- add lives/hearts/energy
- add aggressive timers
- add punishment for mistakes
- make the child wait for speech/network
- depend on external CDNs for core play
- make reading necessary to understand a basic game
- replace the current codebase with a heavy framework without an explicit architecture decision
- add dozens of near-identical games
- make every adventure game a reskin of the same mechanic
- make every learning game a multiple-choice quiz
- make tracing a handwriting examination
- turn coloring into only a “correct answer” activity
- expose developer/offline diagnostics on the child-facing home screen

---

# 64. Most Important Product Principle

When choosing between:

```text
more content
```

and

```text
better existing experiences
```

prefer better existing experiences until the current portfolio has:

- consistent interaction
- consistent art
- consistent sound
- consistent navigation
- reliable touch behavior
- robust offline behavior
- clear developmental progression
- good parent controls

The project already has a meaningful amount of content.

The next major product milestone is **cohesion and quality**, not quantity.

---

# 65. Final Definition of “Петрин свет v1 Cohesive”

The product can be considered cohesive when all of the following are true:

### Child experience

- the hub is understandable from pictures
- each game starts quickly
- basic gameplay requires little/no reading
- the child can make mistakes safely
- feedback is consistent
- every game feels visually related
- navigation is predictable

### Educational experience

- numbers actually involve counting
- shapes actually involve matching and spatial reasoning
- tracing supports pre-writing development
- coloring supports both matching and creativity
- animals support recognition and vocabulary
- Classroom remains a calm reference/learning space
- advanced quiz mechanics are not forced on toddlers

### Device experience

- touch works reliably
- no stuck drags
- no stuck movement
- no hidden critical controls
- tablet landscape is excellent
- phone landscape is excellent
- smaller portrait screens remain usable or explain rotation
- reduced motion works

### Offline experience

- app loads offline after caching/install
- every public game can start offline
- local speech/audio still works
- no core remote dependencies exist
- cache inventory is measurable and tested

### Parent experience

- technical controls are separated
- offline state is visible
- version is visible
- progress can be reset intentionally
- no account is needed

### Engineering experience

- shared systems are actually shared
- smoke tests cover behavior, not just page existence
- touch interruptions are tested
- representative screenshots are regression-tested
- documentation reflects current code
- legacy routes are controlled

---

# 66. Immediate Next Actions for the Coding AI

Execute these first, in order:

## Step A

Inventory the current shared CSS/JS structure and identify where shared tokens, audio, speech, feedback, navigation, and input can be introduced without breaking existing pages.

Do not make architectural changes before confirming actual current import/reference patterns.

## Step B

Implement `DS-001`, `NAV-001`, `FB-001`, `MOTION-001`, `TOUCH-001`, and `DEVICE-001`.

Run affected tests.

## Step C

Implement `PARENT-001` and `HUB-001` so technical controls are separated from the child-facing launcher.

Run hub smoke + play matrix.

## Step D

Implement the learning improvements in this order:

1. `GAME-COUNT-001`
2. `GAME-TRACING-001`
3. `GAME-MEMORY-001`
4. `GAME-PUZZLE-001`
5. `GAME-SHAPES-001`
6. `GAME-COLOR-001`
7. `GAME-ANIMALS-001`
8. `GAME-MATCH-001`
9. `GAME-CLASS-001`
10. `GAME-PIANO-001`

## Step E

Apply the adventure identity work through `ADV-001` and the individual adventure tasks.

## Step F

Harden offline/PWA behavior with `PWA-001`, `PWA-002`, and `PWA-003`.

## Step G

Run `TEST-001`, `TEST-002`, `TEST-003`, then `REL-001`.

## Step H

Only after the above is stable, evaluate the future educational backlog.

---

# 67. Implementation Reporting Format

For each completed task, the coding AI should report using this structure in its development log/PR description:

```text
Task: DS-001
Status: DONE

Changed:
- path/to/file
- path/to/file

Behavior:
- exact behavior that changed

Tests:
- command or test name
- result

Manual QA:
- viewport(s)
- interaction(s)
- offline/online state

Regressions checked:
- relevant shared pages

Notes:
- any intentional deviation from roadmap
```

Do not report only “implemented”. State what changed and how it was verified.

---

# 68. External Technical References

These references support implementation details around PWA manifests, standalone display, orientation preferences, and Pointer Events.

- MDN — Web App Manifest: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest
- MDN — `display` manifest member: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/display
- MDN — `orientation` manifest member: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/orientation
- MDN — Screen Orientation API: https://developer.mozilla.org/en-US/docs/Web/API/ScreenOrientation
- MDN — Pointer Events: https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events

Use current browser support and current repository constraints when implementing these features; do not add runtime orientation locking merely because the manifest declares a preferred orientation.

---

# 69. Final Instruction to the Implementing AI

Treat this document as an executable product roadmap.

Do not ask the product owner to make decisions that are already specified here.

When implementation details are not explicitly constrained, choose the smallest change that preserves:

1. toddler usability
2. Serbian/Cyrillic language consistency
3. offline-first behavior
4. no-cost/no-ad philosophy
5. touch robustness
6. visual cohesion
7. current repository architecture
8. automated testability

The target is not to create the largest children's game collection.

The target is to make **Петрин свет** feel like one polished, trustworthy, joyful children's product built from many small experiences.
