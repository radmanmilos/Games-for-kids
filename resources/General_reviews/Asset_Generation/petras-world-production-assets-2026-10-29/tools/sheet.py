import sys, os
from PIL import Image, ImageDraw, ImageFont
def sheet(files, out, bg=(28, 38, 72), T=300, cols=4, labels=True):
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 18)
    rows = (len(files) + cols - 1) // cols; L = 26 if labels else 0
    S = Image.new('RGB', (cols * (T + 6) + 6, rows * (T + L + 6) + 6), (15, 15, 15)); d = ImageDraw.Draw(S)
    for i, f in enumerate(files):
        im = Image.open(f).convert('RGBA').resize((T, T), Image.LANCZOS)
        tile = Image.new('RGBA', (T, T), bg + (255,)); tile.alpha_composite(im)
        x = 6 + (i % cols) * (T + 6); y = 6 + (i // cols) * (T + L + 6)
        S.paste(tile.convert('RGB'), (x, y))
        if labels: d.text((x + 4, y + T + 2), os.path.splitext(os.path.basename(f))[0], fill=(255, 255, 255), font=font)
    S.save(out)
if __name__ == '__main__':
    bg = tuple(int(v) for v in sys.argv[2].split(',')); sheet(sys.argv[3:], sys.argv[1], bg)
