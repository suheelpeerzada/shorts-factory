// Next morning: the harbour master's hut on the pier and the log on its wall.
import * as THREE from 'three';
import { toon, part, paintTexture } from '../lib/toon.js';
import { makePerson } from '../lib/char.js';
import { addLights } from '../Stage.jsx';
import { cameraPath } from '../lib/camera.js';
import { w } from '../times.js';
import { ramp, pop, sky, sea, ship, card, YOU } from './common.js';

export function buildHarbour(scene) {
  addLights(scene, { center: [0, 0, 0], key: [-40, 60, 50], keyColor: '#fff0d4', keyI: 2.3, hemiI: 1.15, hemi: ['#d6e4ef', '#7f8f9a'], size: 24, fog: ['#cfe0ea', 50, 380] });
  const root = new THREE.Group();
  root.add(sky('morning')); const S = sea('morning'); S.mesh.position.y = -0.7; root.add(S.mesh);
  root.add(part(new THREE.BoxGeometry(10, 0.3, 14), toon('#ffffff', paintTexture({ base: '#8a6142', kind: 'planks', seed: 41, repeat: [3, 4] })), [0, -0.15, 2], { outline: 0.02, edges: false }));
  for (const x of [-4.8, 4.8]) for (const z of [-4, 0, 4, 8]) root.add(part(new THREE.CylinderGeometry(0.18, 0.18, 1.6, 8), toon('#5b3a2a'), [x, -0.5, z], { outline: 0.015, edges: false }));
  // hut
  const wall = toon('#ffffff', paintTexture({ base: '#3f6f8f', kind: 'planks', seed: 42, repeat: [2, 1] }));
  root.add(part(new THREE.BoxGeometry(5, 3, 3), wall, [0, 1.5, -1.5], { outline: 0.03 }));
  root.add(part(new THREE.BoxGeometry(5.6, 0.25, 3.8), toon('#a3392d'), [0, 3.15, -1.4], { outline: 0.03 }));
  root.add(part(new THREE.BoxGeometry(0.9, 2.0, 0.08), toon('#efe6d6'), [-1.7, 1.0, 0.02], { outline: 0.015 }));
  root.add(part(new THREE.BoxGeometry(1.0, 0.8, 0.08), toon('#cfe6f2'), [1.7, 1.9, 0.02], { outline: 0.015 }));
  const sign = card(['HARBOUR MASTER'], 2.6, 0.45, { sizes: [150], bg: '#f4ead2' }); sign.position.set(0, 2.75, 0.05); root.add(sign);
  // the log board: header + the entry that pops on "No ship"
  root.add(part(new THREE.BoxGeometry(1.7, 1.5, 0.05), toon('#5b3a2a'), [0, 1.75, 0.05], { outline: 0.015 }));
  const head = card(['HARBOUR LOG', 'LAST NIGHT'], 1.55, 0.6, { sizes: [150, 120] }); head.position.set(0, 2.15, 0.09); root.add(head);
  const entry = card(['SHIPS OUT:', 'NONE'], 1.55, 0.7, { sizes: [140, 220], fg: '#a3392d', border: '#a3392d' }); entry.position.set(0, 1.45, 0.1); root.add(entry);
  const s1 = ship('#7a2f2a', 5); s1.position.set(-9, -0.6, -5); s1.rotation.y = 0.5; root.add(s1);
  const s2 = ship('#2f4a6a', 6); s2.position.set(10, -0.6, -9); s2.rotation.y = -0.6; root.add(s2);
  const you = makePerson(YOU); you.group.position.set(1.45, 0, 1.5); root.add(you.group);
  return {
    root,
    update(t, camera) {
      S.update(t);
      const noT = w(10, '^No$'); entry.scale.setScalar(pop(ramp(t, noT - 0.05, noT + 0.3)));
      [s1, s2].forEach((s, i) => { s.position.y = -0.6 + Math.sin(t * 1.2 + i) * 0.08; });
      let ex = 'neutral'; if (t > noT) ex = 'alarmed'; if (t > w(10, '^Not') - 0.05) ex = 'scared';
      you.update(t, camera.position, 0, { expr: ex });
    },
  };
}

const p = cameraPath([
  { t: 35.3, pos: [5, 2.8, 12], look: [0, 1.9, 0] },
  { t: 36.9, pos: [0.8, 2.0, 4.6], look: [0, 1.9, 0.05] },
  { t: 37.9, pos: [0.15, 1.85, 2.4], look: [0, 1.75, 0.05] },
  { t: 38.9, pos: [0.5, 1.7, 3.3], look: [0.9, 1.6, 0.9] },
  { t: 39.8, pos: [0.7, 1.55, 3.4], look: [1.45, 1.45, 1.5] },
]);
export const camHarbour = (t) => { const c = p(t); c.focus = t < 38.6 ? new THREE.Vector3(0, 1.75, 0.1) : new THREE.Vector3(1.45, 1.45, 1.5); return c; };
