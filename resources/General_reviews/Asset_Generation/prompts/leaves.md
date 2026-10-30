# plant-leaves — generation brief

- **Replaces:** the 🌿 glyph — `game/games/sequencing.js` (plant-growth sequence, plant step), adventure world names may use similar symbols
- **Inventory row:** `plant-leaves` — status `REVIEW`; no leafy-plant illustration exists in `game/` or `resources/`, so the row is eligible for generation
- **Why this one:** completes the Sequencing / life-cycle / wash set; one shared leafy plant asset serves the plant step
- **Category:** **plants / nature** (STYLE_BIBLE.md §12): gentle organic curves, simple leaf/petal groups, avoid dense botanical detail, natural colors soft but identifiable
- **References sent to the model:** `Reference/bear.png` (canonical style anchor), `Reference/star.png` (canonical secondary reference — golden warmth for the paper/finish), `bone.png` (approved simple-object exemplar — rounded, simple, faceless form). The family is warm, so the green must be stated explicitly
- **Canvas:** 1024x1024 from the API, production target 512x512 PNG (STYLE_BIBLE.md)
- **Background:** warm off-white is acceptable for the work-in-progress bundle; transparency is a runtime requirement, not an illustration task

--- prompt ---

Create one standalone illustration of a single simple leafy plant for a cozy early-childhood storybook game. Match the supplied Little Play bear, golden star and bone references: soft watercolor wash with very subtle paper/colored-pencil grain; warm natural, gently muted colors; rounded, slightly organic shapes; soft painted shading; restrained contrast; quiet handmade charm; minimal, clean details; readable silhouette at small mobile size.

Draw one small leafy plant: a short green stem with a few (three to five) simple, rounded leaves arranged along it, like a young plant with its first true leaves. Keep the silhouette compact and instantly readable as a small leafy plant / sprout with leaves.

Fill the stem and leaves with a clear, unmistakable plant green — a soft, warm, slightly yellowish green, clearly green and never brown, grey, blue, or muddy. The green must be obvious and definite. Paint one soft lighter highlight on the upper side of each leaf and a slightly deeper green shading along the lower edges, so the plant reads as rounded and dimensional without looking glossy, waxy or wet. Keep the color clearly readable when the picture is shrunk to a small card.

Keep it a simple, calm object picture with no face, no eyes and no expression. No soil, no pot, no ground line, no extra stems, no flowers. The plant must read instantly as a leafy plant at small size and must not look like a single leaf, a feather, a fern or a green blob.

One subject only, fully visible, centered with comfortable breathing room. Plain warm off-white background is acceptable. No added props, no pot, no soil, no other plant, no ground line. The result must look like it belongs beside the exact reference images.

No photorealism, 3D rendering, glossy plastic, vector emoji, stock-icon look, or anime styling. Not a brown plant, not a grey plant, not a single leaf, not a fern. No thick black outline, white sticker border, glow, hard drop shadow, or dramatic lighting. No excessive gradient, tiny detail, heavy texture, decorative sparkles, or ornamental extras. No unrequested face or accessories. No text, labels, watermark, logo, collage, contact sheet, or multiple alternatives in one image. Do not reproduce the reference bear, the golden star or the bone; create the requested leafy plant in the same visual family.
