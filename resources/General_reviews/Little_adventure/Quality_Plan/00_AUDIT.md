# 00 — Audit of the implemented game (AU)

Method: fresh clone of `main` @ `d3d72a7`, read `STATUS.md`, `PROGRESS.md`, the five game files (1 874 lines), the page, config, smokes, and grepped for every promised feature. **Verified = read in code. Not seen on screen.**

## AU §1 Claimed vs found

| Original card says | Found in code |
| --- | --- |
| IS-13 "sword/shield anim, particles, **sounds**, **squash**" | **No sound code at all** in `little_adventure.mjs` (no `tone/sweep/audioBuses`), **no mute button** (`#i3d-sound-btn` absent), **no squash**. Shield pose line is a no-op: `shield.rotation.x = s.hero.shield ? 0 : 0` (l.492). Sword swing only rotates `armR` (l.482–486). |
| IS-18 "W1…W14, full battery" | `tools/little_adventure_smoke.js` has **7 checks**; the WebGL battery is a single `skip(...)` stub (l.81–84). Nothing verifies the renderer. |
| IS-18 "screenshots" | **No** `little_adventure` screenshots exist in `resources/General_reviews/Screenshot_Review/`; `tools/visual-states.json` entry is only `{"INIT":"true"}` (load). |
| IS-12 "actors rendered" | Present but static: grumpies only move/recolour (l.541–554); owl, statue, lighthouse have no animation code. |
| IS-16 "context-loss" | `webglcontextrestored` only un-pauses (l.683–688). Three.js re-uploads on restore, so probably fine — **unverified**. |

Logic is in good shape: 65 Node checks incl. a playthrough bot (`tools/little_adventure_logic_smoke.js`). Speech, save/continue, adaptive DPR, perf overlay, gallery mode and reduced-motion handling exist.

## AU §2 Defects and weaknesses (ordered by what a child/parent would notice)

| # | Finding (file:line) | Why it matters | Card |
| --- | --- | --- | --- |
| A1 | **Ground and water are two `PlaneGeometry(128,128)` centred on the origin** (l.54, 82) ⇒ cover z ∈ [−64, 64], but the Shrine zone, bridge and lighthouse sit at z −62…−78 (`config` l.14, 28–31, 70–71). The last zone is at/over the edge: darkened by the edge fade (l.71–74) and the lighthouse/bridge very likely **float over sky-coloured void**. Needs a look on screen. | Game finale looks broken | Q-01 |
| A2 | **Silent game**: no SFX, no ambient, no music. | Biggest "unprofessional" signal | Q-16 |
| A3 | **Hero has no walk/idle animation, no legs**, static cylinder arms, body painted skin-colour (`P.peach`, models l.25) instead of the cream tunic in the spec; `heroMesh` only moves/rotates (l.536–539). | Main character feels like a sliding toy | Q-10, Q-11 |
| A4 | **Flat island**: a dark-fading square, no shoreline, no height, no path, no water motion; sky is a flat colour (l.37–38); lights are one hemisphere + one directional, **no tone mapping, no shadows other than flat discs** (l.44–50, models l.237–242). | Reads as a prototype | Q-03…Q-08 |
| A5 | **Particles are square GL points** (`PointsMaterial`, l.99) with no texture. | Looks cheap in every effect | Q-14 |
| A6 | **UI uses system emoji** for the sword/shield/play/new buttons (`html` l.64–65, 70–71) and a flat purple start overlay; joystick is two translucent circles. Emoji render differently on every Android build. | Inconsistent, not designed | Q-17 |
| A7 | Characters are bare primitives: grumpy eyes are black spheres, eyebrows boxes; owl wings are boxes; gate/chest/key are minimal; every mesh builds **its own material** (`mat()` called per mesh, models l.5–7 and instanced materials l.213–227) instead of sharing. | No charm, wasted draw state | Q-04, Q-10…Q-13 |
| A8 | Beacon is a flat translucent cylinder; arrow is a flat cone (l.106–109). | Guidance looks debug-like | Q-20 |
| A9 | Cosmetic repo issues: `project/games/little_adventure.md` ends with a stray `EOF` line; globals are `window.startlittle_adventure`/`little_adventureLogic` (find-and-replace artefacts, **keep them**, just document correctly). | Doc quality | Q-00 |
| A10 | Performance on a real modest tablet has **never been measured** (the card records "budgets met" without a device). | Unknown | Q-18 |

## AU §3 Not verified by the author

Anything visual; frame rate; WebGL behaviour; whether the local AI's host has WebGL (Q-00 finds out); how a child reacts; whether `y = 0` everywhere hides other overlaps; exact camera framing near zone edges.
