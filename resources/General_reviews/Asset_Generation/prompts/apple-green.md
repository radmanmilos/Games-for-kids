# food-apple-green — generation brief

- **Replaces:** the 🍏 glyph — `game/games/sequencing.js` (unripe fruit sequence step)
- **Inventory row:** `food-apple-green` — status `REVIEW`; no green-apple illustration exists in `game/` or `resources/`, so the row is eligible for generation
- **Why this one:** eighth food in the food batch; a separate green (unripe) apple because color conveys the sequence stage, distinct from the approved red `apple.png`
- **Category:** **food / fruit** (STYLE_BIBLE.md §12): keep the whole item readable through shape and natural color; restrained soft highlights and shaded edges to suggest roundness; preserve the real-world green color cue and the apple's distinct round silhouette (not a pear)
- **References sent to the model:** `Reference/bear.png` (canonical style anchor), `Reference/star.png` (canonical secondary reference — golden warmth for the paper/finish), `bone.png` (approved simple-object exemplar — rounded, simple, faceless form). The family is warm, so the green must be stated explicitly
- **Canvas:** 1024x1024 from the API, production target 512x512 PNG (STYLE_BIBLE.md)
- **Background:** warm off-white is acceptable for the work-in-progress bundle; transparency is a runtime requirement, not an illustration task

--- prompt ---

Create one standalone illustration of a single simple green (unripe) apple for a cozy early-childhood storybook game. Match the supplied Little Play bear, golden star and bone references: soft watercolor wash with very subtle paper/colored-pencil grain; warm natural, gently muted colors; rounded, slightly organic shapes; soft painted shading; restrained contrast; quiet handmade charm; minimal, clean details; readable silhouette at small mobile size.

Draw one apple with its classic round silhouette: a plump, rounded sphere that is clearly an apple and not a pear — the body is evenly rounded all around, with a small stem and one or two small simple leaves at the top. Keep the silhouette compact and instantly readable as an apple.

Fill it with a clear, unmistakable unripe-apple green — a soft, warm, slightly yellowish green, clearly green and never brown, grey, blue, or muddy. The green must be obvious and definite and must read as an unripe (green) apple, distinct from a red apple. Paint one soft lighter highlight on the upper left side and a slightly deeper green shading along the lower right edge, so the fruit reads as rounded and dimensional without looking glossy, waxy or wet. Keep the color clearly readable when the picture is shrunk to a small card.

Paint one small short stem at the top and one or two small simple leaves, soft muted leaf green, no intricate veining. Do not paint individual skin pores or texture; keep the surface softly painted and clean.

Keep it a simple, calm object picture with no face, no eyes and no expression. The apple must read instantly as a green apple at small size and must not look like a pear, a lime, a green ball or a green blob.

One subject only, fully visible, centered with comfortable breathing room. Plain warm off-white background is acceptable. No added props, no plate, no knife, no other fruit, no ground line. The result must look like it belongs beside the exact reference images.

No photorealism, 3D rendering, glossy plastic, vector emoji, stock-icon look, or anime styling. Not a red apple, not a yellow apple, not a brown apple, not a pear. No thick black outline, white sticker border, glow, hard drop shadow, or dramatic lighting. No excessive gradient, tiny detail, heavy texture, decorative sparkles, or ornamental extras. No unrequested face or accessories. No text, labels, watermark, logo, collage, contact sheet, or multiple alternatives in one image. Do not reproduce the reference bear, the golden star or the bone; create the requested green apple in the same visual family.