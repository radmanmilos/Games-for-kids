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
| Q-02 | 0 | Real WebGL smoke battery | Q-01 | | DONE (partial) | OpenCode/Big Pickle | 2026-11-25 | W1/W2/W4/W10/photo green; W3/W5-W9/W11-W13 need features. |
| Q-03 | 1 | Colour pipeline, lighting, atmosphere | Q-02 | yes | DONE (partial) | OpenCode/Big Pickle | 2026-11-25 | Tone mapping SRGB, ZONE_ATMOS, atmosphere blend, vignette. Look unreviewed. |
| Q-04 | 1 | Material kit (QG1) | Q-03 | yes | DONE (partial) | OpenCode/Big Pickle | 2026-11-25 | little_adventure-materials.js: toon ramp, cache, outline, AO, wind. QG1 user approval pending. |
| Q-05 | 1 | Sky, clouds, sun, fog | Q-03 | yes | DONE (partial) | OpenCode/Big Pickle | 2026-11-25 | Sky dome, sun sprite, 10 instanced clouds with drift. Look unreviewed. |
| Q-06 | 1 | Terrain, island, beach, path | Q-04 | yes | DONE (partial) | OpenCode/Big Pickle | 2026-11-25 | little_adventure-terrain.js: heightAt, maskAt, pathAt, vertex data. 6 Node tests green. Not wired into renderer. |
| Q-07 | 1 | Water | Q-06 | yes | NEW | | | |
| Q-08 | 1 | Vegetation + props (QG2) | Q-06 | yes | NEW | | | |
| Q-09 | 2 | Animation toolkit + filmstrip mode | Q-02 | | DONE (partial) | OpenCode/Big Pickle | 2026-11-26 | anim module + 9 Node tests; sheet() hook builds placeholder filmstrip clones in renderer (camera guarded). Visual filmstrip review still pending. |
| Q-10 | 2 | Hero v2 rig + face + outlines | Q-04, Q-09 | yes | NEW | | | |
| Q-11 | 2 | Hero animation set (QG3) | Q-10 | yes | NEW | | | |
| Q-12 | 2 | Grumpy/guard/boss v2 + animation | Q-10, Q-11 | yes | NEW | | | |
| Q-13 | 2 | Owl + props + completion bloom (QG4) | Q-12 | yes | NEW | | | |
| Q-14 | 3 | Sprite particles + ambient life | Q-04 | yes | DONE (partial) | OpenCode/Big Pickle | 2026-11-25 | little_adventure-fx.js: EVENT_TABLE (16), TIERS, particleCap, cameraNudge. 4 Node tests. |
| Q-15 | 3 | Camera polish | Q-03, Q-11 | yes | DONE (partial) | OpenCode/Big Pickle | 2026-11-25 | cameraNudge helper in fx module. Full camera work needs Q-11. |
| Q-16 | 3 | Audio v2 + sound toggle | Q-09 | | DONE (partial) | OpenCode/Big Pickle | 2026-11-26 | audio module + sound button/aria-pressed + separate mute key + event SFX playSweep + speakWithDuck + visibility suspend/resume. Still missing: sequencer music player, ambient beds, zone crossfade, footstep sync, pitch variance, full SFX audit. |
| Q-17 | 3 | UI/UX art pass + start screen (QG5) | Q-11, Q-16 | yes | NEW | | | |
| Q-18 | 4 | Quality tiers + performance | Q-07, Q-08, Q-14 | | DONE (partial) | OpenCode/Big Pickle | 2026-11-25 | TIERS table in fx module. Adaptive step-down needs renderer wiring. |
| Q-19 | 4 | Shadows | Q-18 | yes | NEW | | | |
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
