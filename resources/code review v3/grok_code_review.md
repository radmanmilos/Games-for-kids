# Build AI Instructions — Petrin svet (Games-for-kids)

Use these instructions on every coding session for this repository.
They complement (do not replace) `AGENTS.md`, `project/PROCESS.md`, and the lesson files under `project/lessons/`.

**Primary identity:** Ponytail Lazy Dev (YAGNI, surgical, minimal).
**Product:** Offline-first educational mini-games for children ≈2–6 years. Serbian Cyrillic only for child-facing text and speech. No ads, no IAP, no internet required for play.

---

## 1. Non-negotiable rules

1. **Serbian Cyrillic for children.** All text shown to the child and all speech synthesis must be Serbian Cyrillic. English is allowed only as internal keys, comments, or parent-facing labels.
2. **No frustration.** Children should almost never fail. Prefer larger hit areas, hints after 1–2 misses, progressive difficulty, and celebration on success. Never punish mistakes.
3. **Offline-first.** No external APIs, CDNs, or network-required assets at runtime. Prefer local assets, Web Audio, and vanilla JS.
4. **`game/` is the only runtime.** Never make `game/` depend on `resources/`, `tools/`, or anything outside itself. `docs/` is a published mirror — never edit it by hand; regenerate with `tools/sync-docs.sh`.
5. **Single source of truth for pages/routes.** `game/data/app-registry.js` is authoritative. Do not add hand-written route maps, boot tables, or page lists elsewhere.
6. **YAGNI.** Smallest correct change. No speculative abstractions, no new dependencies, no “nice to have” refactors outside the task.
7. **Validate before claiming done.** Use the validation ladder (see §7). A change that touches a screen must refresh the affected review screenshots.

---

## 2. Architecture map (read before changing)

| Need | Location |
|------|----------|
| Public pages, routes, boot functions, smokes, offline flags | `game/data/app-registry.js` |
| Shared boot, progress, back navigation | `game/shared/main.js` |
| Hub navigation + service worker registration | `game/shared/navigation.js` |
| Art (emoji → WebP + fallback) | `game/shared/art.js` + `game/data/art-registry.js` |
| Audio / tones / animal sounds | `game/shared/audio.js` (+ `audio-buses.js` when present) |
| Speech | `game/shared/speech.js` |
| Celebration / feedback | `game/shared/celebration.js`, `feedback.js` |
| Game implementations | `game/games/*.js` |
| Standalone pages | `game/pages/*.html` |
| Service worker | `game/sw.js` (version from `manifest.json`) |
| Deployable app | `game/` only |
| Published site | `docs/` (mirror of `game/`) |
| Dev / test tooling | `tools/` |
| Live project docs | `project/` |

When a game’s behaviour changes, update its guide under `project/games/<game>.md`.

---

## 3. Coding patterns to follow

### 3.1 Registry-driven everything

- New page or route → add one entry to `APP_REGISTRY` with: `id`, `path`, `category`, `title`, `smoke`, `screenshot`, `offline`, `toddler`, `route`, `hubOrder`, `hubGroup`, `back`, `start`.
- Navigation and `main.js` already read the registry. Do not duplicate lists.
- `back: null` / `start: null` means the page wires itself; do not invent IDs that do not exist in the DOM.

### 3.2 Art helper (mandatory for glyphs)

    // Prefer these — never set emoji textContent / innerHTML directly for registered glyphs
    Art.fill(el, glyph);                    // replaces content
    Art.fillAttr(el, 'data-e', glyph);      // CSS ::before sites
    Art.html(glyph, optionalClass);         // string for innerHTML
    Art.draw(ctx, glyph, cx, cy, size);     // canvas

- Register new glyphs in `game/data/art-registry.js` and ensure the WebP exists under `game/assets/art/`.
- Emoji is the universal fallback; missing art must not break the game.
- Do not reintroduce raw emoji paint sites for content that already goes through Art (hub/nav exceptions are documented and deferred).

### 3.3 Audio and speech

- Unlock on first user gesture (`window.ctx` / pointerdown).
- Prefer existing helpers: `popSound`, `successChime`, `gentleMiss`, `playAnimalSound`, speech + ducking via `audioBuses` when available.
- Do not create new `AudioContext` instances or one-off audio systems without a demonstrated need.
- Synthesized fallbacks are OK when a real file is missing; keep them short and gentle.

### 3.4 No-frustration interaction patterns

- Large touch targets; prefer `pointer` events with capture.
- Snap / match radii should be forgiving (e.g. 1.5× slot size is a known good default in shapes).
- After 1–2 misses, show a short hint (highlight correct target), then clear it.
- On success: short celebration + speech of the name/concept, then advance.
- Progressive difficulty (tiers / more choices) only after the child is succeeding.
- Keyboard support where practical (`role="button"`, Enter/Space, aria-labels in Serbian).

### 3.5 Boot and navigation

- Export a single start function on `window` when the registry expects it (e.g. `window.startAnimals = startAnimals`).
- Back button: use the registry `back` id when present; otherwise the page binds `.back-btn` itself. Return via `location.href = '../index.html#hub-<group>'` or `window.returnToParent()`.
- Keep boot idempotent (do not bind listeners twice).

### 3.6 Progress (parent-only)

- Use `PetrinProgress` only for local, non-blocking stats. Never gate content or show scores/XP/streaks to the child.
- Core play must behave the same if storage is missing or cleared.

### 3.7 Service worker / offline

- Version lives only in `game/manifest.json`. Cache name is derived from the registration query `?v=`.
- After runtime asset or page changes that affect offline: run the offline build steps (see tools README / `project/reference/OFFLINE.md`), then `tools/sync-docs.sh`.
- Never hard-code absolute paths that break under the GitHub Pages subpath (`/Games-for-kids/`).

---

## 4. How to add or change a game (checklist)

1. Implement or edit under `game/games/<name>.js` and `game/pages/<name>.html`.
2. Reuse shared systems (Art, audio, speech, celebration, navigation, main).
3. Add/update the entry in `game/data/app-registry.js`.
4. Register any new glyphs in the art registry and ship WebPs if needed.
5. All child-visible strings and speech → Serbian Cyrillic.
6. Add or update the smoke: `tools/<name>_smoke.js` (or the existing one listed in the registry).
7. Update `project/games/<name>.md` if behaviour changed.
8. Run the smallest relevant validation (see §7).
9. If the screen’s appearance changed: refresh review screenshots for the affected pages.
10. Sync docs: `tools/sync-docs.sh` (after offline build if offline inventory changed).
11. Do **not** push to `main` unless the user explicitly asks.

---

## 5. Style and structure conventions

- Prefer clear, small functions over deep nesting or clever one-liners.
- Comments explain *why* (especially iOS audio, SW lifetime, past bugs, load-order sensitivity). Avoid noise comments.
- Avoid new global `window.*` exports unless the shared boot/registry needs them.
- Prefer existing CSS patterns (hub buttons, back bubble, celebration motion). Do not invent a second visual language.
- Motion: playful but calm. No flashing, no time pressure, no loud sudden sounds.
- Keep `game/` free of experiments, TODOs that belong in tasks, and unused assets.

---

## 6. What not to do

- Do not edit `docs/` by hand.
- Do not add npm runtime dependencies or remote scripts/fonts/images.
- Do not reintroduce hand-written route/boot maps that duplicate the registry.
- Do not punish the child (timers that fail the round, score penalties, locked content).
- Do not show parent controls (offline download, reset, version) on child-facing screens.
- Do not “fix” versioning to semver: `A.B.C` here means A = overhaul, B = major feature drop, C = segment/fix (see AGENTS.md).
- Do not commit secrets, Cloudflare credentials, or anything under git-ignored tool vendor paths.
- Do not claim done without evidence (commands run + results). Prefer file:line references.

---

## 7. Validation ladder (use the smallest sufficient step)

| Goal | Command |
|------|---------|
| Fast read-only gate (~9 s, what CI fast job runs) | `node tools/check_fast.js` |
| One game / affected smokes | `node tools/run_all.js --game <name>` or `--affected` |
| Syntax only | `node tools/check_syntax.js` |
| Registry / pages / metadata | `node tools/validate_pages.js` |
| Offline inventory | `node tools/validate_offline.js` (and build steps when assets change) |
| Full battery before release | `node tools/check_release.js` |
| Docs size / consistency | `node tools/check_docs.js` |
| Accessibility (serious/critical) | `node tools/axe_check.js` |
| Screenshots for a visual change | `node tools/screenshot.js --review=... --pages=... --task=...` |

Rules:

- A check must **fail** on a stale generated artifact; it must not silently rewrite it.
- After `game/` changes that affect offline or published site: offline build → `tools/sync-docs.sh` → commit when the user asks.
- Update smoke assertions to match the new behaviour; never bend `game/` only to satisfy a stale test.
- Record validation in the task log when the project process requires it (`tools/.cache/task…` / ACTIVE.md).

---

## 8. Task and communication discipline

- Follow `project/PROCESS.md`: one write per task in `project/tasks/ACTIVE.md`, archive at session end, overwrite `project/STATUS.md`.
- Before starting work: check git status and recent CI; if the tree is dirty or CI is red in a way you did not cause, report first.
- Propose → approve → implement when scope is ambiguous or expands.
- Be surgical. If approaching context limits, finish the current micro-step, document state, and stop.
- Provenance: record real tool/model in task notes when the project asks for it.

---

## 9. Quick reference — shared APIs

    // Navigation
    window.goTo(routeOrScreenId)
    window.returnToParent()

    // Art
    Art.fill(el, glyph)
    Art.fillAttr(el, attr, glyph)
    Art.html(glyph, cls)
    Art.draw(ctx, glyph, cx, cy, size)

    // Audio / feedback
    window.ctx()                 // unlock + get AudioContext
    window.popSound()
    window.successChime()
    window.gentleMiss()
    window.playAnimalSound(name) // English key, e.g. 'Dog'
    window.celebrate()           // also records progress when wrapped

    // Speech (prefer buses when present)
    window.speech.speak(text, onEnd)
    window.audioBuses?.speakWithDuck(text, onEnd)

    // Progress (local only)
    PetrinProgress.play(id)
    PetrinProgress.complete(id)
    PetrinProgress.snapshot()
    PetrinProgress.reset()       // parent area only

---

## 10. When in doubt

1. Read the relevant lesson under `project/lessons/` (testing-harness, ci-offline, game-runtime, racing3d, asset-generation, security).
2. Check `project/DECISIONS.md` for locked decisions — do not re-open them without the user.
3. Prefer the existing pattern in a similar game over inventing a new one.
4. Ask one concise clarifying question rather than expanding scope.

---

*These instructions are derived from the project’s own rules and a full code review of the repository. Prefer the live files in the repo (`AGENTS.md`, PROCESS, lessons, STATUS) if anything here diverges after future changes.*