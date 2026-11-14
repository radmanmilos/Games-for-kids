# terrain-japan-top — Little Explorer generation brief

**What this is:** One horizontally tileable top-and-side terrain segment for the japan world.
**Why this one:** The current ground, float, and stair surfaces are procedural. This asset replaces only their appearance; platform coordinates, collision and physics stay unchanged.
**Reference:** Run the project generator with --ref-files Reference/star.png (style only; do not copy the star subject or silhouette).
**Canvas:** 1024×1024 opaque PNG from the Cloudflare generator; production target 512×512 real-alpha WebP after the existing cutout and technical-QA steps.
**Background:** Uniform warm cream/off-white for the edge-flood cutout; isolated subject only, no scene, vignette or cast shadow.
**Generation status:** User-authorized 2026-11-07; quota-blocked at 10,000/10,000. First attempt (task 454) produced a flat pink band that was invisible on the pink scene and was rejected (task 455, `resources/Little_Explorer_unused_art/rejected/`). Regenerated for task 456 with the contrast and tiling requirements below. Task 456 outcome: seed 4561 (`terrain-japan-top-v2`), cut out and tiled by `tools/.cache/make_tile.py`; tile_edge_check OK (edge 3.3, texture 48.0, wobble 0) and the 1024x800 in-game capture reads as painted moss/soil over the pink scene.

--- prompt ---

Match the approved Little Play storybook direction: soft watercolor/gouache washes, subtle paper or colored-pencil grain, gentle pigment variation, warm muted colours, organic hand-painted edges, and restrained soft shading. This is a flat side-view game asset, but it must not look like flat vector or emoji art. Preserve a clean, strong silhouette and immediate gameplay readability at small size.

Create one side-on 2D terrain segment with a narrow walkable top band (about 30% of the image height) and a longer vertical material side below it. The left and right edges must tile seamlessly. Keep the top walkable edge crisp and readable when scaled down. Leave cutout-friendly margins at the top and bottom; do not let the subject touch any canvas corner. The ground must span almost the full canvas width (at least 90% of it), with a nearly flat top edge across the middle 60% of that width - no rounded mound, no peak in the centre. The game repeats the middle 60% left to right, so the left and right edge columns must carry the same colours.

A flat 2D platformer ground tile seen from the side: a single rectangular platform segment. The top walkable surface is a narrow band at the top (about 30% height), below it a long straight side edge (about 70% height) going down to a flat bottom edge. Painted texture is essential: visible brush grain, small stones, soil clumps and pigment variation, because the tile is only about 140 screen pixels tall in the game. No 3D shading, no perspective, no spatial depth, no photorealistic texture; no ceramic/bathroom tile look, no grid, no grout lines, no bear, no characters, no objects, no sky line. Tileable horizontally (left edge matches right edge). Flat side-on 2D silhouette with a hand-painted storybook finish. World theme: dark chocolate-brown soil side edge with a moss-green top band and a few pale pink cherry petals; it must read clearly darker than a pale pink blossom sky.

No photorealism, 3D, perspective, heavy black outlines, white sticker borders, dark halos, glow, hard drop shadows, text, characters, unrelated props, or background scenery.
