/* App Registry — single authoritative source for every public page/route.
   Loaded as a regular script; defines window.APP_REGISTRY.

   R7 made this a full test contract. Every tool reads it through
   tools/registry.js, and the runtime reads the two routing fields below, so
   there is exactly ONE place that knows which pages exist.

   Fields, and who consumes each:
     id            - stable key. Screenshots, smokes, offline specs, CI matrix.
     path          - the file on disk, relative to game/.
     category      - 'learning' | 'create' | 'games' | 'parent'.
                     'parent' is what marks the adult surface; `role` is DERIVED
                     from it in tools/registry.js, never stored, so the two can
                     never disagree.
     title         - Serbian Cyrillic name a child sees.
     smoke         - the *_smoke.js that covers this page, or null.
     screenshot    - whether visual_compare should expect a baseline.
     offline       - whether the page belongs in the offline inventory.
     toddler       - whether it is designed for the youngest cohort.
     route         - the hub `data-go` value that opens this page. Consumed by
                     game/shared/navigation.js (it used to hardcode 17
                     `if (id === 'game-x') location.href = ...` lines) and by
                     hub_smoke.js, which used to keep its own list of them.
     hubGroup      - 'games' | 'learning' | null. Which child sub-hub shows the
                     button; consumed by hub_smoke.js and the back target.
     back          - element id of this page's back button, or null when the page
                     self-wires its own (animal_counting, animal_memory and
                     animal_puzzle build their UI in JS and bind `.back-btn`
                     themselves, so there is no id to hand out). Consumed by
                     game/shared/main.js, which used to keep a second
                     hand-authored table of these - and which still listed the
                     deleted 2D `racing.html`, dead.
     start         - the window.<name> boot function, or null when the page boots
                     itself. Consumed by main.js the same way.

   Deliberately NOT here (R7 recorded the decision): `orientation`, `interaction`
   and `requiresAudio`. All three were recommended, but nothing reads them yet,
   and an unread field is a field that can silently lie. They belong to R9/R15,
   where a consumer exists to be wrong with them. */
window.APP_REGISTRY = [
  { id: 'animals', path: 'pages/animals.html', category: 'learning', title: 'Животиње', smoke: 'animals_smoke', screenshot: true, offline: true, toddler: true,
    route: 'game-animals', hubOrder: 3, hubGroup: 'learning', back: 'animals-back', start: 'startAnimals' },
  { id: 'animal_counting', path: 'pages/animal_counting.html', category: 'learning', title: 'Бројање', smoke: 'counting_smoke', screenshot: true, offline: true, toddler: true,
    route: 'game-counting', hubOrder: 5, hubGroup: 'learning', back: null, start: null },
  { id: 'animal_memory', path: 'pages/animal_memory.html', category: 'learning', title: 'Памтилица', smoke: 'memory_smoke', screenshot: true, offline: true, toddler: true,
    route: 'game-memory', hubOrder: 7, hubGroup: 'games', back: null, start: null },
  { id: 'animal_puzzle', path: 'pages/animal_puzzle.html', category: 'learning', title: 'Слагалице', smoke: 'puzzle_smoke', screenshot: true, offline: true, toddler: true,
    route: 'game-puzzle', hubOrder: 8, hubGroup: 'games', back: null, start: null },
  { id: 'classroom', path: 'pages/classroom.html', category: 'learning', title: 'Учионица', smoke: 'classroom_smoke', screenshot: true, offline: true, toddler: true,
    route: 'game-classroom', hubOrder: 1, hubGroup: 'learning', back: 'classroom-back', start: 'startClassroom' },
  { id: 'coloring', path: 'pages/coloring.html', category: 'create', title: 'Бојење', smoke: 'coloring_smoke', screenshot: true, offline: true, toddler: true,
    route: 'game-coloring', hubOrder: 6, hubGroup: 'learning', back: 'coloring-back', start: 'startColoring' },
  { id: 'tracing', path: 'pages/tracing.html', category: 'learning', title: 'Писање', smoke: 'tracing_smoke', screenshot: true, offline: true, toddler: true,
    route: 'game-tracing', hubOrder: 2, hubGroup: 'learning', back: 'tracing-back', start: 'startTracing' },
  { id: 'piano', path: 'pages/piano.html', category: 'learning', title: 'Пијано', smoke: 'piano_smoke', screenshot: true, offline: true, toddler: true,
    route: 'game-piano', hubOrder: 7, hubGroup: 'learning', back: 'piano-back', start: 'startPiano' },
  { id: 'shapes', path: 'pages/shapes.html', category: 'learning', title: 'Облици', smoke: 'shapes_smoke', screenshot: true, offline: true, toddler: true,
    route: 'game-shapes', hubOrder: 4, hubGroup: 'learning', back: 'shapes-back', start: 'startShapesRound' },
  { id: 'matching_game', path: 'pages/matching_game.html', category: 'games', title: 'Слагалица бомбона', smoke: 'candy_smoke', screenshot: true, offline: true, toddler: true,
    route: 'game-candy', hubOrder: 6, hubGroup: 'games', back: 'candy-back', start: 'startCandy' },
  { id: 'driving', path: 'pages/driving.html', category: 'games', title: 'Возила', smoke: 'driving_smoke', screenshot: true, offline: true, toddler: false,
    route: 'game-driving', hubOrder: 2, hubGroup: 'games', back: 'driving-back', start: 'startDriving' },
  { id: 'ocean', path: 'pages/ocean.html', category: 'games', title: 'Океан', smoke: 'ocean_smoke', screenshot: true, offline: true, toddler: false,
    route: 'game-ocean', hubOrder: 3, hubGroup: 'games', back: 'ocean-back', start: 'startOcean' },
  { id: 'dino', path: 'pages/dino.html', category: 'games', title: 'Дино', smoke: 'dino_smoke', screenshot: true, offline: true, toddler: false,
    route: 'game-dino', hubOrder: 4, hubGroup: 'games', back: 'dino-back', start: 'startDino' },
  { id: 'space', path: 'pages/space.html', category: 'games', title: 'Свемир', smoke: 'space_smoke', screenshot: true, offline: true, toddler: false,
    route: 'game-space', hubOrder: 5, hubGroup: 'games', back: 'space-back', start: 'startSpace' },
  { id: 'racing3d', path: 'pages/racing3d.html', category: 'games', title: 'Мала тркачица 3Д', smoke: 'racing3d_smoke', screenshot: true, offline: true, toddler: false,
    route: 'game-racing3d', hubOrder: 10, hubGroup: 'games', back: 'r3d-back', start: 'startRacing3D' },
  { id: 'explorer', path: 'pages/explorer.html', category: 'games', title: 'Мала истраживачица', smoke: 'kitty_smoke', screenshot: true, offline: true, toddler: false,
    route: 'game-explorer', hubOrder: 1, hubGroup: 'games', back: 'back-btn', start: null },
  { id: 'parent', path: 'pages/parent.html', category: 'parent', title: 'За родитеље', smoke: null, screenshot: false, offline: true, toddler: false,
    route: 'game-parent', hubOrder: null, hubGroup: null, back: 'back-btn', start: null }
];