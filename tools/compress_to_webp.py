#!/usr/bin/env python3
"""Convert all PNG/JPG under repo to WebP quality 80 and delete originals."""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
EXTS = {'.png', '.jpg', '.jpeg', '.jfif'}
QUALITY = 80

def main():
    before = after = 0
    n = 0
    for path in ROOT.rglob('*'):
        if not path.is_file() or '.git' in path.parts:
            continue
        if path.suffix.lower() not in EXTS:
            continue
        src = path.stat().st_size
        before += src
        with Image.open(path) as im:
            if im.mode in ('P', 'LA'):
                im = im.convert('RGBA')
            elif im.mode not in ('RGB', 'RGBA'):
                im = im.convert('RGBA' if 'A' in im.getbands() else 'RGB')
            out = path.with_suffix('.webp')
            im.save(out, format='WEBP', quality=QUALITY, method=6)
        after += out.stat().st_size
        path.unlink()
        n += 1
        print(f'{path.relative_to(ROOT)} -> {out.name} ({src//1024}KB -> {out.stat().st_size//1024}KB)')
    print(f'Done {n} files. {before/1024/1024:.2f}MB -> {after/1024/1024:.2f}MB')

if __name__ == '__main__':
    main()
