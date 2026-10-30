# animal-cat — generation brief (finish pass, iteration 2, optional)

- **Replaces:** the current `cat.png` — raster-emoji art (emoji raster of 165–305 px cut from the New Illustrated Assets Board, enlarged by task 292). Original glyph: `🐱` (animal flashcard/counting, sorting item).
- **Inventory row:** `animal-cat` — `GENERATED / USER-APPROVED` as a picture. This brief only *proposes* a re-generation; the approved file stays until a candidate is reviewed and approved.
- **Priority: optional (lowest of the finish passes).** At full size the cat is attractive and close to the family. Measured on the subject only: contour sharpness **11.5** (bundle median 20.1; the painted, fluffy `chick.png` is 12.1) and fine texture **4.7** (the furry painted `chick.png` 8.8, `sheep.png` 10.7). So the gap is a missing fine paper grain, not a different style. Run it last and **keep the current file unless the candidate is clearly better** next to the painted animals.
- **Category:** friendly animal (character). In `sorting.js` it is shown together with the raster `dog.png` and `apple.png`, so cat, dog and apple are best replaced as one batch.
- **Subject reference (`--subject-ref`):** the current `cat.png` (pose, tabby markings, colours).
- **Style references (`--ref-files`):** `bear.png`, `star.png`, `fox.png` (painted warm-orange animal, finish and detail level only; its shape and colours must not be copied).
- **Canvas:** 1024x1024 from the API, production target 512x512 PNG
- **Background:** plain warm off-white; cut away later. The current file carries a baked-in tan panel on both sides, so the brief forbids panels and frames.

```powershell
# 1) dry run (no API call, no neurons): inspect the composed prompt and the references
node tools/asset_generate.js --prompt resources/General_reviews/Asset_Generation/prompts/cat.md --out tools/.cache/regen/cat.png ` `
  --subject-ref resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/cat.png `
  --ref-files bear.png,star.png,fox.png --dry-run

# 2) generate ONE candidate (about 125 neurons) into the git-ignored staging folder, never over the approved file
node tools/asset_generate.js --prompt resources/General_reviews/Asset_Generation/prompts/cat.md --out tools/.cache/regen/cat.png ` `
  --subject-ref resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/cat.png `
  --ref-files bear.png,star.png,fox.png --creds "tools/vendor/Cloudflare-credentials,json"
```

--- prompt ---

Create one standalone illustration of a friendly kitten for a cozy early-childhood storybook game. Match the supplied Little Play bear and golden star references: soft watercolor wash with very subtle paper/colored-pencil grain; warm natural, gently muted colors; rounded, slightly organic shapes; soft painted shading; restrained contrast; quiet handmade charm; minimal, clean details; readable silhouette at small mobile size.

This is a finish pass, not a redesign: keep the subject reference's pose, proportions, markings and colours, but paint it as hand-painted watercolor on paper — crisp, softly defined painted contours, fine paper grain and gentle pigment variation visible inside every colour area, exactly like the bear reference. Not blurry, not smudged, not felt, fuzz or pencil-scribble texture, and no smooth airbrushed gradients.

Keep it a single friendly orange tabby kitten sitting upright and facing the viewer, with its tail curled up on the left: a warm orange-ginger wash with a few soft deeper-orange tabby stripes on the forehead and cheeks, a cream muzzle, chest and front paws, soft pink inside the ears, small dark calm eyes, a small brown nose, a soft smile line and a few thin warm-brown whisker strokes. Calm, kind expression. Simple painted fur suggestion only, at the same detail level as the fox reference: no individual hairs, no fluffy fringe around the outline.

One subject only, fully visible, centered with comfortable breathing room. Plain warm off-white background with nothing on it: no ground line, no ground shadow or cast shadow, no frame, border, panel, divider line or stray mark. All shading stays inside the subject. The result must look like it belongs beside the exact reference images.

No photorealism, 3D rendering, glossy plastic, vector emoji, stock-icon look, or anime styling. No thick black outline, white sticker border, glow, hard drop shadow, or dramatic lighting. No excessive gradient, tiny detail, heavy texture, decorative sparkles, or ornamental extras. No unrequested accessories. No text, labels, watermark, logo, collage, contact sheet, or multiple alternatives in one image. No collar, no bell, no yarn, no bowl, no second cat. Do not reproduce the reference bear or the golden star; create the requested kitten in the same visual family.

