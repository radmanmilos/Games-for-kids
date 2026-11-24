# 05 — Decisions and risks

## §1 Decisions

**APPROVED** = the user said so in the planning chat (2026-11-23). **DEFAULT** = the plan author's choice inside the approved rules; stands unless the user changes it. **OPEN** = needs the user.

| ID | Decision | Status |
| --- | --- | --- |
| D1 | Working title «Мала авантура»; game id `little_adventure`. Renaming = one line in `serbian.js` (+ page `<title>`/`<h1>`/hub `aria-label`). | **OPEN** (ask at IS-00; do not block) |
| D2 | Fixed-angle camera that follows the hero; no rotation/zoom. | APPROVED |
| D3 | Joystick for movement plus sword and shield buttons. Floating joystick style is the default. | joystick APPROVED · floating style DEFAULT |
| D4 | Heroes and characters are 3D low-poly, built from three.js primitives; no 2D sprites, no emoji in the scene. | APPROVED |
| D5 | Light fighting with a wooden sword and shield; **the hero cannot be hurt; grumpy creatures turn friendly** (no death, no fail state). | APPROVED |
| D6 | Keys and gems are puzzle items, not score; no counters anywhere. | APPROVED |
| D7 | Carry model: unlimited carry (max 5 exist), auto-use at targets, no inventory UI, cannot be lost. | DEFAULT |
| D8 | v1 has no music; synth SFX + Serbian speech only. | DEFAULT |
| D9 | Age ~4–6, `toddler:false`; one island, three linear zones, ~8–12 min first playthrough. | DEFAULT |
| D10 | Progress saved in one validated `localStorage` key; start screen has «Настави» / «Нова авантура». | DEFAULT |
| D11 | Hub tile stays `hidden` until Gate G4 (a half-built game is never published). | DEFAULT |
| D12 | AIs leave work uncommitted; the user commits and pushes (AGENTS rule; Cat Forest later amended its D11 — the user may do the same here). | DEFAULT |
| D13 | Performance targets: 60 fps goal / 30 fps floor, draw calls ≤ 150, triangles ≤ 60 k, DPR ≤ 1.5 with one adaptive step-down. Real numbers come from the tablet. | DEFAULT |
| D14 | Serbian speech wording in PS §7 is a proposal; a Serbian speaker approves it at G3. | **OPEN** (G3) |
| D15 | Not copying Nintendo IP: no names/triforce/look-alikes/melodies. | APPROVED (rule of the plan) |

## §2 Risks and mitigations

| # | Risk | Mitigation |
| --- | --- | --- |
| R1 | No WebGL in AI sandboxes ⇒ rendering unverifiable | Pure logic in Node (TP §2) covers the rules; shell tests real; WebGL battery gated; G2/G3/G4 are user looks; never stub |
| R2 | Scope creep ("it's Zelda") | PS §9 out-of-scope list; 3 zones, 5 items, 3 grumpy roles; any new idea needs a user decision first |
| R3 | Sword combat conflicts with "no fail states" | D5 rules; test `no health-like field`; no damage vocabulary in code/UI |
| R4 | Joystick too hard for young children | Floating stick, big dead zone, aim assist, beacon + arrow; playtest question; fallback idea (tap-to-walk toggle) only after evidence |
| R5 | Performance on modest tablets | Budgets, instancing, no shadows, flat shading, adaptive DPR, perf overlay, early IS-10 measurement |
| R6 | Free/weak AI models lose context on big files | One card per session; ≤ ~1200-line files; logic/models/world/actors split into classic scripts; cards cite exact sections |
| R7 | Procedural characters look poor | G2 gallery review before any gameplay depends on them; recipes are data-light and easy to restyle |
| R8 | Soft-lock | Carry model, no consumables except at targets, bot completion test from 3 seeds, "any subset" test |
| R9 | Hub grid overflow with a 13th tile | IS-01 hidden tile; IS-19 checks `hub_smoke` + `short_landscape_audit` at 844×390 |
| R10 | Generated-artifact churn (offline list, SW hash, docs mirror) | Fix commands only; `check_fast` after every `game/` card |
| R11 | Violence perception for parents | Wooden sword, stars not hits, no blood/red flashes, vocabulary rule, friendly colours, G4 review |
| R12 | WebGL context loss on tablets | TD §11 handlers copied from racing3d; W13 test |
| R13 | Another AI edits the same files | Check git status first; claim in ACTIVE; ≤ 1 card/session; logic API frozen at IS-07 |
| R14 | Reduced-motion mismatch (owner's OS has it ON) | PS §8 + W8 assert the response, not the host |

## §3 What the plan author could not verify

Chrome/WebGL behaviour of any kind; CI state (`gh` not available); real-tablet performance; how a young child reacts to the controls; whether `hub_smoke` accepts a hidden registered tile (IS-01 says to stop and ask if not); exact line numbers other than the ones cited from `racing3d.mjs` (verified 2026-11-23).

## §4 Change control

Locked rules live in PS §2. Weakening one needs a new user decision recorded in `project/DECISIONS.md`. Changing the logic API after IS-07 needs a note in `PROGRESS.md`. Config values may be tuned freely (they are the tuning surface).

## §5 Text for the repo (used by IS-00)

**`project/DECISIONS.md` — add a section «little_adventure (2026-11-23)»:**
- 3D low-poly adventure `little_adventure` (working title «Мала авантура»), ages ~4–6, fixed camera, floating joystick + sword + shield buttons, `toddler:false`.
- Characters/world are code-built three.js primitives; no 2D sprites, no emoji in the scene, no image/audio assets, no new libraries.
- The hero cannot be hurt; sword hits turn grumpy creatures friendly; keys/gems are puzzle items — no score, counters, coins, timers, health, lives or fail states.
- Pure logic in `little_adventure-logic.js` (Node-testable); rendering only reads state.
- Hub tile hidden until the user approves shipping (G4). Plan: `resources/General_reviews/little_adventure/`.

**`project/STATUS.md` — one pointer line:** `little_adventure (3D adventure) plan package installed: resources/General_reviews/little_adventure/ — ledger PROGRESS.md; next card per that file.`
