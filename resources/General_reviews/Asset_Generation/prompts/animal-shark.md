# animal-shark — generation brief

- Replaces: ocean shark obstacle art
- Inventory row: animal-shark
- Category: simple friendly animal, cool-coloured subject inside warm family
- Style references: bear.png, star.png, elephant.png
- Canvas: 1024x1024 from API, production target 512x512 PNG/WebP
- Background: plain warm off-white; no water/ground/shadow

`powershell
node tools/asset_generate.js --prompt resources/General_reviews/Asset_Generation/prompts/animal-shark.md --out tools/.cache/regen/shark.png --ref-files bear.png,star.png,elephant.png --creds "tools/vendor/Cloudflare-credentials,json" --dry-run
node tools/asset_generate.js --prompt resources/General_reviews/Asset_Generation/prompts/animal-shark.md --out tools/.cache/regen/shark.png --ref-files bear.png,star.png,elephant.png --creds "tools/vendor/Cloudflare-credentials,json"
` 

--- prompt ---

Create one standalone illustration of a friendly shark for a cozy early-childhood storybook game. Match the supplied Little Play bear and golden star references: soft watercolor wash with very subtle paper/colored-pencil grain; warm natural, gently muted colors; rounded, slightly organic shapes; soft painted shading; restrained contrast; quiet handmade charm; minimal, clean details; readable silhouette at small mobile size.

Paint as hand-painted watercolor on paper — crisp, softly defined painted contours, fine paper grain and gentle pigment variation visible inside every colour area. Not blurry, not smudged, not felt/fuzzy, not pencil scribble, no smooth airbrushed gradients.

Single plump, friendly shark in side view facing right. Streamlined body with a slightly pointed snout, rounded pectoral fins, a tall triangular dorsal fin (rounded at tip), and a strong crescent-shaped tail fin. Body color is a medium slate-gray with a clean pale gray-white belly. Subtle soft shading inside forms only. One small round dark calm eye, no white glare. Gentle smile curve. Fins thick and clearly separated from body for small-size legibility. No visible teeth, no gill slits exaggerated, no scales pattern.

One subject only, fully visible, centered with comfortable breathing room. Plain warm off-white background with nothing on it: no ground line, no ground shadow or cast shadow, no frame/border/panel/divider, no water/bubbles/seaweed/coral. All shading stays inside the subject. Must belong in the same visual family as bear/star/elephant.

No photorealism, 3D rendering, glossy plastic, vector emoji, stock-icon look, anime styling. No thick black outline, white sticker border, glow, hard drop shadow, dramatic lighting. No excessive gradient, tiny detail, heavy texture, decorative sparkles, or ornaments. No text, labels, watermark, logo, collage, contact sheet, multiple alternatives. No unrequested accessories.