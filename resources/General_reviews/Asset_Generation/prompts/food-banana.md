# food-banana — generation brief

- **Replaces:** the 🍌 glyph — `game/data/serbian.js` (Serbian phonics picture), Kitty collectible themes
- **Inventory row:** `food-banana` — status `REVIEW`; no banana illustration exists in `game/` or `resources/`, so the row is eligible for generation
- **Why this one:** first food in the food batch; one shared banana asset can serve both the phonics picture and the Kitty collectible theme
- **Category:** **food / fruit** (STYLE_BIBLE.md §12): keep the whole item readable through shape and natural color; restrained soft highlights and shaded edges to suggest roundness, not a polished waxy or wet surface; leaves/stems/seeds few, clear, appropriately sized; preserve the real-world yellow color cue
- **References sent to the model:** `Reference/bear.png` (canonical style anchor), `Reference/star.png` (canonical secondary reference — golden warmth reinforces the banana's yellow), `bone.png` (approved simple-object exemplar — rounded, simple, faceless form). No cool references needed: a banana is a warm yellow, so it sits naturally inside the family palette
- **Canvas:** 1024x1024 from the API, production target 512x512 PNG (STYLE_BIBLE.md)
- **Background:** warm off-white is acceptable for the work-in-progress bundle; transparency is a runtime requirement, not an illustration task

--- prompt ---

Create one standalone illustration of a single simple banana for a cozy early-childhood storybook game. Match the supplied Little Play bear, golden star and bone references: soft watercolor wash with very subtle paper/colored-pencil grain; warm natural, gently muted colors; rounded, slightly organic shapes; soft painted shading; restrained contrast; quiet handmade charm; minimal, clean details; readable silhouette at small mobile size.

Draw one banana as a gentle curved crescent: plump and rounded along its length, tapering softly to a small stem at one end and a slightly pointed blossom end at the other, the classic banana curve with one soft bend. Keep the silhouette compact and instantly readable as a banana.

Fill it with a warm, soft, ripe banana yellow — a cheerful but muted golden-yellow, clearly yellow and never beige, brown, green or grey. Let the golden star reference reinforce the yellow family, but keep the tone soft and painted rather than flat or fluorescent. Paint one soft lighter highlight along the upper curve and a slightly deeper golden-amber shading along the inner (concave) edge, so the banana reads as rounded and dimensional without looking glossy, waxy or wet. Keep the color clearly readable when the picture is shrunk to a small card.

Keep it a simple, calm object picture with no face, no eyes and no expression. No spots, bruises, or brown freckles — keep the skin clean and even. One small short stem at the top, painted simply. The banana must read instantly as a banana at small size and must not look like a curved leaf, a crescent moon, a boomerang or a yellow blob.

One subject only, fully visible, centered with comfortable breathing room. Plain warm off-white background is acceptable. No added props, no bunch, no leaves, no hand, no plate, no knife, no table. The result must look like it belongs beside the exact reference images.

No photorealism, 3D rendering, glossy plastic, vector emoji, stock-icon look, or anime styling. Not a green banana, not an overripe brown banana, not a neon yellow banana, not a curved leaf, not a crescent moon. No thick black outline, white sticker border, glow, hard drop shadow, or dramatic lighting. No excessive gradient, tiny detail, heavy texture, decorative sparkles, or ornamental extras. No unrequested face or accessories. No text, labels, watermark, logo, collage, contact sheet, or multiple alternatives in one image. Do not reproduce the reference bear, the golden star or the bone; create the requested banana in the same visual family.