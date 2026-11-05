# Visual/UX review — November 2026

**Task:** 379 · **Date:** 2026-11-05 · **Agent:** OpenCode / Big Pickle
**Battery:** `resources/General_reviews/Screenshot_Review/` · **Audit:** `resources/General_reviews/SHORT_LANDSCAPE_AUDIT.md`

## Scope and evidence

| Item | Result |
|---|---|
| Default-state captures | 108 PNGs = 27 surfaces × 4 viewports (`phone-portrait`, `phone-landscape`, `tablet-portrait`, `tablet-landscape`) |
| Gameplay-state captures | 56 PNGs = 14 surfaces × 4 viewports (`<page>__<viewport>__PLAY.png`) |
| Provenance | 164/164 files refreshed at task 379 (`screenshot-provenance.json`, `TABLE_OF_CONTENT.md`) |
| Browser runtime errors | none in any capture run (`PASS no browser runtime errors`) |
| Short-landscape audit (844×390) | 27 surfaces · 12 OK · **15 WARN** · 0 FAIL · 0 error |
| axe-core 4.10.2 (WCAG 2.0/2.1 A+AA) | 27 surfaces scanned · **0 violations** (critical/serious/moderate/minor all 0) |

Reproduce:

```bash
node tools/screenshot.js --review=Screenshot_Review --task=379
node tools/screenshot.js --review=Screenshot_Review --pages=<play-pages> --state=PLAY --task=379
node tools/short_landscape_audit.js
node tools/axe_check.js
```

### Gameplay states captured

`animals`, `animal_counting`, `animal_memory`, `animal_puzzle`, `classroom`, `compare`,
`sorting`, `phonics`, `spatial`, `piano`, `rhythm`, `coloring`, `shapes`, `cat_forest`.

`tools/visual-states.json` was corrected against the current code — several hooks were stale
and silently no-ops (they used `?.click(); true`, so a missing selector still "passed"):

| Surface | Old hook | Problem | New hook |
|---|---|---|---|
| `animals` | `.animal-card` click | card has a `pointerdown` handler, not click | `#recogToggle` → recognition mode |
| `animal_counting` | `.counting-choice` | class does not exist | first `.count-tile` click |
| `animal_memory` | `.memory-card` | class does not exist (cards are `.card`) | first `.card` click (flip) |
| `animal_puzzle` | `#sceneButton` | starts the already-running puzzle | `#puzzlePeek` → preview overlay |
| `classroom` | `.class-tab[data-tab="shapes"]` | tab bar does not exist on the hub | `.activity-btn[data-activity="shapes"]` |
| `compare` | `.cmp-group` | fails in "same" mode | mode-aware via `window.__compare.state()` |
| `shapes` | — | drag-only | keyboard select + place (Enter on piece, Enter on slot) |

Pages with **no** deterministic gameplay state were left at `INIT` only and are not in the
PLAY battery: `sequencing`, `maze`, `matching_game` (drag-only), and `dino`, `driving`,
`ocean`, `space`, `explorer`, `tracing`, `racing3d`, `fastcat` (continuous-action; the
default capture already shows the running scene).

`tools/screenshot.js` now also lists PLAY files in `TABLE_OF_CONTENT.md` (the previous size
match only recognised `<page>_<size>.png`, so every state capture was silently omitted).

## Short-landscape WARN dispositions (15)

| # | Surface | Warning | Disposition |
|---|---|---|---|
| 1 | `animals` | no header text visible | **Acceptable by design.** Flashcard-led; the visible prompt is the animal card + `#animalName`, and the recognition prompt appears in the PLAY state. |
| 2 | `animal_counting` | no header text visible | **False positive.** Visible `<h2 class="count-title">Бројање животиња</h2>` (`game/games/animal_counting.js:10`); the audit only accepts `.ps-title`, `h1`, `#*-prompt`, `#world-name`. |
| 3 | `compare` | header 83 px (budget 56–72) | **Actionable, low.** Title + answer row; costs 11 px of stage at 844×390. |
| 4 | `sorting` | header 88 px | **Actionable, low.** Title + bin/control row. |
| 5 | `phonics` | no header text visible | **Acceptable by design.** Letter is the prompt, rendered in the stage; `.top-bar` is controls only. |
| 6 | `maze` | header 90 px | **Actionable, low.** Tallest header in the app; title wraps or control row grows. |
| 7 | `shapes` | no header text visible | **Acceptable by design.** Puzzle stage is self-explanatory; tier buttons are the only chrome. Confirm in visual pass. |
| 8 | `matching_game` | no header text visible | **Acceptable by design.** Match-3 stage; score + hint are the chrome. |
| 9 | `driving` | header 83 px | **Actionable, low.** Shared arcade HUD header (same for `ocean`, `dino`, `space`). |
| 10 | `ocean` | header 83 px | Same shared arcade header. |
| 11 | `dino` | header 83 px | Same shared arcade header. |
| 12 | `space` | header 83 px | Same shared arcade header. |
| 13 | `fastcat` | no header text visible | **Acceptable by design.** Runner; HUD is the interface. |
| 14 | `cat_forest` | no header text visible | **Acceptable by design.** Scene-led; guide lives in the scene. |
| 15 | `parent` | `button.gate-choice` needs scrolling | **Actionable, highest priority.** See finding P1. |

## Prioritized findings

### P1 — Hub learning tile is visually blank / label displaced (new visual finding)

The task-379 default captures show the green learning tile on the hub without its icon or label at `hub_phone-landscape.png` (844×390) and `hub_phone-portrait.png` (390×844). At both tablet sizes, the green tile remains blank while the `УЧЕЊЕ` label appears detached near the lower edge of the screen (`hub_tablet-portrait.png`, `hub_tablet-landscape.png`). The adjacent pink `ИГРЕ` tile renders normally. This is a high-impact navigation clarity issue: the first screen presents a large, unlabeled green control beside a clearly labeled games control.

- **Evidence:** all four task-379 hub default screenshots; source markup in `game/index.html:275-276` includes `.tile-emojis` and `.tile-label` inside `.hub-tile.tile-learning`; the tile's styles are at `game/index.html:95-116` and art-painting pass at `game/index.html:343-374`.
- **Proposed investigation:** inspect the post-`Art.fill` DOM/layout and computed sizing for `.tile-emojis`, `.tile-label`, and `.hub-tile.tile-learning`; confirm whether the composite art-painting pass or flex sizing causes the icon/label to escape the tile. Keep the existing artwork and two-tile navigation concept.
- **Fix direction:** keep the icon cluster and `УЧЕЊЕ` label visibly grouped inside the green tile at all four supported viewport sizes; add screenshot assertions/visual regression coverage for this tile.
- **Validation:** refresh all four hub screenshots; verify label and icons remain inside the green tile at 390×844, 844×390, 820×1180 and 1180×820; run `node tools/check_fast.js`, `node tools/check_docs.js`, and the hub smoke.

### P1 — Parent gate is below the fold at 844×390 (actionable)

`game/pages/parent.html:115-155` puts the «Статус» and «Напредак» sections before
`#parentGate`. At 390 px viewport height the gate question/choices are pushed off-screen,
so the page opens with status cards and no visible lock control; a parent has to scroll to
find the multiplication gate that protects «Радње». The audit flags the first
`.gate-choice` as unreachable without scrolling.

- **Impact:** parent friction and a weaker lock affordance on phones in landscape.
- **Proposed fix:** in the short-landscape media query, order `#parentGate` first (or move
  it above the info sections in the DOM), keeping `#parentActions` hidden until unlocked.
- **Validation:** `short_landscape_audit` parent → OK, `parent_phone-landscape.png`
  regenerated, `node tools/run_all.js --game parent`.

### P2 — Short-landscape header budget (actionable, low)

`compare` 83, `sorting` 88, `maze` 90, and the four arcade pages (`driving`, `ocean`,
`dino`, `space`) 83 px against the 56–72 px spec. No FAIL and no clipping; the cost is
stage height on the shortest viewport.

- **Proposed fix:** compact the title/control row under `(max-height: 480px)`; the arcade
  four share one shell, so one CSS change covers them.
- **Validation:** audit table + refreshed phone-landscape screenshots.

### P3 — Audit header-text selector is narrower than the design (tool fix)

The audit does not count `h2` (or `.count-title`), producing WARN #2 above. Either widen
the selector or document the exception; leaving it creates a permanent false WARN.

### Visual confirmation — GPT-6 image review (2026-11-05)

I visually inspected all 27 phone-landscape default screenshots and all 14 phone-landscape PLAY captures, plus targeted phone-portrait and tablet screenshots for the hub, parent, compare, maze, sorting and coloring surfaces. This is a broad visual pass, not a pixel-by-pixel inspection of all 164 files; tablet/portrait PLAY variants and the remaining non-landscape defaults still need a dedicated pass.

Additional observations:

- `hub`: the learning tile is blank and its label is displaced outside the tile at all four default viewports (P1 above).
- `parent`: the phone-portrait gate is visible without scrolling; the 844×390 landscape capture shows status and progress panels before the gate, with the answer choices below the fold. This is a viewport-specific issue, not a general parent-page failure.
- `compare`: portrait composition is very sparse, with a small central task cluster and large unused vertical bands. Not a blocker; consider increasing the task-card scale/using the available height if it remains comfortable for children.
- `animal_counting`: the landscape stage is visually very empty and the animal targets are small relative to the large white board. Review target scale and board balance in the next visual pass; no functional defect established.
- `coloring`: portrait layout separates drawing area and palette cleanly; landscape compresses the palette against the drawing card. Verify touch targets and ensure the palette does not cover drawable content during interaction.
- `cat_forest`: the PLAY capture shows several characters/treats clustered at the first feeding position. Confirm the seeded state is representative and that visitors do not visually overlap during normal play.

The short-landscape WARN dispositions remain code/measurement based; the image pass confirms the parent-gate and header-height concerns visually. The 0-violation axe result is automated accessibility evidence, not a substitute for child usability testing.

## Limitations

- Only the short-landscape audit is automated; portrait/tablet composition is covered by
  screenshots only and still needs eyes.
- `capture-manifest.json` records the last capture run only (by design); per-file truth is
  `screenshot-provenance.json` + `TABLE_OF_CONTENT.md`.


### Review boundary

No runtime files were changed during task 380. The findings above are proposed scopes; implementation tasks should be created only after owner review/approval. Local browser interactions and physical-device playtesting were not performed by GPT-6 in this session.
