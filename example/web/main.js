// Engine: toon 3D world + flat cartoon cards, ink pass, grade, DOF. window.renderFrame(f) draws frame f.
import * as THREE from "./three.module.js";
import { drawPerson, drawRabbit, drawRabbitFront, drawCabbage, drawHutch, drawExclaim, drawPuff, drawShadowBlob, drawBubble, drawCloud } from "./cast.js";
import * as S from "./story.js";

const W = 1080, H = 1920;
const canvas = document.getElementById("c");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true, powerPreference: "high-performance" });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 1500);
scene.fog = new THREE.Fog(0xd6e8f2, 60, 480);

// ---------- materials ----------
const grad = new THREE.DataTexture(new Uint8Array([90, 90, 90, 255, 255, 255, 255, 255]), 2, 1, THREE.RGBAFormat);
grad.minFilter = grad.magFilter = THREE.NearestFilter; grad.needsUpdate = true;
const toon = (color, map) => new THREE.MeshToonMaterial({ color, map: map || null, gradientMap: grad });
const ctex = (w, h, fn, rep) => {
  const c = document.createElement("canvas"); c.width = w; c.height = h; fn(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); }
  return t;
};
const rnd = (() => { let s = 12345; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; })();
const speck = (g, w, h, base, cols, n, rmin, rmax, stretch = 1) => {
  g.fillStyle = base; g.fillRect(0, 0, w, h);
  for (let i = 0; i < n; i++) {
    g.fillStyle = cols[(rnd() * cols.length) | 0]; const x = rnd() * w, y = rnd() * h, r = rmin + rnd() * (rmax - rmin);
    g.beginPath(); g.ellipse(x, y, r, r * stretch, rnd() * Math.PI, 0, Math.PI * 2); g.fill();
  }
};
const T = {
  grass: ctex(512, 512, (g, w, h) => speck(g, w, h, "#86b04c", ["#76a042", "#93bd58", "#7ea94a", "#9cc463"], 900, 3, 10, 0.35), [70, 70]),
  dirt: ctex(512, 512, (g, w, h) => speck(g, w, h, "#c7a070", ["#b88f60", "#d4af80", "#a98256"], 500, 2, 7), [6, 6]),
  leaf: ctex(256, 256, (g, w, h) => speck(g, w, h, "#4f8a3a", ["#3f7630", "#5e9a44", "#467f35"], 260, 6, 18), [2, 2]),
  hedge: ctex(256, 256, (g, w, h) => speck(g, w, h, "#3f7a34", ["#336a2b", "#4b8a3e", "#2e6128"], 300, 5, 14), [8, 1]),
  wood: ctex(256, 256, (g, w, h) => { g.fillStyle = "#b07a45"; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 42) { g.fillStyle = "#5a3a20"; g.fillRect(0, y, w, 4); g.fillStyle = "#c48b52"; g.fillRect(0, y + 8, w, 3); } g.fillStyle = "#5a3a20"; g.fillRect(0, 0, 5, h); g.fillRect(w - 5, 0, 5, h); }),
  slate: ctex(512, 256, (g, w, h) => { g.fillStyle = "#5c6a86"; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 24) { g.fillStyle = "#47536d"; g.fillRect(0, y, w, 3); for (let x = (y / 24) % 2 ? 0 : 20; x < w; x += 40) g.fillRect(x, y, 3, 24); } }, [3, 1]),
  redwood: ctex(256, 256, (g, w, h) => { g.fillStyle = "#a6483a"; g.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 32) { g.fillStyle = "#7a3028"; g.fillRect(x, 0, 4, h); } }, [6, 2]),
  tower: ctex(256, 512, (g, w, h) => { g.fillStyle = "#efe2c4"; g.fillRect(0, 0, w, h); for (const y of [60, 300]) for (const x of [50, 150]) { g.fillStyle = "#ffffff"; g.fillRect(x - 4, y - 4, 58, 140); g.fillStyle = "#3a587a"; g.fillRect(x, y, 50, 132); g.fillStyle = "#ffffff"; g.fillRect(x + 23, y, 4, 132); g.fillRect(x, y + 60, 50, 4); } }),
  stripe: ctex(512, 64, (g, w, h) => { for (let x = 0; x < w; x += 64) { g.fillStyle = (x / 64) % 2 ? "#f4f1ea" : "#3a5fae"; g.fillRect(x, 0, 64, h); } }),
  facade: ctex(1024, 384, (g, w, h) => {
    g.fillStyle = "#efe2c4"; g.fillRect(0, 0, w, h);
    g.fillStyle = "#d9c9a6"; g.fillRect(0, h - 30, w, 30); g.fillRect(0, 180, w, 10);
    for (const row of [50, 220]) for (let x = 40; x < w - 40; x += 70) {
      if (row === 220 && Math.abs(x + 20 - w / 2) < 40) continue;
      g.fillStyle = "#ffffff"; g.fillRect(x - 4, row - 4, 48, 100); g.fillStyle = "#3a587a"; g.fillRect(x, row, 40, 92);
      g.fillStyle = "#ffffff"; g.fillRect(x + 18, row, 4, 92); g.fillRect(x, row + 40, 40, 4);
    }
    g.fillStyle = "#6a4428"; g.fillRect(w / 2 - 30, 230, 60, 124); g.fillStyle = "#e8c45a"; g.fillRect(w / 2 - 3, 285, 6, 6);
  }),
};
const MAT = {
  grass: toon(0xffffff, T.grass), dirt: toon(0xffffff, T.dirt), leaf: toon(0xffffff, T.leaf), hedge: toon(0xffffff, T.hedge),
  wood: toon(0xffffff, T.wood), slate: toon(0xffffff, T.slate), facade: toon(0xffffff, T.facade), plaster: toon(0xefe2c4),
  trunk: toon(0x7a5232), hill: toon(0x9ab85a), hill2: toon(0x88a858), farhill: toon(0xa9c4a0), redwood: toon(0xffffff, T.redwood),
  green: toon(0x2f4a3a), gold: toon(0xe0b84e), wheel: toon(0x8a2f2a), dark: toon(0x2a2630), window: toon(0x2c3f5c), white: toon(0xf4f1ea),
  hay: toon(0xd8b25a), stone: toon(0xb9b3a6), tower: toon(0xffffff, T.tower), stripe: toon(0xffffff, T.stripe),
};

// ---------- world ----------
const groups = { field: new THREE.Group(), farm: new THREE.Group() };
scene.add(groups.field, groups.farm);
const add = (grp, geo, mat, x, y, z, opts = {}) => {
  const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
  if (opts.ry) m.rotation.y = opts.ry; if (opts.rx) m.rotation.x = opts.rx; if (opts.rz) m.rotation.z = opts.rz;
  if (opts.s) m.scale.set(...opts.s);
  m.castShadow = opts.cast !== false; m.receiveShadow = true; grp.add(m); return m;
};
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const tree = (grp, x, z, s = 1, pine = false) => {
  add(grp, new THREE.CylinderGeometry(0.18 * s, 0.26 * s, 2.6 * s, 8), MAT.trunk, x, 1.3 * s, z);
  if (pine) add(grp, new THREE.ConeGeometry(1.5 * s, 4.5 * s, 9), MAT.leaf, x, 4.2 * s, z);
  else for (const [dx, dy, dz, r] of [[0, 3.6, 0, 1.7], [0.9, 3.0, 0.3, 1.2], [-0.8, 3.1, -0.2, 1.3], [0.1, 4.4, 0.2, 1.1]]) add(grp, new THREE.SphereGeometry(r * s, 14, 10), MAT.leaf, x + dx * s, dy * s, z + dz * s);
};
const F = groups.field;
add(F, new THREE.PlaneGeometry(1000, 1000), MAT.grass, 0, 0, 0, { rx: -Math.PI / 2, cast: false });
// chateau
add(F, box(52, 16, 14), [MAT.plaster, MAT.plaster, MAT.plaster, MAT.plaster, MAT.facade, MAT.plaster], 0, 8, -112);
const roofGeo = new THREE.CylinderGeometry(0.01, 10.5, 8, 4, 1); roofGeo.rotateY(Math.PI / 4); roofGeo.scale(3.6, 1, 1.0);
add(F, roofGeo, MAT.slate, 0, 20, -112);
for (const sx of [-30, 30]) { add(F, box(10, 20, 12), [MAT.plaster, MAT.plaster, MAT.plaster, MAT.plaster, MAT.tower, MAT.plaster], sx, 10, -111); add(F, new THREE.ConeGeometry(7.5, 9, 4), MAT.slate, sx, 24.5, -111, { ry: Math.PI / 4 }); }
add(F, box(6, 0.05, 82), MAT.dirt, 0, 0.02, -63, { cast: false });
// hedges and trees
for (const sx of [-1, 1]) add(F, box(44, 2.2, 2.2), MAT.hedge, sx * 26, 1.1, -60);
for (const [x, z, s, p] of [[-24, -30, 1.3], [-34, -12, 1.5], [-40, 10, 1.6, 1], [26, -28, 1.4], [36, -8, 1.6], [44, 16, 1.5, 1], [-60, -50, 1.8, 1], [62, -52, 1.8, 1], [-18, -58, 1.2], [20, -60, 1.2], [-75, 20, 2], [80, 0, 2.1], [-14, 40, 1.4], [16, 46, 1.6, 1], [-55, -20, 1.7]]) tree(F, x, z, s, !!p);
for (let i = 0; i < 9; i++) add(F, new THREE.SphereGeometry(60 + rnd() * 40, 24, 12), i % 2 ? MAT.hill : MAT.hill2, -260 + i * 70, -40, -200 - rnd() * 80, { cast: false });
for (let i = 0; i < 6; i++) add(F, new THREE.SphereGeometry(90 + rnd() * 50, 24, 12), MAT.farhill, -300 + i * 120, -60, -380, { cast: false });
// hunting pavilion
add(F, new THREE.CylinderGeometry(2.6, 2.6, 2.4, 16, 1, true), MAT.stripe, -9, 1.2, -3);
add(F, new THREE.ConeGeometry(3.0, 1.8, 16), MAT.stripe, -9, 3.3, -3);
add(F, box(2.4, 0.08, 1.0), MAT.white, -4.5, 0.8, -1); for (const dx of [-1, 1]) add(F, box(0.08, 0.8, 0.8), MAT.wood, -4.5 + dx * 1.0, 0.4, -1);
for (const [x, z, s] of [[-14, 2, 1.0], [12, -4, 1.1], [16, 6, 0.9]]) tree(F, x, z, s);
// crates
const crates = [];
for (let i = 0; i < 6; i++) {
  const g = new THREE.Group(), x = -7.5 + i * 3 + (i % 2) * 0.4, z = -11 - (i % 3) * 1.6;
  g.position.set(x, 0, z); g.rotation.y = (rnd() - 0.5) * 0.5; F.add(g);
  add(g, box(1.1, 0.8, 0.8), MAT.wood, 0, 0.4, 0);
  const pv = new THREE.Group(); pv.position.set(0, 0.8, -0.4); g.add(pv);
  add(pv, box(1.16, 0.08, 0.86), MAT.wood, 0, 0.04, 0.4);
  crates.push({ g, pv });
}
// flags (tricolour, waving)
const flagTex = ctex(300, 200, (g) => { for (const [i, c] of ["#2c4fa3", "#f4f1ea", "#c9353a"].entries()) { g.fillStyle = c; g.fillRect(i * 100, 0, 100, 200); } g.strokeStyle = "#241726"; g.lineWidth = 8; g.strokeRect(0, 0, 300, 200); });
const flags = [];
for (const x of [-1.25, 0.55]) {
  add(F, new THREE.CylinderGeometry(0.035, 0.035, 2.9, 8), MAT.dark, x, 1.45, 6.3);
  const geo = new THREE.PlaneGeometry(1.2, 0.8, 12, 4), m = new THREE.Mesh(geo, new THREE.MeshToonMaterial({ map: flagTex, gradientMap: grad, side: THREE.DoubleSide }));
  m.position.set(x + 0.62, 2.4, 6.3); m.castShadow = true; F.add(m); flags.push({ m, base: geo.attributes.position.array.slice() }); m.userData.flag = true; F.children[F.children.length - 2].userData.flag = true;
}
// carriage
const carriage = new THREE.Group(); carriage.position.set(3.6, 0, 8.0); F.add(carriage);
add(carriage, box(2.3, 1.35, 1.3), MAT.green, 0, 1.45, 0);
add(carriage, box(2.5, 0.12, 1.45), MAT.gold, 0, 2.18, 0);
add(carriage, box(2.42, 0.1, 1.38), MAT.green, 0, 2.28, 0);
add(carriage, box(2.34, 0.1, 1.34), MAT.gold, 0, 0.8, 0);
const door = new THREE.Group(); door.position.set(-0.45, 0.85, 0.66); carriage.add(door);
add(door, box(0.9, 1.2, 0.06), MAT.green, 0.45, 0.6, 0.0);
add(door, box(0.6, 0.5, 0.07), MAT.window, 0.45, 0.85, 0.0);
add(door, box(0.92, 0.05, 0.08), MAT.gold, 0.45, 1.18, 0.0);
add(carriage, box(0.5, 0.5, 0.05), MAT.window, 0.75, 1.7, 0.66);
add(carriage, box(0.5, 0.5, 0.05), MAT.window, 0.75, 1.7, -0.66);
for (const [x, z] of [[-0.85, 0.78], [0.85, 0.78], [-0.85, -0.78], [0.85, -0.78]]) {
  const w = add(carriage, new THREE.CylinderGeometry(0.55, 0.55, 0.1, 20), MAT.wheel, x, 0.55, z, { rx: Math.PI / 2 });
  add(carriage, new THREE.TorusGeometry(0.55, 0.05, 6, 24), MAT.dark, x, 0.55, z + Math.sign(z) * 0.06);
}
add(carriage, box(0.6, 0.12, 1.1), MAT.dark, 1.45, 1.1, 0);

// farm (flashback)
const B = groups.farm; B.position.set(-600, 0, 0);
add(B, new THREE.PlaneGeometry(400, 400), MAT.grass, 0, 0, 0, { rx: -Math.PI / 2, cast: false });
add(B, box(12, 6, 8), MAT.redwood, 0, 3, -12);
const broof = new THREE.CylinderGeometry(0.01, 6.6, 3.5, 4, 1); broof.rotateY(Math.PI / 4); broof.scale(1.3, 1, 0.9);
add(B, broof, MAT.slate, 0, 7.7, -12);
add(B, box(3, 4, 0.1), MAT.dark, 0, 2, -7.95);
for (let x = -9; x <= 9; x += 1.8) add(B, box(0.15, 1.1, 0.15), MAT.wood, x, 0.55, -4);
for (const y of [0.45, 0.9]) for (const sx of [-1, 1]) add(B, box(9, 0.1, 0.08), MAT.wood, sx * 4.6, y, -4);
add(B, box(1.6, 0.85, 0.9), MAT.wood, 0.3, 0.42, 0.4); // table under the hutch
for (const [x, z] of [[-6, -6], [5, -7]]) add(B, new THREE.CylinderGeometry(0.9, 1.1, 1.0, 12), MAT.hay, x, 0.5, z);
for (const [x, z, s] of [[-14, -16, 1.5], [12, -18, 1.7], [-20, 2, 1.4, 1], [18, -2, 1.6, 1]]) tree(B, x, z, s, !!s);
for (let i = 0; i < 5; i++) add(B, new THREE.SphereGeometry(60 + rnd() * 30, 20, 10), MAT.hill2, -150 + i * 75, -40, -140, { cast: false });

// sky dome + clouds
const sky = new THREE.Mesh(new THREE.SphereGeometry(1200, 32, 16), new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false, fog: false,
  uniforms: { top: { value: new THREE.Color() }, hor: { value: new THREE.Color() } },
  vertexShader: "varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
  fragmentShader: "uniform vec3 top; uniform vec3 hor; varying vec3 vP; void main(){ float h = clamp(normalize(vP).y*2.2, 0.0, 1.0); gl_FragColor = vec4(mix(hor, top, pow(h,0.8)), 1.0); }",
}));
sky.renderOrder = -10; scene.add(sky);
const clouds = [];
for (let i = 0; i < 9; i++) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.5), new THREE.MeshBasicMaterial({ map: ctex(1024, 512, (g) => drawCloud(g, i + 1)), transparent: true, depthWrite: false, fog: false }));
  const a = -1.2 + i * 0.3, r = 520; m.position.set(Math.sin(a) * r, 90 + (i % 3) * 30, -Math.cos(a) * r); m.scale.setScalar(150 + (i % 4) * 30);
  m.userData.cloud = true; m.renderOrder = -5; scene.add(m); clouds.push(m);
}

// lights
const hemi = new THREE.HemisphereLight(0xffffff, 0x556644, 1); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffffff, 2); scene.add(sun, sun.target);
sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.03;
const LIGHT = {
  day: { az: 140, el: 48, sun: 0xfff1dc, si: 2.6, sky: 0xd8ecff, gnd: 0x6d7a4a, hi: 1.25, top: 0x5f9fd8, hor: 0xd7e9f3, fog: 0xd7e9f3, card: 0xffffff, sat: 1.08, gain: 1.0 },
  gold: { az: 115, el: 20, sun: 0xffc27a, si: 2.8, sky: 0xffe0c0, gnd: 0x7a6440, hi: 1.15, top: 0x7c98cc, hor: 0xf3c497, fog: 0xf0caa0, card: 0xffe9d2, sat: 1.12, gain: 1.0 },
  night: { az: 200, el: 40, sun: 0xb8c8ff, si: 2.5, sky: 0x8a9ad0, gnd: 0x3a4468, hi: 1.7, top: 0x101c40, hor: 0x41558c, fog: 0x34477a, card: 0xc8d2f4, sat: 0.95, gain: 1.0 },
};
const applyLight = (k, center) => {
  const L = LIGHT[k], az = (L.az * Math.PI) / 180, el = (L.el * Math.PI) / 180;
  sun.color.setHex(L.sun); sun.intensity = L.si; hemi.color.setHex(L.sky); hemi.groundColor.setHex(L.gnd); hemi.intensity = L.hi;
  sun.position.set(center.x + Math.cos(el) * Math.sin(az) * 60, center.y + Math.sin(el) * 60, center.z + Math.cos(el) * Math.cos(az) * 60);
  sun.target.position.copy(center);
  const sc = sun.shadow.camera; sc.left = -18; sc.right = 18; sc.top = 18; sc.bottom = -18; sc.near = 1; sc.far = 160; sc.updateProjectionMatrix();
  sky.material.uniforms.top.value.setHex(L.top); sky.material.uniforms.hor.value.setHex(L.hor); scene.fog.color.setHex(L.fog);
  return L;
};

// ---------- cards ----------
const blobTex = ctex(512, 512, drawShadowBlob);
const cardGeo = (w, h, sole) => { const g = new THREE.PlaneGeometry(w, h); g.translate(0, h / 2 - sole, 0); return g; };
const GEO = { person: cardGeo(1.35, 2.25, 0.056), small: cardGeo(0.62, 0.62, 0.027), hutch: cardGeo(1.2, 0.96, 0.0), fx: cardGeo(1, 1, 0.5) };
const pool = new Map();
const texCache = new Map();
const sharedTex = (key, w, h, fn) => {
  if (!texCache.has(key)) texCache.set(key, ctex(w, h, fn));
  return texCache.get(key);
};
const cardMat = (map) => new THREE.MeshBasicMaterial({ map, alphaTest: 0.5, side: THREE.DoubleSide, fog: true });
const blobMat = new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, fog: true });
const getCard = (id, kind) => {
  let c = pool.get(id);
  if (!c) {
    const geo = GEO[kind === "person" ? "person" : kind === "hutch" ? "hutch" : kind === "fx" ? "fx" : "small"];
    const m = new THREE.Mesh(geo, cardMat(null)); m.userData.card = true;
    const blob = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), blobMat); blob.rotation.x = -Math.PI / 2; blob.userData.blob = true; blob.renderOrder = 1;
    scene.add(m, blob);
    c = { m, blob, key: null, own: null, used: false };
    pool.set(id, c);
  }
  c.used = true; return c;
};
const q = (v) => (typeof v === "number" ? Math.round(v * 50) / 50 : v);
const personTex = (c, a) => {
  const key = JSON.stringify([a.outfitKey, a.side ? 1 : 0, Object.entries(a.opts).map(([k, v]) => [k, q(v)])]);
  if (key === c.key) return;
  c.key = key;
  if (!c.own) { const cv = document.createElement("canvas"); cv.width = 1200; cv.height = 2000; c.own = { cv, tex: new THREE.CanvasTexture(cv) }; c.own.tex.colorSpace = THREE.SRGBColorSpace; }
  const g = c.own.cv.getContext("2d"); g.clearRect(0, 0, 1200, 2000);
  const opts = {}; for (const [k, v] of Object.entries(a.opts)) opts[k] = q(v);
  drawPerson(g, a.outfit, { ...opts, side: a.side });
  c.own.tex.needsUpdate = true; c.m.material.map = c.own.tex; c.m.material.needsUpdate = true;
};
const smallTex = (a) => {
  switch (a.kind) {
    case "rabbit": { const h = Math.round((a.hop || 0) * 8) / 8 % 1; return sharedTex(`r${a.v}_${h}_${a.look ? 1 : 0}`, 512, 512, (g) => drawRabbit(g, a.v, h, { look: a.look })); }
    case "rabbitF": { const b = Math.round((a.beg || 0) * 4) / 4; return sharedTex(`rf${a.v}_${b}_${a.blink ? 1 : 0}`, 512, 512, (g) => drawRabbitFront(g, a.v, b, a.blink)); }
    case "cabbage": return sharedTex("cab", 512, 512, drawCabbage);
    case "bubble": return sharedTex("bub", 512, 512, drawBubble);
    case "exclaim": return sharedTex("exc", 512, 512, (g) => drawExclaim(g, 1));
    case "puff": { const t = Math.round(a.t * 10) / 10; return sharedTex(`puff${t}`, 512, 512, (g) => drawPuff(g, t)); }
    case "hutch": return sharedTex("hutch", 600, 480, drawHutch);
  }
};
const camRight = new THREE.Vector3();
const drawActors = (list, tint) => {
  for (const c of pool.values()) c.used = false;
  camera.getWorldDirection(camRight); const yaw = Math.atan2(-camRight.x, -camRight.z);
  for (const a of list) {
    const kind = a.kind === "person" ? "person" : a.kind === "hutch" ? "hutch" : ["bubble", "exclaim", "puff"].includes(a.kind) ? "fx" : "small";
    const c = getCard(a.id, kind);
    if (a.kind === "person") personTex(c, a);
    else { const t = smallTex(a); if (c.m.material.map !== t) { c.m.material.map = t; c.m.material.needsUpdate = true; } }
    const s = a.s ?? 1;
    c.m.position.set(a.x, a.y ?? 0, a.z); c.m.rotation.set(0, yaw, a.roll || 0);
    c.m.scale.set((a.flip ? -1 : 1) * s * (a.sx ?? 1), s * (a.sy ?? 1), 1);
    c.m.material.color.setHex(a.glow ? 0xffffff : tint);
    c.m.visible = true; c.m.renderOrder = a.fxOrder || 0;
    const showBlob = a.blob !== false && kind !== "fx";
    c.blob.visible = showBlob;
    if (showBlob) {
      const lift = Math.max(0, (a.y ?? 0) - (a.ground ?? 0));
      const bw = (kind === "person" ? 1.1 : kind === "hutch" ? 0 : 0.55) * s * Math.max(0.4, 1 - lift * 0.6);
      c.blob.position.set(a.x, (a.ground ?? 0) + 0.015, a.z); c.blob.scale.set(bw, bw * 0.45, 1); c.blob.material.opacity = 1;
    }
  }
  for (const c of pool.values()) if (!c.used) { c.m.visible = false; c.blob.visible = false; }
};

// ---------- render targets + post ----------
const rtColor = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 });
const rtND = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType });
const rtInk = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType });
const ndWorld = new THREE.ShaderMaterial({
  vertexShader: "varying vec3 vN; varying float vD; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.0); vN = normalize(normalMatrix*normal); vD = -mv.z; gl_Position = projectionMatrix*mv; }",
  fragmentShader: "varying vec3 vN; varying float vD; void main(){ vec3 n = normalize(vN); if(!gl_FrontFacing) n = -n; gl_FragColor = vec4(n*0.5+0.5, vD/1500.0); }",
  side: THREE.DoubleSide,
});
const ndCard = new THREE.ShaderMaterial({
  uniforms: { map: { value: null } },
  vertexShader: "varying vec2 vU; varying float vD; void main(){ vU = uv; vec4 mv = modelViewMatrix*vec4(position,1.0); vD = -mv.z; gl_Position = projectionMatrix*mv; }",
  fragmentShader: "uniform sampler2D map; varying vec2 vU; varying float vD; void main(){ if(texture2D(map, vU).a < 0.5) discard; gl_FragColor = vec4(0.0,0.0,0.0, vD/1500.0); }",
  side: THREE.DoubleSide,
});
const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
const postScene = new THREE.Scene(); postScene.add(quad);
const postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const inkMat = new THREE.ShaderMaterial({
  uniforms: { tC: { value: null }, tN: { value: null }, px: { value: new THREE.Vector2(1 / W, 1 / H) }, sat: { value: 1.08 }, flash: { value: 0 }, vig: { value: 0.28 }, gain: { value: 1 } },
  vertexShader: "varying vec2 vU; void main(){ vU = uv; gl_Position = vec4(position.xy,0.0,1.0); }",
  fragmentShader: `
    uniform sampler2D tC; uniform sampler2D tN; uniform vec2 px; uniform float sat; uniform float flash; uniform float vig; uniform float gain;
    varying vec2 vU;
    bool isCard(vec4 s){ return length(s.rgb) < 0.02; }
    void main(){
      vec3 col = texture2D(tC, vU).rgb * gain;
      vec4 c0 = texture2D(tN, vU);
      float ink = 0.0;
      if(!isCard(c0)){
        float d0 = c0.a*1500.0; vec3 n0 = c0.rgb*2.0-1.0;
        float r = 2.5;
        for(int i=0;i<8;i++){
          float a = float(i)*0.785398;
          vec4 s = texture2D(tN, vU + vec2(cos(a),sin(a))*px*r);
          if(isCard(s)) continue;
          float d = s.a*1500.0;
          if(d - d0 > 0.06*d0 + 0.05) ink = max(ink, 1.0);
          vec3 n = s.rgb*2.0-1.0;
          if(abs(d-d0) < 0.08*d0 && dot(n,n0) < 0.82) ink = max(ink, 0.9);
        }
        ink *= 1.0 - smoothstep(140.0, 520.0, d0);
      }
      col = mix(col, vec3(0.141,0.090,0.149)*0.35, ink);
      float l = dot(col, vec3(0.2126,0.7152,0.0722)); col = mix(vec3(l), col, sat);
      vec2 v = vU-0.5; col *= 1.0 - vig*dot(v*vec2(1.0,0.75), v*vec2(1.0,0.75))*2.2;
      col = mix(col, vec3(1.0), flash);
      gl_FragColor = vec4(col, c0.a);
    }`,
});
const dofMat = new THREE.ShaderMaterial({
  uniforms: { tC: { value: null }, tN: { value: null }, px: { value: new THREE.Vector2(1 / W, 1 / H) }, focus: { value: 5 }, cInf: { value: 0 } },
  vertexShader: "varying vec2 vU; void main(){ vU = uv; gl_Position = vec4(position.xy,0.0,1.0); }",
  fragmentShader: `
    uniform sampler2D tC; uniform sampler2D tN; uniform vec2 px; uniform float focus; uniform float cInf; varying vec2 vU;
    float coc(float d){ return min(cInf*abs(1.0 - focus/max(d,0.01)), 18.0); }
    vec3 toS(vec3 c){ c = max(c, 0.0); return mix(c*12.92, 1.055*pow(c, vec3(1.0/2.4))-0.055, step(0.0031308, c)); }
    void main(){
      vec4 c0 = texture2D(tC, vU);
      float d0 = texture2D(tN, vU).a*1500.0; float r0 = coc(d0);
      if(cInf < 0.01 || r0 < 0.6){ gl_FragColor = vec4(toS(c0.rgb),1.0); return; }
      vec3 acc = c0.rgb; float w = 1.0;
      for(int i=1;i<32;i++){
        float fi = float(i); float rr = sqrt(fi/32.0)*r0; float a = fi*2.39996;
        vec2 uv = vU + vec2(cos(a),sin(a))*rr*px;
        float ds = texture2D(tN, uv).a*1500.0; float rs = coc(ds);
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
  const place = shot.place || "field";
  groups.field.visible = place === "field"; groups.farm.visible = place === "farm";
  const cam = S.camAt(f);
  camera.position.set(...cam.pos); camera.fov = cam.fov; camera.up.set(Math.sin(cam.roll || 0), Math.cos(cam.roll || 0), 0);
  camera.lookAt(...cam.tgt); camera.updateProjectionMatrix();
  const L = applyLight(shot.light, tmpV.set(...cam.tgt));
  // world state
  const w = S.worldAt(f);
  crates.forEach((c, i) => { c.pv.rotation.x = -(w.crate[i] || 0) * 1.9; });
  door.rotation.y = (w.door || 0) * 1.6;
  flags.forEach((fl, k) => { const p = fl.m.geometry.attributes.position, b = fl.base; for (let i = 0; i < p.count; i++) { const x = b[3 * i] + 0.6; p.array[3 * i + 2] = b[3 * i + 2] + Math.sin(x * 4 - f * 0.25 + k) * 0.08 * x; } p.needsUpdate = true; fl.m.geometry.computeVertexNormals(); });
  for (const c of clouds) c.lookAt(camera.position);
  F.children.forEach((o) => { if (o.userData.flag) o.visible = !!w.flags; });
  drawActors(S.actorsAt(f), L.card);
  // colour pass
  renderer.setRenderTarget(rtColor); renderer.setClearColor(0xd7e9f3, 1); renderer.clear(); renderer.render(scene, camera);
  // normal/depth pass
  const hidden = [];
  scene.traverse((o) => {
    if (!o.isMesh) return;
    if (o === sky || o.userData.cloud || o.userData.blob) { if (o.visible) { o.visible = false; hidden.push(o); } return; }
    if (o.userData.card) { o.userData.mat = o.material; ndCard.uniforms.map.value = o.material.map; o.material = ndCard.clone(); o.material.uniforms.map.value = o.userData.mat.map; }
    else { o.userData.mat = o.material; o.material = ndWorld; }
  });
  const fog = scene.fog; scene.fog = null; const se = renderer.shadowMap.enabled; renderer.shadowMap.autoUpdate = false;
  renderer.setRenderTarget(rtND); renderer.setClearColor(new THREE.Color(0.5, 0.5, 1.0), 1); renderer.clear(); renderer.render(scene, camera);
  scene.fog = fog; renderer.shadowMap.autoUpdate = true;
  scene.traverse((o) => { if (o.isMesh && o.userData.mat) { if (o.userData.card) o.material.dispose(); o.material = o.userData.mat; delete o.userData.mat; } });
  for (const o of hidden) o.visible = true;
  // ink + grade
  inkMat.uniforms.tC.value = rtColor.texture; inkMat.uniforms.tN.value = rtND.texture; inkMat.uniforms.sat.value = L.sat; inkMat.uniforms.flash.value = S.flashAt(f);
  quad.material = inkMat; renderer.setRenderTarget(rtInk); renderer.render(postScene, postCam);
  // dof to screen
  const d = S.dofAt(f);
  camera.getWorldDirection(tmpV);
  const fp = new THREE.Vector3(...(d.focus || cam.tgt));
  dofMat.uniforms.focus.value = Math.max(0.3, fp.sub(camera.position).dot(tmpV));
  dofMat.uniforms.cInf.value = d.cInf || 0;
  dofMat.uniforms.tC.value = rtInk.texture; dofMat.uniforms.tN.value = rtND.texture;
  quad.material = dofMat; renderer.setRenderTarget(null); renderer.render(postScene, postCam);
  window.boxes = screenBoxes();
};
// ---------- where the content is on screen (for caption placement) ----------
// For every visible card: the opaque part of its texture, projected to screen pixels [x0, y0, x1, y1].
const opaqueCache = new Map();
const opaqueUV = (tex) => {
  if (!tex || !tex.image || !tex.image.getContext) return [0, 0, 1, 1];
  if (opaqueCache.has(tex.uuid)) return opaqueCache.get(tex.uuid);
  const img = tex.image, w = img.width, h = img.height, a = img.getContext("2d").getImageData(0, 0, w, h).data;
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y += 4) for (let x = 0; x < w; x += 4) if (a[(y * w + x) * 4 + 3] > 128) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  const r = x1 < 0 ? null : [x0 / w, y0 / h, (x1 + 4) / w, (y1 + 4) / h];
  opaqueCache.set(tex.uuid, r); return r;
};
const pv = new THREE.Vector3();
const screenBoxes = () => {
  const out = [];
  for (const c of pool.values()) {
    const m = c.m; if (!m.visible) continue;
    const uv = opaqueUV(m.material.map); if (!uv) continue;
    if (!m.geometry.boundingBox) m.geometry.computeBoundingBox();
    const bb = m.geometry.boundingBox; m.updateMatrixWorld();
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9, front = false;
    for (const u of [uv[0], uv[2]]) for (const v of [uv[1], uv[3]]) {
      pv.set(bb.min.x + (bb.max.x - bb.min.x) * u, bb.max.y - (bb.max.y - bb.min.y) * v, 0).applyMatrix4(m.matrixWorld).project(camera);
      if (pv.z < 1) front = true;
      const sx = (pv.x * 0.5 + 0.5) * W, sy = (0.5 - pv.y * 0.5) * H;
      x0 = Math.min(x0, sx); x1 = Math.max(x1, sx); y0 = Math.min(y0, sy); y1 = Math.max(y1, sy);
    }
    if (!front || x1 < 0 || x0 > W || y1 < 0 || y0 > H) continue;
    out.push([Math.max(0, x0), Math.max(0, y0), Math.min(W, x1), Math.min(H, y1)].map(Math.round));
  }
  return out;
};
window.TOTAL = S.TOTAL;
window.ready = true;
