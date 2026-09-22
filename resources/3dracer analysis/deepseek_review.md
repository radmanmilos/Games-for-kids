# Little Racer 3D — Prioritized Review for Ages 2–4

**Scope note:** This review is based on `RACER3D_ANALYSIS.md` and the cited source anchors. I did not have the live source files in this session, so verify every line reference in `game/games/racing3d.mjs` before editing.

**Locked decisions respected:** no AI rivals, no fail states, no difficulty levels, no loot, `MAX_SPEED=35`, front-wheel-led steering with immediate stop-on-release, reduced-motion gate at `racing3d.mjs:3`, zero new runtime dependencies, offline-first PWA.

---

## Priority summary

- **P0 — frame-timing audit:** highest risk because 60 Hz tablets vs 120 Hz phones can change feel if any smoothing/decay is per-frame instead of dt-based.
- **P1 — touch/palm + visibility/audio robustness:** toddler proofing is more valuable than new art.
- **P1 — 3 cheap “wow” upgrades:** contact shadows, decor reactions, world-colored celebrations.
- **P2 — audio buses, minimal spoken hints, debug instrumentation.**
- **Defer/avoid:** real shadows, postprocessing, bloom, PBR, AI rivals, fail states, touch joystick, auto-centering, changing `MAX_SPEED`/`ACCEL`, long spoken hints.

---

## 1. Look & feel gaps — cheapest “wow” within the current pipeline

### A. Contact/blob shadows under kart, pickups, obstacles, boost pads

**Why it wins:** the game is raycast-less and uses flat/instanced/sprite art. A shared radial-gradient canvas texture used as a transparent `THREE.Sprite` or plane under every dynamic object makes the whole scene read as “grounded” instantly. It is cheap, offline, no new deps, and doesn’t touch physics.

**Code touch:** `racing3d.mjs` particle/material setup, near the existing `spawnP`/`updateParticles` area and pickup/obstacle creation. Reuse one texture for all shadows. For reduced motion, keep it static or fade only.

**Risk:** additive sprite overdraw on low-end tablets. Cap count: kart 1, pickups ~12, obstacles ~6–16, boost ~6. ~30 sprites is fine.

### B. Decor reaction system for the existing 16 emoji billboards

**Why it wins:** at `racing3d.mjs:487` there are already 16 camera-facing emoji `THREE.Sprite` billboards per world. Add a per-frame distance check from kart to each sprite: when within e.g. 8–14 units, pulse scale, tilt `rotation.z`, and bob `position.y`. Also wave the start-gate banner/pennants. The world appears to notice the child.

**Code touch:** decor billboard creation and update loop. No new draw calls; just per-frame transforms on existing sprites. Gate by `REDUCED_MOTION` for amplitude.

**Why it’s toddler-appropriate:** it is feedback without pressure. The child passes a tractor/owl/palm and it reacts — “one-screen joy” from §9.1.

### C. World-colored celebration bursts + pickup pitch combo

**Why it wins:** the particle system already supports petal bursts, boost flames, confetti, weather. Parameterize the burst color/emoji by world using `R3D_EXTRAS` decor lists. On pickup, spawn 8–12 world-colored emoji/petal sprites; on boost, short emissive trail; on win, world-colored confetti. Add a rising pickup pitch per consecutive pickup, reset on obstacle.

**Code touch:** `racing3d.mjs:820` pickups, particle spawn, audio SFX around `:1039–1220`. Keep confetti even under reduced motion, but suppress shake/bounce extremes.

**Tradeoff:** don’t turn pickups into score pressure. The pitch combo is audio-only sparkle; no HUD “combo meter”.

---

## 2. Feel/mechanics — is current tuning optimal for ages 2–4?

### Verdict: keep the locked values and steering model

`MAX_SPEED=35`, `ACCEL=16`, front-wheel-led steering, immediate stop-on-release, and no auto-centering are appropriate for 2–4 year olds. `ACCEL=16` reaches max in ~2.2 s, which gives a toddler time to see and react. The “kart settles exactly where you left it” behavior prevents accidental drift and matches their motor control. Do not re-litigate these.

### The real risk is frame-timing, not the tuning

The loop uses `THREE.Clock` and clamps `dt` to 0.05 s. That is good. But you must audit every smoothing/decay/accumulator for dt usage. High-refresh devices will change feel if any of these are per-frame constants:

- `steerDrive` rise/decay in the front-wheel steering model.
- Visible front-wheel cosmetic self-centering.
- Camera suspension bob, steer sway, FOV kick (`60→80`).
- Particle spawn rates: drift smoke, offroad dust, weather emitters.
- Ambient sound accumulators at `racing3d.mjs:1039–1220`.
- Obstacle-warning beep cooldown at 12–90 units ahead.
- `slowMult`/`slowTime` obstacle slowdown.

**Recommendation:** use `1 - Math.exp(-k * dt)` for exponential smoothing, and seconds-based cooldowns/accumulators. For music/ambient look-ahead, schedule from `ctx.currentTime`, not frame count.

**Interpolation risk:** `progress` along the `CatmullRomCurve3` and `lateral` movement must both integrate with `dt`. If `progress += speed * dt / trackLength`, high refresh is fine. If any value is “per frame”, 120 Hz will run twice as fast in real time.

**Paused-window:** the `dt` clamp prevents a huge jump after backgrounding, but you should still suspend audio and reset the clock on `visibilitychange`/`blur`. Otherwise the music scheduler may keep scheduling while hidden.

**Test idea:** add a test-only `__r3d.lastDt` or `__r3d.step(dt)` hook at `racing3d.mjs:1615` so the smoke can verify steering decay at simulated 60/120 Hz. Keep it invisible to kids.

---

## 3. Audio — zero-asset all-synth structural improvements

### Do first: gain buses and ducking

Right now the game uses `window.ctx/tone/sweep/successChime/gentleMiss` and a look-ahead music scheduler. Add four `GainNode` buses: `music`, `ambient`, `sfx`, `speech`. Duck music/ambient by ~6–10 dB when speech or win celebration plays. This is hand-rolled WebAudio, no assets, and immediately makes the mix feel less lo-fi.

### Do second: dt-normalize ambient rates

Per-world ambient was just added. If its bird/waves/wind/chime/owl snippets fire from a per-frame accumulator, 120 Hz devices will double the rate. Use seconds-based accumulators or schedule from `ctx.currentTime`.

### Spoken Serbian hint system: worth it, but minimal

A full hint system is not worth it yet. A minimal one is:

- 3–5 short lines max: «Крени!», «Браво!», «Пази!», maybe «Ухвати цвет».
- Only first-time per session, with 8–10 s cooldown.
- Fallback to the existing warning beep if `window.speech` has no Serbian voice.
- Never scold, never interrupt music for more than a short duck.

**Tradeoff:** speech synthesis depends on OS voices. Offline usually works, but some Android/iOS devices lack Serbian. Always have the beep as fallback. Avoid a hint for every obstacle; that becomes noise.

---

## 4. Robustness — toddler proofing and platform edge cases

### Multi-touch / palm-press

The two fixed steering zones are deliberate. Harden them:

- Set `touch-action: none` on the game canvas/HUD area.
- Track `touch.identifier` per zone; handle `touchcancel` and `touchend`.
- Ignore touches starting on HUD/modal controls.
- Decide both-zone behavior explicitly: for toddlers, “most recent touch wins” is usually less frustrating than “both cancel”.
- If `touch.radiusX` is available, ignore obviously huge palm touches in the steering zone. Many devices don’t report it, so don’t rely on it alone.

**Test:** extend `tools/racing3d_smoke.js` with CDP touch events: press left, press right, cancel, release. Assert `__r3d.steer` returns neutral and no stuck input.

### Paused-window / visibility

On `visibilitychange` or `blur`:

- Suspend `window.ctx`.
- Pause the music scheduler and ambient accumulators.
- Set `paused=true`, reset `THREE.Clock` on resume.
- Show a big tap-anywhere “Настави” overlay. Do not auto-resume mid-race into action.

**Why:** a toddler may hand the tablet to a parent; a hidden tab that keeps playing audio is worse than a simple resume overlay.

### iOS Safari WebGL context loss + audio unlock

- Add `webglcontextlost` listener on the canvas. Call `event.preventDefault()`. Show a simple overlay, then reload to the picker or same world. `loadSave()` already persists `wins/world/kart`; mid-race state is not saved, which is acceptable for this age group.
- On first user gesture (`«Крени!»`), call `ctx.resume()`. Also resume on `visibilitychange`/first touch if `ctx.state === 'suspended'` or `'interrupted'`.
- Speech synthesis may need a user gesture on some browsers; trigger the first spoken line from the same start gesture.

### Offline service worker edge cases

The doc says the “stuck download” self-heal was improved but the Android stuck-file scenario is manually untested. Next step: test with one intentionally missing file in the offline package. The service worker should skip-and-report rather than fail the whole install. Bump the cache version on every change. Keep `docs/` as the mechanical mirror.

---

## 5. Concrete “next 10” micro-batch plan

Each batch is small, validates with `node --check`, `node tools/racing3d_smoke.js` (expect 17/17), `node tools/hub_smoke.js` (ALL PASS), then `tools/sync-docs.sh` + `build_offline.ps1`. Document in `PROJECT_TASKS.md`, `README.md`, `HANDOVER_PROMPT.md`, `tools/README.md`.

| # | Batch | Code touch | How to test | Documentation |
|---|---|---|---|---|
| 1 | **dt normalization audit** | `racing3d.mjs`: steering decay, wheel self-center, camera/FOV, particles, ambient, warning cooldown | Add `__r3d.lastDt`/`step(dt)` hook; smoke 17/17; manual 60/120 Hz | Note all converted constants and rationale |
| 2 | **Touch/palm hardening** | `racing3d.html` CSS + `racing3d.mjs` input | Smoke: CDP touch press/cancel/release; assert neutral steer | Document both-zone behavior and `touchcancel` handling |
| 3 | **Visibility pause + audio suspend** | `racing3d.mjs`, maybe `shared/audio.js` | CDP `Page.setWebLifecycleState`; assert paused, no scheduling | Document resume overlay and clock reset |
| 4 | **WebGL context-loss fallback** | `racing3d.mjs`, `racing3d.html` | Smoke: use `WEBGL_lose_context`; assert overlay/no crash | Document iOS Safari manual test |
| 5 | **Contact shadows** | `racing3d.mjs` material/sprite setup | Smoke: `__r3d.tris()`/draw calls stay under threshold | Visual note; reduced-motion unaffected |
| 6 | **Decor reaction system** | `racing3d.mjs:487` billboards + update | Smoke: no errors, tris stable; manual video | Document per-world reaction radii |
| 7 | **World-colored celebrations + pickup pitch** | `racing3d.mjs:820`, `:1039–1220` | Smoke: pickup counter, particle cap; mock audio | Document no score pressure, audio-only combo |
| 8 | **Minimal spoken Serbian hints** | `racing3d.mjs`, `shared/speech.js` | Smoke: mock `window.speech`, assert cooldown/no spam | Document fallback beep and line list |
| 9 | **Audio buses + ducking** | `shared/audio.js`, `racing3d.mjs` | Smoke: no errors; manual audio mix | Document gain bus structure |
| 10 | **Debug FPS/play-test instrumentation** | `racing3d.mjs`, `tools/racing3d_smoke.js` | Smoke with `?debug=1`; assert no kid-facing UI change | Document how to read logs |

**After each batch:** keep the smoke harness’s proven world-switch path — click the picker cards + `«Крени!»`, not direct `Page.reload`, because the doc flags CDP execution-context staleness after a second navigation.

---

## What to defer or avoid for toddlers

- **Avoid:** real shadows, postprocessing, bloom, PBR, AI rivals, fail states, difficulty levels, loot/stickers/currency, touch joystick, auto-centering, changing `MAX_SPEED`/`ACCEL`, screen shake outside the reduced-motion gate, long spoken hints, complex pause menus, vibration API.
- **Defer:** full spoken hint system, per-world engine-feel particles beyond the celebration/shadow batches, any mid-race save state, any new dependency.
- **Keep:** the locked decision rhythm — propose, approve, build small, smoke, tablet play-test, document, manual commit.

---

## Verification contract for every future change

1. Edit only `game/…` files.
2. `node --check` the changed JS.
3. `node tools/racing3d_smoke.js` (expect 17/17).
4. `node tools/hub_smoke.js` (ALL PASS).
5. Run `bash tools/sync-docs.sh`, then `pwsh -NoProfile -File tools/build_offline.ps1`.
6. Update `PROJECT_TASKS.md`, `README.md`, `HANDOVER_PROMPT.md`, `tools/README.md` with dated notes.
7. User commits and pushes manually.