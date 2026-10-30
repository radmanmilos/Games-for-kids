# object-notebook — generation brief

Replaces: `📝` in the learning hub tile.

Inventory row: `object-notebook` — UI icon or small illustration depending on tile style.

Status: prepared brief only; not approved for generation.

References: `bear.png`, `star.png`, `bone.png` for painted finish only.

Canvas: square 1024×1024 WIP image, one centered object with generous padding.

Background: warm cream storybook paper; no transparency required for WIP.

## Iteration 2 — finish pass (proposed 2026-10-29, from the review of all 131 bundle files)

- **Current state:** `notebook.png` was **user-approved on 2026-10-29** from a single generation with the brief unchanged. This brief does **not** reopen that decision; it proposes a finish-only re-render. Keep the approved file until a candidate is reviewed side by side and explicitly approved.
- **Why:** at full size the object itself reads as a photographed product — realistic paper edges on the page block, a fabric-like cover and a studio-style soft shadow — with a painted bear on top; it is a hybrid of two finishes. Measured on the subject only: contour sharpness **7.5** against a bundle median of 20.1 (the fourth softest of 131 files). STYLE_BIBLE §4 rules out photorealistic surface simulation, §11 asks for one softness and detail density across the family. The left ear of the cover bear also came out as a pointed wedge instead of a round ear.
- **About the bear on the cover:** the original brief asked for a plain cover; the bear is a leak from the bear reference (also on `medal.png`, `card-stack.png`, `playing-cards.png`). It was approved with the bear, so this finish pass **keeps it**. For the plain cover of the original brief, remove the bear sentences from the prompt.
- **Subject reference (`--subject-ref`):** the approved `notebook.png` (angle, teal and cream colours, bear on the cover).
- **Style references (`--ref-files`):** `bear.png`, `star.png`, `sailboat.png` (approved painted object with a cool body and warm accent, flat simple finish — finish and detail level only).
- **Candidate output:** `tools/.cache/regen/notebook.png` (staging, git-ignored).

```powershell
# 1) dry run (no API call, no neurons): inspect the composed prompt and the references
node tools/asset_generate.js --prompt resources/General_reviews/Asset_Generation/prompts/notebook.md --out tools/.cache/regen/notebook.png ` `
  --subject-ref resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/notebook.png `
  --ref-files bear.png,star.png,sailboat.png --dry-run

# 2) generate ONE candidate (about 125 neurons) into the git-ignored staging folder, never over the approved file
node tools/asset_generate.js --prompt resources/General_reviews/Asset_Generation/prompts/notebook.md --out tools/.cache/regen/notebook.png ` `
  --subject-ref resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/notebook.png `
  --ref-files bear.png,star.png,sailboat.png --creds "tools/vendor/Cloudflare-credentials,json"
```

### Superseded prompt (iteration 1) (kept for the record, not sent to the model)

> Create one clearly recognizable simple child's notebook as a standalone storybook illustration. Show one closed rounded-corner notebook in muted teal and warm cream, with a few visible page layers and a simple plain cover. Keep it slightly angled but fully visible, with soft watercolor grain and gentle shading. It must read as a notebook, not a book, tablet or envelope.
>
> No writing, letters, numbers, pencil, hand, desk, text, logo, face, glossy 3D rendering, photorealism, emoji/vector styling, heavy outline, glow or extra notebooks.

--- prompt ---

Create one standalone illustration of a child's notebook for a cozy early-childhood storybook game. Match the supplied Little Play bear and golden star references: soft watercolor wash with very subtle paper/colored-pencil grain; warm natural, gently muted colors; rounded, slightly organic shapes; soft painted shading; restrained contrast; quiet handmade charm; minimal, clean details; readable silhouette at small mobile size.

This is a finish pass, not a redesign: keep the design of the subject reference — one closed rounded-corner notebook, slightly angled and fully visible, with a muted teal-green cover and one small seated honey-brown bear painted on the cover — but paint it as a hand-painted storybook illustration, not as a photograph of an object. The cover is a soft, gently mottled teal-green watercolor wash with visible paper grain. The page block is three or four soft cream bands along the side edges, separated by faint warm-grey lines, with no photographic paper detail. The spine is a slightly deeper teal band, and the corners are rounded.

The bear on the cover is painted the way the bear reference is painted: a honey-brown wash with visible paper grain, a cream muzzle, small dark eyes and nose, a soft blush, and two round ears of the same shape. It is defined by its paint, with no drawn outline. The notebook must read as a notebook, not as a tablet, a box or an envelope.

One notebook only, fully visible, centered with comfortable breathing room. Plain warm off-white background with nothing on it: no ground line, no ground shadow or cast shadow, no frame, border, panel, divider line or stray mark. All shading stays inside the subject. The result must look like it belongs beside the exact reference images.

No photorealism, 3D rendering, glossy plastic, vector emoji, stock-icon look, or anime styling. No thick black outline, white sticker border, glow, hard drop shadow, or dramatic lighting. No excessive gradient, tiny detail, heavy texture, decorative sparkles, or ornamental extras. No unrequested accessories. No text, labels, watermark, logo, collage, contact sheet, or multiple alternatives in one image. No photographic paper edges, no page curl, no fabric or leather texture, no stitching, no studio lighting, no sheen. No writing, letters, numbers, pencil, hand, desk, bookmark, elastic band, ribbon or extra notebooks. Do not reproduce the reference bear as a large figure or the golden star; the cover carries only the small seated bear of the subject reference.

