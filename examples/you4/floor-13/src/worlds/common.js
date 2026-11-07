// Shared pieces for the lighthouse story: sky, sea, lighthouse, beam, ships, the thing, rain, cast.
import * as THREE from 'three';
import { toon, part, rng, paintTexture, signTexture, INK } from '../lib/toon.js';

export const ramp = (t, a, b) => THREE.MathUtils.clamp((t - a) / (b - a), 0, 1);
export const smooth = (k) => k * k * (3 - 2 * k);
export const pop = (k) => (k <= 0 ? 0.0001 : 1 + 2.2 * Math.pow(k - 1, 3) + 1.2 * Math.pow(k - 1, 2));
export const glow = (color, opacity = 1) => new THREE.MeshBasicMaterial({ color, transparent: opacity < 1, opacity, fog: false, toneMapped: false });

export const LANTERN_Y = 22.3, GALLERY_Y = 21.35, BASE_Y = 1.4, CREATURE = [0, 0, -60];

// ---------- cast ----------
export const KEEPER = { skin: '#ecd2b8', hair: '#ece8e0', brows: '#f1ede6', beard: '#ece8e0', moustache: '#f4f1ea', old: true, outfit: 'sweater', jacket: '#2f4058', jacket2: '#26354a', pants: '#2c2a33', shoes: INK, hat: 'peaked', hatColor: '#1f2a3c', hatColor2: '#141b28', badge: '#e1ad35', seed: 41, height: 1.72 };
export const YOU = { skin: '#f3d9c0', hair: '#6b4a32', outfit: 'sweater', jacket: '#e1ad35', jacket2: '#c08f22', pants: '#3b3640', shoes: INK, hat: 'beanie', hatColor: '#c9452f', hatColor2: '#a3392d', seed: 12, height: 1.74 };
export const CAPTAIN = { skin: '#e9c7a6', hair: '#3a2a22', beard: '#3a2a22', moustache: '#2e211b', jacket: '#22304a', jacket2: '#1a2538', pants: '#2c2a33', shoes: INK, tie: '#e1ad35', hat: 'peaked', hatColor: '#f3ead6', hatColor2: INK, badge: '#e1ad35', seed: 77, height: 1.78 };

// ---------- sky ----------
const SKIES = {
  night: ['#050913', '#121e36', '#24324c'],
  dusk: ['#2c2d5e', '#b5647f', '#f2a36a'],
  morning: ['#6f9fcf', '#bcd6e6', '#f1e6cc'],
  desert: ['#4f8fd0', '#a6cfe8', '#f3dcb0'],
  grey: ['#56606f', '#8a94a0', '#b9bdc1'],
  battle: ['#231a28', '#6e3634', '#e08648'],
};
export function sky(mode = 'night') {
  const g = new THREE.Group(); const [a, b, c] = SKIES[mode];
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new THREE.Color(a) }, mid: { value: new THREE.Color(b) }, bottom: { value: new THREE.Color(c) } },
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
    fragmentShader: 'uniform vec3 top; uniform vec3 mid; uniform vec3 bottom; varying vec3 vP; void main(){ float h = clamp(vP.y,0.0,1.0); vec3 c = mix(bottom, mid, smoothstep(0.0,0.12,h)); c = mix(c, top, smoothstep(0.12,0.6,h)); gl_FragColor = vec4(c,1.0);\n#include <colorspace_fragment>\n}',
  });
  const s = new THREE.Mesh(new THREE.SphereGeometry(520, 32, 16), mat); s.renderOrder = -1; g.add(s);
  if (mode === 'night' || mode === 'dusk') {
    const r = rng(91), pos = [];
    for (let i = 0; i < 700; i++) { const an = r() * Math.PI * 2, e = (mode === 'dusk' ? 0.5 : 0.06) + r() * 1.2; pos.push(Math.cos(an) * Math.cos(e) * 500, Math.sin(e) * 500, Math.sin(an) * Math.cos(e) * 500); }
    const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: '#f3ead6', size: 1.6, sizeAttenuation: false, fog: false, transparent: true, opacity: mode === 'dusk' ? 0.5 : 1 })));
  }
  const disc = (col, r, pos, haloCol, haloR, haloO) => {
    const m = new THREE.Mesh(new THREE.CircleGeometry(r, 40), glow(col)); m.position.set(...pos); m.lookAt(0, 0, 0); g.add(m);
    const h = new THREE.Mesh(new THREE.CircleGeometry(haloR, 40), glow(haloCol, haloO)); h.position.copy(m.position).multiplyScalar(1.01); h.lookAt(0, 0, 0); g.add(h);
  };
  if (mode === 'night') disc('#f3ead6', 14, [-150, 190, -420], '#9fb4d8', 34, 0.12);
  if (mode === 'dusk') disc('#ffd6a0', 26, [160, 30, -440], '#ff9a6a', 70, 0.22);
  if (mode === 'morning') disc('#fff6dc', 22, [-120, 140, -440], '#fff1c4', 60, 0.2);
  if (mode === 'desert') disc('#fffbe8', 20, [140, 220, -400], '#fff4c4', 70, 0.25);
  if (mode === 'battle') disc('#ffb070', 30, [-160, 40, -430], '#ff7a4a', 90, 0.25);
  return g;
}

// ---------- sea ----------
const SEA = { night: ['#1c3452', 'rgba(120,160,200,0.35)', 'rgba(10,20,35,0.45)'], dusk: ['#3d4c7e', 'rgba(255,170,140,0.35)', 'rgba(20,20,50,0.35)'], morning: ['#3f80aa', 'rgba(230,245,255,0.45)', 'rgba(20,60,90,0.3)'] };
export function sea(mode = 'night') {
  const [base, lite, dark] = SEA[mode];
  const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d'); const r = rng(33);
  g.fillStyle = base; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 260; i++) {
    const x = r() * 512, y = r() * 512, wd = 20 + r() * 60;
    g.strokeStyle = r() > 0.5 ? lite : dark; g.lineWidth = 2 + r() * 3; g.lineCap = 'round';
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + wd / 2, y - 6, x + wd, y); g.stroke();
  }
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(70, 70); tex.anisotropy = 8;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1200, 1200), toon('#ffffff', tex)); m.rotation.x = -Math.PI / 2; m.receiveShadow = true;
  return { mesh: m, update: (t) => tex.offset.set(t * 0.012, t * 0.02) };
}

// ---------- the lighthouse on its rock: brick tower, glass lantern with a lens, gallery, jetty, cottage ----------
export function lighthouse() {
  const g = new THREE.Group();
  const RK = rocks(4, 11, 10.5); g.add(RK.group);
  const rock = part(new THREE.DodecahedronGeometry(9, 1), toon('#3b3a46'), [0, -2.2, 0], { outline: 0.06 }); rock.scale.set(1.3, 0.42, 1.3); g.add(rock);
  g.add(part(new THREE.CylinderGeometry(7, 7.6, 1.6, 40), toon('#ffffff', paintTexture({ base: '#7d7a80', kind: 'asphalt', seed: 5, repeat: [6, 1] })), [0, BASE_Y - 0.8, 0], { outline: 0.04, edges: false }));
  // low stone wall around the platform
  for (let i = 0; i < 26; i++) { const a = (i / 26) * Math.PI * 2; if (Math.abs(Math.sin(a) - 1) < 0.08) continue; g.add(part(new THREE.BoxGeometry(1.5, 0.5, 0.4), toon('#6e6a72'), [Math.cos(a) * 6.8, BASE_Y + 0.25, Math.sin(a) * 6.8], { rot: [0, -a + Math.PI / 2, 0], outline: 0.02 })); }
  // jetty toward +z with lamp posts, a rowboat, barrels, rope
  const plank = toon('#ffffff', paintTexture({ base: '#8a6142', kind: 'planks', seed: 8, repeat: [1, 3] }));
  g.add(part(new THREE.BoxGeometry(2.6, 0.2, 12), plank, [0, BASE_Y - 0.1, 12], { outline: 0.03 }));
  for (const z of [8, 12, 16]) for (const x of [-1.2, 1.2]) g.add(part(new THREE.CylinderGeometry(0.15, 0.15, 3, 8), toon('#5b3a2a'), [x, BASE_Y - 1.6, z], { outline: 0.02, edges: false }));
  for (const z of [9, 15]) { const lp = lampPostSea(); lp.position.set(1.15, BASE_Y, z); g.add(lp); }
  const b1 = barrel(); b1.position.set(-0.8, BASE_Y, 13.5); g.add(b1); const b2 = barrel('#6a4a32'); b2.position.set(-0.75, BASE_Y, 14.4); b2.scale.setScalar(0.85); g.add(b2);
  const rp = rope(); rp.position.set(0.6, BASE_Y, 17); g.add(rp);
  const boat = new THREE.Group(); boat.add(part(new THREE.BoxGeometry(1.4, 0.5, 3.6), toon('#3f6f8f'), [0, 0, 0], { outline: 0.03 })); boat.add(part(new THREE.BoxGeometry(1.2, 0.1, 0.35), toon('#e8dcc4'), [0, 0.22, 0.3], { outline: 0.01, edges: false })); boat.position.set(2.5, 0.15, 15); g.add(boat);
  // keeper's cottage beside the tower
  const cot = new THREE.Group(); cot.position.set(-4.6, BASE_Y, 1.2); cot.rotation.y = 0.5; g.add(cot);
  cot.add(part(new THREE.BoxGeometry(3.4, 2.4, 2.6), toon('#ffffff', paintTexture({ base: '#e8dcc4', kind: 'planks', seed: 13, repeat: [2, 1] })), [0, 1.2, 0], { outline: 0.03 }));
  const roof = new THREE.CylinderGeometry(0.01, 2.2, 1.4, 4, 1); roof.rotateY(Math.PI / 4); { const rf = part(roof, toon('#a3392d'), [0, 3.1, 0], { outline: 0.03 }); rf.scale.set(1.25, 1, 1); cot.add(rf); }
  cot.add(part(new THREE.BoxGeometry(0.4, 1.2, 0.4), toon('#6e6a72'), [0.9, 3.4, -0.4], { outline: 0.015 }));
  const cwin = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.6), glow('#ffcf7a')); cwin.position.set(0.7, 1.4, 1.31); cot.add(cwin);
  cot.add(part(new THREE.BoxGeometry(0.75, 1.6, 0.06), toon('#3f6f8f'), [-0.7, 0.8, 1.31], { outline: 0.012 }));
  const F = flag(); F.group.position.set(4.6, BASE_Y, -2.5); g.add(F.group);
  // tower: 5 brick bands, small windows, a door
  const n = 5, H = 20;
  for (let i = 0; i < n; i++) {
    const r0 = 2.4 - (0.8 * i) / n, r1 = 2.4 - (0.8 * (i + 1)) / n;
    g.add(part(new THREE.CylinderGeometry(r1, r0, H / n, 32), toon('#ffffff', brickTex(i % 2 ? '#b8372f' : '#efe6d6', 20 + i, [7, 2])), [0, BASE_Y + (H / n) * (i + 0.5), 0], { outline: 0.04, edges: false }));
    g.add(part(new THREE.TorusGeometry(r1 + 0.02, 0.06, 6, 40), toon('#2b2b33'), [0, BASE_Y + (H / n) * (i + 1), 0], { rot: [Math.PI / 2, 0, 0], outline: 0, edges: false }));
  }
  const wins = [];
  for (const [y, a] of [[6.5, 0.4], [10.5, -0.6], [14.5, 0.3], [18, -0.4]]) {
    const r = 2.4 - 0.8 * ((y - BASE_Y) / H) + 0.02, wg = new THREE.Group(); wg.position.set(Math.sin(a) * r, y, Math.cos(a) * r); wg.rotation.y = a; g.add(wg);
    wg.add(part(new THREE.BoxGeometry(0.75, 1.05, 0.12), toon('#2b2b33'), [0, 0, 0], { outline: 0.015 }));
    const w = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.85), glow('#ffcf7a')); w.position.z = 0.07; wg.add(w); wins.push(w);
  }
  g.add(part(new THREE.BoxGeometry(1.25, 2.2, 0.25), toon('#2b2b33'), [0, BASE_Y + 1.1, 2.3], { outline: 0.02 }));
  g.add(part(new THREE.BoxGeometry(1.05, 2.0, 0.2), toon('#3f6f8f'), [0, BASE_Y + 1.0, 2.36], { outline: 0.02 }));
  g.add(part(new THREE.SphereGeometry(0.07, 8, 6), toon('#e1ad35'), [0.38, BASE_Y + 1.0, 2.48], { outline: 0.01, edges: false }));
  const dlamp = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), glow('#ffd98a')); dlamp.position.set(0.85, BASE_Y + 2.4, 2.35); g.add(dlamp);
  // gallery: grated floor, brackets, railing with posts, bucket + rope, door out of the lantern room
  g.add(part(new THREE.CylinderGeometry(2.95, 2.95, 0.3, 40), toon('#ffffff', paintTexture({ base: '#3a3f4a', kind: 'metal', seed: 3, repeat: [4, 1] })), [0, GALLERY_Y - 0.15, 0], { outline: 0.04 }));
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; g.add(part(new THREE.BoxGeometry(0.12, 0.9, 0.5), toon('#2b2b33'), [Math.cos(a) * 1.95, GALLERY_Y - 0.6, Math.sin(a) * 1.95], { rot: [0, -a, 0.5], outline: 0.012, edges: false })); }
  for (const y of [0.9, 0.45]) g.add(part(new THREE.TorusGeometry(2.85, y > 0.5 ? 0.055 : 0.035, 6, 56), toon('#2b2b33'), [0, GALLERY_Y + y, 0], { rot: [Math.PI / 2, 0, 0], outline: 0.012, edges: false }));
  for (let i = 0; i < 20; i++) { const a = (i / 20) * Math.PI * 2; g.add(part(new THREE.CylinderGeometry(0.04, 0.04, 0.9, 6), toon('#2b2b33'), [Math.cos(a) * 2.85, GALLERY_Y + 0.45, Math.sin(a) * 2.85], { outline: 0.012, edges: false })); }
  const bk = bucket(); bk.position.set(-1.6, GALLERY_Y, 1.9); g.add(bk);
  const rp2 = rope(0.28); rp2.position.set(1.7, GALLERY_Y, 1.7); g.add(rp2);
  // lantern room: base drum, 8 glass panes, frames, the lens inside, dome cap, vent ball, lightning rod
  g.add(part(new THREE.CylinderGeometry(1.55, 1.6, 0.7, 24), toon('#2b2b33'), [0, GALLERY_Y + 0.35, 0], { outline: 0.03 }));
  const ldoor = part(new THREE.BoxGeometry(0.6, 0.65, 0.08), toon('#3f6f8f'), [0, GALLERY_Y + 0.35, 1.58], { outline: 0.012 }); g.add(ldoor);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    const pane = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.7), new THREE.MeshBasicMaterial({ color: '#cfe6ff', transparent: true, opacity: 0.12, depthWrite: false, side: THREE.DoubleSide, fog: false }));
    pane.position.set(Math.sin(a) * 1.25, LANTERN_Y + 0.2, Math.cos(a) * 1.25); pane.rotation.y = a; g.add(pane);
    const pa = a + Math.PI / 8; g.add(part(new THREE.BoxGeometry(0.07, 1.8, 0.07), toon('#2b2b33'), [Math.sin(pa) * 1.32, LANTERN_Y + 0.2, Math.cos(pa) * 1.32], { outline: 0.012, edges: false }));
  }
  for (const y of [LANTERN_Y - 0.7, LANTERN_Y + 0.2, LANTERN_Y + 1.1]) g.add(part(new THREE.TorusGeometry(1.32, 0.04, 6, 32), toon('#2b2b33'), [0, y, 0], { rot: [Math.PI / 2, 0, 0], outline: 0, edges: false }));
  const lensMat = new THREE.MeshBasicMaterial({ color: '#6b5a3a', fog: false, toneMapped: false });
  const lens = new THREE.Group(); lens.position.y = LANTERN_Y + 0.15; g.add(lens);
  for (let i = 0; i < 7; i++) { const y = -0.6 + i * 0.2, r = 0.62 - Math.abs(i - 3) * 0.08; const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.05, 6, 28), lensMat); ring.position.y = y; ring.rotation.x = Math.PI / 2; lens.add(ring); }
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 12), new THREE.MeshBasicMaterial({ color: '#555', fog: false, toneMapped: false })); lens.add(core);
  { const dome = part(new THREE.SphereGeometry(1.62, 24, 10, 0, Math.PI * 2, 0, Math.PI / 2), toon('#2b2b33'), [0, LANTERN_Y + 1.15, 0], { outline: 0.04 }); dome.scale.set(1, 0.62, 1); g.add(dome); }
  g.add(part(new THREE.SphereGeometry(0.3, 14, 10), toon('#2b2b33'), [0, LANTERN_Y + 2.25, 0], { outline: 0.02, edges: false }));
  g.add(part(new THREE.CylinderGeometry(0.03, 0.03, 1.4, 6), toon('#2b2b33'), [0, LANTERN_Y + 3.0, 0], { outline: 0.008, edges: false }));
  const lantern = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 1.7, 16, 1, true), new THREE.MeshBasicMaterial({ color: '#000', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false, toneMapped: false })); lantern.position.y = LANTERN_Y + 0.2; g.add(lantern);
  const lamp = new THREE.PointLight('#ffd98a', 0, 30, 1.6); lamp.position.set(0, LANTERN_Y, 0); g.add(lamp);
  const gl2 = new THREE.PointLight('#ffd98a', 0, 6, 1.5); gl2.position.set(0, GALLERY_Y + 1.2, 1.9); g.add(gl2);
  // on: 0..1 (lantern lit)
  const setOn = (on, t = 0, flare = 0) => {
    const k = (0.92 + 0.08 * Math.sin(t * 17)) * (1 + flare * 1.5);
    lensMat.color.set(on > 0 ? '#ffd27a' : '#6b5a3a'); core.material.color.set(on > 0 ? '#ffffff' : '#555555');
    lantern.material.opacity = on * 0.35; lantern.material.color.set('#ffcf7a');
    lamp.intensity = 40 * on * k; gl2.intensity = 10 * on * k;
  };
  return { group: g, setOn, update: (t) => { RK.update(t); F.update(t); } };
}

// ---------- the beam (cone + spotlight), pivoting at the lantern ----------
export function beam() {
  const pivot = new THREE.Group(); pivot.rotation.order = 'YXZ'; pivot.position.set(0, LANTERN_Y, 0);
  const mk = (r, o) => { const geo = new THREE.CylinderGeometry(r, 0.4, 90, 32, 1, true); geo.rotateX(-Math.PI / 2); geo.translate(0, 0, -45); return new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: '#fff1b8', transparent: true, opacity: o, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false, toneMapped: false })); };
  const outer = mk(9, 0.11), core = mk(4, 0.16); pivot.add(outer, core);
  const spot = new THREE.SpotLight('#fff0c0', 900, 140, 0.13, 0.6, 1.2); spot.castShadow = true; spot.shadow.mapSize.set(1024, 1024);
  pivot.add(spot); const tgt = new THREE.Object3D(); tgt.position.set(0, 0, -60); pivot.add(tgt); spot.target = tgt;
  pivot.rotation.x = -0.355;
  const set = (on, angle) => { pivot.visible = on > 0; outer.material.opacity = 0.11 * on; core.material.opacity = 0.16 * on; spot.intensity = 900 * on; pivot.rotation.y = angle; };
  return { pivot, set };
}

// ---------- the thing in the water ----------
export function creature() {
  const g = new THREE.Group(); const skin = toon('#1a2232');
  const body = part(new THREE.SphereGeometry(1, 28, 18), skin, [0, 0.2, -1], { outline: 0.03 }); body.scale.set(7, 3.4, 6); g.add(body);
  for (let i = 0; i < 5; i++) g.add(part(new THREE.ConeGeometry(0.7, 2.2 - i * 0.25, 6), skin, [0, 3.4 - i * 0.25, 1 - i * 2.2], { rot: [-0.5, 0, 0], outline: 0.03 }));
  const head = part(new THREE.SphereGeometry(3, 28, 18), skin, [0, 4.3, 4.2], { outline: 0.04 }); head.scale.set(1.15, 1, 1); g.add(head);
  const eyes = [];
  for (const s of [-1, 1]) {
    const white = new THREE.Mesh(new THREE.SphereGeometry(0.62, 16, 10), glow('#fff3b0')); white.position.set(s * 1.25, 5.0, 6.95); white.scale.set(1, 0.08, 0.5);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 8), glow('#1a0d0f')); pupil.position.set(0, 0, 0.45); white.add(pupil);
    g.add(white); eyes.push(white);
  }
  const eyeLight = new THREE.PointLight('#ffe9a0', 0, 18, 1.5); eyeLight.position.set(0, 5.2, 8.5); g.add(eyeLight);
  const foam = new THREE.Mesh(new THREE.RingGeometry(6.5, 8, 48), new THREE.MeshBasicMaterial({ color: '#9fb4d8', transparent: true, opacity: 0.35, depthWrite: false })); foam.rotation.x = -Math.PI / 2; foam.position.set(0, 0.05, -1);
  const root = new THREE.Group(); root.add(g); root.add(foam); root.position.set(...CREATURE);
  // rise: -1 (hidden) .. 0 (up); turn: 0 (side-on) .. 1 (facing +z); open: eyes 0..1
  const set = (t, rise, turn, open) => {
    g.position.y = rise >= 0 ? -1.6 * (1 - rise) : -1.6 + rise * 9;
    g.visible = g.position.y > -10.4; foam.visible = rise > -0.6;
    g.rotation.y = -Math.PI / 2 * (1 - turn);
    eyes.forEach((e) => (e.scale.y = 0.08 + 0.92 * open)); eyeLight.intensity = 30 * open;
    foam.scale.setScalar(1 + 0.04 * Math.sin(t * 3)); foam.material.opacity = 0.25 + 0.1 * Math.sin(t * 2.3);
  };
  return { root, body: g, set };
}

// ---------- a small steamer with lit portholes ----------
export function ship(color = '#7a2f2a', seed = 1) {
  const g = new THREE.Group();
  const hull = part(new THREE.BoxGeometry(9, 1.8, 2.8), toon(color), [0, 0.6, 0], { outline: 0.04 }); g.add(hull);
  g.add(part(new THREE.BoxGeometry(9.2, 0.25, 3.0), toon('#efe6d6'), [0, 1.55, 0], { outline: 0.02, edges: false }));
  g.add(part(new THREE.BoxGeometry(4, 1.5, 2.2), toon('#efe6d6'), [-0.6, 2.4, 0], { outline: 0.03 }));
  g.add(part(new THREE.CylinderGeometry(0.4, 0.45, 2.2, 14), toon('#c9452f'), [0.6, 4.0, 0], { outline: 0.03, edges: false }));
  g.add(part(new THREE.CylinderGeometry(0.07, 0.07, 4.5, 6), toon('#2b2b33'), [-3.2, 3.6, 0], { outline: 0.015, edges: false }));
  for (let i = 0; i < 5; i++) { const p = new THREE.Mesh(new THREE.CircleGeometry(0.18, 12), glow('#ffcf7a')); p.position.set(-2.2 + i * 1.1, 0.9, 1.42); g.add(p); }
  for (let i = 0; i < 3; i++) { const p = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.45), glow('#ffd98a')); p.position.set(-1.8 + i * 1.2, 2.5, 1.11); g.add(p); }
  const mast = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 6), glow('#fff0c0')); mast.position.set(-3.2, 5.9, 0); g.add(mast);
  const l = new THREE.PointLight('#ffcf7a', 14, 12, 1.4); l.position.set(0, 2.6, 2.4); g.add(l);
  return g;
}

// ---------- rain around the camera ----------
export function rain(n = 700, area = 14, height = 12, speed = 16) {
  const r = rng(5); const seeds = Array.from({ length: n }, () => [r() * 2 - 1, r(), r() * 2 - 1, 0.7 + r() * 0.6]);
  const pos = new Float32Array(n * 6); const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const lines = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: '#b9c9dc', transparent: true, opacity: 0.45, fog: true })); lines.frustumCulled = false;
  const update = (t, cam) => {
    seeds.forEach(([x, y, z, v], i) => {
      const yy = (((y * height - t * speed * v) % height) + height) % height + cam.y - height / 2;
      const X = cam.x + x * area, Z = cam.z + z * area;
      pos.set([X, yy, Z, X - 0.05, yy - 0.5, Z], i * 6);
    });
    geo.attributes.position.needsUpdate = true;
  };
  return { lines, update };
}

// painted wall card / board (flat, no stand)
export function card(lines, w, h, opts = {}) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: signTexture(lines, { w: 1024, h: Math.round((1024 * h) / w), ...opts }), fog: true }));
  return m;
}

// ---------- detail kit (v2) ----------
// painted brick texture
export function brickTex(base, seed = 1, repeat = [6, 3]) {
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'); const r = rng(seed);
  const col = new THREE.Color(base);
  g.fillStyle = '#' + col.clone().multiplyScalar(0.7).getHexString(); g.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 32) for (let x = (y / 32) % 2 ? -32 : 0; x < 256; x += 64) {
    const k = 0.9 + r() * 0.16; g.fillStyle = '#' + col.clone().multiplyScalar(k).getHexString(); g.fillRect(x + 3, y + 3, 58, 26);
  }
  for (let i = 0; i < 90; i++) { g.globalAlpha = 0.08 + r() * 0.12; g.fillStyle = r() > 0.5 ? '#000' : '#fff'; g.beginPath(); g.ellipse(r() * 256, r() * 256, 2 + r() * 10, 1 + r() * 5, r() * 3, 0, 7); g.fill(); }
  g.globalAlpha = 1;
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...repeat); t.anisotropy = 8; return t;
}
export function patternTex(draw, w = 256, h = 256, repeat = [1, 1]) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); draw(g, w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...repeat); t.anisotropy = 8; return t;
}
// soft fog bank / cloud card (always faces +z; rotate as needed)
const SOFT = {};
function softTex(color) {
  if (SOFT[color]) return SOFT[color];
  SOFT[color] = patternTex((g, w, h) => { const r = rng(3); for (let i = 0; i < 26; i++) { const x = w * (0.12 + r() * 0.76), y = h * (0.35 + r() * 0.35), rad = w * (0.08 + r() * 0.16); const gr = g.createRadialGradient(x, y, 0, x, y, rad); gr.addColorStop(0, color); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); } }, 512, 256);
  return SOFT[color];
}
export function fogBank(w, h, color = 'rgba(150,170,200,0.22)') {
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: softTex(color), transparent: true, depthWrite: false, fog: false }));
}
// moon / sun glitter path on the sea, toward a direction (x,z) on the horizon
export function glitterPath(color = '#fff1c4', toward = [-150, -420], opacity = 0.55) {
  const tex = patternTex((g, w, h) => { const r = rng(9); for (let i = 0; i < 520; i++) { const y = r() * h, spread = (y / h) * 0.5 + 0.06; const x = w / 2 + (r() - 0.5) * w * spread; g.fillStyle = `rgba(255,255,255,${0.25 + r() * 0.6})`; g.fillRect(x, y, 3 + r() * 18, 2 + r() * 2); } }, 256, 1024);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(60, 420), new THREE.MeshBasicMaterial({ map: tex, color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, toneMapped: false }));
  m.rotation.x = -Math.PI / 2; m.rotation.z = Math.atan2(toward[0], -toward[1]); m.position.set(toward[0] * 0.5, 0.06, toward[1] * 0.5);
  return m;
}
// distant coastline with a few lit windows
export function coastline(z = -260, color = '#141d30', lights = true) {
  const g = new THREE.Group(); const r = rng(17);
  const pts = []; for (let i = 0; i <= 40; i++) { const x = -400 + i * 20; pts.push(new THREE.Vector2(x, 6 + Math.sin(i * 0.7) * 5 + r() * 9)); }
  const sh = new THREE.Shape(); sh.moveTo(-400, -2); pts.forEach((p) => sh.lineTo(p.x, p.y)); sh.lineTo(400, -2); sh.lineTo(-400, -2);
  const m = new THREE.Mesh(new THREE.ShapeGeometry(sh), new THREE.MeshBasicMaterial({ color, fog: false })); m.position.z = z; g.add(m);
  if (lights) for (let i = 0; i < 26; i++) { const p = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.7), glow('#ffcf7a')); p.position.set(-300 + r() * 600, 1.5 + r() * 5, z + 0.5); g.add(p); }
  return g;
}
// low painted clouds
export function clouds(color = '#2a3858', n = 8, y = 70, seed = 2) {
  const g = new THREE.Group(); const r = rng(seed);
  for (let i = 0; i < n; i++) { const c = fogBank(80 + r() * 80, 30 + r() * 20, color); c.position.set(-250 + r() * 500, y + r() * 50, -300 - r() * 120); g.add(c); }
  return g;
}
// rocks with foam rings
export function rocks(seed = 4, n = 9, R = 11) {
  const g = new THREE.Group(); const r = rng(seed); const foams = [];
  const cols = ['#3b3a46', '#46434f', '#34323d', '#4d4a55'];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + r() * 0.5, d = R * (0.75 + r() * 0.45), s = 1.6 + r() * 2.4;
    const m = part(new THREE.DodecahedronGeometry(s, 0), toon(cols[i % 4]), [Math.cos(a) * d, s * 0.25 - 0.4, Math.sin(a) * d], { rot: [r() * 3, r() * 3, r() * 3], outline: 0.05 });
    m.scale.set(1, 0.7 + r() * 0.5, 1); g.add(m);
    const f = new THREE.Mesh(new THREE.RingGeometry(s * 0.95, s * 1.35, 24), new THREE.MeshBasicMaterial({ color: '#cfe0ef', transparent: true, opacity: 0.5, depthWrite: false })); f.rotation.x = -Math.PI / 2; f.position.set(m.position.x, 0.07, m.position.z); g.add(f); foams.push([f, r() * 6]);
    if (r() > 0.4) { const sw = part(new THREE.ConeGeometry(0.25, 1.2, 5), toon('#2f5a3a'), [m.position.x, 0.4, m.position.z + s * 0.6], { outline: 0.015, edges: false }); g.add(sw); }
  }
  return { group: g, update: (t) => foams.forEach(([f, p]) => { f.scale.setScalar(1 + 0.08 * Math.sin(t * 1.6 + p)); f.material.opacity = 0.32 + 0.18 * Math.sin(t * 1.6 + p); }) };
}
// small props
export function barrel(color = '#7a5236') { const g = new THREE.Group(); g.add(part(new THREE.CylinderGeometry(0.42, 0.42, 1.0, 14), toon(color), [0, 0.5, 0], { outline: 0.02, edges: false })); for (const y of [0.18, 0.82]) g.add(part(new THREE.TorusGeometry(0.43, 0.03, 6, 20), toon('#2b2b33'), [0, y, 0], { rot: [Math.PI / 2, 0, 0], outline: 0, edges: false })); return g; }
export function crate(s = 0.8, color = '#9a6b42') { const g = new THREE.Group(); g.add(part(new THREE.BoxGeometry(s, s, s), toon('#ffffff', paintTexture({ base: color, kind: 'planks', seed: 7 })), [0, s / 2, 0], { outline: 0.02 })); return g; }
export function rope(r = 0.35) { return part(new THREE.TorusGeometry(r, 0.07, 8, 24), toon('#c9a25a'), [0, 0.07, 0], { rot: [Math.PI / 2, 0, 0], outline: 0.012, edges: false }); }
export function bucket(color = '#7d93a3') { const g = new THREE.Group(); g.add(part(new THREE.CylinderGeometry(0.22, 0.17, 0.4, 14, 1, true), toon(color, null, { side: THREE.DoubleSide }), [0, 0.2, 0], { outline: 0.012, edges: false })); return g; }
export function lampPostSea() { const g = new THREE.Group(); g.add(part(new THREE.CylinderGeometry(0.06, 0.08, 2.6, 8), toon('#2b2b33'), [0, 1.3, 0], { outline: 0.012, edges: false })); const b = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 8), glow('#ffd98a')); b.position.y = 2.7; g.add(b); const l = new THREE.PointLight('#ffcf7a', 8, 7, 1.5); l.position.y = 2.7; g.add(l); return g; }
export function flag(color = '#c9452f') {
  const g = new THREE.Group(); g.add(part(new THREE.CylinderGeometry(0.05, 0.06, 6, 8), toon('#e8dcc4'), [0, 3, 0], { outline: 0.012, edges: false }));
  const cloth = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.0, 10, 1), toon(color, null, { side: THREE.DoubleSide })); cloth.position.set(0.82, 5.4, 0); g.add(cloth);
  const p0 = cloth.geometry.attributes.position.array.slice();
  return { group: g, update: (t) => { const p = cloth.geometry.attributes.position; for (let i = 0; i < p.count; i++) { const x = p0[i * 3]; p.setZ(i, Math.sin(t * 5 + x * 3) * 0.12 * (x + 0.8)); } p.needsUpdate = true; } };
}

// ground plane with a painted texture
export function ground(base, kind = 'asphalt', size = 400, rep = 60, seed = 3) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), toon('#ffffff', paintTexture({ base, kind, seed, repeat: [rep, rep] })));
  m.rotation.x = -Math.PI / 2; m.receiveShadow = true; return m;
}
// a row of low painted hills / mountains on the horizon
export function hills(color = '#c9a27a', z = -160, n = 9, h = 40, seed = 5) {
  const g = new THREE.Group(); const r = rng(seed);
  for (let i = 0; i < n; i++) { const m = part(new THREE.ConeGeometry(30 + r() * 40, h * (0.6 + r() * 0.8), 7), toon(color), [-220 + i * 55 + r() * 20, 0, z - r() * 60], { outline: 0.15, edges: false }); m.position.y = m.geometry.parameters.height / 2 - 2; g.add(m); }
  return g;
}
// smoke column (stacked soft cards that rise and turn to the camera)
export function smoke(x, z, color = 'rgba(40,36,44,0.55)', n = 6, seed = 1) {
  const g = new THREE.Group(); const r = rng(seed); const cards = [];
  for (let i = 0; i < n; i++) { const c = fogBank(8 + i * 3, 6 + i * 2, color); g.add(c); cards.push([c, r() * 10, i]); }
  g.position.set(x, 0, z);
  return { group: g, update: (t, cam) => cards.forEach(([c, ph, i]) => { const k = ((t * 0.12 + i / n + ph) % 1); c.position.set(Math.sin(ph + t * 0.2) * 2 * k, 2 + k * 26, 0); c.scale.setScalar(0.6 + k * 1.2); c.material.opacity = 1 - k; c.lookAt(cam.x, c.position.y + g.position.y, cam.z); }) };
}
// sandbag wall
export function sandbags(len = 4, rows = 2, seed = 2) {
  const g = new THREE.Group(); const r = rng(seed);
  for (let y = 0; y < rows; y++) for (let i = 0; i < len; i++) { const b = part(new THREE.CapsuleGeometry(0.22, 0.5, 4, 8), toon(['#b9a27a', '#a8916a', '#c4ad84'][Math.floor(r() * 3)]), [i * 0.75 + (y % 2) * 0.37, 0.24 + y * 0.42, 0], { rot: [0, 0, Math.PI / 2], outline: 0.02, edges: false }); g.add(b); }
  return g;
}
// army truck (cab + bed with canvas cover); returns {group, door} - door is the cab side panel (for an emblem)
export function truck(color = '#55623a') {
  const g = new THREE.Group();
  g.add(part(new THREE.BoxGeometry(2.2, 1.6, 1.8), toon(color), [2.1, 1.4, 0], { outline: 0.03 }));
  g.add(part(new THREE.BoxGeometry(1.2, 0.9, 1.9), toon(color), [3.6, 1.0, 0], { outline: 0.03 }));
  const win = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.6), toon('#9fc0d0')); win.position.set(2.1, 1.85, 0.91); g.add(win);
  g.add(part(new THREE.BoxGeometry(4.2, 0.5, 2.0), toon(color), [-1.1, 0.95, 0], { outline: 0.03 }));
  const cov = new THREE.CylinderGeometry(1.05, 1.05, 4.2, 20, 1, false, 0, Math.PI); cov.rotateZ(Math.PI / 2); cov.rotateX(-Math.PI / 2);
  g.add(part(cov, toon('#8a8a5a'), [-1.1, 1.2, 0], { rot: [0, 0, 0], outline: 0.03 }));
  for (const [x, z] of [[2.8, 0.95], [2.8, -0.95], [-0.2, 0.95], [-0.2, -0.95], [-2.4, 0.95], [-2.4, -0.95]]) g.add(part(new THREE.CylinderGeometry(0.48, 0.48, 0.35, 16), toon('#2b2b33'), [x, 0.48, z], { rot: [Math.PI / 2, 0, 0], outline: 0.02, edges: false }));
  const door = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.9), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })); door.position.set(2.05, 1.25, 0.91); g.add(door);
  return { group: g, door };
}
