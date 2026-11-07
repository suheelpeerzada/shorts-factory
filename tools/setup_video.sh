#!/bin/bash
# copy the shared kit into a video project (keeps the video's own worlds/, scenes.js, plan.json)
V=$1; K=/root/you4/kit
mkdir -p /root/you4/$V/src/worlds /root/you4/$V/public
cp -r $K/src/lib /root/you4/$V/src/; cp $K/src/Stage.jsx $K/src/Overlays.jsx $K/src/Full.jsx $K/src/index.jsx $K/src/clip.js /root/you4/$V/src/
cp $K/src/worlds/common.js /root/you4/$V/src/worlds/common.js
cp $K/package.json $K/package-lock.json /root/you4/$V/
cp /root/you4/$V/audio/mix.wav /root/you4/$V/public/voiceover.wav
python3 /root/you4/tools/make_times.py $V
