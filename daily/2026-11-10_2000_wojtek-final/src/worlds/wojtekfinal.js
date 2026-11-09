// THE BEAR WHO JOINED THE ARMY - FINAL PART. Locations: hill (hook: bear carrying shells), dock (made a private), cassino (night,
// picks up a crate), driver (British driver sees it), carry (crates of 45 kg), tent (army's problem), zoo (Edinburgh, comrades, corporal), badge (emblem).
import * as THREE from 'three';
import { toon, part, paintTexture, rng, INK } from '../lib/toon.js';
import { makePerson } from '../lib/char.js';
import { makeBear, _drawBear } from '../lib/bear.js';
import { addLights } from '../Stage.jsx';
import { cameraPath } from '../lib/camera.js';
import { w, talking } from '../times.js';
import { ramp, smooth, pop, glow, sky, sea, card, crate, barrel, rope, fogBank, clouds, rain, ground, hills, smoke, sandbags, truck, patternTex } from './common.js';

export const YOU = { skin: '#f3d9c0', hair: '#6b4a32', outfit: 'coat', jacket: '#6b7a4a', jacket2: '#55623a', shoes: INK, hat: 'cap', hatColor: '#5d6b3f', seed: 12, height: 1.74 };
const SARGE = { skin: '#e9c7a6', hair: '#2e211b', moustache: '#2e211b', outfit: 'coat', jacket: '#5d6b3f', jacket2: '#4a5632', shoes: INK, hat: 'peaked', hatColor: '#5d6b3f', hatColor2: '#3e4a2a', badge: '#e1ad35', seed: 31, height: 1.8 };
const BOY = { skin: '#c99468', hair: '#1f1a1a', outfit: 'sweater', jacket: '#e8dcc4', jacket2: '#cfc2a8', shoes: INK, hat: 'none', seed: 55, height: 1.2 };
const SOLD = { skin: '#e8c8a8', hair: '#3a2a22', outfit: 'coat', jacket: '#646f45', jacket2: '#4f5836', shoes: INK, hat: 'cap', hatColor: '#55623a', seed: 70, height: 1.76 };
const V = (a) => new THREE.Vector3(...a);
const F = (path, focus, extra = {}) => (t) => { const c = path(t); c.focus = typeof focus === 'function' ? focus(t) : V(focus); return Object.assign(c, extra); };
const shake = (c, t, t0, d = 0.3, a = 0.05) => { if (t > t0 && t < t0 + d) { const s = (1 - (t - t0) / d) * a; c.pos.x += Math.sin(t * 97) * s; c.pos.y += Math.sin(t * 71 + 2) * s; } return c; };

// company emblem: a bear carrying a shell, in a ring
function emblemTex() {
  const bc = document.createElement('canvas'); bc.width = 1200; bc.height = 1680; const bg = bc.getContext('2d');
  _drawBear(bg, { t: 0, nz: () => 0.5, pose: 'shell', expr: 'proud' });
  return patternTex((g, W, H) => {
    g.fillStyle = '#f3ead6'; g.beginPath(); g.arc(W / 2, H / 2, W / 2 - 8, 0, 7); g.fill();
    g.strokeStyle = '#a3392d'; g.lineWidth = 26; g.stroke(); g.strokeStyle = INK; g.lineWidth = 8; g.beginPath(); g.arc(W / 2, H / 2, W / 2 - 6, 0, 7); g.stroke();
    g.drawImage(bc, W * 0.2, H * 0.1, W * 0.6, W * 0.84);
    g.fillStyle = INK; g.font = 'bold 44px Arial Black, sans-serif'; g.textAlign = 'center'; g.fillText('22', W / 2, H * 0.93);
  }, 512, 512);
}

const LIGHT = {
  battle: { center: [0, 0, -6], key: [-60, 26, -80], keyColor: '#ffa060', keyI: 1.5, hemiI: 0.6, hemi: ['#a86a5a', '#2a1a1e'], size: 30, fog: ['#5a3a3a', 25, 220] },
  desert: { center: [0, 0, 0], key: [50, 70, 30], keyColor: '#fff2d8', keyI: 2.3, hemiI: 1.0, hemi: ['#cfe2f0', '#b08a60'], size: 26, fog: ['#e8d8b8', 60, 400] },
  tent: { center: [0, 0, 0], key: [-20, 30, 20], keyColor: '#9fb4d8', keyI: 0.25, hemiI: 0.35, hemi: ['#6a5a40', '#2a1e14'], size: 10, fog: ['#1a140e', 20, 120] },
  dock: { center: [0, 0, 0], key: [-40, 60, 40], keyColor: '#fff0dc', keyI: 1.9, hemiI: 1.0, hemi: ['#c8d4e0', '#6a6a62'], size: 26, fog: ['#c3ccd4', 50, 380] },
  night: { center: [0, 0, 0], key: [-40, 50, -60], keyColor: '#9fb4d8', keyI: 0.8, hemiI: 0.45, hemi: ['#3a4a6a', '#1a1014'], size: 30, fog: ['#141826', 25, 220] },
  grey: { center: [0, 0, 0], key: [-30, 50, 40], keyColor: '#e8eef4', keyI: 1.4, hemiI: 1.0, hemi: ['#c0c8d0', '#5a6450'], size: 24, fog: ['#a8b0b8', 30, 260] },
};

const BRIT = { skin: '#efcfb2', hair: '#8a5a32', moustache: '#8a5a32', outfit: 'coat', jacket: '#7a7350', jacket2: '#615b3e', shoes: INK, hat: 'cap', hatColor: '#3a3a2a', seed: 88, height: 1.78 };
const VET1 = { skin: '#ecd2b8', hair: '#9a948a', brows: '#bdb6aa', moustache: '#9a948a', old: true, outfit: 'coat', jacket: '#4a4f5a', jacket2: '#3a3f48', shoes: INK, hat: 'cap', hatColor: '#3a3a40', seed: 91, height: 1.74 };
const VET2 = { skin: '#e8c8a8', hair: '#c9c2b6', brows: '#d6d0c6', old: true, outfit: 'coat', jacket: '#6a4a3a', jacket2: '#553a2e', shoes: INK, hat: 'bowler', hatColor: '#2b2b33', seed: 93, height: 1.7 };

export function makeWojtek(id) {
  return function build(scene) {
    const root = new THREE.Group(); const r = rng(id.length * 7);
    const ups = []; const U = (f) => ups.push(f);
    const add = (o) => { root.add(o.group); return o; };
    const battle = (night) => {
      addLights(scene, night ? LIGHT.night : LIGHT.battle);
      root.add(sky(night ? 'night' : 'battle')); root.add(clouds(night ? 'rgba(40,50,80,0.55)' : 'rgba(120,60,60,0.5)', 9, 50, 4));
      root.add(ground(night ? '#4a4438' : '#7a6a4e', 'asphalt', 400, 70, 4));
      root.add(hills(night ? '#26232c' : '#4a3a3a', -150, 9, 46, 6));
      const ruin = new THREE.Group(); ruin.position.set(-6, 0, -70); root.add(ruin);
      const stone = toon('#ffffff', paintTexture({ base: night ? '#8f8a80' : '#cfc2a8', kind: 'asphalt', seed: 9, repeat: [3, 2] }));
      for (let i = 0; i < 7; i++) { const h = 6 + r() * 10; ruin.add(part(new THREE.BoxGeometry(5, h, 3), stone, [-15 + i * 5.2, h / 2 + 8, 0], { outline: 0.06 })); }
      ruin.add(part(new THREE.CylinderGeometry(0.1, 30, 8, 6), toon(night ? '#2e2a30' : '#5a4a44'), [0, 4, 0], { outline: 0.1, edges: false }));
      for (const [x, z, rot, h] of [[-5, -8, 0.3, 3.2], [6, -10, -0.4, 2.4], [-9, -2, 0.9, 1.8], [8, -3, -0.2, 2.8], [-7, 9, 0.5, 2.2], [7, 12, -0.3, 2.6]]) {
        const wall = new THREE.Group(); wall.position.set(x, 0, z); wall.rotation.y = rot; root.add(wall);
        wall.add(part(new THREE.BoxGeometry(3.4, h, 0.6), stone, [0, h / 2, 0], { outline: 0.03 }));
        wall.add(part(new THREE.BoxGeometry(1.0, 1.4, 0.7), toon(night ? '#1a1820' : '#3a3030'), [0.4, h * 0.55, 0], { outline: 0.01, edges: false }));
        for (let k = 0; k < 5; k++) wall.add(part(new THREE.DodecahedronGeometry(0.25 + r() * 0.3, 0), stone, [r() * 3 - 1.5, 0.15, 0.6 + r() * 0.8], { outline: 0.015 }));
      }
      for (let i = 0; i < 12; i++) { const c = new THREE.Mesh(new THREE.CircleGeometry(1 + r() * 1.5, 20), toon('#3a3228')); c.rotation.x = -Math.PI / 2; c.position.set(-14 + r() * 28, 0.02, -24 + r() * 36); root.add(c); }
      const sb = sandbags(6, 2); sb.position.set(-4.8, 0, 1.2); root.add(sb); const sb2 = sandbags(5, 3, 7); sb2.position.set(2.6, 0, -6); sb2.rotation.y = -0.4; root.add(sb2);
      const fires = [];
      for (const [x, z] of [[-10, -16], [9, -20], [-3, -32], [14, -8], [-12, 6]]) {
        const fl = new THREE.Mesh(new THREE.ConeGeometry(0.7, 1.8, 10), glow('#ff8a3a')); fl.position.set(x, 0.9, z); root.add(fl);
        const pl = new THREE.PointLight('#ff8a3a', 22, 18, 1.4); pl.position.set(x, 1.6, z); root.add(pl); fires.push([fl, pl]);
        const sm = smoke(x, z, night ? 'rgba(30,30,40,0.55)' : 'rgba(50,38,40,0.5)', 6, x * 3 + z); root.add(sm.group); U((t, cam) => sm.update(t, cam.position));
      }
      const flash = new THREE.PointLight('#fff0c0', 0, 60, 1.2); flash.position.set(-8, 10, -30); flash.userData.noShadow = true; root.add(flash);
      U((t) => { fires.forEach(([fl, pl], i) => { fl.scale.set(1, 0.8 + 0.35 * Math.abs(Math.sin(t * 9 + i)), 1); pl.intensity = 22 * (0.8 + 0.2 * Math.sin(t * 13 + i)); }); const k = (t * 0.9) % 1.6; flash.intensity = k < 0.12 ? 160 * (1 - k / 0.12) : 0; });
    };
    // a soldier with a crate held over his head
    const porter = (P, tint) => { const p = add(makePerson(P, { tint })); const c = crate(0.6, '#8a6142'); root.add(c); return { p, c }; };

    if (id === 'hill' || id === 'carry') {
      battle(false);
      const bear = add(makeBear({ height: 1.95, tint: '#ffe0c8' }));
      const crew = [porter(SOLD, '#ffe0c8'), porter({ ...SOLD, seed: 71, jacket: '#5b6640' }, '#ffe0c8')];
      const off = [[1.7, 0.9], [-1.9, -1.6]];
      const kg = card(['45 KG'], 0.9, 0.36, { sizes: [200], bg: '#f4ead2', fg: '#a3392d', border: '#a3392d' }); root.add(kg);
      U((t, cam) => {
        const u = id === 'hill' ? t : t - 20.9; const z = -8 + u * 1.15;
        bear.group.position.set(0, 0, z);
        bear.update(t, cam.position, { pose: 'carry', expr: id === 'carry' && t > w(2, '^never') ? 'proud' : 'strain', walk: true });
        crew.forEach(({ p, c }, i) => { const pz = z + off[i][1]; p.group.position.set(off[i][0], 0, pz); c.position.set(off[i][0], 1.95 + Math.abs(Math.sin(t * 7 + i)) * 0.03, pz);
          p.update(t, cam.position, 0, { expr: id === 'carry' && t > w(2, '^copied') ? 'alarmed' : 'neutral', gesture: 'carry' }); });
        if (id === 'carry') { const k = ramp(t, w(2, '^45') - 0.05, w(2, '^45') + 0.3); kg.visible = k > 0 && t < w(2, '^Then') - 0.1; kg.scale.setScalar(pop(k)); kg.position.set(0, 2.95, z + 0.1); kg.lookAt(cam.position); } else kg.visible = false;
      });
    }

    if (id === 'cassino' || id === 'driver') {
      battle(true);
      const stack = []; for (let i = 0; i < 6; i++) { const c = crate(0.75, '#8a6142'); c.position.set(-1.6 + (i % 3) * 0.8, Math.floor(i / 3) * 0.75, -1.4); root.add(c); stack.push(c); }
      const T = truck(); T.group.position.set(4.6, 0, 3.0); T.group.rotation.y = -1.2; root.add(T.group);
      const bear = add(makeBear({ height: 1.95, tint: '#d8dcea' }));
      const drv = add(makePerson(BRIT, { tint: '#d8dcea' }));
      const s2 = porter({ ...SOLD, seed: 71, jacket: '#5b6640' }, '#d8dcea');
      U((t, cam) => {
        const pick = w(0, '^Shells'), go = w(0, '^sees');
        const walk = t > go ? Math.min(3.0, (t - go) * 1.1) : 0;
        bear.group.position.set(-0.8, 0, -0.6 + walk); stack[5].visible = t < pick;
        bear.update(t, cam.position, { pose: t > pick ? 'carry' : 'idle', expr: t > go ? 'proud' : t > pick ? 'strain' : 'neutral', walk: t > go && walk < 3.0 });
        drv.group.position.set(2.8, 0, 3.6);
        const sh = w(1, '^Is');
        drv.update(t, cam.position, 0, { talk: talking(t, 'BRITISH') ? 1 : 0, expr: t > sh - 0.3 ? 'shout' : t > go ? 'alarmed' : 'neutral', gesture: t > sh - 0.3 ? [[-1e9, 'pointL', { angle: 0.1 }]] : t > go ? 'scared' : [[-1e9, 'holdR', { prop: 'mug' }]] });
        const px = -4.0 + ((t * 0.8) % 3); s2.p.group.position.set(px, 0, -5); s2.c.position.set(px, 1.95, -5); s2.p.update(t, cam.position, 1.4, { expr: 'neutral', gesture: 'carry' });
      });
    }

    if (id === 'tent') {
      addLights(scene, LIGHT.tent);
      root.add(ground('#5a4632', 'asphalt', 60, 12, 6));
      const canvasTex = patternTex((g, W, H) => { g.fillStyle = '#a89a6a'; g.fillRect(0, 0, W, H); g.strokeStyle = 'rgba(70,60,30,0.35)'; g.lineWidth = 3; for (let x = 0; x < W; x += 32) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); } }, 256, 256, [6, 2]);
      const cm = toon('#ffffff', canvasTex, { side: THREE.DoubleSide });
      const shell = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.2, 12, 24, 1, true, 0, Math.PI), cm); shell.rotation.z = Math.PI / 2; shell.rotation.y = Math.PI / 2; shell.receiveShadow = true; root.add(shell);
      root.add(part(new THREE.BoxGeometry(8.4, 4.2, 0.1), cm, [0, 2.1, -6], { outline: 0, edges: false }));
      root.add(part(new THREE.CylinderGeometry(0.08, 0.08, 4.4, 8), toon('#6b4a32'), [0, 2.2, -3], { outline: 0.01, edges: false }));
      for (const [x, z] of [[-2.6, -3.5], [-2.6, -0.5], [2.6, -3.5]]) { root.add(part(new THREE.BoxGeometry(0.9, 0.45, 2.0), toon('#556240'), [x, 0.35, z], { outline: 0.02 })); root.add(part(new THREE.BoxGeometry(0.7, 0.12, 0.5), toon('#e8dcc4'), [x, 0.62, z - 0.6], { outline: 0.01 })); }
      root.add(part(new THREE.BoxGeometry(1.8, 0.08, 1.0), toon('#ffffff', paintTexture({ base: '#7a5236', kind: 'planks', seed: 4 })), [1.6, 0.85, -0.4], { outline: 0.015 }));
      for (const [x, z] of [[0.8, -0.8], [2.4, -0.8], [0.8, 0], [2.4, 0]]) root.add(part(new THREE.BoxGeometry(0.07, 0.85, 0.07), toon('#5b3a2a'), [x, 0.42, z], { outline: 0.01, edges: false }));
      const ord = card(['DEMOBILISATION', 'ORDERS 1947'], 0.7, 0.32, { sizes: [110, 110], bg: '#f4ead2' }); ord.rotation.x = -Math.PI / 2; ord.position.set(1.5, 0.9, -0.4); root.add(ord);
      for (let i = 0; i < 4; i++) { const c = crate(0.6); c.position.set(-3 + (i % 2) * 0.65, Math.floor(i / 2) * 0.6, 2.4); root.add(c); }
      const br = barrel(); br.position.set(2.9, 0, 2.2); root.add(br);
      const hang = new THREE.Group(); hang.position.set(0, 3.9, -0.6); root.add(hang);
      const lb = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 8), glow('#ffcf7a')); lb.position.y = -0.68; hang.add(lb);
      const hl = new THREE.PointLight('#ffb866', 26, 12, 1.2); hl.position.y = -0.78; hang.add(hl);
      U((t) => { hang.rotation.z = Math.sin(t * 1.2) * 0.06; hl.intensity = 26 * (0.92 + 0.08 * Math.sin(t * 11)); });
      const sarge = add(makePerson(SARGE, { tint: '#ffe8d0' })); const big = add(makeBear({ height: 1.9, tint: '#ffe8d0' }));
      U((t, cam) => {
        sarge.group.position.set(-0.8, 0, 0.5); big.group.position.set(0.7, 0, 0.1);
        const pr = w(2, '^problem'), q = w(2, '^What');
        big.update(t, cam.position, { pose: t > q ? 'wave' : 'drink', expr: 'happy' });
        sarge.update(t, cam.position, 0, { expr: t < pr ? 'neutral' : t < q ? 'sad' : 'alarmed', gesture: t < pr ? [[-1e9, 'holdR', { prop: 'paper' }]] : t < q ? 'shrug' : 'facepalm' });
      });
    }

    if (id === 'dock') {
      addLights(scene, LIGHT.dock);
      root.add(sky('morning')); const S = sea('morning'); S.mesh.position.y = -1; root.add(S.mesh); U((t) => S.update(t)); root.add(clouds('rgba(255,255,255,0.6)', 8, 60, 2));
      root.add(part(new THREE.BoxGeometry(30, 0.4, 14), toon('#ffffff', paintTexture({ base: '#8a7a6a', kind: 'planks', seed: 12, repeat: [6, 3] })), [0, -0.2, 2], { outline: 0.02, edges: false }));
      const hull = new THREE.Group(); hull.position.set(-2, 0, -8); root.add(hull);
      hull.add(part(new THREE.BoxGeometry(36, 7, 6), toon('#7d8590'), [0, 2.5, 0], { outline: 0.06 }));
      hull.add(part(new THREE.BoxGeometry(36.2, 0.5, 6.2), toon('#a3392d'), [0, -0.6, 0], { outline: 0.02, edges: false }));
      for (let i = 0; i < 12; i++) { const ph = new THREE.Mesh(new THREE.CircleGeometry(0.28, 16), toon('#2b2b33')); ph.position.set(-15 + i * 2.6, 4.2, 3.02); hull.add(ph); }
      hull.add(part(new THREE.BoxGeometry(10, 4, 4), toon('#e8e4dc'), [4, 7.6, 0], { outline: 0.04 }));
      hull.add(part(new THREE.CylinderGeometry(1.1, 1.3, 5, 16), toon('#2b2b33'), [6, 11, 0], { outline: 0.03, edges: false }));
      hull.add(part(new THREE.BoxGeometry(1.4, 0.15, 7), toon('#6e6a72'), [7, 2.0, 4.4], { rot: [-0.32, 0, 0], outline: 0.015 }));
      const sm = smoke(4, -8, 'rgba(60,60,70,0.4)', 5, 3); sm.group.position.y = 13; root.add(sm.group); U((t, cam) => sm.update(t, cam.position));
      root.add(part(new THREE.CylinderGeometry(0.06, 0.06, 1.8, 8), toon('#5b3a2a'), [2.6, 0.9, -0.4], { outline: 0.01, edges: false }));
      const sign = card(['NO PETS', 'ON BOARD'], 1.3, 0.8, { sizes: [200, 120], bg: '#f4ead2', fg: '#a3392d', border: '#a3392d' }); sign.position.set(2.6, 2.1, -0.36); root.add(sign);
      const ok = card(['PRIVATE', 'WOJTEK'], 0.9, 0.5, { sizes: [150, 150], bg: '#f4ead2', fg: '#2b2b33', border: '#2b2b33' }); ok.rotation.z = 0.12; root.add(ok);
      for (let i = 0; i < 6; i++) { const c = crate(0.8); c.position.set(-5 + (i % 3) * 0.85, Math.floor(i / 3) * 0.8, 1.5); root.add(c); }
      for (const x of [-8, 0, 8]) root.add(part(new THREE.CylinderGeometry(0.25, 0.3, 0.6, 12), toon('#2b2b33'), [x, 0.3, -4.2], { outline: 0.015, edges: false }));
      const rp = rope(0.4); rp.position.set(-1, 0, -3.6); root.add(rp);
      const sarge = add(makePerson(SARGE)), sol = add(makePerson(SOLD)); const bear = add(makeBear({ height: 1.9 }));
      U((t, cam) => {
        sarge.group.position.set(-0.9, 0, 0.8); sol.group.position.set(-2.4, 0, 1.2); bear.group.position.set(1.1, 0, 0.5);
        const pv = w(0, '^private');
        const k = ramp(t, pv - 0.05, pv + 0.3); ok.visible = k > 0; ok.scale.setScalar(pop(k)); ok.position.set(-0.2, 1.75, 1.3);
        sarge.update(t, cam.position, 0, { expr: t < pv ? 'smug' : 'grin', gesture: t < pv ? [[-1e9, 'holdR', { prop: 'paper' }]] : 'salute' });
        sol.update(t, cam.position, 0, { expr: t < pv ? 'alarmed' : 'grin', gesture: t < pv ? 'scared' : 'fists' });
        bear.update(t, cam.position, { pose: t > pv ? 'salute' : 'idle', expr: t > pv ? 'proud' : 'neutral' });
      });
    }

    if (id === 'zoo') {
      addLights(scene, LIGHT.grey);
      root.add(sky('grey')); root.add(ground('#5f7a4a', 'grass', 300, 50, 7)); root.add(clouds('rgba(150,160,170,0.7)', 10, 40, 6));
      const stone = toon('#ffffff', paintTexture({ base: '#9a948a', kind: 'asphalt', seed: 5, repeat: [6, 1] }));
      root.add(part(new THREE.BoxGeometry(18, 1.2, 0.6), stone, [0, 0.6, 1.0], { outline: 0.03 }));
      for (let i = 0; i < 25; i++) root.add(part(new THREE.CylinderGeometry(0.035, 0.035, 2.2, 6), toon('#2b2b33'), [-9 + i * 0.75, 2.3, 1.0], { outline: 0.006, edges: false }));
      root.add(part(new THREE.BoxGeometry(18, 0.08, 0.08), toon('#2b2b33'), [0, 3.4, 1.0], { outline: 0.006, edges: false }));
      root.add(part(new THREE.BoxGeometry(14, 3, 1.0), stone, [0, 1.5, -6], { outline: 0.03 }));
      const zs = card(['EDINBURGH ZOO'], 4.2, 0.8, { sizes: [100], bg: '#2f4a3a', fg: '#f3ead6', border: '#f3ead6' }); zs.position.set(1.8, 2.3, -5.45); root.add(zs);
      const cave = new THREE.Mesh(new THREE.CircleGeometry(1.4, 24, 0, Math.PI), toon('#2a2622')); cave.position.set(-3, 0, -5.48); root.add(cave);
      for (const [x, z] of [[-7, -8], [6, -9], [9, -4], [-9, 6], [8, 7]]) { root.add(part(new THREE.CylinderGeometry(0.2, 0.3, 3, 8), toon('#5b3a2a'), [x, 1.5, z], { outline: 0.015, edges: false })); root.add(part(new THREE.ConeGeometry(1.8, 4, 9), toon('#3f5f3a'), [x, 4.2, z], { outline: 0.03, edges: false })); }
      const pond = new THREE.Mesh(new THREE.CircleGeometry(1.6, 28), toon('#6f8fa8')); pond.rotation.x = -Math.PI / 2; pond.position.set(3, 0.03, -2.5); root.add(pond);
      root.add(part(new THREE.CylinderGeometry(0.05, 0.05, 1.6, 8), toon('#5b3a2a'), [3.4, 0.8, 1.8], { outline: 0.01, edges: false }));
      const sign = card(['WOJTEK', 'CORPORAL', '22nd COMPANY'], 1.4, 0.9, { sizes: [170, 130, 90], bg: '#f4ead2' }); sign.position.set(3.4, 1.9, 1.85); sign.rotation.y = -0.3; root.add(sign);
      const R = rain(700, 10, 10, 16); root.add(R.lines); U((t, cam) => R.update(t, cam.position));
      const bear = add(makeBear({ height: 1.95, tint: '#eef2f6' }));
      const v1 = add(makePerson(VET1, { tint: '#eef2f6' })), v2 = add(makePerson(VET2, { tint: '#eef2f6' }));
      U((t, cam) => {
        const call = w(3, '^Wojtek'), ans = w(4, '^answered'), cp = w(4, '^corporal');
        const comeIn = smooth(ramp(t, 34.7, call - 0.2));
        bear.group.position.set(-0.4 + 0.4 * smooth(ramp(t, call, call + 1.2)), 0, -2.4 + 1.2 * smooth(ramp(t, call, call + 1.6)));
        v1.group.position.set(0.9 + 2.5 * (1 - comeIn), 0, 2.4); v2.group.position.set(-0.6 + 2.5 * (1 - comeIn), 0, 2.6);
        bear.update(t, cam.position, { pose: t > cp - 0.1 ? 'salute' : t > ans - 0.2 && t < w(4, '^He$') ? 'wave' : t > call ? 'wave' : 'idle', expr: t > call ? 'happy' : 'neutral', stripe: t > cp - 0.1, walk: t > call && t < call + 1.4 });
        v1.update(t, cam.position, 0, { talk: talking(t, 'COMRADE') ? 1 : 0, expr: t > call - 0.2 ? (t > w(4, '^lived') ? 'calm' : 'grin') : 'neutral', gesture: t > cp ? 'salute' : t > call - 0.2 && t < ans ? 'wave' : 'idle' });
        v2.update(t, cam.position, 0, { expr: t > call ? 'grin' : 'neutral', gesture: t > cp ? 'salute' : t > call && t < ans + 0.5 ? 'wave' : 'idle' });
      });
    }

    if (id === 'badge') {
      addLights(scene, LIGHT.desert);
      root.add(sky('desert')); root.add(ground('#d9b98a', 'asphalt', 400, 60, 8)); root.add(hills('#c9956a', -120, 9, 36, 3)); root.add(hills('#b07a5a', -190, 7, 60, 9));
      const T = truck(); T.group.position.set(0, 0, 0); root.add(T.group);
      const T2 = truck('#4f5a36'); T2.group.position.set(-11, 0, -12); T2.group.rotation.y = 0.35; root.add(T2.group);
      const em = new THREE.Mesh(new THREE.CircleGeometry(0.42, 40), new THREE.MeshBasicMaterial({ map: emblemTex() })); em.position.set(2.05, 1.25, 0.92); root.add(em); U((t) => { em.scale.setScalar(1 + 0.02 * Math.sin(t * 2)); });
      for (let i = 0; i < 14; i++) root.add(part(new THREE.DodecahedronGeometry(0.2 + r() * 0.5, 0), toon('#b08a60'), [-20 + r() * 40, 0.1, -10 + r() * 20], { outline: 0.02 }));
      const dust = []; for (let i = 0; i < 4; i++) { const d = fogBank(14, 4, 'rgba(230,210,170,0.3)'); root.add(d); dust.push([d, i]); }
      U((t, cam) => dust.forEach(([d, i]) => { d.position.set(-20 + ((t * 1.2 + i * 12) % 40), 1.2, -8 - i * 4); d.lookAt(cam.position.x, 1.2, cam.position.z); }));
    }

    return { root, update(t, camera) { ups.forEach((f) => f(t, camera)); } };
  };
}

// ---------- cameras ----------
const zb = (t, t0) => -8 + (t - t0) * 1.15;
export const camHill = (t) => { const z = zb(t, 0); return { pos: V([1.6 - t * 0.12, 1.1 + Math.max(0, 1.9 - t) * 0.8, z + 5.8 - t * 0.2]), look: V([0.3, 1.8, z]), focus: V([0.2, 1.6, z]) }; };
export const camCarry = (t) => { const u = t - 20.9, z = zb(t, 20.9); const push = smooth(ramp(t, w(2, '^Crates') - 0.4, w(2, '^Crates') + 1.2)), side = smooth(ramp(t, w(2, '^and$') - 0.3, w(2, '^never') + 0.6));
  const c = { pos: V([4.2 - push * 2.2 - side * 3.6, 1.3 + push * 0.6 - side * 0.7, z + 3.8 - push * 1.4 + side * 1.2]), look: V([0, 1.9 + push * 0.7, z]), focus: V([0, 1.9, z]) }; return c; };
const dockA = cameraPath([{ t: 7.1, pos: [1.8, 2.0, 2.4], look: [2.6, 2.05, -0.4] }, { t: 8.4, pos: [1.5, 2.0, 3.0], look: [2.6, 2.0, -0.4] }]);
const dockB = cameraPath([{ t: 8.4, pos: [-0.4, 1.7, 4.6], look: [0.0, 1.4, 0.6] }, { t: 9.6, pos: [0.2, 1.6, 4.0], look: [0.2, 1.45, 0.6] }, { t: 10.8, pos: [0.9, 1.45, 3.2], look: [1.0, 1.5, 0.5] }]);
export const camDock = (t) => { const c = t < 8.4 ? dockA(t) : dockB(t); c.focus = V(t < 8.4 ? [2.6, 2.1, -0.4] : [0.2, 1.5, 0.8]); return shake(c, t, w(0, '^private'), 0.3, 0.04); };
const cas = cameraPath([{ t: 10.8, pos: [9, 4.5, 14], look: [-1, 1.5, -2] }, { t: 13.8, pos: [3.4, 2.1, 6.6], look: [-0.8, 1.3, -0.6] }, { t: 16.2, pos: [0.9, 0.7, 3.6], look: [-0.8, 1.7, -0.6] }, { t: 18.4, pos: [0.4, 0.6, 4.8], look: [-0.8, 1.9, 1.2] }]);
export const camCassino = (t) => { const c = cas(t); c.focus = V([-0.8, 1.6, -0.6 + Math.max(0, Math.min(3, (t - w(0, '^sees')) * 1.1))]); return shake(c, t, w(0, '^Shells'), 0.35, 0.05); };
const drvP = cameraPath([{ t: 18.4, pos: [1.2, 1.7, 6.6], look: [2.8, 1.55, 3.6] }, { t: 20.9, pos: [1.9, 1.62, 5.5], look: [2.6, 1.55, 3.6] }]);
export const camDriver = (t) => { const c = drvP(t); c.focus = V([2.8, 1.55, 3.6]); return shake(c, t, w(1, '^bear'), 0.3, 0.03); };
const tentP = cameraPath([{ t: 28.7, pos: [0.4, 1.6, 3.8], look: [0.0, 1.1, 0.3] }, { t: 31.3, pos: [-0.1, 1.35, 2.7], look: [-0.5, 1.2, 0.4] }, { t: 32.2, pos: [0.6, 1.3, 2.9], look: [0.4, 1.2, 0.2] }, { t: 34.7, pos: [0.5, 1.15, 2.3], look: [0.6, 1.3, 0.1] }]);
export const camTent = (t) => { const c = tentP(t); c.focus = V(t < 32.2 ? [-0.7, 1.3, 0.5] : [0.7, 1.4, 0.1]); return c; };
const zooA = cameraPath([{ t: 34.7, pos: [2.4, 2.6, 9.0], look: [0.3, 1.8, -2] }, { t: 37.75, pos: [1.2, 1.9, 5.6], look: [0, 1.6, -1.8] }]);
const zooB = cameraPath([{ t: 37.75, pos: [1.6, 1.75, 4.6], look: [-0.2, 1.5, -1.6] }, { t: 39.6, pos: [1.2, 1.7, 4.2], look: [-0.2, 1.5, -1.2] }]);
const zooC = cameraPath([{ t: 39.6, pos: [0.3, 1.6, 2.1], look: [0, 1.7, -1.2] }, { t: 43.0, pos: [0.6, 1.7, 3.0], look: [0.1, 1.6, -1.2] }, { t: 46.1, pos: [1.6, 1.9, 5.6], look: [0.2, 1.5, -0.4] }]);
const zooD = cameraPath([{ t: 46.1, pos: [2.5, 1.95, 3.9], look: [3.4, 1.9, 1.85] }, { t: 49.4, pos: [3.0, 1.9, 3.0], look: [3.4, 1.9, 1.85] }]);
export const camZoo = (t) => { const c = t < 37.75 ? zooA(t) : t < 39.6 ? zooB(t) : t < 46.1 ? zooC(t) : zooD(t); c.focus = V(t < 37.75 ? [0.5, 1.6, 0] : t < 39.6 ? [0.9, 1.6, 2.4] : t < 46.1 ? [0, 1.6, -1.2] : [3.4, 1.9, 1.85]); return c; };
export const camBadge = F(cameraPath([{ t: 49.4, pos: [5, 1.8, 6], look: [1.8, 1.3, 0.9] }, { t: 51.0, pos: [2.6, 1.3, 2.9], look: [2.05, 1.25, 0.92] }, { t: 53.6, pos: [2.12, 1.25, 1.95], look: [2.05, 1.25, 0.92] }]), [2.05, 1.25, 0.92]);
