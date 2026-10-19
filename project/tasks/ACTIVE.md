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

- 259. IN PROGRESS — Fix the malformed Material "refresh" SVG path in fastcat.html (pre-existing, found via the failed schedule Extended/WebKit matrix) (2026-10-19, OpenCode/Big Pickle)

  The path reads `s3.58 8 8c3.73`; a smooth-cubic `s` needs 4 numbers, and the canonical Material icon is `s3.58 8 8 8c3.73` — one `8` was lost. Result: `<path> attribute d: Expected number` in Chromium and WebKit `Problem parsing d=...`, i.e. the «Играј поново» icon is broken on WebKit (iPad/Safari). It only surfaces in the Extended job (schedule/workflow_dispatch), which is why it went unnoticed.
