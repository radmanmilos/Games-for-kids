# object-tree — generation brief

- **Replaces:** the 🌳 glyph — `game/data/serbian.js` (phonics), `game/games/sequencing.js` (tree-growth sequence, stage 3: acorn → sprout → tree), racing decor
- **Inventory row:** `object-tree` — status `REVIEW`; no tree illustration exists in `game/` or `resources/`, so the row is eligible for generation
- **Why this one:** last missing item to complete the Sequencing / life-cycle / wash set; one shared tree asset serves phonics, the tree-growth sequence and racing decor (reused only where meaning and scale fit)
- **Category:** **plants / nature** (STYLE_BIBLE.md §12): gentle organic curves, simple leaf/petal groups, avoid dense botanical detail, natural colors soft but identifiable
- **References sent to the model:** `Reference/bear.png` (canonical style anchor), `Reference/star.png` (canonical secondary reference — golden warmth for the paper/finish), `bone.png` (approved simple-object exemplar — rounded, simple, faceless form). The family is warm, so the green must be stated explicitly
- **Canvas:** 1024x1024 from the API, production target 512x512 PNG (STYLE_BIBLE.md)
- **Background:** warm off-white is acceptable for the work-in-progress bundle; transparency is a runtime requirement, not an illustration task

--- prompt ---

Create one standalone illustration of a single simple tree for a cozy early-childhood storybook game. Match the supplied Little Play bear, golden star and bone references: soft watercolor wash with very subtle paper/colored-pencil grain; warm natural, gently muted colors; rounded, slightly organic shapes; soft painted shading; restrained contrast; quiet handmade charm; minimal, clean details; readable silhouette at small mobile size.

Draw one simple tree: a short, slightly tapered brown trunk with a rounded, full canopy of green foliage on top, like a friendly storybook tree. Keep the silhouette compact and instantly readable as a tree.

Fill the canopy with a clear, unmistakable tree green — a soft, warm, slightly yellowish green, clearly green and never brown, grey, blue, or muddy. The green must be obvious and definite. Paint one soft lighter highlight on the upper side of the canopy and a slightly deeper green shading along the lower edges, so the tree reads as rounded and dimensional without looking glossy, waxy or wet. Paint the trunk a soft, muted warm brown with simple shading. Keep the colors clearly readable when the picture is shrunk to a small card.

Keep it a simple, calm object picture with no face, no eyes and no expression. No apples, no fruit, no birds, no extra trees, no ground line, no roots, no grass. The tree must read instantly as a tree at small size and must not look like a bush, a lollipop, a cloud or a green blob.

One subject only, fully visible, centered with comfortable breathing room. Plain warm off-white background is acceptable. No added props, no landscape, no other tree, no ground line. The result must look like it belongs beside the exact reference images.

No photorealism, 3D rendering, glossy plastic, vector emoji, stock-icon look, or anime styling. Not a brown tree, not a grey tree, not a bush, not a cloud. No thick black outline, white sticker border, glow, hard drop shadow, or dramatic lighting. No excessive gradient, tiny detail, heavy texture, decorative sparkles, or ornamental extras. No unrequested face or accessories. No text, labels, watermark, logo, collage, contact sheet, or multiple alternatives in one image. Do not reproduce the reference bear, the golden star or the bone; create the requested tree in the same visual family.