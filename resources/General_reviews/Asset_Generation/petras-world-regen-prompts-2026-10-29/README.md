# Regeneration prompts package — Petras World asset bundle (2026-10-29)

Ten generation briefs in the project's own format, ready for `resources/General_reviews/Asset_Generation/prompts/`, plus the review that produced them. **Nothing was generated and no game file, inventory or status document was touched**; every brief was dry-run through `tools/asset_generate.js` (references resolve, 3–4 input images, only the prompt text is sent, no header text leaks).

| File | Contents |
|---|---|
| `prompts/*.md` | 6 new briefs (`cow`, `duck`, `fish`, `apple`, `cat`, `dog`) and 4 revised ones (`egg`, `skis`, `medal`, `notebook`; the previous prompt is kept inside the file under "Superseded prompt", above the marker, so it is never sent) |
| `regen-prompts-2026-10-29.patch` | the same ten files as one commit (`git am`, tested on a fresh clone: 10/10 byte-identical) |
| `REVIEW_FINDINGS.md` | what was reviewed, the verdict per asset, evidence, systemic findings, open questions |
| `APPLY.md` | Windows commands |
| `appendix/` | `review_metrics.py` and `review_metrics.csv` (subject-only measurements for all 131 files) |

## What the briefs do differently from the old ones

- **Finish passes pin the design.** `cow`, `duck`, `fish`, `apple`, `cat`, `dog`, `skis`, `medal`, `notebook` use `--subject-ref` with the current file, so pose, markings and colours stay and only the rendering changes. The approved shape work (for example the three skis iterations) is not lost.
- **`--ref-files` is always pinned** (3 style references + 1 subject = 4 images, the proven maximum), each chosen as the lessons file prescribes: a painted family member of the same kind for the finish, a cool one for the cool-coloured fish.
- **No ground or cast shadow, no panel, no frame**, because the background is cut away later. All shading stays inside the subject.
- **Colour is stated explicitly** where a drift was seen (fish turquoise-blue, apple red, one-tone egg).
- **Candidates go to `tools/.cache/regen/`** (git-ignored), never over an approved file.

## Order

| # | Brief | Priority | Why in this position |
|---|---|---|---|
| 1 | `cow` | regenerate | clearest case, most runtime sites |
| 2 | `duck` | regenerate | clearest case |
| 3 | `fish` | regenerate | |
| 4 | `egg` | regenerate | never approved; fixes a failed brief |
| 5 | `skis` | finish only | approved today for shape |
| 6 | `medal` | finish only | approved today |
| 7 | `notebook` | finish only | approved today |
| 8 | `apple` | regenerate, lower confidence | visual call |
| 9–10 | `cat`, `dog` | optional | run with `apple`; keep the current files unless clearly better |

## Cost

About 126 neurons per run (4 inputs × 5.37 + 4 output tiles × 26.05; the egg has 3 inputs, about 120), against 10,000 free per day (resets 00:00 UTC). Ten briefs × at most two candidates ≈ 2,500 neurons.

## Accepting a candidate

Put the candidate beside the current file and beside `bear.png`, at 100% and at about 64 px, and check:

1. Same softness, paper grain and detail density as the bear and star; the contour is crisp, not blurred.
2. Colours as briefed; identity unchanged against the approved design.
3. Nothing extra: no halo, outline, frame, shadow, stray mark, no face on an object.
4. If it is not clearly better, keep the current file. At most two candidates per asset.

After approval, copy the candidate over the bundle file and update the inventory/progress documents as the preflight (§9) describes. I did none of that, since nothing has been generated.

## Decisions waiting for you (no prompt written)

`star` (canonical or reward star), `cards-pattern` (SVG/CSS instead?), `needle`, `soap`, `butterfly` face. Details in `REVIEW_FINDINGS.md` §1.
