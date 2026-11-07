# Level-locked mix: music at 50 % (-6 dB) of the voice's gated RMS, SFX at 50 % with peaks <= 0.7x voice peak,
# then one linear gain to ~-14 LUFS and a -1 dBFS peak limiter. Usage: python3 mix.py voice.wav music.wav sfx.wav out.wav
import sys, numpy as np
from scipy.io import wavfile
sys.path.insert(0, ".")
from dsp import SR, integrated

def load(p):
    sr, x = wavfile.read(p); x = x.astype(np.float64)
    if x.dtype != np.float64 or np.max(np.abs(x)) > 2: x = x / 32768.0
    if x.ndim > 1: x = x.mean(axis=1)
    assert sr == SR, (p, sr); return x
def grms(x, rel=-30.0):
    w = SR // 20; n = len(x) // w; b = x[: n * w].reshape(n, w); r = np.sqrt((b ** 2).mean(axis=1) + 1e-12)
    g = r[r > r.max() * 10 ** (rel / 20)]; return np.sqrt((g ** 2).mean())
db = lambda a: 20 * np.log10(a + 1e-12)

v, m, s = (load(p) for p in sys.argv[1:4])
n = len(v); m = np.pad(m, (0, max(0, n - len(m))))[:n]; s = np.pad(s, (0, max(0, n - len(s))))[:n]
rv = grms(v)
m *= 0.5 * rv / grms(m)
s *= 0.5 * rv / grms(s)
cap = 0.7 * np.max(np.abs(v))
if np.max(np.abs(s)) > cap: s *= cap / np.max(np.abs(s))
print(f"music vs voice: {db(grms(m)) - db(rv):+.1f} dB   sfx vs voice: {db(grms(s)) - db(rv):+.1f} dB   sfx peak/voice peak: {np.max(np.abs(s)) / np.max(np.abs(v)):.2f}")
mix = v + m + s
st = np.stack([mix, mix], axis=0)
L = integrated(st) if True else -20
g = 10 ** ((-14.0 - L) / 20); mix *= g
# peak limiter (-1 dBFS) with 3 ms lookahead-free smoothing
ceil = 10 ** (-1 / 20); a = np.abs(mix); need = np.minimum(1.0, ceil / np.maximum(a, 1e-9))
gain = np.ones(n); k_rel = np.exp(-1 / (0.08 * SR)); cur = 1.0
for i in range(n):
    t = need[i]; cur = t if t < cur else t + (cur - t) * k_rel; gain[i] = cur
mix *= gain
print(f"gain {db(g):+.1f} dB  LUFS after: {integrated(np.stack([mix, mix])):.1f}  peak {db(np.max(np.abs(mix))):.1f} dBFS")
wavfile.write(sys.argv[4], SR, (np.clip(mix, -1, 1) * 32767).astype(np.int16))
