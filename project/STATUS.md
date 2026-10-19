# Petrin svet — Status

*Overwrite this file at the end of every session (never append). Budget: 6 KB, checked by `node tools/check_docs.js`.*

**Last updated:** 2026-10-19 · **App version:** 2.3.0 (`game/manifest.json`)
**Repository:** https://github.com/radmanmilos/Games-for-kids

## Where we are

- **No open task.** The next task number is **256** (task 255 archived 2026-10-19).
- **Task 255 — DONE (2026-10-19):** unified button system for the whole app. One shared bubble component `.ps-btn` in `game/styles/components.css`, carrying fastcat's geometry (`min(110px,17vmin)` round, 6px white ring, solid `0 8px 0` depth + `translateY(4px)` press) with a **more transparent body**, plus `.ps-btn--control/--icon/--primary/--secondary`, a bubble `.ps-back` and the `.ps-tri` directional glyph (replaces emoji/arrow). Rules as locked with the user: green = primary actions only, secondary actions = soft sky tint, quiz/answer choices keep each game's hue as their tint, hub tiles keep their per-game hue (only geometry/chrome unified). Rolled out to touch controls, HUD icon buttons, modal actions, quiz choices and hub tiles; game-surface objects (piano keys, rhythm pads, drag tiles, memory cards, sorting baskets/items, sequencing cards) keep their own look. Fixed a latent `game/games/spatial.js:195` bug (round-reset rewrote `className` and dropped `ps-btn`). **2.2.4 → 2.3.0**, `docs/` synced, demo `game/styles/_btn_demo.html` removed, review screenshots refreshed. Same session: restart-proofing became a **standing rule** (`AGENTS.md` + `project/lessons/testing-harness.md`) and **Kilo was retired** from the repo (`archive/kilo/`).
- **Task 255 validation:** `check_fast` **8/8 green** (the close-out caught a stale offline manifest, fixed with `build_offline.js` + `sync-docs.sh`). Full battery: 31/35 tools green, 1051 checks; the 4 failing tools are **host-only, not regressions** — racing3d needs WebGL (so `racing3d_smoke`, `runtime_error_smoke` and `touch_interruption_d` fail on the dev host) and the sandbox Chromium cannot control a service worker (`sw_update_smoke`, proven `success` in CI run 39114971527 on the same manifest bump).
- **Task 254 — DONE, 8 play-test rounds (closed 2026-10-18):** the game „Брзи мачак" (fastcat) — deterministic Sonic-style auto-runner taken to **2.2.4**: 10 themed levels with per-level palette/pickup/music, full starting super-meter with prolong-on-pickup, ⚡ button UX, redesigned win modal (real root cause for the hidden СЛЕДЕЋИ СВЕТ fixed in round 7), warm cave level, 3s blast. `fastcat_smoke` 42 → 67 checks. Detail in `archive/tasks/tasks-250-299.md`.
- **Asset Generation project — active, Phase 1 (inventory/approval).** Test-batch PNGs are committed under `resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/`: bone and elephant (approved candidates), **lion (user-accepted candidate)** and **frog (candidate, technical QA pending)**. None is production-ready or integrated into the runtime. Outstanding: technical QA (dimensions, alpha, legibility), style comparison vs the bear/star references, then user approval of the inventory.
- **CI is green** on `main` (CI, CodeQL, Pages — all 2026-10-18 runs successful).

## Candidate next work (the user decides; do not start without asking)

1. **Live play-test of 2.3.0** — the user checks the unified buttons on a real device; expect feedback-driven polish rounds.
2. **Asset project** — technical QA on the test batch (bone/elephant/lion/frog), then user inventory approval.
3. **racing3d tuning** — levers in `game/games/racing3d.mjs` (`bankMax`, `LATERAL_GAIN`, `inRate`/`outRate`, `bobY`, `camPull`/`camRise`).
4. **"Tier A" learning content** from the finished roadmaps in `archive/plans/` (see `project/reference/LEARNING_ROADMAP_REVIEW.md`).

## Validate (details: `AGENTS.md`)

`node tools/check_fast.js` (read-only, ~9 s) → `node tools/run_all.js --game <name>` / `--since HEAD` → `node tools/check_release.js` before a release. Smokes need Chrome (`CHROME_PATH`); racing3d needs WebGL. After a restart, read `tools/.cache/task<N>-validation.md` first and re-run only what is missing.

## Rules of the road

- `game/` changes ⇒ run `tools/sync-docs.sh` **and** `node tools/build_offline.js` when assets/pages change (the offline inventory hashes real bytes), **bump `game/manifest.json`** (A.B.C, deliberately NOT semver: C = minor, B = major, A = overhaul) **and refresh the affected review screenshots** (`AGENTS.md`). Never edit `docs/` by hand.
- Never commit or push to `main` unless the user says so for this task.
- Before touching a risky area read its lesson file: see the table in `AGENTS.md` (`project/lessons/`).
- Locked decisions: `project/DECISIONS.md`. Process: `project/PROCESS.md`.
- Older session logs: `archive/handover/`.
