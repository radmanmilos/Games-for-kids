# 04 — Review loop, shots, tests, playtest, rubric (RV)

## RV §1 The look-dev loop (mandatory for every card marked "Look gate")

1. Implement the card. 2. `node tools/little_adventure_shots.js --phase=<card id> [--only=<preset,...>]` → PNGs in `Quality_Plan/shots/<card id>/` (needs WebGL: on a host without it print the command and mark the step `[USER-RUN]`; **never** commit blank images — the tool validates non-blank). 3. Review: **facts you can see** (silhouette readable? face visible? outline thickness? colours per AD §2? floating objects? clipping? animation phases in the filmstrip matching AD §4?) vs **guesses**; use Prompt B with a VL model, or the user. 4. List issues as *where / what is wrong for the child / why / fix*. 5. Fix, re-shoot, re-review. 6. Only then update `PROGRESS.md` with the shot folder and the review result. A model that cannot read images must not self-approve a look gate: it says `LOOK UNREVIEWED — needs VL model or user` and stops.

## RV §2 Deterministic shot presets (`photo(name)`) and filmstrips (`sheet(name, frames)`)

Fixed seed 7, paused, fixed time-of-day per zone, fixed camera:
`hero-front, hero-side, hero-34, meadow-wide, meadow-flowers, forest-wide, forest-lane, shrine-wide, pedestals-lit, lighthouse, owl-closeup, grumpy-angry, grumpy-happy, boss, gate-closed, gate-open, chest-open, bridge-built, complete-bloom, start-screen, hud-landscape` at 1280×800 and 844×390 (+ 1024×768 portrait for the landscape hint).
Filmstrips (8 frames each unless noted): `hero-idle(6), hero-walk, hero-swing, hero-shield(6), hero-bump, hero-pickup, hero-celebrate, grumpy-walk, grumpy-notice(6), grumpy-hit, grumpy-befriend, happy-dance, boss-stomp, owl-talk, chest-open, gate-open, bridge-build, bloom-wave`. A filmstrip renders N clones of the rig in a row, posed by the **pure evaluators** at evenly spaced `t` — so animation quality can be reviewed from a single still image.

## RV §3 Automated checks

- **Logic (Node, must stay 65/65):** `node tools/little_adventure_logic_smoke.js`.
- **Quality (Node):** `node tools/little_adventure_quality_smoke.js` — anim evaluators, springs, rigs/pivots/triangle budgets, terrain, sequencer, EVENT_TABLE completeness, material cache, ground containment.
- **Shell (Chrome, no WebGL):** S1–S10 in `tools/little_adventure_smoke.js` (page boot, route, back control, fallback, no-network rule, hit-testing ≥ 56 px, no digits in visible text, Cyrillic `aria-label`s).
- **WebGL (GPU host):** W1–W13 (Q-02). Honest `SKIP(reason)` elsewhere; never stubbed.
- **Release:** `node tools/check_fast.js`, `node tools/run_all.js --game little_adventure`, `node tools/check_release.js`, `node tools/touch_interruption_all.js --game little_adventure`, `node tools/visual_compare.js` (golden shots).
Before running any smoke, read its assertions and confirm they match the current code (AGENTS rule). Negative-test guards by mutating a *copy*, never with `git checkout/restore/stash`.

## RV §4 Playtest protocol (user-led, real tablet, a child ≈ 4–6)

Record per session: tablet model, age, minutes, tier selected, fps feel, where the child stopped/looked confused, what made them laugh, any fear/frustration. Look especially at: do they understand where to go (beacon/arrow/owl)? do they find the sword/shield? are grumpies friendly-looking? do they react to the befriend moment? are sounds pleasant (no startle)? is the joystick comfortable? is the first minute clear without a parent? Changes after a session: config/data first, logged with the observation.

## RV §5 "Professional enough" rubric (score 1–5 each; target: every category ≥ 4, none < 3)

| Category | 1 = prototype … 5 = shippable polish | Scored by |
| --- | --- | --- |
| Character appeal | readable silhouettes, expressive faces, consistent style | VL + user |
| Animation | anticipation/follow-through, no popping, smooth blends | filmstrips + user |
| World & lighting | cohesive palette, depth, distinct zones, no void/clipping | shots + user |
| Effects & juice | every action has satisfying, soft feedback | user |
| Audio | pleasant, varied, not fatiguing, mixes with speech | user (ears) |
| UI/UX | designed icons, clear controls, clean start/pause | shots + user |
| Clarity for the child | knows what to do next without text | playtest |
| Stability & performance | 60 fps (high/med) / ≥ 30 (low), no leaks, offline OK | tools + tablet |
Score at Q-00 (baseline), after QG2, QG4, QG5 and at Q-22; record in `PROGRESS.md`.
