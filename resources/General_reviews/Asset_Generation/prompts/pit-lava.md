# pit-lava — Little Explorer generation brief

**What this is:** The painted body of a lava pit (the trench between two ground platforms).
**Why this one:** The pit is currently a flat orange gradient with procedural bubbles. This asset replaces only its surface paint; pit geometry, collision (none), respawn and the bubble animation stay unchanged.
**Category:** scenery strip (not a glyph) — the result lives in `game/assets/ui/`, never in `game/assets/art/`.
**Reference:** `--ref-files Reference/bear.png` for the storybook wash only; do not copy the bear subject.
**Canvas:** 1024×1024 opaque PNG from the Cloudflare generator; production target is a 768×202 WebP band cropped from the top of the painting.
**Background:** none — the painting must fill the entire canvas edge to edge. This is a full-bleed texture, not an isolated subject, so there is no cutout step.
**Generation status:** Task 458 — GENERATED / USER-APPROVED DIRECTION / INTEGRATED. Third generation (`pit-lava.png`, 1024×1024 RGB, 2 132 252 bytes) is the accepted one; the first two attempts were not used. Cropped band → `game/assets/ui/pits/pit-lava.webp` (768×202 WebP q80, 11 KB) and wired into `drawPitHazards('lava')`; the pale side margins of the painting fall outside the content-column crop, so they never reach the screen. Flat gradient fallback + bubble animation unchanged.

--- prompt ---

Match the approved Little Play storybook direction: soft watercolor/gouache washes, subtle paper or colored-pencil grain, gentle pigment variation, warm muted colours, organic hand-painted edges, restrained soft shading. It must not look like flat vector, emoji art, or a glossy 3D render.

A full-bleed painted cross-section of molten lava flowing in a narrow trench, seen straight from the side. The paint reaches and runs off all four canvas edges: no background, no paper margin, no white border, no frame, no vignette, no horizon, no sky, no rock silhouette.

The whole canvas is liquid molten lava. Across the very top of the canvas (the first 5% of the height) runs the lava surface: one soft pale-gold line of hottest light. Below it the molten body fills the rest of the canvas as smooth flowing liquid: a few broad soft bands of brighter and duller molten colour, from bright orange just under the surface to a deep burnt red-brown towards the bottom edge. Painted with soft washes, no cracks, no fissures, no broken plates, no crust tiles, no stones, no dry ground. Everything stays soft and painterly.

This is molten liquid only: no animal, creature, face, bear or character anywhere in the frame. The reference images are style references only; do not draw anything from them.

Keep it readable at 100 screen pixels tall: broad colour zones and soft shapes only, no thin lines, no small dots, no sparks, no spray, no flame tongues rising above the surface line. No text, no numbers, no bubbles that read as separate objects, no rocks, no treasure, no characters, no background scenery.

No photorealism, 3D, perspective, heavy black outlines, white sticker borders, dark halos, glow bloom, hard drop shadows, text, characters, unrelated props.
