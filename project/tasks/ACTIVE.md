# Active tasks

Only **NEW / IN PROGRESS / DEFERRED** tasks live here (budget: 20 KB, checked by \`node tools/check_docs.js\`). Every finished task is in \`archive/tasks/\`, one line each in \`INDEX.md\`.

## Status legend

- NEW: not started
- IN PROGRESS: being worked on (say who/what model, and the date)
- DONE: completed (a dated note: who (tool + model), what, why)
- REVERTED / FIXED / DEFERRED / ABANDONED / RETIRED: terminal or parked (the note says why)

## How to work with this file

1. **Start:** add \`- N. NEW — <title> (<date>, <tool/model>)\` at the top of *Open tasks*. N = the "next task number" in \`INDEX.md\`. Flip it to IN PROGRESS when you start.
2. **Finish:** mark it DONE with a dated note: who (tool + model), what, why. Keep the entry short; put long reasoning in the entry only if a future session needs it.
3. **End of session:** run \`node tools/archive_tasks.js\`. It moves DONE / FIXED / REVERTED / ABANDONED / RETIRED entries to \`archive/tasks/\` and adds their \`INDEX.md\` lines. (\`--dry-run\` shows what would move.)
4. Do **not** copy the task into README, CONTRIBUTING or STATUS. \`project/STATUS.md\` is overwritten at session end instead.

## Open tasks

- 399. IN PROGRESS — Reconcile project status and art inventory against verified main, current CI, asset registry, and actual asset files. Docs-only; no runtime or asset changes. (2026-11-06, ChatGPT/GPT-6)

- 391. ASSESSED (limited) — Compare portrait scale measured at all four viewports (groups 138×129px on 390x844 phone-portrait; tablet-portrait groups end at y=706 of 1180). Confirms the P3 review finding (sparse central cluster, large unused vertical bands, not a blocker). No code change: task 391 requires child/device feedback before any subjective composition change, which is outside this session; reported as limited, never claimed. 8 review screenshots captured; compare_smoke.js 29 pass / 0 fail. (2026-11-06, OpenCode/Big Pickle)
- 392. LIMITED — Portfolio playtesting Sessions A–D require a real device (tablet, portrait/landscape); not performed in this session. Automated foundation verified: `tools/offline_smoke.mjs` (Session C's twin) → 25/25 games load/play/return, no runtime errors; `node tools/check_release.js` → release gate green. Sessions A (first-time toddler flow), B (five-game random walk), D (parent handoff) unperformed until a real device + child/family observer available; observations logged per `project/reference/PLAYTESTING.md` template (BLOCKER/MAJOR/MINOR/COSMETIC). (2026-11-06, OpenCode/Big Pickle)
- 396. LIMITED — Manual accessibility and input-interruption checks require a real device (focus order, keyboard, pointercancel on real touch, reduced motion, semantic feedback). Automated portions verified: `node tools/axe_check.js` → 0 violations across all pages (contrast, names, roles); `touch_interruption_a-d_smoke.js` → 156 pass / 0 fail (pointercancel/touch interruption); reduced-motion respected in code per `project/lessons/game-runtime.md`. Real-device manual checks (focus, keyboard, pointercancel, touch, reduced motion, semantic feedback) unperformed — reported as limited, never claimed complete. (2026-11-06, OpenCode/Big Pickle)
- 398. LIMITED — Measure performance and resilience on representative modest Android hardware: requires a real device (FPS, memory, load time). Verifiable without device: no runtime errors across all smoke tests; offline resilience (25/25 games load/play/return offline); check_fast 10/10; check_release green; racing3d has frame-time instrumentation (PERF_WINDOW=120, perfSample) but SKIPs on headless hosts lacking WebGL. Actual modest-Android performance measurement unperformed — reported as limited, never claimed complete. (2026-11-06, OpenCode/Big Pickle)
