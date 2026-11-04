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
| Voice | ElevenLabs "Henry - Deep, Professional, and Soothing", voice_id `pVnrL6sighQX7hVz89cp`, model `eleven_v4`, `generations_count: 1` (ALWAYS 1 take, credits are limited) |
| Posting slots (IST, both platforms) | 10:00, 12:00, 18:00 every day (Metricool best-time data for this account) |
| Video spec | 1080x1920, 30 fps, 35-50 s, H.264 + AAC, voice unchanged |
| Laptop folder (only when the laptop is linked) | C:\Users\suhee\Downloads\video edit claude ("yet to upload" -> "used") |

## 1. One run = one finished, scheduled video

1. Read the board (`videos`, ordered by `order`) and `learnings`. Find the next free slot: the earliest of 10:00/12:00/18:00 IST,
   at least 3 hours from now, not already taken by any board row's `slot` field or any Metricool scheduled post
   (`getScheduledPosts`). If the next 3 slots are all taken, stop: the queue is full enough.
2. If a board row has `audio: done` and `video: todo`, build that one (oldest first). Otherwise make a new video (sections 2-4).
3. Create the board row immediately (`video: doing`, `slot` reserved) so parallel runs never take the same slot.
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
Plain spoken English, numbers written as words, sentences of 6-15 words, no description of what the viewer already sees.

**Retention plan.** Split into 5 s beats; every beat gets a visual change (cut, camera move, new prop, reaction) and something
must move on screen at all times. Mark the 2 most likely drop-off points and put a pattern interrupt (zoom-punch, hero caption, SFX
hit, flash) right there.

**Packaging.** 10 YouTube titles, ranked by CTR; use the best: short hook + one emoji + `#shorts` (under 60 chars).
Instagram caption: 2-line hook, then "Watch till the end 👀", then 5-7 hashtags (mix 2 broad: #history #didyouknow, 3 niche, 1-2 topic).
Cover: the title-card frame (`videoCoverMilliseconds: 800`).

**Engagement.** First comment (Metricool `firstCommentText`) = one comment-bait question that splits opinion
("Would you have surrendered in 1974?"). Add a share trigger line to the caption when natural ("Send this to someone who...").
Save trigger: series framing ("Part 3 of History's Weirdest Defeats").

**Virality audit.** Score CTR, Retention, Shares, Comments, Saves, Watch time, Novelty, Story, Packaging, Algorithm fit (1-10).
Anything below 9: revise hook/title/twist and re-score (max 3 rounds), then proceed with the best version.

Strategy card stored on the board row: `{series, angle, hook_style, title, caption, first_comment, scores:{...}, risk, opportunity, belief:{old,new}}`.

## 3. Voiceover

- Check credits first: `mcp__ElevenLabs__creative_generate_speech` with `estimate_only: true`. If the account cannot cover it,
  set the row `audio: todo`, `notes: "Waiting for ElevenLabs credits"` and stop.
- Generate once (`generations_count: 1`, never retry a generation call; poll `creative_get_flow_run_status`).
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

1. Make a posting copy: `ffmpeg -i final.mp4 -c:v libx264 -crf 23 -preset veryfast -c:a copy post.mp4` (~15 MB).
2. Upload it as a release asset on this repo (tag `v-<slug>`), take the asset's browser_download_url.
3. `createScheduledPost` (blogId 7873272) at the reserved slot, providers youtube + instagram, `autoPublish: true`,
   `media: [url]`, `videoCoverMilliseconds: 800`, `firstCommentText`, `text` = Instagram caption,
   `youtubeData: {title, type: "short", privacy: "public", madeForKids: false, category: "EDUCATION"}`,
   `instagramData: {type: "REEL", showReelOnFeed: true}`.
4. Board row: `video: done`, `youtube`/`instagram`: `doing` (scheduled), `slot`, `plannerUrl`, `asset` (tag name).
5. If the laptop is linked, also copy final.mp4 into "yet to upload".

## 6. Daily review and cleanup (separate scheduled task)

- For every row whose slot has passed: if the post is no longer in `getScheduledPosts`, mark youtube/instagram `done`, delete the
  release asset + tag, and (laptop linked) move the file from "yet to upload" to "used".
- Pull analytics for posts 24 h+ old: Instagram reels (IGRE23 views, IGRE27 retention, IGRE24 avg watch, IGRE28 view rate,
  IGRE21 shares, IGRE12 saves, IGRE07 comments) and YouTube (YTVP06 views, YTVP08 avg view duration, YTVP11 comments, YTVP12 shares).
  Write them to the row's `stats`.
- Update `learnings` (doc `current`): rank videos by retention and shares; record which series, hook styles, lengths, opening visuals,
  and topics win or lose, with numbers. Keep it short (top 10 rules) so production runs can apply it.
- Production then leans into winners: more of the winning series/hook style/length, fewer of the losers.
