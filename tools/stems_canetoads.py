exec(open("/root/work/tools/stemlib_head.py").read())
def croak(f=110, dur=0.35):
    t = tt(dur); am = (np.sin(2 * np.pi * 28 * t) > 0) * 1.0; x = np.sign(np.sin(2 * np.pi * f * t)) * am * np.sin(np.pi * t / dur) ** 0.6
    return lp(x, 900)
def boing(dur=0.18):
    t = tt(dur); f = 300 + 500 * t / dur; return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.07)
def insects(t0, dur, g=0.12):
    t = tt(dur); x = bp(R.standard_normal(len(t)), 4000, 7000, 2) * (0.5 + 0.5 * (np.sin(2 * np.pi * 14 * t) > 0.3)); put(sfx, x, t0, g)
# music: bouncy pizzicato + tuba (comic nature doc), tension at "Then a farmer looked up", glock payoff
bass = [36, 43, 38, 43]; mel = [72, 76, 79, 76, 74, 77, 81, 77]
t = 0.25; k = 0; tens = w(2, "^Then")
while t < tens:
    put(music, I.pluck(F(mel[k % 8]), 0.55, R), t, 0.3)
    if k % 2 == 0: put(music, I.brass(F(bass[(k // 2) % 4]), 0.3, 0.55, R), t, 0.32)
    if k % 4 == 2: put(music, I.snare(0.35, R), t, 0.2)
    t += 0.3; k += 1
stab(w(0, "^million"), 33, 0.45)
put(music, I.brass(F(48), 0.7, 0.8, R, "stab"), w(1, "^Problem"), 0.45); put(music, I.cymbal(0.3, R, 1.5), w(1, "^solved"), 0.25)
put(music, I.pad([F(40), F(47), F(52)], w(4, "^You$") - tens, 0.4, R, att=0.3, rel=0.4), tens, 0.42)
heartbeat(tens, w(3, "^The$"), 0.4, 0.6, 0.45)
stab(w(3, "galahs"), 31, 0.6)
for i, n in enumerate([79, 76, 72, 67, 72, 76, 79, 84]): put(music, I.glock(F(n), 0.35, R, 1.2), w(4, "^You$") + 0.1 + i * 0.55, 0.28)
put(music, I.pad([F(48), F(55), F(60), F(64)], DUR - w(4, "^You$"), 0.3, R, att=0.6, rel=1.2), w(4, "^You$"), 0.33)
put(music, I.brass(F(36), 0.5, 1.2, R, "tuba"), w(4, "^climb"), 0.5)          # sad tuba
put(music, I.brass(F(35), 0.5, 1.4, R, "tuba"), w(4, "^climb") + 0.55, 0.45)
stab(w(4, "^beetle"), 31, 0.4)
# sfx
insects(0.2, DUR - 0.4, 0.07)
for k2 in range(10): put(sfx, croak(90 + R.uniform(-15, 25), 0.3), 0.3 + k2 * 0.55 + R.uniform(0, 0.2), 0.32)
put(sfx, noise_burst(0.25, 1500, 5000, 0.06), w(0, "^beetle\\."), 0.25)
for k2 in range(6): put(sfx, noise_burst(0.06, 2500, 6000, 0.01), w(0, "^eaten") + k2 * 0.13, 0.25)   # munching
foghorn(w(0, "^shipped"), 0.3)
put(sfx, thunk(140, 0.18), w(1, "^solved"), 0.55)
for k2 in range(14): put(sfx, boing(), w(2, "^free") + k2 * 0.16, 0.3)
for q in ["^Insects", "^mice", "^dog"]: put(sfx, noise_burst(0.12, 800, 3000, 0.03), w(2, q), 0.4); put(sfx, croak(120, 0.25), w(2, q) + 0.15, 0.3)
for k2 in range(8): put(sfx, croak(80 + k2 * 6, 0.3), w(2, "^spread") + k2 * 0.18, 0.25)
put(sfx, thunk(70, 0.3), w(3, "galahs"), 0.5)
for k2 in range(5): put(sfx, boing(0.14), w(4, "^can't") + k2 * 0.22, 0.25)
put(sfx, croak(70, 0.6), w(4, "^beetle") + 0.4, 0.4)
for name, x in [("music.wav", music), ("sfx.wav", sfx)]:
    x = x[: ns(DUR)]; x = x / (np.max(np.abs(x)) + 1e-9) * 0.9
    wavfile.write(f"{J}/audio/{name}", SR, x.astype(np.float32))
print(VID, "stems ok")
