# food-cheese — generation brief

- **Replaces:** the 🧀 glyph — `game/games/spatial.js` (spatial scene / position task)
- **Inventory row:** `food-cheese` — status `REVIEW`; no cheese illustration exists in `game/` or `resources/`, so the row is eligible for generation
- **Why this one:** ninth (last) food in the food batch; one shared cheese asset serves the spatial scene
- **Category:** **food / fruit** (STYLE_BIBLE.md §12): keep the whole item readable through shape and natural color; restrained soft highlights and shaded edges to suggest roundness; preserve the real-world yellow color cue
- **References sent to the model (iteration 2):** `Reference/bear.png` (canonical style anchor), `bone.png` (approved simple-object exemplar — rounded, simple, faceless form). The golden star reference was **deliberately dropped**: in iteration 1 the star's five-pointed silhouette leaked into the result and the cheese came out star-shaped. Colour is stated explicitly in the prompt instead.
- **Canvas:** 1024x1024 from the API, production target 512x512 PNG (STYLE_BIBLE.md)
- **Background:** warm off-white is acceptable for the work-in-progress bundle; transparency is a runtime requirement, not an illustration task

--- prompt ---

Create one standalone illustration of a single simple piece of cheese for a cozy early-childhood storybook game. Match the supplied Little Play bear and bone references: soft watercolor wash with very subtle paper/colored-pencil grain; warm natural, gently muted colors; rounded, slightly organic shapes; soft painted shading; restrained contrast; quiet handmade charm; minimal, clean details; readable silhouette at small mobile size.

Draw one wedge (triangular slice) of cheese: a flat triangular piece with three straight-ish sides forming a triangle, one side slightly curved (the rind), like a slice cut from a round wheel, with a few small round holes (eyes) scattered across the face. The overall outer silhouette MUST be a triangle / wedge, never a star, never a five-pointed shape, never a flower, never a burst. Keep the silhouette compact and instantly readable as cheese.

Fill it with a clear, unmistakable cheese yellow — a warm, soft, slightly deep yellow, clearly yellow and never brown, orange, grey, or muddy. The yellow must be obvious and definite. Paint one soft lighter highlight on the upper left side and a slightly deeper yellow-amber shading along the lower right edge, so the wedge reads as rounded and dimensional without looking glossy, waxy or wet. Keep the color clearly readable when the picture is shrunk to a small card.

Paint the small holes as a few soft, slightly darker yellow-brown circles, clearly spaced and not dense. Keep them simple and round.

Keep it a simple, calm object picture with no face, no eyes and no expression. The wedge must read instantly as cheese at small size and must not look like a pizza slice, a triangle, a sponge or a yellow blob.

One subject only, fully visible, centered with comfortable breathing room. Plain warm off-white background is acceptable. No added props, no plate, no knife, no other food, no ground line. The result must look like it belongs beside the exact reference images.

No photorealism, 3D rendering, glossy plastic, vector emoji, stock-icon look, or anime styling. Not a brown cheese, not an orange cheese, not a grey cheese. Not a star, not a star shape, not a five-pointed shape, not a flower, not a burst, not a triangle with extra points. No thick black outline, white sticker border, glow, hard drop shadow, or dramatic lighting. No excessive gradient, tiny detail, heavy texture, decorative sparkles, or ornamental extras. No unrequested face or accessories. No text, labels, watermark, logo, collage, contact sheet, or multiple alternatives in one image. Do not reproduce the reference bear or the bone; create the requested cheese in the same visual family.