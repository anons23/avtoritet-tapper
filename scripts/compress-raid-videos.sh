#!/usr/bin/env bash
# Сжимает idle-видео рейдов без сильной потери качества.
# Запуск: bash scripts/compress-raid-videos.sh
# Опции: CRF=30 MIN_SAVE_PCT=10 bash scripts/compress-raid-videos.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIR="$ROOT/assets/raids/fighters"
CRF="${CRF:-30}"
MAX_H="${MAX_H:-720}"
MAX_FPS="${MAX_FPS:-24}"
MIN_SAVE_PCT="${MIN_SAVE_PCT:-10}"
DRY_RUN="${DRY_RUN:-0}"

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "ffmpeg не найден. Установи: sudo apt install ffmpeg"
  exit 1
fi
if ! command -v ffprobe >/dev/null 2>&1; then
  echo "ffprobe не найден."
  exit 1
fi

shopt -s nullglob
mapfile -t FILES < <(find "$DIR" -maxdepth 1 -type f \( -iname '*.webm' -o -iname '*.mp4' \) | sort)
if [[ ${#FILES[@]} -eq 0 ]]; then
  echo "Нет видео в $DIR"
  exit 0
fi

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

changed=0
echo "CRF=$CRF  MAX_H=$MAX_H  MAX_FPS=$MAX_FPS  MIN_SAVE_PCT=$MIN_SAVE_PCT%"
echo "---"

for src in "${FILES[@]}"; do
  name="$(basename "$src")"
  ext="${name##*.}"
  ext_lc="$(echo "$ext" | tr 'A-Z' 'a-z')"
  out="$tmp/$name"

  w="$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of csv=p=0 "$src" || echo 0)"
  h="$(ffprobe -v error -select_streams v:0 -show_entries stream=height -of csv=p=0 "$src" || echo 0)"
  fps_raw="$(ffprobe -v error -select_streams v:0 -show_entries stream=avg_frame_rate -of csv=p=0 "$src" || echo 24/1)"
  fps="$(python3 - <<PY
num,den=map(float,"$fps_raw".split('/')+[1,1][:2])
print(num/den if den else 24)
PY
)"

  scale_filter="scale=w='min(iw,trunc(ih*$MAX_H/ih/2)*2)':h='min(ih,$MAX_H)':force_original_aspect_ratio=decrease"
  # проще: ограничить высоту
  vf="scale=-2:'min(ih,$MAX_H)'"
  fps_arg=()
  if python3 -c "import sys; sys.exit(0 if float('$fps')>float('$MAX_FPS')+0.1 else 1)"; then
    fps_arg=(-r "$MAX_FPS")
  fi

  if [[ "$ext_lc" == "webm" ]]; then
    ffmpeg -y -i "$src" -an -c:v libvpx-vp9 -b:v 0 -crf "$CRF" \
      -deadline good -cpu-used 2 -row-mt 1 \
      -vf "$vf" "${fps_arg[@]}" "$out" 2>/dev/null
  else
    # mp4 → webm (лучше для веба) рядом, но по умолчанию перезаписываем в тот же контейнер h264
    ffmpeg -y -i "$src" -an -c:v libx264 -crf "$((CRF>23 ? CRF-5 : 23))" -preset medium \
      -vf "$vf" "${fps_arg[@]}" -movflags +faststart "$out" 2>/dev/null
  fi

  before="$(stat -c%s "$src")"
  after="$(stat -c%s "$out")"
  if [[ "$after" -ge "$before" ]]; then
    echo "SKIP  $name  (стало не меньше: $before → $after)"
    continue
  fi
  saved=$(( (before - after) * 100 / before ))
  if [[ "$saved" -lt "$MIN_SAVE_PCT" ]]; then
    echo "SKIP  $name  (экономия ${saved}% < ${MIN_SAVE_PCT}%)"
    continue
  fi

  echo "OK    $name  $before → $after  (−${saved}%)"
  if [[ "$DRY_RUN" == "1" ]]; then
    continue
  fi
  cp -f "$out" "$src"
  changed=$((changed+1))
done

echo "---"
echo "Заменено файлов: $changed"
exit 0
