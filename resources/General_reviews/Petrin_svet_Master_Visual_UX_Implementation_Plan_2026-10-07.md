# Петрин свет — Master Visual / UX Implementation Plan
## Second-pass implementation specification for the implementation AI
### Version 2026-10-07 — authoritative visual/UX follow-up

> **Document purpose**
>
> This document is the implementation handoff for the next visual/UX elevation of **Петрин свет**.
> It is intentionally more prescriptive than a normal design review. The implementation AI should
> not have to repeatedly decide what the product should mean, what belongs in the shared shell,
> how responsive behavior should work, or which visual problems have priority.
>
> The implementation AI is expected to:
>
> 1. use this document together with the current repository as the source of truth;
> 2. inspect the actual code before editing;
> 3. preserve already-completed functionality;
> 4. implement the shared system before duplicating page-specific fixes;
> 5. verify every screen-changing change through the existing smoke/test/screenshot workflow;
> 6. update the screenshot review assets after meaningful UI changes;
> 7. never resurrect obsolete tasks simply because an older roadmap mentions them.
>
> **Important:** this is a **visual/UX implementation specification**, not a replacement for the
> project's functional requirements. Gameplay correctness, Serbian content, offline behavior,
> accessibility, audio behavior and CI remain release requirements and must not regress.

---

# 0. Executive decision

## 0.1 The product problem is now consistency, not lack of personality

The current application already has a recognizable identity:

- warm cream base;
- plum structure/navigation;
- pastel green, pink, sky, yellow and violet accents;
- rounded shapes;
- large touch targets;
- soft depth;
- friendly child-facing language;
- multiple activities with distinct mechanics;
- strong individual worlds in several games.

The next quality jump must therefore **not** be another wholesale redesign.

The product should evolve from:

> “many games that happen to use similar colors”

into:

> **“one cozy children's world containing many different activities.”**

That distinction is the central design decision of this document.

Do **not** make every game look identical.

Instead, standardize:

- shell/chrome;
- hierarchy;
- header geometry;
- navigation;
- touch interaction;
- semantic feedback;
- motion language;
- typography roles;
- safe-area behavior;
- responsive behavior;
- state presentation;
- modal treatment;
- iconography.

Allow each activity to retain its own:

- world;
- stage composition;
- toys;
- cards;
- canvas;
- scenery;
- characters;
- mechanic-specific visual language.

---

# 1. Current-state truth

This section exists to prevent the implementation AI from following stale plans.

## 1.1 Current repository facts

At the time of this document:

- current main HEAD is `0e5bb532e1100573900e5dacf334c9f7a2d45175`;
- latest commit is the screenshot-review / parent-smoke fix work;
- the public app registry exists at:
  `game/data/app-registry.js`;
- the registry is the source of truth for routes/tests/screenshots/offline;
- there are 24 public game/parent pages plus the hub;
- screenshot review contains 100 screenshots:
  - hub + 24 pages;
  - phone portrait 390×844;
  - phone landscape 844×390;
  - tablet portrait 820×1180;
  - tablet landscape 1180×820;
- `TABLE_OF_CONTENT.md`, `capture-manifest.json` and `screenshot-provenance.json` support the screenshot review;
- Task 213 requires affected screenshots to be refreshed after screen-changing tasks;
- Task 214 fixed the CI `parent_smoke` boot crash;
- the full tool suite previously reached 34/34 tools and 835 checks;
- `check_fast` reached 7/7 green.

These facts are authoritative for this implementation pass.

## 1.2 Already completed — do not reimplement

The following are already implemented and must be treated as existing functionality:

### Numbers

- recognition 1–20 is implemented;
- Serbian number audio exists;
- quantity 11–20 remains deliberately deferred until recognition is sufficiently established.

### Phonics

- the full 30-letter Serbian Cyrillic alphabet is implemented;
- starting-word associations have been corrected.

### Time / seasons

- time/seasons learning content is implemented.

### Sequencing / science

- plant-growth sequencing was expanded;
- there are 8 plant-growth sequences;
- habitats/world/continents are not a current requirement.

### Spatial

- Spatial has 15 rounds.

### Rhythm

- Rhythm has been rewritten as a 4-pad drum set;
- free-play exists;
- repeat-melody exists;
- melody length grows from 2 to 6.

### Navigation

- back arrows use the canonical Material `arrow_back` SVG.

### Racing3D

- steering direction/root cause was fixed.

### Classroom

- the lower activity grid clipping problem from Task 209 was fixed.

### Parent smoke

- Task 214 fixed the boot crash by enabling `Page`, `Runtime` and `Network` inside the boot retry loop.

### Animal visuals

Native emoji are currently the preferred animal representation because previous custom SVG animal artwork did not meet the desired visual quality.

**Do not replace native emoji with Twemoji or a new custom animal set as a default task.**
That decision requires actual visual/playtesting evidence and is not a prerequisite for the current visual elevation.

---

# 2. What this plan is allowed to change

## 2.1 High-priority change categories

The implementation AI should concentrate on:

1. shared child-page shell;
2. header and safe-area geometry;
3. short-landscape layouts;
4. learning-stage visual grammar;
5. adventure-stage visual grammar;
6. tactile controls;
7. semantic feedback;
8. Petrin Glow;
9. motion;
10. visual state coverage;
11. per-game visual elevation;
12. parent utility hierarchy;
13. screenshot/visual QA.

## 2.2 What must not happen

Do not:

- introduce accounts;
- introduce advertising;
- introduce IAP;
- introduce cloud dependency;
- introduce competitive leaderboards;
- introduce coins/gems/reward economy;
- introduce lives;
- introduce punitive failure screens;
- add unnecessary levels merely for progression;
- add complicated settings to child screens;
- add long reading passages;
- add persistent technical/debug UI;
- replace every illustration just for the sake of novelty;
- flatten every game into the same card-grid design;
- make every game circular;
- make every button purple;
- use yellow as a generic brand color;
- use green to mean anything other than positive/correct/safe;
- use pink as a generic error color;
- add permanent instructional text when the mechanic can be understood visually.

---

# 3. Product visual architecture

Every child-facing page should be understood as three layers.

## 3.1 Layer A — Product shell

This is the part that tells the child:

> “You are still inside Петрин свет.”

It includes:

- safe-area handling;
- back navigation;
- title;
- optional subtitle;
- optional status;
- optional utility controls;
- modal treatment;
- global interaction feedback.

The shell is the strongest shared visual contract.

## 3.2 Layer B — Activity stage

This is where the game gets its personality.

Examples:

- ocean;
- space;
- road;
- garden;
- piano studio;
- coloring canvas;
- classroom;
- memory cards;
- puzzle scene.

The stage can and should differ substantially between games.

## 3.3 Layer C — Interaction language

This is how the child learns what is interactive.

Shared interaction language includes:

- obvious tappability;
- generous targets;
- press compression;
- clear selection;
- gentle hint;
- success feedback;
- calm retry;
- predictable drag behavior;
- immediate response.

The stage may differ.
The interaction language must not.

---

# 4. Three visual families

The games should visually fall into three families without becoming rigid templates.

## 4.1 Learning family

Examples:

- Animals;
- Animal Counting;
- Animal Memory;
- Animal Puzzle;
- Classroom;
- Compare;
- Phonics;
- Sequencing;
- Shapes;
- Sorting;
- Spatial;
- Tracing.

Desired feeling:

- calm;
- bright;
- curious;
- understandable;
- slightly tactile;
- “paper/card/play mat” rather than software dashboard.

Primary visual material:

- cream;
- soft paper cards;
- rounded trays;
- quiet shadows;
- plum typography.

## 4.2 Create family

Examples:

- Coloring;
- Piano;
- Rhythm.

Desired feeling:

- playful studio;
- immediate manipulation;
- satisfying touch;
- colorful but controlled.

The controls themselves can become part of the toy.

## 4.3 Adventure family

Examples:

- Dino;
- Driving;
- Ocean;
- Space;
- Explorer;
- Maze;
- Racing3D.

Desired feeling:

- world;
- journey;
- toy;
- movement;
- discovery.

These screens may be more immersive and less card-like.

---

# 5. Shared visual tokens

The existing design tokens are the foundation.

## 5.1 Core palette

Use the established values:

| Role | Token / value | Meaning |
|---|---|---|
| Cream | `#FFF8ED` | calm base |
| Plum | `#4A3F6B` | structure, navigation, brand |
| Plum soft | `#655A8C` | secondary structure |
| Sky | `#4FC3F7` | movement, utility |
| Blue | `#2FA6DA` | secondary movement |
| Yellow | `#FFD23F` | attention, continue, selected |
| Green | `#67C971` | correct, safe, positive |
| Pink | `#FF6F91` | playful, creative |
| Violet | `#9B6DFF` | learning, focus, magic |

## 5.2 Semantic rules

### Plum

Use for:

- back;
- titles;
- structural controls;
- navigation;
- important text;
- shared shell.

Do not use it for every decorative object.

### Yellow

Use for:

- selected;
- “continue”;
- attention;
- important next action.

Do not use it as the universal success color.

### Green

Use for:

- correct;
- completed;
- safe;
- positive confirmation.

### Pink

Use for:

- creative;
- playful;
- expressive;
- decorative emphasis.

### Sky / blue

Use for:

- movement;
- navigation utility;
- water;
- transport;
- active environmental elements.

### Violet

Use for:

- learning;
- focus;
- magical/curious states;
- selected learning content.

## 5.3 Petrin Glow

Introduce a restrained product signature:

> **Petrin Glow = a subtle plum/violet edge or ambient glow indicating attention, focus, expected interaction or active selection.**

It is not a success color.

Use it for:

- current card;
- expected placement;
- selected object;
- active control;
- hint target;
- focus.

Do not:

- make every button glow;
- animate it continuously;
- use it for errors;
- replace semantic green/yellow states with glow.

---

# 6. Material language

There should be a small number of material metaphors.

## 6.1 Soft paper

Use for:

- learning cards;
- instruction strips;
- classroom items;
- parent informational groups.

Properties:

- cream/light surface;
- soft border;
- shallow shadow;
- moderate radius.

## 6.2 Toy plastic

Use for:

- large game controls;
- piano keys;
- rhythm pads;
- candy/matching objects;
- sorting containers.

Properties:

- stronger shape;
- slightly stronger bottom shadow;
- pressed state visibly changes depth;
- high visual affordance.

## 6.3 World surface

Use for:

- ocean;
- space;
- driving;
- maze;
- explorer;
- racing.

Properties:

- environmental background;
- fewer UI cards;
- controls float above the world;
- shell remains recognizable but quiet.

## 6.4 Parent utility surface

Use for:

- parent dashboard;
- progress;
- settings;
- diagnostic information.

Properties:

- flatter;
- denser;
- calm;
- readable;
- less toy-like.

The parent page should never look like developer tooling.

---

# 7. Typography contract

Do not attempt to solve consistency by using one font size everywhere.

Instead define roles.

## 7.1 Title

Purpose:

- identify current activity.

Characteristics:

- strong;
- short;
- highly legible;
- never competes with back button.

## 7.2 Instruction

Purpose:

- tell the child what to do.

Characteristics:

- short;
- larger than status;
- positioned close to the relevant interaction.

## 7.3 Status

Examples:

- round count;
- selected mode;
- score-like noncompetitive progress;
- “1 од 5”.

Characteristics:

- smaller;
- secondary;
- never allowed to crowd title.

## 7.4 Action label

Examples:

- “Поново”;
- “Настави”;
- “Слушај”;
- “Покажи”.

Characteristics:

- large enough to recognize;
- centered;
- high contrast.

## 7.5 Parent text

Parent text may be denser than child UI.

Never force child-sized typography onto the parent dashboard.

---

# 8. Header contract

This is one of the highest-priority implementation tasks.

## 8.1 Canonical conceptual markup

New or refactored child pages should converge toward:

```html
<header class="ps-header">
  <div class="ps-header-left">
    <button class="back-btn" aria-label="Назад">
      <!-- canonical arrow_back SVG -->
    </button>
  </div>

  <div class="ps-header-center">
    <h1 class="ps-title">...</h1>
    <div class="ps-subtitle">...</div>
    <div class="ps-status">...</div>
  </div>

  <div class="ps-header-right">
    <!-- optional utility -->
  </div>
</header>
```

Recommended shell classes:

- `.ps-shell`
- `.ps-header`
- `.ps-header-left`
- `.ps-header-center`
- `.ps-header-right`
- `.ps-title`
- `.ps-subtitle`
- `.ps-status`

The implementation AI may adapt the markup where a canvas/world needs different structure, but the geometry contract remains.

## 8.2 Header geometry

The header must have:

- a dedicated left zone;
- a flexible center zone;
- a dedicated right zone;
- no absolute-positioned title that ignores the back button;
- no utility control placed on top of the title;
- no title that depends on a particular viewport width.

The center zone must be allowed to shrink.

Long titles must not collide with:

- back button;
- status;
- mode toggle;
- right-side utility.

## 8.3 Small-screen title strategy

At phone portrait and phone landscape:

- title may stack with status;
- subtitle may disappear if redundant;
- right utility may move below the header or into a compact secondary row;
- the title may reduce one step in size;
- the back button remains full-size.

Do not solve collision by shrinking the back button below the existing touch-target standard.

---

# 9. Safe-area contract

Use CSS environment variables rather than page-specific approximations.

Recommended foundation:

```css
:root {
  --ps-safe-top: env(safe-area-inset-top, 0px);
  --ps-safe-right: env(safe-area-inset-right, 0px);
  --ps-safe-bottom: env(safe-area-inset-bottom, 0px);
  --ps-safe-left: env(safe-area-inset-left, 0px);
}
```

Then compose layout spacing around these values.

For example:

```css
.ps-shell {
  padding:
    calc(var(--ps-safe-top) + var(--ps-space-3))
    calc(var(--ps-safe-right) + var(--ps-space-3))
    calc(var(--ps-safe-bottom) + var(--ps-space-3))
    calc(var(--ps-safe-left) + var(--ps-space-3));
}
```

Do not create several competing safe-area systems.

Do not let individual pages invent their own `top: 4vmin` title strategy.

`viewport-fit=cover` is appropriate when the application intentionally uses the full viewport, but content must then honor safe-area insets.

Reference: MDN documents `safe-area-inset-*` as the browser-provided insets intended to prevent important content from being obscured on non-rectangular displays.

---

# 10. Responsive contract

There are four canonical review viewports.

| Device | Size | Priority |
|---|---:|---|
| Phone portrait | 390×844 | required |
| Phone landscape | 844×390 | **critical** |
| Tablet portrait | 820×1180 | required |
| Tablet landscape | 1180×820 | **primary** |

## 10.1 Tablet landscape

This is the premium experience.

Target:

- generous stage;
- obvious main interaction;
- comfortable spacing;
- no wasted giant dead zones;
- child can see the full activity without scrolling.

## 10.2 Tablet portrait

Must remain fully usable.

Target:

- title hierarchy intact;
- board/tray does not collide;
- vertical whitespace is intentional;
- no important control pushed below the fold.

## 10.3 Phone portrait

Prioritize:

1. back;
2. title;
3. instruction;
4. main mechanic;
5. essential action.

Reduce or relocate:

- secondary status;
- decorative objects;
- optional mode controls.

## 10.4 Phone landscape

This is not “phone portrait but shorter.”

Treat it as a distinct composition.

Primary rule:

> **Everything essential must fit in the 390 px height budget without requiring scrolling.**

This is where the current product has the highest concentration of visual debt.

---

# 11. Short-landscape layout rules

For 844×390:

## 11.1 Header budget

Keep the shell visually compact.

Approximate conceptual budget:

- safe-area + header: 56–72 px;
- main stage: remaining height;
- controls: integrated into stage edges where possible.

Do not stack:

- title;
- subtitle;
- status;
- mode selector;
- back;
- utility row

all above the game.

## 11.2 Board-first rule

If the game is board-based:

> Fit the complete board before decorative UI.

Examples:

- Memory: all cards;
- Matching: all 16 cards;
- Sorting: all destinations + tray;
- Puzzle: complete active scene;
- Sequencing: all sequence items;
- Counting: animals + answer choices.

## 11.3 No accidental clipping

Never accept:

- a tray with last item cut off;
- a bottom button partially visible;
- a board cropped by the viewport;
- a title behind a button;
- controls hidden behind a modal;
- score/status overlapping content.

---

# 12. Touch and interaction contract

The existing global button minimum of 64×64 is intentionally more generous than the WCAG 2.2 AA minimum target size of 24×24 CSS px.

Keep the project's larger child-first target philosophy.

## 12.1 Target sizes

Defaults:

- primary child action: 72–96 px visual/touch area where space allows;
- normal child button: minimum 64×64;
- hub button: approximately 96×96;
- back button: existing 56×56 minimum visual contract, with sufficient surrounding hit area;
- small utility icon: may be visually smaller only if its effective hit target remains generous.

Do not reduce touch targets to “make everything fit.”

If space is insufficient, simplify or relocate the UI.

## 12.2 Press state

Every tappable control should have a perceptible press response:

- 2–4% compression or depth change;
- shadow reduction;
- optional tiny opacity change;
- response under roughly one frame when possible.

Avoid dramatic bouncing.

## 12.3 Pointer behavior

For drag/manipulation activities:

- use Pointer Events;
- use pointer capture where appropriate;
- handle `pointerup`;
- handle `pointercancel`;
- handle `lostpointercapture`;
- handle `blur`;
- clear active input when a modal opens;
- clear active input on visibility changes.

Do not allow a stuck pointer to leave a vehicle steering, drag item, piano key or rhythm pad active.

MDN notes that pointer capture retargets subsequent pointer events to the captured element and that capture is released on `pointerup`/`pointercancel`; `pointercancel` can also occur when the browser takes over for panning/zooming or when the app loses the active interaction.

---

# 13. Feedback contract

The application should teach through immediate, low-pressure feedback.

## 13.1 Correct

Use:

- green;
- subtle Petrin Glow;
- tiny bounce or scale;
- success chime;
- short positive phrase where useful.

Do not:

- flash the whole screen;
- play a long victory sequence;
- interrupt the next interaction.

## 13.2 Incorrect

Use:

- gentle miss;
- tiny wobble;
- calm sound;
- optional hint.

Do not:

- red X covering the screen;
- punishment;
- loss of lives;
- score deduction;
- “game over.”

## 13.3 Hint

A hint should reveal attention, not solve everything.

Examples:

- expected card glows;
- correct destination pulses once;
- relevant letter/object gets a subtle highlight;
- target gets Petrin Glow.

Never make the hint look like an error.

---

# 14. Motion contract

Motion should have a small vocabulary.

## 14.1 Idle

Very subtle.

Examples:

- breathing;
- floating;
- tiny environmental movement.

No constant attention-seeking animation.

## 14.2 Press

Short compression.

## 14.3 Correct

Brief:

- glow;
- bounce;
- settle.

## 14.4 Hint

One or two pulses, then stop.

## 14.5 Transition

Use:

- fade;
- short directional movement.

Avoid:

- large zooms;
- spinning transitions;
- camera shakes for ordinary interactions.

## 14.6 Celebration

Keep it:

- short;
- warm;
- joyful;
- non-addictive.

## 14.7 Reduced motion

Honor:

```css
@media (prefers-reduced-motion: reduce) {
  /* replace non-essential movement with instant or low-motion feedback */
}
```

Do not simply remove all feedback.

Replace motion with:

- stronger static highlight;
- color;
- border;
- icon;
- sound where appropriate.

MDN explicitly describes `prefers-reduced-motion` as a mechanism for reducing or replacing non-essential movement, including scaling and panning that can be problematic for some users.

---

# 15. Audio / visual synchronization

Audio is part of the interaction language.

Use the existing:

- master;
- speech;
- music;
- SFX buses;
- ducking behavior.

Rules:

- UI response must never wait for speech;
- SFX should remain immediate;
- speech may duck music;
- feedback should have consistent timing;
- audio failure must never block gameplay;
- reduced-motion does not automatically mean muted audio;
- parent utility screens should remain quieter.

---

# 16. State-based screenshot strategy

The current screenshot set is excellent for baseline coverage, but initial screenshots alone are insufficient for visual QA.

## 16.1 Required visual states

Every relevant game should eventually have screenshots for:

- `INIT`;
- `PLAY`;
- `HINT`;
- `SUCCESS`;
- `COMPLETION`;
- `MODAL` where applicable.

## 16.2 Required state mapping

### Animals

- INIT: animal flashcard;
- PLAY: recognition interaction;
- SUCCESS: selected animal feedback.

### Animal Counting

- INIT: count scene;
- PLAY: answer choices;
- SUCCESS: correct count feedback.

### Animal Memory

- INIT: board;
- PLAY: at least one flipped card;
- SUCCESS: matched pair;
- COMPLETION: finished board.

### Animal Puzzle

- INIT: full puzzle;
- PLAY: partially assembled board;
- SUCCESS: correct placement;
- COMPLETION: completed scene.

### Classroom

- INIT: activity hub;
- PLAY: one representative activity;
- MODAL: if activity selection/modal exists.

### Coloring

- INIT: blank canvas;
- PLAY: partly colored;
- SUCCESS/COMPLETION: finished or highlighted coloring state.

### Tracing

- INIT: tracing hub;
- PLAY: active trace board;
- SUCCESS: completed trace.

### Piano

- INIT: keyboard;
- PLAY: pressed key;
- PLAY: song mode if applicable.

### Rhythm

- INIT: four-pad drum set;
- PLAY: pressed pad;
- PLAY: listen/repeat mode;
- SUCCESS: accepted melody input.

### Sequencing

- INIT: sequence tray;
- PLAY: one item placed;
- SUCCESS: correct placement;
- COMPLETION: completed story.

### Sorting

- INIT: destinations + objects;
- PLAY: drag/placed object;
- SUCCESS: correctly sorted object.

### Shapes

- INIT: shape matching;
- PLAY: selected shape;
- SUCCESS: matched placement.

### Spatial

- INIT: prompt;
- PLAY: selected answer;
- SUCCESS: feedback.

### Phonics

- INIT: letter + choices;
- PLAY: selected object;
- SUCCESS: correct association.

### Maze

- INIT: full garden;
- PLAY: bear part-way through;
- SUCCESS/COMPLETION: destination reached.

### Dino / Driving / Ocean / Space

- INIT: world;
- PLAY: active obstacle/environment;
- MODAL: picker or utility modal if applicable.

### Racing3D

- INIT: world/vehicle picker;
- PLAY: active race;
- orientation gate if present.

### Parent

- INIT: unlocked dashboard;
- PLAY: expanded progress group;
- MODAL: parent action confirmation where applicable.

---

# 17. Visual QA workflow

After every screen-changing task:

1. run affected smoke tests;
2. run relevant functional tests;
3. capture affected screenshot states;
4. update `Screenshot_Review`;
5. update `TABLE_OF_CONTENT.md`;
6. update provenance/manifest where required;
7. inspect all four canonical viewports;
8. compare against previous baseline;
9. verify no unrelated visual drift.

Do not wait until the end of a 20-task batch.

---

# 18. Implementation sequence

The following order is authoritative.

## Phase V0 — Screenshot process upgrade

**Priority: P0**

Create deterministic gameplay-state capture support.

Deliver:

- stable state identifiers;
- deterministic seeded game state where possible;
- capture helper;
- per-game state map;
- screenshot naming convention;
- state metadata.

Suggested naming:

```text
<game>__<viewport>__<state>.png
```

Example:

```text
animal_memory__phone_landscape__PLAY.png
```

Acceptance:

- same state can be captured repeatedly;
- screenshot does not depend on random timing;
- state can be reached without manual intervention in CI where practical.

---

# 19. Phase V1 — Animal Puzzle blocker

**Priority: P0**

Current review blocker:

```text
Слагалица 1 · [object Object]×[object Object]
```

This is not acceptable child-facing UI.

## Required fix

Find the exact object-stringification path in `animal_puzzle.js`.

Never render an object directly into text.

Convert dimensions to explicit values:

```js
`${rows} × ${cols}`
```

or, if the child does not need the grid internals, remove the dimension text entirely.

## Header rule

For phone portrait:

```text
[back]  Слагалица
        1. сцена
```

or:

```text
[back]  Слагалица     1/5
```

Do not expose implementation-level grid details unless they provide child value.

Acceptance:

- no `[object Object]`;
- no title collision;
- no score/status collision;
- all four viewports;
- puzzle board remains the visual hero.

---

# 20. Phase V2 — Shared child header

**Priority: P0**

Refactor the most problematic pages first:

1. Animal Puzzle;
2. Classroom;
3. Coloring;
4. Piano;
5. Ocean;
6. Space;
7. Driving;
8. Memory;
9. other pages with top-cluster collisions.

Do not perform a mechanical “replace all headers” edit.

For each page:

1. identify current shell;
2. map title;
3. map status;
4. map utility;
5. preserve gameplay stage;
6. migrate into shared geometry;
7. test four viewports.

Acceptance:

- no header overlap;
- back always accessible;
- title always readable;
- utility never sits on title;
- short landscape remains usable.

---

# 21. Phase V3 — Short-landscape pass

**Priority: P0/P1**

Audit all 25 surfaces at 844×390.

## Required checklist

- header fits;
- back is visible;
- title is visible;
- primary interaction fits;
- board/tray fits;
- bottom controls fit;
- modal fits;
- no horizontal overflow;
- no accidental vertical scroll;
- no clipped child object;
- no tiny essential text.

## Rule

If content cannot fit:

1. remove decorative UI;
2. collapse secondary text;
3. move secondary controls;
4. resize stage;
5. only then reduce non-critical typography.

Never reduce the primary interaction to solve a chrome problem.

---

# 22. Phase V4 — Adventure HUD unification

Apply to:

- Dino;
- Driving;
- Ocean;
- Space;
- Explorer;
- Maze;
- Racing3D.

Shared:

- back;
- title treatment where needed;
- modal backdrop;
- control shadow;
- semantic feedback;
- orientation behavior.

Keep worlds distinct.

Do not turn Ocean into Space.
Do not turn Driving into a card UI.
Do not turn Explorer into the same HUD as Racing3D.

---

# 23. Phase V5 — Learning Activity Stage System

Introduce a light shared learning-stage vocabulary.

Suggested structure:

```text
learning shell
  ├─ instruction zone
  ├─ stage / play mat
  ├─ answer / object zone
  └─ feedback layer
```

The stage can be:

- paper;
- tray;
- mat;
- scene;
- card table.

Do not force a visible rectangular “container” around every game.

The system should be a layout grammar, not a skin.

---

# 24. Phase V6 — Petrin Glow

Implement one reusable focus treatment.

Possible CSS contract:

```css
.ps-focus-glow {
  box-shadow:
    0 0 0 3px rgb(155 109 255 / 0.16),
    0 8px 22px rgb(74 63 107 / 0.12);
}
```

Exact implementation may differ.

Requirements:

- subtle;
- brief;
- never overwhelming;
- works on light and world surfaces;
- disabled/reduced in reduced-motion mode if animated;
- does not replace semantic colors.

---

# 25. Phase V7 — Tactile component standardization

Standardize:

- primary button;
- secondary button;
- icon button;
- back button;
- selectable card;
- draggable object;
- modal;
- status chip;
- instruction strip;
- completion state.

Each component needs:

- normal;
- hover where relevant;
- pressed;
- selected;
- disabled where relevant;
- correct;
- hint.

Not every game must use every state.

---

# 26. Phase V8 — Animal content visual consistency

Keep native emoji for now.

Improve the surrounding composition:

- larger readable card;
- clear name;
- speaker affordance;
- subtle idle cue;
- consistent spacing;
- consistent selection feedback.

Do not introduce a new external illustration dependency just to make animals “more designed.”

A future custom art pass can happen only if:

1. a coherent full animal set exists;
2. style quality is demonstrably better;
3. assets are locally bundled;
4. licensing is documented;
5. all animal screens are updated together.

---

# 27. Phase V9 — Maze elevation

Current Maze reads more like a prototype than a finished children's world.

## Target

Transform it into a cozy garden journey.

Keep:

- maze logic;
- simplicity;
- bear/player;
- destination.

Add only a restrained world layer:

- soft green ground;
- 2–4 decorative motifs;
- house/goal landmark;
- gentle path contrast;
- clear walls.

Do not:

- clutter the maze;
- hide paths;
- add enemies;
- add timers;
- add punishment.

The bear and destination should remain visually dominant.

---

# 28. Phase V10 — Rhythm refinement

Current concept is substantially improved.

The visual problem is hierarchy.

Four pads should read as **drums**, not four colored circles.

## Required

Each pad should have:

- stronger icon contrast;
- tactile surface;
- clear active state;
- subtle depth;
- recognizable drum/percussion symbolism.

Modes:

- free play;
- repeat melody.

The mode distinction must be visually clear without adding a complex menu.

---

# 29. Phase V11 — Counting refinement

Current mechanic is good but portrait composition is weak.

## Required

- enlarge animal/counting stage;
- move instruction closer to stage;
- reduce dead space;
- make answer choices comfortably tappable;
- keep answer feedback immediate;
- ensure 844×390 shows the whole mechanic.

Do not add quantity 11–20 just for visual variety.
That is a curriculum decision, not a visual fix.

---

# 30. Phase V12 — Memory card refinement

Current purple identity is useful.

Problems:

- cards feel too much like broad slabs;
- back symbol is too small;
- portrait title can collide with back button;
- difficulty controls can fall too low in short landscape.

## Required

Cards should read as actual cards:

- near-square proportion where possible;
- strong central back symbol;
- enough inner padding;
- clear flip state;
- matched state visibly settles.

Do not make cards tiny to fit all of them.

---

# 31. Phase V13 — Classroom hierarchy

Classroom is one of the strongest product-signature screens.

Preserve:

- categories;
- playful learning identity;
- activity grid.

Fix:

- tablet portrait title overlap;
- title safe zone;
- hierarchy between “За малишане” / “За децу” and page title.

The implementation should remove the current dependence on:

```css
#classroomTitle {
  position: absolute;
  top: 4vmin;
}
```

or otherwise prevent it from escaping the shared header geometry.

---

# 32. Phase V14 — Coloring and Piano header pass

## Coloring

Current tactile canvas is strong.

Problem:

- title;
- mode;
- next;
- back

compete in one top band.

Solution:

- title owns the header center;
- mode is secondary;
- next is a clear action in a dedicated control location;
- canvas remains dominant.

Do not shrink the canvas unnecessarily.

## Piano

Piano is already one of the strongest tactile screens.

Problem:

- portrait primary button can compete with back/header.

Preserve:

- large keys;
- strong press feedback;
- studio feeling.

Only repair shell geometry.

---

# 33. Phase V15 — Sorting material upgrade

Current mechanic is clear.

Current visual issue:

- plain white baskets;
- strong black labels;
- tray can clip in short landscape.

Upgrade:

- rounded bucket/container material;
- plum labels;
- softer typography;
- clear destination surfaces;
- full tray visibility.

The relation between object and destination must remain the primary visual signal.

---

# 34. Phase V16 — Sequencing visual upgrade

Mechanic is clean.

Upgrade from worksheet to gentle story tray.

Add:

- subtle paper/tray material;
- slightly larger sequence composition;
- clearer placement feedback;
- small completion moment.

Do not add decorative story text.

The child should solve by seeing relationships.

---

# 35. Phase V17 — Shapes refinement

Shapes is intentionally simple.

Do not over-design it.

Add only:

- subtle play mat;
- slightly better shape material;
- clear selected state.

The spatial relationship must remain the hero.

---

# 36. Phase V18 — Phonics visual life

Current phonics structure is good:

- huge Cyrillic letter;
- two choices.

Add only a little life:

- letter glow;
- speaker cue;
- subtle object highlight;
- immediate success feedback.

Do not add:

- paragraphs;
- alphabet wall;
- extra reading;
- unnecessary animation.

The child should understand:

> “Ово је слово. Чујем га. Која слика почиње њиме?”

---

# 37. Phase V19 — Parent visual system

Parent page should feel trustworthy and calm.

Current issue:

- progress can become dense/tiny;
- page risks looking like a developer dashboard.

## Required

Use:

- grouped cards;
- readable labels;
- progress summaries;
- expandable details where necessary;
- restrained color.

Avoid:

- dense tables;
- tiny metadata;
- technical IDs;
- child-facing toy shadows.

Parent utility can be more information-dense than child UI, but never cryptic.

---

# 38. Phase V20 — Hub visual review

The hub is already one of the strongest screens.

Tablet landscape is the reference.

Phone portrait currently has too much dead vertical space.

Do not fill empty space with decorative noise.

Instead:

- improve vertical rhythm;
- enlarge/relocate useful activity clusters;
- preserve calmness;
- keep parent/technical utilities out of the child hub.

Technical/offline diagnostics belong in parent/utility surfaces, not in the child's primary navigation.

---

# 39. Phase V21 — Semantic motion pass

After shared components exist:

Audit every animation.

Classify it:

- idle;
- press;
- hint;
- success;
- transition;
- celebration.

For each animation ask:

1. Does it communicate something?
2. Is it short?
3. Does it compete with the task?
4. Can reduced motion replace it?
5. Does it run indefinitely?
6. Does it consume meaningful battery/CPU?

Delete decorative motion that fails those tests.

---

# 40. Phase V22 — Icon system pass

Use a coherent icon family.

Back:

- canonical Material `arrow_back` SVG.

Other icons:

- consistent stroke/weight;
- consistent visual scale;
- enough contrast;
- no mixing of unrelated icon styles in one shell.

Do not replace game-specific world icons merely to satisfy consistency.

---

# 41. Phase V23 — Final visual QA baseline

Only after V1–V22:

1. regenerate deterministic screenshots;
2. inspect all four viewports;
3. inspect state coverage;
4. update TOC;
5. update provenance;
6. review visual drift;
7. run full smoke suite;
8. run accessibility checks;
9. run offline checks;
10. document any intentionally different screens.

---

# 42. Per-screen detailed directives

This section is the implementation AI's page-by-page checklist.

## 42.1 Animals

### Keep

- animal identity;
- native emoji;
- card simplicity;
- Serbian naming;
- audio.

### Improve

- subtle “tap me / hear me” affordance;
- slightly clearer speaker cue;
- selection state;
- title safe zone.

### Do not

- add permanent instruction text;
- clutter the flashcard;
- replace animals with untested art.

---

## 42.2 Animal Counting

### Keep

- simple counting mechanic;
- animals as visual counting objects;
- immediate answer feedback.

### Fix

- small focus area on portrait;
- instruction/status size;
- excess whitespace;
- short-landscape composition.

### Acceptance

The child can see:

1. what to count;
2. answer choices;
3. feedback

without scrolling at 390×844 and 844×390.

---

## 42.3 Animal Memory

### Keep

- purple identity;
- matching mechanic.

### Fix

- card proportions;
- back symbol scale;
- header overlap;
- short-landscape difficulty controls.

---

## 42.4 Animal Puzzle

### P0

Fix `[object Object]`.

### Then

- clean compact header;
- scene preview remains large;
- grid internals hidden unless useful;
- selected piece clearly visible;
- correct placement uses Petrin Glow/green feedback;
- completed scene celebrates briefly.

---

## 42.5 Classroom

### Keep

- strongest learning hub language;
- “За малишане” / “За децу”.

### Fix

- tablet portrait header;
- title positioning;
- spacing between page title and category.

### Do not

- redesign the activity grid unnecessarily.

---

## 42.6 Coloring

### Keep

- canvas;
- tactile palette;
- creative family.

### Fix

- header controls;
- top-band collision;
- mode hierarchy.

---

## 42.7 Compare

This is already an excellent example of restraint.

Do not add decoration unless it solves a real comprehension problem.

Target:

> two things, one relationship, one clear decision.

---

## 42.8 Dino

### Keep

- picker;
- character/world.

### Fix

When a picker/modal opens:

- underlying controls must not visually compete;
- backdrop must be clear;
- title and world controls must not appear active underneath.

Modal hierarchy:

1. backdrop;
2. modal;
3. modal controls.

---

## 42.9 Driving

Current vehicle is cute but the road environment is too sparse compared with Ocean/Space.

Add a restrained road-trip world:

- soft sky;
- 2–4 trees;
- clouds;
- road markers;
- fence/sign/landmark;
- optional finish landmark.

Do not make the scene busy.

Top cluster must be fixed for portrait.

---

## 42.10 Ocean

This is one of the strongest worlds.

Keep:

- environmental depth;
- water;
- exploration feeling.

Fix only:

- portrait top chrome/title overlap;
- shell hierarchy.

Do not flatten Ocean into a generic learning card layout.

---

## 42.11 Space

This is the strongest unique world.

Preserve almost unchanged.

Only fix:

- top chrome;
- title collision;
- small-screen hierarchy.

Do not add unnecessary controls.

---

## 42.12 Explorer

Explorer already has a distinct visual identity.

Keep the world.

Unify:

- shell;
- typography roles;
- shadows;
- modal treatment;
- back navigation.

Do not replace its internal visual world with the Ocean/Space style.

---

## 42.13 Candy / Matching

Keep toy-like feel.

Ensure:

- complete 4×4 board;
- no bottom-row clipping;
- cards are large enough;
- completion is visible.

At 844×390, fit the full board by reducing surrounding chrome, not by making cards unusably small.

---

## 42.14 Maze

Upgrade from prototype to cozy garden.

Keep mechanic simple.

Add:

- green ground;
- clear walls;
- destination landmark;
- small decorative garden motifs.

Do not add enemies, timer or score.

---

## 42.15 Phonics

Keep huge letter.

Improve:

- active letter;
- speaker cue;
- object highlight;
- correct feedback.

Never make the screen text-heavy.

---

## 42.16 Piano

Keep tactile studio.

Improve:

- header safe zone;
- portrait control hierarchy;
- pressed-key feedback.

The keyboard is the hero.

---

## 42.17 Rhythm

Make four pads unmistakably percussion controls.

Improve:

- icons;
- tactile depth;
- active pad;
- listen/repeat state;
- completion cue.

Do not add more pads.

---

## 42.18 Sequencing

Keep clean.

Add:

- soft tray;
- slightly larger sequence pieces;
- clearer placement state.

Do not add unnecessary instructions.

---

## 42.19 Shapes

Keep minimal.

Add only:

- play mat;
- selection feedback;
- subtle material.

---

## 42.20 Sorting

Make baskets feel like friendly destinations.

Use:

- rounded containers;
- plum labels;
- clear object-to-destination relation.

Ensure bottom tray is fully visible in short landscape.

---

## 42.21 Spatial

This is already strong.

Keep simplicity.

Do not add decorative scenery that competes with the spatial question.

---

## 42.22 Tracing

Hub is strong.

Need state coverage for:

- active trace;
- partial trace;
- completed trace.

Portrait currently has a large vertical gap.

Use the available height for the actual tracing board.

---

## 42.23 Parent

Separate visual family.

Use:

- clear sections;
- progress cards;
- readable labels;
- calm colors.

Avoid:

- technical dashboards;
- child toy styling;
- tiny dense metrics.

---

# 43. Shared CSS architecture recommendation

The implementation AI should avoid page-by-page CSS invention.

Suggested layers:

```text
styles/
  design-tokens.css
  viewport.css
  accessibility.css
  shell.css
  components.css
  learning-stage.css
  adventure-hud.css
  parent.css
  page-specific/
```

Exact names may differ from current repository structure.

Principle:

- tokens are global;
- shell is global;
- interaction components are global;
- activity stage is family-level;
- game world is page-specific.

---

# 44. Shared component contracts

## 44.1 Back button

Must:

- use canonical arrow icon;
- have large hit area;
- remain stable in all orientations;
- never move based on title length;
- provide pressed feedback.

## 44.2 Primary action

Must:

- visually dominate secondary actions;
- have clear label/icon;
- use semantic color appropriate to action;
- remain reachable.

## 44.3 Modal

Must:

- visually separate from underlying world;
- block accidental interaction underneath;
- clear pointer state;
- support escape where relevant on desktop;
- remain usable in short landscape.

## 44.4 Card

Must:

- have clear boundary;
- distinguish normal/selected/correct;
- avoid excessive shadows;
- preserve content hierarchy.

---

# 45. Responsive implementation patterns

Prefer:

```css
min()
max()
clamp()
dvh
svh
lvh
```

where supported and appropriate.

Do not build the application around:

```css
top: 4vmin;
left: 50%;
transform: translateX(-50%);
```

for core UI.

Absolute positioning is acceptable for world objects.

It is not acceptable as the primary layout strategy for the shared shell.

---

# 46. Viewport height rules

For full-screen activities:

- prefer dynamic viewport units carefully;
- reserve safe-area space;
- do not assume `100vh` equals usable visible height on mobile;
- ensure controls remain reachable when browser UI changes.

For world/canvas games:

- use a measured stage rectangle;
- derive world scale from available stage size;
- keep UI outside the world coordinate system when possible.

---

# 47. Accessibility contract

The project is for young children, but accessibility still matters.

Required:

- high enough contrast;
- large touch targets;
- visible focus where keyboard interaction exists;
- reduced motion support;
- no color-only meaning;
- labels for icon-only controls;
- no interaction dependent solely on hover;
- no tiny status text for essential information.

For correctness:

- green success should also have visual shape/icon/state;
- selected state should have outline/glow, not only color;
- hint should not rely only on color.

WCAG 2.2 AA requires a minimum 24×24 CSS px target size in many pointer-input situations. This project intentionally exceeds that minimum with larger toddler-oriented targets.

---

# 48. Input robustness

Shared input behavior must handle:

- pointerdown;
- pointermove;
- pointerup;
- pointercancel;
- lostpointercapture;
- blur;
- visibilitychange;
- modal opening;
- orientation changes.

Example conceptual helper:

```js
function resetInput() {
  keys.left = false;
  keys.right = false;
  activePointerId = null;
  // reset game-specific drag/steering state
}
```

Call it whenever the active interaction can no longer be trusted.

Never leave:

- steering stuck;
- drag item attached;
- rhythm pad active;
- piano key visually pressed;
- canvas pointer state active.

---

# 49. Visibility / background behavior

For game loops:

When the document becomes hidden:

- stop advancing gameplay state;
- clear transient input;
- pause or duck game audio as appropriate;
- reset timing baseline.

When visible again:

- reset `lastTime`;
- resume interaction;
- do not simulate the hidden interval;
- do not create a huge physics jump.

This is particularly important for:

- Racing3D;
- Driving;
- Dino;
- Ocean;
- Space;
- Maze if animated.

---

# 50. Screenshot implementation contract

The screenshot tool must eventually be able to express:

```js
capture({
  app: "animal_memory",
  viewport: "phone_landscape",
  state: "PLAY"
});
```

The exact API can differ.

The conceptual contract cannot.

Each capture should record:

- app;
- viewport;
- state;
- timestamp;
- commit;
- deterministic seed if used.

---

# 51. Visual review acceptance checklist

For every screenshot ask:

## Composition

- Is the primary action obvious?
- Is the title safe?
- Is whitespace intentional?
- Is the main mechanic visually dominant?

## Interaction

- Does the control look tappable?
- Is it large enough?
- Is the selected state obvious?
- Is success obvious?
- Is hint distinct from error?

## Identity

- Does it feel like Петрин свет?
- Does it still feel like this particular game?
- Are colors semantic?
- Are icons coherent?

## Device

- Does it work at 390×844?
- Does it work at 844×390?
- Does it work at 820×1180?
- Does it work at 1180×820?

## Emotion

Desired:

- warm;
- safe;
- playful;
- curious;
- calm.

Avoid:

- cramped;
- technical;
- empty;
- noisy;
- punitive.

---

# 52. Do not over-standardize

This section is intentionally explicit.

## MUST be shared

- back button;
- header geometry;
- safe-area handling;
- title roles;
- semantic palette;
- touch behavior;
- pressed state;
- success state;
- hint language;
- modal treatment;
- reduced-motion policy;
- interaction reset behavior.

## SHOULD be shared

- card radii;
- shadow vocabulary;
- status chip;
- instruction strip;
- button depth;
- Petrin Glow;
- transition timing.

## MUST remain individual

- Ocean scenery;
- Space scenery;
- Explorer world;
- Driving environment;
- Maze environment;
- Coloring canvas;
- Piano keyboard;
- Rhythm pads;
- puzzle imagery;
- animal representation;
- activity-specific objects.

## FORBIDDEN homogenization

Do not:

- put every game inside a cream card;
- give every page the same background;
- turn every object into a rounded rectangle;
- use one universal icon set for game content;
- force every game into the Classroom visual language;
- remove environmental worlds to “make things consistent.”

Consistency is about grammar, not identical decoration.

---

# 53. Implementation AI working method

Before editing any file:

1. locate the relevant current implementation;
2. inspect imports and shared CSS;
3. check whether a shared component already exists;
4. inspect current screenshot;
5. identify exact defect;
6. make the smallest coherent change;
7. run targeted smoke test;
8. capture affected screenshot;
9. inspect all four viewports;
10. update task documentation.

Do not blindly apply the same CSS block to every page.

---

# 54. Dependency graph

The implementation order is:

```text
V0 Screenshot/state infrastructure
        |
        v
V1 Animal Puzzle blocker
        |
        v
V2 Shared child header
        |
        +----------+
        |          |
        v          v
V3 Short       V4 Adventure HUD
landscape
        |
        +------------------+
        |                  |
        v                  v
V5 Learning stage      V6 Petrin Glow
        |                  |
        +--------+---------+
                 |
                 v
          V7 Tactile system
                 |
          +------+------+
          |             |
          v             v
       V8 Animals    V9–V20
                     page-specific
          |             |
          +------+------+
                 |
                 v
             V21 Motion
                 |
                 v
             V22 Icons
                 |
                 v
             V23 Final QA
```

Parent visual work V19 can begin after V2.

Page-specific tasks may be parallelized only when they do not modify the same shared shell files.

---

# 55. Priority matrix

| Priority | Work |
|---|---|
| P0 | deterministic screenshot states |
| P0 | Animal Puzzle `[object Object]` |
| P0 | shared header geometry |
| P0 | short-landscape critical pass |
| P1 | adventure HUD |
| P1 | learning stage |
| P1 | Petrin Glow |
| P1 | tactile controls |
| P1 | Maze |
| P1 | Rhythm |
| P1 | Counting |
| P1 | Memory |
| P1 | Classroom |
| P1 | Coloring/Piano |
| P2 | Sorting |
| P2 | Sequencing |
| P2 | Shapes |
| P2 | Phonics |
| P2 | Parent |
| P2 | Hub sub-screen refinements |
| P2 | motion audit |
| P2 | icon audit |
| P2 | final visual baseline |

---

# 56. What is a playtesting question versus an implementation decision

The implementation AI should not defer obvious decisions to playtesting.

## Decide in implementation

- header geometry;
- safe-area behavior;
- target sizes;
- semantic colors;
- motion categories;
- state screenshot architecture;
- no `[object Object]`;
- no clipping;
- no title overlap;
- no stuck pointer;
- no hidden primary action.

## Validate in playtesting

- whether Petrin Glow is noticeable enough;
- whether the amount of decoration in Driving feels sufficient;
- whether Maze scenery helps or distracts;
- whether Rhythm pad icons read instantly as drums;
- whether native emoji feel emotionally right on target devices;
- whether the hub's portrait whitespace feels calm or too empty;
- whether the exact timing of success feedback feels satisfying.

---

# 57. Performance rules

Visual polish must not become performance debt.

Avoid:

- large continuous blur effects;
- dozens of simultaneous animated DOM nodes;
- unnecessary canvas redraws;
- large external assets;
- repeated layout-triggering animations;
- high-frequency box-shadow animation.

Prefer:

- transform;
- opacity;
- short CSS transitions;
- static shadows;
- small localized animations.

MDN's performance guidance similarly recommends avoiding unnecessary animation and preferring efficient animation mechanisms where possible.

---

# 58. Offline-first visual rule

All visual assets required for gameplay must remain local/offline-compatible.

Do not:

- load fonts from Google at runtime;
- load icons from a CDN;
- load illustrations from external URLs;
- depend on a network API for visual state;
- introduce external animation libraries.

If an asset is necessary:

- place it in the repository;
- include it in the offline build;
- verify it loads offline;
- include it in screenshot tests.

---

# 59. No hidden network dependency

A visually polished screen that is blank offline is a failed screen.

For each new asset:

1. verify local path;
2. verify offline manifest inclusion;
3. verify service-worker behavior;
4. run offline smoke;
5. inspect screenshot.

---

# 60. Documentation synchronization

When implementation changes visual architecture:

Update:

- `PROJECT_TASKS.md`;
- relevant roadmap;
- screenshot TOC;
- screenshot provenance;
- README only if user-facing architecture has changed.

Do not create a second conflicting visual roadmap.

This document should become the authoritative implementation handoff for this visual pass.

---

# 61. Suggested task naming

Use explicit task IDs:

```text
V0.x
V1.x
...
V23.x
```

Examples:

```text
V2.1 Shared header contract
V2.2 Animal Puzzle migration
V2.3 Classroom migration
V3.1 Short landscape audit
V6.1 Petrin Glow primitive
V7.1 Tactile button states
```

Every completed task should record:

- date;
- files changed;
- tests run;
- screenshot states refreshed;
- result.

---

# 62. Definition of Done

A visual task is not done because the code compiles.

It is done when all relevant criteria pass.

## 62.1 Composition

- no overlap;
- no clipping;
- primary action obvious;
- title safe;
- whitespace intentional.

## 62.2 Interaction

- target looks tappable;
- target is large;
- press state works;
- selection works;
- correct state works;
- hint works where applicable.

## 62.3 Identity

- belongs to Петрин свет;
- keeps game personality;
- semantic colors are respected;
- icons do not conflict.

## 62.4 Device

- phone portrait;
- phone landscape;
- tablet portrait;
- tablet landscape.

## 62.5 Accessibility

- reduced motion;
- labels;
- non-color-only states;
- sufficient contrast;
- robust pointer handling.

## 62.6 Reliability

- no console errors;
- smoke tests pass;
- no new offline failure;
- no stuck input;
- no audio exception.

## 62.7 Screenshot

- affected screenshots refreshed;
- TOC updated;
- state documented;
- no unexplained drift.

---

# 63. Release gate

The visual pass is release-ready only when:

- V1 P0 blocker is fixed;
- V2 shared header is stable;
- V3 short landscape passes;
- all four canonical viewports are usable;
- affected screenshots are refreshed;
- full smoke suite remains green;
- parent smoke remains green;
- offline behavior remains green;
- no new console errors;
- reduced-motion mode has been manually checked;
- touch/drag cancellation has been checked;
- final visual review finds no overlap/clipping;
- no page looks like an unrelated product.

---

# 64. Implementation AI master instructions

The following section can be treated as a direct contract.

## MASTER CONTRACT

You are modifying the existing Петрин свет repository.

### A. Preserve existing functionality

Do not rewrite working games merely to make them look different.

Before changing a game, inspect:

- current JS;
- current HTML;
- current CSS;
- shared systems;
- current tests;
- current screenshot.

### B. Treat current repo state as newer than old roadmaps

Do not reintroduce:

- old Explorer fixes;
- old Racing3D world-count fixes;
- old manifest tasks;
- old offline-list tasks;
- old animal SVG/Twemoji recommendations;
- old curriculum work already completed.

If an old document conflicts with the current repository, the current repository plus this document wins.

### C. Solve shared problems once

If five pages have header collisions:

> fix the header system.

Do not write five unrelated hacks.

### D. Preserve individual worlds

Consistency is:

- shell;
- hierarchy;
- interaction;
- semantics.

Consistency is not:

- identical backgrounds;
- identical cards;
- identical decorations.

### E. Short landscape is first-class

Always inspect:

```text
844×390
```

before declaring a child screen finished.

### F. Never sacrifice the mechanic to save chrome

If the screen is crowded:

1. remove decoration;
2. collapse secondary UI;
3. relocate utility;
4. simplify status;
5. then resize.

### G. Never hide bugs behind styling

Examples:

```text
[object Object]
```

is a blocker.

Clipped content is a blocker.

Title under back button is a blocker.

A stuck drag is a blocker.

A control hidden behind a modal is a blocker.

### H. Use semantic color

- green = correct/safe;
- yellow = attention/selected/continue;
- plum = structure;
- pink = creative/playful;
- sky/blue = movement/utility;
- violet = learning/focus.

### I. Use Petrin Glow sparingly

It communicates:

> “look here / this is active / this is expected.”

It does not communicate:

> “you won.”

### J. Feedback should be immediate and gentle

Never punish a toddler for an incorrect answer.

### K. Audio never blocks gameplay

Speech and sound are feedback, not prerequisites.

### L. Respect reduced motion

Replace non-essential motion with static visual feedback.

### M. Keep everything offline

New assets must be local and included in offline packaging.

### N. Test every screen-changing task

At minimum:

```text
targeted smoke
+
affected screenshots
+
all four viewports
```

### O. Update screenshot review after UI changes

Do not leave stale screenshots after changing the screen.

### P. Prefer small coherent changes

A task should be easy to review and revert.

### Q. Do not invent unnecessary architecture

Use existing vanilla JS/CSS systems.

No framework migration.

No heavy UI library.

No physics engine.

No new backend.

### R. Finish the product before adding new activities

The existing activity set is already broad.

Visual quality and coherence have higher priority than adding another game.

---

# 65. Research-backed implementation notes

This section separates external technical guidance from product-specific design decisions.

## 65.1 Pointer interaction

MDN's Pointer Events documentation supports using pointer capture for robust drag/manipulation and explicitly documents `pointercancel` as a normal event that can occur when the browser takes over the interaction.

Implication for Петрин свет:

- treat cancellation as normal;
- always reset active interaction state;
- do not assume pointerup is guaranteed.

Reference:
https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events

## 65.2 Safe-area behavior

MDN documents:

- `safe-area-inset-top`;
- `safe-area-inset-right`;
- `safe-area-inset-bottom`;
- `safe-area-inset-left`

as browser-provided environment variables intended to keep content inside the visible safe region.

Implication:

- centralize safe-area variables;
- do not duplicate device-specific offsets.

Reference:
https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/env

## 65.3 Reduced motion

MDN documents `prefers-reduced-motion` as a way to detect a user's preference to reduce or replace non-essential movement.

Implication:

- feedback must survive without animation;
- large scaling/panning effects should be avoided or replaced.

Reference:
https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion

## 65.4 Target size

WCAG 2.2 AA includes a 24×24 CSS px minimum target-size criterion with exceptions.

Петрин свет intentionally uses substantially larger child-oriented targets.

Reference:
https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/

---

# 66. Final visual philosophy

The finished product should feel like this:

A child opens **Петрин свет**.

They see a warm, familiar world.

They enter Animals.

It feels like Петрин свет.

They enter Space.

It feels completely different — but still like Петрин свет.

They enter Piano.

It feels like a little instrument.

They enter Classroom.

It feels like a cozy learning corner.

They enter Maze.

It feels like a small adventure.

The child should never think:

> “This is a website.”

The child should feel:

> **“Ово је мој свет за играње и учење.”**

That is the visual/UX target.

The implementation is successful when the product becomes **more coherent without becoming more uniform**, **more polished without becoming busier**, and **more delightful without becoming distracting**.

---

# Appendix A — Quick implementation checklist

## Before coding

- [ ] Read this document.
- [ ] Inspect current repository state.
- [ ] Confirm task is not already solved.
- [ ] Inspect current screenshot.
- [ ] Identify shared-system opportunity.

## During coding

- [ ] Preserve gameplay.
- [ ] Preserve Serbian Cyrillic.
- [ ] Preserve offline operation.
- [ ] Use existing tokens.
- [ ] Use shared header where appropriate.
- [ ] Use semantic colors.
- [ ] Use robust pointer cancellation.
- [ ] Honor reduced motion.
- [ ] Avoid unnecessary animation.

## After coding

- [ ] Run targeted smoke.
- [ ] Check console.
- [ ] Check 390×844.
- [ ] Check 844×390.
- [ ] Check 820×1180.
- [ ] Check 1180×820.
- [ ] Capture relevant states.
- [ ] Refresh screenshot review.
- [ ] Update TOC/provenance.
- [ ] Update task tracker.

---

# Appendix B — Per-game minimum screenshot state matrix

| Game | INIT | PLAY | HINT | SUCCESS | COMPLETION | MODAL |
|---|---:|---:|---:|---:|---:|---:|
| Animals | ✓ | ✓ | optional | ✓ | — | — |
| Animal Counting | ✓ | ✓ | ✓ | ✓ | optional | — |
| Animal Memory | ✓ | ✓ | optional | ✓ | ✓ | — |
| Animal Puzzle | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| Classroom | ✓ | ✓ | — | optional | — | optional |
| Coloring | ✓ | ✓ | — | optional | ✓ | optional |
| Compare | ✓ | ✓ | — | ✓ | optional | — |
| Dino | ✓ | ✓ | optional | ✓ | optional | ✓ |
| Driving | ✓ | ✓ | optional | ✓ | optional | ✓ |
| Ocean | ✓ | ✓ | optional | ✓ | optional | ✓ |
| Space | ✓ | ✓ | optional | ✓ | optional | ✓ |
| Explorer | ✓ | ✓ | optional | ✓ | optional | ✓ |
| Candy/Matching | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| Maze | ✓ | ✓ | optional | ✓ | ✓ | — |
| Phonics | ✓ | ✓ | optional | ✓ | optional | — |
| Piano | ✓ | ✓ | — | ✓ | optional | optional |
| Rhythm | ✓ | ✓ | optional | ✓ | ✓ | optional |
| Sequencing | ✓ | ✓ | optional | ✓ | ✓ | — |
| Shapes | ✓ | ✓ | optional | ✓ | ✓ | — |
| Sorting | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| Spatial | ✓ | ✓ | optional | ✓ | ✓ | — |
| Tracing | ✓ | ✓ | optional | ✓ | ✓ | — |
| Racing3D | ✓ | ✓ | optional | ✓ | optional | ✓ |
| Parent | ✓ | ✓ | — | optional | optional | ✓ |

---

# Appendix C — Anti-pattern catalogue

Never ship these:

### Header anti-patterns

- title under back button;
- title behind utility;
- status on top of title;
- absolute title detached from shell;
- different back icons on different pages.

### Responsive anti-patterns

- clipped bottom row;
- content requiring scroll on a board game;
- 844×390 treated as an afterthought;
- giant empty gap above mechanic;
- tiny controls because header was not simplified.

### Interaction anti-patterns

- button that looks decorative;
- tiny draggable object;
- stuck pointer;
- drag that stops when finger leaves object;
- no visible selection state.

### Feedback anti-patterns

- red punishment screen;
- loud error;
- score deduction;
- permanent flashing;
- success animation that blocks the next turn.

### Visual anti-patterns

- random border radii;
- unrelated shadow styles;
- arbitrary saturated colors;
- black labels where product typography calls for plum;
- technical IDs exposed to child;
- `[object Object]`.

### Architecture anti-patterns

- five copies of the same header CSS;
- page-specific safe-area hacks;
- external CDN visual assets;
- visual state depending on random timing;
- screenshot baseline updated without inspecting it.

---

# Appendix D — Completion statement template

When a task is complete, record:

```md
## Vx.y — <task name>

Status: DONE
Date: YYYY-MM-DD

### Changed
- ...

### Shared systems affected
- ...

### Screens affected
- ...

### Tests
- ...

### Screenshot states refreshed
- ...

### Viewports checked
- 390×844
- 844×390
- 820×1180
- 1180×820

### Notes
- ...
```

---

# Appendix E — One-page priority summary for the implementation AI

If time is limited, do this in exactly this order:

1. **Fix Animal Puzzle `[object Object]`.**
2. **Create/finalize the shared child header contract.**
3. **Fix every 844×390 layout.**
4. **Standardize tactile states.**
5. **Introduce restrained Petrin Glow.**
6. **Improve learning-stage composition.**
7. **Unify adventure HUD without flattening worlds.**
8. **Elevate Maze.**
9. **Refine Rhythm.**
10. **Refine Counting.**
11. **Refine Memory.**
12. **Fix Classroom header.**
13. **Fix Coloring/Piano header.**
14. **Refine Sorting/Sequencing/Shapes/Phonics.**
15. **Refine Parent dashboard.**
16. **Audit motion.**
17. **Audit icons.**
18. **Capture deterministic gameplay states.**
19. **Refresh the full screenshot baseline.**
20. **Run the complete release gate.**

---

# Final instruction

**Do not optimize for the number of changes. Optimize for the quality of the resulting child experience.**

A successful implementation should require fewer visual rules to explain the product after the work than before it.

The child should encounter:

- fewer surprises;
- fewer tiny controls;
- fewer collisions;
- fewer dead zones;
- clearer actions;
- warmer feedback;
- stronger worlds;
- more consistent navigation.

The implementation AI should finish with a product that feels intentionally designed rather than merely repaired.

**Петрин свет should look like one place, while every activity still feels like its own little world.**


---

# Source and provenance note

This document is a second-pass implementation specification based primarily on:

1. `Petrin_svet_Screenshot_Visual_UX_Review_2026-10-07.md` (the supplied 2,698-line visual/UX review);
2. the current project/repository state summarized in the working project context, including tasks through 214;
3. external technical references used only for implementation guidance:
   - MDN Pointer Events;
   - MDN CSS `env()` / safe-area environment variables;
   - MDN `prefers-reduced-motion`;
   - W3C/WAI WCAG 2.2 Target Size.

Where product-specific decisions are stated, they are **project decisions**, not claims that the external references prescribe the design.

Where the repository already contains a solution, this document deliberately treats the current implementation as authoritative and does not resurrect older roadmap defects.

**Document status:** implementation handoff / visual-UX master specification  
**Date:** 2026-10-07
