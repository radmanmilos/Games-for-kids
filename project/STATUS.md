# Petrin svet — Status

*Overwritten 2026-11-06. App version: 3.0.7. Repository: https://github.com/radmanmilos/Games-for-kids.*

**Main baseline:** `a11c919ab52e945184183e5554f579a53f478435` (short SHA `a11c919`), the merge commit for PR #20.

## Current repository and CI state

- Default branch: `main`; PR #20 merged successfully into this baseline.
- PR #20 validation on its head commit: Fast gate and CodeQL succeeded; Extended matrix, smoke matrix, and Release QA were skipped. [PR workflow](https://github.com/radmanmilos/Games-for-kids/actions/runs/42280008388).
- The post-merge main CI run was still in progress when this snapshot was prepared; its final result must be checked before claiming main CI is green.
- Task 399 is complete and archived. PR #20 changed documentation only; no runtime code or assets changed.

## Current project state

Completed and archived on the verified main baseline:

- **383** — Reconciled the completed visual/UX master plan and published the verified continuation plan.
- **384–390** — Added Games/Learning sub-hub screenshot coverage and addressed the verified Classroom, Phonics, Coloring, Cat Forest, Animal Counting, and Spatial findings. Screenshot updates are recorded in the task archive.
- **393** — Reconciled GAME_MATRIX with the live registry, smoke/offline/screenshot flags, and game-guide mappings.
- **394** — Completed the phased game-by-game lifecycle/state/input/audio/learning/performance audit.
- **395** — Recorded service-worker update and offline-recovery verification.
- **397** — Audited child-facing Serbian Cyrillic text, Serbian speech, and learning content.

Still open and correctly limited pending real-device or child/family evidence:

- **391 — LIMITED:** Compare portrait composition was measured; a subjective layout change awaits child/device feedback.
- **392 — LIMITED:** Portfolio playtesting Sessions A–D require a real device and child/family observer. Automated evidence is recorded in the task archive, but the real-device sessions remain unperformed.
- **396 — LIMITED:** Manual accessibility and input-interruption checks on actual devices remain outstanding.
- **398 — LIMITED:** Performance and resilience measurements on representative modest Android hardware remain outstanding.

Do not mark these four tasks complete without the missing real-world evidence.

## Art inventory

`resources/General_reviews/ART_INVENTORY.md` was reconciled in Task 399 against the current runtime, registry, and asset tree:

- Cat Forest's cuddle heart is registered as `object-heart` and the painted `game/assets/art/object-heart.webp` exists.
- Classroom sunrise and sunset use existing full-bleed `sunrise.png` and `sunset.png` scene assets via `SCENE_IMAGES`; they are not missing standalone emoji illustrations.
- The previous `🙀` entry is stale; it does not appear in the searched game source.
- Spatial scene parts already use `Art.fill(item, part.emoji)`; no Spatial art-rendering upgrade is outstanding.

## Project invariants

- `game/` is the deployable source of truth; `docs/` is its generated mirror.
- `resources/` contains review/development material; `tools/` contains validation tooling.
- Preserve Serbian Cyrillic child-facing text, Serbian speech, offline-first operation, child privacy, and each game's distinct identity.
- No ads, tracking, analytics, monetization, accounts, or mandatory network dependency.
- Never claim manual child/family playtesting without evidence.

## Verification limits

This status snapshot was checked against GitHub repository, branch, file, commit, and Actions data. No local checkout was available to this assistant, so `git status --short`, local task archival, `node tools/check_docs.js`, and other local scripts were not run here. The current main CI result above is the verified CI evidence; skipped jobs remain unverified.

## Task tracking

Task 399 is archived in `archive/tasks/tasks-300-399.md`; the next task number is 400. The repository's local `node tools/archive_tasks.js` and `node tools/check_docs.js` commands were not run in this environment; the task archive/index were updated to the script's documented format, but those local checks remain unverified.
