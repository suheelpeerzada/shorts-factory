# Music + SFX stems for the four "you" shorts. Usage: python3 stems.py <video>  (writes <video>/audio/music.wav, sfx.wav)
import sys, json, re, numpy as np
from scipy.io import wavfile
sys.path.insert(0, "/root/work/tools")
from dsp import SR, ns, tt, rng, lp, hp, bp, fades
import instruments as I

J = sys.argv[1]; VID = sys.argv[2]
T = json.load(open(f"{J}/audio/timing.json")); DUR = T["dur"]; W = T["words"]; LN = T["lines"]
N = ns(DUR) + SR; R = rng(abs(hash(VID)) % 10000)
music = np.zeros(N); sfx = np.zeros(N); F = I.m2f
def w(line, rx):
    for q in W:
        if q["line"] == line and re.search(rx, q["w"], re.I): return q["s"]
    raise SystemExit(f"no word {line} {rx}")
def put(buf, x, t, g=1.0):
    i = ns(max(0, t))
    if x.ndim == 2: x = x.mean(axis=0)
    if i >= len(buf): return
    x = x[: len(buf) - i]; buf[i:i + len(x)] += x * g
def noise_burst(dur, lo, hi, tau):
    x = bp(R.standard_normal(ns(dur)), lo, hi, 2); t = tt(dur); return fades(x * np.exp(-t / tau), 0.001, 0.01)
def whoosh(dur=0.4):
    t = tt(dur); x = R.standard_normal(len(t)); env = np.sin(np.pi * t / dur) ** 2; return lp(bp(x, 500, 3000, 2) * env, 5000)
def thunk(f=90, dur=0.25):
    t = tt(dur); return np.sin(2 * np.pi * f * t) * np.exp(-t / 0.06) + 0.4 * lp(R.standard_normal(len(t)), 900) * np.exp(-t / 0.03)
def click(): return noise_burst(0.05, 2000, 8000, 0.004) + 0.5 * noise_burst(0.05, 600, 1500, 0.01)
def ding(f=1320, dur=1.6):
    t = tt(dur); return (np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * f * 2.76 * t)) * np.exp(-t / 0.5) * 0.6
def ring(dur=1.2):
    t = tt(dur); x = (np.sin(2 * np.pi * 440 * t) + np.sin(2 * np.pi * 480 * t)) * (np.sin(2 * np.pi * 20 * t) > 0); return x * 0.35 * (t < dur - 0.05)
def rumble(t0, dur, g=0.5):
    x = lp(R.standard_normal(ns(dur)), 200, 2); env = np.sin(np.pi * tt(dur) / dur) ** 1.5; put(sfx, x * env, t0, g)
def sea(t0, dur, g=0.3):
    x = lp(R.standard_normal(ns(dur)), 900); m = 0.55 + 0.45 * np.sin(2 * np.pi * tt(dur) / 4.3) ** 2; put(sfx, x * m, t0, g)
def rain(t0, dur, g=0.2): put(sfx, hp(R.standard_normal(ns(dur)), 2500) * (0.7 + 0.3 * np.sin(2 * np.pi * tt(dur) / 3.1)), t0, g)
def wind(t0, dur, g=0.25):
    x = bp(R.standard_normal(ns(dur)), 250, 900, 2) * (0.6 + 0.4 * np.sin(2 * np.pi * tt(dur) / 5.3) ** 2); put(sfx, x, t0, g)
def tick(t0, t1, g=0.25):
    t = t0
    while t < t1: put(sfx, noise_burst(0.03, 3000, 7000, 0.004), t, g); t += 0.5
def hum(t0, dur, f=60, g=0.2):
    t = tt(dur); x = np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 2 * t); env = np.minimum(1, np.minimum(t / 0.3, (dur - t) / 0.3)); put(sfx, lp(x * env, 500), t0, g)
def engine(t0, dur, g=0.3):
    t = tt(dur); x = lp(R.standard_normal(len(t)), 300) * (0.5 + 0.5 * (np.sin(2 * np.pi * 6 * t) > 0)); put(sfx, x, t0, g)
def foghorn(t0, g=0.4):
    d = 2.2; t = tt(d); x = np.sign(np.sin(2 * np.pi * 73 * t)) * np.minimum(1, np.minimum(t / 0.2, (d - t) / 0.4)); put(sfx, lp(x, 600), t0, g)
def creak(t0, dur=0.8, g=0.3):
    t = tt(dur); f = 180 + 120 * np.sin(np.pi * t / dur); x = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * np.sin(np.pi * t / dur); put(sfx, bp(x, 300, 2000), t0, g)
def heartbeat(t0, t1, g=0.5, start=0.9, end=0.45):
    t = t0
    while t < t1:
        put(music, I.timpani(F(33), 0.55, R, 0.5), t, g); put(music, I.timpani(F(33), 0.35, R, 0.4), t + 0.22, g * 0.8)
        t += start + (end - start) * (t - t0) / max(0.1, t1 - t0)
def stab(t, low=33, g=0.6):
    put(music, I.brass(F(low + 12), 0.6, 1.0, R, "stab"), t, g); put(music, I.timpani(F(low - 5), 0.9, R, 2.2), t, g); put(music, I.cymbal(0.5, R, 2.5), t, g * 0.5)
def mbox(t0, t1, notes, step=0.62, g=0.3):
    k = 0
    while t0 + k * step < t1: put(music, I.musicbox(F(notes[k % len(notes)]), 0.4, R, 1.4), t0 + k * step, g); k += 1
cuts = []
