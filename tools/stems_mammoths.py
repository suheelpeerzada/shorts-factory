exec(open("/root/work/tools/stemlib_head.py").read())
def trumpet(t0, g=0.4, f0=320):
    d = 1.3; t = tt(d); f = f0 + 180 * np.sin(np.pi * t / d) - 120 * t; ph = 2 * np.pi * np.cumsum(f) / SR
    x = (2 * ((ph / (2 * np.pi)) % 1) - 1) * np.minimum(1, np.minimum(t / 0.1, (d - t) / 0.3)); x = bp(x, 250, 2500) + 0.2 * bp(R.standard_normal(len(t)), 800, 3000) * np.sin(np.pi * t / d)
    put(sfx, x, t0, g)
def whip(t0, g=0.6): put(sfx, noise_burst(0.12, 2000, 9000, 0.015), t0, g); put(sfx, whoosh(0.25), t0 - 0.2, g * 0.5)
def scrape(t0, dur=1.2, g=0.3): x = bp(R.standard_normal(ns(dur)), 300, 1500) * (0.6 + 0.4 * np.sin(2 * np.pi * 7 * tt(dur))); put(sfx, x * np.sin(np.pi * tt(dur) / dur), t0, g)
sc = [62, 63, 66, 67, 69, 70, 73, 74]; mel = [0, 1, 2, 3, 4, 3, 2, 1, 2, 4, 5, 4, 3, 2, 1, 0]
north = w(2, "^Meanwhile")
t = 0.3; k = 0
while t < north - 0.2:
    put(music, I.pluck(F(sc[mel[k % 16]] + 12), 0.5, R, 0.8), t, 0.3)
    if k % 2 == 0: put(music, I.timpani(F(38), 0.5 if k % 4 == 0 else 0.3, R, 0.6), t, 0.35)
    if k % 4 == 3: put(music, I.snare(0.25, R), t, 0.15)
    t += 0.28; k += 1
put(music, I.pad([F(50), F(57), F(62)], north, 0.3, R, att=0.8, rel=0.5), 0, 0.3)
stab(w(0, "^alive"), 33, 0.45)
stab(w(1, "^Higher"), 31, 0.5)
# north: cold pad + glock, slow
put(music, I.pad([F(45), F(52), F(57), F(64)], w(2, "^Then") - north, 0.38, R, att=1.0, rel=0.8), north, 0.38)
for i in range(int((w(2, "^Then") - north) / 0.9)): put(music, I.glock(F([76, 81, 83, 79, 76, 74][i % 6]), 0.3, R, 1.6), north + 0.4 + i * 0.9, 0.22)
heartbeat(w(2, "^Then"), w(3, "^Only"), 0.4, 0.6, 0.4)
stab(w(3, "4,000"), 31, 0.6)
yo = w(4, "^You$")
put(music, I.pad([F(48), F(55), F(60), F(64)], DUR - yo, 0.32, R, att=0.6, rel=1.4), yo, 0.35)
mbox(yo + 0.2, DUR - 0.5, [79, 76, 72, 76, 79, 84, 83, 79], 0.62, 0.26)
# sfx
wind(0.2, 13.5, 0.06)
scrape(w(0, "^haul"), 1.6, 0.3); put(sfx, thunk(70, 0.4), w(0, "^up,") + 0.2, 0.45)
whip(w(1, "^Higher") - 0.05)
for k2 in range(4): put(sfx, thunk(80, 0.3), w(1, "^touching") + k2 * 0.4, 0.25)
wind(north, w(4, "^You$") - north, 0.18)
trumpet(w(0, "^alive") + 0.15, 0.35)
trumpet(w(2, "^island") + 0.3, 0.3, 280)
sea(w(2, "^Rising"), 4.0, 0.2)
put(sfx, noise_burst(0.3, 1500, 6000, 0.08), w(2, "^dated"), 0.3)
wind(yo, DUR - yo, 0.12)
for k2 in range(6): put(sfx, noise_burst(0.15, 300, 1200, 0.05), w(4, "^mammoth$") + k2 * 0.55, 0.3)   # footsteps in snow
trumpet(DUR - 1.6, 0.28, 300)
for name, x in [("music.wav", music), ("sfx.wav", sfx)]:
    x = x[: ns(DUR)]; x = x / (np.max(np.abs(x)) + 1e-9) * 0.9
    wavfile.write(f"{J}/audio/{name}", SR, x.astype(np.float32))
print(VID, "stems ok")
