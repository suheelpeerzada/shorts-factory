// ROOM 312 — the old hotel. Locations: lobby, manager, keys, lift (lobby world), hall, room, reveal (room world).
import * as THREE from 'three';
import { toon, part, paintTexture, rng, INK } from '../lib/toon.js';
import { makePerson } from '../lib/char.js';
import { addLights } from '../Stage.jsx';
import { cameraPath } from '../lib/camera.js';
import { w, talking } from '../times.js';
import { ramp, smooth, pop, glow, card, patternTex, crate } from './common.js';

export const YOU = { skin: '#f3d9c0', hair: '#6b4a32', outfit: 'coat', jacket: '#a3392d', jacket2: '#82291f', shoes: INK, hat: 'none', seed: 12, height: 1.74 };
const MANAGER = { skin: '#efd9c4', hair: '#d8d4cc', moustache: '#d8d4cc', brows: '#e8e4dc', old: true, outfit: 'suit', jacket: '#2b2b38', jacket2: '#20202a', tie: '#a3392d', shoes: INK, hat: 'none', glasses: true, seed: 81, height: 1.78 };
const V = (a) => new THREE.Vector3(...a);
const shake = (c, t, t0, d = 0.3, a = 0.04) => { if (t > t0 && t < t0 + d) { const s = (1 - (t - t0) / d) * a; c.pos.x += Math.sin(t * 97) * s; c.pos.y += Math.sin(t * 71 + 2) * s; } return c; };
const marble = () => patternTex((g, W) => { const r = rng(4); for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { g.fillStyle = (x + y) % 2 ? '#e8e0d0' : '#3a3440'; g.fillRect(x * W / 8, y * W / 8, W / 8, W / 8); } g.globalAlpha = 0.15; for (let i = 0; i < 40; i++) { g.strokeStyle = r() > 0.5 ? '#fff' : '#000'; g.lineWidth = 1 + r() * 2; g.beginPath(); g.moveTo(r() * W, r() * W); g.lineTo(r() * W, r() * W); g.stroke(); } g.globalAlpha = 1; }, 512, 512, [6, 6]);
const wallpaper = (base = '#5a2a34', fg = 'rgba(225,173,53,0.35)') => patternTex((g, W) => { g.fillStyle = base; g.fillRect(0, 0, W, W); g.fillStyle = fg; for (let y = 0; y < 6; y++) for (let x = 0; x < 6; x++) { const cx = (x + (y % 2) * 0.5) * W / 6 + 20, cy = y * W / 6 + 20; g.beginPath(); g.moveTo(cx, cy - 14); g.lineTo(cx + 9, cy); g.lineTo(cx, cy + 14); g.lineTo(cx - 9, cy); g.closePath(); g.fill(); } }, 256, 256, [4, 2]);
const carpet = () => patternTex((g, W, H) => { g.fillStyle = '#7a2f2a'; g.fillRect(0, 0, W, H); g.strokeStyle = '#e1ad35'; g.lineWidth = 6; g.strokeRect(14, 0, W - 28, H); g.fillStyle = '#5a1f1c'; for (let y = 0; y < H; y += 64) { g.beginPath(); g.arc(W / 2, y + 32, 18, 0, 7); g.fill(); } }, 256, 512, [1, 6]);

function lamp(root, x, y, z, I = 12, col = '#ffcf7a') { const b = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 8), glow(col)); b.position.set(x, y, z); root.add(b); const l = new THREE.PointLight('#ffb866', I, 8, 1.4); l.position.set(x, y, z + 0.15); root.add(l); return [b, l]; }

export function makeHotel(id) {
  return function build(scene) {
    const root = new THREE.Group(); const r = rng(id.length * 9); const ups = []; const U = (f) => ups.push(f);
    addLights(scene, { center: [0, 0, 0], key: [-20, 30, 40], keyColor: '#9fb4d8', keyI: 0.25, hemiI: 0.4, hemi: ['#6a5a5a', '#2a1a1a'], size: 14, fog: ['#1a1216', 20, 120] });
    const wp = toon('#ffffff', wallpaper()); const wood = toon('#ffffff', paintTexture({ base: '#5a3424', kind: 'planks', seed: 7 }));
    const you = makePerson(YOU, { tint: '#ffe8d0' }); root.add(you.group);
    const man = makePerson(MANAGER, { tint: '#ffe8d0' }); root.add(man.group);

    if (['lobby', 'manager', 'keys', 'lift'].includes(id)) {
      root.add(part(new THREE.BoxGeometry(16, 0.1, 14), toon('#ffffff', marble()), [0, -0.05, 0], { outline: 0, edges: false }));
      root.add(part(new THREE.BoxGeometry(16, 0.1, 14), toon('#3a2420'), [0, 5.0, 0], { outline: 0, edges: false }));
      root.add(part(new THREE.BoxGeometry(16, 5, 0.2), wp, [0, 2.5, -5], { outline: 0, edges: false }));
      for (const sx of [-1, 1]) root.add(part(new THREE.BoxGeometry(0.2, 5, 14), wp, [sx * 8, 2.5, 0], { outline: 0, edges: false }));
      root.add(part(new THREE.BoxGeometry(16, 1.0, 0.25), wood, [0, 0.5, -4.88], { outline: 0.01, edges: false }));
      for (const x of [-6, -2.2, 2.2, 6]) { root.add(part(new THREE.CylinderGeometry(0.32, 0.36, 5, 16), toon('#e8dcc4'), [x, 2.5, -3.6], { outline: 0.02, edges: false })); root.add(part(new THREE.BoxGeometry(0.9, 0.3, 0.9), toon('#c9a25a'), [x, 4.85, -3.6], { outline: 0.012 })); }
      // chandelier
      const ch = new THREE.Group(); ch.position.set(0, 4.2, -0.5); root.add(ch);
      ch.add(part(new THREE.TorusGeometry(0.9, 0.05, 8, 32), toon('#c9a25a'), [0, 0, 0], { rot: [Math.PI / 2, 0, 0], outline: 0.008, edges: false }));
      for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2; const b = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), glow('#ffe1a0')); b.position.set(Math.cos(a) * 0.9, 0.12, Math.sin(a) * 0.9); ch.add(b); }
      ch.add(part(new THREE.CylinderGeometry(0.02, 0.02, 0.8, 4), toon('#c9a25a'), [0, 0.4, 0], { outline: 0, edges: false }));
      const chl = new THREE.PointLight('#ffd8a0', 30, 16, 1.2); ch.add(chl);
      // front desk with bell, lamp, ledger, desk clock
      root.add(part(new THREE.BoxGeometry(4.4, 1.1, 0.9), wood, [0, 0.55, -1.0], { outline: 0.02 }));
      root.add(part(new THREE.BoxGeometry(4.6, 0.08, 1.05), toon('#2b2b33'), [0, 1.14, -1.0], { outline: 0.01 }));
      root.add(part(new THREE.SphereGeometry(0.09, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), toon('#c9a25a'), [1.3, 1.18, -0.8], { outline: 0.006, edges: false }));
      lamp(root, -1.5, 1.6, -1.1, 10, '#a8f0a0');
      root.add(part(new THREE.CylinderGeometry(0.1, 0.14, 0.4, 10), toon('#c9a25a'), [-1.5, 1.35, -1.1], { outline: 0.006, edges: false }));
      const clockC = document.createElement('canvas'); clockC.width = clockC.height = 256; const clockT = new THREE.CanvasTexture(clockC); clockT.colorSpace = THREE.SRGBColorSpace;
      const drawClock = (hh, mm) => { const g = clockC.getContext('2d'), W = 256; g.clearRect(0, 0, W, W); g.fillStyle = '#f4ead2'; g.beginPath(); g.arc(W / 2, W / 2, W / 2 - 6, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = 12; g.stroke(); const ha = ((hh % 12) / 12 + mm / 720) * Math.PI * 2, ma = (mm / 60) * Math.PI * 2; g.lineWidth = 12; g.beginPath(); g.moveTo(W / 2, W / 2); g.lineTo(W / 2 + Math.sin(ha) * W * 0.22, W / 2 - Math.cos(ha) * W * 0.22); g.stroke(); g.lineWidth = 7; g.beginPath(); g.moveTo(W / 2, W / 2); g.lineTo(W / 2 + Math.sin(ma) * W * 0.36, W / 2 - Math.cos(ma) * W * 0.36); g.stroke(); clockT.needsUpdate = true; };
      drawClock(10, 0);
      const wallClock = new THREE.Mesh(new THREE.CircleGeometry(0.45, 32), new THREE.MeshBasicMaterial({ map: clockT })); wallClock.position.set(-4.2, 3.6, -4.88); root.add(wallClock);
      // key wall: 4 x 6 hooks; 312 has a red tag
      const keyWall = new THREE.Group(); keyWall.position.set(2.6, 2.4, -4.86); root.add(keyWall);
      keyWall.add(part(new THREE.BoxGeometry(2.6, 1.8, 0.08), wood, [0, 0, 0], { outline: 0.012 }));
      let key312 = null;
      for (let row = 0; row < 4; row++) for (let col = 0; col < 6; col++) {
        const x = -1.05 + col * 0.42, y = 0.6 - row * 0.42, num = 300 + (3 - row) * 6 + col + 1;
        keyWall.add(part(new THREE.CylinderGeometry(0.012, 0.012, 0.06, 6), toon('#c9a25a'), [x, y, 0.07], { rot: [Math.PI / 2, 0, 0], outline: 0, edges: false }));
        const is = num === 312; const k = new THREE.Group(); k.position.set(x, y - 0.12, 0.08); keyWall.add(k);
        k.add(part(new THREE.BoxGeometry(0.03, 0.12, 0.01), toon('#c9a25a'), [0, 0.02, 0], { outline: 0, edges: false }));
        const tag = card([String(num)], 0.14, 0.09, { sizes: [150], bg: is ? '#a3392d' : '#e8dcc4', fg: is ? '#ffffff' : INK }); tag.position.set(0, -0.08, 0.005); k.add(tag);
        if (is) key312 = k; else if (r() < 0.25) k.visible = false;
      }
      const plate = card(['312'], 0.3, 0.16, { sizes: [180], bg: '#e1ad35' }); plate.position.set(2.6 + (-1.05 + 5 * 0.42) - 0.42 * 0, 3.32, -4.8); plate.visible = false; root.add(plate);
      // elevator doors + dial on the side wall
      const liftG = new THREE.Group(); liftG.position.set(-7.88, 0, -1.5); liftG.rotation.y = Math.PI / 2; root.add(liftG);
      liftG.add(part(new THREE.BoxGeometry(2.4, 3.2, 0.12), toon('#c9a25a'), [0, 1.6, 0], { outline: 0.02 }));
      const doorL = part(new THREE.BoxGeometry(0.95, 2.6, 0.08), toon('#8a7a4a'), [-0.48, 1.3, 0.08], { outline: 0.012 }), doorR = part(new THREE.BoxGeometry(0.95, 2.6, 0.08), toon('#8a7a4a'), [0.48, 1.3, 0.08], { outline: 0.012 }); liftG.add(doorL, doorR);
      const carIn = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 2.6), toon('#d8c08a')); carIn.position.set(0, 1.3, 0.02); liftG.add(carIn);
      const carL = new THREE.PointLight('#fff0c0', 0, 4, 1.3); carL.position.set(0, 2.2, -0.6); carL.userData.noShadow = true; liftG.add(carL);
      const dial = new THREE.Mesh(new THREE.CircleGeometry(0.36, 32, 0, Math.PI), toon('#e8dcc4')); dial.position.set(0, 3.0, 0.08); liftG.add(dial);
      const nums = card(['1   2   3   4   5'], 0.68, 0.12, { sizes: [90], bg: '#e8dcc4' }); nums.position.set(0, 3.12, 0.09); liftG.add(nums);
      const arrow = new THREE.Group(); arrow.position.set(0, 3.0, 0.1); liftG.add(arrow); arrow.add(part(new THREE.BoxGeometry(0.03, 0.3, 0.01), toon('#2b2b33'), [0, 0.15, 0], { outline: 0, edges: false }));
      // plants, luggage cart, bench, rug
      for (const x of [-6.8, 6.8]) { root.add(part(new THREE.CylinderGeometry(0.35, 0.28, 0.6, 12), toon('#c9a25a'), [x, 0.3, -4.2], { outline: 0.012, edges: false })); for (let i = 0; i < 6; i++) root.add(part(new THREE.ConeGeometry(0.15, 1.2, 5), toon('#3f6f3a'), [x + Math.sin(i) * 0.2, 1.1, -4.2 + Math.cos(i) * 0.2], { rot: [Math.sin(i) * 0.5, 0, Math.cos(i) * 0.5], outline: 0.01, edges: false })); }
      const cart = new THREE.Group(); cart.position.set(4.6, 0, 1.4); root.add(cart);
      cart.add(part(new THREE.BoxGeometry(1.2, 0.08, 0.7), toon('#c9a25a'), [0, 0.3, 0], { outline: 0.008 })); for (const x of [-0.55, 0.55]) cart.add(part(new THREE.CylinderGeometry(0.02, 0.02, 1.6, 6), toon('#c9a25a'), [x, 1.1, 0], { outline: 0, edges: false }));
      const s1 = crate(0.5, '#7a2f2a'); s1.position.set(-0.2, 0.34, 0); cart.add(s1); const s2 = crate(0.4, '#2f4a6a'); s2.position.set(0.25, 0.34, 0.05); cart.add(s2);
      const rug = new THREE.Mesh(new THREE.PlaneGeometry(3, 6), toon('#ffffff', carpet())); rug.rotation.x = -Math.PI / 2; rug.position.set(0, 0.01, 2.6); rug.receiveShadow = true; root.add(rug);
      U((t, cam) => {
        // time lapse of the wall clock over "three months", then the desk clock shows 2:13
        const hh = id === 'keys' ? 10 + ramp(t, 13.3, 17.3) * 52 : id === 'lift' ? 2 : 10; drawClock(Math.floor(hh), id === 'keys' && t > 17.3 ? 13 : (hh % 1) * 60);
        const empty = t > w(2, '^empty') - 0.15 && (id === 'keys' || id === 'lift');
        if (key312) key312.visible = !empty; plate.visible = false;
        if (key312 && !empty) key312.rotation.z = Math.sin(t * 2) * 0.05;
        // lift: arrow sweeps to 3, doors open on an empty car
        const tf = w(2, '^Third'), tn = w(2, '^Nobody');
        arrow.rotation.z = id === 'lift' ? 1.2 - 1.2 * smooth(ramp(t, tf - 0.8, tf + 0.1)) : 1.2;
        const op = id === 'lift' ? smooth(ramp(t, tn - 0.4, tn + 0.4)) : 0;
        doorL.position.x = -0.48 - op * 0.9; doorR.position.x = 0.48 + op * 0.9; carL.intensity = op * 12;
        chl.intensity = 30 * (0.95 + 0.05 * Math.sin(t * 7));
        you.group.visible = id !== 'manager' && id !== 'lift'; you.group.position.set(-0.4, 0, -1.7);
        you.update(t, cam.position, 0, { expr: id === 'keys' && t > w(2, '^empty') - 0.1 ? 'alarmed' : 'neutral', gesture: id === 'keys' && t > w(2, '^empty') - 0.1 ? 'scared' : [[-1e9, 'hold', { prop: 'book' }]] });
        man.group.visible = id === 'manager'; man.group.position.set(0.6, 0, -1.7);
        man.update(t, cam.position, 0, { talk: talking(t, 'MANAGER') ? 1 : 0, expr: 'smug', gesture: [[-1e9, 'wag'], [w(1, '^never$') - 0.1, 'point', { angle: -0.1 }]] });
      });
    }

    if (id === 'hall') {
      root.add(part(new THREE.BoxGeometry(3, 0.1, 30), toon('#3a2420'), [0, -0.05, -10], { outline: 0, edges: false }));
      const run = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 30), toon('#ffffff', carpet())); run.rotation.x = -Math.PI / 2; run.position.set(0, 0.01, -10); run.receiveShadow = true; root.add(run);
      root.add(part(new THREE.BoxGeometry(3, 0.1, 30), toon('#2a1a18'), [0, 3.0, -10], { outline: 0, edges: false }));
      for (const sx of [-1, 1]) { root.add(part(new THREE.BoxGeometry(0.1, 3, 30), wp, [sx * 1.5, 1.5, -10], { outline: 0, edges: false })); root.add(part(new THREE.BoxGeometry(0.12, 1.0, 30), wood, [sx * 1.45, 0.5, -10], { outline: 0, edges: false })); }
      root.add(part(new THREE.BoxGeometry(3, 3, 0.1), wp, [0, 1.5, -25], { outline: 0, edges: false }));
      const sconces = [];
      for (let i = 0; i < 6; i++) { const z = 2 - i * 4.2, sx = i % 2 ? 1 : -1; sconces.push(lamp(root, sx * 1.36, 2.1, z, 9)); }
      let door312 = null, glowIn = null;
      for (let i = 0; i < 8; i++) {
        const z = 0 - i * 3, sx = i % 2 ? 1 : -1, num = 316 - i * 1 - (i > 3 ? 0 : 0);
        const dg = new THREE.Group(); dg.position.set(sx * 1.44, 0, z); dg.rotation.y = -sx * Math.PI / 2; root.add(dg);
        dg.add(part(new THREE.BoxGeometry(1.1, 2.3, 0.08), toon('#2b2b33'), [0, 1.15, 0], { outline: 0.01 }));
        const is = i === 4; const leaf = new THREE.Group(); leaf.position.set(-0.48, 0, 0.05); dg.add(leaf);
        leaf.add(part(new THREE.BoxGeometry(0.96, 2.2, 0.06), toon('#5a3424'), [0.48, 1.1, 0], { outline: 0.01 }));
        const np = card([is ? '312' : String(308 + i)], 0.24, 0.12, { sizes: [170], bg: '#e1ad35' }); np.position.set(0.48, 1.85, 0.04); leaf.add(np);
        if (is) { door312 = leaf; glowIn = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 2.2), glow('#ffcf7a')); glowIn.position.set(0, 1.1, -0.02); dg.add(glowIn); const gl = new THREE.PointLight('#ffb866', 10, 5, 1.4); gl.position.set(0, 1.2, 0.5); dg.add(gl); }
      }
      U((t, cam) => {
        if (door312) door312.rotation.y = -0.35;
        sconces.forEach(([b, l], i) => { l.intensity = 9 * (0.85 + 0.15 * Math.sin(t * (9 + i) + i)); });
        man.group.visible = false;
        const z = 4 - (t - 25.0) * 1.4; you.group.position.set(0.2, 0, Math.max(-10.5, z));
        you.update(t, cam.position, 1.4, { expr: 'alarmed', gesture: [[-1e9, 'holdR', { prop: 'candle' }]] });
      });
    }

    if (id === 'room' || id === 'reveal') {
      root.add(part(new THREE.BoxGeometry(7, 0.1, 7), toon('#ffffff', carpet()), [0, -0.05, 0], { outline: 0, edges: false }));
      root.add(part(new THREE.BoxGeometry(7, 0.1, 7), toon('#2a1a18'), [0, 3.0, 0], { outline: 0, edges: false }));
      for (const sx of [-1, 1]) root.add(part(new THREE.BoxGeometry(0.1, 3, 7), wp, [sx * 3.5, 1.5, 0], { outline: 0, edges: false }));
      root.add(part(new THREE.BoxGeometry(7, 3, 0.1), wp, [0, 1.5, -3.5], { outline: 0, edges: false }));
      root.add(part(new THREE.BoxGeometry(7, 3, 0.1), wp, [0, 1.5, 3.5], { outline: 0, edges: false }));
      // door (open, on the front wall) with light from the hall
      const door = part(new THREE.BoxGeometry(1.0, 2.2, 0.06), toon('#5a3424'), [2.2, 1.1, 3.0], { rot: [0, -0.9, 0], outline: 0.01 }); root.add(door);
      const hallGlow = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 2.2), glow('#c98a5a')); hallGlow.position.set(2.0, 1.1, 3.44); hallGlow.rotation.y = Math.PI; root.add(hallGlow);
      // bed turned down
      const bed = new THREE.Group(); bed.position.set(-1.4, 0, -2.0); root.add(bed);
      bed.add(part(new THREE.BoxGeometry(2.0, 0.5, 2.6), wood, [0, 0.25, 0], { outline: 0.02 }));
      bed.add(part(new THREE.BoxGeometry(2.0, 1.3, 0.12), wood, [0, 0.9, -1.3], { outline: 0.02 }));
      bed.add(part(new THREE.BoxGeometry(1.9, 0.2, 2.4), toon('#f4ead2'), [0, 0.6, 0.05], { outline: 0.012 }));
      bed.add(part(new THREE.BoxGeometry(1.92, 0.1, 1.4), toon('#7a2f2a'), [0, 0.74, 0.55], { outline: 0.012 }));
      bed.add(part(new THREE.BoxGeometry(1.92, 0.12, 0.3), toon('#f4ead2'), [0, 0.76, -0.12], { rot: [0.3, 0, 0], outline: 0.01 }));
      for (const x of [-0.5, 0.5]) bed.add(part(new THREE.BoxGeometry(0.7, 0.18, 0.4), toon('#ffffff'), [x, 0.78, -0.95], { outline: 0.012 }));
      const mint = card(['WELCOME'], 0.2, 0.1, { sizes: [130], bg: '#e1ad35' }); mint.position.set(0, 0.89, -0.95); mint.rotation.x = -Math.PI / 2; bed.add(mint);
      // nightstand + phone + lamp
      root.add(part(new THREE.BoxGeometry(0.6, 0.7, 0.5), wood, [-2.8, 0.35, -2.6], { outline: 0.012 }));
      const phone = new THREE.Group(); phone.position.set(-2.8, 0.72, -2.55); root.add(phone);
      phone.add(part(new THREE.BoxGeometry(0.28, 0.12, 0.22), toon('#2b2b33'), [0, 0.06, 0], { outline: 0.008 }));
      const hand = part(new THREE.BoxGeometry(0.34, 0.06, 0.08), toon('#2b2b33'), [0, 0.15, 0], { outline: 0.006 }); phone.add(hand);
      lamp(root, -2.8, 1.3, -2.6, 10);
      root.add(part(new THREE.CylinderGeometry(0.14, 0.2, 0.25, 12), toon('#e8dcc4'), [-2.8, 1.32, -2.6], { outline: 0.006, edges: false }));
      // chair with YOUR coat, YOUR shoes
      const chair = new THREE.Group(); chair.position.set(1.4, 0, -1.6); chair.rotation.y = -0.5; root.add(chair);
      chair.add(part(new THREE.BoxGeometry(0.7, 0.1, 0.7), wood, [0, 0.5, 0], { outline: 0.012 })); chair.add(part(new THREE.BoxGeometry(0.7, 0.8, 0.08), wood, [0, 0.95, -0.32], { outline: 0.012 }));
      for (const [x, z] of [[-0.3, -0.3], [0.3, -0.3], [-0.3, 0.3], [0.3, 0.3]]) chair.add(part(new THREE.BoxGeometry(0.06, 0.5, 0.06), wood, [x, 0.25, z], { outline: 0.006, edges: false }));
      chair.add(part(new THREE.BoxGeometry(0.62, 0.9, 0.06), toon(YOU.jacket), [0, 0.95, -0.27], { outline: 0.012 }));
      chair.add(part(new THREE.BoxGeometry(0.62, 0.06, 0.4), toon(YOU.jacket2), [0, 0.57, -0.08], { outline: 0.008 }));
      for (const x of [-0.12, 0.12]) root.add(part(new THREE.BoxGeometry(0.12, 0.08, 0.3), toon(INK), [-0.2 + x, 0.04, -0.4], { rot: [0, 0.2, 0], outline: 0.005 }));
      // writing desk + ledger + lines that pop
      root.add(part(new THREE.BoxGeometry(1.4, 0.08, 0.7), wood, [2.4, 0.85, -2.9], { outline: 0.012 }));
      for (const [x, z] of [[1.75, -3.2], [3.05, -3.2], [1.75, -2.6], [3.05, -2.6]]) root.add(part(new THREE.BoxGeometry(0.06, 0.85, 0.06), wood, [x, 0.42, z], { outline: 0.006, edges: false }));
      const led = new THREE.Group(); led.position.set(2.4, 0.9, -2.85); led.rotation.x = -Math.PI / 2; root.add(led);
      led.add(new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.56), toon('#4a2a22')));
      const pg = card(['GUEST LEDGER', 'ROOM 312'], 0.4, 0.5, { sizes: [80, 110], bg: '#f4ead2' }); pg.position.set(-0.22, 0, 0.005); led.add(pg);
      const nm = card(['GUEST: YOU'], 0.4, 0.16, { sizes: [110], bg: '#f4ead2', fg: '#a3392d', border: '#f4ead2' }); nm.position.set(0.22, 0.12, 0.006); led.add(nm);
      const since = card(['SINCE 1985'], 0.4, 0.14, { sizes: [110], bg: '#f4ead2', border: '#f4ead2' }); since.position.set(0.22, -0.08, 0.006); led.add(since);
      lamp(root, 2.9, 1.25, -3.1, 8);
      // window with night city + rain
      root.add(part(new THREE.BoxGeometry(1.6, 1.4, 0.12), toon('#e8dcc4'), [0.4, 1.8, -3.44], { outline: 0.012 }));
      const city = patternTex((g, W, H) => { g.fillStyle = '#121a2e'; g.fillRect(0, 0, W, H); const q = rng(3); for (let i = 0; i < 12; i++) { const x = i * W / 12, h = H * (0.3 + q() * 0.5); g.fillStyle = '#0a0f1c'; g.fillRect(x, H - h, W / 12 - 2, h); for (let k = 0; k < 8; k++) if (q() > 0.5) { g.fillStyle = '#ffcf7a'; g.fillRect(x + 4 + q() * 10, H - h + 8 + q() * (h - 16), 5, 6); } } }, 256, 256);
      const win = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.2), new THREE.MeshBasicMaterial({ map: city })); win.position.set(0.4, 1.8, -3.37); root.add(win);
      // the manager waits in the doorway at the end
      U((t, cam) => {
        nm.scale.setScalar(pop(ramp(t, w(2, '^yours') - 0.05, w(2, '^yours') + 0.3))); since.scale.setScalar(pop(ramp(t, w(2, '^1985') - 0.05, w(2, '^1985') + 0.3)));
        const ringOn = t > w(2, '^rings') - 0.3 && t < w(2, '^pick'); hand.visible = !(t > w(2, '^pick')); phone.position.y = 0.72 + (ringOn && Math.sin(t * 60) > 0 ? 0.015 : 0); phone.rotation.z = ringOn ? Math.sin(t * 50) * 0.08 : 0;
        man.group.visible = id === 'reveal'; man.group.position.set(2.0, 0, 3.1);
        man.update(t, cam.position, 0, { talk: talking(t, 'MANAGER') ? 1 : 0, expr: 'smug', gesture: 'wave' });
        const picked = t > w(2, '^pick') - 0.05;
        you.group.position.set(id === 'reveal' ? -2.2 : 1.9, 0, id === 'reveal' ? -1.9 : -2.0);
        let ex = 'alarmed'; if (t > w(2, '^yours')) ex = 'scared';
        you.update(t, cam.position, 0, { expr: ex, gesture: picked ? [[-1e9, 'phone', { prop: 'phone' }]] : t > w(2, '^ledger') - 0.1 ? 'scared' : 'idle' });
      });
    }
    return { root, update(t, camera) { ups.forEach((f) => f(t, camera)); } };
  };
}

// ---------- cameras ----------
const F = (path, focus, extra = {}) => (t) => { const c = path(t); c.focus = typeof focus === 'function' ? focus(t) : V(focus); return Object.assign(c, extra); };
const KEY = [2.6 + (-1.05 + 5 * 0.42), 2.4 + (0.6 - 3 * 0.42) - 0.12, -4.8];
export const camLobby = F(cameraPath([{ t: 0, pos: [0, 2.4, 6], look: [0.5, 2.2, -4] }, { t: 3.6, pos: [2.8, 2.0, -1.8], look: KEY }, { t: 6.6, pos: [3.4, 1.9, -3.2], look: KEY }, { t: 7.0, pos: [-0.2, 1.7, 1.6], look: [-0.4, 1.4, -1.7] }, { t: 9.3, pos: [-0.3, 1.6, 0.8], look: [-0.4, 1.45, -1.7] }]), (t) => V(t < 6.8 ? KEY : [-0.4, 1.45, -1.7]));
export const camManager = F(cameraPath([{ t: 9.3, pos: [1.2, 1.7, 0.6], look: [0.6, 1.5, -1.7] }, { t: 13.2, pos: [0.9, 1.6, -0.2], look: [0.6, 1.48, -1.7] }]), [0.6, 1.48, -1.7]);
export const camKeys = (t) => { const c = cameraPath([{ t: 13.2, pos: [3.3, 2.2, -2.4], look: KEY }, { t: 17.3, pos: [2.0, 2.6, -1.0], look: [2.6, 2.5, -4.86] }, { t: 19.3, pos: [3.6, 2.0, -3.4], look: KEY }, { t: 20.6, pos: [3.5, 1.95, -3.7], look: KEY }, { t: 21.0, pos: [0.6, 1.7, 0.8], look: [-0.4, 1.45, -1.7] }])(t); c.focus = V(t < 20.7 ? KEY : [-0.4, 1.45, -1.7]); return shake(c, t, w(2, '^empty'), 0.3, 0.03); };
export const camLift = F(cameraPath([{ t: 21.0, pos: [-3.4, 2.0, 1.4], look: [-7.8, 2.4, -1.5] }, { t: 23.0, pos: [-5.0, 2.4, -0.6], look: [-7.8, 2.9, -1.5] }, { t: 25.0, pos: [-5.2, 1.7, -1.3], look: [-7.8, 1.4, -1.5] }]), (t) => V(t < 23.4 ? [-7.8, 2.95, -1.5] : [-7.8, 1.4, -1.5]));
export const camHall = (t) => { const z = Math.max(-10.5, 4 - (t - 25.0) * 1.4); return { pos: V([0.1, 1.75, z + 3.2]), look: V([0.1, 1.5, z - 4]), focus: V([0.2, 1.5, z]) }; };
const rm = cameraPath([
  { t: 28.4, pos: [0.4, 1.8, 2.4], look: [-1.4, 0.8, -2.0] },
  { t: 30.0, pos: [0.0, 1.6, 1.4], look: [-1.0, 0.8, -1.8] },
  { t: 30.6, pos: [0.6, 1.4, 0.4], look: [1.4, 0.9, -1.7] },
  { t: 31.6, pos: [0.4, 1.0, 0.6], look: [-0.2, 0.1, -0.4] },
  { t: 33.2, pos: [0.8, 1.7, 0.8], look: [1.9, 1.4, -2.0] },
  { t: 35.8, pos: [2.2, 1.9, -1.9], look: [2.4, 0.9, -2.85] },
  { t: 40.6, pos: [2.35, 1.6, -2.3], look: [2.4, 0.9, -2.85] },
  { t: 42.8, pos: [0.4, 1.6, 0.6], look: [1.9, 1.45, -2.0] },
  { t: 45.7, pos: [1.0, 1.55, -0.6], look: [1.9, 1.5, -2.0] },
]);
export const camRoom = (t) => { const c = rm(t); c.focus = V(t < 30.4 ? [-1.4, 0.8, -2.0] : t < 31.4 ? [1.4, 0.95, -1.7] : t < 33.0 ? [-0.2, 0.1, -0.4] : t < 35.6 || t > 42.6 ? [1.9, 1.45, -2.0] : [2.4, 0.9, -2.85]); if (t > 35.6 && t < 42.6) c.cap = 'top'; return shake(c, t, w(2, '^rings') - 0.3, 0.3, 0.02); };
const rv = cameraPath([{ t: 45.7, pos: [-1.2, 1.6, -0.6], look: [-2.2, 1.45, -1.9] }, { t: 46.6, pos: [-1.4, 1.6, -0.4], look: [-2.1, 1.45, -1.6] }, { t: 47.4, pos: [-1.0, 1.65, -0.2], look: [2.0, 1.5, 3.1] }, { t: 49.36, pos: [-0.4, 1.6, 0.6], look: [2.0, 1.5, 3.1] }]);
export const camReveal = (t) => { const c = rv(t); c.focus = V(t < 47.0 ? [-2.2, 1.45, -1.9] : [2.0, 1.5, 3.1]); return c; };
