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

// ---------- the lighthouse on its rock, with a jetty and a door ----------
export function lighthouse() {
  const g = new THREE.Group();
  const rock = part(new THREE.DodecahedronGeometry(9, 1), toon('#3b3a46'), [0, -2.2, 0], { outline: 0.06 }); rock.scale.set(1.3, 0.42, 1.3); g.add(rock);
  g.add(part(new THREE.CylinderGeometry(7, 7.6, 1.6, 40), toon('#ffffff', paintTexture({ base: '#7d7a80', kind: 'asphalt', seed: 5, repeat: [6, 1] })), [0, BASE_Y - 0.8, 0], { outline: 0.04, edges: false }));
  // jetty toward +z
  const plank = toon('#ffffff', paintTexture({ base: '#8a6142', kind: 'planks', seed: 8, repeat: [1, 3] }));
  g.add(part(new THREE.BoxGeometry(2.6, 0.2, 12), plank, [0, BASE_Y - 0.1, 12], { outline: 0.03 }));
  for (const z of [8, 12, 16]) for (const x of [-1.2, 1.2]) g.add(part(new THREE.CylinderGeometry(0.15, 0.15, 3, 8), toon('#5b3a2a'), [x, BASE_Y - 1.6, z], { outline: 0.02, edges: false }));
  const n = 5, H = 20;
  for (let i = 0; i < n; i++) {
    const r0 = 2.4 - (0.8 * i) / n, r1 = 2.4 - (0.8 * (i + 1)) / n;
    g.add(part(new THREE.CylinderGeometry(r1, r0, H / n, 28), toon(i % 2 ? '#b8372f' : '#efe6d6'), [0, BASE_Y + (H / n) * (i + 0.5), 0], { outline: 0.04, edges: false }));
  }
  // door + lit window
  g.add(part(new THREE.BoxGeometry(1.2, 2.1, 0.2), toon('#3f6f8f'), [0, BASE_Y + 1.05, 2.33], { outline: 0.02 }));
  g.add(part(new THREE.SphereGeometry(0.07, 8, 6), toon('#e1ad35'), [0.42, BASE_Y + 1.05, 2.45], { outline: 0.01, edges: false }));
  const win = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.85, 0.1), glow('#ffcf7a')); win.position.set(0, 12, 2.03); g.add(win);
  g.add(part(new THREE.CylinderGeometry(2.85, 2.85, 0.3, 36), toon('#2b2b33'), [0, GALLERY_Y - 0.15, 0], { outline: 0.04 }));
  g.add(part(new THREE.TorusGeometry(2.75, 0.05, 6, 48), toon('#2b2b33'), [0, GALLERY_Y + 0.9, 0], { rot: [Math.PI / 2, 0, 0], outline: 0.02, edges: false }));
  for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2; g.add(part(new THREE.CylinderGeometry(0.04, 0.04, 0.9, 6), toon('#2b2b33'), [Math.cos(a) * 2.75, GALLERY_Y + 0.45, Math.sin(a) * 2.75], { outline: 0.015, edges: false })); }
  const lanternMat = new THREE.MeshBasicMaterial({ color: '#3a4258', fog: false, toneMapped: false });
  const lantern = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.3, 1.8, 16), lanternMat); lantern.position.y = LANTERN_Y; g.add(lantern);
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; g.add(part(new THREE.BoxGeometry(0.08, 1.8, 0.08), toon('#2b2b33'), [Math.cos(a) * 1.32, LANTERN_Y, Math.sin(a) * 1.32], { outline: 0.015, edges: false })); }
  g.add(part(new THREE.ConeGeometry(1.7, 1.4, 16), toon('#2b2b33'), [0, LANTERN_Y + 1.6, 0], { outline: 0.04 }));
  const lamp = new THREE.PointLight('#ffd98a', 0, 30, 1.6); lamp.position.set(0, LANTERN_Y, 0); g.add(lamp);
  // on: 0..1 (lantern lit)
  const setOn = (on, t = 0, flare = 0) => {
    if (on > 0) lanternMat.color.setHSL(0.11, 1, (0.5 + 0.16 * on) + 0.12 * flare); else lanternMat.color.set('#3a4258');
    lamp.intensity = 40 * on * (0.92 + 0.08 * Math.sin(t * 17)) * (1 + flare * 1.5);
  };
  return { group: g, setOn };
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
