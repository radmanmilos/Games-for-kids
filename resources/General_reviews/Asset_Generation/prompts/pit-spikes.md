# pit-spikes — Little Explorer generation brief

**What this is:** The painted interior of a spiked pit (the trench between two ground platforms) with the spikes painted into the strip.
**Why this one:** The pit previously used a flat near-black rectangle plus crisp procedural triangles. A painted *bed* (`pit-spikes.png`, task 458) was rejected on user review 2026-11-17 ("i sees some rocks not spikes") and deleted in task 460, leaving a code-only dark trench. This brief tries the other way round: paint the dark strip **with the spikes in it**, so the hazard is part of the storybook paint instead of white triangles stuck on top.
**Category:** scenery strip (not a glyph) — the result lives in `game/assets/ui/`, never in `game/assets/art/`.
**Reference:** none — the storybook wash is described inline below; do NOT include any animal, creature or character (no bear, no mascot).
**Canvas:** 1024×1024 opaque PNG from the Cloudflare generator; production target is an 800×200 WebP band cropped around the spike row, drawn 100 px tall in the pit.
**Background:** none — the painting must fill the entire canvas edge to edge. This is a full-bleed texture, not an isolated subject, so there is no cutout step.
**Generation status:** v4 accepted (task 461) — near-black field with painted spikes, no bear, full-bleed dark edges. Cropped to `game/assets/ui/pits/pit-spikes.webp` (800×200, 24 KB, no depth shading). v2/v3 rejected (white borders, dirt speckles, bear-like shape, not dark enough).

--- prompt ---

Match the approved Little Play storybook direction: soft watercolor/gouache washes, subtle paper or colored-pencil grain, gentle pigment variation, organic hand-painted edges, restrained soft shading. It must not look like flat vector, emoji art, or a glossy 3D render.

A full-bleed painted view of a dark spiked pit, seen straight from the side. The paint reaches and runs off all four canvas edges: no background, no paper margin, no cream border, no white border, no frame, no vignette, no sky, no horizon, no animal, no creature, no character, no bear.

The whole square is a near-black charcoal field (about #0A0C10 to #161A22), with only the faintest soft brush variation (never lighter than #222833). No texture, no speckles, no dots, no dust, no grains of soil, no stones, no pebbles, no rubble, no floor line, no horizon line, no gradient to a lighter band.

Across the lower half of the square rises one row of tall pointed spikes, clearly triangular, pointed at the top and wide at the bottom, planted in the dark field and cut off by the left and right canvas edges. The spikes are painted slate-grey stone with a pale bone-coloured lit face (about #D9DEE7) and a soft dark edge, slightly irregular in height and angle, roughly nine to twelve of them across the square, some slightly behind others. Each spike must be unmistakably a spike: a pointed cone, not a rock, not a boulder, not a blob.

No animals, creatures, faces, characters, text, numbers, or objects. No boulders, no pebbles, no rubble, no round stones, no moss, no grass, no plants, no bones, no skulls, no lava, no water, no coins, no treasure, no bear.

No photorealism, 3D, perspective, bird's-eye or top-down view, heavy black outlines, white sticker borders, cream or paper side margins, dark halos, glow, hard drop shadows.
