// Cane toads and cane beetles, drawn in the house ink style (bold #351f22 outline, flat colours, a shade side).
// Static canvas textures per pose (cached), used on camera-facing planes. Many toads share one texture.
import * as THREE from 'three';
import { INK, rng } from './toon.js';

const TEX = {};
const SKIN = '#9a7a4a', SKIN2 = '#7a5c36', BELLY = '#e3cf9a', WART = '#5e4628', EYE = '#e8b42a';
function blobPath(g, cx, cy, rx, ry, r, n = 36, wob = 0.05) {
  g.beginPath();
  for (let i = 0; i <= n; i++) { const a = (i / n) * Math.PI * 2; const k = 1 + (Math.sin(i * 2.3 + r) * 0.5) * wob; const x = cx + Math.cos(a) * rx * k, y = cy + Math.sin(a) * ry * k; i ? g.lineTo(x, y) : g.moveTo(x, y); }
  g.closePath();
}
function fillInk(g, col, lw = 9) { g.fillStyle = col; g.fill(); g.strokeStyle = INK; g.lineWidth = lw; g.lineJoin = 'round'; g.stroke(); }

// pose: sit | hop | up (eyes to the sky) | eat (tongue out) | angry ; front view, 512x512, feet at y = 470
export function drawToad(g, pose = 'sit') {
  const W = 512; g.clearRect(0, 0, W, W); const r = rng(pose.length * 13);
  const hop = pose === 'hop';
  const cy = hop ? 270 : 330, bodyRx = hop ? 150 : 185, bodyRy = hop ? 150 : 125;
  // back legs
  g.lineCap = 'round';
  if (hop) {
    for (const s of [-1, 1]) { g.strokeStyle = INK; g.lineWidth = 58; g.beginPath(); g.moveTo(256 + s * 90, cy + 80); g.lineTo(256 + s * 130, 420); g.lineTo(256 + s * 110, 490); g.stroke(); g.strokeStyle = SKIN2; g.lineWidth = 40; g.stroke(); }
  } else {
    for (const s of [-1, 1]) { blobPath(g, 256 + s * 150, 420, 80, 50, s * 3); fillInk(g, SKIN2); }
  }
  // body
  blobPath(g, 256, cy, bodyRx, bodyRy, 1.3); fillInk(g, SKIN, 10);
  g.save(); blobPath(g, 256, cy, bodyRx, bodyRy, 1.3); g.clip();
  g.fillStyle = SKIN2; g.fillRect(256 + bodyRx * 0.35, 0, W, W);           // shade side
  blobPath(g, 256, cy + bodyRy * 0.55, bodyRx * 0.62, bodyRy * 0.5, 2); g.fillStyle = BELLY; g.fill();
  for (let i = 0; i < 26; i++) { const a = r() * Math.PI * 2, d = r() * 0.8; const x = 256 + Math.cos(a) * bodyRx * d, y = cy - Math.abs(Math.sin(a)) * bodyRy * d * 0.9; g.fillStyle = WART; g.beginPath(); g.arc(x, y, 6 + r() * 9, 0, 7); g.fill(); }
  g.restore();
  // parotoid glands (the big bumps behind the eyes)
  for (const s of [-1, 1]) { blobPath(g, 256 + s * 120, cy - bodyRy * 0.55, 46, 26, s); fillInk(g, '#b08a52', 7); }
  // front legs
  for (const s of [-1, 1]) { g.strokeStyle = INK; g.lineWidth = 36; g.beginPath(); g.moveTo(256 + s * 70, cy + 40); g.lineTo(256 + s * 85, 470); g.stroke(); g.strokeStyle = SKIN; g.lineWidth = 20; g.stroke(); blobPath(g, 256 + s * 92, 472, 34, 14, s); fillInk(g, SKIN, 6); }
  // eyes on top
  const ey = cy - bodyRy * 0.82, lookY = pose === 'up' ? -14 : 4;
  for (const s of [-1, 1]) {
    blobPath(g, 256 + s * 62, ey, 44, 40, s * 2); fillInk(g, SKIN, 9);
    g.beginPath(); g.arc(256 + s * 62, ey, 30, 0, 7); g.fillStyle = EYE; g.fill(); g.strokeStyle = INK; g.lineWidth = 6; g.stroke();
    g.fillStyle = INK; g.beginPath(); g.ellipse(256 + s * 62, ey + lookY, 20, 9, 0, 0, 7); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.arc(256 + s * 62 - 9, ey - 10, 6, 0, 7); g.fill();
    if (pose === 'angry') { g.strokeStyle = INK; g.lineWidth = 10; g.beginPath(); g.moveTo(256 + s * 30, ey - 30); g.lineTo(256 + s * 95, ey - 48); g.stroke(); }
  }
  // wide mouth
  g.strokeStyle = INK; g.lineWidth = 9; g.beginPath(); g.moveTo(256 - 120, cy - bodyRy * 0.25); g.quadraticCurveTo(256, cy + (pose === 'up' ? -bodyRy * 0.05 : bodyRy * 0.08), 256 + 120, cy - bodyRy * 0.25); g.stroke();
  if (pose === 'eat') { g.strokeStyle = '#d4566a'; g.lineWidth = 22; g.beginPath(); g.moveTo(256, cy - bodyRy * 0.15); g.quadraticCurveTo(300, cy - 60, 360, cy - 140); g.stroke(); g.fillStyle = '#d4566a'; g.beginPath(); g.arc(360, cy - 140, 20, 0, 7); g.fill(); }
}

// cane beetle: top/front view, glossy dark brown, 512x512, standing on y = 470
export function drawBeetle(g, pose = 'munch') {
  const W = 512; g.clearRect(0, 0, W, W);
  g.lineCap = 'round';
  for (const s of [-1, 1]) for (let k = 0; k < 3; k++) { g.strokeStyle = INK; g.lineWidth = 16; g.beginPath(); g.moveTo(256 + s * 80, 280 + k * 60); g.lineTo(256 + s * 170, 300 + k * 70); g.lineTo(256 + s * 190, 400 + k * 30); g.stroke(); }
  blobPath(g, 256, 320, 130, 150, 0.4, 36, 0.02); fillInk(g, '#5a3a22', 11);
  g.save(); blobPath(g, 256, 320, 130, 150, 0.4, 36, 0.02); g.clip(); g.fillStyle = '#43291a'; g.fillRect(256 + 40, 0, W, W); g.restore();
  g.strokeStyle = INK; g.lineWidth = 7; g.beginPath(); g.moveTo(256, 200); g.lineTo(256, 468); g.stroke();
  g.fillStyle = 'rgba(255,255,255,0.35)'; g.beginPath(); g.ellipse(200, 270, 22, 50, -0.3, 0, 7); g.fill();
  blobPath(g, 256, 175, 82, 60, 1.2); fillInk(g, '#4a2f1c', 10);                  // head
  for (const s of [-1, 1]) { g.fillStyle = '#fff'; g.beginPath(); g.arc(256 + s * 34, 165, 17, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = 5; g.stroke(); g.fillStyle = INK; g.beginPath(); g.arc(256 + s * 34, pose === 'down' ? 172 : 163, 8, 0, 7); g.fill(); }
  for (const s of [-1, 1]) { g.strokeStyle = INK; g.lineWidth = 9; g.beginPath(); g.moveTo(256 + s * 40, 125); g.quadraticCurveTo(256 + s * 70, 70, 256 + s * 105, 60); g.stroke(); }
  if (pose === 'munch' || pose === 'down') { g.strokeStyle = INK; g.lineWidth = 7; g.beginPath(); g.arc(256, 205, 22, 0.2, Math.PI - 0.2); g.stroke(); }
  if (pose === 'smug') { g.strokeStyle = INK; g.lineWidth = 7; g.beginPath(); g.moveTo(226, 205); g.quadraticCurveTo(256, 222, 290, 198); g.stroke(); }
}

function tex(kind, pose) {
  const key = kind + pose; if (TEX[key]) return TEX[key];
  const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d');
  (kind === 'toad' ? drawToad : drawBeetle)(g, pose);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; TEX[key] = t; return t;
}
const MATS = {};
function mat(kind, pose, tint) {
  const key = kind + pose + tint; if (MATS[key]) return MATS[key];
  const map = tex(kind, pose);
  const m = new THREE.MeshBasicMaterial({ map, color: tint, transparent: true, alphaTest: 0.45, side: THREE.DoubleSide, fog: true });
  MATS[key] = m; return m;
}
const DEPTH = {};
function depthMat(kind, pose) { const key = kind + pose; if (!DEPTH[key]) DEPTH[key] = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: tex(kind, pose), alphaTest: 0.45 }); return DEPTH[key]; }

// one critter: {group, setPose(p), face(camPos)} ; size = height in metres
export function critter(kind = 'toad', { size = 0.14, tint = '#ffffff', pose = kind === 'toad' ? 'sit' : 'munch', shadow = true } = {}) {
  const geo = new THREE.PlaneGeometry(size, size); geo.translate(0, size * 0.5 - size * (42 / 512), 0);
  const mesh = new THREE.Mesh(geo, mat(kind, pose, tint)); mesh.castShadow = shadow; if (shadow) mesh.customDepthMaterial = depthMat(kind, pose);
  const group = new THREE.Group(); group.add(mesh);
  let cur = pose;
  return {
    group, mesh,
    setPose(p) { if (p === cur) return; cur = p; mesh.material = mat(kind, p, tint); if (shadow) mesh.customDepthMaterial = depthMat(kind, p); },
    face(cam) { const p = cam.position || cam; const wp = new THREE.Vector3(); group.getWorldPosition(wp); mesh.rotation.y = Math.atan2(p.x - wp.x, p.z - wp.z) - group.rotation.y; },
  };
}

// a crowd of toads scattered over an area; each has a seed for hop phase. update(t, cam, fn?) lets a scene move them.
export function toadCrowd(n, { x = [-6, 6], z = [-8, 2], size = [0.12, 0.2], tint = '#ffffff', seed = 3, shadow = false, avoid = null } = {}) {
  const r = rng(seed); const group = new THREE.Group(); const list = [];
  for (let i = 0; i < n; i++) {
    let px, pz, k = 0;
    do { px = x[0] + r() * (x[1] - x[0]); pz = z[0] + r() * (z[1] - z[0]); k++; } while (avoid && avoid(px, pz) && k < 20);
    const s = size[0] + r() * (size[1] - size[0]);
    const base = r() > 0.8 ? 'up' : 'sit';
    const c = critter('toad', { size: s, tint, shadow, pose: base });
    c.group.position.set(px, 0, pz); group.add(c.group);
    list.push({ c, px, pz, s, ph: r() * 10, rate: 0.5 + r() * 0.8, base });
  }
  return {
    group, list,
    // hop: 0..1 how lively; dir: [dx,dz] drift per hop
    update(t, cam, { hop = 0.5, dir = [0, 0.25], show = 1, t0 = 0 } = {}) {
      list.forEach((q, i) => {
        const vis = i < Math.floor(list.length * show); q.c.group.visible = vis; if (!vis) return;
        const cyc = (t - t0) * q.rate + q.ph, f = cyc - Math.floor(cyc), hopping = f < 0.35 * hop;
        const n = Math.floor(cyc) - Math.floor(q.ph), kk = hopping ? f / (0.35 * hop) : 1;
        q.c.group.position.set(q.px + dir[0] * (n + kk) * hop, hopping ? Math.sin(kk * Math.PI) * q.s * 1.4 : 0, q.pz + dir[1] * (n + kk) * hop);
        q.c.setPose(hopping ? 'hop' : q.base); q.c.face(cam);
      });
    },
  };
}
