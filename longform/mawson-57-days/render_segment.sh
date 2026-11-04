#!/bin/bash
# FRI run: bash render_segment.sh <k>   (k = 1..4) -> frames/ + seg<k>.mp4 (24 fps, video only)
set -e
cd "$(dirname "$0")"
N=$(node -e 'import("./web/timing.js").then(m=>console.log(m.TOTAL))')
k=$1; a=$(( N*(k-1)/4 )); b=$(( N*k/4 - 1 ))
echo "segment $k: frames $a-$b of $N"
mkdir -p node_modules && ln -sfn "$(npm root -g)/playwright" node_modules/playwright
RESUME=1 node render.mjs frames "$a-$b"
ffmpeg -v error -y -framerate 24 -start_number $a -i frames/f%04d.jpg -frames:v $((b-a+1)) -c:v libx264 -preset medium -crf 22 -pix_fmt yuv420p -r 24 seg$k.mp4
ffprobe -v error -show_entries stream=nb_frames,width,height -of compact seg$k.mp4
