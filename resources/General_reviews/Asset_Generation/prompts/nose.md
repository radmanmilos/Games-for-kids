# object-nose — generation brief

- **Replaces:** the 👃 glyph — `game/data/serbian.js` (body-part phonics picture; Serbian phonics vocabulary)
- **Inventory row:** `object-nose` — status `REVIEW`; no nose illustration exists in `game/` or `resources/`, so the row is eligible for generation
- **Why this one:** next of the Objects/phonics batch; one shared nose asset serves the body-part phonics picture
- **Category:** **simple objects** (STYLE_BIBLE.md §12): simplify geometry without losing defining construction; same softly painted material treatment as animals and star
- **References sent to the model (iteration 4):** `nose-ref1.png` (user-supplied photo of a real nose, `Reference/images (1).jpeg` converted to PNG) and `nose-ref2.png` (user-supplied photo, `Reference/images (2).jpeg` converted to PNG) — both sent as **subject** references: copy their shape and proportions (a real nose silhouette with bridge, tip, nostrils) but NOT their photographic colours or finish. Then `bear.png` (canonical style anchor) and `bone.png` (approved simple-object exemplar) as the **style** references (painted finish and paper tone only). The star reference is dropped to avoid star-shape contamination.
- **Canvas:** 1024x1024 from the API, production target 512x512 PNG (STYLE_BIBLE.md)
- **Background:** warm off-white is acceptable for the work-in-progress bundle; transparency is a runtime requirement, not an illustration task

--- prompt ---

Create one standalone illustration of a single simple human nose for a cozy early-childhood storybook game. The first two reference images are PHOTOS of real noses: copy their SHAPE and PROPORTIONS (a real nose silhouette with bridge, tip, nostrils) but render it in the painted storybook style of the other references — NOT photorealistic. Match the supplied Little Play bear and bone references for the painted finish: soft watercolor wash with very subtle paper/colored-pencil grain; warm natural, gently muted colors; rounded, slightly organic shapes; soft painted shading; restrained contrast; quiet handmade charm; minimal, clean details; readable silhouette at small mobile size.

Draw one simple nose in a FRONT-FACING (forward) view, like the first version: a small, soft nose seen from the front, with a visible bridge at the top, a rounded tip in the center, and two small nostril openings at the base. It must read as a real nose silhouette (bridge + tip + nostrils) but from the FRONT, not the side — not too much profile, not showing too much of the face/side. It must NOT look like a round ball or a bump; it must look like an actual human nose with its characteristic shape (bridge + tip + nostrils) seen from the front. Keep the silhouette compact and instantly readable as a nose.

Paint it a soft, warm light skin tone — a gentle, muted warm tone, clearly a nose and never grey, orange, or muddy. Paint one soft lighter highlight and a slightly deeper shading so the nose reads as rounded and dimensional without looking glossy or 3D. Keep the color clearly readable when the picture is shrunk to a small card.

Keep it a simple, calm object picture with no face, no eyes and no expression. No extra facial features, no face around it. The nose must read instantly as a nose at small size and must not look like a bump, a hill or a blob.

One subject only, fully visible, centered with comfortable breathing room. Plain warm off-white background is acceptable. No added props, no ground line, no other object. The result must look like it belongs beside the exact reference images.

No photorealism, 3D rendering, glossy plastic, vector emoji, stock-icon look, or anime styling. Not a bump, not a hill, not a blob. No thick black outline, white sticker border, glow, hard drop shadow, or dramatic lighting. No excessive gradient, tiny detail, heavy texture, decorative sparkles, or ornamental extras. No unrequested face or accessories. No text, labels, watermark, logo, collage, contact sheet, or multiple alternatives in one image. Do not reproduce the reference bear, the golden star or the bone; create the requested nose in the same visual family.
