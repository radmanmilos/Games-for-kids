# 04 — Test plan (TP)

## §1 Environments and honesty rules

| Layer | File | Runs where | Covers |
| --- | --- | --- | --- |
| Logic + models | `tools/little_adventure_logic_smoke.js` | **any Node ≥ 22, no Chrome** | all game rules, config, save, model builders (three imported in Node) |
| Shell + WebGL | `tools/little_adventure_smoke.js` | headless Chrome (shell); GPU host (WebGL battery) | page boot, route, controls hit-testing, fallback; rendering/hook checks |
| Manual | TP §5 | the user's tablet | feel, readability, performance, child reactions |

Rules: a check is `PASS`, `SKIP(reason)` (counted, printed) or `UNVERIFIED — needs user run`; **never** a stub (`window.__little_adventure` is only set by a real WebGL boot). A smoke that exits non-zero with 0 checks is a Chrome boot flake, not a failure (`run_all.js` retries). Assert the **product's response** to the environment (e.g. reduced motion), never the host setting. Before running any smoke, read its assertions and confirm they match the current code (AGENTS rule). Negative-test guards by mutating a **copy**, restoring from the copy, never with `git checkout/restore/stash`.

## §2 Logic battery (`little_adventure_logic_smoke.js`) — checks L1…L85

| Range | Card | Checks |
| --- | --- | --- |
| L1–L10 | IS-03 | config validates (`[]`); 5 negative mutations each produce problems; forbidden tokens absent (`document`, `localStorage`, `Date`, `Math.random`, `requestAnimationFrame`); `stickVector`: zero, inside deadzone → 0, half, full, over-radius clamp = 1, diagonal normalised |
| L11–L24 | IS-04 | speed at full/half stick; stop on release < 100 ms; blocked by circle; slides on wall; closed gate blocks; bounds hold on all 4 sides; dt 5 s clamps; same seed + inputs ⇒ identical JSON; `state()` is a copy; no NaN |
| L25–L44 | IS-05 | swing edge/cooldown; aim-assist snap; arc hits 2 targets; 1/2/3 hits for normal/guard/boss; befriend permanent; drop spawns; bump ≤ `bumpDist+0.1`; **no health-like field**; shield slows ×0.7; acorn blocked with shield / bumps without; acorn lifetime; respawn only when hero > 12 u away and cap 4; guard/boss never respawn; followers ≤ 3; 36 000 random steps → no NaN/throw |
| L45–L64 | IS-06 | bush cut spawns item; chest by touch and by hit; pickup range; carry array; gate opens only with its key; wrong key no effect; gate stays open; pedestal accepts only its colour; wrong colour keeps gem + `pedestalWrong` cooldown; bridge needs all 3; `complete` fires once; owl intro then hints by objective; `nextObjective` order and null after complete; **bot completes ≤ 600 sim-s for seeds 1, 7, 42**; any carried subset never blocks anything; no `count/score/total/remaining` keys in `state()` |
| L65–L76 | IS-07 | `save()` shape; `load()` round trip (gates, chests, items, befriended, pedestals, bridge); hero spawns at last open gate; `world` items reset; wrong `v`, unknown ids/keys, wrong types, oversize all rejected; 500 fuzz values (incl. `__proto__`) never throw; failed load leaves a playable fresh game |
| L77–L84 | IS-09 | every builder returns a Group with the named children; triangle limits per model and total; shared materials (no per-call material growth); palette keys present; builders pure (call twice ⇒ equal triangle counts) |
| L85 | IS-10 | decoration placement function never lands inside an obstacle/gate/chest/pedestal/spine-path (same seed) |

## §3 Shell battery (`little_adventure_smoke.js`, real everywhere) — S1…S10

S1 page boots with no console errors, `startlittle_adventure` is a function · S2 route contract: registry entry fields match TD §12, tile `data-go="game-little_adventure"` exists (hidden until IS-19, visible after) · S3 back button inside the viewport, hit-testable, ≥ 56 px, returns to the Games hub · S4 no-WebGL fallback text `«3D није доступан овде»` shows and the page is not blank · S5 static no-network rule: new `game/games/little_adventure*.js|mjs` contain no `fetch(`, `XMLHttpRequest`, `WebSocket`, `sendBeacon`, `import(`-from-URL, `http://`/`https://` literals · S6 registry/validators happy (`validate_pages`) · S7 (from IS-11) stick zone, sword and shield buttons inside viewport at 1024×800 and 844×390, ≥ 56 px (sword/shield ≥ 64 px), none covered · S8 (IS-15) no digit characters in visible text nodes of the start screen/HUD · S9 (IS-16) every `button` has a Cyrillic `aria-label` · S10 landscape hint present in the DOM.

## §4 WebGL battery (same file, behind the gate) — W1…W14

W1 `__little_adventure` exists and `state().webgl` · W2 hero moves with `setStick`+`step` and stops on release · W3 closed gate blocks in the real scene (hero pos unchanged after pushing) · W4 `drawCalls` ≤ 150 and `triangles` ≤ 60 000 at start and each zone centre · W5 mesh states match logic for gate/chest/pedestal after `give`/`teleport` · W6 fx table covers every event type · W7 particles alive ≤ 24 in a 60 s flail · W8 reduced-motion response `burst === (rm ? burstReduced : burst)` · W9 speech keys + 4 s repeat guard · W10 beacon tracks `nextObjective` · W11 save round trip through real `localStorage`; corrupt value ⇒ fresh · W12 pause on `visibilitychange`, resume only after touch · W13 context lost/restored does not throw (`WEBGL_lose_context`) · W14 adaptive DPR steps down once, never up. Poll to named phases (`state().gates.G1.open`), not fixed long `step(N)`.

## §5 Manual playtest protocol (`[USER-RUN]`, a child ~4–6 on the real tablet)

Session A (5 min, no help): can the child move with the joystick? Do they find the sword/shield buttons? Do they understand the owl? Session B: do they find the gate key, notice the arrow/beacon, cross the acorn lane, place gems? Observe, don't explain. Record per session: tablet model, age, minutes played, where they got stuck, what made them laugh, any fear/frustration, fps feel. Questions the code cannot answer: Is the joystick too hard under age 5 (fallback idea: tap-to-walk toggle)? Is the sword button reachable by small hands? Is the camera distance right? Are the grumpies friendly-looking, not scary? Is the owl's speech clear? Is 8–12 minutes the right length? Is 60 fps held in the shrine zone?

## §6 Definition of done (whole game)

All L/S/W checks PASS or explicitly SKIP/UNVERIFIED with reasons in the report; `node tools/check_release.js` result recorded; screenshots refreshed (4 viewports); offline second visit works; docs sweep complete; user approved G4; at least one real-tablet playtest round recorded. No locked rule in PS §2 weakened.
