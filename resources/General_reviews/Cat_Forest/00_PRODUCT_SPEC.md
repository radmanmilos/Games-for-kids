# 00 — Product spec: Мачја шума

Status: APPROVED 2026-10-19 (decisions in `05_DECISIONS_AND_RISKS.md`). Section numbers are referenced from the task cards as *PS §n*.

## 1. Vision and audience

A cozy, wordless game for children ~2–6 on an Android tablet (installed PWA, offline). The child feeds visiting cats and watches a little forest come alive. Every tap does something pleasant; nothing can go wrong. Sessions are short and open-ended: there is no goal to finish, nothing to win or lose.

Design pillars:
1. **Cause and effect in seconds** — first cat within ~3 s of the first treat.
2. **No pressure** — no timers shown, no scores, no counters, no failure, nothing expires or is taken away.
3. **Pictures first** — no reading required; Serbian speech and Cyrillic `aria-label`s carry the words.
4. **Calm** — gentle motion, soft synthesized sounds, reduced-motion respected.
5. **Same world as the rest of Петрин свет** — emoji animals, same back button, same tokens.

## 2. Principles mapping: Secret Cat Forest → Мачја шума

The Godot design (earlier in this project) had mechanics the repo's locked principles forbid (`project/DECISIONS.md`, `AGENTS.md`). **This table is the guard against them creeping back.**

| Secret Cat Forest mechanic | Verdict | In Мачја шума |
| --- | --- | --- |
| Fish currency, shop, prices, "can't afford" | CUT | Treats are free and unlimited |
| XP, levels, locked items | CUT | Everything available from the first tap |
| Fish counter / numeric rewards | CUT | Gifts become scenery; **no number is ever shown** |
| Rarity tiers with labels/colours, hint text, "???" silhouettes | CUT | Rarer cats simply visit less often; no labels |
| Cat illustrations | REPLACED | Native emoji (base + optional accessory emoji) — the settled art style |
| Real-clock day/night, real-time weather, weather/night fish multipliers | CHANGED | Child-controlled ☀️/🌙 and 🌧️; no multipliers |
| More slots unlocked by progress | CUT | 3 plates, always |
| Offline earnings, "welcome back" popup, local notifications | CUT | Nothing happens while the app is closed |
| Long visits (30–360 s) | CHANGED | 8–14 s visits |
| Tap cat for +50 % bonus | CHANGED | Tap = cuddle (hearts, meow, name); never affects anything |
| Cat Album with completion % | CHANGED | Optional «Мачке пријатељи» book: met cats only, no counts (D3) |
| Attraction by favourite food | KEPT | Each cat has favourite treats; any treat still attracts someone |
| Special/night cats | KEPT (simplified) | 2 night-only cats, 1 cat that comes when all plates are filled |
| Many named cats | KEPT | 10 cats in v1, data-only to add more |
| Godot/C# architecture, Android export | N/A | Plain HTML/CSS/JS PWA like every other game |

## 3. Experience and screens

One screen (landscape tablet first; must also hold in 844×390 short landscape and 390×844 portrait — TD §10):

```
┌──────────────────────────────────────────────────┐
│ [←]                                      [☀️][🌧️] │  back button (shared style), toggles
│        🌲   🌳        ✨(night)     🌲             │  sky + scenery (decorative)
│   🌷   🍄        🦋         🌸                    │  decor layer = grown gifts
│                                                  │
│      (🍽️1)         (🍽️2)         (🍽️3)          │  3 plates; cats walk in from the sides
│                                                  │
│  [📖]        [🐟][🥛][🍗][🍣][🍪]                 │  book (opt.), treat tray
└──────────────────────────────────────────────────┘
```

No visible text anywhere. All controls are `<button>`s with Cyrillic `aria-label`s.

## 4. Interaction rules

| Input | Result |
| --- | --- |
| Tap a treat | Selected (lifts, glows, `aria-pressed`). Tap again: deselected |
| Tap an empty plate with a treat selected | Treat placed (pop sound); selection cleared; a cat will arrive |
| Drag a treat to a plate (D8) | Same as tap-place; drop elsewhere → treat glides back, no feedback of failure |
| Tap an empty plate with nothing selected | Tray bounces once (a picture hint). No text |
| Tap an occupied plate | Nothing |
| All plates busy and a treat is selected | Treat bounces gently; nothing else |
| Tap a cat (any visible phase) | Hearts, meow, name spoken (throttled). Changes nothing else |
| Tap a gift | Sparkle; the gift hops into the forest and becomes a decoration |
| Tap ☀️/🌙 | Switches time; new cats follow the new time; cats on stage stay |
| Tap 🌧️ | Rain on/off |
| Tap 📖 (D3) | Opens the friends book (game pauses); close returns |
| No interaction for 10 s and no treat out | Tray bounces (max 3 hints until the next tap) |
| Back button | Returns to the Games hub |

A visit: treat placed → **arrival wait** (2.5–4 s) → cat **enters** (2.2–3 s) → **sits** (0.9 s) → **eats** (8–14 s, the treat shrinks) → plate becomes free and a **gift** appears → cat **leaves** (2.2–3 s). Max 3 cats; a cat id is never on stage twice.

Gifts never expire. More than 5 uncollected → the oldest hops into the forest by itself. The forest holds 14 decorations; further gifts replace the oldest softly, so it never "fills up".

## 5. Content

### Treats (free, unlimited)
| id | Emoji | Name (Cyrillic) |
| --- | --- | --- |
| `fish` | 🐟 | Риба |
| `milk` | 🥛 | Млеко |
| `chicken` | 🍗 | Пилетина |
| `sushi` | 🍣 | Суши |
| `cookie` | 🍪 | Колачић |

### Cats (names approved in D9, TTS to be verified; ids are code-only ASCII)
| id | Emoji (+accessory) | Name | Likes | Weight | Rule |
| --- | --- | --- | --- | --- | --- |
| `maca` | 🐱 | Маца | fish, milk | 1.0 | — |
| `puhko` | 🐈 | Пухко | milk, cookie | 1.0 | — |
| `mica` | 🐱 + 🎀 | Мица | cookie, chicken | 0.8 | — |
| `sef` | 🐈 + 🎩 | Шеф | chicken, sushi | 0.7 | — |
| `cveta` | 🐱 + 🌸 | Цвета | milk, sushi | 0.7 | — |
| `tigar` | 🐯 | Тигар | chicken, fish | 0.5 | — |
| `tacka` | 🐆 | Тачка | sushi, fish | 0.5 | — |
| `senka` | 🐈‍⬛ (fallback 🐱 tinted dark) | Сенка | fish | 1.0 | night only |
| `zvezda` | 🐈 + ⭐ | Звездица | milk, sushi | 0.7 | night only |
| `kralj` | 🦁 + 👑 | Краљ | any | 0.4 | only when all 3 plates are non-empty |

Selection weight = `weight × (likes the placed treat ? 1 : 0.25)`; the previous visitor's weight is halved; a fallback guarantees a result. Any treat attracts *someone*.

### Gifts → decorations
🌸 🌷 🍄 🍀 🦋 (each becomes the same emoji in the forest; 🦋 floats gently — static under reduced motion).

### All child-facing strings (Cyrillic; approved D1/D9)
Title «Мачја шума» · Назад · Риба · Млеко · Пилетина · Суши · Колачић · Тањир · Поклон · Дан и ноћ · Киша · Мачке пријатељи · Затвори · spoken prompt «Нахрани мачиће!» · the 10 cat names (spoken on tap). **No other text.**

## 6. Tunable constants (single `CF` object at the top of `cat_forest.js`)

| Constant | Value | Meaning |
| --- | --- | --- |
| `PLATES` / `MAX_CATS` | 3 / 3 | |
| `ARRIVE_MIN` / `ARRIVE_MAX` | 2500 / 4000 ms | treat placed → cat appears |
| `ENTER_MIN` / `ENTER_MAX` | 2200 / 3000 ms | walk in |
| `SIT_MS` | 900 ms | |
| `EAT_MIN` / `EAT_MAX` | 8000 / 14000 ms | |
| `LEAVE_MIN` / `LEAVE_MAX` | 2200 / 3000 ms | |
| `UNLIKED_FACTOR` | 0.25 | weight multiplier for non-favourite treat |
| `GIFT_CAP` | 5 | uncollected gifts before auto-collect |
| `DECOR_MAX` | 14 | decorations before replacing oldest |
| `GIFT_FLY_MS` | 600 ms | gift → forest travel |
| `PARTICLE_CAP` | 12 | live hearts/sparkles |
| `SPEECH_GAP_MS` / `MEOW_GAP_MS` | 1500 / 300 ms | throttles |
| `IDLE_HINT_MS` / `FIRST_HINT_MS` | 10000 / 1500 ms | |
| `HINT_MS` / `HINT_REPEAT_MAX` | 1200 ms / 3 | |
| `RAIN_DROPS` | 24 | max rain nodes |
| `DROP_PAD` / `DRAG_START_PX` | 24 / 8 px | drag tuning (D8) |
| `DT_CLAMP_MS` / `STEP_MS` | 100 / 50 ms | clock rules (TD §6) |

All play-test tuning (CF-22) edits these values, nothing else.

## 7. Friends book (D3 approved)

A 📖 button opens a gentle gallery of **met cats only** (emoji + accessory). Tap a cat: cuddle (meow + name). Empty book: a single 🐾. No counts, no percentage, no progress bar, no silhouettes of unmet cats, no hints. Game time pauses while open. Close button is large.

## 8. Audio and speech

| Cue | Trigger | Implementation |
| --- | --- | --- |
| Place pop | treat placed | two quick `tone` notes |
| Meow | cat arrives (sits) / cuddle | existing cat sample via `playAnimalSound`, else `sweep` |
| Name | cuddle / book tap | `audioBuses.speakWithDuck(name)` else `speech.speak(name)` |
| Gift pop | gift tapped | `softPop`/`tone` |
| Night/day swish | toggle | `sweep` down/up |
| Rain ambience | optional | only if an existing helper exists; else none |

Zero new audio files. Every audio call is guarded (`window.x &&`) and the game works silently.

## 9. Accessibility and motion

- Real `<button>`s, Cyrillic `aria-label`s, `aria-pressed` on toggles/treats, focus-visible styles from `shared/accessibility.css`.
- Tap targets: treats/plates/cats/gifts ≥ 72 px at 1024×800 and ≥ 56 px at 844×390; toggles/book ≥ 56 px.
- Reduced motion: remove decorative animation (bob, twinkle, rain fall, float, pulse); keep essential gentle movement (cats walking, gifts hopping) logic-driven. The owner's tablet reports `reduce = ON`, so the reduced path is a primary path.
- No flashing, no sudden loud sounds.

## 10. Non-goals — do NOT add (reviewers: reject on sight)

Currency/fish/coins/gems · shop/prices/"can't afford" · XP/levels/stars/ratings · locks/unlock gates/"coming soon" tiles · visible scores, counters, percentages, timers · fail/lose/game-over/lives · notifications/offline earnings/daily rewards/streaks · ads/tracking/analytics/IAP/network calls · reading-dependent UI · image assets/new audio files/new libraries · edits to `game/shared/*` · real-clock-driven behaviour · rarity labels.
