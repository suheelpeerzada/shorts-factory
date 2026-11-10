// VICTOR LUSTIG - the con man who "sold" the Eiffel Tower for scrap (Paris, 1925).
// Locations: hook (tower at dusk, SOLD sign, Lustig with the deed), paris (grey day, rusty tower, PARIS 1925, newspaper),
// desk (fake ministry letters, stamp, envelopes fly), hotel (luxury room, 5 dealers, tower board, 7,000 TONS),
// couple (street: Poisson + suspicious wife, then Lustig whispers), deal (cafe: bribe + price, then Lustig flees to the
// Vienna train), shame (Poisson's office, framed deed, facepalm, finger to lips), tower (night, Lustig is back, SOLD again).
import * as THREE from 'three';
import { toon, part, paintTexture, rng, INK } from '../lib/toon.js';
import { makePerson } from '../lib/char.js';
import { addLights } from '../Stage.jsx';
import { cameraPath } from '../lib/camera.js';
import { w, talking } from '../times.js';
import { ramp, smooth, pop, glow, sky, card, crate, clouds, ground, fogBank } from './common.js';
import { house } from '../lib/kit.js';

const V = (a) => new THREE.Vector3(...a);
const shake = (c, t, t0, d = 0.3, a = 0.05) => { if (t > t0 && t < t0 + d) { const s = (1 - (t - t0) / d) * a; c.pos.x += Math.sin(t * 97) * s; c.pos.y += Math.sin(t * 71 + 2) * s; } return c; };

export const LUSTIG = { skin: '#ecd2b8', hair: '#2a1e1a', moustache: '#2a1e1a', jacket: '#2b2f3a', jacket2: '#20232c', pants: '#2b2b33', shoes: INK, tie: '#c9353a', hat: 'bowler', hatColor: '#1f1f26', seed: 31, height: 1.78 };
export const POISSON = { skin: '#e9c7a6', hair: '#6b5a4a', brows: '#5a4a3a', moustache: '#6b5a4a', jacket: '#7a5236', jacket2: '#5f3f28', pants: '#3b3640', shoes: INK, tie: '#3f6f8f', hat: 'cap', hatColor: '#4a4a52', seed: 44, height: 1.66 };
const WIFE = { skin: '#f3d9c0', hair: '#8a5a3a', bun: true, outfit: 'coat', jacket: '#7a2f3a', jacket2: '#5f2430', shoes: INK, hat: 'none', seed: 52, height: 1.6 };
const DEALERS = [
  { skin: '#f1d4b8', hair: '#4a3426', jacket: '#3f6f8f', jacket2: '#2f5470', pants: '#3b3640', shoes: INK, tie: '#e1ad35', hat: 'bowler', hatColor: '#3a3236', seed: 71, height: 1.72 },
  { skin: '#e8c8a8', hair: '#e8e2d6', brows: '#e8e2d6', moustache: '#ece8e0', old: true, jacket: '#6f8f5a', jacket2: '#55703f', pants: '#3b3640', shoes: INK, tie: '#a8352b', hat: 'none', glasses: true, seed: 72, height: 1.68 },
  { skin: '#f6dfc8', hair: '#8a5a3a', jacket: '#7a5aa0', jacket2: '#5d4380', pants: '#353040', shoes: INK, tie: '#f3ead6', hat: 'cap', hatColor: '#2f3a4a', seed: 73, height: 1.74 },
  { skin: '#e9c7a6', hair: '#2f2526', beard: '#2f2526', jacket: '#d18b3a', jacket2: '#a96a2a', pants: '#4a4252', shoes: INK, tie: '#3f6f8f', hat: 'bowler', hatColor: '#2b2b33', seed: 74, height: 1.7 },
];

const LIGHT = {
  dusk: { center: [0, 0, 0], key: [50, 40, -30], keyColor: '#ffc89a', keyI: 1.5, hemiI: 0.8, hemi: ['#8a7aa8', '#3a2a3a'], size: 40, fog: ['#6a5070', 80, 520] },
  day: { center: [0, 0, 0], key: [-40, 60, 40], keyColor: '#fff0dc', keyI: 1.6, hemiI: 1.05, hemi: ['#c8d0d8', '#6a6a62'], size: 44, fog: ['#b9bfc6', 70, 460] },
  night: { center: [0, 0, 0], key: [-40, 50, -60], keyColor: '#9fb4d8', keyI: 0.7, hemiI: 0.5, hemi: ['#3a4a6a', '#141826'], size: 40, fog: ['#141826', 60, 420] },
  room: { center: [0, 0, 0], key: [-10, 20, 14], keyColor: '#ffe0b0', keyI: 0.7, hemiI: 0.6, hemi: ['#7a6040', '#2a1e14'], size: 10, fog: ['#1a140e', 25, 140] },
};

// beam between two points (square cross-section)
function beam(a, b, r, mat, outline = 0.02) {
  const A = V(a), B = V(b), len = A.distanceTo(B);
  const m = part(new THREE.CylinderGeometry(r, r, len, 4), mat, [0, 0, 0], { outline, edges: false });
  m.position.copy(A).add(B).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
  return m;
}
// the Eiffel Tower, base centred at the origin, 60 units tall
function eiffel({ lit = false, rust = false } = {}) {
  const g = new THREE.Group(); const iron = toon('#8a5f3c'), dark = toon('#6a4630');
  const L = [[0, 11], [12, 6.5], [28, 3.0], [52, 0.75]], legR = [0.95, 0.6, 0.32], brR = [0.16, 0.12, 0.07];
  const C = [[1, 1], [1, -1], [-1, -1], [-1, 1]];
  for (let s = 0; s < 3; s++) {
    const [y0, h0] = L[s], [y1, h1] = L[s + 1];
    for (const [sx, sz] of C) g.add(beam([sx * h0, y0, sz * h0], [sx * h1, y1, sz * h1], legR[s], iron, 0.04));
    const n = s === 2 ? 6 : 4;
    for (let k = 0; k < n; k++) {
      const ya = y0 + ((y1 - y0) * k) / n, yb = y0 + ((y1 - y0) * (k + 1)) / n, ha = h0 + ((h1 - h0) * k) / n, hb = h0 + ((h1 - h0) * (k + 1)) / n;
      for (let f = 0; f < 4; f++) {
        const [ax, az] = C[f], [bx, bz] = C[(f + 1) % 4];
        g.add(beam([ax * ha, ya, az * ha], [bx * hb, yb, bz * hb], brR[s], dark, 0.012));
        g.add(beam([bx * ha, ya, bz * ha], [ax * hb, yb, az * hb], brR[s], dark, 0.012));
        g.add(beam([ax * hb, yb, az * hb], [bx * hb, yb, bz * hb], brR[s] * 0.9, dark, 0.01));
      }
    }
  }
  g.add(part(new THREE.BoxGeometry(15.5, 1.5, 15.5), iron, [0, 12.4, 0], { outline: 0.05 }));
  g.add(part(new THREE.BoxGeometry(16.2, 0.4, 16.2), dark, [0, 13.3, 0], { outline: 0.02, edges: false }));
  g.add(part(new THREE.BoxGeometry(7.6, 1.1, 7.6), iron, [0, 28.3, 0], { outline: 0.04 }));
  g.add(part(new THREE.BoxGeometry(2.4, 2.2, 2.4), iron, [0, 53, 0], { outline: 0.03 }));
  g.add(part(new THREE.CylinderGeometry(0.12, 0.3, 7, 8), dark, [0, 57.5, 0], { outline: 0.012, edges: false }));
  for (let f = 0; f < 4; f++) { // base arches
    const a = new THREE.Mesh(new THREE.TorusGeometry(7.6, 0.42, 6, 28, Math.PI), iron); a.position.set(0, 1.5, 0); const holder = new THREE.Group(); holder.rotation.y = (f * Math.PI) / 2; a.position.z = 9.3; holder.add(a); g.add(holder);
  }
  if (lit) for (const [y, h] of [[13.6, 8.1], [28.9, 3.9], [54.2, 1.3]]) for (let i = 0; i < 16; i++) {
    const s = (i / 16) * 4, f = Math.floor(s), u = s - f, [ax, az] = C[f], [bx, bz] = C[(f + 1) % 4];
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), glow('#ffd98a')); b.position.set((ax + (bx - ax) * u) * h, y, (az + (bz - az) * u) * h); g.add(b);
  }
  if (lit) { const l = new THREE.PointLight('#ffcf7a', 60, 40, 1.4); l.position.set(0, 14, 10); g.add(l); }
  if (rust) { const r = rng(5); for (let i = 0; i < 26; i++) { const y = 1 + r() * 26, h = y < 12 ? 11 - (4.5 * y) / 12 : 6.5 - (3.5 * (y - 12)) / 16; const [sx, sz] = C[Math.floor(r() * 4)]; const m = part(new THREE.SphereGeometry(0.5 + r() * 0.7, 8, 6), toon(r() > 0.5 ? '#c4642a' : '#a84e22'), [sx * h + (r() - 0.5) * 0.6, y, sz * h + (r() - 0.5) * 0.6], { outline: 0.01, edges: false }); m.scale.set(1, 0.6, 1); g.add(m); } }
  return g;
}
// a ring of Paris houses (cream stone, grey roofs), leaving the camera side open
function paris(r, rad = 46, n = 14) {
  const g = new THREE.Group(); const cols = ['#e8dcc0', '#ddcfb0', '#efe4cc', '#d8c8a4'];
  for (let i = 0; i < n; i++) {
    const a = Math.PI * 0.62 + (i / (n - 1)) * Math.PI * 1.76; const rr = rad + r() * 18;
    const h = house({ w: 8 + r() * 3, h: 9 + r() * 5, d: 7, color: cols[i % 4], roof: '#5a6270', seed: 10 + i });
    h.position.set(Math.cos(a) * rr, 0, Math.sin(a) * rr); h.lookAt(0, 0, 0); g.add(h);
  }
  return g;
}
function lampPost(col = '#ffd98a') {
  const g = new THREE.Group(); g.add(part(new THREE.CylinderGeometry(0.06, 0.09, 3, 8), toon('#2b2b33'), [0, 1.5, 0], { outline: 0.012, edges: false }));
  const b = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 8), glow(col)); b.position.y = 3.1; g.add(b); const l = new THREE.PointLight('#ffcf7a', 7, 8, 1.5); l.position.y = 3.1; g.add(l); return g;
}
function table(w = 1.4, d = 0.9, top = '#7a5236', cloth = null) {
  const g = new THREE.Group(); g.add(part(new THREE.BoxGeometry(w, 0.08, d), toon(cloth || top), [0, 0.76, 0], { outline: 0.015 }));
  for (const [x, z] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) g.add(part(new THREE.BoxGeometry(0.07, 0.76, 0.07), toon('#4a3020'), [x * (w / 2 - 0.08), 0.38, z * (d / 2 - 0.08)], { outline: 0.008, edges: false }));
  return g;
}
const SOLD = () => card(['SOLD!'], 6, 2.6, { sizes: [290], bg: '#c9353a', fg: '#f4ead2', border: '#f4ead2' });

export function makeLustig(id) {
  return function build(scene) {
    const root = new THREE.Group(); const r = rng(id.length * 13 + 5);
    const ups = []; const U = (f) => ups.push(f);
    const add = (o) => { root.add(o.group); return o; };

    if (id === 'hook' || id === 'tower') {
      const night = id === 'tower';
      addLights(scene, night ? LIGHT.night : LIGHT.dusk); root.add(sky(night ? 'night' : 'dusk')); root.add(clouds(night ? 'rgba(40,50,80,0.5)' : 'rgba(255,190,170,0.45)', 8, 90, 3));
      root.add(ground('#8a8070', 'asphalt', 500, 80, 4)); root.add(eiffel({ lit: true })); root.add(paris(r));
      for (const x of [-6, 6]) { const lp = lampPost(); lp.position.set(x, 0, 19); root.add(lp); }
      const sign = SOLD(); sign.position.set(0, 6.6, 10.4); root.add(sign);
      const rope1 = beam([-2.6, 7.9, 10.4], [-2.2, 11.6, 9.4], 0.04, toon('#c9a25a'), 0.005), rope2 = beam([2.6, 7.9, 10.4], [2.2, 11.6, 9.4], 0.04, toon('#c9a25a'), 0.005); root.add(rope1, rope2);
      const lu = add(makePerson(LUSTIG, { tint: night ? '#dfe6f4' : '#ffe6d6' }));
      U((t, cam) => {
        sign.rotation.z = Math.sin(t * 1.6) * 0.04;
        if (!night) {
          sign.visible = true; sign.scale.setScalar(pop(ramp(t, 0.15, 0.55)));
          lu.group.position.set(2.6, 0, 18);
          lu.update(t, cam.position, 0, { expr: t > w(0, '^police') ? 'smug' : 'grin', gesture: t < w(0, '^and$') ? [[-1e9, 'holdR', { prop: 'paper' }]] : t < w(0, '^Why') ? 'shrug' : 'hips' });
        } else {
          const ag = w(4, '^again'); sign.visible = t > ag - 0.1; sign.scale.setScalar(pop(ramp(t, ag - 0.1, ag + 0.25)));
          const k = smooth(ramp(t, 49.1, 51.0)); lu.group.position.set(-3 + 5.6 * k, 0, 21 - 3 * k);
          lu.update(t, cam.position, t < 51.0 ? 1.5 : 0, { expr: t > w(4, '^back') ? 'smug' : 'grin', gesture: t < 51.0 ? [[-1e9, 'holdR', { prop: 'suitcase' }]] : t < ag ? 'point' : 'hips' });
        }
      });
    }

    if (id === 'paris') {
      addLights(scene, LIGHT.day); root.add(sky('grey')); root.add(clouds('rgba(220,224,230,0.6)', 10, 80, 6));
      root.add(ground('#8a8478', 'asphalt', 500, 80, 6)); root.add(eiffel({ rust: true })); root.add(paris(r));
      const tag = card(['PARIS', '1925'], 14, 6, { sizes: [300, 240], bg: '#f4ead2' }); tag.position.set(-4, 31, 6); root.add(tag);
      const news = card(['LE PETIT PARISIEN', 'TOWER IS RUSTING', 'REPAIRS COST A FORTUNE'], 2.2, 1.55, { sizes: [66, 76, 58], bg: '#f4ead2' }); root.add(news);
      const bench = part(new THREE.BoxGeometry(2.2, 0.12, 0.6), toon('#4a6a4a'), [3.2, 0.48, 20], { outline: 0.015 }); root.add(bench);
      const lp = lampPost(); lp.position.set(5.2, 0, 19.5); root.add(lp);
      const lu = add(makePerson(LUSTIG));
      U((t, cam) => {
        const tk = ramp(t, w(0, '^Paris') - 0.05, w(0, '^Paris') + 0.3); tag.visible = tk > 0; tag.scale.setScalar(pop(tk)); tag.lookAt(cam.position);
        const nk = ramp(t, w(0, '^repairs') - 0.1, w(0, '^repairs') + 0.25); news.visible = nk > 0; news.scale.setScalar(pop(nk));
        news.position.set(3.0, 1.75, 20.7); news.rotation.set(-0.1, 0.1, Math.sin(t * 2) * 0.02);
        lu.group.position.set(3.0, 0, 20.1); lu.update(t, cam.position, 0, { expr: t > w(0, '^fortune') ? 'smug' : 'neutral', gesture: 'hold' });
      });
    }

    if (id === 'desk' || id === 'shame') {
      addLights(scene, LIGHT.room);
      const room = new THREE.Group(); root.add(room);
      room.add(part(new THREE.BoxGeometry(7, 0.2, 6), toon('#ffffff', paintTexture({ base: '#6b4a32', kind: 'planks', seed: 8, repeat: [4, 3] })), [0, -0.1, 0], { outline: 0.01, edges: false }));
      const wall = toon(id === 'desk' ? '#4a5a4a' : '#8a6a4a');
      room.add(part(new THREE.BoxGeometry(7, 3.4, 0.2), wall, [0, 1.7, -2.2], { outline: 0.02, edges: false }));
      room.add(part(new THREE.BoxGeometry(0.2, 3.4, 6), wall, [-3.2, 1.7, 0], { outline: 0.02, edges: false }));
      const win = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.6), glow(id === 'desk' ? '#3a4a7a' : '#9fb4c8')); win.position.set(1.8, 1.9, -2.08); room.add(win);
      room.add(part(new THREE.BoxGeometry(1.36, 0.1, 0.1), toon('#3a2a1a'), [1.8, 1.9, -2.05], { outline: 0.006, edges: false }));
      const desk = new THREE.Group(); desk.add(part(new THREE.BoxGeometry(2.2, 0.1, 1.0), toon('#5a3a22'), [0, 0.78, 0], { outline: 0.015 })); desk.add(part(new THREE.BoxGeometry(2.1, 0.72, 0.9), toon('#4a2e1a'), [0, 0.38, -0.02], { outline: 0.015 })); desk.position.set(-0.4, 0, -0.6); room.add(desk);
      const lamp = new THREE.PointLight('#ffb866', 6, 7, 1.5); lamp.position.set(0.5, 1.5, -0.6); room.add(lamp);
      room.add(part(new THREE.CylinderGeometry(0.02, 0.06, 0.5, 8), toon('#2f4a43'), [0.5, 1.08, -0.9], { outline: 0.006, edges: false }));
      room.add(part(new THREE.ConeGeometry(0.2, 0.18, 14, 1, true), toon('#2f7a4a', null, { side: THREE.DoubleSide }), [0.5, 1.36, -0.9], { outline: 0.008, edges: false }));
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), glow('#ffe2a0')); bulb.position.set(0.5, 1.3, -0.9); room.add(bulb);
      for (let i = 0; i < 3; i++) { const c = crate(0.45, '#7a5236'); c.position.set(-2.6, i * 0.45, -1.6 + (i % 2) * 0.1); room.add(c); }
      if (id === 'desk') {
        const letter = card(['MINISTRY OF POSTS', '& TELEGRAPHS', 'TOP SECRET'], 0.9, 0.62, { sizes: [72, 80, 110], bg: '#f4ead2' }); letter.rotation.x = -Math.PI / 2 + 0.35; letter.position.set(-0.2, 0.86, -0.45); room.add(letter);
        const seal = card(['OFFICIAL'], 0.42, 0.16, { sizes: [180], bg: '#f4ead2', fg: '#c9353a', border: '#c9353a' }); seal.rotation.copy(letter.rotation); seal.position.set(0.08, 0.875, -0.36); room.add(seal);
        const envs = []; for (let i = 0; i < 5; i++) { const e = card([['M. DURAND', 'M. LEROY', 'A. POISSON', 'M. BLANC', 'M. FAURE'][i]], 0.5, 0.3, { sizes: [125], bg: '#efe2c4' }); room.add(e); envs.push(e); }
        const lu = add(makePerson(LUSTIG, { tint: '#ffe8d0' }));
        U((t, cam) => {
          const st = w(0, '^government'), inv = w(0, '^invites');
          const stampDown = t > st && t < inv && ((t - st) % 0.6) < 0.18;
          seal.visible = t > st + 0.18; seal.scale.setScalar(pop(ramp(t, st + 0.12, st + 0.3)));
          lu.group.position.set(-0.3, 0, -0.05);
          lu.update(t, cam.position, 0, { expr: t > inv ? 'grin' : 'smug', gesture: t < st ? 'talk' : t < inv ? [[-1e9, stampDown ? 'holdR' : 'lift', { prop: 'stamp' }]] : 'wave' });
          envs.forEach((e, i) => { const k = ramp(t, inv + i * 0.22, inv + i * 0.22 + 1.1); e.visible = k > 0; e.position.set(0.4 + k * (2.2 + i * 0.3), 0.95 + Math.sin(k * Math.PI) * (0.9 + i * 0.12) + k * 0.4, -0.3 + k * (0.6 - i * 0.25)); e.rotation.set(-0.3, 0.4 + k * 2, k * 3 + i); e.lookAt(cam.position); e.rotateZ(k * 4 + i); });
        });
      } else {
        const frame = card(['BILL OF SALE', 'EIFFEL TOWER', '7,000 TONS', '— A. POISSON'], 1.2, 0.9, { sizes: [90, 120, 90, 80], bg: '#f4ead2' }); frame.position.set(-1.4, 1.95, -2.08); room.add(frame);
        room.add(part(new THREE.BoxGeometry(1.32, 1.02, 0.04), toon('#c9a25a'), [-1.4, 1.95, -2.11], { outline: 0.008, edges: false }));
        const po = add(makePerson(POISSON, { tint: '#ffe8d0' }));
        U((t, cam) => {
          po.group.position.set(-0.6, 0, 0.1);
          const em = w(4, '^embarrassed'), sn = w(4, '^said');
          po.update(t, cam.position, 0, { expr: t > sn ? 'sad' : t > em - 0.2 ? 'alarmed' : 'sad', gesture: t > sn - 0.1 ? 'mouth' : t > em - 0.2 ? 'facepalm' : 'idle' });
        });
      }
    }

    if (id === 'hotel') {
      addLights(scene, LIGHT.room);
      root.add(part(new THREE.BoxGeometry(12, 0.2, 10), toon('#ffffff', paintTexture({ base: '#8a2a2a', kind: 'plain', seed: 3, repeat: [2, 2] })), [0, -0.1, 0], { outline: 0.01, edges: false }));
      const wall = toon('#e8dcc0');
      root.add(part(new THREE.BoxGeometry(12, 5, 0.2), wall, [0, 2.5, -3.6], { outline: 0.02, edges: false }));
      root.add(part(new THREE.BoxGeometry(0.2, 5, 10), wall, [-5.6, 2.5, 0], { outline: 0.02, edges: false }));
      root.add(part(new THREE.BoxGeometry(0.2, 5, 10), wall, [5.6, 2.5, 0], { outline: 0.02, edges: false }));
      for (const x of [-4.2, -1.4, 1.4, 4.2]) { root.add(part(new THREE.CylinderGeometry(0.22, 0.26, 5, 14), toon('#d8b45a'), [x, 2.5, -3.3], { outline: 0.015, edges: false })); }
      for (const x of [-2.8, 2.8]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 2.4), glow('#2a3a6a')); m.position.set(x, 2.6, -3.48); root.add(m); root.add(part(new THREE.BoxGeometry(1.8, 2.6, 0.05), toon('#c9a25a'), [x, 2.6, -3.5], { outline: 0.008, edges: false })); }
      const t1 = table(3.2, 1.4, '#5a3a22', '#f4ead2'); t1.position.set(0, 0, 0); root.add(t1);
      for (const x of [-1.0, 0, 1.0]) { const gl = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.03, 0.14, 10), glow('#ffe2a0', 0.8)); gl.position.set(x, 0.88, 0.3); root.add(gl); }
      const chand = new THREE.Group(); chand.position.set(0, 4.2, 0); root.add(chand);
      chand.add(part(new THREE.TorusGeometry(0.7, 0.05, 6, 24), toon('#d8b45a'), [0, 0, 0], { rot: [Math.PI / 2, 0, 0], outline: 0.006, edges: false }));
      for (let i = 0; i < 10; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), glow('#fff0c0')); b.position.set(Math.cos(i * 0.628) * 0.7, 0.08, Math.sin(i * 0.628) * 0.7); chand.add(b); }
      const cl = new THREE.PointLight('#ffe0a0', 14, 12, 1.4); chand.add(cl);
      const board = card(['EIFFEL TOWER', 'TO BE TORN DOWN', 'SCRAP TENDER'], 1.7, 1.2, { sizes: [110, 90, 80], bg: '#f4ead2' }); board.position.set(2.2, 1.9, -1.2); board.rotation.y = -0.35; root.add(board);
      root.add(part(new THREE.BoxGeometry(1.8, 1.3, 0.05), toon('#5a3a22'), [2.2, 1.9, -1.23], { rot: [0, -0.35, 0], outline: 0.008, edges: false }));
      const xMark = card(['X'], 0.8, 0.8, { sizes: [700], bg: 'rgba(0,0,0,0)', fg: '#c9353a', border: 'rgba(0,0,0,0)' }); xMark.material.transparent = true; xMark.position.set(2.2, 1.85, -1.15); xMark.rotation.y = -0.35; root.add(xMark);
      const tons = card(['7,000 TONS', 'OF IRON'], 2.2, 1.0, { sizes: [150, 100], bg: '#e1ad35' }); root.add(tons);
      const lu = add(makePerson(LUSTIG, { tint: '#ffe8d0' }));
      const ds = [...DEALERS.map((d) => add(makePerson(d, { tint: '#ffe8d0' }))), add(makePerson(POISSON, { tint: '#ffe8d0' }))];
      const seats = [[-1.2, 0.95], [-0.1, 1.05], [-2.1, -0.4], [-1.9, 0.3], [-0.7, 1.35]];
      U((t, cam) => {
        const td = w(0, '^torn'), hb = w(1, '^Highest'), sv = w(1, '^7');
        xMark.visible = t > td; xMark.scale.setScalar(pop(ramp(t, td, td + 0.25)));
        const tk = ramp(t, sv - 0.05, sv + 0.3); tons.visible = tk > 0; tons.scale.setScalar(pop(tk)); tons.position.set(1.0, 2.6, -1.4); tons.lookAt(cam.position);
        lu.group.position.set(1.3, 0, -1.05);
        lu.update(t, cam.position, 0, { talk: talking(t, 'LUSTIG') ? 1 : 0, expr: t > hb ? 'grin' : t < td ? 'smug' : 'calm', gesture: t < td ? 'talk' : t < sv ? [[-1e9, 'point', { angle: -0.6 }]] : t < hb ? 'talk2' : 'shrug' });
        ds.forEach((d, i) => { const [x, z] = seats[i]; d.group.position.set(x, 0, z); const ex = t > hb ? (i === 4 ? 'grin' : 'shout') : t > td ? 'alarmed' : 'neutral'; d.update(t + i * 0.3, cam.position, 0, { expr: ex, gesture: t > hb + 0.2 ? (i % 2 ? 'lift' : 'wave') : 'idle' }); });
      });
    }

    if (id === 'couple' || id === 'deal') {
      const dusk = id === 'couple';
      addLights(scene, dusk ? LIGHT.dusk : LIGHT.day); root.add(sky(dusk ? 'dusk' : 'morning')); root.add(clouds(dusk ? 'rgba(255,190,170,0.45)' : 'rgba(255,255,255,0.6)', 8, 90, 7));
      root.add(ground('#9a9080', 'asphalt', 500, 80, 9)); const tw = eiffel({ lit: dusk }); tw.position.set(-30, 0, -90); root.add(tw); root.add(paris(r, 30, 12));
      for (const x of [-4, 4]) { const lp = lampPost(); lp.position.set(x, 0, -1.5); root.add(lp); }
      // cafe awning + table
      root.add(part(new THREE.BoxGeometry(8, 3.6, 0.3), toon('#e8dcc0'), [0, 1.8, -2.6], { outline: 0.02 }));
      const awn = new THREE.Mesh(new THREE.PlaneGeometry(8, 1.4, 8, 1), toon('#ffffff', paintTexture({ base: '#c9353a', kind: 'plain', seed: 2 }))); awn.position.set(0, 3.2, -1.9); awn.rotation.x = -0.9; root.add(awn);
      const sign = card(['CAFÉ'], 1.8, 0.6, { sizes: [300], bg: '#2b2b33', fg: '#f4ead2', border: '#f4ead2' }); sign.position.set(0, 3.0, -2.42); root.add(sign);
      const tb = table(0.9, 0.9, '#2b2b33'); tb.position.set(0, 0, 0.2); root.add(tb);
      const cash = new THREE.Group(); for (let i = 0; i < 5; i++) cash.add(part(new THREE.BoxGeometry(0.3, 0.035, 0.15), toon('#9fd08a'), [0, 0.8 + i * 0.035, 0], { rot: [0, i * 0.3, 0], outline: 0.004, edges: false })); root.add(cash);
      const po = add(makePerson(POISSON)), lu = add(makePerson(LUSTIG)), wi = add(makePerson(WIFE));
      const q = card(['?'], 0.6, 0.6, { sizes: [500], bg: '#f4ead2', fg: '#c9353a' }); root.add(q);
      // the Vienna train (for the escape cut), far away on the left
      const train = new THREE.Group(); train.position.set(-12, 0, 13.4); root.add(train);
      train.add(part(new THREE.BoxGeometry(9, 2.6, 2.4), toon('#2f4a43'), [0, 1.7, 0], { outline: 0.03 }));
      for (let i = 0; i < 5; i++) train.add(part(new THREE.PlaneGeometry(0.9, 0.7), glow('#ffe2a0'), [-3.4 + i * 1.7, 2.1, 1.21], { outline: 0, edges: false }));
      for (const x of [-3, 0, 3]) train.add(part(new THREE.CylinderGeometry(0.45, 0.45, 2.5, 14), toon('#2b2b33'), [x, 0.45, 0], { rot: [Math.PI / 2, 0, 0], outline: 0.02, edges: false }));
      train.add(part(new THREE.BoxGeometry(14, 0.2, 3), toon('#6a6a6a'), [0, 0.1, 2.6], { outline: 0.01, edges: false }));
      const vs = card(['VIENNA'], 2.2, 0.7, { sizes: [260], bg: '#f4ead2' }); vs.position.set(1.5, 3.4, 1.25); train.add(vs);
      const steam = fogBank(8, 5, 'rgba(240,240,240,0.5)'); steam.position.set(-5, 4.5, 0.5); train.add(steam);
      U((t, cam) => {
        if (dusk) {
          const rat = w(2, '^rat'), cf = w(2, '^confesses');
          po.group.position.set(-0.7, 0, 1.0); wi.group.position.set(-1.6, 0, 0.6); lu.group.position.set(t > 30.8 ? 0.15 : 6, 0, 1.15);
          po.update(t, cam.position, 0, { expr: t > w(2, '^bribe') ? 'alarmed' : 'grin', gesture: t < w(2, '^but') ? [[-1e9, 'holdR', { prop: 'paper' }]] : 'idle' });
          wi.update(t, cam.position, 0, { expr: t > rat - 0.3 ? 'angry' : 'neutral', gesture: t > rat - 0.3 ? 'hips' : 'idle' });
          q.visible = t > rat - 0.1 && t < 30.8; q.scale.setScalar(pop(ramp(t, rat - 0.1, rat + 0.2))); q.position.set(-1.6, 2.25, 0.6); q.lookAt(cam.position);
          lu.update(t, cam.position, 0, { expr: 'smug', gesture: t > cf ? 'mouth' : 'idle' });
          cash.visible = false; train.visible = t > 30.8 ? false : false;
        } else {
          const pays = w(4, '^pays'), fl = w(4, '^flees');
          const esc = t > 40.6; train.visible = true; q.visible = false; wi.group.visible = false;
          po.group.visible = !esc;
          po.group.position.set(-0.75, 0, 0.55); lu.group.position.set(0.75, 0, 0.5);
          po.update(t, cam.position, 0, { talk: talking(t, 'POISSON') ? 1 : 0, expr: t > pays ? 'grin' : 'alarmed', gesture: t < w(3, '^Then') ? 'shrug' : t < pays ? 'talk' : t < pays + 1.2 ? [[-1e9, 'reach', { dx: 70, dy: 30 }]] : 'idle', prop: t > pays - 0.1 && t < pays + 1.2 ? 'cash' : undefined });
          cash.visible = !esc && t > w(4, '^price'); cash.position.set(0.15, 0, 0.2);
          if (!esc) lu.update(t, cam.position, 0, { expr: t > pays ? 'grin' : 'smug', gesture: t > w(4, '^price') ? [[-1e9, 'holdR', { prop: 'cash' }]] : 'idle' });
          else { const k = ramp(t, 40.6, 43.2); lu.group.position.set(-5 - 8 * k, 0, 16.5); lu.update(t, cam.position, 2.2, { expr: 'grin', gesture: [[-1e9, 'holdR', { prop: 'suitcase' }]] }); }
          steam.position.y = 4.5 + Math.sin(t * 2) * 0.3; steam.lookAt(cam.position);
          train.position.x = -12 - Math.max(0, t - fl - 1.2) * 1.2;
        }
      });
    }

    return { root, update(t, camera) { ups.forEach((f) => f(t, camera)); } };
  };
}

// ---------- cameras ----------
const P = (pts) => cameraPath(pts);
const hookP = P([{ t: 0, pos: [5, 1.2, 34], look: [0, 30, 0] }, { t: 2.3, pos: [3.9, 1.65, 20.9], look: [2.5, 1.45, 18] }, { t: 5.6, pos: [3.1, 1.6, 20.5], look: [2.55, 1.45, 18] }, { t: 7.4, pos: [7, 2.4, 30], look: [0, 18, 0] }]);
export const camHook = (t) => { const c = hookP(t); c.focus = V(t > 1.6 && t < 6.6 ? [2.6, 1.4, 18] : [0, 10, 0]); return c; };
const paP = P([{ t: 7.4, pos: [-26, 6, 40], look: [0, 30, 0] }, { t: 10.2, pos: [-10, 3, 32], look: [0, 12, 0] }, { t: 11.4, pos: [3.5, 1.7, 24.4], look: [3.0, 1.65, 20.6] }, { t: 13.0, pos: [2.9, 1.65, 23.8], look: [3.0, 1.65, 20.6] }]);
export const camParis = (t) => { const c = paP(t); c.focus = V(t < 10.8 ? [0, 15, 0] : [3.0, 1.7, 20.6]); return c; };
const deP = P([{ t: 13.0, pos: [1.4, 2.2, 2.6], look: [-0.3, 1.1, -0.4] }, { t: 15.2, pos: [0.4, 1.6, 1.0], look: [-0.1, 0.9, -0.4] }, { t: 17.9, pos: [1.4, 1.8, 1.8], look: [0.6, 1.4, -0.2] }]);
export const camDesk = (t) => { const c = deP(t); c.focus = V(t < 15.2 ? [-0.3, 1.2, -0.2] : [0, 0.9, -0.4]); return c; };
const hoP = P([{ t: 17.9, pos: [-3.6, 3.4, 5.2], look: [0.3, 1.2, -0.3] }, { t: 20.8, pos: [-1.0, 2.2, 3.8], look: [1.0, 1.4, -0.9] }, { t: 23.6, pos: [1.9, 1.7, 0.9], look: [1.3, 1.55, -1.05] }, { t: 25.4, pos: [-1.6, 1.9, 3.4], look: [-0.4, 1.2, 0.8] }]);
export const camHotel = (t) => { const c = hoP(t); c.focus = V(t < 24.4 ? [1.3, 1.5, -1.05] : [-0.6, 1.3, 1.1]); return shake(c, t, w(0, '^torn'), 0.3, 0.06); };
const coA = P([{ t: 25.4, pos: [-4, 2.4, 7], look: [-1, 1.4, 0.8] }, { t: 28.2, pos: [-1.8, 1.6, 4.0], look: [-0.9, 1.4, 0.9] }, { t: 30.8, pos: [-2.6, 1.6, 3.4], look: [-1.5, 1.45, 0.6] }]);
const coB = P([{ t: 30.8, pos: [0.9, 1.6, 2.9], look: [-0.25, 1.45, 1.05] }, { t: 33.7, pos: [0.4, 1.55, 2.3], look: [-0.25, 1.45, 1.05] }]);
export const camCouple = (t) => { const c = t < 30.8 ? coA(t) : coB(t); c.focus = V(t < 30.8 ? [-1.1, 1.4, 0.8] : [-0.25, 1.45, 1.05]); return c; };
const dlA = P([{ t: 33.7, pos: [-1.2, 1.5, 3.2], look: [-0.6, 1.4, 0.55] }, { t: 37.3, pos: [-0.4, 1.4, 2.6], look: [-0.5, 1.35, 0.55] }, { t: 40.6, pos: [1.6, 1.7, 3.4], look: [0.1, 1.0, 0.4] }]);
const dlB = P([{ t: 40.6, pos: [-1.5, 2.0, 22.5], look: [-6.5, 1.6, 16.5] }, { t: 43.2, pos: [-6.5, 2.2, 23.5], look: [-13, 1.8, 15] }]);
export const camDeal = (t) => { const c = t < 40.6 ? dlA(t) : dlB(t); c.focus = V(t < 37.3 ? [-0.75, 1.4, 0.55] : t < 40.6 ? [0.2, 1.0, 0.4] : [-5 - 8 * ramp(t, 40.6, 43.2), 1.4, 16.5]); return c; };
const shP = P([{ t: 43.2, pos: [1.6, 1.8, 3.4], look: [-0.8, 1.6, -0.6] }, { t: 46.0, pos: [0.2, 1.5, 2.0], look: [-0.8, 1.6, -0.9] }, { t: 49.1, pos: [-0.2, 1.45, 1.5], look: [-0.6, 1.35, 0.1] }]);
export const camShame = (t) => { const c = shP(t); c.focus = V(t < 46 ? [-1.2, 1.7, -1.2] : [-0.6, 1.4, 0.1]); return c; };
const toP = P([{ t: 49.1, pos: [-6, 1.6, 30], look: [-2, 1.5, 20] }, { t: 51.0, pos: [2.0, 1.7, 21.6], look: [2.4, 1.5, 18.2] }, { t: 53.3, pos: [6, 1.4, 33], look: [0, 22, 0] }]);
export const camTower = (t) => { const c = toP(t); c.focus = V(t < 51.6 ? [2, 1.5, 18.5] : [0, 9, 0]); return c; };
