// VIOLET JESSOP - survived the Olympic collision (1911), the Titanic (1912) and the Britannic (1916).
// Locations: hook (lifeboat, Titanic sinking), olympic (warship rams + deck walk), titanic (night deck, officer),
// lifeboat (boat 16, baby), britannic (hospital ship, mine, propellers, jump, in the water), cabin (bandage, toothbrush).
import * as THREE from 'three';
import { toon, part, paintTexture, rng, INK } from '../lib/toon.js';
import { makePerson } from '../lib/char.js';
import { addLights } from '../Stage.jsx';
import { cameraPath } from '../lib/camera.js';
import { w, talking } from '../times.js';
import { ramp, smooth, pop, glow, sky, sea, card, crate, barrel, rope, fogBank, clouds, smoke, CAPTAIN } from './common.js';

const VIO = { skin: '#f3d9c0', hair: '#3a2622', bun: true, outfit: 'coat', jacket: '#2b2f45', jacket2: '#22263a', shoes: INK, hat: 'maid', seed: 21, height: 1.64 };
const NURSE = { ...VIO, jacket: '#8fa2b8', jacket2: '#74879c', hat: 'nurse' };
const HURT = { ...VIO, hat: 'none', bandage: true, jacket: '#8fa2b8', jacket2: '#74879c' };
const PAX1 = { skin: '#ecd2b8', hair: '#8a5a3a', bun: true, outfit: 'coat', jacket: '#7a2f3a', jacket2: '#5f2430', shoes: INK, hat: 'none', seed: 61, height: 1.6 };
const PAX2 = { skin: '#e8c8a8', hair: '#2e211b', moustache: '#2e211b', outfit: 'coat', jacket: '#3a3a40', jacket2: '#2b2b33', shoes: INK, hat: 'bowler', hatColor: '#2b2b33', seed: 62, height: 1.76 };
const V = (a) => new THREE.Vector3(...a);
const shake = (c, t, t0, d = 0.3, a = 0.05) => { if (t > t0 && t < t0 + d) { const s = (1 - (t - t0) / d) * a; c.pos.x += Math.sin(t * 97) * s; c.pos.y += Math.sin(t * 71 + 2) * s; } return c; };

const LIGHT = {
  night: { center: [0, 0, 0], key: [-40, 50, -60], keyColor: '#9fb4d8', keyI: 0.8, hemiI: 0.5, hemi: ['#3a4a6a', '#141826'], size: 30, fog: ['#141826', 30, 260] },
  day: { center: [0, 0, 0], key: [-40, 60, 40], keyColor: '#fff0dc', keyI: 1.9, hemiI: 1.0, hemi: ['#c8d4e0', '#5a6a72'], size: 34, fog: ['#c3ccd4', 60, 420] },
  cabin: { center: [0, 0, 0], key: [-20, 30, 20], keyColor: '#9fb4d8', keyI: 0.3, hemiI: 0.45, hemi: ['#6a5a40', '#2a1e14'], size: 8, fog: ['#1a140e', 20, 120] },
};

// an Olympic-class liner, bow toward +x, waterline at y = 0
function liner({ hull = '#1f1f26', top = '#f3ead6', funnel = '#d89a3a', stripe = null, cross = false, lit = true } = {}) {
  const g = new THREE.Group();
  g.add(part(new THREE.BoxGeometry(40, 7, 5), toon(hull), [0, 2.0, 0], { outline: 0.06 }));
  g.add(part(new THREE.BoxGeometry(40.2, 1.0, 5.2), toon('#a3392d'), [0, -1.0, 0], { outline: 0.02, edges: false }));
  const bow = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 2.5, 7, 3), toon(hull)); bow.rotation.z = -Math.PI / 2; bow.rotation.x = Math.PI / 2; bow.scale.set(1, 1, 0.55); bow.position.set(21.6, 2.0, 0); g.add(bow);
  if (stripe) g.add(part(new THREE.BoxGeometry(40.3, 0.5, 5.3), toon(stripe), [0, 1.6, 0], { outline: 0.01, edges: false }));
  g.add(part(new THREE.BoxGeometry(30, 2.4, 4.4), toon(top), [-1, 6.7, 0], { outline: 0.04 }));
  g.add(part(new THREE.BoxGeometry(22, 1.6, 3.8), toon(top), [-1, 8.7, 0], { outline: 0.03 }));
  for (const x of [-10, -3.5, 3, 9.5]) {
    g.add(part(new THREE.CylinderGeometry(1.0, 1.1, 5.4, 16), toon(funnel), [x, 12.2, 0], { outline: 0.04, edges: false }));
    g.add(part(new THREE.CylinderGeometry(1.02, 1.02, 1.0, 16), toon('#1a1a20'), [x, 14.6, 0], { outline: 0.02, edges: false }));
  }
  for (const x of [-18, 16]) g.add(part(new THREE.CylinderGeometry(0.1, 0.12, 14, 6), toon('#3a3238'), [x, 12, 0], { outline: 0.01, edges: false }));
  for (let row = 0; row < 3; row++) for (let i = 0; i < 26; i++) {
    const p = new THREE.Mesh(new THREE.CircleGeometry(0.22, 12), lit ? glow('#ffd98a') : toon('#2b2b33')); p.position.set(-17 + i * 1.35, 1.6 + row * 1.3, 2.52); g.add(p);
  }
  for (let i = 0; i < 18; i++) { const p = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.6), lit ? glow('#ffe2a0') : toon('#6f8fa8')); p.position.set(-14 + i * 1.5, 6.7, 2.22); g.add(p); }
  if (cross) for (const x of [-9, 6]) { const c = card(['+'], 2.6, 2.6, { sizes: [900], bg: '#f3ead6', fg: '#c9353a', border: '#f3ead6' }); c.position.set(x, 2.6, 2.53); g.add(c); }
  // lifeboats along the boat deck
  for (const x of [-13, -9, 5, 9]) g.add(part(new THREE.BoxGeometry(2.6, 0.6, 0.9), toon('#f3ead6'), [x, 8.2, 2.3], { outline: 0.015 }));
  if (lit) { const l = new THREE.PointLight('#ffcf7a', 40, 30, 1.4); l.position.set(0, 4, 6); g.add(l); }
  return g;
}
function warship() {
  const g = new THREE.Group(); const grey = toon('#7d8590');
  g.add(part(new THREE.BoxGeometry(22, 3, 3.6), grey, [0, 0.8, 0], { outline: 0.04 }));
  const bow = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 1.8, 6, 3), grey); bow.rotation.z = -Math.PI / 2; bow.rotation.x = Math.PI / 2; bow.scale.set(1, 1, 0.6); bow.position.set(13.8, 0.8, 0); g.add(bow);
  g.add(part(new THREE.BoxGeometry(6, 2, 2.6), grey, [-1, 3.3, 0], { outline: 0.03 }));
  for (const x of [-3, 1]) g.add(part(new THREE.CylinderGeometry(0.6, 0.7, 3.2, 12), toon('#5a6068'), [x, 5.6, 0], { outline: 0.03, edges: false }));
  for (const x of [6, -8]) { g.add(part(new THREE.CylinderGeometry(0.7, 0.7, 0.8, 12), grey, [x, 2.7, 0], { outline: 0.02, edges: false })); g.add(part(new THREE.CylinderGeometry(0.12, 0.12, 3, 6), toon('#3a3f48'), [x + 1.4, 2.9, 0], { rot: [0, 0, Math.PI / 2], outline: 0.01, edges: false })); }
  return g;
}
function lifeboat(num) {
  const g = new THREE.Group();
  g.add(part(new THREE.BoxGeometry(3.6, 0.8, 1.5), toon('#f3ead6'), [0, 0.15, 0], { outline: 0.03 }));
  g.add(part(new THREE.BoxGeometry(3.7, 0.12, 1.6), toon('#7a5236'), [0, 0.6, 0], { outline: 0.015, edges: false }));
  for (const x of [-1, 0.2, 1.2]) g.add(part(new THREE.BoxGeometry(0.2, 0.1, 1.4), toon('#9a6b42'), [x, 0.35, 0], { outline: 0.01, edges: false }));
  if (num) { const c = card([num], 0.5, 0.36, { sizes: [260], bg: '#f3ead6', fg: '#2b2b33', border: '#f3ead6' }); c.position.set(1.3, 0.25, 0.76); g.add(c); }
  return g;
}
function iceberg(r) {
  const g = new THREE.Group(); const m = toon('#e8f2fa');
  for (let i = 0; i < 6; i++) g.add(part(new THREE.DodecahedronGeometry(3 + r() * 4, 0), m, [(r() - 0.5) * 10, 1 + r() * 5, (r() - 0.5) * 6], { outline: 0.05 }));
  return g;
}

export function makeViolet(id) {
  return function build(scene) {
    const root = new THREE.Group(); const r = rng(id.length * 11 + 3);
    const ups = []; const U = (f) => ups.push(f);
    const add = (o) => { root.add(o.group); return o; };
    const water = (mode) => { const S = sea(mode); root.add(S.mesh); U((t) => S.update(t)); return S; };

    if (id === 'hook' || id === 'lifeboat') {
      addLights(scene, LIGHT.night); root.add(sky('night')); water('night'); root.add(clouds('rgba(40,50,80,0.5)', 8, 60, 3));
      const ti = liner(); ti.position.set(-12, 0, -48); ti.rotation.y = 0.35; root.add(ti);
      const boat = lifeboat(id === 'lifeboat' ? '16' : null); root.add(boat);
      const vio = add(makePerson(VIO, { tint: '#dfe6f4' }));
      const p1 = add(makePerson(PAX1, { tint: '#dfe6f4' })), p2 = add(makePerson(PAX2, { tint: '#dfe6f4' }));
      const lamp = new THREE.PointLight('#ffcf7a', 2.2, 4, 1.6); lamp.position.set(1.4, 1.2, 0.4); root.add(lamp);
      const lb = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), glow('#ffd98a')); lb.position.set(1.5, 0.9, 0.3); root.add(lb);
      U((t, cam) => {
        const bob = Math.sin(t * 1.3) * 0.06; boat.position.y = bob; boat.rotation.x = Math.sin(t * 1.1) * 0.03;
        ti.rotation.z = id === 'hook' ? -0.08 - t * 0.006 : -0.2 - (t - 22.7) * 0.01;
        vio.group.position.set(0.3, bob - 0.35, 0.2); p1.group.position.set(-0.9, bob - 0.38, -0.2); p2.group.position.set(-1.6, bob - 0.3, 0.1);
        if (id === 'hook') vio.update(t, cam.position, 0, { expr: t > w(0, '^grabbed') ? 'smug' : 'alarmed', gesture: t > w(0, '^both') ? 'scared' : 'idle' });
        else { const d = w(2, '^drops'); vio.update(t, cam.position, 0, { expr: t < d ? 'scared' : 'alarmed', gesture: t > d - 0.1 ? [[-1e9, 'hold', { prop: 'baby' }]] : 'scared' }); }
        p1.update(t, cam.position, 0, { expr: 'scared', gesture: 'scared' }); p2.update(t, cam.position, 0, { expr: 'sad', gesture: 'idle' });
      });
    }

    if (id === 'olympic') {
      addLights(scene, LIGHT.day); root.add(sky('morning')); water('morning'); root.add(clouds('rgba(255,255,255,0.6)', 8, 70, 2));
      const ol = liner({ lit: false }); ol.position.set(0, 0, -8); root.add(ol);
      const wa = warship(); wa.rotation.y = Math.PI / 2 + 0.35; root.add(wa);
      const tag = card(['OLYMPIC', '1911'], 7, 3, { sizes: [240, 200], bg: '#f4ead2' }); tag.position.set(-2, 18.5, -8); root.add(tag);
      const splash = new THREE.Mesh(new THREE.ConeGeometry(2.4, 6, 12, 1, true), glow('#ffffff', 0.8)); root.add(splash);
      const sm = smoke(-3.5, -8, 'rgba(80,80,90,0.4)', 5, 2); sm.group.position.y = 15; root.add(sm.group); U((t, cam) => sm.update(t, cam.position));
      // deck set (for the walk-away close-up), far from the ships
      const deck = new THREE.Group(); deck.position.set(0, 8, 60); root.add(deck);
      deck.add(part(new THREE.BoxGeometry(16, 0.3, 5), toon('#ffffff', paintTexture({ base: '#b8925e', kind: 'planks', seed: 3, repeat: [8, 2] })), [0, -0.15, 0], { outline: 0.02, edges: false }));
      deck.add(part(new THREE.BoxGeometry(16, 3, 0.3), toon('#f3ead6'), [0, 1.5, -2.4], { outline: 0.03 }));
      for (let i = 0; i < 6; i++) deck.add(part(new THREE.PlaneGeometry(0.8, 0.9), toon('#6f8fa8'), [-6 + i * 2.4, 1.8, -2.24], { outline: 0, edges: false }));
      for (let i = 0; i < 17; i++) deck.add(part(new THREE.CylinderGeometry(0.03, 0.03, 1.1, 6), toon('#f3ead6'), [-8 + i, 0.55, 2.3], { outline: 0.006, edges: false }));
      deck.add(part(new THREE.BoxGeometry(16, 0.1, 0.12), toon('#7a5236'), [0, 1.1, 2.3], { outline: 0.008, edges: false }));
      const vio = makePerson(VIO); deck.add(vio.group);
      U((t, cam) => {
        const hit = w(0, '^rams'), k = smooth(ramp(t, 8.9, hit));
        wa.position.set(14 - 8.5 * k, 0, 24 - 27.5 * k);
        const s = t > hit ? Math.max(0, 1 - (t - hit) / 0.8) : 0; ol.rotation.x = Math.sin(t * 40) * 0.01 * s;
        splash.visible = t > hit && t < hit + 0.9; splash.position.set(5.5, 2 + (t - hit) * 2, -4.8); splash.scale.setScalar(0.4 + (t - hit) * 1.2);
        const tk = ramp(t, w(0, '^Olympic') - 0.05, w(0, '^Olympic') + 0.3); tag.visible = tk > 0; tag.scale.setScalar(pop(tk)); tag.lookAt(cam.position);
        vio.group.position.set(-3.2 + Math.max(0, t - 14.9) * 1.6, 0, -0.1); vio.update(t, cam.position, t > 14.9 ? 1.6 : 0, { expr: 'smug' });
      });
    }

    if (id === 'titanic') {
      addLights(scene, LIGHT.night); root.add(sky('night')); const S = water('night'); S.mesh.position.y = -8;
      root.add(part(new THREE.BoxGeometry(16, 0.3, 6), toon('#ffffff', paintTexture({ base: '#8a7050', kind: 'planks', seed: 5, repeat: [8, 3] })), [0, -0.15, 0], { outline: 0.02, edges: false }));
      root.add(part(new THREE.BoxGeometry(16, 3, 0.3), toon('#e8e0d0'), [0, 1.5, -2.8], { outline: 0.03 }));
      for (let i = 0; i < 6; i++) root.add(part(new THREE.PlaneGeometry(0.8, 0.9), glow('#c9a868'), [-6 + i * 2.4, 1.8, -2.64], { outline: 0, edges: false }));
      for (let i = 0; i < 17; i++) root.add(part(new THREE.CylinderGeometry(0.03, 0.03, 1.1, 6), toon('#e8e0d0'), [-8 + i, 0.55, 2.8], { outline: 0.006, edges: false }));
      root.add(part(new THREE.BoxGeometry(16, 0.1, 0.12), toon('#7a5236'), [0, 1.1, 2.8], { outline: 0.008, edges: false }));
      root.add(part(new THREE.CylinderGeometry(1.4, 1.5, 8, 16), toon('#d89a3a'), [-2, 7, -6], { outline: 0.04, edges: false }));
      root.add(part(new THREE.CylinderGeometry(1.42, 1.42, 1.4, 16), toon('#1a1a20'), [-2, 11, -6], { outline: 0.02, edges: false }));
      const boat = lifeboat(); boat.position.set(5.6, 1.7, 3.6); root.add(boat);
      for (const x of [4.0, 7.2]) root.add(part(new THREE.CylinderGeometry(0.06, 0.06, 2.6, 6), toon('#2b2b33'), [x, 1.3, 2.9], { outline: 0.008, edges: false }));
      const buoy = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.11, 10, 24), toon('#f3ead6')); buoy.position.set(-2.6, 0.8, 2.86); root.add(buoy);
      const name = card(['TITANIC'], 1.2, 0.3, { sizes: [220], bg: '#f3ead6', fg: '#a3392d', border: '#f3ead6' }); name.position.set(-2.6, 0.32, 2.9); root.add(name);
      const berg = iceberg(r); root.add(berg);
      for (const x of [-5, 1]) { const l = new THREE.PointLight('#ffcf7a', 3.5, 7, 1.6); l.position.set(x, 2.6, -2); root.add(l); const b = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), glow('#ffd98a')); b.position.set(x, 2.6, -2.5); root.add(b); }
      const off = add(makePerson(CAPTAIN, { tint: '#e6ecf6' })), vio = add(makePerson(VIO, { tint: '#e6ecf6' }));
      U((t, cam) => {
        berg.position.set(30 - (t - 16.4) * 4.5, -6, 34);
        off.group.position.set(1.3, 0, 1.0); vio.group.position.set(-0.5, 0, 1.4);
        const sl = w(1, '^Miss');
        off.update(t, cam.position, 0, { talk: talking(t, 'OFFICER') ? 1 : 0, expr: t > sl - 0.2 ? 'shout' : 'alarmed', gesture: t > sl - 0.2 ? [[-1e9, 'point', { angle: -0.3 }]] : 'idle' });
        vio.update(t, cam.position, 0, { expr: t > w(0, '^Titanic') ? 'scared' : 'neutral', gesture: t > sl ? 'scared' : 'idle' });
      });
    }

    if (id === 'britannic') {
      addLights(scene, LIGHT.day); root.add(sky('morning')); water('morning'); root.add(clouds('rgba(255,255,255,0.6)', 8, 70, 5));
      const br = liner({ hull: '#f3ead6', top: '#f3ead6', funnel: '#d89a3a', stripe: '#3f7a4a', cross: true, lit: false }); br.position.set(0, 0, -10); root.add(br);
      const tag = card(['BRITANNIC', '1916'], 7.5, 3, { sizes: [230, 200], bg: '#f4ead2' }); tag.position.set(-1, 19, -10); root.add(tag);
      const col = new THREE.Mesh(new THREE.ConeGeometry(3, 12, 14, 1, true), glow('#ffffff', 0.85)); root.add(col);
      const flash = new THREE.PointLight('#fff0c0', 0, 80, 1.2); flash.position.set(19, 4, -5); root.add(flash);
      const props = []; for (const z of [-11.6, -8.4]) { const p = new THREE.Group(); p.position.set(-21, 0.2, z); root.add(p); for (let k = 0; k < 3; k++) { const b = part(new THREE.BoxGeometry(0.25, 3.0, 0.9), toon('#c9a25a'), [0, 1.5, 0], { outline: 0.02 }); const h = new THREE.Group(); h.rotation.x = (k * 2 * Math.PI) / 3; h.add(b); p.add(h); } p.add(part(new THREE.SphereGeometry(0.5, 12, 10), toon('#a3832a'), [0, 0, 0], { outline: 0.02, edges: false })); props.push(p); }
      const boat = lifeboat(); root.add(boat);
      const vio = add(makePerson(NURSE)); const p1 = add(makePerson({ ...PAX2, hat: 'cap', hatColor: '#3a3a40', seed: 64 }));
      const foam = new THREE.Mesh(new THREE.CircleGeometry(1.4, 24), glow('#ffffff', 0.7)); foam.rotation.x = -Math.PI / 2; root.add(foam);
      U((t, cam) => {
        const mine = w(2, '^mine'), jump = w(2, '^jumps');
        const sink = smooth(ramp(t, mine, mine + 6)); br.rotation.z = -0.07 * sink; br.position.y = -0.6 * sink;
        flash.intensity = t > mine && t < mine + 0.25 ? 260 * (1 - (t - mine) / 0.25) : 0;
        col.visible = t > mine && t < mine + 1.4; col.position.set(19, 4 + (t - mine) * 3, -6.5); col.scale.set(0.5 + (t - mine), 0.4 + (t - mine) * 0.9, 0.5 + (t - mine));
        const tk = ramp(t, w(2, '^Britannic') - 0.05, w(2, '^Britannic') + 0.3); tag.visible = tk > 0; tag.scale.setScalar(pop(tk)); tag.lookAt(cam.position);
        props.forEach((p, i) => { p.rotation.x = t * (2.5 + i * 0.4); p.position.y = 0.2 + sink * 1.4; });
        const d = smooth(ramp(t, 33.6, jump + 0.6)); boat.position.set(-13 - 5.5 * d, Math.sin(t * 1.4) * 0.05, -3.5 - 3.2 * d); boat.rotation.y = 0.3 + d * 0.5;
        p1.group.position.set(boat.position.x - 0.8, boat.position.y - 0.35, boat.position.z + 0.1);
        p1.update(t, cam.position, 0, { expr: t > 34.4 ? 'scared' : 'neutral', gesture: t > 34.4 ? 'scared' : 'idle' });
        const jk = smooth(ramp(t, jump, jump + 0.7)); const bx = boat.position.x + 0.4, bz = boat.position.z + 0.2;
        if (t < jump) vio.group.position.set(bx, boat.position.y - 0.35, bz);
        else vio.group.position.set(bx + 3.2 * jk, -0.35 + Math.sin(jk * Math.PI) * 1.1 - 0.9 * jk, bz + 3.0 * jk);
        foam.visible = t > jump + 0.6; foam.position.set(bx + 3.2, 0.03, bz + 3.0); foam.scale.setScalar(0.6 + 0.2 * Math.sin(t * 3));
        vio.update(t, cam.position, 0, { talk: talking(t, 'VIOLET') ? 1 : 0, expr: t > w(3, '^Not') - 0.2 ? 'shout' : t > 34.4 ? 'scared' : 'neutral', gesture: t > jump && t < jump + 0.8 ? 'carry' : t > 34.4 ? 'scared' : 'idle' });
      });
    }

    if (id === 'cabin') {
      addLights(scene, LIGHT.cabin);
      const room = new THREE.Group(); root.add(room);
      room.add(part(new THREE.BoxGeometry(6, 0.2, 5), toon('#ffffff', paintTexture({ base: '#7a5236', kind: 'planks', seed: 8, repeat: [4, 3] })), [0, -0.1, 0], { outline: 0.01, edges: false }));
      const wall = toon('#e8dcc4');
      room.add(part(new THREE.BoxGeometry(6, 3.2, 0.2), wall, [0, 1.6, -1.9], { outline: 0.02, edges: false }));
      room.add(part(new THREE.BoxGeometry(0.2, 3.2, 5), wall, [-2.6, 1.6, 0], { outline: 0.02, edges: false }));
      const port = new THREE.Mesh(new THREE.CircleGeometry(0.32, 24), glow('#9fd0f0')); port.position.set(-0.9, 1.9, -1.78); room.add(port);
      room.add(part(new THREE.TorusGeometry(0.34, 0.06, 8, 24), toon('#c9a25a'), [-0.9, 1.9, -1.77], { outline: 0.01, edges: false }));
      room.add(part(new THREE.BoxGeometry(2.0, 0.5, 0.9), toon('#ffffff', paintTexture({ base: '#7a5236', kind: 'planks', seed: 9 })), [-1.5, 0.3, -1.3], { outline: 0.02 }));
      room.add(part(new THREE.BoxGeometry(1.9, 0.15, 0.8), toon('#f4ead2'), [-1.5, 0.62, -1.3], { outline: 0.01, edges: false }));
      room.add(part(new THREE.BoxGeometry(0.8, 0.85, 0.5), toon('#7a5236'), [1.2, 0.42, -1.6], { outline: 0.02 }));
      room.add(part(new THREE.CylinderGeometry(0.28, 0.2, 0.12, 16), toon('#e8eef4'), [1.2, 0.9, -1.6], { outline: 0.01, edges: false }));
      room.add(part(new THREE.PlaneGeometry(0.6, 0.7), toon('#9fb4c8'), [1.2, 1.55, -1.79], { outline: 0, edges: false }));
      const cup = part(new THREE.CylinderGeometry(0.06, 0.05, 0.14, 12), toon('#e8e0d0'), [1.38, 0.92, -1.5], { outline: 0.006, edges: false }); room.add(cup);
      const brush = new THREE.Group(); brush.add(part(new THREE.BoxGeometry(0.03, 0.2, 0.03), toon('#7fc8e8'), [0, 0.1, 0], { outline: 0.004, edges: false })); brush.position.set(1.38, 0.98, -1.5); room.add(brush);
      const suit = crate(0.5, '#6b3a2a'); suit.position.set(-2.1, 0, 0.8); room.add(suit);
      const lamp = new THREE.PointLight('#ffb866', 5, 7, 1.5); lamp.position.set(0.2, 2.6, -0.6); room.add(lamp);
      const lb = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), glow('#ffcf7a')); lb.position.set(0.2, 2.7, -1.0); room.add(lb);
      const hurt = add(makePerson(HURT, { tint: '#ffe8d0' })), vio = add(makePerson(NURSE, { tint: '#ffe8d0' }));
      U((t, cam) => {
        const fb = t >= 43.0; const g = w(4, '^grabbed'), tb = w(4, '^toothbrush'), ms = w(4, '^missed');
        room.rotation.z = fb ? 0.05 + 0.015 * Math.sin(t * 2) : 0; lamp.intensity = fb ? 5 * (0.75 + 0.25 * Math.sin(t * 17)) : 5;
        hurt.group.visible = !fb; vio.group.visible = fb; brush.visible = !(fb && t > tb - 0.15);
        hurt.group.position.set(-0.5, 0, 0.3); hurt.update(t, cam.position, 0, { expr: t > w(4, '^lived') ? 'smug' : 'sad', gesture: t > w(4, '^lived') ? 'hips' : 'idle' });
        vio.group.position.set(0.8, 0, -0.5);
        vio.update(t, cam.position, 0, { expr: t > ms ? 'smug' : t > tb ? 'grin' : 'alarmed', gesture: t < g ? 'scared' : t < tb - 0.15 ? 'reach' : [[-1e9, 'holdR', { prop: 'toothbrush' }]] });
      });
    }

    return { root, update(t, camera) { ups.forEach((f) => f(t, camera)); } };
  };
}

// ---------- cameras ----------
const P = (pts) => cameraPath(pts);
const hookP = P([{ t: 0, pos: [2.2, 1.5, 3.6], look: [-3, 2.4, -30] }, { t: 3.6, pos: [1.6, 1.4, 2.6], look: [0.2, 1.25, 0.2] }, { t: 6.2, pos: [1.2, 1.35, 2.0], look: [0.3, 1.25, 0.2] }, { t: 8.9, pos: [2.8, 1.9, 4.4], look: [-6, 4, -45] }]);
export const camHook = (t) => { const c = hookP(t); c.focus = V(t > 2.0 && t < 7.4 ? [0.3, 1.2, 0.2] : [-12, 5, -48]); return c; };
const olA = P([{ t: 8.9, pos: [-22, 7, 30], look: [0, 6, -8] }, { t: 12.0, pos: [-10, 5, 26], look: [2, 5, -8] }, { t: 14.9, pos: [-1, 3.2, 20], look: [5, 3, -5] }]);
const olB = P([{ t: 14.9, pos: [-0.2, 9.5, 62.1], look: [-2.6, 9.15, 59.9] }, { t: 16.4, pos: [0.9, 9.45, 62.0], look: [-0.8, 9.15, 59.9] }]);
export const camOlympic = (t) => { const c = t < 14.9 ? olA(t) : olB(t); c.focus = V(t < 14.9 ? [4, 3, -6] : [-3.2 + Math.max(0, t - 14.9) * 1.6, 9.2, 59.9]); return shake(c, t, w(0, '^rams'), 0.5, 0.25); };
const tiP = P([{ t: 16.4, pos: [-4.2, 2.3, 6.5], look: [-1.6, 1.0, 2.6] }, { t: 18.6, pos: [-2.2, 1.3, 4.4], look: [-2.4, 0.6, 2.8] }, { t: 19.6, pos: [0.0, 1.6, 4.6], look: [0.6, 1.4, 1.1] }, { t: 22.7, pos: [0.9, 1.55, 3.4], look: [1.2, 1.5, 1.0] }]);
export const camTitanic = (t) => { const c = tiP(t); c.focus = V(t < 19.4 ? [-2.6, 0.6, 2.86] : [1.3, 1.5, 1.0]); return c; };
const lbP = P([{ t: 22.7, pos: [4.2, 2.4, 6.4], look: [0, 0.8, 0] }, { t: 25.2, pos: [1.5, 1.3, 2.7], look: [0.3, 0.95, 0.2] }, { t: 27.2, pos: [0.95, 1.15, 1.9], look: [0.35, 0.9, 0.2] }]);
export const camLifeboat = (t) => { const c = lbP(t); c.focus = V([0.3, 0.95, 0.2]); return c; };
const brA = P([{ t: 27.2, pos: [28, 9, 34], look: [0, 5, -10] }, { t: 30.4, pos: [20, 6, 22], look: [3, 5, -10] }, { t: 33.6, pos: [26, 4, 12], look: [17, 3, -7] }]);
const brB = P([{ t: 33.6, pos: [-8, 2.8, 5], look: [-17, 1.5, -7] }, { t: 36.4, pos: [-10, 2.2, 3.2], look: [-18, 1.2, -6.5] }, { t: 37.8, pos: [-12.5, 1.6, 2.4], look: [-16.5, 0.6, -3.8] }]);
const brC = P([{ t: 37.8, pos: [-13.3, 0.72, -1.3], look: [-14.6, 0.42, -3.3] }, { t: 40.2, pos: [-13.6, 0.66, -1.9], look: [-14.6, 0.42, -3.3] }]);
export const camBritannic = (t) => { const c = t < 33.6 ? brA(t) : t < 37.8 ? brB(t) : brC(t); c.focus = V(t < 33.6 ? [10, 4, -10] : t < 37.8 ? [-17, 0.8, -6] : [-14.6, 0.42, -3.3]); return shake(c, t, w(2, '^mine'), 0.6, 0.3); };
const cbA = P([{ t: 40.2, pos: [0.3, 1.6, 2.9], look: [-0.5, 1.35, 0.3] }, { t: 43.0, pos: [-0.1, 1.5, 2.3], look: [-0.5, 1.4, 0.3] }]);
const cbB = P([{ t: 43.0, pos: [-0.7, 1.7, 2.6], look: [0.8, 1.3, -0.5] }, { t: 46.6, pos: [0.2, 1.55, 1.7], look: [1.0, 1.3, -0.8] }, { t: 48.4, pos: [0.85, 1.5, 1.25], look: [0.95, 1.45, -0.5] }, { t: 52.62, pos: [0.9, 1.5, 2.0], look: [0.85, 1.4, -0.5] }]);
export const camCabin = (t) => { const c = t < 43.0 ? cbA(t) : cbB(t); c.focus = V(t < 43.0 ? [-0.5, 1.4, 0.3] : [0.85, 1.4, -0.5]); return c; };
