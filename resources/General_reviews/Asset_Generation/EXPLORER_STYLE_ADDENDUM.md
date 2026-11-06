# Little Explorer — Environment-Art Addendum

**Project:** Little Play / Petrin svet — Мала истраживачица (Little Explorer)
**Scope:** Environment art direction for the Little Explorer world redesign (plan phases 0–18). Applies to backgrounds, terrain, platforms, pipes/entrances, enemies, hazards, collectibles, goals, and decor across all 11 worlds.
**Relationship:** This is an addendum to `STYLE_BIBLE.md`. It does not replace or contradict the master style bible; where they overlap, the master style bible is authoritative. The bear and star references remain the fixed style anchors.
**Status:** Proposed — not approved for generation until Gate 1 (user acceptance of art direction, palettes, and technical contract).

---

## 1. One-sentence environment direction

Each Little Explorer world is a softly painted, cohesive storybook landscape — warm, tactile, gently imperfect, immediately readable — with every world distinct enough that a child recognizes it from its environment before seeing the title, while all 11 worlds clearly belong to the same game.

---

## 2. Shared art rules (all worlds)

| Rule | Requirement |
|---|---|
| Shape language | Soft, rounded, generous forms; gently uneven organic contours; compact silhouettes; few large clear masses; friendly proportions; visually balanced; planted and complete. |
| No | Needle-sharp points, spindly limbs, hard angular anatomy, aggressive poses, geometric perfection / stock-vector feel, excessive decorative bumps, thick black outlines, complex silhouettes that collapse at small size. |
| Paint & surface | Soft watercolor washes with subtle paper/colored-pencil grain; gentle pigment variation within shapes; soft transitions and edges; controlled painterly imperfections; clean and intentional (not dirty/blotchy/noisy). |
| No | Glossy plastic/metallic/wet-look specular; photorealistic fur/wood/skin simulation; strong gradient bands/airbrush halos/lens bloom; heavy canvas texture/grunge; flat emoji/vector fills; thick black cartoon outlines; white sticker borders/dark halos/opaque outlines. |
| Contours/edges | Soft colored edge definition where needed to separate overlapping forms; contours harmonize with nearby fill (not default black); readable against intended background without cut-out sticker effect. |
| Light/shading | Soft, diffuse, broadly even light; volume suggested with gentle transitions and a few darker areas; shadows close to form, low contrast; warm edge shading where appropriate; no dramatic directional lighting, deep cast shadows, sharp chiaroscuro, glowing highlights, cinematic contrast. Ground/contact shadows subtle and close to base, never large grey ovals. |
| Palette | Warm, natural, muted, gentle; enough saturation to be cheerful but not fluorescent/candy-neon. Build each object from a small coherent family (one main hue + lighter/darker variations + small accent). Shading moves toward related warmer/deeper color, not pure black or saturated complement. Highlights soft and broad. Neighboring colors harmonious. Preserve meaningful real-world color cues for recognition/learning. |
| Faces/expression | Only where appropriate; small simple dark calm eyes; minimal nose/mouth marks; gentle/relaxed/curious/quietly cheerful expressions; soft small low-saturation blush; features painted into the form, not pasted on as emoji. Objects do not get faces by default. |
| Detail budget | 1) primary read: recognizable outer shape + main color; 2) secondary read: a few defining parts; 3) surface finish: restrained shading + faint texture; 4) optional accent only when it clarifies. Stop after these levels. No intricate feather layering, individual hairs, many tiny spots, elaborate patterns, tiny accessories, multiple competing highlights. Similar detail density across an asset family. Clear educational forms over natural-history accuracy. |
| Composition | One main subject per file (unless inventory requires group/scene); centered/optically centered with breathing room; entire subject visible (no clipped ears/leaves/feet/tails/stems); calm uncluttered composition; balanced visual mass; natural stable pose; readable view angle. Related items keep apparent scale and framing consistent. |
| Consistency | Same softness of edges; amount/scale of visible texture; contrast/shadow strength; warmth/saturation; contour treatment; complexity/detail density; facial feature scale/expression restraint; subject scale/empty space; degree of shape irregularity; light direction/overall softness. Consistency = shared treatment, not sameness of subject. |

---

## 3. World palettes (derived per world, Phase 1 §7.2)

Each world gets one palette sheet first; individual asset briefs derive from it. Per world: primary environment colours, secondary colours, accent colours, ground/platform materials, background atmosphere, hazard colours, enemy contrast requirements, goal landmark colours. All 11 worlds share the warm/muted storybook family but vary dominant palette, vegetation/architecture, materials, weather/atmosphere, background landmarks, enemy/creature designs, platform materials, entrance/goal motifs, decorative motifs.

World roster: Spring (Пролећни дан), Summer (Летњи залазак), Autumn (Јесења ноћ), Winter (Зимски снег), Underground (Подземље), Cave (Пећина), Water (Подводни свет), Savanna (Савана), Japan (Јапан), North Pole (Северни пол), Egypt (Египат).

Each world recognizable from its environment alone before the world title appears.

---

## 4. Asset-family standards (Phase 1 §7.3)

**Backgrounds:** multiple parallax depth layers where renderer supports; seamless horizontal continuation where a world scrolls; no baked-in gameplay platforms/hazards/enemies; clear negative space around gameplay plane; low-contrast distant forms; no important detail hidden behind player/HUD.

**Terrain:** separate top/playable surface from side and underside; consistent edge thickness and collision readability; tileable/modular pieces; left/centre/right/inner-corner/outer-corner/end-cap variants where geometry needs them; no visible seams or repeated obvious patterns.

**Platforms:** clearly distinct from background scenery; consistent top surface and side material; readable edges at small scale; modular lengths/variants; moving-platform artwork stays clear in motion.

**Entrances (pipes):** themed to the world (not generic plumbing); clear opening/emergence point for enemies; no ambiguity between decoration and active spawn point; artwork must not imply a different collision shape; must not occlude enemy during emergence.

**Enemies:** friendly readable silhouette; distinct identity and colour from terrain; expressions suitable for young children; required directional/animation states based on actual engine behaviour; no decorative appendages obscuring collision-relevant body.

**Hazards:** strong visual readability without becoming frightening; clearly communicate danger through shape and colour (not colour alone); avoid false safe-looking surfaces; preserve exact collision boundaries; decorative effects must not disguise active collision region.

**Goals:** memorable world-specific destination; visually rewarding and easy to recognize; clear focal hierarchy; do not cover/misrepresent actual goal trigger area; compatible with finish trigger/animation.

**Decor (snow/leaves/petals/bubbles) & ceiling:** retain procedural (simple effects/tiny particles/repeated low-detail elements per plan §8.6); no image assets required.

**Hero (Explorer/Kitty) & HUD:** unchanged (out of scope per plan §5, §9, §17 non-goals).

---

## 5. Technical export requirements (Phase 1 §7.4)

Derived from the existing pipeline (DECISIONS.md task 360; project/lessons/asset-generation.md):

- Coordinate/scale conventions: match current `draw()` gameplay coordinates; camera/world transforms unchanged.
- Native display size / intended scale: glyph art 512×512 WebP with real alpha in `game/assets/art/`; full-bleed scene art opaque in `game/assets/scenes/` (exempt from alpha/size/registry rules).
- Sprite-sheet frame dimensions/order: only where relevant (enemy directional/walker states); hero sprites unchanged.
- Animation frame rate/timing: preserve existing enemy pop-out cycle (~3s), walker bob, coin bob/sparkle, particle lifetime.
- Transparent background: required for glyph cut-outs; real alpha, clean edges, no white matte/colored fringe/semi-transparent haze.
- File format/colour mode: WebP lossy q85, alpha q100 (glyphs); PNG acceptable for scenes. Optimized.
- Compression/max file size: hard limit 60 KB/file for glyph art (DECISIONS.md).
- Tile seam requirements: seamless horizontal continuation for scrolling backgrounds; no visible terrain seams.
- Mipmaps/filtering/smoothing: none added; preserve canvas crispness.
- Asset loading/fallback: cache image objects; load required assets before gameplay or use reliable loading state; missing image never crashes game loop; never silently hide gameplay-critical missing object; emoji/procedural fallback via `Art.draw()`/`Art.fill()`; offline-first, no remote URLs.
- Naming/inventory IDs: category prefix + stem (e.g. `object-water-drop` → `water-drop.png`); stable asset IDs; explicit world→family mapping.

---

## 6. What remains procedural (preserved)

Per plan §8.6, keep procedural where it is the better solution: simple effects, tiny particles, repeated low-detail elements, dynamic geometry, simple tinting/state changes, performance-sensitive details. Specifically preserved: coin glow+bob+sparkle, particle system, `drawDecor` (snow/leaves/petals/bubbles), `drawCeiling` (underground/cave rock), distant hills/clouds/stars unless replaced by scene art, hero sprite animation state machine, all physics/collision/enemy AI/platform movement/camera.

---

## 7. Review & approval checklist (per asset)

Style:
- Reads as cozy storybook painting, not emoji/vector/3D/stock art.
- Soft, natural, harmonious colors.
- Texture subtle, does not obscure form.
- Edges soft but silhouette clear.
- Shading gentle and integrated.
- Detail density matches existing bundle.
- No unrequested face, props, background scene, text, border, effects.

Subject/composition:
- Correct subject, unmistakable defining features.
- Whole subject visible, no accidental cropping.
- Balanced framing, comfortable breathing room.
- Readable at small mobile UI/gameplay size.
- No distortions, stray marks, unwanted objects, confusing overlaps.
- Related assets comparable apparent scale and finish.

Technical handoff:
- Filename matches agreed stable asset ID.
- Dimensions and format recorded.
- Background choice matches task and eventual use.
- No visible background fringe, compression artifacts, damaged edges.
- Intended game/component and reuse plan documented.
- Candidate marked WIP until explicit approval.

Gate 1: art direction, palettes, and technical contract reviewed and accepted by the user before large-scale asset generation.
