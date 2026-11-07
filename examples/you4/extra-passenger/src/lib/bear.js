// Wojtek: a 2D bear drawn in the same ink style as the people (bold outline, flat colours, a shade side),
// standing up like a person. Poses: idle | carry (crate over the head) | hold (crate at the chest) | salute | wave |
// drink (bottle at the mouth) | wrestle (arms out). cub: true draws the small round baby version.
import * as THREE from 'three';
import { INK, rng } from './toon.js';

const CW = 400, CH = 560, RES = 3, OY = 80, TOP = 40 + OY, FOOT = 466 + OY, PX_H = FOOT - TOP; // OY: headroom for a crate held overhead
const FUR = '#8a5a3a', FUR2 = '#6f4630', BELLY = '#c99a6a', MUZ = '#e8cfa8';
function noise1(seed) { const r = rng(seed); const v = Array.from({ length: 64 }, r); return (x) => { const i = Math.floor(x) & 63, f = x - Math.floor(x), a = v[i], b = v[(i + 1) & 63]; return a + (b - a) * (f * f * (3 - 2 * f)); }; }
const circ = (cx, cy, rx, ry, n = 40, wob = 0.03, nz, off = 0) => { const p = []; for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; const k = 1 + (nz(off + i * 0.4) - 0.5) * wob; p.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]); } return p; };
function shape(g, pts, color, lw) {
  g.fillStyle = color; g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.closePath(); g.fill();
  g.strokeStyle = INK; g.lineWidth = lw; g.lineJoin = 'round'; g.stroke();
}
// thick furry limb: ink stroke, then fur stroke on top, round paw at the end
function limb(g, a, b, w, paw = true) {
  g.lineCap = 'round'; g.strokeStyle = INK; g.lineWidth = w + 17; g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke();
  g.strokeStyle = FUR; g.lineWidth = w; g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke();
  if (paw) { g.fillStyle = FUR2; g.beginPath(); g.arc(b[0], b[1], w * 0.42, 0, Math.PI * 2); g.fill(); }
}
function crate(g, x, y, w, h) {
  shape(g, [[x - w / 2, y - h / 2], [x + w / 2, y - h / 2], [x + w / 2, y + h / 2], [x - w / 2, y + h / 2]], '#9a6b42', 8);
  g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.moveTo(x - w / 2, y - h / 2); g.lineTo(x + w / 2, y + h / 2); g.moveTo(x - w / 2, y); g.lineTo(x + w / 2, y); g.stroke();
  g.fillStyle = '#c9a25a'; g.font = 'bold 26px Arial Black, sans-serif'; g.textAlign = 'center'; g.fillText('25 PDR', x, y - 6);
}

export function drawBear(g, pose) {
  const t = pose.t || 0, nz = pose.nz, cub = !!pose.cub;
  g.setTransform(RES, 0, 0, RES, 0, 0); g.clearRect(0, 0, CW, CH); g.translate(0, OY);
  const cx = CW / 2, bob = pose.bob || 0;
  // proportions: cub = big head, round body; adult = tall heavy body
  const hr = cub ? 92 : 74, headY = (cub ? 150 : 118) - bob;
  const bodyTop = headY + hr * 0.6, hipY = cub ? 380 : 360 - bob, bw = cub ? 96 : 104;
  // legs
  for (const s of [-1, 1]) limb(g, [cx + s * 46, hipY], [cx + s * 54, FOOT - OY - 22], cub ? 40 : 50, false);
  for (const s of [-1, 1]) shape(g, circ(cx + s * 58, FOOT - OY - 18, cub ? 30 : 36, 18, 24, 0.05, nz, 5 + s), FUR2, 8);
  // body
  const body = circ(cx, (bodyTop + hipY) / 2 + 10, bw, (hipY - bodyTop) / 2 + 30, 48, 0.03, nz, 20);
  shape(g, body, FUR, 9);
  g.save(); g.beginPath(); body.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.closePath(); g.clip();
  g.fillStyle = FUR2; g.fillRect(cx + bw * 0.35, 0, 200, CH); g.restore();
  shape(g, circ(cx - 4, (bodyTop + hipY) / 2 + 22, bw * 0.58, (hipY - bodyTop) / 2 - 2, 36, 0.04, nz, 30), BELLY, 5);
  // arms by pose (shoulders at the top of the body)
  const sh = { L: [cx - bw * 0.8, bodyTop + 34], R: [cx + bw * 0.8, bodyTop + 34] };
  const P = pose.pose || 'idle', aw = cub ? 32 : 42;
  const hands = {
    idle: { L: [cx - bw - 6, hipY - 10 + 3 * Math.sin(t * 2)], R: [cx + bw + 6, hipY - 10 + 3 * Math.sin(t * 2 + 1)] },
    carry: { L: [cx - 70, headY - hr - 18], R: [cx + 70, headY - hr - 18] },
    hold: { L: [cx - 60, bodyTop + 70], R: [cx + 60, bodyTop + 70] },
    salute: { L: [cx - bw - 6, hipY - 10], R: [cx + 46, headY - 36] },
    wave: { L: [cx - bw - 6, hipY - 10], R: [cx + bw + 40 + 14 * Math.sin(t * 9), headY - 60] },
    drink: { L: [cx - bw - 6, hipY - 10], R: [cx + 34, headY + 56] },
    wrestle: { L: [cx - bw - 70, bodyTop + 10 + 12 * Math.sin(t * 11)], R: [cx + bw + 70, bodyTop + 6 + 12 * Math.sin(t * 13)] },
  }[P];
  if (P === 'carry') crate(g, cx, headY - hr - 52, 190, 92);
  for (const s of ['L', 'R']) limb(g, sh[s], hands[s], aw);
  if (P === 'hold') crate(g, cx, bodyTop + 76, 150, 76);
  if (P === 'drink') { g.fillStyle = '#cfe6f2'; g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.roundRect(cx + 22, headY + 20, 28, 62, 8); g.fill(); g.stroke(); }
  // head: ears, head, muzzle, nose, eyes, brows
  for (const s of [-1, 1]) { shape(g, circ(cx + s * hr * 0.72, headY - hr * 0.72, hr * 0.32, hr * 0.32, 24, 0.05, nz, 40 + s), FUR, 8); shape(g, circ(cx + s * hr * 0.72, headY - hr * 0.72, hr * 0.16, hr * 0.16, 18, 0.05, nz, 44 + s), BELLY, 4); }
  shape(g, circ(cx, headY, hr, hr * 0.92, 48, 0.03, nz, 50), FUR, 9);
  shape(g, circ(cx, headY + hr * 0.34, hr * 0.46, hr * 0.34, 32, 0.04, nz, 60), MUZ, 6);
  shape(g, circ(cx, headY + hr * 0.2, hr * 0.17, hr * 0.12, 20, 0.04, nz, 64), INK, 3);
  const ex = pose.expr || 'happy';
  for (const s of [-1, 1]) {
    const ex0 = cx + s * hr * 0.4, ey = headY - hr * 0.12;
    g.fillStyle = INK; g.strokeStyle = INK; g.lineWidth = 6; g.lineCap = 'round';
    if (ex === 'happy') { g.beginPath(); g.arc(ex0, ey + 6, 11, 1.15 * Math.PI, 1.85 * Math.PI); g.stroke(); }
    else if (ex === 'proud') { g.beginPath(); g.arc(ex0, ey, 9, 0, Math.PI * 2); g.fill(); g.beginPath(); g.moveTo(ex0 - 14, ey - 18 - s * 2); g.lineTo(ex0 + 14, ey - 22 + s * 2); g.stroke(); }
    else if (ex === 'strain') { g.beginPath(); g.moveTo(ex0 - 12, ey - 6); g.lineTo(ex0 + 12, ey + 2 * s); g.stroke(); }
    else { g.beginPath(); g.arc(ex0, ey, cub ? 12 : 9, 0, Math.PI * 2); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(ex0 + 3, ey - 3, 3, 0, Math.PI * 2); g.fill(); }
  }
  // mouth
  g.strokeStyle = INK; g.lineWidth = 5; g.beginPath();
  if (ex === 'happy' || ex === 'proud') g.arc(cx, headY + hr * 0.36, hr * 0.18, 0.15 * Math.PI, 0.85 * Math.PI); else if (ex === 'strain') { g.moveTo(cx - 20, headY + hr * 0.46); g.lineTo(cx + 20, headY + hr * 0.46); } else g.arc(cx, headY + hr * 0.4, 8, 0.2 * Math.PI, 0.8 * Math.PI);
  g.stroke();
  if (P === 'drink') { g.fillStyle = '#cfe6f2'; g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.roundRect(cx + 22, headY + 20, 28, 62, 8); g.fill(); g.stroke(); }
  if (pose.stripe) { // corporal stripes on the arm
    g.strokeStyle = '#e1ad35'; g.lineWidth = 7; for (let i = 0; i < 2; i++) { g.beginPath(); g.moveTo(sh.L[0] - 18, sh.L[1] + 26 + i * 14); g.lineTo(sh.L[0], sh.L[1] + 16 + i * 14); g.lineTo(sh.L[0] + 18, sh.L[1] + 26 + i * 14); g.stroke(); }
  }
}

export function makeBear({ height = 1.9, cub = false, tint = '#ffffff', seed = 9 } = {}) {
  const c = document.createElement('canvas'); c.width = CW * RES; c.height = CH * RES; const g = c.getContext('2d');
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const planeH = height * (CH / PX_H), planeW = planeH * (CW / CH);
  const mat = new THREE.MeshBasicMaterial({ map: tex, color: tint, transparent: true, alphaTest: 0.45, side: THREE.DoubleSide, fog: true });
  const geo = new THREE.PlaneGeometry(planeW, planeH); geo.translate(0, planeH / 2 - planeH * ((CH - FOOT) / CH), 0);
  const mesh = new THREE.Mesh(geo, mat); mesh.castShadow = true;
  mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: tex, alphaTest: 0.45 });
  mesh.customDistanceMaterial = new THREE.MeshDistanceMaterial({ map: tex, alphaTest: 0.45 });
  const group = new THREE.Group(); group.add(mesh);
  const nz = noise1(seed);
  return {
    group, mesh,
    // opts: { pose, expr, stripe, walk }
    update(t, cam, opts = {}) {
      const bob = opts.walk ? Math.abs(Math.sin(t * 7)) * 8 : 2 + 2 * Math.sin(t * 2.2);
      drawBear(g, { t, nz, cub, bob, pose: opts.pose, expr: opts.expr, stripe: opts.stripe }); tex.needsUpdate = true;
      const wp = new THREE.Vector3(); group.getWorldPosition(wp);
      mesh.rotation.y = THREE.MathUtils.clamp(Math.atan2(cam.x - wp.x, cam.z - wp.z) - group.rotation.y, -0.7, 0.7);
      mesh.rotation.z = opts.walk ? Math.sin(t * 7) * 0.04 : 0;
    },
  };
}
export { drawBear as _drawBear };
