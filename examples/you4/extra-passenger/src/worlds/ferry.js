// THE EXTRA PASSENGER — the last ferry of the night. Locations: pier, captain, board, fog, arrive, cabin, stuck.
import * as THREE from 'three';
import { toon, part, paintTexture, rng, INK } from '../lib/toon.js';
import { makePerson } from '../lib/char.js';
import { addLights } from '../Stage.jsx';
import { cameraPath } from '../lib/camera.js';
import { w, talking } from '../times.js';
import { ramp, smooth, pop, glow, sky, sea, card, crate, barrel, rope, bucket, fogBank, clouds, coastline, glitterPath, lampPostSea, patternTex } from './common.js';

export const YOU = { skin: '#f3d9c0', hair: '#6b4a32', outfit: 'raincoat', jacket: '#e1ad35', jacket2: '#c08f22', shoes: INK, hat: 'beanie', hatColor: '#2f4a6a', hatColor2: '#24384f', seed: 12, height: 1.74 };
const CAPT = { skin: '#ecd2b8', hair: '#ece8e0', brows: '#f1ede6', beard: '#e8e4dc', moustache: '#f4f1ea', old: true, outfit: 'coat', jacket: '#1f2a3c', jacket2: '#18202e', shoes: INK, hat: 'peaked', hatColor: '#1f2a3c', hatColor2: '#141b28', badge: '#e1ad35', seed: 41, height: 1.7 };
const STRANGER = { skin: '#d3dade', hair: '#2b2b33', outfit: 'coat', jacket: '#2a2f3a', jacket2: '#20242e', shoes: INK, hat: 'bowler', hatColor: '#1e2028', hatColor2: '#3a3f4a', seed: 99, height: 1.86 };
const PAX_COLORS = [['#a3392d', '#82291f'], ['#3f6f8f', '#2f5470'], ['#6f8f5a', '#55703f'], ['#7a5aa0', '#5f4580'], ['#c9a25a', '#a8833f'], ['#5b6b7b', '#46525f'], ['#b87a5a', '#9a6040'], ['#2f5a5a', '#234545'], ['#8a4a6a', '#6f3a55'], ['#4a6a3a', '#3a542c'], ['#9a8a6a', '#7f7152'], ['#3a3f6a', '#2c3052']];
const HATS = ['bowler', 'cap', 'none', 'beanie', 'none', 'bowler', 'cap', 'none', 'beanie', 'none', 'cap', 'bowler'];
const PAX = PAX_COLORS.map(([a, b], i) => ({ skin: ['#f3d9c0', '#e0b898', '#c99468', '#f6dfc8'][i % 4], hair: ['#3a2a22', '#6b4a32', '#1f1a1a', '#b08a50'][i % 4], outfit: i % 3 ? 'coat' : 'sweater', jacket: a, jacket2: b, shoes: INK, hat: HATS[i], hatColor: b, hatColor2: a, seed: 200 + i, height: 1.6 + (i % 4) * 0.07, old: i === 4 || i === 9, beard: i === 9 ? '#e8e4dc' : null, glasses: i === 2 || i === 7 }));
const V = (a) => new THREE.Vector3(...a);
const DECK = 1.2; // pier and deck height
const shake = (c, t, t0, d = 0.3, a = 0.05) => { if (t > t0 && t < t0 + d) { const s = (1 - (t - t0) / d) * a; c.pos.x += Math.sin(t * 97) * s; c.pos.y += Math.sin(t * 71 + 2) * s; } return c; };

function ferry() {
  const g = new THREE.Group(); const lights = [];
  g.add(part(new THREE.BoxGeometry(4.2, 1.6, 13), toon('#ffffff', paintTexture({ base: '#efe6d6', kind: 'planks', seed: 3, repeat: [1, 4] })), [0, 0.4, 0], { outline: 0.04 }));
  g.add(part(new THREE.BoxGeometry(4.3, 0.35, 13.1), toon('#2f4a6a'), [0, -0.35, 0], { outline: 0.02, edges: false }));
  g.add(part(new THREE.BoxGeometry(4.0, 0.1, 12.8), toon('#ffffff', paintTexture({ base: '#8a6142', kind: 'planks', seed: 4, repeat: [2, 6] })), [0, DECK, 0], { outline: 0.01, edges: false }));
  for (const sx of [-1, 1]) { g.add(part(new THREE.BoxGeometry(0.08, 0.08, 12.6), toon('#e8dcc4'), [sx * 2.0, DECK + 0.9, 0], { outline: 0.008, edges: false })); for (let z = -6; z <= 6; z += 1) g.add(part(new THREE.BoxGeometry(0.06, 0.9, 0.06), toon('#e8dcc4'), [sx * 2.0, DECK + 0.45, z], { outline: 0.006, edges: false })); }
  // wheelhouse at the stern (+z... stern = -z)
  const wh = new THREE.Group(); wh.position.set(0, DECK, -4.4); g.add(wh);
  wh.add(part(new THREE.BoxGeometry(3.2, 2.3, 2.8), toon('#ffffff', paintTexture({ base: '#e8dcc4', kind: 'planks', seed: 5, repeat: [2, 1] })), [0, 1.15, 0], { outline: 0.03 }));
  wh.add(part(new THREE.BoxGeometry(3.6, 0.2, 3.2), toon('#a3392d'), [0, 2.4, 0], { outline: 0.02 }));
  for (const x of [-0.9, 0, 0.9]) { const win = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.6), glow('#ffcf7a')); win.position.set(x, 1.6, 1.41); wh.add(win); lights.push(win); }
  wh.add(part(new THREE.BoxGeometry(0.8, 1.8, 0.06), toon('#3f6f8f'), [1.15, 0.9, 1.42], { outline: 0.01 }));
  wh.add(part(new THREE.CylinderGeometry(0.35, 0.4, 1.6, 14), toon('#2b2b33'), [0, 3.3, -0.6], { outline: 0.02, edges: false }));
  // benches + life rings + lanterns
  for (const z of [-1.6, 0.4, 2.4, 4.4]) for (const sx of [-1, 1]) g.add(part(new THREE.BoxGeometry(0.6, 0.45, 1.6), toon('#6b4a32'), [sx * 1.4, DECK + 0.23, z], { outline: 0.015 }));
  for (const z of [-2, 3]) g.add(part(new THREE.TorusGeometry(0.32, 0.08, 8, 20), toon('#e8dcc4'), [2.06, DECK + 0.6, z], { rot: [0, Math.PI / 2, 0], outline: 0.008, edges: false }));
  for (const z of [-2.6, 1.4, 5.6]) { const pole = part(new THREE.CylinderGeometry(0.04, 0.04, 1.8, 6), toon('#2b2b33'), [-1.95, DECK + 0.9, z], { outline: 0.005, edges: false }); g.add(pole); const b = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), glow('#ffd98a')); b.position.set(-1.95, DECK + 1.9, z); g.add(b); const l = new THREE.PointLight('#ffcf7a', 9, 7, 1.4); l.position.copy(b.position); g.add(l); lights.push(b, l); }
  return { group: g, lights };
}

function pier(root, r) {
  const plank = toon('#ffffff', paintTexture({ base: '#7a5a42', kind: 'planks', seed: 8, repeat: [1, 6] }));
  root.add(part(new THREE.BoxGeometry(4, 0.25, 26), plank, [0, DECK - 0.12, -4], { outline: 0.03 }));
  for (let z = -16; z <= 8; z += 3) for (const x of [-1.8, 1.8]) root.add(part(new THREE.CylinderGeometry(0.16, 0.16, 3, 8), toon('#4a3326'), [x, -0.3, z], { outline: 0.015, edges: false }));
  for (const z of [-12, -4, 4]) { const lp = lampPostSea(); lp.position.set(-1.7, DECK, z); root.add(lp); }
  const post = part(new THREE.CylinderGeometry(0.06, 0.06, 1.7, 8), toon('#4a3326'), [-1.3, DECK + 0.85, 1.6], { outline: 0.01, edges: false }); root.add(post);
  const sign = card(['COUNT THEM ON.', 'COUNT THEM OFF.'], 1.6, 0.8, { sizes: [130, 130], bg: '#f4ead2' }); sign.position.set(-1.3, DECK + 2.0, 1.62); root.add(sign);
  for (const z of [-2, 2]) root.add(part(new THREE.CylinderGeometry(0.2, 0.25, 0.45, 12), toon('#2b2b33'), [1.75, DECK + 0.22, z], { outline: 0.012, edges: false }));
  const c1 = crate(0.7); c1.position.set(-1.4, DECK, -6); root.add(c1); const c2 = crate(0.6); c2.position.set(-1.35, DECK + 0.7, -6.1); c2.rotation.y = 0.4; root.add(c2);
  const br = barrel(); br.position.set(-1.4, DECK, -8); root.add(br); const rp = rope(0.35); rp.position.set(1.3, DECK, -3); root.add(rp);
  const booth = new THREE.Group(); booth.position.set(-0.9, DECK, -14); root.add(booth);
  booth.add(part(new THREE.BoxGeometry(1.8, 2.4, 1.6), toon('#3f6f8f'), [0, 1.2, 0], { outline: 0.02 }));
  booth.add(part(new THREE.BoxGeometry(2.1, 0.15, 1.9), toon('#a3392d'), [0, 2.5, 0], { outline: 0.015 }));
  const bw = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.7), glow('#ffcf7a')); bw.position.set(0, 1.5, 0.81); booth.add(bw);
  // gangway from the pier edge to the ferry
  root.add(part(new THREE.BoxGeometry(1.4, 0.08, 1.0), toon('#6e6a72'), [2.55, DECK + 0.05, 0.5], { outline: 0.01 }));
}

const LIGHTS = { center: [0, 0, -2], key: [-50, 60, -80], keyColor: '#9fb4d8', keyI: 0.9, hemiI: 0.5, hemi: ['#3a5078', '#0a1018'], size: 30, fog: ['#3a4658', 14, 120] };

export function makeFerry(id) {
  return function build(scene) {
    const root = new THREE.Group(); const r = rng(id.length * 13); const ups = []; const U = (f) => ups.push(f);
    if (id === 'cabin') return buildCabin(scene);
    addLights(scene, { ...LIGHTS, fog: id === 'fog' ? ['#5a6474', 6, 60] : LIGHTS.fog });
    root.add(sky('night')); const S = sea('night'); root.add(S.mesh); U((t) => S.update(t));
    root.add(glitterPath('#fff1c4', [-150, -420], 0.35)); root.add(coastline(-200, '#141d30')); root.add(clouds('rgba(40,56,90,0.55)', 9, 50, 3));
    const banks = []; for (const [x, y, z, ww] of [[-30, 3, -40, 90], [30, 3, -60, 120], [0, 2.5, -25, 60], [-40, 4, -90, 160], [20, 2, 20, 80]]) { const f = fogBank(ww, 12, id === 'fog' ? 'rgba(190,200,215,0.5)' : 'rgba(140,160,200,0.22)'); f.position.set(x, y, z); root.add(f); banks.push([f, x]); }
    U((t, cam) => banks.forEach(([f, x]) => { f.position.x = x + Math.sin(t * 0.05 + x) * 5 + t * 0.5; f.lookAt(cam.position.x, f.position.y, cam.position.z); }));
    if (id !== 'fog') pier(root, r);
    const B = ferry(); root.add(B.group);
    const atSea = id === 'fog';
    B.group.position.set(atSea ? 0 : 4.3, 0, 0);
    U((t) => {
      B.group.position.y = Math.sin(t * 1.1) * (atSea ? 0.12 : 0.05); B.group.rotation.z = Math.sin(t * 0.8) * (atSea ? 0.05 : 0.015); B.group.rotation.x = Math.sin(t * 0.6) * (atSea ? 0.03 : 0.006);
      if (atSea) B.group.position.z = -(t - 16.5) * 1.5;
      // lights flicker on "flicker", then come back
      const fl = w(2, '^flicker'), back = w(2, '^back');
      const off = atSea && t > fl && t < back && Math.sin(t * 40) > -0.2;
      B.lights.forEach((o) => { if (o.isLight) o.intensity = off ? 0 : 9 * (0.9 + 0.1 * Math.sin(t * 11)); else o.material.color.set(off ? '#3a3020' : '#ffd98a'); });
    });
    const P = {}; const mk = (k, pal, tint = '#c9d4ee') => { const p = makePerson(pal, { tint }); (atSea ? B.group : root).add(p.group); P[k] = p; return p; };
    const you = mk('you', YOU), capt = mk('capt', CAPT, '#e9dcc8');
    const pax = PAX.map((pal, i) => mk('p' + i, pal));
    const str = mk('str', STRANGER, '#b9c8e0');
    str.material.transparent = true;
    // drips falling off the stranger
    const drips = Array.from({ length: 10 }, (_, i) => { const d = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 4), glow('#bfe0ff')); root.add(d); return [d, i]; });
    // walking paths (world coords, pier at x=0, ferry at x=4.3)
    const ONB = (i) => [4.3 + (i % 2 ? 1.4 : -1.4) * 0.95, DECK, -1.6 + Math.floor(i / 2) * 1.0];
    const path = (pts, u) => { const n = pts.length - 1, k = Math.min(n - 1e-6, Math.max(0, u * n)), i = Math.floor(k), f = k - i; return pts[i].map((v, j) => v + (pts[i + 1][j] - v) * f); };
    U((t, cam) => {
      const cp = cam.position;
      you.group.position.set(1.55, DECK, 1.2);
      capt.group.position.set(atSea ? 1.15 : 5.45, DECK, atSea ? -2.8 : -2.6);
      str.group.visible = false; drips.forEach(([d]) => (d.visible = false));
      if (id === 'pier' || id === 'captain') {
        pax.forEach((p, i) => { p.group.visible = false; });
        you.update(t, cp, 0, { expr: 'neutral', gesture: [[-1e9, 'counter', { prop: 'counter' }]] });
        capt.update(t, cp, 0, { talk: talking(t, 'CAPTAIN') ? 1 : 0, expr: id === 'captain' ? 'angry' : 'neutral', gesture: id === 'captain' ? 'wag' : 'hips' });
      }
      if (id === 'board') {
        pax.forEach((p, i) => {
          const t0 = 11.3 + i * 0.36, u = ramp(t, t0, t0 + 2.4);
          const pos = path([[-0.6, DECK, -9 + (i % 3) * 0.4], [1.2, DECK, -0.2], [2.9, DECK, 0.5], ONB(i)], u);
          p.group.position.set(...pos); p.group.visible = t > t0 - 0.2; p.update(t, cp, u > 0 && u < 1 ? 1.6 : 0, { expr: i % 4 === 0 ? 'smug' : 'neutral' });
        });
        const counting = pax.some((_, i) => Math.abs(t - (11.3 + i * 0.36 + 1.2)) < 0.08);
        you.update(t, cp, 0, { expr: t > w(2, '^twice') ? 'smug' : 'neutral', gesture: [[-1e9, 'counter', { prop: 'counter', click: counting }]] });
        capt.update(t, cp, 0, { expr: 'neutral' });
      }
      if (id === 'fog') {
        pax.forEach((p, i) => { p.group.position.set(...ONB(i).map((v, j) => (j === 0 ? v - 4.3 : v))); p.update(t, cp, 0, { expr: t > w(2, '^coughs') ? 'scared' : 'neutral', gesture: t > w(2, '^flicker') && t < w(2, '^back') ? 'scared' : 'idle' }); });
        you.group.position.set(0.2, DECK, 4.2); you.update(t, cp, 0, { expr: t > w(2, '^fog') ? 'alarmed' : 'neutral', gesture: t > w(2, '^flicker') ? 'scared' : [[-1e9, 'counter', { prop: 'counter' }]] });
        capt.update(t, cp, 0, { expr: 'alarmed' });
      }
      if (id === 'arrive') {
        const tc = [w(2, '^Ten') - 0.6, w(2, '^Eleven') - 0.6, w(2, '^Twelve') - 0.6];
        pax.forEach((p, i) => {
          const t0 = i < 9 ? 23.2 + i * 0.25 : tc[i - 9], u = ramp(t, t0, t0 + 2.2);
          const pos = path([ONB(i), [2.9, DECK, 0.5], [1.0, DECK, -0.6], [-0.6, DECK, -10 - (i % 3)]], u);
          p.group.position.set(...pos); p.group.visible = u < 0.999; p.update(t, cp, u > 0 && u < 1 ? 1.6 : 0, { expr: 'neutral' });
        });
        const t13 = w(2, '^Thirteen') - 0.7, gone = w(3, '^time') + 0.2;
        str.group.visible = t > t13 - 0.3;
        const su = ramp(t, t13, t13 + 0.9), away = ramp(t, gone, gone + 1.6);
        const sp = path([[4.3, DECK, 2.6], [2.9, DECK, 0.6], [1.0, DECK, 0.0], [-0.4, DECK, -8]], 0.66 * su + 0.34 * away);
        str.group.position.set(...sp); str.material.opacity = 1 - away;
        str.update(t, cp, (su > 0 && su < 1) || away > 0 ? 1.2 : 0, { talk: talking(t, 'STRANGER') ? 1 : 0, expr: 'smug', gesture: t > w(3, '^Thank') - 0.1 && t < gone ? 'wave' : 'idle' });
        drips.forEach(([d, i]) => { const k = ((t * 1.6 + i / 10) % 1); d.visible = str.group.visible && away < 0.5; d.position.set(sp[0] + Math.sin(i * 2.1) * 0.3, sp[1] + 1.5 - k * 1.5, sp[2] + Math.cos(i * 1.7) * 0.15 + 0.1); });
        const click = [w(2, '^Ten'), w(2, '^Eleven'), w(2, '^Twelve'), w(2, '^Thirteen')].some((q) => Math.abs(t - q) < 0.1);
        you.update(t, cp, 0, { expr: t > w(2, '^Thirteen') - 0.05 ? 'alarmed' : 'neutral', gesture: [[-1e9, 'counter', { prop: 'counter', click }]] });
        capt.group.visible = false;
      }
      if (id === 'stuck') {
        pax.forEach((p) => (p.group.visible = false)); capt.group.visible = false;
        const step = w(4, '^step'), feet = w(4, '^feet');
        you.group.position.set(4.3 - 1.3, DECK, 0.8);
        you.update(t, cp, t > step && t < feet ? 1.4 : 0, { expr: t > w(4, '^So') ? 'scared' : 'alarmed', gesture: t > feet ? 'scared' : t > step ? 'push' : [[-1e9, 'counter', { prop: 'counter' }]] });
        str.group.visible = t > w(4, '^Tonight') - 0.2 && t < w(4, '^So'); str.group.position.set(-0.3, DECK, -10 - (t - 45) * 0.6); str.material.opacity = 0.65; str.update(t, cp, 1.2, { expr: 'smug' });
      }
    });
    // wet seat on the ferry (the stranger's)
    if (id === 'stuck') { const wet = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 1.4), toon('#3a2a20')); wet.rotation.x = -Math.PI / 2; wet.position.set(4.3 + 1.4, DECK + 0.47, 2.4); root.add(wet); const pud = new THREE.Mesh(new THREE.CircleGeometry(0.6, 20), new THREE.MeshBasicMaterial({ color: '#9fb4d8', transparent: true, opacity: 0.45 })); pud.rotation.x = -Math.PI / 2; pud.position.set(4.3 + 1.0, DECK + 0.07, 2.4); root.add(pud);
      const sc = card(['RESERVED'], 0.5, 0.18, { sizes: [130], bg: '#f4ead2', fg: '#a3392d', border: '#a3392d' }); sc.position.set(4.3 + 1.4, DECK + 0.75, 3.2); sc.rotation.x = -0.4; root.add(sc); }
    return { root, update(t, camera) { ups.forEach((f) => f(t, camera)); } };
  };
}

function buildCabin(scene) {
  addLights(scene, { center: [0, 0, 0], key: [-20, 30, 30], keyColor: '#9fb4d8', keyI: 0.2, hemiI: 0.4, hemi: ['#5a5a6a', '#2a1a14'], size: 8, fog: ['#2a2a34', 20, 80] });
  const root = new THREE.Group(); const ups = []; const U = (f) => ups.push(f);
  const wall = toon('#ffffff', paintTexture({ base: '#8f6446', kind: 'planks', seed: 21, repeat: [3, 1] }));
  root.add(part(new THREE.BoxGeometry(5, 0.1, 5), toon('#ffffff', paintTexture({ base: '#5e412e', kind: 'planks', seed: 22, repeat: [3, 3] })), [0, -0.05, 0], { outline: 0, edges: false }));
  root.add(part(new THREE.BoxGeometry(5, 0.1, 5), toon('#3a281e'), [0, 2.6, 0], { outline: 0, edges: false }));
  for (const sx of [-1, 1]) root.add(part(new THREE.BoxGeometry(0.1, 2.6, 5), wall, [sx * 2.5, 1.3, 0], { outline: 0, edges: false }));
  root.add(part(new THREE.BoxGeometry(5, 2.6, 0.1), wall, [0, 1.3, 2.5], { outline: 0, edges: false }));
  // front windows with fog outside
  root.add(part(new THREE.BoxGeometry(5, 1.0, 0.1), wall, [0, 0.5, -2.5], { outline: 0, edges: false }));
  root.add(part(new THREE.BoxGeometry(5, 0.5, 0.1), wall, [0, 2.35, -2.5], { outline: 0, edges: false }));
  for (const x of [-2.4, -0.8, 0.8, 2.4]) root.add(part(new THREE.BoxGeometry(0.12, 1.1, 0.14), toon('#e8dcc4'), [x, 1.55, -2.5], { outline: 0.01, edges: false }));
  const fogOut = fogBank(30, 12, 'rgba(200,210,225,0.85)'); fogOut.position.set(0, 1.5, -8); root.add(fogOut);
  const fogBg = new THREE.Mesh(new THREE.PlaneGeometry(60, 30), new THREE.MeshBasicMaterial({ color: '#56607a', fog: false })); fogBg.position.set(0, 2, -14); root.add(fogBg);
  // wheel, binnacle, chart table + logbook, cap on a hook, swinging lamp
  const wheel = new THREE.Group(); wheel.position.set(-1.0, 1.25, -1.9); root.add(wheel);
  wheel.add(part(new THREE.TorusGeometry(0.42, 0.04, 8, 28), toon('#7a5236'), [0, 0, 0], { outline: 0.008, edges: false }));
  for (let i = 0; i < 8; i++) wheel.add(part(new THREE.CylinderGeometry(0.02, 0.02, 1.05, 6), toon('#7a5236'), [0, 0, 0], { rot: [0, 0, (i / 8) * Math.PI], outline: 0.004, edges: false }));
  root.add(part(new THREE.CylinderGeometry(0.18, 0.22, 1.0, 12), toon('#c9a25a'), [-1.0, 0.5, -1.7], { outline: 0.01, edges: false }));
  root.add(part(new THREE.BoxGeometry(1.6, 0.08, 1.0), toon('#ffffff', paintTexture({ base: '#6b4a32', kind: 'planks', seed: 23 })), [1.0, 0.95, -1.2], { outline: 0.015 }));
  for (const [x, z] of [[0.3, -1.6], [1.7, -1.6], [0.3, -0.8], [1.7, -0.8]]) root.add(part(new THREE.BoxGeometry(0.06, 0.95, 0.06), toon('#5b3a2a'), [x, 0.47, z], { outline: 0.008, edges: false }));
  const book = new THREE.Group(); book.position.set(1.0, 1.0, -1.2); book.rotation.x = -Math.PI / 2; root.add(book);
  book.add(new THREE.Mesh(new THREE.PlaneGeometry(0.92, 0.6), toon('#5b2a22')));
  const L = card(['SHIP LOG', '1952', 'NIGHT CROSSING'], 0.42, 0.54, { sizes: [80, 150, 64], bg: '#f4ead2' }); L.position.set(-0.22, 0, 0.005); book.add(L);
  const R1 = card(['SANK IN FOG'], 0.42, 0.14, { sizes: [90], bg: '#f4ead2', fg: '#a3392d', border: '#f4ead2' }); R1.position.set(0.22, 0.18, 0.005); book.add(R1);
  const R2 = card(['13 ABOARD'], 0.42, 0.14, { sizes: [110], bg: '#f4ead2', border: '#f4ead2' }); R2.position.set(0.22, 0.02, 0.006); book.add(R2);
  const R3 = card(['12 FOUND'], 0.42, 0.14, { sizes: [110], bg: '#f4ead2', fg: '#a3392d', border: '#f4ead2' }); R3.position.set(0.22, -0.14, 0.006); book.add(R3);
  root.add(part(new THREE.CylinderGeometry(0.02, 0.02, 0.12, 6), toon('#2b2b33'), [2.42, 1.9, 0.6], { rot: [0, 0, Math.PI / 2], outline: 0, edges: false }));
  const cap = new THREE.Group(); cap.position.set(2.33, 1.82, 0.6); root.add(cap);
  cap.add(part(new THREE.CylinderGeometry(0.17, 0.15, 0.1, 16), toon('#1f2a3c'), [0, 0, 0], { rot: [0, 0, Math.PI / 2], outline: 0.008, edges: false }));
  const hang = new THREE.Group(); hang.position.set(0.6, 2.5, -0.6); root.add(hang);
  hang.add(part(new THREE.CylinderGeometry(0.01, 0.01, 0.5, 4), toon('#2b2b33'), [0, -0.25, 0], { outline: 0, edges: false }));
  const hb = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 8), glow('#ffcf7a')); hb.position.y = -0.58; hang.add(hb);
  const hl = new THREE.PointLight('#ffb866', 18, 8, 1.3); hl.position.y = -0.65; hang.add(hl);
  const you = makePerson(YOU, { tint: '#ffe8d0' }); you.group.position.set(1.05, 0, -2.0); root.add(you.group);
  U((t, cam) => {
    hang.rotation.z = Math.sin(t * 1.4) * 0.1; hang.rotation.x = Math.sin(t * 1.1) * 0.06; hl.intensity = 18 * (0.9 + 0.1 * Math.sin(t * 9));
    R1.scale.setScalar(pop(ramp(t, w(4, '^sank') - 0.05, w(4, '^sank') + 0.25))); R2.scale.setScalar(pop(ramp(t, w(4, '^13') - 0.05, w(4, '^13') + 0.25))); R3.scale.setScalar(pop(ramp(t, w(4, '^12') - 0.05, w(4, '^12') + 0.25)));
    fogOut.position.x = Math.sin(t * 0.3) * 2; root.rotation.z = Math.sin(t * 0.8) * 0.012;
    you.update(t, cam.position, 0, { expr: t > w(4, '^13') ? 'scared' : 'alarmed', gesture: [[-1e9, 'reachL', { dx: 30, dy: 70 }], [w(4, '^13'), 'scared']] });
  });
  return { root, update(t, camera) { ups.forEach((f) => f(t, camera)); } };
}

// ---------- cameras ----------
const F = (path, focus, extra = {}) => (t) => { const c = path(t); c.focus = typeof focus === 'function' ? focus(t) : V(focus); return Object.assign(c, extra); };
export const camPier = F(cameraPath([{ t: 0, pos: [-3, 2.4, 10], look: [2.5, 2, -2] }, { t: 3.4, pos: [-0.8, 2.0, 6.2], look: [2.0, 1.9, 0] }, { t: 6.55, pos: [0.4, 2.5, 4.4], look: [1.55, 2.6, 1.2] }]), [1.55, 2.6, 1.2]);
export const camCaptain = F(cameraPath([{ t: 6.55, pos: [4.2, 2.8, 0.2], look: [5.45, 2.6, -2.6] }, { t: 11.1, pos: [4.8, 2.65, -0.9], look: [5.45, 2.6, -2.6] }]), [5.45, 2.6, -2.6]);
export const camBoard = F(cameraPath([{ t: 11.1, pos: [-2.4, 2.6, 5.2], look: [1.6, 1.8, -2] }, { t: 13.8, pos: [-0.6, 2.2, 4.4], look: [2.0, 1.9, -0.6] }, { t: 15.0, pos: [0.4, 2.5, 3.6], look: [1.55, 2.4, 1.2] }, { t: 16.5, pos: [0.7, 2.55, 3.2], look: [1.55, 2.5, 1.2] }]), (t) => V(t < 14.6 ? [2.2, 1.9, -0.4] : [1.55, 2.5, 1.2]));
const fogP = cameraPath([{ t: 16.5, pos: [9, 3.5, 6], look: [0, 1.6, -2] }, { t: 19.5, pos: [6, 2.8, 1], look: [0, 1.8, -4] }, { t: 21.0, pos: [0.9, 2.6, 7.2], look: [0.2, 2.2, 3.4] }, { t: 23.05, pos: [0.6, 2.5, 6.6], look: [0.2, 2.3, 3.4] }]);
export const camFog = (t) => { const c = fogP(t); const z = -(t - 16.5) * 1.5; c.pos.z += z; c.look.z += z; c.focus = V([0.2, 2.2, 3.4 + z]); c.pos.y += Math.sin(t * 1.1) * 0.12; return shake(c, t, w(2, '^coughs'), 0.4, 0.05); };
const arr = cameraPath([{ t: 23.05, pos: [-2.0, 2.4, 5.5], look: [1.6, 2.0, -0.5] }, { t: 27.8, pos: [-0.4, 2.3, 4.2], look: [1.4, 2.2, 0.6] }, { t: 29.4, pos: [-0.2, 2.6, 3.2], look: [1.0, 2.65, 0.0] }, { t: 32.5, pos: [0.4, 2.5, 3.0], look: [-0.2, 2.3, -6] }]);
export const camArrive = (t) => { const c = arr(t); c.focus = V(t < 28.2 ? [1.55, 2.5, 1.2] : t < 31.9 ? [1.0, 2.7, 0.0] : [-0.3, 2.4, -6]); return shake(c, t, w(2, '^Thirteen'), 0.3, 0.04); };
export const camCabin = F(cameraPath([{ t: 32.5, pos: [0.3, 1.9, 0.8], look: [1.0, 1.4, -1.6] }, { t: 35.4, pos: [0.8, 1.9, -0.3], look: [1.0, 1.0, -1.2] }, { t: 38.5, pos: [1.0, 1.75, -0.65], look: [1.0, 1.0, -1.2] }, { t: 42.1, pos: [1.15, 1.65, -0.6], look: [1.1, 1.0, -1.2] }]), [1.0, 1.0, -1.2], { cap: 'top' });
const stk = cameraPath([
  { t: 42.1, pos: [4.0, 2.4, 4.6], look: [5.7, 1.7, 2.4] },
  { t: 45.2, pos: [4.2, 2.2, 4.0], look: [5.7, 1.7, 2.4] },
  { t: 45.6, pos: [3.6, 2.6, 3.2], look: [-0.3, 2.4, -10] },
  { t: 47.6, pos: [3.4, 2.6, 2.8], look: [-0.3, 2.4, -12] },
  { t: 48.0, pos: [1.6, 2.6, 3.6], look: [3.0, 2.7, 0.8] },
  { t: 52.0, pos: [2.0, 2.55, 2.8], look: [3.0, 2.65, 0.8] },
  { t: 54.74, pos: [2.6, 1.55, 2.0], look: [3.0, 1.25, 0.8] },
]);
export const camStuck = (t) => { const c = stk(t); c.focus = V(t < 45.4 ? [5.7, 1.7, 2.4] : t < 47.8 ? [-0.3, 2.4, -11] : t < 52 ? [3.0, 2.6, 0.8] : [3.0, 1.3, 0.8]); if (t > 52.0) c.cap = 'top'; return c; };
