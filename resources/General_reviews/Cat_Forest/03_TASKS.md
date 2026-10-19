# 03 — Task cards (CF-00 … CF-22)

Each card is self-contained: an AI that reads `README.md`, this card and the files in **Read first** can execute it. Status lives in `PROGRESS.md`, not here.

## Legend

- **Size:** S ≈ ≤150 changed lines · M ≈ ≤400 · L = split it (no L cards exist; if you hit one, stop and split, record in `PROGRESS.md`).
- **Env tags:** `[NODE]` runs in any sandbox with Node ≥ 22 · `[CHROME]` needs headless Chrome (the user's Windows machine, or any AI environment that has Chrome). If you cannot run a `[CHROME]` step, mark that AC `UNVERIFIED — needs user run` and print the command. **Never claim it passed.**
- **Stale generated artifacts:** after any change under `game/`, `node tools/check_fast.js` may report stale generated files (offline inventory, SW list, manifest hash). Run **exactly the fix command it prints** (never hand-edit generated files), then re-run `check_fast`. Every card leaves `check_fast` green. `docs/` is synced with `tools/sync-docs.sh` (run with bash; Git Bash on Windows).
- **Do not touch** `game/shared/*`, `docs/` (by hand), or files outside the card's list. If you must, STOP and ask.
- **AC** = acceptance criterion; reference them in your DONE note (e.g. "CF-05 AC1–AC7 met; AC6 UNVERIFIED").
- Section references like *TD §4* mean `01_TECH_DESIGN.md` §4; *PS §6* = `00_PRODUCT_SPEC.md` §6; *TP §3* = `04_TEST_PLAN.md` §3.

---

## Phase 0 — Governance

### CF-00 — Approve decisions, install the package, baseline
- **Size** S · **Depends** — · **Owner** the user, optionally with any AI · **ACTIVE title** `Cat Forest: approve decisions + install plan package`
- **Goal:** decisions D1–D11 are confirmed closed, the package lives in the repo, and the starting state is known-good.
- **Read first:** `05_DECISIONS_AND_RISKS.md` §1, `project/STATUS.md`, `project/tasks/ACTIVE.md`.
- **Files:** create `resources/General_reviews/Cat_Forest/*` (copy of this folder); modify `project/STATUS.md` (one pointer line), `project/DECISIONS.md` (≤10-line "Cat Forest" section); `project/tasks/ACTIVE.md` (claim this task).
- **Steps**
  1. Decisions: **already closed on 2026-10-19** — confirm `05_DECISIONS_AND_RISKS.md` §1 shows every D as APPROVED; do not re-open any.
  2. Copy the package folder to `resources/General_reviews/Cat_Forest/`.
  3. Baseline, and record every result in `PROGRESS.md`: `git status --short` (expect empty), `git log --oneline -5`, `gh run list --limit 5` (CI state — the plan author could not check it), `node tools/check_fast.js`.
  4. Add to `project/STATUS.md` the one-line pointer given in `05_DECISIONS_AND_RISKS.md` §5. Keep STATUS ≤ 6 KB.
  5. Add to `project/DECISIONS.md` the section in `05_DECISIONS_AND_RISKS.md` §5 (adapt to the file's heading style), which summarises the approved product rules from `00_PRODUCT_SPEC.md` §2 (no currency/shop/XP/levels/locks/score/timers/offline earnings/notifications; emoji cats; child-controlled day/night). Check `tools/check_docs.js` `BUDGETS` first; do not exceed any budget.
- **AC**
  1. AC1 Every D in §1 shows APPROVED with the 2026-10-19 date (verify, do not change).
  2. AC2 Package present at the install path; `PROGRESS.md` shows baseline results.
  3. AC3 `node tools/check_docs.js` green `[NODE]`; `node tools/check_fast.js` result recorded.
- **Regression risks:** exceeding the STATUS (6 KB) or ACTIVE (20 KB) budget.
- **Out of scope:** any `game/` or `tools/` change.

---

## Phase 1 — Skeleton and wiring

### CF-01 — Page shell, registry entry, title, hub tile
- **Size** M · **Depends** CF-00 · **Parallel-safe with** nothing (first code task) · **ACTIVE title** `Cat Forest: page shell + registry + hub tile`
- **Goal:** «Мачја шума» opens from the Games hub, shows an empty stage with a working back button, and every repo contract (registry, route, page validator, offline inventory) is green. No gameplay.
- **Read first:** TD §1–§2, `game/pages/sorting.html` (template), `game/games/sorting.js` (outline), registry header comment (`game/data/app-registry.js` lines 1–30), `project/lessons/game-runtime.md`.
- **Files:** create `game/pages/cat_forest.html`, `game/games/cat_forest.js`; modify `game/data/serbian.js` (`titles`), `game/data/app-registry.js`, `game/index.html`. Plus generated artifacts via the printed fix commands.
- **Steps**
  1. Copy the head, required metadata and **script order** from `sorting.html` (the validator regexes require `lang="sr"`, the manifest link, `theme-color #4A3F6B`, the exact viewport meta). Title `Мачја шума — Петрин свет` (D1); favicon emoji 🐱. Body: `<div id="app" class="cf-app">` with the back button copied from sorting (`id="cat-forest-back"`, Cyrillic `aria-label="Назад"`) and an empty `<div id="cf-stage">`. Inline `<style>` only, all selectors prefixed `cf-`.
  2. `cat_forest.js`: one IIFE, `'use strict'`, `var`/function style as in `sorting.js`; `window.startCatForest` guarded by a `started` flag; a stub `window.__catForest = { state: function () { return { booted: true }; } }` (CF-04 replaces it). No gameplay.
  3. `serbian.js`: add `cat_forest: 'Мачја шума'` to `titles` (match neighbours' style).
  4. Registry: add one entry modelled on the `ocean`/`sorting` entries: `{ id:'cat_forest', path:'pages/cat_forest.html', category:'games', title: window.SERBIAN.titles.cat_forest, smoke:'cat_forest_smoke', screenshot:false, offline:true, toddler:true, route:'game-cat-forest', hubOrder:<unused>, hubGroup:'games', back:'cat-forest-back', start:'startCatForest' }`. Find an unused `hubOrder` in the `games` hub group (`grep -n "hubGroup: 'games'" game/data/app-registry.js`); a collision fails a registry guard. **VERIFY** field names against the header comment; the header wins over this card.
  5. `index.html`: add `<button class="hub-btn green" data-go="game-cat-forest" aria-label="Мачја шума">🐱🌲</button>` inside `#hub-games`, in `hubOrder` position (look at how neighbours and `hidden` tiles are ordered; other colour classes in use: `sky`, `pink`).
  6. Run `node tools/check_fast.js`; run the fix commands it prints; re-run until green.
- **AC**
  1. AC1 `cat_forest.html` opens with no console errors and `typeof window.startCatForest === 'function'` `[CHROME]`.
  2. AC2 Back button returns to the Games hub (route contract) `[CHROME]`.
  3. AC3 Registry guards, page validator and `check_fast` green `[NODE]`.
  4. AC4 New tile is hit-testable in the Games hub at 1024×800 **and** 844×390 (the hub grid has ~9 tiles already; confirm no overflow) `[CHROME]` via `node tools/hub_smoke.js` and `node tools/short_landscape_audit.js`.
  5. AC5 `docs/` synced (`bash tools/sync-docs.sh`).
- **Regression risks:** duplicate `hubOrder`; hub grid overflow with the extra tile; hand-edited generated files; a `hidden` tile accidentally copied.
- **Out of scope:** CSS beyond a blank stage, any behaviour, the smoke file (CF-02).

### CF-02 — Smoke skeleton and tool wiring
- **Size** M · **Depends** CF-01 · **Parallel-safe with** CF-03 (different files) · **ACTIVE title** `Cat Forest: smoke skeleton + tool wiring`
- **Goal:** `tools/cat_forest_smoke.js` exists, is discovered by the runner, boots the page and checks the route contract and back button. It grows in later cards (TP §3).
- **Read first:** `tools/sorting_smoke.js` (whole file, especially the header, `STUB`, geometry helper, ending), `tools/route_contract.js` (head), `project/lessons/testing-harness.md`, TP §1–§2.
- **Files:** create `tools/cat_forest_smoke.js`; modify only what a guard/validator proves is needed: **VERIFY by running** `tools/validate_pages.js` (it lists required control ids per page), `tools/visual-states.json` (add a `cat_forest` entry mirroring `sorting`: `INIT "true"`, `PLAY "true"` for now), `tools/run_all.js` (only if `--game cat_forest` does not resolve by itself), `tools/README.md` (smoke table row — a live doc, link-checked).
- **Steps**
  1. Copy the structure of `sorting_smoke.js`: `start({ page:'/pages/cat_forest.html', tag:'cat-forest-smoke', width:1024, height:800 })`; wait for `startCatForest` and `__catForest`; `STUB` for speech/audio/celebrate; `checkRouteWired('cat_forest','game-cat-forest','pages/cat_forest.html',{back:'cat-forest-back',start:'startCatForest',check})`; geometry helper (inside viewport **and** hit-testable) for the back button; copy the ending (summary + exit code) exactly.
  2. Assertions now: boot, route contract, back button reachable, page loads no external URLs (static grep of `game/games/cat_forest.js` and the page for `fetch(`, `XMLHttpRequest`, `sendBeacon`, `WebSocket`, `http://`, `https://` — allow the SVG xmlns string in the page).
  3. One negative test: copy `cat_forest.html` to a temp file with the back button removed, point the check at it, assert the smoke's check fails, restore from the copy (never `git checkout`/`stash`).
- **AC**
  1. AC1 `node tools/cat_forest_smoke.js` passes `[CHROME]`; the negative test fails as expected.
  2. AC2 `node tools/run_all.js --list` lists `cat_forest_smoke`; `node tools/run_all.js --game cat_forest` runs it `[CHROME]` (smokes are discovered by the `*_smoke.js` glob, verified in `run_all.js:146-147`).
  3. AC3 `check_fast` and `check_docs` green; no assertion reads source text for a literal that the registry now owns (the stale-test failure mode described in `route_contract.js`).
- **Regression risks:** flaky waits (use polling like the `sorting` smoke); asserting what you did not read — read each assertion against the code first (repo rule).
- **Out of scope:** gameplay assertions.

### CF-03 — Static stage layout (CSS) and geometry checks
- **Size** M · **Depends** CF-01 · **Parallel-safe with** CF-02 · **ACTIVE title** `Cat Forest: static stage layout`
- **Goal:** the forest scene is visible and correctly laid out on every viewport in the matrix; all tappables are large enough. No behaviour yet.
- **Read first:** PS §3–§5, TD §4 (DOM contract) and §10 (sizes), `game/styles/design-tokens.css` lines 38–50 (touch tokens), `sorting.html` `<style>` (how `vmin` and the `@media (min-width:800px) and (min-height:600px)` tier are used), `resources/General_reviews/SHORT_LANDSCAPE_AUDIT.md`.
- **Files:** modify `game/pages/cat_forest.html` (inline `<style>`), `game/games/cat_forest.js` (build the static DOM only).
- **Steps**
  1. Build exactly the DOM in TD §4: sky, scenery (trees/hills from emoji and CSS shapes), decor layer (empty), plates ×3, cats layer (empty), toggles (☀️ `#cf-daynight`, 🌧️ `#cf-rain-btn`), tray with 5 treats. Treat/plate ids and `data-` attributes exactly as TD §4.
  2. Sizes with `vmin` plus floors from tokens (`--touch-large` 72, `--touch-comfort` 56); a desktop tier like `sorting.html`; verify 844×390 and 390×844.
  3. Every decorative layer `aria-hidden="true"`; every button has a Cyrillic `aria-label`; **no visible text anywhere**.
  4. Add the `@media (prefers-reduced-motion: reduce)` block now (empty or with the first rules) so later animation cards extend it.
  5. Add geometry assertions to the smoke (TP §3.2).
- **AC**
  1. AC1 At 1024×800: 5 treats, 3 plates, 2 toggles inside the viewport and hit-testable; treats and plates ≥ 72 px, toggles ≥ 56 px `[CHROME]`.
  2. AC2 At 844×390: same elements inside/hit-testable; treats and plates ≥ 56 px; no vertical or horizontal scroll `[CHROME]`.
  3. AC3 At 390×844 (portrait): same inside/hit-testable; no rotate overlay required `[CHROME]`.
  4. AC4 `document.body.innerText` contains no visible text (aria-labels only) and no Latin letters in any `aria-label` `[CHROME]`.
  5. AC5 `node tools/short_landscape_audit.js` shows no new finding for this page `[CHROME]` (**VERIFY** it picks pages from the registry; if it needs a list entry, add it).
- **Regression risks:** emoji glyph sizes differ per device; toggle/tray overlap at 390 px height; decor/scenery covering buttons (use `pointer-events:none` on all non-interactive layers).
- **Out of scope:** any state, timer or click behaviour.

---

## Phase 2 — Core loop

### CF-04 — Engine core: config, clock, RNG, state, test hook
- **Size** M · **Depends** CF-03 · **ACTIVE title** `Cat Forest: engine core + test hook`
- **Goal:** a deterministic, testable engine skeleton: constants table, game clock, seedable RNG, state object, render loop, pause rules, and the `__catForest` hook. Still no visible gameplay.
- **Read first:** TD §5 (state), §6 (clock/RNG), §8 (hook API), PS §6 (constants).
- **Files:** modify `game/games/cat_forest.js`, `tools/cat_forest_smoke.js`.
- **Steps**
  1. Top of the IIFE: `CF` config object with **every** constant from PS §6 (no magic numbers elsewhere).
  2. Game clock in ms advanced by a rAF loop with `dt = min(realDelta, 100)`; the loop **does not advance while `document.hidden`**; start the loop once (the `started` guard).
  3. Seedable RNG (e.g. mulberry32): `rand()`; default seed taken once at start from `Math.random()`.
  4. State object per TD §5, plus `render()` as a pure projection of state to DOM (positions come from state, never from CSS transitions — tests rely on exact `step`).
  5. Replace the stub hook with the TD §8 API: `state()`, `seed(n)`, `step(ms)` (advances the logic in fixed 50 ms sub-steps synchronously and renders once), `pause(on)`, `rand(n)` (returns `n` numbers from the RNG, test-only), plus stubs for hooks later cards fill in.
- **AC**
  1. AC1 With `pause(true)`, `step(1000)` advances `state().clock` by exactly 1000 `[CHROME]`.
  2. AC2 `seed(7)` then `rand(5)` twice (reseeding between) returns identical arrays `[CHROME]`.
  3. AC3 With `document.hidden` forced true and a `visibilitychange` dispatched, the clock does not advance over 500 ms of real time `[CHROME]` (**VERIFY** the technique; `Object.defineProperty(document,'hidden',{configurable:true,value:true})`).
  4. AC4 Static check (in the smoke): `game/games/cat_forest.js` has no `Date.now(` and no `new Date(` (persistence in CF-14 must not need them either) `[NODE]`.
  5. AC5 The constants in code equal PS §6 (the smoke reads `CF` through `state().config` and compares to an expected table kept in the smoke).
- **Regression risks:** a second rAF loop after re-entering the page; clock jumps after tab sleep (the clamp); hook leaking into logic (the game must never read `window.__catForest`).
- **Out of scope:** treats, cats, gifts.

### CF-05 — Treat selection, placement, plate states
- **Size** M · **Depends** CF-04 · **Parallel-safe with** CF-06 · **ACTIVE title** `Cat Forest: treat selection + placement`
- **Goal:** the child can choose a treat and put it on a plate. Never an error.
- **Read first:** PS §4 (interaction rules), TD §5 (plate states), `sorting.js` lines 138–160 (select/deselect idiom).
- **Files:** modify `game/games/cat_forest.js`, `game/pages/cat_forest.html` (CSS for `.cf-selected`, `.cf-hint`, `.cf-plate-treat`), `tools/cat_forest_smoke.js`.
- **Steps**
  1. Tap treat → `selectedTreat` (class `cf-selected`, `aria-pressed="true"`); tap again → deselect.
  2. Tap empty plate with a selection → `place(treat, plateIdx)`: plate `empty → treat`, treat emoji drawn in `.cf-plate-treat`, selection cleared, `arrivalMs` for that plate set to `rngRange(ARRIVE_MIN, ARRIVE_MAX)`.
  3. Tap empty plate with **no** selection → tray hint (`cf-hint` bounce class for ~1 s); no text, no sound beyond a soft pop. Tap an occupied plate → nothing. All plates full and a treat selected → the treat bounces gently; nothing else.
  4. Audio (guard every call with `window.tone &&`): placement = two quick notes via `window.tone(freq, dur, delay, type, vol)` (**`type` is the 4th arg**). No new audio files.
  5. The hook's `place(treatId, plateIdx)` calls the **same** function the tap handler calls.
- **AC**
  1. AC1 Tapping each of the 5 treats selects it; tapping it again deselects `[CHROME]`.
  2. AC2 Select + tap plate 0 → plate 0 state `treat` with that treat id; selection cleared; `arrivalMs` within `[ARRIVE_MIN, ARRIVE_MAX]` `[CHROME]`.
  3. AC3 Tap an empty plate with no selection → state unchanged; `.cf-hint` present on the tray; no exception `[CHROME]`.
  4. AC4 Fill all 3 plates, select a treat, tap a plate → state unchanged; no exception `[CHROME]`.
  5. AC5 Placing through the hook and through taps gives identical state (compare snapshots) `[CHROME]`.
  6. AC6 No element or text implies failure ("грешка", ✗, red flash) — static check of strings and class names `[NODE]`.
- **Regression risks:** `click` firing after `pointerdown` handling (double toggle); selection surviving into a later state.
- **Out of scope:** cats arriving, drag (CF-13).

### CF-06 — Cat data and weighted picker
- **Size** S · **Depends** CF-04 · **Parallel-safe with** CF-05 · **ACTIVE title** `Cat Forest: cat data + weighted picker`
- **Goal:** the roster and the pure picking function, fully testable without any UI.
- **Read first:** PS §5 (roster table), TD §3 (data shape) and §7 (picker algorithm).
- **Files:** modify `game/games/cat_forest.js`, `tools/cat_forest_smoke.js`.
- **Steps**
  1. Add the `TREATS`, `CATS`, `GIFTS` data blocks **exactly** as TD §3 (ids are ASCII code ids; names are Cyrillic; names approved in D9 — use the table as written and keep them in one place so they are trivial to change).
  2. `pickCat({treat, night, platesFilled, occupiedIds, lastVisitorId})` per TD §7: eligibility filter (night-only only at night; `needsAllPlates` only when `platesFilled === 3`; exclude `occupiedIds`), weight = `cat.weight × (likes.includes(treat) ? 1 : CF.UNLIKED_FACTOR)`, halve the weight of `lastVisitorId`, weighted draw using the engine RNG, **fallback** so it never returns null (relax the anti-repeat, then the like-filter).
  3. Hook `pick(treat, night, platesFilled, n)` returns `n` ids (test-only; same function).
- **AC**
  1. AC1 With `seed(1)`, 2000 day picks of each treat: night-only cats (`senka`, `zvezda`) appear 0 times; `kralj` appears 0 times when `platesFilled < 3` and ≥ 1 time when it is 3 `[CHROME]`.
  2. AC2 For each treat, the average pick frequency of cats that like it ≥ 2× that of cats that do not (wide margin; fixed seed) `[CHROME]`.
  3. AC3 `pick` never returns null/undefined for any combination of treat × night × platesFilled (0–3) × any `occupiedIds` that leaves at least one cat free `[CHROME]`.
  4. AC4 A cat in `occupiedIds` is never returned; with `lastVisitorId = 'maca'`, `maca`'s frequency is lower than without it `[CHROME]`.
  5. AC5 The roster has exactly 10 cats with unique ids and every `likes` entry is a valid treat id `[CHROME]`.
- **Regression risks:** statistical tests too tight (use wide margins + fixed seed); accidental `Math.random()` use bypassing the engine RNG.
- **Out of scope:** spawning actors (CF-07).

### CF-07 — Cat actor lifecycle (enter / sit / eat / leave)
- **Size** M · **Depends** CF-05, CF-06 · **ACTIVE title** `Cat Forest: cat actor lifecycle`
- **Goal:** after a treat is placed, a cat walks in, sits, eats and leaves, driven entirely by game time.
- **Read first:** PS §4–§6, TD §5 (actor phases), §6, §7 (spawn rules), §10 (rendering rules).
- **Files:** modify `game/games/cat_forest.js`, `game/pages/cat_forest.html` (CSS for `.cf-cat`, `.cf-cat-body`, `.cf-cat-acc`, bob under a reduced-motion gate), `tools/cat_forest_smoke.js`.
- **Steps**
  1. Spawn: when a plate is in `treat` state and its `arrivalMs` has elapsed and active cats < `CF.MAX_CATS`, call `pickCat` (night from state, `platesFilled` = plates not `empty`, `occupiedIds` = cats on stage, `lastVisitorId`); create the actor (`<button class="cf-cat" aria-label="<name>">` with `.cf-cat-body` = base emoji and optional `.cf-cat-acc`), add to `state.cats`; mark the plate `occupied`.
  2. Phases and durations (constants in `CF`): `entering` (from the nearer-random edge to the plate, `ENTER_MS`), `sitting` (`SIT_MS`), `eating` (`EAT_MS`; the plate's treat visually shrinks over this time), `leaving` (to the nearest edge, `LEAVE_MS`), `gone` (node removed). Progress is computed from state each tick; positions are projected in `render()`.
  3. On entering `sitting`: add the cat id to `state.met` (no visible effect yet).
  4. At the end of `eating`: plate becomes `empty` immediately and a `gift` event is queued (CF-08 consumes it; until then it is a no-op).
  5. Facing: flip only `.cf-cat-body` by direction. Bob animation only while moving, `transform` only, gated for reduced motion. `forceCat(catId, plateIdx)` hook for tests (bypasses the picker).
- **AC**
  1. AC1 Place a treat; `step(ARRIVE_MAX + 100)`; exactly one cat exists with phase `entering` `[CHROME]`.
  2. AC2 Stepping through `ENTER_MAX`, `SIT_MS`, `EAT_MAX`, `LEAVE_MAX` yields phases `sitting → eating → leaving → gone` in order and the DOM node is removed `[CHROME]`.
  3. AC3 After `eating` ends the plate state is `empty` and a new treat can be placed `[CHROME]`.
  4. AC4 Never more than 3 cats and never two cats with the same id at once (fuzz: 30 seeds × random placements) `[CHROME]`.
  5. AC5 While `sitting`/`eating` the cat's box is inside the viewport and **does not cover** the tray or toggles (hit-test their centres) `[CHROME]`.
  6. AC6 `state.met` contains each id once, after it first sits `[CHROME]`.
  7. AC7 No `setInterval`; no per-cat timers outside the game clock `[NODE]` (static check).
- **Regression risks:** CSS transitions leaking into positions (breaks `step`); cats overlapping plates of neighbours at 844×390; node leaks after `gone`.
- **Out of scope:** gifts, cuddle, special rules.

### CF-08 — Gifts and the growing forest
- **Size** M · **Depends** CF-07 · **ACTIVE title** `Cat Forest: gifts + growing forest`
- **Goal:** each visit leaves a gift; tapping it makes it grow into the scenery. **No counter anywhere.**
- **Read first:** PS §4 (gifts/decor), TD §5, §7 (decor slots), §10.
- **Files:** modify `game/games/cat_forest.js`, `game/pages/cat_forest.html`, `tools/cat_forest_smoke.js`.
- **Steps**
  1. On the `gift` event: choose a gift from `GIFTS` via the RNG; create `<button class="cf-gift" aria-label="Поклон">` (≥ 72 px) at the plate position; plate is already `empty`.
  2. Uncollected cap `CF.GIFT_CAP` (5): when exceeded, the oldest gift auto-collects with the normal animation (the child is never blocked).
  3. Tap gift → sparkle (✨ particle, max `CF.PARTICLE_CAP` live) and the gift travels (logic-driven, `CF.GIFT_FLY_MS`) to the next decor slot, then becomes a `.cf-decor-item` in the decor layer (`pointer-events:none`, `aria-hidden`).
  4. Decor cap `CF.DECOR_MAX` (14): when full, the oldest decoration is replaced (gentle fade swap) — the forest never "fills up".
  5. Sounds: a soft pop/chime via `tone`/`softPop` guarded by `window.…&&`. Reduced motion: no flight, the gift fades and the decoration fades in.
- **AC**
  1. AC1 After a visit completes, one gift element exists at the plate position and is hit-testable `[CHROME]`.
  2. AC2 Tapping it removes the gift and `state.decor.length` increases by 1 (until the cap) `[CHROME]`.
  3. AC3 With 6 uncollected gifts, at most 5 exist (the oldest auto-collected) `[CHROME]`.
  4. AC4 With 14 decorations, collecting one more keeps 14 `[CHROME]`.
  5. AC5 With 14 decorations present every treat, plate and toggle is still hit-testable at 1024×800 and 844×390 `[CHROME]`.
  6. AC6 No visible number/score/counter exists in the DOM (`innerText` has no digits) `[CHROME]`.
- **Regression risks:** gift elements covering plates (z-order); decor blocking clicks; unbounded particle creation.
- **Out of scope:** persistence of decor (CF-14).

---

## Phase 3 — Personality and rules

### CF-09 — Cuddle tap: hearts, meow, spoken name
- **Size** S · **Depends** CF-07 · **Parallel-safe with** CF-08 · **ACTIVE title** `Cat Forest: cuddle tap`
- **Goal:** tapping any visible cat is a joyful, always-safe interaction.
- **Read first:** PS §4, `game/shared/audio.js` around line 149 (`playAnimalSound`), `game/shared/speech.js`, `sorting.js` `newRound()` (the speech idiom: `audioBuses.speakWithDuck` else `speech.speak`).
- **Files:** modify `game/games/cat_forest.js`, `game/pages/cat_forest.html`, `tools/cat_forest_smoke.js`.
- **Steps**
  1. Tap `.cf-cat` in any phase except `gone`: spawn 3 ❤️ particles (cap `PARTICLE_CAP`), play the meow, speak the cat's Cyrillic name.
  2. Meow: `window.playAnimalSound('cat')` — **VERIFY** the accepted names in `audio.js:149`; if `'cat'` is not accepted, use the documented key for the existing `assets/audio/cat.ogg`; if no sample path works, fall back to `window.sweep(600, 900, 0.18, 0, 'sine', 0.2)`. Do **not** add audio files.
  3. Speech throttle `CF.SPEECH_GAP_MS` (1500); meow throttle `CF.MEOW_GAP_MS` (300). Failures are silent (TTS may be unavailable).
  4. A cuddle changes **nothing** else: no timers, no `met`, no counters.
  5. First time a cat sits (`met` grows): one sparkle burst around it (decorative).
  6. Reduced motion: a single static ❤️ that fades (opacity only).
- **AC**
  1. AC1 Tap → hearts exist; `state()` timers (`eatMs`, `arrivalMs`, clock excluded) are identical before/after `[CHROME]`.
  2. AC2 With `speech.speak` stubbed to count: two taps within 1000 ms → 1 call; two taps 1600 ms apart → 2 calls `[CHROME]`.
  3. AC3 Tapping during `entering` and `leaving` works `[CHROME]`.
  4. AC4 No toast/text appears (innerText unchanged) `[CHROME]`.
- **Regression risks:** audio overlap; TTS queue growth; particle leaks.
- **Out of scope:** the book (CF-15).

### CF-10 — Special rules and the idle hint
- **Size** S · **Depends** CF-08, CF-09 · **ACTIVE title** `Cat Forest: special rules + idle hint`
- **Goal:** variety and gentle guidance without pressure.
- **Read first:** PS §5 (rules), TD §7.
- **Files:** modify `game/games/cat_forest.js`, `game/pages/cat_forest.html`, `tools/cat_forest_smoke.js`.
- **Steps**
  1. Make sure the spawn path passes the **real** `night`, `platesFilled`, `occupiedIds`, `lastVisitorId` into `pickCat` (they are only exercised by hooks until now). Add the `previewPick(plateIdx, n)` hook = the picks the engine would make for that plate right now (same arguments, no side effects). Also add the `setTime('day'|'night')` hook that only sets `state.time` (CF-11 wires the real button to this same function).
  2. First-visit nicety: until any cat has visited this session, the first pick uses only cats with `weight ≥ 1.0` that like the placed treat (else any with `weight ≥ 1.0`).
  3. Idle hint: after `CF.IDLE_HINT_MS` (10 000) with no pointer interaction and no treat on any plate, the tray bounces (`cf-hint`, ~1.2 s); repeat at most 3 times until the next interaction. One initial hint at `CF.FIRST_HINT_MS` (1500) if nothing was touched.
  4. Spoken prompt «Нахрани мачиће!» once at boot, best-effort with the sorting idiom; failure is silent and nothing depends on it. (Text approved in D9; verify TTS pronunciation on the tablet.)
- **AC**
  1. AC1 With 2 plates filled, 300 `previewPick` draws never contain `kralj`; with 3 filled and `seed(3)`, ≥ 1 draw contains `kralj` `[CHROME]`.
  2. AC2 In day state, 300 `previewPick` draws never contain `senka`/`zvezda`; after `setTime('night')` (hook until CF-11 exists) they can `[CHROME]`.
  3. AC3 Idle hint: stepping 10 000 ms with no interaction adds `cf-hint` to the tray; after 3 hints no more appear until a tap `[CHROME]`.
  4. AC4 A treat on a plate suppresses the idle hint `[CHROME]`.
  5. AC5 The very first spawned cat of a session has `weight ≥ 1.0` over 30 seeds `[CHROME]`.
- **Regression risks:** hint firing while a cat is on stage; hint spam (cap).
- **Out of scope:** the day/night UI (CF-11).

---

## Phase 4 — World feel

### CF-11 — Day/night toggle
- **Size** S · **Depends** CF-10 · **Decision** D5 approved: child toggle (not the real clock) · **ACTIVE title** `Cat Forest: day/night toggle`
- **Goal:** the child switches ☀️/🌙; the sky and the visiting cats change. Nothing changes by itself.
- **Read first:** PS §4 (world), TD §5, §10 (CSS variables), `project/DECISIONS.md` decision on reduced motion.
- **Files:** modify `game/games/cat_forest.js`, `game/pages/cat_forest.html`, `tools/cat_forest_smoke.js`.
- **Steps**
  1. `#cf-daynight` is a real `<button>` with `aria-pressed` and Cyrillic `aria-label="Дан и ноћ"`; the glyph switches ☀️↔🌙. Toggling sets `state.time` (`'day'|'night'`) and `data-time` on `#app`.
  2. CSS custom properties switch sky gradient, scenery tint and the star layer (✨, `aria-hidden`); a 600 ms cross-fade is decorative and is removed under reduced motion (instant switch).
  3. Cats already on stage are **not** removed or changed when the time flips (no surprising disappearances). Night-only cats become eligible only for **new** picks.
  4. Soft `window.sweep` cue (down for night, up for day), guarded.
  5. Hook `setTime('day'|'night')` uses the same function as the button.
  6. The game always starts in `day` (not read from the clock).
- **AC**
  1. AC1 Button toggles `state.time`, `data-time`, `aria-pressed` and glyph, both directions `[CHROME]`.
  2. AC2 A cat on stage stays when time flips `[CHROME]`.
  3. AC3 At night, over 200 `previewPick` draws, `senka` and `zvezda` appear; at day they do not `[CHROME]`.
  4. AC4 At 844×390 the toggle is ≥ 56 px, inside the viewport and hit-testable in both states `[CHROME]`.
  5. AC5 No code path reads `new Date()`/`Date.now()` to decide the time `[NODE]`.
- **Regression risks:** contrast of the night palette hiding emoji; the toggle being covered by stars/scenery (`pointer-events:none`).
- **Out of scope:** rain, persistence of time.

### CF-12 — Rain toggle and reduced-motion gates
- **Size** S · **Depends** CF-11 · **ACTIVE title** `Cat Forest: rain + reduced-motion audit`
- **Goal:** a gentle rain option, and **every** decorative motion in the game is gated for reduced motion.
- **Read first:** `project/DECISIONS.md` (the reduced-motion decision: shake/pulse suppressed, essential and gentle effects kept), `game/shared/motion.js` header.
- **Files:** modify `game/games/cat_forest.js`, `game/pages/cat_forest.html`, `tools/cat_forest_smoke.js`.
- **Steps**
  1. `#cf-rain-btn` toggles `state.weather` (`'clear'|'rain'`, default `clear`) and `data-weather`; `aria-pressed`; `aria-label="Киша"`.
  2. Rain = at most `CF.RAIN_DROPS` (24) `<i>` elements, `transform`/`opacity` CSS animation with staggered `animation-delay`; removed (or `hidden`) when clear. Under reduced motion: static, low-opacity drops, no animation.
  3. Rain ambience is **optional**: grep `game/shared/audio.js` and `game/games/adventure.js` for an existing ambient/noise helper (the plan author found none). If none exists, rain is visual only. **Do not add a shared helper.**
  4. Audit: list every `animation:`/`@keyframes`/`transition:` in this game's CSS and JS-driven motion; each decorative one must have a reduced-motion override. Essential motion (cat walking, gift travel) stays logic-driven and gentle.
  5. Hook `setWeather('clear'|'rain')`.
- **AC**
  1. AC1 Toggle changes `state.weather`, `data-weather`, `aria-pressed`; drops exist only in `rain` and ≤ 24 `[CHROME]`.
  2. AC2 Reduced motion: if `headless.js` can emulate the media feature (**VERIFY**: look for `Emulation.setEmulatedMedia` in `tools/headless.js`), computed `animation-name` is `none` on decorative elements; otherwise a static check proves each `animation:` declaration has a matching override inside `@media (prefers-reduced-motion: reduce)` `[NODE]`/`[CHROME]`.
  3. AC3 Cat walking still progresses under reduced motion (`step` moves a cat) `[CHROME]`.
  4. AC4 Toggle ≥ 56 px, hit-testable at both viewports `[CHROME]`.
- **Regression risks:** many animated nodes on low-end tablets (cap + transform/opacity only); reduced-motion override missing on one keyframe.
- **Out of scope:** weather affecting gameplay (it never does).

### CF-13 — Drag-and-drop placement (D8 approved)
- **Size** M · **Depends** CF-05 · **Parallel-safe with** CF-11, CF-12 · **ACTIVE title** `Cat Forest: drag treat to plate`
- **Goal:** toddlers who drag instead of tapping succeed too. Tap-select + tap-plate (CF-05) stays fully working.
- **Read first:** `game/games/sorting.js` lines 169–260 (`enableDrag`, `binAt`, `suppressClick`, `softReturn`) and the drag test in `tools/sorting_smoke.js` (copy its technique for synthetic pointer events).
- **Files:** modify `game/games/cat_forest.js`, `game/pages/cat_forest.html` (`touch-action:none` on `.cf-treat`, `.cf-dragging`), `tools/cat_forest_smoke.js`.
- **Steps**
  1. Pointer events on `.cf-treat`: a ghost clone follows the pointer; plates highlight when the pointer is within `CF.DROP_PAD` (24 px) of them.
  2. Drop on a free plate → the same `place()` path; drop anywhere else → the ghost glides back (`softReturn`), **no failure feedback**.
  3. Suppress the `click` that follows a drag (as sorting does). A tap without movement still toggles selection.
  4. Drag threshold `CF.DRAG_START_PX` (8) so taps never become drags.
- **AC**
  1. AC1 Drag treat → free plate places it (state identical to the tap path) `[CHROME]`.
  2. AC2 Drag → empty ground returns the treat; state unchanged; no error class/text `[CHROME]`.
  3. AC3 A plain tap still toggles selection (no accidental drag) `[CHROME]`.
  4. AC4 After any drag the ghost element is removed (no DOM leak) `[CHROME]`.
- **Regression risks:** double-handling click/pointer; `pointercancel` leaving a ghost (handle it, see `tools/touch_interruption_*`).
- **Out of scope:** dragging cats or gifts.

---

## Phase 5 — Memory

### CF-14 — Persistence (D4 approved)
- **Size** S · **Depends** CF-08 (and CF-09 for `met`) · **ACTIVE title** `Cat Forest: save met cats + forest`
- **Goal:** the forest and the met cats survive closing the app; the parent's existing reset clears them.
- **Read first:** TD §9 (schema), `game/games/racing3d.mjs` lines 140–154 (try/catch storage idiom), `game/pages/parent.html` lines 471–477 (reset = `localStorage.clear()`).
- **Files:** modify `game/games/cat_forest.js`, `tools/cat_forest_smoke.js`. **Do not** touch `parent.html` — the existing reset already clears every key (verified).
- **Steps**
  1. Key `catForestSave`, value `{"v":1,"met":[ids],"decor":[{"e":"🌸","s":3}]}` (`s` = decor slot index).
  2. Load at boot inside try/catch; validate: unknown cat ids dropped, `decor` clamped to `DECOR_MAX` and to valid slots, wrong version/shape → ignored (fresh start). Never throw.
  3. Save (try/catch) on: a cat first sitting, a decoration added. Not inside the render loop.
  4. Hook `reset()` clears state and storage for tests.
- **AC**
  1. AC1 Meet cats, collect gifts, reload the page → `met` and `decor` restored `[CHROME]`.
  2. AC2 Corrupt JSON, wrong version, unknown ids, oversized decor → game boots clean, state valid `[CHROME]`.
  3. AC3 `localStorage.clear()` then reload → fresh state `[CHROME]`.
  4. AC4 With `localStorage.setItem` forced to throw, the game still runs `[CHROME]`.
  5. AC5 Only the `catForestSave` key is ever written `[CHROME]`.
- **Regression risks:** persisting transient state (cats on stage, selection, time, weather — all excluded by design); storage quota/private mode.
- **Out of scope:** any UI.

### CF-15 — «Мачке пријатељи» book (D3 approved)
- **Size** M · **Depends** CF-14 · **ACTIVE title** `Cat Forest: friends book`
- **Goal:** a gentle gallery of the cats met so far. Not a collection game: no counts, no percentage, no locked silhouettes, no text required.
- **Read first:** PS §7 (book), TD §4 (`#cf-friends`, `#cf-book`), `project/DECISIONS.md` (rejected: unlockable stickers — keep it clearly ungated).
- **Files:** modify `game/games/cat_forest.js`, `game/pages/cat_forest.html`, `tools/cat_forest_smoke.js`.
- **Steps**
  1. `#cf-friends` (📖, `aria-label="Мачке пријатељи"`, ≥ 56 px, bottom-left away from the tray) opens `#cf-book`: `role="dialog"`, `aria-modal="true"`, `aria-label="Мачке пријатељи"`.
  2. Grid of **met cats only** (emoji + accessory, each ≥ 72 px); empty state = a single 🐾. Tap a cat = cuddle (reuse CF-09: meow + name spoken, hearts).
  3. Close button `#cf-book-close` ≥ 72 px; focus moves to it on open and returns to `#cf-friends` on close. While open the game clock is paused (`state.paused`).
  4. No counts/percentages/progress bars; no silhouettes of unmet cats (default, D3).
- **AC**
  1. AC1 Empty book shows only 🐾; with 3 met cats shows exactly 3 `[CHROME]`.
  2. AC2 Open pauses the clock (`step` is a no-op for game logic while open); close resumes `[CHROME]`.
  3. AC3 Focus management as specified `[CHROME]`.
  4. AC4 `innerText` of the book contains no digits and no Latin letters `[CHROME]`.
  5. AC5 Cards and close button meet size and hit-test rules at both viewports `[CHROME]`.
- **Regression risks:** the book covering the tray hit-test after closing (verify `hidden`); focus trap bugs.
- **Out of scope:** unlocking, rarity, hints.

---

## Phase 6 — Quality and release

### CF-16 — Smoke completeness, negative tests, viewport matrix
- **Size** M · **Depends** CF-12, CF-14 · **ACTIVE title** `Cat Forest: smoke completeness`
- **Goal:** the smoke covers everything in TP §3 and is stable.
- **Read first:** TP (all), `project/lessons/testing-harness.md`.
- **Files:** modify `tools/cat_forest_smoke.js` only.
- **Steps:** add any TP §3 assertion still missing; viewport matrix (1024×800, 844×390, 390×844, 1280×800 — `start()` per size or `Emulation` resize, copy how other smokes do it); the **philosophy guards** (TP §4: no fail-state words, no digits in visible text, no Latin in labels, no network/timer APIs, no `Date` in rules); flake hardening (poll for animation settled like the `sorting` smoke; never fixed sleeps); negative tests restore from copies.
- **AC**
  1. AC1 Every assertion in TP §3 exists, each read against the current code before being written `[NODE]` review.
  2. AC2 Smoke passes 5 runs in a row `[CHROME]`.
  3. AC3 Each philosophy guard has a negative test proving it can fail `[CHROME]`.
  4. AC4 Total runtime ≤ 60 s `[CHROME]`.
- **Regression risks:** asserting a literal the registry owns; timing flakes.

### CF-17 — Accessibility, touch and short-landscape audits
- **Size** S · **Depends** CF-16 · **Parallel-safe with** CF-18, CF-19 · **ACTIVE title** `Cat Forest: a11y + touch audits`
- **Goal:** the repo's audits pass for the new page.
- **Read first:** `tools/README.md` sections for `axe_check.js`, `touch_interruption_all.js`, `short_landscape_audit.js`, `play_matrix.mjs`.
- **Files:** `game/` files for fixes; audit configs only if the tool README says pages are listed by hand (most read the registry — **VERIFY**).
- **Steps:** run each audit, fix findings in this game's files, record any accepted exception with the reason in `PROGRESS.md`.
- **AC**
  1. AC1 `node tools/axe_check.js` has no new violations for `cat_forest` `[CHROME]`.
  2. AC2 `node tools/touch_interruption_all.js` passes for the page `[CHROME]`.
  3. AC3 `node tools/short_landscape_audit.js` passes for the page `[CHROME]`.
  4. AC4 `node tools/play_matrix.mjs` includes the page or the reason it cannot is recorded `[CHROME]`.
- **Regression risks:** fixes that change layout — re-run the geometry assertions.

### CF-18 — Offline and generated artifacts
- **Size** S · **Depends** CF-16 · **Parallel-safe with** CF-17, CF-19 · **ACTIVE title** `Cat Forest: offline inventory`
- **Goal:** the page works with no network and is in the offline inventory.
- **Read first:** `project/reference/OFFLINE.md`, `project/lessons/ci-offline.md`, `tools/README.md` (offline tools).
- **Files:** generated artifacts only, via printed fix commands (`offline-manifest.json`, `sw-cache-list.json`); `tools/offline_smoke.mjs` only if it lists pages by hand (**VERIFY**).
- **Steps:** `node tools/check_fast.js`; run the printed fix commands; `node tools/validate_generated.js`, `node tools/validate_offline.js`, `node tools/offline_smoke.mjs`. The game adds **no assets** — only the page and the script — confirm the inventory diff contains only those.
- **AC**
  1. AC1 Inventory diff = `pages/cat_forest.html` + `games/cat_forest.js` (+ manifest hashes) and nothing else `[NODE]`.
  2. AC2 `offline_smoke` passes with the page included `[CHROME]`.
  3. AC3 `check_fast` green `[NODE]`.
- **Regression risks:** `zip`-dependent steps on Windows (use the `.ps1` variant per the tool README).

### CF-19 — Screenshot states and baseline instructions (D10: states now, `screenshot:true` only after baselines)
- **Size** S · **Depends** CF-16 · **ACTIVE title** `Cat Forest: screenshot states`
- **Goal:** the page participates in the repo's screenshot review, if the user wants it.
- **Read first:** `tools/visual-states.json` (`sorting`, `ocean` entries), `tools/screenshot.js` header, `resources/General_reviews/Screenshot_Review/TABLE_OF_CONTENT.md`.
- **Files:** `tools/visual-states.json`; registry `screenshot` field flips to `true` **only after** the user has produced baselines.
- **Steps:** define `INIT` and `PLAY` states (e.g. `PLAY`: place a treat, `__catForest.step(...)` to a sitting cat — states may use the hook); write exact Windows commands for the user to generate baselines and refresh review screenshots, following `tools/README.md`; do not generate baselines yourself unless you have Chrome and the user asked.
- **AC**
  1. AC1 `visual-states.json` has a valid `cat_forest` entry `[NODE]`.
  2. AC2 The user has exact commands in `PROGRESS.md` and the screenshot index is updated per its rules `[CHROME]`/user.
- **Regression risks:** flipping `screenshot:true` with no baseline fails `visual_compare`.

### CF-20 — Docs, decisions, lessons
- **Size** S · **Depends** CF-17, CF-18 · **ACTIVE title** `Cat Forest: documentation`
- **Goal:** the repo's live docs describe the game accurately and stay within budgets.
- **Read first:** `project/games/ocean.md` (model), `project/PROCESS.md`, `tools/check_docs.js` `BUDGETS`.
- **Files:** create `project/games/cat-forest.md` (≤ 4 KB: what/where, constants, hook API, wiring, gotchas, how to add a cat or treat — data-only); modify `tools/README.md` (smoke row), `project/reference/folder-structure.md`, `project/reference/tools-detail.md` (mentions), `project/DECISIONS.md` (final decisions), `project/lessons/*` (only **real** new footguns discovered during the work), overwrite `project/STATUS.md`.
- **AC**
  1. AC1 `node tools/check_docs.js` green `[NODE]` (budgets + dead links).
  2. AC2 `project/games/cat-forest.md` documents adding a cat/treat as a data-only change and matches the code `[NODE]` review.
  3. AC3 No new content in `README.md`/`CONTRIBUTING.md` (repo rule).
- **Regression risks:** STATUS over 6 KB; stale constants copied into docs (reference `CF` in code instead of duplicating numbers).

### CF-21 — Release gate, version bump, user commit
- **Size** S · **Depends** CF-17–CF-20 · **ACTIVE title** `Cat Forest: release gate`
- **Goal:** everything green and ready for the user to commit.
- **Read first:** `archive/tasks/tasks-200-249.md` entry 246 (how the offline-delivery version bump was done), `AGENTS.md` release section.
- **Steps:** `bash tools/sync-docs.sh`; `node tools/check_release.js` (read-only full gate); bump the app version exactly as task 246 did **only if** the user wants installed devices to receive the game now; `node tools/archive_tasks.js`; overwrite `STATUS.md`; give the user `git status`, the list of changed files and a suggested commit message with the `Agent:` trailer. **Never commit/push.**
- **AC**
  1. AC1 `check_release` green `[CHROME]` (or UNVERIFIED with the command).
  2. AC2 `docs/` matches `game/` (`sync-docs` run; gate green).
  3. AC3 Review checklist (`05_DECISIONS_AND_RISKS.md` §3) fully ticked in `PROGRESS.md`.

---

## Phase 7 — Play-testing

### CF-22 — Play-test rounds and tuning (repeatable)
- **Size** S per round · **Depends** CF-21 · **Owner** the user plays; any AI tunes · **ACTIVE title** `Cat Forest: play-test round N`
- **Goal:** tune with a real child on the real tablet; record evidence, not guesses.
- **Read first:** TP §6 (protocol and log template), `project/reference/PLAYTESTING.md`.
- **Steps:** the user runs the protocol and fills the log (what the child did, where they hesitated, what delighted them, what confused them). An AI then proposes **only** changes to the `CF` constants or small CSS/data edits justified by the log; bigger changes become new cards. Record each round in `project/DECISIONS.md` (evidence → decision), as the racing game's rounds were.
- **AC**
  1. AC1 Each round has a dated log and a list of decisions with evidence.
  2. AC2 Tuning edits touch only constants/data/CSS, keep every smoke green, and keep the philosophy checklist true.
