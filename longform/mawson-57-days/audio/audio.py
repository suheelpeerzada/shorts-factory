# Music + SFX stems for "Napoleon vs. the Rabbits" (40.75 s). Writes music.wav and sfx.wav (48 kHz mono).
import sys, numpy as np
from scipy.io import wavfile
sys.path.insert(0, ".")
from dsp import SR, ns, tt, rng, lp, hp, bp, fades
import instruments as I

DUR = 40.751
N = ns(DUR) + SR
R = rng(1807)
music = np.zeros(N); sfx = np.zeros(N)

def put(buf, x, t, g=1.0):
    i = ns(t)
    if x.ndim == 2: x = x.mean(axis=0)
    if i >= len(buf): return
    x = x[: len(buf) - i]; buf[i:i + len(x)] += x * g

F = I.m2f
# ---------------- music ----------------
Q = 0.5  # 120 bpm
# original pompous march tune in Bb (one note per beat, None = rest)
TUNE = [70, 74, 77, 74, 75, 72, 69, 72, 70, 74, 77, 82, 81, 77, 74, None,
        72, 75, 79, 75, 74, 70, 74, 77, 75, 72, 69, 72, 70, None, 70, None]
BASS = [46, 53, 46, 53, 48, 53, 41, 53, 46, 53, 46, 53, 41, 48, 46, 53]  # tuba oom on beats
def march(t0, t1, vel=0.6):
    k = 0; t = t0
    while t < t1 - 0.05:
        beat = k % 32
        n = TUNE[beat]
        if n: put(music, I.glock(F(n + 12), 0.45 * vel, R, 1.0), t, 0.5)
        if n and beat % 2 == 0: put(music, I.brass(F(n), Q * 0.8, 0.55 * vel, R, "horn"), t, 0.35)
        put(music, I.brass(F(BASS[(k // 2) % 16]), Q * 0.45, 0.7 * vel, R, "tuba"), t, 0.55) if k % 2 == 0 else put(music, I.pluck(F(58), 0.5 * vel, R, 0.3), t, 0.4)
        put(music, I.snare(0.45 * vel if k % 4 else 0.7 * vel, R, 0.25), t, 0.35)
        if k % 2 == 1: put(music, I.snare(0.3 * vel, R, 0.2), t + Q / 2, 0.3)
        k += 1; t += Q
march(0.0, 19.3)
# charge stinger + chase ostinato in G minor, faster
put(music, I.timpani(F(43), 0.9, R, 2.0), 20.04, 0.9)
put(music, I.brass(F(55), 0.35, 0.9, R, "stab"), 20.04, 0.6)
put(music, I.cymbal(0.5, R, 1.6), 20.04, 0.3)
OST = [55, 58, 62, 58, 55, 58, 63, 58]
t = 20.6; k = 0
while t < 32.9:
    put(music, I.pluck(F(OST[k % 8] - 12), 0.75, R, 0.35, bright=0.7), t, 0.6)
    if k % 2 == 0: put(music, I.snare(0.35 + 0.2 * ((t - 20.6) / 12), R, 0.2), t, 0.35)
    if k % 8 == 0: put(music, I.brass(F(43), 1.0, 0.6, R, "tuba"), t, 0.45)
    if t > 26 and k % 4 == 2: put(music, I.brass(F(OST[k % 8]), 0.2, 0.6, R, "stab"), t, 0.25)
    k += 1; t += 0.25
put(music, I.cymbal(0.7, R, 2.2), 32.25, 0.35)
put(music, I.timpani(F(43), 0.8, R, 1.8), 32.25, 0.6)
# flashback: soft music box in Eb
MB = [75, 79, 82, 79, 77, 74, 70, 74]
for i, n in enumerate(MB * 2):
    tt0 = 33.15 + i * 0.25
    if tt0 > 37.0: break
    put(music, I.musicbox(F(n + 12), 0.5, R, 1.2), tt0, 0.45)
put(music, I.pad([F(51), F(58), F(63)], 3.8, 0.4, R), 33.1, 0.35)
# twist: music stops at 37.16, low drone + hit
put(music, I.timpani(F(38), 0.7, R, 2.5), 37.16, 0.6)
drone = I.pad([F(38), F(45)], 3.4, 0.45, R, att=0.4, rel=0.4)
put(music, drone, 37.2, 0.5)
# button on "cabbage": comic glock arpeggio
for i, n in enumerate([82, 86, 89, 94]): put(music, I.glock(F(n), 0.6, R, 1.4), 39.85 + i * 0.07, 0.5)

# ---------------- sfx ----------------
def noise_burst(dur, lo, hi, tau, r=R):
    x = bp(r.standard_normal(ns(dur)), lo, hi, 2); t = tt(dur); return fades(x * np.exp(-t / tau), 0.001, 0.01)
def whoosh(dur=0.45, up=True):
    t = tt(dur); x = R.standard_normal(len(t)); env = np.sin(np.pi * t / dur) ** 2
    y = np.zeros_like(x); f = np.linspace(400, 2400, len(t)) if up else np.linspace(2400, 400, len(t))
    for a, b in [(0, 0.33), (0.33, 0.66), (0.66, 1.0)]:
        i0, i1 = int(a * len(t)), int(b * len(t)); fc = f[(i0 + i1) // 2]
        y[i0:i1] = bp(x, fc * 0.6, fc * 1.6, 2)[i0:i1]
    return lp(y * env, 5000)
def boing(f0=220, f1=520, dur=0.35):
    t = tt(dur); f = f0 + (f1 - f0) * (1 - np.exp(-t / 0.08)) + 30 * np.sin(2 * np.pi * 14 * t) * np.exp(-t / 0.15)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.18) * 0.6
def thunk(f=90, dur=0.25):
    t = tt(dur); return (np.sin(2 * np.pi * f * t) * np.exp(-t / 0.06) + 0.4 * lp(R.standard_normal(len(t)), 900) * np.exp(-t / 0.03))
def click(): return noise_burst(0.05, 2000, 8000, 0.004) + 0.5 * noise_burst(0.05, 600, 1500, 0.01)
def crack(): t = tt(0.12); return hp(R.standard_normal(len(t)), 1500) * np.exp(-t / 0.012) * 1.4
def pop(): t = tt(0.08); f = np.linspace(900, 300, len(t)); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.02)
def patter(t0, t1, rate=14, g=0.35):
    t = t0
    while t < t1:
        put(sfx, noise_burst(0.04, 300, 1800, 0.008) * R.uniform(0.4, 1.0), t, g); t += R.exponential(1 / rate)
def rumble(t0, dur, g=0.5):
    x = lp(R.standard_normal(ns(dur)), 220, 2); env = np.sin(np.pi * tt(dur) / dur) ** 1.5; put(sfx, x * env, t0, g)

put(sfx, boing(260, 620), 3.62, 0.5)                       # rabbit hops in
put(sfx, I.triangle(0.5, R, 1.2), 4.18, 0.35)              # "rabbits"
for tw in [5.30, 33.04, 37.04]: put(sfx, whoosh(0.4), tw - 0.15, 0.6)   # flashes
for i in range(6): put(sfx, thunk(120 + i * 8, 0.2), 14.33 + i * 0.1 + 0.25 * (i % 2), 0.55)  # crate lids
patter(14.7, 16.2, 18, 0.3)
for tc in [16.95, 17.08, 17.22]: put(sfx, click(), tc, 0.6)  # guns ready
for i in range(6): put(sfx, thunk(70, 0.15), 17.65 + i * 0.3, 0.35)   # footsteps
put(sfx, whoosh(0.5), 19.8, 0.6)
rumble(20.2, 3.6, 0.6); patter(20.3, 23.8, 26, 0.35)
put(sfx, boing(500, 1100, 0.3), 22.5, 0.4)                  # shock
for tc in [24.62, 25.02, 25.40]: put(sfx, crack(), tc, 0.55)
patter(26.3, 28.5, 24, 0.35); rumble(26.5, 2.0, 0.45)
patter(29.0, 31.0, 22, 0.35)
for tb in [29.3, 29.7, 30.1, 30.5]: put(sfx, boing(300, 500, 0.2), tb, 0.25)
put(sfx, whoosh(0.4), 31.1, 0.55); put(sfx, whoosh(0.35), 31.85, 0.55)
put(sfx, thunk(80, 0.3), 32.2, 0.7)
put(sfx, thunk(150, 0.2), 32.28, 0.5)                       # door slam
for i in range(6): put(sfx, I.glock(F(96 + (i % 3) * 3), 0.4, R, 0.5), 35.7 + i * 0.05, 0.3)  # coins
for i in range(7): put(sfx, pop(), 39.70 + i * 0.045, 0.45)  # bubbles
put(sfx, I.triangle(0.6, R, 1.4), 39.86, 0.35)

for name, x in [("music.wav", music), ("sfx.wav", sfx)]:
    x = x[: ns(DUR)]; x = x / (np.max(np.abs(x)) + 1e-9) * 0.9
    wavfile.write(name, SR, x.astype(np.float32))
print("stems written")
