exec(open("/root/work/tools/stemlib_head.py").read())
def chime(t0, g=0.2): put(sfx, ding(1320, 1.2), t0, g); put(sfx, ding(1760, 1.0), t0 + 0.12, g * 0.7)
def stampsfx(t0, g=0.45): put(sfx, thunk(120, 0.25), t0, g); put(sfx, noise_burst(0.08, 600, 2500, 0.02), t0, g * 0.6)
def flutter(t0, g=0.25):
    for k in range(5): put(sfx, noise_burst(0.12, 1500, 6000, 0.03), t0 + k * 0.22, g)
def coins(t0, g=0.2):
    for k in range(6): put(sfx, ding(2200 + 300 * (k % 3), 0.3), t0 + k * 0.06, g * (1 - k * 0.12))
paris = w(0, "^Paris"); so = w(0, "^so$"); hotel = w(0, "^and$") if False else 17.9; l1 = w(1, "^7"); one = w(2, "^One"); cf = w(2, "^confesses")
l3 = w(3, "^A$"); pays = w(4, "^pays"); fl = w(4, "^flees"); ys = w(4, "^You$"); andl = 49.15; ag = w(4, "^again")
# hook: sneaky pizzicato con-man groove (minor), stab on TWICE, hit on Why
sc = [57, 60, 62, 64, 67, 69]; mel = [0, 2, 1, 3, 2, 4, 3, 1]
t = 0.3; k = 0
while t < ys - 0.2:
    if not (cf - 0.2 < t < l3): put(music, I.pluck(F(sc[mel[k % 8]] - 12), 0.4, R, 0.7), t, 0.3 if t < 33.7 else 0.24)
    t += 0.36; k += 1
put(music, I.pad([F(45), F(52), F(57)], ys - 0.3, 0.26, R, att=0.4, rel=0.6), 0.3, 0.26)
stab(0.3, 33, 0.5); stab(w(0, "^twice"), 31, 0.55); stab(w(0, "^Why"), 33, 0.4)
put(sfx, whoosh(0.4), 7.2, 0.4); chime(paris, 0.18)
rumble(w(0, "^rusting"), 1.4, 0.3)
put(sfx, whoosh(0.35), 12.8, 0.35)
# desk: stamps, envelopes
st = w(0, "^government"); inv = w(0, "^invites"); tt0 = st
while tt0 < inv: stampsfx(tt0 + 0.16, 0.4); tt0 += 0.6
flutter(inv, 0.22)
# hotel: hush, chandelier tinkle, stab on torn down, murmur
put(sfx, whoosh(0.4), 17.7, 0.35); chime(18.2, 0.1); stab(w(0, "^torn"), 29, 0.55)
heartbeat(l1, w(1, "^Highest"), 0.3, 0.8, 0.6); stab(w(1, "^wins"), 33, 0.4)
# couple: suspicious woodwind-ish glock, hush before confess
for i in range(int((cf - one) / 0.7)): put(music, I.glock(F([76, 72, 74, 71][i % 4]), 0.3, R, 1.2), one + i * 0.7, 0.16)
put(sfx, ding(990, 1.0), w(2, "^rat"), 0.12)
put(music, I.pad([F(40), F(47), F(52)], l3 - cf, 0.3, R, att=0.3, rel=0.3), cf, 0.3)
stab(w(2, "^bribe"), 29, 0.5)
# deal: coins, train escape
stab(l3, 33, 0.35); coins(pays, 0.25); coins(w(4, "^price"), 0.22)
put(sfx, whoosh(0.5), 40.5, 0.45); engine(40.6, 2.6, 0.22); put(sfx, ding(660, 1.6), 41.0, 0.1)
# shame: sad low pad + music box, sting at said nothing
put(music, I.pad([F(43), F(50), F(55), F(58)], andl - ys, 0.3, R, att=0.6, rel=0.8), ys, 0.3)
mbox(ys, andl - 0.3, [70, 67, 65, 62, 63, 65, 67, 62], 0.62, 0.22)
stab(w(4, "^embarrassed"), 29, 0.35)
# tower: groove returns, stab on again, SOLD hit
put(sfx, whoosh(0.6), 48.9, 0.4)
t = andl; k = 0
while t < DUR - 0.6: put(music, I.pluck(F(sc[mel[k % 8]] - 12), 0.4, R, 0.7), t, 0.3); t += 0.36; k += 1
put(music, I.pad([F(45), F(52), F(57)], DUR - andl, 0.26, R, att=0.4, rel=1.0), andl, 0.26)
stab(ag, 33, 0.6); put(sfx, thunk(70, 0.4), ag, 0.4)
for name, x in [("music.wav", music), ("sfx.wav", sfx)]:
    x = x[: ns(DUR)]; x = x / (np.max(np.abs(x)) + 1e-9) * 0.9
    wavfile.write(f"{J}/audio/{name}", SR, x.astype(np.float32))
print(VID, "stems ok")
