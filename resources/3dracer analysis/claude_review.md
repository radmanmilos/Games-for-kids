# Little Racer 3D — Prioritized Review for a 2–4 Year Old Player

> Based on `RACER3D_ANALYSIS.md` (the project brief) — the actual source files
> (`racing3d.mjs`, `racing3d-config.js`, `racing-config.js`, `tools/racing3d_smoke.js`,
> `resources/RACING_VISUAL_STYLE_ANALYSIS.md`) were not available to read directly, since
> they live on the local repo at `E:\GitHub\Games for kids` and were not uploaded. Everything
> below is grounded in what the brief specifies (formulas, line numbers, function names it
> cites), but any claim about the *exact* current code behavior should be verified against the
> real line before acting on it — flagged inline where it matters most.

---

## 1. Look & feel — cheapest "wow" upgrades, no new deps

Given what's already built (glossy-plastic cartoon shading, instanced particles, decor
billboards, gradient sky dome), the three cheapest high-leverage moves:

1. **Reactive decor.** When the kart's `progress` passes near a decor billboard's track
   position, trigger a one-shot sine scale-pop (1.0 → 1.15 → 1.0 over ~300ms) on that
   billboard. The billboard system and the progress/position data (`__r3d` exposes progress)
   already exist; this is a proximity check + a tween on an existing mesh — zero new geometry,
   zero new particles. This is exactly the "world reacts to the kart" aspiration in §9.1, and
   it's the single cheapest win because nothing new is drawn — you're just animating what's
   already on screen.
2. **Boost trail via the existing particle emitter.** During the 1.2s boost window, recolor and
   intensify the emitter already used for offroad dust (additive blending, brighter/warmer hue,
   slightly higher emission rate). No new system, just parameter swaps keyed on boost state.
3. **Camera FOV kick on boost.** Widen FOV by ~3–5° while boosted, ease back on end. This is one
   uniform change on the existing camera, reads as "speed" without needing motion blur or
   screen shake, and it's cheap enough to gate behind `REDUCED_MOTION` if it's judged to count
   as a motion extreme. Leaning toward *not* gating it — it's a lens effect, not a shake/bounce —
   but that's a judgment call worth deciding explicitly rather than defaulting.

All three are parameter/animation changes on existing meshes and emitters — no raycasting, no
new draw calls, no new deps. Deliberately *not* recommending rim-light-per-speed shaders or new
emissive materials as a "cheap" win — that's shader-uniform and potential compile-time work,
a step up in cost for a smaller perceptual gain than #1.

---

## 2. Feel/mechanics

### Is MAX_SPEED=35 / ACCEL=16 / front-wheel-led immediate-stop steering optimal for 2–4?

Given it's the product of five playtest rounds (starting at 132, ending at 35) and the specific
fifth-round fix ("killed a residual side-drag"), this is well-earned tuning, not a guess — the
numbers themselves shouldn't be touched. The design logic is sound for the age band: immediate
stop-on-release + no auto-centering is the right call because toddlers reason in
direct-manipulation terms ("I touched here, kart is there") rather than physics terms
("released force, expect momentum/decay"). Auto-centering would fight that intuition.

### Frame-timing risk — the one thing to actually check in the code first

The brief describes `lateral += steerDrive · LATERAL_GAIN · dt`, which is correctly dt-scaled —
that part is frame-rate independent by construction. The risk is in how `steerDrive` **decays**
on release. The brief only says it "decays fast on release," not the formula. Two
implementations look identical on a 60Hz tablet but diverge badly at 90–120Hz (many current
Android tablets and all recent iPads):

- `steerDrive *= 0.85` **per frame** → frame-rate dependent: at 120Hz you get twice as many
  multiplications per second as at 60Hz, so the kart snaps straight roughly twice as fast in
  wall-clock time on a high-refresh device. This would make the "settles exactly where you left
  it" feel change per-device — worse (abrupt/twitchy) on fast tablets, comparatively floaty on
  60Hz ones.
- `steerDrive *= pow(0.85, dt*60)` (or an exponential-decay-in-time form) → frame-rate
  independent, feels identical everywhere.

Same question applies to the cosmetic front-wheel self-center unwind — lower stakes since it's
purely visual, but worth the same audit for consistency.

**Concrete check:** grep for the decay line near the lateral/steerDrive block and confirm it has
a `dt` term in the exponent/multiplier, not a bare per-frame constant. If it's the latter, this
is a one-line fix (`Math.pow(base, dt*60)` style) and cheap to smoke-test (see batch #1 below).

### A secondary feel idea, not a bug fix

Since palm-press/accidental taps are a named robustness concern, a very short minimum ramp on
`steerDrive` (~80–100ms before it reaches full drive) would also incidentally make
mashing/palm contact steadier without adding perceptible input lag for a deliberate hold. Small,
testable, doesn't touch any locked decision.

---

## 3. Audio

Structural ideas that stay inside "zero assets, all synth":

- **Boost = filter/harmony automation**, not new sounds. Open a lowpass cutoff or add a
  parallel higher-octave tone during boost using the existing synth graph. Parameter automation,
  no new nodes-worth of complexity.
- **Positive-streak layering.** Crossfade a short encouraging pattern after N consecutive
  pickups, using the existing chime generator — reinforces "flashy fun beats realism" without
  new assets.
- **StereoPannerNode on lateral position** for ambient/obstacle cues — cheap depth cue, low
  priority (toddlers on a tablet speaker without headphones likely won't notice, but costs
  almost nothing to add).

### Spoken Serbian hint instead of the beep — worth it, but with real caveats

- `window.speech` is already wired for the countdown, so the plumbing exists.
- Two risks specific to this: (1) TTS voice availability for Serbian is inconsistent across
  devices — older Android WebViews and some iOS Safari versions may have no Serbian voice
  installed, silently falling back to a mispronounced or wrong-language voice, which is worse
  than no hint at all for a toddler-education product; (2) if it fires per-obstacle-hit like the
  current beep, spoken language competes with the ambient/celebration audio and risks feeling
  naggy rather than gentle.
- **Recommendation:** keep the beep as the reliable, universal cue, and add speech as a rare
  *supplement* (first obstacle of the race, or first time ever, not every hit), with a runtime
  check that falls back silently (no hint, no error) if no Serbian voice is available. Don't let
  the hint become the only signal — the beep should never be removed in favor of it.

---

## 4. Robustness

- **Multi-touch/palm-press.** If steering reads off a single tracked touch (e.g.,
  `touches[0]`), a stray palm touch landing first will hijack input. Safer pattern: hit-test
  *every* active touch against each button's bounding box independently, ignore touches that
  start outside a button's box entirely (so the background is a safe no-op zone), rather than
  trusting touch-array ordering. This directly serves the stated goal of "child never gets stuck
  / buttons unmissable."
- **Paused window / backgrounding.** The `dt` clamp at 0.05s guards runaway physics on resume,
  which is good. What it doesn't obviously cover is the *first* `Clock.getDelta()` call after a
  long background period returning a large stale value before the clamp logic even runs — worth
  explicitly discarding one delta on `visibilitychange` (call `getDelta()` once and throw it
  away) rather than relying solely on the downstream clamp. Also worth explicitly suspending the
  `AudioContext` on hide/resume, both for battery and to avoid a synth drone continuing under a
  backgrounded tab on some browsers.
- **iOS Safari WebGL context loss.** Not mentioned as handled anywhere in the brief, and this is
  a real, common failure mode on memory-constrained iPads with a persistent three.js canvas.
  Without `webglcontextlost`/`webglcontextrestored` listeners, the failure mode is a frozen
  frame with no way out — which directly violates the "child should never get stuck in
  something they don't understand" goal. Worth an explicit gap flag: pause the loop on loss, and
  on restore, either re-init the renderer or fall back to the existing reload-via-picker path.
- **iOS audio unlock.** The current pattern (unlock inside the «Крени!» click handler) is the
  right shape. The thing to verify explicitly is that `AudioContext.resume()` (or first `ctx`
  creation) happens *synchronously* inside that click handler with no `await`/`setTimeout` in
  between — iOS Safari requires the resume call to be in the same event tick as the user
  gesture, and this specific gotcha doesn't show up in headless Chrome smoke tests at all, so it
  can silently regress without any test catching it.
- **Offline SW edge cases.** The stuck-download self-heal is already improved per the brief, and
  the Android stuck-file scenario is flagged as untested — leave that as an explicitly tracked
  manual-QA item rather than trying to force it into headless smoke (simulating a genuinely
  interrupted download in headless Chrome is more effort than the bug class probably warrants
  right now).

---

## 5. Next 10 micro-batches (ordered, YAGNI-safe, smoke-testable)

1. **Audit + fix frame-rate-dependent decay** (steerDrive release decay, wheel self-center
   unwind) — convert any bare per-frame multiplier to a dt-scaled exponential form.
   *Test:* extend the smoke harness to step the sim at simulated `dt=1/60` vs `dt=1/120` for a
   fixed hold-then-release sequence and assert lateral displacement converges within a small
   tolerance.
   *Doc:* one line in `racing3d.mjs`'s comment block near the lateral integration, plus a dated
   note in `PROJECT_TASKS.md`.

2. **Minimum steer-drive ramp (~80–100ms)** to reduce palm-mash jitter.
   *Test:* existing "no side-drift" smoke check should still pass; add a short-tap-duration
   case.
   *Doc:* note in the decision log if this is judged to interact with decision #5 (front-wheel
   steering) — it doesn't change the mechanic, just smooths input, so shouldn't need
   re-litigating.

3. **Hit-test-based multitouch handling** for the two steer buttons (ignore touches outside
   button boxes).
   *Test:* simulate two/three simultaneous synthetic touch events in the headless harness,
   assert steering follows the button-owning touch, not touch-array order.

4. **Decor proximity bounce** (wow #1 above).
   *Test:* assert via `__r3d` that a decor mesh's scale changes when kart progress crosses its
   track position, and returns to baseline after.

5. **Boost particle recolor/intensity** (wow #2).
   *Test:* assert particle emitter color/rate properties differ between boosted and
   non-boosted `__r3d` snapshots.

6. **Camera FOV kick on boost** (wow #3).
   *Test:* assert `camera.fov` changes during boost and returns after; explicitly decide and
   record whether this is gated by `REDUCED_MOTION`.

7. **Explicit visibilitychange handling** — discard first post-resume delta, suspend/resume
   AudioContext.
   *Test:* hard to fully headless-test tab backgrounding reliably — write a manual
   test-checklist entry rather than forcing a brittle smoke assertion; if the harness can
   simulate `document.hidden` toggling cheaply, add a minimal check for AudioContext state only.

8. **WebGL context-loss/restore handling** with the existing reload-via-picker path as the
   recovery mechanism.
   *Test:* genuinely hard to trigger headlessly (SwiftShader doesn't reproduce this failure
   mode) — this is a manual-iPad-QA item, documented as such rather than smoke-covered.

9. **iOS audio-unlock synchronicity audit** — confirm no `await`/timer sits between the click
   handler and `AudioContext.resume()`.
   *Test:* not coverable by headless Chrome (autoplay gating differs); add to the manual-device
   regression checklist alongside #8.

10. **One-time spoken Serbian hint** (first obstacle only, silent fallback if no Serbian voice),
    beep retained regardless.
    *Test:* assert `speech.speak` call count ≤1 per race via `__r3d`/spy, and assert the beep
    still fires independent of speech success/failure.

### On measurement (§9.E)

Given the "no HUD pressure" and "flashy fun beats realism" ethos, avoid an on-screen FPS meter
or any visible instrumentation for the child entirely — keep any FPS/perf logging to a dev-only
console flag or the existing `__r3d` introspection object, never rendered in the toddler-facing
HUD. That's consistent with what's already in place (introspection exists for tests, not for the
player).

### What to defer or avoid outright

- A touch joystick — already deliberately rejected, and analog joysticks are a worse fit for
  toddler motor control than the current binary hold-buttons. Validate this decision stands;
  don't revisit it.
- Any shader/uniform-driven rim-light-per-speed effect — real cost, marginal wow versus #1–3
  above.
- StereoPannerNode work — correct but low priority given the target device is usually a
  tablet's built-in speaker.
