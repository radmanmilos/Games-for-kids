# Production-assets package — Petras World (2026-10-29)

Read first: **`PRODUCTION_ASSET_PIPELINE.md`** (what to use, the specification with evidence, the step-by-step, the decisions I need).
Then **`GENERATION_PROMPT_TEMPLATE.md`** (the reusable prompt and its category blocks).

| Path | What it is |
|---|---|
| `tools/cutout.py` | the tested converter: approved 1024 px PNG -> 512x512 transparent WebP (q85) plus `qa.csv` with FLAG column. Needs `pillow numpy scipy scikit-image rembg onnxruntime`. |
| `tools/cutout-overrides.json` | per-asset decisions found on the 131 files (4 `classical`, 6 `exclude`) |
| `tools/sheet.py` | contact sheet on a coloured background (look for halos and leftovers) |
| `tools/encoding_comparison.py`, `tools/ml_batch_example.py` | the scripts behind the size table and the model run |
| `proposal/art.draft.js` + test | draft shared helper `Art.html/fill/draw` with emoji fallback (Node-tested, **not browser-tested**, not applied) |
| `reports/` | `qa_all_131_prototype.csv`, `encoding_comparison.md`, `art_map_draft.json` (glyph -> file, 129 glyphs) |
| `review-sheets/` | the images behind every finding |

Nothing in the game repo was changed. The earlier package (ten regeneration briefs) is separate and unchanged.
