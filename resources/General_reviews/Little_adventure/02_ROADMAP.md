# 02 — Roadmap

21 cards (`IS-00` … `IS-20`, details in `03_TASKS.md`). Sizes S ≤ 150 changed lines, M ≤ 400. Execute in order unless a card says it is parallel-safe. **One card per AI session.**

| Phase | Cards | Outcome | Env |
| --- | --- | --- | --- |
| 0 Governance | IS-00 | decisions confirmed, package installed, baseline recorded | NODE |
| 1 Skeleton | IS-01, IS-02 | page opens from a (hidden) hub tile, back works, no-WebGL fallback, smoke skeleton, tool wiring | NODE + CHROME |
| 2 Pure logic | IS-03 … IS-07 | the whole game rules run and are tested **in Node** (movement, combat, items, gates, pedestals, save) — no WebGL needed | NODE |
| 3 Render | IS-08 … IS-12 | scene, hero + joystick, models, world, actors → **first playable** | WEBGL / USER-RUN |
| 4 Polish | IS-13 … IS-18 | combat feel, guidance + speech, title/save, accessibility, performance, full test battery | mixed |
| 5 Ship | IS-19, IS-20 | docs sweep, tile unhidden, version bump, tablet playtest rounds | USER-RUN |

## Why logic before rendering

No AI sandbox here has WebGL (`project/lessons/racing3d.md`), so anything drawn cannot be verified automatically. Putting every rule in `little_adventure-logic.js` means ~70 % of the game (and nearly all of its bugs) is covered by real Node tests before a single mesh exists. Rendering then only translates `state()` into transforms.

## User gates (the AI stops and waits)

| Gate | After | The user decides |
| --- | --- | --- |
| G1 | IS-00 | confirm D1 title and any DEFAULT decision they want to change |
| G2 | IS-09 | **look review:** open `little_adventure.html?gallery=1` on the tablet/PC and approve (or change) the hero, owl, grumpy, items — cheap to fix now, costly later |
| G3 | IS-12 | first playable on the real tablet: joystick feel, camera, frame rate, readability; also approve the Serbian speech wording (PS §7) before IS-14 |
| G4 | IS-18 | approve screenshots + test report; allow IS-19 to remove `hidden` from the hub tile |
| G5 | IS-20 | decide after playtest rounds whether to ship, tune, or cut scope |

## Parallelism

IS-03 ‖ IS-02 (different files). IS-04 → IS-05 → IS-06 → IS-07 are sequential (one logic file). IS-08 and IS-09 are parallel-safe after IS-02 (renderer shell vs models file) but IS-10+ need both. Everything else is sequential.

## What could be cut if time or usage runs out (in this order)

Objective arrow (keep the beacon) → rainbow bridge animation (swap for instant) → boss multi-hit mood colour → adaptive DPR → keyboard controls. **Never cut:** the no-fail rules, saving, reduced-motion handling, the no-WebGL fallback, or the Node logic tests.
