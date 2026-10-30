# animal-bird — generation brief

- **Replaces:** the 🐦 glyph in the egg-to-bird life-cycle sequence (`game/games/sequencing.js:28`, label `Птица`)
- **Inventory row:** `animal-bird` — status `GENERATED / CANDIDATE`; the runtime check for this task confirmed the glyph is live in the egg → chick → bird sequence, and a repository-wide search found **no** reusable bird illustration in `game/` or `resources/`, so the row is eligible for generation
- **Distinct from:** `animal-chick` (`🐣`, the middle stage, `bundle/chick.png`) and `animal-chicken` (`🐔`, counting/candy set) — the bird is the **grown** stage and must not read as either of them
- **Iteration 2 (2026-10-22)** — iteration 1 (references `bear` + `star` + `chicken` + `chick`) was rejected by the user as **too chick-like**. Two causes, both fixed here:
  1. **References carried the shape.** Two round yellow birds cannot help but pull the model towards a round yellow bird. Iteration 2 sends `Reference/bear.png` (canonical anchor) + `Reference/star.png` (canonical secondary) + `horse.png` — one painted family member for the finish and the paper tone, and a **non-bird** silhouette, so nothing in the reference set can be mistaken for a bird to copy.
  2. **The brief described a chick.** "Compact rounded body", "tiny dark eyes" and "small" are all baby-anatomy words. Iteration 2 spells out **adult proportions**: a body longer than it is tall, a head in proportion to the body, a slim pointed beak, thin legs, a folded wing with a visible shoulder line, and a short tail that projects past the body.
- **References sent to the model:** `Reference/bear.png` (canonical style anchor), `Reference/star.png` (canonical secondary reference), `horse.png` (painted family — finish and paper tone only, never its shape). The reference pool in `tools/asset_refpool.js` ranks the whole bundle; override the pick with `--ref-files`
- **Canvas:** 1024x1024 from the API, production target 512x512 PNG (STYLE_BIBLE.md)
- **Background:** warm off-white is acceptable for the work-in-progress bundle; transparency is a runtime requirement, not an illustration task

--- prompt ---

Create one standalone illustration of one small adult songbird for a cozy early-childhood storybook game. Match the supplied Little Play bear and golden star references: soft watercolor wash with very subtle paper/colored-pencil grain; warm natural, gently muted colors; rounded, slightly organic shapes; soft painted shading; restrained contrast; quiet handmade charm; minimal, clean details; readable silhouette at small mobile size.

Draw a fully grown bird, not a baby bird: the body is an elongated oval, clearly longer than it is tall, and it stands upright on two thin legs. The head is small and in proportion to the body, never oversized. Give it a short slim pointed beak, one folded wing with a clear shoulder line and a single simple wing shape, a short straight tail that projects past the back of the body, a tiny understated dark eye, and thin legs with small feet. No fluffy down, no round ball body, no oversized head, no oversized eyes, no hunched baby posture.

Use a muted natural palette that is clearly not a chick: soft slate blue-grey and warm grey on the head, back and wing, a pale warm buff on the breast and belly, a small warm brown patch on the wing, a thin dark grey beak, and thin warm brown legs. Nothing saturated.

The bird is the third and final stage of an egg-to-bird sequence, so it must read as the grown bird that a chick becomes, while still being a simple generic small bird and not a specific species. One subject only, fully visible, centered with comfortable breathing room. Plain warm off-white background is acceptable. No added props, ground line, branch, nest, or scene unless requested. The result must look like it belongs beside the exact reference images.

No photorealism, 3D rendering, glossy plastic, vector emoji, stock-icon look, or anime styling. Not a chick, not a chicken, not a rooster, not a parrot, not a duck, not an owl, not a penguin, not a generic round baby bird: a plain small adult songbird. No crest, no long tail feathers, no decorative plumage, no bright tropical colours, no yellow body. No thick black outline, white sticker border, glow, hard drop shadow, or dramatic lighting. No excessive gradient, tiny detail, heavy texture, decorative sparkles, or ornamental extras. No unrequested accessories. No text, labels, watermark, logo, collage, contact sheet, or multiple alternatives in one image. Do not reproduce the reference bear, the golden star or the horse; create the requested bird in the same visual family.

