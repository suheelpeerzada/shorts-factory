// Shots 8-10 (36.07 - 50.70 s): on the road. Creeping at 0.5 km/h, the driver's line,
// two days in August (time-lapse past the banner), arrival in the new town centre.
import * as THREE from 'three';
import { toon, part } from '../lib/toon.js';
import { church, transporter, house, lampPost, ground, sky, mineMountain, standBoard, banner, modernBlock, signPost, cone } from '../lib/kit.js';
import { makePerson, PALETTES } from '../lib/char.js';
import { addLights } from '../Stage.jsx';
import { cameraPath } from '../lib/camera.js';
import { B, talking } from '../times.js';

const ramp = (t, a, b) => THREE.MathUtils.clamp((t - a) / (b - a), 0, 1);
const pop = (k) => (k <= 0 ? 0.0001 : 1 + 2.2 * Math.pow(k - 1, 3) + 1.2 * Math.pow(k - 1, 2));

// transporter speed (m/s): slow creep, then a time-lapse for "two days", then it slows to a stop on "came"
const T0 = 36.07, X0 = -4;
const V = (t) => {
  if (t < 43.0) return 0.3;
  if (t < 43.6) return 0.3 + 7.7 * (t - 43.0) / 0.6;
  if (t < 47.3) return 8.0;
  if (t < B.came + 0.15) return 8.0 * (1 - (t - 47.3) / (B.came + 0.15 - 47.3));
  return 0;
};
const XS = []; { let x = X0; for (let i = 0; i <= 15 * 240; i++) { XS.push(x); x += V(T0 + i / 240) / 240; } }
export const rigX = (t) => XS[Math.min(XS.length - 1, Math.max(0, Math.round((t - T0) * 240)))];
const END_X = rigX(50.7);

export const DRIVER = { skin: '#efd2b6', hair: '#4a3426', jacket: '#e8702f', jacket2: '#c4571f', pants: '#3f4a5a', shoes: '#351f22', tie: '#3f6f8f', hat: 'cap', hatColor: '#e1ad35', seed: 701, height: 1.78 };
const DRV_PAUSES = [[39.55, 39.93], [40.99, 41.71]];
const DRV_DX = 8.3, DRV_Z = 10.3;

const WALK = [
  { dx: -9.5, z: 9.4, p: 0 }, { dx: -6.8, z: 10.6, p: 1 }, { dx: -3.5, z: 9.8, p: 4 }, { dx: 3.0, z: 10.9, p: 2 },
  { dx: 5.2, z: 9.6, p: 3 }, { dx: -12, z: 11.2, p: 5 }, { dx: 0.5, z: -9.6, p: 2 }, { dx: -5, z: -10.2, p: 5 }, { dx: 6, z: -9.8, p: 1 },
];

export function buildRoad(scene) {
  addLights(scene, { center: [12, 0, 4], key: [-38, 46, 34], size: 46 });
  const root = new THREE.Group();
  root.add(sky()); root.add(ground());
  const mtn = mineMountain(); mtn.position.set(60, 0, -300); root.add(mtn);
  // old wooden houses along the first part of the road, modern blocks in the new centre
  const cols = ['#e2b955', '#a3392d', '#6f8f5a', '#ece4d2', '#7d93a3', '#d98b3a'];
  for (let i = 0; i < 9; i++) { const h = house({ w: 8, h: 6, d: 7, color: cols[i % 6], seed: 800 + i }); h.position.set(-40 + i * 10.5, 0, -24); root.add(h); }
  for (let i = 0; i < 4; i++) { const h = house({ w: 7, h: 5.5, d: 6, color: cols[(i + 2) % 6], seed: 820 + i }); h.position.set(-30 + i * 11, 0, 36); h.rotation.y = Math.PI; root.add(h); }
  [[END_X + 2, -26, '#d9cfbd', '#3f6f8f', 14, 11], [END_X + 18, -27, '#c9452f', '#3a3236', 12, 13], [END_X + 33, -25, '#e6c46a', '#2f4a43', 13, 9], [END_X + 48, -26, '#d9cfbd', '#c9452f', 12, 12]].forEach(([x, z, c, a, w, h], i) => { const m = modernBlock({ w, h, d: 10, color: c, accent: a, seed: 900 + i }); m.position.set(x, 0, z); root.add(m); });
  for (let i = 0; i < 8; i++) { const l = lampPost(); l.position.set(-30 + i * 12, 0, -12.8); root.add(l); }

  // roadside props: speed board, August banner, NEW KIRUNA sign at the new centre
  const speed = standBoard(['0.5 KM/H'], { w: 2.0, h: 0.85, legs: 1.0, sizes: [180], bg: '#f4ead2' });
  speed.group.position.set(rigX(B.half) + 3.2, 0, 12.4); speed.group.rotation.y = -0.25; root.add(speed.group);
  const aug = banner(['19-20 AUGUST', '2025'], { w: 6.2, h: 1.9, poleH: 4.6, sizes: [150, 120] });
  const AUG_X = rigX(B.august) + 4.5; aug.position.set(AUG_X, 0, 12.9); root.add(aug);
  const nk = signPost(['NEW KIRUNA'], 'CENTRE'); nk.group.position.set(END_X + 9.5, 0, 11.6); nk.group.rotation.y = -0.45; root.add(nk.group);
  for (const [x, z] of [[END_X + 7.2, 13.4], [END_X + 7.9, 14.0]]) { const c = cone(); c.position.set(x, 0, z); root.add(c); }

  const rig = new THREE.Group(); root.add(rig);
  const tr = transporter(); rig.add(tr.group);
  const ch = church(); ch.position.y = tr.topY; rig.add(ch);
  const driver = makePerson(DRIVER); driver.group.position.z = DRV_Z; root.add(driver.group);
  const walkers = WALK.map((w, i) => { const m = makePerson({ ...PALETTES[w.p], seed: 750 + i, phase: i * 0.9 }); m.group.position.z = w.z; root.add(m.group); return { ...w, m }; });
  const watchers = [[END_X + 12.5, 12.9, 4], [END_X + 14, 12.4, 0], [END_X + 6, -12.2, 3], [END_X + 20, -11.8, 1]].map(([x, z, p], i) => { const m = makePerson({ ...PALETTES[p], seed: 780 + i }); m.group.position.set(x, 0, z); root.add(m.group); return m; });

  return {
    root,
    update(t, camera) {
      const x = rigX(t); rig.position.x = x;
      const travelled = x - X0; tr.wheels.forEach((w) => (w.rotation.z = -travelled / 0.42));
      const stride = Math.min(3.2, 0.9 + V(t) * 0.45);
      driver.group.position.x = x + DRV_DX;
      const talk = talking(t, B.drvStart, B.drvEnd) && !DRV_PAUSES.some(([a, b]) => t > a && t < b) ? 1 : 0;
      driver.update(t, camera.position, V(t) > 0.05 ? stride : 0, { hold: true, talk });
      walkers.forEach((w) => { w.m.group.position.x = x + w.dx; w.m.update(t, camera.position, V(t) > 0.05 ? stride : 0); });
      watchers.forEach((m) => m.update(t, camera.position, 0));
      speed.board.scale.setScalar(pop(ramp(t, B.half - 0.05, B.half + 0.25)));
    },
  };
}

// camera keys follow the transporter (positions relative to its x at each key time)
const at = (t, dx, y, z, lx, ly, lz) => ({ t, pos: [rigX(t) + dx, y, z], look: [rigX(t) + lx, ly, lz] });
export const roadCam = cameraPath([
  at(36.07, -11, 2.4, 21.5, -1, 1.8, 7),                      // wide side view, creeping
  at(B.half, -2.5, 1.9, 19.0, 3.5, 1.4, 11),                  // 0.5 KM/H board pops
  at(B.drvStart, DRV_DX - 0.9, 1.35, 13.2, DRV_DX, 1.2, DRV_Z), // close on the driver
  at(B.drvEnd, DRV_DX - 0.7, 1.32, 12.75, DRV_DX, 1.18, DRV_Z),
  at(B.twoDays, 0, 3.0, 21.5, 3, 2.6, 7),                     // pull back as it speeds up (time-lapse)
  at(B.august, 0.5, 2.8, 22.0, 4.5, 2.6, 8),                  // banner passes in front
  at(B.church11, -2, 3.6, 22.5, 1, 3.4, 3),
  at(47.06, -6, 5.5, 25, 2, 4, 0),                             // crane up
  at(B.came, -8, 11, 31, 6, 4.5, -2),                          // the new centre, church arrives
  at(50.7, -8.3, 11.4, 31.5, 6, 4.5, -2),
]);
