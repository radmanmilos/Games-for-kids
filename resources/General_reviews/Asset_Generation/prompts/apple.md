# food-apple — generation brief (finish pass, iteration 2)

- **Replaces:** the current `apple.png` — raster-emoji art (emoji raster of 165–305 px cut from the New Illustrated Assets Board, enlarged by task 292). Original glyph: `🍎` (food sorting bin/item in `game/games/sorting.js`).
- **Inventory row:** `food-apple` — `GENERATED / USER-APPROVED` as a picture. This brief only *proposes* a re-generation; the approved file stays until a candidate is reviewed and approved.
- **Why this one:** **lower confidence than cow and duck; the call rests on the visual comparison, not on a number.** At full size the surface is an enlarged coloured-pencil/felt scribble with a scalloped contour and no soft highlight, unlike the smooth painted washes of `banana.png`, `pear.png`, `strawberry.png` and `apple-green.png`. In `game/games/sorting.js` it is shown beside the painted `banana.png` and `strawberry.png`, and `apple-green.png` is its direct sibling. (Metric note: the apple's contour sharpness, 15.3, is close to normal and its texture score, 3.5, is low — but smooth painted fruit such as `pear.png` at 2.5 scores just as low, so the numbers alone prove nothing here.) The red is also the fourth most saturated subject in the bundle (0.70).
- **Category:** food / fruit. Colour distinction must be preserved (STYLE_BIBLE §12: green versus red apple).
- **Subject reference (`--subject-ref`):** the current `apple.png` (shape, red colour, stem and leaf placement).
- **Style references (`--ref-files`):** `bear.png`, `star.png`, `apple-green.png` — the painted sibling that sets the finish and detail level for an apple (its shape and colour must not be copied; the brief states the red explicitly).
- **Canvas:** 1024x1024 from the API, production target 512x512 PNG
- **Background:** plain warm off-white; cut away later, so no ground or cast shadow.

```powershell
# 1) dry run (no API call, no neurons): inspect the composed prompt and the references
node tools/asset_generate.js --prompt resources/General_reviews/Asset_Generation/prompts/apple.md --out tools/.cache/regen/apple.png ` `
  --subject-ref resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/apple.png `
  --ref-files bear.png,star.png,apple-green.png --dry-run

# 2) generate ONE candidate (about 125 neurons) into the git-ignored staging folder, never over the approved file
node tools/asset_generate.js --prompt resources/General_reviews/Asset_Generation/prompts/apple.md --out tools/.cache/regen/apple.png ` `
  --subject-ref resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/apple.png `
  --ref-files bear.png,star.png,apple-green.png --creds "tools/vendor/Cloudflare-credentials,json"
```

--- prompt ---

Create one standalone illustration of a single red apple for a cozy early-childhood storybook game. Match the supplied Little Play bear and golden star references: soft watercolor wash with very subtle paper/colored-pencil grain; warm natural, gently muted colors; rounded, slightly organic shapes; soft painted shading; restrained contrast; quiet handmade charm; minimal, clean details; readable silhouette at small mobile size.

This is a finish pass, not a redesign: keep the subject reference's pose, proportions, markings and colours, but paint it as hand-painted watercolor on paper — crisp, softly defined painted contours, fine paper grain and gentle pigment variation visible inside every colour area, exactly like the bear reference. Not blurry, not smudged, not felt, fuzz or pencil-scribble texture, and no smooth airbrushed gradients.

Keep it a single plump, rounded red apple with a slight dip at the top, a short brown stem and exactly one soft leaf-green leaf angled up and to the right. The red is a clear, warm apple red — not pink, not orange, not dark crimson — slightly deeper toward the lower edge, with one broad soft lighter patch on the upper left. Soft and matte: no glossy streak, no wet shine, no waxy look. It must stay clearly different from the green apple reference: do not make it green or yellow-green, and do not copy the green apple's two leaves. The leaf and stem are few, clear and appropriately sized.

One subject only, fully visible, centered with comfortable breathing room. Plain warm off-white background with nothing on it: no ground line, no ground shadow or cast shadow, no frame, border, panel, divider line or stray mark. All shading stays inside the subject. The result must look like it belongs beside the exact reference images.

No photorealism, 3D rendering, glossy plastic, vector emoji, stock-icon look, or anime styling. No thick black outline, white sticker border, glow, hard drop shadow, or dramatic lighting. No excessive gradient, tiny detail, heavy texture, decorative sparkles, or ornamental extras. No unrequested accessories. No text, labels, watermark, logo, collage, contact sheet, or multiple alternatives in one image. No bite, no worm, no face, no second apple, no basket, no tree. Do not reproduce the reference bear or the golden star; create the requested apple in the same visual family.
