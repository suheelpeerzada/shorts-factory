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
