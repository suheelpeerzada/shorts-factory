# Shorts Factory Playbook

Read this whole file before doing anything. It is the standing brief for every automated run of the
"wait, it actually happened" history-shorts channel (YouTube Shorts + Instagram Reels).

## 0. Fixed facts

| Thing | Value |
|---|---|
| Owner | Suheel (Asia/Calcutta, IST). He does nothing by hand; runs are fully automatic. |
| Instagram | @waititactuallyhappened (via Metricool) |
| YouTube | channel UCSAEWVUBQz0llK9nzl6smvQ (via Metricool) |
| Metricool brand (blogId) | 7873272, timezone Asia/Calcutta |
| Production board (artifact) | https://claude.ai/artifact/LRCFDndSkAeADNZW5NNKj1, collection `videos`, plus `learnings` |
| Voice | ElevenLabs "Henry - Deep, Professional, and Soothing", voice_id `pVnrL6sighQX7hVz89cp`, model `eleven_v4` with audio tags, `generations_count: 1` (Creator plan, 121k credits/month) |
| Posting slots (IST, both platforms) | Shorts: 10:00 and 18:00 = standalone, 15:00 = the daily part of the running multi-part series (Metricool best-time data). 3 shorts/day ~63k credits/month. Plus ONE weekly long video on YouTube, Sunday 16:00 IST (section 7), ~45k credits/month. Total ~108k of 121k. (Older queued rows may hold 12:00 slots; respect them, but never create new 12:00 slots.) |
| Video spec | 1080x1920, 30 fps, 35-50 s, H.264 + AAC, voice unchanged |
| Storage | Cloud only. Never copy anything to the owner's laptop. Posting copies live on the `media` branch only until Metricool has copied them (minutes), then the branch is cleared. |

## 1. Production cadence

One production run per day (11:07 IST) makes TOMORROW's shorts: up to three videos, one after another, each finished and scheduled
before the next starts (10:00 standalone, 15:00 series part, 18:00 standalone). The steps below are per video.

### Per video

1. Read the board (`videos`, ordered by `order`), `learnings` and `series`. Find the next free slot: the earliest of 10:00/15:00/18:00 IST,
   at least 3 hours from now, not already taken by any board row's `slot` field or any Metricool scheduled post
   (`getScheduledPosts`). If the next 3 slots are all taken, stop: the queue is full enough.
   If the slot is 15:00, this run makes the next SERIES part (section 2b); any other slot makes a standalone video.
2. If a board row has `audio: done` and `video: todo` and NO `builder: "chat"` field, build that one (oldest first). Rows with
   `builder: "chat"` are being built by the owner's chat session: never touch them, but treat their `slot` as taken. Otherwise make a new video (sections 2-4).
3. Create the board row immediately (`video: doing`, `slot` reserved as ISO time with +05:30, `builder: "auto"`) so parallel runs never take the same slot.
4. Never start a second video in the same run. Never leave a row stuck on `doing`: on any failure write `notes` with the reason.

## 2. Strategy (the owner's framework, run silently, write the card to the board)

Do this thinking internally; store only the compact strategy card (`strategy` field on the board row).

**Topic choice.** Draft 10 candidate stories. True-but-unbelievable history, science, animals, inventions, weird laws, disasters,
lucky accidents. Score each 1-10 on Demand, Competition (low = good), Novelty, Shareability, Evergreen, Monetization, and
weight by `learnings` (themes and hook styles that performed best get a bonus; repeat winners as series). Reject anything already on the
board, anything that mocks a real living person, anything graphic, political or medical-advice. Verify every key fact with web search;
if it is a legend, the script must say so ("the story goes", "according to...").

**Angle.** Generate 10 angles (story, myth-bust, timeline, comparison, mistake, secret, numbers, "humans vs animals", etc.).
Rank and pick one. For it name: pattern interrupt, curiosity gap, emotional trigger, conflict, relatability, twist, belief shift.

**Hook.** Write 15 hooks across styles (shock, question, story, statistic, contrarian, mystery, prediction...). Rank. The winner is the
first spoken sentence: a paradox stated as fact, under 12 words, no setup ("Napoleon conquered half of Europe. Then he lost a battle to rabbits.").

**Script (narration only), 100-135 words (~38-48 s at Henry's pace, about 2.8 words/s):**
1. Hook (0-3 s).
2. Context in one line (when, where, who) with a concrete detail.
3. 2-4 escalating beats, each bigger; one open loop must be opened by 5 s and paid off only at the end.
4. Pivot ("You see,..." / "But...") that reveals the mechanism.
5. Twist/payoff as the last words. The final line should make the first line land again (rewatch loop).
Plain spoken English, years and numbers as digits, sentences of 6-15 words, no description of what the viewer already sees.

**Retention plan.** Split into 5 s beats; every beat gets a visual change (cut, camera move, new prop, reaction) and something
must move on screen at all times. Mark the 2 most likely drop-off points and put a pattern interrupt (zoom-punch, hero caption, SFX
hit, flash) right there.

**Packaging.** 10 YouTube titles, ranked by CTR; use the best: short hook + one emoji + `#shorts` (under 60 chars).
Instagram caption: 2-line hook, then "Watch till the end 👀", then 5-7 hashtags (mix 2 broad: #history #didyouknow, 3 niche, 1-2 topic).
Cover/thumbnail (every video): the opening title card, fully popped in, exported as a custom image. After `finish.sh`, grab the frame at
1.6 s (`ffmpeg -ss 1.6 -i final.mp4 -frames:v 1 -q:v 2 cover.jpg`), check it shows the complete title, upload `cover.jpg` as a second
file on the same temporary branch and pass its URL as `videoThumbnailUrl` (never also `videoCoverMilliseconds`). For series parts the title card shows the series
title with the part badge right beside it ("PART 2", or "FINAL PART"), so the thumbnail carries both.

**Engagement.** First comment (Metricool `firstCommentText`) = one comment-bait question that splits opinion
("Would you have surrendered in 1974?"). Add a share trigger line to the caption when natural ("Send this to someone who...").
Save trigger: series framing ("Part 3 of History's Weirdest Defeats").

**Virality audit.** Score CTR, Retention, Shares, Comments, Saves, Watch time, Novelty, Story, Packaging, Algorithm fit (1-10).
Anything below 9: revise hook/title/twist and re-score (max 3 rounds), then proceed with the best version.

Strategy card stored on the board row: `{series, angle, hook_style, title, caption, first_comment, scores:{...}, risk, opportunity, belief:{old,new}}`.

## 2b. Multi-part series (the 15:00 slot)

Purpose: attachment and binge. One series runs at a time; it gets one part per day at 15:00 until its final part.

- **Choosing a series.** A true story too big for 45 s with natural cliffhangers (heists, escapes, expeditions, cons, mysteries,
  survival, rivalries). Score it with the same framework; it must support 3-5 parts that each have their own escalation. Verify facts.
- **Plan the whole series before Part 1 airs.** Store it on the board: collection `series`, doc `<slug>`:
  `{title, parts: N (internal only, never shown), status: "running", outline: [{part, beats, cliffhanger, slot, status}], cast, places}`. Part 1 never promises what the
  outline cannot deliver. Each part's board row in `videos` carries `series: <slug>`, `part`, `of`.
- **Part structure (35-50 s).** Parts 2+ open with a 2-second recap line ("Part 2. Last time, a con man had just sold the Eiffel Tower...")
  then a fresh hook. Escalate. End on a cliffhanger: cut at the moment of maximum tension with an open question; never resolve it.
  The final part pays everything off and ends with "Follow for the next story."
- **Packaging.** Never reveal the total number of parts and never mention a release time anywhere (video, title, caption, comment).
  Title card: the series title with a big "PART 2" badge right beside it ("FINAL PART" on the last one); this is also the thumbnail. YouTube title: `<Series title> (Part 2) <emoji> #shorts`.
  Instagram caption: 2-line hook, "Part 2. Watch Part 1 on my profile 👆", "Watch till the end 👀", hashtags incl. #part2 #series.
  First comment: an opinion-splitting question about what happens next ("Who do you think wins? 👇"), plus "Follow so you don't miss the next part".
  Final part: title `<Series title> (Final Part)`, first comment a discussion question about the ending.
  Recap lines and narration never say how many parts remain or when the next one comes.
- **Continuity.** Same cast designs, world and music theme across parts. Keep the series' build in the repo at `series/<slug>/`
  (web/, audio/ cue table, make_ass.py) and commit after every part, so the next run reuses the world and only writes new shots.
- **Learning.** If Part 1's retention is far below the channel average, compress the remaining outline (fewer parts) but always finish the
  series. Never abandon one midway. When the final part is scheduled, set the series `status: "done"`; the next 15:00 run starts a new one.

## 3. Voiceover

- Check credits first: `mcp__ElevenLabs__creative_generate_speech` with `estimate_only: true`. If the account cannot cover it,
  set the row `audio: todo`, `notes: "Waiting for ElevenLabs credits"` and stop.
- Best quality: always `model_id: "eleven_v4"` (ElevenLabs' newest, most expressive model; owner is on the Creator plan, 121k credits/month).
  Direct the read with v4 audio tags placed right before the words they colour, changed only where delivery changes:
  hook `[dramatically]`, tension `[nervous]` or `[curious]`, a `[pause]` (or an ellipsis) right before the twist, the punchline
  `[sarcastic]` / `[softly]` / `[deadpan]` as fits, and sparing CAPITALS for one or two stressed words. Write years and numbers in normal
  digits (v4 reads them naturally). Leave `voice_settings` out. Strip every `[tag]` from the caption text.
- Generate once (`generations_count: 1`, ~700 credits; 3 videos/day fits the plan only with single takes; never retry a generation call;
  poll `creative_get_flow_run_status`).
- Download the audio to `voice.mp3`, then verify against the script with faster-whisper (kit `tools/tr.py`). If words differ,
  keep the audio and use what was actually said for captions.

## 4. Build (kit in this repo)

`bash tools/setup.sh` once per run (installs three.js, whisper model, Montserrat font, links Playwright).
Then follow `docs/PIPELINE.md`: timing -> shot plan -> world/cast (copy `example/` and rewrite the world, cast and story for the topic)
-> stills contact sheet (look at it, fix framing traps) -> full render (`node render.mjs frames 0-N`, background, ~3.5 s/frame)
-> `audio/audio.py` cue table for this story -> `audio/mix.py` (music exactly -6 dB under voice, SFX <= that)
-> `make_ass.py` (title card + boxed 1-3 word captions) -> `finish.sh` -> QA (no frozen spans >= 0.4 s, no black frames, -14 LUFS).

Visual rules: original characters only (bean-head cartoon cast, no real living people, no logos/mascots), flat cards in a toon 3D world,
captions slightly below centre and inside platform safe zones, full-screen title card for the first ~2.4 s naming the topic.

## 5. Publish

1. Make a posting copy: `ffmpeg -i final.mp4 -c:v libx264 -crf 23 -preset veryfast -c:a copy -movflags +faststart post.mp4` (~15 MB)
   and the cover (title card only: render the frame at 1.6 s with an ASS file holding only the title-card events, no captions).
2. Host them temporarily on the `media` branch of this public repo (force-push an orphan commit holding only this video's two files) (GitHub releases are blocked for these sessions):
   `T=$(mktemp -d); cd $T; git init -q; git checkout -q --orphan media; cp post.mp4 <slug>.mp4; cp cover.jpg <slug>-cover.jpg;`
   `git add -A; git commit -qm "Temporary posting copy"; git remote add origin https://github.com/suheelpeerzada/shorts-factory; git push -q -f origin media`.
   One run at a time uses it: push, schedule, clear, all within a few minutes.
   URLs: `https://raw.githubusercontent.com/suheelpeerzada/shorts-factory/media/<slug>.mp4` (and `-cover.jpg`). Check both return HTTP 200.
3. `createScheduledPost` (blogId 7873272) at the reserved slot, providers youtube + instagram, `autoPublish: true`,
   `media: [video url]`, `videoThumbnailUrl: <cover url>`, `firstCommentText`, `text` = Instagram caption,
   `youtubeData: {title, type: "short", privacy: "public", tags, madeForKids: false, category: "EDUCATION"}`,
   `instagramData: {type: "REEL", showReelOnFeed: true}`. Metricool copies the files into its own storage (the response shows
   static.metricool.com URLs); as soon as it succeeds, clear the branch (deleting branches is refused here): in a fresh dir `git init -q; git checkout -q --orphan media; git commit -q --allow-empty -m "Cleared after posting"; git remote add origin https://github.com/suheelpeerzada/shorts-factory; git push -q -f origin media`.
4. Board row: `video: done`, `youtube`/`instagram`: `doing` (scheduled), `slot`, `plannerUrl`, `postId`.

## 6. Daily review and cleanup (separate scheduled task)

- For every row whose slot has passed: read the post in `getScheduledPosts` (published posts stay listed). Each provider has a `status`:
  `PUBLISHED` (store `publicUrl` on the row and mark that platform `done`), `PUBLISHING`/`PENDING` (wait), or an error status (write it in notes).
  Make sure the `media` branch is empty (clear it if a run left files there).
- Pull analytics for posts 24 h+ old: Instagram reels (IGRE23 views, IGRE27 retention, IGRE24 avg watch, IGRE28 view rate,
  IGRE21 shares, IGRE12 saves, IGRE07 comments) and YouTube (YTVP06 views, YTVP08 avg view duration, YTVP11 comments, YTVP12 shares).
  Write them to the row's `stats`.
- Update `learnings` (doc `current`): rank videos by retention and shares; record which series, hook styles, lengths, opening visuals,
  and topics win or lose, with numbers. Keep it short (top 10 rules) so production runs can apply it.
- Production then leans into winners: more of the winning series/hook style/length, fewer of the losers.

## 7. Weekly long video (YouTube only, 10-20 min, Sunday 16:00 IST)

Format: a day-by-day survival story, "N Days ..." (reference style the owner likes: "30 Days Trapped in a Zoo", "Day 1 -> Day 30").
Alternate weeks: TRUE survival story (real people: Shackleton's Endurance crew, Alexander Selkirk, Juliane Koepcke, Onoda, the Andes
survivors told respectfully and never graphic, Apollo 13, Mawson...) and FICTIONAL era-survival with our own original cartoon hero
("I Survived 30 Days in Medieval London", "50 Days on a Pirate Ship"), clearly fiction, historically accurate world. Series continue
across weeks as parts ("Day 31 -> Day 60, Part 2") when the story is big; same no-part-count / no-release-time rules as shorts.

- **Spec.** 1920x1080 (16:9), 24 fps, 10-14 min target (~1,700-2,300 words). Chapters every ~60-90 s titled "DAY 7" etc. with a
  day-counter card (big "DAY 7" slam + whoosh). Each chapter: a new problem, a choice, a consequence; open loop carried across chapters;
  every 20-30 s a visual change of place/scale; recurring cliffhanger at each day card. Ending: payoff + "Which day would you have given up?".
- **Thumbnail (custom image, 1280x720).** Split screen: left panel "DAY 1" (white text, our hero fresh/clean), right panel "DAY 30"
  (red/orange text, hero changed: dirty, bandaged, bearded, triumphant or haunted), bold black divider, a yellow tag with the place
  ("ON AN ISLAND"), and for parts a yellow "PART 2" badge. Draw it with the same toon cast + Montserrat Black, high contrast.
  Title: `<N> Days <Trapped/Stranded/Surviving> <Place>` (+ " (Part 2)").
- **Credits.** Voice in chapters of <= 3,000 characters per `creative_generate_speech` call (eleven_v4, Henry, audio tags, 1 take each).
  Check `estimate_only` for the whole script first; if it would drop the month below ~15k remaining credits, make it shorter.
- **Rendering is split across runs** (a full render at shorts quality takes 10+ hours): use widescreen, MSAA 2, DOF only on close-ups,
  and reuse a few richly built locations per episode.
  - THU run "Long video: plan + build": strategy framework, script, fact-check, voiceover (all chapters), timing, world + cast, stills check;
    commit the project to `longform/<slug>/` (no frames, no audio over 50 MB; voice chapters as mp3 are fine), set board row
    `{type: "long", slug, status: "built", segments: 4, frames: N}`.
  - FRI runs "Long video: render segment k" (k = 1..4, same time): clone, `tools/setup.sh`, render frames for segment k
    (`floor(N*(k-1)/4)` .. `floor(N*k/4)-1`), encode `seg<k>.mp4` (libx264 -crf 22, video only), push it to branch `lf-seg<k>`
    (force-push an orphan commit with just that file), mark board `seg<k>: done`.
  - SAT run "Long video: assemble + schedule": fetch the 4 segments, concat, mix audio (same rules as shorts), small bottom captions
    (2-4 words, same palette, no boxes needed), chapter title cards, thumbnail; QA; host on `media` branch, `createScheduledPost` with
    provider youtube only, `youtubeData: {title, type: "video", privacy: "public", tags, madeForKids: false, category: "ENTERTAINMENT"}`,
    `videoThumbnailUrl`, a description with chapter timestamps in `text`, at Sunday 16:00 IST; then clear `media` and every `lf-seg*` branch.
  - If a segment run failed, the SAT run renders the missing segment itself before assembling (it still has the whole day).

## Caption feedback (user, 5 Nov) - apply to every new video
- Caption boxes are too big: make them smaller (smaller font, tighter box padding).
- Captions must never cover the main content: put each caption at the top or the bottom, wherever the screen is clear.
- Untested implementation parked on branch `captions-v2` (engine exports on-screen card boxes per frame,
  make_ass.py picks top/bottom from them; tools/upgrade_captions.py ports it to a project). Test it on stills before using.

## Analytics learnings (YouTube, ~30-36 h after first uploads, 5 Nov) - apply to every new video
Numbers: Emu War 2,041 views / 54.9% stayed / avg 0:25 of 0:39 (~64%) / +1 sub. Napoleon 1,280 views / 58.2% stayed /
avg 0:23 of 0:41 (~57%) / +2 subs / 7% like rate. 96-98% of views from the Shorts feed. ~0.2% of engaged viewers subscribe.
1. Hook loses 42-45% in the first seconds -> the first 2 s must show the climax image + 3-5 words of on-screen text,
   and the voiceover opens with the stakes, not context ("The Australian army lost a war. To birds."). Readable with sound off.
2. Viewers leave before the payoff -> target ~30 s (30-45 s max), twist delivered by ~20 s, last line loops back to the opening.
   Something visual or audible changes at least every 4 s.
3. Winning angle: animals that beat armies/empires. Run it as a named series ("Animals 1, Humans 0") with a recurring tag on
   frame 1. Candidates: Great Sparrow Campaign, Wojtek the soldier bear, Cher Ami the WWI pigeon, cane toads in Australia,
   mongooses in Hawaii.
4. Specific subscribe ask in the last seconds/caption ("Follow for a new animal-vs-army story every day") + a pinned first
   comment asking a question ("Which animal should win next?").
5. Metadata: same title pattern every time (stakes + emoji), only 3-4 focused hashtags (#history #weirdhistory #animals).
6. Judge each Short by stayed-to-watch and engaged views, not the public view counter. Re-check retention graphs ~2 days
   after upload to see whether the drop is at second 1 or in the middle.

## Facebook (added 5 Nov) - every post goes to Facebook too
The brand's Facebook Page (Metricool facebookData 1329111743628082) is connected. Every Short: providers youtube + instagram
+ facebook, with "facebookData": {"type": "REEL", "title": "<the YouTube title without #shorts>"}. The weekly long video:
youtube + facebook, with "facebookData": {"type": "POST", "title": "<the video title>"}. Same text, cover and first comment.
