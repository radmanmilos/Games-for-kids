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
- Validate with the smallest targeted check (node --check for JS, `tools/tracing_smoke.js` for tracing changes, `tools/driving_smoke.js` for adventure-engine/Driving changes, `tools/ocean_smoke.js` for Ocean changes, open HTML manually for visual checks).
- Update `PROJECT_TASKS.md` when starting/completing tasks and leave a short note.
- Never add ads, analytics, tracking, or monetization. Offline-first, tablet-first, toddler-friendly.

Current state (as of 2026-08-05)

- Tasks 1–34, 38–52, **53 (Писање Tracing game)**, **54 (tools/ tooling)**, **43 (alphabet pronunciation/image audit)**, **55 (Phase 3: Учионица kids tier)**, **57 (GitHub Pages via `docs/` mirror)**, **58/59 (Клавир Piano game)**, **60 (shared adventure engine + Возила Driving game)**, and **61 (Океан Ocean game)** are DONE. **Task 56 (GitHub Actions auto-deploy) is ABANDONED** (2026-08-04, per user decision — Pages refused to deploy from `game/`; the workflow was removed). Tasks 35/36 (stickers + screen transitions) are **deferred to a later phase**. **Phase 4 is ACTIVE (2026-08-05) — Океан (task 61) just shipped; the user is play-testing it now. The next game is task 62 (🦕 Дино, ground mode) — DO NOT start it until the user gives feedback on Океан (user rule: stop after each game for feedback).**
- **Клавир (Piano, tasks 58/59):** standalone `game/pages/piano.html` + `game/games/piano.js`. 8-key one-octave keyboard (C4–C5, rainbow color-coded), Web Audio `tone()` (no new audio assets). Free play (tap → note + glow) and "Свирај песму" — follow-the-melody mode with a **3-song chip picker** (`#songChips`, **emoji icons ⭐/🎂/🔔** with the title as `aria-label`): **Трепери, трепери звездице** (42 notes), **Срећан ти рођендан** (25), **Џингл белс** (26) — all transposed/simplified to fit the octave; keys light up one at a time playing their tone, child taps the same key to advance (wrong = shake + "Покушај још једном!", no punishment; counter adapts to song length; finish → celebrate 🎹 + "Свирао си песму!" panel + Играј поново; 🔊 Чуј песму preview plays the chosen melody — stopping it re-lights the current guided note). Hub button 🎹 is **3rd** (after Учионица/Писање, per user request). Canonical validation: `node tools/piano_smoke.js` (14/14 PASS).
- **Возила (Driving, task 60, DONE 2026-08-04):** new **shared adventure engine** `game/games/adventure.js` (~1470 lines) — config-driven port of the Paper Kitty runtime, reusable by all four Phase 4 games. Modes: `ground` (kitty physics), `drive` (road auto-scrolls via `cfg.driveSpeed`, hero steers/clamped), `fly` (free 2D + momentum). Config-driven: 10+ worlds each with `hero`, `speed`, `driveSpeed`, obstacles (7–8, forgiving collision), 13 coins, `goalX` (5800–6650), per-world `decor` (city/palms/gulls/stars/leaves/snow), `bg` gradient, and a unique `music` theme (32-step melody + 16-beat bass + ambient layer: horn/cricket/bird/wind/rustle/rumble/owl/waves/desert/bell). Shared HUD ids `#adv-*` (canvas, score, coin-count, level, world-name, worlds/music buttons + modals), shared page chrome `.adv-back` + `#adv-title` in `game/shared/adventure.css`. Exposes `window.AdventureEngine.create` + `window.__adv` debug handle (player/coins/obstacles/goal/theme/music/levelCompleted/lastHitAt/bumpCount) for headless tests. Game = thin page + config: `game/pages/driving.html` (title "Возила", back btn `#driving-back`) + `game/games/driving.js` (hero 🚗, 10 road worlds: Градски трг ⭐, Поље сунцокрета 🍭, Јесења шума 🍂, Зимски пут ⛄, Планински пут 🎿, Ноћни град 🌙, Пустињска магистрала 🌵, Тропско острво 🌴, Морска обала 🐚, Космичка стаза 🪐). Wired: hub 🚗 button (`data-go="game-driving"`, after kitty button), `navigation.js` route, `main.js` standalone boot `'driving': ['driving-back','startDriving']`. **Engine bugs fixed during smoke:** obstacle-collision check had been OUTSIDE the `obstacles.forEach` loop (ReferenceError every frame) — moved inside; drive `respawnPlayer()` left `player.x` stale for a frame (teleport) — now sets `player.x = cameraX + player.offsetX` immediately; drive `player.y` clamp now `canvas.height*0.24 … -10`. Canonical validation: `node tools/driving_smoke.js` (17/17 PASS).
- **Океан (Ocean, task 61, DONE 2026-08-05):** second Phase 4 adventure game on the shared engine — **fly mode** (free 2D, no gravity). `game/pages/ocean.html` (title "Океан", back btn `#ocean-back`, **4-way fly D-pad** `#adv-controls.adv-fly-controls` — new CSS in adventure.css) + `game/games/ocean.js` (hero 🐟, `heroFontSize` 84). 10 underwater worlds: Корални гребен, Лагуна, Морске траве, Каменита обала, Потопљени брод, Морска пећина, Ледени океан, Морски ров, Пиратско благо, Ноћни океан — 8 obstacles + 13 coins + goal (🏁 flag-arch banner, „ЦИЉ!" on a woven-ribbon cloth) each. 9 obstacle types: patrolling sharks (**vx/minX/maxX** — bounce flips vx when `x+width` crosses the bound), jellyfish, rocks, mines, seaweed, pufferfish, crab, anchor, default rock. 10 music themes (32-step melody + 16-beat bass + root + ambient) + 10 decor types (bubbles/corals/starfish/shells/rocks/kelp/fish schools/cave lights/pyramid/glints). **Engine hooks added to adventure.js:** `cfg.drawObstacle(ctx, o, theme)`, `cfg.drawDecor(ctx, t, cameraX, canvas, theme)` (both return early when defined), `cfg.heroFontSize` (default 48), `cfg.heroFlip` (inverts the facing-right scale — needed because the 🐟 emoji natively faces LEFT), `cfg.heroBob` (slow sine vertical bob on the hero draw). Wired: hub 🐠 button (`data-go="game-ocean"`), `navigation.js` route, `main.js` standalone boot `'ocean': ['ocean-back','startOcean']`. Canonical validation: `node tools/ocean_smoke.js` (20/20 PASS). **Polish round (2026-08-05, per user feedback):** fish faces its movement direction (`heroFlip: true`), fish bobs while swimming (`heroBob: 5`), and the fly D-pad is tablet-friendly — ◀▶ in a horizontal cluster on the LEFT edge, ▲▼ in a vertical cluster on the RIGHT edge (`adv-pad-horizontal`/`adv-pad-vertical`; HTML button order is now `left,right,up,down`). **Smoke gotchas:** `window.__adv` `cameraX`/`lastHitAt` are getter-only (assignments silently no-op — reset state via `a.loadWorld()`, not assignment); obstacle-hit checks must wait ≥1100 ms after `loadWorld()` for the `lastHitAt` cooldown; assert patrol bounce on the `vx` flip, not on `x2 < x1`.
- **Писање (Tracing, task 53):** standalone `game/pages/tracing.html` + `game/games/tracing.js`. FREE DRAW on a dashed guide (user feedback #2 on 2026-08-03 — connect-the-dots was not intuitive). The `#tracingGuide` canvas draws a faint dashed outline of the target (letters/numbers in `GUIDE_FONT='900 288px Fredoka…'`, shapes via `drawShapeOutline`), refreshed on every `loadItem`, never counted as ink; a compact ref card sits above. Matching is metrics-based (48×48 grid): pass = `coverage ≥ 0.45` && `near ≥ 0.8` (fraction of ink within 2 cells of the guide — decisive anti-blob/anti-scribble rule) && `ink ≤ 2000`. Correct → celebrate + speech then auto-advance after 2600 ms; wrong → "Покушај још једном!" nudge, canvas kept for redraw. Облици is now only the 4 flat shapes (3D wireframes dropped per user decision). Canonical validation: `node tools/tracing_smoke.js` (22/22 PASS). Screenshots in `resources/tracing/*.png` are STALE (pre-redesign; visual review with MiMo V2.5 Free pending re-capture).
- **Task 47 (visual audit) completed:** captured 19 screenshots, reviewed all, found 7 items (0 blockers, 0 major, 3 minor, 4 cosmetic). 5 fixes implemented: memory button emoji 🧠→🃏, portrait grid gap reduction, kitty back button backdrop, coloring palette 4+4+3 grid, classroom title shifted right. Finding #1 (orphaned hub button) deferred; #3 (letter Ј font) accepted.
- **Учионица (Classroom, tasks 39/41/42/44/43):** standalone game `game/pages/classroom.html` + `game/games/classroom.js` — 4 learn-and-repeat activities: Азбука (30 letters; since task 43 the 25 consonants speak their letter sound, vowels their name, plus a word + emoji), Бројеви (0–10, sentences like "Пет слонова"), Облици (Круг/Квадрат/Троугао/Звезда + 3D SVG shapes Лопта/Коцка/Квадар/Ваљак/Купа/Пирамида), Боје (11 colors). Autoplay ▶/⏸ walks tiles at speech-end + 1.5 s pause; no celebrate icon. Polish: "Учионица" title shows only on the hub (not inside an activity); grids no longer resize on tap (no scale animations, `scrollbar-gutter:stable`, fixed-height display); alphabet/number/shape tiles use a cycling 8-color pastel background.
- **Memory (tasks 33/46):** flip whoosh sound + paw-print card back; animal name + sound now play **only on matched pairs** (not on every flip, not on mismatches).
- **Paper Kitty Adventure (task 49, DONE, self-contained `game/pages/papper_kitty.html`):** 11 worlds (Spring, Summer, Autumn, Winter, Underground, Cave, Water, Savanna, Japan, North Pole, Egypt), 1 level each, shuffled order per run + 🌍 world picker, theme-matched goal buildings/enemies/collectible emojis/costumes, stairs with auto step-up, rocky ceiling in Underground/Cave, longer/varied levels (goalX 5150–6850, 4 layout patterns), collectibles drawn as BARE opaque emoji (no backing circle/disc, no alpha/glow — user reported transparency, then asked for the cream sticker circle removed; 2026-08-03). **Procedural background music** (no audio files, Web Audio only): `MUSIC` config = 11 themes with 32-step melody + 16-beat bass + per-world **ambient layer** (bird/cricket/rustle/wind/rumble/drip/bubble/flute/bell/coo/desert), slow tempos 58–100bpm, lookahead scheduler (`musicTick`: 120ms interval, 0.35s horizon, `musicStepTime`/`musicStep` reset on swap). `loadWorld()` calls `startMusic(w.music)`; theme swaps instantly. **Music on/off button** 🔊/🔇 = `#music-btn` at `right:268px` (LEFT of `#worlds-btn` at `right:200px` — do not move closer or they overlap); persists `musicOn` in localStorage key `pkMusic`; music starts on first user gesture via `initAudio()` (which restarts the current theme). The per-world `music:` keys must stay in sync with `MUSIC` keys.
- **Hub order (task 45):** Classroom 🏫 first, then Tracing ✏️, **Piano 🎹 (3rd, 2026-08-04 per user request)**, Animals, Shapes, Candy, Kitty, Counting, Memory, Coloring, Puzzle 🧩 last.
- **App name: "Petrin svet" (Петрин свет).** All child-facing text in every game is in Serbian Cyrillic; speech synthesis is Serbian (`speech.js` uses `lang='sr-RS'`). Permanent rule in `AGENTS.md`.
- Games shipped: Animals, Shape Match, Match Game (candy), Paper Kitty Adventure (embedded in-app), Animal Scene Puzzle, Animal Counting, Animal Memory, Coloring, **Учионица (Classroom)**, **Писање (Tracing)**, **Клавир (Piano)**, **Возила (Driving)**, **Океан (Ocean)**.
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
  pages/     animals.html shapes.html matching_game.html animal_puzzle.html animal_counting.html animal_memory.html coloring.html classroom.html tracing.html papper_kitty.html driving.html ocean.html
  games/     animals.js shapes.js candy.js kitty.js animal_puzzle.js animal_counting.js animal_memory.js coloring.js classroom.js tracing.js adventure.js driving.js ocean.js
  shared/    navigation.js audio.js speech.js utils.js main.js accessibility.css adventure.css
  assets/    fonts/ audio/ images/
tools/
  headless.js  tracing_smoke.js  tracing_probe.js  dilate_test.js  piano_smoke.js  driving_smoke.js  ocean_smoke.js  README.md
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

Session log — 2026-08-04 (docs accuracy + nul.mp3 rename)

- Renamed `game/assets/audio/speech/nul.mp3` → `nula.mp3` (Windows reserved device name `nul` blocked git add) and updated every reference: `speech.js` (`'нула'`/`'Нула'` → `nula.mp3`), `resources/tts_generate.js` generator entry (`nul` → `nula`), and the doc mentions in HANDOVER / PROJECT_TASKS / CodeReview_Findings. `node --check` passes on both JS files; `nula.mp3` is now tracked and the working tree is clean.
- Docs accuracy pass: verified app state vs documents (working tree clean, tasks up to 54 DONE). PROJECT_TASKS / HANDOVER / AGENTS were already accurate; README.md fixed 7 stale spots: (1) Fonts section still claimed Paper Kitty HUD uses Press Start 2P — now Fredoka (bundled locally); (2) Coloring scene list missing Chicken (12 scenes); (3) Coloring polish-backlog example "Животиња 3 од 11" → "од 12"; (4–7) folder-structure/architecture listings in README missing `tracing.html` / `tracing.js` (two places each) + repo tree missing `tools/` and top-level docs.

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

- **Task 56 (GitHub Actions deploy) is ABANDONED; task 57 (docs/ mirror) is DONE.** Deployment rule: `game/` is the single source of truth; on EVERY change to `game/`, replace the ENTIRE `docs/` content with the new `game/` content via `tools/sync-docs.sh`, then commit and push to `main`. GitHub Pages serves main → `/docs`, so the push publishes **https://radmanmilos.github.io/Games-for-kids/**.
- **Phase 3 (Учионица kids tier, task 55) is DONE** — wait for the user's play-test feedback on the 4 quiz games ("За децу" set in Учионица) and apply polish rounds as they come.
- **Phase 4 is active (tasks 58/59 Клавир/Piano, 60 Возила/Driving, 61 Океан/Ocean all DONE)** — the user picks the next mini-game from the Future Mini Games list; build one per task. Per the project rule, wait for the user's play-test feedback on Океан before starting task 62 (🦕 Дино). Remaining Phase 4 adventure order per user decision: 62 = Дино (ground mode), 63 = Свемир (fly mode).
- **Deploy reminder:** every time `game/` changes, run `tools/sync-docs.sh`, commit, and push to `main` — GitHub Pages serves main → `/docs` at https://radmanmilos.github.io/Games-for-kids/.
- Task 43 (alphabet pronunciation + image audit in Учионица) is **DONE (2026-08-04)**: letter tiles now speak the letter sound (25 consonants) instead of the name; words+emoji replaced Е→Екран🖥️, И→Игла🪡, Џ→Џемпер🧥; 28 new MP3s generated and 28 obsolete ones deleted. REMAINING: the user's listening pass on the 25 sound MP3s + 3 words (Google TTS may render a bare consonant like "б" as "бе" — flag any file that needs regenerating via `resources/tts_generate.js`).
- Visual pass pending: **Tracing screenshots are STALE** — `resources/tracing/*.png` predate the free-draw redesign; re-capture (via `tools/headless.js` or Live Server) before reviewing with MiMo V2.5 Free. The 12 coloring scenes `resources/coloring-redraw/*.png` also still await review with MiMo V2.5 Free.

Session log 2026-08-04

- Task 43 executed per user's approved list (all 25 consonants → bare sounds; vowels unchanged; Екран/Игла/Џемпер word swaps). Edited `game/games/classroom.js` + `game/games/tracing.js` (identical ALPHABET/LETTERS data), `game/shared/speech.js` (sound keys → new MP3 filenames; word keys), `resources/tts_generate.js` (generator pairs). Ran generator → `generated: 28, skipped: 53, failed: 0`; verified all 28 MP3s present; removed the 28 obsolete MP3s. `node --check` on all 4 JS files PASS; grep confirmed zero old references; `node tools/tracing_smoke.js` 22/22 PASS. Docs updated (README, HANDOVER, PROJECT_TASKS task 43 → DONE).
- Task 55 (Phase 3: Учионица kids tier) built: classroom hub now has two sets "За малишане"/"За децу"; new `game/games/kids_games.js` shared 8-question multiple-choice engine + 4 configs (Азбука/Бројеви/Боје/Облици за децу); classroom.js exposes `window.classroomData` + kids screen switching; classroom.html added `#kidsGame` screen, kids-tier CSS, and the previously-missing `utils.js` + `celebration.js` script tags. Validated: node --check; `node tools/kids_smoke.js` 12/12 PASS; baby-tier numbers probe 4/4 PASS. Docs updated (PROJECT_TASKS task 55 → DONE, README Phase 3 ACTIVE / Phase 4 queued, tools/README).
- Task 56 (GitHub Actions auto-deploy) tried then ABANDONED: user ran `tools/deploy-game-gh-pages.sh`, PR #2 merged the workflow (`.github/workflows/deploy.yml` deploying `game/` → `gh-pages`), but GitHub Pages refused to serve the site from `game/`, so the user dropped the workflow approach (2026-08-04, per user decision). Workflow + `tools/deploy-game-gh-pages.sh` both removed.
- Task 57 (GitHub Pages via `docs/` mirror) DONE: user pasted the whole `game/` content into `docs/`; Pages serves main → `/docs` at https://radmanmilos.github.io/Games-for-kids/. New `tools/sync-docs.sh` automates "replace the ENTIRE `docs/` content with the new `game/` content on every game change". Verified no root-absolute asset refs (app works under `/Games-for-kids/`). Docs updated (README Deployment section rewritten, PROJECT_TASKS tasks 56/57, HANDOVER).
- Task 58 (Клавир/Piano, Phase 4 first game) DONE: user picked Piano from the Future Mini Games list and approved the scope proposal as-is. Built `game/pages/piano.html` + `game/games/piano.js`: 8-key octave (rainbow-coded), free play + "Свирај песму" follow mode ("Трепери, трепери звездице", 42 notes, Web Audio only), wrong-key nudge, 🏅 finish panel + replay, 🔊 preview with mid-stop re-lighting of the current note. Wired hub button/navigation/main.js boot. Validated: node --check + new `node tools/piano_smoke.js` 12/12 PASS. Docs updated (PROJECT_TASKS task 58 DONE, README Future Mini Games ✅ + Phase 4 entry + Current Status, tools/README, HANDOVER).
- Task 59 (piano polish, per user feedback "looks and sound good"): hub button 🎹 moved to 3rd place; refactored to multi-song engine with a **song chip picker** and 2 new songs the user chose (#1 Срећан ти рођендан, #3 Џингл белс) — Трепери kept as default. Counter/finish/preview adapt to the chosen song. Fixes found by smoke: initial active chip not highlighted. Validated: `node tools/piano_smoke.js` 14/14 PASS. docs/ re-synced; remaining = user commit/push.
- Task 60 (shared adventure engine + Возила/Driving, first of four Phase 4 adventure games) DONE: built `game/games/adventure.js` (config-driven engine, modes ground/drive/fly) + `game/pages/driving.html` + `game/games/driving.js` (drive mode, 10 road worlds, per-world music + ambient, 13 coins, 7–8 obstacles, goal gate); hub 🚗 button + navigation route + main.js standalone boot wired. Fixed two drive-mode engine bugs during smoke (obstacle-collision `o` scope; stale `player.x` after respawn). Validated: node --check + `node tools/driving_smoke.js` 17/17 PASS (run repeatedly, stable). Docs updated (PROJECT_TASKS task 60 DONE, README game section + Current Status + Future list + folder trees, tools/README, HANDOVER). NOT yet run: `tools/sync-docs.sh` + user commit/push. **Pause here for user play-test feedback before task 61 (🐠 Океан).**

Driving play-test follow-up (2026-08-04): only the vertical controls remain on `driving.html` (▼ left, ▲ right); drive mode freezes the car and road once the finish line opens the next-world modal; the road has one dashed center divider; driving car, obstacles, and pickups are larger. Canonical validation is `node tools/driving_smoke.js` after the follow-up smoke assertions.

Driving final follow-up (2026-08-04): the updated transparent PNG car is tinted red, car/obstacle collision bounds are forgiving, and the driving clamp now allows the car 20px above the road edge so the large car can use more of the upper road. Task 60 is DONE; per the project rule, wait for user feedback before starting task 61 (🐠 Океан).

Session log — 2026-08-05 (task 61: Океан/Ocean, second Phase 4 adventure game)

- Built `game/games/ocean.js` + `game/pages/ocean.html` on the shared adventure engine: fly mode (free 2D, no gravity), hero 🐟, 10 underwater worlds with 8 obstacles + 13 coins + 🏁 goal banner each, 9 obstacle types (patrolling sharks via vx/minX/maxX, jellyfish, rocks, mines, seaweed, pufferfish, crab, anchor, default rock), 10 music themes + 10 decor types. Added 3 engine hooks: `cfg.drawObstacle`, `cfg.drawDecor`, `cfg.heroFontSize`. Wired hub 🐠 button, `navigation.js` route, `main.js` standalone boot.
- Canonical validation: new `node tools/ocean_smoke.js` → **18/18 PASS**. Three smoke checks fixed during the session: (1) coin test failed because `a.cameraX = …` silently no-ops on the getter-only debug handle — now resets via `a.loadWorld()`; (2) obstacle-hit check needed `await sleep(1100)` (matches driving — the `lastHitAt` cooldown must expire after `loadWorld()`); (3) patrol test asserted `x2 < x1` which is wrong — the bounce keeps the shark past its earlier position; assert on the `vx` flip at both bounds instead.
- Docs updated: PROJECT_TASKS (task 61 DONE + header), README (new 🐠 game section, Current Status, Future Mini Games + Phase 4 roadmap ✅, folder trees), tools/README (ocean_smoke entry + getter-only `__adv` gotcha), HANDOVER. NOT yet run: `tools/sync-docs.sh` + user commit/push. **Pause here for user play-test feedback before task 62 (🦕 Дино).**
- **Ocean polish round (2026-08-05, per user play-test feedback):** (1) fish faced the wrong way — the 🐟 emoji points LEFT natively, so new engine hook `cfg.heroFlip` inverts the `facingRight` scale (ocean sets `heroFlip: true`); (2) fish now bobs while swimming — new engine hook `cfg.heroBob` (ocean sets `heroBob: 5`) adds a gentle sine bob to the hero draw; (3) tablet-friendly controls — fly D-pad split into two thumb clusters: ◀▶ horizontal pad on the LEFT edge, ▲▼ vertical pad on the RIGHT edge (`adv-pad-horizontal`/`adv-pad-vertical` in adventure.css; HTML button order changed to `left,right,up,down`). Validated: node --check + `node tools/ocean_smoke.js` → **20/20 PASS** (updated controls-order/grouping checks + `heroFlip`/`heroBob` static check). Screenshots for visual review: `resources/ocean-review/{idle,facing-right,facing-left}.png` (Big Pickle can't read images — use MiMo V2.5 Free). docs/ re-synced; user commit/push still pending.

Contacts and conventions

- Commit messages: include small clear messages. If you want commits authored, include the Co-authored-by trailer as in project conventions.
- Keep changes minimal and validate immediately.

End of handover.
