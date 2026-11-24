# 00 — Product spec (PS)

## §1 Vision

A cozy little island. A small hero with a wooden sword and a shield walks north through three zones — Meadow → Forest → Shrine — helps a friendly owl by getting her stolen gems back, and makes the whole island bloom. The Zelda feel comes from **exploring, finding keys, opening gates, small puzzles and a gentle sword** — never from danger.

Target: ages ~4–6 (registry `toddler:false`), Android tablet, landscape, one first playthrough ≈ 8–12 minutes, replayable. Working title **«Мала авантура»** (D1). Game id `little_adventure`.

## §2 Hard rules (approved by the user 2026-11-23 unless marked DEFAULT — see `05_DECISIONS_AND_RISKS.md`)

- **The hero can never be hurt.** No hearts, no health, no damage, no death, no game-over, no "try again". A grumpy blob that touches the hero only gives a gentle bounce back (~1.2 u) and a soft «боинг» sound. An acorn that hits the hero does the same.
- **Creatures are never killed.** A sword hit makes a grumpy blob «пуф» into a burst of stars and turn into a happy yellow blob (befriended). Never show blood, red flashes, "defeat", skulls, or the words kill/fight/enemy anywhere (code identifiers: `grumpy`, `befriend`).
- **Keys and gems are puzzle items, not score.** No counters, totals, "3/5", coins, XP, levels, timers, ranks, achievements, shop, unlockables. Nothing is shown as a number.
- **No soft-locks.** Every item is always reachable; carried items cannot be lost or dropped; nothing is consumable except at its own target.
- **Characters and world are 3D low-poly built from three.js primitives** (user decision). **No 2D sprites, no emoji or images inside the 3D scene.** (Emoji appear only on the hub tile and page favicon.)
- **Fixed camera** (D2): fixed angle, follows the hero, never rotates or zooms by input.
- **Joystick** for movement (user decision) plus big **sword** and **shield** buttons. Keyboard works too (desktop testing).
- Serbian Cyrillic for all text and speech. **No visible text in the HUD.** The start screen may show the title and icon-only buttons with `aria-label`s.
- Offline, no network, no analytics, no ads. One `localStorage` key for progress (TD §10). Synth audio only; no music in v1 (D8).
- Gentle sensory design: no jump scares, no darkness, no loud peaks, no flashing > 2 Hz, no screen shake (see §8).
- No Nintendo IP: no Zelda names, triforce, Master-Sword/Hylian-shield look-alikes, or melodies.

## §3 Player and controls

| Control | Behaviour |
| --- | --- |
| Floating joystick | Left half of the screen (below the HUD). The base appears where the thumb lands; the knob follows within `stickRadius`; releasing hides it and the hero stops at once (no auto-drift). Dead zone 12 %. Output is a vector (x, y) with magnitude 0..1; hero speed scales with magnitude. Screen-up = world north (−Z). |
| Sword button | Bottom-right, ≥ 16 vmin diameter (never < 64 px). Tap = one swing (350 ms arc in front, 200 ms cooldown). **Aim assist:** if a target (grumpy, bush, chest) is within 2.8 u and 70° of the facing, the swing snaps to it. |
| Shield button | Bottom-right beside the sword, ≥ 14 vmin. Hold = shield up (blocks projectiles in a 140° front arc); hero speed ×0.7 while up. Release = down. |
| Keyboard | Arrows/WASD move; Space or J = sword; Shift or K = shield (hold). |
| Back | Existing `.ps-back` bubble, top-left, returns to the Games hub. |
| Sound | Small mute toggle top-right (`ps-icon-toggle` pattern as racing3d's music button). |

Each control is its own element using `window.pointerDrag`, so thumb-on-stick plus thumb-on-button works. Releasing, `pointercancel`, window blur, `visibilitychange` and orientation change must reset every input to neutral.

## §4 World layout (single island, linear spine going north)

Coordinates are `[x, z]` in world units; +x east, +z south, hero ≈ 1.2 u tall. Bounds `x∈[-24,24]`, `z∈[-80,16]`. Water surrounds the island; invisible walls keep the hero on land. These numbers are the config defaults (TD §2) and may be tuned in playtest.

| Zone | z range | Ground | Contents |
| --- | --- | --- | --- |
| A Meadow | 16 … −16 | light green | hero start `[0,8]`; **Owl** on a stump `[-5,4]`; cuttable **bush** `A-bush` `[9,-2]` hides the **red gem**; **guard grumpy** `guard1` `[-8,-10]` (2 hits) drops **key `keyMeadow`**; 2 wandering normal grumpies; **Gate G1** `[0,-16]` (needs `keyMeadow`); trees/flowers/rocks as decoration |
| B Forest | −16 … −46 | darker green | **acorn statue lane**: statue `[-10,-30]` throws acorns east across a 6 u wide bridge `x∈[-6,6]`, `z=-30`; **chest C1** `[14,-34]` holds **key `keyForest`**; cuttable **bush** `B-bush` `[-12,-22]` hides the **green gem**; 2 wandering grumpies; **Gate G2** `[0,-46]` (needs `keyForest`) |
| C Shrine | −46 … −80 | pale stone/grass | **boss grumpy** `boss` `[10,-56]` (3 hits, 1.8× size) drops the **blue gem**; **3 pedestals** red `[-4,-62]`, green `[0,-62]`, blue `[4,-62]`; **rainbow bridge** appears from `[0,-64]` to the **lighthouse** `[0,-76]` once all three gems are placed; lighthouse light turns on; island blooms |

The shield matters only at the acorn lane: with the shield up the hero crosses unbothered; without it acorns gently bounce the hero back toward the lane start (no penalty). The lane is the only route to chest C1, but it is always crossable even without the shield (acorns are slow, 5 u/s, one every 2.5 s, and the bounce is small), so there is no dead end.

Gems can be collected in any order; keys unlock their gates in order (G1 before G2 by geography).

## §5 Characters and objects (visual recipes in TD §7)

- **Hero** — gender-neutral small adventurer: cream tunic, green pointed hat, peach face, wooden sword (right hand), round purple shield with a gold centre (left arm). Eyes only, friendly smile.
- **Owl** (NPC) — round brown body, two big cream eyes, orange beak, sits on a stump; bobs gently; the only character that speaks.
- **Grumpy** — a squashed pink-mauve blob with two angled eyebrows and a small frown. **Happy** (after befriend) — warm yellow, eyebrows gone, smile, small bounce. Befriended blobs: up to 3 follow the hero at 2.5 u; the rest dance in place.
- **Guard** — grumpy with a small leaf hat. **Boss** — 1.8× grumpy with a crown of three cones; each hit makes it visibly less grumpy (colour shifts toward yellow).
- **Acorn statue** — grey stone owl-less pillar with a round mouth; acorns are brown spheres with a tan cap.
- **Items** — key: gold ring + shaft + two teeth; gems: octahedra, red/green/blue, glowing; carried items float in a small arc behind the hero.
- **Chest** — brown box with a half-cylinder lid that lifts. **Gates** — two wooden posts and bars that swing/sink open. **Pedestals** — stone cylinder with a socket ring in the gem's colour.
- **Rainbow bridge** — seven thin coloured segments rising in an arc. **Lighthouse** — tapered cylinder with red/white bands and a glowing top.

## §6 Mechanics (rules the pure logic implements — TD §3)

1. **Move:** speed 5.0 u/s × stick magnitude (×0.7 shielded); exponential acceleration; circle obstacles (trees, rocks, owl, statue, pedestals) and rectangle gates block; bounds clamp. Sliding along obstacles, never sticking.
2. **Swing:** 350 ms; a hit applies to every target within reach 1.9 u inside the 110° arc (after aim-assist snap). Cooldown 200 ms.
3. **Grumpy AI:** idle-wander near home; if the hero is within 7 u it drifts toward the hero at 1.6 u/s; on touch it bumps the hero (1.2 u, 1.5 s cooldown) and retreats for 0.9 s. A hit reduces its hit points (normal 1, guard 2, boss 3); at 0 it **befriends** (state `happy`, permanent). Normal grumpies respawn at their home 20 s after befriending if the hero is > 12 u away and fewer than 4 normal grumpies are alive in that zone; guard and boss never respawn.
4. **Bush:** one sword hit cuts it (leaf burst); if it hides a gem the gem item appears there.
5. **Chest:** walk into it (within 1.2 u) or hit it; opens once; its item appears above it.
6. **Items:** touching a free item within 0.9 u adds it to `carry` (no limit needed — max 5 exist). Carried items cannot be lost.
7. **Gate:** with its key carried and the hero within 2.2 u, the key flies to the gate, the gate opens (1.2 s) and stays open (saved).
8. **Pedestal:** with a gem carried and the hero within 1.8 u of the pedestal of **that colour**, the gem flies in and the pedestal lights. A wrong-colour pedestal just wiggles and the hero hears that pedestal's colour name (no penalty, gem stays carried).
9. **Bridge:** when all three pedestals are lit the rainbow bridge builds (2 s) and the lighthouse lights. Walking to the lighthouse triggers the **completion celebration** (flowers sprout everywhere, soft fanfare, owl speaks). The game then continues in free play (grumpies keep respawning, nothing ends).
10. **Acorns:** the statue throws one acorn every 2.5 s along +x at 5 u/s, lifetime 4 s. Shield up and acorn within the front arc → acorn bounces away with a «тинк». Otherwise it bumps the hero (gentle push) and pops.
11. **Guidance:** `nextObjective(state)` gives the next sensible target (owl → guard → G1 → lane/chest → G2 → boss → missing gems → pedestals → lighthouse). The renderer shows a soft light pillar there and, after 6 s of no progress, a small arrow circling the hero. The owl repeats a short hint when approached.

## §7 Feedback, audio, speech

All sounds are synthesised (`window.tone`/`sweep`/`audioBuses`): swoosh (sweep up), hit pop, befriend chime (3-note arpeggio), key pickup (two bright notes), gem pickup (two notes, higher), chest creak (short sweep), gate open (low sweep up + wood tick), shield tink, bump «боинг» (soft sweep down), pedestal ding (C/E/G for red/green/blue), bridge shimmer, completion fanfare. Keep every sound ≤ 0.6 s except the fanfare (≤ 2.5 s) and keep peak volume moderate (≤ 0.25 per tone).

Speech (`window.speech.speak`, Serbian; **proposed wording, a Serbian speaker must approve it at Gate G3**):

| Key | Line |
| --- | --- |
| `intro` | «Здраво, мали јуначе! Мрзовољци су узели моје сјајне драгуље. Помози ми!» |
| `hintGuard` | «Додирни мрзовољца дрвеним мачем!» |
| `hintGate` | «Однеси кључ до врата!» |
| `hintShield` | «Подигни штит када лете жирови!» |
| `hintGems` | «Постави драгуље на постоља!» |
| `key` / `gem` | «Кључ!» / «Драгуљ!» |
| `gateOpen` | «Врата су отворена!» |
| `befriend` | «Постао је весео!» |
| `red` / `green` / `blue` | «Црвено!» / «Зелено!» / «Плаво!» |
| `bridge` | «Дуга је направила мост!» |
| `complete` | «Браво! Острво је процветало!» |
| `noWebgl` (text) | «3D није доступан овде» |

Speech never repeats within 4 s of the same key; sword/bump sounds do not trigger speech.

## §8 Accessibility, safety, motion

- Touch targets ≥ 56 px, action buttons ≥ 64 px; buttons never overlap the joystick zone's centre.
- `prefers-reduced-motion` (read as `window.REDUCED_MOTION`): fewer and slower particles (≤ 6 per burst), no camera lag animation, no bobbing; **gameplay and sound unchanged**. (This repo owner's OS has reduced motion ON — see lesson in `project/lessons/racing3d.md`: assert the product's response, never the host setting.)
- No screen shake at all. No full-screen flashes. Particle bursts ≤ 12 particles, ≤ 24 alive.
- `aria-label` (Cyrillic) on every button; an `aria-live="polite"` announcer repeats key moments for assistive tech.
- Portrait ≥ 520 px shows the landscape hint overlay «Окрени уређај водоравно 🌍» (as racing3d).
- Pause on tab hide/blur; resume only by the child touching the screen.

## §9 Out of scope (v1)

Music; multiple islands/worlds; dungeons; bombs/bows/arrows; hearts/health; inventory screen; map screen; dialogue text boxes; day/night; weather; multiplayer; cutscene camera; gamepad support; GLTF/asset files; unlockables/cosmetics; leaderboards; any network use. Anything here needs a new user decision first.
