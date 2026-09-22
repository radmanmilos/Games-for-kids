# Little Racer 3D — Prioritized Review for Ages 2–4

**Date:** 2026-09-22  
**Scope:** Toddler-friendly 3D kart racer (three.js r169, all-synth WebAudio, zero runtime deps, Serbian Cyrillic only, offline PWA).  
**Source of truth:** `RACER3D_ANALYSIS.md` and the architecture/decision log it documents.  
**Constraints honored:** No fail states, no AI rivals, no loot/unlocks, no speed increase, no auto-centering, YAGNI, reduced-motion gate, headless smoke contract (17/17).

---

## 1. Look & feel gaps — 2–3 cheapest “wow” upgrades

(Within the current sprite / InstancedMesh / particle / no-raycast pipeline. No new dependencies.)

### 1. Emissive / color-pulse feedback on the kart + pickups (highest impact / lowest cost)

The kart already has glossy materials and emissive hubs. Add a short, intensity-driven emissive flash (or hue shift) on the body/hood when a pickup is collected and on the boost pads when the kart is near. For the InstancedMesh flowers (already 130 instances / 1 draw call), pulse the instance color or scale briefly on collect.

- **Cost:** a few lines in the particle/spawn and pickup-hit paths (around the existing petal-burst and `spawnP` logic).
- **Why it works for 2–4:** reads across the room, reinforces “I did something,” stays cartoon and toddler-readable.
- **Reduced-motion:** simply shorten the pulse duration.

### 2. Bigger, longer-lived celebratory particle states on finish and on every lap

Finish already spawns 110 confetti flakes. Extend that pattern: on lap complete and on world arrival, spawn a short burst of the world’s own decor emoji sprites (the 16 camera-facing billboards already exist) or colored petals that rise and fade. Re-use the weather emitters (snowfall / gold stars) at higher rate for 1–1.5 s.

- **Cost:** reuse existing particle pool (cap 420) and the polish-round-1 weather emitters.
- **Why it works:** instant “the world reacts to me” without new assets.

### 3. Soft ground-contact and boost trails (cheap visual continuity)

When the kart is on the road, emit a short, low-alpha particle trail behind the rear wheels (already have drift-skid smoke and off-road dust). On boost, lengthen the existing flame particles and add a simple ribbon of the kart’s body color.

- **Cost:** one extra call site in the particle update that already runs every frame.
- **Why it works:** makes speed and steering readable from across the room; pairs perfectly with the visible gold tread studs.

**Defer / avoid**

- Real-time lighting bake, post-process bloom, or extra InstancedMeshes that push triangle count past the current ~13–17 k smoke baseline.
- Screen-space effects that fight the reduced-motion gate.

---

## 2. Feel / mechanics — MAX_SPEED = 35, ACCEL = 16, front-wheel-led steering

### Current values are intentionally toddler-tuned and should stay

Three successive play-test rounds already lowered speed from 132 → 88 → 70 → 35 (boost 42). The analysis records that this was validated with real 2–4-year-olds. Auto-forward + only left/right steering removes motor planning load. Front-wheel-led steering with immediate stop-on-release (no residual side-drag, no auto-centering) was the explicit fix from play-test round 5; the kart “settles exactly where you left it.” That is the correct model for toddlers who cannot (and should not) be asked to hold a precise heading.

### Frame-timing / interpolation risks

- `dt` is already clamped to 0.05 s. That protects against large spikes but does not fully protect against high-refresh devices (90/120 Hz tablets/phones) where the same physical acceleration produces smaller per-frame deltas. On a 120 Hz device the steering response can feel slightly more “snappy” and the visual bank/suspension bob can look smoother than on a 60 Hz tablet.
- Risk is low because the speed numbers are deliberately small and the lateral model is driven by a held `steerDrive` that rises/decays, not by instantaneous velocity.
- **Recommendation:** keep the clamp; optionally add a simple exponential smoothing on the camera FOV kick and body bank (already present) so the visual feel is identical at 60 Hz vs 120 Hz.
- **Do not** raise `MAX_SPEED` or `ACCEL`. If anything, a future play-test could explore a soft “creep” when no steer input is present, but that would re-open a locked decision and should be deferred.

**Verdict:** leave the numbers and the steering model alone. They are a strength, not a gap.

---

## 3. Audio — zero-asset all-synth pipeline

### Structural improvements that fit the existing synthesizer

- Layer the newly added ambient (`playAmbient`) more deliberately with the step-sequencer music: lower music volume slightly when ambient is dense (beach waves, snow wind, night owl) so the two do not fight.
- Make celebration SFX shorter and louder (success chime + petal burst already exist). A 150–250 ms “bright” sweep on lap complete and a slightly longer one on finish gives clearer feedback without new samples.
- Obstacle warning: the soft 330 Hz beep (12–90 units ahead) is good. Add a second, even softer rising tone when the obstacle is < 30 units so the child gets progressive information. Keep it non-alarming.

### Spoken Serbian hint system

Worth a very light version only. The existing `window.speech` helper is already Serbian. A single short phrase (“Пази!” / “Сакупи!”) triggered on the same distance windows as the beep, rate-limited to once every 8–10 s, would be valuable for non-readers. Do **not** make a full commentary system; that violates YAGNI and can become noise. Gate it behind the same reduced-motion / audio-toggle state so it never surprises a parent who has muted the game.

**Avoid**

- Any attempt to load external audio files (offline + zero-deps constraint).
- Complex generative music that would require new sequencing code.

---

## 4. Robustness

| Area | Assessment | Action |
|------|------------|--------|
| **Multi-touch / palm-press** | Highest priority for the age group. Toddlers frequently rest a whole hand on the screen. Two fixed left/right zones are correct in principle but need an explicit filter. | Ignore any touch that is not clearly inside the left or right half (or treat simultaneous left+right as “no steer”). Re-validate. |
| **Paused window / visibility** | Standard gap. | When `document.visibilityState === 'hidden'`, pause the clock and the audio context. On resume, do not jump the kart forward by the accumulated real time. |
| **iOS Safari WebGL context loss** | Real on older iPads. | Listen for `webglcontextlost` / `webglcontextrestored` and rebuild the essential meshes (road, kart, particles) rather than leaving a black canvas. Audio unlock is already tied to the “Крени!” gesture — keep that path. |
| **Offline service-worker** | Recent “stuck download” self-heal is good. Remaining risk is a partial ZIP cache on Android. | Versioned cache-key bump on every offline rebuild + a visible “retry offline package” affordance in the hub. Manual testing on a real Android device is still required; headless cannot fully substitute. |

None of these require new dependencies or architecture changes.

---

## 5. Concrete “next 10” micro-batch plan

Ordered, each small enough for the existing 17-check smoke harness, none violating YAGNI or the locked decisions (no AI rivals, no fail states, no unlocks, no speed increase, no auto-centering).

| # | Batch | Test focus | Notes |
|---|-------|------------|-------|
| 1 | Kart + pickup emissive/color pulse on collect | Smoke still 17/17; pulse visible; reduced-motion shortens it | Touch material emissive or instance color ~0.4 s |
| 2 | Lap-complete and finish particle burst using existing world decor / weather emitters | `particles()` introspection still within cap; no draw-call spikes | Re-use particle pool |
| 3 | Soft rear-wheel road trail + longer boost flame | Smoke + visual drift/boost paths | One extra spawn site |
| 4 | Multi-touch / palm-press filter on the two steer zones | Existing steering checks still pass; add manual multi-touch note | Ignore ambiguous multi-touch |
| 5 | Visibility-change pause (clock + AudioContext) | Smoke still boots and drives; no progress jump on resume | Standard page-visibility handler |
| 6 | Progressive obstacle warning (second softer tone < 30 units) | Audio still unlocked only on user gesture; no change to obstacle density | Extend the existing 330 Hz path |
| 7 | Optional one-shot Serbian speech hint (“Пази!”) rate-limited | Speech helper already present; smoke does not break | Behind the same audio toggle |
| 8 | Camera / bank / FOV exponential smoothing for high-refresh devices | Smoke steering + bank checks unchanged | Tiny filter on existing visual values |
| 9 | `webglcontextlost` / restored rebuild of essential scene objects | Smoke still passes on normal boot; document the handler | Cannot fully automate in headless |
| 10 | Ambient / music volume ducking per world theme | Music toggle still works; ambient still fires at correct rates | One gain-node adjustment |

### Validation & documentation contract for every batch

1. Edit only `game/…` files.
2. `node --check` the changed JS.
3. `node tools/racing3d_smoke.js` (expect 17/17) and `node tools/hub_smoke.js` (ALL PASS).
4. `bash tools/sync-docs.sh`, then `pwsh -NoProfile -File tools/build_offline.ps1`.
5. Dated note in `PROJECT_TASKS.md` / `HANDOVER_PROMPT.md` / `tools/README.md`.
6. User commits + pushes manually (never auto-commit).

---

## Items to defer or avoid entirely for this age group

- Any speed or acceleration increase.
- Auto-centering or residual lateral velocity.
- Difficulty scaling, timers, scoreboards, or fail states.
- New modules, external assets, or post-process effects.
- Complex spoken commentary or generative music systems.

---

## Summary

The current build is already a solid, play-tested toddler racer. The highest-leverage work is:

1. the three cheap visual feedback upgrades (emissive pulse, celebratory particles, trails),
2. the multi-touch / palm-press filter,
3. visibility and WebGL-context-loss hardening.

Everything else is polish that can be taken one micro-batch at a time while the smoke harness remains the contract.
