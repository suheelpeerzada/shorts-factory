// Shot 5 (17.37 - 22.10 s): town hall office, 2004. Map of Kiruna, "3 KM EAST" tag, arrow drawn on "east".
import * as THREE from 'three';
import { INK, toon, part, paintTexture, signTexture, rng } from '../lib/toon.js';
import { wall, standBoard } from '../lib/kit.js';
import { makePerson, PALETTES } from '../lib/char.js';
import { addLights } from '../Stage.jsx';
import { cameraPath } from '../lib/camera.js';
import { B } from '../times.js';

const ramp = (t, a, b) => THREE.MathUtils.clamp((t - a) / (b - a), 0, 1);
const ease = (x) => x * x * (3 - 2 * x);
const pop = (k) => (k <= 0 ? 0.0001 : 1 + 2.2 * Math.pow(k - 1, 3) + 1.2 * Math.pow(k - 1, 2));

function mapTexture() {
  const W = 1400, H = 860; const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'); const r = rng(77);
  g.fillStyle = '#efe4c8'; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 30; i++) { const x = r() * W, y = r() * H, rad = 30 + r() * 90; const gr = g.createRadialGradient(x, y, 0, x, y, rad); gr.addColorStop(0, 'rgba(53,31,34,0.07)'); gr.addColorStop(1, 'rgba(53,31,34,0)'); g.fillStyle = gr; g.fillRect(x - rad, y - rad, 2 * rad, 2 * rad); }
  // lake and the mine hill
  g.fillStyle = '#9fc0cf'; g.beginPath(); g.ellipse(220, 690, 170, 90, -0.3, 0, Math.PI * 2); g.fill(); g.strokeStyle = INK; g.lineWidth = 5; g.stroke();
  g.fillStyle = '#a7a0a8'; g.beginPath(); g.moveTo(40, 300); g.lineTo(200, 120); g.lineTo(330, 300); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = INK; g.font = '900 44px "Arial Black","DejaVu Sans",sans-serif'; g.fillText('MINE', 128, 270);
  // old town blocks (left) and new town blocks (right)
  const blocks = (cx, cy, col) => { for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) { g.fillStyle = col; const x = cx + i * 70 + (j % 2) * 12, y = cy + j * 66; g.fillRect(x, y, 56, 50); g.strokeStyle = INK; g.lineWidth = 4; g.strokeRect(x, y, 56, 50); } };
  blocks(360, 300, '#d98b6a'); blocks(950, 300, '#e6c46a');
  g.fillStyle = INK; g.font = '900 48px "Arial Black","DejaVu Sans",sans-serif';
  g.fillText('OLD CENTRE', 340, 560); g.fillText('NEW CENTRE', 920, 560);
  g.font = '900 86px "Arial Black","DejaVu Sans",sans-serif'; g.textAlign = 'center'; g.fillText('KIRUNA', W / 2, 120);
  // compass
  g.lineWidth = 5; g.beginPath(); g.arc(W - 120, 720, 70, 0, Math.PI * 2); g.stroke(); g.font = '900 40px sans-serif'; g.fillText('N', W - 120, 640); g.fillText('E', W - 30, 735);
  g.strokeStyle = INK; g.lineWidth = 26; g.strokeRect(13, 13, W - 26, H - 26);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}

export function buildOffice(scene) {
  addLights(scene, { center: [0, 1, -1], key: [-9, 11, 9], size: 9, keyI: 2.2, hemiI: 1.25, fog: null });
  const root = new THREE.Group();
  // floor, back wall with window (sky behind), side wall
  root.add(part(new THREE.BoxGeometry(14, 0.2, 12), toon('#ffffff', paintTexture({ base: '#a77a52', kind: 'planks', seed: 5, repeat: [1.2, 0.6] })), [0, -0.1, 0], { outline: 0.02 }));
  const bw = wall({ w: 14, h: 5.2, t: 0.25, windows: [{ x: -4.7, y: 1.0, w: 1.9, h: 2.4 }], base: '#c9d6c3', texKind: 'plain', seed: 6, interior: '#bcd4e6' });
  bw.position.set(0, 0, -4.3); root.add(bw);
  const sw = wall({ w: 12, h: 5.2, t: 0.25, base: '#b9c8b2', texKind: 'plain', seed: 7 }); sw.rotation.y = Math.PI / 2; sw.position.set(-7, 0, 1.7); root.add(sw);
  root.add(part(new THREE.BoxGeometry(14, 0.35, 0.12), toon('#8d6a4a'), [0, 0.17, -4.0], { outline: 0.012 })); // skirting
  root.add(part(new THREE.BoxGeometry(14.4, 0.3, 12.4), toon('#ece5d3'), [0, 5.35, 1.7], { outline: 0.02 })); // ceiling
  root.add(part(new THREE.BoxGeometry(14, 0.25, 0.2), toon('#8d6a4a'), [0, 5.1, -4.05], { outline: 0.012 }));

  // wall map with frame
  const map = new THREE.Group(); map.position.set(0.9, 2.95, -3.98);
  map.add(part(new THREE.BoxGeometry(4.5, 2.9, 0.1), toon('#6b4a32'), [0, 0, 0], { outline: 0.02 }));
  const face = new THREE.Mesh(new THREE.PlaneGeometry(4.3, 2.64), new THREE.MeshToonMaterial({ map: mapTexture() })); face.position.z = 0.06; map.add(face);
  // arrow from old centre to new centre: shaft grows, head pops at the end
  const arrowMat = new THREE.MeshBasicMaterial({ color: '#c9452f' });
  const shaft = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.11), arrowMat); map.add(shaft);
  const hs = new THREE.Shape(); hs.moveTo(0, 0.17); hs.lineTo(0.3, 0); hs.lineTo(0, -0.17); hs.closePath();
  const head = new THREE.Mesh(new THREE.ShapeGeometry(hs), arrowMat); map.add(head);
  const AX0 = -0.75, AX1 = 0.95, AY = 0.05;
  // "3 KM EAST" tag pinned on the map
  const tag = new THREE.Group(); tag.position.set(0.12, 0.45, 0.1);
  tag.add(part(new THREE.BoxGeometry(1.25, 0.42, 0.03), toon('#c9452f'), [0, 0, 0], { outline: 0.012 }));
  const tf = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.38), new THREE.MeshBasicMaterial({ map: signTexture(['3 KM EAST'], { w: 760, h: 240, bg: '#c9452f', fg: '#f4ead2', border: '#f4ead2', sizes: [120] }) }));
  tf.position.z = 0.02; tag.add(tf); tag.add(part(new THREE.SphereGeometry(0.05, 8, 6), toon('#e1ad35'), [0, 0.2, 0.03], { outline: 0.006, edges: false })); map.add(tag);
  root.add(map);

  // desk with nameplate, desk calendar "2004", papers, lamp
  const desk = new THREE.Group(); desk.position.set(-0.2, 0, 0.2);
  const wood = toon('#ffffff', paintTexture({ base: '#7a4f36', kind: 'planks', seed: 9, repeat: [0.8, 0.8] }));
  desk.add(part(new THREE.BoxGeometry(3.2, 0.12, 1.4), wood, [0, 0.82, 0], { outline: 0.02 }));
  desk.add(part(new THREE.BoxGeometry(3.1, 0.7, 0.08), wood, [0, 0.42, 0.62], { outline: 0.015 }));
  for (const x of [-1.5, 1.5]) desk.add(part(new THREE.BoxGeometry(0.12, 0.8, 1.3), wood, [x, 0.4, 0], { outline: 0.015 }));
  const np = standBoard(['TOWN HALL'], { w: 0.9, h: 0.22, legs: 0, sizes: [130], bg: '#2f4a43', fg: '#f4ead2' }); np.group.position.set(0.55, 0.88, 0.55); desk.add(np.group);
  const cal = new THREE.Group(); cal.position.set(-0.75, 0.88, 0.32); cal.rotation.y = 0.25;
  cal.add(part(new THREE.BoxGeometry(0.46, 0.4, 0.04), toon('#f4ead2'), [0, 0.2, 0], { rot: [-0.25, 0, 0], outline: 0.008 }));
  const cf = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.36), new THREE.MeshBasicMaterial({ map: signTexture(['2004'], { w: 420, h: 360, bg: '#f4ead2', fg: INK, border: '#c9452f', sizes: [150] }) }));
  cf.position.set(0, 0.2, 0.025); cf.rotation.x = -0.25; cal.add(cf); desk.add(cal);
  for (let i = 0; i < 3; i++) desk.add(part(new THREE.BoxGeometry(0.42, 0.01, 0.3), toon('#fbf6ea'), [0.0 + i * 0.05, 0.89 + i * 0.012, 0.05 - i * 0.04], { rot: [0, 0.2 * i, 0], outline: 0.004, edges: false }));
  desk.add(part(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 8), toon('#2f4a43'), [-1.3, 1.12, -0.42], { outline: 0.006, edges: false }));
  desk.add(part(new THREE.ConeGeometry(0.18, 0.22, 12, 1, true), toon('#e1ad35', null, { side: THREE.DoubleSide }), [-1.3, 1.38, -0.42], { outline: 0.008, edges: false }));
  root.add(desk);
  // two officials behind the desk
  const a = makePerson({ ...PALETTES[0], seed: 401, phase: 0.3, hat: 'none' }); a.group.position.set(-1.25, 0, -1.25); root.add(a.group);
  const b = makePerson({ ...PALETTES[2], seed: 402, phase: 2.1 }); b.group.position.set(1.35, 0, -1.45); root.add(b.group);
  // a chair and a plant
  root.add(part(new THREE.BoxGeometry(0.6, 0.08, 0.6), toon('#3f6f8f'), [-1.3, 0.5, -0.55], { outline: 0.012 }));
  const pot = part(new THREE.CylinderGeometry(0.28, 0.22, 0.5, 12), toon('#c9452f'), [-5.6, 0.25, -3.3], { outline: 0.012, edges: false }); root.add(pot);
  for (let i = 0; i < 6; i++) root.add(part(new THREE.SphereGeometry(0.32, 10, 8), toon('#6f8f5a'), [-5.6 + Math.cos(i) * 0.25, 0.75 + (i % 3) * 0.2, -3.3 + Math.sin(i) * 0.25], { outline: 0.012, edges: false }));

  return {
    root,
    update(t, camera) {
      a.update(t, camera.position, 0); b.update(t, camera.position, 0);
      tag.scale.setScalar(pop(ramp(t, B.three - 0.05, B.three + 0.25)));
      const k = ease(ramp(t, B.move + 0.2, B.east + 0.05));
      const x1 = THREE.MathUtils.lerp(AX0 + 0.02, AX1, k);
      shaft.visible = k > 0.01; shaft.scale.x = Math.max(0.01, x1 - AX0); shaft.position.set((AX0 + x1) / 2, AY, 0.08);
      head.visible = k > 0.01; head.position.set(x1 - 0.02, AY, 0.085);
    },
  };
}

// calendar "2004" close -> rise and pull back over the officials -> push into the map as the tag and arrow appear
export const officeCam = cameraPath([
  { t: 17.37, pos: [-0.55, 1.28, 2.25], look: [-0.85, 0.98, 0.45] },
  { t: B.y2004 + 0.35, pos: [-0.45, 1.36, 2.05], look: [-0.9, 1.0, 0.45] },
  { t: B.move, pos: [0.0, 2.1, 4.2], look: [0.5, 2.2, -2.6] },
  { t: B.three, pos: [0.6, 2.75, 2.7], look: [0.85, 2.9, -3.9] },
  { t: B.east + 0.3, pos: [0.85, 2.95, 1.75], look: [0.9, 2.95, -3.9] },
]);
