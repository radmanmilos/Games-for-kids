Little Racer 3D — Current Repository / Published-Build Review

Date: 2026-09-25
Repository: radmanmilos/Games-for-kids
Reviewed branch: main
Reviewed commit: f34602a9bddfef30c9a7bd19090be38827c0d9a3
Target: 2–4 year old toddler, landscape tablet first, offline PWA, no fail states, no AI rivals, YAGNI locked.

Review scope and limitation

The current GitHub source was inspected directly, including the current racing3d.mjs, racing3d-config.js, shared racing config, racing3d_smoke.js, play_matrix.mjs, headless.js, audio.js, speech.js, main.js, navigation.js, sw.js, and racing3d.html.

GitHub Pages deployment currently succeeds from the same commit (f34602a...). The live Pages URL could not be interactively operated from this environment, so this is a source/test/deployment review rather than a claim of physical-device sensory playtesting. Real iOS/Android audio, touch feel, speaker balance, GPU frame pacing, and Safari behavior still require device observation.

Executive conclusion

The previous polish plan has substantially landed. The current game has:

toddler-speed auto-forward driving;

dt-normalized steering/camera interpolation;

pointerId ownership, pointer capture, palm filtering;

visibility/audio handling;

reactive decor;

blob shadows;

boost flames/dust/trails;

pickup flash + rising chime;

lap/finish celebrations;

serialized audio bus + spoken Serbian hints;

WebGL context-loss UI/freeze;

offline-manifest hardening;

a 27-check racing3d smoke suite and a broader Playwright matrix.

The next gains are therefore second-order. Do not add more gameplay systems. Fix a few correctness and toddler-UX inconsistencies, then add stronger real-device/runtime coverage.

P0 / fix before more polish

1. Reduced-motion gating is incomplete

File: game/games/racing3d.mjs, update() camera/motion block around the low-2300s through mid-2500s.

REDUCED_MOTION currently gates:

reactive decor amplitude;

obstacle bounce;

finish/boost shake assignment.

But these remain active regardless of reduced motion:

continuous kart bounce/suspension bob;

camera position sway from steering;

camera roll via camera.rotateZ(steer \* 0.02);

FOV expansion from speed;

boost FOV kick;

rumble-strip camera shake (rumbleShake = 1).

The important lines are the bounce calculation, the camTarget steer offset, camera.rotateZ(...), targetFov = 60 + ..., and rumbleShake = 1.

Action:

Keep the normal-mode motion feel as-is unless device testing proves otherwise.

Under reduced motion, replace those effects with a low-motion variant: mostly fixed camera, no roll, no FOV kick, minimal/no bob, no rumble camera shake.

Keep non-motion feedback: SFX, UI state, pickup flash, world reaction via color/emissive/small static sparkle.

Acceptance:

Force prefers-reduced-motion: reduce in a browser test.

Assert or inspect that camera FOV, camera roll, rumble shake and base bob stay within a near-zero/reduced range while driving/boosting.

Normal mode must preserve the current feel.

2. Input reset is not centralized enough

File: game/games/racing3d.mjs, showStartPicker(), onHide(), onShow(), context-loss handler, input block around the 2600s.

The game has pointer ownership/capture and per-zone release, which is good, but neither onHide() nor showStartPicker() explicitly clears:

keys.left/right;

zonePointer.left/right.

This creates a remaining toddler edge case: a child can hold a steering zone with one finger and use another finger to open the world picker or trigger an OS/background interruption. The logical steering state can survive longer than intended.

Action:

Create one resetInput() helper.

Call it on: pointercancel, blur, visibilitychange to hidden, context loss, finish, and before opening the picker/modal.

Clear recentPress as appropriate when entering non-drive modes.

Preserve the locked simultaneous-left/right policy: most-recent press wins while actually driving.

Acceptance:

Synthetic test: hold left → open picker → close/start → verify neutral steering.

hold right → hide → show → verify neutral steering.

pointercancel/lostpointercapture → verify neutral steering.

3. Audio bus serialization is too slow for short musical cues

File: game/games/racing3d.mjs, audio bus around the 1700–1810 range.

drainAudio(now) deliberately waits 40 ms between queue items. That means the queue is not really “one item per frame”; it is at most one item per ~40 ms (~25 items/sec).

This is a problem for short phrases composed from multiple queue items:

pickup queues two tones that are intentionally a close pair;

obstacle warning queues speech + G4 + E4 as separate events;

boost queues whoosh + speech separately.

At runtime, the intended motif can become temporally stretched rather than sounding like one event.

Action:

Keep one global arbitration layer, but make compound musical events atomic.

Add e.g. qMotif([...]) or a single k:'motif' queue item that schedules several tones against one AudioContext.currentTime anchor.

Keep speech as a separate optional event; it must never delay the authoritative SFX.

Critical child-action cues (pickup, boost, finish) should not sit behind a speech event.

Acceptance:

pickup: two notes remain perceptually one immediate phrase.

obstacle: “Пази!” may lag, but the two-note warning motif remains tight.

boost: whoosh starts immediately, speech may follow.

Keep queue instrumentation.

4. Particle spin is implemented in callers but lost in spawnP

File: game/games/racing3d.mjs, spawnP() and updateParticles() around 1460–1530.

Callers pass spin (petalBurst, celebrateBurst, confettiBurst, weather, rearTrail), and updateParticles() checks if (p.spin), but the particle object built in spawnP() does not copy o.spin into spin.

Result: dynamic particle spinning currently does not occur even though the feature is present in code/comments/tests.

Action:

Store spin: o.spin || 0 in the particle record.

Add a deterministic smoke assertion that a spinning test particle changes rotation.x/z across virtual steps.

Acceptance:

Confetti, pickup petals, boost trail and weather actually rotate.

No change to particle lifetime/cap behavior.

5. MAX_PARTICLES cap has an off-by-one

File: game/games/racing3d.mjs, spawnP().

Current guard is effectively if (particles.length > MAX_PARTICLES) return;, which allows one particle when length === MAX_PARTICLES, temporarily reaching 421 for a cap of 420.

Action:

Change the admission test to >= MAX_PARTICLES.

Keep the celebration headroom logic.

Acceptance:

Stress test with a synthetic emitter: particles() <= MAX_PARTICLES at all times.

P0/P1 mechanical correctness: reconcile the acceleration constant

File: game/games/racing3d.mjs, constants block + update() speed calculation.

There is an ACCEL = 16 constant near the top, but the current speed update does not use it. The actual acceleration comes from the exponential response factor 2.2 in:

speed + (target - speed) _ (1 - Math.exp(-2.2 _ dt))

Therefore the code does not literally implement 16 world-units/s² acceleration.

Do not change MAX_SPEED = 35 and do not re-litigate the locked toddler speed.

Action:

Decide explicitly which semantic is intended:

real physical-ish acceleration of 16 units/s², or

the currently tuned exponential response.

Prefer keeping the tuned feel while renaming/documenting the response coefficient, or map ACCEL to the actual response model.

Measure and record real 0→35 time on a 60 Hz device.

Reason this matters: a future AI/code pass may “fix” ACCEL=16 by accident and materially change the toddler feel.

Acceptance:

One documented speed-response target.

Smoke checks still pass.

Manual tablet comparison confirms no unintended launch/jump in feel.

P1 UI bug: small landscape controls can be covered by steering zones

File: game/pages/racing3d.html CSS.

#r3d-zone-\* starts at top: 26vmin with z-index 11.

.r3d-corner (world + music buttons) is top: 118px with z-index 10.

On short landscape viewports such as the existing phone-landscape matrix cell (844×390), 26vmin is about 101 px. Therefore the steering zones begin before the corner controls and can sit above them in stacking order.

Action:

Raise .r3d-corner above the steering zones, e.g. z-index 20, or otherwise carve out the control area.

Check map/title layering at the same time.

Acceptance:

On 844×390, world button and music button both receive pointer events.

Left/right steering remains available below them.

P1 test-coverage gaps

6. play_matrix.mjs does not include racing3d by default

File: tools/play_matrix.mjs, DEFAULT_PAGES.

The current default list includes index/tracing/coloring/piano/racing but not /pages/racing3d.html.

Action:

Add /pages/racing3d.html to the default matrix.

Acceptance:

Default matrix reports racing3d for Chromium + WebKit across the existing viewport set.

7. The current matrix is a layout/boot matrix, not a real racing runtime matrix

play_matrix.mjs checks:

page errors;

console errors;

horizontal overflow;

touch-point reporting.

It does not drive the race.

Add a small racing-specific Playwright scenario:

boot page;

verify picker;

start race;

wait through countdown;

send real pointer events to left/right zones;

release/cancel/blur;

trigger boost;

trigger an obstacle/pickup through existing test hooks;

verify finish modal path if practical;

capture screenshots at checkpoints.

Do not replace the existing smoke test.

8. Add performance instrumentation before doing more optimization

Current smoke exposes triangle count but not draw calls or real frame time.

Because each particle is a separate Mesh with a separate material, burst moments can create a high draw-call count even when triangle count stays low.

Add dev/test-only hooks such as:

renderer.info.render.calls;

renderer.info.render.triangles;

rolling average frame time;

worst frame time over a short window;

current DPR.

Use them to compare:

60 Hz tablet-like viewport;

120 Hz device-like viewport;

DPR 1 vs DPR 2;

normal drive vs boost/confetti burst.

Do not optimize blindly. First measure.

P1 audio/speech product issue

File: game/shared/speech.js.

Пази! and Буст! are not entries in the local speechFiles map, so racing3d's spoken hints currently fall through to browser SpeechSynthesis.

That means the racing speech voice/latency is device/OS dependent.

This is acceptable as an optional enhancement, but it should not be treated as deterministic audio content.

Action:

Keep spoken hints optional and non-authoritative.

Prefer beep/SFX for timing-critical cues.

Instrument whether Serbian speech synthesis exists and whether it is actually speaking before treating a hint as delivered.

Do not make gameplay wait for speech.

If later product testing shows the OS TTS quality varies too much, consider two tiny local Serbian speech assets for just these racing cues; do not build a narration system.

P1 performance hygiene: particle material churn

spawnP() creates a new MeshBasicMaterial for every particle and disposes it on expiry.

For a mobile GPU, the bigger risk is material/draw-call/GC churn during:

finish confetti;

repeated boosts;

snow/star weather;

repeated pickup bursts.

Do not immediately rewrite this.

First measure calls/frame and frame-time spikes. If spikes are observed, the cheapest next optimization is pooling/shared materials by particle class, not a new particle library.

P2 toddler UX polish

9. “Поени” framing is unnecessary

The HUD uses Поени: 0 and the win modal reports Поени:.

There is no competitive scoring system, and the product decision is intentionally “no scoreboard pressure”. For a 2–4-year-old, a neutral label such as Сакупљено or simply the collectible 0/12 is semantically cleaner.

This is a label change, not a new system.

10. The minimap should not receive more design investment yet

The minimap is technically polished, but it is advanced information for the target age and occupies valuable upper-screen space.

Keep it for now, but do not expand it. During real toddler testing, observe whether the child ever looks at it. If not, later reduce its visual weight rather than adding features.

11. Emoji-generated canvas sprites are cross-device dependent

Decor textures are rasterized from system emoji fonts. Android/iOS can render the same emoji with noticeably different shape, color and proportions.

This is acceptable for flavor props, but the largest/highest-frequency hero props should be checked on real iOS + Android hardware.

If visual consistency is poor, replace only the few important hero glyphs with simple procedural canvas art; do not replace all emoji content.

12. Context-loss message is visibly unfinished

Current loss text is Графика се привремено….

Use a complete child-facing Serbian message, e.g. Графика се привремено поново учитава….

This is small, but worth fixing because a platform error state should look intentional.

What NOT to do

Do not add:

AI rivals;

difficulty settings;

currency/loot/unlocks;

complex physics/raycasting;

a joystick;

more worlds just for count;

a narration framework;

a large particle engine;

more menus;

more camera shake;

a separate racing progression system.

The current architecture is already the right level of complexity for the product.

Recommended order for the next implementation round

Reduced-motion gate audit.

Central resetInput() and invoke it on hide/modal/context-loss/finish/cancel.

Fix particle spin storage.

Fix particle cap off-by-one.

Fix audio compound-event scheduling.

Reconcile/document ACCEL vs actual exponential response.

Fix short-landscape corner-control z-index.

Add racing3d to play_matrix default.

Add racing runtime Playwright scenario + screenshots.

Add calls/frame-time/DPR instrumentation and measure burst performance.

Validate racing speech fallback behavior.

Rename Поени to a neutral collectible label if real toddler testing agrees.

Acceptance contract for every batch

After every change:

node --check on changed JS.

node tools/racing3d_smoke.js — preserve the current 27/27 baseline unless intentionally adding checks.

node tools/hub_smoke.js.

node tools/play_matrix.mjs after the matrix changes.

bash tools/sync-docs.sh.

pwsh -NoProfile -File tools/build_offline.ps1.

Verify game/offline-manifest.json is non-empty and complete.

Run a real-device pass on at least one iOS/iPadOS device and one Android tablet for touch, reduced motion, speaker/audio, visibility return, and visual comfort.

Bottom line

The project is now in a good “polish the behavior, not the feature list” phase.

The most important discoveries in the current code are not missing wow features; they are:

reduced-motion does not currently gate all camera/motion effects;

input state is not reset centrally during every interruption/modal transition;

the audio queue can stretch compound cues;

particle spin is accidentally disabled by spawnP() omission;

the acceleration constant is stale/misleading;

the short-landscape control layering is likely to block world/music buttons;

the new Playwright matrix currently omits racing3d and does not exercise runtime feel;

real performance evidence needs draw-call/frame-time instrumentation.

Fix those before spending more effort on visual content. Once they are clean, the next meaningful step is a real-device toddler playtest round with screen/audio recordings, because source inspection cannot substitute for the perception of a 2–4-year-old using a physical tablet.
