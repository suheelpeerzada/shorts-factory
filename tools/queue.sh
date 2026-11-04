#!/bin/bash
# render + finish each project in order; safe to relaunch (RESUME skips done frames)
while pgrep -f "render.mjs frames" >/dev/null; do sleep 20; done
for p in "$@"; do
  cd ~/shorts/$p
  N=$(node -e "import('./web/story.js').then(m=>console.log(m.TOTAL))" 2>/dev/null)
  [ -z "$N" ] && N=$(grep -o "TOTAL = [0-9]*" web/story.js | grep -o "[0-9]*")
  have=$(ls frames 2>/dev/null | grep -c "^f.*jpg$")
  if [ "$have" -lt "$N" ]; then RESUME=1 node render.mjs frames "0-$((N-1))" > work/render.log 2>&1 || exit 1; fi
  [ -f out/done ] || { bash finish.sh > work/finish.log 2>&1 && touch out/done; }
  echo "$p finished"
done
