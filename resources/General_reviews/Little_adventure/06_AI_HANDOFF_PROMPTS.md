# 06 — Copy-paste prompts for the repo's AIs (OpenCode and others)

Model picks follow `AGENTS.md`: new game modules and bulk edits → DeepSeek V4.1 Flash Free; screenshots/visual review → Nemotron 3.5 Super VL Free; very large files → Nemotron 3.5 Lightning. Recommend the switch and wait for the user's confirmation; never switch yourself.

## Prompt A — start a card (replace IS-xx)

```
You are working on the Games-for-kids repo (Petras World). Read, in order: AGENTS.md, project/STATUS.md,
resources/General_reviews/Little_adventure/little_adventure/README.md, then the card IS-xx in resources/General_reviews/Little_adventure/little_adventure/03_TASKS.md
and ONLY the PS/TD/TP sections that card cites. Do exactly ONE card.

Before touching anything: run `git status --short` and `gh run list --limit 5` and tell me what you see.
Then PROPOSE your plan for IS-xx (files, steps, tests, risks) and WAIT for my approval.
After approval: claim the task in project/tasks/ACTIVE.md and in little_adventure/PROGRESS.md, implement the card,
run its validation commands, and report each acceptance criterion as PASS / SKIP(reason) / UNVERIFIED.
Never claim a test passed unless you ran it. Never stub WebGL or window.__little_adventure. Do not commit or push.
If a rule seems to conflict with the card, stop and ask. Name yourself `<tool>/<model>` in notes.
```

## Prompt B — visual review (Nemotron VL; gates G2–G4)

```
Review the attached little_adventure screenshots against resources/General_reviews/Little_adventure/little_adventure/00_PRODUCT_SPEC.md §2, §5 and §8.
Report facts you can see (is the hero readable, are keys/gems distinguishable, do grumpies look friendly not scary,
is any text/number visible in the HUD, are touch targets large and unobstructed) separately from guesses.
Do not edit files. List issues as: where, what is wrong for the child, why it matters, suggested fix.
```

## Prompt C — resume after a restart or usage-limit stop

```
Resume little_adventure. Read tools/.cache/task<N>-validation.md (if it exists) and resources/General_reviews/Little_adventure/little_adventure/PROGRESS.md,
run `git status --short`, and tell me exactly which card is in progress, what is done, and what is missing.
Re-run ONLY the validations that are missing. Do not start a new card until I confirm.
```
