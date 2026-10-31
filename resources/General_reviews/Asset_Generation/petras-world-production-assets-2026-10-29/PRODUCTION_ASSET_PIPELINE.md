# From approved paintings to in-game art — what to use, what to send, what to ship

Prepared 2026-10-29 against `main` at `63fb8dd`. Nothing in the repo was changed. Everything below that says "tested" was run on your real 131 bundle files in my sandbox; everything marked **not tested** could not be (no Cloudflare credentials or network access, no Chrome, no tablet).

## 1. The answer in one table

| Question | Answer |
|---|---|
| Which Cloudflare model *generates* art? | `@cf/black-forest-labs/flux-2-klein-4b`, already the default of `tools/asset_generate.js` (the only model it prices). Free: 10,000 neurons/day, about **126 neurons per run**. Keep it. |
| Which free Cloudflare model *removes backgrounds*? | **None in Workers AI** that I could find. The Cloudflare-native option is **Cloudflare Images `segment=foreground`** (a BiRefNet model, open beta, available on the Free plan within 5,000 unique transformations/month). It needs a Worker with the Images binding or a `/cdn-cgi/image/` URL on a domain you have on Cloudflare. **Not tested.** |
| What did I test instead? | A local, free, offline cut-out: a deterministic matte plus the `isnet-general-use` model as a *guide*. It produced a usable cut-out for 124 of the 131 files: 6 are not cut-outs at all, 1 (`snowflake`) is still ragged, and about 8 keep a pale shadow remnant (section 5). Per-asset overrides handle the rest. |
| Should a generative model "convert" the finished art? | **No.** It would redraw pixels you already approved. Use generation only to *regenerate*, with the reusable prompt in `GENERATION_PROMPT_TEMPLATE.md`. |
| Dimensions | **512 × 512 px**, RGBA, subject's longest side = **88%** of the canvas, centred. |
| Format and quality | **WebP, lossy, quality 85, alpha quality 100.** Average **27 KB**, 3.6 MB for 131 assets. |
| Keep as masters | The 1024 px PNGs in the bundle. They are never shipped. |

## 2. What the project looks like today (verified)

- `game/` holds **200 distinct glyphs, 637 occurrences**. They are rendered four ways: DOM text writes (209 `textContent`/`innerText`/`innerHTML` statements in 24 files, not all of them emoji), `emoji:` fields in data tables (207 fields in 16 files, 51 of them in `serbian.js`), canvas `fillText` (16 calls in 9 files), and CSS `content:` (Cat Forest). There is **no shared helper**; every game does its own `span.textContent = spec.emoji`.
- Largest on-screen size: `.animal-card` **30vmin**, `.animal-emoji` 27vmin, hub tiles `clamp(56px, 21vmin, 160px)`.
- `project/reference/ASSET_BUDGET.md`: the whole app is **6.44 MB** (images 3.22 MB) and is pre-cached in full by the service worker. File size therefore matters twice: download and offline storage.
- The tooling has **zero npm dependencies**, and `tools/validate_offline.js` already accepts `.webp`.
- Coverage of the 200 glyphs: **129 (439 of 637 occurrences, 69%) already have a finished PNG**. 21 of the 23 glyphs that have an inventory row but no PNG are already marked "SVG/CSS" or "UI icon" in the inventory ("never generate image assets for it"). The other two are 🌸 (3D racing counter) and 🐤. **33 real subjects have no inventory row** (60 occurrences; several can reuse existing art, e.g. 🐈→cat, 🐥→chick, 🐠→fish, ☃→snowman, 🌷/🌺→flower, 🏎→car; to confirm). **15 UI symbols** (arrows, ✖, ♪, 🔢…) belong in a small SVG icon set. Draft map: `reports/art_map_draft.json`.

## 3. Cloudflare options, as far as I could verify

- **Generation:** the Workers AI catalogue lists FLUX.2 [klein] and [dev] and Leonardo's Lucid Origin and Phoenix. The project tool prices only klein 4B; I did not evaluate the others and would not switch mid-family.
- **Background removal:** I found no segmentation model in the Workers AI catalogue pages I could read. A `remove-background` entry (Bria RMBG 2.0) appears in Cloudflare's broader model browser as an *external provider through AI Gateway*; I could not confirm it is free, so I do not recommend it.
- **Cloudflare Images `segment=foreground`:** per Cloudflare's own announcement it uses BiRefNet, is in open beta for Free and Paid plans, and runs through a transformation URL or a Worker (`env.IMAGES.input(...).transform({segment:"foreground"}).output({format:"image/webp"})`). The Free plan includes 5,000 unique transformations a month and does not charge for exceeding them. Cost is not the problem; **setup is**: it needs a Worker deployment or a zone. I would keep it as the fallback for a stubborn file, not the main route.

## 4. The specification, with the evidence

**Canvas 512 × 512.** On-screen size is `0.30 × shorter viewport side × device pixel ratio` for the biggest items. For typical tablet classes (assumed; please tell me your tablet) that is about 360 px on a 10-11" 1920×1200 panel, about 530 px on a 12.4" 2800×1752 panel and about 555 px on a 14.6" one. 512 covers all but the very largest within a 1.1× enlargement nobody can see. A 1024 file would cost four times the decoded memory (1 MB per 512² image) for no visible gain.

**Subject at 88%.** An emoji fills about 90% of its em-box. Framing every asset the same way and displaying it at `width: 1em; height: 1em` means **the existing `font-size` rules keep sizing everything, so no layout CSS needs rewriting**.

**WebP q85, measured on a 32-file sample at 512²:**

| Format | Mean | p90 | Max | ×131 files | Fidelity |
|---|---|---|---|---|---|
| PNG-32 (optimised) | 194 KB | 229 KB | 307 KB | **25.4 MB** | exact |
| PNG-8 (256 colours) | 35 KB | 45 KB | 54 KB | 4.6 MB | **visible posterisation** on gradients |
| WebP lossless | 122 KB | 143 KB | 193 KB | 15.9 MB | exact |
| WebP q90 | 34 KB | 41 KB | 51 KB | 4.4 MB | median 44.9 dB |
| **WebP q85** | **27 KB** | 33 KB | 42 KB | **3.6 MB** | median 42.7 dB, min 37.5 |
| WebP q80 | 24 KB | 30 KB | 37 KB | 3.1 MB | median 41.3 dB |
| WebP q70 | 20 KB | 26 KB | 32 KB | 2.6 MB | median 39.6 dB |

At 3× pixel zoom (`review-sheets/format_zoom.png`) q85 is indistinguishable from the PNG on fine zebra stripes and a smooth pear gradient; q70 is slightly softer; PNG-8 shows speckle. **PNG-32 for ~170 assets would add roughly 33 MB to a 6.4 MB app; WebP q85 adds about 4–5 MB.** AVIF was not tested (needs a much newer Android WebView and has no zero-dependency encoder).

**Compatibility:** Android's own documentation: lossy WebP from Android 4.0, **transparent WebP from Android 4.3 (API 18)**. Safe on any tablet you would target. Hard limit per file: **60 KB**.

**Master/production split:** masters stay in `resources/…/assets_work_in_progress_bundle/` (1024² PNG); production files go to `game/assets/art/<name>.webp`, the same stem as the master, so every shipped file traces to an approved master.

## 5. What my dry run on all 131 files found (tested)

- **Not cut-outs (6):** `night-sky`, `sunrise`, `sunset`, `galaxy`, `sun`, `cards-pattern`. They are full-bleed scenes, glows or a pattern. As cut-outs they shatter or leave a dark ring (`review-sheets/modes.png`). Ship the scenes as opaque images or CSS; build the sun as a plain disc plus a CSS radial-gradient glow; make the pattern SVG/CSS. They are listed under `"exclude"` in `tools/cutout-overrides.json`.
- **White-on-white (4):** `ball`, `eye`, `flower`, `snowflake`. The ML guide wrongly cut their white parts, so they use the `classical` mode. Result: ball, eye, flower clean; **`snowflake` is still ragged** (pale-on-pale), a candidate for regeneration.
- **Painted shadows survive a cut-out.** Painted ground shadows are common in the bundle (I did not count them) and are part of the picture, not the paper. With the conservative default I confirmed pale remnants by eye on `rock`, `school`, `car`, `meteor`, `cactus`, `house`, `egg` and `ball` (the puzzle piece's tilted shadow is deliberate). A more aggressive setting removes them but **damaged the zebra**, so it is not a global default. Real fix: **the prompt now forbids ground and cast shadows**, so regenerated assets arrive clean.
- **Everything else (121):** 20 of them were flagged by my metrics and I looked at each: usable, apart from the shadow remnants listed above. The other ~100 were screened by metrics only, not individually inspected.
- **Edges:** clean on navy, white-ish and green backgrounds at normal size; at 3× zoom the contour is slightly stair-stepped. Judge at 1×.
- **Speed:** about 10 minutes for all 131 on a CPU-only sandbox (the model needs a one-time 179 MB download).

## 6. The pipeline, step by step

Prerequisites (Windows): Python 3.10+, then `pip install pillow numpy scipy scikit-image rembg onnxruntime`. It is a dev-time tool; nothing from it ships in the app.

```powershell
# 1) six-asset trial, including a donut (real hole), a white ball and the excluded sun
python tools\cutout\cutout.py --src resources\General_reviews\Asset_Generation\assets_work_in_progress_bundle `
  --dst tools\.cache\art --overrides tools\cutout\cutout-overrides.json cow ball eye sun donut snowman
# 2) whole bundle (~10 min); writes <name>.webp and qa.csv with a FLAG column
python tools\cutout\cutout.py --src ...\assets_work_in_progress_bundle --dst tools\.cache\art --overrides tools\cutout\cutout-overrides.json
# 3) contact sheet on a dark background, then again on green: look for halos, holes, leftover shadows
python tools\cutout\sheet.py review-dark.png 28,38,72 (Get-ChildItem tools\.cache\art\*.webp).FullName
```

4. Open `qa.csv`; look at every row with a FLAG, and the sheet. Fix with a mode in `cutout-overrides.json` (`classical`, `soft`, `exclude`) and re-run that name. If it cannot be fixed, regenerate it with the template.
5. Approved files: copy to `game/assets/art/`, generate the registry, run the repo's usual steps (`tools/sync-docs.sh`, offline list/manifest build, smoke tests) and refresh affected review screenshots (repo rule).

Acceptance per file: no paper-coloured fringe on dark and green, no floating specks, no leftover shadow, 5–8% transparent margin, ≤ 60 KB, and the shape matches the approved master.

## 7. Wiring it into the game (proposal, not applied)

`proposal/art.draft.js` is a ~30-line helper for `game/shared/art.js` (Node-tested logic, **not browser-tested**): `Art.html(glyph)` / `Art.fill(el, glyph)` for DOM, `Art.draw(ctx, glyph, cx, cy, size)` for canvas. A glyph without a registered image **falls back to the emoji**, so you can migrate game by game and nothing ever shows a broken picture offline. One CSS rule does the sizing: `.art { width: 1em; height: 1em; display: inline-block; vertical-align: -0.12em; object-fit: contain; pointer-events: none; }`. The registry (`game/data/art-registry.js`, glyph → file stem) should be generated from the inventory, not typed by hand. Order of work: shared helper and registry; then the 16 data-driven games by occurrence count; then the 9 canvas game files; then Cat Forest (see below).

## 8. Decisions I need from you

1. **Python in the dev toolchain?** The tested tool is Python. A pure-Node port is possible but would lose the ML shadow guide.
2. **Confirm WebP** (the project has so far shipped PNG).
3. **Record the decision.** `DECISIONS.md` line 16 calls emoji "settled" with an open question to confirm with you; your message answers it, so the line should be updated.
4. **Cat Forest.** `DECISIONS.md` line 58 says "emoji art only; no new assets". A global replacement conflicts with it; exempt it, or change it?
5. **Your tablet** (model or resolution), to confirm 512 px.
6. **The draft map merges** 🎉 ✨ 🌟 into `celebration` and 💫 🌠 into `comet`; confirm or split.

## 9. Not tested

Cloudflare Images/Workers, any live generation, AVIF, rendering in Chrome or on a tablet, decode time, and the two new sentences of the prompt template (the pale-subject edge clause and the 80–85% composition sentence).
