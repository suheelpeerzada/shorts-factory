# Build pipeline (proven on "Napoleon vs. the Rabbits", 40.75 s, 14 shots)

Work in `~/shorts/<slug>/`: `cp -r example/* ~/shorts/<slug>/` then edit. Never edit `example/` itself.

## Files
- `web/main.js` engine: renderer, toon materials, painted canvas textures (`ctex`, `speck`), world builder (`add`, `box`, `tree`),
  sky dome + cloud billboards, light presets (`day`, `gold`, `night`), card system (people/rabbit/fx cards, contact blobs),
  passes colour (MSAA) -> normal/depth (cards = alpha mask) -> ink + grade -> DOF -> screen. `window.renderFrame(f)`.
  The WORLD section (between `// ---------- world ----------` and `// sky dome`) is story-specific: rewrite it per video.
  Keep `groups` (one group per place, toggled by `shot.place`), set pieces as pivoted groups driven from `worldAt(f)`.
- `web/story.js` story: `SHOTS` [{a,b,light,place}], `FLASHES`, `camAt(f)` (keys `[frame,pos,tgt,fov,roll]`, smootherstep, creep),
  `dofAt(f)`, `worldAt(f)`, `actorsAt(f)` returning cards. All pure functions of the frame.
- `web/cast.js` outfits + own drawings (rabbits, cabbage, hutch, bubble, cloud, exclaim, puff). Add new props/animals here in the
  same style: flat fills, `#241726` ink outline 6-8 px on a 512 canvas, soles at y = 490.
- `web/toon.js` character library (bean heads, faces, hats incl. `bicorne`, arms incl. `wave`, `whip`). `bodyFront` (front),
  `bodySide` (march/side). Expressions: neutral stern grin laugh whistle nervous shock relief relief_open dazed pained smile smile_closed lick.
- `render.mjs` Playwright + SwiftShader, `node render.mjs <dir> "0-1222"` (RESUME=1 to continue), ~3-4 s/frame at 1080x1920.
- `shot.mjs` screenshot a test page canvas (character test sheets).
- `audio/audio.py` cue table + synths (march, chase ostinato, music box, timpani, whoosh, boing, thunk, crack, patter, pop),
  `audio/mix.py voice.wav music.wav sfx.wav mix.wav` (music -6.0 dB vs voice gated RMS, SFX peaks <= 0.7x voice, -14 LUFS, -1 dBFS).
- `make_ass.py words.json captions.ass` title card + boxed captions. Edit the `PLAN` (chunks of 1-3 words; `*key*` yellow,
  `^num^` cyan, `!hero!` yellow box, `src=Display` to show digits) and the title card text.
- `finish.sh` frames + mix + captions -> out mp4, then freeze/black/loudness QA and `out/qa_sheet.jpg`.
- `tools/tr.py wav model out.json` faster-whisper word timestamps; align to the script with difflib (see example `work/align`).

## Steps
1. Timing: whisper words -> map script words onto them -> `work/words.json`. Total frames = round(duration * 30).
2. Shot plan: one shot per sentence; frame 0 is the hook image; vary MCU / wide / two-shot / insert / reaction; light changes for beats;
   6-frame white flash on time/place jumps; the twist gets a push-in with roll; the last physical payoff lands on the last word.
3. Build world + cast, render a character test sheet with `shot.mjs`, then stills at each shot middle
   (`node render.mjs stills/a "30,110,..."`) and a contact sheet (`ffmpeg ... tile=8x2`). LOOK at it. Fix: characters cut by the narrow
   frame (half-width at distance d = d * 0.2047 for fov 40), props in front of faces, flags/poles cluttering, dark night scenes, text mirrored.
4. Full render in the background; meanwhile write the audio cue table and captions plan; mix after picture timing is locked.
5. `finish.sh`, view `out/qa_sheet.jpg`, fix anything frozen/black.
