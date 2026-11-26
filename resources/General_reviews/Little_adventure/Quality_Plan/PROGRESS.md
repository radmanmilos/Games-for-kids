# PROGRESS — Quality Plan (Little Adventure)

Live ledger. Status: `NEW` · `IN PROGRESS` · `DONE` · `BLOCKED` · `DEFERRED`. Last updated: 2026-11-26 (OpenCode/Big Pickle — Q-11/Q-12 filmstrip rigs + anim extensions; check_fast green).

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
| Q-02 | 0 | Real WebGL smoke battery | Q-01 | | DONE (partial) | OpenCode/Big Pickle | 2026-11-26 | W1-W13 green in `tools/little_adventure_smoke.js` (44 checks) incl. W7 60s flail, W8 reduced-motion bootEmulated, W10 save/load, W4 start+8 corridor sub-zone budgets with call/tri numbers, W5 gate/chest/pedestal logic+mesh checks, W9 4s speech guard. Remaining: additional budget/regression asserts as needed. |
| Q-03 | 1 | Colour pipeline, lighting, atmosphere | Q-02 | yes | DONE (partial) | OpenCode/Big Pickle | 2026-11-25 | Tone mapping SRGB, ZONE_ATMOS, atmosphere blend, vignette. Look unreviewed. |
| Q-04 | 1 | Material kit (QG1) | Q-03 | yes | DONE (partial) | OpenCode/Big Pickle | 2026-11-26 | materials singleton cache wired into models.js + instanced decor; **QG1 approved by user (2026-11-26, "A approve")**. Still needs full renderer prop migration, outlines, material-count hook/AC verification. |
| Q-05 | 1 | Sky, clouds, sun, fog | Q-03 | yes | DONE (partial) | OpenCode/Big Pickle | 2026-11-25 | Sky dome, sun sprite, 10 instanced clouds with drift. Look unreviewed. |
| Q-06 | 1 | Terrain, island, beach, path | Q-04 | yes | DONE (partial) | OpenCode/Big Pickle | 2026-11-26 | terrain.js deterministic heightAt/maskAt wired to hero/actors/static props; ground replaced with terrain BufferGeometry mesh. Look gate: screenshots captured for user review. |
| Q-07 | 1 | Water | Q-06 | yes | DONE (partial) | OpenCode/Big Pickle | 2026-11-26 | Shader-patched water with maskAt-baked shore foam (vertex attribute), wave displacement, tint; paused-frozen/reduced-motion slowed; low-tier sparkle points visible on low tier. Q-07 low-tier flat-water material swap added (`waterFlatMat`, no wave shader) via `applyTier`; high/med shader path intact. Review shots: `shots/q07_review/water-low-tier_1280x800.png`, `water-high-tier_1280x800.png`. Remaining: tablet perf/visual USER-RUN; QG2 look review (pre-approved by user, artifact/VL-user review still pending). |
| Q-08 | 1 | Vegetation + props (QG2) | Q-06 | yes | DONE (partial) | OpenCode/Big Pickle | 2026-11-26 | Zone-aware seeded instanced vegetation/props (trees/tufts/flowers/rocks/mushrooms/logs/lanterns/runes), wind sway (reduced-motion frozen), exclusion placement smoke check, review screenshots captured. Remaining: landmark props per zone, builders extraction to keep mjs <=900, full TDQ9 tier/zone budget proof, QG2 look review artifact confirmation. |
| Q-09 | 2 | Animation toolkit + filmstrip mode | Q-02 | | DONE (partial) | OpenCode/Big Pickle | 2026-11-26 | anim module + 9 Node tests; sheet() hook builds placeholder filmstrip clones in renderer (camera guarded). Visual filmstrip review still pending. |
| Q-10 | 2 | Hero v2 rig + face + outlines | Q-04, Q-09 | yes | DONE (partial) | OpenCode/Big Pickle | 2026-11-26 | `little_adventure-characters.js` created with `makeHero2()` (AD3 pivots), face atlas painter/8 cells, outline helper, applyPose/setFace; Node tests for pivot contract and face atlas. Wired into page; gallery shows old+new; hero2 active in renderer. Node triangle budgets enforced (hero2<=2500, grumpy2/owl2<=1200) via minimal THREE mock; geometry segments reduced to budget. Remaining: browser triangle AC confirmation, QG3 look review. |
| Q-11 | 2 | Hero animation set (QG3) | Q-10 | yes | DONE (partial) | OpenCode/Big Pickle | 2026-11-26 | Hero switched to hero2; evalHero+applyPose wired in renderer, shield pose override, reduced-motion motionScale passed. Node: AD4 swing envelope at swingFrac 0/0.26/0.57/1 within 5deg, hero pose continuity <25deg/16ms, reduced-motion scaling, no NaN. evalHero swingPhase==0 bug fixed. evalHero extended with shield/bump/pickup/celebrate/phase; real rig filmstrips captured `shots/q11_q12_filmstrips/` (hero-idle/walk/swing/shield/bump/pickup/celebrate). Q-11 sword trail ribbon (6-segment ring buffer) wired in renderer. Remaining: stride phase/footstep event tuning verification, full QG3 look review (VL/user). |
| Q-12 | 2 | Grumpy/guard/boss v2 + animation | Q-10, Q-11 | yes | DONE (partial) | OpenCode/Big Pickle | 2026-11-26 | `makeGrumpy2(role)` rig with AD3 pivots/face/materials wired into gallery and renderer; evalGrumpy+applyPose in render loop with happy/strain face and body recolor. Node pivot/continuity + squash/stretch volume-preservation (sx*sy*sz within 0.15, squashSeen) tests added; read-only hitT/befriendT grumpy timers in logic drive hit squash/outElastic and befriend pop. evalGrumpy extended (notice/happyDance/stomp); real rig filmstrips captured `shots/q11_q12_filmstrips/` (grumpy-walk/notice/hit/befriend, happy-dance, boss-stomp). Boss stomp ring+crown wobble+respawn puff wired in renderer (renderer-only stomp cycle, dust ring, crown wobble, grumpyRespawn puff-in scale). Remaining: QG/VL-user look review. |
| Q-13 | 2 | Owl + props + completion bloom (QG4) | Q-12 | yes | DONE (partial) | OpenCode/Big Pickle | 2026-11-26 | `makeOwl2()` rig+anim; chest outBack; gate two leaves; statue charge-glow (`statue.nextT`); items halo+spin+bob+pickup arc/carry spring; pedestals pulse/beam; lighthouse beam+rotation; bridge shimmer; bloom wave flowers. Real prop filmstrips now rendered in buildSheet/photo flow (`shots/q13_filmstrips/` chest/gate/bridge/bloom real). QG4 review artifacts in `shots/q13_review/` (pre-approved QG; VL/user look review still pending). Remaining: full gate/prop v2 polish. |
| Q-14 | 3 | Sprite particles + ambient life | Q-04 | yes | DONE (partial) | OpenCode/Big Pickle | 2026-11-26 | Atlas-textured particles, EVENT_TABLE-driven configs/colors, normal+additive pools (tier-sized buffers), additive halo glow, ambient zone life, W7 cap proof, hero footstep dust (reduced-motion gated). Remaining: QG review artifact. |
| Q-15 | 3 | Camera polish | Q-03, Q-11 | yes | DONE (partial) | OpenCode/Big Pickle | 2026-11-26 | Look-ahead (0.35s, +/-2u) + gateOpen/bridgeUp reveal nudges (<=1.2s, reduced-motion safe). Smoke: 90% safe-frame at extremes + W8 reduced-motion. Remaining: Q-11-dependent polish. |
| Q-16 | 3 | Audio v2 + sound toggle | Q-09 | | DONE (partial) | OpenCode/Big Pickle | 2026-11-26 | Audio module + sound button/aria-pressed + mute key + SFX/pitch variance + speakWithDuck 4s guard + visibility suspend/resume + zone music sequencer/ambient/crossfade/footstep sync. Quality smoke verifies EVENT_TABLE SFX coverage + gain cap + determinism. Remaining: richer ambient beds, tablet listening (USER-RUN). |
| Q-17 | 3 | UI/UX art pass + start screen (QG5) | Q-11, Q-16 | yes | DONE (partial) | OpenCode/Big Pickle | 2026-11-26 | Start overlay transparent/live 3D orbit, Continue/New SVG+text, sound icon swap, pause overlay polish, animated landscape hint, first-launch drag hint (5s/localStorage). S7/S8/S9 shell checks added to smoke. START/PLAY screenshots captured. Missing: full QG5 tablet review. | QG5 review artifacts captured in `shots/q17_review/` (pre-approved QG; tablet/user review still pending). |
| Q-18 | 4 | Quality tiers + performance | Q-07, Q-08, Q-14 | | DONE (partial) | OpenCode/Big Pickle | 2026-11-26 | TIERS table, adaptive step-down, quality()/fxTable(), perf overlay counters/memory/programs, scene dispose on back. Smoke: W13 step-down, Q-18 quality() switching, 5 reload-cycle leak proxy stable. Remaining: tablet measurement (USER-RUN). |
| Q-19 | 4 | Shadows | Q-18 | yes | DONE (partial) | OpenCode/Big Pickle | 2026-11-26 | Dir shadow map 1024 PCFSoft, bias tuned, hero/actor cast by tier, ground receiveShadow, blob shadows hidden on med/high. Shadow screenshots captured (`shots/q19/`). Remaining: tablet perf/acne visual USER-RUN. |
| Q-20 | 4 | Readability, guidance restyle, feel tuning | Q-17 | yes | DONE (partial) | OpenCode/Big Pickle | 2026-11-26 | Beacon god-ray+sparkles, ground chevron arrow, aim-assist ring, gate/pedestal carried-item glow. Feel tuning log: `shots/q20/feel_tuning_log.md`. Remaining: full readability/tablet review USER-RUN. |
| Q-21 | 4 | Completion celebration + free-play life | Q-13, Q-14, Q-16 | yes | DONE (partial) | OpenCode/Big Pickle | 2026-11-26 | Win celebration: star bursts ~1.5Hz 4.5s, lighthouse beam burst, bridge shimmer, bloom wave, follower dance/owl hop, post-win butterflies; reduced-motion still/short; game stays playable. Remaining: QG review artifacts, flashing USER-RUN check. |
| Q-22 | 4 | Full verification + golden shots (QG6) | Q-17..Q-21 | | DONE (partial) | OpenCode/Big Pickle | 2026-11-26 | LA quality 46/46, LA smoke 44/44 (S1-S10 shell + W1-W13 WebGL incl.), touch_interruption LA 6/6, `node tools/offline_smoke.mjs` PASS incl. little_adventure offline boot/interaction/audio-failure/back, golden shots 78 PNGs (`shots/golden/`), ASSET_BUDGET refreshed. check_release sh_217a73d33001xlET8sVGtFKAa0 FAIL only racing3d drift (39/40) - standalone racing3d PASS 40/40, runtime_error 34/0; classified flaky/unrelated. visual_compare LA baseline not created (tool requires full approved registered set/all 5 viewports). Rubric self-score recorded (AI, non-VL); USER-RUN/tablet/perf/audio/listening/playtest/readability, full 4-viewport QG6 package review, and QG6 user approval still pending. |
| Q-23 | 4 | Docs + release prep | Q-22 + QG6 | | NEW | | | |
| Q-24 | 4 | Playtest rounds (QG7) | Q-23 | | NEW | | | |

## Rubric scores (RV �5)

AI self-score 2026-11-26 (OpenCode/Big Pickle, non-VL; visual categories need VL/user confirmation; USER-RUN items unverified):

| Category | Score | Evidence / caveat |
| --- | --- | --- |
| Character appeal | 3/5 (AI est.) | Procedural rigs/shapes improved by Q-cards; no VL/user visual approval. |
| Animation | 3/5 (AI est.) | Anim/fx modules, filmstrips generated; no VL/user motion review. |
| World & lighting | 3/5 (AI est.) | Terrain/water/zone work landed; no VL/user/tablet look review. |
| Effects & juice | 4/5 (AI est.) | Event-driven particles, additive pools, ambient/celebration FX; tablet feel USER-RUN. |
| Audio | 3/5 (UNVERIFIED) | SFX/music/ducking wired, audio smokes/quality checks pass; pleasantness/listening USER-RUN. |
| UI/UX | 3/5 (AI est.) | Start/pause/sound/hint polish, S7-S9 checks green; tablet readability/comfort USER-RUN. |
| Clarity for the child | 3/5 (UNVERIFIED) | Beacon/arrow/owl/hints implemented; real child playtest USER-RUN. |
| Stability & performance | 4/5 (partial) | LA quality/smoke/touch/offline PASS, check_release LA-unrelated flaky only; tablet 60/30fps/leak USER-RUN. |

Target remains: every category >=4, none <3; QG6 user approval pending.


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
- 2026-11-26 - OpenCode/Big Pickle - Q-02: added W4 zone-centre budgets, W5 gate/chest/pedestal logic+mesh checks, W9 4s speech guard; fixed gate openT=0 mesh render; hook exposes shouldSpeak/meshState; LA smoke 34 checks green.
- 2026-11-26 - OpenCode/Big Pickle - Q-07: shader-patched water (waves/foam/tint, paused-frozen, reduced-motion slowed); Q-17: added S7/S8/S9 shell smoke checks.
- 2026-11-26 - OpenCode/Big Pickle - Q-20: beacon god-ray+sparkles, ground chevron arrow, aim-assist ring, gate/pedestal carried-item emissive glow.
- 2026-11-26 - OpenCode/Big Pickle - Q-16/Q-18: EVENT_TABLE SFX coverage smoke check, befriend sparkle layer, quality(tier) switch smoke; tablet items remain USER-RUN.
- 2026-11-26 - OpenCode/Big Pickle - Q-08: zone-aware seeded instanced vegetation/props (trees A/B/C, wind-sway tufts reduced-motion frozen, 5 flower colors, rocks, mushrooms, logs, lantern+glow, rune columns), `window.__laDeco` debug, LA smoke placement exclusion check; review screenshots refreshed. Remaining: landmarks, builder extraction (mjs >900), TDQ9 full tier proof, QG2 artifact confirmation.
- 2026-11-26 - OpenCode/Big Pickle - Q-10: added `little_adventure-characters.js` (makeHero2 AD3 pivots, face atlas 8 cells, outlines, applyPose) + Node tests; wired missing anim/materials/terrain/characters script tags into page (terrain/materials now actually load in browser).
- 2026-11-26 - OpenCode/Big Pickle - Q-10/Q-11: hero2 wired into gallery and renderer; evalHero+applyPose drive hero animation with shield override and reduced-motion scaling.
- 2026-11-26 - OpenCode/Big Pickle - Q-12: makeGrumpy2 rig (AD3 pivots, roles, face) wired into gallery+renderer with evalGrumpy/applyPose and recolor; Node pivot/continuity checks.
- 2026-11-26 - OpenCode/Big Pickle - Q-13: makeOwl2 rig (AD3 pivots) wired into gallery+renderer with evalOwl/applyPose; exported applyPose/setFace on characters module to fix boot crash. Node pivot checks. Remaining: owl anim polish, props v2, completion bloom, QG4.
- 2026-11-26 - OpenCode/Big Pickle - Q-10/Q-11/Q-12 Node AC hardening: triangle budgets (hero2<=2500, grumpy2/owl2<=1200) enforced in quality smoke with minimal THREE mock; hero2/grumpy2/owl2 geometry segments reduced to budget. evalHero swingPhase==0 bug fixed; AD4 swing envelope at 0/0.26/0.57/1 within 5deg + hero continuity <25deg/16ms Node tests. evalGrumpy squash/stretch volume preservation + read-only hitT/befriendT logic timers. quality 50/50, LA smoke 44/44, check_fast 10/10 PASS.
- 2026-11-26 - OpenCode/Big Pickle - Q-11/Q-12 filmstrips: buildSheet renders real hero2/grumpy2/boss/owl rigs; evalHero extended (shield/bump/pickup/celebrate/phase) and evalGrumpy extended (notice/happyDance/stomp). Captured shots/q11_q12_filmstrips 78 PNGs; Q-11/Q-12 filmstrip AC names now real poses (prop filmstrips chest/gate/bridge/bloom still placeholder). quality 50/50, LA smoke 44/44, check_fast 10/10 PASS.
- 2026-11-26 - OpenCode/Big Pickle - Q-07: low-tier flat-water material swap implemented (waterFlatMat, pplyTier swaps material; low-tier sparkles kept). Quality 50/50, LA smoke 44/44, check_fast 10/10 PASS. Artifacts: shots/q07_review/water-low-tier_1280x800.png, water-high-tier_1280x800.png. Tablet perf/visual USER-RUN; QG2 look review still pending VL/user confirmation.
- 2026-11-26 - OpenCode/Big Pickle - Q-13: real prop filmstrips (chest-open/gate-open/bridge-build/bloom-wave) rendered in buildSheet; q13_filmstrips PNGs refreshed. Quality 50/50, LA smoke 44/44, check_fast 10/10 PASS.
- 2026-11-26 - OpenCode/Big Pickle - Q-12: boss stomp ring + crown wobble + grumpyRespawn puff-in wired in renderer (renderer-only stomp cycle, dust ring, crown wobble, respawn scale). Quality 50/50, LA smoke 44/44, check_fast 10/10 PASS.
- 2026-11-26 - OpenCode/Big Pickle - Q-11: sword trail ribbon (6-segment ring buffer) added in renderer; reduced-motion gated. Quality 50/50, LA smoke 44/44, check_fast 10/10 PASS.
