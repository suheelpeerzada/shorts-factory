// MAMMOTHS WERE ALIVE FOR THE PYRAMIDS. Locations: hook (mammoth walks past the finished pyramid at sunset),
// giza (2560 BC: workers haul the last stones up the ramp), shout (the overseer), north (Ice Age over: bones in melting
// tundra), island (rising seas trap a herd on Wrangel Island), lab (scientist dates the bones), timeline (a measuring
// rope on the snow: 2560 BC vs ~2000 BC), snow (the last mammoth walking at dusk under the aurora).
import * as THREE from 'three';
import { toon, part, paintTexture, rng, INK } from '../lib/toon.js';
import { makePerson } from '../lib/char.js';
import { critter } from '../lib/critters.js';
import { addLights } from '../Stage.jsx';
import { cameraPath } from '../lib/camera.js';
import { w, talking } from '../times.js';
import { ramp, smooth, pop, glow, sky, sea, card, crate, barrel, rope, fogBank, clouds, ground, hills, patternTex, flag, rocks } from './common.js';

const WORKER = { skin: '#b7835a', hair: '#1f1a1a', outfit: 'sweater', jacket: '#efe6cf', jacket2: '#d8cdb0', pants: '#d8cdb0', shoes: INK, hat: 'none', seed: 5, height: 1.7 };
const OVERSEER = { skin: '#a8754e', hair: '#1f1a1a', beard: '#1f1a1a', outfit: 'coat', jacket: '#2f6f8f', jacket2: '#25586f', pants: '#efe6cf', shoes: INK, hat: 'none', seed: 17, height: 1.82 };
const SCI = { skin: '#f1d6bd', hair: '#ece8e0', brows: '#f1ede6', old: true, moustache: '#f4f1ea', jacket: '#f4f4f0', jacket2: '#d8d8d0', pants: '#3b3640', shoes: INK, tie: '#2f6fb0', hat: 'none', glasses: true, seed: 29, height: 1.74 };
const V = (a) => new THREE.Vector3(...a);
const F = (path, focus, extra = {}) => (t) => { const c = path(t); c.focus = typeof focus === 'function' ? focus(t) : V(focus); return Object.assign(c, extra); };
const shake = (c, t, t0, d = 0.3, a = 0.05) => { if (t > t0 && t < t0 + d) { const s = (1 - (t - t0) / d) * a; c.pos.x += Math.sin(t * 97) * s; c.pos.y += Math.sin(t * 71 + 2) * s; } return c; };

const LIGHT = {
  sunset: { center: [0, 0, 0], key: [60, 18, -40], keyColor: '#ffb27a', keyI: 1.9, hemiI: 0.95, hemi: ['#e0a8a0', '#6a4a3a'], size: 30, fog: ['#e8a888', 80, 600] },
  desert: { center: [0, 0, 0], key: [50, 70, 30], keyColor: '#fff2d8', keyI: 2.3, hemiI: 1.0, hemi: ['#cfe2f0', '#b08a60'], size: 30, fog: ['#ecdcbc', 80, 600] },
  arctic: { center: [0, 0, 0], key: [-40, 30, 50], keyColor: '#f4f8ff', keyI: 1.8, hemiI: 1.15, hemi: ['#cfe0f0', '#8a9aaa'], size: 30, fog: ['#cfdcea', 50, 420] },
  polar: { center: [0, 0, 0], key: [-40, 20, -60], keyColor: '#9fb4d8', keyI: 1.0, hemiI: 0.7, hemi: ['#5a6a9a', '#2a3048'], size: 26, fog: ['#2a3456', 40, 300] },
  lab: { center: [0, 0, 0], key: [-20, 30, 20], keyColor: '#dfe8f4', keyI: 0.6, hemiI: 0.6, hemi: ['#d0d8e0', '#4a4440'], size: 8, fog: ['#2a2a30', 20, 120] },
};

// ---------- pieces ----------
const sandTex = (seed = 2, rep = [3, 3]) => paintTexture({ base: '#d9b47a', kind: 'asphalt', seed, repeat: rep });
function pyramid(h = 40, built = 1) {
  const g = new THREE.Group();
  const stoneT = patternTex((G, W, H) => { G.fillStyle = '#e2c48a'; G.fillRect(0, 0, W, H); G.strokeStyle = 'rgba(120,80,40,0.45)'; G.lineWidth = 3; for (let y = 0; y < H; y += 16) { G.beginPath(); G.moveTo(0, y); G.lineTo(W, y); G.stroke(); for (let x = (y / 16) % 2 ? 0 : 24; x < W; x += 48) { G.beginPath(); G.moveTo(x, y); G.lineTo(x, y + 16); G.stroke(); } } }, 256, 256, [6, 6]);
  const geo = new THREE.ConeGeometry(h * 0.78, h * built, 4, 1, false); geo.rotateY(Math.PI / 4);
  if (built < 1) { const top = new THREE.ConeGeometry(h * 0.78 * (1 - built), 0.01, 4); }
  const m = part(geo, toon('#ffffff', stoneT), [0, (h * built) / 2, 0], { outline: h * 0.003, edges: true }); g.add(m);
  return g;
}
function truncPyramid(h = 40, frac = 0.85) {
  const g = new THREE.Group(); const R = h * 0.78;
  const stoneT = patternTex((G, W, H) => { G.fillStyle = '#e2c48a'; G.fillRect(0, 0, W, H); G.strokeStyle = 'rgba(120,80,40,0.45)'; G.lineWidth = 3; for (let y = 0; y < H; y += 16) { G.beginPath(); G.moveTo(0, y); G.lineTo(W, y); G.stroke(); for (let x = (y / 16) % 2 ? 0 : 24; x < W; x += 48) { G.beginPath(); G.moveTo(x, y); G.lineTo(x, y + 16); G.stroke(); } } }, 256, 256, [6, 6]);
  const geo = new THREE.CylinderGeometry(R * (1 - frac), R, h * frac, 4, 1); geo.rotateY(Math.PI / 4);
  g.add(part(geo, toon('#ffffff', stoneT), [0, (h * frac) / 2, 0], { outline: 0.12 }));
  return g;
}
function palm(x, z, h = 6, seed = 1) {
  const g = new THREE.Group(); g.position.set(x, 0, z); const r = rng(seed);
  g.add(part(new THREE.CylinderGeometry(0.16, 0.24, h, 8), toon('#8a6142'), [0, h / 2, 0], { rot: [0, 0, 0.08], outline: 0.02, edges: false }));
  for (let i = 0; i < 7; i++) { const l = part(new THREE.ConeGeometry(0.35, 2.8, 4), toon(i % 2 ? '#4f7a3a' : '#5f8f42'), [0, h, 0], { outline: 0.015, edges: false }); l.geometry.translate(0, 1.4, 0); l.rotation.set(1.1 + r() * 0.3, (i / 7) * Math.PI * 2, 0); g.add(l); }
  return g;
}
function block(s = [1.6, 1.0, 1.0]) { return part(new THREE.BoxGeometry(...s), toon('#ffffff', paintTexture({ base: '#e2c48a', kind: 'asphalt', seed: 6 })), [0, s[1] / 2, 0], { outline: 0.02 }); }
function aurora() {
  const g = new THREE.Group(); const bands = [];
  for (let i = 0; i < 3; i++) {
    const soft = patternTex((G, W, H) => { const gr = G.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.55, 'rgba(255,255,255,0.9)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); G.fillStyle = gr; G.fillRect(0, 0, W, H); const g2 = G.createLinearGradient(0, 0, W, 0); g2.addColorStop(0, 'rgba(0,0,0,1)'); g2.addColorStop(0.2, 'rgba(0,0,0,0)'); g2.addColorStop(0.8, 'rgba(0,0,0,0)'); g2.addColorStop(1, 'rgba(0,0,0,1)'); G.globalCompositeOperation = 'destination-out'; G.fillStyle = g2; G.fillRect(0, 0, W, H); }, 256, 128);
    const geo = new THREE.PlaneGeometry(260, 60, 40, 1); const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: soft, color: i === 1 ? '#7affc8' : '#5ad8a8', transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, side: THREE.DoubleSide, toneMapped: false }));
    m.position.set(-40 + i * 50, 90 + i * 12, -260 - i * 30); g.add(m); bands.push([m, geo.attributes.position.array.slice(), i]);
  }
  return { group: g, update: (t) => bands.forEach(([m, p0, i]) => { const p = m.geometry.attributes.position; for (let k = 0; k < p.count; k++) p.setZ(k, Math.sin(p0[k * 3] * 0.04 + t * 0.6 + i) * 18); p.needsUpdate = true; m.material.opacity = 0.18 + 0.08 * Math.sin(t * 0.9 + i); }) };
}
function snowfall(n = 500, area = 16) {
  const r = rng(8); const seeds = Array.from({ length: n }, () => [r() * 2 - 1, r(), r() * 2 - 1, 0.5 + r()]);
  const pos = new Float32Array(n * 3); const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color: '#ffffff', size: 0.06, transparent: true, opacity: 0.85 })); pts.frustumCulled = false;
  return { pts, update: (t, cam) => { seeds.forEach(([x, y, z, v], i) => { const yy = (((y * 10 - t * v) % 10) + 10) % 10 + cam.y - 4; pos.set([cam.x + x * area + Math.sin(t + i) * 0.3, yy, cam.z - 4 + z * area], i * 3); }); geo.attributes.position.needsUpdate = true; } };
}
function snowMounds(seed = 3, n = 20, spread = 60) {
  const g = new THREE.Group(); const r = rng(seed);
  for (let i = 0; i < n; i++) { const s = 1 + r() * 4; const m = part(new THREE.SphereGeometry(s, 12, 8), toon('#eef3f8'), [-spread + r() * spread * 2, -s * 0.6, -6 - r() * spread], { outline: 0.03, edges: false }); m.scale.set(1.6, 0.6, 1.2); g.add(m); }
  for (let i = 0; i < 14; i++) { const rk = part(new THREE.DodecahedronGeometry(0.3 + r() * 0.6, 0), toon('#5a5a66'), [-14 + r() * 28, 0.1, -2 - r() * 18], { outline: 0.02 }); g.add(rk); }
  return g;
}
function bones() {
  const g = new THREE.Group(); const m = toon('#efe6cf');
  for (let i = 0; i < 7; i++) { const rib = part(new THREE.TorusGeometry(0.9, 0.07, 6, 16, Math.PI), m, [-1.4 + i * 0.45, 0.0, 0], { rot: [0, Math.PI / 2, 0], outline: 0.01, edges: false }); g.add(rib); }
  g.add(part(new THREE.CylinderGeometry(0.08, 0.08, 3.4, 8), m, [0.1, 0.85, 0], { rot: [0, 0, Math.PI / 2], outline: 0.01, edges: false }));
  const sk = part(new THREE.SphereGeometry(0.6, 12, 10), m, [2.2, 0.5, 0], { outline: 0.015, edges: false }); sk.scale.set(1, 0.9, 0.8); g.add(sk);
  const tg = new THREE.TorusGeometry(1.0, 0.09, 8, 20, Math.PI * 0.9); for (const z of [-0.25, 0.25]) g.add(part(tg, toon('#f1e6c8'), [3.0, 0.35, z], { rot: [0, 0, Math.PI * 0.95], outline: 0.012, edges: false }));
  return g;
}

export function makeMammoth(id) {
  return function build(scene) {
    const root = new THREE.Group(); const r = rng(id.length * 11);
    const ups = []; const U = (f) => ups.push(f);

    // ===================== EGYPT =====================
    if (id === 'hook' || id === 'giza' || id === 'shout') {
      const sunset = id === 'hook';
      addLights(scene, sunset ? LIGHT.sunset : LIGHT.desert);
      root.add(sky(sunset ? 'dusk' : 'desert')); root.add(ground('#d9b47a', 'asphalt', 800, 90, 3)); root.add(hills('#c9a06a', -260, 9, 30, 4));
      root.add(clouds(sunset ? 'rgba(255,180,150,0.5)' : 'rgba(255,255,255,0.6)', 8, 60, 3));
      const nile = new THREE.Mesh(new THREE.PlaneGeometry(600, 16), toon('#4f8fb0')); nile.rotation.x = -Math.PI / 2; nile.position.set(0, 0.03, -120); root.add(nile);
      for (let i = 0; i < 12; i++) root.add(palm(-80 + i * 14 + r() * 6, -108 - r() * 8, 6 + r() * 3, i + 2));
      const P1 = id === 'hook' ? pyramid(40) : truncPyramid(40, 0.9); P1.position.set(0, 0, -60); root.add(P1);
      const P2 = pyramid(30); P2.position.set(-70, 0, -110); root.add(P2); const P3 = pyramid(18); P3.position.set(-110, 0, -130); root.add(P3);
      if (id === 'hook') {
        const cap = part(new THREE.ConeGeometry(2.2, 2.8, 4), toon('#e1ad35'), [0, 39.0, -60], { rot: [0, Math.PI / 4, 0], outline: 0.03, edges: false }); root.add(cap);
        const capG = new THREE.PointLight('#ffcf7a', 30, 30, 1.2); capG.position.set(0, 42, -56); root.add(capG);
        const mam = critter('mammoth', { size: 4.6, tint: '#ffe2cf', pose: 'walk0' }); root.add(mam.group);
        const dust = []; for (let i = 0; i < 3; i++) { const d = fogBank(10, 3, 'rgba(240,200,160,0.3)'); root.add(d); dust.push([d, i]); }
        for (let i = 0; i < 9; i++) { const b = block([1.2 + r(), 0.8, 0.8 + r() * 0.4]); b.position.set(-12 + r() * 24, 0, -8 - r() * 12); b.rotation.y = r(); root.add(b); }
        U((t, cam) => {
          const x = 6 - t * 1.4; mam.group.position.set(x, 0, -3.5); mam.mesh.scale.x = 1;
          mam.setPose(t > w(0, '^alive') - 0.05 && t < w(0, '^alive') + 1.2 ? 'trumpet' : Math.floor(t * 3) % 2 ? 'walk0' : 'walk1'); mam.face(cam);
          dust.forEach(([d, i]) => { d.position.set(x + 2 + i * 2, 1, -4); d.lookAt(cam.position); });
        });
      } else {
        // ramp up the side, sledge with a block, rope teams, the overseer
        const ramp1 = part(new THREE.BoxGeometry(6, 0.8, 60), toon('#ffffff', sandTex(4, [2, 10])), [8, 0, -32], { rot: [0.62, 0, 0], outline: 0.04 }); root.add(ramp1);
        const sl = new THREE.Group(); root.add(sl);
        sl.add(part(new THREE.BoxGeometry(1.4, 0.15, 2.0), toon('#8a6142'), [0, 0.08, 0], { outline: 0.01 }));
        const B = block([1.4, 1.0, 1.4]); B.position.y = 0.15; sl.add(B);
        const workers = []; for (let i = 0; i < 8; i++) { const p = makePerson({ ...WORKER, seed: 40 + i, skin: ['#b7835a', '#9a6a46', '#c99468'][i % 3] }); root.add(p.group); workers.push([p, i]); }
        const ropes = []; for (const s of [-1, 1]) { const rp = part(new THREE.CylinderGeometry(0.025, 0.025, 1, 6), toon('#c9a25a'), [0, 0, 0], { outline: 0, edges: false }); root.add(rp); ropes.push([rp, s]); }
        for (let i = 0; i < 10; i++) { const b = block([1.2 + r() * 0.6, 0.9, 1.0]); b.position.set(-8 + r() * 6, 0, -4 - r() * 14); b.rotation.y = r(); root.add(b); }
        for (let i = 0; i < 4; i++) { const jar = part(new THREE.SphereGeometry(0.3, 10, 8), toon('#b0603a'), [-3 + i * 0.7, 0.3, 3.2], { outline: 0.012, edges: false }); jar.scale.y = 1.3; root.add(jar); }
        const ov = makePerson(OVERSEER); root.add(ov.group);
        const stick = part(new THREE.CylinderGeometry(0.02, 0.02, 1.2, 6), toon('#5b3a2a'), [0, 0, 0], { outline: 0.005, edges: false }); root.add(stick);
        const tag = card(['2560 BC'], 1.6, 0.6, { sizes: [170], bg: '#f4ead2' }); tag.position.set(1.4, 1.6, 4.0); tag.rotation.y = 0.2; root.add(tag);
        root.add(part(new THREE.CylinderGeometry(0.05, 0.05, 1.4, 8), toon('#5b3a2a'), [1.4, 0.7, 3.98], { outline: 0.008, edges: false }));
        const dust = []; for (let i = 0; i < 3; i++) { const d = fogBank(8, 2.5, 'rgba(240,215,170,0.35)'); root.add(d); dust.push([d, i]); }
        U((t, cam) => {
          const prog = ((t - 6.6) * 0.45) % 6; // sledge creeping toward the ramp foot
          const sz = 4 - prog; sl.position.set(8, 0, sz);
          workers.forEach(([p, i]) => { const row = Math.floor(i / 2), side = i % 2 ? 1 : -1; p.group.position.set(8 + side * 0.9, 0, sz - 2.2 - row * 1.1); p.update(t, cam.position, 1.3, { expr: i % 3 ? 'scared' : 'neutral', gesture: 'reach' }); });
          ropes.forEach(([rp, s]) => { const a = V([8 + s * 0.5, 0.6, sz - 0.9]), b = V([8 + s * 0.9, 1.0, sz - 6.6]); rp.position.copy(a).add(b).multiplyScalar(0.5); rp.scale.y = a.distanceTo(b); rp.lookAt(b); rp.rotateX(Math.PI / 2); });
          const L1 = w(1, '^Higher');
          ov.group.position.set(id === 'shout' ? 3.6 : 4.2, 0, id === 'shout' ? 0.6 : 0.8);
          ov.update(t, cam.position, 0, { talk: talking(t, 'OVERSEER') ? 1 : 0, expr: t < w(0, '^overseer') ? 'neutral' : t < L1 ? 'angry' : 'shout', gesture: t < L1 - 0.1 ? 'hips' : t < w(1, '^touching') ? [[-1e9, 'pointL', { angle: -1.0 }]] : 'fists' });
          stick.visible = false;
          tag.scale.setScalar(pop(ramp(t, w(0, '^2560') - 0.1, w(0, '^2560') + 0.2)));
          dust.forEach(([d, i]) => { d.position.set(8 + (i - 1) * 2, 0.8, sz + 1.2); d.lookAt(cam.position); d.material.opacity = 0.6 + 0.3 * Math.sin(t * 3 + i); });
        });
      }
    }

    // ===================== ARCTIC =====================
    if (id === 'north' || id === 'island' || id === 'timeline' || id === 'snow') {
      const night = id === 'snow';
      addLights(scene, night ? LIGHT.polar : LIGHT.arctic);
      root.add(sky(night ? 'night' : 'morning')); root.add(clouds(night ? 'rgba(60,70,110,0.5)' : 'rgba(255,255,255,0.7)', 9, 55, 5));
      if (id !== 'island') { root.add(ground(night ? '#c8d4ea' : '#eef3f8', 'asphalt', 800, 120, 5)); root.add(snowMounds(id.length, 26, 70)); root.add(hills(night ? '#7f8fb0' : '#c8d6e6', -200, 9, 40, 7)); }
      const fall = snowfall(night ? 700 : 300); root.add(fall.pts); U((t, cam) => fall.update(t, cam.position));
      if (night) { const A = aurora(); root.add(A.group); U((t) => A.update(t)); }

      if (id === 'north') {
        const melt = []; for (let i = 0; i < 8; i++) { const p = new THREE.Mesh(new THREE.CircleGeometry(1 + r() * 2, 20), toon('#7fa8c8')); p.rotation.x = -Math.PI / 2; p.position.set(-14 + r() * 28, 0.02, -4 - r() * 20); root.add(p); melt.push(p); }
        for (let i = 0; i < 10; i++) { const gs = part(new THREE.ConeGeometry(0.4, 0.6, 5), toon('#8a9a5a'), [-10 + r() * 20, 0.3, -3 - r() * 15], { outline: 0.01, edges: false }); root.add(gs); }
        const B = bones(); B.position.set(0, 0, -1); B.rotation.y = 0.4; root.add(B);
        const B2 = bones(); B2.position.set(-7, 0, -12); B2.rotation.y = -0.8; root.add(B2);
        const sign = card(['ICE AGE', 'OVER'], 1.4, 0.8, { sizes: [180, 200], bg: '#f4ead2' }); sign.position.set(2.6, 1.5, 0.5); sign.rotation.y = -0.4; root.add(sign);
        root.add(part(new THREE.CylinderGeometry(0.05, 0.05, 1.5, 8), toon('#5b3a2a'), [2.6, 0.75, 0.48], { outline: 0.008, edges: false }));
        U((t) => { sign.scale.setScalar(pop(ramp(t, w(2, '^Ice') - 0.1, w(2, '^Ice') + 0.2))); melt.forEach((p, i) => p.scale.setScalar(0.6 + 0.4 * smooth(ramp(t, 17.5, 23)) + 0.02 * Math.sin(t * 2 + i))); });
      }

      if (id === 'island') {
        const S = sea('morning'); S.mesh.position.y = -0.4; root.add(S.mesh);
        const isl = new THREE.Group(); root.add(isl);
        const land = part(new THREE.CylinderGeometry(14, 22, 3, 24), toon('#ffffff', paintTexture({ base: '#a8b48a', kind: 'grass', seed: 3, repeat: [6, 6] })), [0, -1.4, -6], { outline: 0.06, edges: false }); isl.add(land);
        for (let i = 0; i < 9; i++) { const m = part(new THREE.SphereGeometry(2 + r() * 2, 12, 8), toon('#eef3f8'), [-10 + r() * 20, 0, -10 - r() * 8], { outline: 0.03, edges: false }); m.scale.set(1.5, 0.5, 1.2); isl.add(m); }
        const ice = []; for (let i = 0; i < 14; i++) { const f = part(new THREE.CylinderGeometry(1 + r() * 2, 1.2 + r() * 2, 0.4, 7), toon('#f4f8fc'), [-40 + r() * 80, -0.1, -30 + r() * 50], { outline: 0.02, edges: false }); if (Math.hypot(f.position.x, f.position.z + 6) < 24) continue; root.add(f); ice.push([f, r() * 6]); }
        const lbl = card(['WRANGEL ISLAND'], 3.6, 0.8, { sizes: [92], bg: '#f4ead2' }); lbl.position.set(6, 2.6, 4); lbl.rotation.y = -0.3; isl.add(lbl);
        isl.add(part(new THREE.CylinderGeometry(0.07, 0.07, 2.4, 8), toon('#5b3a2a'), [6, 1.2, 3.96], { outline: 0.008, edges: false }));
        const herd = []; for (let i = 0; i < 6; i++) { const m = critter('mammoth', { size: 3.0 + (i % 3) * 0.4, pose: 'stand' }); m.group.position.set(-6 + i * 2.6 + r(), 0, -2 - (i % 2) * 3); isl.add(m.group); herd.push([m, i]); }
        const calf = critter('mammoth', { size: 1.7, pose: 'stand' }); calf.group.position.set(1.8, 0, 1.0); isl.add(calf.group);
        U((t, cam) => {
          const rise = smooth(ramp(t, w(2, '^Rising'), w(2, '^there') + 0.5)); S.mesh.position.y = -0.9 + rise * 0.9; S.update(t);
          ice.forEach(([f, ph]) => { f.position.y = S.mesh.position.y + 0.2 + Math.sin(t + ph) * 0.05; f.rotation.y = Math.sin(t * 0.2 + ph) * 0.2; });
          herd.forEach(([m, i]) => { const wk = Math.sin(t * 0.5 + i) > 0.3; m.setPose(t > w(2, '^kept') && t < w(2, '^living') + 0.8 && i === 2 ? 'trumpet' : wk ? (Math.floor(t * 2.5 + i) % 2 ? 'walk0' : 'walk1') : 'stand'); m.mesh.scale.x = i % 2 ? -1 : 1; m.face(cam); });
          calf.setPose(Math.floor(t * 3) % 2 ? 'walk0' : 'walk1'); calf.face(cam); calf.group.position.x = 1.8 + Math.sin(t * 0.8) * 0.8;
          lbl.scale.setScalar(pop(ramp(t, w(2, '^island') - 0.1, w(2, '^island') + 0.25)));
        });
      }

      if (id === 'timeline') {
        // a long rope laid on the snow as a timeline, with two posts: PYRAMID DONE ~2560 BC and LAST MAMMOTH ~2000 BC
        const rp = part(new THREE.CylinderGeometry(0.04, 0.04, 14, 8), toon('#c9a25a'), [0, 0.05, 0], { rot: [0, 0, Math.PI / 2], outline: 0.008, edges: false }); root.add(rp);
        for (let i = 0; i <= 14; i++) { const tk = part(new THREE.BoxGeometry(0.04, 0.25, 0.04), toon('#5b3a2a'), [-7 + i, 0.12, 0], { outline: 0.004, edges: false }); root.add(tk); }
        const mk = (x, lines, col) => { const g = new THREE.Group(); g.position.set(x, 0, 0); root.add(g); g.add(part(new THREE.CylinderGeometry(0.05, 0.05, 1.8, 8), toon('#5b3a2a'), [0, 0.9, 0], { outline: 0.008, edges: false })); const c = card(lines, 1.5, 0.75, { sizes: [96, 150], bg: col }); c.position.set(0, 1.9, 0.04); g.add(c); return g; };
        const A = mk(-2.2, ['PYRAMID DONE', '2560 BC'], '#f4ead2'), B = mk(2.2, ['LAST MAMMOTH', '~2000 BC'], '#cfe8f4');
        const pm = pyramid(0.7); pm.position.set(-2.2, 0, 0.5); root.add(pm);
        const mm = critter('mammoth', { size: 1.2, pose: 'stand' }); mm.group.position.set(2.2, 0, 0.6); root.add(mm.group);
        const span = card(['+500 YEARS'], 1.8, 0.45, { sizes: [150], bg: '#ffd23a' }); span.position.set(0, 0.9, 0.3); root.add(span);
        const bar = part(new THREE.BoxGeometry(1, 0.08, 0.08), toon('#c9452f'), [0, 0.35, 0.2], { outline: 0.006, edges: false }); root.add(bar);
        U((t, cam) => {
          A.scale.setScalar(pop(ramp(t, w(4, '^pyramid') - 0.1, w(4, '^pyramid') + 0.2))); B.scale.setScalar(pop(ramp(t, w(4, '^last') - 0.1, w(4, '^last') + 0.2)));
          const k = smooth(ramp(t, w(4, '^by') - 0.2, w(4, '^years') + 0.2)); bar.scale.x = Math.max(0.01, k * 4.4); bar.position.x = -2.2 + k * 2.2;
          span.scale.setScalar(pop(ramp(t, w(4, '^500') - 0.1, w(4, '^500') + 0.25)));
          mm.setPose(t > w(4, '^years') ? 'trumpet' : 'stand'); mm.mesh.scale.x = -1; mm.face(cam);
        });
      }

      if (id === 'snow') {
        const mam = critter('mammoth', { size: 3.4, tint: '#c9d4ee', pose: 'walk0' }); root.add(mam.group);
        const prints = []; for (let i = 0; i < 24; i++) { const p = new THREE.Mesh(new THREE.CircleGeometry(0.22, 12), toon('#9aa8c8')); p.rotation.x = -Math.PI / 2; root.add(p); prints.push([p, i]); }
        const moonL = new THREE.PointLight('#cfe0ff', 10, 30, 1.2); moonL.position.set(-6, 8, 4); root.add(moonL);
        U((t, cam) => {
          const x = -2 + (t - 44.5) * 0.7; mam.group.position.set(x, 0, 0); mam.mesh.scale.x = -1;
          mam.setPose(t > 49.2 ? 'trumpet' : Math.floor(t * 2.5) % 2 ? 'walk0' : 'walk1'); mam.face(cam);
          prints.forEach(([p, i]) => { p.position.set(x - 1.0 - i * 0.45, 0.02, (i % 2 ? 0.3 : -0.3)); });
        });
      }
    }

    // ===================== LAB =====================
    if (id === 'lab') {
      addLights(scene, LIGHT.lab);
      root.add(ground('#4a4a52', 'asphalt', 40, 10, 2));
      const wall = new THREE.Mesh(new THREE.PlaneGeometry(12, 5), toon('#ffffff', paintTexture({ base: '#7a8a96', kind: 'metal', seed: 3, repeat: [4, 2] }))); wall.position.set(0, 2.5, -1.5); root.add(wall);
      const board = new THREE.Group(); board.position.set(-1.2, 1.9, -1.45); root.add(board);
      board.add(part(new THREE.BoxGeometry(2.6, 1.6, 0.05), toon('#2e3a33'), [0, 0, 0], { outline: 0.01 }));
      const chalk1 = card(['SAMPLE: WRANGEL ISL.', 'MAMMOTH TOOTH'], 2.3, 0.6, { sizes: [62, 80], bg: '#2e3a33', fg: '#f4f1ea', border: '#2e3a33' }); chalk1.position.set(0, 0.4, 0.03); board.add(chalk1);
      const chalk2 = card(['AGE: 4,000 YRS'], 2.3, 0.6, { sizes: [92], bg: '#2e3a33', fg: '#ffd23a', border: '#2e3a33' }); chalk2.position.set(0, -0.35, 0.03); board.add(chalk2);
      const bench = part(new THREE.BoxGeometry(3.4, 0.1, 1.1), toon('#ffffff', paintTexture({ base: '#d8d8d0', kind: 'metal', seed: 4 })), [0.6, 0.9, 0.2], { outline: 0.015 }); root.add(bench);
      for (const x of [-0.9, 2.1]) root.add(part(new THREE.BoxGeometry(0.08, 0.9, 0.9), toon('#6a6a72'), [x, 0.45, 0.2], { outline: 0.008, edges: false }));
      const tusk = part(new THREE.TorusGeometry(0.45, 0.06, 8, 20, Math.PI * 0.8), toon('#f1e6c8'), [1.4, 1.0, 0.3], { rot: [Math.PI / 2, 0, 0.4], outline: 0.008, edges: false }); root.add(tusk);
      for (let i = 0; i < 5; i++) { const tb = part(new THREE.CylinderGeometry(0.04, 0.04, 0.3, 10), new THREE.MeshBasicMaterial({ color: ['#7affc8', '#ffd23a', '#6fe0ff'][i % 3], transparent: true, opacity: 0.7 }), [-0.4 + i * 0.16, 1.1, -0.1], { outline: 0.004, edges: false }); root.add(tb); }
      const scope = new THREE.Group(); scope.position.set(0.2, 0.95, 0.2); root.add(scope);
      scope.add(part(new THREE.CylinderGeometry(0.06, 0.08, 0.5, 10), toon('#2b2b33'), [0, 0.35, 0], { rot: [0.3, 0, 0], outline: 0.006, edges: false }));
      scope.add(part(new THREE.BoxGeometry(0.3, 0.05, 0.3), toon('#2b2b33'), [0, 0.02, 0], { outline: 0.006, edges: false }));
      const lampL = new THREE.PointLight('#fff1d8', 16, 8, 1.3); lampL.position.set(0.6, 2.6, 1.2); root.add(lampL);
      const lampG = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.06, 0.3), glow('#fff6e0')); lampG.position.set(0.6, 3.0, 0.6); root.add(lampG);
      const sci = makePerson(SCI); root.add(sci.group);
      const counter = card(['RADIOCARBON'], 0.7, 0.2, { sizes: [110], bg: '#2b2b33', fg: '#7affc8', border: '#2b2b33' }); counter.position.set(1.6, 1.3, -0.2); root.add(counter);
      const dial = new THREE.Mesh(new THREE.CircleGeometry(0.08, 16), glow('#7affc8')); dial.position.set(1.9, 1.1, -0.19); root.add(dial);
      U((t, cam) => {
        sci.group.position.set(0.6, 0, 0.95);
        const L3 = w(3, '^Only');
        sci.update(t, cam.position, 0, { talk: talking(t, 'SCIENTIST') ? 1 : 0, expr: t < L3 - 0.1 ? 'neutral' : 'shout', gesture: t < L3 - 0.1 ? [[-1e9, 'holdR', { prop: 'paper' }]] : 'facepalm' });
        chalk2.scale.setScalar(pop(ramp(t, w(3, '^4') - 0.1, w(3, '^4') + 0.2)));
        dial.material.color.set(Math.sin(t * 12) > 0 ? '#7affc8' : '#2a6a50');
      });
    }

    return { root, update(t, camera) { ups.forEach((f) => f(t, camera)); } };
  };
}

// ---------- cameras ----------
export const camHook = F(cameraPath([{ t: 0, pos: [3, 2.2, 10], look: [0, 6, -40] }, { t: 1.9, pos: [2.6, 2.0, 9], look: [1, 4, -30] }, { t: 4.4, pos: [1.0, 1.8, 6.5], look: [1, 2.6, -6] }, { t: 6.6, pos: [-1.5, 1.6, 5.6], look: [-2, 2.4, -6] }]), (t) => V(t < 2.3 ? [0, 8, -40] : [6 - t * 1.4, 2.2, -3.5]));
const gizaA = cameraPath([{ t: 6.6, pos: [-2, 3.5, 12], look: [4, 6, -30] }, { t: 9.4, pos: [2, 2.0, 9], look: [7, 1.2, 0] }, { t: 11.95, pos: [4.5, 1.4, 7], look: [8, 0.9, 1.5] }]);
const gizaB = cameraPath([{ t: 11.95, pos: [2.6, 1.6, 4.2], look: [4.2, 1.45, 0.8] }, { t: 14.2, pos: [3.0, 1.55, 3.5], look: [4.2, 1.5, 0.8] }]);
export const camGiza = (t) => { const c = t < 11.95 ? gizaA(t) : gizaB(t); c.focus = V(t < 9 ? [0, 10, -60] : t < 11.95 ? [8, 0.9, 1.0] : [4.2, 1.45, 0.8]); return c; };
export const camShout = (t) => { const c = cameraPath([{ t: 14.2, pos: [2.7, 1.5, 2.9], look: [3.6, 1.5, 0.6] }, { t: 15.4, pos: [3.0, 1.35, 2.5], look: [3.5, 1.6, 0.6] }, { t: 17.5, pos: [1.8, 2.4, 3.2], look: [4, 6, -30] }])(t); c.focus = V(t < 16.4 ? [3.6, 1.45, 0.6] : [0, 20, -60]); return shake(c, t, w(1, '^Higher'), 0.4, 0.06); };
export const camNorth = F(cameraPath([{ t: 17.5, pos: [0, 6, 14], look: [0, 1, -20] }, { t: 20.0, pos: [1.5, 2.6, 6], look: [1.5, 1.2, 0] }, { t: 22.3, pos: [-1.0, 1.4, 3.2], look: [0.5, 0.6, -1] }, { t: 24.0, pos: [-1.6, 2.4, 3.6], look: [-4, 4, -40] }]), (t) => V(t < 19.5 ? [0, 0, -10] : t < 23 ? [0.6, 0.6, -1] : [0, 3, -40]));
const islA = cameraPath([{ t: 24.0, pos: [0, 30, 50], look: [0, 0, -6] }, { t: 26.5, pos: [6, 16, 32], look: [0, 0, -4] }, { t: 29.1, pos: [10, 6, 20], look: [0, 1, -3] }]);
const islB = cameraPath([{ t: 29.1, pos: [3, 1.8, 9], look: [0, 1.6, -2] }, { t: 31.2, pos: [1.6, 1.6, 7], look: [1, 1.5, -1] }, { t: 33.0, pos: [0.5, 1.4, 6], look: [1.8, 0.9, 1] }]);
export const camIsland = (t) => { const c = t < 29.1 ? islA(t) : islB(t); c.focus = V(t < 29.1 ? [0, 0, -4] : t < 31.6 ? [0, 1.6, -2] : [1.8, 0.9, 1]); return c; };
export const camLab = (t) => { const c = cameraPath([{ t: 33.0, pos: [-1.8, 1.8, 3.6], look: [-1.0, 1.7, -1.4] }, { t: 35.5, pos: [0.0, 1.6, 3.3], look: [0.2, 1.4, 0.8] }, { t: 36.5, pos: [0.4, 1.5, 2.6], look: [0.6, 1.5, 0.95] }, { t: 38.3, pos: [0.5, 1.45, 2.3], look: [0.6, 1.45, 0.95] }])(t); c.focus = V(t < 35.0 ? [-1.2, 1.7, -1.45] : [0.6, 1.45, 0.95]); return shake(c, t, w(3, '^4'), 0.35, 0.05); };
export const camTimeline = F(cameraPath([{ t: 38.3, pos: [-4.2, 1.6, 4], look: [-2.2, 1.2, 0] }, { t: 40.5, pos: [-2.4, 1.7, 3.6], look: [-2.2, 1.6, 0] }, { t: 42.3, pos: [1.8, 1.8, 4.0], look: [2.2, 1.6, 0] }, { t: 43.6, pos: [0, 2.2, 5.8], look: [0, 1.3, 0] }, { t: 44.5, pos: [0, 2.4, 6.4], look: [0, 1.2, 0] }]), (t) => V(t < 41.2 ? [-2.2, 1.5, 0] : t < 43 ? [2.2, 1.5, 0] : [0, 1, 0.3]), { cap: 'top' });
export const camSnow = (t) => { const x = -2 + (t - 44.5) * 0.7; const c = cameraPath([{ t: 44.5, pos: [x + 6, 3.0, 9], look: [x, 1.6, 0] }, { t: 47.0, pos: [x + 4.5, 2.0, 6.5], look: [x, 1.8, 0] }, { t: 50.3, pos: [x + 3.2, 1.6, 4.6], look: [x - 0.6, 2.0, 0] }])(t); c.focus = V([x, 1.8, 0]); return c; };
