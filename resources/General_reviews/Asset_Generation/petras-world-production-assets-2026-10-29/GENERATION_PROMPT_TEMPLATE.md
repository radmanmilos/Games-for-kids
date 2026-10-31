# The reusable generation prompt — assets that arrive ready to cut out

Use for every new or regenerated asset. Fill the `{…}` slots, keep everything else word for word, and paste the result under `--- prompt ---` in `prompts/<subject>.md` (header format as in the existing briefs). The wording is the one used in the ten briefs of `regen-prompts-package-2026-10-29`, each dry-run through `tools/asset_generate.js`, plus one rule added after the cut-out test of all 131 files: **no ground shadow or cast shadow**, because painted shadows are part of the picture and survive background removal.

## Master prompt (new asset)

```
Create one standalone illustration of {a single SUBJECT} for a cozy early-childhood storybook game. Match the supplied Little Play bear and golden star references: soft watercolor wash with very subtle paper/colored-pencil grain; warm natural, gently muted colors; rounded, slightly organic shapes; soft painted shading; restrained contrast; quiet handmade charm; minimal, clean details; readable silhouette at small mobile size.

{SUBJECT DESCRIPTION — the shape and view, two to four identifying features, and the exact colours; for cool or pale subjects name the colour and the greys to avoid. Use the category block below.}

One subject only, completely visible, centered, filling about 80 to 85 percent of the canvas along its longest side, with an even margin of plain paper on all four sides. Plain warm off-white background with nothing on it: no ground line, no ground shadow or cast shadow, no reflection, no frame, border, panel, divider line or stray mark. All shading stays inside the subject. The subject's outer edge is defined by its own painted color and its silhouette is closed and clearly different from the paper tone. The result must look like it belongs beside the exact reference images.

No photorealism, 3D rendering, glossy plastic, vector emoji, stock-icon look, or anime styling. No thick black outline, white sticker border, glow, hard drop shadow, or dramatic lighting. No excessive gradient, tiny detail, heavy texture, decorative sparkles, or ornamental extras. No unrequested accessories. No text, labels, watermark, logo, collage, contact sheet, or multiple alternatives in one image. Do not reproduce the reference bear or the golden star; create the requested {SUBJECT} in the same visual family.
```

## Finish pass (re-render an approved file, keep its design)

Add this paragraph after the subject description, and send the approved file with `--subject-ref`:

```
This is a finish pass, not a redesign: keep the subject reference's pose, proportions, markings and colours, but paint it as hand-painted watercolor on paper — crisp, softly defined painted contours, fine paper grain and gentle pigment variation visible inside every colour area, exactly like the bear reference. Not blurry, not smudged, not felt, fuzz or pencil-scribble texture, and no smooth airbrushed gradients.
```

## Category blocks (replace `{SUBJECT DESCRIPTION}`)

| Category | Block |
|---|---|
| **Animal, standing** | `…in three-quarter or side view facing right: {body, 2–3 markings, ears/horns/tail}, small dark calm eyes, a calm friendly expression, four sturdy legs ending in {hooves/paws}. Same simple, rounded level of detail as the {matching painted family member}: broad soft masses, no individual hairs.` |
| **Animal, sitting** | `…sitting upright and facing the viewer: {head and ear shapes, markings}, small dark calm eyes and nose, a soft smile line. Simple painted fur suggestion only.` |
| **Food / fruit** | `…one whole item in slight three-quarter view: {shape}, {exact colour}, one soft broad lighter patch, soft and matte with no glossy streak. Nothing else on the picture: no plate, bowl, bite or second item.` |
| **Object / tool** | `…in slight three-quarter view: {shape, 2–3 parts}, painted in {colours}, matte, soft rounded edges, no metallic shine, no photographic texture.` |
| **Vehicle** | `…in three-quarter side view, no driver, no road: {body, wheels, one accent colour}, simple rounded forms.` |
| **Plant / nature** | `…{one specimen}: {shape, leaf count}, {colours}, soft wash edges. No ground, soil patch or grass tuft unless the subject is the ground.` |
| **Child character** | `…standing, facing the viewer: {hair, clothes in two muted colours}, round friendly face with small dark eyes, soft blush, simple hands and feet, no accessories.` |
| **Pale or white subject** (snow, egg, ball, cloud, milk) | add: `Because the subject is pale, give it a soft, slightly deeper edge in its own tone — never a black line — so the silhouette stays closed against the paper.` **Not tested; try it on the snowman or the ball first.** |
| **Glow / light** (sun, moon, star, lantern) | **Do not generate a halo as part of the cut-out.** Draw the solid body only; add the glow in CSS (`radial-gradient`) at runtime. |

## Settings

`node tools/asset_generate.js --prompt <brief> --out tools/.cache/regen/<name>.png [--subject-ref <approved file>] --ref-files bear.png,star.png,<one painted family member> --creds "tools/vendor/Cloudflare-credentials,json"`

- 1024 × 1024, model `flux-2-klein-4b`, default steps. At most **4 input images** in total (the proven maximum).
- **Always pin `--ref-files`.** Bear and star first; the third is a painted family member of the same kind (a cool one for cool subjects, a non-bird for a bird, etc.).
- At most **two candidates** per asset, about 126 neurons each; keep the current file unless a candidate is clearly better.
- Candidates go to the git-ignored `tools/.cache/regen/`, never over an approved file.

## Why each line is there

| Line | Reason (from the review) |
|---|---|
| no ground / cast shadow | Painted shadows remained as pale smudges on rock, school, car, meteor, cactus, house, egg and ball after cut-out; a stricter automatic removal damaged the zebra. |
| 80–85% fill, even margin | The pipeline frames every subject at 88% of a 512 px canvas; an even margin means no file needs hand-cropping and nothing is clipped. |
| closed silhouette, deeper edge for pale subjects | White-on-white subjects (ball, eye, snowflake) were the only ones the automatic cut-out failed on. |
| no halo in the image | Soft glows (sun, galaxy, sunrise) cut out as a ragged ring; a CSS gradient is lighter and crisper. |
| finish-pass paragraph | The raster-emoji files were enlarged 100–300 px crops; pinning the old file keeps the design while the rendering is replaced. |
