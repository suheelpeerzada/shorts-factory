#!/bin/bash
# One-time setup per cloud run: bash tools/setup.sh   (run from the repo root)
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CACHE="$HOME/.shorts-cache"; mkdir -p "$CACHE"
# three.js (vendored in example/web if present, else npm)
if [ ! -f "$ROOT/example/web/three.module.js" ]; then
  (cd "$CACHE" && npm init -y >/dev/null && npm i three@0.160.0 --silent) && cp "$CACHE/node_modules/three/build/three.module.js" "$ROOT/example/web/"
fi
# Playwright (pre-installed globally in the cloud image)
mkdir -p "$ROOT/example/node_modules"; ln -sfn "$(npm root -g)/playwright" "$ROOT/example/node_modules/playwright"
# Python deps
python3 -c "import faster_whisper" 2>/dev/null || pip install --break-system-packages -q faster-whisper
python3 -c "import PIL, numpy, scipy" 2>/dev/null || pip install --break-system-packages -q pillow numpy scipy
# Whisper small (CTranslate2 int8) from npm (Hugging Face is blocked)
M="$CACHE/whisper-small"
if [ ! -f "$M/model.bin" ]; then
  mkdir -p "$M" "$CACHE/dl" && cd "$CACHE/dl"
  for i in 0 1 2 3; do npm pack "@skillninja/shortmovie-telop-model-p$i" --silent >/dev/null; mkdir -p "p$i"; tar xzf skillninja-shortmovie-telop-model-p$i-1.0.0.tgz -C "p$i"; done
  cp p0/package/*.json "$M/"
  cat p0/package/model.bin.part0 p1/package/model.bin.part1 p2/package/model.bin.part2 p3/package/model.bin.part3 > "$M/model.bin"
  echo "$(cat p0/package/model.sha256)  $M/model.bin" | sha256sum -c -
fi
# Fonts
mkdir -p "$HOME/.fonts"
for f in Montserrat-Black Montserrat-ExtraBold; do
  [ -f "$HOME/.fonts/$f.ttf" ] || curl -sSfL -o "$HOME/.fonts/$f.ttf" "https://raw.githubusercontent.com/JulietaUla/Montserrat/master/fonts/ttf/$f.ttf"
done
fc-cache -f >/dev/null
echo "setup ok. whisper model: $M"
