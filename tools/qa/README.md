Headless logic check for a video project (no rendering). Usage:
  cd tools/qa && npm i three@0.170.0 --no-save && PROJ=/path/to/video ./qa.sh name
Builds every location in scenes.js with real three.js inside Playwright Chromium (remotion/react/postprocessing stubbed),
steps update()+camera at 6 Hz, prints "<id> ok (...)" or the error.
