# Ocean + Driving: playability and layout fixes

**For:** the local AI working in `E:\GitHub\Games for kids`.
**From:** an independent review on 2026-11-20 of `main` at `209b5e9` (v3.0.17), with the games running in headless Chromium at 4 screen sizes and the layout measured numerically from the live page.
**Scope:** `games/ocean.js`, `games/driving.js`, and the shared engine `games/adventure.js` (+ `adventure-modes.js`). The same engine runs **Dino and Space**, so every engine change must be regression-checked on them.

The painted restyle itself is good (see section 7). The problems are **geometry and playability**: things that were never visible to the test suite, because every smoke passes (Ocean 27, Driving 24, Dino 51, Space 28, Adventure 28).

---

## 0. How to work (read first)

- New branch from `main` (`claude/adventure-playability`). **Never commit or push to `main`**; open a PR and wait for the user. Commit trailer `Agent: <tool>/<model>`.
- Smallest correct fix, YAGNI. After any `game/` change: `node tools/build_offline.js`, `tools/sync-docs.sh` (Git Bash), `node tools/check_fast.js` must be green. Never edit `docs/` by hand.
- **Evidence rule:** never write "verified" or "looks right" unless you produced the evidence. If you cannot view images, SAY SO and hand per-world contact sheets (below) to the vision model or to the user with a pass/fail checklist.
- A new test counts only after you have **seen it fail** on the bug it guards (mutation test).
- Never change approved art to satisfy a check. Max 2 attempts on one CI failure, then stop and report.
- Shared-engine rule: after every engine change run `adventure_smoke`, `dino_smoke`, `space_smoke`, `ocean_smoke`, `driving_smoke`, `touch_interruption_*`, and capture before/after screenshots of Dino and Space.
- No new child-facing text (Serbian Cyrillic only). Large touch targets (design tokens: 48 / 56 / 72 px). No reading needed to play. No fail states.
- **Design decisions that change how the game plays need the user's approval before you build them** (marked DECISION below). Propose with screenshots, then wait.

---

## 1. What was measured (verified)

Method: for each game and screen size, the live page was read through `window.__adv` (player, obstacles, theme) and the bounding boxes of the HUD and control buttons.

### 1.1 Layout at four screen sizes

| Game | Screen | Hero drawn | Hero % of height | HUD bottom | Controls top | **Clear band** (HUD to controls) |
| --- | --- | --- | --- | --- | --- | --- |
| Driving | phone portrait 390x844 | 280x280 | 33% | 180 | 764 | 584 |
| Driving | **phone landscape 844x390** | **280x280** | **72%** | 108 | 310 | **202 (shorter than the car)** |
| Driving | tablet 1024x768 | 280x280 | 36% | 123 | 644 | 521 |
| Driving | desktop 1280x720 | 280x280 | 39% | 115 | 596 | 481 |
| Ocean | phone portrait | 110x100 | 12% | 180 | 681 | 501 |
| Ocean | **phone landscape** | 110x100 | 26% | 108 | 227 | **119 (for a 100 px fish)** |
| Ocean | tablet | 110x100 | 13% | 123 | 518 | 395 |
| Ocean | desktop | 110x100 | 14% | 115 | 470 | 355 |

On a phone in landscape the HUD alone is 28% of the screen height (108 of 390 px).

### 1.2 How much room there is to dodge

- Driving movement clamp: `player.y` in `[roadTopY() + driveTopPadding, H - player.height - 10]` with `roadTop` 0.20 and `driveTopPadding` -20, hero 280. Vertical travel = `0.8*H - 270` px: **42 px at H=390**, 344 at H=768, 405 at H=844.
- Ocean on a phone in landscape: the canvas allows 240 px of travel, but the HUD card, the sound/globe buttons and the control buttons cover the top and bottom, so only about **119 px of the screen is actually clear**; the real free travel is about 19 px.

### 1.3 Driving specifics (all verified in code and screenshots)

1. **The car is too big.** `heroW/heroH = 280`, but the sprite `driving-car-side.webp` has 20% empty padding below the wheels and 20% above (visible 451x309 of 512). Visible car is about **247x169 px**; the cars it must avoid are boxes of about 90-115 px tall (visible about 70-90). The hero is roughly twice the height of what it dodges. In portrait it is 64% of the screen width.
2. **The road is not where the car drives.** The engine treats the road as everything from 20% of the screen height down (`roadTop` 0.20) for all 10 worlds. The painted scenes have no consistent road; some worlds (sunflower field, desert, tropical island) barely show one. So the car and the obstacles roam the whole lower 80% of the picture: the car drives among the trees (worlds 3, 5), a barrier hangs in the sky over the field (world 4), a barrier floats above the hills (world 9), a traffic cone sits in the autumn trees (world 3), another car floats over the treetops (worlds 1, 5).
3. **The shadow is about 55 px below the car.** `adventure.js` line ~1257: `ctx.ellipse(player.x + player.width/2, player.y + player.height + 3, player.width*0.42, 6, ...)` draws at the bottom of the 280 px **sprite box**, not the wheels.
4. **There is an invisible hitbox under the car.** Hero collision rect (lines ~417-420) is x from 8% to 90%, y from **28% to 92%** of the sprite box, but the painted wheels end at about **80%**. About 34 px below the wheels can hit things. The obstacle rect (lines ~421-424) is 12-88% x 14-90% of the obstacle box regardless of how much padding its own sprite has (barrier 32%, truck 23%, car 11%), so some obstacles collide where nothing is drawn.
5. **Obstacles and collectibles are placed at random heights.** Drive-mode spawn (line ~238): `roadTopY() + 16 + Math.random() * (canvas.height - roadTopY() - oh - 32)`. It differs every play, spans the whole lower 80%, ignores where the painted road is, and can put things under the HUD or the controls. Collectibles (line ~255) are the same.
6. `driveTopPadding: -20` lets the car's top rise above the road line.

### 1.4 Ocean and the shared fly mode

1. **Obstacle placement ignores the HUD and the controls.** Fly mode (line ~233): `flyDyScale = (canvas.height * 0.88) / maxDy; y = canvas.height - o.dy * flyDyScale - oh`. It uses the whole canvas, so shapes pass behind the big score card, the sound/globe buttons and the up/down/left/right buttons (a shark behind the card in the "Нoћни океан" world, a trumpet shell behind the card, an anchor next to the buttons).
2. **Entity sizes are fixed in pixels** while vertical spacing scales with the screen height: on a short screen the same obstacles are squeezed into much less room (hero 110x100 and obstacle scale 1.15 do not change).
3. **Obstacles are hard to tell from scenery.** The painted backgrounds contain ships, anchors, shells, rocks and corals that look like hazards, while the real hazards are small and low-contrast against busy paintings (coral reef, sunken ship, pirate treasure worlds).
4. **The HUD is too big on short screens** and the page title text ("Океан" / "Возила") repeats the world name that is already on the card.
5. **Portrait lookahead is short.** The screen is 390 px wide, the hero is near the left, obstacles scroll at a fixed speed, so there is little warning.

---

## 2. Required fixes

Work in three phases. **Stop and wait for the user's approval after each phase's screenshots.**

### Phase 1: one shared "playfield" in the engine (no new art)

**1A. Playfield rectangle.** Compute `pf = {top, bottom, left, right}` in the engine on every resize, from the real HUD and control elements (measure the DOM rects, with a small gap), not from fractions of the canvas. Everything vertical must use `pf`:
- hero clamp in `updateDrive` and `updateFly`,
- obstacle and collectible Y (replace `Math.random()` and `canvas.height*0.88`),
- the goal gate.
Controls that only occupy the bottom corners may be treated as corner exclusion zones instead of a full-width band; the AI decides, but nothing the child must react to may ever be drawn under an overlay.

**1B. Entity scale `u`.** Compute `u = clamp(pf.height / REF_PF_H, U_MIN, 1)` with `REF_PF_H` = the tablet clear band (about 520 for Driving, about 395 for Ocean, or one common value) and `U_MIN` about 0.5. Apply `u` to hero, obstacle and collectible **sizes**. Floors so things stay visible: hero visible height >= 56 px, obstacles >= 48 px.

**1C. Compact HUD on short screens.** When `canvas.height < 500`:
- HUD top band <= 56 px (about 15% of 390),
- hide the page title overlay (it repeats the world name),
- shrink the card to icon + number (world name hidden or very small),
- keep sound/globe/back as 48 px minimum touch targets, grouped,
- control buttons 56-64 px.
Use the shared paper kit tokens (`styles/design-tokens.css`, `styles/components.css`); do not invent a second kit. Re-check Dino and Space (they use the same HUD).

**1D. Reaction-time budget.** Scroll speed must scale so the time from an obstacle entering the screen to reaching the hero is at least **2.0 s** at every screen size (`speed *= clamp(W/1024, 0.6, 1)` as a starting point). Measure and report the actual seconds.

**1E. Debug overlay.** Add `?debug=pf` (no network, no UI text) that draws `pf`, the hero hitbox, the obstacle hitboxes and the shadow baseline. Use it for the screenshots and for review.

### Phase 2: Driving: car, road, shadow, hitboxes

**2A. Car size.** Size the hero from its **visible** bounds, not the padded box. Target: visible car height about 0.28-0.33 of the road band height (at most one lane tall), visible height roughly the same as the obstacle cars (so about 100-110 px on a tablet, scaled by `u`). Get the visible bounds from the sprite's alpha box (the Explorer already has a proven `stemBox()` in `games/kitty-standalone.js`; **extracting it into one shared module is the right move now that a second consumer exists. Propose it and ask first, because it touches the finished Explorer; do it in its own commit with `kitty_smoke` unchanged and green**).

**2B. Road band.** Replace the global `roadTop = 0.20` with a **per-level road band** (`road: {top, bottom}` as fractions of the scene) in `driving.js`, one entry per world, measured from the painted scene. Clamp the car's **wheel line** (visible bottom) inside the band; remove `driveTopPadding: -20`. Use the `?debug=pf` overlay and verify each world with a screenshot.
DECISION (show the user both, recommend B):
- A. Keep the painted scenes; tune the band per scene. Cheap, but worlds without a visible road still look like driving on grass.
- B. Add a painted **road strip** layer per world (tileable, with a visible edge and lane marks), drawn by the engine at the band, the way the Explorer has a ground cap and Ocean has a seabed strip. Needs generated art: propose the asset list with Cloudflare prompts per the style bible, and wait for approval before generating anything.

**2C. Lanes.** Place obstacles and collectibles on **lanes** inside the band (3 lanes) at deterministic positions from the level data, not `Math.random()`. A seeded pattern is fine if it is identical every play. Guarantee that at every horizontal window at least one lane is free (never a full wall), and that the free gap is >= 1.3x the hero hitbox height.
DECISION (propose, do not build silently): on small screens, consider **lane-change controls** (up/down moves one lane smoothly instead of free vertical movement). It is much easier on a phone. Show the user a mockup of both behaviors.

**2D. Shadow.** Draw the shadow at the car's **visible bottom** (wheel line), width = visible width x 0.8. Remove the `+ player.height + 3` formula. Gap between wheels and shadow <= 4 px at every screen size.

**2E. Hitboxes from sprite bounds.** Derive hero and obstacle hitboxes from each sprite's visible alpha box (shrink about 10% for forgiveness) instead of the magic fractions (28-92%, 12-88%...). The hero hitbox bottom must be within +-3 px of the visible wheel line. This also fixes obstacles whose sprite padding differs (barrier, truck, car).

### Phase 3: Ocean: readability and the remaining shared fixes

**3A. Obstacles vs scenery.** Obstacles must read instantly against busy painted backgrounds. Propose and show screenshots: a soft light halo / outline (a cheap `shadowBlur` white 6 px at 60% works) and/or a gentle low-contrast overlay under the play layer. Do not change the approved scenes without asking.

**3B. Ocean placement and scale.** Use the Phase 1 `pf` and `u` for fish, obstacles and collectibles; keep the vertical rhythm of each world's `dy` data but fit it to `pf`.

**3C. Seabed/controls overlap.** Nothing the child must react to may sit within the control exclusion zones; if the original level data puts an obstacle there, move it in the level data (a data change, not an engine special case).

**3D. Check Dino and Space** for the same HUD and `pf` changes (screenshots before and after, 4 screen sizes each). They must not regress.

---

## 3. Acceptance matrix (must be demonstrated, not claimed)

Screen sizes: **390x844, 844x390, 667x375 (small phone landscape), 1024x768, 1280x720.** Games: Driving (all 10 worlds) and Ocean (all 10 worlds). The menu order is shuffled on every load, so identify worlds by name (`__adv.theme.name`).

| # | Check | Target |
| --- | --- | --- |
| 1 | HUD top band at heights < 500 | <= 56 px |
| 2 | Hero visible height | >= 56 px and <= 1/3 of the clear band |
| 3 | Free vertical travel / (hero visible + largest obstacle) | >= 1.2 at 844x390 and 667x375 (tablet is already > 1.5) |
| 4 | Reaction time (obstacle enters screen to reaches hero) | >= 2.0 s at every size |
| 5 | Every obstacle and collectible centre inside `pf`; none under an overlay | 100% of all levels, at every size |
| 6 | Free gap at every horizontal window | >= 1.3x hero hitbox height, always at least one open lane |
| 7 | Driving: shadow gap (wheel line to shadow) | <= 4 px |
| 8 | Driving: hero hitbox bottom vs visible wheel line | within +-3 px |
| 9 | Driving: obstacles on the road band | 100% (nothing in the sky or trees) |
| 10 | Controls | >= 48 px (token), 56 px preferred |
| 11 | Dino, Space, Adventure, Ocean, Driving smokes + `touch_interruption_*` | all green; Dino and Space screenshots unchanged except the compact HUD |
| 12 | Determinism | two loads of the same world give identical obstacle positions |

Add automated guards in the existing smoke files (`ocean_smoke.js`, `driving_smoke.js`, `adventure_smoke.js`):
- a **viewport matrix** test that resizes the page to the sizes above and asserts rows 1, 2, 5, 10, 12 from live DOM and `__adv`;
- a **level-data test** (no rendering needed) that asserts rows 5, 6, 9 for every level at every size;
- a **geometry test** for rows 7 and 8 from the sprite alpha box.
Each test must be proven by mutation: put the bug back (restore the old shadow formula, the old random Y, a 280 px car) and see it fail.

---

## 4. Order of work and stops

1. **Step 0:** `git status`, branch, `gh run list`; confirm CI green on `main`; run the **full battery** once for a baseline (`node tools/run_all.js`, including `racing3d_smoke.js`, which needs a GPU). Known noise in a GPU-less sandbox: `racing3d_smoke` chase-cam, and `puzzle_smoke` / `runtime_error_smoke` can fail only under load; rerun them alone before reporting.
2. **Phase 1 -> screenshots (6 sizes x 2 games x 3 worlds) + tests -> STOP.**
3. **Phase 2 -> DECISIONS A/B and lane-change -> STOP for approval -> implement -> STOP.**
4. **Phase 3 -> STOP.**
5. One version bump at the very end (3.0.17 -> 3.0.18), never per phase. Docs discipline: one `ACTIVE.md` entry per task (read `ACTIVE.md`/`INDEX.md` for the next number), `archive_tasks`, accurate `STATUS.md` (no claims you did not verify), `check_docs`, lessons.

Deliver a contact sheet per game per size (all 10 worlds) so the user can judge; the user will also test on a real phone.

---

## 5. Do not do

- Do not change creature sizes in Dino or Space, or restyle them. Do not touch the approved Ocean and Driving scenes (ask first).
- Do not start the art reorganization (tasks 438-443); it is obsolete.
- Do not make `Math.random()` placement "better": remove it from level layout.

---

## 6. Reuse: in-page measurement snippet

Run in each game page (replace the selector list if a control id differs). It reports the numbers in section 1.

```js
(() => {
  const c = document.getElementById('adv-canvas'), cr = c.getBoundingClientRect(), P = __adv.player;
  const rect = e => { const r = e.getBoundingClientRect(); return { t: r.top - cr.top, b: r.bottom - cr.top, l: r.left - cr.left, r: r.right - cr.left }; };
  const ov = [...document.querySelectorAll('#adv-controls button, #adv-controls > *, #adv-score, #adv-title, #adv-level, #adv-music-btn, #adv-worlds-btn, .ps-back, .back-btn')]
    .filter(e => e.offsetParent !== null).map(e => ({ id: e.id || String(e.className).slice(0, 18), ...rect(e) }));
  const H = c.height, top = ov.filter(o => o.b < H * 0.4), bot = ov.filter(o => o.t > H * 0.45);
  const hudBottom = top.length ? Math.max(...top.map(o => o.b)) : 0;
  const ctlTop = bot.length ? Math.min(...bot.map(o => o.t)) : H;
  return { W: c.width, H, hero: [P.width, P.height], hudBottom, ctlTop, clearBand: ctlTop - hudBottom, theme: __adv.theme && __adv.theme.name };
})()
```

Sprite visible bounds (for hero size, shadow and hitboxes): scan the alpha channel of the 512x512 WebP (alpha > 24). Measured today: `driving-car-side` visible 451x309 (padding top 102, bottom 101); `driving-obstacle-car` 451x399; `driving-obstacle-truck` 451x271; `driving-obstacle-barrier` 451x186.

---

## 7. What is good: do not regress

- The painted scenes in both games are beautiful and consistent with the style bible; Ocean on a tablet is excellent.
- The paper HUD card is cohesive; the sound/globe/back buttons match.
- All engine smokes pass; the shared-engine structure is sound. The fix is a geometry layer, not a rewrite.

---

## 8. Decisions the user must make (propose, do not decide)

1. Driving road: A (tune per painted scene) or B (painted road strip layer, needs new art). Recommendation: B.
2. Lane-change controls on small screens instead of free vertical movement. Recommendation: offer it, default to free movement on tablet.
3. Obstacle halo/outline treatment in Ocean (Phase 3A options with screenshots).
4. Any of the above changing the feel of the games should be played on a real phone before merging.
