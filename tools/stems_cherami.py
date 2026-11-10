exec(open("/root/work/tools/stemlib_head.py").read())
def boom(t0, g=0.5):
    put(sfx, lp(R.standard_normal(ns(1.4)), 160, 2) * np.exp(-tt(1.4) / 0.35), t0, g); put(sfx, noise_burst(0.25, 400, 3000, 0.06), t0, g * 0.5)
def flaps(t0, t1, g=0.12):
    t = t0
    while t < t1: put(sfx, noise_burst(0.06, 800, 3000, 0.015), t, g); t += 0.11
def coo(t0, g=0.15):
    d = 0.5; x = np.sin(2 * np.pi * (300 + 40 * np.sin(2 * np.pi * 3 * tt(d))) * tt(d)) * np.sin(np.pi * tt(d) / d); put(sfx, lp(x, 1200), t0, g)
def snare_roll(t0, t1, g=0.2):
    t = t0
    while t < t1: put(music, noise_burst(0.06, 1500, 6000, 0.02), t, g); t += 0.125
oc = w(0, "^October"); sh = w(0, "^shelling"); ar = w(0, "^artillery"); pg = w(0, "^pigeons"); last = w(0, "^last")
go = w(1, "^Go"); fly = w(1, "^Fly"); hit = w(2, "^hit"); m25 = w(2, "^25"); msg = w(2, "^message"); l3 = w(3, "^Our"); stp = w(3, "^stop")
guns = w(4, "^guns"); n194 = w(4, "^194"); medal = w(4, "^medal"); ys = w(4, "^You$"); dna = w(4, "^DNA"); boy = w(4, "^boy")
# hook: war drums + low brass, flaps, flak
put(music, I.pad([F(38), F(45), F(50)], oc, 0.3, R, att=0.3, rel=0.5), 0, 0.3)
heartbeat(0.3, oc - 0.2, 0.35, 0.7, 0.55); stab(0.3, 33, 0.5); stab(w(0, "^chest"), 31, 0.45); stab(w(0, "^wrong"), 29, 0.5)
flaps(0.2, oc - 0.3, 0.1); boom(1.2, 0.35); boom(2.8, 0.3); boom(4.4, 0.3); boom(6.0, 0.25)
# forest: snare march, then shelling booms
put(music, I.pad([F(43), F(50), F(55)], go - oc, 0.28, R, att=0.5, rel=0.5), oc, 0.28)
snare_roll(oc + 0.2, sh, 0.12); wind(oc, go - oc, 0.15)
for i in range(5): boom(ar + i * 0.75, 0.7)
for i in range(2): put(sfx, noise_burst(0.08, 2000, 7000, 0.01), pg - 0.6 + i * 0.5 + 0.9 + i * 0.2, 0.35)
coo(last + 0.3, 0.2)
# major: hit + launch
stab(go, 33, 0.45); flaps(fly, fly + 1.5, 0.18); put(sfx, whoosh(0.5), fly, 0.4)
# flight: heroic strings w/ pulse, gunshot at hit, wind
put(music, I.pad([F(45), F(52), F(57), F(61)], msg - fly, 0.3, R, att=0.4, rel=0.6), fly, 0.32)
t = fly + 0.2; k = 0
while t < msg - 0.2: put(music, I.pluck(F([57, 61, 64, 69, 64, 61][k % 6]), 0.35, R, 0.6), t, 0.22); t += 0.25; k += 1
put(sfx, noise_burst(0.15, 1000, 6000, 0.03), hit - 0.05, 0.6); boom(hit, 0.4); stab(hit, 29, 0.5)
wind(hit, msg - hit, 0.2); flaps(hit + 0.5, msg - 0.3, 0.1); stab(m25, 33, 0.4)
# hq: tension under the message, sting on stop
put(music, I.pad([F(40), F(47), F(52)], guns - msg, 0.3, R, att=0.3, rel=0.3), msg, 0.3)
heartbeat(l3, stp, 0.35, 0.6, 0.4); stab(stp, 29, 0.55)
put(sfx, ding(1100, 0.6), stp + 0.4, 0.12)
# rescue: silence then warm resolve, medal ding
put(music, I.pad([F(48), F(55), F(60), F(64)], ys - guns, 0.3, R, att=1.0, rel=0.8), guns + 0.2, 0.3)
mbox(n194, ys - 0.2, [72, 76, 79, 84, 79, 76, 74, 79], 0.5, 0.22); put(sfx, ding(1760, 1.2), medal, 0.15); coo(medal + 0.8, 0.15)
# museum: curious plucks, sting on boy
t = ys; k = 0
while t < boy - 0.3: put(music, I.pluck(F([64, 67, 71, 67][k % 4]), 0.3, R, 0.6), t, 0.2); t += 0.42; k += 1
put(music, I.pad([F(48), F(55), F(60)], DUR - ys, 0.25, R, att=0.6, rel=1.0), ys, 0.25)
stab(dna, 31, 0.3); stab(boy, 33, 0.6); put(sfx, ding(1320, 1.4), boy + 0.05, 0.18); coo(boy + 0.5, 0.2)
for name, x in [("music.wav", music), ("sfx.wav", sfx)]:
    x = x[: ns(DUR)]; x = x / (np.max(np.abs(x)) + 1e-9) * 0.9
    wavfile.write(f"{J}/audio/{name}", SR, x.astype(np.float32))
print(VID, "stems ok")
