// Inside the watch room under the lantern: desk + radio, stove, shelves, ladder to the lantern, the lever console
// in the middle (you stand behind it and grip it), the window onto the night sea.
import * as THREE from 'three';
import { toon, part, paintTexture, rng } from '../lib/toon.js';
import { makePerson, localToCanvas } from '../lib/char.js';
import { addLights } from '../Stage.jsx';
import { cameraPath } from '../lib/camera.js';
import { w } from '../times.js';
import { ramp, smooth, glow, sky, sea, beam, YOU, card, patternTex, crate, barrel, rope, bucket, coastline, glitterPath } from './common.js';

const WIN = { x0: -1.3, x1: 1.3, y0: 1.1, y1: 2.9, z: -3 };
const RADIO = [-2.6, 1.15, -2.4];
// lever console: pivot at the top front, arm swings toward the camera (off) or away (on)
export const CONSOLE = [1.3, 0, -0.7];
const PIVOT = [CONSOLE[0], 0.86, CONSOLE[2] + 0.3], ARM = 0.52, ON_A = -0.55, OFF_A = 1.05;
const YOU_AT = [CONSOLE[0], 0, CONSOLE[2] - 0.42];
const T_FLIP = 24.45, T_SLAM = 32.75;
const handleAt = (a) => new THREE.Vector3(PIVOT[0], PIVOT[1] + ARM * Math.cos(a), PIVOT[2] + ARM * Math.sin(a));

export function makeRoom(id) {
  return function build(scene) {
    addLights(scene, { center: [0, 0, 0], key: [-30, 40, -60], keyColor: '#8fa6cf', keyI: 0.3, hemiI: 0.42, hemi: ['#4a5a7a', '#2a1a14'], size: 12, fog: ['#0b1220', 30, 260] });
    const root = new THREE.Group(); const r = rng(51);
    const wallMat = toon('#ffffff', paintTexture({ base: '#8f6446', kind: 'planks', seed: 21, repeat: [3, 1] }));
    const floorMat = toon('#ffffff', paintTexture({ base: '#5e412e', kind: 'planks', seed: 22, repeat: [4, 4] }));
    const beamMat = toon('#4a3326');
    const H = 3.6;
    const floor = part(new THREE.BoxGeometry(8.4, 0.2, 9.4), floorMat, [0, -0.1, 1.5], { outline: 0, edges: false }); root.add(floor);
    root.add(part(new THREE.BoxGeometry(8.4, 0.2, 9.4), toon('#3a281e'), [0, H + 0.1, 1.5], { outline: 0, edges: false }));
    for (const x of [-3, -1.5, 1.5, 3]) root.add(part(new THREE.BoxGeometry(0.25, 0.3, 9.4), beamMat, [x, H - 0.15, 1.5], { outline: 0.02 }));
    for (const sx of [-1, 1]) root.add(part(new THREE.BoxGeometry(0.2, H, 9.4), wallMat, [sx * 4.1, H / 2, 1.5], { outline: 0, edges: false }));
    root.add(part(new THREE.BoxGeometry(8.4, H, 0.2), wallMat, [0, H / 2, 6.2], { outline: 0, edges: false }));
    for (const [x, z] of [[-3.95, -2.9], [3.95, -2.9], [-3.95, 2], [3.95, 2]]) root.add(part(new THREE.BoxGeometry(0.25, H, 0.25), beamMat, [x, H / 2, z], { outline: 0.02 }));
    // back wall with the window
    const bz = WIN.z - 0.1;
    root.add(part(new THREE.BoxGeometry(4.1 + WIN.x0, H, 0.2), wallMat, [(-4.2 + WIN.x0) / 2, H / 2, bz], { outline: 0.02, edges: false }));
    root.add(part(new THREE.BoxGeometry(4.1 - WIN.x1, H, 0.2), wallMat, [(4.2 + WIN.x1) / 2, H / 2, bz], { outline: 0.02, edges: false }));
    root.add(part(new THREE.BoxGeometry(WIN.x1 - WIN.x0, WIN.y0, 0.2), wallMat, [0, WIN.y0 / 2, bz], { outline: 0.02, edges: false }));
    root.add(part(new THREE.BoxGeometry(WIN.x1 - WIN.x0, H - WIN.y1, 0.2), wallMat, [0, (H + WIN.y1) / 2, bz], { outline: 0.02, edges: false }));
    const frame = toon('#e8dcc4');
    for (const x of [WIN.x0, WIN.x1]) root.add(part(new THREE.BoxGeometry(0.12, WIN.y1 - WIN.y0, 0.16), frame, [x, (WIN.y0 + WIN.y1) / 2, WIN.z], { outline: 0.012, edges: false }));
    for (const y of [WIN.y0, WIN.y1, (WIN.y0 + WIN.y1) / 2]) root.add(part(new THREE.BoxGeometry(WIN.x1 - WIN.x0, 0.08, 0.14), frame, [0, y, WIN.z], { outline: 0.012, edges: false }));
    root.add(part(new THREE.BoxGeometry(WIN.x1 - WIN.x0 + 0.4, 0.1, 0.45), frame, [0, WIN.y0 - 0.05, WIN.z + 0.15], { outline: 0.015 }));
    // rain running down the glass
    const drops = patternTex((g, W, Hh) => { const q = rng(8); for (let i = 0; i < 90; i++) { const x = q() * W, y = q() * Hh, l = 10 + q() * 40; g.strokeStyle = `rgba(200,220,255,${0.15 + q() * 0.3})`; g.lineWidth = 1.5 + q() * 2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 1, y + l); g.stroke(); } }, 256, 256, [1, 1]);
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(WIN.x1 - WIN.x0, WIN.y1 - WIN.y0), new THREE.MeshBasicMaterial({ map: drops, transparent: true, depthWrite: false, fog: false })); glass.position.set(0, (WIN.y0 + WIN.y1) / 2, WIN.z - 0.02); root.add(glass);
    // outside, far below: the night sea
    const out = new THREE.Group(); out.position.y = -18; root.add(out);
    out.add(sky('night')); const S = sea('night'); out.add(S.mesh); out.add(glitterPath('#fff1c4', [-150, -420], 0.5)); out.add(coastline(-260, '#141d30'));
    const B = beam(); B.pivot.position.set(0, 22.5, 0); out.add(B.pivot);
    const eyes = [];
    for (const s of [-1, 1]) {
      const e = new THREE.Mesh(new THREE.SphereGeometry(1.0, 16, 10), glow('#fff3b0')); e.position.set(s * 1.9, 3.2, -34); e.scale.set(1, 0.05, 0.5); out.add(e); eyes.push(e);
      const halo = new THREE.Mesh(new THREE.CircleGeometry(2.6, 24), glow('#ffe9a0', 0.18)); halo.position.set(0, 0, 0.6); e.add(halo);
      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.34, 10, 8), glow('#1a0d0f')); pupil.position.set(0, 0, 0.5); e.add(pupil);
    }
    // desk, radio, oil lamp, papers
    const wood = toon('#ffffff', paintTexture({ base: '#6b4a32', kind: 'planks', seed: 23 }));
    root.add(part(new THREE.BoxGeometry(2.2, 0.12, 1.2), wood, [-2.7, 0.9, -2.3], { outline: 0.02 }));
    for (const [x, z] of [[-3.7, -2.8], [-1.7, -2.8], [-3.7, -1.8], [-1.7, -1.8]]) root.add(part(new THREE.BoxGeometry(0.1, 0.9, 0.1), wood, [x, 0.45, z], { outline: 0.012, edges: false }));
    for (let i = 0; i < 3; i++) root.add(part(new THREE.BoxGeometry(0.42, 0.01, 0.3), toon('#f4ead2'), [-2.0 + i * 0.05, 0.97 + i * 0.01, -2.0 - i * 0.04], { rot: [0, 0.2 * i, 0], outline: 0.006, edges: false }));
    const radio = new THREE.Group(); radio.position.set(...RADIO); root.add(radio);
    radio.add(part(new THREE.BoxGeometry(0.9, 0.5, 0.42), toon('#3d5a4a'), [0, 0, 0], { outline: 0.018 }));
    radio.add(part(new THREE.BoxGeometry(0.3, 0.3, 0.02), toon('#22302a'), [-0.22, 0, 0.215], { outline: 0.008, edges: false }));
    const dial = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.14), glow('#ffcf7a')); dial.position.set(0.2, 0.08, 0.22); radio.add(dial);
    for (const x of [0.1, 0.3]) radio.add(part(new THREE.CylinderGeometry(0.05, 0.05, 0.05, 10), toon('#e8dcc4'), [x, -0.12, 0.23], { rot: [Math.PI / 2, 0, 0], outline: 0.008, edges: false }));
    radio.add(part(new THREE.CylinderGeometry(0.012, 0.012, 0.8, 6), toon('#2b2b33'), [0.35, 0.55, -0.1], { rot: [0, 0, -0.3], outline: 0.006, edges: false }));
    const radioLight = new THREE.PointLight('#7fe0a0', 0, 3, 1.5); radioLight.position.set(0, 0.2, 0.5); radio.add(radioLight);
    const statics = [];
    for (let i = 0; i < 3; i++) {
      const pts = []; for (let k = 0; k <= 6; k++) pts.push(new THREE.Vector3(k * 0.07, k % 2 ? 0.05 : -0.05, 0));
      const ln = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: '#bff7d4', transparent: true, opacity: 0.9, fog: false, toneMapped: false }));
      ln.position.set(-0.6 - i * 0.05, 0.25 + i * 0.16, 0.25); ln.rotation.z = 0.6 - i * 0.3; radio.add(ln); statics.push(ln);
    }
    const lampG = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 8), glow('#ffcf7a')); lampG.position.set(-3.4, 1.18, -2.1); root.add(lampG);
    root.add(part(new THREE.CylinderGeometry(0.12, 0.16, 0.2, 12), toon('#c9a25a'), [-3.4, 1.0, -2.1], { outline: 0.01, edges: false }));
    // shelves with jars, bottles, books (left wall)
    for (const y of [1.6, 2.3]) {
      root.add(part(new THREE.BoxGeometry(0.4, 0.06, 2.4), wood, [-3.8, y, 0.2], { outline: 0.012 }));
      let z = -0.9; while (z < 1.3) {
        const k = r(); const c = ['#3f6f8f', '#a3392d', '#e1ad35', '#6f8f5a', '#e8dcc4', '#7a5aa0'][Math.floor(r() * 6)];
        if (k < 0.45) { const h = 0.25 + r() * 0.15; root.add(part(new THREE.BoxGeometry(0.22, h, 0.07), toon(c), [-3.78, y + h / 2 + 0.03, z], { outline: 0.008, edges: false })); z += 0.09; }
        else if (k < 0.75) { const h = 0.18 + r() * 0.1; root.add(part(new THREE.CylinderGeometry(0.07, 0.08, h, 10), toon(c), [-3.75, y + h / 2 + 0.03, z + 0.05], { outline: 0.008, edges: false })); z += 0.2; }
        else { root.add(part(new THREE.CylinderGeometry(0.035, 0.06, 0.32, 8), toon('#2f5a3a'), [-3.75, y + 0.19, z + 0.04], { outline: 0.008, edges: false })); z += 0.15; }
      }
    }
    // stove with a kettle and a glowing grate (front-left corner)
    const stove = new THREE.Group(); stove.position.set(-3.2, 0, 3.2); root.add(stove);
    stove.add(part(new THREE.CylinderGeometry(0.45, 0.5, 1.0, 16), toon('#2b2b33'), [0, 0.5, 0], { outline: 0.02 }));
    stove.add(part(new THREE.CylinderGeometry(0.1, 0.1, 2.6, 8), toon('#2b2b33'), [0, 2.3, 0], { outline: 0.012, edges: false }));
    const grate = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 0.18), glow('#ff8a3a')); grate.position.set(0.3, 0.35, 0.36); grate.rotation.y = 0.7; stove.add(grate);
    stove.add(part(new THREE.SphereGeometry(0.18, 12, 8), toon('#7d93a3'), [0, 1.12, 0], { outline: 0.01, edges: false }));
    const stoveL = new THREE.PointLight('#ff8a3a', 6, 5, 1.6); stoveL.position.set(0.4, 0.5, 0.6); stove.add(stoveL);
    // ladder up to the lantern hatch (back-right), light pours down when the lantern is on
    for (const x of [2.7, 3.3]) root.add(part(new THREE.BoxGeometry(0.08, H, 0.08), wood, [x, H / 2, -2.6], { rot: [0.12, 0, 0], outline: 0.01 }));
    for (let i = 0; i < 9; i++) root.add(part(new THREE.CylinderGeometry(0.03, 0.03, 0.6, 6), wood, [3.0, 0.3 + i * 0.38, -2.6 + Math.sin(0.12) * (0.3 + i * 0.38 - H / 2)], { rot: [0, 0, Math.PI / 2], outline: 0.006, edges: false }));
    const hatch = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), glow('#ffd98a')); hatch.rotation.x = Math.PI / 2; hatch.position.set(3.0, H - 0.01, -2.8); root.add(hatch);
    const shaftG = new THREE.CylinderGeometry(0.5, 0.9, H, 16, 1, true);
    const shaft = new THREE.Mesh(shaftG, new THREE.MeshBasicMaterial({ color: '#ffd98a', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false, toneMapped: false })); shaft.position.set(3.0, H / 2, -2.6); root.add(shaft);
    // wall decor: map, clock, the rule note, the night tally, a coat on a hook, a bell
    const map = card(['~ CHART ~', 'ROCKS', 'X'], 1.2, 0.9, { sizes: [130, 110, 160], bg: '#e8d8b0' }); map.rotation.y = -Math.PI / 2; map.position.set(3.99, 2.2, 1.0); root.add(map);
    const clockF = patternTex((g, W) => { g.fillStyle = '#f4ead2'; g.beginPath(); g.arc(W / 2, W / 2, W / 2 - 6, 0, 7); g.fill(); g.strokeStyle = '#351f22'; g.lineWidth = 12; g.stroke(); g.lineWidth = 8; for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; g.beginPath(); g.moveTo(W / 2 + Math.cos(a) * W * 0.36, W / 2 + Math.sin(a) * W * 0.36); g.lineTo(W / 2 + Math.cos(a) * W * 0.42, W / 2 + Math.sin(a) * W * 0.42); g.stroke(); } g.lineWidth = 10; g.beginPath(); g.moveTo(W / 2, W / 2); g.lineTo(W / 2, W * 0.2); g.stroke(); g.beginPath(); g.moveTo(W / 2, W / 2); g.lineTo(W * 0.7, W * 0.56); g.stroke(); }, 256, 256);
    const clock = new THREE.Mesh(new THREE.CircleGeometry(0.28, 24), new THREE.MeshBasicMaterial({ map: clockF, transparent: true })); clock.position.set(2.0, 2.75, WIN.z + 0.01); root.add(clock);
    const note = card(['NEVER', 'TURN ON', 'THE LIGHT'], 0.62, 0.72, { sizes: [190, 150, 150], bg: '#f4ead2' }); note.position.set(CONSOLE[0] + 0.85, 1.75, WIN.z + 0.02); note.rotation.z = -0.05; root.add(note);
    const tally = card(['NIGHT', 'II'], 0.7, 0.6, { sizes: [180, 220], bg: '#2b2b2b', fg: '#f3ead6', border: '#f3ead6' }); tally.position.set(-2.4, 2.35, WIN.z + 0.02); root.add(tally);
    const coat = card(['  '], 0.5, 1.0, { bg: '#e1ad35', fg: '#e1ad35', border: '#351f22' }); coat.rotation.y = Math.PI / 2; coat.position.set(-3.98, 1.6, 2.5); root.add(coat);
    root.add(part(new THREE.CylinderGeometry(0.02, 0.02, 0.15, 6), toon('#2b2b33'), [-3.93, 2.12, 2.5], { rot: [0, 0, Math.PI / 2], outline: 0, edges: false }));
    // floor clutter + rug
    const rug = new THREE.Mesh(new THREE.CircleGeometry(1.4, 40), toon('#ffffff', patternTex((g, W) => { const cs = ['#a3392d', '#e1ad35', '#3f6f8f', '#e8dcc4', '#a3392d']; for (let i = 0; i < 5; i++) { g.fillStyle = cs[i]; g.beginPath(); g.arc(W / 2, W / 2, W / 2 - i * 22, 0, 7); g.fill(); } }, 256, 256))); rug.rotation.x = -Math.PI / 2; rug.position.set(0.2, 0.01, 1.2); rug.receiveShadow = true; root.add(rug);
    const c1 = crate(0.6); c1.position.set(-3.3, 0, 0.9); c1.rotation.y = 0.3; root.add(c1);
    const br = barrel('#6a4a32'); br.position.set(3.4, 0, 3.4); br.scale.setScalar(0.9); root.add(br);
    const rp = rope(0.3); rp.position.set(2.4, 0, 3.6); root.add(rp);
    const bk = bucket(); bk.position.set(-2.2, 0, 3.6); root.add(bk);
    // hanging oil lamp from a ceiling beam, swaying a little
    const hang = new THREE.Group(); hang.position.set(-0.6, H - 0.3, 0.6); root.add(hang);
    hang.add(part(new THREE.CylinderGeometry(0.01, 0.01, 0.8, 4), toon('#2b2b33'), [0, -0.4, 0], { outline: 0, edges: false }));
    hang.add(part(new THREE.CylinderGeometry(0.06, 0.18, 0.16, 12), toon('#2b2b33'), [0, -0.82, 0], { outline: 0.008, edges: false }));
    const hb = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 8), glow('#ffcf7a')); hb.position.y = -0.98; hang.add(hb);
    const hl = new THREE.PointLight('#ffb866', 16, 10, 1.3); hl.position.y = -1.05; hl.castShadow = true; hl.shadow.mapSize.set(1024, 1024); hl.shadow.bias = -0.002; hang.add(hl);
    // the lever console
    const con = new THREE.Group(); con.position.set(...CONSOLE); root.add(con);
    con.add(part(new THREE.BoxGeometry(1.1, 0.82, 0.62), toon('#ffffff', paintTexture({ base: '#4a5262', kind: 'metal', seed: 6 })), [0, 0.41, 0], { outline: 0.02 }));
    con.add(part(new THREE.BoxGeometry(1.2, 0.08, 0.7), toon('#c9a25a'), [0, 0.84, 0], { outline: 0.012 }));
    const gauges = [];
    for (const x of [-0.3, 0.05]) { const gf = new THREE.Mesh(new THREE.CircleGeometry(0.11, 20), new THREE.MeshBasicMaterial({ map: clockF })); gf.position.set(x, 0.55, 0.315); con.add(gf); con.add(part(new THREE.TorusGeometry(0.115, 0.02, 6, 20), toon('#c9a25a'), [x, 0.55, 0.315], { outline: 0, edges: false })); gauges.push(gf); }
    const bulbOn = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), glow('#2a4a2a')); bulbOn.position.set(0.34, 0.62, 0.32); con.add(bulbOn);
    const bulbOff = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), glow('#4a1a1a')); bulbOff.position.set(0.34, 0.46, 0.32); con.add(bulbOff);
    const lbl = card(['LIGHT'], 0.5, 0.17, { sizes: [210] }); lbl.position.set(-0.12, 0.25, 0.315); con.add(lbl);
    con.add(part(new THREE.BoxGeometry(0.3, 0.1, 0.16), toon('#2b2b33'), [0, 0.92, 0.3], { outline: 0.01 }));
    const lever = new THREE.Group(); lever.position.set(PIVOT[0], PIVOT[1], PIVOT[2]); root.add(lever);
    lever.add(part(new THREE.CylinderGeometry(0.03, 0.035, ARM, 8), toon('#c8c8cc'), [0, ARM / 2, 0], { outline: 0.008, edges: false }));
    lever.add(part(new THREE.CylinderGeometry(0.05, 0.05, 0.26, 10), toon('#c9452f'), [0, ARM, 0], { rot: [0, 0, Math.PI / 2], outline: 0.01, edges: false }));
    // sparks on the slam
    const sparks = Array.from({ length: 14 }, (_, i) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 4), glow('#ffe08a')); m.visible = false; root.add(m); return [m, rng(60 + i)]; });
    const wash = new THREE.PointLight('#ffd98a', 0, 12, 1.2); wash.position.set(3.0, H - 0.3, -2.6); root.add(wash);
    const you = makePerson(YOU, { tint: '#fff1e0' }); root.add(you.group);

    return {
      root,
      update(t, camera) {
        S.update(t);
        const on = t > T_FLIP && t < T_SLAM ? 1 : 0;
        wash.intensity = 34 * on; B.set(on, 0.85 + 1.75 * (27.3 - t)); shaft.material.opacity = 0.12 * on; hatch.material.color.set(on ? '#ffe9b0' : '#3a281e');
        bulbOn.material.color.set(on ? '#6dff7a' : '#2a4a2a'); bulbOff.material.color.set(on ? '#4a1a1a' : '#ff4a3a');
        gauges.forEach((gf, i) => { gf.rotation.z = on ? Math.sin(t * 9 + i) * 0.3 - 1 : 0.3; });
        // lever angle
        let up = 0;
        if (id === 'room2') up = smooth(ramp(t, T_FLIP - 0.12, T_FLIP + 0.04));
        if (id === 'room3') up = 1 - smooth(ramp(t, T_SLAM - 0.08, T_SLAM + 0.02));
        const ang = OFF_A + (ON_A - OFF_A) * up; lever.rotation.x = ang;
        sparks.forEach(([m, q], i) => { const d = t - T_SLAM; m.visible = id === 'room3' && d > 0 && d < 0.5; if (m.visible) { const a = q() * 0 + i * 2.4; m.position.set(PIVOT[0] + Math.cos(a) * d * 1.4, PIVOT[1] + 0.1 + d * 1.2 - d * d * 4, PIVOT[2] + Math.sin(a) * d * 0.8 + 0.1); } });
        hang.rotation.z = Math.sin(t * 1.3) * 0.05; hang.rotation.x = Math.sin(t * 0.9) * 0.04;
        // radio crackle
        const crack = (id === 'room1' && t > w(4, 'radio') - 0.4) || (id === 'room4' && t < 45.8);
        const flick = crack ? (Math.sin(t * 53) > -0.2 ? 1 : 0.3) : 0.15;
        dial.material.color.setHSL(0.11, 1, 0.25 + 0.35 * flick); radioLight.intensity = 3 * flick;
        statics.forEach((s, i) => { s.visible = crack && Math.sin(t * 31 + i * 2.1) > 0; s.position.x = -0.6 - i * 0.05 - ((t * 3 + i) % 1) * 0.2; });
        stoveL.intensity = 6 * (0.85 + 0.15 * Math.sin(t * 7) * Math.sin(t * 3.1));
        const open = id === 'room4' ? smooth(ramp(t, w(12, "it's") - 0.05, w(12, "it's") + 0.35)) : 0;
        eyes.forEach((e) => { e.visible = open > 0.01; e.scale.y = 0.05 + 0.95 * open; });
        // YOU
        you.group.visible = id !== 'room4';
        if (id === 'room1') { you.group.position.set(-1.45, 0, -1.25); you.update(t, camera.position, 0, { expr: t > w(4, 'crackles') - 0.1 ? 'alarmed' : 'neutral', gesture: [[-1e9, 'pointL', { angle: 0.35 }], [w(4, 'crackles') - 0.05, 'scared']] }); }
        else {
          // stand behind the console and grip the handle: project the handle onto YOU's plane as seen from the camera
          you.group.position.set(...YOU_AT);
          const h = handleAt(ang), cam = camera.position; const k = (YOU_AT[2] - cam.z) / (h.z - cam.z);
          const px = cam.x + (h.x - cam.x) * k - YOU_AT[0], py = cam.y + (h.y - cam.y) * k;
          const at = localToCanvas(YOU, px, py);
          let ex = 'neutral'; if (id === 'room2' && t > T_FLIP) ex = 'alarmed'; if (id === 'room3') ex = 'scared';
          const grip = id === 'room2' ? (t > 22.0 && t < 23.3 ? 'idle' : 'grip') : 'grip';
          you.update(t, camera.position, 0, { expr: ex, gesture: grip === 'grip' ? [[-1e9, 'grip', { at }]] : 'idle' });
        }
      },
    };
  };
}

const V = (a) => new THREE.Vector3(...a);
const shake = (c, t, t0, d = 0.3, a = 0.04) => { if (t > t0 && t < t0 + d) { const s = (1 - (t - t0) / d) * a; c.pos.x += Math.sin(t * 97) * s; c.pos.y += Math.sin(t * 71 + 2) * s; } return c; };
const CON = [CONSOLE[0], 1.1, CONSOLE[2]];

const r1 = cameraPath([{ t: 16.05, pos: [0.9, 1.75, 3.8], look: [-2.2, 1.25, -2.0] }, { t: 17.3, pos: [-0.1, 1.55, 1.6], look: [-2.3, 1.2, -2.1] }, { t: 18.42, pos: [-0.6, 1.45, 0.7], look: [-2.2, 1.25, -2.0] }]);
export const camRoom1 = (t) => { const c = r1(t); c.focus = V([-2.1, 1.3, -1.9]); return shake(c, t, w(4, 'crackles'), 0.25, 0.02); };

const r2 = cameraPath([
  { t: 22.0, pos: [0.6, 1.6, 2.4], look: [CONSOLE[0], 1.0, CONSOLE[2]] },
  { t: 22.9, pos: [1.0, 1.45, 1.4], look: [CONSOLE[0], 1.05, CONSOLE[2]] },
  { t: 23.6, pos: [0.2, 1.8, 1.2], look: [0, 1.9, -3] },
  { t: 24.2, pos: [1.1, 1.5, 1.5], look: CON },
  { t: 25.0, pos: [1.2, 1.55, 1.25], look: [CONSOLE[0], 1.3, CONSOLE[2]] },
]);
export const camRoom2 = (t) => { const c = r2(t); c.focus = t > 23.0 && t < 24.0 ? V([0, 1.5, -20]) : V(CON); return shake(c, t, T_FLIP, 0.3, 0.03); };

const r3 = cameraPath([{ t: 32.45, pos: [0.7, 1.55, 2.1], look: [CONSOLE[0], 1.05, CONSOLE[2]] }, { t: 33.55, pos: [0.9, 1.45, 1.55], look: [CONSOLE[0], 1.05, CONSOLE[2]] }]);
export const camRoom3 = (t) => { const c = r3(t); c.focus = V(CON); return shake(c, t, T_SLAM, 0.4, 0.06); };

const r4 = cameraPath([
  { t: 43.3, pos: [1.2, 1.5, 3.0], look: [-2.6, 1.2, -2.4] },
  { t: 45.2, pos: [0.2, 1.65, 0.9], look: [-1.0, 1.7, -2.8] },
  { t: 46.5, pos: [0.0, 1.9, -1.5], look: [0, 1.3, -12] },
  { t: 48.16, pos: [0.0, 1.92, -2.1], look: [0, 1.1, -14] },
]);
export const camRoom4 = (t) => { const c = r4(t); c.focus = t < 45.5 ? V(RADIO) : V([0, -15, -34]); return c; };
