# Little Racer 3D — Combined Action Plan (external AI reviews)

**Date:** 2026-09-22
**Author:** Ponytail Lazy Dev (synthesis)
**Sources:** `chatGPT_review.md`, `claude_review.md`, `grok_review.md`, `deepseek_review.md` in this folder, plus `RACER3D_ANALYSIS.md` and the verified code in `game/games/racing3d.mjs`.
**Status:** Pending user approval → implemented as task 102 micro-batches.
**Caveat:** ChatGPT/Claude/DeepSeek reviews only had `RACER3D_ANALYSIS.md`, not the live source, so every line reference was verified against the real code before planning (see Ground truth below).

## Locked decisions (confirmed by user 2026-09-22)

- **Simultaneous left+right steer: most-recent-wins** (per user, accepted my recommendation over ChatGPT/Claude's "neutral" — a toddler palm spanning both zones keeps the last intentional press working).
- **Resume after backgrounding: clean auto-resume** (per user — no "Настави" overlay; suspend Clock + AudioContext while hidden, reset clock on resume, discard one stale delta). DeepSeek's tap-overlay idea rejected for toddler friction.
- **Contact/blob shadows: INCLUDE** (per user, explicit request — DeepSeek's suggestion; overrides Grok's "defer shadows").
- All task-99/100 locked gameplay decisions stay untouched: `MAX_SPEED=35`, `ACCEL=16`, boost cap 42, front-wheel-led `steerDrive` steering with immediate stop-on-release, no auto-centering, no AI rivals, no fail states, no unlocks, YAGNI, `REDUCED_MOTION` gate at `racing3d.mjs:3`.
- Ground-truth finding: the feared `x *= 0.85`-style per-frame decay does **not** exist — easing uses `Math.min(1, k*dt)` (approx-correct), so this is a normalization cleanup, not a bug fix.

## Ground truth — frame-timing audit of the real code

| Site | Line | Formula | Verdict |
|---|---|---|---|
| steerDrive rise | 1416 | `(target - sd) * Math.min(1, 8*dt)` | normalize to `1-exp(-8*dt)` |
| steerDrive release decay | 1419 | `(0 - sd) * Math.min(1, 10*dt)` | normalize to `1-exp(-10*dt)` |
| body lean | 1425 | `(t - l) * Math.min(1, 10*dt)` | normalize to `1-exp(-10*dt)` |
| camera FOV (speed +6° boost kick) | 1563 | `(t - f) * Math.min(1, 4*dt)` | normalize to `1-exp(-4*dt)` |
| camera pos / look / quat | 1542/1546/1557 | `1-exp(-k*dt)` already | correct |
| lateral (1374), progress (1385), wheelRoll (1431), particles (977) | — | dt-integrated | correct |
| boost FOV kick (60→80, +6° while boosted) | — | present since look-and-feel pass | already done |

Note: an FOV kick on boost already exists; nothing to add, only normalize its easing.

## Implementation batches (task 102)

Each batch = one micro-step: code → `node --check` → `racing3d_smoke.js` 17/17 → `hub_smoke.js` ALL PASS → `tools/sync-docs.sh` → `build_offline.ps1` → dated notes in `PROJECT_TASKS.md` / `HANDOVER_PROMPT.md` / `tools/README.md`. Headless world-switch tests must use the **picker-click → reload** path (direct `Page.reload` is unreliable in the harness).

### Batch 1 — Frame-timing normalization + test hook (P0, all 4 AIs)
- Convert `Math.min(1, k*dt)` → `1 - Math.exp(-k*dt)` at lines 1416, 1419, 1425, 1563.
- Audit ambient sound accumulators, obstacle-warning beep cooldown (~720 ms), and the music scheduler for seconds-based timing; schedule from `ctx.currentTime` where frame-counted.
- Add test-only `__r3d.lastDt` + `__r3d.step(dt)` hook at the `__r3d` block (`:1615`); smoke asserts lateral displacement converges within tolerance stepping the sim at `dt=1/60` vs `dt=1/120`.
- Test: smoke steering checks still pass; new 60/120 Hz convergence case.

### Batch 2 — Touch/palm-press hardening (P0, all 4 AIs)
- Per-zone `pointerId` ownership + `setPointerCapture`, handle `pointercancel`/`touchend` and ignore `touchcancel` without releasing the wrong zone.
- `touch-action: none` on the canvas/HUD area (CSS in `racing3d.html`).
- Ignore touches that start outside the left/right steer zones (background = safe no-op).
- Simultaneous left+right → **most-recent-wins** (locked decision).
- Soft palm filter via `touch.radiusX` when reported (never solely relied on).
- Test: smoke CDP-synthesized touch press/cancel/release — assert `__r3d.steer` returns neutral and never sticks.

### Batch 3 — Visibility pause + audio suspend (P0, all 4 AIs)
- On `visibilitychange`/`blur`: suspend `window.ctx` (and `ctx.resume()` on return if state `suspended`/`interrupted`), pause music scheduler + ambient accumulators, zero out racing time.
- On resume: reset `THREE.Clock` (discard one stale delta), clean auto-resume (no overlay — locked).
- Test: smoke boots + drives after a synthetic visibility toggle; no progress jump on resume.

### Batch 4 — Reactive decor billboards (P1, all 4 AIs' top "wow")
- When kart `progress` passes within ~8–14 u of a decor billboard's track position, pulse `scale` (1.0→1.15→1.0 over ~300 ms), tilt `rotation.z`, bob `position.y`; also wave start-gate banner/pennants.
- No new draw calls — per-frame transforms on the existing 16 sprites; amplitude gated by `REDUCED_MOTION`.
- Test: smoke asserts via `__r3d` that a decor mesh scale changes when progress crosses its position, returns to baseline.

### Batch 5 — Contact/blob shadows (P1, DeepSeek; **user-requested**)
- One shared radial-gradient canvas texture as a transparent `THREE.Sprite` (or plane) under kart, pickups (~12), obstacles (~6–16), boost pads (~6) ≈ ~30 sprites.
- `fog:false`, depthTest careful to avoid overdraw; keep static or fade-only under `REDUCED_MOTION`.
- Test: smoke `__r3d.tris()` / draw calls stay under threshold.

### Batch 6 — Boost visual identity (P1, Claude + Grok)
- During the 1.2 s boost window: recolor + intensify the existing offroad-dust emitter (additive, brighter/warmer, higher rate); lengthen boost flame particles.
- Soft low-alpha rear-wheel road trail while on asphalt (one extra call site in the existing particle update).
- Test: smoke asserts emitter color/rate props differ between boosted and non-boosted `__r3d` snapshots.

### Batch 7 — Pickup feedback (P1, Grok + DeepSeek)
- Emissive/intensity flash on the kart body + sparkle pulse on collected pickup.
- Rising pickup chime pitch per consecutive pickup, reset on obstacle hit (audio-only sparkle — no HUD "combo meter", no score pressure).
- Test: smoke pickup count + particle cap unchanged; mock audio asserts pitch step.

### Batch 8 — Celebration choreography (P1, ChatGPT + Grok + DeepSeek)
- On lap complete and on finish: short burst of the world's own decor emoji sprites / colored petals rising + fading, reusing the weather emitters at higher rate for 1–1.5 s (particle pool cap 420); finish keeps its 110-confetti burst + gate/flags pulse.
- Test: smoke `particles()` still within cap; no draw-call spike.

### Batch 9 — Audio mixing (P2, all 4 AIs)
- Four `GainNode` buses: `music` / `ambient` / `sfx` / `speech`; duck music/ambient ~6–10 dB when speech or win celebration plays.
- dt-normalize ambient rates (already part of Batch 1 audit where frame-counted).
- Progressive obstacle warning: second, softer rising tone when nearest obstacle < 30 u ahead; rate-limit the 330 Hz beep (~720 ms) — keep non-alarming.
- Test: smoke no errors; music/ambient still advance correctly.

### Batch 10 — Minimal spoken Serbian hint (P2, all 4 AIs; unanimous *minimal*)
- Short phrases from an existing line pool («Пази!», «Браво!»), first-time-per-session + 8–10 s cooldown.
- Runtime check that a Serbian `sr-RS`/`sr-Latn-RS`-ish voice exists — silent fallback (no hint, no error) otherwise; **beep stays the authoritative cue**.
- Gated behind the existing audio toggle (`racing3dMusic`); never per-obstacle.
- Test: smoke mock `window.speech` asserts ≤1 speak/race and beep fires independent of speech.

### Batch 11 — Manual/dev QA (P2; warns + docs, little code)
- **WebGL context-loss fallback:** `webglcontextlost` (preventDefault + pause the loop) / `webglcontextrestored` (re-init via the existing reload-via-picker path) on the `racing3d.html` canvas. Manual iPad QA — headless can't reproduce.
- **iOS audio-unlock synchronicity audit:** confirm `ctx.resume()` is synchronous inside the «Крени!» click handler (no `await`/`setTimeout` in between). Manual-device regression checklist.
- **Offline delivery:** ChatGPT's 6-scenario offline matrix (first-visit/online hot, offline cold, partial ZIP, SW-skip + retry); versioned cache-key bump on every offline rebuild; Android stuck-file manual test.
- **Dev-only instrumentation:** `?debug=1` console FPS/particles log; never in the toddler HUD.

## Defer / avoid (all reviews agree)

- AI rivals, fail states, difficulty, loot/unlocks, changing `MAX_SPEED`/`ACCEL`.
- Touch joystick, auto-centering, residual lateral velocity, screen shake outside `REDUCED_MOTION`.
- Postprocess bloom, PBR, real shadows, extra InstancedMeshes pushing triangles past ~13–17 k.
- StereoPannerNode (Claude: correct but low value on tablet speakers) — defer.
- Full spoken commentary / generative music system — violates YAGNI, becomes noise.
- Vibration API, complex pause menus, mid-race save state.

## Validation contract (every batch)

1. Edit only `game/…` files.
2. `node --check` the changed JS.
3. `node tools/racing3d_smoke.js` (expect 17/17) and `node tools/hub_smoke.js` (ALL PASS).
4. `bash tools/sync-docs.sh`, then `pwsh -NoProfile -File tools/build_offline.ps1`.
5. Dated notes in `PROJECT_TASKS.md` / `HANDOVER_PROMPT.md` / `tools/README.md`.
6. User commits + pushes manually (never auto-commit).
7. Each batch approved by the user before starting the next.