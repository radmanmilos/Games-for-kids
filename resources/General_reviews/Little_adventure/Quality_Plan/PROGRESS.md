# PROGRESS — Quality Plan (Little Adventure)

Live ledger. Status: `NEW` · `IN PROGRESS` · `DONE` · `BLOCKED` · `DEFERRED`. Last updated: 2026-11-26 (OpenCode/Big Pickle — Q-16/Q-18 wiring increments; check_fast green).

Base: `main`, manifest 3.0.25. Original package ledger: `../PROGRESS.md` (IS-00…IS-19 DONE, IS-20 user-led).

## Gates

- [x] Plan installed; D-Q1 (art pipeline) defaulted (code-only art)
- [x] WebGL availability: YES (WebGL2)
- [ ] Rubric baseline scored (RV §5): needs VL review of shots/00_baseline

## Board

| ID | Phase | Title | Depends | Look gate | Status | Who | Date | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Q-00 | 0 | Probe, shots tool, baseline, doc fix | — | | DONE | OpenCode/Big Pickle | 2026-11-25 | Doc fix A9; photo()/sheet() hooks; shots tool; 42 baseline PNGs; visual-states PLAY. |
| Q-01 | 0 | Fix floor/void defect | Q-00 | yes | DONE (look unreviewed) | OpenCode/Big Pickle | 2026-11-25 | Ground/water 96×160 z=-32; edge fade removed; camera clamped; containment 5/5. |
| Q-02 | 0 | Real WebGL smoke battery | Q-01 | | DONE (partial) | OpenCode/Big Pickle | 2026-11-26 | W1-W13 green in `tools/little_adventure_smoke.js` (27 checks) incl. W7 60s flail, W8 reduced-motion bootEmulated, stronger W10 save/load carry round trip; hook exposes save/load/particlesAlive. Remaining: fuller W4 zone-centre budgets, W5 chest/pedestal mesh-state checks, W9 4s guard. |
| Q-03 | 1 | Colour pipeline, lighting, atmosphere | Q-02 | yes | DONE (partial) | OpenCode/Big Pickle | 2026-11-25 | Tone mapping SRGB, ZONE_ATMOS, atmosphere blend, vignette. Look unreviewed. |
| Q-04 | 1 | Material kit (QG1) | Q-03 | yes | DONE (partial) | OpenCode/Big Pickle | 2026-11-26 | materials singleton cache wired into models.js + instanced decor; **QG1 approved by user (2026-11-26, "A approve")**. Still needs full renderer prop migration, outlines, material-count hook/AC verification. |
| Q-05 | 1 | Sky, clouds, sun, fog | Q-03 | yes | DONE (partial) | OpenCode/Big Pickle | 2026-11-25 | Sky dome, sun sprite, 10 instanced clouds with drift. Look unreviewed. |
| Q-06 | 1 | Terrain, island, beach, path | Q-04 | yes | DONE (partial) | OpenCode/Big Pickle | 2026-11-26 | terrain.js deterministic heightAt/maskAt wired to hero/actors/static props; ground replaced with terrain BufferGeometry mesh. Look gate: screenshots captured for user review. |
| Q-07 | 1 | Water | Q-06 | yes | NEW | | | |
| Q-08 | 1 | Vegetation + props (QG2) | Q-06 | yes | NEW | | | |
| Q-09 | 2 | Animation toolkit + filmstrip mode | Q-02 | | DONE (partial) | OpenCode/Big Pickle | 2026-11-26 | anim module + 9 Node tests; sheet() hook builds placeholder filmstrip clones in renderer (camera guarded). Visual filmstrip review still pending. |
| Q-10 | 2 | Hero v2 rig + face + outlines | Q-04, Q-09 | yes | NEW | | | |
| Q-11 | 2 | Hero animation set (QG3) | Q-10 | yes | NEW | | | |
| Q-12 | 2 | Grumpy/guard/boss v2 + animation | Q-10, Q-11 | yes | NEW | | | |
| Q-13 | 2 | Owl + props + completion bloom (QG4) | Q-12 | yes | NEW | | | |
| Q-14 | 3 | Sprite particles + ambient life | Q-04 | yes | DONE (partial) | OpenCode/Big Pickle | 2026-11-26 | Atlas-textured particles, EVENT_TABLE-driven particle configs/colors, ambient zone life (tier/reduced-motion gated), W7 60s flail cap proof in smoke. Still missing: two-pool/additive halo, footstep dust. |
| Q-15 | 3 | Camera polish | Q-03, Q-11 | yes | DONE (partial) | OpenCode/Big Pickle | 2026-11-26 | Look-ahead (0.35s, +/-2u) + gateOpen/bridgeUp reveal nudges (<=1.2s, reduced-motion safe). Smoke: 90% safe-frame at extremes + W8 reduced-motion. Remaining: Q-11-dependent polish. |
| Q-16 | 3 | Audio v2 + sound toggle | Q-09 | | DONE (partial) | OpenCode/Big Pickle | 2026-11-26 | audio module + sound button/aria-pressed + mute key + event SFX/pitch variance + speakWithDuck + visibility suspend/resume + thin zone music sequencer/ambient/zone crossfade/footstep sync on audioBuses. Still missing: richer ambient beds, full SFX audit/fanfare sparkle, tablet listening (USER-RUN). |
| Q-17 | 3 | UI/UX art pass + start screen (QG5) | Q-11, Q-16 | yes | DONE (partial) | OpenCode/Big Pickle | 2026-11-26 | Start overlay transparent/live 3D orbit, Continue/New SVG+text, sound icon swap, pause overlay polish, animated landscape hint, first-launch drag hint (5s/localStorage). START/PLAY screenshots captured. Missing: full QG5 tablet review, S7/S8/S9 explicit shell audit. |
| Q-18 | 4 | Quality tiers + performance | Q-07, Q-08, Q-14 | | DONE (partial) | OpenCode/Big Pickle | 2026-11-26 | TIERS table, adaptive step-down, quality()/fxTable(), perf overlay counters/memory/programs, scene dispose on back. Smoke: Q-18 5 reload-cycle leak proxy stable. Remaining: full tier switching, tablet measurement. |
| Q-19 | 4 | Shadows | Q-18 | yes | DONE (partial) | OpenCode/Big Pickle | 2026-11-26 | Dir shadow map 1024 PCFSoft, bias tuned, hero/actor cast by tier, ground receiveShadow, blob shadows hidden on med/high. Tablet perf/acne visual USER-RUN pending. |
| Q-20 | 4 | Readability, guidance restyle, feel tuning | Q-17 | yes | NEW | | | |
| Q-21 | 4 | Completion celebration + free-play life | Q-13, Q-14, Q-16 | yes | NEW | | | |
| Q-22 | 4 | Full verification + golden shots (QG6) | Q-17…Q-21 | | NEW | | | |
| Q-23 | 4 | Docs + release prep | Q-22 + QG6 | | NEW | | | |
| Q-24 | 4 | Playtest rounds (QG7) | Q-23 | | NEW | | | |

## Rubric scores (RV §5)

| Moment | Char | Anim | World | FX | Audio | UI | Clarity | Perf | Scorer |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Baseline (Q-00) | | | | | | | | | |

## Log

- 2026-11-25 — OpenCode/Big Pickle — Q-00 done.
- 2026-11-25 — OpenCode/Big Pickle — Q-01 done (look unreviewed).
- 2026-11-25 — OpenCode/Big Pickle — Q-02 partial: W1/W2/W4/W10/photo green.
- 2026-11-25 — OpenCode/Big Pickle — Q-03 partial: tone mapping, ZONE_ATMOS, atmosphere blend, vignette.
- 2026-11-25 — OpenCode/Big Pickle — Q-04 partial: materials module.
- 2026-11-25 — OpenCode/Big Pickle — Q-05 partial: sky dome, sun, clouds.
- 2026-11-25 — OpenCode/Big Pickle — Q-06 partial: terrain module + 6 tests.
- 2026-11-25 — OpenCode/Big Pickle — Q-09 partial: anim module + 9 tests.
- 2026-11-25 — OpenCode/Big Pickle — Q-14/Q-15/Q-18 partial: fx module + 4 tests.
- 2026-11-25 — OpenCode/Big Pickle — Q-16 partial: audio module + 4 tests.
- 2026-11-26 — OpenCode/Big Pickle — Q-16 wiring: sound button (SVG, aria-pressed), separate mute key, event SFX playSweep, speakWithDuck, visibility audio suspend/resume. check_fast green.
- 2026-11-26 — OpenCode/Big Pickle — Q-18 wiring: tier in state/perf overlay, one-step adaptive down, quality()/fxTable() hooks, fx module loaded. check_fast green.
- 2026-11-26 — OpenCode/Big Pickle — Q-09 wiring: sheet() builds placeholder filmstrip clones, camera guarded; smokes/check_fast green.
- 2026-11-26 — OpenCode/Big Pickle — Q-16 small: SFX pitch variance jitter applied; smokes/check_fast green.
- 2026-11-26 — OpenCode/Big Pickle — Q-18 small: renderer.info memory/programs exposed in state/perf overlay; check_fast green.
- 2026-11-26 — OpenCode/Big Pickle — Q-16: thin zone music sequencer/ambient/crossfade/footstep sync wired in renderer (audioBuses, mute/visibility respected); LA smokes 19+34 pass.
- 2026-11-26 — OpenCode/Big Pickle — Q-18: scene dispose pass on back; smokes green.
- 2026-11-26 — User approved QG1 (A, as-is look direction). Q-04/Q-06/Q-07/Q-08 gated work unblocked.
- 2026-11-26 — OpenCode/Big Pickle — Q-04 wiring: materials singleton cache, models.js toon cache, instanced decor toon cache; smokes green.
- 2026-11-26 — OpenCode/Big Pickle — Q-06 wiring: deterministic terrain heightAt applied to hero/actors/props; smokes green.
- 2026-11-26 — OpenCode/Big Pickle — Q-06 ground mesh replaced with terrain BufferGeometry; smokes green, screenshots captured.
- 2026-11-26 — User pre-approval: continue through all remaining tasks/QG decisions until done (recorded; still capture screenshots/artifacts).
- 2026-11-26 — OpenCode/Big Pickle — Q-15: look-ahead + gate/bridge reveal nudges wired; smokes green.
- 2026-11-26 — OpenCode/Big Pickle — Q-16/Q-18: SFX audit OK (17/17), befriend sparkle+complete fanfare layers, tier-based particle burst cap; smokes green.
- 2026-11-26 — OpenCode/Big Pickle — Q-02: added W3/W6/W9/W11/W13 smoke checks; fixed saveNow/playSfx/soundOn scope bug; LA smokes 23+34 pass.
- 2026-11-26 — OpenCode/Big Pickle — Q-02: added W5/W12 smoke checks (gate state after give/teleport, WEBGL_lose_context temp-canvas); 25/25 smoke pass.
- 2026-11-26 — OpenCode/Big Pickle — Q-19: shadow map bias/tier wiring, ground receiveShadow, hero/actor castShadow by tier, blob hide on med/high; smokes green, screenshots captured.
- 2026-11-26 — OpenCode/Big Pickle — Q-14: atlas-textured particles, EVENT_TABLE-driven configs, ambient zone life; smokes green, screenshots captured.
- 2026-11-26 - OpenCode/Big Pickle - Q-17: start overlay transparent over live 3D, orbiting start camera, Continue/New SVG+text buttons; START/PLAY screenshots captured; smokes/check_fast green.
- 2026-11-26 - OpenCode/Big Pickle - Q-02: added W7 60s flail particle-cap check, W8 reduced-motion bootEmulated check, stronger W10 save/load carry round trip; hook exposes save/load/particlesAlive; LA smoke 27 checks green.
- 2026-11-26 - OpenCode/Big Pickle - Q-15/Q-18: added 90% safe-frame extreme-point smoke check and 5 reload-cycle leak proxy; hook exposes project(); LA smoke 29 checks green.
- 2026-11-26 - OpenCode/Big Pickle - Q-17: added animated landscape hint, pause overlay polish, first-launch drag hint (5s/localStorage), sound icon swap; START/PLAY screenshots refreshed; smokes green.
