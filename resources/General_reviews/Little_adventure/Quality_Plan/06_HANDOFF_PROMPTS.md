# 06 — Copy-paste prompts for the repo's AIs

Model picks follow `AGENTS.md`: code/bulk edits → DeepSeek V4.1 Flash Free; **anything that needs to look at images (look gates) → a VL model** (Nemotron 3.5 Super VL Free); very large files → Nemotron 3.5 Lightning. Recommend a switch and wait for the user's confirmation.

## Prompt A — start a card (replace Q-xx)

```
You are working on the Games-for-kids repo (Petras World), game «Мала авантура» (id little_adventure).
Read, in order: AGENTS.md, project/STATUS.md,
resources/General_reviews/Little_adventure/Quality_Plan/README.md, then card Q-xx in
resources/General_reviews/Little_adventure/Quality_Plan/03_TASKS_Q.md and ONLY the AU/AD/TDQ/RV sections it cites.
Do exactly ONE card.

Before touching anything: run `git status --short` and `gh run list --limit 5` and tell me what you see.
Then PROPOSE your plan for Q-xx (files, steps, tests, risks) and WAIT for my approval.
After approval: claim the task in project/tasks/ACTIVE.md and in Quality_Plan/PROGRESS.md, implement the card,
run its validation commands, and report each acceptance criterion as PASS / SKIP(reason) / UNVERIFIED.
For any card marked "Look gate": follow RV §1 — capture shots/filmstrips, then review them (or say
"LOOK UNREVIEWED — needs VL model or user" and stop). Never approve a look you did not see.
Logic stays frozen (only additive read-only fields with Node tests); the 65 logic checks must stay green.
Never claim a test passed unless you ran it. Never stub WebGL or window.__little_adventure. Do not commit or push.
If a rule conflicts with the card, stop and ask me. Name yourself `<tool>/<model>` in notes.
```

## Prompt B — look review (VL model; look gates and user gates)

```
Review the attached Little Adventure screenshots/filmstrips against
Quality_Plan/01_ART_DIRECTION.md (palette AD §2, character sheets AD §3, animation timing AD §4, FX AD §5, UI AD §7, don'ts AD §8).
Report separately: (1) facts you can SEE (silhouette readability, faces, outlines, colours vs the palette,
floating/clipping objects, void or hard horizon, animation phases in the filmstrip: anticipation / follow-through / squash-stretch,
any digit or text in the HUD, touch-target sizes), (2) guesses.
Score the RV §5 rubric categories you can judge (1–5) with one sentence each.
List issues as: where / what is wrong for a 4–6 year old / why it matters / suggested fix. Do not edit files.
```

## Prompt C — resume after a restart or usage-limit stop

```
Resume the Little Adventure quality pass. Read Quality_Plan/PROGRESS.md, run `git status --short`,
and tell me exactly which card is in progress, what is done, and what is missing. Re-run only the validations that are missing.
Do not start a new card until I confirm.
```
