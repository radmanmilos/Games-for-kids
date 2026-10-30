# object-medal — generation brief

Replaces: `🏅` in reward and celebration contexts if a separate reward illustration is retained.

Inventory row: `object-medal` — consider reusing the approved star for generic rewards.

Status: prepared brief only; not approved for generation.

References: `bear.png`, `star.png`, `bone.png` for painted finish only; do not turn the star into a medal emblem.

Canvas: square 1024×1024 WIP image, one centered object with generous padding.

Background: warm cream storybook paper; no transparency required for WIP.

## Iteration 2 — finish pass (proposed 2026-10-29, from the review of all 131 bundle files)

- **Current state:** `medal.png` was **user-approved on 2026-10-29** from a single generation with the brief unchanged. This brief does **not** reopen that decision; it proposes a finish-only re-render. Keep the approved file until a candidate is reviewed side by side and explicitly approved.
- **Why:** at 100% the medal is the most digital-looking file in the bundle: smooth gradient gold with a bevelled rim, a crisp vector-like outline around the bear emblem, no paper grain (the bear reference has a visible paper surface), and a halftone/noise hatching on the ribbon with a ragged top edge. STYLE_BIBLE §4 bans metallic shine and flat emoji/vector fills, §5 bans an outline around the whole object. The ribbon's top edge sits only 1.8% from the canvas edge (STYLE_BIBLE §10: breathing room on all sides).
- **About the bear emblem:** the original brief asked for a plain central surface with no symbol; the generated medal instead carries a small bear — a leak from the bear reference (the same bear also shows up on `notebook.png`, `card-stack.png` and `playing-cards.png`). It was approved with the emblem, so this finish pass **keeps it**. If you would rather have the plain face of the original brief, delete the sentence about the emblem and remove "and one small seated honey-brown bear emblem" from the prompt.
- **Reference note:** `medal.png` is eligible as an automatic style reference (rank 31 of 131 in `node tools/asset_refpool.js`, the best-ranked of the off-style files; a default `--refs 2` run sends only `bear.png` and `star.png`, so the risk is low unless a run asks for 30 or more references). The commands below pin `--ref-files` anyway.
- **Subject reference (`--subject-ref`):** the approved `medal.png` (layout, colours, emblem).
- **Style references (`--ref-files`):** `bear.png`, `star.png`, `bone.png` (matte simple-object exemplar).
- **Candidate output:** `tools/.cache/regen/medal.png` (staging, git-ignored).

```powershell
# 1) dry run (no API call, no neurons): inspect the composed prompt and the references
node tools/asset_generate.js --prompt resources/General_reviews/Asset_Generation/prompts/medal.md --out tools/.cache/regen/medal.png ` `
  --subject-ref resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/medal.png `
  --ref-files bear.png,star.png,bone.png --dry-run

# 2) generate ONE candidate (about 125 neurons) into the git-ignored staging folder, never over the approved file
node tools/asset_generate.js --prompt resources/General_reviews/Asset_Generation/prompts/medal.md --out tools/.cache/regen/medal.png ` `
  --subject-ref resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/medal.png `
  --ref-files bear.png,star.png,bone.png --creds "tools/vendor/Cloudflare-credentials,json"
```

### Superseded prompt (iteration 1) (kept for the record, not sent to the model)

> Create one clearly recognizable simple award medal as a standalone children's storybook illustration. Show one round warm-golden medal with a short muted blue and red ribbon above it, simple gentle edge shading and one plain central surface with no symbol or text. Center the complete medal and ribbon with comfortable padding. It must read as a medal, not a coin or badge.
>
> No winner, person, hand, podium, number, letter, star emblem, text, logo, face, glossy 3D rendering, photorealism, emoji/vector styling, heavy outline, glow or extra medals.

--- prompt ---

Create one standalone illustration of a golden award medal on a ribbon for a cozy early-childhood storybook game. Match the supplied Little Play bear and golden star references: soft watercolor wash with very subtle paper/colored-pencil grain; warm natural, gently muted colors; rounded, slightly organic shapes; soft painted shading; restrained contrast; quiet handmade charm; minimal, clean details; readable silhouette at small mobile size.

This is a finish pass, not a redesign: keep the design of the subject reference — one round golden medal hanging from a short two-tone ribbon folded into a V above it, with one small seated honey-brown bear emblem in the centre of the medal's face — but paint all of it as hand-painted watercolor on paper, not as a smooth digital gradient. The gold is soft layered washes of ochre, honey and cream with gentle pigment variation and a few broad lighter patches; the raised rim is a slightly deeper ochre band, painted rather than bevelled. Matte throughout: no metallic gradient, no bevel, no engraving, no mirror highlight, no shine.

The ribbon is flat painted stripes of dusty blue and soft brick red with fine paper grain, its top edge clean and straight: no halftone dots, no hatching, no noise, no frayed or grungy edge. The bear emblem is painted the way the bear reference is painted — a honey-brown wash with visible paper grain, a cream muzzle, small dark eyes and nose, a soft blush — and is defined by its paint, with no drawn outline and no flat vector fill.

One medal only, fully visible, centered, with comfortable breathing room on all four sides: the top of the ribbon must stay clearly inside the canvas with clear space above it. Plain warm off-white background with nothing on it: no ground line, no ground shadow or cast shadow, no frame, border, panel, divider line or stray mark. All shading stays inside the subject. The result must look like it belongs beside the exact reference images.

No photorealism, 3D rendering, glossy plastic, vector emoji, stock-icon look, or anime styling. No thick black outline, white sticker border, glow, hard drop shadow, or dramatic lighting. No excessive gradient, tiny detail, heavy texture, decorative sparkles, or ornamental extras. No unrequested accessories. No text, labels, watermark, logo, collage, contact sheet, or multiple alternatives in one image. No person, hand, podium, number, letter, extra medals, extra emblems, star emblem or laurel wreath. Do not reproduce the reference bear itself as a large figure or the golden star; the medal carries only the small seated bear emblem of the subject reference.
