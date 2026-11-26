# Cat Forest — Implementation Work Order and Acceptance Gates

**Status:** Proposed task sequence. Reconcile with current task board, branch, project process and explicit user approvals before starting. Do not create or mark tasks complete without following repository workflow.

## Phase 0 — Repository reconnaissance and baseline

### Objective
Establish the actual current state before touching code or assets.

### Required actions
- Read all applicable project instructions and Cat Forest specifications.
- Verify branch, commit, clean/dirty worktree and recent CI state.
- Inspect Cat Forest HTML, engine, data registries, art renderer, asset inventory, screenshot index, tests and visual-state definitions.
- Inspect the current game in a browser/device harness if available.
- Compare current runtime behaviour with the approved product spec and progress ledger.
- Create a feature-by-feature baseline report with evidence and confidence labels.

### Acceptance gate
- [ ] Actual branch, commit and worktree status recorded.
- [ ] Applicable project instructions read.
- [ ] Current source files and actual asset paths inspected.
- [ ] Current scene states and interactions verified or explicitly marked unverified.
- [ ] Existing failures and limitations recorded.
- [ ] Conflicts between approved product decisions and expansion proposal listed.
- [ ] No implementation changes made in this phase.

Stop if the tree is unexpectedly dirty, the branch is not the intended working branch, baseline checks fail, or approval is required for the proposed scope.

## Phase 1 — Product and scope decision checkpoint

### Objective
Separate approved work from proposed expansion.

### Required actions
- Compare each proposed mechanic with current `project/DECISIONS.md` and `project/games/cat-forest.md`.
- List any conflicts: finite fish/treat supplies, resource inventory, visible resource piles, wood gathering, crafting, decoration placement, new scenes, diary expansion, new art requirements or save schema changes.
- Ask the user to approve/reject each material product-direction change, preferably as a compact decision summary.
- Record only explicit decisions in the project decision log through the prescribed workflow.

### Acceptance gate
- [ ] Scope of the next implementation task is unambiguous.
- [ ] No conflicting mechanic is treated as approved by implication.
- [ ] Save-data impact is identified before changing persistence.
- [ ] The next task is bounded and has a task card/owner according to project process.

## Phase 2 — Art and runtime asset audit

### Objective
Find what artwork actually exists and what the game actually renders.

### Required actions
- Audit scene backgrounds, house/pond/woodland/workshop elements, cats, props, UI, icons and effects.
- For each asset record source, status, intended use, runtime path, registry key, dimensions, transparency, provenance/approval and visual QA status.
- Compare the asset inventory with actual files and actual runtime references.
- Identify duplicates, missing assets, obsolete files, mismatched styles and unused registered assets.
- Verify whether supplied style-reference images have been copied into a project reference folder; if not, do not invent repository paths or claim they are available locally.

### Acceptance gate
- [ ] Inventory is reconciled against disk and code.
- [ ] Every missing or uncertain item is marked accurately.
- [ ] Existing approved assets are preserved.
- [ ] A prioritized asset gap list is ready.

## Phase 3 — Visual system and scene prototype

### Objective
Prove a coherent art direction in one representative scene before expanding the style across every scene.

### Required actions
- Select the approved primary scene (normally the village/house hub if confirmed by current design decisions).
- Define composition, palette, perspective, light direction, scale, depth layers, object edge treatment and shadow rules.
- Use existing approved assets first; create new assets only through the approved pipeline and after required approval.
- Integrate a complete scene composition, not a collage of unrelated cut-outs.
- Keep interactive hit areas separate from artwork when appropriate.
- Confirm that the scene still works responsively and offline.

### Acceptance gate
- [ ] Primary scene has a coherent background and foreground composition.
- [ ] Cat art, environment, props and UI look like one world.
- [ ] CSS/emoji placeholders are either removed from the finished composition or explicitly documented as temporary approved fallbacks.
- [ ] Main interactions remain clear and functional.
- [ ] Screenshots at target viewports have been captured and reviewed.
- [ ] User visual approval obtained if required by the current project process.

Do not scale a flawed prototype into multiple scenes. Fix the visual language here first.

## Phase 4 — Village hub and feeding experience

### Objective
Deliver the approved village/house hub and feeding experience as one polished, understandable scene.

### Required actions
- Preserve the approved feeding model and existing save semantics unless a documented decision explicitly changes them.
- Make feeding positions and interactive areas visually obvious and comfortably tappable.
- Integrate cat arrival, eating, reactions and departure with restrained animation and clear feedback.
- Check idle, occupied, feeding, post-feeding and empty/default states.
- Ensure decoration and scenery do not obscure the feeding interaction.

### Acceptance gate
- [ ] Existing approved feeding loop remains intact.
- [ ] Every feeding state is visually clear.
- [ ] Cat art loads and scales correctly.
- [ ] No accidental resource shortage, counter or gate has been introduced.
- [ ] Touch and keyboard/test hooks remain functional as required by project architecture.
- [ ] Functional and visual tests pass.

## Phase 5 — Additional scenes (only if approved)

Implement each additional scene as a separate bounded task. Do not implement all scenes in one large, hard-to-review change.

Suggested order if approved by product decisions:
1. Pond / fishing.
2. Woodland / gathering.
3. Workshop / crafting.
4. Expanded diary and decoration placement.

For every scene:
- establish the scene composition and navigation;
- use the shared visual system without creating a shared runtime dependency unless separately approved;
- implement only approved mechanics;
- provide empty, active, success and return states as relevant;
- verify offline operation, save compatibility and reduced-motion behaviour;
- capture and review actual screenshots.

### Acceptance gate for each scene
- [ ] Scene has a complete, coherent composition.
- [ ] Entry, exit and return navigation work.
- [ ] No placeholder scene is represented as implemented.
- [ ] Every visible interactive object has a real action or is clearly decorative.
- [ ] All approved interactions are testable.
- [ ] Responsive and reduced-motion states are reviewed.
- [ ] Documentation and progress ledger reflect verified state.

## Phase 6 — Cross-scene consistency and polish

### Objective
Make the whole experience feel like one continuous world.

### Required actions
- Compare scene screenshots side by side.
- Normalize camera, horizon, ground plane, object scale, palette, light, shadows and transition behaviour.
- Audit every emoji, CSS-drawn illustration, placeholder icon, debug label and temporary fallback.
- Verify consistent navigation placement and feedback language.
- Check animation density and performance on modest Android hardware.

### Acceptance gate
- [ ] No unexplained visual-style mismatch remains.
- [ ] Scene transitions feel continuous and calm.
- [ ] Primary actions are easy to find in every scene.
- [ ] No decorative animation competes with the child’s task.
- [ ] Performance and reduced-motion checks are recorded.

## Phase 7 — Regression, accessibility and release readiness

### Required checks
Use the current repository's actual prescribed commands. The following are categories, not a guarantee that a particular command or script exists:

- targeted Cat Forest smoke tests;
- full project test runner where required;
- lint/build checks where configured;
- save migration and old-save compatibility tests;
- offline/no-network verification;
- responsive viewport screenshots;
- reduced-motion verification;
- asset path/load audit;
- console/runtime error inspection;
- documentation generation/sync verification.

Do not invent command names or report unrun checks. Discover exact commands from current package scripts, tool documentation and `AGENTS.md`.

### Acceptance gate
- [ ] All required checks actually run and results are recorded.
- [ ] Any failing or skipped check is disclosed.
- [ ] Current screenshots are reviewed and correctly indexed.
- [ ] Save compatibility is verified or migration is documented and tested.
- [ ] Offline operation is verified.
- [ ] Documentation mirrors are regenerated using the prescribed command.
- [ ] User approval is obtained where required.

## Per-task completion checklist

- [ ] Task was authorized and bounded.
- [ ] No unrelated changes were included.
- [ ] Diff was inspected.
- [ ] Asset files and runtime references were verified.
- [ ] Exact tests/checks and outcomes were recorded.
- [ ] Screenshots were captured and visually reviewed where UI changed.
- [ ] Project status, task board, progress and relevant design docs were updated accurately.
- [ ] No commit/push was made unless explicitly authorized by current instructions.
- [ ] Handoff report uses evidence-based status labels.

## Required handoff report

```text
Task:
Status:
Branch / commit:
Files changed:
Runtime behaviour changed:
Asset source -> runtime path -> registry -> visual verification:
Tests actually run (exact commands):
Results:
Screenshots captured / reviewed:
Save compatibility:
Offline / performance / reduced-motion checks:
Documentation updated:
Approval status:
Unresolved issues:
Next bounded task:
```
