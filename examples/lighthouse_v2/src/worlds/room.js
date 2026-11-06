// Inside the watch room under the lantern: desk + radio, the light switch, the window onto the night sea.
import * as THREE from 'three';
import { toon, part, paintTexture } from '../lib/toon.js';
import { makePerson } from '../lib/char.js';
import { addLights } from '../Stage.jsx';
import { cameraPath } from '../lib/camera.js';
import { w } from '../times.js';
import { ramp, smooth, glow, sky, sea, beam, YOU, card } from './common.js';

const WIN = { x0: -1.3, x1: 1.3, y0: 1.1, y1: 2.9, z: -3 };
export const LEVER = [3.8, 1.5, -0.5];
const RADIO = [-2.6, 1.15, -2.4];
const T_FLIP = 24.45, T_SLAM = 32.75;

export function makeRoom(id) {
  return function build(scene) {
    addLights(scene, { center: [0, 0, 0], key: [-30, 40, -60], keyColor: '#8fa6cf', keyI: 0.35, hemiI: 0.35, hemi: ['#3a4a6a', '#1a1012'], size: 12, fog: ['#0b1220', 30, 260] });
    const root = new THREE.Group();
    const wallMat = toon('#ffffff', paintTexture({ base: '#8f6446', kind: 'planks', seed: 21, repeat: [3, 1] }));
    const floorMat = toon('#ffffff', paintTexture({ base: '#5e412e', kind: 'planks', seed: 22, repeat: [4, 4] }));
    const H = 3.6;
    root.add(part(new THREE.BoxGeometry(8.4, 0.2, 9.4), floorMat, [0, -0.1, 1.5], { outline: 0, edges: false }));
    root.add(part(new THREE.BoxGeometry(8.4, 0.2, 9.4), toon('#4a3326'), [0, H + 0.1, 1.5], { outline: 0, edges: false }));
    for (const sx of [-1, 1]) root.add(part(new THREE.BoxGeometry(0.2, H, 9.4), wallMat, [sx * 4.1, H / 2, 1.5], { outline: 0, edges: false }));
    root.add(part(new THREE.BoxGeometry(8.4, H, 0.2), wallMat, [0, H / 2, 6.2], { outline: 0, edges: false }));
    // back wall with a window hole
    const bz = WIN.z - 0.1;
    root.add(part(new THREE.BoxGeometry(4.1 + WIN.x0, H, 0.2), wallMat, [(-4.2 + WIN.x0) / 2, H / 2, bz], { outline: 0.02, edges: false }));
    root.add(part(new THREE.BoxGeometry(4.1 - WIN.x1, H, 0.2), wallMat, [(4.2 + WIN.x1) / 2, H / 2, bz], { outline: 0.02, edges: false }));
    root.add(part(new THREE.BoxGeometry(WIN.x1 - WIN.x0, WIN.y0, 0.2), wallMat, [0, WIN.y0 / 2, bz], { outline: 0.02, edges: false }));
    root.add(part(new THREE.BoxGeometry(WIN.x1 - WIN.x0, H - WIN.y1, 0.2), wallMat, [0, (H + WIN.y1) / 2, bz], { outline: 0.02, edges: false }));
    const frame = toon('#e8dcc4');
    for (const x of [WIN.x0, 0, WIN.x1]) root.add(part(new THREE.BoxGeometry(0.1, WIN.y1 - WIN.y0, 0.14), frame, [x, (WIN.y0 + WIN.y1) / 2, WIN.z], { outline: 0.012, edges: false }));
    for (const y of [WIN.y0, (WIN.y0 + WIN.y1) / 2, WIN.y1]) root.add(part(new THREE.BoxGeometry(WIN.x1 - WIN.x0, 0.1, 0.14), frame, [0, y, WIN.z], { outline: 0.012, edges: false }));
    root.add(part(new THREE.BoxGeometry(WIN.x1 - WIN.x0 + 0.4, 0.1, 0.45), frame, [0, WIN.y0 - 0.05, WIN.z + 0.15], { outline: 0.015 }));
    // outside, far below: the night sea
    const out = new THREE.Group(); out.position.y = -18; root.add(out);
    out.add(sky('night')); const S = sea('night'); out.add(S.mesh);
    const B = beam(); B.pivot.position.set(0, 22.5, 0); out.add(B.pivot);
    // the eyes for the ending, out in the dark
    const eyes = [];
    for (const s of [-1, 1]) {
      const e = new THREE.Mesh(new THREE.SphereGeometry(0.9, 16, 10), glow('#fff3b0')); e.position.set(s * 1.7, 4.2, -30); e.scale.set(1, 0.05, 0.5); out.add(e); eyes.push(e);
      const halo = new THREE.Mesh(new THREE.CircleGeometry(2.2, 24), glow('#ffe9a0', 0.16)); halo.position.set(0, 0, 0.6); e.add(halo);
      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 8), glow('#1a0d0f')); pupil.position.set(0, 0, 0.5); e.add(pupil);
    }
    // desk, radio, oil lamp
    const wood = toon('#ffffff', paintTexture({ base: '#6b4a32', kind: 'planks', seed: 23 }));
    root.add(part(new THREE.BoxGeometry(2.2, 0.12, 1.2), wood, [-2.7, 0.9, -2.3], { outline: 0.02 }));
    for (const [x, z] of [[-3.7, -2.8], [-1.7, -2.8], [-3.7, -1.8], [-1.7, -1.8]]) root.add(part(new THREE.BoxGeometry(0.1, 0.9, 0.1), wood, [x, 0.45, z], { outline: 0.012, edges: false }));
    const radio = new THREE.Group(); radio.position.set(...RADIO); root.add(radio);
    radio.add(part(new THREE.BoxGeometry(0.9, 0.5, 0.42), toon('#3d5a4a'), [0, 0, 0], { outline: 0.018 }));
    radio.add(part(new THREE.BoxGeometry(0.3, 0.3, 0.02), toon('#22302a'), [-0.22, 0, 0.215], { outline: 0.008, edges: false }));
    const dial = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.14), glow('#ffcf7a')); dial.position.set(0.2, 0.08, 0.22); radio.add(dial);
    for (const x of [0.1, 0.3]) radio.add(part(new THREE.CylinderGeometry(0.05, 0.05, 0.05, 10), toon('#e8dcc4'), [x, -0.12, 0.23], { rot: [Math.PI / 2, 0, 0], outline: 0.008, edges: false }));
    radio.add(part(new THREE.CylinderGeometry(0.012, 0.012, 0.8, 6), toon('#2b2b33'), [0.35, 0.55, -0.1], { rot: [0, 0, -0.3], outline: 0.006, edges: false }));
    const radioLight = new THREE.PointLight('#7fe0a0', 0, 3, 1.5); radioLight.position.set(0, 0.2, 0.5); radio.add(radioLight);
    const statics = [];
    for (let i = 0; i < 3; i++) {
      const pts = []; for (let k = 0; k <= 6; k++) pts.push(new THREE.Vector3(k * 0.07, (k % 2 ? 0.05 : -0.05), 0));
      const ln = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: '#bff7d4', transparent: true, opacity: 0.9, fog: false, toneMapped: false }));
      ln.position.set(-0.6 - i * 0.05, 0.25 + i * 0.16, 0.25); ln.rotation.z = 0.6 - i * 0.3; radio.add(ln); statics.push(ln);
    }
    const lampG = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 8), glow('#ffcf7a')); lampG.position.set(-3.4, 1.18, -2.1); root.add(lampG);
    root.add(part(new THREE.CylinderGeometry(0.12, 0.16, 0.2, 12), toon('#c9a25a'), [-3.4, 1.0, -2.1], { outline: 0.01, edges: false }));
    const lamp = new THREE.PointLight('#ffb866', 9, 9, 1.4); lamp.position.set(-3.4, 1.4, -2.0); root.add(lamp);
    // the light switch on the right wall + the rule note
    root.add(part(new THREE.BoxGeometry(0.12, 1.2, 0.9), toon('#3a3f4a'), [3.95, LEVER[1], LEVER[2]], { outline: 0.015 }));
    const lever = new THREE.Group(); lever.position.set(3.85, LEVER[1], LEVER[2]); root.add(lever);
    lever.add(part(new THREE.CylinderGeometry(0.035, 0.035, 0.6, 8), toon('#c8c8cc'), [-0.05, 0.3, 0], { rot: [0, 0, 0.0], outline: 0.008, edges: false }));
    lever.add(part(new THREE.SphereGeometry(0.09, 12, 8), toon('#c9452f'), [-0.05, 0.62, 0], { outline: 0.01, edges: false }));
    const lbl = card(['LIGHT'], 0.8, 0.3, { sizes: [210] }); lbl.rotation.y = -Math.PI / 2; lbl.position.set(3.88, LEVER[1] + 0.85, LEVER[2]); root.add(lbl);
    const note = card(['NEVER', 'TURN ON', 'THE LIGHT'], 0.7, 0.8, { sizes: [190, 150, 150], bg: '#f4ead2' }); note.rotation.y = -Math.PI / 2; note.rotation.z = 0.06; note.position.set(3.98, 1.65, 0.65); root.add(note);
    const tally = card(['NIGHT', 'II'], 0.7, 0.6, { sizes: [180, 220], bg: '#2b2b2b', fg: '#f3ead6', border: '#f3ead6' }); tally.rotation.y = Math.PI / 2; tally.position.set(-3.98, 2.0, -0.6); root.add(tally);
    // light from the lantern above when it is on
    const wash = new THREE.PointLight('#ffd98a', 0, 12, 1.2); wash.position.set(0, H - 0.2, 0); root.add(wash);
    const you = makePerson(YOU); root.add(you.group);

    return {
      root,
      update(t, camera) {
        S.update(t);
        const on = t > T_FLIP && t < T_SLAM ? 1 : 0;
        wash.intensity = 30 * on; B.set(on, 0.85 + 1.75 * (27.3 - t));
        // lever: down = off, up = on (rotates about the wall normal)
        const up = id === 'room2' ? smooth(ramp(t, T_FLIP - 0.08, T_FLIP + 0.04)) : id === 'room3' ? 1 - smooth(ramp(t, T_SLAM - 0.06, T_SLAM + 0.02)) : 0;
        lever.rotation.x = 2.3 - 1.9 * up;
        // radio crackle
        const crack = (id === 'room1' && t > w(4, 'radio') - 0.4) || (id === 'room4' && t < 45.8);
        const flick = crack ? (Math.sin(t * 53) > -0.2 ? 1 : 0.3) : 0.15;
        dial.material.color.setHSL(0.11, 1, 0.25 + 0.35 * flick); radioLight.intensity = 3 * flick;
        statics.forEach((s, i) => { s.visible = crack && Math.sin(t * 31 + i * 2.1) > 0; s.position.x = -0.6 - i * 0.05 - ((t * 3 + i) % 1) * 0.2; });
        lamp.intensity = 9 * (0.93 + 0.07 * Math.sin(t * 13));
        // eyes in the dark (ending)
        const open = id === 'room4' ? smooth(ramp(t, w(12, "it's") - 0.05, w(12, "it's") + 0.35)) : 0;
        eyes.forEach((e) => { e.visible = open > 0.01; e.scale.y = 0.05 + 0.95 * open; });
        // YOU
        you.group.visible = id === 'room1' || id === 'room3';
        if (id === 'room1') { you.group.position.set(-1.5, 0, -1.3); you.update(t, camera.position, 0, { expr: t > w(4, 'crackles') - 0.1 ? 'alarmed' : 'neutral' }); }
        if (id === 'room3') { you.group.position.set(3.0, 0, 1.0); you.update(t, camera.position, 0, { expr: 'scared' }); }
      },
    };
  };
}

const V = (a) => new THREE.Vector3(...a);
const shake = (c, t, t0, d = 0.3, a = 0.04) => { if (t > t0 && t < t0 + d) { const s = (1 - (t - t0) / d) * a; c.pos.x += Math.sin(t * 97) * s; c.pos.y += Math.sin(t * 71 + 2) * s; } return c; };

const r1 = cameraPath([{ t: 16.05, pos: [0.8, 1.7, 3.8], look: [-2.2, 1.25, -2.0] }, { t: 17.3, pos: [-0.1, 1.55, 1.6], look: [-2.3, 1.2, -2.1] }, { t: 18.42, pos: [-0.6, 1.45, 0.7], look: [-2.2, 1.25, -2.0] }]);
export const camRoom1 = (t) => { const c = r1(t); c.focus = V([-2.1, 1.3, -1.9]); return shake(c, t, w(4, 'crackles'), 0.25, 0.02); };

const r2 = cameraPath([
  { t: 22.0, pos: [1.4, 1.65, 1.8], look: [3.8, 1.55, -0.4] },
  { t: 22.9, pos: [1.9, 1.6, 1.2], look: [3.8, 1.6, -0.4] },
  { t: 23.6, pos: [0.4, 1.75, 1.0], look: [0, 2.0, -3] },
  { t: 24.2, pos: [1.9, 1.6, 1.0], look: [3.8, 1.6, -0.45] },
  { t: 25.0, pos: [2.2, 1.6, 0.85], look: [3.8, 1.75, -0.45] },
]);
export const camRoom2 = (t) => { const c = r2(t); c.focus = t > 23.0 && t < 24.0 ? V([0, 1.5, -20]) : V(LEVER); return shake(c, t, T_FLIP, 0.3, 0.03); };

const r3 = cameraPath([{ t: 32.45, pos: [1.0, 1.6, 2.6], look: [3.4, 1.5, 0.3] }, { t: 33.55, pos: [1.35, 1.58, 2.25], look: [3.4, 1.5, 0.25] }]);
export const camRoom3 = (t) => { const c = r3(t); c.focus = V([3.3, 1.5, 0.3]); return shake(c, t, T_SLAM, 0.4, 0.06); };

const r4 = cameraPath([
  { t: 43.3, pos: [1.2, 1.5, 3.0], look: [-2.6, 1.2, -2.4] },
  { t: 45.2, pos: [0.2, 1.65, 0.9], look: [-1.0, 1.7, -2.8] },
  { t: 46.5, pos: [0.0, 1.95, -1.4], look: [0, 1.4, -12] },
  { t: 48.16, pos: [0.0, 1.98, -2.0], look: [0, 1.2, -14] },
]);
export const camRoom4 = (t) => { const c = r4(t); c.focus = t < 45.5 ? V(RADIO) : V([0, -14, -30]); return c; };
