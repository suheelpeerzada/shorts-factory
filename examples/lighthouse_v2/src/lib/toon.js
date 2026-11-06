// House style: flat painted colours, 3-band toon shading, one ink colour for every outline.
import * as THREE from 'three';

export const INK = '#351f22';
const INK_COLOR = new THREE.Color(INK);
const INK_SCALE = 1.9; // outline weight

// Seeded random numbers so every render is identical.
export function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let GRAD = null;
export function gradientMap() {
  if (GRAD) return GRAD;
  const d = new Uint8Array([110, 190, 255]); // shadow, mid, lit
  GRAD = new THREE.DataTexture(d, 3, 1, THREE.RedFormat);
  GRAD.minFilter = GRAD.magFilter = THREE.NearestFilter;
  GRAD.needsUpdate = true;
  return GRAD;
}

export function toon(color = '#ffffff', map = null, extra = {}) {
  return new THREE.MeshToonMaterial({ color, map, gradientMap: gradientMap(), ...extra });
}

// ---------- ink outline: inverted hull + edge lines ----------
function hullMaterial(thickness) {
  return new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { color: { value: INK_COLOR.clone() }, thickness: { value: thickness } }]),
    vertexShader: `
      #include <common>
      #include <fog_pars_vertex>
      uniform float thickness;
      void main() {
        vec3 p = position + normalize(normal) * thickness;
        vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }`,
    fragmentShader: `
      uniform vec3 color;
      #include <common>
      #include <fog_pars_fragment>
      void main() {
        gl_FragColor = vec4(color, 1.0);
        #include <colorspace_fragment>
        #include <fog_fragment>
      }`,
    side: THREE.BackSide,
    fog: true,
  });
}
const LINE_MAT = new THREE.LineBasicMaterial({ color: INK, fog: true });

export function ink(mesh, thickness = 0.035, { edges = true, angle = 32 } = {}) {
  const hull = new THREE.Mesh(mesh.geometry, hullMaterial(thickness * INK_SCALE));
  hull.castShadow = false; hull.receiveShadow = false;
  mesh.add(hull);
  if (edges) {
    const e = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry, angle), LINE_MAT);
    mesh.add(e);
  }
  return mesh;
}

// A toon mesh with ink and shadows, positioned.
export function part(geometry, material, pos = [0, 0, 0], { rot, outline = 0.035, edges = true, cast = true, receive = true } = {}) {
  const m = new THREE.Mesh(geometry, material);
  m.position.set(...pos);
  if (rot) m.rotation.set(...rot);
  m.castShadow = cast; m.receiveShadow = receive;
  if (outline) ink(m, outline, { edges });
  return m;
}

// ---------- painted textures with wear ----------
function hex(c) { return '#' + new THREE.Color(c).getHexString(); }
function shade(c, k) { const col = new THREE.Color(c); col.multiplyScalar(k); return '#' + col.getHexString(); }

export function paintTexture({ w = 512, h = 512, base = '#cccccc', kind = 'plain', seed = 1, repeat = [1, 1], wear = 1 } = {}) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); const r = rng(seed);
  g.fillStyle = hex(base); g.fillRect(0, 0, w, h);

  if (kind === 'planks') { // vertical boards
    const n = 10;
    for (let i = 0; i < n; i++) {
      const x = (i / n) * w;
      g.fillStyle = shade(base, 0.94 + r() * 0.1); g.fillRect(x, 0, w / n, h);
      g.fillStyle = shade(base, 0.62); g.fillRect(x, 0, 3, h);
    }
  } else if (kind === 'shingles') {
    const rows = 14, cols = 12, rh = h / rows, cw = w / cols;
    for (let y = 0; y < rows; y++) for (let x = -1; x < cols + 1; x++) {
      const ox = (y % 2) * cw * 0.5;
      g.fillStyle = shade(base, 0.85 + r() * 0.25);
      g.beginPath(); g.moveTo(x * cw + ox, y * rh); g.lineTo(x * cw + ox + cw, y * rh);
      g.lineTo(x * cw + ox + cw, y * rh + rh * 0.7); g.quadraticCurveTo(x * cw + ox + cw * 0.5, y * rh + rh * 1.15, x * cw + ox, y * rh + rh * 0.7);
      g.closePath(); g.fill();
      g.strokeStyle = shade(base, 0.55); g.lineWidth = 2; g.stroke();
    }
  } else if (kind === 'asphalt') {
    for (let i = 0; i < 2500; i++) { g.fillStyle = shade(base, 0.8 + r() * 0.4); g.fillRect(r() * w, r() * h, 2, 2); }
  } else if (kind === 'grass') {
    for (let i = 0; i < 1800; i++) { g.strokeStyle = shade(base, 0.75 + r() * 0.45); g.lineWidth = 2; const x = r() * w, y = r() * h; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 6, y - 6 - r() * 6); g.stroke(); }
  } else if (kind === 'hazard') {
    const s = h; for (let x = -s; x < w + s; x += s) { g.fillStyle = INK; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + s * 0.5, 0); g.lineTo(x + s * 0.5 - s, h); g.lineTo(x - s, h); g.closePath(); g.fill(); }
  } else if (kind === 'metal') {
    for (let i = 0; i < 40; i++) { g.fillStyle = shade(base, 0.9 + r() * 0.15); g.fillRect(0, r() * h, w, 1 + r() * 3); }
  }

  // wear: stains, chips, scratches
  for (let i = 0; i < 26 * wear; i++) {
    const x = r() * w, y = r() * h, rad = 10 + r() * 50;
    const gr = g.createRadialGradient(x, y, 0, x, y, rad);
    gr.addColorStop(0, 'rgba(53,31,34,0.16)'); gr.addColorStop(1, 'rgba(53,31,34,0)');
    g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
  for (let i = 0; i < 30 * wear; i++) {
    g.fillStyle = 'rgba(255,248,235,0.28)'; const x = r() * w, y = r() * h, s = 2 + r() * 5;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + s, y + s * 0.3); g.lineTo(x + s * 0.4, y + s); g.closePath(); g.fill();
  }
  for (let i = 0; i < 16 * wear; i++) {
    g.strokeStyle = 'rgba(53,31,34,0.22)'; g.lineWidth = 1; const x = r() * w, y = r() * h;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 40, y + (r() - 0.5) * 12); g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...repeat);
  t.anisotropy = 4;
  return t;
}

// Painted sign board texture (labels live inside the world).
export function signTexture(lines, { w = 1024, h = 440, bg = '#f4ead2', fg = INK, border = INK, sizes } = {}) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); const r = rng(7);
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 14; i++) { const x = r() * w, y = r() * h, rad = 20 + r() * 60; const gr = g.createRadialGradient(x, y, 0, x, y, rad); gr.addColorStop(0, 'rgba(53,31,34,0.10)'); gr.addColorStop(1, 'rgba(53,31,34,0)'); g.fillStyle = gr; g.fillRect(x - rad, y - rad, 2 * rad, 2 * rad); }
  g.strokeStyle = border; g.lineWidth = 22; g.strokeRect(24, 24, w - 48, h - 48);
  g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle';
  const n = lines.length;
  lines.forEach((ln, i) => {
    const size = sizes ? sizes[i] : (n === 1 ? 200 : 150);
    g.font = `900 ${size}px "Arial Black", "DejaVu Sans", sans-serif`;
    g.fillText(ln, w / 2, h * ((i + 0.5) / n) + (n === 1 ? 10 : 6));
  });
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}
