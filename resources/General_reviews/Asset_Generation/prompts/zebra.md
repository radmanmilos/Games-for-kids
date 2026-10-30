# animal-zebra — generation brief

- **Replaces:** the 🦓 glyph — `game/games/animal_puzzle.js` (savanna puzzle)
- **Inventory row:** `animal-zebra` — status `REVIEW`; no zebra illustration exists in `game/` or `resources/`, so the row is eligible for generation
- **Why this one:** first of the remaining animals batch; one shared zebra asset serves the savanna puzzle
- **Category:** **animals** (STYLE_BIBLE.md §12): soft rounded body masses, simple believable anatomy, thick/clear legs, markings only as needed to identify the species, simple painted fur suggestions
- **References sent to the model:** `Reference/bear.png` (canonical style anchor), `Reference/star.png` (canonical secondary reference — golden warmth for the paper/finish), `horse.png` (approved painted animal exemplar — similar hooved build, finish and paper tone only, never its shape or its warm brown colour)
- **Canvas:** 1024x1024 from the API, production target 512x512 PNG (STYLE_BIBLE.md)
- **Background:** warm off-white is acceptable for the work-in-progress bundle; transparency is a runtime requirement, not an illustration task

--- prompt ---

Create one standalone illustration of a single simple zebra for a cozy early-childhood storybook game. Match the supplied Little Play bear, golden star and horse references: soft watercolor wash with very subtle paper/colored-pencil grain; warm natural, gently muted colors; rounded, slightly organic shapes; soft painted shading; restrained contrast; quiet handmade charm; minimal, clean details; readable silhouette at small mobile size.

Draw one zebra standing in a calm, friendly pose: a rounded body, a sturdy neck, a short mane along the neck, a tufted tail, and four clear sturdy legs. Keep the silhouette compact and instantly readable as a zebra.

Cover the body with clear, simple black-and-white stripes: bold but soft-edged dark stripes on a warm off-white/cream body, running in the natural zebra direction (vertical-ish on the neck and body, horizontal on the legs). Keep the stripes few and broad rather than dense or fussy, so they survive at small size. Paint the mane a soft dark grey/black with simple strokes. Keep the face gentle: a small dark eye, a simple muzzle, no exaggerated expression. The zebra must read instantly as a zebra at small size and must not look like a horse, a donkey or a striped blob.

Keep it a simple, calm animal picture with no face beyond the gentle expression, no accessories, no props. One subject only, fully visible, centered with comfortable breathing room. Plain warm off-white background is acceptable. No added props, no ground line, no other animal. The result must look like it belongs beside the exact reference images.

No photorealism, 3D rendering, glossy plastic, vector emoji, stock-icon look, or anime styling. Not a horse, not a donkey, not a generic striped animal. No thick black outline, white sticker border, glow, hard drop shadow, or dramatic lighting. No excessive gradient, tiny detail, heavy texture, decorative sparkles, or ornamental extras. No unrequested face or accessories. No text, labels, watermark, logo, collage, contact sheet, or multiple alternatives in one image. Do not reproduce the reference bear, the golden star or the horse; create the requested zebra in the same visual family.
