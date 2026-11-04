// Cast for "Napoleon vs. the Rabbits": outfits on top of toon.js, plus our own rabbit, cabbage, hutch and fx drawings.
import { Pen, bodyFront, bodySide, INK, SKIN, mul, shade } from "./toon.js";
export { Pen, bodyFront, bodySide, INK };

export const GENERAL = { jacket: "#2b3f7c", pants: "#efe9dc", boots: INK, hat: "bicorne", buttons: "#e8c45a", build: "stout", skin: SKIN, sash: null };
export const CHIEF = { jacket: "#2b3f7c", pants: "#efe9dc", boots: INK, hat: "bicorne", trim: "#e8c45a", plume: "#f4f1ea", buttons: "#e8c45a",
  sash: "#c9353a", moustache: "#5a3a26", skin: "#f5c9a0", sword: true };
export const hunter = (v) => ({ jacket: ["#2c4f9e", "#335aa8", "#28488f"][v % 3], pants: "#efe9dc", boots: INK, hat: "shako", belt: "#f1efe6",
  buttons: "#d9dde0", rifle: true, skin: ["#ffe2c2", "#f5c9a0", "#ecd0b6"][v % 3], moustache: v % 2 ? "#4a3426" : undefined });
export const beater = (v) => ({ ...hunter(v), rifle: false, hat: "cap", cap: ["#7a2d2d", "#4d5a2a", "#6a4a2a"][v % 3], jacket: ["#7b6a4a", "#5d6a4a", "#8a5a3a"][v % 3] });
export const FARMER = { jacket: "#9a7a46", pants: "#4f4a3a", boots: "#5a3b2a", hat: "cap", cap: "#d8b25a", skin: "#f5c9a0", moustache: "#6a4a30" };

/** character card: draws on a 1200x2000 canvas (design 600x1000 at 2x) */
export const drawPerson = (g, o, opts) => {
  g.save(); g.scale(2, 2);
  const p = new Pen(g);
  if (opts.side) bodySide(p, o, opts); else bodyFront(p, o, opts);
  g.restore();
};

// ---------------- rabbit (our own design) ----------------
const RAB = [
  { fur: "#a9784f", dark: "#7d5434", belly: "#e8d3b4" },
  { fur: "#9c9ba5", dark: "#6f6e7a", belly: "#ecebef" },
  { fur: "#f1ece2", dark: "#cfc6b6", belly: "#ffffff" },
  { fur: "#c99a62", dark: "#9a6c3e", belly: "#f3e2c6" },
];
const PINK = "#f0a3ad";
/** side rabbit facing right on a 512x512 canvas, soles at y=490. hop 0..1 (0 = crouch, .5 = airborne stretch).
 *  look: 0 = profile, 1 = head turned toward camera. */
export const drawRabbit = (g, v, hop = 0, opts = {}) => {
  const C = RAB[v % RAB.length], p = new Pen(g); p.ol = 7;
  const air = Math.sin(Math.PI * hop), lift = air * 70, st = air;
  const cx = 250, cy = 400 - lift, rot = -0.22 * st + 0.05;
  g.save(); g.translate(cx, cy); g.rotate(rot); g.translate(-cx, -cy);
  // far ear
  p.ell(cx + 70, cy - 150 - 10 * st, 17, 62, mul(C.fur, [0.85, 0.85, 0.9]), 6, 0, 360, -28 - 18 * st);
  // hind leg (extends back when airborne)
  p.ell(cx - 70 - 40 * st, cy + 55 + 10 * st, 62, 22, C.dark, 6, 0, 360, -8 + 30 * st);
  // body
  p.ell(cx, cy, 100 + 18 * st, 70 - 10 * st, C.fur, 7);
  p.clip([[cx - 130, cy + 10], [cx + 130, cy + 10], [cx + 130, cy + 90], [cx - 130, cy + 90]], () => p.ell(cx + 10, cy + 25, 80, 40, C.belly, 0));
  p.ell(cx, cy, 100 + 18 * st, 70 - 10 * st, null, 7);
  // tail
  p.ell(cx - 108 - 10 * st, cy - 18, 26, 24, "#ffffff", 6);
  // front paws
  p.ell(cx + 80 + 30 * st, cy + 62 - 4 * st, 22, 13, C.fur, 5, 0, 360, 20 * st);
  // head
  const hx = cx + 92, hy = cy - 62;
  p.ell(hx, hy, 52, 46, C.fur, 7);
  // near ear
  p.ell(hx - 18, hy - 88 - 8 * st, 19, 66, C.fur, 7, 0, 360, -14 - 20 * st);
  p.ell(hx - 18, hy - 88 - 8 * st, 8, 46, PINK, 0, 0, 360, -14 - 20 * st);
  if (opts.look) { // eyes toward camera
    p.ell(hx - 6, hy - 6, 9, 12, INK, 0); p.ell(hx + 24, hy - 6, 9, 12, INK, 0);
    p.dot(hx - 3, hy - 10, 3, "#ffffff"); p.dot(hx + 27, hy - 10, 3, "#ffffff");
    p.ell(hx + 10, hy + 14, 7, 5, PINK, 3);
  } else {
    p.ell(hx + 18, hy - 8, 8, 11, INK, 0); p.dot(hx + 20, hy - 12, 2.6, "#ffffff");
    p.ell(hx + 49, hy + 8, 6, 5, PINK, 3);
    p.stroke([[hx + 44, hy + 18], [hx + 36, hy + 24]], 3);
  }
  g.restore();
};

/** front rabbit sitting up, staring at camera, 512x512, soles at y=490. beg 0..1 raises the paws */
export const drawRabbitFront = (g, v, beg = 0, blink = 0) => {
  const C = RAB[v % RAB.length], p = new Pen(g); p.ol = 7;
  const cx = 256, by = 400 - 18 * beg;
  p.ell(cx - 34, 470, 40, 20, C.dark, 6); p.ell(cx + 34, 470, 40, 20, C.dark, 6);
  p.ell(cx, by, 92, 90 + 8 * beg, C.fur, 7);
  p.ell(cx, by + 20, 58, 60, C.belly, 0);
  p.ell(cx, by, 92, 90 + 8 * beg, null, 7);
  // paws
  for (const s of [-1, 1]) p.ell(cx + s * 30, by - 10 - 50 * beg, 20, 16, C.fur, 5);
  const hy = by - 120;
  for (const s of [-1, 1]) {
    p.ell(cx + s * 34, hy - 105, 21, 72, C.fur, 7, 0, 360, s * 10);
    p.ell(cx + s * 34, hy - 105, 9, 50, PINK, 0, 0, 360, s * 10);
  }
  p.ell(cx, hy, 70, 60, C.fur, 7);
  if (blink) for (const s of [-1, 1]) p.stroke([[cx + s * 26 - 9, hy - 6], [cx + s * 26 + 9, hy - 6]], 4);
  else for (const s of [-1, 1]) { p.ell(cx + s * 26, hy - 6, 11, 15, INK, 0); p.dot(cx + s * 26 + 3, hy - 12, 4, "#ffffff"); }
  p.ell(cx, hy + 16, 9, 6, PINK, 3);
  p.stroke([[cx, hy + 22], [cx, hy + 30], [cx - 8, hy + 36]], 3); p.stroke([[cx, hy + 30], [cx + 8, hy + 36]], 3);
};

/** cabbage on 512x512, centred, base at y=490 */
export const drawCabbage = (g) => {
  const p = new Pen(g); p.ol = 8;
  const cx = 256, cy = 330;
  p.ell(cx, cy, 150, 140, "#5f9e3c", 8);
  for (const [dx, dy, rx, ry, r, c] of [[-80, 20, 90, 120, -25, "#78b84a"], [80, 20, 90, 120, 25, "#78b84a"], [0, -10, 95, 100, 0, "#9ad06a"]]) p.ell(cx + dx, cy + dy, rx, ry, c, 7, 0, 360, r);
  for (const s of [-1, 0, 1]) p.stroke([[cx + s * 30, cy + 80], [cx + s * 10, cy - 60]], 4, "#4c7f2f");
};

/** hutch of rabbits (wooden crate with mesh front, rabbits peering), 600x480 */
export const drawHutch = (g) => {
  const p = new Pen(g); p.ol = 8;
  p.poly([[40, 120], [560, 120], [560, 460], [40, 460]], "#a26f3f", 8);
  p.poly([[80, 160], [520, 160], [520, 420], [80, 420]], "#3d2a1d", 6);
  g.save(); g.beginPath(); g.rect(80, 160, 440, 260); g.clip();
  for (const [x, v] of [[170, 0], [330, 2], [440, 1]]) { g.save(); g.translate(x - 128, 170); g.scale(0.5, 0.5); drawRabbitFront(g, v); g.restore(); }
  g.restore();
  g.strokeStyle = "#c9ccd2"; g.lineWidth = 3;
  for (let x = 100; x < 520; x += 28) { g.beginPath(); g.moveTo(x, 160); g.lineTo(x, 420); g.stroke(); }
  for (let y = 180; y < 420; y += 28) { g.beginPath(); g.moveTo(80, y); g.lineTo(520, y); g.stroke(); }
  p.poly([[20, 120], [580, 120], [560, 80], [40, 80]], "#7d522c", 8);
};

/** "!" / speed lines / dust puff effects on 512x512 */
export const drawExclaim = (g, t = 1) => {
  const p = new Pen(g); p.ol = 7; const s = 0.6 + 0.4 * t;
  g.save(); g.translate(256, 256); g.scale(s, s); g.translate(-256, -256);
  p.poly([[226, 60], [286, 60], [272, 330], [240, 330]], "#ffe14a", 8); p.ell(256, 400, 34, 34, "#ffe14a", 8);
  g.restore();
};
export const drawPuff = (g, t) => {
  const p = new Pen(g); p.ol = 6; const a = 1 - t;
  g.globalAlpha = Math.max(0, a);
  for (let i = 0; i < 6; i++) { const an = (i / 6) * Math.PI * 2, r = 60 + 150 * t; p.ell(256 + Math.cos(an) * r, 300 + Math.sin(an) * r * 0.5, 50 * (1 - 0.4 * t), 42 * (1 - 0.4 * t), "#f1e6cf", 5); }
  g.globalAlpha = 1;
};
export const drawShadowBlob = (g) => {
  const gr = g.createRadialGradient(256, 256, 0, 256, 256, 250);
  gr.addColorStop(0, "rgba(20,14,24,0.55)"); gr.addColorStop(0.6, "rgba(20,14,24,0.35)"); gr.addColorStop(1, "rgba(20,14,24,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 512, 512);
};

/** thought bubble with a cabbage, 512x512 (tail toward bottom-left) */
export const drawBubble = (g) => {
  const p = new Pen(g); p.ol = 7;
  p.ell(110, 470, 18, 16, "#ffffff", 6); p.ell(160, 420, 30, 26, "#ffffff", 6);
  const pts = [];
  for (let i = 0; i < 64; i++) { const a = (i / 64) * Math.PI * 2, r = 1 + 0.07 * Math.cos(a * 7); pts.push([290 + Math.cos(a) * 190 * r, 210 + Math.sin(a) * 160 * r]); }
  p.poly(pts, "#ffffff", 8);
  g.save(); g.translate(290 - 128, 210 - 150); g.scale(0.5, 0.5); drawCabbage(g); g.restore();
};
/** soft painted cloud, 1024x512 */
export const drawCloud = (g, seed) => {
  const r = (k) => { const x = Math.sin(seed * 91.7 + k * 47.3) * 9123.1; return x - Math.floor(x); };
  for (const [col, dy] of [["#e9eef6", 18], ["#ffffff", 0]]) {
    g.fillStyle = col; g.beginPath();
    for (let i = 0; i < 7; i++) { const x = 180 + i * 110 + r(i) * 40, y = 300 - Math.sin((i / 6) * Math.PI) * (90 + r(i + 9) * 60) + dy, rr = 90 + r(i + 3) * 60; g.moveTo(x + rr, y); g.arc(x, y, rr, 0, Math.PI * 2); }
    g.rect(150, 300 + dy, 720, 90); g.fill();
  }
};

// ---------------- bat-bomb cast ----------------
export const DENTIST = { jacket: "#f4f4f2", pants: "#4a5060", boots: "#3a2a20", hat: "hair", hair: "#6a4a30", moustache: "#5a3a26", skin: "#f5c9a0", buttons: "#c9ccd2" };
export const GENERAL_US = { jacket: "#6b6a45", pants: "#5c5a3c", boots: "#3a2a20", hat: "cap", cap: "#55543a", buttons: "#e8c45a", moustache: "#9a9a9a", build: "stout", skin: "#ffe2c2" };
export const SCIENTIST = { jacket: "#f4f4f2", pants: "#3b3f52", boots: "#2a2630", hat: "hair", hair: "#9a9aa0", skin: "#ecd0b6", buttons: "#c9ccd2" };
export const soldierUS = (v) => ({ jacket: ["#6f6c47", "#66643f", "#77744d"][v % 3], pants: "#5c5a3c", boots: "#3a2a20", hat: "cap", cap: "#5e5c3d", skin: ["#ffe2c2", "#f5c9a0", "#c99067"][v % 3], buttons: "#c9b06a", moustache: v % 2 ? "#4a3426" : undefined });
const BAT = { fur: "#6b5a63", dark: "#4a3d46", wing: "#3f3340", belly: "#8f7c84" };
/** bat on 512x512, body centre (256,250). mode: fly | sleep | hang. flap 0..1. eyes: open | shut | smug | wide */
export const drawBat = (g, flap = 0, opts = {}) => {
  const { mode = "fly", eyes = "open", harness = false } = opts;
  const p = new Pen(g); p.ol = 7;
  g.save();
  if (mode === "hang") { g.translate(256, 256); g.rotate(Math.PI); g.translate(-256, -256); }
  const cx = 256, cy = 250;
  if (mode === "fly") {
    const up = Math.sin(flap * Math.PI * 2);
    for (const s of [-1, 1]) {
      const tipY = cy - 70 - 90 * up, midY = cy - 20 - 40 * up;
      const pts = [[cx + s * 30, cy - 20], [cx + s * 120, midY - 30], [cx + s * 220, tipY], [cx + s * 200, cy + 20 - 30 * up], [cx + s * 160, cy + 10 - 10 * up], [cx + s * 120, cy + 40 - 20 * up], [cx + s * 80, cy + 20], [cx + s * 40, cy + 40]];
      p.poly(pts, BAT.wing, 7);
      p.stroke([[cx + s * 40, cy - 15], [cx + s * 160, cy + 10 - 10 * up]], 3, "#2a2230");
      p.stroke([[cx + s * 40, cy - 15], [cx + s * 200, cy + 20 - 30 * up]], 3, "#2a2230");
    }
  } else {
    p.ell(cx, cy + 10, 78, 100, BAT.wing, 7); // wings wrapped like a cloak
    p.stroke([[cx - 40, cy - 60], [cx - 50, cy + 90]], 3, "#2a2230"); p.stroke([[cx + 40, cy - 60], [cx + 50, cy + 90]], 3, "#2a2230");
  }
  p.ell(cx, cy, 52, 64, BAT.fur, 7);
  p.ell(cx, cy + 12, 30, 36, BAT.belly, 0);
  if (harness) {
    p.band([[cx - 52, cy - 5], [cx + 52, cy - 5]], "#c9a45a", 10, 2.5);
    p.poly([[cx - 22, cy + 52], [cx + 22, cy + 52], [cx + 22, cy + 100], [cx - 22, cy + 100]], "#d9553a", 6);
    p.ell(cx, cy + 100, 22, 8, "#b8402c", 5);
    p.stroke([[cx, cy + 52], [cx, cy + 40]], 4, "#2a2230");
  }
  // head
  const hy = cy - 82;
  for (const s of [-1, 1]) { p.poly([[cx + s * 18, hy - 20], [cx + s * 48, hy - 78], [cx + s * 46, hy - 8]], BAT.fur, 6); p.poly([[cx + s * 24, hy - 22], [cx + s * 42, hy - 60], [cx + s * 40, hy - 14]], "#d99aa8", 0); }
  p.ell(cx, hy, 50, 42, BAT.fur, 7);
  for (const s of [-1, 1]) {
    const ex = cx + s * 20, ey = hy - 4;
    if (eyes === "shut") p.arc(ex, ey + 2, 10, 6, 20, 160, 4);
    else if (eyes === "smug") { p.ell(ex, ey, 11, 8, "#ffffff", 3); p.dot(ex + 2, ey + 2, 4); p.stroke([[ex - 12, ey - 3], [ex + 12, ey - 3]], 4); }
    else if (eyes === "wide") { p.ell(ex, ey, 15, 15, "#ffffff", 3); p.dot(ex, ey + 1, 5); }
    else { p.ell(ex, ey, 11, 12, "#ffffff", 3); p.dot(ex + s, ey + 2, 5); }
  }
  p.ell(cx, hy + 12, 6, 4, "#3a2a30", 0);
  if (eyes === "smug") p.arc(cx, hy + 18, 14, 8, 20, 160, 4);
  else if (eyes === "wide") p.ell(cx, hy + 24, 7, 8, "#5a1e28", 3);
  else { p.stroke([[cx - 10, hy + 22], [cx, hy + 26], [cx + 10, hy + 22]], 3); p.poly([[cx - 8, hy + 22], [cx - 4, hy + 30], [cx - 1, hy + 23]], "#ffffff", 2); p.poly([[cx + 8, hy + 22], [cx + 4, hy + 30], [cx + 1, hy + 23]], "#ffffff", 2); }
  if (mode === "hang") { for (const s of [-1, 1]) p.stroke([[cx + s * 14, cy + 60], [cx + s * 14, cy + 120]], 6, "#2a2230"); }
  g.restore();
};
export const drawZzz = (g) => {
  g.font = "900 120px Montserrat, Arial Black, sans-serif"; g.lineWidth = 14; g.strokeStyle = "#241726"; g.fillStyle = "#ffffff";
  for (const [t, x, y, s] of [["Z", 140, 400, 1], ["z", 260, 270, 0.8], ["z", 350, 160, 0.6]]) { g.save(); g.translate(x, y); g.scale(s, s); g.strokeText(t, 0, 0); g.fillText(t, 0, 0); g.restore(); }
};
export const drawFlame = (g, t = 0) => {
  const p = new Pen(g); p.ol = 7;
  const w = (k) => Math.sin(t * 6.283 + k) * 18;
  p.poly([[130, 490], [110 + w(1), 300], [180 + w(2), 340], [200 + w(3), 120], [256 + w(4), 260], [300 + w(5), 60], [330 + w(6), 280], [380 + w(7), 200], [400 + w(8), 490]], "#ff8a2a", 8);
  p.poly([[180, 490], [190 + w(2), 360], [240 + w(3), 400], [270 + w(4), 230], [300 + w(5), 380], [340 + w(6), 330], [350, 490]], "#ffd23f", 0);
};
export const drawStamp = (g, stamped = 0) => {
  const p = new Pen(g); p.ol = 7;
  g.save(); g.translate(256, 256); g.rotate(-0.06); g.translate(-256, -256);
  p.poly([[96, 40], [416, 40], [416, 470], [96, 470]], "#f7f1e1", 7);
  g.fillStyle = "#241726"; g.font = "900 34px Montserrat, Arial Black, sans-serif"; g.textAlign = "center"; g.fillText("PROJECT X-RAY", 256, 110);
  for (let i = 0; i < 7; i++) { g.fillStyle = "#b9b1a0"; g.fillRect(130, 150 + i * 34, 250 - (i % 3) * 40, 10); }
  if (stamped > 0) {
    g.save(); g.globalAlpha = Math.min(1, stamped); g.translate(256, 330); g.rotate(-0.25); g.scale(1 + 0.6 * (1 - Math.min(1, stamped)), 1 + 0.6 * (1 - Math.min(1, stamped)));
    g.strokeStyle = "#c9353a"; g.lineWidth = 12; g.strokeRect(-150, -55, 300, 110);
    g.fillStyle = "#c9353a"; g.font = "900 70px Montserrat, Arial Black, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("APPROVED", 0, 4);
    g.restore();
  }
  g.restore();
};
export const drawLetter = (g) => {
  const p = new Pen(g); p.ol = 7;
  p.poly([[70, 140], [442, 140], [442, 380], [70, 380]], "#f7f1e1", 8);
  p.stroke([[70, 140], [256, 290], [442, 140]], 7);
  p.ell(256, 290, 30, 30, "#c9353a", 6);
};
export const drawTray = (g) => {
  const p = new Pen(g); p.ol = 7;
  p.poly([[30, 300], [482, 300], [460, 440], [52, 440]], "#cfe8f2", 8);
  for (let i = 0; i < 4; i++) {
    const x = 60 + i * 104;
    g.save(); g.translate(x, 200); g.scale(0.36, 0.36); drawBat(g, 0, { mode: "sleep", eyes: "shut", harness: true }); g.restore();
  }
  p.poly([[30, 360], [482, 360], [460, 440], [52, 440]], "#e8f6fb", 8);
  for (let i = 1; i < 4; i++) p.stroke([[30 + i * 113, 362], [44 + i * 104, 438]], 5, "#9cc6d6");
};
export const drawToothSign = (g) => {
  const p = new Pen(g); p.ol = 8;
  p.poly([[40, 60], [472, 60], [472, 330], [40, 330]], "#3f6fb5", 8);
  g.fillStyle = "#ffffff"; g.font = "900 64px Montserrat, Arial Black, sans-serif"; g.textAlign = "center"; g.fillText("DENTIST", 256, 290);
  p.poly([[200, 90], [312, 90], [330, 150], [296, 230], [272, 180], [240, 180], [216, 230], [182, 150]], "#ffffff", 6);
  p.stroke([[256, 330], [256, 480]], 14);
};

// ---------------- Onoda cast ----------------
export const ONODA = { jacket: "#7d7a4c", pants: "#6e6b44", boots: "#3a2a20", hat: "cap", cap: "#6a6640", buttons: "#c9b06a", rifle: true, skin: "#f1c9a0" };
export const ONODA_OLD = { ...ONODA, jacket: "#6f6a45", pants: "#5e5a3c", cap: "#5e5a3a", moustache: "#3a2a20" };
export const OFFICER_JP = { jacket: "#7d7a4c", pants: "#6e6b44", boots: "#3a2a20", hat: "cap", cap: "#6a6640", buttons: "#e8c45a", sword: true, sash: null, moustache: "#2a201a", skin: "#f5c9a0", build: "stout" };
export const BOOKSELLER = { jacket: "#8a6a4a", pants: "#4a4a52", boots: "#3a2a20", hat: "hair", hair: "#b9b9bd", moustache: "#9a9a9a", skin: "#f5c9a0", buttons: "#d9c9a6", build: "stout" };
export const TRAVELLER = { jacket: "#d9553a", pants: "#3b5b9a", boots: "#f4f1ea", hat: "hair", hair: "#1e1a1c", skin: "#f5c9a0" };
export const drawLeaflet = (g, tilt = 0) => {
  const p = new Pen(g); p.ol = 6;
  g.save(); g.translate(256, 256); g.rotate(tilt); g.translate(-256, -256);
  p.poly([[150, 110], [362, 110], [362, 400], [150, 400]], "#f7f1e1", 6);
  g.fillStyle = "#c9353a"; g.fillRect(175, 140, 162, 40);
  for (let i = 0; i < 6; i++) { g.fillStyle = "#9a9284"; g.fillRect(175, 205 + i * 28, 162 - (i % 3) * 30, 9); }
  g.restore();
};
export const drawPhoto = (g, tilt = 0) => {
  const p = new Pen(g); p.ol = 6;
  g.save(); g.translate(256, 256); g.rotate(tilt); g.translate(-256, -256);
  p.poly([[130, 130], [382, 130], [382, 390], [130, 390]], "#ffffff", 6);
  p.poly([[150, 150], [362, 150], [362, 330], [150, 330]], "#c9b28a", 0);
  for (const [x, c] of [[200, "#ffe2c2"], [256, "#f5c9a0"], [312, "#ecd0b6"]]) { p.ell(x, 225, 24, 24, c, 4); p.ell(x, 300, 30, 34, "#6a5a7a", 4); }
  g.restore();
};
export const drawYear = (g, text) => {
  let fs = 190; g.font = `900 ${fs}px Montserrat, Arial Black, sans-serif`;
  while (g.measureText(text).width > 470 && fs > 40) { fs -= 6; g.font = `900 ${fs}px Montserrat, Arial Black, sans-serif`; } g.textAlign = "center"; g.textBaseline = "middle";
  g.lineWidth = 22; g.strokeStyle = "#241726"; g.strokeText(text, 256, 256); g.fillStyle = "#ffd23f"; g.fillText(text, 256, 256);
};
export const drawOrder = (g) => {
  const p = new Pen(g); p.ol = 6;
  p.poly([[110, 90], [402, 90], [402, 430], [110, 430]], "#f3ead2", 6);
  g.fillStyle = "#c9353a"; p.ell(256, 150, 34, 34, "#c9353a", 0);
  for (let i = 0; i < 7; i++) { g.fillStyle = "#6a5a4a"; g.fillRect(150, 215 + i * 28, 210 - (i % 2) * 40, 9); }
};

// ---------------- Dancing Plague cast (1518) ----------------
import { fxNote, fxDrum } from "./toon.js";
export const TROFFEA = { jacket: "#8a4a3a", pants: "#3b3f52", boots: "#4a3426", hat: "bonnet", dress: "#c25a3a", skin: "#ffe2c2" };
export const townie = (v) => {
  const coats = ["#5d7a3a", "#3f6fb5", "#b5653f", "#7b5ac9", "#8c3b4a", "#2f5f6a", "#a8873a"];
  const o = { jacket: coats[v % 7], pants: "#4a4434", boots: "#4a3426", skin: ["#ffe2c2", "#f5c9a0", "#ecd0b6", "#f1c9a0"][v % 4] };
  if (v % 3 === 0) return { ...o, hat: "bonnet", dress: ["#d9a441", "#5a8fc2", "#c25a7a", "#6a9a4a"][v % 4] };
  if (v % 3 === 1) return { ...o, hat: "cap", cap: ["#7a2d2d", "#4d5a2a", "#6a4a2a"][v % 3], moustache: v % 2 ? "#4a3426" : undefined };
  return { ...o, hat: "hair", hair: ["#5a3b2a", "#2a201a", "#a8773a"][v % 3] };
};
export const DOCTOR = { jacket: "#3a2a4a", pants: "#2a2630", boots: "#2a2630", hat: "cap", cap: "#1d1b22", moustache: "#8a8a8a", skin: "#f5c9a0", build: "stout", buttons: "#e8c45a" };
export const DOCTOR2 = { jacket: "#2f3f5a", pants: "#2a2630", boots: "#2a2630", hat: "cap", cap: "#1d1b22", skin: "#ecd0b6", buttons: "#c9ccd2" };
export const COUNCIL = { jacket: "#8a2a2a", pants: "#2a2630", boots: "#2a2630", hat: "tophat", sash: "#e8c45a", moustache: "#5a3a26", skin: "#ffe2c2", build: "stout", buttons: "#e8c45a" };
export const MUSICIAN = { jacket: "#4d7a3a", pants: "#6a4a2a", boots: "#4a3426", hat: "cap", cap: "#c9353a", skin: "#f5c9a0" };
export const drawNote = (g, k = 0) => { const p = new Pen(g); p.ol = 6; g.save(); g.translate(110, 60); g.scale(1.6, 1.6); fxNote(p, k, "#1f2a44"); g.restore(); };
export const drawDrum = (g) => { const p = new Pen(g); p.ol = 6; g.save(); g.translate(90, 120); g.scale(1.3, 1.3); fxDrum(p); g.restore(); };

// ---------------- Mike cast (1945) ----------------
import { fxBurst } from "./toon.js";
export const FARMER45 = { jacket: "#3f6fb5", pants: "#3b4a7a", boots: "#5a3b2a", hat: "cap", cap: "#d8b25a", skin: "#f5c9a0", buttons: "#e8c45a" };
export const folk45 = (v) => { const coats = ["#c25a3a", "#3f8a6a", "#7b5ac9", "#d9a441", "#3f6fb5", "#8c3b4a"]; const o = { jacket: coats[v % 6], pants: "#3b3f52", boots: "#4a3426", skin: ["#ffe2c2", "#f5c9a0", "#ecd0b6", "#c99067"][v % 4] };
  return v % 2 ? { ...o, hat: "bonnet", dress: ["#5a8fc2", "#d9a441", "#c25a7a"][v % 3] } : { ...o, hat: v % 4 ? "cap" : "hair", cap: "#8a6a3a", hair: "#3a2a20" }; };
/** chicken on 512x512, soles at y=490, facing right. head: true/false. walk 0..1, peck 0..1, crow 0..1 */
export const drawChicken = (g, o = {}) => {
  const { head = true, walk = 0, peck = 0, crow = 0, scared = false } = o;
  const p = new Pen(g); p.ol = 7;
  const lift = Math.abs(Math.sin(walk * Math.PI * 2)) * 10, cx = 240, cy = 330 - lift;
  // legs
  for (const [s, ph] of [[-1, 0], [1, 0.5]]) { const sw = Math.sin((walk + ph) * Math.PI * 2) * 22; p.stroke([[cx + s * 18, cy + 60], [cx + s * 18 + sw, 470]], 9, "#e8a83a"); p.stroke([[cx + s * 18 + sw - 18, 478], [cx + s * 18 + sw + 22, 478]], 8, "#e8a83a"); }
  g.save(); g.translate(cx, cy + 40); g.rotate(-0.5 * peck + 0.25 * crow); g.translate(-cx, -(cy + 40));
  // tail
  for (let k = 0; k < 4; k++) p.ell(cx - 105 - k * 6, cy - 50 - k * 18, 24, 50, k % 2 ? "#f4f1ea" : "#e6e1d6", 6, 0, 360, -30 - k * 12);
  p.ell(cx, cy, 108, 88, "#f7f4ec", 7);                  // body
  p.ell(cx - 10, cy + 6, 60, 40, "#e9e4d8", 6, 0, 360, -12); // wing
  const nx = cx + 72, ny = cy - 80;
  p.poly([[cx + 40, cy - 40], [nx - 20, ny], [nx + 26, ny], [cx + 96, cy - 26]], "#f7f4ec", 7); // neck
  if (head) {
    p.ell(nx + 4, ny - 30, 40, 38, "#f7f4ec", 7);
    p.ell(nx - 6, ny - 72, 12, 16, "#d9353a", 5); p.ell(nx + 10, ny - 76, 12, 18, "#d9353a", 5); p.ell(nx + 26, ny - 70, 10, 14, "#d9353a", 5);
    p.poly([[nx + 40, ny - 36], [nx + 72, ny - 26 + 8 * crow], [nx + 40, ny - 16]], "#f2b23a", 5);
    p.ell(nx + 34, ny - 6, 9, 13, "#d9353a", 4);
    if (scared) { p.ell(nx + 14, ny - 38, 12, 12, "#ffffff", 3); p.dot(nx + 16, ny - 37, 5); } else p.dot(nx + 16, ny - 38, 6);
  } else {
    p.poly([[nx - 22, ny + 4], [nx + 28, ny + 4], [nx + 22, ny - 22], [nx - 16, ny - 22]], "#ffffff", 6); // bandage wrap
    p.stroke([[nx - 18, ny - 6], [nx + 24, ny - 12]], 3, "#c9ccd2"); p.stroke([[nx - 16, ny - 15], [nx + 22, ny - 18]], 3, "#c9ccd2");
    p.ell(nx + 2, ny - 24, 20, 7, "#f7f4ec", 5);
  }
  g.restore();
  if (crow > 0.3) for (let k = 0; k < 3; k++) p.arc(nx + 70, ny - 40, 30 + k * 24, 30 + k * 24, -40, 40, 6, "#241726");
};
export const drawAxeSwipe = (g, t = 0) => { const p = new Pen(g); p.ol = 7; g.save(); g.translate(256, 420); g.rotate(-1.2 + 1.6 * t); p.band([[0, 0], [0, -300]], "#8a5a34", 26, 6, "round"); p.poly([[-10, -300], [90, -330], [100, -250], [-10, -250]], "#9aa4a8", 7); g.restore(); for (let k = 0; k < 4; k++) p.arc(256, 420, 200 + k * 26, 200 + k * 26, 200 + 90 * t, 230 + 90 * t, 5, "#ffffff"); };
export const drawDropper = (g) => { const p = new Pen(g); p.ol = 7; p.poly([[236, 80], [276, 80], [280, 330], [256, 400], [232, 330]], "#cfe8f2", 7); p.ell(256, 90, 34, 44, "#d9353a", 7); p.ell(256, 440, 10, 14, "#9fd4ff", 4); };
export const drawMag = (g) => { const p = new Pen(g); p.ol = 8;
  p.poly([[100, 40], [412, 40], [412, 480], [100, 480]], "#d9353a", 8); p.poly([[124, 130], [388, 130], [388, 440], [124, 440]], "#f7f1e1", 6);
  g.fillStyle = "#ffffff"; g.font = "900 54px Montserrat, Arial Black, sans-serif"; g.textAlign = "center"; g.fillText("MIRACLE", 256, 112);
  g.save(); g.translate(150, 170); g.scale(0.48, 0.48); drawChicken(g, { head: false }); g.restore(); };
export const drawBill = (g, tilt = 0) => { const p = new Pen(g); p.ol = 6; g.save(); g.translate(256, 256); g.rotate(tilt); g.translate(-256, -256);
  p.poly([[96, 180], [416, 180], [416, 332], [96, 332]], "#8fc97a", 6); p.ell(256, 256, 44, 52, "#cfe8b8", 5);
  g.fillStyle = "#2f6a2a"; g.font = "900 64px Montserrat, Arial Black, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("$", 256, 260); g.restore(); };
export const drawBurst = (g) => { const p = new Pen(g); p.ol = 6; g.save(); g.translate(0, 0); fxBurst(p, 1, "#fff3b0", 12, 50, 240); g.restore(); };
