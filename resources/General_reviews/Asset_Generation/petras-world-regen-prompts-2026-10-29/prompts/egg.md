# object-egg — generation brief

- **Replaces:** the 🥚 glyph in the two life-cycle sequences of `game/games/sequencing.js` — line 26 (`Јаје`, egg → chick 🐣 → bird 🐦) and line 46 (`Јаје`, egg → caterpillar 🐛 → butterfly 🦋)
- **Inventory row:** `object-egg` — status `REVIEW`; a repository-wide search found **no** egg illustration in `game/` or `resources/`, so the row is eligible for generation
- **Why this one:** the egg is the only glyph that sits in **two** sequences, and every sibling step is already painted and approved (`chick.png`, `bird.png`, `caterpillar.png`). One egg picture completes both chains, so both sequences end up with one consistent, hand-painted set instead of a mix of emoji and illustrations.
- **Category:** **simple object** (not an animal) — so the reference set must carry an *object* exemplar, and the closest approved one is `bone.png` (the only approved simple object in the bundle). `chick.png` and `chicken.png` are deliberately **not** sent: their round, warm-yellow shapes would pull the model towards a yellow chick-shaped blob.
- **Distinct from:** `animal-chick` (`🐣`, a round yellow bird) and `object-bone` (`bone.png`, the ivory object exemplar) — the egg is a smooth oval shell with speckles, and it must not read as a bird, a blob or a bone
- **Iteration 2 (2026-10-22)** — iteration 1 (same references) came out **too pale to read at card size**: the 64 px legibility proxy measured **21.0**, i.e. the smallest value in the whole bundle and less than half the lowest approved exemplar (`bone.png` = 36.8, family median ~89); only 3.1 % of the frame was darker than luminance 200. The shape and the framing were right (silhouette bbox 65 % x 80 % of the canvas), so only the tone changed: the shell is now a **cream-beige a clear step deeper than the paper**, the speckles are **medium warm brown** instead of faint light brown, and the shaded side runs deeper into **warm tan**. Same references, same composition.
- **References sent to the model:** `Reference/bear.png` (canonical style anchor), `Reference/star.png` (canonical secondary reference), `bone.png` (painted family — the object treatment: faceless simple form, warm ivory palette, soft edge shading, restrained grain; never its shape). The reference pool in `tools/asset_refpool.js` ranks the whole bundle; override the pick with `--ref-files`
- **Canvas:** 1024x1024 from the API, production target 512x512 PNG (STYLE_BIBLE.md)
- **Background:** warm off-white is acceptable for the work-in-progress bundle; transparency is a runtime requirement, not an illustration task

## Iteration 3 (proposed 2026-10-29, from the review of all 131 bundle files)

- **Status:** `egg.png` is still `GENERATED / CANDIDATE` (never approved). Iteration 2 fixed the legibility problem (small-size contrast 38.8) but **failed its own brief in a new way**: the shell came out as two zones — a speckled, darker beige upper cap and a near-white lower half — joined by a wavy, drip-like line. It reads as a dipped, half-peeled or stained egg, and the lower third is *lighter* instead of the deeper tan the brief asked for. In the two life-cycle sequences it has to stand next to `chick.png`, `bird.png` and `caterpillar.png` and read as one plain egg at card size.
- **Cause (from the iteration 2 wording):** the sentence asked for speckles "across the upper half and the sides" and for shading "across the lower third", which the model turned into two separate zones. Iteration 3 states the opposite: one continuous shell, one smooth gradient, speckles over the whole shell, the lower part the deepest tone, and names the failure explicitly (two-tone, cap, drip edge, white patch).
- **No subject reference:** the shape and the framing of iteration 2 were right, but a subject reference would also copy its two-tone colouring, so none is used. Same three style references as iteration 2.
- **Candidate output:** `tools/.cache/regen/egg.png` (staging, git-ignored). It becomes `egg.png` in the bundle only after side-by-side review.

```powershell
# 1) dry run (no API call, no neurons): inspect the composed prompt and the references
node tools/asset_generate.js --prompt resources/General_reviews/Asset_Generation/prompts/egg.md --out tools/.cache/regen/egg.png ` `
  --ref-files bear.png,star.png,bone.png --dry-run

# 2) generate ONE candidate (about 125 neurons) into the git-ignored staging folder, never over the approved file
node tools/asset_generate.js --prompt resources/General_reviews/Asset_Generation/prompts/egg.md --out tools/.cache/regen/egg.png ` `
  --ref-files bear.png,star.png,bone.png --creds "tools/vendor/Cloudflare-credentials,json"
```

### Superseded prompt (iteration 2) (kept for the record, not sent to the model)

> Create one standalone illustration of a single simple egg for a cozy early-childhood storybook game. Match the supplied Little Play bear, golden star and bone references: soft watercolor wash with very subtle paper/colored-pencil grain; warm natural, gently muted colors; rounded, slightly organic shapes; soft painted shading; restrained contrast; quiet handmade charm; minimal, clean details; readable silhouette at small mobile size.
>
> Draw one egg shell standing upright on its narrower end, a smooth oval that is slightly taller than it is wide, with a gently rounded top and a soft shadowed underside so it sits on the ground. The shell is a warm cream-beige that is clearly a step deeper in tone than the background paper — not white, not pale yellow, not flat. Scatter a dozen soft, irregular medium warm-brown speckles across the upper half and the sides, and paint a deeper warm tan shading down one side and across the lower third, so the egg has one clearly visible shaded side and one clearly visible lit side. The picture must not look almost blank: the egg carries a clearly visible amount of tone, so it still reads when the whole picture is shrunk to a small card.
>
> Nothing on the shell but those speckles: no crack, no opening, no chick peeking out, no pattern, no ribbon, no basket, no nest, no straw, no leaves, no ground line, no other egg, no shell fragment.
>
> Keep it a simple, calm object picture with no face, no eyes and no expression. The egg must read instantly as an egg at small size and must not look like a bird, a round chick, a ball, an apple or a bone.
>
> One subject only, fully visible, centered with comfortable breathing room. Plain warm off-white background is acceptable. No added props or scene. The result must look like it belongs beside the exact reference images.
>
> No photorealism, 3D rendering, glossy plastic, vector emoji, stock-icon look, or anime styling. Not a yellow egg, not a chick, not a cracked or hatching egg, not a decorated Easter egg, not a nest, not a carton, not a bowl, not a piece of bone. No thick black outline, white sticker border, glow, hard drop shadow, or dramatic lighting. No excessive gradient, tiny detail, heavy texture, decorative sparkles, or ornamental extras. No unrequested accessories. No text, labels, watermark, logo, collage, contact sheet, or multiple alternatives in one image. Do not reproduce the reference bear, the golden star or the bone; create the requested egg in the same visual family.

--- prompt ---

Create one standalone illustration of a single simple egg for a cozy early-childhood storybook game. Match the supplied Little Play bear, golden star and bone references: soft watercolor wash with very subtle paper/colored-pencil grain; warm natural, gently muted colors; rounded, slightly organic shapes; soft painted shading; restrained contrast; quiet handmade charm; minimal, clean details; readable silhouette at small mobile size.

Draw one egg shell standing upright on its narrower end, a smooth oval slightly taller than it is wide, with a gently rounded top. The whole shell is ONE continuous warm cream-beige that is clearly a step deeper in tone than the background paper — not white, not pale yellow, not flat. Soft painted shading deepens smoothly and gradually towards one side and towards the bottom, so the egg has one clearly visible lit side (a little lighter, warm cream) and one clearly visible shaded side and underside (deeper warm tan). The lower part of the egg is its deepest tone and is never lighter than the top. There is no dividing line, no band, no cap, no second colour zone and no white patch: one egg, one colour family, one smooth gradient.

Scatter a dozen soft, irregular, medium warm-brown speckles evenly over the whole shell — on the lit side, on the shaded side and on the lower half as well as the top — with none clumped into a cap and none forming a pattern. The picture must not look almost blank: the egg carries a clearly visible amount of tone, so it still reads when the whole picture is shrunk to a small card.

Nothing on the shell but those speckles: no crack, no opening, no chick, no drip or wavy edge, no two-tone dipped look, no peeling, no pattern, no ribbon, no basket, no nest, no straw, no leaves, no other egg, no shell fragment.

Keep it a simple, calm object picture with no face, no eyes and no expression. The egg must read instantly as an egg at small size and must not look like a bird, a round chick, a ball, an apple or a bone.

One subject only, fully visible, centered with comfortable breathing room. Plain warm off-white background with nothing on it: no ground line, no ground shadow or cast shadow, no frame, border, panel, divider line or stray mark. All shading stays inside the subject. The result must look like it belongs beside the exact reference images.

No photorealism, 3D rendering, glossy plastic, vector emoji, stock-icon look, or anime styling. No thick black outline, white sticker border, glow, hard drop shadow, or dramatic lighting. No excessive gradient, tiny detail, heavy texture, decorative sparkles, or ornamental extras. No unrequested accessories. No text, labels, watermark, logo, collage, contact sheet, or multiple alternatives in one image. Not a yellow egg, not a chick, not a cracked or hatching egg, not a painted or decorated Easter egg, not a dipped or half-peeled egg, not a nest, not a carton, not a bowl, not a piece of bone. Do not reproduce the reference bear, the golden star or the bone; create the requested egg in the same visual family.
