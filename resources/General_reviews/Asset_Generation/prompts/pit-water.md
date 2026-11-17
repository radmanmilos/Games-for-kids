# pit-water — Little Explorer generation brief

**What this is:** The painted body of a water pit (the trench between two ground platforms) for the Spring/Summer worlds.
**Why this one:** The pit is currently a flat blue gradient with procedural ripples, bubbles and fish. This asset replaces only its surface paint; pit geometry, collision (none), respawn and the ripple/bubble/fish animation stay unchanged.
**Category:** scenery strip (not a glyph) — the result lives in `game/assets/ui/`, never in `game/assets/art/`.
**Reference:** `--ref-files Reference/bear.png` for the storybook wash only; do not copy the bear subject.
**Canvas:** 1024×1024 opaque PNG from the Cloudflare generator; production target is a 768×202 WebP band cropped from the top of the painting.
**Background:** none — the painting must fill the entire canvas edge to edge. This is a full-bleed texture, not an isolated subject, so there is no cutout step.
**Generation status:** Task 458 — GENERATED / USER-APPROVED DIRECTION / INTEGRATED. Second generation (`pit-water.png`, 1024×1024 RGB, 2 584 858 bytes) is the accepted one; the first attempt was not used. Cropped band → `game/assets/ui/pits/pit-water.webp` (768×202 WebP q80, 16 KB) and wired into `drawPitHazards('water')`; the flat gradient stays the load fallback and the ripple/bubble/fish animation stays procedural.

--- prompt ---

Match the approved Little Play storybook direction: soft watercolor/gouache washes, subtle paper or colored-pencil grain, gentle pigment variation, warm muted colours, organic hand-painted edges, restrained soft shading. It must not look like flat vector, emoji art, or a glossy 3D render.

A full-bleed painted cross-section of the water in a narrow trench, seen straight from the side. The paint reaches and runs off all four canvas edges: no background, no paper margin, no white border, no frame, no vignette, no horizon, no sky. Across the very top of the canvas (the first 5% of the height) runs the water surface: one soft pale line of light with small painted ripple highlights. Below it the water body fills the rest of the canvas and gets steadily deeper and darker towards the bottom edge, from a soft teal-blue just under the surface to a deep navy at the bottom. Scatter a few very soft painted light patches and faint swirls in the body, nothing sharp and nothing that reads as an object.

This is water only: absolutely no animal, creature, face, eyes, ears, snout, bear or character anywhere in the frame. The reference images are style references only; do not draw anything from them.

Keep it readable at 100 screen pixels tall: broad colour zones and soft shapes only, no thin lines, no small dots, no foam spray, no waves that break the surface line. No text, no numbers, no fish, no plants, no rocks, no treasure, no characters, no reflections of scenery, no bubbles that read as separate objects.

No photorealism, 3D, perspective, heavy black outlines, white sticker borders, dark halos, glow, hard drop shadows, text, characters, unrelated props, or background scenery.
