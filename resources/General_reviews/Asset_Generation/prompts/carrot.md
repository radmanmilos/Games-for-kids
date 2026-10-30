# food-carrot — generation brief

- **Replaces:** the 🥕 glyph — `game/games/sequencing.js` (growth sequence result), `game/games/kitty-standalone.js` (Kitty collectible)
- **Inventory row:** `food-carrot` — status `REVIEW`; no carrot illustration exists in `game/` or `resources/`, so the row is eligible for generation
- **Why this one:** seventh food in the food batch; one shared carrot asset serves both the growth sequence result and the Kitty collectible theme
- **Category:** **food / fruit** (STYLE_BIBLE.md §12): keep the whole item readable through shape and natural color; restrained soft highlights and shaded edges to suggest roundness; leaves/stems few, clear, appropriately sized; preserve the real-world orange color cue
- **References sent to the model:** `Reference/bear.png` (canonical style anchor), `Reference/star.png` (canonical secondary reference — golden warmth for the paper/finish), `bone.png` (approved simple-object exemplar — rounded, simple, faceless form)
- **Canvas:** 1024x1024 from the API, production target 512x512 PNG (STYLE_BIBLE.md)
- **Background:** warm off-white is acceptable for the work-in-progress bundle; transparency is a runtime requirement, not an illustration task

--- prompt ---

Create one standalone illustration of a single simple carrot for a cozy early-childhood storybook game. Match the supplied Little Play bear, golden star and bone references: soft watercolor wash with very subtle paper/colored-pencil grain; warm natural, gently muted colors; rounded, slightly organic shapes; soft painted shading; restrained contrast; quiet handmade charm; minimal, clean details; readable silhouette at small mobile size.

Draw one carrot: a long, tapered root that is thicker at the top and narrows to a pointed tip at the bottom, with a small cluster of green leafy tops (the fronds) sprouting from the top. Keep the silhouette compact and instantly readable as a carrot.

Fill the root with a clear, unmistakable carrot orange — a warm, soft, slightly deep orange, clearly orange and never brown, red, yellow, or muddy. The orange must be obvious and definite. Paint one soft lighter highlight along the upper side and a slightly deeper orange shading along the lower side, so the root reads as rounded and dimensional without looking glossy, waxy or wet. Keep the color clearly readable when the picture is shrunk to a small card.

Paint the leafy top as a small cluster of simple green fronds with soft, muted leaf green and no intricate veining. Keep the fronds small so they do not compete with the root.

Keep it a simple, calm object picture with no face, no eyes and no expression. The carrot must read instantly as a carrot at small size and must not look like a cone, a pepper, a flame or an orange blob.

One subject only, fully visible, centered with comfortable breathing room. Plain warm off-white background is acceptable. No added props, no plate, no knife, no other vegetable, no ground line. The result must look like it belongs beside the exact reference images.

No photorealism, 3D rendering, glossy plastic, vector emoji, stock-icon look, or anime styling. Not a red carrot, not a yellow carrot, not a brown carrot, not a cone. No thick black outline, white sticker border, glow, hard drop shadow, or dramatic lighting. No excessive gradient, tiny detail, heavy texture, decorative sparkles, or ornamental extras. No unrequested face or accessories. No text, labels, watermark, logo, collage, contact sheet, or multiple alternatives in one image. Do not reproduce the reference bear, the golden star or the bone; create the requested carrot in the same visual family.
