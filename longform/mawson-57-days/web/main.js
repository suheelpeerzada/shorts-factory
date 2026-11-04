// Engine: toon 3D world + flat cartoon cards, ink pass, grade, DOF. window.renderFrame(f) draws frame f (1920x1080, 24 fps).
// "57 Days Stranded in Antarctica": places = plateau (trek, glacier, cairn), hut (Cape Denison + bay + ship), deep (inside the crevasse),
// tent (interior), cave (Aladdin's Cave), map (route board), card (DAY counter cards).
import * as THREE from "./three.module.js";
import * as C from "./cast.js";
import * as S from "./story.js";

const W = 1920, H = 1080;
const canvas = document.getElementById("c");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true, powerPreference: "high-performance" });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 3000);
scene.fog = new THREE.Fog(0xdfe9f3, 80, 900);

// ---------- materials ----------
const grad = new THREE.DataTexture(new Uint8Array([120, 120, 120, 255, 255, 255, 255, 255]), 2, 1, THREE.RGBAFormat);
grad.minFilter = grad.magFilter = THREE.NearestFilter; grad.needsUpdate = true;
const toon = (color, map, extra = {}) => new THREE.MeshToonMaterial({ color, map: map || null, gradientMap: grad, ...extra });
const ctex = (w, h, fn, rep) => {
  const c = document.createElement("canvas"); c.width = w; c.height = h; fn(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); }
  return t;
};
const rnd = (() => { let s = 4242; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; })();
const speck = (g, w, h, base, cols, n, rmin, rmax, stretch = 1) => {
  g.fillStyle = base; g.fillRect(0, 0, w, h);
  for (let i = 0; i < n; i++) {
    g.fillStyle = cols[(rnd() * cols.length) | 0]; const x = rnd() * w, y = rnd() * h, r = rmin + rnd() * (rmax - rmin);
    g.beginPath(); g.ellipse(x, y, r, r * stretch, rnd() * Math.PI, 0, Math.PI * 2); g.fill();
  }
};
const T = {
  snow: ctex(512, 512, (g, w, h) => speck(g, w, h, "#eef3f9", ["#e2eaf4", "#f7f9fc", "#dbe5f1", "#e8eff7"], 700, 4, 22, 0.25), [160, 160]),
  ice: ctex(256, 256, (g, w, h) => { speck(g, w, h, "#9fd0ea", ["#8cc3e2", "#b4dcf0", "#7fb8da"], 120, 6, 30, 0.3); g.strokeStyle = "#e8f6ff"; g.lineWidth = 3; for (let i = 0; i < 8; i++) { g.beginPath(); g.moveTo(rnd() * w, 0); g.lineTo(rnd() * w, h); g.stroke(); } }, [2, 2]),
  icewall: ctex(256, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#d9f1ff"); gr.addColorStop(0.4, "#7fbfe6"); gr.addColorStop(1, "#1d3f6a"); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.strokeStyle = "rgba(255,255,255,0.35)"; g.lineWidth = 2; for (let y = 10; y < h; y += 26 + rnd() * 20) { g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(w * 0.3, y + 8, w * 0.6, y - 8, w, y + 4); g.stroke(); } }, [6, 1]),
  rock: ctex(256, 256, (g, w, h) => speck(g, w, h, "#4d4a52", ["#3c3a42", "#5a5760", "#45424a"], 200, 4, 16), [2, 2]),
  sea: ctex(512, 512, (g, w, h) => { speck(g, w, h, "#2d5d86", ["#28557c", "#3a6d96", "#244e73"], 300, 6, 30, 0.2); g.strokeStyle = "#5f8fb8"; g.lineWidth = 3; for (let i = 0; i < 60; i++) { const x = rnd() * w, y = rnd() * h; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 30, y); g.stroke(); } }, [30, 30]),
  wood: ctex(256, 256, (g, w, h) => { g.fillStyle = "#8a6440"; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 32) { g.fillStyle = "#5a3a20"; g.fillRect(0, y, w, 3); g.fillStyle = "#9a7450"; g.fillRect(0, y + 8, w, 3); } }, [3, 1]),
  canvasT: ctex(256, 256, (g, w, h) => speck(g, w, h, "#d9c08a", ["#cdb27a", "#e2cc98", "#c9ad74"], 200, 3, 9)),
  greenT: ctex(256, 256, (g, w, h) => speck(g, w, h, "#4f7a5a", ["#466f50", "#5a8664", "#41664a"], 200, 3, 9)),
};
const MAT = {
  snow: toon(0xffffff, T.snow), sast: toon(0xf2f6fb), ice: toon(0xffffff, T.ice), blueice: toon(0x8cc7ea), icewall: toon(0xffffff, T.icewall, { side: THREE.DoubleSide }),
  rock: toon(0xffffff, T.rock), sea: toon(0xffffff, T.sea), wood: toon(0xffffff, T.wood), roof: toon(0x5a5f6a), dark: toon(0x2a2630), white: toon(0xf4f1ea),
  hull: toon(0x22232b), red: toon(0xa6382e), mast: toon(0x8a6a44), canvas: toon(0xffffff, T.canvasT, { side: THREE.DoubleSide }), green: toon(0xffffff, T.greenT, { side: THREE.DoubleSide }),
  runner: toon(0x8a5a34), load: toon(0x6a7a5a), tarp: toon(0x9a8a5e), mount: toon(0xe8eef6), mount2: toon(0xd5e0ec), farmount: toon(0xc7d6e6), black: toon(0x1d1b22),
  crev: new THREE.MeshBasicMaterial({ color: 0x0f2340, fog: true }), crevlip: toon(0xbfe3f7), window: toon(0xffd98a, null, { emissive: 0x6a4a10 }), metal: toon(0x9aa4a8),
  caveIn: toon(0x9fd6f2, null, { side: THREE.BackSide }), tentIn: toon(0xffffff, T.canvasT, { side: THREE.BackSide }), lamp: new THREE.MeshBasicMaterial({ color: 0xffd98a }),
};

// ---------- world ----------
const groups = { plateau: new THREE.Group(), hut: new THREE.Group(), deep: new THREE.Group(), tent: new THREE.Group(), cave: new THREE.Group(), map: new THREE.Group(), card: new THREE.Group() };
for (const g of Object.values(groups)) scene.add(g);
const add = (grp, geo, mat, x, y, z, opts = {}) => {
  const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
  if (opts.ry) m.rotation.y = opts.ry; if (opts.rx) m.rotation.x = opts.rx; if (opts.rz) m.rotation.z = opts.rz;
  if (opts.s) m.scale.set(...opts.s);
  m.castShadow = opts.cast !== false; m.receiveShadow = opts.recv !== false; grp.add(m); return m;
};
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const sph = (r, a = 16, b = 10) => new THREE.SphereGeometry(r, a, b);

// plateau: snow plane, sastrugi, ranges, nunataks, glacier seracs, crevasse slots, cairn, cross
const P = groups.plateau;
add(P, new THREE.PlaneGeometry(6000, 6000), MAT.snow, 2000, 0, 0, { rx: -Math.PI / 2, cast: false });
for (let i = 0; i < 520; i++) { const x = -400 + rnd() * 5600, z = -160 + rnd() * 320; if (Math.abs(z) < 3.5) continue; add(P, sph(1, 10, 6), MAT.sast, x, 0, z, { s: [1.5 + rnd() * 4, 0.18 + rnd() * 0.35, 0.5 + rnd() * 1.2], ry: 0.3 + rnd() * 0.3, cast: false }); }
for (let i = 0; i < 40; i++) { const x = -800 + i * 160 + rnd() * 80; add(P, new THREE.ConeGeometry(60 + rnd() * 90, 50 + rnd() * 80, 7), i % 2 ? MAT.mount : MAT.mount2, x, 10, -520 - rnd() * 200, { cast: false, ry: rnd() * 3 }); }
for (let i = 0; i < 30; i++) { const x = -800 + i * 210 + rnd() * 80; add(P, new THREE.ConeGeometry(90 + rnd() * 120, 70 + rnd() * 90, 6), MAT.farmount, x, 10, 600 + rnd() * 200, { cast: false, ry: rnd() * 3 }); }
for (let i = 0; i < 26; i++) { const x = rnd() * 5000, z = (rnd() < 0.5 ? -1 : 1) * (40 + rnd() * 120); add(P, new THREE.DodecahedronGeometry(3 + rnd() * 6, 0), MAT.rock, x, 0.5, z, { s: [1, 0.6 + rnd() * 0.6, 1], ry: rnd() * 3 }); }
export const XS = S.XS; // fixed set-piece x positions from the story
// glacier region: seracs + crevasse slots
for (let i = 0; i < 160; i++) {
  const x = XS.glacier0 + rnd() * (XS.glacier1 - XS.glacier0), z = (rnd() - 0.5) * 120; if (Math.abs(z) < 4) continue;
  add(P, box(2 + rnd() * 6, 1.5 + rnd() * 5, 2 + rnd() * 5), rnd() < 0.5 ? MAT.blueice : MAT.ice, x, 0.5, z, { ry: rnd() * 3, rz: (rnd() - 0.5) * 0.4, rx: (rnd() - 0.5) * 0.3 });
}
const slot = (x, z, len, wid, ry = 0) => { add(P, new THREE.PlaneGeometry(wid, len), MAT.crev, x, 0.02, z, { rx: -Math.PI / 2, rz: ry, cast: false }); for (const s of [-1, 1]) add(P, box(0.25, 0.12, len), MAT.crevlip, x + s * (wid / 2 + 0.1) * Math.cos(ry), 0.05, z - s * (wid / 2 + 0.1) * Math.sin(ry), { ry, cast: false }); };
for (let i = 0; i < 40; i++) { const x = XS.glacier0 + rnd() * (XS.glacier1 - XS.glacier0), z = (rnd() - 0.5) * 100, L = 8 + rnd() * 20, wd = 0.6 + rnd() * 1.2, r = Math.PI / 2 + (rnd() - 0.5) * 0.6; if (Math.abs(x - XS.fall) < 30) continue; slot(x, z, L, wd, r); }
// the Day 1 crevasse (crosses the path) - its lid is a toggleable snow bridge
slot(XS.ninnis, 0, 26, 3.0, 0);
const lid = add(P, box(3.2, 0.12, 26), MAT.sast, XS.ninnis, 0.06, 0, { cast: false });
// the Day 35 crevasse
slot(XS.fall, 0, 22, 2.0, 0.1);
const lid2 = add(P, box(2.2, 0.12, 22), MAT.sast, XS.fall, 0.06, 0, { ry: 0.1, cast: false });
// cairn with black cloth (Day 47)
add(P, new THREE.ConeGeometry(1.1, 2.0, 9), MAT.sast, XS.cairn, 1.0, -30);
add(P, new THREE.CylinderGeometry(0.04, 0.04, 2.2, 6), MAT.dark, XS.cairn, 2.6, -30);
const clothGeo = new THREE.PlaneGeometry(0.9, 0.6, 8, 3), cloth = add(P, clothGeo, new THREE.MeshToonMaterial({ color: 0x1d1b22, gradientMap: grad, side: THREE.DoubleSide }), XS.cairn + 0.47, 3.35, -30);
const clothBase = clothGeo.attributes.position.array.slice();
// Mertz's grave (Day 26): snow mound + cross of two sledge beams
add(P, sph(1, 14, 8), MAT.sast, XS.grave, 0, -2.5, { s: [1.3, 0.55, 2.2] });
add(P, box(0.12, 1.6, 0.12), MAT.runner, XS.grave, 1.1, -4.3); add(P, box(0.9, 0.12, 0.12), MAT.runner, XS.grave, 1.55, -4.3);

// hut: Cape Denison - rocks, bay, hut, wireless mast, ice slope behind
const Hh = groups.hut; Hh.position.set(0, 0, 4000);
add(Hh, new THREE.PlaneGeometry(1200, 1200), MAT.snow, 0, 0, 0, { rx: -Math.PI / 2, cast: false });
add(Hh, new THREE.PlaneGeometry(3000, 1400), MAT.sea, 0, -0.4, -760, { rx: -Math.PI / 2, cast: false });
for (let i = 0; i < 40; i++) { const x = -90 + rnd() * 180, z = -40 - rnd() * 22; add(Hh, new THREE.DodecahedronGeometry(1 + rnd() * 3, 0), MAT.rock, x, 0.3, z, { s: [1, 0.5 + rnd() * 0.5, 1], ry: rnd() * 3 }); }
add(Hh, box(9, 3.2, 9), MAT.wood, 0, 1.6, 0);
const hroof = new THREE.ConeGeometry(7.4, 3.6, 4); hroof.rotateY(Math.PI / 4); add(Hh, hroof, MAT.roof, 0, 5.0, 0);
add(Hh, box(4, 2.4, 3), MAT.wood, 0, 1.2, -5.5); add(Hh, box(1.1, 1.9, 0.1), MAT.dark, 0, 0.95, -7.05);
for (const x of [-2.8, 2.8]) add(Hh, box(1.0, 0.8, 0.1), MAT.window, x, 2.0, -4.55);
for (const x of [-14, 14]) add(Hh, new THREE.CylinderGeometry(0.12, 0.16, 16, 8), MAT.mast, x, 8, 6);
add(Hh, new THREE.CylinderGeometry(0.03, 0.03, 28, 4), MAT.dark, 0, 15.6, 6, { rz: Math.PI / 2 });
for (let i = 0; i < 7; i++) add(Hh, box(1.2, 1.0, 1.0), MAT.wood, 6 + (i % 3) * 1.3, 0.5 + Math.floor(i / 3) * 1.0, -2 + (i % 2) * 1.2);
add(Hh, sph(400, 48, 24), MAT.mount, 0, -87.5, 520, { s: [2.5, 0.35, 1.4], cast: false }); // ice slope rising south: y = S.slopeY(z) // ice slope rising south
for (let i = 0; i < 8; i++) add(Hh, sph(40 + rnd() * 30, 12, 8), MAT.mount2, -300 + i * 90, -10, 160 + rnd() * 60, { s: [1.6, 0.5, 1], cast: false });
add(Hh, new THREE.ConeGeometry(60, 40, 6), MAT.rock, -260, 5, -60, { cast: false });
add(Hh, new THREE.ConeGeometry(40, 30, 6), MAT.rock, 240, 2, -80, { cast: false });
for (let i = 0; i < 14; i++) add(Hh, box(8 + rnd() * 18, 2 + rnd() * 3, 6 + rnd() * 10), MAT.mount2, -600 + rnd() * 1200, 0, -200 - rnd() * 500, { ry: rnd() * 3, cast: false }); // icebergs

// deep: inside the crevasse - two ice walls, a ledge, darkness below, sky slit above
const D = groups.deep; D.position.set(0, 0, -4000);
for (const s of [-1, 1]) add(D, box(4, 80, 60), MAT.icewall, s * 4.4, -40, 0, { cast: false });
add(D, box(1.8, 0.8, 5), MAT.ice, -1.6, -45.4, 2);
add(D, box(60, 1, 60), MAT.black, 0, -80, 0, { cast: false });
add(D, box(14, 0.4, 60), MAT.snow, 0, 0.2, 0, { cast: false }); // snow lids beyond the slit are hidden by walls; this is above, out of view

// tent interior
const Tn = groups.tent; Tn.position.set(4000, 0, 0);
add(Tn, new THREE.PlaneGeometry(40, 40), MAT.snow, 0, 0, 0, { rx: -Math.PI / 2, cast: false });
const tin = new THREE.ConeGeometry(2.6, 2.4, 4, 1, true); tin.rotateY(Math.PI / 4); add(Tn, tin, MAT.tentIn, 0, 1.2, 0, { cast: false });
add(Tn, new THREE.CylinderGeometry(0.03, 0.03, 2.4, 6), MAT.runner, 0, 1.2, 0);
add(Tn, sph(0.12, 10, 8), MAT.lamp, 0.6, 0.35, 0.5);

// Aladdin's Cave: ice hollow with an entrance opening toward -z
const Cv = groups.cave; Cv.position.set(-4000, 0, 0);
add(Cv, new THREE.PlaneGeometry(60, 60), MAT.ice, 0, 0, 0, { rx: -Math.PI / 2, cast: false });
const cg = new THREE.SphereGeometry(4.2, 32, 16, Math.PI * 0.62, Math.PI * 1.76, 0, Math.PI / 2); add(Cv, cg, MAT.caveIn, 0, 0, 0, { cast: false, s: [1.2, 0.75, 1] });
add(Cv, new THREE.PlaneGeometry(9, 5), new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false }), 0, 2, -8, { cast: false }); // whiteout beyond the entrance
add(Cv, box(1.1, 0.6, 0.7), MAT.wood, 1.6, 0.3, 1.4);
for (let i = 0; i < 4; i++) add(Cv, box(0.6, 0.5, 0.5), MAT.wood, -2.6 + i * 0.3, 0.25, 2.6 - i * 0.2, { ry: i });

// map board
const M = groups.map; M.position.set(0, 0, 8000);
const mapCanvas = document.createElement("canvas"); mapCanvas.width = 2048; mapCanvas.height = 1152;
const mapTex = new THREE.CanvasTexture(mapCanvas); mapTex.colorSpace = THREE.SRGBColorSpace; mapTex.anisotropy = 8;
add(M, new THREE.PlaneGeometry(16, 9), new THREE.MeshBasicMaterial({ map: mapTex, fog: false }), 0, 4.5, 0, { cast: false });
add(M, box(16.6, 9.6, 0.3), MAT.wood, 0, 4.5, -0.2, { cast: false });
add(M, new THREE.PlaneGeometry(200, 200), new THREE.MeshBasicMaterial({ color: 0x2a2f3e, fog: false }), 0, 4.5, -2, { cast: false });
let mapKey = "";
const drawMap = (m) => {
  const key = JSON.stringify(m); if (key === mapKey) return; mapKey = key;
  const g = mapCanvas.getContext("2d"), w = 2048, h = 1152;
  g.fillStyle = "#2f5f8a"; g.fillRect(0, 0, w, h);
  g.strokeStyle = "rgba(255,255,255,0.08)"; g.lineWidth = 2; for (let x = 0; x < w; x += 128) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (let y = 0; y < h; y += 128) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  // ice sheet with a wavy coast along the top
  g.fillStyle = "#f1f6fb"; g.beginPath(); g.moveTo(0, h);
  const coast = (x) => 300 + 40 * Math.sin(x / 140) + 25 * Math.sin(x / 47);
  for (let x = 0; x <= w; x += 8) g.lineTo(x, coast(x)); g.lineTo(w, h); g.closePath(); g.fill();
  g.strokeStyle = "#241726"; g.lineWidth = 8; g.beginPath(); for (let x = 0; x <= w; x += 8) (x ? g.lineTo(x, coast(x)) : g.moveTo(x, coast(x))); g.stroke();
  for (const [gx, gw] of [[860, 90], [1360, 110]]) { g.fillStyle = "#d4e8f6"; g.beginPath(); g.moveTo(gx - gw / 2, coast(gx - gw / 2) + 4); g.lineTo(gx - gw / 3, coast(gx) - 150); g.lineTo(gx + gw / 3, coast(gx) - 160); g.lineTo(gx + gw / 2, coast(gx + gw / 2) + 4); g.closePath(); g.fill(); g.stroke(); }
  g.fillStyle = "#e3edf6"; for (let i = 0; i < 40; i++) { const x = (i * 397) % w, y = 520 + ((i * 211) % 560); g.beginPath(); g.ellipse(x, y, 60, 10, 0, 0, Math.PI * 2); g.fill(); }
  const HUT = [300, 345], NIN = [1720, 640], OUT = [[300, 345], [520, 470], [860, 520], [1360, 560], [1720, 640]];
  const BACK = [[1720, 640], [1500, 760], [1180, 820], [900, 800], [700, 720], [520, 560], [380, 440], [320, 380], [300, 345]];
  const along = (pts, t) => { const L = []; let tot = 0; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(d); tot += d; } let r = t * tot; const out = [pts[0]]; for (let i = 1; i < pts.length; i++) { if (r >= L[i - 1]) { out.push(pts[i]); r -= L[i - 1]; } else { const k = r / L[i - 1]; out.push([pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * k, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * k]); break; } } return out; };
  const line = (pts, col, wd, dash) => { if (pts.length < 2) return; g.setLineDash(dash || []); g.lineCap = "round"; g.lineJoin = "round"; g.strokeStyle = "#241726"; g.lineWidth = wd + 8; g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(...p) : g.moveTo(...p))); g.stroke(); g.strokeStyle = col; g.lineWidth = wd; g.stroke(); g.setLineDash([]); };
  if (m.fork) { // coast vs inland choice
    line([[1720, 640], [1500, 420], [1100, 400], [700, 380], [300, 345]], m.fork === 1 ? "#4fb3ff" : "#8fb8d6", 14, [30, 24]);
    line(BACK, m.fork === 2 ? "#ff5a3a" : "#e7a090", 14, [30, 24]);
  }
  if (m.out) line(along(OUT, m.out), "#ffd23a", 16);
  if (m.back) line(along(BACK, m.back), "#ff5a3a", 16);
  const pin = (x, y, col, r = 26) => { g.fillStyle = col; g.strokeStyle = "#241726"; g.lineWidth = 8; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); g.stroke(); };
  const label = (t, x, y, size = 54, col = "#241726", bg = "#ffffff") => { g.font = `900 ${size}px Montserrat, Arial Black, sans-serif`; g.textAlign = "center"; g.lineJoin = "round"; g.lineWidth = 14; g.strokeStyle = bg; g.strokeText(t, x, y); g.fillStyle = col; g.fillText(t, x, y); };
  pin(...HUT, "#c9353a", 30); label("CAPE DENISON", HUT[0] + 40, HUT[1] - 56, 50);
  if (m.ninnis) { const [x, y] = NIN; g.strokeStyle = "#241726"; g.lineWidth = 16; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(x - 30, y - 30 * s); g.lineTo(x + 30, y + 30 * s); g.stroke(); } }
  if (m.mertz) pin(900, 800, "#3f6fb5", 22);
  if (m.cairn) pin(390, 450, "#241726", 18);
  if (m.cave) { pin(320, 385, "#9fd6f2", 18); label("ALADDIN'S CAVE", 560, 420, 40); }
  if (m.label) label(m.label, m.lx ?? 1180, m.ly ?? 1040, 78, "#c9353a");
  if (m.you != null) { const pts = along(BACK, m.you), p = pts[pts.length - 1]; pin(p[0], p[1], "#ffd23a", 24); }
  mapTex.needsUpdate = true;
};

// day card
const Cd = groups.card; Cd.position.set(0, 0, 12000);
const cardBgTex = ctex(1024, 576, (g, w, h) => { const gr = g.createRadialGradient(w / 2, h / 2, 50, w / 2, h / 2, w * 0.7); gr.addColorStop(0, "#3d5b86"); gr.addColorStop(1, "#141c2e"); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
add(Cd, new THREE.PlaneGeometry(60, 34), new THREE.MeshBasicMaterial({ map: cardBgTex, fog: false }), 0, 0, -6, { cast: false });
const cardCanvas = document.createElement("canvas"); cardCanvas.width = 2048; cardCanvas.height = 1152;
const cardTex = new THREE.CanvasTexture(cardCanvas); cardTex.colorSpace = THREE.SRGBColorSpace;
const cardText = add(Cd, new THREE.PlaneGeometry(16, 9), new THREE.MeshBasicMaterial({ map: cardTex, transparent: true, fog: false, depthWrite: false }), 0, 0, 0, { cast: false });
let cardKey = "";
const drawCard = (c) => {
  const key = c.day + "|" + c.date; if (key === cardKey) return; cardKey = key;
  const g = cardCanvas.getContext("2d"), w = 2048, h = 1152; g.clearRect(0, 0, w, h);
  g.textAlign = "center"; g.lineJoin = "round";
  g.font = "900 380px Montserrat, Arial Black, sans-serif"; g.lineWidth = 46; g.strokeStyle = "#141c2e"; g.strokeText("DAY " + c.day, w / 2, 620);
  g.fillStyle = c.day >= 26 ? "#ff7a3a" : "#ffffff"; g.fillText("DAY " + c.day, w / 2, 620);
  g.font = "800 84px Montserrat, Arial Black, sans-serif"; g.fillStyle = "#cfe3f2"; g.fillText(c.date, w / 2, 780);
  // progress strip day 1..57
  const x0 = 424, x1 = 1624, y = 930; g.strokeStyle = "#5a6f90"; g.lineWidth = 14; g.lineCap = "round"; g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.stroke();
  const xp = x0 + ((c.day - 1) / 56) * (x1 - x0); g.strokeStyle = "#ffd23a"; g.beginPath(); g.moveTo(x0, y); g.lineTo(xp, y); g.stroke();
  g.fillStyle = "#ffd23a"; g.beginPath(); g.arc(xp, y, 26, 0, Math.PI * 2); g.fill();
  g.font = "800 54px Montserrat, Arial Black, sans-serif"; g.fillStyle = "#8aa0c0"; g.fillText("1", x0 - 50, y + 20); g.fillText("57", x1 + 70, y + 20);
  cardTex.needsUpdate = true;
};

// ---------- dynamic props (sledges, tents, ship, rope, skis, sail) ----------
const PROPS = new Map();
const mk = {
  sledge: (half) => {
    const g = new THREE.Group(), L = half ? 1.8 : 3.4;
    for (const s of [-1, 1]) { add(g, box(L, 0.08, 0.08), MAT.runner, 0, 0.06, s * 0.35); add(g, box(0.4, 0.08, 0.08), MAT.runner, L / 2 + 0.12, 0.18, s * 0.35, { rz: 0.6 }); for (let k = 0; k < (half ? 2 : 4); k++) add(g, box(0.06, 0.3, 0.06), MAT.runner, -L / 2 + 0.3 + k * 0.9, 0.22, s * 0.35); }
    add(g, box(L, 0.05, 0.8), MAT.runner, 0, 0.38, 0);
    const load = new THREE.Group(); g.add(load); load.userData.load = true;
    add(load, box(L * 0.8, 0.5, 0.72), MAT.tarp, -0.05, 0.66, 0); add(load, box(L * 0.3, 0.3, 0.6), MAT.load, -0.2, 1.05, 0); add(load, box(0.5, 0.3, 0.5), MAT.red, L * 0.25, 1.0, 0);
    return g;
  },
  tent: () => { const g = new THREE.Group(); const c = new THREE.ConeGeometry(1.7, 1.9, 4); c.rotateY(Math.PI / 4); add(g, c, MAT.green, 0, 0.95, 0); add(g, box(0.5, 0.7, 0.05), MAT.dark, 0, 0.35, 1.2); return g; },
  makeshift: () => { const g = new THREE.Group(); const pr = new THREE.CylinderGeometry(0.9, 0.9, 2.2, 3, 1, true); pr.rotateZ(Math.PI / 2); add(g, pr, MAT.canvas, 0, 0.45, 0, { s: [1, 0.55, 1] }); add(g, box(2.6, 0.06, 0.06), MAT.runner, 0, 0.93, 0); add(g, sph(0.1, 8, 6), MAT.lamp, 0, 0.3, 0.2); return g; },
  ship: () => {
    const g = new THREE.Group();
    add(g, box(36, 4, 8), MAT.hull, 0, 1, 0); add(g, new THREE.ConeGeometry(4, 8, 4, 1), MAT.hull, 21, 1, 0, { rz: -Math.PI / 2, ry: Math.PI / 4, s: [1, 1, 1] });
    add(g, box(10, 2.5, 5), MAT.white, -4, 4, 0); add(g, new THREE.CylinderGeometry(0.9, 0.9, 5, 10), MAT.red, -4, 7, 0);
    for (const x of [-14, 4, 15]) { add(g, new THREE.CylinderGeometry(0.25, 0.3, 22, 8), MAT.mast, x, 13, 0); add(g, box(0.25, 0.25, 9), MAT.mast, x, 18, 0); }
    return g;
  },
  rope: () => { const g = new THREE.Group(); add(g, new THREE.CylinderGeometry(0.03, 0.03, 1, 6), MAT.mast, 0, 0.5, 0); return g; },
  skis: () => { const g = new THREE.Group(); for (const s of [-1, 1]) add(g, box(2.0, 0.04, 0.1), MAT.runner, 0.2, 0.03, s * 0.16); return g; },
  sail: () => { const g = new THREE.Group(); add(g, box(0.05, 1.8, 0.05), MAT.runner, 0, 0.9, 0); const sg = new THREE.PlaneGeometry(1.3, 1.1); sg.translate(0, 0.55, 0); add(g, sg, MAT.canvas, 0.0, 0.7, 0, { ry: Math.PI / 2 }); return g; },
  sunk: () => { const g = new THREE.Group(); add(g, box(0.9, 0.7, 0.7), MAT.tarp, 0, 0.35, 0); add(g, box(0.5, 0.35, 0.4), MAT.red, 0.6, 0.18, 0.3); return g; }, // bags on the ledge
};
const getProp = (id, k) => {
  let o = PROPS.get(id);
  if (!o) { o = k === "sledge" ? mk.sledge(false) : k === "half" ? mk.sledge(true) : mk[k](); o.userData.kind = k; scene.add(o); PROPS.set(id, o); }
  return o;
};

// sky dome + clouds + sun + snow particles
const sky = new THREE.Mesh(new THREE.SphereGeometry(2600, 32, 16), new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false, fog: false,
  uniforms: { top: { value: new THREE.Color() }, hor: { value: new THREE.Color() } },
  vertexShader: "varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
  fragmentShader: "uniform vec3 top; uniform vec3 hor; varying vec3 vP; void main(){ float h = clamp(normalize(vP).y*2.4, 0.0, 1.0); gl_FragColor = vec4(mix(hor, top, pow(h,0.7)), 1.0); }",
}));
sky.renderOrder = -10; scene.add(sky);
const clouds = [];
for (let i = 0; i < 10; i++) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.5), new THREE.MeshBasicMaterial({ map: ctex(1024, 512, (g) => C.drawCloud(g, i + 1)), transparent: true, depthWrite: false, fog: false }));
  m.userData.cloud = true; m.renderOrder = -5; scene.add(m); clouds.push({ m, a: -1.4 + i * 0.32, h: 110 + (i % 3) * 40, s: 220 + (i % 4) * 50 });
}
const sunCard = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: ctex(512, 512, C.drawSun), transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending }));
sunCard.userData.cloud = true; sunCard.renderOrder = -4; scene.add(sunCard);
const NF = 2200, flakePos = new Float32Array(NF * 3), flakeBase = new Float32Array(NF * 3);
for (let i = 0; i < NF; i++) { flakeBase[3 * i] = rnd(); flakeBase[3 * i + 1] = rnd(); flakeBase[3 * i + 2] = rnd(); }
const flakeGeo = new THREE.BufferGeometry(); flakeGeo.setAttribute("position", new THREE.BufferAttribute(flakePos, 3));
const flakeMat = new THREE.PointsMaterial({ map: ctex(64, 64, C.drawFlake), size: 0.08, transparent: true, depthWrite: false, opacity: 0.9, fog: false, sizeAttenuation: true });
const flakes = new THREE.Points(flakeGeo, flakeMat); flakes.userData.cloud = true; flakes.frustumCulled = false; scene.add(flakes);
const updateFlakes = (f, amt, wind, ctr) => {
  flakes.visible = amt > 0.01; if (!flakes.visible) return;
  const n = Math.floor(NF * Math.min(1, amt)), B = 26;
  for (let i = 0; i < NF; i++) {
    if (i >= n) { flakePos[3 * i + 1] = -9999; continue; }
    const t = f / 24;
    let x = flakeBase[3 * i] * B + wind * t * (0.7 + 0.6 * flakeBase[3 * i + 1]), y = flakeBase[3 * i + 1] * 14 - t * (0.8 + wind * 0.05), z = flakeBase[3 * i + 2] * B + Math.sin(t * 2 + i) * 0.3;
    x = ((x % B) + B) % B; y = ((y % 14) + 14) % 14; z = ((z % B) + B) % B;
    flakePos[3 * i] = ctr.x - B / 2 + x; flakePos[3 * i + 1] = ctr.y - 4 + y; flakePos[3 * i + 2] = ctr.z - B / 2 + z;
  }
  flakeGeo.attributes.position.needsUpdate = true; flakeMat.size = 0.05 + 0.06 * Math.min(1, wind / 8);
};

// lights
const hemi = new THREE.HemisphereLight(0xffffff, 0x8899aa, 1); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffffff, 2); scene.add(sun, sun.target);
sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.03;
const lamp = new THREE.PointLight(0xffc070, 0, 8, 1.5); scene.add(lamp);
const LIGHT = {
  day: { az: 150, el: 38, sun: 0xfff6e8, si: 2.3, sky: 0xdcecff, gnd: 0x9aaabb, hi: 1.15, top: 0x3f86d0, hor: 0xd9ecfa, fog: 0xdfeaf5, card: 0xffffff, sat: 1.06, sunVis: 0 },
  low: { az: 185, el: 10, sun: 0xffd6b8, si: 2.2, sky: 0xffeae4, gnd: 0x9a9ab8, hi: 1.2, top: 0x6a7ec0, hor: 0xffd4bc, fog: 0xf4e0d8, card: 0xfff0e8, sat: 1.0, sunVis: 1 },
  grey: { az: 140, el: 40, sun: 0xe8eef6, si: 1.1, sky: 0xe3e9f0, gnd: 0xb0b8c4, hi: 1.7, top: 0xaeb9c8, hor: 0xe1e6ec, fog: 0xdde3ea, card: 0xf2f4f8, sat: 0.85, sunVis: 0 },
  night: { az: 210, el: 6, sun: 0xc8b8ff, si: 1.5, sky: 0x8a9ad0, gnd: 0x4a5478, hi: 1.25, top: 0x1a2650, hor: 0x8f87b8, fog: 0x6a6f9c, card: 0xc8d0f0, sat: 0.95, sunVis: 0 },
  storm: { az: 140, el: 30, sun: 0xd0dcf0, si: 0.9, sky: 0xc9d6e6, gnd: 0x8a96aa, hi: 1.6, top: 0x8a9ab0, hor: 0xc9d4e2, fog: 0xc6d1df, card: 0xe6ecf4, sat: 0.8, sunVis: 0, fogNear: 4, fogFar: 70 },
  deep: { az: 90, el: 80, sun: 0xd8f0ff, si: 1.6, sky: 0x9fd6f2, gnd: 0x10203a, hi: 0.9, top: 0xeaf6ff, hor: 0x9fc8e6, fog: 0x0d1c33, card: 0xb8d8f0, sat: 1.0, sunVis: 0, fogNear: 8, fogFar: 70 },
  tent: { az: 120, el: 50, sun: 0xffd9a0, si: 0.8, sky: 0xffd9a0, gnd: 0x6a5030, hi: 1.0, top: 0x3a3a50, hor: 0x8a7a60, fog: 0x5a4a3a, card: 0xffe0b8, sat: 1.05, sunVis: 0, lamp: 2.2 },
  cave: { az: 160, el: 40, sun: 0xe8f6ff, si: 0.9, sky: 0xbfe6fa, gnd: 0x5a8ab0, hi: 1.4, top: 0x9fd6f2, hor: 0xe8f4fc, fog: 0xbfdcee, card: 0xd8ecf8, sat: 0.95, sunVis: 0 },
  card: { az: 0, el: 60, sun: 0xffffff, si: 0, sky: 0xffffff, gnd: 0xffffff, hi: 1, top: 0x141c2e, hor: 0x141c2e, fog: 0x141c2e, card: 0xffffff, sat: 1.0, sunVis: 0, fogNear: 500, fogFar: 3000 },
};
const applyLight = (k, center) => {
  const L = LIGHT[k], az = (L.az * Math.PI) / 180, el = (L.el * Math.PI) / 180;
  sun.color.setHex(L.sun); sun.intensity = L.si; hemi.color.setHex(L.sky); hemi.groundColor.setHex(L.gnd); hemi.intensity = L.hi;
  const dir = new THREE.Vector3(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az));
  sun.position.set(center.x + dir.x * 80, center.y + dir.y * 80, center.z + dir.z * 80); sun.target.position.copy(center);
  const sc = sun.shadow.camera; sc.left = -22; sc.right = 22; sc.top = 22; sc.bottom = -22; sc.near = 1; sc.far = 220; sc.updateProjectionMatrix();
  sky.material.uniforms.top.value.setHex(L.top); sky.material.uniforms.hor.value.setHex(L.hor);
  scene.fog.color.setHex(L.fog); scene.fog.near = L.fogNear ?? 80; scene.fog.far = L.fogFar ?? 900;
  sunCard.visible = !!L.sunVis; sunCard.position.set(camera.position.x + dir.x * 1500, camera.position.y + Math.max(0.03, dir.y) * 1500, camera.position.z + dir.z * 1500); sunCard.scale.setScalar(260);
  lamp.intensity = L.lamp || 0;
  return L;
};

// ---------- cards ----------
const blobTex = ctex(512, 512, C.drawShadowBlob);
const cardGeo = (w, h, sole) => { const g = new THREE.PlaneGeometry(w, h); g.translate(0, h / 2 - sole, 0); return g; };
const GEO = { person: cardGeo(1.35, 2.25, 0.056), dog: cardGeo(1.1, 1.1, 0.048), small: cardGeo(0.6, 0.6, 0.03), fx: cardGeo(1, 1, 0.5), label: cardGeo(2.4, 0.6, 0.3) };
const pool = new Map(), texCache = new Map();
const sharedTex = (key, w, h, fn) => { if (!texCache.has(key)) texCache.set(key, ctex(w, h, fn)); return texCache.get(key); };
const cardMat = (map) => new THREE.MeshBasicMaterial({ map, alphaTest: 0.5, side: THREE.DoubleSide, fog: true });
const blobMat = new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, fog: true });
const kindGeo = (k) => (k === "person" ? "person" : k === "dog" ? "dog" : k === "label" ? "label" : ["exclaim", "puff", "question", "zzz", "heart"].includes(k) ? "fx" : "small");
const getCard = (id, geoKey) => {
  let c = pool.get(id);
  if (!c || c.geoKey !== geoKey) {
    if (c) { scene.remove(c.m, c.blob); }
    const m = new THREE.Mesh(GEO[geoKey], cardMat(null)); m.userData.card = true;
    const blob = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), blobMat); blob.rotation.x = -Math.PI / 2; blob.userData.blob = true; blob.renderOrder = 1;
    scene.add(m, blob); c = { m, blob, key: null, own: null, used: false, geoKey }; pool.set(id, c);
  }
  c.used = true; return c;
};
const q = (v) => (typeof v === "number" ? Math.round(v * 50) / 50 : v);
const personTex = (c, a) => {
  const key = JSON.stringify([a.outfitKey, a.side ? 1 : 0, Object.entries(a.opts).map(([k, v]) => [k, q(v)])]);
  if (key === c.key) return; c.key = key;
  if (!c.own) { const cv = document.createElement("canvas"); cv.width = 1200; cv.height = 2000; c.own = { cv, tex: new THREE.CanvasTexture(cv) }; c.own.tex.colorSpace = THREE.SRGBColorSpace; }
  const g = c.own.cv.getContext("2d"); g.clearRect(0, 0, 1200, 2000);
  const opts = {}; for (const [k, v] of Object.entries(a.opts)) opts[k] = q(v);
  C.drawPerson(g, a.outfit, { ...opts, side: a.side });
  c.own.tex.needsUpdate = true; c.m.material.map = c.own.tex; c.m.material.needsUpdate = true;
};
const smallTex = (a) => {
  switch (a.kind) {
    case "dog": { const ph = Math.round((a.phase || 0) * 8) / 8 % 1; return sharedTex(`d${a.v}_${ph}_${a.tired ? 1 : 0}_${a.lie ? 1 : 0}_${a.still ? 1 : 0}_${a.pant ? 1 : 0}`, 512, 512, (g) => C.drawHusky(g, a.v, ph, { tired: a.tired, lie: a.lie, still: a.still, pant: a.pant })); }
    case "puff": { const t = Math.round(a.t * 10) / 10; return sharedTex(`puff${t}`, 512, 512, (g) => C.drawSnowPuff(g, t)); }
    case "label": return sharedTex(`lab_${a.text}_${a.col || ""}`, 1024, 256, (g) => C.drawLabel(g, a.text, a.col));
    default: { const fn = { stove: C.drawStove, fuel: C.drawFuel, bag: C.drawBag, food: C.drawFoodBag, note: C.drawNote, diary: C.drawDiary, orange: C.drawOrange, pineapple: C.drawPineapple, tin: C.drawTin, crampon: C.drawCrampon, exclaim: C.drawExclaim, question: C.drawQuestion, zzz: C.drawZzz, heart: C.drawHeart }[a.kind]; return sharedTex(a.kind, 512, 512, (g) => fn(g)); }
  }
};
const camRight = new THREE.Vector3(), camDir = new THREE.Vector3();
const drawActors = (list, tint) => {
  for (const c of pool.values()) c.used = false;
  camera.getWorldDirection(camDir); const yaw = Math.atan2(-camDir.x, -camDir.z);
  camRight.set(-camDir.z, 0, camDir.x).normalize();
  for (const a of list) {
    const geoKey = kindGeo(a.kind), c = getCard(a.id, geoKey);
    if (a.kind === "person") personTex(c, a);
    else { const t = smallTex(a); if (c.m.material.map !== t) { c.m.material.map = t; c.m.material.needsUpdate = true; } }
    const s = a.s ?? 1;
    let flip = !!a.flip; if (a.dir) flip = (a.dir[0] * camRight.x + a.dir[1] * camRight.z) < 0; if (a.flipX) flip = !flip;
    c.m.position.set(a.x, a.y ?? 0, a.z); c.m.rotation.set(0, yaw, a.roll || 0);
    c.m.scale.set((flip ? -1 : 1) * s * (a.sx ?? 1), s * (a.sy ?? 1), 1);
    c.m.material.color.setHex(a.glow ? 0xffffff : tint);
    c.m.visible = true; c.m.renderOrder = a.fxOrder || 0;
    const showBlob = a.blob !== false && geoKey !== "fx" && geoKey !== "label";
    c.blob.visible = showBlob;
    if (showBlob) {
      const lift = Math.max(0, (a.y ?? 0) - (a.ground ?? 0)), bw = (geoKey === "person" ? 1.1 : geoKey === "dog" ? 0.9 : 0.5) * s * Math.max(0.4, 1 - lift * 0.6);
      c.blob.position.set(a.x, (a.ground ?? 0) + 0.015, a.z); c.blob.scale.set(bw, bw * 0.45, 1);
    }
  }
  for (const c of pool.values()) if (!c.used) { c.m.visible = false; c.blob.visible = false; }
};

// ---------- render targets + post ----------
const rtColor = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 2 });
const rtND = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType });
const rtInk = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType });
const ndWorld = new THREE.ShaderMaterial({
  vertexShader: "varying vec3 vN; varying float vD; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.0); vN = normalize(normalMatrix*normal); vD = -mv.z; gl_Position = projectionMatrix*mv; }",
  fragmentShader: "varying vec3 vN; varying float vD; void main(){ vec3 n = normalize(vN); if(!gl_FrontFacing) n = -n; gl_FragColor = vec4(n*0.5+0.5, vD/3000.0); }",
  side: THREE.DoubleSide,
});
const ndCard = new THREE.ShaderMaterial({
  uniforms: { map: { value: null } },
  vertexShader: "varying vec2 vU; varying float vD; void main(){ vU = uv; vec4 mv = modelViewMatrix*vec4(position,1.0); vD = -mv.z; gl_Position = projectionMatrix*mv; }",
  fragmentShader: "uniform sampler2D map; varying vec2 vU; varying float vD; void main(){ if(texture2D(map, vU).a < 0.5) discard; gl_FragColor = vec4(0.0,0.0,0.0, vD/3000.0); }",
  side: THREE.DoubleSide,
});
const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
const postScene = new THREE.Scene(); postScene.add(quad);
const postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const inkMat = new THREE.ShaderMaterial({
  uniforms: { tC: { value: null }, tN: { value: null }, px: { value: new THREE.Vector2(1 / W, 1 / H) }, sat: { value: 1.0 }, flash: { value: 0 }, vig: { value: 0.3 }, gain: { value: 1 }, fade: { value: 0 } },
  vertexShader: "varying vec2 vU; void main(){ vU = uv; gl_Position = vec4(position.xy,0.0,1.0); }",
  fragmentShader: `
    uniform sampler2D tC; uniform sampler2D tN; uniform vec2 px; uniform float sat; uniform float flash; uniform float vig; uniform float gain; uniform float fade;
    varying vec2 vU;
    bool isCard(vec4 s){ return length(s.rgb) < 0.02; }
    void main(){
      vec3 col = texture2D(tC, vU).rgb * gain;
      vec4 c0 = texture2D(tN, vU);
      float ink = 0.0;
      if(!isCard(c0)){
        float d0 = c0.a*3000.0; vec3 n0 = c0.rgb*2.0-1.0;
        float r = 2.0;
        for(int i=0;i<8;i++){
          float a = float(i)*0.785398;
          vec4 s = texture2D(tN, vU + vec2(cos(a),sin(a))*px*r);
          if(isCard(s)) continue;
          float d = s.a*3000.0;
          if(d - d0 > 0.06*d0 + 0.05) ink = max(ink, 1.0);
          vec3 n = s.rgb*2.0-1.0;
          if(abs(d-d0) < 0.08*d0 && dot(n,n0) < 0.82) ink = max(ink, 0.9);
        }
        ink *= 1.0 - smoothstep(160.0, 600.0, d0);
      }
      col = mix(col, vec3(0.141,0.090,0.149)*0.35, ink);
      float l = dot(col, vec3(0.2126,0.7152,0.0722)); col = mix(vec3(l), col, sat);
      vec2 v = vU-0.5; col *= 1.0 - vig*dot(v*vec2(0.75,1.0), v*vec2(0.75,1.0))*2.2;
      col = mix(col, vec3(1.0), flash);
      col = mix(col, vec3(0.0), fade);
      gl_FragColor = vec4(col, c0.a);
    }`,
});
const dofMat = new THREE.ShaderMaterial({
  uniforms: { tC: { value: null }, tN: { value: null }, px: { value: new THREE.Vector2(1 / W, 1 / H) }, focus: { value: 5 }, cInf: { value: 0 } },
  vertexShader: "varying vec2 vU; void main(){ vU = uv; gl_Position = vec4(position.xy,0.0,1.0); }",
  fragmentShader: `
    uniform sampler2D tC; uniform sampler2D tN; uniform vec2 px; uniform float focus; uniform float cInf; varying vec2 vU;
    float coc(float d){ return min(cInf*abs(1.0 - focus/max(d,0.01)), 14.0); }
    vec3 toS(vec3 c){ c = max(c, 0.0); return mix(c*12.92, 1.055*pow(c, vec3(1.0/2.4))-0.055, step(0.0031308, c)); }
    void main(){
      vec4 c0 = texture2D(tC, vU);
      float d0 = texture2D(tN, vU).a*3000.0; float r0 = coc(d0);
      if(cInf < 0.01 || r0 < 0.6){ gl_FragColor = vec4(toS(c0.rgb),1.0); return; }
      vec3 acc = c0.rgb; float w = 1.0;
      for(int i=1;i<24;i++){
        float fi = float(i); float rr = sqrt(fi/24.0)*r0; float a = fi*2.39996;
        vec2 uv = vU + vec2(cos(a),sin(a))*rr*px;
        float ds = texture2D(tN, uv).a*3000.0; float rs = coc(ds);
        if(ds < d0 - 0.2 && rs < rr) continue;
        acc += texture2D(tC, uv).rgb; w += 1.0;
      }
      gl_FragColor = vec4(toS(acc/w),1.0);
    }`,
});

// ---------- frame ----------
const tmpV = new THREE.Vector3();
window.renderFrame = (f) => {
  const shot = S.shotAt(f);
  for (const [k, g] of Object.entries(groups)) g.visible = k === shot.loc;
  const cam = S.camAt(f);
  camera.position.set(...cam.pos); camera.fov = cam.fov; camera.up.set(Math.sin(cam.roll || 0), Math.cos(cam.roll || 0), 0);
  camera.lookAt(...cam.tgt); camera.updateProjectionMatrix();
  const L = applyLight(shot.light, tmpV.set(...cam.tgt));
  sky.position.copy(camera.position);
  const w = S.worldAt(f);
  lid.visible = !w.ninnisOpen; lid2.visible = !w.fallOpen;
  { const p = clothGeo.attributes.position; for (let i = 0; i < p.count; i++) { const x = clothBase[3 * i] + 0.45; p.array[3 * i + 2] = clothBase[3 * i + 2] + Math.sin(x * 5 - f * 0.35) * 0.1 * x; } p.needsUpdate = true; clothGeo.computeVertexNormals(); }
  if (w.map) drawMap(w.map);
  if (w.card) { drawCard(w.card); const k = w.card.slam ?? 1; cardText.scale.setScalar(k); cardText.position.set(0, 0, 0); }
  // dynamic props
  for (const o of PROPS.values()) o.visible = false;
  for (const pr of w.props || []) {
    const o = getProp(pr.id, pr.k); o.visible = true; o.position.set(pr.x, pr.y || 0, pr.z); o.rotation.set(pr.rx || 0, pr.ry || 0, pr.rz || 0);
    o.scale.set(pr.sx ?? pr.s ?? 1, pr.sy ?? pr.s ?? 1, pr.sz ?? pr.s ?? 1);
    o.traverse((m) => { if (m.userData.load) m.visible = pr.load !== false; });
  }
  if (L.lamp) lamp.position.set(...(w.lampAt || [4000.6, 0.5, 0.5]));
  for (const c of clouds) { c.m.visible = shot.loc === "plateau" || shot.loc === "hut"; const r = 1800; c.m.position.set(camera.position.x + Math.sin(c.a + f * 0.00002) * r, c.h * 2.2, camera.position.z - Math.cos(c.a) * r); c.m.scale.setScalar(c.s * 2.4); c.m.lookAt(camera.position); }
  if (shot.light === "storm" || shot.light === "grey" || shot.light === "deep" || shot.loc === "tent" || shot.loc === "cave" || shot.loc === "card" || shot.loc === "map") for (const c of clouds) c.m.visible = false;
  sunCard.lookAt(camera.position);
  updateFlakes(f, w.snow || 0, w.wind ?? 2, camera.position.clone().add(camDir.clone().multiplyScalar(8)));
  drawActors(S.actorsAt(f), L.card);
  // colour pass
  renderer.setRenderTarget(rtColor); renderer.setClearColor(L.fog, 1); renderer.clear(); renderer.render(scene, camera);
  // normal/depth pass
  const hidden = [];
  scene.traverse((o) => {
    if (!o.isMesh && !o.isPoints) return;
    if (o === sky || o.userData.cloud || o.userData.blob || o.isPoints || o === cardText) { if (o.visible) { o.visible = false; hidden.push(o); } return; }
    if (o.userData.card) { o.userData.mat = o.material; o.material = ndCard.clone(); o.material.uniforms.map.value = o.userData.mat.map; }
    else { o.userData.mat = o.material; o.material = ndWorld; }
  });
  const fog = scene.fog; scene.fog = null; renderer.shadowMap.autoUpdate = false;
  renderer.setRenderTarget(rtND); renderer.setClearColor(new THREE.Color(0.5, 0.5, 1.0), 1); renderer.clear(); renderer.render(scene, camera);
  scene.fog = fog; renderer.shadowMap.autoUpdate = true;
  scene.traverse((o) => { if (o.isMesh && o.userData.mat) { if (o.userData.card) o.material.dispose(); o.material = o.userData.mat; delete o.userData.mat; } });
  for (const o of hidden) o.visible = true;
  // ink + grade
  inkMat.uniforms.tC.value = rtColor.texture; inkMat.uniforms.tN.value = rtND.texture; inkMat.uniforms.sat.value = L.sat;
  inkMat.uniforms.flash.value = S.flashAt(f); inkMat.uniforms.fade.value = S.fadeAt ? S.fadeAt(f) : 0;
  inkMat.uniforms.vig.value = shot.loc === "card" ? 0 : 0.3;
  quad.material = inkMat; renderer.setRenderTarget(rtInk); renderer.render(postScene, postCam);
  // dof to screen
  const d = S.dofAt(f);
  camera.getWorldDirection(tmpV);
  const fp = new THREE.Vector3(...(d.focus || cam.tgt));
  dofMat.uniforms.focus.value = Math.max(0.3, fp.sub(camera.position).dot(tmpV));
  dofMat.uniforms.cInf.value = d.cInf || 0;
  dofMat.uniforms.tC.value = rtInk.texture; dofMat.uniforms.tN.value = rtND.texture;
  quad.material = dofMat; renderer.setRenderTarget(null); renderer.render(postScene, postCam);
};
window.TOTAL = S.TOTAL;
window.ready = true;
