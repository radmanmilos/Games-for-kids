# Asset review — `assets_work_in_progress_bundle`, all 131 files

Reviewed 2026-10-29 against `main` at `63fb8dd`. A first pass covered 89 files; this version adds the 42 files that arrived afterwards and the 3 that changed (`drum`, `moon`, `wrapped-candy`; all three look fine).

## How to read this

- **Instruction applied:** the background is cut away later, so paper colour, panels or strips on the canvas, canvas shape, transparency and marks that live on the background were **not** judged. What was judged: how the subject itself is rendered, fit with the two anchors (`Reference/bear.png`, `Reference/star.png`) and `STYLE_BIBLE.md`, identity and legibility, and whether the file matches its own brief.
- **Verified** = seen by eye at full size or in 100% crops, and/or measured (appendix). **Hypothesis** and **needs a person** are labelled.
- **Approvals are respected.** Most flagged files are `USER-APPROVED`. This review does not overturn an approval; it flags a deviation of *finish* and supplies a finish-only brief that pins the approved design with `--subject-ref`. Keep the current file unless a candidate is clearly better.
- Nothing was generated. No game file, inventory, progress or status document was changed.

## 1. Result

| # | Asset | Verdict | Confidence | Brief in this package |
|---|---|---|---|---|
| 1 | `cow` | **Regenerate** | high | `prompts/cow.md` (new) |
| 2 | `duck` | **Regenerate** | high | `prompts/duck.md` (new) |
| 3 | `fish` | **Regenerate** | medium-high | `prompts/fish.md` (new) |
| 4 | `egg` | **Regenerate** (iteration 3; never approved) | high | `prompts/egg.md` (revised) |
| 5 | `skis` | **Regenerate, finish only** (approved today for shape) | high on the finding | `prompts/skis.md` (revised) |
| 6 | `medal` | **Regenerate, finish only** (approved today) | high | `prompts/medal.md` (revised) |
| 7 | `notebook` | **Regenerate, finish only** (approved today) | medium-high | `prompts/notebook.md` (revised) |
| 8 | `apple` | **Regenerate** | medium: a visual call, not a metric | `prompts/apple.md` (new) |
| 9 | `cat` | Optional | low-medium | `prompts/cat.md` (new) |
| 10 | `dog` | Optional | low-medium | `prompts/dog.md` (new) |

**Your decision, no prompt written** (a prompt would not be the right tool, or the call is yours):

- `star` — a *different, flatter star* than the canonical `Reference/star.png` (no creamy highlight, no orange edge warmth, symmetric, felt-like). It is the board's "reward star". Options: keep it as a separate reward star, or use the canonical star file itself. A prompt would mean redrawing the canonical star, which `STYLE_BIBLE.md` forbids.
- `cards-pattern` — the most vector-like file in the bundle: crisp, uniform dots, plus-signs and leaves in rigid columns. Dots and crosses are SVG/CSS territory (preflight §4 asks whether image generation is the right method). Not seamless, so a regeneration cannot promise a tile either.
- `needle` — a hairline grey needle, 3.4% of the frame, small-size contrast 13.6 (lowest of the 131 inventory QA rows; next are `surfboard` 14.9, `snowflake` 25.1 and `soap` 25.9). You asked for it thinner in iteration 2, so I would only redo it if it has to read at card size.
- `butterfly` — carries a smiling face, while its inventory row says "no face/personification unless specifically approved". It matches the faced `caterpillar` in the same sequence, so I would keep it. Review still pending.
- `soap` — softest small subject in the bundle (contour sharpness 6.7 against a median of 20.1) with translucent bubbles that will cut out badly from a pale pink body. Review still pending; decide when you review it.

## 2. Evidence for the flagged files (verified)

**`cow`, `duck`** — raster-emoji crops from the two reference boards, enlarged by task 292 (`Reference/Little Play Illustration Asset Catalog.png`, `Reference/New Illustrated Assets Board.png`; the cow and the duck are tiles of a ~100 px table row). Contour sharpness 7.5 and 8.1 against a median of 20.1 (3rd and 5th softest of 131); fine texture 2.7 and 1.5 against a median of 8.5 (`duck` is the flattest of all 131). The cow also has a pale halo around its outline that a cut-out would keep. They sit next to painted `sheep`, `chick`, `chicken`. The duck's inventory row warns against an elaborate duckling, so its brief stays low-detail.

**`fish`** — contour sharpness 10.5 (7th softest of 131). At full size the fins and tail blur into the body and the surface is a coarse, enlarged felt-like blotch. Cool turquoise subject in a warm family: the brief states the colour and bans the greys, and uses a cool painted reference (`elephant.png`) as the water-drop lesson prescribes.

**`apple`** — lower confidence. The surface is an enlarged coloured-pencil/felt scribble with a scalloped contour and no soft highlight, unlike the smooth painted washes of `banana`, `pear`, `strawberry` and `apple-green`. It is shown beside `banana` and `strawberry` in `game/games/sorting.js`, and `apple-green` is its direct sibling. The numbers alone do not prove it (contour sharpness 15.3 is near normal; its texture score 3.5 is low, but painted `pear` scores 2.5), so this rests on the visual comparison.

**`egg`** — fails its own iteration-2 brief. The shell is two zones, a speckled darker cap and a near-white lower half, joined by a wavy drip-like line; the brief asked for one cream-beige shell with the lower third the *deepest* tan. It reads as dipped, peeled or stained, in two sequences (egg → chick → bird, egg → caterpillar → butterfly). The sentence that asked for speckles on "the upper half and the sides" and shading on "the lower third" was read as two zones; iteration 3 asks for one continuous shell, speckles everywhere, and names the failure.

**`skis`** — the only photographic object in the bundle: real wood grain, a woven fabric strap and a studio-style soft shadow (100% crop next to the painted wood of `sled.png`). Approved today after three iterations about *shape*, so the brief pins that shape with `--subject-ref` and changes only the finish.

**`medal`** — smooth digital gold with a bevelled rim, a crisp vector-like outline on the bear emblem, no paper grain (100% crop next to `bear.png`), halftone/noise hatching on the ribbon and a ragged ribbon top that sits 1.8% from the canvas edge. The original brief asked for a plain face; the bear is a leak from the bear reference. Approved with the bear, so the finish pass keeps it.

**`notebook`** — reads as a photographed product (realistic page edges, fabric-like cover, studio shadow) with a painted bear on top: two finishes in one file. Contour sharpness 7.5 (4th softest). Same bear leak as the medal (the original brief asked for a plain cover). The cover bear's left ear came out as a pointed wedge.

**`cat`, `dog`** — attractive and close to the family. Contour sharpness 11.5 and 12.2 (the painted, fluffy `chick` is 12.1, so sharpness alone does not condemn them); fine texture 4.7 and 4.8 against 8.8 for `chick` and 10.7 for `sheep`. The gap is a missing fine paper grain, not a different style. They share the sorting game with `apple`, so replace the three as one batch, if at all.

## 3. Systemic findings

1. **Bear leak.** `medal`, `notebook`, `card-stack` and `playing-cards` all show a cream or honey bear that is a copy of the bear anchor. For `medal` and `notebook` the briefs asked for a plain surface. All four are approved, so I kept the emblem; just be aware that references can leak their subject into objects.
2. **Reference pool.** `tools/asset_refpool.js` decides "painted" by *width ≥ 1000 px* only, so the raster-emoji files, enlarged to 1024² by task 292, now count as painted and the code comment ("emoji rasters are only sent when named") is out of date. In practice the risk is small: a default run (`--refs 2`) sends only `bear` and `star`; `medal` ranks 31/131, `notebook` 45, `skis` 46, `dog` 54, `cat` 58, `cow` 73, `duck` 76. All briefs in this package pin `--ref-files`.
3. **Two detail tiers inside the approved set** (hypothesis, no action): a soft sticker-like tier (`bear`, `elephant`, `lion`, `pig`, `chick`) and a finer storybook tier (`bird`, `deer`, `flamingo`, `mouse`, `zebra`, the vehicles). `STYLE_BIBLE.md` §11 asks for similar detail density across a family; keep it in mind for new briefs rather than regenerating.
4. **Painted ground shadows** (hypothesis for the cut-out): `egg`, `deer`, `zebra`, `snowman`, `meteor`, `basket`, `bell`, `cactus`, `rock` and others carry a painted oval shadow that is part of the picture, not the paper. A background remover may keep or half-remove it. Test on three files first. All new briefs forbid ground and cast shadows.
5. **Docs lag.** `project/STATUS.md` still says the bundle holds 91 PNGs; it holds 131.

## 4. Checked and not flagged

- **`elephant`, `lion`, `pig`** — I first suspected them; at full size they share the bear's construction. Their differences were all background or canvas.
- **`sun`, `comet`, `puzzle-piece`, `ice-cube`** — glossy highlights, halo, tilted 3D shadow and glass look are all in their approved briefs (the sun's corona and highlight, the comet's soft highlight and geometry, the puzzle's tilted shadow were your requests). Kept.
- **`bird`, `deer`, `flamingo`, `giraffe`, `zebra`, `bat`, `eye`, `pickaxe`, `tractor`, `helicopter`, `car`, `sled`, `parrot`, `pine-tree`, `satellite`** — more detailed than the bear but consistent as a tier and painted. `parrot` is the loudest animal (saturation 0.53) but natural for a macaw.
- **Scenes** (`night-sky`, `sunrise`, `sunset`) are full-bleed, not cut-out objects; `celebration`, `meteor`, `school`, `skier`, `snowflake`, `spaceship`, `surfboard`, `telescope`, `volcano`, `wave`, `ball`, `basket`, `beach-umbrella`, `bell`, `cactus`, `clock`, `compass`, `evergreen-lantern`, `galaxy`, `grass`, `mountain`, `pencil`, `puddle`, `rainbow`, `road-barrier`, `rock`, `card-stack`, `playing-cards` look aligned.
- No file is clipped at the canvas edge; no file has a banned outline, face on an object (other than the `butterfly` question) or text.

## 5. Needs a person or a tablet (not testable here)

- Small-size legibility on the real game backgrounds: `needle`, `surfboard`, `snowflake`, `soap`, `dango`, `flower` (the palest subjects by the inventory's small-size contrast).
- A background-removal test on files with painted shadows.
- Whether the bear emblem on `medal`, `notebook` and the cards is wanted (a one-line edit in each brief removes it).
- Whether the approved `skis` (two short, wide boards with no visible upturned tip) read as skis to a child.

## Appendix — method

All 131 files were viewed in category contact sheets (grey padding) and every suspect again at full size or at 100% crops. Screening metrics, reproducible with `appendix/review_metrics.py` (output in `appendix/review_metrics.csv`), measure the subject only: contour sharpness (higher = crisper contour; an enlarged low-resolution raster scores low), fine texture (higher = more visible paper grain and detail), saturation, coverage. Bundle medians: sharpness 20.1, texture 8.5, saturation 0.29. They are screening aids only: fluffy subjects legitimately score low on sharpness, patterned ones high on texture, and smooth painted fruit low on texture. Every flag above was confirmed by eye.
