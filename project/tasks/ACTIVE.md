# Active tasks

Only **NEW / IN PROGRESS / DEFERRED** tasks live here (budget: 20 KB, checked by `node tools/check_docs.js`). Every finished task is in `archive/tasks/`, one line each in [`INDEX.md`](INDEX.md).

## Status legend

- NEW: not started
- IN PROGRESS: being worked on (say who/what model, and the date)
- DONE: completed (a dated note: who = tool + model, what, why)
- REVERTED / FIXED / DEFERRED / ABANDONED / RETIRED: terminal or parked (the note says why)

## How to work with this file

1. **Start:** add `- N. NEW — <title> (<date>, <tool/model>)` at the top of *Open tasks*. N = the "next task number" in `INDEX.md`. Flip it to IN PROGRESS when you start.
2. **Finish:** mark it DONE with a dated note: who (tool + model), what, why. Keep the entry short; put long reasoning in the entry only if a future session needs it.
3. **End of session:** run `node tools/archive_tasks.js`. It moves DONE / FIXED / REVERTED / ABANDONED / RETIRED entries to `archive/tasks/` and adds their `INDEX.md` lines. (`--dry-run` shows what would move.)
4. Do **not** copy the task into README, CONTRIBUTING or STATUS. `project/STATUS.md` is overwritten at session end instead.

## Open tasks

- 258. IN PROGRESS — UI consistency round 2: one nav-bubble size for back/next, bigger direction triangles, racing3D «Поени» removed (2026-10-19, OpenCode/Big Pickle)

  Play-test feedback (5 items, user): (1) the back button must be the SAME round bubble as the green „Следеће", sky-tinted and the same size; (2) racing3D: drop the «Поени N» HUD pill, keep only the icon pill (🌸 n/12); (3) in-game next buttons must use that one determined style (the puzzle one was a private yellow bubble); (4) tracing showed two back buttons at once — keep one, state-aware, one level up per tap (the classroom rule); (5) the direction triangle inside the action/steering buttons (explorer, fastcat, dino, racing3D and the rest of the family) is too small.

  What changed:
  - `design-tokens.css`: new `--ps-nav-size: clamp(var(--touch-comfort,56px), 9vmin, 84px)` — the ONE corner navigation size (56px phone / ~74px tablet-land).
  - `components.css`: `.ps-back` now takes `--ps-back-size: var(--ps-nav-size)` (the oversized `max(12vmin,44px)` bubble is retired; class name kept so the 27 adopted pages and the hub/parent smokes keep their contract). New `.ps-btn--nav` is the in-game next bubble at the same size. `.ps-btn--control .ps-tri` is sized as a FRACTION of the bubble (44% of the content box) instead of `.58em` of a 40px font — the triangle was ~21% of the button, now ~36-41% (23.9px→43.1px on tablet).
  - Next buttons moved to `.ps-btn--nav`: `#coloring-next`, `#tracingNext`, `#animalNext` (+ `#animalSpeak`, so the pair stays matched), `#countNext`, `#puzzleNext` (private yellow styling deleted).
  - tracing: the activity panel's second back button `#tracingBack` is removed; the single header `#tracing-back` is now state-aware via a capture-phase listener (activity → tracing hub → index), mirrored from classroom.
  - racing3D: `#r3d-score` (markup, CSS, `scoreEl` writes) removed; the flower pill moved into the freed top slot (17px) and the minimap up with it (62px; the short-landscape override stays 106px); the win modal now shows only «🌸 n/12» („Поени" gone there too).

  Validation: probe 844×390 + 1180×820 — back and next are both 56×56 / 73.8×73.8 on every page; triangle 23.9px/43.1px; racing3D has only the flower pill.

