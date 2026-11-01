# Emoji render-site audit (T322, target 3.0.0)

Source data: `tools/.cache/emoji-audit.txt` (6 CSS + 6 CANVAS + 15 DOM + 96 MARKUP + 240 DATA + 105 unclassified lines). Classification rule: a site is migrated when it is the **sole content** of a visible element on a play screen and the glyph has an illustration in `game/data/art-registry.js`. Everything else is documented below as an intentional exception.

## Fixed in T322 (registered glyphs, sole content of a play-screen element)

| File | Site | Glyph | Art stem |
|---|---|---|---|
| `game/games/adventure.js:150` | HUD collectible (`#adv-collect-emoji`) | per-world collectible | registered |
| `game/games/adventure.js:298-302` | world-picker span (`.adv-w-emoji`) | per-world collectible | registered |
| `game/games/kitty-standalone.js:1077` | world-picker span (`.w-emoji`) | per-world collectible | registered |
| `game/games/maze.js:106` | garden motif (`.maze-motif`) | `MOTIFS[m]` | registered |
| `game/games/candy.js:80` | star tile (`applyTileVisual`, type -1) | ⭐ | star |
| `game/games/candy.js` (end of file) | static `#candyBarTip` and `.level-up-emoji` | read back from markup | registered |
| `game/games/piano.js` (startPiano) | `#pianoFinishEmoji` | 🏅 | medal |
| `game/games/rhythm.js` (init) | each `.rhythm-pad` | 🥁 | drum |
| `game/pages/cat_forest.html` + `cat_forest.js` | `.cf-book-empty` | 🐾 (CSS `content:attr(data-e)` + `fillAttr`) | pawprint |

Note: `✨` **does** have an illustration (`celebration.webp`); the earlier T321 note claiming otherwise was wrong. Only genuinely unregistered glyphs (e.g. ☀️ 📖 ✖️ 🃏 🚩 🔤 🔢 🔷 🎨 🕰️ 📊 📥 🔄 🗑 🔊 🔇 🎵 ✏️ 🌍 ⚡ 🏎️ 🏁 🌺 🎹 ⚖️ 📆 🌷 🐞 ❤️ 💨 🖥️ 👁️) stay emoji.

## Intentional exceptions (not migrated)

- **Hub / navigation tile icons** (parent.html, index tiles, game cards): composite branding surfaces; DECISIONS.md line 16 settles native emoji animals. Parked as task 328 pending user decision.
- **Shell chrome**: back buttons (already shared Material SVG per V22), parent/progress controls (📊 📥 🔄 🗑 🔊 🔇), mode buttons' leading emoji (🎵 🥁 in rhythm.html), audio-test button. These are UI affordances, not artwork.
- **Composite sentence / HUD text**: `adventure.js` "🌟 СВИ СВЕТОВИ ПРЕЂЕНИ! 🌟", `animal_counting.js` "Готово! 🌟", classroom show-emoji rows, fastcat level labels, mode-button labels. Art is embedded in prose; painting would break text flow.
- **Hidden legacy nodes**: `#collect-emoji` (explorer, `left:-9999px`), `#cf-daynight` (☀️/🌙 toggle, font-variant-emoji). Decorative/legacy, not rendered as artwork.
- **Data fields**: `emoji:` / `collectible:` columns in 16 data tables (serbian.js has 51). These feed both canvas `Art.draw` (already painted) and the DOM sites above; the field stays as the fallback glyph.
- **Canvas fallbacks**: `adventure-modes.js`, `kitty-standalone.js` (pit hazards, cave ✨/arch 🐚) already use `Art.draw`, which paints when the WebP is loaded and falls back to `fillText`. No change needed.
- **Unregistered glyphs** (see list above): no illustration exists, so `Art` keeps the emoji. New assets would be required to migrate them.

## Orphan WebPs (21, non-fatal warning in validate_pages.js)

`animal-crab, animal-dinosaur, animal-dolphin, animal-ladybug, animal-octopus, animal-whale, card-stack, flower-hibiscus, food-rice-ball, meteor, object-anchor, object-boy, object-flag, object-gift, object-girl, object-money-bag, object-potted-plant, object-yarn, plant-clover, playing-cards, puddle`. Left in the offline cache; harmless. Either register them or delete the files in a later cleanup task.

## Guard

`tools/validate_pages.js` now fails (hard) if any registered stem lacks its WebP, and warns on orphans. `tools/guards/registry_guards_negtest.js` covers the new case ("art glyph pointing at a missing WebP", target 'art'); all 13 guards can fail.