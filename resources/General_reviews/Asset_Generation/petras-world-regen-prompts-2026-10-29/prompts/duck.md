# animal-duck — generation brief (finish pass, iteration 2)

- **Replaces:** the current `duck.png` — raster-emoji art (emoji raster of 165–305 px cut from a tile of the Catalog board, enlarged by task 292). Original glyph: `🦆` (counting, candy set, spatial scene).
- **Inventory row:** `animal-duck` — `GENERATED / USER-APPROVED` as a picture; the row asks for a *simple duck in the bear's low-detail style* and warns against the rejected elaborate-duckling look. This brief keeps that simplicity. It only *proposes* a re-generation; the approved file stays until a candidate is reviewed and approved.
- **Why this one:** measured on the subject only (background ignored): contour sharpness **8.1** against a bundle median of 20.1 and fine texture **1.5** against a median of 8.5 — the flattest subject of all 131 files (lowest texture) and among the five softest contours. Next to `chick.png` and `chicken.png` it reads as an out-of-focus toy.
- **Category:** simple friendly bird (character). Bird lesson (STYLE_BIBLE §18.4, `bird.md`): keep the *bird* references out so the finish does not drag the shape towards a chick; the subject reference pins the duck's shape instead.
- **Subject reference (`--subject-ref`):** the current `duck.png` (pose, rubber-duck shape, golden-yellow colour).
- **Style references (`--ref-files`):** `bear.png`, `star.png`, `sheep.png` (a non-bird painted family member, finish and detail level only).
- **Canvas:** 1024x1024 from the API, production target 512x512 PNG
- **Background:** plain warm off-white; cut away later, so no ground or cast shadow.

```powershell
# 1) dry run (no API call, no neurons): inspect the composed prompt and the references
node tools/asset_generate.js --prompt resources/General_reviews/Asset_Generation/prompts/duck.md --out tools/.cache/regen/duck.png ` `
  --subject-ref resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/duck.png `
  --ref-files bear.png,star.png,sheep.png --dry-run

# 2) generate ONE candidate (about 125 neurons) into the git-ignored staging folder, never over the approved file
node tools/asset_generate.js --prompt resources/General_reviews/Asset_Generation/prompts/duck.md --out tools/.cache/regen/duck.png ` `
  --subject-ref resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/duck.png `
  --ref-files bear.png,star.png,sheep.png --creds "tools/vendor/Cloudflare-credentials,json"
```

--- prompt ---

Create one standalone illustration of a friendly duck for a cozy early-childhood storybook game. Match the supplied Little Play bear and golden star references: soft watercolor wash with very subtle paper/colored-pencil grain; warm natural, gently muted colors; rounded, slightly organic shapes; soft painted shading; restrained contrast; quiet handmade charm; minimal, clean details; readable silhouette at small mobile size.

This is a finish pass, not a redesign: keep the subject reference's pose, proportions, markings and colours, but paint it as hand-painted watercolor on paper — crisp, softly defined painted contours, fine paper grain and gentle pigment variation visible inside every colour area, exactly like the bear reference. Not blurry, not smudged, not felt, fuzz or pencil-scribble texture, and no smooth airbrushed gradients.

Keep it a single plump, friendly duck in the simple rubber-duck style of the subject reference, in side view facing right: a round golden-yellow head with one small dark calm eye, a short flat warm-orange beak, a plump rounded body with a gently lifted tail point, and one simple slightly deeper golden wing shape painted on the side. It sits on its rounded belly with no visible feet or legs. Warm golden yellow with a slightly deeper amber tone toward the belly and tail, and a soft warm-orange beak. Very low detail, like the bear: no feather lines, no layered feathers, no fluff texture. It must read as a duck and not as a chick — a broad flat beak, a body longer than it is tall, a lifted tail.

One subject only, fully visible, centered with comfortable breathing room. Plain warm off-white background with nothing on it: no ground line, no ground shadow or cast shadow, no frame, border, panel, divider line or stray mark. All shading stays inside the subject. The result must look like it belongs beside the exact reference images.

No photorealism, 3D rendering, glossy plastic, vector emoji, stock-icon look, or anime styling. No thick black outline, white sticker border, glow, hard drop shadow, or dramatic lighting. No excessive gradient, tiny detail, heavy texture, decorative sparkles, or ornamental extras. No unrequested accessories. No text, labels, watermark, logo, collage, contact sheet, or multiple alternatives in one image. No water, no pond, no ripples, no ducklings, no hat, no bow tie, no cheek blush. Do not reproduce the reference bear or the golden star; create the requested duck in the same visual family.
