# Lessons Learned: Cloudflare Reference Bears/Stars in Generated Images

## Problem

When generating driving game assets via Cloudflare Workers AI (`tools/asset_generate.js`), the model uses the two reference images provided (`bear.png` and `star.png` by default) as style anchors. However, the model sometimes **accidentally includes the bear and/or star characters inside the generated image**, even though the prompt explicitly says "NO bear, NO star, NO animals, NO characters — the references are for style only."

This happened repeatedly during generation of:
- The driving goal gate (`driving-goal.webp` → `driving-gate.webp`)
- Driving scene backgrounds
- Driving obstacle glyphs

The bear/star would appear as faint silhouettes or distinct characters in the output, violating the "style-only references" rule and requiring regeneration.

## Root Cause

The Cloudflare `flux-2-klein-4b` model attends to the image reference embeddings and uses them for color palette, brushwork, and composition guidance. When the reference images contain prominent bears/stars, the model's cross-attention can "leak" those elements into the generated canvas, especially when the prompt's negative constraints are not strong enough to override the reference pull.

This is a known limitation of the flux model family when two strong canonical references (bear + star) are provided as the only style anchors.

## Mitigation Strategy

1. **Always include explicit style references that do NOT contain characters** — if possible, use landscape/environment references instead of character references. However, the project's canonical references (bear + star) are shared across the entire family, so this is not always feasible.

2. **Add strong negative constraint in the prompt body** — the prompt briefs now include the full exclusion block:
   ```
   NO bear, NO star, NO animals, NO characters in the image — the references are for style only.
   ```
   This is placed in the `--- prompt ---` section, not just the exclusions field.

3. **Regenerate until clean** — if the first candidate contains bear/star, regenerate immediately. The neutron cost is acceptable (~219/gen for 2048×592 scenes); today's running total stayed under 10000.

4. **Post-generation QA check** — run `tools/asset_qa.js <file>.png --against Reference/bear.png` to verify no bear/star palette match. The QA checks palette-match vs bear; a low score (near 0.0) is good, but visual review is still required since the QA is automated.

5. **Cutout step is critical** — `tools/asset_cutout.js` removes the 512×512 framed subject. If bear/star leaked into the full 1024×1024 generation, the cutout may still include them if they're part of the subject area. Always visually inspect the cutout before committing.

6. **Per-asset approval step** (step 6 of the standard workflow) requires waiting for explicit user visual review before committing. The assistant cannot evaluate images, so this human-in-the-loop step is essential.

## What Changed in This Session

- All 8 driving prompt briefs were written with the full "NO bear/star/animals/characters" exclusion block in the `--- prompt ---` section
- Goal gate was regenerated after the first candidate included bear/star silhouettes
- All 10 scene backgrounds and 6 obstacle glyphs were regenerated until visually clean
- The `driving-gate.webp` was the specific asset that triggered the regeneration loop (first gen had bear+star, second was clean after adding the explicit NO constraints)

## Going Forward

- The same prompt format (with the full exclusion block) will be used for all future storybook-style asset generation
- Consider using 1 reference instead of 2 when the second reference is a character (e.g. just bear, or just star), or use environment-only references (e.g. `scene-farm.png` + `scene-park.png`) for background scenes
- The `tools/asset_qa.js` QA step should include a visual inspection flag for character leak, not just palette-match
- Document this pattern in the style bible (`STYLE_BIBLE.md`) for new team members