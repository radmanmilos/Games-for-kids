#!/usr/bin/env python3
"""Subject-only measurements used in the 2026-10-29 asset review (background is ignored).

Usage:  python3 review_metrics.py <path-to-assets_work_in_progress_bundle> > review_metrics.csv
Needs:  Pillow, NumPy, SciPy.

Method (every file is first resized to 1024 px on its long side; transparent files are composited on warm paper):
  paper     = the most common colour (8-level quantised) of the whole image
  subject   = pixels whose summed RGB distance from paper is > 110, opened by 2 px, small specks dropped, holes filled
  acuity    = median, over the subject contour, of (max Sobel gradient in a 7x7 window) / (contour contrast) * 100
              -> higher = crisper painted contour; an enlarged low-resolution raster scores low
  texture   = standard deviation of a high-pass (gray - gaussian sigma 3) inside the subject, eroded by 12 px
              -> higher = more visible paper grain / pigment variation / detail
  sat       = mean HSV saturation of the subject pixels
  coverage  = subject area as a % of the canvas
These are screening metrics, not a verdict: fluffy subjects (chick, sheep) legitimately score low on acuity,
and patterned subjects (zebra) score high on texture. Every flag in the review was confirmed by eye at full size.
"""
import sys, os, glob
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

def measure(path):
    im = Image.open(path)
    if im.mode == 'RGBA':
        bg = Image.new('RGBA', im.size, (247, 243, 234, 255)); bg.alpha_composite(im); im = bg
    im = im.convert('RGB'); s = 1024 / max(im.size)
    if s != 1: im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    a = np.array(im).astype(float)
    q = (a // 8).astype(int).reshape(-1, 3); key = q[:, 0] * 1024 + q[:, 1] * 32 + q[:, 2]
    vals, cnt = np.unique(key, return_counts=True)
    paper = a.reshape(-1, 3)[key == vals[cnt.argmax()]].mean(0)
    d = np.abs(a - paper).sum(2)
    m = ndi.binary_opening(d > 110, iterations=2)
    lab, nl = ndi.label(m)
    if nl == 0: return None
    sz = ndi.sum(m, lab, range(1, nl + 1))
    m = ndi.binary_fill_holes(np.isin(lab, [i + 1 for i, v in enumerate(sz) if v > 0.002 * m.size]))
    g = a.mean(2)
    gm = np.hypot(ndi.sobel(g, axis=1), ndi.sobel(g, axis=0)) / 8
    edge = m & ~ndi.binary_erosion(m, iterations=2)
    acuity = np.median(ndi.maximum_filter(gm, size=7)[edge]) / (np.median(d[edge]) + 1e-6) * 100
    inner = ndi.binary_erosion(m, iterations=12)
    texture = (g - ndi.gaussian_filter(g, 3))[inner].std() if inner.sum() > 2000 else float('nan')
    sub = a[m] / 255.; mx = sub.max(1); mn = sub.min(1)
    return acuity, texture, ((mx - mn) / (mx + 1e-6)).mean(), m.mean() * 100

if __name__ == '__main__':
    root = sys.argv[1]
    print('file,width,height,acuity,texture,saturation,coverage_pct')
    for f in sorted(glob.glob(os.path.join(root, '*.png'))):
        r = measure(f)
        if r is None: continue
        w, h = Image.open(f).size
        print(f"{os.path.basename(f)[:-4]},{w},{h},{r[0]:.2f},{r[1]:.2f},{r[2]:.3f},{r[3]:.1f}")
