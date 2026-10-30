# animal-cow — generation brief (finish pass, iteration 2)

- **Replaces:** the current `cow.png` — raster-emoji art (emoji raster of 165–305 px, enlarged by task 292, never a painted family member). Original glyph: `🐮`/`🐄` (animal flashcard/counting, candy set, farm puzzle/scenery, Serbian phonics `Крава`, racing decor).
- **Inventory row:** `animal-cow` — `GENERATED / USER-APPROVED` as a picture. This brief only *proposes* a re-generation; the approved file stays untouched until a candidate has been generated, reviewed side by side and explicitly approved (preflight §8).
- **Why this one:** review of all 131 bundle files, measured on the subject only (background ignored, it will be cut away): contour sharpness **7.5** against a bundle median of 20.1, fine texture **2.7** against a median of 8.5 — one of the five softest contours of all 131 files. At full size the contour carries a pale halo that will survive a cut-out. It is also the most widely used of the soft files (six runtime sites: `animals.js`, `animal_counting.js`, `candy.js`, `animal_puzzle.js`, `racing-config.js`, `serbian.js`).
- **Category:** friendly farm animal (character).
- **Subject reference (`--subject-ref`):** the current `cow.png` — it pins the pose, the patch layout and the colours, so the approved cow stays the same cow. Only the rendering is replaced.
- **Style references (`--ref-files`):** `bear.png` (canonical anchor), `star.png` (canonical secondary), `sheep.png` (painted farm animal, finish and detail level only). 4 images in total, the proven maximum.
- **Canvas:** 1024x1024 from the API, production target 512x512 PNG (STYLE_BIBLE.md)
- **Background:** plain warm off-white for the WIP bundle; the background is cut away later, so the brief forbids ground shadows, panels and marks that a cut-out would keep.

```powershell
# 1) dry run (no API call, no neurons): inspect the composed prompt and the references
node tools/asset_generate.js --prompt resources/General_reviews/Asset_Generation/prompts/cow.md --out tools/.cache/regen/cow.png ` `
  --subject-ref resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/cow.png `
  --ref-files bear.png,star.png,sheep.png --dry-run

# 2) generate ONE candidate (about 125 neurons) into the git-ignored staging folder, never over the approved file
node tools/asset_generate.js --prompt resources/General_reviews/Asset_Generation/prompts/cow.md --out tools/.cache/regen/cow.png ` `
  --subject-ref resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/cow.png `
  --ref-files bear.png,star.png,sheep.png --creds "tools/vendor/Cloudflare-credentials,json"
```

--- prompt ---

Create one standalone illustration of a friendly cow for a cozy early-childhood storybook game. Match the supplied Little Play bear and golden star references: soft watercolor wash with very subtle paper/colored-pencil grain; warm natural, gently muted colors; rounded, slightly organic shapes; soft painted shading; restrained contrast; quiet handmade charm; minimal, clean details; readable silhouette at small mobile size.

This is a finish pass, not a redesign: keep the subject reference's pose, proportions, markings and colours, but paint it as hand-painted watercolor on paper — crisp, softly defined painted contours, fine paper grain and gentle pigment variation visible inside every colour area, exactly like the bear reference. Not blurry, not smudged, not felt, fuzz or pencil-scribble texture, and no smooth airbrushed gradients.

Keep it a single friendly cow standing calmly in three-quarter view facing right: a plump rounded cream-white body with a few soft warm-brown patches (one large patch on the side, one over the ear and eye, a brown tuft at the end of the tail), a broad soft pink muzzle with two small nostrils, two short golden-tan horns, small ears lined with soft pink, small dark calm eyes, four short sturdy legs ending in dark brown hooves, and a small pink udder under the belly. Calm friendly expression, no exaggerated cartoon grin. Keep the same simple, rounded level of detail as the sheep reference: broad soft masses, no individual hairs, no extra spots.

One subject only, fully visible, centered with comfortable breathing room. Plain warm off-white background with nothing on it: no ground line, no ground shadow or cast shadow, no frame, border, panel, divider line or stray mark. All shading stays inside the subject. The result must look like it belongs beside the exact reference images.

No photorealism, 3D rendering, glossy plastic, vector emoji, stock-icon look, or anime styling. No thick black outline, white sticker border, glow, hard drop shadow, or dramatic lighting. No excessive gradient, tiny detail, heavy texture, decorative sparkles, or ornamental extras. No unrequested accessories. No text, labels, watermark, logo, collage, contact sheet, or multiple alternatives in one image. Not a dog, not a calf, no bell, no collar, no halter, no grass, no barn. Do not reproduce the reference bear or the golden star; create the requested cow in the same visual family.

