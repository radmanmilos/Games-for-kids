# 01 — Technical design (in the repo's technology)

Plain HTML/CSS/JS, no build step, no modules, no new dependencies, no new assets. Section numbers are referenced from the task cards as *TD §n*. Where this document and the repo disagree, **the repo wins** — record the difference in `PROGRESS.md`.

## 1. File map

| Action | File | Card |
| --- | --- | --- |
| create | `game/pages/cat_forest.html` (inline `<style>`, prefix `cf-`) | CF-01, 03 |
| create | `game/games/cat_forest.js` (one IIFE, `var`/function style as `sorting.js`) | CF-01 → |
| create | `tools/cat_forest_smoke.js` | CF-02 → |
| modify | `game/data/serbian.js` (`titles.cat_forest`) | CF-01 |
| modify | `game/data/app-registry.js` (one entry) | CF-01 |
| modify | `game/index.html` (one hub tile in `#hub-games`) | CF-01 |
| maybe | `tools/visual-states.json`, `tools/run_all.js`, `tools/validate_pages.js`, `tools/offline_smoke.mjs`, `tools/README.md` — only what a guard proves is needed | CF-02, 17–19 |
| generated | `offline-manifest.json`, `sw-cache-list.json`, `docs/**` — via printed fix commands and `tools/sync-docs.sh`, never by hand | every card |
| create | `project/games/cat-forest.md` | CF-20 |

Single game file: JS cards touch the same file, so **run JS cards sequentially** (see `02_ROADMAP.md` §3). Use stable section banners inside the IIFE so each card edits its own region:
`/* ==== CONFIG ==== */ /* ==== DATA ==== */ /* ==== RNG/CLOCK ==== */ /* ==== STATE ==== */ /* ==== PICKER ==== */ /* ==== PLATES ==== */ /* ==== CATS ==== */ /* ==== GIFTS/DECOR ==== */ /* ==== WORLD ==== */ /* ==== BOOK ==== */ /* ==== PERSIST ==== */ /* ==== RENDER ==== */ /* ==== INPUT ==== */ /* ==== HOOK ==== */ /* ==== BOOT ==== */`.
If the file would exceed ~1500 lines, stop and propose splitting the data block into its own `game/data/` file (needs offline inventory handling — record as a decision first).

## 2. Page template and boot contract

Copy `game/pages/sorting.html`'s `<head>` (required by `tools/validate_pages.js`: `lang="sr"`, manifest link, `theme-color #4A3F6B`, viewport meta exactly `width=device-width, initial-scale=1, viewport-fit=cover`) and its **script order**:

```
../data/serbian.js · ../shared/navigation.js · ../shared/celebration.js · ../shared/audio.js ·
../shared/speech.js · ../shared/utils.js · ../games/cat_forest.js · ../shared/audio-buses.js ·
../shared/viewport.js · ../shared/input.js · ../shared/feedback.js · ../shared/motion.js ·
../data/app-registry.js · ../shared/main.js
```

`shared/main.js` calls `window.startCatForest()` once (registry `start`). The game sets `window.startCatForest`; it is single-shot (`started` guard). Stylesheets exactly as in sorting.html (lines 10–14): `../styles/viewport.css`, `../styles/design-tokens.css`, `../styles/learning-stage.css`, `../shared/accessibility.css`, `../styles/components.css`, plus the inline `cf-` block. `html,body{overflow:hidden;touch-action:manipulation;user-select:none}`, `-webkit-tap-highlight-color:transparent`.

Registry entry (copy the `ocean`/`sorting` shape; header comment wins on field names):
```js
{ id: 'cat_forest', path: 'pages/cat_forest.html', category: 'games', title: window.SERBIAN.titles.cat_forest,
  smoke: 'cat_forest_smoke', screenshot: false, offline: true, toddler: true,
  route: 'game-cat-forest', hubOrder: <unused in 'games'>, hubGroup: 'games', back: 'cat-forest-back', start: 'startCatForest' }
```

## 3. Data (top of the IIFE, after `CF`)

```js
var TREATS = [
  { id:'fish',    emoji:'🐟', name:'Риба' },     { id:'milk',   emoji:'🥛', name:'Млеко' },
  { id:'chicken', emoji:'🍗', name:'Пилетина' }, { id:'sushi',  emoji:'🍣', name:'Суши' },
  { id:'cookie',  emoji:'🍪', name:'Колачић' }
];
var CATS = [
  { id:'maca',  name:'Маца',     emoji:'🐱', acc:null, likes:['fish','milk'],       weight:1.0 },
  { id:'puhko', name:'Пухко',    emoji:'🐈', acc:null, likes:['milk','cookie'],     weight:1.0 },
  { id:'mica',  name:'Мица',     emoji:'🐱', acc:'🎀', likes:['cookie','chicken'],  weight:0.8 },
  { id:'sef',   name:'Шеф',      emoji:'🐈', acc:'🎩', likes:['chicken','sushi'],   weight:0.7 },
  { id:'cveta', name:'Цвета',    emoji:'🐱', acc:'🌸', likes:['milk','sushi'],      weight:0.7 },
  { id:'tigar', name:'Тигар',    emoji:'🐯', acc:null, likes:['chicken','fish'],    weight:0.5 },
  { id:'tacka', name:'Тачка',    emoji:'🐆', acc:null, likes:['sushi','fish'],      weight:0.5 },
  { id:'senka', name:'Сенка',    emoji:'🐈‍⬛', fallbackEmoji:'🐱', acc:null, likes:['fish'], weight:1.0, night:true },
  { id:'zvezda',name:'Звездица', emoji:'🐈', acc:'⭐', likes:['milk','sushi'],      weight:0.7, night:true },
  { id:'kralj', name:'Краљ',     emoji:'🦁', acc:'👑', likes:[],                    weight:0.4, needsAllPlates:true }
];
var GIFTS = ['🌸','🌷','🍄','🍀','🦋'];
```
Adding a cat or treat is a **data-only** change (document this in `project/games/cat-forest.md`). `🐈‍⬛` is a ZWJ sequence (Android 11+): if it does not render as one glyph the game uses `fallbackEmoji` with a dark CSS filter (D7; playtest question). Detect with a cheap width check on a hidden probe node at boot, not UA sniffing.

## 4. DOM contract (ids/classes are API for the smoke — keep exactly)

```
#app.cf-app[data-time="day|night"][data-weather="clear|rain"]
 ├ button#cat-forest-back.back-btn            (copied from sorting; aria-label "Назад")
 ├ #cf-stage                                  (position:fixed; inset:0; overflow:hidden)
 │   ├ .cf-sky[aria-hidden]  .cf-stars[aria-hidden]
 │   ├ #cf-scenery[aria-hidden]               (trees/hills; pointer-events:none)
 │   ├ #cf-decor[aria-hidden]                 (.cf-decor-item × ≤14; pointer-events:none)
 │   ├ #cf-rain[aria-hidden]                  (i × ≤24; pointer-events:none)
 │   ├ #cf-plates                             (button.cf-plate[data-plate=0..2][aria-label="Тањир"] > .cf-plate-treat)
 │   ├ #cf-gifts                              (button.cf-gift[aria-label="Поклон"])
 │   ├ #cf-cats                               (button.cf-cat[data-cat][aria-label=<name>] > .cf-cat-body (+ .cf-cat-acc))
 │   ├ #cf-fx[aria-hidden]                    (hearts, sparkles; pointer-events:none)
 │   ├ #cf-tray                               (button.cf-treat[data-treat=<id>][aria-label=<name>][aria-pressed])
 │   ├ .cf-toggles: button#cf-daynight[aria-pressed][aria-label="Дан и ноћ"], button#cf-rain-btn[aria-pressed][aria-label="Киша"]
 │   ├ button#cf-friends[aria-label="Мачке пријатељи"]   (D3 approved)
 │   └ #cf-book[hidden][role=dialog][aria-modal=true] > button#cf-book-close[aria-label="Затвори"] + .cf-book-grid (D3 approved)
```
State classes: `.cf-selected`, `.cf-hint`, `.cf-dragging`. Z-order (low→high): sky, stars, scenery, decor, rain, plates, cats, gifts, fx, tray, toggles/friends, book, back button. **Every non-interactive layer has `pointer-events:none`** (so 14 decorations and the rain can never block a tap). Gifts sit above cats so a leaving cat never blocks a gift.

## 5. State model (JSON-safe except DOM refs, which live in separate maps)

```js
state = {
  clock: 0, paused: false, time: 'day', weather: 'clear',
  selectedTreat: null,
  plates: [ { idx:0, state:'empty'|'treat'|'occupied', treat:null, arriveMs:0, catId:null } ×3 ],
  cats:   [ { uid, id, plate, side:'L'|'R', phase:'entering'|'sitting'|'eating'|'leaving', t:0, dur:0 } ],
  gifts:  [ { uid, emoji, plate } ],
  flights:[ { uid, emoji, from:{x,y}, to:{x,y}, t:0, dur, slot } ],
  decor:  [ { e:'🌸', s:3 } ],            // s = decor slot index (0..13)
  met:    [ 'maca' ],
  lastVisitorId: null, visitsThisSession: 0,
  idle: { sinceMs:0, hints:0, firstDone:false },
  fx: { count:0 }
}
```
Plate lifecycle: `empty →(place)→ treat →(cat spawns)→ occupied →(eating ends)→ empty`. Cat phases: `entering → sitting → eating → leaving → (removed)`. A plate is never `occupied` without a cat and never `treat` while a cat is eating on it.

## 6. Clock, RNG, loop

- `CF` holds every constant (PS §6). No magic numbers elsewhere.
- Game clock `state.clock` in ms. rAF loop: `dt = min(now - last, CF.DT_CLAMP_MS)`; **no advance while `document.hidden`**; on `visibilitychange` reset `last`.
- Logic runs in fixed sub-steps of `CF.STEP_MS` (50): `tick(50)` order — idle/hints → plate arrival timers (spawn) → cats → gifts (auto-collect cap) → flights → fx → `clock += dt`. `render()` runs once per frame / once per `step()` call and is a **pure projection** of state to DOM (positions/transforms come from state, never from CSS transitions — that is what makes `step(ms)` exact in tests).
- RNG: seedable (mulberry32). `seed(n)` resets it; default seed from `Math.random()` once at boot. **All** randomness (arrival times, picks, gift emoji, sides, durations) goes through the engine RNG. No `Date.now()`/`new Date()` anywhere (the smoke greps for them).
- Visibility/pause: `state.paused` (book open) stops `tick` but not `render`.

## 7. Algorithms

**Picker (`pickCat`)**
```
eligible = CATS.filter(c => (!c.night || night) && (!c.needsAllPlates || platesFilled === 3) && !occupiedIds.includes(c.id))
w(c) = c.weight * (c.likes.includes(treat) ? 1 : CF.UNLIKED_FACTOR) * (c.id === lastVisitorId ? 0.5 : 1)
draw with RNG over cumulative weights
if eligible is empty after filters: drop the lastVisitor halving, then the occupied filter's last-resort (never return null)
first visit of the session (visitsThisSession === 0): restrict to weight >= 1.0 that like the treat (else any weight >= 1.0)
```
`platesFilled` = plates whose `state !== 'empty'` (includes the plate just filled).

**Spawn:** each tick, for each plate in `treat` state: `arriveMs -= dt`; when `<= 0` and `cats.length < MAX_CATS` → pick, create actor (`side` by RNG, `dur` by RNG within the phase range), plate → `occupied`. If `MAX_CATS` blocks, retry next tick (cannot deadlock: cats leave).

**Actor motion (all from `t/dur`, no CSS transitions):** `p = clamp(t/dur,0,1)`; entering: `x = lerp(edgeX, plateX, easeOut(p))`; leaving: `x = lerp(plateX, exitEdgeX, easeIn(p))` toward the nearer edge; `y` = plate `y` minus a fixed lift so the cat sits above its plate and the treat stays visible. Flip `.cf-cat-body` by direction. Cache plate centres in stage-% coordinates on resize (`ResizeObserver` or `resize` event) — never read layout inside `tick`.

**Gift:** at end of `eating`: remove treat, plate → `empty`, push gift `{emoji: rng pick}`; if `gifts.length > GIFT_CAP` auto-collect the oldest. **Collect:** remove gift element, push a flight `{from: gift position, to: decor slot, dur: GIFT_FLY_MS}`; when it lands push `decor {e, s}`; if `decor.length > DECOR_MAX` drop the oldest (soft fade swap).

**Decor slots:** an array of 14 `{x,y}` in % of the stage, chosen on the grass and between trees, **outside** the tray area, toggles, plates row and book button; verified visually at all three viewports. Slots are filled in a fixed shuffled order by RNG.

**Idle hint:** `idle.sinceMs` resets on any `pointerdown` in `#app`. When `sinceMs >= IDLE_HINT_MS`, no plate holds a treat/cat, and `idle.hints < HINT_REPEAT_MAX` → add `.cf-hint` to `#cf-tray` for `HINT_MS`, `hints++`, `sinceMs = 0`. First hint once at `FIRST_HINT_MS` if untouched. Any interaction resets `hints` to 0.

**Reduced motion:** one module-level boolean from `window.matchMedia('(prefers-reduced-motion: reduce)')` (listen for changes). It switches **decorative** effects only; logic-driven movement is identical either way.

## 8. Test hook `window.__catForest` (test-only; the game never reads it)

| Method | Returns / does |
| --- | --- |
| `state()` | JSON-safe snapshot: `clock, time, weather, selectedTreat, paused, plates[], cats[], gifts[], decor[], met[], idle, timers:{arrive:[…], cats:[{id,t,dur}]}, config:CF` |
| `seed(n)` | reseed RNG deterministically (also clears pick history) |
| `rand(n)` | next `n` RNG numbers (CF-04 tests) |
| `pause(on)` | stop/start the rAF-driven advance (tests pause first, then `step`) |
| `step(ms)` | advance logic by `ms` in `STEP_MS` sub-steps synchronously, render once |
| `place(treat, plate)` | the exact function the tap handler calls |
| `forceCat(id, plate)` | spawn a specific cat (bypasses picker) |
| `pick(treat, night, platesFilled, n)` | `n` picks via `pickCat` (no side effects beyond RNG) |
| `previewPick(plate, n)` | picks the engine would make for that plate right now |
| `setTime(t)` / `setWeather(w)` | same functions as the buttons |
| `reset()` | clear state and storage (CF-14) |

Keep the hook small; do not add methods that let tests bypass behaviour they should drive through the real UI, except where listed.

## 9. Persistence (D4 approved)

`localStorage['catForestSave'] = JSON.stringify({ v:1, met:['maca',…], decor:[{e:'🌸', s:3},…] })`. Load at boot in `try/catch`; validate (known cat ids only; `decor` ≤ `DECOR_MAX`, valid slots and known gift emoji; wrong shape/version → fresh). Save on: a cat first sitting; a decoration added — never in the render loop. Not persisted: cats on stage, plates, selection, time, weather. The parent screen's «Обриши локални напредак» calls `localStorage.clear()` (`parent.html:471-477`), so no extra reset wiring is needed.

## 10. Rendering and sizing rules

- Units: `vmin` with floors from tokens (`--touch-large` 72, `--touch-comfort` 56) via `clamp()`; e.g. treats/plates `clamp(var(--touch-comfort), 15vmin, 120px)` (≥ 72 at 1024×800, ≥ 56 at 844×390), toggles `clamp(var(--touch-comfort), 9vmin, 80px)`. Plus a desktop tier like sorting: `@media (min-width:800px) and (min-height:600px)`.
- Viewport matrix: 1024×800 (primary), 844×390 (short landscape — `resources/General_reviews/SHORT_LANDSCAPE_AUDIT.md`), 390×844 (portrait: just must not break; no rotate overlay needed), 1280×800.
- Animate only `transform` and `opacity`. Decorative animation off under reduced motion (`@media (prefers-reduced-motion: reduce)` block present from CF-03 on).
- Budgets: ≤ 3 cats, ≤ 12 fx particles, ≤ 24 rain nodes, ≤ 14 decor, ≤ 5 gifts → DOM under ~150 nodes; no `setInterval`; no layout reads in `tick`.

## 11. Conventions and footguns (from `project/lessons/*`)

IIFE + `'use strict'`; no top-level function that a shared file also exports (`showHint`, `softPop`, `speakSr`, `gentleMiss`, `successChime`, `celebrateFeedback`) — inside an IIFE this is safe, but never assign to `window.*` except `startCatForest` and `__catForest`. `window.tone(freq, dur, delay, type, vol)` — `type` is the 4th arg. Guard every shared call (`window.tone &&`). Never read `window.__catForest` from game logic. Cyrillic only in anything a child sees or hears; ASCII ids stay in code. No `fetch`, `XMLHttpRequest`, `sendBeacon`, `WebSocket`, `http(s)://` (except the SVG xmlns).
