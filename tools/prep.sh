#!/bin/bash
# prep.sh <project> -> cover + post copy, pushed to media branch; prints commit-pinned URLs
set -e; p=$1; cd ~/shorts/$p
mp4=$(ls out/*.mp4 | grep -v post.mp4 | head -1)
ffmpeg -v error -y -i frames/f0048.jpg -vf "setpts=PTS+1.6/TB,ass=work/title_only.ass:fontsdir=$HOME/.fonts" -frames:v 1 -q:v 2 out/cover.jpg
ffmpeg -v error -y -i $mp4 -c:v libx264 -preset veryfast -crf 23 -c:a copy -movflags +faststart out/post.mp4
cd /home/claude/shorts-factory; git checkout -qf --orphan tmpmedia; git rm -rqf --cached . ; mkdir -p m
cp ~/shorts/$p/out/post.mp4 m/$p.mp4; cp ~/shorts/$p/out/cover.jpg m/$p.jpg
git add -f m/$p.mp4 m/$p.jpg; git commit -qm media; git push -qf origin tmpmedia:media 2>&1 | grep -v -e negotiation -e acknowledgments || true
sha=$(git rev-parse HEAD); rm -rf m; git checkout -qf main; git branch -D -q tmpmedia
U=https://raw.githubusercontent.com/suheelpeerzada/shorts-factory/$sha/m
echo "$U/$p.mp4 $(curl -s -o /dev/null -w %{http_code} -r 0-10 $U/$p.mp4)"; echo "$U/$p.jpg"
