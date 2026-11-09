exec(open("/root/work/tools/stemlib_head.py").read())
def boom(t0, g=0.5):
    put(sfx, lp(R.standard_normal(ns(1.6)), 150, 2) * np.exp(-tt(1.6) / 0.4), t0, g); put(sfx, noise_burst(0.3, 400, 3000, 0.07), t0, g * 0.5)
def crunch(t0, g=0.5):
    for k in range(6): put(sfx, thunk(60 + 20 * k, 0.4), t0 + k * 0.07, g * (1 - k * 0.12))
    put(sfx, noise_burst(0.8, 300, 2500, 0.25), t0, g * 0.6)
ol = w(0, "^In$"); ti = w(0, "^A$"); l16 = w(2, "^In$"); br = w(2, "^Then"); mine = w(2, "^mine"); jump = w(2, "^jumps"); you = w(4, "^You$")
# hook: low strings drone + heartbeat, stab on 'both'
put(music, I.pad([F(38), F(45), F(50)], ol, 0.34, R, att=0.4, rel=0.6), 0, 0.34)
stab(0.3, 33, 0.5); stab(w(0, "^both"), 31, 0.5)
heartbeat(w(0, "^when"), ol - 0.1, 0.35, 0.8, 0.55)
sea(0, ol, 0.25)
# Olympic: brisk day, plucks, then crash
sc = [62, 64, 66, 67, 69, 71, 73]; mel = [0, 2, 4, 2, 5, 4, 2, 1]
t = ol + 0.1; k = 0
while t < w(0, "^rams") - 0.1: put(music, I.pluck(F(sc[mel[k % 8]]), 0.5, R, 0.8), t, 0.28); t += 0.3; k += 1
put(music, I.pad([F(50), F(57), F(62)], ti - ol, 0.25, R, att=0.4, rel=0.4), ol, 0.25)
sea(ol, ti - ol, 0.3); crunch(w(0, "^rams"), 0.6); stab(w(0, "^rams"), 31, 0.45)
put(sfx, noise_burst(0.2, 800, 4000, 0.04), w(0, "^walks"), 0.15)
# Titanic: cold pad, glock, ominous
stab(w(0, "^Titanic"), 29, 0.55)
put(music, I.pad([F(45), F(52), F(57), F(60)], br - ti, 0.34, R, att=0.8, rel=0.8), ti, 0.36)
for i in range(int((br - ti) / 0.9)): put(music, I.glock(F([81, 76, 72, 76, 74, 69][i % 6]), 0.3, R, 1.6), ti + 0.4 + i * 0.9, 0.2)
sea(ti, br - ti, 0.22); wind(ti, br - ti, 0.12)
put(sfx, ding(990, 1.4), w(1, "^Miss"), 0.1)
# Britannic: march-like tension, mine boom, propeller churn
heartbeat(br + 2.0, mine - 0.1, 0.35, 0.7, 0.45)
put(music, I.pad([F(43), F(50), F(55)], DUR - br, 0.3, R, att=0.6, rel=0.5)[: ns(you - br)], br, 0.3)
sea(br, you - br, 0.3)
boom(mine, 0.75); stab(mine, 29, 0.55)
for k2 in range(int((jump - mine) / 0.18)): put(sfx, thunk(55, 0.2), mine + 1.0 + k2 * 0.18, 0.22 * min(1, k2 / 8))
put(sfx, whoosh(0.5), jump, 0.5); put(sfx, noise_burst(0.7, 300, 3000, 0.2), jump + 0.7, 0.55)
stab(w(3, "^Not"), 31, 0.4)
# payoff: music box + warm pad, sting on toothbrush
put(music, I.pad([F(48), F(55), F(60), F(64)], DUR - w(4, "^She$"), 0.3, R, att=0.8, rel=1.4), w(4, "^She$"), 0.32)
mbox(you, DUR - 0.5, [72, 76, 79, 76, 74, 77, 79, 84], 0.55, 0.26)
stab(w(4, "^toothbrush"), 33, 0.5); put(sfx, ding(1760, 1.2), w(4, "^toothbrush") + 0.05, 0.16)
put(sfx, ding(1320, 1.6), w(4, "^most") + 0.3, 0.12)
for name, x in [("music.wav", music), ("sfx.wav", sfx)]:
    x = x[: ns(DUR)]; x = x / (np.max(np.abs(x)) + 1e-9) * 0.9
    wavfile.write(f"{J}/audio/{name}", SR, x.astype(np.float32))
print(VID, "stems ok")
