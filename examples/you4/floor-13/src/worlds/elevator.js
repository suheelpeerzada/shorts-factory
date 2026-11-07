// FLOOR 13 — the old cage elevator. Locations: car, panel, lobby, night, climb, bricks, lever, open.
import * as THREE from 'three';
import { toon, part, paintTexture, rng, INK } from '../lib/toon.js';
import { makePerson, localToCanvas } from '../lib/char.js';
import { addLights } from '../Stage.jsx';
import { cameraPath } from '../lib/camera.js';
import { w, talking } from '../times.js';
import { ramp, smooth, pop, glow, card, patternTex, brickTex, crate } from './common.js';

export const YOU = { skin: '#f3d9c0', hair: '#6b4a32', outfit: 'coat', jacket: '#7a2f2a', jacket2: '#5f241f', shoes: INK, hat: 'peaked', hatColor: '#7a2f2a', hatColor2: '#4a1a16', badge: '#e1ad35', seed: 12, height: 1.74 };
const DOORMAN = { skin: '#ecd2b8', hair: '#ece8e0', brows: '#f1ede6', moustache: '#f4f1ea', old: true, outfit: 'coat', jacket: '#2f3a5a', jacket2: '#232c46', shoes: INK, hat: 'peaked', hatColor: '#2f3a5a', hatColor2: '#1c2236', badge: '#e1ad35', seed: 61, height: 1.76 };
const GIRL = { skin: '#e8e0e8', hair: '#1f1a1a', outfit: 'sweater', jacket: '#d8d8e8', jacket2: '#b8b8cc', shoes: INK, hat: 'none', seed: 13, height: 1.15 };
const V = (a) => new THREE.Vector3(...a);
const shake = (c, t, t0, d = 0.3, a = 0.05) => { if (t > t0 && t < t0 + d) { const s = (1 - (t - t0) / d) * a; c.pos.x += Math.sin(t * 97) * s; c.pos.y += Math.sin(t * 71 + 2) * s; } return c; };
const BRASS = '#c9a25a';
// car: x -1.1..1.1, z -1.1..1.1, gate at z = +1.1 (camera usually inside looking at the gate or at YOU)
const LEVER = [0.75, 1.05, 0.65], PANEL = [1.06, 1.45, 0.15];

export function makeElevator(id) {
  return function build(scene) {
    const root = new THREE.Group(); const r = rng(id.length * 11); const ups = []; const U = (f) => ups.push(f);
    const night = !['car', 'panel'].includes(id);
    if (id === 'lobby') return buildLobby(scene);
    addLights(scene, { center: [0, 0, 0], key: [-10, 20, 20], keyColor: '#9fb4d8', keyI: 0.15, hemiI: night ? 0.18 : 0.4, hemi: ['#6a5a4a', '#1a1410'], size: 6, fog: ['#0e0b0a', 6, 40] });
    const brass = toon(BRASS), dark = toon('#2b2b33');
    root.add(part(new THREE.BoxGeometry(2.3, 0.1, 2.3), toon('#ffffff', paintTexture({ base: '#5e412e', kind: 'planks', seed: 3, repeat: [2, 2] })), [0, -0.05, 0], { outline: 0.01 }));
    root.add(part(new THREE.BoxGeometry(2.3, 0.1, 2.3), toon('#3a2a20'), [0, 2.75, 0], { outline: 0.01 }));
    // cage bars on 3 sides with a brass rail, wood panelling below
    for (const [ax, az, len, rot] of [[-1.1, 0, 2.2, 0], [1.1, 0, 2.2, 0], [0, -1.1, 2.2, 1]]) {
      const n = 16; for (let i = 0; i <= n; i++) { const u = -len / 2 + (i / n) * len; root.add(part(new THREE.CylinderGeometry(0.015, 0.015, 1.7, 6), brass, rot ? [u, 1.85, az] : [ax, 1.85, u], { outline: 0.004, edges: false })); }
      root.add(part(new THREE.BoxGeometry(rot ? len : 0.06, 1.0, rot ? 0.06 : len), toon('#ffffff', paintTexture({ base: '#6b4a32', kind: 'planks', seed: 5 })), rot ? [0, 0.5, az] : [ax, 0.5, 0], { outline: 0.008, edges: false }));
      root.add(part(new THREE.BoxGeometry(rot ? len : 0.08, 0.06, rot ? 0.08 : len), brass, rot ? [0, 1.02, az] : [ax, 1.02, 0], { outline: 0.004, edges: false }));
    }
    // folding gate (X lattice) in front, slides to the left when it opens
    const gate = new THREE.Group(); gate.position.set(0, 0, 1.1); root.add(gate);
    const slats = [];
    for (let i = 0; i < 9; i++) { const s = new THREE.Group(); s.position.x = -1.0 + i * 0.25; gate.add(s); s.add(part(new THREE.CylinderGeometry(0.018, 0.018, 2.5, 6), brass, [0, 1.3, 0], { outline: 0.004, edges: false })); for (let k = 0; k < 4; k++) s.add(part(new THREE.BoxGeometry(0.34, 0.02, 0.02), brass, [0.12, 0.4 + k * 0.6, 0.01], { rot: [0, 0, (k % 2 ? 1 : -1) * 0.75], outline: 0.003, edges: false })); slats.push(s); }
    // outside the gate: shaft wall / landing / bricks
    const shaft = new THREE.Mesh(new THREE.PlaneGeometry(4, 6), toon('#ffffff', brickTex('#5a3a32', 8, [3, 4]))); shaft.position.set(0, 1.4, 1.9); shaft.rotation.y = Math.PI; root.add(shaft);
    const bricks = []; const bricked = id === 'bricks' || id === 'lever' || id === 'open';
    if (bricked) { for (let row = 0; row < 11; row++) for (let col = 0; col < 8; col++) { const b = part(new THREE.BoxGeometry(0.27, 0.2, 0.14), toon(['#8a4a3a', '#7a4234', '#94523f'][Math.floor(r() * 3)]), [-0.95 + col * 0.28 + (row % 2) * 0.14, 0.12 + row * 0.22, 1.35], { outline: 0.006 }); root.add(b); bricks.push([b, b.position.clone(), r()]); } }
    const dusts = []; for (let i = 0; i < 3; i++) { const d = new THREE.Mesh(new THREE.CircleGeometry(0.25, 16), new THREE.MeshBasicMaterial({ color: '#c8b8a0', transparent: true, opacity: 0, depthWrite: false })); d.position.set(-0.3 + i * 0.3, 1.5 - i * 0.2, 1.25); d.rotation.y = Math.PI; root.add(d); dusts.push(d); }
    // the void + the girl behind the bricks (open)
    const girl = makePerson(GIRL, { tint: '#24242c' }); girl.group.position.set(0.05, 0, 1.75); root.add(girl.group);
    const eyes = []; for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), glow('#fff3b0')); e.position.set(s * 0.09, 0.98, 1.62); root.add(e); eyes.push(e); }
    const redL = new THREE.PointLight('#ff3a2a', 0, 5, 1.4); redL.position.set(0.2, 1.5, 1.6); redL.userData.noShadow = true; root.add(redL);
    // ceiling bulb
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 8), glow('#ffe1a0')); bulb.position.set(0, 2.55, 0); root.add(bulb);
    root.add(part(new THREE.CylinderGeometry(0.01, 0.01, 0.15, 4), dark, [0, 2.65, 0], { outline: 0, edges: false }));
    const bl = new THREE.PointLight('#ffcf8a', 14, 7, 1.3); bl.position.set(0, 2.45, 0); root.add(bl);
    // dial indicator above the gate (inside)
    const dial = new THREE.Mesh(new THREE.CircleGeometry(0.3, 32, 0, Math.PI), toon('#e8dcc4')); dial.position.set(0, 2.42, 1.05); dial.rotation.y = Math.PI; root.add(dial);
    const dnums = card(['10   11   12   14'], 0.56, 0.1, { sizes: [80], bg: '#e8dcc4' }); dnums.position.set(0, 2.53, 1.04); dnums.rotation.y = Math.PI; root.add(dnums);
    const arrow = new THREE.Group(); arrow.position.set(0, 2.42, 1.03); arrow.rotation.y = Math.PI; root.add(arrow); arrow.add(part(new THREE.BoxGeometry(0.025, 0.26, 0.01), toon('#a3392d'), [0, 0.13, 0], { outline: 0, edges: false }));
    // operator lever (controller box + arm) on the right, near the gate
    const box = part(new THREE.BoxGeometry(0.22, 0.4, 0.18), brass, [LEVER[0] + 0.2, LEVER[1], LEVER[2]], { outline: 0.008 }); root.add(box);
    const lev = new THREE.Group(); lev.position.set(LEVER[0] + 0.08, LEVER[1] + 0.05, LEVER[2]); root.add(lev);
    lev.add(part(new THREE.CylinderGeometry(0.018, 0.018, 0.34, 8), toon('#2b2b33'), [0, 0.17, 0], { outline: 0.004, edges: false }));
    lev.add(part(new THREE.SphereGeometry(0.05, 10, 8), toon('#2b2b33'), [0, 0.35, 0], { outline: 0.006, edges: false }));
    // button panel on the right wall: 1..12, a blank, 14..20
    const pan = new THREE.Group(); pan.position.set(...PANEL); pan.rotation.y = -Math.PI / 2; root.add(pan);
    pan.add(part(new THREE.BoxGeometry(0.34, 0.86, 0.03), brass, [0, 0, 0], { outline: 0.006 }));
    const btns = {}; const order = [];
    for (let n = 1; n <= 20; n++) order.push(n);
    order.forEach((n, i) => { const col = i % 2, row = Math.floor(i / 2); const x = -0.07 + col * 0.14, y = 0.36 - row * 0.08; const b = new THREE.Mesh(new THREE.CircleGeometry(0.028, 16), n === 13 ? new THREE.MeshBasicMaterial({ color: '#2a2622', toneMapped: false }) : toon('#e8dcc4')); b.position.set(x, y, 0.017); pan.add(b); btns[n] = b; if (n !== 13) { const lab = card([String(n)], 0.05, 0.03, { sizes: [150], bg: BRASS, border: BRASS }); lab.position.set(x + 0.055, y, 0.017); pan.add(lab); } });
    const lab13 = card(['13'], 0.05, 0.03, { sizes: [150], bg: BRASS, fg: '#a3392d', border: BRASS }); lab13.position.set(btns[13].position.x + 0.055, btns[13].position.y, 0.018); pan.add(lab13);
    const glow13 = new THREE.PointLight('#ff3a2a', 0, 2.5, 1.4); glow13.position.set(PANEL[0] - 0.15, PANEL[1] + 0.04, PANEL[2]); glow13.userData.noShadow = true; root.add(glow13);
    // newspaper on the floor
    const paper = card(['THE DAILY STAR', '1931', '13TH FLOOR SEALED'], 0.6, 0.45, { sizes: [80, 150, 70], bg: '#e8dcc4' }); paper.rotation.x = -Math.PI / 2; paper.rotation.z = 0.3; paper.position.set(-0.4, 0.01, 0.4); root.add(paper); paper.visible = id === 'lever' || id === 'open';
    const you = makePerson(YOU, { tint: '#ffe0c8' }); you.group.position.set(0.55, 0, 0.15); root.add(you.group);
    U((t, cam) => {
      // 13: dark until "lights up" (car) / the click (night), then red and blooming
      const lit = (id === 'car' && t > w(0, '^lights') - 0.05) || (id === 'night' && t > w(2, '^glows') - 0.3) || ['climb', 'bricks', 'lever', 'open'].includes(id) || (id === 'panel');
      const blink = id === 'car' ? (Math.sin(t * 9) > 0 ? 1 : 0.35) : 1;
      btns[13].material.color.set(lit ? new THREE.Color('#ff5040').multiplyScalar(blink) : '#2a2622'); btns[13].visible = id !== 'panel' || t > 9.2;
      glow13.intensity = lit ? 8 * blink : 0;
      // bulb flicker; dies on "Your turn"
      const out = id === 'open' && t > w(5, '^turn');
      const flick = (id === 'climb' && Math.abs(t - w(2, '^stops')) < 0.4 && Math.sin(t * 60) > 0) ? 0.2 : 1;
      bl.intensity = out ? 0 : (night ? 9 : 16) * flick * (0.92 + 0.08 * Math.sin(t * 13)); bulb.material.color.set(out ? '#1a1410' : '#ffe1a0');
      // dial: 11 -> 12 -> (13 has no mark)
      const a11 = w(2, '^11'), a12 = w(2, '^12'), ast = w(2, '^stops');
      const ang = id === 'climb' ? (0.6 - 0.4 * smooth(ramp(t, a11 - 0.3, a11 + 0.2)) - 0.4 * smooth(ramp(t, a12 - 0.3, a12 + 0.2)) - 0.25 * smooth(ramp(t, ast - 0.4, ast))) : ['bricks', 'lever', 'open'].includes(id) ? -0.45 : 0.6;
      arrow.rotation.z = ang;
      // knocks: dust puffs on the bricks
      const ks = [w(2, '^Three'), w(2, '^slow'), w(2, '^knocks')];
      dusts.forEach((d, i) => { const k = id === 'bricks' ? (t - ks[i]) : -1; d.material.opacity = k > 0 && k < 0.6 ? 0.6 * (1 - k / 0.6) : 0; d.scale.setScalar(0.6 + Math.max(0, k) * 1.5); });
      // gate + bricks open by themselves
      const op = id === 'open' ? smooth(ramp(t, w(4, '^opening') - 0.3, w(4, '^says') + 0.2)) : 0;
      slats.forEach((s, i) => { s.position.x = -1.0 + i * 0.25 * (1 - op * 0.85) - op * 0.15; });
      bricks.forEach(([b, p0, q]) => { const k = id === 'open' ? ramp(t, w(4, '^opening') + q * 1.2, w(4, '^opening') + q * 1.2 + 0.7) : 0; b.position.set(p0.x + (q - 0.5) * k * 0.6, p0.y - k * k * p0.y, p0.z + k * 0.5); b.rotation.set(k * q * 3, 0, k * (q - 0.5) * 2); b.visible = true; });
      girl.group.visible = id === 'open' || (id === 'bricks' && false);
      girl.update(t, cam.position, 0, { talk: talking(t, 'GIRL') ? 1 : 0, expr: 'neutral', gesture: 'reach' });
      eyes.forEach((e) => { e.visible = id === 'open' && op > 0.5; e.scale.setScalar(1 + 0.2 * Math.sin(t * 6)); }); redL.intensity = id === 'open' ? 6 * op : 0;
      if (id === 'night' && t > w(2, '^glows')) bl.intensity *= 0.7;
      // car jolts when it stops
      root.position.y = id === 'climb' ? (t < ast ? -((t - 24) * 0.02) : -0.1 - Math.sin((t - ast) * 30) * Math.exp(-(t - ast) * 6) * 0.03) : 0;
      // YOU on the lever: hands follow the knob
      const knob = new THREE.Vector3(0, 0.35, 0); lev.updateMatrixWorld(); knob.applyMatrix4(lev.matrixWorld);
      const leverAng = id === 'climb' ? -0.5 : id === 'open' ? -0.2 + Math.sin(t * 20) * 0.03 : 0.3; lev.rotation.x = leverAng;
      you.group.visible = id !== 'open' || t < w(4, '^opening') + 2.5;
      const cp = cam.position; const zp = you.group.position.z + root.position.z; const k2 = (zp - cp.z) / (knob.z - cp.z || 1e-6);
      const px = cp.x + (knob.x - cp.x) * k2 - you.group.position.x, py = cp.y + (knob.y - cp.y) * k2 - root.position.y;
      const at = localToCanvas(YOU, px, py);
      let ex = 'neutral'; if (id === 'car' && t > w(0, '^lights')) ex = 'alarmed'; if (['night', 'climb'].includes(id) && t > w(2, '^click')) ex = 'alarmed'; if (['bricks', 'lever', 'open'].includes(id)) ex = 'scared';
      const holding = ['car', 'climb', 'lever'].includes(id) || (id === 'night' && t > w(2, '^climbs') - 0.5);
      you.update(t, cp, 0, { expr: ex, gesture: holding ? [[-1e9, 'grip', { at }]] : id === 'bricks' ? 'scared' : id === 'open' ? 'scared' : 'idle' });
    });
    return { root, update(t, camera) { ups.forEach((f) => f(t, camera)); } };
  };
}

function buildLobby(scene) {
  addLights(scene, { center: [0, 0, 0], key: [-20, 30, 30], keyColor: '#9fb4d8', keyI: 0.3, hemiI: 0.45, hemi: ['#6a5a4a', '#2a1a14'], size: 10, fog: ['#1a1410', 15, 80] });
  const root = new THREE.Group(); const ups = []; const U = (f) => ups.push(f);
  const marbleT = patternTex((g, W) => { for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { g.fillStyle = (x + y) % 2 ? '#e8e0d0' : '#5a4a3a'; g.fillRect(x * W / 8, y * W / 8, W / 8, W / 8); } }, 256, 256, [4, 4]);
  root.add(part(new THREE.BoxGeometry(12, 0.1, 10), toon('#ffffff', marbleT), [0, -0.05, 0], { outline: 0, edges: false }));
  root.add(part(new THREE.BoxGeometry(12, 4.5, 0.2), toon('#ffffff', paintTexture({ base: '#6b4a32', kind: 'planks', seed: 9, repeat: [4, 1] })), [0, 2.25, -3], { outline: 0, edges: false }));
  root.add(part(new THREE.BoxGeometry(12, 0.1, 10), toon('#2a1e16'), [0, 4.5, 0], { outline: 0, edges: false }));
  // brass elevator doors with a floor dial over them
  root.add(part(new THREE.BoxGeometry(2.4, 3.2, 0.12), toon(BRASS), [-1.6, 1.6, -2.88], { outline: 0.02 }));
  for (const x of [-2.08, -1.12]) root.add(part(new THREE.BoxGeometry(0.94, 2.6, 0.06), toon('#8a7a4a'), [x, 1.3, -2.8], { outline: 0.01 }));
  const dial = new THREE.Mesh(new THREE.CircleGeometry(0.34, 32, 0, Math.PI), toon('#e8dcc4')); dial.position.set(-1.6, 3.0, -2.8); root.add(dial);
  const dn = card(['1 . . 12  14 . . 20'], 0.66, 0.1, { sizes: [80], bg: '#e8dcc4' }); dn.position.set(-1.6, 3.1, -2.79); root.add(dn);
  const sign = card(['ELEVATOR', 'OPERATOR ON DUTY'], 1.2, 0.5, { sizes: [130, 70], bg: '#2b2b33', fg: '#e1ad35', border: '#e1ad35' }); sign.position.set(1.0, 2.6, -2.88); root.add(sign);
  for (const [x, z] of [[2.8, -2.4], [-4.2, -2.4]]) { root.add(part(new THREE.CylinderGeometry(0.3, 0.24, 0.5, 12), toon(BRASS), [x, 0.25, z], { outline: 0.01, edges: false })); for (let i = 0; i < 6; i++) root.add(part(new THREE.ConeGeometry(0.14, 1.1, 5), toon('#3f6f3a'), [x + Math.sin(i) * 0.15, 1.0, z + Math.cos(i) * 0.15], { rot: [Math.sin(i) * 0.5, 0, Math.cos(i) * 0.5], outline: 0.008, edges: false })); }
  const lampB = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 8), glow('#ffcf7a')); lampB.position.set(2.0, 1.6, -2.5); root.add(lampB);
  root.add(part(new THREE.CylinderGeometry(0.04, 0.06, 1.4, 8), toon(BRASS), [2.0, 0.75, -2.5], { outline: 0.006, edges: false }));
  const ll = new THREE.PointLight('#ffb866', 22, 9, 1.3); ll.position.set(2.0, 1.7, -2.2); root.add(ll);
  const dm = makePerson(DOORMAN, { tint: '#ffe4cc' }); dm.group.position.set(0.5, 0, -1.6); root.add(dm.group);
  U((t, cam) => { ll.intensity = 22 * (0.94 + 0.06 * Math.sin(t * 9)); dm.update(t, cam.position, 0, { talk: talking(t, 'DOORMAN') ? 1 : 0, expr: 'angry', gesture: [[-1e9, 'point', { angle: 0.15 }], [w(1, '^You$') - 0.1, 'wag']] }); });
  return { root, update(t, camera) { ups.forEach((f) => f(t, camera)); } };
}

// ---------- cameras ---------- (inside the car the camera stays within the cage: |x|,|z| < 1)
const F = (path, focus, extra = {}) => (t) => { const c = path(t); c.focus = typeof focus === 'function' ? focus(t) : V(focus); return Object.assign(c, extra); };
const YF = [0.55, 1.45, 0.15];
export const camCar = F(cameraPath([{ t: 0, pos: [-0.8, 1.9, 0.95], look: [0.6, 1.3, -0.2] }, { t: 4.2, pos: [-0.6, 1.6, 0.6], look: [0.6, 1.35, 0.2] }, { t: 5.4, pos: [0.3, 1.55, 0.7], look: [PANEL[0], PANEL[1], PANEL[2]] }, { t: 6.65, pos: [0.55, 1.5, 0.45], look: [PANEL[0], PANEL[1] - 0.2, PANEL[2]] }]), (t) => V(t < 5.0 ? YF : [PANEL[0], PANEL[1] - 0.2, PANEL[2]]));
export const camPanel = F(cameraPath([{ t: 6.65, pos: [0.62, 1.85, 0.2], look: [PANEL[0], 1.8, PANEL[2]] }, { t: 9.0, pos: [0.65, 1.55, 0.15], look: [PANEL[0], 1.48, PANEL[2]] }, { t: 12.3, pos: [0.7, 1.45, 0.12], look: [PANEL[0], 1.45, PANEL[2]] }]), (t) => V([PANEL[0], t < 9 ? 1.8 - (t - 6.65) * 0.14 : 1.45, PANEL[2]]), { cap: 'top' });
export const camLobby = F(cameraPath([{ t: 12.3, pos: [1.6, 1.9, 2.4], look: [0.5, 1.5, -1.6] }, { t: 17.6, pos: [0.9, 1.6, 0.5], look: [0.5, 1.48, -1.6] }]), [0.5, 1.48, -1.6]);
export const camNight = F(cameraPath([{ t: 17.6, pos: [-0.85, 2.1, -0.9], look: [0.5, 1.2, 0.4] }, { t: 20.0, pos: [-0.6, 1.7, -0.3], look: [0.5, 1.4, 0.2] }, { t: 21.6, pos: [0.2, 1.55, 0.5], look: [PANEL[0], 1.24, PANEL[2]] }, { t: 24.0, pos: [0.5, 1.5, 0.4], look: [PANEL[0], 1.24, PANEL[2]] }]), (t) => V(t < 21.0 ? YF : [PANEL[0], 1.24, PANEL[2]]));
export const camClimb = (t) => { const c = cameraPath([{ t: 24.0, pos: [0, 1.6, -0.6], look: [0, 2.4, 1.05] }, { t: 27.5, pos: [0, 1.9, -0.1], look: [0, 2.42, 1.05] }, { t: 29.3, pos: [-0.5, 1.6, -0.6], look: [0.55, 1.3, 0.3] }])(t); c.focus = V(t < 28.0 ? [0, 2.42, 1.05] : YF); return shake(c, t, w(2, '^stops'), 0.5, 0.06); };
export const camBricks = (t) => { const c = cameraPath([{ t: 29.3, pos: [0, 1.6, -0.5], look: [0, 1.4, 1.35] }, { t: 32.2, pos: [0, 1.5, 0.2], look: [0, 1.4, 1.35] }, { t: 36.6, pos: [0.05, 1.45, 0.55], look: [0, 1.3, 1.35] }])(t); c.focus = V([0, 1.4, 1.35]); for (const q of ['^Three', '^slow', '^knocks']) shake(c, t, w(2, q), 0.18, 0.03); return c; };
export const camLever = F(cameraPath([{ t: 36.6, pos: [-0.3, 1.35, 0.95], look: [0.8, 1.3, 0.3] }, { t: 39.0, pos: [-0.4, 1.6, 0.5], look: [0.55, 1.4, 0.15] }, { t: 42.0, pos: [-0.6, 1.4, 0.8], look: [-0.4, 0.05, 0.4] }, { t: 44.6, pos: [-0.5, 1.2, 0.7], look: [-0.4, 0.05, 0.4] }, { t: 46.9, pos: [-0.5, 1.6, -0.3], look: [0.55, 1.45, 0.15] }]), (t) => V(t > 41.8 && t < 44.8 ? [-0.4, 0.05, 0.4] : YF));
export const camOpen = F(cameraPath([{ t: 46.9, pos: [-0.2, 1.4, -0.7], look: [0, 1.2, 1.4] }, { t: 49.6, pos: [0, 1.1, 0.2], look: [0.05, 1.0, 1.7] }, { t: 52.5, pos: [0.03, 1.0, 0.7], look: [0.05, 0.98, 1.7] }]), [0.05, 0.98, 1.7]);
