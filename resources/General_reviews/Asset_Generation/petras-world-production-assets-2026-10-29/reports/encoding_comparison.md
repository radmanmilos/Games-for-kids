# Encoding comparison — 512x512 RGBA production candidates (32-file sample, every 4th file of 125)

Reproduce: `python tools/encoding_comparison.py` from a folder of 512 px PNG cut-outs named `final512/`.
PSNR is measured after compositing on navy (28,38,72) against the unencoded cut-out; 40 dB and above is normally visually lossless.

| format | mean KB | median | p90 | max | min PSNR | median PSNR | x131 total MB |
|---|---|---|---|---|---|---|---|
| PNG-32 (optimized) | 194.0 | 190.2 | 228.7 | 307.4 | exact | exact | 25.4 |
| PNG-8 (256 colours) | 35.2 | 34.1 | 45.3 | 54.0 | 37.1 | 39.2 | 4.6 |
| WebP lossless | 121.6 | 121.6 | 143.1 | 192.6 | exact | exact | 15.9 |
| WebP q90 | 33.8 | 33.7 | 40.9 | 50.7 | 38.7 | 44.9 | 4.4 |
| **WebP q85** | **27.5** | **27.4** | **33.3** | **41.7** | **37.5** | **42.7** | **3.6** |
| WebP q80 | 23.6 | 24.1 | 29.5 | 36.8 | 36.4 | 41.3 | 3.1 |
| WebP q70 | 19.8 | 20.0 | 25.8 | 31.7 | 35.1 | 39.6 | 2.6 |

Encoder: Pillow 12.1.1 (libwebp), method 4 for this comparison (the shipped script uses method 6, which is slower and slightly smaller).
PNG-8 was rejected on sight: see `review-sheets/format_zoom_3x.png` (speckle on the pear gradient).
