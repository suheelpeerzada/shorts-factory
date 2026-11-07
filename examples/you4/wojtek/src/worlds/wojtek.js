// PRIVATE WOJTEK — the bear who joined the army. Locations: hill (hook), road (Iran 1942), tent (milk, beer, wrestling),
// dock (no pets -> enlisted), desk (paybook), cassino (crates), badge (company emblem), zoo (Edinburgh, corporal).
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
  _drawBear(bg, { t: 0, nz: () => 0.5, pose: 'carry', expr: 'proud' });
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

export function makeWojtek(id) {
  return function build(scene) {
    const root = new THREE.Group(); const r = rng(id.length * 7);
    const ups = []; const U = (f) => ups.push(f);
    const people = {};
    const add = (k, o) => { root.add(o.group); people[k] = o; return o; };

    if (id === 'hill' || id === 'cassino') {
      const night = id === 'cassino';
      addLights(scene, night ? LIGHT.night : LIGHT.battle);
      root.add(sky(night ? 'night' : 'battle')); root.add(clouds(night ? 'rgba(40,50,80,0.55)' : 'rgba(120,60,60,0.5)', 9, 50, 4));
      root.add(ground(night ? '#4a4438' : '#7a6a4e', 'asphalt', 400, 70, 4));
      root.add(hills(night ? '#26232c' : '#4a3a3a', -150, 9, 46, 6));
      // ruined monastery on the ridge + broken walls close by
      const ruin = new THREE.Group(); ruin.position.set(-6, 0, -70); root.add(ruin);
      const stone = toon('#ffffff', paintTexture({ base: night ? '#8f8a80' : '#cfc2a8', kind: 'asphalt', seed: 9, repeat: [3, 2] }));
      for (let i = 0; i < 7; i++) { const h = 6 + r() * 10; ruin.add(part(new THREE.BoxGeometry(5, h, 3), stone, [-15 + i * 5.2, h / 2 + 8, 0], { outline: 0.06 })); }
      ruin.add(part(new THREE.CylinderGeometry(0.1, 30, 8, 6), toon(night ? '#2e2a30' : '#5a4a44'), [0, 4, 0], { outline: 0.1, edges: false }));
      for (const [x, z, rot, h] of [[-5, -8, 0.3, 3.2], [6, -10, -0.4, 2.4], [-9, -2, 0.9, 1.8], [8, -3, -0.2, 2.8]]) {
        const wall = new THREE.Group(); wall.position.set(x, 0, z); wall.rotation.y = rot; root.add(wall);
        wall.add(part(new THREE.BoxGeometry(3.4, h, 0.6), stone, [0, h / 2, 0], { outline: 0.03 }));
        wall.add(part(new THREE.BoxGeometry(1.0, 1.4, 0.7), toon(night ? '#1a1820' : '#3a3030'), [0.4, h * 0.55, 0], { outline: 0.01, edges: false }));
        for (let k = 0; k < 5; k++) wall.add(part(new THREE.DodecahedronGeometry(0.25 + r() * 0.3, 0), stone, [r() * 3 - 1.5, 0.15, 0.6 + r() * 0.8], { outline: 0.015 }));
      }
      // craters, sandbags, crates, fires + smoke
      for (let i = 0; i < 9; i++) { const c = new THREE.Mesh(new THREE.CircleGeometry(1 + r() * 1.5, 20), toon('#3a3228')); c.rotation.x = -Math.PI / 2; c.position.set(-14 + r() * 28, 0.02, -24 + r() * 20); root.add(c); }
      const sb = sandbags(6, 2); sb.position.set(-4.8, 0, 1.2); root.add(sb); const sb2 = sandbags(5, 3, 7); sb2.position.set(2.6, 0, -6); sb2.rotation.y = -0.4; root.add(sb2);
      const stack = []; for (let i = 0; i < 6; i++) { const c = crate(0.75, '#8a6142'); c.position.set(-1.6 + (i % 3) * 0.8, Math.floor(i / 3) * 0.75, -1.4); root.add(c); stack.push(c); }
      const fires = [];
      for (const [x, z] of [[-10, -16], [9, -20], [-3, -32], [14, -8]]) {
        const fl = new THREE.Mesh(new THREE.ConeGeometry(0.7, 1.8, 10), glow('#ff8a3a')); fl.position.set(x, 0.9, z); root.add(fl);
        const pl = new THREE.PointLight('#ff8a3a', 22, 18, 1.4); pl.position.set(x, 1.6, z); root.add(pl); fires.push([fl, pl]);
        const sm = smoke(x, z, night ? 'rgba(30,30,40,0.55)' : 'rgba(50,38,40,0.5)', 6, x * 3 + z); root.add(sm.group); U((t, cam) => sm.update(t, cam.position));
      }
      const flash = new THREE.PointLight('#fff0c0', 0, 60, 1.2); flash.position.set(-8, 10, -30); flash.userData.noShadow = true; root.add(flash);
      U((t) => { fires.forEach(([fl, pl], i) => { fl.scale.set(1, 0.8 + 0.35 * Math.abs(Math.sin(t * 9 + i)), 1); pl.intensity = 22 * (0.8 + 0.2 * Math.sin(t * 13 + i)); }); const k = (t * 0.9) % 1.6; flash.intensity = k < 0.12 ? 160 * (1 - k / 0.12) : 0; });
      const bear = makeBear({ height: 1.95, tint: night ? '#d8dcea' : '#ffe0c8' }); add('bear', bear);
      if (id === 'hill') {
        const you = add('you', makePerson(YOU, { tint: '#ffe0c8' }));
        U((t, cam) => {
          const z = -12 + t * 1.15; bear.group.position.set(0, 0, z); you.group.position.set(1.5, 0, z + 0.4);
          bear.update(t, cam.position, { pose: 'carry', expr: 'strain', walk: true });
          you.update(t, cam.position, 1.5, { expr: t > w(0, 'roommate') - 0.1 ? 'grin' : 'alarmed', gesture: t > w(0, 'roommate') - 0.1 ? 'salute' : 'scared' });
        });
      } else {
        const s1 = add('s1', makePerson(SOLD, { tint: '#d8dcea' })), s2 = add('s2', makePerson({ ...SOLD, seed: 71, jacket: '#5b6640' }, { tint: '#d8dcea' }));
        U((t, cam) => {
          const pick = w(2, '^picked'), carried = w(2, '^carried');
          const walk = t > carried ? (t - carried) * 1.1 : 0;
          bear.group.position.set(-0.8, 0, -0.6 + walk); stack[5].visible = t < pick;
          bear.update(t, cam.position, { pose: t > pick ? 'carry' : 'idle', expr: t > carried ? 'proud' : t > pick ? 'strain' : 'neutral', walk: t > carried });
          s1.group.position.set(3.2, 0, -3); s1.update(t, cam.position, 0, { expr: t > pick ? 'alarmed' : 'neutral', gesture: t > pick ? 'scared' : [[-1e9, 'hold', { prop: 'book' }]] });
          s2.group.position.set(-4.0 + ((t * 0.8) % 3), 0, -5); s2.update(t, cam.position, 1.4, { expr: 'neutral', gesture: 'carry' });
        });
      }
    }

    if (id === 'road' || id === 'badge') {
      addLights(scene, LIGHT.desert);
      root.add(sky('desert')); root.add(ground('#d9b98a', 'asphalt', 400, 60, 8)); root.add(hills('#c9956a', -120, 9, 36, 3)); root.add(hills('#b07a5a', -190, 7, 60, 9));
      const road = new THREE.Mesh(new THREE.PlaneGeometry(6, 400), toon('#ffffff', paintTexture({ base: '#b99a70', kind: 'asphalt', seed: 2, repeat: [2, 80] }))); road.rotation.x = -Math.PI / 2; road.rotation.z = 0.35; road.position.set(-3, 0.02, -20); road.receiveShadow = true; root.add(road);
      const T = truck(); T.group.position.set(id === 'badge' ? 0 : -5.5, 0, id === 'badge' ? 0 : -3.5); T.group.rotation.y = id === 'badge' ? 0 : 0.35; root.add(T.group);
      const T2 = truck('#4f5a36'); T2.group.position.set(-11, 0, -12); T2.group.rotation.y = 0.35; root.add(T2.group);
      if (id === 'badge') { const em = new THREE.Mesh(new THREE.CircleGeometry(0.42, 40), new THREE.MeshBasicMaterial({ map: emblemTex() })); em.position.set(2.05, 1.25, 0.92); root.add(em); const em2 = em; U((t) => { em2.scale.setScalar(1 + 0.02 * Math.sin(t * 2)); }); }
      for (let i = 0; i < 14; i++) { const b = part(new THREE.DodecahedronGeometry(0.2 + r() * 0.5, 0), toon('#b08a60'), [-20 + r() * 40, 0.1, -10 + r() * 20], { outline: 0.02 }); root.add(b); }
      for (let i = 0; i < 6; i++) { const bush = part(new THREE.SphereGeometry(0.5 + r() * 0.4, 8, 6), toon('#8a8a4a'), [-14 + r() * 28, 0.3, -6 - r() * 14], { outline: 0.02, edges: false }); root.add(bush); }
      const dust = []; for (let i = 0; i < 4; i++) { const d = fogBank(14, 4, 'rgba(230,210,170,0.3)'); root.add(d); dust.push([d, i]); }
      U((t, cam) => dust.forEach(([d, i]) => { d.position.set(-20 + ((t * 1.2 + i * 12) % 40), 1.2, -8 - i * 4); d.lookAt(cam.position.x, 1.2, cam.position.z); }));
      if (id === 'road') {
        const you = add('you', makePerson(YOU)), boy = add('boy', makePerson(BOY)); const cub = makeBear({ height: 0.62, cub: true }); add('cub', cub);
        const sol = add('sol', makePerson(SOLD));
        U((t, cam) => {
          you.group.position.set(-0.55, 0, 0.5); boy.group.position.set(0.95, 0, 0.2); sol.group.position.set(-2.6, 0, -1.4);
          const hand = smooth(ramp(t, w(0, '^buys') - 0.1, w(0, '^cub') + 0.2));
          cub.group.position.set(0.85 + (-0.6 - 0.85) * hand, 0.3 + 0.38 * hand + Math.sin(hand * Math.PI) * 0.25, 0.45 + 0.15 * hand);
          cub.update(t, cam.position, { pose: 'idle', expr: hand > 0.9 ? 'happy' : 'neutral' });
          boy.update(t, cam.position, 0, { expr: hand < 0.5 ? 'grin' : 'smug', gesture: hand < 0.6 ? 'hold' : [[-1e9, 'holdR', { prop: 'paper' }]] });
          you.update(t, cam.position, 0, { expr: hand > 0.5 ? 'grin' : 'alarmed', gesture: hand > 0.4 ? 'hold' : 'idle' });
          sol.update(t, cam.position, 0, { expr: 'neutral', gesture: [[-1e9, 'holdR', { prop: 'mug' }]] });
        });
      }
    }

    if (id === 'tent' || id === 'desk') {
      addLights(scene, LIGHT.tent);
      root.add(ground('#5a4632', 'asphalt', 60, 12, 6));
      const canvasTex = patternTex((g, W, H) => { g.fillStyle = '#a89a6a'; g.fillRect(0, 0, W, H); g.strokeStyle = 'rgba(70,60,30,0.35)'; g.lineWidth = 3; for (let x = 0; x < W; x += 32) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); } }, 256, 256, [6, 2]);
      const cm = toon('#ffffff', canvasTex, { side: THREE.DoubleSide });
      const roof = new THREE.CylinderGeometry(4, 4, 12, 3, 1, true, -Math.PI / 2, Math.PI); roof.rotateZ(Math.PI / 2); roof.rotateY(Math.PI / 2);
      const shell = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.2, 12, 24, 1, true, 0, Math.PI), cm); shell.rotation.z = Math.PI / 2; shell.rotation.y = Math.PI / 2; shell.position.set(0, 0, 0); shell.receiveShadow = true; root.add(shell);
      root.add(part(new THREE.BoxGeometry(8.4, 4.2, 0.1), cm, [0, 2.1, -6], { outline: 0, edges: false }));
      root.add(part(new THREE.CylinderGeometry(0.08, 0.08, 4.4, 8), toon('#6b4a32'), [0, 2.2, -3], { outline: 0.01, edges: false }));
      root.add(part(new THREE.CylinderGeometry(0.06, 0.06, 12, 8), toon('#6b4a32'), [0, 4.15, 0], { rot: [Math.PI / 2, 0, 0], outline: 0.01, edges: false }));
      for (const [x, z] of [[-2.6, -3.5], [-2.6, -0.5], [2.6, -3.5]]) { root.add(part(new THREE.BoxGeometry(0.9, 0.45, 2.0), toon('#556240'), [x, 0.35, z], { outline: 0.02 })); root.add(part(new THREE.BoxGeometry(0.7, 0.12, 0.5), toon('#e8dcc4'), [x, 0.62, z - 0.6], { outline: 0.01 })); }
      const tab = part(new THREE.BoxGeometry(1.8, 0.08, 1.0), toon('#ffffff', paintTexture({ base: '#7a5236', kind: 'planks', seed: 4 })), [1.6, 0.85, -0.4], { outline: 0.015 }); root.add(tab);
      for (const [x, z] of [[0.8, -0.8], [2.4, -0.8], [0.8, 0], [2.4, 0]]) root.add(part(new THREE.BoxGeometry(0.07, 0.85, 0.07), toon('#5b3a2a'), [x, 0.42, z], { outline: 0.01, edges: false }));
      for (let i = 0; i < 4; i++) { const c = crate(0.6); c.position.set(-3 + (i % 2) * 0.65, Math.floor(i / 2) * 0.6, 2.4); root.add(c); }
      const br = barrel(); br.position.set(2.9, 0, 2.2); root.add(br);
      for (let i = 0; i < 4; i++) root.add(part(new THREE.BoxGeometry(0.06, 1.2, 0.06), toon('#3a2a22'), [3.3, 0.7, -2.4 + i * 0.3], { rot: [0, 0, 0.12], outline: 0.008, edges: false }));
      const hang = new THREE.Group(); hang.position.set(0, 3.9, -0.6); root.add(hang);
      hang.add(part(new THREE.CylinderGeometry(0.01, 0.01, 0.6, 4), toon('#2b2b33'), [0, -0.3, 0], { outline: 0, edges: false }));
      const lb = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 8), glow('#ffcf7a')); lb.position.y = -0.68; hang.add(lb);
      const hl = new THREE.PointLight('#ffb866', 26, 12, 1.2); hl.position.y = -0.78; hang.add(hl);
      const lamp2 = new THREE.PointLight('#ffb866', 8, 6, 1.4); lamp2.position.set(1.4, 1.3, -0.4); root.add(lamp2);
      const lamp2g = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), glow('#ffcf7a')); lamp2g.position.set(2.2, 1.05, -0.65); root.add(lamp2g);
      U((t) => { hang.rotation.z = Math.sin(t * 1.2) * 0.06; hl.intensity = 26 * (0.92 + 0.08 * Math.sin(t * 11)); });
      if (id === 'tent') {
        const you = add('you', makePerson(YOU, { tint: '#ffe8d0' })); const cub = makeBear({ height: 0.62, cub: true, tint: '#ffe8d0' }); add('cub', cub);
        const big = makeBear({ height: 1.45, tint: '#ffe8d0' }); add('big', big);
        const grow = w(0, '^He$') - 0.1, wr = w(0, '^wrestles') - 0.05;
        U((t, cam) => {
          you.group.position.set(-0.7, 0, 0.4); cub.group.position.set(-0.15, 0.62, 0.6); cub.group.visible = t < grow;
          cub.update(t, cam.position, { pose: 'drink', expr: 'happy' });
          big.group.visible = t >= grow; big.group.position.set(0.5 + (t > wr ? Math.sin(t * 13) * 0.08 : 0), 0, 0.2);
          big.update(t, cam.position, { pose: t > wr ? 'wrestle' : 'drink', expr: 'happy' });
          you.update(t, cam.position, 0, t < grow ? { expr: 'grin', gesture: [[-1e9, 'holdR', { prop: 'bottle' }]] } : t < wr ? { expr: 'smug', gesture: 'hips' } : { expr: 'scared', gesture: 'push' });
        });
      } else {
        // paybook close-up: cover, then lines pop on their words, then the stamp
        const book = new THREE.Group(); book.position.set(1.6, 0.9, -0.4); book.rotation.x = -Math.PI / 2; root.add(book);
        book.add(new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.62), toon('#7a2f2a')));
        const page = card(["SOLDIER'S PAYBOOK", 'NAME: WOJTEK'], 0.8, 0.28, { sizes: [92, 120], bg: '#f4ead2' }); page.position.set(0, 0.12, 0.005); book.add(page);
        const rank = card(['RANK: PRIVATE'], 0.8, 0.13, { sizes: [110], bg: '#f4ead2' }); rank.position.set(0, -0.07, 0.006); book.add(rank);
        const ser = card(['No. 22-0001'], 0.8, 0.12, { sizes: [110], bg: '#f4ead2' }); ser.position.set(0, -0.2, 0.006); book.add(ser);
        const mark = card(['APPROVED'], 0.36, 0.14, { sizes: [130], fg: '#a3392d', border: '#a3392d', bg: '#f4ead2' }); mark.position.set(0.2, -0.05, 0.01); mark.rotation.z = 0.25; book.add(mark);
        const stamp = new THREE.Group(); root.add(stamp);
        stamp.add(part(new THREE.CylinderGeometry(0.09, 0.11, 0.08, 16), toon('#a3392d'), [0, 0.04, 0], { outline: 0.008, edges: false }));
        stamp.add(part(new THREE.CylinderGeometry(0.035, 0.05, 0.22, 12), toon('#6b4a32'), [0, 0.19, 0], { outline: 0.008, edges: false }));
        U((t) => {
          rank.scale.setScalar(pop(ramp(t, w(2, '^rank') - 0.05, w(2, '^rank') + 0.25))); ser.scale.setScalar(pop(ramp(t, w(2, '^serial') - 0.05, w(2, '^serial') + 0.25)));
          const ts = w(2, '^number'); const down = t < ts ? 1 - smooth(ramp(t, ts - 0.5, ts)) : smooth(ramp(t, ts + 0.15, ts + 0.6));
          stamp.position.set(1.8, 0.9 + 0.02 + down * 0.5, -0.45); mark.visible = t > ts;
        });
      }
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
      const post = part(new THREE.CylinderGeometry(0.06, 0.06, 1.8, 8), toon('#5b3a2a'), [2.6, 0.9, -0.4], { outline: 0.01, edges: false }); root.add(post);
      const sign = card(['NO PETS', 'ON BOARD'], 1.3, 0.8, { sizes: [200, 120], bg: '#f4ead2', fg: '#a3392d', border: '#a3392d' }); sign.position.set(2.6, 2.1, -0.36); root.add(sign);
      for (let i = 0; i < 6; i++) { const c = crate(0.8); c.position.set(-5 + (i % 3) * 0.85, Math.floor(i / 3) * 0.8, 1.5); root.add(c); }
      for (const x of [-8, 0, 8]) root.add(part(new THREE.CylinderGeometry(0.25, 0.3, 0.6, 12), toon('#2b2b33'), [x, 0.3, -4.2], { outline: 0.015, edges: false }));
      const rp = rope(0.4); rp.position.set(-1, 0, -3.6); root.add(rp);
      const sarge = add('sarge', makePerson(SARGE)), you = add('you', makePerson(YOU)); const bear = makeBear({ height: 1.9 }); add('bear', bear);
      U((t, cam) => {
        sarge.group.position.set(-0.9, 0, 0.8); you.group.position.set(-2.4, 0, 1.2); bear.group.position.set(1.1, 0, 0.5);
        const sl = w(1, '^Then'), pv = w(1, '^Private');
        sarge.update(t, cam.position, 0, { talk: talking(t, 'SERGEANT') ? 1 : 0, expr: t < sl ? 'neutral' : t < pv ? 'angry' : 'grin', gesture: t < sl ? [[-1e9, 'hold', { prop: 'paper' }]] : t < w(1, '^Write') ? [[-1e9, 'point', { angle: 0.1 }]] : t < pv ? [[-1e9, 'holdR', { prop: 'paper' }]] : 'salute' });
        you.update(t, cam.position, 0, { expr: t < w(0, '^ban') ? 'neutral' : t < pv ? 'scared' : 'grin', gesture: t < w(0, '^ban') ? 'idle' : t < pv ? 'scared' : 'fists' });
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
      const cave = new THREE.Mesh(new THREE.CircleGeometry(1.4, 24, 0, Math.PI), toon('#2a2622')); cave.position.set(-3, 0, -5.48); root.add(cave);
      for (const [x, z] of [[-7, -8], [6, -9], [9, -4]]) { root.add(part(new THREE.CylinderGeometry(0.2, 0.3, 3, 8), toon('#5b3a2a'), [x, 1.5, z], { outline: 0.015, edges: false })); root.add(part(new THREE.ConeGeometry(1.8, 4, 9), toon('#3f5f3a'), [x, 4.2, z], { outline: 0.03, edges: false })); }
      const pond = new THREE.Mesh(new THREE.CircleGeometry(1.6, 28), toon('#6f8fa8')); pond.rotation.x = -Math.PI / 2; pond.position.set(3, 0.03, -2.5); root.add(pond);
      const sp = part(new THREE.CylinderGeometry(0.05, 0.05, 1.6, 8), toon('#5b3a2a'), [3.4, 0.8, 1.8], { outline: 0.01, edges: false }); root.add(sp);
      const sign = card(['WOJTEK', 'CORPORAL', 'POLISH II CORPS'], 1.4, 0.9, { sizes: [170, 130, 90], bg: '#f4ead2' }); sign.position.set(3.4, 1.9, 1.85); sign.rotation.y = -0.3; root.add(sign);
      const R = rain(900, 10, 10, 16); root.add(R.lines); U((t, cam) => R.update(t, cam.position));
      const bear = makeBear({ height: 1.95, tint: '#eef2f6' }); add('bear', bear); const you = add('you', makePerson(YOU, { tint: '#eef2f6' }));
      U((t, cam) => {
        bear.group.position.set(0, 0, -1.2); you.group.position.set(1.3, 0, 2.6);
        bear.update(t, cam.position, { pose: t > w(2, '^corporal') - 0.1 ? 'salute' : 'wave', expr: 'proud', stripe: true });
        you.update(t, cam.position, 0, { expr: t > w(2, '^Your') - 0.05 ? 'calm' : 'grin', gesture: t > w(2, '^corporal') ? 'salute' : 'idle' });
      });
    }

    return { root, update(t, camera) { ups.forEach((f) => f(t, camera)); } };
  };
}

// ---------- cameras ----------
const zb = (t) => -12 + t * 1.15;
export const camHill = (t) => { const z = zb(t); return { pos: V([1.8 - t * 0.12, 1.2 + Math.max(0, 1.9 - t) * 0.8, z + 6.5 - t * 0.25]), look: V([0.6, 1.7, z]), focus: V([0.4, 1.5, z]) }; };
export const camRoad = F(cameraPath([{ t: 7.45, pos: [7, 2.6, 10], look: [-2, 1.2, -2] }, { t: 10.2, pos: [3.2, 1.6, 5.2], look: [0.1, 1.0, 0.2] }, { t: 12.0, pos: [0.9, 1.25, 3.0], look: [0.2, 0.85, 0.3] }, { t: 14.65, pos: [0.2, 1.2, 2.5], look: [-0.5, 0.95, 0.4] }]), [0.1, 0.9, 0.4]);
const tentA = cameraPath([{ t: 14.65, pos: [0.6, 1.5, 3.2], look: [-0.5, 1.0, 0.4] }, { t: 17.6, pos: [0.1, 1.2, 2.2], look: [-0.4, 0.95, 0.5] }]);
const tentB = cameraPath([{ t: 17.6, pos: [-0.2, 1.4, 3.4], look: [0.1, 1.0, 0.3] }, { t: 19.6, pos: [0.0, 1.3, 2.8], look: [0.0, 1.0, 0.3] }, { t: 21.45, pos: [0.3, 1.0, 2.6], look: [0.0, 1.0, 0.3] }]);
export const camTent = (t) => { const c = t < 17.6 ? tentA(t) : tentB(t); c.focus = V(t < 17.6 ? [-0.4, 1.0, 0.5] : [0, 1.0, 0.3]); const wr = w(0, '^wrestles'); if (t > wr) { c.pos.x += Math.sin(t * 31) * 0.05; c.pos.y += Math.sin(t * 27) * 0.04; } return c; };
const dockP = cameraPath([
  { t: 21.45, pos: [-1.6, 1.6, 4.6], look: [-1.0, 1.3, 0.6] },
  { t: 24.2, pos: [-0.6, 1.7, 4.2], look: [-0.4, 1.4, 0.4] },
  { t: 25.2, pos: [1.6, 2.0, 2.8], look: [2.6, 2.0, -0.4] },
  { t: 26.8, pos: [1.8, 2.0, 2.3], look: [2.6, 2.05, -0.4] },
  { t: 27.4, pos: [-0.2, 1.6, 4.4], look: [0.0, 1.3, 0.6] },
  { t: 29.6, pos: [0.4, 1.5, 3.6], look: [0.4, 1.35, 0.5] },
  { t: 31.15, pos: [0.9, 1.4, 3.0], look: [1.0, 1.5, 0.5] },
]);
export const camDock = (t) => { const c = dockP(t); c.focus = V(t > 25.0 && t < 27.0 ? [2.6, 2.1, -0.4] : t > 29.6 ? [1.1, 1.5, 0.5] : [-0.9, 1.45, 0.8]); return shake(c, t, w(1, '^Wojtek'), 0.3, 0.04); };
export const camDesk = (t) => { const c = cameraPath([{ t: 31.15, pos: [1.6, 2.2, 0.6], look: [1.6, 0.9, -0.42] }, { t: 34.9, pos: [1.62, 1.75, 0.15], look: [1.62, 0.9, -0.42] }])(t); c.focus = V([1.6, 0.9, -0.42]); c.cap = 'top'; return shake(c, t, w(2, '^number') + 0.02, 0.25, 0.03); };
const cas = cameraPath([{ t: 34.9, pos: [9, 4.5, 14], look: [-1, 1.5, -2] }, { t: 38.6, pos: [3.2, 2.0, 6.5], look: [-0.8, 1.3, -0.6] }, { t: 41.0, pos: [0.9, 0.7, 3.6], look: [-0.8, 1.7, -0.6] }, { t: 43.75, pos: [0.6, 0.6, 4.6], look: [-0.8, 1.8, 1.4] }]);
export const camCassino = (t) => { const c = cas(t); c.focus = V([-0.8, 1.6, -0.6 + Math.max(0, t - 42.4) * 1.1]); return c; };
export const camBadge = F(cameraPath([{ t: 43.75, pos: [5, 1.8, 6], look: [1.8, 1.3, 0.9] }, { t: 45.6, pos: [2.6, 1.3, 2.9], look: [2.05, 1.25, 0.92] }, { t: 47.5, pos: [2.1, 1.25, 2.1], look: [2.05, 1.25, 0.92] }]), [2.05, 1.25, 0.92]);
const zoo = cameraPath([{ t: 47.5, pos: [2.2, 2.0, 7.5], look: [0.4, 1.5, -1] }, { t: 50.2, pos: [0.9, 1.6, 4.6], look: [0, 1.6, -1.2] }, { t: 51.3, pos: [1.0, 1.6, 4.4], look: [0.3, 1.5, -0.6] }, { t: 54.04, pos: [1.6, 1.55, 4.2], look: [1.3, 1.5, 2.6] }]);
export const camZoo = (t) => { const c = zoo(t); c.focus = V(t < 51.3 ? [0, 1.6, -1.2] : [1.3, 1.45, 2.6]); return c; };
