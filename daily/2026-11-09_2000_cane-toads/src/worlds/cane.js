// 102 TOADS BECAME 200 MILLION — Queensland 1935. Locations:
// crate (hook: the 102-toad crate on the wharf), swarm (night road full of toads), field (beetle munching the cane top),
// dock (toads unloaded from Hawaii, the official), release (crates open, toads everywhere; porch lamp + dog bowl),
// pond (egg strings), map (spread across Australia), farmer (old farmer looks up), stalk (payoff: toads can't climb).
import * as THREE from 'three';
import { toon, part, paintTexture, rng, INK } from '../lib/toon.js';
import { makePerson } from '../lib/char.js';
import { critter, toadCrowd } from '../lib/critters.js';
import { addLights } from '../Stage.jsx';
import { cameraPath } from '../lib/camera.js';
import { w, talking } from '../times.js';
import { ramp, smooth, pop, glow, sky, sea, card, crate, barrel, rope, fogBank, clouds, ground, hills, patternTex, bucket, flag } from './common.js';

const OFFICIAL = { skin: '#f1d6bd', hair: '#3a2a22', moustache: '#3a2a22', jacket: '#e8e0cc', jacket2: '#cfc6b0', pants: '#cfc6b0', shoes: INK, tie: '#a8352b', hat: 'bowler', hatColor: '#3a3036', glasses: true, seed: 23, height: 1.76 };
const FARMER = { skin: '#e2b48e', hair: '#ece8e0', brows: '#f1ede6', beard: '#ece8e0', moustache: '#f4f1ea', old: true, outfit: 'sweater', jacket: '#4f6f8f', jacket2: '#3f5a75', pants: '#5a4a3a', shoes: INK, hat: 'cap', hatColor: '#c9a25a', seed: 44, height: 1.72 };
const DOCKER = { skin: '#c99468', hair: '#1f1a1a', outfit: 'sweater', jacket: '#8a3a2e', jacket2: '#6e2e25', pants: '#3b3640', shoes: INK, hat: 'beanie', hatColor: '#2f4058', hatColor2: '#1f2a3c', seed: 61, height: 1.78 };
const V = (a) => new THREE.Vector3(...a);
const F = (path, focus, extra = {}) => (t) => { const c = path(t); c.focus = typeof focus === 'function' ? focus(t) : V(focus); return Object.assign(c, extra); };
const shake = (c, t, t0, d = 0.3, a = 0.05) => { if (t > t0 && t < t0 + d) { const s = (1 - (t - t0) / d) * a; c.pos.x += Math.sin(t * 97) * s; c.pos.y += Math.sin(t * 71 + 2) * s; } return c; };

const LIGHT = {
  morning: { center: [0, 0, 0], key: [-40, 55, 40], keyColor: '#fff0d4', keyI: 2.2, hemiI: 1.1, hemi: ['#d6e4ef', '#7f8f9a'], size: 22, fog: ['#cfe0ea', 50, 380] },
  day: { center: [0, 0, 0], key: [40, 70, 30], keyColor: '#fff2d8', keyI: 2.3, hemiI: 1.0, hemi: ['#cfe2f0', '#8a8a50'], size: 22, fog: ['#dfe8d8', 40, 320] },
  dusk: { center: [0, 0, 0], key: [60, 14, -50], keyColor: '#ffb27a', keyI: 1.7, hemiI: 0.95, hemi: ['#c99ab8', '#3a3050'], size: 18, fog: ['#b98896', 40, 300] },
  night: { center: [0, 0, 0], key: [-40, 50, -60], keyColor: '#9fb4d8', keyI: 0.9, hemiI: 0.55, hemi: ['#3a5078', '#0a1018'], size: 24, fog: ['#0d1729', 25, 200] },
  office: { center: [0, 0, 0], key: [-20, 30, 20], keyColor: '#9fb4d8', keyI: 0.3, hemiI: 0.4, hemi: ['#6a5a40', '#2a1e14'], size: 8, fog: ['#1a140e', 20, 120] },
};

// ---------- sugar cane ----------
const stemTex = () => patternTex((g, W, H) => { g.fillStyle = '#c4ad52'; g.fillRect(0, 0, W, H); g.fillStyle = '#a08a3a'; g.fillRect(0, 0, W * 0.35, H); for (let y = 0; y < H; y += 64) { g.fillStyle = '#6f5a2a'; g.fillRect(0, y, W, 7); g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(0, y + 9, W, 5); } }, 64, 256, [1, 3]);
let STEM_T = null, LEAF_G = null;
function leafGeo() {
  if (LEAF_G) return LEAF_G;
  const g = new THREE.PlaneGeometry(0.075, 1.15, 1, 10); g.translate(0, 0.575, 0);
  const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i); p.setZ(i, (y * y) * 0.55); p.setX(i, p.getX(i) * (1 - y / 1.3)); }
  g.computeVertexNormals(); LEAF_G = g; return g;
}
// one detailed stalk (stem + node rings + leaves); returns {group, top}
function stalk(h = 3, seed = 1, { ink = true, dead = 0, away = false } = {}) {
  const r = rng(seed); const g = new THREE.Group();
  STEM_T = STEM_T || stemTex();
  const stem = part(new THREE.CylinderGeometry(0.028, 0.034, h, 8), toon('#ffffff', STEM_T), [0, h / 2, 0], { outline: ink ? 0.008 : 0, edges: false });
  g.add(stem);
  const leafM = toon(dead > 0 ? '#9a8a3a' : '#6f9a3a', null, { side: THREE.DoubleSide }), leafM2 = toon('#86b04a', null, { side: THREE.DoubleSide });
  const n = 7;
  for (let i = 0; i < n; i++) {
    const y = h * ((away ? 0.7 : 0.45) + (away ? 0.3 : 0.55) * (i / n)), l = new THREE.Mesh(leafGeo(), i % 2 ? leafM : leafM2);
    l.position.set(0, y, 0); l.rotation.set(-0.35 - r() * 0.5, away ? Math.PI * (0.55 + r() * 0.9) : r() * Math.PI * 2, 0); l.scale.setScalar(0.8 + r() * 0.5); l.castShadow = true; g.add(l);
  }
  return { group: g, top: h };
}
// a far field as instanced stems + leaves (cheap): rows in [x0,x1]x[z0,z1], skipping a clearing
function caneMass({ x = [-30, 30], z = [-40, -4], step = 0.55, seed = 5, h = [2.6, 3.4], clear = null, tint = '#6f9a3a' } = {}) {
  const r = rng(seed); const pos = [];
  for (let zz = z[0]; zz < z[1]; zz += step) for (let xx = x[0]; xx < x[1]; xx += step * (0.8 + r() * 0.6)) { const px = xx + r() * 0.3, pz = zz + r() * 0.3; if (clear && clear(px, pz)) continue; pos.push([px, pz, h[0] + r() * (h[1] - h[0]), r()]); }
  STEM_T = STEM_T || stemTex();
  const stems = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.028, 0.034, 1, 6), toon('#ffffff', STEM_T), pos.length);
  const leaves = new THREE.InstancedMesh(leafGeo(), toon(tint, null, { side: THREE.DoubleSide }), pos.length * 5);
  const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), S = new THREE.Vector3(), P = new THREE.Vector3();
  pos.forEach(([px, pz, hh, k], i) => {
    M.compose(P.set(px, hh / 2, pz), Q.identity(), S.set(1, hh, 1)); stems.setMatrixAt(i, M);
    for (let j = 0; j < 5; j++) { E.set(-0.4 - r() * 0.5, r() * 6.28, 0); Q.setFromEuler(E); const s = 0.8 + r() * 0.5; M.compose(P.set(px, hh * (0.5 + j * 0.11), pz), Q, S.set(s, s, s)); leaves.setMatrixAt(i * 5 + j, M); }
  });
  stems.castShadow = leaves.castShadow = true; stems.receiveShadow = leaves.receiveShadow = true;
  const g = new THREE.Group(); g.add(stems, leaves); return { group: g, pos };
}

// ---------- farm / wharf props ----------
function farmhouse() {
  const g = new THREE.Group();
  const wallT = toon('#ffffff', paintTexture({ base: '#e8dcc4', kind: 'planks', seed: 3, repeat: [3, 2] }));
  g.add(part(new THREE.BoxGeometry(7, 3, 5), wallT, [0, 2.1, 0], { outline: 0.03 }));
  const roof = new THREE.ConeGeometry(5.4, 2.2, 4); roof.rotateY(Math.PI / 4);
  const rm = part(roof, toon('#ffffff', paintTexture({ base: '#a3392d', kind: 'metal', seed: 4, repeat: [4, 2] })), [0, 4.7, 0], { outline: 0.03 }); rm.scale.set(1.0, 1, 0.72); g.add(rm);
  for (let i = 0; i < 8; i++) g.add(part(new THREE.CylinderGeometry(0.12, 0.12, 0.6, 8), toon('#6b4a32'), [-3.2 + i * 0.9, 0.3, 2.3], { outline: 0.008, edges: false })); // stumps
  g.add(part(new THREE.BoxGeometry(7.6, 0.15, 2.2), toon('#ffffff', paintTexture({ base: '#8a6142', kind: 'planks', seed: 6 })), [0, 0.62, 3.4], { outline: 0.015 }));           // veranda floor
  for (const x of [-3.6, -1.2, 1.2, 3.6]) g.add(part(new THREE.CylinderGeometry(0.06, 0.06, 2.6, 8), toon('#e8dcc4'), [x, 1.9, 4.4], { outline: 0.008, edges: false }));
  g.add(part(new THREE.BoxGeometry(7.8, 0.12, 2.4), toon('#7a7f86'), [0, 3.25, 3.4], { rot: [0.12, 0, 0], outline: 0.012 }));
  const win = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.9), glow('#ffcf7a')); win.position.set(-2, 2.2, 2.52); g.add(win);
  const door = part(new THREE.BoxGeometry(1.0, 2.0, 0.08), toon('#5b3a2a'), [1.2, 1.7, 2.52], { outline: 0.01 }); g.add(door);
  const tank = new THREE.Group(); tank.position.set(4.6, 0, -0.5); g.add(tank);
  tank.add(part(new THREE.CylinderGeometry(0.9, 0.9, 2.2, 16), toon('#ffffff', paintTexture({ base: '#9aa3ab', kind: 'metal', seed: 8 })), [0, 1.8, 0], { outline: 0.02, edges: false }));
  tank.add(part(new THREE.ConeGeometry(0.95, 0.4, 16), toon('#7d858c'), [0, 3.1, 0], { outline: 0.015, edges: false }));
  for (let i = 0; i < 4; i++) tank.add(part(new THREE.BoxGeometry(0.08, 0.7, 0.08), toon('#5b3a2a'), [Math.cos(i * 1.57) * 0.6, 0.35, Math.sin(i * 1.57) * 0.6], { outline: 0.006, edges: false }));
  return g;
}
function stencilCrate(lines, s = [1.6, 1.0, 1.0], seed = 2) {
  const g = new THREE.Group();
  g.add(part(new THREE.BoxGeometry(...s), toon('#ffffff', paintTexture({ base: '#b08a5a', kind: 'planks', seed, repeat: [2, 1] })), [0, s[1] / 2, 0], { outline: 0.02 }));
  for (const y of [0.12, s[1] - 0.12]) g.add(part(new THREE.BoxGeometry(s[0] + 0.04, 0.1, s[2] + 0.04), toon('#7a5236'), [0, y, 0], { outline: 0.008, edges: false }));
  for (let i = 0; i < 5; i++) { const h = new THREE.Mesh(new THREE.CircleGeometry(0.035, 10), toon('#1a1210')); h.position.set(-s[0] * 0.36 + i * s[0] * 0.18, s[1] * 0.82, s[2] / 2 + 0.006); g.add(h); }  // air holes
  if (lines) { const c = card(lines, s[0] * 0.86, s[1] * 0.5, { sizes: lines.map((l) => Math.min(150, Math.floor(1150 / l.length))), bg: '#c9a46a', fg: '#2b1a12', border: '#2b1a12' }); c.position.set(0, s[1] * 0.45, s[2] / 2 + 0.012); g.add(c); }
  return g;
}
function shipHull(x, z, label = 'HONOLULU') {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  g.add(part(new THREE.BoxGeometry(34, 6, 6), toon('#2f4058'), [0, 2.2, 0], { outline: 0.06 }));
  g.add(part(new THREE.BoxGeometry(34.2, 0.6, 6.2), toon('#a3392d'), [0, -0.6, 0], { outline: 0.02, edges: false }));
  g.add(part(new THREE.BoxGeometry(34.2, 0.25, 6.2), toon('#f3ead6'), [0, 5.1, 0], { outline: 0.01, edges: false }));
  for (let i = 0; i < 12; i++) { const ph = new THREE.Mesh(new THREE.CircleGeometry(0.26, 16), glow('#ffcf7a')); ph.position.set(-14 + i * 2.5, 3.8, 3.02); g.add(ph); }
  g.add(part(new THREE.BoxGeometry(9, 3.6, 4), toon('#f3ead6'), [3, 7, 0], { outline: 0.04 }));
  g.add(part(new THREE.CylinderGeometry(1, 1.2, 4.6, 16), toon('#d9a03a'), [5, 10.8, 0], { outline: 0.03, edges: false }));
  g.add(part(new THREE.CylinderGeometry(1.02, 1.02, 0.6, 16), toon('#2b2b33'), [5, 12.8, 0], { outline: 0.01, edges: false }));
  const nm = card([label], 6, 0.9, { sizes: [200], bg: '#2f4058', fg: '#f3ead6', border: '#2f4058' }); nm.position.set(-11, 4.6, 3.03); g.add(nm);
  return g;
}
function australiaTex() {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 820; const g = c.getContext('2d');
  // rough outline of the mainland + Tasmania (normalised to 1024x820)
  const AU = [[120, 330], [190, 250], [300, 225], [360, 160], [430, 130], [470, 170], [520, 120], [560, 150], [610, 120], [650, 210], [690, 120], [720, 60], [760, 180], [800, 250], [860, 320], [900, 400], [920, 480], [880, 560], [830, 620], [760, 650], [700, 640], [640, 600], [600, 560], [540, 520], [480, 530], [420, 560], [330, 580], [250, 600], [170, 610], [130, 560], [110, 470], [100, 400]];
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const r = rng(11); const dots = Array.from({ length: 420 }, () => [r(), r(), r()]);
  const inside = (x, y) => { let k = false; for (let i = 0, j = AU.length - 1; i < AU.length; j = i++) { const [xi, yi] = AU[i], [xj, yj] = AU[j]; if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) k = !k; } return k; };
  const src = [820, 300]; // Gordonvale, north Queensland
  const draw = (k) => {
    g.fillStyle = '#e9dcbc'; g.fillRect(0, 0, 1024, 820);
    g.strokeStyle = 'rgba(80,110,140,0.25)'; g.lineWidth = 2; for (let x = 0; x < 1024; x += 64) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 820); g.stroke(); } for (let y = 0; y < 820; y += 64) { g.beginPath(); g.moveTo(0, y); g.lineTo(1024, y); g.stroke(); }
    g.fillStyle = '#9fc0d0'; g.fillRect(0, 0, 1024, 820); g.globalAlpha = 1;
    g.beginPath(); AU.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fillStyle = '#e3c58a'; g.fill(); g.strokeStyle = INK; g.lineWidth = 10; g.stroke();
    g.beginPath(); g.ellipse(780, 720, 40, 32, 0, 0, 7); g.fillStyle = '#e3c58a'; g.fill(); g.stroke();
    g.fillStyle = INK; g.font = '900 60px "Arial Black", sans-serif'; g.textAlign = 'center'; g.fillText('AUSTRALIA', 470, 420);
    g.font = '900 34px "Arial Black", sans-serif'; g.fillText('QUEENSLAND', 800, 380);
    // toad dots spreading out from Gordonvale with time k (0..1)
    const R = 40 + k * 640;
    dots.forEach(([a, b, c2]) => { const x = 100 + a * 820, y = 100 + b * 560; const d = Math.hypot(x - src[0], (y - src[1]) * 1.3); if (d < R * (0.6 + 0.4 * c2) && inside(x, y)) { g.fillStyle = '#a3392d'; g.beginPath(); g.arc(x, y, 9, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = 3; g.stroke(); } });
    g.fillStyle = '#ffd23a'; g.beginPath(); g.arc(...src, 18, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = 6; g.stroke();
    tex.needsUpdate = true;
  };
  draw(0); return { tex, draw };
}
// egg strings: dark dots inside translucent jelly tubes floating on the pond
function eggStrings(n = 9, seed = 3) {
  const g = new THREE.Group(); const r = rng(seed);
  const jelly = new THREE.MeshBasicMaterial({ color: '#d8e8c8', transparent: true, opacity: 0.45, depthWrite: false });
  const egg = toon('#16110f');
  for (let i = 0; i < n; i++) {
    const pts = []; let x = -1.4 + r() * 2.8, z = -1.2 + r() * 1.6; for (let k = 0; k < 8; k++) { pts.push(V([x, 0.03, z])); x += (r() - 0.5) * 0.35; z += 0.12 + r() * 0.1; }
    const curve = new THREE.CatmullRomCurve3(pts);
    g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 0.035, 6), jelly));
    for (let k = 0; k < 40; k++) { const p = curve.getPoint(k / 40); const e = new THREE.Mesh(new THREE.SphereGeometry(0.014, 6, 4), egg); e.position.copy(p); g.add(e); }
  }
  return g;
}

export function makeCane(id) {
  return function build(scene) {
    const root = new THREE.Group(); const r = rng(id.length * 7);
    const ups = []; const U = (f) => ups.push(f);

    // ===================== WHARF (crate, dock) =====================
    if (id === 'crate' || id === 'dock') {
      addLights(scene, LIGHT.morning);
      root.add(sky('morning')); const S = sea('morning'); S.mesh.position.y = -1; root.add(S.mesh); U((t) => S.update(t)); root.add(clouds('rgba(255,255,255,0.6)', 8, 60, 2));
      root.add(part(new THREE.BoxGeometry(40, 0.4, 16), toon('#ffffff', paintTexture({ base: '#8a7a6a', kind: 'planks', seed: 12, repeat: [8, 3] })), [0, -0.2, 3], { outline: 0.02, edges: false }));
      for (const x of [-12, -6, 0, 6, 12]) root.add(part(new THREE.CylinderGeometry(0.22, 0.26, 0.7, 12), toon('#2b2b33'), [x, 0.35, -4.4], { outline: 0.015, edges: false }));
      root.add(shipHull(-2, -8.2));
      // crane arm over the wharf
      const crane = new THREE.Group(); crane.position.set(6, 0, -2.8); root.add(crane);
      crane.add(part(new THREE.BoxGeometry(0.5, 9, 0.5), toon('#d9a03a'), [0, 4.5, 0], { outline: 0.02 }));
      crane.add(part(new THREE.BoxGeometry(8, 0.4, 0.4), toon('#d9a03a'), [-3.6, 8.8, 0], { outline: 0.02 }));
      const cable = part(new THREE.CylinderGeometry(0.02, 0.02, 1, 6), toon('#2b2b33'), [0, 0, 0], { outline: 0, edges: false }); root.add(cable);
      // stacked crates + barrels + ropes
      for (let i = 0; i < 6; i++) { const c = crate(0.8); c.position.set(-6 + (i % 3) * 0.85, Math.floor(i / 3) * 0.8, 0.6); root.add(c); }
      const br = barrel(); br.position.set(-3.6, 0, 1.6); root.add(br); const br2 = barrel('#5b6a7a'); br2.position.set(-2.8, 0, 2.1); root.add(br2);
      const rp = rope(0.4); rp.position.set(3.2, 0, 2.6); root.add(rp);
      const fl = flag('#2f6fb0'); fl.group.position.set(9, 0, 0); root.add(fl.group); U((t) => fl.update(t));
      const sign = card(['CAIRNS WHARF', 'QUEENSLAND 1935'], 2.4, 1.0, { sizes: [100, 80], bg: '#f4ead2' }); sign.position.set(-8.6, 2.4, 2.2); sign.rotation.y = 0.4; root.add(sign);
      root.add(part(new THREE.CylinderGeometry(0.06, 0.06, 2.4, 8), toon('#5b3a2a'), [-8.6, 1.2, 2.15], { outline: 0.01, edges: false }));
      const gulls = []; for (let i = 0; i < 4; i++) { const gl = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.2), toon('#f3ead6', null, { side: THREE.DoubleSide })); root.add(gl); gulls.push([gl, i]); }
      U((t) => gulls.forEach(([gl, i]) => { gl.position.set(-10 + ((t * 2 + i * 6) % 24), 8 + i + Math.sin(t * 2 + i), -10); gl.rotation.z = Math.sin(t * 9 + i) * 0.4; }));
      // THE crate
      const big = stencilCrate(['HAWAII > QUEENSLAND', '102 TOADS'], [1.6, 1.0, 1.0], 5); big.position.set(0, 0, 1.0); root.add(big);
      const peek = []; for (const [x, y, z, p] of [[-0.45, 1.0, 1.1, 'sit'], [0.15, 1.0, 0.9, 'up'], [0.55, 1.0, 1.2, 'sit']]) { const c = critter('toad', { size: 0.3, pose: p }); c.group.position.set(x, y, z); root.add(c.group); peek.push(c); }
      if (id === 'crate') {
        const crowd = toadCrowd(14, { x: [-1.4, 1.4], z: [1.7, 3.0], size: [0.22, 0.3], seed: 4, shadow: true });
        root.add(crowd.group);
        cable.visible = false;
        U((t, cam) => {
          peek.forEach((c, i) => { const k = pop(ramp(t, w(0, '^102') - 0.1 + i * 0.12, w(0, '^102') + 0.25 + i * 0.12)); c.group.scale.setScalar(Math.max(0.001, k)); c.setPose(t > w(0, '^fight') && i === 1 ? 'angry' : i === 1 ? 'up' : 'sit'); c.face(cam); });
          crowd.update(t, cam, { hop: 0.5, dir: [0, 0.18], show: ramp(t, w(0, '^toads') - 0.2, w(0, '^beetle')), t0: 0 });
        });
      } else {
        // crates swing down off the ship; dockers; the official with his paper
        const hang = stencilCrate(['HAWAII', 'LIVE TOADS'], [1.2, 0.8, 0.8], 9); root.add(hang);
        const d1 = makePerson(DOCKER), d2 = makePerson({ ...DOCKER, seed: 62, jacket: '#3f6f5a', jacket2: '#2f5a48', hatColor: '#a3392d' }), off = makePerson(OFFICIAL);
        root.add(d1.group, d2.group, off.group);
        const stamp = card(['APPROVED'], 0.9, 0.34, { sizes: [210], fg: '#a3392d', border: '#a3392d', bg: '#f4ead2' }); stamp.position.set(0, 0.62, 1.52); stamp.rotation.z = 0.18; root.add(stamp);
        const tC = toadCrowd(10, { x: [-1.0, 1.0], z: [1.7, 2.6], size: [0.2, 0.28], seed: 9, shadow: true }); root.add(tC.group);
        U((t, cam) => {
          const k = smooth(ramp(t, 14.6, w(0, '^Hawaii') + 0.6));
          hang.position.set(2.4, 5.5 - k * 5.5, -0.4); cable.position.set(2.4, (5.5 - k * 5.5 + 8.8) / 2 + 0.4, -0.4); cable.scale.y = Math.max(0.01, 8.8 - (5.5 - k * 5.5) - 0.8);
          hang.rotation.y = Math.sin(t * 1.4) * 0.1 * (1 - k);
          d1.group.position.set(3.6, 0, 0.4); d2.group.position.set(1.2, 0, -0.6 + 0);
          d1.update(t, cam.position, 0, { expr: 'grin', gesture: 'reach' }); d2.update(t, cam.position, 0, { expr: 'neutral', gesture: 'carry' });
          off.group.position.set(-1.35, 0, 1.6);
          const L1 = w(1, '^Toads'), Pb = w(1, '^Problem');
          off.update(t, cam.position, 0, {
            talk: talking(t, 'OFFICIAL') ? 1 : 0,
            expr: t < w(0, '^boss') ? 'neutral' : t < Pb ? 'smug' : 'grin',
            gesture: t < L1 - 0.1 ? [[-1e9, 'hold', { prop: 'paper' }]] : t < Pb - 0.1 ? [[-1e9, 'point', { angle: -0.05 }]] : 'hips',
          });
          stamp.scale.setScalar(pop(ramp(t, w(1, '^solved') - 0.05, w(1, '^solved') + 0.25)));
          tC.update(t, cam, { hop: 0.4, dir: [0.05, 0.1], show: 1, t0: 14.6 });
          peek.forEach((c) => c.face(cam));
        });
      }
    }

    // ===================== NIGHT ROAD (swarm) =====================
    if (id === 'swarm') {
      addLights(scene, LIGHT.night);
      root.add(sky('night')); root.add(ground('#3d4a34', 'grass', 400, 70, 4)); root.add(hills('#141a26', -160, 9, 36, 6));
      const road = new THREE.Mesh(new THREE.PlaneGeometry(6, 400), toon('#ffffff', paintTexture({ base: '#4a4a52', kind: 'asphalt', seed: 2, repeat: [2, 80] }))); road.rotation.x = -Math.PI / 2; road.position.set(0, 0.02, -100); road.receiveShadow = true; root.add(road);
      for (let i = 0; i < 40; i++) { const l = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 1.4), toon('#e8dcc4')); l.rotation.x = -Math.PI / 2; l.position.set(0, 0.03, 6 - i * 4); root.add(l); }
      const mass = caneMass({ x: [-30, -3.6], z: [-60, 8], step: 0.7, seed: 6, tint: '#3f5a2a' }); root.add(mass.group);
      const mass2 = caneMass({ x: [3.6, 30], z: [-60, 8], step: 0.7, seed: 7, tint: '#3f5a2a' }); root.add(mass2.group);
      for (const z of [2, -14, -30]) {
        const lp = new THREE.Group(); lp.position.set(3.2, 0, z); root.add(lp);
        lp.add(part(new THREE.CylinderGeometry(0.07, 0.09, 4.2, 8), toon('#2b2b33'), [0, 2.1, 0], { outline: 0.012, edges: false }));
        lp.add(part(new THREE.BoxGeometry(1.2, 0.08, 0.08), toon('#2b2b33'), [-0.6, 4.2, 0], { outline: 0.008, edges: false }));
        const b = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 8), glow('#ffd98a')); b.position.set(-1.1, 4.05, 0); lp.add(b);
        const pl = new THREE.PointLight('#ffcf7a', 34, 14, 1.3); pl.position.set(-1.1, 3.9, 0); lp.add(pl);
      }
      const crowd = toadCrowd(260, { x: [-3, 3], z: [-14, 4.5], size: [0.16, 0.26], tint: '#e6e0ee', seed: 21 }); root.add(crowd.group);
      const crowd2 = toadCrowd(60, { x: [-6, 6], z: [-30, -14], size: [0.2, 0.3], tint: '#c9d4ee', seed: 22 }); root.add(crowd2.group);
      const board = new THREE.Group(); board.position.set(-3.6, 0, -1.5); board.rotation.y = 0.5; root.add(board);
      board.add(part(new THREE.BoxGeometry(0.1, 2.0, 0.1), toon('#5b3a2a'), [-0.9, 1.0, 0], { outline: 0.008, edges: false }), part(new THREE.BoxGeometry(0.1, 2.0, 0.1), toon('#5b3a2a'), [0.9, 1.0, 0], { outline: 0.008, edges: false }));
      const bc = card(['CANE TOADS TODAY', '200,000,000+'], 2.3, 1.1, { sizes: [76, 100], bg: '#ffd23a', fg: INK }); bc.position.set(0, 2.2, 0.06); board.add(bc);
      U((t, cam) => {
        crowd.update(t, cam, { hop: 0.6, dir: [0, 0.22], show: 1, t0: 6.3 }); crowd2.update(t, cam, { hop: 0.5, dir: [0, 0.2], show: 1, t0: 6.3 });
        board.scale.setScalar(pop(ramp(t, w(0, '^million') - 0.15, w(0, '^million') + 0.2)));
      });
    }

    // ===================== CANE FIELD (field, release, farmer, stalk) =====================
    if (id === 'field' || id === 'release' || id === 'farmer' || id === 'stalk') {
      addLights(scene, id === 'release' ? LIGHT.day : LIGHT.dusk);
      root.add(sky(id === 'release' ? 'desert' : 'dusk')); root.add(ground('#7a5a3a', 'asphalt', 400, 80, 9)); root.add(hills(id === 'release' ? '#7d8f6a' : '#5a4a6a', -170, 9, 40, 3));
      root.add(clouds(id === 'release' ? 'rgba(255,255,255,0.7)' : 'rgba(255,190,170,0.5)', 9, 50, 4));
      const fogs = []; for (let i = 0; i < 3; i++) { const f = fogBank(30, 5, id === 'release' ? 'rgba(240,235,210,0.22)' : 'rgba(255,190,170,0.2)'); root.add(f); fogs.push([f, i]); }
      U((t, cam) => fogs.forEach(([f, i]) => { f.position.set(-20 + ((t * 0.6 + i * 14) % 40), 1.6, -16 - i * 9); f.lookAt(cam.position.x, 1.6, cam.position.z); }));

      if (id === 'field') {
        const mass = caneMass({ x: [-20, 20], z: [-30, -1.0], step: 0.5, seed: 8 }); root.add(mass.group);
        // hero stalk tops in a row, beetles munching chewed leaves
        const heroes = []; for (let i = 0; i < 5; i++) { const s = stalk(3.0, 30 + i, { dead: i % 2, away: true }); s.group.position.set(-2 + i * 1.0, 0, 0.2 - (i % 2) * 0.4); root.add(s.group); heroes.push(s); }
        const bites = toon('#9a8a3a', null, { side: THREE.DoubleSide });
        for (let i = 0; i < 9; i++) { const l = new THREE.Mesh(leafGeo(), bites); l.position.set(-2.4 + r() * 4.8, 2.4 + r() * 0.6, 0.2); l.rotation.set(-0.7, r() * 6, 0); root.add(l); }
        const bugs = []; for (let i = 0; i < 5; i++) { const b = critter('beetle', { size: i === 2 ? 0.2 : 0.13 }); b.group.position.set(-2 + i * 1.0 + 0.0, 2.72 + (i % 2) * 0.12, 0.26 - (i % 2) * 0.4); root.add(b.group); bugs.push(b); }
        const chew = []; for (let i = 0; i < 12; i++) { const p = new THREE.Mesh(new THREE.PlaneGeometry(0.03, 0.02), toon('#86b04a', null, { side: THREE.DoubleSide })); root.add(p); chew.push([p, r() * 4, r()]); }
        U((t, cam) => {
          bugs.forEach((b, i) => { b.setPose(i === 2 && t > w(0, '^Still') - 0.05 && t < w(0, '^Queensland') ? 'smug' : 'munch'); b.group.position.y = 2.72 + (i % 2) * 0.12 + Math.abs(Math.sin(t * 9 + i)) * 0.01; b.face(cam); });
          chew.forEach(([p, ph, k]) => { const f = (t * 0.9 + ph) % 1; p.position.set(-0.05 + k * 0.1, 2.85 - f * 2.6, 0.32); p.rotation.set(t * 6 + ph, t * 4, 0); });
          heroes.forEach((s, i) => { s.group.rotation.z = Math.sin(t * 1.3 + i) * 0.02; });
        });
      }

      if (id === 'release') {
        const clear = (x, z) => z > -7 && x > -9 && x < 9;
        const mass = caneMass({ x: [-24, 24], z: [-30, 3], step: 0.55, seed: 10, clear }); root.add(mass.group);
        const fh = farmhouse(); fh.position.set(-7.5, 0, -3.5); fh.rotation.y = 0.35; root.add(fh);
        const open = []; for (let i = 0; i < 4; i++) { const c = stencilCrate(i ? null : ['102 TOADS', 'BRED: 3,000'], [1.2, 0.7, 0.8], 20 + i); c.position.set(-1.6 + i * 1.3, 0, -2.4 - (i % 2) * 0.5); root.add(c); open.push(c); }
        const lids = open.map((c, i) => { const l = part(new THREE.BoxGeometry(1.2, 0.06, 0.8), toon('#ffffff', paintTexture({ base: '#b08a5a', kind: 'planks', seed: 30 + i })), [0, 0, 0], { outline: 0.01 }); root.add(l); return l; });
        const crowd = toadCrowd(180, { x: [-4, 4], z: [-3.2, 0.5], size: [0.16, 0.26], seed: 31, shadow: false }); root.add(crowd.group);
        const near = toadCrowd(14, { x: [-1.2, 1.2], z: [2.6, 4.0], size: [0.24, 0.3], seed: 32, shadow: true }); root.add(near.group);
        // porch: lamp with moths, dog bowl, a mouse
        const porch = new THREE.Group(); porch.position.set(5.5, 0, 1.5); root.add(porch);
        porch.add(part(new THREE.BoxGeometry(3, 0.25, 2), toon('#ffffff', paintTexture({ base: '#8a6142', kind: 'planks', seed: 41 })), [0, 0.12, 0], { outline: 0.015 }));
        porch.add(part(new THREE.CylinderGeometry(0.05, 0.06, 2.4, 8), toon('#2b2b33'), [0.9, 1.2, -0.6], { outline: 0.01, edges: false }));
        const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 8), glow('#ffe7a8')); bulb.position.set(0.9, 2.45, -0.6); porch.add(bulb);
        const pl = new THREE.PointLight('#ffd98a', 12, 6, 1.4); pl.position.set(0.9, 2.3, -0.6); porch.add(pl);
        const moths = []; for (let i = 0; i < 14; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 0.03), toon('#2b2b33', null, { side: THREE.DoubleSide })); porch.add(m); moths.push([m, r() * 7, 0.15 + r() * 0.4]); }
        const bowl = new THREE.Group(); bowl.position.set(-0.4, 0.25, 0.3); porch.add(bowl);
        bowl.add(part(new THREE.CylinderGeometry(0.22, 0.16, 0.12, 18), toon('#c9452f'), [0, 0.06, 0], { outline: 0.01, edges: false }));
        bowl.add(part(new THREE.CylinderGeometry(0.19, 0.19, 0.02, 18), toon('#8a5a3a'), [0, 0.11, 0], { outline: 0, edges: false }));
        const tag = card(['DOG'], 0.3, 0.12, { sizes: [260], bg: '#f4ead2' }); tag.position.set(0, 0.07, 0.205); bowl.add(tag);
        const bowlToad = critter('toad', { size: 0.26, pose: 'eat' }); bowlToad.group.position.set(-0.4, 0.37, 0.3); porch.add(bowlToad.group);
        const lampToads = []; for (let i = 0; i < 4; i++) { const c = critter('toad', { size: 0.24, pose: 'up' }); c.group.position.set(0.5 + (i % 2) * 0.5, 0.25, -0.3 + Math.floor(i / 2) * 0.45); porch.add(c.group); lampToads.push(c); }
        const mouse = new THREE.Group(); porch.add(mouse); mouse.add(part(new THREE.SphereGeometry(0.06, 10, 8), toon('#9a948a'), [0, 0.05, 0], { outline: 0.006, edges: false }));
        U((t, cam) => {
          const fr = w(2, '^free');
          lids.forEach((l, i) => { const k = smooth(ramp(t, fr - 0.6 + i * 0.12, fr - 0.1 + i * 0.12)); const c = open[i]; l.position.set(c.position.x - 0.3 * k, 0.73 + k * 0.4 - (k > 0.99 ? 0.73 : 0), c.position.z + 0.6 * k); l.rotation.x = -k * 1.4; });
          crowd.update(t, cam, { hop: 0.9, dir: [0, 0.55], show: ramp(t, fr - 0.4, w(2, '^ate')), t0: fr - 0.4 });
          near.update(t, cam, { hop: 0.7, dir: [0, 0.15], show: ramp(t, w(2, '^thousands'), fr), t0: 21.75 });
          moths.forEach(([m, ph, rad]) => { m.position.set(0.9 + Math.cos(t * 5 + ph) * rad, 2.4 + Math.sin(t * 7 + ph * 2) * 0.2, -0.6 + Math.sin(t * 5 + ph) * rad); m.rotation.y = t * 9; });
          lampToads.forEach((c, i) => { c.setPose(Math.sin(t * 3 + i * 2) > 0.6 ? 'eat' : 'up'); c.face(cam); });
          const mk = ramp(t, w(2, '^mice') - 0.3, w(2, '^mice') + 0.4); mouse.position.set(1.2 - mk * 0.8, 0.25, 0.6); mouse.visible = t < w(2, '^mice') + 0.5;
          bowlToad.setPose(t > w(2, '^dog') - 0.1 ? 'eat' : 'sit'); bowlToad.face(cam);
        });
      }

      if (id === 'farmer') {
        const mass = caneMass({ x: [-20, 20], z: [-30, -1.4], step: 0.5, seed: 12 }); root.add(mass.group);
        const front = []; for (let i = 0; i < 6; i++) { const s = stalk(3.0, 50 + i); s.group.position.set(-2.4 + i * 0.95, 0, -0.6 - (i % 2) * 0.3); root.add(s.group); front.push(s); }
        const fg = []; for (let i = 0; i < 3; i++) { const s = stalk(3.2, 70 + i); s.group.position.set(-1.6 + i * 1.8, 0, 2.6); root.add(s.group); fg.push(s); }
        const bugs = []; for (let i = 0; i < 6; i++) { const b = critter('beetle', { size: 0.15, pose: 'down' }); b.group.position.set(-2.4 + i * 0.95, 2.85, -0.55 - (i % 2) * 0.3); root.add(b.group); bugs.push(b); }
        const crowd = toadCrowd(40, { x: [-3, 3], z: [-0.6, 1.8], size: [0.18, 0.26], seed: 51, shadow: true }); root.add(crowd.group);
        const farmer = makePerson(FARMER, { tint: '#ffe2cf' }); root.add(farmer.group);
        const hoe = part(new THREE.CylinderGeometry(0.02, 0.02, 1.5, 6), toon('#8a6142'), [0, 0, 0], { outline: 0.006, edges: false }); root.add(hoe);
        U((t, cam) => {
          farmer.group.position.set(0.3, 0, 0.6);
          const up = w(2, '^looked'), L3 = w(3, '^The$');
          farmer.update(t, cam.position, 0, {
            talk: talking(t, 'FARMER') ? 1 : 0,
            expr: t < up - 0.1 ? 'neutral' : t < L3 - 0.05 ? 'alarmed' : t < w(3, '^galahs') - 0.05 ? 'angry' : 'shout',
            gesture: t < up - 0.1 ? 'idle' : t < L3 - 0.05 ? 'shrug' : [[-1e9, 'point', { angle: -1.25 }]],
          });
          hoe.position.set(-0.25, 0.75, 0.62); hoe.rotation.z = 0.25; hoe.visible = t < L3 - 0.05;
          bugs.forEach((b) => b.face(cam)); crowd.update(t, cam, { hop: 0.25, dir: [0, 0.05], t0: 34.1 });
          front.concat(fg).forEach((s, i) => { s.group.rotation.z = Math.sin(t * 1.3 + i) * 0.02; });
        });
      }

      if (id === 'stalk') {
        const clear = (x, z) => Math.abs(x) < 1.1 && z > -0.9 && z < 2.6;
        const mass = caneMass({ x: [-30, 30], z: [-40, 8], step: 0.62, seed: 14, clear }); root.add(mass.group);
        const hero = stalk(3.0, 99, { away: true }); root.add(hero.group);
        const side = []; for (const [x, z] of [[-0.9, -0.5], [0.9, -0.4], [-1.4, 0.6], [1.3, 0.7]]) { const s = stalk(2.9, Math.round(x * 10 + 120), { away: true }); s.group.position.set(x, 0, z); root.add(s.group); side.push(s); }
        const toad = critter('toad', { size: 0.34, pose: 'up' }); root.add(toad.group);
        const beetle = critter('beetle', { size: 0.2, pose: 'munch' }); beetle.group.position.set(0, 2.82, 0.07); root.add(beetle.group);
        const leaf = new THREE.Mesh(leafGeo(), toon('#9a8a3a', null, { side: THREE.DoubleSide })); leaf.position.set(0.02, 2.8, 0.05); leaf.rotation.set(-0.9, 0.3, 0); root.add(leaf);
        // the reveal: a toad at the foot of every stalk nearby, all staring up
        const many = [];
        const base = mass.pos.filter(([x, z]) => Math.abs(x) < 16 && z > -26 && z < 6);
        for (let i = 0; i < Math.min(320, base.length); i += 1) { const [x, z] = base[(i * 7) % base.length]; const c = critter('toad', { size: 0.26, pose: 'up', shadow: false }); c.group.position.set(x, 0, z + 0.12); root.add(c.group); many.push(c); }
        U((t, cam) => {
          const cl = w(4, "^can.t"), climb = w(4, '^climb');
          // three failed jumps at the stalk
          let y = 0, pose = 'up';
          for (let k = 0; k < 3; k++) { const a = cl + k * 0.42, f = (t - a) / 0.34; if (f > 0 && f < 1) { y = Math.sin(f * Math.PI) * (0.32 + k * 0.05); pose = 'hop'; } }
          if (t > climb + 0.9 && t < 44.1) pose = 'angry';
          toad.group.position.set(0, y, 0.24); toad.setPose(pose); toad.face(cam);
          beetle.setPose(t > w(4, '^Not') - 0.1 ? 'smug' : t > cl ? 'down' : 'munch'); beetle.face(cam);
          many.forEach((c) => c.face(cam));
          [hero, ...side].forEach((s, i) => { s.group.rotation.z = Math.sin(t * 1.3 + i) * 0.015; });
        });
      }
    }

    // ===================== POND (eggs) =====================
    if (id === 'pond') {
      addLights(scene, LIGHT.dusk);
      root.add(sky('dusk')); root.add(ground('#5f6a3a', 'grass', 300, 60, 7));
      const pond = new THREE.Mesh(new THREE.CircleGeometry(3.2, 40), toon('#3d5a6e')); pond.rotation.x = -Math.PI / 2; pond.position.set(0, 0.015, -0.4); root.add(pond);
      const rim = new THREE.Mesh(new THREE.RingGeometry(3.1, 3.5, 40), toon('#6b5a3a')); rim.rotation.x = -Math.PI / 2; rim.position.set(0, 0.02, -0.4); root.add(rim);
      const eggs = eggStrings(10, 5); eggs.position.set(0, 0, -0.2); root.add(eggs);
      for (let i = 0; i < 14; i++) { const reed = part(new THREE.CylinderGeometry(0.015, 0.02, 1 + r() * 0.8, 5), toon('#5f7a3a'), [0, 0, 0], { outline: 0.004, edges: false }); const a = r() * 6.28; reed.position.set(Math.cos(a) * 3.3, 0.6, -0.4 + Math.sin(a) * 3.3); reed.rotation.z = (r() - 0.5) * 0.3; root.add(reed); }
      for (let i = 0; i < 6; i++) { const lp = new THREE.Mesh(new THREE.CircleGeometry(0.22, 16), toon('#6f9a3a')); lp.rotation.x = -Math.PI / 2; lp.position.set(-2 + r() * 4, 0.025, -2.5 + r() * 1.5); root.add(lp); }
      const mass = caneMass({ x: [-20, 20], z: [-30, -5], step: 0.6, seed: 15 }); root.add(mass.group);
      const mom = critter('toad', { size: 0.36, pose: 'sit' }); mom.group.position.set(-1.0, 0.03, 1.15); root.add(mom.group);
      const post = part(new THREE.CylinderGeometry(0.04, 0.04, 1.0, 8), toon('#5b3a2a'), [0.45, 0.5, 0.7], { outline: 0.008, edges: false }); root.add(post);
      const sign = card(['EGGS', '30,000'], 0.8, 0.5, { sizes: [180, 220], bg: '#f4ead2' }); sign.position.set(0.45, 1.15, 0.73); root.add(sign);
      const ripples = []; for (let i = 0; i < 3; i++) { const rr = new THREE.Mesh(new THREE.RingGeometry(0.1, 0.13, 30), new THREE.MeshBasicMaterial({ color: '#cfe0ef', transparent: true, opacity: 0.5, depthWrite: false })); rr.rotation.x = -Math.PI / 2; rr.position.set(0.4 - i * 0.6, 0.03, -0.6 + i * 0.4); root.add(rr); ripples.push([rr, i]); }
      U((t, cam) => {
        sign.scale.setScalar(pop(ramp(t, w(2, '^30') - 0.1, w(2, '^30') + 0.2)));
        mom.setPose(t > w(2, '^eggs') ? 'up' : 'sit'); mom.face(cam);
        ripples.forEach(([rr, i]) => { const f = (t * 0.6 + i / 3) % 1; rr.scale.setScalar(1 + f * 6); rr.material.opacity = 0.5 * (1 - f); });
        eggs.position.y = Math.sin(t * 1.2) * 0.005;
      });
    }

    // ===================== MAP (spread) =====================
    if (id === 'map') {
      addLights(scene, LIGHT.office);
      const wall = new THREE.Mesh(new THREE.PlaneGeometry(10, 5), toon('#ffffff', paintTexture({ base: '#6b5a48', kind: 'planks', seed: 3, repeat: [5, 2] }))); wall.position.set(0, 2.5, -0.05); root.add(wall);
      root.add(ground('#4a3a2a', 'planks', 40, 10, 2));
      const AU = australiaTex();
      const board = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.08), new THREE.MeshBasicMaterial({ map: AU.tex, fog: true })); board.position.set(0, 1.9, 0.02); root.add(board);
      root.add(part(new THREE.BoxGeometry(2.76, 2.24, 0.04), toon('#5b3a2a'), [0, 1.9, -0.01], { outline: 0.01 }));
      const lbl = card(['CANE TOAD SIGHTINGS'], 2.0, 0.28, { sizes: [64], bg: '#f4ead2' }); lbl.position.set(0, 3.15, 0.03); root.add(lbl);
      const desk = part(new THREE.BoxGeometry(3, 0.1, 1.2), toon('#ffffff', paintTexture({ base: '#7a5236', kind: 'planks', seed: 5 })), [0, 0.85, 1.0], { outline: 0.015 }); root.add(desk);
      const lamp = new THREE.Group(); lamp.position.set(-1.0, 0.9, 1.1); root.add(lamp);
      lamp.add(part(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 6), toon('#2b2b33'), [0, 0.25, 0], { outline: 0.004, edges: false }));
      lamp.add(part(new THREE.ConeGeometry(0.16, 0.18, 14, 1, true), toon('#2f6f4a', null, { side: THREE.DoubleSide }), [0, 0.52, 0], { outline: 0.006, edges: false }));
      const lb = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), glow('#ffe0a0')); lb.position.set(0, 0.46, 0); lamp.add(lb);
      const pl = new THREE.PointLight('#ffcf8a', 14, 6, 1.3); pl.position.set(-0.6, 1.6, 1.4); root.add(pl);
      const pl2 = new THREE.PointLight('#ffcf8a', 8, 4, 1.4); pl2.position.set(-1.0, 1.36, 1.1); root.add(pl2);
      for (let i = 0; i < 5; i++) { const p = card(['REPORT'], 0.3, 0.2, { sizes: [200], bg: '#f4ead2' }); p.rotation.x = -Math.PI / 2; p.rotation.z = r() - 0.5; p.position.set(0.2 + r() * 1.0, 0.905 + i * 0.002, 0.8 + r() * 0.4); root.add(p); }
      const jar = critter('toad', { size: 0.22, pose: 'angry' }); jar.group.position.set(0.95, 0.9, 1.25); root.add(jar.group);
      const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.32, 18, 1, true), new THREE.MeshBasicMaterial({ color: '#cfe8f0', transparent: true, opacity: 0.22, depthWrite: false })); glass.position.set(0.95, 1.06, 1.25); root.add(glass);
      U((t, cam) => { AU.draw(smooth(ramp(t, 32.15, 34.1))); jar.face(cam); });
    }

    return { root, update(t, camera) { ups.forEach((f) => f(t, camera)); } };
  };
}

// ---------- cameras ----------
export const camCrate = F(cameraPath([{ t: 0, pos: [1.2, 1.1, 4.4], look: [0, 0.95, 1.0] }, { t: 1.9, pos: [0.9, 1.15, 3.9], look: [0, 0.95, 1.0] }, { t: 3.6, pos: [0.3, 1.25, 2.9], look: [0, 1.0, 1.0] }, { t: 6.3, pos: [-0.2, 1.05, 2.5], look: [0.1, 1.05, 1.0] }]), [0.1, 1.1, 1.0]);
export const camSwarm = F(cameraPath([{ t: 6.3, pos: [0.4, 0.45, 5.5], look: [0, 0.2, 1.5] }, { t: 8.0, pos: [0.0, 0.9, 3.6], look: [-0.6, 0.6, -1.0] }, { t: 9.85, pos: [-1.0, 1.6, 2.2], look: [-3.0, 1.8, -1.5] }]), (t) => V(t < 8.2 ? [0, 0.2, 1.5] : [-3.4, 2.0, -1.4]));
const fieldP = cameraPath([{ t: 9.85, pos: [0.15, 2.95, 0.95], look: [0, 2.85, 0.26] }, { t: 11.6, pos: [0.05, 2.9, 0.75], look: [0, 2.84, 0.26] }, { t: 13.0, pos: [1.2, 3.3, 2.6], look: [0, 2.7, 0] }, { t: 14.6, pos: [2.2, 3.6, 3.8], look: [0, 2.5, -0.4] }]);
export const camField = (t) => { const c = fieldP(t); c.focus = V(t < 12 ? [0, 2.84, 0.26] : [0, 2.7, 0]); return c; };
const dockA = cameraPath([{ t: 14.6, pos: [4.5, 3.2, 8.5], look: [1.6, 2.6, -0.4] }, { t: 16.6, pos: [3.6, 2.2, 6.6], look: [2.2, 1.4, -0.2] }, { t: 18.9, pos: [1.2, 1.7, 5.4], look: [0, 1.0, 1.0] }]);
const dockB = cameraPath([{ t: 18.9, pos: [-0.6, 1.55, 3.9], look: [-1.3, 1.4, 1.6] }, { t: 20.6, pos: [-0.9, 1.5, 3.4], look: [-1.3, 1.4, 1.6] }, { t: 21.75, pos: [-0.3, 1.3, 3.4], look: [-0.6, 1.0, 1.6] }]);
export const camDock = (t) => { const c = t < 18.9 ? dockA(t) : dockB(t); c.focus = V(t < 17 ? [2.4, 1.6, -0.4] : t < 18.9 ? [0, 1.0, 1.0] : t < 21.1 ? [-1.3, 1.45, 1.6] : [0, 0.65, 1.52]); return shake(c, t, 21.05, 0.3, 0.03); };
const relA = cameraPath([{ t: 21.75, pos: [0.8, 1.6, 7.5], look: [0, 0.6, -1.5] }, { t: 23.8, pos: [0.2, 0.7, 5.6], look: [0, 0.35, 1.5] }, { t: 26.5, pos: [-1.4, 0.55, 5.2], look: [0.0, 0.25, 2.5] }]);
const relB = cameraPath([{ t: 26.5, pos: [7.4, 1.6, 4.6], look: [6.3, 1.4, 1.0] }, { t: 27.6, pos: [6.6, 1.1, 3.9], look: [5.6, 0.7, 1.4] }, { t: 29.0, pos: [5.5, 0.85, 3.0], look: [5.1, 0.5, 1.8] }]);
export const camRelease = (t) => { const c = t < 26.5 ? relA(t) : relB(t); c.focus = V(t < 23.8 ? [0, 0.4, 1.0] : t < 26.5 ? [0, 0.25, 3] : t < 27.9 ? [6.2, 1.2, 0.9] : [5.1, 0.55, 1.8]); return c; };
export const camPond = F(cameraPath([{ t: 29.0, pos: [0.6, 2.2, 3.2], look: [0, 0, -0.2] }, { t: 30.5, pos: [0.2, 1.4, 2.8], look: [0.2, 0.6, 0.4] }, { t: 32.15, pos: [0.0, 1.25, 2.7], look: [0.35, 0.95, 0.7] }]), (t) => V(t < 30 ? [0, 0.05, -0.2] : [0.45, 1.1, 0.73]));
export const camMap = (t) => { const c = cameraPath([{ t: 32.15, pos: [0.6, 1.8, 3.2], look: [0.2, 1.9, 0] }, { t: 34.1, pos: [0.35, 1.95, 2.3], look: [0.4, 2.0, 0] }])(t); c.focus = V([0.3, 1.95, 0]); c.cap = 'bottom'; return c; };
const farmA = cameraPath([{ t: 34.1, pos: [0.4, 0.35, 3.4], look: [0.3, 1.0, 0.6] }, { t: 35.6, pos: [0.6, 0.5, 2.8], look: [0.3, 1.6, 0.6] }, { t: 36.2, pos: [1.0, 1.5, 2.5], look: [0.3, 1.5, 0.6] }, { t: 37.6, pos: [0.8, 1.45, 2.1], look: [0.2, 1.6, 0.6] }, { t: 38.7, pos: [0.4, 1.8, 2.3], look: [-0.2, 2.6, -0.5] }]);
export const camFarmer = (t) => { const c = farmA(t); c.focus = V(t < 38.0 ? [0.3, 1.45, 0.6] : [-0.5, 2.8, -0.6]); return shake(c, t, w(3, '^galahs'), 0.35, 0.05); };
const stalkA = cameraPath([
  { t: 38.7, pos: [0.25, 0.22, 1.05], look: [0, 0.2, 0.24] },
  { t: 39.6, pos: [0.4, 0.5, 1.2], look: [0, 1.2, 0.1] },
  { t: 41.0, pos: [0.4, 2.7, 0.75], look: [0, 2.85, 0.07] },
  { t: 41.9, pos: [0.35, 2.8, 0.6], look: [0, 2.86, 0.07] },
  { t: 42.5, pos: [0.4, 0.45, 1.25], look: [0, 0.28, 0.24] },
  { t: 44.1, pos: [0.2, 0.32, 1.0], look: [0, 0.25, 0.24] },
]);
const stalkB = cameraPath([
  { t: 44.1, pos: [2.5, 4.2, 9.5], look: [0, 0.5, 0] },
  { t: 46.0, pos: [3.5, 7.5, 13], look: [0, 0, -3] },
  { t: 48.0, pos: [1.2, 4.2, 5.0], look: [0, 1.6, 0] },
  { t: 51.22, pos: [0.12, 2.92, 0.52], look: [0, 2.88, 0.07] },
]);
export const camStalk = (t) => {
  const c = t < 44.1 ? stalkA(t) : stalkB(t);
  c.focus = V(t < 39.6 ? [0, 0.2, 0.24] : t < 42.2 ? [0, 2.85, 0.07] : t < 44.1 ? [0, 0.25, 0.24] : t < 48.2 ? [0, 0.3, 0] : [0, 2.86, 0.07]);
  if (t > 44.1 && t < 48.2) c.cap = 'top';
  return c;
};
