# Petrin svet — Status

*Overwrite this file at the end of every session (never append). Budget: 6 KB, checked by `node tools/check_docs.js`.*

**Last updated:** 2026-10-18 · **App version:** 2.2.4 (`game/manifest.json`)
**Repository:** https://github.com/radmanmilos/Games-for-kids

## Where we are

- **No open task.** The next task number is **255** (tasks 253/254 archived 2026-10-18).
- **Task 254 — DONE, 8 play-test rounds (closed 2026-10-18):** new game „Брзи мачак" (fastcat), a deterministic Sonic-style auto-runner, iterated with the user to version **2.2.4**: themed levels (10 worlds, per-level palette + pickup + synthesized music), full starting super-meter with prolong-on-pickup, ⚡ button UX (raised clear of JUMP, pointerdown fire), win modal redesigned (real root cause for the hidden СЛЕДЕЋИ СВЕТ fixed in round 7 — a `display:none !important` CSS rule beat the JS inline clear; the smoke's old assertion checked the same inline value and was vacuous), warm cave level with rock ceiling, 3s blast. `fastcat_smoke` 42 → 67 checks. Full detail in `archive/tasks/tasks-250-299.md`.
- **Task 253 — DONE:** explorer fun-speed 3x → 2x; manifest 2.0.6.
- **Asset Generation project — active, Phase 1 (inventory/approval).** Test-batch PNGs committed to `main` in `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/`: bone (approved candidate), elephant (approved candidate, recorded in PROGRESS.md + inventory), **lion and frog (committed 2026-10-18 via `0698d3b`/`b96bad2` but NOT yet recorded in PROGRESS.md/ASSET_INVENTORY — lion is REVIEW, frog is AUDIT there)**. None production-ready, none integrated into runtime. Outstanding: record lion/frog, technical QA (dimensions, alpha, legibility) on all candidates, style comparison vs bear/star references, then user approval of the final inventory.
- **CI is green** (CI, CodeQL, Pages — all runs 2026-10-18 successful). Working tree clean.

## Candidate next work (the user decides; do not start without asking)

1. **Asset project** — record lion/frog candidates, run technical QA on the test batch, then user inventory approval (matches the current commit trail).
2. **fastcat further play-test rounds** — 2.2.4 is the latest; expect more feedback-driven segments.
3. **racing3d tuning** — levers in `game/games/racing3d.mjs` (`bankMax`, `LATERAL_GAIN`, `inRate`/`outRate`, `bobY`, `camPull`/`camRise`).
4. **"Tier A" learning content** from the finished roadmaps in `archive/plans/` (see `project/reference/LEARNING_ROADMAP_REVIEW.md`).

## Validate (details: `AGENTS.md`)

`node tools/check_fast.js` (read-only, ~9 s) → `node tools/run_all.js --game <name>` / `--since HEAD` → `node tools/check_release.js` before a release. Smokes need Chrome (`CHROME_PATH`); racing3d needs WebGL.

## Rules of the road

- `game/` changes ⇒ run `tools/sync-docs.sh` (updates `docs/`) **and bump `game/manifest.json`'s version** (A.B.C, deliberately NOT semver: C = minor, B = major, A = overhaul) and refresh the affected review screenshots (`AGENTS.md`). Never edit `docs/` by hand.
- Never commit or push to `main` unless the user says so for this task.
- Before touching a risky area read its lesson file: see the table in `AGENTS.md` (`project/lessons/`).
- Locked decisions: `project/DECISIONS.md`. Process: `project/PROCESS.md`.
- Older session logs: `archive/handover/`.
