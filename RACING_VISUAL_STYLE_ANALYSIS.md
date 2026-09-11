# Racing Visual Style — Analysis & 2D/3D Decision

Status: ANALYSIS COMPLETE (2026-09-11). Decision pending: tiny 3D prototype first, then Option A (2D faux-3D polish), then re-evaluate full 3D.
Scope: **Мала тркачица (Little Racer)** only. All existing games untouched.
Related: `RACING_GAME_PLAN.md`, `game/games/racing.js`, `game/games/racing-config.js`.

Purpose: the user finds the current game "flat and boring" and wants a Mario Kart / Crash Nitro Kart feel. This document captures the investigation, the two options, the reference-game traits, and the staged recommendation so the decision does not have to be re-litigated.

---

## 1. Why the current game reads as flat

The engine (`racing.js`) is a classic **OutRun pseudo-3D**: the road is a stack of ~30 flat trapezoids, `y` is strictly linear with distance (`racing.js:596`), and everything on the road — car, pickups, obstacles, decor — is an **emoji `fillText`** (`racing.js:714, 854, 879`). The car is canvas primitives + a pasted character sprite (`racing.js:493`). What is missing:

- **No elevation** — the road is mathematically flat; no hills, jumps, dips, bridge crests.
- **No camera** — car is pinned bottom-center; no follow lag, sway, banking, pitch, or FOV pulse.
- **No depth cueing** — no fog, no distance fade, no ground shadows; far objects are as saturated as near.
- **No road texture** — flat fill + one dashed line; no perspective grid, rumble strips, surface detail.
- **No lighting** — flat colors; no sun, ambient occlusion, or bloom.
- **No motion FX** — no wheel dust, skid marks, boost flames, speed lines, exhaust.
- **No other racers** — empty road. Being *in a pack* is core to the Mario Kart/CNK feeling.

## 2. What makes Mario Kart / Crash Nitro Kart feel like them

Sources: Nintendo "Ask the Developer Vol. 18 — Mario Kart World" (2025); TheGamer / Nintendo Wire / ScreenRant on the MK World art-style overhaul; `mgarcia.org` visual-development article for Crash Nitro Kart; Computer Graphics World "Crash Course"; Crash Nitro Kart art references.

| Trait | Mario Kart World | Crash Nitro Kart |
|---|---|---|
| Art direction | Bright primaries, exaggerated proportions, **cute cartoon redesign**; expressive characters | **Bold, deeply saturated, storybook**; angular, top-heavy, asymmetrical geometry |
| Depth | Landmarks readable from far; layered lighting shifts palette by time/place | "Lush and richly textured"; rim-lit cartoon shading |
| Camera | Dynamic, bouncy, follows vehicle suspension | Third-person kart cam, gravity mechanics |
| Motion | Chassis/suspension reacts to terrain; waves; jumps; drifts | Drift + boost core mechanic |
| Cast | 24+ racers, animated selection-screen personalities | 16 racers, personality-driven animation |
| World | Connected biomes, real transitions | 13 worlds, surreal re-imagined scenery |

**Key insight:** the "feel" is driven far more by **camera behaviour, elevation, being in a pack, drift/boost, particles, and rich saturated lighting** than by raw polygon count. Some of those are achievable in 2D; some are not.

## 3. Asset audit (what we actually have)

- **Zero 3D assets.** No `.glb/.gltf/.obj/.fbx`, no `three.js`, no `game/assets/images/racing/` folder.
- Drivers = 2D sprites (`explorer_kitty/`, `explorer/`, 6 frames each).
- Everything else in the race is **emoji + canvas shapes**.
- No runtime dependencies; fully offline via `game/` + service worker (`game/sw.js`, `sw-cache-list.json`).

This is the biggest cost factor for a 3D switch: 3D karts, drivers, and tracks **do not exist** and would have to be authored or built procedurally in code.

## 4. Option A — Upgrade the existing 2D engine ("faux-3D juice")

Keep Canvas 2D; no new deps; no risk to other games. Highest-leverage wins, in rough order:

1. **Hills/elevation** — per-segment height function; shift road + objects. The OutRun "hills" technique; biggest 3D-feel win per line of code.
2. **Textured road** — alternating light/dark bands, rumble strips, edge lines, perspective grid.
3. **Depth fog + ground shadows** — fade distant objects to horizon; ellipse shadows under props/car.
4. **Camera** — car banking on turns, subtle sway/lag, FOV/scale pulse with speed, speed lines + vignette at high speed.
5. **Particles** — wheel dust, skid marks, boost flames, exhaust.
6. **Other racers** — 3–4 sprite karts to overtake, with a position indicator (e.g. "3.", 5 racers).
7. **Track features** — ramps/jumps (via hills), tunnels, boost pads, splits.
8. **Better car rendering** — perspective-shaded 3/4 rear view, suspension bob, rolling wheels, cast shadow.

- **Effort:** moderate, incremental, low regression risk, stays offline/no-deps.
- **Ceiling:** ~50–60% of the target feel. Cannot deliver true camera rotation, tracks that genuinely turn in 3D space, real 3D jumps, dynamic lighting, or other karts viewed at arbitrary angles.

## 5. Option B — Switch to full 3D (WebGL)

Two sub-options:

- **B1 — three.js** (single local `three.min.js`, MIT, offline; no CDN). Faster to build; adds a ~600 KB dependency → needs explicit user approval per project rules.
- **B2 — hand-rolled minimal WebGL** (no dependency). Matches the project's vanilla/offline ethos; proven viable (e.g. XRRC batching to ~74 draw calls / ~16k tris; Trapnest Turbo generates a whole track in ~3 procedural draw calls). More code, zero deps, full control.

What full 3D requires:

- **Math/renderer:** mat4/vec3, perspective camera, track ribbon mesh from a spline (banking + elevation), simple directional/ambient lighting or vertex colors.
- **Physics:** kart along spline + lateral offset, drift/boost, racer + obstacle collision (arcade model).
- **Assets (the blocker):** low-poly karts/drivers/props. Cheapest path is **procedural geometry + billboard sprites** (reuse existing character PNGs as camera-facing sprites), avoiding external modelling.
- **Camera:** chase cam with lag, look-ahead, pitch — this alone sells the 3D feel.
- **Performance:** feasible, but cap DPR, avoid realtime shadows on low-end, use instancing. Older Android WebView can fail to create a WebGL context (known three.js issue) → a 2D fallback path is required.
- **Offline:** bundle the renderer locally; regenerate `sw-cache-list.json`; no remote assets.
- **Migration:** effectively a **rewrite of the renderer + physics + config**. Reusable: HUD, pickers, audio/music engine, countdown, save/progression, a11y, and `racing_smoke.js` (headless Chrome does render WebGL).
- **Effort:** large (art + engine + perf validation on the real tablet). **Risk:** high.

## 6. Recommendation (staged)

**Honest answer:** true Mario Kart/CNK feel requires real 3D — but do not choose blind. Two-track approach:

1. **Tiny 3D prototype first (throwaway, in `resources/`):** one kart, one curved + hilly track, chase camera, on the real target tablet. Measure FPS and "does it feel 3D?". This tells us whether to go full 3D before investing.
2. **Then Option A** (staged, low-risk): hills, textured road, fog, camera banking/sway/FOV, shadows, particles, other racers, boost. Most of the perceptual gain, cheap, keeps the game shippable/offline.
3. **Re-evaluate full 3D (Option B)** after the prototype: if it runs well and feels right → migrate. If not → the polished 2D engine is the safer, still-great answer for a 2–6 year old.

## 7. Prototype decision (user, 2026-09-11)

- User definitely wants **Option A**, but wants to **see the tiny 3D prototype first** — "maybe the prototype will be so good that we straight away go into full 3D".
- Open choice for the prototype: **B1 (three.js, needs approval)** vs **B2 (hand-rolled WebGL, no deps)**; and prototype location under `resources/` (experimental, never deployed).

## References

- Nintendo, "Ask the Developer Vol. 18, Mario Kart World – Chapter 3" — https://www.nintendo.com/au/news-and-articles/ask-the-developer-vol-18-mario-kart-world-chapter-3/
- "Mario Kart World Character Designs Compared To Their Classic Looks", TheGamer — https://www.thegamer.com/mario-kart-world-character-design-differences-comparison/
- "What the new Mario Kart designs for the Switch 2 mean for the future of the series", Nintendo Wire — https://nintendowire.com/features/what-the-new-mario-kart-designs-for-the-switch-2-mean-for-the-future-of-the-series/
- "Visual Development for Crash Nitro Kart", mgarcia.org — http://mgarcia.org/2018/02/22/visual-development-for-crash-nitro-kart/
- "Crash Course", Computer Graphics World — https://www.cgw.com/Publications/CGW/2004/Volume-27-Issue-4-April-2004-/Crash-Course.aspx
- Crash Nitro Kart, Wikipedia — https://en.wikipedia.org/wiki/Crash_Nitro_Kart
- Trapnest Turbo 60fps WebGL engine write-up — https://henrywithu.com/speed-shaders-and-silence-building-a-60fps-webgl-arcade-engine-and-the-launch-of-trapnest-turbo/
- XRRC (Three.js RC racer, perf notes) — https://github.com/mrhegemon/XRRC
- jakesgordon/javascript-racer (OutRun pseudo-3D reference) — https://github.com/jakesgordon/javascript-racer/
