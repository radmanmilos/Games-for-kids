# Old PROJECT_TASKS.md structure (verbatim)

The pre-refactor header, legend, phase note, History preamble, Appendix (Task 11 behaviour) and AI guidance. The phase note is stale (it names a roadmap that is finished).

## Header (lines 1-19)

# Project Tasks

Important: The AI assistant and any contributor must read this file first when starting work on the project. The AI should check task statuses here and continue the highest-priority task not marked DONE.

## Legend

- NEW — Task not started
- IN PROGRESS — Currently being worked on
- DONE — Completed
- REVERTED / FIXED / DEFERRED / ABANDONED — terminal states (per-entry note explains why)

## Phase note

**Phase 6 = Roadmap Cohesion** (2026-09-26, user decision): the `PETRIN_SVET_MASTER_EXECUTION_ROADMAP.md` is now the active product roadmap. The audit (`ROADMAP_AUDIT.md`) maps all 42 tasks to current code state. We work through Phase 1 (Product Cohesion) first, one task at a time: user approves → implement → user approves commit+sync → next task. Racing3D (Phase 5) is stable and awaiting user play-test feedback.

---

## Active tasks (NEW / IN PROGRESS)

## History preamble

## History (closed tasks, ordered by number)

## Appendix and guidance

## Appendix: Task 11 expected behavior

Animal Scene Puzzle must follow this interaction:

- Begin each round with a clickable animal scene in a natural setting, such as a playground, house, or savanna.
- When the scene is tapped, hide it and show a same-sized centered placeholder.
- Split the scene into puzzle pieces and scatter the pieces outside the placeholder.
- Let the child drag pieces into their correct positions with forgiving placement.
- Play a satisfying pop sound whenever a piece is placed correctly.
- When every piece is placed, play the celebration sound, show a celebration icon, and reveal a button for the next puzzle.
- Keep all scenes and assets offline and toddler-friendly.

---

## Guidance for AI assistants

- Always read this file before making changes.
- Update the status of a task when starting or completing it.
- Use brief notes when marking a task IN PROGRESS (who, date, short note).
- Keep this file minimal and machine-friendly.
