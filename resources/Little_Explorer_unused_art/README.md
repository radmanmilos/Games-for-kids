# Little Explorer: art removed from `game/` (not referenced by any code)

Moved out of `game/assets/art/` because nothing in `game/` references these stems (verified:
no literal stem, no registry-mapped emoji used by any game, no dynamic prefix construction).
They were in `sw-cache-list.json`, so every tablet downloaded them offline for nothing.
`game/` must stay deployable-only (AGENTS.md), so they live here as raw material.

Do NOT move a file back without fixing the defects listed below first.

| Group | Count | Known defects (seen in review, 2026-11-10) |
| --- | --- | --- |
| `collectible-01`, `decor-01`, `enemy-01`, `goal-01`, `hazard-01` | 5 | **Sprite-sheet header labels** ("Collectibles & Items", ...) cut out as if they were assets. Delete. |
| `collectible-02..15`, `collectible-<name>` | 24 | Positional duplicates of the named set (gift, star, heart, coin...). `collectible-02` and `-submarine` have stray fragments at the corners. |
| `decor-02..16` | 15 | Mostly usable (bushes, tree, sign, lamp). `decor-04` and `decor-06` have edge fragments. |
| `enemy-02`, `04..10`, `12..17` | 14 | Usable creatures (positional duplicates of the named `enemy-*` set that the game uses). `enemy-03` (snake) and `enemy-11` (penguin) were promoted into `game/assets/art/` as `enemy-snake` / `enemy-penguin`. |
| `goal-02..05` | 4 | Usable (mine arch, cave, house, torii). `goal-house` ships a grass strip. |
| `hazard-02..12`, `hazard-<name>` | 21 | Fragments on `-05/-06/-08/-11`; `hazard-09` is a pixelated low-res rock; `hazard-spikes` is a pale grey comb. |
| `pipe-<world>` (autumn, cave, egypt, japan, northpole, savanna, spring, underground, water, winter) | 10 | Plain flat jars, not pipes; `pipe-winter` is a star-shaped glass jar. Replaced in code by `pipe-01..08`. |
| `platform-01..11` (except `-07`) | 10 | Floating-platform cut-outs; unused. |
| `terrain-japan-top`, `terrain-winter-explorer-top` | 2 | **Star-shaped**: they cannot tile as ground. Need regenerating (see task brief). |
| `terrain-tile-01..18` (except `-16`) | 17 | Grass-and-dirt chunks cut from a sheet; `-01` is a thin strip with a stray line, `-10/-11` have cut slivers. |

## `replaced/`

Used sprites that were swapped out because they were visibly wrong in the game (kept for reference):

| File | Why it was replaced |
| --- | --- |
| `enemy-snake-baked-landscape.webp` | A whole illustrated savanna scene (trees, ground, a tube) baked into the sprite; the "snake" showed as a framed picture. Replaced by `enemy-03`. |
| `enemy-penguin-sketch-in-pipe.webp` | A black-and-white pencil sketch of a penguin inside its own grey pipe: wrong style, and a second pipe on top of the game's pipe. Replaced by `enemy-11`. |

## `rejected/`

Generated art that passed the automated checks but looked wrong in the game (task 455). Kept so nobody regenerates the same thing:

| File | Why it was rejected |
| --- | --- |
| `terrain-winter-explorer-top-flat-white.webp` | 1.6 KB flat near-white band: no texture, almost the colour of the snow scene behind it, so the floor was nearly invisible. Passed `tile_edge_check.py` only because a uniform colour has zero edge difference. |
| `terrain-japan-top-flat-pink.webp` | 2.5 KB flat pink band with a few petal dots: reads as a vector strip beside the painted art, and pink on a pink scene. |

A real replacement must be painted ground (texture, a visible top edge with contrast against the scene) *and* pass `tile_edge_check.py`.
