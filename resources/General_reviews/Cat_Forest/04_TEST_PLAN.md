# 04 — Test plan

The repo has no test framework: **validation is the headless-Chrome smoke battery in `tools/`**, plus read-only gates. This plan defines the Мачја шума smoke (`tools/cat_forest_smoke.js`), the philosophy guards, the commands, and the manual play-test protocol. Referenced from cards as *TP §n*.

## 1. Principles

1. **Deterministic.** Tests pause the game, `seed()` the RNG and `step(ms)` the clock through `window.__catForest`. No `sleep` as a synchronisation tool for game logic; poll for readiness and for CSS transitions to settle (the `sorting` smoke documents why).
2. **Read the code before asserting.** Each assertion is written against the code as it is now (repo rule). Never assert a literal that the registry owns (the stale-test failure mode in `tools/route_contract.js`).
3. **Reachability = inside the viewport AND hit-testable** (`elementFromPoint` at the centre), not merely `.click()`-able.
4. **Every guard has a negative test** that proves it can fail; negative tests restore from a copy, never `git checkout`/`stash`.
5. **Never claim a pass that did not run.** No Chrome → `UNVERIFIED — needs user run` + the command.

## 2. Harness conventions

```js
const { start, check, getFails } = require('./headless.js');
const { checkRouteWired } = require('./route_contract.js');
const STUB = `window.speech={speak:function(){window.__spoke=(window.__spoke||0)+1;},cancel:function(){}};
  window.audioBuses.play=function(){};window.audioBuses.speakWithDuck=function(t,cb){window.__spoke=(window.__spoke||0)+1;if(cb)cb();};
  window.celebrate=function(){}; true`;
const h = await start({ page:'/pages/cat_forest.html', tag:'cat-forest-smoke', width:1024, height:800 });
// ready: typeof window.startCatForest==='function' && !!window.__catForest
// then: await h.evalv(STUB); await h.evalv('__catForest.pause(true); __catForest.seed(1); true');
```
- State reads: `JSON.parse(await h.evalv('JSON.stringify(__catForest.state())'))`.
- Geometry helper (copy from `sorting_smoke.js`): `{inside, hit, w, h}` per element.
- Viewports: `start({... width, height})` per size: **1024×800**, **844×390**, **390×844**, **1280×800**.
- Copy the file header and the ending (summary + exit code) from `sorting_smoke.js`. Run: `node tools/cat_forest_smoke.js` (Node ≥ 22; `CHROME_PATH` optional).
- Wait for animations to settle with `el.getAnimations().every(a => a.playState !== 'running')` polling, never a fixed sleep.

## 3. Assertion catalog (grows by phase; each row = ≥ 1 `check()`)

### 3.1 Boot and wiring (CF-02)
- Booted: `startCatForest` + `__catForest` present; no console errors.
- `checkRouteWired('cat_forest','game-cat-forest','pages/cat_forest.html',{back:'cat-forest-back',start:'startCatForest'})`.
- Back button inside viewport and hit-testable.
- Static: neither `game/games/cat_forest.js` nor the page contains `fetch(`, `XMLHttpRequest`, `sendBeacon`, `WebSocket`, `http://`, `https://` (allow `http://www.w3.org/2000/svg`).
- Negative: page copy without the back button → the check fails; restored.

### 3.2 Layout / geometry (CF-03)
At each viewport: 5 `.cf-treat`, 3 `.cf-plate`, `#cf-daynight`, `#cf-rain-btn` exist, are inside and hit-testable. Sizes (min of w/h): treats/plates ≥ 72 @1024×800 and ≥ 56 @844×390; toggles ≥ 56. No scroll (`scrollWidth ≤ innerWidth`, `scrollHeight ≤ innerHeight`). `document.body.innerText.trim() === ''` (no visible text) and every `aria-label` has no Latin letter (`/[A-Za-z]/`) — allow the id-like attributes only in `data-*`. All decorative layers have `aria-hidden="true"` and computed `pointer-events:none`. A `@media (prefers-reduced-motion: reduce)` rule exists in the page.

### 3.3 Engine (CF-04)
`step(1000)` → `clock` +1000 exactly (paused). Same seed → same `rand(5)`. Hidden page → clock frozen. Source has no `Date.now(`/`new Date(`. `state().config` equals the expected table (PS §6) kept in the smoke.

### 3.4 Placement (CF-05)
Select/deselect each treat (`aria-pressed`, `.cf-selected`). Select + tap plate 0 → plate `treat`; selection cleared; `arriveMs` within `[ARRIVE_MIN,ARRIVE_MAX]`. Tap empty plate with no selection → state unchanged + `.cf-hint` on tray. All plates busy + selection + tap → unchanged. Hook `place` ≡ tap path (snapshots equal). No failure vocabulary in strings/classes.

### 3.5 Picker (CF-06)
Seed 1, 2000 picks/treat: night cats never at day; `kralj` only at 3 plates; liked ≥ 2× unliked average; never null; never an occupied id; last-visitor halved; roster has 10 unique ids with valid `likes`.

### 3.6 Actors (CF-07)
Place → `step(ARRIVE_MAX+100)` → one cat `entering`. Step through the phases in order → node removed. Plate returns to `empty`. Fuzz 30 seeds × random placements: ≤ 3 cats, no duplicate ids. Cat box inside viewport during `sitting`/`eating`; tray and toggles still hit-testable under/around it. `met` gets each id once. No `setInterval` in source.

### 3.7 Gifts and decor (CF-08)
Gift appears at plate position after a visit; hit-testable. Tap → gift gone, `decor` +1. 6 uncollected → ≤ 5. 14 decor + 1 more → 14. With 14 decor all interactive elements still hit-testable at 1024×800 and 844×390. `innerText` has no digits.

### 3.8 Cuddle (CF-09)
Tap cat → hearts present; timers unchanged (`state().timers` identical except the clock); speech stub count: 2 taps in 1000 ms → 1, 1600 ms apart → 2; works in `entering` and `leaving`; no toast/text appears.

### 3.9 Rules and hint (CF-10)
`previewPick` with 2 filled plates never yields `kralj` (300 draws), with 3 filled yields it (seed 3); day never yields night cats; first spawned cat has weight ≥ 1.0 (30 seeds); idle hint after 10 s, max 3, suppressed by a treat on a plate, reset by a tap.

### 3.10 World (CF-11, CF-12)
Day/night: button toggles `state.time`, `data-time`, `aria-pressed`, glyph; cats on stage persist; night cats eligible (`previewPick`, 200 draws). Rain: toggles `weather`; drops ≤ 24 and only in `rain`. Reduced motion: emulate if the harness supports it (look for `Emulation.setEmulatedMedia` in `headless.js`), else static check that each `animation:` has a reduce override; cat walking still progresses under reduce.

### 3.11 Drag (CF-13) — D8 approved
Drag → free plate places (state == tap path); drag → ground returns, state unchanged, no error class; tap still selects; ghost removed. Copy the synthetic-pointer technique from the drag test in `sorting_smoke.js`.

### 3.12 Persistence and book (CF-14, CF-15)
Reload restores `met`/`decor`; corrupt/wrong-version/unknown-id/oversized data → clean boot; `localStorage.clear()` → fresh; `setItem` throwing → game still runs; only key `catForestSave` written. Book: empty = 🐾 only; N met → N cards; opening pauses the clock; focus moves to close and returns; `innerText` has no digits/Latin; sizes/hit-test pass.

## 4. Philosophy guards (CF-16 makes each one a permanent check with a negative test)

| Guard | How |
| --- | --- |
| No fail-state vocabulary | static scan of JS/HTML strings and class names for `грешка`, `изгуб`, `крај игре`, `game over`, `fail`, `lose`, `wrong` (comments included — keep the file clean) |
| No visible numbers/counters/timers | `innerText` has no digit after a full scenario (placing, visit, gift, book) |
| No visible text at all | `innerText.trim()===''` during play and with the book open |
| Cyrillic only for child-facing labels | `aria-label` and speech strings contain no Latin letters |
| No currency/XP/lock vocabulary | static scan: `coin`, `fish count`, `xp`, `level`, `lock`, `unlock`, `price`, `score`, `🔒` |
| No network/timer-API misuse | static scan (3.1) + no `setInterval`; `Date` absent from rule code |
| No new assets | the offline inventory diff (CF-18) contains only the page + script |
| Tap targets | sizes in 3.2 re-checked after every layout change |

## 5. Commands and environments

| Command | Env | When |
| --- | --- | --- |
| `node tools/cat_forest_smoke.js` | `[CHROME]` | every code card |
| `node tools/run_all.js --game cat_forest` / `--since HEAD` | `[CHROME]` | every code card |
| `node tools/check_fast.js` | `[NODE]` (hub smoke inside it may need Chrome — read its output) | every card |
| `node tools/check_docs.js` | `[NODE]` | when `.md` under `project/` or `tools/README.md` changed |
| `bash tools/sync-docs.sh` | `[NODE]` | whenever `game/` changed |
| `node tools/hub_smoke.js`, `short_landscape_audit.js`, `axe_check.js`, `touch_interruption_all.js`, `play_matrix.mjs`, `offline_smoke.mjs` | `[CHROME]` | CF-01, 03, 17, 18 |
| `node tools/check_release.js` | `[CHROME]` | CF-21 |

If an AI environment has no Chrome it still writes the test, runs the `[NODE]` parts, and lists the exact `[CHROME]` commands for the user.

## 6. Manual play-test protocol (CF-22) — real tablet, real child

Setup: the family tablet, installed PWA, volume at the child's normal level, an adult beside the child but not instructing. Observe silently first (2–3 minutes), then ask.

Watch for (note time and what happened, not interpretations):
1. Does the child tap a treat without prompting? A plate?
2. How long until the first successful placement?
3. Do they understand cats are "coming because of the food"?
4. Cuddle taps: delighted, indifferent, or repetitive?
5. Do they find and tap gifts? Do they notice the forest growing?
6. Do they discover ☀️/🌙 and 🌧️ unaided? Any distress at night mode or rain?
7. Mis-taps and frustration moments (any?). Fatigue: when do they leave?
8. Technical: dropped frames, late sounds, emoji rendering (🐈‍⬛, 🦁👑, 🐆), tap misses.

Log template (one per round):
```
Round N — date — child age — device
Observed (facts): …
Moments of delight: …
Moments of confusion/frustration: …
Technical issues: …
Questions answered (from PS/05 §2): …
Proposed changes (each with the evidence line above): …
```
Rules: change only `CF` constants/data/CSS from a round; anything bigger becomes a new card; record evidence → decision in `project/DECISIONS.md`.
