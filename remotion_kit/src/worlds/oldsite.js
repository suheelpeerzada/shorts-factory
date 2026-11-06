// Shots 6-7 (22.10 - 36.07 s): the church on its old site. Resident's line, 1912 plaque, 670 tonnes board,
// then: jacks lift it, steel beams slide under, beam-end jacks raise it, the transporter (224 wheels) rolls in.
import * as THREE from 'three';
import { toon, part, paintTexture } from '../lib/toon.js';
import { church, transporter, beamSet, house, lampPost, standBoard, ground, sky, mineMountain, jack } from '../lib/kit.js';
import { makePerson, PALETTES } from '../lib/char.js';
import { addLights } from '../Stage.jsx';
import { cameraPath } from '../lib/camera.js';
import { B, talking } from '../times.js';

const ramp = (t, a, b) => THREE.MathUtils.clamp((t - a) / (b - a), 0, 1);
const ease = (x) => x * x * (3 - 2 * x);
const pop = (k) => (k <= 0 ? 0.0001 : 1 + 2.2 * Math.pow(k - 1, 3) + 1.2 * Math.pow(k - 1, 2));

export const RESIDENT = { skin: '#f7e2cf', hair: '#efe9df', jacket: '#7a5aa0', jacket2: '#5d4380', pants: '#3b3640', shoes: '#351f22', tie: '#e1ad35', hat: 'none', glasses: true, height: 1.56, seed: 501 };
const RES_PAUSES = [[23.68, 23.93]];

// timeline (seconds)
const T_LIFT = [B.lifted, B.lifted + 0.6];            // church up 0.75 m on jacks
const T_BEAMS = [B.steel - 0.1, B.steel + 0.5];       // beams slide in from the back
const T_SETTLE = [B.steel + 0.5, B.steel + 0.7];      // church sits on the beams, front jacks drop away
const T_RAISE = [B.steel + 0.55, B.slid + 0.25];      // beam-end jacks raise beams + church to transporter height
const T_ROLL = [B.slid + 0.1, B.wheelsWord + 0.05];   // transporter slides in under
const T_REST = [B.wheelsWord + 0.1, B.underneath + 0.5];

export function buildOldSite(scene) {
  addLights(scene, { center: [0, 0, 4], key: [-36, 44, 36], size: 30 });
  const root = new THREE.Group();
  root.add(sky()); root.add(ground());
  const mtn = mineMountain(); mtn.position.set(-60, 0, -300); root.add(mtn);
  // gravel churchyard square under the church
  root.add(part(new THREE.BoxGeometry(34, 0.08, 30), toon('#ffffff', paintTexture({ base: '#c4b79f', kind: 'asphalt', seed: 4, repeat: [4, 4] })), [0, 0.04, 2], { outline: 0.015, edges: false }));
  const cols = ['#ece4d2', '#e2b955', '#a3392d', '#7d93a3', '#6f8f5a', '#d98b3a'];
  cols.forEach((c, i) => { const h = house({ w: 8, h: 6, d: 7, color: c, seed: 600 + i }); h.position.set(-34 + i * 13, 0, -24); root.add(h); });
  for (const x of [-15, 15]) { const l = lampPost(); l.position.set(x, 0, 14); l.rotation.y = Math.PI; root.add(l); }

  const ch = church(); root.add(ch);
  const beams = beamSet(); root.add(beams);
  const tr = transporter({ beams: false }); root.add(tr.group);
  // front-wall jacks (between beam positions), and beam-end jacks outside the transporter's footprint
  const jA = [-4, 0, 4].flatMap((x) => [7.9, -7.9].map((z) => { const j = jack(); j.group.position.set(x, 0, z); root.add(j.group); return j; }));
  const jB = [-6, -2, 2, 6].flatMap((x) => [9.0, -9.0].map((z) => { const j = jack(); j.group.position.set(x, 0, z); root.add(j.group); return j; }));

  const tonnes = standBoard(['ABOUT', '670 TONNES'], { w: 1.9, h: 1.15, legs: 0.75, sizes: [120, 130] });
  tonnes.group.position.set(-4.3, 0, 11.6); tonnes.group.rotation.y = 0.15; root.add(tonnes.group);

  const res = makePerson(RESIDENT); res.group.position.set(2.25, 0, 11.6); root.add(res.group);
  const crowd = [[-13, 11, 1], [-15.5, 12.8, 4], [13.5, 6.5, 3], [15.5, 9, 5], [12.8, 2.5, 0]].map(([x, z, p], i) => { const m = makePerson({ ...PALETTES[p], seed: 520 + i, phase: i * 1.3 }); m.group.position.set(x, 0, z); root.add(m.group); return m; });

  return {
    root,
    update(t, camera) {
      // heights
      const lift = 0.75 * ease(ramp(t, ...T_LIFT));
      const beamZ = THREE.MathUtils.lerp(-28, 0, ease(ramp(t, ...T_BEAMS)));
      const raise = ease(ramp(t, ...T_RAISE));
      const beamY = THREE.MathUtils.lerp(0.04, 1.70, raise);
      const onBeams = t >= T_SETTLE[0];
      const churchY = onBeams ? beamY + 0.66 : lift;
      ch.position.y = Math.max(churchY, 0);
      beams.position.set(0, beamY, beamZ);
      beams.visible = t > T_BEAMS[0] - 0.05;
      // front jacks: extend on "lifted", drop away when the beams take the weight
      const aH = onBeams ? lift * (1 - ramp(t, T_SETTLE[0], T_SETTLE[1] + 0.2)) : lift;
      jA.forEach((j) => { j.set(Math.max(0.05, aH + 0.35)); j.group.visible = t > T_LIFT[0] - 0.4 && t < T_SETTLE[1] + 0.3; });
      jB.forEach((j) => { j.set(Math.max(0.05, beamY - 0.35)); j.group.visible = t > T_SETTLE[0] - 0.1 && t < T_REST[1] + 1.5; });
      // transporter rolls in from the left under the raised beams
      const k = ease(ramp(t, ...T_ROLL));
      tr.group.position.x = THREE.MathUtils.lerp(-38, 0, k);
      tr.group.visible = t > T_ROLL[0] - 0.05;
      const dist = 38 * k; tr.wheels.forEach((w) => (w.rotation.z = -dist / 0.42));
      // board pops on "670"
      tonnes.board.scale.setScalar(pop(ramp(t, B.tonnes670 - 0.05, B.tonnes670 + 0.25)));
      const talk = talking(t, B.resStart, B.resEnd) && !RES_PAUSES.some(([a, b]) => t > a && t < b) ? 1 : 0;
      // after her line she steps aside to the left
      const w = ramp(t, 28.9, 32.0); const we = ease(w);
      res.group.position.set(THREE.MathUtils.lerp(2.25, -8.5, we), 0, THREE.MathUtils.lerp(11.6, 12.9, we));
      res.update(t, camera.position, w > 0 && w < 1 ? 1.8 : 0, { talk });
      crowd.forEach((p) => p.update(t, camera.position, 0));
    },
  };
}

export const oldSiteCam = cameraPath([
  { t: 22.1, pos: [3.05, 1.12, 13.95], look: [2.3, 1.02, 11.6] },            // close on the resident
  { t: B.resEnd, pos: [2.85, 1.15, 13.6], look: [2.25, 1.05, 11.6] },
  { t: B.y1912, pos: [1.1, 3.55, 14.2], look: [0.15, 3.6, 9.9] },             // up to the 1912 plaque
  { t: B.tonnes670, pos: [-1.6, 2.4, 18.6], look: [-2.6, 2.0, 9.5] },         // pull back: 670 tonnes board + church
  { t: B.seeApart + 0.7, pos: [3.5, 4.6, 25.5], look: [0, 4.4, 0] },          // whole church: not taken apart
  { t: B.lifted + 0.5, pos: [6.5, 1.0, 17.5], look: [0.5, 1.6, 7] },         // down low: jacks lift it
  { t: B.steel + 0.4, pos: [3.5, 0.95, 17.0], look: [0.5, 1.2, 6] },          // beams sliding in under it
  { t: B.wheelsWord, pos: [-2.2, 1.25, 16.2], look: [-0.8, 1.45, 8.4] },      // transporter rolls in, 224 WHEELS
  { t: 36.07, pos: [-1.8, 1.3, 15.6], look: [-0.5, 1.5, 8.4] },
]);
