// 2D flat people standing in the 3D world. One base design; variants only by palette, hat and glasses.
import * as THREE from 'three';
import { INK, rng } from './toon.js';

const CW = 256, CH = 512, RES = 2;   // logical canvas size; drawn at RES x for 1080p
const TOP = 52, FOOT = 500;          // head top and foot line in canvas px
const PX_H = FOOT - TOP;             // drawn person height in px

// smooth deterministic noise for the hand-drawn ink band
function noise1(seed) { const r = rng(seed); const v = Array.from({ length: 64 }, r); return (x) => { const i = Math.floor(x) & 63, f = x - Math.floor(x), a = v[i], b = v[(i + 1) & 63]; return a + (b - a) * (f * f * (3 - 2 * f)); }; }

function inkPath(g, pts, closed, base, nz, off) {
  const n = pts.length; const m = closed ? n : n - 1;
  g.strokeStyle = INK; g.lineCap = 'round'; g.lineJoin = 'round';
  for (let i = 0; i < m; i++) {
    const a = pts[i], b = pts[(i + 1) % n];
    g.lineWidth = base * (0.7 + 0.6 * nz(off + i * 0.35));
    g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
  }
}
function fillPts(g, pts, color) { g.fillStyle = color; g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.closePath(); g.fill(); }
function circlePts(cx, cy, rx, ry, n = 36, wob = 0, nz = null, off = 0) { const out = []; for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; const k = 1 + (nz ? (nz(off + i * 0.4) - 0.5) * wob : 0); out.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]); } return out; }
function shape(g, pts, color, lw, nz, off) { fillPts(g, pts, color); inkPath(g, pts, true, lw, nz, off); }
// tapered limb from (x,y) with angle a (0 = straight down), length L, widths w0 -> w1
function limbPts(x, y, a, L, w0, w1) {
  const dx = Math.sin(a), dy = Math.cos(a), nx = dy, ny = -dx;
  const ex = x + dx * L, ey = y + dy * L;
  return [[x + nx * w0, y + ny * w0], [ex + nx * w1, ey + ny * w1], [ex - nx * w1, ey - ny * w1], [x - nx * w0, y - ny * w0]];
}

export function drawPerson(g, P, pose) {
  const nz = P.nz; const lw = 6.5;
  g.setTransform(RES, 0, 0, RES, 0, 0); g.clearRect(0, 0, CW, CH);
  const cx = CW / 2, bob = pose.bob || 0;
  const hipY = 352 - bob, shY = 228 - bob, headY = 128 - bob + (pose.nod || 0);
  // legs (behind torso)
  const legL = FOOT - hipY - 8;
  for (const s of [-1, 1]) {
    const a = (s < 0 ? 1 : -1) * (pose.leg || 0);
    const lp = limbPts(cx + s * 20, hipY - 6, a, legL, 11, 7);
    shape(g, lp, P.pants, lw, nz, 3 + s);
    const fx = cx + s * 20 + Math.sin(a) * legL, fy = hipY - 6 + Math.cos(a) * legL;
    shape(g, circlePts(fx + 10 * (s > 0 ? 1 : -0.2), fy + 2, 17, 9, 20, 0.08, nz, 9 + s), P.shoes, lw * 0.9, nz, 10 + s);
  }
  // arms (behind torso on the far side, simple: both behind)
  for (const s of [-1, 1]) {
    const a = pose.hold ? -s * 0.62 : s * 0.2 + (s < 0 ? -1 : 1) * (pose.arm || 0);
    const AL = pose.hold ? 70 : 112;
    const ap = limbPts(cx + s * 34, shY + 16, a, AL, 10, 6);
    shape(g, ap, P.jacket, lw, nz, 20 + s);
    const hx = cx + s * 34 + Math.sin(a) * AL, hy = shY + 16 + Math.cos(a) * AL;
    shape(g, circlePts(hx, hy, 12, 12, 18, 0.1, nz, 30 + s), INK, 2, nz, 31);
  }
  // pear torso, two-tone
  const torso = [];
  for (let i = 0; i <= 20; i++) { const t = i / 20; const y = shY + t * (hipY - shY + 6); const wv = 34 + 26 * Math.sin(Math.min(1, t * 1.15) * Math.PI * 0.62); torso.push([cx + wv, y]); }
  for (let i = 20; i >= 0; i--) { const t = i / 20; const y = shY + t * (hipY - shY + 6); const wv = 34 + 26 * Math.sin(Math.min(1, t * 1.15) * Math.PI * 0.62); torso.push([cx - wv, y]); }
  fillPts(g, torso, P.jacket);
  g.save(); g.beginPath(); torso.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.closePath(); g.clip();
  g.fillStyle = P.jacket2; g.fillRect(0, hipY - 34, CW, 60);       // lower tone
  shape(g, [[cx - 40, hipY - 72], [cx - 14, hipY - 72], [cx - 14, hipY - 48], [cx - 40, hipY - 48]], P.jacket2, 3, nz, 40); // pocket patch
  g.restore();
  inkPath(g, torso, true, lw, nz, 50);
  if (P.outfit === 'sweater') { // knit turtleneck with rib lines
    g.save(); g.beginPath(); torso.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.closePath(); g.clip();
    g.strokeStyle = 'rgba(0,0,0,0.16)'; g.lineWidth = 3; for (let x = cx - 60; x <= cx + 60; x += 14) { g.beginPath(); g.moveTo(x, shY + 20); g.lineTo(x, hipY + 6); g.stroke(); }
    g.restore();
    shape(g, [[cx - 34, shY - 14], [cx + 34, shY - 14], [cx + 38, shY + 14], [cx - 38, shY + 14]], P.jacket2, 4, nz, 60);
  } else {
    // white collar and tie
    shape(g, [[cx - 22, shY - 4], [cx, shY + 16], [cx - 6, shY + 26], [cx - 26, shY + 8]], '#fbf6ea', 3.5, nz, 60);
    shape(g, [[cx + 22, shY - 4], [cx, shY + 16], [cx + 6, shY + 26], [cx + 26, shY + 8]], '#fbf6ea', 3.5, nz, 62);
    shape(g, [[cx, shY + 16], [cx + 7, shY + 30], [cx + 4, shY + 70], [cx, shY + 80], [cx - 4, shY + 70], [cx - 7, shY + 30]], P.tie, 3, nz, 64);
  }
  if (pose.hold) { // control box with antenna, held in both hands
    g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(cx + 22, shY + 62); g.lineTo(cx + 30, shY + 18); g.stroke();
    shape(g, [[cx - 30, shY + 58], [cx + 30, shY + 58], [cx + 30, shY + 100], [cx - 30, shY + 100]], '#e1ad35', 5, nz, 55);
    g.fillStyle = INK; g.fillRect(cx - 20, shY + 68, 16, 10); g.fillStyle = '#c9452f'; g.beginPath(); g.arc(cx + 14, shY + 80, 7, 0, Math.PI * 2); g.fill();
    for (const s2 of [-1, 1]) shape(g, circlePts(cx + s2 * 32, shY + 82, 12, 12, 18, 0.1, nz, 56 + s2), INK, 2, nz, 57);
  }
  // large round pale head
  const hr = 74;
  const head = circlePts(cx, headY, hr, hr * 0.96, 44, 0.04, nz, 70);
  shape(g, head, P.skin, lw, nz, 71);
  drawFace(g, P, pose, cx, headY, hr, nz, lw);
  // hats
  if (P.hat === 'cap') { shape(g, [[cx - 66, headY - 34], [cx - 58, headY - 70], [cx, headY - 84], [cx + 58, headY - 70], [cx + 66, headY - 34]], P.hatColor, lw, nz, 90); shape(g, [[cx + 20, headY - 38], [cx + 96, headY - 30], [cx + 92, headY - 22], [cx + 20, headY - 26]], P.hatColor, lw * 0.8, nz, 92); }
  if (P.hat === 'peaked') {
    shape(g, [[cx - 80, headY - 120], [cx + 80, headY - 120], [cx + 60, headY - 78], [cx - 60, headY - 78]], P.hatColor, lw, nz, 88);
    shape(g, [[cx - 62, headY - 82], [cx + 62, headY - 82], [cx + 64, headY - 64], [cx - 64, headY - 64]], P.hatColor2 || INK, lw * 0.8, nz, 89);
    shape(g, [[cx - 62, headY - 66], [cx + 62, headY - 66], [cx + 44, headY - 50], [cx - 44, headY - 50]], INK, 2, nz, 90);
    shape(g, circlePts(cx, headY - 100, 12, 11, 14, 0.1, nz, 91), P.badge || '#e1ad35', 3.5, nz, 92);
  }
  if (P.hat === 'bowler') { shape(g, circlePts(cx, headY - 62, 52, 34, 30, 0.04, nz, 94).filter((p) => p[1] < headY - 52).concat([[cx + 52, headY - 52], [cx - 52, headY - 52]]), P.hatColor, lw, nz, 95); shape(g, [[cx - 78, headY - 56], [cx + 78, headY - 56], [cx + 74, headY - 44], [cx - 74, headY - 44]], P.hatColor, lw * 0.8, nz, 96); }
  if (P.hat === 'beanie') { shape(g, circlePts(cx, headY - 40, 70, 46, 30, 0.05, nz, 97).filter((p) => p[1] < headY - 30).concat([[cx + 70, headY - 30], [cx - 70, headY - 30]]), P.hatColor, lw, nz, 98); shape(g, [[cx - 72, headY - 40], [cx + 72, headY - 40], [cx + 72, headY - 22], [cx - 72, headY - 22]], P.hatColor2 || P.hatColor, lw * 0.8, nz, 99); }
}

// ---------- faces: the acting happens here ----------
// expr: calm | neutral | alarmed | shout | scared | grin | smug | sad | angry
function drawFace(g, P, pose, cx, headY, hr, nz, lw) {
  const ex = pose.expr || P.expr || 'neutral';
  const talk = pose.talk || 0;
  const old = !!P.old;
  // hair: young = fringe; old = bald dome with fluffy side tufts
  if (P.hair && !old) {
    const fr = [];
    for (let i = 0; i <= 22; i++) { const a = Math.PI + (i / 22) * Math.PI; fr.push([cx + Math.cos(a) * (hr + 3), headY + Math.sin(a) * (hr + 3) * 0.97]); }
    for (let i = 8; i >= 0; i--) { const x = cx - hr + (i / 8) * hr * 2; const y = headY - hr * 0.42 + (i % 2 ? 10 : -2); fr.push([x, y]); }
    shape(g, fr, P.hair, lw * 0.85, nz, 80);
  }
  if (old) {
    for (const s of [-1, 1]) { // tufts over the ears
      shape(g, circlePts(cx + s * (hr - 2), headY - 8, 22, 30, 22, 0.35, nz, 81 + s), P.hair || '#e8e4dc', lw * 0.8, nz, 82 + s);
    }
    g.strokeStyle = 'rgba(53,31,34,0.55)'; g.lineWidth = 3; g.lineCap = 'round';
    for (let i = 0; i < 2; i++) { g.beginPath(); g.arc(cx, headY + 6 - i * 9, 40, 1.36 * Math.PI, 1.64 * Math.PI); g.stroke(); } // forehead lines
    for (const s of [-1, 1]) { g.beginPath(); g.moveTo(cx + s * 44, headY + 2); g.lineTo(cx + s * 52, headY - 2); g.moveTo(cx + s * 44, headY + 8); g.lineTo(cx + s * 53, headY + 9); g.stroke(); } // crow's feet
  }
  const browCol = old ? (P.brows || '#efebe4') : INK, browW = old ? 11 : 5.5;
  const brow = (s, inner, outer, lift = 0) => { // inner/outer: y offsets (negative = up)
    const y0 = headY - 16 - lift;
    if (old) { g.strokeStyle = INK; g.lineWidth = browW + 5; g.lineCap = 'round'; g.beginPath(); g.moveTo(cx + s * 12, y0 + inner); g.lineTo(cx + s * 42, y0 + outer); g.stroke(); }
    g.strokeStyle = browCol; g.lineWidth = browW; g.lineCap = 'round'; g.beginPath(); g.moveTo(cx + s * 12, y0 + inner); g.lineTo(cx + s * 42, y0 + outer); g.stroke();
  };
  const dotEye = (s, r = 7, dy = 0) => { g.fillStyle = INK; g.beginPath(); g.arc(cx + s * 27, headY + 6 + dy, r, 0, Math.PI * 2); g.fill(); };
  const wideEye = (s, r = 14, look = [0, 0]) => {
    g.fillStyle = '#fffdf6'; g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.arc(cx + s * 27, headY + 4, r, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = INK; g.beginPath(); g.arc(cx + s * 27 + look[0], headY + 4 + look[1], r * 0.36, 0, Math.PI * 2); g.fill();
  };
  const arcEye = (s, up = true) => { g.strokeStyle = INK; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); if (up) g.arc(cx + s * 27, headY + 10, 10, 1.15 * Math.PI, 1.85 * Math.PI); else g.arc(cx + s * 27, headY + 2, 10, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke(); };
  const lidEye = (s) => { g.fillStyle = INK; g.beginPath(); g.ellipse(cx + s * 27, headY + 8, 8, 7, 0, 0, Math.PI); g.fill(); g.lineWidth = 4; g.strokeStyle = INK; g.beginPath(); g.moveTo(cx + s * 27 - 11, headY + 7); g.lineTo(cx + s * 27 + 11, headY + 7); g.stroke(); };
  // eyes + brows
  for (const s of [-1, 1]) {
    if (ex === 'calm') { lidEye(s); brow(s, 0, 2); }
    else if (ex === 'neutral') { dotEye(s); brow(s, 0, 0); }
    else if (ex === 'alarmed') { wideEye(s, 14); brow(s, -10, -4, 6); }
    else if (ex === 'shout' || ex === 'angry') { wideEye(s, 12, [-s * 2, 1]); brow(s, 10, -8, -2); }
    else if (ex === 'scared') { wideEye(s, 15, [0, 2]); brow(s, -14, 2, 4); }
    else if (ex === 'grin') { arcEye(s, true); brow(s, -4, -6, 4); }
    else if (ex === 'smug') { lidEye(s); brow(s, s > 0 ? -10 : 2, s > 0 ? -14 : 0); }
    else if (ex === 'sad') { dotEye(s, 6, 2); brow(s, -10, 6); }
    if (!old) { g.fillStyle = 'rgba(220,120,110,0.35)'; g.beginPath(); g.ellipse(cx + s * 44, headY + 28, 11, 7, 0, 0, Math.PI * 2); g.fill(); }
  }
  if (ex === 'scared') { shape(g, [[cx + 62, headY - 30], [cx + 70, headY - 12], [cx + 62, headY - 4], [cx + 54, headY - 12]], '#9fd3f0', 3, nz, 120); }
  if (P.glasses) { g.strokeStyle = INK; g.lineWidth = 3.5; for (const s of [-1, 1]) { g.beginPath(); g.arc(cx + s * 27, headY + 6, 17, 0, Math.PI * 2); g.stroke(); } g.beginPath(); g.moveTo(cx - 10, headY + 4); g.lineTo(cx + 10, headY + 4); g.stroke(); }
  // beard behind the mouth (old men)
  const my = headY + (P.beard ? 40 : 30);
  if (P.beard) shape(g, circlePts(cx, headY + 46, 56, 44, 30, 0.22, nz, 130).filter((p) => p[1] > headY + 18).concat([[cx + 54, headY + 18], [cx - 54, headY + 18]]), P.beard, lw * 0.8, nz, 131);
  // mouth: shape from the expression, opened by talk
  const open = ex === 'shout' ? 0.55 + 0.45 * talk : talk;
  g.lineCap = 'round';
  if (open > 0.05) {
    const w = ex === 'shout' ? 22 : ex === 'grin' ? 18 : 11, h = (ex === 'shout' ? 10 : 4) + 16 * open;
    g.fillStyle = INK; g.beginPath(); g.ellipse(cx, my, w, h, 0, 0, Math.PI * 2); g.fill();
    if (ex === 'shout' || ex === 'grin') { g.fillStyle = '#fffdf6'; g.fillRect(cx - w * 0.75, my - h + 3, w * 1.5, Math.min(7, h * 0.35)); }
    g.fillStyle = '#c9605a'; g.beginPath(); g.ellipse(cx, my + h * 0.45, w * 0.55, h * 0.4, 0, 0, Math.PI * 2); g.fill();
  } else {
    g.strokeStyle = INK; g.lineWidth = 4.5; g.beginPath();
    if (ex === 'grin') { g.fillStyle = INK; g.ellipse(cx, my - 2, 22, 12, 0, 0, Math.PI); g.fill(); g.fillStyle = '#fffdf6'; g.fillRect(cx - 18, my - 2, 36, 6); }
    else if (ex === 'sad' || ex === 'scared' || ex === 'angry') g.arc(cx, my + 12, 11, 1.2 * Math.PI, 1.8 * Math.PI);
    else if (ex === 'smug') { g.moveTo(cx - 10, my); g.quadraticCurveTo(cx + 4, my + 6, cx + 14, my - 4); }
    else if (ex === 'alarmed') g.arc(cx, my, 6, 0, Math.PI * 2);
    else g.arc(cx, my - 4, 9, 0.2 * Math.PI, 0.8 * Math.PI);
    g.stroke();
  }
  // walrus moustache on top of the mouth
  if (P.moustache) {
    for (const s of [-1, 1]) shape(g, [[cx, my - 16], [cx + s * 20, my - 22], [cx + s * 40, my - 12], [cx + s * 44, my + 2], [cx + s * 30, my - 2], [cx + s * 14, my - 6], [cx, my - 8]], P.moustache, lw * 0.75, nz, 140 + s);
  }
}

export function makePerson(P) {
  const c = document.createElement('canvas'); c.width = CW * RES; c.height = CH * RES;
  const g = c.getContext('2d');
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const H = P.height || 1.72; const planeH = H * (CH / PX_H), planeW = planeH * (CW / CH);
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.45, side: THREE.DoubleSide, fog: true });
  const geo = new THREE.PlaneGeometry(planeW, planeH); geo.translate(0, planeH / 2 - planeH * ((CH - FOOT) / CH), 0);
  const mesh = new THREE.Mesh(geo, mat);
  const group = new THREE.Group(); group.add(mesh);
  // soft contact shadow blob
  const sc = document.createElement('canvas'); sc.width = sc.height = 64; const sg = sc.getContext('2d');
  const gr = sg.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(53,31,34,0.45)'); gr.addColorStop(1, 'rgba(53,31,34,0)'); sg.fillStyle = gr; sg.fillRect(0, 0, 64, 64);
  const blob = new THREE.Mesh(new THREE.PlaneGeometry(H * 0.62, H * 0.3), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false }));
  blob.rotation.x = -Math.PI / 2; blob.position.y = 0.03; group.add(blob);
  const person = { ...P, nz: noise1(P.seed || 1) };
  return {
    group,
    // t in seconds; walking = stride rate in Hz (0 = idle); cam = camera position
    update(t, cam, walking = 0, opts = {}) {
      const ph = t * Math.PI * 2 * (walking || 0.5) + (P.phase || 0);
      const pose = walking
        ? { leg: 0.32 * Math.sin(ph), arm: 0.28 * Math.sin(ph), bob: Math.abs(Math.sin(ph)) * 7 }
        : { leg: 0, arm: 0.06 * Math.sin(ph), bob: 2 + 2 * Math.sin(ph), nod: 2 * Math.sin(ph * 0.5) };
      if (opts.hold) pose.hold = true;
      if (opts.expr) pose.expr = opts.expr;
      if (opts.talk) pose.talk = Math.max(0, Math.sin(t * 23) * 0.6 + Math.sin(t * 9.7) * 0.4) * opts.talk;
      drawPerson(g, person, pose); tex.needsUpdate = true;
      // turn toward the camera with limited yaw so they are never edge-on
      const wp = new THREE.Vector3(); group.getWorldPosition(wp);
      const yaw = Math.atan2(cam.x - wp.x, cam.z - wp.z) - (P.faceYaw || 0);
      mesh.rotation.y = THREE.MathUtils.clamp(yaw, -0.7, 0.7) + (P.faceYaw || 0);
    },
  };
}

export const PALETTES = [
  { skin: '#f6dfc8', hair: '#6b4a32', jacket: '#3f6f8f', jacket2: '#2f5470', pants: '#3b3640', shoes: INK, tie: '#c9452f', hat: 'none' },
  { skin: '#f3d9c0', hair: '#c9a25a', jacket: '#d18b3a', jacket2: '#a96a2a', pants: '#4a4252', shoes: INK, tie: '#3f6f8f', hat: 'beanie', hatColor: '#c9452f', hatColor2: '#f3ead6' },
  { skin: '#f7e2cf', hair: '#e8e2d6', jacket: '#6f8f5a', jacket2: '#55703f', pants: '#3b3640', shoes: INK, tie: '#a8352b', hat: 'none', glasses: true },
  { skin: '#e9c7a6', hair: '#2f2526', jacket: '#7a5aa0', jacket2: '#5d4380', pants: '#353040', shoes: INK, tie: '#e1ad35', hat: 'cap', hatColor: '#3f6f8f' },
  { skin: '#f6dfc8', hair: '#8a5a3a', jacket: '#c9452f', jacket2: '#9b3226', pants: '#3b3640', shoes: INK, tie: '#f3ead6', hat: 'bowler', hatColor: '#3a3236' },
  { skin: '#f1d4b8', hair: '#4a3426', jacket: '#e1ad35', jacket2: '#b88a26', pants: '#3f4a5a', shoes: INK, tie: '#3f6f8f', hat: 'cap', hatColor: '#e8702f' },
];
