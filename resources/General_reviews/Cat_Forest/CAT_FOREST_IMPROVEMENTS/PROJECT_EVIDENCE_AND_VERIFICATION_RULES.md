# Project Rule: Evidence-Based Work, Verification, and Approval

**Scope:** This rule applies to all work in the Kids Games project, across every chat, review, implementation task, asset task, and project document.

## Governing Principle

**Nothing is considered done, approved, implemented, tested, or present in the repository unless available evidence supports that specific claim.**

Do not guess, assume, invent, or present an intention as a fact. Accuracy and traceability take priority over sounding complete or confident.

## Mandatory Rules

1. **Verify before claiming**
   - Confirm repository state before stating that files, assets, code, documentation, or commits exist.
   - Check the relevant branch, commit, paths, and changed files when making claims about GitHub.
   - Do not infer that a commit succeeded merely because it was attempted or because someone intended to make it.

2. **Distinguish confirmation from independent verification**
   - A user's statement may be recorded as user-reported status, but it is not the same as independently verified repository state.
   - Clearly identify whether a fact is user-confirmed, tool-confirmed, independently verified, or still unknown.
   - Never imply that a check was performed when it was not.

3. **Prove changes with appropriate checks**
   - After changing files or code, inspect the resulting state whenever tools allow.
   - For repository changes, verify the commit and the files included.
   - For code changes, run relevant tests, builds, linters, or other checks when available and appropriate.
   - Report which checks were actually run and their outcomes. Do not imply that passing one check proves unrelated behavior.

4. **Use precise status labels**
   - Distinguish clearly between:
     - **Proposed** — suggested, not approved or implemented.
     - **In progress** — work has started but is incomplete.
     - **Completed locally** — completed in a local working environment but not confirmed in the remote repository.
     - **Committed** — a commit operation is confirmed.
     - **Verified in repository** — the relevant remote repository state and paths have been checked.
     - **Tested** — named checks were actually run; state the results.
     - **Approved** — explicitly accepted by the user or otherwise supported by a documented approval.
     - **Blocked / unverified** — unable to complete or confirm with available evidence.

5. **Respect approvals and project decisions**
   - Do not treat suggestions, assumptions, drafts, generated assets, or proposed design changes as approved project decisions.
   - Preserve explicitly approved assets, references, requirements, and decisions.
   - If approval is unclear and the decision materially affects the project, ask before proceeding.
   - Do not silently replace, reinterpret, or discard an approved reference or requirement.

6. **Keep documentation factual**
   - Project inventories, progress files, reviews, changelogs, asset catalogs, implementation plans, and other documentation must reflect the actual known state.
   - Label plans and intended future work as plans, not completed work.
   - Do not add invented filenames, paths, features, test results, commit IDs, approvals, or implementation details.
   - When evidence is incomplete, state what is known, what remains uncertain, and what would verify it.

7. **Be transparent about limitations and failures**
   - If a tool cannot access the repository, a command fails, or a check cannot be run, state that plainly.
   - Do not conceal failed attempts or convert an attempted action into a success claim.
   - Give the most useful next verification step when possible.

8. **Keep claims traceable**
   - For important changes and status reports, provide concrete evidence where available, such as repository paths, commit identifiers, changed-file lists, test commands and results, or links to the verified source.
   - Ensure each claim is supported by the evidence cited for it.
   - If no evidence is available, qualify the statement instead of presenting it as certain.

## Required Completion Report

For meaningful implementation or asset work, report briefly:

- **Changed:** What was actually changed.
- **Location:** Exact verified repository paths or local paths, as applicable.
- **Evidence:** The commit, diff, file listing, tool result, or other evidence inspected.
- **Checks:** Tests or validations actually performed and their results.
- **Approval:** Whether the result is approved, pending review, or not applicable.
- **Remaining:** Any unresolved items, limitations, or unverified claims.

Only include fields that are relevant, but never omit an important limitation merely to make the report sound complete.

## Final Rule

**Never invent evidence. Never claim verification that did not happen. Never confuse an intention, an attempt, or a user-reported status with independently verified completion. When in doubt, say what is known and what is not known.**
