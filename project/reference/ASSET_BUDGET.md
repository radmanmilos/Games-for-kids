# Asset & Performance Budget

- Date: 2026-11-26 (task 453 Q-23 refresh)
- `game/` total files: 571
- `game/` total bytes: 52,947,172 (~50.49 MiB)
- Note: totals include code, manifests, and assets. Little Adventure Q-cards added code-only changes (no new binary art/audio assets).
- Service-worker inventory: 570 cache entries / 569 hashed manifest entries (`game/sw-cache-list.json`, `game/offline-manifest.json`).

## By extension (top)

| Ext | Files | Bytes |
|---|---:|---:|
| .png | 52 | 38,153,784 |
| .webp | 263 | 10,372,570 |
| .mp3 | 142 | 1,660,077 |
| .js | 58 | 1,610,645 |
| .ogg | 10 | 368,331 |
| .html | 28 | 324,722 |
| .mjs | 2 | 193,014 |
| .json | 3 | 98,874 |
| .oga | 1 | 83,798 |
| .css | 7 | 40,823 |
| .woff2 | 2 | 34,308 |
| .md | 1 | 5,024 |
| .svg | 2 | 1,202 |

## Notes

- PNG bytes are dominated by review/reference screenshots and legacy images; WebP remains the preferred runtime image format where used.
- Little Adventure runtime remains procedural/code-built; no new external GLB/texture/audio downloads added.
- Performance proof for Little Adventure: `resources/General_reviews/Little_adventure/Quality_Plan/shots/q08_budget/budget.json` (high/med/low × 8 zones, max 154 calls / 59,896 tris).
- For detailed per-file drilldown, regenerate with `Get-ChildItem game -Recurse -File` and group by extension.
