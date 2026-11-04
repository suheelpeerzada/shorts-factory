# Boxed 1-3 word captions + opening title card for the Napoleon short. Usage: python3 make_ass.py work/words.json out.ass
import json, sys
from PIL import ImageFont

words = json.load(open(sys.argv[1]))
# *x* key (yellow), ^x^ number (cyan), !x! hero (chunk gets a yellow box + dark text). x=Display overrides the text.
PLAN = """Napoleon
*conquered*
half of *Europe.*
Then he
*lost* a battle
to !rabbits.!
It's ^eighteen-oh-seven.=1807.^
According to
one of his
own *generals,*
Napoleon's
chief of staff
planned a
*rabbit* *hunt*
to *celebrate*
a *peace* *treaty.*
He had
a ^thousand^
*rabbits*
*released*
onto the field.
The *guns*
were *ready.*
The *emperor*
stepped out.
And the *rabbits*
!charged.!
Not *away*
from him.
!Straight!
at him.
His men
drove them back
with *whips.*
The rabbits
*split* *up*
and came
at him
from the *sides.*
They *swarmed*
his legs
until Napoleon
*retreated*
to his *carriage.*
You see,
these weren't
!wild! rabbits.
They'd been
*bought*
from *farmers.*
And they thought
the most
*feared* *man*
in *Europe*
had brought them
!cabbage.!""".split("\n")

import os
FONT = os.path.expanduser("~/.fonts/Montserrat-Black.ttf")
WHITE, YELLOW, CYAN, INKC = "&HFFFFFF&", "&H2EE0FF&", "&HFFE53D&", "&H261724&"
BOXC = "&H241418&"  # dark plum box (BGR)
BASE, KEY = 100, 116
Y = 1400
DUR = 40.75

def tag(tok):
    for m, k in (("!", "hero"), ("*", "key"), ("^", "num")):
        if tok.startswith(m): tok = tok.strip(m); break
    else: k = "norm"
    src, _, disp = tok.partition("=")
    return k, src, (disp or src)

chunks, i = [], 0
for line in PLAN:
    items = []
    for tok in line.split():
        k, src, disp = tag(tok)
        assert words[i]["w"] == src, (words[i]["w"], src)
        items.append(dict(kind=k, txt=disp.upper(), s=words[i]["s"], e=words[i]["e"])); i += 1
    chunks.append(items)
assert i == len(words)

def size(k, sc): return int((KEY if k in ("key", "num", "hero") else BASE) * sc)
def width(items, sc):
    return sum(ImageFont.truetype(FONT, size(it["kind"], sc)).getlength(it["txt"] + " ") for it in items) - ImageFont.truetype(FONT, int(BASE * sc)).getlength(" ")
def ts(t):
    cs = int(round(max(0, t) * 100)); return f"{cs//360000}:{cs//6000%60:02d}:{cs//100%60:02d}.{cs%100:02d}"
def rrect(w, h, r):
    x0, y0, x1, y1 = 0, 0, w, h
    return (f"m {x0+r} {y0} l {x1-r} {y0} b {x1} {y0} {x1} {y0} {x1} {y0+r} l {x1} {y1-r} b {x1} {y1} {x1} {y1} {x1-r} {y1} "
            f"l {x0+r} {y1} b {x0} {y1} {x0} {y1} {x0} {y1-r} l {x0} {y0+r} b {x0} {y0} {x0} {y0} {x0+r} {y0}")

POP = "\\fscx80\\fscy80\\t(0,90,\\fscx106\\fscy106)\\t(90,160,\\fscx100\\fscy100)"
HPOP = "\\fscx45\\fscy45\\frz-4\\t(0,130,\\fscx114\\fscy114\\frz2)\\t(130,240,\\fscx100\\fscy100\\frz0)"
ev = []
for ci, items in enumerate(chunks):
    hero = any(it["kind"] == "hero" for it in items)
    sc = min(1.0, 900 / width(items, 1.0))
    st0 = max(0, items[0]["s"] - 0.04)
    nxt = chunks[ci + 1][0]["s"] - 0.04 if ci + 1 < len(chunks) else DUR
    en0 = min(nxt, items[-1]["e"] + 0.6) if ci + 1 < len(chunks) else DUR
    bw, bh = int(width(items, sc) + 56), int(KEY * sc * 1.32)
    pop = HPOP if hero else POP
    mv = f"\\move(540,{Y+18},540,{Y},0,130)"
    box = YELLOW if hero else BOXC
    balpha = "&H00&" if hero else "&H30&"
    # box: drawing centred by \an7 offset
    ev.append(f"Dialogue: 1,{ts(st0)},{ts(en0)},Box,,0,0,0,,{{\\an5{mv}{pop}\\bord5\\3c{INKC}\\shad6\\4a&H90&\\1c{box}\\1a{balpha}\\p1}}{rrect(bw, bh, int(bh*0.32))}{{\\p0}}")
    for k, it in enumerate(items):
        s0 = st0 if k == 0 else it["s"]
        e0 = en0 if k == len(items) - 1 else items[k + 1]["s"]
        if e0 <= s0: continue
        head = f"{{\\an5{mv}{pop}}}" if k == 0 else f"{{\\an5\\pos(540,{Y})}}"
        parts = []
        for j, w in enumerate(items):
            fs = size(w["kind"], sc)
            if hero: col = INKC if w["kind"] == "hero" else INKC; act = INKC
            else:
                col = {"norm": WHITE, "key": YELLOW, "num": CYAN}[w["kind"]]; act = YELLOW if w["kind"] == "norm" else col
            bord = "\\bord0\\shad0" if hero else "\\bord3\\3c&H000000&\\shad0"
            if j < k: parts.append(f"{{\\alpha&H00&\\fs{fs}\\c{col}{bord}}}{w['txt']}")
            elif j == k:
                fade = "" if k == 0 else "\\alpha&H70&\\t(0,90,\\alpha&H00&)"
                parts.append(f"{{\\alpha&H00&{fade}\\fs{fs}\\c{act}{bord}}}{w['txt']}")
            else: parts.append(f"{{\\alpha&HFF&\\fs{fs}{bord}}}{w['txt']}")
        ev.append(f"Dialogue: 2,{ts(s0)},{ts(e0)},Cap,,0,0,0,,{head}" + " ".join(parts))

# ---- opening title card (full screen) ----
T_END = 2.45
out = f"\\t({int(T_END*1000)-200},{int(T_END*1000)},\\fscx70\\fscy70\\alpha&HFF&)"
ev.append(f"Dialogue: 0,{ts(0)},{ts(T_END)},Box,,0,0,0,,{{\\an7\\pos(0,0)\\bord0\\shad0\\1c&H000000&\\1a&H70&\\t({int(T_END*1000)-200},{int(T_END*1000)},\\1a&HFF&)\\p1}}m 0 0 l 1080 0 l 1080 1920 l 0 1920{{\\p0}}")
ev.append(f"Dialogue: 3,{ts(0)},{ts(T_END)},Cap,,0,0,0,,{{\\an5\\pos(540,560)\\fs165\\bord8\\shad6\\4a&H80&{POP}{out}}}NAPOLEON")
ev.append(f"Dialogue: 3,{ts(0.22)},{ts(T_END)},Cap,,0,0,0,,{{\\an5\\pos(540,710)\\fs96\\c{CYAN}\\bord7\\shad5\\4a&H80&{POP}{out}}}VS.")
tw = int(ImageFont.truetype(FONT, 132).getlength("1,000 RABBITS") * 112 / 132 + 70)
ev.append(f"Dialogue: 3,{ts(0.42)},{ts(T_END)},Box,,0,0,0,,{{\\an5\\pos(540,880)\\bord6\\3c{INKC}\\shad8\\4a&H80&\\1c{YELLOW}{HPOP}{out}\\p1}}{rrect(tw, 170, 54)}{{\\p0}}")
ev.append(f"Dialogue: 4,{ts(0.42)},{ts(T_END)},Cap,,0,0,0,,{{\\an5\\pos(540,880)\\fs112\\c{INKC}\\bord0\\shad0{HPOP}{out}}}1,000 RABBITS")

hdr = f"""[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,Montserrat Black,{BASE},&H00FFFFFF,&H00FFFFFF,&H00000000,&H64000000,0,0,0,0,100,100,1,0,1,3,0,5,40,40,0,1
Style: Box,Montserrat Black,{BASE},&H00241418,&H00FFFFFF,&H00261724,&H90000000,0,0,0,0,100,100,0,0,1,5,6,5,0,0,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
open(sys.argv[2], "w").write(hdr + "\n".join(ev) + "\n")
print(len(chunks), "chunks,", max(len(c) for c in chunks), "max words")
