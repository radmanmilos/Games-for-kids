# object-house — generation brief

- **Replaces:** the 🏠 glyph — `game/games/maze.js` (maze goal marker, "house")
- **Inventory row:** `object-house` — status `REVIEW`; no house illustration exists in `game/` or `resources/`, so the row is eligible for generation
- **Why this one:** first of the Objects/phonics batch; one shared cozy house asset serves the maze goal marker (and maze-goal-house reuses the same file)
- **Category:** **simple objects** (STYLE_BIBLE.md §12): simplify geometry without losing defining construction; same softly painted material treatment as animals and star; keep important parts (door, windows, roof) clearly separated
- **References sent to the model:** `Reference/bear.png` (canonical style anchor), `Reference/star.png` (canonical secondary reference — golden warmth for the paper/finish), `bone.png` (approved simple-object exemplar — rounded, simple, faceless form)
- **Canvas:** 1024x1024 from the API, production target 512x512 PNG (STYLE_BIBLE.md)
- **Background:** warm off-white is acceptable for the work-in-progress bundle; transparency is a runtime requirement, not an illustration task

--- prompt ---

Create one standalone illustration of a single simple cozy house for a cozy early-childhood storybook game. Match the supplied Little Play bear, golden star and bone references: soft watercolor wash with very subtle paper/colored-pencil grain; warm natural, gently muted colors; rounded, slightly organic shapes; soft painted shading; restrained contrast; quiet handmade charm; minimal, clean details; readable silhouette at small mobile size.

Draw one small cozy house: a simple rectangular body with a triangular (or gently rounded) roof, a small door in the center, and one or two small windows. Keep the silhouette compact and instantly readable as a house.

Paint the walls a soft, warm cream/beige, the roof a soft warm terracotta/red-brown, and the door a gentle warm brown. Keep the windows simple (soft light blue or warm cream). Paint one soft lighter highlight and a slightly deeper shading so the house reads as dimensional without looking glossy or 3D. Keep the colors clearly readable when the picture is shrunk to a small card.

Keep it a simple, calm object picture with no face, no eyes and no expression. No chimney smoke, no fence, no garden, no path, no extra buildings. The house must read instantly as a house at small size and must not look like a box, a barn or a castle.

One subject only, fully visible, centered with comfortable breathing room. Plain warm off-white background is acceptable. No added props, no landscape, no ground line, no other building. The result must look like it belongs beside the exact reference images.

No photorealism, 3D rendering, glossy plastic, vector emoji, stock-icon look, or anime styling. Not a barn, not a castle, not a box. No thick black outline, white sticker border, glow, hard drop shadow, or dramatic lighting. No excessive gradient, tiny detail, heavy texture, decorative sparkles, or ornamental extras. No unrequested face or accessories. No text, labels, watermark, logo, collage, contact sheet, or multiple alternatives in one image. Do not reproduce the reference bear, the golden star or the bone; create the requested house in the same visual family.