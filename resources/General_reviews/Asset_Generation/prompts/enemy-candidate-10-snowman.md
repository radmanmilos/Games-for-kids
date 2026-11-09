# Enemy candidate 10 (walker-snowman) — defect fix regeneration

- **Asset id:** `enemies_and_walkers_candidate_10` (`walker-snowman`), review package `04_ENEMIES_AND_WALKERS/`
- **Why:** Gate 2 batch-4 disposition 2026-11-09 — owner requires: (1) both arms present (the original has only one), (2) no pile of snow beside him, (3) no part of the frog head in the cutout (crop contamination at the base). Row is NEEDS WORK until the corrected version is re-approved.
- **Consumer:** `drawWalker()`, `kitty-standalone.js:1726`; transparent glyph <=48 px (EXPLORER_MAPPING); direction flip, foot anchor and bob unchanged. Note: candidate is an ALTERNATE to approved reused `snowman.webp` — no replacement without a separate explicit decision.
- **Authorization:** project owner, Option C extended, 2026-11-09 ("regenerate with cloudflare all 4"); one of 4 enemy/walker regenerations, per-candidate owner review before replacing.
- **Subject reference:** none — text + style only (the original crop carries the defects, so it must not be the shape source).
- **Style references:** bear + star (defaults).
- **Run date / tool:** 2026-11-09, `tools/asset_generate.js` (flux-2-klein-4b).

--- prompt ---
A softly painted children's storybook game asset: a friendly snowman character for a 2D side-scrolling platformer, shown alone on a plain flat light background no scenery.

IMPORTANT — the snowman is shown in strict SIDE VIEW (profile), as if walking to the left: seen from the side, body facing the viewer's left, slightly leaning forward with a gentle walking feel. From the side you see the three stacked rounded snow balls in profile, the purple top hat with red band in profile, the lilac scarf with its tail flowing behind toward the right, the orange carrot nose pointing LEFT in profile, one calm dark dot eye on the visible side of the face, and a gentle smile. Exactly ONE thin brown stick arm is clearly visible on the near side, swinging forward; the far arm is hidden behind the body (or only its tip peeks out).

The base is completely clean: nothing beside or around the snowman — no leaves, no foliage, no plants, no frog, no frog head, no detached pile of snow, no snow mound other than the snowman's own rounded bottom ball. No ground shadow, no cast shadow, no reflection. No signature, no watermark, no initials, no text of any kind. Child-friendly painted illustration matching the star reference: soft watercolor washes, soft paper grain, no heavy black outline, no sticker border, no glow, no other objects, no ground line, no sky. The snowman fills most of the frame, centered.
