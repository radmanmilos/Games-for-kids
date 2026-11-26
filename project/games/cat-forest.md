# 🐱 Мачја шума (Cat Forest)

A toddler port of the "Secret Cat Forest" idea: feed visiting emoji cats; their gifts grow a forest.
Approved plan package: `resources/General_reviews/Cat_Forest/` (cards `03_TASKS.md`, ledger `PROGRESS.md`).

Purpose and rules (product decisions, `project/DECISIONS.md`):
no currency, shop, XP, levels, locks, score, counters, timers, fail states, notifications or offline
earnings. No visible text at all — speech and `aria-label`s are Serbian Cyrillic only. Emoji art only:
**no image or audio assets, no new libraries, no network**. Day/night and rain are child toggles and
never affect a reward. The Friends book «Мачке пријатељи» shows met cats only (no silhouettes, no counts).

## Where

- Engine: `game/games/cat_forest.js` (`window.startCatForest`, sets `window.__catForest`)
- Page: `game/pages/cat_forest.html` · Registry: `game/data/app-registry.js` (`cat_forest`,
  `screenshot:false`, `offline:true`, `toddler:true`, `hubOrder:12`) · Title: `game/data/serbian.js`
- Smoke: `tools/cat_forest_smoke.js` · Review: `resources/General_reviews/Cat_Forest/`

## Constants and data (the only place to tune)

Every tunable is `CF` at the top of the engine (`PLATES:3`, `MAX_CATS:3`, arrive/enter/sit/eat/leave
windows, `GIFT_CAP:5`, `DECOR_MAX:14`, `RAIN_DROPS:24`, `PARTICLE_CAP:12`, `DROP_PAD:24`,
`DRAG_START_PX:8`, `DT_CLAMP_MS:100`, `STEP_MS:50`). Do not copy the numbers into prose — read `CF`.
Data lists are `TREATS` (🐟🥛🍗🍣🍪), `CATS` (10; each has `likes`, `weight`, optional `acc`,
`fallbackEmoji`, `night`, `needsAllPlates`) and `GIFTS` (🌸🌷🍄🍀🦋).

## Adding a cat or a treat (data-only)

1. Append one row to `TREATS` or `CATS` in `cat_forest.js` — ASCII `id`, emoji, approved Cyrillic
   `name`, and for a cat `likes`/`weight` plus any optional flags. Nothing else changes.
2. Add a smoke assertion for the new row if it carries new behaviour; keep `CF` untouched unless tuning.
3. `node tools/cat_forest_smoke.js`, then `bash tools/sync-docs.sh` (docs/ mirrors `game/`).

## Test hook (`window.__catForest`, TD §8) — the engine never reads it

`state()` snapshot · `seed(n)` deterministic RNG · `rand(n)` · `pause()` / `step(ms)` (game clock;
`pause` is the harness rAF gate) · `place(treat, plate)` · `forceCat(id, plate)` · `pick(...)` ·
`previewPick()` · `setTime()` / `setWeather()` · `reset()` · `openBook()` / `closeBook()` ·
`data {treats, cats, gifts, anchors}`.
Determinism recipe used by the smoke and by `tools/visual-states.json` `PLAY`: `seed(7)` →
`place('fish', 0)` → poll `step(50)` until a cat is `sitting` (it is `sitting` only ~5350–6250 ms,
so a fixed long step overshoots to an empty stage).

## Wiring and persistence

Plate states are `empty` → `treat` (placed) → `occupied` (cat seated); never `filled`.
The seated cat is lifted above its plate so the treat stays visible; the lift scales with the
measured cat/plate/stage sizes (task 388) so a short phone-landscape stage no longer crowds
the first feeding station. A 12 px gap is kept between the cat's feet and the plate's top edge.
Speech goes through `window.audioBuses.speakWithDuck`/`window.speech` and is best-effort (R3) — the
game is fully playable silently. Save is one key `catForestSave` = `{v:1, met:[ids], decor:[{e,s}]}`;
cats on stage, plates, selection, clock and weather are transient by design. `parent.html`'s existing
reset clears it. `state.book` freezes `step()` and the rAF `frame()` while the book is open;
`render()` always runs.

## Village hub (Phase 2, plan §7.2)

The three feeding stations are fixed **stage-fraction anchors** in `FEED_ANCHORS`:

| id | x | y | plate |
|---|---|---|---|
| `porch.feed.1` | 0.26 | 0.62 | 0 |
| `porch.feed.2` | 0.50 | 0.62 | 1 |
| `porch.feed.3` | 0.74 | 0.62 | 2 |

`#cf-plates` fills the stage and each `.cf-plate` is absolutely placed at its anchor
percentage (`left:26%/50%/74%; top:62%`), so a tap on `porch.feed.1` lands at the same
stage fraction on a 390×844 phone and a 1280×800 desktop — no feeding anchor moves
between viewport sizes (the Phase 2 exit gate). The house sits above them in
`#cf-scenery` (CSS shapes, aria-hidden, no visible text).

A scene state machine owns the main view: `SCENES = ['village','pond','woodland','workshop','diary']`,
`DEFAULT_SCENE = 'village'`, `state.scene`, `enterScene/exitScene/setScene`, and `data-scene`
on `#app` in `render()`. Only the village has plates and cats today; the other four
are placeholders until their phase. `setScene` is a no-op for unknown ids and for the
already-active scene.

## Pond (Phase 3)

The pond is the first scene added beyond the village hub. It sits behind the village
(scene palette is a blue gradient). Controls:

- `#cf-pond-path` (🛤️, village toggles) — navigate from village to pond
- `#cf-pond-back` (← назад у село) — navigate from pond back to village
- `#cf-fishing-spot` (Пецај рибу) — tap to catch one fish (finite but generous; capped at 24);
  the spot briefly dips (:active) and a tone plays; every catch is a gift, no failure
  state, no timer, no shortage
- `#cf-fish-basket` — shows collected fish as sprite emoji (🐟) without digits or counters;
  `renderFishBasket()` clears and re-inserts the right number of spans
- `#cf-pond-path` (Вир, inside pond) — decorative path element

Fish are consumed when a cat begins eating at a feeding plate (sitting→eating transition
in `advanceCat`). One fish removed from `state.fishCount`, basket re-rendered.

## Gotchas

- Reduced motion (the owner's tablet reports `reduce:ON`) is a primary path: decorative effects off,
  essential motion kept. Assert with `bootEmulated`, not the host default.
- Foil the hook instead of the DOM when asserting engine behaviour; keep assertions on behaviour, not
  source literals (R8). Philosophy is guarded by `failWords`/`metricWords`/`timerApis` on
  comments-stripped sources plus a live-DOM wordless scan (CF-16).
- `screenshot:false` is deliberate (D10) until baselines are approved.

## Friends book / dairy (Phase 4)

The expanded diary adds a friends book that records every cat the child has met. On each first sit
the met timestamp is recorded in `state.metTimes`; every sit increments `state.visitCounts`. The
book shows one card per met cat with the cat's favourite treat emoji (from `TREATS`) and up to five
hearts representing cuddles — clicking a card calls `cuddleInBook(cat.id)`. Hearts are stored
client-side and capped at 5 (no digits or counters appear anywhere, per PS §7). When the book is
opened the clock freezes and on close it resumes. The book's innerText holds no digits and no Latin
letters — all labels are Serbian Cyrillic only, and fav. treat icons are emoji only.

Key behavioural additions from task 467d:
- `state.visitCounts` and `state.metTimes` added to the engine state (init 0 / `{}`)
- In `advanceCat` entering branch: `state.metTimes[c.id] = clock` on first sit,
  `state.visitCounts[c.id] = (state.visitCounts[c.id] || 0) + 1` on every sit
- `makeBookCatEl` now appends `.cf-book-cat-likes` and empty `.cf-book-cat-hearts` row
- `setBookCatHearts(el, cat)` rebuilds hearts in place (max 5, no digits)
- CSS `.cf-book-*` switched from circle/`place-items:center` to flex-column rounded card

## Save v2 migration (task 467e)

The save schema was bumped to version `v2`. On boot `loadSave()` accepts both `v === 1` and
`v === 2` — any pre-v2 `localStorage` save is **losslessly migrated** in place, preserving the
`met` cats, `decor` items and `fishCount` exactly; the new v2 fields (`selectedRecipe`,
`visitCounts`, `metTimes`) default to empty/zero so no prior data is discarded (plan §4.6 /
§3.5 "never remove a recorded cat"). Unknown versions (e.g. `v:999`) still start fresh. The
complete save payload shape is `{v:2, met:[ids], decor:[{e,s}], fishCount, selectedRecipe,
visitCounts, metTimes}`.

Key migration behaviours from task 467e:
- `loadSave()` guard: `if (!s || typeof s !== 'object' || (s.v !== 1 && s.v !== 2)) return out;`
- `save()` writes `v: 2` plus all fields
- `startCatForest` restores `state.selectedRecipe`, `state.visitCounts`, `state.metTimes`,
  `state.fishCount` from saved
- Smoke: `CF-14 AC5` seeds a `{v:1, met:['maca'], decor:[{e:'🌸',s:3}]}` save, reloads, and
  asserts `met` and `decor` are preserved unchanged
- Full suite: `check_fast 10/10`, `run_all 220/220` (including the new migration test)
