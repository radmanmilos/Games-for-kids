# 05 — Decisions, risks, review checklist

## 1. Decisions — CLOSED 2026-10-19

The user answered in chat on 2026-10-19: D1 and D3+D4 by choice, D2/D5/D6/D7/D8/D10/D11 and the risk plan by "Accept all". D9 was listed with a request for changes; none were requested, so it is recorded as approved as written (TTS pronunciation still gets checked on the tablet in CF-10 and CF-22). **No card is blocked by an open decision.** Change a row only with a dated note.

| ID | Question | Proposed default | Why | Blocks | Status |
| --- | --- | --- | --- | --- | --- |
| D1 | Title | **«Мачја шума»** (alternatives: «Тајна мачја шума», «Мачићи у шуми») | short for the header; the original was "Secret Cat Forest" | CF-01 | **APPROVED 2026-10-19**: «Мачја шума» |
| D2 | Reward display | **No number at all.** Gifts hop into the forest and become decorations | "no coins/leaderboards"; pre-readers can't use numbers. Alternative: a plain emoji count like the ocean game's 🐚 | CF-08 | **APPROVED 2026-10-19** |
| D3 | Friends book «Мачке пријатељи» | **Yes**, ungated, shows met cats only (no silhouettes, no counts) | closest thing to the rejected "unlockable stickers" → needs explicit OK. Alternative: skip in v1 | CF-15 | **APPROVED 2026-10-19** (met cats only, no silhouettes/counts) |
| D4 | Save anything between sessions | **Yes, tiny** (met cats + decorations in one key) | the forest feels like "mine"; parent reset already clears it. Alternative: fresh forest every time | CF-14, 15 | **APPROVED 2026-10-19** |
| D5 | Day/night | **Child toggle** (☀️/🌙) | no surprise darkening, deterministic tests. Alternative: real clock | CF-11 | **APPROVED 2026-10-19** (child toggle) |
| D6 | Registry flags | `category:'games'`, `hubGroup:'games'`, `toddler:true` | designed for the youngest (racing/ocean are `toddler:false`) | CF-01 | **APPROVED 2026-10-19** |
| D7 | 🐈‍⬛ (ZWJ emoji, Android 11+) | **Keep**, with dark-tinted 🐱 fallback chosen by a render probe | avoids a split glyph on older tablets | CF-06, CF-07 | **APPROVED 2026-10-19** |
| D8 | Drag-and-drop treats | **Yes** (as CF-13, after tap works) | 2–3-year-olds drag instinctively; tap path stays primary | CF-13 | **APPROVED 2026-10-19** |
| D9 | Cat names + spoken prompt | Names as in PS §5 and «Нахрани мачиће!» | you are the language authority; TTS pronunciation must be checked on the tablet | CF-06, CF-10 | **APPROVED 2026-10-19** (no changes requested; verify TTS on tablet) |
| D10 | Screenshot battery participation | **Later** (`screenshot:false` now; add states in CF-19; flip to `true` only after you create baselines) | `true` without baselines fails `visual_compare` | CF-19 | **APPROVED 2026-10-19** (states in CF-19; `screenshot:true` only after baselines) |
| D11 | Delivery mode per card | Work stays **uncommitted** (or on a branch you name); AI lists changed files and a suggested commit message with an `Agent:` trailer; you commit/push | `AGENTS.md`: never commit/push to `main` unless told | all | **APPROVED 2026-10-19** |

## 2. Risk register

| ID | Risk | Likelihood / impact | Mitigation | Card |
| --- | --- | --- | --- | --- |
| R1 | Emoji render differently per device (🐈‍⬛, 🦁👑, 🐆, accessory overlay offsets) | M / M | probe + fallback; accessory offsets in data; check on the real tablet | CF-06/07, CF-22 |
| R2 | DOM animation jank on a modest tablet | L–M / M | transform/opacity only, node caps (TD §10), logic-driven movement, no layout reads in `tick` | CF-07, 12 |
| R3 | Serbian TTS missing or blocked until a user gesture | M / L | speech is best-effort; every sound/speech call guarded; game fully works silently | CF-09, 10 |
| R4 | Hub grid overflows with a 10th tile in short landscape | M / M | verify in CF-01 with `hub_smoke` + `short_landscape_audit` | CF-01 |
| R5 | Scope creep: economy/XP/locks/counters sneak back | M / **H** | PS §2 + §10, philosophy guards (TP §4), review checklist (§3) | all |
| R6 | Merge conflicts on the single game file | M / M | sequential JS cards, section banners (TD §1), claim in `ACTIVE.md` | Phase 2–5 |
| R7 | Flaky smoke (timing, CSS transitions) | M / M | determinism via `pause/seed/step`; settle-polling; 5 consecutive green runs (CF-16) | CF-02, 16 |
| R8 | Tests assert source literals/old behaviour (stale-test failure) | M / M | read the code first; assert behaviour/contracts only | CF-02, 16 |
| R9 | Reduced-motion device (the owner's tablet reports `reduce = ON`) makes the game feel static | M / M | reduced path is a primary path; essential motion stays; evidence in play-test | CF-12, 22 |
| R10 | Docs budgets exceeded (`STATUS` 6 KB, `ACTIVE` 20 KB) / dead links | L / L | add only the card in progress to `ACTIVE`; keep the plan in `resources/`; `check_docs` | CF-00, 20 |
| R11 | Generated artifacts hand-edited or stale | M / M | only printed fix commands; `docs/` via `sync-docs.sh` | every card |
| R12 | Sandbox without Chrome ⇒ unverified work | H / M | `UNVERIFIED` marking, exact commands for the user; never claim a pass | every card |
| R13 | A cat or gift covers a button (hit-test regression) | M / M | `pointer-events:none` layers, z-order spec (TD §4), hit-test assertions with 14 decor and 3 cats | CF-07, 08 |
| R14 | Long visits bore a toddler / short visits feel hectic | M / L | constants only; tuned in play-test rounds | CF-22 |

### Risk acceptance — 2026-10-19

The user accepted the risk plan as written (R1–R14 and their mitigations). Three risks need **user action**, not just a mitigation in code:

| Risk | What the user does | When |
| --- | --- | --- |
| R12 no Chrome ⇒ unverified work | run the `[CHROME]` commands an AI lists (or use an AI environment that has Chrome); paste results into `PROGRESS.md` | end of every code card |
| R1 emoji rendering | look at 🐈‍⬛ Сенка, 🦁👑 Краљ, 🐆 Тачка, and the accessory placement on the family tablet; report any broken glyph | first playable (after CF-08) and CF-22 |
| R9 reduced-motion tablet | treat the reduced-motion path as primary; confirm the game still feels alive | CF-12, CF-22 |

## 3. Review checklist (reviewer AI or the user — every line must be true, with evidence)

Philosophy
- [ ] No currency, price, shop, XP, level, rating, lock/unlock, "coming soon".
- [ ] No visible number, counter, percentage, timer or score anywhere (including the book).
- [ ] No fail/lose/game-over/lives; nothing expires or is taken away; wrong/idle taps are harmless.
- [ ] No reading required; **no visible text**; speech and `aria-label`s are Serbian Cyrillic only.
- [ ] Emoji art only; no image assets; no new audio files; no new libraries.
- [ ] No notifications, offline earnings, daily rewards, streaks; nothing happens while closed.
- [ ] No network calls, ads, tracking, analytics, IAP.
- [ ] Day/night and rain are child-controlled; neither affects any reward.

Quality
- [ ] Tap targets ≥ 72 px @1024×800 and ≥ 56 px @844×390 (treats, plates, cats, gifts); toggles/book ≥ 56 px; all hit-testable at all four viewports.
- [ ] Reduced motion: decorative effects off, essential movement kept, evidence in smoke.
- [ ] ≤ 3 cats, ≤ 14 decor, ≤ 5 gifts, ≤ 24 rain nodes, ≤ 12 fx; no `setInterval`; no `Date` in rules.
- [ ] Logic-driven positions (`step(ms)` exact); the hook is never read by the game.
- [ ] `game/shared/*` untouched; `docs/` only changed by `sync-docs.sh`; generated files only via printed fix commands.
- [ ] Smokes were actually run (or marked UNVERIFIED with commands); no assertion pins a literal the registry owns.
- [ ] `check_fast` green; `check_docs` green when docs changed; `PROGRESS.md`/`ACTIVE.md` updated; budgets respected.

## 4. Known inconsistencies in the repo's own docs (found while planning — verify, do not assume)

1. `.opencode/skills/validate-game-change/SKILL.md` shows `node tools/sync-docs.sh`, but `tools/sync-docs.sh` is a shell script; `AGENTS.md` names it without `node`. Run it with `bash` and report the real behaviour to the user.
2. `project/STATUS.md` was written at `71e1b7a`; the clone used for this plan was at `d83d6fc`. Re-read STATUS before CF-00.
3. CI state could not be checked from the planning sandbox (`gh` unavailable): run `gh run list --limit 5` at CF-00.
4. Items marked **VERIFY** in the cards are hypotheses derived from reading `ocean`/`sorting` wiring (e.g. which `tools/*` lists need a new page entry). `check_fast` and the guards are the source of truth.

## 5. Paste-ready text for CF-00

**`project/DECISIONS.md` — new section (adapt heading style to the file; keep it ≤ 10 lines):**
```
### Мачја шума (Cat Forest) — product rules (approved 2026-10-19)
- Port of the Secret Cat Forest idea as a toddler game: feed visiting emoji cats, collect gifts that grow a forest.
- No currency, shop, XP, levels, locks, score, counters, timers, fail states, notifications or offline earnings.
- No visible text; Serbian Cyrillic speech and aria-labels only; emoji art only; no new assets/libraries/network.
- Day/night and rain are child-controlled toggles; they never affect rewards. Friends book shows met cats only (no counts/silhouettes).
- Tiny save (met cats + decorations) in one localStorage key, cleared by the existing parent reset. Drag-and-drop treats in addition to tap.
- Plan package: resources/General_reviews/Cat_Forest/ (README.md, PROGRESS.md).
```
**`project/STATUS.md` — one line under candidate next work:**
`Мачја шума (Cat Forest) — plan approved 2026-10-19; see resources/General_reviews/Cat_Forest/PROGRESS.md (next: CF-00, then CF-01)`

**`project/tasks/ACTIVE.md` — claim line (take N from `project/tasks/INDEX.md`):**
`N. NEW — Cat Forest: approve decisions + install plan package (2026-10-19, <tool/model>)`
