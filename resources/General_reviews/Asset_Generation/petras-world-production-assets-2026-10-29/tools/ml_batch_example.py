# EXAMPLE ONLY: paths below are from the sandbox where this was run (/home/claude/...). Edit the folders before use.
import os, sys, time, glob
from PIL import Image
from rembg import remove, new_session
B='/home/claude/Games-for-kids/resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/'
OUT='ml_isnet-general-use'; os.makedirs(OUT,exist_ok=True)
sess=new_session('isnet-general-use'); t0=time.time(); done=0
for f in sorted(glob.glob(B+'*.png')):
    n=os.path.basename(f)[:-4]
    if os.path.exists(f'{OUT}/{n}.png'): continue
    if time.time()-t0>235: break
    im=Image.open(f); 
    if im.mode=='RGBA':
        bg=Image.new('RGBA',im.size,(247,243,234,255)); bg.alpha_composite(im); im=bg
    remove(im.convert('RGB'),session=sess).save(f'{OUT}/{n}.png'); done+=1
total=len(glob.glob(B+'*.png')); have=len(glob.glob(OUT+'/*.png'))
print(f"this batch: {done}  total done: {have}/{total}")
