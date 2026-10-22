# animal-rooster — generation brief

- **Replaces:** the 🐓 glyph — the farm-puzzle scene (`game/games/animal_puzzle.js:8`, title `Другари на фарми`) and the racing decor (`game/games/racing-config.js:180`)
- **Inventory row:** `animal-rooster` — status `REVIEW`; the runtime check for this task confirmed the glyph is live in those two places and a repository-wide search found **no** rooster picture in `game/` or `resources/`, so the row is eligible for generation
- **Distinct from:** `animal-chicken` (`🐔`, counting/candy set, `bundle/chicken.png`) — that row says to keep the rooster "distinct from rooster-specific farm puzzle/scenery use unless visual semantics are confirmed", and the user chose the rooster as its own candidate on 2026-10-22. The rooster must not read as the cream hen: the comb, wattle, golden hackles and the long arching tail are the distinguishing features
- **References sent to the model:** `Reference/bear.png` (canonical style anchor), `Reference/star.png` (canonical secondary reference), `chicken.png` (the closest category example — the family's painted bird; it supplies the brushwork and the eye/feather treatment, **not** the hen's shape or cream colouring). Override the pick with `--ref-files`
- **Canvas:** 1024x1024 from the API, production target 512x512 PNG (STYLE_BIBLE.md)
- **Background:** warm off-white is acceptable for the work-in-progress bundle; transparency is a runtime requirement, not an illustration task

--- prompt ---

Create one standalone illustration of a proud adult rooster for a cozy early-childhood storybook game. Match the supplied Little Play bear and golden star references: soft watercolor wash with very subtle paper/colored-pencil grain; warm natural, gently muted colors; rounded, slightly organic shapes; soft painted shading; restrained contrast; quiet handmade charm; minimal, clean details; readable silhouette at small mobile size.

Draw one single full-body rooster standing confidently on two sturdy legs, three-quarter view toward the viewer, head held high. Give it the unmistakable features of a rooster: a large bright red comb with a few rounded points on top of the head, a small red wattle under the beak, a short warm yellow beak, a tiny calm dark eye, golden-orange hackle feathers around the neck, a rich russet reddish-brown body, sturdy warm yellow legs with small feet, and long arching sickle tail feathers sweeping back and up in deep green-black with a soft warm sheen. Keep the comb, wattle and arched tail large and clearly readable — that is what tells a rooster apart from a hen.

The third reference shows the same painted bird family, so take only its brushwork, eye treatment and feather strokes from it. Do not copy its cream colouring or its hen shape: this bird must be a rich russet and gold rooster with a big red comb, not a pale hen.

One subject only, fully visible, centered with comfortable breathing room. Plain warm off-white background is acceptable. No added props, ground line, nest, fence, barn, or scene unless requested. The result must look like it belongs beside the exact reference images.

No photorealism, 3D rendering, glossy plastic, vector emoji, stock-icon look, or anime styling. Not a hen, not a chick, not a turkey, not an ostrich, not a peacock, not a generic round baby bird: a plain small adult rooster. No spread peacock tail, no crest of feathers on the head, no long drooping wattles, no decorative plumage, no bright tropical colours. No thick black outline, white sticker border, glow, hard drop shadow, or dramatic lighting. No excessive gradient, tiny detail, heavy texture, decorative sparkles, or ornamental extras. No unrequested accessories. No text, labels, watermark, logo, collage, contact sheet, or multiple alternatives in one image. Do not reproduce the reference bear, the golden star or the chicken; create the requested rooster in the same visual family.
