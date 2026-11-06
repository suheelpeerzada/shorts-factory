// Outside: the rock, the lighthouse and the sea, at dusk, at night and in the morning.
import * as THREE from 'three';
import { makePerson } from '../lib/char.js';
import { standBoard } from '../lib/kit.js';
import { addLights } from '../Stage.jsx';
import { cameraPath } from '../lib/camera.js';
import { w, talking } from '../times.js';
import { ramp, smooth, pop, sky, sea, lighthouse, beam, creature, ship, KEEPER, YOU, BASE_Y, GALLERY_Y, CREATURE, glitterPath, coastline, clouds, fogBank } from './common.js';

const LIGHTS = {
  dusk: { center: [0, 0, 0], key: [120, 40, -160], keyColor: '#ffb27a', keyI: 1.7, hemiI: 0.95, hemi: ['#c99ab8', '#3a3050'], size: 40, fog: ['#b98896', 70, 420] },
  night: { center: [0, 0, -30], key: [-60, 80, -120], keyColor: '#9fb4d8', keyI: 0.9, hemiI: 0.55, hemi: ['#3a5078', '#0a1018'], size: 80, fog: ['#0d1729', 40, 300] },
  morning: { center: [0, 0, 0], key: [-60, 80, 60], keyColor: '#fff0d4', keyI: 2.2, hemiI: 1.1, hemi: ['#d6e4ef', '#7f8f9a'], size: 40, fog: ['#cfe0ea', 70, 420] },
};

// beam angle: spinning once it is switched on, slowing to a stop on the thing on "stops"
const T_FLIP = 24.45, T_STOP = 28.28, T_SLAM = 32.75;
const beamAngle = (t) => (t < 27.3 ? 0.85 + 1.75 * (27.3 - t) : 0.85 * Math.pow(1 - ramp(t, 27.3, T_STOP), 2));

export function makeExterior(mode, id) {
  return function build(scene) {
    addLights(scene, LIGHTS[mode]);
    const root = new THREE.Group();
    root.add(sky(mode));
    const S = sea(mode); root.add(S.mesh);
    const L = lighthouse(); root.add(L.group);
    // depth layers: glitter path to the moon/sun, distant coast, clouds, fog banks drifting
    const ENV = { night: ['#fff1c4', [-150, -420], 0.5, '#141d30', true, 'rgba(40,56,90,0.55)', 'rgba(140,160,200,0.16)'], dusk: ['#ffc49a', [160, -440], 0.55, '#4a3550', true, 'rgba(230,140,150,0.45)', 'rgba(255,190,170,0.14)'], morning: ['#ffffff', [-120, -440], 0.3, '#7f98ad', false, 'rgba(255,255,255,0.7)', 'rgba(255,255,255,0.18)'] }[mode];
    root.add(glitterPath(ENV[0], ENV[1], ENV[2])); root.add(coastline(-260, ENV[3], ENV[4])); root.add(clouds(ENV[5], 9, 60, 3));
    const banks = []; for (const [x, y, z, ww] of [[-40, 6, -90, 140], [50, 5, -130, 160], [0, 4, -60, 90], [-70, 7, -170, 200]]) { const f = fogBank(ww, 18, ENV[6]); f.position.set(x, y, z); root.add(f); banks.push([f, x]); }
    const B = beam(); root.add(B.pivot);
    const C = creature(); root.add(C.root);
    const TINT = { night: '#c9d4ee', dusk: '#ffe2cf', morning: '#ffffff' }[mode];
    const keeper = makePerson(KEEPER, { tint: id === 'beam' ? '#ffe9c4' : TINT }); root.add(keeper.group);
    const you = makePerson(YOU, { tint: TINT }); root.add(you.group);
    const ships = [];
    if (id === 'night1') {
      for (const [x0, z, v, col, sd] of [[26, -30, 2.6, '#7a2f2a', 1], [58, -52, 3.2, '#2f4a6a', 2], [-6, -80, 2.2, '#6f5a3a', 3]]) { const s = ship(col, sd); s.position.set(x0, 0, z); s.rotation.y = Math.PI; root.add(s); ships.push({ s, x0, v }); }
    }
    // ripples + bubbles when it sinks
    const ripples = []; if (id === 'sink') for (let i = 0; i < 4; i++) { const rg = new THREE.Mesh(new THREE.RingGeometry(1, 1.25, 48), new THREE.MeshBasicMaterial({ color: '#cfe0ef', transparent: true, opacity: 0, depthWrite: false })); rg.rotation.x = -Math.PI / 2; rg.position.set(CREATURE[0], 0.08, CREATURE[2] + 2); root.add(rg); ripples.push(rg); }
    const bubbles = []; if (id === 'sink') for (let i = 0; i < 18; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.12 + (i % 3) * 0.06, 8, 6), new THREE.MeshBasicMaterial({ color: '#dfeaf5', transparent: true, opacity: 0.7 })); root.add(b); bubbles.push([b, i]); }
    let sign = null;
    if (id === 'dusk') { sign = standBoard(['PAY', '$$$$$'], { w: 1.5, h: 1.1, legs: 0.85, sizes: [210, 190], bg: '#f4ead2' }); sign.group.position.set(2.5, BASE_Y, 7.2); sign.group.rotation.y = -0.35; root.add(sign.group); }
    if (mode === 'morning') { const s = ship('#7a2f2a', 4); s.position.set(-16, 0, 10); s.rotation.y = 0.4; root.add(s); }

    return {
      root,
      update(t, camera) {
        S.update(t); L.update(t); banks.forEach(([f, x]) => { f.position.x = x + Math.sin(t * 0.05 + x) * 6 + t * 0.4; f.lookAt(camera.position.x, f.position.y, camera.position.z); });
        // lantern + beam
        const on = (id === 'beam' && t > T_FLIP && t < T_SLAM) ? 1 : 0;
        const nowT = w(8, 'NOW'); const flare = t > nowT ? Math.max(0, 1 - (t - nowT) / 0.4) : 0;
        L.setOn(on, t, flare); B.set(on, beamAngle(t));
        // the thing
        if (id === 'beam') {
          const stops = w(7, 'stops'), turns = w(7, 'turns'), toward = w(7, 'Toward');
          C.set(t, smooth(ramp(t, stops - 0.2, toward + 0.4)), smooth(ramp(t, turns - 0.15, toward + 0.15)), smooth(ramp(t, toward - 0.05, toward + 0.3)));
        } else if (id === 'sink') {
          C.set(t, -smooth(ramp(t, 33.7, 35.1)), 1, 1 - smooth(ramp(t, w(9, 'dark') - 0.05, w(9, 'dark') + 0.25)));
          ripples.forEach((rg, i) => { const k = ((t - 33.6) / 1.6 + i / 4) % 1; rg.scale.setScalar(3 + k * 12); rg.material.opacity = t > 33.6 ? 0.5 * (1 - k) : 0; });
          bubbles.forEach(([b, i]) => { const k = ((t - 33.8) * 0.9 + i / 18) % 1; b.visible = t > 34.0; b.position.set(CREATURE[0] + Math.sin(i * 2.4) * 4, -0.3 + k * 0.5, CREATURE[2] + 3 + Math.cos(i * 1.7) * 3); b.scale.setScalar(k < 0.9 ? 1 : (1 - k) * 10); });
        } else C.set(t, -1, 0, 0);
        ships.forEach(({ s, x0, v }) => { s.position.x = x0 - v * (t - 10.95); s.position.y = Math.sin(t * 1.3 + x0) * 0.12; s.rotation.z = Math.sin(t * 1.1 + x0) * 0.03; });
        // people
        keeper.group.visible = id === 'dusk' || id === 'morning' || (id === 'beam' && t > 30.5);
        you.group.visible = id === 'dusk' || id === 'night1' || id === 'morning';
        if (id === 'dusk') {
          keeper.group.position.set(-1.0, BASE_Y, 4.2);
          const walkEnd = 3.7, z = t < walkEnd ? 16 - (16 - 6.2) * (t / walkEnd) : 6.2;
          you.group.position.set(0.9, BASE_Y, z);
          const kt = talking(t, 'KEEPER');
          keeper.update(t, camera.position, 0, { talk: kt ? 1 : 0, expr: t > 3.7 && t < 7.0 ? 'angry' : 'neutral', gesture: [[-1e9, 'holdR', { prop: 'key' }], [3.85, 'talk'], [w(1, '^Turn') - 0.05, 'point', { angle: -0.1 }], [w(1, '^The$') - 0.1, 'point', { angle: -1.25 }], [7.2, 'holdR', { prop: 'key' }]] });
          let ex = 'neutral'; if (t > w(2, 'Weird') - 0.1) ex = 'smug'; if (t > w(2, 'pay') - 0.05) ex = 'alarmed'; if (t > w(2, '^So') - 0.05) ex = 'grin';
          you.update(t, camera.position, t < walkEnd ? 1.6 : 0, { expr: ex, gesture: t < walkEnd ? undefined : [[-1e9, 'idle'], [w(2, 'Weird') - 0.05, 'shrug'], [w(2, 'pay') - 0.05, 'scared'], [w(2, '^So') - 0.05, 'fists']] });
          if (sign) sign.board.scale.setScalar(pop(ramp(t, w(2, 'pay') - 0.05, w(2, 'pay') + 0.3)));
        } else if (id === 'night1') {
          you.group.position.set(1.9, GALLERY_Y, 1.9); you.update(t, camera.position, 0, { expr: 'neutral', gesture: [[-1e9, 'holdR', { prop: 'mug' }]] });
        } else if (id === 'beam') {
          keeper.group.position.set(0, GALLERY_Y, 2.35);
          keeper.update(t, camera.position, 0, { talk: talking(t, 'KEEPER') ? 1 : 0, expr: t > nowT - 0.12 ? 'shout' : 'alarmed', gesture: [[-1e9, 'point', { angle: 0.15, prop: 'lantern', hand: 'L' }], [nowT - 0.08, 'point', { angle: -0.45, prop: 'lantern', hand: 'L' }]] });
        } else if (id === 'morning') {
          keeper.group.position.set(-1.0, BASE_Y, 4.2); you.group.position.set(1.6, BASE_Y, 4.6);
          keeper.update(t, camera.position, 0, { talk: talking(t, 'KEEPER') ? 1 : 0, expr: t > w(11, "That's") - 0.1 ? 'smug' : 'neutral', gesture: [[-1e9, 'holdR', { prop: 'mug' }], [w(11, "That's") - 0.1, 'point', { angle: -0.6 }]] });
          you.update(t, camera.position, 0, { expr: 'scared', gesture: 'scared' });
        }
      },
    };
  };
}

const V = (a) => new THREE.Vector3(...a);
const withFocus = (path, focus) => (t) => { const c = path(t); c.focus = typeof focus === 'function' ? focus(t) : V(focus); return c; };
const KFACE = [-1.0, BASE_Y + 1.43, 4.2];

// dusk: fly in to the rock (YOU walking up the jetty) / keeper close-up / YOU + the pay sign
const duskA = cameraPath([{ t: 0, pos: [16, 10, 62], look: [0, 10, 0] }, { t: 1.9, pos: [10, 7, 38], look: [0, 6, 2] }, { t: 3.75, pos: [5, 4.2, 22], look: [0, 3.2, 6] }]);
const duskB = cameraPath([{ t: 3.75, pos: [-0.35, BASE_Y + 1.55, 6.7], look: KFACE }, { t: 7.0, pos: [-0.6, BASE_Y + 1.5, 5.9], look: KFACE }]);
const YFACE = [0.9, BASE_Y + 1.45, 6.2];
const duskC = cameraPath([
  { t: 7.0, pos: [0.45, BASE_Y + 1.5, 8.0], look: YFACE },
  { t: 8.3, pos: [0.4, BASE_Y + 1.55, 8.4], look: YFACE },
  { t: 9.2, pos: [0.3, BASE_Y + 1.9, 11.2], look: [0.9, BASE_Y + 1.3, 6.0] },
  { t: 10.0, pos: [0.6, BASE_Y + 1.55, 8.6], look: YFACE },
  { t: 10.95, pos: [0.65, BASE_Y + 1.5, 8.0], look: YFACE },
]);
export const camDusk = (t) => { if (t < 3.75) { const c = duskA(t); c.focus = V([0, 4, 6]); return c; } if (t < 7.0) { const c = duskB(t); c.focus = V(KFACE); return c; } const c = duskC(t); c.focus = V(YFACE); return c; };

// night one: low over the water, the dark lighthouse, ships drifting past
export const camNight1 = withFocus(cameraPath([{ t: 10.95, pos: [13, 4.2, 20], look: [-2, 7, -20] }, { t: 13.5, pos: [11, 4.0, 15], look: [-4, 6, -24] }, { t: 16.05, pos: [9, 3.8, 11], look: [-6, 5.5, -26] }]), [0, 4, -30]);

// beam: wide shot of the beam sweeping / from the lantern out to the thing / keeper on the gallery
const beamW = cameraPath([{ t: 25.0, pos: [-24, 4.0, -18], look: [0, 15, 0] }, { t: 27.0, pos: [-21, 3.4, -24], look: [0, 13, -8] }]);
const beamA = cameraPath([
  { t: 27.0, pos: [4.2, 26.2, 5.2], look: [-7, 12, -60] },
  { t: 27.9, pos: [7.5, 22.5, -9], look: [-1, 7, -60] },
  { t: 28.7, pos: [8.0, 9.5, -28], look: [0, 4.8, -60] },
  { t: 29.6, pos: [5.0, 5.4, -41], look: [0, 5.1, -60] },
  { t: 30.62, pos: [4.0, 5.0, -45], look: [0, 5.3, -60] },
]);
const beamB = cameraPath([{ t: 30.62, pos: [0.55, 22.7, 5.3], look: [0, 22.5, 2.35] }, { t: 31.6, pos: [0.4, 22.75, 4.6], look: [0, 22.6, 2.35] }, { t: 32.45, pos: [0.3, 22.8, 4.2], look: [0, 22.65, 2.35] }]);
export const camBeam = (t) => {
  let c;
  if (t < 27.0) { c = beamW(t); c.focus = V([0, 12, 0]); }
  else if (t < 30.62) { c = beamA(t); c.focus = V(CREATURE).add(V([0, 4.5, 7])); }
  else { c = beamB(t); c.focus = V([0, 22.6, 2.4]); }
  const nowT = w(8, 'NOW'); if (t > nowT && t < nowT + 0.35) { const s = (1 - (t - nowT) / 0.35) * 0.05; c.pos.x += Math.sin(t * 97) * s; c.pos.y += Math.sin(t * 71 + 2) * s; }
  return c;
};

// sink: low on the water, it goes back under, eyes on you until the end
export const camSink = withFocus(cameraPath([{ t: 33.55, pos: [2.2, 3.4, -35], look: [0, 4.2, -60] }, { t: 35.3, pos: [1.2, 2.6, -41], look: [0, 2.6, -60] }]), [0, 4, -53]);

// morning: keeper close-up on the jetty, YOU at his side
export const camMorning = withFocus(cameraPath([{ t: 39.8, pos: [-0.2, BASE_Y + 1.55, 7.2], look: [-0.2, BASE_Y + 1.4, 4.3] }, { t: 41.6, pos: [-0.5, BASE_Y + 1.5, 6.3], look: KFACE }, { t: 43.3, pos: [-0.65, BASE_Y + 1.48, 5.85], look: KFACE }]), KFACE);
