# Little Explorer — Sprite Sequence Prompt (for AI reference)

Use this text when feeding the sprite set to an image-generation or
animation AI, so it understands what each file is and how the frames
relate to one another.

## Character reference (must stay identical across every frame)
A chibi-proportioned little girl explorer:
- Brown curly shoulder-length hair with bangs
- Tan/yellow safari pith helmet with grey-lensed goggles strapped around it
- Cream short-sleeve collared shirt with brown suspender straps
- Brown shorts, white ankle socks, brown lace-up boots
- Small brown satchel/pouch bag on a shoulder strap, brown belt with buckle
- Flat 2D vector illustration style, soft cel-shaded coloring, clean sharp outlines, transparent background

## File sequence and meaning

| # | Filename | Pose/Action | Facing | Notes |
|---|----------|-------------|--------|-------|
| 1 | 01_idle_right.png | Standing idle | Right (3/4 view) | Neutral rest pose, arms relaxed at sides |
| 2 | 02_walk_right.png | Walking cycle frame | Right (3/4 view) | Mid-stride, one leg forward, arms swinging in counter-motion |
| 3 | 03_run_right.png | Running cycle frame | Right (3/4 view) | Faster gait, more knee lift and forward lean than the walk frame |
| 4 | 04_idle_right_b.png | Standing idle | Right (3/4 view) | Same idle pose as #1, used as a return/reset frame between actions |
| 5 | 05_jump_right.png | Airborne mid-jump | Right (3/4 view) | Both feet off the ground, knees bent, body slightly airborne-tilted |
| 6 | 06_idle_right_c.png | Standing idle | Right (3/4 view) | Same idle pose as #1/#4, third neutral reset frame |
| 7 | 07_profile_right.png | Strict side profile | Right (true 90° side view) | Full side silhouette, used for side-scrolling reference |
| 8 | 08_back_view.png | Back view | Facing away from camera | Shows back of helmet, hair, and backpack detail |
| 9 | 09_profile_left.png | Strict side profile | Left (true 90° side view, mirrored) | Same silhouette as #7, mirrored to face left |
| 10 | 10_idle_left.png | Standing idle | Left (3/4 view, mirrored) | Same neutral pose as the right-facing idles, mirrored to face left |

## How the frames relate
- Frames 1, 4, and 6 are **identical idle poses** — they act as neutral
  "rest state" anchors in the sheet, not a progression. An animation
  system should treat these as duplicates of a single idle frame.
- Frames 2 and 3 form a **locomotion pair**: walk (slower gait) vs.
  run (faster gait) — same right-facing direction, same silhouette
  language, differing only in stride amplitude and lean.
- Frame 5 is a **single-pose jump** (not a cycle) — apex of a jump arc,
  meant to be used as the airborne frame in a jump animation state.
- Frames 7 and 9 are a **mirrored pair**: identical strict-profile
  silhouette, one facing right and one facing left — useful for
  verifying left/right symmetry or building left-facing movement
  animations from the right-facing ones.
- Frame 8 is the only **back-facing** pose, useful for top-down or
  behind-camera movement (e.g., walking away from the viewer).
- Frame 10 mirrors frame 1 (and 4/6) — the same idle silhouette
  flipped to face left, completing a right-set/left-set pair so the
  character can idle facing either direction.

## Intended use
This set is meant to function as a **production-ready 2D game sprite
kit**: idle, walk, run, jump, and turnaround (profile + back) states,
in both left- and right-facing orientations, all on transparent
backgrounds, ready to drop into a sprite atlas or animation state
machine.
