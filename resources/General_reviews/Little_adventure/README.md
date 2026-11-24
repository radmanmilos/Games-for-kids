# little_adventure — plan package for a 3D adventure game («Мала авантура», working title)

A small 3D, Zelda-*like* adventure for ages ~4–6 on Android tablets: walk with a joystick, swing a wooden sword, raise a shield, carry keys and gems, open gates, befriend grumpy blobs. Everything is low-poly 3D built from three.js primitives in code. **No fail states, no score, no counters.**

Plan written 2026-11-23 by Claude/Sonnet 5.5 against `main` @ `a9360af` (manifest 3.0.19). The user approved the product rules in `05_DECISIONS_AND_RISKS.md` §1 (rows marked APPROVED). The plan author did **not** implement anything and could **not** run Chrome or WebGL.

## Reading order (an AI executing a card needs only 1–4 + its card)

1. This README (rules + workflow)
2. `AGENTS.md`, `project/STATUS.md` (repo startup set)
3. `03_TASKS.md` — your card (it lists its own **Read first**)
4. The `00_PRODUCT_SPEC.md` (PS §) and `01_TECH_DESIGN.md` (TD §) sections your card cites
5. `04_TEST_PLAN.md` before writing any test; `05_DECISIONS_AND_RISKS.md` if a rule seems to conflict with a card

`02_ROADMAP.md` = phases and user gates. `06_AI_HANDOFF_PROMPTS.md` = copy-paste session starters. `PROGRESS.md` = live ledger (every AI updates it).

## Verified repo facts this plan relies on (2026-11-23)

- three.js **r169**, core only (no GLTF loader), vendored at `game/assets/lib/three.module.min.js`; `racing3d.html` loads it with an importmap `{"three": "../assets/lib/three.module.min.js"}` and a `<script type="module">`.
- `game/data/app-registry.js` is the single source of pages/routes; the hub tiles in `game/index.html` are hand-written `<button class="hub-btn … " data-go="game-…">`; titles live in `game/data/serbian.js` (`titles`).
- `window.pointerDrag(el, {down,move,up,cancel})` in `game/shared/input.js` tracks **one pointer per element** (second finger ignored) — so a joystick element plus two button elements give correct multi-touch.
- Shared audio/speech: `window.tone/sweep/popSound/successChime` (`shared/audio.js`), `window.audioBuses` (`shared/audio-buses.js`), `window.speech.speak(text, onDone)` (`shared/speech.js`, mp3 if known else `speechSynthesis` sr-RS), `window.REDUCED_MOTION` (`shared/motion.js`).
- `tools/run_all.js` auto-discovers every `tools/*_smoke.js`; `tools/headless.js` exports `start, check, skip, getFails, getSkips`. `racing3d_smoke.js` shows the **WebGL gate** pattern (counted SKIP, never a stubbed pass).
- Headless Linux hosts have **no WebGL**; do not retry SwiftShader/swrast flags (`project/lessons/racing3d.md`).
- The repo already has `game/games/adventure.js` + `adventure-modes.js` + `shared/adventure.css` (a 2D side-scrolling engine, `window.__adv`). **Do not reuse the word "adventure" for any new id, file or global** — this game's id is `little_adventure`.

## Hard rules (summary — the full set is in `AGENTS.md`; these are the ones that bite here)

1. Investigate, then propose, then wait for the user's approval **per phase**. Smallest correct change; touch only the files in your card.
2. `game/` must never depend on `resources/` or `tools/`. **Never edit `docs/` by hand** — `bash tools/sync-docs.sh` after any `game/` change.
3. **Do not commit or push** unless the user says so for the task (decision D12). Leave work in the tree and say what changed.
4. Never claim a test passed unless you ran it. If you cannot run a `[CHROME]`/`[WEBGL]` step, write `UNVERIFIED — needs user run` and print the exact command for the user. **Never stub `window.__little_adventure`/WebGL to make a test green.**
5. Generated artifacts (offline inventory, SW list) are fixed only by the command `node tools/check_fast.js` prints — never by hand.
6. All child-facing text and speech: Serbian Cyrillic. No visible text in the HUD. No ads/tracking/network/analytics/IAP. No new libraries. No image or audio files (synth + code-built geometry only).
7. Do not use Nintendo names, music, the triforce, or look-alike designs. "Zelda-like" is a genre label for the plan only; nothing in the repo or UI says "Zelda".
8. Pure logic (config + sim) must stay free of DOM/three so it runs in Node (`TD §3`). Rendering reads logic state; it never decides gameplay.
9. Weak/free models: **one card per session**, never rewrite a whole large file, keep `little_adventure.mjs` under ~1200 lines (split by moving builders to `little_adventure-models.js`).

## Card workflow

1. `git status --short` and `gh run list --limit 5`; report anything red/dirty before starting (`project/PROCESS.md`). 2. Claim: add `- N. IN PROGRESS — little_adventure IS-xx <title> (<date>, <tool/model>)` to `project/tasks/ACTIVE.md` (N from `project/tasks/INDEX.md`) and a row in `PROGRESS.md`. 3. Implement exactly the card; run its validation commands. 4. If `game/` changed: run the fix commands from `node tools/check_fast.js`, then `bash tools/sync-docs.sh`. 5. If a screen changed: refresh screenshots (`PROCESS.md` step 5) — on this game that is usually a `[USER-RUN]` step. 6. Mark DONE in `ACTIVE.md` and `PROGRESS.md` with AC results (`AC1–AC6 met; AC5 UNVERIFIED`). 7. Session end: `node tools/archive_tasks.js`, overwrite `project/STATUS.md` (≤ 6 KB), `node tools/check_docs.js`.

Env tags used in cards: `[NODE]` any sandbox with Node ≥ 22 · `[CHROME]` headless Chrome, no WebGL needed · `[WEBGL]` needs a GPU/WebGL host (the user's Windows machine or a GPU CI runner) · `[USER-RUN]` the user must run or play it.
