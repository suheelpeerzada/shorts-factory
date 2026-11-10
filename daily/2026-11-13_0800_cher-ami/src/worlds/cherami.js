// CHER AMI - the WWI pigeon who saved the Lost Battalion (Argonne, Oct 1918); 2021 DNA test: Cher Ami was male.
// Locations: hook (battle sky, pigeon flies at camera, flak), forest (Argonne, trapped men, ARGONNE 1918 / 500 TRAPPED),
// shelling (own shells land, pigeons shot down), major (close-up, Whittlesey launches Cher Ami), flight (hit, keeps flying,
// 25 MILES), hq (message read at HQ), rescue (guns stop, 194 walk out; medal + wooden leg), museum (glass case, DNA test, BOY).
import * as THREE from 'three';
import { toon, part, paintTexture, rng, INK } from '../lib/toon.js';
import { makePerson } from '../lib/char.js';
import { addLights } from '../Stage.jsx';
import { cameraPath } from '../lib/camera.js';
import { w, talking } from '../times.js';
import { ramp, smooth, pop, glow, sky, card, crate, clouds, ground, smoke, sandbags, hills, fogBank } from './common.js';

const V = (a) => new THREE.Vector3(...a);
const shake = (c, t, t0, d = 0.3, a = 0.05) => { if (t > t0 && t < t0 + d) { const s = (1 - (t - t0) / d) * a; c.pos.x += Math.sin(t * 97) * s; c.pos.y += Math.sin(t * 71 + 2) * s; } return c; };

const OLIVE = '#6b6a3a', OLIVE2 = '#55542c';
export const MAJOR = { skin: '#ecd2b8', hair: '#4a3426', moustache: '#4a3426', glasses: true, outfit: 'coat', jacket: OLIVE, jacket2: OLIVE2, pants: '#5a5a38', shoes: INK, hat: 'peaked', hatColor: OLIVE, hatColor2: INK, badge: '#e1ad35', seed: 81, height: 1.8 };
const SOLDIERS = [0, 1, 2, 3, 4, 5].map((i) => ({ skin: ['#f1d4b8', '#e8c8a8', '#c99a78', '#f6dfc8', '#8a5a3a', '#e9c7a6'][i], hair: ['#4a3426', '#2f2526', '#8a5a3a', '#2a1e1a', '#1a1412', '#6b4a32'][i], outfit: 'coat', jacket: OLIVE, jacket2: OLIVE2, pants: '#5a5a38', shoes: INK, hat: 'cap', hatColor: '#5a5a38', seed: 90 + i, height: 1.68 + (i % 3) * 0.05 }));
const CLERK = { skin: '#f6dfc8', hair: '#8a5a3a', outfit: 'coat', jacket: OLIVE, jacket2: OLIVE2, pants: '#5a5a38', shoes: INK, hat: 'none', seed: 99, height: 1.74 };
const SCI = { skin: '#f3d9c0', hair: '#2f2526', bun: true, glasses: true, outfit: 'coat', jacket: '#f4f1ea', jacket2: '#d8d4cc', shoes: INK, hat: 'none', seed: 101, height: 1.66 };

const LIGHT = {
  battle: { center: [0, 0, 0], key: [-40, 30, -60], keyColor: '#ffb070', keyI: 1.3, hemiI: 0.7, hemi: ['#8a6a5a', '#2a2420'], size: 40, fog: ['#5a4038', 30, 300] },
  grey: { center: [0, 0, 0], key: [-40, 60, 30], keyColor: '#f0e8dc', keyI: 1.3, hemiI: 0.9, hemi: ['#b0b4b8', '#4a4438'], size: 40, fog: ['#8a8c8e', 25, 260] },
  room: { center: [0, 0, 0], key: [-10, 20, 14], keyColor: '#ffe0b0', keyI: 0.7, hemiI: 0.6, hemi: ['#7a6040', '#2a1e14'], size: 10, fog: ['#1a140e', 25, 140] },
  museum: { center: [0, 0, 0], key: [-10, 20, 14], keyColor: '#ffffff', keyI: 1.0, hemiI: 1.0, hemi: ['#e8eef4', '#6a6a70'], size: 10, fog: ['#c8ccd0', 30, 160] },
};

// a cartoon pigeon, ~0.45 long, facing +x; returns {group, update(t, flap, opts)}
function pigeon({ hurt = false, patch = false, medal = false, peg = false } = {}) {
  const g = new THREE.Group(); const grey = toon('#8a93a3'), dark = toon('#5f6878');
  const body = part(new THREE.SphereGeometry(0.16, 16, 12), grey, [0, 0, 0], { outline: 0.012, edges: false }); body.scale.set(1.45, 0.95, 0.9); g.add(body);
  g.add(part(new THREE.SphereGeometry(0.1, 14, 10), toon('#5a8a7a'), [0.16, 0.08, 0], { outline: 0.008, edges: false }));
  const head = new THREE.Group(); head.position.set(0.25, 0.15, 0); g.add(head);
  head.add(part(new THREE.SphereGeometry(0.085, 14, 10), dark, [0, 0, 0], { outline: 0.008, edges: false }));
  const beak = part(new THREE.ConeGeometry(0.025, 0.08, 8), toon('#e1ad35'), [0.1, -0.01, 0], { rot: [0, 0, -Math.PI / 2], outline: 0.004, edges: false }); head.add(beak);
  for (const z of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 6), toon(z > 0 && patch ? '#2b2b33' : '#ff7a3a')); e.position.set(0.045, 0.025, z * 0.068); head.add(e); }
  if (patch) head.add(part(new THREE.BoxGeometry(0.07, 0.03, 0.02), toon('#f4ead2'), [0.04, 0.03, 0.078], { rot: [0, 0, -0.6], outline: 0.003, edges: false }));
  const tail = part(new THREE.BoxGeometry(0.16, 0.025, 0.12), dark, [-0.27, 0.02, 0], { rot: [0, 0, 0.25], outline: 0.006, edges: false }); g.add(tail);
  const wings = [];
  for (const z of [-1, 1]) { const wg = new THREE.Group(); wg.position.set(0.02, 0.08, z * 0.1); const m = part(new THREE.BoxGeometry(0.24, 0.02, 0.32), grey, [-0.02, 0, z * 0.16], { outline: 0.008, edges: false }); wg.add(m); wg.add(part(new THREE.BoxGeometry(0.06, 0.022, 0.3), dark, [-0.12, 0, z * 0.16], { outline: 0.004, edges: false })); g.add(wg); wings.push([wg, z]); }
  const legs = new THREE.Group(); legs.position.set(0, -0.14, 0); g.add(legs);
  legs.add(part(new THREE.CylinderGeometry(0.01, 0.01, 0.12, 6), toon('#d86a5a'), [0, -0.05, 0.04], { outline: 0.003, edges: false }));
  legs.add(part(new THREE.CylinderGeometry(peg ? 0.014 : 0.01, peg ? 0.014 : 0.01, 0.12, 6), toon(peg ? '#b08050' : '#d86a5a'), [0, -0.05, -0.04], { outline: 0.003, edges: false }));
  legs.add(part(new THREE.CylinderGeometry(0.022, 0.022, 0.06, 10), toon('#c9a25a'), [0, -0.02, 0.04], { outline: 0.004, edges: false })); // message canister
  if (hurt) { const blood = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), toon('#a3392d')); blood.position.set(0.12, -0.02, 0.13); g.add(blood); }
  let md = null; if (medal) { md = new THREE.Group(); md.add(part(new THREE.BoxGeometry(0.05, 0.06, 0.01), toon('#3a7a4a'), [0, 0.03, 0], { outline: 0.003, edges: false })); md.add(part(new THREE.CylinderGeometry(0.04, 0.04, 0.012, 14), toon('#e1ad35'), [0, -0.03, 0], { rot: [Math.PI / 2, 0, 0], outline: 0.004, edges: false })); md.position.set(0.15, 0.0, 0.14); g.add(md); }
  return { group: g, head, update(t, flap = 1, o = {}) {
    const a = flap ? Math.sin(t * 22) * 0.9 * flap : 0.05;
    wings.forEach(([wg, z]) => { wg.rotation.x = z * (flap ? a : -0.05); });
    legs.visible = !flap || o.legs; head.rotation.z = flap ? 0.1 : Math.sin(t * 3) * 0.12; head.position.x = 0.25 + (flap ? 0 : Math.max(0, Math.sin(t * 6)) * 0.02);
  } };
}
function tree(r, broken = false) {
  const g = new THREE.Group(); const h = broken ? 2 + r() * 2.5 : 5 + r() * 3;
  g.add(part(new THREE.CylinderGeometry(0.16, 0.26, h, 7), toon(broken ? '#4a3a2a' : '#5b4030'), [0, h / 2, 0], { rot: [0, 0, broken ? (r() - 0.5) * 0.3 : 0], outline: 0.015, edges: false }));
  if (!broken) for (let i = 0; i < 3; i++) g.add(part(new THREE.ConeGeometry(1.6 - i * 0.4, 2.2, 8), toon(['#4a5a32', '#56663a', '#5f7040'][i]), [0, h - 1 + i * 1.2, 0], { outline: 0.02, edges: false }));
  return g;
}
function forestSet(root, r, n = 40, R = 30) {
  for (let i = 0; i < n; i++) { const a = r() * Math.PI * 2, d = 6 + r() * R; const t = tree(r, r() < 0.4); t.position.set(Math.cos(a) * d, 0, Math.sin(a) * d - 4); root.add(t); }
  for (let i = 0; i < 6; i++) { const s = sandbags(4, 2, i); s.position.set(-6 + (i % 3) * 4.5, 0, -1.5 + Math.floor(i / 3) * -3); root.add(s); }
}
function blast(root, U, pos, t0, scale = 1) { // flash + fireball + smoke at t0
  const fl = new THREE.PointLight('#ffb060', 0, 30, 1.3); fl.position.set(pos[0], pos[1] + 1.5, pos[2]); root.add(fl);
  const ball = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), glow('#ffcf7a', 0.9)); ball.position.set(...pos); root.add(ball);
  const sm = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 10), toon('#4a4440')); sm.position.set(...pos); root.add(sm);
  U((t) => { const k = t - t0; ball.visible = k > 0 && k < 0.45; ball.scale.setScalar(scale * (0.5 + k * 5)); fl.intensity = k > 0 && k < 0.5 ? 400 * (1 - k / 0.5) : 0;
    sm.visible = k > 0.15 && k < 3.5; sm.scale.setScalar(scale * Math.min(2.4, 0.6 + k * 1.4)); sm.position.y = pos[1] + 0.5 + k * 1.2; });
}
const lerp3 = (a, b, k) => a.map((x, i) => x + (b[i] - x) * k);

export function makeCherAmi(id) {
  return function build(scene) {
    const root = new THREE.Group(); const r = rng(id.length * 17 + 3);
    const ups = []; const U = (f) => ups.push(f);
    const add = (o) => { root.add(o.group); return o; };
    const battleWorld = () => { addLights(scene, LIGHT.battle); root.add(sky('battle')); root.add(clouds('rgba(80,60,60,0.5)', 9, 70, 4)); root.add(ground('#5a4a3a', 'asphalt', 400, 60, 5)); root.add(hills('#4a4036', -120, 9, 30, 7)); };

    if (id === 'hook' || id === 'flight') {
      battleWorld(); forestSet(root, r, 50, 60);
      const bird = pigeon({ hurt: id === 'flight', patch: id === 'flight' }); bird.group.scale.setScalar(1); root.add(bird.group);
      const puffs = []; for (let i = 0; i < 6; i++) { const p = new THREE.Mesh(new THREE.SphereGeometry(0.5, 10, 8), toon('#5a5250')); root.add(p); puffs.push([p, r() * 6, (r() - 0.5) * 8, 3 + r() * 6]); }
      const feathers = []; for (let i = 0; i < 8; i++) { const f = part(new THREE.BoxGeometry(0.08, 0.01, 0.03), toon('#c8ccd4'), [0, 0, 0], { outline: 0.003, edges: false }); root.add(f); feathers.push(f); }
      const q = card(['?'], 1.2, 1.2, { sizes: [520], bg: '#f4ead2', fg: '#c9353a' }); root.add(q);
      const miles = card(['25 MILES'], 3.2, 1.1, { sizes: [260], bg: '#e1ad35' }); root.add(miles);
      const hitT = id === 'flight' ? w(2, '^hit') : 1e9;
      for (let i = 0; i < 4; i++) blast(root, U, [-10 + i * 7, 0, -18 - i * 5], (id === 'hook' ? 1.2 : 23) + i * 1.6, 1.4);
      U((t, cam) => {
        // flight path: hook = toward the camera; flight = along +x with altitude
        const p = id === 'hook' ? [Math.sin(t * 0.7) * 0.6, 4 + Math.sin(t * 1.3) * 0.2, -6 + t * 1.25] : [-6 + (t - 22.7) * 2.2, 5 + Math.sin(t * 1.1) * 0.4 - (t > hitT && t < hitT + 0.6 ? (t - hitT) * 1.5 : 0) + (t > hitT + 0.6 ? -0.9 + Math.min(0.9, (t - hitT - 0.6) * 0.6) : 0), 0];
        bird.group.position.set(...p); bird.group.rotation.y = id === 'hook' ? -Math.PI / 2 : 0; bird.group.rotation.z = id === 'flight' && t > hitT && t < hitT + 0.8 ? Math.sin(t * 30) * 0.4 : Math.sin(t * 1.3) * 0.08;
        bird.update(t, 1);
        puffs.forEach(([pp, ph, dx, dy], i) => { const k = ((t * 0.6 + ph) % 3) / 3; pp.visible = true; pp.position.set(p[0] + dx + (id === 'hook' ? 0 : 6), p[1] + dy - 3, p[2] - 6 - i); pp.scale.setScalar(0.2 + k * 0.7); });
        feathers.forEach((f, i) => { const k = t - hitT; f.visible = k > 0 && k < 2.5; f.position.set(p[0] - k * 1.5 + Math.sin(i * 2) * k * 0.6, p[1] - k * 0.8 + Math.cos(i) * k * 0.3, p[2] + Math.cos(i * 3) * k * 0.6); f.rotation.set(t * 5 + i, t * 3, i); });
        const wr = id === 'hook' ? w(0, '^wrong') : 1e9; q.visible = t > wr - 0.1; q.scale.setScalar(pop(ramp(t, wr - 0.1, wr + 0.2))); q.position.set(p[0] + 0.9, p[1] + 0.8, p[2]); q.lookAt(cam.position);
        const mi = id === 'flight' ? w(2, '^25') : 1e9; miles.visible = t > mi - 0.1; miles.scale.setScalar(pop(ramp(t, mi - 0.1, mi + 0.25))); miles.position.set(p[0] + 1.5, p[1] + 2.2, p[2]); miles.lookAt(cam.position);
      });
    }

    if (id === 'forest' || id === 'shelling') {
      battleWorld(); forestSet(root, r, 45, 40);
      const tag = card(['ARGONNE FOREST', 'OCTOBER 1918'], 3.4, 1.3, { sizes: [88, 88], bg: '#f4ead2' }); root.add(tag);
      const trapped = card(['500 MEN', 'TRAPPED'], 2.0, 1.1, { sizes: [170, 140], bg: '#c9353a', fg: '#f4ead2', border: '#f4ead2' }); root.add(trapped);
      const men = SOLDIERS.map((s) => add(makePerson(s, { tint: '#ffe0cc' })));
      const spots = [[-2.2, 0, 1.0], [-0.8, 0, 1.6], [0.6, 0, 1.1], [2.0, 0, 1.5], [-3.4, 0, -0.4], [3.2, 0, 0.2]];
      const birds = []; if (id === 'shelling') for (let i = 0; i < 2; i++) { const b = pigeon(); root.add(b.group); birds.push(b); }
      if (id === 'shelling') { [[-4, 0, -8], [5, 0, -6], [-1, 0, -12], [7, 0, -14], [-6, 0, -4]].forEach((pp, i) => blast(root, U, pp, w(0, '^artillery') + i * 0.75, 1.1)); }
      U((t, cam) => {
        const ar = w(0, '^October') ; const tk = ramp(t, ar - 0.05, ar + 0.3); tag.visible = id === 'forest' && tk > 0; tag.scale.setScalar(pop(tk)); tag.position.set(-1, 4.2, -2); tag.lookAt(cam.position);
        const tr = w(0, '^trapped'); const k2 = ramp(t, tr - 0.1, tr + 0.2); trapped.visible = id === 'forest' && k2 > 0; trapped.scale.setScalar(pop(k2)); trapped.position.set(1.2, 2.9, 0.4); trapped.lookAt(cam.position);
        const sh = w(0, '^shelling');
        men.forEach((m, i) => { m.group.position.set(...spots[i]); m.update(t + i * 0.4, cam.position, 0, { expr: id === 'shelling' ? (t > sh ? 'scared' : 'alarmed') : 'sad', gesture: id === 'shelling' && t > sh ? 'scared' : 'idle' }); });
        birds.forEach((b, i) => { const t0 = w(0, '^pigeons') - 0.6 + i * 0.5, k = t - t0; b.group.visible = k > 0 && k < 3; const down = k > 0.9 + i * 0.2; b.group.position.set(-1 + i * 2 + k * 1.2, 1.5 + Math.min(k, 0.9 + i * 0.2) * 3 - (down ? (k - 0.9 - i * 0.2) ** 2 * 6 : 0), 0.5); b.group.rotation.z = down ? -k * 4 : 0.3; b.update(t, down ? 0 : 1); });
      });
    }

    if (id === 'major') {
      battleWorld(); forestSet(root, r, 35, 30);
      const mj = add(makePerson(MAJOR, { tint: '#ffe0cc' })); const bird = pigeon(); root.add(bird.group);
      const name = card(['CHER AMI'], 1.0, 0.32, { sizes: [160], bg: '#f4ead2' }); root.add(name);
      for (let i = 0; i < 2; i++) blast(root, U, [-5 + i * 9, 0, -10], 19.6 + i * 1.3, 1.2);
      U((t, cam) => {
        mj.group.position.set(0, 0, 0.6); const go = w(1, '^Fly');
        mj.update(t, cam.position, 0, { talk: talking(t, 'MAJOR') ? 1 : 0, expr: t > w(1, '^Go') - 0.1 ? 'shout' : 'alarmed', gesture: t < go ? 'hold' : 'lift' });
        const k = Math.max(0, t - go); bird.group.position.set(0.0 + k * 0.8, 1.15 + (t > go ? k * 3.2 : 0), 0.75); bird.group.rotation.y = -0.4; bird.update(t, t > go - 0.1 ? 1 : 0);
        name.visible = t > 19.3 && t < go + 0.3; name.scale.setScalar(pop(ramp(t, 19.3, 19.6))); name.position.set(-0.3, 1.75, 0.8); name.lookAt(cam.position);
      });
    }

    if (id === 'hq') {
      addLights(scene, LIGHT.room);
      const room = new THREE.Group(); root.add(room);
      room.add(part(new THREE.BoxGeometry(7, 0.2, 6), toon('#ffffff', paintTexture({ base: '#6b4a32', kind: 'planks', seed: 8, repeat: [4, 3] })), [0, -0.1, 0], { outline: 0.01, edges: false }));
      room.add(part(new THREE.BoxGeometry(7, 3.4, 0.2), toon('#7a7a5a'), [0, 1.7, -2.2], { outline: 0.02, edges: false }));
      room.add(part(new THREE.BoxGeometry(0.2, 3.4, 6), toon('#7a7a5a'), [-3.2, 1.7, 0], { outline: 0.02, edges: false }));
      const loft = new THREE.Group(); loft.position.set(-2.0, 0, -1.7); room.add(loft);
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { loft.add(part(new THREE.BoxGeometry(0.55, 0.45, 0.4), toon('#9a6b42'), [i * 0.6, 0.4 + j * 0.5, 0], { outline: 0.01 })); }
      const map = card(['ARGONNE', '— LINES —'], 1.4, 1.0, { sizes: [130, 90], bg: '#e8dcb8' }); map.position.set(0.8, 1.9, -2.08); room.add(map);
      const desk = part(new THREE.BoxGeometry(2.0, 0.8, 0.9), toon('#5a3a22'), [0.4, 0.4, -0.5], { outline: 0.015 }); room.add(desk);
      const lamp = new THREE.PointLight('#ffb866', 6, 7, 1.5); lamp.position.set(0.9, 1.6, -0.3); room.add(lamp);
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), glow('#ffe2a0')); bulb.position.set(0.9, 1.4, -0.6); room.add(bulb);
      const msg = card(['OUR ARTILLERY IS', 'DROPPING A BARRAGE', 'DIRECTLY ON US.', "FOR HEAVEN'S SAKE", 'STOP IT.'], 1.1, 1.0, { sizes: [72, 72, 72, 72, 90], bg: '#f4ead2' }); root.add(msg);
      const bird = pigeon({ hurt: true, patch: true }); bird.group.position.set(-0.3, 0.86, -0.4); bird.group.rotation.y = 0.5; room.add(bird.group);
      const ck = add(makePerson(CLERK, { tint: '#ffe8d0' }));
      U((t, cam) => {
        ck.group.position.set(0.6, 0, 0.1); const so = w(3, '^stop');
        ck.update(t, cam.position, 0, { expr: t > so - 0.2 ? 'shout' : 'alarmed', gesture: t > so ? 'phone' : [[-1e9, 'holdR', { prop: 'paper' }]], prop: t > so ? 'phone' : undefined });
        const k = ramp(t, 31.2, 31.6); msg.visible = k > 0; msg.scale.setScalar(pop(k)); msg.position.set(0.15, 1.55, 0.55); msg.lookAt(cam.position);
        bird.update(t, 0);
      });
    }

    if (id === 'rescue') {
      addLights(scene, LIGHT.grey); root.add(sky('grey')); root.add(clouds('rgba(220,224,230,0.6)', 10, 80, 6)); root.add(ground('#6a5a46', 'asphalt', 400, 60, 5)); root.add(hills('#5a5244', -120, 9, 30, 7));
      forestSet(root, r, 40, 40);
      const men = SOLDIERS.map((s) => add(makePerson(s)));
      const n194 = card(['194', 'WALK OUT ALIVE'], 3.2, 1.7, { sizes: [300, 120], bg: '#3a7a4a', fg: '#f4ead2', border: '#f4ead2' }); root.add(n194);
      // medal / wooden-leg stage (after the inner cut at 42.0), far from the forest
      const st = new THREE.Group(); st.position.set(0, 0, 60); root.add(st);
      st.add(part(new THREE.BoxGeometry(5, 0.3, 3), toon('#7a5236'), [0, 0.15, 0], { outline: 0.02 }));
      st.add(part(new THREE.CylinderGeometry(0.05, 0.05, 1.0, 8), toon('#5a3a22'), [0, 0.8, 0], { outline: 0.008, edges: false }));
      st.add(part(new THREE.BoxGeometry(0.5, 0.04, 0.06), toon('#5a3a22'), [0, 1.3, 0], { outline: 0.006, edges: false }));
      for (const x of [-1.6, 1.6]) { const f = new THREE.Group(); f.position.set(x, 0.3, -0.8); f.add(part(new THREE.CylinderGeometry(0.03, 0.03, 2.4, 6), toon('#5a3a22'), [0, 1.2, 0], { outline: 0.006, edges: false })); const fl = card([''], 0.9, 0.6, { bg: x < 0 ? '#3f6fbf' : '#c9353a', border: '#f4ead2' }); fl.position.set(0.47, 2.1, 0); f.add(fl); st.add(f); }
      const hero = pigeon({ hurt: false, patch: true, medal: true, peg: true }); hero.group.position.set(0, 1.47, 0); hero.group.scale.setScalar(1.3); st.add(hero.group);
      const tags = [card(['MEDAL'], 0.9, 0.3, { sizes: [220], bg: '#e1ad35' }), card(['WOODEN LEG'], 1.0, 0.27, { sizes: [115], bg: '#f4ead2' }), card(['MUSEUM'], 1.0, 0.3, { sizes: [200], bg: '#f4ead2' })]; tags.forEach((c) => st.add(c));
      U((t, cam) => {
        const walk = Math.max(0, t - w(4, '^194'));
        men.forEach((m, i) => { m.group.position.set(-3 + (i % 3) * 1.4 + (i > 2 ? 0.6 : 0), 0, -6 + walk * 1.1 + (i > 2 ? -1.6 : 0)); m.update(t + i * 0.3, cam.position, walk > 0 ? 1.4 : 0, { expr: t > 37.3 ? 'grin' : 'sad', gesture: walk > 0 ? 'walk' : 'idle' }); });
        const nk = ramp(t, w(4, '^194') - 0.05, w(4, '^194') + 0.3); n194.visible = nk > 0 && t < 42; n194.scale.setScalar(pop(nk)); n194.position.set(0, 3.6, -2 + walk * 1.1); n194.lookAt(cam.position);
        hero.update(t, 0); hero.group.rotation.y = -0.5 + Math.sin(t * 0.8) * 0.15;
        [w(4, '^medal'), w(4, '^wooden'), w(4, '^museum')].forEach((tt, i) => { const c = tags[i]; const k = ramp(t, tt - 0.05, tt + 0.25); c.visible = k > 0; c.scale.setScalar(pop(k)); c.position.set([-0.55, 0.6, 0][i], [1.95, 1.2, 2.3][i], 0.3); c.lookAt(cam.position); });
      });
    }

    if (id === 'museum') {
      addLights(scene, LIGHT.museum);
      root.add(part(new THREE.BoxGeometry(10, 0.2, 8), toon('#ffffff', paintTexture({ base: '#b8a88a', kind: 'planks', seed: 4, repeat: [5, 4] })), [0, -0.1, 0], { outline: 0.01, edges: false }));
      root.add(part(new THREE.BoxGeometry(10, 4, 0.2), toon('#d8d0c0'), [0, 2, -2.6], { outline: 0.02, edges: false }));
      const sign = card(['SMITHSONIAN', '2021'], 2.6, 0.9, { sizes: [170, 130], bg: '#2b3a5a', fg: '#f4ead2', border: '#f4ead2' }); sign.position.set(-1.6, 3.0, -2.48); root.add(sign);
      root.add(part(new THREE.BoxGeometry(1.0, 1.0, 0.8), toon('#5a3a22'), [0, 0.5, -0.6], { outline: 0.015 }));
      const glass = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.8, 0.7), new THREE.MeshBasicMaterial({ color: '#cfe6f2', transparent: true, opacity: 0.18, depthWrite: false })); glass.position.set(0, 1.4, -0.6); root.add(glass);
      root.add(part(new THREE.BoxGeometry(0.92, 0.04, 0.72), toon('#c9a25a'), [0, 1.81, -0.6], { outline: 0.005, edges: false }));
      const bird = pigeon({ patch: true, medal: true, peg: true }); bird.group.position.set(0, 1.18, -0.6); bird.group.rotation.y = -0.3; root.add(bird.group);
      const plaque = card(['CHER AMI', 'HER WAR HERO'], 0.8, 0.34, { sizes: [150, 110], bg: '#e1ad35' }); plaque.position.set(0, 0.72, -0.19); root.add(plaque);
      const fix = card(['CHER AMI', 'HIS WAR HERO'], 0.8, 0.34, { sizes: [150, 110], bg: '#e1ad35' }); fix.position.set(0, 0.72, -0.185); root.add(fix);
      const dna = card(['DNA TEST', 'RESULT: MALE'], 1.1, 0.62, { sizes: [130, 110], bg: '#f4ead2' }); root.add(dna);
      const boy = card(['HE!'], 0.9, 0.55, { sizes: [380], bg: '#3f6fbf', fg: '#f4ead2', border: '#f4ead2' }); root.add(boy);
      const sci = add(makePerson(SCI));
      U((t, cam) => {
        const ds = w(4, '^DNA'), by = w(4, '^boy');
        sci.group.position.set(1.0, 0, 0.1); sci.update(t, cam.position, 0, { expr: t > by - 0.2 ? 'smug' : t > ds ? 'alarmed' : 'calm', gesture: t > ds - 0.2 && t < by - 0.3 ? [[-1e9, 'holdR', { prop: 'paper' }]] : t >= by - 0.3 ? [[-1e9, 'point', { angle: -0.1 }]] : 'idle' });
        const k = ramp(t, ds - 0.05, ds + 0.25); dna.visible = k > 0 && t < by; dna.scale.setScalar(pop(k)); dna.position.set(0.6, 1.9, 0.05); dna.lookAt(cam.position);
        plaque.visible = t < by; fix.visible = t >= by;
        const bk = ramp(t, by - 0.05, by + 0.2); boy.visible = bk > 0; boy.scale.setScalar(pop(bk)); boy.position.set(0, 2.2, -0.45); boy.lookAt(cam.position);
        bird.update(t, 0);
      });
    }

    return { root, update(t, camera) { ups.forEach((f) => f(t, camera)); } };
  };
}

// ---------- cameras ----------
const P = (pts) => cameraPath(pts);
// hook: bird flies from z=-6 toward the camera (z grows 1.25/s); camera retreats in front of it
const hkO = P([{ t: 0, pos: [0.9, 0.35, 1.9], look: [0, 0.05, 0] }, { t: 4.0, pos: [-0.8, 0.2, 1.5], look: [0, 0.05, 0] }, { t: 8.6, pos: [1.2, 0.6, 2.6], look: [0, 0.1, 0] }]);
export const camHook = (t) => { const o = hkO(t), b = V([Math.sin(t * 0.7) * 0.6, 4 + Math.sin(t * 1.3) * 0.2, -6 + t * 1.25]); const c = { pos: o.pos.clone().add(b), look: o.look.clone().add(b) }; c.focus = V([Math.sin(t * 0.7) * 0.6, 4, -6 + t * 1.25]); return shake(c, t, 1.2, 0.3, 0.05); };
const foP = P([{ t: 8.6, pos: [-6, 6, 10], look: [0, 1.5, 0] }, { t: 11.4, pos: [-2, 2.6, 6.5], look: [0, 1.6, 0.8] }, { t: 14.3, pos: [1.6, 1.8, 4.4], look: [0.4, 1.4, 1.0] }]);
export const camForest = (t) => { const c = foP(t); c.focus = V([0, 1.5, 1.0]); return c; };
const shP = P([{ t: 14.3, pos: [2.4, 2.2, 6.0], look: [0, 1.8, -6] }, { t: 16.8, pos: [0.4, 1.8, 5.2], look: [-0.4, 1.6, -2] }, { t: 19.0, pos: [-0.6, 2.4, 5.4], look: [0.2, 3.4, 0.5] }]);
export const camShelling = (t) => { const c = shP(t); c.focus = V(t < 17.4 ? [0, 1.5, 0.5] : [0.4, 3, 0.5]); for (let i = 0; i < 5; i++) shake(c, t, w(0, '^artillery') + i * 0.75, 0.35, 0.12); return c; };
const mjP = P([{ t: 19.0, pos: [0.9, 1.5, 2.6], look: [0.0, 1.35, 0.7] }, { t: 21.4, pos: [0.55, 1.35, 1.9], look: [0.0, 1.3, 0.7] }, { t: 22.7, pos: [1.6, 2.1, 3.4], look: [0.9, 3.3, 0.8] }]);
export const camMajor = (t) => { const c = mjP(t); c.focus = V([0, 1.35, 0.7]); return c; };
// flight: bird x = -6 + (t-22.7)*2.2 at y~5; camera tracks alongside, then wide at 27.4
export const camFlight = (t) => {
  const bx = -6 + (t - 22.7) * 2.2;
  let c; if (t < 27.4) { const u = smooth(ramp(t, 22.7, 27.4)); c = { pos: V([bx + 0.9 - u * 0.4, 5.15 + u * 0.15, 1.3 + u * 0.4]), look: V([bx, 4.95, 0]) }; }
  else { const u = smooth(ramp(t, 27.4, 30.6)); c = { pos: V([bx - 7 + u * 3, 8 - u * 1.5, 12 - u * 2]), look: V([bx + 1, 5.5, 0]) }; }
  c.focus = V([bx, 5, 0]); return shake(c, t, w(2, '^hit'), 0.4, 0.15);
};
const hqP = P([{ t: 30.6, pos: [1.8, 1.9, 3.4], look: [0, 1.3, -0.6] }, { t: 32.6, pos: [0.9, 1.65, 2.3], look: [0.25, 1.5, 0.4] }, { t: 35.2, pos: [1.1, 1.6, 2.0], look: [0.4, 1.5, 0.2] }, { t: 37.2, pos: [1.7, 1.7, 2.4], look: [0.6, 1.5, 0.1] }]);
export const camHq = (t) => { const c = hqP(t); c.focus = V(t < 32 ? [-0.3, 0.9, -0.4] : [0.3, 1.5, 0.4]); return c; };
const rsA = P([{ t: 37.2, pos: [3, 3.4, 10], look: [0, 1.5, -4] }, { t: 40.0, pos: [1.4, 2.0, 6.5], look: [-0.6, 1.6, -1] }, { t: 42.0, pos: [0.8, 1.7, 5.4], look: [-0.6, 1.5, 0] }]);
const rsB = P([{ t: 42.0, pos: [1.6, 2.0, 64.2], look: [0, 1.6, 60] }, { t: 44.2, pos: [1.0, 1.8, 63.6], look: [0, 1.6, 60] }, { t: 46.1, pos: [0.7, 1.9, 63.2], look: [0, 1.7, 60] }]);
export const camRescue = (t) => { const c = t < 42 ? rsA(t) : rsB(t); c.focus = V(t < 42 ? [-0.6, 1.5, -2 + Math.max(0, t - w(4, '^194')) * 1.1] : [0, 1.5, 60]); return c; };
const muP = P([{ t: 46.1, pos: [-1.6, 2.2, 3.6], look: [0, 1.4, -0.6] }, { t: 48.8, pos: [0.4, 1.7, 2.8], look: [0.5, 1.5, -0.2] }, { t: 50.6, pos: [0.3, 1.5, 1.6], look: [0, 1.3, -0.5] }, { t: 52.86, pos: [0.25, 1.45, 1.25], look: [0, 1.35, -0.55] }]);
export const camMuseum = (t) => { const c = muP(t); c.focus = V(t < 50.2 ? [0.6, 1.5, 0] : [0, 1.25, -0.6]); return c; };
