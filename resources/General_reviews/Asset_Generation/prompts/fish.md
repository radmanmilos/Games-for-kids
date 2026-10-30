# animal-fish — generation brief (finish pass, iteration 2)

- **Replaces:** the current `fish.png` — raster-emoji art (emoji raster of 165–305 px cut from the New Illustrated Assets Board, enlarged by task 292). Original glyph: `🐟`/`🐠` (ocean/underwater, phonics, Kitty water scenes).
- **Inventory row:** `animal-fish` — `GENERATED / USER-APPROVED` as a picture. This brief only *proposes* a re-generation; the approved file stays until a candidate is reviewed and approved.
- **Why this one:** measured on the subject only: contour sharpness **10.5** against a bundle median of 20.1 (seventh softest of 131 files). At full size the fins and the tail are blurred into the body and the surface is a coarse, enlarged felt-like blotch rather than painted grain.
- **Category:** simple friendly animal, **cool-coloured subject inside a warm family**. Lesson (`project/lessons/asset-generation.md`, water-drop iterations 1 → 2): send a cool painted reference (`elephant.png`) and state the colour explicitly, naming the greys to avoid.
- **Subject reference (`--subject-ref`):** the current `fish.png` (body shape, fin layout, blue and yellow colours).
- **Style references (`--ref-files`):** `bear.png`, `star.png`, `elephant.png` (cool-blue painted family member, finish and detail level only).
- **Canvas:** 1024x1024 from the API, production target 512x512 PNG
- **Background:** plain warm off-white; cut away later, so no water, ground or cast shadow.

```powershell
# 1) dry run (no API call, no neurons): inspect the composed prompt and the references
node tools/asset_generate.js --prompt resources/General_reviews/Asset_Generation/prompts/fish.md --out tools/.cache/regen/fish.png ` `
  --subject-ref resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/fish.png `
  --ref-files bear.png,star.png,elephant.png --dry-run

# 2) generate ONE candidate (about 125 neurons) into the git-ignored staging folder, never over the approved file
node tools/asset_generate.js --prompt resources/General_reviews/Asset_Generation/prompts/fish.md --out tools/.cache/regen/fish.png ` `
  --subject-ref resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/fish.png `
  --ref-files bear.png,star.png,elephant.png --creds "tools/vendor/Cloudflare-credentials,json"
```

--- prompt ---

Create one standalone illustration of a friendly fish for a cozy early-childhood storybook game. Match the supplied Little Play bear and golden star references: soft watercolor wash with very subtle paper/colored-pencil grain; warm natural, gently muted colors; rounded, slightly organic shapes; soft painted shading; restrained contrast; quiet handmade charm; minimal, clean details; readable silhouette at small mobile size.

This is a finish pass, not a redesign: keep the subject reference's pose, proportions, markings and colours, but paint it as hand-painted watercolor on paper — crisp, softly defined painted contours, fine paper grain and gentle pigment variation visible inside every colour area, exactly like the bear reference. Not blurry, not smudged, not felt, fuzz or pencil-scribble texture, and no smooth airbrushed gradients.

Keep it a single plump, friendly fish in side view facing right: a rounded oval body in a clear, cheerful turquoise-blue — a true blue-green with the blue clearly higher than the red, never grey-blue, slate, steel, dusty or muddy teal — with a lighter pale-blue belly, a soft golden-yellow rounded tail fin, a small golden-yellow fin on top and a small one underneath, one small round dark calm eye with no white glare, and one small gentle smile curve. The fins are thick, rounded and clearly separated from the body so the silhouette survives at small size. No scales, no scale pattern, no gill lines.

One subject only, fully visible, centered with comfortable breathing room. Plain warm off-white background with nothing on it: no ground line, no ground shadow or cast shadow, no frame, border, panel, divider line or stray mark. All shading stays inside the subject. The result must look like it belongs beside the exact reference images.

No photorealism, 3D rendering, glossy plastic, vector emoji, stock-icon look, or anime styling. No thick black outline, white sticker border, glow, hard drop shadow, or dramatic lighting. No excessive gradient, tiny detail, heavy texture, decorative sparkles, or ornamental extras. No unrequested accessories. No text, labels, watermark, logo, collage, contact sheet, or multiple alternatives in one image. No bubbles, no water, no seaweed, no coral, no second fish, no fish bowl. Do not reproduce the reference bear or the golden star; create the requested fish in the same visual family.

