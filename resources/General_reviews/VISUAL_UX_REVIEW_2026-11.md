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

### P4 — Visual confirmation pending (not a defect)

The 164 images have not been inspected by a human or vision model in this session — Big
Pickle cannot read images. The WARN dispositions above are code/measurement based. A
vision-model pass should confirm: first-action clarity, text contrast, clipping, and the
`INIT`-only stage-led pages listed in the table.

## Limitations

- Only the short-landscape audit is automated; portrait/tablet composition is covered by
  screenshots only and still needs eyes.
- `capture-manifest.json` records the last capture run only (by design); per-file truth is
  `screenshot-provenance.json` + `TABLE_OF_CONTENT.md`.
