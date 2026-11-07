# Build voice.wav (48 kHz mono) per video from its clips: trim edges, cap pauses at 0.42 s, 0.22 s between clips.
# Then faster-whisper word timings per clip (speaker known) -> words.json, lines.json.
import sys, json, subprocess, numpy as np
from scipy.io import wavfile
SR = 48000
MODEL = "/tmp/claude-0/-home-claude/189c04b1-4802-5fc5-8c82-110c35f893c2/scratchpad/dl/model"
VIDEOS = {
  "wojtek": [("w1", "NARRATOR"), ("w2", "SERGEANT"), ("w3", "NARRATOR")],
  "extra-passenger": [("f1", "NARRATOR"), ("f2", "CAPTAIN"), ("f3", "NARRATOR"), ("f4", "STRANGER"), ("f5", "NARRATOR")],
  "room-312": [("r1", "NARRATOR"), ("r2", "MANAGER"), ("r3", "NARRATOR"), ("r4", "MANAGER")],
  "floor-13": [("e1", "NARRATOR"), ("e2", "DOORMAN"), ("e3", "NARRATOR"), ("e4", "GIRL"), ("e5", "NARRATOR"), ("e6", "GIRL")],
}
def dec(f, sr=SR):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", f, "-f", "s16le", "-ac", "1", "-ar", str(sr), "-"], capture_output=True).stdout
    return np.frombuffer(raw, np.int16).astype(np.float32) / 32768
def squeeze(x, cap=0.42, thr_db=-42, win=0.02):
    w = int(SR * win); n = len(x) // w; e = np.array([np.sqrt((x[i*w:(i+1)*w] ** 2).mean() + 1e-12) for i in range(n)])
    loud = 20 * np.log10(e + 1e-12) > thr_db; idx = np.where(loud)[0]
    if not len(idx): return x
    a, b = max(0, idx[0] - 2), min(n, idx[-1] + 4)
    out = []; quiet = 0; capn = int(cap / win)
    for i in range(a, b):
        if loud[i]: quiet = 0; out.append(x[i*w:(i+1)*w])
        else:
            quiet += 1
            if quiet <= capn: out.append(x[i*w:(i+1)*w])
    return np.concatenate(out)
from faster_whisper import WhisperModel
M = WhisperModel(MODEL, device="cpu", compute_type="int8")
for vid, clips in VIDEOS.items():
    buf = [np.zeros(int(SR * 0.3), np.float32)]; t = 0.3; words = []; lines = []
    for li, (c, sp) in enumerate(clips):
        x = squeeze(dec(f"/root/you4/voice/{c}.mp3"))
        x16 = x[::3].copy()  # 48k -> 16k
        segs, _ = M.transcribe(x16, language="en", word_timestamps=True)
        for s in segs:
            for wd in s.words:
                words.append({"w": wd.word.strip(), "s": round(t + wd.start, 3), "e": round(t + wd.end, 3), "sp": sp, "line": li})
        lines.append({"s": round(t, 3), "e": round(t + len(x) / SR, 3), "sp": sp})
        buf.append(x); t += len(x) / SR
        gap = 0.22; buf.append(np.zeros(int(SR * gap), np.float32)); t += gap
    buf.append(np.zeros(int(SR * 0.9), np.float32)); t += 0.9
    v = np.concatenate(buf)
    import os; os.makedirs(f"/root/you4/{vid}/audio", exist_ok=True)
    wavfile.write(f"/root/you4/{vid}/audio/voice.wav", SR, (np.clip(v, -1, 1) * 32767).astype(np.int16))
    json.dump({"dur": round(len(v) / SR, 2), "lines": lines, "words": words}, open(f"/root/you4/{vid}/audio/timing.json", "w"), indent=0)
    print(vid, round(len(v) / SR, 2), "s,", len(words), "words")
    print("   ", " ".join(w["w"] for w in words))
