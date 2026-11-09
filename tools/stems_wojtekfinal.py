exec(open("/root/work/tools/stemlib_head.py").read())
def boom(t0, g=0.5):
    put(sfx, lp(R.standard_normal(ns(1.4)), 160, 2) * np.exp(-tt(1.4) / 0.35), t0, g); put(sfx, noise_burst(0.25, 400, 3000, 0.06), t0, g * 0.5)
def march(t0, t1, g=0.3, step=0.44):
    k = 0; t = t0
    while t < t1:
        put(music, I.snare(0.5 if k % 4 == 0 else 0.3, R), t, g * (1 if k % 2 == 0 else 0.6))
        if k % 2 == 0: put(music, I.timpani(F(38), 0.4, R, 0.5), t, g)
        t += step; k += 1
wb = w(2, "^Wojtek"); war = w(2, "^Then"); zoo = w(2, "^In$"); see = w(4, "^You$")
# battle: low brass pad + march snare, explosions on the beats
put(music, I.pad([F(38), F(45), F(50)], wb, 0.32, R, att=0.6, rel=0.6), 0, 0.32)
march(0.3, w(0, "^Now") - 0.2, 0.28)
march(w(0, "^Now"), w(1, "^Is") - 0.1, 0.34, 0.36)
stab(0.32, 33, 0.5); stab(w(0, "^strangest"), 31, 0.4)
for k in range(5): boom(w(0, "^1944") + 0.4 + k * 1.3, 0.35 + 0.1 * (k % 2))
boom(w(0, "^Shells"), 0.6); boom(2.2, 0.4); boom(4.0, 0.35)
put(sfx, noise_burst(0.5, 1500, 7000, 0.05), w(0, "^sees") + 0.3, 0.2)
stab(w(1, "^bear"), 33, 0.55)
# carrying: proud brass motif
sc = [50, 53, 55, 57, 58, 60, 62]
for i, n in enumerate([0, 2, 4, 5, 4, 2, 4, 6, 4, 2, 1, 0]):
    put(music, I.brass(F(sc[n] + 12), 0.4, 0.6, R, "stab"), wb + 0.2 + i * 0.6, 0.22)
march(wb, war - 0.2, 0.24, 0.6)
for k in range(5): put(sfx, thunk(80, 0.3), w(2, "^Crates") + k * 0.6, 0.3)
boom(wb + 3.2, 0.25); boom(wb + 5.6, 0.25)
# the problem: tense heartbeat, then stop
heartbeat(war, zoo - 0.1, 0.35, 0.8, 0.5)
stab(w(2, "^bear\\?"), 31, 0.45)
# zoo: rain, gentle music box + pad (Polish-flavoured minor)
rain(zoo, see - zoo, 0.12)
put(music, I.pad([F(45), F(52), F(57), F(60)], see - zoo, 0.32, R, att=1.0, rel=0.8), zoo, 0.34)
mbox(zoo + 0.3, see - 0.2, [69, 72, 76, 74, 72, 69, 67, 69], 0.55, 0.24)
put(sfx, ding(1760, 1.2), w(3, "^Wojtek"), 0.12)
# payoff: proud brass swell + snare roll
put(music, I.pad([F(50), F(57), F(62), F(66)], DUR - see, 0.36, R, att=0.5, rel=1.2), see, 0.38)
for i, n in enumerate([62, 66, 69, 74, 72, 69, 74]): put(music, I.brass(F(n), 0.5, 0.7, R, "stab"), see + 0.4 + i * 0.85, 0.24)
stab(w(4, "^corporal"), 33, 0.5); stab(w(4, "^shell"), 31, 0.55)
for name, x in [("music.wav", music), ("sfx.wav", sfx)]:
    x = x[: ns(DUR)]; x = x / (np.max(np.abs(x)) + 1e-9) * 0.9
    wavfile.write(f"{J}/audio/{name}", SR, x.astype(np.float32))
print(VID, "stems ok")
