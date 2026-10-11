# Petra's World — Art Direction for Emoticon Replacement Assets

## 1. Fixed visual references

Use the exact two images supplied by the user as the unchanging style references:

- **Bear reference:** seated honey-brown bear; rounded head and body; small dark eyes and nose; cream muzzle; restrained rosy cheeks; subtle warm watercolor/paper texture.
- **Star reference:** plain, plump golden-yellow five-point star; softly irregular rounded points; warmer orange shading near edges; fine paper texture; no face, no outline, no extra decoration.

Do not substitute newly found “similar” images. If the originals are not available in the repository working files, ask for them to be added to the resources reference folder rather than silently replacing them.

## 2. Desired visual language

- Simple, cozy, child-friendly storybook illustration.
- Soft watercolor wash and subtle paper grain, resembling the supplied bear and star.
- Warm, natural palette: honey, ochre, cream, muted sage, dusty blue, peach, soft terracotta, gentle greens.
- Rounded, readable silhouettes and minimal interior detail.
- Friendly expression only when the object naturally has a face and the reference style calls for it.
- Soft shading, with no hard black comic outline unless the exact object reference requires it.
- Clear recognition at small mobile sizes; prioritize silhouette and color over texture detail.
- Transparent PNG background for standalone game objects unless the implementation plan explicitly requires a background.
- Center the object with comfortable transparent padding and no cropped edges.

## 3. Avoid

- Overly elaborate or decorative details (the earlier duckling example was too detailed).
- Glossy 3D, photorealism, plastic shine, vector-emoji appearance, generic stock icon style.
- Excessive gradients, sparkles, highlights, textures, tiny markings, or ornamental outlines.
- Heavy black outlines or high-contrast comic shading.
- White/cream backgrounds baked into assets that must be placed over varied game backgrounds.
- Different levels of detail from one asset to the next.
- Unrequested faces on objects (especially the star).
- Generating characters that replace Explorer or Kitty sprites.
- Replacing real 3D racing models, geometry, or scenery with 2D pictures.

## 4. Composition and export

- Default object canvas: 512×512 PNG with transparency.
- Use 1024×1024 only when detail or larger display warrants it.
- Keep object proportions and framing consistent across related assets.
- Avoid shadows that create large opaque halos; keep any shadow soft and close to the object.
- Export production assets as optimized PNG with alpha transparency where supported.
- Preserve the prompt and approved source/reference information under `resources/General_reviews/Asset_Generation/`.
- Put only approved runtime assets into the relevant `game/assets/images/` subfolder.
- Keep the application offline-first; no remote runtime image URLs or dependencies.

## 5. Reuse and family consistency

- Generate one canonical asset per distinct concept, not one per game.
- Reuse the same apple/star/flower/etc. across games when semantics and scale allow.
- Do not make arbitrary alternate poses or color variants unless the game needs a distinct teaching distinction.
- Standard UI controls (back, arrows, sound, restart, play/pause, close) should use one consistent SVG/CSS icon family rather than watercolor assets.
- Keep existing good illustrations and animation frames. This project is replacing emoji visuals, not repainting the whole application.

## 6. Approval workflow

For each batch:
1. Generate only a small group of assets.
2. Compare against the exact bear and star references.
3. Inspect at actual target sizes and against light/dark or varied game backgrounds as appropriate.
4. Mark each candidate APPROVED or REJECTED in `PROGRESS.md`.
5. Save the final prompt and file mapping for approved items.
6. Never treat a generated image as production-approved without explicit review.

## 7. Asset handoff contract

Every approved asset must have:
- Stable asset ID and filename
- Transparent PNG with known dimensions
- Exact source emoji(s) and game/component usage it replaces
- Approved prompt/reference notes
- Intended destination under `game/assets/images/`
- Any scaling/cropping/animation notes
- QA status

The implementation AI must not invent new artwork, alter the approved art direction, replace existing characters/models, or change game mechanics. Its job is to map the approved asset IDs to the listed emoji render sites, preserve layout and behavior, update offline/cache manifests if required, and test each affected game.
