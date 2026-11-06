// Shots 2-4 (5.44 - 17.37 s): cut-away of Kiruna on top of its iron ore mine.
import * as THREE from 'three';
import { INK, toon, part, ink, paintTexture, rng } from '../lib/toon.js';
import { house, church, banner, headframe, lampPost, sky, mineMountain, standBoard } from '../lib/kit.js';
import { makePerson, PALETTES } from '../lib/char.js';
import { addLights } from '../Stage.jsx';
import { cameraPath } from '../lib/camera.js';
import { B } from '../times.js';

const ramp = (t, a, b) => THREE.MathUtils.clamp((t - a) / (b - a), 0, 1);
const ease = (x) => x * x * (3 - 2 * x);

function earthTexture(seed) {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 1024; const g = c.getContext('2d'); const r = rng(seed);
  const bands = ['#8a5a3c', '#7a4f36', '#6b4632', '#5e3f30', '#54392e', '#4b342c'];
  for (let i = 0; i < 24; i++) { g.fillStyle = bands[Math.min(5, Math.floor(i / 4))]; const y = (i / 24) * 1024; g.beginPath(); g.moveTo(0, y); for (let x = 0; x <= 1024; x += 64) g.lineTo(x, y + Math.sin(x * 0.01 + i) * 8 + r() * 6); g.lineTo(1024, y + 60); g.lineTo(0, y + 60); g.closePath(); g.fill(); }
  for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(${200 + r() * 40},${180 + r() * 30},${150 + r() * 30},0.35)`; const x = r() * 1024, y = r() * 1024, s = 3 + r() * 10; g.beginPath(); g.ellipse(x, y, s, s * 0.7, r() * 3, 0, Math.PI * 2); g.fill(); g.strokeStyle = 'rgba(53,31,34,0.4)'; g.lineWidth = 1.5; g.stroke(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1 / 30, 1 / 30); t.anisotropy = 8; return t;
}

const X0 = -24, X1 = 24, Y0 = -26, ZF = 12, ZB = -16; // block extents; front face at z = ZF
const SHAFT = { x: -10, w: 2.4, y0: -22, y1: -0.6 };
const T1 = { y: -6.5, h: 2.6, x0: -8.8, x1: 18, open: -2 };   // first level: partly dug at the start
const T2 = { y: -16, h: 2.6, x0: -8.8, x1: 18 };               // deeper level appears on "deeper"

export function buildMine(scene) {
  addLights(scene, { center: [0, -6, 4], key: [-34, 44, 40], size: 34, fog: ['#e6dfcb', 70, 420] });
  const root = new THREE.Group();
  root.add(sky());
  const mtn = mineMountain(); mtn.position.set(40, -2, -380); mtn.scale.setScalar(0.75); root.add(mtn);
  const far = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), toon('#ffffff', paintTexture({ base: '#86a05a', kind: 'grass', seed: 3, repeat: [120, 120] }))); far.rotation.x = -Math.PI / 2; far.position.y = Y0 - 0.5; root.add(far);

  // earth block: front shape with tunnel holes, extruded back -> tunnels get real side walls
  const s = new THREE.Shape(); s.moveTo(X0, Y0); s.lineTo(X1, Y0); s.lineTo(X1, 0); s.lineTo(X0, 0); s.closePath();
  const hole = (x0, y0, x1, y1) => { const p = new THREE.Path(); p.moveTo(x0, y0); p.lineTo(x0, y1); p.lineTo(x1, y1); p.lineTo(x1, y0); p.closePath(); s.holes.push(p); };
  hole(SHAFT.x - SHAFT.w / 2, SHAFT.y0, SHAFT.x + SHAFT.w / 2, SHAFT.y1);
  hole(SHAFT.x + SHAFT.w / 2, T1.y, T1.x1, T1.y + T1.h);
  hole(SHAFT.x + SHAFT.w / 2, T2.y, T2.x1, T2.y + T2.h);
  const geo = new THREE.ExtrudeGeometry(s, { depth: ZF - ZB, bevelEnabled: false });
  const earth = part(geo, toon('#ffffff', earthTexture(5)), [0, 0, ZB], { outline: 0.06 });
  root.add(earth);
  // tunnel back wall so you never see through
  const back = new THREE.Mesh(new THREE.PlaneGeometry(X1 - X0, -Y0), new THREE.MeshBasicMaterial({ color: '#2e2220' })); back.position.set(0, Y0 / 2, ZB - 0.05); back.rotation.y = Math.PI; root.add(back);
  const back2 = back.clone(); back2.rotation.y = 0; back2.position.z = ZB + 0.6; root.add(back2);

  // dark lining inside the shaft and tunnels (seen from outside through the cut face)
  const liner = new THREE.MeshBasicMaterial({ color: '#3a2a24', side: THREE.BackSide, fog: true });
  const line = (x0, y0, x1, y1) => { const m = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0 - 0.02, y1 - y0 - 0.02, ZF - ZB - 0.3), liner); m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (ZF + ZB) / 2 - 0.15); root.add(m); };
  line(SHAFT.x - SHAFT.w / 2, SHAFT.y0, SHAFT.x + SHAFT.w / 2, SHAFT.y1);
  line(SHAFT.x + SHAFT.w / 2 - 0.01, T1.y, T1.x1, T1.y + T1.h);
  line(SHAFT.x + SHAFT.w / 2 - 0.01, T2.y, T2.x1, T2.y + T2.h);

  // grass cap and the street
  root.add(part(new THREE.BoxGeometry(X1 - X0 + 0.2, 0.4, ZF - ZB + 0.2), toon('#ffffff', paintTexture({ base: '#86a05a', kind: 'grass', seed: 6, repeat: [6, 3] })), [0, 0.2, (ZF + ZB) / 2], { outline: 0.05 }));
  root.add(part(new THREE.BoxGeometry(X1 - X0 + 0.2, 0.06, 4.2), toon('#5f5d60'), [0, 0.43, 5.2], { outline: 0.02, edges: false }));

  // ore veins on the face (dark blue-grey) and timber frames at the tunnel mouths
  const r = rng(9); const ore = toon('#3e4a5e');
  for (let i = 0; i < 22; i++) {
    const cx = X0 + 2 + r() * (X1 - X0 - 4), cy = -3 - r() * 20; if (Math.abs(cy - (T1.y + 1.3)) < 2.4 || Math.abs(cy - (T2.y + 1.3)) < 2.4 || Math.abs(cx - SHAFT.x) < 2.2) continue;
    const sh = new THREE.Shape(); const n = 7, rad = 0.6 + r() * 1.4; for (let k = 0; k < n; k++) { const a = (k / n) * Math.PI * 2, rr = rad * (0.6 + r() * 0.6); k ? sh.lineTo(Math.cos(a) * rr * 1.6, Math.sin(a) * rr) : sh.moveTo(Math.cos(a) * rr * 1.6, Math.sin(a) * rr); }
    root.add(part(new THREE.ExtrudeGeometry(sh, { depth: 0.08, bevelEnabled: false }), ore, [cx, cy, ZF], { outline: 0.03 }));
  }
  const timber = toon('#9a6b45');
  const frames = (tun) => { const out = new THREE.Group(); for (let x = SHAFT.x + 3; x < tun.x1 - 0.5; x += 3.2) { out.add(part(new THREE.BoxGeometry(0.25, tun.h, 0.25), timber, [x, tun.y + tun.h / 2, ZF - 0.4], { outline: 0.02 })); out.add(part(new THREE.BoxGeometry(0.25, 0.25, 0.9), timber, [x, tun.y + tun.h - 0.12, ZF - 0.6], { outline: 0.015 })); } return out; };
  root.add(frames(T1)); root.add(frames(T2));
  // rails, a cart with ore and an IRON ORE crate in the first tunnel; lanterns
  const rails = (tun) => { const g = new THREE.Group(); for (const dz of [-0.45, 0.45]) g.add(part(new THREE.BoxGeometry(tun.x1 - SHAFT.x, 0.08, 0.08), toon('#5b5f64'), [(tun.x1 + SHAFT.x) / 2, tun.y + 0.05, ZF - 2 + dz], { outline: 0.01, edges: false })); return g; };
  root.add(rails(T1)); root.add(rails(T2));
  const cart = new THREE.Group(); cart.add(part(new THREE.BoxGeometry(1.6, 0.8, 1.1), toon('#6b5a52'), [0, 0.6, 0], { outline: 0.02 }));
  for (let i = 0; i < 6; i++) cart.add(part(new THREE.DodecahedronGeometry(0.28), ore, [-0.5 + (i % 3) * 0.5, 1.05 + Math.floor(i / 3) * 0.12, (i % 2) * 0.3 - 0.15], { outline: 0.012, edges: false }));
  for (const x of [-0.5, 0.5]) for (const z of [-0.45, 0.45]) cart.add(part(new THREE.CylinderGeometry(0.18, 0.18, 0.1, 12).rotateX(Math.PI / 2), toon('#2b2527'), [x, 0.2, z], { outline: 0.01, edges: false }));
  cart.position.set(-5.5, T1.y, ZF - 2); root.add(cart);
  const crate = standBoard(['IRON ORE'], { w: 1.5, h: 0.6, legs: 0.0, sizes: [150] }); crate.group.position.set(-3.2, T1.y + 0.05, ZF - 1.4); root.add(crate.group);
  for (const [x, y] of [[-6.5, T1.y + 2.1], [2, T1.y + 2.1], [10, T1.y + 2.1], [-6.5, T2.y + 2.1], [4, T2.y + 2.1], [12, T2.y + 2.1]]) root.add(part(new THREE.BoxGeometry(0.22, 0.3, 0.22), new THREE.MeshBasicMaterial({ color: '#ffd27a' }), [x, y, ZF - 0.7], { outline: 0.01, cast: false }));

  // plugs of earth that hide the not-yet-dug tunnel parts (they shrink as the tunnels are dug)
  const plugMat = toon('#ffffff', earthTexture(5));
  const plug1 = part(new THREE.BoxGeometry(1, T1.h, 3), plugMat, [0, 0, 0], { outline: 0.03, edges: false }); root.add(plug1);
  const plug2 = part(new THREE.BoxGeometry(1, T2.h, 3), plugMat, [0, 0, 0], { outline: 0.03, edges: false }); root.add(plug2);
  const setPlug = (plug, tun, from) => { const x0 = from, w = tun.x1 + 0.2 - x0; plug.visible = w > 0.05; plug.scale.x = Math.max(0.01, w); plug.position.set(x0 + w / 2, tun.y + tun.h / 2, ZF - 1.4); };

  // the town on top
  const hf = headframe(['MINE', '1900']); hf.group.position.set(SHAFT.x, 0.4, 3.0); root.add(hf.group);
  const houses = [];
  [[-2, -3, '#e2b955', 8], [7, -2.5, '#6f8f5a', 7], [15.5, -3, '#ece4d2', 8], [3, -11, '#7d93a3', 7], [12, -11, '#d98b3a', 8]].forEach(([x, z, c, w], i) => { const h = house({ w, h: 5.6, d: 6.5, color: c, seed: 200 + i }); h.position.set(x, 0.4, z); root.add(h); houses.push(h); });
  const ch = church(); ch.scale.setScalar(0.62); ch.position.set(-15, 0.4, -7); root.add(ch);
  const lamps = [[2.5, 8.2], [12, 8.2]].map(([x, z]) => { const l = lampPost(); l.position.set(x, 0.4, z); l.rotation.y = Math.PI; root.add(l); return l; });
  const bn = banner(['KIRUNA'], { w: 6.5, h: 1.6, poleH: 4.6, sizes: [190] }); bn.position.set(5.5, 0.4, 10.2); root.add(bn);
  const people = [[-1, 9.2, 0], [9.5, 9.6, 3], [0.8, 9.9, 4]].map(([x, z, p], i) => { const m = makePerson({ ...PALETTES[p], seed: 300 + i, phase: i * 1.7 }); m.group.position.set(x, 0.4, z); root.add(m.group); return m; });

  // cracks: jagged ink lines that grow across the street and down the face on "cracked"
  const crackMat = new THREE.MeshBasicMaterial({ color: INK });
  const cracks = [];
  const crack = (pts, y, face = false) => { const g = new THREE.Group(); const segs = []; for (let i = 0; i < pts.length - 1; i++) { const [ax, az] = pts[i], [bx, bz] = pts[i + 1]; const len = Math.hypot(bx - ax, bz - az); const m = new THREE.Mesh(new THREE.BoxGeometry(len, face ? len : 0.12, face ? 0.12 : 0.12), crackMat); if (face) { m.geometry = new THREE.BoxGeometry(0.16, len, 0.1); m.position.set((ax + bx) / 2, (az + bz) / 2, ZF + 0.06); m.rotation.z = Math.atan2(bz - az, bx - ax) - Math.PI / 2; } else { m.position.set((ax + bx) / 2, y, (az + bz) / 2); m.rotation.y = -Math.atan2(bz - az, bx - ax); } g.add(m); segs.push(m); } root.add(g); cracks.push(segs); };
  crack([[3, 9.5], [4.2, 7.6], [3.8, 6.1], [5.6, 4.4], [5.1, 2.6], [6.8, 0.6], [6.4, -1.5]], 0.47);
  crack([[10.5, 9.8], [9.6, 8.1], [10.8, 6.0], [10.1, 4.0], [11.6, 2.5]], 0.47);
  crack([[4.0, 0.3], [3.4, -1.6], [4.6, -3.0], [3.9, -4.8]], 0, true);
  crack([[10.6, 0.3], [11.4, -1.4], [10.7, -3.2]], 0, true);
  cracks.forEach((segs) => segs.forEach((m) => (m.visible = false)));

  const tiltHouse = houses[2], lamp = lamps[1];
  return {
    root,
    update(t, camera) {
      // first tunnel digs under the streets, second one goes deeper
      setPlug(plug1, T1, THREE.MathUtils.lerp(T1.open, T1.x1 + 0.3, ease(ramp(t, B.digging - 0.1, B.streets + 0.2))));
      setPlug(plug2, T2, THREE.MathUtils.lerp(SHAFT.x + SHAFT.w / 2, T2.x1 + 0.3, ease(ramp(t, B.deeper - 0.15, B.deeper + 1.0))));
      cart.position.x = -5.5 + 7 * ease(ramp(t, B.digging, B.streets + 0.6));
      hf.wheel.rotation.z = -t * 1.2;
      // cracks spread on "cracked", a house and a lamp post lean
      const k = ramp(t, B.cracked - 0.35, B.cracked + 0.25);
      cracks.forEach((segs) => segs.forEach((m, i) => { m.visible = k > i / segs.length; }));
      tiltHouse.rotation.z = -0.05 * ease(ramp(t, B.cracked - 0.1, B.cracked + 0.4));
      lamp.rotation.z = 0.12 * ease(ramp(t, B.cracked - 0.05, B.cracked + 0.35));
      people.forEach((p) => p.update(t, camera.position, 0));
    },
  };
}

// camera: town and banner -> down the cut face to the mine -> headframe "1900" -> tunnel digging under the streets
// -> deeper level -> back up to the cracking street. Mostly crane moves with sideways drift.
export const mineCam = cameraPath([
  { t: 5.44, pos: [3, 13, 31], look: [3, 3.5, 4] },
  { t: B.arctic, pos: [2.5, 9, 30.5], look: [2.5, 1, 5] },
  { t: B.giantMine, pos: [0.5, -2.5, 30], look: [0, -5.5, 10] },
  { t: B.y1900, pos: [-5.2, 3.2, 24.5], look: [-8.5, 2.6, 6] },
  { t: B.digging, pos: [-2.5, -3, 25.5], look: [-1, -5.6, 11] },
  { t: B.streets, pos: [4.5, -2, 25.5], look: [6, -4.2, 10] },
  { t: B.deeper, pos: [5, -9.5, 27], look: [4.5, -13.5, 10] },
  { t: B.ground, pos: [6.5, -0.5, 26], look: [7, -1.2, 6] },
  { t: B.cracked + 0.35, pos: [7.5, 2.4, 23], look: [8, 0.2, 4] },
]);
