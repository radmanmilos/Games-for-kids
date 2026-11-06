# Petrin svet — Visual/UX and Product Quality Continuation Plan

**Document status:** Proposed, evidence-based continuation plan  
**Created:** 2026-11-06  
**Repository baseline:** \`main\` at \`983f7b4a3cc4b16d41747614c3dc5b963c992c5f\`  
**Application version:** 3.0.1  
**Related completed review:** Task 382 — \`resources/General_reviews/VISUAL_UX_REVIEW_2026-11.md\`  
**Previous visual specification:** \`archive/plans/Petrin_svet_Master_Visual_UX_Implementation_Plan_2026-10-07.md\`  
**Broader audit directive:** \`resources/General_reviews/Petrin_Svet_Master_Project_Audit_and_Build_AI_Directive_2026-11-04.md\`

This document replaces neither the historical master specification nor the project process. It is the current continuation worklist, reconciled against the repository state observed on 2026-11-06.

---

## 1. Executive decision

The 2026-10-07 Master Visual/UX plan is **not an unimplemented backlog**. Its V0–V23 sequence is recorded as completed in Tasks 216–240. Later work refreshed the screenshot battery (Task 379), corrected the hub and short-landscape issues (Tasks 380–381), and performed the comprehensive visual review (Task 382).

The correct next step is therefore not to rerun V0–V23. It is to:

1. preserve the completed implementation history;
2. close the remaining screenshot evidence gap for the two internal child sub-hubs;
3. address the new, specifically evidenced Task 382 findings in small, independently reviewable tasks;
4. complete deferred real-device playtesting and deeper technical audits;
5. reconcile stale portfolio documentation against the live registry and current game-guide files.

The product target remains **coherent without becoming uniform**: a warm, familiar Petrin svet shell with distinct activity worlds, simple child navigation, generous touch targets, calm feedback, Serbian Cyrillic, offline-first operation and no advertising, tracking or monetization.

**This is a plan and task proposal, not approval to implement every item.** Runtime tasks remain NEW until explicitly selected and approved under \`AGENTS.md\` and \`project/PROCESS.md\`.

## 1.1 Historical project-source reconciliation

The user-provided \`Game Integration Strategy.txt\` is the project's early concept/architecture brief, not a current implementation checklist. Its enduring principles still align with the repository: young-child-first play, low-friction navigation, offline operation, large touch targets, shared navigation/audio/speech/utilities, vanilla web technologies, and a strict split between development resources and the deployable \`game/\` application.

Its specific proposal to embed a standalone Paper Kitty game as one \`#game-paperkitty\` screen in a single main-menu document is **superseded by the current architecture**. The current app has a central \`game/data/app-registry.js\`, registered page routes, \`game/pages/\`, \`game/games/\` and shared runtime modules. Historical task records also show the shared adventure engine and subsequent HUD integration work (Tasks 60, 79, 130 and 220). Therefore “integrate Paper Kitty” is not a new task to reopen. Verify the live registry and current game modules for any future adventure work.

The original brief's \`resources/\` development-workspace and \`game/\` deployable-output boundary remains current and is independently reflected in the repository's project architecture rules. Never make the runtime depend on files that exist only under \`resources/\`.

The user-provided \`Games for kids Review (1).txt\` describes why the 2026-10-07 master visual/UX plan was created and identifies it as the detailed implementation handoff. The repository copy of that plan is the specification being reconciled here; the task ledger, current code, current screenshots and current CI are the evidence for present status.

The user-provided \`PROJECT_RULE_EVIDENCE_AND_VERIFICATION(1).md\` is treated as a governing rule: report proposed, in-progress, committed, repository-verified, tested and approved as distinct states. This plan and its future tasks follow that distinction.

The user-provided \`Mandatory_Asset_Generation_Preflight_Rule(1).md\` is also governing. No new asset generation is proposed here. Any future art request must inspect the current repository's style bible, inventory and progress ledger, prove eligibility and approval, search for reusable assets and CSS/SVG alternatives, define the brief and inspect the actual output before claiming acceptance.

## 2. Verified repository baseline

### 2.1 Git and CI

- The GitHub API reports \`main\` at \`983f7b4a3cc4b16d41747614c3dc5b963c992c5f\` (PR #17).
- No open pull requests were returned by the repository PR search at investigation time.
- Latest main CI run: [CI #516 / run 42129112023](https://github.com/radmanmilos/Games-for-kids/actions/runs/42129112023), completed successfully.
- The run's **Fast gate**, CodeQL workflow, setup and Pages deployment succeeded.
- The Extended Chromium + WebKit device matrix and Release QA jobs were **skipped**. They must not be described as passing.
- The combined commit-status endpoint returned no status entries; the Actions run and its job results are the evidence used above.
- No local checkout, Node execution, browser automation, physical-device testing or child/family playtesting was performed as part of this remote repository investigation.

The November 4 master audit's red art-integrity run refers to an older commit and is not the current main state. Task 363 records the ffmpeg CI provisioning/diagnostics follow-up; the current Fast gate succeeded. Do not reopen that historical blocker without new failing evidence.

### 2.2 Task ledger

- \`project/tasks/INDEX.md\` ends at Task 382; the next available task number is **383**.
- \`project/tasks/ACTIVE.md\` has no open tasks on the baseline branch.
- Task 382's review report records 164 screenshots inspected: 108 default and 56 PLAY captures, across four viewport sizes.
- The two internal sub-hubs, \`#hub-games\` and \`#hub-learning\`, have no dedicated screenshots in the current battery. Their markup/CSS was source-reviewed only.
- The Classroom activity page is a separate page and is represented in the screenshot battery.

### 2.3 Documentation drift

This subsection is the 2026-11-06 investigation snapshot. Task 383 itself resolved both items: `project/STATUS.md` was refreshed and the GAME_MATRIX reconciliation is registered as Task 393.

\`project/STATUS.md\` is stale: it identifies \`36c51d063ab7ac3b15a1cca067cb99e933d38e44\` (PR #16) as main, while the verified main ref is \`983f7b4a3cc4b16d41747614c3dc5b963c992c5f\` (PR #17).

\`project/reference/GAME_MATRIX.md\` also needs reconciliation. Its table's Guide doc column marks fewer guides than the same file's “Guide docs present” list, and the live \`project/games/\` directory contains 16 guide files. The registry has 25 activity pages plus the parent surface. The matrix must be rebuilt from the current registry and actual file paths before its counts are relied upon.

## 3. Reconciliation of the 2026-10-07 V0–V23 plan

The historical task records explicitly close the visual plan's phases. “Completed” below means the phase has a completed task record; it does not mean its design goals can never need a new review. Task 382 is later evidence of newly observed issues, not proof that the old phase was never implemented.

| Master phase | Historical evidence | Current disposition |
|---|---|---|
| V0 — Screenshot/state infrastructure | Task 213; Task 216; Task 379 refreshed the stable battery and deterministic states | **Completed historically.** Extend coverage for the two missing internal sub-hubs in Task 384. |
| V1 — Animal Puzzle blocker | Task 216 records V1.1/V1.2 among completed phases | **Completed historically.** Do not resurrect without a current reproduction. No fresh runtime smoke was run in this investigation. |
| V2 — Shared child header | Task 216 records V2.1–V2.11 complete | **Completed historically.** Preserve shared shell contracts; investigate new page-specific issues rather than redoing the header pass. |
| V3 — Short-landscape pass | Tasks 217 and 219; Task 381 corrected title detection and adjudicated WARNs | **Completed historically.** Current audit evidence: 27 surfaces, 13 OK / 14 WARN / 0 FAIL. WARNs are not automatic defects. |
| V4 — Adventure HUD | Task 220 | **Completed historically.** |
| V5 — Learning stage grammar | Task 221; shared \`learning-stage.css\` exists | **Completed historically.** The classes are an opt-in layout vocabulary, not a forced visual skin. |
| V6 — Petrin Glow | Tasks 222–223 | **Completed historically.** Shared token and attention-state applications are recorded. |
| V7 — Tactile component system | Task 224; \`game/styles/components.css\` exists | **Completed historically.** Adoption is additive/opt-in; do not assume every page uses every component. |
| V8 — Animal visual consistency | Task 225 | **Completed historically.** Native emoji choice was settled at that time; later art pipeline work is separately recorded. |
| V9 — Maze | Task 226 | **Completed historically.** |
| V10 — Rhythm | Task 227 | **Completed historically.** |
| V11 — Animal Counting | Task 228 | **Completed historically.** Task 382 later raises a new composition observation; it is not a reason to repeat V11 wholesale. |
| V12 — Animal Memory | Task 229 | **Completed historically.** |
| V13 — Classroom hierarchy | Task 230 | **Completed historically.** The six category tabs in the activity view have a separate newly observed phone-width overflow issue (Task 385). |
| V14 — Coloring and Piano | Task 231 | **Completed historically.** Task 382's possible Coloring control crowding requires geometry verification before any change. |
| V15 — Sorting | Task 232 | **Completed historically.** |
| V16 — Sequencing | Task 233 | **Completed historically.** |
| V17 — Shapes | Task 234 | **Completed historically.** |
| V18 — Phonics | Task 235 | **Completed historically.** Task 382 identifies a distinct semantic feedback-colour issue (Task 386). |
| V19 — Parent visual system | Task 236 | **Completed historically.** |
| V20 — Hub visual review | Task 237; Task 380 separately repaired the learning tile | **Completed historically.** Task 384 addresses missing sub-hub screenshot evidence, not a hub redesign. |
| V21 — Semantic motion | Task 238 | **Completed historically.** Manual device/user validation remains a separate evidence need. |
| V22 — Icon system | Task 239 | **Completed historically.** Preserve game-specific world icon identity. |
| V23 — Final visual QA baseline | Task 240; later Task 379 battery refresh and Task 382 review | **Completed historically and subsequently refreshed.** Current review findings are tracked below. |

### 3.1 Other completed foundations that must not be reimplemented

- Task 255 established the shared tactile button system; Task 258 refined shared navigation bubble geometry.
- Task 250 addressed input/round lifecycle and drag cancellation in selected games/shared systems.
- Tasks 334–335 hardened service-worker response caching and install failure behaviour.
- Task 363 addressed the art-integrity CI environment failure.
- Tasks 365–373 recorded the service-worker/version, privacy, accessibility, structural game inventory, visual audit, reliability and documentation work.
- Tasks 358–362 and 341–352 record significant art migration, scene and classroom artwork work. These do not authorize further asset generation.

The November 4 master audit is a useful audit checklist, but its repository snapshot is older than current main. Its old P0 CI failure is superseded by the current CI evidence. Its deferred end-to-end, manual and playtesting work remains relevant only where the current task records and code still support that gap.

## 4. New findings from Task 382

These findings are based on the committed Task 382 report and current source inspection. They are proposals, not implementation approval.

| Priority | Finding | Evidence and current confidence | Next action |
|---|---|---|---|
| P1 | Classroom category tabs overflow on phone widths | PLAY screenshots show six tabs clipped and horizontal page scrolling. Current \`.class-tabs\` is an absolutely positioned flex row with no wrapping or bounded scroll region in \`game/pages/classroom.html\`. | Task 385: implement a bounded scroll rail with discoverable edge affordance or a deliberate two-row layout; preserve large targets and prevent page-level horizontal scroll. |
| P2 | Phonics retry message uses success green | All four PLAY captures show “Покушај поново” in green. Current wrong-answer branch in \`game/games/phonics.js\` changes the text but does not set a distinct feedback state; the page styles the feedback green by default. | Task 386: add an explicit gentle wrong/retry state; keep green for success and reset the state on the next round. |
| P2 / investigate | Coloring clear action appears crowded against the palette in phone landscape | Screenshot observation only. Current CSS comments say the clear action was moved into the tools row and wraps below the palette on narrow screens. A real intersection is **not yet established**. | Task 387: inspect current markup, layout and measured bounding boxes in free and guided modes before changing anything. |
| P2 / investigate | Cat Forest first feeding station appears crowded | All four deterministic PLAY captures show a cluster near the first plate. The screenshot alone does not prove this is a normal persistent gameplay state or a source defect. | Task 388: reproduce the exact seed/state and inspect normal play before changing actor positions or hit areas. |
| P2 | Animal Counting stage appears under-filled | PLAY screenshots show a large white stage and relatively small animal cards. Current short-height CSS already protects a 64px minimum answer target. | Task 389: test larger artwork/cards and stage balance; preserve quantity clarity and the 64px touch floor. |
| P3 | Spatial success feedback is close to answer controls in phone landscape | Screenshot observation; current feedback region has a minimum height but no explicit separation from the answer row. | Task 390: add a small responsive separation only if the collision/near-collision is reproduced. |
| P3 / playtest | Compare portrait composition is sparse | Screenshot observation, not a functional defect. | Task 391: defer scale changes until a child/device observation supports them. |
| Evidence gap | Games and Learning sub-hubs lack dedicated captures | \`game/index.html\` contains \`#hub-games\` and \`#hub-learning\`; the stable screenshot battery has no named captures for either state. | Task 384: add deterministic capture support and capture both sub-hubs at all four viewports before deciding whether visible captions are needed. |

### 4.1 What not to do

- Do not redesign the whole application or rerun all V0–V23 phases.
- Do not add captions to the Games/Learning sub-hubs before capturing and evaluating the actual four-viewport layouts.
- Do not reduce touch targets to solve whitespace or short-screen crowding.
- Do not make every game use identical backgrounds, cards or decorations.
- Do not change Cat Forest positions until the deterministic state and normal interaction are understood.
- Do not change Coloring geometry until overlap is measured.
- Do not add new artwork as a shortcut for layout/composition issues.
- Do not generate or integrate assets as part of this plan. If a later approved task genuinely requires an asset, follow the current asset-generation preflight, style bible, inventory and approval process first.

## 5. Cross-project work still requiring evidence

### 5.1 Portfolio playtesting

Task 382 explicitly says deterministic screenshot states are not hands-on playtests. No physical-device or child/family playtest was performed in that review. The repository's \`project/reference/PLAYTESTING.md\` defines four sessions:

- A — first-time toddler flow;
- B — five-game random walk;
- C — offline session after downloading the offline copy;
- D — parent handoff and parent controls.

Task 392 should record observations using the existing BLOCKER / MAJOR / MINOR / COSMETIC classifications. Do not claim child usability or device compatibility from screenshots alone.

### 5.2 Game-guide and game-by-game audit coverage

The live registry is authoritative for page identity and test associations. The current \`project/reference/GAME_MATRIX.md\` was created under Task 368 as a structural matrix, not a completed lifecycle/learning audit. Its Guide doc column conflicts with its own guide-file list and current \`project/games/\` directory.

The 16 guide files present at investigation time are:

- \`animals.md\`
- \`candy-match.md\`
- \`cat-forest.md\`
- \`classroom.md\`
- \`coloring.md\`
- \`counting.md\`
- \`dino.md\`
- \`driving.md\`
- \`fastcat.md\`
- \`little-explorer.md\`
- \`little-racer.md\`
- \`memory.md\`
- \`ocean.md\`
- \`puzzle.md\`
- \`shape-match.md\`
- \`space.md\`

The following registry concepts do not have a matching dedicated guide file under the current naming convention and need an explicit mapping/decision in Task 393: Compare, Sorting, Phonics, Sequencing, Rhythm, Spatial, Maze, Tracing, Piano and Parent. Some existing guide filenames intentionally use a different game ID (for example Counting, Memory, Puzzle, Shape Match and Candy Match); do not create duplicate guides without first reconciling those mappings.

Task 394 is the deeper per-game audit deferred by Task 368/371: lifecycle, state, input interruption, audio/speech, learning clarity, touch targets, responsive layout, performance and smoke coverage. Work in small game groups and use the live registry; do not claim all 26 surfaces audited after inspecting only the matrix.

### 5.3 Service-worker and offline recovery

Tasks 334–335 and 365–370 record meaningful fixes, including avoiding caching failed HTTP responses, making required install precaching fail safely, and correcting manifest/version cache policy. The November 4 audit still called for end-to-end lifecycle tests: A→B updates, multiple tabs, offline startup, interrupted install, quota/storage failures, removed assets and GitHub Pages subpath behaviour.

Task 395 is a **test-and-evidence task first**. Preserve the last known-good offline copy; do not weaken gates or change cache policy without a reproduced failure and a rollback argument.

### 5.4 Accessibility and input

Task 367 records an axe scan with zero violations across 27 surfaces. That is useful automated evidence, not proof of manual usability. Task 396 should cover keyboard/focus, target size, pointer capture/cancel, touch interruption, reduced-motion behaviour, feedback not relying on colour alone, and real-device operation. Respect the settled reduced-motion decisions in \`project/DECISIONS.md\`.

### 5.5 Learning quality and Serbian content

Task 397 should verify that each activity's actual content and spoken feedback remain age-appropriate, forgiving, understandable with little reading, and in Serbian Cyrillic/Serbian speech. Preserve locked curriculum decisions in \`project/DECISIONS.md\`; do not add new educational scope merely to fill a checklist.

### 5.6 Performance and resilience

Task 398 should measure representative activities on the intended modest Android tablet where possible. Prioritize observable frame/input responsiveness, memory growth, lifecycle cleanup, audio resilience and offline operation. Do not optimize from assumptions or introduce dependencies without need.

## 6. Ordered task plan

All task numbers below are reserved in \`project/tasks/ACTIVE.md\`. Task 383 (this documentation handoff) is DONE and archived. Tasks 384–398 are NEW proposals and require explicit selection/approval before implementation.

| Task | Priority | Scope | Dependency / acceptance |
|---:|---|---|---|
| 383 | P1 · documentation | Reconcile the historical master plan and publish this current continuation plan. | This document, task register and current status snapshot committed on a review branch. |
| 384 | P1 · evidence | Add deterministic screenshots for \`#hub-games\` and \`#hub-learning\`. | Four viewports each; stable TOC/provenance; inspect grid density, scrolling, focus and reachability. |
| 385 | P1 · child navigation | Fix Classroom category-tab overflow on phone widths. | All six tabs reachable; no page-level horizontal overflow; preserve targets; verify four viewports and keyboard focus. |
| 386 | P2 · feedback | Give Phonics retry feedback a distinct gentle semantic state. | Wrong/correct states visually distinct; no punitive red; state resets; test both outcomes at four viewports. |
| 387 | P2 · investigate | Measure Coloring clear-button/palette geometry. | Inspect free and guided modes at 844×390; change code only if an actual collision or unsafe proximity is confirmed. |
| 388 | P2 · investigate | Reproduce Cat Forest feeding-station clustering. | Record seed/state and normal-play result; preserve actor/treat hit areas; implement only if the issue is representative. |
| 389 | P2 · composition | Improve Animal Counting stage balance. | Larger/clearer animal targets where appropriate; quantity remains unambiguous; 64px answer-target floor preserved; four viewports. |
| 390 | P3 · spacing | Separate Spatial feedback from answer controls. | Confirm at 844×390; no overlap in correct/retry states; other viewports remain balanced. |
| 391 | P3 · playtest-gated | Assess Compare portrait scale. | No code change until child/device feedback shows the current sparse composition harms comprehension or engagement. |
| 392 | P1 · product evidence | Run portfolio playtesting Sessions A–D. | Real device where possible; record date/device/session/classification; no claims beyond observations actually made. |
| 393 | P1 · documentation truth | Reconcile GAME_MATRIX, registry, smoke/offline/screenshot flags and game-guide mappings. | Every registry row mapped to actual paths; discrepancies corrected; no duplicate guide docs. |
| 394 | P1 · functional audit | Complete phased per-game lifecycle/state/input/audio/learning/performance audit. | Use current code and live registry; record verified/suspected/not-present/already-fixed/playtest-needed per surface. |
| 395 | P1 · reliability | Verify service-worker update and offline recovery lifecycle end-to-end. | Exercise the matrix in §5.3; preserve old offline copy on failure; record exact tests/results. |
| 396 | P1 · accessibility | Complete manual accessibility and input-interruption checks. | Keyboard/focus, pointercancel, touch interruption, reduced motion, semantic feedback and target sizes documented. |
| 397 | P2 · learning quality | Audit learning quality, Serbian Cyrillic and speech/content integrity. | Respect locked curriculum decisions; findings tied to exact source/content and tested speech where possible. |
| 398 | P2 · resilience | Audit performance and resilience on representative modest Android hardware. | Measurements and device/browser context recorded; no speculative optimization. |

## 7. Dependencies and execution order

1. **Evidence before decisions:** Task 384 precedes any visible-caption decision for the two sub-hubs.
2. **Fix confirmed child-facing blockers first:** Tasks 385 and 386 are the clearest current code-backed visual/feedback tasks.
3. **Investigate before modifying:** Tasks 387 and 388 must establish reproducibility before code changes.
4. **Preserve mechanics:** Task 389 must protect the 64px touch floor; Task 390 must not crowd answer controls.
5. **Playtest before subjective polish:** Task 391 depends on Task 392 or equivalent direct child/device feedback.
6. **Audit foundations after the immediate visual batch:** Tasks 393–398 should be split into reviewable groups; do not combine them into one large refactor.

## 8. Definition of done for future implementation tasks

Every task must follow \`AGENTS.md\`, \`project/PROCESS.md\` and the relevant game guide/decision:

- verify current branch, commit and CI before starting;
- record the task as IN PROGRESS before implementation;
- inspect current code, tests, shared components and current screenshots;
- classify facts, hypotheses and playtest questions separately;
- make the smallest coherent change and preserve each game's identity;
- keep child-facing text Serbian Cyrillic and speech Serbian;
- preserve offline-first behaviour and child privacy;
- run the smallest relevant current tests, then escalate as required;
- for any screen change, refresh affected screenshots and per-file provenance in the stable \`Screenshot_Review\` folder;
- if \`game/\` changes, run \`tools/sync-docs.sh\`;
- at session end archive completed tasks, overwrite STATUS and run \`node tools/check_docs.js\`;
- report exact files, commits, tests, screenshots, approvals and limitations.

No task is complete merely because its code or documentation was written. Repository verification and named checks must support each completion claim.

## 9. Asset-generation boundary

No asset-generation task is created by this plan. Current Task 382 findings are layout, feedback, evidence or playtesting questions; none establishes a need for a new raster illustration.

If a later task proposes new artwork, it must first inspect the current:

- \`resources/General_reviews/Asset_Generation/STYLE_BIBLE.md\`
- \`resources/General_reviews/Asset_Generation/ASSET_INVENTORY.md\`
- \`resources/General_reviews/Asset_Generation/PROGRESS.md\`

Then it must verify eligibility, explicit approval, duplicates/reuse, CSS/SVG alternatives, reference selection and a precise brief. Stop if any critical answer is unknown. Generated output must be inspected and user-approved before production integration. Follow \`project/DECISIONS.md\` and the mandatory preflight; this plan itself does not approve any asset.

## 10. Investigation limitations

- Repository inspection was performed through GitHub's remote file and Actions APIs.
- No local commands were run: \`node tools/check_docs.js\`, \`node tools/check_fast.js\`, screenshot capture, smoke tests, Playwright, offline E2E and \`node tools/archive_tasks.js\` were not run in this environment.
- Current CI evidence is the successful main run #516; Extended and Release QA were skipped.
- The Task 382 report is the visual evidence source for its findings. Coloring and Cat Forest are explicitly investigation-first; screenshots do not establish bounding-box overlap or a persistent runtime defect.
- No physical device, child or family playtest was performed.
- The plan and task list are proposals; implementation approval remains per task.

---

**Guiding principle:** improve the experience the child actually encounters, not the number of roadmap boxes checked. Preserve the warmth and individuality of every activity while making navigation, feedback, touch and reliability feel like one carefully cared-for world.
