#!/usr/bin/env python3
"""Petras World: approved 1024px master (PNG on paper) -> production art (512x512 transparent WebP).

  python cutout.py --src <assets_work_in_progress_bundle> --dst <out dir> [names ...]
                   [--overrides cutout-overrides.json] [--no-ml] [--quality 85] [--size 512] [--fit 0.88]

What it does, per asset (deterministic; the ML model is only a guide, never the source of colour):
  1. paper model     bilinear blend of the four border strips (copes with gentle vignettes)
  2. classical matte everything not connected to the border through paper-coloured pixels is subject;
                     soft alpha ramp at the contour; paper colour removed from edge pixels (decontamination)
  3. ML guide        rembg `isnet-general-use` mask: cuts SOFT pale material that the model also calls background
                     and that touches the outside (painted ground shadows); real holes (donut) are confirmed by it.
                     Strongly coloured pixels are never cut.
  4. frame           trim, scale so the longest side = fit * size (default 88%, like an emoji in its em-box),
                     centre on a size x size transparent canvas (premultiplied resampling: no fringes)
  5. encode          lossy WebP, quality 85, alpha quality 100
  6. QA row          qa.csv: alpha %, hole candidates, holes punched, % cut by ML, agreement with ML, edge fringe,
                     FLAG column. A person must look at every FLAG and at the contact sheet (sheet.py) before approval.
Modes per asset (overrides file): hybrid (default) | classical (white/pale subjects: ball, eye, flower) |
                                  soft (glows)      | exclude  (scenes/patterns that are not cut-outs).
"""
import argparse, csv, io, json, os, sys, glob
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
from skimage import color

T_LOW, T_HIGH, T_BG, T_HOLE = 4.0, 12.0, 7.0, 2.6     # CIELAB distance thresholds (ramp, flood, "is real paper")
ML_T, D_T = 0.6, 26.0                                   # conservative ML guide; raise only per asset, check the sheet

def load_rgb(path):
    im = Image.open(path)
    if im.mode == 'RGBA':
        bg = Image.new('RGBA', im.size, (247, 243, 234, 255)); bg.alpha_composite(im); im = bg
    im = im.convert('RGB'); s = 1024 / max(im.size)
    if s != 1: im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    return np.asarray(im).astype(np.float32) / 255.0

def paper_field(rgb, k=12):
    h, w, _ = rgb.shape
    top, bot = np.median(rgb[:k], axis=0), np.median(rgb[-k:], axis=0)
    lef, rig = np.median(rgb[:, :k], axis=1), np.median(rgb[:, -k:], axis=1)
    y = np.linspace(0, 1, h)[:, None, None]; x = np.linspace(0, 1, w)[None, :, None]
    return 0.5 * (top[None] * (1 - y) + bot[None] * y + lef[:, None] * (1 - x) + rig[:, None] * x)

def matte(rgb, ml=None, mode='hybrid'):
    B = paper_field(rgb); labB = color.rgb2lab(B); d = np.sqrt(((color.rgb2lab(rgb) - labB) ** 2).sum(2)); h, w = d.shape
    info = dict(hole_candidates=0, holes_punched=0, ml_cut=0.0, iou=float('nan'), fringe=0.0)
    if mode == 'soft':
        t = np.clip((d - 2.0) / 12.0, 0, 1); alpha = ndi.gaussian_filter(t * t * (3 - 2 * t), 1.0); alpha[alpha < 0.02] = 0
        a = alpha[..., None]; Fc = np.clip(np.where(a > 0.02, (rgb - (1 - a) * B) / np.maximum(a, 0.02), rgb), 0, 1)
        return Fc, alpha, info
    cc, _ = ndi.label(d < T_BG)
    ids = np.unique(np.concatenate([cc[0], cc[-1], cc[:, 0], cc[:, -1]])); ids = ids[ids > 0]
    subj = ~np.isin(cc, ids)
    pl, pn = ndi.label((d < T_HOLE) & subj); regions = []
    for i in range(1, pn + 1):
        r = pl == i
        if r.sum() > 0.004 * h * w: regions.append(r); info['hole_candidates'] += 1
    subj = ndi.binary_opening(subj, iterations=1)
    l2, n2 = ndi.label(subj)
    if n2: subj = np.isin(l2, [i + 1 for i, s in enumerate(ndi.sum(subj, l2, range(1, n2 + 1))) if s > 0.0015 * h * w])
    if ml is not None and mode == 'hybrid':
        ll, _ = ndi.label(ml < ML_T)
        ids = np.unique(np.concatenate([ll[0], ll[-1], ll[:, 0], ll[:, -1]])); ids = ids[ids > 0]
        cut = ndi.binary_dilation(np.isin(ll, ids), iterations=1) & subj & (d < D_T)
        before = subj.sum(); subj &= ~cut; info['ml_cut'] = (before - subj.sum()) / max(before, 1)
        for r in regions:
            if (ml[r] < 0.1).mean() > 0.9: subj[r] = False; info['holes_punched'] += 1
        ms = ml >= 0.5; info['iou'] = (subj & ms).sum() / max((subj | ms).sum(), 1)
    di, do = ndi.distance_transform_edt(subj), ndi.distance_transform_edt(~subj)
    ramp = np.clip((d - T_LOW) / (T_HIGH - T_LOW), 0, 1)
    alpha = np.where(subj, np.where(di <= 3, np.maximum(ramp, 0.35 + 0.65 * np.clip(di / 3, 0, 1)), 1.0), 0.0)
    alpha = np.where((~subj) & (do <= 1.5), ramp * 0.6, alpha)
    alpha = np.clip(ndi.gaussian_filter(alpha, 0.7), 0, 1); alpha[alpha < 0.02] = 0
    a = alpha[..., None]; Fc = np.clip(np.where(a > 0.02, (rgb - (1 - a) * B) / np.maximum(a, 0.02), rgb), 0, 1)
    idx = ndi.distance_transform_edt(alpha <= 0.98, return_distances=False, return_indices=True)
    Fc = np.where(((alpha < 0.98) & (alpha <= 0.02))[..., None], Fc[idx[0], idx[1]], Fc)       # bleed colour outward
    e = (alpha > 0.05) & (alpha < 0.95)
    if e.sum() > 200: info['fringe'] = float((np.sqrt(((color.rgb2lab(Fc) - labB) ** 2).sum(2))[e] < 8).mean())
    return Fc, alpha, info

def frame(Fc, alpha, size, fit):
    ys, xs = np.where(alpha > 0.04); y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    c, a = Fc[y0:y1, x0:x1], alpha[y0:y1, x0:x1]; h, w = a.shape; s = size * fit / max(h, w)
    nw, nh = max(1, round(w * s)), max(1, round(h * s))
    pm = np.dstack([c * a[..., None], a]).astype(np.float32)
    r = np.dstack([np.asarray(Image.fromarray(pm[..., i]).resize((nw, nh), Image.LANCZOS)) for i in range(4)])
    a2 = np.clip(r[..., 3], 0, 1); c2 = np.clip(np.where(a2[..., None] > 1e-4, r[..., :3] / np.maximum(a2[..., None], 1e-4), 0), 0, 1)
    out = np.zeros((size, size, 4), np.float32); oy, ox = (size - nh) // 2, (size - nw) // 2
    out[oy:oy + nh, ox:ox + nw, :3], out[oy:oy + nh, ox:ox + nw, 3] = c2, a2
    return Image.fromarray((np.clip(out, 0, 1) * 255 + .5).astype(np.uint8), 'RGBA'), (nw / size, nh / size)

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('names', nargs='*'); ap.add_argument('--src', required=True); ap.add_argument('--dst', required=True)
    ap.add_argument('--overrides'); ap.add_argument('--no-ml', action='store_true'); ap.add_argument('--quality', type=int, default=85)
    ap.add_argument('--size', type=int, default=512); ap.add_argument('--fit', type=float, default=0.88); a = ap.parse_args()
    ov = json.load(open(a.overrides, encoding='utf8')) if a.overrides else {}
    modes, excl = ov.get('mode', {}), set(ov.get('exclude', []))
    names = a.names or [os.path.basename(f)[:-4] for f in sorted(glob.glob(os.path.join(a.src, '*.png')))]
    os.makedirs(a.dst, exist_ok=True); sess = None
    if not a.no_ml:
        try:
            from rembg import new_session, remove; sess = new_session('isnet-general-use')
        except Exception as e: print('ML guide unavailable, classical only:', type(e).__name__, file=sys.stderr)
    rows = []
    for n in names:
        if n in excl: rows.append(dict(name=n, mode='exclude', flag='NOT A CUT-OUT (scene/glow/pattern)')); continue
        mode = modes.get(n, 'hybrid'); rgb = load_rgb(os.path.join(a.src, n + '.png')); ml = None
        if sess is not None and mode == 'hybrid':
            m = remove(Image.fromarray((rgb * 255).astype(np.uint8)), session=sess).split()[3]; ml = np.asarray(m).astype(np.float32) / 255.0
        Fc, alpha, info = matte(rgb, ml, mode); im, (fw, fh) = frame(Fc, alpha, a.size, a.fit)
        im.save(os.path.join(a.dst, n + '.webp'), 'WEBP', quality=a.quality, method=6, alpha_quality=100, exact=False)
        flags = []
        if info['fringe'] > .45: flags.append('paper-coloured edge fringe')
        if ml is not None and info['iou'] < .92: flags.append('methods disagree (IoU %.2f): look' % info['iou'])
        if info['holes_punched']: flags.append('%d hole(s) punched: confirm' % info['holes_punched'])
        if info['hole_candidates'] > info['holes_punched']: flags.append('enclosed paper-like area kept: ok unless it is a real hole')
        if info['ml_cut'] > .08: flags.append('ML cut %.0f%%: check shape intact' % (info['ml_cut'] * 100))
        rows.append(dict(name=n, mode=mode, alpha_pct=round(alpha.mean() * 100, 1), kb=round(os.path.getsize(os.path.join(a.dst, n + '.webp')) / 1000, 1),
                         hole_candidates=info['hole_candidates'], holes_punched=info['holes_punched'], ml_cut_pct=round(info['ml_cut'] * 100, 1),
                         iou_vs_ml=round(info['iou'], 3), fringe_pct=round(info['fringe'] * 100, 1), flag='; '.join(flags)))
        print(n, mode, rows[-1]['kb'], 'KB', rows[-1]['flag'], flush=True)
    keys = ['name', 'mode', 'alpha_pct', 'kb', 'hole_candidates', 'holes_punched', 'ml_cut_pct', 'iou_vs_ml', 'fringe_pct', 'flag']
    with open(os.path.join(a.dst, 'qa.csv'), 'w', newline='', encoding='utf8') as f:
        wr = csv.DictWriter(f, keys); wr.writeheader(); [wr.writerow({k: r.get(k, '') for k in keys}) for r in rows]

if __name__ == '__main__': main()
