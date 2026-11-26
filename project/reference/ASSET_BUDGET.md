# Asset & Performance Budget

- Date: 2026-11-26 (task 453 refresh)
- `game/` total files: 570
- `game/` total bytes: 52,922,624 (~50.46 MiB)
- Note: totals include code, manifests, and assets. Little Adventure Q-cards added code-only changes (no new binary art/audio assets).

## By extension (top)

| Ext | Files | Bytes |
|---|---:|---:|
| .png | 52 | 38,153,784 |
| .webp | 263 | 10,372,570 |
| .mp3 | 142 | 1,660,077 |
| .js | 57 | 1,596,517 |
| .ogg | 10 | 368,331 |
| .html | 28 | 323,963 |
| .mjs | 2 | 183,534 |
| .json | 3 | 98,693 |
| .oga | 1 | 83,798 |
| .css | 7 | 40,823 |
| .woff2 | 2 | 34,308 |

## Notes

- PNG bytes are dominated by review/reference screenshots and legacy images; WebP remains the preferred runtime image format where used.
- Little Adventure runtime remains procedural/code-built; no new external GLB/texture/audio downloads added.
- For detailed per-file drilldown, regenerate with a one-off PowerShell `Get-ChildItem game -Recurse -File` report when needed.
