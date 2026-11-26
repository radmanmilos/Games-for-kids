# Cat Forest — Visual Reconstruction and UX Specification

**Status:** Design/implementation specification derived from the prior Cat Forest review and available project art-direction context. Verify it against current approved repository documents before treating any detail as binding.

## 1. The problem to solve

The visual issue identified in the previous repository review was not simply “there are too few illustrations.” The issue was a lack of a consistent, fully realized visual world. At the reviewed snapshot:

- some cat artwork had been added, but the commit described only two painted cat asset types;
- the village house and pond included CSS-built/geometric elements;
- scenery and some controls still relied on emoji/glyphs;
- the art renderer and registry existed, but that alone did not prove that every intended asset was visible in the game;
- scene names/state declarations existed for more than one scene, while scene-specific implementations were described as placeholders in parts of the reviewed code;
- the screenshot index pointed to older screenshots and therefore did not establish the appearance of the latest build.

**This is a historical review snapshot, not a claim about the current checkout.** Re-inspect the repository and running game before changing anything.

## 2. Art direction

### 2.1 Desired identity

Create an original, cozy woodland storybook world with a hand-painted watercolor/gouache feeling. It should feel warm, tactile, calm and carefully composed — not like a generic platform game, flat icon set, emoji collage or collection of unrelated AI images.

Visual qualities:

- soft watercolor washes and subtle gouache opacity;
- delicate paper/paint texture, restrained rather than noisy;
- rounded, organic silhouettes and handmade details;
- warm natural light, gentle contact shadows and consistent light direction;
- muted woodland greens, moss, warm cream, bark brown, muted teal, soft berry and restrained flower accents;
- enough value contrast to separate foreground objects from the background;
- clean silhouettes at small tablet sizes;
- a consistent edge treatment: do not mix hard vector outlines, photorealistic textures, flat emoji and painterly assets without a deliberate, documented reason.

Avoid:

- photorealism, 3D-rendered/plastic appearance, glossy gradients and harsh outlines;
- oversaturated neon colors or excessive decorative clutter;
- inconsistent perspective, scale, light direction or shadow softness;
- tiny high-detail objects that disappear on tablets;
- text embedded in generated art;
- random changes in style between scene backgrounds, cats and props;
- copied Secret Cat Forest art, layout, names, characters or proprietary assets.

### 2.2 Camera and world consistency

Use one consistent 2D illustrated camera language across all connected scenes. The established art-direction context calls for a gentle front-facing/three-quarter diorama feel for the house and garden, with a consistent horizon and ground plane across village, pond, woodland and workshop.

Compose scenes in depth:

1. distant forest / sky / atmospheric background;
2. midground trees, buildings and larger scenery;
3. foreground grass, paths, flowers and interactive props.

Maintain consistent object scale and perspective between scenes. The user should feel that the pond and woodland are nearby parts of the same place, not separate games.

## 3. Asset hierarchy and integration

Treat the visual system as a complete stack, not just character sprites:

1. **Scene backgrounds:** large, coherent, full-bleed illustrated environments.
2. **Structural scene elements:** house, porch, pond banks, trees, paths, workshop exterior/interior as applicable.
3. **Interactive props:** feeding plates, fish basket, wood pile, tools, furniture, decorations.
4. **Characters:** cats and their approved accessories/expressions/poses.
5. **UI elements:** navigation controls, book/diary, buttons, indicators and feedback.
6. **Effects:** subtle glows, sparkles, ripples, falling leaves and gentle transitions.

Each layer must share the same palette, perspective, light source, texture density and edge treatment. Do not use a beautiful painted cat over a visibly unrelated CSS house and emoji forest and call the scene complete.

### 3.1 Registry is not integration

For every asset, verify the full chain:

- source file exists;
- file is the intended final version and has the correct format/dimensions;
- runtime copy exists under `game/` at the expected path;
- asset is registered correctly if the project uses a registry;
- the relevant game code references it;
- the browser successfully loads it;
- it renders at the correct scale, crop, layer and position;
- it has been visually reviewed in the actual game.

Record these states separately in the asset inventory. Never infer the last four steps from the first three.

### 3.2 CSS and emoji policy

CSS remains appropriate for layout, hit areas, responsive positioning, simple masks and subtle interaction states. It should not be the primary illustration method for major storybook objects when approved painted assets are available or required by the approved art direction.

Emoji may remain where explicitly approved as part of the original game identity or as temporary, documented fallback. Do not scatter emoji into a painted scene as permanent scenery. Keep the fallback visually quiet and record it as unresolved work.

## 4. Scene composition and UX

The following scene descriptions are visual targets from the expansion proposal. They are not authorization to add unapproved mechanics. If a scene or feature is not approved in the current product decisions, implement only an approved visual shell or leave it out and ask for approval.

### 4.1 Village / house hub

The house is the visual anchor and emotional home of Cat Forest.

- Make the house the dominant, instantly recognizable focal point.
- Show a welcoming porch/garden and clear path/visual connection to adjacent areas.
- Preserve the established three feeding positions if they remain part of the approved design; they should read as one familiar feeding area, not three unrelated controls.
- Make interactive objects visually distinct from decoration without using loud outlines or intrusive labels.
- Use a small number of meaningful focal points; avoid crowding the scene with flowers, props and UI.
- Provide clear visual feedback when a child taps a valid interactive object.

### 4.2 Pond

If approved and implemented, the pond should feel like a nearby natural place in the same world:

- organic shoreline and readable water edge;
- gentle water color variation, soft reflections and restrained ripple animation;
- clear foreground interaction area;
- no confusing decorative movement that competes with the primary action;
- a visible return/navigation affordance consistent with the village.

### 4.3 Woodland

If approved and implemented:

- layered trees, ground cover and a readable path;
- clear foreground gathering targets;
- distinguishable interactable resources without visual clutter;
- use the same horizon, scale and light as the village and pond.

### 4.4 Workshop

If approved and implemented:

- cozy, inviting, uncluttered composition;
- work surfaces and objects arranged in a simple visual hierarchy;
- large tappable object choices;
- avoid dense crafting menus, tiny slots, counters or text instructions.

### 4.5 Diary / friends book

Preserve the existing emotional tone and discovered-only principle if present in approved design:

- warm, tactile book presentation;
- one cat per clear page/card;
- expressive portrait and a small number of readable visual details;
- child-facing text must follow the project's Serbian Cyrillic rules;
- do not expose undiscovered cats or add complex stats unless approved.

## 5. UI and interaction quality

- Prioritize large, forgiving touch targets suitable for ages approximately 2–6.
- Every important action must be understandable from visual affordance and immediate feedback, not a paragraph of instructions.
- Avoid small text, dense toolbars, numeric counters and multi-step menus unless explicitly approved.
- Keep navigation placement and visual treatment consistent between scenes.
- Use clear pressed/selected/disabled states without harsh color flashes.
- Animations should be short, gentle and purposeful; respect `prefers-reduced-motion`.
- Avoid simultaneous competing motion. The main interactive object must remain visually dominant.
- Keep all core interactions possible with simple taps. Dragging must not be the only way to complete an action.
- Provide a calm and obvious route back to the hub.
- Do not add timers, countdowns, failure, punishment, loss or pressure.

## 6. Responsive composition

Do not merely scale a desktop composition down. Re-check composition and hit targets at the actual supported viewport sizes and device orientations.

At minimum, use the repository's configured visual states and add/adjust coverage only through the approved project process. Check:

- narrow phone portrait;
- typical phone portrait;
- tablet portrait;
- tablet landscape / wide viewport;
- reduced-motion mode;
- long/short content states where applicable.

Verify that:

- focal objects remain visible;
- no important object is clipped or hidden behind controls;
- tap targets remain comfortably large;
- background art crops intentionally;
- foreground objects do not overlap critical UI;
- no horizontal scrolling appears unless explicitly intended.

## 7. Visual QA checklist

For each affected scene and state, capture actual screenshots from the running build and inspect them. A screenshot filename or index entry alone is not a visual review.

- [ ] Scene reads as one coherent illustration.
- [ ] Background, characters, props and UI share one art direction.
- [ ] Perspective, horizon, scale, lighting and shadows are consistent.
- [ ] No accidental emoji/CSS placeholder remains in a final painted scene.
- [ ] All interactive objects are recognizable and distinguishable from decoration.
- [ ] Primary action is obvious without reading.
- [ ] Feedback is gentle and immediately understandable.
- [ ] No clipping, overlap, awkward cropping or tiny hit areas.
- [ ] Scene remains readable at all target viewports.
- [ ] Reduced-motion mode remains usable and visually complete.
- [ ] Offline loading works; no remote assets or network dependency.
- [ ] Screenshots are current, correctly mapped to the game/state and reviewed.

## 8. Completion standard

A scene is not visually complete because its background image exists, its assets are registered, or the code compiles. It is complete only after the actual running scene has been captured and reviewed at target viewports, all key assets are confirmed to load, interactions are understandable, and the relevant project checks pass.
