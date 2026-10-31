# EXAMPLE ONLY: paths below are from the sandbox where this was run (/home/claude/...). Edit the folders before use.
import io, glob, time, json, sys, statistics as st
import numpy as np
from PIL import Image
files=sorted(glob.glob('final512/*.png'))[::4]
def p32(im): b=io.BytesIO(); im.save(b,'PNG',optimize=True,compress_level=9); return b.getvalue()
def p8(im):
    q=im.quantize(256,method=Image.Quantize.FASTOCTREE,dither=Image.Dither.NONE); b=io.BytesIO(); q.save(b,'PNG',optimize=True,compress_level=9); return b.getvalue()
def wp(im,q,ll=False): b=io.BytesIO(); im.save(b,'WEBP',quality=q,lossless=ll,method=4,alpha_quality=100,exact=False); return b.getvalue()
def psnr(a,b):
    bg=Image.new('RGBA',a.size,(28,38,72,255)); A=bg.copy(); A.alpha_composite(a); B=bg.copy(); B.alpha_composite(b)
    x=np.asarray(A.convert('RGB')).astype(float); y=np.asarray(B.convert('RGB')).astype(float); m=((x-y)**2).mean(); return 99 if m==0 else 10*np.log10(255**2/m)
cfg={'PNG-32':p32,'PNG-8':p8,'WebP lossless':lambda i:wp(i,100,True),'WebP q90':lambda i:wp(i,90),'WebP q85':lambda i:wp(i,85),'WebP q80':lambda i:wp(i,80),'WebP q70':lambda i:wp(i,70)}
per={k:[] for k in cfg}; ps={k:[] for k in cfg}; t0=time.time()
for f in files:
    if time.time()-t0>240: break
    im=Image.open(f).convert('RGBA')
    for k,fn in cfg.items():
        d=fn(im); per[k].append(len(d))
        if k not in ('PNG-32','WebP lossless'): ps[k].append(psnr(im,Image.open(io.BytesIO(d)).convert('RGBA')))
n=len(per['PNG-32']); print(f"sample of {n} files, {time.time()-t0:.0f}s")
print(f"{'format':14s} {'mean KB':>8s} {'median':>8s} {'p90':>8s} {'max':>8s}  {'min PSNR':>9s} {'med PSNR':>9s}  {'x131 total MB':>13s}")
for k in cfg:
    v=sorted(per[k]); p=ps[k]
    print(f"{k:14s} {np.mean(v)/1e3:8.1f} {st.median(v)/1e3:8.1f} {v[int(.9*len(v))]/1e3:8.1f} {v[-1]/1e3:8.1f}  {(min(p) if p else float('nan')):9.1f} {(st.median(p) if p else float('nan')):9.1f}  {np.mean(v)*131/1e6:13.1f}")
json.dump(per,open('size_results.json','w'))
