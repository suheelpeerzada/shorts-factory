# python3 vb.py <jobdir> "c0:NARRATOR,c1:OFFICIAL,..."  -> <jobdir>/audio/voice.wav + timing.json
import sys, json, subprocess, os, numpy as np
from scipy.io import wavfile
SR = 48000; MODEL = os.path.expanduser("~/.shorts-cache/whisper-small")
J = sys.argv[1]; CL = [c.split(":") for c in sys.argv[2].split(",")]
def dec(f, sr=SR):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", f, "-f", "s16le", "-ac", "1", "-ar", str(sr), "-"], capture_output=True).stdout
    return np.frombuffer(raw, np.int16).astype(np.float32) / 32768
def squeeze(x, cap=0.34, thr_db=-42, win=0.02):
    w = int(SR * win); n = len(x) // w; e = np.array([np.sqrt((x[i*w:(i+1)*w] ** 2).mean() + 1e-12) for i in range(n)])
    loud = 20 * np.log10(e + 1e-12) > thr_db; idx = np.where(loud)[0]
    a, b = max(0, idx[0] - 2), min(n, idx[-1] + 4); out = []; quiet = 0; capn = int(cap / win)
    for i in range(a, b):
        if loud[i]: quiet = 0; out.append(x[i*w:(i+1)*w])
        else:
            quiet += 1
            if quiet <= capn: out.append(x[i*w:(i+1)*w])
    return np.concatenate(out)
from faster_whisper import WhisperModel
M = WhisperModel(MODEL, device="cpu", compute_type="int8")
buf = [np.zeros(int(SR * 0.3), np.float32)]; t = 0.3; words = []; lines = []
for li, (c, sp) in enumerate(CL):
    x = squeeze(dec(f"{J}/voice/{c}.mp3")); x16 = x[::3].copy()
    segs, _ = M.transcribe(x16, language="en", word_timestamps=True)
    for s in segs:
        for wd in s.words: words.append({"w": wd.word.strip(), "s": round(t + wd.start, 3), "e": round(t + wd.end, 3), "sp": sp, "line": li})
    lines.append({"s": round(t, 3), "e": round(t + len(x) / SR, 3), "sp": sp})
    buf.append(x); t += len(x) / SR; buf.append(np.zeros(int(SR * 0.2), np.float32)); t += 0.2
buf.append(np.zeros(int(SR * 0.9), np.float32)); t += 0.9
v = np.concatenate(buf); os.makedirs(f"{J}/audio", exist_ok=True)
wavfile.write(f"{J}/audio/voice.wav", SR, (np.clip(v, -1, 1) * 32767).astype(np.int16))
json.dump({"dur": round(len(v) / SR, 2), "lines": lines, "words": words}, open(f"{J}/audio/timing.json", "w"), indent=0)
print(round(len(v) / SR, 2), "s,", len(words), "words")
for li in range(len(CL)): print(li, " ".join(f"{w['w']}@{w['s']}" for w in words if w["line"] == li))
