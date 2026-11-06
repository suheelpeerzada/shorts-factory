// The "captain" on a ship's deck in fog and rain, shouting into his radio.
import * as THREE from 'three';
import { toon, part, paintTexture } from '../lib/toon.js';
import { makePerson } from '../lib/char.js';
import { addLights } from '../Stage.jsx';
import { cameraPath } from '../lib/camera.js';
import { w, talking } from '../times.js';
import { glow, sky, sea, rain, CAPTAIN } from './common.js';

export function buildDeck(scene) {
  addLights(scene, { center: [0, 0, 0], key: [-20, 30, 20], keyColor: '#9fb4d8', keyI: 0.8, hemiI: 0.6, hemi: ['#5a6c88', '#151a24'], size: 12, fog: ['#4a5870', 3, 24] });
  const root = new THREE.Group();
  root.add(sky('night')); const S = sea('night'); S.mesh.position.y = -2.2; root.add(S.mesh);
  const deck = new THREE.Group(); root.add(deck);
  deck.add(part(new THREE.BoxGeometry(8, 0.3, 16), toon('#ffffff', paintTexture({ base: '#8a6142', kind: 'planks', seed: 31, repeat: [2, 4] })), [0, -0.15, -2], { outline: 0.02, edges: false }));
  const rail = toon('#5b3a2a');
  for (const x of [-3.9, 3.9]) { deck.add(part(new THREE.BoxGeometry(0.12, 0.12, 16), rail, [x, 1.0, -2], { outline: 0.015 })); for (let z = -9; z <= 5; z += 1.5) deck.add(part(new THREE.BoxGeometry(0.08, 1.0, 0.08), rail, [x, 0.5, z], { outline: 0.01, edges: false })); }
  deck.add(part(new THREE.CylinderGeometry(0.18, 0.22, 12, 12), toon('#6b4a32'), [-1.8, 6, -3.5], { outline: 0.02, edges: false }));
  deck.add(part(new THREE.CylinderGeometry(0.05, 0.05, 5, 6), rail, [-1.8, 4.5, -3.5], { rot: [0, 0, Math.PI / 2], outline: 0.01, edges: false }));
  // ship's wheel behind him
  const wheel = new THREE.Group(); wheel.position.set(1.9, 1.35, -1.6); deck.add(wheel);
  wheel.add(part(new THREE.TorusGeometry(0.6, 0.05, 8, 32), toon('#7a5236'), [0, 0, 0], { outline: 0.01, edges: false }));
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; wheel.add(part(new THREE.CylinderGeometry(0.025, 0.025, 1.5, 6), toon('#7a5236'), [0, 0, 0], { rot: [0, 0, a], outline: 0.006, edges: false })); }
  deck.add(part(new THREE.BoxGeometry(0.3, 1.3, 0.3), toon('#5b3a2a'), [1.9, 0.65, -1.7], { outline: 0.012 }));
  // hanging lantern
  const lg = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 8), glow('#ffcf7a')); lg.position.set(-1.1, 2.5, -0.6); deck.add(lg);
  const ll = new THREE.PointLight('#ffb866', 14, 10, 1.3); ll.position.copy(lg.position); deck.add(ll);
  const R = rain(900, 8, 10, 18); root.add(R.lines);
  const cap = makePerson(CAPTAIN, { tint: '#d2dcef' }); cap.group.position.set(0, 0, 0.4); root.add(cap.group);
  return {
    root,
    update(t, camera) {
      S.update(t);
      deck.rotation.z = Math.sin(t * 0.9) * 0.035; deck.rotation.x = Math.sin(t * 0.7 + 1) * 0.02;
      cap.group.rotation.z = deck.rotation.z;
      ll.intensity = 14 * (0.85 + 0.15 * Math.sin(t * 11));
      R.update(t, camera.position);
      cap.update(t, camera.position, 0, { talk: talking(t, 'CAPTAIN') ? 1 : 0, expr: 'shout', gesture: [[-1e9, 'mouth', { prop: 'radio' }], [w(5, "can't") - 0.05, 'mouth', { prop: 'radio' }]] });
    },
  };
}

const p = cameraPath([
  { t: 18.42, pos: [0.5, 1.6, 3.2], look: [0, 1.4, 0.4] },
  { t: 20.9, pos: [0.25, 1.52, 2.35], look: [0, 1.42, 0.4] },
  { t: 22.0, pos: [0.12, 1.48, 1.95], look: [0, 1.44, 0.4] },
]);
export const camDeck = (t) => {
  const c = p(t); c.focus = new THREE.Vector3(0, 1.45, 0.4);
  c.pos.x += Math.sin(t * 2.3) * 0.03; c.pos.y += Math.sin(t * 1.7 + 1) * 0.025; // handheld, in a swell
  const lu = w(5, '^Light$'); if (t > lu && t < lu + 0.3) { const s = (1 - (t - lu) / 0.3) * 0.04; c.pos.x += Math.sin(t * 97) * s; }
  return c;
};
