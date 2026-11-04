# Active tasks

Only **NEW / IN PROGRESS / DEFERRED** tasks live here (budget: 20 KB, checked by `node tools/check_docs.js`). Every finished task is in `archive/tasks/`, one line each in [`INDEX.md`](INDEX.md).

## Status legend

- NEW: not started
- IN PROGRESS: being worked on (say who/what model, and the date)
- DONE: completed (a dated note: who (tool + model), what, why)
- REVERTED / FIXED / DEFERRED / ABANDONED / RETIRED: terminal or parked (the note says why)

## How to work with this file

1. **Start:** add `- N. NEW — <title> (<date>, <tool/model>)` at the top of *Open tasks*. N = the "next task number" in `INDEX.md`. Flip it to IN PROGRESS when you start.
2. **Finish:** mark it DONE with a dated note: who (tool + model), what, why. Keep the entry short; put long reasoning in the entry only if a future session needs it.
3. **End of session:** run `node tools/archive_tasks.js`. It moves DONE / FIXED / REVERTED / ABANDONED / RETIRED entries to `archive/tasks/` and adds their `INDEX.md` lines. (`--dry-run` shows what would move.)
4. Do **not** copy the task into README, CONTRIBUTING or STATUS. `project/STATUS.md` is overwritten at session end instead.

## Open tasks

- 362. NEW — Remaining unmapped child-facing glyphs: generate or accept (2026-11-04, OpenCode/Big Pickle)
  - Still no art and not deliberately excluded: `🌀` (space), `🌌` (space + racing night world), `☃️` (racing snow world), `❤️` (cat-forest match effect), `😉` (candy). Audio/UI glyphs (`🔊 🔇 🎵 🎹 🔒 📊 📥 🔄 🗑 ⬆`) and the documented exclusions (`⬛ 📖 ✖️`) stay emoji.
  - Generate the five through the pipeline, or record an explicit "accepted emoji" decision in `project/DECISIONS.md` for any the user declines.
  - Done when: `tools/check_art.js` (360) reports zero unmapped child-facing glyphs, each outcome is documented.

- 328. DEFERRED — T328 (user input needed): migrate hub/nav tile icons and shell-chrome glyphs (back buttons, parent/progress controls, mode buttons' leading emoji) to painted art. Parked: DECISIONS.md line 16 settles native emoji animals; hub tiles and chrome are composite/branding surfaces, not play-screen artwork. Needs user decision on whether painted icons are wanted there. (2026-11-01, OpenCode/Big Pickle)
