/* App Registry — single authoritative source for all public pages/routes.
   Loaded as a regular script; defines window.APP_REGISTRY.
   Tools (run_all.js, screenshot.js, axe_check.js, play_matrix.mjs) read from this. */
window.APP_REGISTRY = [
  { id: 'animals', path: 'pages/animals.html', category: 'learning', title: 'Животиње', smoke: 'animals_smoke', screenshot: true, offline: true, toddler: true },
  { id: 'animal_counting', path: 'pages/animal_counting.html', category: 'learning', title: 'Бројање', smoke: 'counting_smoke', screenshot: true, offline: true, toddler: true },
  { id: 'animal_memory', path: 'pages/animal_memory.html', category: 'learning', title: 'Памтилица', smoke: 'memory_smoke', screenshot: true, offline: true, toddler: true },
  { id: 'animal_puzzle', path: 'pages/animal_puzzle.html', category: 'learning', title: 'Слагалице', smoke: 'puzzle_smoke', screenshot: true, offline: true, toddler: true },
  { id: 'classroom', path: 'pages/classroom.html', category: 'learning', title: 'Учионица', smoke: 'classroom_smoke', screenshot: true, offline: true, toddler: true },
  { id: 'coloring', path: 'pages/coloring.html', category: 'create', title: 'Бојење', smoke: 'coloring_smoke', screenshot: true, offline: true, toddler: true },
  { id: 'tracing', path: 'pages/tracing.html', category: 'learning', title: 'Писање', smoke: 'tracing_smoke', screenshot: true, offline: true, toddler: true },
  { id: 'piano', path: 'pages/piano.html', category: 'learning', title: 'Пијано', smoke: 'piano_smoke', screenshot: true, offline: true, toddler: true },
  { id: 'shapes', path: 'pages/shapes.html', category: 'learning', title: 'Облици', smoke: 'shapes_smoke', screenshot: true, offline: true, toddler: true },
  { id: 'matching_game', path: 'pages/matching_game.html', category: 'games', title: 'Слагалица бомбона', smoke: 'candy_smoke', screenshot: true, offline: true, toddler: true },
  { id: 'driving', path: 'pages/driving.html', category: 'games', title: 'Возила', smoke: 'driving_smoke', screenshot: true, offline: true, toddler: false },
  { id: 'ocean', path: 'pages/ocean.html', category: 'games', title: 'Океан', smoke: 'ocean_smoke', screenshot: true, offline: true, toddler: false },
  { id: 'dino', path: 'pages/dino.html', category: 'games', title: 'Дино', smoke: 'dino_smoke', screenshot: true, offline: true, toddler: false },
  { id: 'space', path: 'pages/space.html', category: 'games', title: 'Свемир', smoke: 'space_smoke', screenshot: true, offline: true, toddler: false },
  { id: 'racing3d', path: 'pages/racing3d.html', category: 'games', title: 'Мала тркачица 3Д', smoke: 'racing3d_smoke', screenshot: true, offline: true, toddler: false },
  { id: 'explorer', path: 'pages/explorer.html', category: 'games', title: 'Мала истраживачица', smoke: 'kitty_smoke', screenshot: true, offline: true, toddler: false },
  { id: 'parent', path: 'pages/parent.html', category: 'parent', title: 'За родитеље', smoke: null, screenshot: false, offline: true, toddler: false }
];
