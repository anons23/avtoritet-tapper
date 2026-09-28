#!/usr/bin/env bash
# Конвертирует PNG/JPEG рейдов в WebP (quality 85–90).
# Запуск: bash scripts/compress-raid-images.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
Q="${WEBP_QUALITY:-88}"

if ! command -v python3 >/dev/null; then
  echo "нужен python3 + Pillow: pip install Pillow"
  exit 1
fi

python3 - <<PY
from pathlib import Path
try:
    from PIL import Image
except ImportError:
    raise SystemExit('Установи Pillow: pip install Pillow')

root = Path(r'''$ROOT''')
paths = [
    root/'assets/raids/fighters',
    root/'assets/raids/backgrounds',
    root/'assets/raids/ui',
]
q = int('$Q')
converted = 0
for folder in paths:
    if not folder.is_dir():
        continue
    for src in list(folder.glob('*.png')) + list(folder.glob('*.jpg')) + list(folder.glob('*.jpeg')):
        dst = src.with_suffix('.webp')
        im = Image.open(src)
        if im.mode not in ('RGB', 'RGBA'):
            im = im.convert('RGBA' if 'A' in im.getbands() else 'RGB')
        im.save(dst, 'WEBP', quality=q, method=6)
        b, a = src.stat().st_size, dst.stat().st_size
        print(f'{src.name}: {b//1024}KB → {a//1024}KB')
        converted += 1
print(f'Готово: {converted} файлов → WebP (quality={q})')
print('Дальше: залей .webp в GitHub (код уже на .webp). PNG можно оставить как бэкап.')
PY
