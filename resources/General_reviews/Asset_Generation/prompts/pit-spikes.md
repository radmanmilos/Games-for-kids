# pit-spikes — Little Explorer generation brief

**What this is:** The painted interior of a spiked pit (the trench between two ground platforms).
**Why this one:** The pit is currently a flat near-black rectangle with crisp procedural grey spikes. This asset replaces only the trench paint behind them; pit geometry, collision (none) and respawn stay unchanged, and the spikes themselves stay procedural so the hazard signal stays crisp at 100 screen pixels tall.
**Category:** scenery strip (not a glyph) — the result lives in `game/assets/ui/`, never in `game/assets/art/`.
**Reference:** `--ref-files Reference/bear.png` for the storybook wash only; do not copy the bear subject.
**Canvas:** 1024×1024 opaque PNG from the Cloudflare generator; production target is a 768×202 WebP band cropped from the top of the painting.
**Background:** none — the painting must fill the entire canvas edge to edge. This is a full-bleed texture, not an isolated subject, so there is no cutout step.
**Generation status:** Task 458 — GENERATED / USER-APPROVED DIRECTION / INTEGRATED. First generation (`pit-spikes.png`, 1024×1024 RGB, 2 260 358 bytes) was accepted. Cropped band → `game/assets/ui/pits/pit-spikes.webp` (768×202 WebP q80, 17 KB) and wired into `drawPitHazards('spikes')` as the bed paint under the procedural triangle spikes; triangle geometry and collision bounds are untouched.

--- prompt ---

Match the approved Little Play storybook direction: soft watercolor/gouache washes, subtle paper or colored-pencil grain, gentle pigment variation, warm muted colours, organic hand-painted edges, restrained soft shading. It must not look like flat vector, emoji art, or a glossy 3D render.

A full-bleed painted cross-section of a dark stone pit, seen straight from the side. The painting fills the whole canvas: no background, no frame, no vignette, no border, no horizon. Across the very top of the canvas (the first 6% of the height) runs a soft rim of broken stone and dark earth where the ground breaks off. Below it the shaft walls fill the rest of the canvas in deep cool charcoal-brown rock with broad painted stone facets and a few soft moss or dirt accents, getting darker towards the bottom edge. The bottom fifth is a nearly flat dark floor.

This is the pit interior only. Do NOT paint spikes, blades, teeth or stalagmites: the game draws its own crisp pale-grey spikes in front of this background. Keep the middle area free of objects so those spikes stay readable.

Keep it readable at 100 screen pixels tall: broad colour zones and soft shapes only, no thin lines, no small dots, no pebbles that read as separate objects. No text, no numbers, no bones, no treasure, no creatures, no light rays.

No photorealism, 3D, perspective, heavy black outlines, white sticker borders, dark halos, glow, hard drop shadows, text, characters, unrelated props, or background scenery.
