// Shared procedural models. Everything is built in code: no model or image files.
import * as THREE from 'three';
import { INK, toon, part, ink, paintTexture, signTexture, rng } from './toon.js';

const CREAM = '#f3ead6';

function flat(geo) { const g = geo.toNonIndexed(); g.computeVertexNormals(); return g; }

// ---------- wall with window reveals, sills and a door notch ----------
// windows: [{x, y, w, h}] (x from wall centre, y from bottom). door: {x, w, h}
export function wall({ w, h, t = 0.3, windows = [], door = null, base = '#a3392d', texKind = 'planks', seed = 1, trim = CREAM, interior = '#3d2626' }) {
  const g = new THREE.Group();
  const s = new THREE.Shape();
  s.moveTo(-w / 2, 0);
  if (door) { s.lineTo(door.x - door.w / 2, 0); s.lineTo(door.x - door.w / 2, door.h); s.lineTo(door.x + door.w / 2, door.h); s.lineTo(door.x + door.w / 2, 0); }
  s.lineTo(w / 2, 0); s.lineTo(w / 2, h); s.lineTo(-w / 2, h); s.closePath();
  for (const win of windows) {
    const p = new THREE.Path();
    p.moveTo(win.x - win.w / 2, win.y); p.lineTo(win.x - win.w / 2, win.y + win.h); p.lineTo(win.x + win.w / 2, win.y + win.h); p.lineTo(win.x + win.w / 2, win.y); p.closePath();
    s.holes.push(p);
  }
  const geo = new THREE.ExtrudeGeometry(s, { depth: t, bevelEnabled: false });
  const tex = paintTexture({ base, kind: texKind, seed, repeat: [1 / 3.2, 1 / 3.2] });
  g.add(part(geo, toon('#ffffff', tex), [0, 0, 0], { outline: 0.03 }));

  const trimMat = toon(trim);
  const dark = new THREE.MeshBasicMaterial({ color: interior, fog: true });
  const frameT = 0.09;
  const openings = windows.map((wi) => ({ ...wi, isDoor: false }));
  if (door) openings.push({ x: door.x, y: 0, w: door.w, h: door.h, isDoor: true });
  for (const o of openings) {
    // frame (reveal) on the outer face
    const fz = t + 0.04;
    g.add(part(new THREE.BoxGeometry(o.w + frameT * 2, frameT, 0.1), trimMat, [o.x, o.y + o.h + frameT / 2, fz], { outline: 0.012 }));
    g.add(part(new THREE.BoxGeometry(frameT, o.h, 0.1), trimMat, [o.x - o.w / 2 - frameT / 2, o.y + o.h / 2, fz], { outline: 0.012 }));
    g.add(part(new THREE.BoxGeometry(frameT, o.h, 0.1), trimMat, [o.x + o.w / 2 + frameT / 2, o.y + o.h / 2, fz], { outline: 0.012 }));
    if (!o.isDoor) {
      g.add(part(new THREE.BoxGeometry(o.w + 0.3, 0.1, 0.26), trimMat, [o.x, o.y - 0.05, t + 0.1], { outline: 0.012 })); // sill
      g.add(part(new THREE.BoxGeometry(0.05, o.h, 0.05), trimMat, [o.x, o.y + o.h / 2, t * 0.5], { outline: 0, edges: false })); // mullion
      g.add(part(new THREE.BoxGeometry(o.w, 0.05, 0.05), trimMat, [o.x, o.y + o.h * 0.55, t * 0.5], { outline: 0, edges: false }));
    }
    // interior backdrop so openings are never empty holes
    const bd = new THREE.Mesh(new THREE.PlaneGeometry(o.w + 0.4, o.h + 0.4), dark);
    bd.position.set(o.x, o.y + o.h / 2, -0.25); g.add(bd);
    if (o.isDoor) { // door panels
      const doorMat = toon('#7a3b2a', paintTexture({ base: '#7a3b2a', kind: 'planks', seed: seed + 9, repeat: [0.6, 0.6] }));
      const d = part(new THREE.BoxGeometry(o.w - 0.06, o.h - 0.04, 0.08), doorMat, [o.x, o.h / 2, t * 0.4], { outline: 0.012 });
      g.add(d);
      for (const yy of [0.28, 0.68]) g.add(part(new THREE.BoxGeometry(o.w * 0.34, o.h * 0.26, 0.04), doorMat, [o.x - o.w * 0.22, o.h * yy, t * 0.4 + 0.06], { outline: 0.008, edges: true }));
      for (const yy of [0.28, 0.68]) g.add(part(new THREE.BoxGeometry(o.w * 0.34, o.h * 0.26, 0.04), doorMat, [o.x + o.w * 0.22, o.h * yy, t * 0.4 + 0.06], { outline: 0.008, edges: true }));
    }
  }
  return g;
}

// ---------- Kiruna-style red wooden church ----------
export function church() {
  const g = new THREE.Group();
  const W = 15, H = 4.2, T = 0.32, red = '#a8352b';
  const win = (n, w) => Array.from({ length: n }, (_, i) => ({ x: -w / 2 + (w / (n + 1)) * (i + 1), y: 1.3, w: 0.95, h: 1.9 }));
  const front = wall({ w: W, h: H, t: T, windows: [{ x: -4.6, y: 1.3, w: 0.95, h: 1.9 }, { x: 4.6, y: 1.3, w: 0.95, h: 1.9 }], base: red, seed: 11 });
  front.position.set(0, 0, W / 2 - T); g.add(front);
  const back = wall({ w: W, h: H, t: T, windows: win(3, W), base: red, seed: 12 }); back.rotation.y = Math.PI; back.position.set(0, 0, -W / 2 + T); g.add(back);
  const left = wall({ w: W - 2 * T, h: H, t: T, windows: win(3, W), base: red, seed: 13 }); left.rotation.y = -Math.PI / 2; left.position.set(-W / 2 + T, 0, 0); g.add(left);
  const right = wall({ w: W - 2 * T, h: H, t: T, windows: win(3, W), base: red, seed: 14 }); right.rotation.y = Math.PI / 2; right.position.set(W / 2 - T, 0, 0); g.add(right);
  // dark inside so nothing shows through openings
  const inside = new THREE.Mesh(new THREE.BoxGeometry(W - 1.2, H, W - 1.2), new THREE.MeshBasicMaterial({ color: '#3d2626', side: THREE.BackSide }));
  inside.position.y = H / 2; g.add(inside);
  // white corner boards and a base skirt
  const trim = toon(CREAM);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(part(new THREE.BoxGeometry(0.34, H, 0.34), trim, [sx * (W / 2 - 0.1), H / 2, sz * (W / 2 - 0.1)], { outline: 0.02 }));
  g.add(part(new THREE.BoxGeometry(W + 0.3, 0.35, W + 0.3), toon('#6b3a2c'), [0, 0.17, 0], { outline: 0.02 }));
  g.add(part(new THREE.BoxGeometry(W + 0.5, 0.22, W + 0.5), trim, [0, H + 0.05, 0], { outline: 0.02 }));

  // big steep pyramid roof with shingles
  const roofH = 10.5;
  const roofGeo = flat(new THREE.ConeGeometry(W * 0.5 * Math.SQRT2 + 0.9, roofH, 4, 1));
  roofGeo.rotateY(Math.PI / 4);
  const roofTex = paintTexture({ base: '#6f2a23', kind: 'shingles', seed: 21, repeat: [0.35, 0.35] });
  g.add(part(roofGeo, toon('#ffffff', roofTex), [0, H + roofH / 2, 0], { outline: 0.05 }));
  // dormer-like lantern with louvres, cap and cross
  const lantern = new THREE.Group(); lantern.position.y = H + roofH - 1.9;
  lantern.add(part(new THREE.BoxGeometry(2.0, 2.8, 2.0), toon('#ffffff', paintTexture({ base: red, kind: 'planks', seed: 31, repeat: [0.5, 0.5] })), [0, 1.4, 0], { outline: 0.03 }));
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2; const louvre = part(new THREE.BoxGeometry(0.7, 1.3, 0.08), toon('#3a2422'), [Math.sin(a) * 1.02, 1.6, Math.cos(a) * 1.02], { rot: [0, a, 0], outline: 0.015 });
    lantern.add(louvre);
    const fr = part(new THREE.BoxGeometry(0.9, 0.1, 0.1), trim, [Math.sin(a) * 1.04, 2.3, Math.cos(a) * 1.04], { rot: [0, a, 0], outline: 0.01 }); lantern.add(fr);
  }
  const capGeo = flat(new THREE.ConeGeometry(1.75, 2.6, 4, 1)); capGeo.rotateY(Math.PI / 4);
  lantern.add(part(capGeo, toon('#ffffff', roofTex), [0, 2.8 + 1.3, 0], { outline: 0.03 }));
  lantern.add(part(new THREE.BoxGeometry(0.12, 1.0, 0.12), toon('#d9b45a'), [0, 5.9, 0], { outline: 0.015 }));
  lantern.add(part(new THREE.BoxGeometry(0.55, 0.12, 0.12), toon('#d9b45a'), [0, 6.05, 0], { outline: 0.015 }));
  g.add(lantern);

  // front porch with its own gable roof and a panelled door
  const porch = new THREE.Group(); porch.position.set(0, 0, W / 2);
  const pw = 3.6, ph = 3.1, pd = 2.4;
  const pf = wall({ w: pw, h: ph, t: 0.25, door: { x: 0, w: 1.5, h: 2.35 }, base: red, seed: 41 }); pf.position.z = pd - 0.25; porch.add(pf);
  for (const sx of [-1, 1]) { const sw = wall({ w: pd - 0.25, h: ph, t: 0.25, base: red, seed: 42 + sx }); sw.rotation.y = sx * Math.PI / 2; sw.position.set(sx * (pw / 2 - 0.25), 0, (pd - 0.25) / 2); porch.add(sw); }
  const gable = new THREE.Shape(); gable.moveTo(-pw / 2 - 0.35, 0); gable.lineTo(pw / 2 + 0.35, 0); gable.lineTo(0, 1.9); gable.closePath();
  const gGeo = new THREE.ExtrudeGeometry(gable, { depth: pd + 0.5, bevelEnabled: false });
  porch.add(part(gGeo, toon('#ffffff', roofTex), [0, ph, -0.25], { outline: 0.03 }));
  const gFace = new THREE.Shape(); gFace.moveTo(-pw / 2, 0); gFace.lineTo(pw / 2, 0); gFace.lineTo(0, 1.55); gFace.closePath();
  porch.add(part(new THREE.ExtrudeGeometry(gFace, { depth: 0.1, bevelEnabled: false }), toon(CREAM), [0, ph + 0.05, pd + 0.2], { outline: 0.015 }));
  // "1912" date plaque on the porch gable (used later in shot 6)
  const plaque = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.45), new THREE.MeshBasicMaterial({ map: signTexture(['1912'], { w: 512, h: 210, sizes: [150] }), fog: true }));
  plaque.position.set(0, ph + 0.55, pd + 0.32); porch.add(plaque);
  g.add(porch);
  return g;
}

// ---------- self-propelled transporter: deck, yellow skirts, rows of wheels, steel beams ----------
export function transporter({ beams = true, label = '224 WHEELS' } = {}) {
  const g = new THREE.Group();
  const L = 19.5, D = 16.5, deckY = 1.15;
  g.add(part(new THREE.BoxGeometry(L, 0.55, D), toon('#ffffff', paintTexture({ base: '#4c5056', kind: 'metal', seed: 51 })), [0, deckY, 0], { outline: 0.03 }));
  const skirtTex = paintTexture({ base: '#e1ad35', kind: 'plain', seed: 52, repeat: [1, 1] });
  const hz = paintTexture({ base: '#e1ad35', kind: 'hazard', w: 1024, h: 64, seed: 53, repeat: [6, 1], wear: 0.3 });
  for (const sz of [-1, 1]) {
    g.add(part(new THREE.BoxGeometry(L, 0.45, 0.16), toon('#ffffff', skirtTex), [0, deckY + 0.05, sz * (D / 2 + 0.08)], { outline: 0.02 }));
    const band = new THREE.Mesh(new THREE.PlaneGeometry(L, 0.2), toon('#ffffff', hz)); band.position.set(0, deckY - 0.08, sz * (D / 2 + 0.17)); if (sz < 0) band.rotation.y = Math.PI; g.add(band);
  }
  // wheels: 14 axle lines, pairs on four rows; returned so they can turn
  const wheels = [];
  const wheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.3, 18); wheelGeo.rotateX(Math.PI / 2);
  const tyre = toon('#2b2527'), hubMat = toon('#9aa0a6');
  const hubGeo = new THREE.CylinderGeometry(0.17, 0.17, 0.32, 10); hubGeo.rotateX(Math.PI / 2);
  for (let i = 0; i < 14; i++) for (const z of [-7.4, -6.95, -2.6, -2.15, 2.15, 2.6, 6.95, 7.4]) {
    const wg = new THREE.Group(); wg.position.set(-L / 2 + 0.9 + i * ((L - 1.8) / 13), 0.42, z);
    wg.add(part(wheelGeo, tyre, [0, 0, 0], { outline: 0.02, edges: false }));
    wg.add(part(hubGeo, hubMat, [0, 0, 0], { outline: 0, edges: false }));
    const spoke = part(new THREE.BoxGeometry(0.3, 0.05, 0.33), toon('#5b5f64'), [0, 0, 0], { outline: 0, edges: false }); wg.add(spoke);
    wheels.push(wg); g.add(wg);
    if (z === 7.4 || z === -7.4) { // suspension leg
      g.add(part(new THREE.BoxGeometry(0.22, 0.5, 0.9), toon('#e1ad35'), [wg.position.x, 0.75, Math.sign(z) * 7.15], { outline: 0.012 }));
    }
  }
  if (label) { // painted on the front skirt
    const lt = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 0.42), new THREE.MeshBasicMaterial({ map: signTexture([label], { w: 1024, h: 127, bg: '#e1ad35', fg: INK, border: '#e1ad35', sizes: [84] }), fog: true }));
    lt.position.set(0, deckY + 0.05, D / 2 + 0.17); g.add(lt);
  }
  const bm = beamSet(D); bm.position.y = deckY + 0.55; if (beams) g.add(bm);
  return { group: g, wheels, topY: deckY + 0.55 + 0.66, beams: bm };
}

// ---------- simple Swedish wooden house (extruded facade + gable roof) ----------
export function house({ w = 8, h = 6, d = 7, color = '#e2b955', roof = '#3e3a3d', seed = 1 }) {
  const g = new THREE.Group();
  const wins = [{ x: -w * 0.28, y: 1.2, w: 1.0, h: 1.4 }, { x: w * 0.28, y: 1.2, w: 1.0, h: 1.4 }, { x: -w * 0.28, y: 3.8, w: 1.0, h: 1.3 }, { x: w * 0.28, y: 3.8, w: 1.0, h: 1.3 }, { x: 0, y: 3.8, w: 0.9, h: 1.3 }];
  const f = wall({ w, h, t: 0.3, windows: wins.filter((x) => x.y + x.h < h - 0.4), door: { x: 0, w: 1.2, h: 2.3 }, base: color, seed });
  f.position.z = d / 2 - 0.3; g.add(f);
  const body = part(new THREE.BoxGeometry(w - 0.02, h, d - 0.6), toon('#ffffff', paintTexture({ base: color, kind: 'planks', seed: seed + 3, repeat: [0.3, 0.3] })), [0, h / 2, -0.3], { outline: 0.03 });
  g.add(body);
  const gs = new THREE.Shape(); gs.moveTo(-w / 2 - 0.4, 0); gs.lineTo(w / 2 + 0.4, 0); gs.lineTo(0, w * 0.42); gs.closePath();
  const roofTex = paintTexture({ base: roof, kind: 'shingles', seed: seed + 5, repeat: [0.3, 0.3] });
  g.add(part(new THREE.ExtrudeGeometry(gs, { depth: d + 0.6, bevelEnabled: false }), toon('#ffffff', roofTex), [0, h, -d / 2 - 0.3], { outline: 0.04 }));
  g.add(part(new THREE.BoxGeometry(0.7, 1.8, 0.7), toon('#8d4a3a'), [w * 0.22, h + w * 0.3, -d * 0.2], { outline: 0.02 })); // chimney
  for (const sx of [-1, 1]) g.add(part(new THREE.BoxGeometry(0.22, h, 0.22), toon(CREAM), [sx * (w / 2), h / 2, d / 2 - 0.15], { outline: 0.015 }));
  return g;
}

export function lampPost() {
  const g = new THREE.Group(); const m = toon('#2f4a43');
  g.add(part(new THREE.CylinderGeometry(0.09, 0.13, 5.2, 10), m, [0, 2.6, 0], { outline: 0.02, edges: false }));
  g.add(part(new THREE.BoxGeometry(1.1, 0.09, 0.09), m, [0.5, 5.1, 0], { outline: 0.015 }));
  g.add(part(new THREE.CylinderGeometry(0.12, 0.32, 0.4, 10), m, [1.0, 4.95, 0], { outline: 0.015, edges: false }));
  return g;
}

export function cone() {
  const g = new THREE.Group();
  g.add(part(new THREE.BoxGeometry(0.5, 0.06, 0.5), toon('#e0662c'), [0, 0.03, 0], { outline: 0.012 }));
  g.add(part(new THREE.ConeGeometry(0.2, 0.72, 14), toon('#e8702f'), [0, 0.42, 0], { outline: 0.015, edges: false }));
  g.add(part(new THREE.CylinderGeometry(0.115, 0.14, 0.12, 14), toon('#f3ead6'), [0, 0.45, 0], { outline: 0, edges: false }));
  return g;
}

// Sign on two posts; returns the group and the separate "5 KM" plaque so it can pop in on its word.
export function signPost(lines, plaqueText) {
  const g = new THREE.Group(); const wood = toon('#5b3a2a');
  for (const x of [-1.15, 1.15]) g.add(part(new THREE.BoxGeometry(0.14, 3.0, 0.14), wood, [x, 1.5, 0], { outline: 0.015 }));
  const board = part(new THREE.BoxGeometry(2.8, 1.05, 0.08), toon('#f4ead2'), [0, 2.45, 0.06], { outline: 0.02 });
  const face = new THREE.Mesh(new THREE.PlaneGeometry(2.7, 0.98), new THREE.MeshBasicMaterial({ map: signTexture(lines, { w: 1024, h: 380, sizes: [112] }), fog: true }));
  face.position.set(0, 2.45, 0.105); g.add(board); g.add(face);
  const plaque = new THREE.Group(); plaque.position.set(0, 1.45, 0.08);
  plaque.add(part(new THREE.BoxGeometry(1.7, 0.78, 0.07), toon('#c9452f'), [0, 0, 0], { outline: 0.02 }));
  const pf = new THREE.Mesh(new THREE.PlaneGeometry(1.62, 0.7), new THREE.MeshBasicMaterial({ map: signTexture([plaqueText], { w: 760, h: 330, bg: '#c9452f', fg: '#f4ead2', border: '#f4ead2', sizes: [210] }), fog: true }));
  pf.position.z = 0.04; plaque.add(pf); g.add(plaque);
  return { group: g, plaque };
}

// ---------- ground, road, sky, distant mine mountain ----------
export function ground() {
  const g = new THREE.Group();
  const grass = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), toon('#ffffff', paintTexture({ base: '#86a05a', kind: 'grass', seed: 61, repeat: [120, 120] })));
  grass.rotation.x = -Math.PI / 2; grass.receiveShadow = true; g.add(grass);
  // road with painted centre dashes
  const c = document.createElement('canvas'); c.width = 1024; c.height = 256; const x = c.getContext('2d'); const r = rng(62);
  x.fillStyle = '#5f5d60'; x.fillRect(0, 0, 1024, 256);
  for (let i = 0; i < 3000; i++) { x.fillStyle = r() > 0.5 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'; x.fillRect(r() * 1024, r() * 256, 3, 3); }
  for (let i = 0; i < 9; i++) { x.fillStyle = 'rgba(53,31,34,0.12)'; x.beginPath(); x.ellipse(r() * 1024, r() * 256, 30 + r() * 60, 10 + r() * 20, 0, 0, Math.PI * 2); x.fill(); }
  x.fillStyle = '#efe6cf'; for (let i = 0; i < 4; i++) x.fillRect(i * 256 + 40, 124, 150, 9);
  const rt = new THREE.CanvasTexture(c); rt.colorSpace = THREE.SRGBColorSpace; rt.wrapS = rt.wrapT = THREE.RepeatWrapping; rt.repeat.set(24, 1); rt.anisotropy = 8;
  const road = new THREE.Mesh(new THREE.PlaneGeometry(300, 20), toon('#ffffff', rt)); road.rotation.x = -Math.PI / 2; road.position.y = 0.012; road.receiveShadow = true; g.add(road);
  const kerbMat = toon('#ffffff', paintTexture({ base: '#b8ad98', kind: 'asphalt', seed: 63, repeat: [60, 1] }));
  for (const sz of [-1, 1]) {
    g.add(part(new THREE.BoxGeometry(300, 0.14, 3.2), kerbMat, [0, 0.07, sz * 11.6], { outline: 0.012, edges: false }));
    g.add(part(new THREE.BoxGeometry(300, 0.16, 0.22), toon('#d8d0bf'), [0, 0.08, sz * 10.05], { outline: 0.012, edges: false }));
  }
  return g;
}

export function sky() {
  const geo = new THREE.SphereGeometry(520, 32, 16);
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new THREE.Color('#7fa7cf') }, mid: { value: new THREE.Color('#c9dbe6') }, bottom: { value: new THREE.Color('#efe4cc') } },
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
    fragmentShader: 'uniform vec3 top; uniform vec3 mid; uniform vec3 bottom; varying vec3 vP; void main(){ float h = clamp(vP.y,0.0,1.0); vec3 c = mix(bottom, mid, smoothstep(0.0,0.12,h)); c = mix(c, top, smoothstep(0.12,0.6,h)); gl_FragColor = vec4(c,1.0);\n#include <colorspace_fragment>\n}',
  });
  const m = new THREE.Mesh(geo, mat); m.renderOrder = -1; return m;
}

export function mineMountain() {
  const g = new THREE.Group(); const r = rng(71);
  const geo = new THREE.ConeGeometry(170, 62, 14, 4); const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const y = p.getY(i); if (y > 30) p.setY(i, 30 + (y - 30) * 0.15); p.setX(i, p.getX(i) * (0.9 + r() * 0.2)); p.setZ(i, p.getZ(i) * (0.9 + r() * 0.2)); }
  const fg = flat(geo);
  g.add(part(fg, toon('#8e8ea3'), [0, 31, 0], { outline: 0, edges: false, cast: false }));
  // headframe tower and sheds on top
  const m = toon('#6e6a7a');
  g.add(part(new THREE.BoxGeometry(9, 26, 9), m, [10, 48 + 13, 0], { outline: 0, edges: false, cast: false }));
  g.add(part(new THREE.BoxGeometry(22, 8, 12), m, [-8, 40, 4], { outline: 0, edges: false, cast: false }));
  return g;
}


// four steel I-beams (go under the church, sticking out of both sides)
export function beamSet(D = 16.5) {
  const g = new THREE.Group(); const beamMat = toon('#d97c2b');
  for (const x of [-6, -2, 2, 6]) {
    const bg = new THREE.Group(); bg.position.set(x, 0, 0);
    bg.add(part(new THREE.BoxGeometry(0.55, 0.08, D + 1.6), beamMat, [0, 0.04, 0], { outline: 0.012 }));
    bg.add(part(new THREE.BoxGeometry(0.12, 0.5, D + 1.6), beamMat, [0, 0.33, 0], { outline: 0.012 }));
    bg.add(part(new THREE.BoxGeometry(0.55, 0.08, D + 1.6), beamMat, [0, 0.62, 0], { outline: 0.012 }));
    g.add(bg);
  }
  return g;
}

// banner on two poles
export function banner(lines, { w = 6, h = 1.5, poleH = 4.4, bg = '#c9452f', fg = '#f4ead2', sizes } = {}) {
  const g = new THREE.Group(); const pm = toon('#5b3a2a');
  for (const x of [-w / 2 - 0.1, w / 2 + 0.1]) { g.add(part(new THREE.CylinderGeometry(0.08, 0.1, poleH, 10), pm, [x, poleH / 2, 0], { outline: 0.015, edges: false })); g.add(part(new THREE.SphereGeometry(0.15, 10, 8), toon('#e1ad35'), [x, poleH + 0.1, 0], { outline: 0.012, edges: false })); }
  const cloth = new THREE.Mesh(new THREE.PlaneGeometry(w, h, 12, 1), toon('#ffffff', signTexture(lines, { w: 1400, h: Math.round(1400 * h / w), bg, fg, border: fg, sizes }), { side: THREE.DoubleSide }));
  const p = cloth.geometry.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin((p.getX(i) / w + 0.5) * Math.PI) * 0.12);
  cloth.geometry.computeVertexNormals(); cloth.position.y = poleH - h / 2 - 0.15; ink(cloth, 0.012, { edges: false }); g.add(cloth);
  return g;
}

// painted board on a small stand / easel; returns group and the board (for pop-in)
export function standBoard(lines, { w = 1.8, h = 1.0, bg = '#f4ead2', fg = INK, sizes, legs = 1.0 } = {}) {
  const g = new THREE.Group(); const wood = toon('#5b3a2a');
  for (const x of [-w * 0.35, w * 0.35]) g.add(part(new THREE.BoxGeometry(0.08, legs + h * 0.6, 0.08), wood, [x, (legs + h * 0.6) / 2, -0.05], { outline: 0.012 }));
  const board = new THREE.Group(); board.position.y = legs + h / 2;
  board.add(part(new THREE.BoxGeometry(w, h, 0.06), toon(bg), [0, 0, 0], { outline: 0.018 }));
  const face = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.96, h * 0.94), new THREE.MeshBasicMaterial({ map: signTexture(lines, { w: 1024, h: Math.round(1024 * h / w), bg, fg, border: fg, sizes }), fog: true }));
  face.position.z = 0.035; board.add(face); g.add(board);
  return { group: g, board };
}

// modern block for the new town centre: flat roof, big windows
export function modernBlock({ w = 12, h = 10, d = 10, color = '#d9cfbd', accent = '#3f6f8f', seed = 1 }) {
  const g = new THREE.Group(); const r = rng(seed);
  g.add(part(new THREE.BoxGeometry(w, h, d), toon('#ffffff', paintTexture({ base: color, kind: 'plain', seed, repeat: [0.2, 0.2], wear: 0.5 })), [0, h / 2, 0], { outline: 0.04 }));
  const glass = toon('#7fa1b8'), fr = toon(accent);
  const cols = Math.max(2, Math.floor(w / 2.6)), rows = Math.max(2, Math.floor(h / 3.2));
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
    const x = -w / 2 + (w / cols) * (i + 0.5), y = 1.6 + j * ((h - 2) / rows);
    g.add(part(new THREE.BoxGeometry(w / cols - 0.7, (h - 2) / rows - 0.8, 0.1), glass, [x, y + 0.9, d / 2 + 0.03], { outline: 0.012 }));
  }
  g.add(part(new THREE.BoxGeometry(w + 0.4, 0.4, d + 0.4), fr, [0, h + 0.2, 0], { outline: 0.02 }));
  return g;
}

// mine headframe: lattice tower with a wheel on top, and a dated board
export function headframe(boardLines) {
  const g = new THREE.Group(); const m = toon('#6b5a52');
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(part(new THREE.BoxGeometry(0.3, 16, 0.3), m, [sx * 1.6, 8, sz * 1.6], { rot: [sz * 0.06, 0, -sx * 0.06], outline: 0.02 }));
  for (let y = 2; y < 16; y += 3) for (const [w, d, z, x] of [[3.4, 0.18, 1.6, 0], [3.4, 0.18, -1.6, 0], [0.18, 3.4, 0, 1.6], [0.18, 3.4, 0, -1.6]]) g.add(part(new THREE.BoxGeometry(w * (1 - y / 40), 0.18, d * (1 - y / 40)), m, [x * (1 - y / 40), y, z * (1 - y / 40)], { outline: 0.012 }));
  const wheel = part(new THREE.TorusGeometry(1.3, 0.12, 8, 24), toon('#3a3236'), [0, 16.6, 0], { outline: 0.015, edges: false }); g.add(wheel);
  g.add(part(new THREE.BoxGeometry(2.4, 0.2, 0.2), toon('#3a3236'), [0, 16.6, 0], { outline: 0.01 }));
  g.add(part(new THREE.BoxGeometry(5, 3.2, 4), toon('#ffffff', paintTexture({ base: '#8d4a3a', kind: 'planks', seed: 81, repeat: [0.4, 0.4] })), [-3.6, 1.6, 0], { outline: 0.03 }));
  const sb = standBoard(boardLines, { w: 2.6, h: 1.2, legs: 0.9, sizes: [150] }); sb.group.position.set(3.0, 0, 2.2); g.add(sb.group);
  return { group: g, wheel, board: sb.board };
}

// hydraulic jack (extends with s = 0..1)
export function jack() {
  const g = new THREE.Group();
  g.add(part(new THREE.BoxGeometry(0.7, 0.4, 0.7), toon('#e1ad35'), [0, 0.2, 0], { outline: 0.015 }));
  const rod = part(new THREE.CylinderGeometry(0.16, 0.16, 1, 12), toon('#c0c4c8'), [0, 0.9, 0], { outline: 0.012, edges: false }); g.add(rod);
  return { group: g, set(h) { rod.scale.y = Math.max(0.05, h); rod.position.y = 0.4 + h / 2; } };
}

// timber crib stack
export function crib(n = 4) {
  const g = new THREE.Group(); const w = toon('#9a6b45');
  for (let i = 0; i < n; i++) for (const o of [-0.35, 0.35]) g.add(part(new THREE.BoxGeometry(i % 2 ? 0.25 : 1.2, 0.25, i % 2 ? 1.2 : 0.25), w, [i % 2 ? o : 0, 0.125 + i * 0.25, i % 2 ? 0 : o], { outline: 0.01 }));
  return g;
}
