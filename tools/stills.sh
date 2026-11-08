#!/bin/bash
# stills.sh <proj> <outdir> t1 t2 ...   (half-scale stills of the Full composition at given seconds)
P=$1; O=$2; shift 2; mkdir -p $O; cd $P
BX=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
npx remotion bundle src/index.jsx --out-dir $O/bundle --log=error >/dev/null 2>&1 || { echo bundle failed; exit 1; }
for t in "$@"; do f=$(python3 -c "print(round($t*30))"); npx remotion still $O/bundle Full $O/s_$(printf %05.1f $t).jpg --frame=$f --scale=0.5 --gl=swangle --timeout=240000 --log=error --browser-executable=$BX >/dev/null 2>&1 || echo "fail $t"; done
cd $O && ffmpeg -v error -y -pattern_type glob -i 's_*.jpg' -vf "scale=270:-1,tile=6x3:color=black" -frames:v 1 sheet.jpg; ls s_*.jpg | tr '\n' ' '
