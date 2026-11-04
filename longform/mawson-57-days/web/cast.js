// Cast for "57 Days Stranded in Antarctica": polar outfits on top of toon.js, plus our own huskies, props and fx drawings.
import { Pen, bodyFront, bodySide, INK, SKIN, mul, shade } from "./toon.js";
export { Pen, bodyFront, bodySide, INK };

// windproof gabardine suits, hoods with fur trim (original cartoon designs)
export const MAWSON = { jacket: "#c9a96a", pants: "#8f7a52", boots: "#6a4a30", hat: "hood", hood: "#c9a96a", fur: "#efe6d6", skin: "#f5d2b0", buttons: "#7a5a36" };
export const MAWSON_THIN = { ...MAWSON, jacket: "#b39762", pants: "#7d6a48", hood: "#b39762", skin: "#e9c9b4", moustache: "#6a4a30" };
export const MAWSON_GAUNT = { ...MAWSON_THIN, jacket: "#a08a5c", hood: "#a08a5c", skin: "#dcc0b4", moustache: "#5a3e2a", fur: "#d9d0c0" };
export const MAWSON_CAP = { ...MAWSON_GAUNT, hat: "cap", cap: "#8a7650" }; // hood down, inside the cave/tent
export const MAWSON_SUIT = { jacket: "#2e3448", pants: "#2a2e3c", boots: "#1d1b22", hat: "hair", hair: "#5a3e2a", skin: "#f5d2b0", buttons: "#c9ccd2", moustache: "#5a3e2a" };
export const NINNIS = { jacket: "#7d8a5a", pants: "#5d6a44", boots: "#4a3426", hat: "cap", cap: "#b5382e", skin: "#ffe2c2", buttons: "#3a3a2a" };
export const MERTZ = { jacket: "#3f6fb5", pants: "#3b4a7a", boots: "#4a3426", hat: "hood", hood: "#3f6fb5", fur: "#f4efe6", skin: "#ffe2c2", buttons: "#e8c45a" };
export const MERTZ_SICK = { ...MERTZ, jacket: "#3a5f96", hood: "#3a5f96", skin: "#e6d2cc" };
export const hutman = (v) => ({ jacket: ["#8a4a3a", "#4d7a3a", "#5a5a7a"][v % 3], pants: "#3b3f52", boots: "#4a3426", hat: "cap",
  cap: ["#3a3a46", "#c9a96a", "#7a2d2d"][v % 3], skin: ["#ffe2c2", "#f5c9a0", "#ecd0b6"][v % 3], moustache: v === 1 ? "#4a3426" : undefined, buttons: "#d9c9a6" });

/** character card: draws on a 1200x2000 canvas (design 600x1000 at 2x) */
export const drawPerson = (g, o, opts) => {
  g.save(); g.scale(2, 2);
  const p = new Pen(g);
  if (opts.side) bodySide(p, o, opts); else bodyFront(p, o, opts);
  g.restore();
};

// ---------------- husky (our own design), side view facing right, 512x512, paws at y = 490 ----------------
const DOG = [
  { fur: "#8d939e", dark: "#5c6270", belly: "#f1eee8" },
  { fur: "#6d6460", dark: "#463e3a", belly: "#ece6dc" },
  { fur: "#c9b08a", dark: "#9a805c", belly: "#f6efe2" },
  { fur: "#a9adb5", dark: "#777b86", belly: "#ffffff" },
];
export const drawHusky = (g, v = 0, phase = 0, opts = {}) => {
  const C = DOG[v % DOG.length], p = new Pen(g); p.ol = 7;
  const two = Math.PI * 2, walk = opts.still ? 0 : 1, bobY = walk * Math.abs(Math.sin(two * phase)) * 6;
  const cx = 240, cy = 330 - bobY - (opts.lie ? -70 : 0), tired = opts.tired ? 1 : 0;
  // legs: far pair darker, near pair fur colour; swing with phase
  const leg = (x, ph, col) => {
    if (opts.lie) { p.ell(x, 470, 34, 14, col, 6); return; }
    const sw = Math.sin(two * (phase + ph)) * 28 * walk, up = Math.max(0, Math.cos(two * (phase + ph))) * 14 * walk;
    p.band([[x, cy + 30], [x + sw * 0.5, cy + 95], [x + sw, 488 - up]], col, 22, 6, "round");
  };
  leg(cx - 80, 0.5, C.dark); leg(cx + 70, 0.0, C.dark);
  // tail (curled over the back, droops when tired)
  if (tired) p.band([[cx - 110, cy - 10], [cx - 150, cy + 30], [cx - 160, cy + 70]], C.fur, 26, 6, "round");
  else p.band([[cx - 110, cy - 20], [cx - 150, cy - 70], [cx - 110, cy - 105], [cx - 80, cy - 70]], C.fur, 28, 6, "round");
  // body
  p.ell(cx, cy, 128, 62, C.fur, 7);
  p.clip([[cx - 140, cy + 5], [cx + 140, cy + 5], [cx + 140, cy + 80], [cx - 140, cy + 80]], () => p.ell(cx + 5, cy + 30, 105, 38, C.belly, 0));
  p.ell(cx, cy, 128, 62, null, 7);
  // harness
  p.band([[cx + 40, cy - 58], [cx + 50, cy + 58]], "#c9353a", 12, 4);
  p.band([[cx - 60, cy - 60], [cx - 50, cy + 56]], "#c9353a", 10, 4);
  leg(cx - 60, 0.0, C.fur); leg(cx + 90, 0.5, C.fur);
  // head
  const hx = cx + 140, hy = cy - 60 + tired * 30 + (opts.lie ? 40 : 0);
  p.poly([[hx - 40, hy - 30], [hx - 30, hy - 100], [hx - 5, hy - 40]], C.dark, 6); // far ear
  p.ell(hx, hy, 58, 48, C.fur, 7);
  p.poly([[hx + 30, hy - 14], [hx + 98, hy + 6], [hx + 92, hy + 30], [hx + 30, hy + 30]], C.belly, 6); // muzzle
  p.ell(hx + 96, hy + 12, 11, 9, INK, 0); // nose
  p.ell(hx - 10, hy + 6, 34, 30, C.belly, 0); // pale mask
  p.poly([[hx - 20, hy - 30], [hx - 6, hy - 108], [hx + 22, hy - 36]], C.fur, 7); // near ear
  p.poly([[hx - 9, hy - 40], [hx - 3, hy - 84], [hx + 10, hy - 42]], "#f0b3bb", 0);
  if (opts.blink || tired) p.stroke([[hx + 16, hy - 8], [hx + 34, hy - 6]], 5);
  else { p.ell(hx + 24, hy - 8, 8, 10, INK, 0); p.dot(hx + 26, hy - 11, 2.6, "#ffffff"); }
  if (opts.pant && !tired) p.ell(hx + 70, hy + 40, 12, 16, "#e86e78", 4);
};

// ---------------- props, 512x512 unless noted ----------------
export const drawStove = (g) => { const p = new Pen(g); p.ol = 7;
  p.ell(256, 420, 120, 40, "#c9a14a", 7); p.poly([[176, 300], [336, 300], [356, 420], [156, 420]], "#d8b25a", 7);
  p.poly([[236, 200], [276, 200], [282, 300], [230, 300]], "#8a8f99", 6); p.ell(256, 190, 90, 18, "#5c6270", 6);
  for (const s of [-1, 1]) p.stroke([[256 + s * 80, 190], [256 + s * 120, 150]], 6);
  p.ell(256, 150, 30, 40, "#ff9a3a", 5); p.ell(256, 160, 14, 20, "#ffe14a", 0); };
export const drawFuel = (g) => { const p = new Pen(g); p.ol = 7;
  p.poly([[166, 140], [346, 140], [346, 470], [166, 470]], "#c9353a", 8); p.poly([[200, 100], [250, 100], [250, 140], [200, 140]], "#8a8f99", 6);
  p.poly([[186, 230], [326, 230], [326, 330], [186, 330]], "#f4f1ea", 5); p.stroke([[206, 280], [306, 280]], 8, "#241726"); };
export const drawBag = (g, col = "#3f6f5a") => { const p = new Pen(g); p.ol = 7;
  p.ell(256, 330, 200, 120, col, 8); p.ell(110, 330, 40, 110, shade(col, 0.8), 7); p.ell(400, 330, 40, 110, shade(col, 0.8), 7);
  for (const x of [190, 320]) p.band([[x, 215], [x, 445]], "#7a5a36", 14, 4); };
export const drawFoodBag = (g) => { const p = new Pen(g); p.ol = 7;
  p.poly([[160, 160], [352, 160], [380, 470], [132, 470]], "#d9c9a6", 8); p.poly([[180, 110], [332, 110], [352, 170], [160, 170]], "#c4b28a", 7);
  p.stroke([[200, 150], [312, 150]], 8, "#7a5a36"); p.ell(256, 330, 44, 44, "#c9353a", 6); };
export const drawNote = (g) => { const p = new Pen(g); p.ol = 6;
  p.poly([[120, 110], [400, 90], [410, 430], [130, 450]], "#f6efdc", 7);
  for (let i = 0; i < 7; i++) p.stroke([[160, 160 + i * 40], [360 - (i % 3) * 30, 150 + i * 40]], 5, "#5a4a6a"); };
export const drawDiary = (g) => { const p = new Pen(g); p.ol = 7;
  p.poly([[70, 160], [256, 190], [256, 440], [70, 410]], "#f6efdc", 7); p.poly([[256, 190], [442, 160], [442, 410], [256, 440]], "#f6efdc", 7);
  for (let i = 0; i < 6; i++) { p.stroke([[100, 220 + i * 32], [230, 236 + i * 32]], 4, "#5a4a6a"); if (i < 4) p.stroke([[282, 236 + i * 32], [410, 220 + i * 32]], 4, "#5a4a6a"); } };
export const drawOrange = (g) => { const p = new Pen(g); p.ol = 7; p.ell(256, 300, 150, 145, "#f08a2c", 8); p.ell(210, 250, 40, 30, "#ffb466", 0); p.ell(256, 160, 30, 16, "#4d7a3a", 6, 0, 360, -20); };
export const drawPineapple = (g) => { const p = new Pen(g); p.ol = 7;
  for (const [a, h] of [[-30, 170], [0, 200], [30, 170], [-55, 120], [55, 120]]) { g.save(); g.translate(256, 210); g.rotate((a * Math.PI) / 180); p.poly([[-16, 0], [0, -h], [16, 0]], "#4d8a3a", 6); g.restore(); }
  p.ell(256, 340, 110, 140, "#d9a441", 8);
  const body = []; for (let i = 0; i < 48; i++) { const a = (i / 48) * Math.PI * 2; body.push([256 + Math.cos(a) * 108, 340 + Math.sin(a) * 138]); }
  p.clip(body, () => { for (let i = -3; i <= 3; i++) { p.stroke([[256 + i * 35 - 70, 230], [256 + i * 35 + 70, 450]], 3, "#8a5a24"); p.stroke([[256 + i * 35 + 70, 230], [256 + i * 35 - 70, 450]], 3, "#8a5a24"); } });
  p.ell(256, 340, 110, 140, null, 8); };
export const drawTin = (g) => { const p = new Pen(g); p.ol = 7; p.ell(256, 380, 150, 50, "#c9ccd2", 7); p.poly([[106, 280], [406, 280], [406, 380], [106, 380]], "#c9ccd2", 0);
  p.stroke([[106, 280], [106, 380]], 7); p.stroke([[406, 280], [406, 380]], 7); p.ell(256, 280, 150, 50, "#e6e8ec", 7); p.ell(256, 280, 90, 26, "#f4e8b0", 4); };
export const drawCrampon = (g) => { const p = new Pen(g); p.ol = 7; p.poly([[90, 300], [420, 280], [430, 340], [90, 360]], "#b07a45", 7);
  for (let i = 0; i < 7; i++) p.poly([[120 + i * 45, 355], [134 + i * 45, 440], [148 + i * 45, 352]], "#9aa4a8", 5); };
export const drawSun = (g) => { const gr = g.createRadialGradient(256, 256, 0, 256, 256, 256);
  gr.addColorStop(0, "rgba(255,250,225,1)"); gr.addColorStop(0.28, "rgba(255,236,170,1)"); gr.addColorStop(0.32, "rgba(255,214,140,0.55)"); gr.addColorStop(1, "rgba(255,200,140,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 512, 512); };
export const drawFlake = (g) => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.5, "rgba(255,255,255,0.8)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); };
export const drawSnowPuff = (g, t) => {
  const p = new Pen(g); p.ol = 5; g.globalAlpha = Math.max(0, 1 - t);
  for (let i = 0; i < 7; i++) { const an = (i / 7) * Math.PI * 2, r = 50 + 160 * t; p.ell(256 + Math.cos(an) * r, 330 + Math.sin(an) * r * 0.45, 52 * (1 - 0.4 * t), 40 * (1 - 0.4 * t), "#f4f8ff", 4); }
  g.globalAlpha = 1;
};
export const drawExclaim = (g, t = 1) => {
  const p = new Pen(g); p.ol = 7; const s = 0.6 + 0.4 * t;
  g.save(); g.translate(256, 256); g.scale(s, s); g.translate(-256, -256);
  p.poly([[226, 60], [286, 60], [272, 330], [240, 330]], "#ffe14a", 8); p.ell(256, 400, 34, 34, "#ffe14a", 8);
  g.restore();
};
export const drawQuestion = (g) => { const p = new Pen(g); p.ol = 8; p.arc(256, 180, 90, 90, 200, 450, 40, INK); p.arc(256, 180, 90, 90, 200, 450, 26, "#ffe14a"); p.band([[256, 270], [256, 330]], "#ffe14a", 28, 7); p.ell(256, 410, 30, 30, "#ffe14a", 7); };
export const drawZzz = (g) => { g.font = "900 150px Montserrat, Arial Black, sans-serif"; g.lineWidth = 14; g.strokeStyle = INK; g.fillStyle = "#ffffff";
  for (const [t, x, y, s] of [["z", 120, 420, 0.7], ["z", 220, 300, 0.9], ["Z", 320, 170, 1.1]]) { g.save(); g.translate(x, y); g.scale(s, s); g.strokeText(t, 0, 0); g.fillText(t, 0, 0); g.restore(); } };
export const drawHeart = (g) => { const p = new Pen(g); p.ol = 8; const pts = []; for (let i = 0; i < 60; i++) { const t = (i / 60) * Math.PI * 2; pts.push([256 + 12 * 16 * Math.pow(Math.sin(t), 3), 260 - 12 * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))]); } p.poly(pts, "#e2453c", 8); };
export const drawLabel = (g, text, col = "#ffe14a") => {
  const w = g.canvas.width, h = g.canvas.height; g.font = `900 ${Math.round(h * 0.55)}px Montserrat, Arial Black, sans-serif`; g.textAlign = "center"; g.textBaseline = "middle";
  g.lineJoin = "round"; g.lineWidth = h * 0.16; g.strokeStyle = INK; g.strokeText(text, w / 2, h * 0.54); g.fillStyle = col; g.fillText(text, w / 2, h * 0.54);
};
export const drawShadowBlob = (g) => {
  const gr = g.createRadialGradient(256, 256, 0, 256, 256, 250);
  gr.addColorStop(0, "rgba(40,50,80,0.45)"); gr.addColorStop(0.6, "rgba(40,50,80,0.28)"); gr.addColorStop(1, "rgba(40,50,80,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 512, 512);
};
/** soft painted cloud, 1024x512 */
export const drawCloud = (g, seed) => {
  const r = (k) => { const x = Math.sin(seed * 91.7 + k * 47.3) * 9123.1; return x - Math.floor(x); };
  for (const [col, dy] of [["#e3e9f3", 18], ["#ffffff", 0]]) {
    g.fillStyle = col; g.beginPath();
    for (let i = 0; i < 7; i++) { const x = 180 + i * 110 + r(i) * 40, y = 300 - Math.sin((i / 6) * Math.PI) * (90 + r(i + 9) * 60) + dy, rr = 90 + r(i + 3) * 60; g.moveTo(x + rr, y); g.arc(x, y, rr, 0, Math.PI * 2); }
    g.rect(150, 300 + dy, 720, 90); g.fill();
  }
};
