# Short-landscape audit — 844×390 (spec §11)

Generated: 2026-10-10 10:04 UTC · task 217 (V3.1) · `node tools/short_landscape_audit.js`

Every surface (hub + 24 registry apps) measured at **844×390** against the
Master Visual/UX plan §11 checklist: header budget 56–72 px, board-first,
no h-overflow, no clipped chrome, no title behind the back button, no
unreachable control, no essential text under 12 px. Animations are paused
and fonts settled before measuring, so the numbers are deterministic.

**FAIL = §11 violation (the V3.2 worklist, to fix in §11 order: remove
decoration → collapse secondary text → move secondary controls → resize
stage → only then reduce non-critical typography). WARN = needs a human
adjudication. The tool exits 1 while any FAIL remains.**

| Surface | Title | Header px | Verdict | Fails | Warns |
|---|---|---:|---|---:|---:|
| `hub` | 🌈 Петрин свет | 65 | OK | 0 | 0 |
| `animals` | (none) | 72 | WARN | 0 | 1 |
| `animal_counting` | (none) | 72 | WARN | 0 | 1 |
| `animal_memory` | Памтилица животиња | 88 | WARN | 0 | 3 |
| `animal_puzzle` | Слагалица | 72 | OK | 0 | 0 |
| `classroom` | Учионица | 72 | OK | 0 | 0 |
| `compare` | Где има више? | 83 | WARN | 0 | 1 |
| `sorting` | Разврстај! | 88 | WARN | 0 | 1 |
| `phonics` | (none) | 66 | WARN | 0 | 1 |
| `sequencing` | Постави у редослед! | 66 | OK | 0 | 0 |
| `rhythm` | Слушај, па понови | 66 | OK | 0 | 0 |
| `spatial` | Где је лопта? | 66 | OK | 0 | 0 |
| `maze` | Пронађи пут до куће | 90 | WARN | 0 | 1 |
| `coloring` | Жаба | 72 | OK | 0 | 0 |
| `tracing` | Писање | 72 | OK | 0 | 0 |
| `piano` | Клавир | 75 | WARN | 0 | 1 |
| `shapes` | (none) | 72 | WARN | 0 | 1 |
| `matching_game` | (none) | 72 | WARN | 0 | 1 |
| `driving` | Возила | 83 | WARN | 0 | 1 |
| `ocean` | Океан | 83 | WARN | 0 | 1 |
| `dino` | Дино | 83 | WARN | 0 | 1 |
| `space` | Свемир | 83 | WARN | 0 | 1 |
| `racing3d` | 🏎️ Мала тркачица 3Д | 32 | OK | 0 | 0 |
| `explorer` | Свет | 64 | OK | 0 | 0 |
| `parent` | 🔒 За родитеље | 72 | WARN | 0 | 1 |

**Summary:** 25 surfaces · 10 OK · 15 WARN · 0 FAIL · 0 error · 0 individual failures.

## Warnings — adjudicate

### `animals`

- WARN: no header text visible (.ps-title / h1 / #*-prompt) — stage-led page? adjudicate

### `animal_counting`

- WARN: no header text visible (.ps-title / h1 / #*-prompt) — stage-led page? adjudicate

### `animal_memory`

- WARN: v-scroll: document is 432px tall in a 390px viewport (essential content must fit without scrolling)
- WARN: header budget: top chrome reaches 88px (spec §11.1: 56–72px)
- WARN: control needs scrolling to reach: button.diff-btn

### `compare`

- WARN: header budget: top chrome reaches 83px (spec §11.1: 56–72px)

### `sorting`

- WARN: header budget: top chrome reaches 88px (spec §11.1: 56–72px)

### `phonics`

- WARN: no header text visible (.ps-title / h1 / #*-prompt) — stage-led page? adjudicate

### `maze`

- WARN: header budget: top chrome reaches 90px (spec §11.1: 56–72px)

### `piano`

- WARN: header budget: top chrome reaches 75px (spec §11.1: 56–72px)

### `shapes`

- WARN: no header text visible (.ps-title / h1 / #*-prompt) — stage-led page? adjudicate

### `matching_game`

- WARN: no header text visible (.ps-title / h1 / #*-prompt) — stage-led page? adjudicate

### `driving`

- WARN: header budget: top chrome reaches 83px (spec §11.1: 56–72px)

### `ocean`

- WARN: header budget: top chrome reaches 83px (spec §11.1: 56–72px)

### `dino`

- WARN: header budget: top chrome reaches 83px (spec §11.1: 56–72px)

### `space`

- WARN: header budget: top chrome reaches 83px (spec §11.1: 56–72px)

### `parent`

- WARN: control needs scrolling to reach: button.gate-choice

## Notes

- `hub`: back: none on this surface · modal: none open in the default state
- `animals`: modal: none open in the default state
- `animal_counting`: modal: none open in the default state
- `animal_memory`: modal: none open in the default state
- `animal_puzzle`: stage: no .board-slot/.piece elements in the default state (board not audited here) · modal: none open in the default state
- `classroom`: modal: none open in the default state
- `compare`: modal: none open in the default state
- `sorting`: modal: none open in the default state
- `phonics`: modal: none open in the default state
- `sequencing`: modal: none open in the default state
- `rhythm`: modal: none open in the default state
- `spatial`: modal: none open in the default state
- `maze`: modal: none open in the default state
- `coloring`: modal: none open in the default state
- `tracing`: modal: none open in the default state
- `piano`: modal: none open in the default state
- `shapes`: modal: none open in the default state
- `matching_game`: modal: none open in the default state
- `driving`: modal: none open in the default state
- `ocean`: modal: none open in the default state
- `dino`: modal: none open in the default state
- `space`: modal: none open in the default state
- `racing3d`: modal: none open in the default state
- `parent`: modal: none open in the default state
