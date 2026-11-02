from pathlib import Path

content = r"""# Build AI Implementation Instructions — Code Review Remediation

**Project:** Petrin svet / Games-for-kids  
**Purpose:** Give the build AI a controlled, testable plan for addressing the code-review findings.  
**Priority:** Reliability of offline startup and updates first, then accessibility, date handling, and test hardening.

> **Important status note:** These are implementation instructions based on a repository-level static review, not proof that every finding is still present in the current checkout. The review inspected commit `52927bb50fcf56e1fef6cb46895f698daedc1a45`. Before changing code, inspect the current branch, HEAD commit, working tree, and the exact current versions of every referenced file. Findings may have been fixed or changed since that review. Do not reintroduce older problems.

---

## 1. Mandatory operating rules

1. **Verify before claiming.** Inspect the current repository and exact code before editing. Do not assume a finding still exists because it appears in this document.
2. **Preserve user changes.** Check `git status` before work. Never overwrite, reset, clean, or revert unrelated user changes. Do not use destructive Git commands.
3. **Use the existing architecture.** Keep the app vanilla HTML/CSS/JavaScript and preserve the current registry, navigation, artwork, offline inventory, and test architecture unless a demonstrated defect requires a change.
4. **Keep runtime boundaries clean.**
   - `game/` must remain independently playable and contain only runtime files/assets required by the application.
   - Put development notes, temporary fixtures, investigation output, and non-runtime assets under the appropriate `resources/` location.
   - Do not make the application depend on anything in `resources/`.
5. **Offline-first is mandatory.** Do not introduce required network services, remote runtime assets, APIs, telemetry, analytics, advertisements, or monetization.
6. **No speculative rewrites.** Make the smallest robust change that addresses the verified defect. Do not refactor unrelated games or redesign shared systems as part of this remediation.
7. **Tests must be real.** Run the repository's existing relevant checks and new regression tests. Report exact commands and outcomes. Do not report a test as passing if it was not run.
8. **Keep generated outputs consistent.** Determine whether `docs/` is a generated mirror of `game/` in the current repository. If so, use the documented sync workflow instead of manually editing generated copies, then verify the source and mirror are in sync.
9. **No silent scope expansion.** If a change requires a design decision, has a broad compatibility impact, or cannot be safely verified, stop and report the blocker rather than guessing.
10. **No premature completion claims.** Distinguish: inspected, changed locally, tests run, committed, CI verified, and manually playtested. Only claim the statuses supported by evidence.

## 2. Start-of-task preflight — required before editing

1. Inspect:
   - current branch and HEAD commit;
   - `git status --short`;
   - `AGENTS.md`, `README.md`, `project/PROCESS.md`, `project/DECISIONS.md`, `project/STATUS.md`, and `project/tasks/ACTIVE.md` if present;
   - `.github/workflows/ci.yml` and the relevant scripts under `tools/`.
2. Read the current contents of the files named in each task below. Confirm the relevant behavior still exists.
3. Check whether there are already regression tests for the behavior. Extend existing tests rather than creating duplicate frameworks.
4. Record the initial state and any unrelated modifications. Do not include unrelated files in the patch.
5. If a referenced file/path no longer exists, locate the current equivalent through repository search and document the mapping. Do not create a new file merely because this plan mentions an old path.

## 3. Implementation order

Work in the order below. Complete and verify each phase before starting the next. Keep each phase as a small, reviewable change where possible.

---

# Phase A — Make service-worker installation fail safely

**Priority:** P1 / highest  
**Review locations:** `game/sw.js`; inspect related offline inventory/build scripts and existing service-worker tests before editing.

### Risk to address

The reviewed version appeared to catch failures while fetching the offline cache list or precaching required assets, but continue toward `skipWaiting()`. The activation handler also appeared to delete older `petrin-*` caches. If this behavior still exists, a failed installation could activate an incomplete worker and remove the previous working offline cache.

This is a risk identified by static inspection; it was **not reproduced in a browser during the review**. Verify the current code path first.

### Required behavior

- A new worker must not be considered installable if any **required** offline manifest/list or required precache asset fails.
- Do not swallow required precache failures and then proceed as if installation succeeded.
- Failed installation must not activate the incomplete worker.
- The previously active worker and its usable cache must remain available if the new worker fails to install.
- Do not delete the previous working cache during the new worker's install phase.
- During activation, delete only caches that are positively identified as obsolete and owned by this application. Preserve unrelated caches and any cache still required for rollback/continued operation.
- Keep the existing cache naming conventions and offline inventory mechanism where practical; do not invent a second cache-management system.
- Preserve the app's ability to recover and retry after a transient network failure.
- Ensure any intentional optional assets are clearly distinguished from required assets. Do not silently downgrade required assets to optional merely to make installation pass.

### Regression coverage required

Add or extend tests using the repository's existing service-worker test conventions. Cover at least:

1. All required assets succeed: the new worker can install normally.
2. The offline cache list fails: installation fails safely.
3. One required precache asset returns a network error: installation fails safely.
4. One required asset returns a non-success HTTP response: installation fails safely.
5. A previous working cache exists and the new install fails: the previous cache is not deleted.
6. A later retry with assets available can install successfully.
7. Activation cleanup deletes only obsolete app-owned caches and preserves unrelated caches.

If a browser-level test is supported by the repository, exercise the real service-worker lifecycle. If only a mocked/unit-level test is feasible, state that limitation explicitly and do not describe it as a browser reproduction.

### Acceptance criteria

- Required installation failures reject/abort installation instead of being treated as success.
- The old working offline version is preserved when installation fails.
- Successful installation and activation still work.
- Existing offline and release checks pass.
- No cache cleanup is broadened beyond the app's own obsolete caches.

---

# Phase B — Make application-version discovery reliable

**Priority:** P2  
**Review locations:** `game/shared/navigation.js`, `game/sw.js`, `game/manifest.json`; also inspect offline manifest generation and update tests.

### Risk to address

The reviewed version appeared to fetch the application manifest without a cache-bypass option, while the service worker used cache-first handling for the manifest. The manifest version was then used to form a service-worker registration URL. A stale manifest could therefore interfere with intended version discovery/cache rotation. This does **not** prove all updates fail: the browser may independently update the service-worker script and installation may refresh assets.

Verify the current request/cache flow before changing it.

### Required behavior

- Define one clear, documented source for the application version and how it maps to the service-worker/cache version.
- When the app needs the current version to decide whether to register/update the worker, ensure that it does not unknowingly read a stale cached manifest.
- Use a cache policy appropriate for version discovery (for example, a deliberate network revalidation or no-store request) and verify that the service worker does not defeat the intended policy.
- Preserve offline startup: if the network is unavailable, version discovery must fail gracefully and must not prevent an already-installed app from opening offline.
- Do not add query parameters or version tokens in a way that causes unbounded cache growth.
- Keep the registration URL, manifest version, cache names, and generated offline inventory consistent.
- Avoid changing version semantics without checking `project/DECISIONS.md` and existing release tooling.

### Regression coverage required

Add or extend an update smoke test (review mentioned `tools/sw_update_smoke.js`; confirm it is still the correct test) for:

1. Version A is installed and controls the page.
2. The deployed app manifest changes to version B.
3. The page discovers version B rather than reusing a stale manifest.
4. Version B's worker installs and activates only after required precaching succeeds.
5. If the update fails, version A remains usable.
6. Offline launch still works when the version check cannot reach the network.
7. Repeated checks do not create unbounded duplicate caches.

### Acceptance criteria

- Version discovery is deterministic and compatible with offline startup.
- Cache rotation is driven by the intended current version.
- Failed updates do not destroy the previous working version.
- Existing update/offline tests pass and the new scenarios are covered.

---

# Phase C — Never cache failed HTTP responses as successful assets

**Priority:** P2  
**Review location:** `game/sw.js`; inspect existing cache-first/network-first policies before editing.

### Risk to address

The reviewed fetch handler appeared to put a network response into cache without first checking whether it was successful. If still present, a 404/500 response could be cached and then served repeatedly instead of allowing the resource to recover.

### Required behavior

- Do not replace a known-good cached resource with a failed network response.
- For cacheable static resources, cache only responses allowed by the existing app's caching policy and with an appropriate successful status.
- Handle opaque responses deliberately if the app has any legitimate cross-origin use case. Do not add broad opaque-response caching without evidence that it is required.
- Do not cache error responses simply because `fetch()` resolved; HTTP error responses resolve normally.
- Preserve existing offline fallbacks and ensure network errors do not cause unhandled promise rejections.
- Do not cache HTML/error responses as static assets unless an explicit, tested policy requires it.

### Regression coverage required

1. A successful resource is cached and served as expected.
2. A request returns 404 and the 404 is not stored as a valid asset.
3. A request returns 500 and the 500 is not stored as a valid asset.
4. A resource that initially fails later becomes available and can be fetched/cached successfully.
5. A previously cached good response remains usable if a refresh attempt fails.
6. Existing navigation and offline fallback behavior remains intact.

### Acceptance criteria

- Failed HTTP responses cannot poison the static-asset cache.
- Existing cache strategies remain intentional and documented.
- Offline and release validation pass.

---

# Phase D — Keyboard accessibility for custom adventure controls

**Priority:** P2  
**Review locations:** `game/pages/dino.html` and related driving/ocean/space adventure pages; search current code for elements using `role="button"`.

### Risk to address

The reviewed adventure controls appeared to use `<div role="button">` without a visible `tabindex`. A `div` is not keyboard-focusable by default, and adding `role="button"` alone does not make it keyboard operable. Confirm which controls are still affected.

### Required behavior

- Prefer native `<button type="button">` controls where feasible. Preserve the established visual styling and touch target size.
- If a non-button element must remain interactive, ensure it is focusable, exposes a meaningful accessible name and state, and responds correctly to keyboard activation (`Enter` and `Space`) without double-triggering.
- Keep touch and pointer interactions working.
- Provide visible focus styling that fits the design system and is not removed without an equivalent.
- Ensure decorative graphics do not become unnecessary screen-reader stops.
- Respect reduced-motion preferences for any focus/activation animations.
- Do not use this task as a reason to homogenize game-specific controls or alter their gameplay.

### Regression coverage required

- Add or extend accessibility checks to detect custom button-like elements without keyboard access.
- Test focus order and visible focus for affected controls.
- Test activation by keyboard and touch.
- Run the repository's existing accessibility scan, if available, and report its actual output.
- If automated tests cannot prove interaction behavior, record the manual keyboard check as not performed rather than assuming success.

### Acceptance criteria

- Every interactive control in scope is keyboard reachable and operable.
- Touch behavior and game layout remain correct.
- No new serious/critical accessibility violations are introduced.

---

# Phase E — Use the correct calendar date for progress tracking

**Priority:** P3  
**Review location:** `game/shared/main.js`, specifically the current `PetrinProgress.visit()` implementation, if it still exists there.

### Risk to address

The reviewed code appeared to use `new Date().toISOString().slice(0, 10)` for `firstSeen`/`lastSeen`. `toISOString()` uses UTC, which can produce a different calendar date from the device's local date near midnight. Confirm the actual product meaning of these fields before changing them.

### Required behavior

- If these fields are intended to represent the date experienced by the child/parent on the device, use a local-calendar date representation.
- Keep the stored format stable (if currently `YYYY-MM-DD`) to avoid breaking existing progress data.
- Do not rewrite or discard existing local-storage records.
- If the project intentionally defines these fields as UTC dates, retain UTC and document that decision instead of changing behavior speculatively.
- Handle malformed or unexpected stored data safely without making the app fail to start.

### Regression coverage required

- Test dates around local midnight in a timezone offset from UTC.
- Test that existing `YYYY-MM-DD` progress values remain readable.
- Test malformed storage data and expected recovery behavior.
- Verify `firstSeen` is not overwritten incorrectly and `lastSeen` updates according to the intended rule.

### Acceptance criteria

- Date semantics are explicit and tested.
- Existing saved progress remains compatible.
- No unrelated progress behavior changes.

---

# Phase F — Harden test isolation and release verification

**Priority:** P2 for test reliability  
**Review locations:** `tools/guards/registry_guards_negtest.js`, `tools/guards/route_contract_negtest.js`, `tools/guards/games_map_negtest.js`, and the current CI/release scripts. Confirm these paths still exist.

### Required behavior

- Review any negative tests that mutate tracked files and restore them.
- Prefer temporary copies, temporary directories, or isolated worktrees where compatible with the existing test harness.
- If in-place mutation is unavoidable, guarantee restoration with `try/finally` or the equivalent, including when an assertion or subprocess fails.
- Never allow a test to overwrite pre-existing user edits.
- Ensure test cleanup only removes files/directories created by that test.
- Preserve clear, actionable failure messages.
- Avoid duplicating checks already performed by the current CI pipeline.

### Required verification

- Run each relevant negative test.
- Confirm the working tree is unchanged after the tests, apart from intended implementation files.
- Run the documented fast checks and release checks as available.
- If a test intentionally leaves generated artifacts, document and verify the expected cleanup behavior.

### Acceptance criteria

- A failing negative test cannot silently leave the checkout corrupted.
- Existing user changes are preserved.
- CI scripts and test commands are documented accurately.

---

## 4. Defensive review item — local-storage schema validation

**Priority:** Investigate only; do not change without confirming the current implementation.

The review noted that JSON parsing may be guarded while the parsed value's shape/types are not fully validated. Inspect current progress persistence and its callers. If malformed-but-valid JSON can cause runtime exceptions or corrupt progress, add narrow validation/defaulting that preserves compatible data. Add tests for `null`, arrays, unexpected primitive values, missing fields, and invalid field types. Do not reset all saved progress just because one field is malformed.

This item is not a confirmed defect until the current code path is inspected and a failing case is demonstrated.

---

## 5. Explicitly out of scope

Unless a verified dependency makes it unavoidable, do **not**:

- Rewrite the service-worker architecture or replace the app's offline system.
- Replace the central game registry or shared navigation system.
- Refactor all mini-games.
- Change artwork, visual design, game balance, level counts, or game content as part of this code-remediation task.
- Change the app version or release metadata arbitrarily.
- Delete old caches indiscriminately.
- Introduce external runtime dependencies.
- Modify `docs/` by hand if it is generated from `game/`.
- Claim that all games were manually tested when only automated checks were run.
- Treat historical findings as verified current defects without checking the current code.

---

## 6. Required test and verification workflow

Discover the current supported commands from `tools/README.md`, `package.json` (if present), `AGENTS.md`, and CI configuration. Do not assume script names or package managers without checking.

At minimum, run the applicable existing checks for:

1. Fast/static checks.
2. Release checks.
3. Page/route validation.
4. Offline inventory validation.
5. Offline browser/smoke test, if the environment supports it.
6. Service-worker update tests.
7. Accessibility tests for the controls in scope.
8. Any new targeted regression tests added by this work.

Use the documented commands and report their exact names. If a command cannot run because dependencies, browser support, permissions, or network access are missing, report it as **not run** with the reason. Do not replace a failed test with a claim of success.

After tests:

- Check `git diff --check`.
- Review the full diff for unrelated changes and generated-file drift.
- Inspect `git status --short`.
- Verify the documented source/mirror synchronization workflow if relevant.
- Do not commit or push unless the user or task explicitly authorizes it.

---

## 7. Definition of done

This task is complete only when all applicable criteria below are satisfied:

- [ ] Current branch, commit, working tree, and relevant project instructions were inspected.
- [ ] Every finding was re-verified against current code before editing.
- [ ] The service worker fails installation safely when required precaching fails.
- [ ] A failed update preserves the previously working offline app.
- [ ] Version discovery and cache rotation are tested across version A → B.
- [ ] HTTP error responses cannot poison the static-asset cache.
- [ ] The affected adventure controls are keyboard reachable and operable.
- [ ] Progress date semantics are confirmed and tested, or explicitly left unchanged with rationale.
- [ ] Test mutation/cleanup risks are addressed where verified.
- [ ] Targeted regression tests were added or extended.
- [ ] Applicable existing fast, release, route, offline, and accessibility checks were run and their real results recorded.
- [ ] No unrelated files or user changes were lost.
- [ ] `git diff --check` passes.
- [ ] Source/generated output synchronization is verified where applicable.
- [ ] Remaining manual device/browser checks and limitations are clearly listed.

A task is **not** done merely because code was edited or tests were added.

---

## 8. Required final report from the build AI

Return a concise but evidence-rich report with these headings:

### Summary
What was changed and why.

### Findings verified
For each planned item, state **confirmed**, **not present/already fixed**, or **unconfirmed**, and give the inspected file/function or test evidence.

### Files changed
List each changed file and the purpose of its change. Separate runtime code, tests, documentation, and generated files.

### Tests actually run
For every command, include:
- exact command;
- pass/fail/not run;
- relevant output or failure reason.

### Behavior verified manually
State browser/device and scenarios actually exercised. If none, say none.

### Remaining risks
List unresolved findings, skipped checks, environment limitations, and any assumptions.

### Repository state
Report current branch/HEAD and `git status --short`. State explicitly whether changes are only local, committed, pushed, or CI-verified. Never infer one status from another.

### Scope and compatibility
Confirm whether existing games, offline launch, local progress, and generated `docs/` output were affected and how they were checked.

---

## 9. Implementation strategy

Prefer a sequence of small changes:

1. Verify and fix service-worker install safety with regression coverage.
2. Verify and fix manifest/version discovery and cache-rotation behavior.
3. Prevent unsuccessful HTTP responses from entering the asset cache.
4. Add or improve version-update/offline failure regression tests.
5. Fix keyboard accessibility for confirmed affected controls.
6. Harden negative-test cleanup if the risk is present.
7. Correct progress date semantics only if the intended meaning is confirmed.
8. Investigate local-storage schema validation and implement only if a concrete failure is found.
9. Run the relevant test suite and provide the required evidence-based report.

**Guiding principle:** Protect the last known-good offline app, make every behavior change testable, preserve the existing project architecture, and be explicit about what has—and has not—been verified.
"""
