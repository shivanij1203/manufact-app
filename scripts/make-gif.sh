#!/usr/bin/env bash
# Turns out/demo.webm into a cropped, palette-optimised GIF of just the panel (plus a
# little room below it for the detail to grow into), using out/demo.json from
# record-demo.mjs. The trim is anchored on the video itself: the first frame where the
# NeoGuard chip shows the selected accent tint (blue clearly above red, which the grey
# hover tint is not). The clip starts one landing hold before that and runs to the end.
# Usage: make-gif.sh <out dir> <gif path>
set -euo pipefail
OUT="$1"; GIF="$2"; PAD=16; FPS=12; SCAN_FPS=25
read -r X Y W H CX CY HOLD < <(node -e '
  const d = require(require("path").resolve(process.argv[1], "demo.json")), p = d.panel, pad = Number(process.argv[2]);
  const even = (n) => Math.round(n / 2) * 2;
  const x = Math.max(0, even(p.x)), y = Math.max(0, even(p.y));
  const w = Math.min(d.size.width - x, even(p.right - p.x)), h = Math.min(d.size.height - y, even(p.bottom - p.y + pad));
  console.log(x, y, w, h, d.chip.x, d.chip.y, d.hold);
' "$OUT" "$PAD")
SELECTED=$(ffmpeg -v error -i "$OUT/demo.webm" -vf "fps=${SCAN_FPS},format=rgb24,crop=1:1:${CX}:${CY}" -f rawvideo -pix_fmt rgb24 - \
  | od -An -tu1 -w3 -v | awk -v fps="$SCAN_FPS" '$3 - $1 >= 15 { printf "%.2f", (NR - 1) / fps; exit }')
[ -n "$SELECTED" ] || { echo "the NeoGuard chip never turned selected in the video" >&2; exit 1; }
END=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT/demo.webm")
read -r START DUR < <(awk -v s="$SELECTED" -v h="$HOLD" -v e="$END" 'BEGIN { st = s - h; if (st < 0) st = 0; printf "%.2f %.2f\n", st, e - 0.2 - st }')
FILTER="crop=${W}:${H}:${X}:${Y},fps=${FPS}"
ffmpeg -v error -y -ss "$START" -t "$DUR" -i "$OUT/demo.webm" -vf "${FILTER},palettegen=max_colors=128:stats_mode=diff" "$OUT/palette.png"
ffmpeg -v error -y -ss "$START" -t "$DUR" -i "$OUT/demo.webm" -i "$OUT/palette.png" \
  -lavfi "${FILTER}[v];[v][1:v]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle" -loop 0 "$GIF"
echo "neoguard selected at ${SELECTED}s of ${END}s; start=${START}s duration=${DUR}s crop=${W}x${H}+${X}+${Y} fps=${FPS}"
