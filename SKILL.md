---
name: animated-3d-story-short
description: Make a vertical animated 3D-world story short (narrator + character voices, 2D stick characters acting inside detailed toon 3D scenes, one-word captions) built in the cloud as a Remotion project and rendered on the owner's PC.
---

# Animated 3D story short — the rules

Follow every rule. They are what made the lighthouse short work. Reference build: `examples/lighthouse_v2/` in the repo
`suheelpeerzada/shorts-factory` (kit: `remotion_kit/`).

## 1. Who does what
- Claude writes, voices, times and builds the whole project in the cloud. **Never render video in the cloud** (not even
  test frames). Rendering happens on the owner's PC (RTX 3050) by double-clicking a .bat file.
- Character sprites (2D canvas drawings) may be drawn in the cloud with Playwright to check faces and poses. That is not a
  video render.
- After the owner renders, Claude pulls frames from the mp4 on the laptop and checks them (section 13).

## 2. Story and script
- Format: 1080x1920, 30 fps, 35–50 s. Plain spoken English, sentences of 6–15 words, years and numbers in digits.
- The first sentence is the whole hook: the stakes or the strangest fact, said flat, under 12 words, no setup.
  A "you" premise works ("Imagine you get hired to run a lighthouse... with one rule.").
- Structure: hook → one line of context → 2–4 escalating beats → pivot ("You see," / "But...") → payoff as the last words.
  The last line loops back to the first.
- Open one loop by 5 s and pay it off only at the end.
- 1–3 short character lines, quoted inside the story (a rule, a plea, a shout). Each character's line is their own voice.
- Something visual or audible changes at least every 4 s. A new picture about every 2 s is better.
- Never describe what the viewer already sees.
- True stories: verify every key fact with a web search, and call legends legends ("the story goes").

## 3. Voices and audio
- ElevenLabs connector, model `eleven_v4`, `generations_count: 1`. Check credits first (`estimate_only: true`). Never retry
  a generation call. Poll `creative_get_flow_run_status`, then download `content_url`. The domains
  `elevenlabsusercontent.com` and `api.elevenlabs.io` are allowed.
- The narrator is always Henry, `pVnrL6sighQX7hVz89cp`.
- Each character gets a fitting voice from the board's `voices/cast` doc. The same character keeps the same voice forever,
  recorded in `cast.assignments`.
- Direct the read with v4 audio tags placed right before the words they colour. Strip every tag from the caption text.
- Generate one clip per line in speaking order. Trim pauses longer than 0.3 s.
- Build `public/voiceover.wav` (48 kHz) with the music and SFX mixed in, at about −14 LUFS.
- Word timings: run faster-whisper on the voice. Decode audio with ffmpeg into a float32 numpy array and pass the array,
  because the `av` loader fails. Align with the script using difflib, and keep the words actually said.

## 4. Timing file (`src/times.js`)
- `WORDS = [{w, s, e, sp, line}]` in seconds, where `sp` is the speaker id (NARRATOR, KEEPER, …).
- `w(line, regex)` returns a word's start time, and every event is keyed to it.
  - Anchor the regexes. `'^Light$'` is needed, because `'^Light'` also matches "Lighthouse!".
  - Before shipping, check that every `w()` call in the worlds resolves (it throws otherwise).
- `talking(t, sp)` is true while that speaker is saying a word. It drives the mouths.
- `LOCS = [[start, end, id]]` holds the locations. `INNER_CUTS` holds hard cuts inside a location.
- `SPEAKER_COLORS`: narrator `#ffffff`, then one colour per character (keeper `#ffd23a`, captain `#6fe0ff`).
- `TITLE = {lines: [...], part: null | n, until: 1.9}`.
- `src/clip.js`: `CLIP = null` renders the whole video; `[start, end]` renders a test window. For a test window, slice
  `voiceover.wav` to the same range with `afade` in 0.05 s and out 0.2 s.
- Switch expressions and gestures 0.05–0.1 s before their word.

## 5. Title card, captions, thumbnail (`src/Overlays.jsx`)
- **Title card** for the first 1.9 s, full screen over the scene on `rgba(0,0,0,0.45)`:
  - Montserrat Black / Arial Black, weight 900.
  - Lines at 110 px in white; the last line at 150 px in `#ffd23a`; 10 px black stroke (`paintOrder: stroke fill`).
  - Each line pops in 0.12 s after the previous one, with a slow 5 % push.
  - Fades out over the last 0.2 s.
  - Series parts add a `PART n` badge: `#c9353a`, 64 px, 6 px black border, radius 16.
- **Captions**, one word at a time, no box:
  - Same font, 118 px, 9 px black stroke, shadow `0 8px 16px rgba(0,0,0,0.55)`.
  - Placed at 67 % height (bottom) or 14 % (top), whichever side the subject is NOT on: each word projects the camera's
    focus point to the screen (subject above y = −0.18 in NDC → bottom, else top), smoothed by a majority of 5 words in
    the same location; a camera can force it with `cap: 'top'|'bottom'` (close-ups of papers and ledgers → top).
    Captions must never cover the main content. UPPERCASE, trailing `, ; :` removed, in the speaker's colour.
  - Each word pops from 0.7× to 1.08× over 0.07 s and settles 0.08 smaller.
  - A word shows from 0.03 s before its start until the next word, and hides 0.45 s after its end.
  - Captions start after the title card.
- **Thumbnail** is the frame at 1.6 s (the full title card). Never reveal a series' total number of parts or a release
  time anywhere.

## 6. Look (house style)
- Real 3D worlds of painted, flat-colour toon models with 2D characters standing inside them.
- Every label lives inside the world: signs, boards, notes, chalkboards, gauges. Nothing is pasted on the screen except the
  title card and captions.
- **Toon shading** (`lib/toon.js`): 3-band gradient (110/190/255, nearest filter) on `MeshToonMaterial`.
- **Ink:** one colour for every outline, `#351f22`, made of an inverted hull (×1.9) plus edge lines.
  - Weights: props 0.01–0.03, buildings and large rocks 0.04–0.06, `outline: 0` on room shells.
- **Textures** are canvas-painted with wear (`paintTexture` kinds planks, metal, asphalt, grass, shingles, hazard), plus
  `brickTex`, and `patternTex` for rugs, clocks, rain drops and glitter.
- **Glowing things** (lamps, windows, lens, eyes, dials) use `MeshBasicMaterial` with `toneMapped: false, fog: false`
  and a `PointLight` next to them.
- **Light beams and shafts** are open cylinders with additive blending, `depthWrite: false`, opacity 0.11–0.16, plus a
  real `SpotLight` that casts shadows.

## 7. Scenes must be detailed (3 depth layers in every shot)
- **Foreground:** something close to the lens (railing, console, lever, desk edge, ropes), blurred by depth of field.
- **Midground:** a fully dressed set. Never leave a bare wall or empty floor.
  - Rooms: ceiling beams, corner posts, shelves of books, jars and bottles, a stove with a glowing grate and a kettle,
    a ladder to a hatch, a swaying hanging lamp that casts shadows, a rug, crates, a barrel, a rope coil, a bucket, a map,
    a clock, notes, a chalk tally, a coat on a hook, papers, and rain running down the window.
  - Exteriors: the hero building with real structure. The lighthouse has brick bands, windows up the tower, a door with a
    lamp, a gallery with a grated floor, brackets, a double railing and posts, glass panes with frames, a lens inside, a
    dome, a vent ball and a lightning rod.
  - Exterior surroundings: a cottage with a chimney and a lit window, a waving flag, rocks with foam rings and seaweed,
    a jetty with posts, lamp posts, barrels, a rowboat and rope.
- **Background:** a glitter path on the sea toward the moon or sun, a distant coastline with lit windows, painted clouds,
  and 3–4 fog banks at different depths that slowly drift and turn to face the camera.
- **Moving life:** the sea texture scrolls; foam and ripples pulse; flags wave; lamps and fires flicker; ships bob and roll;
  rain falls; bubbles rise; dials flicker; sparks fly on impacts.
- **Time of day per scene:** sky gradient, sea colours, lights and fog all change together (section 9).

## 8. Characters (`lib/char.js` v2)
- **Design:** Ricks-Clips-like. A big round head (radius 74 on a 320×560 canvas drawn at ×3) sits ON the body. It is
  drawn over the top of the body, with no neck gap.
  - Body: a rounded coat rectangle (±44 px, radius 16), with a darker `jacket2` on one side for volume.
  - Legs and arms: bold smooth black stick limbs (legs 11 px, arms 10 px), round caps, drawn as curves through a knee or
    elbow.
  - Hands: small round skin-coloured hands with a 4.5 px outline; fists get a crease line. Black ellipse shoes.
  - Outlines: 8.5 px with a hand-drawn wobble.
  - Arms are drawn last, so they can cross in front of the body and face.
- **One signature item per character**, plus an outfit that fits the job:
  - Outfits: `sweater` (rib lines + hem), `coat` (gold buttons + belt), `raincoat` (seam + clasps), and the default suit
    (collar + tie, office people only).
  - Hats: `peaked` (keeper or captain, with a badge), `beanie` (darker cuff colour, not cream, or it reads as a headband),
    `cap`, `bowler`.
  - Old people: `{old: true, beard, moustache, brows}`, which gives a bald dome, white tufts, bushy white brows, a walrus
    moustache and wrinkles.
- **Faces act every line** (`expr`): neutral, alarmed, shout, scared (with a sweat drop), grin, smug, sad, angry, calm.
  Never leave a shouting or scared character on a calm face. Mouths open with `talk`; `shout` is always wide open.
- **Hands use things.** Every character line and reaction gets a gesture from the timeline:
  `opts.gesture = [[t, name, {prop, hand, angle, at}], ...]` (blends over 0.22 s, deterministic per frame).
  - Gestures: idle talk talk2 point pointL fists scared hips shrug wave hold holdR lantern lift mouth facepalm reach grip.
  - Props drawn in the hand: lantern, radio, mug, key, book, spyglass, bottle, counter, phone, candle, paper.
  - More gestures: reachL, salute, counter (clicks), phone (handset at the ear), wag (finger), push, carry, wipe.
  - Animals: `lib/bear.js` draws a bear in the same ink style (cub or adult; idle, carry, hold, salute, wave, drink, wrestle).
  - The keeper points while holding a lantern in the other hand; the captain holds a radio to his mouth; you point at the
    radio or the log and grab your face when scared.
- **Using 3D tools** (`grip`): put the character directly behind the tool, facing the camera. Each frame, cast a ray from
  the camera to the 3D handle, intersect it with the character's plane, convert with `localToCanvas()`, and pass it as
  `at`. The hands then follow the handle (the lever flip and the slam).
- Arms reach only about 0.43 m from the shoulder (shoulder at about 0.67 × height), so place handles within reach.
- **In the world:**
  - `makePerson(P, {tint})` tints the sprite to the scene light: night `#c9d4ee`, dusk `#ffe2cf`, day `#ffffff`, warm
    interior `#fff1e0`, beside a blazing lamp `#ffe9c4`, a ship in fog `#d2dcef`.
  - Sprites cast real shadows (`customDepthMaterial` and `customDistanceMaterial` with the canvas map, alphaTest 0.45),
    plus a soft contact blob.
  - The sprite turns toward the camera, with yaw clamped to ±0.7.
  - The face centre is at about 0.83 × height (1.72 m tall, so about 1.43 m above their feet).
- Walking: stride about 1.6 Hz, legs swing, arms counter-swing.

## 9. Lighting and post (`Stage.jsx`)
- `ThreeCanvas` with shadows flat, vertical FOV 80, near 0.1, far 1200, ACES tone mapping at exposure 1.12.
- Owner wants strong light and shadows: key light × 1.45 (`LIGHT_BOOST`), hemisphere × 0.78 (`SHADOW_DEPTH`), a rim light
  from behind at 0.4 × key (hemisphere sky colour), key shadows 4096 with radius 3, bias −0.0006, normalBias 0.03.
  Every point/spot light × 1.25, and the 3 brightest (≥ 6) cast shadows (1024 maps); `userData.noShadow` opts a light out.
- **Night:**
  - Hemisphere `#3a5078`/`#0a1018` at 0.55; moon key `#9fb4d8` at 0.9; fog `#0d1729` 40→300.
  - Sky `#050913` → `#121e36` → `#24324c` with stars and a moon disc plus halo.
- **Dusk:**
  - Hemisphere `#c99ab8`/`#3a3050` at 0.95; low sun key `#ffb27a` at 1.7; fog `#b98896` 70→420.
  - Sky `#2c2d5e` → `#b5647f` → `#f2a36a` with a big sun.
- **Morning:**
  - Hemisphere `#d6e4ef`/`#7f8f9a` at 1.1; key `#fff0d4` at 2.2; fog `#cfe0ea` 70→420.
  - Sky `#6f9fcf` → `#bcd6e6` → `#f1e6cc`.
- **Interiors:** dim hemisphere (about 0.4) and a weak cold key. The warm practical lights do the work: an oil lamp, a
  hanging lamp with shadows, a stove, and the radio dial. The lantern light pours through the hatch when it's on.
- **Post:** depth-of-field pass, then bloom, hue/saturation, brightness/contrast, and vignette (offset 0.32, darkness 0.38).
  - Night: bloom 1.25, threshold 0.55, saturation +0.18, contrast +0.08.
  - Day: bloom 0.6, threshold 0.8, +0.12, +0.06. Dusk: bloom 0.8, threshold 0.7.
  - Depth of field: bokeh 2.6, resolution 0.5. Focus range about 2–2.5 for close-ups and interiors, 4–5 for medium shots,
    8–14 for wide shots. Always pass a `focus` point (the face or object that matters).

## 10. Camera
- One `cameraPath([{t, pos, look}])` per shot. It's a centripetal Catmull-Rom curve timed with `warpU`, with keys on word
  times. The camera is always moving: drift, push-in, crane, swoop, never a locked frame.
- A location with several shots uses one camera function that switches paths at its inner cuts.
- **Close-ups:** 1.6–3 m from the face, with the look target on the face.
- **Impacts** (a shout, a slam, a flip) get a shake: amplitude 0.02–0.06, decaying over 0.25–0.4 s.
- Chaos scenes (a deck in a storm) get a handheld wobble of about 0.03.
- **Never put the camera inside an additive light cone.** It washes the whole frame out. Keep it at least the cone radius
  to the side, and the same for glowing shafts.
- Check sight lines: window bars, posts and walls must not block the subject. The ending eyes need a clear window, with no
  centre bar. A character the camera shouldn't see sits behind the camera plane.

## 11. Cuts
- A black dip `#05070d` with a 0.09 s half-width at every location change and inner cut.
- A cream dip `#f3ead6` with a 0.3 s half-width for a time skip ("Next morning").
- Fade to black over the last 0.35 s.
- Each location is a `<Sequence>` with its own `<Stage build cam t0>`. The same world builder can serve several sequences
  through an id (`makeRoom('room3')`, `makeExterior('night', 'beam')`).

## 12. Code rules (bugs already hit)
- `Object3D.add()` returns the parent, so never chain `.scale` or `.position` onto `g.add(...)`. Create the mesh, set it,
  then add it.
- Everything must be deterministic per frame (Remotion renders frames out of order): no state carried between frames;
  blend from time only.
- Seeded random only (`rng(seed)`).
- Before hand-off, bundle-check with esbuild (`--bundle --packages=external --jsx=automatic --loader:.js=jsx`) and
  validate every word cue.
- Run every scene's logic headlessly before hand-off (Playwright page, real three, remotion/react/postprocessing
  stubbed): build each location and step its update + camera at 6 Hz; it must finish with no errors. Never create
  textures inside a per-frame update (redraw one canvas and set needsUpdate).
- Check new faces, gestures and props on a sprite sheet: bundle `char.js` with `three` aliased to a small stub, draw it
  with Playwright, and look at it.

## 13. Hand-off and rendering on the owner's PC
- Laptop folder: `C:\Users\suhee\Desktop\YT Shorts` (in the device shell it's `$HOME/mnt/YT Shorts`).
- Deliver each project as a tarball of `src/`, `public/` and the .bat file. Commit it to `YT Shorts\_handoff\` under a
  **new filename every time** (`_v2`, `_v3`…), because reusing a name delivers a stale copy. Check the md5 after.
- Deleting is off in the owner's folders, so tar can't overwrite files. Extract to `/tmp` on the device, then
  `cat` each file over the old one. Brand-new folders can be extracted directly.
- Folders:
  - Tests: `tests\<name>\` with `render_test.bat`.
  - Full videos: `tests\<name>\render_full.bat`, or daily jobs in `daily\<YYYY-MM-DD>_<HHMM>_<slug>\` rendered by
    `render_today.bat`.
- Every .bat file:
  - On first run, sets up a shared engine in `build\engine` (copies `package.json` and `package-lock.json`, then runs
    `npm install`).
  - Mirrors `src` and `public` into it with robocopy `/MIR`.
  - Runs `npx remotion render src/index.jsx Full out\silent.mp4 --gl=angle --concurrency=4 --image-format=jpeg --jpeg-quality=92 --crf=17`.
  - Muxes the voice in with `npx remotion ffmpeg -i out\silent.mp4 -i public\voiceover.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest <output>`.
  - Writes to `output\tests\` or `output\daily\` (daily jobs also get a cover jpg at 1.6 s), then opens the result.
  - Uses CRLF line endings, and prints "send Claude a screenshot" on failure.
- Package versions: Remotion 4.0.541, three 0.170, @react-three/fiber 9, postprocessing 6.
- Before a long render, ship a `preview_*.bat` that renders the `Preview` composition (2 frames per location via
  `<Freeze>`, `--sequence --scale=0.5`) so framing is checked in ~2 minutes; several jobs share one `render_<n>in1.bat`.
- **After the render:** on the laptop, use ffmpeg to tile 15 frames from the mp4 into one sheet, then stage and inspect
  it. Look for washed-out frames, bad framing, blocked subjects, invisible eyes or props, floating heads, wrong
  expressions, and empty sets. Fix them, then send a new test clip.

## 14. Publishing (when it's a daily job)
- Host the post copy and cover on the repo's `media` branch: an orphan commit with `git add -f`, raw URLs pinned to the
  commit SHA.
- Schedule it with Metricool (blogId 7873272, Asia/Calcutta) at 08:00 or 20:00:
  - YouTube: `type short`, category EDUCATION, not made for kids.
  - Instagram: `REEL`, shown on the feed.
  - Facebook: `REEL` with a title.
  - Include the cover and the first comment.
- Then clear `media` and update the board row.
