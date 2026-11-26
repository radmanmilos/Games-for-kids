# Cat Forest — Local AI Implementation Handoff

**Purpose:** Give a local coding AI a controlled, evidence-based brief for continuing the Cat Forest visual reconstruction and village expansion work.

**Repository:** `https://github.com/radmanmilos/Games-for-kids`

**Target game:** Cat Forest (`cat_forest`)

**Document status:** Implementation instructions and proposed work breakdown. This handoff does not itself prove that any code or asset exists, that a task is complete, or that a product decision has been approved.

---

## 1. Read these documents in order

1. `PROJECT_EVIDENCE_AND_VERIFICATION_RULES.md` — mandatory evidence, status, testing and approval rules.
2. Repository `AGENTS.md`, `project/PROCESS.md`, `project/DECISIONS.md`, `project/STATUS.md`, `project/tasks/ACTIVE.md`, and `project/games/cat-forest.md` — these are authoritative and must be read from the current checkout.
3. The Cat Forest package under `resources/General_reviews/Cat_Forest/`, especially `README.md`, `00_PRODUCT_SPEC.md`, `01_TECH_DESIGN.md`, `02_ROADMAP.md`, `03_TASKS.md`, `04_TEST_PLAN.md`, `05_DECISIONS_AND_RISKS.md`, `ART_DIRECTION.md`, `PHASE2_HANDOFF_PROMPT.md`, and `PROGRESS.md`, if present. Verify actual filenames; do not assume every listed file exists.
4. `02_VISUAL_RECONSTRUCTION_SPEC.md` — the visual and UX quality bar.
5. `03_IMPLEMENTATION_WORK_ORDER.md` — the task sequence and acceptance gates.
6. `04_CAT_FOREST_VILLAGE_EXPANSION_PLAN_REFERENCE.md` — detailed proposed product/technical plan. Treat it as a proposal/reference, not as authority to override current approved decisions.

If instructions conflict, follow the current repository's governing rules and approved decisions. Record the conflict; do not silently choose whichever document is easiest.

## 2. Mandatory first action: inspect, do not code

Before changing anything:

- Confirm repository root, current branch, current commit, and `git status --short`.
- Read all applicable `AGENTS.md` files from root to the target directories.
- Read the current project process and decision records.
- Inspect current Cat Forest source, HTML, art registry/renderer, asset inventory, screenshot index, smoke tests, visual-state configuration, and documentation sync tooling. Discover actual paths; do not assume paths from this handoff are current.
- Inspect the actual current diffs and recent commits. Do not treat this handoff's historical snapshot as current repository truth.
- Check current CI status if the repository workflow exposes it.
- Compare implementation with the current product specification and progress ledger.
- Produce a short verified baseline report before implementation.

Classify each relevant feature as one of: `present and verified`, `present but not verified`, `partially present`, `absent`, or `unknown`.

If the working tree is dirty, tests/CI are already failing, the branch is unexpected, or required instructions are missing, stop and report the issue before editing. Do not overwrite user changes.

## 3. What this handoff is trying to achieve

The immediate quality objective is to make Cat Forest feel like one coherent, original, cozy illustrated world rather than a mixture of painted cat cut-outs, CSS geometry, emoji scenery and disconnected screen treatments.

The intended direction is described in the supplied art-direction documentation and `02_VISUAL_RECONSTRUCTION_SPEC.md`:

- soft watercolor/gouache storybook illustration;
- warm, natural, muted woodland palette;
- consistent scale, perspective, light, texture, line/edge treatment and shadow language;
- readable silhouettes and clear interactive affordances for children aged roughly 2–6;
- large forgiving touch targets and low cognitive load;
- calm animation, gentle feedback, no punishment or time pressure;
- original Cat Forest identity, not a copy of another game.

The supplied watercolor platformer/woodland images are style references only unless the user separately approves specific images for direct use. Do not cut out, trace, or repurpose their characters or objects as Cat Forest assets without explicit approval and appropriate rights.

## 4. Product approval gate — do not skip

The detailed expansion plan proposes changes to the established Cat Forest product: a village hub, pond fishing, woodland wood gathering, resource storage, workshop crafting, decoration placement and an expanded diary. The plan itself records conflicts with earlier approved rules (including free/unlimited treats, no inventory/economy, no crafting, one forest feeding scene and emoji-only/no-new-art direction).

**The user asking for implementation instructions is not, by itself, evidence that every conflicting product change has been approved.**

Therefore:

- First identify which changes are already explicitly approved in current `project/DECISIONS.md` or a clear user instruction.
- Implement only changes supported by current approval.
- For any material conflict or new mechanic, present a concise decision request and wait for explicit approval.
- Do not implement finite food, resource inventories, crafting, resource gates, new progression or other conflicting mechanics merely because they appear in the expansion-plan reference.
- Visual integration of already approved assets and correction of inconsistent presentation may proceed only within the current approved product direction.

Record approvals with date and scope in the proper decision log using the repository's process.

## 5. Scope boundaries

- Keep the task bounded. One task card/session at a time.
- Prefer Cat Forest-local changes. Do not modify shared runtime code (`game/shared/`) unless the current task explicitly authorizes a separately reviewed shared change.
- Runtime dependencies and assets must be packaged under `game/`; runtime must not load files from `resources/` or `tools/`.
- Keep the game offline. No runtime network calls, remote assets, analytics, tracking, ads or purchases.
- Do not manually edit generated documentation mirrors. Use the repository-prescribed sync command.
- Preserve existing saves and backward compatibility. Any save migration requires explicit tests and a documented migration strategy.
- Do not add text-dependent instructions to child-facing gameplay. Child-facing text and speech follow the project's Serbian Cyrillic/Serbian speech requirements.
- Do not add timers, countdowns, pressure, failure states, punitive feedback or mandatory dragging.

## 6. Art pipeline rules

Before generating or integrating an asset:

1. Inspect the current art direction and asset inventory.
2. Check whether an equivalent approved asset already exists.
3. Confirm the required asset type, dimensions, transparency/background treatment, naming convention, destination, licensing/provenance and runtime use.
4. Use the repository's established generation, conversion, optimization and registration pipeline.
5. Update the inventory with factual status: prompt/spec drafted, generated, selected, QA checked, approved, installed in runtime, registered and visually verified are separate states.
6. Confirm that the asset is actually loaded by the game. A file in `resources/` or an inventory row is not proof of runtime integration.
7. Capture screenshots and inspect the rendered result at target viewport sizes.

Do not replace a missing asset with emoji or CSS geometry without documenting the temporary fallback and its visual impact. Do not claim a painted asset is integrated merely because it is registered or present on disk.

## 7. Required task loop

For each bounded task:

1. Read task card and relevant source files.
2. State the intended change and files likely affected.
3. Implement the smallest coherent change.
4. Run targeted tests, then relevant regression checks.
5. Inspect actual diffs and verify runtime asset paths.
6. Capture screenshots for the affected states and review them visually.
7. Update task/progress/status documentation through the prescribed workflow.
8. Report changed files, evidence, exact checks/results, approval status and remaining work.

Do not proceed to the next phase if the current phase's acceptance criteria fail.

## 8. Required final report format

```text
Task:
Status: proposed / in progress / completed locally / committed / verified / blocked
Branch and commit inspected:
Files changed:
Behaviour changed:
Assets generated / approved / installed / registered / visually verified:
Tests and commands actually run:
Results (including failures):
Screenshots captured and reviewed:
Save compatibility / migration:
Offline and performance checks:
Documentation updated:
Approval required / obtained:
Known limitations:
Next bounded task:
```

Never say `done`, `tested`, `approved`, `committed` or `verified` unless the evidence supports that exact status.

## 9. Definition of success

The work is successful only when the result is coherent in the actual running game, not merely in an asset sheet or source code:

- scenes share one recognizable art direction and visual language;
- cats, props, backgrounds, UI and interaction states feel as if they belong to the same world;
- the child can immediately understand where to tap and what happened;
- the experience remains gentle, readable, responsive and usable offline;
- the existing approved Cat Forest loop and save data remain intact unless a change was explicitly approved;
- relevant functional, accessibility, performance and visual checks have actually been run and documented.
