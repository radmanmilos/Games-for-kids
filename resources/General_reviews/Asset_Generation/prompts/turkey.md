# animal-turkey — generation brief

- **Replaces:** the 🦃 glyph — `game/data/serbian.js` (Serbian phonics picture; Serbian phonics vocabulary)
- **Inventory row:** `animal-turkey` — status `REVIEW`; no turkey illustration exists in `game/` or `resources/`, so the row is eligible for generation
- **Why this one:** fifth of the remaining animals batch; one shared turkey asset serves the Serbian phonics picture
- **Category:** **animals** (STYLE_BIBLE.md §12): soft rounded body masses, simple believable anatomy, thick/clear legs, markings only as needed to identify the species, simple painted fur/feather suggestions
- **References sent to the model (iteration 2):** `Reference/bear.png` (canonical style anchor), `Reference/star.png` (canonical secondary reference — golden warmth for the paper/finish), `fox.png` (approved painted animal exemplar — finish and paper tone only, never its shape or colour). The rooster reference was **deliberately dropped**: in iteration 1 it leaked its poultry silhouette (comb, body proportions) and the result read as a rooster/chicken rather than a turkey.
- **Canvas:** 1024x1024 from the API, production target 512x512 PNG (STYLE_BIBLE.md)
- **Background:** warm off-white is acceptable for the work-in-progress bundle; transparency is a runtime requirement, not an illustration task

--- prompt ---

Create one standalone illustration of a single simple turkey for a cozy early-childhood storybook game. Match the supplied Little Play bear, golden star and fox references: soft watercolor wash with very subtle paper/colored-pencil grain; warm natural, gently muted colors; rounded, slightly organic shapes; soft painted shading; restrained contrast; quiet handmade charm; minimal, clean details; readable silhouette at small mobile size.

Draw one turkey standing in a calm, friendly pose: the dominant feature is a large fanned tail spread out behind like an open fan (a wide, rounded, semi-circular fan of feathers), a rounded body, and a small bare head with a red wattle and snood (no comb, no crest). The overall silhouette must read as a turkey: a fan-tail bird, NOT a chicken/rooster shape. Keep the silhouette compact and instantly readable as a turkey — the fanned tail is the key identifier.

Cover the body with a soft, muted dark-brown plumage — a gentle, muted dark brown, clearly brown and never grey-only, black, or muddy. Paint the fanned tail feathers with simple, broad, slightly darker brown strokes radiating outward like a fan. Paint the bare head a muted blue-grey with a small red wattle/snood. Keep the face simple: a small dark eye, no exaggerated expression, no comb. The turkey must read instantly as a turkey at small size and must not look like a chicken, a rooster, a hen or a brown blob.

This must NOT be a chicken or rooster: no comb on top of the head, no upright tail feathers, no rooster-like body proportions, no russet colouring. It is a turkey with a fanned tail fan and a bare head.

Keep it a simple, calm animal picture with no face beyond the gentle expression, no accessories, no props. One subject only, fully visible, centered with comfortable breathing room. Plain warm off-white background is acceptable. No added props, no ground line, no other animal. The result must look like it belongs beside the exact reference images.

No photorealism, 3D rendering, glossy plastic, vector emoji, stock-icon look, or anime styling. Not a chicken, not a rooster, not a hen, not a generic brown bird. No comb, no upright tail, no rooster-like body. No thick black outline, white sticker border, glow, hard drop shadow, or dramatic lighting. No excessive gradient, tiny detail, heavy texture, decorative sparkles, or ornamental extras. No unrequested face or accessories. No text, labels, watermark, logo, collage, contact sheet, or multiple alternatives in one image. Do not reproduce the reference bear, the golden star or the fox; create the requested turkey in the same visual family.