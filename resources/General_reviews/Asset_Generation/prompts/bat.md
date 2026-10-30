# animal-bat — generation brief

- **Replaces:** the 🦇 glyph — `game/games/racing-config.js` (night scenery)
- **Inventory row:** `animal-bat` — status `REVIEW`; no bat illustration exists in `game/` or `resources/`, so the row is eligible for generation
- **Why this one:** next of the remaining animals batch; one shared bat asset serves the night scenery
- **Category:** **animals** (STYLE_BIBLE.md §12): soft rounded body masses, simple believable anatomy, thick/clear legs, markings only as needed to identify the species, simple painted fur suggestions
- **References sent to the model (iteration 4):** `mouse.png` (approved painted animal — mouse-like face and small furry body, the model for the bat's head), `fox.png` (approved painted animal — small furry build and painted finish, paper tone only, never its shape or its orange colour), `bone.png` (approved simple object — rounded, simple, faceless form, finish and paper tone). The bear and star references were **deliberately dropped** per the user's request to use the most relevant approved references instead of the default set; the mouse's face is the model for the bat's mouse-like head.
- **Canvas:** 1024x1024 from the API, production target 512x512 PNG (STYLE_BIBLE.md)
- **Background:** warm off-white is acceptable for the work-in-progress bundle; transparency is a runtime requirement, not an illustration task

--- prompt ---

Create one standalone illustration of a single simple bat for a cozy early-childhood storybook game. Match the supplied mouse, fox and bone references: soft watercolor wash with very subtle paper/colored-pencil grain; warm natural, gently muted colors; rounded, slightly organic shapes; soft painted shading; restrained contrast; quiet handmade charm; minimal, clean details; readable silhouette at small mobile size.

Draw one bat in a calm, friendly pose: a SMALL, round, compact body (not stocky or large), a tiny head with small pointed ears, and two large wings spread out to the sides (like a gentle cape). The body should be noticeably smaller and rounder than the wingspan — a small round body with big wings, not a big stocky body. Keep the silhouette compact and instantly readable as a bat — the large spread wings are the key identifier.

The face must be a BAT face (mouse-like), NOT a bear face: a small pointed snout, tiny pointed ears, a tiny nose, small dark eyes. No round bear-like muzzle, no bear-like face. It should look like a mouse/bat face.

Cover the body and wings with a soft, warm dark brown (or dark grey-brown) — a gentle, muted dark brown, clearly brown and never black, grey-only, or muddy. Add tiny small claws (little hook-like tips) at the upper points of each wing, painted simply. Keep the face gentle: small dark eyes, a simple tiny nose, no exaggerated expression (friendly, not scary). The bat must read instantly as a bat at small size and must not look like a bird, a butterfly or a dark blob.

The face must be mouse-like (pointed snout, tiny pointed ears, tiny nose), NOT bear-like. The wings must have tiny claws at their upper points.

Keep it a simple, calm animal picture with no face beyond the gentle expression, no accessories, no props. One subject only, fully visible, centered with comfortable breathing room. Plain warm off-white background is acceptable. No added props, no ground line, no other animal. The result must look like it belongs beside the exact reference images.

No photorealism, 3D rendering, glossy plastic, vector emoji, stock-icon look, or anime styling. Not a bird, not a butterfly, not a generic dark animal. No thick black outline, white sticker border, glow, hard drop shadow, or dramatic lighting. No excessive gradient, tiny detail, heavy texture, decorative sparkles, or ornamental extras. No unrequested face or accessories. No text, labels, watermark, logo, collage, contact sheet, or multiple alternatives in one image. Do not reproduce the reference mouse, the fox or the bone; create the requested bat in the same visual family.
