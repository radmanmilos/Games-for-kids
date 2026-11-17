# pit-lava — Little Explorer generation brief

**What this is:** The painted body of a lava pit (the trench between two ground platforms) for the Underground and Cave worlds.
**Why this one:** The pit is currently a flat orange gradient with procedural bubbles. This asset replaces only its surface paint; pit geometry, collision (none), respawn and the bubble animation stay unchanged.
**Category:** scenery strip (not a glyph) — the result lives in `game/assets/ui/`, never in `game/assets/art/`.
**Reference:** `--ref-files Reference/bear.png` for the storybook wash only; do not copy the bear subject.
**Canvas:** 1024×1024 opaque PNG from the Cloudflare generator; production target is an 800×200 WebP band cropped from the dense molten area, drawn 100 px tall in the pit.
**Background:** none — the painting must fill the entire canvas edge to edge. This is a full-bleed texture, not an isolated subject, so there is no cutout step.
**Generation status:** Task 458 v1–v3 INTEGRATED then REJECTED on user visual review 2026-11-17 (cream/brown side margins left in the crop read as dirt at the pit edge, pale centre). v4 (cross-section brief) also rejected by the crop guard: it framed cream sky around a muted brick-red core, 0.02 hazard share across the band. Brief rewritten for v5 as a plain edge-to-edge lava close-up with no framing words at all (no "trench", "cross-section", "scene"), because those pulled the generator into painting surroundings.

--- prompt ---

An edge-to-edge painted close-up of molten lava. The lava fills the whole square frame completely, corner to corner, with no background and no border of any kind.

Style: soft watercolour/gouache washes with a subtle paper grain, gentle pigment variation, organic hand-painted edges, restrained soft shading. Painted, warm, storybook-like. Not flat vector, not emoji art, not a glossy 3D render.

Colour: a bright molten surface band across the top of the square — hot pale gold (about #FFE9A8) fading quickly into bright orange (about #FF9E3D) — then the body sliding through warm red (about #E0561F) into a deep burnt red near the bottom (about #8E2A12). Broad soft flowing bands and faint slow swirls, everything smooth and luminous.

Every part of the square is lava. There is no cream, no beige, no paper-coloured area, no white area, no pale empty corner, no sky, no frame, no margin, no vignette, no rock, no cave wall, no ground, no crust, no stones, no cracks, no flames, no sparks, no bubbles, no objects, no characters, no text.
