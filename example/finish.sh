#!/bin/bash
# frames + mix + captions -> out/napoleon_vs_the_rabbits.mp4, plus QA
set -e
cd "$(dirname "$0")"
mkdir -p out
N=$(ls frames/f*.jpg | wc -l); echo "frames: $N"
# captions are placed after the render, away from where the characters are (frames/bNNNN.json)
python3 make_ass.py work/words.json work/captions.ass frames
grep -v "^Dialogue: [12]," work/captions.ass > work/title_only.ass
ffmpeg -v error -y -framerate 30 -i frames/f%04d.jpg -i audio/mix.wav \
  -vf "ass=work/captions.ass:fontsdir=$HOME/.fonts,format=yuv420p" \
  -c:v libx264 -preset veryfast -crf 17 -profile:v high -r 30 \
  -af "volume=3dB,alimiter=limit=0.891:level=disabled" -c:a aac -b:a 256k -ar 48000 -ac 2 -shortest -movflags +faststart out/napoleon_vs_the_rabbits.mp4
ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate,nb_frames:format=duration -of compact out/napoleon_vs_the_rabbits.mp4
echo "--- freeze (>=0.4s) / black detect"
ffmpeg -v info -i out/napoleon_vs_the_rabbits.mp4 -vf "freezedetect=n=0.002:d=0.4,blackdetect=d=0.1" -an -f null - 2>&1 | grep -E "freeze_|black_" || echo "none"
echo "--- loudness"
ffmpeg -i out/napoleon_vs_the_rabbits.mp4 -af ebur128=peak=true -vn -f null - 2>&1 | grep -A12 "Summary" | grep -E "I:|Peak:"
ffmpeg -v error -y -i out/napoleon_vs_the_rabbits.mp4 -vf "fps=1/2,scale=216:384,tile=7x3" -frames:v 1 out/qa_sheet.jpg
