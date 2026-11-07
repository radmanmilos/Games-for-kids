# Little Explorer — Performance and Fallback Strategy (Phase 2, task 410)

**Project:** Little Play / Petrin svet — Мала истраживачица (Little Explorer)
**Scope:** Performance targets and missing-asset fallback behaviour for the Little Explorer world redesign on modest Android tablets. Design doc only — no `game/` changes, no asset generation.
**Relationship:** Companion to `EXPLORER_TECHNICAL_CONTRACT.md` (loading) and `EXPLORER_INTEGRATION.md` (rendering).
**Status:** Proposed — Gate 2 acceptance pending before implementing a full world.

---

## 1. Performance targets (modest Android tablet)

| Metric | Target | How measured |
|---|---|---|
| Frame rate during normal play | Sustained ~60 FPS on modest Android tablet | `racing3d` frame-time instrumentation pattern (PERF_WINDOW=120, perfSample) where applicable; headless skips without WebGL |
| Frame rate in busy scenes | No drops below playable threshold | Same instrumentation |
| Image memory footprint | Bound by 60 KB/file glyph cap + cached scene art | Audit `game/assets/art/` + `game/assets/scenes/` sizes |
| Initial asset load time | Fast enough that loading state is brief | Network/devtools timing; offline-first local files |
| World-transition load | No visible hitch; cached assets reused | Cache keyed by URL across world changes |
| Garbage collection / per-frame allocations | No per-frame Image creation; reuse memoized images | `Art.image()` memoization; audit draw loop |
| Canvas draw cost | Reasonable draw-call count; no unnecessary canvas resizing | Profile `draw()` |
| Large-image decode cost | Scene art sized to viewport, not oversized | Scene dimensions vs canvas |
| Failed-image behaviour | Game does not crash; gameplay-critical object not hidden silently | `Art` emoji/procedural fallback |
| Long play sessions / repeated world changes | No memory growth or leaks | Cache bounded; no unbounded arrays |

**Cannot claim device performance without measurement.** Record actual environment and method used when measured on a real modest Android device (task 398 is LIMITED — real-device measurement outstanding). Headless verification: no runtime errors across all smoke tests; offline resilience 25/25; check_fast 10/10; check_release green.

---

## 2. Asset sizing guidance

- Glyph art: 512×512 WebP, hard cap 60 KB/file (DECISIONS.md task 360). Mean ~27.5 KB expected.
- Scene art (opaque backgrounds): sized to the largest supported viewport (1180×1180) with comfortable padding; not oversized; avoid giant textures.
- Hero sprites: unchanged (existing PNGs under `game/assets/images/explorer[_kitty]/`).
- No mipmaps/filtering/smoothing additions; preserve canvas crispness.

---

## 3. Fallback strategy (missing / failed assets)

Every `Art` call site already has an emoji/procedural fallback (`art.js`):
- `Art.url(glyph)` returns `null` when no registry stem → `Art.html`/`Art.fill` render the escaped glyph.
- `Art.draw(ctx, glyph, ...)` falls back to `ctx.fillText(glyph, ...)` when image not complete.
- `fillAttr` removes the `art` image and the `art-painted` class when no image, letting the CSS `::before{content:attr(data-e)}` emoji show.

Rules:
- Missing image never crashes the game loop.
- Never silently hide a gameplay-critical missing object — fallback renders a recognizable emoji/procedural shape.
- Dev-time `console.warn` for missing required assets.
- Optional decoration missing: silent safe fallback.
- Never fall back to an unrelated world's art.

---

## 4. Caching and memory

- `Art.image(glyph)` memoizes `HTMLImageElement` by URL — no per-frame Image creation.
- Cache keyed by URL persists across world transitions; no repeated reloads.
- Image objects cached, not recreated each frame.
- Scene backgrounds drawn from cached Image; not re-decoded per frame.
- Bounded cache; no unbounded arrays growing over a long session.

---

## 5. Rendering cost control

- Background layers drawn once per frame in stable order; parallax only on background layers.
- `ctx.translate(-cameraX, 0)` applied consistently; camera follow unchanged.
- No expensive filters, giant textures, or unnecessary canvas resizing.
- Particles bounded (`MAX_PARTICLES = 120`); alpha-decay removes expired particles.
- Motion calm and purposeful; not every decorative object animated.
- `drawDecor` / `drawCeiling` retained procedural (low cost).

---

## 6. Verification (headless, no real device)

- `node tools/check_fast.js` → 10/10 green after each task touching `game/` or docs.
- `node tools/kitty_smoke.js` → all pass (explorer.html) after each world integration.
- `node tools/check_release.js` → release gate green before release.
- Offline resilience: `tools/offline_smoke.mjs` → 25/25 games load/play/return.
- No runtime errors across all smoke tests.

Gate 2: performance + fallback strategy confirmed before Phase 3 Spring implementation. Real-device modest-Android measurement (task 398) remains LIMITED / outstanding.
