"""Tạo thumbnail webp + ảnh cận mặt + ảnh OG từ ảnh trong public/photos.
Chạy:  python3 scripts/prepare-images.py <thư mục public> <ảnh nguồn cắt mặt>"""
import sys, os, glob, json
from PIL import Image, ImageDraw, ImageFilter

pub, face_src = sys.argv[1], sys.argv[2]
photos = sorted(glob.glob(os.path.join(pub, 'photos', 'joy_*.jpg')))
meta = []
for f in photos:
    im = Image.open(f).convert('RGB')
    name = os.path.splitext(os.path.basename(f))[0]
    t = im.copy(); t.thumbnail((900, 1260), Image.LANCZOS)
    t.save(os.path.join(pub, 'photos', 'thumbs', name + '.webp'), 'WEBP', quality=80, method=6)
    # màu chủ đạo để làm placeholder
    r, g, b = im.resize((1, 1), Image.BOX).getpixel((0, 0))
    meta.append({'id': name, 'w': im.width, 'h': im.height, 'color': '#%02x%02x%02x' % (r, g, b)})
print(json.dumps(meta))

face = Image.open(face_src).convert('RGB').crop((190, 190, 1010, 1010))
face.resize((720, 720), Image.LANCZOS).save(os.path.join(pub, 'mochee-face.webp'), 'WEBP', quality=86, method=6)
face.resize((720, 720), Image.LANCZOS).save(os.path.join(pub, 'mochee-face.jpg'), 'JPEG', quality=86, optimize=True)
