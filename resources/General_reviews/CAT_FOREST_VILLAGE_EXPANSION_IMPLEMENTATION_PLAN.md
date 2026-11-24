# Cat Forest --- Village, Fishing, Gathering & Workshop Expansion

## Complete implementation brief for the local coding AI

**Document type:** Proposed product/technical expansion plan\
**Target repository:** `radmanmilos/Games-for-kids`\
**Target game:** Cat Forest / «Мачја шума»\
**Suggested repository location:**
`resources/General_reviews/Cat_Forest/07_VILLAGE_EXPANSION_PLAN.md`\
**Implementation status:** PLAN ONLY --- no implementation or approval
is implied by this document\
**Reference inspiration:** Secret Cat Forest, interpreted for Petras
World and its toddler-first design rules

------------------------------------------------------------------------

# 0. Instructions to the implementing AI

You are implementing a substantial, user-requested expansion of the
existing Cat Forest game. Do not treat this document as permission to
ignore repository rules or to overwrite existing approved decisions
without recording the change.

Your first job is **repository reconnaissance and decision
reconciliation**, not coding.

## 0.1 Required first steps

1.  Read `AGENTS.md`, `project/PROCESS.md`, `project/STATUS.md`,
    `project/DECISIONS.md`, `project/tasks/ACTIVE.md`, and the current
    Cat Forest guide at `project/games/cat-forest.md`.
2.  Read the Cat Forest package:
    -   `resources/General_reviews/Cat_Forest/README.md`
    -   `00_PRODUCT_SPEC.md`
    -   `01_TECH_DESIGN.md`
    -   `02_ROADMAP.md`
    -   `03_TASKS.md`
    -   `04_TEST_PLAN.md`
    -   `05_DECISIONS_AND_RISKS.md`
    -   `PROGRESS.md`
3.  Inspect the actual current versions of:
    -   `game/pages/cat_forest.html`
    -   `game/games/cat_forest.js`
    -   `game/data/app-registry.js`
    -   `game/data/serbian.js`
    -   `game/data/art-registry.js`
    -   `game/shared/art.js`
    -   `tools/cat_forest_smoke.js`
    -   `tools/visual-states.json`
    -   the offline inventory / manifest tooling
4.  Check `git status --short`, current branch, recent commits, and
    recent CI status using the repository's prescribed workflow. If the
    tree is unexpectedly dirty or CI is red, stop and report before
    changing anything.
5.  Compare the current code with `PROGRESS.md`. The ledger currently
    visible in the repository may be older than later code/documentation
    changes. Do not use an old ledger row as proof that a feature is
    absent or unfinished.
6.  Create a concise **verified current-state report** in the task notes
    before implementation. For every feature, classify it as
    `present and verified`, `present but not verified`,
    `partially present`, `absent`, or `unknown`.
7.  Present the proposed decision changes in §1 to the user and obtain
    explicit approval before implementation. Do not infer approval from
    this plan.

## 0.2 Governing project rules

-   The game is for young children, approximately ages 2--6. Every
    interaction must be understandable through pictures, animation and
    gentle sound, without requiring reading.
-   Child-facing text and speech must be Serbian Cyrillic and Serbian
    speech respectively.
-   No ads, tracking, analytics, in-app purchases, mandatory internet,
    remote assets or runtime network calls.
-   Keep the game usable offline and smooth on modest Android tablets.
-   Large, forgiving touch targets; no punishment, failure, loss,
    pressure or stressful feedback.
-   Respect `prefers-reduced-motion`; test it as a primary path, not as
    an afterthought.
-   Keep Cat Forest self-contained. Do not edit `game/shared/*` unless
    the user explicitly approves a separately scoped shared change.
-   Runtime assets must live under `game/`, never depend on `resources/`
    or `tools/`.
-   Never edit `docs/` manually. Regenerate it with the repository's
    prescribed sync command after `game/` changes.
-   Do not claim a test passed unless it was actually run. Record exact
    commands and results.
-   Do not commit or push unless the current user instruction and the
    current repository rules explicitly authorize it. Re-read the
    current rules; do not rely on historical amendments in an old
    planning package.
-   One bounded task per task card/session. Update
    `project/tasks/ACTIVE.md`, `project/STATUS.md`, and the Cat Forest
    progress ledger as required by the current workflow.

## 0.3 Non-negotiable IP rule

Use Secret Cat Forest as **mechanical and mood inspiration only**. Do
not copy its screenshots, characters, furniture illustrations, UI
artwork, names, animations, exact layouts, textures or proprietary
assets. All new art must be original and created for Petras World. The
final game must have its own recognizable visual identity.

------------------------------------------------------------------------

# 1. Product decision changes --- approval required

The existing Cat Forest is not a blank project. Its approved product
specification describes a wordless emoji-based feeding loop with
free/unlimited treats, three plates, visiting cats, gifts that become
forest decorations, a friends book, child-controlled day/night and rain,
and deliberately excludes inventory economies, visible counters, new art
assets and crafting systems.

This expansion intentionally proposes a **new product direction**. It
conflicts with several existing locked decisions. The local AI must not
silently merge the two designs.

## 1.1 Existing decisions that this plan proposes to revise

  -----------------------------------------------------------------------
  Existing rule /         Proposed direction      Required handling
  decision                                        
  ----------------------- ----------------------- -----------------------
  Free, unlimited treats  Fish becomes a          Explicit user approval;
                          gathered,               retain a no-shortage
                          finite-but-generous     fallback
                          food supply             

  No resource inventory   Add wood, fish and a    Explicit approval; no
                          small set of keepsake   currency or shop
                          materials               

  No visible              Show resources as small Explicit approval; no
  counters/numbers        illustrated piles /     digits, score or
                          filled containers, not  progress percentage
                          numeric counters        

  Emoji-only art; no new  Introduce original      Explicit approval; use
  image assets            painted scene art and   the project's asset
                          illustrated object/cat  pipeline
                          assets                  

  One forest feeding      Add a house/village hub Explicit approval;
  scene                   plus pond, gathering    preserve the existing
                          and workshop scenes     hub route and back
                                                  behaviour

  No crafting             Add instant,            Explicit approval; no
                          child-friendly crafting crafting timers or
                          and placement           failure

  Friends book only       Expand into a cat diary Explicit approval;
                          with discovered cats    preserve the
                          and gentle facts        discovered-only
                                                  principle

  Existing three-plate    Make the three feeding  Preserve the familiar
  feeding                 positions fixed to the  interaction where
                          house porch / feeding   practical
                          area                    
  -----------------------------------------------------------------------

## 1.2 Principles that remain unchanged

-   No coins, gems, premium currency, prices, shop, XP, levels, score,
    streaks, daily reward, leaderboard, ads or in-app purchases.
-   No countdowns, time limits, reaction deadlines, failure states,
    lives or punishment.
-   No real-time waiting for a resource to grow, no offline earnings and
    no notifications.
-   No locked content or opaque progression gates. The child can see the
    world and its possibilities from the beginning.
-   No loss of crafted furniture or collected cat memories.
-   No visible numeric resource totals. Resource amounts are represented
    visually.
-   Cats must remain friendly, safe, non-threatening and emotionally
    expressive.
-   All core interactions remain possible with simple taps. Dragging is
    optional, never the only interaction.
-   The original calm, cosy, low-pressure character of Cat Forest must
    survive the expansion.

## 1.3 Recommended product interpretation

This is a **cozy village-care game**, not a resource grind or management
simulator.

Resources exist only to give the child satisfying activities and a
reason to create a welcoming place for cats. Gathering should be quick
and generous. A child should never be stuck because they have no fish or
wood. If a resource pile is empty, the corresponding activity
immediately offers a simple way to gather more. No item should be
permanently missable.

**Recommended approval checkpoint:** approve or reject the direction in
§1.1 before any code or art is produced.

------------------------------------------------------------------------

# 2. Vision and experience pillars

## 2.1 New game fantasy

The child looks after a tiny woodland home where friendly cats come to
visit. They place food in the house's familiar feeding area, visit a
pond to catch fish, collect fallen branches and logs, and use wood and
little gifts from cats to make the home and garden more welcoming.

Cats are not customers. They are visitors and friends. They arrive
because the place feels safe and inviting, eat, explore, rest, play with
decorations and sometimes leave a little present. The child can learn
about the cats in a diary and decorate the village at their own pace.

## 2.2 Pillars

1.  **A place that feels alive:** the house, garden, pond and forest
    have small ambient movements and responsive details.
2.  **A clear cause-and-effect loop:** gather a little → feed a cat →
    receive a keepsake → make something → see it in the world.
3.  **No pressure:** all activities are optional, forgiving and
    repeatable.
4.  **Personal ownership:** decorations stay where the child places
    them; the village gradually feels like their own.
5.  **Cats with personality:** each cat has a distinct appearance,
    favourite places, favourite foods, reactions and diary entry.
6.  **One coherent art direction:** backgrounds, characters, furniture,
    icons and menus belong to the same illustrated world.
7.  **Toddler-first interaction:** large targets, minimal choices per
    screen, no text-dependent instructions.

## 2.3 Core loop

``` text
VILLAGE / HOUSE
    |
    +--> Put fish on one of the fixed feeding places
    |       |
    |       +--> Cat visits, eats, cuddles / plays
    |               |
    |               +--> Leaves a keepsake or decorative gift
    |                       |
    |                       +--> Use it in the workshop
    |                               |
    |                               +--> Place new decoration in house / garden
    |
    +--> POND
    |       |
    |       +--> Gentle fishing activity
    |               |
    |               +--> Fish added to illustrated fish basket
    |
    +--> WOODLAND EDGE
    |       |
    |       +--> Collect fallen branches and logs
    |               |
    |               +--> Wood added to illustrated wood pile
    |
    +--> WORKSHOP
    |       |
    |       +--> Combine wood + cat gifts into a decoration
    |               |
    |               +--> Place it in a fixed village decoration slot
    |
    +--> CAT DIARY
            |
            +--> View cats already met, their portrait and discovered facts
```

The child can return to the village from every scene with one obvious
home/back control. The village remains the central place, not a menu
maze.

------------------------------------------------------------------------

# 3. World layout and scene design

## 3.1 Main scene: the village house

**Purpose:** the persistent home screen and the emotional centre of the
game.

### Composition

-   A small, charming woodland cottage occupies the central visual
    focus.
-   The house has a visible front porch or covered feeding area.
-   Three fixed feeding positions sit on the porch / front garden edge.
    They must always remain in the same positions and must not be
    movable.
-   A short path connects the house to the pond and the woodland
    gathering area.
-   The garden surrounds the house and contains fixed decoration sockets
    / anchor points.
-   The workshop is visible as a small shed, lean-to or side building.
-   A diary/book object is visible near the door or on a small outdoor
    table.
-   The background shows a peaceful forest clearing, distant trees, soft
    hills and a gentle sky.
-   The village should be composed to keep the house and feeding spots
    readable on a tablet at first glance.

### Fixed interactive anchors

Use stable named anchors in normalized stage coordinates, not hard-coded
pixel coordinates:

-   `house.main`
-   `house.door`
-   `house.window.left`
-   `house.window.right`
-   `house.roof`
-   `porch.feed.1`
-   `porch.feed.2`
-   `porch.feed.3`
-   `garden.front.left`
-   `garden.front.center`
-   `garden.front.right`
-   `garden.path.left`
-   `garden.path.right`
-   `garden.tree.base`
-   `garden.fence`
-   `garden.water.edge`
-   `workshop.front`
-   `diary.table`

Only designated decoration anchors accept placed items. Do not allow
arbitrary placement over cats, food stations, navigation or interactive
controls.

### Feeding behaviour

-   The child selects a fish from the visible fish basket / food tray.
-   The child taps one of the three fixed feeding places. A tap is the
    primary interaction.
-   Optional drag-and-drop may be supported, but must use the same
    placement function as tapping.
-   The fish appears on the selected feeding place with a small bounce.
-   A cat approaches the house and moves to the chosen free feeding
    place.
-   The cat sniffs, eats, looks content and leaves.
-   The food is consumed only when the cat actually starts eating.
-   If the child has no fish, tapping the fish basket or pond entrance
    offers the fishing activity. Never show a red error, warning dialog
    or dead end.
-   Cats never steal food from another cat's active plate. Keep the
    existing one-cat-per-plate and maximum-active-cat safeguards where
    possible.
-   If the three places are occupied, the child may continue exploring
    the village or enter another activity. No negative feedback.

### House ambience

Use subtle, non-distracting loops: - smoke or warm light at the
chimney/window; - leaves moving gently; - a curtain or flower box moving
slightly; - occasional bird or butterfly crossing; - a cat sleeping on
the porch after a visit; - warm window glow at night; - gentle rain only
when the existing child-controlled rain toggle is enabled.

Do not animate every object simultaneously. Avoid excessive particles
and CPU-heavy filters.

## 3.2 Pond scene: fishing

**Purpose:** gather fish through a short, satisfying activity.

### Scene composition

-   A small pond with a curved bank, reeds, lily pads, a wooden dock or
    flat stepping stones.
-   A fishing basket near the lower edge, showing the collected fish as
    illustrations rather than a number.
-   One obvious fishing interaction point (rod / bobber / water area).
-   A large return-to-village control.
-   A small set of fish silhouettes or visible fish swimming under the
    water.

### Interaction sequence

1.  Entering the pond shows a calm idle scene. A fishing rod is already
    available; do not require a crafted tool or unlock.
2.  The child taps the water or a large fishing spot.
3.  A bobber appears or dips gently.
4.  The child taps the bobber / water again, or the fish surfaces
    automatically after a short visual cue.
5.  A friendly fish jumps into the basket with a soft sound and a brief
    sparkle.
6.  The fish basket visibly gains one fish.
7.  The activity can be repeated immediately.

### Fishing rules

-   No countdown, countdown bar, reaction-time test or failure state.
-   If the child taps early or misses the bobber, the water makes a
    harmless ripple and the same fish remains available.
-   Never remove fish from the basket because of inactivity or leaving
    the screen.
-   The first fishing attempt should be guided with a picture-only cue
    (rod → water → fish).
-   Use a small curated fish set for visual variety; do not introduce
    complex fish rarity or statistics.
-   The activity should feel complete after one successful catch, but
    allow repeated catches.
-   Keep the activity short and repeatable; do not require a long
    fishing session to feed one cat.

### Fish inventory presentation

-   The fish basket is the only visible representation of the fish
    supply.
-   Show fish sprites in a small, readable stack or row. Do not display
    digits.
-   Internally store a validated integer count.
-   If the basket reaches its visual display cap, keep the internal
    supply generous and use a fuller basket state; never silently
    discard a catch.
-   Feeding consumes one fish only when the cat begins eating.

## 3.3 Woodland scene: gathering wood

**Purpose:** collect wood for crafting without turning it into
repetitive work.

### Scene composition

-   A warm woodland clearing beside the village.
-   A large tree stump, a few fallen branches, small log piles and a
    wooden collection basket.
-   No axe, sharp tool, cutting animation or dangerous activity is
    required.
-   Wood is gathered from already-fallen branches and logs.

### Interaction

-   Tapping a fallen branch makes it bounce / lift into the basket.
-   Optional drag-to-basket is supported, but tapping is always
    sufficient.
-   A log can split into two small illustrated bundles through a gentle,
    magical pop rather than a realistic cutting action.
-   After a small set of pickups, the basket visibly fills.
-   The scene can refresh its gatherable objects when revisited; no
    real-time growth or offline production is required.

### Rules

-   Do not require tool crafting or tool upgrades.
-   No stamina, energy, tool durability, breakage or resource depletion
    timer.
-   No sharp tools or hazardous visual content.
-   Each tap must produce a clear positive response.
-   If all visible branches are collected, a friendly bird or squirrel
    can reveal another small bundle immediately; do not make the child
    wait.
-   Store wood as a validated internal amount, shown as a stack of logs
    / basket fullness, never as a number.

## 3.4 Workshop scene

**Purpose:** turn gathered materials and cat gifts into charming
decorations.

### Composition

-   A small open-front wooden workshop or craft shed.
-   A friendly workbench in the centre.
-   Shelves with a few finished examples.
-   A visible wood pile and a tray of keepsakes left by cats.
-   A compact recipe selector with large illustrated cards.
-   A clear placement/return action.

### Three workshop areas

1.  **Materials area:** visual wood stack and keepsake tray.
2.  **Recipe area:** a small number of large decoration illustrations;
    one recipe per card.
3.  **Workbench area:** selected recipe preview and a single prominent
    craft interaction.

### Craft interaction

1.  Child taps a decoration card.
2.  A large preview appears on the workbench.
3.  Required materials are displayed as icons (wood + keepsake icons),
    with available amounts represented visually.
4.  Child taps the craft button / workbench.
5.  Materials move into the workbench with a short assembly animation.
6.  Finished decoration appears immediately. No crafting timer.
7.  The child chooses a compatible house/garden anchor to place it.
8.  If placement is postponed, the finished item remains in a simple
    finished-items tray and can be placed later.

### Material rules

-   Wood is a common crafting material.
-   Cat gifts are keepsake materials (examples: feather, ribbon, button,
    shell, bell, flower, acorn, soft yarn).
-   Gifts should have a small number of categories and clear visual
    identity. Avoid a large inventory of near-identical fragments.
-   A cat gift may be used in multiple recipes only if the game has
    enough supply; never consume a unique diary/story item.
-   Do not add coins, shop purchases, prices or paid shortcuts.
-   Do not make crafting take real time.
-   Do not make the child lose a crafted item when replacing a
    decoration.
-   If there are not enough materials, keep the recipe visible and
    explain the missing ingredients with picture-only icons. Do not use
    a padlock, greyed-out mystery item, red error or "not enough" text.
    The child can go gather the visible ingredients.
-   Avoid hidden recipe unlocks. All base recipes should be visible from
    the start. More recipes may be added as ordinary content updates,
    not as a pressure-based reward.

### Recommended initial recipe set

Keep the first release compact. Every object must have a clearly defined
anchor category.

  Decoration            Materials (initial proposal)   Placement
  --------------------- ------------------------------ -----------------
  Little flower pot     wood + flower gift             window / porch
  Birdhouse             wood + feather                 tree / fence
  Welcome mat           wood + yarn                    house door
  Garden bench          wood + button                  garden
  Hanging lantern       wood + shell                   porch / path
  Cat cushion           yarn + feather                 porch / house
  Small fence section   wood + acorn                   garden boundary
  Wind chime            wood + shell                   porch / tree
  Mushroom ornament     wood + flower gift             garden
  Cat scratching post   wood + yarn                    garden / porch

The material recipes are balancing placeholders. The implementing AI
must keep them in one data table and must not scatter costs across UI
code.

## 3.5 Cat diary

**Purpose:** preserve and expand the existing Friends Book into a
memorable cat album.

### Access

-   A large diary/book object is visible in the village.
-   Tapping it opens a full-screen or large modal diary.
-   A large close/back control returns to the exact prior scene and
    state.
-   The game clock and cat movement pause while the diary is open,
    consistent with the existing Friends Book behaviour.

### Diary structure

-   A two-column / large-card gallery of cats already met.
-   Each entry contains the cat's original portrait, name in Serbian
    Cyrillic, a short personality description, favourite food and
    favourite place.
-   Show a small illustration of one distinctive behaviour (e.g. naps on
    the bench, watches butterflies, sits by the pond).
-   Optional: a small memory illustration for a special interaction
    already observed.
-   Tapping an entry opens a detail page/card. Closing it returns to the
    gallery.
-   Diary facts are revealed only after the child has actually met the
    cat or observed the relevant behaviour.

### Preserve these existing principles

-   Do not show silhouettes, question marks or greyed-out unseen cats.
-   Do not show total cat counts, percentages, completion bars, ranks or
    rarity labels.
-   Do not make the diary a checklist or a competitive collection
    screen.
-   Never remove a cat entry after it has been recorded.
-   Keep the existing met-cat persistence contract and migrate it safely
    if the save schema changes.

### Cat behaviour data

Each cat should have data-only fields: - `id` (stable ASCII
identifier) - `name` (Serbian Cyrillic) - `portraitAsset` - `bodyAsset`
/ animation set - `favouriteFood` - `favouritePlaces` - `personality`
(short Serbian Cyrillic, if any visible text is approved; otherwise
icon-based) - `idleBehaviours` - `visitBehaviours` - `giftPool` -
`diaryFacts` - `specialBehaviourTriggers`

Do not encode cat-specific behaviour as repeated one-off DOM logic. Use
a small data-driven behaviour system.

## 3.6 Navigation and menus

Use a simple village-first navigation model:

-   **Village / house:** central home scene.
-   **Pond:** fishing.
-   **Woodland:** gathering.
-   **Workshop:** crafting.
-   **Diary:** cat memories.

Navigation should be represented by large illustrated hotspots in the
world where possible (pond path, wood pile, workshop door, diary). Avoid
a row of tiny generic icons that makes the game feel like an application
dashboard.

Every secondary screen must have: - one obvious return control; - no
hidden swipe-only navigation; - no nested menu maze; - preserved game
state on return; - large hit targets; - keyboard/focus semantics and
Serbian Cyrillic accessible labels.

A short, picture-only first-use introduction may demonstrate fish →
plate → cat → gift → workshop → decoration. It must be skippable,
replayable and never block free play.

------------------------------------------------------------------------

# 4. Game systems and state model

## 4.1 Resource model

Only three resource families are required:

1.  **Fish:** consumed by feeding cats.
2.  **Wood:** used to craft decorations.
3.  **Keepsakes:** small gifts left by cats and used in selected
    recipes.

Do not create a generic currency abstraction. These resources are
physical story objects in the world, not money.

### Suggested internal state

``` js
{
  version: 2,
  resources: {
    fish: 0,
    wood: 0,
    keepsakes: {
      feather: 0,
      ribbon: 0,
      button: 0,
      shell: 0,
      yarn: 0,
      flower: 0,
      acorn: 0
    }
  },
  cats: {
    met: [],
    observedBehaviours: []
  },
  feeding: {
    plates: [null, null, null]
  },
  crafted: [],
  placedDecorations: [],
  scene: "village",
  settings: {
    time: "day",
    weather: "clear"
  }
}
```

This is a conceptual schema, not a demand to copy it blindly. Reuse the
existing save structure where possible and write a migration from the
current schema. Do not overwrite valid existing saves.

### Inventory UI

-   Use stacks, baskets, shelves and small piles.
-   Do not show digits or numeric labels.
-   Avoid a permanent HUD with multiple counters.
-   A brief, local visual animation confirms each collected item.
-   The child should understand what the resource is by its picture and
    where it belongs.

## 4.2 Feeding system

-   Three fixed feeding places remain in the house/village scene.
-   Fish is the primary feedable resource in this expansion.
-   One fish is reserved for one feeding place.
-   A cat visit consumes the fish only when the eating phase begins.
-   Cat selection can continue to use weighted preferences, but it must
    never produce a dead end.
-   Existing cat names and personalities should be preserved unless the
    user approves a content change.
-   The current maximum of three simultaneous cats is a sensible initial
    cap; validate performance before changing it.
-   A cat must never be spawned twice at the same time.
-   A cat must not cover a feeding place, navigation control, diary
    button or resource basket.
-   Cats may visit even if the child has just returned from another
    scene; do not introduce background/offline simulation.

## 4.3 Gift system

Cats may leave: - a keepsake material for crafting; - a small decorative
object that can be placed directly; - a diary memory / observed
behaviour.

A single visit may produce one gift event, not a flood of rewards. Keep
gifts visually understandable and emotionally framed as a present.

Gift handling: 1. Gift appears near the cat or feeding place. 2. It
gently bounces / glows. 3. Child taps it to collect. 4. The gift travels
to the keepsake tray / inventory shelf. 5. A data-driven gift record is
saved.

If the child does not tap it immediately, it remains available. Never
expire gifts.

## 4.4 Decoration placement

Use fixed anchors and category compatibility rather than free-form
placement in the first release.

-   A recipe declares one or more compatible anchor categories.
-   A placed decoration records `itemId`, `anchorId`, and optional
    visual variant.
-   Tapping an occupied anchor opens a simple swap/remove-to-storage
    interaction.
-   Replacing an object returns the previous object to the
    finished-items tray; it is never destroyed.
-   The child can revisit the workshop and rearrange the village at any
    time.
-   Use stable anchor IDs so saved decorations remain in the same
    location after code updates.
-   If an anchor is removed in a future release, migrate the decoration
    to storage rather than deleting it.

## 4.5 Cat visit and world behaviour

Retain the existing calm visit lifecycle where possible: - food
placed; - short anticipation; - cat enters; - cat approaches a free
feeding spot; - cat sits / sniffs; - cat eats; - cat reacts / cuddles; -
gift appears; - cat leaves or stays for a gentle idle behaviour.

Do not add a countdown or make the child race the cat. Visit timing is
presentation only. Pause the simulation when the app is hidden or a
blocking diary/workshop overlay is open, consistent with the existing
engine's deterministic clock.

## 4.6 Persistence and migration

-   Persist resources, met cats, observed behaviours, crafted items and
    placed decorations.
-   Do not persist transient animation frames, pointer/drag state,
    active fishing bobber timing or open modal state.
-   Validate every loaded field and clamp resource values to safe
    bounds.
-   Unknown item IDs must not crash the game; preserve them safely in
    storage or migrate them.
-   Migrate the existing `catForestSave` without losing existing met
    cats or forest decorations.
-   Make save writes atomic where possible: construct and validate the
    new object before writing.
-   Handle malformed or unavailable local storage gracefully; the game
    must still boot with a fresh in-memory state.
-   Do not use real-clock elapsed time to generate resources or simulate
    visits while closed.
-   Confirm the parent reset flow clears the expanded Cat Forest save
    key(s) correctly.

------------------------------------------------------------------------

# 5. Visual art direction

## 5.1 Desired visual identity

Create an original **storybook woodland village**: warm, hand-painted,
soft, tactile and welcoming. The scene should feel like a lovingly
illustrated miniature set, not a flat emoji board and not a generic
platformer.

The Secret Cat Forest references communicate a peaceful, nature-led cat
sanctuary with collecting, crafting and an album. Translate that feeling
into Petras World's own art style.

### Art keywords

-   soft watercolor / gouache texture;
-   warm timber and cream plaster;
-   mossy greens and sage;
-   muted forest teal;
-   warm amber window light;
-   dusty rose and pale butter yellow accents;
-   soft blue pond water;
-   rounded silhouettes and gentle asymmetry;
-   subtle paper grain;
-   soft contact shadows;
-   hand-painted edges, never harsh outlines;
-   cozy, readable shapes at small tablet sizes.

### Avoid

-   photorealism;
-   hard black outlines;
-   neon saturation;
-   glossy mobile-game gradients;
-   generic flat vector icons mixed with painted scenes;
-   tiny details that disappear on a tablet;
-   visual clutter behind interactive objects;
-   copying Secret Cat Forest furniture or character art;
-   mixing the supplied platformer sprites directly into Cat Forest
    without a separate art approval.

## 5.2 Relationship to the supplied visual references

The supplied watercolor/platformer asset sheets may be used as **style
references only** for: - soft watercolor texture; - warm organic colour
transitions; - rounded object silhouettes; - gentle woodland
vegetation; - illustrated wood, flowers, stones and small props.

They are not an approved Cat Forest asset pack. Do not use their
platformer-specific pipes, coins, enemies, castles, terrain tiles or
unrelated creatures in Cat Forest. Do not crop assets from a sheet and
ship them as final art. Create a coherent, purpose-made Cat Forest set
with consistent lighting, camera angle, scale and edge treatment.

## 5.3 Camera and composition

-   Use a consistent 2D illustrated camera. Prefer a gentle
    three-quarter / front-facing diorama view for the house and garden.
-   Keep the horizon and ground plane consistent across the village,
    pond, woodland and workshop scenes.
-   Keep interactive objects at a consistent apparent scale.
-   Leave negative space around touch targets.
-   Use layered backgrounds: distant forest, middle-ground
    trees/buildings, foreground grass/flowers.
-   Use parallax only if it remains subtle and performs well; it is
    optional.
-   Never let foreground foliage overlap a button or a cat's face.
-   Use a consistent shadow direction and softness for every asset.

## 5.4 Character art

Create a coherent set of original cat illustrations based on the
existing ten cat identities. Preserve their recognisable identity, names
and accessories unless the user approves changes.

Each cat needs: - idle pose; - walk cycle or a small set of walk
frames; - sitting pose; - eating pose; - happy / cuddle reaction; -
optional sleep / play pose for later polish.

Do not require a full skeletal animation system. A small number of
sprite frames or layered poses is sufficient. Avoid relying on emoji
glyphs for the final character art once the illustrated-art direction is
approved.

Cats must: - have expressive but calm faces; - use rounded, soft
silhouettes; - be visually distinct by colour, markings and
accessories; - remain readable at small tablet scale; - use transparent
backgrounds for character cut-outs; - have consistent baseline, padding
and light direction.

## 5.5 Asset production requirements

Use the repository's current asset-generation and validation guidance.
Before generating: 1. Read `project/lessons/asset-generation.md`. 2.
Inspect `game/data/art-registry.js`, `game/shared/art.js`,
`tools/check_art.js`, the asset-generation tools and existing approved
reference assets. 3. Decide whether an asset is a transparent cut-out or
a full-bleed scene. 4. Record the prompt, reference choices, generation
provenance and QA result for every new asset.

Recommended categories:

  -----------------------------------------------------------------------
  Asset family            Examples                Rendering role
  ----------------------- ----------------------- -----------------------
  Scene backgrounds       village, pond,          Opaque full-bleed scene
                          woodland, workshop      art under
                                                  `game/assets/scenes/`

  House parts             cottage body, roof,     Layered scene elements
                          door, windows, porch    or one composited
                                                  scene, depending on
                                                  animation needs

  Cats                    ten cat identities and  Transparent cut-outs /
                          pose variants           sprite sheets under the
                                                  approved art pipeline

  Food                    fish, fish basket,      Transparent cut-outs
                          feeding dishes          

  Resources               log, branch, wood       Transparent cut-outs
                          stack, keepsake objects 

  Decorations             bench, flower pot,      Transparent cut-outs
                          birdhouse, lantern,     
                          mat, chime              

  Environment props       reeds, flowers, stones, Scene layer or
                          bushes, trees           transparent cut-outs

  UI                      diary cover, recipe     Transparent cut-outs or
                          cards, workshop button, CSS-built components
                          navigation icons        
  -----------------------------------------------------------------------

### Asset QA

Every asset must pass: - correct dimensions and alpha where required; -
no white matte / halo around transparent edges; - consistent lighting
and camera angle; - readable silhouette at actual display size; - no
text baked into art; - no unexpected extra objects; - no cropped ears,
tails or shadows; - no duplicate or near-duplicate assets; - file size
suitable for offline tablet use; - correct registry entry and at least
one real consumer.

Do not put opaque scene backgrounds in the transparent glyph folder.
Follow the current distinction between `game/assets/art/` and
`game/assets/scenes/`.

## 5.6 Suggested scene palette

Use these as starting colour families, not rigid pixel values: - forest
deep: muted pine / deep teal; - foliage: sage, moss and soft fern; -
house: warm honey wood, cream plaster, muted terracotta roof; - pond:
dusty blue / blue-green with pale reflections; - ground: warm grass
green with muted yellow highlights; - interior/workshop: warm wood,
linen cream, amber light; - UI surfaces: warm cream, pale sage and muted
plum for contrast.

All text and icons must maintain accessible contrast. Keep the overall
scene soft, but do not make controls low-contrast.

------------------------------------------------------------------------

# 6. Screen-by-screen interaction and UI requirements

## 6.1 Village screen

Must contain: - house as the dominant landmark; - three fixed feeding
anchors; - visible pond route / hotspot; - visible woodland gathering
hotspot; - visible workshop hotspot; - visible diary hotspot; - resource
baskets / stacks presented without numbers; - current day/night and rain
presentation, preserving existing child-controlled toggles if retained.

The scene must not feel like a row of buttons. World objects should be
the navigation.

## 6.2 Pond screen

Must contain: - pond background; - one large fishing interaction; - fish
basket; - catch feedback; - return to village control.

## 6.3 Woodland screen

Must contain: - fallen wood objects; - a large collection basket; -
one-tap collection; - clear return to village control.

## 6.4 Workshop screen

Must contain: - recipe cards with large illustrations; - selected item
preview; - ingredient icons; - one clear craft action; - finished item
state; - compatible placement anchor selection; - return to village.

Do not show a long scrollable catalog on the first screen. Group recipes
into a few visual categories only if the total number makes it
necessary.

## 6.5 Diary screen

Must contain: - discovered cats only; - large portraits; - cat name and
simple facts in Serbian Cyrillic if visible text is used; - optional
icon-based favourite food/place indicators; - close/back control.

No completion percentage, total count, silhouettes or locked pages.

------------------------------------------------------------------------

# 7. Technical implementation guidance

## 7.1 Repository-first architecture

The existing game is a plain HTML/CSS/JS PWA and must remain so. No
framework, package or runtime dependency should be introduced for this
expansion.

Before choosing file boundaries, inspect the current size and structure
of `game/games/cat_forest.js`. The current implementation already
contains a working engine and test hook. Do not replace it wholesale.

Recommended responsibilities:

-   `cat_forest.js`: boot, state orchestration, existing cat visit loop,
    persistence boundary and public test hook.
-   A game-owned scene module (if justified by actual file size):
    village/pond/woodland scene rendering and anchor layout.
-   A game-owned workshop module: recipe data, crafting and placement.
-   A game-owned data file: cat, decoration, gift and recipe
    definitions.
-   `cat_forest.html`: scene containers, page metadata, styles and
    script order.

Use the repository's existing script-loading style and naming
conventions. If the expansion can remain maintainable inside the current
IIFE without exceeding the established size/complexity limits, keep it
simple. If it cannot, propose the smallest game-specific split and
record the required offline inventory changes before proceeding.

Do not edit `game/shared/*` for convenience. Any shared-system
requirement is a blocker requiring separate user approval.

## 7.2 Scene state machine

Use a small explicit scene state: - `village` - `pond` - `woodland` -
`workshop` - `diary`

Only one main scene is interactive at a time. Modal cat detail pages are
overlays within the diary. Define scene entry/exit functions so they: -
preserve village state; - cancel or pause scene-specific transient
interactions safely; - avoid duplicate event listeners; - preserve the
game clock rules; - restore focus / accessible navigation sensibly; -
never reset resources or cat memories.

Do not create separate HTML pages for every scene unless repository
routing or performance evidence makes that necessary. Prefer one game
page with internal scene switching for the first release.

## 7.3 Data-driven definitions

Keep recipes, decorations, cat profiles, gift definitions and anchor
compatibility in data tables.

Example recipe record:

``` js
{
  id: "birdhouse",
  asset: "cf-birdhouse",
  category: "garden",
  ingredients: {
    wood: 3,
    feather: 1
  },
  anchors: ["tree", "fence"],
  previewScale: 1
}
```

Example decoration record:

``` js
{
  id: "birdhouse",
  anchorId: "garden.tree.base",
  variant: "default"
}
```

These are examples only. Match the repository's actual data conventions
and art registry before implementation.

## 7.4 Animation and performance

-   Prefer transform and opacity for animation.
-   Avoid per-frame DOM creation, repeated layout measurement and
    expensive blur/filter effects.
-   Reuse or pool transient nodes.
-   Cap active cats, particles, floating objects and ambient effects.
-   Pause or freeze simulation while hidden, and when a blocking modal
    is open.
-   Use the existing deterministic game clock and test hook patterns.
-   Reduced-motion mode must remove decorative motion and simplify
    essential transitions without hiding state changes.
-   No CSS animation should make an interactive target temporarily
    smaller than its required hit area.
-   Use `pointer-events: none` for decorative layers; only actual
    controls should intercept input.

## 7.5 Input and accessibility

-   Tap is the primary input everywhere.
-   Drag is optional and must have a tap equivalent.
-   Touch targets should meet the current project standards: large
    targets on tablet and at least the established short-landscape
    minimum.
-   All buttons must have Serbian Cyrillic `aria-label`s.
-   Decorative art must be hidden from assistive technology.
-   Focus-visible treatment must remain usable.
-   Avoid relying on colour alone to show selection.
-   No essential instruction may be delivered only through sound.

## 7.6 Offline and generated artefacts

Any new runtime file or asset must be included in the project's offline
inventory through the prescribed tooling. The deployed `docs/` mirror
must be regenerated from `game/`; never edit it directly. Run the
repository's current validators to discover all required manifest, cache
and registry updates rather than guessing.

------------------------------------------------------------------------

# 8. Proposed implementation phases

Do not attempt the entire expansion in one large unreviewable code
change. Deliver it in small phases with a playable result after each.

## Phase 0 --- Reconnaissance and approval

**Deliverables** - Verified current-state report. - Current branch /
tree / CI baseline. - Decision-change list for §1. - Updated Cat Forest
roadmap and task ledger proposal.

**Exit gate** - User explicitly approves the product changes. - Existing
code, save schema, asset pipeline and test commands are verified.

## Phase 1 --- Art direction and scene prototypes

**Deliverables** - One approved village-house concept. - One approved
cat illustration sample using an existing cat identity. - One approved
food / fish basket sample. - One approved decoration sample. - Palette,
camera, shadow and scale guide. - Scene layout mockups for village,
pond, woodland and workshop.

**Exit gate** - User approves the visual direction before bulk asset
generation. - Art QA rules and asset locations are confirmed.

## Phase 2 --- Village hub and fixed feeding area

**Deliverables** - New village scene with house and garden. - Three
fixed feeding places. - Existing cat visit lifecycle integrated into the
house scene. - Cat positions, collision/hit testing and touch
geometry. - Existing day/night and weather presentation retained or
deliberately migrated.

**Exit gate** - Existing cat feeding still works. - No feeding anchor
moves between viewport sizes. - Existing save data remains readable. -
Smoke and viewport checks pass.

## Phase 3 --- Fish gathering and feeding inventory

**Deliverables** - Pond scene. - Simple fishing interaction. -
Illustrated fish basket. - Fish resource state and save migration. -
Feeding consumes fish at the correct lifecycle moment. - Empty-basket
path leads directly to fishing with no error or dead end.

**Exit gate** - Fish can be collected repeatedly. - Fish survives scene
changes and reloads. - No fish is lost on a missed tap or interrupted
animation. - Feeding never consumes fish twice.

## Phase 4 --- Wood gathering

**Deliverables** - Woodland clearing scene. - Tap-to-collect fallen
wood. - Illustrated wood basket / pile. - Wood resource state and
persistence. - Safe, gentle collection feedback.

**Exit gate** - Every pickup is collected once. - No tool, stamina,
timer or failure system is introduced. - Wood persists across scenes and
reloads.

## Phase 5 --- Workshop and crafting

**Deliverables** - Workshop scene. - Data-driven recipe table. - Initial
set of 8--10 decorations. - Material preview. - Instant craft
interaction. - Finished-items tray. - Compatible placement anchors in
the house/garden. - Swap/reposition without destroying objects.

**Exit gate** - Recipe requirements are correct. - Materials are
deducted exactly once. - Finished items cannot disappear if the child
exits early. - Every decoration can be placed and restored after reload.

## Phase 6 --- Cat gifts and richer cat diary

**Deliverables** - Gift material table. - Cat gift selection and
collection flow. - Diary gallery and detail view. - Favourite food/place
and personality data. - Observed behaviour memory. - Safe save
migration.

**Exit gate** - Existing discovered cats remain in the diary. - No
unseen-cat silhouettes or completion counters. - Gifts never expire. -
Diary pauses and resumes the world safely.

## Phase 7 --- Art integration and polish

**Deliverables** - Approved full asset set. - Scene composition and
depth. - Cat pose/animation integration. - Ambient details. - Sound
polish using existing approved audio helpers; no new audio files unless
separately approved. - Responsive layouts and reduced-motion treatment.

**Exit gate** - Art QA passes. - No layout overlap or inaccessible
controls. - Performance remains smooth on the target Android tablet.

## Phase 8 --- Full regression, playtest and release

**Deliverables** - Expanded Cat Forest smoke suite. - Viewport
screenshot battery and visual review. - Offline validation. - Save
migration tests. - Real-device playtest with a child. - Updated
`project/games/cat-forest.md`, decisions, status and progress ledger. -
Release gate evidence.

**Exit gate** - All required tests actually run and are green, or
explicitly marked unverified with commands. - User approves the visual
and gameplay result. - Release / commit / push follows the current
repository rules.

------------------------------------------------------------------------

# 9. Acceptance criteria --- definition of complete

The expansion is not complete merely because each screen exists. All
applicable criteria below must be demonstrated.

## 9.1 World and navigation

-   [ ] Village house is the default scene.
-   [ ] Three feeding places have fixed, stable positions.
-   [ ] Pond, woodland, workshop and diary can be reached with obvious
    large controls / world hotspots.
-   [ ] Every scene returns to the village without losing state.
-   [ ] No scene depends on swipe-only navigation.
-   [ ] No controls overlap or become untappable at supported viewports.

## 9.2 Fishing and feeding

-   [ ] Child can catch fish with simple taps.
-   [ ] Missed / early taps never fail or remove a resource.
-   [ ] Fish is shown visually in a basket, without numeric counters.
-   [ ] Child can place fish on any free feeding place.
-   [ ] Cat consumes exactly one fish when eating starts.
-   [ ] A cat visit can produce a keepsake gift.
-   [ ] Empty fish supply always has a clear, gentle route to fishing.

## 9.3 Wood and crafting

-   [ ] Child can collect fallen wood with simple taps.
-   [ ] Wood is represented by a visible pile/basket, not a number.
-   [ ] Workshop recipes are data-driven.
-   [ ] Crafting is immediate; no timer or waiting mechanic.
-   [ ] Crafting consumes exactly the declared materials.
-   [ ] Finished decorations persist until placed.
-   [ ] Decoration placement uses compatible fixed anchors.
-   [ ] Replacing a decoration returns it to storage; nothing is
    destroyed.
-   [ ] No currency, shop, paid items or locked recipe gates exist.

## 9.4 Cats and diary

-   [ ] Existing cat identities and discovered-cat data are preserved.
-   [ ] Cats can eat, cuddle and perform gentle idle behaviours.
-   [ ] Cat gifts are collected without expiry.
-   [ ] Diary contains cats already met and their available information.
-   [ ] No completion percentage, silhouettes or unseen-cat placeholders
    appear.
-   [ ] Diary state persists and opening it pauses the simulation.

## 9.5 Visual and accessibility

-   [ ] House, garden, pond, woodland, workshop and cats share one art
    direction.
-   [ ] All art is original and has documented provenance.
-   [ ] Transparent cut-outs and opaque scene backgrounds use the
    correct asset locations.
-   [ ] No visual element blocks a touch target.
-   [ ] Controls meet current project touch-target standards.
-   [ ] Serbian Cyrillic accessible labels are present.
-   [ ] Reduced-motion mode is tested and remains pleasant.
-   [ ] No flashing, harsh effects or sudden loud sounds.
-   [ ] The game is understandable without reading.

## 9.6 Technical and release

-   [ ] Existing save data migrates without loss.
-   [ ] Malformed saves do not prevent boot.
-   [ ] Offline assets and generated manifests are correct.
-   [ ] `docs/` mirrors `game/`.
-   [ ] Cat Forest smoke covers all new behaviours and negative cases.
-   [ ] Relevant fast, game, offline and release checks are run and
    recorded.
-   [ ] Screenshots are refreshed for all affected viewports and
    reviewed.
-   [ ] Real-device playtest findings are recorded.
-   [ ] User approval is explicit.

------------------------------------------------------------------------

# 10. Required test matrix

Use the repository's current viewport matrix and add any
project-required device sizes discovered during reconnaissance.

At minimum: - 1024 × 800 landscape tablet; - 844 × 390 short
landscape; - 390 × 844 portrait; - one larger desktop viewport if the
game supports it.

For each viewport verify: - house and feeding area composition; - fixed
anchor positions and hit testing; - pond fishing targets; - wood pickup
targets; - workshop recipe and craft controls; - diary cards and close
control; - no horizontal/vertical scrolling; - no clipped cat portraits
or decoration; - no overlapping resource basket and navigation; - no
control obscured by scenery.

### Functional cases

1.  Fresh save / first boot.
2.  Existing save with met cats and decorations.
3.  Malformed save.
4.  Fish collection and repeated collection.
5.  Fish basket empty → pond route.
6.  Place fish on each of the three feeding spots.
7.  Leave scene while a cat is approaching.
8.  Pause / resume while cat is eating.
9.  Gift remains after leaving the village.
10. Wood collection from each pickup.
11. Craft with sufficient materials.
12. Attempt craft with insufficient materials.
13. Exit workshop immediately after crafting.
14. Place decoration in every compatible anchor category.
15. Replace a placed decoration and confirm it returns to storage.
16. Reload with multiple placed decorations.
17. Open diary while cats are present.
18. Confirm discovered cats remain after save migration.
19. Confirm unseen cats are not represented by silhouettes.
20. Reduced-motion mode.
21. App hidden / restored.
22. Offline boot with network unavailable.
23. Repeated scene entry/exit does not duplicate listeners or
    animations.
24. Reset through the parent reset flow.

### Negative / invariant checks

-   No `fetch`, XHR, WebSocket, beacon or remote asset URLs.
-   No ads, analytics, tracking or IAP.
-   No `setInterval`-based game loop.
-   No `Date.now()` / wall-clock progression for resources.
-   No visible resource digits, timers, scores, levels, currency or
    progress percentages.
-   No failure / game-over / life-loss path.
-   No expiring gifts or destroyed decorations.
-   No duplicate consumption of fish or crafting materials.
-   No save wipe during migration.
-   No game-owned runtime dependency on `resources/` or `tools/`.
-   No change to `game/shared/*` without separate approval.

------------------------------------------------------------------------

# 11. Risks and mitigations

  -----------------------------------------------------------------------
  Risk                                Mitigation
  ----------------------------------- -----------------------------------
  Expansion contradicts approved      User approval checkpoint before
  emoji-only / no-inventory rules     implementation; record dated
                                      decision changes

  Too many systems overwhelm a        Keep the village central; expose
  toddler                             only a few large world hotspots;
                                      one action per activity

  Resource scarcity becomes           Generous collection, no failure, no
  frustrating                         timers, no loss; always provide a
                                      direct gathering route

  New art feels inconsistent          Approve one sample of each major
                                      asset family before bulk generation

  Existing saves break                Versioned migration, preserve met
                                      cats and decorations, test old and
                                      malformed saves

  Existing cat loop regresses         Keep current engine and lifecycle;
                                      add regression assertions before
                                      refactoring

  Scene code becomes too large        Inspect current file size; split
                                      only into game-owned modules with
                                      explicit offline wiring

  Touch targets overlap               Stable normalized anchors;
                                      automated hit-test geometry across
                                      viewports

  Too much animation hurts tablet     Transform/opacity, bounded nodes,
  performance                         capped actors, reduced-motion path

  Workshop becomes a shop/economy     No currency, prices, purchases,
                                      timers or locks; recipes are simple
                                      material combinations

  Gifts / crafted items disappear     Persistent storage, no expiry,
                                      replacement returns items to
                                      storage

  Art assets bloat offline bundle     Compress, validate dimensions,
                                      reuse modular props and limit
                                      animation frames
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# 12. Data/content authoring checklist

Before adding a cat, gift, recipe or decoration, the implementing AI
must add a data record and verify:

### Cat

-   stable ID;
-   Serbian Cyrillic name;
-   portrait and required poses;
-   favourite food;
-   favourite place;
-   one or two gentle personality traits;
-   visit / idle behaviours;
-   gift pool;
-   diary facts and unlock conditions based only on actual encounters.

### Gift

-   stable ID;
-   illustration;
-   category;
-   inventory display;
-   recipe compatibility;
-   whether it can also be placed directly;
-   safe fallback if an asset is missing.

### Recipe

-   stable ID;
-   finished-item asset;
-   ingredient list;
-   compatible anchor categories;
-   preview scale;
-   placement behaviour;
-   storage / replacement behaviour.

### Decoration

-   stable ID;
-   art asset;
-   allowed anchor categories;
-   scene layering / z-order;
-   hit area if interactive;
-   persistence representation;
-   fallback if the anchor no longer exists.

------------------------------------------------------------------------

# 13. Art generation prompt templates

These are starting prompts. The asset-generation lesson and current
project pipeline take precedence. Prompts must be refined against
approved references and tested at actual in-game size.

## 13.1 Village background

> Original cozy woodland village scene for a gentle children's cat-care
> game. A small warm timber-and-cream cottage with a welcoming porch and
> three clearly readable feeding positions, surrounded by a soft garden,
> rounded bushes, wildflowers and mature forest trees. Gentle
> three-quarter storybook diorama camera, watercolor and gouache
> texture, warm muted forest palette, soft daylight, subtle paper grain,
> rounded friendly shapes, clean readable composition, generous negative
> space around interactive objects, no characters, no text, no UI, no
> logos, no copied game assets. Wide landscape composition, designed as
> an opaque game background.

## 13.2 Pond scene

> Original peaceful woodland pond for a cozy children's game. Soft
> blue-green water, lily pads, reeds, a small wooden dock, smooth stones
> and a visible safe fishing spot. Warm watercolor/gouache storybook
> illustration, rounded forms, gentle reflections, muted natural
> palette, consistent three-quarter camera and light direction with the
> approved village scene, clean readable areas for touch interactions,
> no text, no UI, no characters, no logos.

## 13.3 Woodland gathering scene

> Original friendly woodland clearing for a toddler-friendly game. A
> broad tree stump, a few naturally fallen branches and small log
> bundles, moss, ferns and a woven wood basket. No axe, saw, sharp tools
> or cutting action. Warm hand-painted watercolor/gouache storybook
> style, soft forest palette, rounded silhouettes, consistent camera and
> lighting with the approved village scene, clear separation between
> interactive objects, no text or UI.

## 13.4 Workshop scene

> Original cozy open-front woodland craft shed for a gentle cat village
> game. Warm timber workbench, shelves, woven baskets, a small pile of
> logs, soft fabric scraps, feathers, shells and flowers arranged as
> keepsakes. Inviting amber light, rounded handmade furniture,
> watercolor/gouache storybook illustration, consistent three-quarter
> camera, clear central work surface and uncluttered interaction zones,
> no text, no UI, no logos.

## 13.5 Cat character sheet

> Original character design sheet for \[existing Cat Forest cat
> identity\]. Preserve the approved cat's identifying coat pattern,
> colour and accessory. Create a warm, expressive, friendly domestic cat
> with rounded proportions and gentle eyes. Soft watercolor/gouache
> texture, subtle paper grain, consistent light from upper left, full
> body, clean silhouette, transparent background, no text, no border, no
> extra props. Provide separate consistent poses: idle, walk, sit, eat,
> happy/cuddle and sleep.

## 13.6 Decoration cut-out

> Original hand-painted \[decoration name\] for a cozy woodland cat
> village. Soft watercolor/gouache texture, rounded handmade
> construction, warm natural materials, gentle upper-left lighting,
> subtle contact shadow, clean readable silhouette, transparent
> background, centred object, no text, no border, no extra objects,
> designed to match the approved Cat Forest house and garden assets.

------------------------------------------------------------------------

# 14. Documentation and handoff requirements

When each phase is complete, update the live project documents using the
current workflow.

At minimum: - `project/DECISIONS.md`: dated approval of revised Cat
Forest principles. - `project/games/cat-forest.md`: current scenes,
mechanics, save schema, data tables and test hook. -
`resources/General_reviews/Cat_Forest/PROGRESS.md`: task-by-task
evidence and remaining work. -
`resources/General_reviews/Cat_Forest/02_ROADMAP.md` / `03_TASKS.md`:
revised roadmap and bounded task cards. - `project/STATUS.md`: verified
summary of the actual current state. - `project/tasks/ACTIVE.md` and
task archive: follow the current process.

Do not paste this entire plan into `project/`. The full implementation
brief belongs under `resources/`; keep live project docs concise and
factual.

## 14.1 Handoff report format

At the end of each task, report:

``` text
Task:
Status: proposed / in progress / completed locally / committed / verified / blocked
Files changed:
Behaviour implemented:
Tests actually run:
Test results:
Screenshots captured and reviewed:
Save migration status:
Offline / docs sync status:
User approvals still required:
Known limitations:
Next task:
```

Never label a feature "done" if it is only coded but not validated.
Never label it "approved" unless the user explicitly approved it.

------------------------------------------------------------------------

# 15. Reference material

## Repository sources

-   Repository: https://github.com/radmanmilos/Games-for-kids
-   Existing Cat Forest guide: `project/games/cat-forest.md`
-   Existing implementation package:
    `resources/General_reviews/Cat_Forest/`
-   Existing engine: `game/games/cat_forest.js`
-   Existing page: `game/pages/cat_forest.html`
-   Project rules: `AGENTS.md`, `project/DECISIONS.md`,
    `project/PROCESS.md`

## Inspiration sources

-   Secret Cat Forest official website: https://secretcatforest.com/
-   Secret Cat Forest Wiki:
    https://secret-cat-forest.fandom.com/wiki/Secret_Cat_Forest_Wiki
-   Secret Cat Forest Google Play listing and developer description:
    https://play.google.com/store/apps/details?id=air.net.ideasam.games.cat
-   Secret Cat Forest App Store listing:
    https://apps.apple.com/us/app/secret-cat-forest/id1499609320

The official store description confirms the broad inspiration loop:
furniture crafting, fishing for fish, collecting wood from a tree, gifts
from cats, an archive/album and cats with distinct behaviours. This plan
adapts those ideas; it does not copy the original game's economy,
timers, monetization, cloud services or exact assets.

------------------------------------------------------------------------

# 16. Final instruction to the local AI

Build a **cozy, original cat village**, not a clone and not a
conventional resource-management game.

The house is the heart of the experience. The three feeding places are
fixed and immediately understandable. The pond gives the child fish. The
woodland gives the child wood. Cats bring small keepsakes. The workshop
turns those materials into decorations. The garden and house visibly
change as the child places those decorations. The diary preserves the
cats and their personalities.

Keep the existing Cat Forest code and product identity wherever
possible. Reconcile every conflict with the user's approved decisions
before coding. Implement in phases, verify every change, preserve
existing saves, and keep the result gentle, beautiful, readable and
joyful for a very young child.
