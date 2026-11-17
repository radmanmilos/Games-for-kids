# pit-water — Little Explorer generation brief

**What this is:** The painted body of a water pit (the trench between two ground platforms) for the Spring/Summer/Japan worlds.
**Why this one:** The pit is currently a flat blue gradient with procedural ripples, bubbles and fish. This asset replaces only its surface paint; pit geometry, collision (none), respawn and the ripple/bubble/fish animation stay unchanged.
**Category:** scenery strip (not a glyph) — the result lives in `game/assets/ui/`, never in `game/assets/art/`.
**Reference:** `--ref-files Reference/bear.png` for the storybook wash only; do not copy the bear subject.
**Canvas:** 1024×1024 opaque PNG from the Cloudflare generator; production target is an 800×200 WebP band cropped from the **top quarter** of the painting, drawn 100 px tall in the pit.
**Background:** none — the painting must fill the entire canvas edge to edge. This is a full-bleed texture, not an isolated subject, so there is no cutout step.
**Generation status:** Task 458 v1/v2 INTEGRATED but REJECTED on user visual review 2026-11-17 (paper margins left in the crop read as a cream stripe at the pit edge; body was grey-green and did not match the pastel worlds; no readable waterline so the pit read as a top-down pool). Brief rewritten: pastel aqua palette, a waterline across the **top 15%** of the canvas, and an explicit ban on any paper/cream margin. New generation supersedes v2.

--- prompt ---

Match the approved Little Play storybook direction: soft watercolor/gouache washes, subtle paper or colored-pencil grain, gentle pigment variation, warm muted colours, organic hand-painted edges, restrained soft shading. It must not look like flat vector, emoji art, or a glossy 3D render.

A full-bleed painted cross-section of water standing in a shallow trench, seen straight from the side. The paint reaches and runs off **all four canvas edges**: no background, no paper margin, no cream border, no white border, no frame, no vignette, no horizon, no sky. Every pixel of the canvas is water.

Across the top of the canvas — the first 15% of the height — runs the water surface: one clear, slightly wavy horizontal line of pale light with a soft bright crest right at the very top edge, then a narrow darker band just under it. This top line is what tells the eye the water is seen from the side; it must be clearly readable at 100 screen pixels tall and must not disappear.

Below the surface line the water body fills the rest of the canvas as smooth shallow water: a soft aqua-teal, light and fresh near the top (about #A9DED0 → #7EC8BE) and gently deeper below (about #4E9C9A → #3E7F86), with broad soft washes, faint light patches and a few slow gentle swirls. Keep the whole body light and pastel — no deep navy, no near-black bottom, no muddy grey-green. A faint warm sand tint may appear along the very bottom edge of the canvas.

This is water only: absolutely no animal, creature, face, eyes, ears, snout, bear, fish or character anywhere in the frame, and no object floating in the water. The reference images are style references only; do not draw anything from them.

No text, no numbers, no fish, no plants, no rocks, no treasure, no reflections of scenery, no bubbles that read as separate objects, no foam spray, no waves that break above the surface line, no thin lines, no small dots.

No photorealism, 3D, perspective, bird's-eye or top-down view, heavy black outlines, white sticker borders, cream or paper side margins, dark halos, glow, hard drop shadows, text, characters, unrelated props, or background scenery.
