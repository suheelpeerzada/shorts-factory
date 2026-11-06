// 2D characters standing in the 3D world (Ricks-Clips-like): big round head sitting ON the body, bold smooth
// stick arms and legs, small round hands that point, grab and hold props. One base design; variants by palette,
// hats, glasses, beard. Poses come from a gesture timeline so every frame is deterministic.
import * as THREE from 'three';
import { INK, rng } from './toon.js';

const CW = 320, CH = 560, RES = 3;   // logical canvas size; drawn at RES x so close-ups stay crisp
const TOP = 70, FOOT = 548;          // head top and foot line in canvas px (room above for hats, at the sides for gestures)
const PX_H = FOOT - TOP;             // drawn person height in px
const HR = 74;                       // head radius
const LW = 8.5;                      // outline weight (bold)
const LIMB = 10;                     // stick limb weight
const UA = 60, FA = 58;              // upper arm / forearm length

function noise1(seed) { const r = rng(seed); const v = Array.from({ length: 64 }, r); return (x) => { const i = Math.floor(x) & 63, f = x - Math.floor(x), a = v[i], b = v[(i + 1) & 63]; return a + (b - a) * (f * f * (3 - 2 * f)); }; }
function inkPath(g, pts, closed, base, nz, off) {
  const n = pts.length; const m = closed ? n : n - 1;
  g.strokeStyle = INK; g.lineCap = 'round'; g.lineJoin = 'round';
  for (let i = 0; i < m; i++) {
    const a = pts[i], b = pts[(i + 1) % n];
    g.lineWidth = base * (0.85 + 0.3 * nz(off + i * 0.35));
    g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
  }
}
function fillPts(g, pts, color) { g.fillStyle = color; g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.closePath(); g.fill(); }
function circlePts(cx, cy, rx, ry, n = 36, wob = 0, nz = null, off = 0) { const out = []; for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; const k = 1 + (nz ? (nz(off + i * 0.4) - 0.5) * wob : 0); out.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]); } return out; }
function shape(g, pts, color, lw, nz, off) { fillPts(g, pts, color); inkPath(g, pts, true, lw, nz, off); }
function rrect(x0, y0, x1, y1, r, n = 6) { // rounded rectangle points
  const pts = []; const c = [[x1 - r, y0 + r, -Math.PI / 2], [x1 - r, y1 - r, 0], [x0 + r, y1 - r, Math.PI / 2], [x0 + r, y0 + r, Math.PI]];
  for (const [x, y, a0] of c) for (let i = 0; i <= n; i++) { const a = a0 + (i / n) * (Math.PI / 2); pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); }
  return pts;
}
// smooth stick limb through a joint (quadratic curve whose midpoint passes through the joint)
function stick(g, a, j, b, w = LIMB, color = INK) {
  const cx = 2 * j[0] - (a[0] + b[0]) / 2, cy = 2 * j[1] - (a[1] + b[1]) / 2;
  g.strokeStyle = color; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo(cx, cy, b[0], b[1]); g.stroke();
}
// two-bone IK: shoulder S, hand target H; elbow bends outward (side s)
function ik(S, H, s, a = UA, b = FA) {
  let dx = H[0] - S[0], dy = H[1] - S[1]; let d = Math.hypot(dx, dy) || 1;
  const dm = Math.min(a + b - 0.5, Math.max(8, d)); const k = dm / d; dx *= k; dy *= k; d = dm;
  const hand = [S[0] + dx, S[1] + dy];
  const cosA = THREE.MathUtils.clamp((a * a + d * d - b * b) / (2 * a * d), -1, 1), A = Math.acos(cosA);
  const base = Math.atan2(dy, dx);
  const e1 = [S[0] + Math.cos(base + A) * a, S[1] + Math.sin(base + A) * a], e2 = [S[0] + Math.cos(base - A) * a, S[1] + Math.sin(base - A) * a];
  const elbow = s * e1[0] + 0.35 * e1[1] > s * e2[0] + 0.35 * e2[1] ? e1 : e2; // outward and slightly down
  return { elbow, hand };
}

// ---------- gestures: hand targets in canvas px, relative to the shoulder (x outward from the body, y down) ----------
// returns {L:[dx,dy], R:[dx,dy], fistL, fistR, point (R index finger), abs} ; side L = -1 (screen left), R = +1
const GEST = {
  idle: (t) => ({ L: [10, 115 + 1.5 * Math.sin(t * 1.7)], R: [10, 115 + 1.5 * Math.sin(t * 1.7 + 1)] }),
  talk: (t) => ({ L: [16, 108], R: [-6 + 10 * Math.sin(t * 5.2), 58 + 12 * Math.sin(t * 3.1)] }),
  talk2: (t) => ({ L: [-4 + 8 * Math.sin(t * 4.1 + 2), 62 + 10 * Math.sin(t * 2.7)], R: [-6 + 10 * Math.sin(t * 5.2), 58 + 12 * Math.sin(t * 3.1)] }),
  point: (t, o) => { const a = o.angle ?? -0.25; return { L: [16, 108], R: [Math.cos(a) * 116, Math.sin(a) * 116], point: true }; },
  pointL: (t, o) => { const a = o.angle ?? -0.25; return { R: [16, 108], L: [Math.cos(a) * 116, Math.sin(a) * 116], pointL: true }; },
  fists: (t) => ({ L: [58 + 3 * Math.sin(t * 40), -54], R: [58 + 3 * Math.sin(t * 43 + 1), -58], fistL: true, fistR: true }),
  scared: (t) => ({ L: [34 + 2 * Math.sin(t * 37), -56], R: [34 + 2 * Math.sin(t * 41 + 1), -56] }),
  hips: () => ({ L: [8, 98], R: [8, 98], fistL: true, fistR: true }),
  shrug: () => ({ L: [52, -6], R: [52, -6] }),
  wave: (t) => ({ L: [16, 108], R: [40 + 18 * Math.sin(t * 9), -70] }),
  hold: () => ({ L: [-22, 70], R: [-22, 70] }),
  holdR: (t) => ({ L: [16, 108], R: [-14, 66] }),
  lantern: (t) => ({ L: [16, 108], R: [30, 92] }),
  lift: (t) => ({ L: [16, 108], R: [14, -100] }),
  mouth: () => ({ L: [16, 108], R: [-18, -48] }), // hand at the mouth (radio handset)
  facepalm: () => ({ L: [16, 108], R: [-28, -70] }),
  reach: (t, o) => ({ L: [16, 108], R: [o.dx ?? 60, o.dy ?? -20] }),
  // both hands on one point given in absolute canvas px (o.at = [x, y]); used to grip a lever handle
  grip: (t, o) => ({ abs: true, L: [o.at[0] - 12, o.at[1]], R: [o.at[0] + 12, o.at[1]], fistL: true, fistR: true }),
};
const lerp2 = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
// timeline: [[t, gesture, opts?], ...] (or a plain gesture name). Blends over 0.22 s.
function resolveGesture(tl, t, S) {
  if (!tl) tl = 'idle';
  if (typeof tl === 'string') tl = [[-1e9, tl]];
  let i = 0; while (i + 1 < tl.length && t >= tl[i + 1][0]) i++;
  const cur = tl[i], prev = tl[Math.max(0, i - 1)];
  const toAbs = (gx, side, v) => (gx.abs ? v : [S[side][0] + (side === 'L' ? -1 : 1) * v[0], S[side][1] + v[1]]);
  const gc = GEST[cur[1]](t, cur[2] || {}), gp = GEST[prev[1]](t, prev[2] || {});
  const k = i === 0 ? 1 : THREE.MathUtils.smoothstep((t - cur[0]) / 0.22, 0, 1);
  const out = {};
  for (const side of ['L', 'R']) out[side] = lerp2(toAbs(gp, side, gp[side]), toAbs(gc, side, gc[side]), k);
  const pick = (key) => (k > 0.5 ? gc[key] : gp[key]);
  out.fistL = pick('fistL'); out.fistR = pick('fistR'); out.point = pick('point'); out.pointL = pick('pointL');
  out.prop = k > 0.5 ? (cur[2] || {}).prop : (prev[2] || {}).prop;
  out.propHand = (k > 0.5 ? (cur[2] || {}).hand : (prev[2] || {}).hand) || 'R';
  return out;
}

// ---------- props drawn in a hand ----------
function drawProp(g, name, h, nz, t) {
  const [x, y] = h; g.lineJoin = 'round';
  if (name === 'lantern') {
    g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.arc(x, y + 8, 12, Math.PI, 0); g.stroke();
    shape(g, rrect(x - 17, y + 14, x + 17, y + 20, 3), '#2b2b33', 4, nz, 200);
    shape(g, rrect(x - 14, y + 20, x + 14, y + 52, 5), '#fff2b0', 4.5, nz, 201);
    g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(x, y + 38, 6, 9 + Math.sin(t * 13), 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = INK; g.lineWidth = 3; for (const dx of [-7, 7]) { g.beginPath(); g.moveTo(x + dx, y + 20); g.lineTo(x + dx, y + 52); g.stroke(); }
    shape(g, rrect(x - 17, y + 52, x + 17, y + 58, 3), '#2b2b33', 4, nz, 202);
  } else if (name === 'radio') {
    g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(x + 8, y - 22); g.lineTo(x + 14, y - 62); g.stroke();
    shape(g, rrect(x - 16, y - 26, x + 16, y + 22, 6), '#3d4a3f', 5, nz, 210);
    g.fillStyle = '#1d2420'; for (let i = 0; i < 4; i++) g.fillRect(x - 10, y - 16 + i * 7, 20, 3);
    g.fillStyle = '#ff5a4a'; g.beginPath(); g.arc(x + 9, y + 12, 3.5, 0, Math.PI * 2); g.fill();
  } else if (name === 'mug') {
    shape(g, rrect(x - 4, y - 18, x + 22, y + 14, 4), '#e8e0d0', 4.5, nz, 220);
    g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.arc(x - 4, y - 2, 8, 0.5 * Math.PI, 1.5 * Math.PI); g.stroke();
  } else if (name === 'key') {
    g.strokeStyle = INK; g.lineWidth = 7; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 34, y - 26); g.stroke();
    g.strokeStyle = '#e1ad35'; g.lineWidth = 3.5; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 34, y - 26); g.stroke();
    shape(g, circlePts(x - 4, y + 4, 10, 10, 16, 0.05, nz, 230), '#e1ad35', 4, nz, 231);
  } else if (name === 'book') {
    shape(g, [[x - 30, y - 22], [x + 30, y - 22], [x + 32, y + 18], [x - 32, y + 18]], '#7a2f2a', 5, nz, 240);
    shape(g, [[x - 24, y - 18], [x + 24, y - 18], [x + 26, y + 12], [x - 26, y + 12]], '#f4ead2', 3, nz, 241);
    g.strokeStyle = INK; g.lineWidth = 2; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(x - 18, y - 10 + i * 6); g.lineTo(x + 18, y - 10 + i * 6); g.stroke(); }
  } else if (name === 'spyglass') {
    shape(g, [[x - 6, y - 4], [x + 46, y - 22], [x + 50, y - 10], [x - 2, y + 8]], '#c9a25a', 4.5, nz, 250);
  }
}

export function drawPerson(g, P, pose) {
  const nz = P.nz; const lw = LW; const t = pose.t || 0;
  g.setTransform(RES, 0, 0, RES, 0, 0); g.clearRect(0, 0, CW, CH);
  const cx = CW / 2, bob = pose.bob || 0;
  const headY = TOP + HR - bob + (pose.nod || 0) + 4;
  const shY = headY + HR - 4, hipY = shY + 136;       // the head overlaps the top of the body: no neck gap
  const S = { L: [cx - 34, shY + 10], R: [cx + 34, shY + 10] };
  // legs: bold smooth sticks with a knee
  for (const s of [-1, 1]) {
    const sw = (s < 0 ? 1 : -1) * (pose.leg || 0);
    const hip = [cx + s * 16, hipY - 4], foot = [cx + s * 18 + Math.sin(sw) * 70, FOOT - 10 - Math.max(0, -Math.cos(sw * 2)) * 0];
    const knee = [(hip[0] + foot[0]) / 2 + Math.sin(sw) * 10 + s * 3, (hip[1] + foot[1]) / 2];
    stick(g, hip, knee, foot, LIMB + 1);
    shape(g, circlePts(foot[0] + s * 9, foot[1] + 3, 15, 8, 18, 0.06, nz, 9 + s), P.shoes || INK, 3, nz, 10 + s);
  }
  // body: rounded coat/sweater, slight taper
  const bw0 = 38, bw1 = 44;
  const body = []; const n = 10;
  for (let i = 0; i <= n; i++) { const k = i / n; body.push([cx + bw0 + (bw1 - bw0) * k, shY - 6 + k * (hipY - shY + 14)]); }
  for (let i = n; i >= 0; i--) { const k = i / n; body.push([cx - bw0 - (bw1 - bw0) * k, shY - 6 + k * (hipY - shY + 14)]); }
  const bodyPts = rrect(cx - bw1, shY - 8, cx + bw1, hipY + 10, 16);
  fillPts(g, bodyPts, P.jacket);
  g.save(); g.beginPath(); bodyPts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.closePath(); g.clip();
  g.fillStyle = P.jacket2; g.fillRect(cx + 10, shY - 10, 60, hipY - shY + 30);   // shade side: gives the body some volume
  if (P.outfit === 'sweater') { g.strokeStyle = 'rgba(0,0,0,0.18)'; g.lineWidth = 3; for (let x = cx - 40; x <= cx + 40; x += 11) { g.beginPath(); g.moveTo(x, shY + 14); g.lineTo(x, hipY + 10); g.stroke(); } g.fillStyle = P.jacket2; g.fillRect(cx - 50, hipY - 6, 100, 16); }
  else if (P.outfit === 'coat') { g.fillStyle = P.jacket2; g.fillRect(cx - 50, hipY - 40, 100, 12); g.fillStyle = '#e1ad35'; for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(cx, shY + 30 + i * 34, 5, 0, Math.PI * 2); g.fill(); } }
  else if (P.outfit === 'raincoat') { g.strokeStyle = 'rgba(0,0,0,0.25)'; g.lineWidth = 3; g.beginPath(); g.moveTo(cx, shY + 6); g.lineTo(cx, hipY + 10); g.stroke(); g.fillStyle = INK; for (let i = 0; i < 4; i++) g.fillRect(cx - 12, shY + 26 + i * 30, 10, 4); }
  else { // suit: collar + tie
    shape(g, [[cx - 22, shY - 6], [cx, shY + 14], [cx - 6, shY + 24], [cx - 26, shY + 6]], '#fbf6ea', 3.5, nz, 60);
    shape(g, [[cx + 22, shY - 6], [cx, shY + 14], [cx + 6, shY + 24], [cx + 26, shY + 6]], '#fbf6ea', 3.5, nz, 62);
    shape(g, [[cx, shY + 14], [cx + 7, shY + 28], [cx + 4, shY + 70], [cx, shY + 80], [cx - 4, shY + 70], [cx - 7, shY + 28]], P.tie || '#c9452f', 3, nz, 64);
  }
  g.restore();
  inkPath(g, bodyPts, true, lw, nz, 50);
  // head (drawn over the top of the body, so it sits on it)
  const head = circlePts(cx, headY, HR, HR * 0.96, 48, 0.035, nz, 70);
  shape(g, head, P.skin, lw, nz, 71);
  drawFace(g, P, pose, cx, headY, HR, nz, lw);
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

  // arms last: they can cross in front of the body and face
  const G = pose.G || resolveGesture('idle', t, S);
  const hands = {};
  for (const side of ['L', 'R']) {
    const s = side === 'L' ? -1 : 1;
    const { elbow, hand } = ik(S[side], G[side], s);
    stick(g, S[side], elbow, hand, LIMB);
    hands[side] = hand;
  }
  if (G.prop) drawProp(g, G.prop, hands[G.propHand], nz, t);
  for (const side of ['L', 'R']) {
    const h = hands[side], fist = side === 'L' ? G.fistL : G.fistR;
    if ((side === 'R' && G.point) || (side === 'L' && G.pointL)) { // pointing finger along the forearm direction
      const S0 = S[side], d = Math.hypot(h[0] - S0[0], h[1] - S0[1]) || 1, ux = (h[0] - S0[0]) / d, uy = (h[1] - S0[1]) / d;
      stick(g, h, [h[0] + ux * 9, h[1] + uy * 9], [h[0] + ux * 20, h[1] + uy * 20], 7);
    }
    shape(g, circlePts(h[0], h[1], fist ? 12 : 11, fist ? 11 : 11, 18, 0.08, nz, 30 + (side === 'L' ? 0 : 1)), P.skin, 4.5, nz, 31);
    if (fist) { g.strokeStyle = INK; g.lineWidth = 2.5; g.beginPath(); g.moveTo(h[0] - 5, h[1] - 2); g.lineTo(h[0] + 5, h[1] - 2); g.stroke(); }
  }
  return { hands };
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


// canvas px -> world offset on the character plane (x right, y up), for attaching 3D things to a hand
export function canvasToLocal(P, px, py) { const H = P.height || 1.72; const k = H / PX_H; return [(px - CW / 2) * k, (FOOT - py) * k]; }
export function localToCanvas(P, x, y) { const H = P.height || 1.72; const k = H / PX_H; return [CW / 2 + x / k, FOOT - y / k]; }

export function makePerson(P, { tint = '#ffffff' } = {}) {
  const c = document.createElement('canvas'); c.width = CW * RES; c.height = CH * RES;
  const g = c.getContext('2d');
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const H = P.height || 1.72; const planeH = H * (CH / PX_H), planeW = planeH * (CW / CH);
  const mat = new THREE.MeshBasicMaterial({ map: tex, color: tint, transparent: true, alphaTest: 0.45, side: THREE.DoubleSide, fog: true });
  const geo = new THREE.PlaneGeometry(planeW, planeH); geo.translate(0, planeH / 2 - planeH * ((CH - FOOT) / CH), 0);
  const mesh = new THREE.Mesh(geo, mat);
  // real cast shadows that follow the drawn silhouette
  mesh.castShadow = true;
  mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: tex, alphaTest: 0.45 });
  mesh.customDistanceMaterial = new THREE.MeshDistanceMaterial({ map: tex, alphaTest: 0.45 });
  const group = new THREE.Group(); group.add(mesh);
  const sc = document.createElement('canvas'); sc.width = sc.height = 64; const sg = sc.getContext('2d');
  const gr = sg.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(20,12,16,0.5)'); gr.addColorStop(1, 'rgba(20,12,16,0)'); sg.fillStyle = gr; sg.fillRect(0, 0, 64, 64);
  const blob = new THREE.Mesh(new THREE.PlaneGeometry(H * 0.5, H * 0.24), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false }));
  blob.rotation.x = -Math.PI / 2; blob.position.y = 0.02; group.add(blob);
  const person = { ...P, nz: noise1(P.seed || 1) };
  return {
    group, mesh, material: mat,
    // t seconds; walking = stride Hz (0 = idle); opts: { talk, expr, gesture (name or [[t, name, {prop, hand, angle, at}]...]), hold }
    update(t, cam, walking = 0, opts = {}) {
      const ph = t * Math.PI * 2 * (walking || 0.5) + (P.phase || 0);
      const pose = walking
        ? { leg: 0.3 * Math.sin(ph), bob: Math.abs(Math.sin(ph)) * 6 }
        : { leg: 0, bob: 1.5 + 1.5 * Math.sin(ph), nod: 2 * Math.sin(ph * 0.5) };
      pose.t = t;
      if (opts.expr) pose.expr = opts.expr;
      if (opts.talk) pose.talk = Math.max(0, Math.sin(t * 23) * 0.6 + Math.sin(t * 9.7) * 0.4) * opts.talk;
      const sy = TOP + HR + 4 - pose.bob + (pose.nod || 0) + HR - 4 + 10;
      const S = { L: [CW / 2 - 34, sy], R: [CW / 2 + 34, sy] };
      let gest = opts.gesture || (opts.hold ? 'hold' : walking ? 'walk' : 'idle');
      if (gest === 'walk') gest = [[-1e9, 'idle']];
      pose.G = resolveGesture(gest, t, S);
      if (walking && (opts.gesture === undefined)) { const a = Math.sin(ph) * 22; pose.G.L = [pose.G.L[0] + a, pose.G.L[1]]; pose.G.R = [pose.G.R[0] - a, pose.G.R[1]]; }
      if (opts.hold && !opts.gesture) { pose.G.prop = 'radio'; }
      if (opts.prop) { pose.G.prop = opts.prop; pose.G.propHand = opts.hand || 'R'; }
      drawPerson(g, person, pose); tex.needsUpdate = true;
      const wp = new THREE.Vector3(); group.getWorldPosition(wp);
      const yaw = Math.atan2(cam.x - wp.x, cam.z - wp.z) - (P.faceYaw || 0) - group.rotation.y;
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
export { resolveGesture, TOP, HR, CW, CH };
