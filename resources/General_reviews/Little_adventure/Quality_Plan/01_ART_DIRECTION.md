# 01 — Art direction (AD)

Numbers here are starting values for the look-dev loop; tune by reviewing images, record changes in `PROGRESS.md`. Units: 1 u ≈ hero's hat-top-to-feet height / 1.7 (hero is ≈ 1.7 u tall incl. hat; the current scene is already in these units).

## AD §1 Style statement

A **cozy toy diorama**: rounded, chunky, saturated-but-soft shapes; smooth shading with a 3-step toon ramp; thin dark-purple outlines on characters only; warm sunlight and cool shadows; everything slightly bouncy. Think "handmade vinyl toys on a tiny island". Never scary: no pure black, no harsh contrast, no sharp spikes on characters. (Inspirations in words only — do not copy any existing game's designs.)

**Shape language:** characters = spheres/capsules/rounded cones; props = chunky with bevelled edges (extruded shapes with `bevelSize`), no thin sticks (nothing under 0.08 u thick except decor); silhouettes readable at 1/10 screen height on a phone-size tablet.

**Colour rules:** each character = 3 main colours + 1 accent; background value/saturation lower than characters so characters pop; interactive things (keys, gems, chests, gates, pedestals) are the most saturated + have a soft glow halo.

## AD §2 Palette and lighting

| Zone | Ground | Accent plants | Sky top → horizon | Key light | Fill (hemi sky/ground) | Mood |
| --- | --- | --- | --- | --- | --- | --- |
| A Meadow | `#A8DB7C` → `#8CCB6A` | pink/white/yellow flowers, round trees `#4FAE5C` | `#7EC8F5` → `#E8F6FF` | warm `#FFF1D0` 1.1 | `#BFE3FF` / `#8FBF6A` 0.8 | bright morning |
| B Forest | `#5FA862` → `#4E9558` | mushrooms red/white, tall pines `#2F7D4F`, ferns | `#6FB7E8` → `#DCEFE6` | warm-green `#F2F0C8` 0.95 | `#A9D6E8` / `#4F8B5B` 0.8 | dappled, cool shade, fireflies |
| C Shrine | `#E6DFC9` stone + moss `#9CCB86` | glowing runes cyan/violet, columns | `#8FB8F0` → `#F3E6FF` | pink-gold `#FFE0C2` 1.0 | `#C9C3F5` / `#9A8FB8` 0.85 | magical dusk-light |

Zone atmosphere (light colour, hemi colours, fog colour/near/far, sky gradient) is **blended over 2 s** when the hero crosses a zone boundary (TDQ §6). Fog: matches the horizon colour; near 55, far 130 (tune). Tone mapping: `THREE.NeutralToneMapping` (verify it exists in the vendored r169; fall back to `NoToneMapping` + slightly lowered light intensities). Outline colour `#3B2F5E` (never black). Shadow colour = ground × `#8A7FB5` multiply (cool).

## AD §3 Character sheets (all code-built, smooth-shaded unless noted; outline thickness 0.025 u)

Face system for every character: an **eye/mouth atlas painted on a CanvasTexture** (TDQ §3). Eyes: white sclera + large dark-purple pupil + 2 white highlights; states `open, blink, happy(^ ^), surprised, grumpy(angled lids), strain`. Cheeks: soft pink blush discs. Never black eyes without highlights.

**Hero «Мали јунак»** — height 1.7 u (head 0.62, hat 0.45, body 0.6). Big round head (`SphereGeometry` scaled 1.05,1,1) with the face decal on the front; peach skin `#F7CDA4`; green pointed hat `#4FB06A` with a cream pom/tip on a 3-bone spring chain (`hatTip`), brown hair tuft at the back; cream tunic `#FFF3DC` (capsule body) with green hem band and a gold belt; short rounded arms and legs (capsules) — arms: shoulder→elbow→hand pivots (hands are spheres, mitten style); legs: hip→knee→foot pivots, boots brown `#8B5A2B` with cream cuffs; small scarf `#E4572E` of 3 spring-chain segments for follow-through. **Wooden sword**: light-wood blade (extruded rounded rectangle 0.1×0.85, bevel), darker wood grip, gold guard; blade tip slightly rounded; faint warm glow not needed. **Shield**: round, purple `#5B4B8A` with a gold boss and a cream rim ring; held on the left forearm; scales up 1.15× when raised. Pivots (names fixed — TDQ §2): `root, hips, torso, head, face, hat, hatTip1..3, scarf1..3, armL, forearmL, handL, armR, forearmR, handR, legL, shinL, footL, legR, shinR, footR, sword, shield, shadow`.

**Owl «Сова»** — 1.5 u tall on a mossy stump: pear-shaped body `#9A6B3F` with cream chest feather scallops (instanced small flattened spheres or a painted chest texture), big head merged with body, two **large eyes** (ring + pupil + highlights) with brow feathers, orange beak, two layered wings (rounded extrusions) that can flutter, ear tufts (cones, bent), tiny feet. Pivots: `root, body, head, eyeL, eyeR, lidL, lidR, wingL, wingR, tail`.

**Grumpy «Мрзовољац»** — blob 1.1 u wide: smooth squashed sphere `#C9708F` with lighter belly `#E6A3BA`, two stubby feet, two tiny arms, 3 little head-tuft leaves; face decal state `grumpy` (angled brows, small frown, cheeks). **Happy** — recolour with a **colour wave**, belly `#FFF0A8`, body `#FFD86B`, face `happy`, tuft becomes a flower. Guard = + leaf-helmet; Boss = ×1.8 + gold crown (3 rounded cones, jewels) and a mood meter shown only as colour. Pivots: `root, body(squash), face, feetL, feetR, armL, armR, tuft1..3, crown?, shadow`.

**Props:** chest (rounded-bevel wood, gold bands, lock; lid hinge at the back), gate (two leaf doors with rounded planks, rope, hanging lantern), key (chunky gold with rounded teeth, soft halo), gems (faceted octahedron + inner glow + halo sprite), pedestal (stone with carved rune ring in gem colour), statue (round-faced stone guardian with open mouth that glows before spitting an acorn), lighthouse (white/red bands, balcony, rotating beam cone), rainbow bridge (7 glowing tube segments), trees (3 species: round, pine, blossom), grass tufts, flowers (3 shapes × 5 colours), rocks (2), mushrooms, logs, fence, signpost, lanterns, stepping stones, rune columns (zone C).

## AD §4 Animation principles and timing table

Principles to apply on every animation: **anticipation → action → follow-through/overshoot → settle**, ease everything (`outBack`, `outElastic`, `inOutSine`), **squash & stretch** (volume-preserving: sy·sx·sz ≈ 1), **secondary motion** (spring chains for hat tip/scarf/tufts/followers), **arcs** not straight lines, **offset** (limbs lag the body by 40–80 ms). Under `REDUCED_MOTION` multiply amplitudes by 0.4, drop spins/hops.

| Action | Timing / amplitude (starting values) |
| --- | --- |
| Idle | breathe scale 1 ± 0.015 @0.35 Hz; blink every 2.5–5 s (seeded) 120 ms; head look-at ≤ 35° toward owl / objective; weight shift every ~6 s |
| Walk/run | stride phase advances by `speed·dt / 1.1`; leg swing ±38°, knee bend ≥ 0 on back-swing, arm swing ±28° opposite, body bob 0.06 u @2× phase, forward lean 8°·speed01, hips twist ±6°, hat tip/scarf spring (k 60, d 7); blend idle↔walk by `speed01` over 120 ms |
| Footsteps | event at each foot contact: dust puff (2 particles) + soft step sound (pitch ±5 %) |
| Sword swing (350 ms = `swingMs`) | anticipation 0–90 ms (arm back −25°, crouch −0.05 u, lean back); strike 90–200 ms (arm sweeps 110° along the logic arc, torso twist 25°, lunge +0.15 u); follow-through 200–350 ms (overshoot 10°, settle); **sword trail ribbon** (6 quads, fades in 180 ms) |
| Shield | raise 120 ms `outBack` (forearm up, shield ×1.15, slight crouch); lower 100 ms; block ring flash 150 ms |
| Bump (200 ms) | squash y 0.82 / xz 1.12 → hop-back arc 0.25 u → wobble spring (k 120, d 8); 3 stars orbit head 600 ms |
| Pickup event | 450 ms "hold up" pose with the item above the head, then item flies into the carry orbit (arc, 300 ms) |
| Complete | 900 ms: two hops + 360° spin (`outBack`), confetti, owl dances |
| Grumpy hop-walk | hop @1.8 Hz, squash −18 % at landing, stretch +14 % at apex, shadow scales with height; **notice**: pop ×1.15 in 140 ms + brows furrow; **bump lunge**: 150 ms squash then +0.3 u forward |
| Grumpy hit | squash 0.7 in 80 ms → `outElastic` back over 350 ms; star burst |
| Befriend | colour wave bottom→top 500 ms; scale 1.25→1 `outElastic` 400 ms; face → happy; 8 stars; hop-dance loop @1.2 Hz ±0.12 u; follower position spring (k 40, d 9) |
| Owl | head tracks hero (≤ 70° yaw, 10°/s smoothing), blink, talk-bob 3 Hz while speech plays, wing flutter on `owlTalk` |
| Chest | lid opens 350 ms `outBack`, warm glow + 6 sparkles, item pops up on an arc 400 ms |
| Gate | two leaves swing 80° over 1.2 s with creak sound, dust at the hinges |
| Pedestal | idle rune pulse 0.5 Hz; lit → steady glow + light beam; wrong colour → 300 ms wiggle + soft «boop» |
| Bridge | segments rise with `outBack` 120 ms apart + sparkle trail; lighthouse beam rotates 0.25 rev/s |
| Bloom wave (complete) | flowers scale 0→1 `outBack`, delay = distance from the lighthouse ÷ 14 u/s |

## AD §5 FX style

Soft round **sprite particles** (star, sparkle, dust puff, leaf, petal) with size/alpha curves; additive for magic (stars, sparkles, beam), normal for dust/leaves. Glow = additive halo sprites (billboards) — no post-processing. Ambient life: per-zone drifting pollen/butterflies (A), fireflies + falling leaves (B), floating rune motes (C), water sparkles everywhere. Never flash the whole screen; nothing brighter than 2 Hz.

## AD §6 Audio direction

Gentle, warm, pentatonic. **SFX** are layered synth (noise burst + 1–2 oscillators, short ADSR, ±5 % pitch variance per play so repeats never sound identical), peak ≤ 0.25. **Ambient beds** per zone (soft wind noise through a band-pass; random birds (A); crickets + distant owl hoot (B); wind chimes (C); water lapping near shores). **Music:** generative loop per zone — soft pad + plucked arpeggio + light bass, C-major pentatonic family, 70–84 BPM, crossfade 2 s between zones, an extra sparkle layer on `befriend`, a short fanfare on `complete`. One sound toggle (`#i3d-sound-btn`) mutes everything; speech stays governed by the global setting. Everything respects `audioBuses`.

## AD §7 UI direction

No text in HUD (title screen may show the title). Custom **inline SVG icons** (sword, shield, play, new-game, back) with a consistent chunky round style, cream fill + purple outline + soft drop shadow; buttons round, press = scale 0.92 + shadow squish; sword button shows a **cooldown ring** (visual only); shield glows while held; joystick = soft ring base + glossy knob with a thin outer guide that fades after the first move; first-launch **hint animation** (a hand-shaped SVG dragging a stick) for 5 s on first play; start screen = the live 3D island with a slow camera orbit and the hero idling, a nicely drawn title (Fredoka, outline, bounce-in) and two big icon buttons; pause = soft blurred dim with a large play icon; landscape hint = animated phone-rotate icon.

## AD §8 Don'ts

No red flashes, no blood/damage language, no digits anywhere, no screen shake, no flashing, no dark/scary areas, no new IP look-alikes, no thin/spiky children-unsafe silhouettes, no emoji in the scene or UI, no tiny touch targets (< 56 px).
