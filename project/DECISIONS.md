# Locked decisions

Do not re-open these without new evidence (a playtest or visual proof) **and** the user's approval. Text below is moved verbatim from the files named in each heading. Add new decisions as a dated one-liner with its source.

## Product principles (from the project brief; confirmed by the user)

- Learning through play, never homework. Forgiving mechanics: no fail states, no lives, no coins or leaderboards.
- Large touch targets; immediate, gentle visual/audio feedback; understandable with little or no reading.
- No ads, tracking, analytics, in-app purchases or mandatory internet. All assets local. Smooth on modest Android tablets.
- All child-facing text in Serbian Cyrillic; all speech in Serbian.
- One cozy shared world (shell, header, navigation, touch feedback, motion language) without flattening each game's own identity.
- Native emoji animals are a settled choice; do not replace them without visual or playtest evidence. **Open question (2026-10-13):** `resources/General_reviews/Asset_Generation/` explores illustrated replacements. Confirm with the user before building anything.

## From HANDOVER_PROMPT.md

### Racing game decisions (ALL 10 CONFIRMED 2026-09-22)

The Мала тркачица (Little Racer) game is fully built (Stages 1–5, tasks 95–99) and committed. The 10 gameplay/design decisions below were made autonomously during the build and have now been **explicitly confirmed by the user as-is (2026-09-22)**. Do NOT re-open or re-litigate them. Only #8 is called out because it visibly changes the game on the user's own machine:

1. **Unlock progression = wins-based thresholds `[0, 2, 4, 7]`** — 3rd car of each driver unlocks after 4 finished races, 4th after 7. No coins/currency; kids earn cars by completing races. (Also drives the ARIA/🎉 "НОВО" unlock toast.)
2. **One picker** — a single 8-card combo grid (2 drivers × 4 cars): driver sprite + car emoji, selected = gold ring, locked = greyed 🔒 + "N победе" hint, no pick-through on locked.
3. **Car stats stay subtle** — only `accel` (0.95–1.15 speed-growth multiplier) added to the existing maxSpeed/steer; NO stats UI — differences are "feel" only, shown as name + emoji.
4. **Countdown words use existing MP3s** (`три`/`два`/`један`); `Крени!` uses TTS. No new audio assets.
5. **Engine hum is synthesized** Web Audio (twin sawtooth, pitch/gain follows speed); music restarts on replay (also fixed a pre-existing bug: music never resumed after a race).
6. **Pickup collect → 5 sparkle particles** in the world's finish color (gold default).
7. **Controls = tablet-first thumb zones** — two big round buttons (⬅/➡) inside full screen-half zones (left/right 50% width, top 26vmin → bottom); portrait tablets ≥520px get an "Окрени уређај водоравно 🌍" overlay.
8. **Reduced-motion caveat (watch this one):** the user's OS reports `prefers-reduced-motion: reduce` = ON (same reason task 83 was reverted). Consequence on the user's machine (`racing.js` `&& !REDUCED_MOTION`): the obstacle screen-shake AND the 2026-09-11 FOV/scale pulse + speed-line streaks are suppressed; `@media (prefers-reduced-motion: reduce)` also removes button-press and progress-fill transitions. Banking lean, hills, fog, shadows, skids/dust and the vignette still render (kept so the user can SEE the upgrade; discrete/gentle effects stay on). Slowdown + sound feedback always work. If the user wants any of the gated effects, it's a one-line change.
9. **Wins count only on a real finish** — quitting mid-race never counts (guarded by `finishRecorded`, reset in `restart()`).
10. **Locked cars announce via ARIA + 🎉 "НОВО: <car>" toast** when a threshold is crossed.

## From LEARNING_ROADMAP_REVIEW.md (2026-10-05; full reasoning in `project/reference/LEARNING_ROADMAP_REVIEW.md`)

**Tier C — do not build**

- A standalone colors app (item 2 — already covered).
- Math equations (item 7 — §41 forbids the ordering).
- Continents/countries (item 9 — §41 rejects the shape).
- A text/word-building app (item 5 — §41 warns it assumes literacy).

---

## From AGENTS.md (settled layouts, rejected scope, audio decisions)

- **Racing game decisions (autonomous build, task 99):** the 10-item gameplay/design decisions list lives at the top of `HANDOVER_PROMPT.md` ("First thing next session — Racing game decisions to cover") and in `PROJECT_TASKS.md` task 99. These are confirmed with the user BEFORE any racing polish/refactor — do not re-implement, re-litigate, or "improve" them first. Notable: unlock thresholds `[0,2,4,7]` wins (no currency); single 8-card combo picker; wins count only on real finish (`finishRecorded` guard); the user's OS reports `prefers-reduced-motion: reduce` = ON, so the obstacle screen-shake is suppressed on their machine (`racing.js:1036` `&& !REDUCED_MOTION`) — the ONLY user-facing behavior the a11y gate still changes after the task-83 revert, flagged for review.
- Do NOT rework settled layouts: coloring palette grid format, ref/coloring SVG sizes, grid stability (`scrollbar-gutter:stable`, no tile-pop reflow on tap).
- Do NOT reintroduce rejected/deferred scope: jigsaw puzzle pieces, memory difficulty levels, unlockable stickers, screen transitions.
- Memory games speak the animal name + play its sound ONLY on matched pairs — never on single or mismatched flips.
- Task 43 (alphabet audit) is DONE (2026-08-07, per user) — 25 consonant sound MP3s + 3 word swaps were regenerated and the user's listening pass confirmed no further changes. Do not regenerate TTS unless the user lists specific wrong files.

## Мачја шума (Cat Forest) — product rules (approved 2026-10-19)

- Port of the Secret Cat Forest idea as a toddler game: feed visiting emoji cats, collect gifts that grow a forest.
- No currency, shop, XP, levels, locks, score, counters, timers, fail states, notifications or offline earnings.
- No visible text; Serbian Cyrillic speech and aria-labels only; emoji art only; no new assets/libraries/network.
- Day/night and rain are child-controlled toggles; they never affect rewards. Friends book shows met cats only (no counts/silhouettes).
- Tiny save (met cats + decorations) in one localStorage key, cleared by the existing parent reset. Drag-and-drop treats in addition to tap.
- Delivery (amends package D11, 2026-10-19): after each card/bundle is DONE and gates are green, the AI commits and pushes to `main` and verifies CI; never continue on red or dirty.
- Plan package: `resources/General_reviews/Cat_Forest/` (README.md, PROGRESS.md).

## OpenCode 2 upgrade (2026-10-19)

- The OpenCode CLI was upgraded `1.19.3 → 2.0.32` via `opencode upgrade --major --method npm`. Decision per user, guided by `https://opencode.ai/v2/docs/migrate-v1/`.
- Impact is confined to the assistant layer: `game/`, `tools/`, CI and `docs/` are plain Node and reference OpenCode nowhere, so nothing about our way of working (skill, agents, Plan/Build, provenance trailer, model id) was lost. Verified post-upgrade: `opencode.json` parses with no warnings; Playwright MCP `connected`; skill `validate-game-change` still loads; model `opencode/big-pickle` resolves; agents `build`/`plan` (primary) + `explore`/`general` (subagent) present.
- Config migrated to the **native V2 shape**: `mcp.playwright` → `mcp.servers.playwright` with `enabled: true` dropped (V2 uses the inverse `disabled`). `.opencode/package.json` + `package-lock.json` (unused `@opencode-ai/plugin@1.18.32`) were deleted — V1 plugin implementations do not run in V2, and we had no plugin.
- Do not re-add `tui.json` (V2 uses one global `~/.config/opencode/cli.json`; we had none). New V2 features (background subagents/shells, Code Mode) are noted but NOT adopted (YAGNI) — adopt only if a task needs them.
