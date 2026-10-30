# object-skis — generation brief

Replaces: `🎿` in winter racing scenery and collectibles.

Inventory row: `object-skis` — small SVG or illustration if prominent.

Status: prepared brief only; not approved for generation.

References: `bear.png`, `star.png`, `bone.png` for painted finish only.

Canvas: square 1024×1024 WIP image, one centered pair with generous padding.

Background: warm cream storybook paper; no transparency required for WIP.

Iteration note (2026-10-29): iteration 1 was not accepted (painted blocks, laid flat). Iteration 2 got the wooden look and the skiing stance right, but the two skis did not match — the user approved the **left** ski only, and asked that **the right ski look the same as the left one**.

## Iteration 4 — finish pass (proposed 2026-10-29, from the review of all 131 bundle files)

- **Current state:** `skis.png` was **user-approved on 2026-10-29** after three iterations about *shape* (plain wooden skis, then a matching pair). This brief does **not** reopen that decision. It proposes a finish-only re-render for family consistency; keep the approved file until a candidate is reviewed side by side and explicitly approved.
- **Why:** at 100% the file is the only photographic object in the bundle — real wood grain, a woven fabric strap and a studio-style soft shadow — beside the hand-painted wood of the approved `sled.png`. STYLE_BIBLE §4 rules out photorealistic wood grain and 3D-rendered finish, §11 asks for the same softness, texture and detail density across the family.
- **Reference note:** `skis.png` is eligible as an automatic style reference (rank 46 of 131 in `node tools/asset_refpool.js`; a default `--refs 2` run sends only `bear.png` and `star.png`, so the risk is low). The commands below pin `--ref-files` anyway.
- **Subject reference (`--subject-ref`):** the approved `skis.png` pins the geometry (two identical skis, side by side, the same strap) so the three iterations of shape work are not lost.
- **Style references (`--ref-files`):** `bear.png`, `star.png`, `sled.png` (the approved painted wood object — finish and detail level only; do not copy its shape or its red).
- **Candidate output:** `tools/.cache/regen/skis.png` (staging, git-ignored).

```powershell
# 1) dry run (no API call, no neurons): inspect the composed prompt and the references
node tools/asset_generate.js --prompt resources/General_reviews/Asset_Generation/prompts/skis.md --out tools/.cache/regen/skis.png ` `
  --subject-ref resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/skis.png `
  --ref-files bear.png,star.png,sled.png --dry-run

# 2) generate ONE candidate (about 125 neurons) into the git-ignored staging folder, never over the approved file
node tools/asset_generate.js --prompt resources/General_reviews/Asset_Generation/prompts/skis.md --out tools/.cache/regen/skis.png ` `
  --subject-ref resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/skis.png `
  --ref-files bear.png,star.png,sled.png --creds "tools/vendor/Cloudflare-credentials,json"
```

### Superseded prompt (iteration 3) (kept for the record, not sent to the model)

> Create one clearly recognizable pair of children's wooden skis as a standalone storybook illustration, shown in a skiing stance.
>
> - **Two identical skis:** both are the same length, the same width, the same rounded upturned tip, the same flat tail, the same plain warm light-brown wood with the same soft grain, and each carries one identical small muted brown binding strap across the middle. They are a matching pair from one workshop — a mirror of each other, never two different boards.
> - **Skiing position:** the pair stands in a three-quarter view as if a small child were standing on them — the two skis side by side and close, both pointing the same way, tips turned up, the pure difference being their mirrored angle in perspective (one slightly nearer the viewer, one slightly ahead). Not lying flat, not crossed, not perfectly straight rails.
> - No decoration differences at all: no colour block on one ski, no stripe on one ski, no different tip shapes, no different lengths.
>
> Keep the painted finish soft and matte in the Little Play family style, with gentle watercolor grain and no heavy outline.
>
> Center the complete pair with comfortable padding and no cropping. The skis are the only subject. They must read as a matching pair of wooden children's skis ready to ski on, not swords, boards, hockey sticks or snowboards.
>
> No mismatched skis, no skier, feet, boots, snow, mountain, whole or partial poles, painted colour blocks, decals, text, logo, face, scene, glossy 3D rendering, photorealism, emoji/vector styling, heavy outline, glow or extra skis.

--- prompt ---

Create one standalone illustration of a pair of children's wooden skis for a cozy early-childhood storybook game. Match the supplied Little Play bear and golden star references: soft watercolor wash with very subtle paper/colored-pencil grain; warm natural, gently muted colors; rounded, slightly organic shapes; soft painted shading; restrained contrast; quiet handmade charm; minimal, clean details; readable silhouette at small mobile size.

This is a finish pass, not a redesign: keep the pair exactly as arranged in the subject reference — two identical long narrow wooden skis lying side by side, parallel and close together, the same length, the same width, the same softly rounded front tip curving gently upward, the same flat tail, each with one identical small muted-brown binding strap across the middle — but paint it as hand-painted watercolor on paper, not as a photograph. The wood is soft layered washes of warm light honey-brown and pale tan, with a few soft darker brush streaks that only suggest grain; the straps are simple painted brown bands. Soft, matte, rounded painted edges, fine visible paper grain and gentle pigment variation inside the colour areas, as in the bear reference and in the painted wooden sled reference.

They must read as a matching pair of children's skis, not swords, planks, hockey sticks, snowboards or skateboards. Both skis are exactly the same: no colour block, stripe, decal or different tip on one ski only.

One pair only, fully visible, centered with comfortable breathing room. Plain warm off-white background with nothing on it: no ground line, no ground shadow or cast shadow, no frame, border, panel, divider line or stray mark. All shading stays inside the subject. The result must look like it belongs beside the exact reference images.

No photorealism, 3D rendering, glossy plastic, vector emoji, stock-icon look, or anime styling. No thick black outline, white sticker border, glow, hard drop shadow, or dramatic lighting. No excessive gradient, tiny detail, heavy texture, decorative sparkles, or ornamental extras. No unrequested accessories. No text, labels, watermark, logo, collage, contact sheet, or multiple alternatives in one image. No real wood-grain texture, no photographic detail, no fabric weave, no stitching, no studio lighting, no specular shine, no soft photographic shadow. No skier, boots, feet, poles, snow, mountain, hands or extra skis. Do not reproduce the reference bear, the golden star or the sled; create the requested skis in the same visual family.
