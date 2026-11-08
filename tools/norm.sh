#!/bin/bash
# norm.sh in.wav out.wav : linear loudnorm to -14 LUFS, -1 dBTP, 48k mono
J=$(ffmpeg -hide_banner -i $1 -af loudnorm=I=-14:TP=-1:LRA=11:print_format=json -f null - 2>&1 | sed -n '/{/,/}/p')
MI=$(echo "$J"|python3 -c "import json,sys;d=json.load(sys.stdin);print(f\"measured_I={d['input_i']}:measured_TP={d['input_tp']}:measured_LRA={d['input_lra']}:measured_thresh={d['input_thresh']}:offset={d['target_offset']}\")")
ffmpeg -v error -y -i $1 -af loudnorm=I=-14:TP=-1:LRA=11:$MI:linear=true -ar 48000 -ac 1 $2
ffmpeg -hide_banner -i $2 -af ebur128 -f null - 2>&1 | grep -A3 Summary | grep "I:"
