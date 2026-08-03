# Code Review Findings — Petrin svet (Петрин свет)

Date: 2026-08-03
Author: Copilot CLI (Ponytail Lazy Dev)
Model: gpt-5-mini

Status: VERIFIED — every finding below was re-checked against the code on 2026-08-03 (deep review by Big Pickle; all game/shared JS passed `node --check`). All actionable findings were then FIXED on 2026-08-03 per user request; see "Fixes performed (2026-08-03, per user request)" at the bottom for the full action log, files changed, and validation. Google Fonts (Fredoka) was bundled locally per user approval — no open items remain.

Agents/Tools to be used
- search_code_subagent (thoroughness: deep) — workspace inventory and file excerpts
- code-review agent (sync, model: gpt-5-mini) — technical/security/code-quality review
- general-purpose agent (if needed) — design & UX checklist review

Scope
- Full game workspace under `game/` plus `shared/`, `assets/`, `resources/`, and top-level documentation files (README.md, PROJECT_TASKS.md, HANDOVER_PROMPT.md).
- Focus areas: audio/speech (WebAudio, TTS assets), music engine (papper_kitty), game logic (game/games/*.js), shared modules (navigation, audio, speech), accessibility, Serbian Cyrillic text coverage, asset references, and hosting notes.

Deliverable
- This file (CodeReview_Findings.md) will be populated with findings split into: Technical findings, Design findings, Other findings, and Suggested fixes. No code edits will be made.

---

## Technical findings

- TTS event-listener leak (medium→high)
  - File: E:\GitHub\Games for kids\game\shared\speech.js:100
  - Problem: speak() uses addEventListener(...) without { once: true }; cancel() only pauses/rewinds audio and does not remove previous listeners → repeated speak() calls can accumulate listeners.
  - Fix: use addEventListener(..., { once: true }) or assign onended/onerror and clear them in cancel().
  - Verification (2026-08-03): FIXED. speak() attaches 'ended'/'error' with { once: true } (speech.js:106-107), finish() removes any stored listener (speech.js:97-101), cancel() clears `_currentFinish` before pausing (speech.js:126-130). No listener accumulation.

- Classroom number "0" asset mismatch (medium)
  - Files:
    - E:\GitHub\Games for kids\game\games\classroom.js:43 (uses name: 'нула')
    - E:\GitHub\Games for kids\game\shared\speech.js:67 (mapping uses 'Нула')
  - Problem: exact-key lookup fails for lowercase 'нула' (first phrase) while 'Нула' exists (second phrase) → inconsistent TTS vs. asset playback.
  - Fix: add lowercase 'нула' mapping or normalize keys in speech.speak.
  - Verification (2026-08-03): STILL PRESENT, scope narrowed to the numbers activity. classroom.js:43 uses `name: 'нула'` and phrasesFor() (classroom.js:147-151) speaks `['нула','Нула']`; speech.js:67 maps only `'Нула'` → the first phrase `'нула'` (spoken at classroom.js:113) misses the mp3 and falls back to speechSynthesis (speech.js:112-122) or silence. Counting game is unaffected (numberNames[0] = '' at animal_counting.js:32, counts 1-10 only). Minimal fix: add lowercase alias `'нула'` to speechFiles.

- Pointer-only controls (accessibility/high)
  - Files:
    - E:\GitHub\Games for kids\game\index.html:294 (animalCard div)
    - E:\GitHub\Games for kids\game\games\animals.js:29 (pointerdown for animalCard)
    - E:\GitHub\Games for kids\game\games\candy.js:41 (createTile uses <div class="candy">)
    - E:\GitHub\Games for kids\game\games\shapes.js:13 (pieces created as <div>, pointer-only)
    - E:\GitHub\Games for kids\game\games\kitty.js:19 (controls via pointer events)
  - Problem: critical interactions are not keyboard-focusable and lack ARIA; keyboard/screen-reader users cannot play.
  - Fix: convert core interactive elements to semantic controls (buttons) or add role/tabindex + keyboard handlers; add aria-labels in Serbian Cyrillic.
  - Verification (2026-08-03): CONFIRMED — index.html:294 (animalCard), animals.js:29, candy.js:90 (tiles created as <div> at candy.js:41), shapes.js:43 (pieces at shapes.js:13), kitty.js:20, plus coloring.js:271 and animal_puzzle.js:266. Exception: classroom activity/back/autoplay controls ARE real <button> elements (classroom.js:120-137, 239-254) and are keyboard-focusable.

- Duplicate [data-go] handlers causing double effects (low→medium)
  - Files:
    - E:\GitHub\Games for kids\game\shared\navigation.js:24
    - E:\GitHub\Games for kids\game\games\animal_counting.js:203
    - E:\GitHub\Games for kids\game\games\animal_puzzle.js:351
  - Problem: some game scripts re-bind data-go globally; leads to duplicated handlers and duplicated popSound/goTo calls.
  - Fix: scope DOM queries to the game container (screen.querySelectorAll(...)) or remove redundant attachments.
  - Verification (2026-08-03): CONFIRMED. navigation.js:24-29 binds all [data-go] globally; animal_counting.js:203 and animal_puzzle.js:351 rebind the same elements, and each page also binds an explicit back handler (animal_counting.js:193-200, animal_puzzle.js:344-350). Refined impact on the counting/puzzle pages: tapping back fires 3 listeners → double popSound + the immediate `goTo('hub')` (line 203/351) hides the game screen → brief blank flash (~90ms) before the standalone `location.href='../index.html'` completes. On animal_memory.html the back button is double-handled (data-go "hub" + explicit handler at animal_memory.js:92) → double popSound only.

- Audio fallback robustness (medium)
  - File: E:\GitHub\Games for kids\game\shared\audio.js:92
  - Problem: fallback detection uses networkState === 3 only; audio.preload='none' may cause delayed networkState updates. No audio.onerror handler attached at creation time.
  - Fix: attach audio.onerror (once) at creation to mark failed assets, or add a per-element __failed flag and check it in playAnimalSound; consider preloading critical short UI audio.
  - Verification (2026-08-03): CONFIRMED. Audio objects are created with preload='none' (audio.js), so on a cold start networkState is 0, not 3 — the networkState===3 fallback check (audio.js:92) cannot trigger on first play, and no onerror handler is attached at creation. First-404 plays silence for all animals except the fox/chicken special case.

## Design findings

- Music button spacing risk (papper_kitty)
  - File: E:\GitHub\Games for kids\game\pages\papper_kitty.html (CSS for #worlds-btn and #music-btn)
  - Note: fixed pixel right offsets (200px / 268px) can overlap on narrow screens. Consider stacking or responsive layout.
  - Verification (2026-08-03): Offsets are intentional and "sacred" per AGENTS.md (do not move). Computed layout shows no button overlap down to 320px width; the real edge case is clipping — music-btn (right:268, ~58px wide) goes off-screen to the left below ~326px viewport width. Keep offsets; optionally clamp with a min-width/media query.

- Classroom autoplay timing
  - File: E:\GitHub\Games for kids\game\games\classroom.js
  - Note: AUTOPLAY_PAUSE = 1500ms is conservative (safe for repetition), but may be perceived slow. Consider testing with real children and tuning.
  - Verification (2026-08-03): Confirmed conservative and intentional (classroom.js:7). Keep as-is until play-testing suggests otherwise.

## Other findings

- frog.oga extension is unusual but present (E:\GitHub\Games for kids\game\assets\audio\frog.oga). Confirm server MIME handling if hosting changes are made.
- Speech assets are numerous and require exact key matches (Cyrillic case-sensitive). Small normalization in speak() would make the system more robust.

## Verification summary (2026-08-03)

All 108 speech assets under `game/assets/audio/speech/` are present (~773 KB), including `nul.mp3`, `bravo.mp3`, and all letter/word files referenced by speech.js. All 15 game/shared JS files plus the 1,955-line inline papper_kitty script pass `node --check`. No missing-script-dependency bugs found (puzzle needs neither speech.js nor utils.js; classroom needs no utils.js; memory ships its own shuffle). Existing findings verified: 1 fixed, 4 still present, 2 design notes intentional, frog.oga note stands.

## Fresh review 2026-08-03 (Big Pickle — deep re-verification)

New findings from this pass, none of which are regressions or user-visible bugs today:

- Dead in-hub game screens + unused script loads in index.html (maintainability, low→medium)
  - Files: E:\GitHub\Games for kids\game\shared\navigation.js:5-12, E:\GitHub\Games for kids\game\index.html:294
  - Problem: goTo() short-circuits EVERY game id to a standalone page (navigation.js:5-12), so lines 14-21 (screen toggle + start* hooks) are unreachable for those ids. In index.html only the 'hub' and 'game-kitty' (iframe) screens are ever used; the static game-animals/game-shapes/game-candy/game-coloring screens and their markup/CSS are dead, and all game scripts (animals.js, shapes.js, candy.js, coloring.js, animal_puzzle.js, animal_counting.js) load in the hub although only kitty.js actually runs.
  - Impact: page weight and maintenance confusion; no user-visible bug. Optional: strip dead screens/scripts from index.html.

- Standalone pages are near-full hub copies loading all four game scripts (maintainability, low)
  - Files: game/pages/animals.html:263-272, shapes.html:264-273, matching_game.html:263-271
  - Problem: animals.html / shapes.html / matching_game.html duplicate the full hub markup (hidden hub + other game screens via `display:none!important` override) and load kitty.js + animals.js + shapes.js + candy.js even though each page hosts a single game. The hidden hub buttons carry data-go values that would resolve to `pages/pages/*.html` (404) if the CSS override were ever removed.
  - Impact: bloat + a latent 404 path; maintainability only.

- Counting/puzzle back button: triple handler, blank flash, double popSound (low)
  - Files: game/games/animal_counting.js:193-203, game/games/animal_puzzle.js:344-351, game/shared/navigation.js:24-29
  - Problem: refined detail of the data-go finding — the immediate `goTo('hub')` in the in-game rebind (counting:203, puzzle:351) hides the game screen before the 90ms standalone redirect, causing a brief blank flash, and popSound fires twice.
  - Fix: drop the in-game rebind or the page-level back handler on these pages (keep one).

- Puzzle game has no audio feedback at all (inconsistency, low)
  - File: game/games/animal_puzzle.js
  - Problem: no tone(), no playAnimalSound, no speech.speak anywhere in animal_puzzle.js (grep-verified). Completion speaks 'Браво!' via celebration.js, but piece taps/drops/placements are silent — inconsistent with animals/candy/shapes/counting which all give audio feedback.
  - Note: may be intentional; confirm desired behavior.

- Candy star can temporarily lock the board (design/UX, low)
  - File: game/games/candy.js (spawnStar / candyBusy / attachCandyDrag)
  - Problem: from star spawn until explodeStarAt, candyBusy stays true and blocks all tile dragging. A drag-release on the star with delta ≥ 18px is ignored (no explode), leaving the board locked until the star is re-tapped with a small tap. The star pulses to draw attention, so this is by design, but a child who drags instead of taps may perceive the board as frozen.
  - Optional: explode the star on any release over it.

- Kitty music keeps playing when the tab is hidden (very low)
  - File: game/pages/papper_kitty.html:486, 2241-2243
  - Problem: visibilitychange/blur call setPaused(true), which only halts the rAF loop; musicTick (papper_kitty.html:486) checks only `audioCtx && musicOn` and keeps scheduling notes on a 120ms interval → music continues while the game is paused/backgrounded (battery drain on tablets).
  - Fix: add `if (paused) return;` to musicTick or stop the interval in setPaused.

- Google Fonts is an external runtime dependency (note / approval item)
  - File: game/pages/papper_kitty.html:9
  - Problem: `fonts.googleapis.com` Fredoka stylesheet loads at runtime (non-blocking `media="print" onload` trick, comment at papper_kitty.html:8 documents it as offline-safe).
  - Note: handover rule says "no external runtime dependencies or remote assets without explicit approval"; the in-file comment implies it was accepted. Confirm and record the decision; if strict offline is required, bundle Fredoka locally.

## Suggested fixes (high-priority → low-priority)

1. Fix classroom zero-case mismatch — add lowercase `'нула'` alias to speechFiles (one line) so the numbers tile's first phrase plays nul.mp3 instead of browser TTS/silence. (Medium — verified present)
2. Make interactive elements keyboard-focusable (animals card, candy tiles, shapes pieces, puzzle pieces, coloring regions) — convert to buttons or add tabindex+keydown handlers; add aria-labels in Cyrillic. (High)
3. Scope / dedupe data-go bindings (use container.querySelectorAll) to avoid duplicated handlers — also removes the counting/puzzle back-button blank flash + double popSound. (Medium)
4. Improve audio fallback robustness (attach audio.onerror when creating Audio objects for a robust fallback flag; consider preloading critical short assets). (Medium)
5. Small UX polish: clamp papper_kitty minimum viewport width (music-btn clips below ~326px). (Low)
6. Add `if (paused) return;` to musicTick so kitty music pauses with the tab/game. (Low)
7. Optional: give the puzzle game tap/placement audio feedback (or confirm silence is intended). (Low)
8. Optional: strip dead in-hub screens/scripts from index.html and slim the standalone hub-copy pages. (Low, maintainability)
9. Decide + record the Google Fonts external-dependency approval in HANDOVER_PROMPT. (Process)

---

### Quick validation commands / test steps
- Syntax check:
  node --check "game/shared/speech.js" "game/shared/audio.js" "game/games/classroom.js" "game/games/candy.js" "game/games/shapes.js" "game/games/animals.js"
- Manual browser checks:
  1. Open game/index.html (or the standalone page under game/pages/) in Chrome.
  2. TTS listener test (after fix): repeatedly call window.speech.speak('Пас') and confirm no event-listener growth (Chrome: getEventListeners(speechAudio)).
  3. Classroom zero-case (after fix): open /pages/classroom.html, click '0' tile — expect consistent playback (not TTS then file).
  4. Accessibility (after changes): Tab to animal card, candy tiles, shapes pieces; press Enter/Space and ensure same behavior as touch.

### Short next-step checklist (files to open first for fixes)
1. E:\GitHub\Games for kids\game\shared\speech.js — add {once:true}, clear handlers in cancel, consider normalizing lookup.
2. E:\GitHub\Games for kids\game\games\classroom.js — fix 'нула' vs 'Нула' (or plan normalization).
3. E:\GitHub\Games for kids\game\games\candy.js — make createTile create focusable buttons and add minimal keyboard handlers.
4. E:\GitHub\Games for kids\game\games\shapes.js — add tabindex and keyboard handlers for pieces.
5. E:\GitHub\Games for kids\game\index.html & E:\GitHub\Games for kids\game\games\animals.js — make animalCard keyboard accessible (convert to button or add tabindex+keydown).
6. E:\GitHub\Games for kids\game\shared\navigation.js and any game start files that re-bind [data-go] (e.g., animal_counting.js) — scope bindings to avoid duplicates.
7. E:\GitHub\Games for kids\game\shared\audio.js — attach audio.onerror when creating Audio objects for a robust fallback flag; consider preloading critical short assets.

If you want, I can produce exact diff-style patches for the top-priority fixes (classroom 'нула' alias, keyboard accessibility, data-go dedupe) next.

---

## Fixes performed (prior session, before this re-verification)

- 2026-08-03 — speech.js: Prevent TTS event-listener accumulation.
  - File changed: game/shared/speech.js
  - Change summary: speak() now stores the current finish handler on the Audio element, attaches 'ended' and 'error' listeners with { once: true }, and cancel() removes any pending finish listener before pausing. This prevents repeated speak() calls from accumulating event listeners and avoids duplicate callbacks.
  - Validation: run the syntax check and manual playback test:
    - node --check "game/shared/speech.js"
    - In browser console: window.speech.speak('Пас') repeated; verify getEventListeners(speechAudio) does not increase over time.

---

## Fixes performed (2026-08-03, per user request)

All actionable findings from the "Fresh review" section were implemented in one pass (Ponytail Lazy Dev; `node --check` on every changed JS below). Findings were logged to PROJECT_TASKS.md and HANDOVER_PROMPT.md alongside the code.

1. **Classroom zero-case mismatch — 'нула' alias (Suggested fix #1)**
   - Files: `game/shared/speech.js`
   - Change: added lowercase alias `'нула'` → `assets/audio/speech/nul.mp3` next to the existing `'Нула'` mapping so classroom.js's `name: 'нула'` (first phrase) plays the mp3 instead of browser TTS/silence.

2. **Keyboard accessibility — interactive tiles (Suggested fix #2)**
   - Files: `game/games/animals.js`, `game/games/coloring.js`, `game/games/candy.js`, `game/games/shapes.js`, `game/games/animal_puzzle.js`, `game/shared/accessibility.css`
   - animals.js: extracted `playAnimal()`; card gets `role="button"`, `tabindex="0"`, `aria-label="Чуј како се животиња зове"`, Enter/Space handler (pointerdown now calls playAnimal).
   - coloring.js: SVG regions get `tabindex="0"`, `role="button"`, `aria-label="Обој део"`, Enter/Space → `tapColoringRegion(el)`.
   - candy.js: `attachCandyKeys(el)` on every tile — Enter/Space explodes a star, Arrow keys swap with a neighbour via `commitSwap`; tiles get `role="button"`, `tabindex="0"`, Cyrillic aria-labels.
   - shapes.js: extracted `placePiece(piece, slot)` (shared by drag + keyboard); slots and pieces focusable; `kbSelected` + `.kb-selected` pattern; slot Enter places the selected piece, piece Enter toggles selection; the drag path clears any keyboard selection.
   - animal_puzzle.js: pieces focusable, Enter/Space → `placePieceKb(piece)` (same placement math as drag).
   - accessibility.css: shared focus outline for `.animal-card/.candy/.piece/.slot/.coloring-region/.board-slot/.kb-selected` (4px #FFD23F).

3. **data-go dedupe / back-button handlers (Suggested fix #3)**
   - Files: `game/games/animal_counting.js`, `game/games/animal_puzzle.js`, `game/pages/animal_memory.html`
   - animal_counting.js: removed `data-go="hub"` from the injected back button and removed the global `[data-go]` rebind; the explicit back handler (standalone redirect + popSound) is now the single handler.
   - animal_puzzle.js: removed `data-go="hub"` from the back button and the global `[data-go]` rebind (explicit handler at the page level already handles standalone vs hub).
   - animal_memory.html: removed `data-go` from the back button (explicit handler in animal_memory.js remains) + added `aria-label="Назад на игре"`.
   - Result: one handler per back button — the blank flash and double popSound are gone.

4. **Audio fallback robustness (Suggested fix #4)**
   - File: `game/shared/audio.js`
   - Change: every created Audio element gets `audio._failed = false` plus a `{ once: true }` 'error' listener that sets `_failed`; `playAnimalSound` now falls back on missing file, `networkState === 3`, `_failed`, or a rejected `play()` (Fox/Chicken → synth fallback, else popSound).

5. **Papper kitty narrow-screen clamp (Suggested fix #5)**
   - File: `game/pages/papper_kitty.html`
   - Change: added `@media (max-width: 329px)` that shifts `#music-btn` to `right:256px` and `#worlds-btn` to `right:188px` — preserves the sacred 68px gap and 58px button size, prevents off-screen clipping below ~326px.

6. **Music pauses with the game/tab (Suggested fix #6)**
   - File: `game/pages/papper_kitty.html`
   - Change: `musicTick()` now returns early when `paused` is set, so the 120ms scheduling stops when the tab is hidden or the game is paused.

7. **Puzzle audio feedback (Suggested fix #7)**
   - File: `game/games/animal_puzzle.js`
   - Change: piece pickup plays `tone(520, 0.06, 0, 'triangle')`; piece placement already calls popSound + celebration 'Браво!'.

8. **Strip dead in-hub screens/scripts + slim standalone pages (Suggested fix #8)**
   - Files: `game/index.html`, `game/pages/animals.html`, `game/pages/shapes.html`, `game/pages/matching_game.html`
   - index.html: removed the unreachable game-animals/game-shapes/game-candy/game-coloring screens (only hub + game-kitty iframe are reachable — goTo() short-circuits every game id to a standalone page) and removed the animals.js/shapes.js/candy.js/coloring.js/animal_puzzle.js/animal_counting.js script tags; kept navigation/celebration/audio/speech/utils/kitty/main.
   - animals.html / shapes.html / matching_game.html: removed the hidden hub screen + the other game screens (`display:none!important` override now only forces the single game screen visible) and removed kitty.js + the non-resident game scripts; each page now loads only its own game script. Unused `.hub-*`/other-game CSS rules were intentionally left (zero runtime cost, shared template).
   - Back buttons on the standalone pages keep the `#animals-back` / `#shapes-back` / `#candy-back` ids that main.js binds for the `../index.html` redirect.

9. **Google Fonts decision (Suggested fix #9) — RESOLVED by user (bundle locally)**
   - Files: `game/pages/papper_kitty.html`, new `game/assets/fonts/fredoka-latin.woff2` + `fredoka-latin-ext.woff2`
   - Change: user approved bundling Fredoka locally. Removed the `fonts.googleapis.com` stylesheet link and replaced it with two local `@font-face` rules (variable font, `font-weight: 100 700`, latin + latin-ext subsets — the only subsets this app's Latin text can use; Serbian Cyrillic always fell back to a system font since Fredoka has no Cyrillic). Files downloaded from the Google Fonts CDN (Fredoka v17, SIL Open Font License) and verified as valid woff2 (`wOF2` magic bytes). No external font references remain anywhere in `game/`.

### Validation (2026-08-03)
- `node --check` passed on all changed JS: speech.js, audio.js, animals.js, coloring.js, candy.js, shapes.js, animal_puzzle.js, animal_counting.js.
- HTML bodies of index.html, animals.html, shapes.html, matching_game.html re-read after edits — single `#game-*` screen each, script sets match each page's needs, and the `#*-back` ids main.js expects are present.
- Manual browser re-check still recommended (Live Server, not file://): Tab through the animals card / candy tiles / shapes pieces / puzzle pieces / coloring regions and press Enter/Space; verify back buttons on counting/puzzle/memory fire exactly one popSound and no blank flash.

