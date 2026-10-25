# animal-mouse — generation brief

- **Replaces:** the 🐭 glyph — `game/games/spatial.js` (spatial scene / position task)
- **Inventory row:** `animal-mouse` — status `REVIEW`; no mouse illustration exists in `game/` or `resources/`, so the row is eligible for generation
- **Why this one:** next of the remaining animals batch; one shared mouse asset serves the spatial scene
- **Category:** **animals** (STYLE_BIBLE.md §12): soft rounded body masses, simple believable anatomy, thick/clear legs, markings only as needed to identify the species, simple painted fur suggestions
- **References sent to the model (iteration 2):** `Reference/bear.png` (canonical style anchor), `Reference/star.png` (canonical secondary reference — golden warmth for the paper/finish), `bone.png` (approved simple-object exemplar — rounded, simple, faceless form). The squirrel reference was **deliberately dropped**: in iteration 1 it leaked its bushy tail and the result came out with two tails and no visible paws.
- **Canvas:** 1024x1024 from the API, production target 512x512 PNG (STYLE_BIBLE.md)
- **Background:** warm off-white is acceptable for the work-in-progress bundle; transparency is a runtime requirement, not an illustration task

--- prompt ---

Create one standalone illustration of a single simple mouse for a cozy early-childhood storybook game. Match the supplied Little Play bear, golden star and bone references: soft watercolor wash with very subtle paper/colored-pencil grain; warm natural, gently muted colors; rounded, slightly organic shapes; soft painted shading; restrained contrast; quiet handmade charm; minimal, clean details; readable silhouette at small mobile size.

Draw one mouse in a calm, friendly pose: a small rounded body, a pointed but soft snout, large rounded ears, two small visible front paws held in front of the body, two small back feet, and exactly ONE long thin tail extending behind. Keep the silhouette compact and instantly readable as a mouse — the large ears and the single long thin tail are the key identifiers.

The mouse has exactly ONE tail (long and thin), never two, never a bushy tail. The mouse has visible paws/arms at the front. Do not omit the paws.

Cover the body with a soft, warm grey-brown (or soft grey) — a gentle, muted grey-brown, clearly grey-brown and never orange, black, or muddy. Paint the ears with a slightly lighter inner tone. Keep the face gentle: a small dark eye, a simple tiny nose, no exaggerated expression. The mouse must read instantly as a mouse at small size and must not look like a rat, a hamster or a grey blob.

Keep it a simple, calm animal picture with no face beyond the gentle expression, no accessories, no props. One subject only, fully visible, centered with comfortable breathing room. Plain warm off-white background is acceptable. No added props, no ground line, no other animal. The result must look like it belongs beside the exact reference images.

No photorealism, 3D rendering, glossy plastic, vector emoji, stock-icon look, or anime styling. Not a rat, not a hamster, not a generic grey animal. Not two tails, not a bushy tail, not a tailless mouse. No thick black outline, white sticker border, glow, hard drop shadow, or dramatic lighting. No excessive gradient, tiny detail, heavy texture, decorative sparkles, or ornamental extras. No unrequested face or accessories. No text, labels, watermark, logo, collage, contact sheet, or multiple alternatives in one image. Do not reproduce the reference bear, the golden star or the bone; create the requested mouse in the same visual family.