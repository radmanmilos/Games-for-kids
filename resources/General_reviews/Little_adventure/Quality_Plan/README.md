# Little Adventure — Quality Plan («Мала авантура», game id `little_adventure`)

Goal: take the working first version to a **polished, near-professional** children's 3D game: expressive animated characters, a lit and living world, juicy feedback, real audio, a designed UI — without losing the locked rules (hero cannot be hurt, no score/counters, no HUD text, offline, Serbian Cyrillic).

Written 2026-11-25 by Claude/Sonnet 5.5 against `main` @ `d3d72a7` (manifest 3.0.24). The original plan package (`../README.md` … `../PROGRESS.md`, cards IS-00…IS-20) stays valid for rules and logic; **this folder adds cards Q-00…Q-24**. Nothing here was implemented or rendered by the plan author: **the author could not run Chrome/WebGL and has never seen the game on screen** — every visual statement below comes from reading code.

## Reading order for an AI executing a card

1. `AGENTS.md`, `project/STATUS.md` (repo rules) · 2. this README · 3. your card in `03_TASKS_Q.md` · 4. only the sections it cites: **AU §** = `00_AUDIT.md`, **AD §** = `01_ART_DIRECTION.md`, **TDQ §** = `02_TECH_DESIGN_Q.md`, **RV §** = `04_REVIEW_AND_TEST.md` · 5. `05_DECISIONS_AND_RISKS.md` if a rule seems to conflict.
`06_HANDOFF_PROMPTS.md` = copy-paste starters. `PROGRESS.md` = live ledger (update at claim and at finish).

## Rules (inherited from the original package, plus the quality rules)

1. Investigate → propose → wait for approval, **one card per session**, smallest correct change, touch only the card's files.
2. `game/` never depends on `resources/`/`tools/`; never hand-edit `docs/` (`bash tools/sync-docs.sh`); generated artifacts only via the command `node tools/check_fast.js` prints; do not commit/push unless the user says so.
3. Never claim a check passed unless you ran it. If you cannot (no WebGL/GPU on your host), write `UNVERIFIED — needs user run` and print the exact command. Never stub `window.__little_adventure` or WebGL.
4. **Logic is frozen except additive fields.** `little_adventure-logic.js` may only gain new *read-only state fields or events* (each with a Node test in `tools/little_adventure_logic_smoke.js`); no rule changes. All 65 existing logic checks must stay green.
5. **Look-dev loop for every visual card** (RV §1): implement → capture screenshots/filmstrips with the shots tool → review against the AD checklist (a VL model with Prompt B, or the user) → fix → only then mark DONE. A visual card without captured images is not DONE.
6. **Code-only art by default** (D-Q1): no image/GLB/audio files, no new libraries, no post-processing passes, unless a decision in `05` says otherwise. Textures are painted at runtime on a `CanvasTexture`.
7. Animation must stay a **pure function of logic state** (`hero.swingT`, `bumpT`, `vx/vz`, `shield`, events) plus a render-side clock; the renderer never decides gameplay.
8. `window.REDUCED_MOTION` ⇒ **smaller** motion (amplitude ×0.4, no spins, no camera pans, ≤ 6-particle bursts), never removal of state changes; assert the product's response, never the host setting.
9. Locked rules: PS §2 of the original package (no HP, no damage vocabulary, no counters, no HUD text, no Nintendo IP, Serbian Cyrillic only, no network).
10. Budgets and tiers: `02_TECH_DESIGN_Q.md` §9. A card that busts the draw-call/triangle budget on the *high* tier is not DONE.
11. Keep files ≤ ~1000 lines (split into new classic scripts that take `THREE` as a parameter); keep existing global names (`window.little_adventure*`, DOM ids `i3d-*`) — do not rename them.

Env tags: `[NODE]` any Node ≥ 22 · `[CHROME]` headless Chrome, no WebGL needed · `[WEBGL]` GPU/WebGL host · `[USER-RUN]` the user runs/plays it.
