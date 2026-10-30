# animal-dog — generation brief (finish pass, iteration 2, optional)

- **Replaces:** the current `dog.png` — raster-emoji art (emoji raster of 165–305 px cut from the New Illustrated Assets Board, enlarged by task 292). Original glyph: `🐶` (animal flashcard/counting, candy set, spatial scene, sorting item).
- **Inventory row:** `animal-dog` — `GENERATED / USER-APPROVED` as a picture. This brief only *proposes* a re-generation; the approved file stays until a candidate is reviewed and approved.
- **Priority: optional (lowest of the finish passes).** At full size the dog is attractive and close to the family. Measured on the subject only: contour sharpness **12.2** (bundle median 20.1; the painted, fluffy `chick.png` is 12.1) and fine texture **4.8** (the furry painted `chick.png` 8.8, `sheep.png` 10.7). The gap is a missing fine paper grain, not a different style. Run it last and **keep the current file unless the candidate is clearly better** next to the painted animals.
- **Category:** friendly animal (character). Best replaced in one batch with `cat.png` and `apple.png` (all three appear together in `sorting.js`).
- **Subject reference (`--subject-ref`):** the current `dog.png` (pose, markings, colours).
- **Style references (`--ref-files`):** `bear.png`, `star.png`, `rabbit.png` (painted seated animal with soft fur suggestion, finish and detail level only; its shape and colours must not be copied).
- **Canvas:** 1024x1024 from the API, production target 512x512 PNG
- **Background:** plain warm off-white; cut away later, so no ground or cast shadow.

```powershell
# 1) dry run (no API call, no neurons): inspect the composed prompt and the references
node tools/asset_generate.js --prompt resources/General_reviews/Asset_Generation/prompts/dog.md --out tools/.cache/regen/dog.png ` `
  --subject-ref resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/dog.png `
  --ref-files bear.png,star.png,rabbit.png --dry-run

# 2) generate ONE candidate (about 125 neurons) into the git-ignored staging folder, never over the approved file
node tools/asset_generate.js --prompt resources/General_reviews/Asset_Generation/prompts/dog.md --out tools/.cache/regen/dog.png ` `
  --subject-ref resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/dog.png `
  --ref-files bear.png,star.png,rabbit.png --creds "tools/vendor/Cloudflare-credentials,json"
```

--- prompt ---

Create one standalone illustration of a friendly puppy for a cozy early-childhood storybook game. Match the supplied Little Play bear and golden star references: soft watercolor wash with very subtle paper/colored-pencil grain; warm natural, gently muted colors; rounded, slightly organic shapes; soft painted shading; restrained contrast; quiet handmade charm; minimal, clean details; readable silhouette at small mobile size.

This is a finish pass, not a redesign: keep the subject reference's pose, proportions, markings and colours, but paint it as hand-painted watercolor on paper — crisp, softly defined painted contours, fine paper grain and gentle pigment variation visible inside every colour area, exactly like the bear reference. Not blurry, not smudged, not felt, fuzz or pencil-scribble texture, and no smooth airbrushed gradients.

Keep it a single friendly puppy sitting upright and facing the viewer: a warm honey-tan body and head, a cream blaze down the forehead, a cream muzzle, chest and front paws, two floppy deep chestnut-brown ears, small dark calm eyes, a small dark-brown nose, a soft smile line, and a short chestnut tail curling up on the right. Calm, kind expression. Simple painted fur suggestion only, at the same detail level as the rabbit reference: no individual hairs, no fuzzy fringe around the outline.

One subject only, fully visible, centered with comfortable breathing room. Plain warm off-white background with nothing on it: no ground line, no ground shadow or cast shadow, no frame, border, panel, divider line or stray mark. All shading stays inside the subject. The result must look like it belongs beside the exact reference images.

No photorealism, 3D rendering, glossy plastic, vector emoji, stock-icon look, or anime styling. No thick black outline, white sticker border, glow, hard drop shadow, or dramatic lighting. No excessive gradient, tiny detail, heavy texture, decorative sparkles, or ornamental extras. No unrequested accessories. No text, labels, watermark, logo, collage, contact sheet, or multiple alternatives in one image. No collar, no bone, no ball, no tongue, no second dog. Do not reproduce the reference bear or the golden star; create the requested puppy in the same visual family.

