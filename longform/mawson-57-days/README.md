# 57 Days Stranded in Antarctica (long video, TRUE story)

Douglas Mawson's Far Eastern Party, 14 Dec 1912 - 8 Feb 1913. Standalone episode (no Part 2).
YouTube slot: Sunday 8 Nov 2026, 16:00 IST. Built by the THU "plan + build" run (5 Nov 2026 IST).

## Spec
- 1920x1080, 24 fps, **19,051 frames** (793.8 s, 13.2 min) = `web/timing.js` TOTAL.
- 12 voice chapters (INTRO + DAY 1, 2, 8, 16, 19, 26, 29, 35, 47, 50, 57), each preceded by a 1.5 s DAY-card gap
  (`work/chapters.json` has each chapter's start in seconds; the mix must place `voice/chNN.mp3` at exactly that offset).
- `work/words.json`: global word timings (ElevenLabs Scribe forced alignment, gaps included), `work/sentences.json`: sentence frames.
- 193 shots in `web/story.js` (shot starts are tied to sentence starts). Places: plateau, hut (Cape Denison + bay), deep (inside
  the crevasse), tent, cave (Aladdin's Cave), map (route board), card (DAY counter).

## Voice (ElevenLabs, Henry pVnrL6sighQX7hVz89cp, eleven_v4, 1 take per chapter, ~11.4k credits)
All 12 chapters are generated on ElevenLabs flow `sbjWonj5slWAVrbpAwTK`. Generation ids are in `work/chapters.json`.
**The mp3s are NOT in the repo yet:** this run's network proxy refused `elevenlabsusercontent.com` (HTTP 403 on CONNECT), so the
files could not be downloaded. Before the SAT assemble run: fetch each generation (re-read its signed URL with
`creative_get_flow_run_status` on the flow + session ids, or from the ElevenLabs history) into `voice/chNN.mp3` and commit with
`git add -f` (mp3 is in .gitignore). Do NOT regenerate (that costs credits again and changes the timing).

Session ids (flow sbjWonj5slWAVrbpAwTK): ch00 aG5Ljbpje2bFmqXKI175, ch01 ibzS4OvB8oVho1Pq6sgA, ch02 5lnTbd5YZ2010ZCZKlzV,
ch03 IJdvkSEzHqcjRQWgvKzA, ch04 mbja2xtuslpFFf06PLz4, ch05 HdoT1XUCVK9dIyRBNEJE, ch06 cgCC30JokOEV4snWGmbf,
ch07 TRQgksy8S5ry8O3F1vd7, ch08 z85kpzNaaBOUAAh7He8i, ch09 yWaLlYzKVG0RPU2gMXht, ch10 W3hsStFA5Z9yydCB7jzR, ch11 7boFI9uwA4K1ODGZ2mb1.

## Runs
- FRI segment k (1..4): `bash tools/setup.sh` (repo root), then `bash longform/mawson-57-days/render_segment.sh k`
  (frames floor(N*(k-1)/4) .. floor(N*k/4)-1, ~2.8 s/frame, ~3.7 h each), push `seg<k>.mp4` to branch `lf-seg<k>`.
- SAT: concat seg1-4, mix voice chapters at their offsets + music bed (-6 dB) + SFX (whoosh+slam at every DAY card:
  card shots start at CH[n]-36 frames, the slam lands 4 frames later), small bottom captions from `work/words.json`, thumbnail
  (DAY 1 fresh Mawson vs DAY 57 gaunt Mawson, yellow tag "IN ANTARCTICA"), description with chapter timestamps (from chapters.json).

## Fact sheet (verified Nov 2026: Wikipedia "Far Eastern Party", Australian Antarctic Division "Mawson's Huts" pages)
Left Cape Denison 10 Nov 1912 with Ninnis, Mertz, 17 dogs. Ninnis fell 14 Dec ~1 pm, ~500 km out, with the sledge carrying the
tent, most food, all dog food; ledge ~45 m (150 ft) down. Inland route back, dogs eaten (George first, last dog Ginger 29 Dec).
Mertz's last diary entry 1 Jan 1913; died ~2 am 8 Jan (vitamin A from husky liver is the leading theory, disputed). Mawson cut
the sledge in half, soles of his feet came off 11 Jan, crevasse fall on 17 Jan (rope ladder afterwards). Cairn found 29 Jan, McLean,
Hurley and Hodgeman had left that morning; Aladdin's Cave 1 Feb (oranges, pineapple), week-long blizzard, home 8 Feb 1913 hours
after the Aurora left; recalled by wireless but could not land a boat; second winter, home 1914. Hillary quote from his 1976 foreword.
"Which one are you?" is reported (anecdote), told as "reportedly".

## Strategy card
- Angle: day-by-day survival countdown with a cruel twist (missed the ship by hours). Hook: "In 1912, three men walked into Antarctica. Only one walked out."
- Title: **57 Days Stranded in Antarctica** - alt: "He Survived 57 Days Alone... Then Missed His Ship By Hours".
- Open loops: the ship deadline (Day 8 -> Day 57), "remember that liver" (Day 2 -> Day 16).
- Ending: "Which day would you have given up?" (first comment the same question).

## Files
- `web/` engine (`main.js`), shot table (`story.js`), cast (`cast.js`, `toon.js` + new `hood`), timing (`timing.js`, generated).
- `render.mjs` (1920x1080), `render_segment.sh` (FRI), `contact_*.jpg` stills contact sheets (one still per shot, mid-shot).
- `audio/`, `make_ass.py`, `finish.sh` are still the example kit copies (Napoleon short, 30 fps 9:16): the SAT run rewrites the
  cue table, the caption plan (16:9, small bottom captions, 24 fps) and the finish/encode step for this video.
- `script_tagged.txt` (what was voiced, with v4 audio tags), `script.txt` (clean), `voice/chNN.txt` (per-chapter prompts),
  `voice/chNN.words.json` (per-chapter word timings).
