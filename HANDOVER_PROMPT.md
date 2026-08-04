# Petrin svet Handover Prompt

Location: `E:\GitHub\Games for kids`

Purpose

This file summarizes the current workspace, conventions, and project state so the next session can continue without friction. Read this before making changes. It is refreshed at the end of every session.

Primary files to read first

- `README.md` — (first) high-level project overview, vision, architecture, and roadmap
- `PROJECT_TASKS.md` — authoritative task list and statuses (NEW / IN PROGRESS / DONE)
- `AGENTS.md` — Ponytail Lazy Dev (YAGNI) persona rules — always active for this project
- `game/index.html` — hub and script load order
- `game/shared/*.js` — navigation, audio, speech, utils, accessibility
- `game/games/*.js` — individual game runtimes (animals, shapes, candy, kitty, puzzle, counting, memory, coloring)
- `tools/README.md` + `tools/headless.js` — shared headless-Chrome test harnesses for the games (tracing smoke/probe live here)

Activate skill

- Ponytail Lazy Dev — enable this project persona and follow its rules (surgical, YAGNI, minimal changes).

Working rules (short)

- Be surgical: prefer the smallest correct change. Follow the Ponytail Lazy Dev (YAGNI) rules.
- Use `game/` for final runtime files. `resources/` is reference only. `tools/` holds dev/test tooling (never deployed, never required by `game/`).
- No external runtime dependencies or remote assets without explicit approval. Audio assets are acquired once and stored locally.
- Validate with the smallest targeted check (node --check for JS, `tools/tracing_smoke.js` for tracing changes, open HTML manually for visual checks).
- Update `PROJECT_TASKS.md` when starting/completing tasks and leave a short note.
- Never add ads, analytics, tracking, or monetization. Offline-first, tablet-first, toddler-friendly.

Current state (as of 2026-08-03)

- Tasks 1–34, 38–48, 49 (Paper Kitty Adventure: world tour + Petrin-svet restyle + round-2 polish + procedural per-world music + HUD/coin fixes), 50–52, **53 (Писање Tracing game)** and **54 (tools/ tooling)** are DONE. Tasks 35/36 (stickers + screen transitions) are **deferred to a later phase**. Open task: **43 (alphabet pronunciation/image audit — NEW, waiting for the human to list the wrong letters/words)**.
- **Писање (Tracing, task 53):** standalone `game/pages/tracing.html` + `game/games/tracing.js`. FREE DRAW on a dashed guide (user feedback #2 on 2026-08-03 — connect-the-dots was not intuitive). The `#tracingGuide` canvas draws a faint dashed outline of the target (letters/numbers in `GUIDE_FONT='900 288px Fredoka…'`, shapes via `drawShapeOutline`), refreshed on every `loadItem`, never counted as ink; a compact ref card sits above. Matching is metrics-based (48×48 grid): pass = `coverage ≥ 0.45` && `near ≥ 0.8` (fraction of ink within 2 cells of the guide — decisive anti-blob/anti-scribble rule) && `ink ≤ 2000`. Correct → celebrate + speech then auto-advance after 2600 ms; wrong → "Покушај још једном!" nudge, canvas kept for redraw. Облици is now only the 4 flat shapes (3D wireframes dropped per user decision). Canonical validation: `node tools/tracing_smoke.js` (22/22 PASS). Screenshots in `resources/tracing/*.png` are STALE (pre-redesign; visual review with MiMo V2.5 Free pending re-capture).
- **Task 47 (visual audit) completed:** captured 19 screenshots, reviewed all, found 7 items (0 blockers, 0 major, 3 minor, 4 cosmetic). 5 fixes implemented: memory button emoji 🧠→🃏, portrait grid gap reduction, kitty back button backdrop, coloring palette 4+4+3 grid, classroom title shifted right. Finding #1 (orphaned hub button) deferred; #3 (letter Ј font) accepted.
- **Учионица (Classroom, tasks 39/41/42/44):** standalone game `game/pages/classroom.html` + `game/games/classroom.js` — 4 learn-and-repeat activities: Азбука (30 letters), Бројеви (0–10, sentences like "Пет слонова"), Облици (Круг/Квадрат/Троугао/Звезда + 3D SVG shapes Лопта/Коцка/Квадар/Ваљак/Купа/Пирамида), Боје (11 colors). Autoplay ▶/⏸ walks tiles at speech-end + 1.5 s pause; no celebrate icon. Polish: "Учионица" title shows only on the hub (not inside an activity); grids no longer resize on tap (no scale animations, `scrollbar-gutter:stable`, fixed-height display); alphabet/number/shape tiles use a cycling 8-color pastel background.
- **Memory (tasks 33/46):** flip whoosh sound + paw-print card back; animal name + sound now play **only on matched pairs** (not on every flip, not on mismatches).
- **Paper Kitty Adventure (task 49, DONE, self-contained `game/pages/papper_kitty.html`):** 11 worlds (Spring, Summer, Autumn, Winter, Underground, Cave, Water, Savanna, Japan, North Pole, Egypt), 1 level each, shuffled order per run + 🌍 world picker, theme-matched goal buildings/enemies/collectible emojis/costumes, stairs with auto step-up, rocky ceiling in Underground/Cave, longer/varied levels (goalX 5150–6850, 4 layout patterns), collectibles drawn as BARE opaque emoji (no backing circle/disc, no alpha/glow — user reported transparency, then asked for the cream sticker circle removed; 2026-08-03). **Procedural background music** (no audio files, Web Audio only): `MUSIC` config = 11 themes with 32-step melody + 16-beat bass + per-world **ambient layer** (bird/cricket/rustle/wind/rumble/drip/bubble/flute/bell/coo/desert), slow tempos 58–100bpm, lookahead scheduler (`musicTick`: 120ms interval, 0.35s horizon, `musicStepTime`/`musicStep` reset on swap). `loadWorld()` calls `startMusic(w.music)`; theme swaps instantly. **Music on/off button** 🔊/🔇 = `#music-btn` at `right:268px` (LEFT of `#worlds-btn` at `right:200px` — do not move closer or they overlap); persists `musicOn` in localStorage key `pkMusic`; music starts on first user gesture via `initAudio()` (which restarts the current theme). The per-world `music:` keys must stay in sync with `MUSIC` keys.
- **Hub order (task 45):** Classroom 🏫 first, then Animals, Shapes, Candy, Kitty, Counting, Memory, Coloring, Puzzle 🧩 last.
- **App name: "Petrin svet" (Петрин свет).** All child-facing text in every game is in Serbian Cyrillic; speech synthesis is Serbian (`speech.js` uses `lang='sr-RS'`). Permanent rule in `AGENTS.md`.
- Games shipped: Animals, Shape Match, Match Game (candy), Paper Kitty Adventure (embedded in-app), Animal Scene Puzzle, Animal Counting, Animal Memory, Coloring, **Учионица (Classroom)**, **Писање (Tracing)**.
- Every game page is a standalone HTML that loads only the shared modules it needs, plus its own `games/<name>.js`. Kitty is the one in-app screen (iframe) launched from the hub.
- Navigation is driven by `shared/navigation.js` `window.goTo(id)`; every `[data-go]` button routes there. Standalone pages' back buttons redirect to the hub (`../index.html` from `pages/`), wired in `shared/main.js`.
- Audio is centralized in `shared/audio.js` (single AudioContext via `ctx()`; helpers: `tone`, `popSound`, `successChime`, `gentleMiss`, `sweep`, `playAnimalSound`).
- Celebration: `shared/celebration.js` defines `window.celebrate(emoji)` — self-contained full-screen overlay (injects its own style), plays `successChime`, speaks "Браво!" (MP3 asset). Used by shapes (round), coloring (scene, keeps animal sound), puzzle (complete, keeps Next), memory (win), counting (final "Готово!" — with two confetti waves; per-answer keeps its inline 🎉 + a full-screen `confetti()` burst, added 2026-08-02). Old per-game `.celebrate` overlays/CSS were removed.
- Speech (`shared/speech.js`) plays pre-generated Serbian MP3 assets (`assets/audio/speech/*.mp3`, **108 files**: 12 animals incl. Кока, 4 flat shapes + 6 3D shapes, numbers 0–10, "Браво!", 30 letter names, 23 alphabet words, 11 colors, 10 number sentences) keyed by the exact Cyrillic word, with OS speechSynthesis as fallback for unknown text. The dev machine has NO Serbian TTS voice, so assets are the only audible path here. `speak()` is called by coloring ("Обој …" — no asset yet, falls back silent here), animals (card tap), shapes (correct placement), counting (number word on correct answer, up to 10), memory (animal name on matched pair only), classroom (letter/word/number/sentence/shape/color on tile tap + autoplay). New assets are generated with `resources/tts_generate.js` (Google Translate TTS tl=sr; idempotent, skips existing files).

Audio / animal sounds (verified complete)

- `playAnimalSound(name)` maps each animal to a local file in `game/assets/audio/`:
  Dog→dog.ogg, Cat→cat.ogg, Cow→cow.ogg, Lion→lion.ogg, Elephant→elephant.ogg,
  Frog→frog.oga, Pig→pig-grunt.ogg, Duck→duck.ogg, Fox→fox.mp3, Sheep→sheep.ogg, Horse→horse.ogg, Chicken→chicken.ogg.
- All 12 animals used across the games (animals.js, candy.js, animal_counting.js, animal_memory.js) resolve to valid, real local audio files — verified by header check.
- Fox sound is a real field recording (Pixabay "fox calling", l3hrja) at `assets/audio/fox.mp3`.
  Sheep (`sheep.ogg`) and Horse (`horse.ogg`) are CC0 recordings from BigSoundBank.com (Joseph SARDIN). No attribution required.
  Chicken (`chicken.ogg`) is Mixkit "Chickens clucking short" (id 1772, free license), trimmed to 2.15s, mono 44.1kHz OGG 25KB.
- `playFoxSynth()` and `playChickenSynth()` remain in audio.js only as fallbacks if a file ever fails to load.
- `playAnimalSound` auto-stops playback after a per-animal max duration (see `maxDuration` map in audio.js).

Folder structure

```
game/
  index.html
  pages/     animals.html shapes.html matching_game.html animal_puzzle.html animal_counting.html animal_memory.html coloring.html classroom.html tracing.html papper_kitty.html
  games/     animals.js shapes.js candy.js kitty.js animal_puzzle.js animal_counting.js animal_memory.js coloring.js classroom.js tracing.js
  shared/    navigation.js audio.js speech.js utils.js main.js accessibility.css
  assets/    fonts/ audio/ images/
tools/
  headless.js  tracing_smoke.js  tracing_probe.js  dilate_test.js  README.md
resources/
  dev-only assets (tts_generate.js, visual_audit_capture.js, screenshots, audit reports)
```

Notes:
- Only `index.html` lives at the `game/` root. All game pages live in `game/pages/`; the hub loads scripts from `game/shared/` and `game/games/`.
- `tools/` = headless test harnesses (see `tools/README.md`); never deployed, never required at runtime. Start every headless run through `tools/headless.js` (unique temp Chrome profile per run) so stale profile locks can't crash later runs.
- `shared/audio.js` roots animal-sound asset paths relative to the document URL (detects `/pages/` in the URL) so sounds work both from the hub and from pages/.
- `game/assets/audio/` holds exactly the 12 animal sounds used by `playAnimalSound` (the legacy duck.ogv, dog-google.ogg, pig.ogg, animal-growl.ogg, animal-squealing.ogg were removed on 2026-08-02).

Coloring game notes

- Scenes live in `game/games/coloring.js` (`coloringScenes`, 12 animals, 134 regions). Each region has `tag`, `color` (a palette hex), and either `attrs: {…}` or the SVG attributes flat on the region object. `createColoringRegion` accepts both forms (`r.attrs || r`, skipping `tag`/`color`), so both conventions are fine — do not assume `attrs` is always present.
- **Revamp (2026-08-03, task 51):** all 12 scenes were redrawn for recognizability (see task 51 note) and the canvas was enlarged in `pages/coloring.html` — ref thumbnail `min(32vmin,24vh)`, main SVG `min(56vmin,48vh)`. New screenshots of every scene are in `resources/coloring-redraw/*.png` (review with MiMo V2.5 Free).
- Layout: `.coloring-wrap` is a flex column; `.coloring-stage` contains name+progress text and a `.coloring-stage-row` (ref thumbnail + main SVG side by side); the palette is pinned at the bottom with `flex-shrink:0`. The wrapper uses `overflow:auto` so content scrolls if it overflows.
- A ➡ next-skip button (top-right, wired in `startColoring()`) advances to the next animal without waiting for the auto-advance.
- Palette is a 6×2 CSS grid (`repeat(6,9vmin)`, 11 swatches + 1 empty cell).
- The success handler calls `playAnimalSound(sceneName)` + `successChime()` and auto-advances after 1500 ms; scene names must match the keys in `shared/audio.js` `animalSoundFiles`.
- Scene-integrity check (colors ∈ palette, region shape valid) was verified; re-run after editing scenes.

Tracing game notes (task 53 — free-draw redesign, 2026-08-03)

- Game lives in `game/pages/tracing.html` + `game/games/tracing.js`. Hub (Слова 🔤 / Бројеви 🔢 / Облици 🔷) shows first on open.
- **Free draw on a dashed guide, not dots.** `#tracingGuide` canvas (400×400, absolute `inset:0`, `pointer-events:none`, no border-radius from the parent) holds the dashed guide — `drawGuide()`: `rgba(155,109,255,0.35)`, lineWidth 12, `setLineDash([16,14])`, `GUIDE_FONT='900 288px Fredoka…'` for letters/numbers (companion `item.shape` check → `drawShapeOutline(g, item.shape, CW)` for shapes). `loadItem()` regenerates the guide AND clears the ink canvas. The guide is never ink.
- Layout: `#tracingRef` (compact ref card) `min(18vmin,14vh)`; `#tracingBoard` wrapper `min(50vmin,34vh)`, `aspect-ratio:1/1`, holds canvas + guide; caption `4.6vmin` below; activity container `overflow-y:auto` — no overlap.
- Matching (`matchResult`) on a 48×48 grid: `refGrid()` = ink of the guide canvas, `inkGrid()` = user ink. Pass = `coverage ≥ MIN_COVER(0.45)` && `near ≥ MIN_NEAR(0.8)` && `ink ≤ MAX_INK(2000)`; `MIN_INK=40` filters accidental taps. `near` = fraction of ink cells within `dilate(ref,2)` (integral-image dilation). Measured (tools/tracing_probe.js): good traces near 0.98–1.0, blobs 0.69, scribbles 0.62, single line 0.7 — big margin at 0.8. Do NOT raise thresholds without re-running the probe.
- Feedback: correct → `window.celebrate('✏️')` + speak name (+ word for letters) then auto-advance after 2600 ms (`glyphDone()` → `loadItem(index+1)`, which clears ink + redraws guide); wrong → "Покушај још једном!" nudge, canvas kept so the child draws over.
- Облици = only the 4 flat shapes (Круг/Квадрат/Троугао/Звезда); 3D wireframes dropped per user decision.
- `window.__traceDebug` (`matchResult`/`refGrid`/`inkGrid`) is used by `tools/tracing_probe.js` — keep it.
- Data: `LETTERS` (30, `label` capital / `name` speech key / `word` + `emoji`), `NUMBERS` (0–10), `SHAPES` (4). Caption "Нацртај А", counter "N од 30/11/4". ➡ `#tracingNext` advances anytime; ↩ `#tracingBack` → hub.
- Wiring: `navigation.js` maps `game-tracing` → `pages/tracing.html`; `main.js` standalone boot `'tracing': ['tracing-back','startTracing']`; hub ✏️ button in `index.html` (`data-go="game-tracing"`).
- All names/words reuse existing `speech.js` MP3 keys (no new audio). **Validation: `node tools/tracing_smoke.js` (22 checks) — expect ALL PASS.** Screenshots in `resources/tracing/*.png` are STALE (pre-redesign); re-capture before the MiMo V2.5 Free visual pass.

Validation checklist (run after edits)

- Syntax check modified/added JS files: `node --check game/shared/*.js game/games/*.js`
- Tracing changes → run the canonical smoke: `node tools/tracing_smoke.js` (expect ALL PASS). Metric/threshold tuning → `node tools/tracing_probe.js`.
- New headless checks → build on `tools/headless.js` (see `tools/README.md`); never write one-off temp probes.
- Open `game/index.html` in a browser to validate navigation and visual parity.
- For `papper_kitty.html`, extract inline JS and run node --check on the extracted code.
- For `papper_kitty.html` music: after touching `MUSIC` or the engine, re-run the Node stubbed-WebAudio harness (30 checks; script was staged at `%TEMP%/opencode/pk_music_test.js` reading extracted JS from `pk_check.js` — recreate by extracting the inline `<script>` and stubbing `AudioContext`/`localStorage`/`document`).
- Latest visual screenshot for Kitty coins is `resources/kitty-coins-no-disc.png` (bare opaque emoji collectibles, no backing circle — user feedback #4, 2026-08-03) — captured but NOT yet reviewed (current model can't read images; use MiMo V2.5 Free for visual review).
- Verify animal sound coverage after changing animal lists: cross-check `game/shared/audio.js` map against `name:` entries in each `game/games/*.js`.

Hosting notes (deployed on Cloudflare Workers at `games-for-kids.radman-milos-work.workers.dev`)

- `Unchecked runtime.lastError: The message port closed...` in the console is injected by a browser extension, not the site — ignore it.
- Every page declares an inline SVG favicon so no `favicon.ico` 404 is requested.
- `shared/audio.js` uses `preload='none'` so audio files load on demand instead of 11 downloads on every page load; the fallback in `playAnimalSound` fires when a source is missing, genuinely failed (`networkState === 3` or an `error` event set the `_failed` flag), or `play()` rejects.
- `shared/main.js` boot wires the back button and starts the game independently (typeof guards) so a missing game module can't break the page.
- Cloudflare Workers pretty-URLs redirect `/pages/<name>.html` → `/pages/<name>`, so `location.pathname` has NO `.html`. All standalone detection (`shared/main.js`, `animal_puzzle.js`, `animal_counting.js`, `animal_memory.js`) must strip `.html` before comparing page names. Do not match against `'name.html'`.
- `pages/papper_kitty.html` self-hosts the Fredoka font via two local `@font-face` rules (`game/assets/fonts/fredoka-latin.woff2`, `fredoka-latin-ext.woff2`, variable font weights 100–700) — bundled 2026-08-03 per user approval, no external font requests at runtime.

Session log — 2026-08-03 (Tracing free-draw redesign + tools/ consolidation)

- Free-draw redesign (user feedback #2: dots not intuitive → draw on a dashed guide): `tracing.js` now renders a dashed guide on a `#tracingGuide` canvas (letters/numbers via `GUIDE_FONT`, shapes via `drawShapeOutline`), `tracing.html` re-laid out (`#tracingBoard` 1:1 wrapper, compact ref above, caption below, scrollable column); metrics matching on a 48×48 grid with `near` (guide proximity) as the decisive rule (`MIN_NEAR=0.8`, `MAX_INK=2000`, `MIN_COVER=0.45`, `MIN_INK=40`); success auto-advances after 2600 ms; Облици = 4 flat shapes only; `__traceDebug` kept for the probe. Measured separation near 0.98–1.0 (good) vs ≤0.70 (blobs/scribbles).
- tools/ consolidation (user request for a reusable tooling home): `tools/headless.js` shared harness (unique temp profile per run, kills only its own Chrome), `tools/tracing_smoke.js` (22 checks — ALL PASS), `tools/tracing_probe.js` (metric table), `tools/dilate_test.js`, `tools/README.md`. Old temp probes in `%TEMP%/opencode/` superseded.
- Docs: PROJECT_TASKS.md task 53 follow-up + task 54 DONE; AGENTS.md (tools/ + validation command); HANDOVER refreshed; README tracing entry updated (see README notes).

Session log — 2026-08-03 (Писање / Tracing game, task 53)

- Built `game/games/tracing.js` + `game/pages/tracing.html`: connect-the-dots tracing, forgiving radius (auto-fill skipped segments, impossible to fail), hub with Слова/Бројеви/Облици + auto-playing pencil intro, ➡ next button, progress counter, celebrate + speech on completion. Reused classroom letter names/words/emoji and all existing `speech.js` MP3s (no new audio assets).
- Wired `navigation.js` (`game-tracing`), `main.js` (`'tracing'` standalone boot), hub ✏️ button in `index.html` (fills task-47 orphaned-row finding; hub now 10 games).
- Validated: `node --check` on tracing/navigation/main; headless Chrome smoke harness `%TEMP%/opencode/tracing_smoke.js` passes 10/10; 5 screenshots in `resources/tracing/*.png` (visual review pending with MiMo V2.5 Free).
- Docs: PROJECT_TASKS.md task 53 DONE; README Current Status + roadmap (Letter/Number Tracing marked ✅ built, hub count updated); HANDOVER refreshed.

Session log — 2026-08-03 (code-review fixes round)

- All actionable findings from `CodeReview_Findings.md` were fixed in one pass; full action log + validation is in that doc ("Fixes performed (2026-08-03, per user request)"). Summary:
  - speech.js: lowercase `'нула'` alias added → classroom zero tile plays nula.mp3.
  - Keyboard accessibility: animals card, candy tiles, shapes pieces/slots, puzzle pieces, coloring regions are now focusable with Enter/Space (and Arrows for candy swaps); Cyrillic aria-labels; shared focus outline in accessibility.css.
  - data-go dedupe: counting/puzzle/memory back buttons now have exactly one handler (blank flash + double popSound gone).
  - audio.js: `_failed` flag via `{once:true}` error listener; playAnimalSound falls back on it.
  - papper_kitty.html: `@media (max-width:329px)` clamps 🔊/🌍 offsets (68px gap preserved) + `musicTick` returns early when paused.
  - animal_puzzle.js: pickup tone added (previously fully silent).
  - index.html stripped dead in-hub game screens + unused game scripts; animals/shapes/matching_game standalone pages slimmed to a single screen + only their own game script (unused `.hub-*` CSS left intentionally).
- Google Fonts (Fredoka) bundled locally per user approval: `game/assets/fonts/fredoka-latin.woff2` + `fredoka-latin-ext.woff2`, two local `@font-face` rules in papper_kitty.html, external `<link>` removed. No external runtime deps remain in `game/`.

Recommended next steps

- **Phase 4 (new game set) is the current focus** (roadmap restructured 2026-08-03, task 52): **Писање (Tracing) shipped as task 53**. The next task is the user's next choice from the Future Mini Games list (Piano, Musical Instruments, Balloon Pop, Farm, Vehicles, Fruit Matching, Dinosaurs, Story Time, Birthday Cake Builder, Ocean Discovery, Space Explorer) — build one per task. Phase 3 standalone educational games are deferred; Phase 5 holds the remaining polish backlog.
- Task 43 (alphabet pronunciation + image audit in Учионица) is waiting on the human to list the exact letters/words that sound or look wrong; only those get regenerated/replaced via `resources/tts_generate.js`.
- Visual pass pending: **Tracing screenshots are STALE** — `resources/tracing/*.png` predate the free-draw redesign; re-capture (via `tools/headless.js` or Live Server) before reviewing with MiMo V2.5 Free. The 12 coloring scenes `resources/coloring-redraw/*.png` also still await review with MiMo V2.5 Free.

Contacts and conventions

- Commit messages: include small clear messages. If you want commits authored, include the Co-authored-by trailer as in project conventions.
- Keep changes minimal and validate immediately.

End of handover.
